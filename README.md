# Film Atlas 🎬🌎

**Film Atlas** is a premium, beautifully designed movie and series tracking application. It bridges the gap between streaming ("OTT Releases") and the silver screen ("In Theaters") for diverse audiences, specializing in deep, automated support for multiple languages including English, Hindi, Malayalam, Tamil, Telugu, and Kannada.

---

## 🌟 Core Features

### 📡 Statically Generated Backend (Zero-Latency)
Instead of forcing the client to constantly hit rate-limited APIs, Film Atlas uses a robust static-generation script (`scripts/fetch-static.mjs`). 
- **Automated Data Fetching**: Pulls all current and upcoming media from TMDB.
- **Deduplication & Intelligent Merging**: Seamlessly merges recent and upcoming releases to guarantee a full spread of titles.
- **On-Demand Updates**: Run `npm run generate-data` at any time to automatically rebuild the entire local JSON database cleanly within `src/data/`.

### 🎭 OTT & Theatrical Split
Easily toggle between **"OTT Releases"** (Streaming) and **"In Theaters"**. 
- The data engine explicitly inspects release date arrays to verify authentic theatrical premiere data vs. digital drops.

### 📅 Advanced Time Filtering
- **Current Month**: Instantly filter for media released roughly within the last 30 days.
- **Upcoming**: Filter for media hitting screens over the next 30 days.
- **Custom Dates**: Use the native calendar inputs to select specific release windows.

### 🎥 Native Trailer Integration & Smart Fallbacks
- Every movie and series card indicates if a trailer is available via a clean, interactive hover state.
- **TMDB + YouTube Parsing**: Automatically identifies official trailers using TMDB's `append_to_response=videos`.
- **Advanced `yt-search` Fallback**: If TMDB lacks an official trailer (common for regional and upcoming media), the data-engine intelligently scrapes YouTube for the exact movie title, language, and year to guarantee a fallback trailer.
- **Cinematic Modal**: Click any card to launch an immersive, responsive modal overlay to watch the trailer via a distraction-free embedded YouTube player.

### 🔍 Instant Client-Side Search
- A sleek, seamlessly integrated search bar built into the main header.
- Filters in real-time with zero latency.
- Deep searching: Matches your queries against both titles *and* film synopses.

### 🌍 Multi-Language & Multi-Platform Support
- **Robust Checkbox Filters**: Select or deselect specific languages (Malayalam, Tamil, Telugu, Kannada, Hindi, English).
- **Dynamic Action Button**: The language filter header features an intelligent "Clear All" / "Select All" toggle for ultimate user convenience.
- **Streaming Platforms Check**: Visually distinguishes where a title is streaming (Netflix, Prime Video, Disney+ Hotstar, SonyLIV, ZEE5, Aha, JioCinema) directly on the movie cards.

### 🎨 Premium UI/UX Design
- Built on a highly-optimized, modern React + Tailwind CSS stack.
- Utilizes `lucide-react` for crisp iconography.
- Animated with `motion/react` for buttery-smooth modal transitions and layout shifts.
- The UI embraces a "dark luxury" aesthetic, utilizing deep slate backgrounds, high-contrast text, mathematical padding, and a visually striking custom SVG favicon.

---

## 🛠️ Tech Stack & Architecture

- **Frontend Framework**: React (Vite)
- **Styling**: Tailwind CSS
- **Animations**: Motion (Framer Motion)
- **Data Hydration**: Custom Node.js JSON Scraper (`node-fetch`, `yt-search`)
- **Icons**: Lucide React
- **Deployment Build**: Optimized static file delivery (Netlify / Vercel ready)

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Environment Variable**
   Ensure your `.env` contains your TMDB API read access token:
   ```env
   API_READ_ACCESS_TOKEN="your_tmdb_token_here"
   ```

3. **Generate Static Data**
   Fetch the latest releases and trailers directly into your app:
   ```bash
   npm run generate-data
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Build for Production**
   ```bash
   npm run build
   ```
