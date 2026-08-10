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
        this.productSliderInterval = null;
        this.currentProductSlideIndex = 0;
        this.previousBodyOverflow = null;
        this.modalCloseTimeout = null;
        
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
            await this.db.initProductSliderIfNeeded();
        } catch (dbErr) {
            console.error("CharoenApp database setup error:", dbErr);
        }

        this.applyTheme();
        this.renderNavbar();
        this.bindGlobalEvents();
        this.updateFooterContactInfo();
        this.renderFloatingContactWidget();

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
        this.renderFloatingContactWidget();
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
            <a href="#/quote" class="btn btn-primary" style="padding: 8px 16px; font-size:0.9rem;">
                <i class="fas fa-file-invoice-dollar"></i> <span class="quote-btn-text">${this.t('nav_quote')}</span>
            </a>
        `;

        // Re-bind actions events
        const desktopThemeBtn = document.getElementById('theme-toggle-btn');
        if (desktopThemeBtn) desktopThemeBtn.onclick = () => this.toggleTheme();

        const desktopLangBtn = document.getElementById('lang-toggle-btn');
        if (desktopLangBtn) {
            desktopLangBtn.textContent = this.lang === 'th' ? 'EN' : 'TH';
            desktopLangBtn.onclick = () => this.toggleLanguage();
        }

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

    async renderFloatingContactWidget() {
        let widgetContainer = document.getElementById('floating-contact-widget');
        if (!widgetContainer) {
            widgetContainer = document.createElement('div');
            widgetContainer.id = 'floating-contact-widget';
            widgetContainer.className = 'floating-contact-widget';
            widgetContainer.setAttribute('aria-label', this.lang === 'th' ? 'ช่องทางติดต่อ' : 'Contact channels');
            document.body.appendChild(widgetContainer);
        }

        const phone = await this.getSetting('phone');
        const email = await this.getSetting('email');
        const lineUrl = await this.getSetting('line_url');
        const lineId = await this.getSetting('line');
        const lineVisible = await this.getSetting('line_visible', 'true');
        const facebookUrl = await this.getSetting('facebook_url');
        const facebookVisible = await this.getSetting('facebook_visible', 'true');

        const cleanPhone = phone ? phone.replace(/[^0-9+]/g, '') : '';
        const effectiveLineUrl = lineUrl || (lineId ? `https://line.me/R/ti/p/~${lineId.replace('@', '')}` : '');

        const showFacebook = Boolean(facebookUrl) && facebookVisible !== 'false';
        const showLine = lineVisible !== 'false' && Boolean(effectiveLineUrl);
        const showEmail = Boolean(email);
        const showPhone = Boolean(phone && cleanPhone);
        const showContact = true;

        const activeChannels = [];

        if (showLine) {
            activeChannels.push({
                type: 'line',
                label: this.lang === 'th' ? 'พูดคุยผ่าน LINE' : 'Chat on LINE',
                icon: 'fab fa-line',
                href: effectiveLineUrl,
                target: '_blank',
                rel: 'noopener noreferrer',
                bgClass: 'fc-btn-line'
            });
        }

        if (showFacebook) {
            activeChannels.push({
                type: 'facebook',
                label: this.lang === 'th' ? 'พูดคุยผ่าน Facebook' : 'Chat on Facebook',
                icon: 'fab fa-facebook-f',
                href: facebookUrl,
                target: '_blank',
                rel: 'noopener noreferrer',
                bgClass: 'fc-btn-facebook'
            });
        }

        if (showPhone) {
            activeChannels.push({
                type: 'phone',
                label: this.lang === 'th' ? 'โทรหาเรา' : 'Call Us',
                icon: 'fas fa-phone-alt',
                href: `tel:${cleanPhone}`,
                target: '_self',
                rel: '',
                bgClass: 'fc-btn-phone'
            });
        }

        if (showEmail) {
            activeChannels.push({
                type: 'email',
                label: this.lang === 'th' ? 'ส่งอีเมลถึงเรา' : 'Email Us',
                icon: 'fas fa-envelope',
                href: `mailto:${email}`,
                target: '_self',
                rel: '',
                bgClass: 'fc-btn-email'
            });
        }

        if (showContact) {
            activeChannels.push({
                type: 'contact',
                label: this.lang === 'th' ? 'ติดต่อเรา' : 'Contact Us',
                icon: 'fas fa-comment-dots',
                href: '#/contact',
                target: '_self',
                rel: '',
                bgClass: 'fc-btn-contact'
            });
        }

        if (activeChannels.length === 0) {
            widgetContainer.innerHTML = '';
            widgetContainer.style.display = 'none';
            return;
        } else {
            widgetContainer.style.display = 'block';
        }

        const desktopItemsHtml = activeChannels.map(item => `
            <a href="${item.href}" ${item.target ? `target="${item.target}"` : ''} ${item.rel ? `rel="${item.rel}"` : ''} class="fc-desktop-item ${item.bgClass}" aria-label="${item.label}">
                <span class="fc-label">${item.label}</span>
                <span class="fc-icon-box"><i class="${item.icon}"></i></span>
            </a>
        `).join('');

        const mobileItemsHtml = activeChannels.map(item => `
            <a href="${item.href}" ${item.target ? `target="${item.target}"` : ''} ${item.rel ? `rel="${item.rel}"` : ''} class="fc-mobile-item ${item.bgClass}" aria-label="${item.label}">
                <span class="fc-mobile-icon-box"><i class="${item.icon}"></i></span>
                <span class="fc-mobile-label">${item.label}</span>
            </a>
        `).join('');

        const openLabel = this.lang === 'th' ? 'เปิดช่องทางติดต่อ' : 'Open contact options';
        const closeLabel = this.lang === 'th' ? 'ปิดช่องทางติดต่อ' : 'Close contact options';

        widgetContainer.innerHTML = `
            <!-- Desktop Fixed Vertical Stack (>= 769px) -->
            <div class="fc-desktop-stack">
                ${desktopItemsHtml}
            </div>

            <!-- Mobile Expandable FAB Floating Widget (<= 768px) -->
            <div class="fc-mobile-wrapper">
                <div class="fc-mobile-menu" id="floating-contact-actions" aria-hidden="true">
                    ${mobileItemsHtml}
                </div>
                <button type="button" class="fc-mobile-trigger" id="fc-mobile-trigger-btn" aria-expanded="false" aria-controls="floating-contact-actions" aria-label="${openLabel}">
                    <i class="fas fa-comment-dots fc-icon-open"></i>
                    <i class="fas fa-times fc-icon-close" style="display:none;"></i>
                </button>
            </div>
        `;

        const triggerBtn = document.getElementById('fc-mobile-trigger-btn');
        const mobileMenu = document.getElementById('floating-contact-actions');
        if (!triggerBtn || !mobileMenu) return;

        const isMobileOpen = () => widgetContainer.classList.contains('is-mobile-open');

        const openMobileMenu = () => {
            widgetContainer.classList.add('is-mobile-open');
            triggerBtn.setAttribute('aria-expanded', 'true');
            triggerBtn.setAttribute('aria-label', closeLabel);
            mobileMenu.setAttribute('aria-hidden', 'false');
            const openIcon = triggerBtn.querySelector('.fc-icon-open');
            const closeIcon = triggerBtn.querySelector('.fc-icon-close');
            if (openIcon) openIcon.style.display = 'none';
            if (closeIcon) closeIcon.style.display = 'inline-block';
        };

        const closeMobileMenu = () => {
            widgetContainer.classList.remove('is-mobile-open');
            triggerBtn.setAttribute('aria-expanded', 'false');
            triggerBtn.setAttribute('aria-label', openLabel);
            mobileMenu.setAttribute('aria-hidden', 'true');
            const openIcon = triggerBtn.querySelector('.fc-icon-open');
            const closeIcon = triggerBtn.querySelector('.fc-icon-close');
            if (openIcon) openIcon.style.display = 'inline-block';
            if (closeIcon) closeIcon.style.display = 'none';
        };

        triggerBtn.onclick = (e) => {
            e.stopPropagation();
            if (isMobileOpen()) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        };

        widgetContainer.querySelectorAll('.fc-mobile-item').forEach(item => {
            item.addEventListener('click', () => {
                closeMobileMenu();
            });
        });

        if (!this.fcGlobalListenersBound) {
            this.fcGlobalListenersBound = true;

            document.addEventListener('click', (e) => {
                const container = document.getElementById('floating-contact-widget');
                if (container && container.classList.contains('is-mobile-open')) {
                    if (!container.contains(e.target)) {
                        container.classList.remove('is-mobile-open');
                        const trigger = document.getElementById('fc-mobile-trigger-btn');
                        const menu = document.getElementById('floating-contact-actions');
                        if (trigger) {
                            trigger.setAttribute('aria-expanded', 'false');
                            const openIcon = trigger.querySelector('.fc-icon-open');
                            const closeIcon = trigger.querySelector('.fc-icon-close');
                            if (openIcon) openIcon.style.display = 'inline-block';
                            if (closeIcon) closeIcon.style.display = 'none';
                        }
                        if (menu) menu.setAttribute('aria-hidden', 'true');
                    }
                }
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' || e.key === 'Esc') {
                    const container = document.getElementById('floating-contact-widget');
                    if (container && container.classList.contains('is-mobile-open')) {
                        container.classList.remove('is-mobile-open');
                        const trigger = document.getElementById('fc-mobile-trigger-btn');
                        const menu = document.getElementById('floating-contact-actions');
                        if (trigger) {
                            trigger.setAttribute('aria-expanded', 'false');
                            const openIcon = trigger.querySelector('.fc-icon-open');
                            const closeIcon = trigger.querySelector('.fc-icon-close');
                            if (openIcon) openIcon.style.display = 'inline-block';
                            if (closeIcon) closeIcon.style.display = 'none';
                        }
                        if (menu) menu.setAttribute('aria-hidden', 'true');
                    }
                }
            });

            window.addEventListener('hashchange', () => {
                const container = document.getElementById('floating-contact-widget');
                if (container && container.classList.contains('is-mobile-open')) {
                    container.classList.remove('is-mobile-open');
                    const trigger = document.getElementById('fc-mobile-trigger-btn');
                    const menu = document.getElementById('floating-contact-actions');
                    if (trigger) {
                        trigger.setAttribute('aria-expanded', 'false');
                        const openIcon = trigger.querySelector('.fc-icon-open');
                        const closeIcon = trigger.querySelector('.fc-icon-close');
                        if (openIcon) openIcon.style.display = 'inline-block';
                        if (closeIcon) closeIcon.style.display = 'none';
                    }
                    if (menu) menu.setAttribute('aria-hidden', 'true');
                }
            });
        }
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

        // Header scroll dynamics: toggle elevated shadow and glassmorphism styling
        const header = document.querySelector('.site-header-double');
        if (header) {
            const handleScroll = () => {
                if (window.scrollY > 20) {
                    header.classList.add('header-scrolled');
                } else {
                    header.classList.remove('header-scrolled');
                }
            };
            window.addEventListener('scroll', handleScroll, { passive: true });
            handleScroll();
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
        if (this.productSliderInterval) {
            clearInterval(this.productSliderInterval);
            this.productSliderInterval = null;
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

    renderSingleHeroSlideHTML(slide, totalCount) {
        const slideTitle = this.lang === 'th' ? (slide.title_th || 'รับสกรีนแก้วพลาสติก แก้วกระดาษ หาดใหญ่') : (slide.title_en || 'Premium Custom Cup Printing in Hatyai');
        const slideSubtitle = this.lang === 'th' ? (slide.subtitle_th || 'ผู้ผลิตและรับสกรีนแก้วกาแฟ บรรจุภัณฑ์อาหารและเครื่องดื่มครบวงจร สีคมชัด ขั้นต่ำเริ่มต้นเพียง 1,000 ใบ ส่งตรงถึงหน้าร้านทั่วประเทศ') : (slide.subtitle_en || 'Leading manufacturer and custom printer for coffee cups, plastic & paper packaging with crisp colors and nationwide fast delivery.');
        const primaryBtnText = this.lang === 'th' ? (slide.btn_text_th || 'ขอใบเสนอราคา') : (slide.btn_text_en || 'Get Quote');
        const primaryBtnLink = slide.btn_link || '#/quote';
        const slideImg = slide.bg_src || 'cup_print_mockup.webp';

        const widthPercent = 100 / (totalCount || 1);
        return `
            <div class="slider-single-slide hero-slide-item" style="flex:0 0 ${widthPercent}%; width:${widthPercent}%; max-width:${widthPercent}%; box-sizing:border-box;">
                <div class="container hero-slide-container">
                    <div class="hero-content-grid">
                        <!-- Left Column: Corporate Copy & CTAs -->
                        <div class="hero-text-col">
                            <div class="hero-eyebrow-badge">
                                <i class="fas fa-award" style="color:var(--secondary);"></i>
                                <span>${this.lang === 'th' ? 'โรงงานสกรีนแก้วพลาสติกมาตรฐาน • หาดใหญ่ สงขลา' : 'ISO Standard Plastic Cup Factory • Hatyai'}</span>
                            </div>
                            <h1 class="hero-main-title">
                                ${slideTitle}
                            </h1>
                            <p class="hero-description">
                                ${slideSubtitle}
                            </p>
                            <div class="hero-cta-group">
                                <a href="${primaryBtnLink}" class="btn btn-hero-primary">
                                    <i class="fas fa-file-invoice-dollar"></i> ${primaryBtnText}
                                </a>
                                <a href="#/portfolio" class="btn btn-hero-secondary">
                                    <i class="fas fa-images"></i> ${this.lang === 'th' ? 'ดูผลงานสกรีนจริง' : 'View Portfolio'}
                                </a>
                            </div>
                        </div>
                        <!-- Right Column: Premium Showcase Composition & Floating Chips -->
                        <div class="hero-visual-col">
                            <div class="hero-showcase-frame">
                                <div class="hero-showcase-glow"></div>
                                <img src="${slideImg}" alt="${slideTitle}" class="hero-showcase-img" onerror="this.onerror=null; this.src='cup_print_mockup.webp';">
                                
                                <!-- Floating Card 1: Top Right -->
                                <div class="hero-float-card float-card-top">
                                    <div class="float-icon-box"><i class="fas fa-check"></i></div>
                                    <div class="float-card-text">
                                        <strong>${this.lang === 'th' ? 'ฟรีออกแบบ 100%' : 'Free Design 100%'}</strong>
                                        <span>${this.lang === 'th' ? 'โดยทีมกราฟิกมืออาชีพ' : 'By Professional Team'}</span>
                                    </div>
                                </div>

                                <!-- Floating Card 2: Bottom Left -->
                                <div class="hero-float-card float-card-bottom">
                                    <div class="float-icon-box" style="background:rgba(255, 107, 0, 0.15); color:var(--secondary);"><i class="fas fa-shield-alt"></i></div>
                                    <div class="float-card-text">
                                        <strong>${this.lang === 'th' ? 'สีคมชัด ติดแน่น' : 'Crisp & Durable Print'}</strong>
                                        <span>${this.lang === 'th' ? 'หมึกฟู้ดเกรด ปลอดภัย' : 'Food Grade Certified'}</span>
                                    </div>
                                </div>

                                <!-- Floating Chip: Bottom Badge -->
                                <div class="hero-float-chip float-chip-badge">
                                    <i class="fas fa-bolt" style="color:var(--secondary);"></i>
                                    <span>${this.lang === 'th' ? 'ผลิตด่วน 3-5 วันทำการ' : 'Fast 3-5 Days Lead Time'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Shared safe resolver for about_image references
    // Shared Safe Image Resolver (Phase M1)
    async resolveImageSrc(value, fallbackSrc = '') {
        if (!value) return fallbackSrc;

        let targetVal = value;
        if (typeof targetVal === 'object' && targetVal !== null) {
            targetVal = targetVal.image_src || targetVal.url || targetVal.src || targetVal.path || targetVal.id || targetVal.name || targetVal.filename || targetVal.file_name || '';
        }

        if (!targetVal || typeof targetVal !== 'string') {
            return fallbackSrc;
        }

        targetVal = targetVal.trim();
        if (!targetVal) return fallbackSrc;

        // 1. Data URLs (Base64) or full HTTP/HTTPS URLs
        if (targetVal.startsWith('data:') || targetVal.startsWith('http://') || targetVal.startsWith('https://')) {
            return targetVal;
        }

        // 2. Safe static paths (explicit directory prefix or verified static assets)
        const verifiedAssets = [
            'about_banner.webp',
            'coffee_bg.webp',
            'cup_print_mockup.webp',
            'portfolio_banner.webp',
            'contact_banner.webp',
            'faq_banner.webp'
        ];

        const hasPathPrefix = targetVal.startsWith('./') || targetVal.startsWith('../') || targetVal.startsWith('/') || targetVal.startsWith('assets/') || targetVal.startsWith('images/');

        if (verifiedAssets.includes(targetVal) || hasPathPrefix) {
            return targetVal;
        }

        // 3. Bare ID / UUID / Filename lookup in Media collection
        try {
            const mediaList = await this.db.getAll('media');
            if (Array.isArray(mediaList) && mediaList.length > 0) {
                const match = mediaList.find(m => m && (
                    m.id === targetVal ||
                    m.name === targetVal ||
                    m.filename === targetVal ||
                    m.file_name === targetVal
                ));
                if (match && match.image_src) {
                    return match.image_src;
                }
            }
        } catch (e) {
            console.warn('Failed to resolve image from media collection:', e);
        }

        // 4. Unresolved reference: Return fallbackSrc (never return unresolved bare UUID filename string)
        return fallbackSrc;
    }

    // Shared safe resolver for about_image references (backward compatibility wrapper)
    async resolveAboutImageSrc(val, fallbackSrc = 'about_banner.webp') {
        return await this.resolveImageSrc(val, fallbackSrc);
    }

    // Shared safe resolver for section background image references (Phase BG-A1)
    async resolveSectionBackgroundImageSrc(val) {
        return await this.resolveImageSrc(val, '');
    }

    // Unified Section Background Data Resolver (Phase BG-A1)
    async resolveSectionBackground(sectionObj) {
        const sec = sectionObj || {};
        const content = sec.content || {};

        const bgStyle = content.backgroundStyle || sec.backgroundStyle || 'solid_color';
        const rawBgImg = content.backgroundImage || sec.backgroundImage || '';
        const resolvedImage = await this.resolveSectionBackgroundImageSrc(rawBgImg);

        const rawOverlay = content.backgroundOverlay ?? sec.backgroundOverlay;
        const bgOverlay = (function(raw) {
            if (raw === undefined || raw === null || raw === '') return 55;
            let val = Number(raw);
            if (!Number.isFinite(val)) return 55;
            if (val > 0 && val <= 1) val = val * 100;
            return Math.min(80, Math.max(0, Math.round(val)));
        })(rawOverlay);

        const bgPos = content.backgroundPosition || sec.backgroundPosition || 'center center';

        const rawBrightness = content.backgroundBrightness ?? sec.backgroundBrightness;
        const bgBrightness = (function(raw) {
            if (raw === undefined || raw === null || raw === '') return 100;
            let val = Number(raw);
            if (!Number.isFinite(val)) return 100;
            return Math.min(120, Math.max(70, Math.round(val)));
        })(rawBrightness);

        const bgTextTheme = content.backgroundTextTheme || sec.backgroundTextTheme || 'auto';

        const rawAttachment = content.backgroundAttachment ?? sec.backgroundAttachment;
        const bgAttachment = rawAttachment === 'fixed' ? 'fixed' : 'scroll';

        const hasImage = (bgStyle === 'image' || bgStyle === 'image_line_art') && Boolean(resolvedImage);
        const hasLineArt = bgStyle === 'line_art' || bgStyle === 'image_line_art';
        const isFixed = bgAttachment === 'fixed';

        return {
            style: bgStyle,
            image: resolvedImage,
            overlay: bgOverlay,
            position: bgPos,
            brightness: bgBrightness,
            textTheme: bgTextTheme,
            attachment: bgAttachment,
            hasImage,
            hasLineArt,
            isFixed
        };
    }

    // Unified Section Background Markup Generator (Phase BG-A1)
    renderSectionBackgroundLayers(config) {
        if (!config) return '';

        let layersHtml = '';

        if (config.hasImage && config.image) {
            const fixedClass = config.isFixed ? 'is-section-bg-fixed' : '';
            layersHtml += `
                <div class="section-background-layer ${fixedClass}" aria-hidden="true" style="
                    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                    background-image: url('${config.image}');
                    background-size: cover;
                    background-position: ${config.position || 'center center'};
                    background-repeat: no-repeat;
                    filter: brightness(${config.brightness ?? 100}%);
                    z-index: 0;
                    pointer-events: none;
                "></div>
                <div class="section-background-overlay" aria-hidden="true" style="
                    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                    background-color: rgba(0, 0, 0, ${(config.overlay ?? 55) / 100});
                    z-index: 0;
                    pointer-events: none;
                "></div>
            `;
        }

        if (config.hasLineArt) {
            const whiteTintClass = config.hasImage ? 'pattern-white-tint' : '';
            layersHtml += `
                <div class="section-pattern-wrapper ${whiteTintClass}" aria-hidden="true" style="z-index: 1;">
                    <svg class="pattern-left-art" viewBox="0 0 360 480" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
                        <g transform="translate(10, 40)" opacity="0.5">
                            <rect x="20" y="140" width="150" height="110" rx="6" />
                            <path d="M 40 140 L 40 50 L 150 50 L 150 140" />
                            <line x1="20" y1="190" x2="170" y2="190" stroke-dasharray="4 4" />
                        </g>
                    </svg>
                    <svg class="pattern-right-art" viewBox="0 0 360 480" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
                        <g transform="translate(40, 40)" opacity="0.5">
                            <path d="M 120 80 Q 170 20 220 80 T 300 80" />
                            <path d="M 90 140 Q 150 90 210 140 T 310 140" />
                        </g>
                    </svg>
                </div>
            `;
        }

        return layersHtml;
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
        const rawAboutVal = aboutImgKey?.value || '';
        const aboutImgVal = await this.resolveAboutImageSrc(rawAboutVal);

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
                        <!-- Upgraded Premium Two-Column Corporate Hero Experience -->
                        <section class="hero-premium-section slider-section" id="hero-slider-section" style="display:${sortedSlides.length > 0 ? 'block' : 'none'};">
                            <div class="slider-slides-container" style="display:flex; width:${(sortedSlides.length || 1) * 100}%; height:100%; transition: transform 1.1s cubic-bezier(0.25, 0.8, 0.25, 1);">
                                ${sortedSlides.map(slide => this.renderSingleHeroSlideHTML(slide, sortedSlides.length)).join('')}
                            </div>
                            ${sortedSlides.length > 1 ? `
                                <button class="slider-arrow prev-arrow" onclick="window.charoenApp.changeSlide(-1)" aria-label="Previous Slide"><i class="fas fa-chevron-left"></i></button>
                                <button class="slider-arrow next-arrow" onclick="window.charoenApp.changeSlide(1)" aria-label="Next Slide"><i class="fas fa-chevron-right"></i></button>
                                <div class="slider-dots">
                                    ${sortedSlides.map((_, idx) => `
                                        <span class="slider-dot ${idx === 0 ? 'active' : ''}" onclick="window.charoenApp.goToSlide(${idx})" aria-label="Slide ${idx + 1}"></span>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </section>
                    `;
                    break;

                case 'about_company':
                    const secAboutImg = sec.content?.image || sec.content?.image_src || sec.image || '';
                    const rawAboutImg = secAboutImg || (await this.db.get('settings', 'about_image'))?.value || '';
                    const aboutImgVal = await this.resolveAboutImageSrc(rawAboutImg);
                    const bulletItems = Array.isArray(sec.content?.bullets) ? sec.content.bullets : (Array.isArray(sec.content?.bullet_items) ? sec.content.bullet_items : []);

                    // Extract Background Appearance Settings (Milestone 5.3 About Company Background Manager)
                    const aboutBgStyle = sec.content?.backgroundStyle || sec.backgroundStyle || 'solid_color';
                    let aboutBgImg = sec.content?.backgroundImage || sec.backgroundImage || '';

                    if (typeof aboutBgImg === 'object' && aboutBgImg !== null) {
                        aboutBgImg = aboutBgImg.url || aboutBgImg.image_src || aboutBgImg.src || aboutBgImg.path || '';
                    }

                    if (aboutBgImg && !aboutBgImg.startsWith('data:') && !aboutBgImg.startsWith('http') && !aboutBgImg.includes('/') && !aboutBgImg.endsWith('.webp') && !aboutBgImg.endsWith('.jpg') && !aboutBgImg.endsWith('.png')) {
                        try {
                            const mediaItem = await this.db.getAll('media').then(list => list.find(m => m.name === aboutBgImg || m.id === aboutBgImg));
                            if (mediaItem && mediaItem.image_src) {
                                aboutBgImg = mediaItem.image_src;
                            }
                        } catch (e) {
                            console.warn("Failed to lookup media item for about company background:", e);
                        }
                    }

                    const aboutRawOverlay = sec.content?.backgroundOverlay ?? sec.backgroundOverlay;
                    const aboutBgOverlay = (function(raw) {
                        if (raw === undefined || raw === null || raw === '') return 55;
                        let val = Number(raw);
                        if (!Number.isFinite(val)) return 55;
                        if (val > 0 && val <= 1) val = val * 100;
                        return Math.min(80, Math.max(0, Math.round(val)));
                    })(aboutRawOverlay);

                    const aboutBgPos = sec.content?.backgroundPosition || sec.backgroundPosition || 'center center';
                    const aboutBgBrightness = sec.content?.backgroundBrightness !== undefined ? sec.content.backgroundBrightness : (sec.backgroundBrightness !== undefined ? sec.backgroundBrightness : 100);
                    const aboutBgTextTheme = sec.content?.backgroundTextTheme || sec.backgroundTextTheme || 'auto';

                    const aboutHasImageBg = (aboutBgStyle === 'image' || aboutBgStyle === 'image_line_art') && Boolean(aboutBgImg);
                    const aboutHasLineArt = aboutBgStyle === 'line_art' || aboutBgStyle === 'image_line_art';

                    const aboutIsLightText = (aboutHasImageBg && (aboutBgTextTheme === 'auto' || aboutBgTextTheme === 'light')) || aboutBgTextTheme === 'light';
                    const aboutTitleTextColorStyle = aboutIsLightText ? 'color: #ffffff !important;' : 'color: var(--secondary);';
                    const aboutDescTextColorStyle = aboutIsLightText ? 'color: rgba(255, 255, 255, 0.88) !important;' : 'color: var(--text-main);';
                    const aboutBulletTextColorStyle = aboutIsLightText ? 'color: rgba(255, 255, 255, 0.9) !important;' : 'color: var(--text-main);';

                    const aboutLineArtLeft = `
                        <svg class="pattern-left-art" viewBox="0 0 360 480" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
                            <g transform="translate(10, 40)" opacity="0.5">
                                <rect x="20" y="140" width="150" height="110" rx="6" />
                                <path d="M 40 140 L 40 50 L 150 50 L 150 140" />
                                <line x1="20" y1="190" x2="170" y2="190" stroke-dasharray="4 4" />
                            </g>
                        </svg>
                    `;

                    const aboutLineArtRight = `
                        <svg class="pattern-right-art" viewBox="0 0 320 480" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
                            <g transform="translate(110, 160)" opacity="0.5">
                                <path d="M 45 -35 L 70 -90 L 80 -86 L 53 -32" />
                                <path d="M 5 0 C 5 -35 85 -35 85 0 Z" />
                                <line x1="0" y1="0" x2="90" y2="0" />
                                <path d="M 7 0 L 18 120 C 19 126 25 132 32 132 L 58 132 C 65 132 71 126 72 120 L 83 0" />
                            </g>
                        </svg>
                    `;

                    html += `
                        <!-- Upgraded Premium Two-Column About Us Section -->
                        <section class="homepage-about-section section-padding section-bg-manager ${aboutHasImageBg ? 'has-bg-image' : ''}" style="position: relative; overflow: hidden; background-color: ${aboutHasImageBg ? 'transparent' : 'var(--bg-main)'}; border-bottom: 1px solid var(--border-color);" data-overlay="${aboutBgOverlay}">
                            ${aboutHasImageBg ? `
                                <!-- Background Image Layer -->
                                <div class="sec-bg-image-layer" style="
                                    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                                    background-image: url(&quot;${aboutBgImg}&quot;);
                                    background-size: cover;
                                    background-position: ${aboutBgPos};
                                    filter: brightness(${aboutBgBrightness}%);
                                    z-index: 0;
                                    pointer-events: none;
                                "></div>
                                <!-- Dark Overlay Layer -->
                                <div class="sec-bg-overlay-layer" style="
                                    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                                    background-color: rgba(0, 0, 0, ${aboutBgOverlay / 100});
                                    z-index: 0;
                                    pointer-events: none;
                                "></div>
                            ` : ''}

                            ${aboutHasLineArt ? `
                                <!-- Decorative Line Art Layer -->
                                <div class="section-pattern-wrapper ${aboutHasImageBg ? 'pattern-white-tint' : ''}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; pointer-events: none; opacity: 0.12;">
                                    ${aboutLineArtLeft}
                                    ${aboutLineArtRight}
                                </div>
                            ` : ''}

                            <div class="container" style="position: relative; z-index: 2;">
                                <div class="grid-2" style="align-items: center; gap: 40px;">
                                    <div class="homepage-about-image-column" style="width: 100%;">
                                        <div class="homepage-about-image-wrapper" style="position: relative; border-radius: var(--radius-md); overflow: hidden; box-shadow: var(--shadow-md); aspect-ratio: 16/11; background-color: var(--bg-sec); display: flex; align-items: center; justify-content: center;">
                                            <img src="${aboutImgVal}" alt="Charoen On Cup About" style="width: 100%; height: 100%; object-fit: cover;" onerror="if (this.src !== 'about_banner.webp' && !this.src.endsWith('/about_banner.webp')) { this.onerror=null; this.src='about_banner.webp'; }">
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
                                        <h2 style="font-size: 1.95rem; font-weight: 800; ${aboutTitleTextColorStyle} margin-bottom: 16px; line-height: 1.35; font-family: 'Inter', 'Kanit', sans-serif;">
                                            ${this.lang === 'th' ? sec.content.title_th : sec.content.title_en}
                                        </h2>
                                        <p class="section-description" style="font-size: 0.98rem; line-height: 1.75; ${aboutDescTextColorStyle} margin-bottom: 20px;">
                                            ${this.lang === 'th' ? sec.content.desc_th : sec.content.desc_en}
                                        </p>
                                        
                                        ${bulletItems.length > 0 ? `
                                            <!-- Dynamic Bullet Highlights from CMS -->
                                            <div class="about-summary-bullets" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 24px;">
                                                ${bulletItems.map(item => `
                                                    <div style="display: flex; align-items: center; gap: 8px; font-size: 0.88rem; ${aboutBulletTextColorStyle} font-weight: 600;">
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

                    // Homepage Videos Section (Rendered immediately after about_company and before strengths)
                    const showHomeVideo = await this.getSetting('show_home_video', 'true');
                    const homeVideos = await this.db.getAll('home_videos');

                    // Safe URL check: allow static relative paths and HTTPS URLs; reject Base64/blob/file
                    const isSafeVideoSrc = (src) => {
                        if (!src || typeof src !== 'string' || !src.trim()) return false;
                        const s = src.trim();
                        if (s.startsWith('data:') || s.startsWith('blob:') || s.startsWith('file://')) return false;
                        return true;
                    };
                    const isSafePosterSrc = (src) => {
                        if (!src || typeof src !== 'string' || !src.trim()) return false;
                        const s = src.trim();
                        if (s.startsWith('data:') || s.startsWith('blob:') || s.startsWith('file://')) return false;
                        return true;
                    };

                    const validHomeVideos = (homeVideos || [])
                        .filter(v => {
                            if (!v) return false;
                            const videoSrc = v.video_path ||
                                (isSafeVideoSrc(v.video_src) ? v.video_src : '');
                            return videoSrc && videoSrc.trim() !== '';
                        })
                        .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

                    if (showHomeVideo !== 'false' && validHomeVideos.length > 0) {
                        const displayVideos = validHomeVideos.slice(0, 2);
                        const isSingle = displayVideos.length === 1;

                        const cleanText = (val) => {
                            if (val === null || val === undefined) return '';
                            const str = String(val).trim();
                            if (str.toLowerCase() === 'null' || str.toLowerCase() === 'undefined') return '';
                            return str;
                        };

                        const secTitleTh = await this.getSetting('video_section_title_th', '');
                        const secTitleEn = await this.getSetting('video_section_title_en', '');
                        const secDescTh = await this.getSetting('video_section_desc_th', '');
                        const secDescEn = await this.getSetting('video_section_desc_en', '');

                        const secTitle = cleanText(this.lang === 'th' ? secTitleTh : secTitleEn);
                        const secDesc = cleanText(this.lang === 'th' ? secDescTh : secDescEn);
                        const hasSecHeader = secTitle !== '' || secDesc !== '';

                        // Extract Background Appearance Settings (Homepage Videos Background Manager)
                        const videoBgStyle = await this.getSetting('video_section_background_style', 'solid_color');
                        let videoBgImg = await this.getSetting('video_section_background_image', '');

                        if (typeof videoBgImg === 'object' && videoBgImg !== null) {
                            videoBgImg = videoBgImg.url || videoBgImg.image_src || videoBgImg.src || videoBgImg.path || '';
                        }

                        if (videoBgImg && !videoBgImg.startsWith('data:') && !videoBgImg.startsWith('http') && !videoBgImg.includes('/') && !videoBgImg.endsWith('.webp') && !videoBgImg.endsWith('.jpg') && !videoBgImg.endsWith('.png')) {
                            try {
                                const mediaItem = await this.db.getAll('media').then(list => list.find(m => m.name === videoBgImg || m.id === videoBgImg));
                                if (mediaItem && mediaItem.image_src) {
                                    videoBgImg = mediaItem.image_src;
                                }
                            } catch (e) {
                                console.warn("Failed to lookup media item for video background:", e);
                            }
                        }

                        const videoRawOverlay = await this.getSetting('video_section_background_overlay', 55);
                        const videoBgOverlay = (function(raw) {
                            if (raw === undefined || raw === null || raw === '') return 55;
                            let val = Number(raw);
                            if (!Number.isFinite(val)) return 55;
                            if (val > 0 && val <= 1) val = val * 100;
                            return Math.min(80, Math.max(0, Math.round(val)));
                        })(videoRawOverlay);

                        const videoBgPos = await this.getSetting('video_section_background_position', 'center center');
                        const videoBgBrightnessRaw = await this.getSetting('video_section_background_brightness', 100);
                        const videoBgBrightness = parseInt(videoBgBrightnessRaw) || 100;
                        const videoBgTextTheme = await this.getSetting('video_section_background_text_theme', 'auto');

                        const videoHasImageBg = (videoBgStyle === 'image' || videoBgStyle === 'image_line_art') && Boolean(videoBgImg);
                        const videoHasLineArt = videoBgStyle === 'line_art' || videoBgStyle === 'image_line_art';

                        const videoIsLightText = (videoHasImageBg && (videoBgTextTheme === 'auto' || videoBgTextTheme === 'light')) || videoBgTextTheme === 'light';
                        const videoTitleTextColorStyle = videoIsLightText ? 'color: #ffffff !important;' : '';
                        const videoDescTextColorStyle = videoIsLightText ? 'color: rgba(255, 255, 255, 0.85) !important;' : 'color: var(--text-muted);';

                        const videoCoffeeBgPatternLeft = `
                            <svg class="pattern-left-art" viewBox="0 0 360 480" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
                                <g transform="translate(10, 40)" opacity="0.5">
                                    <path d="M 40 80 Q 70 20 120 80 T 200 80" />
                                    <path d="M 30 140 Q 90 90 150 140 T 270 140" />
                                    <path d="M 60 200 C 100 150 140 250 200 200" />
                                    <circle cx="80" cy="260" r="18" />
                                    <circle cx="160" cy="280" r="12" />
                                </g>
                            </svg>
                        `;
                        const videoCoffeeBgPatternRight = `
                            <svg class="pattern-right-art" viewBox="0 0 360 480" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
                                <g transform="translate(40, 40)" opacity="0.5">
                                    <path d="M 120 80 Q 170 20 220 80 T 300 80" />
                                    <path d="M 90 140 Q 150 90 210 140 T 310 140" />
                                    <path d="M 100 200 C 140 150 180 250 240 200" />
                                    <circle cx="220" cy="260" r="18" />
                                    <circle cx="140" cy="280" r="12" />
                                </g>
                            </svg>
                        `;

                        html += `
                            <!-- Homepage Videos Showcase Section -->
                            <section class="section-padding homepage-video-section section-bg-manager ${videoHasImageBg ? 'has-bg-image' : ''}" style="position: relative; overflow: hidden; background-color: ${videoHasImageBg ? 'transparent' : 'var(--bg-sec)'}; border-bottom: 1px solid var(--border-color); ${hasSecHeader ? '' : 'padding-top: 40px;'}" data-overlay="${videoBgOverlay}">
                                ${videoHasImageBg ? `
                                    <!-- Background Image Layer -->
                                    <div class="sec-bg-image-layer" style="
                                        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                                        background-image: url(&quot;${videoBgImg}&quot;);
                                        background-size: cover;
                                        background-position: ${videoBgPos};
                                        filter: brightness(${videoBgBrightness}%);
                                        z-index: 0;
                                        pointer-events: none;
                                    "></div>
                                    <!-- Dark Overlay Layer -->
                                    <div class="sec-bg-overlay-layer" style="
                                        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                                        background-color: rgba(0, 0, 0, ${videoBgOverlay / 100});
                                        z-index: 0;
                                        pointer-events: none;
                                    "></div>
                                ` : ''}

                                ${videoHasLineArt ? `
                                    <div class="section-pattern-wrapper ${videoHasImageBg ? 'pattern-white-tint' : ''}" style="z-index: 1;">
                                        ${videoCoffeeBgPatternLeft}
                                        ${videoCoffeeBgPatternRight}
                                    </div>
                                ` : ''}

                                <div class="container" style="position: relative; z-index: 2;">
                                    ${hasSecHeader ? `
                                        <div class="section-header text-center" style="margin-bottom: 36px;">
                                            <span class="section-eyebrow" style="font-weight: 700; color: var(--accent); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px;">
                                                ${this.lang === 'th' ? 'วีดีโอแนะนำ' : 'Featured Videos'}
                                            </span>
                                            ${secTitle ? `
                                                <h2 class="section-title" style="font-size: 1.95rem; font-weight: 800; color: var(--secondary); margin-bottom: 12px; font-family: 'Inter', 'Kanit', sans-serif; ${videoTitleTextColorStyle}">
                                                    ${secTitle}
                                                </h2>
                                            ` : ''}
                                            ${secDesc ? `
                                                <p class="section-description" style="font-size: 0.98rem; max-width: 680px; margin: 0 auto; line-height: 1.6; ${videoDescTextColorStyle}">
                                                    ${secDesc}
                                                </p>
                                            ` : ''}
                                        </div>
                                    ` : ''}

                                    <div class="home-video-grid" style="${isSingle ? 'max-width: 640px; margin: 0 auto;' : 'display: grid; grid-template-columns: repeat(2, 1fr); gap: 28px;'}">
                                        ${displayVideos.map(v => {
                                            const rawTitle = this.lang === 'th' ? (v.title_th || v.title_en) : (v.title_en || v.title_th);
                                            const rawDesc = this.lang === 'th' ? (v.desc_th || v.desc_en) : (v.desc_en || v.desc_th);

                                            const title = cleanText(rawTitle);
                                            const desc = cleanText(rawDesc);
                                            const posterSrc = v.poster_path && isSafePosterSrc(v.poster_path)
                                                ? v.poster_path.trim()
                                                : (isSafePosterSrc(v.poster_src) ? v.poster_src.trim() : '');

                                            const hasCardText = title !== '' || desc !== '';

                                            return `
                                                <div class="home-video-card" onclick="window.charoenApp.openVideoPlayerLightbox('${v.id}')" style="background: var(--bg-main); border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); cursor: pointer; transition: transform 0.3s ease, box-shadow 0.3s ease;" tabindex="0" role="button" aria-label="${title || 'Play video'}">
                                                    <div class="home-video-poster-box" style="position: relative; aspect-ratio: 16/9; background: #0A192F; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                                                        ${posterSrc ? `
                                                            <img src="${posterSrc}" alt="${title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                                            <div class="poster-fallback" style="display: none; position: absolute; inset: 0; background: #0A192F; align-items: center; justify-content: center; flex-direction: column; gap: 8px; color: rgba(255,255,255,0.7);">
                                                                <i class="fas fa-video" style="font-size: 2.5rem; color: var(--accent);"></i>
                                                            </div>
                                                        ` : `
                                                            <div class="poster-placeholder" style="width: 100%; height: 100%; background: #0A192F; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 8px; color: rgba(255,255,255,0.7);">
                                                                <i class="fas fa-video" style="font-size: 2.5rem; color: var(--accent);"></i>
                                                            </div>
                                                        `}
                                                        <div class="video-play-btn-circle" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 60px; height: 60px; border-radius: 50%; background: var(--accent); color: white; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px rgba(230, 81, 0, 0.45); z-index: 3;">
                                                            <i class="fas fa-play" style="font-size: 1.3rem; margin-left: 4px;"></i>
                                                        </div>
                                                        <div class="video-poster-overlay" style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(10, 25, 47, 0.4) 0%, transparent 60%); z-index: 1;"></div>
                                                    </div>
                                                    ${hasCardText ? `
                                                        <div style="padding: 20px 24px;">
                                                            ${title ? `
                                                                <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--secondary); ${desc ? 'margin-bottom: 8px;' : 'margin-bottom: 0;'} font-family: 'Inter', 'Kanit', sans-serif; line-height: 1.4;">
                                                                    ${title}
                                                                </h3>
                                                            ` : ''}
                                                            ${desc ? `
                                                                <p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.6; margin: 0;">
                                                                    ${desc}
                                                                </p>
                                                            ` : ''}
                                                        </div>
                                                    ` : ''}
                                                </div>
                                            `;
                                        }).join('')}
                                    </div>
                                </div>
                            </section>
                        `;
                    }
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

                    // Extract Background Appearance Settings (Milestone 4.5 Section Background Manager)
                    const bgStyle = sec.content?.backgroundStyle || sec.backgroundStyle || 'line_art';
                    const bgImg = sec.content?.backgroundImage || sec.backgroundImage || '';
                    const rawOverlay = sec.content?.backgroundOverlay ?? sec.backgroundOverlay;
                    const bgOverlay = (function(raw) {
                        if (raw === undefined || raw === null || raw === '') return 55;
                        let val = Number(raw);
                        if (!Number.isFinite(val)) return 55;
                        if (val > 0 && val <= 1) val = val * 100;
                        return Math.min(80, Math.max(0, Math.round(val)));
                    })(rawOverlay);
                    const bgPos = sec.content?.backgroundPosition || sec.backgroundPosition || 'center center';
                    const bgBrightness = sec.content?.backgroundBrightness !== undefined ? sec.content.backgroundBrightness : 100;
                    const bgTextTheme = sec.content?.backgroundTextTheme || sec.backgroundTextTheme || 'auto';

                    const hasImageBg = (bgStyle === 'image' || bgStyle === 'image_line_art') && Boolean(bgImg);
                    const hasLineArt = bgStyle === 'line_art' || bgStyle === 'image_line_art' || (!hasImageBg && bgStyle === 'image'); // Fallback to line_art if image empty or loading fails

                    const isLightText = (hasImageBg && (bgTextTheme === 'auto' || bgTextTheme === 'light')) || bgTextTheme === 'light';
                    const titleTextColorStyle = isLightText ? 'color: #ffffff !important;' : '';

                    const coffeeBgPatternLeft = `
                        <svg class="pattern-left-art" viewBox="0 0 360 480" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
                            <!-- Branded Plastic Cup (PET Cup) -->
                            <g transform="translate(10, 20)">
                                <path d="M 40 125 L 140 125 L 136 112 C 136 108 130 104 120 104 L 60 104 C 50 104 44 108 44 112 Z" />
                                <rect x="35" y="125" width="110" height="10" rx="2" />
                                <path d="M 42 135 L 54 275 C 55 282 62 288 70 288 L 110 288 C 118 288 125 282 126 275 L 138 135" />
                                <path d="M 46 175 L 134 175 L 130 230 L 50 230 Z" />
                                <!-- Branded Rabbit Logo on Sleeve -->
                                <g transform="translate(90, 200)">
                                    <path d="M -4 -8 C -7 -20 -1 -22 -1 -12 M -1 -12 C -1 -8 -3 -7 -4 -8" />
                                    <path d="M 4 -8 C 7 -20 1 -22 1 -12 M 1 -12 C 1 -8 3 -7 4 -8" />
                                    <path d="M -9 -3 C -11 3 -9 9 0 10 C 9 9 11 3 9 -3 C 7 -8 -7 -8 -9 -3" />
                                    <path d="M -1.5 3 Q 0 1.5 1.5 3" />
                                    <path d="M 0 3 L 0 5 Q -2.5 7 -4 5 M 0 5 Q 2.5 7 4 5" />
                                    <circle cx="-3.5" cy="0" r="0.8" fill="currentColor" />
                                    <circle cx="3.5" cy="0" r="0.8" fill="currentColor" />
                                </g>
                            </g>
                            <!-- Small Ceramic Espresso Cup & Saucer -->
                            <g transform="translate(10, 310)">
                                <ellipse cx="85" cy="115" rx="55" ry="12" />
                                <path d="M 45 65 C 45 110 125 110 125 65 Z" />
                                <path d="M 43 65 L 127 65" />
                                <path d="M 125 72 C 140 72 140 95 120 100" />
                                <path d="M 70 52 C 67 40 75 32 70 20" />
                                <path d="M 85 48 C 82 36 90 28 85 16" />
                                <path d="M 100 52 C 97 40 105 32 100 20" />
                            </g>
                            <!-- 4 Scattered Coffee Beans -->
                            <g>
                                <g transform="translate(220, 110) rotate(25)">
                                    <ellipse cx="0" cy="0" rx="13" ry="18" />
                                    <path d="M 0 -16 C -5 -4 -5 4 0 14" />
                                </g>
                                <g transform="translate(260, 220) rotate(-35)">
                                    <ellipse cx="0" cy="0" rx="11" ry="16" />
                                    <path d="M 0 -13 C 4 -3 4 3 0 13" />
                                </g>
                                <g transform="translate(195, 330) rotate(15)">
                                    <ellipse cx="0" cy="0" rx="10" ry="14" />
                                    <path d="M 0 -11 C -4 -3 -4 3 0 11" />
                                </g>
                                <g transform="translate(245, 410) rotate(-15)">
                                    <ellipse cx="0" cy="0" rx="12" ry="16" />
                                    <path d="M 0 -13 C -4 -3 -4 3 0 13" />
                                </g>
                            </g>
                            <!-- Subtle Organic Wave Accent -->
                            <path d="M 30 50 Q 150 140 230 300 Q 280 400 330 450" stroke-dasharray="5 5" opacity="0.4" />
                        </svg>
                    `;

                    const coffeeBgPatternRight = `
                        <svg class="pattern-right-art" viewBox="0 0 320 480" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
                            <!-- Branded Cold Cup with Domed Lid & Straw -->
                            <g transform="translate(130, 180)">
                                <path d="M 45 -35 L 70 -90 L 80 -86 L 53 -32" />
                                <path d="M 5 0 C 5 -35 85 -35 85 0 Z" />
                                <line x1="0" y1="0" x2="90" y2="0" />
                                <path d="M 7 0 L 18 120 C 19 126 25 132 32 132 L 58 132 C 65 132 71 126 72 120 L 83 0" />
                                <!-- Rabbit Logo -->
                                <g transform="translate(45, 60)">
                                    <path d="M -4 -8 C -7 -20 -1 -22 -1 -12 M -1 -12 C -1 -8 -3 -7 -4 -8" />
                                    <path d="M 4 -8 C 7 -20 1 -22 1 -12 M 1 -12 C 1 -8 3 -7 4 -8" />
                                    <path d="M -9 -3 C -11 3 -9 9 0 10 C 9 9 11 3 9 -3 C 7 -8 -7 -8 -9 -3" />
                                    <path d="M -1.5 3 Q 0 1.5 1.5 3" />
                                    <path d="M 0 3 L 0 5 Q -2.5 7 -4 5 M 0 5 Q 2.5 7 4 5" />
                                    <circle cx="-3.5" cy="0" r="0.8" fill="currentColor" />
                                    <circle cx="3.5" cy="0" r="0.8" fill="currentColor" />
                                </g>
                            </g>
                            <!-- Coffee Leaf Branch (3 leaves) -->
                            <g transform="translate(40, 60)">
                                <path d="M 120 20 Q 80 120 140 220" />
                                <path d="M 110 50 C 65 40 45 70 45 70 C 45 70 75 90 110 50 Z" />
                                <path d="M 110 50 Q 80 60 45 70" />
                                <path d="M 95 120 C 50 110 30 140 30 140 C 30 140 60 160 95 120 Z" />
                                <path d="M 95 120 Q 65 130 30 140" />
                                <path d="M 115 190 C 70 180 50 210 50 210 C 50 210 80 230 115 190 Z" />
                                <path d="M 115 190 Q 85 200 50 210" />
                            </g>
                            <!-- 3 Scattered Coffee Beans -->
                            <g>
                                <g transform="translate(60, 280) rotate(-20)">
                                    <ellipse cx="0" cy="0" rx="12" ry="17" />
                                    <path d="M 0 -13 C 4 -3 4 3 0 13" />
                                </g>
                                <g transform="translate(90, 370) rotate(35)">
                                    <ellipse cx="0" cy="0" rx="11" ry="15" />
                                    <path d="M 0 -12 C -4 -3 -4 3 0 12" />
                                </g>
                                <g transform="translate(40, 420) rotate(-10)">
                                    <ellipse cx="0" cy="0" rx="10" ry="14" />
                                    <path d="M 0 -11 C 3 -3 3 3 0 11" />
                                </g>
                            </g>
                        </svg>
                    `;

                    html += `
                        <!-- Company Strengths Section (Milestone 4.5 Section Background Manager) -->
                        <section class="section-padding section-bg-manager ${hasImageBg ? 'has-bg-image' : ''}" style="position: relative; overflow: hidden; background-color: var(--bg-sec); border-bottom: 1px solid var(--border-color);" data-overlay="${bgOverlay}">
                            ${hasImageBg ? `
                                <!-- CSS Background Image Layer -->
                                <div class="sec-bg-img-layer" style="
                                    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                                    background-image: url('${bgImg}');
                                    background-size: cover;
                                    background-position: ${bgPos};
                                    background-repeat: no-repeat;
                                    filter: brightness(${bgBrightness}%);
                                    z-index: 0;
                                    pointer-events: none;
                                "></div>
                                <!-- Dark Overlay Layer -->
                                <div class="sec-bg-overlay-layer" style="
                                    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                                    background-color: rgba(0, 0, 0, ${bgOverlay / 100});
                                    z-index: 0;
                                    pointer-events: none;
                                "></div>
                            ` : ''}

                            ${hasLineArt ? `
                                <div class="section-pattern-wrapper ${hasImageBg ? 'pattern-white-tint' : ''}" style="z-index: 1;">
                                    ${coffeeBgPatternLeft}
                                    ${coffeeBgPatternRight}
                                </div>
                            ` : ''}

                            <div class="container text-center" style="position: relative; z-index: 2;">
                                <h2 class="section-title" style="${titleTextColorStyle}">${this.lang === 'th' ? strengthsTitleTh : strengthsTitleEn}</h2>
                                <div class="strength-grid">
                                    ${strengthItems.map(item => {
                                        const itemImg = item.img_src || item.img || item.image || '';
                                        const title = this.lang === 'th' ? (item.title_th || '') : (item.title_en || '');
                                        const desc = this.lang === 'th' ? (item.desc_th || '') : (item.desc_en || '');
                                        const iconClass = item.icon || 'fa-award';

                                        return `
                                            <div class="strength-card">
                                                <div class="strength-circle-box">
                                                    ${itemImg ? `
                                                        <img src="${itemImg}" alt="${title}" class="strength-img" loading="lazy" onerror="this.onerror=null; this.parentElement.innerHTML='<i class=\\'fas ${iconClass}\\'></i>';">
                                                    ` : `
                                                        <i class="fas ${iconClass}"></i>
                                                    `}
                                                </div>
                                                <h3 class="strength-card-title">${title}</h3>
                                                <p class="strength-card-desc">${desc}</p>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        </section>
                    `;
                    break;

                case 'services':
                    const servicesBgConfig = await this.resolveSectionBackground(sec);
                    const servicesBgLayersHtml = this.renderSectionBackgroundLayers(servicesBgConfig);

                    const servicesIsLightText = (servicesBgConfig.hasImage && (servicesBgConfig.textTheme === 'auto' || servicesBgConfig.textTheme === 'light')) || servicesBgConfig.textTheme === 'light';
                    const servicesTitleTextColorStyle = servicesIsLightText ? 'color: #ffffff !important;' : '';
                    const servicesSubtitleTextColorStyle = servicesIsLightText ? 'color: rgba(255, 255, 255, 0.85) !important;' : 'color: var(--text-sec);';

                    const servicesClasses = [
                        'home-category-section',
                        'section-padding',
                        'section-background-system',
                        'section-bg-manager',
                        servicesBgConfig.hasImage ? 'has-bg-image has-section-background' : '',
                        servicesBgConfig.hasLineArt ? 'has-section-line-art' : '',
                        servicesBgConfig.isFixed ? 'is-section-bg-fixed' : ''
                    ].filter(Boolean).join(' ');

                    html += `
                        <!-- Categories Grid Section (6 Cards matching WorldWide Coffee style) -->
                        <section class="${servicesClasses}" style="position: relative; overflow: hidden; background-color: ${servicesBgConfig.hasImage ? 'transparent' : 'var(--bg-main)'}; border-bottom: 1px solid var(--border-color);" data-overlay="${servicesBgConfig.overlay}">
                            ${servicesBgLayersHtml}

                            <div class="section-background-content container text-center" style="position: relative; z-index: 2;">
                                <h2 class="section-title" style="${servicesTitleTextColorStyle}">${this.lang === 'th' ? sec.content.title_th : sec.content.title_en}</h2>
                                <p class="section-subtitle" style="${servicesSubtitleTextColorStyle}">${this.lang === 'th' ? sec.content.subtitle_th : sec.content.subtitle_en}</p>
                                
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
                                            <div class="home-category-card" onclick="window.location.hash='#/products?category=${cat.id}'" tabindex="0" role="button" aria-label="${this.lang === 'th' ? cat.name_th : cat.name_en}">
                                                <div class="home-category-image-wrapper">
                                                    ${catImage ? `
                                                        <img class="home-category-image" src="${catImage}" alt="${this.lang === 'th' ? cat.name_th : cat.name_en}" loading="lazy" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'home-category-image-fallback\\'><i class=\\'fas ${iconClass}\\'></i></div>';">
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

                    // Extract Background Appearance Settings (Milestone 4.5 Section Background Manager)
                    const whyBgStyle = sec.content?.backgroundStyle || sec.backgroundStyle || 'line_art';
                    const whyBgImg = sec.content?.backgroundImage || sec.backgroundImage || '';
                    const whyRawOverlay = sec.content?.backgroundOverlay ?? sec.backgroundOverlay;
                    const whyBgOverlay = (function(raw) {
                        if (raw === undefined || raw === null || raw === '') return 55;
                        let val = Number(raw);
                        if (!Number.isFinite(val)) return 55;
                        if (val > 0 && val <= 1) val = val * 100;
                        return Math.min(80, Math.max(0, Math.round(val)));
                    })(whyRawOverlay);
                    const whyBgPos = sec.content?.backgroundPosition || sec.backgroundPosition || 'center center';
                    const whyBgBrightness = sec.content?.backgroundBrightness !== undefined ? sec.content.backgroundBrightness : (sec.backgroundBrightness !== undefined ? sec.backgroundBrightness : 100);
                    const whyBgTextTheme = sec.content?.backgroundTextTheme || sec.backgroundTextTheme || 'auto';

                    const whyHasImageBg = (whyBgStyle === 'image' || whyBgStyle === 'image_line_art') && Boolean(whyBgImg);
                    const whyHasLineArt = whyBgStyle === 'line_art' || whyBgStyle === 'image_line_art';

                    const whyIsLightText = (whyHasImageBg && (whyBgTextTheme === 'auto' || whyBgTextTheme === 'light')) || whyBgTextTheme === 'light';
                    const whyTitleTextColorStyle = whyIsLightText ? 'color: #ffffff !important;' : '';

                    const whyCoffeeBgPatternLeft = `
                        <svg class="pattern-left-art" viewBox="0 0 360 480" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
                            <!-- Branded Plastic Cup (PET Cup) -->
                            <g transform="translate(10, 20)">
                                <path d="M 40 125 L 140 125 L 136 112 C 136 108 130 104 120 104 L 60 104 C 50 104 44 108 44 112 Z" />
                                <rect x="35" y="125" width="110" height="10" rx="2" />
                                <path d="M 42 135 L 54 275 C 55 282 62 288 70 288 L 110 288 C 118 288 125 282 126 275 L 138 135" />
                                <path d="M 46 175 L 134 175 L 130 230 L 50 230 Z" />
                                <!-- Branded Rabbit Logo on Sleeve -->
                                <g transform="translate(90, 200)">
                                    <path d="M -4 -8 C -7 -20 -1 -22 -1 -12 M -1 -12 C -1 -8 -3 -7 -4 -8" />
                                    <path d="M 4 -8 C 7 -20 1 -22 1 -12 M 1 -12 C 1 -8 3 -7 4 -8" />
                                    <path d="M -9 -3 C -11 3 -9 9 0 10 C 9 9 11 3 9 -3 C 7 -8 -7 -8 -9 -3" />
                                    <path d="M -1.5 3 Q 0 1.5 1.5 3" />
                                    <path d="M 0 3 L 0 5 Q -2.5 7 -4 5 M 0 5 Q 2.5 7 4 5" />
                                    <circle cx="-3.5" cy="0" r="0.8" fill="currentColor" />
                                    <circle cx="3.5" cy="0" r="0.8" fill="currentColor" />
                                </g>
                            </g>
                            <!-- Small Ceramic Espresso Cup & Saucer -->
                            <g transform="translate(10, 310)">
                                <ellipse cx="85" cy="115" rx="55" ry="12" />
                                <path d="M 45 65 C 45 110 125 110 125 65 Z" />
                                <path d="M 43 65 L 127 65" />
                                <path d="M 125 72 C 140 72 140 95 120 100" />
                                <path d="M 70 52 C 67 40 75 32 70 20" />
                                <path d="M 85 48 C 82 36 90 28 85 16" />
                                <path d="M 100 52 C 97 40 105 32 100 20" />
                            </g>
                            <!-- Scattered Coffee Beans -->
                            <g>
                                <g transform="translate(220, 110) rotate(25)">
                                    <ellipse cx="0" cy="0" rx="13" ry="18" />
                                    <path d="M 0 -16 C -5 -4 -5 4 0 14" />
                                </g>
                                <g transform="translate(260, 220) rotate(-35)">
                                    <ellipse cx="0" cy="0" rx="11" ry="16" />
                                    <path d="M 0 -13 C 4 -3 4 3 0 13" />
                                </g>
                            </g>
                        </svg>
                    `;

                    const whyCoffeeBgPatternRight = `
                        <svg class="pattern-right-art" viewBox="0 0 320 480" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
                            <!-- Branded Cold Cup with Domed Lid & Straw -->
                            <g transform="translate(130, 180)">
                                <path d="M 45 -35 L 70 -90 L 80 -86 L 53 -32" />
                                <path d="M 5 0 C 5 -35 85 -35 85 0 Z" />
                                <line x1="0" y1="0" x2="90" y2="0" />
                                <path d="M 7 0 L 18 120 C 19 126 25 132 32 132 L 58 132 C 65 132 71 126 72 120 L 83 0" />
                            </g>
                        </svg>
                    `;

                    html += `
                        <!-- Why Choose Us Section (Section Background Manager Restored) -->
                        <section class="section-padding section-bg-manager ${whyHasImageBg ? 'has-bg-image' : ''}" style="position: relative; overflow: hidden; background-color: var(--bg-sec); border-bottom: 1px solid var(--border-color);" data-overlay="${whyBgOverlay}">
                            ${whyHasImageBg ? `
                                <!-- CSS Background Image Layer -->
                                <div class="sec-bg-img-layer" style="
                                    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                                    background-image: url('${whyBgImg}');
                                    background-size: cover;
                                    background-position: ${whyBgPos};
                                    background-repeat: no-repeat;
                                    filter: brightness(${whyBgBrightness}%);
                                    z-index: 0;
                                    pointer-events: none;
                                "></div>
                                <!-- Dark Overlay Layer -->
                                <div class="sec-bg-overlay-layer" style="
                                    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                                    background-color: rgba(0, 0, 0, ${whyBgOverlay / 100});
                                    z-index: 0;
                                    pointer-events: none;
                                "></div>
                            ` : ''}

                            ${whyHasLineArt ? `
                                <div class="section-pattern-wrapper ${whyHasImageBg ? 'pattern-white-tint' : ''}" style="z-index: 1;">
                                    ${whyCoffeeBgPatternLeft}
                                    ${whyCoffeeBgPatternRight}
                                </div>
                            ` : ''}

                            <div class="container" style="position: relative; z-index: 2;">
                                <div class="text-center">
                                    <h2 class="section-title" style="${whyTitleTextColorStyle}">${this.lang === 'th' ? whyTitleTh : whyTitleEn}</h2>
                                </div>
                                <div class="grid-3" style="margin-top:40px;">
                                    ${whyItems.map((item, idx) => `
                                        <div style="background:var(--bg-main); padding: 35px 30px; border-radius:var(--radius-md); border:1px solid var(--border-color); position:relative; overflow:hidden;">
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
                    let stepsTitleTh = 'ขั้นตอนการ<span style="color:var(--secondary);">สั่งซื้อ</span>';
                    let stepsTitleEn = 'Ordering <span style="color:var(--secondary);">Process</span>';

                    if (sec.content) {
                        if (Array.isArray(sec.content)) {
                            stepsList = sec.content;
                        } else if (typeof sec.content === 'object') {
                            stepsTitleTh = sec.content.title_th ? sec.content.title_th.replace('สั่งสกรีน', '<span style="color:var(--secondary);">สั่งสกรีน</span>').replace('สั่งผลิต', '<span style="color:var(--secondary);">สั่งผลิต</span>').replace('สั่งซื้อ', '<span style="color:var(--secondary);">สั่งซื้อ</span>') : stepsTitleTh;
                            stepsTitleEn = sec.content.title_en || stepsTitleEn;
                            if (Array.isArray(sec.content.steps)) {
                                stepsList = sec.content.steps;
                            }
                        }
                    }

                    if (stepsList.length === 0) break;

                    const stepIcons = ['fa-comments', 'fa-palette', 'fa-cogs', 'fa-shipping-fast'];
                    const stepThemes = ['step-theme-orange', 'step-theme-blue', 'step-theme-green', 'step-theme-purple'];
                    const stepStrokeColors = ['#ff6b00', '#1d4ed8', '#22c55e', '#6d28d9'];

                    const stepsBgLineArt = `
                        <div class="steps-pattern-layer">
                            <svg viewBox="0 0 1200 480" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:100%;">
                                <!-- Left side: Screen Printing Machine Line Art -->
                                <g transform="translate(20, 60)" opacity="0.45">
                                    <rect x="20" y="160" width="160" height="120" rx="6" />
                                    <path d="M 40 160 L 40 60 L 160 60 L 160 160" />
                                    <path d="M 20 220 L 180 220" stroke-dasharray="4 4" />
                                    <!-- Drinkware cup on conveyor -->
                                    <path d="M 220 230 L 255 230 L 250 270 L 225 270 Z" />
                                    <path d="M 265 240 L 300 240 L 295 270 L 270 270 Z" />
                                </g>
                                <!-- Right side: Branded Plastic Cup Line Art with Straw -->
                                <g transform="translate(980, 50)" opacity="0.45">
                                    <path d="M 40 100 L 140 100 L 132 290 L 48 290 Z" />
                                    <path d="M 30 100 L 150 100 L 150 86 L 30 86 Z" />
                                    <!-- Lid Dome -->
                                    <path d="M 35 86 C 35 45 145 45 145 86" />
                                    <!-- Straw -->
                                    <path d="M 110 50 L 135 -10 L 125 -10" stroke-width="2.5" />
                                    <!-- Rabbit Brand Logo text mockup -->
                                    <text x="90" y="180" text-anchor="middle" font-size="16" font-weight="900" fill="currentColor" stroke="none">เจริญ</text>
                                    <text x="90" y="202" text-anchor="middle" font-size="13" font-weight="700" fill="currentColor" stroke="none">ออน คัพ</text>
                                    <text x="90" y="220" text-anchor="middle" font-size="9" fill="currentColor" stroke="none">สกรีนแก้วหาดใหญ่</text>
                                </g>
                            </svg>
                        </div>
                    `;

                    html += `
                        <!-- Ordering Steps Section (Milestone 4.5.3 Reference-Matched Descending Staircase) -->
                        <section class="section-padding steps-section-wrapper">
                            ${stepsBgLineArt}

                            <div class="container text-center" style="position: relative; z-index: 2;">
                                <span class="steps-top-badge">${this.lang === 'th' ? 'ขั้นตอนง่าย ๆ' : 'Easy Steps'}</span>
                                <h2 class="section-title" style="margin-top:0;">${this.lang === 'th' ? stepsTitleTh : stepsTitleEn}</h2>
                                <p class="section-subtitle">${this.lang === 'th' ? 'กระบวนการผลิตครบวงจร ใส่ใจทุกขั้นตอน เพื่อผลงานคุณภาพที่ดีที่สุด' : 'Comprehensive step-by-step custom screen printing for maximum quality'}</p>
                                
                                <div class="steps-staircase-container">
                                    ${stepsList.map((step, idx) => {
                                        const title = this.lang === 'th' ? (step.title_th || '') : (step.title_en || '');
                                        const desc = this.lang === 'th' ? (step.desc_th || '') : (step.desc_en || '');
                                        const formattedNum = (idx + 1) < 10 ? `0${idx + 1}` : `${idx + 1}`;
                                        const iconClass = stepIcons[idx % stepIcons.length];
                                        const themeClass = stepThemes[idx % stepThemes.length];
                                        const strokeColor = stepStrokeColors[idx % stepStrokeColors.length];
                                        const isLast = idx === stepsList.length - 1;

                                        return `
                                            <div class="steps-stair-item stair-step-${idx + 1}">
                                                <!-- Mobile Timeline Left Node & Branch Line -->
                                                <div class="step-mobile-node ${themeClass}"></div>
                                                <div class="step-mobile-branch-line ${themeClass}"></div>

                                                <div class="step-card step-card-pill ${themeClass}">
                                                    <div class="step-card-mobile-top-row">
                                                        <div class="step-pill-icon-badge">
                                                            <i class="fas ${iconClass}"></i>
                                                        </div>
                                                        <span class="step-pill-num-text">${formattedNum}</span>
                                                        <i class="fas fa-chevron-right step-pill-arrow"></i>
                                                    </div>
                                                    
                                                    <div class="step-pill-body">
                                                        <div class="step-pill-header">
                                                            <h4 class="step-pill-title-text">${title}</h4>
                                                        </div>
                                                        <p class="step-pill-desc-text">${desc}</p>
                                                    </div>

                                                    <!-- Desktop Right Node -->
                                                    <div class="step-pill-right-node"></div>
                                                </div>

                                                ${!isLast ? `
                                                    <!-- Precise Colored Dashed Elbow Connector to Next Pill Card (Desktop) -->
                                                    <div class="step-pill-connector">
                                                        <svg viewBox="0 0 75 60" style="width:75px; height:60px; overflow:visible;">
                                                            <path d="M 0 7 L 45 7 Q 60 7 60 22 L 60 52" fill="none" stroke="${strokeColor}" stroke-width="2.5" stroke-dasharray="4 3" opacity="0.85" stroke-linecap="round" />
                                                            <circle cx="60" cy="55" r="3.5" fill="${strokeColor}" />
                                                        </svg>
                                                    </div>
                                                ` : ''}
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        </section>
                    `;
                    break;

                case 'featured_portfolio':
                    const portfolios = await this.db.getAll('portfolio');
                    const categoriesForPort = await this.db.getAll('categories');
                    const visiblePortfolios = portfolios
                        .filter(item => (item.visible !== false && item.visible !== 'false'))
                        .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

                    if (visiblePortfolios.length > 0) {
                        // Find featured items
                        const featuredList = visiblePortfolios.filter(item => item.featured === true || item.featured === 'true');
                        const featItem = featuredList.length > 0 ? featuredList[0] : visiblePortfolios[0];
                        const featCatObj = categoriesForPort.find(c => c.id === featItem.category);
                        const featCatName = featCatObj ? (this.lang === 'th' ? featCatObj.name_th : featCatObj.name_en) : (this.lang === 'th' ? 'ร้านกาแฟ' : 'Cafe');

                        // Select up to 4 latest items
                        const latestItems = visiblePortfolios.slice(0, 4);

                        const mainTitle = this.lang === 'th' 
                            ? 'ผลงานที่เรา<span class="highlight-orange">ภูมิใจ</span>ส่งมอบ' 
                            : 'Projects We Are <span class="highlight-orange">Proud</span> To Deliver';

                        const subTitle = this.lang === 'th' 
                            ? 'ทุกชิ้นคือผลงานจริงที่ผลิตและส่งมอบให้ลูกค้าทั่วประเทศ' 
                            : 'Every single item is a real project produced and delivered to cafe clients nationwide';

                        html += `
                            <!-- Milestone 5.1.2 — Portfolio Homepage Visual Fidelity Correction -->
                            <section class="section-padding portfolio-experience-section">
                                <div class="portfolio-experience-container">
                                    <!-- Header -->
                                    <div class="text-center portfolio-header-block">
                                        <h2 class="portfolio-main-title">${mainTitle}</h2>
                                        <p class="portfolio-main-subtitle">${subTitle}</p>
                                    </div>

                                    <!-- Corporate Statistics Bar -->
                                    <div class="portfolio-stats-bar">
                                        <div class="port-stat-card">
                                            <div class="port-stat-icon"><i class="fas fa-box-open"></i></div>
                                            <div class="port-stat-info">
                                                <span class="port-stat-number">10,000+</span>
                                                <span class="port-stat-label">${this.lang === 'th' ? 'ผลงานที่ส่งมอบ' : 'Projects Delivered'}</span>
                                            </div>
                                        </div>
                                        <div class="port-stat-divider"></div>
                                        <div class="port-stat-card">
                                            <div class="port-stat-icon"><i class="fas fa-users"></i></div>
                                            <div class="port-stat-info">
                                                <span class="port-stat-number">1,200+</span>
                                                <span class="port-stat-label">${this.lang === 'th' ? 'ลูกค้าที่ไว้วางใจ' : 'Trusted Clients'}</span>
                                            </div>
                                        </div>
                                        <div class="port-stat-divider"></div>
                                        <div class="port-stat-card">
                                            <div class="port-stat-icon"><i class="fas fa-map-marked-alt"></i></div>
                                            <div class="port-stat-info">
                                                <span class="port-stat-number">20+</span>
                                                <span class="port-stat-label">${this.lang === 'th' ? 'จังหวัดที่จัดส่ง' : 'Provinces Served'}</span>
                                            </div>
                                        </div>
                                        <div class="port-stat-divider"></div>
                                        <div class="port-stat-card">
                                            <div class="port-stat-icon"><i class="fas fa-truck-loading"></i></div>
                                            <div class="port-stat-info">
                                                <span class="port-stat-number">${this.lang === 'th' ? 'ทั่วประเทศไทย' : 'Nationwide'}</span>
                                                <span class="port-stat-label">${this.lang === 'th' ? 'จัดส่งทั่วประเทศ' : 'Fast Delivery'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Featured Work Showcase (2-Column Editorial Layout) -->
                                    <div class="portfolio-featured-showcase-block">
                                        <div class="portfolio-featured-layout">
                                            <!-- Left Side: Editorial Details -->
                                            <div class="portfolio-featured-left">
                                                <div class="portfolio-section-label">
                                                    <span class="orange-dot-badge"></span> ${this.lang === 'th' ? 'ผลงานเด่นประจำเดือน' : 'Featured Work'}
                                                </div>
                                                <h3 class="featured-left-heading">${this.lang === 'th' ? (featItem.title_th || featItem.title_en) : (featItem.title_en || featItem.title_th)}</h3>
                                                <p class="featured-left-desc">
                                                    ${this.lang === 'th' 
                                                        ? 'สร้างความโดดเด่นและสร้างแบรนด์ให้เป็นที่น่าจดจำ ด้วยงานสกรีนแก้วคุณภาพสูงระดับพรีเมียม สีคมชัด ทนนาน ส่งมอบให้แก่ลูกค้าทั่วประเทศ' 
                                                        : 'High-quality screen printing that elevates beverage brand identities nationwide.'}
                                                </p>
                                                <div class="featured-left-actions">
                                                    <a href="#/portfolio" class="btn btn-primary portfolio-all-cta-btn">
                                                        ${this.lang === 'th' ? 'ดูผลงานทั้งหมด' : 'View All Works'} <i class="fas fa-arrow-right"></i>
                                                    </a>
                                                </div>
                                            </div>

                                            <!-- Right Side: Large Hero Image Card -->
                                            <div class="portfolio-featured-right">
                                                <div class="portfolio-hero-card" onclick="window.charoenApp.openPortfolioDetails('${featItem.id}')">
                                                    <div class="portfolio-hero-img-box">
                                                        <img class="skeleton-shimmer" src="${this.getPortfolioCoverImage(featItem)}" alt="${featItem.title_th || 'Featured Work'}" loading="lazy" onload="this.classList.remove('skeleton-shimmer')" onerror="this.classList.remove('skeleton-shimmer'); this.src='coffee_bg.webp';">
                                                    </div>
                                                    <div class="portfolio-hero-card-overlay">
                                                        <div class="hero-overlay-top">
                                                            <span class="portfolio-hero-tag">${featCatName}</span>
                                                        </div>
                                                        <div class="hero-overlay-bottom">
                                                            <h3 class="portfolio-hero-title">${this.lang === 'th' ? (featItem.title_th || featItem.title_en) : (featItem.title_en || featItem.title_th)}</h3>
                                                            <p class="portfolio-hero-spec"><i class="fas fa-wine-glass-alt"></i> ${featItem.cup_type || (this.lang === 'th' ? 'แก้ว PET 22oz สกรีน 2 สี' : 'PET 22oz Cup 2-Color Print')}</p>
                                                            
                                                            <div class="hero-overlay-footer">
                                                                <div class="portfolio-hero-meta">
                                                                    <span><i class="fas fa-boxes"></i> ${featItem.qty || '10,000 ใบ'}</span>
                                                                    <span><i class="fas fa-map-marker-alt"></i> ${featItem.province || featItem.location || (this.lang === 'th' ? 'สงขลา' : 'Songkhla')}</span>
                                                                </div>

                                                                <button class="btn btn-primary portfolio-hero-btn" onclick="event.stopPropagation(); window.charoenApp.openPortfolioDetails('${featItem.id}');">
                                                                    ${this.lang === 'th' ? 'ดูรายละเอียด' : 'View Details'} <i class="fas fa-arrow-right"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Latest Works Grid -->
                                    <div class="portfolio-latest-block">
                                        <div class="portfolio-latest-header">
                                            <div class="portfolio-section-label">
                                                <span class="orange-dot-badge"></span> ${this.lang === 'th' ? 'ผลงานล่าสุด' : 'Latest Works'}
                                            </div>
                                            <a href="#/portfolio" class="portfolio-view-all-link">
                                                ${this.lang === 'th' ? 'ดูทั้งหมด' : 'View All'} <i class="fas fa-arrow-right"></i>
                                            </a>
                                        </div>

                                        <div class="portfolio-latest-grid">
                                            ${latestItems.map(item => {
                                                const catObj = categoriesForPort.find(c => c.id === item.category);
                                                const catName = catObj ? (this.lang === 'th' ? catObj.name_th : catObj.name_en) : (this.lang === 'th' ? 'ร้านกาแฟ' : 'Cafe');
                                                return `
                                                    <div class="portfolio-latest-card" onclick="window.charoenApp.openPortfolioDetails('${item.id}')" tabindex="0" role="button">
                                                        <div class="latest-card-img-box">
                                                            <span class="latest-card-category-badge">${catName}</span>
                                                            <img class="skeleton-shimmer" src="${this.getPortfolioCoverImage(item)}" alt="${item.title_th || 'Portfolio'}" loading="lazy" onload="this.classList.remove('skeleton-shimmer')" onerror="this.classList.remove('skeleton-shimmer'); this.src='coffee_bg.webp';">
                                                            <div class="latest-card-overlay">
                                                                <span class="latest-card-hover-btn">${this.lang === 'th' ? 'ดูรายละเอียด' : 'View Details'} <i class="fas fa-arrow-right"></i></span>
                                                            </div>
                                                        </div>
                                                        <div class="latest-card-content">
                                                            <h3 class="latest-card-title">${this.lang === 'th' ? item.title_th : item.title_en}</h3>
                                                            <p class="latest-card-spec">${item.cup_type || (this.lang === 'th' ? 'แก้ว PET 16oz สกรีน 1 สี' : 'PET 16oz Cup 1-Color')}</p>
                                                            <div class="latest-card-meta">
                                                                <span><i class="fas fa-boxes"></i> ${item.qty || '5,000 ใบ'}</span>
                                                                <span><i class="fas fa-map-marker-alt"></i> ${item.province || item.location || (this.lang === 'th' ? 'เชียงใหม่' : 'Chiang Mai')}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                `;
                                            }).join('')}
                                        </div>
                                    </div>

                                    <!-- Bottom Service Assurance Strip -->
                                    <div class="portfolio-bottom-service-strip">
                                        <div class="bottom-service-item">
                                            <div class="bottom-service-icon"><i class="fas fa-award"></i></div>
                                            <div class="bottom-service-text">
                                                <h4 class="bottom-service-title">${this.lang === 'th' ? 'งานคุณภาพ' : 'Premium Quality'}</h4>
                                                <p class="bottom-service-desc">${this.lang === 'th' ? 'สกรีนคมชัด สีสวย ทนนาน' : 'Sharp printing, vibrant & durable'}</p>
                                            </div>
                                        </div>
                                        <div class="bottom-service-divider"></div>
                                        <div class="bottom-service-item">
                                            <div class="bottom-service-icon"><i class="fas fa-cube"></i></div>
                                            <div class="bottom-service-text">
                                                <h4 class="bottom-service-title">${this.lang === 'th' ? 'ตรวจแบบก่อนผลิต' : '3D Proofing'}</h4>
                                                <p class="bottom-service-desc">${this.lang === 'th' ? 'ตรวจแบบจำลองก่อนเริ่มผลิตจริง' : 'Preview 3D model before production'}</p>
                                            </div>
                                        </div>
                                        <div class="bottom-service-divider"></div>
                                        <div class="bottom-service-item">
                                            <div class="bottom-service-icon"><i class="fas fa-clock"></i></div>
                                            <div class="bottom-service-text">
                                                <h4 class="bottom-service-title">${this.lang === 'th' ? 'ส่งมอบตรงเวลา' : 'On-Time Delivery'}</h4>
                                                <p class="bottom-service-desc">${this.lang === 'th' ? 'ควบคุมแผนผลิตและจัดส่งตามกำหนด' : 'On schedule production & delivery'}</p>
                                            </div>
                                        </div>
                                        <div class="bottom-service-divider"></div>
                                        <div class="bottom-service-item">
                                            <div class="bottom-service-icon"><i class="fas fa-hands-helping"></i></div>
                                            <div class="bottom-service-text">
                                                <h4 class="bottom-service-title">${this.lang === 'th' ? 'บริการครบวงจร' : 'One-Stop Service'}</h4>
                                                <p class="bottom-service-desc">${this.lang === 'th' ? 'ออกแบบ ผลิต และจัดส่งในที่เดียว' : 'Design, manufacturing & shipping'}</p>
                                            </div>
                                        </div>
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
                            <section class="section-padding" style="background-color: var(--bg-main); border-bottom: 1px solid var(--border-color);">
                                <div class="container text-center">
                                    <h4 style="font-size:1.05rem; font-weight:700; color:var(--text-sec); text-transform:uppercase; margin-bottom:30px; letter-spacing:1px;">
                                        ${this.lang === 'th' ? sec.content.title_th : sec.content.title_en}
                                    </h4>
                                    <div style="display:flex; flex-wrap:wrap; justify-content:center; align-items:center; gap:40px; opacity:0.85;">
                                        ${visibleClients.map(c => `
                                            <a href="${c.link || '#'}" target="_blank" title="${c.name}" style="display:inline-block; height:60px; filter:grayscale(100%); transition:var(--transition); cursor:pointer;" onmouseover="this.style.filter='none'" onmouseout="this.style.filter='grayscale(100%)'">
                                                <img src="${c.logo_src || 'coffee_bg.webp'}" alt="${c.name}" width="120" height="60" loading="lazy" style="height:100%; object-fit:contain;">
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

                    // Resolve Background Configuration using shared Phase BG-A1 helper
                    const bgConfig = await this.resolveSectionBackground(sec);
                    const bgLayersHtml = this.renderSectionBackgroundLayers(bgConfig);

                    const newsIsLightText = (bgConfig.hasImage && (bgConfig.textTheme === 'auto' || bgConfig.textTheme === 'light')) || bgConfig.textTheme === 'light';
                    const newsTitleTextColorStyle = newsIsLightText ? 'color: #ffffff !important;' : '';
                    const newsDescTextColorStyle = newsIsLightText ? 'color: rgba(255, 255, 255, 0.85) !important;' : 'color: var(--text-sec);';

                    const descHtml = secDesc ? `<p class="section-subtitle" style="margin-top:10px; font-size:1.05rem; ${newsDescTextColorStyle}">${secDesc}</p>` : '';

                    const bgClasses = [
                        'section-padding',
                        'section-background-system',
                        'section-bg-manager',
                        bgConfig.hasImage ? 'has-bg-image has-section-background' : '',
                        bgConfig.hasLineArt ? 'has-section-line-art' : '',
                        bgConfig.isFixed ? 'is-section-bg-fixed' : ''
                    ].filter(Boolean).join(' ');

                    html += `
                        <!-- Activities & Support Section -->
                        <section class="${bgClasses}" style="position: relative; overflow: hidden; background-color: ${bgConfig.hasImage ? 'transparent' : 'var(--bg-main)'}; border-bottom: 1px solid var(--border-color);" data-overlay="${bgConfig.overlay}">
                            ${bgLayersHtml}

                            <div class="section-background-content container text-center" style="position: relative; z-index: 2;">
                                <h2 class="section-title" style="${newsTitleTextColorStyle}">${secTitle}</h2>
                                ${descHtml}
                                
                                ${homepageNews.length > 0 ? `
                                    <div class="grid-3" style="text-align:left;">
                                        ${homepageNews.map(n => {
                                            const title = this.lang === 'th' ? (n.title_th || n.title_en || '') : (n.title_en || n.title_th || '');
                                            const summary = this.lang === 'th' ? (n.summary_th || n.summary_en || '') : (n.summary_en || n.summary_th || '');
                                            const date = n.date || '';
                                            const location = this.lang === 'th' ? (n.location_th || n.location_en || '') : (n.location_en || n.location_th || '');
                                            const thumbnail = n.thumbnail || '';

                                            const focalPos = n.focal_position || n.img_position || n.image_position || 'center center';
                                            const imgHtml = thumbnail ? `
                                                <div class="news-card-img-wrapper">
                                                    <img src="${thumbnail}" alt="${title}" class="news-card-img" style="object-position: ${focalPos};" loading="lazy">
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
                                                <div class="activity-card news-card" onclick="window.location.hash='#/news-detail?id=${n.id}'" style="cursor:pointer;">
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
                                        <a href="#/news" class="btn btn-outline" style="border-color:${newsIsLightText ? '#ffffff' : 'var(--primary)'}; color:${newsIsLightText ? '#ffffff' : 'var(--primary)'};"><i class="far fa-calendar-alt"></i> ${this.lang === 'th' ? 'ดูข้อมูลกิจกรรมทั้งหมด' : 'View All Activities'}</a>
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
                                slidesContainer.innerHTML = filteredSlides.map(slide => this.renderSingleHeroSlideHTML(slide, filteredSlides.length)).join('');
                            }
                            
                            const prevArrow = sliderSection.querySelector('.prev-arrow');
                            const nextArrow = sliderSection.querySelector('.next-arrow');
                            const dotsContainer = sliderSection.querySelector('.slider-dots');

                            if (filteredSlides.length > 1) {
                                if (prevArrow) prevArrow.style.display = 'flex';
                                if (nextArrow) nextArrow.style.display = 'flex';
                                if (dotsContainer) {
                                    dotsContainer.style.display = 'flex';
                                    const activeIdx = (typeof this.currentSlideIndex === 'number' && this.currentSlideIndex < filteredSlides.length) ? this.currentSlideIndex : 0;
                                    dotsContainer.innerHTML = filteredSlides.map((_, idx) => `
                                        <span class="slider-dot ${idx === activeIdx ? 'active' : ''}" onclick="window.charoenApp.goToSlide(${idx})" aria-label="Slide ${idx + 1}" ${idx === activeIdx ? 'aria-current="true"' : ''}></span>
                                    `).join('');
                                }
                            } else {
                                if (prevArrow) prevArrow.style.display = 'none';
                                if (nextArrow) nextArrow.style.display = 'none';
                                if (dotsContainer) dotsContainer.style.display = 'none';
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

                        const focalPos = n.focal_position || n.img_position || n.image_position || 'center center';
                        const imgHtml = thumbnail ? `
                            <div class="news-card-img-wrapper">
                                <img src="${thumbnail}" alt="${title}" class="news-card-img" style="object-position: ${focalPos};" loading="lazy">
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
                            <div class="activity-card news-card" onclick="window.location.hash='#/news-detail?id=${n.id}'" style="cursor:pointer;">
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
                                            <img src="${prod.image_src || 'coffee_bg.webp'}" alt="${prod.name_th}" loading="lazy">
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
                                    <div class="activity-card news-card" onclick="window.location.hash='#/news-detail?id=${n.id}'" style="cursor:pointer;">
                                        <div class="news-card-img-wrapper">
                                            <img src="${n.thumbnail || 'coffee_bg.webp'}" alt="${n.title_th}" class="news-card-img" style="object-position: ${n.focal_position || n.img_position || n.image_position || 'center center'};" loading="lazy">
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
        }, 9000); // 9.0s delay for smooth premium experience

        // Touch swipe gesture support for mobile/tablet
        const sliderElement = document.querySelector(containerSelector);
        if (sliderElement && !sliderElement.dataset.swipeBound) {
            sliderElement.dataset.swipeBound = 'true';
            let touchStartX = 0;
            let touchEndX = 0;
            
            sliderElement.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            sliderElement.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                const diff = touchStartX - touchEndX;
                if (Math.abs(diff) > 45) {
                    if (diff > 0) {
                        this.changeSlide(1);
                    } else {
                        this.changeSlide(-1);
                    }
                }
            }, { passive: true });
        }
    }

    changeSlide(direction) {
        const sliderSec = document.querySelector('.slider-section');
        if (!sliderSec) return;
        
        const slides = sliderSec.querySelectorAll('.slider-single-slide');
        if (slides.length <= 1) return;
        
        this.currentSlideIndex = (this.currentSlideIndex + direction + slides.length) % slides.length;
        this.updateSliderUI('#' + sliderSec.id, slides.length);
        this.resetSliderTimer('#' + sliderSec.id, slides.length);
    }

    goToSlide(index) {
        const sliderSec = document.querySelector('.slider-section');
        if (!sliderSec) return;
        
        const slides = sliderSec.querySelectorAll('.slider-single-slide');
        if (slides.length <= 1) return;
        
        this.currentSlideIndex = index;
        this.updateSliderUI('#' + sliderSec.id, slides.length);
        this.resetSliderTimer('#' + sliderSec.id, slides.length);
    }

    resetSliderTimer(containerSelector, slideCount) {
        if (this.sliderInterval) {
            clearInterval(this.sliderInterval);
        }
        if (slideCount > 1) {
            this.sliderInterval = setInterval(() => {
                this.currentSlideIndex = (this.currentSlideIndex + 1) % slideCount;
                this.updateSliderUI(containerSelector, slideCount);
            }, 9000);
        }
    }

    updateSliderUI(selector, slideCount) {
        const sliderSec = document.querySelector(selector);
        if (!sliderSec) return;

        const container = sliderSec.querySelector('.slider-slides-container');
        if (!container) return;

        if (typeof this.currentSlideIndex !== 'number' || isNaN(this.currentSlideIndex) || this.currentSlideIndex < 0) {
            this.currentSlideIndex = 0;
        }
        if (this.currentSlideIndex >= slideCount) {
            this.currentSlideIndex = slideCount - 1;
        }

        const offsetPercent = -this.currentSlideIndex * (100 / slideCount);
        container.style.transform = `translateX(${offsetPercent}%)`;

        const dots = sliderSec.querySelectorAll('.slider-dot');
        dots.forEach((dot, idx) => {
            if (idx === this.currentSlideIndex) {
                dot.classList.add('active');
                dot.setAttribute('aria-current', 'true');
                dot.style.background = 'var(--secondary)';
                dot.style.width = '24px';
                dot.style.borderRadius = '12px';
            } else {
                dot.classList.remove('active');
                dot.removeAttribute('aria-current');
                dot.style.background = 'rgba(4, 53, 106, 0.35)';
                dot.style.width = '10px';
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

        dots.forEach((dot, idx) => {
            dot.onclick = () => {
                currentIndex = idx;
                updateUI();
                resetAutoplay();
            };
        });

        const prevBtn = sliderContainer.querySelector('.products-hero-prev');
        const nextBtn = sliderContainer.querySelector('.products-hero-next');
        if (prevBtn) {
            prevBtn.onclick = () => {
                currentIndex = (currentIndex - 1 + slideCount) % slideCount;
                updateUI();
                resetAutoplay();
            };
        }
        if (nextBtn) {
            nextBtn.onclick = () => {
                currentIndex = (currentIndex + 1) % slideCount;
                updateUI();
                resetAutoplay();
            };
        }

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

        updateUI();
        resetAutoplay();
    }

    async renderAboutView(container) {
        // Contact and Settings Data
        const address = await this.db.get('settings', this.lang === 'th' ? 'address_th' : 'address_en');
        const phone = await this.db.get('settings', 'phone');
        const email = await this.db.get('settings', 'email');
        const hours = await this.db.get('settings', this.lang === 'th' ? 'business_hours_th' : 'business_hours_en');

        // Social and Maps Links
        const facebookUrlSetting = await this.db.get('settings', 'facebook_url');
        const facebookLegacySetting = await this.db.get('settings', 'facebook');
        const fbUrl = facebookUrlSetting?.value || facebookLegacySetting?.value || '';
        const fbUrl1 = fbUrl;

        const mapsKey = await this.db.get('settings', 'google_maps_url');
        const mapsUrl = mapsKey?.value || '';
        const mapUrl = mapsUrl;

        const companyName = await this.db.get('settings', this.lang === 'th' ? 'company_name_th' : 'company_name_en');
        const companyNameVal = companyName?.value || (this.lang === 'th' ? 'เจริญ ออน คัพ' : 'Charoen On Cup');

        // Dynamic Hero Title and Subtitle
        const heroTitleKey = await this.db.get('settings', this.lang === 'th' ? 'about_hero_title_th' : 'about_hero_title_en');
        const heroSubKey = await this.db.get('settings', this.lang === 'th' ? 'about_hero_subtitle_th' : 'about_hero_subtitle_en');

        const headingVal = heroTitleKey?.value || (this.lang === 'th' ? 'เกี่ยวกับ เจริญ ออน คัพ' : 'About Charoen On Cup');
        const heroSubVal = heroSubKey?.value || (this.lang === 'th' ? 'โรงงานผลิตและสกรีนแก้วพลาสติก แก้วกระดาษ ครบวงจร' : 'Complete Plastic & Paper Cup Screen Printing Factory');

        // Dynamic Eyebrow, Title, Description, CTA
        const eyebrowKey = await this.db.get('settings', this.lang === 'th' ? 'about_eyebrow_th' : 'about_eyebrow_en');
        const eyebrowVal = eyebrowKey?.value || (this.lang === 'th' ? 'เกี่ยวกับ เจริญ ออน คัพ' : 'ABOUT CHAROEN ON CUP');

        const aboutTitleKey = await this.db.get('settings', this.lang === 'th' ? 'about_title_th' : 'about_title_en');
        const aboutTitleVal = aboutTitleKey?.value || (this.lang === 'th' ? 'โรงงานผลิตและรับสกรีนแก้วพลาสติก แก้วกระดาษ ครบวงจร' : 'Factory for Plastic & Paper Cup Screen Printing');

        const aboutDescKey = await this.db.get('settings', this.lang === 'th' ? 'about_desc_th' : 'about_desc_en');
        const defaultDescTh = 'เจริญ ออน คัพ มุ่งมั่นให้บริการผลิตและสกรีนแก้วพลาสติก แก้วกระดาษ คุณภาพสูง ด้วยระบบการพิมพ์ทันสมัย สีคมชัด ติดทนนาน ไม่หลุดลอก ช่วยเสริมสร้างภาพลักษณ์และเพิ่มมูลค่าให้กับแบรนด์ร้านกาแฟ เครื่องดื่ม ทั่วประเทศไทย';
        const defaultDescEn = 'Charoen On Cup is committed to manufacturing and screen printing high-quality plastic and paper cups with modern printing systems, sharp colors, and durable finish to elevate cafe and beverage brands nationwide.';
        const aboutDescVal = aboutDescKey?.value || (this.lang === 'th' ? defaultDescTh : defaultDescEn);

        const ctaTextKey = await this.db.get('settings', this.lang === 'th' ? 'about_cta_text_th' : 'about_cta_text_en');
        const ctaTextVal = ctaTextKey?.value || (this.lang === 'th' ? 'ดูสินค้าและบริการของเรา' : 'View Products & Services');

        const ctaLinkKey = await this.db.get('settings', 'about_cta_link');
        const ctaLinkVal = ctaLinkKey?.value || '#/products';

        // Dynamic About Hero Image & About Main Company Image
        const aboutHeroImgKey = await this.db.get('settings', 'about_hero_image');
        const aboutImgKey = await this.db.get('settings', 'about_image');

        const rawAboutHeroVal = aboutHeroImgKey?.value || '';
        const rawAboutVal = aboutImgKey?.value || '';

        const aboutHeroImgVal = await this.resolveAboutImageSrc(rawAboutHeroVal || rawAboutVal, 'about_banner.webp');
        const aboutImgVal = await this.resolveAboutImageSrc(rawAboutVal, 'about_banner.webp');

        // Dynamic About Company Gallery Images (Phase A1)
        const aboutGalleryKey = await this.db.get('settings', 'about_gallery_images');
        let rawGalleryVal = aboutGalleryKey?.value;
        let galleryImages = [];

        if (Array.isArray(rawGalleryVal)) {
            galleryImages = rawGalleryVal;
        } else if (typeof rawGalleryVal === 'string' && rawGalleryVal.trim()) {
            try {
                const parsed = JSON.parse(rawGalleryVal);
                if (Array.isArray(parsed)) {
                    galleryImages = parsed;
                } else if (typeof parsed === 'string' && parsed.trim()) {
                    galleryImages = [parsed];
                }
            } catch (e) {
                galleryImages = [rawGalleryVal];
            }
        }

        const validGalleryImages = [];
        if (Array.isArray(galleryImages)) {
            for (const item of galleryImages) {
                if (item && typeof item === 'string' && item.trim()) {
                    const resolved = await this.resolveAboutImageSrc(item);
                    if (resolved && !validGalleryImages.includes(resolved)) {
                        validGalleryImages.push(resolved);
                    }
                }
                if (validGalleryImages.length >= 4) break;
            }
        }

        const galleryHtml = validGalleryImages.length > 0 ? `
            <div class="about-company-gallery" aria-label="${this.lang === 'th' ? 'ภาพบรรยากาศและการดำเนินงานของบริษัท' : 'Company and production gallery'}">
                ${validGalleryImages.map((imgUrl, idx) => `
                    <figure class="about-company-gallery-item">
                        <img src="${imgUrl}" alt="${this.lang === 'th' ? `ภาพบรรยากาศและการดำเนินงานของเจริญ ออน คัพ ลำดับที่ ${idx + 1}` : `Charoen On Cup company and production gallery image ${idx + 1}`}" loading="lazy">
                    </figure>
                `).join('')}
            </div>
        ` : '';

        // Phase A2: ONE-STOP-SHOP Service Showcase Settings
        const bannerTitleKey = await this.db.get('settings', this.lang === 'th' ? 'about_service_banner_title_th' : 'about_service_banner_title_en');
        const bannerSubKey = await this.db.get('settings', this.lang === 'th' ? 'about_service_banner_subtitle_th' : 'about_service_banner_subtitle_en');

        const rawBannerTitle = bannerTitleKey?.value || (this.lang === 'th' ? 'เจริญ ออน คัพ • ONE-STOP-SHOP' : 'CHAROEN ON CUP • ONE-STOP-SHOP');
        const bannerSubVal = bannerSubKey?.value || (this.lang === 'th' ? 'บริการครบจบในที่เดียว' : 'Complete Cup Printing and Packaging Service');

        const bannerTitleVal = typeof rawBannerTitle === 'string' && rawBannerTitle.includes('ONE-STOP-SHOP')
            ? rawBannerTitle.replace('ONE-STOP-SHOP', '<span class="about-one-stop-mobile-break">ONE-STOP-SHOP</span>')
            : rawBannerTitle;

        const serviceItemsKey = await this.db.get('settings', 'about_service_items');
        let serviceItemsList = [];
        if (serviceItemsKey?.value) {
            try {
                serviceItemsList = typeof serviceItemsKey.value === 'string' ? JSON.parse(serviceItemsKey.value) : serviceItemsKey.value;
            } catch (e) {
                serviceItemsList = [];
            }
        }

        const validServiceItems = Array.isArray(serviceItemsList)
            ? serviceItemsList
                .filter(item => item && item.visible !== false && ((item.title_th && item.title_th.trim()) || (item.title_en && item.title_en.trim()) || (item.image && item.image.trim())))
                .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
                .slice(0, 4)
            : [];

        for (const item of validServiceItems) {
            item.resolvedImage = item.image ? (await this.resolveAboutImageSrc(item.image)) : '';
        }



        const legacyHighlights = [
            { icon: 'fas fa-industry', title: this.lang === 'th' ? 'โรงงานผลิตมาตรฐาน' : 'Standard Manufacturing', desc: this.lang === 'th' ? 'ใช้เครื่องจักรสกรีนแก้วทันสมัย ได้มาตรฐานอุตสาหกรรม' : 'Equipped with modern machinery and strict quality control.' },
            { icon: 'fas fa-layer-group', title: this.lang === 'th' ? 'ขั้นต่ำต่ำ เริ่มต้น 1,000 ใบ' : 'Low MOQ Starts 1,000 Pcs', desc: this.lang === 'th' ? 'รองรับทั้งร้านกาแฟเปิดใหม่และธุรกิจขนาดใหญ่' : 'Suitable for both newly opened cafes and large beverage brands.' },
            { icon: 'fas fa-shield-halved', title: this.lang === 'th' ? 'สีสกรีนคมชัด ติดทนนาน' : 'Durable & Safe Printing', desc: this.lang === 'th' ? 'ใช้หมึกพิมพ์ Food Grade ปลอดภัย สีสวยสดใส' : 'Food-Grade inks with vibrant, long-lasting print durability.' }
        ];

        container.innerHTML = `
            <!-- Hero Banner -->
            <div class="subpage-hero-banner about-hero" style="--hero-bg: url('${aboutHeroImgVal}'); --hero-position: center 35%; position: relative; padding: 65px 0; overflow: hidden; text-align: center;">
                <div class="subpage-hero-overlay" style="position: absolute; inset: 0; background: linear-gradient(to right, rgba(4, 53, 106, 0.70), rgba(4, 53, 106, 0.50)); z-index: 1;"></div>
                <div class="container" style="position: relative; z-index: 2;">
                    <h2 class="about-hero-title">
                        ${headingVal}
                    </h2>
                    <p class="about-hero-subtitle">
                        ${heroSubVal}
                    </p>
                </div>
            </div>
            
            <!-- SECTION 1: ABOUT COMPANY -->
            <section class="section-padding" style="background-color: var(--bg-main); padding: 80px 0;">
                <div class="container">
                    <div class="grid-2" style="align-items: center; gap: 48px;">
                        <!-- Left: Single Large Company Image -->
                        <div class="about-image-column" style="position: relative;">
                            <div style="position: relative; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(4, 53, 106, 0.12); border: 1px solid rgba(4, 53, 106, 0.08); background: white;">
                                <img src="${aboutImgVal}" alt="${companyNameVal}" style="width: 100%; height: 480px; object-fit: cover; display: block; transition: transform 0.5s ease;" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'">
                                <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(4, 53, 106, 0.88); backdrop-filter: blur(8px); padding: 16px 20px; border-radius: 12px; color: white; display: flex; align-items: center; gap: 14px;">
                                    <div style="width: 42px; height: 42px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0; color: white;">
                                        <i class="fas fa-award"></i>
                                    </div>
                                    <div>
                                        <strong style="display: block; font-size: 0.95rem; font-weight: 700; color: white;">${companyNameVal}</strong>
                                        <span style="font-size: 0.8rem; color: rgba(255, 255, 255, 0.85);">${this.lang === 'th' ? 'โรงงานรับสกรีนแก้วพลาสติกและแก้วกระดาษ' : 'Certified Cup Screen Printing Factory'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Right: Small Heading, Large Title, Description & Primary CTA -->
                        <div class="about-content-column">
                            <span class="section-eyebrow" style="font-weight: 700; color: var(--accent); font-size: 0.88rem; text-transform: uppercase; letter-spacing: 1.5px; display: inline-flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                                <i class="fas fa-building" style="font-size: 0.8rem;"></i>
                                ${eyebrowVal}
                            </span>
                            <h2 style="font-size: 2.2rem; font-weight: 800; color: var(--secondary); margin-bottom: 24px; line-height: 1.3; font-family: 'Inter', 'Kanit', sans-serif;">
                                ${aboutTitleVal}
                            </h2>
                            <div class="body-text" style="line-height: 1.8; color: var(--text-main); font-size: 1.02rem; margin-bottom: 28px;">
                                ${aboutDescVal}
                            </div>
                            <a href="${ctaLinkVal}" class="btn btn-primary" style="padding: 12px 28px; font-weight: 700; font-size: 0.95rem; border-radius: 30px; display: inline-flex; align-items: center; gap: 10px; box-shadow: 0 4px 15px rgba(255, 107, 0, 0.3); transition: all 0.3s ease;">
                                <span>${ctaTextVal}</span>
                                <i class="fas fa-arrow-right"></i>
                            </a>
                        </div>
                    </div>
                    ${galleryHtml}
                </div>
            </section>
            ${validServiceItems.length > 0 ? `
                <section class="about-one-stop-section">
                    <div class="about-one-stop-banner">
                        <div class="container">
                            <h2 class="about-one-stop-banner-title">${bannerTitleVal}</h2>
                            <p class="about-one-stop-banner-subtitle">${bannerSubVal}</p>
                        </div>
                    </div>

                    <div class="about-service-showcase container">
                        <div class="about-service-grid">
                            ${validServiceItems.map(item => {
                                const itemTitle = this.lang === 'th' ? (item.title_th || item.title_en || '') : (item.title_en || item.title_th || '');
                                const itemDesc = this.lang === 'th' ? (item.desc_th || item.desc_en || '') : (item.desc_en || item.desc_th || '');
                                const fallbackSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f1f5f9'/%3E%3Cpath d='M150 120a20 20 0 1 0 0-40 20 20 0 0 0 0 40zm-60 100h220l-70-80-55 60-35-40-60 60z' fill='%2394a3b8'/%3E%3C/svg%3E`;
                                const imgSrc = item.resolvedImage || fallbackSvg;
                                return `
                                    <article class="about-service-item">
                                        <div class="about-service-img-wrapper">
                                            <img src="${imgSrc}" alt="${itemTitle || 'เจริญ ออน คัพ บริการครบวงจร'}" loading="lazy" onerror="this.onerror=null; this.src='${fallbackSvg}';">
                                        </div>
                                        <div class="about-service-content">
                                            <h3 class="about-service-title">${itemTitle}</h3>
                                            <p class="about-service-desc">${itemDesc}</p>
                                        </div>
                                    </article>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </section>
            ` : `
                <!-- FALLBACK: OLD 5 HIGHLIGHT CARDS SECTION -->
                <section class="section-padding" style="background-color: var(--bg-sec); border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); padding: 75px 0;">
                    <div class="container">
                        <div class="text-center" style="max-width: 750px; margin: 0 auto 48px auto;">
                            <span class="section-eyebrow" style="font-weight: 700; color: var(--accent); font-size: 0.88rem; text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-bottom: 10px;">
                                ${this.lang === 'th' ? 'จุดเด่นของเรา' : 'OUR HIGHLIGHTS'}
                            </span>
                            <h3 style="font-size: 2rem; font-weight: 800; color: var(--secondary); font-family: 'Inter', 'Kanit', sans-serif; margin-bottom: 0;">
                                ${this.lang === 'th' ? 'เหตุผลที่ลูกค้าไว้วางใจ เจริญ ออน คัพ' : 'Why Businesses Choose Charoen On Cup'}
                            </h3>
                        </div>
                        
                        <div class="about-highlights-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;">
                            ${legacyHighlights.map((h, idx) => `
                                <div class="about-highlight-card" style="background: white; padding: 32px 24px; border-radius: 16px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04); border: 1px solid rgba(4, 53, 106, 0.08); border-top: 4px solid ${idx % 2 === 0 ? 'var(--primary)' : 'var(--accent)'}; transition: transform 0.3s ease, box-shadow 0.3s ease;">
                                    <div style="width: 54px; height: 54px; border-radius: 12px; background: rgba(255, 107, 0, 0.08); color: var(--accent); display: flex; align-items: center; justify-content: center; font-size: 1.4rem; margin-bottom: 20px;">
                                        <i class="${h.icon}"></i>
                                    </div>
                                    <h4 style="font-size: 1.15rem; font-weight: 800; color: var(--secondary); margin-bottom: 10px; font-family: 'Inter', 'Kanit', sans-serif;">
                                        ${h.title}
                                    </h4>
                                    <p style="font-size: 0.92rem; color: var(--text-main); line-height: 1.65; margin: 0;">
                                        ${h.desc}
                                    </p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </section>
            `}



            <!-- SECTION 3: CONTACT INFORMATION (Centered Premium Contact Card) -->
            <section class="section-padding" style="background-color: var(--bg-main); padding: 80px 0;">
                <div class="container">
                    <div class="about-contact-card" style="max-width: 920px; margin: 0 auto; background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); border-radius: 20px; padding: 48px 40px; box-shadow: 0 20px 48px rgba(4, 53, 106, 0.09); border: 1px solid rgba(4, 53, 106, 0.12); position: relative; overflow: hidden;">
                        <div style="position: absolute; top: 0; left: 0; width: 6px; height: 100%; background: var(--primary);"></div>
                        
                        <div class="text-center" style="margin-bottom: 36px;">
                            <div style="width: 60px; height: 60px; border-radius: 50%; background: rgba(4, 53, 106, 0.08); color: var(--primary); display: inline-flex; align-items: center; justify-content: center; font-size: 1.6rem; margin-bottom: 16px;">
                                <i class="fas fa-building"></i>
                            </div>
                            <h3 style="font-size: 1.8rem; font-weight: 800; color: var(--secondary); font-family: 'Inter', 'Kanit', sans-serif; margin-bottom: 8px;">
                                ${this.lang === 'th' ? 'ข้อมูลการติดต่อ และโรงงาน' : 'Factory & Contact Details'}
                            </h3>
                            <p style="color: var(--text-muted); font-size: 0.95rem; margin: 0;">
                                ${this.lang === 'th' ? 'ติดต่อสอบถาม สั่งซื้อ หรือเยี่ยมชมโรงงานของเรา' : 'Get in touch or visit our factory for inquiries and orders'}
                            </p>
                        </div>

                        <div class="about-contact-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin-bottom: 36px;">
                            <!-- Address -->
                            <div style="display: flex; gap: 16px; align-items: flex-start; background: white; padding: 20px; border-radius: 12px; border: 1px solid rgba(4, 53, 106, 0.06); box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
                                <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(255, 107, 0, 0.1); color: var(--accent); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0;">
                                    <i class="fas fa-map-marker-alt"></i>
                                </div>
                                <div>
                                    <strong style="display: block; color: var(--secondary); font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
                                        ${this.lang === 'th' ? 'ที่อยู่โรงงาน' : 'Factory Address'}
                                    </strong>
                                    <span style="font-size: 0.95rem; color: var(--text-main); line-height: 1.5;">${address?.value || (this.lang === 'th' ? 'กรุงเทพมหานคร ประเทศไทย' : 'Bangkok, Thailand')}</span>
                                </div>
                            </div>

                            <!-- Phone -->
                            <div style="display: flex; gap: 16px; align-items: flex-start; background: white; padding: 20px; border-radius: 12px; border: 1px solid rgba(4, 53, 106, 0.06); box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
                                <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(4, 53, 106, 0.1); color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0;">
                                    <i class="fas fa-phone-alt"></i>
                                </div>
                                <div>
                                    <strong style="display: block; color: var(--secondary); font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
                                        ${this.lang === 'th' ? 'เบอร์โทรศัพท์' : 'Phone Number'}
                                    </strong>
                                    <span style="font-size: 0.95rem; color: var(--text-main); line-height: 1.5;">${phone?.value || '095-430-5225'}</span>
                                </div>
                            </div>

                            <!-- Email -->
                            <div style="display: flex; gap: 16px; align-items: flex-start; background: white; padding: 20px; border-radius: 12px; border: 1px solid rgba(4, 53, 106, 0.06); box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
                                <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(255, 107, 0, 0.1); color: var(--accent); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0;">
                                    <i class="fas fa-envelope"></i>
                                </div>
                                <div>
                                    <strong style="display: block; color: var(--secondary); font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
                                        ${this.lang === 'th' ? 'อีเมลติดต่อ' : 'Email Address'}
                                    </strong>
                                    <span style="font-size: 0.95rem; color: var(--text-main); line-height: 1.5;">${email?.value || 'info@charoenoncup.com'}</span>
                                </div>
                            </div>

                            <!-- Hours -->
                            <div style="display: flex; gap: 16px; align-items: flex-start; background: white; padding: 20px; border-radius: 12px; border: 1px solid rgba(4, 53, 106, 0.06); box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
                                <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(4, 53, 106, 0.1); color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0;">
                                    <i class="fas fa-clock"></i>
                                </div>
                                <div>
                                    <strong style="display: block; color: var(--secondary); font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
                                        ${this.lang === 'th' ? 'เวลาทำการ' : 'Business Hours'}
                                    </strong>
                                    <span style="font-size: 0.95rem; color: var(--text-main); line-height: 1.5;">${hours?.value || (this.lang === 'th' ? 'จันทร์ - เสาร์: 08:30 - 17:30 น.' : 'Mon - Sat: 08:30 - 17:30')}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Facebook & Google Maps Buttons -->
                        <div style="display: flex; justify-content: center; gap: 16px; flex-wrap: wrap;">
                            ${(fbUrl || fbUrl1) ? `
                                <a href="${fbUrl || fbUrl1}" target="_blank" class="btn" style="background: #1877f2; color: white; padding: 12px 28px; border-radius: 30px; font-weight: 700; font-size: 0.95rem; display: inline-flex; align-items: center; gap: 10px; box-shadow: 0 4px 15px rgba(24, 119, 242, 0.3); transition: all 0.3s ease;">
                                    <i class="fab fa-facebook-f" style="font-size: 1.1rem;"></i>
                                    <span>Facebook Fanpage</span>
                                </a>
                            ` : ''}
                            ${(mapsUrl || mapUrl) ? `
                                <a href="${mapsUrl || mapUrl}" target="_blank" class="btn" style="background: var(--primary); color: white; padding: 12px 28px; border-radius: 30px; font-weight: 700; font-size: 0.95rem; display: inline-flex; align-items: center; gap: 10px; box-shadow: 0 4px 15px rgba(4, 53, 106, 0.3); transition: all 0.3s ease;">
                                    <i class="fas fa-map-marked-alt" style="font-size: 1.1rem;"></i>
                                    <span>${this.lang === 'th' ? 'ดูตำแหน่งบน Google Maps' : 'View on Google Maps'}</span>
                                </a>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    async renderProductsView(container, params) {
        const categories = await this.db.getAll('categories');
        const products = await this.db.getAll('products');
        const slides = await this.db.getAll('product_slider');
        const visibleSlides = slides.filter(slide => 
            slide.visible !== false && 
            slide.visible !== 'false' && 
            slide.published !== false && 
            slide.published !== 'false'
        );
        const sortedSlides = [...visibleSlides].sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
        
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
                    ${sortedSlides.length > 1 ? `
                        <button class="products-hero-arrow products-hero-prev" aria-label="Previous Slide"><i class="fas fa-chevron-left"></i></button>
                        <button class="products-hero-arrow products-hero-next" aria-label="Next Slide"><i class="fas fa-chevron-right"></i></button>
                    ` : ''}
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

    getPortfolioPreviewImages(item, maxLimit = 6) {
        if (!item) return [];
        const extractUrl = (entry) => {
            if (!entry) return null;
            if (typeof entry === 'string') {
                const s = entry.trim();
                return s && s.toLowerCase() !== 'null' && s.toLowerCase() !== 'undefined' ? s : null;
            }
            if (typeof entry === 'object') {
                const candidate = entry.image_src || entry.src || entry.url || entry.image_url || entry.cover_image;
                if (candidate && typeof candidate === 'string') {
                    const s = candidate.trim();
                    return s && s.toLowerCase() !== 'null' && s.toLowerCase() !== 'undefined' ? s : null;
                }
            }
            return null;
        };

        const set = new Set();
        const cover = this.getPortfolioCoverImage(item);
        if (cover) set.add(cover);

        const checkAndAdd = (val) => {
            if (!val) return;
            let list = [];
            if (Array.isArray(val)) {
                list = val;
            } else if (typeof val === 'string') {
                try {
                    list = JSON.parse(val);
                } catch(e) {
                    const url = extractUrl(val);
                    if (url) set.add(url);
                    return;
                }
            } else if (typeof val === 'object') {
                list = [val];
            }
            if (Array.isArray(list)) {
                list.forEach(entry => {
                    const url = extractUrl(entry);
                    if (url) set.add(url);
                });
            }
        };

        checkAndAdd(item.image_src);
        checkAndAdd(item.cover_image);
        checkAndAdd(item.coverImageUrl);
        checkAndAdd(item.gallery_images);
        checkAndAdd(item.gallery);
        checkAndAdd(item.images);

        return Array.from(set).slice(0, maxLimit);
    }

    stopAllPortfolioPreviews() {
        if (this.activePortfolioPreview) {
            const { card, hoverTimeout, cycleInterval, primaryImg, secondaryImg, counterEl, coverSrc } = this.activePortfolioPreview;
            if (hoverTimeout) clearTimeout(hoverTimeout);
            if (cycleInterval) clearInterval(cycleInterval);

            if (card) {
                card.classList.remove('is-preview-active');
                if (primaryImg) {
                    primaryImg.src = coverSrc;
                    primaryImg.style.opacity = '1';
                }
                if (secondaryImg) {
                    secondaryImg.style.opacity = '0';
                    secondaryImg.src = '';
                }
                if (counterEl) {
                    counterEl.style.display = 'none';
                    counterEl.textContent = '';
                }
            }
            this.activePortfolioPreview = null;
        }
    }

    initPortfolioSmartPreview(container) {
        if (!container) return;

        if (!this.hasAttachedPreviewGlobalListeners) {
            this.hasAttachedPreviewGlobalListeners = true;
            const stopHandler = () => this.stopAllPortfolioPreviews();
            document.addEventListener('visibilitychange', stopHandler);
            window.addEventListener('pagehide', stopHandler);
            window.addEventListener('beforeunload', stopHandler);
        }

        const cards = container.querySelectorAll('.portfolio-card[data-portfolio-id]');
        cards.forEach(card => {
            if (card.dataset.previewBound) return;
            card.dataset.previewBound = 'true';

            card.addEventListener('pointerenter', async (e) => {
                if (e.pointerType === 'touch') return;
                if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
                if (window.innerWidth <= 1024) return;
                if (document.visibilityState !== 'visible') return;
                if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

                const itemId = card.getAttribute('data-portfolio-id');
                let item = (this.portfolioCache || this.portfolioItemsToRender || []).find(i => String(i.id) === String(itemId));
                if (!item && this.db) {
                    try {
                        item = await this.db.get('portfolio', itemId);
                    } catch (err) {}
                }
                if (!item) return;

                const previewList = this.getPortfolioPreviewImages(item, 6);
                if (previewList.length < 2) return;

                this.stopAllPortfolioPreviews();

                const coverSrc = this.getPortfolioCoverImage(item);
                const primaryImg = card.querySelector('.portfolio-card-preview-primary');
                const secondaryImg = card.querySelector('.portfolio-card-preview-secondary');
                const counterEl = card.querySelector('.portfolio-card-preview-counter');

                let currentIndex = 0;
                let activeLayer = 0;

                const hoverTimeout = setTimeout(() => {
                    if (!card.matches(':hover')) return;

                    card.classList.add('is-preview-active');
                    if (counterEl) {
                        counterEl.textContent = `1 / ${previewList.length}`;
                        counterEl.style.display = 'inline-block';
                    }

                    const cycleInterval = setInterval(() => {
                        if (document.visibilityState !== 'visible' || !card.matches(':hover')) {
                            this.stopAllPortfolioPreviews();
                            return;
                        }

                        const nextIndex = (currentIndex + 1) % previewList.length;
                        const nextSrc = previewList[nextIndex];

                        const targetImg = activeLayer === 0 ? secondaryImg : primaryImg;
                        const currentImg = activeLayer === 0 ? primaryImg : secondaryImg;

                        if (!targetImg) return;

                        const tempImg = new Image();
                        tempImg.onload = () => {
                            if (!this.activePortfolioPreview || this.activePortfolioPreview.card !== card) return;

                            targetImg.src = nextSrc;
                            targetImg.style.opacity = '1';
                            if (currentImg) currentImg.style.opacity = '0';

                            activeLayer = activeLayer === 0 ? 1 : 0;
                            currentIndex = nextIndex;

                            if (counterEl) {
                                counterEl.textContent = `${currentIndex + 1} / ${previewList.length}`;
                            }
                        };
                        tempImg.onerror = () => {
                            currentIndex = nextIndex;
                        };
                        tempImg.src = nextSrc;
                    }, 1000);

                    if (this.activePortfolioPreview) {
                        this.activePortfolioPreview.cycleInterval = cycleInterval;
                    }
                }, 280);

                this.activePortfolioPreview = {
                    card,
                    hoverTimeout,
                    cycleInterval: null,
                    primaryImg,
                    secondaryImg,
                    counterEl,
                    coverSrc
                };
            });

            card.addEventListener('pointerleave', () => {
                if (this.activePortfolioPreview && this.activePortfolioPreview.card === card) {
                    this.stopAllPortfolioPreviews();
                }
            });
        });
    }

    renderPortfolioSkeletonHTML(count = 6) {
        let html = `<div class="portfolio-grid portfolio-skeleton-grid" aria-hidden="true">`;
        for (let i = 0; i < count; i++) {
            html += `
                <div class="portfolio-card portfolio-skeleton-card" tabindex="-1" aria-hidden="true">
                    <div class="portfolio-card-image-wrapper skeleton-box skeleton-shimmer"></div>
                    <div class="portfolio-card-overlay skeleton-overlay">
                        <div class="skeleton-pill skeleton-shimmer" style="width: 35%; height: 18px; border-radius: 12px; margin-bottom: 8px;"></div>
                        <div class="skeleton-line skeleton-shimmer" style="width: 75%; height: 22px; border-radius: 4px; margin-bottom: 10px;"></div>
                        <div class="skeleton-line skeleton-shimmer" style="width: 90%; height: 14px; border-radius: 4px; margin-bottom: 6px;"></div>
                        <div class="skeleton-line skeleton-shimmer" style="width: 60%; height: 14px; border-radius: 4px; margin-bottom: 16px;"></div>
                        <div class="skeleton-btn skeleton-shimmer" style="width: 45%; height: 32px; border-radius: 6px; margin-top: auto;"></div>
                    </div>
                </div>
            `;
        }
        html += `</div>`;
        return html;
    }

    getPortfolioBatchSize() {
        const width = window.innerWidth;
        if (width >= 1024) return 12;
        if (width >= 768) return 8;
        return 6;
    }

    renderPortfolioCardItemHTML(item, categories) {
        const catObj = categories.find(c => c.id === item.category);
        const catName = catObj ? (this.lang === 'th' ? catObj.name_th : catObj.name_en) : '';

        // Safely count gallery images
        const previewImages = this.getPortfolioPreviewImages(item, 6);
        const galleryCount = Math.max(previewImages.length, (item.gallery_images ? (Array.isArray(item.gallery_images) ? item.gallery_images.length : 1) : 1));

        // String validation helper
        const isValidString = (val) => {
            if (val === null || val === undefined) return false;
            const s = String(val).trim();
            const lower = s.toLowerCase();
            return s !== '' && lower !== 'null' && lower !== 'undefined';
        };

        // Validate quantity text
        const rawQty = item.quantity || item.qty || item.minimum_order || item.min_order || item.amount;
        const qtyText = isValidString(rawQty) ? String(rawQty).trim() : '';

        const itemTitle = this.lang === 'th' ? (item.title_th || item.title_en) : (item.title_en || item.title_th);

        const isFeatured = Boolean(item.featured || item.is_featured || item.featured_status);
        const coverSrc = this.getPortfolioCoverImage(item);

        return `
            <div class="portfolio-card portfolio-card-batch-fade" data-portfolio-id="${item.id}" onclick="window.charoenApp.openPortfolioDetails('${item.id}')" tabindex="0" role="button" aria-label="${this.lang === 'th' ? 'ดูรายละเอียดผลงาน ' + (itemTitle || '') : 'View details of ' + (itemTitle || '')}" onkeydown="if(event.key === 'Enter' || event.key === ' ') { event.preventDefault(); window.charoenApp.openPortfolioDetails('${item.id}'); }">
                <div class="portfolio-card-image-wrapper">
                    <img class="portfolio-card-image portfolio-card-preview-primary skeleton-shimmer" src="${coverSrc}" alt="${itemTitle || 'Portfolio'}" loading="lazy" onload="this.classList.remove('skeleton-shimmer')" onerror="this.classList.remove('skeleton-shimmer'); this.src='coffee_bg.webp';">
                    <img class="portfolio-card-preview-secondary" aria-hidden="true" alt="">

                    <div class="portfolio-card-top-badges">
                        <div class="portfolio-card-badge-group-left">
                            ${isValidString(catName) ? `
                                <span class="portfolio-card-category-badge">
                                    ${catName}
                                </span>
                            ` : ''}
                            ${isFeatured ? `
                                <span class="portfolio-card-featured-badge">
                                    <i class="fas fa-star"></i> ${this.lang === 'th' ? 'เด่น' : 'Featured'}
                                </span>
                            ` : ''}
                        </div>

                        ${galleryCount > 1 ? `
                            <span class="portfolio-card-count-badge">
                                <i class="fas fa-camera"></i> ${galleryCount}
                            </span>
                        ` : ''}
                    </div>

                    <span class="portfolio-card-preview-counter" aria-hidden="true" style="display: none;">1 / ${previewImages.length}</span>
                </div>

                <div class="portfolio-card-overlay">
                    <h3 class="portfolio-card-title">${itemTitle || ''}</h3>
                    ${isValidString(qtyText) ? `
                        <div class="portfolio-card-qty">
                            <i class="fas fa-boxes"></i> ${qtyText}
                        </div>
                    ` : ''}
                    <div class="portfolio-card-cta">
                        <span>${this.lang === 'th' ? 'ดูรายละเอียด' : 'View Details'}</span>
                        <i class="fas fa-arrow-right"></i>
                    </div>
                </div>
            </div>
        `;
    }

               
  

    async loadNextPortfolioBatch(cardsContainer, skeletonWrapper, sentinel, endMessage, categories) {
        if (this.portfolioIsLoadingMore) return;
        if (!this.portfolioItemsToRender || this.portfolioCurrentIndex >= this.portfolioItemsToRender.length) {
            if (endMessage) endMessage.style.display = 'block';
            if (this.portfolioObserver && sentinel) {
                this.portfolioObserver.unobserve(sentinel);
                this.portfolioObserver.disconnect();
                this.portfolioObserver = null;
            }
            return;
        }

        this.portfolioIsLoadingMore = true;
        if (skeletonWrapper) {
            skeletonWrapper.style.display = 'block';
        }

        // Smooth natural pause to indicate batch loading
        await new Promise(resolve => setTimeout(resolve, 280));

        const batchSize = this.getPortfolioBatchSize();
        const nextBatch = this.portfolioItemsToRender.slice(
            this.portfolioCurrentIndex,
            this.portfolioCurrentIndex + batchSize
        );

        if (nextBatch.length > 0 && cardsContainer) {
            const batchHtml = nextBatch.map(item => this.renderPortfolioCardItemHTML(item, categories)).join('');
            cardsContainer.insertAdjacentHTML('beforeend', batchHtml);
            this.portfolioCurrentIndex += nextBatch.length;
            this.initPortfolioSmartPreview(cardsContainer);
        }

        if (skeletonWrapper) {
            skeletonWrapper.style.display = 'none';
        }

        this.portfolioIsLoadingMore = false;

        if (this.portfolioCurrentIndex >= this.portfolioItemsToRender.length) {
            if (endMessage) endMessage.style.display = 'block';
            if (this.portfolioObserver && sentinel) {
                this.portfolioObserver.unobserve(sentinel);
                this.portfolioObserver.disconnect();
                this.portfolioObserver = null;
            }
        }
    }

    async renderPortfolioView(container, params) {
        // Display responsive skeleton cards while fetching data
        if (container) {
            const skeletonCount = window.innerWidth < 768 ? 3 : (window.innerWidth < 1024 ? 4 : 6);
            container.innerHTML = `
                <div class="portfolio-view-skeleton-wrapper" aria-hidden="true" style="padding: 40px 0; background: var(--bg-main);">
                    <div class="container">
                        <div style="margin-bottom: 30px; text-align: center;">
                            <div class="skeleton-line skeleton-shimmer" style="width: 240px; height: 32px; margin: 0 auto 12px auto; border-radius: 6px;"></div>
                            <div class="skeleton-line skeleton-shimmer" style="width: 380px; max-width: 90%; height: 16px; margin: 0 auto; border-radius: 4px;"></div>
                        </div>
                        ${this.renderPortfolioSkeletonHTML(skeletonCount)}
                    </div>
                </div>
            `;
        }

        // Clean up any active observer from previous view or category filter switch
        if (this.portfolioObserver) {
            this.portfolioObserver.disconnect();
            this.portfolioObserver = null;
        }

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

        // Reset and initialize infinite scroll state variables
        this.portfolioItemsToRender = filteredPortfolio;
        this.portfolioCurrentIndex = 0;
        this.portfolioIsLoadingMore = false;

        const batchSize = this.getPortfolioBatchSize();
        const initialBatch = filteredPortfolio.slice(0, batchSize);
        this.portfolioCurrentIndex = initialBatch.length;

        // Extract Portfolio Hero specific settings (100% independent from Homepage Hero)
        const portHeroTitleThSetting = await this.db.get('settings', 'portfolio_hero_title_th');
        const portHeroTitleEnSetting = await this.db.get('settings', 'portfolio_hero_title_en');
        const portHeroDescThSetting = await this.db.get('settings', 'portfolio_hero_desc_th');
        const portHeroDescEnSetting = await this.db.get('settings', 'portfolio_hero_desc_en');
        const portHeroHeightSetting = await this.db.get('settings', 'portfolio_hero_height');

        const heroTitleTh = portHeroTitleThSetting?.value || this.t('nav_portfolio');
        const heroTitleEn = portHeroTitleEnSetting?.value || 'Our Portfolio';
        const heroDescTh = portHeroDescThSetting?.value || (this.lang === 'th' ? 'รวมภาพตัวอย่างผลงานสกรีนจริงจากแบรนด์เครื่องดื่มและร้านกาแฟชั้นนำทั่วประเทศ' : 'Real-world screen printing portfolio from leading beverage brands & cafes.');
        const heroDescEn = portHeroDescEnSetting?.value || 'Real-world screen printing portfolio from leading beverage brands & cafes.';
        const heroHeightVal = portHeroHeightSetting?.value || 'default';

        let heroPaddingStyle = 'padding: 60px 0;';
        if (heroHeightVal === 'compact') heroPaddingStyle = 'padding: 38px 0;';
        else if (heroHeightVal === 'tall') heroPaddingStyle = 'padding: 90px 0;';

        const bgStyle = await this.getSetting('portfolio_hero_background_style', 'image');
        let bgImg = await this.getSetting('portfolio_hero_background_image', 'portfolio_banner.webp');
        if (!bgImg) bgImg = 'portfolio_banner.webp';

        if (typeof bgImg === 'object' && bgImg !== null) {
            bgImg = bgImg.url || bgImg.image_src || bgImg.src || bgImg.path || 'portfolio_banner.webp';
        }

        if (bgImg && !bgImg.startsWith('data:') && !bgImg.startsWith('http') && !bgImg.includes('/') && !bgImg.endsWith('.webp') && !bgImg.endsWith('.jpg') && !bgImg.endsWith('.png')) {
            try {
                const mediaItem = await this.db.getAll('media').then(list => list.find(m => m.name === bgImg || m.id === bgImg));
                if (mediaItem && mediaItem.image_src) {
                    bgImg = mediaItem.image_src;
                }
            } catch (e) {
                console.warn("Failed to lookup media item for portfolio hero background:", e);
            }
        }

        const rawOverlay = await this.getSetting('portfolio_hero_background_overlay', 55);
        const bgOverlay = (function(raw) {
            if (raw === undefined || raw === null || raw === '') return 55;
            let val = Number(raw);
            if (!Number.isFinite(val)) return 55;
            if (val > 0 && val <= 1) val = val * 100;
            return Math.min(80, Math.max(0, Math.round(val)));
        })(rawOverlay);

        const bgPos = await this.getSetting('portfolio_hero_background_position', 'center center');
        const bgBrightnessRaw = await this.getSetting('portfolio_hero_background_brightness', 100);
        const bgBrightness = parseInt(bgBrightnessRaw) || 100;
        const bgTextTheme = await this.getSetting('portfolio_hero_background_text_theme', 'auto');

        const hasBgImg = (bgStyle === 'image' || bgStyle === 'image_line_art') && Boolean(bgImg);
        const hasLineArt = bgStyle === 'line_art' || bgStyle === 'image_line_art';

        const isLightText = (hasBgImg && (bgTextTheme === 'auto' || bgTextTheme === 'light')) || bgTextTheme === 'light';
        const titleColorStyle = isLightText ? 'color: #ffffff !important;' : '';
        const descColorStyle = isLightText ? 'color: rgba(255, 255, 255, 0.88) !important;' : 'color: var(--text-muted);';

        const coffeeBgPatternLeft = `
            <svg class="pattern-left-art" viewBox="0 0 360 480" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
                <g transform="translate(10, 40)" opacity="0.5">
                    <path d="M 40 80 Q 70 20 120 80 T 200 80" />
                    <path d="M 30 140 Q 90 90 150 140 T 270 140" />
                    <path d="M 60 200 C 100 150 140 250 200 200" />
                    <circle cx="80" cy="260" r="18" />
                    <circle cx="160" cy="280" r="12" />
                </g>
            </svg>
        `;
        const coffeeBgPatternRight = `
            <svg class="pattern-right-art" viewBox="0 0 360 480" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
                <g transform="translate(40, 40)" opacity="0.5">
                    <path d="M 120 80 Q 170 20 220 80 T 300 80" />
                    <path d="M 90 140 Q 150 90 210 140 T 310 140" />
                    <path d="M 100 200 C 140 150 180 250 240 200" />
                    <circle cx="220" cy="260" r="18" />
                    <circle cx="140" cy="280" r="12" />
                </g>
            </svg>
        `;

        const contactVisible = await this.getSetting('contact_visible', 'true');

        let html = `
            <div class="subpage-hero-banner section-bg-manager ${hasBgImg ? 'has-bg-image' : ''}" style="position: relative; overflow: hidden; background-color: ${hasBgImg ? 'transparent' : 'var(--bg-sec)'}; border-bottom: 1px solid var(--border-color); ${heroPaddingStyle}" data-overlay="${bgOverlay}">
                ${hasBgImg ? `
                    <!-- Background Image Layer -->
                    <div class="sec-bg-image-layer" style="
                        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                        background-image: url(&quot;${bgImg}&quot;);
                        background-size: cover;
                        background-position: ${bgPos};
                        filter: brightness(${bgBrightness}%);
                        z-index: 0;
                        pointer-events: none;
                    "></div>
                    <!-- Dark Overlay Layer -->
                    <div class="sec-bg-overlay-layer" style="
                        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                        background-color: rgba(0, 0, 0, ${bgOverlay / 100});
                        z-index: 0;
                        pointer-events: none;
                    "></div>
                ` : ''}

                ${hasLineArt ? `
                    <div class="section-pattern-wrapper ${hasBgImg ? 'pattern-white-tint' : ''}" style="z-index: 1;">
                        ${coffeeBgPatternLeft}
                        ${coffeeBgPatternRight}
                    </div>
                ` : ''}

                <div class="container text-center" style="position: relative; z-index: 2;">
                    <h2 style="${titleColorStyle}">${this.lang === 'th' ? heroTitleTh : heroTitleEn}</h2>
                    <p style="${descColorStyle}">${this.lang === 'th' ? heroDescTh : heroDescEn}</p>
                </div>
            </div>
            
            <div class="container portfolio-layout">
                <!-- Top Horizontal Category Filter Pills (Mobile/Tablet <= 1024px) -->
                <div class="search-filter-bar portfolio-top-filter-bar" style="margin-bottom: 24px;">
                    <div class="category-filter-pills" role="tablist" aria-label="${this.lang === 'th' ? 'เลือกหมวดหมู่ผลงาน' : 'Select portfolio category'}">
                        <a href="#/portfolio?category=all" class="pill ${activeCatId === 'all' ? 'active' : ''}" role="tab" aria-selected="${activeCatId === 'all' ? 'true' : 'false'}" aria-label="${this.lang === 'th' ? 'ทั้งหมด ' + counts.all + ' รายการ' : 'All ' + counts.all + ' items'}">
                            ${this.t('portfolio_all')} (${counts.all})
                        </a>
                        ${categories.map(cat => {
                            const count = counts[cat.id] || 0;
                            const catName = this.lang === 'th' ? cat.name_th : cat.name_en;
                            return `
                                <a href="#/portfolio?category=${cat.id}" class="pill ${activeCatId === cat.id ? 'active' : ''}" role="tab" aria-selected="${activeCatId === cat.id ? 'true' : 'false'}" aria-label="${catName} ${count} ${this.lang === 'th' ? 'รายการ' : 'items'}">
                                    ${catName} (${count})
                                </a>
                            `;
                        }).join('')}
                    </div>
                </div>

                <!-- Portfolio Desktop Workspace Layout -->
                <div class="portfolio-workspace">
                    <!-- Desktop Sidebar (Visible >= 1025px) -->
                    <aside class="portfolio-sidebar" aria-label="${this.lang === 'th' ? 'ตัวกรองผลงาน' : 'Portfolio filters'}">
                        <div class="portfolio-sidebar-inner">
                            <!-- Search Shell -->
                            <div class="portfolio-sidebar-widget">
                                <label for="portfolio-sidebar-search" class="portfolio-sidebar-title">
                                    <i class="fas fa-search" style="color: var(--accent); margin-right: 6px;"></i>
                                    ${this.lang === 'th' ? 'ค้นหาผลงาน' : 'Search Portfolio'}
                                </label>
                                <div class="portfolio-sidebar-search-box">
                                    <input type="text" id="portfolio-sidebar-search" class="form-control" placeholder="${this.lang === 'th' ? 'พิมพ์คำค้นหา...' : 'Search keyword...'}" value="${params?.get('q') || ''}" readonly style="cursor: not-allowed; opacity: 0.8; font-size: 0.85rem;" title="${this.lang === 'th' ? 'ระบบค้นหากำลังจะเปิดใช้งาน' : 'Search UI shell'}">
                                </div>
                            </div>

                            <!-- Categories Shell -->
                            <div class="portfolio-sidebar-widget">
                                <h3 class="portfolio-sidebar-title">
                                    <i class="fas fa-layer-group" style="color: var(--primary); margin-right: 6px;"></i>
                                    ${this.lang === 'th' ? 'หมวดหมู่ผลงาน' : 'Portfolio Categories'}
                                </h3>
                                <ul class="portfolio-sidebar-cat-list" role="list">
                                    <li>
                                        <a href="#/portfolio?category=all" class="portfolio-sidebar-cat-item ${activeCatId === 'all' ? 'active' : ''}" ${activeCatId === 'all' ? 'aria-current="page"' : ''}>
                                            <span>${this.t('portfolio_all')}</span>
                                            <span class="portfolio-sidebar-count">${counts.all}</span>
                                        </a>
                                    </li>
                                    ${categories.map(cat => {
                                        const count = counts[cat.id] || 0;
                                        const catName = this.lang === 'th' ? cat.name_th : cat.name_en;
                                        return `
                                            <li>
                                                <a href="#/portfolio?category=${cat.id}" class="portfolio-sidebar-cat-item ${activeCatId === cat.id ? 'active' : ''}" ${activeCatId === cat.id ? 'aria-current="page"' : ''}>
                                                    <span>${catName}</span>
                                                    <span class="portfolio-sidebar-count">${count}</span>
                                                </a>
                                            </li>
                                        `;
                                    }).join('')}
                                </ul>
                            </div>

                            <!-- Sort Shell -->
                            <div class="portfolio-sidebar-widget">
                                <label for="portfolio-sidebar-sort" class="portfolio-sidebar-title">
                                    <i class="fas fa-sort-amount-down" style="color: var(--primary); margin-right: 6px;"></i>
                                    ${this.lang === 'th' ? 'เรียงลำดับ' : 'Sort By'}
                                </label>
                                <select id="portfolio-sidebar-sort" class="form-control" disabled style="cursor: not-allowed; opacity: 0.8; font-size: 0.85rem;">
                                    <option value="default">${this.lang === 'th' ? 'ลำดับแนะนำ (Default)' : 'Featured First'}</option>
                                </select>
                            </div>

                            ${activeCatId !== 'all' ? `
                                <div class="portfolio-sidebar-widget" style="border-bottom: none; padding-bottom: 0;">
                                    <a href="#/portfolio?category=all" class="portfolio-sidebar-reset-btn">
                                        <i class="fas fa-undo"></i>
                                        <span>${this.lang === 'th' ? 'ล้างตัวกรองทั้งหมด' : 'Reset All Filters'}</span>
                                    </a>
                                </div>
                            ` : ''}
                        </div>
                    </aside>

                    <!-- Main Results Content Column -->
                    <main class="portfolio-results">
                        <!-- Results Toolbar -->
                        <div class="portfolio-results-toolbar">
                            <div class="portfolio-results-count">
                                <i class="fas fa-images" style="color: var(--accent); margin-right: 6px;"></i>
                                <span>${this.lang === 'th' ? `ทั้งหมด ${filteredPortfolio.length} รายการ` : `Showing ${filteredPortfolio.length} items`}</span>
                            </div>
                            ${activeCatId !== 'all' ? `
                                <div class="portfolio-results-active-tag">
                                    <span>${categories.find(c => c.id === activeCatId) ? (this.lang === 'th' ? categories.find(c => c.id === activeCatId).name_th : categories.find(c => c.id === activeCatId).name_en) : activeCatId}</span>
                                    <a href="#/portfolio?category=all" aria-label="${this.lang === 'th' ? 'ยกเลิกตัวกรองหมวดหมู่' : 'Clear category filter'}"><i class="fas fa-times"></i></a>
                                </div>
                            ` : ''}
                        </div>

                        ${filteredPortfolio.length === 0 ? `
                            <div style="text-align:center; padding:80px 20px; border:1px dashed var(--border-color); border-radius:var(--radius-lg); background:var(--bg-main);">
                                <i class="fas fa-images" style="font-size:3rem; color:var(--text-muted); margin-bottom:16px;"></i>
                                <p style="color:var(--text-muted); margin-bottom:16px; font-weight:500;">${this.t('portfolio_empty')}</p>
                                ${contactVisible !== 'false' ? `
                                    <a href="#/contact" class="btn btn-primary" style="font-size:0.9rem; display:inline-flex; align-items:center; gap:8px;">
                                        <i class="fas fa-envelope"></i> ${this.lang === 'th' ? 'ติดต่อเรา' : 'Contact Us'}
                                    </a>
                                ` : ''}
                            </div>
                        ` : `
                            <div class="portfolio-grid portfolio-grid-content-fade" id="portfolio-cards-container">
                                ${initialBatch.map(item => this.renderPortfolioCardItemHTML(item, categories)).join('')}
                            </div>

                            <div id="portfolio-infinite-skeleton-wrapper" style="margin-top: 24px; display: none;" aria-hidden="true">
                                ${this.renderPortfolioSkeletonHTML(window.innerWidth < 768 ? 2 : 4)}
                            </div>

                            <div id="portfolio-scroll-sentinel" aria-hidden="true" style="height: 20px; margin-top: 10px; width: 100%;"></div>

                            <div id="portfolio-end-message" style="display: ${this.portfolioCurrentIndex >= filteredPortfolio.length ? 'block' : 'none'}; text-align: center; padding: 40px 20px; color: var(--text-muted); font-size: 0.95rem; font-weight: 500;">
                                <i class="fas fa-check-circle" style="color: var(--accent); margin-right: 8px;"></i>
                                ${this.lang === 'th' ? 'คุณได้ดูผลงานทั้งหมดแล้ว' : 'All portfolio items loaded'}
                            </div>
                        `}
                    </main>
                </div>
            </div>
        `;

        this.stopAllPortfolioPreviews();

        container.innerHTML = html;

        this.initPortfolioSmartPreview(container);

        // Attach IntersectionObserver for Infinite Scroll
        if (this.portfolioCurrentIndex < filteredPortfolio.length) {
            const sentinel = container.querySelector('#portfolio-scroll-sentinel');
            const skeletonWrapper = container.querySelector('#portfolio-infinite-skeleton-wrapper');
            const endMessage = container.querySelector('#portfolio-end-message');
            const cardsContainer = container.querySelector('#portfolio-cards-container');

            if (sentinel && 'IntersectionObserver' in window) {
                this.portfolioObserver = new IntersectionObserver((entries) => {
                    const entry = entries[0];
                    if (entry && entry.isIntersecting && !this.portfolioIsLoadingMore) {
                        this.loadNextPortfolioBatch(cardsContainer, skeletonWrapper, sentinel, endMessage, categories);
                    }
                }, {
                    root: null,
                    rootMargin: '250px 0px',
                    threshold: 0.01
                });
                this.portfolioObserver.observe(sentinel);
            }
        }

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
                        <img src="${lineQrImage}" alt="LINE QR Code" width="140" height="140" loading="lazy" style="max-width:100%; max-height:100%; object-fit:contain;" onerror="const card = this.closest('.line-qr-card-box'); if (card) card.style.display='none';">
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

        const contactHeroTitleThSetting = await this.getSetting('contact_hero_title_th');
        const contactHeroTitleEnSetting = await this.getSetting('contact_hero_title_en');
        const contactHeroDescThSetting = await this.getSetting('contact_hero_desc_th');
        const contactHeroDescEnSetting = await this.getSetting('contact_hero_desc_en');
        const contactHeroHeightSetting = await this.getSetting('contact_hero_height');

        const contactHeroTitleTh = contactHeroTitleThSetting || this.t('nav_contact');
        const contactHeroTitleEn = contactHeroTitleEnSetting || 'Contact Us';
        const contactHeroDescTh = contactHeroDescThSetting || (this.lang === 'th' ? 'ยินดีให้คำปรึกษาและออกแบบแก้วฟรี พร้อมบริการส่งด่วนทั่วประเทศ' : 'Get free design consultations and packaging mockups with nationwide delivery.');
        const contactHeroDescEn = contactHeroDescEnSetting || 'Get free design consultations and packaging mockups with nationwide delivery.';
        const contactHeroHeightVal = contactHeroHeightSetting || 'default';

        let contactHeroPaddingStyle = '';
        if (contactHeroHeightVal === 'compact') contactHeroPaddingStyle = 'padding: 38px 0 !important;';
        else if (contactHeroHeightVal === 'tall') contactHeroPaddingStyle = 'padding: 80px 0 !important;';

        const contactBgStyle = await this.getSetting('contact_hero_background_style', 'image');
        let contactBgImg = await this.getSetting('contact_hero_background_image', 'contact_banner.webp');
        if (!contactBgImg) contactBgImg = 'contact_banner.webp';
        if (typeof contactBgImg === 'object' && contactBgImg !== null) {
            contactBgImg = contactBgImg.url || contactBgImg.image_src || contactBgImg.src || contactBgImg.path || 'contact_banner.webp';
        }

        const contactRawOverlay = await this.getSetting('contact_hero_background_overlay', 55);
        const contactBgOverlay = (function(raw) {
            if (raw === undefined || raw === null || raw === '') return 55;
            let val = Number(raw);
            if (!Number.isFinite(val)) return 55;
            if (val > 0 && val <= 1) val = val * 100;
            return Math.min(80, Math.max(0, Math.round(val)));
        })(contactRawOverlay);

        const contactBgPos = await this.getSetting('contact_hero_background_position', 'center center');
        const contactBgBrightnessRaw = await this.getSetting('contact_hero_background_brightness', 100);
        const contactBgBrightness = parseInt(contactBgBrightnessRaw) || 100;
        const contactBgTextTheme = await this.getSetting('contact_hero_background_text_theme', 'auto');

        const hasContactBgImg = (contactBgStyle === 'image' || contactBgStyle === 'image_line_art') && Boolean(contactBgImg);
        const isContactLightText = (hasContactBgImg && (contactBgTextTheme === 'auto' || contactBgTextTheme === 'light')) || contactBgTextTheme === 'light';
        const contactTitleColorStyle = isContactLightText ? 'color: #ffffff !important;' : '';
        const contactDescColorStyle = isContactLightText ? 'color: rgba(255, 255, 255, 0.88) !important;' : 'color: var(--text-muted);';

        container.innerHTML = `
            <div class="subpage-hero-banner contact-hero-banner ${hasContactBgImg ? 'has-bg-image' : ''}" style="position: relative; overflow: hidden; background-color: ${hasContactBgImg ? 'transparent' : 'var(--bg-sec)'}; ${contactHeroPaddingStyle}" data-overlay="${contactBgOverlay}">
                ${hasContactBgImg ? `
                    <div class="sec-bg-image-layer" style="
                        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                        background-image: url(&quot;${contactBgImg}&quot;);
                        background-size: cover;
                        background-position: ${contactBgPos};
                        filter: brightness(${contactBgBrightness}%);
                        z-index: 0;
                        pointer-events: none;
                    "></div>
                    <div class="sec-bg-overlay-layer" style="
                        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                        background-color: rgba(0, 0, 0, ${contactBgOverlay / 100});
                        z-index: 0;
                        pointer-events: none;
                    "></div>
                ` : ''}

                <div class="container text-center" style="position: relative; z-index: 2;">
                    <h2 style="${contactTitleColorStyle}">${this.lang === 'th' ? contactHeroTitleTh : contactHeroTitleEn}</h2>
                    <p style="${contactDescColorStyle}">${this.lang === 'th' ? contactHeroDescTh : contactHeroDescEn}</p>
                </div>
            </div>
            
            <section class="section-padding contact-section">
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

        const faqHeroTitleThSetting = await this.getSetting('faq_hero_title_th');
        const faqHeroTitleEnSetting = await this.getSetting('faq_hero_title_en');
        const faqHeroDescThSetting = await this.getSetting('faq_hero_desc_th');
        const faqHeroDescEnSetting = await this.getSetting('faq_hero_desc_en');
        const faqHeroHeightSetting = await this.getSetting('faq_hero_height');

        const faqHeroTitleTh = faqHeroTitleThSetting || this.t('nav_faq');
        const faqHeroTitleEn = faqHeroTitleEnSetting || 'Frequently Asked Questions';
        const faqHeroDescTh = faqHeroDescThSetting || (this.lang === 'th' ? 'คำถามที่พบบ่อยเกี่ยวกับการสกรีนแก้ว ขั้นต่ำ ระยะเวลาผลิต และการขนส่งสำหรับแบรนด์คาเฟ่' : 'Frequently Asked Questions about cup custom screen printing, MOQs, lead times, and logistics.');
        const faqHeroDescEn = faqHeroDescEnSetting || 'Frequently Asked Questions about cup custom screen printing, MOQs, lead times, and logistics.';
        const faqHeroHeightVal = faqHeroHeightSetting || 'default';

        let faqHeroPaddingStyle = '';
        if (faqHeroHeightVal === 'compact') faqHeroPaddingStyle = 'padding: 38px 0 !important;';
        else if (faqHeroHeightVal === 'tall') faqHeroPaddingStyle = 'padding: 80px 0 !important;';

        const faqBgStyle = await this.getSetting('faq_hero_background_style', 'image');
        let faqBgImg = await this.getSetting('faq_hero_background_image', 'faq_banner.webp');
        if (!faqBgImg) faqBgImg = 'faq_banner.webp';
        if (typeof faqBgImg === 'object' && faqBgImg !== null) {
            faqBgImg = faqBgImg.url || faqBgImg.image_src || faqBgImg.src || faqBgImg.path || 'faq_banner.webp';
        }

        const faqRawOverlay = await this.getSetting('faq_hero_background_overlay', 55);
        const faqBgOverlay = (function(raw) {
            if (raw === undefined || raw === null || raw === '') return 55;
            let val = Number(raw);
            if (!Number.isFinite(val)) return 55;
            if (val > 0 && val <= 1) val = val * 100;
            return Math.min(80, Math.max(0, Math.round(val)));
        })(faqRawOverlay);

        const faqBgPos = await this.getSetting('faq_hero_background_position', 'center center');
        const faqBgBrightnessRaw = await this.getSetting('faq_hero_background_brightness', 100);
        const faqBgBrightness = parseInt(faqBgBrightnessRaw) || 100;
        const faqBgTextTheme = await this.getSetting('faq_hero_background_text_theme', 'auto');

        const hasFaqBgImg = (faqBgStyle === 'image' || faqBgStyle === 'image_line_art') && Boolean(faqBgImg);
        const isFaqLightText = (hasFaqBgImg && (faqBgTextTheme === 'auto' || faqBgTextTheme === 'light')) || faqBgTextTheme === 'light';
        const faqTitleColorStyle = isFaqLightText ? 'color: #ffffff !important;' : '';
        const faqDescColorStyle = isFaqLightText ? 'color: rgba(255, 255, 255, 0.88) !important;' : 'color: var(--text-muted);';

        container.innerHTML = `
            <div class="subpage-hero-banner faq-hero-banner ${hasFaqBgImg ? 'has-bg-image' : ''}" style="position: relative; overflow: hidden; background-color: ${hasFaqBgImg ? 'transparent' : 'var(--bg-sec)'}; ${faqHeroPaddingStyle}" data-overlay="${faqBgOverlay}">
                ${hasFaqBgImg ? `
                    <div class="sec-bg-image-layer" style="
                        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                        background-image: url(&quot;${faqBgImg}&quot;);
                        background-size: cover;
                        background-position: ${faqBgPos};
                        filter: brightness(${faqBgBrightness}%);
                        z-index: 0;
                        pointer-events: none;
                    "></div>
                    <div class="sec-bg-overlay-layer" style="
                        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                        background-color: rgba(0, 0, 0, ${faqBgOverlay / 100});
                        z-index: 0;
                        pointer-events: none;
                    "></div>
                ` : ''}

                <div class="container text-center" style="position: relative; z-index: 2;">
                    <h2 style="${faqTitleColorStyle}">${this.lang === 'th' ? faqHeroTitleTh : faqHeroTitleEn}</h2>
                    <p style="${faqDescColorStyle}">${this.lang === 'th' ? faqHeroDescTh : faqHeroDescEn}</p>
                </div>
            </div>
            
            <section class="section-padding faq-section">
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
        if (!id) return;
        
        // 1. Clear any pending modal close timeout
        if (this.modalCloseTimeout) {
            clearTimeout(this.modalCloseTimeout);
            this.modalCloseTimeout = null;
        }

        // 2. Synchronously remove all existing product modal overlays from DOM to guarantee DOM uniqueness
        document.querySelectorAll('.modal-overlay[data-modal-type="product-details"]').forEach(m => m.remove());

        // 3. Clean up listeners on existing modal
        if (this.modalEscapeHandler) {
            document.removeEventListener('keydown', this.modalEscapeHandler);
            this.modalEscapeHandler = null;
        }

        const prod = await this.db.get('products', String(id));
        if (!prod) {
            console.warn("openProductDetails: Product not found for ID:", id);
            return;
        }

        const categories = await this.db.getAll('categories');
        const catObj = categories.find(c => String(c.id) === String(prod.category));
        const catName = catObj ? (this.lang === 'th' ? (catObj.name_th || catObj.name_en) : (catObj.name_en || catObj.name_th)) : '';

        // Save active element for focus restoration if not already set
        if (!this.modalTriggerElement) {
            this.modalTriggerElement = document.activeElement;
        }

        // Manage body scroll locking state using explicit null sentinel
        if (this.previousBodyOverflow === null || this.previousBodyOverflow === undefined) {
            this.previousBodyOverflow = document.body.style.overflow || '';
        }
        document.body.style.overflow = 'hidden';

        // Keyboard Escape key closure listener
        this.modalEscapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeActiveModal();
            }
        };
        document.addEventListener('keydown', this.modalEscapeHandler);

        // Safely extract and deduplicate gallery & main images
        let productImages = [];
        if (prod.image_src && typeof prod.image_src === 'string' && prod.image_src.trim() !== '') {
            productImages.push(prod.image_src.trim());
        }

        if (prod.gallery_images) {
            let parsedGallery = [];
            if (Array.isArray(prod.gallery_images)) {
                parsedGallery = prod.gallery_images;
            } else if (typeof prod.gallery_images === 'string') {
                try {
                    parsedGallery = JSON.parse(prod.gallery_images);
                } catch(e) {
                    if (prod.gallery_images.trim() !== '') {
                        parsedGallery = [prod.gallery_images.trim()];
                    }
                }
            }
            if (Array.isArray(parsedGallery)) {
                parsedGallery.forEach(img => {
                    if (img && typeof img === 'string' && img.trim() !== '') {
                        const cleanImg = img.trim();
                        if (!productImages.includes(cleanImg)) {
                            productImages.push(cleanImg);
                        }
                    }
                });
            }
        }
        const mainImage = productImages[0] || '';

        // Resolve Product Title & Subtitle safely
        const nameTh = prod.name_th ? String(prod.name_th).trim() : '';
        const nameEn = prod.name_en ? String(prod.name_en).trim() : '';
        
        let primaryTitle = '';
        let secondaryTitle = '';
        if (this.lang === 'th') {
            primaryTitle = nameTh || nameEn || 'สินค้าสกรีนบรรจุภัณฑ์';
            if (nameTh && nameEn) secondaryTitle = nameEn;
        } else {
            primaryTitle = nameEn || nameTh || 'Custom Printed Packaging Product';
            if (nameTh && nameEn) secondaryTitle = nameTh;
        }

        // Check spec elements visibility and content
        const showMat = prod.show_material !== false && prod.spec_material && String(prod.spec_material).trim() !== '';
        const showVol = prod.show_volume !== false;
        const showDia = prod.show_diameter !== false && prod.spec_diameter && String(prod.spec_diameter).trim() !== '';
        const showMin = prod.show_min_qty !== false && prod.spec_min_qty && String(prod.spec_min_qty).trim() !== '';
        const showPrice = prod.show_price !== false && prod.price && String(prod.price).trim() !== '';

        const specVolumeVal = this.lang === 'th' ? (prod.spec_volume_th || prod.volume || '') : (prod.spec_volume_en || prod.volume || '');
        const hasVolume = showVol && specVolumeVal && String(specVolumeVal).trim() !== '';

        let specRowsHtml = '';
        if (showMat) {
            specRowsHtml += `
                <tr>
                    <td>${this.t('detail_material')}</td>
                    <td>${prod.spec_material}</td>
                </tr>
            `;
        }
        if (hasVolume) {
            specRowsHtml += `
                <tr>
                    <td>${this.t('detail_volume')}</td>
                    <td>${specVolumeVal}</td>
                </tr>
            `;
        }
        if (showDia) {
            specRowsHtml += `
                <tr>
                    <td>${this.t('detail_diameter')}</td>
                    <td>${this.lang === 'th' ? 'ขนาดปากแก้ว' : 'Cup Diameter'} ${prod.spec_diameter} ${this.lang === 'th' ? 'มม.' : 'mm'}.</td>
                </tr>
            `;
        }
        if (showMin) {
            specRowsHtml += `
                <tr>
                    <td>${this.t('detail_min_order')}</td>
                    <td>${prod.spec_min_qty}</td>
                </tr>
            `;
        }
        if (showPrice) {
            specRowsHtml += `
                <tr>
                    <td>${this.lang === 'th' ? 'ราคาประเมินเบื้องต้น' : 'Estimated Price'}</td>
                    <td><strong>฿${prod.price} / ${this.lang === 'th' ? 'ใบ' : 'pc'}</strong></td>
                </tr>
            `;
        }

        // Resolve Description safely
        const descThVal = prod.desc_th ? String(prod.desc_th).trim() : '';
        const descEnVal = prod.desc_en ? String(prod.desc_en).trim() : '';
        const descText = this.lang === 'th' ? (descThVal || descEnVal) : (descEnVal || descThVal);

        // Fetch LINE contact settings safely
        const lineUrlVal = await this.getSetting('line_url');
        const lineIdVal = await this.getSetting('line');
        
        let lineHref = '';
        if (lineUrlVal && lineUrlVal.trim() !== '') {
            lineHref = lineUrlVal.trim();
        } else if (lineIdVal && lineIdVal.trim() !== '') {
            lineHref = `https://line.me/R/ti/p/~${lineIdVal.replace('@', '').trim()}`;
        }

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'product-modal';
        overlay.setAttribute('data-modal-type', 'product-details');
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-labelledby', 'modal-product-title');

        overlay.innerHTML = `
            <div class="modal-window">
                <button class="modal-close-btn" onclick="window.charoenApp.closeActiveModal()" aria-label="${this.lang === 'th' ? 'ปิดหน้าต่าง' : 'Close modal'}"><i class="fas fa-times"></i></button>
                <div class="product-details-grid">
                    <div class="product-gallery-container">
                        <div class="detail-img-box">
                            <img id="modal-main-image" src="${mainImage || 'coffee_bg.webp'}" alt="${primaryTitle}" style="${mainImage ? '' : 'display:none;'}" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';">
                            <div class="fallback-img-box" style="display:${mainImage ? 'none' : 'flex'}; align-items:center; justify-content:center; width:100%; height:100%; min-height:250px;">
                                <i class="fas fa-box" style="font-size:5rem; color:var(--text-muted);"></i>
                            </div>
                        </div>
                        ${productImages.length > 1 ? `
                            <div class="product-thumbnails-scroll-container">
                                <div class="product-thumbnails-wrapper">
                                    ${productImages.map((img, idx) => `
                                        <button class="product-thumbnail-btn ${idx === 0 ? 'active' : ''}" data-src="${img}" aria-label="${this.lang === 'th' ? 'ดูรูปภาพที่ ' : 'View image '}${idx + 1}" aria-pressed="${idx === 0 ? 'true' : 'false'}">
                                            <img src="${img}" alt="Thumbnail ${idx + 1}" onerror="this.closest('.product-thumbnail-btn').style.display='none';">
                                        </button>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    <div class="detail-info-box">
                        ${catName ? `<span class="product-modal-badge">${catName}</span>` : ''}
                        <h3 id="modal-product-title">${primaryTitle}</h3>
                        ${secondaryTitle ? `<div class="product-modal-subtitle">${secondaryTitle}</div>` : ''}
                        ${descText ? `<p class="product-modal-desc">${descText}</p>` : ''}
                        
                        ${specRowsHtml ? `
                            <div class="spec-table-container">
                                <h4 class="spec-table-heading">${this.t('detail_title')}</h4>
                                <table class="spec-table">
                                    <tbody>
                                        ${specRowsHtml}
                                    </tbody>
                                </table>
                            </div>
                        ` : ''}
                        
                        <div class="modal-action-buttons">
                            <a href="#/quote" class="btn btn-primary" onclick="window.charoenApp.closeActiveModal()">
                                <i class="fas fa-file-invoice-dollar"></i> ${this.lang === 'th' ? 'สอบถามและขอราคา' : 'Get Quote'}
                            </a>
                            ${lineHref ? `
                                <a href="${lineHref}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-line-inquire">
                                    <i class="fab fa-line"></i> ${this.t('cta_inquire')}
                                </a>
                            ` : ''}
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
                thumbs.forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-pressed', 'false');
                });
                thumb.classList.add('active');
                thumb.setAttribute('aria-pressed', 'true');
            };
        });

        // Set initial modal focus to close button
        setTimeout(() => {
            const closeBtn = overlay.querySelector('.modal-close-btn');
            if (closeBtn) closeBtn.focus();
        }, 100);
    }

    async openPortfolioDetails(id) {
        this.stopAllPortfolioPreviews();
        const item = await this.db.get('portfolio', id);
        const categories = await this.db.getAll('categories');
        if (!item) return;

        const isValidString = (val) => {
            if (val === null || val === undefined) return false;
            const s = String(val).trim();
            const lower = s.toLowerCase();
            return s !== '' && lower !== 'null' && lower !== 'undefined';
        };

        // Save active element for focus restoration
        this.modalTriggerElement = document.activeElement;

        // Manage body scroll locking state using explicit null sentinel
        if (this.previousBodyOverflow === null || this.previousBodyOverflow === undefined) {
            this.previousBodyOverflow = document.body.style.overflow || '';
        }
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
        const catName = catObj ? (this.lang === 'th' ? catObj.name_th : catObj.name_en) : (this.lang === 'th' ? 'ร้านกาแฟ' : 'Cafe');

        const lineSetting = await this.db.get('settings', 'line');
        const lineVal = lineSetting?.value?.replace('@', '') || 'charoenoncup';

        const rawDescription = this.lang === 'th'
            ? (
                item.desc_th ||
                item.description_th ||
                item.details_th ||
                item.desc_en ||
                item.description_en ||
                item.details_en ||
                item.description ||
                item.desc ||
                item.details
            )
            : (
                item.desc_en ||
                item.description_en ||
                item.details_en ||
                item.desc_th ||
                item.description_th ||
                item.details_th ||
                item.description ||
                item.desc ||
                item.details
            );

        const descriptionText = isValidString(rawDescription)
            ? String(rawDescription).trim()
            : '';

        const clientName = item.client_name || item.customer_name || item.client || item.shop_name || '';
        const printColor = item.print_color || item.screen_color || item.color_count || '';
        const quantity = item.quantity || item.qty || item.amount || item.minimum_order || item.min_order || '';
        const cupType = item.cup_type || item.cup || item.cup_size || '';
        const province = item.province || item.location || item.city || '';

        const hasMetadata = isValidString(clientName) ||
                            isValidString(cupType) ||
                            isValidString(printColor) ||
                            isValidString(quantity) ||
                            isValidString(province);

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay portfolio-lightbox-modal portfolio-modal-overlay';
        overlay.id = 'portfolio-modal';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-labelledby', 'portfolio-modal-title');

        let activeImgIdx = 0;

        overlay.innerHTML = `
            <div class="modal-window portfolio-lightbox-window portfolio-modal-dialog">
                <button class="modal-close-btn portfolio-modal-close" onclick="window.charoenApp.closeActiveModal()" aria-label="${this.lang === 'th' ? 'ปิดหน้าต่าง' : 'Close modal'}">
                    <i class="fas fa-times"></i>
                </button>
                
                <div class="portfolio-modal-layout">
                    <!-- Left / Top: Gallery Media Section -->
                    <section class="portfolio-modal-media lightbox-media-col">
                        <div class="portfolio-modal-main-frame lightbox-main-img-box" id="lightbox-main-img-box">
                            ${portfolioImages.length > 1 ? `
                                <button class="lightbox-arrow prev" id="lightbox-prev-btn" aria-label="${this.lang === 'th' ? 'รูปก่อนหน้า' : 'Previous image'}"><i class="fas fa-chevron-left"></i></button>
                                <button class="lightbox-arrow next" id="lightbox-next-btn" aria-label="${this.lang === 'th' ? 'รูปถัดไป' : 'Next image'}"><i class="fas fa-chevron-right"></i></button>
                                <span class="lightbox-img-counter" id="lightbox-img-counter">1 / ${portfolioImages.length}</span>
                            ` : ''}
                            <div class="lightbox-img-loader" id="lightbox-img-loader" style="display:none; position:absolute; inset:0; flex-direction:column; align-items:center; justify-content:center; background:rgba(0,0,0,0.35); color:var(--secondary); font-size:1.5rem; z-index:4; backdrop-filter:blur(2px);">
                                <i class="fas fa-circle-notch fa-spin"></i>
                            </div>
                            <div class="lightbox-img-error" id="lightbox-img-error" style="display:none; position:absolute; inset:0; flex-direction:column; align-items:center; justify-content:center; background:rgba(15,23,42,0.95); color:#ff6b6b; font-size:0.85rem; font-weight:600; gap:8px; z-index:5; text-align:center; padding:16px;">
                                <i class="fas fa-exclamation-circle" style="font-size:1.8rem;"></i>
                                <span>${this.lang === 'th' ? 'ไม่สามารถแสดงรูปนี้ได้' : 'Failed to load image'}</span>
                            </div>
                            <img id="modal-main-image" src="${mainImage || 'coffee_bg.webp'}" alt="${this.lang === 'th' ? (item.title_th || '') : (item.title_en || '')}">
                        </div>

                        ${portfolioImages.length > 1 ? `
                            <div class="portfolio-modal-thumbnails lightbox-thumbnails-wrapper" role="tablist" aria-label="${this.lang === 'th' ? 'รายการรูปภาพผลงาน' : 'Portfolio image gallery'}">
                                ${portfolioImages.map((img, idx) => `
                                    <button class="lightbox-thumb-btn ${idx === 0 ? 'active' : ''}" data-idx="${idx}" aria-label="Thumbnail ${idx + 1}" role="tab" aria-selected="${idx === 0 ? 'true' : 'false'}">
                                        <img src="${img}" alt="Thumb ${idx + 1}" onerror="this.src='coffee_bg.webp';">
                                    </button>
                                `).join('')}
                            </div>
                        ` : ''}
                    </section>

                    <!-- Right / Bottom: Information Panel -->
                    <aside class="portfolio-modal-info lightbox-info-col">
                        <div class="lightbox-header-info">
                            ${isValidString(catName) ? `<span class="lightbox-category-badge">${catName}</span>` : ''}
                            <h3 id="portfolio-modal-title" class="lightbox-title">${this.lang === 'th' ? (item.title_th || item.title_en) : (item.title_en || item.title_th)}</h3>
                        </div>

                        ${isValidString(descriptionText) ? `
                            <div class="lightbox-desc-box portfolio-modal-description-section">
                                <h3 class="portfolio-modal-section-title">${this.lang === 'th' ? 'รายละเอียดผลงาน' : 'Project Details'}</h3>
                                <p class="portfolio-modal-description">${descriptionText}</p>
                            </div>
                        ` : ''}

                        ${hasMetadata ? `
                            <section class="portfolio-modal-metadata">
                                <h3 class="portfolio-modal-section-title">${this.lang === 'th' ? 'ข้อมูลผลงาน' : 'Project Information'}</h3>

                                <dl class="portfolio-modal-meta-list portfolio-modal-meta-grid lightbox-specs-grid">
                                    ${isValidString(clientName) ? `
                                        <div class="portfolio-modal-meta-row portfolio-modal-meta-item lightbox-spec-item">
                                            <dt class="portfolio-modal-meta-label spec-label"><i class="fas fa-store"></i> ${this.lang === 'th' ? 'ชื่อลูกค้า' : 'Client'}</dt>
                                            <dd class="portfolio-modal-meta-value spec-value">${clientName}</dd>
                                        </div>
                                    ` : ''}
                                    ${isValidString(cupType) ? `
                                        <div class="portfolio-modal-meta-row portfolio-modal-meta-item lightbox-spec-item">
                                            <dt class="portfolio-modal-meta-label spec-label"><i class="fas fa-wine-glass-alt"></i> ${this.lang === 'th' ? 'ประเภทแก้ว' : 'Cup Type'}</dt>
                                            <dd class="portfolio-modal-meta-value spec-value">${cupType}</dd>
                                        </div>
                                    ` : ''}
                                    ${isValidString(printColor) ? `
                                        <div class="portfolio-modal-meta-row portfolio-modal-meta-item lightbox-spec-item">
                                            <dt class="portfolio-modal-meta-label spec-label"><i class="fas fa-palette"></i> ${this.lang === 'th' ? 'จำนวนสีสกรีน' : 'Print Colors'}</dt>
                                            <dd class="portfolio-modal-meta-value spec-value">${printColor}</dd>
                                        </div>
                                    ` : ''}
                                    ${isValidString(quantity) ? `
                                        <div class="portfolio-modal-meta-row portfolio-modal-meta-item lightbox-spec-item">
                                            <dt class="portfolio-modal-meta-label spec-label"><i class="fas fa-boxes"></i> ${this.lang === 'th' ? 'จำนวนผลิต' : 'Production Quantity'}</dt>
                                            <dd class="portfolio-modal-meta-value spec-value">${quantity}</dd>
                                        </div>
                                    ` : ''}
                                    ${isValidString(province) ? `
                                        <div class="portfolio-modal-meta-row portfolio-modal-meta-item lightbox-spec-item">
                                            <dt class="portfolio-modal-meta-label spec-label"><i class="fas fa-map-marker-alt"></i> ${this.lang === 'th' ? 'จังหวัด' : 'Location'}</dt>
                                            <dd class="portfolio-modal-meta-value spec-value">${province}</dd>
                                        </div>
                                    ` : ''}
                                </dl>
                            </section>
                        ` : ''}

                        <div class="lightbox-actions">
                            <a href="https://line.me/R/ti/p/~${lineVal}" target="_blank" rel="noopener noreferrer" class="btn btn-primary lightbox-primary-btn">
                                <i class="fab fa-line"></i> ${this.lang === 'th' ? 'สั่งสกรีนแบบนี้' : 'Inquire This Design'}
                            </a>
                            <button type="button" class="btn btn-outline lightbox-share-btn" id="lightbox-share-action">
                                <i class="fas fa-share-alt"></i> ${this.lang === 'th' ? 'แชร์ผลงาน' : 'Share'}
                            </button>
                        </div>
                    </aside>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        overlay.offsetHeight;
        overlay.classList.add('active');

        // Close on background click
        overlay.onclick = (e) => {
            if (e.target === overlay) this.closeActiveModal();
        };

        // Premium Gallery Elements & Navigation Control
        const imgBox = overlay.querySelector('#lightbox-main-img-box');
        const mainImg = overlay.querySelector('#modal-main-image');
        const loaderEl = overlay.querySelector('#lightbox-img-loader');
        const errorEl = overlay.querySelector('#lightbox-img-error');
        const thumbBtns = overlay.querySelectorAll('.lightbox-thumb-btn');

        let isSwitching = false;

        // Neighbor Preload Strategy (Preload previous & next image only)
        const preloadNeighbors = (currIdx) => {
            if (portfolioImages.length <= 1) return;
            const prevIdx = (currIdx - 1 + portfolioImages.length) % portfolioImages.length;
            const nextIdx = (currIdx + 1) % portfolioImages.length;

            if (portfolioImages[prevIdx]) {
                const imgPrev = new Image();
                imgPrev.src = portfolioImages[prevIdx];
            }
            if (portfolioImages[nextIdx]) {
                const imgNext = new Image();
                imgNext.src = portfolioImages[nextIdx];
            }
        };

        // Initial preloading for current index 0
        preloadNeighbors(0);

        // Update Active Image Handler
        const updateActiveImage = (newIdx) => {
            if (isSwitching) return;
            if (newIdx < 0) newIdx = portfolioImages.length - 1;
            if (newIdx >= portfolioImages.length) newIdx = 0;
            activeImgIdx = newIdx;

            const targetSrc = portfolioImages[activeImgIdx];
            if (!targetSrc || !mainImg) return;

            isSwitching = true;
            if (errorEl) errorEl.style.display = 'none';

            // Fade out current image (180-220ms transition duration)
            mainImg.style.opacity = '0';

            const loaderTimer = setTimeout(() => {
                if (loaderEl && isSwitching) {
                    loaderEl.style.display = 'flex';
                }
            }, 50);

            const tempImg = new Image();
            tempImg.onload = () => {
                clearTimeout(loaderTimer);
                if (loaderEl) loaderEl.style.display = 'none';
                mainImg.src = targetSrc;
                setTimeout(() => {
                    mainImg.style.opacity = '1';
                    isSwitching = false;
                }, 50);
                preloadNeighbors(activeImgIdx);
            };

            tempImg.onerror = () => {
                clearTimeout(loaderTimer);
                if (loaderEl) loaderEl.style.display = 'none';
                if (errorEl) errorEl.style.display = 'flex';
                mainImg.style.opacity = '0';
                isSwitching = false;
            };

            tempImg.src = targetSrc;

            // Update counter text if element exists
            const counterEl = overlay.querySelector('#lightbox-img-counter');
            if (counterEl) {
                counterEl.textContent = `${activeImgIdx + 1} / ${portfolioImages.length}`;
            }

            // Update Thumbnail active states
            thumbBtns.forEach((btn, idx) => {
                if (idx === activeImgIdx) {
                    btn.classList.add('active');
                    btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                } else {
                    btn.classList.remove('active');
                }
            });
        };

        // Attach initial image error listener
        if (mainImg) {
            mainImg.onerror = () => {
                if (errorEl) errorEl.style.display = 'flex';
                mainImg.style.opacity = '0';
            };
        }

        const prevBtn = overlay.querySelector('#lightbox-prev-btn');
        const nextBtn = overlay.querySelector('#lightbox-next-btn');

        if (prevBtn) prevBtn.onclick = () => updateActiveImage(activeImgIdx - 1);
        if (nextBtn) nextBtn.onclick = () => updateActiveImage(activeImgIdx + 1);

        thumbBtns.forEach((btn) => {
            btn.onclick = () => {
                const idx = parseInt(btn.getAttribute('data-idx') || '0', 10);
                updateActiveImage(idx);
            };
        });

        // Keyboard Support (ArrowLeft: prev, ArrowRight: next, Escape: close)
        this.modalKeyHandler = (e) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                updateActiveImage(activeImgIdx - 1);
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                updateActiveImage(activeImgIdx + 1);
            } else if (e.key === 'Escape') {
                this.closeActiveModal();
            }
        };
        document.addEventListener('keydown', this.modalKeyHandler);

        // Native-feeling Mobile Touch Swipe Support
        if (imgBox) {
            let touchStartX = 0, touchStartY = 0, touchEndX = 0, touchEndY = 0;

            imgBox.ontouchstart = (e) => {
                if (e.touches && e.touches.length === 1) {
                    touchStartX = e.touches[0].clientX;
                    touchStartY = e.touches[0].clientY;
                    touchEndX = touchStartX;
                    touchEndY = touchStartY;
                }
            };

            imgBox.ontouchmove = (e) => {
                if (e.touches && e.touches.length === 1) {
                    touchEndX = e.touches[0].clientX;
                    touchEndY = e.touches[0].clientY;
                }
            };

            imgBox.ontouchend = () => {
                const diffX = touchEndX - touchStartX;
                const diffY = touchEndY - touchStartY;

                // Enforce horizontal dominant swipe (>40px) to prevent interfering with vertical page scrolling
                if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
                    if (diffX < 0) {
                        updateActiveImage(activeImgIdx + 1); // Swipe left -> Next
                    } else {
                        updateActiveImage(activeImgIdx - 1); // Swipe right -> Prev
                    }
                }
                touchStartX = 0; touchStartY = 0; touchEndX = 0; touchEndY = 0;
            };
        }

        // Share button action
        const shareBtn = overlay.querySelector('#lightbox-share-action');
        if (shareBtn) {
            shareBtn.onclick = async () => {
                const shareData = {
                    title: item.title_th || item.title_en || 'Charoen On Cup Portfolio',
                    text: `ดูผลงานสกรีนแก้ว ${item.title_th || ''} จาก เจริญ ออน คัพ`,
                    url: window.location.href
                };

                if (navigator.share) {
                    try {
                        await navigator.share(shareData);
                    } catch (e) {}
                } else {
                    try {
                        await navigator.clipboard.writeText(window.location.href);
                        alert(this.lang === 'th' ? 'คัดลอกลิงก์ผลงานเรียบร้อยแล้ว!' : 'Portfolio link copied to clipboard!');
                    } catch (e) {
                        alert(window.location.href);
                    }
                }
            };
        }

        // Set initial modal focus
        setTimeout(() => {
            const closeBtn = overlay.querySelector('.modal-close-btn');
            if (closeBtn) closeBtn.focus();
        }, 100);
    }

    async openVideoPlayerLightbox(videoId) {
        // Prevent duplicated modal instances
        this.closeActiveModal();

        const videoObj = await this.db.get('home_videos', videoId);
        if (!videoObj) {
            alert(this.lang === 'th' ? 'ขออภัย! ไม่พบข้อมูลวิดีโอในระบบ' : 'Sorry, video record not found.');
            return;
        }

        // Resolve video source: prefer static path, fall back to legacy video_src if safe (non-Base64)
        const _isSafeVideoUrl = (src) => {
            if (!src || typeof src !== 'string' || !src.trim()) return false;
            const s = src.trim();
            return !s.startsWith('data:') && !s.startsWith('blob:') && !s.startsWith('file://');
        };
        const resolvedVideoSrc =
            (videoObj.video_path && videoObj.video_path.trim()) ||
            (_isSafeVideoUrl(videoObj.video_src) ? videoObj.video_src.trim() : '');

        if (!resolvedVideoSrc) {
            alert(this.lang === 'th'
                ? 'ขออภัย! ยังไม่ได้ระบุ Video Path\n\nกรุณาไปที่ Admin CMS → Home Videos แล้วระบุ Path ไฟล์วิดีโอ'
                : 'Sorry, no video path configured.\n\nPlease set the Video Path in Admin CMS → Home Videos.');
            return;
        }

        // Store trigger element for focus restoration on close
        if (document.activeElement && document.activeElement !== document.body) {
            this.modalTriggerElement = document.activeElement;
        }

        // Prevent body scrolling while modal is open using explicit null sentinel
        if (this.previousBodyOverflow === null || this.previousBodyOverflow === undefined) {
            this.previousBodyOverflow = document.body.style.overflow || '';
        }
        document.body.style.overflow = 'hidden';

        // 1. Modal Overlay
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay video-lightbox-overlay';
        overlay.id = 'video-player-lightbox';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', videoObj.title_th || videoObj.title_en || (this.lang === 'th' ? 'เล่นวิดีโอ' : 'Video Player'));
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100dvh';
        overlay.style.zIndex = '30000';
        overlay.style.backgroundColor = 'rgba(5, 14, 28, 0.88)';
        overlay.style.backdropFilter = 'blur(12px)';
        overlay.style.webkitBackdropFilter = 'blur(12px)';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.padding = '16px';
        overlay.style.boxSizing = 'border-box';
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 220ms cubic-bezier(0.16, 1, 0.3, 1)';

        // 2. Modal Window Container
        const modalWindow = document.createElement('div');
        modalWindow.className = 'modal-window video-lightbox-window';
        modalWindow.style.position = 'relative';
        modalWindow.style.background = '#060D18';
        modalWindow.style.borderRadius = '16px';
        modalWindow.style.overflow = 'hidden';
        modalWindow.style.border = '1px solid rgba(255, 255, 255, 0.12)';
        modalWindow.style.boxShadow = '0 30px 80px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255,255,255,0.08)';
        modalWindow.style.transform = 'scale(0.96)';
        modalWindow.style.transition = 'transform 220ms cubic-bezier(0.16, 1, 0.3, 1), width 220ms ease, height 220ms ease';
        modalWindow.style.display = 'flex';
        modalWindow.style.alignItems = 'center';
        modalWindow.style.justifyContent = 'center';
        modalWindow.style.maxWidth = 'min(94vw, 1100px)';
        modalWindow.style.maxHeight = '88dvh';
        modalWindow.style.width = '94vw';
        modalWindow.style.height = '52.875vw';

        // 3. Centered Loading Spinner
        const spinnerBox = document.createElement('div');
        spinnerBox.className = 'video-lightbox-spinner';
        spinnerBox.style.position = 'absolute';
        spinnerBox.style.inset = '0';
        spinnerBox.style.display = 'flex';
        spinnerBox.style.flexDirection = 'column';
        spinnerBox.style.alignItems = 'center';
        spinnerBox.style.justifyContent = 'center';
        spinnerBox.style.gap = '12px';
        spinnerBox.style.color = 'rgba(255, 255, 255, 0.9)';
        spinnerBox.style.zIndex = '5';
        spinnerBox.style.pointerEvents = 'none';
        spinnerBox.innerHTML = `
            <i class="fas fa-circle-notch fa-spin" style="font-size: 2.4rem; color: var(--accent, #FF6B00);"></i>
            <span style="font-size: 0.85rem; letter-spacing: 0.5px; font-weight: 500; font-family: 'Kanit', sans-serif;">${this.lang === 'th' ? 'กำลังโหลดวิดีโอ...' : 'Loading video...'}</span>
        `;

        // 4. Error Message Overlay
        const errorBox = document.createElement('div');
        errorBox.className = 'video-lightbox-error';
        errorBox.style.position = 'absolute';
        errorBox.style.inset = '0';
        errorBox.style.display = 'none';
        errorBox.style.flexDirection = 'column';
        errorBox.style.alignItems = 'center';
        errorBox.style.justifyContent = 'center';
        errorBox.style.gap = '14px';
        errorBox.style.padding = '24px';
        errorBox.style.textAlign = 'center';
        errorBox.style.color = '#ffffff';
        errorBox.style.zIndex = '6';
        errorBox.style.background = '#060D18';
        errorBox.innerHTML = `
            <i class="fas fa-exclamation-triangle" style="font-size: 2.8rem; color: #EF4444;"></i>
            <p style="font-size: 1.05rem; font-weight: 700; margin: 0; color: #F3F4F6; font-family: 'Kanit', sans-serif;">
                ${this.lang === 'th' ? 'ไม่พบไฟล์วิดีโอ' : 'Video File Not Found'}
            </p>
            <p style="font-size: 0.85rem; color: #9CA3AF; max-width: 340px; margin: 0; text-align: center; line-height: 1.6; font-family: 'Prompt', sans-serif;">
                ${this.lang === 'th'
                    ? 'ไม่พบไฟล์วิดีโอ กรุณาตรวจสอบ Path และ Deploy ไฟล์อีกครั้ง<br><code style="font-size:0.78rem; color:#6B7280;">' + resolvedVideoSrc + '</code>'
                    : 'Video file not found. Please verify the path and redeploy the website.<br><code style="font-size:0.78rem; color:#6B7280;">' + resolvedVideoSrc + '</code>'
                }
            </p>
            <button type="button" class="btn btn-outline close-error-btn" style="margin-top: 8px; border-color: rgba(255,255,255,0.4); color: #fff; padding: 6px 20px; font-size: 0.85rem; border-radius: 8px; cursor: pointer;">
                ${this.lang === 'th' ? 'ปิดหน้าต่าง' : 'Close Window'}
            </button>
        `;

        // 5. Close Button (Frosted glass top-right)
        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal-close-btn video-lightbox-close';
        closeBtn.setAttribute('type', 'button');
        closeBtn.setAttribute('aria-label', this.lang === 'th' ? 'ปิดวิดีโอ' : 'Close video');
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '14px';
        closeBtn.style.right = '14px';
        closeBtn.style.zIndex = '20';
        closeBtn.style.width = '38px';
        closeBtn.style.height = '38px';
        closeBtn.style.borderRadius = '50%';
        closeBtn.style.background = 'rgba(15, 23, 42, 0.82)';
        closeBtn.style.color = '#ffffff';
        closeBtn.style.border = '1px solid rgba(255, 255, 255, 0.3)';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.display = 'flex';
        closeBtn.style.alignItems = 'center';
        closeBtn.style.justifyContent = 'center';
        closeBtn.style.fontSize = '1.05rem';
        closeBtn.style.backdropFilter = 'blur(6px)';
        closeBtn.style.webkitBackdropFilter = 'blur(6px)';
        closeBtn.style.boxShadow = '0 4px 14px rgba(0,0,0,0.5)';
        closeBtn.style.transition = 'transform 0.2s ease, background-color 0.2s ease';
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';
        closeBtn.onmouseenter = () => closeBtn.style.transform = 'scale(1.1)';
        closeBtn.onmouseleave = () => closeBtn.style.transform = 'scale(1)';
        closeBtn.onclick = () => this.closeActiveModal();

        // 6. Native Video Element
        const videoEl = document.createElement('video');
        videoEl.src = resolvedVideoSrc;
        videoEl.autoplay = true;
        videoEl.controls = true;
        videoEl.playsInline = true;
        videoEl.setAttribute('controlsList', 'nodownload');
        videoEl.style.width = '100%';
        videoEl.style.height = '100%';
        videoEl.style.objectFit = 'contain';
        videoEl.style.display = 'block';
        videoEl.style.background = 'transparent';

        const hideSpinner = () => {
            if (spinnerBox && spinnerBox.parentNode) {
                spinnerBox.style.display = 'none';
            }
        };

        const showError = (err) => {
            console.warn("Video playback error in lightbox:", err);
            hideSpinner();
            videoEl.style.display = 'none';
            errorBox.style.display = 'flex';
            const closeErrBtn = errorBox.querySelector('.close-error-btn');
            if (closeErrBtn) {
                closeErrBtn.onclick = () => this.closeActiveModal();
                closeErrBtn.focus();
            }
        };

        videoEl.onerror = showError;

        // Dynamic Aspect Ratio Calculation
        const calculateAndApplyDimensions = () => {
            let vw = videoEl.videoWidth;
            let vh = videoEl.videoHeight;

            // Fallback ratio if metadata not loaded yet
            if (!vw || !vh || vw <= 0 || vh <= 0) {
                vw = 16;
                vh = 9;
            }

            const nativeRatio = vw / vh;
            const viewportMaxWidth = Math.min(window.innerWidth * 0.94, 1100);
            const viewportMaxHeight = window.innerHeight * 0.88;

            let targetWidth = viewportMaxWidth;
            let targetHeight = targetWidth / nativeRatio;

            if (targetHeight > viewportMaxHeight) {
                targetHeight = viewportMaxHeight;
                targetWidth = targetHeight * nativeRatio;
            }

            if (targetWidth > viewportMaxWidth) {
                targetWidth = viewportMaxWidth;
                targetHeight = targetWidth / nativeRatio;
            }

            modalWindow.style.width = `${Math.round(targetWidth)}px`;
            modalWindow.style.height = `${Math.round(targetHeight)}px`;
        };

        videoEl.onloadedmetadata = () => {
            hideSpinner();
            calculateAndApplyDimensions();
        };

        videoEl.oncanplay = () => {
            hideSpinner();
        };

        videoEl.onplaying = () => {
            hideSpinner();
        };

        modalWindow.appendChild(closeBtn);
        modalWindow.appendChild(spinnerBox);
        modalWindow.appendChild(errorBox);
        modalWindow.appendChild(videoEl);
        overlay.appendChild(modalWindow);
        document.body.appendChild(overlay);

        // Initial sizing calculation
        calculateAndApplyDimensions();

        // Entrance animation
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            overlay.classList.add('active');
            modalWindow.style.transform = 'scale(1)';
        });

        // Responsive resize & orientation change handler
        this.modalResizeHandler = () => {
            calculateAndApplyDimensions();
        };
        window.addEventListener('resize', this.modalResizeHandler);
        window.addEventListener('orientationchange', this.modalResizeHandler);

        // Keyboard Escape & Focus Trap Listener
        this.modalEscapeHandler = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                this.closeActiveModal();
            } else if (e.key === 'Tab') {
                const focusables = modalWindow.querySelectorAll('button, video, [tabindex="0"], [href]');
                if (focusables.length > 0) {
                    const first = focusables[0];
                    const last = focusables[focusables.length - 1];
                    if (e.shiftKey) {
                        if (document.activeElement === first) {
                            e.preventDefault();
                            last.focus();
                        }
                    } else {
                        if (document.activeElement === last) {
                            e.preventDefault();
                            first.focus();
                        }
                    }
                }
            }
        };
        document.addEventListener('keydown', this.modalEscapeHandler);

        // Overlay backdrop click to close
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                this.closeActiveModal();
            }
        };

        // Focus close button initially
        setTimeout(() => {
            if (closeBtn) closeBtn.focus();
        }, 60);
    }

    closeActiveModal() {
        if (this.modalCloseTimeout) {
            clearTimeout(this.modalCloseTimeout);
            this.modalCloseTimeout = null;
        }

        const modal = document.querySelector('.modal-overlay.video-lightbox-overlay, .modal-overlay.active, .modal-overlay[data-modal-type="product-details"]');
        if (modal) {
            const vid = modal.querySelector('video');
            if (vid) {
                try {
                    vid.pause();
                    vid.src = '';
                    vid.load();
                } catch (e) {}
            }

            const win = modal.querySelector('.modal-window');
            modal.style.opacity = '0';
            if (win) {
                win.style.transform = 'scale(0.96)';
            }
            modal.classList.remove('active');

            const modalToClose = modal;
            this.modalCloseTimeout = setTimeout(() => {
                if (modalToClose && modalToClose.parentNode) {
                    modalToClose.remove();
                }

                const remainingActiveModals = document.querySelectorAll('.modal-overlay.active');
                if (remainingActiveModals.length === 0) {
                    if (this.previousBodyOverflow !== null && this.previousBodyOverflow !== undefined) {
                        document.body.style.overflow = this.previousBodyOverflow;
                    } else {
                        document.body.style.overflow = '';
                    }
                    this.previousBodyOverflow = null;
                }

                this.modalCloseTimeout = null;
            }, 220);
        } else {
            // No-modal failsafe: restore body scroll if no active modal exists in DOM
            const remainingActiveModals = document.querySelectorAll('.modal-overlay.active');
            if (remainingActiveModals.length === 0) {
                if (this.previousBodyOverflow !== null && this.previousBodyOverflow !== undefined) {
                    document.body.style.overflow = this.previousBodyOverflow;
                } else {
                    document.body.style.overflow = '';
                }
                this.previousBodyOverflow = null;
            }
        }

        // Clean up temporary modal event listeners
        if (this.modalResizeHandler) {
            window.removeEventListener('resize', this.modalResizeHandler);
            window.removeEventListener('orientationchange', this.modalResizeHandler);
            this.modalResizeHandler = null;
        }

        if (this.modalEscapeHandler) {
            document.removeEventListener('keydown', this.modalEscapeHandler);
            this.modalEscapeHandler = null;
        }

        if (this.modalKeyHandler) {
            document.removeEventListener('keydown', this.modalKeyHandler);
            this.modalKeyHandler = null;
        }

        // Restore focus to trigger element
        if (this.modalTriggerElement && typeof this.modalTriggerElement.focus === 'function') {
            try { this.modalTriggerElement.focus(); } catch (e) {}
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
