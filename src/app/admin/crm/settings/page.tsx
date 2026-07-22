import { redirect } from "next/navigation";

export default function LegacyCrmSettingsRedirect() {
  redirect("/admin/sms");
}
