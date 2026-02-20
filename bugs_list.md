# Bugs & Fixes: Dream Sleep

| # | File / Location | Bug / Problem | Severity | Likely Cause | Verification |
|---|-----------------|---------------|----------|--------------|--------------|
| 1 | `package.json` | Incompatible Expo/React versions | **Critical** | `expo@~54` and `react-native@0.81` do not exist/are not stable yet. | `npx expo install` fails or app crashes on boot. |
| 2 | `server/db.ts` | Incorrect Drizzle driver (MySQL) | **Critical** | Uses `drizzle-orm/mysql2` for a mobile app; should use `expo-sqlite`. | `getDb()` fails; database operations throw errors. |
| 3 | `server` folder | Architecture mismatch | **High** | Runs Express server with `tsx watch` locally, which won't work on mobile devices. | App cannot connect to local server in production/on device. |
| 4 | `app.config.ts` | Missing permissions | **High** | `expo-brightness` and `expo-audio` (recording) not fully configured in plugins. | Brightness control or recording fails on real devices. |
| 5 | `global.css` | NativeWind setup incomplete | **Medium** | Tailwind styles may not apply if `@tailwind` directives are missing or wrong version used. | Styles (e.g. `className="text-white"`) ignored. |
| 6 | `babel.config.js` | Duplicate/Conflicting presets | **Medium** | Mixes `babel-preset-expo` and `nativewind/babel` with `jsxImportSource`. | Compilation errors or hydration mismatches. |
| 7 | `lib/trpc.ts` | Hardcoded/Wrong API URL | **High** | Likely points to `localhost` which fails on physical devices. | "Failed to fetch" errors on device. |
| 8 | `drizzle/` | Schema/Migration mismatch | **High** | Schema refers to `mysql` types but app expects `sqlite`. | Migrations fail or `db:push` crashes. |
| 9 | `lib/use-dream-recorder.ts` | Silence detection logic | **Medium** | `THRESHOLD_DB` value might be unrealistic; silence timer might stop early. | Recording stops unexpectedly or doesn't start. |
| 10 | `node_modules` | Pnpm/Lockfile inconsistencies | **Low** | `pnpm-lock.yaml` might be out of sync with new experimental versions. | Dependency resolution errors during install. |
| 11 | `hooks/use-auth.ts` | OAuth/Session handling | **Medium** | Broken session persistence/redirects between server and client. | Login doesn't persist after reload. |
| 12 | `metro.config.js` | `forceWriteFileSystem: true` | **Low** | Workaround for CSS that might hide root configuration issues. | Inconsistent styling between Web and iOS/Android. |
