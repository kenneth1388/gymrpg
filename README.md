# GymRPG PWA ⚔️

React Progressive Web App — installs to iPhone home screen via Vercel.

## Deploy to Vercel (one-time, ~10 minutes)

### 1. Push to GitHub

```bash
cd GymRPG-PWA
git init
git add .
git commit -m "Initial commit"
# Create a new repo on github.com called 'gymrpg', then:
git remote add origin https://github.com/YOUR_USERNAME/gymrpg.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → Sign in with GitHub
2. Click **Add New → Project**
3. Import your `gymrpg` repo
4. Framework preset: **Create React App** (auto-detected)
5. Click **Deploy** — done in ~2 minutes

Your app is live at `gymrpg.vercel.app` (or similar).

### 3. Install on iPhone (one and done)

1. Open Safari on your iPhone
2. Go to your Vercel URL
3. Tap the **Share** button (box with arrow) → **Add to Home Screen**
4. Tap **Add**

App icon appears on your home screen. Opens full screen, no browser bar, works offline.

---

## Local dev

```bash
npm install
npm start
# Opens at localhost:3000
```

---

## Features

- Dashboard with XP, level, streak, decay warnings
- Quick-log (10 exercises, 3 sets, rep ranges shown)
- Session summary with XP animation, PRs, badges
- Stats: radar chart, difficulty donut, XP bar chart, sparklines, records, badges
- Export to JSON (share sheet on iOS, download on desktop)
- Works fully offline after first load

## XP Decay

-200 XP every 3 days missed · scaled by last session intensity · de-levelling on
