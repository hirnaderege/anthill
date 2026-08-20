import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { GeoResult, searchAddress } from "../services/geocode";

export default function homeScreen() {
  const router = useRouter();

  const [mode, setMode] = useState< "walk" | "bike" | "drive" >();
  const [startQ , setStartQ] = useState("");
  const [endQ, setEndQ] = useState("");
  const [startPoint, setStartPoint] = useState<GeoResult | null>(null);
  const [endPoint, setEndPoint] = useState<GeoResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);    
  const [suggestions , setSuggestions] = useState<GeoResult[]>([]);
  const [activeField, setActiveField] = useState<"start" | "end" | null>(null);

  function handleFindRoutes() {
    if(!startPoint || !endPoint)
      return;
    
    router.push({
      pathname: "/results",
      params: {
        startLat: startPoint.latitude.toString(),
        startLng: startPoint.longitude.toString(),
        endLat: endPoint.latitude.toString(),
        endLng: endPoint.longitude.toString(),
        mode,
      },
    });
  } // end of handleFindRoutes

  async function useCurrLocation(){
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted"){
      console.log("location permission denied");
      return;
    }

    const loc = await Location.getCurrentPositionAsync({});
    const point: GeoResult = {
      label: "current location",
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    };

    setStartPoint(point);
    setStartQ("current location");
    setSuggestions([]);
} // end of useCurrLoc

  useEffect(() => {
    const query = activeField === "start" ? startQ : endQ;
    console.log("effect fired:", { activeField, query });

    if (!activeField || query.trim().length < 3){
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      console.log("searching for:", query);
      setIsSearching(true);
      setSearchError(null);
      searchAddress(query)
        .then((results) => {
          console.log("got results:", results.length);
          setSuggestions(results)
        })
        .catch((err) => {
          console.log("search error:", err);
          setSearchError("Couldn't reach the search service. Try again.");
        })
        .finally(() => setIsSearching(false));
    }, 400);

    return () => clearTimeout(timer);
  }, [startQ, endQ, activeField]);


  function selectSuggestions(item: GeoResult) {
    if (activeField === "start") {
      setStartPoint(item);
      setStartQ(item.label);
    } else {
      setEndPoint(item);
      setEndQ(item.label);
    }
    setSuggestions([]);
    setActiveField(null);
  } // end of selectSuggestions

  function metersToFeet(m: number): number {
    return m * 3.28084;
  };

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {
          <View style={styles.container}>
            <Text style={styles.title}> anthill </Text>
            
            {/* mode button */}
            <View style={styles.modeRow}>
              {(["walk", "bike", "drive"] as const).map((m) => (
                <TouchableOpacity
                key={m}
                style={[styles.modeButton, mode === m && styles.modeButtonActive]}
                onPress={() => setMode(m)} 
                >
                  <Text style={[styles.modeText, mode === m && styles.modeTextActive]}>
                    { m === "walk" ? " walk" : m === "bike" ? " bike" : " drive"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>


            <TextInput
              style={styles.input}
              placeholder=" start address "
              value={startQ}
              onFocus={() => setActiveField("start")}
              onChangeText={setStartQ}
            />

            {/* current location button */}
            <TouchableOpacity onPress={useCurrLocation}>
              <Text style={{ color: "#2E8B57", marginBottom: 12}}> ⚲ use current location </Text>
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder=" end address "
              value={endQ}
              onFocus={() => setActiveField("end")}
              onChangeText={setEndQ}
            />

            {/* find routes button */}
            <TouchableOpacity style={styles.button} onPress={handleFindRoutes}>
              <Text style={styles.buttonText}> find routes ꈨ </Text>
            </TouchableOpacity>
            {isSearching && <Text style={styles.hint}>Searching…</Text>}
            {searchError && <Text style={styles.error}>{searchError}</Text>}

            
            <View style={styles.suggestionsLabel}>
              {suggestions.map((item, i) => (
                <TouchableOpacity
                  key={`${item.label} - ${i}`}
                  style={styles.suggestionRow}
                  onPress={() => selectSuggestions(item)}
                >
                  <Text numberOfLines={1}> {item.label} </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        }
      </ScrollView>
    </KeyboardAvoidingView>
  );
} // end of homeScreen

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    padding: 20, 
  },
  title: { 
    fontSize: 28, 
    fontWeight: "700", 
    marginBottom: 8 
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: 16
  },
  hint: { 
    fontSize: 12, 
    color: "#999", 
    marginBottom: 4 
  },
  error: { 
    fontSize: 12, 
    color: "#c0392b", 
    marginBottom: 4 
  },
  button: { 
    backgroundColor: "#2E8B57", 
    padding: 16, 
    borderRadius: 10, 
    alignItems: "center", 
    marginTop: 8 
  },
  buttonText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "600" 
  },
  suggestions: {
    maxHeight: 160,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8, 
    marginBottom: 12
  },
  suggestionRow: { 
    padding: 10, 
    borderBottomWidth: 1, 
    borderBottomColor: "#f0f0f0"
  },
  suggestionsLabel: { 
    fontSize: 12, 
    color: "#999", 
    marginBottom: 4 
  },

  modeRow: { flexDirection: "row", marginVertical: 16 },
  modeButton: { flex: 1, padding: 10, borderWidth: 1, borderColor: "#ddd", marginHorizontal: 4, borderRadius: 8, alignItems: "center" },
  modeButtonActive: { backgroundColor: "#2E8B57", borderColor: "#2E8B57" },
  modeText: { color: "#333" },
  modeTextActive: { color: "#fff", fontWeight: "600" },

});
