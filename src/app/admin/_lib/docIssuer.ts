/** Реквизиты исполнителя в документе: собираются на сервере из «Организации» и «Филиала» и лежат в снимке версии. */
export type DocIssuer = {
  fullName: string;
  brandName: string;
  inn: string;
  ogrnip: string;
  legalAddress: string;
  phone: string;
  email: string;
  signerName: string;
  city: string;
  branchAddress: string;
  docPrefix: string;
  /** «ИП Стражников А.Л. ; АванКор Жуковский» */
  title: string;
  /** «ИП Стражников А.Л. (АванКор Жуковский)» */
  titleInBrackets: string;
};
