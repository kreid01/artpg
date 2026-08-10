import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    name: v.string(),
    weeklyGoal: v.optional(v.number())
  }),

  categories: defineTable({
    projectId: v.optional(v.id("projects")),
    name: v.string(),
    colour: v.optional(v.string()),
  }).index("by_projectId", ["projectId"]),

  achievements: defineTable({
  projectId: v.optional(v.id("projects")),
  categoryId: v.optional(v.id("categories")),
  name: v.string(),
  total: v.number(),
  description: v.optional(v.string()),
  currentCount: v.number(),
  xpValue: v.number(),
  })
  .index("by_project", ["projectId"])
  .index("by_category", ["categoryId"]),

  reps: defineTable({
    taskId: v.optional(v.id("tasks")),
    title: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
    completedAt: v.optional(v.number()), 
    groupId: v.optional(v.number()),
    xpValue: v.number(),
    hidden: v.optional(v.boolean())
  }).index("by_task", ["taskId"]),

  caps: defineTable({
    categoryId: v.id("categories"),
    value: v.number(),
  }).index("by_categoryId", ["categoryId"]),

  tasks: defineTable({
    projectId: v.id("projects"),
    categoryId: v.id("categories"),
    title: v.string(),
    xpValue: v.number(),
  }).index("by_project", ["projectId"])
    .index("by_category", ["categoryId"]),
});
