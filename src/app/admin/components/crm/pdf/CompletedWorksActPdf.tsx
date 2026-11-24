import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import {
  blank,
  box,
  formatDateDots,
  formatDateTimeRu,
  formatFioForAct,
  formatPriceLine,
  registerActFonts,
  serviceFlags,
  type ActDocInput,
} from "./actShared";
import { rublesInWordsRu } from "../contract/rublesInWordsRu";
import { APPROVAL_CHANNEL_LABEL, WORK_STATUS_LABEL } from "../../../_lib/executionTypes";

registerActFonts();

const s = StyleSheet.create({
  // lineHeight нельзя задавать на Page и на колонтитуле: с ним не рисуется «Стр. N из M» — он на внутреннем блоке
  page: {
    paddingTop: 32,
    paddingBottom: 40,
    paddingHorizontal: 36,
    fontSize: 9,
    fontFamily: "DejaVu",
    color: "#111",
  },
  body: { fontSize: 9, lineHeight: 1.35 },
  draft: {
    borderWidth: 1,
    borderColor: "#b00020",
    padding: 5,
    marginBottom: 6,
    color: "#b00020",
    fontSize: 8,
  },
  title: { fontSize: 13, fontWeight: "bold", textAlign: "center", marginBottom: 4 },
  subtitle: { fontSize: 9, textAlign: "center", marginBottom: 10 },
  parties: { flexDirection: "row", justifyContent: "space-between", gap: 16, marginBottom: 8 },
  partyCol: { flex: 1 },
  partyLabel: { fontWeight: "bold", marginBottom: 2 },
  companyLine: { fontSize: 8, marginBottom: 1 },
  hr: { borderBottomWidth: 1, borderBottomColor: "#222", marginVertical: 8 },
  sectionTitle: { fontWeight: "bold", marginBottom: 6, fontSize: 10 },
  subTitle: { fontWeight: "bold", marginTop: 4, marginBottom: 3 },
  row: { marginBottom: 3 },
  check: { marginBottom: 4 },
  note: { fontSize: 8, color: "#333", marginBottom: 3 },
  item: { marginBottom: 5 },
  lines: { marginTop: 4, marginBottom: 4 },
  line: { borderBottomWidth: 0.7, borderBottomColor: "#444", marginBottom: 10, height: 12 },
  signs: { flexDirection: "row", justifyContent: "space-between", marginTop: 18, gap: 24 },
  signCol: { flex: 1, fontSize: 9 },
  signLine: { marginTop: 18, borderBottomWidth: 0.7, borderBottomColor: "#333", marginBottom: 4 },
  pageFooter: {
    position: "absolute",
    bottom: 14,
    left: 36,
    right: 36,
    fontSize: 7,
    color: "#444",
    textAlign: "right",
  },
});

function Lines({ count = 3 }: { count?: number }) {
  return (
    <View style={s.lines}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={s.line} />
      ))}
    </View>
  );
}

const rub = (n: number) => `${n.toLocaleString("ru-RU")} руб.`;
const dots = (v: string | Date | null | undefined, fallback = "—") => (v ? formatDateDots(v) : fallback);

/** Акт выполненных работ: строится по факту выполнения (ТЗ §14.3), а не по предварительной записи. */
export function CompletedWorksActPdf(props: ActDocInput) {
  const fio = formatFioForAct(props);
  const flags = serviceFlags(props.serviceType);
  const price = formatPriceLine(props.priceRub);
  const blankDate = "_".repeat(12);
  const contractDate = props.contractDate ? formatDateDots(props.contractDate) : blankDate;
  const acceptanceDate = props.acceptanceDate ? formatDateDots(props.acceptanceDate) : blankDate;
  const actDate = formatDateDots(props.actDate ?? props.endsAt);
  const missing = props.draftMissing ?? [];
  const works = props.works ?? [];
  const pricing = props.pricing;
  const actual = pricing?.actual;
  const exec = props.execution;
  const h = props.handover;
  const recv = props.inspection?.inspection;
  const year = props.year?.trim()
    ? props.year.trim().endsWith("г")
      ? props.year.trim()
      : `${props.year.trim()} г`
    : "__________ г";

  // Разделение перечней (ТЗ §13.3): выполненное основное, согласованные допработы, отменённое/отклонённое
  const items = exec?.items ?? [];
  const main = items.filter((i) => i.kind === "AGREED" && i.status !== "CANCELLED");
  const extras = items.filter((i) => i.kind === "EXTRA" && i.approval?.status === "APPROVED" && i.status !== "CANCELLED");
  const notDone = items.filter(
    (i) => (i.kind === "AGREED" && i.status === "CANCELLED") || (i.kind === "EXTRA" && (i.approval?.status === "REJECTED" || i.status === "CANCELLED")),
  );

  const mileage =
    h?.mileageKm != null && h.mileageKm !== recv?.mileageKm
      ? `при приёмке ${recv?.mileageKm ?? "—"} км; при выдаче ${h.mileageKm} км`
      : recv?.mileageKm != null
        ? `${recv.mileageKm} км`
        : `${"_".repeat(8)} км`;
  const fuel =
    h?.fuelPercent != null && h.fuelPercent !== recv?.fuelPercent
      ? `при приёмке ${recv?.fuelPercent ?? "—"} %; при выдаче ${h.fuelPercent} %`
      : recv?.fuelPercent != null
        ? `${recv.fuelPercent} %`
        : `${"_".repeat(8)} %`;

  const workLine = (i: (typeof items)[number], n: number) => (
    <View key={i.id} style={s.item} wrap={false}>
      <Text>
        {n}. {i.title}
        {i.priceRub != null ? ` — ${rub(i.priceRub)}` : ""}
        {i.status !== "DONE" ? ` [${WORK_STATUS_LABEL[i.status].toLowerCase()}]` : ""}
      </Text>
      {i.kind === "EXTRA" && i.comment ? <Text style={s.note}>Обнаруженный дефект: {i.comment}{i.defectPlace ? ` (${i.defectPlace})` : ""}</Text> : null}
      {i.kind === "AGREED" && i.comment ? <Text style={s.note}>{i.comment}</Text> : null}
      <Text style={s.note}>
        {i.actualVolume ? `Объём: ${i.actualVolume}. ` : ""}
        {i.masterName ? `Мастер: ${i.masterName}. ` : ""}
        {i.finishedAt ? `Выполнено: ${formatDateTimeRu(i.finishedAt)}.` : ""}
        {i.photosBefore + i.photosAfter > 0 ? ` Фото до/после: ${i.photosBefore}/${i.photosAfter}.` : ""}
      </Text>
      {i.kind === "EXTRA" && i.approval?.status === "APPROVED" ? (
        <Text style={s.note}>
          Согласовано с Заказчиком: {i.approval.approvedAt ? formatDateTimeRu(i.approval.approvedAt) : "—"}
          {i.approval.channel ? `, ${APPROVAL_CHANNEL_LABEL[i.approval.channel].toLowerCase()}` : ""}
          {i.approval.approvedBy ? `, принял: ${i.approval.approvedBy}` : ""}
          {i.approval.note ? ` (${i.approval.note})` : ""}.
        </Text>
      ) : null}
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={s.page} wrap>
        <View style={s.body}>
          {props.draft === true && (
            <View style={s.draft}>
              <Text style={{ fontWeight: "bold" }}>ЧЕРНОВИК — документ не готов к подписанию.</Text>
              <Text>
                {missing.length > 0
                  ? `Не заполнено: ${missing.join("; ")}.`
                  : "Предварительный просмотр: документ ещё не сформирован."}
              </Text>
            </View>
          )}
          <Text style={s.title}>АКТ ВЫПОЛНЕННЫХ РАБОТ</Text>
          <Text style={s.subtitle}>
            к Договору № {props.contractNumber} от {contractDate} г.{"\n"}и Акту приёма-передачи транспортного средства от {acceptanceDate} г.
          </Text>

          <View style={s.parties}>
            <View style={s.partyCol}>
              <Text style={s.partyLabel}>Исполнитель:</Text>
              <Text style={s.companyLine}>{props.issuer.title}</Text>
              <Text style={s.companyLine}>{props.issuer.branchAddress}</Text>
              <Text style={s.companyLine}>Адрес юридического лица: {props.issuer.legalAddress}</Text>
              <Text style={s.companyLine}>Почта: {props.issuer.email}</Text>
              <Text style={s.companyLine}>Телефон: {props.issuer.phone}</Text>
              <Text style={s.companyLine}>ИНН: {props.issuer.inn}</Text>
              <Text style={s.companyLine}>ОГРН/ОГРНИП: {props.issuer.ogrnip}</Text>
            </View>
            <View style={s.partyCol}>
              <Text style={s.partyLabel}>Заказчик:</Text>
              <Text>{fio}</Text>
            </View>
          </View>

          <View style={s.hr} />
          <Text style={s.sectionTitle}>1. ДАННЫЕ ТРАНСПОРТНОГО СРЕДСТВА</Text>
          <Text style={s.row}>Марка, модель: {blank(props.carModel, 36)}</Text>
          <Text style={s.row}>Гос. номер: {blank(props.plate, 18)}</Text>
          <Text style={s.row}>VIN: {blank(props.vin, 24)}</Text>
          <Text style={s.row}>Год выпуска: {year}</Text>
          <Text style={s.row}>Пробег: {mileage}</Text>
          <Text style={s.row}>Уровень топлива: {fuel}</Text>

          <View style={s.hr} />
          <Text style={s.sectionTitle}>2. ВЫПОЛНЕННЫЕ РАБОТЫ</Text>
          {exec ? (
            <View>
              <Text style={s.row}>
                Период выполнения: с {exec.startedAt ? formatDateTimeRu(exec.startedAt) : "—"} по{" "}
                {exec.finishedAt ? formatDateTimeRu(exec.finishedAt) : "—"}
              </Text>
              {main.length > 0 ? (
                <View>
                  <Text style={s.subTitle}>Работы по договору</Text>
                  {main.map((i, n) => workLine(i, n + 1))}
                </View>
              ) : null}
              <Text style={s.subTitle}>Дополнительные работы, согласованные с Заказчиком</Text>
              {extras.length > 0 ? extras.map((i, n) => workLine(i, n + 1)) : <Text style={s.row}>нет</Text>}
              {notDone.length > 0 ? (
                <View>
                  <Text style={s.subTitle}>Не выполнялись (отменены по согласованию или отклонены Заказчиком)</Text>
                  {notDone.map((i, n) => (
                    <Text key={i.id} style={s.row}>
                      {n + 1}. {i.title}
                      {i.workNote ? ` — ${i.workNote}` : ""}
                    </Text>
                  ))}
                </View>
              ) : null}
            </View>
          ) : works.length > 0 ? (
            <View>
              {works.map((w, i) => (
                <View key={w.id} style={s.check} wrap={false}>
                  <Text>
                    {i + 1}. {w.title}
                    {w.comment ? ` — ${w.comment}` : ""}
                    {w.priceRub != null ? ` — ${rub(w.priceRub)}` : ""}
                  </Text>
                </View>
              ))}
              <Text style={{ ...s.check, marginTop: 3 }}>Дополнительные работы: нет</Text>
            </View>
          ) : (
            <View>
              <Text style={s.check}>{box(flags.anticor)} Антикоррозийная обработка;</Text>
              <Text style={s.check}>{box(flags.mechanical)} Механическая очистка коррозии;</Text>
              <Text style={s.check}>{box(flags.laser)} Лазерная очистка коррозии;</Text>
              <Text style={s.check}>{box(flags.welding)} Сварочные работы;</Text>
              <Text style={s.check}>{box(false)} Дополнительные работы:</Text>
              <Lines count={3} />
            </View>
          )}

          <View style={s.hr} />
          <Text style={s.sectionTitle}>3. СТОИМОСТЬ РАБОТ</Text>
          {actual ? (
            <View>
              <Text style={s.row}>
                Предварительная стоимость по договору: {pricing?.preliminary != null ? rub(pricing.preliminary) : "не определена"}
              </Text>
              <Text style={s.row}>Основные выполненные работы: {actual.main != null ? rub(actual.main) : "не определена"}</Text>
              <Text style={s.row}>Дополнительные работы: {actual.extras != null ? rub(actual.extras) : "не определена"}</Text>
              <Text style={s.row}>
                Скидка:{" "}
                {actual.discountRub > 0
                  ? `${pricing?.discountPercent != null ? `${pricing.discountPercent}% = ` : ""}${rub(actual.discountRub)}`
                  : "нет"}
              </Text>
              <Text style={{ ...s.row, fontWeight: "bold", marginTop: 4 }}>
                ИТОГОВАЯ СТОИМОСТЬ: {actual.total != null ? rub(actual.total) : "не определена"}
              </Text>
              {actual.total != null ? <Text style={s.row}>({rublesInWordsRu(actual.total)})</Text> : null}
              <Text style={s.row}>
                Получено: {rub(actual.paidRub)}; остаток: {actual.remaining != null ? rub(actual.remaining) : "не определён"}
              </Text>
            </View>
          ) : (
            <View>
              <Text style={s.row}>
                Предварительная стоимость работ составляет:{" "}
                {pricing ? (pricing.preliminary != null ? rub(pricing.preliminary) : "не определена") : price.digits}
              </Text>
              {pricing?.preliminary != null ? (
                <Text style={s.row}>({rublesInWordsRu(pricing.preliminary)})</Text>
              ) : !pricing ? (
                <Text style={s.row}>{price.words}</Text>
              ) : null}
              <Text style={s.row}>
                Скидка:{" "}
                {pricing && pricing.discountRub > 0
                  ? `${pricing.discountPercent != null ? `${pricing.discountPercent}% = ` : ""}${rub(pricing.discountRub)}`
                  : "нет"}
              </Text>
              <Text style={{ ...s.row, fontWeight: "bold", marginTop: 4 }}>
                ИТОГОВАЯ СТОИМОСТЬ:{" "}
                {pricing ? (pricing.agreedTotal != null ? rub(pricing.agreedTotal) : "не определена") : price.digits}
              </Text>
              {pricing?.agreedTotal != null ? (
                <Text style={s.row}>({rublesInWordsRu(pricing.agreedTotal)})</Text>
              ) : !pricing ? (
                <Text style={s.row}>{price.words}</Text>
              ) : null}
              {pricing ? (
                <Text style={s.row}>
                  Получено: {rub(pricing.paidRub)}; остаток: {pricing.remaining != null ? rub(pricing.remaining) : "не определён"}
                </Text>
              ) : null}
            </View>
          )}
          <Text style={{ marginTop: 6, marginBottom: 4 }}>Способ оплаты:</Text>
          <Text style={s.check}>{box(pricing?.paymentMethod === "CASH")} Наличные;</Text>
          <Text style={s.check}>{box(pricing?.paymentMethod === "CARD_SBP")} Оплата банковской картой / СБП;</Text>
          <Text style={s.check}>{box(pricing?.paymentMethod === "INVOICE_IP")} Оплата по договору с ИП.</Text>

          <View style={s.hr} />
          <Text style={s.sectionTitle}>4. РЕЗУЛЬТАТ ВЫПОЛНЕННЫХ РАБОТ</Text>
          <Text style={s.row}>
            Работы выполнены в полном объёме в соответствии с условиями договора. Транспортное средство осмотрено Заказчиком.
          </Text>

          <View style={s.hr} />
          <Text style={s.sectionTitle}>5. ПРИЁМКА ТРАНСПОРТНОГО СРЕДСТВА</Text>
          <Text style={{ fontWeight: "bold", marginBottom: 4 }}>Заказчик подтверждает, что:</Text>
          <Text style={s.row}>— автомобиль получен;</Text>
          <Text style={s.row}>— результат выполненных работ осмотрен;</Text>
          <Text style={s.row}>— объём работ соответствует согласованному;</Text>
          <Text style={s.row}>— транспортное средство получено в исправном состоянии;</Text>
          <Text style={s.row}>
            — видимых повреждений и претензий к качеству, объёму и срокам выполненных работ не имеет.
          </Text>
          <Text style={s.row}>
            Претензии к узлам, агрегатам, элементам кузова и системам автомобиля, не связанным с выполненными работами, не принимаются.
          </Text>
          <Text style={s.row}>
            Качество выполненных работ определяется соблюдением технологии обработки и фактом нанесения защитных материалов, а не
            субъективной оценкой внешнего вида автомобиля.
          </Text>

          <View style={s.hr} />
          <Text style={s.sectionTitle}>6. ГАРАНТИЯ</Text>
          <Text style={s.row}>Заказчику выдана гарантийная книжка:</Text>
          <Text style={s.check}>
            {box(h?.warrantyBookIssued === true)} Да {"   "} {box(h?.warrantyBookIssued === false)} Нет
          </Text>
          <Text style={s.row}>
            Гарантийные условия разъяснены Заказчику: {box(h?.warrantyTermsExplained === true)} да {"  "}
            {box(h?.warrantyTermsExplained === false)} нет
          </Text>
          {h?.warrantyBookIssued === true ? (
            <Text style={s.row}>
              Срок гарантии: {h.warrantyMonths != null ? `${h.warrantyMonths} мес.` : "не указан"}; начало срока:{" "}
              {dots(h.warrantyStartsAt, "не указано")}.
            </Text>
          ) : null}
          {h?.warrantyTerms?.trim() ? <Text style={s.row}>Индивидуальные условия гарантии: {h.warrantyTerms.trim()}</Text> : null}
          {h?.careRecommendations?.trim() ? (
            <Text style={s.row}>Рекомендации по ежегодной профилактике: {h.careRecommendations.trim()}</Text>
          ) : null}

          <View style={s.hr} />
          <Text style={s.sectionTitle}>7. ПЕРЕДАЧА ТРАНСПОРТНОГО СРЕДСТВА</Text>
          <Text style={s.row}>
            Дата и время выдачи: {h?.issuedAt ? formatDateTimeRu(h.issuedAt) : `${"_".repeat(10)} г.  ${"_".repeat(5)}`}
          </Text>
          <Text style={s.row}>
            Автомобиль выдал: {h?.issuedByName ?? "_".repeat(18)}
          </Text>
          <Text style={s.row}>
            С момента подписания настоящего Акта транспортное средство считается переданным Заказчику, и ответственность за дальнейшую
            эксплуатацию и сохранность автомобиля переходит к Заказчику.
          </Text>
          <Text style={s.row}>
            Заказчик уведомлён и согласен, что антикоррозийная обработка не направлена на восстановление внешнего вида транспортного
            средства и может сопровождаться технологическими особенностями, включая возможное наличие остаточного запаха материалов,
            вытекание защитного состава из скрытых полостей, наличие следов обработочных материалов, а также изменение внешнего вида
            технологических зон автомобиля, не влияющее на защитные свойства покрытия.
          </Text>

          <View style={s.hr} />
          <View wrap={false}>
            <Text style={s.sectionTitle}>8. ПОДПИСИ СТОРОН</Text>
            <View style={s.signs}>
              <View style={s.signCol}>
                <Text style={{ fontWeight: "bold" }}>Исполнитель</Text>
                <View style={s.signLine} />
                <Text>/{props.issuer.signerName}/</Text>
                <Text style={{ marginTop: 12 }}>Сотрудник, выдавший автомобиль</Text>
                <View style={s.signLine} />
                <Text>/{h?.issuedByName ?? "_".repeat(18)}/</Text>
              </View>
              <View style={s.signCol}>
                <Text style={{ fontWeight: "bold" }}>Заказчик</Text>
                <View style={s.signLine} />
                <Text>/{fio}/</Text>
              </View>
            </View>
          </View>
        </View>

        <Text
          style={s.pageFooter}
          fixed
          render={({ pageNumber, totalPages }) =>
            `Акт выполненных работ к Договору № ${props.contractNumber} от ${actDate} г. · Стр. ${pageNumber} из ${totalPages}`
          }
        />
      </Page>
    </Document>
  );
}
