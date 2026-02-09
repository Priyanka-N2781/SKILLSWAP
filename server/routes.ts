import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import MemoryStore from "memorystore";

const SessionStore = MemoryStore(session);

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Session Setup
  app.use(session({
    secret: 'secret-key', // In prod use env var
    resave: false,
    saveUninitialized: false,
    store: new SessionStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    cookie: { secure: false } // true if https
  }));

  // Auth Middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // === Auth Routes ===

  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      const existing = await storage.getUserByUsername(input.email);
      if (existing) {
        return res.status(409).json({ message: "Email already exists" });
      }
      const user = await storage.createUser(input);
      // Auto-login after register? Or wait for verify? 
      // Req says verify step. So just return user.
      res.status(201).json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  app.post(api.auth.verify.path, async (req, res) => {
    const { userId, otp } = req.body;
    // Mock OTP check: any 4+ char string works
    if (!otp || otp.length < 4) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    await storage.verifyUser(userId);
    res.json({ message: "Verified successfully" });
  });

  app.post(api.auth.login.path, async (req, res) => {
    const { username, password } = req.body;
    const user = await storage.getUserByUsername(username);
    if (!user || user.password !== password) { // Simple password check for Lite MVP
      return res.status(401).json({ message: "Invalid credentials" });
    }
    req.session.userId = user.id;
    res.json(user);
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.session.destroy(() => {
      res.sendStatus(200);
    });
  });

  app.get(api.auth.me.path, async (req, res) => {
    if (!req.session.userId) return res.sendStatus(401);
    const user = await storage.getUser(req.session.userId);
    if (!user) return res.sendStatus(401);
    res.json(user);
  });

  // === Skills Routes ===

  app.get(api.skills.list.path, async (req, res) => {
    const skills = await storage.getSkills({
      type: req.query.type as string,
      category: req.query.category as string,
      search: req.query.search as string
    });
    res.json(skills);
  });

  app.post(api.skills.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.skills.create.input.parse(req.body);
      const skill = await storage.createSkill({ ...input, userId: req.session.userId });
      res.status(201).json(skill);
    } catch (err) {
      res.status(400).json({ message: "Validation error" });
    }
  });

  app.delete(api.skills.delete.path, requireAuth, async (req, res) => {
    const skill = await storage.getSkill(Number(req.params.id));
    if (!skill) return res.status(404).json({ message: "Not found" });
    if (skill.userId !== req.session.userId) return res.status(401).json({ message: "Unauthorized" });
    await storage.deleteSkill(Number(req.params.id));
    res.sendStatus(200);
  });

  // === Swap Routes ===

  app.get(api.swaps.list.path, requireAuth, async (req, res) => {
    const swaps = await storage.getSwapRequests(req.session.userId);
    res.json(swaps);
  });

  app.post(api.swaps.create.path, requireAuth, async (req, res) => {
    const input = api.swaps.create.input.parse(req.body);
    const swap = await storage.createSwapRequest({ 
      ...input, 
      requesterId: req.session.userId,
      status: 'pending'
    });
    res.status(201).json(swap);
  });

  app.patch(api.swaps.updateStatus.path, requireAuth, async (req, res) => {
    const { status } = req.body;
    const updated = await storage.updateSwapRequestStatus(Number(req.params.id), status);
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  });

  // === Message Routes ===

  app.get(api.messages.list.path, requireAuth, async (req, res) => {
    const otherUserId = Number(req.params.userId);
    const msgs = await storage.getMessages(req.session.userId, otherUserId);
    res.json(msgs);
  });

  app.post(api.messages.send.path, requireAuth, async (req, res) => {
    const input = api.messages.send.input.parse(req.body);
    const msg = await storage.createMessage({ ...input, senderId: req.session.userId });
    res.status(201).json(msg);
  });

  // === Seed Data ===
  await seed();

  return httpServer;
}

async function seed() {
  const users = await storage.getUserByUsername("john@example.com");
  if (!users) {
    const u1 = await storage.createUser({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
      department: "Computer Science",
      year: "3",
      phone: "1234567890",
      profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
      bio: "Love coding and coffee",
      isVerified: true
    });
    const u2 = await storage.createUser({
      name: "Jane Smith",
      email: "jane@example.com",
      password: "password123",
      department: "Music",
      year: "2",
      phone: "0987654321",
      profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
      bio: "Guitarist and singer",
      isVerified: true
    });

    await storage.createSkill({
      userId: u1.id,
      title: "Java Programming",
      description: "Can teach advanced Java and Spring Boot",
      category: "Programming",
      type: "teach"
    });

    await storage.createSkill({
      userId: u2.id,
      title: "Guitar Lessons",
      description: "Beginner to intermediate guitar lessons",
      category: "Music",
      type: "teach"
    });
  }
}
