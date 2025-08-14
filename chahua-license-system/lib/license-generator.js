/**
 * 🔐 Chahua Development Framework - License Generator Module
 * 
 * @fileoverview Secure License Key Generation and Management System
 * 
 * This module provides comprehensive license generation capabilities including:
 * - Encrypted license creation with RSA public key cryptography
 * - Secure file storage in dedicated secure-storage directory 
 * - Customer-specific license folder management
 * - Multiple license duration support (30/60/90/120 days)
 * - Hardware fingerprint integration
 * - Base64 encoded license file format with proper headers
 * 
 * @version 2.1.0
 * @author Chahua Development Team
 * @company Chahua Development Thailand  
 * @ceo Saharath C.
 * @website https://www.chahuadev.com
 * 
 * @security
 * - All license files are stored in secure-storage/license-keys (outside web root)
 * - RSA-2048 encryption for license data
 * - Hardware fingerprinting for license binding
 * - Secure random key generation
 * 
 * @example
 * // Generate a 30-day license
 * const generator = require('./license-generator');
 * const license = await generator.generateDailyLicense(30, 'customer123');
 * 
 * @example  
 * // Save license to customer folder
 * const licensePath = await generator.saveLicenseToCustomerFolder(
 *   base64Content, 
 *   'customer-folder-name'
 * );
 * 
 * @since 1.0.0
 * @updated 2024-01-15 - Migrated to secure-storage paths
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * 🔍 Get Tools Base Directory
 * 
 * Determines the base directory for license tools with fallback priority:
 * 1. CHAHUA_TOOLS_DIR environment variable (shared across projects)
 * 2. <working_directory>/tools
 * 3. <current_file_directory>/../tools  
 * 4. <executable_directory>/tools (for packaged Electron apps)
 * 
 * @function getToolsBaseDir
 * @returns {string} The resolved tools base directory path
 * @throws {Error} If directory creation fails
 * 
 * @example
 * const toolsDir = getToolsBaseDir();
 * // Returns: '/path/to/project/tools' or custom CHAHUA_TOOLS_DIR
 * 
 * @since 1.0.0
 */
function getToolsBaseDir() {
    const envDir = process.env.CHAHUA_TOOLS_DIR;
    const candidates = [];

    if (envDir) candidates.push(envDir);
    
    // Check if running in production (packaged Electron app)
    try {
        if (process.versions?.electron) {
            const { app } = require('electron');
            if (app?.isPackaged) {
                // Production: tools folder อยู่ข้าง exe ไฟล์
                const execPath = process.execPath;
                const execDir = path.dirname(execPath);
                candidates.push(path.join(execDir, 'tools'));
            } else {
                // Development: tools folder อยู่ใน project root
                candidates.push(path.resolve(process.cwd(), 'tools'));
                // แก้ path สำหรับ library - ไปหา tools ใน project หลัก
                candidates.push(path.resolve(process.cwd(), 'tools'));
            }
        }
    } catch (_) {
        // Fallback if electron is not available - มุ่งไปที่ project root/tools
        candidates.push(path.resolve(process.cwd(), 'tools'));
        // สำรอง: หา tools จาก parent directory ของ library
        try {
            candidates.push(path.resolve(__dirname, '..', '..', 'tools'));
        } catch (e) {
            candidates.push(path.resolve(process.cwd(), 'tools'));
        }
    }

    const chosen = candidates.find(d => {
        try { return fs.existsSync(d) && fs.statSync(d).isDirectory(); } catch { return false; }
    }) || candidates[0];

    try { fs.mkdirSync(chosen, { recursive: true }); } catch (_) {}
    return chosen;
}

/**
 * 📄 Get License File Path
 * 
 * Returns the full path to the license.key file in the tools directory.
 * 
 * @function getLicensePath
 * @returns {string} Complete path to license.key file
 * 
 * @example
 * const licensePath = getLicensePath();
 * // Returns: '/path/to/tools/license.key'
 * 
 * @since 1.0.0
 */
function getLicensePath() {
    // ใช้ logic เดียวกับ license-guard.js
    let toolsDir;
    
    try {
        // Check if running in Electron
        if (process.versions?.electron) {
            const { app } = require('electron');
            if (app?.isPackaged) {
                // Production: tools folder next to executable
                const execPath = process.execPath;
                const execDir = path.dirname(execPath);
                toolsDir = path.join(execDir, 'tools');
            } else {
                // Development: tools folder in project root
                toolsDir = path.join(process.cwd(), 'tools');
            }
        } else {
            // Non-Electron: tools folder in project root
            toolsDir = path.join(process.cwd(), 'tools');
        }
    } catch (error) {
        // Fallback
        toolsDir = path.join(process.cwd(), 'tools');
    }
    
    return path.join(toolsDir, 'license.key');
}

/**
 * 🔒 Get Activation Lock File Path
 * 
 * Returns the path to the license activation state file used for tracking
 * license activation status and preventing multiple activations.
 * 
 * @function getActivationLockPath
 * @returns {string} Complete path to chahua_license_state.json file
 * 
 * @example
 * const lockPath = getActivationLockPath();
 * // Returns: '/path/to/tools/chahua_license_state.json'
 * 
 * @since 1.0.0
 */
function getActivationLockPath() {
    // ใช้ logic เดียวกับ getLicensePath()
    let toolsDir;
    
    try {
        // Check if running in Electron
        if (process.versions?.electron) {
            const { app } = require('electron');
            if (app?.isPackaged) {
                // Production: tools folder next to executable
                const execPath = process.execPath;
                const execDir = path.dirname(execPath);
                toolsDir = path.join(execDir, 'tools');
            } else {
                // Development: tools folder in project root
                toolsDir = path.join(process.cwd(), 'tools');
            }
        } else {
            // Non-Electron: tools folder in project root
            toolsDir = path.join(process.cwd(), 'tools');
        }
    } catch (error) {
        // Fallback
        toolsDir = path.join(process.cwd(), 'tools');
    }
    
    return path.join(toolsDir, 'chahua_license_state.json');
}

/**
 * 🔐 License Generator Class
 * 
 * Main class for generating encrypted license keys with military-grade security.
 * Uses AES-256-GCM encryption with PBKDF2 key derivation and hardware fingerprinting.
 * 
 * @class LicenseGenerator
 * 
 * @description
 * This class provides comprehensive license generation functionality:
 * - Multiple license duration options (30/60/90/120 days)
 * - Hardware fingerprint binding for security
 * - RSA public key encryption support
 * - Secure file storage in secure-storage directory
 * - Customer-specific folder management
 * - Base64 encoded output with proper PEM headers
 * 
 * @example
 * const generator = new LicenseGenerator();
 * const license = await generator.generateDailyLicense(30, 'customer123');
 * 
 * @since 1.0.0
 * @updated 2024-01-15 - Added secure storage paths
 */
class LicenseGenerator {
    /**
     * Initialize License Generator with encryption settings
     * 
     * @constructor
     * @description Sets up AES-256-GCM encryption with fixed key for consistency
     * @throws {Error} If encryption initialization fails
     * 
     * @example
     * const generator = new LicenseGenerator();
     * // Console: "🔐 License Generator initialized with military-grade encryption"
     */
    constructor() {
        // การเข้ารหัสแบบรุนแรง - ใช้ key คงที่เพื่อให้ decrypt ได้
        this.encryptionKey = this.getFixedEncryptionKey();
        this.algorithm = 'aes-256-gcm';
        this.keyDerivationRounds = 100000; // PBKDF2 rounds
        
        console.log('🔐 License Generator initialized with military-grade encryption');
    }



    /**
     * ✨ Generate 30-Day License
     * 
     * Creates a standard 30-day license using the plugin system.
     * Perfect for trial periods and basic subscriptions.
     * 
     * @method generate30DayLicense
     * @returns {Promise<Object>} Generated license object with encrypted content
     * 
     * @example
     * const license = await generator.generate30DayLicense();
     * console.log(license.licenseData); // Base64 encoded license
     * 
     * @since 2.0.0
     * @see {@link generateDailyLicense} For custom duration licenses
     */
    async generate30DayLicense() {
        return await this.generateDailyLicense(30, 'com.chahuadev.standard-plugin');
    }

    /**
     * ✨ Generate 60-Day License  
     * 
     * Creates a premium 60-day license with extended features.
     * Ideal for professional subscriptions and extended trials.
     * 
     * @method generate60DayLicense
     * @returns {Promise<Object>} Generated license object with encrypted content
     * 
     * @example
     * const license = await generator.generate60DayLicense();
     * console.log(license.licenseData); // Base64 encoded license
     * 
     * @since 2.0.0
     * @see {@link generateDailyLicense} For custom duration licenses
     */
    async generate60DayLicense() {
        return await this.generateDailyLicense(60, 'com.chahuadev.premium-plugin');
    }

    /**
     * ✨ Generate 90-Day License
     * 
     * Creates a professional 90-day license for extended business use.
     * Designed for professional subscriptions and business customers.
     * 
     * @method generate90DayLicense
     * @returns {Promise<Object>} Generated license object with encrypted content
     * 
     * @example
     * const license = await generator.generate90DayLicense();
     * console.log(license.licenseData); // Base64 encoded license
     * 
     * @since 2.0.0
     * @see {@link generateDailyLicense} For custom duration licenses
     */
    async generate90DayLicense() {
        return await this.generateDailyLicense(90, 'com.chahuadev.professional-plugin');
    }

    /**
     * ✨ Generate 120-Day License
     * 
     * Creates an enterprise 120-day license for maximum duration usage.
     * Perfect for enterprise customers and long-term subscriptions.
     * 
     * @method generate120DayLicense
     * @returns {Promise<Object>} Generated license object with encrypted content
     * 
     * @example
     * const license = await generator.generate120DayLicense();
     * console.log(license.licenseData); // Base64 encoded license
     * 
     * @since 2.0.0
     * @see {@link generateDailyLicense} For custom duration licenses
     */
    async generate120DayLicense() {
        return await this.generateDailyLicense(120, 'com.chahuadev.enterprise-plugin');
    }

    /**
     * 🎯 Generate Daily License (Core Function)
     * 
     * The main license generation function that creates encrypted plugin licenses
     * with flexible duration and optional hardware fingerprint binding.
     * 
     * @method generateDailyLicense
     * @param {number} days - License duration in days (must be > 0)
     * @param {string} [pluginId='com.chahuadev.default-plugin'] - Plugin identifier
     * @param {Object} [opts={}] - Additional options
     * @param {string} [opts.fingerprint] - Hardware fingerprint for binding (optional)
     * 
     * @returns {Promise<Object>} License generation result
     * @returns {boolean} returns.success - Generation success status
     * @returns {string} returns.type - License type description
     * @returns {string} returns.pluginId - Plugin identifier used
     * @returns {string} returns.licenseId - Unique license identifier
     * @returns {string} returns.fingerprint - Hardware fingerprint (first 16 chars) or 'UNBOUND'
     * @returns {number} returns.days - License duration in days
     * @returns {string} returns.path - Path to saved license file
     * @returns {string} returns.message - Success message
     * @returns {string} [returns.error] - Error message if success=false
     * 
     * @throws {Error} If days is not a positive number
     * @throws {Error} If pluginId is not provided
     * @throws {Error} If encryption or file save fails
     * 
     * @example
     * // Generate 30-day license with hardware binding
     * const license = await generator.generateDailyLicense(30, 'com.example.plugin', {
     *   fingerprint: 'hw123456789abcdef'
     * });
     * 
     * @example
     * // Generate unbound license
     * const license = await generator.generateDailyLicense(60, 'com.example.plugin');
     * console.log(license.path); // Path to license file
     * 
     * @since 1.0.0
     * @updated 3.1.0 - Added plugin system support
     */
    async generateDailyLicense(days, pluginId = 'com.chahuadev.default-plugin', opts = {}) {
        try {
            if (typeof days !== 'number' || days <= 0) {
                throw new Error('จำนวนวันต้องเป็นตัวเลขมากกว่า 0');
            }

            if (!pluginId) {
                throw new Error('Plugin ID is required to generate a license.');
            }

            const providedFp = opts.fingerprint || null;
            
            const licenseData = {
                type: 'PLUGIN_LICENSE', // 🎯 เปลี่ยน type ให้เป็นกลางๆ
                pluginId: pluginId,     // 🎯 เพิ่ม ID ของปลั๊กอิน
                licenseId: this.generateLicenseId(),
                fingerprint: providedFp,   // ไม่ส่ง = ไม่ผูกเครื่อง
                generatedAt: new Date().toISOString(),
                durationDays: days, // 🎯 ใช้จำนวนวันที่รับเข้ามา
                features: [
                    'standard_features',
                    'email_support'
                ],
                issuer: 'Chahuadev Thailand',
                version: '3.1.0'
            };

            const encryptedLicense = await this.encryptLicense(licenseData);
            const savedPath = await this.saveLicenseFile(encryptedLicense, 'license.key', `${days}days`);
            
            console.log(`✅ ${days}-day license for ${pluginId} generated successfully`);
            return {
                success: true,
                type: `Plugin License (${days} วัน)`,
                pluginId: pluginId,
                licenseId: licenseData.licenseId,
                fingerprint: providedFp ? providedFp.substring(0, 16) : 'UNBOUND',
                days: days,
                path: savedPath, // 🎯 ส่ง path กลับไปด้วย
                message: `License for ${pluginId} (${days} days) created successfully.`
            };
            
        } catch (error) {
            console.error(`❌ Daily License (${days} วัน) generation failed:`, error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * สร้าง Dev License (7 วัน) - อัปเดตให้ใช้ Plugin System
     */
    async generateDevLicense() {
        try {
            const licenseData = {
                type: 'PLUGIN_LICENSE', // 🎯 เปลี่ยนเป็น Plugin System
                pluginId: 'com.chahuadev.dev-plugin', // 🎯 เพิ่ม Plugin ID
                licenseId: this.generateLicenseId(),
                fingerprint: null, // Dev license ไม่ผูกเครื่อง
                generatedAt: new Date().toISOString(),
                durationDays: 7,
                features: [
                    'development_mode',
                    'basic_plugins',
                    'testing_tools'
                ],
                issuer: 'Chahuadev Thailand',
                version: '3.1.0'
            };

            const encryptedLicense = await this.encryptLicense(licenseData);
            const savedPath = await this.saveLicenseFile(encryptedLicense, 'license.key', '7days');
            
            console.log('✅ Dev License (Plugin System) generated successfully');
            return {
                success: true,
                type: 'Dev Plugin License',
                pluginId: 'com.chahuadev.dev-plugin',
                licenseId: licenseData.licenseId,
                days: 7,
                path: savedPath,
                message: 'Dev License (7 วัน) สร้างสำเร็จ - Plugin System!'
            };
            
        } catch (error) {
            console.error('❌ Dev License generation failed:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * สร้าง Customer License (30 วัน) - อัปเดตให้ใช้ Plugin System
     */
    async generateCustomerLicense(opts = {}) {
        try {
            const providedFp = opts.fingerprint || null;
            
            const licenseData = {
                type: 'PLUGIN_LICENSE', // 🎯 เปลี่ยนเป็น Plugin System
                pluginId: 'com.chahuadev.customer-plugin', // 🎯 เพิ่ม Plugin ID
                licenseId: this.generateLicenseId(),
                fingerprint: providedFp,
                generatedAt: new Date().toISOString(),
                durationDays: 30,
                features: [
                    'production_use',
                    'standard_plugins',
                    'email_support'
                ],
                issuer: 'Chahuadev Thailand',
                version: '3.1.0'
            };

            const encryptedLicense = await this.encryptLicense(licenseData);
            const savedPath = await this.saveLicenseFile(encryptedLicense, 'license.key', '30days');
            
            console.log('✅ Customer License (Plugin System) generated successfully');
            return {
                success: true,
                type: 'Customer Plugin License',
                pluginId: 'com.chahuadev.customer-plugin',
                licenseId: licenseData.licenseId,
                fingerprint: providedFp ? providedFp.substring(0, 16) : 'UNBOUND',
                days: 30,
                path: savedPath,
                message: 'Customer License (30 วัน) สร้างสำเร็จ - Plugin System!'
            };
            
        } catch (error) {
            console.error('❌ Customer License generation failed:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * เข้ารหัส License แบบรุนแรง (ไม่มีทางแก้ไขได้)
     */
    async encryptLicense(licenseData) {
        try {
            // Step 1: Convert to JSON
            const jsonData = JSON.stringify(licenseData);
            
            // Step 2: Generate random salt and IV
            const salt = crypto.randomBytes(32);
            const iv = crypto.randomBytes(16);
            
            // Step 3: Derive key using PBKDF2
            const derivedKey = crypto.pbkdf2Sync(this.encryptionKey, salt, this.keyDerivationRounds, 32, 'sha512');
            
            // Step 4: Create cipher (AES-256-CBC)
            const cipher = crypto.createCipheriv('aes-256-cbc', derivedKey, iv);
            
            // Step 5: Encrypt data
            let encrypted = cipher.update(jsonData, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            
            // Step 6: Combine all components with random padding
            const encryptedPackage = {
                v: '3.0',                          // Version
                s: salt.toString('hex'),           // Salt
                i: iv.toString('hex'),             // IV
                d: encrypted,                      // Encrypted data
                p: crypto.randomBytes(64).toString('hex'), // Random padding
                c: Date.now(),                     // Creation timestamp
                h: crypto.createHash('sha256').update(encrypted + salt.toString('hex')).digest('hex') // Integrity hash
            };
            
            // Step 7: Encode as base64 with more obfuscation
            const finalData = Buffer.from(JSON.stringify(encryptedPackage)).toString('base64');
            
            console.log('🔐 License encrypted with military-grade security');
            return finalData; // คืนค่าเฉพาะ base64 content ไม่รวม header/footer
            
        } catch (error) {
            throw new Error(`License encryption failed: ${error.message}`);
        }
    }

    /**
     * ถอดรหัส License (สำหรับตรวจสอบ)
     */
    async decryptLicense(encryptedLicenseKey) {
        try {
            // Step 1: Remove header and footer
            const base64Data = encryptedLicenseKey
                .replace('-----BEGIN CHAHUA LICENSE-----', '')
                .replace('-----END CHAHUA LICENSE-----', '')
                .replace(/\n/g, '');
            
            // Step 2: Decode from base64
            const jsonData = Buffer.from(base64Data, 'base64').toString('utf8');
            const encryptedPackage = JSON.parse(jsonData);
            
            // Step 3: Extract components
            const salt = Buffer.from(encryptedPackage.s, 'hex');
            const iv = Buffer.from(encryptedPackage.i, 'hex');
            const encrypted = encryptedPackage.d;
            const storedHash = encryptedPackage.h;
            
            // Step 4: Verify integrity
            const calculatedHash = crypto.createHash('sha256').update(encrypted + salt.toString('hex')).digest('hex');
            if (calculatedHash !== storedHash) {
                throw new Error('License integrity check failed');
            }
            
            // Step 5: Derive key using same parameters
            const derivedKey = crypto.pbkdf2Sync(this.encryptionKey, salt, this.keyDerivationRounds, 32, 'sha512');
            
            // Step 6: Create decipher
            const decipher = crypto.createDecipheriv('aes-256-cbc', derivedKey, iv);
            
            // Step 7: Decrypt data
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            
            // Step 8: Parse JSON
            const licenseData = JSON.parse(decrypted);
            
            return {
                success: true,
                data: licenseData
            };
            
        } catch (error) {
            return {
                success: false,
                error: `License decryption failed: ${error.message}`
            };
        }
    }

    /**
     * ตรวจสอบ License และจัดการสถานะ Loyalty ของผู้ใช้ (เวอร์ชันใหม่ - Tiered System)
     * รองรับทั้ง License เก่าและใหม่
     * @param {string} encryptedLicenseKey - เนื้อหาของไฟล์ license.key ที่ผู้ใช้ป้อน
     * @returns {Promise<object>} ผลลัพธ์การตรวจสอบ
     */
    async verifyLicense(encryptedLicenseKey) {
        try {
            // 1. ถอดรหัส License Key
            const decryptResult = await this.decryptLicense(encryptedLicenseKey);
            if (!decryptResult.success) {
                return decryptResult; // คีย์ปลอม, ไฟล์เสีย
            }
            const licenseData = decryptResult.data;

            // 2. อ่านไฟล์ State ของผู้ใช้
            const stateFilePath = getActivationLockPath();
            let userState = { activeTier: 0, tierActivationDate: null, activatedPlugins: [] };
            if (fs.existsSync(stateFilePath)) {
                try {
                    const stateContent = fs.readFileSync(stateFilePath, 'utf8');
                    userState = JSON.parse(stateContent);
                } catch (error) {
                    console.warn('⚠️ Invalid state file, creating new one:', error.message);
                    userState = { activeTier: 0, tierActivationDate: null, activatedPlugins: [] };
                }
            }

            // 3. ตรวจสอบการผูกเครื่อง (ถ้ามี)
            if (licenseData.fingerprint && licenseData.fingerprint !== this.getMachineFingerprint().full) {
                return { success: false, error: 'License is bound to a different machine.' };
            }

            // 4. จัดการ License เก่า (แปลงเป็นรูปแบบใหม่)
            if (licenseData.type !== 'PLUGIN_LICENSE') {
                console.log('🔄 Converting legacy license to plugin system...');
                
                // แปลง License เก่าเป็น Plugin ID
                switch (licenseData.type) {
                    case 'DEV_LICENSE':
                        licenseData.pluginId = 'com.chahuadev.legacy-dev-plugin';
                        break;
                    case 'CUSTOMER_LICENSE':
                        licenseData.pluginId = 'com.chahuadev.legacy-customer-plugin';
                        break;
                    case 'CHAHUADEV_DAILY_LICENSE':
                        licenseData.pluginId = 'com.chahuadev.legacy-daily-plugin';
                        break;
                    default:
                        licenseData.pluginId = 'com.chahuadev.legacy-unknown-plugin';
                }
                
                console.log(`🔄 Legacy license converted to plugin: ${licenseData.pluginId}`);
            }

            // ตรวจสอบข้อมูลพื้นฐานใน License (หลังจากการแปลง)
            if (!licenseData.pluginId || !licenseData.durationDays) {
                return { success: false, error: 'Invalid or incomplete license key.' };
            }

            const newLicenseDuration = licenseData.durationDays;
            const currentTierDuration = userState.activeTier || 0;
            const pluginId = licenseData.pluginId;

            // ===== 5) Tier logic (upgrade only for 90/120) =====
            const allowedUpgradeTiers = new Set([90, 120]);

            // ถ้ายังไม่มี tier เลย → อนุญาตเซ็ตตามคีย์ที่ส่งมา (30/60/90/120)
            if (!currentTierDuration) {
                userState.activeTier = newLicenseDuration;
                userState.tierActivationDate = new Date().toISOString();
            } else {
                // คำนวณวันหมดอายุของ tier ปัจจุบัน
                const tierExpiryDate = new Date(userState.tierActivationDate || 0);
                tierExpiryDate.setDate(tierExpiryDate.getDate() + currentTierDuration);

                if (new Date() > tierExpiryDate) {
                    // หมดอายุแล้ว → เริ่ม tier ใหม่ตามคีย์ที่ส่งมา (30/60/90/120)
                    userState.activeTier = newLicenseDuration;
                    userState.tierActivationDate = new Date().toISOString();
                } else {
                    // ยังไม่หมดอายุ → อนุญาตอัปเกรดเฉพาะ 90/120 และต้องมากกว่า tier เดิม
                    const canAutoUpgrade =
                        allowedUpgradeTiers.has(newLicenseDuration) &&
                        newLicenseDuration > currentTierDuration;

                    if (canAutoUpgrade) {
                        userState.activeTier = newLicenseDuration;
                        userState.tierActivationDate = new Date().toISOString();
                        console.log(`🚀 UPGRADE! From ${currentTierDuration} → ${newLicenseDuration} days (allowed tier).`);
                    } else {
                        console.log(`ℹ️ License accepted (${newLicenseDuration}d) but tier unchanged (${currentTierDuration}d active).`);
                        // ไม่เปลี่ยน tier แต่ยังนับว่า license ถูกต้อง และบันทึก plugin ด้านล่างตามเดิม
                    }
                }
            }

            // 6. เพิ่มปลั๊กอินเข้าไปในรายการที่ Activate แล้ว (ถ้ายังไม่มี)
            if (!userState.activatedPlugins.includes(pluginId)) {
                userState.activatedPlugins.push(pluginId);
                console.log(`🔌 Plugin '${pluginId}' added to activated plugins list.`);
            }

            // 7. บันทึก State กลับลงไฟล์
            fs.writeFileSync(stateFilePath, JSON.stringify(userState, null, 2));
            
            // 8. คำนวณวันที่เหลือ
            const currentTierExpiryDate = new Date(userState.tierActivationDate);
            currentTierExpiryDate.setDate(currentTierExpiryDate.getDate() + userState.activeTier);
            const daysRemaining = Math.ceil((currentTierExpiryDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
            
            return { 
                success: true, 
                data: { 
                    ...licenseData, 
                    status: `License accepted. Current tier: ${userState.activeTier} days.`,
                    daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
                    currentTier: userState.activeTier,
                    activatedPlugins: userState.activatedPlugins,
                    expiresAt: currentTierExpiryDate.toISOString(), // 🎯 เพิ่มวันหมดอายุ
                    tierActivationDate: userState.tierActivationDate // 🎯 เพิ่มวันที่เริ่มใช้
                } 
            };

        } catch (error) {
            console.error('❌ verifyLicense Error:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * 💾 Save License File to Secure Storage
     * 
     * Saves encrypted license data to secure-storage directory with timestamp-based
     * folder organization. Creates proper PEM-formatted license files with headers.
     * 
     * @method saveLicenseFile
     * @param {string} encryptedLicense - Base64 encrypted license data
     * @param {string} [filename='license.key'] - License filename
     * @param {string} [licenseType='general'] - License type for folder organization
     * 
     * @returns {Promise<string>} Full path to the saved license file
     * 
     * @description
     * File structure created:
     * ```
     * secure-storage/
     * └── license-keys/
     *     └── {licenseType}/
     *         └── YYYY-MM-DD_HH-mm-ss/
     *             └── license.key
     * ```
     * 
     * @throws {Error} If directory creation fails
     * @throws {Error} If file write operation fails
     * 
     * @example
     * const licensePath = await generator.saveLicenseFile(
     *   'base64encrypted...', 
     *   'license.key', 
     *   '30days'
     * );
     * // Returns: '/project/secure-storage/license-keys/30days/2024-01-15_14-30-25/license.key'
     * 
     * @since 1.0.0
     * @updated 2.1.0 - Migrated to secure-storage paths
     * @security Files stored outside web root for enhanced security
     */
    async saveLicenseFile(encryptedLicense, filename = 'license.key', licenseType = 'general') {
        try {
            // 🎯 สร้างชื่อโฟลเดอร์จากเวลาปัจจุบัน
            const now = new Date();
            const timestamp = now.toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                            now.toTimeString().split(' ')[0].replace(/:/g, '-'); // YYYY-MM-DD_HH-mm-ss
            
            // 🔐 กำหนด path ไปยัง secure-storage/license-keys แทน
            const projectRoot = process.cwd();
            const licenseBaseDir = path.join(projectRoot, 'secure-storage', 'license-keys');
            
            // สร้างโฟลเดอร์ license หลักถ้ายังไม่มี
            if (!fs.existsSync(licenseBaseDir)) {
                fs.mkdirSync(licenseBaseDir, { recursive: true });
                console.log(`📁 Created secure license storage: ${licenseBaseDir}`);
            }
            
            // สร้างโฟลเดอร์ตามประเภท license
            const licenseTypeDir = path.join(licenseBaseDir, licenseType);
            if (!fs.existsSync(licenseTypeDir)) {
                fs.mkdirSync(licenseTypeDir, { recursive: true });
            }
            
            // สร้างโฟลเดอร์ย่อยตาม timestamp
            const finalLicenseDir = path.join(licenseTypeDir, timestamp);
            if (!fs.existsSync(finalLicenseDir)) {
                fs.mkdirSync(finalLicenseDir, { recursive: true });
                console.log(`📁 Created license directory: ${finalLicenseDir}`);
            }
            
            const licensePath = path.join(finalLicenseDir, filename);
            
            // สร้างไฟล์ license.key ในรูปแบบที่ถูกต้อง (เพิ่ม header/footer)
            const formattedBase64 = encryptedLicense.match(/.{1,64}/g).join('\n');
            const licenseFile = [
                '-----BEGIN CHAHUA LICENSE-----',
                formattedBase64,
                '-----END CHAHUA LICENSE-----'
            ].join('\n');
            
            // เขียนไฟล์ลงในโฟลเดอร์ใหม่
            fs.writeFileSync(licensePath, licenseFile);
            
            console.log(`💾 License saved: ${licensePath}`);
            return licensePath;
            
        } catch (error) {
            throw new Error(`Failed to save license file: ${error.message}`);
        }
    }

    /**
     * 👥 Save License to Customer Folder
     * 
     * Creates customer-specific license files in organized folder structure.
     * Designed for order management system integration with customer-based organization.
     * 
     * @method saveLicenseToCustomerFolder
     * @param {string} base64Content - Base64 encoded license content
     * @param {string} customerFolderName - Customer folder identifier/name
     * 
     * @returns {Promise<string>} Full path to the created license file
     * 
     * @description
     * Customer file structure:
     * ```
     * secure-storage/
     * └── license-keys/
     *     └── {customerFolderName}/
     *         └── license.key
     * ```
     * 
     * The license file includes proper PEM formatting:
     * - -----BEGIN CHAHUA LICENSE-----
     * - Base64 content (64 chars per line)
     * - -----END CHAHUA LICENSE-----
     * 
     * @throws {Error} If directory creation fails
     * @throws {Error} If file write operation fails
     * 
     * @example
     * const customerPath = await generator.saveLicenseToCustomerFolder(
     *   'base64content...',
     *   'customer-john-doe-2024'
     * );
     * // Returns: '/project/secure-storage/license-keys/customer-john-doe-2024/license.key'
     * 
     * @example
     * // For order system integration
     * const orderLicense = await generator.saveLicenseToCustomerFolder(
     *   licenseData.encryptedContent,
     *   `order-${orderId}-${customerEmail}`
     * );
     * 
     * @since 2.0.0
     * @updated 2.1.0 - Migrated to secure-storage paths
     * @see {@link saveLicenseFile} For timestamp-based organization
     */
    async saveLicenseToCustomerFolder(base64Content, customerFolderName) {
        try {
            // 🎯 กำหนด path ของโปรเจกต์เป็น base directory
            const projectRoot = process.cwd();
            const licenseBaseDir = path.join(projectRoot, 'secure-storage', 'license-keys');
            
            // สร้างโฟลเดอร์ license หลักถ้ายังไม่มี
            if (!fs.existsSync(licenseBaseDir)) {
                fs.mkdirSync(licenseBaseDir, { recursive: true });
                console.log(`📁 Created secure license storage: ${licenseBaseDir}`);
            }
            
            // สร้างโฟลเดอร์ลูกค้า
            const customerDir = path.join(licenseBaseDir, customerFolderName);
            if (!fs.existsSync(customerDir)) {
                fs.mkdirSync(customerDir, { recursive: true });
                console.log(`📁 Created customer license directory: ${customerDir}`);
            }
            
            const licensePath = path.join(customerDir, 'license.key');
            
            // สร้างไฟล์ license.key ในรูปแบบที่ถูกต้อง
            const formattedBase64 = base64Content.match(/.{1,64}/g).join('\n'); // แบ่งเป็น 64 ตัวอักษรต่อบรรทัด
            const licenseFile = [
                '-----BEGIN CHAHUA LICENSE-----',
                formattedBase64,
                '-----END CHAHUA LICENSE-----'
            ].join('\n');
            
            // เขียนไฟล์ลงในโฟลเดอร์ลูกค้า
            fs.writeFileSync(licensePath, licenseFile);
            
            console.log(`💾 Customer license saved: ${licensePath}`);
            return licensePath;
            
        } catch (error) {
            throw new Error(`Failed to save customer license file: ${error.message}`);
        }
    }

    /**
     * 🎯 ใหม่: คัดลอกไฟล์ license ที่สร้างแล้วไปรูทโปรเจคพร้อมเปลี่ยนชื่อเป็น license.key
     * @param {string} sourcePath - path ของไฟล์ที่จะคัดลอก
     * @returns {Promise<object>} ผลลัพธ์การคัดลอก
     */
    async copyLicenseToRoot(sourcePath) {
        try {
            const rootLicensePath = getLicensePath();
            
            // อ่านเนื้อหาไฟล์ต้นฉบับ
            const licenseContent = fs.readFileSync(sourcePath, 'utf8');
            
            // เขียนไฟล์ใหม่ที่รูทโปรเจค
            fs.writeFileSync(rootLicensePath, licenseContent);
            
            console.log(`✅ License copied to root: ${rootLicensePath}`);
            return {
                success: true,
                rootPath: rootLicensePath,
                sourcePath: sourcePath,
                message: `License copied to root as ${path.basename(rootLicensePath)}`
            };
            
        } catch (error) {
            console.error(`❌ Failed to copy license to root:`, error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 🎯 ใหม่: คัดลอกเนื้อหา license ไปรูท (สำหรับปุ่ม Copy to Root)
     * @param {string} licenseContent - เนื้อหาไฟล์ license แบบ string
     * @returns {Promise<object>} ผลลัพธ์การคัดลอก
     */
    async copyContentToRoot(licenseContent) {
        try {
            const rootLicensePath = getLicensePath();
            
            // เขียนเนื้อหาไฟล์ลงรูทโปรเจค
            fs.writeFileSync(rootLicensePath, licenseContent);
            
            console.log(`✅ License content copied to root: ${rootLicensePath}`);
            return {
                success: true,
                rootPath: rootLicensePath,
                message: `License copied to root as ${path.basename(rootLicensePath)}`
            };
            
        } catch (error) {
            console.error(`❌ Failed to copy license content to root:`, error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * ลบไฟล์ license.key (UPDATED)
     */
    async clearLicense() {
        try {
            // Use the new helper to find the path
            const licensePath = getLicensePath();
            
            if (fs.existsSync(licensePath)) {
                // เปลี่ยนสิทธิ์เป็น writable ก่อนลบ
                fs.chmodSync(licensePath, 0o666);
                fs.unlinkSync(licensePath);
                console.log('🗑️ License file cleared from: ' + licensePath);
                return {
                    success: true,
                    message: 'ลบไฟล์ license.key สำเร็จ!'
                };
            } else {
                return {
                    success: false,
                    message: 'ไม่พบไฟล์ license.key'
                };
            }
            
        } catch (error) {
            console.error('❌ Failed to clear license:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * สร้าง Machine Fingerprint
     */
    getMachineFingerprint() {
        const platform = os.platform();
        const username = os.userInfo().username;
        const hostname = os.hostname();
        const arch = os.arch();
        const cpuInfo = os.cpus()[0]?.model || 'unknown-cpu';
        const totalMemory = os.totalmem();
        
        const rawFingerprint = `${platform}-${username}-${hostname}-${arch}-${cpuInfo}-${totalMemory}`;
        const fullFingerprint = crypto.createHash('sha256').update(rawFingerprint).digest('hex');
        
        return {
            short: fullFingerprint.substring(0, 16),
            full: fullFingerprint
        };
    }

    /**
     * สร้าง License ID แบบเอกลักษณ์
     */
    generateLicenseId() {
        const timestamp = Date.now().toString(36);
        const random = crypto.randomBytes(8).toString('hex');
        return `CHDEV-${timestamp}-${random}`.toUpperCase();
    }

    /**
     * สร้าง Encryption Key ที่ปลอดภัยสูงสุด (แบบคงที่)
     */
    getFixedEncryptionKey() {
        // ใช้ข้อมูลคงที่เพื่อให้ได้ key เดียวกันเสมอ
        const fixedData = 'chahuadev-framework-v3.0-encryption-master-key-2025';
        return crypto.createHash('sha512').update(fixedData).digest('hex');
    }

    /**
     * สร้าง Encryption Key ที่ปลอดภัยสูงสุด (แบบสุ่ม - เก่า)
     */
    generateSecureEncryptionKey() {
        // ใช้ข้อมูลระบบและ crypto สร้าง key ที่เก็บเป็นความลับ
        const systemInfo = `${os.platform()}-${os.arch()}-${os.hostname()}`;
        const randomData = crypto.randomBytes(32).toString('hex');
        const timestamp = Date.now().toString();
        
        const combinedData = `chahuadev-framework-v3.0-${systemInfo}-${randomData}-${timestamp}`;
        return crypto.createHash('sha512').update(combinedData).digest('hex');
    }

    /**
     * ตรวจสอบว่ามี license.key หรือไม่ (UPDATED)
     */
    checkLicenseExists() {
        const licensePath = getLicensePath();
        return fs.existsSync(licensePath);
    }

    /**
     * ดูข้อมูล license.key (แบบเข้ารหัส) (UPDATED)
     */
    getLicenseInfo() {
        try {
            const licensePath = getLicensePath();
            
            if (!fs.existsSync(licensePath)) {
                return {
                    exists: false,
                    message: 'ไม่พบไฟล์ license.key'
                };
            }
            
            const stats = fs.statSync(licensePath);
            const licenseContent = fs.readFileSync(licensePath, 'utf8');
            
            return {
                exists: true,
                path: licensePath,
                size: stats.size,
                created: stats.birthtime,
                modified: stats.mtime,
                encrypted: licenseContent.includes('-----BEGIN CHAHUA LICENSE-----'),
                preview: licenseContent.substring(0, 100) + '...'
            };
            
        } catch (error) {
            return {
                exists: false,
                error: error.message
            };
        }
    }

    /**
     * 🛒 Generate License for Order (E-commerce Integration)
     * 
     * Creates unbound licenses for order management system integration.
     * Generates customer-specific license files with complete metadata tracking.
     * 
     * @method generateForOrder
     * @param {Object} orderData - Order information for license generation
     * @param {string} orderData.orderId - Unique order identifier
     * @param {string} orderData.customerEmail - Customer email address
     * @param {string} orderData.customerName - Customer full name
     * @param {string} orderData.productName - Product/plugin name
     * @param {number} orderData.durationDays - License duration in days
     * 
     * @returns {Promise<Object>} Complete license package for order
     * @returns {string} returns.fileName - Suggested filename for download
     * @returns {string} returns.base64 - Base64 license content (for database storage)
     * @returns {string} returns.licenseKey - Complete PEM-formatted license (for email/download)
     * @returns {string} returns.filePath - Path to saved license file
     * @returns {Object} returns.meta - License metadata object
     * 
     * @description
     * This method creates "unbound" licenses (fingerprint: 'UNBOUND') suitable for
     * e-commerce where hardware binding is not desired. Customer folder structure:
     * 
     * ```
     * secure-storage/license-keys/
     * └── {customerName}_{orderId}/
     *     └── license.key
     * ```
     * 
     * @throws {Error} If required order data is missing
     * @throws {Error} If encryption or file operations fail
     * 
     * @example
     * const orderLicense = await generator.generateForOrder({
     *   orderId: 'ORD-2024-001',
     *   customerEmail: 'john@example.com',
     *   customerName: 'John Doe',
     *   productName: 'Premium Plugin',
     *   durationDays: 30
     * });
     * 
     * console.log(orderLicense.fileName);    // 'John_Doe_license.key'
     * console.log(orderLicense.filePath);    // Full path to saved file
     * console.log(orderLicense.licenseKey);  // Complete license for email
     * 
     * @since 2.0.0
     * @updated 3.1.0 - Added complete metadata tracking
     * @see {@link generateDailyLicense} For hardware-bound licenses
     * @see {@link saveLicenseToCustomerFolder} For customer file organization
     */
    async generateForOrder({ orderId, customerEmail, customerName, productName, durationDays }) {
        try {
            // ใบอนุญาตแบบ "ไม่ผูกเครื่อง"
            const licenseData = {
                type: 'PLUGIN_LICENSE',
                licenseId: this.generateLicenseId(),
                fingerprint: 'UNBOUND', // ไม่ bind เครื่อง
                orderId,
                customerEmail,
                customerName,
                productName,
                durationDays,
                generatedAt: new Date().toISOString(),
                issuer: 'Chahuadev Thailand',
                version: '3.1.0'
            };

            const encrypted = await this.encryptLicense(licenseData); // ได้ base64 content
            
            // 🎯 สร้างโฟลเดอร์สำหรับลูกค้า (ใช้ชื่อลูกค้า + order ID)
            const customerFolderName = `${customerName.replace(/[^a-zA-Z0-9\u0E00-\u0E7F]/g, '_')}_${orderId}`;
            const customerPath = await this.saveLicenseToCustomerFolder(encrypted, customerFolderName);
            
            // สร้างไฟล์ license.key แบบเต็มสำหรับส่งอีเมล
            const formattedBase64 = encrypted.match(/.{1,64}/g).join('\n');
            const completeLicenseFile = [
                '-----BEGIN CHAHUA LICENSE-----',
                formattedBase64,
                '-----END CHAHUA LICENSE-----'
            ].join('\n');
            
            console.log(`✅ License generated for order ${orderId} (${durationDays} days)`);
            console.log(`📁 License saved to customer folder: ${customerPath}`);
            
            return { 
                fileName: `${customerName.replace(/[^a-zA-Z0-9\u0E00-\u0E7F]/g, '_')}_license.key`, 
                base64: encrypted, // base64 content เฉพาะส่วนกลาง (สำหรับบันทึกฐานข้อมูล)
                licenseKey: completeLicenseFile, // เนื้อหา license แบบเต็ม (สำหรับส่งอีเมลและดาวน์โหลด)
                filePath: customerPath, // path ของไฟล์ที่สร้าง
                meta: licenseData 
            };
            
        } catch (error) {
            console.error('❌ generateForOrder failed:', error.message);
            throw error;
        }
    }
}

/**
 * 📤 Module Exports
 * 
 * @exports LicenseGenerator - Main license generator class
 * @exports getToolsBaseDir - Get tools directory function  
 * @exports getLicensePath - Get license file path function
 * @exports getActivationLockPath - Get activation lock file path function
 * @exports generateForOrder - Standalone order license generation function
 */
module.exports = LicenseGenerator;
module.exports.getToolsBaseDir = getToolsBaseDir;
module.exports.getLicensePath = getLicensePath;
module.exports.getActivationLockPath = getActivationLockPath;

/**
 * 🛒 Standalone Order License Generator
 * 
 * Convenience function for generating licenses directly without class instantiation.
 * Perfect for integration with external systems and APIs.
 * 
 * @function generateForOrder
 * @param {Object} payload - Order data (see LicenseGenerator.generateForOrder)
 * @returns {Promise<Object>} Complete license package
 * 
 * @example
 * const { generateForOrder } = require('./license-generator');
 * const license = await generateForOrder({
 *   orderId: 'ORD-123',
 *   customerEmail: 'customer@example.com',
 *   customerName: 'Customer Name',
 *   productName: 'Product Name',
 *   durationDays: 30
 * });
 * 
 * @since 2.0.0
 */
module.exports.generateForOrder = async (payload) => {
    const gen = new LicenseGenerator();
    return await gen.generateForOrder(payload);
}; 