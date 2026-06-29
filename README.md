
# SafeRoute: Community Safety Reporting and Route Advisory App

SafeRoute is a cross-platform mobile safety application that helps users report, view, verify, and avoid unsafe areas using community reports, Firebase, Google Maps, and Gemini AI. The app is designed to improve public safety awareness by allowing users to submit safety reports, view unsafe zones on a live map, receive route safety warnings, and quickly find nearby emergency services.


---

## Project Overview

SafeRoute focuses on community-driven safety reporting. Users can report hazards or unsafe incidents with location details, view safety reports submitted by others, verify reports through community interaction, and use map-based tools to make safer travel decisions.

The app combines:

* Crowdsourced safety reporting
* Firebase Realtime Database
* Google Maps location services
* Gemini AI support
* Community verification
* Route safety checking
* Emergency SOS assistance
* Android deployment using Capacitor

---

## Main Features

### User Authentication and Profile

* Allows users to register and log in.
* Stores user profile information.
* Tracks user contribution activity.
* Displays user report count, verified reports, and contribution score.

### Crowdsourced Safety Reporting

* Users can submit safety reports from the app.
* Reports include important details such as:

  * Category
  * Severity
  * Description
  * Latitude and longitude
  * Timestamp
* Report data is stored in Firebase Realtime Database.

### Gemini Hazard Classification

* Gemini AI is used to support hazard classification and safety-related suggestions.
* The AI helps interpret report details and provide smarter safety feedback.
* The app includes fallback handling in case the AI service is slow or unavailable.

### Community Verification System

* Users can interact with submitted reports.
* Reports can be verified or disputed by the community.
* User contribution scores help encourage active participation.
* The app includes a leaderboard-style system to highlight user activity.

### Live Safety Heatmap

* Displays submitted safety reports on Google Maps.
* Reports are shown as circular safety zones.
* Severity affects the circle size, color, and intensity.
* Users can filter reports by:

  * Category
  * Severity
  * Time range
* Tapping a heat zone shows nearby individual reports.

### Safe Route Suggestion

* Users can enter a destination.
* The app draws a route using Google Maps Directions.
* The route is checked against active high-severity reports.
* Unsafe zones near the route are highlighted in red.
* Users can accept the displayed route or request an alternate route.

### Gemini Route Advisory

* After unsafe reports are detected near a route, Gemini generates a plain language safety advisory.

### Emergency SOS Feature

* Pressing the SOS button searches for nearby emergency locations.
* The app displays nearby hospitals and police stations.
* Emergency locations are shown in a panel and marked on the map.
* Users can draw a route to a selected emergency location.

### Android Integration

* The app was built and tested on Android using Capacitor and Android Studio.
* The Android version was tested for:

  * Map loading
  * Location access
  * Heatmap display
  * Route safety checking
  * SOS panel
  * Gemini advisory
  * Mobile responsive layout

---

## Tech Stack

* **Angular** – Frontend framework
* **TypeScript** – Main development language
* **Capacitor** – Cross-platform Android deployment
* **Firebase Realtime Database** – Report storage and real-time data handling
* **Firebase Authentication** – User login and registration
* **Google Maps JavaScript API** – Map display and map interactions
* **Google Directions Service** – Route drawing and route alternatives
* **Google Places API** – Nearby hospitals and police stations
* **Gemini API** – AI-based hazard support and route advisory
* **Android Studio** – Android testing and deployment
* **GitHub** – Version control and team collaboration

---

## System Modules

The app is divided into three main functional areas:

### 1. User and Community Module

This module manages user authentication, profiles, report verification, contribution scores, and leaderboard features.

### 2. Reporting and AI Module

This module allows users to submit safety reports and supports Gemini-based hazard classification and safety feedback.

### 3. Map, Route Safety, and SOS Module

This module displays reports on Google Maps, filters safety zones, checks route safety, generates route advisories, and provides emergency SOS support.

---

## Installation

Clone the repository:

```bash
git clone https://github.com/Fariha-3/SafeRoute-App.git
cd SafeRoute-App
```

Install dependencies:

```bash
npm install
```

Run the app in the browser:

```bash
ng serve
```

Build the project:

```bash
ng build
```

Sync with Android:

```bash
npx cap sync android
```

Open in Android Studio:

```bash
npx cap open android
```

---

## API Keys

This project requires API keys for Google Maps and Gemini.

API keys should be stored locally and should not be pushed to GitHub. Example local configuration:

```ts
export const API_KEYS = {
  googleMaps: "YOUR_GOOGLE_MAPS_API_KEY",
  gemini: "YOUR_GEMINI_API_KEY"
};
```

Make sure the API key file is included in `.gitignore`.

---

## Demo

<img width="1263" height="570" alt="image" src="https://github.com/user-attachments/assets/6c5524f3-f6d4-4f1d-a0cf-54e46a0570ba" />
<img width="1262" height="566" alt="image" src="https://github.com/user-attachments/assets/fd79f7ad-be40-49a5-9030-45efe58d5307" />
<img width="1265" height="587" alt="image" src="https://github.com/user-attachments/assets/4c9f0ad2-fe05-4a80-92ab-8e49cd1f4ae4" />
<img width="1266" height="544" alt="image" src="https://github.com/user-attachments/assets/89e2f498-07ef-4efd-9823-ed86dd93e7b9" />
<img width="1265" height="582" alt="image" src="https://github.com/user-attachments/assets/011595ca-668e-496e-a3a5-e3fbd22abfd6" />
<img width="1256" height="574" alt="image" src="https://github.com/user-attachments/assets/7b244e75-f925-4d4c-8233-6910bcc4679c" />
<img width="946" height="1600" alt="image" src="https://github.com/user-attachments/assets/cb48ad45-7b1b-4753-8d2f-a5b3d2107f03" />

---

## Contributors

* Fariha Farzeen Shafiullah
* Fiza Fathima
* Syeda Aafiya

---

## Repository

https://github.com/Fariha-3/SafeRoute-App

---

## Academic Note

This project was developed for academic purposes as part of a university course project. The app demonstrates the use of cross-platform mobile development, Firebase, Google Maps services, AI integration, and Android deployment for a community safety use case.


