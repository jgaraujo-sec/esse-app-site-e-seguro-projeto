(() => {
 const MAX_BYTES = 250 * 1024 * 1024;
 const runNow = async () => {
 try {
 const inp = document.querySelector('input[type="file"]');
 let box = document.getElementById("static-report-output");
 if (!box) {
 box = document.createElement("pre");
 box.id = "static-report-output";
 box.style.whiteSpace = "pre-wrap";
 (document.querySelector("main") || document.body).appendChild(box);
 }
 const f = inp && inp.files && inp.files[0];
 if (!f) {
 box.textContent = window.StaticInspectionEngine
 ? " Selecione um arquivo e faça a conferência manual."
 : "Motor estatico nao carregado nesta pagina.";
 return;
 }
 if (f.size > MAX_BYTES) {
 box.textContent = `O arquivo "${f.name}" excede o limite estrito de 250 MB. A verificação não foi executada.`;
 return;
 }
 if (!window.StaticInspectionEngine || typeof window.StaticInspectionEngine.inspectFileLocally !== "function") {
 box.textContent = "Motor estatico nao carregado nesta pagina.";
 return;
 }
 box.textContent = "Conferindo assinatura e sinais estaticos no aparelho...";
 const r = await window.StaticInspectionEngine.inspectFileLocally(f);
 box.textContent = r ? (r.formattedText || "") : "Sem resultado da inspeção estática.";
 } catch (err) {
 const box = document.getElementById("static-report-output");
 if (box) {
 box.textContent = "Erro na execução da inspeção estática: " + (err && err.message ? err.message : "falha desconhecida");
 }
 }
 };
 document.addEventListener("change", (e) => { if (e.target && e.target.type === "file") runNow(); });
 document.addEventListener("click", (e) => { if (e.target && /verificar/i.test(e.target.textContent || "")) setTimeout(runNow, 80); });
 if (document.readyState !== "loading") runNow();
 else document.addEventListener("DOMContentLoaded", runNow);
})();
