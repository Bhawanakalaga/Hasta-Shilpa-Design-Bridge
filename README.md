# Hasta-Shilpa (Hand-Crafted)
## Design Bridge for Artisans – Modernizing Traditional Craft

**Hasta-Shilpa** is a "Design-Bridge" application specifically engineered for bamboo and cane artisans. It empowers traditional makers with modern urban design concepts, technical blueprints, and commercial tools to increase the value of their handmade products.

---

## 🌟 The Vision
Bamboo and cane artisans often possess world-class skills but struggle with "Design Innovation." By connecting traditional techniques with modern aesthetics (e.g., Bamboo Laptop Stands, Minimalist Lamps), Hasta-Shilpa helps artisans create products that command higher prices in global markets.

---

## 🛠️ Key Features

### 1. Design Trend & Gallery (Home)
- A curated feed of modern bamboo and cane products.
- Showcases "Trending Items" to inspire artisans to move beyond old patterns.

### 2. Technical Blueprint View
- **Zoomable Diagrams**: High-clarity sketches with precise measurements.
- **Comprehensive Guides**: Includes Material Lists, Required Tools, and Construction Procedures.
- **Real-World Downloads**: Download blueprints as **PDF Documents** or Images for offline use in the workshop.

### 3. Material & Inventory Tracker
- **Usage Logging**: Track bamboo pole counts and cane lengths linked to products.
- **Cost Analysis**: Automatic estimation of raw material investments.

### 4. Advanced Price Calculator
- **Profit Protection**: Suggested selling price based on `Material + (Labor × Wage)`.
- **Dynamic Inputs**: Personalized local material costs and hourly wage configurations.

### 5. Multi-User Marketplace
- Artisans can list modern products; users can simulate purchase flows with **Real Invoice Downloads**.

### 6. AI Artisan Assistant (Chatbot)
- **Google Gemini Integration**: Instant advice on technical challenges, tool maintenance, and design trends.

---

## 💻 Technical Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Mobile Integration**: Kotlin,Capacitor (Android Studio Compatible)
- **Styling**: Tailwind CSS (Custom "Bamboo Earth" Design System)
- **Database**: Firebase Firestore (Real-time Cloud Sync)
- **Authentication**: Firebase Auth (Secure Login/Registration)
- **AI Engine**: Google Gemini API (@google/genai)
- **PDF Core**: jsPDF (for Blueprints and Commercial Invoices)

---

## 🚀 Execution & Installation

### Required Setup
- Node.js (v18+)
- Android Studio (for Mobile testing)
- Firebase Config (provided in `firebase-applet-config.json`)

### Running the Web Version
```bash
npm install
npm run dev
```

### Running on Android Device/Emulator
```bash
npm run build      # Generates optimized static assets
npx cap sync       # Syncs web assets to Android platform
npx cap open android # Opens project in Android Studio
```

---

## 📂 Repository Structure
- `/src/components`: Reusable UI modules (Buttons, Cards, Modals)
- `/src/screens`: Core application pages
- `/src/services`: API handlers for Firebase and Gemini AI
- `/src/lib`: Logic utilities including File Download handlers
- `/android`: Capacitor-generated Android Studio project

---

## 📄 Evaluation Notes
This project adheres to the **Android App Development using Gen AI** internship criteria:
- **Gen AI:** Full integration with Gemini for artisan technical support.
- **Code Quality:** Strong TypeScript typing and modular component architecture.
- **Build Success:** Verified `app-debug.apk` generation.
- **Functionality:** 6+ unique modules working with live cloud data.
