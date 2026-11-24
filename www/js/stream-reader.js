class StreamReaderService {
 constructor(config, localStore) {
 this.config = config || {};
 this.localStore = localStore;
 }

 validateFileSize(file) {
 if (!file) {
 return {
 ok: false,
 exceededMax: false,
 aboveWarningThreshold: false,
 message: "Nenhum arquivo foi selecionado no seletor."
 };
 }

 const maxBytes = (this.config && this.config.maxUploadBytes) || (250 * 1024 * 1024);
 const warnBytes = (this.config && this.config.warnAboveBytes) || (100 * 1024 * 1024);

 if (file.size > maxBytes) {
 return {
 ok: false,
 exceededMax: true,
 aboveWarningThreshold: true,
 message: `Arquivo bloqueado: o tamanho (${formatBytes(file.size)}) ultrapassa o limite máximo estrito de 250 MB (${formatBytes(maxBytes)}). A verificação não foi executada.`
 };
 }

 const aboveWarningThreshold = file.size > warnBytes;
 return {
 ok: true,
 exceededMax: false,
 aboveWarningThreshold,
 warningMessage: aboveWarningThreshold
 ? `Aviso: o arquivo tem ${formatBytes(file.size)} (acima de 100 MB). A leitura local em blocos no celular pode demorar mais.`
 : ""
 };
 }

 async readFileInChunks(file, onProgress) {
 const validation = this.validateFileSize(file);
 if (!validation.ok) {
 return {
 ok: false,
 error: validation.message,
 exceededMax: validation.exceededMax
 };
 }

 const chunkSize = (this.config && this.config.chunkSizeBytes) || (256 * 1024);
 const tempId = `tmp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
 if (this.localStore && typeof this.localStore.saveTempMetadata === "function") {
 await this.localStore.saveTempMetadata(tempId, {
 fileName: file.name,
 fileSize: file.size,
 chunkSize,
 status: "streaming_active"
 });
 }

 let offset = 0;
 let chunkCount = 0;
 let totalBytesRead = 0;
 let headerHex = "";
 let suspiciousPlaintextHits = 0;
 const decoder = new TextDecoder("utf-8", { fatal: false });

 try {
 while (offset < file.size) {
 const end = Math.min(offset + chunkSize, file.size);
 const slice = file.slice(offset, end);
 const buffer = await slice.arrayBuffer();
 const bytes = new Uint8Array(buffer);

 if (chunkCount === 0) {
 headerHex = Array.from(bytes.slice(0, 8))
.map((b) => b.toString(16).padStart(2, "0"))
.join(" ")
.toUpperCase();
 }

 const textSample = decoder.decode(bytes, { stream: true }).toLowerCase();
 if (textSample.includes("hardcoded_secret") || textSample.includes("api_key=")) {
 suspiciousPlaintextHits += 1;
 }

 totalBytesRead += bytes.byteLength;
 chunkCount += 1;
 offset = end;

 if (typeof onProgress === "function") {
 const percent = file.size > 0 ? Math.round((totalBytesRead / file.size) * 100) : 100;
 onProgress({
 bytesRead: totalBytesRead,
 totalBytes: file.size,
 percent,
 chunkCount
 });
 }

 if (chunkCount % 8 === 0) {
 await new Promise((r) => setTimeout(r, 0));
 }
 }

 const findings = [];
 if (suspiciousPlaintextHits > 0) {
 findings.push(
 `Padrão literal de chave/segredo em texto plano detectado em ${suspiciousPlaintextHits} bloco(s) inspecionado(s) do arquivo "${file.name}".`
 );
 }

 const hasFaults = findings.length > 0;
 const disclaimer = (this.config && this.config.reliabilityDisclaimer) || "Nenhuma verificação automática é 100% confiável e esta checagem não substitui a conferência manual do usuário.";
 const level1Text = hasFaults
 ? `Nível do erro: Nível 1 (Alerta 1). Falhas identificadas em relação ao arquivo/aplicativo "${file.name}": ${findings.join(" ")} ${disclaimer}`
 : `Nível do erro: Nível 1 (Alerta 1). Não há falha detectável neste arquivo/aplicativo na leitura local em blocos. ${disclaimer}`;

 return {
 ok: true,
 fileName: file.name,
 fileSize: file.size,
 aboveWarningThreshold: validation.aboveWarningThreshold,
 chunkCount,
 totalBytesRead,
 headerHex: headerHex || "VAZIO",
 hasFaults,
 findings,
 level1Text
 };
 } catch (err) {
 return {
 ok: false,
 error: `Falha durante a leitura em blocos do arquivo "${file ? file.name : "desconhecido"}": ${err && err.message ? err.message : "erro de E/S local"}.`
 };
 } finally {
 if (this.localStore && typeof this.localStore.deleteTempMetadata === "function") {
 await this.localStore.deleteTempMetadata(tempId);
 }
 }
 }
}
