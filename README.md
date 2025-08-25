# Displayr

A modern movie and TV show recommendation engine and TMDB search wrapper built with GSAP, React (Next.js), TypeScript, and Tailwind CSS.

## 🌟 Features

- **Trending Discovery:** Instantly view trending movies and TV shows via the TMDB API.
- **Powerful Search:** Search and explore details across both movies and TV shows in a single interface.
- **Genre & Filter:** Sort and filter content by popular genres.
- **Detailed Info:** Get cast, crew, trailer links, summaries, and more.
- **Animation-Driven UI:** Enjoy smooth transitions, gallery effects, and modals powered by GSAP.
- **Responsive Design:** Fully mobile-ready and desktop-responsive, styled with Tailwind CSS.
- **Multiple Deployments:** [displayr.vercel.app](https://displayr.vercel.app) (latest) and [displayr-fc42c.web.app](https://displayr-fc42c.web.app/) (legacy).

## 🚀 Tech Stack

- **Frontend:** React (Next.js), TypeScript
- **UI/Styling:** Tailwind CSS, GSAP animations
- **APIs/Data:** The Movie Database (TMDB) API
- **Other:** Deployed on Vercel and Firebase

## 📦 Project Structure
- /app
- /config # TMDB constants and API keys
- /movie/[slug] # Dynamic routing for movies
- /tv/[slug] # Dynamic routing for TV shows
- /search # Search page logic
- /utils # TMDB API interfaces and fetchers
- layout.tsx # Layout logic
- page.tsx # Home/trending logic
- types.ts # Typed movie and TV show interfaces
- /components
- MovieGallery.tsx # Displays main animated movie gallery
- SideMenu.tsx # Side navigation and search


## 🛠 Major Components

- **MovieGallery:** The animated carousel displaying trending and filtered results, fetching details, trailers, cast/crew live from TMDB.
- **SideMenu:** Slide-out navigation for quick switching between discovery, search, and more.
- **GSAP Animations:** Drives all UI transitions and dynamic content.
- **API Interface:** All TMDB data fetching (trending, search, movies, TV-shows, genre) is modularized in `/utils/api.ts`.

## 🌐 Deployments

| Version        | URL                                                   |
|----------------|-------------------------------------------------------|
| Latest (Vercel)| https://displayr.vercel.app/                          |
| Legacy (Firebase) | https://displayr-fc42c.web.app/                   |

## 📄 Setup & Development

1. Clone the repository:
    ```
    git clone https://github.com/Vinitj088/Displayr.git
    cd Displayr
    ```
2. Install dependencies:
    ```
    npm install
    ```
3. Add a `.env.local` with your TMDB API key:
    ```
    NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_key_here
    ```
4. Start the development server:
    ```
    npm run dev
    ```
5. Open [http://localhost:3000](http://localhost:3000) and enjoy!

## 📝 License

This project is licensed under the ISC License.

---

_Developed by Vinit Jain. Powered by [TMDB](https://www.themoviedb.org/)._

