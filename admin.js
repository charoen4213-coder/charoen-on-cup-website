/**
 * admin.js
 * Admin CMS Controller - Products/Categories/Slider/Videos CRUD,
 * WebP Image Auto-converter, and Blob Video upload engine (max 20MB).
 */

// Helper for robust overlay normalization (0 to 80 integer percentage)
window.normalizeSectionOverlay = (raw) => {
    if (raw === undefined || raw === null || raw === '') return 55;
    let val = Number(raw);
    if (!Number.isFinite(val)) return 55;
    if (val > 0 && val <= 1) val = val * 100;
    return Math.min(80, Math.max(0, Math.round(val)));
};

// Reusable helper function to generate Section Background Appearance Panel HTML
window.renderBgAppearancePanelHtml = (sectionObj) => {
    const bgStyle = sectionObj.content?.backgroundStyle || sectionObj.backgroundStyle || 'line_art';
    const bgImg = sectionObj.content?.backgroundImage || sectionObj.backgroundImage || '';
    const bgOverlay = window.normalizeSectionOverlay(sectionObj.content?.backgroundOverlay ?? sectionObj.backgroundOverlay);
    const bgPos = sectionObj.content?.backgroundPosition || sectionObj.backgroundPosition || 'center center';
    const bgBrightness = sectionObj.content?.backgroundBrightness !== undefined ? sectionObj.content.backgroundBrightness : 100;
    const bgTextTheme = sectionObj.content?.backgroundTextTheme || sectionObj.backgroundTextTheme || 'auto';
    const rawBgAttachment = sectionObj.content?.backgroundAttachment ?? sectionObj.backgroundAttachment;
    const bgAttachment = rawBgAttachment === 'fixed' ? 'fixed' : 'scroll';

    window.currentActiveSecBgImg = bgImg;

    return `
        <!-- Collapsible Background Appearance Panel (Milestone 4.5 & 4.5.1) -->
        <details class="bg-appearance-panel" style="margin:20px 0; background:var(--bg-main); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:12px 16px; width:100%; max-width:100%; box-sizing:border-box; margin-left:0; margin-right:0;">
            <summary style="font-weight:700; color:var(--primary); cursor:pointer; font-size:0.9rem; display:flex; align-items:center; justify-content:space-between;">
                <span><i class="fas fa-paint-roller" style="color:var(--secondary); margin-right:8px;"></i> การตั้งค่าพื้นหลังเซกชัน (Background Appearance)</span>
                <i class="fas fa-chevron-down" style="font-size:0.8rem; color:var(--text-sec);"></i>
            </summary>
            
            <div style="margin-top:16px; padding-top:12px; border-top:1px dashed var(--border-color);">
                <!-- 1. Background Style -->
                <div class="form-group" style="margin-bottom:14px;">
                    <label style="font-weight:700; font-size:0.82rem; color:var(--primary); display:block; margin-bottom:8px;">
                        1. รูปแบบพื้นหลัง (Background Style)
                    </label>
                    <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:10px;">
                        <label style="display:flex; align-items:center; gap:8px; padding:8px 12px; background:var(--bg-sec); border:1px solid var(--border-color); border-radius:var(--radius-sm); cursor:pointer; font-size:0.82rem;">
                            <input type="radio" name="bg-style-radio" value="solid_color" ${bgStyle === 'solid_color' ? 'checked' : ''} onchange="window.toggleBgStyleControls(this.value)"> Solid Color (สีเรียบ)
                        </label>
                        <label style="display:flex; align-items:center; gap:8px; padding:8px 12px; background:var(--bg-sec); border:1px solid var(--border-color); border-radius:var(--radius-sm); cursor:pointer; font-size:0.82rem;">
                            <input type="radio" name="bg-style-radio" value="line_art" ${bgStyle === 'line_art' ? 'checked' : ''} onchange="window.toggleBgStyleControls(this.value)"> Decorative Line Art (ลายเส้น)
                        </label>
                        <label style="display:flex; align-items:center; gap:8px; padding:8px 12px; background:var(--bg-sec); border:1px solid var(--border-color); border-radius:var(--radius-sm); cursor:pointer; font-size:0.82rem;">
                            <input type="radio" name="bg-style-radio" value="image" ${bgStyle === 'image' ? 'checked' : ''} onchange="window.toggleBgStyleControls(this.value)"> Background Image (รูปภาพ)
                        </label>
                        <label style="display:flex; align-items:center; gap:8px; padding:8px 12px; background:var(--bg-sec); border:1px solid var(--border-color); border-radius:var(--radius-sm); cursor:pointer; font-size:0.82rem;">
                            <input type="radio" name="bg-style-radio" value="image_line_art" ${bgStyle === 'image_line_art' ? 'checked' : ''} onchange="window.toggleBgStyleControls(this.value)"> Background Image + Line Art
                        </label>
                    </div>
                </div>

                <!-- Image Controls Box -->
                <div id="bg-img-controls-box" style="display:${(bgStyle === 'image' || bgStyle === 'image_line_art') ? 'block' : 'none'};">
                    <!-- 2. Background Image Upload -->
                    <div class="form-group" style="background:var(--bg-sec); padding:12px; border-radius:var(--radius-sm); border:1px solid var(--border-color); margin-bottom:14px;">
                        <label style="font-weight:700; font-size:0.82rem; color:var(--primary); display:block; margin-bottom:6px;">
                            2. อัปโหลดรูปภาพพื้นหลัง (Supported: JPG, PNG, WEBP)
                        </label>
                        <div style="display:flex; gap:8px; align-items:center; margin-bottom:8px;">
                            <input type="file" id="sec-bg-file" class="form-control" accept="image/*" style="padding:4px; font-size:0.75rem; flex-grow:1;" onchange="window.uploadSecBgFile(this)">
                            <button type="button" class="btn btn-outline" onclick="window.selectSecBgMedia()" style="padding:6px 10px; font-size:0.72rem;"><i class="fas fa-folder-open"></i> คลังภาพ</button>
                            <button type="button" class="btn btn-outline" id="remove-sec-bg-btn" onclick="window.removeSecBgImg()" style="padding:6px 10px; font-size:0.72rem; color:var(--danger); border-color:var(--danger); display:${bgImg ? 'inline-flex' : 'none'};"><i class="fas fa-trash"></i> ลบรูป</button>
                        </div>
                        <div style="text-align:center;">
                            <img id="sec-bg-img-preview" src="${bgImg}" style="max-height:100px; max-width:100%; border-radius:var(--radius-sm); border:1px solid var(--border-color); display:${bgImg ? 'inline-block' : 'none'}; object-fit:cover;">
                            <div id="sec-bg-img-empty" style="padding:10px; background:var(--bg-main); border:1px dashed var(--border-color); border-radius:var(--radius-sm); font-size:0.75rem; color:var(--text-sec); display:${bgImg ? 'none' : 'block'};">
                                <i class="fas fa-info-circle" style="color:var(--secondary);"></i> ยังไม่ได้เลือกรูปภาพพื้นหลัง
                            </div>
                        </div>
                    </div>

                    <!-- 3. Overlay Slider (0-80%, default 55%) -->
                    <div class="form-group" style="margin-bottom:14px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                            <label style="font-weight:700; font-size:0.82rem; color:var(--primary);">3. ความเข้มเลเยอร์ทับดำ (Overlay):</label>
                            <span id="bg-overlay-val" style="font-weight:700; color:var(--secondary); font-size:0.85rem;">${bgOverlay}%</span>
                        </div>
                        <input type="range" id="sec-bg-overlay" min="0" max="80" value="${bgOverlay}" step="1" class="form-control" style="padding:0;" oninput="document.getElementById('bg-overlay-val').innerText = this.value + '%'">
                    </div>

                    <!-- 4. Background Position -->
                    <div class="form-group" style="margin-bottom:14px;">
                        <label style="font-weight:700; font-size:0.82rem; color:var(--primary); display:block; margin-bottom:4px;">4. ตำแหน่งจัดวางภาพ (Background Position):</label>
                        <select id="sec-bg-pos" class="form-control">
                            <option value="center center" ${bgPos === 'center center' ? 'selected' : ''}>Center (ตรงกลาง)</option>
                            <option value="top center" ${bgPos === 'top center' ? 'selected' : ''}>Top (ส่วนบน)</option>
                            <option value="bottom center" ${bgPos === 'bottom center' ? 'selected' : ''}>Bottom (ส่วนล่าง)</option>
                            <option value="left center" ${bgPos === 'left center' ? 'selected' : ''}>Left (ด้านซ้าย)</option>
                            <option value="right center" ${bgPos === 'right center' ? 'selected' : ''}>Right (ด้านขวา)</option>
                        </select>
                    </div>

                    <!-- 5. Image Brightness (70-120%, default 100%) -->
                    <div class="form-group" style="margin-bottom:14px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                            <label style="font-weight:700; font-size:0.82rem; color:var(--primary);">5. ความสว่างภาพ (Image Brightness):</label>
                            <span id="bg-brightness-val" style="font-weight:700; color:var(--secondary); font-size:0.85rem;">${bgBrightness}%</span>
                        </div>
                        <input type="range" id="sec-bg-brightness" min="70" max="120" value="${bgBrightness}" step="1" class="form-control" style="padding:0;" oninput="document.getElementById('bg-brightness-val').innerText = this.value + '%'">
                    </div>

                    <!-- 6. Text Theme -->
                    <div class="form-group" style="margin-bottom:14px;">
                        <label style="font-weight:700; font-size:0.82rem; color:var(--primary); display:block; margin-bottom:4px;">6. ธีมสีตัวหนังสือ (Text Theme):</label>
                        <select id="sec-bg-text-theme" class="form-control">
                            <option value="auto" ${bgTextTheme === 'auto' ? 'selected' : ''}>Auto (ปรับอัตโนมัติตามพื้นหลัง)</option>
                            <option value="light" ${bgTextTheme === 'light' ? 'selected' : ''}>Light (ข้อความสีขาวสำหรับภาพเข้ม)</option>
                            <option value="dark" ${bgTextTheme === 'dark' ? 'selected' : ''}>Dark (ข้อความสีเข้มสำหรับภาพสว่าง)</option>
                        </select>
                    </div>

                    <!-- 7. Background Attachment -->
                    <div class="form-group" style="margin-bottom:14px;">
                        <label style="font-weight:700; font-size:0.82rem; color:var(--primary); display:block; margin-bottom:4px;">7. พฤติกรรมพื้นหลัง (Background Attachment):</label>
                        <select id="sec-bg-attachment" class="form-control">
                            <option value="scroll" ${bgAttachment === 'scroll' ? 'selected' : ''}>เลื่อนตามหน้าเว็บ (Scroll - ปกติ)</option>
                            <option value="fixed" ${bgAttachment === 'fixed' ? 'selected' : ''}>อยู่กับที่ขณะเลื่อนหน้า (Fixed - เฉพาะ Desktop)</option>
                        </select>
                    </div>
                </div>
            </div>
        </details>
    `;
};

class CharoenAdmin {
    constructor() {
        this.db = new window.CharoenOnCupDB();
        this.activeTab = localStorage.getItem('charoen_admin_tab') || 'dashboard';
        this.bulkSelectMode = false;
        this.selectedMediaIds = [];
    }

    async init() {
        try {
            await this.db.init();
        } catch (err) {
            console.error("CharoenAdmin: DB setup failed:", err);
        }

        // Set up Firebase Auth state listener if Firebase is initialized
        if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
            firebase.auth().onAuthStateChanged(user => {
                if (user) {
                    this.renderAdminLayout();
                } else {
                    this.renderLoginScreen();
                }
            });
        } else {
            // Local Mode or Firebase not configured yet
            this.renderLoginScreen("ระบบไม่ได้เชื่อมต่อคลาวด์ Firebase (โหมดออฟไลน์)");
        }
    }

    renderLoginScreen(noticeMsg) {
        const container = document.getElementById('app-main-content');
        if (!container) return;

        // Reset container styling
        container.style.marginTop = '0';
        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';
        container.style.minHeight = '100vh';
        container.style.backgroundColor = 'var(--bg-sec)';
        container.style.padding = '20px';

        container.innerHTML = `
            <div class="login-card" style="background:white; padding:40px; border-radius:var(--radius-lg); box-shadow:var(--shadow-md); width:100%; max-width:400px; border:1px solid var(--border-color); display:flex; flex-direction:column; gap:24px; font-family:'Kanit', sans-serif;">
                <div style="text-align:center;">
                    <div style="width:60px; height:60px; background:var(--primary); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.8rem; margin:0 auto 16px auto;"><i class="fas fa-user-shield"></i></div>
                    <h3 style="font-family:'Kanit', sans-serif; font-size:1.5rem; font-weight:800; color:var(--secondary); margin-bottom:6px;">Charoen Cup CMS</h3>
                    <p style="font-size:0.88rem; color:var(--text-muted);">${noticeMsg || 'ระบบบริหารจัดการหลังบ้าน'}</p>
                </div>

                <div id="login-error-area" style="display:none; background-color:#fee2e2; border:1px solid var(--danger); color:var(--danger); padding:12px; border-radius:var(--radius-sm); font-size:0.85rem; text-align:center;"></div>
                
                <form id="admin-login-form" style="display:flex; flex-direction:column; gap:16px;">
                    <div class="form-group" style="margin:0;">
                        <label for="login-email" style="font-size:0.85rem; font-weight:600; color:var(--text-main); display:block; margin-bottom:6px;">อีเมลแอดมิน <span style="color:var(--danger)">*</span></label>
                        <input type="email" id="login-email" class="form-control" placeholder="admin@example.com" style="width:100%;" required>
                    </div>
                    
                    <div class="form-group" style="margin:0;">
                        <label for="login-password" style="font-size:0.85rem; font-weight:600; color:var(--text-main); display:block; margin-bottom:6px;">รหัสผ่าน <span style="color:var(--danger)">*</span></label>
                        <div style="position:relative; display:flex; align-items:center;">
                            <input type="password" id="login-password" class="form-control" placeholder="••••••••" style="width:100%; padding-right:45px;" required>
                            <button type="button" id="toggle-password-btn" style="position:absolute; right:12px; background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:1rem; display:flex; align-items:center; height:100%;" title="แสดง/ซ่อนรหัสผ่าน">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>

                    <button type="submit" id="login-submit-btn" class="btn btn-primary" style="width:100%; padding:12px; font-weight:600; font-size:0.95rem; margin-top:8px; display:flex; justify-content:center; align-items:center; gap:8px;">
                        <i class="fas fa-sign-in-alt"></i> เข้าสู่ระบบ
                    </button>
                </form>

                <div style="text-align:center; font-size:0.85rem; border-top:1px solid var(--border-color); padding-top:16px; margin-top:8px;">
                    <a href="#" id="forgot-password-link" style="color:var(--primary); font-weight:600; text-decoration:none;">ลืมรหัสผ่านใช่หรือไม่?</a>
                </div>
            </div>
        `;

        const passInput = document.getElementById('login-password');
        const toggleBtn = document.getElementById('toggle-password-btn');
        if (toggleBtn && passInput) {
            toggleBtn.onclick = () => {
                const icon = toggleBtn.querySelector('i');
                if (passInput.type === 'password') {
                    passInput.type = 'text';
                    icon.className = 'fas fa-eye-slash';
                } else {
                    passInput.type = 'password';
                    icon.className = 'fas fa-eye';
                }
            };
        }

        const form = document.getElementById('admin-login-form');
        const errorArea = document.getElementById('login-error-area');
        const submitBtn = document.getElementById('login-submit-btn');

        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                const email = document.getElementById('login-email').value;
                const password = passInput.value;

                if (typeof firebase === 'undefined' || firebase.apps.length === 0) {
                    errorArea.style.display = 'block';
                    errorArea.textContent = 'ไม่พบการเชื่อมต่อระบบ Firebase กรุณาตรวจสอบการตั้งค่าฐานข้อมูลครับ';
                    return;
                }

                submitBtn.disabled = true;
                submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> กำลังตรวจสอบสิทธิ์...`;
                errorArea.style.display = 'none';

                try {
                    await firebase.auth().signInWithEmailAndPassword(email, password);
                } catch (err) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = `<i class="fas fa-sign-in-alt"></i> เข้าสู่ระบบ`;
                    errorArea.style.display = 'block';
                    
                    let thMsg = 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์การเข้าสู่ระบบครับ';
                    if (err.code === 'auth/invalid-email' || err.code === 'auth/user-not-found') {
                        thMsg = 'ไม่พบอีเมลผู้ใช้งานนี้ในระบบแอดมินครับ';
                    } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                        thMsg = 'รหัสผ่านหรือข้อมูลการเข้าสู่ระบบไม่ถูกต้อง กรุณาลองใหม่อีกครั้งครับ';
                    } else if (err.code === 'auth/too-many-requests') {
                        thMsg = 'เข้าสู่ระบบล้มเหลวเกินโควตา บัญชีนี้ถูกระงับชั่วคราว กรุณารอสักครู่แล้วลองอีกครั้งครับ';
                    } else if (err.message) {
                        thMsg = `ไม่สามารถเข้าสู่ระบบได้: ${err.message}`;
                    }
                    errorArea.textContent = thMsg;
                }
            };
        }

        const forgotLink = document.getElementById('forgot-password-link');
        if (forgotLink) {
            forgotLink.onclick = async (e) => {
                e.preventDefault();
                const email = document.getElementById('login-email').value;
                if (!email) {
                    alert('กรุณากรอกอีเมลแอดมินในช่องกรอกข้อมูลก่อนกดปุ่มลืมรหัสผ่านครับ เพื่อที่ระบบจะส่งลิงก์รีเซ็ตไปให้');
                    return;
                }

                if (typeof firebase === 'undefined' || firebase.apps.length === 0) {
                    alert('ไม่พบการเชื่อมต่อระบบ Firebase ครับ');
                    return;
                }

                if (!confirm(`คุณต้องการให้ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมล: ${email} ใช่หรือไม่?`)) {
                    return;
                }

                try {
                    await firebase.auth().sendPasswordResetEmail(email);
                    alert(`ส่งลิงก์กู้คืนรหัสผ่านสำเร็จ! กรุณาตรวจสอบกล่องข้อความและอีเมลขยะที่อีเมล: ${email} ครับ`);
                } catch (err) {
                    let thMsg = 'เกิดข้อผิดพลาดในการส่งอีเมลรีเซ็ตรหัสผ่านครับ';
                    if (err.code === 'auth/invalid-email' || err.code === 'auth/user-not-found') {
                        thMsg = 'ไม่พบอีเมลผู้ใช้งานนี้ในระบบแอดมินครับ';
                    } else if (err.message) {
                        thMsg = `ล้มเหลว: ${err.message}`;
                    }
                    alert(thMsg);
                }
            };
        }
    }

    renderAdminLayout() {
        if (this.db && typeof this.db.initProductSliderIfNeeded === 'function') {
            this.db.initProductSliderIfNeeded().catch(err => console.warn(err));
        }

        const container = document.getElementById('app-main-content');
        if (!container) return;

        // Reset layout styles
        container.style.marginTop = '0';
        container.style.display = 'grid';
        container.style.gridTemplateColumns = '260px 1fr';
        container.style.height = '100vh';
        container.style.background = 'none';

        container.innerHTML = `
            <!-- Sidebar Navigation -->
            <aside class="admin-sidebar">
                <div class="admin-logo-box">
                    <h3 style="font-size:1.15rem; font-weight:800; color:white; display:flex; align-items:center; gap:8px;">
                        <i class="fas fa-print" style="color:var(--primary)"></i> Charoen Cup CMS
                    </h3>
                    <span style="font-size:0.72rem; color:rgba(255,255,255,0.4); display:block; margin-top:4px;">Local & Firebase Admin Panel</span>
                </div>
                
                <nav style="flex-grow:1; overflow-y:auto;">
                    <ul class="admin-menu-list">
                        <li class="admin-menu-item ${this.activeTab === 'dashboard' ? 'active' : ''}" data-tab="dashboard">
                            <a><i class="fas fa-chart-pie"></i> แผงภาพรวมระบบ</a>
                        </li>
                        <li class="admin-menu-item ${this.activeTab === 'products' ? 'active' : ''}" data-tab="products">
                            <a><i class="fas fa-box-open"></i> จัดการรายการสินค้า</a>
                        </li>
                        <li class="admin-menu-item ${this.activeTab === 'categories' ? 'active' : ''}" data-tab="categories">
                            <a><i class="fas fa-tags"></i> จัดการหมวดหมู่สินค้า</a>
                        </li>
                        <li class="admin-menu-item ${this.activeTab === 'portfolio' ? 'active' : ''}" data-tab="portfolio">
                            <a><i class="fas fa-images"></i> จัดการผลงานสกรีน</a>
                        </li>
                        <li class="admin-menu-item ${this.activeTab === 'slider' ? 'active' : ''}" data-tab="slider">
                            <a><i class="fas fa-sliders-h"></i> จัดการภาพสไลด์หน้าแรก</a>
                        </li>
                        <li class="admin-menu-item ${this.activeTab === 'product_slider' ? 'active' : ''}" data-tab="product_slider">
                            <a><i class="fas fa-images"></i> จัดการสไลด์หน้าสินค้า</a>
                        </li>
                        <li class="admin-menu-item ${this.activeTab === 'home_videos' ? 'active' : ''}" data-tab="home_videos" style="display: none;">
                            <a><i class="fas fa-video"></i> จัดการวิดีโอหน้าแรก</a>
                        </li>
                        <li class="admin-menu-item ${this.activeTab === 'media_lib' ? 'active' : ''}" data-tab="media_lib">
                            <a><i class="fas fa-folder-open"></i> คลังสื่อ WebP & วิดีโอ</a>
                        </li>
                        <li class="admin-menu-item ${this.activeTab === 'homepage' ? 'active' : ''}" data-tab="homepage">
                            <a><i class="fas fa-home"></i> จัดการโครงสร้างหน้าแรก</a>
                        </li>
                        <li class="admin-menu-item ${this.activeTab === 'news' ? 'active' : ''}" data-tab="news">
                            <a><i class="far fa-newspaper"></i> กิจกรรมและการสนับสนุน</a>
                        </li>
                        <li class="admin-menu-item ${this.activeTab === 'articles' ? 'active' : ''}" data-tab="articles" style="display: none;">
                            <a><i class="fas fa-graduation-cap"></i> จัดการบทความสาระ</a>
                        </li>
                        <li class="admin-menu-item ${this.activeTab === 'clients' ? 'active' : ''}" data-tab="clients" style="display: none;">
                            <a><i class="fas fa-handshake"></i> จัดการโลโก้พันธมิตร</a>
                        </li>
                        <li class="admin-menu-item ${this.activeTab === 'faq' ? 'active' : ''}" data-tab="faq">
                            <a><i class="fas fa-question-circle"></i> จัดการคำถามพบบ่อย</a>
                        </li>
                        <li class="admin-menu-item ${this.activeTab === 'quotes' ? 'active' : ''}" data-tab="quotes">
                            <a><i class="fas fa-file-invoice-dollar"></i> ใบเสนอราคาลูกค้า</a>
                        </li>
                        <li class="admin-menu-item ${this.activeTab === 'settings' ? 'active' : ''}" data-tab="settings">
                            <a><i class="fas fa-cogs"></i> ตั้งค่าข้อมูลร้าน & คลาวด์</a>
                        </li>
                    </ul>
                </nav>
            </aside>
            
            <!-- Main Content Area -->
            <main class="admin-main-content">
                <header class="admin-topbar">
                    <h2 id="admin-view-title" style="font-size:1.3rem; font-weight:800; color:var(--secondary);">กำลังโหลด...</h2>
                    <div style="display:flex; align-items:center; gap:16px; font-size:0.9rem;">
                        <span id="cloud-status-badge"></span>
                        <a href="index.html" target="_blank" class="btn btn-outline" style="padding: 6px 12px; font-size:0.8rem;"><i class="fas fa-external-link-alt"></i> เปิดดูหน้าเว็บหลัก</a>
                        <button id="admin-logout-btn" class="btn btn-outline" style="padding: 6px 12px; font-size:0.8rem; border-color:var(--danger); color:var(--danger); cursor:pointer; background:none; border-radius:var(--radius-sm); font-weight:600; display:flex; align-items:center; gap:6px;"><i class="fas fa-sign-out-alt"></i> ออกจากระบบ</button>
                    </div>
                </header>
                
                <div class="admin-view-area" id="admin-view-main-area">
                    <!-- Loaded dynamically -->
                </div>
            </main>
        `;

        // Bind sidebar menu tabs click events
        document.querySelectorAll('.admin-menu-item').forEach(item => {
            item.onclick = () => {
                document.querySelectorAll('.admin-menu-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                this.activeTab = item.dataset.tab;
                localStorage.setItem('charoen_admin_tab', this.activeTab);
                
                // Reset bulk selections when switching tabs
                this.bulkSelectMode = false;
                this.selectedMediaIds = [];
                
                this.renderActiveView();
            };
        });

        this.renderActiveView();

        // Bind logout button click handler
        const logoutBtn = document.getElementById('admin-logout-btn');
        if (logoutBtn) {
            logoutBtn.onclick = async () => {
                if (confirm('คุณต้องการออกจากระบบหรือไม่?')) {
                    try {
                        if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
                            await firebase.auth().signOut();
                        }
                    } catch (err) {
                        alert('เกิดข้อผิดพลาดในการออกจากระบบ: ' + err.message);
                    }
                }
            };
        }
    }

    async renderActiveView() {
        const titleEl = document.getElementById('admin-view-title');
        const badgeEl = document.getElementById('cloud-status-badge');
        const area = document.getElementById('admin-view-main-area');
        if (!area || !titleEl) return;

        if (badgeEl) {
            if (this.db.isCloudEnabled) {
                if (navigator.onLine) {
                    badgeEl.innerHTML = `<span class="badge badge-success" style="background:#10b981; color:white;"><i class="fas fa-cloud"></i> Cloud Connected Mode</span>`;
                } else {
                    badgeEl.innerHTML = `<span class="badge" style="background:#f59e0b; color:white;"><i class="fas fa-wifi"></i> Offline Mode</span>`;
                }
            } else {
                badgeEl.innerHTML = `<span class="badge" style="background:#e2e8f0; color:#475569;"><i class="fas fa-cloud-slash"></i> Local Only Mode</span>`;
            }
        }

        area.innerHTML = `
            <div style="display:flex; justify-content:center; align-items:center; min-height:300px; width:100%;">
                <div style="width: 32px; height: 32px; border: 3px solid var(--primary); border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            </div>
        `;

        switch (this.activeTab) {
            case 'dashboard':
                titleEl.textContent = 'แผงควบคุมหลัก (Dashboard)';
                await this.loadDashboardView(area);
                break;
            case 'products':
                titleEl.textContent = 'จัดการสินค้าและบริการ (Products)';
                await this.loadProductsView(area);
                break;
            case 'categories':
                titleEl.textContent = 'จัดการหมวดหมู่สินค้า (Categories)';
                await this.loadCategoriesView(area);
                break;
            case 'portfolio':
                titleEl.textContent = 'จัดการแกลเลอรีผลงานสกรีน (Portfolio)';
                await this.loadPortfolioView(area);
                break;
            case 'slider':
                titleEl.textContent = 'จัดการภาพสไลด์หน้าแรก (Hero Slider)';
                await this.loadSliderView(area);
                break;
            case 'product_slider':
                titleEl.textContent = 'จัดการภาพสไลด์หน้าสินค้า (Product Slider)';
                await this.loadProductSliderView(area);
                break;
            case 'home_videos':
                titleEl.textContent = 'จัดการวิดีโอหน้าแรก (Home Videos)';
                await this.loadHomeVideosView(area);
                break;
            case 'media_lib':
                titleEl.textContent = 'คลังสื่อ WebP & วิดีโอ (Media Library)';
                await this.loadMediaLibView(area);
                break;
            case 'quotes':
                titleEl.textContent = 'ตารางตรวจสอบใบเสนอราคา (Quotes)';
                await this.loadQuotesView(area);
                break;
            case 'homepage':
                titleEl.textContent = 'จัดการโครงสร้างหน้าแรก (Homepage Layout)';
                await this.loadHomepageView(area);
                break;
            case 'news':
                titleEl.textContent = 'กิจกรรมและการสนับสนุน (Events & Support)';
                await this.loadNewsView(area);
                break;
            case 'articles':
                titleEl.textContent = 'จัดการบทความสาระความรู้ (Articles Manager)';
                await this.loadArticlesView(area);
                break;
            case 'clients':
                titleEl.textContent = 'จัดการโลโก้พันธมิตร (Partners Logos)';
                await this.loadClientsView(area);
                break;
            case 'faq':
                titleEl.textContent = 'จัดการคำถามที่พบบ่อย (FAQ Manager)';
                await this.loadFaqView(area);
                break;
            case 'settings':
                titleEl.textContent = 'ตั้งค่าข้อมูลร้าน & ระบบคลาวด์ (Settings)';
                await this.loadSettingsView(area);
                break;
        }
    }

    getNormalizedQuoteStatus(status) {
        return status === 'contacted' ? 'contacted' : 'pending';
    }

    resolveQuoteId(q) {
        if (!q || typeof q !== 'object') return null;
        if (q.id !== undefined && q.id !== null && String(q.id).trim() !== '') return q.id;
        if (q.docId !== undefined && q.docId !== null && String(q.docId).trim() !== '') return q.docId;
        if (q._id !== undefined && q._id !== null && String(q._id).trim() !== '') return q._id;
        return null;
    }

    formatQuoteQuantity(q) {
        const rawQuantity = q.quantity ?? q.qty ?? q.quote_qty ?? null;
        if (rawQuantity === null || rawQuantity === undefined || rawQuantity === '') {
            return '-';
        }
        const num = Number(rawQuantity);
        if (Number.isFinite(num) && String(rawQuantity).trim() !== '') {
            return `${num.toLocaleString('th-TH')} ใบ`;
        }
        return String(rawQuantity);
    }

    formatQuoteDate(q, includeTime = true) {
        const rawDate = q.created_at || q.date || null;
        if (!rawDate) return '-';
        const parsedDate = new Date(rawDate);
        if (!isNaN(parsedDate.getTime())) {
            return includeTime ? parsedDate.toLocaleString('th-TH') : parsedDate.toLocaleDateString('th-TH');
        }
        return String(rawDate);
    }

    getQuoteLogoSrc(q) {
        return q.logo_img || q.image_src || null;
    }

    getQuoteCategoryName(q, categories = []) {
        if (!q || !q.product_type) return 'อื่นๆ';
        const catObj = categories.find(c => c.id === q.product_type || c.name_th === q.product_type || c.name_en === q.product_type);
        if (catObj && catObj.name_th) return catObj.name_th;
        return String(q.product_type);
    }

    async loadDashboardView(container) {
        const products = await this.db.getAll('products');
        const portfolio = await this.db.getAll('portfolio');
        const quotes = await this.db.getAll('quotes');
        const getQuoteTime = (q) => {
            const rawDate = q.created_at || q.date;
            if (!rawDate) return 0;
            const t = new Date(rawDate).getTime();
            return isNaN(t) ? 0 : t;
        };
        const sortedQuotes = [...quotes].sort((a, b) => getQuoteTime(b) - getQuoteTime(a));
        const pendingCount = quotes.filter(q => this.getNormalizedQuoteStatus(q.status) === 'pending').length;

        container.innerHTML = `
            <div class="grid-3" style="margin-bottom:30px;">
                <div class="admin-card text-center">
                    <div style="font-size:2.2rem; font-weight:800; color:var(--primary);">${products.length}</div>
                    <div style="font-size:0.85rem; color:var(--text-muted); font-weight:700; margin-top:4px;">จำนวนสินค้าทั้งหมด</div>
                </div>
                <div class="admin-card text-center">
                    <div style="font-size:2.2rem; font-weight:800; color:var(--success);">${portfolio.length}</div>
                    <div style="font-size:0.85rem; color:var(--text-muted); font-weight:700; margin-top:4px;">จำนวนภาพผลงานสกรีน</div>
                </div>
                <div class="admin-card text-center">
                    <div style="font-size:2.2rem; font-weight:800; color:var(--secondary);">${quotes.length} (${pendingCount} ใหม่)</div>
                    <div style="font-size:0.85rem; color:var(--text-muted); font-weight:700; margin-top:4px;">ใบเสนอราคาค้างตรวจ</div>
                </div>
            </div>
            
            <div class="admin-card">
                <h3 style="font-size:1.1rem; font-weight:700; color:var(--secondary); margin-bottom:16px; border-bottom:1.5px solid var(--border-color); padding-bottom:8px;"><i class="fas fa-file-invoice-dollar"></i> ใบเสนอราคาล่าสุด (Latest Requests)</h3>
                ${sortedQuotes.length === 0 ? `
                    <p style="color:var(--text-muted); font-size:0.9rem; text-align:center; padding:30px 0;">ยังไม่มีใบเสนอราคาส่งมาจากหน้าเว็บหลัก</p>
                ` : `
                    <div style="overflow-x:auto;">
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th>ชื่อร้าน/ลูกค้า</th>
                                    <th>เบอร์โทร</th>
                                    <th>Line ID</th>
                                    <th>จำนวน</th>
                                    <th>วันที่ส่ง</th>
                                    <th>สถานะ</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${sortedQuotes.slice(0, 5).map(q => {
                                    const quantityDisplay = this.formatQuoteQuantity(q);
                                    const dateDisplay = this.formatQuoteDate(q, false);
                                    const nameDisplay = q.name || '-';
                                    const phoneDisplay = q.phone || '-';
                                    const lineDisplay = q.line || '-';
                                    const status = this.getNormalizedQuoteStatus(q.status);

                                    return `
                                        <tr>
                                            <td><strong>${nameDisplay}</strong></td>
                                            <td>${phoneDisplay}</td>
                                            <td><span class="badge" style="background:#e6f9eb; color:#10b981;">${lineDisplay}</span></td>
                                            <td>${quantityDisplay}</td>
                                            <td>${dateDisplay}</td>
                                            <td>
                                                <span class="badge ${status === 'pending' ? 'badge-danger' : 'badge-success'}">
                                                    ${status === 'pending' ? 'รอดำเนินการ' : 'ติดต่อแล้ว'}
                                                </span>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        `;
    }

    async loadProductsView(container) {
        const products = await this.db.getAll('products');
        const categories = await this.db.getAll('categories');
        const sortedCats = [...categories].sort((a, b) => (a.order || 99) - (b.order || 99));

        // Restore active filter from localStorage (default to 'all')
        const activeProdCat = localStorage.getItem('charoen_prod_cat_filter') || 'all';

        // Count items per category
        const countAll = products.length;
        const catCounts = {};
        for (const cat of sortedCats) {
            catCounts[cat.id] = products.filter(p => p.category === cat.id).length;
        }
        const uncategorizedCount = products.filter(p => !p.category || !sortedCats.some(c => c.id === p.category)).length;

        // Apply filter
        let filteredProducts;
        if (activeProdCat === 'all') {
            filteredProducts = products;
        } else if (activeProdCat === '_uncategorized') {
            filteredProducts = products.filter(p => !p.category || !sortedCats.some(c => c.id === p.category));
        } else {
            filteredProducts = products.filter(p => p.category === activeProdCat);
        }

        container.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
                <h3 style="font-size:1.15rem; font-weight:700; color:var(--secondary);">คลังรายการสินค้าสกรีน</h3>
                <button class="btn btn-primary" id="add-product-btn" style="padding:8px 16px; font-size:0.85rem;"><i class="fas fa-plus"></i> เพิ่มสินค้าชิ้นใหม่</button>
            </div>

            <!-- Category Filter Tabs (synced with front-end categories) -->
            <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:18px; padding:12px 16px; background:var(--bg-sec); border-radius:var(--radius-md); border:1px solid var(--border-color); align-items:center;">
                <button class="btn prod-cat-filter-btn ${activeProdCat === 'all' ? 'btn-primary' : 'btn-outline'}" data-cat="all" style="padding:6px 14px; font-size:0.78rem; border-radius:20px;">
                    ทั้งหมด (${countAll})
                </button>
                ${sortedCats.map(c => `
                    <button class="btn prod-cat-filter-btn ${activeProdCat === c.id ? 'btn-primary' : 'btn-outline'}" data-cat="${c.id}" style="padding:6px 14px; font-size:0.78rem; border-radius:20px;">
                        ${c.name_th} (${catCounts[c.id] || 0})
                    </button>
                `).join('')}
                ${uncategorizedCount > 0 ? `
                    <button class="btn prod-cat-filter-btn ${activeProdCat === '_uncategorized' ? 'btn-primary' : 'btn-outline'}" data-cat="_uncategorized" style="padding:6px 14px; font-size:0.78rem; border-radius:20px; border-color:var(--danger); color:${activeProdCat === '_uncategorized' ? '#fff' : 'var(--danger)'}; ${activeProdCat === '_uncategorized' ? 'background:var(--danger);' : ''}">
                        <i class="fas fa-exclamation-triangle" style="margin-right:4px;"></i>ยังไม่มีหมวด (${uncategorizedCount})
                    </button>
                ` : ''}

                <!-- Manage Categories Button -->
                <button class="btn btn-outline" id="prod-manage-cats-btn" style="padding:6px 14px; font-size:0.78rem; border-radius:20px; margin-left:auto; border-color:var(--secondary); color:var(--secondary);">
                    <i class="fas fa-cog" style="margin-right:4px;"></i>จัดการหมวดหมู่
                </button>
            </div>
            
            <div class="admin-card">
                ${filteredProducts.length === 0 ? `
                    <p style="color:var(--text-muted); font-size:0.9rem; text-align:center; padding:50px 0;">
                        ${activeProdCat === 'all' 
                            ? 'ยังไม่มีข้อมูลสินค้าในเครื่อง กรุณากด "เพิ่มสินค้าชิ้นใหม่" ด้านบนเพื่อเริ่มระบบ' 
                            : 'ไม่มีสินค้าในหมวดหมู่นี้'
                        }
                    </p>
                ` : `
                    <div style="overflow-x:auto;">
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th>รูปภาพ</th>
                                    <th>ชื่อสินค้า (TH)</th>
                                    <th>หมวดหมู่</th>
                                    <th>ความจุ / สเปก</th>
                                    <th>ราคาเริ่มต้น</th>
                                    <th>การแสดงผล</th>
                                    <th style="text-align:right;">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${filteredProducts.map(p => {
                                    const catObj = categories.find(c => c.id === p.category);
                                    const catName = catObj ? catObj.name_th : '<span style="color:var(--danger); font-weight:700;">ยังไม่มีหมวด</span>';
                                    
                                    // Spec visibility tags
                                    const showMat = p.show_material !== false ? 'วัสดุ' : '';
                                    const showVol = p.show_volume !== false ? 'ปริมาตร' : '';
                                    const showDia = p.show_diameter !== false ? 'ปากแก้ว' : '';
                                    const showMin = p.show_min_qty !== false ? 'ขั้นต่ำ' : '';
                                    const showPrice = p.show_price !== false ? 'ราคา' : '';
                                    const visibleSpecs = [showMat, showVol, showDia, showMin, showPrice].filter(Boolean).join(', ');

                                    return `
                                        <tr>
                                            <td style="width:60px;">
                                                <div style="width:44px; height:44px; border-radius:var(--radius-sm); border:1px solid var(--border-color); background:var(--bg-sec); display:flex; align-items:center; justify-content:center; overflow:hidden;">
                                                    ${p.image_src ? `<img src="${p.image_src}" style="width:100%; height:100%; object-fit:contain;">` : `<i class="fas fa-box" style="color:var(--text-muted);"></i>`}
                                                </div>
                                            </td>
                                            <td><strong>${p.name_th}</strong><br><span style="font-size:0.8rem; color:var(--text-muted);">${p.name_en || ''}</span></td>
                                            <td><span class="badge" style="background:${catObj ? 'var(--secondary-light)' : '#fee2e2'}; color:${catObj ? 'var(--secondary)' : 'var(--danger)'}; font-weight:700;">${catName}</span></td>
                                            <td>ขนาด ${p.spec_volume_th || p.volume || '-'} | ปาก ${p.spec_diameter || '-'} มม.</td>
                                            <td>${p.price ? `฿${p.price}` : 'ไม่ระบุ'}</td>
                                            <td><span style="font-size:0.8rem; color:var(--primary); font-weight:600;">[โชว์: ${visibleSpecs || 'ไม่มี'}]</span></td>
                                            <td style="text-align:right;">
                                                <button class="btn btn-outline edit-prod-btn" data-id="${p.id}" style="padding:6px 12px; font-size:0.75rem; border-color:var(--secondary); color:var(--secondary); margin-right:8px;"><i class="fas fa-edit"></i> แก้ไข</button>
                                                <button class="btn btn-outline del-prod-btn" data-id="${p.id}" style="padding:6px 12px; font-size:0.75rem; border-color:var(--danger); color:var(--danger);"><i class="fas fa-trash-alt"></i> ลบ</button>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        `;

        // Bind category filter tab clicks
        document.querySelectorAll('.prod-cat-filter-btn').forEach(btn => {
            btn.onclick = () => {
                localStorage.setItem('charoen_prod_cat_filter', btn.dataset.cat);
                this.renderActiveView();
            };
        });

        // Manage Categories popup
        document.getElementById('prod-manage-cats-btn').onclick = () => this.openCategoryManagerPopup();

        document.getElementById('add-product-btn').onclick = () => this.openProductEditDialog(null);
        document.querySelectorAll('.edit-prod-btn').forEach(btn => {
            btn.onclick = () => this.openProductEditDialog(btn.dataset.id);
        });
        document.querySelectorAll('.del-prod-btn').forEach(btn => {
            btn.onclick = async () => {
                if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบสินค้าชิ้นนี้อย่างถาวร?')) {
                    await this.db.delete('products', btn.dataset.id);
                    this.renderActiveView();
                }
            };
        });
    }

    // Product Categories View
    async loadCategoriesView(container) {
        const categories = await this.db.getAll('categories');
        const sortedCats = [...categories].sort((a, b) => a.order - b.order);

        container.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h3 style="font-size:1.15rem; font-weight:700; color:var(--secondary);">หมวดหมู่แก้ว/บรรจุภัณฑ์</h3>
                <button class="btn btn-primary" id="add-category-btn" style="padding:8px 16px; font-size:0.85rem;"><i class="fas fa-plus"></i> เพิ่มหมวดหมู่ใหม่</button>
            </div>
            
            <div class="admin-card">
                ${sortedCats.length === 0 ? `
                    <p style="color:var(--text-muted); font-size:0.9rem; text-align:center; padding:45px 0;">ยังไม่มีหมวดหมู่สินค้าในระบบ</p>
                ` : `
                    <div style="overflow-x:auto;">
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th style="width:70px;">รูปภาพ</th>
                                    <th>รหัส ID</th>
                                    <th>ชื่อหมวดหมู่ (TH)</th>
                                    <th>ชื่อหมวดหมู่ (EN)</th>
                                    <th>ลำดับการจัดเรียง</th>
                                    <th style="text-align:right;">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${sortedCats.map(c => {
                                    const imgUrl = c.bg_src || c.image_src || c.image || c.img;
                                    return `
                                        <tr>
                                            <td>
                                                <div style="width:50px; height:36px; border-radius:4px; overflow:hidden; background:#0f172a; display:flex; align-items:center; justify-content:center;">
                                                    ${imgUrl ? `
                                                        <img src="${imgUrl}" style="width:100%; height:100%; object-fit:cover;" onerror="this.onerror=null; this.parentElement.innerHTML='<i class=\\'fas fa-image\\' style=\\'color:#64748b; font-size:0.85rem;\\'></i>';">
                                                    ` : `
                                                        <i class="fas fa-image" style="color:#64748b; font-size:0.85rem;"></i>
                                                    `}
                                                </div>
                                            </td>
                                            <td><code>${c.id}</code></td>
                                            <td><strong>${c.name_th}</strong></td>
                                            <td>${c.name_en || ''}</td>
                                            <td>ลำดับที่ ${c.order || 1}</td>
                                            <td style="text-align:right;">
                                                <button class="btn btn-outline edit-cat-btn" data-id="${c.id}" style="padding:6px 12px; font-size:0.75rem; border-color:var(--secondary); color:var(--secondary); margin-right:8px;"><i class="fas fa-edit"></i> แก้ไข</button>
                                                <button class="btn btn-outline del-cat-btn" data-id="${c.id}" style="padding:6px 12px; font-size:0.75rem; border-color:var(--danger); color:var(--danger);"><i class="fas fa-trash-alt"></i> ลบ</button>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        `;

        document.getElementById('add-category-btn').onclick = () => this.openCategoryEditDialog(null);
        document.querySelectorAll('.edit-cat-btn').forEach(btn => {
            btn.onclick = () => this.openCategoryEditDialog(btn.dataset.id);
        });
        document.querySelectorAll('.del-cat-btn').forEach(btn => {
            btn.onclick = async () => {
                if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่สินค้าชิ้นนี้อย่างถาวร? (สินค้าที่อยู่ในหมวดหมู่นี้จะย้ายไปอยู่หมวดหมู่อื่นๆ)')) {
                    await this.db.delete('categories', btn.dataset.id);
                    this.renderActiveView();
                }
            };
        });
    }

    // Portfolio View
    async loadPortfolioView(container) {
        const portfolio = await this.db.getAll('portfolio');
        const categories = await this.db.getAll('categories');
        const sortedCats = [...categories].sort((a, b) => (a.order || 99) - (b.order || 99));

        // Restore active filter from localStorage (default to 'all')
        const activePortCat = localStorage.getItem('charoen_port_cat_filter') || 'all';

        // Count items per category
        const countAll = portfolio.length;
        const catCounts = {};
        for (const cat of sortedCats) {
            catCounts[cat.id] = portfolio.filter(p => p.category === cat.id).length;
        }
        const uncategorizedCount = portfolio.filter(p => !p.category || !sortedCats.some(c => c.id === p.category)).length;

        // Apply filter
        let filteredPortfolio;
        if (activePortCat === 'all') {
            filteredPortfolio = portfolio;
        } else if (activePortCat === '_uncategorized') {
            filteredPortfolio = portfolio.filter(p => !p.category || !sortedCats.some(c => c.id === p.category));
        } else {
            filteredPortfolio = portfolio.filter(p => p.category === activePortCat);
        }

        // Sort by order ascending
        filteredPortfolio.sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

        container.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
                <h3 style="font-size:1.15rem; font-weight:700; color:var(--secondary);">ภาพผลงานแกลเลอรีสกรีนแก้ว</h3>
                <div style="display:flex; gap:8px;">
                    <button class="btn btn-outline" id="edit-portfolio-hero-btn" style="padding:8px 14px; font-size:0.85rem; border-color:var(--primary); color:var(--primary);"><i class="fas fa-image"></i> ตั้งค่า Hero พื้นหลังหัวข้อ</button>
                    <button class="btn btn-primary" id="add-portfolio-btn" style="padding:8px 16px; font-size:0.85rem;"><i class="fas fa-plus"></i> เพิ่มภาพผลงานใหม่</button>
                </div>
            </div>

            <!-- Category Filter Tabs (synced with front-end categories) -->
            <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:18px; padding:12px 16px; background:var(--bg-sec); border-radius:var(--radius-md); border:1px solid var(--border-color); align-items:center;">
                <button class="btn port-cat-filter-btn ${activePortCat === 'all' ? 'btn-primary' : 'btn-outline'}" data-cat="all" style="padding:6px 14px; font-size:0.78rem; border-radius:20px;">
                    ทั้งหมด (${countAll})
                </button>
                ${sortedCats.map(c => `
                    <button class="btn port-cat-filter-btn ${activePortCat === c.id ? 'btn-primary' : 'btn-outline'}" data-cat="${c.id}" style="padding:6px 14px; font-size:0.78rem; border-radius:20px;">
                        ${c.name_th} (${catCounts[c.id] || 0})
                    </button>
                `).join('')}
                ${uncategorizedCount > 0 ? `
                    <button class="btn port-cat-filter-btn ${activePortCat === '_uncategorized' ? 'btn-primary' : 'btn-outline'}" data-cat="_uncategorized" style="padding:6px 14px; font-size:0.78rem; border-radius:20px; border-color:var(--danger); color:${activePortCat === '_uncategorized' ? '#fff' : 'var(--danger)'}; ${activePortCat === '_uncategorized' ? 'background:var(--danger);' : ''}">
                        <i class="fas fa-exclamation-triangle" style="margin-right:4px;"></i>ยังไม่มีหมวด (${uncategorizedCount})
                    </button>
                ` : ''}

                <!-- Manage Categories Button -->
                <button class="btn btn-outline" id="port-manage-cats-btn" style="padding:6px 14px; font-size:0.78rem; border-radius:20px; margin-left:auto; border-color:var(--secondary); color:var(--secondary);">
                    <i class="fas fa-cog" style="margin-right:4px;"></i>จัดการหมวดหมู่
                </button>
            </div>
            
            <div class="admin-card">
                ${filteredPortfolio.length === 0 ? `
                    <p style="color:var(--text-muted); font-size:0.9rem; text-align:center; padding:50px 0;">
                        ${activePortCat === 'all' 
                            ? 'ยังไม่มีข้อมูลผลงานสกรีนตัวอย่างในเครื่อง กรุณากด "เพิ่มภาพผลงานใหม่" ด้านบน' 
                            : 'ไม่มีภาพผลงานในหมวดหมู่นี้'
                        }
                    </p>
                ` : `
                    <div style="overflow-x:auto;">
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th style="width:70px; text-align:center;">ลำดับ</th>
                                    <th>ภาพผลงาน</th>
                                    <th>ชื่องานสกรีน (TH)</th>
                                    <th>หมวดหมู่สินค้า</th>
                                    <th>ร้านค้าลูกค้า</th>
                                    <th style="text-align:center;">แสดงผล</th>
                                    <th style="text-align:center;">หน้าแรกแนะนำ</th>
                                    <th style="text-align:right;">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${filteredPortfolio.map(item => {
                                    const catObj = categories.find(c => c.id === item.category);
                                    const catName = catObj ? catObj.name_th : '<span style="color:var(--danger); font-weight:700;">ยังไม่มีหมวด</span>';
                                    const isVisible = item.visible !== false && item.visible !== 'false';
                                    const isFeatured = item.featured === true || item.featured === 'true';
                                    return `
                                        <tr>
                                            <td style="text-align:center;"><strong>${item.order || 0}</strong></td>
                                            <td style="width:60px;">
                                                <div style="width:44px; height:44px; border-radius:var(--radius-sm); border:1px solid var(--border-color); background:var(--bg-sec); display:flex; align-items:center; justify-content:center; overflow:hidden;">
                                                    ${this.getPortfolioCoverImage(item) !== 'coffee_bg.webp' ? `<img src="${this.getPortfolioCoverImage(item)}" style="width:100%; height:100%; object-fit:cover;">` : `<i class="fas fa-image" style="color:var(--text-muted);"></i>`}
                                                </div>
                                            </td>
                                            <td><strong>${item.title_th}</strong></td>
                                            <td><span class="badge" style="background:${catObj ? 'var(--secondary-light)' : '#fee2e2'}; color:${catObj ? 'var(--secondary)' : 'var(--danger)'}; font-weight:700;">${catName}</span></td>
                                            <td>${item.client_name || '-'}</td>
                                            <td style="text-align:center;">
                                                <span class="badge ${isVisible ? 'badge-success' : 'badge-danger'}" style="font-weight:700;">
                                                    ${isVisible ? '<i class="fas fa-eye"></i> แสดงผล' : '<i class="fas fa-eye-slash"></i> ซ่อน'}
                                                </span>
                                            </td>
                                            <td style="text-align:center;">
                                                <span class="badge" style="background:${isFeatured ? 'rgba(255,107,0,0.1)' : 'var(--bg-sec)'}; color:${isFeatured ? 'var(--secondary)' : 'var(--text-muted)'}; border:1px solid ${isFeatured ? 'var(--secondary)' : 'var(--border-color)'}; font-weight:700;">
                                                    ${isFeatured ? '<i class="fas fa-star"></i> แนะนำ' : 'ปกติ'}
                                                </span>
                                            </td>
                                            <td style="text-align:right;">
                                                <button class="btn btn-outline edit-port-btn" data-id="${item.id}" style="padding:6px 12px; font-size:0.75rem; border-color:var(--secondary); color:var(--secondary); margin-right:8px;"><i class="fas fa-edit"></i> แก้ไข</button>
                                                <button class="btn btn-outline del-port-btn" data-id="${item.id}" style="padding:6px 12px; font-size:0.75rem; border-color:var(--danger); color:var(--danger);"><i class="fas fa-trash-alt"></i> ลบ</button>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        `;

        // Bind category filter tab clicks
        document.querySelectorAll('.port-cat-filter-btn').forEach(btn => {
            btn.onclick = () => {
                localStorage.setItem('charoen_port_cat_filter', btn.dataset.cat);
                this.renderActiveView();
            };
        });

        // Manage Categories popup
        document.getElementById('port-manage-cats-btn').onclick = () => this.openCategoryManagerPopup();

        const editHeroBtn = document.getElementById('edit-portfolio-hero-btn');
        if (editHeroBtn) editHeroBtn.onclick = () => this.openPortfolioHeroModal();

        document.getElementById('add-portfolio-btn').onclick = () => this.openPortfolioEditDialog(null);
        document.querySelectorAll('.edit-port-btn').forEach(btn => {
            btn.onclick = () => this.openPortfolioEditDialog(btn.dataset.id);
        });
        document.querySelectorAll('.del-port-btn').forEach(btn => {
            btn.onclick = async () => {
                if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรูปภาพผลงานสกรีนชิ้นนี้อย่างถาวร?')) {
                    await this.db.delete('portfolio', btn.dataset.id);
                    this.renderActiveView();
                }
            };
        });
    }

    // Dedicated Portfolio Hero Background Manager Dialog
    async openPortfolioHeroModal() {
        const adminApp = this;

        if (!window.toggleBgStyleControls) {
            window.toggleBgStyleControls = (val) => {
                const box = document.getElementById('bg-img-controls-box');
                if (box) {
                    box.style.display = (val === 'image' || val === 'image_line_art') ? 'block' : 'none';
                }
            };
        }
        if (!window.selectSecBgMedia) {
            window.selectSecBgMedia = () => {
                adminApp.openMediaSelectorDialog((selectedBase64) => {
                    window.currentActiveSecBgImg = selectedBase64;
                    const prev = document.getElementById('sec-bg-img-preview');
                    const empty = document.getElementById('sec-bg-img-empty');
                    const rmBtn = document.getElementById('remove-sec-bg-btn');
                    if (prev) { prev.src = selectedBase64; prev.style.display = 'inline-block'; }
                    if (empty) empty.style.display = 'none';
                    if (rmBtn) rmBtn.style.display = 'inline-flex';
                });
            };
        }
        if (!window.uploadSecBgFile) {
            window.uploadSecBgFile = async (inputEl) => {
                if (inputEl.files && inputEl.files[0]) {
                    const webpData = await adminApp.convertImageToWebP(inputEl.files[0]);
                    window.currentActiveSecBgImg = webpData;
                    const prev = document.getElementById('sec-bg-img-preview');
                    const empty = document.getElementById('sec-bg-img-empty');
                    const rmBtn = document.getElementById('remove-sec-bg-btn');
                    if (prev) { prev.src = webpData; prev.style.display = 'inline-block'; }
                    if (empty) empty.style.display = 'none';
                    if (rmBtn) rmBtn.style.display = 'inline-flex';
                }
            };
        }
        if (!window.removeSecBgImg) {
            window.removeSecBgImg = () => {
                window.currentActiveSecBgImg = '';
                const prev = document.getElementById('sec-bg-img-preview');
                const empty = document.getElementById('sec-bg-img-empty');
                const rmBtn = document.getElementById('remove-sec-bg-btn');
                const fileInput = document.getElementById('sec-bg-file');
                if (prev) { prev.src = ''; prev.style.display = 'none'; }
                if (empty) empty.style.display = 'block';
                if (rmBtn) rmBtn.style.display = 'none';
                if (fileInput) fileInput.value = '';
            };
        }

        const titleThObj = await adminApp.db.get('settings', 'portfolio_hero_title_th');
        const titleEnObj = await adminApp.db.get('settings', 'portfolio_hero_title_en');
        const descThObj = await adminApp.db.get('settings', 'portfolio_hero_desc_th');
        const descEnObj = await adminApp.db.get('settings', 'portfolio_hero_desc_en');

        const bgStyleObj = await adminApp.db.get('settings', 'portfolio_hero_background_style');
        const bgImgObj = await adminApp.db.get('settings', 'portfolio_hero_background_image');
        const bgOverlayObj = await adminApp.db.get('settings', 'portfolio_hero_background_overlay');
        const bgPosObj = await adminApp.db.get('settings', 'portfolio_hero_background_position');
        const bgBrightnessObj = await adminApp.db.get('settings', 'portfolio_hero_background_brightness');
        const bgTextThemeObj = await adminApp.db.get('settings', 'portfolio_hero_background_text_theme');
        const bgAttachmentObj = await adminApp.db.get('settings', 'portfolio_hero_background_attachment');
        const heightObj = await adminApp.db.get('settings', 'portfolio_hero_height');

        const heroSecObj = {
            content: {
                backgroundStyle: bgStyleObj?.value || 'image',
                backgroundImage: bgImgObj?.value || 'portfolio_banner.webp',
                backgroundOverlay: bgOverlayObj?.value !== undefined ? bgOverlayObj.value : 55,
                backgroundPosition: bgPosObj?.value || 'center center',
                backgroundBrightness: bgBrightnessObj?.value !== undefined ? bgBrightnessObj.value : 100,
                backgroundTextTheme: bgTextThemeObj?.value || 'auto',
                backgroundAttachment: bgAttachmentObj?.value === 'fixed' ? 'fixed' : 'scroll'
            }
        };

        const titleTh = titleThObj?.value || 'ผลงานสกรีนแก้ว';
        const titleEn = titleEnObj?.value || 'Our Portfolio';
        const descTh = descThObj?.value || 'รวมภาพตัวอย่างผลงานสกรีนจริงจากแบรนด์เครื่องดื่มและร้านกาแฟชั้นนำทั่วประเทศ';
        const descEn = descEnObj?.value || 'Real-world screen printing portfolio from leading beverage brands & cafes.';
        const heightVal = heightObj?.value || 'default';

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';
        overlay.innerHTML = `
            <div class="modal-window portfolio-hero-modal-window" style="max-width: 680px; width: 92%; max-height: 90vh; overflow-y: auto; overflow-x: hidden; padding: 24px; box-sizing: border-box;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; padding-bottom:12px; border-bottom:1px solid var(--border-color); width:100%; box-sizing:border-box;">
                    <h3 style="font-size:1.15rem; font-weight:700; color:var(--primary); margin:0; line-height:1.4;">
                        <i class="fas fa-image" style="color:var(--secondary); margin-right:8px;"></i> ตั้งค่า Hero พื้นหลังหัวข้อผลงาน (Portfolio Hero)
                    </h3>
                    <button type="button" class="btn btn-outline close-modal-btn" style="padding:4px 8px; font-size:0.8rem; flex-shrink:0;"><i class="fas fa-times"></i></button>
                </div>

                <form id="portfolio-hero-form" style="width:100%; box-sizing:border-box;">
                    <div class="portfolio-hero-grid" style="display:grid; grid-template-columns:minmax(0, 1fr) minmax(0, 1fr); gap:14px; margin-bottom:14px; width:100%; box-sizing:border-box;">
                        <div class="form-group" style="min-width:0; max-width:100%; box-sizing:border-box;">
                            <label style="font-weight:700; font-size:0.82rem; color:var(--primary); display:block; width:100%; margin-left:0; padding-left:0; margin-bottom:6px; line-height:1.5; overflow:visible;">ชื่อหัวข้อ (ภาษาไทย)</label>
                            <input type="text" id="port-hero-title-th" class="form-control" value="${titleTh}" style="width:100%; max-width:100%; box-sizing:border-box; margin-left:0; transform:none;">
                        </div>
                        <div class="form-group" style="min-width:0; max-width:100%; box-sizing:border-box;">
                            <label style="font-weight:700; font-size:0.82rem; color:var(--primary); display:block; width:100%; margin-left:0; padding-left:0; margin-bottom:6px; line-height:1.5; overflow:visible;">Title (English)</label>
                            <input type="text" id="port-hero-title-en" class="form-control" value="${titleEn}" style="width:100%; max-width:100%; box-sizing:border-box; margin-left:0; transform:none;">
                        </div>
                    </div>

                    <div class="portfolio-hero-grid" style="display:grid; grid-template-columns:minmax(0, 1fr) minmax(0, 1fr); gap:14px; margin-bottom:14px; width:100%; box-sizing:border-box;">
                        <div class="form-group" style="min-width:0; max-width:100%; box-sizing:border-box;">
                            <label style="font-weight:700; font-size:0.82rem; color:var(--primary); display:block; width:100%; margin-left:0; padding-left:0; margin-bottom:6px; line-height:1.5; overflow:visible;">คำอธิบาย (ภาษาไทย)</label>
                            <textarea id="port-hero-desc-th" class="form-control" rows="2" style="width:100%; max-width:100%; box-sizing:border-box; margin-left:0; transform:none;">${descTh}</textarea>
                        </div>
                        <div class="form-group" style="min-width:0; max-width:100%; box-sizing:border-box;">
                            <label style="font-weight:700; font-size:0.82rem; color:var(--primary); display:block; width:100%; margin-left:0; padding-left:0; margin-bottom:6px; line-height:1.5; overflow:visible;">Description (English)</label>
                            <textarea id="port-hero-desc-en" class="form-control" rows="2" style="width:100%; max-width:100%; box-sizing:border-box; margin-left:0; transform:none;">${descEn}</textarea>
                        </div>
                    </div>

                    <div class="form-group" style="margin-bottom:16px; min-width:0; max-width:100%; box-sizing:border-box;">
                        <label style="font-weight:700; font-size:0.82rem; color:var(--primary); display:block; width:100%; margin-left:0; padding-left:0; margin-bottom:6px; line-height:1.5; overflow:visible;">ความสูงป้าย Hero (Section Height)</label>
                        <select id="port-hero-height" class="form-control" style="width:100%; max-width:100%; box-sizing:border-box; margin-left:0; transform:none; padding:8px 12px;">
                            <option value="compact" ${heightVal === 'compact' ? 'selected' : ''}>Compact (กะทัดรัด - 38px padding)</option>
                            <option value="default" ${heightVal === 'default' ? 'selected' : ''}>Default (มาตรฐาน - 60px padding)</option>
                            <option value="tall" ${heightVal === 'tall' ? 'selected' : ''}>Tall (ทรงสูง - 90px padding)</option>
                        </select>
                    </div>

                    ${window.renderBgAppearancePanelHtml(heroSecObj)}

                    <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px; padding-top:14px; border-top:1px solid var(--border-color); width:100%; box-sizing:border-box;">
                        <button type="button" class="btn btn-outline close-modal-btn" style="padding:8px 18px;">ยกเลิก</button>
                        <button type="submit" class="btn btn-primary" style="padding:8px 24px;"><i class="fas fa-save"></i> บันทึกการตั้งค่า Hero</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(overlay);

        const closeModal = () => {
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        };

        overlay.querySelectorAll('.close-modal-btn').forEach(btn => btn.onclick = closeModal);

        document.getElementById('portfolio-hero-form').onsubmit = async (e) => {
            e.preventDefault();
            const bgStyle = document.querySelector('input[name="bg-style-radio"]:checked')?.value || 'image';
            const bgImg = document.getElementById('sec-bg-img-val')?.value !== undefined
                ? document.getElementById('sec-bg-img-val').value
                : (window.currentActiveSecBgImg || '');
            const rawOverlayInput = document.getElementById('sec-bg-overlay')?.value;
            const bgOverlay = window.normalizeSectionOverlay ? window.normalizeSectionOverlay(rawOverlayInput) : (parseInt(rawOverlayInput, 10) || 55);
            const bgPos = document.getElementById('sec-bg-pos')?.value || 'center center';
            const bgBrightness = parseInt(document.getElementById('sec-bg-brightness')?.value, 10) || 100;
            const bgTextTheme = document.querySelector('input[name="bg-text-theme-radio"]:checked')?.value || document.getElementById('sec-bg-text-theme')?.value || 'auto';
            const bgAttachment = document.getElementById('sec-bg-attachment')?.value === 'fixed' ? 'fixed' : 'scroll';

            await adminApp.db.put('settings', { key: 'portfolio_hero_title_th', value: document.getElementById('port-hero-title-th').value });
            await adminApp.db.put('settings', { key: 'portfolio_hero_title_en', value: document.getElementById('port-hero-title-en').value });
            await adminApp.db.put('settings', { key: 'portfolio_hero_desc_th', value: document.getElementById('port-hero-desc-th').value });
            await adminApp.db.put('settings', { key: 'portfolio_hero_desc_en', value: document.getElementById('port-hero-desc-en').value });
            await adminApp.db.put('settings', { key: 'portfolio_hero_height', value: document.getElementById('port-hero-height').value });

            await adminApp.db.put('settings', { key: 'portfolio_hero_background_style', value: bgStyle });
            await adminApp.db.put('settings', { key: 'portfolio_hero_background_image', value: bgImg });
            await adminApp.db.put('settings', { key: 'portfolio_hero_background_overlay', value: bgOverlay });
            await adminApp.db.put('settings', { key: 'portfolio_hero_background_position', value: bgPos });
            await adminApp.db.put('settings', { key: 'portfolio_hero_background_brightness', value: bgBrightness });
            await adminApp.db.put('settings', { key: 'portfolio_hero_background_text_theme', value: bgTextTheme });
            await adminApp.db.put('settings', { key: 'portfolio_hero_background_attachment', value: bgAttachment });

            alert('บันทึกการตั้งค่า Portfolio Hero เรียบร้อยแล้ว');
            closeModal();
            adminApp.renderActiveView();
        };
    }

    // Hero Slider View
    async loadSliderView(container) {
        const slides = await this.db.getAll('slider');
        const sortedSlides = [...slides].sort((a, b) => a.order - b.order);

        container.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h3 style="font-size:1.15rem; font-weight:700; color:var(--secondary);">ภาพแบนเนอร์สไลด์หน้าแรก (Hero Slider)</h3>
                <button class="btn btn-primary" id="add-slide-btn" style="padding:8px 16px; font-size:0.85rem;"><i class="fas fa-plus"></i> เพิ่มแบนเนอร์สไลด์ใหม่</button>
            </div>
            
            <div class="admin-card">
                ${sortedSlides.length === 0 ? `
                    <p style="color:var(--text-muted); font-size:0.9rem; text-align:center; padding:45px 0;">ยังไม่มีสไลด์แบนเนอร์โฆษณาในฐานข้อมูลของคุณ</p>
                ` : `
                    <div style="overflow-x:auto;">
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th>รูปแบนเนอร์</th>
                                    <th>หัวข้อโปรโมชั่น (TH)</th>
                                    <th>ลิงก์ปุ่มกด</th>
                                    <th>สถานะ</th>
                                    <th>ลำดับการแสดง</th>
                                    <th style="text-align:right;">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${sortedSlides.map(s => `
                                    <tr>
                                        <td style="width:100px;">
                                            <div style="width:80px; height:45px; border-radius:var(--radius-sm); border:1px solid var(--border-color); background:var(--bg-sec); display:flex; align-items:center; justify-content:center; overflow:hidden;">
                                                ${s.bg_src ? `<img src="${s.bg_src}" style="width:100%; height:100%; object-fit:cover;">` : `<i class="fas fa-images" style="color:var(--text-muted);"></i>`}
                                            </div>
                                        </td>
                                        <td><strong>${s.title_th}</strong><br><span style="font-size:0.78rem; color:var(--text-muted);">${s.subtitle_th || ''}</span></td>
                                        <td><code>${s.btn_link || '#/products'}</code></td>
                                        <td>
                                            ${s.published !== false ? '<span class="badge badge-success" style="margin-right:4px;">เผยแพร่</span>' : '<span class="badge badge-danger" style="margin-right:4px;">แบบร่าง</span>'}
                                            ${s.visible !== false ? '<span class="badge badge-success">แสดงผล</span>' : '<span class="badge badge-danger">ซ่อน</span>'}
                                        </td>
                                        <td>ลำดับที่ ${s.order}</td>
                                        <td style="text-align:right;">
                                            <button class="btn btn-outline edit-slide-btn" data-id="${s.id}" style="padding:6px 12px; font-size:0.75rem; border-color:var(--secondary); color:var(--secondary); margin-right:8px;"><i class="fas fa-edit"></i> แก้ไข</button>
                                            <button class="btn btn-outline del-slide-btn" data-id="${s.id}" style="padding:6px 12px; font-size:0.75rem; border-color:var(--danger); color:var(--danger);"><i class="fas fa-trash-alt"></i> ลบ</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        `;

        document.getElementById('add-slide-btn').onclick = () => this.openSlideEditDialog(null);
        document.querySelectorAll('.edit-slide-btn').forEach(btn => {
            btn.onclick = () => this.openSlideEditDialog(btn.dataset.id);
        });
        document.querySelectorAll('.del-slide-btn').forEach(btn => {
            btn.onclick = async () => {
                if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบสไลด์แบนเนอร์รายการนี้ออกถาวร?')) {
                    await this.db.delete('slider', btn.dataset.id);
                    this.renderActiveView();
                }
            };
        });
    }

    // Product Slider View
    async loadProductSliderView(container) {
        const slides = await this.db.getAll('product_slider');
        const sortedSlides = [...slides].sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

        container.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h3 style="font-size:1.15rem; font-weight:700; color:var(--secondary);">ภาพแบนเนอร์สไลด์หน้าสินค้า (Product Hero Slider)</h3>
                <button class="btn btn-primary" id="add-product-slide-btn" style="padding:8px 16px; font-size:0.85rem;"><i class="fas fa-plus"></i> เพิ่มแบนเนอร์สไลด์หน้าสินค้าใหม่</button>
            </div>
            
            <div class="admin-card">
                ${sortedSlides.length === 0 ? `
                    <p style="color:var(--text-muted); font-size:0.9rem; text-align:center; padding:45px 0;">ยังไม่มีสไลด์แบนเนอร์สินค้าในฐานข้อมูลของคุณ</p>
                ` : `
                    <div style="overflow-x:auto;">
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th>รูปแบนเนอร์</th>
                                    <th>หัวข้อโปรโมชั่น (TH)</th>
                                    <th>ลิงก์ปุ่มกด</th>
                                    <th>สถานะ</th>
                                    <th>ลำดับการแสดง</th>
                                    <th style="text-align:right;">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${sortedSlides.map(s => `
                                    <tr>
                                        <td style="width:100px;">
                                            <div style="width:80px; height:45px; border-radius:var(--radius-sm); border:1px solid var(--border-color); background:var(--bg-sec); display:flex; align-items:center; justify-content:center; overflow:hidden;">
                                                ${s.bg_src ? `<img src="${s.bg_src}" style="width:100%; height:100%; object-fit:cover;">` : `<i class="fas fa-images" style="color:var(--text-muted);"></i>`}
                                            </div>
                                        </td>
                                        <td><strong>${s.title_th}</strong><br><span style="font-size:0.78rem; color:var(--text-muted);">${s.subtitle_th || ''}</span></td>
                                        <td><code>${s.btn_link || '#/products'}</code></td>
                                        <td>
                                            ${s.published !== false ? '<span class="badge badge-success" style="margin-right:4px;">เผยแพร่</span>' : '<span class="badge badge-danger" style="margin-right:4px;">แบบร่าง</span>'}
                                            ${s.visible !== false ? '<span class="badge badge-success">แสดงผล</span>' : '<span class="badge badge-danger">ซ่อน</span>'}
                                        </td>
                                        <td>ลำดับที่ ${s.order}</td>
                                        <td style="text-align:right;">
                                            <button class="btn btn-outline edit-product-slide-btn" data-id="${s.id}" style="padding:6px 12px; font-size:0.75rem; border-color:var(--secondary); color:var(--secondary); margin-right:8px;"><i class="fas fa-edit"></i> แก้ไข</button>
                                            <button class="btn btn-outline del-product-slide-btn" data-id="${s.id}" style="padding:6px 12px; font-size:0.75rem; border-color:var(--danger); color:var(--danger);"><i class="fas fa-trash-alt"></i> ลบ</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        `;

        document.getElementById('add-product-slide-btn').onclick = () => this.openProductSlideEditDialog(null);
        document.querySelectorAll('.edit-product-slide-btn').forEach(btn => {
            btn.onclick = () => this.openProductSlideEditDialog(btn.dataset.id);
        });
        document.querySelectorAll('.del-product-slide-btn').forEach(btn => {
            btn.onclick = async () => {
                if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบสไลด์แบนเนอร์สินค้ารายการนี้ออกถาวร?')) {
                    await this.db.delete('product_slider', btn.dataset.id);
                    this.renderActiveView();
                }
            };
        });
    }

    // Home Videos View
    async loadHomeVideosView(container) {
        const videos = await this.db.getAll('home_videos');
        const sortedVids = [...videos].sort((a, b) => a.order - b.order);

        container.innerHTML = `
            <h3 style="font-size:1.15rem; font-weight:700; color:var(--secondary); margin-bottom:20px;">สปอตวิดีโอแนะนำหน้าแรก (Home Videos - 2 คลิป)</h3>
            
            <div class="grid-2">
                ${sortedVids.map((v, idx) => `
                    <div class="admin-card" style="display:flex; flex-direction:column; justify-content:space-between;">
                        <div>
                            <span style="font-weight:700; color:var(--primary); font-size:0.78rem; text-transform:uppercase;">ช่องสปอตวิดีโอตำแหน่งที่ ${idx + 1}</span>
                            <h4 style="font-size:1.1rem; font-weight:700; color:var(--secondary); margin:8px 0 12px 0;">${v.title_th || 'ยังไม่มีตัววิดีโอ'}</h4>
                            <p style="font-size:0.85rem; color:var(--text-muted); line-height:1.5; margin-bottom:16px;">${v.desc_th || 'คำอธิบายสปอตวิดีโอหน้าร้าน'}</p>
                            
                            <div style="background:#0f223d; aspect-ratio:16/9; border-radius:var(--radius-md); display:flex; align-items:center; justify-content:center; overflow:hidden; border:1px solid var(--border-color); position:relative; margin-bottom:16px;">
                                ${v.video_src ? `
                                    <video src="${v.video_src}" poster="${v.poster_src || ''}" controls style="width:100%; height:100%; object-fit:contain;"></video>
                                ` : `
                                    <div style="color:rgba(255,255,255,0.4); text-align:center;">
                                        <i class="fas fa-video-slash" style="font-size:2.5rem; margin-bottom:8px;"></i>
                                        <div style="font-size:0.8rem;">ยังไม่ได้อัปโหลดไฟล์วิดีโอ</div>
                                    </div>
                                `}
                            </div>
                        </div>
                        
                        <div style="border-top:1.5px solid var(--border-color); padding-top:16px; display:flex; gap:12px;">
                            <button class="btn btn-outline edit-video-btn" data-id="${v.id}" style="flex-grow:1; font-size:0.8rem; border-color:var(--secondary); color:var(--secondary);"><i class="fas fa-edit"></i> แก้ไขคลิป / ข้อมูล</button>
                            ${v.video_src ? `
                                <button class="btn btn-outline clear-video-btn" data-id="${v.id}" style="font-size:0.8rem; border-color:var(--danger); color:var(--danger);"><i class="fas fa-trash-alt"></i> เคลียร์ไฟล์</button>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        document.querySelectorAll('.edit-video-btn').forEach(btn => {
            btn.onclick = () => this.openHomeVideoEditDialog(btn.dataset.id);
        });

        document.querySelectorAll('.clear-video-btn').forEach(btn => {
            btn.onclick = async () => {
                if (confirm('คุณต้องการเคลียร์หรือลบไฟล์วิดีโอนี้ออกใช่หรือไม่? (ข้อมูลข้อความหลักจะยังคงอยู่)')) {
                    const videoObj = await this.db.get('home_videos', btn.dataset.id);
                    if (videoObj) {
                        videoObj.video_src = '';
                        videoObj.poster_src = '';
                        await this.db.put('home_videos', videoObj);
                        this.renderActiveView();
                    }
                }
            };
        });
    }

    // Media Library View (Supports multiple select and delete)
    async loadMediaLibView(container) {
        try {
            const media = await this.db.getAll('media');
            const categories = await this.db.getAll('media_categories');
            
            const activeMedCat = localStorage.getItem('charoen_med_cat_filter') || 'all';

            // Filter media
            const filteredMedia = activeMedCat === 'all' 
                ? media 
                : media.filter(m => m && m.category === activeMedCat);

            container.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                    <h3 style="font-size:1.15rem; font-weight:700; color:var(--secondary);">คลังภาพอเนกประสงค์ (WebP Auto-Converter)</h3>
                    
                    <div style="display:flex; gap:12px; align-items:center;">
                        <button class="btn btn-outline" id="manage-med-cats-btn" style="padding:8px 16px; font-size:0.82rem; border-color:var(--secondary); color:var(--secondary);"><i class="fas fa-folder"></i> จัดการหมวดหมู่ภาพ</button>
                        
                        <button class="btn ${this.bulkSelectMode ? 'btn-primary' : 'btn-outline'}" id="bulk-select-mode-btn" style="padding:8px 16px; font-size:0.82rem; ${this.bulkSelectMode ? 'background-color:var(--accent); color:white;' : ''}">
                            <i class="fas ${this.bulkSelectMode ? 'fa-times' : 'fa-tasks'}"></i> ${this.bulkSelectMode ? 'ยกเลิกการเลือก' : 'เลือกหลายภาพ'}
                        </button>
                        
                        <button class="btn btn-primary" id="bulk-delete-btn" style="padding:8px 16px; font-size:0.82rem; background-color:var(--danger); display:${this.bulkSelectMode ? 'inline-flex' : 'none'};" ${this.selectedMediaIds.length === 0 ? 'disabled' : ''}>
                            <i class="fas fa-trash-alt"></i> ลบที่เลือก (${this.selectedMediaIds.length})
                        </button>

                        <button class="btn btn-primary" id="upload-media-btn" style="padding:8px 16px; font-size:0.82rem; display:${this.bulkSelectMode ? 'none' : 'inline-flex'};"><i class="fas fa-cloud-upload-alt"></i> อัปโหลดสื่อเข้าคลัง</button>
                    </div>
                </div>
                
                <div class="catalog-layout" style="padding:0;">
                    <!-- Media Left Sidebar -->
                    <aside class="sidebar-filters" style="top:20px;">
                        <h4 class="filter-title">ตัวกรองสื่อ</h4>
                        <ul class="filter-list" id="media-filter-list">
                            <li>
                                <button class="filter-btn ${activeMedCat === 'all' ? 'active' : ''}" data-cat="all">
                                    ไฟล์ทั้งหมด (${media.length})
                                </button>
                            </li>
                            ${categories.map(c => {
                                const count = media.filter(m => m && m.category === c.id).length;
                                return `
                                    <li>
                                        <button class="filter-btn ${activeMedCat === c.id ? 'active' : ''}" data-cat="${c.id}">
                                            ${c.name_th} (${count})
                                        </button>
                                    </li>
                                `;
                            }).join('')}
                        </ul>
                    </aside>
                    
                    <!-- Media Grid List / Drag & Drop Upload Zone -->
                    <main class="admin-card" id="media-drop-zone" style="padding:20px; min-height:450px; position:relative; border:2px dashed transparent; transition:all 0.3s ease;">
                        ${filteredMedia.length === 0 ? `
                            <div style="color:var(--text-muted); font-size:0.9rem; text-align:center; padding:80px 0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16px; min-height:350px;">
                                <i class="fas fa-images" style="font-size:3.5rem; color:var(--border-color);"></i>
                                <div>ยังไม่มีไฟล์รูปภาพหรือวิดีโอเก็บอยู่ในหมวดหมู่นี้</div>
                                <div style="font-size:0.75rem; color:rgba(0,0,0,0.35);">สามารถลากไฟล์รูปภาพหรือคลิปวิดีโอมาวาง (Drop) บนพื้นที่นี้เพื่อทำการอัปโหลดได้ทันที!</div>
                            </div>
                        ` : `
                            <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:16px;">
                                ${filteredMedia.map(m => {
                                    if (!m) return '';
                                    const isSelected = this.bulkSelectMode && this.selectedMediaIds.includes(m.id);
                                    const isVideo = (m.image_src && typeof m.image_src === 'string' && m.image_src.startsWith('data:video/')) || 
                                                    (m.name && (m.name.endsWith('.mp4') || m.name.endsWith('.webm')));
                                    return `
                                        <div class="media-card-item ${this.bulkSelectMode ? 'media-bulk-card' : ''}" data-id="${m.id}" style="border:${isSelected ? '3px solid var(--accent)' : '1px solid var(--border-color)'}; border-radius:var(--radius-md); overflow:hidden; background:var(--bg-sec); position:relative; cursor:${this.bulkSelectMode ? 'pointer' : 'default'}; transition:var(--transition); transform:${isSelected ? 'scale(0.97)' : 'none'}; box-shadow:${isSelected ? 'var(--shadow-md)' : 'none'};">
                                            
                                            <!-- Selection indicator checkbox badge -->
                                            ${isSelected ? `
                                                <div style="position:absolute; top:8px; left:8px; width:26px; height:26px; border-radius:50%; background:var(--accent); color:white; display:flex; align-items:center; justify-content:center; font-size:0.8rem; z-index:5; box-shadow:0 2px 5px rgba(0,0,0,0.3);"><i class="fas fa-check"></i></div>
                                            ` : ''}

                                            <div style="aspect-ratio:1/1; display:flex; align-items:center; justify-content:center; overflow:hidden; background:#e2e8f0;">
                                                ${isVideo ? `
                                                    <div style="color:var(--secondary); text-align:center; font-size:1.8rem;">
                                                        <i class="fas fa-file-video"></i>
                                                        <div style="font-size:0.68rem; color:var(--text-muted); margin-top:6px; font-weight:700;">VIDEO CLIP</div>
                                                    </div>
                                                ` : `
                                                    <img src="${m.image_src || ''}" style="width:100%; height:100%; object-fit:cover;">
                                                `}
                                            </div>
                                            <div style="padding:10px; font-size:0.75rem;">
                                                <div style="font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${m.name || ''}">${m.name || 'Unnamed'}</div>
                                                <div style="color:var(--text-muted); font-size:0.68rem; margin-top:2px;">${m.created_at ? new Date(m.created_at).toLocaleDateString('th-TH') : ''}</div>
                                            </div>
                                            
                                            <!-- Overlay Delete Button -->
                                            ${!this.bulkSelectMode ? `
                                                <button class="del-media-btn" data-id="${m.id}" style="position:absolute; top:8px; right:8px; width:28px; height:28px; border-radius:50%; border:none; background:rgba(239, 68, 68, 0.9); color:white; font-size:0.8rem; cursor:pointer; display:flex; justify-content:center; align-items:center; opacity:0.85; transition:var(--transition);"><i class="fas fa-trash"></i></button>
                                            ` : ''}
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        `}
                    </main>
                </div>
                
                <!-- Hidden inputs -->
                <input type="file" id="media-upload-selector" accept="image/*,video/mp4,video/webm" style="display:none;" multiple>
            `;

            // Bind filter clicks
            document.querySelectorAll('#media-filter-list .filter-btn').forEach(btn => {
                btn.onclick = () => {
                    localStorage.setItem('charoen_med_cat_filter', btn.dataset.cat);
                    this.renderActiveView();
                };
            });

            // Toggle select mode
            const selectModeBtn = document.getElementById('bulk-select-mode-btn');
            if (selectModeBtn) {
                selectModeBtn.onclick = () => {
                    this.bulkSelectMode = !this.bulkSelectMode;
                    if (!this.bulkSelectMode) {
                        this.selectedMediaIds = [];
                    }
                    this.renderActiveView();
                };
            }

            // Click card to toggle bulk selection
            document.querySelectorAll('.media-bulk-card').forEach(card => {
                card.onclick = () => {
                    const id = card.dataset.id;
                    if (this.selectedMediaIds.includes(id)) {
                        this.selectedMediaIds = this.selectedMediaIds.filter(item => item !== id);
                    } else {
                        this.selectedMediaIds.push(id);
                    }
                    this.renderActiveView();
                };
            });

            // Delete selected items
            const bulkDeleteBtn = document.getElementById('bulk-delete-btn');
            if (bulkDeleteBtn) {
                bulkDeleteBtn.onclick = async () => {
                    if (this.selectedMediaIds.length === 0) return;
                    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบรูปภาพ/คลิปวิดีโอที่เลือกทั้งหมด ${this.selectedMediaIds.length} รายการออกถาวร?`)) {
                        for (const id of this.selectedMediaIds) {
                            await this.db.delete('media', id);
                        }
                        this.selectedMediaIds = [];
                        this.bulkSelectMode = false;
                        this.renderActiveView();
                    }
                };
            }

            // Delete media singly
            document.querySelectorAll('.del-media-btn').forEach(btn => {
                btn.onclick = async (e) => {
                    e.stopPropagation();
                    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบไฟล์สื่อชิ้นนี้จากคลังถาวร?')) {
                        await this.db.delete('media', btn.dataset.id);
                        this.renderActiveView();
                    }
                };
            });

            // Manage media categories dialog
            document.getElementById('manage-med-cats-btn').onclick = () => this.openMediaCategoriesDialog();

            // Drag and drop listeners on media-drop-zone
            const dropZone = document.getElementById('media-drop-zone');
            if (dropZone) {
                dropZone.ondragover = (e) => {
                    e.preventDefault();
                    if (!this.bulkSelectMode) {
                        dropZone.style.borderColor = 'var(--accent)';
                        dropZone.style.backgroundColor = 'rgba(255, 107, 0, 0.04)';
                        dropZone.style.boxShadow = 'inset 0 0 10px rgba(255, 107, 0, 0.05)';
                    }
                };

                dropZone.ondragleave = (e) => {
                    e.preventDefault();
                    dropZone.style.borderColor = 'transparent';
                    dropZone.style.backgroundColor = 'var(--bg-sec)';
                    dropZone.style.boxShadow = 'none';
                };

                dropZone.ondrop = async (e) => {
                    e.preventDefault();
                    dropZone.style.borderColor = 'transparent';
                    dropZone.style.backgroundColor = 'var(--bg-sec)';
                    dropZone.style.boxShadow = 'none';

                    if (this.bulkSelectMode) return;

                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        const files = Array.from(e.dataTransfer.files);
                        
                        const mainBtn = document.getElementById('upload-media-btn');
                        if (mainBtn) {
                            mainBtn.disabled = true;
                            mainBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> กำลังอัปโหลด...`;
                        }

                        for (const file of files) {
                            await this.handleMediaUpload(file, activeMedCat);
                        }

                        alert(`อัปโหลดไฟล์สื่อจำนวน ${files.length} รายการลงคลังเรียบร้อยแล้ว!`);
                        this.renderActiveView();
                    }
                };
            }

            // Upload Media Logic
            const uploader = document.getElementById('media-upload-selector');
            const uploadMediaBtn = document.getElementById('upload-media-btn');
            if (uploadMediaBtn) {
                uploadMediaBtn.onclick = () => uploader.click();
            }
            if (uploader) {
                uploader.onchange = async (e) => {
                    if (e.target.files && e.target.files.length > 0) {
                        const files = Array.from(e.target.files);
                        
                        const mainBtn = document.getElementById('upload-media-btn');
                        if (mainBtn) {
                            mainBtn.disabled = true;
                            mainBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> กำลังอัปโหลด...`;
                        }

                        for (const file of files) {
                            await this.handleMediaUpload(file, activeMedCat);
                        }

                        alert(`อัปโหลดไฟล์สื่อจำนวน ${files.length} รายการลงคลังเรียบร้อยแล้ว!`);
                        this.renderActiveView();
                    }
                };
            }
        } catch (err) {
            console.error("Error loading Media Library view:", err);
            container.innerHTML = `
                <div style="padding:40px; text-align:center; color:var(--danger); font-family:'Kanit', sans-serif;">
                    <i class="fas fa-exclamation-triangle" style="font-size:2.5rem; margin-bottom:16px;"></i>
                    <h3 style="font-weight:700;">เกิดข้อผิดพลาดในการโหลดคลังสื่อ</h3>
                    <p style="margin-top:8px; font-size:0.9rem; color:var(--text-muted);">${err.message}</p>
                    <button class="btn btn-outline" onclick="location.reload()" style="margin-top:16px;"><i class="fas fa-sync-alt"></i> รีโหลดหน้าจอ</button>
                </div>
            `;
        }
    }

    // HTML5 Canvas WebP conversion helper
    convertImageToWebP(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Maintain aspect ratio or limit max size to 1200px for best performance
                    let width = img.width;
                    let height = img.height;
                    const maxDim = 1200;
                    
                    if (width > maxDim || height > maxDim) {
                        if (width > height) {
                            height = Math.round((height * maxDim) / width);
                            width = maxDim;
                        } else {
                            width = Math.round((width * maxDim) / height);
                            height = maxDim;
                        }
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Convert to image/webp base64 string
                    const webpData = canvas.toDataURL('image/webp', 0.82);
                    resolve(webpData);
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    }

    // Single file media upload controller (Handles WebP conversion, DB storage & safe type checks)
    async handleMediaUpload(file, activeMedCat) {
        try {
            if (file.type.startsWith('video/')) {
                if (file.size > 20 * 1024 * 1024) {
                    alert(`ข้อผิดพลาด: ไฟล์วิดีโอ "${file.name}" มีขนาดเกิน 20MB!\n\nกรุณาเลือกไฟล์วิดีโอที่มีขนาดไม่เกิน 20MB ครับ`);
                    return;
                }
                
                const videoBase64 = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = () => reject(reader.error);
                    reader.readAsDataURL(file);
                });

                const newMedia = {
                    id: 'med_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                    name: file.name,
                    category: 'med-video',
                    image_src: videoBase64, // Stored directly
                    created_at: new Date().toISOString()
                };

                await this.db.put('media', newMedia);
            } else if (file.type.startsWith('image/')) {
                const convertedWebp = await this.convertImageToWebP(file);
                
                // Smart category assignment based on active select sidebar filter
                let catId = activeMedCat;
                if (!catId || catId === 'all' || catId === 'med-video') {
                    const targetCat = prompt(`กรุณาระบุหมวดหมู่สำหรับภาพ "${file.name}":\n\nป้อน 'med-logo' (โลโก้ลูกค้า)\nป้อน 'med-raw' (แก้วเปล่า)\nป้อน 'med-print' (แก้วสกรีน)\nป้อน 'med-banner' (แบนเนอร์)\nป้อน 'med-other' (อื่นๆ)`, 'med-print');
                    catId = ['med-logo', 'med-raw', 'med-print', 'med-banner', 'med-other'].includes(targetCat) ? targetCat : 'med-other';
                }

                const newMedia = {
                    id: 'med_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                    name: file.name.substring(0, file.name.lastIndexOf('.')) + '.webp',
                    category: catId,
                    image_src: convertedWebp,
                    created_at: new Date().toISOString()
                };

                await this.db.put('media', newMedia);
            } else {
                alert(`ข้อผิดพลาด: ระบบไม่รองรับชนิดไฟล์ของ "${file.name}" (รองรับรูปภาพทั่วไปและคลิปวิดีโอ)`);
            }
        } catch (err) {
            console.error(err);
            alert(`ไม่สามารถอัปโหลดไฟล์ "${file.name}" ได้: ` + err.message);
        }
    }

    // Quotes View
    async loadQuotesView(container) {
        const quotes = await this.db.getAll('quotes');
        const categories = await this.db.getAll('categories');
        const getQuoteTime = (q) => {
            const rawDate = q.created_at || q.date;
            if (!rawDate) return 0;
            const t = new Date(rawDate).getTime();
            return isNaN(t) ? 0 : t;
        };
        const sortedQuotes = [...quotes].sort((a, b) => getQuoteTime(b) - getQuoteTime(a));

        container.innerHTML = `
            <h3 style="font-size:1.15rem; font-weight:700; color:var(--secondary); margin-bottom:20px;">รายการติดต่อขอใบเสนอราคา</h3>
            
            <div class="admin-card">
                ${sortedQuotes.length === 0 ? `
                    <p style="color:var(--text-muted); font-size:0.9rem; text-align:center; padding:50px 0;">ยังไม่มีประวัติการส่งคำขอเสนอราคาในเครื่องคอมพิวเตอร์ของคุณ</p>
                ` : `
                    <div style="overflow-x:auto;">
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th>ข้อมูลผู้ติดต่อ</th>
                                    <th>เบอร์โทร / LINE ID</th>
                                    <th>ประเภทสินค้า</th>
                                    <th>จำนวน</th>
                                    <th>ข้อความรายละเอียด</th>
                                    <th>ภาพโลโก้</th>
                                    <th>สถานะ</th>
                                    <th>การจัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${sortedQuotes.map(q => {
                                    const quoteId = this.resolveQuoteId(q);
                                    const catName = this.getQuoteCategoryName(q, categories);
                                    const quantityDisplay = this.formatQuoteQuantity(q);
                                    const dateDisplay = this.formatQuoteDate(q, true);
                                    const nameDisplay = q.name || '-';
                                    const phoneDisplay = q.phone || '-';
                                    const lineDisplay = q.line || '-';
                                    const status = this.getNormalizedQuoteStatus(q.status);
                                    const logoSrc = this.getQuoteLogoSrc(q);

                                    return `
                                        <tr>
                                            <td><strong>${nameDisplay}</strong><br><span style="font-size:0.75rem; color:var(--text-muted);">${dateDisplay}</span></td>
                                            <td>โทร: ${phoneDisplay}<br>Line: <span class="badge" style="background:#e6f9eb; color:#10b981; font-weight:700;">${lineDisplay}</span></td>
                                            <td>${catName}</td>
                                            <td><strong>${quantityDisplay}</strong></td>
                                            <td style="max-width:240px; font-size:0.85rem; line-height:1.4;">${q.details || '-'}</td>
                                            <td>
                                                ${logoSrc ? `
                                                    <div style="width:40px; height:40px; border-radius:var(--radius-sm); border:1px solid var(--border-color); background:var(--bg-sec); display:flex; align-items:center; justify-content:center; overflow:hidden; cursor:pointer;" onclick="window.charoenAdminApp.previewLogoImage('${logoSrc}')">
                                                        <img src="${logoSrc}" style="width:100%; height:100%; object-fit:contain;">
                                                    </div>
                                                ` : '<span style="font-size:0.8rem; color:var(--text-muted);">ไม่มีไฟล์</span>'}
                                            </td>
                                            <td>
                                                ${quoteId ? `
                                                    <button class="btn toggle-quote-status-btn" data-id="${quoteId}" data-status="${status}" style="padding:4px 8px; font-size:0.72rem; border:none; border-radius:var(--radius-sm); background:${status === 'pending' ? '#fee2e2' : '#d1fae5'}; color:${status === 'pending' ? '#991b1b' : '#065f46'}; cursor:pointer; font-weight:700;">
                                                        ${status === 'pending' ? 'รอดำเนินการ' : 'ติดต่อแล้ว'}
                                                    </button>
                                                ` : `
                                                    <span class="badge badge-danger" style="padding:4px 8px; font-size:0.72rem;">${status === 'pending' ? 'รอดำเนินการ' : 'ติดต่อแล้ว'}</span>
                                                `}
                                            </td>
                                            <td>
                                                <div style="display:flex; gap:6px; align-items:center;">
                                                    ${quoteId ? `
                                                        <button class="btn btn-outline view-quote-btn" data-id="${quoteId}" style="padding:6px 10px; font-size:0.72rem; border-color:var(--primary); color:var(--primary); font-weight:600;"><i class="fas fa-eye"></i> ดูรายละเอียด</button>
                                                        <button class="btn btn-outline del-quote-btn" data-id="${quoteId}" style="padding:6px 10px; font-size:0.72rem; border-color:var(--danger); color:var(--danger); font-weight:600;"><i class="fas fa-trash-alt"></i> ลบ</button>
                                                    ` : `
                                                        <span style="font-size:0.72rem; color:var(--danger); font-weight:700;">ไม่พบรหัสรายการ</span>
                                                    `}
                                                </div>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        `;

        document.querySelectorAll('.view-quote-btn').forEach(btn => {
            btn.onclick = () => {
                const qId = btn.dataset.id;
                if (qId) {
                    this.openQuoteDetailDialog(qId);
                }
            };
        });

        document.querySelectorAll('.toggle-quote-status-btn').forEach(btn => {
            btn.onclick = async () => {
                const qId = btn.dataset.id;
                if (!qId) return;
                const quoteObj = await this.db.get('quotes', qId);
                if (quoteObj) {
                    const currentStatus = this.getNormalizedQuoteStatus(quoteObj.status);
                    const newStatus = currentStatus === 'pending' ? 'contacted' : 'pending';
                    quoteObj.status = newStatus;
                    await this.db.put('quotes', quoteObj);
                    this.renderActiveView();
                }
            };
        });

        document.querySelectorAll('.del-quote-btn').forEach(btn => {
            btn.onclick = async () => {
                const qId = btn.dataset.id;
                if (!qId) return;
                if (confirm('คุณต้องการลบรายการขอใบเสนอราคานี้ออกอย่างถาวรหรือไม่?')) {
                    await this.db.delete('quotes', qId);
                    this.renderActiveView();
                }
            };
        });
    }

    async openQuoteDetailDialog(quoteId) {
        if (!quoteId) {
            alert('ไม่พบรหัสรายการขอใบเสนอราคา');
            return;
        }

        const quote = await this.db.get('quotes', quoteId);
        if (!quote) {
            alert('ไม่พบข้อมูลรายการขอใบเสนอราคานี้');
            return;
        }

        const categories = await this.db.getAll('categories');
        const catName = this.getQuoteCategoryName(quote, categories);
        const quantityDisplay = this.formatQuoteQuantity(quote);
        const dateDisplay = this.formatQuoteDate(quote, true);
        const status = this.getNormalizedQuoteStatus(quote.status);
        const logoSrc = this.getQuoteLogoSrc(quote);

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';
        overlay.style.zIndex = '20000';
        overlay.id = 'quote-detail-modal-overlay';
        
        overlay.innerHTML = `
            <div class="modal-window" style="max-width:620px; width:92%; max-height:90vh; overflow-y:auto; padding:24px; box-sizing:border-box;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; padding-bottom:12px; border-bottom:1px solid var(--border-color); width:100%; box-sizing:border-box;">
                    <h3 style="font-size:1.15rem; font-weight:700; color:var(--primary); margin:0; line-height:1.4;">
                        <i class="fas fa-file-invoice-dollar" style="color:var(--secondary); margin-right:8px;"></i> รายละเอียดใบเสนอราคา (Quote Details)
                    </h3>
                    <button type="button" class="modal-close-btn close-modal-btn" style="position:static; padding:4px 8px; font-size:0.8rem; flex-shrink:0;"><i class="fas fa-times"></i></button>
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px;">
                    <div style="background:var(--bg-sec); padding:12px 16px; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
                        <div style="font-size:0.75rem; color:var(--text-muted); font-weight:700; margin-bottom:4px;">ชื่อร้าน / ผู้ติดต่อ</div>
                        <div style="font-size:0.95rem; font-weight:700; color:var(--primary);">${quote.name || '-'}</div>
                    </div>
                    <div style="background:var(--bg-sec); padding:12px 16px; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
                        <div style="font-size:0.75rem; color:var(--text-muted); font-weight:700; margin-bottom:4px;">วันที่ส่งคำขอ</div>
                        <div style="font-size:0.95rem; font-weight:600; color:var(--text-main);">${dateDisplay}</div>
                    </div>
                    <div style="background:var(--bg-sec); padding:12px 16px; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
                        <div style="font-size:0.75rem; color:var(--text-muted); font-weight:700; margin-bottom:4px;">เบอร์โทรศัพท์</div>
                        <div style="font-size:0.95rem; font-weight:600; color:var(--text-main);">${quote.phone || '-'}</div>
                    </div>
                    <div style="background:var(--bg-sec); padding:12px 16px; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
                        <div style="font-size:0.75rem; color:var(--text-muted); font-weight:700; margin-bottom:4px;">LINE ID</div>
                        <div style="font-size:0.95rem; font-weight:600; color:#10b981;">${quote.line || '-'}</div>
                    </div>
                    <div style="background:var(--bg-sec); padding:12px 16px; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
                        <div style="font-size:0.75rem; color:var(--text-muted); font-weight:700; margin-bottom:4px;">ประเภทสินค้า</div>
                        <div style="font-size:0.95rem; font-weight:600; color:var(--text-main);">${catName}</div>
                    </div>
                    <div style="background:var(--bg-sec); padding:12px 16px; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
                        <div style="font-size:0.75rem; color:var(--text-muted); font-weight:700; margin-bottom:4px;">จำนวนที่ต้องการ</div>
                        <div style="font-size:0.95rem; font-weight:700; color:var(--secondary);">${quantityDisplay}</div>
                    </div>
                </div>

                <div style="margin-bottom:20px; background:var(--bg-sec); padding:16px; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
                    <div style="font-size:0.75rem; color:var(--text-muted); font-weight:700; margin-bottom:6px;">ข้อความรายละเอียด / สเปกเพิ่มเติม</div>
                    <div style="font-size:0.9rem; color:var(--text-main); line-height:1.6; white-space:pre-wrap;">${quote.details || '-'}</div>
                </div>

                <div style="margin-bottom:20px; background:var(--bg-sec); padding:16px; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
                    <div style="font-size:0.75rem; color:var(--text-muted); font-weight:700; margin-bottom:10px;">ไฟล์รูปภาพโลโก้ / ตัวอย่างงาน</div>
                    ${logoSrc ? `
                        <div style="max-width:200px; max-height:200px; border-radius:var(--radius-sm); border:1px solid var(--border-color); background:#fff; overflow:hidden; display:flex; align-items:center; justify-content:center; cursor:pointer;" onclick="window.charoenAdminApp.previewLogoImage('${logoSrc}')">
                            <img src="${logoSrc}" style="max-width:100%; max-height:200px; object-fit:contain;">
                        </div>
                        <div style="font-size:0.75rem; color:var(--text-muted); margin-top:6px;">* คลิกที่รูปภาพเพื่อขยายใหญ่</div>
                    ` : `
                        <div style="font-size:0.85rem; color:var(--text-muted);">ไม่มีไฟล์รูปภาพแนบ</div>
                    `}
                </div>

                <div style="margin-bottom:20px; display:flex; align-items:center; justify-content:space-between; background:var(--bg-sec); padding:12px 16px; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
                    <div>
                        <span style="font-size:0.8rem; color:var(--text-muted); font-weight:700; margin-right:8px;">สถานะปัจจุบัน:</span>
                        <span class="badge ${status === 'pending' ? 'badge-danger' : 'badge-success'}" style="font-size:0.85rem; padding:4px 10px;">
                            ${status === 'pending' ? 'รอดำเนินการ' : 'ติดต่อแล้ว'}
                        </span>
                    </div>
                    <button type="button" class="btn modal-toggle-status-btn" style="padding:6px 14px; font-size:0.8rem; border:none; border-radius:var(--radius-sm); background:${status === 'pending' ? '#d1fae5' : '#fee2e2'}; color:${status === 'pending' ? '#065f46' : '#991b1b'}; cursor:pointer; font-weight:700;">
                        ${status === 'pending' ? 'เปลี่ยนเป็น "ติดต่อแล้ว"' : 'เปลี่ยนเป็น "รอดำเนินการ"'}
                    </button>
                </div>

                <div style="display:flex; justify-content:flex-end; gap:10px; padding-top:14px; border-top:1px solid var(--border-color);">
                    <button type="button" class="btn btn-outline close-modal-btn" style="padding:8px 22px;">ปิด</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const closeModal = () => {
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        };

        overlay.querySelectorAll('.close-modal-btn').forEach(btn => btn.onclick = closeModal);

        overlay.onclick = (e) => {
            if (e.target === overlay) closeModal();
        };

        const modalToggleBtn = overlay.querySelector('.modal-toggle-status-btn');
        if (modalToggleBtn) {
            modalToggleBtn.onclick = async () => {
                const currentQuote = await this.db.get('quotes', quoteId);
                if (currentQuote) {
                    const currentStatus = this.getNormalizedQuoteStatus(currentQuote.status);
                    const newStatus = currentStatus === 'pending' ? 'contacted' : 'pending';
                    currentQuote.status = newStatus;
                    await this.db.put('quotes', currentQuote);
                    closeModal();
                    this.renderActiveView();
                }
            };
        }
    }

    // Settings View
    async loadSettingsView(container) {
        const logoImg = await this.db.get('settings', 'logo_img');
        const phone = await this.db.get('settings', 'phone');
        const line = await this.db.get('settings', 'line');
        const facebook = await this.db.get('settings', 'facebook');
        const email = await this.db.get('settings', 'email');
        const addressTh = await this.db.get('settings', 'address_th');
        const addressEn = await this.db.get('settings', 'address_en');
        const hoursTh = await this.db.get('settings', 'business_hours_th');
        const hoursEn = await this.db.get('settings', 'business_hours_en');
        
        const compNameTh = await this.db.get('settings', 'company_name_th');
        const compNameEn = await this.db.get('settings', 'company_name_en');
        const aboutTitleTh = await this.db.get('settings', 'about_title_th');
        const aboutTitleEn = await this.db.get('settings', 'about_title_en');
        const aboutDescTh = await this.db.get('settings', 'about_desc_th');
        const aboutDescEn = await this.db.get('settings', 'about_desc_en');

        const aboutImage = await this.db.get('settings', 'about_image');
        const aboutBulletsTh = await this.db.get('settings', 'about_bullets_th');
        const aboutBulletsEn = await this.db.get('settings', 'about_bullets_en');

        const aboutGalleryObj = await this.db.get('settings', 'about_gallery_images');
        let aboutGalleryList = [];
        if (aboutGalleryObj?.value) {
            try {
                aboutGalleryList = typeof aboutGalleryObj.value === 'string' ? JSON.parse(aboutGalleryObj.value) : aboutGalleryObj.value;
            } catch (e) {
                aboutGalleryList = Array.isArray(aboutGalleryObj.value) ? aboutGalleryObj.value : [];
            }
        } else if (Array.isArray(aboutGalleryObj)) {
            aboutGalleryList = aboutGalleryObj;
        }
        if (!Array.isArray(aboutGalleryList)) aboutGalleryList = [];

        window.currentAboutGalleryImages = [...aboutGalleryList];

        const aboutEyebrowTh = await this.db.get('settings', 'about_eyebrow_th');
        const aboutEyebrowEn = await this.db.get('settings', 'about_eyebrow_en');
        const aboutCtaTextTh = await this.db.get('settings', 'about_cta_text_th');
        const aboutCtaTextEn = await this.db.get('settings', 'about_cta_text_en');
        const aboutCtaLink = await this.db.get('settings', 'about_cta_link');

        // Highlight Cards 1 to 5
        const hCards = [];
        const defaultHighlightsTh = [
            { icon: 'fas fa-industry', title: 'โรงงานผลิตมาตรฐาน', desc: 'ใช้เครื่องจักรสกรีนแก้วทันสมัย ได้มาตรฐานอุตสาหกรรม ควบคุมคุณภาพทุกขั้นตอน' },
            { icon: 'fas fa-layer-group', title: 'ขั้นต่ำต่ำ เริ่มต้น 1,000 ใบ', desc: 'รองรับทั้งร้านกาแฟเปิดใหม่และธุรกิจขนาดใหญ่ สั่งผลิตได้ตามต้องการ' },
            { icon: 'fas fa-shield-halved', title: 'สีสกรีนคมชัด ติดทนนาน', desc: 'ใช้หมึกพิมพ์ Food Grade ปลอดภัย สีสวยสดใส ไม่หลุดลอกง่าย' },
            { icon: 'fas fa-compass-drafting', title: 'บริการจัดวางแบบฟรี', desc: 'ทีมงานมืออาชีพช่วยจัดวางตำแหน่งโลโก้และตรวจสอบไฟล์ฟรีก่อนสกรีนจริง' },
            { icon: 'fas fa-truck-fast', title: 'จัดส่งรวดเร็วทั่วประเทศ', desc: 'แพ็คบรรจุอย่างแน่นหนา พร้อมจัดส่งตรงถึงหน้าร้านทั่วประเทศไทย' }
        ];

        const defaultHighlightsEn = [
            { icon: 'fas fa-industry', title: 'Standard Manufacturing', desc: 'Equipped with modern screen printing machinery and strict quality control.' },
            { icon: 'fas fa-layer-group', title: 'Low MOQ Starts 1,000 Pcs', desc: 'Suitable for both newly opened cafes and large beverage brands.' },
            { icon: 'fas fa-shield-halved', title: 'Durable & Safe Printing', desc: 'Food-Grade inks with vibrant, long-lasting print durability.' },
            { icon: 'fas fa-compass-drafting', title: 'Free Design Layout', desc: 'In-house graphic team assists with free logo positioning and proofing.' },
            { icon: 'fas fa-truck-fast', title: 'Nationwide Delivery', desc: 'Secure packaging with reliable door-to-door nationwide delivery.' }
        ];

        for (let i = 1; i <= 5; i++) {
            const iconK = await this.db.get('settings', `about_h${i}_icon`);
            const titleThK = await this.db.get('settings', `about_h${i}_title_th`);
            const titleEnK = await this.db.get('settings', `about_h${i}_title_en`);
            const descThK = await this.db.get('settings', `about_h${i}_desc_th`);
            const descEnK = await this.db.get('settings', `about_h${i}_desc_en`);
            hCards.push({
                icon: iconK?.value || defaultHighlightsTh[i-1].icon,
                titleTh: titleThK?.value || defaultHighlightsTh[i-1].title,
                titleEn: titleEnK?.value || defaultHighlightsEn[i-1].title,
                descTh: descThK?.value || defaultHighlightsTh[i-1].desc,
                descEn: descEnK?.value || defaultHighlightsEn[i-1].desc
            });
        }

        const showPrices = await this.db.get('settings', 'show_prices');
        const showHomeVideo = await this.db.get('settings', 'show_home_video');

        const seoTitle = await this.db.get('settings', 'seo_title');
        const seoDesc = await this.db.get('settings', 'seo_desc');

        // Contact and Social Settings
        const contactTitleTh = await this.db.get('settings', 'contact_title_th');
        const contactTitleEn = await this.db.get('settings', 'contact_title_en');
        const contactDescTh = await this.db.get('settings', 'contact_description_th');
        const contactDescEn = await this.db.get('settings', 'contact_description_en');
        const googleMapsUrl = await this.db.get('settings', 'google_maps_url');
        const googleMapsEmbedUrl = await this.db.get('settings', 'google_maps_embed_url');
        const lineUrl = await this.db.get('settings', 'line_url');
        const lineQrImage = await this.db.get('settings', 'line_qr_image');
        
        const contactVisible = await this.db.get('settings', 'contact_visible');
        const lineQrVisible = await this.db.get('settings', 'line_qr_visible');
        const facebookUrl = await this.db.get('settings', 'facebook_url');
        const facebookVisible = await this.db.get('settings', 'facebook_visible');
        const instagramUrl = await this.db.get('settings', 'instagram_url');
        const instagramVisible = await this.db.get('settings', 'instagram_visible');
        const tiktokUrl = await this.db.get('settings', 'tiktok_url');
        const tiktokVisible = await this.db.get('settings', 'tiktok_visible');
        const youtubeUrl = await this.db.get('settings', 'youtube_url');
        const youtubeVisible = await this.db.get('settings', 'youtube_visible');
        const lineVisible = await this.db.get('settings', 'line_visible');

        const fbConfig = await this.db.getLocalSetting('firebase_config');
        const fbConfigText = fbConfig ? JSON.stringify(fbConfig, null, 2) : '';

        container.innerHTML = `
            <div class="grid-2">
                <!-- Left Column: Forms -->
                <div style="display:flex; flex-direction:column; gap:24px;">
                    <!-- General Settings Form -->
                    <div class="admin-card">
                        <h3 style="font-size:1.1rem; font-weight:700; color:var(--secondary); margin-bottom:16px; border-bottom:1.5px solid var(--border-color); padding-bottom:8px;"><i class="fas fa-store"></i> ข้อมูลหน้าร้านและบริษัท (General Settings)</h3>
                        
                        <form id="store-settings-form">
                            <div style="display:flex; flex-direction:column; gap:12px;">
                                <div class="form-group" style="margin-bottom:12px;">
                                    <label style="font-weight:600; font-size:0.85rem; color:var(--secondary);">โลโก้ร้านค้าหลัก (Logo Image)</label>
                                    <div style="display:flex; gap:16px; align-items:center; margin-top:8px;">
                                        <div id="set-logo-drop-zone" style="width:72px; height:72px; border-radius:50%; border:2px dashed var(--border-color); background:var(--bg-sec); display:flex; align-items:center; justify-content:center; overflow:hidden; cursor:pointer; position:relative; transition:all 0.3s ease;">
                                            ${logoImg?.value ? `<img src="${logoImg.value}" id="set-logo-preview" style="width:100%; height:100%; object-fit:contain;">` : `<i class="fas fa-image" style="color:var(--text-muted); font-size:1.2rem;"></i>`}
                                            <div id="set-logo-drag-overlay" style="position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(255,107,0,0.15); display:none; align-items:center; justify-content:center; color:var(--primary); font-size:0.75rem; font-weight:700;"><i class="fas fa-cloud-upload-alt"></i></div>
                                        </div>
                                        <div style="display:flex; flex-direction:column; gap:6px;">
                                            <div style="display:flex; gap:6px;">
                                                <button type="button" class="btn btn-outline" id="set-logo-uploader-btn" style="padding:4px 10px; font-size:0.72rem;"><i class="fas fa-upload"></i> อัปโหลดรูป</button>
                                                <button type="button" class="btn btn-outline" id="set-logo-library-btn" style="padding:4px 10px; font-size:0.72rem; border-color:var(--secondary); color:var(--secondary);"><i class="fas fa-folder-open"></i> เลือกจากคลัง</button>
                                                ${logoImg?.value ? `<button type="button" class="btn btn-outline" id="set-logo-clear-btn" style="padding:4px 10px; font-size:0.72rem; border-color:var(--danger); color:var(--danger);"><i class="fas fa-times"></i> ล้างค่า</button>` : ''}
                                            </div>
                                            <span style="font-size:0.68rem; color:var(--text-muted);">ลากรูปมาวางในวงกลม หรือกดปุ่มด้านบน</span>
                                        </div>
                                    </div>
                                    <input type="file" id="set-logo-file-input" accept="image/*" style="display:none;">
                                    <input type="hidden" id="set-logo-img-src" value="${logoImg?.value || ''}">
                                </div>

                                <div class="form-group" style="margin-top:16px; border-bottom:1px solid var(--border-color); padding-bottom:16px;">
                                    <label style="font-weight:600; font-size:0.85rem;">รูปภาพแนะนำบริษัท (About Image) <span style="font-size:0.75rem; color:var(--text-muted); font-weight:normal;">(สำหรับแสดงในหน้าแรกและหน้าเกี่ยวกับเรา)</span></label>
                                    <div style="display:flex; gap:16px; align-items:center; margin-top:8px;">
                                        <div id="set-about-drop-zone" style="width:120px; height:80px; border-radius:var(--radius-sm); border:2px dashed var(--border-color); background:var(--bg-sec); display:flex; align-items:center; justify-content:center; overflow:hidden; cursor:pointer; position:relative; transition:all 0.3s ease;">
                                            ${aboutImage?.value ? `<img src="${aboutImage.value}" id="set-about-preview" style="width:100%; height:100%; object-fit:cover;">` : `<i class="fas fa-image" style="color:var(--text-muted); font-size:1.5rem;"></i>`}
                                            <div id="set-about-drag-overlay" style="position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(255,107,0,0.15); display:none; align-items:center; justify-content:center; color:var(--primary); font-size:0.75rem; font-weight:700;"><i class="fas fa-cloud-upload-alt"></i></div>
                                        </div>
                                        <div style="display:flex; flex-direction:column; gap:6px;">
                                            <div style="display:flex; gap:6px;">
                                                <button type="button" class="btn btn-outline" id="set-about-uploader-btn" style="padding:4px 10px; font-size:0.72rem;"><i class="fas fa-upload"></i> อัปโหลดรูป</button>
                                                <button type="button" class="btn btn-outline" id="set-about-library-btn" style="padding:4px 10px; font-size:0.72rem; border-color:var(--secondary); color:var(--secondary);"><i class="fas fa-folder-open"></i> เลือกจากคลัง</button>
                                                ${aboutImage?.value ? `<button type="button" class="btn btn-outline" id="set-about-clear-btn" style="padding:4px 10px; font-size:0.72rem; border-color:var(--danger); color:var(--danger);"><i class="fas fa-times"></i> ล้างค่า</button>` : ''}
                                            </div>
                                            <span style="font-size:0.68rem; color:var(--text-muted);">ลากรูปมาวางในกรอบ หรือกดปุ่มด้านบน (เซฟเฉพาะลิงก์ภาพ ห้ามเซฟ Base64)</span>
                                        </div>
                                    </div>
                                    <input type="file" id="set-about-file-input" accept="image/*" style="display:none;">
                                    <input type="hidden" id="set-about-img-src" value="${aboutImage?.value || ''}">
                                </div>

                                <div class="form-group">
                                    <label style="font-weight:600; font-size:0.85rem;">ชื่อบริษัทภาษาไทย (Company Name TH)</label>
                                    <input type="text" id="set-company-name-th" class="form-control" value="${compNameTh?.value || ''}">
                                </div>
                                <div class="form-group">
                                    <label style="font-weight:600; font-size:0.85rem;">ชื่อบริษัทภาษาอังกฤษ (Company Name EN)</label>
                                    <input type="text" id="set-company-name-en" class="form-control" value="${compNameEn?.value || ''}">
                                </div>
                                <div class="form-group">
                                    <label style="font-weight:600; font-size:0.85rem;">หัวข้อหน้าเกี่ยวกับเราภาษาไทย (About Title TH)</label>
                                    <input type="text" id="set-about-title-th" class="form-control" value="${aboutTitleTh?.value || ''}">
                                </div>
                                <div class="form-group">
                                    <label style="font-weight:600; font-size:0.85rem;">หัวข้อหน้าเกี่ยวกับเราภาษาอังกฤษ (About Title EN)</label>
                                    <input type="text" id="set-about-title-en" class="form-control" value="${aboutTitleEn?.value || ''}">
                                </div>
                                <div class="form-group">
                                    <label style="font-weight:600; font-size:0.85rem;">รายละเอียดหน้าเกี่ยวกับเราภาษาไทย (About Desc TH)</label>
                                    <textarea id="set-about-desc-th" class="form-control" style="min-height:70px;">${aboutDescTh?.value || ''}</textarea>
                                </div>
                                <div class="form-group">
                                    <label style="font-weight:600; font-size:0.85rem;">รายละเอียดหน้าเกี่ยวกับเราภาษาอังกฤษ (About Desc EN)</label>
                                    <textarea id="set-about-desc-en" class="form-control" style="min-height:70px;">${aboutDescEn?.value || ''}</textarea>
                                </div>
                                <div class="form-group">
                                    <label style="font-weight:600; font-size:0.85rem;">จุดเด่นบริษัทย่อภาษาไทย (1 บรรทัดต่อข้อ) (About Bullets TH)</label>
                                    <textarea id="set-about-bullets-th" class="form-control" style="min-height:70px;" placeholder="ผลิตตามสั่ง&#10;รองรับร้านกาแฟ&#10;ส่งฟรีพื้นที่บริการ&#10;มีทีมออกแบบ">${aboutBulletsTh?.value || ''}</textarea>
                                </div>
                                <div class="form-group">
                                    <label style="font-weight:600; font-size:0.85rem;">จุดเด่นบริษัทย่อภาษาอังกฤษ (1 บรรทัดต่อข้อ) (About Bullets EN)</label>
                                    <textarea id="set-about-bullets-en" class="form-control" style="min-height:70px;" placeholder="Custom production&#10;Supporting cafe businesses&#10;Free shipping in service area&#10;In-house design team">${aboutBulletsEn?.value || ''}</textarea>
                                </div>

                                <!-- Phase A1: About Company Gallery Panel (Max 4 Images) -->
                                <div class="form-group" style="margin-top:16px; border-top:1px dashed var(--border-color); padding-top:16px;">
                                    <label style="font-weight:700; font-size:0.9rem; color:var(--primary); display:block; margin-bottom:4px;">
                                        <i class="fas fa-images" style="color:var(--secondary); margin-right:6px;"></i> แกลเลอรีเกี่ยวกับบริษัท (สูงสุด 4 ภาพ)
                                    </label>
                                    <p style="font-size:0.75rem; color:var(--text-sec); margin-bottom:12px;">
                                        แสดงในหน้าเกี่ยวกับเรา (About Us) ใต้รายละเอียดบริษัท แนะนำภาพบรรยากาศโรงงาน กระบวนการผลิต หรือการทำงาน
                                    </p>

                                    <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:12px;" id="about-gallery-grid-box">
                                        ${[0, 1, 2, 3].map(idx => {
                                            const imgVal = aboutGalleryList[idx] || '';
                                            return `
                                                <div class="about-gallery-slot-box" style="background:var(--bg-sec); padding:12px; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
                                                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                                                        <span style="font-weight:700; font-size:0.8rem; color:var(--primary);">ภาพที่ ${idx + 1}</span>
                                                        ${imgVal ? `
                                                            <button type="button" class="btn btn-outline" onclick="window.removeAboutGalleryImg(${idx})" style="padding:2px 8px; font-size:0.7rem; color:var(--danger); border-color:var(--danger);" aria-label="ลบภาพที่ ${idx + 1}">
                                                                <i class="fas fa-trash"></i> ลบรูป
                                                            </button>
                                                        ` : ''}
                                                    </div>

                                                    <div style="text-align:center; margin-bottom:8px;">
                                                        ${imgVal ? `
                                                            <img src="${imgVal}" id="about-gal-preview-${idx}" style="width:100%; height:90px; object-fit:cover; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
                                                        ` : `
                                                            <div id="about-gal-empty-${idx}" style="height:90px; background:var(--bg-main); border:1px dashed var(--border-color); border-radius:var(--radius-sm); display:flex; align-items:center; justify-content:center; flex-direction:column; gap:4px; color:var(--text-muted); font-size:0.75rem;">
                                                                <i class="fas fa-image" style="font-size:1.2rem;"></i>
                                                                <span>ยังไม่ได้เลือกรูปภาพ</span>
                                                            </div>
                                                        `}
                                                    </div>

                                                    <div style="display:flex; gap:6px;">
                                                        <input type="file" id="about-gal-file-${idx}" accept="image/*" style="display:none;" onchange="window.uploadAboutGalleryFile(${idx}, this)">
                                                        <button type="button" class="btn btn-outline" onclick="document.getElementById('about-gal-file-${idx}').click()" style="padding:4px 8px; font-size:0.72rem; flex:1;">
                                                            <i class="fas fa-upload"></i> อัปโหลด
                                                        </button>
                                                        <button type="button" class="btn btn-outline" onclick="window.selectAboutGalleryMedia(${idx})" style="padding:4px 8px; font-size:0.72rem; flex:1; border-color:var(--secondary); color:var(--secondary);">
                                                            <i class="fas fa-folder-open"></i> คลังภาพ
                                                        </button>
                                                    </div>
                                                </div>
                                            `;
                                        }).join('')}
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label style="font-weight:600; font-size:0.85rem;">SEO Title (หัวข้อเว็บแสดงบนเบราว์เซอร์)</label>
                                    <input type="text" id="set-seo-title" class="form-control" value="${seoTitle?.value || ''}">
                                </div>
                                <div class="form-group">
                                    <label style="font-weight:600; font-size:0.85rem;">SEO Description (รายละเอียดสั้นแนะนำเว็บ)</label>
                                    <textarea id="set-seo-desc" class="form-control" style="min-height:70px;">${seoDesc?.value || ''}</textarea>
                                </div>
                                <div class="form-group" style="flex-direction:row; justify-content:space-between; align-items:center; background:var(--bg-sec); padding:10px; border-radius:var(--radius-sm);">
                                    <label style="font-weight:700; font-size:0.85rem; color:var(--secondary); cursor:pointer;" for="set-show-video">แสดงผลส่วนวิดีโอแนะนำในหน้าแรก (2 คลิป)</label>
                                    <input type="checkbox" id="set-show-video" style="width:20px; height:20px; cursor:pointer;" ${showHomeVideo?.value === 'true' ? 'checked' : ''}>
                                </div>
                            </div>
                        </form>
                    </div>

                    <!-- Contact & Maps Settings Form -->
                    <div class="admin-card">
                        <h3 style="font-size:1.1rem; font-weight:700; color:var(--secondary); margin-bottom:16px; border-bottom:1.5px solid var(--border-color); padding-bottom:8px;"><i class="fas fa-map-marked-alt"></i> ข้อมูลการติดต่อและแผนที่ (Contact & Map Settings)</h3>
                        
                        <div style="display:flex; flex-direction:column; gap:12px;">
                            <div class="form-group" style="flex-direction:row; align-items:center; gap:8px; background:var(--bg-sec); padding:10px; border-radius:var(--radius-sm);">
                                <input type="checkbox" id="set-contact-visible" style="width:20px; height:20px; cursor:pointer;" ${contactVisible?.value !== 'false' ? 'checked' : ''}>
                                <label for="set-contact-visible" style="font-weight:700; font-size:0.85rem; cursor:pointer; margin-bottom:0;">แสดงผลเซกชันการติดต่อในหน้าแรกและหน้าย่อย (Contact Section Visible)</label>
                            </div>
                            
                            <div class="form-group">
                                <label style="font-weight:600; font-size:0.85rem;">หัวข้อเซกชันภาษาไทย (Contact Title TH)</label>
                                <input type="text" id="set-contact-title-th" class="form-control" value="${contactTitleTh?.value || ''}">
                            </div>
                            <div class="form-group">
                                <label style="font-weight:600; font-size:0.85rem;">หัวข้อเซกชันภาษาอังกฤษ (Contact Title EN)</label>
                                <input type="text" id="set-contact-title-en" class="form-control" value="${contactTitleEn?.value || ''}">
                            </div>
                            <div class="form-group">
                                <label style="font-weight:600; font-size:0.85rem;">คำอธิบายเซกชันภาษาไทย (Contact Description TH)</label>
                                <textarea id="set-contact-desc-th" class="form-control" style="min-height:50px;">${contactDescTh?.value || ''}</textarea>
                            </div>
                            <div class="form-group">
                                <label style="font-weight:600; font-size:0.85rem;">คำอธิบายเซกชันภาษาอังกฤษ (Contact Description EN)</label>
                                <textarea id="set-contact-desc-en" class="form-control" style="min-height:50px;">${contactDescEn?.value || ''}</textarea>
                            </div>
                            
                            <div class="form-group">
                                <label style="font-weight:600; font-size:0.85rem;">เบอร์โทรศัพท์ร้าน (Phone)</label>
                                <input type="text" id="set-phone" class="form-control" value="${phone?.value || ''}">
                            </div>
                            <div class="form-group">
                                <label style="font-weight:600; font-size:0.85rem;">อีเมลร้าน (Email)</label>
                                <input type="email" id="set-email" class="form-control" value="${email?.value || ''}">
                            </div>
                            
                            <div class="form-group">
                                <label style="font-weight:600; font-size:0.85rem;">ที่อยู่ภาษาไทย (Address TH)</label>
                                <textarea id="set-address-th" class="form-control" style="min-height:60px;">${addressTh?.value || ''}</textarea>
                            </div>
                            <div class="form-group">
                                <label style="font-weight:600; font-size:0.85rem;">ที่อยู่ภาษาอังกฤษ (Address EN)</label>
                                <textarea id="set-address-en" class="form-control" style="min-height:60px;">${addressEn?.value || ''}</textarea>
                            </div>
                            
                            <div class="form-group">
                                <label style="font-weight:600; font-size:0.85rem;">เวลาเปิดทำการภาษาไทย (Hours TH)</label>
                                <input type="text" id="set-hours-th" class="form-control" value="${hoursTh?.value || ''}">
                            </div>
                            <div class="form-group">
                                <label style="font-weight:600; font-size:0.85rem;">เวลาเปิดทำการภาษาอังกฤษ (Hours EN)</label>
                                <input type="text" id="set-hours-en" class="form-control" value="${hoursEn?.value || ''}">
                            </div>

                            <div class="form-group">
                                <label style="font-weight:600; font-size:0.85rem;">ลิงก์ตำแหน่ง Google Maps (google_maps_url)</label>
                                <input type="text" id="set-maps-url" class="form-control" value="${googleMapsUrl?.value || ''}">
                            </div>
                            <div class="form-group">
                                <label style="font-weight:600; font-size:0.85rem;">ลิงก์แผนที่ฝัง HTML Embed (google_maps_embed_url)</label>
                                <input type="text" id="set-maps-embed-url" class="form-control" value="${googleMapsEmbedUrl?.value || ''}" placeholder="https://www.google.com/maps?q=...&output=embed">
                            </div>
                        </div>
                    </div>

                    <!-- Social Media Links Settings Form -->
                    <div class="admin-card">
                        <h3 style="font-size:1.1rem; font-weight:700; color:var(--secondary); margin-bottom:16px; border-bottom:1.5px solid var(--border-color); padding-bottom:8px;"><i class="fas fa-share-alt"></i> ช่องทางโซเชียลมีเดีย (Social Media & LINE QR)</h3>
                        
                        <div style="display:flex; flex-direction:column; gap:16px;">
                            <!-- Facebook -->
                            <div style="background:var(--bg-sec); padding:12px; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                                    <strong style="font-size:0.85rem; color:var(--primary);"><i class="fab fa-facebook-square"></i> Facebook Page URL</strong>
                                    <label style="cursor:pointer; font-size:0.8rem; font-weight:700; display:inline-flex; align-items:center; gap:4px;">
                                        <input type="checkbox" id="set-facebook-visible" style="width:16px; height:16px;" ${facebookVisible?.value !== 'false' ? 'checked' : ''}> แสดงหน้าเว็บ
                                    </label>
                                </div>
                                <input type="text" id="set-facebook-url" class="form-control" value="${facebookUrl?.value || ''}">
                                <!-- Keep compatibility settings key 'facebook' -->
                                <input type="hidden" id="set-facebook" value="${facebook?.value || ''}">
                            </div>

                            <!-- Instagram -->
                            <div style="background:var(--bg-sec); padding:12px; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                                    <strong style="font-size:0.85rem; color:var(--primary);"><i class="fab fa-instagram"></i> Instagram URL</strong>
                                    <label style="cursor:pointer; font-size:0.8rem; font-weight:700; display:inline-flex; align-items:center; gap:4px;">
                                        <input type="checkbox" id="set-instagram-visible" style="width:16px; height:16px;" ${instagramVisible?.value === 'true' ? 'checked' : ''}> แสดงหน้าเว็บ
                                    </label>
                                </div>
                                <input type="text" id="set-instagram-url" class="form-control" value="${instagramUrl?.value || ''}">
                            </div>

                            <!-- TikTok -->
                            <div style="background:var(--bg-sec); padding:12px; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                                    <strong style="font-size:0.85rem; color:var(--primary);"><i class="fab fa-tiktok"></i> TikTok URL</strong>
                                    <label style="cursor:pointer; font-size:0.8rem; font-weight:700; display:inline-flex; align-items:center; gap:4px;">
                                        <input type="checkbox" id="set-tiktok-visible" style="width:16px; height:16px;" ${tiktokVisible?.value === 'true' ? 'checked' : ''}> แสดงหน้าเว็บ
                                    </label>
                                </div>
                                <input type="text" id="set-tiktok-url" class="form-control" value="${tiktokUrl?.value || ''}">
                            </div>

                            <!-- YouTube -->
                            <div style="background:var(--bg-sec); padding:12px; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                                    <strong style="font-size:0.85rem; color:var(--primary);"><i class="fab fa-youtube"></i> YouTube Channel URL</strong>
                                    <label style="cursor:pointer; font-size:0.8rem; font-weight:700; display:inline-flex; align-items:center; gap:4px;">
                                        <input type="checkbox" id="set-youtube-visible" style="width:16px; height:16px;" ${youtubeVisible?.value === 'true' ? 'checked' : ''}> แสดงหน้าเว็บ
                                    </label>
                                </div>
                                <input type="text" id="set-youtube-url" class="form-control" value="${youtubeUrl?.value || ''}">
                            </div>

                            <!-- LINE Link -->
                            <div style="background:var(--bg-sec); padding:12px; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                                    <strong style="font-size:0.85rem; color:var(--primary);"><i class="fab fa-line"></i> LINE URL</strong>
                                    <label style="cursor:pointer; font-size:0.8rem; font-weight:700; display:inline-flex; align-items:center; gap:4px;">
                                        <input type="checkbox" id="set-line-visible" style="width:16px; height:16px;" ${lineVisible?.value !== 'false' ? 'checked' : ''}> แสดงหน้าเว็บ
                                    </label>
                                </div>
                                <input type="text" id="set-line-url" class="form-control" value="${lineUrl?.value || ''}">
                                <!-- Keep compatibility settings key 'line' -->
                                <input type="hidden" id="set-line" value="${line?.value || ''}">
                            </div>

                            <!-- LINE QR Image Selector -->
                            <div style="background:var(--bg-sec); padding:12px; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                                    <strong style="font-size:0.85rem; color:var(--primary);"><i class="fas fa-qrcode"></i> LINE QR Code Image</strong>
                                    <label style="cursor:pointer; font-size:0.8rem; font-weight:700; display:inline-flex; align-items:center; gap:4px;">
                                        <input type="checkbox" id="set-line-qr-visible" style="width:16px; height:16px;" ${lineQrVisible?.value !== 'false' ? 'checked' : ''}> แสดงหน้าเว็บ
                                    </label>
                                </div>
                                <div style="display:flex; gap:16px; align-items:center; margin-top:8px;">
                                    <div id="set-line-qr-zone" style="width:72px; height:72px; border-radius:var(--radius-sm); border:2px dashed var(--border-color); background:var(--bg-main); display:flex; align-items:center; justify-content:center; overflow:hidden; cursor:pointer; position:relative;">
                                        ${lineQrImage?.value ? `<img src="${lineQrImage.value}" id="set-line-qr-preview" style="width:100%; height:100%; object-fit:contain;">` : `<i class="fas fa-qrcode" style="color:var(--text-muted); font-size:1.5rem;"></i>`}
                                    </div>
                                    <div style="display:flex; flex-direction:column; gap:6px;">
                                        <div style="display:flex; gap:6px;">
                                            <button type="button" class="btn btn-outline" id="set-line-qr-uploader-btn" style="padding:4px 10px; font-size:0.72rem;"><i class="fas fa-upload"></i> อัปโหลดรูป</button>
                                            <button type="button" class="btn btn-outline" id="set-line-qr-library-btn" style="padding:4px 10px; font-size:0.72rem; border-color:var(--secondary); color:var(--secondary);"><i class="fas fa-folder-open"></i> เลือกจากคลัง</button>
                                            ${lineQrImage?.value ? `<button type="button" class="btn btn-outline" id="set-line-qr-clear-btn" style="padding:4px 10px; font-size:0.72rem; border-color:var(--danger); color:var(--danger);"><i class="fas fa-times"></i> ลบภาพ</button>` : ''}
                                        </div>
                                    </div>
                                </div>
                                <input type="file" id="set-line-qr-file-input" accept="image/*" style="display:none;">
                                <input type="hidden" id="set-line-qr-img-src" value="${lineQrImage?.value || ''}">
                            </div>
                        </div>
                    </div>

                    <div style="margin-top:16px; padding:0 12px;">
                        <button type="button" id="master-save-btn" class="btn btn-primary" style="padding:12px 24px; font-size:1rem; width:100%;"><i class="fas fa-save"></i> บันทึกการตั้งค่าทั้งหมด (Save All Settings)</button>
                    </div>
                </div>
                
                <!-- Right Column: System Config (Firebase & Database Backup) -->
                <div>
                    <!-- Custom Firebase Config Panel -->
                    <div class="admin-card">
                        <h3 style="font-size:1.1rem; font-weight:700; color:var(--secondary); margin-bottom:16px; border-bottom:1.5px solid var(--border-color); padding-bottom:8px;"><i class="fas fa-cloud"></i> เชื่อมต่อระบบ Firebase Cloud </h3>
                        <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:16px; line-height:1.5;">วางโครงสร้าง Firebase Web Config JSON ของท่านเพื่อเชื่อมต่อฐานข้อมูลออนไลน์ได้ทันที:</p>
                        
                        <form id="firebase-settings-form">
                            <div style="display:flex; flex-direction:column; gap:12px;">
                                <div class="form-group">
                                    <label style="font-weight:600; font-size:0.85rem;">Firebase Config Web JSON</label>
                                    <textarea id="set-firebase-config" class="form-control" style="min-height:120px; font-family:monospace; font-size:0.75rem;" placeholder='{\n  "apiKey": "...",\n  "authDomain": "...",\n  "projectId": "...",\n  ...}'></textarea>
                                </div>
                                <div style="display:flex; gap:12px;">
                                    <button type="submit" class="btn btn-secondary" style="padding:10px 16px; font-size:0.82rem; flex-grow:1;"><i class="fas fa-link"></i> บันทึก & เปิดเชื่อมคลาวด์</button>
                                    <button type="button" class="btn btn-outline" id="disconnect-fb-btn" style="border-color:var(--danger); color:var(--danger); padding:10px 12px; font-size:0.82rem;"><i class="fas fa-unlink"></i> ยกเลิกเชื่อมต่อ</button>
                                </div>
                            </div>
                        </form>
                        
                        ${this.db.isCloudEnabled ? `
                            <div style="background-color:var(--primary-light); border:1px solid rgba(255, 107, 0, 0.2); border-radius:var(--radius-md); padding:16px; margin-top:20px; text-align:center;">
                                <strong style="color:var(--primary); font-size:0.9rem; display:block; margin-bottom:6px;"><i class="fas fa-database"></i> อพยพย้ายข้อมูลขึ้นคลาวด์ตัวใหม่</strong>
                                <p style="font-size:0.78rem; color:var(--text-main); margin-bottom:12px;">ส่งรายการสินค้า, ผลงานสกรีน, และประวัติการตั้งค่าทั้งหมดที่เก็บสะสมอยู่ในคอมพิวเตอร์เครื่องนี้ คัดลอกส่งขึ้นคลาวด์ Firebase Firestore ใหม่ทันที</p>
                                <button class="btn btn-primary" id="sync-migration-btn" style="font-size:0.8rem; padding:8px 16px;"><i class="fas fa-cloud-upload-alt"></i> ซิงก์ข้อมูลจากเครื่องขึ้นคลาวด์</button>
                            </div>
                        ` : ''}
                    </div>

                    <!-- Backup & Restore Panel -->
                    <div class="admin-card">
                        <h3 style="font-size:1.1rem; font-weight:700; color:var(--secondary); margin-bottom:16px; border-bottom:1.5px solid var(--border-color); padding-bottom:8px;"><i class="fas fa-file-download"></i> สำรองข้อมูลร้านและกู้คืน (Backup JSON)</h3>
                        <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:16px; line-height:1.5;">สำรองข้อมูลสินค้าและผลงานสกรีนในเครื่องของคุณออกมาเป็นไฟล์นามสกุล .json ดาวน์โหลดเก็บไว้ หรือใช้สำหรับดึงข้อมูลคืนได้ทุกเมื่อ</p>
                        
                        <div style="display:flex; gap:12px;">
                            <button class="btn btn-outline" id="export-db-btn" style="padding:10px 16px; font-size:0.82rem; flex-grow:1; border-color:var(--success); color:var(--success);"><i class="fas fa-download"></i> 1. ส่งออกข้อมูล (Backup)</button>
                            <button class="btn btn-outline" id="import-db-btn" style="padding:10px 16px; font-size:0.82rem; flex-grow:1;"><i class="fas fa-upload"></i> 2. นำเข้าข้อมูล (Restore)</button>
                        </div>
                        <input type="file" id="import-file-selector" accept=".json" style="display:none;">
                    </div>
                </div>
            </div>
        `;

        const configTextarea = document.getElementById('set-firebase-config');
        if (configTextarea) {
            configTextarea.value = fbConfigText;
        }

        // --- Logo Drag and Drop / Library picker bindings ---
        const logoDropZone = document.getElementById('set-logo-drop-zone');
        const logoFileInput = document.getElementById('set-logo-file-input');
        const logoImgSrcInput = document.getElementById('set-logo-img-src');
        const logoDragOverlay = document.getElementById('set-logo-drag-overlay');

        if (logoDropZone) {
            logoDropZone.onclick = (e) => {
                if (e.target.tagName !== 'BUTTON' && e.target.parentElement.tagName !== 'BUTTON') {
                    logoFileInput.click();
                }
            };

            logoDropZone.ondragover = (e) => {
                e.preventDefault();
                logoDragOverlay.style.display = 'flex';
            };

            logoDropZone.ondragleave = (e) => {
                e.preventDefault();
                logoDragOverlay.style.display = 'none';
            };

            logoDropZone.ondrop = async (e) => {
                e.preventDefault();
                logoDragOverlay.style.display = 'none';

                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    const file = e.dataTransfer.files[0];
                    if (file.type.startsWith('image/')) {
                        const base64 = await this.convertImageToWebP(file);
                        
                        const newMedia = {
                            id: 'med_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                            name: 'logo_' + file.name.substring(0, file.name.lastIndexOf('.')) + '.webp',
                            category: 'med-logo',
                            image_src: base64,
                            created_at: new Date().toISOString()
                        };
                        await this.db.put('media', newMedia);

                        logoImgSrcInput.value = base64;
                        document.getElementById('set-logo-preview').src = base64;
                        alert('อัปโหลดและอัปเดตโลโก้ร้านค้าสำเร็จ! (กดปุ่มบันทึกเพื่อบันทึกข้อมูลหน้าร้านหลัก)');
                    }
                }
            };
        }

        if (logoFileInput) {
            logoFileInput.onchange = async (e) => {
                if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    const base64 = await this.convertImageToWebP(file);

                    const newMedia = {
                        id: 'med_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                        name: 'logo_' + file.name.substring(0, file.name.lastIndexOf('.')) + '.webp',
                        category: 'med-logo',
                        image_src: base64,
                        created_at: new Date().toISOString()
                    };
                    await this.db.put('media', newMedia);

                    logoImgSrcInput.value = base64;
                    document.getElementById('set-logo-preview').src = base64;
                    alert('อัปโหลดและอัปเดตโลโก้ร้านค้าสำเร็จ! (กดปุ่มบันทึกเพื่อบันทึกข้อมูลหน้าร้านหลัก)');
                }
            };
        }

        const setLogoUploaderBtn = document.getElementById('set-logo-uploader-btn');
        if (setLogoUploaderBtn) {
            setLogoUploaderBtn.onclick = () => logoFileInput.click();
        }

        const setLogoLibraryBtn = document.getElementById('set-logo-library-btn');
        if (setLogoLibraryBtn) {
            setLogoLibraryBtn.onclick = () => {
                this.openMediaSelectorDialog((selectedBase64) => {
                    logoImgSrcInput.value = selectedBase64;
                    document.getElementById('set-logo-preview').src = selectedBase64;
                    alert('เลือกโลโก้ร้านค้าจากคลังสำเร็จ! (กดปุ่มบันทึกเพื่อบันทึกข้อมูลหน้าร้านหลัก)');
                });
            };
        }

        const setLogoClearBtn = document.getElementById('set-logo-clear-btn');
        if (setLogoClearBtn) {
            setLogoClearBtn.onclick = () => {
                if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบภาพโลโก้ร้านค้าหลักออก?')) {
                    logoImgSrcInput.value = '';
                    logoDropZone.innerHTML = `<i class="fas fa-image" style="color:var(--text-muted); font-size:1.2rem;"></i>`;
                    alert('ล้างภาพโลโก้แล้ว (กดปุ่มบันทึกเพื่อบันทึกข้อมูลหน้าร้านหลัก)');
                }
            };
        }

        // --- About Image Drag and Drop / Library picker bindings ---
        const aboutDropZone = document.getElementById('set-about-drop-zone');
        const aboutFileInput = document.getElementById('set-about-file-input');
        const aboutImgSrcInput = document.getElementById('set-about-img-src');
        const aboutDragOverlay = document.getElementById('set-about-drag-overlay');

        if (aboutDropZone) {
            aboutDropZone.onclick = (e) => {
                if (e.target.tagName !== 'BUTTON' && e.target.parentElement.tagName !== 'BUTTON') {
                    aboutFileInput.click();
                }
            };

            aboutDropZone.ondragover = (e) => {
                e.preventDefault();
                if (aboutDragOverlay) aboutDragOverlay.style.display = 'flex';
            };

            aboutDropZone.ondragleave = (e) => {
                e.preventDefault();
                if (aboutDragOverlay) aboutDragOverlay.style.display = 'none';
            };

            aboutDropZone.ondrop = async (e) => {
                e.preventDefault();
                if (aboutDragOverlay) aboutDragOverlay.style.display = 'none';

                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    const file = e.dataTransfer.files[0];
                    if (file.type.startsWith('image/')) {
                        const base64 = await this.convertImageToWebP(file);
                        const filename = 'about_' + Date.now() + '_' + file.name.substring(0, file.name.lastIndexOf('.')) + '.webp';
                        const newMedia = {
                            id: 'med_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                            name: filename,
                            category: 'med-about',
                            image_src: base64,
                            created_at: new Date().toISOString()
                        };
                        await this.db.put('media', newMedia);

                        aboutImgSrcInput.value = filename;
                        const preview = document.getElementById('set-about-preview');
                        if (preview) {
                            preview.src = base64;
                        } else {
                            aboutDropZone.innerHTML = `<img src="${base64}" id="set-about-preview" style="width:100%; height:100%; object-fit:cover;">`;
                        }
                        alert('อัปโหลดและอัปเดตรูปหน้าเกี่ยวกับเราสำเร็จ! (กดปุ่มบันทึกเพื่อบันทึกข้อมูล)');
                    }
                }
            };
        }

        if (aboutFileInput) {
            aboutFileInput.onchange = async (e) => {
                if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    const base64 = await this.convertImageToWebP(file);
                    const filename = 'about_' + Date.now() + '_' + file.name.substring(0, file.name.lastIndexOf('.')) + '.webp';
                    const newMedia = {
                        id: 'med_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                        name: filename,
                        category: 'med-about',
                        image_src: base64,
                        created_at: new Date().toISOString()
                    };
                    await this.db.put('media', newMedia);

                    aboutImgSrcInput.value = filename;
                    const preview = document.getElementById('set-about-preview');
                    if (preview) {
                        preview.src = base64;
                    } else {
                        aboutDropZone.innerHTML = `<img src="${base64}" id="set-about-preview" style="width:100%; height:100%; object-fit:cover;">`;
                    }
                    alert('อัปโหลดและอัปเดตรูปหน้าเกี่ยวกับเราสำเร็จ! (กดปุ่มบันทึกเพื่อบันทึกข้อมูล)');
                }
            };
        }

        const setAboutUploaderBtn = document.getElementById('set-about-uploader-btn');
        if (setAboutUploaderBtn) {
            setAboutUploaderBtn.onclick = () => aboutFileInput.click();
        }

        const setAboutLibraryBtn = document.getElementById('set-about-library-btn');
        if (setAboutLibraryBtn) {
            setAboutLibraryBtn.onclick = () => {
                this.openMediaSelectorDialog((src, name) => {
                    aboutImgSrcInput.value = name || src;
                    const preview = document.getElementById('set-about-preview');
                    if (preview) {
                        preview.src = src;
                    } else {
                        aboutDropZone.innerHTML = `<img src="${src}" id="set-about-preview" style="width:100%; height:100%; object-fit:cover;">`;
                    }
                    alert('เลือกรูปภาพหน้าเกี่ยวกับเราสำเร็จ! (กดปุ่มบันทึกเพื่อบันทึกข้อมูล)');
                });
            };
        }

        const setAboutClearBtn = document.getElementById('set-about-clear-btn');
        if (setAboutClearBtn) {
            setAboutClearBtn.onclick = () => {
                if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรูปภาพหน้าเกี่ยวกับเราออก?')) {
                    aboutImgSrcInput.value = '';
                    aboutDropZone.innerHTML = `<i class="fas fa-image" style="color:var(--text-muted); font-size:1.5rem;"></i>`;
                    alert('ล้างรูปภาพเรียบร้อย (กดปุ่มบันทึกเพื่อบันทึกข้อมูล)');
                }
            };
        }

        // --- LINE QR image uploader & library selector bindings ---
        const lineQrZone = document.getElementById('set-line-qr-zone');
        const lineQrFileInput = document.getElementById('set-line-qr-file-input');
        const lineQrImgSrcInput = document.getElementById('set-line-qr-img-src');

        if (lineQrZone) {
            lineQrZone.onclick = (e) => {
                if (e.target.tagName !== 'BUTTON' && e.target.parentElement.tagName !== 'BUTTON') {
                    lineQrFileInput.click();
                }
            };
        }

        if (lineQrFileInput) {
            lineQrFileInput.onchange = async (e) => {
                if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    const base64 = await this.convertImageToWebP(file);

                    const newMedia = {
                        id: 'med_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                        name: 'line_qr_' + file.name.substring(0, file.name.lastIndexOf('.')) + '.webp',
                        category: 'med-logo',
                        image_src: base64,
                        created_at: new Date().toISOString()
                    };
                    await this.db.put('media', newMedia);

                    lineQrImgSrcInput.value = base64;
                    const preview = document.getElementById('set-line-qr-preview');
                    if (preview) {
                        preview.src = base64;
                    } else {
                        lineQrZone.innerHTML = `<img src="${base64}" id="set-line-qr-preview" style="width:100%; height:100%; object-fit:contain;">`;
                    }
                    alert('อัปโหลดและพรีวิวรูปภาพ LINE QR สำเร็จ (กดปุ่มบันทึกสีส้มด้านล่างสุดเพื่อบันทึกข้อมูล)');
                }
            };
        }

        const setLineQrUploaderBtn = document.getElementById('set-line-qr-uploader-btn');
        if (setLineQrUploaderBtn) {
            setLineQrUploaderBtn.onclick = () => lineQrFileInput.click();
        }

        const setLineQrLibraryBtn = document.getElementById('set-line-qr-library-btn');
        if (setLineQrLibraryBtn) {
            setLineQrLibraryBtn.onclick = () => {
                this.openMediaSelectorDialog((selectedBase64) => {
                    lineQrImgSrcInput.value = selectedBase64;
                    const preview = document.getElementById('set-line-qr-preview');
                    if (preview) {
                        preview.src = selectedBase64;
                    } else {
                        lineQrZone.innerHTML = `<img src="${selectedBase64}" id="set-line-qr-preview" style="width:100%; height:100%; object-fit:contain;">`;
                    }
                    alert('เลือกรูปภาพ LINE QR จากคลังสำเร็จ (กดปุ่มบันทึกสีส้มด้านล่างสุดเพื่อบันทึกข้อมูล)');
                });
            };
        }

        const setLineQrClearBtn = document.getElementById('set-line-qr-clear-btn');
        if (setLineQrClearBtn) {
            setLineQrClearBtn.onclick = () => {
                if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรูปภาพ LINE QR Code?')) {
                    lineQrImgSrcInput.value = '';
                    lineQrZone.innerHTML = `<i class="fas fa-qrcode" style="color:var(--text-muted); font-size:1.5rem;"></i>`;
                    alert('ล้างค่ารูปภาพ LINE QR แล้ว (กดปุ่มบันทึกสีส้มด้านล่างสุดเพื่อยืนยัน)');
                }
            };
        }

        // --- Phase A1: About Company Gallery Handlers ---
        window.selectAboutGalleryMedia = (idx) => {
            this.openMediaSelectorDialog((selectedBase64) => {
                if (!window.currentAboutGalleryImages) window.currentAboutGalleryImages = [];
                window.currentAboutGalleryImages[idx] = selectedBase64;
                window.renderAboutGalleryPreview(idx, selectedBase64);
            });
        };

        window.uploadAboutGalleryFile = async (idx, inputEl) => {
            if (inputEl.files && inputEl.files[0]) {
                const webpData = await this.convertImageToWebP(inputEl.files[0]);
                if (!window.currentAboutGalleryImages) window.currentAboutGalleryImages = [];
                window.currentAboutGalleryImages[idx] = webpData;
                window.renderAboutGalleryPreview(idx, webpData);
            }
        };

        window.removeAboutGalleryImg = (idx) => {
            if (window.currentAboutGalleryImages && window.currentAboutGalleryImages[idx] !== undefined) {
                window.currentAboutGalleryImages[idx] = '';
                window.renderAboutGalleryPreview(idx, '');
            }
        };

        window.renderAboutGalleryPreview = (idx, src) => {
            const boxes = document.querySelectorAll('.about-gallery-slot-box');
            if (!boxes || !boxes[idx]) return;
            const box = boxes[idx];
            const imgEl = box.querySelector('img');
            const emptyEl = box.querySelector('div[id^="about-gal-empty"]');
            const headerEl = box.querySelector('div');

            if (src) {
                if (imgEl) {
                    imgEl.src = src;
                    imgEl.style.display = 'block';
                } else if (emptyEl) {
                    emptyEl.outerHTML = `<img src="${src}" id="about-gal-preview-${idx}" style="width:100%; height:90px; object-fit:cover; border-radius:var(--radius-sm); border:1px solid var(--border-color);">`;
                }
                if (!headerEl.querySelector('.btn-outline[onclick*="removeAboutGalleryImg"]')) {
                    const rmBtn = document.createElement('button');
                    rmBtn.type = 'button';
                    rmBtn.className = 'btn btn-outline';
                    rmBtn.style = 'padding:2px 8px; font-size:0.7rem; color:var(--danger); border-color:var(--danger);';
                    rmBtn.setAttribute('aria-label', `ลบภาพที่ ${idx + 1}`);
                    rmBtn.onclick = () => window.removeAboutGalleryImg(idx);
                    rmBtn.innerHTML = `<i class="fas fa-trash"></i> ลบรูป`;
                    headerEl.appendChild(rmBtn);
                }
            } else {
                if (imgEl) {
                    imgEl.outerHTML = `
                        <div id="about-gal-empty-${idx}" style="height:90px; background:var(--bg-main); border:1px dashed var(--border-color); border-radius:var(--radius-sm); display:flex; align-items:center; justify-content:center; flex-direction:column; gap:4px; color:var(--text-muted); font-size:0.75rem;">
                            <i class="fas fa-image" style="font-size:1.2rem;"></i>
                            <span>ยังไม่ได้เลือกรูปภาพ</span>
                        </div>
                    `;
                }
                const rmBtn = headerEl.querySelector('.btn-outline[onclick*="removeAboutGalleryImg"]');
                if (rmBtn) rmBtn.remove();
            }
        };

        // --- Master Save Button Action ---
        const masterSaveBtn = document.getElementById('master-save-btn');
        if (masterSaveBtn) {
            masterSaveBtn.onclick = async () => {
                const originalHtml = masterSaveBtn.innerHTML;
                masterSaveBtn.disabled = true;
                masterSaveBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> กำลังบันทึก...`;

                const cleanGallery = (Array.isArray(window.currentAboutGalleryImages)
                    ? window.currentAboutGalleryImages
                    : [])
                    .map(item => typeof item === 'string' ? item.trim() : item)
                    .filter(Boolean)
                    .filter((item, index, arr) => arr.indexOf(item) === index)
                    .slice(0, 4);

                const galleryJson = JSON.stringify(cleanGallery);
                const galleryPayloadBytes = new Blob([galleryJson]).size;
                const MAX_GALLERY_BYTES = 850 * 1024; // 850 KB safe limit

                if (galleryPayloadBytes > MAX_GALLERY_BYTES) {
                    alert(`ขนาดไฟล์ภาพแกลเลอรีรวมกันใหญ่เกินกำหนด (${(galleryPayloadBytes / 1024).toFixed(1)} KB > 850 KB)\nกรุณาใช้รูปภาพขนาดเล็กลง หรือเลือกรูปภาพที่ผ่านการบีบอัดแล้วจากคลังสื่อ`);
                    masterSaveBtn.disabled = false;
                    masterSaveBtn.innerHTML = originalHtml;
                    return;
                }

                console.log('[About Gallery] Saving', {
                    count: cleanGallery.length,
                    payloadLength: galleryJson.length
                });

                const setObj = {
                    about_gallery_images: galleryJson,
                    logo_img: document.getElementById('set-logo-img-src')?.value || '',
                    company_name_th: document.getElementById('set-company-name-th')?.value || '',
                    company_name_en: document.getElementById('set-company-name-en')?.value || '',
                    about_eyebrow_th: document.getElementById('set-about-eyebrow-th')?.value || '',
                    about_eyebrow_en: document.getElementById('set-about-eyebrow-en')?.value || '',
                    about_title_th: document.getElementById('set-about-title-th')?.value || '',
                    about_title_en: document.getElementById('set-about-title-en')?.value || '',
                    about_desc_th: document.getElementById('set-about-desc-th')?.value || '',
                    about_desc_en: document.getElementById('set-about-desc-en')?.value || '',
                    about_cta_text_th: document.getElementById('set-about-cta-text-th')?.value || '',
                    about_cta_text_en: document.getElementById('set-about-cta-text-en')?.value || '',
                    about_cta_link: document.getElementById('set-about-cta-link')?.value || '#contact',
                    about_image: document.getElementById('set-about-img-src')?.value || '',
                    about_bullets_th: document.getElementById('set-about-bullets-th')?.value || '',
                    about_bullets_en: document.getElementById('set-about-bullets-en')?.value || '',

                    // 5 Highlight Cards keys
                    about_h1_icon: document.getElementById('set-about-h1-icon')?.value || '',
                    about_h1_title_th: document.getElementById('set-about-h1-title-th')?.value || '',
                    about_h1_title_en: document.getElementById('set-about-h1-title-en')?.value || '',
                    about_h1_desc_th: document.getElementById('set-about-h1-desc-th')?.value || '',
                    about_h1_desc_en: document.getElementById('set-about-h1-desc-en')?.value || '',

                    about_h2_icon: document.getElementById('set-about-h2-icon')?.value || '',
                    about_h2_title_th: document.getElementById('set-about-h2-title-th')?.value || '',
                    about_h2_title_en: document.getElementById('set-about-h2-title-en')?.value || '',
                    about_h2_desc_th: document.getElementById('set-about-h2-desc-th')?.value || '',
                    about_h2_desc_en: document.getElementById('set-about-h2-desc-en')?.value || '',

                    about_h3_icon: document.getElementById('set-about-h3-icon')?.value || '',
                    about_h3_title_th: document.getElementById('set-about-h3-title-th')?.value || '',
                    about_h3_title_en: document.getElementById('set-about-h3-title-en')?.value || '',
                    about_h3_desc_th: document.getElementById('set-about-h3-desc-th')?.value || '',
                    about_h3_desc_en: document.getElementById('set-about-h3-desc-en')?.value || '',

                    about_h4_icon: document.getElementById('set-about-h4-icon')?.value || '',
                    about_h4_title_th: document.getElementById('set-about-h4-title-th')?.value || '',
                    about_h4_title_en: document.getElementById('set-about-h4-title-en')?.value || '',
                    about_h4_desc_th: document.getElementById('set-about-h4-desc-th')?.value || '',
                    about_h4_desc_en: document.getElementById('set-about-h4-desc-en')?.value || '',

                    about_h5_icon: document.getElementById('set-about-h5-icon')?.value || '',
                    about_h5_title_th: document.getElementById('set-about-h5-title-th')?.value || '',
                    about_h5_title_en: document.getElementById('set-about-h5-title-en')?.value || '',
                    about_h5_desc_th: document.getElementById('set-about-h5-desc-th')?.value || '',
                    about_h5_desc_en: document.getElementById('set-about-h5-desc-en')?.value || '',
                    phone: document.getElementById('set-phone')?.value || '',
                    line: document.getElementById('set-line-url')?.value || '', // compatibility sync
                    facebook: document.getElementById('set-facebook-url')?.value || '', // compatibility sync
                    email: document.getElementById('set-email')?.value || '',
                    address_th: document.getElementById('set-address-th')?.value || '',
                    address_en: document.getElementById('set-address-en')?.value || '',
                    business_hours_th: document.getElementById('set-hours-th')?.value || '',
                    business_hours_en: document.getElementById('set-hours-en')?.value || '',
                    seo_title: document.getElementById('set-seo-title')?.value || '',
                    seo_desc: document.getElementById('set-seo-desc')?.value || '',
                    show_home_video: document.getElementById('set-show-video')?.checked ? 'true' : 'false',

                    // Contact and map keys
                    contact_title_th: document.getElementById('set-contact-title-th')?.value || '',
                    contact_title_en: document.getElementById('set-contact-title-en')?.value || '',
                    contact_description_th: document.getElementById('set-contact-desc-th')?.value || '',
                    contact_description_en: document.getElementById('set-contact-desc-en')?.value || '',
                    google_maps_url: document.getElementById('set-maps-url')?.value || '',
                    google_maps_embed_url: document.getElementById('set-maps-embed-url')?.value || '',
                    line_url: document.getElementById('set-line-url')?.value || '',
                    line_qr_image: document.getElementById('set-line-qr-img-src')?.value || '',
                    contact_visible: document.getElementById('set-contact-visible')?.checked ? 'true' : 'false',
                    line_qr_visible: document.getElementById('set-line-qr-visible')?.checked ? 'true' : 'false',

                    // Socials keys
                    facebook_url: document.getElementById('set-facebook-url')?.value || '',
                    facebook_visible: document.getElementById('set-facebook-visible')?.checked ? 'true' : 'false',
                    instagram_url: document.getElementById('set-instagram-url')?.value || '',
                    instagram_visible: document.getElementById('set-instagram-visible')?.checked ? 'true' : 'false',
                    tiktok_url: document.getElementById('set-tiktok-url')?.value || '',
                    tiktok_visible: document.getElementById('set-tiktok-visible')?.checked ? 'true' : 'false',
                    youtube_url: document.getElementById('set-youtube-url')?.value || '',
                    youtube_visible: document.getElementById('set-youtube-visible')?.checked ? 'true' : 'false',
                    line_visible: document.getElementById('set-line-visible')?.checked ? 'true' : 'false'
                };

                try {
                    for (const key of Object.keys(setObj)) {
                        await this.db.put('settings', { key: key, value: setObj[key] });
                    }
                    console.log('[About Gallery] Saved successfully');
                    alert('บันทึกข้อมูลการตั้งค่าและหน้าร้านทั้งหมดเรียบร้อยแล้ว!');
                    this.renderActiveView();
                } catch (err) {
                    console.error('[About Gallery] Save failed', err);
                    alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + err.message);
                } finally {
                    if (masterSaveBtn) {
                        masterSaveBtn.disabled = false;
                        masterSaveBtn.innerHTML = originalHtml;
                    }
                }
            };
        }

        // Firebase config submit
        document.getElementById('firebase-settings-form').onsubmit = async (e) => {
            e.preventDefault();
            const rawVal = document.getElementById('set-firebase-config').value.trim();
            if (!rawVal) {
                alert('กรุณากรอกโครงสร้าง Firebase Config JSON');
                return;
            }

            try {
                const parsed = JSON.parse(rawVal);
                await this.db.put('settings', { key: 'firebase_config', value: parsed });
                alert('บันทึกคีย์เชื่อม Firebase สำเร็จ! ระบบจะทำการรีโหลดหน้าจอเพื่อเปิดเชื่อมต่อคลาวด์ตัวใหม่');
                window.location.reload();
            } catch (err) {
                alert('ข้อผิดพลาด: โครงสร้าง JSON คอนฟิกไม่ถูกต้อง กรุณาตรวจสอบวงเล็บและเครื่องหมายคำพูดอีกครั้ง\n\nรายละเอียด: ' + err.message);
            }
        };

        // Disconnect Firebase Cloud
        document.getElementById('disconnect-fb-btn').onclick = async () => {
            if (confirm('คุณต้องการลบคีย์การตั้งค่าและปิดฟังก์ชันเชื่อมต่อ Firebase คลาวด์ใช่หรือไม่?')) {
                await this.db.delete('settings', 'firebase_config');
                alert('ยกเลิกเชื่อมต่อคลาวด์เรียบร้อยแล้ว!');
                window.location.reload();
            }
        };

        // Firebase Sync Migration Button
        const migrationBtn = document.getElementById('sync-migration-btn');
        if (migrationBtn) {
            migrationBtn.onclick = async () => {
                migrationBtn.disabled = true;
                migrationBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> กำลังสแกนข้อมูล...`;

                try {
                    const counts = await this.db.getIndexedDBCounts();
                    let msg = "พบรายการข้อมูลในระบบเครื่องของคุณดังนี้:\n";
                    msg += `- หมวดหมู่สินค้า: ${counts.categories || 0} รายการ\n`;
                    msg += `- สินค้าทั้งหมด: ${counts.products || 0} รายการ\n`;
                    msg += `- ผลงานสกรีนแก้ว: ${counts.portfolio || 0} รายการ\n`;
                    msg += `- ภาพสไลด์หน้าแรก: ${counts.slider || 0} รายการ\n`;
                    msg += `- ภาพสไลด์หน้าสินค้า: ${counts.product_slider || 0} รายการ\n`;
                    msg += `- ข่าวสารและสาระ: ${counts.news || 0} รายการ\n`;
                    msg += `- บทความสาระ: ${counts.articles || 0} รายการ\n`;
                    msg += `- โลโก้พันธมิตร: ${counts.clients || 0} รายการ\n`;
                    msg += `- ข้อมูลการตั้งค่าระบบ: ${counts.settings || 0} รายการ\n\n`;
                    msg += "คุณแน่ใจหรือไม่ว่าต้องการเริ่มต้นอพยพย้ายข้อมูลเหล่านี้ส่งขึ้นคลาวด์ Firebase Firestore?";

                    if (confirm(msg)) {
                        migrationBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> กำลังอพยพข้อมูลขึ้นคลาวด์...`;
                        const stats = await this.db.syncIndexedDBToFirestoreWithStats();
                        alert(`ยินดีด้วย! อพยพข้อมูลสกรีนแก้วทั้งหมดขึ้นฐานข้อมูล Firestore สำเร็จ!\n\n- สำเร็จ: ${stats.success} รายการ\n- ข้าม (มีอยู่แล้ว): ${stats.skipped} รายการ\n- ล้มเหลว: ${stats.failure} รายการ`);
                    }
                } catch (err) {
                    alert('เกิดข้อผิดพลาดในการอพยพย้ายข้อมูล: ' + err.message);
                } finally {
                    migrationBtn.disabled = false;
                    migrationBtn.innerHTML = `<i class="fas fa-cloud-upload-alt"></i> ซิงก์ข้อมูลจากเครื่องขึ้นคลาวด์`;
                    this.renderActiveView();
                }
            };
        }

        // Export Database
        document.getElementById('export-db-btn').onclick = async () => {
            try {
                const jsonBackup = await this.db.exportDatabaseToJSON();
                const blob = new Blob([jsonBackup], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `charoen_cup_db_backup_${new Date().toISOString().slice(0,10)}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } catch (err) {
                alert('เกิดข้อผิดพลาดในการสำรองข้อมูล: ' + err.message);
            }
        };

        // Import Database
        const fileSelector = document.getElementById('import-file-selector');
        document.getElementById('import-db-btn').onclick = () => fileSelector.click();
        fileSelector.onchange = async (e) => {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการล้างข้อมูลฐานข้อมูลเดิมและนำเข้ากู้คืนข้อมูลร้านจากไฟล์ "${file.name}"?`)) {
                    const reader = new FileReader();
                    reader.onload = async (event) => {
                        try {
                            await this.db.importDatabaseFromJSON(event.target.result);
                            alert('นำเข้ากู้คืนข้อมูลร้านค้าเรียบร้อยแล้ว!');
                            window.location.reload();
                        } catch (err) {
                            alert('นำเข้าไฟล์ล้มเหลว กรุณาตรวจสอบไฟล์สำรองอีกครั้ง: ' + err.message);
                        }
                    };
                    reader.readAsText(file);
                }
            }
        };
    }

    // Modal popup CRUD dialogs
    async openProductEditDialog(prodId) {
        const categories = await this.db.getAll('categories');
        let prod = {
            id: 'prod_' + Date.now(),
            name_th: '',
            name_en: '',
            category: categories[0]?.id || '',
            spec_material: '',
            spec_volume_th: '',
            spec_volume_en: '',
            spec_diameter: '95',
            spec_min_qty: '1,000 ใบ',
            price: '',
            desc_th: '',
            desc_en: '',
            image_src: '',
            
            // Visibility toggles
            show_material: true,
            show_volume: true,
            show_diameter: true,
            show_min_qty: true,
            show_price: true
        };

        let isEdit = false;
        if (prodId) {
            const fetched = await this.db.get('products', prodId);
            if (fetched) {
                prod = fetched;
                isEdit = true;
            }
        }

        // Initialize gallery images list safely
        let productGalleryImages = Array.isArray(prod?.gallery_images)
            ? prod.gallery_images.filter(Boolean).slice(0, 5)
            : [];

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';
        overlay.id = 'admin-edit-modal';

        overlay.innerHTML = `
            <div class="modal-window" style="max-width:640px; padding:30px;">
                <button class="modal-close-btn" id="close-modal-btn"><i class="fas fa-times"></i></button>
                <h3 style="font-size:1.25rem; font-weight:800; color:var(--secondary); margin-bottom:20px; border-bottom:1.5px solid var(--border-color); padding-bottom:8px;">
                    ${isEdit ? 'แก้ไขรายละเอียดสินค้าสกรีน' : 'เพิ่มสินค้าชนิดใหม่'}
                </h3>
                
                <form id="edit-product-form">
                    <div style="display:flex; flex-direction:column; gap:12px; max-height:60vh; overflow-y:auto; padding-right:8px;">
                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">หมวดหมู่แก้ว/บรรจุภัณฑ์ <span style="color:var(--danger)">*</span></label>
                            <select id="prod-form-cat" class="form-control" style="appearance:auto;" required>
                                ${categories.map(c => `<option value="${c.id}" ${prod.category === c.id ? 'selected' : ''}>${c.name_th}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">ชื่อสินค้าภาษาไทย (TH Name) <span style="color:var(--danger)">*</span></label>
                            <input type="text" id="prod-form-name-th" class="form-control" value="${prod.name_th}" required>
                        </div>
                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">ชื่อสินค้าภาษาอังกฤษ (EN Name)</label>
                            <input type="text" id="prod-form-name-en" class="form-control" value="${prod.name_en || ''}">
                        </div>
                        
                        <div class="grid-2">
                            <div class="form-group">
                                <label style="font-weight:600; font-size:0.85rem;">เนื้อวัสดุสเปก (Material)</label>
                                <input type="text" id="prod-form-material" class="form-control" value="${prod.spec_material || ''}" placeholder="เช่น เนื้อ PP หนากึ่งนิ่ม">
                            </div>
                            <div class="form-group">
                                <label style="font-weight:600; font-size:0.85rem;">ขนาดความกว้างปากแก้ว (Rim Diameter)</label>
                                <input type="text" id="prod-form-diameter" class="form-control" value="${prod.spec_diameter || ''}" placeholder="เช่น 95 มม.">
                            </div>
                        </div>
                        
                        <div class="grid-2">
                            <div class="form-group">
                                <label style="font-weight:600; font-size:0.85rem;">ความจุแก้วภาษาไทย (Volume TH)</label>
                                <input type="text" id="prod-form-vol-th" class="form-control" value="${prod.spec_volume_th || ''}" placeholder="เช่น 16 ออนซ์ แคปซูล">
                            </div>
                            <div class="form-group">
                                <label style="font-weight:600; font-size:0.85rem;">ความจุแก้วภาษาอังกฤษ (Volume EN)</label>
                                <input type="text" id="prod-form-vol-en" class="form-control" value="${prod.spec_volume_en || ''}" placeholder="เช่น 16 oz Capsule">
                            </div>
                        </div>
                        
                        <div class="grid-2">
                            <div class="form-group">
                                <label style="font-weight:600; font-size:0.85rem;">ราคาต่อชิ้น (Price)</label>
                                <input type="text" id="prod-form-price" class="form-control" value="${prod.price || ''}">
                            </div>
                            <div class="form-group">
                                <label style="font-weight:600; font-size:0.85rem;">ยอดผลิตขั้นต่ำ (Min Qty)</label>
                                <input type="text" id="prod-form-min" class="form-control" value="${prod.spec_min_qty || '1,000 ใบ'}">
                            </div>
                        </div>
                        
                        <!-- Visibility toggles in details (Show / Hide checks) -->
                        <div class="form-group" style="background:var(--bg-sec); padding:12px; border-radius:var(--radius-md); border:1px solid var(--border-color);">
                            <label style="font-weight:700; font-size:0.85rem; color:var(--secondary); margin-bottom:8px;"><i class="fas fa-eye"></i> ตั้งค่าการแสดงผลสเปกของลูกค้า</label>
                            <div style="display:grid; grid-template-columns:repeat(2,1fr); gap:10px; font-size:0.82rem;">
                                <label style="cursor:pointer;"><input type="checkbox" id="show-material-check" ${prod.show_material !== false ? 'checked' : ''}> แสดงเนื้อวัสดุ</label>
                                <label style="cursor:pointer;"><input type="checkbox" id="show-volume-check" ${prod.show_volume !== false ? 'checked' : ''}> แสดงขนาดความจุ</label>
                                <label style="cursor:pointer;"><input type="checkbox" id="show-diameter-check" ${prod.show_diameter !== false ? 'checked' : ''}> แสดงความกว้างปากแก้ว</label>
                                <label style="cursor:pointer;"><input type="checkbox" id="show-min-qty-check" ${prod.show_min_qty !== false ? 'checked' : ''}> แสดงยอดขั้นต่ำ</label>
                                <label style="cursor:pointer;"><input type="checkbox" id="show-price-check" ${prod.show_price !== false ? 'checked' : ''}> แสดงราคาสินค้าเริ่มต้น</label>
                            </div>
                        </div>

                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">คำอธิบายรายละเอียดภาษาไทย (Description TH)</label>
                            <textarea id="prod-form-desc-th" class="form-control" style="min-height:60px;">${prod.desc_th || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">คำอธิบายรายละเอียดภาษาอังกฤษ (Description EN)</label>
                            <textarea id="prod-form-desc-en" class="form-control" style="min-height:60px;">${prod.desc_en || ''}</textarea>
                        </div>
                        
                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">รูปภาพแก้วสินค้า</label>
                            <div style="display:flex; gap:10px; align-items:center;">
                                <input type="file" id="prod-form-file" class="form-control" accept="image/*" style="padding: 6px; flex-grow:1;">
                                <button type="button" class="btn btn-outline" id="select-prod-media-btn" style="padding:8px 12px; font-size:0.75rem;"><i class="fas fa-folder-open"></i> เลือกจากคลังภาพ</button>
                            </div>
                            
                            <div style="margin-top:10px; text-align:center;">
                                <img src="${prod.image_src || ''}" id="prod-form-img-preview" style="max-height:100px; border-radius:var(--radius-sm); border:1px solid var(--border-color); display:${prod.image_src ? 'inline-block' : 'none'};">
                            </div>
                        </div>

                        <!-- Gallery images manager section -->
                        <div class="form-group" style="border-top: 1px solid var(--border-color); padding-top: 16px; margin-top: 16px;">
                            <label style="font-weight:700; font-size:0.9rem; color:var(--primary); display:flex; justify-content:space-between; align-items:center;">
                                <span><i class="fas fa-images"></i> รูปเพิ่มเติมของสินค้า</span>
                                <span id="gallery-counter-label" style="font-size:0.8rem; color:var(--text-sec);">0 / 5 รูป</span>
                            </label>
                            <p style="font-size:0.78rem; color:var(--text-sec); margin-top:2px; margin-bottom:12px;">เพิ่มรูปประกอบสินค้าได้สูงสุด 5 รูป ระบบจะแสดงเฉพาะรูปที่มีข้อมูลจริง</p>
                            
                            <div id="gallery-cards-container" style="display:flex; flex-direction:column; gap:10px; margin-bottom:12px;"></div>
                            
                            <div id="add-gallery-actions" style="display:flex; gap:10px; align-items:center;">
                                <input type="file" id="prod-gallery-file-input" accept="image/*" style="display:none;">
                                <button type="button" class="btn btn-outline" id="upload-gallery-btn" style="padding:8px 12px; font-size:0.75rem;"><i class="fas fa-upload"></i> อัปโหลดจากเครื่อง</button>
                                <button type="button" class="btn btn-outline" id="select-gallery-btn" style="padding:8px 12px; font-size:0.75rem;"><i class="fas fa-folder-open"></i> เลือกจากคลังภาพ</button>
                                <span id="gallery-full-msg" style="font-size:0.8rem; color:var(--success); font-weight:700; display:none;">เพิ่มรูปครบ 5 รูปแล้ว</span>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-top:24px; display:flex; gap:12px; justify-content:flex-end;">
                        <button type="button" class="btn btn-outline" id="close-modal-cancel-btn" style="padding:10px 16px;">ยกเลิก</button>
                        <button type="submit" class="btn btn-primary" style="padding:10px 20px;"><i class="fas fa-check"></i> บันทึกข้อมูล</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(overlay);

        const closeDialog = () => { overlay.remove(); };
        document.getElementById('close-modal-btn').onclick = closeDialog;
        document.getElementById('close-modal-cancel-btn').onclick = closeDialog;

        // Selection from Media Library for Main image
        document.getElementById('select-prod-media-btn').onclick = () => {
            this.openMediaSelectorDialog((selectedBase64) => {
                const preview = document.getElementById('prod-form-img-preview');
                preview.src = selectedBase64;
                preview.style.display = 'inline-block';
                prod.image_src = selectedBase64;
            });
        };

        // File Uploader WebP convert for Main image
        const fileInput = document.getElementById('prod-form-file');
        if (fileInput) {
            fileInput.onchange = async (e) => {
                if (e.target.files && e.target.files[0]) {
                    const webpData = await this.convertImageToWebP(e.target.files[0]);
                    const preview = document.getElementById('prod-form-img-preview');
                    preview.src = webpData;
                    preview.style.display = 'inline-block';
                    prod.image_src = webpData;
                }
            };
        }

        // Gallery render block
        let draggedIndex = null;
        const renderGallery = () => {
            const container = document.getElementById('gallery-cards-container');
            const counter = document.getElementById('gallery-counter-label');
            const uploadBtn = document.getElementById('upload-gallery-btn');
            const selectBtn = document.getElementById('select-gallery-btn');
            const fullMsg = document.getElementById('gallery-full-msg');
            
            if (!container) return;
            
            counter.textContent = `${productGalleryImages.length} / 5 รูป`;
            
            if (productGalleryImages.length >= 5) {
                uploadBtn.style.display = 'none';
                selectBtn.style.display = 'none';
                fullMsg.style.display = 'inline-block';
            } else {
                uploadBtn.style.display = 'inline-flex';
                selectBtn.style.display = 'inline-flex';
                fullMsg.style.display = 'none';
            }
            
            container.innerHTML = productGalleryImages.map((img, idx) => `
                <div class="gallery-image-card" draggable="true" data-index="${idx}" style="display:flex; align-items:center; gap:12px; padding:8px; border:1px solid var(--border-color); border-radius:var(--radius-sm); background:var(--bg-main); box-sizing:border-box; width: 100%; transition: transform 0.2s ease, opacity 0.2s ease;">
                    <div style="width:50px; height:50px; border-radius:var(--radius-sm); overflow:hidden; background:var(--bg-sec); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                        <img src="${img}" style="max-width:100%; max-height:100%; object-fit:contain;" onerror="this.src='coffee_bg.webp';">
                    </div>
                    <div style="flex-grow:1; min-width:0; font-size:0.8rem; color:var(--text-sec); display:flex; flex-direction:column; gap:2px;">
                        <span style="font-weight:700; color:var(--secondary);">ตำแหน่งที่ ${idx + 1}</span>
                        <span style="font-size:0.75rem; word-break:break-all; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${img.startsWith('data:') ? 'รูปภาพอัปโหลดใหม่ (base64)' : img}</span>
                    </div>
                    <div style="display:flex; gap:6px; flex-shrink:0;">
                        <button type="button" class="btn btn-outline move-up-gallery-btn" data-index="${idx}" aria-label="เลื่อนรูปที่ ${idx + 1} ขึ้น" style="padding:4px 8px; font-size:0.75rem; min-height:36px; min-width:36px;" ${idx === 0 ? 'disabled' : ''}>
                            <i class="fas fa-arrow-up"></i>
                        </button>
                        <button type="button" class="btn btn-outline move-down-gallery-btn" data-index="${idx}" aria-label="เลื่อนรูปที่ ${idx + 1} ลง" style="padding:4px 8px; font-size:0.75rem; min-height:36px; min-width:36px;" ${idx === productGalleryImages.length - 1 ? 'disabled' : ''}>
                            <i class="fas fa-arrow-down"></i>
                        </button>
                        <button type="button" class="btn btn-outline del-gallery-btn" data-index="${idx}" aria-label="ลบรูปเพิ่มเติมลำดับที่ ${idx + 1}" style="padding:4px 8px; font-size:0.75rem; min-height:36px; min-width:36px; border-color:var(--danger); color:var(--danger);">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            `).join('');
            
            // Re-bind click arrow events
            container.querySelectorAll('.move-up-gallery-btn').forEach(btn => {
                btn.onclick = () => {
                    const idx = parseInt(btn.dataset.index);
                    if (idx > 0) {
                        const temp = productGalleryImages[idx];
                        productGalleryImages[idx] = productGalleryImages[idx - 1];
                        productGalleryImages[idx - 1] = temp;
                        renderGallery();
                    }
                };
            });
            
            container.querySelectorAll('.move-down-gallery-btn').forEach(btn => {
                btn.onclick = () => {
                    const idx = parseInt(btn.dataset.index);
                    if (idx < productGalleryImages.length - 1) {
                        const temp = productGalleryImages[idx];
                        productGalleryImages[idx] = productGalleryImages[idx + 1];
                        productGalleryImages[idx + 1] = temp;
                        renderGallery();
                    }
                };
            });
            
            container.querySelectorAll('.del-gallery-btn').forEach(btn => {
                btn.onclick = () => {
                    const idx = parseInt(btn.dataset.index);
                    productGalleryImages.splice(idx, 1);
                    renderGallery();
                };
            });

            // HTML5 Drag & Drop events
            const cards = container.querySelectorAll('.gallery-image-card');
            cards.forEach(card => {
                const idx = parseInt(card.dataset.index);
                card.ondragstart = (e) => {
                    draggedIndex = idx;
                    card.classList.add('dragging');
                    e.dataTransfer.effectAllowed = 'move';
                };
                card.ondragend = () => {
                    card.classList.remove('dragging');
                    draggedIndex = null;
                };
                card.ondragover = (e) => {
                    e.preventDefault();
                    const targetIndex = idx;
                    if (draggedIndex !== null && draggedIndex !== targetIndex) {
                        const temp = productGalleryImages[draggedIndex];
                        productGalleryImages[draggedIndex] = productGalleryImages[targetIndex];
                        productGalleryImages[targetIndex] = temp;
                        draggedIndex = targetIndex;
                        renderGallery();
                    }
                };
            });
        };

        const addGalleryImage = (src) => {
            if (!src) return;
            if (productGalleryImages.length >= 5) {
                alert("เพิ่มรูปเพิ่มเติมได้สูงสุด 5 รูปเท่านั้น / Maximum of 5 additional images reached.");
                return;
            }
            if (src === prod.image_src) {
                alert("รูปภาพนี้เป็นรูปภาพหลักแล้ว ไม่สามารถเพิ่มในรูปเพิ่มเติมได้ / This image is already the main image.");
                return;
            }
            if (productGalleryImages.includes(src)) {
                alert("คุณได้เลือกรูปภาพนี้ไปแล้ว / This image is already in the gallery.");
                return;
            }
            productGalleryImages.push(src);
            renderGallery();
        };

        document.getElementById('upload-gallery-btn').onclick = () => {
            document.getElementById('prod-gallery-file-input').click();
        };

        document.getElementById('prod-gallery-file-input').onchange = async (e) => {
            if (e.target.files && e.target.files[0]) {
                try {
                    const webpData = await this.convertImageToWebP(e.target.files[0]);
                    addGalleryImage(webpData);
                } catch (err) {
                    alert("เกิดข้อผิดพลาดในการอัปโหลดไฟล์รูปภาพ / Image upload failed.");
                }
                e.target.value = '';
            }
        };

        document.getElementById('select-gallery-btn').onclick = () => {
            this.openMediaSelectorDialog((selectedBase64) => {
                addGalleryImage(selectedBase64);
            });
        };

        // Render initially
        renderGallery();

        // Form Submit
        document.getElementById('edit-product-form').onsubmit = async (e) => {
            e.preventDefault();
            
            const updatedProd = {
                id: prod.id,
                category: document.getElementById('prod-form-cat').value,
                name_th: document.getElementById('prod-form-name-th').value,
                name_en: document.getElementById('prod-form-name-en').value,
                spec_material: document.getElementById('prod-form-material').value,
                spec_diameter: document.getElementById('prod-form-diameter').value,
                spec_volume_th: document.getElementById('prod-form-vol-th').value,
                spec_volume_en: document.getElementById('prod-form-vol-en').value,
                price: document.getElementById('prod-form-price').value,
                spec_min_qty: document.getElementById('prod-form-min').value,
                desc_th: document.getElementById('prod-form-desc-th').value,
                desc_en: document.getElementById('prod-form-desc-en').value,
                image_src: prod.image_src,

                // Normalize gallery images
                gallery_images: productGalleryImages
                    .filter(Boolean)
                    .filter(url => url !== prod.image_src)
                    .filter((url, index, arr) => arr.indexOf(url) === index)
                    .slice(0, 5),

                // Toggles
                show_material: document.getElementById('show-material-check').checked,
                show_volume: document.getElementById('show-volume-check').checked,
                show_diameter: document.getElementById('show-diameter-check').checked,
                show_min_qty: document.getElementById('show-min-qty-check').checked,
                show_price: document.getElementById('show-price-check').checked
            };

            await this.db.put('products', updatedProd);
            closeDialog();
            this.renderActiveView();
        };
    }

    async openCategoryEditDialog(catId) {
        let cat = {
            id: 'cat_' + Date.now(),
            name_th: '',
            name_en: '',
            description_th: '',
            description_en: '',
            bg_src: '',
            order: 1
        };

        let isEdit = false;
        if (catId) {
            const fetched = await this.db.get('categories', catId);
            if (fetched) {
                cat = fetched;
                isEdit = true;
            }
        }

        const catImg = cat.bg_src || cat.image_src || cat.image || cat.img || '';

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';
        overlay.id = 'admin-edit-modal';

        overlay.innerHTML = `
            <div class="modal-window" style="max-width:560px; padding:30px;">
                <button class="modal-close-btn" id="close-modal-btn"><i class="fas fa-times"></i></button>
                <h3 style="font-size:1.25rem; font-weight:800; color:var(--secondary); margin-bottom:20px; border-bottom:1.5px solid var(--border-color); padding-bottom:8px;">
                    ${isEdit ? 'แก้ไขหมวดหมู่สินค้า' : 'เพิ่มหมวดหมู่สินค้าใหม่'}
                </h3>
                
                <form id="edit-category-form">
                    <div style="display:flex; flex-direction:column; gap:14px; max-height:65vh; overflow-y:auto; padding-right:6px;">
                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">รหัส ID หมวดหมู่ (เว้นวรรคไม่ได้) <span style="color:var(--danger)">*</span></label>
                            <input type="text" id="cat-form-id" class="form-control" value="${cat.id}" ${isEdit ? 'disabled style="background:#e2e8f0; color:#64748b;"' : ''} placeholder="เช่น cat-pet" required>
                        </div>
                        <div class="grid-2">
                            <div class="form-group">
                                <label style="font-weight:600; font-size:0.85rem;">ชื่อหมวดหมู่ภาษาไทย (TH) <span style="color:var(--danger)">*</span></label>
                                <input type="text" id="cat-form-name-th" class="form-control" value="${cat.name_th || ''}" placeholder="เช่น แก้ว PET ทรงตรง" required>
                            </div>
                            <div class="form-group">
                                <label style="font-weight:600; font-size:0.85rem;">ชื่อหมวดหมู่ภาษาอังกฤษ (EN) <span style="color:var(--danger)">*</span></label>
                                <input type="text" id="cat-form-name-en" class="form-control" value="${cat.name_en || ''}" placeholder="เช่น PET Cups" required>
                            </div>
                        </div>

                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">คำอธิบายหมวดหมู่ภาษาไทย (Description TH)</label>
                            <textarea id="cat-form-desc-th" class="form-control" style="min-height:54px;" placeholder="เช่น บริการสกรีนโลโก้และพิมพ์ลายบนแก้ว PET ลายเส้นสีคมชัด รวดเร็วทันใจ">${cat.description_th || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">คำอธิบายหมวดหมู่ภาษาอังกฤษ (Description EN)</label>
                            <textarea id="cat-form-desc-en" class="form-control" style="min-height:54px;" placeholder="เช่น Custom printing & branding on PET cups with sharp colors and fast delivery">${cat.description_en || ''}</textarea>
                        </div>

                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">ลำดับการจัดเรียง (Order - ตัวเลข)</label>
                            <input type="number" id="cat-form-order" class="form-control" value="${cat.order || 1}" min="1" required>
                        </div>

                        <!-- Category Image Input Section -->
                        <div class="form-group" style="background:var(--bg-sec); padding:16px; border-radius:var(--radius-md); border:1px solid var(--border-color);">
                            <label style="font-weight:700; font-size:0.88rem; color:var(--primary); margin-bottom:8px; display:block;">
                                <i class="fas fa-image" style="color:var(--secondary);"></i> รูปภาพหน้าการ์ดหมวดหมู่สินค้า
                            </label>
                            <div style="display:flex; gap:10px; align-items:center; margin-bottom:10px;">
                                <input type="file" id="cat-form-file" class="form-control" accept="image/*" style="padding:6px; flex-grow:1;">
                                <button type="button" class="btn btn-outline" id="select-cat-media-btn" style="padding:8px 12px; font-size:0.75rem;"><i class="fas fa-folder-open"></i> เลือกจากคลังภาพ</button>
                                <button type="button" class="btn btn-outline" id="remove-cat-img-btn" style="padding:8px 12px; font-size:0.75rem; border-color:var(--danger); color:var(--danger); display:${catImg ? 'inline-flex' : 'none'};"><i class="fas fa-trash-alt"></i> ลบรูป</button>
                            </div>
                            
                            <div style="margin-top:10px; text-align:center;">
                                <img src="${catImg}" id="cat-form-img-preview" style="max-height:120px; border-radius:var(--radius-sm); border:1px solid var(--border-color); display:${catImg ? 'inline-block' : 'none'}; object-fit:cover;">
                                <div id="cat-form-img-empty" style="padding:16px; background:var(--bg-main); border:1px dashed var(--border-color); border-radius:var(--radius-sm); font-size:0.8rem; color:var(--text-sec); display:${catImg ? 'none' : 'block'};">
                                    <i class="fas fa-info-circle" style="color:var(--secondary); margin-right:4px;"></i> ยังไม่ได้อัปโหลดรูปภาพ (ระบบจะแสดงไอคอน fallback อัตโนมัติ)
                                </div>
                            </div>

                            <!-- Recommended Image Guidance Box -->
                            <div style="background: rgba(4, 53, 106, 0.05); border-left: 3px solid var(--primary); padding: 10px 12px; border-radius: var(--radius-sm); font-size: 0.78rem; color: var(--text-sec); margin-top: 12px;">
                                <strong><i class="fas fa-lightbulb" style="color:var(--secondary);"></i> คำแนะนำขนาดและรูปแบบภาพหมวดหมู่:</strong>
                                <ul style="margin: 4px 0 0 16px; padding: 0; line-height: 1.5;">
                                    <li>ลักษณะภาพ: ภาพแนวนอน (Landscape) อัตราส่วน 4:3</li>
                                    <li>ความกว้างขั้นต่ำที่แนะนำ: 1200px (ฟอร์แมต WebP หรือ JPG)</li>
                                    <li>หลีกเลี่ยงการวางข้อความสำคัญบริเวณด้านล่างของภาพ เนื่องจากการแสดงผลหน้าการ์ดมี gradient ดำซ้อนทับ</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-top:24px; display:flex; gap:12px; justify-content:flex-end;">
                        <button type="button" class="btn btn-outline" id="close-modal-cancel-btn" style="padding:10px 16px;">ยกเลิก</button>
                        <button type="submit" class="btn btn-primary" style="padding:10px 20px;"><i class="fas fa-check"></i> บันทึกข้อมูล</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(overlay);
        const closeDialog = () => { overlay.remove(); };
        document.getElementById('close-modal-btn').onclick = closeDialog;
        document.getElementById('close-modal-cancel-btn').onclick = closeDialog;

        let activeCatImg = catImg;

        // Media Library selection for Category image
        document.getElementById('select-cat-media-btn').onclick = () => {
            this.openMediaSelectorDialog((selectedBase64) => {
                activeCatImg = selectedBase64;
                const preview = document.getElementById('cat-form-img-preview');
                const emptyBox = document.getElementById('cat-form-img-empty');
                const removeBtn = document.getElementById('remove-cat-img-btn');

                if (preview) { preview.src = selectedBase64; preview.style.display = 'inline-block'; }
                if (emptyBox) { emptyBox.style.display = 'none'; }
                if (removeBtn) { removeBtn.style.display = 'inline-flex'; }
            });
        };

        // File Uploader WebP convert for Category image
        const fileInput = document.getElementById('cat-form-file');
        if (fileInput) {
            fileInput.onchange = async (e) => {
                if (e.target.files && e.target.files[0]) {
                    const webpData = await this.convertImageToWebP(e.target.files[0]);
                    activeCatImg = webpData;
                    const preview = document.getElementById('cat-form-img-preview');
                    const emptyBox = document.getElementById('cat-form-img-empty');
                    const removeBtn = document.getElementById('remove-cat-img-btn');

                    if (preview) { preview.src = webpData; preview.style.display = 'inline-block'; }
                    if (emptyBox) { emptyBox.style.display = 'none'; }
                    if (removeBtn) { removeBtn.style.display = 'inline-flex'; }
                }
            };
        }

        // Remove image button
        document.getElementById('remove-cat-img-btn').onclick = () => {
            activeCatImg = '';
            const preview = document.getElementById('cat-form-img-preview');
            const emptyBox = document.getElementById('cat-form-img-empty');
            const removeBtn = document.getElementById('remove-cat-img-btn');

            if (preview) { preview.src = ''; preview.style.display = 'none'; }
            if (emptyBox) { emptyBox.style.display = 'block'; }
            if (removeBtn) { removeBtn.style.display = 'none'; }
        };

        document.getElementById('edit-category-form').onsubmit = async (e) => {
            e.preventDefault();
            const updated = {
                ...cat,
                id: document.getElementById('cat-form-id').value.trim().toLowerCase().replace(/\s+/g, '-'),
                name_th: document.getElementById('cat-form-name-th').value.trim(),
                name_en: document.getElementById('cat-form-name-en').value.trim(),
                description_th: document.getElementById('cat-form-desc-th').value.trim(),
                description_en: document.getElementById('cat-form-desc-en').value.trim(),
                bg_src: activeCatImg,
                image_src: activeCatImg,
                order: parseInt(document.getElementById('cat-form-order').value) || 1
            };

            await this.db.put('categories', updated);
            closeDialog();
            this.renderActiveView();
        };
    }

    // Full CRUD Category Manager Popup (accessible from Portfolio view)
    async openCategoryManagerPopup() {
        const categories = await this.db.getAll('categories');
        const portfolio = await this.db.getAll('portfolio');
        const products = await this.db.getAll('products');
        const sortedCats = [...categories].sort((a, b) => (a.order || 99) - (b.order || 99));

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';
        overlay.id = 'admin-edit-modal';

        overlay.innerHTML = `
            <div class="modal-window" style="max-width:700px; padding:30px;">
                <button class="modal-close-btn" id="close-modal-btn"><i class="fas fa-times"></i></button>
                <h3 style="font-size:1.25rem; font-weight:800; color:var(--secondary); margin-bottom:6px;">
                    <i class="fas fa-layer-group" style="margin-right:8px;"></i>จัดการหมวดหมู่สินค้า & ผลงาน
                </h3>
                <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:20px; border-bottom:1.5px solid var(--border-color); padding-bottom:12px;">
                    หมวดหมู่เหล่านี้ใช้ร่วมกันทั้งหน้าสินค้าและหน้าแกลเลอรีผลงาน รวมถึงฟอร์มขอใบเสนอราคา
                </p>

                <div style="margin-bottom:16px; text-align:right;">
                    <button class="btn btn-primary" id="cat-mgr-add-btn" style="padding:8px 16px; font-size:0.82rem;">
                        <i class="fas fa-plus"></i> เพิ่มหมวดหมู่ใหม่
                    </button>
                </div>

                ${sortedCats.length === 0 ? `
                    <p style="color:var(--text-muted); font-size:0.9rem; text-align:center; padding:40px 0;">ยังไม่มีหมวดหมู่ในระบบ กรุณากดปุ่มด้านบนเพื่อเพิ่มหมวดหมู่แรก</p>
                ` : `
                    <div style="overflow-x:auto; max-height:50vh; overflow-y:auto;">
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th>รหัส ID</th>
                                    <th>ชื่อหมวดหมู่ (TH)</th>
                                    <th>ชื่อหมวดหมู่ (EN)</th>
                                    <th style="text-align:center;">สินค้า</th>
                                    <th style="text-align:center;">ผลงาน</th>
                                    <th>ลำดับ</th>
                                    <th style="text-align:right;">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${sortedCats.map(c => {
                                    const prodCount = products.filter(p => p.category === c.id).length;
                                    const portCount = portfolio.filter(p => p.category === c.id).length;
                                    return `
                                        <tr>
                                            <td><code style="font-size:0.75rem; background:#e2e8f0; padding:2px 6px; border-radius:4px;">${c.id}</code></td>
                                            <td><strong>${c.name_th}</strong></td>
                                            <td style="color:var(--text-muted); font-size:0.85rem;">${c.name_en || '-'}</td>
                                            <td style="text-align:center;">
                                                <span class="badge" style="background:var(--secondary-light); color:var(--secondary); font-weight:700; font-size:0.75rem;">${prodCount}</span>
                                            </td>
                                            <td style="text-align:center;">
                                                <span class="badge" style="background:#fef3c7; color:#92400e; font-weight:700; font-size:0.75rem;">${portCount}</span>
                                            </td>
                                            <td>${c.order}</td>
                                            <td style="text-align:right; white-space:nowrap;">
                                                <button class="btn btn-outline cat-mgr-edit-btn" data-id="${c.id}" style="padding:5px 10px; font-size:0.72rem; border-color:var(--secondary); color:var(--secondary); margin-right:6px;">
                                                    <i class="fas fa-edit"></i> แก้ไข
                                                </button>
                                                <button class="btn btn-outline cat-mgr-del-btn" data-id="${c.id}" data-name="${c.name_th}" data-prod="${prodCount}" data-port="${portCount}" style="padding:5px 10px; font-size:0.72rem; border-color:var(--danger); color:var(--danger);">
                                                    <i class="fas fa-trash-alt"></i> ลบ
                                                </button>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        `;

        document.body.appendChild(overlay);
        const closeDialog = () => { overlay.remove(); };
        document.getElementById('close-modal-btn').onclick = closeDialog;

        // Add New Category
        document.getElementById('cat-mgr-add-btn').onclick = () => {
            closeDialog();
            this.openCategoryEditDialog(null);
        };

        // Edit Category
        overlay.querySelectorAll('.cat-mgr-edit-btn').forEach(btn => {
            btn.onclick = () => {
                closeDialog();
                this.openCategoryEditDialog(btn.dataset.id);
            };
        });

        // Delete Category (with safety warnings)
        overlay.querySelectorAll('.cat-mgr-del-btn').forEach(btn => {
            btn.onclick = async () => {
                const name = btn.dataset.name;
                const prodCount = parseInt(btn.dataset.prod);
                const portCount = parseInt(btn.dataset.port);
                const totalLinked = prodCount + portCount;

                let msg = `คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่ "${name}" ออกอย่างถาวร?`;
                if (totalLinked > 0) {
                    msg += `\n\n⚠️ คำเตือน: หมวดหมู่นี้มีข้อมูลผูกอยู่:`;
                    if (prodCount > 0) msg += `\n• สินค้า ${prodCount} รายการ`;
                    if (portCount > 0) msg += `\n• ผลงาน ${portCount} รายการ`;
                    msg += `\n\nข้อมูลเหล่านี้จะยังคงอยู่ แต่จะกลายเป็น "ยังไม่มีหมวด"`;
                }

                if (confirm(msg)) {
                    await this.db.delete('categories', btn.dataset.id);
                    closeDialog();
                    this.renderActiveView();
                    // Re-open manager after refresh to continue editing
                    setTimeout(() => this.openCategoryManagerPopup(), 300);
                }
            };
        });
    }

    getPortfolioCoverImage(item) {
        if (!item) return 'coffee_bg.webp';
        let allImgs = [];
        if (item.image_src) {
            allImgs.push(item.image_src);
        }
        if (item.gallery_images) {
            let parsed = [];
            if (Array.isArray(item.gallery_images)) {
                parsed = item.gallery_images;
            } else if (typeof item.gallery_images === 'string') {
                try { parsed = JSON.parse(item.gallery_images); } catch (e) {}
            }
            parsed.forEach(img => {
                if (img && !allImgs.includes(img)) {
                    allImgs.push(img);
                }
            });
        }
        if (item.coverImageUrl && allImgs.includes(item.coverImageUrl)) {
            return item.coverImageUrl;
        }
        return allImgs[0] || 'coffee_bg.webp';
    }

    async openPortfolioEditDialog(itemId) {
        const categories = await this.db.getAll('categories');
        const portfolio = await this.db.getAll('portfolio');

        // Calculate next available order
        let maxOrder = 0;
        portfolio.forEach(p => {
            const o = Number(p.order || 0);
            if (o > maxOrder) maxOrder = o;
        });
        const nextOrder = maxOrder + 1;

        let item = {
            id: 'port_' + Date.now(),
            title_th: '',
            title_en: '',
            category: categories[0]?.id || '',
            client_name: '',
            print_color: '1 สี',
            desc_th: '',
            desc_en: '',
            description_th: '',
            description_en: '',
            image_src: '',
            coverImageUrl: '',
            gallery_images: [],
            visible: true,
            featured: false,
            order: nextOrder,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        let isEdit = false;
        if (itemId) {
            const fetched = await this.db.get('portfolio', itemId);
            if (fetched) {
                // Support older records missing fields
                let parsedGallery = [];
                if (Array.isArray(fetched.gallery_images)) {
                    parsedGallery = fetched.gallery_images;
                } else if (typeof fetched.gallery_images === 'string') {
                    try {
                        parsedGallery = JSON.parse(fetched.gallery_images);
                    } catch (e) {
                        parsedGallery = [];
                    }
                }

                item = {
                    ...fetched,
                    desc_th: fetched.desc_th || fetched.description_th || '',
                    desc_en: fetched.desc_en || fetched.description_en || '',
                    description_th: fetched.description_th || fetched.desc_th || '',
                    description_en: fetched.description_en || fetched.desc_en || '',
                    coverImageUrl: fetched.coverImageUrl || '',
                    visible: fetched.visible !== false && fetched.visible !== 'false',
                    featured: fetched.featured === true || fetched.featured === 'true',
                    order: fetched.order !== undefined ? Number(fetched.order) : 1,
                    gallery_images: parsedGallery,
                    created_at: fetched.created_at || new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                isEdit = true;
            }
        }

        // Initialize gallery images list safely
        let portfolioGalleryImages = Array.isArray(item?.gallery_images)
            ? item.gallery_images.filter(Boolean).slice(0, 5)
            : [];

        let selectedCoverUrl = item.coverImageUrl || '';

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';
        overlay.id = 'admin-edit-modal';

        overlay.innerHTML = `
            <div class="modal-window" style="max-width:600px; padding:30px;">
                <button class="modal-close-btn" id="close-modal-btn"><i class="fas fa-times"></i></button>
                <h3 style="font-size:1.25rem; font-weight:800; color:var(--secondary); margin-bottom:20px; border-bottom:1.5px solid var(--border-color); padding-bottom:8px;">
                    ${isEdit ? 'แก้ไขรูปภาพผลงานสกรีน' : 'อัปโหลดภาพผลงานใหม่'}
                </h3>
                
                <form id="edit-portfolio-form">
                    <div style="display:flex; flex-direction:column; gap:12px; max-height:60vh; overflow-y:auto; padding-right:8px;">
                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">หมวดหมู่ประเภทแก้วสกรีน <span style="color:var(--danger)">*</span></label>
                            <select id="port-form-cat" class="form-control" style="appearance:auto;" required>
                                ${categories.map(c => `<option value="${c.id}" ${item.category === c.id ? 'selected' : ''}>${c.name_th}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">หัวชื่องานสกรีนภาษาไทย (TH Title) <span style="color:var(--danger)">*</span></label>
                            <input type="text" id="port-form-title-th" class="form-control" value="${item.title_th}" required>
                        </div>
                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">หัวชื่องานสกรีนภาษาอังกฤษ (EN Title)</label>
                            <input type="text" id="port-form-title-en" class="form-control" value="${item.title_en || ''}">
                        </div>
                        
                        <div class="grid-2">
                            <div class="form-group">
                                <label style="font-weight:600; font-size:0.85rem;">ชื่อร้านค้าลูกค้า (Client Name)</label>
                                <input type="text" id="port-form-client" class="form-control" value="${item.client_name || ''}">
                            </div>
                            <div class="form-group">
                                <label style="font-weight:600; font-size:0.85rem;">จำนวนสีที่พิมพ์สกรีน (Colors)</label>
                                <input type="text" id="port-form-color" class="form-control" value="${item.print_color || '1 สี'}">
                            </div>
                        </div>

                        <div class="grid-3" style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px;">
                            <div class="form-group">
                                <label style="font-weight:600; font-size:0.85rem;">ลำดับการแสดงผล (Order)</label>
                                <input type="number" id="port-form-order" class="form-control" value="${item.order}" required min="1">
                            </div>
                            <div class="form-group" style="flex-direction:row; align-items:center; gap:8px; height:100%; margin-top:20px;">
                                <input type="checkbox" id="port-form-visible" style="width:20px; height:20px; cursor:pointer;" ${item.visible ? 'checked' : ''}>
                                <label for="port-form-visible" style="font-weight:600; font-size:0.85rem; cursor:pointer; margin-bottom:0;">แสดงผล (Visible)</label>
                            </div>
                            <div class="form-group" style="flex-direction:row; align-items:center; gap:8px; height:100%; margin-top:20px;">
                                <input type="checkbox" id="port-form-featured" style="width:20px; height:20px; cursor:pointer;" ${item.featured ? 'checked' : ''}>
                                <label for="port-form-featured" style="font-weight:600; font-size:0.85rem; cursor:pointer; margin-bottom:0; color:var(--secondary);">แนะนำ (Featured)</label>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">คำอธิบายรายละเอียดงานพิมพ์ภาษาไทย (Desc TH)</label>
                            <textarea id="port-form-desc-th" class="form-control" style="min-height:60px;">${item.description_th || item.desc_th || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">คำอธิบายรายละเอียดงานพิมพ์ภาษาอังกฤษ (Desc EN)</label>
                            <textarea id="port-form-desc-en" class="form-control" style="min-height:60px;">${item.description_en || item.desc_en || ''}</textarea>
                        </div>
                        
                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">รูปภาพผลงานสกรีนแก้วน้ำจริง</label>
                            <div style="display:flex; gap:10px; align-items:center;">
                                <input type="file" id="port-form-file" class="form-control" accept="image/*" style="padding: 6px; flex-grow:1;">
                                <button type="button" class="btn btn-outline" id="select-port-media-btn" style="padding:8px 12px; font-size:0.75rem;"><i class="fas fa-folder-open"></i> เลือกจากคลังภาพ</button>
                            </div>
                            
                            <div style="margin-top:10px; text-align:center;">
                                <img src="${item.image_src || ''}" id="port-form-img-preview" style="max-height:120px; border-radius:var(--radius-sm); border:1px solid var(--border-color); display:${item.image_src ? 'inline-block' : 'none'};">
                            </div>
                        </div>

                        <!-- Gallery images manager section for portfolio -->
                        <div class="form-group" style="border-top: 1px solid var(--border-color); padding-top: 16px; margin-top: 16px;">
                            <label style="font-weight:700; font-size:0.9rem; color:var(--primary); display:flex; justify-content:space-between; align-items:center;">
                                <span><i class="fas fa-images"></i> รูปเพิ่มเติมของผลงาน</span>
                                <span id="gallery-counter-label" style="font-size:0.8rem; color:var(--text-sec);">0 / 5 รูป</span>
                            </label>
                            <p style="font-size:0.78rem; color:var(--text-sec); margin-top:2px; margin-bottom:12px;">เพิ่มรูปประกอบผลงานได้สูงสุด 5 รูป ระบบจะแสดงเฉพาะรูปที่มีข้อมูลจริง</p>
                            
                            <div id="gallery-cards-container" style="display:flex; flex-direction:column; gap:10px; margin-bottom:12px;"></div>
                            
                            <div id="add-gallery-actions" style="display:flex; gap:10px; align-items:center;">
                                <input type="file" id="port-gallery-file-input" accept="image/*" style="display:none;">
                                <button type="button" class="btn btn-outline" id="upload-gallery-btn" style="padding:8px 12px; font-size:0.75rem;"><i class="fas fa-upload"></i> อัปโหลดจากเครื่อง</button>
                                <button type="button" class="btn btn-outline" id="select-gallery-btn" style="padding:8px 12px; font-size:0.75rem;"><i class="fas fa-folder-open"></i> เลือกจากคลังภาพ</button>
                                <span id="gallery-full-msg" style="font-size:0.8rem; color:var(--success); font-weight:700; display:none;">เพิ่มรูปครบ 5 รูปแล้ว</span>
                            </div>
                        </div>

                        <!-- Cover Image Selection section for portfolio card -->
                        <div id="cover-image-selection-container" class="form-group" style="border-top: 1px solid var(--border-color); padding-top: 16px; margin-top: 16px;"></div>
                    </div>
                    
                    <div style="margin-top:24px; display:flex; gap:12px; justify-content:flex-end;">
                        <button type="button" class="btn btn-outline" id="close-modal-cancel-btn" style="padding:10px 16px;">ยกเลิก</button>
                        <button type="submit" class="btn btn-primary" style="padding:10px 20px;"><i class="fas fa-check"></i> อัปโหลดบันทึก</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(overlay);
        const closeDialog = () => { overlay.remove(); };
        document.getElementById('close-modal-btn').onclick = closeDialog;
        document.getElementById('close-modal-cancel-btn').onclick = closeDialog;

        // Render cover image selection block
        const renderCoverSelection = () => {
            const container = document.getElementById('cover-image-selection-container');
            if (!container) return;

            const allImgs = [item.image_src, ...portfolioGalleryImages]
                .filter(Boolean)
                .filter((url, index, arr) => arr.indexOf(url) === index);

            if (allImgs.length === 0) {
                container.style.display = 'none';
                container.innerHTML = '';
                selectedCoverUrl = '';
                return;
            }

            container.style.display = 'block';

            if (!selectedCoverUrl || !allImgs.includes(selectedCoverUrl)) {
                selectedCoverUrl = allImgs[0];
            }

            container.innerHTML = `
                <label style="font-weight:700; font-size:0.9rem; color:var(--primary); display:flex; align-items:center; justify-content:space-between; margin-bottom:4px;">
                    <span><i class="fas fa-star" style="color:var(--secondary); margin-right:6px;"></i> เลือกรูปปกผลงาน (Cover Image)</span>
                    <span style="font-size:0.78rem; font-weight:600; color:var(--secondary);">เลือก 1 รูปเป็นรูปปก</span>
                </label>
                <p style="font-size:0.78rem; color:var(--text-sec); margin-top:2px; margin-bottom:12px;">
                    เลือกรูปภาพที่จะใช้เป็นรูปปกแสดงในหน้าการ์ดผลงาน (รูปทั้งหมดจะยังคงแสดงในแกลเลอรีรายละเอียดตามปกติ)
                </p>

                <div class="cover-thumbnails-list" style="display:flex; flex-wrap:wrap; gap:12px; margin-bottom:8px;">
                    ${allImgs.map((imgUrl, idx) => {
                        const isSelected = imgUrl === selectedCoverUrl;
                        return `
                            <div class="cover-thumb-card" data-index="${idx}" style="cursor:pointer; display:flex; flex-direction:column; align-items:center; width:104px; padding:8px; border:2px solid ${isSelected ? 'var(--secondary)' : 'var(--border-color)'}; border-radius:var(--radius-md); background:${isSelected ? 'rgba(255,107,0,0.06)' : 'var(--bg-main)'}; transition:all 0.15s ease; box-sizing:border-box; flex-shrink:0;">
                                <div style="width:88px; height:88px; border-radius:var(--radius-sm); overflow:hidden; background:var(--bg-sec); display:flex; align-items:center; justify-content:center; margin-bottom:6px; border:1px solid ${isSelected ? 'var(--secondary)' : 'transparent'};">
                                    <img src="${imgUrl}" style="max-width:100%; max-height:100%; object-fit:cover;" onerror="this.src='coffee_bg.webp';">
                                </div>
                                <label style="display:flex; align-items:center; justify-content:center; gap:6px; font-size:0.78rem; font-weight:700; color:${isSelected ? 'var(--secondary)' : 'var(--text-sec)'}; min-height:44px; width:100%; cursor:pointer; margin:0;">
                                    <input type="radio" name="port-cover-selection" value="${idx}" ${isSelected ? 'checked' : ''} style="accent-color:var(--secondary); width:18px; height:18px; cursor:pointer;">
                                    <span>รูปที่ ${idx + 1}</span>
                                </label>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;

            container.querySelectorAll('.cover-thumb-card').forEach(card => {
                const idx = parseInt(card.dataset.index);
                card.onclick = () => {
                    selectedCoverUrl = allImgs[idx];
                    renderCoverSelection();
                };
            });
        };

        // Select from media library for main image
        document.getElementById('select-port-media-btn').onclick = () => {
            this.openMediaSelectorDialog((selectedBase64) => {
                const preview = document.getElementById('port-form-img-preview');
                preview.src = selectedBase64;
                preview.style.display = 'inline-block';
                item.image_src = selectedBase64;
                renderCoverSelection();
            });
        };

        // File Uploader for main image
        const fileInput = document.getElementById('port-form-file');
        if (fileInput) {
            fileInput.onchange = async (e) => {
                if (e.target.files && e.target.files[0]) {
                    const webpData = await this.convertImageToWebP(e.target.files[0]);
                    const preview = document.getElementById('port-form-img-preview');
                    preview.src = webpData;
                    preview.style.display = 'inline-block';
                    item.image_src = webpData;
                    renderCoverSelection();
                }
            };
        }

        // Gallery render block
        let draggedIndex = null;
        const renderGallery = () => {
            const container = document.getElementById('gallery-cards-container');
            const counter = document.getElementById('gallery-counter-label');
            const uploadBtn = document.getElementById('upload-gallery-btn');
            const selectBtn = document.getElementById('select-gallery-btn');
            const fullMsg = document.getElementById('gallery-full-msg');
            
            if (!container) return;
            
            counter.textContent = `${portfolioGalleryImages.length} / 5 รูป`;
            
            if (portfolioGalleryImages.length >= 5) {
                uploadBtn.style.display = 'none';
                selectBtn.style.display = 'none';
                fullMsg.style.display = 'inline-block';
            } else {
                uploadBtn.style.display = 'inline-flex';
                selectBtn.style.display = 'inline-flex';
                fullMsg.style.display = 'none';
            }
            
            container.innerHTML = portfolioGalleryImages.map((img, idx) => `
                <div class="gallery-image-card" draggable="true" data-index="${idx}" style="display:flex; align-items:center; gap:12px; padding:8px; border:1px solid var(--border-color); border-radius:var(--radius-sm); background:var(--bg-main); box-sizing:border-box; width: 100%; transition: transform 0.2s ease, opacity 0.2s ease;">
                    <div style="width:50px; height:50px; border-radius:var(--radius-sm); overflow:hidden; background:var(--bg-sec); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                        <img src="${img}" style="max-width:100%; max-height:100%; object-fit:contain;" onerror="this.src='coffee_bg.webp';">
                    </div>
                    <div style="flex-grow:1; min-width:0; font-size:0.8rem; color:var(--text-sec); display:flex; flex-direction:column; gap:2px;">
                        <span style="font-weight:700; color:var(--secondary);">ตำแหน่งที่ ${idx + 1}</span>
                        <span style="font-size:0.75rem; word-break:break-all; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${img.startsWith('data:') ? 'รูปภาพอัปโหลดใหม่ (base64)' : img}</span>
                    </div>
                    <div style="display:flex; gap:6px; flex-shrink:0;">
                        <button type="button" class="btn btn-outline move-up-gallery-btn" data-index="${idx}" aria-label="เลื่อนรูปที่ ${idx + 1} ขึ้น" style="padding:4px 8px; font-size:0.75rem; min-height:36px; min-width:36px;" ${idx === 0 ? 'disabled' : ''}>
                            <i class="fas fa-arrow-up"></i>
                        </button>
                        <button type="button" class="btn btn-outline move-down-gallery-btn" data-index="${idx}" aria-label="เลื่อนรูปที่ ${idx + 1} ลง" style="padding:4px 8px; font-size:0.75rem; min-height:36px; min-width:36px;" ${idx === portfolioGalleryImages.length - 1 ? 'disabled' : ''}>
                            <i class="fas fa-arrow-down"></i>
                        </button>
                        <button type="button" class="btn btn-outline del-gallery-btn" data-index="${idx}" aria-label="ลบรูปเพิ่มเติมลำดับที่ ${idx + 1}" style="padding:4px 8px; font-size:0.75rem; min-height:36px; min-width:36px; border-color:var(--danger); color:var(--danger);">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            `).join('');
            
            // Re-bind click arrow events
            container.querySelectorAll('.move-up-gallery-btn').forEach(btn => {
                btn.onclick = () => {
                    const idx = parseInt(btn.dataset.index);
                    if (idx > 0) {
                        const temp = portfolioGalleryImages[idx];
                        portfolioGalleryImages[idx] = portfolioGalleryImages[idx - 1];
                        portfolioGalleryImages[idx - 1] = temp;
                        renderGallery();
                    }
                };
            });
            
            container.querySelectorAll('.move-down-gallery-btn').forEach(btn => {
                btn.onclick = () => {
                    const idx = parseInt(btn.dataset.index);
                    if (idx < portfolioGalleryImages.length - 1) {
                        const temp = portfolioGalleryImages[idx];
                        portfolioGalleryImages[idx] = portfolioGalleryImages[idx + 1];
                        portfolioGalleryImages[idx + 1] = temp;
                        renderGallery();
                    }
                };
            });
            
            container.querySelectorAll('.del-gallery-btn').forEach(btn => {
                btn.onclick = () => {
                    const idx = parseInt(btn.dataset.index);
                    portfolioGalleryImages.splice(idx, 1);
                    renderGallery();
                };
            });

            // HTML5 Drag & Drop events
            const cards = container.querySelectorAll('.gallery-image-card');
            cards.forEach(card => {
                const idx = parseInt(card.dataset.index);
                card.ondragstart = (e) => {
                    draggedIndex = idx;
                    card.classList.add('dragging');
                    e.dataTransfer.effectAllowed = 'move';
                };
                card.ondragend = () => {
                    card.classList.remove('dragging');
                    draggedIndex = null;
                };
                card.ondragover = (e) => {
                    e.preventDefault();
                    const targetIndex = idx;
                    if (draggedIndex !== null && draggedIndex !== targetIndex) {
                        const temp = portfolioGalleryImages[draggedIndex];
                        portfolioGalleryImages[draggedIndex] = portfolioGalleryImages[targetIndex];
                        portfolioGalleryImages[targetIndex] = temp;
                        draggedIndex = targetIndex;
                        renderGallery();
                    }
                };
            });

            // Render cover selection whenever gallery is updated
            renderCoverSelection();
        };

        const addGalleryImage = (src) => {
            if (!src) return;
            if (portfolioGalleryImages.length >= 5) {
                alert("เพิ่มรูปเพิ่มเติมได้สูงสุด 5 รูปเท่านั้น / Maximum of 5 additional images reached.");
                return;
            }
            if (src === item.image_src) {
                alert("รูปภาพนี้เป็นรูปภาพหลักแล้ว ไม่สามารถเพิ่มในรูปเพิ่มเติมได้ / This image is already the main image.");
                return;
            }
            if (portfolioGalleryImages.includes(src)) {
                alert("คุณได้เลือกรูปภาพนี้ไปแล้ว / This image is already in the gallery.");
                return;
            }
            portfolioGalleryImages.push(src);
            renderGallery();
        };

        document.getElementById('upload-gallery-btn').onclick = () => {
            document.getElementById('port-gallery-file-input').click();
        };

        document.getElementById('port-gallery-file-input').onchange = async (e) => {
            if (e.target.files && e.target.files[0]) {
                try {
                    const webpData = await this.convertImageToWebP(e.target.files[0]);
                    addGalleryImage(webpData);
                } catch (err) {
                    alert("เกิดข้อผิดพลาดในการอัปโหลดไฟล์รูปภาพ / Image upload failed.");
                }
                e.target.value = '';
            }
        };

        document.getElementById('select-gallery-btn').onclick = () => {
            this.openMediaSelectorDialog((selectedBase64) => {
                addGalleryImage(selectedBase64);
            });
        };

        // Render initially
        renderGallery();

        // Form Submit
        document.getElementById('edit-portfolio-form').onsubmit = async (e) => {
            e.preventDefault();
            const descThVal = document.getElementById('port-form-desc-th').value;
            const descEnVal = document.getElementById('port-form-desc-en').value;

            const updated = {
                id: item.id,
                category: document.getElementById('port-form-cat').value,
                title_th: document.getElementById('port-form-title-th').value,
                title_en: document.getElementById('port-form-title-en').value,
                client_name: document.getElementById('port-form-client').value,
                print_color: document.getElementById('port-form-color').value,
                desc_th: descThVal,
                desc_en: descEnVal,
                description_th: descThVal,
                description_en: descEnVal,
                image_src: item.image_src,

                // Store chosen cover image URL
                coverImageUrl: selectedCoverUrl,

                // Normalize gallery images
                gallery_images: portfolioGalleryImages
                    .filter(Boolean)
                    .filter(url => url !== item.image_src)
                    .filter((url, index, arr) => arr.indexOf(url) === index)
                    .slice(0, 5),

                visible: document.getElementById('port-form-visible').checked,
                featured: document.getElementById('port-form-featured').checked,
                order: Number(document.getElementById('port-form-order').value) || 1,
                created_at: item.created_at || new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            await this.db.put('portfolio', updated);
            closeDialog();
            this.renderActiveView();
        };
    }

    async openSlideEditDialog(slideId) {
        let slide = {
            id: 'slide_' + Date.now(),
            title_th: '',
            title_en: '',
            subtitle_th: '',
            subtitle_en: '',
            bg_src: '',
            btn_link: '#/products',
            order: 1,
            published: true,
            visible: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        let isEdit = false;
        if (slideId) {
            const fetched = await this.db.get('slider', slideId);
            if (fetched) {
                slide = fetched;
                isEdit = true;
            }
        } else {
            // Automatically calculate the order: max of existing orders + 1, or 1 if none
            const slides = await this.db.getAll('slider');
            const maxOrder = slides.reduce((max, s) => s.order > max ? s.order : max, 0);
            slide.order = maxOrder + 1;
        }

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';
        overlay.id = 'admin-edit-modal';

        overlay.innerHTML = `
            <div class="modal-window" style="max-width:600px; padding:30px;">
                <button class="modal-close-btn" id="close-modal-btn"><i class="fas fa-times"></i></button>
                <h3 style="font-size:1.25rem; font-weight:800; color:var(--secondary); margin-bottom:20px; border-bottom:1.5px solid var(--border-color); padding-bottom:8px;">
                    ${isEdit ? 'แก้ไขภาพแบนเนอร์สไลด์' : 'เพิ่มแบนเนอร์สไลด์หน้าแรก'}
                </h3>
                
                <form id="edit-slide-form">
                    <div style="display:flex; flex-direction:column; gap:12px; max-height:60vh; overflow-y:auto; padding-right:8px;">
                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">หัวข้อสไลด์ภาษาไทย (TH Title) <span style="color:var(--danger)">*</span></label>
                            <input type="text" id="slide-form-title-th" class="form-control" value="${slide.title_th}" required>
                        </div>
                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">หัวข้อสไลด์ภาษาอังกฤษ (EN Title)</label>
                            <input type="text" id="slide-form-title-en" class="form-control" value="${slide.title_en || ''}">
                        </div>
                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">คำบรรยายใต้สไลด์ภาษาไทย (TH Subtitle)</label>
                            <input type="text" id="slide-form-sub-th" class="form-control" value="${slide.subtitle_th || ''}">
                        </div>
                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">คำบรรยายใต้สไลด์ภาษาอังกฤษ (EN Subtitle)</label>
                            <input type="text" id="slide-form-sub-en" class="form-control" value="${slide.subtitle_en || ''}">
                        </div>
                        
                        <div class="grid-2">
                            <div class="form-group">
                                <label style="font-weight:600; font-size:0.85rem;">ลิงก์ปุ่มกดปลายทาง (Button Link)</label>
                                <input type="text" id="slide-form-link" class="form-control" value="${slide.btn_link || '#/products'}">
                            </div>
                            <div class="form-group">
                                <label style="font-weight:600; font-size:0.85rem;">ลำดับการแสดงผล (Order)</label>
                                <input type="number" id="slide-form-order" class="form-control" value="${slide.order}" min="1" required>
                            </div>
                        </div>

                        <div class="grid-2" style="margin-top: 5px; margin-bottom: 5px;">
                            <div class="form-group" style="display:flex; align-items:center; gap:8px;">
                                <input type="checkbox" id="slide-form-published" style="width:18px; height:18px; cursor:pointer;" ${slide.published !== false ? 'checked' : ''}>
                                <label for="slide-form-published" style="font-weight:600; font-size:0.85rem; cursor:pointer; margin-bottom:0; user-select:none;">เผยแพร่ (Published)</label>
                            </div>
                            <div class="form-group" style="display:flex; align-items:center; gap:8px;">
                                <input type="checkbox" id="slide-form-visible" style="width:18px; height:18px; cursor:pointer;" ${slide.visible !== false ? 'checked' : ''}>
                                <label for="slide-form-visible" style="font-weight:600; font-size:0.85rem; cursor:pointer; margin-bottom:0; user-select:none;">แสดงผล (Visible)</label>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">ภาพพื้นหลังแบนเนอร์สไลด์ (Desktop Background)</label>
                            <div style="display:flex; gap:10px; align-items:center;">
                                <input type="file" id="slide-form-file" class="form-control" accept="image/*" style="padding: 6px; flex-grow:1;">
                                <button type="button" class="btn btn-outline" id="select-slide-media-btn" style="padding:8px 12px; font-size:0.75rem;"><i class="fas fa-folder-open"></i> เลือกจากคลังภาพ</button>
                            </div>
                            
                            <div style="margin-top:10px; text-align:center;">
                                <img src="${slide.bg_src || ''}" id="slide-form-img-preview" style="max-height:120px; border-radius:var(--radius-sm); border:1px solid var(--border-color); display:${slide.bg_src ? 'inline-block' : 'none'};">
                            </div>
                        </div>

                        <div class="form-group" style="margin-top: 12px;">
                            <label style="font-weight:600; font-size:0.85rem;">ภาพพื้นหลังสไลด์สำหรับมือถือ (Optional Mobile Background)</label>
                            <div style="display:flex; gap:10px; align-items:center;">
                                <input type="file" id="slide-form-file-mobile" class="form-control" accept="image/*" style="padding: 6px; flex-grow:1;">
                                <button type="button" class="btn btn-outline" id="select-slide-media-mobile-btn" style="padding:8px 12px; font-size:0.75rem;"><i class="fas fa-folder-open"></i> เลือกจากคลังภาพ</button>
                            </div>
                            
                            <div style="margin-top:10px; text-align:center;">
                                <img src="${slide.bg_src_mobile || ''}" id="slide-form-img-mobile-preview" style="max-height:120px; border-radius:var(--radius-sm); border:1px solid var(--border-color); display:${slide.bg_src_mobile ? 'inline-block' : 'none'};">
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-top:24px; display:flex; gap:12px; justify-content:flex-end;">
                        <button type="button" class="btn btn-outline" id="close-modal-cancel-btn" style="padding:10px 16px;">ยกเลิก</button>
                        <button type="submit" class="btn btn-primary" style="padding:10px 20px;"><i class="fas fa-check"></i> บันทึกสไลด์</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(overlay);
        const closeDialog = () => { overlay.remove(); };
        document.getElementById('close-modal-btn').onclick = closeDialog;
        document.getElementById('close-modal-cancel-btn').onclick = closeDialog;

        // Select from media library
        document.getElementById('select-slide-media-btn').onclick = () => {
            this.openMediaSelectorDialog((selectedBase64) => {
                const preview = document.getElementById('slide-form-img-preview');
                preview.src = selectedBase64;
                preview.style.display = 'inline-block';
                slide.bg_src = selectedBase64;
            });
        };

        // Select from media library (Mobile)
        document.getElementById('select-slide-media-mobile-btn').onclick = () => {
            this.openMediaSelectorDialog((selectedBase64) => {
                const preview = document.getElementById('slide-form-img-mobile-preview');
                preview.src = selectedBase64;
                preview.style.display = 'inline-block';
                slide.bg_src_mobile = selectedBase64;
            });
        };

        // File Uploader
        const fileInput = document.getElementById('slide-form-file');
        if (fileInput) {
            fileInput.onchange = async (e) => {
                if (e.target.files && e.target.files[0]) {
                    const webpData = await this.convertImageToWebP(e.target.files[0]);
                    const preview = document.getElementById('slide-form-img-preview');
                    preview.src = webpData;
                    preview.style.display = 'inline-block';
                    slide.bg_src = webpData;
                }
            };
        }

        // File Uploader (Mobile)
        const fileMobileInput = document.getElementById('slide-form-file-mobile');
        if (fileMobileInput) {
            fileMobileInput.onchange = async (e) => {
                if (e.target.files && e.target.files[0]) {
                    const webpData = await this.convertImageToWebP(e.target.files[0]);
                    const preview = document.getElementById('slide-form-img-mobile-preview');
                    preview.src = webpData;
                    preview.style.display = 'inline-block';
                    slide.bg_src_mobile = webpData;
                }
            };
        }

        // Form Submit
        document.getElementById('edit-slide-form').onsubmit = async (e) => {
            e.preventDefault();
            const updated = {
                id: slide.id,
                title_th: document.getElementById('slide-form-title-th').value,
                title_en: document.getElementById('slide-form-title-en').value,
                subtitle_th: document.getElementById('slide-form-sub-th').value,
                subtitle_en: document.getElementById('slide-form-sub-en').value,
                btn_link: document.getElementById('slide-form-link').value,
                order: parseInt(document.getElementById('slide-form-order').value),
                bg_src: slide.bg_src,
                bg_src_mobile: slide.bg_src_mobile || '',
                published: document.getElementById('slide-form-published').checked,
                visible: document.getElementById('slide-form-visible').checked,
                created_at: slide.created_at || new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            await this.db.put('slider', updated);
            closeDialog();
            this.renderActiveView();
        };
    }

    async openProductSlideEditDialog(slideId) {
        let slide = {
            id: 'product_slide_' + Date.now(),
            title_th: '',
            title_en: '',
            subtitle_th: '',
            subtitle_en: '',
            bg_src: '',
            btn_link: '#/products',
            order: 1,
            published: true,
            visible: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        let isEdit = false;
        if (slideId) {
            const fetched = await this.db.get('product_slider', slideId);
            if (fetched) {
                slide = fetched;
                isEdit = true;
            }
        } else {
            const slides = await this.db.getAll('product_slider');
            const maxOrder = slides.reduce((max, s) => s.order > max ? s.order : max, 0);
            slide.order = maxOrder + 1;
        }

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';
        overlay.id = 'admin-edit-modal';

        overlay.innerHTML = `
            <div class="modal-window" style="max-width:600px; padding:30px;">
                <button class="modal-close-btn" id="close-modal-btn"><i class="fas fa-times"></i></button>
                <h3 style="font-size:1.25rem; font-weight:800; color:var(--secondary); margin-bottom:20px; border-bottom:1.5px solid var(--border-color); padding-bottom:8px;">
                    ${isEdit ? 'แก้ไขภาพแบนเนอร์สไลด์หน้าสินค้า' : 'เพิ่มแบนเนอร์สไลด์หน้าสินค้าใหม่'}
                </h3>
                
                <form id="edit-product-slide-form">
                    <div style="display:flex; flex-direction:column; gap:12px; max-height:60vh; overflow-y:auto; padding-right:8px;">
                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">หัวข้อสไลด์ภาษาไทย (TH Title) <span style="color:var(--danger)">*</span></label>
                            <input type="text" id="slide-form-title-th" class="form-control" value="${slide.title_th}" required>
                        </div>
                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">หัวข้อสไลด์ภาษาอังกฤษ (EN Title)</label>
                            <input type="text" id="slide-form-title-en" class="form-control" value="${slide.title_en || ''}">
                        </div>
                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">คำบรรยายใต้สไลด์ภาษาไทย (TH Subtitle)</label>
                            <input type="text" id="slide-form-sub-th" class="form-control" value="${slide.subtitle_th || ''}">
                        </div>
                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">คำบรรยายใต้สไลด์ภาษาอังกฤษ (EN Subtitle)</label>
                            <input type="text" id="slide-form-sub-en" class="form-control" value="${slide.subtitle_en || ''}">
                        </div>
                        
                        <div class="grid-2">
                            <div class="form-group">
                                <label style="font-weight:600; font-size:0.85rem;">ลิงก์ปุ่มกดปลายทาง (Button Link)</label>
                                <input type="text" id="slide-form-link" class="form-control" value="${slide.btn_link || '#/products'}">
                            </div>
                            <div class="form-group">
                                <label style="font-weight:600; font-size:0.85rem;">ลำดับการแสดงผล (Order)</label>
                                <input type="number" id="slide-form-order" class="form-control" value="${slide.order}" min="1" required>
                            </div>
                        </div>

                        <div class="grid-2" style="margin-top: 5px; margin-bottom: 5px;">
                            <div class="form-group" style="display:flex; align-items:center; gap:8px;">
                                <input type="checkbox" id="slide-form-published" style="width:18px; height:18px; cursor:pointer;" ${slide.published !== false ? 'checked' : ''}>
                                <label for="slide-form-published" style="font-weight:600; font-size:0.85rem; cursor:pointer; margin-bottom:0; user-select:none;">เผยแพร่ (Published)</label>
                            </div>
                            <div class="form-group" style="display:flex; align-items:center; gap:8px;">
                                <input type="checkbox" id="slide-form-visible" style="width:18px; height:18px; cursor:pointer;" ${slide.visible !== false ? 'checked' : ''}>
                                <label for="slide-form-visible" style="font-weight:600; font-size:0.85rem; cursor:pointer; margin-bottom:0; user-select:none;">แสดงผล (Visible)</label>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">ภาพพื้นหลังแบนเนอร์สไลด์ (Desktop Background)</label>
                            <div style="display:flex; gap:10px; align-items:center;">
                                <input type="file" id="slide-form-file" class="form-control" accept="image/*" style="padding: 6px; flex-grow:1;">
                                <button type="button" class="btn btn-outline" id="select-slide-media-btn" style="padding:8px 12px; font-size:0.75rem;"><i class="fas fa-folder-open"></i> เลือกจากคลังภาพ</button>
                            </div>
                            
                            <div style="margin-top:10px; text-align:center;">
                                <img src="${slide.bg_src || ''}" id="slide-form-img-preview" style="max-height:120px; border-radius:var(--radius-sm); border:1px solid var(--border-color); display:${slide.bg_src ? 'inline-block' : 'none'};">
                            </div>
                        </div>

                        <div class="form-group" style="margin-top: 12px;">
                            <label style="font-weight:600; font-size:0.85rem;">ภาพพื้นหลังสไลด์สำหรับมือถือ (Optional Mobile Background)</label>
                            <div style="display:flex; gap:10px; align-items:center;">
                                <input type="file" id="slide-form-file-mobile" class="form-control" accept="image/*" style="padding: 6px; flex-grow:1;">
                                <button type="button" class="btn btn-outline" id="select-slide-media-mobile-btn" style="padding:8px 12px; font-size:0.75rem;"><i class="fas fa-folder-open"></i> เลือกจากคลังภาพ</button>
                            </div>
                            
                            <div style="margin-top:10px; text-align:center;">
                                <img src="${slide.bg_src_mobile || ''}" id="slide-form-img-mobile-preview" style="max-height:120px; border-radius:var(--radius-sm); border:1px solid var(--border-color); display:${slide.bg_src_mobile ? 'inline-block' : 'none'};">
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-top:24px; display:flex; gap:12px; justify-content:flex-end;">
                        <button type="button" class="btn btn-outline" id="close-modal-cancel-btn" style="padding:10px 16px;">ยกเลิก</button>
                        <button type="submit" class="btn btn-primary" style="padding:10px 20px;"><i class="fas fa-check"></i> บันทึกสไลด์</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(overlay);
        const closeDialog = () => { overlay.remove(); };
        document.getElementById('close-modal-btn').onclick = closeDialog;
        document.getElementById('close-modal-cancel-btn').onclick = closeDialog;

        // Select from media library
        document.getElementById('select-slide-media-btn').onclick = () => {
            this.openMediaSelectorDialog((selectedBase64) => {
                const preview = document.getElementById('slide-form-img-preview');
                preview.src = selectedBase64;
                preview.style.display = 'inline-block';
                slide.bg_src = selectedBase64;
            });
        };

        // Select from media library (Mobile)
        document.getElementById('select-slide-media-mobile-btn').onclick = () => {
            this.openMediaSelectorDialog((selectedBase64) => {
                const preview = document.getElementById('slide-form-img-mobile-preview');
                preview.src = selectedBase64;
                preview.style.display = 'inline-block';
                slide.bg_src_mobile = selectedBase64;
            });
        };

        // File Uploader
        const fileInput = document.getElementById('slide-form-file');
        if (fileInput) {
            fileInput.onchange = async (e) => {
                if (e.target.files && e.target.files[0]) {
                    const webpData = await this.convertImageToWebP(e.target.files[0]);
                    const preview = document.getElementById('slide-form-img-preview');
                    preview.src = webpData;
                    preview.style.display = 'inline-block';
                    slide.bg_src = webpData;
                }
            };
        }

        // File Uploader (Mobile)
        const fileMobileInput = document.getElementById('slide-form-file-mobile');
        if (fileMobileInput) {
            fileMobileInput.onchange = async (e) => {
                if (e.target.files && e.target.files[0]) {
                    const webpData = await this.convertImageToWebP(e.target.files[0]);
                    const preview = document.getElementById('slide-form-img-mobile-preview');
                    preview.src = webpData;
                    preview.style.display = 'inline-block';
                    slide.bg_src_mobile = webpData;
                }
            };
        }

        // Form Submit
        document.getElementById('edit-product-slide-form').onsubmit = async (e) => {
            e.preventDefault();
            const updated = {
                id: slide.id,
                title_th: document.getElementById('slide-form-title-th').value,
                title_en: document.getElementById('slide-form-title-en').value,
                subtitle_th: document.getElementById('slide-form-sub-th').value,
                subtitle_en: document.getElementById('slide-form-sub-en').value,
                btn_link: document.getElementById('slide-form-link').value,
                order: parseInt(document.getElementById('slide-form-order').value),
                bg_src: slide.bg_src,
                bg_src_mobile: slide.bg_src_mobile || '',
                published: document.getElementById('slide-form-published').checked,
                visible: document.getElementById('slide-form-visible').checked,
                created_at: slide.created_at || new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            await this.db.put('product_slider', updated);
            closeDialog();
            this.renderActiveView();
        };
    }

    async openHomeVideoEditDialog(videoId) {
        let video = {
            id: videoId,
            title_th: '',
            title_en: '',
            desc_th: '',
            desc_en: '',
            poster_src: '',
            video_src: '',
            order: 1
        };

        const fetched = await this.db.get('home_videos', videoId);
        if (fetched) {
            video = fetched;
        }

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';
        overlay.id = 'admin-edit-modal';

        overlay.innerHTML = `
            <div class="modal-window" style="max-width:600px; padding:30px;">
                <button class="modal-close-btn" id="close-modal-btn"><i class="fas fa-times"></i></button>
                <h3 style="font-size:1.25rem; font-weight:800; color:var(--secondary); margin-bottom:20px; border-bottom:1.5px solid var(--border-color); padding-bottom:8px;">
                    แก้ไขคลิปวิดีโอแนะนำหน้าแรก
                </h3>
                
                <form id="edit-home-video-form">
                    <div style="display:flex; flex-direction:column; gap:12px; max-height:60vh; overflow-y:auto; padding-right:8px;">
                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">หัวข้อวิดีโอภาษาไทย (TH Title) <span style="color:var(--danger)">*</span></label>
                            <input type="text" id="vid-form-title-th" class="form-control" value="${video.title_th}" required>
                        </div>
                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">หัวข้อวิดีโอภาษาอังกฤษ (EN Title)</label>
                            <input type="text" id="vid-form-title-en" class="form-control" value="${video.title_en || ''}">
                        </div>
                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">คำบรรยายอธิบายภาษาไทย (TH Description)</label>
                            <textarea id="vid-form-desc-th" class="form-control" style="min-height:50px;">${video.desc_th || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">คำบรรยายอธิบายภาษาอังกฤษ (EN Description)</label>
                            <textarea id="vid-form-desc-en" class="form-control" style="min-height:50px;">${video.desc_en || ''}</textarea>
                        </div>
                        
                        <!-- Thumbnail/Poster upload -->
                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">ภาพหน้าปกวิดีโอ (Thumbnail / Poster)</label>
                            <div style="display:flex; gap:10px; align-items:center;">
                                <input type="file" id="vid-form-poster-file" class="form-control" accept="image/*" style="padding:6px; flex-grow:1;">
                                <button type="button" class="btn btn-outline" id="select-vid-poster-btn" style="padding:8px 12px; font-size:0.75rem;"><i class="fas fa-folder-open"></i> เลือกจากคลังภาพ</button>
                            </div>
                            <div style="margin-top:10px; text-align:center;">
                                <img src="${video.poster_src || ''}" id="vid-form-poster-preview" style="max-height:80px; border-radius:var(--radius-sm); border:1px solid var(--border-color); display:${video.poster_src ? 'inline-block' : 'none'};">
                            </div>
                        </div>

                        <!-- Video file upload (Max 20MB limit!) -->
                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">อัปโหลดคลิปวิดีโอ (MP4/WebM - ขนาดไฟล์ห้ามเกิน 20MB) <span style="color:var(--danger)">*</span></label>
                            <div style="display:flex; gap:10px; align-items:center;">
                                <input type="file" id="vid-form-file" class="form-control" accept="video/mp4,video/webm" style="padding: 6px; flex-grow:1;" ${!video.video_src ? 'required' : ''}>
                                <button type="button" class="btn btn-outline" id="select-vid-media-btn" style="padding:8px 12px; font-size:0.75rem;"><i class="fas fa-folder-open"></i> เลือกจากคลังสื่อ</button>
                            </div>
                            <div style="font-size:0.72rem; color:var(--text-muted); margin-top:2px;">(หากต้องการความลื่นไหล ควรบีบอัดไฟล์ให้อยู่ระหว่าง 2MB - 10MB)</div>
                            
                            <div style="margin-top:10px; text-align:center;">
                                <span id="vid-form-file-status" style="font-size:0.8rem; font-weight:700; color:var(--success); display:${video.video_src ? 'inline' : 'none'};"><i class="fas fa-check-circle"></i> มีไฟล์วิดีโอพร้อมแสดงผลเรียบร้อยแล้ว</span>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-top:24px; display:flex; gap:12px; justify-content:flex-end;">
                        <button type="button" class="btn btn-outline" id="close-modal-cancel-btn" style="padding:10px 16px;">ยกเลิก</button>
                        <button type="submit" class="btn btn-primary" id="vid-form-submit-btn" style="padding:10px 20px;"><i class="fas fa-check"></i> บันทึกข้อมูลวิดีโอ</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(overlay);
        const closeDialog = () => { overlay.remove(); };
        document.getElementById('close-modal-btn').onclick = closeDialog;
        document.getElementById('close-modal-cancel-btn').onclick = closeDialog;

        // Select poster
        document.getElementById('select-vid-poster-btn').onclick = () => {
            this.openMediaSelectorDialog((selectedBase64) => {
                const preview = document.getElementById('vid-form-poster-preview');
                preview.src = selectedBase64;
                preview.style.display = 'inline-block';
                video.poster_src = selectedBase64;
            });
        };

        // Poster file upload
        const posterInput = document.getElementById('vid-form-poster-file');
        if (posterInput) {
            posterInput.onchange = async (e) => {
                if (e.target.files && e.target.files[0]) {
                    const webpData = await this.convertImageToWebP(e.target.files[0]);
                    const preview = document.getElementById('vid-form-poster-preview');
                    preview.src = webpData;
                    preview.style.display = 'inline-block';
                    video.poster_src = webpData;
                }
            };
        }

        // Select video from library
        document.getElementById('select-vid-media-btn').onclick = () => {
            this.openMediaSelectorDialog((selectedBase64) => {
                const status = document.getElementById('vid-form-file-status');
                status.textContent = 'เลือกไฟล์จากคลังเรียบร้อยแล้ว';
                status.style.display = 'inline';
                video.video_src = selectedBase64;
            }, true); // Filter only videos
        };

        // Video file selector with 20MB limit checking
        const videoInput = document.getElementById('vid-form-file');
        if (videoInput) {
            videoInput.onchange = async (e) => {
                if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    if (file.size > 20 * 1024 * 1024) {
                        alert('ข้อผิดพลาด: ไฟล์วิดีโอที่ท่านเลือกมีขนาดใหญ่เกิน 20MB!\n\nกรุณาเลือกไฟล์ใหม่ที่มีขนาดเล็กกว่า 20MB หรือนำคลิปไปบีบอัดความละเอียดลงก่อนอัปโหลดครับ');
                        videoInput.value = ''; // Reset
                        return;
                    }

                    // Show loader spinner
                    const status = document.getElementById('vid-form-file-status');
                    status.innerHTML = `<i class="fas fa-spinner fa-spin"></i> กำลังประมวลผลไฟล์คลิป...`;
                    status.style.display = 'inline';
                    
                    try {
                        const videoBase64 = await new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = () => resolve(reader.result);
                            reader.onerror = () => reject(reader.error);
                            reader.readAsDataURL(file);
                        });
                        
                        video.video_src = videoBase64;
                        status.innerHTML = `<i class="fas fa-check-circle"></i> โหลดวิดีโอใหม่สำเร็จ (${(file.size / (1024 * 1024)).toFixed(2)} MB)`;
                    } catch (err) {
                        alert('เกิดข้อผิดพลาดในการโหลดไฟล์คลิป: ' + err.message);
                        status.style.display = 'none';
                    }
                }
            };
        }

        // Form Submit
        document.getElementById('edit-home-video-form').onsubmit = async (e) => {
            e.preventDefault();
            
            const updated = {
                id: video.id,
                title_th: document.getElementById('vid-form-title-th').value,
                title_en: document.getElementById('vid-form-title-en').value,
                desc_th: document.getElementById('vid-form-desc-th').value,
                desc_en: document.getElementById('vid-form-desc-en').value,
                poster_src: video.poster_src,
                video_src: video.video_src,
                order: video.order
            };

            await this.db.put('home_videos', updated);
            closeDialog();
            this.renderActiveView();
        };
    }

    // Media Categories Manager Dialog
    async openMediaCategoriesDialog() {
        const categories = await this.db.getAll('media_categories');
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';
        overlay.id = 'admin-med-cat-modal';
        overlay.style.zIndex = '15000';

        overlay.innerHTML = `
            <div class="modal-window" style="max-width:450px; padding:24px;">
                <button class="modal-close-btn" onclick="this.parentNode.parentNode.remove()"><i class="fas fa-times"></i></button>
                <h3 style="font-size:1.15rem; font-weight:800; color:var(--secondary); margin-bottom:16px;">จัดการหมวดหมู่ในคลังสื่อ</h3>
                
                <!-- Category List -->
                <div style="max-height:200px; overflow-y:auto; border:1px solid var(--border-color); padding:10px; border-radius:var(--radius-sm); margin-bottom:16px;">
                    <ul style="list-style:none; display:flex; flex-direction:column; gap:8px;">
                        ${categories.map(c => `
                            <li style="display:flex; justify-content:space-between; align-items:center; font-size:0.85rem;">
                                <span><strong>${c.name_th}</strong> (<code>${c.id}</code>)</span>
                                ${['med-logo', 'med-raw', 'med-print', 'med-banner', 'med-video', 'med-other'].includes(c.id) ? `
                                    <span style="font-size:0.75rem; color:var(--text-muted);">ระบบล็อคไว้</span>
                                ` : `
                                    <button onclick="window.charoenAdminApp.deleteMediaCategory('${c.id}')" style="border:none; background:none; color:var(--danger); cursor:pointer;"><i class="fas fa-trash"></i></button>
                                `}
                            </li>
                        `).join('')}
                    </ul>
                </div>
                
                <!-- Add new media category form -->
                <form id="add-media-cat-form">
                    <h4 style="font-size:0.85rem; font-weight:700; color:var(--secondary); margin-bottom:8px;">เพิ่มหมวดหมู่ใหม่</h4>
                    <div style="display:flex; flex-direction:column; gap:8px;">
                        <input type="text" id="new-med-cat-id" class="form-control" placeholder="รหัส ID หมวดหมู่ เช่น med-custom" required style="font-size:0.8rem; padding:8px;">
                        <input type="text" id="new-med-cat-name" class="form-control" placeholder="ชื่อหมวดหมู่ภาษาไทย" required style="font-size:0.8rem; padding:8px;">
                        <button type="submit" class="btn btn-primary" style="padding:8px; font-size:0.8rem; width:100%;"><i class="fas fa-plus"></i> เพิ่มเข้าสู่ระบบ</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(overlay);

        document.getElementById('add-media-cat-form').onsubmit = async (e) => {
            e.preventDefault();
            const id = document.getElementById('new-med-cat-id').value.trim().toLowerCase().replace(/\s+/g, '-');
            const name = document.getElementById('new-med-cat-name').value.trim();

            if (!id.startsWith('med-')) {
                alert("ข้อแนะนำ: รหัส ID หมวดหมู่สื่อ ควรขึ้นต้นด้วยคำว่า 'med-' เสมอ เพื่อความเป็นระเบียบ (เช่น med-logo, med-custom)");
            }

            const newMc = { id: id, name_th: name, name_en: name };
            await this.db.put('media_categories', newMc);
            overlay.remove();
            this.renderActiveView();
        };
    }

    async deleteMediaCategory(id) {
        if (confirm('คุณต้องการลบหมวดหมู่สื่อรายการนี้ใช่หรือไม่?')) {
            await this.db.delete('media_categories', id);
            const modal = document.getElementById('admin-med-cat-modal');
            if (modal) modal.remove();
            this.renderActiveView();
        }
    }

    // Media Selector Modal Dialog (For binding image sources to products/portfolio/videos)
    async openMediaSelectorDialog(callback, filterVideosOnly = false) {
        const media = await this.db.getAll('media');
        const categories = await this.db.getAll('media_categories');
        
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';
        overlay.style.zIndex = '25000';

        let filteredMedia = media;
        if (filterVideosOnly) {
            filteredMedia = media.filter(m => m.category === 'med-video');
        }

        overlay.innerHTML = `
            <div class="modal-window" style="max-width:700px; padding:24px;">
                <button class="modal-close-btn" onclick="this.parentNode.parentNode.remove()"><i class="fas fa-times"></i></button>
                <h3 style="font-size:1.15rem; font-weight:800; color:var(--secondary); margin-bottom:16px;">
                    ${filterVideosOnly ? 'เลือกไฟล์วิดีโอจากคลังสื่อ' : 'เลือกรูปภาพ WebP จากคลังสื่อ'}
                </h3>
                
                <div style="max-height:400px; overflow-y:auto; border:1px solid var(--border-color); border-radius:var(--radius-md); padding:16px; background:var(--bg-sec);">
                    ${filteredMedia.length === 0 ? `
                        <p style="color:var(--text-muted); text-align:center; padding:50px 0;">ไม่มีไฟล์ที่ตรงกับการค้นหาในคลัง กรุณาปิดแล้วทำการอัปโหลดไฟล์เข้าระบบก่อนใช้งานครับ</p>
                    ` : `
                        <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:12px;">
                            ${filteredMedia.map(m => {
                                const isVideo = m.image_src.startsWith('data:video/') || m.name.endsWith('.mp4') || m.name.endsWith('.webm');
                                return `
                                    <div class="media-select-card" data-src="${m.image_src}" data-name="${m.name}" style="border:1px solid var(--border-color); border-radius:var(--radius-sm); overflow:hidden; background:var(--bg-main); cursor:pointer; position:relative; transition:var(--transition);">
                                        <div style="aspect-ratio:1/1; display:flex; align-items:center; justify-content:center; overflow:hidden; background:#e2e8f0;">
                                            ${isVideo ? `
                                                <div style="color:var(--secondary); text-align:center; font-size:1.5rem;">
                                                    <i class="fas fa-file-video"></i>
                                                    <div style="font-size:0.6rem; color:var(--text-muted); margin-top:4px;">VIDEO</div>
                                                </div>
                                            ` : `
                                                <img src="${m.image_src}" style="width:100%; height:100%; object-fit:cover;">
                                            `}
                                        </div>
                                        <div style="padding:6px; font-size:0.7rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                                            ${m.name}
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `}
                </div>
                
                <div style="margin-top:20px; text-align:right;">
                    <button class="btn btn-outline" onclick="this.parentNode.parentNode.remove()" style="padding:8px 16px;">ยกเลิก</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Bind clicks on items
        overlay.querySelectorAll('.media-select-card').forEach(card => {
            card.onclick = () => {
                const src = card.dataset.src;
                const name = card.dataset.name || '';
                callback(src, name);
                overlay.remove();
            };
        });
    }

    // --- Homepage Section Layout Manager ---
    async loadHomepageView(container) {
        const sections = await this.db.getAll('homepage');
        const sortedSecs = [...sections].sort((a, b) => a.order - b.order);

        container.innerHTML = `
            <div style="margin-bottom:20px; display:flex; justify-content:space-between; align-items:center;">
                <p style="color:var(--text-muted); font-size:0.9rem;">
                    สามารถเปิด/ปิด ซ่อนเนื้อหา หรือเปลี่ยนลำดับการแสดงผลของเซกชันหลักทั้ง 11 จุดบนหน้าแรกได้ทันที
                </p>
                <button class="btn btn-primary" id="save-homepage-layout-btn"><i class="fas fa-save"></i> บันทึกโครงสร้างเลย์เอาต์</button>
            </div>
            
            <div class="admin-card">
                <div style="overflow-x:auto;">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>ลำดับ</th>
                                <th>จุดเซกชันหลัก</th>
                                <th>รหัสจำแนก</th>
                                <th>สถานะแสดงผล</th>
                                <th>การจัดเรียง</th>
                                <th style="text-align:right;">ตั้งค่าข้อมูล</th>
                            </tr>
                        </thead>
                        <tbody id="homepage-sections-tbody">
                            ${sortedSecs.map((sec, idx) => {
                                let label = sec.type;
                                if (sec.type === 'hero_banner') label = 'ภาพสไลด์แบนเนอร์หลัก (Hero Slider)';
                                if (sec.type === 'about_company') label = 'ข้อมูลแนะนำบริษัทร้าน (About Us)';
                                if (sec.type === 'strengths') label = 'จุดเด่นแบรนด์บริษัท (Strengths)';
                                if (sec.type === 'services') label = 'หมวดหมู่สินค้าหลัก (Services/Categories)';
                                if (sec.type === 'why_us') label = 'ทำไมต้องเลือกเรา (Why Choose Us)';
                                if (sec.type === 'steps') label = 'ขั้นตอนการผลิตสั่งพิมพ์ (Steps)';
                                if (sec.type === 'featured_portfolio') label = 'ผลงานสกรีนล่าสุด (Featured Gallery)';
                                if (sec.type === 'clients') label = 'โลโก้ร้านค้าลูกค้าพันธมิตร (Partners Logos)';
                                if (sec.type === 'reviews') label = 'รีวิวลูกค้า (Customer Reviews)';
                                if (sec.type === 'latest_news') label = 'กิจกรรมและการสนับสนุน (Activities & Support)';
                                if (sec.type === 'contact_info') label = 'ฟอร์มการติดต่อรวดเร็ว (Quick Contact)';

                                return `
                                    <tr data-id="${sec.id}" class="homepage-layout-row">
                                        <td style="width:50px;">${idx + 1}</td>
                                        <td><strong>${label}</strong></td>
                                        <td><code>${sec.type}</code></td>
                                        <td>
                                            <label style="display:inline-flex; align-items:center; gap:6px; cursor:pointer; font-weight:700;">
                                                <input type="checkbox" class="sec-vis-check" ${sec.visible ? 'checked' : ''}>
                                                ${sec.visible ? '<span style="color:var(--success);">แสดงผล</span>' : '<span style="color:var(--text-muted);">ซ่อนไว้</span>'}
                                            </label>
                                        </td>
                                        <td style="width:120px;">
                                            <input type="number" class="form-control sec-order-input" value="${sec.order}" min="1" style="padding:4px 8px; font-size:0.85rem;">
                                        </td>
                                        <td style="text-align:right;">
                                            <button class="btn btn-outline edit-sec-btn" data-id="${sec.id}" style="padding:6px 12px; font-size:0.75rem; border-color:var(--secondary); color:var(--secondary);"><i class="fas fa-edit"></i> แก้ไขเนื้อหา</button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Save Layout Handler
        document.getElementById('save-homepage-layout-btn').onclick = async () => {
            try {
                const rows = document.querySelectorAll('.homepage-layout-row');
                for (const row of rows) {
                    const id = row.dataset.id;
                    const visible = row.querySelector('.sec-vis-check').checked;
                    const order = parseInt(row.querySelector('.sec-order-input').value) || 1;

                    const secObj = await this.db.get('homepage', id);
                    if (secObj) {
                        secObj.visible = visible;
                        secObj.order = order;
                        if (!secObj.created_at) {
                            secObj.created_at = new Date().toISOString();
                        }
                        secObj.updated_at = new Date().toISOString();
                        await this.db.put('homepage', secObj);
                    }
                }
                alert('บันทึกโครงสร้างลำดับหน้าแรกและการแสดงผลสำเร็จเรียบร้อยแล้ว!');
                this.renderActiveView();
            } catch (err) {
                alert(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูลโครงสร้างไปยังระบบคลาวด์');
            }
        };

        // Edit Section Content Click Handler
        document.querySelectorAll('.edit-sec-btn').forEach(btn => {
            btn.onclick = () => this.openSectionEditDialog(btn.dataset.id);
        });
    }

    async openSectionEditDialog(secId) {
        const sec = await this.db.get('homepage', secId);
        if (!sec) return;

        // Backward compatibility parser
        if (sec.content && typeof sec.content === 'string') {
            try {
                sec.content = JSON.parse(sec.content);
            } catch (err) {
                console.warn("Failed to parse section content JSON string:", err);
            }
        }
        if (sec.content && typeof sec.content === 'object') {
            const nestedArrayKeys = ['items', 'steps', 'reviews'];
            for (const arrKey of nestedArrayKeys) {
                if (sec.content[arrKey] && typeof sec.content[arrKey] === 'string') {
                    try {
                        sec.content[arrKey] = JSON.parse(sec.content[arrKey]);
                    } catch (err) {
                        console.warn(`Failed to parse content.${arrKey} JSON string:`, err);
                        sec.content[arrKey] = [];
                    }
                }
            }
        }

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';
        overlay.id = 'admin-edit-modal';

        // Helper for robust overlay normalization (0 to 80 integer percentage)
        window.normalizeSectionOverlay = (raw) => {
            if (raw === undefined || raw === null || raw === '') return 55;
            let val = Number(raw);
            if (!Number.isFinite(val)) return 55;
            if (val > 0 && val <= 1) val = val * 100;
            return Math.min(80, Math.max(0, Math.round(val)));
        };

        // Reusable helper function to generate Section Background Appearance Panel HTML
        window.renderBgAppearancePanelHtml = (sectionObj) => {
            const bgStyle = sectionObj.content?.backgroundStyle || sectionObj.backgroundStyle || 'line_art';
            const bgImg = sectionObj.content?.backgroundImage || sectionObj.backgroundImage || '';
            const bgOverlay = window.normalizeSectionOverlay(sectionObj.content?.backgroundOverlay ?? sectionObj.backgroundOverlay);
            const bgPos = sectionObj.content?.backgroundPosition || sectionObj.backgroundPosition || 'center center';
            const bgBrightness = sectionObj.content?.backgroundBrightness !== undefined ? sectionObj.content.backgroundBrightness : 100;
            const bgTextTheme = sectionObj.content?.backgroundTextTheme || sectionObj.backgroundTextTheme || 'auto';
            const rawBgAttachment = sectionObj.content?.backgroundAttachment ?? sectionObj.backgroundAttachment;
            const bgAttachment = rawBgAttachment === 'fixed' ? 'fixed' : 'scroll';

            window.currentActiveSecBgImg = bgImg;

            return `
                <!-- Collapsible Background Appearance Panel (Milestone 4.5 & 4.5.1) -->
                <details class="bg-appearance-panel" style="margin:20px 0; background:var(--bg-main); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:12px 16px;">
                    <summary style="font-weight:700; color:var(--primary); cursor:pointer; font-size:0.9rem; display:flex; align-items:center; justify-content:space-between;">
                        <span><i class="fas fa-paint-roller" style="color:var(--secondary); margin-right:8px;"></i> การตั้งค่าพื้นหลังเซกชัน (Background Appearance)</span>
                        <i class="fas fa-chevron-down" style="font-size:0.8rem; color:var(--text-sec);"></i>
                    </summary>
                    
                    <div style="margin-top:16px; padding-top:12px; border-top:1px dashed var(--border-color);">
                        <!-- 1. Background Style -->
                        <div class="form-group" style="margin-bottom:14px;">
                            <label style="font-weight:700; font-size:0.82rem; color:var(--primary); display:block; margin-bottom:8px;">
                                1. รูปแบบพื้นหลัง (Background Style)
                            </label>
                            <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:10px;">
                                <label style="display:flex; align-items:center; gap:8px; padding:8px 12px; background:var(--bg-sec); border:1px solid var(--border-color); border-radius:var(--radius-sm); cursor:pointer; font-size:0.82rem;">
                                    <input type="radio" name="bg-style-radio" value="solid_color" ${bgStyle === 'solid_color' ? 'checked' : ''} onchange="window.toggleBgStyleControls(this.value)"> Solid Color (สีเรียบ)
                                </label>
                                <label style="display:flex; align-items:center; gap:8px; padding:8px 12px; background:var(--bg-sec); border:1px solid var(--border-color); border-radius:var(--radius-sm); cursor:pointer; font-size:0.82rem;">
                                    <input type="radio" name="bg-style-radio" value="line_art" ${bgStyle === 'line_art' ? 'checked' : ''} onchange="window.toggleBgStyleControls(this.value)"> Decorative Line Art (ลายเส้น)
                                </label>
                                <label style="display:flex; align-items:center; gap:8px; padding:8px 12px; background:var(--bg-sec); border:1px solid var(--border-color); border-radius:var(--radius-sm); cursor:pointer; font-size:0.82rem;">
                                    <input type="radio" name="bg-style-radio" value="image" ${bgStyle === 'image' ? 'checked' : ''} onchange="window.toggleBgStyleControls(this.value)"> Background Image (รูปภาพ)
                                </label>
                                <label style="display:flex; align-items:center; gap:8px; padding:8px 12px; background:var(--bg-sec); border:1px solid var(--border-color); border-radius:var(--radius-sm); cursor:pointer; font-size:0.82rem;">
                                    <input type="radio" name="bg-style-radio" value="image_line_art" ${bgStyle === 'image_line_art' ? 'checked' : ''} onchange="window.toggleBgStyleControls(this.value)"> Background Image + Line Art
                                </label>
                            </div>
                        </div>

                        <!-- Image Controls Box -->
                        <div id="bg-img-controls-box" style="display:${(bgStyle === 'image' || bgStyle === 'image_line_art') ? 'block' : 'none'};">
                            <!-- 2. Background Image Upload -->
                            <div class="form-group" style="background:var(--bg-sec); padding:12px; border-radius:var(--radius-sm); border:1px solid var(--border-color); margin-bottom:14px;">
                                <label style="font-weight:700; font-size:0.82rem; color:var(--primary); display:block; margin-bottom:6px;">
                                    2. อัปโหลดรูปภาพพื้นหลัง (Supported: JPG, PNG, WEBP)
                                </label>
                                <div style="display:flex; gap:8px; align-items:center; margin-bottom:8px;">
                                    <input type="file" id="sec-bg-file" class="form-control" accept="image/*" style="padding:4px; font-size:0.75rem; flex-grow:1;" onchange="window.uploadSecBgFile(this)">
                                    <button type="button" class="btn btn-outline" onclick="window.selectSecBgMedia()" style="padding:6px 10px; font-size:0.72rem;"><i class="fas fa-folder-open"></i> คลังภาพ</button>
                                    <button type="button" class="btn btn-outline" id="remove-sec-bg-btn" onclick="window.removeSecBgImg()" style="padding:6px 10px; font-size:0.72rem; color:var(--danger); border-color:var(--danger); display:${bgImg ? 'inline-flex' : 'none'};"><i class="fas fa-trash"></i> ลบรูป</button>
                                </div>
                                <div style="text-align:center;">
                                    <img id="sec-bg-img-preview" src="${bgImg}" style="max-height:100px; max-width:100%; border-radius:var(--radius-sm); border:1px solid var(--border-color); display:${bgImg ? 'inline-block' : 'none'}; object-fit:cover;">
                                    <div id="sec-bg-img-empty" style="padding:10px; background:var(--bg-main); border:1px dashed var(--border-color); border-radius:var(--radius-sm); font-size:0.75rem; color:var(--text-sec); display:${bgImg ? 'none' : 'block'};">
                                        <i class="fas fa-info-circle" style="color:var(--secondary);"></i> ยังไม่ได้เลือกรูปภาพพื้นหลัง
                                    </div>
                                </div>
                            </div>

                            <!-- 3. Overlay Slider (0-80%, default 55%) -->
                            <div class="form-group" style="margin-bottom:14px;">
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                                    <label style="font-weight:700; font-size:0.82rem; color:var(--primary);">3. ความเข้มเลเยอร์ทับดำ (Overlay):</label>
                                    <span id="bg-overlay-val" style="font-weight:700; color:var(--secondary); font-size:0.85rem;">${bgOverlay}%</span>
                                </div>
                                <input type="range" id="sec-bg-overlay" min="0" max="80" value="${bgOverlay}" step="1" class="form-control" style="padding:0;" oninput="document.getElementById('bg-overlay-val').innerText = this.value + '%'">
                            </div>

                            <!-- 4. Background Position -->
                            <div class="form-group" style="margin-bottom:14px;">
                                <label style="font-weight:700; font-size:0.82rem; color:var(--primary); display:block; margin-bottom:4px;">4. ตำแหน่งจัดวางภาพ (Background Position):</label>
                                <select id="sec-bg-pos" class="form-control">
                                    <option value="center center" ${bgPos === 'center center' ? 'selected' : ''}>Center (ตรงกลาง)</option>
                                    <option value="top center" ${bgPos === 'top center' ? 'selected' : ''}>Top (ส่วนบน)</option>
                                    <option value="bottom center" ${bgPos === 'bottom center' ? 'selected' : ''}>Bottom (ส่วนล่าง)</option>
                                    <option value="left center" ${bgPos === 'left center' ? 'selected' : ''}>Left (ด้านซ้าย)</option>
                                    <option value="right center" ${bgPos === 'right center' ? 'selected' : ''}>Right (ด้านขวา)</option>
                                </select>
                            </div>

                            <!-- 5. Image Brightness (70-120%, default 100%) -->
                            <div class="form-group" style="margin-bottom:14px;">
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                                    <label style="font-weight:700; font-size:0.82rem; color:var(--primary);">5. ความสว่างภาพ (Image Brightness):</label>
                                    <span id="bg-brightness-val" style="font-weight:700; color:var(--secondary); font-size:0.85rem;">${bgBrightness}%</span>
                                </div>
                                <input type="range" id="sec-bg-brightness" min="70" max="120" value="${bgBrightness}" step="1" class="form-control" style="padding:0;" oninput="document.getElementById('bg-brightness-val').innerText = this.value + '%'">
                            </div>

                            <!-- 6. Text Theme -->
                            <div class="form-group" style="margin-bottom:14px;">
                                <label style="font-weight:700; font-size:0.82rem; color:var(--primary); display:block; margin-bottom:4px;">6. ธีมสีตัวหนังสือ (Text Theme):</label>
                                <select id="sec-bg-text-theme" class="form-control">
                                    <option value="auto" ${bgTextTheme === 'auto' ? 'selected' : ''}>Auto (ปรับอัตโนมัติตามพื้นหลัง)</option>
                                    <option value="light" ${bgTextTheme === 'light' ? 'selected' : ''}>Light (ข้อความสีขาวสำหรับภาพเข้ม)</option>
                                    <option value="dark" ${bgTextTheme === 'dark' ? 'selected' : ''}>Dark (ข้อความสีเข้มสำหรับภาพสว่าง)</option>
                                </select>
                            </div>

                            <!-- 7. Background Attachment -->
                            <div class="form-group" style="margin-bottom:14px;">
                                <label style="font-weight:700; font-size:0.82rem; color:var(--primary); display:block; margin-bottom:4px;">7. พฤติกรรมพื้นหลัง (Background Attachment):</label>
                                <select id="sec-bg-attachment" class="form-control">
                                    <option value="scroll" ${bgAttachment === 'scroll' ? 'selected' : ''}>เลื่อนตามหน้าเว็บ (Scroll - ปกติ)</option>
                                    <option value="fixed" ${bgAttachment === 'fixed' ? 'selected' : ''}>อยู่กับที่ขณะเลื่อนหน้า (Fixed - เฉพาะ Desktop)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </details>
            `;
        };

        let innerContentHtml = '';

        // Generate form fields based on section content type
        if (sec.type === 'hero_banner') {
            innerContentHtml = `<p style="color:var(--text-muted); font-size:0.9rem;">หัวข้อสไลด์แบนเนอร์หลักหน้าแรกถูกจัดการผ่านเมนู "จัดการภาพสไลด์หน้าแรก" ในแถบนำทางหลัก</p>`;
        } else if (sec.type === 'services') {
            if (!window.toggleBgStyleControls) {
                window.toggleBgStyleControls = (val) => {
                    const box = document.getElementById('bg-img-controls-box');
                    if (box) {
                        box.style.display = (val === 'image' || val === 'image_line_art') ? 'block' : 'none';
                    }
                };
            }
            if (!window.selectSecBgMedia) {
                window.selectSecBgMedia = () => {
                    this.openMediaSelectorDialog((selectedBase64) => {
                        window.currentActiveSecBgImg = selectedBase64;
                        const prev = document.getElementById('sec-bg-img-preview');
                        const empty = document.getElementById('sec-bg-img-empty');
                        const rmBtn = document.getElementById('remove-sec-bg-btn');
                        if (prev) { prev.src = selectedBase64; prev.style.display = 'inline-block'; }
                        if (empty) empty.style.display = 'none';
                        if (rmBtn) rmBtn.style.display = 'inline-flex';
                    });
                };
            }
            if (!window.uploadSecBgFile) {
                window.uploadSecBgFile = async (inputEl) => {
                    if (inputEl.files && inputEl.files[0]) {
                        const webpData = await this.convertImageToWebP(inputEl.files[0]);
                        window.currentActiveSecBgImg = webpData;
                        const prev = document.getElementById('sec-bg-img-preview');
                        const empty = document.getElementById('sec-bg-img-empty');
                        const rmBtn = document.getElementById('remove-sec-bg-btn');
                        if (prev) { prev.src = webpData; prev.style.display = 'inline-block'; }
                        if (empty) empty.style.display = 'none';
                        if (rmBtn) rmBtn.style.display = 'inline-flex';
                    }
                };
            }
            if (!window.removeSecBgImg) {
                window.removeSecBgImg = () => {
                    window.currentActiveSecBgImg = '';
                    const prev = document.getElementById('sec-bg-img-preview');
                    const empty = document.getElementById('sec-bg-img-empty');
                    const rmBtn = document.getElementById('remove-sec-bg-btn');
                    if (prev) { prev.src = ''; prev.style.display = 'none'; }
                    if (empty) empty.style.display = 'block';
                    if (rmBtn) rmBtn.style.display = 'none';
                };
            }

            innerContentHtml = `
                <div class="form-group">
                    <label>หัวข้อภาษาไทย (Title TH)</label>
                    <input type="text" id="sec-title-th" class="form-control" value="${sec.content.title_th || ''}">
                </div>
                <div class="form-group">
                    <label>หัวข้อภาษาอังกฤษ (Title EN)</label>
                    <input type="text" id="sec-title-en" class="form-control" value="${sec.content.title_en || ''}">
                </div>
                <div class="form-group">
                    <label>รายละเอียดภาษาไทย (Subtitle TH)</label>
                    <input type="text" id="sec-sub-th" class="form-control" value="${sec.content.subtitle_th || ''}">
                </div>
                <div class="form-group">
                    <label>รายละเอียดภาษาอังกฤษ (Subtitle EN)</label>
                    <input type="text" id="sec-sub-en" class="form-control" value="${sec.content.subtitle_en || ''}">
                </div>
                ${window.renderBgAppearancePanelHtml(sec)}
            `;
        } else if (sec.type === 'strengths') {
            const items = sec.content.items || [];
            window.currentStrengthsItems = JSON.parse(JSON.stringify(items));

            innerContentHtml = `
                <div class="form-group">
                    <label>หัวข้อหลักภาษาไทย (Title TH)</label>
                    <input type="text" id="sec-title-th" class="form-control" value="${sec.content.title_th || ''}">
                </div>
                <div class="form-group">
                    <label>หัวข้อหลักภาษาอังกฤษ (Title EN)</label>
                    <input type="text" id="sec-title-en" class="form-control" value="${sec.content.title_en || ''}">
                </div>

                ${window.renderBgAppearancePanelHtml(sec)}

                <hr style="margin:20px 0; border-top:1px dashed var(--border-color);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <h4 style="font-size:0.95rem; font-weight:700; color:var(--secondary);">รายการจุดเด่นย่อย:</h4>
                    <button type="button" class="btn btn-outline" onclick="window.addStrengthItem()" style="padding:4px 8px; font-size:0.85rem;"><i class="fas fa-plus"></i> เพิ่มจุดเด่นใหม่</button>
                </div>
                <div id="strengths-items-container"></div>
            `;

            window.toggleBgStyleControls = (val) => {
                const box = document.getElementById('bg-img-controls-box');
                if (box) {
                    box.style.display = (val === 'image' || val === 'image_line_art') ? 'block' : 'none';
                }
            };

            window.selectSecBgMedia = () => {
                this.openMediaSelectorDialog((selectedBase64) => {
                    window.currentActiveSecBgImg = selectedBase64;
                    const prev = document.getElementById('sec-bg-img-preview');
                    const empty = document.getElementById('sec-bg-img-empty');
                    const rmBtn = document.getElementById('remove-sec-bg-btn');
                    if (prev) { prev.src = selectedBase64; prev.style.display = 'inline-block'; }
                    if (empty) empty.style.display = 'none';
                    if (rmBtn) rmBtn.style.display = 'inline-flex';
                });
            };

            window.uploadSecBgFile = async (inputEl) => {
                if (inputEl.files && inputEl.files[0]) {
                    const webpData = await this.convertImageToWebP(inputEl.files[0]);
                    window.currentActiveSecBgImg = webpData;
                    const prev = document.getElementById('sec-bg-img-preview');
                    const empty = document.getElementById('sec-bg-img-empty');
                    const rmBtn = document.getElementById('remove-sec-bg-btn');
                    if (prev) { prev.src = webpData; prev.style.display = 'inline-block'; }
                    if (empty) empty.style.display = 'none';
                    if (rmBtn) rmBtn.style.display = 'inline-flex';
                }
            };

            window.removeSecBgImg = () => {
                window.currentActiveSecBgImg = '';
                const prev = document.getElementById('sec-bg-img-preview');
                const empty = document.getElementById('sec-bg-img-empty');
                const rmBtn = document.getElementById('remove-sec-bg-btn');
                if (prev) { prev.src = ''; prev.style.display = 'none'; }
                if (empty) empty.style.display = 'block';
                if (rmBtn) rmBtn.style.display = 'none';
            };
        } else if (sec.type === 'why_us') {
            const items = sec.content.items || [];
            
            if (!window.toggleBgStyleControls) {
                window.toggleBgStyleControls = (val) => {
                    const box = document.getElementById('bg-img-controls-box');
                    if (box) {
                        box.style.display = (val === 'image' || val === 'image_line_art') ? 'block' : 'none';
                    }
                };
            }
            if (!window.selectSecBgMedia) {
                window.selectSecBgMedia = () => {
                    this.openMediaSelectorDialog((selectedBase64) => {
                        window.currentActiveSecBgImg = selectedBase64;
                        const prev = document.getElementById('sec-bg-img-preview');
                        const empty = document.getElementById('sec-bg-img-empty');
                        const rmBtn = document.getElementById('remove-sec-bg-btn');
                        if (prev) { prev.src = selectedBase64; prev.style.display = 'inline-block'; }
                        if (empty) empty.style.display = 'none';
                        if (rmBtn) rmBtn.style.display = 'inline-flex';
                    });
                };
            }
            if (!window.uploadSecBgFile) {
                window.uploadSecBgFile = async (inputEl) => {
                    if (inputEl.files && inputEl.files[0]) {
                        const webpData = await this.convertImageToWebP(inputEl.files[0]);
                        window.currentActiveSecBgImg = webpData;
                        const prev = document.getElementById('sec-bg-img-preview');
                        const empty = document.getElementById('sec-bg-img-empty');
                        const rmBtn = document.getElementById('remove-sec-bg-btn');
                        if (prev) { prev.src = webpData; prev.style.display = 'inline-block'; }
                        if (empty) empty.style.display = 'none';
                        if (rmBtn) rmBtn.style.display = 'inline-flex';
                    }
                };
            }
            if (!window.removeSecBgImg) {
                window.removeSecBgImg = () => {
                    window.currentActiveSecBgImg = '';
                    const prev = document.getElementById('sec-bg-img-preview');
                    const empty = document.getElementById('sec-bg-img-empty');
                    const rmBtn = document.getElementById('remove-sec-bg-btn');
                    if (prev) { prev.src = ''; prev.style.display = 'none'; }
                    if (empty) empty.style.display = 'block';
                    if (rmBtn) rmBtn.style.display = 'none';
                };
            }

            innerContentHtml = `
                <div class="form-group">
                    <label>หัวข้อหลักภาษาไทย (Title TH)</label>
                    <input type="text" id="sec-title-th" class="form-control" value="${sec.content.title_th || ''}">
                </div>
                <div class="form-group">
                    <label>หัวข้อหลักภาษาอังกฤษ (Title EN)</label>
                    <input type="text" id="sec-title-en" class="form-control" value="${sec.content.title_en || ''}">
                </div>

                ${window.renderBgAppearancePanelHtml(sec)}

                <hr style="margin:20px 0; border-top:1px dashed var(--border-color);">
                <h4 style="font-size:0.95rem; font-weight:700; color:var(--secondary); margin-bottom:12px;">รายการเหตุผลย่อย 3 รายการ:</h4>
                ${[0, 1, 2].map(idx => {
                    const it = items[idx] || { title_th:'', title_en:'', desc_th:'', desc_en:'' };
                    return `
                        <div style="background:var(--bg-sec); padding:16px; border-radius:var(--radius-sm); border:1px solid var(--border-color); margin-bottom:16px;">
                            <h5 style="font-weight:700; color:var(--primary); margin-bottom:10px;">เหตุผลที่ ${idx + 1}</h5>
                            <div class="grid-2" style="margin-bottom:10px;">
                                <div class="form-group">
                                    <label style="font-size:0.75rem;">เหตุผล (TH)</label>
                                    <input type="text" id="why-title-th-${idx}" class="form-control" value="${it.title_th}">
                                </div>
                                <div class="form-group">
                                    <label style="font-size:0.75rem;">เหตุผล (EN)</label>
                                    <input type="text" id="why-title-en-${idx}" class="form-control" value="${it.title_en}">
                                </div>
                            </div>
                            <div class="form-group">
                                <label style="font-size:0.75rem;">อธิบายเหตุผล (TH)</label>
                                <textarea id="why-desc-th-${idx}" class="form-control" style="min-height:50px;">${it.desc_th}</textarea>
                            </div>
                            <div class="form-group">
                                <label style="font-size:0.75rem;">อธิบายเหตุผล (EN)</label>
                                <textarea id="why-desc-en-${idx}" class="form-control" style="min-height:50px;">${it.desc_en}</textarea>
                            </div>
                        </div>
                    `;
                }).join('')}
            `;
        } else if (sec.type === 'steps') {
            const steps = sec.content.steps || [];
            innerContentHtml = `
                <div class="form-group">
                    <label>หัวข้อหลักภาษาไทย (Title TH)</label>
                    <input type="text" id="sec-title-th" class="form-control" value="${sec.content.title_th || ''}">
                </div>
                <div class="form-group">
                    <label>หัวข้อหลักภาษาอังกฤษ (Title EN)</label>
                    <input type="text" id="sec-title-en" class="form-control" value="${sec.content.title_en || ''}">
                </div>
                <hr style="margin:20px 0; border-top:1px dashed var(--border-color);">
                <h4 style="font-size:0.95rem; font-weight:700; color:var(--secondary); margin-bottom:12px;">ขั้นตอนการผลิต 4 ขั้นตอน:</h4>
                ${[0, 1, 2, 3].map(idx => {
                    const st = steps[idx] || { title_th:'', title_en:'', desc_th:'', desc_en:'' };
                    return `
                        <div style="background:var(--bg-sec); padding:16px; border-radius:var(--radius-sm); border:1px solid var(--border-color); margin-bottom:16px;">
                            <h5 style="font-weight:700; color:var(--primary); margin-bottom:10px;">ขั้นตอนที่ ${idx + 1}</h5>
                            <div class="grid-2" style="margin-bottom:10px;">
                                <div class="form-group">
                                    <label style="font-size:0.75rem;">ชื่อขั้นตอน (TH)</label>
                                    <input type="text" id="step-title-th-${idx}" class="form-control" value="${st.title_th}">
                                </div>
                                <div class="form-group">
                                    <label style="font-size:0.75rem;">ชื่อขั้นตอน (EN)</label>
                                    <input type="text" id="step-title-en-${idx}" class="form-control" value="${st.title_en}">
                                </div>
                            </div>
                            <div class="form-group">
                                <label style="font-size:0.75rem;">คำอธิบายขั้นตอน (TH)</label>
                                <textarea id="step-desc-th-${idx}" class="form-control" style="min-height:50px;">${st.desc_th}</textarea>
                            </div>
                            <div class="form-group">
                                <label style="font-size:0.75rem;">คำอธิบายขั้นตอน (EN)</label>
                                <textarea id="step-desc-en-${idx}" class="form-control" style="min-height:50px;">${st.desc_en}</textarea>
                            </div>
                        </div>
                    `;
                }).join('')}
            `;
        } else if (sec.type === 'reviews') {
            const reviews = sec.content.reviews || [];
            innerContentHtml = `
                <div class="form-group">
                    <label>หัวข้อหลักภาษาไทย (Title TH)</label>
                    <input type="text" id="sec-title-th" class="form-control" value="${sec.content.title_th || ''}">
                </div>
                <div class="form-group">
                    <label>หัวข้อหลักภาษาอังกฤษ (Title EN)</label>
                    <input type="text" id="sec-title-en" class="form-control" value="${sec.content.title_en || ''}">
                </div>
                <hr style="margin:20px 0; border-top:1px dashed var(--border-color);">
                <h4 style="font-size:0.95rem; font-weight:700; color:var(--secondary); margin-bottom:12px;">รีวิวย่อยของลูกค้า 3 รายการ:</h4>
                ${[0, 1, 2].map(idx => {
                    const rv = reviews[idx] || { name:'', rating:5, review_th:'', review_en:'' };
                    return `
                        <div style="background:var(--bg-sec); padding:16px; border-radius:var(--radius-sm); border:1px solid var(--border-color); margin-bottom:16px;">
                            <h5 style="font-weight:700; color:var(--primary); margin-bottom:10px;">รีวิวตำแหน่งที่ ${idx + 1}</h5>
                            <div class="grid-2" style="margin-bottom:10px;">
                                <div class="form-group">
                                    <label style="font-size:0.75rem;">ชื่อผู้เขียน/ชื่อคาเฟ่</label>
                                    <input type="text" id="rev-name-${idx}" class="form-control" value="${rv.name}">
                                </div>
                                <div class="form-group">
                                    <label style="font-size:0.75rem;">คะแนนดาว (1 - 5 ดาว)</label>
                                    <input type="number" id="rev-rating-${idx}" class="form-control" value="${rv.rating}" min="1" max="5">
                                </div>
                            </div>
                            <div class="form-group">
                                <label style="font-size:0.75rem;">ข้อความรีวิว (TH)</label>
                                <textarea id="rev-text-th-${idx}" class="form-control" style="min-height:50px;">${rv.review_th}</textarea>
                            </div>
                            <div class="form-group">
                                <label style="font-size:0.75rem;">ข้อความรีวิว (EN)</label>
                                <textarea id="rev-text-en-${idx}" class="form-control" style="min-height:50px;">${rv.review_en}</textarea>
                            </div>
                        </div>
                    `;
                }).join('')}
            `;
        } else {
            // General Title/Subtitle/Description text boxes editor (for about_company, featured_portfolio, clients, latest_news, contact_info)
            if (!window.toggleBgStyleControls) {
                window.toggleBgStyleControls = (val) => {
                    const box = document.getElementById('bg-img-controls-box');
                    if (box) {
                        box.style.display = (val === 'image' || val === 'image_line_art') ? 'block' : 'none';
                    }
                };
            }
            if (!window.selectSecBgMedia) {
                window.selectSecBgMedia = () => {
                    this.openMediaSelectorDialog((selectedBase64) => {
                        window.currentActiveSecBgImg = selectedBase64;
                        const prev = document.getElementById('sec-bg-img-preview');
                        const empty = document.getElementById('sec-bg-img-empty');
                        const rmBtn = document.getElementById('remove-sec-bg-btn');
                        if (prev) { prev.src = selectedBase64; prev.style.display = 'inline-block'; }
                        if (empty) empty.style.display = 'none';
                        if (rmBtn) rmBtn.style.display = 'inline-flex';
                    });
                };
            }
            if (!window.uploadSecBgFile) {
                window.uploadSecBgFile = async (inputEl) => {
                    if (inputEl.files && inputEl.files[0]) {
                        const webpData = await this.convertImageToWebP(inputEl.files[0]);
                        window.currentActiveSecBgImg = webpData;
                        const prev = document.getElementById('sec-bg-img-preview');
                        const empty = document.getElementById('sec-bg-img-empty');
                        const rmBtn = document.getElementById('remove-sec-bg-btn');
                        if (prev) { prev.src = webpData; prev.style.display = 'inline-block'; }
                        if (empty) empty.style.display = 'none';
                        if (rmBtn) rmBtn.style.display = 'inline-flex';
                    }
                };
            }
            if (!window.removeSecBgImg) {
                window.removeSecBgImg = () => {
                    window.currentActiveSecBgImg = '';
                    const prev = document.getElementById('sec-bg-img-preview');
                    const empty = document.getElementById('sec-bg-img-empty');
                    const rmBtn = document.getElementById('remove-sec-bg-btn');
                    if (prev) { prev.src = ''; prev.style.display = 'none'; }
                    if (empty) empty.style.display = 'block';
                    if (rmBtn) rmBtn.style.display = 'none';
                };
            }

            innerContentHtml = `
                <div class="form-group">
                    <label>หัวข้อใหญ่ภาษาไทย (Title TH) <span style="color:var(--danger)">*</span></label>
                    <input type="text" id="sec-title-th" class="form-control" value="${sec.content.title_th || ''}" required>
                </div>
                <div class="form-group">
                    <label>หัวข้อใหญ่ภาษาอังกฤษ (Title EN) <span style="color:var(--danger)">*</span></label>
                    <input type="text" id="sec-title-en" class="form-control" value="${sec.content.title_en || ''}" required>
                </div>
                ${sec.type !== 'clients' ? `
                    <div class="form-group">
                        <label>รายละเอียดภาษาไทย (Subtitle / Description TH)</label>
                        <textarea id="sec-desc-th" class="form-control" style="min-height:90px;">${sec.content.desc_th || sec.content.subtitle_th || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>รายละเอียดภาษาอังกฤษ (Subtitle / Description EN)</label>
                        <textarea id="sec-desc-en" class="form-control" style="min-height:90px;">${sec.content.desc_en || sec.content.subtitle_en || ''}</textarea>
                    </div>
                ` : ''}
                ${sec.type === 'latest_news' ? window.renderBgAppearancePanelHtml(sec) : ''}
            `;
        }

        let secLabel = sec.type;
        if (sec.type === 'hero_banner') secLabel = 'ภาพสไลด์แบนเนอร์หลัก (Hero Slider)';
        if (sec.type === 'about_company') secLabel = 'ข้อมูลแนะนำบริษัทร้าน (About Us)';
        if (sec.type === 'strengths') secLabel = 'จุดเด่นแบรนด์บริษัท (Strengths)';
        if (sec.type === 'services') secLabel = 'หมวดหมู่สินค้าหลัก (Services/Categories)';
        if (sec.type === 'why_us') secLabel = 'ทำไมต้องเลือกเรา (Why Choose Us)';
        if (sec.type === 'steps') secLabel = 'ขั้นตอนการผลิตสั่งพิมพ์ (Steps)';
        if (sec.type === 'featured_portfolio') secLabel = 'ผลงานสกรีนล่าสุด (Featured Gallery)';
        if (sec.type === 'clients') secLabel = 'โลโก้ร้านค้าลูกค้าพันธมิตร (Partners Logos)';
        if (sec.type === 'reviews') secLabel = 'รีวิวลูกค้า (Customer Reviews)';
        if (sec.type === 'latest_news') secLabel = 'กิจกรรมและการสนับสนุน (Activities & Support)';
        if (sec.type === 'contact_info') secLabel = 'ฟอร์มการติดต่อรวดเร็ว (Quick Contact)';

        overlay.innerHTML = `
            <div class="modal-window" style="max-width:680px; padding:30px;">
                <button class="modal-close-btn" id="close-modal-btn"><i class="fas fa-times"></i></button>
                <h3 style="font-size:1.2rem; font-weight:800; color:var(--secondary); margin-bottom:20px; border-bottom:1.5px solid var(--border-color); padding-bottom:8px;">
                    แก้ไขข้อมูลเซกชัน: ${secLabel}
                </h3>
                
                <form id="edit-sec-content-form">
                    <div style="max-height:60vh; overflow-y:auto; padding-right:8px; display:flex; flex-direction:column; gap:12px;">
                        ${innerContentHtml}
                    </div>
                    
                    <div style="margin-top:24px; display:flex; gap:12px; justify-content:flex-end;">
                        <button type="button" class="btn btn-outline" id="close-modal-cancel-btn" style="padding:10px 16px;">ยกเลิก</button>
                        <button type="submit" class="btn btn-primary" style="padding:10px 20px;"><i class="fas fa-check"></i> บันทึกการแก้ไข</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(overlay);

        // Define strengths dynamic handlers
        window.renderStrengthItemsList = () => {
            const container = document.getElementById('strengths-items-container');
            if (!container) return;
            
            if (!window.currentStrengthsItems || window.currentStrengthsItems.length === 0) {
                container.innerHTML = `<p style="text-align:center; color:var(--text-muted); padding:20px; font-size:0.9rem; background:var(--bg-sec); border-radius:var(--radius-sm); border:1px dashed var(--border-color);">ไม่มีรายการจุดเด่น กรุณากดปุ่มเพิ่มจุดเด่นใหม่</p>`;
                return;
            }

            container.innerHTML = window.currentStrengthsItems.map((it, idx) => {
                const itemImg = it.img_src || it.img || it.image || '';
                return `
                    <div class="strength-edit-card" style="background:var(--bg-sec); padding:16px; border-radius:var(--radius-sm); border:1px solid var(--border-color); margin-bottom:16px; position:relative;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px dashed var(--border-color); padding-bottom:8px;">
                            <h5 style="font-weight:700; color:var(--primary); margin:0;">จุดเด่นรายการที่ ${idx + 1}</h5>
                            <div style="display:flex; gap:6px;">
                                <button type="button" class="btn btn-outline" onclick="window.moveStrengthItem(${idx}, -1)" ${idx === 0 ? 'disabled' : ''} style="padding:4px 8px; font-size:0.75rem;"><i class="fas fa-arrow-up"></i> เลื่อนขึ้น</button>
                                <button type="button" class="btn btn-outline" onclick="window.moveStrengthItem(${idx}, 1)" ${idx === window.currentStrengthsItems.length - 1 ? 'disabled' : ''} style="padding:4px 8px; font-size:0.75rem;"><i class="fas fa-arrow-down"></i> เลื่อนลง</button>
                                <button type="button" class="btn btn-outline" onclick="window.deleteStrengthItem(${idx})" style="padding:4px 8px; font-size:0.75rem; color:var(--danger); border-color:var(--danger);"><i class="fas fa-trash"></i> ลบ</button>
                            </div>
                        </div>
                        <div class="grid-2" style="margin-bottom:10px;">
                            <div class="form-group">
                                <label style="font-size:0.75rem;">ชื่อจุดเด่น (TH)</label>
                                <input type="text" class="form-control str-input-title-th" data-index="${idx}" value="${it.title_th || ''}" oninput="window.updateStrengthItemField(${idx}, 'title_th', this.value)">
                            </div>
                            <div class="form-group">
                                <label style="font-size:0.75rem;">ชื่อจุดเด่น (EN)</label>
                                <input type="text" class="form-control str-input-title-en" data-index="${idx}" value="${it.title_en || ''}" oninput="window.updateStrengthItemField(${idx}, 'title_en', this.value)">
                            </div>
                        </div>
                        <div class="form-group" style="margin-bottom:10px;">
                            <label style="font-size:0.75rem;">ไอคอน FontAwesome สำรอง (กรณีไม่ใส่รูปภาพ เช่น fa-award, fa-shield-alt)</label>
                            <input type="text" class="form-control str-input-icon" data-index="${idx}" value="${it.icon || 'fa-award'}" oninput="window.updateStrengthItemField(${idx}, 'icon', this.value)">
                        </div>

                        <!-- Feature Image Input & Media Picker -->
                        <div class="form-group" style="background:var(--bg-main); padding:12px; border-radius:var(--radius-sm); border:1px solid var(--border-color); margin-bottom:10px;">
                            <label style="font-size:0.78rem; font-weight:700; color:var(--primary); display:block; margin-bottom:6px;">
                                <i class="fas fa-image" style="color:var(--secondary);"></i> รูปภาพประกอบจุดเด่น (วงกลม)
                            </label>
                            <div style="display:flex; gap:8px; align-items:center; margin-bottom:8px;">
                                <input type="file" class="form-control" accept="image/*" style="padding:4px; font-size:0.75rem; flex-grow:1;" onchange="window.uploadStrengthFile(${idx}, this)">
                                <button type="button" class="btn btn-outline" onclick="window.selectStrengthMedia(${idx})" style="padding:6px 10px; font-size:0.72rem;"><i class="fas fa-folder-open"></i> เลือกจากคลังภาพ</button>
                                <button type="button" class="btn btn-outline" onclick="window.removeStrengthImg(${idx})" style="padding:6px 10px; font-size:0.72rem; color:var(--danger); border-color:var(--danger); display:${itemImg ? 'inline-flex' : 'none'};"><i class="fas fa-trash"></i> ลบรูป</button>
                            </div>
                            
                            <div style="display:flex; align-items:center; gap:12px;">
                                <div style="width:50px; height:50px; border-radius:50%; overflow:hidden; background:rgba(255,107,0,0.08); display:flex; align-items:center; justify-content:center; flex-shrink:0; border:1px solid var(--border-color);">
                                    ${itemImg ? `<img src="${itemImg}" style="width:100%; height:100%; object-fit:cover;">` : `<i class="fas ${it.icon || 'fa-award'}" style="color:var(--secondary); font-size:1.2rem;"></i>`}
                                </div>
                                <div style="font-size:0.75rem; color:var(--text-sec);">
                                    ${itemImg ? `<span style="color:var(--success); font-weight:700;">มีรูปภาพประกอบ</span>` : `<span>ใช้ไอคอนสำรอง <code>${it.icon || 'fa-award'}</code></span>`}
                                </div>
                            </div>

                            <!-- Recommended Image Guidance Box -->
                            <div style="background: rgba(4, 53, 106, 0.04); border-left: 3px solid var(--primary); padding: 8px 10px; border-radius: var(--radius-sm); font-size: 0.74rem; color: var(--text-sec); margin-top: 8px;">
                                <strong><i class="fas fa-lightbulb" style="color:var(--secondary);"></i> คำแนะนำรูปภาพประกอบจุดเด่น:</strong>
                                <ul style="margin: 2px 0 0 14px; padding: 0; line-height: 1.4;">
                                    <li>แนะนำไฟล์ PNG หรือ WebP (พื้นหลังโปร่งใส Preferred)</li>
                                    <li>ความกว้างขั้นต่ำ 600px | ขนาดแนะนำ 800x800px (ทรงจัตุรัสหรือวงกลม)</li>
                                    <li>ใช้รูปสินค้า/ภาพประกอบตรงกลาง หลีกเลี่ยงภาพที่มีตัวหนังสือซ้อนทับ</li>
                                </ul>
                            </div>
                        </div>

                        <div class="form-group">
                            <label style="font-size:0.75rem;">คำอธิบายจุดเด่น (TH)</label>
                            <textarea class="form-control str-input-desc-th" style="min-height:50px;" data-index="${idx}" oninput="window.updateStrengthItemField(${idx}, 'desc_th', this.value)">${it.desc_th || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.75rem;">คำอธิบายจุดเด่น (EN)</label>
                            <textarea class="form-control str-input-desc-en" style="min-height:50px;" data-index="${idx}" oninput="window.updateStrengthItemField(${idx}, 'desc_en', this.value)">${it.desc_en || ''}</textarea>
                        </div>
                    </div>
                `;
            }).join('');
        };

        window.selectStrengthMedia = (idx) => {
            this.openMediaSelectorDialog((selectedBase64) => {
                if (window.currentStrengthsItems && window.currentStrengthsItems[idx]) {
                    window.currentStrengthsItems[idx].img_src = selectedBase64;
                    window.currentStrengthsItems[idx].img = selectedBase64;
                    window.renderStrengthItemsList();
                }
            });
        };

        window.uploadStrengthFile = async (idx, inputEl) => {
            if (inputEl.files && inputEl.files[0]) {
                const webpData = await this.convertImageToWebP(inputEl.files[0]);
                if (window.currentStrengthsItems && window.currentStrengthsItems[idx]) {
                    window.currentStrengthsItems[idx].img_src = webpData;
                    window.currentStrengthsItems[idx].img = webpData;
                    window.renderStrengthItemsList();
                }
            }
        };

        window.removeStrengthImg = (idx) => {
            if (window.currentStrengthsItems && window.currentStrengthsItems[idx]) {
                window.currentStrengthsItems[idx].img_src = '';
                window.currentStrengthsItems[idx].img = '';
                window.renderStrengthItemsList();
            }
        };

        window.updateStrengthItemField = (idx, field, value) => {
            if (window.currentStrengthsItems && window.currentStrengthsItems[idx]) {
                window.currentStrengthsItems[idx][field] = value || '';
            }
        };

        window.addStrengthItem = () => {
            if (!window.currentStrengthsItems) window.currentStrengthsItems = [];
            window.currentStrengthsItems.push({
                title_th: '',
                title_en: '',
                desc_th: '',
                desc_en: '',
                icon: 'fa-award',
                img_src: ''
            });
            window.renderStrengthItemsList();
        };

        window.deleteStrengthItem = (idx) => {
            if (window.currentStrengthsItems) {
                window.currentStrengthsItems.splice(idx, 1);
                window.renderStrengthItemsList();
            }
        };

        window.moveStrengthItem = (idx, dir) => {
            if (!window.currentStrengthsItems) return;
            const targetIdx = idx + dir;
            if (targetIdx < 0 || targetIdx >= window.currentStrengthsItems.length) return;
            const temp = window.currentStrengthsItems[idx];
            window.currentStrengthsItems[idx] = window.currentStrengthsItems[targetIdx];
            window.currentStrengthsItems[targetIdx] = temp;
            window.renderStrengthItemsList();
        };

        if (sec.type === 'strengths' || sec.type === 'why_us') {
            if (sec.type === 'strengths') {
                window.renderStrengthItemsList();
            }

            const overlaySlider = document.getElementById('sec-bg-overlay');
            const overlayValueLabel = document.getElementById('bg-overlay-val');

            if (overlaySlider) {
                overlaySlider.addEventListener('input', () => {
                    const val = window.normalizeSectionOverlay(overlaySlider.value);
                    if (overlayValueLabel) {
                        overlayValueLabel.textContent = `${val}%`;
                    }

                    // Target live preview overlay elements in DOM
                    const previewOverlaySelectors = [
                        '#production-standard-preview .section-background-overlay',
                        '#production-standard-preview .sec-bg-overlay-layer',
                        '.section-bg-manager[data-section="strengths"] .sec-bg-overlay-layer',
                        '.section-bg-manager[data-section="why_us"] .sec-bg-overlay-layer',
                        'section.section-bg-manager .sec-bg-overlay-layer'
                    ];

                    previewOverlaySelectors.forEach(selector => {
                        document.querySelectorAll(selector).forEach(el => {
                            el.style.backgroundColor = `rgba(0, 0, 0, ${val / 100})`;
                        });
                    });
                });
            }
        }

        const closeDialog = () => { 
            overlay.remove(); 
            delete window.currentStrengthsItems;
            delete window.renderStrengthItemsList;
            delete window.updateStrengthItemField;
            delete window.addStrengthItem;
            delete window.deleteStrengthItem;
            delete window.moveStrengthItem;
            delete window.selectStrengthMedia;
            delete window.uploadStrengthFile;
            delete window.removeStrengthImg;
            delete window.currentActiveSecBgImg;
            delete window.toggleBgStyleControls;
            delete window.selectSecBgMedia;
            delete window.uploadSecBgFile;
            delete window.removeSecBgImg;
        };
        document.getElementById('close-modal-btn').onclick = closeDialog;
        document.getElementById('close-modal-cancel-btn').onclick = closeDialog;

        document.getElementById('edit-sec-content-form').onsubmit = async (e) => {
            e.preventDefault();

            // Build content structure based on type
            if (sec.type === 'hero_banner') {
                // Do nothing, hero banner content is managed in the slider tab
            } else if (sec.type === 'services') {
                sec.content.title_th = document.getElementById('sec-title-th').value;
                sec.content.title_en = document.getElementById('sec-title-en').value;
                sec.content.subtitle_th = document.getElementById('sec-sub-th').value;
                sec.content.subtitle_en = document.getElementById('sec-sub-en').value;

                // Save Background Appearance Settings (Services Section)
                if (document.getElementById('sec-bg-attachment')) {
                    const selectedBgStyle = document.querySelector('input[name="bg-style-radio"]:checked')?.value || 'line_art';
                    sec.content.backgroundStyle = selectedBgStyle;
                    sec.content.backgroundImage = window.currentActiveSecBgImg !== undefined ? window.currentActiveSecBgImg : (sec.content.backgroundImage || '');
                    const rawOverlayInput = document.getElementById('sec-bg-overlay')?.value;
                    if (rawOverlayInput !== undefined) {
                        sec.content.backgroundOverlay = window.normalizeSectionOverlay(rawOverlayInput);
                    }
                    if (document.getElementById('sec-bg-pos')) {
                        sec.content.backgroundPosition = document.getElementById('sec-bg-pos').value || 'center center';
                    }
                    if (document.getElementById('sec-bg-brightness')) {
                        sec.content.backgroundBrightness = parseInt(document.getElementById('sec-bg-brightness').value) || 100;
                    }
                    if (document.getElementById('sec-bg-text-theme')) {
                        sec.content.backgroundTextTheme = document.getElementById('sec-bg-text-theme').value || 'auto';
                    }
                    sec.content.backgroundAttachment = document.getElementById('sec-bg-attachment').value === 'fixed' ? 'fixed' : 'scroll';
                }
            } else if (sec.type === 'strengths') {
                sec.content.title_th = document.getElementById('sec-title-th').value;
                sec.content.title_en = document.getElementById('sec-title-en').value;

                // Save Background Appearance Settings (Milestone 4.5)
                const selectedBgStyle = document.querySelector('input[name="bg-style-radio"]:checked')?.value || 'line_art';
                sec.content.backgroundStyle = selectedBgStyle;
                sec.content.backgroundImage = window.currentActiveSecBgImg || '';
                
                const rawOverlayInput = document.getElementById('sec-bg-overlay')?.value;
                sec.content.backgroundOverlay = window.normalizeSectionOverlay(rawOverlayInput);

                sec.content.backgroundPosition = document.getElementById('sec-bg-pos')?.value || 'center center';
                sec.content.backgroundBrightness = parseInt(document.getElementById('sec-bg-brightness')?.value) || 100;
                sec.content.backgroundTextTheme = document.getElementById('sec-bg-text-theme')?.value || 'auto';
                sec.content.backgroundAttachment = document.getElementById('sec-bg-attachment')?.value === 'fixed' ? 'fixed' : 'scroll';

                sec.content.items = (window.currentStrengthsItems || []).map(it => ({
                    title_th: it.title_th || '',
                    title_en: it.title_en || '',
                    icon: it.icon || 'fa-award',
                    img_src: it.img_src || it.img || it.image || '',
                    desc_th: it.desc_th || '',
                    desc_en: it.desc_en || ''
                }));
            } else if (sec.type === 'why_us') {
                sec.content.title_th = document.getElementById('sec-title-th').value;
                sec.content.title_en = document.getElementById('sec-title-en').value;

                // Save Background Appearance Settings (Milestone 4.5.1 Why Choose Us)
                const selectedBgStyle = document.querySelector('input[name="bg-style-radio"]:checked')?.value || 'line_art';
                sec.content.backgroundStyle = selectedBgStyle;
                sec.content.backgroundImage = window.currentActiveSecBgImg || '';
                
                const rawOverlayInput = document.getElementById('sec-bg-overlay')?.value;
                sec.content.backgroundOverlay = window.normalizeSectionOverlay(rawOverlayInput);

                sec.content.backgroundPosition = document.getElementById('sec-bg-pos')?.value || 'center center';
                sec.content.backgroundBrightness = parseInt(document.getElementById('sec-bg-brightness')?.value) || 100;
                sec.content.backgroundTextTheme = document.getElementById('sec-bg-text-theme')?.value || 'auto';
                sec.content.backgroundAttachment = document.getElementById('sec-bg-attachment')?.value === 'fixed' ? 'fixed' : 'scroll';

                sec.content.items = [0, 1, 2].map(idx => ({
                    title_th: document.getElementById(`why-title-th-${idx}`).value,
                    title_en: document.getElementById(`why-title-en-${idx}`).value,
                    desc_th: document.getElementById(`why-desc-th-${idx}`).value,
                    desc_en: document.getElementById(`why-desc-en-${idx}`).value
                }));
            } else if (sec.type === 'steps') {
                sec.content.title_th = document.getElementById('sec-title-th').value;
                sec.content.title_en = document.getElementById('sec-title-en').value;
                sec.content.steps = [0, 1, 2, 3].map(idx => ({
                    title_th: document.getElementById(`step-title-th-${idx}`).value,
                    title_en: document.getElementById(`step-title-en-${idx}`).value,
                    desc_th: document.getElementById(`step-desc-th-${idx}`).value,
                    desc_en: document.getElementById(`step-desc-en-${idx}`).value
                }));
            } else if (sec.type === 'reviews') {
                sec.content.title_th = document.getElementById('sec-title-th').value;
                sec.content.title_en = document.getElementById('sec-title-en').value;
                sec.content.reviews = [0, 1, 2].map(idx => ({
                    name: document.getElementById(`rev-name-${idx}`).value,
                    rating: parseInt(document.getElementById(`rev-rating-${idx}`).value) || 5,
                    review_th: document.getElementById(`rev-text-th-${idx}`).value,
                    review_en: document.getElementById(`rev-text-en-${idx}`).value
                }));
            } else {
                // General
                sec.content.title_th = document.getElementById('sec-title-th').value;
                sec.content.title_en = document.getElementById('sec-title-en').value;
                if (sec.type !== 'clients') {
                    const descVal = document.getElementById('sec-desc-th').value;
                    const descEnVal = document.getElementById('sec-desc-en').value;
                    if (sec.type === 'latest_news') {
                        sec.content.desc_th = descVal;
                        sec.content.desc_en = descEnVal;
                        sec.content.subtitle_th = descVal;
                        sec.content.subtitle_en = descEnVal;
                    } else if (sec.content.desc_th !== undefined) {
                        sec.content.desc_th = descVal;
                        sec.content.desc_en = descEnVal;
                    } else {
                        sec.content.subtitle_th = descVal;
                        sec.content.subtitle_en = descEnVal;
                    }
                }
                if (document.getElementById('sec-bg-attachment')) {
                    const selectedBgStyle = document.querySelector('input[name="bg-style-radio"]:checked')?.value || 'line_art';
                    sec.content.backgroundStyle = selectedBgStyle;
                    sec.content.backgroundImage = window.currentActiveSecBgImg || sec.content.backgroundImage || '';
                    const rawOverlayInput = document.getElementById('sec-bg-overlay')?.value;
                    if (rawOverlayInput !== undefined) {
                        sec.content.backgroundOverlay = window.normalizeSectionOverlay(rawOverlayInput);
                    }
                    if (document.getElementById('sec-bg-pos')) {
                        sec.content.backgroundPosition = document.getElementById('sec-bg-pos').value || 'center center';
                    }
                    if (document.getElementById('sec-bg-brightness')) {
                        sec.content.backgroundBrightness = parseInt(document.getElementById('sec-bg-brightness').value) || 100;
                    }
                    if (document.getElementById('sec-bg-text-theme')) {
                        sec.content.backgroundTextTheme = document.getElementById('sec-bg-text-theme').value || 'auto';
                    }
                    sec.content.backgroundAttachment = document.getElementById('sec-bg-attachment').value === 'fixed' ? 'fixed' : 'scroll';
                }
            }

            if (!sec.created_at) {
                sec.created_at = new Date().toISOString();
            }
            sec.updated_at = new Date().toISOString();

            try {
                await this.db.put('homepage', sec);
                closeDialog();
                alert('อัปเดตรายละเอียดและเนื้อหาเซกชันสำเร็จเรียบร้อยแล้ว!');
                this.renderActiveView();
            } catch (err) {
                alert(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูลไปยังระบบคลาวด์');
            }
        };
    }


    // --- News CRUD Manager ---
    async loadNewsView(container) {
        const news = await this.db.getAll('news');
        const sortedNews = [...news].sort((a, b) => {
            const featA = a.featured ? 1 : 0;
            const featB = b.featured ? 1 : 0;
            if (featA !== featB) return featB - featA; // Featured first
            return Number(a.order || 0) - Number(b.order || 0); // Order ascending
        });

        container.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <p style="color:var(--text-muted); font-size:0.9rem;">สร้าง แก้ไข หรือตั้งค่าซ่อนกิจกรรมและการสนับสนุนเพื่อแสดงบนหน้าเว็บไซต์</p>
                <button class="btn btn-primary" id="add-news-btn"><i class="fas fa-plus"></i> เพิ่มกิจกรรมใหม่</button>
            </div>
            
            <div class="admin-card">
                ${sortedNews.length === 0 ? `
                    <p style="color:var(--text-muted); font-size:0.9rem; text-align:center; padding:45px 0;">ยังไม่มีรายการกิจกรรมและการสนับสนุนในระบบ</p>
                ` : `
                    <div style="overflow-x:auto;">
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th style="width:70px; text-align:center;">ลำดับ</th>
                                    <th>รูปย่อ</th>
                                    <th>หัวข้อกิจกรรม (TH)</th>
                                    <th>สถานที่จัด</th>
                                    <th>วันที่จัด</th>
                                    <th>สถานะแสดงผล</th>
                                    <th style="text-align:right;">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${sortedNews.map(n => `
                                    <tr>
                                        <td style="text-align:center; font-weight:700;">${n.order !== undefined ? n.order : 0}</td>
                                        <td style="width:75px;">
                                            <div style="width:55px; height:55px; border-radius:var(--radius-sm); border:1px solid var(--border-color); background:var(--bg-sec); display:flex; align-items:center; justify-content:center; overflow:hidden;">
                                                ${n.thumbnail ? `<img src="${n.thumbnail}" style="width:100%; height:100%; object-fit:cover;">` : `<i class="fas fa-calendar-alt" style="color:var(--text-muted);"></i>`}
                                            </div>
                                        </td>
                                        <td>
                                            <strong>${n.title_th}</strong><br>
                                            <span style="font-size:0.78rem; color:var(--text-muted);">${(n.summary_th || '').slice(0, 70)}...</span>
                                        </td>
                                        <td>${n.location_th || '-'}</td>
                                        <td>${n.date || '-'}</td>
                                        <td>
                                            ${n.visible !== false ? '<span class="badge badge-success">แสดงผล</span>' : '<span class="badge" style="background:#e2e8f0; color:#475569;">ซ่อน</span>'}
                                            ${n.featured ? '<span class="badge badge-secondary" style="margin-left:5px; background:var(--secondary); color:white;">แนะนำ</span>' : ''}
                                        </td>
                                        <td style="text-align:right;">
                                            <button class="btn btn-outline edit-news-btn" data-id="${n.id}" style="padding:6px 12px; font-size:0.75rem; border-color:var(--secondary); color:var(--secondary); margin-right:8px;"><i class="fas fa-edit"></i> แก้ไข</button>
                                            <button class="btn btn-outline del-news-btn" data-id="${n.id}" style="padding:6px 12px; font-size:0.75rem; border-color:var(--danger); color:var(--danger);"><i class="fas fa-trash-alt"></i> ลบ</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        `;

        document.getElementById('add-news-btn').onclick = () => this.openNewsEditDialog(null);
        document.querySelectorAll('.edit-news-btn').forEach(btn => {
            btn.onclick = () => this.openNewsEditDialog(btn.dataset.id);
        });
        document.querySelectorAll('.del-news-btn').forEach(btn => {
            btn.onclick = async () => {
                if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบกิจกรรมและการสนับสนุนรายการนี้ออกอย่างถาวร?')) {
                    await this.db.delete('news', btn.dataset.id);
                    this.renderActiveView();
                }
            };
        });
    }

    async openNewsEditDialog(newsId) {
        let n = {
            id: 'news_' + Date.now(),
            title_th: '',
            title_en: '',
            thumbnail: '',
            summary_th: '',
            summary_en: '',
            content_th: '',
            content_en: '',
            date: new Date().toISOString().split('T')[0],
            location_th: '',
            location_en: '',
            order: 1,
            visible: true,
            featured: false,
            gallery_images: [],
            seo_title: '',
            seo_desc: ''
        };

        let isEdit = false;
        if (newsId) {
            const fetched = await this.db.get('news', newsId);
            if (fetched) {
                n = fetched;
                isEdit = true;
            }
        }

        let parsedGallery = [];
        if (Array.isArray(n.gallery_images)) {
            parsedGallery = n.gallery_images;
        } else if (typeof n.gallery_images === 'string') {
            try {
                parsedGallery = JSON.parse(n.gallery_images);
            } catch (e) {
                parsedGallery = [];
            }
        }
        window.currentActivityGallery = [...parsedGallery];

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';
        overlay.id = 'admin-edit-modal';

        overlay.innerHTML = `
            <div class="modal-window" style="max-width:700px; padding:30px;">
                <button class="modal-close-btn" id="close-modal-btn"><i class="fas fa-times"></i></button>
                <h3 style="font-size:1.25rem; font-weight:800; color:var(--secondary); margin-bottom:20px; border-bottom:1.5px solid var(--border-color); padding-bottom:8px;">
                    ${isEdit ? 'แก้ไขกิจกรรมและการสนับสนุน' : 'เพิ่มกิจกรรมและการสนับสนุนใหม่'}
                </h3>
                
                <form id="edit-news-form">
                    <div style="display:flex; flex-direction:column; gap:12px; max-height:60vh; overflow-y:auto; padding-right:8px;">
                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">หัวข้อกิจกรรมภาษาไทย (Title TH) <span style="color:var(--danger)">*</span></label>
                            <input type="text" id="news-form-title-th" class="form-control" value="${n.title_th}" required>
                        </div>
                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">หัวข้อกิจกรรมภาษาอังกฤษ (Title EN)</label>
                            <input type="text" id="news-form-title-en" class="form-control" value="${n.title_en || ''}">
                        </div>
                        
                        <div class="grid-2">
                            <div class="form-group">
                                <label style="font-weight:600; font-size:0.85rem;">วันที่จัดกิจกรรม (Date)</label>
                                <input type="date" id="news-form-date" class="form-control" value="${n.date || ''}">
                            </div>
                            <div class="form-group">
                                <label style="font-weight:600; font-size:0.85rem;">ลำดับการแสดงผล (Order)</label>
                                <input type="number" id="news-form-order" class="form-control" value="${n.order !== undefined ? n.order : 1}" required min="0">
                            </div>
                        </div>

                        <div class="grid-2">
                            <div class="form-group">
                                <label style="font-weight:600; font-size:0.85rem;">สถานที่จัดภาษาไทย (Location TH)</label>
                                <input type="text" id="news-form-location-th" class="form-control" value="${n.location_th || ''}">
                            </div>
                            <div class="form-group">
                                <label style="font-weight:600; font-size:0.85rem;">สถานที่จัดภาษาอังกฤษ (Location EN)</label>
                                <input type="text" id="news-form-location-en" class="form-control" value="${n.location_en || ''}">
                            </div>
                        </div>

                        <div style="display:flex; align-items:center; gap:20px; padding:10px 0;">
                            <label style="cursor:pointer; font-weight:700; font-size:0.85rem; display:inline-flex; align-items:center; gap:6px;">
                                <input type="checkbox" id="news-form-vis" style="width:18px; height:18px;" ${n.visible !== false ? 'checked' : ''}> แสดงผลบนหน้าเว็บ
                            </label>
                            <label style="cursor:pointer; font-weight:700; font-size:0.85rem; display:inline-flex; align-items:center; gap:6px; color:var(--secondary);">
                                <input type="checkbox" id="news-form-feat" style="width:18px; height:18px;" ${n.featured ? 'checked' : ''}> กิจกรรมเด่นแนะนำ
                            </label>
                        </div>

                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">เกริ่นนำ/สรุปสั้นๆ (Summary TH)</label>
                            <textarea id="news-form-sum-th" class="form-control" style="min-height:50px;" placeholder="จะแสดงเป็นบทคัดย่อในหน้าแรกและหน้ารวม...">${n.summary_th || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">เกริ่นนำ/สรุปสั้นๆ (Summary EN)</label>
                            <textarea id="news-form-sum-en" class="form-control" style="min-height:50px;">${n.summary_en || ''}</textarea>
                        </div>

                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">เนื้อหากิจกรรมฉบับเต็มภาษาไทย (Full Content TH)</label>
                            <textarea id="news-form-content-th" class="form-control" style="min-height:120px;" placeholder="สามารถเว้นบรรทัด รายละเอียดเนื้อหาเต็ม"></textarea>
                        </div>
                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">เนื้อหากิจกรรมฉบับเต็มภาษาอังกฤษ (Full Content EN)</label>
                            <textarea id="news-form-content-en" class="form-control" style="min-height:120px;">${n.content_en || ''}</textarea>
                        </div>

                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">รูปภาพหน้าปกกิจกรรม (Cover Image)</label>
                            <div style="display:flex; gap:10px; align-items:center;">
                                <input type="file" id="news-form-file" class="form-control" accept="image/*" style="padding: 6px; flex-grow:1;">
                                <button type="button" class="btn btn-outline" id="select-news-media-btn" style="padding:8px 12px; font-size:0.75rem;"><i class="fas fa-folder-open"></i> เลือกจากคลังภาพ</button>
                            </div>
                            
                            <div style="margin-top:10px; text-align:center;">
                                <img src="${n.thumbnail || ''}" id="news-form-img-preview" style="max-height:100px; border-radius:var(--radius-sm); border:1px solid var(--border-color); display:${n.thumbnail ? 'inline-block' : 'none'};">
                            </div>
                        </div>

                        <div class="form-group" style="background:var(--bg-sec); padding:16px; border:1px solid var(--border-color); border-radius:var(--radius-md);">
                            <label style="font-weight:800; color:var(--primary); font-size:0.85rem; display:block; margin-bottom:8px;"><i class="fas fa-images"></i> รูปภาพแกลเลอรีเพิ่มเติม (Gallery Images)</label>
                            <div id="activity-gallery-container"></div>
                            <div style="display:flex; gap:10px; align-items:center; margin-top:10px;">
                                <input type="file" id="activity-gallery-file-input" accept="image/*" style="display:none;">
                                <button type="button" class="btn btn-outline" id="activity-gallery-upload-btn" style="padding:6px 12px; font-size:0.75rem;"><i class="fas fa-upload"></i> อัปโหลดรูปภาพ</button>
                                <button type="button" class="btn btn-outline" id="activity-gallery-select-btn" style="padding:6px 12px; font-size:0.75rem;"><i class="fas fa-folder-open"></i> เลือกจากคลังภาพ</button>
                            </div>
                        </div>

                        <!-- SEO Metadata -->
                        <div class="form-group" style="background:var(--bg-sec); padding:16px; border:1px solid var(--border-color); border-radius:var(--radius-md);">
                            <label style="font-weight:800; color:var(--secondary); font-size:0.85rem;"><i class="fas fa-globe"></i> SEO Metadata (สำหรับการติด Google Search)</label>
                            <div style="display:flex; flex-direction:column; gap:10px; margin-top:8px;">
                                <input type="text" id="news-form-seo-title" class="form-control" value="${n.seo_title || ''}" placeholder="Meta Title (เว้นว่างไว้หากต้องการใช้ชื่อข้อความข่าว)">
                                <textarea id="news-form-seo-desc" class="form-control" style="min-height:50px;" placeholder="Meta Description (อธิบายสาระสำคัญย่อความยาวไม่เกิน 160 ตัวอักษร)"></textarea>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-top:24px; display:flex; gap:12px; justify-content:flex-end;">
                        <button type="button" class="btn btn-outline" id="close-modal-cancel-btn" style="padding:10px 16px;">ยกเลิก</button>
                        <button type="submit" class="btn btn-primary" style="padding:10px 20px;"><i class="fas fa-check"></i> บันทึกข้อมูล</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(overlay);

        // Fill descriptions and render gallery
        const descTextarea = document.getElementById('news-form-seo-desc');
        if (descTextarea) descTextarea.value = n.seo_desc || '';

        const renderGallery = () => {
            const container = document.getElementById('activity-gallery-container');
            if (!container) return;
            if (window.currentActivityGallery.length === 0) {
                container.innerHTML = `<p style="font-size:0.8rem; color:var(--text-muted); margin:0;">ไม่มีภาพแกลเลอรีเพิ่มเติม</p>`;
                return;
            }
            container.innerHTML = `
                <div style="display:grid; grid-template-columns: repeat(5, 1fr); gap:8px;">
                    ${window.currentActivityGallery.map((img, idx) => `
                        <div style="position:relative; width:100%; aspect-ratio:1/1; border-radius:var(--radius-sm); border:1px solid var(--border-color); overflow:hidden; background:var(--bg-sec);">
                            <img src="${img}" style="width:100%; height:100%; object-fit:cover;">
                            <button type="button" class="delete-gallery-img-btn" data-index="${idx}" style="position:absolute; top:2px; right:2px; width:18px; height:18px; border-radius:50%; border:none; background:rgba(239,68,68,0.9); color:white; font-size:0.65rem; cursor:pointer; display:flex; justify-content:center; align-items:center;"><i class="fas fa-times"></i></button>
                        </div>
                    `).join('')}
                </div>
            `;
            container.querySelectorAll('.delete-gallery-img-btn').forEach(btn => {
                btn.onclick = () => {
                    const idx = parseInt(btn.dataset.index);
                    window.currentActivityGallery.splice(idx, 1);
                    renderGallery();
                };
            });
        };
        renderGallery();

        // Bind media events
        document.getElementById('activity-gallery-upload-btn').onclick = () => {
            document.getElementById('activity-gallery-file-input').click();
        };

        document.getElementById('activity-gallery-file-input').onchange = async (e) => {
            if (e.target.files && e.target.files.length > 0) {
                for (let i = 0; i < e.target.files.length; i++) {
                    const webpData = await this.convertImageToWebP(e.target.files[i]);
                    window.currentActivityGallery.push(webpData);
                }
                renderGallery();
                e.target.value = '';
            }
        };

        document.getElementById('activity-gallery-select-btn').onclick = () => {
            this.openMediaSelectorDialog((selectedBase64) => {
                window.currentActivityGallery.push(selectedBase64);
                renderGallery();
            });
        };

        // Textarea raw value settings
        document.getElementById('news-form-content-th').value = n.content_th || '';

        const closeDialog = () => {
            overlay.remove();
            delete window.currentActivityGallery;
        };
        document.getElementById('close-modal-btn').onclick = closeDialog;
        document.getElementById('close-modal-cancel-btn').onclick = closeDialog;

        // Image selection
        document.getElementById('select-news-media-btn').onclick = () => {
            this.openMediaSelectorDialog((selectedBase64) => {
                const preview = document.getElementById('news-form-img-preview');
                preview.src = selectedBase64;
                preview.style.display = 'inline-block';
                n.thumbnail = selectedBase64;
            });
        };

        const fileInput = document.getElementById('news-form-file');
        if (fileInput) {
            fileInput.onchange = async (e) => {
                if (e.target.files && e.target.files[0]) {
                    const webpData = await this.convertImageToWebP(e.target.files[0]);
                    const preview = document.getElementById('news-form-img-preview');
                    preview.src = webpData;
                    preview.style.display = 'inline-block';
                    n.thumbnail = webpData;
                }
            };
        }

        // Form Submit
        document.getElementById('edit-news-form').onsubmit = async (e) => {
            e.preventDefault();
            
            const updatedNews = {
                id: n.id,
                title_th: document.getElementById('news-form-title-th').value,
                title_en: document.getElementById('news-form-title-en').value || '',
                thumbnail: n.thumbnail || '',
                summary_th: document.getElementById('news-form-sum-th').value || '',
                summary_en: document.getElementById('news-form-sum-en').value || '',
                content_th: document.getElementById('news-form-content-th').value || '',
                content_en: document.getElementById('news-form-content-en').value || '',
                date: document.getElementById('news-form-date').value || '',
                location_th: document.getElementById('news-form-location-th').value || '',
                location_en: document.getElementById('news-form-location-en').value || '',
                gallery_images: window.currentActivityGallery || [],
                visible: document.getElementById('news-form-vis').checked,
                featured: document.getElementById('news-form-feat').checked,
                order: parseInt(document.getElementById('news-form-order').value) || 0,
                seo_title: document.getElementById('news-form-seo-title').value || '',
                seo_desc: document.getElementById('news-form-seo-desc').value || '',
                created_at: n.created_at || new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            try {
                await this.db.put('news', updatedNews);
                closeDialog();
                this.renderActiveView();
            } catch (err) {
                alert(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
            }
        };
    }


    // --- Articles CRUD Manager ---
    async loadArticlesView(container) {
        const articles = await this.db.getAll('articles');
        const sortedArticles = [...articles].sort((a, b) => new Date(b.date) - new Date(a.date));

        container.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <p style="color:var(--text-muted); font-size:0.9rem;">จัดบทความให้สาระความรู้เกี่ยวกับการพิมพ์สกรีน หรือประเภทของแก้วพลาสติกที่ถูกต้องให้กับลูกค้า</p>
                <button class="btn btn-primary" id="add-article-btn"><i class="fas fa-plus"></i> เขียนบทความใหม่</button>
            </div>
            
            <div class="admin-card">
                ${sortedArticles.length === 0 ? `
                    <p style="color:var(--text-muted); font-size:0.9rem; text-align:center; padding:45px 0;">ยังไม่มีบทความความรู้อยู่ในระบบ</p>
                ` : `
                    <div style="overflow-x:auto;">
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th>รูปย่อ</th>
                                    <th>หัวข้อบทความ (TH)</th>
                                    <th>วันที่ลงข้อมูล</th>
                                    <th>สถานะการมองเห็น</th>
                                    <th style="text-align:right;">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${sortedArticles.map(a => `
                                    <tr>
                                        <td style="width:75px;">
                                            <div style="width:55px; height:55px; border-radius:var(--radius-sm); border:1px solid var(--border-color); background:var(--bg-sec); display:flex; align-items:center; justify-content:center; overflow:hidden;">
                                                ${a.thumbnail ? `<img src="${a.thumbnail}" style="width:100%; height:100%; object-fit:cover;">` : `<i class="fas fa-graduation-cap" style="color:var(--text-muted);"></i>`}
                                            </div>
                                        </td>
                                        <td>
                                            <strong>${a.title_th}</strong><br>
                                            <span style="font-size:0.78rem; color:var(--text-muted);">${(a.summary_th || '').slice(0, 70)}...</span>
                                        </td>
                                        <td>${a.date}</td>
                                        <td>
                                            ${a.visible ? '<span class="badge badge-success">เผยแพร่</span>' : '<span class="badge" style="background:#e2e8f0; color:#475569;">แบบร่าง</span>'}
                                        </td>
                                        <td style="text-align:right;">
                                            <button class="btn btn-outline edit-article-btn" data-id="${a.id}" style="padding:6px 12px; font-size:0.75rem; border-color:var(--secondary); color:var(--secondary); margin-right:8px;"><i class="fas fa-edit"></i> แก้ไข</button>
                                            <button class="btn btn-outline del-article-btn" data-id="${a.id}" style="padding:6px 12px; font-size:0.75rem; border-color:var(--danger); color:var(--danger);"><i class="fas fa-trash-alt"></i> ลบ</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        `;

        document.getElementById('add-article-btn').onclick = () => this.openArticleEditDialog(null);
        document.querySelectorAll('.edit-article-btn').forEach(btn => {
            btn.onclick = () => this.openArticleEditDialog(btn.dataset.id);
        });
        document.querySelectorAll('.del-article-btn').forEach(btn => {
            btn.onclick = async () => {
                if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบบทความรายการนี้ออกอย่างถาวร?')) {
                    await this.db.delete('articles', btn.dataset.id);
                    this.renderActiveView();
                }
            };
        });
    }

    async openArticleEditDialog(articleId) {
        let a = {
            id: 'article_' + Date.now(),
            title_th: '',
            title_en: '',
            thumbnail: '',
            summary_th: '',
            summary_en: '',
            content_th: '',
            content_en: '',
            date: new Date().toISOString().split('T')[0],
            visible: true,
            seo_title: '',
            seo_desc: ''
        };

        let isEdit = false;
        if (articleId) {
            const fetched = await this.db.get('articles', articleId);
            if (fetched) {
                a = fetched;
                isEdit = true;
            }
        }

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';
        overlay.id = 'admin-edit-modal';

        overlay.innerHTML = `
            <div class="modal-window" style="max-width:700px; padding:30px;">
                <button class="modal-close-btn" id="close-modal-btn"><i class="fas fa-times"></i></button>
                <h3 style="font-size:1.25rem; font-weight:800; color:var(--secondary); margin-bottom:20px; border-bottom:1.5px solid var(--border-color); padding-bottom:8px;">
                    ${isEdit ? 'แก้ไขบทความสาระน่ารู้' : 'เขียนบทความแนะนำลูกค้าตัวใหม่'}
                </h3>
                
                <form id="edit-article-form">
                    <div style="display:flex; flex-direction:column; gap:12px; max-height:60vh; overflow-y:auto; padding-right:8px;">
                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">หัวข้อบทความภาษาไทย (Title TH) <span style="color:var(--danger)">*</span></label>
                            <input type="text" id="article-form-title-th" class="form-control" value="${a.title_th}" required>
                        </div>
                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">หัวข้อบทความภาษาอังกฤษ (Title EN) <span style="color:var(--danger)">*</span></label>
                            <input type="text" id="article-form-title-en" class="form-control" value="${a.title_en}" required>
                        </div>
                        
                        <div class="grid-2">
                            <div class="form-group">
                                <label style="font-weight:600; font-size:0.85rem;">วันที่ลงทะเบียน (Date)</label>
                                <input type="date" id="article-form-date" class="form-control" value="${a.date}" required>
                            </div>
                            <div style="display:flex; align-items:center; padding-top:25px;">
                                <label style="cursor:pointer; font-weight:700; font-size:0.85rem;"><input type="checkbox" id="article-form-vis" ${a.visible ? 'checked' : ''}> เผยแพร่ทันที</label>
                            </div>
                        </div>

                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">สรุปบทความแบบสั้นๆ (Summary TH)</label>
                            <textarea id="article-form-sum-th" class="form-control" style="min-height:50px;">${a.summary_th || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">สรุปบทความแบบสั้นๆ (Summary EN)</label>
                            <textarea id="article-form-sum-en" class="form-control" style="min-height:50px;">${a.summary_en || ''}</textarea>
                        </div>

                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">เนื้อหาบทความ (Content TH)</label>
                            <textarea id="article-form-content-th" class="form-control" style="min-height:120px;">${a.content_th || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">เนื้อหาบทความ (Content EN)</label>
                            <textarea id="article-form-content-en" class="form-control" style="min-height:120px;">${a.content_en || ''}</textarea>
                        </div>

                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">ภาพหน้าปกบทความ (Thumbnail)</label>
                            <div style="display:flex; gap:10px; align-items:center;">
                                <input type="file" id="article-form-file" class="form-control" accept="image/*" style="padding: 6px; flex-grow:1;">
                                <button type="button" class="btn btn-outline" id="select-article-media-btn" style="padding:8px 12px; font-size:0.75rem;"><i class="fas fa-folder-open"></i> เลือกจากคลังภาพ</button>
                            </div>
                            
                            <div style="margin-top:10px; text-align:center;">
                                <img src="${a.thumbnail || ''}" id="article-form-img-preview" style="max-height:100px; border-radius:var(--radius-sm); border:1px solid var(--border-color); display:${a.thumbnail ? 'inline-block' : 'none'};">
                            </div>
                        </div>

                        <!-- SEO Metadata -->
                        <div class="form-group" style="background:var(--bg-sec); padding:16px; border:1px solid var(--border-color); border-radius:var(--radius-md);">
                            <label style="font-weight:800; color:var(--secondary); font-size:0.85rem;"><i class="fas fa-globe"></i> SEO Metadata (สำหรับการติด Google Search)</label>
                            <div style="display:flex; flex-direction:column; gap:10px; margin-top:8px;">
                                <input type="text" id="article-form-seo-title" class="form-control" value="${a.seo_title || ''}" placeholder="Meta Title (เว้นว่างไว้หากต้องการใช้ชื่อข้อความบทความ)">
                                <textarea id="article-form-seo-desc" class="form-control" style="min-height:50px;" placeholder="Meta Description"></textarea>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-top:24px; display:flex; gap:12px; justify-content:flex-end;">
                        <button type="button" class="btn btn-outline" id="close-modal-cancel-btn" style="padding:10px 16px;">ยกเลิก</button>
                        <button type="submit" class="btn btn-primary" style="padding:10px 20px;"><i class="fas fa-check"></i> บันทึกบทความ</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(overlay);

        // Fill seo desc
        const descTextarea = document.getElementById('article-form-seo-desc');
        if (descTextarea) descTextarea.value = a.seo_desc || '';

        const closeDialog = () => { overlay.remove(); };
        document.getElementById('close-modal-btn').onclick = closeDialog;
        document.getElementById('close-modal-cancel-btn').onclick = closeDialog;

        // Image selection
        document.getElementById('select-article-media-btn').onclick = () => {
            this.openMediaSelectorDialog((selectedBase64) => {
                const preview = document.getElementById('article-form-img-preview');
                preview.src = selectedBase64;
                preview.style.display = 'inline-block';
                a.thumbnail = selectedBase64;
            });
        };

        const fileInput = document.getElementById('article-form-file');
        if (fileInput) {
            fileInput.onchange = async (e) => {
                if (e.target.files && e.target.files[0]) {
                    const webpData = await this.convertImageToWebP(e.target.files[0]);
                    const preview = document.getElementById('article-form-img-preview');
                    preview.src = webpData;
                    preview.style.display = 'inline-block';
                    a.thumbnail = webpData;
                }
            };
        }

        // Form Submit
        document.getElementById('edit-article-form').onsubmit = async (e) => {
            e.preventDefault();
            
            const updatedArt = {
                id: a.id,
                title_th: document.getElementById('article-form-title-th').value,
                title_en: document.getElementById('article-form-title-en').value,
                thumbnail: a.thumbnail,
                summary_th: document.getElementById('article-form-sum-th').value,
                summary_en: document.getElementById('article-form-sum-en').value,
                content_th: document.getElementById('article-form-content-th').value,
                content_en: document.getElementById('article-form-content-en').value,
                date: document.getElementById('article-form-date').value,
                visible: document.getElementById('article-form-vis').checked,
                seo_title: document.getElementById('article-form-seo-title').value,
                seo_desc: document.getElementById('article-form-seo-desc').value
            };

            await this.db.put('articles', updatedArt);
            closeDialog();
            this.renderActiveView();
        };
    }


    // --- Client Logos CRUD Manager ---
    async loadClientsView(container) {
        const clients = await this.db.getAll('clients');
        const sortedClients = [...clients].sort((a, b) => a.order - b.order);

        container.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <p style="color:var(--text-muted); font-size:0.9rem;">เพิ่มหรือลบโลโก้ลูกค้า คาเฟ่พันธมิตร เพื่อแสดงในแถบสไลด์ลูกค้าพันธมิตร</p>
                <button class="btn btn-primary" id="add-client-btn"><i class="fas fa-plus"></i> เพิ่มโลโก้ร้านลูกค้า</button>
            </div>
            
            <div class="admin-card">
                ${sortedClients.length === 0 ? `
                    <p style="color:var(--text-muted); font-size:0.9rem; text-align:center; padding:45px 0;">ยังไม่มีข้อมูลโลโก้ลูกค้าพันธมิตรในฐานข้อมูล</p>
                ` : `
                    <div style="overflow-x:auto;">
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th>โลโก้ร้าน</th>
                                    <th>ชื่อลูกค้า/ร้าน</th>
                                    <th>ลิงก์หน้าร้าน (URL)</th>
                                    <th>การเรียงลำดับ</th>
                                    <th>แสดงผล</th>
                                    <th style="text-align:right;">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${sortedClients.map(c => `
                                    <tr>
                                        <td style="width:75px;">
                                            <div style="width:55px; height:55px; border-radius:var(--radius-sm); border:1px solid var(--border-color); background:var(--bg-sec); display:flex; align-items:center; justify-content:center; overflow:hidden; padding:4px;">
                                                ${c.logo_src ? `<img src="${c.logo_src}" style="width:100%; height:100%; object-fit:contain;">` : `<i class="fas fa-store" style="color:var(--text-muted);"></i>`}
                                            </div>
                                        </td>
                                        <td><strong>${c.name}</strong></td>
                                        <td><code>${c.link || '#'}</code></td>
                                        <td>ลำดับที่ ${c.order}</td>
                                        <td>
                                            ${c.visible ? '<span class="badge badge-success">แสดงผล</span>' : '<span class="badge" style="background:#e2e8f0; color:#475569;">ซ่อน</span>'}
                                        </td>
                                        <td style="text-align:right;">
                                            <button class="btn btn-outline edit-client-btn" data-id="${c.id}" style="padding:6px 12px; font-size:0.75rem; border-color:var(--secondary); color:var(--secondary); margin-right:8px;"><i class="fas fa-edit"></i> แก้ไข</button>
                                            <button class="btn btn-outline del-client-btn" data-id="${c.id}" style="padding:6px 12px; font-size:0.75rem; border-color:var(--danger); color:var(--danger);"><i class="fas fa-trash-alt"></i> ลบ</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        `;

        document.getElementById('add-client-btn').onclick = () => this.openClientEditDialog(null);
        document.querySelectorAll('.edit-client-btn').forEach(btn => {
            btn.onclick = () => this.openClientEditDialog(btn.dataset.id);
        });
        document.querySelectorAll('.del-client-btn').forEach(btn => {
            btn.onclick = async () => {
                if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลโลโก้ลูกค้ารายนี้ออกถาวร?')) {
                    await this.db.delete('clients', btn.dataset.id);
                    this.renderActiveView();
                }
            };
        });
    }

    async openClientEditDialog(clientId) {
        let c = {
            id: 'client_' + Date.now(),
            name: '',
            logo_src: '',
            link: '',
            visible: true,
            order: 1,
            featured: false
        };

        let isEdit = false;
        if (clientId) {
            const fetched = await this.db.get('clients', clientId);
            if (fetched) {
                c = fetched;
                isEdit = true;
            }
        }

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';
        overlay.id = 'admin-edit-modal';

        overlay.innerHTML = `
            <div class="modal-window" style="max-width:480px; padding:30px;">
                <button class="modal-close-btn" id="close-modal-btn"><i class="fas fa-times"></i></button>
                <h3 style="font-size:1.25rem; font-weight:800; color:var(--secondary); margin-bottom:20px; border-bottom:1.5px solid var(--border-color); padding-bottom:8px;">
                    ${isEdit ? 'แก้ไขข้อมูลลูกค้าพันธมิตร' : 'เพิ่มร้านลูกค้าพันธมิตรใหม่'}
                </h3>
                
                <form id="edit-client-form">
                    <div style="display:flex; flex-direction:column; gap:12px;">
                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">ชื่อของร้าน/ลูกค้าคาเฟ่ <span style="color:var(--danger)">*</span></label>
                            <input type="text" id="client-form-name" class="form-control" value="${c.name}" required>
                        </div>
                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">ลิงก์ไปยังเว็บไซต์หรือแฟนเพจหน้าร้าน (URL)</label>
                            <input type="url" id="client-form-link" class="form-control" value="${c.link || ''}" placeholder="https://facebook.com/cafe-shop">
                        </div>
                        <div class="grid-2">
                            <div class="form-group">
                                <label style="font-weight:600; font-size:0.85rem;">ลำดับการจัดเรียง (Order)</label>
                                <input type="number" id="client-form-order" class="form-control" value="${c.order}" min="1" required>
                            </div>
                            <div style="display:flex; align-items:center; gap:20px; padding-top:25px;">
                                <label style="cursor:pointer; font-weight:700; font-size:0.85rem;"><input type="checkbox" id="client-form-vis" ${c.visible ? 'checked' : ''}> แสดงผล</label>
                                <label style="cursor:pointer; font-weight:700; font-size:0.85rem;"><input type="checkbox" id="client-form-feat" ${c.featured ? 'checked' : ''}> ลูกค้าแนะนำ</label>
                            </div>
                        </div>

                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">รูปโลโก้ร้าน (โปร่งแสง PNG/WebP ดีที่สุด)</label>
                            <div style="display:flex; gap:10px; align-items:center;">
                                <input type="file" id="client-form-file" class="form-control" accept="image/*" style="padding: 6px; flex-grow:1;">
                                <button type="button" class="btn btn-outline" id="select-client-media-btn" style="padding:8px 12px; font-size:0.75rem;"><i class="fas fa-folder-open"></i> เลือกภาพ</button>
                            </div>
                            
                            <div style="margin-top:10px; text-align:center;">
                                <img src="${c.logo_src || ''}" id="client-form-img-preview" style="max-height:80px; background:#f1f5f9; border-radius:var(--radius-sm); border:1px solid var(--border-color); display:${c.logo_src ? 'inline-block' : 'none'}; padding:5px;">
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-top:24px; display:flex; gap:12px; justify-content:flex-end;">
                        <button type="button" class="btn btn-outline" id="close-modal-cancel-btn" style="padding:10px 16px;">ยกเลิก</button>
                        <button type="submit" class="btn btn-primary" style="padding:10px 20px;"><i class="fas fa-check"></i> บันทึกข้อมูล</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(overlay);

        const closeDialog = () => { overlay.remove(); };
        document.getElementById('close-modal-btn').onclick = closeDialog;
        document.getElementById('close-modal-cancel-btn').onclick = closeDialog;

        // Image selection
        document.getElementById('select-client-media-btn').onclick = () => {
            this.openMediaSelectorDialog((selectedBase64) => {
                const preview = document.getElementById('client-form-img-preview');
                preview.src = selectedBase64;
                preview.style.display = 'inline-block';
                c.logo_src = selectedBase64;
            });
        };

        const fileInput = document.getElementById('client-form-file');
        if (fileInput) {
            fileInput.onchange = async (e) => {
                if (e.target.files && e.target.files[0]) {
                    const webpData = await this.convertImageToWebP(e.target.files[0]);
                    const preview = document.getElementById('client-form-img-preview');
                    preview.src = webpData;
                    preview.style.display = 'inline-block';
                    c.logo_src = webpData;
                }
            };
        }

        // Form Submit
        document.getElementById('edit-client-form').onsubmit = async (e) => {
            e.preventDefault();
            
            const updatedClient = {
                id: c.id,
                name: document.getElementById('client-form-name').value,
                logo_src: c.logo_src,
                link: document.getElementById('client-form-link').value,
                visible: document.getElementById('client-form-vis').checked,
                order: parseInt(document.getElementById('client-form-order').value) || 1,
                featured: document.getElementById('client-form-feat').checked
            };

            await this.db.put('clients', updatedClient);
            closeDialog();
            this.renderActiveView();
        };
    }

    previewLogoImage(logoSrc) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';
        overlay.style.zIndex = '30000';
        overlay.innerHTML = `
            <div class="modal-window" style="max-width:500px; padding:20px; text-align:center; background:#121212;">
                <button class="modal-close-btn" onclick="this.parentNode.parentNode.remove()" style="background:rgba(255,255,255,0.2); color:white;"><i class="fas fa-times"></i></button>
                <img src="${logoSrc}" style="max-width:100%; max-height:80vh; object-fit:contain; display:inline-block; border-radius:var(--radius-md);">
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.onclick = (e) => {
            if (e.target === overlay) overlay.remove();
        };
    }

    async loadFaqView(area) {
        let faqs = [];
        try {
            faqs = await this.db.getAll('faq');
        } catch (e) {
            console.error("Failed to load FAQs:", e);
        }

        const sorted = [...faqs].sort((a, b) => (a.order || 0) - (b.order || 0));

        area.innerHTML = `
            <div style="background:var(--bg-main); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:24px; box-shadow:var(--shadow-sm);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:1.5px solid var(--border-color); padding-bottom:12px;">
                    <h3 style="font-size:1.15rem; font-weight:800; color:var(--secondary);"><i class="fas fa-question-circle" style="color:var(--primary)"></i> จัดการคำถามที่พบบ่อย (FAQs)</h3>
                    <button id="add-faq-btn" class="btn btn-primary" style="display: none; padding:10px 18px;"><i class="fas fa-plus"></i> เพิ่มคำถามพบบ่อย</button>
                </div>

                <div class="table-responsive">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th style="width:70px; text-align:center;">ลำดับ</th>
                                <th>คำถาม (ภาษาไทย)</th>
                                <th>คำถาม (ภาษาอังกฤษ)</th>
                                <th style="width:110px; text-align:center;">การแสดงผล</th>
                                <th style="width:180px; text-align:center;">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sorted.length === 0 ? `
                                <tr>
                                    <td colspan="5" style="text-align:center; padding:40px; color:var(--text-muted);">ไม่พบข้อมูลคำถามพบบ่อยในฐานข้อมูล</td>
                                </tr>
                            ` : sorted.map(faq => `
                                <tr>
                                    <td style="text-align:center; font-weight:700;">${faq.order || 1}</td>
                                    <td style="font-weight:600; color:var(--secondary);">${faq.question_th || '-'}</td>
                                    <td>${faq.question_en || '-'}</td>
                                    <td style="text-align:center;">
                                        <span class="badge ${faq.visible ? 'badge-success' : 'badge-danger'}" style="background:${faq.visible ? '#10b981' : '#ef4444'}; color:white; padding:4px 8px; border-radius:4px; font-size:0.75rem;">
                                            ${faq.visible ? 'แสดงผล' : 'ซ่อน'}
                                        </span>
                                    </td>
                                    <td style="text-align:center;">
                                        <div style="display:flex; gap:8px; justify-content:center;">
                                            <button class="btn btn-outline edit-faq-btn" data-id="${faq.id}" style="padding:6px 12px; font-size:0.75rem;"><i class="fas fa-edit"></i> แก้ไข</button>
                                            <button class="btn btn-outline del-faq-btn" data-id="${faq.id}" style="display: none; padding:6px 12px; font-size:0.75rem; border-color:var(--danger); color:var(--danger);"><i class="fas fa-trash-alt"></i> ลบ</button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        document.getElementById('add-faq-btn').onclick = () => this.openFaqEditDialog(null);
        document.querySelectorAll('.edit-faq-btn').forEach(btn => {
            btn.onclick = () => this.openFaqEditDialog(btn.dataset.id);
        });
        document.querySelectorAll('.del-faq-btn').forEach(btn => {
            btn.onclick = async () => {
                if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลคำถามข้อนี้ออกถาวร?')) {
                    await this.db.delete('faq', btn.dataset.id);
                    this.renderActiveView();
                }
            };
        });
    }

    async openFaqEditDialog(faqId) {
        let f = {
            id: 'faq_' + Date.now(),
            question_th: '',
            question_en: '',
            answer_th: '',
            answer_en: '',
            visible: true,
            order: 1
        };

        let isEdit = false;
        if (faqId) {
            const fetched = await this.db.get('faq', faqId);
            if (fetched) {
                f = fetched;
                isEdit = true;
            }
        }

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';
        overlay.id = 'admin-edit-modal';

        overlay.innerHTML = `
            <div class="modal-window" style="max-width:550px; padding:30px;">
                <button class="modal-close-btn" id="close-modal-btn"><i class="fas fa-times"></i></button>
                <h3 style="font-size:1.25rem; font-weight:800; color:var(--secondary); margin-bottom:20px; border-bottom:1.5px solid var(--border-color); padding-bottom:8px;">
                    ${isEdit ? 'แก้ไขคำถามที่พบบ่อย' : 'เพิ่มคำถามที่พบบ่อยใหม่'}
                </h3>
                
                <form id="edit-faq-form">
                    <div style="display:flex; flex-direction:column; gap:12px;">
                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">คำถาม (ภาษาไทย) <span style="color:var(--danger)">*</span></label>
                            <input type="text" id="faq-form-q-th" class="form-control" value="${f.question_th}" required>
                        </div>
                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">คำถาม (ภาษาอังกฤษ) <span style="color:var(--danger)">*</span></label>
                            <input type="text" id="faq-form-q-en" class="form-control" value="${f.question_en}" required>
                        </div>
                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">คำตอบ (ภาษาไทย) <span style="color:var(--danger)">*</span></label>
                            <textarea id="faq-form-a-th" class="form-control" rows="3" required style="resize:vertical;">${f.answer_th}</textarea>
                        </div>
                        <div class="form-group">
                            <label style="font-weight:600; font-size:0.85rem;">คำตอบ (ภาษาอังกฤษ) <span style="color:var(--danger)">*</span></label>
                            <textarea id="faq-form-a-en" class="form-control" rows="3" required style="resize:vertical;">${f.answer_en}</textarea>
                        </div>
                        <div class="form-group" style="display: none;">
                            <label style="font-weight:600; font-size:0.85rem;">ลำดับการจัดเรียง (Order)</label>
                            <input type="number" id="faq-form-order" class="form-control" value="${f.order}" min="1" required>
                        </div>
                        <div style="display:flex; align-items:center; gap:20px; padding-top:10px; margin-bottom:10px;">
                            <label style="cursor:pointer; font-weight:700; font-size:0.85rem;"><input type="checkbox" id="faq-form-vis" ${f.visible ? 'checked' : ''}> แสดงผลบนหน้าเว็บ</label>
                        </div>
                    </div>
                    
                    <div style="margin-top:24px; display:flex; gap:12px; justify-content:flex-end;">
                        <button type="button" class="btn btn-outline" id="close-modal-cancel-btn" style="padding:10px 16px;">ยกเลิก</button>
                        <button type="submit" class="btn btn-primary" style="padding:10px 20px;"><i class="fas fa-check"></i> บันทึกข้อมูล</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(overlay);

        const closeDialog = () => { overlay.remove(); };
        document.getElementById('close-modal-btn').onclick = closeDialog;
        document.getElementById('close-modal-cancel-btn').onclick = closeDialog;

        // Form Submit
        document.getElementById('edit-faq-form').onsubmit = async (e) => {
            e.preventDefault();
            
            const updatedFaq = {
                id: f.id,
                question_th: document.getElementById('faq-form-q-th').value,
                question_en: document.getElementById('faq-form-q-en').value,
                answer_th: document.getElementById('faq-form-a-th').value,
                answer_en: document.getElementById('faq-form-a-en').value,
                visible: document.getElementById('faq-form-vis').checked,
                order: parseInt(document.getElementById('faq-form-order').value) || 1
            };

            try {
                await this.db.put('faq', updatedFaq);
                closeDialog();
                this.renderActiveView();
            } catch (err) {
                alert(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
            }
        };
    }
}

window.CharoenAdmin = CharoenAdmin;