import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, Hash, User, Bot, Star, ArrowLeft } from "lucide-react";

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

interface ConversationTurn {
  id: string;
  turnNumber: number;
  speaker: "AI" | "User";
  textContent: string;
  feedbackContent?: string;
  timestamp: string;
  metadata?: {
    score?: number;
  };
}

export default function SessionDetails() {
  const [, params] = useRoute("/history/:sessionId");
  const { sessionId } = params || {};

  const { data: session, isLoading: isLoadingSession } = useQuery<Session>({
    queryKey: ["/api/sessions", sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      const response = await apiRequest("GET", `/api/sessions/${sessionId}`);
      return response.json();
    },
    enabled: !!sessionId,
  });

  const { data: history, isLoading: isLoadingHistory } = useQuery<ConversationTurn[]>({
    queryKey: ["/api/sessions", sessionId, "history"],
    queryFn: async () => {
      if (!sessionId) return [];
      const response = await apiRequest("GET", `/api/sessions/${sessionId}/history`);
      return response.json();
    },
    enabled: !!sessionId,
  });

  const isLoading = isLoadingSession || isLoadingHistory;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <p>Loading session details...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <p>Session not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <Link href="/history">
            <Button variant="outline" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to History
            </Button>
          </Link>
        </div>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{session.topic} Interview</CardTitle>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 mt-2">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(session.startTime).toLocaleDateString()} at {new Date(session.startTime).toLocaleTimeString()}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {session.metadata?.duration ? `${session.metadata.duration} minutes` : "N/A"}
              </div>
              {session.metadata?.difficulty && (
                <Badge variant="outline">{session.metadata.difficulty}</Badge>
              )}
              <div className="flex items-center">
                <Hash className="h-4 w-4 mr-1" />
                {session.id.slice(0, 8)}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-lg mb-2">Session Summary</h3>
                <p className="text-slate-600">{session.summary || "No summary available."}</p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex justify-center items-center">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-blue-600">
                      {session.overallScore ? parseFloat(session.overallScore).toFixed(1) : "N/A"}
                    </div>
                    <div className="text-sm text-slate-500">Overall Score</div>
                  </div>
                </div>
                {session.performanceMetrics && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Technical Skills</span>
                      <span className="font-bold">{session.performanceMetrics.technicalScore?.toFixed(1) || "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Communication</span>
                      <span className="font-bold">{session.performanceMetrics.communicationScore?.toFixed(1) || "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Problem Solving</span>
                      <span className="font-bold">{session.performanceMetrics.problemSolvingScore?.toFixed(1) || "N/A"}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <h3 className="font-bold text-xl mb-4">Conversation History</h3>
        <div className="space-y-6">
          {history?.map((turn) => (
            <div key={turn.id}>
              {turn.speaker === "AI" && turn.feedbackContent === null && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="text-white text-sm" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-slate-100 rounded-lg p-4">
                      <p className="text-slate-800 font-medium">Question:</p>
                      <p className="text-slate-800">{turn.textContent}</p>
                    </div>
                  </div>
                </div>
              )}

              {turn.speaker === "User" && (
                <>
                  <div className="flex items-start space-x-3 flex-row-reverse">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="text-white text-sm" />
                    </div>
                    <div className="flex-1 text-right">
                      <div className="bg-blue-600 text-white rounded-lg p-4 inline-block max-w-lg">
                        <p>{turn.textContent}</p>
                      </div>
                    </div>
                  </div>

                  {history.find(t => t.turnNumber === turn.turnNumber + 1)?.feedbackContent && (
                    <div className="mt-2 ml-11">
                      <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <Star className="text-green-600 mr-2 h-4 w-4" />
                          <span className="font-medium text-green-700">Feedback</span>
                          {history.find(t => t.turnNumber === turn.turnNumber + 1)?.metadata?.score && (
                            <span className="ml-2 text-sm text-green-600">
                              Score: {history.find(t => t.turnNumber === turn.turnNumber + 1)?.metadata?.score}/10
                            </span>
                          )}
                        </div>
                        <p className="text-slate-700">{history.find(t => t.turnNumber === turn.turnNumber + 1)?.feedbackContent}</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
          {history?.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-slate-500">
                No conversation history found for this session.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
