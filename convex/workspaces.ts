import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const generateCode = () => {
  const code = Array.from(
    { length: 6 },
    () => "0123456789abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 36)]
  ).join("");
  return code;
};

export const join = mutation({
  args: {
    joinCode: v.string(),
    worskpaceId: v.id("workspaces"),
  },
  async handler(ctx, args) {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const workspace = await ctx.db.get(args.worskpaceId);

    if (!workspace) {
      throw new Error("Worksapce not found");
    }

    if (workspace.joinCode !== args.joinCode.toLowerCase()) {
      throw new Error("Invalid join code");
    }

    const existingMember = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.worskpaceId).eq("userId", userId)
      )
      .unique();
    if (existingMember) {
      throw new Error("Already a member of this workspace");
    }
    await ctx.db.insert("members", {
      userId,
      workspaceId: args.worskpaceId,
      role: "member",
    });

    return workspace._id;
  },
});

export const newJoinCode = mutation({
  args: {
    workspaceId: v.id("workspaces"),
  },
  async handler(ctx, args) {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const memeber = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId)
      )
      .unique();

    if (!memeber || memeber.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const joinCode = generateCode();

    await ctx.db.patch(args.workspaceId, { joinCode });
    return args.workspaceId;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }
    const joinCode = generateCode();
    const worksPaceId = await ctx.db.insert("workspaces", {
      name: args.name,
      userId,
      joinCode,
    });

    await ctx.db.insert("members", {
      userId,
      workspaceId: worksPaceId,
      role: "admin",
    });

    await ctx.db.insert("channels", {
      name: "general",
      workspaceId: worksPaceId,
    });

    return worksPaceId;
  },
});

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const members = await ctx.db
      .query("members")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .collect();

    const workspacesIds = members.map((member) => member.workspaceId);

    const workspaces = [];

    for (const workspaceId of workspacesIds) {
      const wokspace = await ctx.db.get(workspaceId);
      if (wokspace) {
        workspaces.push(wokspace);
      }
    }

    return workspaces;
  },
});

export const getInfoById = query({
  args: {
    id: v.id("workspaces"),
  },
  async handler(ctx, args) {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.id).eq("userId", userId)
      )
      .unique();

    const workspace = await ctx.db.get(args.id);

    return {
      name: workspace?.name,
      isMember: !!member,
    };
  },
});

export const getById = query({
  args: {
    id: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.id).eq("userId", userId)
      )
      .unique();

    if (!member) {
      return null;
    }

    return await ctx.db.get(args.id);
  },
});

export const update = mutation({
  args: {
    id: v.id("workspaces"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.id).eq("userId", userId)
      )
      .unique();

    if (!member || member.role != "admin") {
      throw new Error("Unathroiized");
    }
    await ctx.db.patch(args.id, {
      name: args.name,
    });
    return args.id;
  },
});

export const remove = mutation({
  args: {
    id: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.id).eq("userId", userId)
      )
      .unique();

    if (!member || member.role != "admin") {
      throw new Error("Unathroiized");
    }

    const [members, channels, conversations, messages, reactions] =
      await Promise.all([
        ctx.db
          .query("members")
          .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id))
          .collect(),
        ctx.db
          .query("channels")
          .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id))
          .collect(),
        ctx.db
          .query("conversations")
          .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id))
          .collect(),
        ctx.db
          .query("messages")
          .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id))
          .collect(),
        ctx.db
          .query("reactions")
          .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id))
          .collect(),
      ]);

    for (const element of members) {
      await ctx.db.delete(element._id);
    }

    for (const element of channels) {
      await ctx.db.delete(element._id);
    }

    for (const element of conversations) {
      await ctx.db.delete(element._id);
    }

    for (const element of messages) {
      await ctx.db.delete(element._id);
    }

    for (const element of messages) {
      await ctx.db.delete(element._id);
    }

    for (const element of reactions) {
      await ctx.db.delete(element._id);
    }

    await ctx.db.delete(args.id);

    return args.id;
  },
});
