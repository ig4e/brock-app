import { useState } from "react";
import { Share as RNShare } from "react-native";
import { Link } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import {
  Box,
  CircleEllipsis,
  Download,
  Info,
  Pencil,
  Plus,
  Share,
  Trash,
} from "@tamagui/lucide-icons";
import { useToastController } from "@tamagui/toast";
import { filesize } from "filesize";
import {
  Button,
  Image,
  ScrollView,
  Sheet,
  Text,
  Theme,
  View,
  XStack,
  YStack,
} from "tamagui";

import type { RouterOutputs } from "~/utils/api";
import { api } from "~/utils/api";
import { startDownload } from "~/utils/download";

export default function Index() {
  const { data } = api.file.getMany.useInfiniteQuery(
    { limit: 50 },
    { getNextPageParam: ({ nextCursor }) => nextCursor },
  );

  const items = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <Theme name="dark_purple">
      <View p={"$4"} position="relative">
        <ScrollView>
          <FlashList
            data={items}
            renderItem={({ item }) => {
              return <FileRow item={item} key={item.id} />;
            }}
            estimatedItemSize={200}
          />

          <Link href={"/(auth)/login"} asChild>
            <Button>
              <Text>Login</Text>
            </Button>
          </Link>
        </ScrollView>

        <Button
          w={"$4"}
          borderRadius={"$12"}
          position="absolute"
          bottom="$4"
          right="$4"
        >
          <Plus size={"$2"} />
        </Button>
      </View>
    </Theme>
  );
}

function FileRow({
  item,
}: {
  item: RouterOutputs["file"]["getMany"]["items"][number];
}) {
  const thumbnail = `http://192.168.1.40:3000/files/thumbnail/${item.thumbnail?.id}`;
  const [isOpen, setIsOpen] = useState(false);
  const fileUrl = `http://192.168.1.40:3000/files/download/${item.id}`;
  const toast = useToastController();

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
                  void startDownload({
                    fileName: item.name,
                    fileId: item.id,
                    callback(data) {
                      console.log(data);
                    },
                  })
                    .then(() => {
                      toast.show("Started", {
                        message: `Started downloading`,
                        preset: "success",
                      });
                    })
                    .catch((error: Error) => {
                      toast.show("Failed", {
                        message: error.message,
                        preset: "destructive",
                      });
                    });
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
            >
              <Text>Delete</Text>
            </Button>
          </View>
        </Sheet.Frame>
      </Sheet>
    </>
  );
}
