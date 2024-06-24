import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export enum UploadStatus {
  Pending,
  Uploading,
  Completed,
}

interface Upload {
  fileUri: string;
  mimeType: string;
  totalBytesExpectedToSend: number;
  totalBytesSent: number;
  status: UploadStatus;
}

export interface UploadState {
  uploads: Upload[];
}

export interface UploadActions {
  removeUpload: (fileUri: string) => void;
  addUpload: (upload: Upload) => void;
  updateUpload: (upload: Partial<Upload>) => void;
  getUpload: ({ id }: { id: string }) => Upload;
  setState: (state: Partial<UploadState>) => void;
}

export type UploadStore = UploadState & UploadActions;

export const useUploadStore = create<UploadStore>()(
  persist(
    (set, get) => ({
      uploads: [],

      removeUpload: (fileUri: string) => {
        const currentState = get();
        const uploads = currentState.uploads.filter(
          (upload) => upload.fileUri !== fileUri,
        );
        set({ uploads });
      },

      addUpload: (upload: Upload) => {
        const currentState = get();
        const uploads = [...currentState.uploads, upload];
        set({ uploads });
      },

      updateUpload: (upload: Partial<Upload>) => {
        const currentState = get();
        const uploads = currentState.uploads.map((d) =>
          d.fileUri === upload.fileUri ? { ...d, ...upload } : d,
        );
        set({ uploads });
      },

      getUpload: ({ id }: { id: string }) => {
        const currentState = get();
        const upload = currentState.uploads.find(
          (upload) => upload.fileUri === id,
        );

        if (!upload) {
          throw new Error(`Upload with id ${id} not found`);
        }

        return upload;
      },

      setState: (state: Partial<UploadState>) => {
        set(state);
      },
      
    }),
    {
      name: "upload-storage-v1",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
