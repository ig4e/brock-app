import type { DocumentPickerAsset } from "expo-document-picker";
import * as FileSystem from "expo-file-system";

import { useAuthStore } from "~/stores/auth";
import { UploadStatus, useUploadStore } from "~/stores/upload";
import { getBaseUrl } from "./base-url";

function uploadCallback({
  fileUri,
  data,
}: {
  fileUri: string;
  data: {
    totalBytesExpectedToSend: number;
    totalBytesSent: number;
  };
}) {
  const uploadStore = useUploadStore.getState();

  if (data.totalBytesSent === data.totalBytesExpectedToSend) {
    uploadStore.updateUpload({
      fileUri,
      status: UploadStatus.Completed,
      totalBytesExpectedToSend: data.totalBytesExpectedToSend,
      totalBytesSent: data.totalBytesSent,
    });
  } else {
    uploadStore.updateUpload({
      fileUri,
      status: UploadStatus.Uploading,
      totalBytesExpectedToSend: data.totalBytesExpectedToSend,
      totalBytesSent: data.totalBytesSent,
    });
  }
}

export function startUpload({ asset }: { asset: DocumentPickerAsset }) {
  try {
    const uploadStore = useUploadStore.getState();
    const authStore = useAuthStore.getState();

    const task = new FileSystem.UploadTask(
      getBaseUrl() + "/files/upload",
      asset.uri,
      {
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        fieldName: "file",
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${authStore.token}`,
          "x-trpc-source": "expo-react",
        },
        httpMethod: "POST",
        mimeType: asset.mimeType,
      },
      (data) => uploadCallback({ fileUri: asset.uri, data }),
    );

    uploadStore.addUpload({
      fileUri: asset.uri,
      status: UploadStatus.Uploading,
      mimeType: asset.mimeType ?? "",
      totalBytesExpectedToSend: 1,
      totalBytesSent: 0,
    });

    void task
      .uploadAsync()
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
        uploadStore.removeUpload(asset.uri);
      });

    return task;
  } catch (error) {
    console.error("Error starting upload:", error);
  }
}

// export function getUpload({ id }: { id: string }) {
//   const uploadStore = useUploadStore.getState();
//   const upload = uploadStore.getUpload({ id });

//   const uploadResumable = new FileSystem.UploadResumable(
//     upload.url,
//     upload.fileUri,
//     upload.options,
//     (data) =>
//       void uploadCallback({
//         data,
//         id: upload.fileUri,
//         fileName: upload.name,
//       }),
//     upload.resumeData,
//   );

//   return uploadResumable;
// }

// export function cancelUpload({ id }: { id: string }) {
//   try {
//     const uploadStore = useUploadStore.getState();
//     const upload = getUpload({
//       id,
//     });

//     upload
//       .cancelAsync()
//       .then(() => {
//         uploadStore.removeUpload(id);
//       })
//       .catch(console.log);
//   } catch (error) {
//     console.error("Error canceling upload:", error);
//   }
// }
