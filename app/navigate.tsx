import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useRouteContext } from "../context/RouteContext";
import { distanceBetween } from "../utils/distance";

const ADV_THRESHOLD_METERS = 20;

export default function NavigateScreen() {
    const { selectedRoute } = useRouteContext();
    const [currStepInd, setCurrStepInd] = useState(0);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [arrived, setArrived] = useState(false);

    // Location tracking — always runs
    useEffect(() => {
        let subscription: Location.LocationSubscription | null = null;

        async function startTracking() {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") return;

            subscription = await Location.watchPositionAsync(
                { accuracy: Location.Accuracy.High, timeInterval: 2000, distanceInterval: 5 },
                (location) => {
                    setUserLocation({
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    });
                }
            );
        }

        startTracking();
        return () => subscription?.remove();
    }, []);

    // Step advancement — always runs, guards internally
    useEffect(() => {
        if (!userLocation || !selectedRoute) return;

        const nextStep = selectedRoute.steps[currStepInd + 1];
        if (!nextStep) {
            // no more steps after this one — check if we've reached the last one
            const lastStep = selectedRoute.steps[currStepInd];
            if (lastStep && distanceBetween(userLocation, lastStep.coordinate) < ADV_THRESHOLD_METERS) {
                setArrived(true);
            }
            return;
        }

        const distanceToNext = distanceBetween(userLocation, nextStep.coordinate);
        if (distanceToNext < ADV_THRESHOLD_METERS) {
            setCurrStepInd((i) => i + 1);
        }
    }, [userLocation, currStepInd, selectedRoute]);

    // Early returns AFTER all hooks
    if (!selectedRoute) {
        return (
            <View style={styles.center}>
                <Text> no route selected. go back and pick on first ◔_◔ </Text>
            </View>
        );
    }

    if (arrived) {
        return (
            <View style={styles.center}>
                <Text style={styles.arrived}> you've arrived ! ദ്ദി(｡•̀ ,{'<'})~✩‧₊</Text>
            </View>
        );
    }

    const currentStep = selectedRoute.steps[currStepInd];
    if (!currentStep) {
        // safety net, shouldn't normally hit this
        return (
            <View style={styles.center}>
                <Text style={styles.arrived}> you've arrived ! ദ്ദി(｡•̀ ,{'<'})~✩‧₊ </Text>
            </View>
        );
    }

    const region = {
        latitude: userLocation?.latitude ?? currentStep.coordinate.latitude,
        longitude: userLocation?.longitude ?? currentStep.coordinate.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
    };

    return (
        <View style={{ flex: 1 }}>
            <MapView style={styles.map} region={region}>
                <Polyline coordinates={selectedRoute.coordinates} strokeColor="#2E8B57" strokeWidth={4} />
                <Marker coordinate={currentStep.coordinate} pinColor="blue" title="next turn" />
                {userLocation && <Marker coordinate={userLocation} pinColor="red" title="you" />}
            </MapView>

            <View style={styles.instructionCard}>
                <Text style={styles.stepCount}>
                    step {currStepInd + 1} of {selectedRoute.steps.length}
                </Text>
                <Text style={styles.instruction}> {currentStep.instruction} </Text>
                <Text style={styles.distance}> {Math.round(currentStep.distanceMeters)}m </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    arrived: { fontSize: 22, fontWeight: "700" },
    center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
    distance: { color: "#cde9d9", fontSize: 14, marginTop: 6 },
    instruction: { color: "#fff", fontSize: 24, fontWeight: "700" },
    instructionCard: { backgroundColor: "#2E8B57", padding: 24, paddingBottom: 40 },
    stepCount: { color: "#cde9d9", fontSize: 13, marginBottom: 6 },
    map: { flex: 1 },
});