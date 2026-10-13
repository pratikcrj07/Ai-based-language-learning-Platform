# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

## Open on a physical phone

1. Connect the phone and development computer to the same Wi-Fi network.
2. Copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_URL` to
   `http://<computer-lan-ip>:3001` and `EXPO_PUBLIC_NLP_API_URL` to
   `http://<computer-lan-ip>:8000` (for example, `http://192.168.1.25:8000`).
   Find the computer's LAN IP in its network settings; don't use `localhost`
   or `10.0.2.2` for a physical phone.
3. Start Express on port 3001 and the NLP service with
   `python -m uvicorn index:app --reload --host 0.0.0.0 --port 8000`.
4. Restart Expo with `npx expo start --lan`, then scan the Expo QR code with
   Expo Go.

Allow inbound connections to ports 3001 and 8000 if the computer's firewall
asks. The Expo QR code loads the app; these API URLs let the phone reach the
backend services.

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
