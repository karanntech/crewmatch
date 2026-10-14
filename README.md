# The Date Crew (TDC) - Matchmaker Algorithm & Dashboard MVP

> An internal matchmaker operations dashboard and intelligent matchmaking engine designed to help the TDC team manage client journeys, review rich biodata, evaluate opposite-gender candidate compatibility, and dispatch personalized introductions.

---

## 🔗 Project Links & Credentials

- **Live Hosted Application:** [Insert your deployed Vercel URL here]
- **GitHub Repository:** [Insert your GitHub repository URL here]
- **Demo Reviewer Credentials:**
  - **Email / Username:** `matchmaker@thedatecrew.com`
  - **Password:** `tdc2026password`
  - *(Credentials are also pre-filled on the login screen for quick evaluation).*

---

## 📌 Executive Summary & Submission Write-Up

### 1. Technology Choices & Architecture
The application is built using a unified full-stack architecture powered by **Next.js (App Router)** with **TypeScript**, styled via **Tailwind CSS** and **shadcn/ui primitives**. 
- **Unified Full-Stack Framework:** Next.js was selected because it combines server-side rendering, client-side interactivity, and Node.js route handlers into a single repository. This eliminated cross-origin resource sharing (CORS) configuration, streamlined environment variable handling for AI endpoints, and allowed rapid deployment to **Vercel** with zero-latency builds.
- **Data Persistence Strategy:** In alignment with the assignment guidelines, the data layer utilizes structured **Static JSON stores** (`assigned-customers.json` and `pool-candidates.json`) strictly validated against TypeScript interfaces. This approach eliminates external database network cold starts and IP-whitelisting bottlenecks on serverless edge functions, guaranteeing 100% uptime and immediate evaluation speed.
- **Component Primitives (shadcn/ui & Radix UI):** Selected for unstyled, highly accessible UI primitives (`dialog`, `tabs`, `badge`, `textarea`, `card`), enabling an intuitive, operational-grade enterprise portal without third-party styling bloat.

### 2. Matching Logic & Indian Matrimonial Nuances
The matching engine implements gender-specific heuristics reflective of the prompt's requirements and real-world dynamics observed in modern Indian matrimonial platforms:
- **Male Client Heuristics:** Prioritizes women who are younger, have lower or comparable income brackets, are shorter in height, and share identical outlooks on family planning and children.
- **Female Client Heuristics:** Centers on career parity, tier-one educational pedigree (e.g., IITs, IIMs, BITS, Premier Universities), relocation synergy (ensuring ambitious professionals are not forced into relocation compromises), and shared progressive/moderate family values.
- **Dealbreaker / Non-Negotiable Radar (Standout Feature):** Beyond simple numeric scoring, the engine detects hard cultural and lifestyle dealbreakers before introductions are sent:
  - *Dietary Divergence:* Flags clashes between strict Jain/Vegetarian customers and Non-Vegetarian candidates.
  - *Relocation Deadlock:* Highlights when candidates reside in separate cities and neither is willing to relocate.
  - *Family Planning Deadlock:* Flags direct opposition on children preferences.
  - *Kundali / Manglik Notice:* Flags matches pairing Manglik and Non-Manglik backgrounds.

### 3. AI Integration
AI is integrated directly into the matchmaker's day-to-day workflow via the **OpenAI API (`gpt-4o-mini`)**:
- **On-Demand Profile-Fit Reasoning:** Generates qualitative match assessments explaining primary synergies and subtle friction points directly on candidate cards.
- **Dual-Channel Outreach Drafting:** Generates tailored copy for two primary Indian communication modes:
  1. *Formal Email Pitch:* A structured, respectful 3-paragraph executive introduction.
  2. *WhatsApp Pitch Snippet:* A condensed, emoji-accented mobile message designed for one-click clipboard copying and instant messaging.
- **Fail-Safe Fallbacks:** Built-in heuristic rule generators produce structured reasoning and pitch copy automatically if an API key is absent or rate-limited, preventing evaluator disruption.

### 4. Assumptions Made & Future Roadmap
- **Operational Model:** The tool assumes matchmakers act as confidential curators who review, filter, and add meeting notes prior to any client dispatch.
- **Database Scaling:** While static JSON was utilized for this prototype MVP, a production release would transition the persistence layer to **PostgreSQL with Prisma** or **MongoDB Atlas**, with compound indexing across geolocation coordinates, income tiers, and Redis-cached candidate pools.

---

## 🛠️ Features Breakdown

| Feature | Description | File Location |
| :--- | :--- | :--- |
| **Authentication & Gatekeeping** | Route protection via cookie sessions and Next.js proxying. | `src/app/(auth)/login/page.tsx`, `src/proxy.ts` |
| **Matchmaker Dashboard** | Customer overview with stage tags, instant search, and journey stage filtering. | `src/app/page.tsx` |
| **Customer Detailed Biodata** | Demographics, career, education, family, lifestyle, diet, and Manglik status. | `src/app/customers/[id]/page.tsx` |
| **Meeting / Call Notes Log** | Interactive logger allowing matchmakers to save timestamped client insights. | `src/app/customers/[id]/page.tsx` |
| **Gender-Specific Algorithm** | Multi-attribute scoring engine with opposite-gender candidate pool ranking. | `src/lib/matching-algo.ts` |
| **Dealbreaker Radar** | Visual alert badges flagging non-negotiables (kids, relocation, diet, manglik). | `src/lib/matching-algo.ts` |
| **Side-by-Side Comparison** | Dedicated split-screen modal comparing client vs. candidate attributes. | `src/app/customers/[id]/page.tsx` |
| **AI Pitch Generation** | Automated generation of email pitches and WhatsApp snippets with one-click copy. | `src/app/api/ai/generate-intro/route.ts` |
| **AI Match Reasoning** | Natural language breakdown of profile fit and compatibility dynamics. | `src/app/api/ai/match-reasoning/route.ts` |
| **Mock Dispatch & Toasts** | Confirmation modal and Sonner toast notifications simulating client notifications. | `src/app/customers/[id]/page.tsx` |

---

## 🏗️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Component UI:** shadcn/ui (Radix UI primitives)
- **Icons:** Lucide React
- **Notifications:** Sonner
- **AI Engine:** OpenAI API (`gpt-4o-mini`)
- **Hosting:** Vercel

---

## 📂 Project Architecture

```text
crewmatch/
├── scripts/
│   └── seed-candidates.js         # Generator script seeding 120 dummy profiles
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/             # Matchmaker login screen
│   │   ├── api/
│   │   │   └── ai/
│   │   │       ├── generate-intro/# Route drafting Email & WhatsApp pitches
│   │   │       └── match-reasoning/# Route explaining qualitative match fit
│   │   ├── customers/
│   │   │   └── [id]/              # Detailed Biodata, Matching Tab & Notes View
│   │   ├── globals.css            # Global styling and Tailwind configuration
│   │   ├── layout.tsx             # Root layout with custom typography & Toaster
│   │   └── page.tsx               # Main Matchmaker Customer Directory
│   ├── components/
│   │   └── ui/                    # shadcn UI components (button, card, dialog, tabs, etc.)
│   ├── data/
│   │   ├── assigned-customers.json# Active assigned client profiles
│   │   └── pool-candidates.json   # 120 opposite-gender candidate profiles
│   ├── lib/
│   │   ├── auth.ts                # Session constants and test credentials
│   │   ├── matching-algo.ts       # Gender-specific scoring and dealbreaker engine
│   │   ├── types.ts               # Complete TypeScript models and interfaces
│   │   └── utils.ts               # Class merging utilities
│   └── proxy.ts                   # Next.js route protection proxy
├── .env.local                     # Environment variables (OPENAI_API_KEY)
├── package.json
└── README.md