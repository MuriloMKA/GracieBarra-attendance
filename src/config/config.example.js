// Example environment configuration
// Copy this to .env and fill with your values

export default {
  // Development
  dev: {
    apiUrl: "http://localhost:3000/api",
    socketUrl: "ws://localhost:3000",
  },

  // Production
  prod: {
    apiUrl: "https://your-api-url.railway.app/api",
    socketUrl: "wss://your-api-url.railway.app",
  },

  // Features flags
  features: {
    enablePushNotifications: false,
    enableQRCodeCheckin: false,
    enableDarkMode: false,
    enableBiometricAuth: false,
  },

  // Constants
  constants: {
    classesForGraduation: 40,
    checkInTimeWindowMinutes: 30, // tempo antes/depois da aula para check-in
    autoLogoutMinutes: 30,
  },
};
