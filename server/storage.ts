import { 
  interviewSessions, 
  conversationTurns,
  users,
  type InterviewSession, 
  type InsertInterviewSession,
  type ConversationTurn,
  type InsertConversationTurn,
  type User, 
  type InsertUser 
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User methods (legacy)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Interview session methods
  createSession(session: InsertInterviewSession): Promise<InterviewSession>;
  getSession(sessionId: string): Promise<InterviewSession | undefined>;
  getAllSessions(): Promise<InterviewSession[]>;
  updateSession(sessionId: string, updates: Partial<InsertInterviewSession>): Promise<InterviewSession | undefined>;
  
  // Conversation turn methods
  createTurn(turn: InsertConversationTurn): Promise<ConversationTurn>;
  getSessionHistory(sessionId: string): Promise<ConversationTurn[]>;
  getTurn(turnId: string): Promise<ConversationTurn | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Interview session methods
  async createSession(session: InsertInterviewSession): Promise<InterviewSession> {
    const [newSession] = await db
      .insert(interviewSessions)
      .values(session as any)
      .returning();
    return newSession;
  }

  async getSession(sessionId: string): Promise<InterviewSession | undefined> {
    const [session] = await db
      .select()
      .from(interviewSessions)
      .where(eq(interviewSessions.id, sessionId));
    return session || undefined;
  }

  async getAllSessions(): Promise<InterviewSession[]> {
    return await db
      .select()
      .from(interviewSessions)
      .orderBy(desc(interviewSessions.startTime));
  }

  async updateSession(sessionId: string, updates: Partial<InsertInterviewSession>): Promise<InterviewSession | undefined> {
    const [updatedSession] = await db
      .update(interviewSessions)
      .set(updates as any)
      .where(eq(interviewSessions.id, sessionId))
      .returning();
    return updatedSession || undefined;
  }

  // Conversation turn methods
  async createTurn(turn: InsertConversationTurn): Promise<ConversationTurn> {
    const [newTurn] = await db
      .insert(conversationTurns)
      .values(turn as any)
      .returning();
    return newTurn;
  }

  async getSessionHistory(sessionId: string): Promise<ConversationTurn[]> {
    return await db
      .select()
      .from(conversationTurns)
      .where(eq(conversationTurns.sessionId, sessionId))
      .orderBy(conversationTurns.turnNumber);
  }

  async getTurn(turnId: string): Promise<ConversationTurn | undefined> {
    const [turn] = await db
      .select()
      .from(conversationTurns)
      .where(eq(conversationTurns.id, turnId));
    return turn || undefined;
  }
}

export const storage = new DatabaseStorage();
