import { hash, verify } from "@node-rs/argon2";

import { prisma } from "../../db.js";
import { HASH_OPTIONS, lucia } from "./index.js";

export interface UserCreds {
  password: string;
  username: string;
}

export async function signIn({ password, username }: UserCreds) {
  if (typeof username !== "string") {
    return {
      error: "Invalid username",
    };
  }

  if (
    typeof password !== "string" ||
    password.length < 6 ||
    password.length > 255
  ) {
    return {
      error: "Invalid password",
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  });

  if (!user) {
    return {
      error: "Incorrect username or password",
    };
  }

  const validPassword = await verify(user.password, password, HASH_OPTIONS);

  if (!validPassword) {
    return {
      error: "Incorrect username or password",
    };
  }

  const session = await lucia.createSession(user.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);

  return {
    user,
    sessionCookie,
    session,
  };
}

export async function signUp({ password, username }: UserCreds) {
  if (typeof username !== "string") {
    return {
      error: "Invalid username",
    };
  }

  if (
    typeof password !== "string" ||
    password.length < 6 ||
    password.length > 255
  ) {
    return {
      error: "Invalid password",
    };
  }

  const doesUserExist = await prisma.user.findUnique({
    where: {
      username,
    },
  });

  if (doesUserExist) {
    return {
      error: "Username already exists",
    };
  }

  const passwordHash = await hash(password, HASH_OPTIONS);

  const user = await prisma.user.create({
    data: {
      username,
      password: passwordHash,
    },
  });

  const session = await lucia.createSession(user.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);

  return {
    user,
    sessionCookie,
    session,
  };
}
