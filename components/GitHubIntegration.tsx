'use client'

import { useState, useEffect } from 'react'
import { Github, Search, Star, GitBranch, Code, Lock, Globe } from 'lucide-react'
import type { GitHubRepo } from '@/types'

export default function GitHubIntegration() {
  const [token, setToken] = useState('')
  const [username, setUsername] = useState('')
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Verificar se há token salvo
    const savedToken = localStorage.getItem('github_token')
    const savedUsername = localStorage.getItem('github_username')
    if (savedToken && savedUsername) {
      setToken(savedToken)
      setUsername(savedUsername)
      setIsAuthenticated(true)
      fetchRepos(savedToken, savedUsername)
    }
  }, [])

  const handleConnect = async () => {
    if (!token || !username) {
      setError('Por favor, preencha token e username')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`https://api.github.com/users/${username}/repos`, {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      })

      if (!response.ok) {
        throw new Error('Falha ao conectar. Verifique seu token e username.')
      }

      const data = await response.json()
      setRepos(data)
      setIsAuthenticated(true)
      localStorage.setItem('github_token', token)
      localStorage.setItem('github_username', username)
    } catch (err: any) {
      setError(err.message || 'Erro ao conectar com GitHub')
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const fetchRepos = async (authToken: string, user: string) => {
    setLoading(true)
    try {
      const response = await fetch(`https://api.github.com/users/${user}/repos`, {
        headers: {
          Authorization: `token ${authToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setRepos(data)
      }
    } catch (err) {
      console.error('Erro ao buscar repositórios:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = () => {
    setToken('')
    setUsername('')
    setRepos([])
    setIsAuthenticated(false)
    localStorage.removeItem('github_token')
    localStorage.removeItem('github_username')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  return (
    <div className="flex flex-col h-full min-h-[600px]">
      {/* Header */}
      <div className="bg-gray-900 px-4 py-3 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Github size={20} className="text-gray-300" />
          <span className="text-sm font-medium text-gray-300">GitHub Integration</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {!isAuthenticated ? (
          <div className="max-w-md mx-auto">
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-gray-200">Conectar ao GitHub</h2>
              <p className="text-sm text-gray-400 mb-4">
                Para usar a integração, você precisa de um Personal Access Token do GitHub.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    GitHub Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="seu-username"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Personal Access Token
                  </label>
                  <input
                    type="password"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxx"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Crie um token em:{' '}
                    <a
                      href="https://github.com/settings/tokens"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      github.com/settings/tokens
                    </a>
                  </p>
                </div>
                {error && (
                  <div className="bg-red-900/30 border border-red-700 rounded p-3 text-sm text-red-300">
                    {error}
                  </div>
                )}
                <button
                  onClick={handleConnect}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded transition-colors"
                >
                  {loading ? 'Conectando...' : 'Conectar'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-200">
                Repositórios de {username}
              </h2>
              <button
                onClick={handleDisconnect}
                className="text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                Desconectar
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-400">Carregando...</div>
            ) : repos.length === 0 ? (
              <div className="text-center py-8 text-gray-400">Nenhum repositório encontrado</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {repos.map((repo) => (
                  <div
                    key={repo.id}
                    className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {repo.private ? (
                          <Lock size={16} className="text-yellow-400 flex-shrink-0" />
                        ) : (
                          <Globe size={16} className="text-green-400 flex-shrink-0" />
                        )}
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-blue-400 hover:underline truncate"
                        >
                          {repo.name}
                        </a>
                      </div>
                    </div>
                    {repo.description && (
                      <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                        {repo.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {repo.language && (
                        <div className="flex items-center gap-1">
                          <Code size={14} />
                          <span>{repo.language}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Star size={14} />
                        <span>{repo.stargazers_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <GitBranch size={14} />
                        <span>{repo.forks_count}</span>
                      </div>
                      <span className="ml-auto">
                        Atualizado: {formatDate(repo.updated_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
