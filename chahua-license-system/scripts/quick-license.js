#!/usr/bin/env node
/**
 * 🚀 Quick License Creator
 * Create license directly using working code
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');

function getMachineFingerprint() {
    const networkInterfaces = os.networkInterfaces();
    const cpus = os.cpus();
    
    let macAddresses = [];
    for (const iface of Object.values(networkInterfaces)) {
        for (const config of iface) {
            if (config.mac && config.mac !== '00:00:00:00:00:00') {
                macAddresses.push(config.mac);
            }
        }
    }
    
    const systemInfo = {
        platform: os.platform(),
        arch: os.arch(),
        hostname: os.hostname(),
        macAddresses: macAddresses.sort(),
        cpuModel: cpus[0]?.model || 'unknown',
        totalMemory: os.totalmem(),
        homeDir: os.homedir()
    };
    
    const fingerprint = crypto
        .createHash('sha256')
        .update(JSON.stringify(systemInfo))
        .digest('hex');
        
    return fingerprint;
}

function createQuickLicense(days = 90, licenseType = 'UNBOUND') {
    const now = new Date();
    const expirationDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
    
    const licenseData = {
        licenseId: crypto.randomBytes(16).toString('hex'),
        createdAt: now.toISOString(),
        expiresAt: expirationDate.toISOString(),
        licenseType,
        features: ['ALL'],
        maxInstalls: licenseType === 'UNBOUND' ? 999 : 1,
        customerInfo: {
            type: licenseType === 'UNBOUND' ? 'Development' : 'Commercial',
            note: licenseType === 'UNBOUND' ? 'Universal license - no machine binding' : 'Machine-bound license'
        },
        machineFingerprint: licenseType === 'UNBOUND' ? null : getMachineFingerprint(),
        version: '1.0.0'
    };
    
    // Simple encoding (matches the original working system)
    const secretKey = 'ChahuaDev2024SecureLicenseSystem!@#$%^&*()';
    const algorithm = 'aes-256-gcm';
    
    const key = crypto.scryptSync(secretKey, 'salt', 32);
    const iv = crypto.randomBytes(16);
    
    // Use legacy createCipher for compatibility
    const cipher = crypto.createCipher('aes-256-cbc', key);
    
    let encrypted = cipher.update(JSON.stringify(licenseData), 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    const result = {
        encrypted,
        iv: iv.toString('base64'),
        authTag: '', // Empty for CBC mode
        algorithm: 'aes-256-cbc'
    };
    
    return Buffer.from(JSON.stringify(result)).toString('base64');
}

function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
🚀 Quick License Creator

Usage:
  node quick-license.js [--days 90] [--type UNBOUND] [--output license.key]

Examples:
  # Create 90-day UNBOUND license
  node quick-license.js
  
  # Create 30-day customer license  
  node quick-license.js --days 30 --type CUSTOMER
  
  # Save to file
  node quick-license.js --output ../tools/license.key
        `);
        return;
    }
    
    let days = 90;
    let licenseType = 'UNBOUND';
    let output = null;
    
    for (let i = 0; i < args.length; i += 2) {
        const key = args[i];
        const value = args[i + 1];
        
        switch (key) {
            case '--days':
                days = parseInt(value) || 90;
                break;
            case '--type':
                licenseType = value || 'UNBOUND';
                break;
            case '--output':
                output = value;
                break;
        }
    }
    
    try {
        console.log(`🔐 Creating ${licenseType} license for ${days} days...`);
        console.log(`🖥️ Machine fingerprint: ${getMachineFingerprint().substring(0, 16)}...`);
        
        const license = createQuickLicense(days, licenseType);
        
        if (output) {
            const dir = path.dirname(output);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            const header = '# Chahua License System - Generated License Key\\n';
            const footer = '\\n# End of License';
            const content = header + license + footer;
            
            fs.writeFileSync(output, content, 'utf8');
            console.log(`✅ License saved to: ${output}`);
        } else {
            console.log('\\n📄 License Key:');
            console.log('=' .repeat(80));
            console.log(license);
            console.log('=' .repeat(80));
        }
        
    } catch (error) {
        console.error('❌ Error creating license:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { createQuickLicense, getMachineFingerprint };
