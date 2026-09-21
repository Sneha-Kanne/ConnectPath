import mongoose from 'mongoose';

/**
 * Automatically sanitizes a MongoDB connection string.
 * Special characters in username or password (such as '@', ':', etc.)
 * must be percent-encoded according to RFC 3986 / MongoDB URI standard.
 */
export function sanitizeMongoUri(rawUri?: string | null): string | null {
  if (!rawUri || typeof rawUri !== 'string') return null;
  const trimmed = rawUri.trim();
  if (!trimmed.startsWith('mongodb://') && !trimmed.startsWith('mongodb+srv://')) {
    return null;
  }

  try {
    const match = trimmed.match(/^(mongodb(?:\+srv)?:\/\/)([^/]+)(.*)$/);
    if (!match) return trimmed;
    const prefix = match[1];
    const userinfoAndHost = match[2];
    const rest = match[3] || '';

    const lastAtIdx = userinfoAndHost.lastIndexOf('@');
    if (lastAtIdx === -1) {
      return trimmed;
    }

    const userinfo = userinfoAndHost.slice(0, lastAtIdx);
    const host = userinfoAndHost.slice(lastAtIdx + 1);

    const colonIdx = userinfo.indexOf(':');
    if (colonIdx === -1) {
      const cleanUser = encodeURIComponent(decodeURIComponent(userinfo));
      return `${prefix}${cleanUser}@${host}${rest}`;
    }

    const username = userinfo.slice(0, colonIdx);
    const password = userinfo.slice(colonIdx + 1);

    const cleanUser = encodeURIComponent(decodeURIComponent(username));
    const cleanPass = encodeURIComponent(decodeURIComponent(password));
    return `${prefix}${cleanUser}:${cleanPass}@${host}${rest}`;
  } catch {
    return trimmed;
  }
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose | null> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

let cached = globalThis.mongoose;

if (!cached) {
  cached = globalThis.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase(): Promise<typeof mongoose | null> {
  const sanitizedUri = sanitizeMongoUri(process.env.MONGODB_URI);
  if (!sanitizedUri) {
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 3000, // Fast failover so API routes remain ultra-responsive
    };

    cached.promise = mongoose.connect(sanitizedUri, opts)
      .then((m) => {
        console.log('✅ Connected to MongoDB Atlas successfully.');
        return m;
      })
      .catch((err) => {
        console.warn('MongoDB Atlas connection notice:', err.message, '-> Operating in persistent in-memory mode.');
        return null;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e: any) {
    cached.promise = null;
    cached.conn = null;
    console.warn('MongoDB Atlas connection error:', e?.message || e, '-> Operating in persistent in-memory mode.');
    return null;
  }

  return cached.conn;
}
