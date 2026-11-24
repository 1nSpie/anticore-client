import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { rublesInWordsRu } from "../contract/rublesInWordsRu";
import {
  formatBirthDate,
  formatCityDate,
  formatPhone8,
  formatWorkDate,
  layoutWorks,
} from "../contract/fillContractDocx";
import { box, blank, formatDateDots, formatFioForAct, registerActFonts, type ActDocInput } from "./actShared";
import { CONTRACT_TEXT, type ContractBlock } from "./contractText.generated";

registerActFonts();

const s = StyleSheet.create({
  // lineHeight нельзя задавать на Page и на колонтитуле: с ним не рисуется «Стр. N из M» — он на внутреннем блоке
  page: {
    paddingTop: 34,
    paddingBottom: 42,
    paddingHorizontal: 38,
    fontSize: 8.6,
    fontFamily: "DejaVu",
    color: "#111",
  },
  body: { fontSize: 8.6, lineHeight: 1.32 },
  draft: { borderWidth: 1, borderColor: "#b00020", padding: 5, marginBottom: 6, color: "#b00020", fontSize: 8 },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 3 },
  title: { fontSize: 13, fontWeight: "bold" },
  cityDate: { fontSize: 9 },
  subtitle: { fontWeight: "bold", textAlign: "center", marginVertical: 5, fontSize: 9 },
  parties: { flexDirection: "row", gap: 14, marginBottom: 6 },
  partyCol: { flex: 1 },
  partyLabel: { fontWeight: "bold", textDecoration: "underline", marginBottom: 2, fontSize: 9.5 },
  bold: { fontWeight: "bold" },
  heading: { fontWeight: "bold", fontSize: 9.5, marginTop: 8, marginBottom: 3 },
  sub: { fontWeight: "bold", marginTop: 5, marginBottom: 2 },
  p: { marginBottom: 3, textAlign: "justify" },
  bullet: { marginBottom: 1.5, paddingLeft: 6 },
  table: { flexDirection: "row", borderWidth: 0.7, borderColor: "#444", marginVertical: 4 },
  cell: { flex: 1, padding: 5 },
  cellRight: { borderLeftWidth: 0.7, borderLeftColor: "#444" },
  cellTitle: { fontWeight: "bold", marginBottom: 3 },
  field: { fontWeight: "bold", marginBottom: 2 },
  sign: { marginTop: 4, textAlign: "right" },
  signs: { flexDirection: "row", justifyContent: "space-between", gap: 24, marginTop: 22 },
  signCol: { flex: 1 },
  signLine: { borderBottomWidth: 0.7, borderBottomColor: "#333", marginTop: 16, marginBottom: 3 },
  pageFooter: { position: "absolute", bottom: 16, left: 38, right: 38, fontSize: 7, color: "#444", textAlign: "right" },
});

export type ContractPdfInput = ActDocInput & {
  phone: string;
  birthDate?: string | null;
};

const rub = (n: number) => `${n.toLocaleString("ru-RU")} руб.`;

const PAYMENT_LABELS: [string, "CASH" | "CARD_SBP" | "INVOICE_IP"][] = [
  ["Наличные;", "CASH"],
  ["Оплата банковской картой / СБП;", "CARD_SBP"],
  ["Оплата по договору с ИП.", "INVOICE_IP"],
];

/**
 * Договор в PDF. Юридический текст берётся из шаблона DOCX (`contractText.generated.ts`, см.
 * `scripts/gen-contract-text.py`), поэтому совпадает с DOCX-версией слово в слово; поля подставляются из снимка.
 */
export function ContractPdf(props: ContractPdfInput) {
  const fio = formatFioForAct(props);
  const number = String(props.contractNumber);
  const dateSource = props.contractDate ?? props.startsAt;
  const works = props.works ?? [];
  const layout = layoutWorks(works);
  const pre = props.pricing?.preliminary ?? props.priceRub;
  const method = props.pricing?.paymentMethod ?? null;
  const missing = props.draftMissing ?? [];
  const mileage = props.inspection?.inspection?.mileageKm;
  const year = props.year?.trim() ? (props.year.trim().endsWith("г") ? props.year.trim() : `${props.year.trim()}г`) : "";

  /** Поля договора в тексте раздела. */
  const fill = (text: string) =>
    text
      .replaceAll("{{START}}", formatWorkDate(props.startsAt))
      .replaceAll("{{END}}", formatWorkDate(props.endsAt))
      .replaceAll("{{PRICE}}", ` ${rub(Math.round(pre || 0))}`)
      .replaceAll("{{PRICE_WORDS}}", rublesInWordsRu(pre || 0));

  const blocks = (items: readonly ContractBlock[]) =>
    items.map((b, i) =>
      b.k === "h" ? (
        <Text key={i} style={s.heading} minPresenceAhead={40}>
          {fill(b.t)}
        </Text>
      ) : b.t.startsWith("—") ? (
        <Text key={i} style={s.bullet}>
          {fill(b.t)}
        </Text>
      ) : (
        <Text key={i} style={s.p}>
          {fill(b.t)}
        </Text>
      ),
    );

  /** Раздел 4: у вариантов оплаты галочки ставятся по выбранному способу. */
  const section4 = CONTRACT_TEXT.section4.map((b, i) => {
    const pay = PAYMENT_LABELS.find(([label]) => b.t.endsWith(label));
    if (b.t.startsWith("☐") && pay) {
      return (
        <Text key={i} style={{ ...s.p, paddingLeft: 14 }}>
          {box(method === pay[1])} {pay[0]}
        </Text>
      );
    }
    return (
      <Text key={i} style={b.k === "h" ? s.heading : s.p} minPresenceAhead={b.k === "h" ? 40 : undefined}>
        {fill(b.t)}
      </Text>
    );
  });

  const [consentTitle, ...consentRest] = CONTRACT_TEXT.consent;
  const consentSignature = consentRest.filter((b) => b.t.startsWith("Подпись"));
  const consentBody = consentRest.filter((b) => !b.t.startsWith("Подпись"));

  return (
    <Document>
      <Page size="A4" style={s.page} wrap>
        <View style={s.body}>
          {props.draft === true && (
            <View style={s.draft}>
              <Text style={s.bold}>ЧЕРНОВИК — документ не готов к подписанию.</Text>
              <Text>
                {missing.length > 0
                  ? `Не заполнено: ${missing.join("; ")}.`
                  : "Предварительный просмотр: документ ещё не сформирован."}
              </Text>
            </View>
          )}

          <View style={s.titleRow}>
            <Text style={s.title}>Договор № {number}</Text>
            <Text style={s.cityDate}>{formatCityDate(dateSource, props.issuer.city)}</Text>
          </View>
          <Text style={s.subtitle}>
            на оказание услуг по антикоррозийной обработке и выполнению сопутствующих работ транспортного средства
          </Text>

          <View style={s.parties}>
            <View style={s.partyCol}>
              <Text style={s.partyLabel}>Исполнитель:</Text>
              <Text style={s.bold}>{props.issuer.title}</Text>
              <Text style={s.bold}>{props.issuer.branchAddress}</Text>
              <Text style={s.bold}>Адрес юридического лица: {props.issuer.legalAddress}</Text>
              <Text>Почта: {props.issuer.email}</Text>
              <Text>Телефон: {props.issuer.phone}</Text>
              <Text style={s.bold}>ИНН: {props.issuer.inn}</Text>
              <Text style={s.bold}>ОГРН/ОГРНИП: {props.issuer.ogrnip}</Text>
            </View>
            <View style={s.partyCol}>
              <Text style={s.partyLabel}>Заказчик:</Text>
              <Text style={s.bold}>ФИО полностью: {fio}</Text>
              <Text style={s.bold}>Дата рождения: {formatBirthDate(props.birthDate ?? null) || "__________"}</Text>
              <Text style={s.bold}>Телефон: {formatPhone8(props.phone)}</Text>
            </View>
          </View>

          <Text style={s.p}>
            {props.issuer.fullName}, именуемый «Исполнитель», и {fio} (ая) «Заказчик», совместно именуемые «Стороны», заключили
            настоящий договор о нижеследующем:
          </Text>
          <Text style={s.p}>{CONTRACT_TEXT.introVehicle}</Text>

          {blocks(CONTRACT_TEXT.section1)}

          <Text style={s.heading} minPresenceAhead={120}>
            {CONTRACT_TEXT.heading2}
          </Text>
          <View style={s.table} wrap={false}>
            <View style={s.cell}>
              <Text style={s.cellTitle}>{CONTRACT_TEXT.vehicleNotes.leftTitle}</Text>
              <Text style={s.field}>Марка / модель: {blank(props.carModel, 20)}</Text>
              <Text style={s.field}>VIN: {blank(props.vin, 17)}</Text>
              <Text style={s.field}>Гос. номер: {props.plate?.trim() || ""}</Text>
              <Text style={s.field}>Год выпуска: {year}</Text>
              <Text style={s.field}>Пробег: {mileage != null ? mileage : "________"} км</Text>
              {CONTRACT_TEXT.vehicleNotes.left.map((t, i) => (
                <Text key={i} style={{ ...s.p, marginTop: 4 }}>
                  {t}
                </Text>
              ))}
            </View>
            <View style={{ ...s.cell, ...s.cellRight }}>
              <Text style={s.cellTitle}>{CONTRACT_TEXT.vehicleNotes.rightTitle}</Text>
              {works.length > 0 ? (
                layout.slots
                  .filter((l) => l.trim())
                  .map((l, i) => (
                    <Text key={i} style={s.field}>
                      {l}
                    </Text>
                  ))
              ) : (
                <Text style={s.field}>{props.serviceType.trim() || "________________"}</Text>
              )}
              {CONTRACT_TEXT.vehicleNotes.right.map((t, i) => (
                <Text key={i} style={{ ...s.p, marginTop: 4 }}>
                  {t}
                </Text>
              ))}
            </View>
          </View>

          <View wrap={false}>
            <Text style={s.heading}>{consentTitle.t}</Text>
            {blocks(consentBody)}
            {consentSignature.map((b, i) => (
              <Text key={i} style={s.sign}>
                {b.t}
              </Text>
            ))}
          </View>

          {blocks(CONTRACT_TEXT.section3)}
          {section4}
          {blocks(CONTRACT_TEXT.sections5to10)}

          <View style={s.signs} wrap={false}>
            <View style={s.signCol}>
              <Text style={s.bold}>Исполнитель</Text>
              <View style={s.signLine} />
              <Text>/{props.issuer.signerName}/</Text>
            </View>
            <View style={s.signCol}>
              <Text style={s.bold}>Заказчик</Text>
              <View style={s.signLine} />
              <Text>/{fio}/</Text>
            </View>
          </View>
        </View>

        <Text
          style={s.pageFooter}
          fixed
          render={({ pageNumber, totalPages }) => `Договор № ${number} · Стр. ${pageNumber} из ${totalPages}`}
        />
      </Page>

      {works.length > 0 && layout.appendix ? (
        <Page size="A4" style={s.page} wrap>
          <View style={s.body}>
            <Text style={{ ...s.title, textAlign: "center", marginBottom: 4 }}>
              Приложение № 1 к Договору № {number} от {formatDateDots(dateSource)} г.
            </Text>
            <Text style={{ ...s.subtitle, fontWeight: "normal", marginBottom: 10 }}>Перечень согласованных работ</Text>
            {works.map((w, i) => (
              <View key={w.id} style={{ marginBottom: 6 }} wrap={false}>
                <Text style={s.bold}>
                  {i + 1}. {w.title}
                </Text>
                {w.comment ? <Text>Комментарий: {w.comment}</Text> : null}
                <Text>{w.priceRub == null ? "Стоимость: не определена" : `Стоимость: ${rub(w.priceRub)}`}</Text>
              </View>
            ))}
            <Text style={{ ...s.bold, marginTop: 10 }}>
              Предварительная стоимость работ: {pre == null ? "не определена" : `${rub(pre)} (${rublesInWordsRu(pre)})`}
            </Text>
            <View style={s.signs} wrap={false}>
              <View style={s.signCol}>
                <Text style={s.bold}>Исполнитель</Text>
                <View style={s.signLine} />
                <Text>/{props.issuer.signerName}/</Text>
              </View>
              <View style={s.signCol}>
                <Text style={s.bold}>Заказчик</Text>
                <View style={s.signLine} />
                <Text>/{fio}/</Text>
              </View>
            </View>
          </View>
          <Text
            style={s.pageFooter}
            fixed
            render={({ pageNumber, totalPages }) => `Договор № ${number} · Стр. ${pageNumber} из ${totalPages}`}
          />
        </Page>
      ) : null}
    </Document>
  );
}
