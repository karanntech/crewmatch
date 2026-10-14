import { Biodata, Customer, MatchRecommendation } from "./types";

export interface DealbreakerFlag {
  type: "diet" | "relocation" | "kids" | "manglik" | "age";
  severity: "critical" | "warning";
  label: string;
}

interface ScoreResult {
  score: number;
  breakdown: {
    ageHeightFit: number;
    careerIncomeFit: number;
    valuesFit: number;
    culturalLifestyleFit: number;
  };
  reasons: string[];
  potentialConcerns: string[];
  dealbreakers: DealbreakerFlag[];
}

/**
 * Detects non-negotiable Indian matrimonial friction points
 */
export function detectDealbreakers(customer: Customer, candidate: Biodata): DealbreakerFlag[] {
  const flags: DealbreakerFlag[] = [];

  // 1. Kids Incompatibility
  if (
    (customer.wantKids === "Yes" && candidate.wantKids === "No") ||
    (customer.wantKids === "No" && candidate.wantKids === "Yes")
  ) {
    flags.push({
      type: "kids",
      severity: "critical",
      label: "Family Planning Deadlock: Opposing views on children",
    });
  }

  // 2. Relocation Stalemate (Different cities & neither will move)
  if (
    customer.city.toLowerCase() !== candidate.city.toLowerCase() &&
    customer.openToRelocate === "No" &&
    candidate.openToRelocate === "No"
  ) {
    flags.push({
      type: "relocation",
      severity: "critical",
      label: `Relocation Stalemate: Neither open to moving from ${customer.city} / ${candidate.city}`,
    });
  }

  // 3. Strict Diet Disconnect
  if (
    (customer.diet === "Jain" || customer.diet === "Vegetarian") &&
    candidate.diet === "Non-Vegetarian"
  ) {
    flags.push({
      type: "diet",
      severity: "warning",
      label: `Dietary Divergence: ${customer.diet} vs Non-Vegetarian`,
    });
  }

  // 4. Manglik Dosh Incompatibility
  if (
    customer.manglikStatus === "Manglik" &&
    candidate.manglikStatus === "Non-Manglik"
  ) {
    flags.push({
      type: "manglik",
      severity: "warning",
      label: "Kundali Notice: Manglik & Non-Manglik pairing",
    });
  }

  return flags;
}

function scoreForMaleCustomer(customer: Customer, candidate: Biodata): ScoreResult {
  let ageHeightFit = 0;
  let careerIncomeFit = 0;
  let valuesFit = 0;
  let culturalLifestyleFit = 0;

  const reasons: string[] = [];
  const potentialConcerns: string[] = [];

  // Age: Younger preferred
  const ageDiff = customer.age - candidate.age;
  if (ageDiff >= 1 && ageDiff <= 5) {
    ageHeightFit += 15;
    reasons.push(`Optimal age gap: Candidate is ${ageDiff} yrs younger`);
  } else if (ageDiff > 5) {
    ageHeightFit += 10;
    reasons.push(`Candidate is ${ageDiff} yrs younger`);
  } else if (ageDiff === 0) {
    ageHeightFit += 8;
  } else {
    ageHeightFit += 2;
    potentialConcerns.push(`Candidate is ${Math.abs(ageDiff)} yrs older`);
  }

  // Height: Shorter preferred
  const heightDiff = customer.heightCm - candidate.heightCm;
  if (heightDiff >= 5 && heightDiff <= 18) {
    ageHeightFit += 15;
    reasons.push(`Complementary height (${candidate.heightFormatted} vs ${customer.heightFormatted})`);
  } else if (heightDiff > 0) {
    ageHeightFit += 10;
  } else {
    ageHeightFit += 3;
    potentialConcerns.push(`Candidate is taller/equal height (${candidate.heightFormatted})`);
  }

  // Income: Candidate earns less preferred
  if (candidate.annualIncomeLPA < customer.annualIncomeLPA) {
    careerIncomeFit += 25;
    reasons.push(`Traditional income alignment (₹${candidate.annualIncomeLPA}L vs ₹${customer.annualIncomeLPA}L)`);
  } else if (candidate.annualIncomeLPA === customer.annualIncomeLPA) {
    careerIncomeFit += 15;
    reasons.push("Equal income peer");
  } else {
    careerIncomeFit += 8;
    potentialConcerns.push(`Candidate has higher income (₹${candidate.annualIncomeLPA} LPA)`);
  }

  // Children
  if (customer.wantKids === candidate.wantKids) {
    valuesFit += 15;
    reasons.push(`Mutual alignment on kids ("${customer.wantKids}")`);
  } else if (customer.wantKids === "Maybe" || candidate.wantKids === "Maybe") {
    valuesFit += 8;
  } else {
    potentialConcerns.push("Differing family planning views");
  }

  if (customer.openToPets === candidate.openToPets) valuesFit += 5;
  if (customer.openToRelocate === candidate.openToRelocate || candidate.openToRelocate === "Yes") valuesFit += 5;

  // Cultural & Location
  if (customer.city === candidate.city) {
    culturalLifestyleFit += 10;
    reasons.push(`Both based in ${customer.city}`);
  } else {
    culturalLifestyleFit += 4;
    potentialConcerns.push(`Different cities (${customer.city} vs ${candidate.city})`);
  }

  if (customer.diet === candidate.diet) {
    culturalLifestyleFit += 5;
    reasons.push(`Shared diet: ${customer.diet}`);
  }

  if (customer.religion === candidate.religion) culturalLifestyleFit += 5;

  const dealbreakers = detectDealbreakers(customer, candidate);
  const criticalDeduction = dealbreakers.filter((d) => d.severity === "critical").length * 20;

  const rawScore = ageHeightFit + careerIncomeFit + valuesFit + culturalLifestyleFit;
  const totalScore = Math.max(10, Math.min(100, rawScore - criticalDeduction));

  return {
    score: totalScore,
    breakdown: { ageHeightFit, careerIncomeFit, valuesFit, culturalLifestyleFit },
    reasons,
    potentialConcerns,
    dealbreakers,
  };
}

function scoreForFemaleCustomer(customer: Customer, candidate: Biodata): ScoreResult {
  let ageHeightFit = 0;
  let careerIncomeFit = 0;
  let valuesFit = 0;
  let culturalLifestyleFit = 0;

  const reasons: string[] = [];
  const potentialConcerns: string[] = [];

  // Career & Income Parity
  if (candidate.annualIncomeLPA >= customer.annualIncomeLPA) {
    careerIncomeFit += 15;
    reasons.push(`Strong career parity (₹${candidate.annualIncomeLPA}L in ${candidate.designation})`);
  } else if (candidate.annualIncomeLPA >= customer.annualIncomeLPA * 0.8) {
    careerIncomeFit += 10;
    reasons.push("Comparable income bracket");
  } else {
    careerIncomeFit += 5;
    potentialConcerns.push(`Income differential (Candidate ₹${candidate.annualIncomeLPA} LPA)`);
  }

  // Educational Pedigree
  if (
    candidate.degree.includes("MBA") ||
    candidate.degree.includes("Tech") ||
    candidate.undergradCollege.includes("IIT") ||
    candidate.undergradCollege.includes("IIM") ||
    candidate.undergradCollege.includes("BITS")
  ) {
    careerIncomeFit += 10;
    reasons.push(`Top-tier pedigree (${candidate.undergradCollege})`);
  }

  // Relocation Synergy
  if (candidate.openToRelocate === "Yes" || customer.openToRelocate === "Yes") {
    valuesFit += 12;
    reasons.push("Flexible relocation synergy");
  } else if (customer.city === candidate.city) {
    valuesFit += 12;
    reasons.push(`Co-located in ${customer.city}`);
  } else {
    valuesFit += 3;
    potentialConcerns.push("Cross-city with neither relocating");
  }

  // Family & Values
  if (customer.wantKids === candidate.wantKids) {
    valuesFit += 10;
    reasons.push(`Aligned outlook on kids ("${customer.wantKids}")`);
  } else if (customer.wantKids === "Maybe" || candidate.wantKids === "Maybe") {
    valuesFit += 5;
  } else {
    potentialConcerns.push("Divergent views on kids");
  }

  if (customer.familyValues === candidate.familyValues) {
    valuesFit += 8;
    reasons.push(`Shared ${customer.familyValues.toLowerCase()} values`);
  }

  // Age & Height
  const ageDiff = candidate.age - customer.age;
  if (ageDiff >= 0 && ageDiff <= 4) {
    ageHeightFit += 15;
    reasons.push(`Ideal age synergy (${candidate.age} yrs vs ${customer.age} yrs)`);
  } else if (ageDiff > 4 && ageDiff <= 7) {
    ageHeightFit += 10;
  } else if (ageDiff < 0 && Math.abs(ageDiff) <= 2) {
    ageHeightFit += 8;
  } else {
    ageHeightFit += 3;
    potentialConcerns.push(`Age difference of ${Math.abs(ageDiff)} yrs`);
  }

  if (candidate.heightCm >= customer.heightCm) {
    ageHeightFit += 10;
    reasons.push(`Height compatibility (${candidate.heightFormatted})`);
  } else {
    potentialConcerns.push("Candidate is shorter than customer");
  }

  // Diet & Habits
  if (customer.diet === candidate.diet) {
    culturalLifestyleFit += 7;
    reasons.push(`Dietary alignment: ${customer.diet}`);
  }

  if (customer.smoking === candidate.smoking && customer.drinking === candidate.drinking) {
    culturalLifestyleFit += 8;
    reasons.push("Harmonious lifestyle habits");
  } else {
    culturalLifestyleFit += 3;
  }

  const dealbreakers = detectDealbreakers(customer, candidate);
  const criticalDeduction = dealbreakers.filter((d) => d.severity === "critical").length * 20;

  const rawScore = ageHeightFit + careerIncomeFit + valuesFit + culturalLifestyleFit;
  const totalScore = Math.max(10, Math.min(100, rawScore - criticalDeduction));

  return {
    score: totalScore,
    breakdown: { ageHeightFit, careerIncomeFit, valuesFit, culturalLifestyleFit },
    reasons,
    potentialConcerns,
    dealbreakers,
  };
}

export function matchCandidatesForCustomer(
  customer: Customer,
  pool: Biodata[]
): (MatchRecommendation & { dealbreakers: DealbreakerFlag[] })[] {
  const oppositeGenderCandidates = pool.filter(
    (c) => c.gender.toLowerCase() !== customer.gender.toLowerCase()
  );

  const scoredMatches = oppositeGenderCandidates.map((candidate) => {
    const result =
      customer.gender === "Male"
        ? scoreForMaleCustomer(customer, candidate)
        : scoreForFemaleCustomer(customer, candidate);

    return {
      candidate,
      compatibilityScore: result.score,
      scoreBreakdown: result.breakdown,
      reasons: result.reasons,
      potentialConcerns: result.potentialConcerns,
      dealbreakers: result.dealbreakers,
      matchStatus: "suggested" as const,
    };
  });

  return scoredMatches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
}