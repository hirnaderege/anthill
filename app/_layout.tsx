import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { RouteProvider } from "../context/RouteContext";

export default function rootLayout() {
  return (
    <RouteProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="results" options={{ headerShown: true, title: " route options " }} />
        <Stack.Screen name="navigate" options={{ headerShown: true, title: " navigating " }} />
      </Stack>
      <StatusBar style="auto" />
    </RouteProvider>
  );
} // end of rootLayout