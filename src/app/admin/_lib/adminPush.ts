import { adminApi } from "./api";

/** Web Push требует service worker, PushManager и Notification (на iPhone — только установленное на экран «Домой» приложение). */
export const pushSupported = () =>
  typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

const toKey = (base64: string) => {
  const raw = atob((base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
};

async function currentSubscription() {
  const reg = await navigator.serviceWorker.ready;
  return reg.pushManager.getSubscription();
}

export async function isPushEnabled(): Promise<boolean> {
  if (!pushSupported() || Notification.permission !== "granted") return false;
  return (await currentSubscription()) !== null;
}

/** Спрашивает разрешение и подписывает это устройство. Возвращает false, если разрешения нет или push на сервере не настроен. */
export async function enablePush(): Promise<boolean> {
  if (!pushSupported()) return false;
  const { data } = await adminApi.get<{ publicKey: string | null }>("/crm/notifications/push/key");
  if (!data.publicKey) return false;
  if ((await Notification.requestPermission()) !== "granted") return false;

  const reg = await navigator.serviceWorker.ready;
  const sub =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toKey(data.publicKey) }));
  const json = sub.toJSON();
  await adminApi.post("/crm/notifications/push/subscribe", {
    endpoint: sub.endpoint,
    p256dh: json.keys?.p256dh,
    auth: json.keys?.auth,
  });
  return true;
}

export async function disablePush(): Promise<void> {
  const sub = await currentSubscription();
  if (!sub) return;
  await adminApi.delete("/crm/notifications/push/subscribe", { data: { endpoint: sub.endpoint } });
  await sub.unsubscribe();
}
