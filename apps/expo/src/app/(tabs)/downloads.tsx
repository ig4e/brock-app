import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FlashList } from "@shopify/flash-list";
import { Pause, Play } from "@tamagui/lucide-icons";
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

import type { Download } from "~/utils/download";
import {
  DOWNLOAD_KEY,
  DownloadStatus,
  pauseDownload,
  resumeDownload,
} from "~/utils/download";

export default function Index() {
  const [downloads, setDownloads] = useState<Download[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      void AsyncStorage.getItem(DOWNLOAD_KEY).then((downloads) => {
        setDownloads(JSON.parse(downloads ?? "[]") as Download[]);
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <Theme name="dark_purple">
      <View p={"$4"} position="relative" flex={1}>
        <ScrollView flex={1}>
          <FlashList
            data={downloads}
            renderItem={({ item }) => {
              const progress = Math.ceil(
                ((item.totalBytesWritten ?? 0) * 100) /
                  (item.totalBytesExpectedToWrite ?? 1),
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
