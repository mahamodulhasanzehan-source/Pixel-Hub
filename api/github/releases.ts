export default async function handler(req: any, res: any) {
  const { user, repo } = req.query;
  const token = process.env.GITHUB_PAT;
  const headers: Record<string, string> = { "User-Agent": "Pixcel-Hub-Proxy" };
  if (token) headers["Authorization"] = `token ${token}`;

  try {
    const response = await fetch(`https://api.github.com/repos/${user}/${repo}/releases`, { headers });
    if (!response.ok) return res.status(response.status).json({ error: response.statusText });
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch" });
  }
}
