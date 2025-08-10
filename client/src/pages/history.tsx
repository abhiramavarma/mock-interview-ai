import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, Database, Code, Award, Clock, Calendar } from "lucide-react";

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
  performanceMetrics?: {
    technicalScore?: number;
    communicationScore?: number;
    problemSolvingScore?: number;
  };
}

export default function History() {
  const [topicFilter, setTopicFilter] = useState("All Topics");
  const [timeFilter, setTimeFilter] = useState("Last 30 days");

  const { data: sessions = [], isLoading: isLoadingSessions } = useQuery<Session[]>({
    queryKey: ["/api/sessions", { topic: topicFilter, time: timeFilter }],
    queryFn: async ({ queryKey }) => {
      const [, params] = queryKey;
      const searchParams = new URLSearchParams(params as Record<string, string>);
      const response = await apiRequest("GET", `/api/sessions?${searchParams}`);
      return response.json();
    },
  });

  const { data: topics = [], isLoading: isLoadingTopics } = useQuery<string[]>({
    queryKey: ["/api/topics"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/topics");
      return response.json();
    },
  });

  const isLoading = isLoadingSessions || isLoadingTopics;

  const getTopicIcon = (topic: string) => {
    if (topic.toLowerCase().includes("backend") || topic.toLowerCase().includes("database")) {
      return <Database className="text-blue-600 h-5 w-5" />;
    }
    return <Code className="text-green-600 h-5 w-5" />;
  };

  const getScoreColor = (score: string) => {
    const numScore = parseFloat(score);
    if (numScore >= 8) return "text-green-600";
    if (numScore >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
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
              <Link href="/history" className="text-blue-600 font-medium">
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
        <div className="space-y-6">
          {/* Header with Filters */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Interview History</h2>
            <div className="flex space-x-3">
              <Select value={topicFilter} onValueChange={setTopicFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Topics">All Topics</SelectItem>
                  {topics.map(topic => (
                    <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Last 7 days">Last 7 days</SelectItem>
                  <SelectItem value="Last 30 days">Last 30 days</SelectItem>
                  <SelectItem value="Last 3 months">Last 3 months</SelectItem>
                  <SelectItem value="All time">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Session Cards */}
          {isLoading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
                      <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                      <div className="grid grid-cols-3 gap-4">
                        {[...Array(3)].map((_, j) => (
                          <div key={j} className="h-16 bg-slate-200 rounded"></div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Award className="mx-auto h-16 w-16 text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No interview sessions found</h3>
                <p className="text-slate-500 mb-6">
                  {sessions.length === 0 
                    ? "Start your first interview to see your history here."
                    : "Try adjusting your filters to see more sessions."}
                </p>
                <Link href="/dashboard">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Start New Interview
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {sessions.map((session) => (
                <Card key={session.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{session.topic} Interview</h3>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-slate-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(session.startTime).toLocaleDateString()} at{" "}
                            {new Date(session.startTime).toLocaleTimeString()}
                          </div>
                          <span>•</span>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {session.metadata?.duration 
                              ? formatDuration(session.metadata.duration)
                              : "Duration unknown"}
                          </div>
                          <span>•</span>
                          <span>{session.metadata?.questionCount || 0} questions</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getScoreColor(session.overallScore || "0")}`}>
                            {session.overallScore ? parseFloat(session.overallScore).toFixed(1) : "N/A"}
                          </div>
                          <div className="text-xs text-slate-500">Overall Score</div>
                        </div>
                        <Link href={`/history/${session.id}`}>
                          <Button variant="outline">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    {session.performanceMetrics && (
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-slate-50 rounded-lg p-3">
                          <div className="text-sm text-slate-600">Communication</div>
                          <div className="text-lg font-bold text-green-600">
                            {session.performanceMetrics.communicationScore?.toFixed(1) || "N/A"}
                          </div>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3">
                          <div className="text-sm text-slate-600">Technical Skills</div>
                          <div className="text-lg font-bold text-blue-600">
                            {session.performanceMetrics.technicalScore?.toFixed(1) || "N/A"}
                          </div>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3">
                          <div className="text-sm text-slate-600">Problem Solving</div>
                          <div className="text-lg font-bold text-yellow-600">
                            {session.performanceMetrics.problemSolvingScore?.toFixed(1) || "N/A"}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Summary */}
                    {session.summary && (
                      <div className="border-t border-slate-200 pt-4">
                        <h4 className="font-medium text-slate-900 mb-2">Session Summary</h4>
                        <p className="text-sm text-slate-600">{session.summary}</p>
                      </div>
                    )}

                    {!session.endTime && (
                      <div className="border-t border-slate-200 pt-4">
                        <div className="flex items-center text-sm text-yellow-600">
                          <Clock className="h-4 w-4 mr-2" />
                          This session is still in progress
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
