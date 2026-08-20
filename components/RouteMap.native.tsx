import MapView, { Marker, Polyline } from "react-native-maps";
import { Props } from "./RouteMap.types";

export default function RouteMap({ routes, selectedID, onSelectedRoute, region, userLocation }: Props ) {
    const selected = routes.find((r) => r.id === selectedID);
    
    return (
        <MapView style={{ flex: 1 }} initialRegion={region}>
            {[...routes]
                .sort((a, b) => (a.id === selectedID ? 1 : b.id === selectedID ? -1 : 0))
                .map((r) => (
                    <Polyline
                        key={r.id}
                        coordinates={r.coordinates}
                        strokeColor={r.id === selectedID ? "#2E8B57" : "#bbb"}
                        strokeWidth={r.id === selectedID ? 5 : 3}
                        tappable
                        onPress={() => onSelectedRoute(r.id)}
                    />
                ))}
            {userLocation && <Marker coordinate={userLocation} pinColor="red" title="you" />}
            {selected && (
                <>
                    <Marker coordinate={selected.coordinates[0]} pinColor="green" />
                    <Marker coordinate={selected.coordinates[selected.coordinates.length - 1]} pinColor="red" />
                </>
            )}
        </MapView>
    );
}