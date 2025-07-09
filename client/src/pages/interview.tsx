import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Mic, MicOff, Send, X, User, Bot, Star, Keyboard, Volume2 } from "lucide-react";
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
  const [inputMode, setInputMode] = useState<"speech" | "text">("speech");
  const [manualText, setManualText] = useState("");
  const [speechSupported, setSpeechSupported] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check for both webkit and standard Speech Recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        
        // Improved configuration for better recognition
        recognitionInstance.continuous = false; // Changed to false for better reliability
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = "en-US";
        recognitionInstance.maxAlternatives = 1;
        
        recognitionInstance.onstart = () => {
          console.log("Speech recognition started");
          setIsTranscribing(true);
        };
        
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
          
          // Update transcription with both final and interim results
          const fullTranscript = (transcription + finalTranscript + interimTranscript).trim();
          setTranscription(fullTranscript);
          
          // If we have final results, add them to our permanent transcription
          if (finalTranscript) {
            setTranscription(prev => (prev + " " + finalTranscript).trim());
          }
        };
        
        recognitionInstance.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsRecording(false);
          setIsTranscribing(false);
          
          let errorMessage = "Please try again or switch to text input.";
          switch (event.error) {
            case "not-allowed":
              errorMessage = "Microphone access denied. Please allow microphone access and try again.";
              break;
            case "no-speech":
              errorMessage = "No speech detected. Please speak clearly and try again.";
              break;
            case "audio-capture":
              errorMessage = "No microphone found. Please check your microphone and try again.";
              break;
            case "network":
              errorMessage = "Network error. Please check your connection and try again.";
              break;
          }
          
          toast({
            title: "Speech Recognition Error",
            description: errorMessage,
            variant: "destructive",
          });
        };
        
        recognitionInstance.onend = () => {
          console.log("Speech recognition ended");
          setIsRecording(false);
          setIsTranscribing(false);
        };
        
        setRecognition(recognitionInstance);
        setSpeechSupported(true);
        console.log("Speech recognition initialized successfully");
      } else {
        setSpeechSupported(false);
        setInputMode("text");
        console.log("Speech recognition not supported in this browser");
      }
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
      setManualText("");
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
    if (!recognition || !speechSupported) {
      toast({
        title: "Speech Recognition Not Available",
        description: "Please use text input instead.",
        variant: "destructive",
      });
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
      setIsTranscribing(false);
    } else {
      // Clear previous transcription and start fresh
      setTranscription("");
      try {
        recognition.start();
        setIsRecording(true);
        console.log("Starting speech recognition...");
      } catch (error) {
        console.error("Failed to start speech recognition:", error);
        toast({
          title: "Speech Recognition Error",
          description: "Could not start microphone. Please try text input instead.",
          variant: "destructive",
        });
      }
    }
  };

  const switchInputMode = (mode: "speech" | "text") => {
    if (isRecording) {
      recognition?.stop();
    }
    setInputMode(mode);
    setTranscription("");
    setManualText("");
  };

  const handleSubmitAnswer = () => {
    const answer = inputMode === "speech" ? transcription.trim() : manualText.trim();
    
    if (!answer) {
      toast({
        title: "No Answer",
        description: "Please provide an answer before submitting.",
        variant: "destructive",
      });
      return;
    }

    submitAnswerMutation.mutate({
      question: currentQuestion,
      answer: answer,
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
          {/* Input Mode Toggle */}
          <div className="flex justify-center mb-4">
            <div className="flex bg-slate-200 rounded-lg p-1">
              <Button
                variant={inputMode === "speech" ? "default" : "ghost"}
                size="sm"
                onClick={() => switchInputMode("speech")}
                disabled={!speechSupported}
                className="flex items-center space-x-2"
              >
                <Mic className="h-4 w-4" />
                <span>Voice</span>
                {!speechSupported && <Badge variant="secondary" className="ml-1 text-xs">Not Available</Badge>}
              </Button>
              <Button
                variant={inputMode === "text" ? "default" : "ghost"}
                size="sm"
                onClick={() => switchInputMode("text")}
                className="flex items-center space-x-2"
              >
                <Keyboard className="h-4 w-4" />
                <span>Type</span>
              </Button>
            </div>
          </div>

          {/* Voice Input Mode */}
          {inputMode === "speech" && (
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={toggleRecording}
                  className={`w-12 h-12 rounded-full ${
                    isRecording 
                      ? "bg-red-600 hover:bg-red-700 animate-pulse" 
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                  disabled={!currentQuestion || !speechSupported}
                >
                  {isRecording ? <MicOff className="text-white" /> : <Mic className="text-white" />}
                </Button>
                <div className="flex-1">
                  <div className="min-h-12 bg-white border border-slate-300 rounded-lg p-3">
                    {transcription ? (
                      <span className="text-slate-800">{transcription}</span>
                    ) : (
                      <span className="text-slate-400 italic">
                        {isTranscribing ? "🔴 Recording... Speak now" : speechSupported ? "Click the microphone to start speaking..." : "Speech recognition not available in this browser"}
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
              <div className="text-xs text-slate-500 flex items-center">
                <Volume2 className="mr-1 h-3 w-3" />
                {speechSupported ? "Speak clearly and wait for the transcription to complete before submitting" : "Voice input is not available in this browser. Please use text input instead."}
              </div>
            </div>
          )}

          {/* Text Input Mode */}
          {inputMode === "text" && (
            <div className="space-y-3">
              <div className="flex items-end space-x-4">
                <div className="flex-1">
                  <Textarea
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    placeholder="Type your answer here..."
                    className="min-h-[80px] resize-none"
                    disabled={!currentQuestion}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.shiftKey === false) {
                        e.preventDefault();
                        if (manualText.trim() && !submitAnswerMutation.isPending) {
                          handleSubmitAnswer();
                        }
                      }
                    }}
                  />
                </div>
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={!manualText.trim() || submitAnswerMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 h-[80px]"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {submitAnswerMutation.isPending ? "Submitting..." : "Submit"}
                </Button>
              </div>
              <div className="text-xs text-slate-500 flex items-center">
                <Keyboard className="mr-1 h-3 w-3" />
                Press Enter to submit your answer, or Shift+Enter for new line
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
