const APP_CONFIG = Object.freeze({
 appName: "Esse App/Site é seguro?",
 executionMode: "100% local no aparelho",
 hasCreatorServer: false,
 hasDeveloperAccess: false,
 opensNewTabs: false,
 maxUploadBytes: 250 * 1024 * 1024,
 warnAboveBytes: 100 * 1024 * 1024,
 chunkSizeBytes: 256 * 1024,
 dbName: "esse_app_site_seguro_local_db_v2",
 dbVersion: 1,
 stores: {
 analyses: "analyses",
 tempBuffers: "temp_buffers"
 },
 reliabilityDisclaimer:
 "Nenhuma verificação automática é 100% confiável e esta checagem não substitui a conferência manual do usuário."
});

function formatBytes(bytes) {
 if (!Number.isFinite(bytes) || bytes < 0) return "0 B";
 if (bytes === 0) return "0 B";
 const units = ["B", "KB", "MB", "GB"];
 const idx = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
 const value = bytes / Math.pow(1024, idx);
 return `${value.toFixed(idx === 0 ? 0 : 2)} ${units[idx]}`;
}
