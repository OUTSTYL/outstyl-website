import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBH1OwRYYzvY_K_aezwQOYwc_cXy-2TvBQ",
  authDomain: "dryp-5bde0.firebaseapp.com",
  projectId: "dryp-5bde0",
  storageBucket: "dryp-5bde0.firebasestorage.app",
  messagingSenderId: "947708141079",
  appId: "1:947708141079:web:7b4da9e0be03b5ba530652",
  measurementId: "G-P6FXY395PX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics
let analyticsInstance: any = null;

if (typeof window !== "undefined") {
  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  if (!isLocalhost) {
    isSupported().then((supported) => {
      if (supported) {
        analyticsInstance = getAnalytics(app);
        console.log("Firebase Analytics initialized successfully.");
      }
    });
  }
}

export const trackEvent = (eventName: string, params?: any) => {
  if (analyticsInstance) {
    logEvent(analyticsInstance, eventName, params);
    console.log(`Event logged: ${eventName}`, params);
  } else {
    console.warn(`Analytics not initialized yet. Skipping event: ${eventName}`);
  }
};
