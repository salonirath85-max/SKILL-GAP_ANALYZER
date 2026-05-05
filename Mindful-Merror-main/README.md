# Mindful Memory

A React-based web application built with Vite, TypeScript, and shadcn/ui for tracking and reflecting on decisions.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm (installed by default with Node.js)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd remix-of-remix-of-remix-of-mindful-memory-main
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the App

- **Development Mode**: Start the development server with hot-module replacement.
  ```bash
  npm run dev
  ```
  The app will be available at `http://localhost:8080`.

- **Build**: Create a production-ready bundle in the `dist` directory.
  ```bash
  npm run build
  ```

- **Preview**: Preview the production build locally.
  ```bash
  npm run preview
  ```

- **Lint**: Run ESLint to check for code quality issues.
  ```bash
  npm run lint
  ```

## 📂 Project Structure (Skeleton)

```text
.
├── public/                 # Static assets
├── src/
│   ├── components/         # UI components (shadcn/ui and custom)
│   │   ├── ui/             # shadcn/ui base components
│   │   └── ...             # Feature-specific components
│   ├── data/               # Static data or sample data
│   ├── hooks/              # Custom React hooks
│   ├── integrations/       # External service integrations (e.g., Supabase)
│   ├── lib/                # Utility functions and shared logic
│   ├── pages/              # Application pages (React Router routes)
│   ├── store/              # State management (Zustand)
│   ├── types/              # TypeScript type definitions
│   ├── App.tsx             # Main App component with routing
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles and Tailwind imports
├── supabase/               # Supabase configuration and edge functions
├── index.html              # HTML template
├── package.json            # Project dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
└── tailwind.config.ts      # Tailwind CSS configuration
```

## 🛠️ Tech Stack

- **Framework**: [React 18](https://reactjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Routing**: [React Router 6](https://reactrouter.com/)
- **Backend/DB**: [Supabase](https://supabase.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 📝 Features

- **Decision Tracking**: Add and manage decisions.
- **Reflection**: Reflect on past decisions to improve future outcomes.
- **AI Integration**: AI-powered chat and insights (via Supabase Edge Functions).
- **Responsive Design**: Works on mobile and desktop.

---
*This project was cleaned of Bun and Lovable-specific taggers/references.*
# Mindful-merror-
