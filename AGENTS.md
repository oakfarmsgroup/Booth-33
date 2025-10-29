# Repository Guidelines

## Project Structure & Modules
- `App.js`, `MainApp.js`, `index.js` — app entry and root navigation.
- `screens/` — UI screens (e.g., `HomeScreen.js`, `BookScreen.js`).
- `components/` — reusable UI (e.g., `AudioPlayer.js`, `MiniPlayer.js`).
- `contexts/` — React Context providers (state, services).
- `admin/` — admin-only screens and flows.
- `assets/` — images and static assets.
- Config: `app.json`, `babel.config.js`, `.env` (local), `.env.example` (template).

## Build, Test, and Development
- Install: `npm install`
- Start dev server: `npm start`
- Run on device: `npm run ios` | `npm run android` | `npm run web`
- Security setup: Windows `install-security.bat`; macOS/Linux `./install-security.sh`
Notes: Uses Expo; Metro reloads on save. Environment variables load via `@env` from `.env`.

## Coding Style & Naming
- JavaScript/React Native with 2‑space indentation, single quotes, semicolons.
- Components/Screens: PascalCase files (e.g., `ProfileScreen.js`, `SettingsModal.js`).
- Hooks/functions/variables: camelCase (hooks start with `use...`).
- Keep components focused; colocate styles with component via `StyleSheet.create`.
- Imports: absolute from project root not configured; use relative paths.

## Testing Guidelines
- No test suite is configured yet. Recommended stack: Jest + @testing-library/react-native.
- File names: `*.test.js` next to source or in `__tests__/`.
- Suggested scripts:
  - `"test": "jest"`
  - `"test:watch": "jest --watch"`
- Aim for smoke tests on screens and unit tests for contexts and pure utilities.

## Commit & Pull Requests
- Prefer Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`.
- Commit messages: imperative mood; scope optional (e.g., `feat(components): add MiniPlayer`).
- PRs must include:
  - Purpose and summary of changes
  - Linked issue (e.g., `Closes #123`)
  - Screenshots/GIFs for UI changes
  - Testing notes (manual steps or tests added)

## Security & Configuration
- Never commit secrets; use `.env` (see `.env.example`).
- Environment import: `import { API_BASE_URL } from '@env'`.
- Run security bootstrap scripts before first run.
- Clear Metro cache if vars don’t load: `npm start -- --clear`.

