export interface GitHubAsset {
  name: string;
  browser_download_url: string;
  size: number;
}

export interface GitHubRelease {
  tag_name: string;
  name: string;
  body: string;
  assets: GitHubAsset[];
  html_url: string;
  published_at: string;
}

export interface AppData {
  repoName: string;
  release: GitHubRelease | null;
  error?: string;
}

declare global {
  interface Window {
    electronAPI?: {
      checkAppRunning: (repoName: string) => Promise<boolean>;
      checkAppDownloaded: (repoName: string) => Promise<boolean>;
      downloadApp: (repoName: string, url: string) => Promise<boolean>;
      runApp: (repoName: string) => Promise<boolean>;
      onDownloadProgress: (repoName: string, callback: (progress: number) => void) => () => void;
    };
  }
}

