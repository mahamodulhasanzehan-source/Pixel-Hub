import { AppData, GitHubRelease } from '../types';
import { GITHUB_USER } from '../config/modules';

export const fetchAllUserApps = async (): Promise<Record<string, AppData>> => {
  try {
    const reposResponse = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`);
    if (!reposResponse.ok) {
      throw new Error(`Failed to fetch repositories: ${reposResponse.statusText}`);
    }
    const repos = await reposResponse.json();

    const newData: Record<string, AppData> = {};
    
    // Filter out forks to save API calls
    const sourceRepos = repos.filter((repo: any) => !repo.fork);

    // Fetch releases in parallel
    await Promise.all(sourceRepos.map(async (repo: any) => {
      try {
        const releaseResponse = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${repo.name}/releases/latest`);
        if (releaseResponse.ok) {
          const release: GitHubRelease = await releaseResponse.json();
          newData[repo.name] = { repoName: repo.name, release };
        }
      } catch (error) {
        // Silently ignore repos without releases or fetch errors
      }
    }));

    return newData;
  } catch (error) {
    console.error("Error fetching user apps:", error);
    return {};
  }
};

export const fetchAllReleases = async (repo: string): Promise<GitHubRelease[]> => {
  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${repo}/releases`);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching all releases for ${repo}:`, error);
    return [];
  }
};
