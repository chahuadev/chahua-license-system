/**
 * 🎛️ Chahua License Manager
 * High-level license management interface
 * 
 * @version 1.0.0
 * @author Chahua Development Thailand
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const LicenseGenerator = require('./license-generator');
const LicenseValidator = require('./license-validator');

class LicenseManager {
    constructor(options = {}) {
        this.appId = options.appId || 'chahua-app';
        this.toolsDir = options.toolsDir || this.getDefaultToolsDir();
        this.licensePath = path.join(this.toolsDir, 'license.key');
        this.cache = null;
        this.lastCheck = 0;
        this.cacheTimeout = options.cacheTimeout || 30 * 60 * 1000; // 30 minutes
    }
    
    /**
     * Get default tools directory
     */
    getDefaultToolsDir() {
        // Check environment variable first
        if (process.env.CHAHUA_TOOLS_DIR) {
            return process.env.CHAHUA_TOOLS_DIR;
        }
        
        try {
            // Check if running in Electron
            if (process.versions?.electron) {
                const { app } = require('electron');
                if (app?.isPackaged) {
                    // Production: tools folder next to executable
                    const execPath = process.execPath;
                    const execDir = path.dirname(execPath);
                    return path.join(execDir, 'tools');
                } else {
                    // Development: tools folder in project
                    return path.join(process.cwd(), 'tools');
                }
            }
        } catch (error) {
            // Fallback for non-Electron environments
        }
        
        return path.join(process.cwd(), 'tools');
    }
    
    /**
     * Ensure license is valid (with caching)
     */
    async ensureLicensed() {
        const now = Date.now();
        
        // Return cached result if still valid
        if (this.cache && (now - this.lastCheck) < this.cacheTimeout) {
            return this.cache;
        }
        
        // Validate current license
        const validation = this.validateCurrentLicense();
        
        if (!validation.valid) {
            throw new Error(validation.message || 'Invalid license');
        }
        
        // Cache the result
        this.cache = validation;
        this.lastCheck = now;
        
        return validation;
    }
    
    /**
     * Validate current license file
     */
    validateCurrentLicense() {
        return LicenseValidator.validateLicenseFile(this.licensePath);
    }
    
    /**
     * Install license from content
     */
    installLicense(licenseContent) {
        // Validate first
        const validation = LicenseValidator.validateLicense(licenseContent);
        
        if (!validation.valid) {
            throw new Error(validation.message || 'Invalid license');
        }
        
        // Create tools directory if it doesn't exist
        if (!fs.existsSync(this.toolsDir)) {
            fs.mkdirSync(this.toolsDir, { recursive: true });
        }
        
        // Save license file
        LicenseGenerator.saveLicense(licenseContent, this.licensePath);
        
        // Clear cache
        this.cache = null;
        this.lastCheck = 0;
        
        return validation;
    }
    
    /**
     * Install license from file
     */
    installLicenseFromFile(sourceFilePath) {
        if (!fs.existsSync(sourceFilePath)) {
            throw new Error('Source license file not found');
        }
        
        const licenseContent = LicenseGenerator.loadLicense(sourceFilePath);
        return this.installLicense(licenseContent);
    }
    
    /**
     * Get license status
     */
    getLicenseStatus() {
        const validation = this.validateCurrentLicense();
        
        if (!validation.valid) {
            return {
                status: validation.status,
                message: validation.message,
                licensed: false
            };
        }
        
        return {
            status: validation.status,
            message: validation.message,
            licensed: true,
            remainingDays: validation.remainingDays,
            expiresAt: validation.expiresAt,
            info: validation.info || {}
        };
    }
    
    /**
     * Check if application is licensed
     */
    isLicensed() {
        try {
            const validation = this.validateCurrentLicense();
            return validation.valid;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Get machine fingerprint
     */
    getMachineFingerprint() {
        return LicenseGenerator.getMachineFingerprint();
    }
    
    /**
     * Create development license (UNBOUND)
     */
    createDevLicense(days = 90) {
        return LicenseGenerator.createUnboundLicense(days);
    }
    
    /**
     * Create customer license
     */
    createCustomerLicense(customerName, days = 30, features = []) {
        return LicenseGenerator.createCustomerLicense(customerName, days, features);
    }
}

module.exports = LicenseManager;
