import OpenAI from "openai";
import YahooFinance from "yahoo-finance2";
import { NextResponse } from "next/server";

const yahooFinance = new YahooFinance();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const REQUIRED_KEYS = [
  "trend",
  "structure",
  "liquidity",
  "order_blocks",
  "fvg",
  "indicators",
  "prediction",
  "confidence",
  "entry",
  "exit",
  "stop_loss",
  "risk_reward",
  "news",
  "summary",
  "disclaimer",
];

function emptyAnalysis() {
  return {
    trend: "",
    structure: "",
    liquidity: "",
    order_blocks: "",
    fvg: "",
    indicators: "",
    prediction: "",
    confidence: "",
    entry: "",
    exit: "",
    stop_loss: "",
    risk_reward: "",
    news: "",
    summary: "",
    disclaimer: "",
  };
}

function normalizeAnalysis(raw) {
  const base = emptyAnalysis();
  if (!raw || typeof raw !== "object") return base;

  for (const key of REQUIRED_KEYS) {
    const value = raw[key];
    base[key] = typeof value === "string" ? value.trim() : "";
  }
  return base;
}

function safeJsonParse(text) {
  if (!text || typeof text !== "string") return null;

  try {
    return JSON.parse(text);
  } catch {
    // If model wraps JSON with extra text, extract the first object block safely.
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace < 0 || lastBrace <= firstBrace) return null;
    const sliced = text.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(sliced);
    } catch {
      return null;
    }
  }
}

async function getSymbolContext(symbol) {
  const cleanSymbol = typeof symbol === "string" ? symbol.trim().toUpperCase() : "";
  if (!cleanSymbol) return null;

  try {
    const quote = await yahooFinance.quote(cleanSymbol);
    return {
      symbol: cleanSymbol,
      shortName: quote?.shortName || "",
      regularMarketPrice: quote?.regularMarketPrice ?? null,
      regularMarketChangePercent: quote?.regularMarketChangePercent ?? null,
      regularMarketDayHigh: quote?.regularMarketDayHigh ?? null,
      regularMarketDayLow: quote?.regularMarketDayLow ?? null,
      fiftyTwoWeekHigh: quote?.fiftyTwoWeekHigh ?? null,
      fiftyTwoWeekLow: quote?.fiftyTwoWeekLow ?? null,
      averageDailyVolume3Month: quote?.averageDailyVolume3Month ?? null,
      marketCap: quote?.marketCap ?? null,
      currency: quote?.currency || "",
      exchange: quote?.fullExchangeName || "",
    };
  } catch {
    return { symbol: cleanSymbol, error: "Symbol data unavailable from market feed." };
  }
}

export async function POST(req) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: "Server misconfigured: missing OPENAI_API_KEY." },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ success: false, error: "Invalid JSON body." }, { status: 400 });
    }

    const { imageBase64, mimeType, symbol } = body;
    if (!imageBase64 || typeof imageBase64 !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing chart image payload." },
        { status: 400 }
      );
    }

    const imageSizeBytes = Buffer.byteLength(imageBase64, "base64");
    const maxSizeBytes = 7 * 1024 * 1024;
    if (Number.isNaN(imageSizeBytes) || imageSizeBytes <= 0 || imageSizeBytes > maxSizeBytes) {
      return NextResponse.json(
        { success: false, error: "Image is invalid or too large (max 7MB)." },
        { status: 400 }
      );
    }

    const safeMime = typeof mimeType === "string" && mimeType.startsWith("image/") ? mimeType : "image/png";
    const symbolContext = await getSymbolContext(symbol);

    const instructions = [
      "You are a senior institutional trading analyst.",
      "Analyze the uploaded chart image using visual price action interpretation and market-structure reasoning.",
      "If symbol context is available, include likely indicator interpretation and potential news impact.",
      "Return ONLY strict JSON with exactly these keys:",
      JSON.stringify(emptyAnalysis(), null, 2),
      "Rules:",
      "- Keep each field concise but useful.",
      "- confidence should be a human-readable percentage string (e.g. '74%').",
      "- Include realistic entry, exit, stop_loss and risk_reward.",
      "- disclaimer must clearly state this is not financial advice.",
    ].join("\n");

    const aiRes = await openai.chat.completions.create({
      model: "openrouter/auto",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: instructions,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Symbol context: ${JSON.stringify(symbolContext || { symbol: "unknown" })}`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${safeMime};base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
    });

    const content = aiRes?.choices?.[0]?.message?.content ?? "";
    const parsed = safeJsonParse(content);
    const analysis = normalizeAnalysis(parsed);

    const hasAnySignal = Object.values(analysis).some((v) => typeof v === "string" && v.length > 0);
    if (!hasAnySignal) {
      return NextResponse.json(
        {
          success: false,
          error: "Model did not return valid analysis JSON. Please retry with a clearer chart image.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, analysis });
  } catch (err) {
    console.error("ANALYZE_API_ERROR", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unexpected server error.",
      },
      { status: 500 }
    );
  }
}