# Esse App/Site é seguro? — Documentação v1.8

**Versão:** 1.8 (`versionName "1.8"`)  
**Código da Versão:** 11 (`versionCode 11`)  
**Execução:** 100% local no dispositivo Android (via Capacitor & Web Engine local)

---

## 🛠️ Visão Geral e Novidades da Versão 1.8

A versão **1.8** do aplicativo **Esse App/Site é seguro?** introduz melhorias fundamentais de segurança, precisão na análise estática heurística e rigor técnico na prevenção de falsos positivos para a checagem de aplicativos (.apk, .aab, .xapk) e sites (URLs).

---

## 📋 Principais Funcionalidades e Regras Técnicas

### 1. Nomenclatura Exata e Classificação Específica
- **Preservação do Nome do Alvo:** O nome real do arquivo analisado (`f.name`) ou o endereço de URL (`u.href`) nunca é substituído por rótulos genéricos. O alvo registrado é preservado em todas as etapas de exibição e histórico.
- **Categorização Específica de Riscos:**
  - **Conteúdo adulto/pornográfico:** Identificação direta e específica (*"Conteúdo adulto/pornográfico: indício de conteúdo adulto/pornográfico detectado"*).
  - **Golpe e fraude:** Classificação dedicada para indícios de estelionato digital, engenharia social e páginas clonadas (*"Golpe e fraude: indícios de golpe ou fraude"*).
  - **Falhas na segurança:** Diagnóstico exclusivo para artefatos maliciosos, exploits, trojans ou binários com anomalias estáticas (*"Falhas na segurança: indícios de falhas de segurança ou aplicativo/site malicioso"*).

### 2. Rigor Técnico e Redução de Falsos Positivos (`matchKeyword`)
- **Fronteira de Palavras/Tokens (`www/js/main.js`):** Implementada a correspondência estrita utilizando expressões regulares de limite de token (`(?:^|[^a-z0-9à-á-â-ã-é-ê-í-ó-ô-õ-ú-ç])` + `escapeRegex(k)` + `(?:$|[^a-z0-9à-á-â-ã-é-ê-í-ó-ô-õ-ú-ç])`).
- **Eliminação de Falsos Casamentos por Substring:** Palavras-chave como `"mod"`, `"xxx"`, `"rat"`, `"patch"`, `"sex"`, `"hack"`, `"clone"`, `"copia"` e `"crack"` só disparam quando identificadas como **palavras inteiras/tokens isolados**, evitando falsos alarmes em identificadores normais (como `modelo`, `modulo`, `commodities`, `sexta`, `estratégia`, `despacho`).
- **Remoção de Termos Meta-Descritivos:** Termos como `"atencao moderada"`, `"atencao reforcada"`, `"indicio"`, `"suspeito"` e `"alerta"` foram removidos das bases de ameaças para prevenir autorreferência e falsos alertas no relatório textual gerado pela inspeção.

### 3. Limite Estrito de 250 MB para Aplicativos
- **Bloqueio Antecipado (250 MB / 262.144.000 bytes):** Ao selecionar ou tentar analisar um arquivo com tamanho superior a 250 MB, a verificação é **bloqueada imediatamente antes** de qualquer leitura em bloco, cálculo de hash SHA-256 ou inspeção estática em memória.
- **Mapeamento nos Módulos:** Implementado e validado em `www/js/main.js`, `www/js/stream-reader.js` e `www/js/static-hook.js`. Uma mensagem clara de aviso é exibida na interface informando o limite de 250 MB.

### 4. Gestão de Cache e WebView (`www/` como Fonte da Verdade)
- **Desativação de Cache no Android (`MainActivity.java`):** Configurado `WebSettings.LOAD_NO_CACHE` no WebView do Android para garantir que os recursos mais recentes sejam sempre carregados.
- **Cabeçalhos HTTP de Prevenção (`www/index.html`):** Adicionadas as tags meta de controle de cache (`Cache-Control: no-cache, no-store, must-revalidate`, `Pragma: no-cache` e `Expires: 0`).
- **Sincronização Capacitor:** A pasta `www/` funciona como a única fonte da verdade, sendo sincronizada com o projeto Android via `npx cap sync android` (copiando assets para `android/app/src/main/assets/public`).

### 5. Sanitização de Saída (XSS Prevention)
- **Escape HTML:** Todos os dados dinâmicos e resultados processados passam pela função `escapeHtml` antes de serem renderizados no DOM HTML dos cards de resultado.

---

## 📁 Estrutura do Projeto

```
esse-app-site-e-seguro-projeto/
├── www/                        # Código-fonte Web (Fonte da Verdade)
│   ├── index.html              # Interface principal e meta-tags de cache
│   ├── css/                    # Estilos CSS da aplicação e do motor estático
│   └── js/                     # Módulos JavaScript (main.js, config.js, local-store.js, etc.)
├── android/                    # Projeto Android nativo integrado via Capacitor
│   ├── app/                    # Módulo principal do aplicativo Android
│   │   ├── build.gradle        # Configuração Gradle (versionCode 11, versionName "1.8")
│   │   └── src/main/java/      # Código nativo Java (MainActivity.java)
│   ├── build.gradle            # Gradle raíz do projeto Android
│   └── settings.gradle         # Configurações de submódulos Capacitor
├── testes-locais/              # Scripts e arquivos de teste local e heurística
├── capacitor.config.json       # Configuração global do Capacitor
├── package.json                # Dependências de desenvolvimento e scripts npm
├── .gitignore                  # Regras de exclusão do Git
└── README.md                   # Documentação oficial da versão 1.8
```

---

## 🔒 Controle de Versão e Arquivos Ignorados (`.gitignore`)

O arquivo `.gitignore` na raiz do projeto está configurado para **excluir estritamente**:
- **Dependências e Builds:** `node_modules/`, `android/app/build/`, `android/build/`, `.gradle/`, `.idea/`.
- **Segredos e Propriedades Locais:** `local.properties`, `.env`, `.env.*`.
- **Chaves de Assinatura e Artefatos Gerados:** `/keystore`, `*.jks`, `*.keystore`, `*.pem`, `*.pk8`, `*.apk`, `*.aab`.
