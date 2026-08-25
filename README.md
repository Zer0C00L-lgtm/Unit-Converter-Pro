# Unit Converter

A modern, high-precision bidirectional kilometer (km) and mile (mi) conversion application built with Next.js 15, React 19, TypeScript, and Tailwind CSS v4.

---

## Features

- **Bidirectional Conversion**: Instant real-time conversion between Kilometers and Miles using exact international standard factors ($1\text{ mi} = 1.609344\text{ km}$).
- **Configurable Precision**: Toggle between 2, 4, 6 decimal places, or full floating-point exactness.
- **Official Athletic & Scale Milestones**: Automated benchmark detection for 5K, 10K, Half Marathon, Full Marathon, 100K Ultramarathon, 100-Mile Century, and planetary scale distances.
- **Custom Distance Threshold Alerts**: Set custom threshold triggers with interactive toast notifications.
- **Interactive Distance Scale Visualizer**: Dynamic visual representation comparing input distances to real-world objects and journeys.
- **Quick Preset Selectors**: One-click distance presets for common race distances, standard speed limits, and travel benchmarks.
- **Comprehensive Conversion History**: Localized session history with search, timestamping, single-record deletion, and batch clear.
- **CSV Export**: One-click export of conversion records to CSV format.
- **Responsive Theme Support**: Optimized for both Light and Dark modes with accessibility-compliant contrast.

---

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI & Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Motion](https://motion.dev/)
- **Linting**: ESLint with `eslint-config-next`

---

## Getting Started

### Prerequisites

- **Node.js**: v20.x or higher
- **npm**, **pnpm**, or **yarn**

### Installation

1. Clone or download the repository:
   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Development Server

Start the local development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server on `http://localhost:3000` |
| `npm run build` | Compiles the production bundle |
| `npm run start` | Starts the production server |
| `npm run lint` | Runs ESLint syntax and code quality checks |
| `npm run clean` | Cleans Next.js build cache |

---

## Project Structure

```
├── app/
│   ├── globals.css          # Global styles & Tailwind v4 imports
│   ├── layout.tsx           # Root layout and theme providers
│   └── page.tsx             # Main converter page
├── components/
│   ├── ConverterCard.tsx    # Core converter input, controls, & live evaluation
│   ├── DistanceScaleVisualizer.tsx # Visual distance comparison bar
│   ├── HistoryLog.tsx       # Conversion records list, filter, & CSV export
│   ├── QuickPresets.tsx     # Common athletic and transit presets
│   ├── Toast.tsx            # Alert and milestone toast notifications
│   └── ThemeToggle.tsx      # Dark / Light mode toggle switch
├── context/
│   ├── AuthContext.tsx      # User session management context
│   └── HistoryContext.tsx   # Conversion persistence and history context
├── lib/
│   ├── converter.ts         # Exact math calculations and validation logic
│   └── thresholds.ts        # Milestone definitions and alert evaluators
├── types/
│   └── converter.ts         # TypeScript data structures and interfaces
├── metadata.json            # Application metadata
├── package.json             # Project dependencies and scripts
└── tsconfig.json            # TypeScript configuration
```

---

## Deployment

### Vercel (Recommended)
1. Push your code to a GitHub/GitLab repository.
2. Import the project into [Vercel](https://vercel.com).
3. Vercel automatically detects Next.js build settings (`npm run build`, output: `.next`).
4. Click **Deploy**.

### Google Cloud Run / Container Deployment
1. Build the production application:
   ```bash
   npm run build
   ```
2. Start the server using:
   ```bash
   npm run start
   ```

---

## License

This project is open source and available under the [MIT License](LICENSE).
