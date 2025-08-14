<div align="center">
  <img src="https://raw.githubusercontent.com/chahuadev/chahuadev/main/icon.png" alt="Chahua License System" width="120"/>
  <h1>🔐 CHAHUA LICENSE SYSTEM</h1>
  <p><strong>ระบบจัดการลิขสิทธิ์ระดับมืออาชีพ</strong></p>
  
  [![License](https://img.shields.io/badge/license-Proprietary-red.svg)](chahua-license-system/LICENSE)
  [![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)
  [![Version](https://img.shields.io/badge/version-2.0.0-orange.svg)](package.json)
  [![Thai](https://img.shields.io/badge/Language-ไทย-blue.svg)](README.md)
</div>

---

## ✨ คุณสมบัติเด่น

<div align="center">

| 🛡️ **ความปลอดภัย** | 🖥️ **การป้องกัน** | ⚡ **ความยืดหยุ่น** |
|:-------------------:|:-------------------:|:-------------------:|
| การเข้ารหัส AES-256-GCM | การผูกลายนิ้วมือเครื่อง | ระยะเวลาที่กำหนดได้ |
| ระบบ PBKDF2 + Salt | ป้องกันการแชร์ไลเซนส์ | รองรับหลายแอปพลิเคชัน |

</div>

### 🎯 ความสามารถหลัก

- ✅ **พร้อมใช้จริง** - ทดสอบแล้วในแอปพลิเคชันจริง
- 🛡️ **ไลเซนส์ UNBOUND** - เหมาะสำหรับการพัฒนาและทดสอบ  
- 🔒 **การผูกเครื่อง** - ป้องกันการใช้งานไลเซนส์หลายเครื่อง
- ⚡ **ระบบแคชอัจฉริยะ** - แคช 30 นาทีเพื่อประสิทธิภาพ
- 📁 **ตรวจจับเส้นทางอัตโนมัติ** - หา `tools/license.key` อัตโนมัติ

---

## 🚀 การเริ่มต้นใช้งาน

### � การติดตั้ง

```bash
# วิธีที่ 1: Git Submodule
git submodule add https://github.com/chahuadev/chahua-license-system.git

# วิธีที่ 2: คัดลอกโฟลเดอร์
cp -r chahua-license-system /path/to/your-project/
```

### 🔄 การใช้งานแบบเดิม (Legacy Mode)

```javascript
const { ensureLicensed, installLicenseFromContent } = require('./chahua-license-system/legacy');

try {
    const result = await ensureLicensed();
    console.log('✅ ไลเซนส์ถูกต้อง:', result.status);
    console.log('เหลือ:', result.daysRemaining, 'วัน');
} catch (error) {
    console.error('❌ ข้อผิดพลาด:', error.message);
}
```

### 🆕 การใช้งานแบบใหม่ (Modern API)

```javascript
const { LicenseManager } = require('./chahua-license-system');

const licenseManager = new LicenseManager({
    appId: 'com.company.myapp'
});

// ตรวจสอบไลเซนส์
await licenseManager.ensureLicensed();
```

---

## �️ เครื่องมือสำหรับนักพัฒนา

### สร้างไลเซนส์

```bash
# ไลเซนส์ UNBOUND (สำหรับพัฒนา)
node scripts/generate-license.js --type unbound --days 90

# ไลเซนส์ลูกค้า  
node scripts/generate-license.js --type customer --customer "บริษัท ABC" --days 30
```

### ตรวจสอบไลเซนส์

```bash
# ตรวจสอบไฟล์ไลเซนส์
node scripts/validate-license.js license.key

# แสดงข้อมูลละเอียด
node scripts/validate-license.js --info license.key
```

---

## 📚 เอกสารประกอบ

### 🔒 ประเภทไลเซนส์

| ประเภท | การผูกเครื่อง | ระยะเวลา | เหมาะสำหรับ |
|:------:|:-------------:|:--------:|:-----------:|
| **UNBOUND** | ❌ ไม่ผูก | 90+ วัน | การพัฒนา/ทดสอบ |
| **CUSTOMER** | ✅ ผูกเครื่อง | 30-60 วัน | การใช้งานจริง |

### 🛡️ คุณสมบัติด้านความปลอดภัย

- **� การเข้ารหัส AES-256-GCM** - การเข้ารหัสระดับทหาร
- **🖥️ ลายนิ้วมือเครื่อง** - การผูกไลเซนส์ตามฮาร์ดแวร์  
- **🔑 PBKDF2 + Salt** - การสร้างคีย์ที่ปลอดภัย
- **🚫 ตรวจจับการแก้ไข** - ป้องกันการดัดแปลงไลเซนส์

---

## 💻 เทคโนโลยีที่ใช้

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Electron](https://img.shields.io/badge/Electron-47848F?style=for-the-badge&logo=electron&logoColor=white)
![Crypto](https://img.shields.io/badge/AES--256-FF6B6B?style=for-the-badge&logo=lock&logoColor=white)

---

## 📁 โครงสร้างโปรเจกต์

```
chahua-license-system/
├── 📁 chahua-license-system/
│   ├── 📁 lib/                    # ไลบรารีหลัก
│   ├── 📁 scripts/                # เครื่องมือ CLI
│   ├── 📄 index.js                # จุดเริ่มต้น
│   ├── 📄 legacy.js               # รองรับรุ่นเก่า
│   └── 📜 LICENSE                 # สัญญาอนุญาต
├── 📁 tools/
│   └── 📜 license.key             # ไฟล์ไลเซนส์
├── 📁 ui/
│   ├── 🌐 demo.html               # หน้าเดโม
│   └── 📄 license-widget.js       # Widget สำหรับเว็บ
└── 📖 README.md                   # เอกสารนี้
```

---

## 📫 การสนับสนุน

<div align="center">

**พัฒนาโดย [Chahuadev](https://github.com/chahuadev)**

[![Email](https://img.shields.io/badge/Email-chahuadev@gmail.com-red?style=for-the-badge&logo=gmail)](mailto:chahuadev@gmail.com)
[![Website](https://img.shields.io/badge/Website-chahuadev.com-blue?style=for-the-badge&logo=google-chrome)](https://www.chahuadev.com)
[![Issues](https://img.shields.io/badge/Issues-GitHub-black?style=for-the-badge&logo=github)](https://github.com/chahuadev/chahua-license-system/issues)

</div>

---

## � สัญญาอนุญาต

<div align="center">

**🔒 Proprietary License**

**สงวนลิขสิทธิ์ © 2025 Chahua Development Thailand**

> ⚠️ นี่เป็นซอฟต์แวร์เชิงพาณิชย์ กรุณาติดต่อเราเพื่อขอใบอนุญาตการใช้งาน

</div>
