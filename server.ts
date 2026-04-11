import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes
  app.get("/api/github/:user/:repo/releases/latest", async (req, res) => {
    const { user, repo } = req.params;
    const token = process.env.GITHUB_PAT;

    const headers: Record<string, string> = {
      "User-Agent": "Pixcel-Hub-Proxy",
    };
    
    if (token) {
      headers["Authorization"] = `token ${token}`;
    }

    try {
      const response = await fetch(`https://api.github.com/repos/${user}/${repo}/releases/latest`, {
        headers,
      });

      if (!response.ok) {
        return res.status(response.status).json({ error: `GitHub API error: ${response.statusText}` });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch from GitHub" });
    }
  });

  app.get("/api/github/:user/:repo/releases", async (req, res) => {
    const { user, repo } = req.params;
    const token = process.env.GITHUB_PAT;

    const headers: Record<string, string> = {
      "User-Agent": "Pixcel-Hub-Proxy",
    };
    
    if (token) {
      headers["Authorization"] = `token ${token}`;
    }

    try {
      const response = await fetch(`https://api.github.com/repos/${user}/${repo}/releases`, {
        headers,
      });

      if (!response.ok) {
        return res.status(response.status).json({ error: `GitHub API error: ${response.statusText}` });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch from GitHub" });
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
