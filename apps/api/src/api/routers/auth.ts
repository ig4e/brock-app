import { z } from "zod";

import { getGravatarUrl } from "../../utils/gravtar.js";
import { lucia } from "../auth/index.js";
import { signIn, signUp } from "../auth/password.js";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../trpc.js";

export const authRouter = createTRPCRouter({
  signIn: publicProcedure
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      return await signIn(input);
    }),

  signUp: publicProcedure
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      return await signUp(input);
    }),

  getSession: publicProcedure.query(({ ctx }) => {
    return {
      ...ctx.session,
      user: {
        ...ctx.session.user,
        avatarUrl:
          ctx.session.user?.username &&
          getGravatarUrl(ctx.session.user.username),
      },
    };
  }),

  signOut: protectedProcedure.mutation(async (opts) => {
    if (!opts.ctx.session.id) {
      return { success: false };
    }

    await lucia.invalidateSession(opts.ctx.session.id);

    return { success: true };
  }),
});
