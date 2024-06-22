import type { DownloadOptions } from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export enum DownloadStatus {
  Pending,
  Downloading,
  Paused,
  Completed,
}

interface Download {
  name: string;
  fileId: string;
  fileUri: string;
  url: string;
  mimeType: string;
  options: DownloadOptions;
  resumeData?: string;
  totalBytesExpectedToWrite: number;
  totalBytesWritten: number;
  status: DownloadStatus;
}

export interface DownloadState {
  downloads: Download[];
}

export interface DownloadActions {
  removeDownload: (fileId: string) => void;
  addDownload: (download: Download) => void;
  updateDownload: (download: Partial<Download>) => void;
  getDownload: ({ id }: { id: string }) => Download;
  setState: (state: Partial<DownloadState>) => void;
}

export type DownloadStore = DownloadState & DownloadActions;

export const useDownloadStore = create<DownloadStore>()(
  persist(
    (set, get) => ({
      downloads: [],
      removeDownload: (fileId: string) => {
        const currentState = get();
        const downloads = currentState.downloads.filter(
          (download) => download.fileId !== fileId,
        );
        set({ downloads });
      },
      addDownload: (download: Download) => {
        const currentState = get();
        const downloads = [...currentState.downloads, download];
        set({ downloads });
      },
      updateDownload: (download: Partial<Download>) => {
        const currentState = get();
        const downloads = currentState.downloads.map((d) =>
          d.fileId === download.fileId ? { ...d, ...download } : d,
        );
        set({ downloads });
      },
      getDownload: ({ id }: { id: string }) => {
        const currentState = get();
        const download = currentState.downloads.find(
          (download) => download.fileId === id,
        );

        if (!download) {
          throw new Error(`Download with id ${id} not found`);
        }

        return download;
      },
      setState: (state: Partial<DownloadState>) => {
        set(state);
      },
    }),
    {
      name: "download-storage-v1",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
