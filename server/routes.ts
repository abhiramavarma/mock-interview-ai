import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertInterviewSessionSchema, insertConversationTurnSchema } from "@shared/schema";
import { z } from "zod";
import { geminiService } from "./services/gemini";

export async function registerRoutes(app: Express): Promise<Server> {
  // CORS middleware
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // POST /api/sessions - Start a new interview session
  app.post("/api/sessions", async (req, res) => {
    try {
      const validatedData = insertInterviewSessionSchema.parse(req.body);
      const session = await storage.createSession(validatedData);
      
      res.json({ sessionId: session.id });
    } catch (error) {
      console.error("Error creating session:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Invalid request data", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ message: "Failed to create session" });
      }
    }
  });

  // POST /api/sessions/:sessionId/turn - Save a new conversation turn
  app.post("/api/sessions/:sessionId/turn", async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      // Verify session exists
      const session = await storage.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      const turnData = {
        ...req.body,
        sessionId
      };
      
      const validatedData = insertConversationTurnSchema.parse(turnData);
      const turn = await storage.createTurn(validatedData);
      
      res.json({ success: true, turnId: turn.id });
    } catch (error) {
      console.error("Error creating turn:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Invalid request data", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ message: "Failed to create turn" });
      }
    }
  });

  // GET /api/sessions - Retrieve all past interview sessions
  app.get("/api/sessions", async (req, res) => {
    try {
      const querySchema = z.object({
        topic: z.string().optional(),
        time: z.string().optional(),
      });
      const { topic, time } = querySchema.parse(req.query);

      const sessions = await storage.getAllSessions({ topic, time });
      
      const sessionSummaries = sessions.map(session => ({
        id: session.id,
        topic: session.topic,
        startTime: session.startTime,
        endTime: session.endTime,
        summary: session.summary,
        overallScore: session.overallScore,
        metadata: session.metadata,
        performanceMetrics: session.performanceMetrics
      }));
      
      res.json(sessionSummaries);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Invalid query parameters",
          errors: error.errors
        });
      } else {
        res.status(500).json({ message: "Failed to fetch sessions" });
      }
    }
  });

  // GET /api/topics - Retrieve all unique interview topics
  app.get("/api/topics", async (_req, res) => {
    try {
      const topics = await storage.getAllTopics();
      res.json(topics);
    } catch (error) {
      console.error("Error fetching topics:", error);
      res.status(500).json({ message: "Failed to fetch topics" });
    }
  });

  // GET /api/sessions/:sessionId - Retrieve a single interview session
  app.get("/api/sessions/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = await storage.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      console.error("Error fetching session:", error);
      res.status(500).json({ message: "Failed to fetch session" });
    }
  });

  // GET /api/sessions/:sessionId/history - Retrieve conversation history for a session
  app.get("/api/sessions/:sessionId/history", async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      // Verify session exists
      const session = await storage.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      const history = await storage.getSessionHistory(sessionId);
      
      res.json(history);
    } catch (error) {
      console.error("Error fetching session history:", error);
      res.status(500).json({ message: "Failed to fetch session history" });
    }
  });

  // POST /api/sessions/:sessionId/question - Generate next AI question
  app.post("/api/sessions/:sessionId/question", async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      const session = await storage.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      const history = await storage.getSessionHistory(sessionId);
      const question = await geminiService.generateQuestion(session.topic, history);
      
      res.json({ question });
    } catch (error) {
      console.error("Error generating question:", error);
      res.status(500).json({ message: "Failed to generate question" });
    }
  });

  // POST /api/sessions/:sessionId/feedback - Generate AI feedback for user answer
  app.post("/api/sessions/:sessionId/feedback", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { question, answer } = req.body;
      
      if (!question || !answer) {
        return res.status(400).json({ message: "Question and answer are required" });
      }

      const session = await storage.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      const history = await storage.getSessionHistory(sessionId);
      const feedback = await geminiService.generateFeedback(question, answer, session.topic, history);
      
      res.json(feedback);
    } catch (error) {
      console.error("Error generating feedback:", error);
      res.status(500).json({ message: "Failed to generate feedback" });
    }
  });

  // PUT /api/sessions/:sessionId/end - End an interview session
  app.put("/api/sessions/:sessionId/end", async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      const session = await storage.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      const history = await storage.getSessionHistory(sessionId);
      const summary = await geminiService.generateSessionSummary(session.topic, history);
      console.log("Generated summary from Gemini:", JSON.stringify(summary, null, 2));
      
      const updatedSession = await storage.updateSession(sessionId, {
        endTime: new Date(),
        summary: summary.summary,
        overallScore: summary.overallScore.toString(),
        performanceMetrics: {
          technicalScore: summary.technicalScore,
          communicationScore: summary.communicationScore,
          problemSolvingScore: summary.problemSolvingScore,
        }
      });
      console.log("Updated session from DB:", JSON.stringify(updatedSession, null, 2));
      
      res.json({ success: true, session: updatedSession });
    } catch (error) {
      console.error("Error ending session:", error);
      res.status(500).json({ message: "Failed to end session" });
    }
  });

  const httpServer = createServer(app);

  if (app.get("env") === "development") {
    app.post("/api/testing/clear-database", async (_req, res) => {
      try {
        await storage.clearDatabase();
        res.json({ success: true, message: "Database cleared successfully" });
      } catch (error) {
        console.error("Error clearing database:", error);
        res.status(500).json({ message: "Failed to clear database" });
      }
    });
  }

  return httpServer;
}
