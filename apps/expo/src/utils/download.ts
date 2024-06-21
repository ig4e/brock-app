import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { getBaseUrl } from "./base-url";

export const DOWNLOAD_KEY = "downloads6";

export enum DownloadStatus {
  Downloading,
  Paused,
  Completed,
}

export interface Download {
  name: string;
  fileId: string;
  fileUri: string;
  url: string;
  options: FileSystem.DownloadOptions;
  resumeData?: string;
  totalBytesExpectedToWrite?: number;
  totalBytesWritten?: number;
  status: DownloadStatus;
}

function updateDownloadState({
  data,
  fileId,
  callback,
}: {
  data: { totalBytesExpectedToWrite: number; totalBytesWritten: number };
  fileId: string;
  callback?: (data: {
    totalBytesExpectedToWrite: number;
    totalBytesWritten: number;
  }) => void;
}) {
  void updateDownload({
    id: fileId,
    data: {
      totalBytesWritten: data.totalBytesWritten,
      totalBytesExpectedToWrite: data.totalBytesExpectedToWrite,
    },
  });

  console.log(data);

  callback && void callback(data);
}

export async function startDownload({
  fileId,
  fileName,
  callback,
}: {
  fileId: string;
  fileName: string;
  callback: (data: {
    totalBytesExpectedToWrite: number;
    totalBytesWritten: number;
  }) => void;
}) {
  try {
    const downloadResumable = FileSystem.createDownloadResumable(
      `${getBaseUrl()}/files/download/${fileId}`,
      FileSystem.documentDirectory + fileName.replaceAll("/", "-"),
      {},
      (data) => updateDownloadState({ data, fileId, callback }),
    );

    const currentDownloads = JSON.parse(
      (await AsyncStorage.getItem(DOWNLOAD_KEY)) ?? "[]",
    ) as Download[];

    if (!currentDownloads.find((x) => x.fileId === fileId)) {
      currentDownloads.push({
        name: fileName,
        fileId,
        fileUri: FileSystem.documentDirectory + fileName.replaceAll("/", "-"),
        url: `${getBaseUrl()}/files/download/${fileId}`,
        options: {},
        resumeData: undefined,
        status: DownloadStatus.Downloading,
      });
    }

    await AsyncStorage.setItem(DOWNLOAD_KEY, JSON.stringify(currentDownloads));
    downloadResumable.downloadAsync().then(console.log).catch(console.log);

    return downloadResumable;
  } catch (error) {
    console.error("Error starting download:", error);
  }
}

export async function updateDownload({
  id,
  data,
}: {
  id: string;
  data: Partial<Download>;
}) {
  try {
    const currentDownloads = JSON.parse(
      (await AsyncStorage.getItem(DOWNLOAD_KEY)) ?? "[]",
    ) as Download[];

    await AsyncStorage.setItem(
      DOWNLOAD_KEY,
      JSON.stringify(
        currentDownloads.map((download) => {
          if (download.fileId === id) {
            return {
              ...download,
              ...data,
              status:
                data.totalBytesWritten === data.totalBytesExpectedToWrite
                  ? DownloadStatus.Completed
                  : DownloadStatus.Downloading,
            };
          }

          return download;
        }),
      ),
    );
  } catch (error) {
    console.error("Error updating download:", error);
  }
}

export async function getDownload({
  id,
  callback,
}: {
  id: string;
  callback: (data: {
    totalBytesExpectedToWrite: number;
    totalBytesWritten: number;
  }) => void;
}) {
  try {
    const download = (
      JSON.parse(
        (await AsyncStorage.getItem(DOWNLOAD_KEY)) ?? "[]",
      ) as Download[]
    ).find((download: Download) => download.fileId === id);

    if (download) {
      console.log(download);
      const downloadResumable = new FileSystem.DownloadResumable(
        download.url,
        download.fileUri,
        download.options,
        (data) => updateDownloadState({ data, fileId: id, callback }),
        download.resumeData,
      );

      return downloadResumable;
    } else {
      console.error(`No download found with id: ${id}`);
    }
  } catch (error) {
    console.error("Error getting download:", error);
  }
}

export async function resumeDownload({ id }: { id: string }) {
  try {
    const download = await getDownload({
      id,
      callback: () => {
        console;
      },
    });

    if (download) {
      console.log(`Resuming download with id: ${id}`);
      download
        .resumeAsync()
        .then(() => {
          void updateDownload({
            id,
            data: { status: DownloadStatus.Downloading },
          });
        })
        .catch(console.log);
    } else {
      console.error(`No download found with id: ${id}`);
    }
  } catch (error) {
    console.error("Error resuming download:", error);
  }
}

export async function pauseDownload({ id }: { id: string }) {
  try {
    const download = await getDownload({
      id,
      callback: () => {
        console;
      },
    });

    if (download) {
      console.log(`Pausing download with id: ${id}`);
      download
        .pauseAsync()
        .then(() => {
          void updateDownload({
            id,
            data: { status: DownloadStatus.Paused, ...download.savable() },
          });
        })
        .catch(console.log);
    } else {
      console.error(`No download found with id: ${id}`);
    }
  } catch (error) {
    console.error("Error pausing download:", error);
  }
}
