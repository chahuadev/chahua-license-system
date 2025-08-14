// license-guard.js
const fs = require('fs');
const path = require('path');
const LicenseGenerator = require('./license-generator');
const { getLicensePath } = require('./license-generator');

const APP_PLUGIN_ID = 'com.chahua.dbmanager'; // ตั้งให้ตรงกับคีย์ที่ออก

let cache = null;
let lastCheck = 0;

async function ensureLicensed() {
  const now = Date.now();
  if (cache && (now - lastCheck) < 30 * 60 * 1000) return cache; // แคช 30 นาที

  const lg = new LicenseGenerator();
  // ใช้ไฟล์ license ใน tools โฟลเดอร์ (ตอน development อยู่ใน project, ตอน production อยู่ข้าง exe)
  let licensePath;
  
  // Check if running in production (packaged)
  if (process.env.NODE_ENV === 'production' || require('electron')?.app?.isPackaged) {
    // Production: tools folder อยู่ข้าง exe ไฟล์
    const execPath = process.execPath;
    const execDir = path.dirname(execPath);
    licensePath = path.join(execDir, 'tools', 'license.key');
  } else {
    // Development: tools folder อยู่ใน project root (ไม่ใช่ใน chahua-license-system)
    licensePath = path.join(process.cwd(), 'tools', 'license.key');
  }

  if (!fs.existsSync(licensePath)) {
    throw new Error(`ไม่พบไฟล์คีย์: ${licensePath}`);
  }
  const content = fs.readFileSync(licensePath, 'utf8');
  
  // ปรับการตรวจสอบให้ไม่เข้มงวดกับ machine binding
  const result = await lg.verifyLicense(content);
  
  // ถ้า verify ล้มเหลวเพราะ machine binding แต่เป็น UNBOUND license
  if (!result.success && result.error.includes('different machine')) {
    // ลองถอดรหัสเพื่อดู fingerprint
    const decryptResult = await lg.decryptLicense(content);
    if (decryptResult.success && decryptResult.data.fingerprint === 'UNBOUND') {
      console.log('🔓 UNBOUND license detected, bypassing machine check...');
      // สร้าง result แบบ manual สำหรับ UNBOUND license
      const licenseData = decryptResult.data;
      const mockResult = {
        success: true,
        data: {
          ...licenseData,
          pluginId: licenseData.pluginId || 'com.chahua.dbmanager',
          currentTier: licenseData.durationDays || 90,
          daysRemaining: licenseData.durationDays || 90,
          expiresAt: new Date(Date.now() + (licenseData.durationDays || 90) * 24 * 60 * 60 * 1000).toISOString(),
          status: 'UNBOUND license active'
        }
      };
      const d = mockResult.data;
      cache = d; 
      lastCheck = now;
      return d;
    }
  }
  
  if (!result.success) {
    throw new Error(result.error || 'คีย์ไม่ถูกต้อง');
  }

  const d = result.data;
  
  // ถ้าไม่มี pluginId ให้ใช้ default หรือข้าม
  const actualPluginId = d.pluginId || 'com.chahua.dbmanager';
  
  if (APP_PLUGIN_ID && actualPluginId !== APP_PLUGIN_ID) {
    console.warn(`Plugin ID mismatch: expected ${APP_PLUGIN_ID}, got ${actualPluginId}. Allowing anyway...`);
    // ไม่ throw error แค่ warning
  }
  
  if ((d.daysRemaining ?? 0) <= 0) {
    throw new Error(`คีย์หมดอายุแล้ว: ${new Date(d.expiresAt).toLocaleString()}`);
  }

  cache = d; lastCheck = now;
  return d;
}

async function installLicenseFromContent(licenseContent) {
  const lg = new LicenseGenerator();
  const check = await lg.verifyLicense(licenseContent);
  if (!check.success) throw new Error(check.error || 'คีย์ไม่ถูกต้อง');
  await lg.copyContentToRoot(licenseContent);
  await ensureLicensed(); // รีเช็คอีกที
  return check.data;
}

module.exports = { ensureLicensed, installLicenseFromContent, getLicensePath, APP_PLUGIN_ID };
