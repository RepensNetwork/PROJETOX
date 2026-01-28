# 🔧 Guia de Debug do Navegador

## Problema Comum: Navegador Já em Execução

Se você receber o erro: *"It looks like a browser is already running from an old debug session"*, siga as soluções abaixo.

## Soluções Disponíveis

### 1. **Usar a Configuração Melhorada (Recomendado)**

A configuração principal de debug agora inclui:
- `killBehavior: "forceful"` - Fecha automaticamente instâncias antigas
- `runtimeArgs` - Abre uma nova janela isolada do Chrome
- Perfil de debug separado para evitar conflitos

**Como usar:**
1. Pressione `F5` ou vá em **Run > Start Debugging**
2. Selecione "🌐 Abrir Dashboard no Navegador"
3. O sistema fechará automaticamente instâncias antigas e abrirá uma nova

### 2. **Fechar Chrome Manualmente Antes de Debug**

**Opção A: Usar a Task**
1. Pressione `Ctrl+Shift+P` (ou `Cmd+Shift+P` no Mac)
2. Digite "Tasks: Run Task"
3. Selecione "🔄 Fechar Chrome Antes de Debug"
4. Depois inicie o debug normalmente

**Opção B: Fechar Manualmente**
1. Feche todas as janelas do Chrome/Edge
2. Verifique no Gerenciador de Tarefas se há processos `chrome.exe` ou `msedge.exe`
3. Finalize os processos se necessário
4. Inicie o debug novamente

### 3. **Conectar ao Navegador Existente**

Se você preferir manter o navegador aberto e apenas conectar o debugger:

1. Abra o Chrome/Edge manualmente com debug habilitado:
   ```powershell
   # Chrome
   "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="C:\temp\chrome-debug"
   
   # Edge
   "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --remote-debugging-port=9222 --user-data-dir="C:\temp\edge-debug"
   ```

2. No VS Code/Cursor:
   - Pressione `F5`
   - Selecione "🔗 Conectar ao Navegador Existente"
   - O debugger se conectará ao navegador já aberto

## Configurações Disponíveis

### 🌐 Abrir Dashboard no Navegador
- **Tipo:** Launch (abre nova instância)
- **Comportamento:** Fecha instâncias antigas automaticamente
- **Uso:** Ideal para iniciar uma nova sessão de debug

### 🔗 Conectar ao Navegador Existente
- **Tipo:** Attach (conecta a instância existente)
- **Porta:** 9222 (porta padrão do Chrome DevTools Protocol)
- **Uso:** Ideal quando você já tem o navegador aberto

## Troubleshooting

### Erro: "Cannot connect to the target"
- Certifique-se de que o servidor Next.js está rodando (`npm run dev`)
- Verifique se a porta 3000 está acessível
- Tente usar a configuração "Abrir Dashboard no Navegador" ao invés de "Conectar"

### Erro: "Port 9222 is already in use"
- Outro processo está usando a porta de debug
- Feche outras instâncias do Chrome com debug habilitado
- Ou use uma porta diferente na configuração de attach

### O navegador abre mas não conecta
- Verifique se o `preLaunchTask` executou corretamente
- Confira se o servidor Next.js está rodando na porta 3000
- Veja os logs no terminal integrado

## Dicas

1. **Perfil de Debug Isolado:** A configuração usa um perfil separado em `.vscode/chrome-debug-profile`, então suas extensões e configurações normais do Chrome não interferem.

2. **Fechar Automaticamente:** Com `killBehavior: "forceful"`, instâncias antigas são fechadas automaticamente, mas você pode escolher "Debug Anyway" se preferir manter abertas.

3. **Múltiplas Sessões:** Se precisar de múltiplas sessões de debug, use perfis diferentes ou portas diferentes.

## Comandos Rápidos

- **Iniciar Debug:** `F5`
- **Parar Debug:** `Shift+F5`
- **Executar Task:** `Ctrl+Shift+P` → "Tasks: Run Task"
- **Ver Configurações:** `Ctrl+Shift+D` → Selecione configuração no dropdown

---

**Problema persistindo?** Execute a task "🔄 Fechar Chrome Antes de Debug" e tente novamente.
