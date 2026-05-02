import { query } from "./_generated/server";
import { v } from "convex/values";
import { mutation } from "./_generated/server";

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

export const getAllCompleteReps = query({
  handler: async (ctx) => {
    return (await ctx.db.query("reps").collect()).filter(r => r.completedAt)
  },
});

export const getIncompleteReps = query({
  handler: async (ctx) => {
    const reps = (await ctx.db.query("reps").collect()).filter(t => !t.completedAt);

    return Promise.all(
      reps.map(async (rep) => {
        const category = rep.categoryId
          ? await ctx.db.get(rep.categoryId)
          : null;
        return { ...rep, categoryName: category?.name ?? null };
      })
    );
  },
});

export const completeRep = mutation({
  args: { repId: v.id("reps") },
  handler: async (ctx, { repId }) => {
    const rep = await ctx.db.get(repId);
    if (!rep) throw new Error("Rep not found");
    await ctx.db.patch(repId, {
      completedAt: Date.now(),
    });
  },
});

export const getAllTasks = query({
  handler: async (ctx) => {
    return await ctx.db.query("tasks").collect();
  },
});


export const createChecklistRep = mutation({
  args: {
    xpValue: v.number(),
    categoryId: v.id("categories"),
    title: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("reps", {
      categoryId: args.categoryId,
      xpValue: args.xpValue,
      title: args.title
    });
  },
});

export const createRep = mutation({
  args: {
    xpValue: v.number(),
    categoryId: v.id("categories"),
    title: v.optional(v.string()),
    groupId: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("reps", {
      categoryId: args.categoryId,
      xpValue: args.xpValue,
      completedAt: Date.now(),
      title: args.title,
      groupId: args.groupId
    });
  },
});

export const getLatestGroupId = query({
  args: {},
  handler: async (ctx) => {
    const rep = await ctx.db
      .query("reps")
      .filter((q) => q.neq(q.field("groupId"), undefined))
      .order("desc")
      .first();
    return rep?.groupId ?? 0;
  },
});

export const getRepGroups = query({
  args: {},
  handler: async (ctx) => {
    const reps = await ctx.db
      .query("reps")
      .filter((q) => q.neq(q.field("groupId"), undefined))
      .collect();

    const groupMap = new Map<number, typeof reps>();
    for (const rep of reps) {
      const gid = rep.groupId!;
      if (!groupMap.has(gid)) groupMap.set(gid, []);
      groupMap.get(gid)!.push(rep);
    }

    const results = [];
    for (const [groupId, groupReps] of groupMap.entries()) {
      const entries = await Promise.all(
        groupReps.map(async (r) => {
          let categoryId = r.categoryId;

          if (!categoryId && r.taskId) {
            const task = await ctx.db.get(r.taskId);
            categoryId = task?.categoryId;
          }

          const category = categoryId ? await ctx.db.get(categoryId) : null;

          return {
            categoryName: category?.name,
            xpValue: r.xpValue,
          };
        })
      );

      results.push({
        groupId,
        name: groupReps[0].title ?? "Untitled group",
        totalXp: groupReps.reduce((a, r) => a + r.xpValue, 0),
        entries,
      });
    }

    return results.sort((a, b) => a.groupId - b.groupId);
  },
});

export const createRepsFromGroup = mutation({
  args: { groupId: v.float64() },
  handler: async (ctx, { groupId }) => {
    const reps = await ctx.db
      .query("reps")
      .filter((q) => q.eq(q.field("groupId"), groupId))
      .collect();

    await Promise.all(
      reps.map((r) =>
        ctx.db.insert("reps", {
          categoryId: r.categoryId,
          xpValue: r.xpValue,
          title: r.title,
          completedAt: Date.now(),
        })
      )
    );
  },
});