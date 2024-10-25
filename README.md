# Welcome to Watch Only Wallet 👋

**Watch Only Wallet** allows users to monitor Bitcoin balances and transactions without direct control over funds, leveraging Bitcoin descriptors for versatility, including support for Miniscript descriptors.

<div align="center">
  
  [![Watch the video](https://raw.githubusercontent.com/user-attachments/assets/1db5441f-be13-4b2a-9279-7c9022d1fdda/thumbnail.jpg)](https://github.com/user-attachments/assets/1db5441f-be13-4b2a-9279-7c9022d1fdda)

</div>

---

### Quick Setup (TL;DR)

Clone the repository, install dependencies, and launch on Android or iOS with these commands:

```bash
git clone git@github.com:bitcoinerlab/WatchOnlyWallet.git
cd WatchOnlyWallet
npm install
npx expo prebuild
```

#### Download the APK

For Android users, download the latest APK directly from our [releases page](https://github.com/bitcoinerlab/WatchOnlyWallet/releases/download/v1.0.0/build-1729842760057.apk) to install the app on your device.

---

#### Running on Android

You'll need **Android Studio** and a simulator installed:

```bash
npm run android
```

#### Running on iOS

You'll need **Xcode** and an iOS simulator installed:

```bash
npm run ios
```

---

### Building an APK (Android)

To create an APK for Android, you’ll need an Expo account and **Expo Application Services (EAS)**:

```bash
npm install -g eas-cli
npx eas build --profile preview --platform android --clear-cache --local
```

> **Note**: For iOS builds, refer to Expo’s documentation, as sharing builds on iOS requires additional steps.

For more details on Expo builds, deployment, and configuration, check out the [Expo Documentation](https://docs.expo.dev/).
