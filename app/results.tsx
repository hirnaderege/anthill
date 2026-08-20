import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import ElevationChart from "../components/elevationChart";
import { useRouteContext } from "../context/RouteContext";
import { getRoutes, Route } from "../services/routing";

const SCREEN_WIDTH = Dimensions.get("window").width;

type Units = "metric" | "imperial";
function formatDist(m: number, units: Units) {
  if (units === "imperial") {
    const feet = m * 3.28084;
    const miles = feet / 5280;
    return miles >= 0.1 ? `${miles.toFixed(1)} mi` : `${Math.round(feet)} ft`;
  }
  return m >= 1000 ? `${(m / 1000).toFixed(1)}  km` : `${Math.round(m)} m`;
}

function formatElevation(m: number, units: Units){
  return units === "imperial" ? `${Math.round(m * 3.28084)} ft ` : `${Math.round(m)} m`;
}

function formatDuration(s: number) {
  const mins = Math.round(s / 60);
  if (mins < 60)
    return `${mins} min`
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export default function resultsScreen() {
  const {startLat, startLng, endLat, endLng, mode} = useLocalSearchParams<{
    startLat: string;
    startLng: string;
    endLat: string;
    endLng: string;
    mode: string;
  }>();

  const [units, setUnits] = useState<Units>("imperial");
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedID, setSelectedID] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setSelectedRoute } = useRouteContext();
  const router = useRouter();

  useEffect(() => {
    async function fetchRoutes() {
      try {
        const result = await getRoutes(
          { latitude: parseFloat(startLat), longitude: parseFloat(startLng) },
          { latitude: parseFloat(endLat), longitude: parseFloat(endLng) },
          mode as "drive" | "walk" | "bike"
        );
        setRoutes(result);
        setSelectedID(0);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchRoutes();
  }, [startLat, startLng, endLat, endLng]);
  
  if(loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2E8B57" />
      <Text style={{ marginTop: 12 }}> finding routes ｡˚○ </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#c0392b" }}> {error} </Text>
      </View>
    );
  }

  if (routes.length === 0) {
    return (
      <View style={styles.center}>
        <Text> ᴖ̈ no routes found. try a different start or destination </Text>
      </View>
    );
  }
  
  const selected = routes[selectedID];
  const region = {
    latitude: selected.coordinates[0].latitude,
    longitude: selected.coordinates[0].longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  function startNavigation() {
    setSelectedRoute(selected);
    router.push("/navigate");
  }

  {/*
  function openInNativeMaps(){
    const start = selected.coordinates[0];
    const end = selected.coordinates[selected.coordinates.length - 1];

    const appleFlag = mode === "drive" ? "d" : "w";
    const googleMode = mode === "drive" ? "d" : mode === "bike" ? "b" : "w";

    const url = 
      Platform.OS === "ios"
        ? `http://maps.apple.com/?saddr=${start.latitude},${start.longitude}&daddr=${end.latitude},${end.longitude}&dirflg=${appleFlag}`
        : `google.navigation:q=${end.latitude},${end.longitude}&mode=${googleMode}`;
    
        Linking.openURL(url).catch(() => {
          const fallback = `https://www.google.com/maps/dir/?api=1&origin=${start.latitude},${start.longitude}&destination=${end.latitude},${end.longitude}&travelmode=${mode === "walk" ? "walking" : mode === "bike" ? "bicycling" : "driving"}`;
          Linking.openURL(fallback);
        });

  } // end of open 
 */}

  return (
    <View style={{ flex: 1 }}>
      <MapView style={styles.map} initialRegion={region}>
        {[...routes]
          .map((r, i) => ({ route: r, index: i }))
          .sort((a, b) => (a.index === selectedID ? 1 : b.index === selectedID ? -1 : 0))
          .map(({ route: r, index: i }) => (
            <Polyline
              key={r.id}
              coordinates={r.coordinates}
              strokeColor={i === selectedID ? "#2E8B57" : "#bbb"}
              strokeWidth={i === selectedID ? 5 : 3}
              tappable
              onPress={() => setSelectedID(i)}
            />
        ))}
        <Marker coordinate={selected.coordinates[0]} pinColor="green" />
        <Marker coordinate={selected.coordinates[selected.coordinates.length - 1]} pinColor="red" />
      </MapView>

      <ScrollView style={styles.container}>
        <Text style={styles.title}> {routes.length} routes found ( ⸝⸝´ ᵕ `⸝⸝) </Text>
        
        {/* units */}
        <TouchableOpacity
          style={styles.unitsToggle}
          onPress={() => setUnits(units === "imperial" ? "metric" : "imperial")}
        >
          <Text style={styles.unitsToggleText}>
            { units === "imperial" ? "switch to meters/km .ᐣ.ᐟ" : "switch to feet/miles .ᐣ.ᐟ"}
          </Text>
        </TouchableOpacity>

        {/* route cards */}
        {routes.map((r, i) => (
          <TouchableOpacity
            key={r.id}
            style={[styles.card, i === selectedID && styles.cardActive]}
            onPress={() => setSelectedID(i)}
            >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}> { i === 0 ? "flattest (•̀ᴗ•́ )و" : `alt ${i}`} </Text>
              <Text style={styles.cardAscent}> {formatElevation(r.ascent, units)} climb </Text>
            </View>
            <Text style={styles.cardSub}>
              {formatDist(r.distanceMeters, units)}  |  {formatDuration(r.durationSeconds)}
            </Text>
          </TouchableOpacity>
        ))}

        {/* elevation  */}
        <Text style={styles.chartLabel}> ᨒ elevation profile  ོ ☼ </Text>
        <ElevationChart
          elevations={selected.coordinates.map((c) => c.elevation)}
          width={SCREEN_WIDTH - 40}
        />

        {/* start button  */}
        <TouchableOpacity style={styles.navButton} onPress={startNavigation}>
          <Text style={styles.navButtonText}> start your journey </Text>
        </TouchableOpacity>
        
      </ScrollView>
  </View> 

  );
} // end of resultsScreen


const styles = StyleSheet.create({
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    padding: 20 
  },
  container: { 
    flex: 1, 
    padding: 16 
  },
  title: { 
    fontSize: 20, 
    fontWeight: "700",
    marginBottom: 12 
  },
  card: { 
    borderWidth: 1, 
    borderColor: "#eee", 
    borderRadius: 10, 
    padding: 14, 
    marginBottom: 10 
  },
  cardActive: { 
    borderColor: "#2E8B57", 
    backgroundColor: "#f2faf5" 
  },
  cardHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center" 
  },
  cardTitle: { 
    fontWeight: "600", 
    fontSize: 15 
  },
  cardAscent: { 
    color: "#2E8B57", 
    fontWeight: "600" }
    ,
  cardSub: { 
    color: "#777", 
    marginTop: 4, 
    fontSize: 13 
  }, 
  chartLabel: {
    fontWeight: "600",
    marginTop: 14, 
    marginBottom: 6
  },
  navButton: { 
    backgroundColor: "#2E8B57", 
    padding: 14, 
    borderRadius: 10, 
    alignItems: "center", 
    marginTop: 16 
  },
  navButtonText: { 
    color: "#fff", 
    fontWeight: "600", 
    fontSize: 15 
  },
  map: {
    height: "45%"
  },
  sheet: {
    flex: 1,
    padding: 16
  },
  unitsToggle: { 
    alignSelf: "flex-end",
    marginBottom: 8 
  },
  unitsToggleText: { 
    color: "#2E8B57", 
    fontSize: 13, 
    fontWeight: "600" 
  },
});