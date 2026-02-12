# HabitFlow - Replit Agent Guide

## Overview

HabitFlow is a habit tracking mobile application built with React Native and Expo. It allows users to create, manage, and track daily habits with features like streak counting, completion tracking, calendar views, and progress statistics. The app supports multiple habit frequencies (daily, weekdays, weekends, custom), customizable icons and colors, and provides visual analytics including charts and heatmaps. The UI is in Portuguese (Brazilian).

The project follows a full-stack architecture with an Expo/React Native frontend and an Express.js backend server, though the current implementation stores habit data locally on the device using AsyncStorage rather than in a remote database.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

- **Framework**: React Native with Expo SDK 54, using the new architecture (`newArchEnabled: true`)
- **Routing**: Expo Router with file-based routing (typed routes enabled via `experiments.typedRoutes`)
- **State Management**: React Context (`HabitsProvider` in `lib/habits-context.tsx`) for habit data, with TanStack React Query available for server state
- **Local Storage**: `@react-native-async-storage/async-storage` for persisting habits and completions on-device
- **Animations**: `react-native-reanimated` for smooth UI animations and transitions
- **UI Components**: Custom components with Ionicons, Nunito font family, and a custom theming system supporting light/dark modes
- **Keyboard Handling**: `react-native-keyboard-controller` with a compatibility wrapper for web

### Screen Structure

- **Tab Navigation** (`app/(tabs)/`): Three main tabs
  - `index.tsx` — "Hoje" (Today): Shows today's habits with completion toggles
  - `calendar.tsx` — "Calendario": Monthly calendar view with habit completion overlay
  - `stats.tsx` — "Progresso": Statistics with weekly/monthly/yearly chart views and heatmaps
- **Modal**: `habit-form.tsx` — Create/edit habit form presented as a modal

### Backend Architecture

- **Server**: Express.js v5 running on Node.js with TypeScript (compiled via `tsx` in dev, `esbuild` for production)
- **API Pattern**: Routes registered in `server/routes.ts`, prefixed with `/api`
- **Storage Layer**: Interface-based storage pattern (`IStorage` in `server/storage.ts`) currently using in-memory storage (`MemStorage`). This is designed to be swapped to a database-backed implementation.
- **CORS**: Dynamic CORS configuration supporting Replit domains and localhost for Expo web development

### Database Schema

- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` — shared between frontend and backend
- **Current Tables**: `users` table with id (UUID), username, and password
- **Validation**: Zod schemas generated via `drizzle-zod`
- **Migration Config**: `drizzle.config.ts` reads `DATABASE_URL` environment variable
- **Note**: The habits/completions data is currently stored client-side via AsyncStorage, not in the database. The database schema only has a users table as a starter template.

### Theming System

- Centralized color constants in `constants/colors.ts` with a full palette, habit-specific colors, and separate light/dark theme objects
- `useTheme` hook (`lib/useTheme.ts`) provides theme values based on system color scheme
- Supports liquid glass effect on iOS 26+ via `expo-glass-effect`

### Build and Deployment

- **Development**: Two concurrent processes — Expo dev server (`expo:dev`) and Express server (`server:dev`)
- **Production Build**: Custom build script (`scripts/build.js`) handles static web export; server built with esbuild
- **Static Serving**: Production server serves the built web app from `dist/` directory
- **Database Migrations**: `drizzle-kit push` for schema synchronization

### Key Design Decisions

1. **Local-first data storage**: Habits and completions use AsyncStorage for offline-first functionality. The server/database infrastructure exists but isn't yet connected for habit data sync.
2. **Shared schema directory**: The `shared/` folder contains types and schemas accessible to both frontend and backend via path alias `@shared/*`.
3. **Platform-adaptive UI**: Components handle iOS, Android, and Web differently (e.g., native tabs vs classic tabs, keyboard handling, animations).

## External Dependencies

- **Database**: PostgreSQL (configured via `DATABASE_URL` environment variable, used with Drizzle ORM)
- **Font**: Google Fonts — Nunito family loaded via `@expo-google-fonts/nunito`
- **Icons**: `@expo/vector-icons` (Ionicons, Feather)
- **Haptic Feedback**: `expo-haptics` for tactile responses on habit completion
- **No external APIs or third-party services** are currently integrated beyond the self-hosted Express backend