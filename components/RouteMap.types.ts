import { RoutePoint } from "../services/routing";


export type Props = {
  routes: { id: string; coordinates: RoutePoint[] }[];
  selectedID: string;
  onSelectedRoute: (id: string) => void;
  region: { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number };
  userLocation?: { latitude: number; longitude: number }; // ← new, optional
};


