import { redirect } from "next/navigation";

export default function LegacyCrmRedirect() {
  redirect("/admin/calendar");
}
