import { query } from "./_generated/server";
import { v } from "convex/values";
import { mutation } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";

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
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("categories")
      .filter((q) => q.eq(q.field("projectId"), args.projectId))
      .collect();
  },
});

export const getTasksByCategory = query({
  args: {
    projectId: v.id("projects"),
    categoryId: v.id("categories"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .filter((q) => q.eq(q.field("projectId"), args.projectId))
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
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

export const updateTaskCategory = mutation({
  args: {
    projectId: v.id("projects"),
    taskId: v.id("tasks"),
    categoryId: v.id("categories"),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task || task.projectId !== args.projectId) {
      throw new Error("Task not found in this project");
    }

    const category = await ctx.db.get(args.categoryId);
    if (!category || category.projectId !== args.projectId) {
      throw new Error("Category not found in this project");
    }

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
  args: {
    projectId: v.id("projects"),
    taskId: v.id("tasks"),
  },
  handler: async (ctx, { projectId, taskId }) => {
    const task = await ctx.db.get(taskId);
    if (!task || task.projectId !== projectId) {
      throw new Error("Task not found in this project");
    }
    await ctx.db.insert("reps", {
      taskId,
      completedAt: Date.now(),
      xpValue: task.xpValue,
    });
  },
});

async function getRepProjectId(
  ctx: QueryCtx,
  rep: Doc<"reps">
): Promise<Id<"projects"> | null> {
  if (rep.categoryId) {
    const category = await ctx.db.get(rep.categoryId);
    if (category?.projectId) return category.projectId;
  }
  if (rep.taskId) {
    const task = await ctx.db.get(rep.taskId);
    if (task?.projectId) return task.projectId;
  }
  return null;
}

export const getAllCompleteReps = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, { projectId }) => {
    const reps = (await ctx.db.query("reps").collect()).filter(
      (r) => r.completedAt
    );

    const withProject = await Promise.all(
      reps.map(async (rep) => ({
        rep,
        repProjectId: await getRepProjectId(ctx, rep),
      }))
    );

    return withProject
      .filter(({ repProjectId }) => repProjectId === projectId)
      .map(({ rep }) => rep);
  },
});

export const getIncompleteReps = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, { projectId }) => {
    const reps = (await ctx.db.query("reps").collect()).filter(
      (t) => !t.completedAt && !t.groupId
    );

    const enriched = await Promise.all(
      reps.map(async (rep) => {
        const category = rep.categoryId
          ? await ctx.db.get(rep.categoryId)
          : null;
        const repProjectId = await getRepProjectId(ctx, rep);
        return { ...rep, categoryName: category?.name ?? null, repProjectId };
      })
    );

    return enriched
      .filter((rep) => rep.repProjectId === projectId)
      .map(({ repProjectId, ...rest }) => rest);
  },
});

export const completeRep = mutation({
  args: {
    projectId: v.id("projects"),
    repId: v.id("reps"),
  },
  handler: async (ctx, { projectId, repId }) => {
    const rep = await ctx.db.get(repId);
    if (!rep) throw new Error("Rep not found");

    const repProjectId = await getRepProjectId(ctx, rep);
    if (repProjectId !== projectId) {
      throw new Error("Rep not found in this project");
    }

    await ctx.db.patch(repId, {
      completedAt: Date.now(),
    });
  },
});

export const getAllTasks = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, { projectId }) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();
  },
});

export const createChecklistRep = mutation({
  args: {
    projectId: v.id("projects"),
    xpValue: v.number(),
    categoryId: v.id("categories"),
    title: v.optional(v.string()),
    groupId: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.categoryId);
    if (!category || category.projectId !== args.projectId) {
      throw new Error("Category not found in this project");
    }

    await ctx.db.insert("reps", {
      categoryId: args.categoryId,
      xpValue: args.xpValue,
      title: args.title,
      groupId: args.groupId,
    });
  },
});

export const createRep = mutation({
  args: {
    projectId: v.id("projects"),
    xpValue: v.number(),
    categoryId: v.id("categories"),
    title: v.optional(v.string()),
    groupId: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.categoryId);
    if (!category || category.projectId !== args.projectId) {
      throw new Error("Category not found in this project");
    }

    await ctx.db.insert("reps", {
      categoryId: args.categoryId,
      xpValue: args.xpValue,
      completedAt: Date.now(),
      title: args.title,
      groupId: args.groupId,
    });
  },
});

export const getLatestGroupId = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, { projectId }) => {
    const reps = await ctx.db
      .query("reps")
      .filter((q) => q.neq(q.field("groupId"), undefined))
      .order("desc")
      .collect();

    for (const rep of reps) {
      const repProjectId = await getRepProjectId(ctx, rep);
      if (repProjectId === projectId) {
        return rep.groupId ?? 0;
      }
    }
    return 0;
  },
});

export const getRepGroups = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, { projectId }) => {
    const reps = await ctx.db
      .query("reps")
      .filter((q) => q.neq(q.field("groupId"), undefined))
      .collect();

    // Only keep reps belonging to the requested project.
    const scopedReps = (
      await Promise.all(
        reps.map(async (rep) => ({
          rep,
          repProjectId: await getRepProjectId(ctx, rep),
        }))
      )
    )
      .filter(({ repProjectId }) => repProjectId === projectId)
      .map(({ rep }) => rep);

    const groupMap = new Map<number, typeof scopedReps>();
    for (const rep of scopedReps) {
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
  args: {
    projectId: v.id("projects"),
    groupId: v.float64(),
  },
  handler: async (ctx, { projectId, groupId }) => {
    const reps = await ctx.db
      .query("reps")
      .filter((q) => q.eq(q.field("groupId"), groupId))
      .collect();

    // Guard against completing a group that doesn't belong to this project.
    const scopedReps = (
      await Promise.all(
        reps.map(async (rep) => ({
          rep,
          repProjectId: await getRepProjectId(ctx, rep),
        }))
      )
    )
      .filter(({ repProjectId }) => repProjectId === projectId)
      .map(({ rep }) => rep);

    await Promise.all(
      scopedReps.map((r) =>
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

export const createJournalEntry = mutation({
  args: {
    wins: v.string(),
    toImprove: v.string(),
    focus: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("journal", {
      ...args,
      created: Date.now(),
    });
  },
});

export const getAchievements = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, { projectId }) => {
    return await ctx.db
      .query("achievements")
      .withIndex("by_project", q => q.eq("projectId", projectId))
      .collect();
  },
});

export const createAchievement = mutation({
  args: {
    projectId: v.id("projects"),
    categoryId: v.id("categories"),
    name: v.string(),
    total: v.number(),
    xpValue: v.number(),
  },
  handler: async (ctx, { projectId, categoryId, name, total, xpValue }) => {
    const category = await ctx.db.get(categoryId);
    if (!category || category.projectId !== projectId) {
      throw new Error("Category not found in this project");
    }
    if (total <= 0 || xpValue <= 0) {
      throw new Error("Target and XP reward must be greater than zero");
    }

    const achievementId = await ctx.db.insert("achievements", {
      projectId,
      categoryId,
      name,
      total,
      currentCount: 0,
      xpValue,
    });

    return achievementId;
  },
});

export const completeAchievementRep = mutation({
  args: {
    projectId: v.id("projects"),
    achievementId: v.id("achievements"),
  },
  handler: async (ctx, { projectId, achievementId }) => {
    const achievement = await ctx.db.get(achievementId);
    if (!achievement || achievement.projectId !== projectId) {
      throw new Error("Achievement not found in this project");
    }
    if (!achievement.categoryId) {
      throw new Error("Achievement has no category");
    }
    if (achievement.currentCount >= achievement.total) {
      throw new Error("Achievement is already complete");
    }

    const category = await ctx.db.get(achievement.categoryId);
    if (!category || category.projectId !== projectId) {
      throw new Error("Category not found in this project");
    }

    await ctx.db.insert("reps", {
      categoryId: achievement.categoryId,
      title: achievement.name,
      xpValue: achievement.xpValue,
      completedAt: Date.now(),
    });
    await ctx.db.patch(achievementId, {
      currentCount: achievement.currentCount + 1,
    });
  },
});

export const getLatestFocus = query({
  args: {},
  handler: async (ctx) => {
    const latest = await ctx.db
      .query("journal")
      .withIndex("by_created")
      .order("desc")
      .first();

    return latest?.focus ?? "";
  },
});
