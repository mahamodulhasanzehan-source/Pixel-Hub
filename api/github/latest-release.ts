export default async function handler(req: any, res: any) {
  const { user, repo } = req.query;
  const token = (req.headers["x-github-token"] as string) || process.env.GITHUB_PAT;
  const headers: Record<string, string> = { "User-Agent": "Pixcel-Hub-Proxy" };
  if (token) headers["Authorization"] = `token ${token}`;

  try {
    const response = await fetch(`https://api.github.com/repos/${user}/${repo}/releases/latest`, { headers });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch latest release" });
  }
}
