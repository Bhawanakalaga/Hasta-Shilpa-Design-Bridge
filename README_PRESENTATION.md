# Hasta-Shilpa Presentation Guide (11 PM)

This guide will ensure your app runs perfectly and looks exactly like the Google AI Studio preview.

## 1. Preparation (Do this NOW)

1.  **AI Studio**: Click **Build** to make sure the latest code is ready.
2.  **Download ZIP**: Click the **Settings (Gear Icon)** -> **Export** -> **Download ZIP**.
3.  **Unzip**: Extract the folder on your computer.

## 2. Local Setup (FIXED)

I have fixed the "JVM Inconsistency" and "AAR Compatibility" errors. The development environment is now set to **Android SDK 36** and **Java 21**.

Open your terminal inside the extracted project folder:

```bash
# 1. Install all dependencies
npm install

# 2. Build the React UI
npm run build

# 3. Sync to Android project
npx cap sync android
```

## 3. Gemini Chatbot Key
For the AI Assistant to work locally:
1.  Create a file named `.env` in the root folder.
2.  Add this line: `GEMINI_API_KEY=YOUR_ACTUAL_API_KEY_HERE`

## 4. Run in Android Studio (IMPORTANT)

1.  **Open Android Studio** and wait for Sync.
2.  **Change App Icon (to the Ganesha Logo)**:
    -   Right-click the `app` folder -> **New** -> **Image Asset**.
    -   In **Path**, click the folder icon and select the 3rd screenshot you showed me (the beautiful gold/green logo).
    -   Adjust **Resize** slider until the logo fits perfectly in the circle.
    -   Click **Next** -> **Finish**. (This replaces the default Android icon with your custom one).
3.  **Sync**: Click **File > Sync Project with Gradle Files**.
4.  Click the **Green Play Arrow**.

## 5. Presentation Highlights
-   **Mobile Navigation**: I fixed the bottom bar. **Profile** is now visible next to the calculator.
-   **Design**: Show the Bento Grid layout. It's perfectly responsive on every phone.
-   **AI Integration**: Ask the "AI Bamboo Expert" a question. It's connected and ready!

**Good luck! You are going to do great!**
