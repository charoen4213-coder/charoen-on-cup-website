/**
 * app.js
 * Frontend Core Controller & Single Page Application (SPA) Router
 * Offline-first design with dynamic Hero Slider, Product Grid, and Home Videos.
 * Supports Antique White (#FAEBD7) and Yale Blue (#04356A) color layouts.
 */

class CharoenApp {
    constructor() {
        this.db = new window.CharoenOnCupDB();
        this.lang = localStorage.getItem('charoen_lang') || 'th';
        this.theme = localStorage.getItem('charoen_theme') || 'light';
        
        this.routes = {
            'home': 'home',
            'about': 'about',
            'products': 'products',
            'portfolio': 'portfolio',
            'quote': 'quote',
            'contact': 'contact',
            'faq': 'faq',
            'news': 'news',
            'news-detail': 'news-detail',
            'articles': 'articles',
            'articles-detail': 'articles-detail',
            'search': 'search',
            'privacy-policy': 'privacy-policy',
            'terms-conditions': 'terms-conditions'
        };

        this.sliderInterval = null;
        this.sliderUnsubscribe = null;
        this.currentSlideIndex = 0;
        
        // Localization dictionary
        this.dictionary = {
            th: {
                nav_home: 'หน้าแรก',
                nav_about: 'เกี่ยวกับเรา',
                nav_products: 'สินค้าและบริการ',
                nav_portfolio: 'ผลงานสกรีน',
                nav_quote: 'ขอใบเสนอราคา',
                nav_contact: 'ติดต่อเรา',
                nav_faq: 'คำถามที่พบบ่อย',
                nav_news: 'กิจกรรมและการสนับสนุน',
                nav_news_detail: 'รายละเอียดกิจกรรมและการสนับสนุน',
                nav_articles: 'บทความความรู้',
                nav_articles_detail: 'รายละเอียดบทความ',
                nav_search: 'ผลการค้นหา',
                nav_privacy_policy: 'นโยบายความเป็นส่วนตัว',
                nav_terms_conditions: 'ข้อตกลงและเงื่อนไข',
                
                cta_inquire: 'สอบถามทาง LINE',
                cta_get_quote: 'ขอใบเสนอราคาฟรี',
                cta_view_details: 'ดูรายละเอียด',
                
                home_hero_title: 'เจริญ ออน คัพ สกรีนแก้วหาดใหญ่',
                home_hero_sub: 'สกรีนแก้วพลาสติก แก้วกระดาษ ทุกประเภท คุณภาพดี สีสดคมชัด สกรีนได้รอบใบ ขั้นต่ำน้อย ส่งไวทั่วประเทศ',
                home_services_title: 'ประเภทบรรจุภัณฑ์ที่เราให้บริการสกรีน',
                home_services_sub: 'เลือกชมหมวดหมู่ถ้วยแก้ว บรรจุภัณฑ์ และอุปกรณ์ต่างๆ ที่ได้รับความนิยมจากแบรนด์เครื่องดื่มชั้นนำ',
                
                products_all: 'สินค้าทั้งหมด',
                products_empty: 'ขณะนี้กำลังอัปเดตข้อมูลสินค้า',
                products_empty_link: 'ติดต่อเรา',
                
                portfolio_all: 'ผลงานทั้งหมด',
                portfolio_empty: 'ขณะนี้กำลังอัปเดตผลงาน',
                
                quote_title: 'ประเมินราคาและขอใบเสนอราคา',
                quote_sub: 'กรุณากรอกข้อมูลด้านล่างให้ครบถ้วน เจ้าหน้าที่จะส่งราคาให้ท่านทาง LINE หรือเบอร์โทรศัพท์โดยเร็วที่สุด',
                form_name: 'ชื่อ-นามสกุล หรือชื่อร้านกาแฟ',
                form_phone: 'เบอร์โทรศัพท์ติดต่อ',
                form_line: 'Line ID (สะดวกในการส่งตัวอย่างแบบ 3D)',
                form_product_type: 'ประเภทบรรจุภัณฑ์ที่ต้องการสกรีน',
                form_qty: 'จำนวนสั่งพิมพ์ที่ต้องการ (ขั้นต่ำ 1,000 ใบ)',
                form_details: 'รายละเอียดเพิ่มเติม (ขนาดแก้ว, จำนวนสีพิมพ์สกรีน, ฝาแก้ว)',
                form_file: 'แนบรูปโลโก้ของคุณ (ถ้ามี)',
                form_submit: 'ส่งข้อมูลขอใบเสนอราคา',
                form_success_title: 'ส่งคำขอเสนอราคาเรียบร้อยแล้ว!',
                form_success_desc: 'ข้อมูลของท่านได้รับการบันทึกแล้ว เจ้าหน้าที่จะติดต่อกลับเพื่อส่งใบเสนอราคาและตัวอย่าง 3D ให้ท่านตรวจสอบโดยเร็วที่สุดครับ',
                
                btn_close: 'ปิดหน้าต่าง',
                btn_ok: 'ตกลง',
                
                detail_title: 'ข้อมูลจำเพาะทางเทคนิค',
                detail_material: 'วัสดุเนื้อพลาสติก',
                detail_volume: 'ขนาดความจุสินค้า',
                detail_min_order: 'จำนวนผลิตขั้นต่ำ',
                detail_diameter: 'ปากแก้ว / ขนาดสเปก',
                
                theme_toggle: 'สลับโหมดสี',
                lang_toggle: 'TH / EN'
            },
            en: {
                nav_home: 'Home',
                nav_about: 'About Us',
                nav_products: 'Products',
                nav_portfolio: 'Portfolio',
                nav_quote: 'Get a Quote',
                nav_contact: 'Contact Us',
                nav_faq: 'FAQ',
                nav_news: 'Activities & Support',
                nav_news_detail: 'Activity Details',
                nav_articles: 'Articles & Guides',
                nav_articles_detail: 'Article Details',
                nav_search: 'Search Results',
                nav_privacy_policy: 'Privacy Policy',
                nav_terms_conditions: 'Terms & Conditions',
                
                cta_inquire: 'Inquire on LINE',
                cta_get_quote: 'Get Free Quote',
                cta_view_details: 'View Details',
                
                home_hero_title: 'Charoen On Cup Screen Printing',
                home_hero_sub: 'Premium quality screen printing on plastic & paper cups. Rich colors, full wrap-around print, low minimums, fast shipping.',
                home_services_title: 'Our Specialist Packaging Categories',
                home_services_sub: 'Browse our catalog of custom print drinkware, lids, films and bags popular among top beverage brands.',
                
                products_all: 'All Products',
                products_empty: 'Currently updating product information',
                products_empty_link: 'Contact Us',
                
                portfolio_all: 'All Showcase',
                portfolio_empty: 'Currently updating portfolio',
                
                quote_title: 'Request a Free Quote',
                quote_sub: 'Please fill in the form below. Our staff will send you pricing and a 3D mock-up as soon as possible.',
                form_name: 'Your Name or Cafe Name',
                form_phone: 'Phone Number',
                form_line: 'Line ID (Recommended for receiving 3D proof)',
                form_product_type: 'Product to Print',
                form_qty: 'Required Quantity (Min. 1,000 pcs)',
                form_details: 'Additional Details (Cup size, print colors, lid requirements)',
                form_file: 'Attach Logo Image (If any)',
                form_submit: 'Submit Quote Request',
                form_success_title: 'Quote Request Sent!',
                form_success_desc: 'Your request has been successfully recorded. Our staff will contact you shortly with a formal quote and 3D digital mockup.',
                
                btn_close: 'Close Window',
                btn_ok: 'OK',
                
                detail_title: 'Technical Specification',
                detail_material: 'Material Type',
                detail_volume: 'Capacity Volume',
                detail_min_order: 'Min. Order Quantity',
                detail_diameter: 'Rim Diameter / Specs',
                
                theme_toggle: 'Toggle Mode',
                lang_toggle: 'EN / TH'
            }
        };
    }

    t(key) {
        return this.dictionary[this.lang][key] || key;
    }

    async getSetting(key, fallback = '') {
        try {
            const item = await this.db.get('settings', key);
            if (!item || item.value === null || item.value === undefined || item.value === 'null' || item.value === 'undefined') {
                return fallback;
            }
            return item.value;
        } catch (e) {
            return fallback;
        }
    }

    async init() {
        try {
            await this.db.init();
            await this.db.seed();
        } catch (dbErr) {
            console.error("CharoenApp database setup error:", dbErr);
        }

        this.applyTheme();
        this.renderNavbar();
        this.bindGlobalEvents();
        this.updateFooterContactInfo();

        // Listen for route changes
        window.addEventListener('hashchange', () => this.handleRouting());
        this.handleRouting();

        // Remove site preloader
        const preloader = document.getElementById('site-preloader');
        if (preloader) {
            preloader.style.opacity = '0';
            preloader.style.visibility = 'hidden';
        }
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        localStorage.setItem('charoen_theme', this.theme);
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        this.renderNavbar();
    }

    toggleLanguage() {
        this.lang = this.lang === 'th' ? 'en' : 'th';
        localStorage.setItem('charoen_lang', this.lang);
        
        this.renderNavbar();
        this.updateFooterContactInfo();
        this.handleRouting();
    }

    renderNavbar() {
        const menuContainer = document.getElementById('navbar-menu-container');
        const actionsContainer = document.getElementById('navbar-actions-container');
        if (!menuContainer || !actionsContainer) return;

        // Update header logo dynamically
        Promise.all([
            this.db.get('settings', 'logo_img'),
            this.db.get('settings', this.lang === 'th' ? 'company_name_th' : 'company_name_en')
        ]).then(([logoImg, companyName]) => {
            const logoContainer = document.querySelector('.logo-container');
            if (logoContainer) {
                const nameVal = companyName?.value || (this.lang === 'th' ? 'เจริญ ออน คัพ' : 'Charoen On Cup');
                if (logoImg && logoImg.value) {
                    logoContainer.innerHTML = `
                        <div class="logo-icon-img" style="width:36px; height:36px; border-radius:50%; overflow:hidden; background:white; display:flex; align-items:center; justify-content:center; padding:2px;">
                            <img src="${logoImg.value}" style="width:100%; height:100%; object-fit:contain;">
                        </div>
                        <div class="logo-text" id="site-logo-text" style="color:white; font-weight:800; font-size:1.25rem;">${nameVal}<span style="color:var(--bg-sec);">.</span></div>
                    `;
                } else {
                    logoContainer.innerHTML = `
                        <div class="logo-icon" style="color:var(--bg-sec); font-size:1.3rem;"><i class="fas fa-print"></i></div>
                        <div class="logo-text" id="site-logo-text" style="color:white; font-weight:800; font-size:1.25rem;">${nameVal}<span style="color:var(--bg-sec);">.</span></div>
                    `;
                }
            }
        }).catch(err => console.warn("Failed to update navbar logo:", err));

        // Render Menu Items
        menuContainer.innerHTML = `
            <a href="#/home" class="nav-link" data-route="home">${this.lang === 'th' ? 'หน้าแรก' : 'Home'}</a>
            <a href="#/about" class="nav-link" data-route="about">${this.lang === 'th' ? 'เกี่ยวกับเรา' : 'About Us'}</a>
            <a href="#/products" class="nav-link" data-route="products">${this.lang === 'th' ? 'สินค้าและบริการ' : 'Products & Services'}</a>
            <a href="#/portfolio" class="nav-link" data-route="portfolio">${this.lang === 'th' ? 'ผลงานสกรีน' : 'Portfolio'}</a>
            <a href="#/news" class="nav-link" data-route="news">${this.lang === 'th' ? 'กิจกรรมและการสนับสนุน' : 'Activities & Support'}</a>
            <a href="#/faq" class="nav-link" data-route="faq">${this.lang === 'th' ? 'คำถามที่พบบ่อย' : 'FAQ'}</a>
            <a href="#/contact" class="nav-link" data-route="contact">${this.lang === 'th' ? 'ติดต่อเรา' : 'Contact Us'}</a>
            
            <div class="mobile-only-drawer-actions">
                <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                    <span style="font-weight:600; font-size:0.95rem; color:var(--text-sec);">${this.lang === 'th' ? 'สลับภาษา / Language' : 'Toggle Language'}</span>
                    <button class="btn-lang-toggle" id="mobile-lang-toggle-btn" style="border:1px solid var(--border-color); cursor:pointer; border-radius:var(--radius-sm); font-size:0.85rem; font-weight:700; padding:8px 16px; background:var(--bg-sec); color:var(--text-main);">
                        ${this.lang === 'th' ? 'ENGLISH (EN)' : 'ภาษาไทย (TH)'}
                    </button>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                    <span style="font-weight:600; font-size:0.95rem; color:var(--text-sec);">${this.lang === 'th' ? 'โหมดสี / Theme' : 'Theme Toggle'}</span>
                    <button class="btn-theme-toggle" id="mobile-theme-toggle-btn" style="border:1px solid var(--border-color); cursor:pointer; border-radius:var(--radius-sm); font-size:0.95rem; padding:8px 16px; background:var(--bg-sec); color:var(--text-main); display:inline-flex; align-items:center; gap:8px;">
                        <i class="fas ${this.theme === 'light' ? 'fa-moon' : 'fa-sun'}"></i> ${this.theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                    </button>
                </div>
                <a href="#/quote" class="btn btn-primary nav-link-quote" style="display:block; text-align:center; padding:12px; font-weight:700; font-size:0.95rem; width:100%; box-sizing:border-box;">
                    <i class="fas fa-file-invoice-dollar"></i> ${this.t('nav_quote')}
                </a>
            </div>
        `;

        // Render Action Buttons
        actionsContainer.innerHTML = `
            <button class="btn-theme-toggle" id="theme-toggle-btn" title="${this.t('theme_toggle')}" style="border:none; cursor:pointer; background:none; font-size:1.1rem; color:var(--primary); padding:8px;">
                <i class="fas ${this.theme === 'light' ? 'fa-moon' : 'fa-sun'}"></i>
            </button>
            <button class="btn-lang-toggle" id="lang-toggle-btn" style="border:1px solid var(--border-color); cursor:pointer; border-radius:var(--radius-sm); font-size:0.8rem; font-weight:700; padding:6px 12px; background:var(--bg-sec); color:var(--text-main);">
                ${this.lang === 'th' ? 'EN' : 'TH'}
            </button>
            <a href="#/quote" class="btn btn-primary" style="padding: 8px 16px; font-size:0.9rem;">
                <i class="fas fa-file-invoice-dollar"></i> <span class="quote-btn-text">${this.t('nav_quote')}</span>
            </a>
        `;

        // Re-bind actions events
        const desktopThemeBtn = document.getElementById('theme-toggle-btn');
        if (desktopThemeBtn) desktopThemeBtn.onclick = () => this.toggleTheme();

        const desktopLangBtn = document.getElementById('lang-toggle-btn');
        if (desktopLangBtn) desktopLangBtn.onclick = () => this.toggleLanguage();

        const mobThemeBtn = document.getElementById('mobile-theme-toggle-btn');
        if (mobThemeBtn) mobThemeBtn.onclick = () => this.toggleTheme();

        const mobLangBtn = document.getElementById('mobile-lang-toggle-btn');
        if (mobLangBtn) mobLangBtn.onclick = () => this.toggleLanguage();

        // Highlight active route
        const hash = window.location.hash || '#/home';
        const path = hash.slice(2).split('?')[0];
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.dataset.route === path) link.classList.add('active');
            else link.classList.remove('active');
        });
    }

    async updateFooterContactInfo() {
        const address = await this.getSetting(this.lang === 'th' ? 'address_th' : 'address_en') || await this.getSetting('address_th');
        const phone = await this.getSetting('phone');
        const lineId = await this.getSetting('line') || '@charoenoncup';
        const hours = await this.getSetting(this.lang === 'th' ? 'business_hours_th' : 'business_hours_en') || await this.getSetting('business_hours_th');
        const email = await this.getSetting('email');

        const googleMapsUrl = await this.getSetting('google_maps_url');
        const lineUrl = await this.getSetting('line_url');
        const lineQrImage = await this.getSetting('line_qr_image');
        const lineQrVisible = await this.getSetting('line_qr_visible', 'true');

        const facebookUrl = await this.getSetting('facebook_url');
        const facebookVisible = await this.getSetting('facebook_visible', 'true');
        const instagramUrl = await this.getSetting('instagram_url');
        const instagramVisible = await this.getSetting('instagram_visible', 'true');
        const tiktokUrl = await this.getSetting('tiktok_url');
        const tiktokVisible = await this.getSetting('tiktok_visible', 'true');
        const youtubeUrl = await this.getSetting('youtube_url');
        const youtubeVisible = await this.getSetting('youtube_visible', 'true');
        const lineVisible = await this.getSetting('line_visible', 'true');
        const contactVisible = await this.getSetting('contact_visible', 'true');

        const addrEl = document.getElementById('footer-address');
        const phoneEl = document.getElementById('footer-phone');
        const lineEl = document.getElementById('footer-line');
        const hoursEl = document.getElementById('footer-hours');
        const lineLink = document.getElementById('footer-line-link');

        if (addrEl) {
            if (address && contactVisible !== 'false') {
                addrEl.textContent = address;
                addrEl.closest('li').style.display = 'flex';
            } else {
                addrEl.closest('li').style.display = 'none';
            }
        }
        if (phoneEl) {
            if (phone && contactVisible !== 'false') {
                phoneEl.textContent = phone;
                phoneEl.closest('li').style.display = 'flex';
            } else {
                phoneEl.closest('li').style.display = 'none';
            }
        }
        if (hoursEl) {
            if (hours && contactVisible !== 'false') {
                hoursEl.textContent = hours;
                hoursEl.closest('li').style.display = 'flex';
            } else {
                hoursEl.closest('li').style.display = 'none';
            }
        }
        
        const lineItem = document.querySelector('.footer-line-item');
        if (lineItem) {
            if (lineUrl && lineVisible !== 'false' && contactVisible !== 'false') {
                if (lineEl) lineEl.textContent = lineId;
                if (lineLink) {
                    lineLink.href = lineUrl;
                }
                
                const tooltipImg = lineItem.querySelector('.footer-qr-tooltip img');
                const tooltipSpan = lineItem.querySelector('.footer-qr-tooltip');
                if (tooltipImg) {
                    if (lineQrImage && lineQrVisible !== 'false') {
                        tooltipImg.src = lineQrImage;
                        tooltipImg.style.display = 'block';
                        if (tooltipSpan) tooltipSpan.style.display = 'flex';
                    } else {
                        tooltipImg.style.display = 'none';
                        if (tooltipSpan) tooltipSpan.style.display = 'none';
                    }
                }
                lineItem.style.display = 'flex';
            } else {
                lineItem.style.display = 'none';
            }
        }

        // Rebuild footer socials using the reusable renderer
        this.renderFooterSocials(
            facebookUrl, facebookVisible,
            lineUrl, lineVisible,
            lineQrImage, lineQrVisible,
            instagramUrl, instagramVisible,
            tiktokUrl, tiktokVisible,
            youtubeUrl, youtubeVisible,
            email, lineId
        );

        // Update Topbar contacts & Cart badge dynamically
        const topbarPhoneVal = document.getElementById('topbar-phone-val');
        const topbarPhoneLink = document.getElementById('topbar-phone-link');
        const topbarFbLink = document.getElementById('topbar-fb-link');
        const topbarLineLink = document.getElementById('topbar-line-link');

        if (phone && contactVisible !== 'false') {
            const cleanPhone = phone.replace(/[^0-9+]/g, '');
            if (topbarPhoneVal) topbarPhoneVal.textContent = phone;
            if (topbarPhoneLink) {
                topbarPhoneLink.href = `tel:${cleanPhone}`;
                topbarPhoneLink.style.display = 'flex';
            }
        } else {
            if (topbarPhoneLink) topbarPhoneLink.style.display = 'none';
        }

        if (topbarFbLink) {
            if (facebookUrl && facebookVisible !== 'false' && contactVisible !== 'false') {
                topbarFbLink.href = facebookUrl;
                topbarFbLink.style.display = 'inline-block';
            } else {
                topbarFbLink.style.display = 'none';
            }
        }

        if (topbarLineLink) {
            if (lineUrl && lineVisible !== 'false' && contactVisible !== 'false') {
                topbarLineLink.href = lineUrl;
                topbarLineLink.style.display = 'inline-block';
            } else {
                topbarLineLink.style.display = 'none';
            }
        }

        const footerContactCol = document.querySelector('.footer-contact-col');
        if (footerContactCol) {
            if (contactVisible === 'false') {
                footerContactCol.style.display = 'none';
            } else {
                footerContactCol.style.display = 'block';
            }
        }

        try {
            const quotes = await this.db.getAll('quotes');
            const cartBadge = document.querySelector('.cart-badge');
            if (cartBadge) {
                cartBadge.textContent = quotes.length || 0;
            }
        } catch (e) {
            console.warn("Failed to get quotes for cart badge:", e);
        }

        // Update footer logo dynamically
        try {
            const logoImg = await this.db.get('settings', 'logo_img');
            const logoWrapper = document.getElementById('footer-logo-img-wrapper');
            const logoImgEl = document.getElementById('footer-logo-img');
            if (logoWrapper && logoImgEl) {
                if (logoImg && logoImg.value) {
                    logoImgEl.src = logoImg.value;
                    logoWrapper.style.display = 'flex';
                } else {
                    logoWrapper.style.display = 'none';
                }
            }

            // Update footer description
            const footerDescEl = document.getElementById('footer-description');
            if (footerDescEl) {
                const customDescTh = await this.getSetting('footer_desc_th', '');
                const customDescEn = await this.getSetting('footer_desc_en', '');
                
                const fallbackTh = "ผู้ผลิตและจัดจำหน่าย พร้อมรับสกรีนโลโก้แก้วพลาสติก แก้วกระดาษ บรรจุภัณฑ์อาหารและเครื่องดื่ม ด้วยระบบพิมพ์ที่ทันสมัย สีคมชัด ส่งตรงถึงหน้าร้านทั่วประเทศ";
                const fallbackEn = "Custom printing and packaging solutions for plastic cups, paper cups and beverage businesses, with modern production and nationwide delivery.";
                
                if (this.lang === 'th') {
                    footerDescEl.textContent = customDescTh || fallbackTh;
                } else {
                    footerDescEl.textContent = customDescEn || fallbackEn;
                }
            }
        } catch (logoErr) {
            console.warn("Failed to load footer logo or description:", logoErr);
        }
    }

    renderFooterSocials(facebookUrl, facebookVisible, lineUrl, lineVisible, lineQrImage, lineQrVisible, instagramUrl, instagramVisible, tiktokUrl, tiktokVisible, youtubeUrl, youtubeVisible, email, lineId) {
        const footerSocials = document.querySelector('.footer-socials');
        if (!footerSocials) return;

        let socialButtons = '';
        
        // Facebook
        if (facebookUrl && facebookVisible !== 'false') {
            socialButtons += `<a href="${facebookUrl}" target="_blank" rel="noopener noreferrer" class="social-btn" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>`;
        }
        
        // LINE - Display LINE whenever the existing Contact module considers LINE available
        const hasLine = (lineUrl && lineVisible !== 'false') || (lineQrImage && lineQrVisible !== 'false') || (lineId && lineVisible !== 'false');
        if (hasLine) {
            let lineHref = '#';
            if (lineUrl) {
                lineHref = lineUrl;
            } else if (lineId) {
                lineHref = `https://line.me/R/ti/p/~${lineId.replace('@', '')}`;
            } else if (lineQrImage) {
                lineHref = lineQrImage;
            }
            socialButtons += `<a href="${lineHref}" target="_blank" rel="noopener noreferrer" class="social-btn" aria-label="Line"><i class="fab fa-line"></i></a>`;
        }
        
        // Instagram
        if (instagramUrl && instagramVisible === 'true') {
            socialButtons += `<a href="${instagramUrl}" target="_blank" rel="noopener noreferrer" class="social-btn" aria-label="Instagram" style="background:#db2777; color:white;"><i class="fab fa-instagram"></i></a>`;
        }
        
        // TikTok
        if (tiktokUrl && tiktokVisible === 'true') {
            socialButtons += `<a href="${tiktokUrl}" target="_blank" rel="noopener noreferrer" class="social-btn" aria-label="TikTok" style="background:#000; color:white;"><i class="fab fa-tiktok"></i></a>`;
        }
        
        // YouTube
        if (youtubeUrl && youtubeVisible === 'true') {
            socialButtons += `<a href="${youtubeUrl}" target="_blank" rel="noopener noreferrer" class="social-btn" aria-label="YouTube" style="background:#e53e3e; color:white;"><i class="fab fa-youtube"></i></a>`;
        }
        
        // Email
        if (email) {
            socialButtons += `<a href="mailto:${email}" class="social-btn" aria-label="Email"><i class="fas fa-envelope"></i></a>`;
        }
        
        footerSocials.innerHTML = socialButtons;
    }

    closeMobileMenu() {
        const nav = document.getElementById('navbar-menu-container');
        const trigger = document.getElementById('mobile-menu-trigger');
        if (nav && nav.classList.contains('active')) {
            nav.classList.remove('active');
            document.body.classList.remove('no-scroll');
            if (trigger) {
                trigger.innerHTML = `<i class="fas fa-bars"></i>`;
                trigger.setAttribute('aria-expanded', 'false');
            }
        }
    }

    openMobileMenu() {
        const nav = document.getElementById('navbar-menu-container');
        const trigger = document.getElementById('mobile-menu-trigger');
        if (nav && !nav.classList.contains('active')) {
            nav.classList.add('active');
            document.body.classList.add('no-scroll');
            if (trigger) {
                trigger.innerHTML = `<i class="fas fa-times"></i>`;
                trigger.setAttribute('aria-expanded', 'true');
            }
        }
    }

    bindGlobalEvents() {
        const trigger = document.getElementById('mobile-menu-trigger');
        const nav = document.getElementById('navbar-menu-container');
        
        if (trigger && nav) {
            trigger.setAttribute('aria-expanded', 'false');
            trigger.onclick = (e) => {
                e.stopPropagation();
                if (nav.classList.contains('active')) {
                    this.closeMobileMenu();
                } else {
                    this.openMobileMenu();
                }
            };
        }

        // Tap outside drawer to close
        document.addEventListener('click', (e) => {
            if (nav && nav.classList.contains('active')) {
                if (!nav.contains(e.target) && !trigger.contains(e.target)) {
                    this.closeMobileMenu();
                }
            }
        });

        // Close after selecting a link inside the drawer
        if (nav) {
            nav.addEventListener('click', (e) => {
                if (e.target.tagName === 'A' || e.target.closest('a')) {
                    this.closeMobileMenu();
                }
            });
        }

        window.openLineQrModal = (imgSrc) => {
            let modal = document.getElementById('line-qr-modal-overlay');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'line-qr-modal-overlay';
                modal.className = 'line-qr-modal';
                modal.innerHTML = `
                    <div class="line-qr-modal-content">
                        <button class="line-qr-modal-close" onclick="window.closeLineQrModal()">&times;</button>
                        <h4 style="margin-bottom:10px; color:var(--primary); font-weight:700;"><i class="fab fa-line" style="color:#10b981;"></i> LINE Official QR Code</h4>
                        <img src="" class="line-qr-modal-img" id="line-qr-modal-image">
                        <p style="font-size:0.9rem; color:var(--text-sec); margin:0;">${this.lang === 'th' ? 'สแกน QR Code เพื่อสอบถามทาง LINE' : 'Scan QR Code to contact us on LINE'}</p>
                    </div>
                `;
                document.body.appendChild(modal);
                modal.onclick = (e) => {
                    if (e.target === modal) window.closeLineQrModal();
                };
            }
            const modalImg = document.getElementById('line-qr-modal-image');
            if (modalImg) modalImg.src = imgSrc;
            modal.classList.add('active');
        };

        window.closeLineQrModal = () => {
            const modal = document.getElementById('line-qr-modal-overlay');
            if (modal) modal.classList.remove('active');
        };
    }

    updateMetaTag(attrName, attrVal, contentVal) {
        if (!attrName || !attrVal || contentVal == null) return;
        let el = document.querySelector(`meta[${attrName}="${attrVal}"]`);
        if (!el) {
            el = document.createElement('meta');
            el.setAttribute(attrName, attrVal);
            document.head.appendChild(el);
        }
        el.setAttribute('content', contentVal);
    }

    async handleRouting() {
        if (this.sliderInterval) {
            clearInterval(this.sliderInterval);
            this.sliderInterval = null;
        }
        if (this.sliderUnsubscribe) {
            this.sliderUnsubscribe();
            this.sliderUnsubscribe = null;
        }

        this.closeMobileMenu();

        window.scrollTo(0, 0);

        const hash = window.location.hash || '#/home';
        const routeParts = hash.slice(2).split('?');
        const path = routeParts[0];
        const queryStr = routeParts[1] || '';
        const params = new URLSearchParams(queryStr);

        const viewName = this.routes[path] || 'home';

        // Highlight navbar link
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.dataset.route === path) link.classList.add('active');
            else link.classList.remove('active');
        });

        // Set SEO
        const seoTitle = await this.db.get('settings', 'seo_title');
        const seoDesc = await this.db.get('settings', 'seo_desc');
        
        let title = seoTitle?.value || 'เจริญ ออน คัพ | สกรีนแก้วหาดใหญ่';
        let desc = seoDesc?.value || 'ผู้ผลิตและรับสกรีนแก้วพลาสติก แก้วกระดาษ หาดใหญ่';
        
        if (path && path !== 'home') {
            const pageTitle = this.t('nav_' + path.replace('-', '_')) || path;
            title = `${pageTitle} | ${title}`;
        }
        document.title = title;

        this.updateMetaTag('name', 'description', desc);

        // Dynamic Canonical URL Update
        let canonicalLink = document.querySelector('link[rel="canonical"]');
        if (!canonicalLink) {
            canonicalLink = document.createElement('link');
            canonicalLink.setAttribute('rel', 'canonical');
            document.head.appendChild(canonicalLink);
        }
        const origin = window.location.origin && window.location.origin !== 'null' && !window.location.origin.startsWith('file://')
            ? window.location.origin
            : 'https://charoen-website-website.web.app';
        const pageUrl = `${origin}/${hash}`;
        canonicalLink.setAttribute('href', pageUrl);

        // Dynamic Open Graph & Twitter Card Meta Updates
        const defaultSocialImage = `${origin}/about_banner.webp`;

        this.updateMetaTag('property', 'og:title', title);
        this.updateMetaTag('property', 'og:description', desc);
        this.updateMetaTag('property', 'og:url', pageUrl);
        this.updateMetaTag('property', 'og:image', defaultSocialImage);
        this.updateMetaTag('property', 'og:type', 'website');
        this.updateMetaTag('property', 'og:site_name', 'เจริญ ออน คัพ');
        this.updateMetaTag('property', 'og:locale', this.lang === 'th' ? 'th_TH' : 'en_US');

        this.updateMetaTag('name', 'twitter:card', 'summary_large_image');
        this.updateMetaTag('name', 'twitter:site', '@charoenoncup');
        this.updateMetaTag('name', 'twitter:title', title);
        this.updateMetaTag('name', 'twitter:description', desc);
        this.updateMetaTag('name', 'twitter:image', defaultSocialImage);

        const container = document.getElementById('app-main-content');
        if (!container) return;

        container.innerHTML = `
            <div style="display:flex; justify-content:center; align-items:center; min-height:400px; width:100%;">
                <div style="width: 40px; height: 40px; border: 3px solid var(--primary); border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            </div>
        `;

        switch (viewName) {
            case 'home':
                await this.renderHomeView(container);
                break;
            case 'about':
                await this.renderAboutView(container);
                break;
            case 'products':
                await this.renderProductsView(container, params);
                break;
            case 'portfolio':
                await this.renderPortfolioView(container, params);
                break;
            case 'quote':
                await this.renderQuoteView(container);
                break;
            case 'contact':
                await this.renderContactView(container);
                break;
            case 'faq':
                await this.renderFaqView(container);
                break;
            case 'news':
                await this.renderNewsView(container);
                break;
            case 'news-detail':
                await this.renderNewsDetailView(container, params);
                break;
            case 'articles':
                await this.renderArticlesView(container);
                break;
            case 'articles-detail':
                await this.renderArticlesDetailView(container, params);
                break;
            case 'search':
                await this.renderSearchView(container, params);
                break;
            case 'privacy-policy':
                await this.renderPrivacyView(container);
                break;
            case 'terms-conditions':
                await this.renderTermsView(container);
                break;
            default:
                container.innerHTML = `<div class="container text-center" style="padding:100px 0;"><h2>Page Not Found</h2><a href="#/home" class="btn btn-primary">Go Home</a></div>`;
        }
    }

        async renderHomeView(container) {
        // Load initial slides from IndexedDB cache first
        let localSlides = [];
        try {
            localSlides = await this.db.getAll('slider');
        } catch (e) {
            console.warn("Could not read local slides:", e);
        }
        let sortedSlides = [...localSlides].sort((a, b) => (a.order || 0) - (b.order || 0));
        
        const categories = await this.db.getAll('categories');
        const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

        const homeSections = await this.db.getAll('homepage');
        const sortedSections = [...homeSections].sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

        // Load about settings dynamically
        const aboutImgKey = await this.db.get('settings', 'about_image');
        let aboutImgVal = aboutImgKey?.value || '';
        if (aboutImgVal && !aboutImgVal.startsWith('data:') && !aboutImgVal.startsWith('http') && !aboutImgVal.includes('/')) {
            try {
                const mediaItem = await this.db.getAll('media').then(list => list.find(m => m.name === aboutImgVal || m.id === aboutImgVal));
                if (mediaItem) {
                    aboutImgVal = mediaItem.image_src;
                }
            } catch (e) {
                console.warn("Failed to lookup media item:", e);
            }
        }
        if (!aboutImgVal) {
            aboutImgVal = 'about_banner.webp'; // Presentation fallback only
        }

        const bulletsThKey = await this.db.get('settings', 'about_bullets_th');
        const bulletsEnKey = await this.db.get('settings', 'about_bullets_en');
        const bulletsText = this.lang === 'th' ? (bulletsThKey?.value || '') : (bulletsEnKey?.value || '');
        const bulletItems = bulletsText.split('\n').map(b => b.trim()).filter(Boolean);

        let html = '';

        // Dynamic logo image HTML
        const logoImg = await this.db.getLocalSetting('logo_img');
        const logoImgHtml = logoImg 
            ? `<img src="${logoImg}" style="width:100%; height:100%; object-fit:contain;">`
            : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" style="width:60%; height:60%; fill:var(--primary);"><path d="M80 20H20c-1.1 0-2 .9-2 2v6c0 1.1 0 2 .9 2h2v40c0 5.5 4.5 10 10 10h38c5.5 0 10-4.5 10-10V30h2c1.1 0 2-.9 2-2v-6c0-1.1-.9-2-2-2zM48 68H38v-8h10v8zm14-16H38v-8h24v8z"/></svg>`;

        for (const sec of sortedSections) {
            if (sec.visible === false || sec.visible === 'false') continue;

            // Safe parse of stringified content (e.g. from older records or Firestore normalization)
            if (sec && typeof sec.content === 'string') {
                try {
                    sec.content = JSON.parse(sec.content);
                } catch (e) {
                    console.warn("Failed to parse section content JSON string:", e);
                }
            }

            if (sec && sec.content && typeof sec.content === 'object') {
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

            switch (sec.type) {
                case 'hero_banner':
                    html += `
                        <!-- Image Only Hero Banner Slider -->
                        <section class="slider-section" id="hero-slider-section" style="position:relative; overflow:hidden; background:#0a192f; width:100%; display:${sortedSlides.length > 0 ? 'block' : 'none'};">
                            <div class="slider-slides-container" style="display:flex; width:${(sortedSlides.length || 1) * 100}%; height:100%; transition: transform 0.65s cubic-bezier(0.25, 0.8, 0.25, 1);">
                                ${sortedSlides.map(slide => `
                                    <div class="slider-single-slide" style="width:${100 / (sortedSlides.length || 1)}%; height:100%; background-image:url('${slide.bg_src || 'coffee_bg.webp'}'); position:relative;">
                                    </div>
                                `).join('')}
                            </div>
                            <button class="slider-arrow prev-arrow" onclick="window.charoenApp.changeSlide(-1)" style="position:absolute; top:50%; left:20px; transform:translateY(-50%); width:48px; height:48px; border-radius:50%; border:none; background:rgba(255,255,255,0.18); color:white; font-size:1.15rem; cursor:pointer; z-index:10; backdrop-filter:blur(4px); display:flex; justify-content:center; align-items:center;"><i class="fas fa-chevron-left"></i></button>
                            <button class="slider-arrow next-arrow" onclick="window.charoenApp.changeSlide(1)" style="position:absolute; top:50%; right:20px; transform:translateY(-50%); width:48px; height:48px; border-radius:50%; border:none; background:rgba(255,255,255,0.18); color:white; font-size:1.15rem; cursor:pointer; z-index:10; backdrop-filter:blur(4px); display:flex; justify-content:center; align-items:center;"><i class="fas fa-chevron-right"></i></button>
                            <div class="slider-dots" style="position:absolute; bottom:20px; left:50%; transform:translateX(-50%); display:flex; gap:10px; z-index:10;">
                                ${sortedSlides.map((_, idx) => `
                                    <span class="slider-dot" onclick="window.charoenApp.goToSlide(${idx})" style="width:12px; height:12px; border-radius:50%; background:rgba(255,255,255,0.45); cursor:pointer; transition:var(--transition);"></span>
                                `).join('')}
                            </div>
                        </section>
                    `;
                    break;

                case 'about_company':
                    html += `
                        <!-- Upgraded Premium Two-Column About Us Section -->
                        <section class="homepage-about-section section-padding" style="background-color: var(--bg-main); border-bottom: 1px solid var(--border-color); overflow: hidden;">
                            <div class="container">
                                <div class="grid-2" style="align-items: center; gap: 40px;">
                                    <div class="homepage-about-image-column" style="width: 100%;">
                                        <div class="homepage-about-image-wrapper" style="position: relative; border-radius: var(--radius-md); overflow: hidden; box-shadow: var(--shadow-md); aspect-ratio: 16/11; background-color: var(--bg-sec); display: flex; align-items: center; justify-content: center;">
                                            <img src="${aboutImgVal}" alt="Charoen On Cup About" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null; this.src='about_banner.webp';">
                                            <div class="homepage-about-image-badge" style="position: absolute; bottom: 16px; left: 16px; background-color: var(--primary); color: white; padding: 8px 16px; border-radius: var(--radius-sm); font-weight: 700; font-size: 0.8rem; box-shadow: var(--shadow-sm); display: flex; align-items: center; gap: 8px; z-index: 2;">
                                                <i class="fas fa-certificate" style="color: var(--accent);"></i>
                                                <span>${this.lang === 'th' ? 'แก้วพร้อมสกรีน ครบวงจร' : 'One-Stop Cup Printing'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="homepage-about-text-column" style="width: 100%; text-align: left;">
                                        <span class="section-eyebrow" style="font-weight: 700; color: var(--accent); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px;">
                                            ${this.lang === 'th' ? 'ข้อมูลแนะนำบริษัท' : 'About Company'}
                                        </span>
                                        <h2 style="font-size: 1.95rem; font-weight: 800; color: var(--secondary); margin-bottom: 16px; line-height: 1.35; font-family: 'Inter', 'Kanit', sans-serif;">
                                            ${this.lang === 'th' ? sec.content.title_th : sec.content.title_en}
                                        </h2>
                                        <p class="section-description" style="font-size: 0.98rem; line-height: 1.75; color: var(--text-main); margin-bottom: 20px;">
                                            ${this.lang === 'th' ? sec.content.desc_th : sec.content.desc_en}
                                        </p>
                                        
                                        ${bulletItems.length > 0 ? `
                                            <!-- Dynamic Bullet Highlights from CMS -->
                                            <div class="about-summary-bullets" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 24px;">
                                                ${bulletItems.map(item => `
                                                    <div style="display: flex; align-items: center; gap: 8px; font-size: 0.88rem; color: var(--text-main); font-weight: 600;">
                                                        <i class="fas fa-check-circle" style="color: var(--accent); flex-shrink: 0;"></i>
                                                        <span class="body-text">${item}</span>
                                                    </div>
                                                `).join('')}
                                            </div>
                                        ` : ''}
                                        
                                        <a href="#/about" class="btn btn-primary" style="padding: 10px 24px; font-weight: 700; display: inline-flex; align-items: center; gap: 8px;">
                                            <span>${this.lang === 'th' ? 'รู้จักเราเพิ่มเติม' : 'Learn More'}</span>
                                            <i class="fas fa-arrow-right" style="font-size: 0.75rem;"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </section>
                    `;
                    break;

                case 'strengths':
                    let strengthItems = [];
                    let strengthsTitleTh = 'มาตรฐานการผลิตและจุดแข็งของแบรนด์เรา';
                    let strengthsTitleEn = 'Our Strengths & Production Standard';

                    if (sec.content) {
                        if (Array.isArray(sec.content)) {
                            strengthItems = sec.content;
                        } else if (typeof sec.content === 'object') {
                            strengthsTitleTh = sec.content.title_th || strengthsTitleTh;
                            strengthsTitleEn = sec.content.title_en || strengthsTitleEn;
                            if (Array.isArray(sec.content.items)) {
                                strengthItems = sec.content.items;
                            }
                        }
                    }

                    if (strengthItems.length === 0) break;

                    html += `
                        <!-- Company Strengths Section -->
                        <section class="section-padding" style="background-color: var(--bg-main); border-bottom: 1px solid var(--border-color);">
                            <div class="container text-center">
                                <h2 class="section-title">${this.lang === 'th' ? strengthsTitleTh : strengthsTitleEn}</h2>
                                <div class="grid-3" style="margin-top:45px;">
                                    ${strengthItems.map(item => `
                                        <div class="service-card" style="text-align:center; padding: 40px 24px;">
                                            <div class="service-icon-box" style="margin: 0 auto 20px auto; background-color:var(--bg-sec); color:var(--secondary);"><i class="fas ${item.icon || 'fa-award'}"></i></div>
                                            <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 15px; color: var(--primary);">${this.lang === 'th' ? (item.title_th || '') : (item.title_en || '')}</h3>
                                            <p style="font-size: 0.95rem; color: var(--text-sec); line-height: 1.6;">${this.lang === 'th' ? (item.desc_th || '') : (item.desc_en || '')}</p>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </section>
                    `;
                    break;

                case 'services':
                    html += `
                        <!-- Categories Grid Section (6 Cards matching WorldWide Coffee style) -->
                        <section class="home-category-section section-padding" style="background-color: var(--bg-sec); border-bottom: 1px solid var(--border-color);">
                            <div class="container text-center">
                                <h2 class="section-title">${this.lang === 'th' ? sec.content.title_th : sec.content.title_en}</h2>
                                <p class="section-subtitle">${this.lang === 'th' ? sec.content.subtitle_th : sec.content.subtitle_en}</p>
                                
                                <div class="home-category-grid">
                                    ${sortedCategories.slice(0, 6).map(cat => {
                                        let iconClass = 'fa-wine-glass';
                                        if (cat.id === 'cat-paper') iconClass = 'fa-mug-hot';
                                        if (cat.id === 'cat-film') iconClass = 'fa-tape';
                                        if (cat.id === 'cat-straw') iconClass = 'fa-cocktail';
                                        if (cat.id === 'cat-lid') iconClass = 'fa-circle-notch';
                                        if (cat.id === 'cat-bag') iconClass = 'fa-shopping-bag';
                                        
                                        const catImage = cat.bg_src || cat.image || cat.img;
                                        const catDesc = this.lang === 'th' 
                                            ? (cat.description_th || `บริการสกรีนโลโก้และพิมพ์ลายบน${cat.name_th} ลายเส้นสีคมชัด รวดเร็วทันใจ`)
                                            : (cat.description_en || `Custom printing & branding on ${cat.name_en} with sharp colors and fast delivery`);
                                            
                                        return `
                                            <div class="home-category-card" onclick="window.location.hash='#/products?category=${cat.id}'" tabindex="0">
                                                <div class="home-category-image-wrapper">
                                                    ${catImage ? `
                                                        <img class="home-category-image" src="${catImage}" alt="${this.lang === 'th' ? cat.name_th : cat.name_en}" loading="lazy">
                                                    ` : `
                                                        <div class="home-category-image-fallback">
                                                            <i class="fas ${iconClass}"></i>
                                                        </div>
                                                    `}
                                                </div>
                                                <div class="home-category-overlay"></div>
                                                <div class="home-category-content">
                                                    <h3 class="home-category-title">${this.lang === 'th' ? cat.name_th : cat.name_en}</h3>
                                                    <p class="home-category-description">${catDesc}</p>
                                                    <span class="home-category-link">
                                                        ${this.lang === 'th' ? 'ดูสินค้า' : 'View Products'} <i class="fas fa-arrow-right"></i>
                                                    </span>
                                                </div>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        </section>
                    `;
                    break;

                case 'why_us':
                    let whyItems = [];
                    let whyTitleTh = 'ทำไมร้านกาแฟชั้นนำถึงเลือกสกรีนกับเรา';
                    let whyTitleEn = 'Why Cafes Trust Us';

                    if (sec.content) {
                        if (Array.isArray(sec.content)) {
                            whyItems = sec.content;
                        } else if (typeof sec.content === 'object') {
                            whyTitleTh = sec.content.title_th || whyTitleTh;
                            whyTitleEn = sec.content.title_en || whyTitleEn;
                            if (Array.isArray(sec.content.items)) {
                                whyItems = sec.content.items;
                            }
                        }
                    }

                    if (whyItems.length === 0) break;

                    html += `
                        <!-- Why Choose Us Section -->
                        <section class="section-padding" style="background-color: var(--bg-main); border-bottom: 1px solid var(--border-color);">
                            <div class="container">
                                <div class="text-center" style="margin-bottom: 50px;">
                                    <h2 class="section-title">${this.lang === 'th' ? whyTitleTh : whyTitleEn}</h2>
                                </div>
                                <div class="grid-3">
                                    ${whyItems.map((item, idx) => `
                                        <div style="background:var(--bg-sec); padding: 35px 30px; border-radius:var(--radius-md); border:1px solid var(--border-color); position:relative; overflow:hidden;">
                                            <span style="position:absolute; right:15px; bottom:-10px; font-size:6.5rem; font-weight:900; color:rgba(0,0,0,0.03); line-height:1; user-select:none;">0${idx+1}</span>
                                            <h4 style="font-size:1.25rem; font-weight:700; color:var(--primary); margin-bottom:15px; position:relative; z-index:2;"><i class="fas fa-check-circle" style="color:var(--secondary); margin-right:8px;"></i> ${this.lang === 'th' ? (item.title_th || '') : (item.title_en || '')}</h4>
                                            <p style="font-size:0.95rem; color:var(--text-sec); line-height:1.65; position:relative; z-index:2;">${this.lang === 'th' ? (item.desc_th || '') : (item.desc_en || '')}</p>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </section>
                    `;
                    break;

                case 'steps':
                    let stepsList = [];
                    let stepsTitleTh = 'ขั้นตอนการสั่งผลิตง่ายๆ 4 ขั้นตอน';
                    let stepsTitleEn = '4 Simple Steps to Order';

                    if (sec.content) {
                        if (Array.isArray(sec.content)) {
                            stepsList = sec.content;
                        } else if (typeof sec.content === 'object') {
                            stepsTitleTh = sec.content.title_th || stepsTitleTh;
                            stepsTitleEn = sec.content.title_en || stepsTitleEn;
                            if (Array.isArray(sec.content.steps)) {
                                stepsList = sec.content.steps;
                            }
                        }
                    }

                    if (stepsList.length === 0) break;

                    html += `
                        <!-- Ordering Steps Section -->
                        <section class="section-padding" style="background-color: var(--bg-sec); border-bottom: 1px solid var(--border-color);">
                            <div class="container text-center">
                                <h2 class="section-title">${this.lang === 'th' ? stepsTitleTh : stepsTitleEn}</h2>
                                <p class="section-subtitle">${this.lang === 'th' ? 'ดูแลการสั่งสกรีนแก้วอย่างเป็นขั้นตอน สะดวกสบาย' : 'Easy step-by-step custom drinkware screen print process'}</p>
                                
                                <div class="grid-4" style="margin-top:40px;">
                                    ${stepsList.map((step, idx) => `
                                        <div class="step-card">
                                            <div class="step-num">${idx + 1}</div>
                                            <h4>${this.lang === 'th' ? (step.title_th || '') : (step.title_en || '')}</h4>
                                            <p>${this.lang === 'th' ? (step.desc_th || '') : (step.desc_en || '')}</p>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </section>
                    `;
                    break;

                case 'featured_portfolio':
                    const portfolios = await this.db.getAll('portfolio');
                    const categoriesForPort = await this.db.getAll('categories');
                    const featuredItems = portfolios
                        .filter(item => (item.visible !== false && item.visible !== 'false') && (item.featured === true || item.featured === 'true'))
                        .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
                        .slice(0, 3);
                    
                    if (featuredItems.length > 0) {
                        html += `
                            <!-- Featured Portfolio Section -->
                            <section class="section-padding" style="background-color: var(--bg-main); border-bottom: 1px solid var(--border-color);">
                                <div class="container text-center">
                                    <h2 class="section-title">${this.lang === 'th' ? sec.content.title_th : sec.content.title_en}</h2>
                                    <p class="section-subtitle">${this.lang === 'th' ? (sec.content.subtitle_th || 'ตัวอย่างลายสกรีนแก้วพลาสติกที่ผลิตจากเรา') : (sec.content.subtitle_en || 'Real printed cup gallery samples')}</p>
                                    
                                    <div class="grid-3" style="margin-top:45px; text-align:left;">
                                        ${featuredItems.map(item => {
                                            const catObj = categoriesForPort.find(c => c.id === item.category);
                                            const catName = catObj ? (this.lang === 'th' ? catObj.name_th : catObj.name_en) : (this.lang === 'th' ? 'สกรีนแก้ว' : 'Custom Cup');
                                            return `
                                                <div class="portfolio-card" onclick="window.charoenApp.openPortfolioDetails('${item.id}')" style="cursor:pointer;">
                                                    <div class="portfolio-img-box">
                                                        <img src="${item.image_src || 'coffee_bg.webp'}" alt="${item.title_th || 'Portfolio'}">
                                                    </div>
                                                    <div class="portfolio-info">
                                                        <span style="font-size:0.75rem; font-weight:700; color:var(--secondary); text-transform:uppercase;">${catName}</span>
                                                        <h3 style="font-size:1.15rem; font-weight:700; margin-top:5px; margin-bottom:5px; color:var(--primary);">${this.lang === 'th' ? item.title_th : item.title_en}</h3>
                                                        <div style="font-size:0.85rem; color:var(--text-sec);"><i class="fas fa-store"></i> ${item.client_name || 'ลูกค้าคาเฟ่'}</div>
                                                    </div>
                                                </div>
                                            `;
                                        }).join('')}
                                    </div>
                                    <div style="margin-top:40px;">
                                        <a href="#/portfolio" class="btn btn-primary"><i class="fas fa-images"></i> ดูผลงานทั้งหมด</a>
                                    </div>
                                </div>
                            </section>
                        `;
                    }
                    break;

                case 'clients':
                    const clientList = await this.db.getAll('clients');
                    const visibleClients = clientList.filter(c => c.visible);
                    if (visibleClients.length > 0) {
                        html += `
                            <!-- Client Logos Section -->
                            <section class="section-padding" style="background-color: var(--bg-sec); border-bottom: 1px solid var(--border-color); padding: 50px 0;">
                                <div class="container text-center">
                                    <h4 style="font-size:1.05rem; font-weight:700; color:var(--text-sec); text-transform:uppercase; margin-bottom:30px; letter-spacing:1px;">
                                        ${this.lang === 'th' ? sec.content.title_th : sec.content.title_en}
                                    </h4>
                                    <div style="display:flex; flex-wrap:wrap; justify-content:center; align-items:center; gap:40px; opacity:0.85;">
                                        ${visibleClients.map(c => `
                                            <a href="${c.link || '#'}" target="_blank" title="${c.name}" style="display:inline-block; height:60px; filter:grayscale(100%); transition:var(--transition); cursor:pointer;" onmouseover="this.style.filter='none'" onmouseout="this.style.filter='grayscale(100%)'">
                                                <img src="${c.logo_src || 'coffee_bg.webp'}" alt="${c.name}" style="height:100%; object-fit:contain;">
                                            </a>
                                        `).join('')}
                                    </div>
                                </div>
                            </section>
                        `;
                    }
                    break;

                case 'reviews':
                    let reviewsList = [];
                    let reviewsTitleTh = 'เสียงตอบรับจากเจ้าของร้านตัวจริง';
                    let reviewsTitleEn = 'Success Stories from Cafe Owners';

                    if (sec.content) {
                        if (Array.isArray(sec.content)) {
                            reviewsList = sec.content;
                        } else if (typeof sec.content === 'object') {
                            reviewsTitleTh = sec.content.title_th || reviewsTitleTh;
                            reviewsTitleEn = sec.content.title_en || reviewsTitleEn;
                            if (Array.isArray(sec.content.reviews)) {
                                reviewsList = sec.content.reviews;
                            }
                        }
                    }

                    if (reviewsList.length === 0) break;

                    html += `
                        <!-- Reviews Section -->
                        <section class="section-padding" style="background-color: var(--bg-main); border-bottom: 1px solid var(--border-color);">
                            <div class="container text-center">
                                <h2 class="section-title">${this.lang === 'th' ? reviewsTitleTh : reviewsTitleEn}</h2>
                                <p class="section-subtitle">${this.lang === 'th' ? 'ความไว้วางใจจากผู้ประกอบการร้านกาแฟคือรางวัลของเรา' : 'Trusted feedback from real business cafe owners'}</p>
                                
                                <div class="grid-3" style="margin-top:40px; text-align:left;">
                                    ${reviewsList.map(rev => `
                                        <div class="review-card">
                                            <div class="stars">
                                                ${'<i class="fas fa-star"></i>'.repeat(rev.rating || 5)}
                                            </div>
                                            <p class="review-text">"${this.lang === 'th' ? (rev.review_th || '') : (rev.review_en || '')}"</p>
                                            <div class="review-author">${rev.name || ''}</div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </section>
                    `;
                    break;

                case 'latest_news':
                    if (sec.visible === false || sec.visible === 'false') break;

                    const news = await this.db.getAll('news');
                    const visibleNews = news.filter(n => n.visible !== false && n.visible !== 'false');

                    if (visibleNews.length === 0) break;

                    // Sort: Featured first, then order ascending
                    visibleNews.sort((a, b) => {
                        const featA = a.featured ? 1 : 0;
                        const featB = b.featured ? 1 : 0;
                        if (featA !== featB) return featB - featA;
                        return Number(a.order || 0) - Number(b.order || 0);
                    });

                    // Limit homepage display to max 3 items
                    const homepageNews = visibleNews.slice(0, 3);

                    const secTitle = this.lang === 'th' ? (sec.content.title_th || sec.content.title_en || 'กิจกรรมและการสนับสนุน') : (sec.content.title_en || sec.content.title_th || 'Activities & Support');
                    let secDesc = this.lang === 'th' ? (sec.content.desc_th || sec.content.subtitle_th || '') : (sec.content.desc_en || sec.content.subtitle_en || '');
                    if (secDesc === 'null' || secDesc === 'undefined') secDesc = '';

                    const descHtml = secDesc ? `<p class="section-subtitle" style="margin-top:10px; font-size:1.05rem; color:var(--text-sec);">${secDesc}</p>` : '';

                    html += `
                        <!-- Activities & Support Section -->
                        <section class="section-padding" style="background-color: var(--bg-sec); border-bottom: 1px solid var(--border-color);">
                            <div class="container text-center">
                                <h2 class="section-title">${secTitle}</h2>
                                ${descHtml}
                                
                                ${homepageNews.length > 0 ? `
                                    <div class="grid-3" style="margin-top:45px; text-align:left;">
                                        ${homepageNews.map(n => {
                                            const title = this.lang === 'th' ? (n.title_th || n.title_en || '') : (n.title_en || n.title_th || '');
                                            const summary = this.lang === 'th' ? (n.summary_th || n.summary_en || '') : (n.summary_en || n.summary_th || '');
                                            const date = n.date || '';
                                            const location = this.lang === 'th' ? (n.location_th || n.location_en || '') : (n.location_en || n.location_th || '');
                                            const thumbnail = n.thumbnail || '';

                                            const imgHtml = thumbnail ? `
                                                <div class="portfolio-img-box" style="height:190px;">
                                                    <img src="${thumbnail}" alt="${title}" style="width:100%; height:100%; object-fit:cover;">
                                                </div>
                                            ` : '';

                                            const dateHtml = date ? `<span style="font-size:0.75rem; color:var(--text-sec); margin-right:12px;"><i class="far fa-calendar-alt"></i> ${date}</span>` : '';
                                            const locHtml = location ? `<span style="font-size:0.75rem; color:var(--text-sec);"><i class="fas fa-map-marker-alt"></i> ${location}</span>` : '';
                                            
                                            const metaHtml = (dateHtml || locHtml) ? `
                                                <div style="margin-bottom:8px; display:flex; flex-wrap:wrap; gap:10px;">
                                                    ${dateHtml}
                                                    ${locHtml}
                                                </div>
                                            ` : '';

                                            const summaryHtml = summary ? `<p style="font-size:0.88rem; color:var(--text-sec); line-height:1.5; margin-bottom:15px;">${summary}</p>` : '';

                                            return `
                                                <div class="portfolio-card" onclick="window.location.hash='#/news-detail?id=${n.id}'" style="cursor:pointer; background:var(--bg-main); border:1px solid var(--border-color); border-radius:var(--radius-md); overflow:hidden; display:flex; flex-direction:column;">
                                                    ${imgHtml}
                                                    <div class="portfolio-info" style="padding:20px; flex-grow:1; display:flex; flex-direction:column; justify-content:space-between;">
                                                        <div>
                                                            ${metaHtml}
                                                            <h3 style="font-size:1.15rem; font-weight:700; margin-top:8px; margin-bottom:12px; color:var(--primary); line-height:1.4;">${title}</h3>
                                                            ${summaryHtml}
                                                        </div>
                                                        <div style="margin-top:15px;">
                                                            <a href="#/news-detail?id=${n.id}" style="font-size:0.88rem; font-weight:700; color:var(--secondary); text-decoration:none;">
                                                                ${this.lang === 'th' ? 'อ่านเพิ่มเติม <i class="fas fa-arrow-right" style="font-size:0.75rem; margin-left:4px;"></i>' : 'Read More <i class="fas fa-arrow-right" style="font-size:0.75rem; margin-left:4px;"></i>'}
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            `;
                                        }).join('')}
                                    </div>
                                    
                                    <div style="margin-top:45px; display:flex; justify-content:center; gap:20px;">
                                        <a href="#/news" class="btn btn-outline" style="border-color:var(--primary); color:var(--primary);"><i class="far fa-calendar-alt"></i> ดูข้อมูลกิจกรรมทั้งหมด</a>
                                    </div>
                                ` : ''}
                            </div>
                        </section>
                    `;
                    break;

                case 'contact_info': {
                    const contactVisible = await this.getSetting('contact_visible', 'true');
                    if (contactVisible === 'false') break;

                    const phoneVal = await this.getSetting('phone');
                    const emailVal = await this.getSetting('email');
                    const addressVal = await this.getSetting(this.lang === 'th' ? 'address_th' : 'address_en') || await this.getSetting('address_th');
                    const hoursVal = await this.getSetting(this.lang === 'th' ? 'business_hours_th' : 'business_hours_en') || await this.getSetting('business_hours_th');
                    
                    const contactTitleVal = await this.getSetting(this.lang === 'th' ? 'contact_title_th' : 'contact_title_en') || await this.getSetting('contact_title_th') || (this.lang === 'th' ? 'สอบถามข้อมูลสกรีนแก้วและประเมินราคารวดเร็ว' : 'Get an Instant Printing Quote');
                    const contactDescVal = await this.getSetting(this.lang === 'th' ? 'contact_description_th' : 'contact_description_en') || await this.getSetting('contact_description_th');

                    const mapsUrlVal = await this.getSetting('google_maps_url');
                    const lineUrlVal = await this.getSetting('line_url');
                    const facebookUrlVal = await this.getSetting('facebook_url');
                    const facebookVisibleVal = await this.getSetting('facebook_visible', 'true');
                    const lineVisibleVal = await this.getSetting('line_visible', 'true');

                    let detailsHtml = '';
                    if (phoneVal) {
                        const cleanPhone = phoneVal.replace(/[^0-9+]/g, '');
                        detailsHtml += `
                            <p style="font-size:0.95rem; margin-bottom:12px; color:var(--text-sec); display:flex; align-items:center; gap:8px;">
                                <i class="fas fa-phone-alt" style="color:var(--primary);"></i> 
                                <strong>${this.lang === 'th' ? 'โทรศัพท์:' : 'Phone:'}</strong> 
                                <a href="tel:${cleanPhone}" style="color:var(--secondary); font-weight:700; text-decoration:none;">${phoneVal}</a>
                            </p>
                        `;
                    }
                    if (emailVal) {
                        detailsHtml += `
                            <p style="font-size:0.95rem; margin-bottom:12px; color:var(--text-sec); display:flex; align-items:center; gap:8px;">
                                <i class="fas fa-envelope" style="color:var(--primary);"></i> 
                                <strong>Email:</strong> 
                                <a href="mailto:${emailVal}" style="color:var(--secondary); font-weight:700; text-decoration:none;">${emailVal}</a>
                            </p>
                        `;
                    }
                    if (addressVal) {
                        detailsHtml += `
                            <p style="font-size:0.95rem; margin-bottom:12px; color:var(--text-sec); display:flex; align-items:center; gap:8px;">
                                <i class="fas fa-map-marker-alt" style="color:var(--primary);"></i> 
                                <strong>${this.lang === 'th' ? 'ที่อยู่:' : 'Address:'}</strong> 
                                ${addressVal}
                            </p>
                        `;
                    }
                    if (hoursVal) {
                        detailsHtml += `
                            <p style="font-size:0.95rem; margin-bottom:12px; color:var(--text-sec); display:flex; align-items:center; gap:8px;">
                                <i class="far fa-clock" style="color:var(--primary);"></i> 
                                <strong>${this.lang === 'th' ? 'เวลาทำการ:' : 'Hours:'}</strong> 
                                ${hoursVal}
                            </p>
                        `;
                    }

                    let socialsHtml = '';
                    if (lineUrlVal && lineVisibleVal !== 'false') {
                        socialsHtml += `
                            <a href="${lineUrlVal}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="border-color:#10b981; color:#10b981; padding:6px 12px; font-size:0.8rem; font-weight:700; display:inline-flex; align-items:center; gap:6px; text-decoration:none; border-radius:var(--radius-sm);">
                                <i class="fab fa-line"></i> เพิ่มเพื่อนทาง LINE
                            </a>
                        `;
                    }
                    if (facebookUrlVal && facebookVisibleVal !== 'false') {
                        socialsHtml += `
                            <a href="${facebookUrlVal}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="border-color:var(--secondary); color:var(--secondary); padding:6px 12px; font-size:0.8rem; font-weight:700; display:inline-flex; align-items:center; gap:6px; text-decoration:none; border-radius:var(--radius-sm);">
                                <i class="fab fa-facebook-f"></i> Facebook
                            </a>
                        `;
                    }
                    if (mapsUrlVal) {
                        socialsHtml += `
                            <a href="${mapsUrlVal}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="border-color:var(--primary); color:var(--primary); padding:6px 12px; font-size:0.8rem; font-weight:700; display:inline-flex; align-items:center; gap:6px; text-decoration:none; border-radius:var(--radius-sm);">
                                <i class="fas fa-location-arrow"></i> Google Maps
                            </a>
                        `;
                    }

                    const descHtml = contactDescVal ? `<p style="line-height:1.75; color:var(--text-sec); margin-bottom:20px;">${contactDescVal}</p>` : '';

                    html += `
                        <!-- Quick Contact Information & Inquiry Section on Homepage -->
                        <section class="section-padding" style="background-color: var(--bg-main);">
                            <div class="container">
                                <div class="grid-2" style="align-items: center; gap: 50px;">
                                    <div>
                                        <span style="font-weight:700; color:var(--secondary); text-transform:uppercase; font-size:0.85rem; letter-spacing:1px;"><i class="fas fa-paper-plane"></i> QUICK INQUIRY FORM</span>
                                        <h2 style="font-size:2.2rem; font-weight:800; color:var(--primary); margin-top:10px; margin-bottom:20px;">
                                            ${contactTitleVal}
                                        </h2>
                                        ${descHtml}
                                        <div style="margin-bottom:25px; display:flex; flex-direction:column; gap:8px;">
                                            ${detailsHtml}
                                        </div>
                                        <div style="display:flex; flex-wrap:wrap; gap:12px; margin-bottom:30px;">
                                            ${socialsHtml}
                                        </div>
                                        <a href="#/quote" class="btn btn-primary"><i class="fas fa-file-invoice-dollar"></i> ขอใบเสนอราคาอย่างละเอียด</a>
                                    </div>
                                    
                                    <div style="background:var(--bg-sec); padding:35px; border-radius:var(--radius-md); border:1px solid var(--border-color); box-shadow:var(--shadow-sm);">
                                        <form id="home-quick-contact-form" onsubmit="window.charoenApp.handleQuickInquiry(event)">
                                            <div style="margin-bottom:20px;">
                                                <label style="display:block; font-weight:700; font-size:0.88rem; margin-bottom:8px; color:var(--primary);">ชื่อของท่านหรือชื่อร้าน</label>
                                                <input type="text" id="quick-name" required class="form-control" placeholder="เช่น ร้านกาแฟ คาเฟ่ Hatyai">
                                            </div>
                                            <div style="margin-bottom:20px;">
                                                <label style="display:block; font-weight:700; font-size:0.88rem; margin-bottom:8px; color:var(--primary);">เบอร์โทรศัพท์ติดต่อ</label>
                                                <input type="tel" id="quick-phone" required class="form-control" placeholder="เช่น 09x-xxxxxxx">
                                            </div>
                                            <div style="margin-bottom:20px;">
                                                <label style="display:block; font-weight:700; font-size:0.88rem; margin-bottom:8px; color:var(--primary);">LINE ID หรือช่องทางติดต่ออื่นๆ</label>
                                                <input type="text" id="quick-line" class="form-control" placeholder="เช่น @mycafe (สะดวกในการตรวจแบบ 3D)">
                                            </div>
                                            <button type="submit" class="btn btn-primary" style="width:100%; justify-content:center;"><i class="fas fa-paper-plane"></i> ส่งช่องทางการติดต่อด่วน</button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </section>
                    `;
                    break;
                }
            }
        }

        container.innerHTML = html;

        // Initialize slider logic for home image-only slider immediately using cached slides
        if (sortedSlides.length > 0 && document.getElementById('hero-slider-section')) {
            this.initSlider('#hero-slider-section', sortedSlides.length);
        }

        // Setup real-time listener to Firestore 'hero_slides' collection
        if (this.db.isCloudEnabled && typeof firebase !== 'undefined') {
            try {
                if (this.sliderUnsubscribe) {
                    this.sliderUnsubscribe();
                    this.sliderUnsubscribe = null;
                }

                const collectionRef = this.db.fs.collection('hero_slides');
                this.sliderUnsubscribe = collectionRef.onSnapshot((snapshot) => {
                    const cloudSlides = [];
                    snapshot.forEach(doc => {
                        cloudSlides.push(doc.data());
                    });

                    // Display only: published = true, visible = true. Sort by display_order ascending.
                    const filteredSlides = cloudSlides
                        .filter(s => (s.published === true || s.published === 'true') && (s.visible === true || s.visible === 'true'))
                        .sort((a, b) => {
                            const orderA = a.display_order !== undefined ? Number(a.display_order) : Number(a.order || 0);
                            const orderB = b.display_order !== undefined ? Number(b.display_order) : Number(b.order || 0);
                            return orderA - orderB;
                        });

                    const sliderSection = document.getElementById('hero-slider-section');
                    if (sliderSection) {
                        if (filteredSlides.length > 0) {
                            sliderSection.style.display = 'block';
                            const slidesContainer = sliderSection.querySelector('.slider-slides-container');
                            if (slidesContainer) {
                                slidesContainer.style.width = `${filteredSlides.length * 100}%`;
                                slidesContainer.innerHTML = filteredSlides.map(slide => `
                                    <div class="slider-single-slide" style="width:${100 / filteredSlides.length}%; height:100%; background-size:cover; background-position:center; background-image:url('${slide.bg_src || 'coffee_bg.webp'}'); position:relative;">
                                    </div>
                                `).join('');
                            }
                            
                            const dotsContainer = sliderSection.querySelector('.slider-dots');
                            if (dotsContainer) {
                                dotsContainer.innerHTML = filteredSlides.map((_, idx) => `
                                    <span class="slider-dot" onclick="window.charoenApp.goToSlide(${idx})" style="width:12px; height:12px; border-radius:50%; background:rgba(255,255,255,0.45); cursor:pointer; transition:var(--transition);"></span>
                                `).join('');
                            }

                            this.initSlider('#hero-slider-section', filteredSlides.length);
                        } else {
                            sliderSection.style.display = 'none';
                            if (this.sliderInterval) {
                                clearInterval(this.sliderInterval);
                                this.sliderInterval = null;
                            }
                        }
                    }

                    // Update local IndexedDB cache with successfully retrieved cloud slides
                    if (this.db.db) {
                        try {
                            const transaction = this.db.db.transaction('slider', 'readwrite');
                            const store = transaction.objectStore('slider');
                            store.clear();
                            for (const item of filteredSlides) {
                                store.put(item);
                            }
                        } catch (dbErr) {
                            console.warn("Failed to cache slides in IndexedDB:", dbErr);
                        }
                    }
                }, (error) => {
                    console.warn("Firestore hero_slides listener failed:", error);
                });
            } catch (err) {
                console.warn("Failed to attach Firestore hero_slides listener:", err);
            }
        }
    }

    async handleQuickInquiry(event) {
        event.preventDefault();
        const name = document.getElementById('quick-name').value;
        const phone = document.getElementById('quick-phone').value;
        const line = document.getElementById('quick-line').value;
        
        const quoteObj = {
            id: 'quote_' + Date.now(),
            name: name,
            phone: phone,
            line: line,
            product_type: 'Quick Inquiry (สอบถามด่วนหน้าแรก)',
            qty: 'N/A',
            details: 'ลูกค้าสนใจบริการสกรีนแก้ว ต้องการให้ติดต่อกลับด่วนเพื่อขอข้อมูลสเปกเพิ่มเติม',
            image_src: '',
            date: new Date().toLocaleString()
        };
        
        await this.db.put('quotes', quoteObj);
        
        alert(this.lang === 'th' 
            ? 'ส่งข้อมูลสำเร็จ! เจ้าหน้าที่ เจริญ ออน คัพ จะติดต่อกลับหาท่านโดยเร็วที่สุดครับ ขอบคุณครับ'
            : 'Sent successfully! Our team will contact you back as soon as possible. Thank you.');
            
        document.getElementById('home-quick-contact-form').reset();
    }

    async renderNewsView(container) {
        const news = await this.db.getAll('news');
        const visibleNews = news.filter(n => n.visible !== false && n.visible !== 'false');
        visibleNews.sort((a, b) => {
            const featA = a.featured ? 1 : 0;
            const featB = b.featured ? 1 : 0;
            if (featA !== featB) return featB - featA;
            const orderA = Number(a.order || 0);
            const orderB = Number(b.order || 0);
            if (orderA !== orderB) return orderA - orderB;
            return new Date(b.date || 0) - new Date(a.date || 0);
        });
        
        let html = `
            <div class="breadcrumb-container" style="background: var(--bg-sec); padding: 15px 0; border-bottom: 1px solid var(--border-color);">
                <div class="container">
                    <span style="font-size: 0.9rem; color: var(--text-sec);">
                        <a href="#/home" style="color: var(--primary); text-decoration: none;"><i class="fas fa-home"></i> ${this.lang === 'th' ? 'หน้าแรก' : 'Home'}</a> 
                        <i class="fas fa-chevron-right" style="font-size: 0.75rem; margin: 0 8px;"></i> 
                        ${this.lang === 'th' ? 'กิจกรรมและการสนับสนุน' : 'Activities & Support'}
                    </span>
                </div>
            </div>
            <section class="section-padding">
                <div class="container">
                    <div class="text-center" style="margin-bottom: 50px;">
                        <h1 class="section-title" style="font-size: 2.3rem; margin-bottom:15px;">${this.lang === 'th' ? 'กิจกรรมและการสนับสนุน' : 'Activities & Support'}</h1>
                        <p class="section-subtitle">${this.lang === 'th' ? 'ติดตามการสนับสนุนชุมชน ข่าวสารกิจกรรม และความเคลื่อนไหวจาก เจริญ ออน คัพ' : 'Follow our community support, news, and activity updates from Charoen On Cup'}</p>
                    </div>
        `;
        
        if (visibleNews.length === 0) {
            html += `
                <div class="text-center" style="padding: 60px 0; background: var(--bg-sec); border-radius: var(--radius-md);">
                    <i class="far fa-calendar-alt" style="font-size: 3.5rem; color: var(--text-sec); margin-bottom: 20px;"></i>
                    <p style="color: var(--text-sec);">${this.lang === 'th' ? 'ขณะนี้ยังไม่มีกิจกรรมประกาศในระบบ' : 'No activities available at the moment.'}</p>
                </div>
            `;
        } else {
            html += `
                <div class="grid-3">
                    ${visibleNews.map(n => {
                        const title = this.lang === 'th' ? (n.title_th || n.title_en || '') : (n.title_en || n.title_th || '');
                        const summary = this.lang === 'th' ? (n.summary_th || n.summary_en || '') : (n.summary_en || n.summary_th || '');
                        const date = n.date || '';
                        const location = this.lang === 'th' ? (n.location_th || n.location_en || '') : (n.location_en || n.location_th || '');
                        const thumbnail = n.thumbnail || '';

                        const imgHtml = thumbnail ? `
                            <div class="portfolio-img-box" style="height:200px;">
                                <img src="${thumbnail}" alt="${title}" style="width:100%; height:100%; object-fit:cover;">
                            </div>
                        ` : '';

                        const dateHtml = date ? `<span style="font-size:0.78rem; color:var(--text-sec); margin-right:12px;"><i class="far fa-calendar-alt"></i> ${date}</span>` : '';
                        const locHtml = location ? `<span style="font-size:0.78rem; color:var(--text-sec);"><i class="fas fa-map-marker-alt"></i> ${location}</span>` : '';
                        
                        const metaHtml = (dateHtml || locHtml) ? `
                            <div style="margin-bottom:8px; display:flex; flex-wrap:wrap; gap:10px;">
                                ${dateHtml}
                                ${locHtml}
                            </div>
                        ` : '';

                        const summaryHtml = summary ? `<p style="font-size:0.88rem; color:var(--text-sec); line-height:1.5; margin-bottom:15px;">${summary}</p>` : '';

                        return `
                            <div class="portfolio-card" onclick="window.location.hash='#/news-detail?id=${n.id}'" style="cursor:pointer; background:var(--bg-main); border:1px solid var(--border-color); display:flex; flex-direction:column;">
                                ${imgHtml}
                                <div class="portfolio-info" style="padding:20px; flex-grow:1; display:flex; flex-direction:column; justify-content:space-between;">
                                    <div>
                                        ${metaHtml}
                                        <h3 style="font-size:1.15rem; font-weight:700; margin-top:8px; margin-bottom:12px; color:var(--primary); line-height:1.4;">
                                            ${title}
                                        </h3>
                                        ${summaryHtml}
                                    </div>
                                    <div style="margin-top:15px;">
                                        <a href="#/news-detail?id=${n.id}" style="font-size:0.88rem; font-weight:700; color:var(--secondary); text-decoration:none;">
                                            ${this.lang === 'th' ? 'อ่านรายละเอียด <i class="fas fa-arrow-right" style="font-size:0.75rem; margin-left:4px;"></i>' : 'Read Full Story <i class="fas fa-arrow-right" style="font-size:0.75rem; margin-left:4px;"></i>'}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }
        
        html += `
                </div>
            </section>
        `;
        
        container.innerHTML = html;
    }

    async renderNewsDetailView(container, params) {
        const id = params.get('id');
        const newsItem = await this.db.get('news', id);
        
        if (!newsItem) {
            container.innerHTML = `<div class="container text-center" style="padding:100px 0;"><h2>${this.lang === 'th' ? 'ไม่พบข้อมูลกิจกรรมที่ท่านค้นหา' : 'Activity Not Found'}</h2><a href="#/news" class="btn btn-primary">Back to Activities</a></div>`;
            return;
        }

        const title = this.lang === 'th' ? (newsItem.title_th || newsItem.title_en || '') : (newsItem.title_en || newsItem.title_th || '');
        const content = this.lang === 'th' ? (newsItem.content_th || newsItem.content_en || '') : (newsItem.content_en || newsItem.content_th || '');
        const date = newsItem.date || '';
        const location = this.lang === 'th' ? (newsItem.location_th || newsItem.location_en || '') : (newsItem.location_en || newsItem.location_th || '');
        const thumbnail = newsItem.thumbnail || '';
        
        let galleryList = [];
        if (Array.isArray(newsItem.gallery_images)) {
            galleryList = newsItem.gallery_images;
        } else if (typeof newsItem.gallery_images === 'string') {
            try {
                galleryList = JSON.parse(newsItem.gallery_images);
            } catch (e) {
                galleryList = [];
            }
        }

        const dateHtml = date ? `<span style="font-size: 0.95rem; font-weight:700; color: var(--secondary); text-transform: uppercase; margin-right:20px;"><i class="far fa-calendar-alt"></i> ${date}</span>` : '';
        const locHtml = location ? `<span style="font-size: 0.95rem; font-weight:700; color: var(--text-sec); text-transform: uppercase;"><i class="fas fa-map-marker-alt"></i> ${location}</span>` : '';
        
        const metaHtml = (dateHtml || locHtml) ? `
            <div style="margin-bottom:15px;">
                ${dateHtml}
                ${locHtml}
            </div>
        ` : '';

        const coverHtml = thumbnail ? `
            <div style="width: 100%; border-radius: var(--radius-md); overflow: hidden; margin-bottom: 40px; box-shadow: var(--shadow-sm);">
                <img src="${thumbnail}" alt="${title}" style="width: 100%; height: auto; display: block; object-fit: cover;">
            </div>
        ` : '';

        const contentHtml = content ? `
            <div class="detail-description" style="font-size: 1.1rem; line-height: 1.95; color: var(--text-main); white-space: pre-line; margin-bottom:40px;">
                ${content}
            </div>
        ` : '';

        const galleryHtml = (galleryList && galleryList.length > 0) ? `
            <div style="margin-top:40px; margin-bottom:40px;">
                <h3 style="font-size:1.35rem; font-weight:800; color:var(--primary); margin-bottom:20px;"><i class="fas fa-images"></i> ${this.lang === 'th' ? 'รูปภาพประกอบกิจกรรม' : 'Gallery Images'}</h3>
                <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:12px;">
                    ${galleryList.map(img => `
                        <div style="width:100%; aspect-ratio:4/3; border-radius:var(--radius-sm); border:1px solid var(--border-color); overflow:hidden; background:var(--bg-sec);">
                            <img src="${img}" style="width:100%; height:100%; object-fit:cover; cursor:pointer;" onclick="window.open('${img}', '_blank')">
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : '';
        
        let html = `
            <div class="breadcrumb-container" style="background: var(--bg-sec); padding: 15px 0; border-bottom: 1px solid var(--border-color);">
                <div class="container">
                    <span style="font-size: 0.9rem; color: var(--text-sec);">
                        <a href="#/home" style="color: var(--primary); text-decoration: none;"><i class="fas fa-home"></i> ${this.lang === 'th' ? 'หน้าแรก' : 'Home'}</a> 
                        <i class="fas fa-chevron-right" style="font-size: 0.75rem; margin: 0 8px;"></i> 
                        <a href="#/news" style="color: var(--primary); text-decoration: none;">${this.lang === 'th' ? 'กิจกรรมและการสนับสนุน' : 'Activities & Support'}</a> 
                        <i class="fas fa-chevron-right" style="font-size: 0.75rem; margin: 0 8px;"></i> 
                        ${title}
                    </span>
                </div>
            </div>
            <section class="section-padding">
                <div class="container" style="max-width: 900px;">
                    <div style="margin-bottom:30px;">
                        ${metaHtml}
                        <h1 style="font-size: 2.4rem; font-weight: 800; color: var(--primary); margin-top: 10px; margin-bottom: 20px; line-height: 1.3;">
                            ${title}
                        </h1>
                    </div>
                    
                    ${coverHtml}
                    ${contentHtml}
                    ${galleryHtml}
                    
                    <div style="margin-top: 50px; border-top: 1px solid var(--border-color); padding-top: 30px; display: flex; justify-content: space-between; align-items:center;">
                        <a href="#/news" class="btn btn-outline" style="border-color:var(--primary); color:var(--primary);"><i class="fas fa-chevron-left"></i> ย้อนกลับ</a>
                        <button class="btn btn-primary" onclick="window.location.hash='#/contact'"><i class="fas fa-file-invoice-dollar"></i> ติดต่อขอใบเสนอราคา</button>
                    </div>
                </div>
            </section>
        `;
        
        container.innerHTML = html;
    }

    async renderArticlesView(container) {
        const articles = await this.db.getAll('articles');
        const visibleArticles = articles.filter(a => a.visible).sort((a, b) => new Date(b.date) - new Date(a.date));
        
        let html = `
            <div class="breadcrumb-container" style="background: var(--bg-sec); padding: 15px 0; border-bottom: 1px solid var(--border-color);">
                <div class="container">
                    <span style="font-size: 0.9rem; color: var(--text-sec);">
                        <a href="#/home" style="color: var(--primary); text-decoration: none;"><i class="fas fa-home"></i> ${this.lang === 'th' ? 'หน้าแรก' : 'Home'}</a> 
                        <i class="fas fa-chevron-right" style="font-size: 0.75rem; margin: 0 8px;"></i> 
                        ${this.lang === 'th' ? 'บทความความรู้' : 'Articles & Guides'}
                    </span>
                </div>
            </div>
            <section class="section-padding">
                <div class="container">
                    <div class="text-center" style="margin-bottom: 50px;">
                        <h1 class="section-title" style="font-size: 2.3rem; margin-bottom:15px;">${this.lang === 'th' ? 'บทความและความรู้เรื่องแก้วสกรีน' : 'Drinks & Packaging Knowledge'}</h1>
                        <p class="section-subtitle">${this.lang === 'th' ? 'รวบรวมเคล็ดลับการเลือกประเภทแก้วพลาสติก แก้วกระดาษ และการออกแบบโลโก้สำหรับร้านกาแฟ' : 'Guides to choosing plastic/paper cup sizes, printing systems and branding cafe cups'}</p>
                    </div>
        `;
        
        if (visibleArticles.length === 0) {
            html += `
                <div class="text-center" style="padding: 60px 0; background: var(--bg-sec); border-radius: var(--radius-md);">
                    <i class="fas fa-graduation-cap" style="font-size: 3.5rem; color: var(--text-sec); margin-bottom: 20px;"></i>
                    <p style="color: var(--text-sec);">${this.lang === 'th' ? 'ขณะนี้ยังไม่มีบทความเผยแพร่ในระบบ' : 'No articles available at the moment.'}</p>
                </div>
            `;
        } else {
            html += `
                <div class="grid-2" style="gap:40px;">
                    ${visibleArticles.map(a => `
                        <div class="portfolio-card" onclick="window.location.hash='#/articles-detail?id=${a.id}'" style="cursor:pointer; display:flex; flex-direction:row; background:var(--bg-main); border:1px solid var(--border-color); align-items:stretch;">
                            <div class="portfolio-img-box" style="flex:1.1; height:100%; min-height:220px;">
                                <img src="${a.thumbnail || 'coffee_bg.webp'}" alt="${a.title_th}" style="height:100%; object-fit:cover;">
                            </div>
                            <div class="portfolio-info" style="flex:1.4; padding:25px; display:flex; flex-direction:column; justify-content:center;">
                                <span style="font-size:0.78rem; color:var(--text-sec);"><i class="far fa-calendar-alt"></i> ${a.date}</span>
                                <h3 style="font-size:1.18rem; font-weight:700; margin-top:8px; margin-bottom:12px; color:var(--primary); line-height:1.4;">
                                    ${this.lang === 'th' ? a.title_th : a.title_en}
                                </h3>
                                <p style="font-size:0.88rem; color:var(--text-sec); line-height:1.55; margin-bottom:15px;">
                                    ${this.lang === 'th' ? a.summary_th : a.summary_en}
                                </p>
                                <a href="#/articles-detail?id=${a.id}" style="font-size:0.88rem; font-weight:700; color:var(--secondary); text-decoration:none; margin-top:auto;">
                                    ${this.lang === 'th' ? 'อ่านบทความแนะนำ <i class="fas fa-arrow-right" style="font-size:0.75rem; margin-left:4px;"></i>' : 'Read Guide <i class="fas fa-arrow-right" style="font-size:0.75rem; margin-left:4px;"></i>'}
                                </a>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        html += `
                </div>
            </section>
        `;
        
        container.innerHTML = html;
    }

    async renderArticlesDetailView(container, params) {
        const id = params.get('id');
        const artItem = await this.db.get('articles', id);
        
        if (!artItem) {
            container.innerHTML = `<div class="container text-center" style="padding:100px 0;"><h2>${this.lang === 'th' ? 'ไม่พบไฟล์บทความที่ค้นหา' : 'Article Not Found'}</h2><a href="#/articles" class="btn btn-primary">Back to Articles</a></div>`;
            return;
        }
        
        let html = `
            <div class="breadcrumb-container" style="background: var(--bg-sec); padding: 15px 0; border-bottom: 1px solid var(--border-color);">
                <div class="container">
                    <span style="font-size: 0.9rem; color: var(--text-sec);">
                        <a href="#/home" style="color: var(--primary); text-decoration: none;"><i class="fas fa-home"></i> ${this.lang === 'th' ? 'หน้าแรก' : 'Home'}</a> 
                        <i class="fas fa-chevron-right" style="font-size: 0.75rem; margin: 0 8px;"></i> 
                        <a href="#/articles" style="color: var(--primary); text-decoration: none;">${this.lang === 'th' ? 'บทความความรู้' : 'Articles'}</a> 
                        <i class="fas fa-chevron-right" style="font-size: 0.75rem; margin: 0 8px;"></i> 
                        ${this.lang === 'th' ? artItem.title_th : artItem.title_en}
                    </span>
                </div>
            </div>
            <section class="section-padding">
                <div class="container" style="max-width: 850px;">
                    <div style="margin-bottom:30px;">
                        <span style="font-size: 0.9rem; font-weight:700; color: var(--secondary); text-transform: uppercase;"><i class="fas fa-graduation-cap"></i> ${this.lang === 'th' ? 'บทความเพื่อผู้ประกอบการคาเฟ่' : 'Useful Cup Guides'}</span>
                        <h1 style="font-size: 2.3rem; font-weight: 800; color: var(--primary); margin-top: 10px; margin-bottom: 15px; line-height: 1.35;">
                            ${this.lang === 'th' ? artItem.title_th : artItem.title_en}
                        </h1>
                        <span style="font-size:0.85rem; color: var(--text-sec);"><i class="far fa-calendar-alt"></i> วันที่เผยแพร่: ${artItem.date}</span>
                    </div>
                    
                    ${artItem.thumbnail ? `
                        <div style="width: 100%; border-radius: var(--radius-md); overflow: hidden; margin-bottom: 40px; box-shadow: var(--shadow-sm);">
                            <img src="${artItem.thumbnail}" alt="${artItem.title_th}" style="width: 100%; height: auto; display: block; object-fit: cover;">
                        </div>
                    ` : ''}
                    
                    <div class="article-rich-content-body article-body" style="font-size: 1.08rem; line-height: 1.95; color: var(--text-main); white-space: pre-line;">
                        ${this.lang === 'th' ? artItem.content_th : artItem.content_en}
                    </div>
                    
                    <div style="margin-top: 50px; border-top: 1px solid var(--border-color); padding-top: 30px; display: flex; justify-content: space-between; align-items:center;">
                        <a href="#/articles" class="btn btn-outline" style="border-color:var(--primary); color:var(--primary);"><i class="fas fa-chevron-left"></i> ย้อนกลับไปหน้าบทความ</a>
                        <button class="btn btn-primary" onclick="window.location.hash='#/quote'"><i class="fas fa-file-invoice-dollar"></i> สอบถามข้อมูล/สั่งสกรีนโลโก้</button>
                    </div>
                </div>
            </section>
        `;
        
        container.innerHTML = html;
    }

    async renderSearchView(container, params) {
        const query = (params.get('q') || '').trim().toLowerCase();
        
        let html = `
            <section class="section-padding">
                <div class="container" style="max-width: 960px;">
                    <div class="text-center" style="margin-bottom: 40px;">
                        <h1 style="font-size: 2.2rem; font-weight: 800; color: var(--primary); margin-bottom:20px;">
                            <i class="fas fa-search"></i> ${this.lang === 'th' ? 'ค้นหาข้อมูลเว็บไซต์' : 'Search Website'}
                        </h1>
                        <div style="max-width:600px; margin: 0 auto; display:flex; gap:10px;">
                            <input type="text" id="main-search-input-field" class="form-control" value="${query}" placeholder="${this.lang === 'th' ? 'ค้นหาแก้ว PET, หมวดหมู่สินค้า, กิจกรรม...' : 'Search PET Cups, Activities, specs...'}">
                            <button class="btn btn-primary" onclick="window.charoenApp.triggerMainSearch()"><i class="fas fa-search"></i> ค้นหา</button>
                        </div>
                    </div>
        `;
        
        if (!query) {
            html += `
                <div class="text-center" style="padding: 50px 0; background: var(--bg-sec); border-radius: var(--radius-md);">
                    <p style="color: var(--text-sec);">${this.lang === 'th' ? 'กรุณากรอกคำที่ต้องการค้นหาในกล่องด้านบนครับ' : 'Please input keywords to search.'}</p>
                </div>
            `;
        } else {
            // Search logic
            const products = await this.db.getAll('products');
            const news = await this.db.getAll('news');
            const articles = await this.db.getAll('articles');
            
            const matchProducts = products.filter(p => 
                (p.name_th && p.name_th.toLowerCase().includes(query)) || 
                (p.name_en && p.name_en.toLowerCase().includes(query)) ||
                (p.desc_th && p.desc_th.toLowerCase().includes(query)) ||
                (p.desc_en && p.desc_en.toLowerCase().includes(query)) ||
                (p.category && p.category.toLowerCase().includes(query)) ||
                (p.spec_material && p.spec_material.toLowerCase().includes(query))
            );
            
            const matchNews = news.filter(n => n.visible && (
                (n.title_th && n.title_th.toLowerCase().includes(query)) ||
                (n.title_en && n.title_en.toLowerCase().includes(query)) ||
                (n.summary_th && n.summary_th.toLowerCase().includes(query)) ||
                (n.summary_en && n.summary_en.toLowerCase().includes(query)) ||
                (n.content_th && n.content_th.toLowerCase().includes(query)) ||
                (n.content_en && n.content_en.toLowerCase().includes(query))
            ));

            const matchArticles = articles.filter(a => a.visible && (
                (a.title_th && a.title_th.toLowerCase().includes(query)) ||
                (a.title_en && a.title_en.toLowerCase().includes(query)) ||
                (a.summary_th && a.summary_th.toLowerCase().includes(query)) ||
                (a.summary_en && a.summary_en.toLowerCase().includes(query)) ||
                (a.content_th && a.content_th.toLowerCase().includes(query)) ||
                (a.content_en && a.content_en.toLowerCase().includes(query))
            ));
            
            const totalResults = matchProducts.length + matchNews.length + matchArticles.length;
            
            html += `
                <div style="margin-bottom: 30px; font-size:1.05rem; font-weight:700; color:var(--text-sec);">
                                        ${this.lang === "th" ? "พบผลลัพธ์การค้นหาทั้งหมด <span style='color:var(--secondary);'>" + totalResults + "</span> รายการ สำหรับคำค้น \"" + query + "\"" : "Found " + totalResults + " results matching \"" + query + "\""}
                </div>
                
                <!-- Search tabs structure -->
                <div class="search-tabs-row" style="display:flex; border-bottom:2px solid var(--border-color); gap:30px; margin-bottom:30px;">
                    <button class="search-tab-btn active" id="stab-prod" onclick="window.charoenApp.switchSearchTab('products')" style="background:none; border:none; padding:15px 5px; font-weight:700; font-size:1.05rem; color:var(--primary); border-bottom:3px solid var(--secondary); cursor:pointer;">
                        ${this.lang === 'th' ? `รายการสินค้า (${matchProducts.length})` : `Products (${matchProducts.length})`}
                    </button>
                    <button class="search-tab-btn" id="stab-news" onclick="window.charoenApp.switchSearchTab('news')" style="background:none; border:none; padding:15px 5px; font-weight:700; font-size:1.05rem; color:var(--text-sec); cursor:pointer;">
                        ${this.lang === 'th' ? `กิจกรรม & บทความ (${matchNews.length + matchArticles.length})` : `Activities & Articles (${matchNews.length + matchArticles.length})`}
                    </button>
                </div>
                
                <!-- Search Tab Contents -->
                <div class="search-tab-contents-container">
                    <!-- Products Search Results tab -->
                    <div class="search-tab-pane" id="spane-products" style="display:block;">
                        ${matchProducts.length === 0 ? `
                            <p style="color:var(--text-sec); padding:30px 0;">${this.lang === 'th' ? 'ไม่พบข้อมูลสินค้าที่ตรงกับคำค้นหา' : 'No matching products found.'}</p>
                        ` : `
                            <div class="grid-3">
                                ${matchProducts.map(prod => `
                                    <div class="product-card" onclick="window.charoenApp.openProductDetails('${prod.id}')">
                                        <div class="product-img-box">
                                            <img src="${prod.image_src || 'coffee_bg.webp'}" alt="${prod.name_th}">
                                        </div>
                                        <div class="product-info">
                                            <span style="font-size:0.75rem; font-weight:700; color:var(--secondary); text-transform:uppercase;">${prod.category || 'สกรีนแก้ว'}</span>
                                            <h3 style="font-size:1.15rem; font-weight:700; margin-top:5px; margin-bottom:5px; color:var(--primary);">${this.lang === 'th' ? prod.name_th : prod.name_en}</h3>
                                            <p style="font-size:0.85rem; color:var(--text-sec); min-height:36px; line-height:1.5;">${this.lang === 'th' ? (prod.desc_th || '').slice(0, 50) : (prod.desc_en || '').slice(0, 50)}...</p>
                                            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:15px; border-top:1px solid var(--border-color); padding-top:10px;">
                                                <span style="font-size:0.85rem; font-weight:700; color:var(--primary);">${this.t('detail_min_order')}: ${prod.spec_min_qty || '1,000 ใบ'}</span>
                                                <button class="btn btn-outline" style="padding:6px 12px; font-size:0.75rem; border-color:var(--secondary); color:var(--secondary);"><i class="fas fa-file-invoice-dollar"></i> ขอราคา</button>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        `}
                    </div>
                    
                    <!-- News and Articles Search Results tab -->
                    <div class="search-tab-pane" id="spane-news" style="display:none;">
                        ${(matchNews.length === 0 && matchArticles.length === 0) ? `
                            <p style="color:var(--text-sec); padding:30px 0;">${this.lang === 'th' ? 'ไม่พบกิจกรรมหรือบทความความรู้ที่ตรงกับคำค้นหา' : 'No matching activities or articles found.'}</p>
                        ` : `
                            <div class="grid-3">
                                ${matchNews.map(n => `
                                    <div class="portfolio-card" onclick="window.location.hash='#/news-detail?id=${n.id}'" style="cursor:pointer; background:var(--bg-sec);">
                                        <div class="portfolio-img-box" style="height:170px;">
                                            <img src="${n.thumbnail || 'coffee_bg.webp'}" alt="${n.title_th}">
                                        </div>
                                        <div class="portfolio-info" style="padding:20px;">
                                            <span style="font-size:0.75rem; color:var(--secondary); font-weight:700; text-transform:uppercase;">${this.lang === 'th' ? '[กิจกรรม]' : '[Activity]'}</span>
                                            <h3 style="font-size:1.1rem; font-weight:700; margin-top:5px; margin-bottom:10px; color:var(--primary); line-height:1.4;">${this.lang === 'th' ? n.title_th : n.title_en}</h3>
                                            <p style="font-size:0.85rem; color:var(--text-sec); line-height:1.5;">${this.lang === 'th' ? n.summary_th : n.summary_en}</p>
                                        </div>
                                    </div>
                                `).join('')}
                                
                                ${matchArticles.map(a => `
                                    <div class="portfolio-card" onclick="window.location.hash='#/articles-detail?id=${a.id}'" style="cursor:pointer; background:var(--bg-sec);">
                                        <div class="portfolio-img-box" style="height:170px;">
                                            <img src="${a.thumbnail || 'coffee_bg.webp'}" alt="${a.title_th}">
                                        </div>
                                        <div class="portfolio-info" style="padding:20px;">
                                            <span style="font-size:0.75rem; color:var(--secondary); font-weight:700; text-transform:uppercase;">[บทความแนะนำ]</span>
                                            <h3 style="font-size:1.1rem; font-weight:700; margin-top:5px; margin-bottom:10px; color:var(--primary); line-height:1.4;">${this.lang === 'th' ? a.title_th : a.title_en}</h3>
                                            <p style="font-size:0.85rem; color:var(--text-sec); line-height:1.5;">${this.lang === 'th' ? a.summary_th : a.summary_en}</p>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        `}
                    </div>
                </div>
            `;
        }
        
        html += `
                </div>
            </section>
        `;
        
        container.innerHTML = html;
        
        // Bind keyup for search input field to allow pressing Enter to search
        const sInputField = document.getElementById('main-search-input-field');
        if (sInputField) {
            sInputField.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    window.charoenApp.triggerMainSearch();
                }
            });
        }
    }

    triggerMainSearch() {
        const val = document.getElementById('main-search-input-field').value.trim();
        window.location.hash = `#/search?q=${encodeURIComponent(val)}`;
    }

    switchSearchTab(tabType) {
        const stabProd = document.getElementById('stab-prod');
        const stabNews = document.getElementById('stab-news');
        const spaneProd = document.getElementById('spane-products');
        const spaneNews = document.getElementById('spane-news');
        
        if (tabType === 'products') {
            stabProd.classList.add('active');
            stabProd.style.borderBottom = '3px solid var(--secondary)';
            stabProd.style.color = 'var(--primary)';
            
            stabNews.classList.remove('active');
            stabNews.style.borderBottom = 'none';
            stabNews.style.color = 'var(--text-sec)';
            
            spaneProd.style.display = 'block';
            spaneNews.style.display = 'none';
        } else {
            stabNews.classList.add('active');
            stabNews.style.borderBottom = '3px solid var(--secondary)';
            stabNews.style.color = 'var(--primary)';
            
            stabProd.classList.remove('active');
            stabProd.style.borderBottom = 'none';
            stabProd.style.color = 'var(--text-sec)';
            
            spaneNews.style.display = 'block';
            spaneProd.style.display = 'none';
        }
    }

    async renderPrivacyView(container) {
        let html = `
            <div class="breadcrumb-container" style="background: var(--bg-sec); padding: 15px 0; border-bottom: 1px solid var(--border-color);">
                <div class="container">
                    <span style="font-size: 0.9rem; color: var(--text-sec);">
                        <a href="#/home" style="color: var(--primary); text-decoration: none;"><i class="fas fa-home"></i> ${this.lang === 'th' ? 'หน้าแรก' : 'Home'}</a> 
                        <i class="fas fa-chevron-right" style="font-size: 0.75rem; margin: 0 8px;"></i> 
                        ${this.lang === 'th' ? 'นโยบายความเป็นส่วนตัว' : 'Privacy Policy'}
                    </span>
                </div>
            </div>
            <section class="section-padding">
                <div class="container detail-description" style="max-width:800px;">
                    <h1 style="font-size:2.2rem; font-weight:800; color:var(--primary); margin-bottom:25px; text-align:center;">${this.lang === 'th' ? 'นโยบายความเป็นส่วนตัว (Privacy Policy)' : 'Privacy Policy'}</h1>
                    <div style="line-height:1.9; color:var(--text-main); font-size:1.05rem;">
                        <p style="margin-bottom:20px;">เจริญ ออน คัพ ตระหนักถึงความสำคัญในการปกป้องข้อมูลส่วนบุคคลของลูกค้าและผู้ใช้บริการเว็บไซต์ทุกท่าน เราได้จัดทำนโยบายความเป็นส่วนตัวนี้ขึ้นเพื่อชี้แจงเกี่ยวกับมาตรการรักษาความปลอดภัยของข้อมูลการติดต่อและการตรวจสอบการส่งโลโก้ของท่าน</p>
                        
                        <h4 style="font-size:1.25rem; font-weight:700; color:var(--primary); margin-top:30px; margin-bottom:12px;">1. ข้อมูลส่วนบุคคลที่เราจัดเก็บ</h4>
                        <p style="margin-bottom:20px;">เราจะเก็บข้อมูลของท่านเฉพาะเมื่อท่านทำการส่งข้อมูลผ่านแบบฟอร์ม "ขอใบเสนอราคา" หรือแบบฟอร์ม "ติดต่อเราด่วน" เท่านั้น ได้แก่ ชื่อ-นามสกุล, ชื่อร้านกาแฟของท่าน, เบอร์โทรศัพท์ติดต่อ, LINE ID, และไฟล์รูปภาพโลโก้แบรนด์ของร้านที่ท่านส่งมาพิมพ์ทดสอบแบบ 3D</p>
                        
                        <h4 style="font-size:1.25rem; font-weight:700; color:var(--primary); margin-top:30px; margin-bottom:12px;">2. วัตถุประสงค์ในการเก็บข้อมูล</h4>
                        <p style="margin-bottom:20px;">เราเก็บรักษาข้อมูลของท่านเพื่อนำไปใช้ในวัตถุประสงค์ดังต่อไปนี้เท่านั้น:
                            <br>- ดำเนินการออกใบเสนอราคาสกรีนแก้วตามความจุและสเปกที่ระบุ
                            <br>- ส่งไฟล์ตัวอย่างแบบพิมพ์โลโก้จำลอง 3D ให้ท่านตรวจสอบความถูกต้องของระยะตำแหน่งพิมพ์
                            <br>- ติดต่อและประสานงานจัดส่งกล่องสินค้าอย่างปลอดภัยทั่วประเทศ
                        </p>
                        
                        <h4 style="font-size:1.25rem; font-weight:700; color:var(--primary); margin-top:30px; margin-bottom:12px;">3. การเก็บรักษาความลับของไฟล์งานโลโก้</h4>
                        <p style="margin-bottom:20px;">ไฟล์รูปภาพโลโก้แบรนด์และดีไซน์ทั้งหมดของลูกค้า ถือเป็นทรัพย์สินทางปัญญาและความลับขั้นสูงสุด เจริญ ออน คัพ จะไม่นำไฟล์โลโก้หรืองานสกรีนของแบรนด์ท่านไปดัดแปลง คัดลอก หรือแจกจ่ายให้แก่บุคคลภายนอกโดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษรเด็ดขาด</p>
                    </div>
                </div>
            </section>
        `;
        container.innerHTML = html;
    }

    async renderTermsView(container) {
        let html = `
            <div class="breadcrumb-container" style="background: var(--bg-sec); padding: 15px 0; border-bottom: 1px solid var(--border-color);">
                <div class="container">
                    <span style="font-size: 0.9rem; color: var(--text-sec);">
                        <a href="#/home" style="color: var(--primary); text-decoration: none;"><i class="fas fa-home"></i> ${this.lang === 'th' ? 'หน้าแรก' : 'Home'}</a> 
                        <i class="fas fa-chevron-right" style="font-size: 0.75rem; margin: 0 8px;"></i> 
                        ${this.lang === 'th' ? 'ข้อตกลงและเงื่อนไข' : 'Terms & Conditions'}
                    </span>
                </div>
            </div>
            <section class="section-padding">
                <div class="container detail-description" style="max-width:800px;">
                    <h1 style="font-size:2.2rem; font-weight:800; color:var(--primary); margin-bottom:25px; text-align:center;">${this.lang === 'th' ? 'ข้อตกลงและเงื่อนไขการใช้บริการ (Terms & Conditions)' : 'Terms & Conditions'}</h1>
                    <div style="line-height:1.9; color:var(--text-main); font-size:1.05rem;">
                        <p style="margin-bottom:20px;">ยินดีต้อนรับสู่การใช้บริการสั่งผลิตพิมพ์สกรีนแก้วเครื่องดื่ม เจริญ ออน คัพ กรุณาอ่านและทำความเข้าใจข้อตกลงและเงื่อนไขการใช้บริการผลิตดังต่อไปนี้อย่างครบถ้วนก่อนการชำระเงินมัดจำ:</p>
                        
                        <h4 style="font-size:1.25rem; font-weight:700; color:var(--primary); margin-top:30px; margin-bottom:12px;">1. ขั้นตอนการยืนยันแบบและตรวจสอบไฟล์พิมพ์</h4>
                        <p style="margin-bottom:20px;">ทางร้านจะทำการส่งแบบจำลองดิจิตอล 3D (Mockup) ของแก้วที่ท่านเลือกพร้อมวางโลโก้ผ่าน LINE ให้ลูกค้ากดยืนยันตำแหน่ง ขนาด สัดส่วน และเฉดสี เมื่อลูกค้ายืนยันตกลงแล้วและชำระค่ามัดจำ ทางร้านจะถือว่าแบบดังกล่าวถูกต้องและเข้าสู่กระบวนการสลักบล็อกพิมพ์ทันที โดยไม่สามารถเปลี่ยนแปลงได้อีกในภายหลัง</p>
                        
                        <h4 style="font-size:1.25rem; font-weight:700; color:var(--primary); margin-top:30px; margin-bottom:12px;">2. ค่าคลาดเคลื่อนและปริมาณการผลิตบรรจุภัณฑ์</h4>
                        <p style="margin-bottom:20px;">- **การพิมพ์สกรีนระบบกึ่งอัตโนมัติ (Semi-Auto Printing):** อาจมีค่าคลาดเคลื่อนของการวางแนวระนาบโลโก้ได้ประมาณ 1-2 มิลลิเมตรในแต่ละด้าน
                            <br>- **ความเพี้ยนของเฉดสีพิมพ์:** สีที่เห็นบนจอโทรศัพท์มือถือกับตัวแก้วจริงอาจมีความเพี้ยนไปได้เล็กน้อยเนื่องจากมิติแสงและการแสดงผลหน้าจอบนอุปกรณ์ที่ต่างกัน
                            <br>- **จำนวนที่ส่งมอบ:** เนื่องจากกระบวนการเซ็ตอัพเครื่องสกรีนและการสกรีนสูญเสียในสายพานผลิต ปริมาณสินค้าที่ผลิตส่งมอบเสร็จสิ้นอาจคลาดเคลื่อนไปได้ประมาณ +/- 5% จากยอดจำนวนสั่งซื้อ โดยทางร้านจะหักลดราคาตามยอดจริงให้กับลูกค้า
                        </p>
                        
                        <h4 style="font-size:1.25rem; font-weight:700; color:var(--primary); margin-top:30px; margin-bottom:12px;">3. นโยบายการมัดจำและจัดส่ง</h4>
                        <p style="margin-bottom:20px;">ลูกค้าต้องทำการชำระมัดจำยอดแรกตามข้อตกลงเพื่อเข้าคิวกำหนดผลิต และชำระส่วนที่เหลือเสร็จสิ้นก่อนทางรถส่งทำการจัดส่งไปยังที่อยู่หน้าร้านของท่าน โดยหากมีความล่าช้าจากเหตุภัยธรรมชาติหรือขนส่งล่าช้า ทางร้านจะรีบประสานงานช่วยเหลือแจ้งลูกค้าทันที</p>
                    </div>
                </div>
            </section>
        `;
        container.innerHTML = html;
    }

    // Initialize Slider logic dynamically for whichever container is active
    initSlider(containerSelector, slideCount) {
        if (this.sliderInterval) {
            clearInterval(this.sliderInterval);
        }
        
        this.currentSlideIndex = 0;
        this.updateSliderUI(containerSelector, slideCount);
        
        this.sliderInterval = setInterval(() => {
            this.currentSlideIndex = (this.currentSlideIndex + 1) % slideCount;
            this.updateSliderUI(containerSelector, slideCount);
        }, 5500); // 5.5s delay
    }

    changeSlide(direction) {
        const sliderSec = document.querySelector('.slider-section');
        if (!sliderSec) return;
        
        const slides = sliderSec.querySelectorAll('.slider-single-slide');
        if (slides.length === 0) return;
        
        this.currentSlideIndex = (this.currentSlideIndex + direction + slides.length) % slides.length;
        this.updateSliderUI('#' + sliderSec.id, slides.length);
    }

    goToSlide(index) {
        const sliderSec = document.querySelector('.slider-section');
        if (!sliderSec) return;
        
        const slides = sliderSec.querySelectorAll('.slider-single-slide');
        if (slides.length === 0) return;
        
        this.currentSlideIndex = index;
        this.updateSliderUI('#' + sliderSec.id, slides.length);
    }

    updateSliderUI(selector, slideCount) {
        const container = document.querySelector(`${selector} .slider-slides-container`);
        if (!container) return;
        const offsetPercent = -this.currentSlideIndex * (100 / slideCount);
        container.style.transform = `translateX(${offsetPercent}%)`;

        // Update dots active state
        document.querySelectorAll(`${selector} .slider-dot`).forEach((dot, idx) => {
            if (idx === this.currentSlideIndex) {
                dot.style.background = 'var(--primary)';
                dot.style.width = '24px';
                dot.style.borderRadius = 'var(--radius-full)';
            } else {
                dot.style.background = 'rgba(255,255,255,0.45)';
                dot.style.width = '12px';
                dot.style.borderRadius = '50%';
            }
        });
    }

    initLocalSlider(sliderId) {
        const sliderContainer = document.getElementById(sliderId);
        if (!sliderContainer) return;

        const wrapper = sliderContainer.querySelector('.slider-wrapper');
        const slides = sliderContainer.querySelectorAll('.slider-single-slide');
        const dots = sliderContainer.querySelectorAll('.slider-dot');
        if (!wrapper || slides.length === 0) return;

        // Clear existing interval for this slider if any
        this.localSliderIntervals = this.localSliderIntervals || {};
        if (this.localSliderIntervals[sliderId]) {
            clearInterval(this.localSliderIntervals[sliderId]);
        }

        let currentIndex = 0;
        const slideCount = slides.length;

        const updateUI = () => {
            const offsetPercent = -currentIndex * (100 / slideCount);
            wrapper.style.transform = `translateX(${offsetPercent}%)`;

            dots.forEach((dot, idx) => {
                if (idx === currentIndex) {
                    dot.classList.add('active');
                    dot.style.background = 'var(--secondary)';
                    dot.style.width = '24px';
                    dot.style.borderRadius = 'var(--radius-full)';
                } else {
                    dot.classList.remove('active');
                    dot.style.background = 'rgba(255,255,255,0.5)';
                    dot.style.width = '10px';
                    dot.style.borderRadius = '50%';
                }
            });
        };

        // Initialize dots click listeners
        dots.forEach((dot, idx) => {
            dot.onclick = () => {
                currentIndex = idx;
                updateUI();
                resetAutoplay();
            };
        });

        const resetAutoplay = () => {
            if (slideCount <= 1) return;
            if (this.localSliderIntervals[sliderId]) {
                clearInterval(this.localSliderIntervals[sliderId]);
            }
            this.localSliderIntervals[sliderId] = setInterval(() => {
                currentIndex = (currentIndex + 1) % slideCount;
                updateUI();
            }, 5000);
        };

        // Initialize UI and start autoplay
        updateUI();
        resetAutoplay();
    }

    async renderAboutView(container) {
        const address = await this.db.get('settings', this.lang === 'th' ? 'address_th' : 'address_en');
        const phone = await this.db.get('settings', 'phone');
        const email = await this.db.get('settings', 'email');
        const hours = await this.db.get('settings', this.lang === 'th' ? 'business_hours_th' : 'business_hours_en');

        const companyName = await this.db.get('settings', this.lang === 'th' ? 'company_name_th' : 'company_name_en');
        const aboutTitle = await this.db.get('settings', this.lang === 'th' ? 'about_title_th' : 'about_title_en');
        const aboutDesc = await this.db.get('settings', this.lang === 'th' ? 'about_desc_th' : 'about_desc_en');

        const companyNameVal = companyName?.value || (this.lang === 'th' ? 'เจริญ ออน คัพ' : 'Charoen On Cup');
        const aboutTitleVal = aboutTitle?.value || (this.lang === 'th' ? 'เจริญ ออน คัพ โรงงานรับสกรีนแก้วพลาสติกและแก้วกระดาษ' : 'Charoen On Cup Factory for Plastic & Paper Cup Screen Printing');
        const aboutDescVal = aboutDesc?.value || (this.lang === 'th' ? 'ยินดีให้บริการรับสกรีนแก้วพลาสติก แก้วกระดาษ และบรรจุภัณฑ์เครื่องดื่มทุกชนิด เพื่อเพิ่มมูลค่าให้กับแบรนด์ร้านกาแฟของคุณทั่วประเทศ' : 'is pleased to offer custom screen printing on plastic cups, paper cups, and all kinds of beverage packaging to add value to your cafe brand nationwide.');

        // Load dynamic about image
        const aboutImgKey = await this.db.get('settings', 'about_image');
        let aboutImgVal = aboutImgKey?.value || '';
        if (aboutImgVal && !aboutImgVal.startsWith('data:') && !aboutImgVal.startsWith('http') && !aboutImgVal.includes('/')) {
            try {
                const mediaItem = await this.db.getAll('media').then(list => list.find(m => m.name === aboutImgVal || m.id === aboutImgVal));
                if (mediaItem) {
                    aboutImgVal = mediaItem.image_src;
                }
            } catch (e) {
                console.warn("Failed to lookup media item:", e);
            }
        }
        if (!aboutImgVal) {
            aboutImgVal = 'about_banner.webp'; // Presentation fallback only
        }

        // Load social URLs
        const fbKey = await this.db.get('settings', 'facebook_url') || await this.db.get('settings', 'facebook');
        const lineKey = await this.db.get('settings', 'line_url') || await this.db.get('settings', 'line');
        const mapsKey = await this.db.get('settings', 'google_maps_url');

        const fbUrl = fbKey?.value || '';
        const lineUrl = lineKey?.value || '';
        const mapsUrl = mapsKey?.value || '';

        // Conditionally load Vision & Mission if they exist
        const visionTh = await this.db.get('settings', 'vision_th');
        const visionEn = await this.db.get('settings', 'vision_en');
        const missionTh = await this.db.get('settings', 'mission_th');
        const missionEn = await this.db.get('settings', 'mission_en');

        const visionVal = this.lang === 'th' ? visionTh?.value : visionEn?.value;
        const missionVal = this.lang === 'th' ? missionTh?.value : missionEn?.value;

        let visionMissionHtml = '';
        if (visionVal || missionVal) {
            visionMissionHtml = `
                <section class="section-padding" style="background-color: var(--bg-sec); border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color);">
                    <div class="container">
                        <div class="grid-2" style="gap: 30px;">
                            ${visionVal ? `
                                <div class="vision-mission-card" style="background: white; padding: 32px; border-radius: var(--radius-md); box-shadow: var(--shadow-sm); border-top: 4px solid var(--primary);">
                                    <div style="font-size: 2rem; color: var(--primary); margin-bottom: 16px;"><i class="fas fa-eye"></i></div>
                                    <h4 style="font-size: 1.3rem; font-weight: 800; color: var(--secondary); margin-bottom: 12px; font-family: 'Inter', 'Kanit', sans-serif;">${this.lang === 'th' ? 'วิสัยทัศน์' : 'Vision'}</h4>
                                    <p class="card-description" style="color: var(--text-main); line-height: 1.75; font-size: 0.95rem;">${visionVal}</p>
                                </div>
                            ` : ''}
                            ${missionVal ? `
                                <div class="vision-mission-card" style="background: white; padding: 32px; border-radius: var(--radius-md); box-shadow: var(--shadow-sm); border-top: 4px solid var(--accent);">
                                    <div style="font-size: 2rem; color: var(--accent); margin-bottom: 16px;"><i class="fas fa-bullseye"></i></div>
                                    <h4 style="font-size: 1.3rem; font-weight: 800; color: var(--secondary); margin-bottom: 12px; font-family: 'Inter', 'Kanit', sans-serif;">${this.lang === 'th' ? 'พันธกิจ' : 'Mission'}</h4>
                                    <p class="card-description" style="color: var(--text-main); line-height: 1.75; font-size: 0.95rem;">${missionVal}</p>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </section>
            `;
        }

        // Load about bullets summary
        const bulletsThKey = await this.db.get('settings', 'about_bullets_th');
        const bulletsEnKey = await this.db.get('settings', 'about_bullets_en');
        const bulletsText = this.lang === 'th' ? (bulletsThKey?.value || '') : (bulletsEnKey?.value || '');
        const bulletItems = bulletsText.split('\n').map(b => b.trim()).filter(Boolean);

        let bulletsHtml = '';
        if (bulletItems.length > 0) {
            bulletsHtml = `
                <section class="section-padding" style="background-color: var(--bg-main); border-bottom: 1px solid var(--border-color);">
                    <div class="container text-center" style="max-width: 800px;">
                        <span class="section-eyebrow" style="font-weight: 700; color: var(--accent); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 12px;">
                            ${this.lang === 'th' ? 'ทำไมลูกค้าถึงเลือกเรา' : 'Why Customers Choose Us'}
                        </span>
                        <h3 class="section-title" style="margin-bottom: 36px; font-family: 'Inter', 'Kanit', sans-serif;">
                            ${this.lang === 'th' ? 'สรุปจุดเด่นที่ทำให้เราได้รับความไว้วางใจ' : 'Summary of Key Strengths'}
                        </h3>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; text-align: left; max-width: 600px; margin: 0 auto;">
                            ${bulletItems.map(item => `
                                <div style="display: flex; align-items: center; gap: 12px; padding: 16px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); background-color: var(--bg-sec); box-shadow: var(--shadow-sm);">
                                    <i class="fas fa-check-circle" style="color: var(--accent); font-size: 1.2rem; flex-shrink: 0;"></i>
                                    <span class="body-text" style="font-size: 0.95rem; font-weight: 700; color: var(--secondary);">${item}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </section>
            `;
        }

        // Whitespace-safe resolver helper
        const resolveText = (val, fallback) => {
            const trimmed = typeof val === 'string' ? val.trim() : '';
            return trimmed || fallback;
        };

        // Resolve dynamic heading and fallbacks
        const headingVal = resolveText(this.t('nav_about'), this.lang === 'th' ? 'เกี่ยวกับเรา' : 'About Us');
        const defaultHeroSubTh = 'ผู้เชี่ยวชาญด้านการผลิตและสกรีนแก้วพลาสติก พร้อมบริการครบวงจรสำหรับร้านกาแฟ ร้านเครื่องดื่ม และธุรกิจอาหาร';
        const defaultHeroSubEn = 'Plastic cup production and logo printing specialists, providing complete solutions for cafés, beverage shops, and food businesses.';
        const heroSubVal = this.lang === 'th' ? defaultHeroSubTh : defaultHeroSubEn;

        container.innerHTML = `
            <!-- Premium About Hero Banner -->
            <div class="subpage-hero-banner about-hero" style="--hero-bg: url('${aboutImgVal}'); --hero-position: center 35%; position: relative; padding: 60px 0; overflow: hidden; text-align: center;">
                <div class="subpage-hero-overlay" style="position: absolute; inset: 0; background: linear-gradient(to right, rgba(4, 53, 106, 0.60), rgba(4, 53, 106, 0.40)); z-index: 1;"></div>
                <div class="container" style="position: relative; z-index: 2;">
                    <h2 class="about-hero-title">
                        ${headingVal}
                    </h2>
                    <p class="about-hero-subtitle">
                        ${heroSubVal}
                    </p>
                </div>
            </div>
            
            <!-- Company Story -->
            <section class="section-padding" style="background-color: var(--bg-main);">
                <div class="container">
                    <div class="grid-2" style="align-items: flex-start; gap: 40px;">
                        <div>
                            <span class="section-eyebrow" style="font-weight: 700; color: var(--accent); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px;">
                                ${this.lang === 'th' ? 'ความเป็นมาและเป้าหมาย' : 'Our Background & Focus'}
                            </span>
                            <h3 style="font-size: 1.8rem; font-weight: 800; color: var(--secondary); margin-bottom: 20px; line-height: 1.35; font-family: 'Inter', 'Kanit', sans-serif;">
                                ${aboutTitleVal}
                            </h3>
                            <p class="body-text" style="line-height: 1.8; color: var(--text-main); font-size: 0.98rem; margin-bottom: 16px;">
                                <strong>${companyNameVal}</strong> ${aboutDescVal}
                            </p>
                            <p class="body-text" style="line-height: 1.8; color: var(--text-muted); font-size: 0.95rem; margin-bottom: 24px;">
                                ${this.lang === 'th' 
                                    ? 'เรามุ่งเน้นให้บริการสกรีนแก้วคุณภาพด้วยสีระบบสกรีนที่ติดทนนาน ไม่หลุดลอกง่าย ช่วยสร้างเอกลักษณ์ให้ร้านกาแฟ ร้านชานมไข่มุก ร้านเบเกอรี่ และธุรกิจเครื่องดื่มทั่วประเทศ พร้อมให้คำแนะนำด้านการจัดวางโลโก้และแบบสกรีนฟรีโดยนักออกแบบมืออาชีพ' 
                                    : 'We specialize in custom screen printing service with durable, long-lasting colors. Helping cafe, milk tea shop, bakery, and beverage brands establish their identity. We provide layout and graphic design consultations free of charge.'}
                            </p>
                            <a href="#/products" class="btn btn-primary" style="padding: 10px 24px; font-weight: 700;">
                                ${this.lang === 'th' ? 'ดูสินค้าและบริการของเรา' : 'View Our Products'}
                            </a>
                        </div>
                        
                        <!-- Premium Company Information Card -->
                        <div class="info-panel-card" style="background-color: var(--bg-sec); border-radius: var(--radius-md); padding: 32px; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); width: 100%; box-sizing: border-box;">
                            <h4 style="font-size: 1.15rem; font-weight: 800; color: var(--secondary); margin-bottom: 20px; border-bottom: 2px solid var(--primary); padding-bottom: 8px; display: flex; align-items: center; gap: 8px; font-family: 'Inter', 'Kanit', sans-serif;">
                                <i class="fas fa-building" style="color: var(--primary);"></i>
                                <span>${this.lang === 'th' ? 'ข้อมูลบริษัทและช่องทางการติดต่อ' : 'Company & Contact Info'}</span>
                            </h4>
                            <ul style="list-style: none; display: flex; flex-direction: column; gap: 16px; padding: 0; margin: 0 0 20px 0;">
                                <li style="display: flex; gap: 12px; align-items: flex-start;">
                                    <i class="fas fa-map-marker-alt" style="color: var(--primary); margin-top: 4px; flex-shrink: 0;"></i>
                                    <div>
                                        <strong style="display: block; color: var(--secondary); font-size: 0.8rem; font-weight: 700; margin-bottom: 2px;">${this.lang === 'th' ? 'ที่อยู่โรงงาน' : 'Factory Address'}</strong>
                                        <span class="info-text" style="font-size: 0.9rem; color: var(--text-main); line-height: 1.4;">${address?.value || ''}</span>
                                    </div>
                                </li>
                                <li style="display: flex; gap: 12px; align-items: flex-start;">
                                    <i class="fas fa-phone-alt" style="color: var(--primary); margin-top: 4px; flex-shrink: 0;"></i>
                                    <div>
                                        <strong style="display: block; color: var(--secondary); font-size: 0.8rem; font-weight: 700; margin-bottom: 2px;">${this.lang === 'th' ? 'เบอร์โทรศัพท์ติดต่อ' : 'Contact Phone'}</strong>
                                        <span class="info-text" style="font-size: 0.9rem; color: var(--text-main);">${phone?.value || ''}</span>
                                    </div>
                                </li>
                                ${email?.value ? `
                                    <li style="display: flex; gap: 12px; align-items: flex-start;">
                                        <i class="fas fa-envelope" style="color: var(--primary); margin-top: 4px; flex-shrink: 0;"></i>
                                        <div>
                                            <strong style="display: block; color: var(--secondary); font-size: 0.8rem; font-weight: 700; margin-bottom: 2px;">${this.lang === 'th' ? 'อีเมลติดต่อ' : 'Email Address'}</strong>
                                            <span class="info-text" style="font-size: 0.9rem; color: var(--text-main);">${email.value}</span>
                                        </div>
                                    </li>
                                ` : ''}
                                <li style="display: flex; gap: 12px; align-items: flex-start;">
                                    <i class="fas fa-clock" style="color: var(--primary); margin-top: 4px; flex-shrink: 0;"></i>
                                    <div>
                                        <strong style="display: block; color: var(--secondary); font-size: 0.8rem; font-weight: 700; margin-bottom: 2px;">${this.lang === 'th' ? 'เวลาทำการ' : 'Business Hours'}</strong>
                                        <span class="info-text" style="font-size: 0.9rem; color: var(--text-main); line-height: 1.4;">${hours?.value || ''}</span>
                                    </div>
                                </li>
                            </ul>
                            
                            <!-- Quick Social and Map Actions -->
                            <div style="display: flex; flex-direction: column; gap: 8px;">
                                <div style="display: flex; gap: 8px;">
                                    ${lineUrl ? `<a href="${lineUrl}" target="_blank" class="btn btn-outline" style="flex: 1; justify-content: center; font-size: 0.8rem; padding: 8px 12px; border-color: #06c755; color: #06c755;"><i class="fab fa-line" style="margin-right: 6px; font-size: 1rem;"></i> LINE</a>` : ''}
                                    ${fbUrl ? `<a href="${fbUrl}" target="_blank" class="btn btn-outline" style="flex: 1; justify-content: center; font-size: 0.8rem; padding: 8px 12px; border-color: #1877f2; color: #1877f2;"><i class="fab fa-facebook-f" style="margin-right: 6px; font-size: 1rem;"></i> Facebook</a>` : ''}
                                </div>
                                ${mapsUrl ? `<a href="${mapsUrl}" target="_blank" class="btn btn-outline" style="width: 100%; justify-content: center; font-size: 0.8rem; padding: 8px 12px; border-color: var(--primary); color: var(--primary);"><i class="fas fa-map-marked-alt" style="margin-right: 6px;"></i> ${this.lang === 'th' ? 'ดูตำแหน่งบน Google Maps' : 'View on Google Maps'}</a>` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            <!-- Vision and Mission Section -->
            ${visionMissionHtml}
            
            <!-- Summary Highlights Section -->
            ${bulletsHtml}
            
            <!-- Closing CTA Bar -->
            <section class="section-padding" style="background-color: var(--primary); color: white; text-align: center; position: relative;">
                <div class="container" style="max-width: 700px; position: relative; z-index: 2;">
                    <h3 style="font-size: 1.8rem; font-weight: 800; color: white; margin-bottom: 12px; font-family: 'Inter', 'Kanit', sans-serif;">
                        ${this.lang === 'th' ? 'สนใจสกรีนแก้วกาแฟสำหรับแบรนด์ของคุณ?' : 'Ready to screen print cups for your brand?'}
                    </h3>
                    <p class="body-text" style="color: rgba(255, 255, 255, 0.85); font-size: 0.98rem; margin-bottom: 24px; line-height: 1.6; ">
                        ${this.lang === 'th' 
                            ? 'ติดต่อเพื่อปรึกษาการออกแบบโลโก้ ประเมินราคา หรือดูแคตตาล็อกสินค้าทั้งหมดได้ฟรีวันนี้' 
                            : 'Contact us for free layout consultations, pricing quotes, or browse our entire product catalog today.'}
                    </p>
                    <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                        <a href="#/contact" class="btn" style="background-color: var(--accent); color: white; padding: 10px 24px; font-weight: 700;">
                            ${this.lang === 'th' ? 'ติดต่อสอบถามข้อมูล' : 'Contact Us'}
                        </a>
                        <a href="#/products" class="btn btn-outline" style="border-color: rgba(255, 255, 255, 0.35); color: white; padding: 10px 24px; font-weight: 700;">
                            ${this.lang === 'th' ? 'เลือกดูสินค้าสกรีน' : 'Browse Products'}
                        </a>
                    </div>
                </div>
            </section>
        `;
    }

    async renderProductsView(container, params) {
        const categories = await this.db.getAll('categories');
        const products = await this.db.getAll('products');
        const slides = await this.db.getAll('slider');
        const sortedSlides = [...slides].sort((a, b) => a.order - b.order);
        
        const activeCatId = params?.get('category') || 'all';
        const filteredProducts = activeCatId === 'all' 
            ? products 
            : products.filter(p => p.category === activeCatId);

        let sliderHtml = '';
        if (sortedSlides.length > 0) {
            sliderHtml = `
                <div class="slider-container products-hero-slider" id="products-hero-slider">
                    <div class="slider-wrapper products-hero-track" style="width:${sortedSlides.length * 100}%;">
                        ${sortedSlides.map(slide => `
                            <div class="slider-single-slide products-hero-slide" style="width:${100 / sortedSlides.length}%; background-image:url('${slide.bg_src || 'coffee_bg.webp'}');">
                                <div class="products-hero-overlay"></div>
                                <div class="container products-hero-content">
                                    <h3 class="products-hero-title">${this.lang === 'th' ? slide.title_th : slide.title_en}</h3>
                                    <p class="products-hero-subtitle">${this.lang === 'th' ? slide.subtitle_th : slide.subtitle_en}</p>
                                    ${slide.btn_link ? `<a href="${slide.btn_link}" class="btn btn-primary products-hero-button">${this.lang === 'th' ? 'ดูรายละเอียด' : 'Learn More'}</a>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="slider-dots products-hero-dots">
                        ${sortedSlides.map((_, i) => `<span class="slider-dot products-hero-dot ${i === 0 ? 'active' : ''}" data-idx="${i}"></span>`).join('')}
                    </div>
                </div>
            `;
            setTimeout(() => this.initLocalSlider('products-hero-slider'), 100);
        }

        const hasCategories = categories.length > 0;
        let html = `
            ${sliderHtml}
            
            <div class="container">
                <div class="catalog-layout" ${hasCategories ? '' : 'style="grid-template-columns: 1fr;"'}>
                    <!-- Left Sidebar Filters -->
                    ${hasCategories ? `
                    <aside class="sidebar-filters">
                        <h4 class="filter-title">${this.lang === 'th' ? 'หมวดหมู่สินค้า' : 'Categories'}</h4>
                        <ul class="filter-list">
                            <li>
                                <a href="#/products?category=all" class="filter-btn ${activeCatId === 'all' ? 'active' : ''}">
                                    ${this.t('products_all')}
                                </a>
                            </li>
                            ${categories.map(cat => `
                                <li>
                                    <a href="#/products?category=${cat.id}" class="filter-btn ${activeCatId === cat.id ? 'active' : ''}">
                                        ${this.lang === 'th' ? cat.name_th : cat.name_en}
                                    </a>
                                </li>
                            `).join('')}
                        </ul>
                    </aside>
                    ` : ''}
                    
                    <!-- Right Product Grid -->
                    <main>
        `;

        if (filteredProducts.length === 0) {
            const contactVisible = await this.getSetting('contact_visible', 'true');
            html += `
                <div class="product-empty-state" style="text-align:center; padding:80px 20px; border:1px dashed var(--border-color); border-radius:var(--radius-lg); background:var(--bg-main);">
                    <i class="fas fa-box-open" style="font-size:3rem; color:var(--text-muted); margin-bottom:16px;"></i>
                    <p style="color:var(--text-muted); margin-bottom:16px; font-weight:500;">${this.t('products_empty')}</p>
                    ${contactVisible !== 'false' ? `
                        <a href="#/contact" class="btn btn-primary" style="font-size:0.9rem; display:inline-flex; align-items:center; gap:8px;">
                            <i class="fas fa-envelope"></i> ${this.t('products_empty_link')}
                        </a>
                    ` : ''}
                </div>
            `;
        } else {
            html += `
                <div class="product-grid">
            `;

            filteredProducts.forEach(prod => {
                const specVolume = this.lang === 'th' ? (prod.spec_volume_th || prod.volume || '') : (prod.spec_volume_en || prod.volume || '');
                const showPrice = prod.show_price !== false && prod.price;

                html += `
                    <div class="product-card" onclick="window.charoenApp.openProductDetails('${prod.id}')">
                        <div class="product-image-box">
                            ${prod.image_src ? `<img src="${prod.image_src}" alt="${prod.name_th}">` : `<i class="fas fa-box" style="font-size:3rem; color:var(--text-muted);"></i>`}
                        </div>
                        <div class="product-info">
                            <div class="product-name">${this.lang === 'th' ? prod.name_th : prod.name_en}</div>
                            <div class="product-spec-brief">${specVolume ? `${this.lang === 'th' ? 'ขนาด' : 'Size'} ${specVolume}` : ''} | ${this.lang === 'th' ? 'ปาก' : 'Dia'} ${prod.spec_diameter || '95/98'} ${this.lang === 'th' ? 'มม.' : 'mm'}.</div>
                            <div class="product-footer">
                                <span class="product-price">${showPrice ? `฿${prod.price}` : (this.lang === 'th' ? 'ขั้นต่ำ 1,000 ใบ' : 'Min. 1,000 pcs')}</span>
                                <span class="product-cta">${this.t('cta_view_details')} <i class="fas fa-arrow-right"></i></span>
                            </div>
                        </div>
                    </div>
                `;
            });

            html += `
                </div>
            `;
        }

        html += `
                    </main>
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    async renderPortfolioView(container, params) {
        const categories = await this.db.getAll('categories');
        const portfolio = await this.db.getAll('portfolio');

        // Filter visible and sort by order
        const visiblePortfolio = portfolio
            .filter(item => item.visible !== false && item.visible !== 'false')
            .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

        // Calculate category counts once in a single pre-rendering pass
        const counts = { all: visiblePortfolio.length };
        visiblePortfolio.forEach(item => {
            if (item.category) {
                counts[item.category] = (counts[item.category] || 0) + 1;
            }
        });

        const activeCatId = params?.get('category') || 'all';
        const filteredPortfolio = activeCatId === 'all'
            ? visiblePortfolio 
            : visiblePortfolio.filter(item => item.category === activeCatId);

        let html = `
            <div class="subpage-hero-banner" style="background-image: url('portfolio_banner.webp')">
                <div class="container">
                    <h2>${this.t('nav_portfolio')}</h2>
                    <p>${this.lang === 'th' ? 'รวมภาพตัวอย่างผลงานสกรีนจริงจากแบรนด์เครื่องดื่มและร้านกาแฟชั้นนำทั่วประเทศ' : 'Real-world screen printing portfolio from leading beverage brands & cafes.'}</p>
                </div>
            </div>
            
            <div class="container portfolio-layout">
                <div class="search-filter-bar">
                    <div class="category-filter-pills" role="tablist" aria-label="${this.lang === 'th' ? 'เลือกหมวดหมู่ผลงาน' : 'Select portfolio category'}">
                        <a href="#/portfolio?category=all" class="pill ${activeCatId === 'all' ? 'active' : ''}" role="tab" aria-selected="${activeCatId === 'all' ? 'true' : 'false'}" aria-label="${this.lang === 'th' ? 'ทั้งหมด ' + counts.all + ' รายการ' : 'All ' + counts.all + ' items'}">
                            ${this.t('portfolio_all')} (${counts.all})
                        </a>
        `;

        categories.forEach(cat => {
            const count = counts[cat.id] || 0;
            const catName = this.lang === 'th' ? cat.name_th : cat.name_en;
            html += `
                <a href="#/portfolio?category=${cat.id}" class="pill ${activeCatId === cat.id ? 'active' : ''}" role="tab" aria-selected="${activeCatId === cat.id ? 'true' : 'false'}" aria-label="${catName} ${count} ${this.lang === 'th' ? 'รายการ' : 'items'}">
                    ${catName} (${count})
                </a>
            `;
        });

        html += `
                    </div>
                </div>
        `;

        if (filteredPortfolio.length === 0) {
            const contactVisible = await this.getSetting('contact_visible', 'true');
            html += `
                <div style="text-align:center; padding:80px 20px; border:1px dashed var(--border-color); border-radius:var(--radius-lg); background:var(--bg-main);">
                    <i class="fas fa-images" style="font-size:3rem; color:var(--text-muted); margin-bottom:16px;"></i>
                    <p style="color:var(--text-muted); margin-bottom:16px; font-weight:500;">${this.t('portfolio_empty')}</p>
                    ${contactVisible !== 'false' ? `
                        <a href="#/contact" class="btn btn-primary" style="font-size:0.9rem; display:inline-flex; align-items:center; gap:8px;">
                            <i class="fas fa-envelope"></i> ${this.lang === 'th' ? 'ติดต่อเรา' : 'Contact Us'}
                        </a>
                    ` : ''}
                </div>
            `;
        } else {
            html += `
                <div class="portfolio-grid">
            `;

            filteredPortfolio.forEach(item => {
                const catObj = categories.find(c => c.id === item.category);
                const catName = catObj ? (this.lang === 'th' ? catObj.name_th : catObj.name_en) : '';

                // Safely count gallery images
                let galleryCount = 0;
                let productImages = [];
                if (item.image_src) {
                    productImages.push(item.image_src);
                }
                if (item.gallery_images) {
                    let parsedGallery = [];
                    if (Array.isArray(item.gallery_images)) {
                        parsedGallery = item.gallery_images;
                    } else if (typeof item.gallery_images === 'string') {
                        try {
                            parsedGallery = JSON.parse(item.gallery_images);
                        } catch(e) {}
                    }
                    parsedGallery.forEach(img => {
                        if (img && !productImages.includes(img)) {
                            productImages.push(img);
                        }
                    });
                }
                galleryCount = productImages.length;

                // Validate description text
                const rawDesc = this.lang === 'th' ? (item.desc_th || item.description_th) : (item.desc_en || item.description_en);
                const descText = rawDesc && String(rawDesc).trim().toLowerCase() !== 'null' && String(rawDesc).trim().toLowerCase() !== 'undefined' ? String(rawDesc).trim() : '';

                // Helper to validate generic string
                const isValidString = (val) => {
                    if (!val) return false;
                    const s = String(val).trim().toLowerCase();
                    return s !== '' && s !== 'null' && s !== 'undefined';
                };

                html += `
                    <div class="portfolio-card" onclick="window.charoenApp.openPortfolioDetails('${item.id}')" tabindex="0" role="button" aria-label="${this.lang === 'th' ? 'ดูรายละเอียดผลงาน ' + (item.title_th || '') : 'View details of ' + (item.title_en || '')}" onkeydown="if(event.key === 'Enter' || event.key === ' ') { event.preventDefault(); window.charoenApp.openPortfolioDetails('${item.id}'); }">
                        <div class="portfolio-card-image-wrapper">
                            <img class="portfolio-card-image" src="${item.image_src || 'coffee_bg.webp'}" alt="${this.lang === 'th' ? item.title_th : item.title_en}" loading="lazy" onerror="this.src='coffee_bg.webp';">
                        </div>
                        
                        ${galleryCount > 1 ? `
                            <div class="portfolio-card-badge-container">
                                <span class="portfolio-card-count-badge">
                                    <i class="fas fa-images"></i> ${galleryCount} ${this.lang === 'th' ? 'รูป' : 'Photos'}
                                </span>
                            </div>
                        ` : ''}

                        <div class="portfolio-card-overlay">
                            ${isValidString(catName) ? `<span class="portfolio-card-category">${catName}</span>` : ''}
                            <h3 class="portfolio-card-title">${this.lang === 'th' ? item.title_th : item.title_en}</h3>
                            ${isValidString(descText) ? `<p class="portfolio-card-desc">${descText}</p>` : ''}
                            
                            <div class="portfolio-card-cta">
                                <span>${this.lang === 'th' ? 'ดูผลงาน' : 'View Project'}</span>
                                <i class="fas fa-arrow-right"></i>
                            </div>
                        </div>
                    </div>
                `;
            });

            html += `
                </div>
            `;
        }

        html += `
            </div>
        `;

        container.innerHTML = html;

        // Guarded mobile viewport scroll auto-centering
        if (window.innerWidth <= 768) {
            setTimeout(() => {
                const activePill = container.querySelector('.pill.active');
                if (activePill) {
                    activePill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }
            }, 150);
        }
    }

    async renderQuoteView(container) {
        const categories = await this.db.getAll('categories');

        let html = `
            <div class="container quote-layout">
                <div class="quote-card-form">
                    <div class="text-center">
                        <i class="fas fa-file-invoice-dollar" style="font-size:3rem; color:var(--primary); margin-bottom:16px;"></i>
                        <h2 style="font-size:1.8rem; font-weight:800; color:var(--secondary);">${this.t('quote_title')}</h2>
                        <p style="color:var(--text-muted); margin-top:8px;">${this.t('quote_sub')}</p>
                    </div>
                    
                    <form id="quote-request-form">
                        <div class="form-grid">
                            <div class="form-group col-span-2">
                                <label for="quote-name">${this.t('form_name')} <span style="color:var(--danger)">*</span></label>
                                <input type="text" id="quote-name" class="form-control" placeholder="${this.lang === 'th' ? 'เช่น คุณสมชาย (หรือ ร้านกาแฟออนคัพ)' : 'e.g. John Doe (or Cafe Name)'}" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="quote-phone">${this.t('form_phone')} <span style="color:var(--danger)">*</span></label>
                                <input type="tel" id="quote-phone" class="form-control" placeholder="${this.lang === 'th' ? 'เช่น 095-xxx-xxxx' : 'e.g. 095-xxx-xxxx'}" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="quote-line">${this.t('form_line')} <span style="color:var(--danger)">*</span></label>
                                <input type="text" id="quote-line" class="form-control" placeholder="${this.lang === 'th' ? 'เช่น line_id หรือ @line' : 'e.g. line_id or @line'}" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="quote-prod-type">${this.t('form_product_type')} <span style="color:var(--danger)">*</span></label>
                                <select id="quote-prod-type" class="form-control" style="appearance:auto;" required>
                                    <option value="" disabled selected>-- ${this.lang === 'th' ? 'เลือกประเภทบรรจุภัณฑ์' : 'Select Packaging Type'} --</option>
        `;

        categories.forEach(cat => {
            html += `
                <option value="${cat.id}">${this.lang === 'th' ? cat.name_th : cat.name_en}</option>
            `;
        });

        html += `
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="quote-qty">${this.t('form_qty')} <span style="color:var(--danger)">*</span></label>
                                <input type="number" id="quote-qty" class="form-control" placeholder="${this.lang === 'th' ? 'ระบุจำนวน (ขั้นต่ำ 1,000 ใบ)' : 'Specify quantity (Min. 1,000 pcs)'}" min="1000" required>
                            </div>
                            
                            <div class="form-group col-span-2">
                                <label for="quote-details">${this.t('form_details')}</label>
                                <textarea id="quote-details" class="form-control" style="min-height:100px; resize:vertical;" placeholder="${this.lang === 'th' ? 'เช่น แก้ว PET ทรงแคปซูล ขนาด 16 ออนซ์ ต้องการพิมพ์สกรีน 1 สี หรือสเปกงานที่คุณสนใจ' : 'e.g. 16oz PET Capsule cup, 1-color custom printing, and other details.'}"></textarea>
                            </div>
                            
                            <div class="form-group col-span-2">
                                <label for="quote-logo-file">${this.t('form_file')}</label>
                                <div class="file-upload-zone" onclick="document.getElementById('quote-logo-file').click()">
                                    <i class="fas fa-upload" style="font-size:1.8rem; color:var(--primary); margin-bottom:10px;"></i>
                                    <p id="file-zone-text">${this.lang === 'th' ? 'คลิกเพื่อเลือกไฟล์รูปภาพโลโก้ของคุณ (PNG, JPG, WEBP)' : 'Click to select your logo file (PNG, JPG, WEBP)'}</p>
                                    <input type="file" id="quote-logo-file" accept="image/*" style="display:none;">
                                </div>
                                <div id="file-preview-container" style="display:none; margin-top:15px; text-align:center;">
                                    <img id="logo-file-preview" style="max-height:120px; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
                                </div>
                            </div>
                        </div>
                        
                        <button type="submit" class="btn btn-primary" style="width:100%; padding:15px; margin-top:20px; font-size:1.05rem;"><i class="fas fa-paper-plane"></i> ${this.t('form_submit')}</button>
                    </form>
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Setup File Upload Preview
        const fileInput = document.getElementById('quote-logo-file');
        const fileText = document.getElementById('file-zone-text');
        const previewImg = document.getElementById('logo-file-preview');
        const previewCont = document.getElementById('file-preview-container');

        let logoBase64 = '';

        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                fileText.textContent = `${this.lang === 'th' ? 'เลือกไฟล์แล้ว:' : 'Selected file:'} ${file.name}`;
                const reader = new FileReader();
                reader.onload = (event) => {
                    logoBase64 = event.target.result;
                    previewImg.src = logoBase64;
                    previewCont.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        };

        // Form Submit
        const form = document.getElementById('quote-request-form');
        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                const name = document.getElementById('quote-name').value;
                const phone = document.getElementById('quote-phone').value;
                const line = document.getElementById('quote-line').value;
                const prodType = document.getElementById('quote-prod-type').value;
                const qty = document.getElementById('quote-qty').value;
                const details = document.getElementById('quote-details').value;

                try {
                    const quoteObj = {
                        id: 'quote_' + Date.now(),
                        name: name,
                        phone: phone,
                        line: line,
                        product_type: prodType,
                        qty: qty,
                        details: details,
                        image_src: logoBase64,
                        date: new Date().toLocaleString()
                    };

                    await this.db.put('quotes', quoteObj);
                    this.showSuccessModal();
                    form.reset();
                    previewCont.style.display = 'none';
                    logoBase64 = '';
                    fileText.textContent = this.lang === 'th' ? 'คลิกเพื่อเลือกไฟล์รูปภาพโลโก้ของคุณ (PNG, JPG, WEBP)' : 'Click to select your logo file (PNG, JPG, WEBP)';
                } catch (err) {
                    alert(this.lang === 'th' ? "เกิดข้อผิดพลาดในการส่งข้อมูลคำขอ: " + err.message : "Error submitting request: " + err.message);
                }
            };
        }
    }

    async renderContactView(container) {
        const contactVisible = await this.getSetting('contact_visible', 'true');
        if (contactVisible === 'false') {
            container.innerHTML = `
                <div class="container text-center" style="padding:120px 20px; font-family:'Kanit', sans-serif;">
                    <div style="font-size:4rem; color:var(--text-muted); margin-bottom:20px;"><i class="fas fa-eye-slash"></i></div>
                    <h2 style="font-weight:700; color:var(--secondary); margin-bottom:15px;">${this.lang === 'th' ? 'ขออภัย หน้านี้ไม่เปิดให้บริการชั่วคราว' : 'Page Temporarily Unavailable'}</h2>
                    <p style="color:var(--text-sec); max-width:500px; margin:0 auto 30px auto; line-height:1.6;">${this.lang === 'th' ? 'ช่องทางการติดต่อสื่อสารกำลังอยู่ในระหว่างปรับปรุงข้อมูลโดยระบบบริหารจัดการเว็บไซต์' : 'The contact channels are currently being updated by the administrator.'}</p>
                    <a href="#/home" class="btn btn-primary"><i class="fas fa-home"></i> ${this.lang === 'th' ? 'กลับสู่หน้าหลัก' : 'Back to Home'}</a>
                </div>
            `;
            return;
        }

        const phone = await this.getSetting('phone');
        const email = await this.getSetting('email');
        const address = await this.getSetting(this.lang === 'th' ? 'address_th' : 'address_en') || await this.getSetting('address_th');
        const hours = await this.getSetting(this.lang === 'th' ? 'business_hours_th' : 'business_hours_en') || await this.getSetting('business_hours_th');
        
        const contactTitle = await this.getSetting(this.lang === 'th' ? 'contact_title_th' : 'contact_title_en') || await this.getSetting('contact_title_th') || (this.lang === 'th' ? 'ช่องทางการติดต่อสอบถามและขอราคา' : 'Contact Methods & Customer Support');
        const contactDesc = await this.getSetting(this.lang === 'th' ? 'contact_description_th' : 'contact_description_en') || await this.getSetting('contact_description_th');

        const mapsUrl = await this.getSetting('google_maps_url');
        const mapsEmbedUrl = await this.getSetting('google_maps_embed_url');
        const lineUrl = await this.getSetting('line_url');
        const lineQrImage = await this.getSetting('line_qr_image');
        const lineQrVisible = await this.getSetting('line_qr_visible', 'true');

        const facebookUrl = await this.getSetting('facebook_url');
        const facebookVisible = await this.getSetting('facebook_visible', 'true');
        const instagramUrl = await this.getSetting('instagram_url');
        const instagramVisible = await this.getSetting('instagram_visible', 'true');
        const tiktokUrl = await this.getSetting('tiktok_url');
        const tiktokVisible = await this.getSetting('tiktok_visible', 'true');
        const youtubeUrl = await this.getSetting('youtube_url');
        const youtubeVisible = await this.getSetting('youtube_visible', 'true');
        const lineVisible = await this.getSetting('line_visible', 'true');

        let contactItemsHtml = '';
        if (phone) {
            const cleanPhone = phone.replace(/[^0-9+]/g, '');
            contactItemsHtml += `
                <li style="display:flex; align-items:center; gap:16px;">
                    <div style="width:44px; height:44px; background-color:var(--primary-light); color:var(--primary); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.2rem;"><i class="fas fa-phone-alt"></i></div>
                    <div>
                        <span style="display:block; font-size:0.8rem; color:var(--text-muted); font-weight:700;">${this.lang === 'th' ? 'เบอร์โทรศัพท์สายด่วน' : 'Hotline Number'}</span>
                        <a href="tel:${cleanPhone}" style="font-weight:700; font-size:1.15rem; color:var(--secondary); text-decoration:none;">${phone}</a>
                    </div>
                </li>
            `;
        }

        if (email) {
            contactItemsHtml += `
                <li style="display:flex; align-items:center; gap:16px;">
                    <div style="width:44px; height:44px; background-color:#fee2e2; color:var(--danger); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.2rem;"><i class="fas fa-envelope"></i></div>
                    <div>
                        <span style="display:block; font-size:0.8rem; color:var(--text-muted); font-weight:700;">Email Address</span>
                        <a href="mailto:${email}" style="font-weight:700; font-size:1.1rem; color:var(--secondary); text-decoration:none;">${email}</a>
                    </div>
                </li>
            `;
        }

        if (hours) {
            contactItemsHtml += `
                <li style="display:flex; align-items:center; gap:16px;">
                    <div style="width:44px; height:44px; background-color:var(--bg-sec); color:var(--primary); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.2rem;"><i class="far fa-clock"></i></div>
                    <div>
                        <span style="display:block; font-size:0.8rem; color:var(--text-muted); font-weight:700;">${this.lang === 'th' ? 'เวลาทำการ' : 'Business Hours'}</span>
                        <span style="font-weight:700; font-size:1rem; color:var(--text-main);">${hours}</span>
                    </div>
                </li>
            `;
        }

        let socialsHtml = '';
        if (lineUrl && lineVisible !== 'false') {
            socialsHtml += `
                <li style="display:flex; align-items:center; gap:16px;">
                    <div style="width:44px; height:44px; background-color:#e6f9eb; color:#10b981; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.2rem;"><i class="fab fa-line"></i></div>
                    <div>
                        <span style="display:block; font-size:0.8rem; color:var(--text-muted); font-weight:700;">LINE Official</span>
                        <a href="${lineUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="padding:6px 12px; font-size:0.8rem; font-weight:700; border-color:#10b981; color:#10b981; text-decoration:none; margin-top:4px; display:inline-flex; align-items:center; gap:6px; border-radius:var(--radius-sm);">
                            <i class="fab fa-line"></i> เพิ่มเพื่อนทาง LINE
                        </a>
                    </div>
                </li>
            `;
        }

        if (facebookUrl && facebookVisible !== 'false') {
            socialsHtml += `
                <li style="display:flex; align-items:center; gap:16px;">
                    <div style="width:44px; height:44px; background-color:var(--secondary-light); color:var(--secondary); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.2rem;"><i class="fab fa-facebook-f"></i></div>
                    <div>
                        <span style="display:block; font-size:0.8rem; color:var(--text-muted); font-weight:700;">Facebook Page</span>
                        <a href="${facebookUrl}" target="_blank" rel="noopener noreferrer" style="font-weight:700; font-size:1rem; color:var(--secondary); text-decoration:none; display:inline-block; margin-top:4px;">
                            <i class="fab fa-facebook-square"></i> ${this.lang === 'th' ? 'เปิดเพจ Facebook' : 'Open Facebook Page'}
                        </a>
                    </div>
                </li>
            `;
        }

        if (instagramUrl && instagramVisible === 'true') {
            socialsHtml += `
                <li style="display:flex; align-items:center; gap:16px;">
                    <div style="width:44px; height:44px; background-color:#fdf2f8; color:#db2777; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.2rem;"><i class="fab fa-instagram"></i></div>
                    <div>
                        <span style="display:block; font-size:0.8rem; color:var(--text-muted); font-weight:700;">Instagram</span>
                        <a href="${instagramUrl}" target="_blank" rel="noopener noreferrer" style="font-weight:700; font-size:1.05rem; color:#db2777; text-decoration:none;">Instagram</a>
                    </div>
                </li>
            `;
        }

        if (tiktokUrl && tiktokVisible === 'true') {
            socialsHtml += `
                <li style="display:flex; align-items:center; gap:16px;">
                    <div style="width:44px; height:44px; background-color:var(--bg-sec); color:var(--text-main); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.2rem;"><i class="fab fa-tiktok"></i></div>
                    <div>
                        <span style="display:block; font-size:0.8rem; color:var(--text-muted); font-weight:700;">TikTok</span>
                        <a href="${tiktokUrl}" target="_blank" rel="noopener noreferrer" style="font-weight:700; font-size:1.05rem; color:var(--text-main); text-decoration:none;">TikTok</a>
                    </div>
                </li>
            `;
        }

        if (youtubeUrl && youtubeVisible === 'true') {
            socialsHtml += `
                <li style="display:flex; align-items:center; gap:16px;">
                    <div style="width:44px; height:44px; background-color:#fff5f5; color:#e53e3e; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.2rem;"><i class="fab fa-youtube"></i></div>
                    <div>
                        <span style="display:block; font-size:0.8rem; color:var(--text-muted); font-weight:700;">YouTube</span>
                        <a href="${youtubeUrl}" target="_blank" rel="noopener noreferrer" style="font-weight:700; font-size:1.05rem; color:#e53e3e; text-decoration:none;">YouTube</a>
                    </div>
                </li>
            `;
        }

        let lineQrCardHtml = '';
        if (lineQrImage && lineQrVisible !== 'false') {
            lineQrCardHtml = `
                <div class="line-qr-card-box" style="background-color:var(--bg-sec); border-radius:var(--radius-lg); padding:24px; border:1px solid var(--border-color); text-align:center; display:flex; flex-direction:column; align-items:center; justify-content:center; margin-top:30px;">
                    <h5 style="font-size:1.05rem; font-weight:700; margin-top:0; margin-bottom:12px; color:var(--primary); font-family:'Kanit', sans-serif;"><i class="fas fa-qrcode"></i> LINE QR Code</h5>
                    <div style="width:140px; height:140px; background:white; border:1px solid var(--border-color); border-radius:var(--radius-md); padding:8px; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:var(--shadow-sm);" onclick="window.openLineQrModal('${lineQrImage}')" title="${this.lang === 'th' ? 'คลิกขยายรูป QR Code' : 'Click to enlarge QR Code'}">
                        <img src="${lineQrImage}" style="max-width:100%; max-height:100%; object-fit:contain;" onerror="const card = this.closest('.line-qr-card-box'); if (card) card.style.display='none';">
                    </div>
                    <span style="font-size:0.75rem; color:var(--text-sec); margin-top:8px; display:block;">${this.lang === 'th' ? 'คลิกที่ QR Code เพื่อสแกนแอดไลน์' : 'Click QR Code to Scan & Add LINE'}</span>
                </div>
            `;
        }

        let mapAreaHtml = '';
        let mapInnerHtml = '';
        if (mapsEmbedUrl) {
            mapInnerHtml += `
                <div style="position:relative; width:100%; height:320px; border-radius:var(--radius-md); overflow:hidden; border:1px solid var(--border-color); margin-bottom:20px; background-color:#e2e8f0;">
                    <iframe src="${mapsEmbedUrl}" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                </div>
            `;
        }
        if (mapsUrl) {
            mapInnerHtml += `
                <div style="text-align:center;">
                    <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="width:100%; display:inline-flex; justify-content:center; align-items:center; gap:8px; padding:12px; font-weight:700;">
                        <i class="fas fa-location-arrow"></i> ${this.lang === 'th' ? 'เปิดใน Google Maps' : 'Open in Google Maps'}
                    </a>
                </div>
            `;
        }
        if (mapInnerHtml) {
            mapAreaHtml = `
                <div style="background-color:var(--bg-sec); border-radius:var(--radius-lg); padding:30px; border:1px solid var(--border-color); height:100%;">
                    <h4 style="font-size:1.2rem; font-weight:700; color:var(--secondary); margin-bottom:20px; border-bottom:2px solid var(--primary); padding-bottom:8px;"><i class="fas fa-map-marked-alt"></i> ${this.lang === 'th' ? 'แผนที่ตั้งโรงงานสกรีน' : 'Factory Map Location'}</h4>
                    ${address ? `<p style="font-size:0.95rem; margin-bottom:20px; line-height:1.6;"><i class="fas fa-home" style="color:var(--primary)"></i> <strong>${this.lang === 'th' ? 'ที่อยู่:' : 'Address:'}</strong> ${address}</p>` : ''}
                    ${mapInnerHtml}
                </div>
            `;
        }

        const descHtml = contactDesc ? `<p style="line-height:1.75; color:var(--text-sec); margin-bottom:30px;">${contactDesc}</p>` : '';

        container.innerHTML = `
            <div class="subpage-hero-banner" style="background-image: url('contact_banner.webp')">
                <div class="container">
                    <h2>${this.t('nav_contact')}</h2>
                    <p>${this.lang === 'th' ? 'ยินดีให้คำปรึกษาและออกแบบแก้วฟรี พร้อมบริการส่งด่วนทั่วประเทศ' : 'Get free design consultations and packaging mockups with nationwide delivery.'}</p>
                </div>
            </div>
            
            <section class="section-padding">
                <div class="container">
                    <div class="grid-2" style="gap:50px;">
                        <div>
                            <h3 style="font-size:1.8rem; font-weight:800; color:var(--secondary); margin-bottom:24px;">${contactTitle}</h3>
                            ${descHtml}
                            
                            <h4 style="font-size:1.15rem; font-weight:700; color:var(--primary); margin-bottom:15px; border-bottom:1px solid var(--border-color); padding-bottom:6px;"><i class="fas fa-info-circle"></i> ช่องทางติดต่อ (Contact Channels)</h4>
                            <ul style="list-style:none; display:flex; flex-direction:column; gap:20px; padding-left:0; margin-bottom:35px;">
                                ${contactItemsHtml}
                            </ul>

                            ${socialsHtml ? `
                                <h4 style="font-size:1.15rem; font-weight:700; color:var(--primary); margin-bottom:15px; border-bottom:1px solid var(--border-color); padding-bottom:6px;"><i class="fas fa-share-alt"></i> สื่อสังคมออนไลน์ (Social Networks)</h4>
                                <ul style="list-style:none; display:flex; flex-direction:column; gap:20px; padding-left:0; margin-bottom:20px;">
                                    ${socialsHtml}
                                </ul>
                            ` : ''}

                            ${lineQrCardHtml}
                        </div>
                        
                        <div>
                            ${mapAreaHtml}
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    async renderFaqView(container) {
        let faqs = [];
        try {
            faqs = await this.db.getAll('faq');
        } catch (e) {
            console.warn("Could not load FAQs:", e);
        }

        // Sort by order ascending
        const sortedFaqs = [...faqs]
            .filter(f => f.visible !== false && f.visible !== 'false')
            .sort((a, b) => (a.order || 0) - (b.order || 0));

        let faqsHtml = '';
        if (sortedFaqs.length > 0) {
            faqsHtml = sortedFaqs.map((faq, idx) => `
                <div class="faq-accordion-item" style="background:var(--bg-main); border:1px solid var(--border-color); border-radius:var(--radius-md); overflow:hidden;">
                    <button class="faq-accordion-header" style="width:100%; border:none; background:none; text-align:left; padding:20px 24px; display:flex; justify-content:space-between; align-items:center; cursor:pointer; font-family:'Kanit', sans-serif; transition:var(--transition); outline:none;">
                        <h4 style="font-weight:700; color:var(--secondary); font-size:1.1rem; margin:0; display:flex; align-items:center; gap:10px; line-height:1.4;">
                            <i class="fas fa-question-circle" style="color:var(--primary)"></i> ${this.lang === 'th' ? (faq.question_th || faq.question_en) : (faq.question_en || faq.question_th)}
                        </h4>
                        <span class="faq-accordion-icon" style="transition: transform 0.3s ease; color:var(--text-sec); margin-left:12px; display:flex; align-items:center; justify-content:center;"><i class="fas fa-plus"></i></span>
                    </button>
                    <div class="faq-accordion-content" style="max-height:0; overflow:hidden; transition: max-height 0.3s ease-out; background:rgba(0,0,0,0.015);">
                        <p style="color:var(--text-sec); line-height:1.75; font-size:0.96rem; padding: 0 24px 24px 24px; margin:0;">
                            ${this.lang === 'th' ? (faq.answer_th || faq.answer_en) : (faq.answer_en || faq.answer_th)}
                        </p>
                    </div>
                </div>
            `).join('');
        } else {
            // Fallback default hardcoded questions in case it is completely empty
            const defaults = [
                {
                    q_th: 'ขั้นต่ำในการสั่งผลิตสกรีนกี่ใบ?',
                    q_en: 'What is the minimum order quantity (MOQ) for custom printing?',
                    a_th: 'ร้านกาแฟทุกระดับเริ่มต้นสั่งสกรีนเพียง 1,000 ใบเท่านั้นสำหรับการสกรีน 1 สี ซึ่งเป็นขั้นต่ำที่น้อยที่สุดเพื่อเอื้อต่อแบรนด์เปิดใหม่ให้ไม่ต้องรับภาระพื้นที่จัดเก็บในร้าน',
                    a_en: 'For standard 1-color screen printing, our MOQ starts at just 1,000 pcs. This is perfect for newly opened cafes and coffee shops looking to keep inventory low and save storage space.'
                },
                {
                    q_th: 'มีค่าบล็อกพิมพ์หรือค่าใช้จ่ายแอบแฝงไหม?',
                    q_en: 'Are there any setup fees or hidden plate block charges?',
                    a_th: 'เราคิดราคาโรงงานตรงไปตรงมา ไม่มีค่าบล็อกพิมพ์หรือค่าธรรมเนียมออกแบบแอบแฝง ลูกค้าสามารถวางแผนและควบคุมต้นทุนของแก้วพิมพ์สกรีนต่อใบได้อย่างแม่นยำ 100%',
                    a_en: 'We offer direct factory pricing with no hidden plate setup fees or mold blocks fees. You will only pay the price per cup quoted, making it 100% transparent for your drink budget calculations.'
                },
                {
                    q_th: 'ใช้ระยะเวลานานเท่าไหร่ในการสกรีน?',
                    q_en: 'How long does the cup printing process take?',
                    a_th: 'โดยปกติหลังจากลูกค้ายืนยันความถูกต้องของแบบดิจิตอล 3D เรียบร้อยแล้ว จะใช้เวลาในการพิมพ์สกรีนจริงประมาณ 5 - 7 วันทำการก่อนส่งมอบสินค้าทั่วประเทศครับ',
                    a_en: 'Normally, after confirming the 3D digital mockup draft, production takes approximately 5 to 7 business days depending on queue before immediate dispatch to your location.'
                },
                {
                    q_th: 'ถ้าไม่มีไฟล์ออกแบบโลโก้จะสกรีนได้ไหม?',
                    q_en: 'Can you design a logo for me if I do not have design files?',
                    a_th: 'ไม่มีปัญหาครับ! หากลูกค้ามีเพียงไฟล์รูปถ่ายโลโก้ หรือแบบวาดร่าง ทีมดีไซเนอร์ของเรายินดีจัดระเบียบวาดดราฟต์ให้ใหม่และขึ้นตัวอย่าง 3D ให้ตรวจสอบได้ฟรีก่อนเข้าสู่การผลิต',
                    a_en: 'Yes, absolutely! Even if you only have a draft image, logo sketch, or photo, our designer team will help draft and clean the layout, presenting a free 3D digital mockup review before production starts.'
                }
            ];
            faqsHtml = defaults.map((faq, idx) => `
                <div class="faq-accordion-item" style="background:var(--bg-main); border:1px solid var(--border-color); border-radius:var(--radius-md); overflow:hidden;">
                    <button class="faq-accordion-header" style="width:100%; border:none; background:none; text-align:left; padding:20px 24px; display:flex; justify-content:space-between; align-items:center; cursor:pointer; font-family:'Kanit', sans-serif; transition:var(--transition); outline:none;">
                        <h4 style="font-weight:700; color:var(--secondary); font-size:1.1rem; margin:0; display:flex; align-items:center; gap:10px; line-height:1.4;">
                            <i class="fas fa-question-circle" style="color:var(--primary)"></i> ${this.lang === 'th' ? faq.q_th : faq.q_en}
                        </h4>
                        <span class="faq-accordion-icon" style="transition: transform 0.3s ease; color:var(--text-sec); margin-left:12px; display:flex; align-items:center; justify-content:center;"><i class="fas fa-plus"></i></span>
                    </button>
                    <div class="faq-accordion-content" style="max-height:0; overflow:hidden; transition: max-height 0.3s ease-out; background:rgba(0,0,0,0.015);">
                        <p style="color:var(--text-sec); line-height:1.75; font-size:0.96rem; padding: 0 24px 24px 24px; margin:0;">
                            ${this.lang === 'th' ? faq.a_th : faq.a_en}
                        </p>
                    </div>
                </div>
            `).join('');
        }

        container.innerHTML = `
            <div class="subpage-hero-banner" style="background-image: url('faq_banner.webp')">
                <div class="container">
                    <h2>${this.t('nav_faq')}</h2>
                    <p>${this.lang === 'th' ? 'คำถามที่พบบ่อยเกี่ยวกับการสกรีนแก้ว ขั้นต่ำ ระยะเวลาผลิต และการขนส่งสำหรับแบรนด์คาเฟ่' : 'Frequently Asked Questions about cup custom screen printing, MOQs, lead times, and logistics.'}</p>
                </div>
            </div>
            
            <section class="section-padding">
                <div class="container" style="max-width:800px;">
                    <div style="display:flex; flex-direction:column; gap:20px;">
                        ${faqsHtml}
                    </div>
                </div>
            </section>
        `;

        // Bind accordion animation listeners
        const headers = container.querySelectorAll('.faq-accordion-header');
        headers.forEach(header => {
            header.onclick = () => {
                const content = header.nextElementSibling;
                const icon = header.querySelector('.faq-accordion-icon i');
                const isOpen = content.style.maxHeight && content.style.maxHeight !== '0px';
                
                // Close all others for a clean single-accordion look
                container.querySelectorAll('.faq-accordion-content').forEach(c => {
                    c.style.maxHeight = '0px';
                });
                container.querySelectorAll('.faq-accordion-icon i').forEach(i => {
                    i.className = 'fas fa-plus';
                    i.parentElement.style.transform = 'rotate(0deg)';
                });
                
                if (!isOpen) {
                    content.style.maxHeight = content.scrollHeight + 'px';
                    icon.className = 'fas fa-minus';
                    icon.parentElement.style.transform = 'rotate(180deg)';
                }
            };
        });
    }

    async openProductDetails(id) {
        const prod = await this.db.get('products', id);
        const categories = await this.db.getAll('categories');
        if (!prod) return;

        const catObj = categories.find(c => c.id === prod.category);
        const catName = catObj ? (this.lang === 'th' ? catObj.name_th : catObj.name_en) : '';

        // Save active element for focus restoration
        this.modalTriggerElement = document.activeElement;

        // Manage body scroll locking state
        this.previousBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        // Keyboard Escape key closure listener
        this.modalEscapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeActiveModal();
            }
        };
        document.addEventListener('keydown', this.modalEscapeHandler);

        // Parse gallery & single images safely
        let productImages = [];
        if (prod.image_src) {
            productImages.push(prod.image_src);
        }
        if (prod.gallery_images) {
            let parsedGallery = [];
            if (Array.isArray(prod.gallery_images)) {
                parsedGallery = prod.gallery_images;
            } else if (typeof prod.gallery_images === 'string') {
                try {
                    parsedGallery = JSON.parse(prod.gallery_images);
                } catch(e) {}
            }
            parsedGallery.forEach(img => {
                if (img && !productImages.includes(img)) {
                    productImages.push(img);
                }
            });
        }
        const mainImage = productImages[0] || '';

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'product-modal';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-labelledby', 'modal-product-title');

        // Check toggles for spec elements visibility
        const showMat = prod.show_material !== false;
        const showVol = prod.show_volume !== false;
        const showDia = prod.show_diameter !== false;
        const showMin = prod.show_min_qty !== false;
        const showPrice = prod.show_price !== false && prod.price;

        const specVolume = this.lang === 'th' ? (prod.spec_volume_th || prod.volume || '') : (prod.spec_volume_en || prod.volume || '');

        let specRowsHtml = '';
        if (showMat && prod.spec_material) {
            specRowsHtml += `
                <tr>
                    <td>${this.t('detail_material')}</td>
                    <td>${prod.spec_material}</td>
                </tr>
            `;
        }
        if (showVol && specVolume) {
            specRowsHtml += `
                <tr>
                    <td>${this.t('detail_volume')}</td>
                    <td>${specVolume}</td>
                </tr>
            `;
        }
        if (showDia && prod.spec_diameter) {
            specRowsHtml += `
                <tr>
                    <td>${this.t('detail_diameter')}</td>
                    <td>${this.lang === 'th' ? 'ขนาดปากแก้ว' : 'Cup Diameter'} ${prod.spec_diameter} ${this.lang === 'th' ? 'มม.' : 'mm'}.</td>
                </tr>
            `;
        }
        if (showMin && prod.spec_min_qty) {
            specRowsHtml += `
                <tr>
                    <td>${this.t('detail_min_order')}</td>
                    <td>${prod.spec_min_qty}</td>
                </tr>
            `;
        }
        if (showPrice && prod.price) {
            specRowsHtml += `
                <tr>
                    <td>${this.lang === 'th' ? 'ราคาประเมินเบื้องต้น' : 'Estimated Price'}</td>
                    <td><strong>฿${prod.price} / ${this.lang === 'th' ? 'ใบ' : 'pc'}</strong></td>
                </tr>
            `;
        }

        const hasDesc = (this.lang === 'th' ? prod.desc_th : prod.desc_en) || prod.desc_th || prod.desc_en;
        const descText = this.lang === 'th' ? (prod.desc_th || prod.desc_en) : (prod.desc_en || prod.desc_th);

        overlay.innerHTML = `
            <div class="modal-window">
                <button class="modal-close-btn" onclick="window.charoenApp.closeActiveModal()" aria-label="${this.lang === 'th' ? 'ปิดหน้าต่าง' : 'Close modal'}"><i class="fas fa-times"></i></button>
                <div class="product-details-grid">
                    <div class="product-gallery-container">
                        <div class="detail-img-box">
                            <img id="modal-main-image" src="${mainImage || 'coffee_bg.webp'}" alt="${this.lang === 'th' ? prod.name_th : prod.name_en}" style="${mainImage ? '' : 'display:none;'}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                            <div class="fallback-img-box" style="display:${mainImage ? 'none' : 'flex'}; align-items:center; justify-content:center; width:100%; height:100%; min-height:250px;">
                                <i class="fas fa-box" style="font-size:5rem; color:var(--text-muted);"></i>
                            </div>
                        </div>
                        ${productImages.length > 1 ? `
                            <div class="product-thumbnails-scroll-container">
                                <div class="product-thumbnails-wrapper">
                                    ${productImages.map((img, idx) => `
                                        <button class="product-thumbnail-btn ${idx === 0 ? 'active' : ''}" data-src="${img}" aria-label="${this.lang === 'th' ? 'ดูรูปภาพที่ ' : 'View image '}${idx + 1}">
                                            <img src="${img}" alt="Thumbnail ${idx + 1}" onerror="this.closest('.product-thumbnail-btn').style.display='none';">
                                        </button>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    <div class="detail-info-box">
                        ${catName ? `<span class="product-modal-badge">${catName}</span>` : ''}
                        <h3 id="modal-product-title">${this.lang === 'th' ? prod.name_th : prod.name_en}</h3>
                        ${hasDesc ? `<p class="product-modal-desc">${descText}</p>` : ''}
                        
                        ${specRowsHtml ? `
                            <h4 style="font-weight:700; margin-bottom:10px; color:var(--secondary);">${this.t('detail_title')}</h4>
                            <table class="spec-table">
                                ${specRowsHtml}
                            </table>
                        ` : ''}
                        
                        <div class="modal-action-buttons" style="display:flex; gap:12px; margin-top:20px;">
                            <a href="#/quote" class="btn btn-primary" onclick="window.charoenApp.closeActiveModal()">
                                <i class="fas fa-file-invoice-dollar"></i> ${this.lang === 'th' ? 'สอบถามและขอราคา' : 'Get Quote'}
                            </a>
                            <a href="https://line.me/R/ti/p/~${(await this.db.get('settings', 'line'))?.value?.replace('@', '') || 'charoenoncup'}" target="_blank" class="btn btn-outline" style="border-color:#10b981; color:#10b981;">
                                <i class="fab fa-line"></i> ${this.t('cta_inquire')}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        overlay.offsetHeight;
        overlay.classList.add('active');

        // Close on clicking backdrop only
        overlay.onclick = (e) => {
            if (e.target === overlay) this.closeActiveModal();
        };

        // Trap focus inside modal overlay
        overlay.onkeydown = (e) => {
            if (e.key === 'Tab') {
                const focusables = overlay.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                const visibleFocusables = Array.from(focusables).filter(el => {
                    const style = window.getComputedStyle(el);
                    return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetWidth > 0 && el.offsetHeight > 0;
                });
                if (visibleFocusables.length === 0) return;
                const first = visibleFocusables[0];
                const last = visibleFocusables[visibleFocusables.length - 1];
                if (e.shiftKey) {
                    if (document.activeElement === first) {
                        last.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === last) {
                        first.focus();
                        e.preventDefault();
                    }
                }
            }
        };

        // Bind image switching callbacks
        const thumbs = overlay.querySelectorAll('.product-thumbnail-btn');
        thumbs.forEach(thumb => {
            thumb.onclick = (e) => {
                const src = thumb.dataset.src;
                const mainImg = overlay.querySelector('#modal-main-image');
                if (mainImg && src) {
                    mainImg.style.opacity = '0.4';
                    setTimeout(() => {
                        mainImg.src = src;
                        mainImg.style.opacity = '1';
                    }, 150);
                }
                thumbs.forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
            };
        });

        // Set initial modal focus
        setTimeout(() => {
            const closeBtn = overlay.querySelector('.modal-close-btn');
            if (closeBtn) closeBtn.focus();
        }, 100);
    }

    async openPortfolioDetails(id) {
        const item = await this.db.get('portfolio', id);
        const categories = await this.db.getAll('categories');
        if (!item) return;

        // Save active element for focus restoration
        this.modalTriggerElement = document.activeElement;

        // Manage body scroll locking state
        this.previousBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        // Keyboard Escape key closure listener
        this.modalEscapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeActiveModal();
            }
        };
        document.addEventListener('keydown', this.modalEscapeHandler);

        // Safely parse gallery_images
        let portfolioImages = [];
        if (item.image_src) {
            portfolioImages.push(item.image_src);
        }
        if (item.gallery_images) {
            let parsedGallery = [];
            if (Array.isArray(item.gallery_images)) {
                parsedGallery = item.gallery_images;
            } else if (typeof item.gallery_images === 'string') {
                try {
                    parsedGallery = JSON.parse(item.gallery_images);
                } catch (e) {
                    console.warn("Failed to parse gallery_images:", e);
                }
            }
            parsedGallery.forEach(img => {
                if (img && !portfolioImages.includes(img)) {
                    portfolioImages.push(img);
                }
            });
        }
        const mainImage = portfolioImages[0] || '';

        const catObj = categories.find(c => c.id === item.category);
        const catName = catObj ? (this.lang === 'th' ? catObj.name_th : catObj.name_en) : '';

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'portfolio-modal';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-labelledby', 'modal-portfolio-title');

        overlay.innerHTML = `
            <div class="modal-window" style="max-width:900px;">
                <button class="modal-close-btn" onclick="window.charoenApp.closeActiveModal()" aria-label="${this.lang === 'th' ? 'ปิดหน้าต่าง' : 'Close modal'}"><i class="fas fa-times"></i></button>
                <div class="portfolio-details-grid">
                    <div class="product-gallery-container">
                        <div class="detail-img-box">
                            <img id="modal-main-image" src="${mainImage || 'coffee_bg.webp'}" alt="${this.lang === 'th' ? item.title_th : item.title_en}" style="${mainImage ? '' : 'display:none;'}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                            <div class="fallback-img-box" style="display:${mainImage ? 'none' : 'flex'}; align-items:center; justify-content:center; width:100%; height:100%; min-height:250px;">
                                <i class="fas fa-image" style="font-size:5rem; color:var(--text-muted);"></i>
                            </div>
                        </div>
                        ${portfolioImages.length > 1 ? `
                            <div class="product-thumbnails-scroll-container">
                                <div class="product-thumbnails-wrapper">
                                    ${portfolioImages.map((img, idx) => `
                                        <button class="product-thumbnail-btn ${idx === 0 ? 'active' : ''}" data-src="${img}" aria-label="${this.lang === 'th' ? 'ดูรูปภาพที่ ' : 'View image '}${idx + 1}">
                                            <img src="${img}" alt="Thumbnail ${idx + 1}" onerror="this.closest('.product-thumbnail-btn').style.display='none';">
                                        </button>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    <div class="portfolio-details-sidebar">
                        <span style="font-weight:700; color:var(--primary); font-size:0.8rem; text-transform:uppercase;">${catName}</span>
                        <h3 id="modal-portfolio-title" style="font-size:1.4rem; font-weight:800; color:var(--secondary);">${this.lang === 'th' ? item.title_th : item.title_en}</h3>
                        
                        <div style="border-top:1px solid var(--border-color); padding-top:16px; margin-top:8px;">
                            <h4 style="font-size:0.9rem; font-weight:700; color:var(--text-muted); margin-bottom:10px;">${this.lang === 'th' ? 'รายละเอียดผลงานพิมพ์' : 'Printed Specifications'}</h4>
                            <p style="font-size:0.95rem; line-height:1.6; color:var(--text-main);">${this.lang === 'th' ? (item.description_th || item.desc_th || 'งานพิมพ์ลายแก้วพลาสติกที่ผลิตตามความต้องการของแบรนด์ลูกค้าด้วยระบบมาตรฐาน') : (item.description_en || item.desc_en || 'Customer customized brand printing sample.')}</p>
                        </div>
                        
                        <div style="border-top:1px solid var(--border-color); padding-top:16px; margin-top:8px; display:flex; flex-direction:column; gap:10px; font-size:0.88rem;">
                            <div><strong>${this.lang === 'th' ? 'ชื่อแบรนด์ลูกค้า:' : 'Client Name:'}</strong> ${item.client_name || (this.lang === 'th' ? 'ทั่วไป' : 'General')}</div>
                            <div><strong>${this.lang === 'th' ? 'จำนวนสีที่ใช้พิมพ์:' : 'Print Colors:'}</strong> ${item.print_color || '1 color'}</div>
                            <div><strong>${this.lang === 'th' ? 'ประเภทแก้วบรรจุภัณฑ์:' : 'Packaging Type:'}</strong> ${catName}</div>
                        </div>
                        
                        <div style="margin-top:auto; padding-top:20px;">
                            <a href="https://line.me/R/ti/p/~${(await this.db.get('settings', 'line'))?.value?.replace('@', '') || 'charoenoncup'}" target="_blank" class="btn btn-primary" style="width:100%;">
                                <i class="fab fa-line"></i> ${this.lang === 'th' ? 'สอบถามสั่งสกรีนแบบลายนี้' : 'Inquire for Custom Order'}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        overlay.offsetHeight;
        overlay.classList.add('active');

        overlay.onclick = (e) => {
            if (e.target === overlay) this.closeActiveModal();
        };

        // Setup focus trap inside active modal overlay
        overlay.onkeydown = (e) => {
            if (e.key === 'Tab') {
                const focusables = overlay.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                const visibleFocusables = Array.from(focusables).filter(el => {
                    const style = window.getComputedStyle(el);
                    return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetWidth > 0 && el.offsetHeight > 0;
                });
                if (visibleFocusables.length === 0) return;
                const first = visibleFocusables[0];
                const last = visibleFocusables[visibleFocusables.length - 1];
                if (e.shiftKey) {
                    if (document.activeElement === first) {
                        last.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === last) {
                        first.focus();
                        e.preventDefault();
                    }
                }
            }
        };

        // Bind image switching callbacks
        const thumbs = overlay.querySelectorAll('.product-thumbnail-btn');
        thumbs.forEach(thumb => {
            thumb.onclick = (e) => {
                const src = thumb.dataset.src;
                const mainImg = overlay.querySelector('#modal-main-image');
                if (mainImg && src) {
                    mainImg.style.opacity = '0.4';
                    setTimeout(() => {
                        mainImg.src = src;
                        mainImg.style.opacity = '1';
                    }, 150);
                }
                thumbs.forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
            };
        });

        // Set initial modal focus
        setTimeout(() => {
            const closeBtn = overlay.querySelector('.modal-close-btn');
            if (closeBtn) closeBtn.focus();
        }, 100);
    }

    async openVideoPlayerLightbox(videoId) {
        const videoObj = await this.db.get('home_videos', videoId);
        if (!videoObj || !videoObj.video_src) {
            alert(this.lang === 'th' ? 'ขออภัย! ไม่พบแหล่งข้อมูลไฟล์คลิปวิดีโอนี้ในระบบคลังสื่อครับ' : 'Sorry, video source file not found in media library.');
            return;
        }

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';
        overlay.id = 'video-player-lightbox';
        overlay.style.zIndex = '30000';

        overlay.innerHTML = `
            <div class="modal-window" style="max-width:560px; background:black; border-radius:var(--radius-lg); aspect-ratio:16/9; display:flex; justify-content:center; align-items:center; overflow:hidden; border:none; padding:0;">
                <button class="modal-close-btn" onclick="window.charoenApp.closeActiveModal()" style="top:15px; right:15px; background:rgba(255,255,255,0.25); color:white;"><i class="fas fa-times"></i></button>
                <video src="${videoObj.video_src}" autoplay controls style="width:100%; height:100%; object-fit:contain; display:block;"></video>
            </div>
        `;

        document.body.appendChild(overlay);

        overlay.onclick = (e) => {
            if (e.target === overlay) this.closeActiveModal();
        };
    }

    closeActiveModal() {
        const modal = document.querySelector('.modal-overlay.active');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }

        // Restore body scroll state
        if (this.previousBodyOverflow !== undefined) {
            document.body.style.overflow = this.previousBodyOverflow;
            this.previousBodyOverflow = undefined;
        } else {
            document.body.style.overflow = '';
        }

        // Clean up temporary modal event listeners
        if (this.modalEscapeHandler) {
            document.removeEventListener('keydown', this.modalEscapeHandler);
            this.modalEscapeHandler = null;
        }

        // Restore focus to trigger element
        if (this.modalTriggerElement) {
            this.modalTriggerElement.focus();
            this.modalTriggerElement = null;
        }
    }

    showSuccessModal() {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'success-modal';

        overlay.innerHTML = `
            <div class="modal-window" style="max-width:400px; text-align:center; padding:30px;">
                <div style="width:70px; height:70px; border-radius:50%; background-color:#d1fae5; color:var(--success); display:flex; align-items:center; justify-content:center; font-size:2.5rem; margin:0 auto 20px auto;">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3 style="font-size:1.35rem; font-weight:800; color:var(--secondary); margin-bottom:12px;">${this.t('form_success_title')}</h3>
                <p style="font-size:0.92rem; color:var(--text-muted); line-height:1.6; margin-bottom:24px;">${this.t('form_success_desc')}</p>
                <button class="btn btn-primary" style="width:100%;" onclick="window.charoenApp.closeActiveModal()">${this.t('btn_ok')}</button>
            </div>
        `;

        document.body.appendChild(overlay);
        overlay.offsetHeight;
        overlay.classList.add('active');

        overlay.onclick = (e) => {
            if (e.target === overlay) this.closeActiveModal();
        };
    }
}

// Start App on load
window.onload = () => {
    const app = new CharoenApp();
    window.charoenApp = app;
    app.init();
};
