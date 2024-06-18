import { serve } from "@hono/node-server";
import { trpcServer } from "@hono/trpc-server";

import "dotenv/config";

import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { Hono } from "hono";
import { hc } from "hono/client";
import { compress } from "hono/compress";
import { cors } from "hono/cors";

import type { validateHonoSession } from "./api/auth/index.js";
import type { AppRouter } from "./api/index.js";
import { authRouter } from "./api/auth/router.js";
import { appRouter } from "./api/index.js";
import { createTRPCContext } from "./api/trpc.js";
import { fileRouter } from "./routers/file.js";

export interface Env {
  Variables: {
    session: Awaited<ReturnType<typeof validateHonoSession>>;
  };
}

const app = new Hono<Env>({
  strict: true,
});

app.use(compress());
app.use(cors());
app.use(
  "/api/*",
  trpcServer({
    router: appRouter,
    createContext(_opts, { req }) {
      const [_emptySpace, sessionId = ""] = (
        req.header("authorization") ?? ""
      ).split("Bearer");
      return createTRPCContext({ sessionId: sessionId.trim() });
    },
  }),
);

const routes = app
  .route("/auth", authRouter)
  .route("/auth", authRouter)
  .route("/files", fileRouter)
  .get("/", (c) => c.json({ message: "Hello world!" }));

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (opts) => {
    console.log(opts);
    //client.launch(() => console.log("[Telegraf] Bot Started!!"));
  },
);

type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helpers for output types
 * @example
 * type AllPostsOutput = RouterOutputs['post']['all']
 *      ^? Post[]
 **/
type RouterOutputs = inferRouterOutputs<AppRouter>;

export {
  appRouter,
  type AppRouter,
  app,
  type RouterInputs,
  type RouterOutputs,
};

export type HonoRouter = typeof routes;
export * from "./api/auth/router.js";
export const honoClient = hc<HonoRouter>("http://localhost:3000/");
