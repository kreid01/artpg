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

export const getProjectSummaries = query({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").collect();
    // This scan is only needed while projectId is being backfilled on legacy
    // reps. It disappears after the migration, leaving only indexed reads.
    const legacyReps = await ctx.db
      .query("reps")
      .filter((q) => q.eq(q.field("projectId"), undefined))
      .collect();
    const legacyRepsByProject = new Map<Id<"projects">, Doc<"reps">[]>();
    for (const rep of legacyReps) {
      const projectId = await getRepProjectId(ctx, rep);
      if (!projectId) continue;
      const reps = legacyRepsByProject.get(projectId) ?? [];
      reps.push(rep);
      legacyRepsByProject.set(projectId, reps);
    }

    return await Promise.all(projects.map(async (project) => {
      const [categories, indexedReps] = await Promise.all([
        ctx.db
        .query("categories")
        .withIndex("by_projectId", (q) => q.eq("projectId", project._id))
        .collect(),
        ctx.db
          .query("reps")
          .withIndex("by_projectId_and_completedAt", (q) =>
            q.eq("projectId", project._id).gte("completedAt", 0),
          )
          .collect(),
      ]);
      const projectReps = [...indexedReps, ...(legacyRepsByProject.get(project._id) ?? [])]
        .filter((rep) => rep.completedAt);

      return {
        _id: project._id,
        name: project.name,
        categoryCount: categories.length,
        totalXp: projectReps.reduce((total, rep) => total + rep.xpValue, 0),
        weeklyGoal: project.weeklyGoal
      };
    }));
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
      projectId,
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
  if (rep.projectId) return rep.projectId;
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

/**
 * During the projectId backfill, retain a correctness fallback for historical
 * reps. Once the migration is complete, this is a single indexed read.
 */
async function getRepsByProject(
  ctx: QueryCtx,
  projectId: Id<"projects">,
): Promise<Doc<"reps">[]> {
  const indexedReps = await ctx.db
    .query("reps")
    .withIndex("by_projectId", (q) => q.eq("projectId", projectId))
    .collect();
  const legacyReps = await ctx.db
    .query("reps")
    .filter((q) => q.eq(q.field("projectId"), undefined))
    .collect();
  const matchingLegacyReps = (
    await Promise.all(
      legacyReps.map(async (rep) => ({
        rep,
        repProjectId: await getRepProjectId(ctx, rep),
      })),
    )
  )
    .filter(({ repProjectId }) => repProjectId === projectId)
    .map(({ rep }) => rep);

  return [...indexedReps, ...matchingLegacyReps];
}

async function getCompletedRepsByProject(
  ctx: QueryCtx,
  projectId: Id<"projects">,
  completedAfter: number,
): Promise<Doc<"reps">[]> {
  const indexedReps = await ctx.db
    .query("reps")
    .withIndex("by_projectId_and_completedAt", (q) =>
      q.eq("projectId", projectId).gte("completedAt", completedAfter),
    )
    .collect();
  const legacyReps = await ctx.db
    .query("reps")
    .filter((q) => q.eq(q.field("projectId"), undefined))
    .collect();
  const matchingLegacyReps = (
    await Promise.all(
      legacyReps.map(async (rep) => ({
        rep,
        repProjectId: await getRepProjectId(ctx, rep),
      })),
    )
  )
    .filter(
      ({ rep, repProjectId }) =>
        repProjectId === projectId &&
        rep.completedAt !== undefined &&
        rep.completedAt >= completedAfter,
    )
    .map(({ rep }) => rep);

  return [...indexedReps, ...matchingLegacyReps];
}

export const getAllCompleteReps = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, { projectId }) => {
    return await getCompletedRepsByProject(ctx, projectId, 0);
  },
});

export const getIncompleteReps = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, { projectId }) => {
    const reps = (await getRepsByProject(ctx, projectId)).filter(
      (rep) => !rep.completedAt && !rep.groupId,
    );

    const enriched = await Promise.all(
      reps.map(async (rep) => {
        const category = rep.categoryId
          ? await ctx.db.get(rep.categoryId)
          : null;
        return { ...rep, categoryName: category?.name ?? null };
      })
    );

    return enriched;
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
      projectId: args.projectId,
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
      projectId: args.projectId,
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
    const reps = (await getRepsByProject(ctx, projectId))
      .filter((rep) => rep.groupId !== undefined)
      .sort((a, b) => b._creationTime - a._creationTime);
    return reps[0]?.groupId ?? 0;
  },
});

export const getRepGroups = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, { projectId }) => {
    const scopedReps = (await getRepsByProject(ctx, projectId)).filter(
      (rep) => rep.groupId !== undefined,
    );

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
        hidden: groupReps.some(g => g.hidden ?? false),
        name: groupReps[0].title ?? "Untitled group",
        totalXp: groupReps.reduce((a, r) => a + r.xpValue, 0),
        entries,
      });
    }

    return results.filter(x => !x.hidden).sort((a, b) => a.groupId - b.groupId);
  },
});

export const createRepsFromGroup = mutation({
  args: {
    projectId: v.id("projects"),
    groupId: v.float64(),
  },
  handler: async (ctx, { projectId, groupId }) => {
    const scopedReps = (await getRepsByProject(ctx, projectId)).filter(
      (rep) => rep.groupId === groupId,
    );

    await Promise.all(
      scopedReps.map((r) =>
        ctx.db.insert("reps", {
          projectId,
          categoryId: r.categoryId,
          xpValue: r.xpValue,
          title: r.title,
          completedAt: Date.now(),
        })
      )
    );
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

export const getByProject = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, { projectId }) => {
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_projectId", (q) => q.eq("projectId", projectId))
      .collect();

    return Promise.all(
      categories.map(async (category) => {
        const cap = await ctx.db
          .query("caps")
          .withIndex("by_categoryId", (q) =>
            q.eq("categoryId", category._id)
          )
          .unique();

        return {
          ...category,
          cap,
        };
      })
    );
  },
});

export const createAchievement = mutation({
  args: {
    projectId: v.id("projects"),
    categoryId: v.id("categories"),
    name: v.string(),
    total: v.number(),
    xpValue: v.number(),
    description: v.optional(v.string())
  },
  handler: async (ctx, { projectId, categoryId, name, total, xpValue, description }) => {
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
      description,
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

export const getTotalCap = query({
  args: {},
  handler: async (ctx) => {
    const caps = await ctx.db.query("caps").collect();

    return caps.reduce((total, cap) => total + cap.value, 0);
  },
});

export const updateCategory = mutation({
  args: {
    categoryId: v.id("categories"),
    name: v.string(),
    color: v.string(),
    cap: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.categoryId, {
      name: args.name,
      colour: args.color,
    });

    const existingCap = await ctx.db
      .query("caps")
      .withIndex("by_categoryId", q => q.eq("categoryId", args.categoryId))
      .unique();

    if (existingCap) {
      await ctx.db.patch(existingCap._id, {
        value: args.cap,
      });
    } else {
      await ctx.db.insert("caps", {
        categoryId: args.categoryId,
        value: args.cap,
      });
    }
  },
});

export const createCategory = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const categoryId = await ctx.db.insert("categories", {
      projectId: args.projectId,
      name: args.name,
    });

    await ctx.db.insert("caps", {
      categoryId,
      value: 0,
    });

    return categoryId;
  },
});

export const getWeeklyXpByProject = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, { projectId }) => {
    const now = new Date();

    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay(); // 0 = Sunday
    const diff = day === 0 ? -6 : 1 - day;
    startOfWeek.setDate(startOfWeek.getDate() + diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const reps = await getCompletedRepsByProject(
      ctx,
      projectId,
      startOfWeek.getTime(),
    );

    let totalXp = 0;

    for (const rep of reps) {
      totalXp += rep.xpValue;
    }

    return totalXp;
  },
});
