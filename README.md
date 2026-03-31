<div align="center">

<img src="https://img.shields.io/badge/Textalk-1.0.0-1D9E75?style=for-the-badge&labelColor=0D1117" alt="Textalk" />

# Textalk

**A privacy-first social media and messenger app — free, fast, and open source.**

[![React](https://img.shields.io/badge/React_18-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![Firebase](https://img.shields.io/badge/Firebase_10-FFCA28?style=flat&logo=firebase&logoColor=black)](https://firebase.google.com)
[![Vite](https://img.shields.io/badge/Vite_5-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind_3-38BDF8?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-1D9E75?style=flat)](LICENSE)

[Live Demo](https://txtalk.netlify.app) · [Report a Bug](../../issues) · [Request a Feature](../../issues)

</div>

---

## What is Textalk?

Textalk is a full-stack social platform built with React and Firebase. It combines a real-time public feed with private direct messaging, friend requests, customisable profiles, and media sharing — all in a dark, minimal interface with no ads and no tracking.

Built as a personal project to explore real-time databases, Firebase Auth, and modern React patterns.

---

## Features

### Social Feed
- Post text, photos, and videos (Reels-style) to a public feed
- Real-time updates — new posts appear instantly for all users
- Like posts across accounts with live like counts
- Tap to expand images fullscreen; videos play inline with loop

### Direct Messaging
- Live 1-to-1 chat powered by Firebase Realtime Database
- Send GIFs from a built-in picker (3 tabs, trending GIFs)
- Send stickers across 3 themed packs (60+ emoji stickers)
- Messages sync instantly between accounts with no page refresh

### Friends
- Send, accept, and decline friend requests in real time
- Friend request badge in sidebar updates live
- View any user's themed profile card — shows bio, stats, and recent posts
- Remove friends with confirmation

### Profiles
- Customise display name, bio, avatar colour (9 options), and avatar emoji (12 options)
- Profile card theme adapts to your chosen avatar colour
- View your own posts and friends list in a tabbed layout
- Stats: post count, friend count, total likes received

### Security
- Email + password auth via Firebase Authentication
- Protected routes — unauthenticated users are redirected to login
- Environment variables keep all API keys out of source code
- Firestore security rules enforce per-user write permissions

### UX
- Built-in first-time tutorial with spotlight highlights
- Skeleton loaders on feed, DM list, and People page
- Animated page entries, hover transitions, and like animations
- Fully dark theme with accent colour glow effects

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite 5 |
| Styling | Tailwind CSS 3 |
| Auth | Firebase Authentication |
| Feed & Profiles | Firestore |
| Live Chat | Firebase Realtime Database |
| Media Uploads | Cloudinary (free tier) |
| Routing | React Router v6 |
| Hosting | Vercel / Netlify (free) |

---

## Getting Started

### Prerequisites
- Node.js 18+
- A free [Firebase](https://firebase.google.com) account
- A free [Cloudinary](https://cloudinary.com) account (for photo/video posts)

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/textalk.git
cd textalk
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com) → Create project → **textalk**
2. Enable **Authentication** → Sign-in method → Email/Password → Enable
3. Create **Firestore Database** → Start in test mode
4. Create **Realtime Database** → Start in test mode
5. Go to Project Settings → Your Apps → Add Web App → copy the config

### 4. Set up Cloudinary (for photo/video posts)

1. Sign up free at [cloudinary.com](https://cloudinary.com)
2. Dashboard → Settings → Upload → Add upload preset → set to **Unsigned** → Save
3. Copy your **Cloud Name** and **Upload Preset** name

### 5. Configure environment variables

```bash
cp .env.example .env
```

Fill in your `.env` file:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_DATABASE_URL=...

VITE_CLOUDINARY_CLOUD_NAME=...
VITE_CLOUDINARY_UPLOAD_PRESET=...
```

### 6. Set Firestore security rules

In Firebase Console → Firestore → Rules, paste:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /posts/{postId} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null;
      allow delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /friendRequests/{reqId} {
      allow read, create, update, delete: if request.auth != null;
    }
  }
}
```

### 7. Set Realtime Database rules

```json
{
  "rules": {
    "chats": {
      "$chatId": {
        "messages": {
          ".read": "auth != null",
          ".write": "auth != null"
        }
      }
    }
  }
}
```

### 8. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Project Structure

```
textalk/
├── src/
│   ├── firebase/
│   │   ├── config.js          # Firebase initialisation
│   │   ├── auth.js            # Register, login, logout
│   │   ├── firestore.js       # Posts and feed
│   │   ├── realtime.js        # Live chat messages
│   │   ├── friends.js         # Friend requests and friendships
│   │   ├── userProfile.js     # Profile updates
│   │   └── cloudinary.js      # Media uploads
│   ├── components/
│   │   ├── feed/              # Feed, PostCard, MediaComposer
│   │   ├── chat/              # ChatWindow, MediaPicker, Stickers
│   │   ├── profile/           # EditProfileModal, ProfileCard
│   │   ├── friends/           # FriendList, FriendRequests
│   │   └── layout/            # Sidebar, PrivateRoute, Tutorial
│   ├── pages/                 # Home, Messages, People, Profile, Login, Register
│   ├── context/
│   │   └── AuthContext.jsx    # Global auth state
│   ├── hooks/                 # useAuth, useMessages
│   ├── App.jsx                # Routing
│   └── main.jsx               # Entry point
├── .env.example               # Environment variable template
├── FIRESTORE_RULES.md         # Copy-paste security rules
└── README.md
```

---

## Deployment

**Vercel (recommended)**
```bash
npm run build
# Push to GitHub, connect repo at vercel.com → one-click deploy
# Add all .env variables in Vercel → Settings → Environment Variables
# Add your Vercel domain to Firebase → Authentication → Authorized Domains
```

**Netlify**
```bash
npm run build
# Drag the dist/ folder to netlify.com/drop
# Or connect repo for automatic deploys
# Add .env variables in Netlify → Site configuration → Environment variables
```

---

## Roadmap

- [x] Phase 1 — Project setup and Firebase integration
- [x] Phase 2 — Auth, feed, and live chat
- [x] Phase 3 — Profile customisation and friend requests
- [x] Phase 4 — Viewable profiles, themed profile cards, people discovery
- [x] Phase 5 — Media posts (photos and videos), GIFs and stickers in DMs
- [ ] Phase 6 — Push notifications
- [ ] Phase 7 — Post comments
- [ ] Phase 8 — Story / 24h disappearing posts
- [ ] Phase 9 — Shop/Economy system

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

---

## License

[MIT](LICENSE) © 2026 Textalk
