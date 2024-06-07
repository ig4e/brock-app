import { File as DBFile } from "../db.js";

import "dotenv/config";

import { ReadableStream } from "stream/web";
import { Hono } from "hono";

import { validateSession } from "../api/auth/index.js";
import { uploadLimit } from "../config.js";
import { prisma } from "../db.js";
import { Env } from "../index.js";
import { Storage } from "../utils/storage.js";

const app = new Hono<Env>();

app.post("/upload", validateSession, async ({ req, res, ...c }) => {
  try {
    const body = await req.parseBody({ all: true });
    const storage = new Storage();
    const session = c.get("session");
    const files = (
      Array.isArray(body["file"]) ? body["file"] : [body["file"]]
    ) as File[];

    if (!session?.user) {
      c.status(401);
      return c.json({ message: "unauthorized" });
    }

    if (!files) {
      c.status(400);
      return c.json({ message: "File/s is required" });
    }

    const uploadedFiles: Promise<DBFile>[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const uploadedFile = uploadLimit(() =>
          storage.uploadFile({ file: file!, userId: session.user.id }),
        );
        if (uploadedFile) uploadedFiles.push(uploadedFile as Promise<DBFile>);
      } catch {}
    }

    const result = await Promise.all(uploadedFiles);

    if (result.length < 1) {
      c.status(500);
      return c.json({ message: "Couldn't upload" });
    }

    return c.json(
      result.map((file) => ({ ...file, size: file.size.toString() })),
    );
  } catch (error) {
    console.error("Error uploading file:", error);
    c.status(500);
    return c.json({ message: "Internal server error" });
  }
});

app.get("/download/:id", async ({ req, res, ...c }) => {
  try {
    const { id } = req.param();

    if (!id) {
      return c.json({ message: "File ID is required" });
    }

    const storage = new Storage();
    const file = await prisma.file.findUnique({ where: { id } });

    if (!file) {
      c.status(404);
      return c.json({ message: "File not found" });
    }

    const fileData = await storage.downloadFile({ fileId: id });

    c.header("Content-Type", file.mimetype);
    c.header(
      "Content-Disposition",
      `attachment; filename="${Buffer.from(file.name, "ascii").toString("utf-8")}"`,
    );

    if (fileData.type === "stream") {
      return c.body(fileData.data as unknown as ReadableStream);
    }

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(fileData.data);
        controller.close();
      },
    });

    return c.body(stream);
  } catch (error) {
    console.error("Error downloading file:", error);
    return c.json({ message: "Internal server error" });
  }
});

app.get("/thumbnail/:id", async ({ req, res, ...c }) => {
  try {
    const { id } = req.param();

    if (!id) {
      return c.json({ message: "Thumbnail ID is required" });
    }

    const thumbnail = await prisma.thumbnail.findUnique({ where: { id } });

    if (!thumbnail) {
      return c.json({ message: "Thumbnail ID is required" });
    }

    const storage = new Storage();

    c.header("Content-Type", thumbnail.mimetype);
    c.header(
      "Content-Disposition",
      `attachment; filename="${Buffer.from(thumbnail.name, "ascii").toString("utf-8")}"`,
    );

    return c.body(
      await storage.telegram.downloadChunk({
        id: thumbnail.telegram.fileId,
        stream: true,
      }),
    );
  } catch (error) {
    console.error("Error downloading file:", error);
    return c.json({ message: "Internal server error" });
  }
});

export { app as fileRouter };
