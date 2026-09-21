import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { connectToDatabase } from './src/lib/mongodb.js';
import { CommunityReport } from './src/models/CommunityReport.js';
import { SavedRoute } from './src/models/SavedRoute.js';
import { JourneyFeedbackModel } from './src/models/JourneyFeedback.js';
import { UserGamificationModel } from './src/models/UserGamification.js';
import { JourneyHistoryModel } from './src/models/JourneyHistory.js';

// Server-side In-Memory Fallback DB (Localized for Telangana)
let IN_MEMORY_REPORTS = [
  {
    _id: 'rep-1',
    userId: 'user-default',
    userName: 'K. Vamshi',
    locationName: 'NH-163 Bhongir Ghat Section',
    signalStatus: 'None',
    description: 'Sudden cellular blackout in the valley curve. Tower line repair ongoing, expect 0 bars for 3 km stretch.',
    votes: 38,
    votedUserIds: [],
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
  },
  {
    _id: 'rep-2',
    userId: 'user-default',
    userName: 'Priya R.',
    locationName: 'Outer Ring Road (Gachibowli Junction)',
    signalStatus: 'Slow',
    description: 'High tower congestion during peak evening rush. Audio calls drop near financial district exit.',
    votes: 21,
    votedUserIds: [],
    createdAt: new Date(Date.now() - 45 * 60 * 1000),
  },
  {
    _id: 'rep-3',
    userId: 'user-default',
    userName: 'Rahul M.',
    locationName: 'Siddipet - Karimnagar Highway (SH-1)',
    signalStatus: 'Weak',
    description: 'Jio drops to 2G intermittently across rural forest corridor. Airtel maintains stable 4G/5G signal.',
    votes: 16,
    votedUserIds: [],
    createdAt: new Date(Date.now() - 120 * 60 * 1000),
  }
];

let IN_MEMORY_ROUTES: any[] = [];
let IN_MEMORY_FEEDBACK: any[] = [];
let IN_MEMORY_GAMIFICATION: Record<string, any> = {};
let IN_MEMORY_JOURNEYS: any[] = [];

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // JSON middleware
  app.use(express.json());

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', environment: process.env.NODE_ENV || 'development' });
  });

  // GET /api/reports
  app.get('/api/reports', async (req, res) => {
    try {
      const db = await connectToDatabase();
      if (db) {
        const reports = await CommunityReport.find().sort({ createdAt: -1 });
        return res.json(reports);
      } else {
        // Fallback to in-memory sorted by newest
        const reports = [...IN_MEMORY_REPORTS].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        return res.json(reports);
      }
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      res.status(500).json({ error: 'Failed to retrieve bulletins', details: error.message });
    }
  });

  // POST /api/reports
  app.post('/api/reports', async (req, res) => {
    try {
      const { userId, userName, locationName, coordinates, signalStatus, description } = req.body;

      if (!locationName || !signalStatus || !description) {
        return res.status(400).json({ error: 'Missing required parameters: locationName, signalStatus, and description are required.' });
      }

      // GeoJSON standard coordinates is [longitude, latitude]
      const lng = coordinates ? coordinates[0] : -122.4194;
      const lat = coordinates ? coordinates[1] : 37.7749;

      const db = await connectToDatabase();
      if (db) {
        const newReport = new CommunityReport({
          userId: userId || 'user-anonymous',
          userName: userName || 'Anonymous Operator',
          locationName,
          location: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          signalStatus,
          description,
          votes: 1,
          votedUserIds: [userId || 'user-anonymous']
        });
        await newReport.save();
        return res.status(201).json(newReport);
      } else {
        // Fallback in-memory save
        const newReport = {
          _id: `rep-${Date.now()}`,
          userId: userId || 'user-anonymous',
          userName: userName || 'Anonymous Operator',
          locationName,
          signalStatus,
          description,
          votes: 1,
          votedUserIds: [userId || 'user-anonymous'],
          createdAt: new Date(),
        };
        IN_MEMORY_REPORTS.unshift(newReport as any);
        return res.status(201).json(newReport);
      }
    } catch (error: any) {
      console.error('Error creating report:', error);
      res.status(500).json({ error: 'Failed to publish bulletin', details: error.message });
    }
  });

  // POST /api/reports/:id/vote
  app.post('/api/reports/:id/vote', async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      const user = userId || 'user-anonymous';

      const db = await connectToDatabase();
      if (db) {
        const report = await CommunityReport.findById(id);
        if (!report) {
          return res.status(404).json({ error: 'Bulletin report not found.' });
        }

        const hasVoted = report.votedUserIds.includes(user);
        if (hasVoted) {
          // Remove vote
          report.votes = Math.max(0, report.votes - 1);
          report.votedUserIds = report.votedUserIds.filter(uid => uid !== user);
        } else {
          // Add vote
          report.votes += 1;
          report.votedUserIds.push(user);
        }
        await report.save();
        return res.json(report);
      } else {
        // In-memory fallback
        const report = IN_MEMORY_REPORTS.find(r => r._id === id);
        if (!report) {
          return res.status(404).json({ error: 'Bulletin report not found.' });
        }

        const hasVoted = report.votedUserIds.includes(user as any);
        if (hasVoted) {
          report.votes = Math.max(0, report.votes - 1);
          report.votedUserIds = report.votedUserIds.filter(uid => uid !== user) as any;
        } else {
          report.votes += 1;
          report.votedUserIds.push(user as any);
        }
        return res.json(report);
      }
    } catch (error: any) {
      console.error('Error toggling vote:', error);
      res.status(500).json({ error: 'Failed to process upvote', details: error.message });
    }
  });

  // GET /api/routes
  app.get('/api/routes', async (req, res) => {
    try {
      const db = await connectToDatabase();
      if (db) {
        const routes = await SavedRoute.find().sort({ createdAt: -1 });
        return res.json(routes);
      } else {
        return res.json(IN_MEMORY_ROUTES);
      }
    } catch (error: any) {
      console.error('Error fetching routes:', error);
      res.status(500).json({ error: 'Failed to retrieve corridors', details: error.message });
    }
  });

  // POST /api/routes
  app.post('/api/routes', async (req, res) => {
    try {
      const { userId, name, start, end, coordinates, signalStrength, duration, distance } = req.body;

      if (!name || !start || !end || !coordinates) {
        return res.status(400).json({ error: 'Missing required parameters: name, start, end, coordinates' });
      }

      const db = await connectToDatabase();
      if (db) {
        const newRoute = new SavedRoute({
          userId: userId || 'user-anonymous',
          name,
          start,
          end,
          coordinates,
          signalStrength: signalStrength || 80,
          duration: duration || 30,
          distance: distance || 15
        });
        await newRoute.save();
        return res.status(201).json(newRoute);
      } else {
        // In-memory fallback
        const newRoute = {
          _id: `route-${Date.now()}`,
          userId: userId || 'user-anonymous',
          name,
          start,
          end,
          coordinates,
          signalStrength: signalStrength || 80,
          duration: duration || 30,
          distance: distance || 15,
          createdAt: new Date()
        };
        IN_MEMORY_ROUTES.unshift(newRoute);
        return res.status(201).json(newRoute);
      }
    } catch (error: any) {
      console.error('Error creating route:', error);
      res.status(500).json({ error: 'Failed to save corridor layout', details: error.message });
    }
  });

  // DELETE /api/routes/:id
  app.delete('/api/routes/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const db = await connectToDatabase();
      if (db) {
        await SavedRoute.findByIdAndDelete(id);
      }
      IN_MEMORY_ROUTES = IN_MEMORY_ROUTES.filter(r => r._id !== id && r.id !== id);
      return res.json({ success: true, message: 'Corridor deleted' });
    } catch (error: any) {
      console.error('Error deleting route:', error);
      res.status(500).json({ error: 'Failed to delete corridor', details: error.message });
    }
  });

  // GET /api/celltowers - Proxy OpenCelliD requests to prevent browser CORS blocks
  app.get('/api/celltowers', async (req, res) => {
    try {
      const { minLon, minLat, maxLon, maxLat, key } = req.query;
      const apiKey = (key as string) || process.env.VITE_OPENCELLID_KEY || process.env.OPENCELLID_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: 'Missing OpenCelliD API key' });
      }
      const url = `https://opencellid.org/cell/getInArea?key=${apiKey}&BBOX=${minLon},${minLat},${maxLon},${maxLat}&format=json`;
      const response = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!response.ok) {
        return res.status(response.status).json({ error: `OpenCelliD HTTP ${response.status}: ${response.statusText}` });
      }
      const data = await response.json();
      return res.json(data);
    } catch (error: any) {
      console.warn('OpenCelliD proxy error:', error?.message);
      return res.status(500).json({ error: error?.message || 'Failed to proxy cell towers' });
    }
  });

  // GET /api/weather - Weather telemetry proxy with OpenWeatherMap & Open-Meteo fallback
  app.get('/api/weather', async (req, res) => {
    try {
      const { lat, lng } = req.query;
      if (!lat || !lng) {
        return res.status(400).json({ error: 'lat and lng parameters are required' });
      }
      const apiKey = process.env.OPENWEATHERMAP_API_KEY || process.env.VITE_OPENWEATHERMAP_API_KEY;
      if (apiKey) {
        const owmUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`;
        const resp = await fetch(owmUrl);
        if (resp.ok) {
          const data = await resp.json();
          const weatherObj = data.weather?.[0] || {};
          const isHeavy = weatherObj.id >= 502 || (weatherObj.description && weatherObj.description.toLowerCase().includes('heavy'));
          const isSevere = weatherObj.id >= 200 && weatherObj.id < 300 || isHeavy;
          return res.json({
            temperature: Math.round(data.main?.temp ?? 29),
            condition: weatherObj.main || 'Clear',
            description: weatherObj.description || 'Clear sky',
            icon: isSevere ? '⛈️' : isHeavy ? '🌧️' : weatherObj.main === 'Rain' ? '🌦️' : '☀️',
            isSevere,
            humidity: data.main?.humidity,
            windSpeed: data.wind?.speed,
            locationName: data.name
          });
        }
      }

      // Keyless Open-Meteo fallback
      const meteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`;
      const mResp = await fetch(meteoUrl);
      if (mResp.ok) {
        const mData = await mResp.json();
        const code = mData.current?.weather_code ?? 0;
        const isSevere = code >= 65 || code >= 95;
        return res.json({
          temperature: Math.round(mData.current?.temperature_2m ?? 30),
          condition: code >= 95 ? 'Thunderstorm' : code >= 65 ? 'Heavy Rain' : code >= 50 ? 'Rain' : 'Clear',
          description: code >= 65 ? 'Heavy rain forecast' : code >= 50 ? 'Light rain expected' : 'Clear sky',
          icon: code >= 95 ? '⛈️' : code >= 65 ? '🌧️' : code >= 50 ? '🌦️' : '☀️',
          isSevere,
          humidity: mData.current?.relative_humidity_2m,
          windSpeed: mData.current?.wind_speed_10m
        });
      }

      return res.json({
        temperature: 31,
        condition: 'Clear Sky',
        description: 'Clear conditions with high road visibility',
        icon: '☀️',
        isSevere: false,
        humidity: 55,
        windSpeed: 10
      });
    } catch (err: any) {
      return res.status(500).json({ error: err?.message || 'Failed to fetch weather telemetry' });
    }
  });

  // GET /api/feedback - Retrieve journey prediction feedback
  app.get('/api/feedback', async (req, res) => {
    try {
      const db = await connectToDatabase();
      if (db) {
        const feedback = await JourneyFeedbackModel.find().sort({ createdAt: -1 }).limit(50);
        return res.json(feedback);
      }
      return res.json(IN_MEMORY_FEEDBACK);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve feedback', details: err.message });
    }
  });

  // POST /api/feedback - Save journey prediction accuracy feedback
  app.post('/api/feedback', async (req, res) => {
    try {
      const { routeId, routeName, feedback, predictedScore, actualSignalNotes } = req.body;
      if (!routeId || !routeName || !feedback) {
        return res.status(400).json({ error: 'Missing required feedback fields' });
      }
      const db = await connectToDatabase();
      if (db) {
        const record = new JourneyFeedbackModel({
          routeId,
          routeName,
          feedback,
          predictedScore: predictedScore || 85,
          actualSignalNotes: actualSignalNotes || '',
          createdAt: new Date()
        });
        await record.save();
        return res.status(201).json(record);
      }
      const item = {
        _id: `fb-${Date.now()}`,
        routeId,
        routeName,
        feedback,
        predictedScore: predictedScore || 85,
        actualSignalNotes: actualSignalNotes || '',
        createdAt: new Date()
      };
      IN_MEMORY_FEEDBACK.unshift(item);
      return res.status(201).json(item);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to save feedback', details: err.message });
    }
  });

  // GET /api/gamification - Retrieve user gamification points & badges
  app.get('/api/gamification', async (req, res) => {
    try {
      const userId = (req.query.userId as string) || 'user-local-operator';
      const db = await connectToDatabase();
      if (db) {
        let userStats = await UserGamificationModel.findOne({ userId });
        if (!userStats) {
          userStats = await UserGamificationModel.create({
            userId,
            userName: 'Local Operator Node',
            points: 45,
            reportsCount: 3,
            upvotesCount: 3,
            reportedCities: ['Hyderabad', 'Secunderabad', 'Bhongir'],
          });
        }
        return res.json(userStats);
      }
      return res.json(IN_MEMORY_GAMIFICATION[userId] || {
        userId,
        userName: 'Local Operator Node',
        points: 45,
        reportsCount: 3,
        upvotesCount: 3,
        badges: [],
        reportedCities: ['Hyderabad', 'Secunderabad', 'Bhongir'],
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to get gamification profile', details: err.message });
    }
  });

  // POST /api/gamification - Update gamification profile
  app.post('/api/gamification', async (req, res) => {
    try {
      const { userId = 'user-local-operator', points, reportsCount, upvotesCount, badges, reportedCities } = req.body;
      const db = await connectToDatabase();
      if (db) {
        const updated = await UserGamificationModel.findOneAndUpdate(
          { userId },
          { $set: { points, reportsCount, upvotesCount, badges, reportedCities } },
          { new: true, upsert: true }
        );
        return res.json(updated);
      }
      IN_MEMORY_GAMIFICATION[userId] = { userId, points, reportsCount, upvotesCount, badges, reportedCities };
      return res.json(IN_MEMORY_GAMIFICATION[userId]);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to update gamification profile', details: err.message });
    }
  });

  // GET /api/journeys - Retrieve journeys for analytics
  app.get('/api/journeys', async (req, res) => {
    try {
      const db = await connectToDatabase();
      if (db) {
        const journeys = await JourneyHistoryModel.find().sort({ date: -1 }).limit(30);
        return res.json(journeys);
      }
      return res.json(IN_MEMORY_JOURNEYS);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to get journeys', details: err.message });
    }
  });

  // POST /api/journeys - Log completed journey
  app.post('/api/journeys', async (req, res) => {
    try {
      const { routeId, routeName, distanceKm, durationMins, deadZoneMins, carrier, avgSignalPercent } = req.body;
      const db = await connectToDatabase();
      if (db) {
        const rec = new JourneyHistoryModel({
          userId: 'user-local-operator',
          routeId,
          routeName,
          distanceKm: distanceKm || 10,
          durationMins: durationMins || 20,
          deadZoneMins: deadZoneMins || 0,
          carrier: carrier || 'Jio',
          avgSignalPercent: avgSignalPercent || 85,
          date: new Date()
        });
        await rec.save();
        return res.status(201).json(rec);
      }
      const rec = {
        _id: `j-${Date.now()}`,
        userId: 'user-local-operator',
        routeId,
        routeName,
        distanceKm: distanceKm || 10,
        durationMins: durationMins || 20,
        deadZoneMins: deadZoneMins || 0,
        carrier: carrier || 'Jio',
        avgSignalPercent: avgSignalPercent || 85,
        date: new Date()
      };
      IN_MEMORY_JOURNEYS.unshift(rec);
      return res.status(201).json(rec);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to log journey', details: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SmartGrid Server running on http://localhost:${PORT}`);
  });
}

startServer();
