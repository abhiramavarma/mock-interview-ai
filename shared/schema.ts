import { pgTable, text, uuid, timestamp, integer, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const interviewSessions = pgTable("interview_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  startTime: timestamp("start_time", { withTimezone: true }).defaultNow().notNull(),
  endTime: timestamp("end_time", { withTimezone: true }),
  topic: text("topic").notNull(),
  summary: text("summary"),
  overallScore: decimal("overall_score", { precision: 3, scale: 1 }),
  metadata: jsonb("metadata").$type<{
    difficulty?: string;
    questionCount?: number;
    duration?: number;
  }>()
});

export const conversationTurns = pgTable("conversation_turns", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").notNull().references(() => interviewSessions.id, { onDelete: "cascade" }),
  turnNumber: integer("turn_number").notNull(),
  speaker: text("speaker").notNull(), // 'AI' or 'User'
  textContent: text("text_content").notNull(),
  feedbackContent: text("feedback_content"),
  timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow().notNull(),
  metadata: jsonb("metadata").$type<{
    score?: number;
    duration?: number;
    confidence?: number;
  }>()
});

export const interviewSessionsRelations = relations(interviewSessions, ({ many }) => ({
  conversationTurns: many(conversationTurns)
}));

export const conversationTurnsRelations = relations(conversationTurns, ({ one }) => ({
  session: one(interviewSessions, {
    fields: [conversationTurns.sessionId],
    references: [interviewSessions.id]
  })
}));

export const insertInterviewSessionSchema = createInsertSchema(interviewSessions).omit({
  id: true,
  startTime: true
});

export const insertConversationTurnSchema = createInsertSchema(conversationTurns).omit({
  id: true,
  timestamp: true
});

export type InsertInterviewSession = z.infer<typeof insertInterviewSessionSchema>;
export type InterviewSession = typeof interviewSessions.$inferSelect;
export type InsertConversationTurn = z.infer<typeof insertConversationTurnSchema>;
export type ConversationTurn = typeof conversationTurns.$inferSelect;

// Legacy user schema (keeping for compatibility)
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
