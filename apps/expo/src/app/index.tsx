import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { Skeleton } from "moti/skeleton";
import {
  Button,
  Card,
  H2,
  Image,
  Paragraph,
  ScrollView,
  Text,
  View,
  YStack,
} from "tamagui";

import { api } from "~/utils/api";
import { useSession } from "~/utils/auth";

export default function Index() {
  const { isLoading, isLoadingError } = api.hello.useQuery();
  const { user } = useSession();
  const { data } = api.file.getMany.useInfiniteQuery(
    {},
    { getNextPageParam: ({ nextCursor }) => nextCursor },
  );

  return (
    <SafeAreaView>
      <ScrollView p={"$4"}>
        {user && <Text>Signed in as {user.username}</Text>}

        {data && (
          <YStack gap={"$4"}>
            {data.pages.flat().map((page) => {
              return page.items.map((file) => {
                const thumbnail = `http://192.168.1.40:3000/files/thumbnail/${file.thumbnail?.id}`;

                console.log(thumbnail);
                return (
                  <YStack
                    key={file.id}
                    gap={"$4"}
                    bg={"$accentBackground"}
                    borderRadius={"$4"}
                    p={"$4"}
                  >
                    <View
                      borderRadius={"$4"}
                      aspectRatio={"16/9"}
                      overflow="hidden"
                    >
                      <Image
                        src={thumbnail}
                        resizeMode={"cover"}
                        width={"100%"}
                        borderRadius={"$4"}
                        aspectRatio={"16/9"}
                      ></Image>
                    </View>
                    <View>
                      <Paragraph>{file.name}</Paragraph>
                    </View>
                  </YStack>
                );
              });
            })}
          </YStack>
        )}

        <Link href={"/(auth)/login"} asChild>
          <Button>
            <Text>Login</Text>
          </Button>
        </Link>
      </ScrollView>
    </SafeAreaView>
  );
}
