# Hasta-Shilpa (Hand-Crafted)
## Design Bridge for Artisans – Modernizing Traditional Craft

**Hasta-Shilpa** is a "Design-Bridge" application specifically engineered for bamboo and cane artisans in regions like the Western Ghats. It empowers traditional makers with modern urban design concepts, technical blueprints, and commercial tools to increase the value of their handmade products.

---

## 🌟 The Vision
Bamboo and cane artisans often possess world-class skills but struggle with "Design Innovation." By connecting traditional techniques with modern aesthetics (e.g., Bamboo Laptop Stands, Minimalist Lamps), Hasta-Shilpa helps artisans create products that command higher prices in global markets.

---

## 🛠️ Key Features

### 1. Design Trend & Gallery (Home)
- A curated feed of modern bamboo and cane products.
- Showcases "Trending Items" to inspire artisans to move beyond old patterns.

### 2. Technical Blueprint View
- **Zoomable Diagrams**: High-clarity sketches with precise measurements (e.g., 30cm x 15cm).
- **Comprehensive Guides**: Includes Material Lists, Required Tools, and Step-by-Step Construction Procedures.
- **Professional Exports**: Download blueprints as high-quality **PDF Documents** or Images for offline use in the workshop.

### 3. Material & Inventory Tracker
- **Usage Logging**: Track bamboo pole counts and cane lengths (in meters) for every batch.
- **Cost Analysis**: Estimate total material cost automatically.
- **History Logs**: Maintain a repository of all inventory usage linked to specific projects.

### 4. Advanced Price Calculator (Profit Protection)
- **Suggested Selling Price**: Logic based on `Material Cost + (Labor Hours × Wage per Hour)`.
- **Dynamic Inputs**: Artisans can input their specific local material costs and desired hourly wages.
- **Pricing Archive**: Save history of calculated prices to ensure consistency and profit margins.

### 5. Direct (Simulated) Marketplace
- Artisans can list their finished "Modern Products" for sale.
- Category-based exploration (Furniture, Tech, Lighting, Architecture).

### 6. AI Artisan Assistant (Chatbot)
- **Powered by Google Gemini**: Get instant advice on design, tool maintenance, or technical challenges.
- **Multi-language Support**: Assistance available in English, Hindi, Kannada, Tamil, Telugu, and Malayalam.

---

## 💻 Technical Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Mobile Integration**: Capacitor (Android Ready)
- **Styling**: Tailwind CSS (Custom "Bamboo Ivory" & "Bamboo Rich" theme)
- **Animations**: Motion (for smooth route transitions)
- **Backend/Database**: Firebase Firestore (Real-time sync)
- **Authentication**: Firebase Auth (Email/Password, Google, Phone OTP)
- **AI Engine**: Google Gemini API (@google/genai)
- **Exports**: jsPDF for Technical Blueprint generation

---

## 🚀 Execution & Installation

### Prerequisites
- Node.js (v18+)
- Firebase Account (for Database & Auth)
- Gemini API Key

### Standard Development (Web)
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```

### Android Deployment (Mobile)
1. Build the production web assets:
   ```bash
   npm run build
   ```
2. Sync with Android project:
   ```bash
   npx cap sync
   ```
3. Open in Android Studio:
   ```bash
   npx cap open android
   ```


---

## 📈 Impact Goals
- **Artisanal Modernization**: Keeping traditional crafts relevant in the 21st century.
- **Economic Growth**: Increasing the "Per-Unit Value" of as artisan's work.
- **Sustainability**: Promoting Bamboo as a "Green Alternative" to plastics and metal.
