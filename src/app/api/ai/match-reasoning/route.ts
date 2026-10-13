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
      const prompt = `You are an elite matchmaker at The Date Crew (TDC), an Indian matchmaking agency.
Analyze this potential match between:
Client: ${customer.firstName} ${customer.lastName} (${customer.age}yo, ${customer.gender}, ${customer.city}, ${customer.designation} at ${customer.currentCompany}, Income: ₹${customer.annualIncomeLPA} LPA, Diet: ${customer.diet}, Kids: ${customer.wantKids}, Relocation: ${customer.openToRelocate})
Candidate: ${candidate.firstName} ${candidate.lastName} (${candidate.age}yo, ${candidate.gender}, ${candidate.city}, ${candidate.designation} at ${candidate.currentCompany}, Income: ₹${candidate.annualIncomeLPA} LPA, Diet: ${candidate.diet}, Kids: ${candidate.wantKids}, Relocation: ${candidate.openToRelocate})

Provide a concise, 2-to-3 sentence executive matchmaker assessment explaining:
1. Primary synergy/compatibility factors.
2. Any subtle friction points to be aware of.
Keep the tone warm, sharp, and professional.`;

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
          max_tokens: 200,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const reasoning = data.choices?.[0]?.message?.content?.trim();
        return NextResponse.json({ reasoning });
      }
    }

    // Dynamic rule-based fallback when OPENAI_API_KEY is not configured
    const sharedCity = customer.city === candidate.city ? `both residing in ${customer.city}` : `navigating cross-city synergy between ${customer.city} and ${candidate.city}`;
    const dietHarmony = customer.diet === candidate.diet ? `identical dietary preferences (${customer.diet})` : `distinct dietary styles`;
    const kidsAlignment = customer.wantKids === candidate.wantKids ? `unified outlook on raising children (${customer.wantKids})` : `differing viewpoints on family planning`;

    const fallbackReasoning = `Strong alignment noted with ${sharedCity} alongside ${dietHarmony}. Both candidates demonstrate high professional pedigree (${customer.designation} & ${candidate.designation}) and ${kidsAlignment}, making this a high-potential pairing.`;

    return NextResponse.json({ reasoning: fallbackReasoning });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}