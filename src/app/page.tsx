"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import assignedData from "@/data/assigned-customers.json";
import { Customer, ClientStage } from "@/lib/types";
import { AUTH_COOKIE_NAME, DEMO_CREDENTIALS } from "@/lib/auth";
import { 
  HeartHandshake, 
  Search, 
  Filter, 
  MapPin, 
  Briefcase, 
  ChevronRight, 
  LogOut, 
  Users, 
  Sparkles, 
  Clock 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STAGES: (ClientStage | "All")[] = [
  "All",
  "Onboarding",
  "Active Search",
  "Match Review",
  "Introduction Sent",
  "Follow-up Scheduled",
  "Closed / Matched",
];

const STAGE_COLORS: Record<ClientStage, string> = {
  "Onboarding": "bg-slate-100 text-slate-800 border-slate-300",
  "Active Search": "bg-blue-50 text-blue-700 border-blue-200",
  "Match Review": "bg-purple-50 text-purple-700 border-purple-200",
  "Introduction Sent": "bg-amber-50 text-amber-700 border-amber-200",
  "Follow-up Scheduled": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Closed / Matched": "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function DashboardPage() {
  const router = useRouter();
  const [customers] = useState<Customer[]>(assignedData as Customer[]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState<ClientStage | "All">("All");

  const handleLogout = () => {
    document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
    router.push("/login");
    router.refresh();
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.designation.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStage = selectedStage === "All" || customer.stage === selectedStage;

    return matchesSearch && matchesStage;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">The Date Crew</h1>
              <p className="text-xs text-slate-500 font-medium">Matchmaker Operations Dashboard</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-800">{DEMO_CREDENTIALS.name}</p>
              <p className="text-xs text-slate-500">{DEMO_CREDENTIALS.role}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-slate-600 hover:text-rose-600 border-slate-300 hover:border-rose-200 hover:bg-rose-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-6">
        {/* Metric Summaries */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Assigned Clients</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{customers.length}</p>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                <Users className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Search</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {customers.filter((c) => c.stage === "Active Search").length}
                </p>
              </div>
              <div className="p-3 bg-rose-50 text-rose-600 rounded-full">
                <Sparkles className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Match Review</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {customers.filter((c) => c.stage === "Match Review").length}
                </p>
              </div>
              <div className="p-3 bg-purple-50 text-purple-600 rounded-full">
                <Clock className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by client name, city, job..."
              className="pl-9 bg-slate-50 border-slate-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
            <div className="flex gap-1.5 flex-nowrap">
              {STAGES.map((stage) => (
                <button
                  key={stage}
                  onClick={() => setSelectedStage(stage)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                    selectedStage === stage
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {stage}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Customer Directory List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-semibold text-slate-800">
              Assigned Customer Profiles ({filteredCustomers.length})
            </h2>
            <span className="text-xs text-slate-500">Click a customer to launch Matchmaker Workspace</span>
          </div>

          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-medium text-slate-600">No customers found</p>
              <p className="text-xs text-slate-400 mt-1">Try resetting your search query or stage filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredCustomers.map((customer) => (
                <Link
                  key={customer.id}
                  href={`/customers/${customer.id}`}
                  className="block group transition-all"
                >
                  <Card className="border-slate-200 hover:border-rose-300 hover:shadow-md transition-all">
                    <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left: Basic Info */}
                      <div className="flex items-start sm:items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-base shrink-0 group-hover:bg-rose-50 group-hover:text-rose-600 group-hover:border-rose-200 transition-colors">
                          {customer.firstName[0]}
                          {customer.lastName[0]}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h3 className="font-semibold text-slate-900 text-base group-hover:text-rose-600 transition-colors">
                              {customer.firstName} {customer.lastName}
                            </h3>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs font-medium text-slate-600">
                              {customer.age} yrs ({customer.gender})
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-[11px] font-medium px-2 py-0.5 border ${
                                STAGE_COLORS[customer.stage]
                              }`}
                            >
                              {customer.stage}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {customer.city}, {customer.country}
                            </span>
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                              {customer.designation} at {customer.currentCompany}
                            </span>
                            <span>Marital Status: <strong className="text-slate-700">{customer.maritalStatus}</strong></span>
                            <span>Height: <strong className="text-slate-700">{customer.heightFormatted}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Income & CTA */}
                      <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                        <div className="text-left md:text-right">
                          <p className="text-xs text-slate-400">Annual Income</p>
                          <p className="text-sm font-semibold text-slate-800">{customer.incomeFormatted}</p>
                        </div>
                        <div className="flex items-center text-xs font-semibold text-rose-600 group-hover:translate-x-0.5 transition-transform">
                          <span>Matchmaker View</span>
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}