export type GeoResult = {
    label: string, 
    latitude: number,
    longitude: number
};

export async function searchAddress(
    query: string,
    bias?: { latitude: number, longitude: number }
): Promise<GeoResult[]> {
    if (!query || query.trim().length < 3) 
        return [];

    const params: Record<string, string> = { q: query, limit: "5"};
    if (bias) {
        params.lat = bias.latitude.toString();
        params.lon = bias.longitude.toString();
    }

    const url = "https://photon.komoot.io/api/?" + new URLSearchParams(params);
    
    const res = await fetch(url);
    if (!res.ok)
        throw new Error("geocoding request failed!")

    const data = await res.json();

    return data.features    
        .filter((feature: any) => feature.properties && feature.geometry)
        .map((feature: any) => {
            const [longitude, latitude] = feature.geometry.coordinates;
            const p = feature.properties;
            const parts = [p.name, p.street, p.city, p.state, p.country].filter(Boolean);
            const label = parts.join(", ") || "unnamed location";

        return { label, latitude, longitude };
    });
        
} // end of searchAddress

