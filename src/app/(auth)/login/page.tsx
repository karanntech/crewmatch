"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DEMO_CREDENTIALS, AUTH_COOKIE_NAME } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { HeartHandshake, Lock, Mail, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState(DEMO_CREDENTIALS.username);
  const [password, setPassword] = useState(DEMO_CREDENTIALS.password);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (username === DEMO_CREDENTIALS.username && password === DEMO_CREDENTIALS.password) {
      // Set simple session cookie expiring in 7 days
      document.cookie = `${AUTH_COOKIE_NAME}=authenticated; path=/; max-age=604800; SameSite=Lax`;
      router.push("/");
      router.refresh();
    } else {
      setError("Invalid credentials. Please use the pre-filled demo login.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-rose-100 rounded-full text-rose-600 mb-2">
            <HeartHandshake className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">The Date Crew</h1>
          <p className="text-sm text-slate-600">Matchmaker Portal & Matching MVP</p>
        </div>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Matchmaker Login</CardTitle>
            <CardDescription>
              Sign in with your internal staff credentials to manage clients and generate matches.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Work Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    required
                    className="pl-9"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    required
                    className="pl-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="rounded-md bg-amber-50 p-3 border border-amber-200">
                <p className="text-xs font-semibold text-amber-800">Reviewer Sample Credentials:</p>
                <p className="text-xs text-amber-700 mt-1">Username: <span className="font-mono font-medium">{DEMO_CREDENTIALS.username}</span></p>
                <p className="text-xs text-amber-700">Password: <span className="font-mono font-medium">{DEMO_CREDENTIALS.password}</span></p>
              </div>
            </CardContent>

            <CardFooter>
              <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800" disabled={loading}>
                {loading ? "Authenticating..." : "Sign In to Dashboard"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}