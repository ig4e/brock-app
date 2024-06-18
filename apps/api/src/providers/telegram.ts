import { Readable } from "stream";
import axios from "axios";
import { filesize } from "filesize";
import { Markup, Telegraf } from "telegraf";

import { config } from "../config.js";
import { prisma } from "../db.js";

export const client = new Telegraf(process.env.TELEGRAM_BOT_TOKEN ?? "ERR");

client.start(async (ctx) => {
  const commands = Markup.keyboard(["/ping", "/info"]).resize().oneTime();

  await ctx
    .reply(
      "Welcome to brock, your guide to unlimted storage, \n/ping - chat id\n/info - general info",
      commands,
    )
    .catch(console.error);
});

client.command("ping", async (ctx) => {
  await ctx.reply(`Pong!, chatId: "${ctx.chat.id}"`).catch(console.error);
});

client.command("info", async (ctx) => {
  const [files, users, chunks] = await Promise.all([
    prisma.file.aggregate({
      _count: true,
      _sum: { size: true },
      _avg: { size: true },
      _min: { size: true },
      _max: { size: true },
    }),
    prisma.user.aggregate({
      _count: true,
    }),
    prisma.chunk.aggregate({
      _count: true,
    }),
  ]);

  await ctx
    .reply(
      `Total Users: ${users._count}\nTotal Files: ${files._count}\nTotal Chunks: ${chunks._count}\nTotal Size: ${filesize(
        files._sum.size?.toString() ?? "0",
      )}\nTotal Channels: ${config.chatIDs.length}`,
    )
    .catch(console.error);
});

export class TelegramProvider {
  async uploadFile({ data }: { data: Buffer }) {
    let response: any | undefined;
    let retries = 0;

    while (!response && retries < 10) {
      try {
        const chatId =
          config.chatIDs[Math.floor(Math.random() * config.chatIDs.length)];
        response = await client.telegram.sendDocument(chatId!, {
          source: data,
        });
        console.log("Uploaded file to Telegram");
      } catch (err) {
        console.error(err);
        const retryAfter = (err as any).response.parameters.retry_after;
        console.log(`Retrying in ${retryAfter} seconds`);
        await new Promise((resolve) =>
          setTimeout(resolve, (retryAfter ?? 2) * 1000),
        );
      }
      retries++;
    }

    if (!response) throw new Error("Failed to upload file");

    const {
      chat: { id: mChatId },
      message_id: messageId,
      document: { file_id: fileId },
    } = response;

    const fileUrl = (await client.telegram.getFileLink(fileId)).toString();

    return {
      url: fileUrl,
      telegram: {
        fileId: fileId,
        chatId: mChatId,
        messageId: messageId,
      },
    };
  }

  async uploadVideo({ data }: { data: Buffer }) {
    let response:
      | Awaited<ReturnType<typeof client.telegram.sendVideo>>
      | undefined;
    let retries = 0;

    while (!response && retries < 10) {
      try {
        const chatId =
          config.chatIDs[Math.floor(Math.random() * config.chatIDs.length)];
        response = await client.telegram.sendVideo(chatId!, {
          source: data,
        });
        console.log("Uploaded file to Telegram");
      } catch (err) {
        console.error(err);
        const retryAfter = (err as any).response.parameters.retry_after;
        console.log(`Retrying in ${retryAfter} seconds`);
        await new Promise((resolve) =>
          setTimeout(resolve, (retryAfter ?? 2) * 1000),
        );
      }
      retries++;
    }

    if (!response) throw new Error("Failed to upload file");

    const {
      chat: { id: mChatId },
      message_id: messageId,
      video: { file_id: fileId },
    } = response;

    const fileUrl = (await client.telegram.getFileLink(fileId)).toString();

    return {
      url: fileUrl,
      vide: response.video,
      telegram: {
        fileId: fileId,
        chatId: mChatId,
        messageId: messageId,
      },
    };
  }

  async downloadChunk({
    id,
    stream,
  }: {
    id: string;
    stream: false;
  }): Promise<Buffer>;
  async downloadChunk({
    id,
    stream,
  }: {
    id: string;
    stream: true;
  }): Promise<Readable>;
  async downloadChunk({ id, stream = false }: { id: string; stream: boolean }) {
    const chunkUrl = (await client.telegram.getFileLink(id)).toString();

    const response = await axios.get(chunkUrl, {
      responseType: stream ? "stream" : "arraybuffer",
    });

    return response.data;
  }

  async deleteFile({ id }: { id: string }): Promise<void> {
    const file = await prisma.file.findUnique({
      where: { id: id },
    });

    // if (file && file.telegram) {
    //   await client.telegram.deleteMessage(
    //     file.telegram.chatId,
    //     file.telegram.messageId,
    //   );
    // }
  }
}
