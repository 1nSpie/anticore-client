import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import {
  blank,
  box,
  formatDateDots,
  formatDateTimeRu,
  formatFioForAct,
  actAsset,
  registerActFonts,
  type ActDocInput,
} from "./actShared";

registerActFonts();

const MONTHS_GEN_UPPER = [
  "ЯНВАРЯ",
  "ФЕВРАЛЯ",
  "МАРТА",
  "АПРЕЛЯ",
  "МАЯ",
  "ИЮНЯ",
  "ИЮЛЯ",
  "АВГУСТА",
  "СЕНТЯБРЯ",
  "ОКТЯБРЯ",
  "НОЯБРЯ",
  "ДЕКАБРЯ",
] as const;

/** Схема 1255×751 — только width, высота по пропорции. */
const DIAGRAM_W = 390;
const DIAGRAM_H = Math.round((DIAGRAM_W * 751) / 1255);

const s = StyleSheet.create({
  page: {
    paddingTop: 20,
    paddingBottom: 22,
    paddingHorizontal: 28,
    fontSize: 9,
    fontFamily: "DejaVu",
    color: "#111",
    lineHeight: 1.3,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  logo: { width: 40, height: 46 },
  cityDateCol: { alignItems: "flex-end", maxWidth: 210 },
  cityDate: { fontSize: 9, textAlign: "right" },
  title: {
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 3,
  },
  subtitle: { fontSize: 9, textAlign: "center", marginBottom: 8 },
  parties: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 6,
  },
  partyCol: { width: "48%" },
  partyLabel: { fontWeight: "bold", marginBottom: 2 },
  intro: { marginBottom: 5, fontSize: 8.5 },
  hr: {
    borderBottomWidth: 0.8,
    borderBottomColor: "#222",
    borderStyle: "dashed",
    marginVertical: 5,
  },
  sectionTitle: { fontWeight: "bold", marginBottom: 4, fontSize: 10 },
  grid2: { flexDirection: "row", gap: 14, marginBottom: 2 },
  col: { flex: 1 },
  row: { marginBottom: 2.5 },
  hint: { fontSize: 8, marginBottom: 2 },
  diagramRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 2,
    marginBottom: 4,
  },
  diagramFrame: {
    borderWidth: 0.7,
    borderColor: "#333",
    padding: 3,
    width: DIAGRAM_W + 6,
  },
  diagram: { width: DIAGRAM_W, height: DIAGRAM_H },
  legend: { width: 120, fontSize: 8, lineHeight: 1.5, paddingTop: 2 },
  legendTitle: { fontWeight: "bold", marginBottom: 2 },
  lines: { marginTop: 2, marginBottom: 2 },
  line: {
    borderBottomWidth: 0.7,
    borderBottomColor: "#444",
    marginBottom: 8,
    height: 10,
  },
  check: { marginBottom: 2 },
  footerNote: { fontSize: 7, color: "#444", marginTop: 6, textAlign: "right" },
  signs: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 24,
  },
  signCol: { flex: 1, fontSize: 9 },
  signLine: {
    marginTop: 14,
    borderBottomWidth: 0.7,
    borderBottomColor: "#333",
    marginBottom: 3,
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

export function AcceptanceActPdf(props: ActDocInput) {
  const fio = formatFioForAct(props);
  const contractDate = formatDateDots(props.startsAt);
  const d =
    props.startsAt instanceof Date
      ? props.startsAt
      : new Date(props.startsAt);
  const dayMonth = `г. Жуковский ${d.getDate()} ${MONTHS_GEN_UPPER[d.getMonth()]}`;
  const yearLabel = `${d.getFullYear()}г.`;
  const year = props.year?.trim()
    ? props.year.trim().endsWith("г")
      ? props.year.trim()
      : `${props.year.trim()} г`
    : `${"_".repeat(8)} г`;

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.topRow}>
          <Image
            src={actAsset("/templates/acts/avancor-logo.png")}
            style={s.logo}
          />
          <View style={s.cityDateCol}>
            <Text style={s.cityDate}>
              {dayMonth} {yearLabel}
            </Text>
          </View>
        </View>

        <Text style={s.title}>АКТ ПРИЁМА-ПЕРЕДАЧИ ТРАНСПОРТНОГО СРЕДСТВА</Text>
        <Text style={s.subtitle}>
          к Договору № {props.contractNumber} от {contractDate} г.
        </Text>

        <View style={s.parties}>
          <View style={s.partyCol}>
            <Text style={s.partyLabel}>Исполнитель:</Text>
            <Text>ИП Стражников А.Л. (АванКор Жуковский)</Text>
          </View>
          <View style={s.partyCol}>
            <Text style={s.partyLabel}>Заказчик:</Text>
            <Text>{fio}</Text>
          </View>
        </View>

        <Text style={s.intro}>
          Настоящие Стороны подтверждают передачу транспортного средства
          Исполнителю для выполнения работ по антикоррозийной обработке и
          сопутствующим работам.
        </Text>

        <View style={s.hr} />
        <Text style={s.sectionTitle}>1. ДАННЫЕ ТРАНСПОРТНОГО СРЕДСТВА</Text>
        <View style={s.grid2}>
          <View style={s.col}>
            <Text style={s.row}>
              Марка, модель : {blank(props.carModel, 28)}
            </Text>
            <Text style={s.row}>Гос номер: {blank(props.plate, 16)}</Text>
            <Text style={s.row}>VIN: {blank(props.vin, 20)}</Text>
            <Text style={s.row}>Год выпуска: {year}</Text>
          </View>
          <View style={s.col}>
            <Text style={s.row}>
              Пробег на момент приёма: {"_".repeat(8)} км
            </Text>
            <Text style={s.row}>Количество переданных ключей: 1 шт.</Text>
            <Text style={s.row}>
              Примерный уровень топлива: {"_".repeat(3)} %
            </Text>
          </View>
        </View>

        <View style={s.hr} />
        <Text style={s.sectionTitle}>2. ВНЕШНЕЕ СОСТОЯНИЕ АВТОМОБИЛЯ</Text>
        <Text style={s.hint}>
          Схема автомобиля для фиксации повреждений ЛКП и кузовных элементов
        </Text>
        <Text style={s.hint}>
          (отметить дефекты, указать характер повреждения и зону)
        </Text>

        <View style={s.diagramRow} wrap={false}>
          <View style={s.diagramFrame}>
            <Image
              src={actAsset("/templates/acts/car-diagram.png")}
              style={s.diagram}
            />
          </View>
          <View style={s.legend}>
            <Text style={s.legendTitle}>Обозначения:</Text>
            <Text>X — царапина</Text>
            <Text>O — вмятина</Text>
            <Text>K — коррозия</Text>
            <Text>S — скол</Text>
            <Text>D — иное повреждение</Text>
          </View>
        </View>

        <Text>Дополнительные замечания:</Text>
        <Lines count={3} />

        <View style={s.hr} />
        <Text style={s.sectionTitle}>3. СОСТОЯНИЕ САЛОНА</Text>
        <Text style={s.check}>{box(false)} Загрязнения салона</Text>
        <Text style={s.check}>
          {box(false)} Повреждения элементов интерьера
        </Text>
        <Text style={s.check}>{box(false)} Повреждения обивки</Text>
        <Text style={s.check}>{box(false)} Посторонние запахи</Text>
        <Text style={{ marginTop: 4 }}>Примечания:</Text>
        <Lines count={1} />
        <Text style={s.footerNote}>
          Акт приёма-передачи транспортного средства к Договору №{" "}
          {props.contractNumber} · Стр. 1 из 2
        </Text>
      </Page>

      <Page size="A4" style={s.page}>
        <Text style={s.sectionTitle}>
          4. ПРОВЕРКА РАБОТОСПОСОБНОСТИ ДОСТУПНЫХ СИСТЕМ
        </Text>
        <Text style={s.row}>1. Световые приборы: исправны / неисправны</Text>
        <Text style={s.row}>2. Поворотники: исправны / неисправны</Text>
        <Text style={s.row}>3. Стоп-сигналы: исправны / неисправны</Text>
        <Text style={s.row}>4. Стеклоочистители: исправны / неисправны</Text>
        <Text style={s.row}>5. Звуковой сигнал: исправен / неисправен</Text>
        <Text style={s.row}>
          6. Климатическая система: исправна / неисправна
        </Text>
        <Text style={s.row}>
          7. Скорости вентилятора печки: исправны / неисправны
        </Text>
        <Text style={s.row}>
          8. Приборная панель (ошибки): отсутствуют / имеются
        </Text>
        <Text style={{ marginTop: 5 }}>Примечания:</Text>
        <Lines count={3} />

        <View style={s.hr} />
        <Text style={s.sectionTitle}>5. УСЛОВИЯ ПРИЁМА ТРАНСПОРТНОГО СРЕДСТВА</Text>
        <Text style={s.row}>
          Автомобиль принят Исполнителем без полной разборки, демонтажа
          элементов кузова и дефектовки скрытых полостей.
        </Text>
        <Text style={s.row}>
          Скрытые коррозионные повреждения, эксплуатационный износ, ранее
          выполненные ремонты либо восстановленные элементы кузова могут быть
          выявлены только в процессе выполнения работ.
        </Text>
        <Text style={s.row}>
          Исполнитель вправе осуществлять фото- и видеофиксацию состояния
          транспортного средства.
        </Text>
        <Text style={{ marginTop: 5, fontWeight: "bold" }}>
          Заказчик подтверждает, что:
        </Text>
        <Text style={s.row}>— из автомобиля изъяты личные вещи и ценности;</Text>
        <Text style={s.row}>— внешнее состояние автомобиля осмотрено;</Text>
        <Text style={s.row}>
          — имеющиеся дефекты зафиксированы настоящим актом.
        </Text>

        <View style={s.hr} />
        <Text style={s.sectionTitle}>6. ПЕРЕДАЧА ТРАНСПОРТНОГО СРЕДСТВА</Text>
        <Text style={s.row}>
          Транспортное средство передано Исполнителю для выполнения работ по
          договору.
        </Text>
        <Text style={{ marginTop: 6 }}>
          Дата и время приёма: {formatDateTimeRu(props.startsAt)}
        </Text>

        <View style={s.hr} />
        <View style={s.signs}>
          <View style={s.signCol}>
            <Text style={{ fontWeight: "bold" }}>Исполнитель</Text>
            <View style={s.signLine} />
            <Text>/Стражников А.Л./</Text>
            <Text style={{ marginTop: 10 }}>Мастер-приёмщик</Text>
            <View style={s.signLine} />
            <Text>/{"_".repeat(18)}/</Text>
          </View>
          <View style={s.signCol}>
            <Text style={{ fontWeight: "bold" }}>Заказчик</Text>
            <View style={s.signLine} />
            <Text>/{fio}/</Text>
          </View>
        </View>
        <Text style={s.footerNote}>
          Акт приёма-передачи к Договору № {props.contractNumber} · Стр. 2 из 2
        </Text>
      </Page>
    </Document>
  );
}
