// authors.ts
import { Hono } from "hono";

import { signIn, signUp, UserCreds } from "./password.js";

const app = new Hono();

app.post("/signin", async ({ req, res, ...c }) => {
  try {
    const body = await req.json();
    const userCreds = body as UserCreds;

    return c.json(await signIn(userCreds));
  } catch (err) {
    return c.json({ message: (err as Error).message });
  }
});

app.post("/signup", async ({ req, res, ...c }) => {
  try {
    const body = await req.json();
    const userCreds = body as UserCreds;

    return c.json(await signUp(userCreds));
  } catch (err) {
    return c.json({ message: (err as Error).message });
  }
});

export { app as authRouter };
