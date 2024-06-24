import { FlatList } from "react-native";
import { Pause, Play, Trash } from "@tamagui/lucide-icons";
import {
  Button,
  H3,
  Paragraph,
  Progress,
  ScrollView,
  View,
  XStack,
  YStack,
} from "tamagui";

import { DownloadStatus, useDownloadStore } from "~/stores/download";
import { UploadStatus, useUploadStore } from "~/stores/upload";
import {
  cancelDownload,
  pauseDownload,
  resumeDownload,
} from "~/utils/download";

export default function Index() {
  const downloadStore = useDownloadStore();
  const uploadStore = useUploadStore();

  return (
    <View p={"$4"} position="relative" flex={1}>
      <ScrollView flex={1}>
        <YStack gap={"$4"}>
          <H3>Uploads</H3>

          <FlatList
            data={uploadStore.uploads}
            renderItem={({ item }) => {
              const progress = Math.ceil(
                (item.totalBytesSent * 100) / item.totalBytesExpectedToSend,
              );

              return (
                <XStack mb={"$4"} gap={"$4"} alignItems="flex-end">
                  <YStack w={"100%"} flex={1}>
                    <Paragraph ellipse>{item.fileUri}</Paragraph>
                    <XStack alignItems="center" gap={"$2"}>
                      <Progress
                        value={progress}
                        flex={1}
                        theme={
                          item.status === UploadStatus.Completed
                            ? "green_active"
                            : undefined
                        }
                      >
                        <Progress.Indicator animation="bouncy" />
                      </Progress>
                      <Paragraph>{progress}%</Paragraph>
                    </XStack>
                  </YStack>

                  <XStack gap={"$2"}>
                    <Button theme="red" w={"$3"} h={"$3"} borderRadius={"$12"}>
                      <Trash size={"$1"} />
                    </Button>
                  </XStack>
                </XStack>
              );
            }}
          />

          <H3>Downloads</H3>

          <FlatList
            data={downloadStore.downloads}
            renderItem={({ item }) => {
              const progress = Math.ceil(
                (item.totalBytesWritten * 100) / item.totalBytesExpectedToWrite,
              );

              return (
                <XStack mb={"$4"} gap={"$4"} alignItems="flex-end">
                  <YStack w={"100%"} flex={1}>
                    <Paragraph ellipse>{item.name}</Paragraph>
                    <XStack alignItems="center" gap={"$2"}>
                      <Progress
                        value={progress}
                        flex={1}
                        theme={
                          item.status === DownloadStatus.Completed
                            ? "green_active"
                            : undefined
                        }
                      >
                        <Progress.Indicator animation="bouncy" />
                      </Progress>
                      <Paragraph>{progress}%</Paragraph>
                    </XStack>
                  </YStack>

                  <XStack gap={"$2"}>
                    {item.status === DownloadStatus.Downloading ? (
                      <Button
                        w={"$3"}
                        h={"$3"}
                        borderRadius={"$12"}
                        onPress={() => {
                          void pauseDownload({ id: item.fileId });
                        }}
                      >
                        <Pause size={"$1"} />
                      </Button>
                    ) : item.status === DownloadStatus.Paused ? (
                      <Button
                        w={"$3"}
                        h={"$3"}
                        borderRadius={"$12"}
                        onPress={() => {
                          void resumeDownload({ id: item.fileId });
                        }}
                      >
                        <Play size={"$1"} />
                      </Button>
                    ) : null}

                    <Button
                      theme="red"
                      w={"$3"}
                      h={"$3"}
                      borderRadius={"$12"}
                      onPress={() => cancelDownload({ id: item.fileId })}
                    >
                      <Trash size={"$1"} />
                    </Button>
                  </XStack>
                </XStack>
              );
            }}
          />
        </YStack>
      </ScrollView>

      <Button
        w={"$4"}
        borderRadius={"$12"}
        position="absolute"
        bottom="$4"
        right="$4"
      >
        <Pause size={"$2"} />
      </Button>
    </View>
  );
}
