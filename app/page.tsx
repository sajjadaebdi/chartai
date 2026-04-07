"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import CameraCapture from "@/components/CameraCapture";
import Image from "next/image";

type Analysis = {
  trend: string;
  structure: string;
  liquidity: string;
  order_blocks: string;
  fvg: string;
  indicators: string;
  prediction: string;
  confidence: string;
  entry: string;
  exit: string;
  stop_loss: string;
  risk_reward: string;
  news: string;
  summary: string;
  disclaimer: string;
};

type HistoryItem = {
  id: string;
  createdAt: string;
  symbol: string;
  imageName: string;
  analysis: Analysis;
};

const HISTORY_KEY = "stock-analyzer-v2-history";
const MAX_HISTORY = 20;

function parseConfidence(value: string): number {
  const match = value?.match(/(\d{1,3})/);
  if (!match) return 0;
  const num = Number.parseInt(match[1], 10);
  if (Number.isNaN(num)) return 0;
  return Math.min(100, Math.max(0, num));
}

function trendStyles(trend: string): string {
  const value = trend.toLowerCase();
  if (value.includes("bull")) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (value.includes("bear")) return "bg-rose-50 text-rose-700 border-rose-200";
  return "bg-amber-50 text-amber-700 border-amber-200";
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
      <h3 className="mb-3 text-sm font-semibold tracking-wide text-slate-500">{title}</h3>
      <div className="text-sm leading-6 text-slate-700">{children}</div>
    </section>
  );
}

export default function Home() {
  const [symbol, setSymbol] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [activeAnalysis, setActiveAnalysis] = useState<Analysis | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as HistoryItem[];
      if (!Array.isArray(parsed)) return;
      setHistory(parsed);
    } catch {
      localStorage.removeItem(HISTORY_KEY);
    }
  }, []);

  const confidenceValue = useMemo(
    () => parseConfidence(activeAnalysis?.confidence ?? ""),
    [activeAnalysis]
  );

  function persistHistory(nextHistory: HistoryItem[]) {
    setHistory(nextHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
  }

  function handleSelectImage(file?: File | null) {
    if (!file) return;
    const validImage = file.type.startsWith("image/");
    if (!validImage) {
      setError("Only image files are supported.");
      return;
    }
    setError("");
    setImage(file);
    const preview = URL.createObjectURL(file);
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return preview;
    });
  }

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result !== "string") {
          reject(new Error("Failed to read image."));
          return;
        }
        const base64 = result.split(",")[1];
        if (!base64) {
          reject(new Error("Invalid image encoding."));
          return;
        }
        resolve(base64);
      };
      reader.onerror = () => reject(new Error("Unable to load image."));
      reader.readAsDataURL(file);
    });
  }

  async function onAnalyze() {
    if (!image) {
      setError("Please upload a chart image first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const imageBase64 = await fileToBase64(image);
      const payload = {
        symbol: symbol.trim(),
        imageBase64,
        mimeType: image.type || "image/png",
      };

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok || !data?.success || !data?.analysis) {
        throw new Error(data?.error || "Analysis failed. Please try again.");
      }

      const analysis = data.analysis as Analysis;
      setActiveAnalysis(analysis);

      const entry: HistoryItem = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        symbol: symbol.trim(),
        imageName: image.name || "uploaded-chart",
        analysis,
      };

      const nextHistory = [entry, ...history].slice(0, MAX_HISTORY);
      persistHistory(nextHistory);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error occurred.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex w-full max-w-[1600px] gap-6 px-4 py-6 md:px-6">
        <aside className="hidden w-80 shrink-0 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)] lg:block">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Stock Analyzer</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">AI Trading Desk</h2>
            <p className="mt-2 text-sm text-slate-500">Premium multi-factor chart analysis for equities and crypto.</p>
          </div>

          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-600">History</h3>
            {history.length > 0 ? (
              <button
                onClick={() => persistHistory([])}
                className="text-xs font-medium text-slate-500 hover:text-slate-800"
                type="button"
              >
                Clear
              </button>
            ) : null}
          </div>

          <div className="space-y-3">
            {history.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 p-3 text-sm text-slate-500">
                No analyses yet. Upload a chart to begin.
              </p>
            ) : (
              history.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveAnalysis(item.analysis)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-left hover:border-slate-300 hover:bg-white"
                >
                  <p className="truncate text-sm font-semibold text-slate-700">
                    {item.symbol || "Unknown Symbol"} - {item.analysis.trend || "No trend"}
                  </p>
                  <p className="truncate text-xs text-slate-500">{item.imageName}</p>
                  <p className="mt-1 text-xs text-slate-400">{new Date(item.createdAt).toLocaleString()}</p>
                </button>
              ))
            )}
          </div>
        </aside>

        <main className="flex-1">
          <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">AI Chart Analyzer</h1>
            <p className="mt-2 text-sm text-slate-500">
              Upload any chart screenshot, run multimodal analysis, and generate a probability-based trade setup.
            </p>
          </header>

          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
            <div className="grid gap-6 lg:grid-cols-3">
              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragActive(false);
                  handleSelectImage(event.dataTransfer.files?.[0]);
                }}
                className={`rounded-2xl border-2 border-dashed p-8 text-center transition ${
                  dragActive ? "border-blue-400 bg-blue-50" : "border-slate-300 bg-slate-50"
                }`}
              >
                <p className="text-base font-medium text-slate-700">Drag and drop chart image</p>
                <p className="mt-1 text-sm text-slate-500">PNG, JPG, WEBP supported</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                >
                  Upload chart
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => handleSelectImage(event.target.files?.[0])}
                />
                <p className="mt-3 text-xs text-slate-400">
                  {image ? `Selected: ${image.name}` : "No file selected"}
                </p>

                {imagePreview ? (
                  <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                    <Image
                      src={imagePreview}
                      alt="Selected chart preview"
                      width={768}
                      height={352}
                      className="h-44 w-full object-cover"
                    />
                  </div>
                ) : null}
              </div>

              <div className="space-y-4">
                <CameraCapture
                  onCapture={(file) => {
                    handleSelectImage(file);
                  }}
                  onError={(message) => setError(message)}
                />
                <p className="text-xs text-slate-500">
                  Use Camera for real-time chart snapshots on mobile or desktop.
                </p>
              </div>

              <div className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-600">Optional symbol</span>
                  <input
                    value={symbol}
                    onChange={(event) => setSymbol(event.target.value)}
                    placeholder="AAPL, NVDA, BTC-USD..."
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none ring-blue-200 transition focus:border-blue-400 focus:ring-4"
                  />
                </label>

                <button
                  type="button"
                  onClick={onAnalyze}
                  disabled={loading}
                  className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  {loading ? "Analyzing chart..." : "Analyze with AI"}
                </button>

                {error ? (
                  <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>
                ) : null}
              </div>
            </div>
          </section>

          {activeAnalysis ? (
            <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <Card title="📈 Trend">
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${trendStyles(
                    activeAnalysis.trend
                  )}`}
                >
                  {activeAnalysis.trend || "N/A"}
                </span>
              </Card>

              <Card title="🎯 Entry / Exit / Stop Loss">
                <p><strong>Entry:</strong> {activeAnalysis.entry || "N/A"}</p>
                <p><strong>Exit:</strong> {activeAnalysis.exit || "N/A"}</p>
                <p><strong>Stop Loss:</strong> {activeAnalysis.stop_loss || "N/A"}</p>
                <p><strong>Risk / Reward:</strong> {activeAnalysis.risk_reward || "N/A"}</p>
              </Card>

              <Card title="📊 Confidence">
                <p className="mb-3 text-sm font-semibold text-slate-700">{activeAnalysis.confidence || "N/A"}</p>
                <div className="h-3 w-full rounded-full bg-slate-200">
                  <div
                    className="h-3 rounded-full bg-blue-600 transition-all"
                    style={{ width: `${confidenceValue}%` }}
                  />
                </div>
              </Card>

              <Card title="🧠 Market Structure">{activeAnalysis.structure || "N/A"}</Card>
              <Card title="💧 Liquidity Zones">{activeAnalysis.liquidity || "N/A"}</Card>
              <Card title="🧱 Order Blocks">{activeAnalysis.order_blocks || "N/A"}</Card>
              <Card title="⚡ Fair Value Gaps">{activeAnalysis.fvg || "N/A"}</Card>
              <Card title="📉 Indicators">{activeAnalysis.indicators || "N/A"}</Card>
              <Card title="📰 News">{activeAnalysis.news || "N/A"}</Card>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] md:col-span-2 xl:col-span-3">
                <h3 className="mb-3 text-sm font-semibold tracking-wide text-slate-500">📌 Prediction Summary</h3>
                <p className="text-sm leading-7 text-slate-700">{activeAnalysis.prediction || "N/A"}</p>
                <p className="mt-3 border-t border-slate-100 pt-3 text-sm leading-7 text-slate-700">{activeAnalysis.summary || "N/A"}</p>
              </section>

              <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] md:col-span-2 xl:col-span-3">
                <h3 className="mb-2 text-sm font-semibold tracking-wide text-amber-800">⚠️ Disclaimer</h3>
                <p className="text-sm leading-7 text-amber-700">{activeAnalysis.disclaimer || "N/A"}</p>
              </section>
            </section>
          ) : (
            <section className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
              Analysis results will appear here once you upload and analyze a chart.
            </section>
          )}
        </main>
      </div>
    </div>
  );
}