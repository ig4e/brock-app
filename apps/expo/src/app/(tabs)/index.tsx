import { useMemo, useState } from "react";
import { FlatList, Share as RNShare } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import {
  Box,
  CircleEllipsis,
  Download,
  File,
  Info,
  Pencil,
  Plus,
  RefreshCcw,
  Share,
  Trash,
} from "@tamagui/lucide-icons";
import { useToastController } from "@tamagui/toast";
import { filesize } from "filesize";
import { Skeleton } from "moti/skeleton";
import {
  Button,
  Image,
  ScrollView,
  Sheet,
  Text,
  View,
  XStack,
  YStack,
} from "tamagui";

import type { RouterOutputs } from "~/utils/api";
import { api } from "~/utils/api";
import { getBaseUrl } from "~/utils/base-url";
import { startDownload } from "~/utils/download";
import { startUpload } from "~/utils/upload";

export default function Index() {
  const { data, isLoading, isPending, fetchNextPage, refetch } =
    api.file.getMany.useInfiniteQuery(
      { limit: 20 },
      { getNextPageParam: ({ nextCursor }) => nextCursor },
    );

  const items = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  return (
    <View px={"$4"} position="relative" flex={1}>
      <Skeleton show={isPending || isLoading}>
        <FlatList
          style={{ marginTop: 16 }}
          refreshing={isLoading}
          onRefresh={() => refetch()}
          data={items}
          renderItem={({ item }) => {
            return <FileRow item={item} />;
          }}
          onEndReached={() => void fetchNextPage()}
        />
      </Skeleton>

      <NewFile refetch={refetch} />
    </View>
  );
}

function NewFile({ refetch }: { refetch: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        w={"$4"}
        borderRadius={"$12"}
        position="absolute"
        bottom="$4"
        right="$4"
        onPress={() => setIsOpen(true)}
      >
        <Plus size={"$2"} />
      </Button>

      <Sheet
        onOpenChange={setIsOpen}
        open={isOpen}
        zIndex={100_000}
        modal={true}
        dismissOnSnapToBottom
        snapPointsMode="fit"
      >
        <Sheet.Overlay />
        <Sheet.Handle />
        <Sheet.Frame p={"$4"}>
          <XStack
            gap={"$4"}
            borderBottomWidth="$1"
            pb={"$4"}
            mb={"$4"}
            borderColor={"$color3"}
          >
            <Text ellipse>New File</Text>
          </XStack>
          <ScrollView>
            <YStack gap={"$4"}>
              <Button
                icon={File}
                justifyContent="flex-start"
                onPress={() => {
                  DocumentPicker.getDocumentAsync({
                    copyToCacheDirectory: true,
                    multiple: true,
                  })
                    .then((res) => {
                      if (!res.canceled) {
                        for (const asset of res.assets) {
                          void startUpload({ asset });
                        }
                      }
                    })
                    .catch((err) => {
                      console.log(err);
                    });
                }}
              >
                <Text>Upload Files</Text>
              </Button>
              <Button
                icon={RefreshCcw}
                justifyContent="flex-start"
                onPress={() => refetch()}
              >
                DH3WH
              </Button>
            </YStack>
          </ScrollView>
        </Sheet.Frame>
      </Sheet>
    </>
  );
}

function FileRow({
  item,
}: {
  item: RouterOutputs["file"]["getMany"]["items"][number];
}) {
  const thumbnail = `${getBaseUrl()}/files/thumbnail/${item.thumbnail?.id}`;
  const [isOpen, setIsOpen] = useState(false);
  const fileUrl = `${getBaseUrl()}/files/download/${item.id}`;
  const toast = useToastController();

  const deleteFile = api.file.delete.useMutation({
    onSuccess: () => {
      toast.show("File deleted successfully", { duration: 3000 });
    },
    onError: () => {
      toast.show("Failed to delete file", { duration: 3000 });
    },
  });

  // const renameFile = api.file.rename.useMutation({
  //   onSuccess: () => {
  //     toast.show("File renamed successfully", { duration: 3000 });
  //   },
  //   onError: () => {
  //     toast.show("Failed to rename file", { duration: 3000 });
  //   },
  // });

  return (
    <>
      <XStack gap={"$4"} mb={"$4"}>
        {item.thumbnail?.id ? (
          <View
            borderRadius={"$4"}
            aspectRatio={"1/1"}
            maxWidth={"$4"}
            overflow="hidden"
          >
            <Image
              src={thumbnail}
              resizeMode={"cover"}
              width={"100%"}
              borderRadius={"$4"}
              aspectRatio={"1/1"}
            ></Image>
          </View>
        ) : (
          <Box size={"$4"} />
        )}

        <YStack gap={"$1"} flex={1}>
          <Text ellipse>{item.name}</Text>
          <Text color={"$color8"}>{filesize(item.size.toString())}</Text>
        </YStack>

        <Button
          chromeless
          w={"$4"}
          borderRadius={"$12"}
          onPress={() => setIsOpen(true)}
        >
          <CircleEllipsis size={"$2"} />
        </Button>
      </XStack>

      <Sheet
        onOpenChange={setIsOpen}
        open={isOpen}
        zIndex={100_000}
        modal={true}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay />
        <Sheet.Handle />
        <Sheet.Frame p={"$4"}>
          <XStack
            gap={"$4"}
            borderBottomWidth="$1"
            pb={"$4"}
            mb={"$4"}
            borderColor={"$color3"}
          >
            {item.thumbnail?.id ? (
              <View
                borderRadius={"$4"}
                aspectRatio={"1/1"}
                maxWidth={"$4"}
                overflow="hidden"
              >
                <Image
                  src={thumbnail}
                  resizeMode={"cover"}
                  width={"100%"}
                  borderRadius={"$4"}
                  aspectRatio={"1/1"}
                ></Image>
              </View>
            ) : (
              <Box size={"$4"} />
            )}

            <YStack gap={"$1"} flex={1}>
              <Text ellipse>{item.name}</Text>
              <Text color={"$color8"}>{filesize(item.size.toString())}</Text>
            </YStack>
          </XStack>
          <ScrollView>
            <YStack gap={"$4"}>
              <Button
                icon={Share}
                justifyContent="flex-start"
                onPress={() => {
                  void RNShare.share({
                    message: fileUrl,
                    title: item.name,
                  });
                }}
              >
                <Text>Share</Text>
              </Button>
              <Button
                icon={Download}
                justifyContent="flex-start"
                onPress={() => {
                  try {
                    startDownload({ file: item });
                    toast.show("Started", {
                      message: `Started downloading`,
                      preset: "success",
                    });
                  } catch (error) {
                    toast.show("Failed", {
                      message: (error as Error).message,
                      preset: "destructive",
                    });
                  }
                }}
              >
                <Text>Download</Text>
              </Button>
              <Button icon={Pencil} justifyContent="flex-start">
                <Text>Rename (maybe?)</Text>
              </Button>
              <Button icon={Info} justifyContent="flex-start">
                <Text>Details</Text>
              </Button>
            </YStack>
          </ScrollView>
          <View borderTopWidth="$1" pt={"$4"} mt={"$4"} borderColor={"$color3"}>
            <Button
              icon={Trash}
              justifyContent="flex-start"
              theme="red"
              borderColor={"$color3"}
              onPress={() =>
                deleteFile.mutate({
                  id: item.id,
                })
              }
            >
              <Text>Delete</Text>
            </Button>
          </View>
        </Sheet.Frame>
      </Sheet>
    </>
  );
}
