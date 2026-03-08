const { z } = require("zod");

const catCreateSchema = z.object({
  name: z.string().min(2).max(60),
  bio: z.string().max(500).optional().default(""),
});

const postCreateSchema = z.object({
  catId: z.string().min(1),
  title: z.string().min(3).max(160),
  body: z.string().max(4000).optional().default(""),
});

const commentCreateSchema = z.object({
  body: z.string().min(1).max(1500),
});

const usernameUpdateSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
});

const voteSchema = z.object({
  value: z.number().int().refine(v => v === 1 || v === -1 || v === 0),
});

const registerSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

module.exports = {
  catCreateSchema,
  postCreateSchema,
  commentCreateSchema,
  usernameUpdateSchema,
  voteSchema,
  registerSchema,
  loginSchema,
};