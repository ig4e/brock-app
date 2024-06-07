import { lucia } from "../auth/index.js";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../trpc.js";

export const authRouter = createTRPCRouter({
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),

  signOut: protectedProcedure.mutation(async (opts) => {
    if (!opts.ctx.session.id) {
      return { success: false };
    }

    await lucia.invalidateSession(opts.ctx.session.id);

    return { success: true };
  }),
});
