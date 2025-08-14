/**
 * Chahua License System
 * Professional license management for Electron applications
 * 
 * Features:
 * - Machine fingerprint binding
 * - AES-256-GCM encryption
 * - License expiration handling
 * - UNBOUND license support
 * - Easy integration with Electron apps
 * 
 * @author Chahua Development Thailand
 * @version 1.0.0
 */

const LicenseManager = require('./lib/license-manager');
const LicenseGenerator = require('./lib/license-generator');
const LicenseValidator = require('./lib/license-validator');
const LicenseGuard = require('./lib/license-guard');

module.exports = {
    LicenseManager,
    LicenseGenerator,
    LicenseValidator,
    LicenseGuard,
    
    // Convenience methods
    createLicense: LicenseGenerator.createLicense.bind(LicenseGenerator),
    validateLicense: LicenseValidator.validateLicense.bind(LicenseValidator),
    
    // Legacy methods for compatibility
    ensureLicensed: async function(options = {}) {
        const guard = new LicenseGuard(options);
        return await guard.ensureLicensed();
    },
    
    installLicenseFromContent: async function(licenseContent, options = {}) {
        const guard = new LicenseGuard(options);
        return await guard.installLicenseFromContent(licenseContent);
    },
    
    getLicensePath: function(options = {}) {
        const guard = new LicenseGuard(options);
        return guard.getLicensePath();
    },
    
    // Constants
    LICENSE_STATUS: {
        VALID: 'valid',
        EXPIRED: 'expired',
        INVALID: 'invalid',
        NOT_FOUND: 'not_found',
        MACHINE_MISMATCH: 'machine_mismatch',
        UNBOUND: 'unbound'
    }
};
