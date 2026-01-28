'use client'

import { useEffect, useRef, useState } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import '@xterm/xterm/css/xterm.css'
import { Terminal as TerminalIcon, Maximize2, Minimize2 } from 'lucide-react'

export default function Terminal() {
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<XTerm | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    if (!terminalRef.current) return

    // Inicializar terminal
    const xterm = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Consolas, "Courier New", monospace',
      theme: {
        background: '#1a1a1a',
        foreground: '#e0e0e0',
        cursor: '#00ff00',
        selection: '#333333',
        black: '#000000',
        red: '#cd3131',
        green: '#0dbc79',
        yellow: '#e5e510',
        blue: '#2472c8',
        magenta: '#bc3fbc',
        cyan: '#11a8cd',
        white: '#e5e5e5',
        brightBlack: '#666666',
        brightRed: '#f14c4c',
        brightGreen: '#23d18b',
        brightYellow: '#f5f543',
        brightBlue: '#3b8eea',
        brightMagenta: '#d670d6',
        brightCyan: '#29b8db',
        brightWhite: '#e5e5e5',
      },
    })

    const fitAddon = new FitAddon()
    const webLinksAddon = new WebLinksAddon()

    xterm.loadAddon(fitAddon)
    xterm.loadAddon(webLinksAddon)
    xterm.open(terminalRef.current)

    // Ajustar tamanho
    fitAddon.fit()

    // Mensagem de boas-vindas
    xterm.writeln('\x1b[32mBem-vindo ao Terminal Integrado!\x1b[0m')
    xterm.writeln('\x1b[36mDigite comandos ou "help" para ajuda.\x1b[0m')
    xterm.write('\r\n$ ')

    // Simular terminal interativo
    let currentLine = ''
    xterm.onData((data) => {
      if (data === '\r') {
        // Enter pressionado
        xterm.write('\r\n')
        handleCommand(currentLine.trim(), xterm)
        currentLine = ''
        xterm.write('$ ')
      } else if (data === '\x7f') {
        // Backspace
        if (currentLine.length > 0) {
          currentLine = currentLine.slice(0, -1)
          xterm.write('\b \b')
        }
      } else if (data >= String.fromCharCode(0x20)) {
        // Caracteres imprimíveis
        currentLine += data
        xterm.write(data)
      }
    })

    xtermRef.current = xterm
    fitAddonRef.current = fitAddon

    // Ajustar tamanho ao redimensionar
    const handleResize = () => {
      fitAddon.fit()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      xterm.dispose()
    }
  }, [])

  const handleCommand = (command: string, xterm: XTerm) => {
    if (!command) return

    const [cmd, ...args] = command.split(' ')

    switch (cmd.toLowerCase()) {
      case 'help':
        xterm.writeln('\x1b[36mComandos disponíveis:\x1b[0m')
        xterm.writeln('  help          - Mostra esta ajuda')
        xterm.writeln('  clear         - Limpa o terminal')
        xterm.writeln('  echo <text>   - Repete o texto')
        xterm.writeln('  date          - Mostra a data/hora')
        xterm.writeln('  pwd           - Mostra o diretório atual')
        xterm.writeln('  ls            - Lista arquivos')
        xterm.writeln('  github        - Abre integração GitHub')
        break
      case 'clear':
        xterm.clear()
        break
      case 'echo':
        xterm.writeln(args.join(' '))
        break
      case 'date':
        xterm.writeln(new Date().toLocaleString('pt-BR'))
        break
      case 'pwd':
        if (typeof window !== 'undefined') {
          xterm.writeln(window.location.pathname || '/')
        } else {
          xterm.writeln('/')
        }
        break
      case 'ls':
        xterm.writeln('\x1b[33mapp/\x1b[0m  \x1b[33mcomponents/\x1b[0m  \x1b[33mpublic/\x1b[0m')
        break
      case 'github':
        xterm.writeln('\x1b[36mRedirecionando para GitHub...\x1b[0m')
        // Aqui você pode adicionar lógica para mudar de aba
        break
      default:
        xterm.writeln(`\x1b[31mComando não encontrado: ${cmd}\x1b[0m`)
        xterm.writeln('Digite "help" para ver comandos disponíveis.')
    }
  }

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized)
    setTimeout(() => {
      fitAddonRef.current?.fit()
    }, 100)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Terminal Header */}
      <div className="bg-gray-900 px-4 py-2 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-2">
          <TerminalIcon size={16} className="text-green-400" />
          <span className="text-sm font-medium text-gray-300">Terminal Integrado</span>
        </div>
        <button
          onClick={toggleMaximize}
          className="text-gray-400 hover:text-gray-200 transition-colors"
        >
          {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>

      {/* Terminal Container */}
      <div
        ref={terminalRef}
        className={`flex-1 ${isMaximized ? 'fixed inset-4 z-50' : ''}`}
        style={{ minHeight: '400px' }}
      />
    </div>
  )
}
