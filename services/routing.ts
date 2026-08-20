export const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6Ijc0ZDE3NWMyODRhOTRjMDI4MzJiYTM5MTBiOGE3NWM1IiwiaCI6Im11cm11cjY0In0=";

export type NavStep = {
    instruction: string;
    distanceMeters: number;
    coordinate: RoutePoint;
};

export type RoutePoint = {
    latitude: number;
    longitude: number;
    elevation: number;
};

export type Route = {
    id: string;
    coordinates: RoutePoint[];
    distanceMeters: number;
    durationSeconds: number;
    ascent: number;
    descent: number;
    steps: NavStep[];
};

export type TravelMode = "walk" | "bike" | "drive";

const PROFILES: Record<TravelMode, string> = {
    walk: "foot-walking",
    bike: "cycling-regular",
    drive: "driving-car",
};

export async function getRoutes(
    start: {latitude: number; longitude: number;},
    end: {latitude: number; longitude: number;},
    mode: TravelMode = "drive"
): Promise<Route[]> {
    const profiles = PROFILES[mode];
    const url = `https://api.openrouteservice.org/v2/directions/${profiles}/geojson`;
    const res = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: ORS_API_KEY,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            coordinates: [
                [start.longitude, start.latitude],
                [end.longitude, end.latitude],
            ],
            elevation: true,
            alternative_routes: { target_count: 3, weight_factor: 2.2, share_factor: 0.6 },
        }),
    });

    if(!res.ok) {
        const errText = await res.text();
        throw new Error(`routing failed ˙◠˙ (${res.status}): ${errText}`);
    }

    const data = await res.json();

    const routes: Route[] = data.features.map((feature: any, idx: number) => {
        const coords = feature.geometry.coordinates;
        const segment = feature.properties.segments[0];

        const points: RoutePoint[] = coords.map((c: number[]) => ({
            longitude: c[0],
            latitude: c[1],
            elevation: c[2],
        }));

        const steps: NavStep[] = segment.steps.map((s: any) => ({
            instruction: s.instruction,
            distanceMeters: s.distance,
            coordinate: points[s.way_points[0]],
        }));

        return {
            id: `route ${idx}`,
            coordinates: points,
            distanceMeters: segment.distance,
            durationSeconds: segment.duration,
            ascent: feature.properties.ascent,
            descent: feature.properties.descent,
            steps,
        };
    });

    routes.sort((a, b) => a.ascent - b.ascent);
    return routes.map((r, displayID) => ({ ...r, id: `route ${1 + displayID}`}));
} // end of getRoutes