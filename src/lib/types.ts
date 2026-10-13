export type Gender = "Male" | "Female" | "Other";

export type MaritalStatus = 
  | "Never Married" 
  | "Divorced" 
  | "Awaiting Divorce" 
  | "Widowed";

export type TriStatePreference = "Yes" | "No" | "Maybe";

export type DietPreference = "Vegetarian" | "Non-Vegetarian" | "Eggetarian" | "Jain" | "Vegan";

export type ClientStage = 
  | "Onboarding" 
  | "Active Search" 
  | "Match Review" 
  | "Introduction Sent" 
  | "Follow-up Scheduled" 
  | "Closed / Matched";

export interface MatchmakerNote {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

// Complete Biodata model matching TDC specifications
export interface Biodata {
  id: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  dateOfBirth: string; // YYYY-MM-DD
  age: number;
  heightCm: number; // e.g., 175
  heightFormatted: string; // e.g., "5'9\""
  country: string;
  city: string;
  email: string;
  phoneNumber: string;

  // Education & Career
  undergradCollege: string;
  degree: string;
  currentCompany: string;
  designation: string;
  annualIncomeLPA: number; // In Lakhs INR (e.g., 35 for ₹35 LPA)
  incomeFormatted: string;

  // Marital & Background
  maritalStatus: MaritalStatus;
  languagesKnown: string[];
  siblings: string; // e.g., "1 younger brother", "None"
  caste: string;
  religion: string;

  // Lifestyle & Core Values
  wantKids: TriStatePreference;
  openToRelocate: TriStatePreference;
  openToPets: TriStatePreference;

  // Additional Indian Matchmaking Specifics
  diet: DietPreference;
  drinking: "Never" | "Socially" | "Regularly";
  smoking: "No" | "Yes" | "Occasionally";
  manglikStatus: "Non-Manglik" | "Manglik" | "Don't Mind / Anshik";
  familyValues: "Traditional" | "Moderate" | "Liberal";
  
  bio: string;
  avatarUrl?: string;
}

// Client managed directly on the matchmaker dashboard
export interface Customer extends Biodata {
  assignedMatchmakerId: string;
  stage: ClientStage;
  notes: MatchmakerNote[];
  preferredAgeRange?: { min: number; max: number };
  preferredMaxDistanceKm?: number;
}

// Suggested match result produced by algorithm + AI engine
export interface MatchRecommendation {
  candidate: Biodata;
  compatibilityScore: number; // 0 to 100
  scoreBreakdown: {
    ageHeightFit: number;
    careerIncomeFit: number;
    valuesFit: number; // kids, pets, relocation
    culturalLifestyleFit: number; // diet, religion, location
  };
  reasons: string[];
  potentialConcerns: string[];
  aiPitchSummary?: string; // Generated intro blurb for mock email
  matchStatus: "suggested" | "sent" | "rejected";
}