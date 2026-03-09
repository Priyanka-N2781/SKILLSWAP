import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations, sql } from "drizzle-orm";

// === TABLE DEFINITIONS ===

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  department: text("department").notNull(),
  year: text("year").notNull(),
  phone: text("phone").notNull(),
  profilePicture: text("profile_picture"),
  isVerified: integer("is_verified", { mode: "boolean" }).default(false),
  bio: text("bio"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const skills = sqliteTable("skills", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // e.g., "Programming", "Music", "Design"
  type: text("type").notNull(), // 'teach' or 'learn'
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const swapRequests = sqliteTable("swap_requests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  requesterId: integer("requester_id").notNull(),
  receiverId: integer("receiver_id").notNull(),
  skillId: integer("skill_id").notNull(), // The skill being requested
  status: text("status").notNull().default("pending"), // pending, accepted, rejected, completed
  message: text("message"),
  meetCode: text("meet_code"), // Google Meet or Zoom join URL/code
  meetType: text("meet_type"), // 'googlemeet' or 'zoom'
  meetTime: text("meet_time"), // time of the meeting
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  senderId: integer("sender_id").notNull(),
  receiverId: integer("receiver_id").notNull(),
  content: text("content").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// === RELATIONS ===

export const usersRelations = relations(users, ({ many }) => ({
  skills: many(skills),
  sentRequests: many(swapRequests, { relationName: "requester" }),
  receivedRequests: many(swapRequests, { relationName: "receiver" }),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "receiver" }),
}));

export const skillsRelations = relations(skills, ({ one }) => ({
  user: one(users, {
    fields: [skills.userId],
    references: [users.id],
  }),
}));

export const swapRequestsRelations = relations(swapRequests, ({ one }) => ({
  requester: one(users, {
    fields: [swapRequests.requesterId],
    references: [users.id],
    relationName: "requester",
  }),
  receiver: one(users, {
    fields: [swapRequests.receiverId],
    references: [users.id],
    relationName: "receiver",
  }),
  skill: one(skills, {
    fields: [swapRequests.skillId],
    references: [skills.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sender",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receiver",
  }),
}));

// === SCHEMAS & TYPES ===

export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true, 
  isVerified: true 
});

export const insertSkillSchema = createInsertSchema(skills).omit({ 
  id: true, 
  createdAt: true 
});

export const insertSwapRequestSchema = createInsertSchema(swapRequests).omit({ 
  id: true, 
  createdAt: true,
  status: true,
  meetCode: true,
  meetType: true 
});

export const insertMessageSchema = createInsertSchema(messages).omit({ 
  id: true, 
  createdAt: true 
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Skill = typeof skills.$inferSelect;
export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type SwapRequest = typeof swapRequests.$inferSelect;
export type InsertSwapRequest = z.infer<typeof insertSwapRequestSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
