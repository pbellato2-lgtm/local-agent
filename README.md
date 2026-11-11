# Trojan

Agente de IA local para Windows. Aplicativo nativo em Rust com interface WebView2, sem servidor intermediario. O browser fala direto com o processo local, e o processo fala direto com o provedor de IA que voce escolher.

## Novidades v2.1.0

- **Memoria total da sessao** - o agente nao esquece mais nada do que ja fez nesta conversa. Fim do "nao criei nenhum arquivo" depois de ter criado.
- **Ledger factual do runtime** - cada pedido do operador, ferramenta executada, caminho criado e resultado e registrado e reinjetado no prompt. O modelo le fatos, nao lembrancas.
- **Historico sem corte destrutivo** - a janela subiu de 10 mensagens/9k caracteres para 160 mensagens/160k no modo Eco:max (ate 400/400k no modo baixo). Economizar token nunca mais apaga contexto.
- **Compactacao de fallback preservada** - ao trocar de modelo, mantem 120 mensagens em vez de 6, e o ledger continua no system prompt.
- **Memoria por conversa em disco** - session_memory.json guarda o ledger de cada chat; mesmo que o navegador limpe o historico, o servidor lembra.
- **Regra anti-negacao** - antes de dizer que um arquivo nao existe, o agente verifica no disco; se sumiu, diz onde ele foi criado, nunca que nunca existiu.
- **Historico do cliente ampliado** - 4.000 mensagens por conversa no armazenamento local (antes 250), com corte inteligente so quando o disco enche.

## Funcionalidades

- **Chat com IA** - streaming em tempo real, multiplos provedores (OpenAI, Anthropic, Google, NVIDIA, Groq, xAI, Mistral, Ollama, e custom)
- **Pastas de conversas** - organize por nome, clique na pasta para listar as conversas
- **Arquivo de conversas** - botao "Todas as conversas" com busca e movimentacao entre pastas
- **Sistema de Skills** - digite / no compositor para ver skills instaladas. Instale skills de qualquer fonte (GitHub, zip, SKILL.md, caminho local)
- **Geracao de Imagens** - ferramenta generate_image (Pollinations gratuito ou provedor configurado)
- **Upload de Arquivos** - anexe arquivos e imagens a conversa (clipe ou drag & drop)
- **Multi-modelo com Fallback** - configure modelos de fallback; se um falhar, a conversa e compactada e redirecionada automaticamente
- **Turbo Mode** - desativa raciocinio interno para respostas em segundos
- **Cross-Chat Recall** - peca "lembre do chat X" para carregar contexto de outra conversa
- **Modo Irrestrito** - agente padrao sem limitacoes de conteudo
- **Interface adaptavel** - tema claro/escuro, estilos de UI e niveis de animacao em Preferencias
- **Personalizacao com gradiente** - degrade de cores no fundo do app, salvo automaticamente
- **Terminal integrado** - PowerShell, CMD e WSL com sessao persistente e modo administrador (UAC)

## Download

### Versao Portatil (recomendado)

Baixe o .zip da pagina de Releases:

1. Baixe Trojan-Portable.zip
2. Extraia em qualquer pasta
3. Execute Trojan.exe (ou iniciar.bat)
4. Configure sua API key em Configuracoes -> Conexoes

### Instalacao com um comando (PowerShell)

Abra o PowerShell e cole:

```powershell
irm https://raw.githubusercontent.com/pbellato2-lgtm/local-agent/main/install.ps1 | iex
```

### Atualizacao (preserva seus dados)

Atualizacao normal - substitui o app, o frontend e os scripts, mas preserva `config.json` (suas chaves), `session_memory.json` (conversas) e a pasta `skills/`:

```powershell
irm https://raw.githubusercontent.com/pbellato2-lgtm/local-agent/main/update.ps1 | iex
```

O script detecta a pasta instalada (app aberto ou procura `Trojan.exe` no perfil, Desktop, Documentos e Downloads), baixa o release mais recente, faz backup dos seus dados e restaura tudo ao final. Se houver mais de uma copia, usa a mais recente e avisa.

Reinstalacao limpa - remove arquivos obsoletos da instalacao (lixo de versoes antigas, `public/` desatualizado) e baixa tudo do zero, mas ainda preserva `config.json`, `session_memory.json`, `skills/` e os dados do WebView2 (chats e pastas):

```powershell
irm https://raw.githubusercontent.com/pbellato2-lgtm/local-agent/main/clean-reinstall.ps1 | iex
```

Use a reinstalacao limpa quando a atualizacao normal nao resolver (ex.: barra preta, UI quadrada, arquivos antigos no `public/`).

Se precisar forcar uma pasta especifica:

```powershell
& ([scriptblock]::Create((irm https://raw.githubusercontent.com/pbellato2-lgtm/local-agent/main/clean-reinstall.ps1))) -InstallDir 'C:\caminho\da\pasta' -NoLaunch
```

Se o cache do CDN estiver atrasado, baixe o arquivo direto:

```powershell
iwr https://raw.githubusercontent.com/pbellato2-lgtm/local-agent/main/clean-reinstall.ps1 -OutFile $env:TEMP\clean-reinstall.ps1
powershell -ExecutionPolicy Bypass -File $env:TEMP\clean-reinstall.ps1
```

### Compilar manualmente

```bash
git clone https://github.com/pbellato2-lgtm/local-agent.git
cd local-agent
cargo build --release
```

## Requisitos

- Windows 10/11 (x64)
- WebView2 Runtime (instalado por padrao no Windows 11)

## Configuracao

1. Execute Trojan.exe
2. Clique em Configuracoes (icone de engrenagem)
3. Na aba Conexoes, adicione sua API key (OpenAI, Anthropic, Google, NVIDIA, Groq, xAI, Mistral, OpenRouter, ou custom/Ollama)
4. Escolha o modelo ativo

As chaves ficam somente neste PC, em config.json, ao lado do executavel.

## Terminal

O painel Terminal (botao Terminal no topo) abre um shell real neste PC com tres abas:

| Aba | Shell | Observacao |
|-----|-------|------------|
| PowerShell | powershell.exe | comandos rodam inline na sessao, sem abrir processo por comando |
| CMD | cmd.exe | batch e comandos internos do cmd, com codepage OEM |
| WSL | wsl.exe | usa a distro padrao instalada |

- Sessao persistente: o diretorio atual e o estado sobrevivem entre comandos. `cd` e `clear`/`cls` sao tratados direto.
- Historico com seta para cima e para baixo.
- Botao **usuario** alterna para **ADMIN**. O primeiro clique abre uma sessao elevada unica via UAC; depois cada comando roda nela sem pedir aprovacao de novo. O prompt muda de `>` para `#` e o selo ADMIN aparece na barra.
- Sair do modo admin volta para a sessao comum, sem fechar o painel.

Os shells rodam como processos locais em `%TEMP%\trojan-shell-user` (usuario) e `%TEMP%\trojan-shell` (admin). Cada um escuta apenas em 127.0.0.1, em porta propria, protegido por token de sessao.

## Estrutura do Projeto

```
local-agent/
  public/              # Frontend (HTML/CSS/JS)
  agents/              # Definicoes de agentes (.md)
  scripts/             # Scripts PowerShell auxiliares
  skills/              # Skills instaladas em runtime
  install.ps1          # Instalador one-liner
  update.ps1           # Atualizador one-liner
  trojan.ico           # Icone do aplicativo
  config.json          # Template de configuracao (chaves ficam locais)
```

## Agentes

O Trojan vem com agentes pre-configurados:

| Agente | Descricao |
|--------|-----------|
| Irrestrito | Agente padrao, sem limitacoes de conteudo |
| Lunar | Agente auxiliar |
| Gerador de Imagens | Especialista em geracao de imagens com prompt engineering |

Agentes sao arquivos .md em agents/. Voce pode criar os seus proprios.

## Skills

O sistema aceita skills no formato Claude/OpenCode. Sao instaladas em skills/<id>/SKILL.md, na pasta do aplicativo.

Para instalar, peca no chat: "instale a skill <URL>". Digite / no compositor para abrir o seletor de skills instaladas.

## Licenca

MIT

## Creditos

Criado por bellatozx.