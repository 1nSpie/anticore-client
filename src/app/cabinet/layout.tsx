import type { Metadata } from "next";
import { cabinetShell, cabinetInner, CABINET_PAGE_BACKGROUND } from "./_lib/cabinetUi";

export const metadata: Metadata = {
  title: "Личный кабинет | АванКор",
  description: "Профиль клиента, история визитов, уведомления",
};

export default function CabinetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={cabinetShell}
      style={{ background: CABINET_PAGE_BACKGROUND }}
    >
      <div className={cabinetInner}>{children}</div>
    </div>
  );
}
