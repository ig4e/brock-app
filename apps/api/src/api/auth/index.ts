import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { bearerAuth } from "hono/bearer-auth";
import { Lucia } from "lucia";

import { prisma, User } from "../../db.js";

const adapter = new PrismaAdapter(prisma.session, prisma.user);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes: (attributes) => {
    return {
      // attributes has the type of DatabaseUserAttributes
      username: attributes.username,
    };
  },
});

export const validateHonoSession = async function ({
  sessionId,
}: {
  sessionId: string;
}) {
  const { session, user } = await lucia.validateSession(sessionId.trim());

  if (!session || !user) return null;

  return { session, user };
};

export const validateSession = bearerAuth({
  verifyToken: async (token, c) => {
    const session = await validateHonoSession({ sessionId: token });
    c.set("session", session);
    return !!session?.user;
  },
});

export const HASH_OPTIONS = {
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
};

// IMPORTANT!
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: User;
  }
}
