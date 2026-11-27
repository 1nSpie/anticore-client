import type { AxiosInstance } from "axios";

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

/**
 * Подписка этого устройства на push. `base` — адрес API: `/crm/notifications` (админ) или `/staff/notifications` (мастер).
 * `navigator.serviceWorker.ready` отдаёт service worker с самым узким scope страницы: на `/admin/master` это `staff-sw.js`.
 */
export function createPush(api: AxiosInstance, base: string) {
  return {
    async isEnabled(): Promise<boolean> {
      if (!pushSupported() || Notification.permission !== "granted") return false;
      return (await currentSubscription()) !== null;
    },

    /** Спрашивает разрешение и подписывает устройство. false — разрешения нет или push на сервере не настроен. */
    async enable(): Promise<boolean> {
      if (!pushSupported()) return false;
      const { data } = await api.get<{ publicKey: string | null }>(`${base}/push/key`);
      if (!data.publicKey) return false;
      if ((await Notification.requestPermission()) !== "granted") return false;

      const reg = await navigator.serviceWorker.ready;
      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toKey(data.publicKey) }));
      const json = sub.toJSON();
      await api.post(`${base}/push/subscribe`, { endpoint: sub.endpoint, p256dh: json.keys?.p256dh, auth: json.keys?.auth });
      return true;
    },

    async disable(): Promise<void> {
      const sub = await currentSubscription();
      if (!sub) return;
      await api.delete(`${base}/push/subscribe`, { data: { endpoint: sub.endpoint } });
      await sub.unsubscribe();
    },
  };
}
