/** Реквизиты оператора для юридических документов ЛК (согласовано с /pk). */
export const LEGAL_OPERATOR_NAME = "Антикор Сервис Жуковский";
export const LEGAL_OPERATOR_EMAIL = "aleksandrzagornyj367@gmail.com";
export const LEGAL_SITE_NAME = "Аванантикор.рф";

export const LEGAL_DOC_VERSION = "2026-06-08";

export const LEGAL_ROUTES = {
  privacyPolicy: "/cabinet/legal/privacy-policy",
  personalDataConsent: "/cabinet/legal/personal-data-consent",
  terms: "/cabinet/legal/terms",
  fullPrivacyPolicy: "/pk",
} as const;
