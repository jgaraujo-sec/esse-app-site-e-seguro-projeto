(() => {
 const MAGIC = [
 { label: "ZIP / APK", exts: [".zip", ".apk", ".jar", ".aab"], m: (b) => b.length >= 4 && b[0] === 0x50 && b[1] === 0x4b },
 { label: "Android DEX", exts: [".dex"], m: (b) => b.length >= 4 && b[0] === 0x64 && b[1] === 0x65 && b[2] === 0x78 && b[3] === 0x0a },
 { label: "MZ / PE", exts: [".exe", ".dll"], m: (b) => b.length >= 2 && b[0] === 0x4d && b[1] === 0x5a },
 { label: "PDF", exts: [".pdf"], m: (b) => b.length >= 4 && b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46 },
 { label: "PNG", exts: [".png"], m: (b) => b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
 { label: "JPEG", exts: [".jpg", ".jpeg"], m: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff }
 ];
 const RULES = [
 { cwe: "CWE-95", masvs: "MASVS-CODE", t: "Execucao dinamica (eval/Function)", tip: "Reveja manualmente.", r: /\b(eval|new\s+Function)\s*\(/i },
 { cwe: "CWE-79", masvs: "MASVS-PLATFORM", t: "HTML direto (innerHTML/write)", tip: "Reveja entradas externas.", r: /\b(innerHTML|outerHTML)\s*=|document\.write\s*\(/i },
 { cwe: "CWE-798", masvs: "MASVS-STORAGE", t: "Possivel segredo/chave fixa", tip: "Reveja credenciais no texto.", r: /\b(api[_-]?key|secret[_-]?key|password|passwd|auth[_-]?token)\b\s*[:=]\s*["'][^"'\s]{6,}["']/i },
 { cwe: "CWE-319", masvs: "MASVS-NETWORK", t: "Ligacao sem cifra (http://)", tip: "Sem HTTPS fora de local.", r: /http:\/\/(?!localhost|127\.0\.0\.1)[a-z0-9.-]+/i },
 { cwe: "CWE-489/250", masvs: "MASVS-RESILIENCE", t: "Depuracao / permissao sensivel", tip: "Reveja manifesto e permissoes.", r: /(android:debuggable\s*=\s*["']true["']|android:allowBackup\s*=\s*["']true["']|REQUEST_INSTALL_PACKAGES|READ_SMS|BIND_ACCESSIBILITY_SERVICE|SYSTEM_ALERT_WINDOW)/i }
 ];
 const extOf = (n) => (!n || !n.includes(".")) ? "" : "." + n.split(".").pop().toLowerCase();
 const isTxt = (b) => {
 if (!b || !b.length) return false;
 const n = Math.min(b.length, 4096);
 let ok = 0;
 for (let i = 0; i < n; i++) { if (b[i] === 0) return false; if ((b[i] >= 32 && b[i] <= 126) || b[i] === 9 || b[i] === 10 || b[i] === 13 || b[i] >= 160) ok++; }
 return ok / n >= 0.85;
 };
 async function inspectFileLocally(file) {
 const ext = extOf(file.name);
 const head = new Uint8Array(await file.slice(0, 64).arrayBuffer());
 const sig = MAGIC.find((x) => x.m(head)) || null;
 const mis = sig ? (ext && !sig.exts.includes(ext)) : Boolean(ext && [".apk", ".exe", ".pdf", ".png", ".jpg", ".jpeg", ".dex"].includes(ext));
 const buf = new Uint8Array(await file.slice(0, 524288).arrayBuffer());
 const hits = [];
 if (mis) hits.push({ cwe: "CWE-434", masvs: "MASVS-CODE", t: "Extensao diverge da assinatura", tip: ext || "sem extensao" });
 const txtOk = isTxt(buf);
 if (txtOk) {
 const txt = new TextDecoder("utf-8", { fatal: false }).decode(buf);
 RULES.forEach((r) => { if (r.r.test(txt)) hits.push(r); });
 }
 const st = hits.length >= 2 ? "Atencao reforcada" : hits.length === 1 ? "Atencao moderada" : "Sem sinais criticos";
 const out = ["Inspecao estatica local: " + st, "• Assinatura: " + (sig ? sig.label : "nao listada") + ".", txtOk ? "• Texto/codigo conferido." : "• Binario/compactado."];
 hits.forEach((h, i) => out.push((i + 1) + ". " + h.t + " [" + h.cwe + " | " + h.masvs + "] — " + h.tip));
 if (!hits.length) out.push("• Nenhum padrao disparou.");
 out.push("• A conferencia manual continua obrigatoria.");
 return { formattedText: out.join("\n"), findingsCount: hits.length };
 }
 window.StaticInspectionEngine = { inspectFileLocally };
})();
