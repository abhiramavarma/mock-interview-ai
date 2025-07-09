import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Mic, MicOff, Send, X, User, Bot, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

interface Session {
  id: string;
  topic: string;
  startTime: string;
  endTime?: string;
}

export default function Interview() {
  const [, params] = useRoute("/interview/:sessionId");
  const [, setLocation] = useLocation();
  const { sessionId } = params || {};
  
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [recognition, setRecognition] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = "en-US";
      
      recognitionInstance.onresult = (event: any) => {
        let finalTranscript = "";
        let interimTranscript = "";
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        setTranscription(finalTranscript + interimTranscript);
      };
      
      recognitionInstance.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
        setIsTranscribing(false);
        toast({
          title: "Speech Recognition Error",
          description: "Please try again or type your answer manually.",
          variant: "destructive",
        });
      };
      
      recognitionInstance.onend = () => {
        setIsRecording(false);
        setIsTranscribing(false);
      };
      
      setRecognition(recognitionInstance);
    } else {
      toast({
        title: "Speech Recognition Not Available",
        description: "Please use a supported browser or type your answers manually.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const { data: session } = useQuery<Session>({
    queryKey: ["/api/sessions", sessionId],
    enabled: !!sessionId,
  });

  const { data: history = [], refetch: refetchHistory } = useQuery<ConversationTurn[]>({
    queryKey: ["/api/sessions", sessionId, "history"],
    enabled: !!sessionId,
  });

  // Generate initial question when session loads
  const generateQuestionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/sessions/${sessionId}/question`, {});
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentQuestion(data.question);
    },
  });

  const submitAnswerMutation = useMutation({
    mutationFn: async (data: { question: string; answer: string }) => {
      // First, save the user's answer
      await apiRequest("POST", `/api/sessions/${sessionId}/turn`, {
        turnNumber: history.length + 1,
        speaker: "User",
        textContent: data.answer,
      });

      // Get AI feedback
      const feedbackResponse = await apiRequest("POST", `/api/sessions/${sessionId}/feedback`, {
        question: data.question,
        answer: data.answer,
      });
      const feedback = await feedbackResponse.json();

      // Save AI question and feedback
      await apiRequest("POST", `/api/sessions/${sessionId}/turn`, {
        turnNumber: history.length + 2,
        speaker: "AI",
        textContent: data.question,
        feedbackContent: feedback.feedback,
        metadata: { score: feedback.score },
      });

      return feedback;
    },
    onSuccess: () => {
      refetchHistory();
      setTranscription("");
      // Generate next question
      generateQuestionMutation.mutate();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit answer",
        variant: "destructive",
      });
    },
  });

  const endSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PUT", `/api/sessions/${sessionId}/end`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      setLocation("/history");
    },
  });

  // Generate initial question when component mounts
  useEffect(() => {
    if (sessionId && history.length === 0 && !currentQuestion) {
      generateQuestionMutation.mutate();
    }
  }, [sessionId, history.length, currentQuestion]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, currentQuestion]);

  const toggleRecording = () => {
    if (!recognition) {
      toast({
        title: "Speech Recognition Not Available",
        description: "Please type your answer manually.",
        variant: "destructive",
      });
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
      setIsTranscribing(false);
    } else {
      setTranscription("");
      recognition.start();
      setIsRecording(true);
      setIsTranscribing(true);
    }
  };

  const handleSubmitAnswer = () => {
    if (!transcription.trim()) {
      toast({
        title: "No Answer",
        description: "Please provide an answer before submitting.",
        variant: "destructive",
      });
      return;
    }

    submitAnswerMutation.mutate({
      question: currentQuestion,
      answer: transcription.trim(),
    });
  };

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No session ID provided</p>
      </div>
    );
  }

  const questionCount = Math.floor(history.length / 2) + (currentQuestion ? 1 : 0);
  const progress = Math.min((questionCount / 10) * 100, 100);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Interview Header */}
      <Card className="m-6">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">{session?.topic || "Loading..."} Interview</h2>
              <div className="flex items-center space-x-4 mt-2 text-sm text-slate-500">
                <span>Session #{sessionId?.slice(-8)}</span>
                <span>•</span>
                <span>Started {session ? new Date(session.startTime).toLocaleTimeString() : "..."}</span>
                <span>•</span>
                <span>Question {questionCount} of ~10</span>
              </div>
            </div>
            <Button 
              variant="destructive"
              onClick={() => endSessionMutation.mutate()}
              disabled={endSessionMutation.isPending}
            >
              End Interview
            </Button>
          </div>
          <div className="mt-4 w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="mx-6 mb-6">
        <div className="h-96 overflow-y-auto p-6 space-y-4">
          {history.map((turn) => (
            <div key={turn.id}>
              {turn.speaker === "AI" ? (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="text-white text-sm" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-slate-100 rounded-lg p-4">
                      <p className="text-slate-800">{turn.textContent}</p>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      AI • {new Date(turn.timestamp).toLocaleTimeString()}
                    </div>
                    {turn.feedbackContent && (
                      <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 mt-2">
                        <div className="flex items-center mb-2">
                          <Star className="text-green-600 mr-2 h-4 w-4" />
                          <span className="font-medium text-green-700">Feedback</span>
                          {turn.metadata?.score && (
                            <span className="ml-2 text-sm text-green-600">
                              Score: {turn.metadata.score}/10
                            </span>
                          )}
                        </div>
                        <p className="text-slate-700">{turn.feedbackContent}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-start space-x-3 flex-row-reverse">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="text-white text-sm" />
                  </div>
                  <div className="flex-1 text-right">
                    <div className="bg-blue-600 text-white rounded-lg p-4 inline-block max-w-md">
                      <p>{turn.textContent}</p>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      You • {new Date(turn.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Current Question */}
          {currentQuestion && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="text-white text-sm" />
              </div>
              <div className="flex-1">
                <div className="bg-slate-100 rounded-lg p-4">
                  <p className="text-slate-800">{currentQuestion}</p>
                </div>
                <div className="text-xs text-slate-500 mt-1">AI • Just now</div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-200 p-4 bg-slate-50">
          <div className="flex items-center space-x-4">
            <Button
              onClick={toggleRecording}
              className={`w-12 h-12 rounded-full ${
                isRecording 
                  ? "bg-red-600 hover:bg-red-700 animate-pulse" 
                  : "bg-red-600 hover:bg-red-700"
              }`}
              disabled={!currentQuestion}
            >
              {isRecording ? <MicOff className="text-white" /> : <Mic className="text-white" />}
            </Button>
            <div className="flex-1">
              <div className="min-h-12 bg-white border border-slate-300 rounded-lg p-3">
                {transcription ? (
                  <span className="text-slate-800">{transcription}</span>
                ) : (
                  <span className="text-slate-400 italic">
                    {isTranscribing ? "🔴 Recording... Speak now" : "Click the microphone to start speaking..."}
                  </span>
                )}
              </div>
            </div>
            <Button
              onClick={handleSubmitAnswer}
              disabled={!transcription.trim() || submitAnswerMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="mr-2 h-4 w-4" />
              {submitAnswerMutation.isPending ? "Submitting..." : "Submit"}
            </Button>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center">
            <span className="mr-1">💡</span>
            Speak clearly and wait for the transcription to complete before submitting
          </div>
        </div>
      </Card>
    </div>
  );
}
