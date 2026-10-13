# Polli Expo App

- This app uses Expo SDK 54. Before changing Expo APIs, native modules, or app configuration, consult the versioned [Expo SDK 54 documentation](https://docs.expo.dev/versions/v54.0.0/) and verify compatibility with `package.json`.
- Preserve the existing Expo Router, React Native, and NativeWind patterns. Keep route screens in `app/` and reusable UI in `components/`.
- Follow [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) for tokens, typography, exercise feedback, accessibility, and interaction states.
- Run `npm run lint` after app changes. There is no configured test script; do not claim tests passed unless a relevant test was actually run.
- Do not run `npm run reset-project` for routine development; it replaces the current app structure.
