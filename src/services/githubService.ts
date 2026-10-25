import { AppData, GitHubRelease } from '../types';
import { GITHUB_USER } from '../config/modules';
import { getGitHubToken, getCachedApps, setCachedApps } from '../utils/tokenStorage';

const getHeaders = (): { clientHeaders: Record<string, string>; proxyHeaders: Record<string, string> } => {
  const token = getGitHubToken();
  const clientHeaders: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };
  const proxyHeaders: Record<string, string> = {};

  if (token) {
    clientHeaders['Authorization'] = `token ${token}`;
    proxyHeaders['x-github-token'] = token;
  }

  return { clientHeaders, proxyHeaders };
};

export const fetchAllUserApps = async (): Promise<Record<string, AppData>> => {
  const { clientHeaders, proxyHeaders } = getHeaders();
  let repos: any[] = [];

  // Try server proxy first
  try {
    const reposRes = await fetch(`/api/github/repos?user=${GITHUB_USER}`, {
      headers: proxyHeaders,
    });
    if (reposRes.ok) {
      repos = await reposRes.json();
    }
  } catch {
    // Proxy request failed, fallback will be tried
  }

  // Fallback to direct GitHub API if proxy failed or rate-limited
  if (!repos.length) {
    try {
      const directRes = await fetch(
        `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`,
        { headers: clientHeaders }
      );
      if (directRes.ok) {
        repos = await directRes.json();
      }
    } catch {
      // Direct request failed
    }
  }

  // If both networks failed, attempt to load cached data
  if (!repos.length) {
    const cached = getCachedApps();
    if (cached && Object.keys(cached).length > 0) {
      return cached;
    }
    return {};
  }

  const newData: Record<string, AppData> = {};
  const sourceRepos = repos.filter((repo: any) => !repo.fork);

  await Promise.all(
    sourceRepos.map(async (repo: any) => {
      try {
        let release: GitHubRelease | null = null;

        // Try proxy
        try {
          const res = await fetch(
            `/api/github/latest-release?user=${GITHUB_USER}&repo=${repo.name}`,
            { headers: proxyHeaders }
          );
          if (res.ok) {
            release = await res.json();
          }
        } catch {
          // Fall back to direct
        }

        // Direct fallback
        if (!release) {
          const directRes = await fetch(
            `https://api.github.com/repos/${GITHUB_USER}/${repo.name}/releases/latest`,
            { headers: clientHeaders }
          );
          if (directRes.ok) {
            release = await directRes.json();
          }
        }

        if (release && release.tag_name) {
          newData[repo.name] = { repoName: repo.name, release };
        }
      } catch {
        // Silently skip repos without releases
      }
    })
  );

  if (Object.keys(newData).length > 0) {
    setCachedApps(newData);
    return newData;
  }

  // Fallback to cache if newly fetched release collection was empty
  const cached = getCachedApps();
  return cached || {};
};

export const fetchAllReleases = async (repo: string): Promise<GitHubRelease[]> => {
  const { clientHeaders, proxyHeaders } = getHeaders();

  // Try proxy first
  try {
    const res = await fetch(`/api/github/releases?user=${GITHUB_USER}&repo=${repo}`, {
      headers: proxyHeaders,
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Proxy request failed
  }

  // Fallback to direct
  try {
    const directRes = await fetch(
      `https://api.github.com/repos/${GITHUB_USER}/${repo}/releases`,
      { headers: clientHeaders }
    );
    if (directRes.ok) {
      return await directRes.json();
    }
  } catch {
    // Direct request failed
  }

  return [];
};
