/**
 * Firebase Configuration for SC Vanavil Luzern
 *
 * SETUP INSTRUCTIONS:
 * 1. Go to https://console.firebase.google.com
 * 2. Create a new project (e.g., "sc-vanavil-website")
 * 3. Add a Web App to the project
 * 4. Copy the config values below
 * 5. Enable Authentication > Email/Password
 * 6. Create Firestore Database (start in test mode, then add rules)
 * 7. Enable Storage (Firebase Storage) and set rules below
 *
 * CDN SCRIPTS REQUIRED in HTML (add after auth compat):
 *   <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-storage-compat.js"></script>
 *
 * FIRESTORE RULES (Security):
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     match /{document=**} {
 *       allow read: if true;
 *     }
 *     match /news/{doc}       { allow write: if request.auth != null; }
 *     match /matches/{doc}    { allow write: if request.auth != null; }
 *     match /tournaments/{doc}{ allow write: if request.auth != null; }
 *     match /players/{doc}    { allow write: if request.auth != null; }
 *     match /roster/{doc}     { allow write: if request.auth != null; }
 *     match /gallery/{doc}    { allow write: if request.auth != null; }
 *     match /settings/{doc}   { allow write: if request.auth != null; }
 *   }
 * }
 *
 * STORAGE RULES:
 * rules_version = '2';
 * service firebase.storage {
 *   match /b/{bucket}/o {
 *     // Public read for photos, gallery, team
 *     match /players/photos/{file}  { allow read: if true;  allow write: if request.auth != null; }
 *     match /gallery/{file}         { allow read: if true;  allow write: if request.auth != null; }
 *     match /team/{file}            { allow read: if true;  allow write: if request.auth != null; }
 *     // Spielerausweis: ONLY authenticated admins
 *     match /players/ausweise/{file}{ allow read, write: if request.auth != null; }
 *   }
 * }
 */

const firebaseConfig = {
  apiKey: "AIzaSyC_dcpat7i6G6QoUtW40zqR4XH3ierU_LM",
  authDomain: "sc-vanavil-web-2026-d388a.firebaseapp.com",
  projectId: "sc-vanavil-web-2026-d388a",
  storageBucket: "sc-vanavil-web-2026-d388a.firebasestorage.app",
  messagingSenderId: "966715248430",
  appId: "1:966715248430:web:abf14f442a1a1e52fbf4bf"
};

// Initialize Firebase (loaded from CDN in HTML)
let db = null;
let auth = null;
let storage = null;

function initFirebase() {
  if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth();
    if (firebase.storage) {
      storage = firebase.storage();
    }
    console.log('Firebase initialized');
    return true;
  }
  console.warn('Firebase SDK not loaded');
  return false;
}

// ========== DATA FETCHING ==========

/**
 * Fetch all news articles
 */
async function getNews(limit = 10) {
  if (!db) return [];
  try {
    const snapshot = await db.collection('news')
      .orderBy('date', 'desc')
      .limit(limit)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}

/**
 * Fetch upcoming matches
 */
async function getMatches(limit = 5) {
  if (!db) return [];
  try {
    const today = new Date().toISOString().split('T')[0];
    const snapshot = await db.collection('matches')
      .where('date', '>=', today)
      .orderBy('date', 'asc')
      .limit(limit)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching matches:', error);
    return [];
  }
}

/**
 * Fetch all matches (past and future)
 */
async function getAllMatches() {
  if (!db) return [];
  try {
    const snapshot = await db.collection('matches')
      .orderBy('date', 'desc')
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching matches:', error);
    return [];
  }
}

/**
 * Fetch tournaments
 */
async function getTournaments() {
  if (!db) return [];
  try {
    const snapshot = await db.collection('tournaments')
      .orderBy('date', 'asc')
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    return [];
  }
}

// ========== ADMIN FUNCTIONS ==========

/**
 * Add a news article
 */
async function addNews(newsData) {
  if (!db || !auth.currentUser) return null;
  try {
    const docRef = await db.collection('news').add({
      ...newsData,
      date: new Date().toISOString(),
      author: auth.currentUser.email
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding news:', error);
    return null;
  }
}

/**
 * Add a match
 */
async function addMatch(matchData) {
  if (!db || !auth.currentUser) return null;
  try {
    const docRef = await db.collection('matches').add(matchData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding match:', error);
    return null;
  }
}

/**
 * Update a match result
 */
async function updateMatch(matchId, data) {
  if (!db || !auth.currentUser) return false;
  try {
    await db.collection('matches').doc(matchId).update(data);
    return true;
  } catch (error) {
    console.error('Error updating match:', error);
    return false;
  }
}

/**
 * Delete a document
 */
async function deleteDocument(collection, docId) {
  if (!db || !auth.currentUser) return false;
  try {
    await db.collection(collection).doc(docId).delete();
    return true;
  } catch (error) {
    console.error('Error deleting document:', error);
    return false;
  }
}

// ========== AUTH FUNCTIONS ==========

/**
 * Admin login
 */
async function adminLogin(email, password) {
  if (!auth) return { success: false, error: 'Auth not initialized' };
  try {
    await auth.signInWithEmailAndPassword(email, password);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Admin logout
 */
async function adminLogout() {
  if (!auth) return;
  try {
    await auth.signOut();
  } catch (error) {
    console.error('Error signing out:', error);
  }
}

/**
 * Check if user is logged in
 */
function isLoggedIn() {
  return auth && auth.currentUser !== null;
}

/**
 * Listen to auth state changes
 */
function onAuthStateChange(callback) {
  if (!auth) return;
  auth.onAuthStateChanged(callback);
}

// ========== STORAGE ==========

/**
 * Upload a file to Firebase Storage — returns download URL or null
 */
async function uploadFile(storagePath, file) {
  if (!storage || !auth.currentUser) return null;
  try {
    const ref = storage.ref(storagePath);
    const snapshot = await ref.put(file);
    return await snapshot.ref.getDownloadURL();
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
}

/**
 * Delete a file from Firebase Storage
 */
async function deleteFile(storagePath) {
  if (!storage || !auth.currentUser) return false;
  try {
    await storage.ref(storagePath).delete();
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

// ========== PLAYERS ==========

/**
 * Fetch all players (sorted by name)
 */
async function getPlayers() {
  if (!db) return [];
  try {
    const snapshot = await db.collection('players').orderBy('name', 'asc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching players:', error);
    return [];
  }
}

/**
 * Add a new player
 */
async function addPlayer(playerData) {
  if (!db || !auth.currentUser) return null;
  try {
    const docRef = await db.collection('players').add({
      ...playerData,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding player:', error);
    return null;
  }
}

/**
 * Update a player's data
 */
async function updatePlayer(playerId, data) {
  if (!db || !auth.currentUser) return false;
  try {
    await db.collection('players').doc(playerId).update(data);
    return true;
  } catch (error) {
    console.error('Error updating player:', error);
    return false;
  }
}

// ========== ROSTER ==========

/**
 * Get the player IDs for a team roster
 * team: "erste-mannschaft" | "junioren" | "academy"
 */
async function getRoster(team) {
  if (!db) return [];
  try {
    const doc = await db.collection('roster').doc(team).get();
    return doc.exists ? (doc.data().playerIds || []) : [];
  } catch (error) {
    console.error('Error fetching roster:', error);
    return [];
  }
}

/**
 * Set the full roster for a team (replaces existing)
 */
async function setRoster(team, playerIds) {
  if (!db || !auth.currentUser) return false;
  try {
    await db.collection('roster').doc(team).set({
      playerIds,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error setting roster:', error);
    return false;
  }
}

// ========== GALLERY ==========

/**
 * Fetch gallery images
 */
async function getGallery(limit = 50) {
  if (!db) return [];
  try {
    const snapshot = await db.collection('gallery')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching gallery:', error);
    return [];
  }
}

/**
 * Add a gallery image record
 */
async function addGalleryImage(data) {
  if (!db || !auth.currentUser) return null;
  try {
    const docRef = await db.collection('gallery').add({
      ...data,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding gallery image:', error);
    return null;
  }
}

/**
 * Delete a gallery image (Firestore doc + Storage file)
 */
async function deleteGalleryImage(id, storagePath) {
  if (!db || !auth.currentUser) return false;
  try {
    await db.collection('gallery').doc(id).delete();
    if (storagePath) await deleteFile(storagePath);
    return true;
  } catch (error) {
    console.error('Error deleting gallery image:', error);
    return false;
  }
}

// ========== SETTINGS ==========

/**
 * Get site-wide settings (teamPhotoURL, etc.)
 */
async function getSettings() {
  if (!db) return {};
  try {
    const doc = await db.collection('settings').doc('global').get();
    return doc.exists ? doc.data() : {};
  } catch (error) {
    console.error('Error fetching settings:', error);
    return {};
  }
}

/**
 * Update (merge) site-wide settings
 */
async function updateSettings(data) {
  if (!db || !auth.currentUser) return false;
  try {
    await db.collection('settings').doc('global').set(data, { merge: true });
    return true;
  } catch (error) {
    console.error('Error updating settings:', error);
    return false;
  }
}

// Export for use in other scripts
window.VanavilDB = {
  init: initFirebase,
  getNews,
  getMatches,
  getAllMatches,
  getTournaments,
  addNews,
  addMatch,
  updateMatch,
  deleteDocument,
  // Players
  getPlayers,
  addPlayer,
  updatePlayer,
  // Roster
  getRoster,
  setRoster,
  // Gallery
  getGallery,
  addGalleryImage,
  deleteGalleryImage,
  // Storage
  uploadFile,
  deleteFile,
  // Settings
  getSettings,
  updateSettings,
  // Auth
  adminLogin,
  adminLogout,
  isLoggedIn,
  onAuthStateChange
};
