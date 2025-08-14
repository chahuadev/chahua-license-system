/**
 * 🛡️ Chahua License Validator
 * Secure license validation and verification
 * 
 * @version 1.0.0
 * @author Chahua Development Thailand
 */

const fs = require('fs');
const path = require('path');
const LicenseGenerator = require('./license-generator');

class LicenseValidator {
    
    /**
     * Validate license content
     */
    static validateLicense(licenseContent) {
        try {
            const licenseData = LicenseGenerator.decryptLicense(licenseContent);
            
            // Check expiration
            const now = new Date();
            const expiresAt = new Date(licenseData.expiresAt);
            
            if (now > expiresAt) {
                return {
                    valid: false,
                    status: 'expired',
                    message: 'License has expired',
                    expiresAt: expiresAt.toISOString()
                };
            }
            
            // Check machine fingerprint (unless UNBOUND)
            if (licenseData.licenseType !== 'UNBOUND' && licenseData.machineFingerprint) {
                const currentFingerprint = LicenseGenerator.getMachineFingerprint();
                if (licenseData.machineFingerprint !== currentFingerprint) {
                    return {
                        valid: false,
                        status: 'machine_mismatch',
                        message: 'License bound to different machine'
                    };
                }
            }
            
            // Calculate remaining days
            const remainingMs = expiresAt.getTime() - now.getTime();
            const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
            
            return {
                valid: true,
                status: licenseData.licenseType === 'UNBOUND' ? 'unbound' : 'valid',
                licenseData,
                remainingDays,
                expiresAt: expiresAt.toISOString(),
                message: `License valid for ${remainingDays} more days`
            };
            
        } catch (error) {
            return {
                valid: false,
                status: 'invalid',
                message: 'Invalid license format'
            };
        }
    }
    
    /**
     * Validate license from file
     */
    static validateLicenseFile(filePath) {
        if (!fs.existsSync(filePath)) {
            return {
                valid: false,
                status: 'not_found',
                message: 'License file not found'
            };
        }
        
        try {
            const licenseContent = LicenseGenerator.loadLicense(filePath);
            return this.validateLicense(licenseContent);
        } catch (error) {
            return {
                valid: false,
                status: 'invalid',
                message: error.message
            };
        }
    }
    
    /**
     * Get license status information
     */
    static getLicenseInfo(licenseContent) {
        const validation = this.validateLicense(licenseContent);
        
        if (!validation.valid) {
            return validation;
        }
        
        const { licenseData } = validation;
        
        return {
            ...validation,
            info: {
                licenseId: licenseData.licenseId,
                createdAt: licenseData.createdAt,
                licenseType: licenseData.licenseType,
                features: licenseData.features,
                maxInstalls: licenseData.maxInstalls,
                customerInfo: licenseData.customerInfo,
                version: licenseData.version
            }
        };
    }
}

module.exports = LicenseValidator;
