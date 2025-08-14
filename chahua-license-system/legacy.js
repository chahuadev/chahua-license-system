/**
 * 🔧 Legacy Compatibility Layer
 * Provides backward compatibility with original license-guard.js
 * 
 * @version 1.0.0  
 * @author Chahua Development Thailand
 */

// ใช้ระบบเดิมทั้งหมดจาก lib/license-guard.js
const { ensureLicensed, installLicenseFromContent, getLicensePath, APP_PLUGIN_ID } = require('./lib/license-guard');

// Export compatibility layer (ใช้ระบบเดิมไม่ต้องสร้าง instance)
module.exports = { 
    ensureLicensed, 
    installLicenseFromContent, 
    getLicensePath, 
    APP_PLUGIN_ID
};
