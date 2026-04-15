import { z } from 'zod';
import { insertUserSchema, insertSkillSchema, insertSwapRequestSchema, insertMessageSchema, users, skills, swapRequests, messages } from '../database/schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  conflict: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/auth/register' as const,
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
        409: errorSchemas.conflict,
      },
    },
    verify: {
      method: 'POST' as const,
      path: '/api/auth/verify' as const,
      input: z.object({ userId: z.number(), otp: z.string() }), // Simulated OTP
      responses: {
        200: z.object({ message: z.string() }),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/auth/login' as const,
      input: z.object({
        username: z.string(), // Can be email or phone
        password: z.string(),
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/auth/logout' as const,
      responses: {
        200: z.void(),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  skills: {
    list: {
      method: 'GET' as const,
      path: '/api/skills' as const,
      input: z.object({
        type: z.enum(['teach', 'learn']).optional(),
        category: z.string().optional(),
        search: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof skills.$inferSelect & { user: typeof users.$inferSelect }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/skills' as const,
      input: insertSkillSchema.omit({ userId: true }),
      responses: {
        201: z.custom<typeof skills.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/skills/:id' as const,
      responses: {
        200: z.void(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
  },
  swaps: {
    list: {
      method: 'GET' as const,
      path: '/api/swaps' as const,
      responses: {
        200: z.array(z.custom<typeof swapRequests.$inferSelect & {
          skill: typeof skills.$inferSelect,
          requester: typeof users.$inferSelect,
          receiver: typeof users.$inferSelect
        }>()),
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/swaps' as const,
      input: insertSwapRequestSchema.omit({ requesterId: true, status: true }),
      responses: {
        201: z.custom<typeof swapRequests.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/swaps/:id' as const,
      input: z.object({ status: z.enum(['accepted', 'rejected']) }),
      responses: {
        200: z.custom<typeof swapRequests.$inferSelect>(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
  },
  messages: {
    list: {
      method: 'GET' as const,
      path: '/api/messages/:userId' as const,
      responses: {
        200: z.array(z.custom<typeof messages.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    send: {
      method: 'POST' as const,
      path: '/api/messages' as const,
      input: insertMessageSchema.omit({ senderId: true }),
      responses: {
        201: z.custom<typeof messages.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
