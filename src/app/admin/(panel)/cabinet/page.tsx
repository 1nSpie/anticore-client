import { redirect } from "next/navigation";

export default function LegacyCabinetClientsRedirect() {
  redirect("/admin/clients");
}
