# Esse App/Site é seguro?

Aplicação Android construída com **Capacitor** e código-fonte web em `www/` para verificação de aplicativos e sites/URLs com foco em critérios técnicos, redução de falsos positivos e privacidade.

## Novidades da v1.8 (`versionCode 11`)

- **Nomenclatura exata e classificação específica:** preserva o nome original do arquivo ou URL analisada sem sobrescrita por rótulos genéricos, classificando explicitamente categorias comprovadas (como *Conteúdo adulto/pornográfico*, *Golpe e fraude* e *Falhas na segurança*).
- **Correspondência por fronteira de palavras/tokens:** a função `matchKeyword` em `www/js/main.js` evita falsos positivos causados por trechos de palavras (ex.: `mod`, `xxx`, `rat`, `patch`, `sex`, `hack`, `clone`, `copia`) em termos normais.
- **Limite estrito de 250 MB para apps:** arquivos acima de 250 MB (`250 * 1024 * 1024` bytes) são bloqueados antes da leitura, hash ou inspeção estática (`www/js/main.js`, `www/js/stream-reader.js` e `www/js/static-hook.js`), exibindo aviso claro ao utilizador.
- **Prevenção de cache antigo:** cabeçalhos sem cache em `www/index.html` e `WebSettings.LOAD_NO_CACHE` em `MainActivity.java`, mantendo `www/` como fonte da verdade sincronizada via Capacitor.
- **Sanitização de saída:** manutenção de `escapeHtml` na renderização de resultados.

## Estrutura do projeto

- `www/`: código-fonte web da aplicação (fonte da verdade).
- `android/`: projeto nativo Android gerido pelo Capacitor (`versionCode 11`, `versionName "1.8"`).
- `testes-locais/`: ficheiros e cenários de teste locais.

## Segurança e versionamento

- Binários de compilação (`*.apk`, `*.aab`), pastas de *build*, `node_modules/`, `.env`, `local.properties` e a pasta `keystore/` são ignorados via `.gitignore` e não são versionados no repositório.