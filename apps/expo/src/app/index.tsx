import { Skeleton } from "moti/skeleton";
import { Text, View } from "tamagui";

import { api } from "~/utils/api";

export default function Index() {
  const { isLoading, isLoadingError } = api.hello.useQuery();

  return <View>
    
  </View>;
}
