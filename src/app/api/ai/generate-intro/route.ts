import { NextResponse } from "next/server";
import { Customer, Biodata } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const { customer, candidate }: { customer: Customer; candidate: Biodata } = await req.json();

    if (!customer || !candidate) {
      return NextResponse.json({ error: "Missing customer or candidate data" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey) {
      const prompt = `You are a matchmaker at The Date Crew (TDC).
Draft a concise, tailored match introduction email blurb to send to ${customer.firstName}.
Present the prospective partner ${candidate.firstName} (${candidate.age}yo, based in ${candidate.city}, ${candidate.designation} at ${candidate.currentCompany}).
Highlight shared lifestyle values (Kids: ${candidate.wantKids}, Diet: ${candidate.diet}, Relocation: ${candidate.openToRelocate}) and common ground.
Keep it under 100 words, warm, discreet, and enthusiastic. End with an invitation to review the full biodata.`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 220,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const introText = data.choices?.[0]?.message?.content?.trim();
        return NextResponse.json({ introText });
      }
    }

    // Dynamic fallback email blurb
    const fallbackIntro = `Hi ${customer.firstName},

I came across a promising profile I'd love to share with you: meet ${candidate.firstName}, a ${candidate.age}-year-old ${candidate.designation} at ${candidate.currentCompany} based in ${candidate.city}.

Beyond impressive professional credentials (${candidate.undergradCollege}), you both share aligned values regarding family lifestyle and life goals. Take a moment to review the attached biodata, and let me know if you would like me to set up an introductory call!

Warm regards,
Your TDC Matchmaker`;

    return NextResponse.json({ introText: fallbackIntro });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}