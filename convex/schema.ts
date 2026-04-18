import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    name: v.string(),
  }),

  categories: defineTable({
    name: v.string(),
  }),

  reps: defineTable({
    taskId: v.optional(v.id("tasks")),
    categoryId: v.optional(v.id("categories")),
    completedAt: v.number(), 
    xpValue: v.number(),
  }).index("by_task", ["taskId"]),

  tasks: defineTable({
    projectId: v.id("projects"),
    categoryId: v.id("categories"),
    title: v.string(),
    xpValue: v.number(),
  }).index("by_project", ["projectId"])
    .index("by_category", ["categoryId"]),
});