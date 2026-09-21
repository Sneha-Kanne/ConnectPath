# ConnectPath

ConnectPath is an offline-first route planning and connectivity assistant for journeys through areas with unreliable mobile coverage. It combines route planning, signal predictions, live community reports, offline map tiles, and safety tools in a single Progressive Web App.

## Project Overview

The frontend is a React application served by a Vite development server through the Express entrypoint. Route and connectivity data can be enriched with OSRM, OpenCelliD, OpenStreetMap, Overpass, and weather services. MongoDB is used when configured, with an in-memory fallback so the API remains usable during local development or database outages.

## Key Features

- **Offline Maps:** Downloads route tiles into CacheStorage and IndexedDB for use in dead zones.
- **OpenCelliD Integration:** Uses nearby cell tower data to estimate coverage and identify dead zones.
- **Convoy Mode:** Helps groups coordinate journeys and share route connectivity status.
- **Gamification:** Awards points for community reports and confirmations, with leaderboard and journey analytics views.
- **Community Reports:** Lets travellers publish and vote on current signal conditions.
- **Safety Tools:** Includes emergency actions, route deviation alerts, weather context, and saved routes.

## Tech Stack

- React 19 and TypeScript
- Vite and Tailwind CSS
- Express and Node.js
- MongoDB with Mongoose
- Leaflet for maps
- OSRM for route geometry
- OpenCelliD and Overpass API integrations

## How to Run Locally

**Prerequisites:** Node.js 18 or newer and an optional MongoDB instance.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file from `.env.example` and set the values you need, such as `MONGODB_URI`, `PORT`, and any optional weather configuration.

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000` in a browser.

For a production build:

```bash
npm run build
npm start
```

## API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Check API availability. |
| GET | `/api/reports` | List community connectivity reports. |
| POST | `/api/reports` | Create a community report. |
| POST | `/api/reports/:id/vote` | Toggle a user's vote on a report. |
| GET | `/api/routes` | List saved routes. |
| POST | `/api/routes` | Save a route. |
| DELETE | `/api/routes/:id` | Delete a saved route. |
| GET | `/api/celltowers` | Retrieve nearby cell tower data. |
| GET | `/api/weather` | Retrieve weather for a coordinate. |
| GET | `/api/feedback` | List journey feedback. |
| POST | `/api/feedback` | Submit journey feedback. |
| GET | `/api/gamification` | Retrieve gamification state. |
| POST | `/api/gamification` | Update gamification state. |
| GET | `/api/journeys` | List journey history. |
| POST | `/api/journeys` | Save journey history. |

## Project Structure

- `src/components`: UI components and feature panels.
- `src/lib`: routing, weather, cell tower, offline storage, and API services.
- `src/hooks`: geolocation, speech, PWA, and route monitoring hooks.
- `server.ts`: Express server and API routes.
- `public/sw.js`: Service Worker used for offline behavior.
