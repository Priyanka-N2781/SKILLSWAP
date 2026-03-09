import { 
  users, skills, swapRequests, messages,
  type User, type InsertUser, 
  type Skill, type InsertSkill,
  type SwapRequest, type InsertSwapRequest,
  type Message, type InsertMessage
} from "@shared/schema";
import { db } from "./db";
import { eq, or, and, desc } from "drizzle-orm";

export interface IStorage {
  // Auth
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>; // email or phone
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  verifyUser(id: number): Promise<void>;
  
  // Skills
  createSkill(skill: InsertSkill): Promise<Skill>;
  getSkills(filters?: { type?: string; category?: string; search?: string }): Promise<(Skill & { user: User })[]>;
  getSkill(id: number): Promise<Skill | undefined>;
  deleteSkill(id: number): Promise<void>;
  getUserSkills(userId: number): Promise<Skill[]>;

  // Swaps
  createSwapRequest(request: InsertSwapRequest): Promise<SwapRequest>;
  getSwapRequests(userId: number): Promise<(SwapRequest & { skill: Skill; requester: User; receiver: User })[]>;
  updateSwapRequestStatus(id: number, status: string, meetCode?: string, meetType?: string, meetTime?: string): Promise<SwapRequest | undefined>;

  // Messages
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(userId1: number, userId2: number): Promise<Message[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Check email or phone
    const [user] = await db.select().from(users).where(
      or(eq(users.email, username), eq(users.phone, username))
    );
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
    return user;
  }

  async verifyUser(id: number): Promise<void> {
    await db.update(users).set({ isVerified: true }).where(eq(users.id, id));
  }

  async createSkill(skill: InsertSkill): Promise<Skill> {
    const [newSkill] = await db.insert(skills).values(skill).returning();
    return newSkill;
  }

  async getSkills(filters?: { type?: string; category?: string; search?: string }): Promise<(Skill & { user: User })[]> {
    let whereClause = undefined;
    const conditions = [];

    if (filters?.type) {
      conditions.push(eq(skills.type, filters.type));
    }
    
    if (filters?.category && filters.category !== "All") {
      conditions.push(eq(skills.category, filters.category));
    }

    if (conditions.length > 0) {
      whereClause = and(...conditions);
    }

    const query = db.select({
      skill: skills,
      user: users,
    })
    .from(skills)
    .innerJoin(users, eq(skills.userId, users.id));

    if (whereClause) {
      query.where(whereClause);
    }
    
    const results = await query;
    return results.map(r => ({ ...r.skill, user: r.user }));
  }

  async getSkill(id: number): Promise<Skill | undefined> {
    const [skill] = await db.select().from(skills).where(eq(skills.id, id));
    return skill;
  }

  async deleteSkill(id: number): Promise<void> {
    await db.delete(skills).where(eq(skills.id, id));
  }

  async getUserSkills(userId: number): Promise<Skill[]> {
    return db.select().from(skills).where(eq(skills.userId, userId));
  }

  async createSwapRequest(request: InsertSwapRequest): Promise<SwapRequest> {
    const [req] = await db.insert(swapRequests).values(request).returning();
    return req;
  }

  async getSwapRequests(userId: number): Promise<(SwapRequest & { skill: Skill; requester: User; receiver: User })[]> {
    const results = await db.select({
      request: swapRequests,
      skill: skills,
      requester: users,
      receiver: {
        id: users.id,
        name: users.name,
        email: users.email,
        department: users.department,
        year: users.year,
        phone: users.phone,
        profilePicture: users.profilePicture,
        isVerified: users.isVerified,
        bio: users.bio,
        createdAt: users.createdAt,
        password: users.password // In a real app we'd alias the table to avoid selecting password, but for now we just map carefully
      } as any // Cast to avoid TS issues with table aliasing complexity in Drizzle simple mode
    })
    .from(swapRequests)
    .innerJoin(skills, eq(swapRequests.skillId, skills.id))
    .innerJoin(users, eq(swapRequests.requesterId, users.id))
    // We need to join users AGAIN for receiver, which requires aliasing, but for simplicity in MVP 
    // we will fetch requests where user is either requester OR receiver
    .where(or(eq(swapRequests.requesterId, userId), eq(swapRequests.receiverId, userId)));

    // For the receiver join, we'll do a simple second pass or just simple join if we assume we just need the other person's data
    // To keep it simple and correct, let's just return what we have and maybe fetch receiver details separately if needed
    // OR: Use Drizzle's proper aliasing:
    // This is getting complex for a "Lite" single file storage. 
    // Let's simplify: We'll fetch all requests and manually attach user objects for now or accept that 'receiver' might be missing in this specific query structure
    // Actually, let's fix the query to be correct.
    
    // Simplification: Just return the raw requests for now, and frontend can fetch details? 
    // No, frontend expects full objects.
    
    // Proper way:
    const myRequests = await db.select().from(swapRequests)
      .where(or(eq(swapRequests.requesterId, userId), eq(swapRequests.receiverId, userId)))
      .orderBy(desc(swapRequests.createdAt));
      
    const enriched = await Promise.all(myRequests.map(async (req) => {
      const skill = await this.getSkill(req.skillId);
      const requester = await this.getUser(req.requesterId);
      const receiver = await this.getUser(req.receiverId);
      return {
        ...req,
        skill: skill!,
        requester: requester!,
        receiver: receiver!
      };
    }));
    
    return enriched;
  }

  async updateSwapRequestStatus(id: number, status: string, meetCode?: string, meetType?: string, meetTime?: string): Promise<SwapRequest | undefined> {
    const updateData: any = { status };
    if (meetCode) updateData.meetCode = meetCode;
    if (meetType) updateData.meetType = meetType;
    if (meetTime) updateData.meetTime = meetTime;
    
    const [updated] = await db.update(swapRequests)
      .set(updateData)
      .where(eq(swapRequests.id, id))
      .returning();
    return updated;
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [msg] = await db.insert(messages).values(message).returning();
    return msg;
  }

  async getMessages(userId1: number, userId2: number): Promise<Message[]> {
    return db.select().from(messages)
      .where(or(
        and(eq(messages.senderId, userId1), eq(messages.receiverId, userId2)),
        and(eq(messages.senderId, userId2), eq(messages.receiverId, userId1))
      ))
      .orderBy(messages.createdAt);
  }
}

export const storage = new DatabaseStorage();
