(() => {
  'use strict';

  /* ============================================================
     Helpers
     ============================================================ */

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const STORE_CHATS = 'trojan.chats.v1';
  const STORE_FOLDERS = 'trojan.folders.v1';
  const STORE_UI = 'trojan.ui.v1';

  const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ESCAPES[char]);
  }
  const escapeAttr = escapeHtml;

  function icon(name, className = 'ico') {
    return `<svg class="${className}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  }

  function makeId(prefix) {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function formatDuration(ms) {
    if (ms === undefined || ms === null) return '';
    if (ms < 1000) return `${Math.round(ms)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
  }

  function safeHost(url) {
    try {
      return new URL(url).host;
    } catch {
      return (
        String(url || '')
          .replace(/^https?:\/\//, '')
          .replace(/\/.*$/, '') || 'local'
      );
    }
  }

  async function api(path, options = {}) {
    const init = { method: options.method || 'GET', headers: {}, credentials: 'same-origin' };
    if (options.body !== undefined) {
      init.headers['content-type'] = 'application/json';
      init.body = JSON.stringify(options.body);
    }
    const res = await fetch(path, init);
    let data = {};
    try {
      data = await res.json();
    } catch {
      data = {};
    }
    if (!res.ok) {
      if (res.status === 401 && typeof showAuthGate === 'function') showAuthGate(data.error || 'Ativação necessária.');
      const err = new Error(data.error || `HTTP ${res.status}`);
      err.status = res.status;
      throw err;
    }
    return data;
  }

  function toast(message, type = '') {
    const node = document.createElement('div');
    node.className = `toast${type === 'error' ? ' error' : ''}`;
    node.innerHTML = `${icon(type === 'error' ? 'alert' : 'sparkle', '')}<span></span>`;
    node.querySelector('span').textContent = String(message);
    el.toasts.append(node);
    setTimeout(() => {
      node.classList.add('out');
      setTimeout(() => node.remove(), 260);
    }, 3400);
  }

  function setBusy(button, busy) {
    if (!button) return;
    if (busy) {
      button.dataset.original = button.textContent;
      button.disabled = true;
      button.textContent = '...';
    } else {
      button.disabled = false;
      if (button.dataset.original) button.textContent = button.dataset.original;
    }
  }

  function wsSend(payload) {
    if (!state.ws || state.ws.readyState !== WebSocket.OPEN) return false;
    state.ws.send(JSON.stringify(payload));
    return true;
  }

  /* ============================================================
     DOM refs
     ============================================================ */

  const el = {
    app: $('#app'),
    sidebar: $('#sidebar'),
    collapseSidebar: $('#collapseSidebar'),
    openSidebar: $('#openSidebar'),
    sidebarScrim: $('#sidebarScrim'),
    newChat: $('#newChat'),
    chatList: $('#chatList'),
    newFolderBtn: $('#newFolderBtn'),
    allChatsBtn: $('#allChatsBtn'),
    allChatsCount: $('#allChatsCount'),
    chatsModal: $('#chatsModal'),
    chatsModalTitle: $('#chatsModalTitle'),
    chatsSearch: $('#chatsSearch'),
    chatsCount: $('#chatsCount'),
    chatsModalList: $('#chatsModalList'),
    folderModal: $('#folderModal'),
    folderForm: $('#folderForm'),
    folderNameInput: $('#folderNameInput'),
    folderSubmit: $('#folderSubmit'),
    folderModalTitle: $('#folderModalTitle'),
    openSettings: $('#openSettings'),
    keysState: $('#keysState'),
    cpuBar: $('#cpuBar'),
    cpuValue: $('#cpuValue'),
    ramBar: $('#ramBar'),
    ramValue: $('#ramValue'),
    sysHost: $('#sysHost'),
    sysCard: $('#sysCard'),
    pcInfoModal: $('#pcInfoModal'),
    pcInfoTabs: $('#pcInfoTabs'),
    pcInfoContent: $('#pcInfoContent'),
    pcInfoMeta: $('#pcInfoMeta'),
    pcInfoRefresh: $('#pcInfoRefresh'),
    modelPill: $('#modelPill'),
    modelDot: $('#modelDot'),
    modelLabel: $('#modelLabel'),
    agentPill: $('#agentPill'),
    agentLabel: $('#agentLabel'),
    agentPopover: $('#agentPopover'),
    closeAgent: $('#closeAgent'),
    agentList: $('#agentList'),
    agentCount: $('#agentCount'),
    manageAgents: $('#manageAgents'),
    connPill: $('#connPill'),
    connText: $('#connText'),
    tokenPill: $('#tokenPill'),
    tokenUsed: $('#tokenUsed'),
    tokenLeft: $('#tokenLeft'),
    memoryPill: $('#memoryPill'),
    memoryPillText: $('#memoryPillText'),
    themeToggle: $('#themeToggle'),
    terminalToggle: $('#terminalToggle'),
    threadScroll: $('#threadScroll'),
    thread: $('#thread'),
    empty: $('#empty'),
    greeting: $('#greeting'),
    suggestions: $('#suggestions'),
    emptyHint: $('#emptyHint'),
    input: $('#input'),
    send: $('#send'),
    autoApprove: $('#autoApprove'),
    attachBtn: $('#attachBtn'),
    fileInput: $('#fileInput'),
    attachmentPreview: $('#attachmentPreview'),
    terminalChip: $('#terminalChip'),
    reWorkbenchBtn: $('#reWorkbenchBtn'),
    terminalPanel: $('#terminalPanel'),
    closeTerm: $('#closeTerm'),
    clearTerm: $('#clearTerm'),
    termLog: $('#termLog'),
    termForm: $('#termForm'),
    termInput: $('#termInput'),
    termHost: $('#termHost'),
    termTabs: $('#termTabs'),
    termPrompt: $('#termPrompt'),
    termBadge: $('#termBadge'),
    termAdminToggle: $('#termAdminToggle'),
    termAdminLabel: $('#termAdminLabel'),
    termElevate: $('#termElevate'),
    modelPopover: $('#modelPopover'),
    closeModel: $('#closeModel'),
    modelSearch: $('#modelSearch'),
    modelList: $('#modelList'),
    modelCount: $('#modelCount'),
    manageConnections: $('#manageConnections'),
    settingsModal: $('#settingsModal'),
    providerList: $('#providerList'),
    addConnection: $('#addConnection'),
    customForm: $('#customForm'),
    customName: $('#customName'),
    customUrl: $('#customUrl'),
    customKind: $('#customKind'),
    customKey: $('#customKey'),
    cancelCustom: $('#cancelCustom'),
    settingsTabs: $('#settingsTabs'),
    prefAuto: $('#prefAuto'),
    prefAutoRun: $('#prefAutoRun'),
    prefAutoRunMessage: $('#prefAutoRunMessage'),
    prefCwd: $('#prefCwd'),
    prefSystem: $('#prefSystem'),
    prefOperatorName: $('#prefOperatorName'),
    prefInterface: $('#prefInterface'),
    prefAnimation: $('#prefAnimation'),
    prefTheme: $('#prefTheme'),
    prefOpenMode: $('#prefOpenMode'),
    prefTokenSaver: $('#prefTokenSaver'),
    prefFast: $('#prefFast'),
    skillMenu: $('#skillMenu'),
    skillMenuList: $('#skillMenuList'),
    skillInstallForm: $('#skillInstallForm'),
    skillSource: $('#skillSource'),
    skillInstallBtn: $('#skillInstallBtn'),
    settingsSkillList: $('#settingsSkillList'),
    savePrefs: $('#savePrefs'),
    prefAccentColor: $('#prefAccentColor'),
    prefWidgetColor: $('#prefWidgetColor'),
    prefSidebarColor: $('#prefSidebarColor'),
    resetAccentColor: $('#resetAccentColor'),
    resetWidgetColor: $('#resetWidgetColor'),
    resetSidebarColor: $('#resetSidebarColor'),
    prefGradientFrom: $('#prefGradientFrom'),
    prefGradientTo: $('#prefGradientTo'),
    prefGradientDir: $('#prefGradientDir'),
    resetGradient: $('#resetGradient'),
    saveCustomize: $('#saveCustomize'),
    settingsAgentList: $('#settingsAgentList'),
    addAgent: $('#addAgent'),
    refreshAgents: $('#refreshAgents'),
    agentForm: $('#agentForm'),
    agentFormTitle: $('#agentFormTitle'),
    agentName: $('#agentName'),
    agentDescription: $('#agentDescription'),
    agentMode: $('#agentMode'),
    agentContent: $('#agentContent'),
    cancelAgent: $('#cancelAgent'),
    saveAgent: $('#saveAgent'),
    aboutVersion: $('#aboutVersion'),
    aboutNode: $('#aboutNode'),
    aboutPlatform: $('#aboutPlatform'),
    reWorkbenchModal: $('#reWorkbenchModal'),
    reAppList: $('#reAppList'),
    reFileList: $('#reFileList'),
    reBrowsePath: $('#reBrowsePath'),
    reBrowseBtn: $('#reBrowseBtn'),
    reRefreshApps: $('#reRefreshApps'),
    reTargetName: $('#reTargetName'),
    reAnalyzeBtn: $('#reAnalyzeBtn'),
    reResults: $('#reResults'),
    toasts: $('#toasts'),
    authGate: $('#authGate'),
    authForm: $('#authForm'),
    authKey: $('#authKey'),
    authError: $('#authError'),
    authSubmit: $('#authSubmit'),
  };

  /* ============================================================
     State
     ============================================================ */

  const state = {
    chats: [],
    folders: [],
    activeChatId: null,
    activeModel: '',
    activeAgent: '',
    agents: [],
    skills: [],
    connections: [],
    attachments: [],
    config: null,
    settings: {
      autoApprove: true,
      autoRunEnabled: false,
      autoRunMessage: '',
      systemPrompt: '',
      cwd: '',
      operatorName: 'bellatozx',
      theme: 'light',
      uiStyle: 'claude',
      animation: 'full',
      openMode: 'browser',
      activeModel: '',
      activeAgent: '',
      tokenSaver: 'max',
      fastMode: true,
    },
    streaming: false,
    aborting: false,
    ws: null,
    wsReady: false,
    wsRetry: 0,
    wsTimer: null,
    current: null,
    autoScroll: true,
    autoRunFired: false,
    termOpen: false,
    termHistory: [],
    termIndex: -1,
    termShell: 'ps',
    termAdmin: false,
    termPids: { user: 0, admin: 0 },
    termPorts: { user: 0, admin: 0 },
    termTokens: { user: '', admin: '' },
    termElevating: false,
    termQueue: Promise.resolve(),
    termCwd: '',
    execEntries: new Map(),
    sidebarCollapsed: false,
    initialized: false,
    mdRaf: null,
    tokenBumpTimer: null,
    skillQuery: '',
    skillIndex: 0,
    skillRange: null,
    pcInfo: { data: null, tab: '', loading: false, error: '' },
  };

  /* ============================================================
     Storage
     ============================================================ */

  function normalizeStoredMessage(message) {
    if (!message || typeof message !== 'object') return null;
    if (message.role === 'user') {
      return {
        role: 'user',
        content: String(message.content || ''),
        sentContent: String(message.sentContent || ''),
        skills: Array.isArray(message.skills) ? message.skills.slice(0, 12).map(String) : [],
        attachments: Array.isArray(message.attachments) ? message.attachments.slice(0, 20) : [],
        ts: Number(message.ts) || 0,
      };
    }
    if (message.role !== 'assistant') return null;
    return {
      role: 'assistant',
      content: String(message.content || ''),
      thinking: String(message.thinking || ''),
      toolCalls: Array.isArray(message.toolCalls)
        ? message.toolCalls
            .filter((call) => call && call.name)
            .map((call) => ({ id: String(call.id || makeId('call')), name: String(call.name), args: call.args || {} }))
        : [],
      toolResults: Array.isArray(message.toolResults)
        ? message.toolResults
            .filter((result) => result && result.id)
            .map((result) => ({
              id: String(result.id),
              name: String(result.name || 'tool'),
              ok: !!result.ok,
              output: String(result.output || ''),
              meta: result.meta && typeof result.meta === 'object' ? result.meta : {},
            }))
        : [],
      error: String(message.error || ''),
      aborted: !!message.aborted,
      model: String(message.model || ''),
      usage: message.usage || null,
      contextInput: Number(message.contextInput) || 0,
      ts: Number(message.ts) || 0,
    };
  }

  function loadChats() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORE_CHATS) || '[]');
      if (!Array.isArray(raw)) return [];
      return raw
        .filter((chat) => chat && chat.id && Array.isArray(chat.messages))
        .map((chat) => ({
          id: String(chat.id),
          title: String(chat.title || 'Conversa'),
          createdAt: Number(chat.createdAt) || Date.now(),
          updatedAt: Number(chat.updatedAt) || Date.now(),
          messages: chat.messages.map(normalizeStoredMessage).filter(Boolean).slice(-4000),
          memory: normalizeChatMemory(chat.memory),
        }))
        .slice(0, 300);
    } catch {
      return [];
    }
  }

  function serializeMessage(message) {
    if (message.role === 'user') {
      return {
        role: 'user',
        content: String(message.content || ''),
        sentContent: String(message.sentContent || ''),
        skills: Array.isArray(message.skills) ? message.skills.slice(0, 12) : [],
        attachments: Array.isArray(message.attachments) ? message.attachments.slice(0, 20) : [],
        ts: message.ts || Date.now(),
      };
    }
    return {
      role: 'assistant',
      content: String(message.content || ''),
      thinking: String(message.thinking || '').slice(0, 40000),
      toolCalls: (message.toolCalls || []).map((call) => ({
        id: call.id,
        name: call.name,
        args: call.args || {},
      })),
      toolResults: (message.toolResults || []).map((result) => ({
        id: result.id,
        name: result.name,
        ok: !!result.ok,
        output: (() => {
          const text = String(result.output || '');
          if (text.length <= 16000) return text;
          return `${text.slice(0, 11000)}\n...[trecho omitido]...\n${text.slice(-4500)}`;
        })(),
        meta: result.meta && result.meta.image ? { image: result.meta.image } : {},
      })),
      error: message.error || '',
      aborted: !!message.aborted,
      model: message.model || '',
      usage: message.usage || null,
      ts: message.ts || Date.now(),
    };
  }

  function saveChats() {
    const payload = state.chats.map((chat) => ({
      id: chat.id,
      title: chat.title,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      messages: chat.messages.filter((message) => !message.pending).map(serializeMessage),
      memory: chat.memory || null,
    }));
    try {
      localStorage.setItem(STORE_CHATS, JSON.stringify(payload));
    } catch {
      // Sem espaco: preserva TODAS as conversas e corta so o historico antigo
      // das mais velhas. Nunca apagar a sessao atual.
      try {
        const slim = payload.map((chat, index) =>
          index === 0
            ? chat
            : { ...chat, messages: chat.messages.slice(-600) },
        );
        localStorage.setItem(STORE_CHATS, JSON.stringify(slim));
      } catch {
        try {
          const slim = payload.map((chat, index) =>
            index === 0
              ? chat
              : { ...chat, messages: chat.messages.slice(-120) },
          );
          localStorage.setItem(STORE_CHATS, JSON.stringify(slim));
        } catch {
          /* sem espaco no localStorage */
        }
      }
    }
  }

  function loadUI() {
    try {
      return JSON.parse(localStorage.getItem(STORE_UI) || '{}') || {};
    } catch {
      return {};
    }
  }

  function saveUI() {
    try {
      localStorage.setItem(
        STORE_UI,
        JSON.stringify({ activeChatId: state.activeChatId, sidebarCollapsed: state.sidebarCollapsed }),
      );
    } catch {
      /* ignore */
    }
  }

  /* ============================================================
     Theme / chrome
     ============================================================ */

  function normalizeUiStyle(style) {
    return ['claude', 'gemini', 'grok', 'chatgpt'].includes(style) ? style : 'claude';
  }

  function normalizeOpenMode(mode) {
    return ['browser', 'app', 'none'].includes(mode) ? mode : 'browser';
  }

  function normalizeAnimation(level) {
    return ['full', 'balanced', 'subtle', 'off'].includes(level) ? level : 'full';
  }

  function normalizeTokenSaver(mode) {
    return ['off', 'low', 'medium', 'max'].includes(mode) ? mode : 'max';
  }

  function applyCustomColors(settings) {
    const s = settings || state.settings || {};
    const root = document.documentElement.style;
    const map = {
      accentColor: ['--accent', '--accent-bright', '--accent-ink'],
      widgetColor: ['--bg-elevated'],
      sidebarColor: ['--sidebar'],
    };
    for (const [key, vars] of Object.entries(map)) {
      const val = String(s[key] || '').trim();
      if (val) {
        root.setProperty(vars[0], val);
        if (key === 'accentColor') {
          root.setProperty('--accent-bright', val);
          root.setProperty('--accent-ink', val);
          root.setProperty('--accent-soft', `color-mix(in srgb, ${val} 16%, transparent)`);
        }
      } else {
        for (const v of vars) root.removeProperty(v);
        if (key === 'accentColor') root.removeProperty('--accent-soft');
      }
    }
  }

  function applyGradient(settings) {
    const s = settings || state.settings || {};
    const root = document.documentElement.style;
    const from = String(s.gradientFrom || '').trim();
    const to = String(s.gradientTo || '').trim();
    const dir = String(s.gradientDir || '').trim();
    if (from && to) {
      root.setProperty('--app-gradient', `linear-gradient(${dir || 'to bottom'}, ${from}, ${to})`);
      document.documentElement.setAttribute('data-gradient', 'on');
    } else {
      root.removeProperty('--app-gradient');
      document.documentElement.removeAttribute('data-gradient');
    }
  }

  function applyUiStyle(style) {
    const value = normalizeUiStyle(style);
    document.documentElement.setAttribute('data-ui', value);
    state.settings.uiStyle = value;
    try {
      localStorage.setItem('trojan.ui', value);
    } catch {
      /* ignore */
    }
    if (el.prefInterface) {
      $$('button', el.prefInterface).forEach((button) => {
        button.classList.toggle('active', button.dataset.ui === value);
      });
    }
    applyTheme(state.settings.theme);
    applyCustomColors();
    applyGradient();
    applyGradient();
  }

  function applyTheme(theme) {
    const ui = normalizeUiStyle(state.settings.uiStyle);
    const fallback = ui === 'grok' ? 'dark' : 'light';
    const value = theme === 'dark' || theme === 'light' ? theme : fallback;
    document.documentElement.setAttribute('data-theme', value);
    state.settings.theme = value;
    try {
      localStorage.setItem('trojan.theme', value);
    } catch {
      /* ignore */
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      const colors = {
        claude: { light: '#F7F5EF', dark: '#191918' },
        gemini: { light: '#F0F4F9', dark: '#131314' },
        grok: { light: '#FFFFFF', dark: '#000000' },
        chatgpt: { light: '#FFFFFF', dark: '#212121' },
      };
      meta.setAttribute('content', (colors[ui] && colors[ui][value]) || (value === 'dark' ? '#191918' : '#F7F5EF'));
    }
    if (el.prefTheme) {
      $$('button', el.prefTheme).forEach((button) => {
        button.classList.toggle('active', button.dataset.theme === value);
      });
    }
    applyCustomColors();
    applyGradient();
  }

  function applyAnimation(level) {
    const value = normalizeAnimation(level);
    document.documentElement.setAttribute('data-anim', value);
    state.settings.animation = value;
    try {
      localStorage.setItem('trojan.anim', value);
    } catch {
      /* ignore */
    }
    if (el.prefAnimation) {
      $$('button', el.prefAnimation).forEach((button) => {
        button.classList.toggle('active', button.dataset.animLevel === value);
      });
    }
  }

  function setConnState(mode) {
    el.connPill.classList.toggle('online', mode === 'online');
    el.connPill.classList.toggle('offline', mode === 'offline');
    el.connPill.classList.toggle('connecting', mode === 'connecting');
    el.connText.textContent = mode === 'online' ? 'local' : mode === 'offline' ? 'offline' : 'conectando';
  }

  function setAutoApprove(value, persist) {
    state.settings.autoApprove = !!value;
    el.autoApprove.checked = !!value;
    if (el.prefAuto) el.prefAuto.checked = !!value;
    try {
      localStorage.setItem('trojan.auto', value ? '1' : '0');
    } catch {
      /* ignore */
    }
    if (persist) {
      api('/api/settings', { method: 'POST', body: { autoApprove: !!value } }).catch(() => {});
    }
  }

  function canSend() {
    return !!el.input.value.trim() && !!state.activeModel && state.wsReady && !state.streaming;
  }

  function updateSendState() {
    if (state.streaming) {
      el.send.disabled = false;
      return;
    }
    el.send.disabled = !canSend();
  }

  function setStreaming(value) {
    state.streaming = !!value;
    document.documentElement.classList.toggle('is-streaming', state.streaming);
    el.send.classList.toggle('streaming', state.streaming);
    el.send.title = state.streaming ? 'Parar' : 'Enviar';
    el.send.setAttribute('aria-label', state.streaming ? 'Parar' : 'Enviar');
    if (state.streaming) {
      el.send.disabled = false;
    } else {
      updateSendState();
    }
    document.title = state.streaming ? 'Trojan · trabalhando…' : 'Trojan';
  }

  function activeChat() {
    return state.chats.find((chat) => chat.id === state.activeChatId) || null;
  }

  function fmtTokens(n) {
    const v = Math.max(0, Math.round(Number(n) || 0));
    const trim = (text) => text.replace(/\.0$/, '');
    if (v >= 1000000) return `${trim((v / 1000000).toFixed(1))}M`;
    if (v >= 1000) return `${trim((v / 1000).toFixed(1))}k`;
    return String(v);
  }

  function resolveContextLimit() {
    const resolved = resolveModel(state.activeModel);
    const model = resolved && resolved.model ? resolved.model : null;
    const declared =
      Number(model && (model.context || model.context_length || model.context_window || model.max_model_len)) || 0;
    if (declared > 0) return declared;
    const id = String((model && model.id) || (state.activeModel || '').split('/').slice(1).join('/') || '').toLowerCase();
    if (!id) return 128000;
    if (id.includes('gemini')) return 1000000;
    if (id.includes('claude')) return 200000;
    if (/gpt-4\.1|gpt-5|chatgpt-4o/.test(id)) return 1000000;
    if (/gpt-4o|gpt-4-turbo|gpt-4\.5/.test(id)) return 128000;
    if (/(^|\/)o[1-4]/.test(id)) return 200000;
    if (id.includes('codestral')) return 256000;
    if (id.includes('deepseek')) return 128000;
    if (id.includes('qwen')) return 131072;
    if (id.includes('nemotron')) return 131072;
    if (id.includes('mixtral')) return 65536;
    if (/mistral.*(7b|8x7b)/.test(id)) return 32768;
    if (id.includes('llama')) return 128000;
    return 128000;
  }

  function setTokenText(node, value) {
    if (!node || node.textContent === value) return false;
    node.textContent = value;
    return true;
  }

  function pulseTokenPill() {
    if (!el.tokenPill) return;
    el.tokenPill.classList.remove('bump');
    void el.tokenPill.offsetWidth;
    el.tokenPill.classList.add('bump');
    clearTimeout(state.tokenBumpTimer);
    state.tokenBumpTimer = setTimeout(() => el.tokenPill.classList.remove('bump'), 560);
  }

  function updateTokenStats() {
    if (!el.tokenUsed || !el.tokenLeft) return;
    const chat = activeChat();
    const msgs = chat && Array.isArray(chat.messages) ? chat.messages : [];
    let inputTotal = 0;
    let outputTotal = 0;
    let estimated = false;
    let lastInput = 0;
    let lastOutput = 0;
    let lastMode = '';
    let lastSaver = null;
    for (const msg of msgs) {
      if (!msg || msg.role !== 'assistant' || !msg.usage) continue;
      const input = Number(msg.usage.input) || 0;
      const output = Number(msg.usage.output) || 0;
      inputTotal += input;
      outputTotal += output;
      if (msg.usage.estimated) estimated = true;
      const ctx = Number(msg.contextInput) || input;
      if (ctx > 0 || input > 0) {
        lastInput = ctx || input;
        lastOutput = output;
        lastMode = (msg.saverInfo && msg.saverInfo.mode) || msg.tokenSaver || lastMode;
        if (msg.saverInfo) lastSaver = msg.saverInfo;
      }
    }
    const mode = normalizeTokenSaver(lastMode || state.settings.tokenSaver || 'max');
    const spent = inputTotal + outputTotal;
    const contextLimit = resolveContextLimit();
    const contextUsed = lastInput + lastOutput;
    const left = Math.max(0, contextLimit - contextUsed);
    const mark = (value) => `${estimated ? '~' : ''}${fmtTokens(value)}`;
    const usedChanged = setTokenText(el.tokenUsed, spent > 0 ? mark(spent) : '0');
    const leftChanged = setTokenText(el.tokenLeft, lastInput > 0 ? mark(left) : '—');
    if (usedChanged || leftChanged) pulseTokenPill();
    if (el.tokenPill) {
      const detail =
        spent > 0
          ? `Entrada ${inputTotal.toLocaleString('pt-BR')} + saída ${outputTotal.toLocaleString('pt-BR')} = ` +
            `${spent.toLocaleString('pt-BR')} tokens${estimated ? ' (estimado)' : ''}.`
          : 'Nenhum token medido nesta conversa ainda.';
      const ctx =
        lastInput > 0
          ? ` Última chamada: ${lastInput.toLocaleString('pt-BR')} entrada + ${lastOutput.toLocaleString('pt-BR')} saída (janela modelo ~${contextLimit.toLocaleString('pt-BR')}, restam ~${left.toLocaleString('pt-BR')}).`
          : '';
      const saverBits = [];
      saverBits.push(`Economia: ${mode.toUpperCase()}`);
      if (lastSaver) {
        if (lastSaver.maxOut) saverBits.push(`máx saída ${lastSaver.maxOut}`);
        if (lastSaver.system) saverBits.push(`prompt ${lastSaver.system}`);
        if (lastSaver.systemChars) saverBits.push(`prompt ${lastSaver.systemChars} chars`);
        if (lastSaver.historyCharsSent != null) saverBits.push(`histórico enviado ${lastSaver.historyCharsSent} chars/${lastSaver.sentMsgs} msgs (de ${lastSaver.rawMsgs})`);
      } else if (state.lastSaverInfo) {
        if (state.lastSaverInfo.maxOut) saverBits.push(`máx saída ${state.lastSaverInfo.maxOut}`);
      }
      el.tokenPill.title = `${detail}${ctx} [${saverBits.join(' · ')}] — compare "entrada" e "saída" entre OFF e MÁX no meta de cada resposta.`;
    }
  }

  function syncEmpty() {
    el.empty.hidden = el.thread.childElementCount > 0;
  }

  function scrollBottom(force = false) {
    if (!force && !state.autoScroll) return;
    requestAnimationFrame(() => {
      el.threadScroll.scrollTop = el.threadScroll.scrollHeight;
    });
  }

  function updateEmptyHint() {
    if (!el.emptyHint) return;
    const usable = state.connections.filter((connection) => (connection.models || []).length);
    if (!usable.length) {
      if (state.connections.length) {
        el.emptyHint.innerHTML =
          'Conexões configuradas, mas nenhum modelo respondeu. <button type="button" data-connect>Revisar conexões</button>';
      } else {
        el.emptyHint.innerHTML =
          'Nenhuma IA conectada. <button type="button" data-connect>Conectar uma API key</button>';
      }
      return;
    }
    const total = usable.reduce((sum, connection) => sum + connection.models.length, 0);
    el.emptyHint.textContent = `${usable.length} conexão${usable.length === 1 ? '' : 'ões'} · ${total} modelo${
      total === 1 ? '' : 's'
    } · ferramentas prontas`;
  }

  function updateGreeting() {
    const hour = new Date().getHours();
    const base = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
    const name = String(state.settings.operatorName || '').trim();
    if (!el.greeting) return;
    el.greeting.textContent = name ? `${base}, ${name}.` : `${base}.`;
  }

  /* ============================================================
     Markdown
     ============================================================ */

  function sanitizeUrl(value) {
    const url = String(value || '').trim();
    if (/^(https?:\/\/|mailto:|\/|#)/i.test(url)) return url;
    return '';
  }

  function inlineFormat(raw) {
    const tokens = [];
    const stash = (html) => {
      tokens.push(html);
      return `\u0000${tokens.length - 1}\u0000`;
    };

    let value = String(raw ?? '');
    value = value.replace(/`([^`\n]+)`/g, (match, code) =>
      stash(`<code class="inline-code">${escapeHtml(code)}</code>`),
    );
    value = value.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (match, label, url) => {
      const safe = sanitizeUrl(url);
      if (!safe) return match;
      return stash(
        `<a href="${escapeHtml(safe)}" target="_blank" rel="noreferrer noopener">${escapeHtml(label)}</a>`,
      );
    });

    value = escapeHtml(value);
    value = value.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
    value = value.replace(/~~([^~\n]+)~~/g, '<del>$1</del>');
    value = value.replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s.,!?;:)]|$)/g, (match, pre, body) => `${pre}<em>${body}</em>`);

    value = value.replace(/(^|[\s(])(https?:\/\/[^\s<]+)/g, (match, pre, rawUrl) => {
      let url = rawUrl;
      let trailing = '';
      const punctuation = url.match(/[.,;:!?]+$/);
      if (punctuation) {
        trailing = punctuation[0];
        url = url.slice(0, -trailing.length);
      }
      return `${pre}<a href="${url}" target="_blank" rel="noreferrer noopener">${url}</a>${trailing}`;
    });

    value = value.replace(/\u0000(\d+)\u0000/g, (match, index) => tokens[Number(index)] ?? '');
    return value.replace(/\n/g, '<br>');
  }

  function codeBlockHtml(code, language) {
    const lang =
      String(language || 'text')
        .split(/\s+/)[0]
        .replace(/[^a-zA-Z0-9+#.-]/g, '')
        .slice(0, 18) || 'text';
    return (
      `<div class="code-block">` +
      `<div class="code-head"><span class="code-lang">${escapeHtml(lang)}</span>` +
      `<button type="button" class="copy-btn" data-copy>${icon('copy', '')}<span>copiar</span></button></div>` +
      `<pre><code>${escapeHtml(String(code).replace(/\n$/, ''))}</code></pre>` +
      `</div>`
    );
  }

  function isTableSeparator(line) {
    if (!line || !line.includes('|')) return false;
    const cells = line
      .trim()
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|');
    return cells.length > 0 && cells.every((cell) => /^\s*:?-{2,}:?\s*$/.test(cell));
  }

  function isBlockStart(line, next) {
    return (
      /^\s{0,3}(```|~~~)/.test(line) ||
      /^\s{0,3}#{1,6}\s+/.test(line) ||
      /^\s{0,3}(-{3,}|\*{3,}|_{3,})\s*$/.test(line) ||
      /^\s{0,3}>/.test(line) ||
      /^\s{0,3}([-*+]|\d+[.)])\s+/.test(line) ||
      (line.includes('|') && isTableSeparator(next || ''))
    );
  }

  function splitTableRow(line) {
    return line
      .trim()
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((cell) => inlineFormat(cell.trim()));
  }

  function renderMarkdown(source) {
    const text = String(source || '').replace(/\r\n?/g, '\n');
    if (!text.trim()) return '';

    const lines = text.split('\n');
    const out = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      if (!line.trim()) {
        i += 1;
        continue;
      }

      const fence = /^\s{0,3}(```+|~~~+)\s*([^\s`]*)/.exec(line);
      if (fence) {
        const code = [];
        i += 1;
        while (i < lines.length && !/^\s{0,3}(```+|~~~+)\s*$/.test(lines[i])) {
          code.push(lines[i]);
          i += 1;
        }
        if (i < lines.length) i += 1;
        out.push(codeBlockHtml(code.join('\n'), fence[2]));
        continue;
      }

      const heading = /^\s{0,3}(#{1,6})\s+(.*)$/.exec(line);
      if (heading) {
        const level = heading[1].length;
        out.push(`<h${level}>${inlineFormat(heading[2].trim())}</h${level}>`);
        i += 1;
        continue;
      }

      if (/^\s{0,3}(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
        out.push('<hr>');
        i += 1;
        continue;
      }

      if (/^\s{0,3}>/.test(line)) {
        const quote = [];
        while (i < lines.length && /^\s{0,3}>/.test(lines[i])) {
          quote.push(lines[i].replace(/^\s{0,3}>\s?/, ''));
          i += 1;
        }
        out.push(`<blockquote>${renderMarkdown(quote.join('\n'))}</blockquote>`);
        continue;
      }

      if (/^\s{0,3}[-*+]\s+/.test(line)) {
        const items = [];
        while (i < lines.length && /^\s{0,3}[-*+]\s+/.test(lines[i])) {
          items.push(`<li>${inlineFormat(lines[i].replace(/^\s{0,3}[-*+]\s+/, ''))}</li>`);
          i += 1;
        }
        out.push(`<ul>${items.join('')}</ul>`);
        continue;
      }

      if (/^\s{0,3}\d+[.)]\s+/.test(line)) {
        const items = [];
        while (i < lines.length && /^\s{0,3}\d+[.)]\s+/.test(lines[i])) {
          items.push(`<li>${inlineFormat(lines[i].replace(/^\s{0,3}\d+[.)]\s+/, ''))}</li>`);
          i += 1;
        }
        out.push(`<ol>${items.join('')}</ol>`);
        continue;
      }

      if (line.includes('|') && isTableSeparator(lines[i + 1])) {
        const head = splitTableRow(line);
        i += 2;
        const rows = [];
        while (i < lines.length && lines[i].includes('|') && lines[i].trim()) {
          rows.push(splitTableRow(lines[i]));
          i += 1;
        }
        const headHtml = head.map((cell) => `<th>${cell}</th>`).join('');
        const bodyHtml = rows
          .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`)
          .join('');
        out.push(`<table><thead><tr>${headHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>`);
        continue;
      }

      const paragraph = [];
      while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i], lines[i + 1])) {
        paragraph.push(lines[i]);
        i += 1;
      }
      if (!paragraph.length) {
        paragraph.push(line);
        i += 1;
      }
      out.push(`<p>${inlineFormat(paragraph.join('\n'))}</p>`);
    }

    return out.join('\n');
  }

  /* ============================================================
     Rendering
     ============================================================ */

  function toolIcon(name) {
    return (
      {
        run_command: 'terminal',
        read_file: 'file',
        write_file: 'file',
        list_dir: 'folder',
        search_files: 'search',
        system_info: 'cpu',
        screenshot: 'image',
        input_control: 'mouse',
        clipboard: 'clipboard',
        open_path: 'external',
      }[name] || 'terminal'
    );
  }

  function toolSummary(name, args) {
    const value = args || {};
    if (name === 'run_command') return String(value.command || '');
    if (name === 'read_file' || name === 'write_file' || name === 'list_dir' || name === 'open_path') {
      return String(value.path || '');
    }
    if (name === 'search_files') return [value.query, value.glob].filter(Boolean).join('  ·  ') || 'busca';
    if (name === 'input_control') {
      return [value.action, value.text ? `"${String(value.text).slice(0, 48)}"` : '', value.x != null ? `${value.x},${value.y}` : '']
        .filter(Boolean)
        .join(' ');
    }
    if (name === 'clipboard') return String(value.action || '');
    if (name === 'screenshot') return String(value.note || 'captura de tela');
    if (name === 'system_info') return 'hardware e processos';
    return '';
  }

  function createThinkingEl(text, collapsed) {
    const node = document.createElement('div');
    node.className = `thinking${collapsed ? ' collapsed' : ''}`;
    node.innerHTML = `<button type="button" class="thinking-head">${icon('chevron', '')}<span>raciocínio</span></button><div class="thinking-body"></div>`;
    node.querySelector('.thinking-body').textContent = String(text || '');
    return node;
  }

  function createToolCard(call) {
    const card = document.createElement('div');
    card.className = 'tool-card running';
    card.dataset.toolId = call.id;
    card.innerHTML =
      `<button type="button" class="tool-head">` +
      `<span class="tool-ico">${icon(toolIcon(call.name), '')}</span>` +
      `<span class="tool-name">${escapeHtml(call.name)}</span>` +
      `<span class="tool-summary"></span>` +
      `<span class="tool-status"><span class="tdot"></span><span class="tool-state">rodando</span></span>` +
      `<svg class="tool-chev" aria-hidden="true"><use href="#i-chevron"/></svg>` +
      `</button>` +
      `<div class="tool-body"><pre class="tool-pre"></pre></div>`;
    card.querySelector('.tool-summary').textContent = toolSummary(call.name, call.args);
    card.querySelector('.tool-pre').textContent = 'executando…';
    return card;
  }

  function applyToolResult(card, result) {
    if (!card) return;
    card.classList.remove('running');
    card.classList.add(result.denied ? 'denied' : result.ok ? 'ok' : 'error');
    const pre = card.querySelector('.tool-pre');
    if (pre) pre.textContent = String(result.output || '(sem saída)');
    const stateEl = card.querySelector('.tool-state');
    if (stateEl) {
      const label = result.denied ? 'negado' : result.ok ? 'ok' : 'erro';
      stateEl.textContent = `${label}${result.duration ? ` · ${formatDuration(result.duration)}` : ''}`;
    }
    const approval = card.querySelector('.approval');
    if (approval) approval.remove();

    const meta = result.meta || {};
    if (meta.image && String(meta.image).startsWith('/shots/') && !card.querySelector('.tool-shot')) {
      const image = document.createElement('img');
      image.className = 'tool-shot';
      image.src = meta.image;
      image.alt = 'Screenshot capturada';
      card.querySelector('.tool-body').append(image);
    }
    const hasImage = Boolean(card.querySelector('.tool-shot'));
    card.classList.toggle('open', !result.ok || hasImage);
  }

  function appendError(container, message, retry) {
    const box = document.createElement('div');
    box.className = 'msg-error';
    box.innerHTML = `${icon('alert', '')}<span class="err-text"></span>`;
    box.querySelector('.err-text').textContent = String(message);
    if (retry) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'btn-sm';
      button.dataset.retry = '1';
      button.textContent = 'Tentar de novo';
      box.append(button);
    }
    container.append(box);
    return box;
  }

  function saverLabel(mode) {
    return { off: 'Eco:desligada', low: 'Eco:baixa', medium: 'Eco:média', max: 'Eco:máx' }[mode] || (mode ? `Eco:${mode}` : '');
  }

  function updateMeta(ctx) {
    if (!ctx || !ctx.metaEl) return;
    const bits = [];
    if (ctx.msg.model) bits.push(ctx.msg.model);
    const mode = (ctx.msg.saverInfo && ctx.msg.saverInfo.mode) || ctx.msg.tokenSaver || '';
    if (mode) {
      const cap = (ctx.msg.saverInfo && ctx.msg.saverInfo.maxOut) || ctx.msg.maxOutputTokens;
      bits.push(cap && mode !== 'off' ? `${saverLabel(mode)}·máx ${cap} saída` : saverLabel(mode));
    }
    if (ctx.msg.usage) {
      const usage = ctx.msg.usage;
      const mark = usage.estimated ? '~' : '';
      const output = Number(usage.output) || 0;
      const input = Number(usage.input) || 0;
      if (input) bits.push(`${mark}${input} tok entrada`);
      if (output) bits.push(`${mark}${output} tok saída`);
      if (input || output) bits.push(`total ${mark}${input + output}`);
    }
    if (ctx.msg.aborted) bits.push('interrompido');
    ctx.metaEl.textContent = bits.join('  ·  ');
  }

  function appendUserMessage(message, doScroll = true) {
    const wrapper = document.createElement('div');
    wrapper.className = 'msg user';
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = String(message.content || '');
    wrapper.append(bubble);
    const attachments = Array.isArray(message.attachments) ? message.attachments : [];
    if (attachments.length) {
      const attachWrap = document.createElement('div');
      attachWrap.className = 'msg-attachments';
      for (const a of attachments) {
        if (String(a.mime || '').startsWith('image/')) {
          const img = document.createElement('img');
          img.className = 'chat-attachment-img';
          img.src = String(a.url || a.path || '');
          img.alt = String(a.name || 'imagem');
          img.loading = 'lazy';
          attachWrap.append(img);
        } else {
          const link = document.createElement('a');
          link.className = 'chat-attachment';
          link.href = String(a.url || a.path || '#');
          link.target = '_blank';
          link.rel = 'noopener';
          link.innerHTML = `<svg class="ico" style="width:12px;height:12px"><use href="#i-file"/></svg> ${escapeHtml(a.name || 'arquivo')}`;
          attachWrap.append(link);
        }
      }
      wrapper.append(attachWrap);
    }
    el.thread.append(wrapper);
    syncEmpty();
    if (doScroll) scrollBottom(true);
    return wrapper;
  }

  function appendAssistantMessage(message) {
    const wrapper = document.createElement('div');
    wrapper.className = 'msg assistant';

    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar';
    avatar.innerHTML = icon('knight', '');

    const body = document.createElement('div');
    body.className = 'msg-body';

    const md = document.createElement('div');
    md.className = 'md';
    md.innerHTML = renderMarkdown(message.content || '');

    const tools = document.createElement('div');
    tools.className = 'tool-stack';
    body.append(md, tools);

    let thinkingEl = null;
    if (message.thinking) {
      thinkingEl = createThinkingEl(message.thinking, true);
      body.insertBefore(thinkingEl, md);
    }

    for (const call of message.toolCalls || []) {
      const card = createToolCard(call);
      tools.append(card);
      const result = (message.toolResults || []).find((entry) => entry.id === call.id);
      if (result) applyToolResult(card, result);
    }

    if (message.error) appendError(body, message.error, true);

    const meta = document.createElement('div');
    meta.className = 'msg-meta';
    body.append(meta);

    wrapper.append(avatar, body);
    el.thread.append(wrapper);

    const ctx = {
      el: wrapper,
      bodyEl: body,
      mdEl: md,
      toolStackEl: tools,
      metaEl: meta,
      thinkingEl,
      liveEl: null,
      toolEls: new Map(),
      msg: message,
    };
    Array.from(tools.children).forEach((card) => {
      if (card.dataset.toolId) ctx.toolEls.set(card.dataset.toolId, card);
    });
    updateMeta(ctx);
    return ctx;
  }

  function renderThread(chat) {
    el.thread.innerHTML = '';
    if (!chat) {
      syncEmpty();
      updateTokenStats();
      return;
    }
    for (const message of chat.messages) {
      if (message.role === 'user') appendUserMessage(message, false);
      else if (message.role === 'assistant') appendAssistantMessage(message);
    }
    syncEmpty();
    requestAnimationFrame(() => {
      el.threadScroll.scrollTop = el.threadScroll.scrollHeight;
    });
    updateTokenStats();
  }

  /* ============================================================
     Chats
     ============================================================ */

  function makeTitle(text) {
    const clean = String(text || '')
      .replace(/\s+/g, ' ')
      .trim();
    return clean.length > 54 ? `${clean.slice(0, 54).trim()}…` : clean || 'Nova conversa';
  }

  /* ============================================================
     Memória entre chats
     ============================================================ */

  const RECALL_BUDGET = 120000;
  const RECALL_STOPWORDS = new Set([
    'a', 'o', 'as', 'os', 'um', 'uma', 'de', 'do', 'da', 'dos', 'das', 'no', 'na', 'nos', 'nas',
    'em', 'com', 'para', 'pra', 'por', 'sobre', 'que', 'se', 'eu', 'meu', 'minha', 'nosso', 'nossa',
    'fiz', 'feito', 'feita', 'chamado', 'chamada', 'salvo', 'salva', 'anterior', 'antigo', 'antiga',
    'conversa', 'chat', 'historico', 'lembre', 'lembra', 'lembrar', 'memorize', 'memoriza', 'recorde',
    'recupere', 'puxe', 'carregue', 'resgate', 'e', 'ai', 'la',
  ]);

  function normalizeChatMemory(memory) {
    if (!memory || typeof memory !== 'object') return null;
    const transcript = String(memory.transcript || '');
    if (!transcript.trim()) return null;
    return {
      sourceId: String(memory.sourceId || ''),
      title: String(memory.title || 'Chat anterior'),
      recalledAt: Number(memory.recalledAt) || Date.now(),
      transcript,
    };
  }

  function normalizeRecallText(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function recallTokens(value) {
    return normalizeRecallText(value)
      .split(' ')
      .filter((token) => token.length > 1 && !RECALL_STOPWORDS.has(token));
  }

  function detectRecallRequest(text) {
    const norm = normalizeRecallText(text);
    if (!norm) return null;
    const verb = /\b(lembre|lembra|lembrar|lembrem|memorize|memoriza|memorizar|recorde|recorda|recupere|recupera|puxe|puxa|carregue|carrega|resgate|resgata)\b/.exec(norm);
    if (!verb) return null;
    const tail = norm.slice(verb.index);
    const marker = /\b(chat|conversa|conversacao|historico)\b/.exec(tail);
    if (!marker) return null;
    let query = tail.slice(marker.index + marker[0].length).trim();
    query = query.replace(/^(?:(?:do|da|de|dos|das|sobre|chamado|chamada|com|que|o|a|os|as)\s+)+/, '').trim();
    return { query };
  }

  function scoreChatTitle(title, tTokens, variant) {
    if (!variant) return 10;
    const qTokens = recallTokens(variant);
    if (title === variant) return 120;
    if (title.startsWith(variant)) return 100;
    if (title.includes(variant)) return 90;
    if (variant.includes(title) && title.length >= 3) return 80;
    if (!qTokens.length || !tTokens.length) return 0;
    let hits = 0;
    for (const token of qTokens) {
      if (tTokens.includes(token)) hits += 1;
      else if (tTokens.some((entry) => entry.startsWith(token) || token.startsWith(entry))) hits += 0.6;
    }
    return (hits / qTokens.length) * 70;
  }

  function findRecallChat(query) {
    const candidates = state.chats.filter(
      (chat) => chat.id !== state.activeChatId && Array.isArray(chat.messages) && chat.messages.length,
    );
    if (!candidates.length) return null;
    const normQuery = normalizeRecallText(query);
    const words = normQuery.split(' ').filter(Boolean);
    const variants = [];
    for (let size = Math.min(words.length, 14); size >= 1; size -= 1) {
      variants.push(words.slice(0, size).join(' '));
    }
    if (!variants.length) variants.push('');
    const ranked = candidates
      .map((chat) => {
        const title = normalizeRecallText(chat.title);
        const tTokens = recallTokens(chat.title);
        let score = 0;
        for (const variant of variants) {
          score = Math.max(score, scoreChatTitle(title, tTokens, variant));
        }
        return { chat, score };
      })
      .sort((a, b) => b.score - a.score || b.chat.updatedAt - a.chat.updatedAt);
    const best = ranked[0];
    if (!best) return null;
    if (!normQuery) return best.chat;
    return best.score >= 28 ? best.chat : null;
  }

  function buildRecallTranscript(chat) {
    const render = (message, toolLimit) => {
      if (message.role === 'user') {
        const text = String(message.content || '').trim();
        return text ? `OPERADOR: ${text}` : '';
      }
      const parts = [];
      const text = String(message.content || '').trim();
      if (text) parts.push(`TROJAN: ${text}`);
      for (const call of message.toolCalls || []) {
        let args = '';
        try { args = JSON.stringify(call.args || {}); } catch { args = ''; }
        if (args.length > 500) args = `${args.slice(0, 500)}…`;
        parts.push(`  [ferramenta ${call.name || 'tool'}] ${args}`);
      }
      for (const result of message.toolResults || []) {
        const output = String(result.output || '').replace(/\n{3,}/g, '\n\n').trim();
        if (!output) continue;
        const clipped = output.length > toolLimit ? `${output.slice(0, toolLimit)}…` : output;
        parts.push(`  [resultado ${result.name || 'tool'}${result.ok === false ? ' ERRO' : ''}] ${clipped}`);
      }
      return parts.join('\n');
    };
    const sourceMessages = chat.messages.filter(
      (message) => !message.pending && (message.role === 'user' || message.role === 'assistant'),
    );
    const header = [
      `[CHAT SALVO: "${chat.title}"]`,
      `Criado: ${new Date(chat.createdAt).toLocaleString('pt-BR')} | Última mensagem: ${new Date(chat.updatedAt).toLocaleString('pt-BR')} | ${sourceMessages.length} mensagens`,
      '',
    ].join('\n');
    let body = sourceMessages.map((message) => render(message, 2000)).filter(Boolean).join('\n\n');
    if (header.length + body.length > RECALL_BUDGET) {
      body = sourceMessages.map((message) => render(message, 300)).filter(Boolean).join('\n\n');
    }
    let transcript = `${header}${body}`;
    if (transcript.length > RECALL_BUDGET) {
      transcript = `[CHAT SALVO: "${chat.title}"]\n[início do chat antigo omitido para caber na memória]\n\n${transcript.slice(transcript.length - RECALL_BUDGET)}`;
    }
    return transcript;
  }

  function renderMemoryPill() {
    if (!el.memoryPill) return;
    const chat = activeChat();
    const memory = chat && chat.memory;
    if (!memory || !memory.transcript) {
      el.memoryPill.hidden = true;
      el.memoryPill.removeAttribute('title');
      if (el.memoryPillText) el.memoryPillText.textContent = '';
      return;
    }
    el.memoryPill.hidden = false;
    el.memoryPill.title = `Memória carregada de "${memory.title}" em ${new Date(memory.recalledAt).toLocaleString('pt-BR')}. Clique para esquecer.`;
    if (el.memoryPillText) el.memoryPillText.textContent = memory.title;
  }

  function recallChatByName(query) {
    const source = findRecallChat(query);
    if (!source) {
      const names = state.chats
        .filter((chat) => chat.id !== state.activeChatId && chat.messages && chat.messages.length)
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, 8)
        .map((chat) => `"${chat.title}"`)
        .join(', ');
      toast(names ? `Não achei esse chat. Salvos: ${names}` : 'Nenhum outro chat salvo para lembrar.', 'error');
      return null;
    }
    return source;
  }

  function chatGroup(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const diff = Math.round((startToday - startDate) / 86400000);
    if (diff <= 0) return 'Hoje';
    if (diff === 1) return 'Ontem';
    if (diff < 7) return 'Últimos 7 dias';
    return 'Anteriores';
  }

  function loadFolders() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORE_FOLDERS) || '[]');
      if (!Array.isArray(raw)) return [];
      return raw.filter((f) => f && f.id).map((f) => ({
        id: String(f.id),
        name: String(f.name || 'Pasta'),
        chatIds: Array.isArray(f.chatIds) ? f.chatIds.map(String) : [],
        createdAt: Number(f.createdAt) || Date.now(),
        collapsed: !!f.collapsed,
      }));
    } catch { return []; }
  }

  function saveFolders() {
    try {
      localStorage.setItem(STORE_FOLDERS, JSON.stringify(state.folders));
    } catch { /* ignore */ }
  }

  function folderForChat(chatId) {
    return state.folders.find((f) => (f.chatIds || []).includes(chatId)) || null;
  }

  function renderChatList() {
    const chats = [...state.chats].sort((a, b) => b.updatedAt - a.updatedAt);
    el.chatList.innerHTML = '';
    if (el.allChatsCount) el.allChatsCount.textContent = String(state.chats.length);
    if (!chats.length && !state.folders.length) {
      const empty = document.createElement('div');
      empty.className = 'chat-empty';
      empty.textContent = 'Nenhuma conversa ainda. Pergunte algo para começar.';
      el.chatList.append(empty);
      return;
    }

    for (const folder of state.folders) {
      el.chatList.append(buildFolderRow(folder));
    }

    const rootChats = chats.filter((chat) => !folderForChat(chat.id));
    if (rootChats.length) {
      let currentGroup = '';
      for (const chat of rootChats) {
        const group = chatGroup(chat.updatedAt);
        if (group !== currentGroup) {
          currentGroup = group;
          el.chatList.append(sectionLabel(group));
        }
        el.chatList.append(buildChatItem(chat));
      }
    } else if (state.folders.length) {
      const hint = document.createElement('div');
      hint.className = 'chat-folder-hint';
      hint.textContent = 'Tudo organizado nas pastas.';
      el.chatList.append(hint);
    }
    bindFolderDrops();
  }

  function sectionLabel(text) {
    const label = document.createElement('div');
    label.className = 'chat-section';
    label.textContent = text;
    return label;
  }

  function buildFolderRow(folder) {
    const row = document.createElement('div');
    row.className = 'chat-folder';
    row.dataset.folderId = folder.id;
    row.title = `Abrir pasta "${folder.name}"`;

    const main = document.createElement('button');
    main.type = 'button';
    main.className = 'chat-folder-main';
    main.innerHTML = `${icon('folder', 'chat-folder-icon')}<span class="chat-folder-name"></span><span class="chat-folder-count"></span>`;
    $('.chat-folder-name', main).textContent = folder.name;
    $('.chat-folder-count', main).textContent = String((folder.chatIds || []).length);
    main.addEventListener('click', () => openChatsModal(folder.id));

    const rename = document.createElement('button');
    rename.type = 'button';
    rename.className = 'chat-folder-act';
    rename.title = 'Renomear pasta';
    rename.innerHTML = icon('pencil', '');
    rename.addEventListener('click', (event) => {
      event.stopPropagation();
      openFolderModal(folder);
    });

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'chat-folder-act danger';
    remove.title = 'Remover pasta';
    remove.innerHTML = icon('trash', '');
    remove.addEventListener('click', (event) => {
      event.stopPropagation();
      removeFolder(folder);
    });

    row.append(main, rename, remove);
    return row;
  }

  function buildChatItem(chat) {
    const item = document.createElement('div');
    item.className = `chat-item${chat.id === state.activeChatId ? ' active' : ''}`;
    item.dataset.chatId = chat.id;
    item.draggable = true;

    const main = document.createElement('button');
    main.type = 'button';
    main.className = 'chat-main';
    const title = document.createElement('span');
    title.className = 'chat-title';
    title.textContent = chat.title;
    main.append(title);
    main.addEventListener('click', () => switchChat(chat.id));

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'chat-del';
    remove.title = 'Apagar conversa';
    remove.innerHTML = icon('trash', '');
    remove.addEventListener('click', (event) => {
      event.stopPropagation();
      deleteChat(chat.id);
    });

    item.append(main, remove);

    // Arrastar para uma pasta
    item.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', chat.id);
      item.classList.add('dragging');
    });
    item.addEventListener('dragend', () => item.classList.remove('dragging'));

    return item;
  }

  /* Pastas ---------------------------------------------------------- */

  let folderEditingId = null;
  let chatsModalFolderId = null;

  function openFolderModal(folder = null) {
    folderEditingId = folder ? folder.id : null;
    el.folderModalTitle.textContent = folder ? 'Renomear pasta' : 'Nova pasta';
    el.folderSubmit.textContent = folder ? 'Salvar' : 'Criar pasta';
    el.folderNameInput.value = folder ? folder.name : '';
    el.folderModal.classList.add('open');
    el.folderModal.setAttribute('aria-hidden', 'false');
    setTimeout(() => {
      el.folderNameInput.focus();
      el.folderNameInput.select();
    }, 30);
  }

  function closeFolderModal() {
    el.folderModal.classList.remove('open');
    el.folderModal.setAttribute('aria-hidden', 'true');
    folderEditingId = null;
  }

  function submitFolderForm(event) {
    event.preventDefault();
    const name = el.folderNameInput.value.trim();
    if (!name) {
      el.folderNameInput.focus();
      return;
    }
    if (folderEditingId) {
      const folder = state.folders.find((entry) => entry.id === folderEditingId);
      if (folder) folder.name = name;
      toast('Pasta renomeada.');
    } else {
      state.folders.push({
        id: makeId('f'),
        name,
        chatIds: [],
        createdAt: Date.now(),
        collapsed: false,
      });
      toast(`Pasta "${name}" criada.`);
    }
    saveFolders();
    closeFolderModal();
    renderChatList();
    if (el.chatsModal.classList.contains('open')) renderChatsModal();
  }

  function removeFolder(folder) {
    if (!confirm(`Remover a pasta "${folder.name}"? As conversas continuam salvas.`)) return;
    state.folders = state.folders.filter((entry) => entry.id !== folder.id);
    saveFolders();
    if (chatsModalFolderId === folder.id) closeChatsModal();
    renderChatList();
    if (el.chatsModal.classList.contains('open')) renderChatsModal();
    toast('Pasta removida. As conversas voltaram para a lista.');
  }

  function moveChatToFolder(chatId, folderId) {
    for (const folder of state.folders) {
      folder.chatIds = (folder.chatIds || []).filter((id) => id !== chatId);
    }
    if (folderId) {
      const folder = state.folders.find((entry) => entry.id === folderId);
      if (folder && !folder.chatIds.includes(chatId)) folder.chatIds.push(chatId);
    }
    saveFolders();
    renderChatList();
  }

  /* Modal de conversas ---------------------------------------------- */

  function openChatsModal(folderId = null) {
    chatsModalFolderId = folderId;
    const folder = folderId ? state.folders.find((entry) => entry.id === folderId) : null;
    el.chatsModalTitle.textContent = folder ? folder.name : 'Todas as conversas';
    el.chatsSearch.value = '';
    el.chatsModal.classList.add('open');
    el.chatsModal.setAttribute('aria-hidden', 'false');
    renderChatsModal();
    setTimeout(() => el.chatsSearch.focus(), 30);
  }

  function closeChatsModal() {
    el.chatsModal.classList.remove('open');
    el.chatsModal.setAttribute('aria-hidden', 'true');
    chatsModalFolderId = null;
  }

  function chatSearchText(chat) {
    const parts = [chat.title || ''];
    for (const message of (chat.messages || []).slice(-8)) {
      if (typeof message.content === 'string') parts.push(message.content);
    }
    return parts.join(' ').toLowerCase();
  }

  function chatDateLabel(timestamp) {
    const date = new Date(timestamp || Date.now());
    const now = new Date();
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const diff = Math.round((startToday - startDate) / 86400000);
    if (diff <= 0) return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    if (diff === 1) return 'Ontem';
    if (diff < 7) return `há ${diff} dias`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  }

  function renderChatsModal() {
    if (!el.chatsModalList) return;
    const query = (el.chatsSearch.value || '').trim().toLowerCase();
    const folder = chatsModalFolderId
      ? state.folders.find((entry) => entry.id === chatsModalFolderId)
      : null;
    let chats = [...state.chats].sort((a, b) => b.updatedAt - a.updatedAt);
    if (folder) chats = chats.filter((chat) => (folder.chatIds || []).includes(chat.id));
    if (query) chats = chats.filter((chat) => chatSearchText(chat).includes(query));

    el.chatsModalList.innerHTML = '';
    el.chatsCount.textContent = chats.length === 1 ? '1 conversa' : `${chats.length} conversas`;

    if (!chats.length) {
      const empty = document.createElement('div');
      empty.className = 'chats-empty';
      empty.textContent = query
        ? 'Nada encontrado para essa busca.'
        : folder
          ? 'Pasta vazia. Arraste conversas para ela na barra lateral.'
          : 'Nenhuma conversa ainda.';
      el.chatsModalList.append(empty);
      return;
    }

    for (const chat of chats) el.chatsModalList.append(buildChatsModalRow(chat));
  }

  function buildChatsModalRow(chat) {
    const row = document.createElement('div');
    row.className = `chats-row${chat.id === state.activeChatId ? ' active' : ''}`;

    const open = document.createElement('button');
    open.type = 'button';
    open.className = 'chats-open';
    const title = document.createElement('span');
    title.className = 'chats-title';
    title.textContent = chat.title || 'Conversa sem título';
    const meta = document.createElement('span');
    meta.className = 'chats-meta';
    const folder = folderForChat(chat.id);
    const pieces = [chatDateLabel(chat.updatedAt), folder ? folder.name : 'Sem pasta'];
    pieces.push(`${(chat.messages || []).length} ${(chat.messages || []).length === 1 ? 'mensagem' : 'mensagens'}`);
    meta.textContent = pieces.join('  ·  ');
    open.append(title, meta);
    open.addEventListener('click', () => {
      switchChat(chat.id);
      closeChatsModal();
    });

    const move = document.createElement('select');
    move.className = 'chats-move';
    move.title = 'Mover para pasta';
    const none = document.createElement('option');
    none.value = '';
    none.textContent = 'Sem pasta';
    move.append(none);
    for (const entry of state.folders) {
      const option = document.createElement('option');
      option.value = entry.id;
      option.textContent = entry.name;
      move.append(option);
    }
    move.value = folder ? folder.id : '';
    move.addEventListener('click', (event) => event.stopPropagation());
    move.addEventListener('change', () => {
      moveChatToFolder(chat.id, move.value || null);
      renderChatsModal();
    });

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'chats-del';
    remove.title = 'Apagar conversa';
    remove.innerHTML = icon('trash', '');
    remove.addEventListener('click', (event) => {
      event.stopPropagation();
      deleteChat(chat.id);
      renderChatsModal();
    });

    row.append(open, move, remove);
    return row;
  }

  // Pastas aceitam conversas arrastadas
  function bindFolderDrops() {
    el.chatList.querySelectorAll('.chat-folder').forEach((folderEl) => {
      folderEl.addEventListener('dragover', (e) => {
        e.preventDefault();
        folderEl.classList.add('drag-over');
      });
      folderEl.addEventListener('dragleave', () => folderEl.classList.remove('drag-over'));
      folderEl.addEventListener('drop', (e) => {
        e.preventDefault();
        folderEl.classList.remove('drag-over');
        const chatId = e.dataTransfer.getData('text/plain');
        if (!chatId) return;
        const folder = state.folders.find((entry) => entry.id === folderEl.dataset.folderId);
        if (!folder) return;
        moveChatToFolder(chatId, folder.id);
        if (el.chatsModal.classList.contains('open')) renderChatsModal();
        toast(`Conversa movida para "${folder.name}".`);
      });
    });
  }

  function newChat() {
    if (state.streaming) stopTurn();
    state.activeChatId = null;
    saveUI();
    renderChatList();
    renderMemoryPill();
    el.thread.innerHTML = '';
    syncEmpty();
    updateTokenStats();
    updateGreeting();
    closeMobileSidebar();
    el.input.focus();
  }

  function switchChat(id) {
    if (id === state.activeChatId) {
      closeMobileSidebar();
      return;
    }
    if (state.streaming) stopTurn();
    const chat = state.chats.find((entry) => entry.id === id);
    if (!chat) return;
    state.activeChatId = id;
    saveUI();
    renderChatList();
    renderMemoryPill();
    renderThread(chat);
    closeMobileSidebar();
    el.input.focus();
  }

  function deleteChat(id) {
    const chat = state.chats.find((entry) => entry.id === id);
    if (!chat) return;
    if (chat.messages.length && !confirm(`Apagar a conversa "${chat.title}"?`)) return;
    if (state.activeChatId === id) {
      if (state.streaming) stopTurn();
      state.activeChatId = null;
    }
    state.chats = state.chats.filter((entry) => entry.id !== id);
    for (const folder of state.folders) {
      folder.chatIds = (folder.chatIds || []).filter((chatId) => chatId !== id);
    }
    saveFolders();
    saveChats();
    saveUI();
    renderChatList();
    renderMemoryPill();
    if (!state.activeChatId) {
      el.thread.innerHTML = '';
      syncEmpty();
      updateGreeting();
    }
  }

  function ensureChat() {
    let chat = activeChat();
    if (!chat) {
      chat = {
        id: makeId('c'),
        title: 'Nova conversa',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
      };
      state.chats.unshift(chat);
      state.activeChatId = chat.id;
      saveUI();
    }
    return chat;
  }

  /* ============================================================
     Streaming
     ============================================================ */

  function modelLabel() {
    const resolved = resolveModel(state.activeModel);
    if (resolved) return resolved.model.name;
    const parts = String(state.activeModel || '').split('/');
    return parts.length > 1 ? parts.slice(1).join('/') : 'modelo';
  }

  function buildPayload(messages) {
    return messages
      .filter(
        (message) =>
          message.role === 'user' ||
          (message.role === 'assistant' &&
            !message.pending &&
            (String(message.content || '').trim() || (message.toolCalls || []).length)),
      )
      .map((message) =>
        message.role === 'user'
          ? { role: 'user', content: String(message.sentContent || message.content || '') }
          : {
              role: 'assistant',
              content: String(message.content || ''),
              toolCalls: message.toolCalls || [],
              toolResults: message.toolResults || [],
            },
      );
  }

  function registerToolCall(message, call) {
    if (!Array.isArray(message.toolCalls)) message.toolCalls = [];
    const existing = message.toolCalls.find((entry) => entry.id === call.id);
    if (existing) return existing;
    message.toolCalls.push(call);
    return call;
  }

  function showLiveThinking(ctx) {
    if (!ctx || ctx.liveEl) return;
    const live = document.createElement('div');
    live.className = 'live-thinking';
    live.innerHTML = `${'<span class="thinking-dots"><i></i><i></i><i></i></span>'}<span class="shimmer">Trojan está pensando</span>`;
    ctx.bodyEl.insertBefore(live, ctx.thinkingEl || ctx.mdEl);
    ctx.liveEl = live;
  }

  function hideLiveThinking(ctx) {
    if (ctx && ctx.liveEl) {
      ctx.liveEl.remove();
      ctx.liveEl = null;
    }
  }

  function scheduleMarkdown(ctx) {
    if (state.mdRaf) return;
    state.mdRaf = requestAnimationFrame(() => {
      state.mdRaf = null;
      const current = state.current;
      if (!current || !current.mdEl) return;
      current.mdEl.innerHTML = renderMarkdown(current.msg.content || '');
      if (state.autoScroll) el.threadScroll.scrollTop = el.threadScroll.scrollHeight;
    });
  }

  function settleCurrentDom() {
    const ctx = state.current;
    if (!ctx) return;
    hideLiveThinking(ctx);
    ctx.el.classList.remove('streaming');
    if (ctx.mdEl) ctx.mdEl.classList.remove('streaming');
    if (ctx.thinkingEl) {
      if ((ctx.msg.thinking || '').length > 380) ctx.thinkingEl.classList.add('collapsed');
    }
    ctx.msg.pending = false;
    updateMeta(ctx);
  }

  function beginTurn(chat, payload, skills = [], attachments = []) {
    if (!state.wsReady) {
      toast('Servidor local offline. Reinicie o Trojan.', 'error');
      return;
    }

    const message = {
      role: 'assistant',
      content: '',
      thinking: '',
      toolCalls: [],
      toolResults: [],
      pending: true,
      model: modelLabel(),
      ts: Date.now(),
    };
    chat.messages.push(message);
    chat.updatedAt = Date.now();

    const ctx = appendAssistantMessage(message);
    ctx.el.classList.add('streaming');
    ctx.mdEl.classList.add('streaming');
    state.current = { ...ctx, chat };
    showLiveThinking(state.current);
    setStreaming(true);
    state.autoScroll = true;
    scrollBottom(true);

    const sent = wsSend({
      type: 'chat',
      model: state.activeModel,
      agent: state.activeAgent || '',
      chatId: chat.id,
      chatTitle: chat.title || '',
      messages: payload,
      skills: Array.isArray(skills) ? skills : [],
      attachments: Array.isArray(attachments) ? attachments : [],
      autoApprove: !!state.settings.autoApprove,
      recall: chat.memory && chat.memory.transcript ? chat.memory.transcript : '',
      recallTitle: chat.memory && chat.memory.title ? chat.memory.title : '',
    });

    if (!sent) {
      message.error = 'Conexão com o servidor caiu.';
      const box = appendError(ctx.bodyEl, message.error, true);
      ctx.bodyEl.insertBefore(box, ctx.metaEl);
      settleCurrentDom();
      state.current = null;
      setStreaming(false);
    }
  }

  function maybeAutoRun() {
    if (state.autoRunFired) return;
    if (!state.settings.autoRunEnabled) return;
    const text = String(state.settings.autoRunMessage || '').trim();
    if (!text) return;
    if (state.streaming || !state.wsReady || !state.activeModel) return;
    const chat = activeChat();
    if (chat && (chat.messages || []).some((message) => message.role === 'user')) return;
    state.autoRunFired = true;
    const target = chat || ensureChat();
    const userMessage = { role: 'user', content: text, ts: Date.now() };
    target.messages.push(userMessage);
    target.updatedAt = Date.now();
    if (target.messages.filter((message) => message.role === 'user').length === 1) {
      target.title = makeTitle(text);
    }
    appendUserMessage(userMessage);
    renderChatList();
    saveChats();
    saveUI();
    beginTurn(target, buildPayload(target.messages));
  }

  function submit() {
    if (state.streaming) return;
    const rawText = el.input.value.trim();
    if (!rawText) return;
    if (!state.activeModel) {
      openSettings('providers');
      toast('Conecte uma IA primeiro.', 'error');
      return;
    }
    if (!state.wsReady) {
      toast('Servidor local offline. Reinicie o Trojan.', 'error');
      return;
    }

    const picked = extractLeadingSkills(rawText);
    const text = picked.ids.length ? (picked.text || 'Use a skill selecionada agora.') : rawText;

    const recallRequest = detectRecallRequest(text);
    let recallSource = null;
    if (recallRequest) {
      recallSource = recallChatByName(recallRequest.query);
      if (!recallSource) return;
    }

    const chat = ensureChat();
    if (recallSource) {
      chat.memory = {
        sourceId: recallSource.id,
        title: recallSource.title,
        recalledAt: Date.now(),
        transcript: buildRecallTranscript(recallSource),
      };
      toast(`Memória carregada: ${recallSource.title}`);
      renderMemoryPill();
    }
    const userMessage = { role: 'user', content: rawText, sentContent: text, skills: picked.ids, attachments: state.attachments.slice(), ts: Date.now() };
    chat.messages.push(userMessage);
    chat.updatedAt = Date.now();
    if (chat.messages.filter((message) => message.role === 'user').length === 1) {
      chat.title = makeTitle(text);
    }

    el.input.value = '';
    autoResize();
    updateSendState();
    closeSkillMenu();
    appendUserMessage(userMessage);
    renderChatList();
    saveChats();
    saveUI();

    const payload = buildPayload(chat.messages);
    // Attach attachments of the last user message to the turn
    const lastUserMsg = chat.messages[chat.messages.length - 1];
    const turnAttachments = Array.isArray(lastUserMsg.attachments) ? lastUserMsg.attachments : [];
    clearAttachments();
    beginTurn(chat, payload, picked.ids, turnAttachments);
  }

  function retryTurn() {
    if (state.streaming) return;
    const chat = activeChat();
    if (!chat) return;
    let lastUser = -1;
    for (let index = chat.messages.length - 1; index >= 0; index -= 1) {
      if (chat.messages[index].role === 'user') {
        lastUser = index;
        break;
      }
    }
    if (lastUser < 0) return;
    chat.messages = chat.messages.slice(0, lastUser + 1);
    chat.updatedAt = Date.now();
    renderThread(chat);
    saveChats();
    renderChatList();
    beginTurn(chat, buildPayload(chat.messages), chat.messages[lastUser].skills || [], chat.messages[lastUser].attachments || []);
  }

  function stopTurn() {
    if (!state.streaming) return;
    wsSend({ type: 'abort' });
    if (state.current) {
      state.current.msg.aborted = true;
      state.current.msg.pending = false;
      settleCurrentDom();
      state.current = null;
    }
    setStreaming(false);
    saveChats();
    renderChatList();
  }

  function onStepStart(event) {
    if (!state.streaming) return;
    let ctx = state.current;

    if (!ctx) {
      const chat = activeChat();
      if (!chat) return;
      const message = {
        role: 'assistant',
        content: '',
        thinking: '',
        toolCalls: [],
        toolResults: [],
        pending: true,
        model: modelLabel(),
        ts: Date.now(),
      };
      chat.messages.push(message);
      const next = appendAssistantMessage(message);
      next.el.classList.add('streaming');
      next.mdEl.classList.add('streaming');
      state.current = { ...next, chat };
      showLiveThinking(state.current);
      ctx = state.current;
    }

    if (ctx.msg.pending) {
      ctx.msg.pending = false;
      ctx.step = event.step;
      return;
    }
    if (ctx.step === event.step) return;

    settleCurrentDom();
    const chat = ctx.chat;
    const message = {
      role: 'assistant',
      content: '',
      thinking: '',
      toolCalls: [],
      toolResults: [],
      pending: true,
      model: modelLabel(),
      ts: Date.now(),
    };
    chat.messages.push(message);
    const next = appendAssistantMessage(message);
    next.el.classList.add('streaming');
    next.mdEl.classList.add('streaming');
    state.current = { ...next, chat };
    state.current.step = event.step;
    showLiveThinking(state.current);
    scrollBottom(true);
  }

  function onDelta(event) {
    const ctx = state.current;
    if (!ctx) return;
    hideLiveThinking(ctx);
    ctx.msg.content += String(event.text || '');
    ctx.mdEl.classList.add('streaming');
    scheduleMarkdown(ctx);
  }

  function onThinking(event) {
    const ctx = state.current;
    if (!ctx) return;
    hideLiveThinking(ctx);
    ctx.msg.thinking += String(event.text || '');
    if (!ctx.thinkingEl) {
      ctx.thinkingEl = createThinkingEl('', false);
      ctx.bodyEl.insertBefore(ctx.thinkingEl, ctx.mdEl);
    }
    ctx.thinkingEl.classList.remove('collapsed');
    ctx.thinkingEl.querySelector('.thinking-body').textContent = ctx.msg.thinking;
    if (state.autoScroll) el.threadScroll.scrollTop = el.threadScroll.scrollHeight;
  }

  function onStepDone(event) {
    const ctx = state.current;
    if (!ctx) return;
    if (typeof event.text === 'string' && event.text) ctx.msg.content = event.text;
    if (typeof event.thinking === 'string') ctx.msg.thinking = event.thinking;
    if (Array.isArray(event.toolCalls)) {
      for (const call of event.toolCalls) {
        registerToolCall(ctx.msg, {
          id: call.id,
          name: call.name,
          args: call.args || {},
        });
      }
    }
    if (event.usage && (event.usage.output || event.usage.input)) {
      ctx.msg.usage = event.usage;
      if (Number(event.usage.input)) ctx.msg.contextInput = Number(event.usage.input);
    }
    if (event.tokenSaver) ctx.msg.tokenSaver = event.tokenSaver;
    if (event.maxOutputTokens) ctx.msg.maxOutputTokens = event.maxOutputTokens;
    ctx.mdEl.innerHTML = renderMarkdown(ctx.msg.content || '');
    ctx.mdEl.classList.remove('streaming');
    if (ctx.thinkingEl) {
      ctx.thinkingEl.querySelector('.thinking-body').textContent = ctx.msg.thinking;
      if ((ctx.msg.thinking || '').length > 380) ctx.thinkingEl.classList.add('collapsed');
    }
    hideLiveThinking(ctx);
    updateMeta(ctx);
    updateTokenStats();
    scrollBottom();
  }

  function onToolStart(event) {
    const ctx = state.current;
    if (!ctx) return;
    hideLiveThinking(ctx);
    ctx.mdEl.classList.remove('streaming');
    const call = registerToolCall(ctx.msg, {
      id: String(event.id),
      name: String(event.name),
      args: event.args && typeof event.args === 'object' ? event.args : {},
    });

    let card = ctx.toolEls.get(call.id);
    if (!card) {
      card = createToolCard(call);
      ctx.toolStackEl.append(card);
      ctx.toolEls.set(call.id, card);
    }
    card.classList.add('open');
    if (event.needsApproval) {
      const status = card.querySelector('.tool-state');
      if (status) status.textContent = 'aguardando';
    }
    scrollBottom();
  }

  function onToolProgress(event) {
    const ctx = state.current;
    if (!ctx) return;
    const card = ctx.toolEls.get(event.id);
    if (!card || !card.classList.contains('running')) return;
    const status = card.querySelector('.tool-state');
    if (status) status.textContent = `${Math.max(1, Math.round((event.elapsed || 0) / 1000))}s`;
  }

  function onApprovalRequest(event) {
    const ctx = state.current;
    const card = ctx ? ctx.toolEls.get(event.toolId) : null;
    if (!card) {
      wsSend({ type: 'approval', id: event.id, approved: false });
      return;
    }

    card.classList.add('open');
    const old = card.querySelector('.approval');
    if (old) old.remove();

    const row = document.createElement('div');
    row.className = 'approval';
    row.dataset.approval = event.id;
    row.innerHTML =
      `<span class="approval-text">Permitir <strong>${escapeHtml(event.name)}</strong>?</span>` +
      `<button type="button" class="btn-sm accent" data-approve="1">Executar</button>` +
      `<button type="button" class="btn-sm" data-approve="0">Negar</button>`;
    card.append(row);

    const status = card.querySelector('.tool-state');
    if (status) status.textContent = 'aprovação';
    scrollBottom();
  }

  function onToolEnd(event) {
    const ctx = state.current;
    if (!ctx) return;
    const call = (ctx.msg.toolCalls || []).find((entry) => entry.id === event.id);
    const result = {
      id: String(event.id),
      name: call ? call.name : 'tool',
      ok: !!event.ok,
      output: String(event.output || ''),
      meta: event.meta && typeof event.meta === 'object' ? event.meta : {},
      denied: !!event.denied,
      duration: event.duration,
    };
    if (!ctx.msg.toolResults.some((entry) => entry.id === result.id)) {
      ctx.msg.toolResults.push(result);
    }
    const card = ctx.toolEls.get(result.id);
    if (card) applyToolResult(card, result);

    // Exibir imagem gerada inline no chat
    if (result.name === 'generate_image' && result.ok && result.meta && result.meta.url) {
      const imgWrap = document.createElement('div');
      imgWrap.className = 'generated-image';
      imgWrap.innerHTML = `<img src="${escapeAttr(result.meta.url)}" alt="Imagem gerada" loading="lazy">
        <div class="generated-image-actions">
          <button type="button" data-download="${escapeAttr(result.meta.url)}">Baixar</button>
        </div>`;
      const dlBtn = imgWrap.querySelector('[data-download]');
      if (dlBtn) {
        dlBtn.addEventListener('click', () => {
          const a = document.createElement('a');
          a.href = dlBtn.dataset.download;
          a.download = '';
          a.click();
        });
      }
      // Insert before the meta area
      if (ctx.metaEl && ctx.metaEl.parentNode) {
        ctx.metaEl.parentNode.insertBefore(imgWrap, ctx.metaEl);
      } else if (ctx.bodyEl) {
        ctx.bodyEl.append(imgWrap);
      }
    }

    scrollBottom();
  }

  function onDone(event) {
    const ctx = state.current;
    if (ctx) {
      if (event.lastUsage) {
        ctx.msg.usage = event.lastUsage;
        if (Number(event.lastUsage.input)) ctx.msg.contextInput = Number(event.lastUsage.input);
      }
      if (event.saverInfo) ctx.msg.saverInfo = event.saverInfo;
      settleCurrentDom();
      ctx.msg.pending = false;
      updateMeta(ctx);
      state.current = null;
    }
    if (event.saverInfo) state.lastSaverInfo = event.saverInfo;
    setStreaming(false);
    saveChats();
    renderChatList();
    updateSendState();
    scrollBottom();
    updateTokenStats();
  }

  function onError(event) {
    const message = String(event.message || 'Erro desconhecido');
    const ctx = state.current;
    if (ctx) {
      ctx.msg.error = message;
      const box = appendError(ctx.bodyEl, message, true);
      if (ctx.metaEl) ctx.bodyEl.insertBefore(box, ctx.metaEl);
      settleCurrentDom();
      state.current = null;
    } else {
      toast(message, 'error');
    }
    setStreaming(false);
    saveChats();
    renderChatList();
    updateTokenStats();
  }

  function onAborted() {
    const ctx = state.current;
    if (ctx) {
      ctx.msg.aborted = true;
      ctx.msg.pending = false;
      settleCurrentDom();
      state.current = null;
    }
    setStreaming(false);
    saveChats();
    renderChatList();
    updateTokenStats();
  }

  function handleEvent(event) {
    if (!event || typeof event.type !== 'string') return;
    switch (event.type) {
      case 'ready':
        break;
      case 'step_start':
        onStepStart(event);
        break;
      case 'delta':
        onDelta(event);
        break;
      case 'thinking':
        onThinking(event);
        break;
      case 'step_done':
        onStepDone(event);
        break;
      case 'tool_start':
        onToolStart(event);
        break;
      case 'tool_progress':
        onToolProgress(event);
        break;
      case 'tool_end':
        onToolEnd(event);
        break;
      case 'approval_request':
        onApprovalRequest(event);
        break;
      case 'done':
        onDone(event);
        break;
      case 'error':
        onError(event);
        break;
      case 'aborted':
        onAborted();
        break;
      case 'exec_result':
        onExecResult(event);
        break;
      case 'skills_changed':
        if (Array.isArray(event.skills)) state.skills = event.skills;
        renderSkillsSettings();
        if (event.skills) {
          const ids = event.skills.map((skill) => skill.id).join(', ');
          if (ids) toast(`Skills atualizadas: ${ids}`);
        } else {
          loadSkills(true);
        }
        break;
      default:
        break;
    }
  }

  /* ============================================================
     WebSocket
     ============================================================ */

  function connectWS() {
    if (state.ws && (state.ws.readyState === WebSocket.OPEN || state.ws.readyState === WebSocket.CONNECTING)) return;
    setConnState('connecting');
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    let socket;
    try {
      socket = new WebSocket(`${protocol}//${location.host}/ws`);
    } catch {
      scheduleReconnect();
      return;
    }
    state.ws = socket;

    socket.onopen = () => {
      state.wsReady = true;
      state.wsRetry = 0;
      setConnState('online');
      updateSendState();
      maybeAutoRun();
    };

    socket.onclose = () => {
      state.wsReady = false;
      setConnState('offline');
      updateSendState();
      if (state.streaming) {
        if (state.current) {
          const ctx = state.current;
          ctx.msg.error = 'Conexão com o servidor caiu.';
          const box = appendError(ctx.bodyEl, ctx.msg.error, true);
          if (ctx.metaEl) ctx.bodyEl.insertBefore(box, ctx.metaEl);
          settleCurrentDom();
          state.current = null;
        }
        setStreaming(false);
        saveChats();
      }
      scheduleReconnect();
    };

    socket.onerror = () => {};
    socket.onmessage = (message) => {
      try {
        handleEvent(JSON.parse(message.data));
      } catch {
        /* mensagem invalida */
      }
    };
  }

  function scheduleReconnect() {
    if (state.wsTimer) clearTimeout(state.wsTimer);
    const delay = Math.min(8000, 700 * 2 ** Math.min(state.wsRetry, 4));
    state.wsRetry += 1;
    state.wsTimer = setTimeout(connectWS, delay);
  }

  /* ============================================================
     Modelos
     ============================================================ */

  function resolveModel(reference) {
    if (!reference) return null;
    const raw = String(reference);
    const slash = raw.indexOf('/');
    if (slash < 0) return null;
    const connectionId = raw.slice(0, slash);
    const modelId = raw.slice(slash + 1);
    const connection = state.connections.find((entry) => entry.id === connectionId);
    if (!connection) return null;
    const model = (connection.models || []).find((entry) => entry.id === modelId);
    if (!model) return null;
    return { connection, model };
  }

  function pickDefaultModel() {
    for (const connection of state.connections) {
      const first = (connection.models || [])[0];
      if (first) return `${connection.id}/${first.id}`;
    }
    return '';
  }

  function updateKeysState() {
    if (!el.keysState) return;
    const list = state.connections.length
      ? state.connections
      : (state.config && state.config.connections) || [];
    const connected = list.filter((entry) => entry.connected).length;
    el.keysState.textContent = connected ? `${connected} IA${connected === 1 ? '' : 's'}` : '0 IAs';
  }

  function updateModelPill() {
    const resolved = resolveModel(state.activeModel);
    if (resolved) {
      el.modelLabel.textContent = resolved.model.name;
      el.modelDot.style.background = resolved.connection.color || 'var(--accent)';
      el.modelDot.hidden = false;
      el.modelPill.classList.add('ready');
      el.modelPill.title = `${resolved.connection.label} · ${resolved.model.name}`;
      return;
    }
    el.modelLabel.textContent = state.connections.length ? 'Selecionar modelo' : 'Conectar uma IA';
    el.modelDot.hidden = true;
    el.modelPill.classList.remove('ready');
    el.modelPill.title = 'Escolher modelo';
  }

  async function refreshState() {
    const data = await api('/api/state');
    state.config = data;
    if (data.settings) {
      state.settings = { ...state.settings, ...data.settings };
      const localAuto = localStorage.getItem('trojan.auto');
      if (localAuto !== null) state.settings.autoApprove = localAuto === '1';
      setAutoApprove(state.settings.autoApprove, false);
      const localTheme = localStorage.getItem('trojan.theme');
      const localUi = localStorage.getItem('trojan.ui');
      const localAnim = localStorage.getItem('trojan.anim');
      const uiStyle = localUi || data.settings.uiStyle || 'claude';
      applyUiStyle(uiStyle);
      const theme = localTheme || data.settings.theme || (uiStyle === 'grok' ? 'dark' : 'light');
      applyTheme(theme);
      const animation = normalizeAnimation(localAnim || data.settings.animation || 'full');
      applyAnimation(animation);
      const patch = {};
      if (localTheme && localTheme !== data.settings.theme) patch.theme = theme;
      if (localUi && localUi !== data.settings.uiStyle) patch.uiStyle = uiStyle;
      if (localAnim && localAnim !== data.settings.animation) patch.animation = animation;
      if (Object.keys(patch).length) api('/api/settings', { method: 'POST', body: patch }).catch(() => {});
      if (!state.activeModel) state.activeModel = data.settings.activeModel || '';
      state.activeAgent = data.settings.activeAgent || '';
      updateAgentPill();
      renderPrefs();
      updateGreeting();
    }
    if (data.defaults) {
      if (el.aboutVersion) el.aboutVersion.textContent = `v${data.defaults.version || '1.0.0'}`;
      if (el.aboutNode) el.aboutNode.textContent = data.defaults.node || '—';
      if (el.aboutPlatform) el.aboutPlatform.textContent = data.defaults.platform || '—';
      if (el.sysHost) el.sysHost.textContent = data.defaults.home || 'local';
      if (el.termHost) el.termHost.textContent = data.defaults.home || 'local';
    }
    renderProviderList();
    updateKeysState();
    return data;
  }

  async function loadModels() {
    const data = await api('/api/models');
    state.connections = Array.isArray(data.connections) ? data.connections : [];

    if (!resolveModel(state.activeModel)) {
      const saved = resolveModel(state.settings.activeModel) ? state.settings.activeModel : '';
      const next = saved || pickDefaultModel();
      state.activeModel = next;
      state.settings.activeModel = next;
      if (next) {
        api('/api/settings', { method: 'POST', body: { activeModel: next } }).catch(() => {});
      }
    }

    updateModelPill();
    updateEmptyHint();
    updateKeysState();
    renderModelList();
    maybeAutoRun();
  }

  function renderModelList() {
    if (!el.modelList) return;
    const query = String(el.modelSearch.value || '').trim().toLowerCase();
    el.modelList.innerHTML = '';
    let total = 0;

    for (const connection of state.connections) {
      const models = (connection.models || []).filter((model) => {
        if (!query) return true;
        return (
          String(model.name || '').toLowerCase().includes(query) ||
          String(model.id || '').toLowerCase().includes(query) ||
          String(connection.label || '').toLowerCase().includes(query)
        );
      });
      if (!models.length) continue;

      const group = document.createElement('div');
      group.className = 'model-group';
      group.innerHTML =
        `<span class="gdot" style="background:${escapeAttr(connection.color || 'var(--accent)')}"></span>` +
        `<span>${escapeHtml(connection.label)}</span>`;
      el.modelList.append(group);

      for (const model of models) {
        total += 1;
        const reference = `${connection.id}/${model.id}`;
        const item = document.createElement('button');
        item.type = 'button';
        item.className = `model-item${reference === state.activeModel ? ' active' : ''}`;
        item.dataset.model = reference;
        item.title = model.id;
        item.innerHTML =
          `<span class="m-dot" style="background:${escapeAttr(connection.color || 'var(--accent)')}"></span>` +
          `<span class="m-name">${escapeHtml(model.name || model.id)}</span>` +
          (connection.warning ? `<span class="m-tag" title="${escapeAttr(connection.warning)}">cache</span>` : '') +
          `${icon('check', 'm-check')}`;
        el.modelList.append(item);
      }
    }

    if (!total) {
      const empty = document.createElement('div');
      empty.className = 'model-empty';
      empty.innerHTML = `${icon('key', '')}<strong>${
        state.connections.length ? 'Nenhum modelo encontrado' : 'Nenhuma IA conectada'
      }</strong><p>${
        state.connections.length
          ? 'Tente outro termo ou verifique a chave do provedor.'
          : 'Cole uma API key nas configurações para liberar os modelos.'
      }</p><button type="button" data-manage>Gerenciar conexões</button>`;
      el.modelList.append(empty);
    }

    if (el.modelCount) {
      const modelTotal = state.connections.reduce((sum, entry) => sum + (entry.models || []).length, 0);
      el.modelCount.textContent = `${modelTotal} modelo${modelTotal === 1 ? '' : 's'}`;
    }
  }

  function openModelPopover() {
    closeAgentPopover();
    el.modelSearch.value = '';
    renderModelList();
    el.modelPopover.hidden = false;
    el.modelPill.setAttribute('aria-expanded', 'true');

    if (el.modelList.querySelector('.model-item')) {
      el.modelList.querySelector('.model-item').focus({ preventScroll: true });
    }

    const rect = el.modelPill.getBoundingClientRect();
    const width = el.modelPopover.offsetWidth || 392;
    const height = el.modelPopover.offsetHeight || 420;
    const left = Math.max(10, Math.min(rect.left, window.innerWidth - width - 10));
    const top = Math.max(10, Math.min(rect.bottom + 8, window.innerHeight - height - 10));
    el.modelPopover.style.left = `${left}px`;
    el.modelPopover.style.top = `${top}px`;
  }

  function closeModelPopover() {
    if (!el.modelPopover || el.modelPopover.hidden) return;
    el.modelPopover.hidden = true;
    el.modelPill.setAttribute('aria-expanded', 'false');
  }

  function toggleModelPopover() {
    if (el.modelPopover.hidden) openModelPopover();
    else closeModelPopover();
  }

  async function selectModel(reference) {
    if (!resolveModel(reference)) return;
    state.activeModel = reference;
    state.settings.activeModel = reference;
    updateModelPill();
    renderModelList();
    closeModelPopover();
    el.input.focus();
    try {
      await api('/api/settings', { method: 'POST', body: { activeModel: reference } });
    } catch {
      /* preferencia local mesmo se o servidor negar */
    }
  }

  /* ============================================================
     Agentes
     ============================================================ */

  const AGENT_MODE_LABEL = {
    primary: 'principal',
    secondary: 'secundário',
    all: 'todos',
  };

  function activeAgentEntry() {
    return state.agents.find((agent) => agent.id === state.activeAgent) || null;
  }

  function updateAgentPill() {
    if (!el.agentPill) return;
    const agent = activeAgentEntry();
    if (agent) {
      el.agentLabel.textContent = agent.name;
      el.agentPill.classList.add('active');
      el.agentPill.title = `Agente ativo: ${agent.name}${agent.description ? ` · ${agent.description}` : ''}`;
    } else {
      el.agentLabel.textContent = 'agente';
      el.agentPill.classList.remove('active');
      el.agentPill.title = 'Escolher agente';
    }
  }

  function agentItemHtml(agent) {
    const active = agent.id === state.activeAgent;
    const mode = AGENT_MODE_LABEL[agent.mode] || agent.mode || 'principal';
    return (
      `<button type="button" class="agent-item${active ? ' active' : ''}" data-agent-id="${escapeAttr(
        agent.id,
      )}" role="option" aria-selected="${active}">` +
      `<span class="a-ico">${icon('sparkle', '')}</span>` +
      `<span class="a-copy"><span class="a-name">${escapeHtml(agent.name)}` +
      `<span class="a-mode">${escapeHtml(mode)}</span></span>` +
      `<span class="a-desc">${escapeHtml(agent.description || 'Sem descrição.')}</span></span>` +
      `${icon('check', 'a-check')}` +
      `</button>`
    );
  }

  function renderAgentList() {
    if (!el.agentList) return;
    const noneActive = !state.activeAgent;
    el.agentList.innerHTML =
      `<button type="button" class="agent-item${noneActive ? ' active' : ''}" data-agent-id="" role="option" aria-selected="${noneActive}">` +
      `<span class="a-ico muted">${icon('knight', '')}</span>` +
      `<span class="a-copy"><span class="a-name">Sem agente<span class="a-mode">padrão</span></span>` +
      `<span class="a-desc">Usa apenas o prompt base do Trojan.</span></span>` +
      `${icon('check', 'a-check')}` +
      `</button>` +
      state.agents.map(agentItemHtml).join('');

    if (!state.agents.length) {
      const hint = document.createElement('div');
      hint.className = 'agent-empty';
      hint.innerHTML = `${icon('file', '')}<span>Nenhum arquivo em <code>agents/</code>.</span>`;
      el.agentList.append(hint);
    }

    if (el.agentCount) {
      const total = state.agents.length;
      el.agentCount.textContent = `${total} agente${total === 1 ? '' : 's'}`;
    }
  }

  function positionAgentPopover() {
    if (!el.agentPopover || el.agentPopover.hidden) return;
    const rect = el.agentPill.getBoundingClientRect();
    const width = el.agentPopover.offsetWidth || 380;
    const height = el.agentPopover.offsetHeight || 320;
    const left = Math.max(10, Math.min(rect.left, window.innerWidth - width - 10));
    let top = rect.top - height - 8;
    if (top < 10) top = Math.max(10, Math.min(rect.bottom + 8, window.innerHeight - height - 10));
    el.agentPopover.style.left = `${left}px`;
    el.agentPopover.style.top = `${top}px`;
  }

  function openAgentPopover() {
    if (!el.agentPopover) return;
    closeModelPopover();
    renderAgentList();
    el.agentPopover.hidden = false;
    el.agentPill.setAttribute('aria-expanded', 'true');
    positionAgentPopover();
  }

  function closeAgentPopover() {
    if (!el.agentPopover || el.agentPopover.hidden) return;
    el.agentPopover.hidden = true;
    el.agentPill.setAttribute('aria-expanded', 'false');
  }

  function toggleAgentPopover() {
    if (el.agentPopover.hidden) openAgentPopover();
    else closeAgentPopover();
  }

  async function selectAgent(id) {
    const target = String(id || '');
    if (target && !state.agents.some((agent) => agent.id === target)) return;
    state.activeAgent = target;
    state.settings.activeAgent = target;
    updateAgentPill();
    renderAgentList();
    renderSettingsAgents();
    closeAgentPopover();
    if (!el.settingsModal.classList.contains('open')) el.input.focus();
    try {
      await api('/api/settings', { method: 'POST', body: { activeAgent: target } });
    } catch (error) {
      toast(error.message, 'error');
    }
  }

  function applyAgentsPayload(data) {
    if (Array.isArray(data.agents)) state.agents = data.agents;
    const active = String(data.activeAgent || '').trim();
    if (active && state.agents.some((agent) => agent.id === active)) {
      state.activeAgent = active;
      state.settings.activeAgent = active;
    } else if (!state.agents.some((agent) => agent.id === state.activeAgent)) {
      state.activeAgent = '';
      state.settings.activeAgent = '';
    }
    updateAgentPill();
    renderAgentList();
    renderSettingsAgents();
  }

  async function loadAgents() {
    const data = await api('/api/agents');
    state.agents = Array.isArray(data.agents) ? data.agents : [];
    const saved = String((data.activeAgent !== undefined ? data.activeAgent : state.settings.activeAgent) || '').trim();
    const next = state.agents.some((agent) => agent.id === saved) ? saved : '';
    state.activeAgent = next;
    state.settings.activeAgent = next;
    updateAgentPill();
    renderAgentList();
    renderSettingsAgents();
  }

  function agentSettingsCard(agent) {
    const active = agent.id === state.activeAgent;
    const mode = AGENT_MODE_LABEL[agent.mode] || agent.mode || 'principal';
    const size = agent.size >= 1024 ? `${(agent.size / 1024).toFixed(1)} KB` : `${agent.size} B`;
    return (
      `<div class="agent-card${active ? ' active' : ''}" data-agent-card="${escapeAttr(agent.id)}">` +
      `<span class="agent-avatar">${icon('sparkle', '')}</span>` +
      `<div class="agent-card-copy">` +
      `<div class="agent-card-name">${escapeHtml(agent.name)}` +
      (active ? '<span class="active-tag">ativo</span>' : '') +
      `<span class="agent-mode">${escapeHtml(mode)}</span></div>` +
      `<div class="agent-card-desc">${escapeHtml(agent.description || 'Sem descrição.')}</div>` +
      `<div class="agent-card-file"><code>agents/${escapeHtml(agent.file)}</code> · ${escapeHtml(size)}</div>` +
      `</div>` +
      `<div class="agent-card-actions">` +
      `<button type="button" class="mini-btn${active ? ' accent' : ''}" data-agent-use="1"${
        active ? ' disabled' : ''
      }>${active ? 'Ativo' : 'Usar'}</button>` +
      `<button type="button" class="mini-btn" data-agent-edit="1">Editar</button>` +
      `<button type="button" class="mini-btn danger" data-agent-delete="1">Excluir</button>` +
      `</div>` +
      `</div>`
    );
  }

  function renderSettingsAgents() {
    if (!el.settingsAgentList) return;
    if (!state.agents.length) {
      el.settingsAgentList.innerHTML =
        `<div class="agent-settings-empty">${icon('sparkle', '')}` +
        `<strong>Nenhum agente ainda</strong>` +
        `<p>Crie um aqui ou solte um arquivo <code>.md</code> em <code>agents/</code>.</p></div>`;
      return;
    }
    el.settingsAgentList.innerHTML = state.agents.map(agentSettingsCard).join('');
  }

  async function openAgentForm(agentId = '') {
    if (!el.agentForm) return;
    el.agentForm.hidden = false;
    el.agentForm.dataset.editing = agentId ? String(agentId) : '';
    el.agentFormTitle.textContent = agentId ? 'Editar agente' : 'Novo agente';
    if (!agentId) {
      el.agentForm.reset();
      el.agentMode.value = 'primary';
      el.agentName.focus();
      el.agentForm.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      return;
    }
    try {
      const data = await api(`/api/agents/${encodeURIComponent(agentId)}`);
      const agent = data.agent || {};
      el.agentName.value = agent.name || '';
      el.agentDescription.value = agent.description || '';
      el.agentMode.value = agent.mode || 'primary';
      el.agentContent.value = agent.content || '';
      el.agentName.focus();
      el.agentForm.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    } catch (error) {
      toast(error.message, 'error');
      closeAgentForm();
    }
  }

  function closeAgentForm() {
    if (!el.agentForm) return;
    el.agentForm.hidden = true;
    el.agentForm.dataset.editing = '';
    el.agentForm.reset();
    el.agentMode.value = 'primary';
  }

  async function submitAgentForm(event) {
    event.preventDefault();
    if (!el.agentForm) return;
    const editing = el.agentForm.dataset.editing || '';
    const name = String(el.agentName.value || '').trim();
    const description = String(el.agentDescription.value || '').trim();
    const content = String(el.agentContent.value || '').trim();
    const mode = el.agentMode.value;
    if (!name || !content) {
      toast('Nome e definição são obrigatórios.', 'error');
      return;
    }
    setBusy(el.saveAgent, true);
    try {
      const data = await api('/api/agents', {
        method: 'POST',
        body: { id: editing || undefined, name, description, content, mode, select: !editing },
      });
      if (Array.isArray(data.agents)) {
        applyAgentsPayload(data);
      } else {
        await loadAgents();
      }
      closeAgentForm();
      toast(editing ? `${name} atualizado.` : `${name} criado e ativado.`);
    } catch (error) {
      toast(error.message, 'error');
    } finally {
      setBusy(el.saveAgent, false);
    }
  }

  async function removeAgentById(id) {
    const agent = state.agents.find((entry) => entry.id === id);
    if (!agent) return;
    if (!confirm(`Excluir o agente "${agent.name}"? O arquivo agents/${agent.file} será apagado.`)) return;
    try {
      const data = await api(`/api/agents/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (el.agentForm && el.agentForm.dataset.editing === id) closeAgentForm();
      applyAgentsPayload(data);
      toast(`${agent.name} excluído.`);
    } catch (error) {
      toast(error.message, 'error');
    }
  }

  async function refreshAgents() {
    try {
      await loadAgents();
      toast('Agentes recarregados.');
    } catch (error) {
      toast(error.message, 'error');
    }
  }

  /* ============================================================
     Configurações · conexões
     ============================================================ */

  const KIND_LABEL = {
    openai: 'OpenAI-compatible',
    anthropic: 'Anthropic',
    google: 'Gemini',
  };

  function providerCardHtml(conn) {
    const id = escapeAttr(conn.id);
    const custom = conn.custom ? '1' : '0';
    const color = escapeAttr(conn.color || '#C96442');
    const kind = KIND_LABEL[conn.kind] || escapeHtml(conn.kind || 'openai');
    const status = conn.connected
      ? '<span class="prov-status ok"><span class="dot"></span>conectado</span>'
      : '<span class="prov-status"><span class="dot"></span>sem chave</span>';
    const placeholder = escapeAttr(
      conn.hasKey ? conn.maskedKey : conn.keyHint || (conn.noKey ? 'sem chave necessária' : 'Cole a API key'),
    );
    const iconHtml = conn.custom
      ? icon('globe', '')
      : escapeHtml(String(conn.label || '?').trim().slice(0, 1).toUpperCase());
    const removeButton = conn.custom
      ? '<button type="button" class="mini-btn danger" data-remove="1" title="Remover conexão">Remover</button>'
      : conn.hasKey
        ? '<button type="button" class="mini-btn" data-remove="1" title="Apagar a chave deste PC">Limpar</button>'
        : '';
    const keyLink = conn.keysUrl
      ? `<a href="${escapeAttr(conn.keysUrl)}" target="_blank" rel="noreferrer">obter chave ${icon(
          'external',
          '',
        )}</a>`
      : '';

    return (
      `<div class="provider-card${conn.connected ? ' connected' : ''}" data-provider="${id}" data-custom="${custom}">` +
      `<div class="provider-head">` +
      `<span class="provider-ico${conn.custom ? ' custom' : ''}" style="${
        conn.custom ? '' : `background:${color}`
      }">${iconHtml}</span>` +
      `<div class="provider-title"><div class="provider-name">${escapeHtml(conn.label)}</div>` +
      `<div class="provider-sub">${kind}${conn.baseUrl ? ` · ${escapeHtml(safeHost(conn.baseUrl))}` : ''}</div></div>` +
      `${status}` +
      `</div>` +
      `<div class="provider-row">` +
      `<input data-key type="password" placeholder="${placeholder}" autocomplete="off" spellcheck="false" aria-label="API key de ${escapeAttr(
        conn.label,
      )}">` +
      `<button type="button" class="mini-btn accent" data-save="1">Salvar</button>` +
      `<button type="button" class="mini-btn" data-test="1">Testar</button>` +
      `${removeButton}` +
      `</div>` +
      `<div class="provider-meta"><span>${kind}</span>${keyLink}` +
      `<span class="provider-test" data-test-result></span></div>` +
      (conn.noKey ? '<div class="provider-note">Servidor local · nenhuma chave necessária.</div>' : '') +
      `</div>`
    );
  }

  function renderProviderList() {
    if (!el.providerList) return;
    const connections = (state.config && state.config.connections) || [];
    if (!connections.length) {
      el.providerList.innerHTML = '';
      return;
    }
    el.providerList.innerHTML = connections.map(providerCardHtml).join('');
  }

  function providerCard(node) {
    return node.closest('.provider-card');
  }

  function markProviderConnected(card) {
    if (!card) return;
    card.classList.add('connected');
    const status = card.querySelector('.prov-status');
    if (status) {
      status.className = 'prov-status ok';
      status.innerHTML = '<span class="dot"></span>conectado';
    }
    const input = card.querySelector('[data-key]');
    if (input && !input.value) input.placeholder = '••••••••';
  }

  async function saveProviderKey(card, button) {
    const input = card.querySelector('[data-key]');
    const key = String(input.value || '').trim();
    if (!key) {
      toast('Cole a API key primeiro.', 'error');
      input.focus();
      return;
    }
    const id = card.dataset.provider;
    const label = card.querySelector('.provider-name').textContent;
    setBusy(button, true);
    try {
      const data = await api(`/api/connections/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: { apiKey: key },
      });
      state.config = data;
      await loadModels();
      renderProviderList();
      toast(`${label} conectada.`);
    } catch (error) {
      toast(error.message, 'error');
    } finally {
      setBusy(button, false);
    }
  }

  async function testProviderConnection(card, button) {
    const input = card.querySelector('[data-key]');
    const result = card.querySelector('[data-test-result]');
    const id = card.dataset.provider;
    const key = String(input.value || '').trim();
    setBusy(button, true);
    if (result) {
      result.className = 'provider-test';
      result.textContent = 'testando…';
    }
    try {
      if (key) {
        const saved = await api(`/api/connections/${encodeURIComponent(id)}`, {
          method: 'PUT',
          body: { apiKey: key },
        });
        state.config = saved;
        input.value = '';
      }
      const data = await api(`/api/connections/${encodeURIComponent(id)}/test`, { method: 'POST' });
      if (result) {
        result.className = `provider-test ${data.ok ? 'ok' : 'err'}`;
        result.textContent = data.ok
          ? `ok · ${data.latency}ms · ${data.models} modelo${data.models === 1 ? '' : 's'}`
          : `falhou · ${data.error || 'sem resposta'}`;
      }
      if (data.ok) {
        await loadModels();
        markProviderConnected(card);
      }
    } catch (error) {
      if (result) {
        result.className = 'provider-test err';
        result.textContent = `falhou · ${error.message}`;
      }
    } finally {
      setBusy(button, false);
    }
  }

  async function removeProviderConnection(card, button) {
    const id = card.dataset.provider;
    const custom = card.dataset.custom === '1';
    const label = card.querySelector('.provider-name').textContent;
    const question = custom
      ? `Remover a conexão "${label}"?`
      : `Apagar a chave de ${label} deste computador?`;
    if (!confirm(question)) return;

    setBusy(button, true);
    try {
      const data = await api(`/api/connections/${encodeURIComponent(id)}`, {
        method: custom ? 'DELETE' : 'PUT',
        body: custom ? undefined : { apiKey: '' },
      });
      state.config = data;
      if (String(state.activeModel).startsWith(`${id}/`)) {
        state.activeModel = '';
        state.settings.activeModel = '';
      }
      await loadModels();
      renderProviderList();
      toast(custom ? `${label} removida.` : `Chave de ${label} apagada.`);
    } catch (error) {
      toast(error.message, 'error');
    } finally {
      setBusy(button, false);
    }
  }

  async function addCustomConnection(event) {
    event.preventDefault();
    const submit = el.customForm.querySelector('button[type="submit"]');
    const name = String(el.customName.value || '').trim();
    const baseUrl = String(el.customUrl.value || '').trim();
    const kind = el.customKind.value;
    const apiKey = String(el.customKey.value || '').trim();

    if (!name || !baseUrl) {
      toast('Nome e Base URL são obrigatórios.', 'error');
      return;
    }

    setBusy(submit, true);
    try {
      const data = await api('/api/connections', {
        method: 'POST',
        body: { name, baseUrl, kind, apiKey },
      });
      state.config = data;
      el.customForm.reset();
      el.customForm.hidden = true;
      await loadModels();
      renderProviderList();
      toast(`${name} adicionada.`);
    } catch (error) {
      toast(error.message, 'error');
    } finally {
      setBusy(submit, false);
    }
  }

  /* ============================================================
     Skills · menu de barra e gerenciamento
     ============================================================ */

  function slashMatch() {
    if (!el.input) return null;
    const caret = el.input.selectionStart || 0;
    const before = el.input.value.slice(0, caret);
    const match = before.match(/(^|\s)\/([A-Za-z0-9_-]*)$/);
    if (!match) return null;
    return {
      query: match[2],
      start: caret - match[0].length + match[1].length,
      end: caret,
    };
  }

  function filteredSkills(query) {
    const q = String(query || '').toLowerCase();
    return state.skills
      .filter((skill) => {
        if (!q) return true;
        return (
          String(skill.id || '').toLowerCase().includes(q) ||
          String(skill.name || '').toLowerCase().includes(q) ||
          String(skill.description || '').toLowerCase().includes(q)
        );
      })
      .slice(0, 8);
  }

  function closeSkillMenu() {
    state.skillQuery = '';
    state.skillRange = null;
    if (el.skillMenu) el.skillMenu.hidden = true;
  }

  function renderSkillMenu() {
    if (!el.skillMenu || !el.skillMenuList) return;
    const list = filteredSkills(state.skillQuery);
    if (state.skillIndex >= list.length) state.skillIndex = Math.max(0, list.length - 1);
    if (!state.skills.length) {
      el.skillMenuList.innerHTML = '<div class="skill-menu-empty">Nenhuma skill instalada. Peça ao Trojan: <strong>instale a skill &lt;url do github&gt;</strong>.</div>';
    } else if (!list.length) {
      el.skillMenuList.innerHTML = `<div class="skill-menu-empty">Nada encontrado para <strong>/${escapeHtml(state.skillQuery)}</strong>.</div>`;
    } else {
      el.skillMenuList.innerHTML = list
        .map((skill, index) => {
          const active = index === state.skillIndex ? ' active' : '';
          const desc = String(skill.description || '').trim();
          return `<button type="button" class="skill-menu-item${active}" data-skill="${escapeAttr(skill.id)}" data-index="${index}">
            <span class="skill-menu-slash">/</span>
            <span class="skill-menu-copy">
              <span class="skill-menu-name">${escapeHtml(skill.name || skill.id)}<code>${escapeHtml(skill.id)}</code></span>
              <span class="skill-menu-desc">${escapeHtml(desc || 'Sem descrição.')}</span>
            </span>
          </button>`;
        })
        .join('');
    }
    el.skillMenu.hidden = false;
  }

  function syncSkillMenu() {
    const match = slashMatch();
    if (!match) {
      closeSkillMenu();
      return;
    }
    const changed = match.query !== state.skillQuery;
    state.skillQuery = match.query;
    state.skillRange = { start: match.start, end: match.end };
    if (changed) state.skillIndex = 0;
    renderSkillMenu();
  }

  function applySkill(id) {
    if (!id || !state.skillRange) return;
    const value = el.input.value;
    const before = value.slice(0, state.skillRange.start);
    const after = value.slice(state.skillRange.end);
    const suffix = after.replace(/^\s+/, '');
    el.input.value = `${before}/${id} ${suffix}`;
    const pos = before.length + id.length + 2;
    closeSkillMenu();
    el.input.focus();
    el.input.setSelectionRange(pos, pos);
    autoResize();
    updateSendState();
  }

  function moveSkillSelection(delta) {
    const list = filteredSkills(state.skillQuery);
    if (!list.length) return;
    state.skillIndex = (state.skillIndex + delta + list.length) % list.length;
    renderSkillMenu();
  }

  function extractLeadingSkills(text) {
    const ids = [];
    let rest = String(text || '');
    const re = /^\s*\/([A-Za-z0-9_-]+)\s*/;
    while (true) {
      const match = rest.match(re);
      if (!match) break;
      const id = match[1];
      if (!state.skills.some((skill) => skill.id === id)) break;
      if (!ids.includes(id)) ids.push(id);
      rest = rest.slice(match[0].length);
    }
    return { ids, text: rest.trim() };
  }

  async function loadSkills(silent = false) {
    try {
      const data = await api('/api/skills');
      state.skills = Array.isArray(data.skills) ? data.skills : [];
      renderSkillsSettings();
      if (state.skillRange) renderSkillMenu();
      return state.skills;
    } catch (error) {
      if (!silent) toast(`Skills: ${error.message}`, 'error');
      return state.skills;
    }
  }

  function renderSkillsSettings() {
    if (!el.settingsSkillList) return;
    if (!state.skills.length) {
      el.settingsSkillList.innerHTML = '<div class="skill-empty">Nenhuma skill instalada ainda. Cole uma URL do GitHub acima ou peça ao Trojan para instalar.</div>';
      return;
    }
    el.settingsSkillList.innerHTML = state.skills
      .map((skill) => `<div class="skill-settings-item" data-id="${escapeAttr(skill.id)}">
        <div class="skill-settings-mark">/</div>
        <div class="skill-settings-copy">
          <div class="skill-settings-name">${escapeHtml(skill.name || skill.id)} <code>${escapeHtml(skill.id)}</code></div>
          <div class="skill-settings-desc">${escapeHtml(skill.description || 'Sem descrição.')}</div>
          <div class="skill-settings-meta">${escapeHtml(skill.source || 'local')} · ${Number(skill.files) || 0} arquivos</div>
        </div>
        <button type="button" class="ghost-btn small skill-delete" data-delete-skill="${escapeAttr(skill.id)}">Remover</button>
      </div>`)
      .join('');
  }

  async function installSkillFromSettings(event) {
    event.preventDefault();
    const source = String((el.skillSource && el.skillSource.value) || '').trim();
    if (!source) {
      toast('Cole uma URL ou caminho da skill.', 'error');
      return;
    }
    setBusy(el.skillInstallBtn, true);
    try {
      const data = await api('/api/skills/install', { method: 'POST', body: { source } });
      const installed = Array.isArray(data.installed) ? data.installed : [];
      if (el.skillSource) el.skillSource.value = '';
      await loadSkills(true);
      toast(installed.length ? `Skill instalada: ${installed.map((item) => item.id).join(', ')}` : 'Skill instalada.');
    } catch (error) {
      toast(`Falha ao instalar: ${error.message}`, 'error');
    } finally {
      setBusy(el.skillInstallBtn, false);
    }
  }

  async function deleteSkillFromSettings(id) {
    if (!id) return;
    try {
      await api(`/api/skills/${encodeURIComponent(id)}`, { method: 'DELETE' });
      await loadSkills(true);
      toast(`Skill removida: ${id}`);
    } catch (error) {
      toast(`Falha ao remover: ${error.message}`, 'error');
    }
  }

  /* ============================================================
     Anexos · arquivos e imagens
     ============================================================ */

  function isImageMime(mime) {
    return String(mime || '').startsWith('image/');
  }

  function renderAttachmentPreviews() {
    const container = $('#attachmentPreview');
    if (!container) return;
    if (!state.attachments.length) {
      container.hidden = true;
      container.innerHTML = '';
      return;
    }
    container.hidden = false;
    container.innerHTML = state.attachments
      .map((a, i) => {
        const thumb = isImageMime(a.mime)
          ? `<img src="${escapeAttr(a.url || a.path)}" alt="${escapeAttr(a.name)}">`
          : `<div class="attach-icon"><svg class="ico"><use href="#i-file"/></svg><span>${escapeHtml(a.name.split('.').pop() || 'file')}</span></div>`;
        return `<div class="attach-preview" data-idx="${i}">
          ${thumb}
          <div class="attach-preview-name">${escapeHtml(a.name)}</div>
          <button type="button" class="attach-remove" data-remove="${i}" aria-label="Remover">×</button>
        </div>`;
      })
      .join('');
    container.querySelectorAll('[data-remove]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = Number(btn.dataset.remove);
        if (!isNaN(idx)) state.attachments.splice(idx, 1);
        renderAttachmentPreviews();
        updateSendState();
      });
    });
  }

  async function handleFiles(files) {
    if (!files || !files.length) return;
    const chatId = activeChat() ? activeChat().id : 'default';
    const formData = new FormData();
    formData.append('chatId', chatId);
    let anyTooBig = false;
    for (const file of files) {
      if (file.size > 50 * 1024 * 1024) { anyTooBig = true; continue; }
      formData.append('file', file);
    }
    if (anyTooBig) toast('Um ou mais arquivos excedem 50 MB e foram ignorados.', 'error');
    if (!formData.getAll('file').length) return;

    setBusy(el.attachBtn, true);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData, credentials: 'same-origin' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      const uploaded = Array.isArray(data.files) ? data.files : [];
      for (const f of uploaded) state.attachments.push(f);
      renderAttachmentPreviews();
      updateSendState();
      if (uploaded.length) toast(`${uploaded.length} arquivo(s) anexado(s).`);
    } catch (error) {
      toast(`Falha no upload: ${error.message}`, 'error');
    } finally {
      setBusy(el.attachBtn, false);
      if (el.fileInput) el.fileInput.value = '';
    }
  }

  function clearAttachments() {
    state.attachments = [];
    renderAttachmentPreviews();
  }

  /* ============================================================
     Reverse Engineering Workbench
     ============================================================ */

  let reTargetPath = '';

  async function loadReApps() {
    if (!el.reAppList) return;
    el.reAppList.innerHTML = '<div class="re-loading">Carregando apps...</div>';
    try {
      const data = await api('/api/re/apps');
      const apps = Array.isArray(data.apps) ? data.apps : [];
      if (!apps.length) {
        el.reAppList.innerHTML = '<div class="re-empty-small">Nenhum app encontrado.</div>';
        return;
      }
      el.reAppList.innerHTML = apps.map((app) => `
        <div class="re-app-item" data-path="${escapeAttr(app.exe)}" data-name="${escapeAttr(app.name)}">
          <div class="re-app-name">${escapeHtml(app.name)}</div>
          <div class="re-app-meta">${escapeHtml(app.source)} · ${Number(app.sizeMb).toFixed(1)} MB</div>
          <div class="re-app-path">${escapeHtml(app.exe)}</div>
        </div>
      `).join('');
      el.reAppList.querySelectorAll('.re-app-item').forEach((item) => {
        item.addEventListener('click', () => {
          el.reAppList.querySelectorAll('.re-app-item').forEach((i) => i.classList.remove('selected'));
          item.classList.add('selected');
          reTargetPath = item.dataset.path;
          if (el.reTargetName) el.reTargetName.textContent = item.dataset.name;
          if (el.reAnalyzeBtn) el.reAnalyzeBtn.disabled = false;
        });
      });
    } catch (error) {
      el.reAppList.innerHTML = `<div class="re-empty-small">Erro: ${escapeHtml(error.message)}</div>`;
    }
  }

  async function browseReDir(path) {
    if (!el.reFileList) return;
    el.reFileList.innerHTML = '<div class="re-loading">Carregando...</div>';
    try {
      const data = await api('/api/re/browse', { method: 'POST', body: { path } });
      const entries = Array.isArray(data.entries) ? data.entries : [];
      let html = '';
      if (data.parent) {
        html += `<div class="re-file-item re-dir" data-path="${escapeAttr(data.parent)}" data-dir="1">📁 ..</div>`;
      }
      for (const e of entries) {
        if (e.isDir) {
          html += `<div class="re-file-item re-dir" data-path="${escapeAttr(e.path)}" data-dir="1">📁 ${escapeHtml(e.name)}</div>`;
        } else {
          const icon = e.ext === 'exe' ? '⚙️' : e.ext === 'dll' ? '🔧' : e.ext === 'asar' ? '📦' : '📄';
          html += `<div class="re-file-item re-file" data-path="${escapeAttr(e.path)}" data-name="${escapeAttr(e.name)}">${icon} ${escapeHtml(e.name)} <span class="re-file-size">${formatBytes(e.size)}</span></div>`;
        }
      }
      el.reFileList.innerHTML = html || '<div class="re-empty-small">Pasta vazia.</div>';
      el.reFileList.querySelectorAll('.re-file-item').forEach((item) => {
        item.addEventListener('click', () => {
          if (item.dataset.dir === '1') {
            browseReDir(item.dataset.path);
            if (el.reBrowsePath) el.reBrowsePath.value = item.dataset.path;
          } else {
            el.reFileList.querySelectorAll('.re-file-item').forEach((i) => i.classList.remove('selected'));
            item.classList.add('selected');
            reTargetPath = item.dataset.path;
            if (el.reTargetName) el.reTargetName.textContent = item.dataset.name;
            if (el.reAnalyzeBtn) el.reAnalyzeBtn.disabled = false;
          }
        });
      });
    } catch (error) {
      el.reFileList.innerHTML = `<div class="re-empty-small">Erro: ${escapeHtml(error.message)}</div>`;
    }
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  }

  async function analyzeReTarget() {
    if (!reTargetPath || !el.reResults) return;
    el.reResults.innerHTML = '<div class="re-loading">Analisando... (pode levar alguns segundos)</div>';
    if (el.reAnalyzeBtn) el.reAnalyzeBtn.disabled = true;
    try {
      const data = await api('/api/re/analyze', { method: 'POST', body: { path: reTargetPath } });
      let html = '';
      if (data.type) html += `<div class="re-result-row"><strong>Tipo:</strong> ${escapeHtml(data.type)}</div>`;
      if (data.mainExe) html += `<div class="re-result-row"><strong>Exe principal:</strong> ${escapeHtml(data.mainExe)}</div>`;
      if (Array.isArray(data.executables) && data.executables.length) {
        html += `<div class="re-result-section"><h4>Executáveis (${data.executables.length})</h4><ul>${data.executables.map((e) => `<li>${escapeHtml(e)}</li>`).join('')}</ul></div>`;
      }
      if (Array.isArray(data.asarFiles) && data.asarFiles.length) {
        html += `<div class="re-result-section"><h4>Arquivos ASAR (Electron)</h4><ul>${data.asarFiles.map((e) => `<li>${escapeHtml(e)}</li>`).join('')}</ul></div>`;
      }
      if (Array.isArray(data.strings) && data.strings.length) {
        html += `<div class="re-result-section"><h4>Strings interessantes (${data.strings.length})</h4><pre class="re-strings">${escapeHtml(data.strings.join('\\n'))}</pre></div>`;
      }
      if (Array.isArray(data.files) && data.files.length) {
        const dirs = data.files.filter((f) => f.isDir);
        const files = data.files.filter((f) => !f.isDir);
        html += `<div class="re-result-section"><h4>Arquivos (${files.length} arquivos, ${dirs.length} pastas)</h4>`;
        html += '<div class="re-file-grid">';
        for (const f of files.slice(0, 60)) {
          html += `<div class="re-file-chip" title="${escapeAttr(f.path)}">${escapeHtml(f.name)} <span class="re-file-size">${formatBytes(f.size)}</span></div>`;
        }
        html += '</div></div>';
      }
      if (!html) html = '<div class="re-empty">Nenhum dado extraido.</div>';
      // Add "Send to agent" button
      html += `<div class="re-actions"><button class="primary-btn small" id="reSendToAgent">Enviar analise para o agente</button></div>`;
      el.reResults.innerHTML = html;
      const sendBtn = $('#reSendToAgent', el.reResults);
      if (sendBtn) {
        sendBtn.addEventListener('click', () => {
          const summary = `Analisei o alvo: ${reTargetPath}\nTipo: ${data.type || 'desconhecido'}\nExe: ${data.mainExe || 'N/A'}\nExecutaveis: ${(data.executables || []).length}\nASAR: ${(data.asarFiles || []).length}\nStrings interessantes: ${(data.strings || []).length}\nArquivos: ${(data.files || []).filter((f) => !f.isDir).length}`;
          if (el.input) {
            el.input.value = `/reverse-engineering ${summary}`;
            autoResize();
            updateSendState();
          }
          closeReWorkbench();
        });
      }
    } catch (error) {
      el.reResults.innerHTML = `<div class="re-empty">Erro: ${escapeHtml(error.message)}</div>`;
    } finally {
      if (el.reAnalyzeBtn) el.reAnalyzeBtn.disabled = false;
    }
  }

  function openReWorkbench() {
    if (el.reWorkbenchModal) {
      el.reWorkbenchModal.classList.add('open');
      el.reWorkbenchModal.setAttribute('aria-hidden', 'false');
    }
    loadReApps();
    if (el.reBrowsePath && !el.reBrowsePath.value) {
      el.reBrowsePath.value = (state.settings && state.settings.cwd) || '';
    }
  }

  function closeReWorkbench() {
    if (el.reWorkbenchModal) {
      el.reWorkbenchModal.classList.remove('open');
      el.reWorkbenchModal.setAttribute('aria-hidden', 'true');
    }
  }

  /* ============================================================
     Configurações · preferências
     ============================================================ */

  function switchSettingsTab(tab) {
    const target = ['providers', 'agents', 'skills', 'customize', 'prefs', 'about'].includes(tab) ? tab : 'providers';
    $$('button', el.settingsTabs).forEach((button) => {
      button.classList.toggle('active', button.dataset.tab === target);
    });
    $$('.tab-panel', el.settingsModal).forEach((panel) => {
      panel.classList.toggle('active', panel.dataset.panel === target);
    });
    const body = $('.modal-body', el.settingsModal);
    if (body) body.scrollTop = 0;
    if (target === 'agents') {
      renderSettingsAgents();
      loadAgents().catch((error) => toast(error.message, 'error'));
    }
    if (target === 'skills') {
      renderSkillsSettings();
      loadSkills(true);
    }
  }

  function renderPrefs() {
    if (!el.prefAuto) return;
    el.prefAuto.checked = !!state.settings.autoApprove;
    if (el.prefAutoRun) el.prefAutoRun.checked = !!state.settings.autoRunEnabled;
    if (el.prefAutoRunMessage) el.prefAutoRunMessage.value = state.settings.autoRunMessage || '';
    el.prefCwd.value = state.settings.cwd || '';
    el.prefSystem.value = state.settings.systemPrompt || '';
    if (el.prefOperatorName) el.prefOperatorName.value = state.settings.operatorName || '';
    if (el.prefInterface) {
      $$('button', el.prefInterface).forEach((button) => {
        button.classList.toggle('active', button.dataset.ui === normalizeUiStyle(state.settings.uiStyle));
      });
    }
    if (el.prefAnimation) {
      const animation = normalizeAnimation(state.settings.animation);
      $$('button', el.prefAnimation).forEach((button) => {
        button.classList.toggle('active', button.dataset.animLevel === animation);
      });
    }
    $$('button', el.prefTheme).forEach((button) => {
      button.classList.toggle('active', button.dataset.theme === state.settings.theme);
    });
    if (el.prefOpenMode) {
      $$('button', el.prefOpenMode).forEach((button) => {
        button.classList.toggle('active', button.dataset.open === normalizeOpenMode(state.settings.openMode));
      });
    }
    if (el.prefTokenSaver) {
      const tokenSaver = normalizeTokenSaver(state.settings.tokenSaver);
      $$('button', el.prefTokenSaver).forEach((button) => {
        button.classList.toggle('active', button.dataset.tokenSaver === tokenSaver);
      });
    }
    if (el.prefFast) el.prefFast.checked = state.settings.fastMode !== false;
    if (el.prefInterface) {
      $$('button', el.prefInterface).forEach((button) => {
        button.classList.toggle('active', button.dataset.ui === normalizeUiStyle(state.settings.uiStyle));
      });
    }
    if (el.prefAccentColor) el.prefAccentColor.value = /^#[0-9a-fA-F]{6}$/.test(state.settings.accentColor || '') ? state.settings.accentColor : '#c96442';
    if (el.prefWidgetColor) el.prefWidgetColor.value = /^#[0-9a-fA-F]{6}$/.test(state.settings.widgetColor || '') ? state.settings.widgetColor : '#fcfbf7';
    if (el.prefSidebarColor) el.prefSidebarColor.value = /^#[0-9a-fA-F]{6}$/.test(state.settings.sidebarColor || '') ? state.settings.sidebarColor : '#efece4';
    if (el.prefGradientFrom) el.prefGradientFrom.value = /^#[0-9a-fA-F]{6}$/.test(state.settings.gradientFrom || '') ? state.settings.gradientFrom : '#191918';
    if (el.prefGradientTo) el.prefGradientTo.value = /^#[0-9a-fA-F]{6}$/.test(state.settings.gradientTo || '') ? state.settings.gradientTo : '#2a2a4a';
    if (el.prefGradientDir) el.prefGradientDir.value = state.settings.gradientDir || 'to bottom';
    applyCustomColors();
    applyGradient();
  }

  function openSettings(tab = 'providers') {
    closeModelPopover();
    closeAgentPopover();
    renderProviderList();
    renderSettingsAgents();
    renderSkillsSettings();
    renderPrefs();
    switchSettingsTab(tab);
    el.settingsModal.classList.add('open');
    el.settingsModal.setAttribute('aria-hidden', 'false');
  }

  function closeSettings() {
    el.settingsModal.classList.remove('open');
    el.settingsModal.setAttribute('aria-hidden', 'true');
  }

  async function savePreferences() {
    setBusy(el.savePrefs, true);
    try {
      const data = await api('/api/settings', {
        method: 'POST',
        body: {
          autoApprove: el.prefAuto.checked,
          autoRunEnabled: !!(el.prefAutoRun && el.prefAutoRun.checked),
          autoRunMessage: el.prefAutoRunMessage ? String(el.prefAutoRunMessage.value || '') : '',
          cwd: String(el.prefCwd.value || '').trim(),
          systemPrompt: String(el.prefSystem.value || ''),
          operatorName: String((el.prefOperatorName && el.prefOperatorName.value) || '').trim(),
          theme: state.settings.theme,
          uiStyle: normalizeUiStyle(state.settings.uiStyle),
          animation: normalizeAnimation(state.settings.animation),
          openMode: normalizeOpenMode(state.settings.openMode),
          tokenSaver: normalizeTokenSaver(state.settings.tokenSaver),
          fastMode: el.prefFast ? !!el.prefFast.checked : state.settings.fastMode !== false,
          accentColor: String(state.settings.accentColor || '').slice(0, 32),
          widgetColor: String(state.settings.widgetColor || '').slice(0, 32),
          sidebarColor: String(state.settings.sidebarColor || '').slice(0, 32),
        },
      });
      state.config = data;
      if (data.settings) {
        state.settings = { ...state.settings, ...data.settings };
        setAutoApprove(data.settings.autoApprove, false);
        applyUiStyle(data.settings.uiStyle || state.settings.uiStyle);
        applyTheme(data.settings.theme);
        applyAnimation(data.settings.animation || state.settings.animation);
      }
      renderPrefs();
      updateGreeting();
      state.autoRunFired = false;
      maybeAutoRun();
      toast('Preferências salvas.');
    } catch (error) {
      toast(error.message, 'error');
    } finally {
      setBusy(el.savePrefs, false);
    }
  }

  /* ============================================================
     Terminal
     ============================================================ */

  const TERM_WELCOME =
    'Trojan shell — PowerShell, CMD e WSL<br><span>digite um comando abaixo, use cd para navegar, ou peça no chat</span>';

  function closeMobileSidebar() {
    el.app.classList.remove('sidebar-mobile-open');
  }

  function syncSidebarToggle() {
    const collapsed = !!state.sidebarCollapsed;
    if (el.openSidebar) {
      el.openSidebar.title = collapsed ? 'Abrir painel' : 'Abrir painel';
      el.openSidebar.setAttribute('aria-label', collapsed ? 'Abrir painel' : 'Abrir painel');
    }
  }

  function toggleSidebar() {
    if (window.innerWidth <= 1000) {
      el.app.classList.toggle('sidebar-mobile-open');
      return;
    }
    state.sidebarCollapsed = !state.sidebarCollapsed;
    el.app.classList.toggle('sidebar-collapsed', state.sidebarCollapsed);
    syncSidebarToggle();
    saveUI();
  }

  /* ============================================================
     Terminal — PowerShell / CMD / WSL + sessão elevada
     ============================================================ */

  const TERM_TEMP_FOLDER = 'trojan-shell';
  const TERM_WORKER_VERSION = 'lab-8';

  // Worker elevado: loop de arquivos em %TEMP%\trojan-shell.
  // Fica residente depois do UAC, então cada comando admin não pede elevação de novo.
  const TERM_WORKER_SOURCE = [
    "param([int]$Port = 0)",
    "",
    "$ErrorActionPreference = 'Continue'",
    "$ProgressPreference = 'SilentlyContinue'",
    "$dir = Split-Path -Parent $MyInvocation.MyCommand.Path",
    "$utf8 = New-Object System.Text.UTF8Encoding($false)",
    "$oemEnc = [Console]::OutputEncoding",
    "$nl = [Environment]::NewLine",
    "$req = Join-Path $dir 'req.txt'",
    "$beat = Join-Path $dir 'beat.txt'",
    "",
    "$isAdmin = '0'",
    "try {",
    "  $wid = [Security.Principal.WindowsIdentity]::GetCurrent()",
    "  $wp = New-Object Security.Principal.WindowsPrincipal($wid)",
    "  if ($wp.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) { $isAdmin = '1' }",
    "} catch { }",
    "",
    "function Invoke-Job([string]$jobId, [string]$command, [string]$shellName, [string]$startCwd) {",
    "  if (-not $shellName) { $shellName = 'ps' }",
    "  if (-not $startCwd) { $startCwd = $env:USERPROFILE }",
    "  $start = Get-Date",
    "  $out = ''",
    "  $code = 0",
    "  $action = 'run'",
    "  $cwdOut = $startCwd",
    "  $text = $command.Trim()",
    "",
    "  if ($text -match '^(?i)cd(\\s.*)?$') {",
    "    $target = $text.Substring(2).Trim()",
    "    if (-not $target) { $target = $env:USERPROFILE }",
    "    $resolved = $null",
    "    try {",
    "      $target = $ExecutionContext.InvokeCommand.ExpandString($target)",
    "      Push-Location -LiteralPath $startCwd -ErrorAction SilentlyContinue",
    "      $resolved = (Resolve-Path -LiteralPath $target -ErrorAction Stop).Path",
    "    } catch {",
    "      $out = 'cd: ' + $_.Exception.Message",
    "      $code = 1",
    "    } finally {",
    "      Pop-Location -ErrorAction SilentlyContinue",
    "    }",
    "    if ($resolved) {",
    "      if (Test-Path -LiteralPath $resolved -PathType Leaf) { $resolved = Split-Path -Parent $resolved }",
    "      $cwdOut = $resolved",
    "      $action = 'cwd'",
    "    }",
    "  } elseif ($text -match '^(?i)(clear|cls)$') {",
    "    $action = 'clear'",
    "  } else {",
    "    $exe = 'powershell.exe'",
    "    $argLine = ''",
    "    $bat = ''",
    "    if ($shellName -eq 'cmd') {",
    "      $bat = Join-Path $dir ('j-' + $jobId + '.cmd')",
    "      $body = '@echo off' + $nl + $command + $nl",
    "      [IO.File]::WriteAllText($bat, $body, $oemEnc)",
    "      $exe = 'cmd.exe'",
    "      $argLine = '/d /s /c \"' + $bat + '\"'",
    "    } elseif ($shellName -eq 'wsl') {",
    "      $exe = 'wsl.exe'",
    "      $inner = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($command))",
    "      $argLine = '-e sh -lc \"echo ' + $inner + ' | base64 -d | sh\"'",
    "    }",
    "",
    "    if ($shellName -eq 'ps') {",
    "      $prevErr = $Error.Count",
    "      $global:LASTEXITCODE = 0",
    "      try { Set-Location -LiteralPath $startCwd -ErrorAction Stop } catch { }",
    "      try {",
    "        $sb = [scriptblock]::Create($command)",
    "        $out = (& $sb 2>&1 | Out-String -Width 4096)",
    "      } catch {",
    "        $out += ($_ | Out-String)",
    "      }",
    "      if ($LASTEXITCODE -ne 0) { $code = [int]$LASTEXITCODE } elseif ($Error.Count -gt $prevErr) { $code = 1 }",
    "    } else {",
    "      try {",
    "        $limit = 900000",
    "        if ($shellName -eq 'wsl') { $limit = 120000 }",
    "        $psi = New-Object System.Diagnostics.ProcessStartInfo",
    "        $psi.FileName = $exe",
    "        $psi.Arguments = $argLine",
    "        $psi.WorkingDirectory = $startCwd",
    "        $psi.UseShellExecute = $false",
    "        $psi.CreateNoWindow = $true",
    "        $psi.RedirectStandardOutput = $true",
    "        $psi.RedirectStandardError = $true",
    "        if ($shellName -eq 'cmd') {",
    "          $psi.StandardOutputEncoding = $oemEnc",
    "          $psi.StandardErrorEncoding = $oemEnc",
    "        } else {",
    "          $psi.StandardOutputEncoding = $utf8",
    "          $psi.StandardErrorEncoding = $utf8",
    "        }",
    "        $proc = [System.Diagnostics.Process]::Start($psi)",
    "        $outTask = $proc.StandardOutput.ReadToEndAsync()",
    "        $errTask = $proc.StandardError.ReadToEndAsync()",
    "        if (-not $proc.WaitForExit($limit)) {",
    "          try { $proc.Kill() } catch { }",
    "          $code = 124",
    "        } else {",
    "          $code = $proc.ExitCode",
    "        }",
    "        $out = $outTask.Result",
    "        $errText = $errTask.Result",
    "        if ($errText -and $errText.Trim().Length -gt 0) {",
    "          if ($out.Length -gt 0) { $out += $nl }",
    "          $out += $errText",
    "        }",
    "      } catch {",
    "        $out += ($_ | Out-String)",
    "        $code = 1",
    "      } finally {",
    "        if ($bat -and (Test-Path $bat)) { Remove-Item $bat -Force -ErrorAction SilentlyContinue }",
    "      }",
    "    }",
    "  }",
    "",
    "  $ms = [int]((Get-Date) - $start).TotalMilliseconds",
    "  return [ordered]@{",
    "    id = $jobId",
    "    ok = ($code -eq 0)",
    "    code = $code",
    "    output = $out",
    "    cwd = $cwdOut",
    "    shell = $shellName",
    "    action = $action",
    "    duration = $ms",
    "  }",
    "}",
    "",
    "function Read-Http($stream) {",
    "  $buf = New-Object byte[] 8192",
    "  $ms = New-Object System.IO.MemoryStream",
    "  $end = -1",
    "  $text = ''",
    "  while ($end -lt 0) {",
    "    $n = $stream.Read($buf, 0, $buf.Length)",
    "    if ($n -le 0) { return $null }",
    "    $ms.Write($buf, 0, $n)",
    "    $text = [Text.Encoding]::ASCII.GetString($ms.ToArray())",
    "    $end = $text.IndexOf(\"`r`n`r`n\")",
    "  }",
    "  $head = $text.Substring(0, $end)",
    "  $bodyStart = $end + 4",
    "  $all = $ms.ToArray()",
    "  $len = 0",
    "  foreach ($line in ($head -split \"`r`n\")) {",
    "    if ($line -match '^(?i)content-length:\\s*(\\d+)') { $len = [int]$matches[1] }",
    "  }",
    "  $body = New-Object byte[] $len",
    "  $have = $all.Length - $bodyStart",
    "  $got = 0",
    "  if ($have -gt 0) {",
    "    $got = [Math]::Min($have, $len)",
    "    [Array]::Copy($all, $bodyStart, $body, 0, $got)",
    "  }",
    "  while ($got -lt $len) {",
    "    $n = $stream.Read($body, $got, $len - $got)",
    "    if ($n -le 0) { break }",
    "    $got += $n",
    "  }",
    "  $first = ($head -split \"`r`n\")[0]",
    "  $token = ''",
    "  if ($head -match '(?im)^x-trojan-token:\\s*(\\S+)') { $token = $matches[1] }",
    "  return @{ line = $first; body = $utf8.GetString($body); token = $token }",
    "}",
    "",
    "function Send-Response($stream, [int]$status, [string]$statusText, [string]$body) {",
    "  $bytes = $utf8.GetBytes($body)",
    "  $head = \"HTTP/1.1 $status $statusText`r`nContent-Type: application/json; charset=utf-8`r`nAccess-Control-Allow-Origin: *`r`nAccess-Control-Allow-Headers: content-type, x-trojan-token`r`nAccess-Control-Allow-Methods: POST, GET, OPTIONS`r`nAccess-Control-Max-Age: 600`r`nContent-Length: $($bytes.Length)`r`nConnection: close`r`n`r`n\"",
    "  $hb = [Text.Encoding]::ASCII.GetBytes($head)",
    "  $stream.Write($hb, 0, $hb.Length)",
    "  $stream.Write($bytes, 0, $bytes.Length)",
    "  $stream.Flush()",
    "}",
    "",
    "[IO.File]::WriteAllText((Join-Path $dir 'admin.txt'), [string]$isAdmin, $utf8)",
    "[IO.File]::WriteAllText((Join-Path $dir 'pid.txt'), [string]$PID, $utf8)",
    "$token = [guid]::NewGuid().ToString('N')",
    "[IO.File]::WriteAllText((Join-Path $dir 'token.txt'), $token, $utf8)",
    "",
    "$listener = $null",
    "$bound = 0",
    "if ($Port -gt 0) {",
    "  for ($p = $Port; $p -lt ($Port + 10); $p++) {",
    "    try {",
    "      $candidate = New-Object System.Net.Sockets.TcpListener([Net.IPAddress]::Loopback, $p)",
    "      $candidate.Start()",
    "      $listener = $candidate",
    "      $bound = $p",
    "      break",
    "    } catch { }",
    "  }",
    "}",
    "[IO.File]::WriteAllText((Join-Path $dir 'port.txt'), [string]$bound, $utf8)",
    "",
    "while ($true) {",
    "  $busy = $false",
    "  try {",
    "    if ($listener -and $listener.Pending()) {",
    "      $busy = $true",
    "      $client = $listener.AcceptTcpClient()",
    "      try {",
    "        $stream = $client.GetStream()",
    "        $stream.ReadTimeout = 20000",
    "        $stream.WriteTimeout = 20000",
    "        $reqObj = Read-Http $stream",
    "        if ($reqObj) {",
    "          $line = [string]$reqObj.line",
    "          if ($line -match '^OPTIONS') {",
    "            Send-Response $stream 204 'No Content' ''",
    "          } elseif ($line -match '^GET /health') {",
    "            $payload = [ordered]@{ ok = $true; pid = $PID; admin = ($isAdmin -eq '1'); port = $bound } | ConvertTo-Json -Compress",
    "            Send-Response $stream 200 'OK' $payload",
    "          } elseif ($line -match '^POST /run') {",
    "            if ([string]$reqObj.token -ne $token) {",
    "              Send-Response $stream 403 'Forbidden' '{\"ok\":false,\"error\":\"token invalido\"}'",
    "            } else {",
    "              $job = $null",
    "              try { $job = $reqObj.body | ConvertFrom-Json } catch { }",
    "              if (-not $job) {",
    "                Send-Response $stream 400 'Bad Request' '{\"ok\":false,\"error\":\"json invalido\"}'",
    "              } else {",
    "                $result = Invoke-Job ([string]$job.id) ([string]$job.command) ([string]$job.shell) ([string]$job.cwd)",
    "                Send-Response $stream 200 'OK' ($result | ConvertTo-Json -Compress -Depth 4)",
    "              }",
    "            }",
    "          } elseif ($line -match '^POST /kill') {",
    "            Send-Response $stream 200 'OK' '{\"ok\":true}'",
    "            try { $client.Close() } catch { }",
    "            exit 0",
    "          } else {",
    "            Send-Response $stream 404 'Not Found' '{\"ok\":false}'",
    "          }",
    "        }",
    "      } catch { } finally {",
    "        try { $client.Close() } catch { }",
    "      }",
    "    }",
    "  } catch { }",
    "",
    "  if (-not $busy) {",
    "    try {",
    "      [IO.File]::WriteAllText($beat, ([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()).ToString(), $utf8)",
    "      if (Test-Path $req) {",
    "        $raw = ''",
    "        for ($i = 0; $i -lt 20; $i++) {",
    "          try { $raw = [IO.File]::ReadAllText($req, $utf8); break } catch { Start-Sleep -Milliseconds 40 }",
    "        }",
    "        if ($raw -and $raw.Trim().Length -gt 0) {",
    "          $job = $null",
    "          try { $job = $raw | ConvertFrom-Json } catch { }",
    "          if ($job) {",
    "            Remove-Item $req -Force -ErrorAction SilentlyContinue",
    "            $result = Invoke-Job ([string]$job.id) ([string]$job.command) ([string]$job.shell) ([string]$job.cwd)",
    "            $json = $result | ConvertTo-Json -Compress -Depth 4",
    "            [IO.File]::WriteAllText((Join-Path $dir ('res-' + [string]$job.id + '.txt')), [Convert]::ToBase64String($utf8.GetBytes($json)), $utf8)",
    "          }",
    "        }",
    "      }",
    "    } catch { }",
    "    Start-Sleep -Milliseconds 15",
    "  }",
    "}",
  ].join('\n');

  const TERM_SHELLS = ['ps', 'cmd', 'wsl'];

  function psQuote(value) {
    return `'${String(value === undefined || value === null ? '' : value).replace(/'/g, "''")}'`;
  }

  let termWslProbe = null;

  function probeWsl() {
    if (!termWslProbe) {
      const script = [
        '[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)',
        'try {',
        '  $__psi = New-Object System.Diagnostics.ProcessStartInfo',
        "  $__psi.FileName = 'wsl.exe'",
        "  $__psi.Arguments = '-l -q'",
        '  $__psi.UseShellExecute = $false',
        '  $__psi.CreateNoWindow = $true',
        '  $__psi.RedirectStandardOutput = $true',
        '  $__psi.RedirectStandardError = $true',
        '  $__proc = [System.Diagnostics.Process]::Start($__psi)',
        '  $__task = $__proc.StandardOutput.ReadToEndAsync()',
        "  if (-not $__proc.WaitForExit(8000)) { try { $__proc.Kill() } catch { }; 'NO'; exit 0 }",
        '  $__body = $__task.Result',
        "  if ($__proc.ExitCode -eq 0 -and $__body.Trim().Length -gt 0) { 'YES' } else { 'NO' }",
        "} catch { 'NO' }",
      ].join('\n');
      termWslProbe = execLocal(script)
        .then((info) => /YES/.test(info.text))
        .catch(() => false);
    }
    return termWslProbe;
  }

  function b64Utf8(text) {
    return btoa(unescape(encodeURIComponent(String(text))));
  }

  function b64Cp1252(text) {
    const src = String(text);
    let bin = '';
    for (let i = 0; i < src.length; i += 1) {
      const code = src.charCodeAt(i);
      bin += String.fromCharCode(code <= 255 ? code : 63);
    }
    return btoa(bin);
  }

  function decodeBase64Utf8(text) {
    const clean = String(text || '').trim();
    if (!clean) return '';
    const bin = atob(clean);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder('utf-8').decode(bytes);
  }

  function parseExecPayload(raw) {
    const text = String(raw === undefined || raw === null ? '' : raw);
    const head = /^exit_code:\s*(-?\d+)\s*\nduration_ms:\s*(\d+)\s*\n(?:\n)?/.exec(text);
    if (!head) return { code: null, ms: null, out: text, err: '', text };
    let body = text.slice(head[0].length);
    let err = '';
    const marker = '\n\nstderr:\n';
    const idx = body.indexOf(marker);
    if (idx >= 0) {
      err = body.slice(idx + marker.length);
      body = body.slice(0, idx);
    }
    if (body.indexOf('stdout:\n') === 0) body = body.slice(8);
    if (body.trim() === '(vazio)') body = '';
    if (err.trim() === '(vazio)') err = '';
    return {
      code: Number(head[1]),
      ms: Number(head[2]),
      out: body,
      err,
      text: `${body}${err ? (body ? '\n' : '') + err : ''}`,
    };
  }

  async function execLocal(script) {
    const data = await api('/api/exec', { method: 'POST', body: { command: script } });
    return parseExecPayload(data.output);
  }

  function consumeTermMarkers(text) {
    const lines = String(text || '').split(/\r?\n/);
    const kept = [];
    const result = { cwd: '', clear: false, text: '' };
    lines.forEach((line) => {
      if (line.indexOf('__CWD__') === 0) {
        result.cwd = line.slice(7).trim();
        return;
      }
      if (line.trim() === '__CLEAR__') {
        result.clear = true;
        return;
      }
      kept.push(line);
    });
    result.text = kept.join('\n').replace(/^\n+/, '').replace(/\s+$/, '');
    return result;
  }

  function shortCwd() {
    let path = state.termCwd || '';
    if (!path) return '';
    const home = /^[a-zA-Z]:\\Users\\[^\\]+/i.exec(path);
    if (home) path = `~${path.slice(home[0].length)}`;
    path = path.replace(/\\/g, '/');
    if (path.length > 26) path = `…${path.slice(-25)}`;
    return path;
  }

  function renderTermPrompt() {
    if (!el.termPrompt) return;
    const label = state.termShell === 'ps' ? 'PS' : state.termShell === 'cmd' ? 'CMD' : 'WSL';
    const path = shortCwd();
    el.termPrompt.textContent = `${path ? `${path} ` : ''}${label} ${state.termAdmin ? '#' : '>'}`;
    el.termPrompt.title = state.termCwd || 'diretório inicial';
    el.termPrompt.classList.toggle('admin', state.termAdmin);
    if (el.termBadge) el.termBadge.hidden = !state.termAdmin;
    if (el.termAdminToggle) {
      el.termAdminToggle.setAttribute('aria-pressed', state.termAdmin ? 'true' : 'false');
      el.termAdminToggle.classList.toggle('on', state.termAdmin);
    }
    if (el.termAdminLabel) el.termAdminLabel.textContent = state.termAdmin ? 'ADMIN' : 'usuário';
    if (el.termTabs) {
      Array.prototype.forEach.call(el.termTabs.querySelectorAll('.term-tab'), (tab) => {
        tab.classList.toggle('active', tab.dataset.shell === state.termShell);
      });
    }
  }

  function setTermShell(shell) {
    if (!TERM_SHELLS.includes(shell)) return;
    if (shell === 'wsl') {
      probeWsl().then((available) => {
        if (available) return;
        toast('WSL não está disponível neste PC.', 'error');
        if (el.termTabs) {
          const tab = el.termTabs.querySelector('.term-tab[data-shell="wsl"]');
          if (tab) tab.hidden = true;
        }
        if (state.termShell === 'wsl') {
          state.termShell = 'ps';
          renderTermPrompt();
        }
      });
    }
    state.termShell = shell;
    try {
      localStorage.setItem('trojan.term.shell', shell);
    } catch {
      /* storage indisponível */
    }
    renderTermPrompt();
  }

  function toggleTerminal(force) {
    const open = force === undefined ? !state.termOpen : !!force;
    state.termOpen = open;
    el.terminalPanel.classList.toggle('open', open);
    el.terminalPanel.setAttribute('aria-hidden', open ? 'false' : 'true');
    el.terminalChip.classList.toggle('active', open);
    if (open) {
      renderTermPrompt();
      setTimeout(() => el.termInput.focus(), 340);
    }
  }

  function termNote(text) {
    const line = document.createElement('div');
    line.className = 'term-note';
    line.textContent = String(text);
    el.termLog.append(line);
    el.termLog.scrollTop = el.termLog.scrollHeight;
  }

  function termEntry(command, admin, shell) {
    const entry = document.createElement('div');
    entry.className = `term-entry${admin ? ' admin' : ''}`;
    const tag = shell === 'ps' ? 'PS' : shell === 'cmd' ? 'CMD' : 'WSL';
    entry.innerHTML =
      `<div class="term-cmd"><span class="p">${escapeHtml(tag)} ${admin ? '#' : '&gt;'}</span><span class="cmd-text"></span></div>` +
      `<div class="term-running"><span class="spin"></span><span>executando…</span></div>`;
    entry.querySelector('.cmd-text').textContent = command;
    el.termLog.append(entry);
    el.termLog.scrollTop = el.termLog.scrollHeight;
    return entry;
  }

  function termFinish(entry, result) {
    if (!entry) return;
    const running = entry.querySelector('.term-running');
    if (running) running.remove();
    const output = String(result.output || '');
    const pre = document.createElement('pre');
    pre.className = `term-out${result.ok ? '' : ' error'}`;
    pre.textContent = output.trim() ? output : '(sem saída)';
    entry.append(pre);

    const meta = result.meta || {};
    const bits = [];
    if (meta.exitCode !== undefined && meta.exitCode !== null) bits.push(`exit ${meta.exitCode}`);
    if (meta.duration) bits.push(formatDuration(meta.duration));
    if (meta.timedOut) bits.push('timeout');
    if (bits.length) {
      const line = document.createElement('div');
      line.className = 'term-meta';
      line.textContent = bits.join('  ·  ');
      entry.append(line);
    }
    el.termLog.scrollTop = el.termLog.scrollHeight;
  }

  const TERM_PROFILES = {
    user: { folder: 'trojan-shell-user', elevate: false, port: 4318 },
    admin: { folder: 'trojan-shell', elevate: true, port: 4319 },
  };

  function ensureWorkerScript(profile) {
    const conf = TERM_PROFILES[profile];
    const workerB64 = b64Utf8(TERM_WORKER_SOURCE);
    const argList = `('-NoLogo','-NoProfile','-ExecutionPolicy','Bypass','-File',$script,'-Port','${conf.port}')`;
    const startLine = conf.elevate
      ? `  Start-Process -FilePath 'powershell.exe' -Verb RunAs -WindowStyle Hidden -ArgumentList ${argList}`
      : `  Start-Process -FilePath 'powershell.exe' -WindowStyle Hidden -ArgumentList ${argList}`;
    return [
      "$ErrorActionPreference = 'SilentlyContinue'",
      `$d = Join-Path $env:TEMP ${psQuote(conf.folder)}`,
      'New-Item -ItemType Directory -Path $d -Force | Out-Null',
      "$script = Join-Path $d 'worker.ps1'",
      "$ver = Join-Path $d 'worker.ver'",
      `$marker = ${psQuote(TERM_WORKER_VERSION)}`,
      "$current = ''",
      'if (Test-Path $ver) { $current = (Get-Content $ver -Raw).Trim() }',
      'if ($current -ne $marker) {',
      `  [IO.File]::WriteAllBytes($script, [Convert]::FromBase64String(${psQuote(workerB64)}))`,
      '  Set-Content -Path $ver -Value $marker -Encoding ASCII',
      '}',
      'function Get-WorkerMeta {',
      "  $pf = Join-Path $d 'pid.txt'",
      "  $xf = Join-Path $d 'port.txt'",
      "  $tf = Join-Path $d 'token.txt'",
      '  if (-not (Test-Path $pf)) { return $null }',
      '  if (-not (Test-Path $xf)) { return $null }',
      '  if (-not (Test-Path $tf)) { return $null }',
      "  $raw = ''",
      '  try { $raw = (Get-Content $pf -Raw).Trim() } catch { return $null }',
      '  $n = 0',
      '  if (-not [int]::TryParse($raw, [ref]$n)) { return $null }',
      '  if (-not (Get-Process -Id $n -ErrorAction SilentlyContinue)) { return $null }',
      "  $port = ''",
      "  $token = ''",
      '  try { $port = (Get-Content $xf -Raw).Trim() } catch { }',
      '  try { $token = (Get-Content $tf -Raw).Trim() } catch { }',
      "  return ('READY ' + $n + ' ' + $port + ' ' + $token)",
      '}',
      '$ready = Get-WorkerMeta',
      'if ($ready) { $ready; exit 0 }',
      "Remove-Item (Join-Path $d 'pid.txt'),(Join-Path $d 'port.txt'),(Join-Path $d 'token.txt') -Force -ErrorAction SilentlyContinue",
      'try {',
      startLine,
      '} catch {',
      "  'FAIL ' + $_.Exception.Message",
      '  exit 0',
      '}',
      '$deadline = (Get-Date).AddSeconds(55)',
      'while ((Get-Date) -lt $deadline) {',
      '  Start-Sleep -Milliseconds 250',
      '$ready = Get-WorkerMeta',
      '  if ($ready) { $ready; exit 0 }',
      '}',
      conf.elevate ? "'FAIL tempo esgotado aguardando o UAC'" : "'FAIL o shell não iniciou'",
    ].join('\n');
  }

  function workerWaitScript(profile, id, waitMs) {
    return [
      "$ErrorActionPreference = 'SilentlyContinue'",
      `$d = Join-Path $env:TEMP ${psQuote(TERM_PROFILES[profile].folder)}`,
      "$pf = Join-Path $d 'pid.txt'",
      '$alive = $false',
      'if (Test-Path $pf) {',
      "  $rawPid = ''",
      '  try { $rawPid = (Get-Content $pf -Raw).Trim() } catch { }',
      '  $n = 0',
      '  if ([int]::TryParse($rawPid, [ref]$n)) { if (Get-Process -Id $n -ErrorAction SilentlyContinue) { $alive = $true } }',
      '}',
      "if (-not $alive) { 'DEAD'; exit 0 }",
      `$res = Join-Path $d ${psQuote(`res-${id}.txt`)}`,
      `$deadline = (Get-Date).AddMilliseconds(${Math.max(1000, waitMs | 0)})`,
      'while (-not (Test-Path $res) -and (Get-Date) -lt $deadline) { Start-Sleep -Milliseconds 60 }',
      'if (Test-Path $res) {',
      "  $body = ''",
      '  try { $body = [IO.File]::ReadAllText($res) } catch { }',
      '  Remove-Item $res -Force -ErrorAction SilentlyContinue',
      "  'OK ' + $body",
      '} else {',
      "  'PENDING'",
      '}',
    ].join('\n');
  }

  function workerSubmitScript(profile, id, command, shell, cwd) {
    const job = b64Utf8(JSON.stringify({ id, command, shell, cwd: cwd || '' }));
    return [
      "$ErrorActionPreference = 'SilentlyContinue'",
      `$d = Join-Path $env:TEMP ${psQuote(TERM_PROFILES[profile].folder)}`,
      'New-Item -ItemType Directory -Path $d -Force | Out-Null',
      `$job = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String(${psQuote(job)}))`,
      "Remove-Item (Join-Path $d 'req.txt') -Force -ErrorAction SilentlyContinue",
      "[IO.File]::WriteAllText((Join-Path $d 'req.txt'), $job, (New-Object System.Text.UTF8Encoding($false)))",
      workerWaitScript(profile, id, 20000).split('\n').slice(2).join('\n'),
    ].join('\n');
  }

  async function ensureWorkerSession(profile) {
    const info = await execLocal(ensureWorkerScript(profile));
    const ready = /READY\s+(\d+)\s+(\d+)\s+([0-9a-fA-F]*)/.exec(info.text);
    if (ready) {
      state.termPids[profile] = Number(ready[1]);
      state.termPorts[profile] = Number(ready[2]) || 0;
      state.termTokens[profile] = ready[3] || '';
      return state.termPids[profile];
    }
    const fail = /FAIL\s*(.*)/.exec(info.text);
    throw new Error(fail ? fail[1].trim() : 'não foi possível abrir o shell');
  }

  async function runHttpCommand(profile, command, shell) {
    const port = state.termPorts[profile];
    const token = state.termTokens[profile] || '';
    if (!port) throw new Error('sem porta');
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), shell === 'wsl' ? 150000 : 900000);
    try {
      const res = await fetch(`http://127.0.0.1:${port}/run`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-trojan-token': token },
        body: JSON.stringify({ id: makeId('h'), command, shell, cwd: state.termCwd }),
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return {
        ok: !!data.ok,
        output: String(data.output || ''),
        action: data.action || 'run',
        cwd: data.cwd || state.termCwd,
        meta: { exitCode: data.code, duration: data.duration },
      };
    } finally {
      clearTimeout(timer);
    }
  }

  async function runWorkerCommand(profile, command, shell) {
    if (!state.termPids[profile]) await ensureWorkerSession(profile);
    if (state.termPorts[profile]) {
      try {
        return await runHttpCommand(profile, command, shell);
      } catch {
        /* socket indisponível — cai para o protocolo de arquivos */
      }
    }
    const id = makeId('j');
    let info = await execLocal(workerSubmitScript(profile, id, command, shell, state.termCwd));
    let raw = (info.text || '').trim();
    let guard = 0;
    while (!raw.startsWith('OK ') && raw !== 'DEAD' && guard < 40) {
      guard += 1;
      if (raw && !raw.startsWith('PENDING')) break;
      info = await execLocal(workerWaitScript(profile, id, 18000));
      raw = (info.text || '').trim();
    }
    if (raw === 'DEAD') {
      state.termPids[profile] = 0;
      throw new Error(
        profile === 'admin'
          ? 'sessão elevada encerrada — reative o modo admin'
          : 'o shell encerrou — tente novamente',
      );
    }
    if (!raw.startsWith('OK ')) throw new Error('sem resposta do shell');
    const data = JSON.parse(decodeBase64Utf8(raw.slice(3)));
    return {
      ok: !!data.ok,
      output: String(data.output || ''),
      action: data.action || 'run',
      cwd: data.cwd || state.termCwd,
      meta: { exitCode: data.code, duration: data.duration },
    };
  }

  function wrappedShellScript(shell, command) {
    const id = makeId('x');
    const lines = [
      '$__oem = [Console]::OutputEncoding',
      '$__utf8 = New-Object System.Text.UTF8Encoding($false)',
      '$__stdout = [Console]::OpenStandardOutput()',
      'function __emit([string]$__s) { $__b = $__utf8.GetBytes($__s); $__stdout.Write($__b, 0, $__b.Length); $__stdout.Flush() }',
      `$__dir = Join-Path $env:TEMP ${psQuote(TERM_TEMP_FOLDER)}`,
      'New-Item -ItemType Directory -Path $__dir -Force | Out-Null',
      `$__cmd = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String(${psQuote(b64Utf8(command))}))`,
      `$__cwd = ${psQuote(state.termCwd || '')}`,
      'if (-not $__cwd) { $__cwd = $env:USERPROFILE }',
      '$__text = $__cmd.Trim()',
      `$__isCd = $__text -match '^(?i)cd(\\s.*)?$'`,
      'if ($__isCd) {',
      '  $__target = $__text.Substring(2).Trim()',
      '  if (-not $__target) { $__target = $env:USERPROFILE }',
      '  try {',
      '    $__target = $ExecutionContext.InvokeCommand.ExpandString($__target)',
      '    Push-Location -LiteralPath $__cwd -ErrorAction SilentlyContinue',
      '    $__res = (Resolve-Path -LiteralPath $__target -ErrorAction Stop).Path',
      '    Pop-Location -ErrorAction SilentlyContinue',
      '    if (Test-Path -LiteralPath $__res -PathType Leaf) { $__res = Split-Path -Parent $__res }',
      "    __emit ('__CWD__' + $__res)",
      '    exit 0',
      '  } catch {',
      "    __emit ('cd: ' + $_.Exception.Message)",
      '    exit 1',
      '  }',
      '}',
      `$__isClear = $__text -match '^(?i)(clear|cls)$'`,
      "if ($__isClear) { __emit '__CLEAR__'; exit 0 }",
    ];

    if (shell === 'cmd') {
      lines.push(`$__file = Join-Path $__dir ${psQuote(`x-${id}.cmd`)}`);
      lines.push(`$__body = '@echo off' + [Environment]::NewLine + ${psQuote(command)} + [Environment]::NewLine`);
      lines.push('[IO.File]::WriteAllText($__file, $__body, $__oem)');
      lines.push("$__exe = 'cmd.exe'");
      lines.push("$__argLine = '/d /s /c \"' + $__file + '\"'");
    } else if (shell === 'wsl') {
      const inner = b64Utf8(command);
      lines.push("$__exe = 'wsl.exe'");
      lines.push(`$__argLine = '-e sh -lc "echo ${inner} | base64 -d | sh"'`);
    }

    lines.push('$__code = 0');
    lines.push("$__out = ''");

    if (shell === 'ps') {
      lines.push('$__prevErr = $Error.Count');
      lines.push('$global:LASTEXITCODE = 0');
      lines.push('try { Set-Location -LiteralPath $__cwd -ErrorAction Stop } catch { }');
      lines.push('try {');
      lines.push('  $__sb = [scriptblock]::Create($__cmd)');
      lines.push('  $__out = (& $__sb 2>&1 | Out-String -Width 4096)');
      lines.push('} catch {');
      lines.push('  $__out += ($_ | Out-String)');
      lines.push('}');
      lines.push('if ($LASTEXITCODE -ne 0) { $__code = [int]$LASTEXITCODE } elseif ($Error.Count -gt $__prevErr) { $__code = 1 }');
      lines.push('__emit $__out');
      lines.push('exit $__code');
      return lines.join('\n');
    }

    lines.push('try {');
    lines.push('  $__psi = New-Object System.Diagnostics.ProcessStartInfo');
    lines.push('  $__psi.FileName = $__exe');
    lines.push('  $__psi.Arguments = $__argLine');
    lines.push('  $__psi.WorkingDirectory = $__cwd');
    lines.push('  $__psi.UseShellExecute = $false');
    lines.push('  $__psi.CreateNoWindow = $true');
    lines.push('  $__psi.RedirectStandardOutput = $true');
    lines.push('  $__psi.RedirectStandardError = $true');
    if (shell === 'cmd') {
      lines.push('  $__psi.StandardOutputEncoding = $__oem');
      lines.push('  $__psi.StandardErrorEncoding = $__oem');
    } else {
      lines.push('  $__psi.StandardOutputEncoding = [Text.UTF8Encoding]::new($false)');
      lines.push('  $__psi.StandardErrorEncoding = [Text.UTF8Encoding]::new($false)');
    }
    lines.push('  $__proc = [System.Diagnostics.Process]::Start($__psi)');
    lines.push('  $__outTask = $__proc.StandardOutput.ReadToEndAsync()');
    lines.push('  $__errTask = $__proc.StandardError.ReadToEndAsync()');
    lines.push(`  $__limit = ${shell === 'wsl' ? 120000 : 600000}`);
    lines.push('  if (-not $__proc.WaitForExit($__limit)) { try { $__proc.Kill() } catch { }; $__code = 124 } else { $__code = $__proc.ExitCode }');
    lines.push('  $__out = $__outTask.Result');
    lines.push('  $__err = $__errTask.Result');
    lines.push('  if ($__err -and $__err.Trim().Length -gt 0) { if ($__out.Length -gt 0) { $__out += [Environment]::NewLine }; $__out += $__err }');
    lines.push('} catch {');
    lines.push('  $__out = $_ | Out-String');
    lines.push('  $__code = 1');
    lines.push('}');
    lines.push('Remove-Item $__file -Force -ErrorAction SilentlyContinue');
    lines.push('__emit $__out');
    lines.push('exit $__code');
    return lines.join('\n');
  }

  async function runLocalCommand(command, shell) {
    try {
      if (!state.termPids.user) await ensureWorkerSession('user');
    } catch {
      const info = await execLocal(wrappedShellScript(shell, command));
      return {
        ok: info.code === 0,
        output: info.out,
        action: 'run',
        cwd: state.termCwd,
        meta: { exitCode: info.code, duration: info.ms },
      };
    }
    return runWorkerCommand('user', command, shell);
  }

  async function setTermAdmin(force) {
    const target = force === undefined ? !state.termAdmin : !!force;
    if (!target) {
      state.termAdmin = false;
      renderTermPrompt();
      termNote('modo usuário — comandos voltam a rodar sem elevação');
      return false;
    }
    if (state.termAdmin) return true;
    if (state.termElevating) return false;
    state.termElevating = true;
    if (el.termAdminToggle) el.termAdminToggle.classList.add('busy');
    termNote('abrindo shell elevado — aprove o UAC');
    try {
      await ensureWorkerSession('admin');
      state.termAdmin = true;
      termNote('sessão elevada ativa — comandos agora rodam como administrador');
      toast('Shell elevado ativo.');
      return true;
    } catch (err) {
      state.termAdmin = false;
      termNote(`elevação falhou: ${(err && err.message) || err}`);
      toast(`Elevação falhou: ${(err && err.message) || err}`, 'error');
      return false;
    } finally {
      state.termElevating = false;
      if (el.termAdminToggle) el.termAdminToggle.classList.remove('busy');
      renderTermPrompt();
    }
  }

  function applyTermResult(entry, result) {
    const parsed = consumeTermMarkers(result.output || '');
    if (parsed.cwd) state.termCwd = parsed.cwd;
    if (result.cwd && !parsed.cwd) state.termCwd = result.cwd;
    if (parsed.clear) {
      clearTerminal();
      renderTermPrompt();
      return;
    }
    termFinish(entry, { ok: result.ok, output: parsed.text, meta: result.meta });
    renderTermPrompt();
    if (el.termLed) {
      el.termLed.classList.add('done');
      setTimeout(() => el.termLed.classList.remove('done'), 700);
    }
  }

  function sendTermCommand(raw) {
    const command = String(raw || '').trim();
    if (!command) return;
    if (state.termHistory[state.termHistory.length - 1] !== command) {
      state.termHistory.push(command);
      if (state.termHistory.length > 120) state.termHistory.shift();
    }
    state.termIndex = -1;

    const shell = state.termShell;
    const admin = state.termAdmin;
    const entry = termEntry(command, admin, shell);
    state.termQueue = state.termQueue
      .then(async () => {
        if (admin && !state.termPids.admin) {
          const ok = await setTermAdmin(true);
          if (!ok) throw new Error('elevação cancelada');
        }
        const result = admin
          ? await runWorkerCommand('admin', command, shell)
          : await runLocalCommand(command, shell);
        applyTermResult(entry, result);
      })
      .catch((err) => {
        termFinish(entry, { ok: false, output: `erro: ${(err && err.message) || err}` });
      });
  }

  function clearTerminal() {
    el.termLog.innerHTML = `<div class="term-welcome">${TERM_WELCOME}</div>`;
  }

  function onExecResult(event) {
    const entry = state.execEntries.get(event.id);
    if (!entry) return;
    termFinish(entry, event);
    state.execEntries.delete(event.id);
    if (el.termLed) {
      el.termLed.classList.add('done');
      setTimeout(() => el.termLed.classList.remove('done'), 700);
    }
  }

  /* ============================================================
     Sistema
     ============================================================ */

  async function pollSystem() {
    try {
      const data = await api('/api/system');
      if (!data || !data.mem) return;
      el.cpuValue.textContent = `${data.cpu}%`;
      el.ramValue.textContent = `${data.mem.pct}%`;
      el.cpuBar.style.width = `${data.cpu}%`;
      el.ramBar.style.width = `${data.mem.pct}%`;
      el.cpuBar.classList.toggle('hot', data.cpu >= 80);
      el.ramBar.classList.toggle('hot', data.mem.pct >= 85);
      if (data.hostname) {
        el.sysHost.textContent = data.hostname;
        el.termHost.textContent = data.hostname;
      }
    } catch {
      /* servidor momentaneamente fora */
    }
  }



  /* ============================================================
     PC Info — todas as informações do sistema, em abas (clique no CPU/RAM)
     ============================================================ */

  const PCINFO_TABS = [
    ['overview', 'Visão geral'],
    ['cpu', 'CPU'],
    ['memory', 'Memória'],
    ['disks', 'Discos'],
    ['graphics', 'GPU/Monitores'],
    ['network', 'Rede'],
    ['system', 'Sistema/BIOS'],
    ['power', 'Energia'],
    ['processes', 'Processos'],
    ['services', 'Serviços'],
    ['devices', 'Dispositivos'],
    ['security', 'Segurança/Hotfixes'],
    ['environment', 'Ambiente'],
    ['drivers', 'Drivers'],
    ['startup', 'Inicialização'],
    ['errors', 'Erros/Coleta'],
    ['raw', 'JSON bruto'],
  ];

  function pcVal(v) {
    if (v === null || v === undefined) return '<span class="pcinfo-null">—</span>';
    if (v === '') return '<span class="pcinfo-null">(vazio)</span>';
    if (typeof v === 'boolean') return `<span class="pcinfo-badge">${v ? 'sim' : 'não'}</span>`;
    if (typeof v === 'number') return escapeHtml(String(v));
    if (typeof v === 'string') {
      const s = v.length > 4000 ? v.slice(0, 4000) + '… (' + v.length + ' chars)' : v;
      return escapeHtml(s);
    }
    return escapeHtml(JSON.stringify(v));
  }

  function pcLabel(key) {
    return String(key || '').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ');
  }

  function pcKvTable(obj) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return pcRenderValue(obj);
    const keys = Object.keys(obj);
    if (!keys.length) return '<div class="pcinfo-empty">Sem dados.</div>';
    let html = '<table class="pcinfo-kv"><tbody>';
    for (const k of keys) {
      const v = obj[k];
      if (v && typeof v === 'object') {
        html += `<tr><th>${escapeHtml(pcLabel(k))}</th><td>${pcRenderValue(v)}</td></tr>`;
      } else {
        const mono = typeof v === 'string' && (v.length > 60 || /[\\\/=:]/.test(v) || /^[A-F0-9-]{16,}$/i.test(v));
        html += `<tr><th>${escapeHtml(pcLabel(k))}</th><td${mono ? ' class="mono"' : ''}>${pcVal(v)}</td></tr>`;
      }
    }
    html += '</tbody></table>';
    return html;
  }

  function pcRenderValue(v) {
    if (v === null || v === undefined) return '<span class="pcinfo-null">—</span>';
    if (Array.isArray(v)) {
      if (!v.length) return '<span class="pcinfo-null">[ ] vazio</span>';
      if (v.every((x) => x === null || ['string','number','boolean'].includes(typeof x))) {
        return '<div class="pcinfo-list">' + v.map((x) => `<div class="pcinfo-list-item mono">${pcVal(x)}</div>`).join('') + '</div>';
      }
      return '<div class="pcinfo-list">' + v.map((item, i) => {
        if (item && typeof item === 'object' && !Array.isArray(item)) {
          return `<div class="pcinfo-list-item"><div class="pcinfo-section-title">#${i + 1}</div>${pcKvTable(item)}</div>`;
        }
        return `<div class="pcinfo-list-item">${pcRenderValue(item)}</div>`;
      }).join('') + '</div>';
    }
    if (typeof v === 'object') return pcKvTable(v);
    return `<div class="pcinfo-pre">${pcVal(v)}</div>`;
  }

  function pcRenderSection(key, data) {
    const raw = key === 'raw' ? data : data && data[key];
    if (key === 'raw') {
      return `<div class="pcinfo-section"><div class="pcinfo-section-title">JSON completo</div><pre class="pcinfo-pre">${escapeHtml(JSON.stringify(data || {}, null, 2))}</pre></div>`;
    }
    if (key === 'errors') {
      const errs = Array.isArray(raw) ? raw : (data && data.errors) || [];
      if (!errs.length) return '<div class="pcinfo-empty">Nenhum erro de coleta.</div>';
      return `<div class="pcinfo-section"><div class="pcinfo-section-title">Erros de coleta (${errs.length})</div>${pcRenderValue(errs)}</div>`;
    }
    if (raw === undefined) return `<div class="pcinfo-empty">Seção "${escapeHtml(key)}" indisponível nesta coleta.</div>`;
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      // split into sub-sections for nested objects/arrays to show ALL fields clearly
      const keys = Object.keys(raw);
      const scalars = {}, complex = {};
      for (const k of keys) {
        const v = raw[k];
        if (v && typeof v === 'object') complex[k] = v; else scalars[k] = v;
      }
      let html = '<div class="pcinfo-grid">';
      if (Object.keys(scalars).length) {
        html += `<div class="pcinfo-section"><div class="pcinfo-section-title">Resumo</div>${pcKvTable(scalars)}</div>`;
      }
      for (const [k, v] of Object.entries(complex)) {
        html += `<div class="pcinfo-section"><div class="pcinfo-section-title">${escapeHtml(pcLabel(k))}${Array.isArray(v) ? ` (${v.length})` : ''}</div>${pcRenderValue(v)}</div>`;
      }
      html += '</div>';
      // also render any top-level arrays/other? covered
      return html;
    }
    return `<div class="pcinfo-section"><div class="pcinfo-section-title">${escapeHtml(key)}</div>${pcRenderValue(raw)}</div>`;
  }

  function getPcInfoTabs(data) {
    const tabs = [];
    const present = new Set(Object.keys(data || {}));
    for (const [key, title] of PCINFO_TABS) {
      if (key === 'raw') { tabs.push([key, title]); continue; }
      if (key === 'errors') { tabs.push([key, title]); continue; }
      if (present.has(key)) tabs.push([key, title]);
    }
    // include any extra keys not in config (ALL POSSIBLE)
    for (const k of Object.keys(data || {})) {
      if (['collectedAt', 'errors'].includes(k)) continue;
      if (!tabs.some((t) => t[0] === k)) tabs.splice(Math.max(0, tabs.length - 2), 0, [k, pcLabel(k)]);
    }
    return tabs;
  }

  function renderPcInfoTabs() {
    if (!el.pcInfoTabs) return;
    const data = state.pcInfo.data || {};
    const tabs = getPcInfoTabs(data);
    if (!tabs.some((t) => t[0] === state.pcInfo.tab)) state.pcInfo.tab = (tabs[0] && tabs[0][0]) || 'overview';
    el.pcInfoTabs.innerHTML = tabs.map(([key, title]) =>
      `<button type="button" class="pcinfo-tab${state.pcInfo.tab === key ? ' active' : ''}" data-pc-tab="${escapeAttr(key)}">${escapeHtml(title)}</button>`
    ).join('');
  }

  function selectPcInfoTab(key) {
    state.pcInfo.tab = key;
    renderPcInfoTabs();
    if (!el.pcInfoContent) return;
    const data = state.pcInfo.data;
    if (!data) { el.pcInfoContent.innerHTML = '<div class="pcinfo-empty">Sem dados.</div>'; return; }
    el.pcInfoContent.innerHTML = pcRenderSection(key, data);
    el.pcInfoContent.scrollTop = 0;
  }

  function openPcInfo(force = false) {
    if (!el.pcInfoModal) return;
    el.pcInfoModal.classList.add('open');
    el.pcInfoModal.setAttribute('aria-hidden', 'false');
    if (!force && state.pcInfo.data && !state.pcInfo.loading) {
      renderPcInfoTabs();
      selectPcInfoTab(state.pcInfo.tab || 'overview');
      return;
    }
    fetchPcInfo();
  }

  function closePcInfo() {
    if (!el.pcInfoModal) return;
    el.pcInfoModal.classList.remove('open');
    el.pcInfoModal.setAttribute('aria-hidden', 'true');
  }

  async function fetchPcInfo() {
    if (state.pcInfo.loading) return;
    state.pcInfo.loading = true;
    state.pcInfo.error = '';
    if (el.pcInfoMeta) el.pcInfoMeta.textContent = 'Coletando todas as informações do sistema...';
    if (el.pcInfoContent) el.pcInfoContent.innerHTML = '<div class="pcinfo-loading">Coletando informações (CPU, discos, rede, drivers, processos, segurança...) — pode levar alguns segundos.</div>';
    if (el.pcInfoTabs) el.pcInfoTabs.innerHTML = '';
    if (el.pcInfoRefresh) el.pcInfoRefresh.disabled = true;
    try {
      const res = await api('/api/system/full');
      if (!res || !res.ok) throw new Error((res && res.error) || 'Falha ao obter informações');
      state.pcInfo.data = res.data || {};
      const when = state.pcInfo.data.collectedAt ? ` · coletado em ${state.pcInfo.data.collectedAt}` : '';
      const dur = res.duration ? ` · ${Math.round(res.duration / 100) / 10}s` : '';
      if (el.pcInfoMeta) el.pcInfoMeta.textContent = `Todas as informações disponíveis em abas${when}${dur}`;
      renderPcInfoTabs();
      selectPcInfoTab(state.pcInfo.tab || 'overview');
    } catch (err) {
      state.pcInfo.error = err.message || String(err);
      if (el.pcInfoMeta) el.pcInfoMeta.textContent = 'Falha na coleta';
      if (el.pcInfoContent) el.pcInfoContent.innerHTML = `<div class="pcinfo-error">Erro: ${escapeHtml(state.pcInfo.error)}<br><br><button type="button" class="ghost-btn" id="pcInfoRetry">Tentar novamente</button></div>`;
      const retry = document.getElementById('pcInfoRetry');
      if (retry) retry.addEventListener('click', () => fetchPcInfo());
    } finally {
      state.pcInfo.loading = false;
      if (el.pcInfoRefresh) el.pcInfoRefresh.disabled = false;
    }
  }


  function autoResize() {
    if (!el.input) return;
    el.input.style.height = 'auto';
    const height = Math.min(Math.max(el.input.scrollHeight, 26), 210);
    el.input.style.height = `${height}px`;
  }

  /* ============================================================
     Eventos
     ============================================================ */

  function bindEvents() {
    el.newChat.addEventListener('click', newChat);
    if (el.memoryPill) {
      el.memoryPill.addEventListener('click', () => {
        const chat = activeChat();
        if (!chat || !chat.memory) return;
        chat.memory = null;
        saveChats();
        renderMemoryPill();
        toast('Memória deste chat esquecida.');
      });
    }
    el.collapseSidebar.addEventListener('click', toggleSidebar);
    el.openSidebar.addEventListener('click', toggleSidebar);
    el.sidebarScrim.addEventListener('click', closeMobileSidebar);

    el.chatList.addEventListener('click', (event) => {
      const remove = event.target.closest('[data-delete]');
      if (remove) {
        event.stopPropagation();
        deleteChat(remove.dataset.delete);
        return;
      }
      const item = event.target.closest('[data-chat-id]');
      if (item) switchChat(item.dataset.chatId);
    });

    if (el.newFolderBtn) el.newFolderBtn.addEventListener('click', () => openFolderModal());
    if (el.allChatsBtn) el.allChatsBtn.addEventListener('click', () => openChatsModal());
    if (el.chatsSearch) el.chatsSearch.addEventListener('input', renderChatsModal);
    if (el.chatsModal) {
      $$('[data-close-chats]', el.chatsModal).forEach((node) => node.addEventListener('click', closeChatsModal));
    }
    if (el.folderModal) {
      $$('[data-close-folder]', el.folderModal).forEach((node) => node.addEventListener('click', closeFolderModal));
    }
    if (el.folderForm) el.folderForm.addEventListener('submit', submitFolderForm);

    el.themeToggle.addEventListener('click', () => {
      const next = state.settings.theme === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      api('/api/settings', { method: 'POST', body: { theme: next } }).catch(() => {});
    });

    el.openSettings.addEventListener('click', () => openSettings('providers'));
    el.settingsTabs.addEventListener('click', (event) => {
      const button = event.target.closest('[data-tab]');
      if (button) switchSettingsTab(button.dataset.tab);
    });

    if (el.reRefreshApps) el.reRefreshApps.addEventListener('click', loadReApps);
    if (el.reBrowseBtn) el.reBrowseBtn.addEventListener('click', () => {
      const path = el.reBrowsePath ? el.reBrowsePath.value.trim() : '';
      if (path) browseReDir(path);
    });
    if (el.reAnalyzeBtn) el.reAnalyzeBtn.addEventListener('click', analyzeReTarget);
    if (el.reWorkbenchModal) {
      $$('[data-close-re]', el.reWorkbenchModal).forEach((node) => node.addEventListener('click', closeReWorkbench));
    }
    if (el.attachBtn) el.attachBtn.addEventListener('click', () => el.fileInput && el.fileInput.click());
    if (el.fileInput) el.fileInput.addEventListener('change', (e) => handleFiles(e.target.files));
    if (el.composer) {
      el.composer.addEventListener('dragover', (e) => { e.preventDefault(); el.composer.classList.add('drag-over'); });
      el.composer.addEventListener('dragleave', () => el.composer.classList.remove('drag-over'));
      el.composer.addEventListener('drop', (e) => {
        e.preventDefault();
        el.composer.classList.remove('drag-over');
        if (e.dataTransfer && e.dataTransfer.files) handleFiles(e.dataTransfer.files);
      });
    }
    if (el.skillInstallForm) el.skillInstallForm.addEventListener('submit', installSkillFromSettings);
    if (el.settingsSkillList) {
      el.settingsSkillList.addEventListener('click', (event) => {
        const button = event.target.closest('[data-delete-skill]');
        if (button) deleteSkillFromSettings(button.dataset.deleteSkill);
      });
    }
    $$('[data-close-settings]', el.settingsModal).forEach((node) => {
      node.addEventListener('click', closeSettings);
    });

    if (el.sysCard) {
      el.sysCard.addEventListener('click', () => openPcInfo());
      el.sysCard.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openPcInfo(); }
      });
    }
    $$('[data-close-pcinfo]', el.pcInfoModal).forEach((node) => node.addEventListener('click', closePcInfo));
    if (el.pcInfoRefresh) el.pcInfoRefresh.addEventListener('click', () => openPcInfo(true));
    if (el.pcInfoTabs) el.pcInfoTabs.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-pc-tab]');
      if (btn) selectPcInfoTab(btn.dataset.pcTab);
    });

    if (el.prefInterface) {
      el.prefInterface.addEventListener('click', (event) => {
        const button = event.target.closest('[data-ui]');
        if (!button) return;
        applyUiStyle(button.dataset.ui);
      });
    }
    const bindColorReset = (btn, key, def) => {
      if (!btn) return;
      btn.addEventListener('click', () => {
        state.settings[key] = '';
        const input = key === 'accentColor' ? el.prefAccentColor : key === 'widgetColor' ? el.prefWidgetColor : el.prefSidebarColor;
        if (input) input.value = def;
        applyCustomColors();
      });
    };
    bindColorReset(el.resetAccentColor, 'accentColor', '#c96442');
    bindColorReset(el.resetWidgetColor, 'widgetColor', '#fcfbf7');
    bindColorReset(el.resetSidebarColor, 'sidebarColor', '#efece4');
    if (el.resetGradient) {
      el.resetGradient.addEventListener('click', () => {
        state.settings.gradientFrom = '';
        state.settings.gradientTo = '';
        state.settings.gradientDir = '';
        if (el.prefGradientFrom) el.prefGradientFrom.value = '#191918';
        if (el.prefGradientTo) el.prefGradientTo.value = '#2a2a4a';
        if (el.prefGradientDir) el.prefGradientDir.value = 'to bottom';
        applyGradient();
      });
    }
    for (const [input, key] of [[el.prefAccentColor, 'accentColor'], [el.prefWidgetColor, 'widgetColor'], [el.prefSidebarColor, 'sidebarColor']]) {
      if (!input) continue;
      input.addEventListener('input', () => { state.settings[key] = input.value; applyCustomColors(); });
    }
    for (const [input, key] of [[el.prefGradientFrom, 'gradientFrom'], [el.prefGradientTo, 'gradientTo']]) {
      if (!input) continue;
      input.addEventListener('input', () => { state.settings[key] = input.value; applyGradient(); });
    }
    if (el.prefGradientDir) {
      el.prefGradientDir.addEventListener('change', () => { state.settings.gradientDir = el.prefGradientDir.value; applyGradient(); });
    }
    async function saveCustomization() {
      if (!el.saveCustomize) return;
      setBusy(el.saveCustomize, true);
      try {
        const data = await api('/api/settings', {
          method: 'POST',
          body: {
            uiStyle: normalizeUiStyle(state.settings.uiStyle),
            accentColor: String(state.settings.accentColor || '').slice(0, 32),
            widgetColor: String(state.settings.widgetColor || '').slice(0, 32),
            sidebarColor: String(state.settings.sidebarColor || '').slice(0, 32),
            gradientFrom: String(state.settings.gradientFrom || '').slice(0, 32),
            gradientTo: String(state.settings.gradientTo || '').slice(0, 32),
            gradientDir: String(state.settings.gradientDir || '').slice(0, 32),
          },
        });
        state.config = data;
        if (data.settings) state.settings = { ...state.settings, ...data.settings };
        applyUiStyle(state.settings.uiStyle);
        renderPrefs();
        toast('Personalização salva.');
      } catch (error) {
        toast(error.message, 'error');
      } finally {
        setBusy(el.saveCustomize, false);
      }
    }
    if (el.saveCustomize) el.saveCustomize.addEventListener('click', saveCustomization);
    if (el.prefOpenMode) {
      el.prefOpenMode.addEventListener('click', (event) => {
        const button = event.target.closest('[data-open]');
        if (!button) return;
        state.settings.openMode = normalizeOpenMode(button.dataset.open);
        $$('button', el.prefOpenMode).forEach((b) => b.classList.toggle('active', b === button));
      });
    }
    if (el.prefTokenSaver) {
      el.prefTokenSaver.addEventListener('click', async (event) => {
        const button = event.target.closest('[data-token-saver]');
        if (!button) return;
        const mode = normalizeTokenSaver(button.dataset.tokenSaver);
        state.settings.tokenSaver = mode;
        $$('button', el.prefTokenSaver).forEach((b) => b.classList.toggle('active', b === button));
        updateTokenStats();
        const caps = { off: 'sem cortes', low: 'saída máx 8192', medium: 'saída máx 4096 · contexto curto', max: 'saída máx 2048 · contexto mínimo' };
        try {
          await api('/api/settings', { method: 'POST', body: { tokenSaver: mode } });
          toast(`Economia de tokens: ${mode === 'max' ? 'Máxima' : mode === 'medium' ? 'Média' : mode === 'low' ? 'Baixa' : 'Desligada'} (${caps[mode] || mode}). Aplicado na próxima mensagem.`);
        } catch (err) {
          toast('Falha ao salvar economia de tokens: ' + err.message, 'error');
        }
      });
    }
    if (el.prefAnimation) {
      el.prefAnimation.addEventListener('click', (event) => {
        const button = event.target.closest('[data-anim-level]');
        if (!button) return;
        const level = normalizeAnimation(button.dataset.animLevel);
        applyAnimation(level);
        api('/api/settings', { method: 'POST', body: { animation: level } }).catch(() => {});
      });
    }
    el.prefTheme.addEventListener('click', (event) => {
      const button = event.target.closest('[data-theme]');
      if (!button) return;
      applyTheme(button.dataset.theme);
    });
    el.savePrefs.addEventListener('click', savePreferences);

    el.addConnection.addEventListener('click', () => {
      el.customForm.hidden = !el.customForm.hidden;
      if (!el.customForm.hidden) el.customName.focus();
    });
    el.cancelCustom.addEventListener('click', () => {
      el.customForm.hidden = true;
      el.customForm.reset();
    });
    el.customForm.addEventListener('submit', addCustomConnection);

    el.providerList.addEventListener('click', (event) => {
      const card = providerCard(event.target);
      if (!card) return;
      const save = event.target.closest('[data-save]');
      if (save) {
        saveProviderKey(card, save);
        return;
      }
      const test = event.target.closest('[data-test]');
      if (test) {
        testProviderConnection(card, test);
        return;
      }
      const remove = event.target.closest('[data-remove]');
      if (remove) removeProviderConnection(card, remove);
    });

    el.modelPill.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleModelPopover();
    });
    el.modelSearch.addEventListener('input', renderModelList);
    el.modelList.addEventListener('click', (event) => {
      const manage = event.target.closest('[data-manage]');
      if (manage) {
        closeModelPopover();
        openSettings('providers');
        return;
      }
      const item = event.target.closest('[data-model]');
      if (item) selectModel(item.dataset.model);
    });
    el.closeModel.addEventListener('click', closeModelPopover);
    el.manageConnections.addEventListener('click', () => {
      closeModelPopover();
      openSettings('providers');
    });

    el.agentPill.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleAgentPopover();
    });
    el.closeAgent.addEventListener('click', closeAgentPopover);
    el.agentList.addEventListener('click', (event) => {
      const item = event.target.closest('[data-agent-id]');
      if (item) selectAgent(item.dataset.agentId);
    });
    el.manageAgents.addEventListener('click', () => {
      closeAgentPopover();
      openSettings('agents');
    });

    el.addAgent.addEventListener('click', () => openAgentForm());
    el.refreshAgents.addEventListener('click', refreshAgents);
    el.cancelAgent.addEventListener('click', closeAgentForm);
    el.agentForm.addEventListener('submit', submitAgentForm);
    el.settingsAgentList.addEventListener('click', (event) => {
      const card = event.target.closest('[data-agent-card]');
      if (!card) return;
      const id = card.dataset.agentCard;
      if (event.target.closest('[data-agent-use]')) {
        selectAgent(id);
        return;
      }
      if (event.target.closest('[data-agent-edit]')) {
        openAgentForm(id);
        return;
      }
      if (event.target.closest('[data-agent-delete]')) removeAgentById(id);
    });

    el.terminalToggle.addEventListener('click', () => toggleTerminal());
    el.terminalChip.addEventListener('click', () => toggleTerminal());
if (el.reWorkbenchBtn) el.reWorkbenchBtn.addEventListener('click', openReWorkbench);
    el.closeTerm.addEventListener('click', () => toggleTerminal(false));
    el.clearTerm.addEventListener('click', clearTerminal);
    if (el.termTabs) {
      el.termTabs.addEventListener('click', (event) => {
        const tab = event.target.closest('.term-tab');
        if (!tab || !tab.dataset.shell) return;
        setTermShell(tab.dataset.shell);
        el.termInput.focus();
      });
    }
    if (el.termAdminToggle) el.termAdminToggle.addEventListener('click', () => setTermAdmin());
    if (el.termElevate) el.termElevate.addEventListener('click', () => setTermAdmin(true));
    try {
      const savedShell = localStorage.getItem('trojan.term.shell');
      if (savedShell && TERM_SHELLS.includes(savedShell)) setTermShell(savedShell);
    } catch {
      /* storage indisponível */
    }
    renderTermPrompt();

    el.termForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const command = el.termInput.value;
      el.termInput.value = '';
      sendTermCommand(command);
    });
    el.termInput.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (!state.termHistory.length) return;
        state.termIndex =
          state.termIndex < 0
            ? state.termHistory.length - 1
            : Math.max(0, state.termIndex - 1);
        el.termInput.value = state.termHistory[state.termIndex] || '';
        el.termInput.setSelectionRange(el.termInput.value.length, el.termInput.value.length);
      } else if (event.key === 'ArrowDown') {
        if (state.termIndex < 0) return;
        event.preventDefault();
        state.termIndex += 1;
        if (state.termIndex >= state.termHistory.length) {
          state.termIndex = -1;
          el.termInput.value = '';
        } else {
          el.termInput.value = state.termHistory[state.termIndex] || '';
        }
      }
    });

    el.input.addEventListener('input', () => {
      autoResize();
      updateSendState();
      syncSkillMenu();
    });
    el.input.addEventListener('click', () => {
      if (state.skillRange) syncSkillMenu();
    });
    el.input.addEventListener('blur', () => {
      setTimeout(() => closeSkillMenu(), 160);
    });
    el.input.addEventListener('keydown', (event) => {
      if (!el.skillMenu.hidden) {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          moveSkillSelection(1);
          return;
        }
        if (event.key === 'ArrowUp') {
          event.preventDefault();
          moveSkillSelection(-1);
          return;
        }
        if (event.key === 'Escape') {
          event.preventDefault();
          closeSkillMenu();
          return;
        }
        if ((event.key === 'Enter' || event.key === 'Tab') && !event.shiftKey && !event.isComposing) {
          const list = filteredSkills(state.skillQuery);
          if (list.length) {
            event.preventDefault();
            applySkill(list[Math.min(state.skillIndex, list.length - 1)].id);
            return;
          }
        }
      }
      if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
        event.preventDefault();
        if (state.streaming) return;
        submit();
      }
    });
    if (el.skillMenuList) {
      el.skillMenuList.addEventListener('mousedown', (event) => {
        const button = event.target.closest('[data-skill]');
        if (!button) return;
        event.preventDefault();
        applySkill(button.dataset.skill);
      });
    }
    el.send.addEventListener('click', () => {
      if (state.streaming) stopTurn();
      else submit();
    });
    el.autoApprove.addEventListener('change', () => {
      setAutoApprove(el.autoApprove.checked, true);
    });

    el.suggestions.addEventListener('click', (event) => {
      const button = event.target.closest('[data-prompt]');
      if (!button) return;
      el.input.value = button.dataset.prompt || '';
      autoResize();
      updateSendState();
      submit();
    });
    el.emptyHint.addEventListener('click', (event) => {
      if (event.target.closest('[data-connect]')) openSettings('providers');
    });

    el.thread.addEventListener('click', async (event) => {
      const copy = event.target.closest('[data-copy]');
      if (copy) {
        const block = copy.closest('.code-block');
        const code = block && block.querySelector('pre code');
        if (code) {
          try {
            await navigator.clipboard.writeText(code.textContent || '');
            const label = copy.querySelector('span');
            if (label) {
              label.textContent = 'copiado';
              setTimeout(() => {
                label.textContent = 'copiar';
              }, 1400);
            }
          } catch {
            toast('Não consegui copiar.', 'error');
          }
        }
        return;
      }

      const approve = event.target.closest('[data-approve]');
      if (approve) {
        const row = approve.closest('.approval');
        if (row) {
          const approved = approve.dataset.approve === '1';
          wsSend({ type: 'approval', id: row.dataset.approval, approved });
          const card = row.closest('.tool-card');
          const status = card && card.querySelector('.tool-state');
          if (status) status.textContent = approved ? 'executando…' : 'negado';
          row.remove();
        }
        return;
      }

      const retry = event.target.closest('[data-retry]');
      if (retry) {
        retryTurn();
        return;
      }

      const toolHead = event.target.closest('.tool-head');
      if (toolHead) {
        toolHead.closest('.tool-card').classList.toggle('open');
        return;
      }

      const thinkingHead = event.target.closest('.thinking-head');
      if (thinkingHead) {
        thinkingHead.closest('.thinking').classList.toggle('collapsed');
      }
    });

    el.threadScroll.addEventListener(
      'scroll',
      () => {
        const gap =
          el.threadScroll.scrollHeight - el.threadScroll.scrollTop - el.threadScroll.clientHeight;
        state.autoScroll = gap < 80;
      },
      { passive: true },
    );

    document.addEventListener('click', (event) => {
      if (
        !el.modelPopover.hidden &&
        !el.modelPopover.contains(event.target) &&
        !el.modelPill.contains(event.target)
      ) {
        closeModelPopover();
      }
      if (
        !el.agentPopover.hidden &&
        !el.agentPopover.contains(event.target) &&
        !el.agentPill.contains(event.target)
      ) {
        closeAgentPopover();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        if (!el.agentPopover.hidden) {
          closeAgentPopover();
          return;
        }
        if (!el.modelPopover.hidden) {
          closeModelPopover();
          return;
        }
        if (el.folderModal && el.folderModal.classList.contains('open')) {
          closeFolderModal();
          return;
        }
        if (el.chatsModal && el.chatsModal.classList.contains('open')) {
          closeChatsModal();
          return;
        }
        if (el.pcInfoModal && el.pcInfoModal.classList.contains('open')) {
          closePcInfo();
          return;
        }
        if (el.settingsModal.classList.contains('open')) {
          closeSettings();
          return;
        }
        closeMobileSidebar();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        newChat();
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'j') {
        event.preventDefault();
        toggleTerminal();
      }
    });

    window.addEventListener('resize', () => {
      closeModelPopover();
      closeAgentPopover();
      autoResize();
      if (window.innerWidth > 1000) closeMobileSidebar();
    });
  }

  function showAuthGate(message) {
    if (el.authGate) el.authGate.hidden = false;
    if (el.authError) {
      el.authError.textContent = message || '';
      el.authError.hidden = !message;
    }
    if (el.authKey) {
      el.authKey.value = '';
      setTimeout(() => el.authKey && el.authKey.focus(), 30);
    }
  }

  function hideAuthGate() {
    if (el.authGate) el.authGate.hidden = true;
    if (el.authError) el.authError.hidden = true;
  }

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/status', { cache: 'no-store', credentials: 'same-origin' });
      const data = await res.json().catch(() => ({}));
      return !!data.authenticated;
    } catch {
      return false;
    }
  }

  function bindAuth() {
    if (!el.authForm || el.authForm._bound) return;
    el.authForm._bound = true;
    el.authForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const key = el.authKey ? String(el.authKey.value || '').trim() : '';
      if (!key) return showAuthGate('Digite a key.');
      if (el.authSubmit) el.authSubmit.disabled = true;
      try {
        const res = await fetch('/api/auth/activate', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ key }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.authenticated) return showAuthGate(data.error || 'Key inválida.');
        hideAuthGate();
        await init();
      } catch (error) {
        showAuthGate(error.message || 'Falha ao ativar.');
      } finally {
        if (el.authSubmit) el.authSubmit.disabled = false;
      }
    });
  }

  async function init() {
    const ui = loadUI();
    state.chats = loadChats();
    state.folders = loadFolders();
    if (ui.activeChatId && state.chats.some((chat) => chat.id === ui.activeChatId)) {
      state.activeChatId = ui.activeChatId;
    } else {
      state.activeChatId = state.chats.length ? state.chats[0].id : null;
    }
    state.sidebarCollapsed = !!ui.sidebarCollapsed;
    el.app.classList.toggle('sidebar-collapsed', state.sidebarCollapsed);
    syncSidebarToggle();

    const localAuto = localStorage.getItem('trojan.auto');
    if (localAuto !== null) setAutoApprove(localAuto === '1', false);
    const localUi = localStorage.getItem('trojan.ui');
    if (localUi) applyUiStyle(localUi);
    const localTheme = localStorage.getItem('trojan.theme');
    if (localTheme) applyTheme(localTheme);

    updateGreeting();
    renderChatList();
    renderMemoryPill();
    renderThread(activeChat());
    bindEvents();
    updateSendState();
    autoResize();
    connectWS();
    pollSystem();
    if (!state._poller) state._poller = setInterval(pollSystem, 4000);

    try {
      await refreshState();
      await Promise.all([loadModels(), loadAgents(), loadSkills(true)]);
    } catch (error) {
      if (String(error.message || '').includes('401') || String(error.message || '').toLowerCase().includes('ativ')) {
        showAuthGate('Ativação necessária.');
        return;
      }
      toast(`Servidor local indisponível: ${error.message}`, 'error');
    }
    updateSendState();
    state.initialized = true;
  }

  async function boot() {
    bindAuth();
    if (await checkAuth()) {
      hideAuthGate();
      await init();
    } else {
      showAuthGate();
    }
  }

  boot();
})();
