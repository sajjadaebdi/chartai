import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(req) {
  try {
    // 📥 Get uploaded image
    const formData = await req.formData();
    const image = formData.get("image");

    if (!image) {
      return Response.json({
        success: false,
        error: "No image uploaded",
      });
    }

    // 🔄 Convert image to base64
    const bytes = await image.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    // 🤖 AI Vision Analysis (FREE MODEL ROUTER)
    const response = await openai.chat.completions.create({
      model: "openrouter/free", // ✅ FREE + IMAGE SUPPORT
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `
You are a professional trading analyst.

Analyze this trading chart image and return STRICT FORMAT:

ENTRY PRICE:
EXIT PRICE:
CONFIDENCE (%):
TREND (UP / DOWN / SIDEWAYS):

REASON:
- Technical analysis
- Patterns visible

NEWS IMPACT:
- Possible macro/news impact

DETAILS:
- Support/resistance
- Momentum

DISCLAIMER:
This is AI-generated analysis, not financial advice.
`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${base64}`,
              },
            },
          ],
        },
      ],
    });

    // ✅ Safe response handling
    const result =
      response.choices?.[0]?.message?.content ||
      "No analysis generated";

    return Response.json({
      success: true,
      analysis: result,
    });

  } catch (err) {
    console.error("IMAGE API ERROR:", err);

    return Response.json({
      success: false,
      error: err.message || "Something went wrong",
    });
  }
}