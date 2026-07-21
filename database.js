/**
 * database.js
 * IndexedDB Wrapper & Firebase Cloud Sync System
 * Designed for offline-first, high performance under file:// protocol
 * Supports WebP Media Library, Hero Slider, home videos, and category CRUD.
 */

class CharoenOnCupDB {
    constructor() {
        this.dbName = 'CharoenOnCupDB';
        this.dbVersion = 5; // Bumped version to 5 to force new store creation for news/articles/clients/faq/reviews
        this.db = null;
        this.fs = null;
        this.isCloudEnabled = false;
        this.memCache = {};
    }

    getCollectionName(storeName) {
        const mapping = {
            'slider': 'hero_slides',
            'homepage': 'homepage_sections',
            'clients': 'logos',
            'settings': 'company_info',
            'home_videos': 'homepage_settings',
            'quotes': 'quotation_requests',
            'faq': 'faq',
            'reviews': 'reviews'
        };
        return mapping[storeName] || storeName;
    }

    async init() {
        await this.initIndexedDB();
        
        // Initialize Firebase connection if configuration exists
        try {
            const fbConfig = await this.getLocalSetting('firebase_config');
            if (typeof firebase !== 'undefined') {
                if (firebase.apps.length > 0) {
                    // Firebase already initialized (e.g. by firebase-config.js)
                    this.fs = firebase.firestore();
                    this.isCloudEnabled = true;
                    console.log("CharoenOnCupDB: Firebase Cloud Firestore already initialized!");
                } else if (fbConfig && fbConfig.apiKey) {
                    // Initialize from settings
                    firebase.initializeApp(fbConfig);
                    this.fs = firebase.firestore();
                    try {
                        this.fs.settings({ experimentalForceLongPolling: true });
                    } catch (settErr) {
                        console.warn("Firestore settings configuration warning:", settErr);
                    }
                    this.isCloudEnabled = true;
                    console.log("CharoenOnCupDB: Connected to Firebase Cloud Firestore successfully!");
                } else {
                    this.isCloudEnabled = false;
                }
            } else {
                this.isCloudEnabled = false;
            }

            // Sync collection caches if cloud is enabled
            if (this.isCloudEnabled) {
                const collectionsToSync = ['categories', 'media_categories', 'products', 'portfolio', 'slider', 'home_videos', 'homepage', 'settings', 'users', 'news', 'articles', 'clients', 'faq', 'reviews'];
                for (const col of collectionsToSync) {
                    this.syncCollectionFromCloud(col).catch(() => {});
                }
                this.seedFirestoreIfNeeded().catch(err => {
                    console.warn("Firestore seeding failed:", err);
                });
            }
        } catch (err) {
            console.warn("CharoenOnCupDB: Firebase initialization failed, running in Local Mode:", err);
            this.isCloudEnabled = false;
        }

        // Clean up empty default categories in the background
        this.cleanupEmptyCategories();

        // Clean up any test/malformed quotes (e.g. name is undefined)
        this.cleanupMalformedQuotes();

        // Reorganize sidebar and homepage defaults (runs one time using a flag check)
        this.applyHomepageOrganizationDefaults().catch(err => {
            console.warn("CharoenOnCupDB: Homepage reorganization defaults warning:", err);
        });

        return this;
    }

    initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = (event) => {
                console.error("Database open error: ", event.target.error);
                reject(event.target.error);
            };

            request.onblocked = () => {
                console.warn("Database upgrade is blocked by another open connection.");
                alert("ตรวจพบข้อความสำคัญ: กรุณาปิดหน้าต่างหน้าร้านค้าหลัก (index.html) หรือแท็บอื่นๆ ของเว็บนี้ที่เปิดค้างอยู่ก่อน\n\nเพื่อให้ระบบหลังบ้านสามารถทำการปรับปรุงระบบโครงสร้างฐานข้อมูล (อัปเดตเวอร์ชัน) ได้อย่างปลอดภัยและทำงานต่อได้ครับ!");
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                
                // Close database connection if another tab requests a version upgrade (prevents blocking)
                this.db.onversionchange = () => {
                    this.db.close();
                    console.warn("Database connection closed due to version upgrade in another tab.");
                    location.reload();
                };

                resolve(this);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create object stores if they don't exist
                const stores = [
                    { name: 'media', key: 'id' },
                    { name: 'media_categories', key: 'id' },
                    { name: 'categories', key: 'id' },
                    { name: 'products', key: 'id' },
                    { name: 'portfolio', key: 'id' },
                    { name: 'slider', key: 'id' },
                    { name: 'home_videos', key: 'id' },
                    { name: 'homepage', key: 'id' },
                    { name: 'quotes', key: 'id' },
                    { name: 'notifications', key: 'id' },
                    { name: 'settings', key: 'key' },
                    { name: 'users', key: 'username' },
                    { name: 'news', key: 'id' },
                    { name: 'articles', key: 'id' },
                    { name: 'clients', key: 'id' },
                    { name: 'faq', key: 'id' },
                    { name: 'reviews', key: 'id' }
                ];

                for (const store of stores) {
                    if (!db.objectStoreNames.contains(store.name)) {
                        db.createObjectStore(store.name, { keyPath: store.key });
                    }
                }
            };
        });
    }

    // Helper to read local settings directly from IndexedDB bypassing Firebase check (prevents recursion)
    getLocalSetting(key) {
        return new Promise((resolve) => {
            if (!this.db) {
                resolve(null);
                return;
            }
            try {
                const transaction = this.db.transaction('settings', 'readonly');
                const store = transaction.objectStore('settings');
                const request = store.get(key);
                request.onsuccess = () => resolve(request.result ? request.result.value : null);
                request.onerror = () => resolve(null);
            } catch (e) {
                resolve(null);
            }
        });
    }

    // Generic Operations (Offline-First cache pattern with fail-safe try-catches)
    // Generic Operations (Cloud-First cache pattern for online content stores with IndexedDB offline fallback)
    async getAll(storeName) {
        const cloudFirstStores = [
            'homepage', 'slider', 'categories', 'products', 'portfolio',
            'settings', 'news', 'faq', 'reviews', 'clients', 'articles', 'quotes'
        ];
        const isCloudFirst = cloudFirstStores.includes(storeName);

        if (isCloudFirst && this.isCloudEnabled && navigator.onLine !== false) {
            try {
                const cloudList = await this.syncCollectionFromCloud(storeName);
                if (cloudList) {
                    this.memCache[storeName] = cloudList;
                    return cloudList;
                }
            } catch (err) {
                console.warn(`CharoenOnCupDB: Cloud-first getAll for "${storeName}" failed, falling back to local:`, err);
            }
        }

        // Memory cache check for local/background or offline reads
        if (this.memCache[storeName]) {
            return this.memCache[storeName];
        }

        // Read local cache first for instant loading
        const localList = await new Promise((resolve) => {
            try {
                if (!this.db || !this.db.objectStoreNames.contains(storeName)) {
                    resolve([]);
                    return;
                }
                const transaction = this.db.transaction(storeName, 'readonly');
                const store = transaction.objectStore(storeName);
                const request = store.getAll();
                request.onsuccess = () => resolve(request.result || []);
                request.onerror = () => resolve([]);
            } catch (err) {
                console.warn(`CharoenOnCupDB: Failed to read store "${storeName}":`, err);
                resolve([]);
            }
        });

        // Background sync for non-cloud-first stores if cloud is enabled
        const unSyncedStores = ['media', 'home_videos'];
        if (this.isCloudEnabled && !unSyncedStores.includes(storeName) && !isCloudFirst) {
            this.syncCollectionFromCloud(storeName).catch(err => {
                console.warn(`CharoenOnCupDB: Background sync failed for ${storeName}:`, err);
            });
        }

        this.memCache[storeName] = localList;
        return localList;
    }

    async get(storeName, id) {
        const cloudFirstStores = [
            'homepage', 'slider', 'categories', 'products', 'portfolio',
            'settings', 'news', 'faq', 'reviews', 'clients', 'articles', 'quotes'
        ];
        const isCloudFirst = cloudFirstStores.includes(storeName);

        if (isCloudFirst && this.isCloudEnabled && navigator.onLine !== false) {
            try {
                const cloudItem = await this.syncDocFromCloud(storeName, id);
                if (cloudItem) {
                    return cloudItem;
                }
            } catch (err) {
                console.warn(`CharoenOnCupDB: Cloud-first get for "${storeName}/${id}" failed, falling back to local:`, err);
            }
        }

        // Read local cache first
        const localItem = await new Promise((resolve) => {
            try {
                if (!this.db || !this.db.objectStoreNames.contains(storeName)) {
                    resolve(null);
                    return;
                }
                const transaction = this.db.transaction(storeName, 'readonly');
                const store = transaction.objectStore(storeName);
                const request = store.get(id);
                request.onsuccess = () => resolve(request.result || null);
                request.onerror = () => resolve(null);
            } catch (err) {
                console.warn(`CharoenOnCupDB: Failed to get id "${id}" from store "${storeName}":`, err);
                resolve(null);
            }
        });

        // Background doc sync for non-cloud-first stores
        const unSyncedStores = ['media', 'home_videos'];
        if (this.isCloudEnabled && !unSyncedStores.includes(storeName) && !isCloudFirst) {
            this.syncDocFromCloud(storeName, id).catch(err => {
                console.warn(`CharoenOnCupDB: Background doc sync failed for ${storeName}/${id}:`, err);
            });
        }

        return localItem;
    }

    async put(storeName, item) {
        // Invalidate memory cache
        delete this.memCache[storeName];

        const unSyncedStores = ['media', 'home_videos'];
        const isCloudEnabled = this.isCloudEnabled && !unSyncedStores.includes(storeName);

        if (isCloudEnabled && navigator.onLine !== false) {
            try {
                // Await Firestore write confirmation first
                await this.firebasePut(storeName, item);
            } catch (err) {
                console.error(`CharoenOnCupDB: Firestore write failed for ${storeName}:`, err);
                throw new Error("ไม่สามารถบันทึกข้อมูลไปยังระบบคลาวด์ได้ในขณะนี้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตของท่าน");
            }
        }

        // Save to local IndexedDB only after Firestore success (or if offline/disabled)
        await new Promise((resolve, reject) => {
            try {
                if (!this.db || !this.db.objectStoreNames.contains(storeName)) {
                    reject(new Error(`Database store "${storeName}" is not initialized.`));
                    return;
                }
                const transaction = this.db.transaction(storeName, 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.put(item);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            } catch (err) {
                reject(err);
            }
        });

        // Consistently invalidate memCache
        delete this.memCache[storeName];

        return item;
    }

    async delete(storeName, id) {
        // Invalidate memory cache
        delete this.memCache[storeName];

        const unSyncedStores = ['media', 'home_videos'];
        const isCloudEnabled = this.isCloudEnabled && !unSyncedStores.includes(storeName);

        if (isCloudEnabled && navigator.onLine !== false) {
            try {
                // Await Firestore delete confirmation first
                await this.firebaseDelete(storeName, id);
            } catch (err) {
                console.error(`CharoenOnCupDB: Firestore delete failed for ${storeName}/${id}:`, err);
                throw new Error("ไม่สามารถลบข้อมูลออกจากระบบคลาวด์ได้ในขณะนี้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตของท่าน");
            }
        }

        // Delete from local IndexedDB only after Firestore success (or if offline/disabled)
        await new Promise((resolve, reject) => {
            try {
                if (!this.db || !this.db.objectStoreNames.contains(storeName)) {
                    reject(new Error(`Database store "${storeName}" is not initialized.`));
                    return;
                }
                const transaction = this.db.transaction(storeName, 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.delete(id);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            } catch (err) {
                reject(err);
            }
        });

        // Consistently invalidate memCache
        delete this.memCache[storeName];

        return true;
    }

    // Firestore Synchronization helpers
    async syncCollectionFromCloud(storeName) {
        if (!this.fs) return null;
        try {
            const colName = this.getCollectionName(storeName);
            const snapshot = await this.fs.collection(colName).get();
            const cloudList = [];
            snapshot.forEach(doc => {
                cloudList.push(doc.data());
            });

            // Update local IndexedDB with cloud items (even if empty to prevent stale/deleted items)
            await new Promise((resolve, reject) => {
                try {
                    if (!this.db || !this.db.objectStoreNames.contains(storeName)) {
                        resolve();
                        return;
                    }
                    const transaction = this.db.transaction(storeName, 'readwrite');
                    const store = transaction.objectStore(storeName);
                    
                    store.clear();
                    for (const item of cloudList) {
                        store.put(item);
                    }
                    
                    transaction.oncomplete = () => {
                        delete this.memCache[storeName];
                        resolve();
                    };
                    transaction.onerror = () => reject(transaction.error);
                } catch (err) {
                    reject(err);
                }
            });

            return cloudList;
        } catch (err) {
            console.warn(`Firestore read failed for collection "${storeName}", running in offline mode.`, err);
            throw err;
        }
    }

    async syncDocFromCloud(storeName, id) {
        if (!this.fs) return null;
        try {
            const colName = this.getCollectionName(storeName);
            const doc = await this.fs.collection(colName).doc(id).get();
            if (doc.exists) {
                const item = doc.data();
                await new Promise((resolve, reject) => {
                    try {
                        if (!this.db || !this.db.objectStoreNames.contains(storeName)) {
                            resolve();
                            return;
                        }
                        const transaction = this.db.transaction(storeName, 'readwrite');
                        const store = transaction.objectStore(storeName);
                        store.put(item);
                        transaction.oncomplete = () => {
                            delete this.memCache[storeName];
                            resolve();
                        };
                        transaction.onerror = () => reject(transaction.error);
                    } catch (err) {
                        reject(err);
                    }
                });
                return item;
            }
            return null;
        } catch (err) {
            console.warn(`Firestore read failed for document "${storeName}/${id}"`, err);
            throw err;
        }
    }

    async firebasePut(storeName, item) {
        if (!this.fs) return;
        const docId = storeName === 'settings' ? item.key : (storeName === 'users' ? item.username : item.id);
        if (!docId) return;

        // Security Exclusion Policy: Do not store secrets, passwords, or Firebase config inside company_info
        if (storeName === 'settings') {
            const forbiddenKeys = ['firebase_config', 'firebase_credentials', 'secret', 'password'];
            if (forbiddenKeys.some(key => docId.includes(key))) {
                console.log(`CharoenOnCupDB: Excluded key "${docId}" from Firestore sync (security policy)`);
                return;
            }
        }

        const colName = this.getCollectionName(storeName);
        const sanitized = this.sanitizeForFirestore(item);
        await this.fs.collection(colName).doc(docId).set(sanitized, { merge: true });
    }

    async firebaseDelete(storeName, id) {
        if (!this.fs) return;
        const colName = this.getCollectionName(storeName);
        await this.fs.collection(colName).doc(id).delete();
    }

    sanitizeForFirestore(obj) {
        if (obj === null || obj === undefined) return null;
        if (typeof obj !== 'object') return obj;

        if (Array.isArray(obj)) {
            return obj.map(item => {
                if (typeof item === 'object' && item !== null) {
                    return this.sanitizeForFirestore(item);
                }
                return item;
            });
        }

        const safe = {};
        for (const key of Object.keys(obj)) {
            const val = obj[key];
            if (val === null || val === undefined) {
                safe[key] = null;
            } else if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
                safe[key] = val;
            } else if (Array.isArray(val)) {
                safe[key] = val.map(item => {
                    if (typeof item === 'object' && item !== null) {
                        return this.sanitizeForFirestore(item);
                    }
                    return item;
                });
            } else if (typeof val === 'object') {
                safe[key] = this.sanitizeForFirestore(val);
            } else {
                safe[key] = val;
            }
        }
        return safe;
    }

    // Database Seeder
    async seed() {
        if (localStorage.getItem('charoen_db_seeded_v4') === 'true') {
            return;
        }

        const isSeeded = await this.getLocalSetting('database_seeded_v4');
        if (isSeeded === true) {
            localStorage.setItem('charoen_db_seeded_v4', 'true');
            return;
        }

        try {
            // 1. Seed admin credentials
            const transaction = this.db.transaction('users', 'readwrite');
            const store = transaction.objectStore('users');
            store.put({ username: 'admin', password: 'password1234' });

            // 2. Seed default categories
            const categories = [
                { id: 'cat-pet', name_th: 'แก้ว PET', name_en: 'PET Cups', order: 1 },
                { id: 'cat-pp', name_th: 'แก้ว PP', name_en: 'PP Cups', order: 2 },
                { id: 'cat-paper', name_th: 'แก้วกระดาษ', name_en: 'Paper Cups', order: 3 },
                { id: 'cat-lid', name_th: 'ฝาแก้ว', name_en: 'Cup Lids', order: 4 },
                { id: 'cat-straw', name_th: 'หลอด', name_en: 'Straws', order: 5 },
                { id: 'cat-film', name_th: 'ฟิล์มซีลปากแก้ว', name_en: 'Sealing Films', order: 6 },
                { id: 'cat-bag', name_th: 'ถุงหูหิ้ว', name_en: 'Loop Bags', order: 7 },
                { id: 'cat-other', name_th: 'อื่นๆ', name_en: 'Others', order: 8 }
            ];

            const catTx = this.db.transaction('categories', 'readwrite');
            const catStore = catTx.objectStore('categories');
            for (const cat of categories) {
                catStore.put(cat);
            }

            // 3. Seed default media categories
            const mediaCats = [
                { id: 'med-logo', name_th: 'โลโก้ร้านค้าลูกค้า', name_en: 'Customer Logos' },
                { id: 'med-raw', name_th: 'รูปทรงแก้วเปล่า', name_en: 'Raw Cups' },
                { id: 'med-print', name_th: 'ผลงานสกรีนจริง', name_en: 'Printed Cups' },
                { id: 'med-banner', name_th: 'ภาพโฆษณา / แบนเนอร์', name_en: 'Banner Ads' },
                { id: 'med-video', name_th: 'ไฟล์คลิปวิดีโอ', name_en: 'Video Clips' },
                { id: 'med-other', name_th: 'ภาพทั่วไป', name_en: 'Others' }
            ];

            const medCatTx = this.db.transaction('media_categories', 'readwrite');
            const medCatStore = medCatTx.objectStore('media_categories');
            for (const mc of mediaCats) {
                medCatStore.put(mc);
            }

            // 4. Seed default slides for Hero Slider (with Requirement 3 fields)
            const slides = [
                { id: 'slide_1', title_th: 'สกรีนแก้วพลาสติกและบรรจุภัณฑ์', title_en: 'Custom Print Cups & Packaging', subtitle_th: 'เริ่มต้นเพียง 1,000 ใบ สีสดคมชัด ส่งเร็วทั่วไทย ออกแบบฟรีก่อนผลิต!', subtitle_en: 'Starts at 1,000 pcs, vibrant colors, fast shipping, free mockup!', bg_src: '', btn_link: '#/products', order: 1, published: true, visible: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
                { id: 'slide_2', title_th: 'แก้วกระดาษร้อน-เย็น รักษ์โลก คุณภาพดี', title_en: 'Eco-Friendly Premium Paper Cups', subtitle_th: 'เนื้อกระดาษแข็งแรงทนทานเคลือบกันซึมสกรีนลายสวยงาม ดึงดูดสายตา', subtitle_en: 'Durable Double-Walled paper cups. Premium printing, eye-catching designs.', bg_src: '', btn_link: '#/products', order: 2, published: true, visible: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
                { id: 'slide_3', title_th: 'ฟิล์มม้วนซีลปากแก้วสกรีนแบรนด์', title_en: 'Custom Sealing Roll Films', subtitle_th: 'พลาสติกฟู้ดเกรด ทนความร้อนสูง ยึดปิดแน่นหนา ป้องกันน้ำหกเลอะเทอะ', subtitle_en: 'Food-grade heat resistant film roll printing. Secure leak-proof seals.', bg_src: '', btn_link: '#/products', order: 3, published: true, visible: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
            ];

            const slideTx = this.db.transaction('slider', 'readwrite');
            const slideStore = slideTx.objectStore('slider');
            for (const s of slides) {
                slideStore.put(s);
            }

            // 5. Seed default home videos
            const videos = [
                { id: 'video_1', title_th: 'ตัวอย่างงานพิมพ์สกรีนแก้ว Capsule 16 ออนซ์', title_en: '16oz Capsule Cup Screen Print Preview', desc_th: 'งานพิมพ์สกรีนสีส้มคมชัด เม็ดสีแน่น ไม่หลุดลอก แม้โดนความชื้นสะสม', desc_en: 'Vibrant orange screen printing, clean details, non-peelable and water-resistant.', poster_src: '', video_src: '', order: 1 },
                { id: 'video_2', title_th: 'ตัวอย่างสกรีนลายฟิล์มม้วนซีลปากแก้วความร้อน', title_en: 'Sealing Roll Film Printing Demo', desc_th: 'รายละเอียดความคมกริบของงานสกรีนม้วนซีล พลาสติกเกรดอาหารปลอดภัย 100%', desc_en: 'Ultra-sharp printing resolution on sealing rolls, 100% food-grade safe.', poster_src: '', video_src: '', order: 2 }
            ];

            const videoTx = this.db.transaction('home_videos', 'readwrite');
            const videoStore = videoTx.objectStore('home_videos');
            for (const v of videos) {
                videoStore.put(v);
            }

            // 6. Seed default contact settings
            const settings = [
                { key: 'company_name_th', value: 'เจริญ ออน คัพ' },
                { key: 'company_name_en', value: 'Charoen On Cup' },
                { key: 'about_title_th', value: 'เจริญ ออน คัพ โรงงานรับสกรีนแก้วพลาสติกและแก้วกระดาษ' },
                { key: 'about_title_en', value: 'Charoen On Cup Factory for Plastic & Paper Cup Screen Printing' },
                { key: 'about_desc_th', value: 'ยินดีให้บริการรับสกรีนแก้วพลาสติก แก้วกระดาษ และบรรจุภัณฑ์เครื่องดื่มทุกชนิด เพื่อเพิ่มมูลค่าให้กับแบรนด์ร้านกาแฟของคุณทั่วประเทศ' },
                { key: 'about_desc_en', value: 'is pleased to offer custom screen printing on plastic cups, paper cups, and all kinds of beverage packaging to add value to your cafe brand nationwide.' },
                { key: 'phone', value: '095-430-5225' },
                { key: 'line', value: '@charoenoncup' },
                { key: 'facebook', value: 'เจริญ ออน คัพ - รับสกรีนแก้วพลาสติก แก้วกระดาษ ครบวงจร' },
                { key: 'email', value: 'charoenoncup@gmail.com' },
                { key: 'address_th', value: '18 ซอย 4 ถนนราษฎร์อุทิศ ตำบลหาดใหญ่ อำเภอหาดใหญ่ จังหวัดสงขลา 90110' },
                { key: 'address_en', value: '18 Soi 4, Rat Uthit Rd, Hatyai, Songkhla 90110' },
                { key: 'business_hours_th', value: 'จันทร์ - เสาร์: 08:30 น. - 17:30 น. (หยุดวันอาทิตย์)' },
                { key: 'business_hours_en', value: 'Monday - Saturday: 08:30 AM - 05:30 PM (Closed on Sunday)' },
                { key: 'logo_img', value: '' },
                { key: 'show_prices', value: false },
                { key: 'show_home_video', value: 'true' },
                { key: 'seo_title', value: 'เจริญ ออน คัพ | สกรีนแก้วหาดใหญ่' },
                { key: 'seo_desc', value: 'ผู้ผลิตและรับสกรีนแก้วพลาสติก แก้วกระดาษ หาดใหญ่ คุณภาพสูง สีสวยคมชัด' },
                { key: 'seo_keywords', value: 'สกรีนแก้วหาดใหญ่, สกรีนแก้ว, เจริญ ออน คัพ, พิมพ์แก้ว' },
                { key: 'seo_sitemap', value: '' },
                { key: 'database_seeded_v4', value: true }
            ];

            const setTx = this.db.transaction('settings', 'readwrite');
            const setStore = setTx.objectStore('settings');
            for (const s of settings) {
                setStore.put(s);
            }

            // 7. Seed default homepage sections layout (11 Sections total)
            const homepage = [
                { id: 'hero_banner', type: 'hero_banner', order: 1, visible: true, content: { title_th: 'สไลด์เดอร์แบนเนอร์หลัก', title_en: 'Hero Slider Banner' } },
                { id: 'about_company', type: 'about_company', order: 2, visible: true, content: { title_th: 'ผู้นำด้านการผลิตและสกรีนแก้วครบวงจร', title_en: 'Leading Supplier of Beverage Packaging', desc_th: 'เจริญ ออน คัพ มุ่งมั่นผลิตและจำหน่ายแก้วพลาสติก แก้วกระดาษ ฟิล์มม้วนซีล และอุปกรณ์ประกอบเครื่องดื่ม คุณภาพระดับพรีเมียม ลายเส้นสกรีนสีสันคมชัด สวยสะดุดตา เพื่อเสริมศักยภาพภาพลักษณ์ให้กับแบรนด์คาเฟ่ของลูกค้าทุกระดับทั่วประเทศ', desc_en: 'Charoen On Cup specializes in custom printing premium plastic cups, paper cups, sealing rolls, and cafe accessories. With crisp alignments and vibrant colors, we help upgrade the visual branding of cafes and franchises nationwide.' } },
                { id: 'strengths', type: 'strengths', order: 3, visible: true, content: { title_th: 'มาตรฐานการผลิตและจุดแข็งของแบรนด์เรา', title_en: 'Our Strengths & Production Standard', items: [
                    { icon: 'fa-pencil-ruler', title_th: 'บริการขึ้นแบบจำลอง 3D ฟรี', title_en: 'Free 3D Digital Mockup', desc_th: 'บริการออกแบบจัดวางโลโก้ ตรวจสอบสเปกและมิติของตัวแก้วในรูปแบบดิจิตอล 3D ก่อนผลิตจริงฟรีทุกตำแหน่ง', desc_en: 'Check logo alignments and sizes on dynamic 3D cup models before printing begins for complete precision.' },
                    { icon: 'fa-award', title_th: 'สีสกรีนพรีเมียมไร้สารพิษ', title_en: 'Food-safe Premium Ink', desc_th: 'ใช้เม็ดสีคุณภาพนำเข้า เนื้อสีแน่นหนา ทนทาน ไม่หลุดลอกแม้อยู่ในอุณหภูมิติดลบหรือเปียกความชื้น', desc_en: 'High-quality imported inks that stick permanently. Will not scratch or peel off even under wet/cold conditions.' },
                    { icon: 'fa-truck', title_th: 'บริการจัดส่งปลอดภัยและรวดเร็ว', title_en: 'Fast & Secure Delivery', desc_th: 'ระบบการแพ็คกล่องหนาแน่นพิเศษ พร้อมพันธมิตรจัดส่งรวดเร็วตรงถึงหน้าร้านของท่านอย่างปลอดภัย', desc_en: 'Special thick carton packaging and trusted logistics networks deliver your orders straight to your cafe door.' }
                ] } },
                { id: 'services', type: 'services', order: 4, visible: true, content: { title_th: 'หมวดหมู่บรรจุภัณฑ์หลักของเรา', title_en: 'Our Product Categories', subtitle_th: 'เจริญ ออน คัพ คัดสรรแก้วพรีเมียมและระบบพิมพ์ที่เหมาะสมที่สุดสำหรับคุณ', subtitle_en: 'We select the finest cups and printing processes for your brand' } },
                { id: 'why_us', type: 'why_us', order: 5, visible: true, content: { title_th: 'ทำไมร้านกาแฟชั้นนำถึงเลือกสกรีนกับเรา', title_en: 'Why Cafes Trust Us', items: [
                    { title_th: 'ยอดการผลิตขั้นต่ำเริ่มเพียง 1,000 ใบ', title_en: 'Low Minimum Order of 1,000 Pcs', desc_th: 'ช่วยให้ร้านกาแฟเปิดใหม่ไม่ต้องแบกรับค่าใช้จ่ายและพื้นที่จัดเก็บถังบรรจุภัณฑ์จำนวนมากเกินไป', desc_en: 'Perfect for new cafe startups to manage operating cash flow and avoid bulky warehouse stocks.' },
                    { title_th: 'ราคาโรงงาน คุ้มค่าแก่การลงทุน', title_en: 'Direct Factory Fair Pricing', desc_th: 'ราคาเป็นธรรม คุ้มค่าคุ้มทุน ไม่มีบวกเพิ่มหรือค่าบล็อกสีซ่อนเร้น ให้ลูกค้าคำนวณต้นทุนได้แม่นยำ', desc_en: 'Transparent pricing with no hidden plate fees, allowing cafes to calculate accurate drink margins.' },
                    { title_th: 'มีทีมที่ปรึกษาเชี่ยวชาญดูแล', title_en: 'Professional Account Support', desc_th: 'ให้คำปรึกษา แนะนำขนาด ปริมาตร ความจุแก้วให้ลงตัวกับสูตรเครื่องดื่มของร้านของท่านอย่างลงตัว', desc_en: 'Consultants guide you to match cup volumes and sealing specs perfectly to your cafe drink recipes.' }
                ] } },
                { id: 'steps', type: 'steps', order: 6, visible: true, content: { title_th: 'ขั้นตอนการสั่งผลิตง่ายๆ 4 ขั้นตอน', title_en: '4 Simple Steps to Order', steps: [
                    { title_th: 'เลือกแก้ว & ตกลงราคา', title_en: 'Choose Cup & Pricing', desc_th: 'เลือกประเภทแก้ว ขนาด และจำนวนพิมพ์ที่ต้องการเพื่อรับใบเสนอราคา', desc_en: 'Choose your cup style, size, and quantity for quote' },
                    { title_th: 'ส่งโลโก้ & ตรวจแบบ', title_en: 'Send Logo & Proofing', desc_th: 'ส่งไฟล์โลโก้ ทางร้านออกแบบและขึ้นตัวอย่างแบบ 3D ให้ตรวจฟรียืนยันความถูกต้อง', desc_en: 'Submit your logo for a free 3D digital mockup design verification' },
                    { title_th: 'วางมัดจำ & ผลิตงาน', title_en: 'Deposit & Production', desc_th: 'ชำระค่ามัดจำเพื่อยืนยันคิว และเข้าสู่ขั้นตอนกระบวนการพิมพ์ระบบคุณภาพสูง', desc_en: 'Make deposit to confirm slot and enter into printing process' },
                    { title_th: 'จัดส่ง & ชำระส่วนที่เหลือ', title_en: 'Delivery & Final Payment', desc_th: 'ตรวจสอบสินค้า ชำระเงินส่วนที่เหลือ และบริการจัดส่งทั่วประเทศอย่างปลอดภัย', desc_en: 'Inspect products, pay balance, and secure delivery nationwide' }
                ] } },
                { id: 'featured_portfolio', type: 'featured_portfolio', order: 7, visible: true, content: { title_th: 'ผลงานการสกรีนแก้วเด่นที่ผ่านมา', title_en: 'Featured Screen Printed Cups', subtitle_th: 'ผลงานสกรีนแก้วของคาเฟ่ชั้นนำที่มอบความไว้วางใจให้เราดูแลแบรนด์', subtitle_en: 'Custom printing works trusted by leading cafes nationwide' } },
                { id: 'clients', type: 'clients', order: 8, visible: false, content: { title_th: 'แบรนด์คาเฟ่พันธมิตรที่ไว้ใจสกรีนแก้วกับเรา', title_en: 'Trusted by Cafe Partners' } },
                { id: 'reviews', type: 'reviews', order: 9, visible: false, content: { title_th: 'เสียงตอบรับจากเจ้าของร้านตัวจริง', title_en: 'Success Stories from Cafe Owners', reviews: [
                    { name: 'คุณนัท - Aether Cafe', review_th: 'สกรีนออกมาคมชัดสวยมากครับ เม็ดสีแน่น แนะนำเลยครับ บริการประทับใจส่งไวทันใจมาก', review_en: 'Extremely sharp prints! The ink matches our cafe branding perfectly. Highly recommended, fast shipping!', rating: 5 },
                    { name: 'คุณชบา - ร้านชบาชา', review_th: 'พิมพ์ลายสกรีนแก้ว Capsule สวยงามไม่หลุดลอกเลยค่ะ ลูกค้าติดใจลวดลาย น่ารักมาก แอดมินแนะนำดีมาก', review_en: 'Capsule cup design doesn\'t peel at all. Customer service was helpful in choosing the perfect size.', rating: 5 },
                    { name: 'คุณเอก - สตาร์รี่ คอฟฟี่', review_th: 'สั่งสกรีนแก้วกระดาษร้อนมา 3 รอบแล้ว คุณภาพดีมาก ลูกค้าจับแล้วไม่ร้อนมือ ดีไซน์ดึงดูดสายตา', review_en: 'Ordered paper cups three times now. The double-walled insulation works wonderfully. Sleek design.', rating: 5 }
                ] } },
                { id: 'latest_news', type: 'latest_news', order: 10, visible: true, content: { title_th: 'กิจกรรมและการสนับสนุน', title_en: 'Latest News & Insights', subtitle_th: 'เกร็ดความรู้เรื่องบรรจุภัณฑ์เครื่องดื่มและข่าวสารกิจกรรมสำคัญ', subtitle_en: 'Useful insights on beverage packaging and event updates' } },
                { id: 'contact_info', type: 'contact_info', order: 11, visible: true, content: { title_th: 'สอบถามข้อมูลสกรีนแก้วและประเมินราคารวดเร็ว', title_en: 'Get an Instant Printing Quote' } }
            ];

            const homeTx = this.db.transaction('homepage', 'readwrite');
            const homeStore = homeTx.objectStore('homepage');
            for (const h of homepage) {
                h.created_at = new Date().toISOString();
                h.updated_at = new Date().toISOString();
                homeStore.put(h);
            }

            // 8. Seed default news articles
            const newsList = [
                {
                    id: 'news_1',
                    title_th: 'เจริญ ออน คัพ เปิดตัวเครื่องพิมพ์สกรีนแก้วระบบไฮสปีดใหม่',
                    title_en: 'Charoen On Cup launches new high-speed screen printer',
                    date: '2026-07-10',
                    visible: true,
                    featured: true,
                    summary_th: 'เราได้ติดตั้งเครื่องพิมพ์สกรีนอัตโนมัติความเร็วสูงตัวใหม่เพื่อรองรับออเดอร์เร่งด่วน ดำเนินการเร็วขึ้น 50%',
                    summary_en: 'We installed a new high-speed automated screen printer to handle urgent orders 50% faster.',
                    content_th: 'เพื่อการตอบสนองความต้องการพิมพ์สกรีนแก้วที่เพิ่มขึ้นอย่างรวดเร็วของร้านคาเฟ่และเฟรนไชส์เครื่องดื่มในภาคใต้ เจริญ ออน คัพ ได้นำเข้าและติดตั้งเครื่องพิมพ์สกรีนระบบกระบอกลมความเร็วสูงตัวใหม่ล่าสุด ช่วยร่นระยะเวลาผลิตจากเดิม 7-10 วัน เหลือเพียง 5-7 วันเท่านั้น! อีกทั้งยังให้ความแม่นยำสูงในระบบจับคู่ระดับสีและตำแหน่งพิมพ์ลายสกรีน',
                    content_en: 'To keep up with the booming demand for custom branded cups among Southern cafes and beverage franchises, Charoen On Cup has imported and set up a new automatic high-speed rotary printing system. This upgrades our average lead time from 10 days down to just 5-7 days, while securing micro-precision print positioning.',
                    thumbnail: 'media__1783572775658.png',
                    seo_title: 'เปิดตัวเครื่องพิมพ์สกรีนแก้วไฮสปีด - เจริญ ออน คัพ',
                    seo_desc: 'ติดตั้งเครื่องพิมพ์แก้วความเร็วสูงรุ่นใหม่ ผลิตด่วน ส่งด่วนทั่วประเทศ'
                },
                {
                    id: 'news_2',
                    title_th: 'เจริญ ออน คัพ ร่วมออกบูธแนะนำสเปกแก้วสกรีนในงาน Coffee Fest 2026',
                    title_en: 'Charoen On Cup joins Coffee Fest Expo 2026',
                    date: '2026-07-12',
                    visible: true,
                    featured: false,
                    summary_th: 'พบกับทีมที่ปรึกษาและสัมผัสความหนาของตัวอย่างแก้วพิมพ์ลายจริงของแบรนด์ต่างๆ ได้ที่บูธของเรา',
                    summary_en: 'Meet our consulting team and touch real printed cup samples from various brands at our booth.',
                    content_th: 'ในงาน Coffee Fest 2026 ทาง เจริญ ออน คัพ ได้นำผลิตภัณฑ์และนวัตกรรมการสกรีนแก้วไปจัดแสดงเพื่อเป็นแนวทางให้กับผู้ที่กำลังจะเปิดร้านกาแฟ หรือต้องการยกระดับแบรนด์แก้วสกรีนของตนเอง โดยมีสินค้าให้สัมผัสความหนาและเปรียบเทียบขนาดจริงครบครัน',
                    content_en: 'At the Coffee Fest 2026, Charoen On Cup showcased our custom printed cups and rotary alignment samples. Cafe owners could inspect thickness and material finishes directly to make informed custom ordering decisions.',
                    thumbnail: 'media__1783583098895.png',
                    seo_title: 'เจริญ ออน คัพ ร่วมออกบูธ Coffee Fest 2026 - เจริญ ออน คัพ',
                    seo_desc: 'เก็บบรรยากาศและภาพความประทับใจจากการเข้าร่วมแนะนำสเปกแก้วสกรีนแบรนด์ในงานนิทรรศการกาแฟระดับประเทศ'
                }
            ];

            const newsTx = this.db.transaction('news', 'readwrite');
            const newsStore = newsTx.objectStore('news');
            for (const n of newsList) {
                newsStore.put(n);
            }

            // 9. Seed default articles
            const articlesList = [
                {
                    id: 'art_1',
                    title_th: 'เปรียบเทียบแก้ว PET vs PP Capsule เลือกแก้วแบบไหนให้เหมาะกับร้านของคุณที่สุด?',
                    title_en: 'Comparing PET vs PP Capsule Cups: Which fits your cafe best?',
                    date: '2026-07-11',
                    visible: true,
                    summary_th: 'วิเคราะห์ข้อดีข้อเสียของวัสดุแก้วพลาสติกสองประเภทยอดนิยมในกลุ่มผู้ประกอบการร้านกาแฟยุคปัจจุบัน',
                    summary_en: 'A deep comparison between the two most popular plastic cup options for modern beverage branding.',
                    content_th: 'ในการตัดสินใจสั่งสกรีนแก้วพลาสติกสำหรับเสิร์ฟเครื่องดื่มเย็น เจ้าของร้านกาแฟมักพบกับทางเลือกระหว่างแก้ว PET และแก้ว PP Capsule ซึ่งมีคุณสมบัติต่างกันเด่นชัดดังนี้:\n\n1. **แก้วพลาสติก PET (Polyethylene Terephthalate):**\n   - **จุดเด่น:** มีความใสแวววาวเป็นพิเศษ เนื้อพลาสติกมีความแข็งตึงเป็นทรงสวยงามดูพรีเมียม\n   - **ข้อจำกัด:** ไม่ทนความร้อนสูง และไม่รองรับการซีลฝาแก้วด้วยฟิล์มร้อน (ต้องใช้ฝาครอบธรรมดาเท่านั้น)\n\n2. **แก้วพลาสติก PP Capsule (Polypropylene):**\n   - **จุดเด่น:** เนื้อพลาสติกขุ่นนุ่มเหนียว ทนทานความร้อนได้ดี รองรับการปิดฝาแก้วด้วยเครื่องซีลฟิล์มร้อนได้สนิท\n   - **รูปทรง:** ทรงก้นกลม Capsule สไตล์มินิมอลช่วยให้เครื่องดื่มดูทันสมัยน่ารับประทาน',
                    content_en: 'When ordering custom printed plastic cups for your cold drinks, understanding the difference between PET and PP Capsule plastics will define your cafe image:\n\n1. **PET Cups (Polyethylene Terephthalate):**\n   - **Pros:** High clarity, glossy finish, and rigid structure for a premium specialty look.\n   - **Cons:** Not heat resistant and does not support automatic hot sealing films.\n\n2. **PP Capsule Cups (Polypropylene):**\n   - **Pros:** Semi-translucent, flexible, heat resistant, and fully supports heat-sealed film rolls.\n   - **Style:** Round bottom shape creates a modern, sleek aesthetic.',
                    thumbnail: 'media__1783583098895.png',
                    seo_title: 'เปรียบเทียบแก้ว PET vs PP Capsule เลือกอะไรดี - เจริญ ออน คัพ',
                    seo_desc: 'ไขข้อข้องใจความแตกต่างระหว่างพลาสติกสองประเภทเพื่อให้เลือกแก้วพิมพ์สกรีนได้เหมาะกับร้านที่สุด'
                },
                {
                    id: 'art_2',
                    title_th: 'คำแนะนำการเลือกขนาดแก้วกาแฟและบรรจุภัณฑ์ให้เหมาะกับเมนูกาแฟสเปเชียลตี้',
                    title_en: 'Specialty coffee cup size selection guide',
                    date: '2026-07-09',
                    visible: true,
                    summary_th: 'ทำไมร้านกาแฟสมัยใหม่ถึงนิยมเปลี่ยนมาสกรีนลายลงบนแก้วขนาด 8oz, 12oz, และ 16oz คละประเภท',
                    summary_en: 'Why modern cafes choose to custom print on 8oz, 12oz, and 16oz cups to match espresso ratios.',
                    content_th: 'ในการเสิร์ฟเมนูกาแฟสเปเชียลตี้ สัดส่วนความเข้มข้นของช็อตเอสเพรสโซ่ นม และโฟม มีผลต่อรสชาติอย่างมาก:\n\n- **แก้วขนาด 8 ออนซ์:** เหมาะสมที่สุดสำหรับเมนู Cappuccino และ Flat White ร้อน เพื่อให้อัตราส่วนของฟองนมนุ่มและกาแฟผสมกันลงตัวที่สุด\n- **แก้วขนาด 12 ออนซ์:** เหมาะกับเมนูกาแฟเย็นประเภท Specialty โฟกัสรสชาติกาแฟใส่นมนุ่มๆ กลมกล่อมกำลังดี โดยไม่ใช้น้ำแข็งปริมาณมากเกินไป\n- **แก้วขนาด 16 ออนซ์:** เหมาะสำหรับเมนูเครื่องดื่มโซดา ผลไม้ปั่น อเมริกาโน่เย็นปริมาณมาตรฐานยอดนิยมของตลาดไทย',
                    content_en: 'For specialty coffee serving, espresso-to-milk ratios are crucial to the taste outcome:\n\n- **8oz Cups:** Best suited for hot Cappuccinos and Flat Whites to keep espresso strength perfectly blended with milk microfoam.\n- **12oz Cups:** Great for iced milk coffees. Highlights specialty bean flavor profiles without dilution from excess ice.\n- **16oz Cups:** The standard size for cold brews, Iced Americano, sodas, and blended smoothies.',
                    thumbnail: 'media__1783583680948.png',
                    seo_title: 'วิธีเลือกขนาดแก้วกาแฟสเปเชียลตี้คาเฟ่ - เจริญ ออน คัพ',
                    seo_desc: 'ศึกษาขนาดความจุแก้วที่สอดคล้องกับสูตรเครื่องดื่มของร้านกาแฟเพื่อรสชาติที่ดีที่สุด'
                }
            ];

            const artTx = this.db.transaction('articles', 'readwrite');
            const artStore = artTx.objectStore('articles');
            for (const a of articlesList) {
                artStore.put(a);
            }

            // 10. Seed client logos
            const clientsList = [
                { id: 'client_1', logo_src: 'client_1_1783670648320.jpg', name: 'Aether Cafe', link: 'https://facebook.com', visible: true, order: 1, featured: true },
                { id: 'client_2', logo_src: 'client_2_1783670664450.jpg', name: 'Starry Coffee', link: 'https://facebook.com', visible: true, order: 2, featured: true },
                { id: 'client_3', logo_src: 'client_3_1783670678109.jpg', name: 'Chaba Tea', link: 'https://facebook.com', visible: true, order: 3, featured: true }
            ];

            const clientTx = this.db.transaction('clients', 'readwrite');
            const clientStore = clientTx.objectStore('clients');
            for (const c of clientsList) {
                clientStore.put(c);
            }

            // 11. Seed FAQs
            const faqList = [
                { id: 'faq_1', question_th: 'ขั้นต่ำในการสั่งผลิตสกรีนกี่ใบ?', question_en: 'What is the MOQ for custom printing?', answer_th: 'เริ่มต้นเพียง 1,000 ใบเท่านั้นสำหรับการสกรีน 1 สี', answer_en: 'For standard 1-color screen printing, MOQ starts at 1,000 pcs.', order: 1, visible: true },
                { id: 'faq_2', question_th: 'มีค่าบล็อกพิมพ์แอบแฝงไหม?', question_en: 'Are there hidden setup fees?', answer_th: 'ราคาโรงงานตรงไปตรงมา ไม่มีค่าบล็อกพิมพ์หรือแอบแฝงใดๆ', answer_en: 'Transparent factory pricing with no hidden block setup fees.', order: 2, visible: true },
                { id: 'faq_3', question_th: 'ระยะเวลาการผลิตนานเท่าไร?', question_en: 'How long is the production lead time?', answer_th: 'ใช้เวลาผลิตเพียง 7-10 วันหลังจากลูกค้ายืนยันแบบ 3D และชำระมัดจำ', answer_en: 'Production takes 7-10 days after 3D mockup approval and deposit receipt.', order: 3, visible: true },
                { id: 'faq_4', question_th: 'สามารถจัดส่งต่างจังหวัดได้ไหม?', question_en: 'Can you deliver to other provinces?', answer_th: 'บริการจัดส่งด่วนและปลอดภัยครอบคลุมทั่วประเทศผ่านขนส่งพันธมิตรของเรา', answer_en: 'Secure nationwide express shipping is available through our logistics partners.', order: 4, visible: true },
                { id: 'faq_5', question_th: 'มีบริการออกแบบลายแก้วให้ไหม?', question_en: 'Do you offer cup design services?', answer_th: 'บริการจัดวางตำแหน่งโลโก้และขึ้นภาพจำลองแบบ 3D ให้ตรวจสอบความถูกต้องฟรีก่อนผลิตจริง', answer_en: 'We offer free logo placement layout design and 3D digital mockup proofing before production.', order: 5, visible: true },
                { id: 'faq_6', question_th: 'สนใจขอใบเสนอราคาต้องทำอย่างไร?', question_en: 'How do I request a quotation?', answer_th: 'ลูกค้าสามารถเลือกแบบแก้วที่ต้องการผ่านเมนูสินค้าและกดขอใบเสนอราคา หรือติดต่อผ่าน LINE OA ได้ทันที', answer_en: 'You can select a cup style through our products catalog and click request quote, or contact us directly on LINE.', order: 6, visible: true }
            ];

            const faqTx = this.db.transaction('faq', 'readwrite');
            const faqStore = faqTx.objectStore('faq');
            for (const f of faqList) {
                faqStore.put(f);
            }

            // 12. Seed Reviews
            const reviewsList = [
                { id: 'rev_1', name: 'คุณนัท - Aether Cafe', review_th: 'สกรีนออกมาคมชัดสวยมากครับ เม็ดสีแน่น แนะนำเลยครับ บริการประทับใจส่งไวทันใจมาก', review_en: 'Extremely sharp prints! The ink matches our cafe branding perfectly. Highly recommended, fast shipping!', rating: 5, visible: true, featured: true },
                { id: 'rev_2', name: 'คุณชบา - ร้านชบาชา', review_th: 'พิมพ์ลายสกรีนแก้ว Capsule สวยงามไม่หลุดลอกเลยค่ะ ลูกค้าติดใจลวดลาย น่ารักมาก แอดมินแนะนำดีมาก', review_en: 'Capsule cup design doesn\'t peel at all. Customer service was helpful in choosing the perfect size.', rating: 5, visible: true, featured: true },
                { id: 'rev_3', name: 'คุณเอก - สตาร์รี่ คอฟฟี่', review_th: 'สั่งสกรีนแก้วกระดาษร้อนมา 3 รอบแล้ว คุณภาพดีมาก ลูกค้าจับแล้วไม่ร้อนมือ ดีไซน์ดึงดูดสายตา', review_en: 'Ordered paper cups three times now. The double-walled insulation works wonderfully. Sleek design.', rating: 5, visible: true, featured: true }
            ];

            const revTx = this.db.transaction('reviews', 'readwrite');
            const revStore = revTx.objectStore('reviews');
            for (const r of reviewsList) {
                revStore.put(r);
            }

            await new Promise((resolve) => {
                setTx.oncomplete = () => {
                    localStorage.setItem('charoen_db_seeded_v4', 'true');
                    resolve();
                };
            });
        } catch (seedErr) {
            console.error("CharoenOnCupDB: Seeding failed (will retry on next load):", seedErr);
        }
    }

    async seedFirestoreIfNeeded() {
        if (!this.isCloudEnabled || !this.fs) return;
        
        try {
            // Seed hero slides (checked independently)
            const slidesSnap = await this.fs.collection('hero_slides').get();
            if (slidesSnap.empty) {
                console.log("CharoenOnCupDB: Cloud Firestore 'hero_slides' is empty. Seeding default slides to cloud...");
                const slides = [
                    { id: 'slide_1', title_th: 'สกรีนแก้วพลาสติกและบรรจุภัณฑ์', title_en: 'Custom Print Cups & Packaging', subtitle_th: 'เริ่มต้นเพียง 1,000 ใบ สีสดคมชัด ส่งเร็วทั่วไทย ออกแบบฟรีก่อนผลิต!', subtitle_en: 'Starts at 1,000 pcs, vibrant colors, fast shipping, free mockup!', bg_src: '', btn_link: '#/products', order: 1, published: true, visible: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
                    { id: 'slide_2', title_th: 'แก้วกระดาษร้อน-เย็น รักษ์โลก คุณภาพดี', title_en: 'Eco-Friendly Premium Paper Cups', subtitle_th: 'เนื้อกระดาษแข็งแรงทนทานเคลือบกันซึมสกรีนลายสวยงาม ดึงดูดสายตา', subtitle_en: 'Durable Double-Walled paper cups. Premium printing, eye-catching designs.', bg_src: '', btn_link: '#/products', order: 2, published: true, visible: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
                    { id: 'slide_3', title_th: 'ฟิล์มม้วนซีลปากแก้วสกรีนแบรนด์', title_en: 'Custom Sealing Roll Films', subtitle_th: 'พลาสติกฟู้ดเกรด ทนความร้อนสูง ยึดปิดแน่นหนา ป้องกันน้ำหกเลอะเทอะ', subtitle_en: 'Food-grade heat resistant film roll printing. Secure leak-proof seals.', bg_src: '', btn_link: '#/products', order: 3, published: true, visible: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
                ];
                for (const s of slides) {
                    await this.fs.collection('hero_slides').doc(s.id).set(s);
                }
            }

            const snap = await this.fs.collection('company_info').get();
            if (snap.empty) {
                console.log("CharoenOnCupDB: Cloud Firestore settings is empty. Seeding default metadata to cloud...");
                
                // Seed settings
                const defaultSettings = [
                    { key: 'company_name_th', value: 'เจริญ ออน คัพ' },
                    { key: 'company_name_en', value: 'Charoen On Cup' },
                    { key: 'about_title_th', value: 'เจริญ ออน คัพ โรงงานรับสกรีนแก้วพลาสติกและแก้วกระดาษ' },
                    { key: 'about_title_en', value: 'Charoen On Cup Factory for Plastic & Paper Cup Screen Printing' },
                    { key: 'about_desc_th', value: 'ยินดีให้บริการรับสกรีนแก้วพลาสติก แก้วกระดาษ และบรรจุภัณฑ์เครื่องดื่มทุกชนิด เพื่อเพิ่มมูลค่าให้กับแบรนด์ร้านกาแฟของคุณทั่วประเทศ' },
                    { key: 'about_desc_en', value: 'is pleased to offer custom screen printing on plastic cups, paper cups, and all kinds of beverage packaging to add value to your cafe brand nationwide.' },
                    { key: 'phone', value: '095-430-5225' },
                    { key: 'line', value: '@charoenoncup' },
                    { key: 'facebook', value: 'เจริญ ออน คัพ - รับสกรีนแก้วพลาสติก แก้วกระดาษ ครบวงจร' },
                    { key: 'email', value: 'charoenoncup@gmail.com' },
                    { key: 'address_th', value: '18 ซอย 4 ถนนราษฎร์อุทิศ ตำบลหาดใหญ่ อำเภอหาดใหญ่ จังหวัดสงขลา 90110' },
                    { key: 'address_en', value: '18 Soi 4, Rat Uthit Rd, Hatyai, Songkhla 90110' },
                    { key: 'business_hours_th', value: 'จันทร์ - เสาร์: 08:30 น. - 17:30 น. (หยุดวันอาทิตย์)' },
                    { key: 'business_hours_en', value: 'Monday - Saturday: 08:30 AM - 05:30 PM (Closed on Sunday)' },
                    { key: 'logo_img', value: '' },
                    { key: 'show_prices', value: false },
                    { key: 'show_home_video', value: 'true' },
                    { key: 'seo_title', value: 'เจริญ ออน คัพ | สกรีนแก้วหาดใหญ่' },
                    { key: 'seo_desc', value: 'ผู้ผลิตและรับสกรีนแก้วพลาสติก แก้วกระดาษ หาดใหญ่ คุณภาพสูง สีสวยคมชัด' },
                    { key: 'seo_keywords', value: 'สกรีนแก้วหาดใหญ่, สกรีนแก้ว, เจริญ ออน คัพ, พิมพ์แก้ว' }
                ];
                for (const s of defaultSettings) {
                    await this.fs.collection('company_info').doc(s.key).set(s);
                }

                // Seed categories
                const categories = [
                    { id: 'cat-pet', name_th: 'แก้ว PET', name_en: 'PET Cups', order: 1 },
                    { id: 'cat-pp', name_th: 'แก้ว PP', name_en: 'PP Cups', order: 2 },
                    { id: 'cat-paper', name_th: 'แก้วกระดาษ', name_en: 'Paper Cups', order: 3 },
                    { id: 'cat-lid', name_th: 'ฝาแก้ว', name_en: 'Cup Lids', order: 4 },
                    { id: 'cat-straw', name_th: 'หลอด', name_en: 'Straws', order: 5 },
                    { id: 'cat-film', name_th: 'ฟิล์มซีลปากแก้ว', name_en: 'Sealing Films', order: 6 },
                    { id: 'cat-bag', name_th: 'ถุงหูหิ้ว', name_en: 'Loop Bags', order: 7 },
                    { id: 'cat-other', name_th: 'อื่นๆ', name_en: 'Others', order: 8 }
                ];
                for (const cat of categories) {
                    await this.fs.collection('categories').doc(cat.id).set(cat);
                }

            }

            // Check and Seed homepage sections independently
            const homepageSnap = await this.fs.collection('homepage_sections').get();
            if (homepageSnap.empty) {
                console.log("CharoenOnCupDB: Cloud Firestore 'homepage_sections' is empty. Seeding default sections to cloud...");
                const homepage = [
                    { id: 'hero_banner', type: 'hero_banner', order: 1, visible: true, content: { title_th: 'สไลด์เดอร์แบนเนอร์หลัก', title_en: 'Hero Slider Banner' } },
                    { id: 'about_company', type: 'about_company', order: 2, visible: true, content: { title_th: 'ผู้นำด้านการผลิตและสกรีนแก้วครบวงจร', title_en: 'Leading Supplier of Beverage Packaging', desc_th: 'เจริญ ออน คัพ มุ่งมั่นผลิตและจำหน่ายแก้วพลาสติก แก้วกระดาษ ฟิล์มม้วนซีล และอุปกรณ์ประกอบเครื่องดื่ม คุณภาพระดับพรีเมียม ลายเส้นสกรีนสีสันคมชัด สวยสะดุดตา เพื่อเสริมศักยภาพภาพลักษณ์ให้กับแบรนด์คาเฟ่ของลูกค้าทุกระดับทั่วประเทศ', desc_en: 'Charoen On Cup specializes in custom printing premium plastic cups, paper cups, sealing rolls, and cafe accessories. With crisp alignments and vibrant colors, we help upgrade the visual branding of cafes and franchises nationwide.' } },
                    { id: 'strengths', type: 'strengths', order: 3, visible: true, content: { title_th: 'มาตรฐานการผลิตและจุดแข็งของแบรนด์เรา', title_en: 'Our Strengths & Production Standard', items: [
                        { icon: 'fa-pencil-ruler', title_th: 'บริการขึ้นแบบจำลอง 3D ฟรี', title_en: 'Free 3D Digital Mockup', desc_th: 'บริการออกแบบจัดวางโลโก้ ตรวจสอบสเปกและมิติของตัวแก้วในรูปแบบดิจิตอล 3D ก่อนผลิตจริงฟรีทุกตำแหน่ง', desc_en: 'Check logo alignments and sizes on dynamic 3D cup models before printing begins for complete precision.' },
                        { icon: 'fa-award', title_th: 'สีสกรีนพรีเมียมไร้สารพิษ', title_en: 'Food-safe Premium Ink', desc_th: 'ใช้เม็ดสีคุณภาพนำเข้า เนื้อสีแน่นหนา ทนทาน ไม่หลุดลอกแม้อยู่ในอุณหภูมิติดลบหรือเปียกความชื้น', desc_en: 'High-quality imported inks that stick permanently. Will not scratch or peel off even under wet/cold conditions.' },
                        { icon: 'fa-truck', title_th: 'บริการจัดส่งปลอดภัยและรวดเร็ว', title_en: 'Fast & Secure Delivery', desc_th: 'ระบบการแพ็คกล่องหนาแน่นพิเศษ พร้อมพันธมิตรจัดส่งรวดเร็วตรงถึงหน้าร้านของท่านอย่างปลอดภัย', desc_en: 'Special thick carton packaging and trusted logistics networks deliver your orders straight to your cafe door.' }
                    ] } },
                    { id: 'services', type: 'services', order: 4, visible: true, content: { title_th: 'หมวดหมู่บรรจุภัณฑ์หลักของเรา', title_en: 'Our Product Categories', subtitle_th: 'เจริญ ออน คัพ คัดสรรแก้วพรีเมียมและระบบพิมพ์ที่เหมาะสมที่สุดสำหรับคุณ', subtitle_en: 'We select the finest cups and printing processes for your brand' } },
                    { id: 'why_us', type: 'why_us', order: 5, visible: true, content: { title_th: 'ทำไมร้านกาแฟชั้นนำถึงเลือกสกรีนกับเรา', title_en: 'Why Cafes Trust Us', items: [
                        { title_th: 'ยอดการผลิตขั้นต่ำเริ่มเพียง 1,000 ใบ', title_en: 'Low Minimum Order of 1,000 Pcs', desc_th: 'ช่วยให้ร้านกาแฟเปิดใหม่ไม่ต้องแบกรับค่าใช้จ่ายและพื้นที่จัดเก็บถังบรรจุภัณฑ์จำนวนมากเกินไป', desc_en: 'Perfect for new cafe startups to manage operating cash flow and avoid bulky warehouse stocks.' },
                        { title_th: 'ราคาโรงงาน คุ้มค่าแก่การลงทุน', title_en: 'Direct Factory Fair Pricing', desc_th: 'ราคาเป็นธรรม คุ้มค่าคุ้มทุน ไม่มีบวกเพิ่มหรือค่าบล็อกสีซ่อนเร้น ให้ลูกค้าคำนวณต้นทุนได้แม่นยำ', desc_en: 'Transparent pricing with no hidden plate fees, allowing cafes to calculate accurate drink margins.' },
                        { title_th: 'มีทีมที่ปรึกษาเชี่ยวชาญดูแล', title_en: 'Professional Account Support', desc_th: 'ให้คำปรึกษา แนะนำขนาด ปริมาตร ความจุแก้วให้ลงตัวกับสูตรเครื่องดื่มของร้านของท่านอย่างลงตัว', desc_en: 'Consultants guide you to match cup volumes and sealing specs perfectly to your cafe drink recipes.' }
                    ] } },
                    { id: 'steps', type: 'steps', order: 6, visible: true, content: { title_th: 'ขั้นตอนการสั่งผลิตง่ายๆ 4 ขั้นตอน', title_en: '4 Simple Steps to Order', steps: [
                        { title_th: 'เลือกแก้ว & ตกลงราคา', title_en: 'Choose Cup & Pricing', desc_th: 'เลือกประเภทแก้ว ขนาด และจำนวนพิมพ์ที่ต้องการเพื่อรับใบเสนอราคา', desc_en: 'Choose your cup style, size, and quantity for quote' },
                        { title_th: 'ส่งโลโก้ & ตรวจแบบ', title_en: 'Send Logo & Proofing', desc_th: 'ส่งไฟล์โลโก้ ทางร้านออกแบบและขึ้นตัวอย่างแบบ 3D ให้ตรวจฟรียืนยันความถูกต้อง', desc_en: 'Submit your logo for a free 3D digital mockup design verification' },
                        { title_th: 'วางมัดจำ & ผลิตงาน', title_en: 'Deposit & Production', desc_th: 'ชำระค่ามัดจำเพื่อยืนยันคิว และเข้าสู่ขั้นตอนกระบวนการพิมพ์ระบบคุณภาพสูง', desc_en: 'Make deposit to confirm slot and enter into printing process' },
                        { title_th: 'จัดส่ง & ชำระส่วนที่เหลือ', title_en: 'Delivery & Final Payment', desc_th: 'ตรวจสอบสินค้า ชำระเงินส่วนที่เหลือ และบริการจัดส่งทั่วประเทศอย่างปลอดภัย', desc_en: 'Inspect products, pay balance, and secure delivery nationwide' }
                    ] } },
                    { id: 'featured_portfolio', type: 'featured_portfolio', order: 7, visible: true, content: { title_th: 'ผลงานการสกรีนแก้วเด่นที่ผ่านมา', title_en: 'Featured Screen Printed Cups', subtitle_th: 'ผลงานสกรีนแก้วของคาเฟ่ชั้นนำที่มอบความไว้วางใจให้เราดูแลแบรนด์', subtitle_en: 'Custom printing works trusted by leading cafes nationwide' } },
                    { id: 'clients', type: 'clients', order: 8, visible: false, content: { title_th: 'แบรนด์คาเฟ่พันธมิตรที่ไว้ใจสกรีนแก้วกับเรา', title_en: 'Trusted by Cafe Partners' } },
                    { id: 'reviews', type: 'reviews', order: 9, visible: false, content: { title_th: 'เสียงตอบรับจากเจ้าของร้านตัวจริง', title_en: 'Success Stories from Cafe Owners', reviews: [
                        { name: 'คุณนัท - Aether Cafe', review_th: 'สกรีนออกมาคมชัดสวยมากครับ เม็ดสีแน่น แนะนำเลยครับ บริการประทับใจส่งไวทันใจมาก', review_en: 'Extremely sharp prints! The ink matches our cafe branding perfectly. Highly recommended, fast shipping!', rating: 5 },
                        { name: 'คุณชบา - ร้านชบาชา', review_th: 'พิมพ์ลายสกรีนแก้ว Capsule สวยงามไม่หลุดลอกเลยค่ะ ลูกค้าติดใจลวดลาย น่ารักมาก แอดมินแนะนำดีมาก', review_en: 'Capsule cup design doesn\'t peel at all. Customer service was helpful in choosing the perfect size.', rating: 5 },
                        { name: 'คุณเอก - สตาร์รี่ คอฟฟี่', review_th: 'สั่งสกรีนแก้วกระดาษร้อนมา 3 รอบแล้ว คุณภาพดีมาก ลูกค้าจับแล้วไม่ร้อนมือ ดีไซน์ดึงดูดสายตา', review_en: 'Ordered paper cups three times now. The double-walled insulation works wonderfully. Sleek design.', rating: 5 }
                    ] } },
                    { id: 'latest_news', type: 'latest_news', order: 10, visible: true, content: { title_th: 'กิจกรรมและการสนับสนุน', title_en: 'Latest News & Insights', subtitle_th: 'เกร็ดความรู้เรื่องบรรจุภัณฑ์เครื่องดื่มและข่าวสารกิจกรรมสำคัญ', subtitle_en: 'Useful insights on beverage packaging and event updates' } },
                    { id: 'contact_info', type: 'contact_info', order: 11, visible: true, content: { title_th: 'สอบถามข้อมูลสกรีนแก้วและประเมินราคารวดเร็ว', title_en: 'Get an Instant Printing Quote' } }
                ];
                for (const sec of homepage) {
                    sec.created_at = new Date().toISOString();
                    sec.updated_at = new Date().toISOString();
                    await this.fs.collection('homepage_sections').doc(sec.id).set(sec);
                }
            }

            // Check and Seed news independently
            const newsSnap = await this.fs.collection('news').get();
            if (newsSnap.empty) {
                console.log("CharoenOnCupDB: Cloud Firestore 'news' is empty. Seeding news to cloud...");
                const newsList = [
                    {
                        id: 'news_1',
                        title_th: 'เจริญ ออน คัพ เปิดตัวเครื่องพิมพ์สกรีนแก้วระบบไฮสปีดใหม่',
                        title_en: 'Charoen On Cup launches new high-speed screen printer',
                        date: '2026-07-10',
                        visible: true,
                        featured: true,
                        summary_th: 'เราได้ติดตั้งเครื่องพิมพ์สกรีนอัตโนมัติความเร็วสูงตัวใหม่เพื่อรองรับออเดอร์เร่งด่วน ดำเนินการเร็วขึ้น 50%',
                        summary_en: 'We installed a new high-speed automated screen printer to handle urgent orders 50% faster.',
                        content_th: 'เพื่อการตอบสนองความต้องการพิมพ์สกรีนแก้วที่เพิ่มขึ้นอย่างรวดเร็วของร้านคาเฟ่และเฟรนไชส์เครื่องดื่มในภาคใต้ เจริญ ออน คัพ ได้นำเข้าและติดตั้งเครื่องพิมพ์สกรีนระบบกระบอกลมความเร็วสูงตัวใหม่ล่าสุด ช่วยร่นระยะเวลาผลิตจากเดิม 7-10 วัน เหลือเพียง 5-7 วันเท่านั้น! อีกทั้งยังให้ความแม่นยำสูงในระบบจับคู่ระดับสีและตำแหน่งพิมพ์ลายสกรีน',
                        content_en: 'To keep up with the booming demand for custom branded cups among Southern cafes and beverage franchises, Charoen On Cup has imported and set up a new automatic high-speed rotary printing system. This upgrades our average lead time from 10 days down to just 5-7 days, while securing micro-precision print positioning.',
                        thumbnail: 'media__1783572775658.png',
                        seo_title: 'เปิดตัวเครื่องพิมพ์สกรีนแก้วไฮสปีด - เจริญ ออน คัพ',
                        seo_desc: 'ติดตั้งเครื่องพิมพ์แก้วความเร็วสูงรุ่นใหม่ ผลิตด่วน ส่งด่วนทั่วประเทศ'
                    },
                    {
                        id: 'news_2',
                        title_th: 'เจริญ ออน คัพ ร่วมออกบูธแนะนำสเปกแก้วสกรีนในงาน Coffee Fest 2026',
                        title_en: 'Charoen On Cup joins Coffee Fest Expo 2026',
                        date: '2026-07-12',
                        visible: true,
                        featured: false,
                        summary_th: 'พบกับทีมที่ปรึกษาและสัมผัสความหนาของตัวอย่างแก้วพิมพ์ลายจริงของแบรนด์ต่างๆ ได้ที่บูธของเรา',
                        summary_en: 'Meet our consulting team and touch real printed cup samples from various brands at our booth.',
                        content_th: 'ในงาน Coffee Fest 2026 ทาง เจริญ ออน คัพ ได้นำผลิตภัณฑ์และนวัตกรรมการสกรีนแก้วไปจัดแสดงเพื่อเป็นแนวทางให้กับผู้ที่กำลังจะเปิดร้านกาแฟ หรือต้องการยกระดับแบรนด์แก้วสกรีนของตนเอง โดยมีสินค้าให้สัมผัสความหนาและเปรียบเทียบขนาดจริงครบครัน',
                        content_en: 'At the Coffee Fest 2026, Charoen On Cup showcased our custom printed cups and rotary alignment samples. Cafe owners could inspect thickness and material finishes directly to make informed custom ordering decisions.',
                        thumbnail: 'media__1783583098895.png',
                        seo_title: 'เจริญ ออน คัพ ร่วมออกบูธ Coffee Fest 2026 - เจริญ ออน คัพ',
                        seo_desc: 'เก็บบรรยากาศและภาพความประทับใจจากการเข้าร่วมแนะนำสเปกแก้วสกรีนแบรนด์ในงานนิทรรศการกาแฟระดับประเทศ'
                    }
                ];
                for (const n of newsList) {
                    await this.fs.collection('news').doc(n.id).set(n);
                }
            }

            // Check and Seed FAQs independently
            const faqSnap = await this.fs.collection('faq').get();
            if (faqSnap.size < 6) {
                console.log("CharoenOnCupDB: Cloud Firestore 'faq' has fewer than 6 items. Seeding remaining FAQ to cloud...");
                const faqList = [
                    { id: 'faq_1', question_th: 'ขั้นต่ำในการสั่งผลิตสกรีนกี่ใบ?', question_en: 'What is the MOQ for custom printing?', answer_th: 'เริ่มต้นเพียง 1,000 ใบเท่านั้นสำหรับการสกรีน 1 สี', answer_en: 'For standard 1-color screen printing, MOQ starts at 1,000 pcs.', order: 1, visible: true },
                    { id: 'faq_2', question_th: 'มีค่าบล็อกพิมพ์แอบแฝงไหม?', question_en: 'Are there hidden setup fees?', answer_th: 'ราคาโรงงานตรงไปตรงมา ไม่มีค่าบล็อกพิมพ์หรือแอบแฝงใดๆ', answer_en: 'Transparent factory pricing with no hidden block setup fees.', order: 2, visible: true },
                    { id: 'faq_3', question_th: 'ระยะเวลาการผลิตนานเท่าไร?', question_en: 'How long is the production lead time?', answer_th: 'ใช้เวลาผลิตเพียง 7-10 วันหลังจากลูกค้ายืนยันแบบ 3D และชำระมัดจำ', answer_en: 'Production takes 7-10 days after 3D mockup approval and deposit receipt.', order: 3, visible: true },
                    { id: 'faq_4', question_th: 'สามารถจัดส่งต่างจังหวัดได้ไหม?', question_en: 'Can you deliver to other provinces?', answer_th: 'บริการจัดส่งด่วนและปลอดภัยครอบคลุมทั่วประเทศผ่านขนส่งพันธมิตรของเรา', answer_en: 'Secure nationwide express shipping is available through our logistics partners.', order: 4, visible: true },
                    { id: 'faq_5', question_th: 'มีบริการออกแบบลายแก้วให้ไหม?', question_en: 'Do you offer cup design services?', answer_th: 'บริการจัดวางตำแหน่งโลโก้และขึ้นภาพจำลองแบบ 3D ให้ตรวจสอบความถูกต้องฟรีก่อนผลิตจริง', answer_en: 'We offer free logo placement layout design and 3D digital mockup proofing before production.', order: 5, visible: true },
                    { id: 'faq_6', question_th: 'สนใจขอใบเสนอราคาต้องทำอย่างไร?', question_en: 'How do I request a quotation?', answer_th: 'ลูกค้าสามารถเลือกแบบแก้วที่ต้องการผ่านเมนูสินค้าและกดขอใบเสนอราคา หรือติดต่อผ่าน LINE OA ได้ทันที', answer_en: 'You can select a cup style through our products catalog and click request quote, or contact us directly on LINE.', order: 6, visible: true }
                ];
                for (const f of faqList) {
                    const doc = await this.fs.collection('faq').doc(f.id).get();
                    if (!doc.exists) {
                        await this.fs.collection('faq').doc(f.id).set(f);
                    }
                }
            }

            // Check and Seed Client Logos independently
            const clientSnap = await this.fs.collection('logos').get();
            if (clientSnap.empty) {
                console.log("CharoenOnCupDB: Cloud Firestore 'logos' is empty. Seeding logos to cloud...");
                const clientsList = [
                    { id: 'client_1', logo_src: 'client_1_1783670648320.jpg', name: 'Aether Cafe', link: 'https://facebook.com', visible: true, order: 1, featured: true },
                    { id: 'client_2', logo_src: 'client_2_1783670664450.jpg', name: 'Starry Coffee', link: 'https://facebook.com', visible: true, order: 2, featured: true },
                    { id: 'client_3', logo_src: 'client_3_1783670678109.jpg', name: 'Chaba Tea', link: 'https://facebook.com', visible: true, order: 3, featured: true }
                ];
                for (const c of clientsList) {
                    await this.fs.collection('logos').doc(c.id).set(c);
                }
            }

            // Check and Seed Reviews independently
            const reviewsSnap = await this.fs.collection('reviews').get();
            if (reviewsSnap.empty) {
                console.log("CharoenOnCupDB: Cloud Firestore 'reviews' is empty. Seeding reviews to cloud...");
                const reviewsList = [
                    { id: 'rev_1', name: 'คุณนัท - Aether Cafe', review_th: 'สกรีนออกมาคมชัดสวยมากครับ เม็ดสีแน่น แนะนำเลยครับ บริการประทับใจส่งไวทันใจมาก', review_en: 'Extremely sharp prints! The ink matches our cafe branding perfectly. Highly recommended, fast shipping!', rating: 5, visible: true, featured: true },
                    { id: 'rev_2', name: 'คุณชบา - ร้านชบาชา', review_th: 'พิมพ์ลายสกรีนแก้ว Capsule สวยงามไม่หลุดลอกเลยค่ะ ลูกค้าติดใจลวดลาย น่ารักมาก แอดมินแนะนำดีมาก', review_en: 'Capsule cup design doesn\'t peel at all. Customer service was helpful in choosing the perfect size.', rating: 5, visible: true, featured: true },
                    { id: 'rev_3', name: 'คุณเอก - สตาร์รี่ คอฟฟี่', review_th: 'สั่งสกรีนแก้วกระดาษร้อนมา 3 รอบแล้ว คุณภาพดีมาก ลูกค้าจับแล้วไม่ร้อนมือ ดีไซน์ดึงดูดสายตา', review_en: 'Ordered paper cups three times now. The double-walled insulation works wonderfully. Sleek design.', rating: 5, visible: true, featured: true }
                ];
                for (const r of reviewsList) {
                    await this.fs.collection('reviews').doc(r.id).set(r);
                }
            }

            // Ensure all required settings keys exist in Firestore (safe defaults for missing keys)
            const requiredSettings = [
                { key: 'company_name_th', value: 'เจริญ ออน คัพ' },
                { key: 'company_name_en', value: 'Charoen On Cup' },
                { key: 'about_title_th', value: 'เจริญ ออน คัพ โรงงานรับสกรีนแก้วพลาสติกและแก้วกระดาษ' },
                { key: 'about_title_en', value: 'Charoen On Cup Factory for Plastic & Paper Cup Screen Printing' },
                { key: 'about_desc_th', value: 'ยินดีให้บริการรับสกรีนแก้วพลาสติก แก้วกระดาษ และบรรจุภัณฑ์เครื่องดื่มทุกชนิด เพื่อเพิ่มมูลค่าให้กับแบรนด์ร้านกาแฟของคุณทั่วประเทศ' },
                { key: 'about_desc_en', value: 'is pleased to offer custom screen printing on plastic cups, paper cups, and all kinds of beverage packaging to add value to your cafe brand nationwide.' },
                { key: 'phone', value: '095-430-5225' },
                { key: 'line', value: '@charoenoncup' },
                { key: 'facebook', value: 'เจริญ ออน คัพ - รับสกรีนแก้วพลาสติก แก้วกระดาษ ครบวงจร' },
                { key: 'email', value: 'charoenoncup@gmail.com' },
                { key: 'address_th', value: '18 ซอย 4 ถนนราษฎร์อุทิศ ตำบลหาดใหญ่ อำเภอหาดใหญ่ จังหวัดสงขลา 90110' },
                { key: 'address_en', value: '18 Soi 4, Rat Uthit Rd, Hatyai, Songkhla 90110' },
                { key: 'business_hours_th', value: 'จันทร์ - เสาร์: 08:30 น. - 17:30 น. (หยุดวันอาทิตย์)' },
                { key: 'business_hours_en', value: 'Monday - Saturday: 08:30 AM - 05:30 PM (Closed on Sunday)' },
                { key: 'logo_img', value: '' },
                { key: 'show_prices', value: false },
                { key: 'show_home_video', value: 'true' },
                { key: 'seo_title', value: 'เจริญ ออน คัพ | สกรีนแก้วหาดใหญ่' },
                { key: 'seo_desc', value: 'ผู้ผลิตและรับสกรีนแก้วพลาสติก แก้วกระดาษ หาดใหญ่ คุณภาพสูง สีสวยคมชัด' },
                { key: 'seo_keywords', value: 'สกรีนแก้วหาดใหญ่, สกรีนแก้ว, เจริญ ออน คัพ, พิมพ์แก้ว' },
                { key: 'about_image', value: '' },
                { key: 'about_bullets_th', value: '' },
                { key: 'about_bullets_en', value: '' }
            ];

            for (const s of requiredSettings) {
                const docRef = this.fs.collection('company_info').doc(s.key);
                const docSnap = await docRef.get();
                if (!docSnap.exists) {
                    console.log(`CharoenOnCupDB: Seeding missing setting key to Firestore: ${s.key}`);
                    await docRef.set(s);
                }
            }

            console.log("CharoenOnCupDB: Cloud Firestore successfully seeded!");
        } catch (e) {
            console.warn("CharoenOnCupDB: Firestore seeding failed:", e);
        }
    }

    async cleanupEmptyCategories() {
        // Safe check to avoid database lock errors
        if (!this.db || !this.db.objectStoreNames.contains('categories')) return;
        try {
            const categories = await this.getAll('categories');
            if (categories.length === 0) {
                console.log("CharoenOnCupDB: Running cleanup, but no categories found.");
            }
        } catch (err) {
            console.warn("CharoenOnCupDB: Categories cleanup skipped:", err);
        }
    }

    async cleanupMalformedQuotes() {
        try {
            const quotes = await this.getAll('quotes');
            for (const q of quotes) {
                if (!q || !q.name || q.name === 'undefined' || q.name === 'null' || q.name === undefined || q.name === null) {
                    if (q && q.id) {
                        await this.delete('quotes', q.id);
                        console.log(`CharoenOnCupDB: Cleaned up malformed quote ID: ${q.id}`);
                    }
                }
            }
        } catch (err) {
            console.warn("CharoenOnCupDB: Failed to clean up malformed quotes:", err);
        }
    }

    async applyHomepageOrganizationDefaults() {
        // Unconditional repair of why_us, steps, reviews JSON string fields to native Firestore arrays
        try {
            const sectionsToRepair = ['why_us', 'steps', 'reviews', 'strengths'];
            for (const secId of sectionsToRepair) {
                const sec = await this.get('homepage', secId);
                if (sec && sec.content) {
                    let content = sec.content;
                    if (typeof content === 'string') {
                        try {
                            content = JSON.parse(content);
                        } catch (e) {}
                    }
                    if (content && typeof content === 'object') {
                        const arrayKeys = { why_us: 'items', steps: 'steps', reviews: 'reviews', strengths: 'items' };
                        const arrKey = arrayKeys[secId];
                        if (content[arrKey] && typeof content[arrKey] === 'string') {
                            try {
                                content[arrKey] = JSON.parse(content[arrKey]);
                                sec.content = content;
                                await this.put('homepage', sec);
                                console.log(`CharoenOnCupDB: Repaired ${secId} content.${arrKey} JSON string to native array in Firestore!`);
                            } catch (err) {
                                console.error(`CharoenOnCupDB: Failed to parse ${secId} content.${arrKey} JSON string:`, err);
                            }
                        }
                    }
                }
            }
        } catch (e) {
            console.error("CharoenOnCupDB: Failed to verify/repair homepage sections:", e);
        }

        // Unconditional seed/repair of exactly 6 FAQs
        try {
            const faqList = [
                { id: 'faq_1', question_th: 'ขั้นต่ำในการสั่งผลิตสกรีนกี่ใบ?', question_en: 'What is the MOQ for custom printing?', answer_th: 'เริ่มต้นเพียง 1,000 ใบเท่านั้นสำหรับการสกรีน 1 สี', answer_en: 'For standard 1-color screen printing, MOQ starts at 1,000 pcs.', order: 1, visible: true },
                { id: 'faq_2', question_th: 'มีค่าบล็อกพิมพ์แอบแฝงไหม?', question_en: 'Are there hidden setup fees?', answer_th: 'ราคาโรงงานตรงไปตรงมา ไม่มีค่าบล็อกพิมพ์หรือแอบแฝงใดๆ', answer_en: 'Transparent factory pricing with no hidden block setup fees.', order: 2, visible: true },
                { id: 'faq_3', question_th: 'ระยะเวลาการผลิตนานเท่าไร?', question_en: 'How long is the production lead time?', answer_th: 'ใช้เวลาผลิตเพียง 7-10 วันหลังจากลูกค้ายืนยันแบบ 3D และชำระมัดจำ', answer_en: 'Production takes 7-10 days after 3D mockup approval and deposit receipt.', order: 3, visible: true },
                { id: 'faq_4', question_th: 'สามารถจัดส่งต่างจังหวัดได้ไหม?', question_en: 'Can you deliver to other provinces?', answer_th: 'บริการจัดส่งด่วนและปลอดภัยครอบคลุมทั่วประเทศผ่านขนส่งพันธมิตรของเรา', answer_en: 'Secure nationwide express shipping is available through our logistics partners.', order: 4, visible: true },
                { id: 'faq_5', question_th: 'มีบริการออกแบบลายแก้วให้ไหม?', question_en: 'Do you offer cup design services?', answer_th: 'บริการจัดวางตำแหน่งโลโก้และขึ้นภาพจำลองแบบ 3D ให้ตรวจสอบความถูกต้องฟรีก่อนผลิตจริง', answer_en: 'We offer free logo placement layout design and 3D digital mockup proofing before production.', order: 5, visible: true },
                { id: 'faq_6', question_th: 'สนใจขอใบเสนอราคาต้องทำอย่างไร?', question_en: 'How do I request a quotation?', answer_th: 'ลูกค้าสามารถเลือกแบบแก้วที่ต้องการผ่านเมนูสินค้าและกดขอใบเสนอราคา หรือติดต่อผ่าน LINE OA ได้ทันที', answer_en: 'You can select a cup style through our products catalog and click request quote, or contact us directly on LINE.', order: 6, visible: true }
            ];
            for (const f of faqList) {
                const existing = await this.get('faq', f.id);
                if (!existing) {
                    await this.put('faq', f);
                    console.log(`CharoenOnCupDB: Seeded missing FAQ item: ${f.id}`);
                }
            }
        } catch (e) {
            console.error("CharoenOnCupDB: Failed to verify/seed 6 FAQs:", e);
        }

        const flag = await this.get('settings', 'homepage_reorganized_v1');
        if (flag && (flag.value === true || flag.value === 'true')) return;

        // 1. Reorganize clients section to visible: false (hidden by default)
        try {
            const clientsSec = await this.get('homepage', 'clients');
            if (clientsSec) {
                clientsSec.visible = false;
                await this.put('homepage', clientsSec);
            }
        } catch (e) {}

        // 2. Reorganize reviews section to visible: false (hidden by default)
        try {
            const reviewsSec = await this.get('homepage', 'reviews');
            if (reviewsSec) {
                reviewsSec.visible = false;
                await this.put('homepage', reviewsSec);
            }
        } catch (e) {}

        // 3. Reorganize latest_news title_th to "กิจกรรมและการสนับสนุน"
        try {
            const newsSec = await this.get('homepage', 'latest_news');
            if (newsSec) {
                if (!newsSec.content) newsSec.content = {};
                newsSec.content.title_th = 'กิจกรรมและการสนับสนุน';
                if (!newsSec.content.title_en) newsSec.content.title_en = 'Activities & Support';
                if (!newsSec.content.desc_th) newsSec.content.desc_th = 'เกร็ดความรู้เรื่องบรรจุภัณฑ์เครื่องดื่มและข่าวสารกิจกรรมสำคัญ';
                if (!newsSec.content.desc_en) newsSec.content.desc_en = 'Useful insights on beverage packaging and event updates';
                if (!newsSec.content.subtitle_th) newsSec.content.subtitle_th = newsSec.content.desc_th;
                if (!newsSec.content.subtitle_en) newsSec.content.subtitle_en = newsSec.content.desc_en;
                await this.put('homepage', newsSec);
            }
        } catch (e) {}

        // 4. Seed default contact & social settings if they do not exist
        try {
            const defaults = [
                { key: 'phone', value: '064-356-4466' },
                { key: 'facebook_url', value: 'https://www.facebook.com/CharoenOnCups/' },
                { key: 'google_maps_url', value: 'https://www.google.com/maps/place/%E0%B9%80%E0%B8%85%E0%B8%A3%E0%B8%B4%E0%B8%8D+%E0%B8%AD%E0%B8%AD%E0%B8%99+%E0%B8%84%E0%B8%B1%E0%B8%9E/@6.9951145,100.4805677,18.75z/data=!4m6!3m5!1s0x304d29ff5f3b4259:0x265d6f60ca965a53!8m2!3d6.9952709!4d100.4811865!16s%2Fg%2F11xzdvzpnw?authuser=0&entry=ttu&g_ep=EgoyMDI2MDcxMi4wIKXMDSoASAFQAw%3D%3D' },
                { key: 'google_maps_embed_url', value: 'https://www.google.com/maps?q=6.9952709,100.4811865&output=embed' },
                { key: 'line_qr_image', value: 'line_qr.jpg' },
                { key: 'contact_title_th', value: 'ติดต่อเรา' },
                { key: 'contact_title_en', value: 'Contact Us' },
                { key: 'contact_description_th', value: 'หากต้องการสกรีนแก้ว สอบถามข้อมูล หรือประเมินราคา สามารถกรอกแบบฟอร์มหรือติดต่อผ่านช่องทางด้านล่างได้ทันที' },
                { key: 'contact_description_en', value: 'For screen printing inquiries, pricing, or product specifications, please fill out the form or contact us below.' },
                { key: 'contact_visible', value: 'true' },
                { key: 'facebook_visible', value: 'true' },
                { key: 'instagram_visible', value: 'false' },
                { key: 'tiktok_visible', value: 'false' },
                { key: 'youtube_visible', value: 'false' },
                { key: 'line_visible', value: 'true' },
                { key: 'line_qr_visible', value: 'true' },
                { key: 'instagram_url', value: '' },
                { key: 'tiktok_url', value: '' },
                { key: 'youtube_url', value: '' },
                { key: 'line_url', value: 'https://line.me/R/ti/p/%40charoenoncup' }
            ];

            for (const d of defaults) {
                const existing = await this.get('settings', d.key);
                if (!existing || existing.value === '' || existing.value === null || existing.value === undefined) {
                    await this.put('settings', { key: d.key, value: d.value });
                    console.log(`CharoenOnCupDB: Seeded default setting for ${d.key}`);
                }
            }
        } catch (e) {
            console.error("CharoenOnCupDB: Failed to verify/seed default contact settings:", e);
        }

        // Set the flag
        await this.put('settings', { key: 'homepage_reorganized_v1', value: true });
    }

    // Sync all local IndexedDB data to Firebase Firestore (Migration Tool)
    async syncIndexedDBToFirestore() {
        if (!this.fs) {
            throw new Error("Firebase Firestore is not initialized.");
        }
        
        const stores = ['categories', 'products', 'portfolio', 'homepage', 'settings', 'users', 'media_categories', 'slider', 'news', 'articles', 'clients', 'faq', 'reviews'];
        
        for (const storeName of stores) {
            const localData = await new Promise((resolve, reject) => {
                try {
                    const transaction = this.db.transaction(storeName, 'readonly');
                    const store = transaction.objectStore(storeName);
                    const request = store.getAll();
                    request.onsuccess = () => resolve(request.result);
                    request.onerror = () => reject(request.error);
                } catch (err) {
                    reject(err);
                }
            });
            
            for (const item of localData) {
                const docId = storeName === 'settings' ? item.key : (storeName === 'users' ? item.username : item.id);
                if (docId) {
                    // Security Exclusion Policy: Do not store secrets, passwords, or Firebase config inside company_info
                    if (storeName === 'settings') {
                        const forbiddenKeys = ['firebase_config', 'firebase_credentials', 'secret', 'password'];
                        if (forbiddenKeys.some(key => docId.includes(key))) {
                            continue;
                        }
                    }
                    const safeItem = this.sanitizeForFirestore(item);
                    const colName = this.getCollectionName(storeName);
                    await this.fs.collection(colName).doc(docId).set(safeItem, { merge: true });
                }
            }
        }
    }

    async getIndexedDBCounts() {
        const counts = {};
        const stores = ['categories', 'products', 'portfolio', 'homepage', 'settings', 'users', 'quotes', 'media', 'media_categories', 'slider', 'home_videos', 'news', 'articles', 'clients', 'faq', 'reviews'];
        for (const storeName of stores) {
            counts[storeName] = await new Promise((resolve) => {
                try {
                    if (!this.db || !this.db.objectStoreNames.contains(storeName)) {
                        resolve(0);
                        return;
                    }
                    const transaction = this.db.transaction(storeName, 'readonly');
                    const store = transaction.objectStore(storeName);
                    const request = store.count();
                    request.onsuccess = () => resolve(request.result || 0);
                    request.onerror = () => resolve(0);
                } catch (err) {
                    resolve(0);
                }
            });
        }
        return counts;
    }

    async syncIndexedDBToFirestoreWithStats() {
        if (!this.isCloudEnabled || !this.fs) {
            throw new Error("Firebase Firestore is not initialized or offline.");
        }

        let successCount = 0;
        let skippedCount = 0;
        let failureCount = 0;

        const stores = ['categories', 'products', 'portfolio', 'homepage', 'settings', 'users', 'media_categories', 'slider', 'news', 'articles', 'clients', 'faq', 'reviews'];

        for (const storeName of stores) {
            const localData = await new Promise((resolve, reject) => {
                try {
                    const transaction = this.db.transaction(storeName, 'readonly');
                    const store = transaction.objectStore(storeName);
                    const request = store.getAll();
                    request.onsuccess = () => resolve(request.result || []);
                    request.onerror = () => reject(request.error);
                } catch (err) {
                    reject(err);
                }
            });
            
            for (const item of localData) {
                const docId = storeName === 'settings' ? item.key : (storeName === 'users' ? item.username : item.id);
                if (docId) {
                    // Security Exclusion Policy: Do not store secrets, passwords, or Firebase config inside company_info
                    if (storeName === 'settings') {
                        const forbiddenKeys = ['firebase_config', 'firebase_credentials', 'secret', 'password'];
                        if (forbiddenKeys.some(key => docId.includes(key))) {
                            continue;
                        }
                    }
                    try {
                        const colName = this.getCollectionName(storeName);
                        const docRef = this.fs.collection(colName).doc(docId);
                        const docSnap = await docRef.get();
                        
                        if (docSnap.exists) {
                            skippedCount++;
                        } else {
                            const safeItem = this.sanitizeForFirestore(item);
                            await docRef.set(safeItem);
                            successCount++;
                        }
                    } catch (err) {
                        console.error(`Migration error on ${storeName}/${docId}:`, err);
                        failureCount++;
                    }
                }
            }
        }

        // Store migration completion flag in settings
        await this.put('settings', { key: 'migration_completed', value: true });

        return {
            success: successCount,
            failure: failureCount,
            skipped: skippedCount
        };
    }

    // Database JSON backup (Export / Import)
    async exportDatabaseToJSON() {
        const backup = {};
        const stores = ['categories', 'products', 'portfolio', 'homepage', 'settings', 'users', 'quotes', 'media', 'media_categories', 'slider', 'home_videos', 'news', 'articles', 'clients', 'faq', 'reviews'];
        
        for (const storeName of stores) {
            backup[storeName] = await new Promise((resolve) => {
                try {
                    if (!this.db || !this.db.objectStoreNames.contains(storeName)) {
                        resolve([]);
                        return;
                    }
                    const transaction = this.db.transaction(storeName, 'readonly');
                    const store = transaction.objectStore(storeName);
                    const request = store.getAll();
                    request.onsuccess = () => resolve(request.result || []);
                    request.onerror = () => resolve([]);
                } catch (err) {
                    resolve([]);
                }
            });
        }
        return JSON.stringify(backup, null, 2);
    }

    async importDatabaseFromJSON(jsonString) {
        const data = JSON.parse(jsonString);
        const stores = ['categories', 'products', 'portfolio', 'homepage', 'settings', 'users', 'quotes', 'media', 'media_categories', 'slider', 'home_videos', 'news', 'articles', 'clients', 'faq', 'reviews'];
        
        for (const storeName of stores) {
            if (data[storeName] && Array.isArray(data[storeName])) {
                await new Promise((resolve, reject) => {
                    try {
                        const transaction = this.db.transaction(storeName, 'readwrite');
                        const store = transaction.objectStore(storeName);
                        store.clear();
                        
                        for (const item of data[storeName]) {
                            store.put(item);
                        }
                        
                        transaction.oncomplete = () => resolve();
                        transaction.onerror = () => reject(transaction.error);
                    } catch (err) {
                        reject(err);
                    }
                });
            }
        }
        
        // Refresh cache
        this.memCache = {};
        return true;
    }
}

// Instantiate globally
window.CharoenOnCupDB = CharoenOnCupDB;