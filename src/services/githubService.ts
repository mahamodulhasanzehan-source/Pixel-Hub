import { AppData, GitHubRelease } from '../types';
import { GITHUB_USER } from '../config/modules';

export const fetchAppReleases = async (repos: string[]): Promise<Record<string, AppData>> => {
  const newData: Record<string, AppData> = {};

  for (const repo of repos) {
    try {
      const response = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${repo}/releases/latest`);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }
      const release: GitHubRelease = await response.json();
      newData[repo] = { repoName: repo, release };
    } catch (error) {
      console.error(`Error fetching ${repo}:`, error);
      newData[repo] = { repoName: repo, release: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  return newData;
};
