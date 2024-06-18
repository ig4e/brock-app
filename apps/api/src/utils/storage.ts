import { Buffer } from "buffer";
import { randomUUID } from "crypto";
import fs from "fs";
import os from "os";
import path from "path";
import { PassThrough, Readable, Writable } from "stream";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
import { uniqueId } from "lodash";
import { createFsFromVolume, Volume } from "memfs";
import mime from "mime";
import sharp from "sharp";
import { v1 } from "uuid";

import { internalUploadChunkLimit } from "../config.js";
import { prisma } from "../db.js";
import { TelegramProvider } from "../providers/telegram.js";

ffmpeg.setFfmpegPath(ffmpegPath.path);

function bufferToStream(buffer: Buffer): Readable {
  const readable = new Readable();
  readable._read = () => {};
  readable.push(buffer);
  readable.push(null);
  return readable;
}

class WritableBufferStream extends Writable {
  private chunks: Buffer[] = [];

  _write(chunk: any, encoding: string, callback: Function) {
    this.chunks.push(Buffer.from(chunk));
    callback();
  }

  getBuffer() {
    return Buffer.concat(this.chunks);
  }
}

async function getThumbnail(
  buffer: Buffer,
  timeInSeconds: number,
  format: string,
): Promise<Buffer> {
  const inputStream = bufferToStream(buffer);
  const outputStream = new WritableBufferStream();

  return new Promise((resolve, reject) => {
    ffmpeg(inputStream)
      .inputOptions([
        `-ss ${timeInSeconds}`,
        "-analyzeduration 100M",
        "-probesize 50M",
      ])
      .inputFormat(format) // Use the file format
      .outputOptions(["-vframes 1", "-f image2pipe", "-vcodec png"])
      .format("image2pipe")
      .on("start", (commandLine) => {
        console.log("Spawned ffmpeg with command: " + commandLine);
      })
      .on("progress", (progress) => {
        console.log(
          "Processing: " +
            (progress.percent ? progress.percent.toFixed(2) : 0) +
            "% done",
        );
      })
      .on("stderr", (stderrLine) => {
        console.log("Stderr output: " + stderrLine);
      })
      .on("error", (err) => {
        console.error("Error: " + err.message);
        reject(err);
      })
      .on("end", () => {
        try {
          const resultBuffer = outputStream.getBuffer();
          if (resultBuffer.length === 0) {
            reject(new Error("Output buffer is empty"));
          } else {
            resolve(resultBuffer);
          }
        } catch (err) {
          reject(err);
        }
      })
      .pipe(outputStream, { end: true });
  });
}

export class Storage {
  private CHUNK_SIZE = 20 * 1024 * 1024;
  telegram = new TelegramProvider();

  async downloadFile({
    fileId,
  }: {
    fileId: string;
  }): Promise<{ data: Buffer | Readable; type: "buffer" | "stream" }> {
    const fileEntry = await prisma.file.findUnique({
      where: { id: fileId },
      include: {
        chunks: {
          orderBy: { number: "asc" },
        },
      },
    });

    if (!fileEntry?.id) {
      throw new Error("File not found");
    }

    const chunks = fileEntry.chunks;

    if (chunks.length > 1) {
      const chunkBuffers = [];

      for (const chunk of chunks) {
        const chunkBuffer = await this.telegram.downloadChunk({
          id: chunk.telegram.fileId,
          stream: false,
        });
        chunkBuffers.push(chunkBuffer);
      }

      return {
        data: Buffer.concat(chunkBuffers),
        type: "buffer",
      };
    } else {
      return {
        data: await this.telegram.downloadChunk({
          id: chunks[0]!.telegram.fileId,
          stream: true,
        }),
        type: "stream",
      };
    }
  }

  async uploadFile({ file, userId }: { file: File; userId: string }) {
    const totalChunks = Math.ceil(file.size / this.CHUNK_SIZE);
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileThumbnail = await this.generateThumbnail({ file });
    const encodedFileName = Buffer.from(file.name, "ascii").toString("utf-8");

    const fileEntry = await prisma.file.create({
      data: {
        name: encodedFileName,
        size: file.size,
        mimetype: file.type ?? mime.getType(file.name),
        encoding: "utf8",
        user: {
          connect: {
            id: userId,
          },
        },
        thumbnail: fileThumbnail
          ? {
              create: {
                name: `thumb-${v1()}.${fileThumbnail.thumbnailMetadata.ext}`,
                telegram: fileThumbnail.thumbnail.telegram,
                mimetype: fileThumbnail.thumbnailMetadata.mimetype,
              },
            }
          : undefined,
      },
    });

    const uploadPromises = [];

    for (let i = 0; i < totalChunks; i++) {
      const start = i * this.CHUNK_SIZE;
      const end = Math.min(start + this.CHUNK_SIZE, file.size);
      const chunk = fileBuffer.slice(start, end);

      uploadPromises.push(
        internalUploadChunkLimit(() =>
          this.uploadChunk({ chunk, fileId: fileEntry.id, i }),
        ),
      );
    }

    await Promise.all(uploadPromises);

    return await prisma.file.findUnique({
      where: { id: fileEntry.id },
      include: {
        thumbnail: true,
      },
    });
  }

  private async generateThumbnail({ file }: { file: File }) {
    const thumbnail = await this.generateThumbnailBuffer({ file });

    if (thumbnail) {
      const telegramThumbnail = await this.telegram.uploadFile({
        data: thumbnail.buffer,
      });

      return { thumbnail: telegramThumbnail, thumbnailMetadata: thumbnail };
    }
  }

  private async generateThumbnailBuffer({ file }: { file: File }) {
    //if the file is an image
    if (file.type.startsWith("image")) {
      const buffer = await sharp(await file.arrayBuffer())
        .resize(400)
        .jpeg({ quality: 80 })
        .toBuffer();

      return {
        buffer,
        mimetype: "image/jpeg",
        size: buffer.length,
        encoding: "utf8",
        ext: "jpg",
      };
    } else if (file.type.startsWith("video")) {
      const thumbnailBuffer = await this.generateVideoThumbnail(
        Buffer.from(await file.arrayBuffer()),
      ).catch(() => {
        return null; // Ignore errors
      });

      if (!thumbnailBuffer) return null;

      const buffer = await sharp(thumbnailBuffer)
        .resize(400)
        .jpeg({ quality: 80 })
        .toBuffer();

      return {
        buffer,
        mimetype: "image/jpeg",
        size: buffer.length,
        encoding: "utf8",
        ext: "jpg",
      };
    }
  }

  private generateVideoThumbnail(fileBuffer: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const fileStream = new PassThrough();
      fileStream.end(fileBuffer);

      const tempFilePath = path.join(
        os.tmpdir(),
        `temp_video_file_${Date.now()}.mp4`,
      );

      fs.writeFile(tempFilePath, fileBuffer, async (err) => {
        if (err) {
          return reject(err);
        }

        const outputFilePath = path.join(
          os.tmpdir(),
          `thumbnail_${Date.now()}.jpg`,
        );

        const duration = await this.getVideoDuration(tempFilePath);
        const timestamp = (duration * 0.1).toFixed(2);

        ffmpeg(tempFilePath)
          .on("end", () => {
            fs.readFile(outputFilePath, (readErr, data) => {
              if (readErr) {
                return reject(readErr);
              }
              resolve(data);
              fs.unlink(tempFilePath, () => {});
              fs.unlink(outputFilePath, () => {});
            });
          })
          .on("error", (ffmpegErr) => {
            reject(ffmpegErr);
          })
          .screenshots({
            count: 1,
            timemarks: [timestamp],
            size: "400x?",
            filename: outputFilePath,
          });
      });
    });
  }

  private async getVideoDuration(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          //@ts-expect-error eh
          resolve(metadata.format.duration);
        }
      });
    });
  }

  private async uploadChunk({
    chunk,
    fileId,
    i,
  }: {
    chunk: Buffer;
    fileId: string;
    i: number;
  }) {
    const uploadedChunk = await this.telegram.uploadFile({ data: chunk });

    return await prisma.chunk.create({
      data: {
        number: i,
        file: {
          connect: { id: fileId },
        },
        telegram: uploadedChunk.telegram,
      },
    });
  }
}
