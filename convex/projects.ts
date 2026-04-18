import { query } from "./_generated/server";
import { v } from "convex/values";

export const getAllProjects = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("projects").collect();
  },
});

export const getProjectById = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.projectId);
  },
});

export const getAllCategories = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("categories").collect();
  },
});

export const getTasksByCategory = query({
  args: {
    categoryId: v.id("categories"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_category", (q) =>
        q.eq("categoryId", args.categoryId)
      )
      .collect();
  },
});

export const getTasksByProject = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) =>
        q.eq("projectId", args.projectId)
      )
      .collect();
  },
});

import { mutation } from "./_generated/server";

export const updateTaskCategory = mutation({
  args: {
    taskId: v.id("tasks"),
    categoryId: v.id("categories"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.taskId, {
      categoryId: args.categoryId,
    });
  },
});

export const createTask = mutation({
  args: {
    projectId: v.id("projects"),
    categoryId: v.id("categories"),
    title: v.string(),
    xpValue: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .filter((q) =>
        q.and(
          q.eq(q.field("categoryId"), args.categoryId),
          q.eq(q.field("title"), args.title)
        )
      )
      .first();

    if (existing) return existing._id;

    const taskId = await ctx.db.insert("tasks", {
      projectId: args.projectId,
      categoryId: args.categoryId,
      title: args.title,
      xpValue: args.xpValue,
    });
    return taskId;
  },
});

export const completeTask = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, { taskId }) => {
    const task = await ctx.db.get(taskId);
    if (!task) throw new Error("Task not found");
    await ctx.db.insert("reps", {
      taskId,
      completedAt: Date.now(),
      xpValue: task.xpValue,
    });
  },
});

export const getAllReps = query({
  handler: async (ctx) => {
    return await ctx.db.query("reps").collect();
  },
});

export const createRep = mutation({
  args: {
    xpValue: v.number(),
    categoryId: v.id("categories")
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("reps", {
      categoryId: args.categoryId,
      xpValue: args.xpValue,
      completedAt: Date.now(),
    });
  },
});