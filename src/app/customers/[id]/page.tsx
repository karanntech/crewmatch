"use client";

export const dynamic = "force-dynamic";

import { use, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import assignedData from "@/data/assigned-customers.json";
import candidatesPoolData from "@/data/pool-candidates.json";
import { Customer, Biodata, MatchRecommendation, MatchmakerNote } from "@/lib/types";
import { matchCandidatesForCustomer } from "@/lib/matching-algo";
import { 
  ArrowLeft, 
  Sparkles, 
  Briefcase, 
  GraduationCap, 
  MapPin, 
  Phone, 
  Mail, 
  Heart, 
  Send, 
  MessageSquare, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Plus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  // Load client from mock data
  const customer = (assignedData as Customer[]).find((c) => c.id === id);

  // Notes state
  const [newNote, setNewNote] = useState("");
  const [notesList, setNotesList] = useState<MatchmakerNote[]>(customer?.notes || []);

  // Matching algorithm recommendations (opposite gender pool)
  const pool = candidatesPoolData as Biodata[];
  const matchRecommendations = useMemo(() => {
    if (!customer) return [];
    return matchCandidatesForCustomer(customer, pool);
  }, [customer, pool]);

  // Modal / AI State
  const [selectedCandidate, setSelectedCandidate] = useState<MatchRecommendation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiIntroText, setAiIntroText] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiFitReason, setAiFitReason] = useState<Record<string, string>>({});
  const [isReasonLoading, setIsReasonLoading] = useState<string | null>(null);

  if (!customer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
        <h2 className="text-xl font-bold text-slate-800">Customer profile not found</h2>
        <Button onClick={() => router.push("/")} className="mt-4">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  // Handle adding notes
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const createdNote: MatchmakerNote = {
      id: `note-${Date.now()}`,
      author: "Priya (Matchmaker)",
      content: newNote.trim(),
      createdAt: new Date().toISOString(),
    };

    setNotesList([createdNote, ...notesList]);
    setNewNote("");
    toast.success("Matchmaker note logged successfully");
  };

  // Trigger Match action and open mock email dialog
  const handleOpenSendMatchModal = async (recommendation: MatchRecommendation) => {
    setSelectedCandidate(recommendation);
    setIsModalOpen(true);
    setIsAiLoading(true);

    try {
      const res = await fetch("/api/ai/generate-intro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer,
          candidate: recommendation.candidate,
        }),
      });
      const data = await res.json();
      setAiIntroText(data.introText || "");
    } catch {
      setAiIntroText(`Hi ${customer.firstName}, please review the attached profile of ${recommendation.candidate.firstName}.`);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Request on-demand AI Profile Fit Reasoning
  const handleGetAiReasoning = async (candidateId: string, candidate: Biodata) => {
    setIsReasonLoading(candidateId);
    try {
      const res = await fetch("/api/ai/match-reasoning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer, candidate }),
      });
      const data = await res.json();
      if (data.reasoning) {
        setAiFitReason((prev) => ({ ...prev, [candidateId]: data.reasoning }));
      }
    } catch {
      toast.error("Failed to generate AI insights");
    } finally {
      setIsReasonLoading(null);
    }
  };

  // Dispatch mock email
  const handleConfirmSendMatch = () => {
    if (!selectedCandidate) return;

    toast.success(`Match profile for ${selectedCandidate.candidate.firstName} sent to ${customer.firstName}!`, {
      description: `Dispatched via simulated notification to ${customer.email}`,
    });

    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16">
      {/* Top Banner Navigation */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-rose-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Customer Directory
          </Link>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium">Journey Stage:</span>
            <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5 bg-rose-50 text-rose-700 border-rose-200">
              {customer.stage}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Customer Header Snapshot Card */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xl shrink-0">
                  {customer.firstName[0]}{customer.lastName[0]}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-slate-900">
                      {customer.firstName} {customer.lastName}
                    </h1>
                    <Badge variant="secondary" className="font-normal text-xs">
                      ID: {customer.id}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">
                    {customer.age} yrs • {customer.gender} • {customer.heightFormatted} ({customer.heightCm} cm) • {customer.maritalStatus}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {customer.city}, {customer.country}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {customer.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {customer.phoneNumber}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100 gap-2">
                <div className="text-left lg:text-right">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Annual Compensation</p>
                  <p className="text-xl font-bold text-slate-900">{customer.incomeFormatted}</p>
                </div>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 border">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  Verified Biodata
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs: Matches Pool, Full Biodata, Notes */}
        <Tabs defaultValue="matches" className="w-full">
          <TabsList className="grid grid-cols-3 max-w-md bg-slate-200/70 p-1">
            <TabsTrigger value="matches" className="text-xs font-semibold">
              Suggested Matches ({matchRecommendations.length})
            </TabsTrigger>
            <TabsTrigger value="biodata" className="text-xs font-semibold">
              Full Biodata Details
            </TabsTrigger>
            <TabsTrigger value="notes" className="text-xs font-semibold">
              Call & Meeting Notes ({notesList.length})
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: MATCHING ENGINE & CANDIDATE POOL */}
          <TabsContent value="matches" className="mt-6 space-y-4">
            <div className="bg-linear-to-r from-rose-50 to-amber-50 border border-rose-200/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-rose-600" />
                  TDC Gender-Specific Algorithmic Match Pool
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Showing opposite-gender candidates ranked by multi-variable compatibility (Age, Height, Career, Values & Children preferences).
                </p>
              </div>
              <Badge variant="outline" className="bg-white text-slate-700 text-xs font-mono self-start sm:self-auto">
                Pool: {pool.length} profiles
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {matchRecommendations.slice(0, 15).map((rec, idx) => {
                const candidate = rec.candidate;
                const hasAiReason = aiFitReason[candidate.id];

                return (
                  <Card key={candidate.id} className="border-slate-200 hover:border-slate-300 transition-all shadow-sm">
                    <CardContent className="p-5">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Profile Info */}
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-xs font-mono font-bold text-slate-400">#{idx + 1}</span>
                            <h4 className="text-lg font-bold text-slate-900">
                              {candidate.firstName} {candidate.lastName}
                            </h4>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs font-medium text-slate-600">
                              {candidate.age} yrs • {candidate.heightFormatted}
                            </span>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs font-medium text-slate-600">
                              {candidate.city}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                              {candidate.designation} at {candidate.currentCompany} ({candidate.incomeFormatted})
                            </span>
                            <span className="flex items-center gap-1">
                              <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                              {candidate.degree}, {candidate.undergradCollege}
                            </span>
                          </div>

                          {/* Synergy and Friction pills */}
                          <div className="space-y-1 pt-1">
                            <div className="flex flex-wrap gap-1.5 items-center">
                              {rec.reasons.slice(0, 3).map((reason, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  {reason}
                                </span>
                              ))}
                              {rec.potentialConcerns.slice(0, 1).map((concern, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1 text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md"
                                >
                                  <AlertCircle className="w-3 h-3" />
                                  {concern}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* AI Reasoning Blurb if invoked */}
                          {hasAiReason && (
                            <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
                              <span className="font-semibold text-rose-600 flex items-center gap-1 mb-1">
                                <Sparkles className="w-3.5 h-3.5" /> AI Match Analysis:
                              </span>
                              {hasAiReason}
                            </div>
                          )}
                        </div>

                        {/* Right: Score & Actions */}
                        <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100 gap-4 shrink-0">
                          <div className="text-left lg:text-right">
                            <p className="text-xs text-slate-400 font-medium">Match Fit</p>
                            <span className="text-2xl font-black text-rose-600">
                              {rec.compatibilityScore}%
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {!hasAiReason && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs border-slate-200 text-slate-600 hover:text-rose-600"
                                disabled={isReasonLoading === candidate.id}
                                onClick={() => handleGetAiReasoning(candidate.id, candidate)}
                              >
                                <Sparkles className="w-3 h-3 mr-1" />
                                {isReasonLoading === candidate.id ? "Analyzing..." : "AI Insight"}
                              </Button>
                            )}

                            <Button
                              size="sm"
                              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
                              onClick={() => handleOpenSendMatchModal(rec)}
                            >
                              <Send className="w-3 h-3 mr-1.5" />
                              Send Match
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* TAB 2: DETAILED BIODATA VIEW */}
          <TabsContent value="biodata" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Demographics & Personal */}
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-base">Demographics & Personal Background</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500">Date of Birth:</span>
                    <span className="font-medium text-slate-800">{customer.dateOfBirth} ({customer.age} years)</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500">Height:</span>
                    <span className="font-medium text-slate-800">{customer.heightFormatted} ({customer.heightCm} cm)</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500">Religion & Caste:</span>
                    <span className="font-medium text-slate-800">{customer.religion} • {customer.caste}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500">Manglik Status:</span>
                    <span className="font-medium text-slate-800">{customer.manglikStatus}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500">Languages Known:</span>
                    <span className="font-medium text-slate-800">{customer.languagesKnown.join(", ")}</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span className="text-slate-500">Siblings:</span>
                    <span className="font-medium text-slate-800">{customer.siblings}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Career & Education */}
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-base">Education & Professional Standing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500">Undergrad College:</span>
                    <span className="font-medium text-slate-800">{customer.undergradCollege}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500">Degree:</span>
                    <span className="font-medium text-slate-800">{customer.degree}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500">Current Employer:</span>
                    <span className="font-medium text-slate-800">{customer.currentCompany}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500">Designation:</span>
                    <span className="font-medium text-slate-800">{customer.designation}</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span className="text-slate-500">Annual Income:</span>
                    <span className="font-semibold text-emerald-700">{customer.incomeFormatted}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Lifestyle & Match Preferences */}
              <Card className="border-slate-200 md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Lifestyle, Beliefs & Family Planning</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500">Wants Children?</p>
                    <p className="font-semibold text-slate-800 mt-1">{customer.wantKids}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500">Open to Relocation?</p>
                    <p className="font-semibold text-slate-800 mt-1">{customer.openToRelocate}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500">Comfortable with Pets?</p>
                    <p className="font-semibold text-slate-800 mt-1">{customer.openToPets}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500">Dietary Style</p>
                    <p className="font-semibold text-slate-800 mt-1">{customer.diet}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500">Drinking Habits</p>
                    <p className="font-semibold text-slate-800 mt-1">{customer.drinking}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500">Smoking Habits</p>
                    <p className="font-semibold text-slate-800 mt-1">{customer.smoking}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500">Family Values</p>
                    <p className="font-semibold text-slate-800 mt-1">{customer.familyValues}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500">Profile Bio</p>
                    <p className="font-medium text-slate-700 mt-1 line-clamp-2">{customer.bio}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 3: MATCHMAKER NOTES LOG */}
          <TabsContent value="notes" className="mt-6 space-y-6">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-slate-500" />
                  Log Client Notes
                </CardTitle>
                <CardDescription>
                  Record confidential insights from phone calls, client catch-ups, or meeting feedback.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddNote} className="space-y-3">
                  <Textarea
                    placeholder="Enter notes from recent conversation (e.g. client is open to relocating if partner is in Bengaluru)..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <Button type="submit" size="sm" className="bg-slate-900 hover:bg-slate-800">
                      <Plus className="w-4 h-4 mr-1" />
                      Save Note
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-800">Historical Notes ({notesList.length})</h3>
              {notesList.length === 0 ? (
                <p className="text-xs text-slate-400">No notes recorded yet for this client.</p>
              ) : (
                notesList.map((note) => (
                  <Card key={note.id} className="border-slate-200 bg-white">
                    <CardContent className="p-4 space-y-1">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">{note.author}</span>
                        <span>{new Date(note.createdAt).toLocaleDateString()} at {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-xs text-slate-800 leading-relaxed pt-1">{note.content}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* MATCH ACTION MODAL / SEND INTRO */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-600" />
              Dispatch Suggested Match
            </DialogTitle>
            <DialogDescription>
              Preview the personalized introduction blurb and biodata snapshot before notifying the customer.
            </DialogDescription>
          </DialogHeader>

          {selectedCandidate && (
            <div className="space-y-4 my-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="font-bold text-slate-800 text-sm">
                  {selectedCandidate.candidate.firstName} {selectedCandidate.candidate.lastName}
                </p>
                <p className="text-slate-600 mt-0.5">
                  {selectedCandidate.candidate.age} yrs • {selectedCandidate.candidate.designation} at {selectedCandidate.candidate.currentCompany} • {selectedCandidate.candidate.city}
                </p>
                <p className="text-slate-500 mt-1">
                  Income: {selectedCandidate.candidate.incomeFormatted} • Education: {selectedCandidate.candidate.degree}
                </p>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  AI-Generated Matchmaker Introduction:
                </label>
                {isAiLoading ? (
                  <div className="p-4 text-center text-slate-500 bg-slate-50 rounded-md border border-slate-200">
                    <Sparkles className="w-4 h-4 mx-auto animate-spin text-rose-500 mb-1" />
                    Drafting personalized pitch via AI...
                  </div>
                ) : (
                  <Textarea
                    className="h-28 text-xs font-sans leading-relaxed"
                    value={aiIntroText}
                    onChange={(e) => setAiIntroText(e.target.value)}
                  />
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-rose-600 hover:bg-rose-700 text-white"
              onClick={handleConfirmSendMatch}
              disabled={isAiLoading}
            >
              <Send className="w-3.5 h-3.5 mr-1" />
              Send to {customer.firstName}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}