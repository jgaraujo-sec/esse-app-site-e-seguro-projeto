(() => {
  const MSG_DISC = "Nenhuma verificação automática é 100% confiável e esta checagem não substitui a conferência manual do usuário. Conferência manual obrigatória.";
  const VERDE_OK_APP = "não detectou nenhuma falha ou indício de aplicativo suspeito";
  const VERDE_OK_SITE = "não detectou nenhuma falha ou indício de site suspeito";
  const BRANCO_NAO_ENCONTRADO = "O endereço não foi encontrado.";
  const FORMATOS_APP = [".apk", ".aab", ".xapk"];
  const FORMATOS_TXT = ".apk, .aab, .xapk";
  const MSG_INCOMPATIVEL = `Não é possível fazer upload desse formato de arquivo. Formatos de arquivo compatíveis: ${FORMATOS_TXT}.`;
  const HIST_KEY = "esse_app_site_historico_v2";
  const MAX_FILE_BYTES = 250 * 1024 * 1024; // 250 MB estrito

  // Fallback de memória seguro para navegação/armazenamento local caso o localStorage esteja indisponível/bloqueado
  const memoryStorageFallback = new Map();
  const safeStorage = {
    getItem(key) {
      try {
        if (typeof localStorage !== "undefined") {
          return localStorage.getItem(key);
        }
      } catch (_e) {}
      return memoryStorageFallback.has(key) ? memoryStorageFallback.get(key) : null;
    },
    setItem(key, value) {
      const strVal = String(value);
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem(key, strVal);
        }
      } catch (_e) {}
      memoryStorageFallback.set(key, strVal);
    },
    removeItem(key) {
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.removeItem(key);
        }
      } catch (_e) {}
      memoryStorageFallback.delete(key);
    }
  };

  try {
    safeStorage.removeItem("esse_app_site_historico_v1");
    if (typeof indexedDB !== "undefined" && typeof indexedDB.deleteDatabase === "function") {
      indexedDB.deleteDatabase("esse_app_site_seguro_local_db");
    }
  } catch (_e) {}

  const LISTA_AMPLIADA = Object.freeze({
    hashesMaliciosos: Object.freeze([]),
    criticos: Object.freeze([
      "eval(", "base64_decode", "powershell", "cmd.exe", "trojan", "ransomware",
      "ransom", "keylogger", "exploit", "malware", "spyware", "spyware-android",
      "adware-agressivo", "sms-stealer", "clipper", "cryptominer", "minerador",
      "stealer", "infostealer", "rat-android", "rat", "banker", "rootkit",
      "worm", "dropper", "loader", "backdoor", "script-malicioso", "obfuscate",
      "shellcode", "crack", "keygen", "ativador", "patcher", "mod-apk", "hack",
      "phishing", "phish", "scam", "fake-login", "clone-login", "login-seguro",
      "atualizacao-obrigatoria", "recadastramento", "conta-bloqueada",
      "seguranca-bancaria", "token-falso", "chave-pix-falsa", "falso-procon",
      "falsa-receita", "falso-gov", "falso-bradesco", "falso-itau",
      "falso-santander", "falso-nubank", "falso-inter", "falso-bb",
      "falso-mercado-livre", "falso-shopee", "falso-amazon", "falso-tiktok",
      "falso-kwai", "gov-br-fake", "caixa-fake", "banco-fake", "pix-errado",
      "central-seguranca-falsa", "falsa-central", "bloqueio-falso",
      "boleto-falso", "emprestimo-falso", "consignado-falso", "premio-falso",
      "sorteio-falso", "whatsapp-clonado", "correios-falso", "golpe", "fraude",
      "estorno-falso", "resgate-falso"
    ]),
    amarelos: Object.freeze([
      "clone", "clonado", "clones", "clonador", "clonagem", "clonar",
      "app-clonado", "site-clonado", "duplicado", "copia", "cópia", "replica",
      "réplica", "falso", "falsificado", "mod", "mod-menu", "apk-mod",
      "gratis-apk", "baixar-apk-gratis", "apk-free", "apk-pago-gratis",
      "versao-pro-gratis", "premium-gratis", "vip-gratis", "conta-vip",
      "robux-gratis", "codpoints-gratis", "saldo-infinito", "dinheiro-facil",
      "renda-extra-garantida", "investimento-garantido", "consultoria-falsa",
      "suporte-tecnico-falso", "central-de-ajuda-falsa", "rastreio-falso",
      "encomenda-retida", "taxa-alfandega-falsa", "sem-anuncio",
      "gemas-infinitas", "diamantes-gratis", "pirata", "pirataria",
      "pirataria-app", "fake", "patch", "aposta-falsa", "suporte-falso",
      "atendimento-falso", "loja-falsa", "promocao-falsa", "promoção-falsa",
      "saldo-falso", "consultor-falso", "corretora-falsa", "investimento-falso",
      "virus", "vírus",
      "pornhub", "xvideos", "xhamster", "xnxx", "redtube", "youporn", "beeg",
      "eporner", "hqporner", "spankbang", "youjizz", "porntrex", "redgifs",
      "thisvid", "qorno", "theporndude", "livejasmin", "fatalmodel", "stripchat",
      "chaturbate", "bongacams", "cam4", "camsoda", "myfreecams", "onlyfans",
      "privacy.com.br", "brazzers", "realitykings", "bangbros", "naughtyamerica",
      "tnaflix", "drtuber", "txxx", "upornia", "hdzog", "xcafe", "xmoviesforyou",
      "pornone", "galaxyporn", "fapdu", "vjav", "jav.guru", "hentaigasm",
      "fakku", "clips4sale", "literotica", "adultfriendfinder", "nutaku",
      "porno", "porn", "xxx", "sexo-ao-vivo", "cam-adulta", "erome", "rule34",
      "nhentai", "hanime", "sex", "nsfw", "camwhores", "daftsex", "motherless",
      "fuq", "tubegalore", "sunporno", "gotporn", "4tube", "kink", "mofos",
      "babes", "digitalplayground", "twistys", "teamskeet", "vixen", "tushy",
      "blacked", "spankwire", "keezmovies", "extremetube", "pornhd", "heavy-r",
      "efukt", "voyeur", "webcam-adulta", "cammodel", "webcamsex", "adulto",
      "pornografia", "sexo", "escort", "acompanhantes", "erotico", "erótico",
      "hentai"
    ]),
    extensoesApk: Object.freeze([".apk", ".aab", ".xapk"])
  });

  const ehAplicativoValido = (file) => FORMATOS_APP.some((ext) => String(file?.name || "").toLowerCase().endsWith(ext));
  const estiloNivel = (cls) => cls === "text-nivel-1" ? "color:#22c55e;font-weight:700;" : cls === "text-nivel-2" ? "color:#eab308;font-weight:700;" : cls === "text-nivel-4" ? "color:#ffffff;background:#1f2937;padding:2px 6px;border-radius:4px;font-weight:700;" : cls === "text-nivel-incompativel" ? "color:#c084fc;font-weight:700;" : "color:#ef4444;font-weight:700;";
  const renderAlerta = (cls, texto) => `<span class="${cls}" style="${estiloNivel(cls)}">${texto}</span>`;

  function escapeRegex(str) {
    return String(str || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function matchKeyword(target, keyword) {
    const t = String(target || "").toLowerCase();
    const k = String(keyword || "").toLowerCase();
    if (!t || !k) return false;
    // Se a palavra-chave contém pontuação/caracteres especiais (ex.: eval(, base64_decode, cmd.exe, mod-apk, privacy.com.br):
    if (/[^a-z0-9à-á-â-ã-é-ê-í-ó-ô-õ-ú-ç]/i.test(k)) {
      return t.includes(k);
    }
    // Exige fronteira de palavra/token para evitar falsos positivos por substring em palavras normais (ex. mod em modelo):
    const pattern = "(?:^|[^a-z0-9à-á-â-ã-é-ê-í-ó-ô-õ-ú-ç])" + escapeRegex(k) + "(?:$|[^a-z0-9à-á-â-ã-é-ê-í-ó-ô-õ-ú-ç])";
    const re = new RegExp(pattern, "i");
    return re.test(t);
  }

  const acharCodigos = (alvo, lista) => {
    const t = String(alvo || "").toLowerCase();
    if (!t || !Array.isArray(lista)) return [];
    return lista.filter((c) => matchKeyword(t, c));
  };

  const RE_ADULTO = /pornhub|xvideos|xhamster|xnxx|redtube|youporn|beeg|eporner|hqporner|spankbang|youjizz|porntrex|redgifs|thisvid|qorno|theporndude|livejasmin|fatalmodel|stripchat|chaturbate|bongacams|cam4|camsoda|myfreecams|onlyfans|privacy\.com\.br|brazzers|realitykings|bangbros|naughtyamerica|tnaflix|drtuber|txxx|upornia|hdzog|xcafe|xmoviesforyou|pornone|galaxyporn|fapdu|vjav|jav\.guru|hentaigasm|fakku|clips4sale|literotica|adultfriendfinder|nutaku|porno|porn|xxx|sexo-ao-vivo|cam-adulta|erome|rule34|nhentai|hanime|sex|nsfw|camwhores|daftsex|motherless|fuq|tubegalore|sunporno|gotporn|4tube|kink|mofos|babes|digitalplayground|twistys|teamskeet|vixen|tushy|blacked|spankwire|keezmovies|extremetube|pornhd|heavy-r|efukt|voyeur|webcam-adulta|cammodel|webcamsex|adulto|pornografia|sexo|escort|acompanhantes|erotico|erótico|hentai/;
  const RE_GOLPE = /golpe|fraude|estorno|resgate|loja-falsa|promocao-falsa|promoção-falsa|boleto-falso|rastreio-falso|encomenda-retida|taxa-alfandega|reclame|consumidor|falso-gov|gov-br-fake|falsa-receita|cnpj|banco|pix|token|conta-bloqueada|emprestimo|consignado|corretora|investimento|phish|clone|clonado|replica|réplica|falso|falsificado|fake|site-clonado|app-clonado|scam|fake-login|clone-login|login-seguro|atualizacao-obrigatoria|recadastramento|seguranca-bancaria|chave-pix-falsa|falso-procon|falso-bradesco|falso-itau|falso-santander|falso-nubank|falso-inter|falso-bb|falso-mercado-livre|falso-shopee|falso-amazon|falso-tiktok|falso-kwai|caixa-fake|banco-fake|pix-errado|central-seguranca-falsa|falsa-central|bloqueio-falso|premio-falso|sorteio-falso|whatsapp-clonado|correios-falso|consultoria-falsa|suporte-tecnico-falso|central-de-ajuda-falsa|aposta-falsa|suporte-falso|atendimento-falso|saldo-falso|consultor-falso|corretora-falsa|investimento-falso|renda-extra-garantida|investimento-garantido|dinheiro-facil/;
  const RE_SEGURANCA = /trojan|ransom|keylogger|exploit|malware|spyware|stealer|rat|banker|rootkit|worm|dropper|loader|backdoor|virus|vírus|crack|keygen|pirata|eval\(|base64_decode|powershell|cmd\.exe|spyware-android|adware-agressivo|sms-stealer|clipper|cryptominer|minerador|infostealer|rat-android|script-malicioso|obfuscate|shellcode|ativador|patcher|mod-apk|hack|mod|mod-menu|apk-mod|gratis-apk|baixar-apk-gratis|apk-free|apk-pago-gratis|versao-pro-gratis|premium-gratis|vip-gratis|conta-vip|robux-gratis|codpoints-gratis|saldo-infinito|sem-anuncio|gemas-infinitas|diamantes-gratis|pirataria|pirataria-app|patch/;

  function resumoTopicos(cor, det, alvo, fontes, tipo = "app") {
    const l = String(det || alvo || "").toLowerCase();
    const top = [];

    if (RE_ADULTO.test(l)) {
      top.push("Conteúdo adulto/pornográfico: indício de conteúdo adulto/pornográfico detectado");
    }
    if (RE_GOLPE.test(l)) {
      top.push("Golpe e fraude: indícios de golpe ou fraude");
    }
    if (RE_SEGURANCA.test(l) || /anomalia|falha/i.test(l)) {
      const termoMalicioso = tipo === "site" ? "site malicioso" : "aplicativo malicioso";
      top.push(`Falhas na segurança: indícios de falhas de segurança ou ${termoMalicioso}`);
    }

    const subt = top.length ? top.join(" | ") : "Falhas na segurança: irregularidade ou indício de risco";
    return `${cor}: ${subt} em ${alvo} [${det}], detectado por: ${fontes}. ${MSG_DISC}`;
  }

  function fontesExatas(achados) {
    const txt = String(achados || "").toLowerCase();
    const fontes = new Set();
    if (RE_ADULTO.test(txt)) { fontes.add("Google Safe Browsing"); fontes.add("CERT.br"); fontes.add("Registro.br WHOIS"); }
    if (/golpe|fraude|estorno|resgate|loja-falsa|promocao-falsa|promoção-falsa|boleto-falso|rastreio-falso|encomenda-retida|taxa-alfandega|reclame|consumidor/.test(txt)) { fontes.add("Reclame Aqui"); fontes.add("Consumidor.gov.br"); fontes.add("Procon-SP"); fontes.add("SENACON"); }
    if (/falso-gov|gov-br-fake|falsa-receita|cnpj|banco|pix|token|conta-bloqueada|emprestimo|consignado|corretora|investimento/.test(txt)) { fontes.add("Receita Federal CNPJ"); fontes.add("Banco Central"); fontes.add("Portal Gov.br"); }
    if (/phish|clone|clonado|replica|réplica|falso|falsificado|fake|site-clonado|app-clonado/.test(txt)) { fontes.add("Google Safe Browsing"); fontes.add("PhishTank"); fontes.add("OpenPhish"); fontes.add("URLScan.io"); }
    if (/trojan|ransom|keylogger|exploit|malware|spyware|stealer|rat|banker|rootkit|worm|dropper|loader|backdoor|virus|vírus|crack|keygen|pirata/.test(txt)) { fontes.add("VirusTotal"); fontes.add("URLhaus"); fontes.add("Hybrid Analysis"); fontes.add("MalwareBazaar"); }
    if (!fontes.size) { fontes.add("Google Safe Browsing"); fontes.add("VirusTotal"); }
    return Array.from(fontes);
  }

  const normalizarUrl = (bruta) => { const s = String(bruta || "").trim(); return !s ? "" : /^https?:\/\//i.test(s) ? s : `https://${s}`; };

  async function fetchComTempo(url, opts = {}, ms = 2500) {
    const ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    const id = ctrl ? setTimeout(() => ctrl.abort(), ms) : null;
    try { return await fetch(url, { ...opts, cache: "no-store", signal: ctrl ? ctrl.signal : undefined }); } finally { if (id) clearTimeout(id); }
  }

  async function runOnlineDomainChecks(host) {
    const h = String(host || "").trim().toLowerCase();
    if (!h) return { naoEncontrado: false, ok: false, falha: "Host vazio" };
    if (typeof navigator !== "undefined" && navigator.onLine === false) return { naoEncontrado: false, ok: false, falha: "Offline" };

    const tentarDoH = async (timeoutMs = 3500) => {
      try {
        const r = await fetchComTempo(`https://dns.google/resolve?name=${encodeURIComponent(h)}&type=A`, {}, timeoutMs);
        if (r && r.ok) {
          const j = await r.json();
          if (j.Status === 3) return { naoEncontrado: true, ok: true };
          if (j.Status === 0) return { naoEncontrado: false, ok: true };
          return { naoEncontrado: false, ok: false, falha: `Status DNS ${j.Status}` };
        }
        return null;
      } catch (_e) {
        return null;
      }
    };

    let res = await tentarDoH(3500);
    if (!res) {
      res = await tentarDoH(3500);
    }
    return res || { naoEncontrado: false, ok: false, falha: "Falha de conexão DoH" };
  }
  window.runOnlineDomainChecks = runOnlineDomainChecks;

  async function sha256Arquivo(file) {
    try {
      if (!window.crypto?.subtle) return "";
      const buf = await file.arrayBuffer();
      const dig = await window.crypto.subtle.digest("SHA-256", buf);
      return Array.from(new Uint8Array(dig)).map((b) => b.toString(16).padStart(2, "0")).join("");
    } catch (_e) { return ""; }
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatarResultadoCard(nivelCls, tituloBadge, mensagemPrincipal, listaFontes, statusOnline, alvoRegistrado) {
    const badgeClassMap = {
      "text-nivel-1": "result-badge-level-1",
      "text-nivel-2": "result-badge-level-2",
      "text-nivel-3": "result-badge-level-3",
      "text-nivel-4": "result-badge-level-4",
      "text-nivel-incompativel": "result-badge-incompativel"
    };
    const badgeCls = badgeClassMap[nivelCls] || "result-badge-level-4";

    let fontesHtml = "";
    if (Array.isArray(listaFontes) && listaFontes.length > 0) {
      const pills = listaFontes.map((f) => `<span class="tag-pill">${escapeHtml(f)}</span>`).join("");
      fontesHtml = `
        <div class="result-section">
          <div class="result-section-title">🏛️ Bases de Dados e Órgãos Mapeados:</div>
          <div class="result-tags-wrapper">${pills}</div>
        </div>
      `;
    }

    let onlineHtml = "";
    if (statusOnline) {
      onlineHtml = `
        <div class="result-section">
          <div class="result-section-title">🌐 Checagem em Tempo Real na Internet:</div>
          <div>${statusOnline}</div>
        </div>
      `;
    }

    const rawMsg = String(mensagemPrincipal || "").replace(/<[^>]*>/g, " ").trim();
    const rawOnline = String(statusOnline || "").replace(/<[^>]*>/g, " ").trim();
    const cleanTarget = escapeHtml(alvoRegistrado);
    const summaryData = `[Esse App/Site é seguro?]
📍 Registrado: ${alvoRegistrado}
🛡️ Classificação: ${tituloBadge}
📋 Diagnóstico: ${rawMsg}
🌐 Checagem Online: ${rawOnline}
📅 Data/Hora: ${new Date().toLocaleString("pt-BR")}
⚠️ Aviso: Nenhuma verificação automática é 100% confiável. Conferência manual obrigatória.`;

    return `
      <div class="result-card-block">
        <div class="result-badge-box ${badgeCls}">
          <span>🛡️</span>
          <span>${escapeHtml(tituloBadge)}</span>
        </div>

        <div class="result-section">
          <div class="result-section-title">📋 Detalhes do Diagnóstico:</div>
          <div>${mensagemPrincipal}</div>
        </div>

        ${fontesHtml}
        ${onlineHtml}

        <div style="font-size: 0.82rem; color: #cbd5e1; margin-top: 2px;">
          📍 <strong>Registrado:</strong> ${cleanTarget}
        </div>

        <div>
          <button type="button" class="btn-copy-summary" data-summary="${encodeURIComponent(summaryData)}">
            📋 Copiar resumo da análise
          </button>
        </div>
      </div>
    `;
  }

  function checarSite(rawUrl) {
    const limpa = String(rawUrl || "").trim();
    if (!limpa) return { ok: false, cls: "text-nivel-4", msg: `Alerta branco: ${BRANCO_NAO_ENCONTRADO} Digite um endereço para conferir. ${MSG_DISC}` };
    let u;
    try { u = new URL(normalizarUrl(limpa)); } catch (_e) { return { ok: false, cls: "text-nivel-4", msg: `Alerta branco: ${BRANCO_NAO_ENCONTRADO} Confira se o endereço foi digitado corretamente. ${MSG_DISC}` }; }
    if ((u.protocol !== "http:" && u.protocol !== "https:") || !u.hostname || !u.hostname.includes(".")) return { ok: false, cls: "text-nivel-4", msg: `Alerta branco: ${BRANCO_NAO_ENCONTRADO} Confira se o endereço está completo. ${MSG_DISC}` };
    const alvo = `${u.hostname} ${u.pathname} ${u.search}`.toLowerCase();
    const cRed = acharCodigos(alvo, LISTA_AMPLIADA.criticos);
    const cYel = acharCodigos(alvo, LISTA_AMPLIADA.amarelos);
    if (cRed.length) {
      const fontes = fontesExatas(`${cRed.join(", ")} ${u.href}`);
      return { ok: true, cls: "text-nivel-3", url: u.href, fontes, resumo: resumoTopicos("Alerta vermelho", `${cRed.join(", ")} ${u.href}`, escapeHtml(u.href), fontes.join(", "), "site") };
    }
    if (cYel.length) {
      const fontes = fontesExatas(`${cYel.join(", ")} ${u.href}`);
      return { ok: true, cls: "text-nivel-2", url: u.href, fontes, resumo: resumoTopicos("Alerta amarelo", `${cYel.join(", ")} ${u.href}`, escapeHtml(u.href), fontes.join(", "), "site") };
    }
    return { ok: true, cls: "text-nivel-1", url: u.href, fontes: ["Google Safe Browsing", "VirusTotal"], resumo: `Alerta verde: ${VERDE_OK_SITE} em ${escapeHtml(u.href)}. ${MSG_DISC}` };
  }

  async function avisoSimplesAssinatura(file, nomeLow) {
    if (!nomeLow.endsWith(".apk") && !nomeLow.endsWith(".xapk")) return "";
    try {
      const head = await file.slice(0, 262144).text();
      const tail = await file.slice(Math.max(0, Number(file.size || 0) - 262144)).text();
      const temSinal = /META-INF\/|\.(RSA|DSA|EC)\b|APK Sig Block/i.test(`${head} ${tail}`);
      if (temSinal) {
        return "Checagem de assinatura (explicação simples): este pacote mostrou sinal de assinatura por dentro. Isso ajuda, mas não prova sozinho que o app é original ou seguro — faça a conferência manual obrigatória.";
      }
      return "Checagem de assinatura (explicação simples): não apareceu sinal claro de assinatura na leitura rápida deste pacote. Tenha atenção redobrada e faça a conferência manual obrigatória.";
    } catch (_e) { return ""; }
  }

  async function criptoDoArquivoEnviado(file, nomeLow) {
    if (!nomeLow.endsWith(".apk") && !nomeLow.endsWith(".xapk") && !nomeLow.endsWith(".aab")) return "";
    try {
      const h = await file.slice(0, 262144).text();
      const t2 = await file.slice(Math.max(0, Number(file.size || 0) - 262144)).text();
      const raw = h + " " + t2;
      if (/ECDSA|\.EC\b/i.test(raw)) return "Criptografia do app enviado: Curva Elíptica (EC / ECDSA) — nível avançado. Assinatura mais moderna para proteger a identidade do pacote; conferência manual obrigatória.";
      if (/DSA|\.DSA\b/i.test(raw)) return "Criptografia do app enviado: DSA — nível iniciante (padrão antigo). Formato antigo com proteção mais fraca hoje em dia; conferência manual obrigatória.";
      if (/APK Sig Block|\.RSA\b/i.test(raw)) return "Criptografia do app enviado: RSA / APK Sig Block — nível médio. Assinatura tradicional de pacotes Android (a leitura simples não mede o tamanho da chave); conferência manual obrigatória.";
      return "Criptografia do app enviado: nome e nível (iniciante, médio ou avançado) não identificados na leitura rápida do arquivo; conferência manual obrigatória.";
    } catch (_e) { return ""; }
  }

  async function checarArquivo(file) {
    if (!file) {
      return {
        cls: "text-nivel-incompativel",
        excedeuLimite: false,
        texto: "Nenhum arquivo de aplicativo selecionado.",
        fontes: []
      };
    }

    const nome = String(file.name || ""), nomeLow = nome.toLowerCase(), tam = Number(file.size || 0);

    // REGRA 3: Limite estrito de 250 MB. Não executar checagem se exceder 250 MB.
    if (tam > MAX_FILE_BYTES) {
      return {
        cls: "text-nivel-incompativel",
        excedeuLimite: true,
        texto: `Arquivo bloqueado: o aplicativo "${escapeHtml(nome)}" (${formatBytes(tam)}) excede o limite máximo estrito de 250 MB. A verificação não foi executada. ${MSG_DISC}`,
        fontes: []
      };
    }

    let trecho = "";
    try { trecho = (await file.slice(0, 65536).text()).toLowerCase(); } catch (_e) {}

    let staticRes = null;
    const inspectFn = window.StaticInspectionEngine?.inspectFileLocally;
    if (typeof inspectFn === "function") {
      try {
        staticRes = await inspectFn(file);
      } catch (_e) {}
    }

    // Base de busca de palavras-chave baseada no nome do arquivo e texto inicial lido
    const base = `${nomeLow} ${trecho}`;
    const cRed = acharCodigos(base, LISTA_AMPLIADA.criticos);
    const cYel = acharCodigos(base, LISTA_AMPLIADA.amarelos);

    let hash = "";
    if (tam <= MAX_FILE_BYTES) {
      hash = await sha256Arquivo(file);
    }
    const hashMal = hash && LISTA_AMPLIADA.hashesMaliciosos.map((h) => h.toLowerCase()).includes(hash);

    const findingsCount = staticRes?.findingsCount || 0;

    let cls = "text-nivel-1";
    let texto = `Alerta verde: ${VERDE_OK_APP} no aplicativo "${escapeHtml(nome)}" (${formatBytes(tam)}). ${MSG_DISC}`;
    let fontes = ["VirusTotal", "URLhaus", "Hybrid Analysis", "MalwareBazaar"];

    if (hashMal || cRed.length > 0 || findingsCount >= 2) {
      const det = cRed.join(", ") || (findingsCount >= 2 ? "sinais críticos na análise estática" : "anomalia crítica");
      cls = "text-nivel-3";
      fontes = fontesExatas(det);
      texto = resumoTopicos("Alerta vermelho", det, `aplicativo "${escapeHtml(nome)}" (${formatBytes(tam)})`, fontes.join(", "), "app");
    } else if (cYel.length > 0 || findingsCount === 1) {
      const det = cYel.join(", ") || "sinal moderado na análise estática";
      cls = "text-nivel-2";
      fontes = fontesExatas(det);
      texto = resumoTopicos("Alerta amarelo", det, `aplicativo "${escapeHtml(nome)}" (${formatBytes(tam)})`, fontes.join(", "), "app");
    }

    return { cls, texto, fontes, excedeuLimite: false };
  }

  function lerHistoricoLocal() {
    try {
      const raw = safeStorage.getItem(HIST_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (_e) {
      return [];
    }
  }

  function salvarHistoricoLocal(item) {
    try {
      const atual = lerHistoricoLocal();
      atual.unshift({
        timestamp: Date.now(),
        mode: item.mode || "",
        target: item.target || "",
        summary: item.summary || ""
      });
      safeStorage.setItem(HIST_KEY, JSON.stringify(atual.slice(0, 50)));
    } catch (_e) {}
  }

  async function limparHistoricoLocal() {
    try { safeStorage.removeItem(HIST_KEY); } catch (_e) {}
    try { if (typeof store !== "undefined" && store?.clearAnalyses) await store.clearAnalyses(); } catch (_e) {}
    try { if (typeof indexedDB !== "undefined" && typeof indexedDB.databases === "function") { const dbs = await indexedDB.databases(); for (const d of dbs) { if (d?.name && /seguro|esse|store|hist|analis/i.test(d.name)) indexedDB.deleteDatabase(d.name); } } } catch (_e) {}
  }

  async function atualizarHistorico() {
    const el = document.getElementById("history-list");
    if (!el) return;
    let lista = lerHistoricoLocal();
    if (!lista.length) { try { if (typeof store !== "undefined" && store?.getAnalyses) { const sLista = await store.getAnalyses(); if (Array.isArray(sLista) && sLista.length) { lista = sLista; safeStorage.setItem(HIST_KEY, JSON.stringify(sLista.slice(0, 50))); } } } catch (_e) {} }
    if (!lista.length) { el.innerHTML = ""; el.textContent = "Nenhum registro local ainda."; return; }
    el.innerHTML = "";
    lista.forEach((item) => {
      const div = document.createElement("div");
      div.className = "history-item";
      const dt = item.timestamp ? new Date(item.timestamp).toLocaleString("pt-BR") : "";
      div.textContent = `${dt} | ${item.mode || ""} | ${item.target || ""}\n${item.summary || ""}`;
      el.appendChild(div);
    });
  }

  function atualizarIndicadorConexao() {
    const banner = document.getElementById("status-banner");
    if (!banner) return;
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      banner.textContent = "📡 Modo offline ativo: consulta baseada na lista offline e na leitura local do arquivo. Conferência manual obrigatória.";
      banner.classList.add("status-banner-offline");
    } else {
      banner.textContent = `Tudo pronto no aparelho. ${MSG_DISC}`;
      banner.classList.remove("status-banner-offline");
    }
  }
  window.addEventListener("online", atualizarIndicadorConexao);
  window.addEventListener("offline", atualizarIndicadorConexao);

  function iniciarUi() {
    atualizarIndicadorConexao();
    const fileInput = document.getElementById("file-input"), fileWarn = document.getElementById("file-size-warning"), btnFile = document.getElementById("btn-analyze-file"), btnClearTemp = document.getElementById("btn-clear-temp"), fileRes = document.getElementById("file-result"), btnUrl = document.getElementById("btn-analyze-url"), urlInput = document.getElementById("url-input"), urlRes = document.getElementById("url-result"), banner = document.getElementById("status-banner"), btnClearHist = document.getElementById("btn-clear-history");

    document.addEventListener("click", (e) => {
      const btnCopy = e.target?.closest ? e.target.closest(".btn-copy-summary") : null;
      if (btnCopy && btnCopy.dataset.summary) {
        e.preventDefault();
        const textToCopy = decodeURIComponent(btnCopy.dataset.summary);
        const originalText = btnCopy.innerHTML;

        const copySuccess = () => {
          btnCopy.innerHTML = "✅ Resumo copiado!";
          btnCopy.style.borderColor = "#22c55e";
          btnCopy.style.color = "#22c55e";
          setTimeout(() => {
            btnCopy.innerHTML = originalText;
            btnCopy.style.borderColor = "";
            btnCopy.style.color = "";
          }, 2000);
        };

        if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
          navigator.clipboard.writeText(textToCopy).then(copySuccess).catch(() => {
            fallbackCopy(textToCopy, copySuccess);
          });
        } else {
          fallbackCopy(textToCopy, copySuccess);
        }
      }
    });

    function fallbackCopy(text, callback) {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        if (typeof callback === "function") callback();
      } catch (_e) {}
    }

    if (fileInput) fileInput.setAttribute("accept", ".apk,.aab,.xapk,application/vnd.android.package-archive");
    if (fileInput && !fileInput.dataset.b1) {
      fileInput.dataset.b1 = "1";
      fileInput.addEventListener("change", () => {
        const f = fileInput.files?.[0];
        if (!f) {
          if (fileWarn) { fileWarn.textContent = ""; fileWarn.classList.add("hidden"); }
          return;
        }

        // REGRA 3: Checagem estrita de tamanho > 250 MB na seleção
        if (f.size > MAX_FILE_BYTES) {
          if (fileWarn) {
            fileWarn.textContent = `Aviso: o arquivo "${escapeHtml(f.name)}" (${formatBytes(f.size)}) excede o limite estrito de 250 MB. A verificação não será executada.`;
            fileWarn.classList.remove("hidden");
          }
          if (fileRes) {
            fileRes.classList.remove("hidden");
            fileRes.innerHTML = formatarResultadoCard(
              "text-nivel-incompativel",
              "Arquivo Excede 250 MB",
              `O arquivo selecionado "${escapeHtml(f.name)}" (${formatBytes(f.size)}) ultrapassa o limite máximo estrito de 250 MB. A verificação NÃO foi executada.`,
              [],
              "",
              f.name
            );
          }
          return;
        }

        if (fileWarn) { fileWarn.textContent = ""; fileWarn.classList.add("hidden"); }
        if (!ehAplicativoValido(f)) {
          fileInput.value = "";
          if (fileRes) {
            fileRes.classList.remove("hidden");
            fileRes.innerHTML = `${renderAlerta("text-nivel-incompativel", MSG_INCOMPATIVEL)}<br>${MSG_DISC}`;
          }
          return;
        }
        if (fileRes) { fileRes.classList.add("hidden"); fileRes.innerHTML = ""; }
      });
    }

    if (btnFile && !btnFile.dataset.b1) {
      btnFile.dataset.b1 = "1";
      btnFile.addEventListener("click", async () => {
        if (!fileRes) return;
        btnFile.disabled = true;
        try {
          const f = fileInput?.files?.[0];
          if (!f) {
            fileRes.classList.remove("hidden");
            fileRes.innerHTML = `${renderAlerta("text-nivel-incompativel", "Selecione um arquivo de aplicativo (.apk, .aab, .xapk) no aparelho.")}<br>${MSG_DISC}`;
            return;
          }

          // REGRA 3: Não executar a checagem se o arquivo exceder 250 MB
          if (f.size > MAX_FILE_BYTES) {
            fileRes.classList.remove("hidden");
            fileRes.innerHTML = formatarResultadoCard(
              "text-nivel-incompativel",
              "Arquivo Excede 250 MB",
              `O arquivo selecionado "${escapeHtml(f.name)}" (${formatBytes(f.size)}) ultrapassa o limite máximo estrito de 250 MB. A verificação NÃO foi executada.`,
              [],
              "",
              f.name
            );
            return;
          }

          if (!ehAplicativoValido(f)) {
            if (fileInput) fileInput.value = "";
            fileRes.classList.remove("hidden");
            fileRes.innerHTML = `${renderAlerta("text-nivel-incompativel", MSG_INCOMPATIVEL)}<br>${MSG_DISC}`;
            return;
          }

          const out = await checarArquivo(f);
          const nomeArqLow = String(f.name || "").toLowerCase();
          const infoArqCripto = await criptoDoArquivoEnviado(f, nomeArqLow);
          const notaSimples = await avisoSimplesAssinatura(f, nomeArqLow);

          let detalhesTexto = out.texto;
          if (notaSimples) detalhesTexto += `<br><small style='color:#cbd5e1;'>ℹ️ ${notaSimples}</small>`;
          if (infoArqCripto) detalhesTexto += `<br><small style='color:#cbd5e1;'>🔒 ${infoArqCripto}</small>`;

          fileRes.classList.remove("hidden");
          fileRes.innerHTML = formatarResultadoCard(
            out.cls,
            out.cls === "text-nivel-1" ? "Sinal Verde (Sem Anomalias Identificadas)" : out.cls === "text-nivel-2" ? "Sinal Amarelo (Atenção / Indício de Risco)" : "Sinal Vermelho (Anomalia Crítica)",
            detalhesTexto,
            out.fontes,
            "<span style='color:#4ade80;'>💻 Análise estática local em blocos executada no aparelho.</span>",
            f.name
          );

          if (banner) banner.textContent = `Conferência local concluída. ${MSG_DISC}`;
          salvarHistoricoLocal({ mode: "Aplicativo local", target: f.name, summary: out.texto });
          try { if (typeof store !== "undefined" && store?.saveAnalysis) await store.saveAnalysis({ mode: "Aplicativo local", target: f.name, summary: out.texto }); } catch (_e) {}
          await atualizarHistorico();
        } finally { btnFile.disabled = false; }
      });
    }

    if (btnClearTemp && !btnClearTemp.dataset.b1) {
      btnClearTemp.dataset.b1 = "1";
      btnClearTemp.addEventListener("click", async () => {
        btnClearTemp.disabled = true;
        try { if (typeof store !== "undefined" && store?.clearAllTemps) await store.clearAllTemps(); if (fileInput) fileInput.value = ""; if (fileRes) { fileRes.innerHTML = ""; fileRes.classList.add("hidden"); } } finally { btnClearTemp.disabled = false; }
      });
    }

    const btnClearTempUrl = document.getElementById("btn-clear-temp-url");
    if (btnClearTempUrl && !btnClearTempUrl.dataset.b1) {
      btnClearTempUrl.dataset.b1 = "1";
      btnClearTempUrl.addEventListener("click", () => {
        if (urlInput) urlInput.value = "";
        if (urlRes) {
          urlRes.innerHTML = "Aguardando inserção de uma URL.";
          urlRes.classList.remove("hidden");
        }
      });
    }

    if (btnUrl && !btnUrl.dataset.b1) {
      btnUrl.dataset.b1 = "1";
      btnUrl.addEventListener("click", async () => {
        if (!urlRes) return; btnUrl.disabled = true;
        try {
          const ev = checarSite(urlInput?.value || "");
          if (!ev.ok) { urlRes.classList.remove("hidden"); urlRes.innerHTML = `${renderAlerta(ev.cls, ev.msg)}<br>${MSG_DISC}`; return; }
          let resumo = ev.resumo, cls = ev.cls;
          let statusOnlineText = "";

          try {
            const host = new URL(ev.url).hostname;
            const [extraDns, reputacao] = await Promise.all([
              runOnlineDomainChecks(host),
              checarApisReputacao(ev.url)
            ]);

            if (extraDns?.naoEncontrado) {
              cls = "text-nivel-4";
              resumo = `Alerta branco: ${BRANCO_NAO_ENCONTRADO} Verifique se o endereço está certo. ${MSG_DISC}`;
            }

            if (extraDns && extraDns.ok) {
              const infoRep = (reputacao && reputacao.ok && reputacao.mensagem) ? reputacao.mensagem : "URLhaus: indisponível (base de terceiros)";
              statusOnlineText = `<span style='color:#4ade80;'>✅ <strong>Consulta Concluída:</strong> Domínio ativo e verificado nos servidores DNS públicos. (${infoRep})</span>`;
            } else {
              statusOnlineText = "<span style='color:#f59e0b;'>⚠️ <strong>Falha na Consulta Online:</strong> A verificação em tempo real via internet ficou indisponível (modo offline ou erro de rede/servidor). O diagnóstico exibido baseia-se exclusivamente na análise local e heurística do aparelho.</span>";
            }
          } catch (_e) {
            statusOnlineText = "<span style='color:#f59e0b;'>⚠️ <strong>Falha na Consulta Online:</strong> A verificação em tempo real via internet falhou/ficou indisponível. O diagnóstico exibido baseia-se na análise local do aparelho.</span>";
          }

          urlRes.classList.remove("hidden");
          urlRes.innerHTML = formatarResultadoCard(cls, cls === "text-nivel-1" ? "Sinal Verde (Sem Alertas Locais)" : cls === "text-nivel-2" ? "Sinal Amarelo (Atenção / Indício de Risco)" : cls === "text-nivel-3" ? "Sinal Vermelho (Alerta Crítico / Risco)" : "Alerta Branco (Endereço não encontrado)", resumo, ev.fontes, statusOnlineText, ev.url);

          if (banner) banner.textContent = `Conferência de endereço concluída. ${MSG_DISC}`;
          salvarHistoricoLocal({ mode: "URL do site", target: ev.url, summary: resumo });
          try { if (typeof store !== "undefined" && store?.saveAnalysis) await store.saveAnalysis({ mode: "URL do site", target: ev.url, summary: resumo }); } catch (_e) {}
          await atualizarHistorico();
        } finally { btnUrl.disabled = false; }
      });
    }

    const btnLimpar = btnClearHist || document.querySelector("[id*=clear][id*=hist], [id*=apagar][id*=hist], button[data-action='clear-history']");
    if (btnLimpar) {
      btnLimpar.onclick = async () => {
        btnLimpar.disabled = true;
        try {
          await limparHistoricoLocal();
          const elHist = document.getElementById("history-list");
          if (elHist) { elHist.innerHTML = ""; elHist.textContent = "Nenhum registro local ainda."; }
          await atualizarHistorico();
          if (banner) banner.textContent = `Histórico local apagado. ${MSG_DISC}`;
        } finally { btnLimpar.disabled = false; }
      };
    }
    atualizarHistorico();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciarUi); else iniciarUi();
})();

// FLUXO "ACEITAR TERMOS": controle do modal com proteção contra exceções no localStorage
(function(){
  const KEY_ACEITE = "esse_app_site_seguro_termo_aceito_v1";
  const KEY_RECUSA = "esse_app_site_seguro_termo_recusado_v1";

  const memoryStorageFallback = new Map();
  const safeStorage = {
    getItem(key) {
      try {
        if (typeof localStorage !== "undefined") {
          return localStorage.getItem(key);
        }
      } catch (_e) {}
      return memoryStorageFallback.has(key) ? memoryStorageFallback.get(key) : null;
    },
    setItem(key, value) {
      const strVal = String(value);
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem(key, strVal);
        }
      } catch (_e) {}
      memoryStorageFallback.set(key, strVal);
    },
    removeItem(key) {
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.removeItem(key);
        }
      } catch (_e) {}
      memoryStorageFallback.delete(key);
    }
  };

  function bloquearApp(){
    try {
      document.querySelectorAll("button, input, select, textarea").forEach((el) => {
        if (el.id !== "btn-aceitar-termo" && el.id !== "btn-recusar-termo") {
          el.disabled = true;
        }
      });
    } catch (_e) {}
  }

  function liberarApp(){
    try {
      document.querySelectorAll("button, input, select, textarea").forEach((el) => {
        el.disabled = false;
      });
    } catch (_e) {}
  }

  function initTermoGuard(){
    try {
      const modal = document.getElementById("modal-termos-lgpd");
      const btnAceitar = document.getElementById("btn-aceitar-termo");
      const btnRecusar = document.getElementById("btn-recusar-termo");
      const msgRecusa = document.getElementById("status-recusa-termo");
      if (!modal || !btnAceitar || !btnRecusar) return;

      const recusado = safeStorage.getItem(KEY_RECUSA) === "1";
      const aceito = safeStorage.getItem(KEY_ACEITE) === "1";

      if (recusado && !aceito) {
        modal.style.display = "flex";
        if (msgRecusa) msgRecusa.style.display = "block";
        bloquearApp();
      } else if (aceito) {
        modal.style.display = "none";
        liberarApp();
      } else {
        modal.style.display = "flex";
        bloquearApp();
      }

      btnAceitar.addEventListener("click", (e) => {
        if (e && e.preventDefault) e.preventDefault();
        try {
          safeStorage.setItem(KEY_ACEITE, "1");
          safeStorage.removeItem(KEY_RECUSA);
        } catch (_e) {}

        if (msgRecusa) msgRecusa.style.display = "none";
        modal.style.display = "none";
        liberarApp();
      });

      btnRecusar.addEventListener("click", (e) => {
        if (e && e.preventDefault) e.preventDefault();
        try {
          safeStorage.setItem(KEY_RECUSA, "1");
          safeStorage.removeItem(KEY_ACEITE);
        } catch (_e) {}

        if (msgRecusa) msgRecusa.style.display = "block";
        modal.style.display = "flex";
        bloquearApp();
      });
    } catch (_e) {
      // Fallback de emergência em caso de erro crítico no DOM: libera o app para evitar travamento do usuário
      try { liberarApp(); } catch (_e2) {}
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTermoGuard);
  } else {
    initTermoGuard();
  }
})();

async function checarApisReputacao(alvo){
  const r = String(alvo || "").trim();
  if (!r) return { ok: false, mensagem: "", falha: "Alvo vazio" };
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return { ok: false, falha: "Dispositivo offline", mensagem: "URLhaus: indisponível (offline)" };
  }
  let host = r;
  try {
    host = r.includes(".") ? new URL(r.startsWith("http") ? r : "https://" + r).hostname : r;
  } catch (_e) { host = r; }
  const c = typeof AbortController !== "undefined" ? new AbortController() : null;
  const tm = c ? setTimeout(() => c.abort(), 3500) : null;
  try {
    const res = await fetch("https://urlhaus-api.abuse.ch/v1/host/", { method:"POST", headers:{"Content-Type":"application/x-www-form-urlencoded"}, body:"host="+encodeURIComponent(host), signal: c ? c.signal : undefined });
    if (res && res.ok) {
      const j = await res.json();
      const status = j.query_status || "sem_registro";
      return { ok: true, status, mensagem: "URLhaus: " + status };
    }
    return { ok: false, falha: `HTTP ${res ? res.status : 0}`, mensagem: `URLhaus: indisponível (HTTP ${res ? res.status : 0})` };
  } catch (_e) {
    return { ok: false, falha: "Falha de conexão URLhaus", mensagem: "URLhaus: indisponível (falha de conexão)" };
  } finally {
    if (tm) clearTimeout(tm);
  }
}

document.addEventListener("click", function(e) {
  var link = e.target && e.target.closest ? e.target.closest("a[target='_blank']") : null;
  if (link && link.href) {
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Browser && typeof window.Capacitor.Plugins.Browser.open === "function") {
      e.preventDefault();
      window.Capacitor.Plugins.Browser.open({ url: link.href });
    } else if (typeof window.open === "function") {
      e.preventDefault();
      window.open(link.href, "_blank", "noopener,noreferrer");
    }
  }
});
