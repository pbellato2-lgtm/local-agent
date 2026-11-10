# Trojan

Agente de IA local para Windows. Aplicativo nativo em Rust com interface WebView2, sem servidor intermediÃ¡rio. O browser fala direto com o processo local, e o processo fala direto com o provedor de IA que vocÃª escolher.

## Novidades â€” v2.1.0

- **MemÃ³ria total da sessÃ£o** â€” o agente nÃ£o esquece mais nada do que jÃ¡ fez nesta conversa. Fim do "nÃ£o criei nenhum arquivo" depois de ter criado.
- **Ledger factual do runtime** â€” cada pedido do operador, ferramenta executada, caminho criado e resultado Ã© registrado e reinjetado no prompt. O modelo lÃª fatos, nÃ£o lembranÃ§as.
- **HistÃ³rico sem corte destrutivo** â€” a janela subiu de 10 mensagens/9k caracteres para 160 mensagens/160k no modo `Eco:mÃ¡x` (atÃ© 400/400k no modo baixo). Economizar token nunca mais apaga contexto.
- **CompactaÃ§Ã£o de fallback preservada** â€” ao trocar de modelo, mantÃ©m 120 mensagens em vez de 6, e o ledger continua no system prompt.
- **MemÃ³ria por conversa em disco** â€” `session_memory.json` guarda o ledger de cada chat; mesmo que o navegador limpe o histÃ³rico, o servidor lembra.
- **Regra anti-negacao** â€” antes de dizer que um arquivo nÃ£o existe, o agente verifica no disco; se sumiu, diz onde ele foi criado, nunca que nunca existiu.
- **HistÃ³rico do cliente ampliado** â€” 4.000 mensagens por conversa no armazenamento local (antes 250), com corte inteligente sÃ³ quando o disco enche.

## Novidades anteriores â€” v2.0.0

- **Pastas de conversas** na barra lateral, em linhas compactas com Ã­cone e contador.
- **BotÃ£o `+` pequeno** no cabeÃ§alho **Pastas** para criar uma pasta.
- **Clique na pasta** para abrir um painel com todas as conversas dela.
- **Todas as conversas** â€” arquivo completo com contador e busca por tÃ­tulo ou mensagem.
- **Mover conversas** entre pastas pelo seletor no painel ou arrastando na barra lateral.
- **Renomear e remover pastas** sem apagar nenhuma conversa.

## Funcionalidades

- **Chat com IA** â€” streaming em tempo real, mÃºltiplos provedores (OpenAI, Anthropic, Google, NVIDIA, Groq, xAI, Mistral, Ollama, e custom)
- **Pastas de conversas** â€” organize por nome, clique na pasta para listar as conversas
- **Arquivo de conversas** â€” botÃ£o "Todas as conversas" com busca e movimentaÃ§Ã£o entre pastas
- **Sistema de Skills** â€” digite `/` no compositor para ver skills instaladas. Instale skills de qualquer fonte (GitHub, zip, SKILL.md, caminho local)
- **Reverse Engineering Workbench** â€” botÃ£o "RE" no compositor. Lista apps instalados, navega pastas, analisa binÃ¡rios, integra com Ghidra headless
- **GeraÃ§Ã£o de Imagens** â€” ferramenta `generate_image` (Pollinations gratuito ou provedor configurado)
- **Upload de Arquivos** â€” anexe arquivos e imagens Ã  conversa (clipe ou drag & drop)
- **Multi-modelo com Fallback** â€” configure modelos de fallback; se um falhar, a conversa Ã© compactada e redirecionada automaticamente
- **Turbo Mode** â€” desativa raciocÃ­nio interno para respostas em segundos
- **Cross-Chat Recall** â€” peÃ§a "lembre do chat X" para carregar contexto de outra conversa
- **Modo Irrestrito** â€” agente padrÃ£o sem limitaÃ§Ãµes de conteÃºdo
- **Interface adaptÃ¡vel** â€” tema claro/escuro, estilos de UI e nÃ­veis de animaÃ§Ã£o em PreferÃªncias

## Download

### VersÃ£o PortÃ¡til (recomendado)

Baixe o `.zip` da [pÃ¡gina de Releases](https://github.com/pbellato2-lgtm/local-agent/releases/latest):

1. Baixe `Trojan-Portable.zip`
2. Extraia em qualquer pasta
3. Execute `Trojan.exe` (ou `iniciar.bat` para evitar aviso do Windows)
4. Configure sua API key em ConfiguraÃ§Ãµes â†’ ConexÃµes

Download direto da versÃ£o atual:

```
https://github.com/pbellato2-lgtm/local-agent/releases/download/v2.1.0/Trojan-Portable.zip
```

### InstalaÃ§Ã£o com um comando (PowerShell)

Abra o PowerShell e cole:

```powershell
irm https://raw.githubusercontent.com/pbellato2-lgtm/local-agent/main/install.ps1 | iex
```

O script automaticamente:
1. Verifica se o Rust estÃ¡ instalado (instala se necessÃ¡rio)
2. Clona o repositÃ³rio
3. Compila o projeto
4. Desbloqueia o `.exe` (evita aviso do SmartScreen)
5. Executa o Trojan

### Compilar manualmente

```bash
git clone https://github.com/pbellato2-lgtm/local-agent.git
cd trojan
cargo build --release
```

O executÃ¡vel estarÃ¡ em `target/release/trojan-desktop.exe`. Copie para uma pasta com `public/`, `agents/`, `scripts/` e `trojan.ico`. Ou use `build-and-run.bat` para compilar, desbloquear e executar.

## Requisitos

- Windows 10/11 (x64)
- WebView2 Runtime (instalado por padrÃ£o no Windows 11)
- Java JDK 21+ (opcional, para Ghidra headless no RE Workbench)
- Ghidra (opcional, para anÃ¡lise profunda de binÃ¡rios)

## ConfiguraÃ§Ã£o

1. Execute `Trojan.exe`
2. Clique em **ConfiguraÃ§Ãµes** (Ã­cone de engrenagem)
3. Na aba **ConexÃµes**, adicione sua API key:
   - OpenAI, Anthropic, Google, NVIDIA, Groq, xAI, Mistral, OpenRouter, ou custom
   - Ollama (local, sem key)
4. Escolha o modelo ativo
5. (Opcional) Configure geraÃ§Ã£o de imagem em **PreferÃªncias**

As chaves ficam somente neste PC, em `config.json`, ao lado do executÃ¡vel.

### GeraÃ§Ã£o de Imagens

Por padrÃ£o, usa **Pollinations** (gratuito, sem API key). Para melhor qualidade:
- Configure uma chave de API de imagem em PreferÃªncias (OpenAI DALL-E, Stability AI, etc.)
- O sistema detecta automaticamente a melhor opÃ§Ã£o disponÃ­vel

## Pastas e organizaÃ§Ã£o

A barra lateral separa as conversas em dois nÃ­veis:

- **Todas as conversas** â€” abre o arquivo completo, com busca por tÃ­tulo ou conteÃºdo e a contagem total.
- **Pastas** â€” o `+` no cabeÃ§alho cria uma pasta. Clique na pasta para abrir o painel com as conversas dela.

Dentro do painel de uma pasta:

- Clique em uma conversa para abri-la.
- Use o seletor ao lado de cada conversa para movÃª-la para outra pasta ou deixÃ¡-la sem pasta.
- O Ã­cone de lixeira apaga a conversa (as demais permanecem).

Na barra lateral:

- Arraste uma conversa para cima de uma pasta para movÃª-la.
- Passe o mouse sobre a pasta e use o lÃ¡pis para renomear ou a lixeira para remover a pasta. As conversas continuam salvas e voltam para a lista principal.

## Reverse Engineering Workbench

Clique no botÃ£o **RE** na barra do compositor. O workbench:
- Detecta apps instalados automaticamente
- Permite navegar pastas e selecionar arquivos
- Analisa binÃ¡rios (tipo, executÃ¡veis, ASAR/Electron, strings)
- Integra com Ghidra headless (requer Ghidra instalado)
- Envia a anÃ¡lise para o agente de IA

## Estrutura do Projeto

```
trojan/
â”œâ”€â”€ src/                    # CÃ³digo Rust
â”‚   â”œâ”€â”€ main.rs             # Entry point, janela WebView2
â”‚   â”œâ”€â”€ chat.rs             # WebSocket chat, system prompt, multi-modelo
â”‚   â”œâ”€â”€ providers.rs        # Provedores de IA, HTTP client compartilhado
â”‚   â”œâ”€â”€ tools.rs            # Ferramentas (shell, arquivos, skills, imagem)
â”‚   â”œâ”€â”€ skills.rs           # Sistema de skills (install, list, load)
â”‚   â”œâ”€â”€ re_workbench.rs     # Reverse Engineering Workbench
â”‚   â”œâ”€â”€ server.rs           # Rotas axum (API + static)
â”‚   â”œâ”€â”€ state.rs            # Config, settings, paths
â”‚   â”œâ”€â”€ agents.rs           # Parser de agentes
â”‚   â””â”€â”€ system.rs           # Info do sistema
â”œâ”€â”€ public/                 # Frontend (HTML/CSS/JS)
â”œâ”€â”€ agents/                 # DefiniÃ§Ãµes de agentes (.md)
â”œâ”€â”€ scripts/                # Scripts PowerShell auxiliares
â”œâ”€â”€ skills/                 # Skills instaladas em runtime
â”œâ”€â”€ trojan.ico              # Ãcone do aplicativo
â”œâ”€â”€ config.json             # Criado no primeiro uso (nÃ£o versionado)
â”œâ”€â”€ Cargo.toml              # DependÃªncias Rust
â””â”€â”€ build.rs                # Build script (Ã­cone Windows)
```

## Agentes

O Trojan vem com agentes prÃ©-configurados:

| Agente | DescriÃ§Ã£o |
|--------|-----------|
| **Irrestrito** | Agente padrÃ£o, sem limitaÃ§Ãµes de conteÃºdo |
| **Lunar** | Agente auxiliar |
| **Gerador de Imagens** | Especialista em geraÃ§Ã£o de imagens com prompt engineering |

Agentes sÃ£o arquivos `.md` em `agents/`. VocÃª pode criar os seus prÃ³prios.

## Skills

O sistema aceita skills no formato Claude/OpenCode. Elas sÃ£o instaladas em `skills/<id>/SKILL.md`, na pasta do aplicativo.

Fontes aceitas:
- `SKILL.md` direto
- RepositÃ³rio, Ã¡rvore ou blob do GitHub
- Arquivo `.zip`
- Caminho local

Para instalar, peÃ§a no chat: `instale a skill <URL>`. Digite `/` no compositor para abrir o seletor de skills instaladas.

CatÃ¡logo de skills compatÃ­veis, instaladas sob demanda:

| Categoria | Skills |
|-----------|--------|
| Documentos | pdf, docx, xlsx, pptx |
| Design | frontend-design, canvas-design, algorithmic-art, theme-factory |
| Desenvolvimento | mcp-builder, webapp-testing, web-artifacts-builder, claude-api, skill-creator |
| Reverse Engineering | reverse-engineering, codex-ghidra-headless, ghidra-reconstruct, rizin, malware-reverse-engineering |
| SeguranÃ§a | offensive-security, exploit-development, forensics-triage, detection-engineering, assembly-programming |
| ComunicaÃ§Ã£o | internal-comms, doc-coauthoring, slack-gif-creator |
| Outros | brand-guidelines, academy-guide, discernment-nudge, prompt-enhancement, rea-* |

## LicenÃ§a

MIT

## CrÃ©ditos

Criado por **bellatozx**.

