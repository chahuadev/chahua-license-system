/**
 * 🎨 Chahua License Widget
 * Floating license status widget for web applications
 * 
 * @version 1.0.0
 * @author Chahua Development Thailand
 */

class ChahuaLicenseWidget {
    constructor(options = {}) {
        this.options = {
            position: options.position || 'bottom-right', // bottom-right, bottom-left, top-right, top-left
            theme: options.theme || 'dark', // dark, light, auto
            showDetails: options.showDetails !== false, // แสดงรายละเอียดเมื่อ hover
            checkInterval: options.checkInterval || 300000, // 5 minutes
            apiEndpoint: options.apiEndpoint || '/api/license/check',
            projectName: options.projectName || 'Chahua Project',
            projectUrl: options.projectUrl || '#',
            ...options
        };
        
        this.widget = null;
        this.licenseData = null;
        this.lastCheck = 0;
        
        this.init();
    }
    
    init() {
        this.injectStyles();
        this.createWidget();
        this.checkLicense();
        this.startPeriodicCheck();
        this.bindEvents();
    }
    
    injectStyles() {
        const styles = `
            <style id="chahua-license-styles">
                .chahua-license-widget {
                    position: fixed;
                    z-index: 999999;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    font-size: 12px;
                    user-select: none;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .chahua-license-widget.bottom-right {
                    bottom: 20px;
                    right: 20px;
                }
                
                .chahua-license-widget.bottom-left {
                    bottom: 20px;
                    left: 20px;
                }
                
                .chahua-license-widget.top-right {
                    top: 20px;
                    right: 20px;
                }
                
                .chahua-license-widget.top-left {
                    top: 20px;
                    left: 20px;
                }
                
                .chahua-license-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 12px;
                    border-radius: 20px;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    backdrop-filter: blur(10px);
                    transition: all 0.3s ease;
                    border: 1px solid rgba(255,255,255,0.1);
                }
                
                .chahua-license-badge:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0,0,0,0.25);
                }
                
                .chahua-license-badge.theme-dark {
                    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
                    color: #ffffff;
                }
                
                .chahua-license-badge.theme-light {
                    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
                    color: #333333;
                    border-color: rgba(0,0,0,0.1);
                }
                
                .chahua-license-status {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    animation: pulse 2s infinite;
                }
                
                .chahua-license-status.valid {
                    background: #00d084;
                    box-shadow: 0 0 6px rgba(0,208,132,0.4);
                }
                
                .chahua-license-status.warning {
                    background: #ffb800;
                    box-shadow: 0 0 6px rgba(255,184,0,0.4);
                }
                
                .chahua-license-status.error {
                    background: #ff4757;
                    box-shadow: 0 0 6px rgba(255,71,87,0.4);
                }
                
                .chahua-license-status.unbound {
                    background: #3742fa;
                    box-shadow: 0 0 6px rgba(55,66,250,0.4);
                }
                
                .chahua-license-text {
                    font-weight: 600;
                    font-size: 11px;
                    letter-spacing: 0.5px;
                }
                
                .chahua-license-details {
                    position: absolute;
                    bottom: 100%;
                    right: 0;
                    margin-bottom: 10px;
                    min-width: 250px;
                    padding: 12px;
                    border-radius: 12px;
                    opacity: 0;
                    visibility: hidden;
                    transform: translateY(10px);
                    transition: all 0.3s ease;
                    pointer-events: none;
                }
                
                .chahua-license-widget:hover .chahua-license-details {
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(0);
                }
                
                .chahua-license-details.theme-dark {
                    background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
                    color: #ffffff;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                    border: 1px solid rgba(255,255,255,0.1);
                }
                
                .chahua-license-details.theme-light {
                    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
                    color: #333333;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                    border: 1px solid rgba(0,0,0,0.1);
                }
                
                .chahua-license-detail-row {
                    display: flex;
                    justify-content: space-between;
                    margin: 6px 0;
                    font-size: 11px;
                }
                
                .chahua-license-detail-label {
                    opacity: 0.7;
                    font-weight: 500;
                }
                
                .chahua-license-detail-value {
                    font-weight: 600;
                    text-align: right;
                }
                
                .chahua-license-links {
                    margin-top: 12px;
                    padding-top: 12px;
                    border-top: 1px solid rgba(255,255,255,0.1);
                    display: flex;
                    gap: 8px;
                }
                
                .chahua-license-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    padding: 4px 8px;
                    border-radius: 6px;
                    text-decoration: none;
                    font-size: 10px;
                    font-weight: 500;
                    transition: all 0.2s ease;
                }
                
                .chahua-license-link.theme-dark {
                    background: rgba(255,255,255,0.1);
                    color: #ffffff;
                }
                
                .chahua-license-link.theme-light {
                    background: rgba(0,0,0,0.05);
                    color: #333333;
                }
                
                .chahua-license-link:hover {
                    transform: scale(1.05);
                    background: #3742fa;
                    color: white;
                }
                
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                
                @media (max-width: 768px) {
                    .chahua-license-widget {
                        bottom: 10px !important;
                        right: 10px !important;
                    }
                    
                    .chahua-license-details {
                        right: auto;
                        left: 0;
                        max-width: calc(100vw - 40px);
                    }
                }
            </style>
        `;
        
        // Remove existing styles
        const existingStyles = document.getElementById('chahua-license-styles');
        if (existingStyles) {
            existingStyles.remove();
        }
        
        // Add new styles
        document.head.insertAdjacentHTML('beforeend', styles);
    }
    
    createWidget() {
        const widgetHTML = `
            <div class="chahua-license-widget ${this.options.position}" id="chahua-license-widget">
                <div class="chahua-license-badge theme-${this.options.theme}" id="chahua-license-badge">
                    <div class="chahua-license-status valid" id="chahua-license-status"></div>
                    <div class="chahua-license-text" id="chahua-license-text">Chahua</div>
                </div>
                ${this.options.showDetails ? `
                <div class="chahua-license-details theme-${this.options.theme}" id="chahua-license-details">
                    <div class="chahua-license-detail-row">
                        <span class="chahua-license-detail-label">โปรเจกต์:</span>
                        <span class="chahua-license-detail-value">${this.options.projectName}</span>
                    </div>
                    <div class="chahua-license-detail-row">
                        <span class="chahua-license-detail-label">สถานะ:</span>
                        <span class="chahua-license-detail-value" id="license-status-text">กำลังตรวจสอบ...</span>
                    </div>
                    <div class="chahua-license-detail-row">
                        <span class="chahua-license-detail-label">วันที่เหลือ:</span>
                        <span class="chahua-license-detail-value" id="license-days-text">-</span>
                    </div>
                    <div class="chahua-license-detail-row">
                        <span class="chahua-license-detail-label">ประเภท:</span>
                        <span class="chahua-license-detail-value" id="license-type-text">-</span>
                    </div>
                    <div class="chahua-license-detail-row">
                        <span class="chahua-license-detail-label">หมดอายุ:</span>
                        <span class="chahua-license-detail-value" id="license-expires-text">-</span>
                    </div>
                    <div class="chahua-license-links">
                        <a href="${this.options.projectUrl}" class="chahua-license-link theme-${this.options.theme}" target="_blank">
                            🏠 โปรเจกต์
                        </a>
                        <a href="https://www.chahuadev.com" class="chahua-license-link theme-${this.options.theme}" target="_blank">
                            🌐 Chahua Dev
                        </a>
                    </div>
                </div>
                ` : ''}
            </div>
        `;
        
        // Remove existing widget
        const existingWidget = document.getElementById('chahua-license-widget');
        if (existingWidget) {
            existingWidget.remove();
        }
        
        // Add new widget
        document.body.insertAdjacentHTML('beforeend', widgetHTML);
        this.widget = document.getElementById('chahua-license-widget');
    }
    
    async checkLicense() {
        try {
            const now = Date.now();
            if (this.licenseData && (now - this.lastCheck) < 60000) {
                return; // Cache for 1 minute
            }
            
            const response = await fetch(this.options.apiEndpoint);
            const data = await response.json();
            
            this.licenseData = data;
            this.lastCheck = now;
            this.updateWidget(data);
            
        } catch (error) {
            console.warn('Chahua License Widget: Failed to check license', error);
            this.updateWidget({
                success: false,
                status: 'error',
                message: 'ไม่สามารถเชื่อมต่อได้'
            });
        }
    }
    
    updateWidget(data) {
        const statusElement = document.getElementById('chahua-license-status');
        const textElement = document.getElementById('chahua-license-text');
        
        if (!statusElement || !textElement) return;
        
        // Update main badge
        let statusClass = 'error';
        let statusText = 'License';
        
        if (data.success || data.licensed) {
            if (data.status === 'UNBOUND license active') {
                statusClass = 'unbound';
                statusText = 'DEV';
            } else if (data.daysRemaining > 30) {
                statusClass = 'valid';
                statusText = 'Licensed';
            } else if (data.daysRemaining > 0) {
                statusClass = 'warning';
                statusText = `${data.daysRemaining}d`;
            } else {
                statusClass = 'error';
                statusText = 'Expired';
            }
        }
        
        statusElement.className = `chahua-license-status ${statusClass}`;
        textElement.textContent = statusText;
        
        // Update details if shown
        if (this.options.showDetails) {
            this.updateDetails(data);
        }
    }
    
    updateDetails(data) {
        const elements = {
            status: document.getElementById('license-status-text'),
            days: document.getElementById('license-days-text'),
            type: document.getElementById('license-type-text'),
            expires: document.getElementById('license-expires-text')
        };
        
        if (!elements.status) return;
        
        if (data.success || data.licensed) {
            elements.status.textContent = data.status === 'UNBOUND license active' ? 'UNBOUND (Dev)' : 'ใช้งานได้';
            elements.days.textContent = data.daysRemaining ? `${data.daysRemaining} วัน` : 'ไม่จำกัด';
            elements.type.textContent = data.licenseType || data.status || 'Standard';
            
            if (data.expiresAt) {
                const expiry = new Date(data.expiresAt);
                elements.expires.textContent = expiry.toLocaleDateString('th-TH');
            } else {
                elements.expires.textContent = 'ไม่จำกัด';
            }
        } else {
            elements.status.textContent = data.message || 'ไม่พบ License';
            elements.days.textContent = '-';
            elements.type.textContent = '-';
            elements.expires.textContent = '-';
        }
    }
    
    bindEvents() {
        if (this.widget) {
            this.widget.addEventListener('click', () => {
                this.checkLicense();
            });
        }
    }
    
    startPeriodicCheck() {
        setInterval(() => {
            this.checkLicense();
        }, this.options.checkInterval);
    }
    
    destroy() {
        if (this.widget) {
            this.widget.remove();
        }
        
        const styles = document.getElementById('chahua-license-styles');
        if (styles) {
            styles.remove();
        }
    }
    
    // Static methods for easy initialization
    static init(options = {}) {
        return new ChahuaLicenseWidget(options);
    }
}

// Auto-initialize if data attributes are found
document.addEventListener('DOMContentLoaded', () => {
    const autoInit = document.querySelector('[data-chahua-license]');
    if (autoInit) {
        const options = {
            position: autoInit.dataset.position,
            theme: autoInit.dataset.theme,
            projectName: autoInit.dataset.projectName,
            projectUrl: autoInit.dataset.projectUrl,
            apiEndpoint: autoInit.dataset.apiEndpoint,
            showDetails: autoInit.dataset.showDetails !== 'false'
        };
        
        // Remove undefined values
        Object.keys(options).forEach(key => {
            if (options[key] === undefined) {
                delete options[key];
            }
        });
        
        ChahuaLicenseWidget.init(options);
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChahuaLicenseWidget;
}

// Global assignment for browser
if (typeof window !== 'undefined') {
    window.ChahuaLicenseWidget = ChahuaLicenseWidget;
}
