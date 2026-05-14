# How to Run Hasta-Shilpa (Web & Android)

This guide explains how to run the application so that it looks exactly like the AI Studio preview.

## 1. Running in AI Studio Preview
The application is automatically built and served on port 3000. Use the right-hand panel in AI Studio for live testing.

## 2. Running on Android (Android Studio)
To get the project running on your phone with the same UI as AI Studio:

1.  **Build the Web Assets**:
    ```bash
    npm run build
    ```
2.  **Sync with Android**:
    ```bash
    npx cap sync android
    ```
3.  **Open in Android Studio**:
    Open the `android` folder in Android Studio.
4.  **Run the App**:
    Select your device/emulator and click the **Run** button (Green Arrow).

## 3. Final Deployment Fixes (Presentation at 11 PM)
The "AAR metadata" error happened because some libraries needed a newer Android SDK. I have now updated the project to **SDK 36**.

### Final Countdown Checklist:
1.  **GEMINI API**: 
    - Ensure your `.env` file exists locally with `GEMINI_API_KEY=AIza...`
2.  **Clean & Build**:
    - In your terminal: `npm install`
    - Then: `npm run build`
3.  **Sync**: 
    - Run: `npx cap sync android`
4.  **Android Studio**:
    - Right-click `app` folder -> **New** -> **Image Asset** to set your custom logo (the Ganesha image).
    - Click **File > Sync Project with Gradle Files**.
    - Once everything is green, click **Run**.

### Presentation Highlights:
- **Bamboo Theme**: Show off the custom green/wood aesthetic.
- **Craftsman Tools**: Show the tracker and design explorer.
- **AI Bamboo Expert**: Ask the chatbot about "Bamboo treatment methods" or "traditional weaving". It uses the latest Gemini model for high-quality responses.

**You're all set! Good luck with the 11 PM presentation!**
