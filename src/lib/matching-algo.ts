import { Biodata, Customer, MatchRecommendation } from "./types";

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
}

/**
 * Calculates compatibility score between a male client and a female candidate.
 * Criteria from TDC brief:
 * - Younger
 * - Earns less
 * - Shorter
 * - Matching views on children
 */
function scoreForMaleCustomer(customer: Customer, candidate: Biodata): ScoreResult {
  let ageHeightFit = 0;
  let careerIncomeFit = 0;
  let valuesFit = 0;
  let culturalLifestyleFit = 0;

  const reasons: string[] = [];
  const potentialConcerns: string[] = [];

  // 1. Age Rule: Younger preferred
  const ageDiff = customer.age - candidate.age; // Positive means candidate is younger
  if (ageDiff >= 1 && ageDiff <= 5) {
    ageHeightFit += 15;
    reasons.push(`Optimal age gap: Candidate is ${ageDiff} years younger`);
  } else if (ageDiff > 5) {
    ageHeightFit += 10;
    reasons.push(`Candidate is ${ageDiff} years younger`);
  } else if (ageDiff === 0) {
    ageHeightFit += 8;
  } else {
    // Candidate is older
    ageHeightFit += 2;
    potentialConcerns.push(`Candidate is ${Math.abs(ageDiff)} years older than customer`);
  }

  // 2. Height Rule: Shorter preferred
  const heightDiff = customer.heightCm - candidate.heightCm; // Positive means candidate is shorter
  if (heightDiff >= 5 && heightDiff <= 18) {
    ageHeightFit += 15;
    reasons.push(`Complementary height (${candidate.heightFormatted} vs ${customer.heightFormatted})`);
  } else if (heightDiff > 0) {
    ageHeightFit += 10;
  } else {
    // Taller or equal
    ageHeightFit += 3;
    potentialConcerns.push(`Candidate is taller or equal height (${candidate.heightFormatted})`);
  }

  // 3. Income Rule: Candidate earns less preferred
  if (candidate.annualIncomeLPA < customer.annualIncomeLPA) {
    careerIncomeFit += 25;
    reasons.push(`Traditional income alignment (₹${candidate.annualIncomeLPA} LPA vs ₹${customer.annualIncomeLPA} LPA)`);
  } else if (candidate.annualIncomeLPA === customer.annualIncomeLPA) {
    careerIncomeFit += 15;
    reasons.push(`Peer income level`);
  } else {
    careerIncomeFit += 8;
    potentialConcerns.push(`Candidate has higher income (₹${candidate.annualIncomeLPA} LPA)`);
  }

  // 4. Children Preference Alignment (Critical parameter)
  if (customer.wantKids === candidate.wantKids) {
    valuesFit += 15;
    reasons.push(`Mutual alignment on kids ("${customer.wantKids}")`);
  } else if (customer.wantKids === "Maybe" || candidate.wantKids === "Maybe") {
    valuesFit += 8;
  } else {
    potentialConcerns.push(`Differing views on family planning (Customer: ${customer.wantKids}, Candidate: ${candidate.wantKids})`);
  }

  // 5. Relocation & Pets
  if (customer.openToPets === candidate.openToPets) {
    valuesFit += 5;
  }
  if (customer.openToRelocate === candidate.openToRelocate || candidate.openToRelocate === "Yes") {
    valuesFit += 5;
  }

  // 6. Cultural & Lifestyle Alignment (Diet, City, Religion)
  if (customer.city === candidate.city) {
    culturalLifestyleFit += 10;
    reasons.push(`Both based in ${customer.city}`);
  } else {
    culturalLifestyleFit += 4;
    potentialConcerns.push(`Different cities (${customer.city} vs ${candidate.city})`);
  }

  if (customer.diet === candidate.diet) {
    culturalLifestyleFit += 5;
    reasons.push(`Shared dietary choice: ${customer.diet}`);
  } else if (
    (customer.diet === "Vegetarian" && candidate.diet === "Jain") ||
    (customer.diet === "Eggetarian" && candidate.diet === "Vegetarian")
  ) {
    culturalLifestyleFit += 3;
  }

  if (customer.religion === candidate.religion) {
    culturalLifestyleFit += 5;
  }

  const totalScore = Math.min(100, ageHeightFit + careerIncomeFit + valuesFit + culturalLifestyleFit);

  return {
    score: totalScore,
    breakdown: { ageHeightFit, careerIncomeFit, valuesFit, culturalLifestyleFit },
    reasons,
    potentialConcerns,
  };
}

/**
 * Calculates compatibility score between a female client and a male candidate.
 * Criteria from TDC brief:
 * - Profession and career compatibility
 * - Values & lifestyle alignment
 * - Relocation preferences
 * - Balanced age & height parity
 */
function scoreForFemaleCustomer(customer: Customer, candidate: Biodata): ScoreResult {
  let ageHeightFit = 0;
  let careerIncomeFit = 0;
  let valuesFit = 0;
  let culturalLifestyleFit = 0;

  const reasons: string[] = [];
  const potentialConcerns: string[] = [];

  // 1. Profession, Education & Income Compatibility
  // Career parity: Candidate earning similarly or higher, or working in complementary corporate/startup field
  if (candidate.annualIncomeLPA >= customer.annualIncomeLPA) {
    careerIncomeFit += 15;
    reasons.push(`Strong career parity (₹${candidate.annualIncomeLPA} LPA in ${candidate.designation})`);
  } else if (candidate.annualIncomeLPA >= customer.annualIncomeLPA * 0.8) {
    careerIncomeFit += 10;
    reasons.push(`Comparable financial standing`);
  } else {
    careerIncomeFit += 5;
    potentialConcerns.push(`Income differential (Candidate ₹${candidate.annualIncomeLPA} LPA)`);
  }

  // High degree / college tier alignment
  if (
    candidate.degree.includes("MBA") ||
    candidate.degree.includes("Tech") ||
    candidate.undergradCollege.includes("IIT") ||
    candidate.undergradCollege.includes("IIM") ||
    candidate.undergradCollege.includes("Delhi")
  ) {
    careerIncomeFit += 10;
    reasons.push(`Top-tier educational background (${candidate.undergradCollege})`);
  }

  // 2. Relocation Preference Alignment (Crucial for modern ambitious female professionals)
  if (candidate.openToRelocate === "Yes" || customer.openToRelocate === "Yes") {
    valuesFit += 12;
    reasons.push(`Flexible relocation compatibility`);
  } else if (customer.city === candidate.city) {
    valuesFit += 12;
    reasons.push(`Already co-located in ${customer.city}`);
  } else {
    valuesFit += 3;
    potentialConcerns.push(`Both prefer not to relocate from different locations`);
  }

  // 3. Family Planning & Lifestyle Values
  if (customer.wantKids === candidate.wantKids) {
    valuesFit += 10;
    reasons.push(`Aligned outlook on starting a family ("${customer.wantKids}")`);
  } else if (customer.wantKids === "Maybe" || candidate.wantKids === "Maybe") {
    valuesFit += 5;
  } else {
    potentialConcerns.push(`Divergent views on kids`);
  }

  if (customer.familyValues === candidate.familyValues) {
    valuesFit += 8;
    reasons.push(`Shared ${customer.familyValues.toLowerCase()} family values`);
  }

  // 4. Age & Height compatibility
  const ageDiff = candidate.age - customer.age; // Positive means male candidate is older
  if (ageDiff >= 0 && ageDiff <= 4) {
    ageHeightFit += 15;
    reasons.push(`Ideal age synergy (${candidate.age} yrs vs ${customer.age} yrs)`);
  } else if (ageDiff > 4 && ageDiff <= 7) {
    ageHeightFit += 10;
  } else if (ageDiff < 0 && Math.abs(ageDiff) <= 2) {
    ageHeightFit += 8;
  } else {
    ageHeightFit += 3;
    potentialConcerns.push(`Age difference of ${Math.abs(ageDiff)} years`);
  }

  if (candidate.heightCm >= customer.heightCm) {
    ageHeightFit += 10;
    reasons.push(`Height compatibility (${candidate.heightFormatted})`);
  } else {
    potentialConcerns.push(`Candidate is shorter than customer`);
  }

  // 5. Cultural, Diet & Habits
  if (customer.diet === candidate.diet) {
    culturalLifestyleFit += 7;
    reasons.push(`Dietary alignment: ${customer.diet}`);
  }

  if (customer.smoking === candidate.smoking && customer.drinking === candidate.drinking) {
    culturalLifestyleFit += 8;
    reasons.push(`Complementary lifestyle habits`);
  } else {
    culturalLifestyleFit += 3;
  }

  const totalScore = Math.min(100, ageHeightFit + careerIncomeFit + valuesFit + culturalLifestyleFit);

  return {
    score: totalScore,
    breakdown: { ageHeightFit, careerIncomeFit, valuesFit, culturalLifestyleFit },
    reasons,
    potentialConcerns,
  };
}

/**
 * Main function: Filters opposite-gender candidates and ranks them by compatibility.
 */
export function matchCandidatesForCustomer(
  customer: Customer,
  pool: Biodata[]
): MatchRecommendation[] {
  // TDC Rule: Pool must consist of the opposite gender
  const oppositeGenderCandidates = pool.filter(
    (c) => c.gender.toLowerCase() !== customer.gender.toLowerCase()
  );

  const scoredMatches: MatchRecommendation[] = oppositeGenderCandidates.map((candidate) => {
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
      matchStatus: "suggested",
    };
  });

  // Sort descending by highest compatibility score
  return scoredMatches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
}