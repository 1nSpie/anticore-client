import { redirect } from "next/navigation";

export default function LegacyCrmClientsRedirect() {
  redirect("/admin/clients");
}
