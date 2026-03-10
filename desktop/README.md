# SnapRecall Desktop (Electron + React)

## What this app does
- Uses backend from `VITE_API_BASE_URL` (defaults to `http://localhost:8080`).
- Supports account register/login with persisted session token.
- Requires login for capture, ask, and Telegram integration.
- Supports two layouts: `Command Workspace` and `Bubble Mode`.
- In Bubble Mode, the app can collapse to a small floating bubble and expand on click.
- Global shortcut triggers quick capture and save.
- Telegram integration uses one button that generates an event ID.
- Once linked for a logged-in account, future logins reuse that Telegram link.

## 1) Install
```bash
cd desktop
npm install
```

## 2) Configure env
```bash
cp .env.example .env
```

Defaults:
- `CAPTURE_SHORTCUT=CommandOrControl+Shift+S`
- `VITE_API_BASE_URL=http://localhost:8080`

## 3) Run dev mode
```bash
cd desktop
npm run dev
```

## 4) Package installers
```bash
cd desktop
npm run dist
```

Platform-specific:
```bash
npm run dist:mac
npm run dist:win
```

## Notes
- Screen capture uses Electron `desktopCapturer` and may require OS screen recording permission.
- `Capture now` in the UI opens a region selector and saves only the selected area.
- Global shortcut capture keeps quick full-screen primary display capture.
