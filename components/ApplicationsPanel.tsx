'use client'

import { useState, useEffect } from 'react'
import { Grid, Plus, Settings, Trash2, ExternalLink } from 'lucide-react'
import type { App } from '@/types'

const defaultApps: App[] = [
  {
    id: '1',
    name: 'GitHub',
    url: 'https://github.com',
    description: 'Repositório de código',
  },
  {
    id: '2',
    name: 'VS Code',
    url: 'https://code.visualstudio.com',
    description: 'Editor de código',
  },
]

export default function ApplicationsPanel() {
  const [apps, setApps] = useState<App[]>(defaultApps)

  useEffect(() => {
    // Carregar apps do localStorage na inicialização
    if (typeof window !== 'undefined') {
      const savedApps = localStorage.getItem('apps')
      if (savedApps) {
        try {
          const parsed = JSON.parse(savedApps)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setApps(parsed)
          }
        } catch (e) {
          console.error('Erro ao carregar apps:', e)
        }
      }
    }
  }, [])
  const [showAddModal, setShowAddModal] = useState(false)
  const [newApp, setNewApp] = useState({ name: '', url: '', description: '' })

  const handleAddApp = () => {
    if (newApp.name && newApp.url) {
      const app: App = {
        id: Date.now().toString(),
        name: newApp.name,
        url: newApp.url.startsWith('http') ? newApp.url : `https://${newApp.url}`,
        description: newApp.description,
      }
      setApps([...apps, app])
      setNewApp({ name: '', url: '', description: '' })
      setShowAddModal(false)
      // Salvar no localStorage
      localStorage.setItem('apps', JSON.stringify([...apps, app]))
    }
  }

  const handleDeleteApp = (id: string) => {
    const updatedApps = apps.filter((app) => app.id !== id)
    setApps(updatedApps)
    localStorage.setItem('apps', JSON.stringify(updatedApps))
  }

  const openApp = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="flex flex-col h-full min-h-[600px]">
      {/* Header */}
      <div className="bg-gray-900 px-4 py-3 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Grid size={20} className="text-gray-300" />
          <span className="text-sm font-medium text-gray-300">Aplicações</span>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
        >
          <Plus size={16} />
          Adicionar
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {apps.length === 0 ? (
          <div className="text-center py-12">
            <Grid size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 mb-4">Nenhuma aplicação adicionada</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              Adicionar Primeira Aplicação
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {apps.map((app) => (
              <div
                key={app.id}
                className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-200 mb-1">{app.name}</h3>
                    {app.description && (
                      <p className="text-sm text-gray-400">{app.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteApp(app.id)}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                  >
                    <ExternalLink size={14} />
                    Abrir
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-200">Adicionar Aplicação</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nome</label>
                <input
                  type="text"
                  value={newApp.name}
                  onChange={(e) => setNewApp({ ...newApp, name: e.target.value })}
                  placeholder="Ex: GitHub"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">URL</label>
                <input
                  type="text"
                  value={newApp.url}
                  onChange={(e) => setNewApp({ ...newApp, url: e.target.value })}
                  placeholder="Ex: github.com ou https://github.com"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descrição (opcional)
                </label>
                <input
                  type="text"
                  value={newApp.description}
                  onChange={(e) => setNewApp({ ...newApp, description: e.target.value })}
                  placeholder="Breve descrição"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setNewApp({ name: '', url: '', description: '' })
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddApp}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
