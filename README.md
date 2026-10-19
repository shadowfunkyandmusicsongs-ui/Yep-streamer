# YEP Streamer — Premium Entertainment Platform

**YEP Streamer** is an original, production-grade streaming application delivering high-definition Anime series, cinematic movies, seasons and episodes, Telugu and Hindi audio dubs, vertical creator reels, and Gemini AI-grounded entertainment discovery.

---

## 🌟 Core Features

1. **Entertainment Catalog & Discovery**:
   - Anime series, anime movies, feature films, and episodic TV dramas.
   - Verified audio dub tracks: **Telugu Dub**, **Hindi Dub**, **Japanese Original**, and **English Audio**.
   - Closed captions and multi-language subtitles.
   - Zero-pill metadata typography with high typographic fidelity.

2. **Adaptive Bitrate HLS Player**:
   - Universal HTML5 and `Hls.js` adaptive bitrate streaming.
   - Manual & Auto resolution selection (`1080p Full HD`, `720p HD`, `480p SD`, `Auto`).
   - Dynamic audio track switcher (e.g., Telugu Primary Dub vs Japanese Original).
   - Subtitle selector (English CC, Telugu, Hindi, Japanese, Off).
   - 0.5x to 2x playback speed control.
   - Resume playback prompt with persistent seconds-level progress tracking.
   - Keyboard shortcuts: `Space` (Play/Pause), `F` (Fullscreen), `M` (Mute), `Arrow Keys` (Seek / Volume).

3. **Mobile-First Vertical Reels Feed**:
   - Snapping vertical video feed with progressive loading.
   - IntersectionObserver active-view autoplay (videos outside viewport pause automatically).
   - Interactive sidebar: likes with heart counter, comments drawer, link sharing with clipboard copy, save to library, and creator profiles.
   - Content reporting modal for copyright and community moderation.

4. **Creator Studio & Ingestion Engine**:
   - Authorized video uploads with MIME validation (`video/mp4`, `video/webm`, `video/quicktime`, `.mkv`) and size limits.
   - Media probe inspection simulating `ffprobe` (codec, bitrate, channels, duration).
   - Explicit processing state machine: `uploaded` → `queued` → `probing` → `transcoding` → `packaging` → `validating` → `ready` (+ `failed`).
   - HLS package manifest breakdown: `master.m3u8`, `1080p/index.m3u8`, `720p/index.m3u8`, `480p/index.m3u8`.
   - Title publication, draft management, and rights certification.

5. **Server-Side Gemini AI Assistant**:
   - Official `@google/genai` TypeScript SDK server-side endpoint `/api/gemini/assistant`.
   - Model: `gemini-3.8-flash`.
   - Strict catalog grounding: answers conceptual queries (e.g. *"Show me action anime with sword duels dubbed in Telugu"*) and links directly to playable catalog titles without fabricating availability.
   - Web Speech API voice search support.

6. **Admin Dashboard & RBAC Governance**:
   - Role-Based Access Control: `Viewer`, `Creator`, `Content Manager`, and `Administrator`.
   - Live role switcher in header for developer testing and permission validation.
   - Content catalog management (toggle featured, toggle published, remove).
   - User role assignment table.
   - Moderation reports queue for copyright takedown reviews.
   - Immutable administrative audit logs.

7. **5 Cinematic Themes & Localization**:
   - *Cinematic Dark* (Default slate/cyan)
   - *Midnight Cinema* (Obsidian/crimson)
   - *Neon Anime* (Cyberpunk magenta/teal)
   - *Minimal Studio* (Titanium graphite)
   - *Light Mode* (High clarity daylight)
   - Interface localization in **English**, **Telugu (తెలుగు)**, **Hindi (हिन्दी)**, and **Japanese (日本語)**.
   - Reduced motion accessibility switch.

---

## 🏗️ Project Architecture

```
/
├── .env.example              # Complete environment variables guide
├── firestore.rules           # Enterprise Cloud Firestore security rules
├── storage.rules             # Cloud Storage security rules for video/posters
├── metadata.json             # Applet metadata with MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API
├── server.ts                 # Full-stack Express server with Vite middleware & Gemini endpoint
├── src/
│   ├── types/index.ts        # TypeScript data models (ContentItem, UploadJob, UserRole, etc.)
│   ├── services/firebase.ts  # Firebase Auth, Firestore, and fallback simulation bridge
│   ├── context/
│   │   ├── AuthContext.tsx       # Authentication & role management
│   │   ├── ThemeContext.tsx      # Themes, UI language, and reduced motion
│   │   └── WatchlistContext.tsx  # Watchlist and watch progress persistence
│   ├── components/
│   │   ├── common/Header.tsx     # Navigation, role switcher, theme & language dropdowns
│   │   ├── common/Footer.tsx     # Architecture footer & copyright agent info
│   │   ├── content/ContentCard.tsx   # Card with hover actions & zero-pill metadata
│   │   ├── content/ContentShelf.tsx  # Horizontal scrolling carousel
│   │   ├── content/HeroCarousel.tsx  # Featured hero banner
│   │   ├── video/VideoPlayer.tsx     # Adaptive HLS player with audio & CC tracks
│   │   ├── video/ReelsFeed.tsx       # Vertical short-video feed
│   │   └── modals/FirebaseSetupModal.tsx # Setup helper modal
│   ├── pages/
│   │   ├── HomePage.tsx          # Homepage shelves & carousels
│   │   ├── CatalogPage.tsx       # Anime, Movies, Series, and Discover views
│   │   ├── ContentDetailPage.tsx # Details, seasons, episodes, and related titles
│   │   ├── SearchPage.tsx        # Gemini AI Assistant & keyword search
│   │   ├── CreatorStudioPage.tsx # Upload workflow & HLS job monitor
│   │   ├── AdminDashboardPage.tsx# Moderation, users, and audit logs
│   │   ├── WatchlistPage.tsx     # Watchlist & continue watching
│   │   ├── SettingsPage.tsx      # Themes, audio defaults, and data export
│   │   └── HelpSupportPage.tsx   # FAQ & DMCA contact
│   ├── App.tsx               # Root component with routing
│   └── main.tsx              # React DOM entry
```

---

## 🚀 Setup & Execution

### Prerequisites
- Node.js >= 18
- npm or bun

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Key variables:
- `GEMINI_API_KEY`: In Google AI Studio, injected automatically via user secrets.
- `PORT`: Set to `3000`.
- `VITE_FIREBASE_*`: Firebase project credentials from Firebase Console.

### 3. Run Development Server
```bash
npm run dev
```
Starts Express server on port 3000 with Vite middleware mounted for hot development.

### 4. Build for Production
```bash
npm run build
```

---

## 🔒 Security & Authorization (RBAC)

1. **Role Hierarchy**:
   - `Viewer`: Can stream published content, save watchlists, and like/comment on reels.
   - `Creator`: Can access Creator Studio, upload videos, and manage owned titles.
   - `Content Manager`: Can publish/unpublish any title and review moderation reports.
   - `Administrator`: Full system access, role escalation, and immutable audit logging.

2. **Security Rules (`firestore.rules` & `storage.rules`)**:
   - Firestore rules verify `request.auth.uid` ownership and enforce role checks on privileged operations.
   - Storage rules restrict raw video uploads to the creator's private path (`raw-uploads/{userId}/*`).

---

## 🎥 FFmpeg Video Transcoding Worker Specification

In production, long-running video transcoding should not execute on the main HTTP process. YEP Streamer specifies a decoupled worker contract:

```
[Client Upload] ──> [Private Cloud Storage]
                           │
                      [Cloud Pub/Sub Queue]
                           │
                 [Cloud Run FFmpeg Worker]
                           │
        ┌──────────────────┼──────────────────┐
   [1080p Rendition]  [720p Rendition]  [480p Rendition]
        └──────────────────┼──────────────────┘
                           │
                  [HLS Master Manifest]
                           │
             [Content Delivery Network (CDN)]
```

Worker Command Reference:
```bash
ffmpeg -i input.mp4 \
  -filter_complex \
  "[0:v]split=3[v1][v2][v3]; \
   [v1]scale=w=1920:h=1080[v1out]; \
   [v2]scale=w=1280:h=720[v2out]; \
   [v3]scale=w=854:h=480[v3out]" \
  -map "[v1out]" -c:v:0 libx264 -b:v:0 4500k \
  -map "[v2out]" -c:v:1 libx264 -b:v:1 2200k \
  -map "[v3out]" -c:v:2 libx264 -b:v:2 900k \
  -map a:0 -c:a aac -b:a 128k \
  -f hls -hls_time 6 -hls_playlist_type vod \
  -master_pl_name master.m3u8 \
  media/%v/index.m3u8
```
