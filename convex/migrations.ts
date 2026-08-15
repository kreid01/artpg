import { Migrations } from "@convex-dev/migrations";
import type { ComponentApi } from "@convex-dev/migrations/_generated/component.js";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { internalMutation } from "./_generated/server";

// `components` gains this property after the first deploy that installs the
// component. Keep the explicit type so this file also typechecks beforehand.
const migrations = new Migrations<DataModel>(
  (components as unknown as { migrations: ComponentApi<"migrations"> })
    .migrations,
  { internalMutation },
);

export const backfillRepProjectId = migrations.define({
  table: "reps",
  batchSize: 50,
  migrateOne: async (ctx, rep) => {
    if (rep.projectId !== undefined) return;

    const projectId = rep.categoryId
      ? (await ctx.db.get(rep.categoryId))?.projectId
      : rep.taskId
        ? (await ctx.db.get(rep.taskId))?.projectId
        : undefined;

    if (projectId !== undefined) {
      await ctx.db.patch(rep._id, { projectId });
    }
  },
});

export const runBackfillRepProjectId = migrations.runner();
