import { GoogleGenAI } from "@google/genai";
import type { ConversationTurn } from "@shared/schema";

// Using Gemini 2.5 Flash as requested by the user
const genai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || ""
});

export class GeminiService {
  async generateQuestion(topic: string, conversationHistory: ConversationTurn[]): Promise<string> {
    try {
      const historyContext = conversationHistory.length > 0 
        ? conversationHistory.map(turn => 
            `${turn.speaker}: ${turn.textContent}${turn.feedbackContent ? `\nFeedback: ${turn.feedbackContent}` : ''}`
          ).join('\n\n')
        : "This is the start of the interview.";

      const prompt = `You are conducting a mock interview for a ${topic} position. 

Previous conversation:
${historyContext}

Generate the next interview question that:
1. Is relevant to the ${topic} role
2. Builds naturally on the conversation so far
3. Tests both technical knowledge and problem-solving skills
4. Is clear and specific
5. Allows for a comprehensive answer

If this is the first question, start with an engaging opening question that sets a positive tone.

Respond with only the question, no additional text.`;

      const response = await genai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      return response.text?.trim() || "Tell me about yourself and why you're interested in this position.";
    } catch (error) {
      console.error("Error generating question:", error);
      // Fallback question
      return `Tell me about a challenging ${topic.toLowerCase()} project you've worked on recently.`;
    }
  }

  async generateFeedback(
    question: string, 
    answer: string, 
    topic: string, 
    conversationHistory: ConversationTurn[]
  ): Promise<{ feedback: string; score: number; strengths: string[]; improvements: string[]; followUpQuestion?: string }> {
    try {
      const prompt = `You are evaluating an interview answer for a ${topic} position.

Question: ${question}
Answer: ${answer}

Provide constructive feedback that:
1. Highlights what was done well
2. Identifies areas for improvement
3. Gives specific, actionable advice
4. Maintains an encouraging tone
5. Assigns a score from 1-10

Respond in JSON format:
{
  "feedback": "detailed feedback text",
  "score": numeric_score_1_to_10,
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"]
}`;

      const response = await genai.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              feedback: { type: "string" },
              score: { type: "number" },
              strengths: { type: "array", items: { type: "string" } },
              improvements: { type: "array", items: { type: "string" } }
            },
            required: ["feedback", "score"]
          }
        },
        contents: prompt,
      });

      const result = JSON.parse(response.text || "{}");
      
      return {
        feedback: result.feedback || "Good answer! Keep practicing to improve further.",
        score: Math.max(1, Math.min(10, result.score || 7)),
        strengths: result.strengths || [],
        improvements: result.improvements || []
      };
    } catch (error) {
      console.error("Error generating feedback:", error);
      return {
        feedback: "Thank you for your answer. Consider providing more specific examples and technical details.",
        score: 7,
        strengths: [],
        improvements: []
      };
    }
  }

  async generateSessionSummary(
    topic: string, 
    conversationHistory: ConversationTurn[]
  ): Promise<{ summary: string; overallScore: number; recommendations: string[], technicalScore: number; communicationScore: number; problemSolvingScore: number; }> {
    try {
      const conversation = conversationHistory.map(turn => 
        `${turn.speaker}: ${turn.textContent}${turn.feedbackContent ? `\nFeedback: ${turn.feedbackContent}` : ''}`
      ).join('\n\n');

      const prompt = `Analyze this complete interview session for a ${topic} position:

${conversation}

Provide a comprehensive summary in JSON format:
{
  "summary": "overall performance summary (2-3 sentences)",
  "overallScore": numeric_score_1_to_10,
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["area1", "area2", "area3"],
  "recommendations": ["recommendation1", "recommendation2"],
  "technicalScore": numeric_score_1_to_10,
  "communicationScore": numeric_score_1_to_10,
  "problemSolvingScore": numeric_score_1_to_10
}`;

      const response = await genai.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              summary: { type: "string" },
              overallScore: { type: "number" },
              strengths: { type: "array", items: { type: "string" } },
              improvements: { type: "array", items: { type: "string" } },
              recommendations: { type: "array", items: { type: "string" } },
              technicalScore: { type: "number" },
              communicationScore: { type: "number" },
              problemSolvingScore: { type: "number" }
            },
            required: ["summary", "overallScore", "recommendations"]
          }
        },
        contents: prompt,
      });

      const result = JSON.parse(response.text || "{}");
      
      return {
        summary: result.summary || "Interview completed with good overall performance.",
        overallScore: Math.max(1, Math.min(10, result.overallScore || 7)),
        recommendations: result.recommendations || ["Continue practicing", "Focus on specific examples"],
        technicalScore: result.technicalScore || 7,
        communicationScore: result.communicationScore || 7,
        problemSolvingScore: result.problemSolvingScore || 7,
      };
    } catch (error) {
      console.error("Error generating session summary:", error);
      return {
        summary: "Interview session completed. Review the conversation history for detailed feedback.",
        overallScore: 7,
        recommendations: ["Practice more technical questions", "Prepare specific examples"],
        technicalScore: 7,
        communicationScore: 7,
        problemSolvingScore: 7,
      };
    }
  }
}

export const geminiService = new GeminiService();
