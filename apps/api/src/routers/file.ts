import type { File as DBFile } from "../db.js";

import "dotenv/config";

import { ReadableStream } from "stream/web";
import { Hono } from "hono";

import type { Env } from "../index.js";
import { validateSession } from "../api/auth/index.js";
import { uploadLimit } from "../config.js";
import { prisma } from "../db.js";
import { Storage } from "../utils/storage.js";

const app = new Hono<Env>();

app.post("/upload", validateSession, async ({ req, ...c }) => {
  try {
    const body = await req.parseBody({ all: true });
    const storage = new Storage();
    const session = c.get("session");
    const files = (Array.isArray(body.file) ? body.file : [body.file]) as
      | File[]
      | null;

    if (!session?.user) {
      c.status(401);
      return c.json({ message: "unauthorized" });
    }

    if (!files) {
      c.status(400);
      return c.json({ message: "File/s is required" });
    }

    const uploadedFiles: Promise<DBFile>[] = [];

    for (const file of files) {
      try {
        const uploadedFile = uploadLimit(() =>
          storage.uploadFile({ file: file, userId: session.user.id }),
        );
        uploadedFiles.push(uploadedFile as Promise<DBFile>);
      } catch {
        /* empty */
      }
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

app.get("/download/:id", async ({ req, ...c }) => {
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

    const stream = new ReadableStream({
      async start(controller) {

        console.log(process.env.NODE_ENV)

        if (process.env.NODE_ENV === "development") {
          const chunkSize = 1024 * 100; // Size of each chunk in bytes
          const data = fileData.data;
          let offset = 0;

          while (offset < data.byteLength) {
            const chunk = data.slice(offset, offset + chunkSize);
            controller.enqueue(chunk);
            offset += chunkSize;

            await delay(250); // Adjust delay time in milliseconds
          }
        } else {
          controller.enqueue(fileData.data);
        }

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": file.mimetype,
        "Content-Disposition": `attachment; filename="${Buffer.from(file.name, "ascii").toString("utf-8")}"`,
        "Content-Length": String(fileData.data.byteLength),
      },
    });
  } catch (error) {
    console.error("Error downloading file:", error);
    return c.json({ message: "Internal server error" });
  }
});

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

app.get("/thumbnail/:id", async ({ req, ...c }) => {
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
