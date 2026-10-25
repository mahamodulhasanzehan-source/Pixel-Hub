import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Simple in-memory cache to conserve GitHub API quota
  const cache = new Map<string, { time: number; data: any; status: number }>();
  const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  const getCached = (key: string) => {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.time > CACHE_TTL_MS) {
      cache.delete(key);
      return null;
    }
    return entry;
  };

  const setCached = (key: string, data: any, status: number) => {
    cache.set(key, { time: Date.now(), data, status });
  };

  const getHeaders = (req: express.Request): Record<string, string> => {
    const token = (req.headers["x-github-token"] as string) || process.env.GITHUB_PAT;
    const headers: Record<string, string> = { "User-Agent": "Pixcel-Hub-Proxy" };
    if (token) headers["Authorization"] = `token ${token}`;
    return headers;
  };

  // API routes
  app.get("/api/github/repos", async (req, res) => {
    const { user } = req.query;
    if (!user) return res.status(400).json({ error: "User parameter is required" });

    const cacheKey = `repos:${user}`;
    const cached = getCached(cacheKey);
    if (cached) return res.status(cached.status).json(cached.data);

    try {
      const response = await fetch(`https://api.github.com/users/${user}/repos?per_page=100&sort=updated`, {
        headers: getHeaders(req),
      });
      const data = await response.json();
      if (response.ok) {
        setCached(cacheKey, data, response.status);
      }
      res.status(response.status).json(data);
    } catch {
      res.status(500).json({ error: "Failed to fetch repositories" });
    }
  });

  app.get("/api/github/latest-release", async (req, res) => {
    const { user, repo } = req.query;
    if (!user || !repo) return res.status(400).json({ error: "User and repo parameters are required" });

    const cacheKey = `latest:${user}:${repo}`;
    const cached = getCached(cacheKey);
    if (cached) return res.status(cached.status).json(cached.data);

    try {
      const response = await fetch(`https://api.github.com/repos/${user}/${repo}/releases/latest`, {
        headers: getHeaders(req),
      });
      const data = await response.json();
      if (response.ok) {
        setCached(cacheKey, data, response.status);
      }
      res.status(response.status).json(data);
    } catch {
      res.status(500).json({ error: "Failed to fetch latest release" });
    }
  });

  app.get("/api/github/releases", async (req, res) => {
    const { user, repo } = req.query;
    if (!user || !repo) return res.status(400).json({ error: "User and repo parameters are required" });

    const cacheKey = `releases:${user}:${repo}`;
    const cached = getCached(cacheKey);
    if (cached) return res.status(cached.status).json(cached.data);

    try {
      const response = await fetch(`https://api.github.com/repos/${user}/${repo}/releases`, {
        headers: getHeaders(req),
      });
      const data = await response.json();
      if (response.ok) {
        setCached(cacheKey, data, response.status);
      }
      res.status(response.status).json(data);
    } catch {
      res.status(500).json({ error: "Failed to fetch releases" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
