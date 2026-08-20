import { lazy, Suspense } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Props } from "./RouteMap.types";

const RouteMapLeaflet = lazy(() => import("./RouteMapLeaflet.web"));

export default function RouteMap(props: Props) {
  return (
    <View style={styles.wrapper}>
      <Suspense fallback={<View><Text>Loading map…</Text></View>}>
        <RouteMapLeaflet {...props} />
      </Suspense>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, width: "100%", height: "100%" },
});