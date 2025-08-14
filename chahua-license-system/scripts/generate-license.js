#!/usr/bin/env node
/**
 * 🔧 License Generator Script
 * Command line tool for generating license keys
 */

const { LicenseGenerator } = require('../index');

function showUsage() {
    console.log(`
🔐 Chahua License Generator

Usage:
  node generate-license.js [options]

Options:
  --type <type>         License type: unbound, customer (default: unbound)
  --days <number>       License duration in days (default: 90)
  --customer <name>     Customer name (required for customer type)
  --features <list>     Comma-separated feature list (default: ALL)
  --output <file>       Output file path (optional)
  --help               Show this help

Examples:
  # Generate 90-day UNBOUND license
  node generate-license.js

  # Generate 30-day customer license
  node generate-license.js --type customer --days 30 --customer "ABC Company"

  # Generate license with specific features
  node generate-license.js --type customer --days 60 --customer "XYZ Corp" --features "DATABASE,EXPORT,API"
`);
}

function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        showUsage();
        return;
    }
    
    const options = {};
    
    for (let i = 0; i < args.length; i += 2) {
        const key = args[i];
        const value = args[i + 1];
        
        switch (key) {
            case '--type':
                options.type = value;
                break;
            case '--days':
                options.days = parseInt(value);
                break;
            case '--customer':
                options.customer = value;
                break;
            case '--features':
                options.features = value.split(',').map(f => f.trim());
                break;
            case '--output':
                options.output = value;
                break;
        }
    }
    
    try {
        let license;
        
        if (options.type === 'customer') {
            if (!options.customer) {
                console.error('❌ Customer name is required for customer license');
                process.exit(1);
            }
            
            license = LicenseGenerator.createCustomerLicense(
                options.customer,
                options.days || 30,
                options.features || ['ALL']
            );
            
            console.log(`✅ Generated customer license for: ${options.customer}`);
        } else {
            // Default to unbound license
            license = LicenseGenerator.createUnboundLicense(options.days || 90);
            console.log(`✅ Generated UNBOUND license for ${options.days || 90} days`);
        }
        
        if (options.output) {
            LicenseGenerator.saveLicense(license, options.output);
            console.log(`💾 License saved to: ${options.output}`);
        } else {
            console.log('\\n📄 License Key:');
            console.log('----------------------------------------');
            console.log(license);
            console.log('----------------------------------------');
        }
        
    } catch (error) {
        console.error('❌ Error generating license:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = main;
