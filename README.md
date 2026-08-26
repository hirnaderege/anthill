Anthill readme · MD
# anthill 🐜
 
> a GPS app that actually cares about hills
 
most navigation apps will send you straight up a cliff and call it efficient. anthill finds you the **flattest route** — then shows you the elevation profile so you can decide for yourself before you commit.
 
built with React Native + Expo, so it runs on iOS and Android from one codebase.
 
---
 
## what it does
 
- **searches addresses and landmarks** with location-biased autocomplete (Photon/OpenStreetMap — no API key needed for search)
- **fetches up to 3 alternative routes** between any two points, sorted by total elevation gain (flattest first)
- **shows a live elevation profile chart** for each route — custom SVG, no chart library
- **walk, bike, or drive** — switches routing profiles on the fly
- **uses your real GPS location** as a starting point (with proper iOS/Android permission handling)
- **in-app turn-by-turn navigation** with live position tracking and auto-advancing instructions — detects when you've reached the next turn using the Haversine formula
- **metric or imperial units** — toggle anytime
---
 
## the stack
 
| piece | what it is |
|---|---|
| React Native + Expo | cross-platform mobile framework |
| Expo Router | file-based navigation (like Next.js, but for phones) |
| OpenRouteService API | routing with real elevation data |
| Photon (Komoot) | address + landmark geocoding |
| expo-location | GPS permissions + live position tracking |
| react-native-maps / Leaflet | native map (iOS/Android) + web map |
| react-native-svg | elevation profile chart |
| React Context | shared navigation state across screens |
 
---
 
## how it works
 
```
user types an address
    → Photon geocoding API (location-biased, debounced)
    → user picks from suggestions
 
user taps "find routes"
    → OpenRouteService: POST /v2/directions/{profile}/geojson
      { elevation: true, alternative_routes: { target_count: 3 } }
    → routes sorted by ascent (flattest first)
    → elevation profile drawn from coordinate[2] values
 
user picks a route + taps "start"
    → React Context passes selected route to NavigateScreen
    → expo-location watchPositionAsync tracks live position
    → Haversine formula checks distance to next step
    → auto-advances when within 20 meters
```
 
---
 
## running it locally
 
you'll need Node.js (v18+) and the **Expo Go** app on your phone.
 
```bash
git clone https://github.com/hirnaderege/anthill
cd anthill
npm install
```
 
get a free OpenRouteService API key at [openrouteservice.org](https://openrouteservice.org/dev/#/signup) and paste it in `services/routing.ts`:
 
```ts
const ORS_API_KEY = "your_key_here";
```
 
then:
 
```bash
npx expo start
```
 
scan the QR code with Expo Go (iOS) or Camera (Android). that's it.
 
---
 
## things i learned building this
 
- React Native's layout engine (flexbox by default, but `alignItems: center` collapses widths in ways web doesn't)
- how GPS APIs handle permissions differently on iOS vs Android
- why `requestAnimationFrame` + typed arrays (`Float32Array`) matter for smooth canvas animation
- the Haversine formula — turns out "are these two GPS points close enough" is not a simple subtraction
- platform-specific file splitting (`.native.tsx` / `.web.tsx`) for sharing components across mobile and web
---
 
made with a lot of trial and error and genuine frustration at hills ⛰️
 
