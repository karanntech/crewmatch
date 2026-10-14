import { NextResponse } from "next/server";
import { Customer, Biodata } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const { customer, candidate }: { customer: Customer; candidate: Biodata } =
      await req.json();

    if (!customer || !candidate) {
      return NextResponse.json(
        { error: "Missing customer or candidate data" },
        { status: 400 },
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey) {
      const prompt = `You are an elite matchmaker at The Date Crew (TDC), an Indian matchmaking agency.
Generate two intro pitches for client ${customer.firstName} proposing candidate ${candidate.firstName} ${candidate.lastName} (${candidate.age}yo, ${candidate.city}, ${candidate.designation} at ${candidate.currentCompany}, Education: ${candidate.undergradCollege}, Income: ₹${candidate.annualIncomeLPA} LPA, Diet: ${candidate.diet}, Kids: ${candidate.wantKids}, Relocation: ${candidate.openToRelocate}).

Return ONLY a valid JSON object matching this schema:
{
  "emailPitch": "A warm, polished 3-paragraph executive introduction email blurb under 120 words.",
  "whatsAppPitch": "A punchy, emoji-accented WhatsApp message under 60 words designed for instant mobile messaging."
}`;

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
            temperature: 0.7,
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}");
        return NextResponse.json({
          emailPitch: parsed.emailPitch,
          whatsAppPitch: parsed.whatsAppPitch,
        });
      }
    }

    // Dynamic Fallback
    const fallbackEmail = `Hi ${customer.firstName},

I came across a promising profile I'd love to share with you: meet ${candidate.firstName}, a ${candidate.age}-year-old ${candidate.designation} at ${candidate.currentCompany} based in ${candidate.city}.

Beyond impressive professional credentials (${candidate.undergradCollege}), you both share aligned values regarding family lifestyle, dietary preferences (${candidate.diet}), and long-term goals.

Take a moment to review the attached biodata, and let me know if you would like me to set up an introductory call!

Warm regards,
Your TDC Matchmaker`;

    const fallbackWhatsApp = `Hi ${customer.firstName}! ✨ Found a curated profile you'll love: ${candidate.firstName} (${candidate.age} yrs, ${candidate.city}). Leading ${candidate.designation} at ${candidate.currentCompany} (${candidate.undergradCollege} alum). Shares your values & lifestyle outlook. Review biodata here! 💫`;

    return NextResponse.json({
      emailPitch: fallbackEmail,
      whatsAppPitch: fallbackWhatsApp,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
