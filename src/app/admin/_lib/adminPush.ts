import { adminApi } from "./api";
import { createPush, pushSupported } from "./webPush";

export { pushSupported };
const push = createPush(adminApi, "/crm/notifications");
export const isPushEnabled = push.isEnabled;
export const enablePush = push.enable;
export const disablePush = push.disable;
