import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// === TABLE DEFINITIONS ===

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  department: text("department").notNull(),
  year: text("year").notNull(),
  phone: text("phone").notNull(),
  profilePicture: text("profile_picture"),
  isVerified: boolean("is_verified").default(false),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // e.g., "Programming", "Music", "Design"
  type: text("type").notNull(), // 'teach' or 'learn'
  createdAt: timestamp("created_at").defaultNow(),
});

export const swapRequests = pgTable("swap_requests", {
  id: serial("id").primaryKey(),
  requesterId: integer("requester_id").notNull(),
  receiverId: integer("receiver_id").notNull(),
  skillId: integer("skill_id").notNull(), // The skill being requested
  status: text("status").notNull().default("pending"), // pending, accepted, rejected
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull(),
  receiverId: integer("receiver_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
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
  status: true 
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
