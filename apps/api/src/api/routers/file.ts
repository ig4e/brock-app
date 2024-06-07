import { filesize } from "filesize";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc.js";

export const fileRouter = createTRPCRouter({
  stats: protectedProcedure.query(async ({ ctx }) => {
    const stats = await ctx.prisma.file.aggregate({
      _count: true,
      _sum: {
        size: true,
      },
      where: { userId: ctx.session.user.id },
    });

    return {
      totalFiles: stats._count,
      totalSize: stats._sum.size ?? 0,
      totalSize_formatted: filesize(stats._sum.size?.toString() ?? 0),
    };
  }),

  get: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.file.findUnique({
        where: { id: input.id, userId: ctx.session.user.id },
        include: { folder: true, chunks: true },
      });
    }),

  getMany: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
        sortBy: z.enum(["desc", "asc"]).default("desc"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 10;
      const { cursor } = input;

      const items = await ctx.prisma.file.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: input.sortBy },
        where: { userId: ctx.session.user.id },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }

      return { items, nextCursor };
    }),
});
