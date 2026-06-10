# 🎓 Deutsch B1 Practice App

A full-stack web application for practicing the **telc Deutsch B1 exam**. Built with modern web technologies, offering interactive exercises, session tracking, scoring, and comprehensive review features.

**Live Demo**: http://localhost:3000 (after running locally)

---

## 📋 Table of Contents

- [Features](#features)
- [Design Decisions](#design-decisions)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development Guide](#development-guide)
- [Database Schema](#database-schema)
- [Routes](#routes)

---

## ✨ Features

### 1. **Interactive Exercise System** (7 Types)
- **Matching Exercises**: Dropdown selection to match items
- **Multiple Choice**: Radio button selection with instant feedback
- **True/False**: With audio transcript context
- **Cloze Multiple Choice**: Fill blanks with options
- **Cloze Word Bank**: Fill blanks using provided words
- **Writing Task**: Text area with word count tracking
- **Speaking Task**: Note-taking with self-assessment checklist

### 2. **Session Management**
- Auto-create sessions on test start
- Auto-save answers during practice
- Track session status (in-progress/completed)
- Store completion timestamps

### 3. **Scoring & Results**
- Calculate scores by section (Reading, Sprachbausteine, Listening)
- Total score out of 180 points
- Pass/fail determination (120+ = pass)
- Breakdown by section with visual progress bars

### 4. **User Features**
- 🌙 Dark/light theme toggle
- 🔊 TTS voice selection (German voices)
- ⏱️ Exam timer (180 minutes, start/pause/reset)
- 📝 Note-taking with tags
- 📊 Session history and analytics
- ⚙️ Customizable preferences

### 5. **Responsive Design**
- Desktop sidebar navigation
- Mobile bottom tab bar
- Fully responsive layouts
- Touch-friendly interfaces

---

## 🏗️ Design Decisions

### 1. **Framework Choice: Next.js 16 (App Router)**
- **Why**: Modern React with built-in routing, server components, and static generation
- **Benefits**:
  - Fast development with hot reload
  - Pre-rendered static pages for performance
  - Built-in API routes (future expansion)
  - TypeScript support out-of-the-box

### 2. **Database: Dexie.js (IndexedDB)**
- **Why**: Client-side persistence without backend server
- **Benefits**:
  - No need for backend infrastructure
  - Works offline
  - Automatic data persistence
  - Simple CRUD operations
  - Sufficient for practice app scope
- **Data**: Sessions, notes, user settings

### 3. **Styling: Tailwind CSS**
- **Why**: Utility-first CSS framework
- **Benefits**:
  - Rapid UI development
  - Consistent design system
  - Dark mode support built-in
  - Small bundle size
  - No style conflicts

### 4. **Component Architecture**
- **Server Components** for static pages with file I/O
- **Client Components** for interactive features (exercises, forms)
- **Clear Boundary**: Server loads tests, client handles UI state
- **Separation of Concerns**: Exercise logic isolated in dedicated components

### 5. **State Management**
- React hooks for local component state
- No Redux/Zustand needed (simple app)
- Database queries in custom hooks
- SearchParams for URL-based state (review page)

### 6. **Testing: Jest**
- Test scoring logic thoroughly
- Verify calculation correctness
- Ensure pass/fail logic works

### 7. **Async Params (Next.js 16)**
- All dynamic routes properly await `params` Promise
- Handles new Next.js 16 API requirements
- Type-safe with TypeScript

---

## 📐 Architecture

### High-Level Flow

```
Dashboard (Test Selection)
    ↓
Test Overview (Section Preview)
    ↓
Exercise View (Interactive Practice)
    ↓
Review Page (Score Breakdown)
    ↓
Sessions/Notes/Settings (Utility Pages)
```

### Component Hierarchy

```
App
├── Layout (Nav, Theme, Auth)
├── Dashboard
│   └── Test List + Stats
├── Test Overview
│   └── Section Details
├── Exercise View
│   ├── Timer Display
│   ├── Progress Bar
│   ├── Exercise Component (Dynamic)
│   │   ├── MatchingExercise
│   │   ├── MultipleChoiceExercise
│   │   ├── TrueFalseExercise
│   │   ├── ClozeMCExercise
│   │   ├── ClozeWordbankExercise
│   │   ├── WritingTask
│   │   └── SpeakingTask
│   ├── Navigation (Prev/Next/Submit)
│   └── Session Panel (Notes)
├── Review Page
│   ├── Score Breakdown
│   └── Review Summary
└── Utility Pages
    ├── Sessions History
    ├── Notes Library
    └── Settings
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 | UI framework |
| **Framework** | Next.js 16 | Full-stack React framework |
| **Language** | TypeScript | Type safety |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Database** | Dexie.js | IndexedDB wrapper |
| **Testing** | Jest | Unit testing |
| **Build** | Turbopack | Fast bundler |
| **Fonts** | Google Fonts | Typography |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout + theme
│   ├── page.tsx                # Dashboard (Server)
│   ├── globals.css             # Global styles
│   ├── sessions/page.tsx       # Session history (Client)
│   ├── notes/page.tsx          # Notes library (Client)
│   ├── settings/page.tsx       # Settings page (Client)
│   └── test/[id]/
│       ├── page.tsx            # Test overview (Server)
│       ├── exercise/
│       │   ├── page.tsx        # Exercise orchestrator (Server)
│       │   └── ExerciseViewClient.tsx  # Exercise logic (Client)
│       └── review/
│           ├── page.tsx        # Review page (Server)
│           └── ReviewClient.tsx # Review logic (Client)
├── components/
│   ├── layout/
│   │   ├── Nav.tsx            # Sidebar + mobile nav
│   │   └── ThemeProvider.tsx   # Dark/light theme
│   ├── exercise/              # 7 exercise components
│   │   ├── MatchingExercise.tsx
│   │   ├── MultipleChoiceExercise.tsx
│   │   ├── TrueFalseExercise.tsx
│   │   ├── ClozeMCExercise.tsx
│   │   ├── ClozeWordbankExercise.tsx
│   │   ├── WritingTask.tsx
│   │   ├── SpeakingTask.tsx
│   │   └── index.ts
│   ├── review/
│   │   ├── ScoreBreakdown.tsx
│   │   ├── ReviewSummary.tsx
│   │   └── index.ts
│   └── shared/
│       ├── TimerDisplay.tsx
│       └── SessionPanel.tsx
├── hooks/
│   ├── useSettings.ts         # Theme + TTS preferences
│   ├── useTimer.ts            # Exam timer logic
│   ├── useSession.ts          # Session state management
│   └── useNotes.ts            # Note CRUD operations
├── lib/
│   ├── types.ts               # All TypeScript interfaces
│   ├── constants.ts           # UI strings, metadata
│   ├── tests.ts               # Test file loader
│   ├── scoring.ts             # Score calculation (with tests)
│   ├── tts.ts                 # Text-to-speech wrapper
│   └── db/
│       └── index.ts           # Dexie schema & initialization
└── __tests__/
    └── scoring.test.ts        # Jest tests for scoring
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repo
git clone git@github.com:sudipidus/deutsch-tests.git
cd deutsch-tests

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
# Create optimized build
npm run build

# Start production server
npm start
```

### Run Tests

```bash
npm test
```

---

## 📖 Development Guide

### Adding a New Exercise Type

1. **Create component** in `src/components/exercise/NewExercise.tsx`
2. **Export from index** in `src/components/exercise/index.ts`
3. **Update type** in `src/lib/types.ts`
4. **Add to router** in `ExerciseViewClient.tsx` render function
5. **Add test data** in `content/tests/*.json`

### Adding a New Route

1. **Create folder** in `src/app/path/`
2. **Add page.tsx** (Server) or wrap with Client component
3. **Await params** if using dynamic routing (`[id]`)
4. **Export generateStaticParams** for pre-rendering

### Modifying Scoring Logic

1. **Update algorithm** in `src/lib/scoring.ts`
2. **Add/update tests** in `__tests__/scoring.test.ts`
3. **Run tests**: `npm test`
4. **Update points** in `src/lib/constants.ts`

### Styling Components

- Use **Tailwind classes** for all styling
- Follow existing patterns (spacing, colors, borders)
- Dark mode: Prefix with `dark:` (e.g., `dark:bg-gray-900`)
- Mobile-first: Use `md:` for desktop breakpoints

---

## 💾 Database Schema

### Sessions Table
```typescript
interface Session {
  id?: number;                    // Auto-increment
  testId: string;                 // Reference to test
  mode: "exam" | "practice";      // Test mode
  startedAt: Date;                // Test start time
  lastActivityAt: Date;           // Last update time
  completedAt: Date | null;       // Completion time
  status: "in-progress" | "completed";
  sections: SessionSections;      // Nested answer state
  timeSpent: Record<SectionBlock, number>;
}
```

### Notes Table
```typescript
interface Note {
  id?: number;
  sessionId: number | null;
  testId: string | null;
  section: string | null;
  part: string | null;
  questionIndex: number | null;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Settings Table
```typescript
interface Settings {
  id?: number;
  ttsVoice: string;              // German voice selection
  ttsSpeed: number;              // 0.5 - 2.0x
  timerEnabled: boolean;
  theme: "light" | "dark";
}
```

---

## 🗺️ Routes

| Route | Type | Purpose |
|-------|------|---------|
| `/` | SSG | Dashboard with test selection |
| `/test/[id]` | SSG | Test overview with section breakdown |
| `/test/[id]/exercise` | SSG | Interactive exercise flow |
| `/test/[id]/review` | Dynamic | Results and score breakdown |
| `/sessions` | Client | Session history and analytics |
| `/notes` | Client | Note management interface |
| `/settings` | Client | User preferences |

**SSG** = Static Site Generation (pre-built at build time)
**Dynamic** = Server-rendered per request

---

## 🔄 Data Flow

### Starting a Test
```
Dashboard → Click Test → Test Overview → Click "Start Test"
  ↓
Create Session in IndexedDB
  ↓
Navigate to Exercise View
  ↓
Load Test Data + Initialize Component
```

### During Exercise
```
Component renders → User answers → onAnswerChange fires
  ↓
Update local component state
  ↓
Save to Session in IndexedDB
  ↓
Navigate to next part
```

### Submitting Test
```
Click "Submit" on last part
  ↓
Mark Session as completed
  ↓
Calculate scores (scoring.ts)
  ↓
Navigate to Review Page
  ↓
Query Session from IndexedDB
  ↓
Display results
```

---

## 📊 Scoring System

### Points Breakdown
- **Reading**: 60 points (3 parts × 20)
- **Sprachbausteine**: 30 points (2 parts × 15)
- **Listening**: 30 points (3 parts × 10)
- **Total**: 120 points to pass (out of 180 max)

### Calculation Logic
```typescript
totalScore = (readingScore + sprachbausteineScore + listeningScore) / 180 * 180
isPassing = totalScore >= 120
```

---

## 🎨 Design System

### Colors
- **Primary**: Blue (#3B82F6)
- **Success**: Green (#10B981)
- **Error**: Red (#EF4444)
- **Warning**: Yellow (#F59E0B)
- **Background Light**: #F9FAFB
- **Background Dark**: #030712

### Typography
- **Font**: Inter (Google Fonts)
- **Headlines**: Bold 24-32px
- **Body**: Regular 14-16px
- **Small**: 12-13px

### Spacing
- **Grid**: 4px base unit
- **Padding**: 4, 6, 8, 12, 16, 24, 32px
- **Gap**: 8, 12, 16, 24px

---

## 🚢 Deployment

### Vercel (Recommended)
```bash
# Push to GitHub
git push origin main

# Deploy via Vercel dashboard
# Auto-deploys on push
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

---

## 📝 Future Enhancements

- [ ] User authentication (backend integration)
- [ ] API routes for persistent backend storage
- [ ] More mock tests (currently 3)
- [ ] Audio playback for listening exercises
- [ ] Export results as PDF
- [ ] Performance analytics dashboard
- [ ] Spaced repetition algorithm
- [ ] Community features (share scores)

---

## 🤝 Contributing

Contributions welcome! Please:
1. Create a feature branch
2. Commit with clear messages
3. Push and open a PR
4. Ensure tests pass

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙋 Support

For issues or questions:
1. Check existing GitHub issues
2. Review code documentation
3. Check COMPLETION.md for implementation details

---

**Built with ❤️ for German language learners**
