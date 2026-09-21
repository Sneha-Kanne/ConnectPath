# OpenCelliD API Setup & Integration Guide

ConnectPath integrates real-world cellular transmission tower data using the **OpenCelliD Project** (the world's largest open collaborative database of cell towers).

---

## 1. Get a Free OpenCelliD API Key

1. Visit [https://opencellid.org/](https://opencellid.org/) and click **Register** or **Request API Key**.
2. Sign up for a free account.
3. Confirm your email address.
4. Log into your dashboard to obtain your personal API key (e.g., `pk.1234567890abcdef...`).
   * *Note: Free OpenCelliD accounts include 500 API requests per day.*

---

## 2. Configure Environment Variable

Add your API key to your environment variables file (`.env`):

```bash
# OpenCelliD API Key for live cell tower querying
VITE_OPENCELLID_KEY=your_opencellid_api_key_here
```

A template variable is pre-declared in `.env.example`:
```bash
VITE_OPENCELLID_KEY=
```

---

## 3. How ConnectPath Uses Cell Tower Data

1. **Bounding Box Telemetry (`getTowersInArea`)**:
   - Whenever you calculate a route corridor, ConnectPath calculates the bounding box of the route coordinates.
   - It queries OpenCelliD for all active cellular towers within the transit perimeter.
   - Results are automatically cached in `localStorage` for **24 hours** to conserve your daily 500-request quota.

2. **Proximity-Based Signal Calculation (`calculateSignalStrength`)**:
   - Calculates distance to the nearest cell tower using the Haversine great-circle formula.
   - Models signal strength curve:
     - `< 0.4 km`: **95% – 100%** (Optimal 5G/4G coverage)
     - `0.4 – 1.2 km`: **80% – 95%** (Strong signal)
     - `1.2 – 2.0 km`: **50% – 80%** (Moderate coverage)
     - `2.0 – 3.5 km`: **15% – 50%** (Weak/Fringing signal)
     - `> 3.5 km`: **< 15%** (Cellular valley / Dead zone)

3. **Dynamic Dead Zone Identification (`findDeadZones`)**:
   - Analyzes segments along the corridor where the nearest tower is **further than 2.0 km**.
   - Clusters consecutive dead points and marks them as dead zones on the interactive map.

4. **Reliable Graceful Fallback**:
   - If no API key is provided, or if the OpenCelliD rate limit is reached, ConnectPath automatically engages the regional predictive signal model for Telangana highways without any disruption or crash.
   - Routes visually indicate their source with badges:
     - `📡 Real Tower Data` (Live OpenCelliD telematics)
     - `🎯 AI Predicted` (Regional crowd-sourced elevation model)
