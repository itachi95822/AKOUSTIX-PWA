# 🎵 AKOUSTIX

> **Where Every Song Feels Like a Memory.**

AKOUSTIX is a nostalgia-inspired Progressive Web App (PWA) that transforms modern music streaming into an immersive retro experience. Instead of simply listening to music, users relive different eras through beautifully designed playback interfaces inspired by iconic music devices like Cassette Players, CD Players, and Classic Computers.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Ready-blue)
![Status](https://img.shields.io/badge/Status-Completed-success)

---

# 🌟 Inspiration

Modern music applications prioritize convenience but often lose the emotional connection people once had with physical music players.

AKOUSTIX brings that feeling back by combining modern streaming technology with nostalgic interfaces, allowing users to experience music through interactive retro playback devices.

---

# ✨ Features

- 🎵 Stream music using Supabase Storage
- 💽 Three immersive playback themes
  - Cassette Player
  - CD Player
  - Classic Computer
- 🎨 Dynamic album artwork
- ⏯️ Play, Pause, Next & Previous controls
- 🔀 Shuffle & Repeat
- 📋 Music Queue
- 📱 Responsive Design
- 🌐 Progressive Web App (PWA)
- ☁️ Supabase-powered backend

---

# 🛠 Tech Stack

- TypeScript
- JavaScript
- HTML5
- CSS3
- React
- Vite
- Supabase
- Vercel

---

# 📂 Project Structure

```text
AKOUSTIX-PWA
│
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   ├── styles/
│   └── utils/
│
├── supabase/
├── package.json
└── README.md
```

---

# 📸 Screenshots

> *(Screenshots will be added here before the final submission.)*

- Home Screen
- Cassette Player
- CD Player
- Computer Theme
- Music Library

---

# ⚙️ Installation

### Clone the repository

```bash
git clone https://github.com/itachi95822/AKOUSTIX-PWA.git
```

### Move into the project

```bash
cd AKOUSTIX-PWA
```

### Install dependencies

```bash
npm install
```

### Create a `.env` file

```env
VITE_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

> **Do not upload your real `.env` file to GitHub.**

### Start the development server

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

# ☁️ Supabase Setup

### Storage Bucket

Create a public storage bucket named:

```text
music
```

### Songs Table

Suggested columns:

| Column | Type |
|---------|------|
| id | uuid |
| title | text |
| artist | text |
| album | text |
| genre | text |
| duration | text |
| music_url | text |
| cover_url | text |

Enable:

- Row Level Security (RLS)
- Read-only policy for the `songs` table
- Public read access for the `music` storage bucket

---

# 🚀 Deployment

AKOUSTIX is designed to be deployed on **Vercel**.

Build the project using:

```bash
npm run build
```

Configure these environment variables inside Vercel:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

---

# 👥 Team

**Leader**
- Manthan

**Members**
- Koustubh Vatsa
- Tanya Nailwal
- Divya Sharma

---

# 🤖 AI Tools Used

The following AI tools assisted during the development process:

- ChatGPT
- Tempo AI
- Google Gemini
- Canva (branding and logo design)

These tools were used for brainstorming, UI refinement, debugging, documentation, logo design, and development assistance.

---

# 🎵 Assets

### Music

Royalty-free music sourced from **Pixabay**.

### Cover Art

Album artwork generated using **Google Gemini**.

All assets remain subject to their original licenses and terms of use.

---

# 📧 Contact

For feedback or suggestions:

**Email:** itachigamer95822@gmail.com

---

# 📄 License

This project was developed as a hackathon prototype for educational and demonstration purposes.

---

# 🙏 Acknowledgements

Special thanks to:

- Pixabay for royalty-free music.
- Supabase for backend and storage.
- Vercel for deployment.
- The React, Vite, and TypeScript communities.
- Everyone who contributed ideas, testing, and feedback throughout the development process.

---

<div align="center">

## 🎶 AKOUSTIX

### *Where Every Song Feels Like a Memory.*

</div>
