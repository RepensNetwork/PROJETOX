export interface App {
  id: string
  name: string
  url: string
  icon?: string
  description?: string
}

export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string
  stargazers_count: number
  forks_count: number
  language: string
  private: boolean
  html_url: string
  updated_at: string
}

export type TabType = 'terminal' | 'github' | 'apps'
