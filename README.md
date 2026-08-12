# 🎵 AKOUSTIX

> **Where Every Song Feels Like a Memory.**

AKOUSTIX is a nostalgia-inspired music player that transforms digital listening into an immersive retro experience.

Instead of presenting music through a conventional modern streaming interface, AKOUSTIX lets users experience their music through different eras of music technology — **Cassette, CD/Gramophone, and Classic Computer**.

The goal is simple: make digital music feel more personal, tactile, and memorable.

---

## ✨ Features

* 🎵 Music playback using a connected music library
* 📼 **Cassette Era** — vintage cassette-player inspired experience
* 💿 **CD / Gramophone Era** — physical-media inspired playback experience
* 🖥️ **Computer Era** — classic computer-inspired music interface
* 🎨 Album artwork integrated into the listening experience
* 🔀 Shuffle and Repeat
* 📋 Up Next / Queue
* 🧠 **Memory Feature**

  * Create a personal Memory for a song
  * Add up to 5 photos from your device
  * Add an optional short note
  * Add an optional date and time
  * Save the Memory for later
  * Edit an existing Memory
  * View the Memory as an immersive slideshow
  * Photos use subtle transitions and slow-zoom effects
  * Music continues playing while the Memory slideshow is displayed
* 📱 Responsive interface
* 🌐 Progressive Web App (PWA)
* ☁️ Supabase integration
* 🚀 Vercel deployment

---

## 💡 Inspiration

Modern music applications are designed around speed, convenience, recommendations, and endless scrolling.

AKOUSTIX explores a different idea:

> **What if digital music could feel like using the music players we grew up with?**

The application transforms a digital music library into a collection of nostalgic listening experiences inspired by physical media and classic music devices.

Each Era provides a different way to experience the same music.

---

## 🎧 The Three Eras

### 📼 Cassette Era

A vintage cassette-player inspired interface designed around the feeling of physical cassette hardware.

The cassette, reels, controls, and visual elements are designed to make playback feel more tactile instead of looking like a conventional streaming application.

### 💿 CD / Gramophone Era

A physical-media inspired interface featuring a rotating CD/record-style experience and gramophone-inspired visual mechanics.

Album artwork is integrated into the playback experience to make the currently playing music feel more like a physical record.

### 🖥️ Computer Era

A classic computer-inspired music interface representing the transition from physical music players to early digital music experiences.

This Era intentionally provides a more conventional digital interface compared with the physical-media inspired Cassette and CD Eras.

---

## 🧠 Memory

The Memory feature connects music with the user's own experiences.

A song can have a personal Memory containing:

* Up to 5 photos
* An optional note of up to 10 words
* An optional date
* An optional time

When a Memory exists, it can be opened directly from the song.

The Memory is presented as an immersive slideshow where photos transition with a subtle slow-zoom effect while the music continues playing.

Saved Memories can also be edited later.

---

## 🛠️ Tech Stack

* TypeScript
* JavaScript
* HTML
* CSS
* React
* Vite
* Supabase
* Vercel

---

## ⚙️ Installation

### Clone the repository

```bash
git clone https://github.com/itachi95822/AKOUSTIX-PWA.git
cd AKOUSTIX-PWA
npm install
```

### Configure environment variables

Create a `.env` file containing the required Supabase environment variables:

```env
VITE_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

**Never upload your real `.env` file or private API keys to GitHub.**

### Run locally

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

---

## ☁️ Supabase

AKOUSTIX uses Supabase for its music library, database, and media storage.

### Database Security

The `songs` table has **Row Level Security (RLS)** enabled.

The application only requires users to **read** music-library information, so the database is configured with a read-only `SELECT` policy for the public/client role.

Users are not given permission through the application to:

* Insert songs
* Update songs
* Delete songs
* Modify database records

This keeps the music-library database protected from unauthorized write operations while still allowing the application to load songs.

### Storage

The required storage bucket is configured for **public read access** because the application needs to load music and artwork directly from the frontend.

Public access is intentionally used for media files that the application needs to serve to users. Database security is handled separately through **Row Level Security (RLS)**.

### Environment Variables

The frontend uses the Supabase project URL and publishable/anonymous client key:

```env
VITE_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

The publishable/anonymous key is intended for client-side use when the Supabase project is correctly secured with RLS and appropriate storage policies.

**Never expose or commit a Supabase `service_role` key, database password, or other private credentials.**

For production, verify that:

* RLS is enabled on the required database tables.
* Only the necessary `SELECT` access is granted to the public/client role.
* Unnecessary `INSERT`, `UPDATE`, and `DELETE` access is not granted.
* Public storage access is enabled only for buckets intentionally meant to serve files publicly.
* Private credentials remain in environment variables and are never committed to GitHub.

---

## 🚀 Deployment

AKOUSTIX is designed to be deployed using Vercel.

Configure the required environment variables in the Vercel project before deployment.

Required variables:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

---

## 👥 Team

### Leader

**Manthan**

### Team Members

* **Tanya Nailwal**
* **Koustubh Vatsa**
* **Divya Sharma**

---

## 🤖 AI Tools Used

AI tools were used during different parts of the development process, including brainstorming, UI refinement, debugging, documentation, branding, and development assistance.

Tools used:

* ChatGPT
* Tempo AI
* Google Gemini
* Canva

---

## 🎵 Assets

### Music

Music used in the prototype was sourced from **Pixabay**.

### Cover Art

Cover artwork used in the prototype was generated using **Google Gemini**.

Third-party assets remain subject to their respective licenses and terms of use.

---

## 📧 Contact

For feedback or suggestions:

**Email:** [itachigamer95822@gmail.com](mailto:itachigamer95822@gmail.com)

---

## 📌 Project Status

AKOUSTIX is a **hackathon prototype** created to explore a nostalgia-focused approach to digital music listening.

The project focuses on transforming digital music into a more personal and immersive experience through nostalgic interfaces and the Memory feature.

Some ideas may be expanded in future versions.

---

## 🙏 Acknowledgements

Special thanks to:

* Pixabay for music assets
* Supabase for backend and storage infrastructure
* Vercel for deployment
* React, Vite, and TypeScript communities
* Everyone who provided feedback and ideas during development

---

# 🎶 AKOUSTIX

### Where Every Song Feels Like a Memory.
