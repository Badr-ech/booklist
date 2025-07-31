# 📚 YourBookList

YourBookList is a modern web application for book lovers to organize, track, and discover books. Inspired by platforms like Goodreads and MyAnimeList, it offers a rich set of features for personal book management, social connections, and smart recommendations.

## 🚀 Features

- 📖 Personal book library with status tracking (Plan to Read, Reading, Completed)
- ⭐ Custom book ratings and reviews
- 📊 Reading goals and statistics
- 🔍 Advanced search and genre-based browsing
- 🤖 AI-powered book recommendations
- 👥 User profiles with bios and favorite genres
- 🔗 Follow system for social connections
- 📰 Book news and updates
- 🎨 Theme system and responsive design

## 🛠️ Tech Stack

- **Frontend:** Next.js 15, React 18, TypeScript
- **Styling:** Tailwind CSS, Radix UI
- **Backend:** Firebase (Auth, Firestore)
- **AI:** Google Genkit (Gemini 2.0 Flash)
- **APIs:** Google Books API

## 📂 Project Structure

- `src/app/` — Main app pages (dashboard, search, profile, etc.)
- `src/components/` — Reusable UI components
- `src/lib/` — Utilities, types, Firebase config
- `src/hooks/` — Custom React hooks
- `src/ai/` — AI/Genkit integration
- `docs/` — Blueprints and feature roadmap

## ⚡ Getting Started

1. **Clone the repo:**
   ```sh
   git clone https://github.com/Badr-ech/yourbooklist.git
   cd yourbooklist
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Set up environment variables:**
   - Add your Firebase and Google Books API keys to `.env.local`.
4. **Run the development server:**
   ```sh
   npm run dev
   ```
5. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

## 📝 Contributing

Contributions are welcome! Please see the [feature-roadmap.md](docs/feature-roadmap.md) for ideas and open issues. To contribute:

1. Fork the repo and create a new branch.
2. Make your changes and add tests if needed.
3. Submit a pull request with a clear description.

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.

---

*Happy reading and building!* 📚✨
