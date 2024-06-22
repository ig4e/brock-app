import * as FileSystem from "expo-file-system";

import type { File } from "@acme/api";

import { DownloadStatus, useDownloadStore } from "~/stores/download";
import { useSettingsStore } from "~/stores/settings";
import { getBaseUrl } from "./base-url";

async function saveDownload({ id }: { id: string }) {
  const downloadStore = useDownloadStore.getState();
  const settingsStore = useSettingsStore.getState();
  const download = downloadStore.getDownload({ id });

  let allowedDir = settingsStore.allowedDir;

  if (!allowedDir) {
    const permissions =
      await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

    if (permissions.granted) {
      settingsStore.setAllowedDir(permissions.directoryUri);
      allowedDir = permissions.directoryUri;
    }
  }

  if (!allowedDir) return;

  const base64 = await FileSystem.readAsStringAsync(download.fileUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  await FileSystem.StorageAccessFramework.createFileAsync(
    allowedDir,
    download.name,
    download.mimeType,
  )
    .then(async (uri) => {
      await FileSystem.writeAsStringAsync(uri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
    })
    .catch((e) => console.log(e));
}

function downloadCallback({
  id,
  data,
}: {
  id: string;
  fileName: string;
  data: {
    totalBytesExpectedToWrite: number;
    totalBytesWritten: number;
  };
}) {
  const downloadStore = useDownloadStore.getState();

  if (data.totalBytesWritten === data.totalBytesExpectedToWrite) {
    downloadStore.updateDownload({
      fileId: id,
      status: DownloadStatus.Completed,
      totalBytesExpectedToWrite: data.totalBytesExpectedToWrite,
      totalBytesWritten: data.totalBytesWritten,
    });
  } else {
    downloadStore.updateDownload({
      fileId: id,
      status: DownloadStatus.Downloading,
      totalBytesExpectedToWrite: data.totalBytesExpectedToWrite,
      totalBytesWritten: data.totalBytesWritten,
    });
  }
}

export function startDownload({ file }: { file: File }) {
  try {
    const downloadStore = useDownloadStore.getState();

    const downloadResumable = FileSystem.createDownloadResumable(
      `${getBaseUrl()}/files/download/${file.id}`,
      FileSystem.documentDirectory + file.name,
      {},
      (data) =>
        void downloadCallback({ data, id: file.id, fileName: file.name }),
    );

    downloadStore.addDownload({
      fileId: file.id,
      name: file.name,
      status: DownloadStatus.Downloading,
      ...downloadResumable.savable(),
      totalBytesExpectedToWrite: 1,
      totalBytesWritten: 0,
      mimeType: file.mimetype,
    });

    void downloadResumable
      .downloadAsync()
      .then((result) => {
        if (result) {
          void saveDownload({ id: file.id });
        }
      })
      .catch(console.log);

    return downloadResumable;
  } catch (error) {
    console.error("Error starting download:", error);
  }
}

export function getDownload({ id }: { id: string }) {
  const downloadStore = useDownloadStore.getState();
  const download = downloadStore.getDownload({ id });

  const downloadResumable = new FileSystem.DownloadResumable(
    download.url,
    download.fileUri,
    download.options,
    (data) =>
      void downloadCallback({
        data,
        id: download.fileId,
        fileName: download.name,
      }),
    download.resumeData,
  );

  return downloadResumable;
}

export function resumeDownload({ id }: { id: string }) {
  try {
    const downloadStore = useDownloadStore.getState();
    const download = getDownload({
      id,
    });

    downloadStore.updateDownload({
      fileId: id,
      status: DownloadStatus.Downloading,
    });

    download
      .resumeAsync()
      .then((result) => {
        if (result) {
          void saveDownload({ id });
        }
      })
      .catch(console.log);
  } catch (error) {
    console.error("Error resuming download:", error);
  }
}

export function pauseDownload({ id }: { id: string }) {
  try {
    const downloadStore = useDownloadStore.getState();
    const download = getDownload({
      id,
    });

    download.resumeAsync().then(console.log).catch(console.log);

    download
      .pauseAsync()
      .then(() => {
        downloadStore.updateDownload({
          fileId: id,
          status: DownloadStatus.Paused,
        });
      })
      .catch(console.log);
  } catch (error) {
    console.error("Error pausing download:", error);
  }
}

export function cancelDownload({ id }: { id: string }) {
  try {
    const downloadStore = useDownloadStore.getState();
    const download = getDownload({
      id,
    });

    download
      .cancelAsync()
      .then(() => {
        downloadStore.removeDownload(id);
      })
      .catch(console.log);
  } catch (error) {
    console.error("Error canceling download:", error);
  }
}
