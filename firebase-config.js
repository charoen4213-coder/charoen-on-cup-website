// firebase-config.js
// Centralized Firebase configuration loader for Charoen On Cup Website & Admin CMS.
// Initializes Firebase only once, loading configuration dynamically from IndexedDB.

(function() {
    window.firebaseConfigLoaded = false;
const firebaseConfig = {
  apiKey: "AIzaSyCynk3dPeRt0sr9F-hIApMavZAnSEIpVg0",
  authDomain: "charoen-website-website.firebaseapp.com",
  projectId: "charoen-website-website",
  storageBucket: "charoen-website-website.firebasestorage.app",
  messagingSenderId: "208161302324",
  appId: "1:208161302324:web:74121d5d08a4f282ec2761",
  measurementId: "G-9BEZV6NY0K"
};
    // Helper function to dynamically initialize Firebase from an configuration object
    window.initializeFirebaseApp = function(config) {
        if (config && config.apiKey && typeof firebase !== 'undefined') {
            if (!firebase.apps.length) {
                firebase.initializeApp(config);
                console.log("Firebase App initialized successfully from config.");
                try {
                    // Enable long polling to prevent security block issues on file:// protocol
                    const dbInstance = firebase.firestore();
                    dbInstance.settings({ experimentalForceLongPolling: true });
                } catch (err) {
                    console.warn("Firestore settings configuration warning:", err);
                }
            }
            window.firebaseConfigLoaded = true;
            return true;
        }
        return false;
    };
window.initializeFirebaseApp(firebaseConfig);
    // Attempt to open IndexedDB to fetch the saved firebase_config key
    const dbName = 'CharoenOnCupDB';
    try {
        const request = indexedDB.open(dbName);
        request.onsuccess = function(event) {
            const db = event.target.result;
            if (db.objectStoreNames.contains('settings')) {
                try {
                    const transaction = db.transaction('settings', 'readonly');
                    const store = transaction.objectStore('settings');
                    const getRequest = store.get('firebase_config');
                    
                    getRequest.onsuccess = function(e) {
                        const fbConfig = e.target.result ? e.target.result.value : null;
                        if (fbConfig) {
                            window.initializeFirebaseApp(fbConfig);
                        }
                    };
                } catch (err) {
                    console.warn("firebase-config.js: Failed to read from settings store:", err);
                }
            }
        };
    } catch (e) {
        console.warn("firebase-config.js: IndexedDB open failed:", e);
    }
})();
