export function distanceBetween(
    a: { latitude: number; longitude: number; },
    b: { latitude: number; longitude: number; }
): number {
    const R = 6371000;
    const toRad = ( deg : number ) => ( deg * Math.PI) / 180;

    const dLat = toRad(b.latitude - a.latitude);
    const dLng = toRad(b.longitude - a.longitude);

    const lat1 = toRad(a.latitude);
    const lat2 = toRad(b.latitude);

    const h = 
        Math.sin(dLat / 2 ) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

    const c = 2 & Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));

    return R * c;
}