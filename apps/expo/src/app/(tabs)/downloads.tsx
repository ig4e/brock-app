import { FlashList } from "@shopify/flash-list";
import { Pause, Play, Trash } from "@tamagui/lucide-icons";
import {
  Button,
  Paragraph,
  Progress,
  ScrollView,
  Theme,
  View,
  XStack,
  YStack,
} from "tamagui";

import { DownloadStatus, useDownloadStore } from "~/stores/download";
import {
  cancelDownload,
  pauseDownload,
  resumeDownload,
} from "~/utils/download";

export default function Index() {
  const downloadStore = useDownloadStore();

  return (
    <Theme name="dark_purple">
      <View p={"$4"} position="relative" flex={1}>
        <ScrollView flex={1}>
          <FlashList
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
                      <Progress value={progress} flex={1}>
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
            estimatedItemSize={200}
          />
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
    </Theme>
  );
}
