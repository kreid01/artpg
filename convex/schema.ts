import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    name: v.string(),
  }),

  categories: defineTable({
    projectId: v.optional(v.id("projects")),
    name: v.string(),
  }),

  journal: defineTable({
    created: v.number(),
    wins: v.string(),
    toImprove: v.string(),
    focus: v.string(),
  }).index("by_created", ["created"]),

  reps: defineTable({
    taskId: v.optional(v.id("tasks")),
    title: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
    completedAt: v.optional(v.number()), 
    groupId: v.optional(v.number()),
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