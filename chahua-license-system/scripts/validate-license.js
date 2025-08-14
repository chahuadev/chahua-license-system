#!/usr/bin/env node
/**
 * 🔍 License Validator Script
 * Command line tool for validating license keys
 */

const { LicenseValidator, LicenseGenerator } = require('../index');
const fs = require('fs');

function showUsage() {
    console.log(`
🔍 Chahua License Validator

Usage:
  node validate-license.js [options] <license-file-or-content>

Options:
  --file               Treat input as file path (default: auto-detect)
  --content            Treat input as license content
  --info               Show detailed license information
  --help               Show this help

Examples:
  # Validate license file
  node validate-license.js license.key

  # Validate license content directly
  node validate-license.js --content "eyJhbGciOiJIUz..."

  # Show detailed information
  node validate-license.js --info license.key
`);
}

function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h') || args.length === 0) {
        showUsage();
        return;
    }
    
    const showInfo = args.includes('--info');
    const isContent = args.includes('--content');
    const isFile = args.includes('--file');
    
    // Get the license input (last argument that's not a flag)
    const licenseInput = args.filter(arg => !arg.startsWith('--')).pop();
    
    if (!licenseInput) {
        console.error('❌ License file or content is required');
        showUsage();
        process.exit(1);
    }
    
    try {
        let validation;
        
        if (isContent) {
            // Validate license content directly
            validation = LicenseValidator.validateLicense(licenseInput);
        } else if (isFile || fs.existsSync(licenseInput)) {
            // Validate license file
            validation = LicenseValidator.validateLicenseFile(licenseInput);
        } else {
            // Auto-detect: try as content first, then as file
            try {
                validation = LicenseValidator.validateLicense(licenseInput);
            } catch (error) {
                validation = LicenseValidator.validateLicenseFile(licenseInput);
            }
        }
        
        // Display results
        console.log('\\n🔐 License Validation Results');
        console.log('=====================================');
        
        if (validation.valid) {
            console.log('✅ Status: VALID');
            console.log(`📊 Type: ${validation.status.toUpperCase()}`);
            console.log(`⏰ Remaining: ${validation.remainingDays} days`);
            console.log(`📅 Expires: ${new Date(validation.expiresAt).toLocaleString()}`);
            
            if (showInfo && validation.info) {
                console.log('\\n📋 License Details:');
                console.log(`   License ID: ${validation.info.licenseId}`);
                console.log(`   Created: ${new Date(validation.info.createdAt).toLocaleString()}`);
                console.log(`   Type: ${validation.info.licenseType}`);
                console.log(`   Features: ${validation.info.features?.join(', ') || 'ALL'}`);
                console.log(`   Max Installs: ${validation.info.maxInstalls}`);
                console.log(`   Version: ${validation.info.version}`);
                
                if (validation.info.customerInfo) {
                    console.log(`   Customer: ${JSON.stringify(validation.info.customerInfo, null, 2)}`);
                }
            }
        } else {
            console.log('❌ Status: INVALID');
            console.log(`🚫 Reason: ${validation.status.toUpperCase()}`);
            console.log(`💬 Message: ${validation.message}`);
        }
        
        console.log('=====================================');
        
        // Machine fingerprint info
        if (showInfo) {
            console.log('\\n🖥️ Machine Information:');
            console.log(`   Fingerprint: ${LicenseGenerator.getMachineFingerprint()}`);
        }
        
        process.exit(validation.valid ? 0 : 1);
        
    } catch (error) {
        console.error('❌ Error validating license:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = main;
