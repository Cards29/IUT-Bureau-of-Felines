const { z } = require("zod");

const catCreateSchema = z.object({
  name: z.string().min(2).max(60),
  bio: z.string().max(500).optional().default(""),
});

const postCreateSchema = z.object({
  catId: z.string().min(1),
  type: z.enum(["commendation", "infraction"]),
  title: z.string().min(3).max(160),
  body: z.string().max(4000).optional().default(""),
});

const commentCreateSchema = z.object({
  body: z.string().min(1).max(1500),
});

const usernameUpdateSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
});

const commendationVoteSchema = z.object({
  benefit:  z.number().int().min(0).max(10),
  effort:   z.number().int().min(0).max(10),
  cuteness: z.number().int().min(0).max(10),
});

const infractionVoteSchema = z.object({
  malice:      z.number().int().min(0).max(10),
  destruction: z.number().int().min(0).max(10),
  cuteness:    z.number().int().min(0).max(10),
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
  commendationVoteSchema,
  infractionVoteSchema,
  registerSchema,
  loginSchema,
};