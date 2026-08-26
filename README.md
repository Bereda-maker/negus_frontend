# Negus Gebeya – Frontend

**Negus Gebeya** ("Negus" = King/Royal, "Gebeya" = Market in Amharic) is Ethiopia's premium online marketplace — a place to buy and sell electronics, vehicles, fashion, home goods, and more, with verified sellers, trust scores, AI‑assisted listings, live selling streams, and Chapa‑powered payments.

This repository contains the **Next.js frontend** for the Negus Gebeya platform, built with the App Router, Tailwind CSS, and React.

---

##  Production URLs

| Service | URL |
|---------|-----|
| **Frontend** | [https://negus-kappa.vercel.app](https://negus-kappa.vercel.app) |
| **Backend API** | [https://negus-gebeya-api.onrender.com](https://negus-gebeya-api.onrender.com) |
| **Health Check** | [https://negus-gebeya-api.onrender.com/api/health](https://negus-gebeya-api.onrender.com/api/health) |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js 15](https://nextjs.org) (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State Management | React Context + Hooks |
| API Client | Axios |
| Authentication | JWT (httpOnly cookie + Bearer header) |
| Real‑time Messaging | WebSocket (via Bun backend) |
| File Uploads | Cloudinary |
| Payments | Chapa |
| Localization | react-i18next |
| Hosting | [Vercel](https://vercel.com) |

---

## Features

-  **Authentication** – email/password, Google OAuth, social login
- **Marketplace** – browse, search, filter, and sort listings
-  **Create/Edit Listings** – multi‑image + video uploads, AI‑assisted description
-  **Trust & Reviews** – seller trust scores, ratings, identity verification
-  **Favorites** – save and manage favorite listings
-  **Real‑time Chat** – direct messaging between buyers and sellers
-  **Reels / Live Streams** – watch product videos and live selling streams
-  **AI Chatbot** – virtual assistant for help and questions
-  **Orders & Payments** – Chapa checkout, order tracking
-  **User Profiles** – manage profile, avatar, verification documents
-  **Admin Dashboard** – manage products, orders, reports, verifications
-  **Multi‑language** – English, Amharic, Oromo, Sidama, Wolayita, Tigrinya

---

## 🔧 Environment Variables (Production)

### Required on Vercel

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://negus-gebeya-api.onrender.com/api` |
| `NEXT_PUBLIC_WEBSOCKET_URL` | `https://negus-gebeya-api.onrender.com` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | uqfnosxp|


### Optional (for development)

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` |

---

## 📁 Project Structure

```
app/
├── (auth)/             # authentication pages (login, register, social-login)
├── (dashboard)/        # user dashboard, orders, listings
├── admin/              # admin dashboard
├── blog/               # blog listing and detail pages
├── marketplace/        # marketplace browse and search
├── product/            # product detail page
├── reels/              # video reels / live streams
├── seller/             # seller profile
├── layout.tsx          # root layout with i18n and providers
├── page.tsx            # home page
│
components/             # reusable React components
├── auth/               # login/register forms, social login
├── common/             # RequireAuth, PageLoader, etc.
├── layout/             # Navbar, Footer
├── marketplace/        # ProductGrid, FilterSidebar, ListingForm
├── ui/                 # Button, Avatar, Input, EmptyState, etc.
├── chat/               # Chat components
├── VideoUpload.tsx     # video upload component
│
hooks/                  # custom React hooks (useAuth, useDebounce, etc.)
services/               # API services (productService, authService, etc.)
types/                  # TypeScript type definitions
utils/                  # helper functions (formatter, constants, etc.)
public/                 # static assets (images, fonts)
locales/                # i18n translation files (en, am, om, sid, wal, ti)
```

---

## 🧪 Local Development

### 1. Clone the repository

```bash
git clone https://github.com/Bereda-maker/negus-gebeya-frontend.git
cd negus-gebeya-frontend
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Set up environment variables

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_WEBSOCKET_URL=http://localhost:5000
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=uqfnosxp
```

### 4. Start the development server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### 5. Build for production

```bash
npm run build
npm run start
```

---

## 🚀 Deployment (Vercel)

The frontend is deployed on **Vercel**. Every push to the `main` (or `master`) branch automatically triggers a new deployment.

1. Fork or clone this repository.
2. Connect your repository to [Vercel](https://vercel.com).
3. Add the required environment variables (see above).
4. Deploy.

---

## 🌍 Multi‑language Support

The app supports six languages:

| Code | Language |
|------|----------|
| `en` | English |
| `am` | Amharic (አማርኛ) |
| `om` | Oromo (Afaan Oromoo) |
| `sid` | Sidama (Sidaamu Afoo) |
| `wal` | Wolayita |
| `ti` | Tigrinya (ትግርኛ) |

Translation files are located in `public/locales/{lang}/translation.json`.

---

## 🔗 Key Pages

| Path | Description |
|------|-------------|
| `/` | Homepage with categories, trending products, and CTA |
| `/marketplace` | Browse all listings with filters and search |
| `/product/[id]` | Product detail page with reviews and seller info |
| `/sell` | Create a new listing |
| `/listing/[id]/edit` | Edit an existing listing |
| `/reels` | Short video feed (TikTok‑style) |
| `/dashboard` | User dashboard with listings and messages |
| `/orders` | View your orders |
| `/seller-orders` | View orders for sellers |
| `/favorites` | Saved favourite listings |
| `/profile` | User profile and verification |
| `/admin` | Admin dashboard |
| `/blog` | Blog posts |
| `/about` | About page |
| `/contact` | Contact page |

---

## 🤖 AI Chatbot

The AI assistant is available via the floating chat button (bottom‑right corner). It provides:

- Product information
- Selling tips
- Platform navigation help
- General Q&A

The chatbot requires authentication and uses the backend `/api/ai/chat` endpoint.

---

## 🐛 Recent Fixes

- **Chatbot 401 error** – replaced `axios` with the authenticated `api` service to include JWT tokens automatically.
- **CORS** – configured backend to accept requests from the Vercel frontend.
- **Google OAuth** – fixed redirect flow to use `/social-login?token=...`.

---

## 📄 License

Proprietary — Negus Gebeya. All rights reserved.

---

## 🙌 Contributors

Maintained by the Bereda Negesa.  
---

**Negus Gebeya – Ethiopia's premium marketplace, live at [negus-kappa.vercel.app](https://negus-kappa.vercel.app).**
```
