# SC Vanavil Luzern - Website

Moderne, responsive Multi-Page Website für SC Vanavil Luzern mit dynamischem Content-Management.

## 🎯 Features

- **Multi-Page Struktur**: Home, News, Spielplan, Mannschaft, Galerie, Kontakt
- **Admin Panel**: News, Spiele, Spieler, Kader und Galerie verwalten (Firebase)
- **Spielerverwaltung**: Spieler erfassen mit Foto & Spielerausweis (nur Admin sichtbar)
- **Kader-Management**: Spieler den Teams zuordnen (Erste Mannschaft, Junioren, Academy)
- **Galerie**: Bilder hochladen mit Lightbox-Ansicht
- **Teamfoto**: Prominent auf der Startseite, vom Admin hochladbar
- **STFA Integration**: Live-Ticker Link, Turnierübersicht, Rangliste
- **Instagram**: Einbindung via Embed oder API
- **Responsive Design**: Optimiert für Mobile, Tablet und Desktop
- **Kontaktformular**: Mit Formspree (kostenlos)

## 📁 Projektstruktur

```
Website-Vanavil/
├── index.html          # Homepage
├── news.html           # News-Seite
├── spielplan.html      # Spielplan & Turniere
├── mannschaft.html     # Team & Vorstand
├── kontakt.html        # Kontakt & Mitgliedschaft
├── admin.html          # Admin Dashboard
├── css/
│   └── main.css        # Alle Styles
├── js/
│   ├── firebase-config.js  # Firebase Setup
│   └── main.js         # UI & Navigation├── galerie.html        # Galerie└── README.md           # Diese Datei
```

## 🚀 Quick Start (Lokal testen)

1. **Ordner öffnen** in VS Code
2. **Live Server Extension** installieren (falls nicht vorhanden)
3. **Rechtsklick auf index.html** → "Open with Live Server"
4. Website öffnet sich im Browser

Oder einfach `index.html` direkt im Browser öffnen.

---

## 🔥 Firebase Setup (für dynamische Inhalte)

Für dynamische Inhalte wird Firebase benötigt:

### 1. Firebase Projekt erstellen

1. Gehe zu [Firebase Console](https://console.firebase.google.com)
2. Klicke "Projekt hinzufügen"
3. Name: `sc-vanavil-website`
4. Google Analytics: Optional (kann aus sein)

### 2. Web-App hinzufügen

1. Im Projekt-Dashboard: Klicke auf `</>` (Web)
2. App-Name: `sc-vanavil-web`
3. Firebase Hosting: ❌ (nicht nötig, nutzen anderes Hosting)
4. **Kopiere die Config-Werte**

### 3. Config in Website eintragen

Öffne `js/firebase-config.js` und ersetze:

```javascript
const firebaseConfig = {
  apiKey: "DEIN_API_KEY",
  authDomain: "DEIN_PROJEKT.firebaseapp.com",
  projectId: "DEIN_PROJEKT_ID",
  storageBucket: "DEIN_PROJEKT.appspot.com",
  messagingSenderId: "DEINE_SENDER_ID",
  appId: "DEINE_APP_ID"
};
```

### 4. Authentication aktivieren

1. In Firebase Console: **Authentication** → **Erste Schritte**
2. Anmeldemethode: **E-Mail/Passwort** aktivieren
3. **Nutzer hinzufügen**: Email + Passwort für Admin erstellen

### 5. Firestore Database erstellen

1. **Firestore Database** → **Datenbank erstellen**
2. Modus: **Testmodus starten** (später sichern!)
3. Standort: `europe-west6` (Zürich)

### 6. Sicherheitsregeln setzen

In Firestore → **Regeln** einfügen:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Jeder kann lesen
    match /{document=**} {
      allow read: if true;
    }
    // Nur eingeloggte Admins können schreiben
    match /news/{doc} {
      allow write: if request.auth != null;
    }
    match /matches/{doc} {
      allow write: if request.auth != null;
    }
    match /tournaments/{doc} {
      allow write: if request.auth != null;
    }
  }
}
```

---

## 📧 Kontaktformular (Formspree)

1. Gehe zu [Formspree](https://formspree.io)
2. Erstelle kostenlosen Account
3. Neues Formular erstellen
4. Kopiere die Form-ID
5. In `kontakt.html` ersetzen:

```html
<form action="https://formspree.io/f/DEINE_FORM_ID" method="POST">
```

---

## 📸 Instagram Einbindung

### Option A: Manuelles Embed (einfach)

1. Auf Instagram: Post öffnen → `...` → "Einbetten"
2. Code kopieren
3. In `index.html` im Instagram-Bereich einfügen

### Option B: Instagram API (automatisch)

Erfordert Facebook Developer Account und App-Genehmigung.
Anleitung: [Instagram Basic Display API](https://developers.facebook.com/docs/instagram-basic-display-api)

---

## 🌐 Hosting & Domain

### Empfehlung: Netlify (kostenlos & einfach)

1. Account auf [Netlify](https://netlify.com) erstellen
2. "Add new site" → "Deploy manually"
3. Gesamten `Website-Vanavil` Ordner hochladen (Drag & Drop)
4. Website ist sofort online unter `random-name.netlify.app`

### Domain verbinden

1. Domain kaufen bei: Hostpoint, Infomaniak, Namecheap, etc.
2. In Netlify: Domain Management → Add custom domain
3. DNS-Einträge beim Domain-Anbieter setzen:
   - **Option A (empfohlen)**: Netlify DNS nutzen (Nameserver ändern)
   - **Option B**: A-Record auf Netlify IP + CNAME auf Netlify-URL

**SSL-Zertifikat** wird automatisch von Netlify erstellt (kostenlos!).

### Alternative: Vercel

Gleicher Ablauf wie Netlify, ebenfalls kostenlos.

### Alternative: Traditionelles Hosting

1. FTP-Zugang von Hostpoint/Infomaniak holen
2. Alle Dateien in den `public_html` oder `www` Ordner hochladen
3. Domain im Hosting-Panel verbinden

---

## ✏️ Inhalte anpassen

### Texte ändern

Direkt in den HTML-Dateien bearbeiten:
- `index.html` - Hero-Text, Stats, allgemeine Infos
- `mannschaft.html` - Vereinsgeschichte, Vorstand-Namen
- `kontakt.html` - Adresse, Training, Links

### Farben ändern

In `css/main.css` die CSS-Variablen anpassen:

```css
:root {
  --primary: #1a237e;        /* Hauptfarbe */
  --accent: #ffb703;         /* Akzentfarbe (Gold) */
  --accent-2: #00d4ff;       /* Sekundär (Cyan) */
  --bg-dark: #0a1628;        /* Hintergrund */
}
```

### Logo einbinden

1. Logo als `logo.png` im Hauptordner speichern
2. In HTML das Logo-Icon ersetzen durch:

```html
<img src="logo.png" alt="SC Vanavil" style="width: 48px; height: 48px; border-radius: 50%;">
```

---

## 📱 Admin-Bereich nutzen

1. Gehe zu `admin.html`
2. Login mit Firebase-Admin-Credentials
3. **News Tab**: Neue Artikel erstellen/löschen
4. **Spiele Tab**: Matches und Turniere erfassen
5. Änderungen erscheinen sofort auf der Website

---

## 🔧 Troubleshooting

### Firebase funktioniert nicht
- Config-Werte korrekt eingefügt?
- Authentication aktiviert?
- Firestore erstellt?
- Browser-Konsole auf Fehler prüfen (F12)

### Formular sendet nicht
- Formspree-ID korrekt?
- Formspree-Account verifiziert?

### Seite lädt langsam
- Bilder komprimieren (tinypng.com)
- Browser-Cache leeren

---

## 💰 Für deinen 100 CHF Auftrag

**Enthalten:**
- ✅ Komplette Multi-Page Website
- ✅ Admin-Panel für News/Spiele
- ✅ Mobile-optimiertes Design
- ✅ STFA-Integration
- ✅ Kontaktformular
- ✅ Setup-Anleitung

**Optional (zusätzlich berechenbar):**
- Mehrsprachigkeit (DE/Tamil)
- Spielerprofile mit Fotos
- Galerie mit Lightbox
- SEO-Optimierung
- Wartungsvertrag

---

## 📞 Support

Bei technischen Fragen: Kontaktiere den Website-Ersteller.

---

**Built with ❤️ for SC Vanavil Luzern**