// authors.ts
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { signIn, signUp, UserCreds } from "./password.js";

const app = new Hono()
  .post(
    "/signin",
    zValidator(
      "json",
      z.object({
        username: z.string(),
        password: z.string(),
      }),
    ),
    async ({ req, res, ...c }) => {
      try {
        const userCreds = req.valid("json");

        return c.json(await signIn(userCreds));
      } catch (err) {
        return c.json({ message: (err as Error).message });
      }
    },
  )
  .post(
    "/signup",
    zValidator(
      "json",
      z.object({
        username: z.string(),
        password: z.string(),
      }),
    ),
    async ({ req, res, ...c }) => {
      try {
        const userCreds = req.valid("json");
        return c.json(await signUp(userCreds));
      } catch (err) {
        return c.json({ message: (err as Error).message });
      }
    },
  );

export { app as authRouter };
