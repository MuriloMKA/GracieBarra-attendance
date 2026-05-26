import { toast } from "sonner";
import { notificationService } from "./api";

// Stub modificado para Web
export const registerPushNotifications = async (userId: string) => {
  // Para Web, você pode implementar a Web Push API junto com o Service Worker (ex: Firebase Cloud Messaging).
  // Por enquanto, as notificações push no app capacitor foram desativadas.
  
  if (!("Notification" in window)) {
    console.warn("Este browser não suporta notificações de desktop");
    return;
  }

  const permission = await Notification.requestPermission();
  
  if (permission === "granted") {
    console.log("Permissão de notificação web concedida!");
    
    // Aqui no futuro você pode registrar o Service Worker para Push da Web:
    // await navigator.serviceWorker.register('/sw.js');
    // ...
  } else {
    console.warn("Permissão negada para notificações Web.");
  }
};
