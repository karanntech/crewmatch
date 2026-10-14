"use client";

import { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import assignedData from "@/data/assigned-customers.json";
import candidatesPoolData from "@/data/pool-candidates.json";
import { Customer, Biodata, MatchRecommendation, MatchmakerNote } from "@/lib/types";
import { matchCandidatesForCustomer, DealbreakerFlag } from "@/lib/matching-algo";
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
  AlertTriangle,
  Plus,
  Columns2,
  Copy,
  Check,
  Share2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

function CustomerDetailContent() {
  const router = useRouter();
  const routeParams = useParams();
  const id =
    typeof routeParams?.id === "string"
      ? routeParams.id
      : Array.isArray(routeParams?.id)
      ? routeParams.id[0]
      : "";

  const customer = (assignedData as Customer[]).find((c) => c.id === id);

  const [newNote, setNewNote] = useState("");
  const [notesList, setNotesList] = useState<MatchmakerNote[]>(customer?.notes || []);

  const pool = candidatesPoolData as Biodata[];
  const matchRecommendations = useMemo(() => {
    if (!customer) return [];
    return matchCandidatesForCustomer(customer, pool);
  }, [customer, pool]);

  // Modal / AI State
  const [selectedCandidate, setSelectedCandidate] = useState<
    (MatchRecommendation & { dealbreakers: DealbreakerFlag[] }) | null
  >(null);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [compareCandidate, setCompareCandidate] = useState<Biodata | null>(null);

  // Candidate Inspection Modal State
  const [viewCandidate, setViewCandidate] = useState<Biodata | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const handleOpenViewCandidate = (candidate: Biodata) => {
    setViewCandidate(candidate);
    setIsViewModalOpen(true);
  };

  // Pitches State
  const [emailPitch, setEmailPitch] = useState("");
  const [whatsAppPitch, setWhatsAppPitch] = useState("");
  const [pitchTab, setPitchTab] = useState<"email" | "whatsapp">("email");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // AI Reasoning State
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

  const handleOpenSendMatchModal = async (
    recommendation: MatchRecommendation & { dealbreakers: DealbreakerFlag[] }
  ) => {
    setSelectedCandidate(recommendation);
    setIsSendModalOpen(true);
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
      setEmailPitch(data.emailPitch || "");
      setWhatsAppPitch(data.whatsAppPitch || "");
    } catch {
      setEmailPitch(`Hi ${customer.firstName}, please review the attached profile of ${recommendation.candidate.firstName}.`);
      setWhatsAppPitch(`Hi ${customer.firstName}! Check out ${recommendation.candidate.firstName}'s biodata! ✨`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleOpenCompareModal = (candidate: Biodata) => {
    setCompareCandidate(candidate);
    setIsCompareModalOpen(true);
  };

  const handleCopyPitch = () => {
    const textToCopy = pitchTab === "email" ? emailPitch : whatsAppPitch;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success(`${pitchTab === "email" ? "Email" : "WhatsApp"} pitch copied to clipboard!`);
    setTimeout(() => setCopied(false), 2000);
  };

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

  const handleConfirmSendMatch = () => {
    if (!selectedCandidate) return;

    toast.success(`Match for ${selectedCandidate.candidate.firstName} dispatched!`, {
      description: `Notification sent via ${pitchTab === "email" ? "email" : "WhatsApp bridge"} to ${customer.firstName}`,
    });

    setIsSendModalOpen(false);
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

        {/* Tabs */}
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

          {/* TAB 1: MATCHING ENGINE */}
          <TabsContent value="matches" className="mt-6 space-y-4">
            <div className="bg-linear-to-r from-rose-50 to-amber-50 border border-rose-200/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-rose-600" />
                  TDC Smart Matching Engine & Dealbreaker Radar
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Opposite-gender candidates ranked by gender-specific logic with real-time non-negotiable checks (diet, kids, relocation).
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
                            <h4
                              onClick={() => handleOpenViewCandidate(candidate)}
                              className="text-lg font-bold text-slate-900 hover:text-rose-600 hover:underline cursor-pointer transition-colors"
                              title="Click to view full biodata"
                            >
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

                          {/* Synergy Pills */}
                          <div className="space-y-1.5 pt-1">
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
                                  className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md"
                                >
                                  <AlertCircle className="w-3 h-3" />
                                  {concern}
                                </span>
                              ))}
                            </div>

                            {/* Dealbreaker Alert Badges */}
                            {rec.dealbreakers.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 items-center pt-0.5">
                                {rec.dealbreakers.map((db, i) => (
                                  <span
                                    key={i}
                                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                                      db.severity === "critical"
                                        ? "bg-rose-50 text-rose-700 border-rose-200 animate-pulse"
                                        : "bg-amber-50 text-amber-700 border-amber-200"
                                    }`}
                                  >
                                    <AlertTriangle className="w-3 h-3" />
                                    {db.label}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* AI Fit Blurb */}
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

                          <div className="flex items-center gap-2 flex-wrap">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs border-slate-200 text-slate-600 hover:text-slate-900"
                              onClick={() => handleOpenCompareModal(candidate)}
                            >
                              <Columns2 className="w-3 h-3 mr-1" />
                              Compare
                            </Button>

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

          {/* TAB 3: NOTES */}
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
                    placeholder="Enter notes from recent conversation..."
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
                        <span>{new Date(note.createdAt).toLocaleDateString()}</span>
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

      {/* MODAL 1: SIDE-BY-SIDE BIODATA COMPARISON */}
      <Dialog open={isCompareModalOpen} onOpenChange={setIsCompareModalOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Columns2 className="w-5 h-5 text-slate-700" />
              Side-by-Side Matchmaker Comparison
            </DialogTitle>
            <DialogDescription>
              Evaluating compatibility parameters between client and candidate profile.
            </DialogDescription>
          </DialogHeader>

          {compareCandidate && (
            <div className="space-y-4 my-2 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-slate-100 p-3 rounded-lg font-bold text-slate-800">
                <div>Client: {customer.firstName} {customer.lastName} ({customer.gender})</div>
                <div>Candidate: {compareCandidate.firstName} {compareCandidate.lastName} ({compareCandidate.gender})</div>
              </div>

              <div className="space-y-2 border border-slate-200 rounded-lg p-3">
                <div className="grid grid-cols-3 py-1.5 border-b">
                  <span className="text-slate-500 font-medium">Age & Height</span>
                  <span className="font-semibold">{customer.age} yrs • {customer.heightFormatted}</span>
                  <span className="font-semibold">{compareCandidate.age} yrs • {compareCandidate.heightFormatted}</span>
                </div>

                <div className="grid grid-cols-3 py-1.5 border-b">
                  <span className="text-slate-500 font-medium">Location</span>
                  <span className="font-semibold">{customer.city}</span>
                  <span className={`font-semibold ${customer.city === compareCandidate.city ? "text-emerald-600" : ""}`}>
                    {compareCandidate.city}
                  </span>
                </div>

                <div className="grid grid-cols-3 py-1.5 border-b">
                  <span className="text-slate-500 font-medium">Career & Income</span>
                  <span className="font-semibold">{customer.designation} ({customer.incomeFormatted})</span>
                  <span className="font-semibold">{compareCandidate.designation} ({compareCandidate.incomeFormatted})</span>
                </div>

                <div className="grid grid-cols-3 py-1.5 border-b">
                  <span className="text-slate-500 font-medium">Education</span>
                  <span className="font-semibold">{customer.degree} ({customer.undergradCollege})</span>
                  <span className="font-semibold">{compareCandidate.degree} ({compareCandidate.undergradCollege})</span>
                </div>

                <div className="grid grid-cols-3 py-1.5 border-b">
                  <span className="text-slate-500 font-medium">Dietary Style</span>
                  <span className="font-semibold">{customer.diet}</span>
                  <span className={`font-semibold ${customer.diet === compareCandidate.diet ? "text-emerald-600" : "text-amber-600"}`}>
                    {compareCandidate.diet}
                  </span>
                </div>

                <div className="grid grid-cols-3 py-1.5 border-b">
                  <span className="text-slate-500 font-medium">Wants Kids?</span>
                  <span className="font-semibold">{customer.wantKids}</span>
                  <span className={`font-semibold ${customer.wantKids === compareCandidate.wantKids ? "text-emerald-600" : "text-rose-600"}`}>
                    {compareCandidate.wantKids}
                  </span>
                </div>

                <div className="grid grid-cols-3 py-1.5 border-b">
                  <span className="text-slate-500 font-medium">Open to Relocate?</span>
                  <span className="font-semibold">{customer.openToRelocate}</span>
                  <span className="font-semibold">{compareCandidate.openToRelocate}</span>
                </div>

                <div className="grid grid-cols-3 py-1.5">
                  <span className="text-slate-500 font-medium">Religion & Caste</span>
                  <span className="font-semibold">{customer.religion} • {customer.caste}</span>
                  <span className="font-semibold">{compareCandidate.religion} • {compareCandidate.caste}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button size="sm" onClick={() => setIsCompareModalOpen(false)}>
              Close Comparison
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

{/* MODAL 2: SEND MATCH DISPATCH (EMAIL + WHATSAPP) */}
      <Dialog open={isSendModalOpen} onOpenChange={setIsSendModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-600" />
              Dispatch Match Introduction
            </DialogTitle>
            <DialogDescription>
              Choose delivery channel and preview customized intro copy before sending.
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
              </div>

              {/* Channel Tabs */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => setPitchTab("email")}
                    className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      pitchTab === "email"
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Formal Email
                  </button>
                  <button
                    onClick={() => setPitchTab("whatsapp")}
                    className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      pitchTab === "whatsapp"
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    WhatsApp Pitch
                  </button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyPitch}
                  className="text-xs h-7 text-slate-600"
                >
                  {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>

              {isAiLoading ? (
                <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-md border border-slate-200">
                  <Sparkles className="w-4 h-4 mx-auto animate-spin text-rose-500 mb-1" />
                  Generating tailored {pitchTab === "email" ? "email" : "WhatsApp"} pitch via AI...
                </div>
              ) : (
                <Textarea
                  className="h-32 text-xs font-sans leading-relaxed"
                  value={pitchTab === "email" ? emailPitch : whatsAppPitch}
                  onChange={(e) =>
                    pitchTab === "email" ? setEmailPitch(e.target.value) : setWhatsAppPitch(e.target.value)
                  }
                />
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setIsSendModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className={pitchTab === "whatsapp" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-rose-600 hover:bg-rose-700 text-white"}
              onClick={handleConfirmSendMatch}
              disabled={isAiLoading}
            >
              <Send className="w-3.5 h-3.5 mr-1" />
              Dispatch to {customer.firstName}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 3: CANDIDATE FULL BIODATA VIEW */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Verified Candidate Biodata
            </DialogTitle>
            <DialogDescription>
              Comprehensive candidate record from the TDC matchmaking pool.
            </DialogDescription>
          </DialogHeader>

          {viewCandidate && (
            <div className="space-y-4 my-2 text-xs">
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {viewCandidate.firstName} {viewCandidate.lastName}
                  </h3>
                  <p className="text-slate-600 mt-0.5">
                    {viewCandidate.age} yrs • {viewCandidate.heightFormatted} ({viewCandidate.heightCm} cm) • {viewCandidate.gender}
                  </p>
                  <p className="text-slate-500 mt-1">
                    {viewCandidate.city}, {viewCandidate.country} • {viewCandidate.maritalStatus}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 font-medium">Income</span>
                  <p className="text-lg font-bold text-emerald-700">{viewCandidate.incomeFormatted}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="border border-slate-200 rounded-lg p-3 space-y-2">
                  <h5 className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider">Career & Education</h5>
                  <div className="flex justify-between border-b pb-1 text-slate-600">
                    <span>College:</span>
                    <strong className="text-slate-900">{viewCandidate.undergradCollege}</strong>
                  </div>
                  <div className="flex justify-between border-b pb-1 text-slate-600">
                    <span>Degree:</span>
                    <strong className="text-slate-900">{viewCandidate.degree}</strong>
                  </div>
                  <div className="flex justify-between border-b pb-1 text-slate-600">
                    <span>Employer:</span>
                    <strong className="text-slate-900">{viewCandidate.currentCompany}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Role:</span>
                    <strong className="text-slate-900">{viewCandidate.designation}</strong>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg p-3 space-y-2">
                  <h5 className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider">Cultural Background</h5>
                  <div className="flex justify-between border-b pb-1 text-slate-600">
                    <span>Religion:</span>
                    <strong className="text-slate-900">{viewCandidate.religion}</strong>
                  </div>
                  <div className="flex justify-between border-b pb-1 text-slate-600">
                    <span>Caste:</span>
                    <strong className="text-slate-900">{viewCandidate.caste}</strong>
                  </div>
                  <div className="flex justify-between border-b pb-1 text-slate-600">
                    <span>Manglik Status:</span>
                    <strong className="text-slate-900">{viewCandidate.manglikStatus}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Languages:</span>
                    <strong className="text-slate-900">{viewCandidate.languagesKnown.join(", ")}</strong>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg p-3 space-y-2 md:col-span-2">
                  <h5 className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider">Lifestyle & Values</h5>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-1">
                    <div className="bg-slate-50 p-2 rounded border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">Wants Kids</span>
                      <span className="font-bold text-slate-800">{viewCandidate.wantKids}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">Open to Relocate</span>
                      <span className="font-bold text-slate-800">{viewCandidate.openToRelocate}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">Diet</span>
                      <span className="font-bold text-slate-800">{viewCandidate.diet}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">Family Values</span>
                      <span className="font-bold text-slate-800">{viewCandidate.familyValues}</span>
                    </div>
                  </div>
                  <p className="text-slate-600 italic mt-2 pt-2 border-t text-[11px]">&ldquo;{viewCandidate.bio}&rdquo;</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button size="sm" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function CustomerDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-sm text-slate-500">
          Loading customer…
        </div>
      }
    >
      <CustomerDetailContent />
    </Suspense>
  );
}