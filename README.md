# 🔐 Chahua License System - ระบบจัดการลิขสิทธิ์แบบครบครัน

ระบบจัดการ license key สำหรับแอปพลิเคชัน Electron ที่มีความปลอดภัยสูงและใช้งานง่าย

## 🌟 คุณสมบัติพิเศษ

- ✅ **ใช้ระบบเดิมที่ทำงานจริง**: ก็อปมาจาก `license-guard.js` และ `license-generator.js` ที่ใช้งานจริงแล้ว
- 🛡️ **รองรับ UNBOUND License**: สำหรับ development และ testing  
- 🔒 **Machine Fingerprint Binding**: ป้องกันการใช้ license หลายเครื่อง
- ⚡ **Caching System**: แคช 30 นาทีเพื่อลดการตรวจสอบ
- 📁 **Auto Path Detection**: อ่าน license จาก `tools/license.key` อัตโนมัติ
- 🏗️ **Production Ready**: รองรับทั้ง development และ production (packaged app)

## 📦 การติดตั้ง

### วิธีที่ 1: Copy ทั้งโฟลเดอร์
```bash
# Copy โฟลเดอร์ chahua-license-system ไปยังโปรเจกต์ใหม่
cp -r chahua-license-system /path/to/new-project/
```

### วิธีที่ 2: Git Submodule
```bash
git submodule add https://github.com/chahuadev/chahua-license-system.git
```

## 🚀 วิธีใช้งาน

### การใช้งานแบบเดิม (Legacy Mode)
```javascript
// เหมือนกับการใช้ license-guard.js เดิมทุกประการ
const { ensureLicensed, installLicenseFromContent, getLicensePath } = require('./chahua-license-system/legacy');

// ตรวจสอบ license
try {
    const result = await ensureLicensed();
    console.log('✅ License OK:', result.status);
    console.log('เหลือ:', result.daysRemaining, 'วัน');
    console.log('Plugin:', result.pluginId);
} catch (error) {
    console.error('❌ License Error:', error.message);
}
```

### การใช้งาน License Widget (UI)
```html
<!-- เพิ่มใน HTML -->
<script src="chahua-license-system/ui/license-widget.js"></script>

<!-- Auto-init Widget -->
<div data-chahua-license
     data-project-name="ชื่อโปรเจกต์ของคุณ"
     data-project-url="/dashboard"
     data-api-endpoint="/api/license/check"
     data-position="bottom-right"
     data-theme="dark"></div>
```

### การใช้งานแบบใหม่ (Modern API)
```javascript
const { LicenseManager, LicenseGenerator, LicenseValidator } = require('./chahua-license-system');

// สร้าง License Manager
const licenseManager = new LicenseManager({
    appId: 'com.company.myapp'
});

// ตรวจสอบ license
const result = await licenseManager.ensureLicensed();
```

## Features ✨

- **🛡️ Military-Grade Security**: AES-256-GCM encryption with PBKDF2 key derivation
- **🖥️ Machine Binding**: Hardware fingerprint binding for license protection
- **⏰ Flexible Duration**: Support for custom license durations (30/60/90/120 days)
- **🔓 UNBOUND Licenses**: Development licenses without machine binding
- **🎯 Multi-App Support**: Use across multiple Electron applications
- **💼 Customer Management**: Customer-specific license generation
- **🚀 Easy Integration**: Simple API for Electron apps

## Installation 📦

```bash
npm install chahua-license-system
```

Or copy the entire `chahua-license-system` folder to your project.

## Quick Start 🚀

### Basic Usage

```javascript
const { LicenseManager } = require('chahua-license-system');

// Initialize license manager
const licenseManager = new LicenseManager({
    appId: 'my-electron-app',
    toolsDir: './tools' // Optional: custom tools directory
});

// Check if app is licensed
try {
    await licenseManager.ensureLicensed();
    console.log('✅ Application is licensed!');
} catch (error) {
    console.error('❌ License error:', error.message);
}
```

### Generate Licenses

```javascript
const { LicenseGenerator } = require('chahua-license-system');

// Generate UNBOUND license (for development)
const devLicense = LicenseGenerator.createUnboundLicense(90); // 90 days

// Generate customer license
const customerLicense = LicenseGenerator.createCustomerLicense(
    'ABC Company',
    30, // 30 days
    ['DATABASE', 'EXPORT', 'API'] // features
);

// Save license to file
LicenseGenerator.saveLicense(devLicense, './license.key');
```

### Validate Licenses

```javascript
const { LicenseValidator } = require('chahua-license-system');

// Validate license content
const validation = LicenseValidator.validateLicense(licenseContent);

if (validation.valid) {
    console.log(`License valid for ${validation.remainingDays} days`);
    console.log(`Status: ${validation.status}`);
} else {
    console.log(`Invalid license: ${validation.message}`);
}
```

## API Reference 📚

### LicenseManager

Main class for license management in your application.

```javascript
const manager = new LicenseManager(options)
```

**Options:**
- `appId`: Application identifier
- `toolsDir`: Tools directory path (optional)
- `cacheTimeout`: Cache timeout in milliseconds (default: 30 minutes)

**Methods:**
- `ensureLicensed()`: Ensure application is licensed (throws if not)
- `validateCurrentLicense()`: Validate current license file
- `installLicense(content)`: Install license from content
- `getLicenseStatus()`: Get current license status
- `isLicensed()`: Check if application is licensed (boolean)

### LicenseGenerator

Generate encrypted license keys.

**Static Methods:**
- `createUnboundLicense(days)`: Create UNBOUND license
- `createCustomerLicense(name, days, features)`: Create customer license  
- `getMachineFingerprint()`: Get current machine fingerprint
- `saveLicense(content, filepath)`: Save license to file
- `loadLicense(filepath)`: Load license from file

### LicenseValidator

Validate and verify license keys.

**Static Methods:**
- `validateLicense(content)`: Validate license content
- `validateLicenseFile(filepath)`: Validate license file
- `getLicenseInfo(content)`: Get detailed license information

## Command Line Tools 🛠️

### Generate License

```bash
# Generate UNBOUND license
node scripts/generate-license.js --type unbound --days 90

# Generate customer license  
node scripts/generate-license.js --type customer --customer "ABC Corp" --days 30

# Save to file
node scripts/generate-license.js --output license.key
```

### Validate License

```bash
# Validate license file
node scripts/validate-license.js license.key

# Show detailed information
node scripts/validate-license.js --info license.key

# Validate license content
node scripts/validate-license.js --content "eyJhbGciOiJI..."
```

## Integration Guide 🔧

### 1. Add to Electron Main Process

```javascript
const { LicenseManager } = require('chahua-license-system');

const licenseManager = new LicenseManager({
    appId: 'com.company.myapp'
});

app.whenReady(async () => {
    try {
        await licenseManager.ensureLicensed();
        createWindow(); // License OK, create app window
    } catch (error) {
        // Show license dialog or exit
        dialog.showErrorBox('License Error', error.message);
        app.quit();
    }
});
```

### 2. Add to Preload Script

```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('license', {
    getStatus: () => ipcRenderer.invoke('license:getStatus'),
    install: (content) => ipcRenderer.invoke('license:install', content)
});
```

### 3. Add IPC Handlers

```javascript
const { ipcMain } = require('electron');

ipcMain.handle('license:getStatus', async () => {
    return licenseManager.getLicenseStatus();
});

ipcMain.handle('license:install', async (event, content) => {
    return licenseManager.installLicense(content);
});
```

## License Types 📋

### UNBOUND License
- No machine binding
- Perfect for development
- Can be used on any machine
- Typically longer duration (90+ days)

### CUSTOMER License  
- Bound to specific machine
- Production use
- Customer-specific information
- Shorter duration (30-60 days)

## Security Features 🔒

- **AES-256-GCM Encryption**: Military-grade encryption
- **Machine Fingerprinting**: Hardware-based license binding
- **Secure Key Derivation**: PBKDF2 with salt
- **Tamper Detection**: Authentication tags prevent modification
- **Expiration Handling**: Automatic expiry checking

## File Structure 📁

```
├── 📁 chahua-license-system/
│   ├── 📁 lib/
│   │   ├── 📄 license-generator.js
│   │   ├── 📄 license-guard.js
│   │   ├── 📄 license-manager.js
│   │   └── 📄 license-validator.js
│   ├── 📁 scripts/
│   │   ├── 📄 generate-license.js
│   │   ├── 📄 quick-license.js
│   │   └── 📄 validate-license.js
│   ├── 📜 LICENSE
│   ├── 📄 index.js
│   ├── 📄 legacy.js
│   └── 📄 package.json
├── 📁 tools/
│   └── 📜 license.key
├── 📁 ui/
│   ├── 🌐 demo.html
│   ├── 🌐 example.html
│   └── 📄 license-widget.js
└── 📖 README.md # This file
```

## Testing 🧪

Run the test suite:

```bash
npm test
```

Or manually:

```bash
node test/test-license.js
```

## Examples 💡

### Complete Electron Integration

```javascript
// main.js
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { LicenseManager } = require('chahua-license-system');

const licenseManager = new LicenseManager({
    appId: 'com.mycompany.myapp'
});

// Gate application startup
app.whenReady(async () => {
    try {
        const status = await licenseManager.ensureLicensed();
        console.log(`Licensed for ${status.remainingDays} more days`);
        createWindow();
    } catch (error) {
        const result = dialog.showMessageBoxSync(null, {
            type: 'error',
            title: 'License Required',
            message: error.message,
            buttons: ['Install License', 'Exit']
        });
        
        if (result === 0) {
            // Show license installation dialog
            showLicenseDialog();
        } else {
            app.quit();
        }
    }
});

// IPC handlers
ipcMain.handle('license:getStatus', async () => {
    return licenseManager.getLicenseStatus();
});

ipcMain.handle('license:install', async (event, licenseContent) => {
    try {
        const result = licenseManager.installLicense(licenseContent);
        return { success: true, result };
    } catch (error) {
        return { success: false, error: error.message };
    }
});
```

## License Widget UI 🎨

The License Widget provides a floating visual indicator for web-based projects showing real-time license status.

### Features
- **Real-time Status**: Shows license validity and remaining days
- **Floating Display**: Non-intrusive corner positioning
- **Theme Support**: Light and dark themes
- **Auto-init**: Automatic initialization via data attributes
- **Responsive Design**: Works on mobile and desktop

### Quick Setup

```html
<!-- Include the widget -->
<script src="chahua-license-system/ui/license-widget.js"></script>

<!-- Auto-initialize with data attributes -->
<div data-license-widget 
     data-api-url="/api/license/check"
     data-theme="dark"
     data-position="bottom-right"></div>
```

### API Endpoint Required

The widget expects a license status endpoint:

```javascript
// Express.js example
app.get('/api/license/check', async (req, res) => {
    try {
        const licenseManager = new LicenseManager({
            appId: 'com.mycompany.webapp'
        });
        const status = await licenseManager.getLicenseStatus();
        res.json(status);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
```

### Manual Initialization

```javascript
const widget = new ChahuaLicenseWidget({
    apiUrl: '/api/license/check',
    theme: 'dark',
    position: 'bottom-right',
    refreshInterval: 30000
});
```

### Configuration Options

| Option | Default | Description |
|--------|---------|-------------|
| `apiUrl` | `/api/license/check` | License status API endpoint |
| `theme` | `dark` | Widget theme (`light`/`dark`) |
| `position` | `bottom-right` | Corner position |
| `refreshInterval` | `30000` | Status refresh interval (ms) |

### Demo & Examples

- **Interactive Demo**: Open `ui/demo.html` in your browser
- **Usage Examples**: See `ui/example.html` for implementation patterns

## Support 💬

- 🌐 Website: [https://www.chahuadev.com](https://www.chahuadev.com)
- 📧 Email: dev@chahuadev.com
- 🐛 Issues: [GitHub Issues](https://github.com/chahuadev/chahua-license-system/issues)

## License 📄

MIT License - see [LICENSE](LICENSE) file for details.

---

**Developed with ❤️ by Chahua Development Thailand**
#   c h a h u a - l i c e n s e - s y s t e m 
 
 
