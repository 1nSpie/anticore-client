import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import {
  blank,
  box,
  formatDateDots,
  formatFioForAct,
  formatPriceLine,
  registerActFonts,
  serviceFlags,
  type ActDocInput,
} from "./actShared";

registerActFonts();

const s = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingBottom: 32,
    paddingHorizontal: 36,
    fontSize: 9,
    fontFamily: "DejaVu",
    color: "#111",
    lineHeight: 1.35,
  },
  title: {
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: { fontSize: 9, textAlign: "center", marginBottom: 10 },
  parties: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 8,
  },
  partyCol: { flex: 1 },
  partyLabel: { fontWeight: "bold", marginBottom: 2 },
  companyLine: { fontSize: 8, marginBottom: 1 },
  hr: {
    borderBottomWidth: 1,
    borderBottomColor: "#222",
    marginVertical: 8,
  },
  sectionTitle: { fontWeight: "bold", marginBottom: 6, fontSize: 10 },
  row: { marginBottom: 3 },
  check: { marginBottom: 4 },
  lines: { marginTop: 4, marginBottom: 4 },
  line: {
    borderBottomWidth: 0.7,
    borderBottomColor: "#444",
    marginBottom: 10,
    height: 12,
  },
  footerNote: { fontSize: 7.5, color: "#444", marginTop: 10, textAlign: "right" },
  signs: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
    gap: 24,
  },
  signCol: { flex: 1, fontSize: 9 },
  signLine: {
    marginTop: 18,
    borderBottomWidth: 0.7,
    borderBottomColor: "#333",
    marginBottom: 4,
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

export function CompletedWorksActPdf(props: ActDocInput) {
  const fio = formatFioForAct(props);
  const flags = serviceFlags(props.serviceType);
  const price = formatPriceLine(props.priceRub);
  const contractDate = formatDateDots(props.startsAt);
  const actDate = formatDateDots(props.endsAt);
  const year = props.year?.trim()
    ? props.year.trim().endsWith("г")
      ? props.year.trim()
      : `${props.year.trim()} г`
    : "__________ г";

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <Text style={s.title}>АКТ ВЫПОЛНЕННЫХ РАБОТ</Text>
        <Text style={s.subtitle}>
          к Договору № {props.contractNumber} от {contractDate} г.{"\n"}и Акту
          приёма-передачи транспортного средства от {actDate} г.
        </Text>

        <View style={s.parties}>
          <View style={s.partyCol}>
            <Text style={s.partyLabel}>Исполнитель:</Text>
            <Text style={s.companyLine}>
              ИП Стражников А.Л. ; АванКор Жуковский
            </Text>
            <Text style={s.companyLine}>
              140180, обл Московская, г.Жуковский, ул Речной проезд 14
            </Text>
            <Text style={s.companyLine}>
              Адрес юридического лица: 140181, обл Московская, г Жуковский, ул
              Маяковского, д. 20, кв. 55
            </Text>
            <Text style={s.companyLine}>Почта: anticorpower@mail.ru</Text>
            <Text style={s.companyLine}>Телефон: +7(993)-245-68-82</Text>
            <Text style={s.companyLine}>ИНН: 504032243409</Text>
            <Text style={s.companyLine}>ОГРН/ОГРНИП: 321508100480776</Text>
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
        <Text style={s.row}>Уровень топлива: {"_".repeat(8)} %</Text>
        <Text style={s.row}>Год выпуска: {year}</Text>

        <View style={s.hr} />
        <Text style={s.sectionTitle}>2. ВЫПОЛНЕННЫЕ РАБОТЫ</Text>
        <Text style={s.check}>
          {box(flags.anticor)} Антикоррозийная обработка;
        </Text>
        <Text style={s.check}>
          {box(flags.mechanical)} Механическая очистка коррозии;
        </Text>
        <Text style={s.check}>
          {box(flags.laser)} Лазерная очистка коррозии;
        </Text>
        <Text style={s.check}>{box(flags.welding)} Сварочные работы;</Text>
        <Text style={s.check}>{box(false)} Дополнительные работы:</Text>
        <Lines count={3} />

        <View style={s.hr} />
        <Text style={s.sectionTitle}>3. СТОИМОСТЬ РАБОТ</Text>
        <Text style={s.row}>
          Предварительная стоимость работ составляет: {price.digits}
        </Text>
        <Text style={s.row}>{price.words}</Text>
        <Text style={s.row}>
          Дополнительные работы: {"_".repeat(16)} руб.
        </Text>
        <Text style={{ ...s.row, fontWeight: "bold", marginTop: 4 }}>
          ИТОГОВАЯ СТОИМОСТЬ: {price.digits}
        </Text>
        <Text style={s.row}>{price.words}</Text>
        <Text style={{ marginTop: 6, marginBottom: 4 }}>Способ оплаты:</Text>
        <Text style={s.check}>{box(false)} Наличные;</Text>
        <Text style={s.check}>{box(false)} Оплата банковской картой / СБП;</Text>
        <Text style={s.check}>{box(false)} Оплата по договору с ИП.</Text>

        <View style={s.hr} />
        <Text style={s.sectionTitle}>4. РЕЗУЛЬТАТ ВЫПОЛНЕННЫХ РАБОТ</Text>
        <Text style={s.row}>
          Работы выполнены в полном объёме в соответствии с условиями договора.
          Транспортное средство осмотрено Заказчиком.
        </Text>
        <Text style={s.footerNote}>Акт выполненных работ от {actDate} г.</Text>
      </Page>

      <Page size="A4" style={s.page}>
        <Text style={s.sectionTitle}>5. ПРИЁМКА ТРАНСПОРТНОГО СРЕДСТВА</Text>
        <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
          Заказчик подтверждает, что:
        </Text>
        <Text style={s.row}>— автомобиль получен;</Text>
        <Text style={s.row}>— результат выполненных работ осмотрен;</Text>
        <Text style={s.row}>— объём работ соответствует согласованному;</Text>
        <Text style={s.row}>
          — транспортное средство получено в исправном состоянии;
        </Text>
        <Text style={s.row}>
          — видимых повреждений и претензий к качеству, объёму и срокам
          выполненных работ не имеет.
        </Text>
        <Text style={s.row}>
          Претензии к узлам, агрегатам, элементам кузова и системам автомобиля,
          не связанным с выполненными работами, не принимаются.
        </Text>
        <Text style={s.row}>
          Качество выполненных работ определяется соблюдением технологии
          обработки и фактом нанесения защитных материалов, а не субъективной
          оценкой внешнего вида автомобиля.
        </Text>

        <View style={s.hr} />
        <Text style={s.sectionTitle}>6. ГАРАНТИЯ</Text>
        <Text style={s.row}>Заказчику выдана гарантийная книжка:</Text>
        <Text style={s.check}>
          {box(false)} Да {"   "} {box(false)} Нет
        </Text>
        <Text style={s.row}>Гарантийные условия разъяснены Заказчику.</Text>

        <View style={s.hr} />
        <Text style={s.sectionTitle}>7. ПЕРЕДАЧА ТРАНСПОРТНОГО СРЕДСТВА</Text>
        <Text style={s.row}>
          Дата выдачи: {"_".repeat(10)} г.
        </Text>
        <Text style={s.row}>
          Время выдачи: {"_".repeat(5)}
        </Text>
        <Text style={s.row}>
          С момента подписания настоящего Акта транспортное средство считается
          переданным Заказчику, и ответственность за дальнейшую эксплуатацию и
          сохранность автомобиля переходит к Заказчику.
        </Text>
        <Text style={s.row}>
          Заказчик уведомлён и согласен, что антикоррозийная обработка не
          направлена на восстановление внешнего вида транспортного средства и
          может сопровождаться технологическими особенностями, включая возможное
          наличие остаточного запаха материалов, вытекание защитного состава из
          скрытых полостей, наличие следов обработочных материалов, а также
          изменение внешнего вида технологических зон автомобиля, не влияющее на
          защитные свойства покрытия.
        </Text>

        <View style={s.hr} />
        <Text style={s.sectionTitle}>8. ПОДПИСИ СТОРОН</Text>
        <View style={s.signs}>
          <View style={s.signCol}>
            <Text style={{ fontWeight: "bold" }}>Исполнитель</Text>
            <View style={s.signLine} />
            <Text>/Стражников А.Л./</Text>
            <Text style={{ marginTop: 12 }}>Мастер-приёмщик</Text>
            <View style={s.signLine} />
            <Text>/{"_".repeat(18)}/</Text>
          </View>
          <View style={s.signCol}>
            <Text style={{ fontWeight: "bold" }}>Заказчик</Text>
            <View style={s.signLine} />
            <Text>/{fio}/</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
