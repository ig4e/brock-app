import { authRouter } from "./routers/auth.js";
import { fileRouter } from "./routers/file.js";
import { folderRouter } from "./routers/folder.js";
import { createTRPCRouter, publicProcedure } from "./trpc.js";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  file: fileRouter,
  folder: folderRouter,
  auth: authRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
