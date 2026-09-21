# ConnectPath

## AI-Based Predictive Signal Mapping & Smart Route Planning

ConnectPath is a smart route-planning web application that helps users choose routes based not only on distance and travel time, but also on expected mobile network connectivity along the journey.

It combines route planning, mobile connectivity data, location intelligence, weather information, community reports, and offline capabilities to provide connectivity-aware travel assistance.

---

## Project Overview

ConnectPath is designed for journeys through areas where mobile network coverage may be unreliable.

The application generates routes and provides connectivity-related information along the journey, helping users identify potential signal gaps and make more informed travel decisions.

The system uses external services such as OSRM, OpenStreetMap, OpenCelliD, Overpass API, and weather services. MongoDB can be used for persistent application data, with fallback mechanisms available for local development.

---

## Key Features

- Smart route planning
- Mobile network connectivity analysis
- Connectivity timeline
- Potential dead-zone detection
- OpenCelliD cell tower integration
- Interactive maps
- User geolocation
- Community connectivity reports
- Saved routes
- Route deviation detection
- Proximity alerts
- Emergency assistance features
- Weather information
- Offline route and map support
- Progressive Web App (PWA) support
- Journey feedback
- Gamification and user points
- Journey analytics
- Multi-language support
- Light and dark theme support

---

## Supported Journey Types

- Daily Commute
- Office / Business
- Road Trip
- Delivery / Logistics
- Ride Sharing
- Emergency
- Custom Journey

---

## How It Works

```text
User
 |
 v
Enter Start and Destination
 |
 v
Route Generation
 |
 v
Collect Route and Connectivity Data
 |
 +------------------+
 |                  |
 v                  v
Route Data      Signal Data
 |                  |
 +--------+---------+
          |
          v
Connectivity Analysis
          |
          v
Route Results
 |
 +-------------------+
 |                   |
 v                   v
Route Details   Connectivity Timeline
 |
 v
Alerts and Travel Assistance
```

ConnectPath considers connectivity information alongside traditional route information to provide a more connectivity-aware travel experience.

---

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Leaflet
- React Leaflet
- Progressive Web App (PWA)

### Backend

- Node.js
- Express
- TypeScript

### Database

- MongoDB
- Mongoose

### APIs and External Services

- OpenStreetMap
- OSRM (Open Source Routing Machine)
- OpenCelliD
- Overpass API
- Weather API
- Geolocation services

### Development Tools

- Git
- GitHub
- VS Code
- npm
- Bun

---

## Project Structure

```text
ConnectPath/
|
├── public/
|   ├── icon.svg
|   ├── manifest.json
|   ├── sw.js
|   └── PWA assets
|
├── scripts/
|   └── generate-icons.cjs
|
├── src/
|   |
|   ├── components/
|   |   ├── MapCanvas.tsx
|   |   ├── RouteResults.tsx
|   |   ├── SearchPanel.tsx
|   |   ├── ConnectivityTimeline.tsx
|   |   ├── CommunityReports.tsx
|   |   ├── EmergencyPanel.tsx
|   |   └── ...
|   |
|   ├── contexts/
|   |   └── ThemeContext.tsx
|   |
|   ├── data/
|   |   └── presets.ts
|   |
|   ├── hooks/
|   |   ├── useGeolocation.ts
|   |   ├── useLanguage.ts
|   |   ├── usePWAInstall.ts
|   |   └── ...
|   |
|   ├── lib/
|   |   ├── routingService.ts
|   |   ├── cellTowerService.ts
|   |   ├── weatherService.ts
|   |   ├── mongodb.ts
|   |   ├── offlineCache.ts
|   |   ├── offlineTileService.ts
|   |   ├── feedbackService.ts
|   |   ├── gamificationService.ts
|   |   └── ...
|   |
|   ├── models/
|   |   ├── CommunityReport.ts
|   |   ├── JourneyFeedback.ts
|   |   ├── JourneyHistory.ts
|   |   ├── SavedRoute.ts
|   |   └── UserGamification.ts
|   |
|   ├── App.tsx
|   ├── main.tsx
|   ├── index.css
|   └── types.ts
|
├── server.ts
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── .env.example
└── README.md
```

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Sneha-Kanne/ConnectPath.git
```

### 2. Navigate to the Project

```bash
cd ConnectPath
```

### 3. Install Dependencies

Using npm:

```bash
npm install
```

Or using Bun:

```bash
bun install
```

### 4. Configure Environment Variables

Create a `.env` file in the project root using `.env.example` as a reference.

```bash
cp .env.example .env
```

Add the required API keys and configuration values to the `.env` file.

Never commit the `.env` file to GitHub.

### 5. Start the Development Server

```bash
npm run dev
```

The application will be available at the local development URL displayed in the terminal.

---

## Environment Variables

ConnectPath uses environment variables for external services and private configuration.

Refer to `.env.example` for the required configuration.

Example:

```env
MONGODB_URI=
OPENCELLID_API_KEY=
WEATHER_API_KEY=
```

Never add actual API keys, credentials, or other secrets to the repository.

---

## External Data Sources

| Service | Purpose |
|---|---|
| OpenStreetMap | Map and geographic data |
| OSRM | Route generation |
| OpenCelliD | Mobile cell tower information |
| Overpass API | OpenStreetMap data queries |
| Weather API | Weather information |
| MongoDB | Application data storage |

---

## Progressive Web App

ConnectPath is designed as a Progressive Web App.

PWA functionality includes:

- Installable application
- Service worker support
- Offline caching
- Cached routes
- Offline map-related functionality
- Mobile-friendly interface

---

## Privacy and Security

ConnectPath uses location-related functionality to provide route planning and location-aware features.

Users should ensure that:

- API keys are stored in environment variables.
- `.env` files are never committed.
- Sensitive credentials are not included in source code.
- Location permissions are granted only when required.

---

## Future Enhancements

Potential future improvements include:

- More advanced machine-learning-based signal prediction
- Larger and more frequently updated connectivity datasets
- Improved route scoring based on user preferences
- More extensive real-time network information
- Enhanced community-driven signal reporting
- More detailed connectivity analytics
- Improved offline navigation capabilities
- Production cloud deployment

---

## Project Status

**Active Development**

ConnectPath is an academic project and prototype focused on connectivity-aware route planning and location intelligence.

---

## Author

**Sneha Kanne**

B.Tech - Computer Science and Business Systems  
Gokaraju Rangaraju Institute of Engineering and Technology (GRIET)

GitHub: https://github.com/Sneha-Kanne

---

## Acknowledgements

This project makes use of open-source technologies and publicly available services, including:

- OpenStreetMap
- OSRM
- OpenCelliD
- Overpass API
- Leaflet
- MongoDB
- React
- Vite

---

## License

This project is intended for academic and educational purposes.
```
