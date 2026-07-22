import Link from "next/link";
import {
  cabinetCard,
  cabinetH1,
  cabinetLink,
  cabinetMuted,
} from "../_lib/cabinetUi";

type LegalDocumentLayoutProps = {
  title: string;
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
};

export function LegalDocumentLayout({
  title,
  children,
  backHref = "/cabinet/register",
  backLabel = "← К регистрации",
}: LegalDocumentLayoutProps) {
  return (
    <article className={`${cabinetCard} max-w-3xl mx-auto space-y-6`}>
      <header className="space-y-2 border-b border-white/10 pb-4">
        <p className={cabinetMuted}>Личный кабинет · юридические документы</p>
        <h1 className={`${cabinetH1} text-xl sm:text-2xl`}>{title}</h1>
      </header>
      <div className="prose prose-sm max-w-none text-slate-300 space-y-4 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-white [&_h2]:mt-6 [&_h2]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_p]:leading-relaxed [&_strong]:text-slate-200">
        {children}
      </div>
      <footer className="pt-4 border-t border-white/10">
        <Link href={backHref} className={cabinetLink}>
          {backLabel}
        </Link>
      </footer>
    </article>
  );
}
