import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Mic, Play, Code, Database, Award, Clock, TrendingUp, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Session {
  id: string;
  topic: string;
  startTime: string;
  endTime?: string;
  summary?: string;
  overallScore?: string;
  metadata?: {
    difficulty?: string;
    questionCount?: number;
    duration?: number;
  };
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [selectedTopic, setSelectedTopic] = useState("Full-Stack Developer");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Beginner");
  const { toast } = useToast();

  const { data: sessions = [], isLoading } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
  });

  const createSessionMutation = useMutation({
    mutationFn: async (data: { topic: string; metadata: { difficulty: string } }) => {
      const response = await apiRequest("POST", "/api/sessions", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      setLocation(`/interview/${data.sessionId}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start interview session",
        variant: "destructive",
      });
    },
  });

  const handleStartInterview = () => {
    createSessionMutation.mutate({
      topic: selectedTopic,
      metadata: { difficulty: selectedDifficulty }
    });
  };

  const recentSessions = sessions.slice(0, 3);
  const totalSessions = sessions.length;
  const practiceTime = sessions.reduce((total, session) => {
    return total + (session.metadata?.duration || 0);
  }, 0);
  const averageScore = sessions.length > 0 
    ? sessions.reduce((sum, session) => sum + parseFloat(session.overallScore || "0"), 0) / sessions.length
    : 0;

  const getTopicIcon = (topic: string) => {
    if (topic.toLowerCase().includes("backend") || topic.toLowerCase().includes("database")) {
      return <Database className="text-blue-600" />;
    }
    return <Code className="text-green-600" />;
  };

  const getScoreColor = (score: string) => {
    const numScore = parseFloat(score);
    if (numScore >= 8) return "text-green-600";
    if (numScore >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Mic className="text-blue-600 text-2xl mr-3" />
              <span className="text-xl font-bold text-slate-900">InterviewAI</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/dashboard" className="text-slate-600 hover:text-blue-600 transition-colors">
                Dashboard
              </Link>
              <Link href="/history" className="text-slate-600 hover:text-blue-600 transition-colors">
                History
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">JS</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
            <p className="text-blue-100 text-lg">Ready to practice your interview skills?</p>
            <div className="mt-6 flex flex-wrap gap-4">
              <div className="bg-white/20 rounded-lg p-4 flex-1 min-w-48">
                <div className="text-2xl font-bold">{totalSessions}</div>
                <div className="text-sm text-blue-100">Total Sessions</div>
              </div>
              <div className="bg-white/20 rounded-lg p-4 flex-1 min-w-48">
                <div className="text-2xl font-bold">{Math.round(practiceTime / 60)}h</div>
                <div className="text-sm text-blue-100">Practice Time</div>
              </div>
              <div className="bg-white/20 rounded-lg p-4 flex-1 min-w-48">
                <div className="text-2xl font-bold">{averageScore.toFixed(1)}/10</div>
                <div className="text-sm text-blue-100">Avg. Performance</div>
              </div>
            </div>
          </div>

          {/* Quick Start Section */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6">Start New Interview</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Interview Topic</label>
                  <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-Stack Developer">Full-Stack Developer</SelectItem>
                      <SelectItem value="Frontend Developer">Frontend Developer</SelectItem>
                      <SelectItem value="Backend Developer">Backend Developer</SelectItem>
                      <SelectItem value="DevOps Engineer">DevOps Engineer</SelectItem>
                      <SelectItem value="Data Scientist">Data Scientist</SelectItem>
                      <SelectItem value="Product Manager">Product Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Difficulty Level</label>
                  <div className="flex space-x-3">
                    {["Beginner", "Intermediate", "Advanced"].map((level) => (
                      <Button
                        key={level}
                        variant={selectedDifficulty === level ? "default" : "outline"}
                        onClick={() => setSelectedDifficulty(level)}
                        className="flex-1"
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button 
                  onClick={handleStartInterview}
                  disabled={createSessionMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Play className="mr-2 h-4 w-4" />
                  {createSessionMutation.isPending ? "Starting..." : "Start Interview"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Sessions */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Recent Sessions</h3>
                <Link href="/history" className="text-blue-600 hover:text-blue-700 font-medium">
                  View All
                </Link>
              </div>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-slate-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : recentSessions.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Award className="mx-auto h-12 w-12 mb-4 text-slate-300" />
                  <p>No interview sessions yet. Start your first interview above!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentSessions.map((session) => (
                    <Link
                      key={session.id}
                      href={`/history`}
                      className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          {getTopicIcon(session.topic)}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{session.topic}</div>
                          <div className="text-sm text-slate-500">
                            {new Date(session.startTime).toLocaleDateString()} • 
                            {session.metadata?.duration ? ` ${session.metadata.duration} minutes` : ' Duration unknown'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className={`text-sm font-medium ${getScoreColor(session.overallScore || "0")}`}>
                            {session.overallScore ? `${session.overallScore}/10` : "N/A"}
                          </div>
                          <div className="text-xs text-slate-500">Performance</div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
