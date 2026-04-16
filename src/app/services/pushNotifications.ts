import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { toast } from "sonner";
import { notificationService } from "./api";

let listenersAttached = false;
let initializedForUserId: string | null = null;

const ensureListeners = () => {
  if (listenersAttached) return;

  PushNotifications.addListener("registration", async (token) => {
    try {
      await notificationService.registerDevice(token.value, Capacitor.getPlatform());
      console.log("Push token registrado com sucesso");
    } catch (error) {
      console.error("Erro ao registrar push token:", error);
    }
  });

  PushNotifications.addListener("registrationError", (error) => {
    console.error("Erro no registro de notificacao push:", error);
  });

  PushNotifications.addListener("pushNotificationReceived", (notification) => {
    if (notification.title || notification.body) {
      toast.info(notification.title || "Notificacao", {
        description: notification.body,
      });
    }
  });

  listenersAttached = true;
};

export const registerPushNotifications = async (userId: string) => {
  if (!Capacitor.isNativePlatform()) return;
  if (initializedForUserId === userId) return;

  ensureListeners();

  const permissionStatus = await PushNotifications.checkPermissions();
  let receivePermission = permissionStatus.receive;

  if (receivePermission === "prompt") {
    const requested = await PushNotifications.requestPermissions();
    receivePermission = requested.receive;
  }

  if (receivePermission !== "granted") {
    console.warn("Permissao de push notificacoes nao concedida");
    return;
  }

  if (Capacitor.getPlatform() === "android") {
    await PushNotifications.createChannel({
      id: "default",
      name: "Geral",
      description: "Canal padrao de notificacoes",
      importance: 4,
      visibility: 1,
      sound: "default",
    }).catch(() => undefined);
  }

  await PushNotifications.register();
  initializedForUserId = userId;
};
