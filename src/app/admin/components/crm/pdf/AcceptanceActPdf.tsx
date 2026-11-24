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
import {
  DAMAGE_LABEL,
  DAMAGE_SYMBOL,
  INTERIOR_KEYS,
  INTERIOR_LABEL,
  NOT_CHECKED_WORD,
  SYSTEM_KEYS,
  SYSTEM_LABEL,
  SYSTEM_WORDS,
} from "../../../_lib/inspectionTypes";

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
    paddingBottom: 30,
    paddingHorizontal: 28,
    fontSize: 9,
    fontFamily: "DejaVu",
    color: "#111",
  },
  /** lineHeight (свой или унаследованный от Page) ломает колонтитул `render` с номерами страниц — держим его на внутреннем блоке. */
  body: { fontSize: 9, lineHeight: 1.3 },
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
  draft: {
    borderWidth: 1,
    borderColor: "#b00020",
    padding: 5,
    marginBottom: 6,
    color: "#b00020",
    fontSize: 8,
  },
  diagramBox: { width: DIAGRAM_W, height: DIAGRAM_H, position: "relative" },
  markDot: {
    position: "absolute",
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#fff",
    borderWidth: 0.9,
    borderColor: "#c00000",
    alignItems: "center",
    justifyContent: "center",
  },
  markText: { fontSize: 6.5, fontWeight: "bold", color: "#c00000", lineHeight: 1 },
  note: { marginBottom: 3 },
  pageFooter: {
    position: "absolute",
    bottom: 10,
    left: 28,
    right: 28,
    fontSize: 7,
    color: "#444",
    textAlign: "right",
  },
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

function Optional({ label, value }: { label: string; value?: string | null }) {
  return (
    <Text style={s.note}>
      {label}: {value?.trim() ? value.trim() : "нет"}
    </Text>
  );
}

function fmtNum(value: number | null | undefined, unit: string, width: number) {
  return value == null ? `${"_".repeat(width)} ${unit}` : `${value} ${unit}`;
}

export function AcceptanceActPdf(props: ActDocInput) {
  const fio = formatFioForAct(props);
  const contractDate = props.contractDate
    ? formatDateDots(props.contractDate)
    : "_".repeat(12);
  const view = props.inspection ?? null;
  const insp = view?.inspection ?? null;
  const marks = view?.marks ?? [];
  const isDraft = props.draft === true;
  const missing = props.draftMissing ?? [];

  const receivedAt = insp?.receivedAt ?? props.startsAt;
  const d = new Date(receivedAt);
  const dayMonth = `г. ${props.issuer.city} ${d.getDate()} ${MONTHS_GEN_UPPER[d.getMonth()]}`;
  const yearLabel = `${d.getFullYear()}г.`;
  const year = props.year?.trim()
    ? props.year.trim().endsWith("г")
      ? props.year.trim()
      : `${props.year.trim()} г`
    : `${"_".repeat(8)} г`;
  const receiver = insp?.receivedBy?.fullName ?? "_".repeat(18);

  return (
    <Document>
      <Page size="A4" style={s.page} wrap>
        <View style={s.body}>
        {isDraft && (
          <View style={s.draft}>
            <Text style={{ fontWeight: "bold" }}>
              ЧЕРНОВИК — документ не готов к подписанию.
            </Text>
            <Text>
              {missing.length > 0
                ? `Не заполнено: ${missing.join("; ")}.`
                : "Предварительный просмотр: документ ещё не сформирован."}
            </Text>
          </View>
        )}

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
            <Text>{props.issuer.titleInBrackets}</Text>
            <Text>{props.issuer.branchAddress}</Text>
            <Text>ИНН: {props.issuer.inn}</Text>
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
        <View style={s.grid2} wrap={false}>
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
              Пробег на момент приёма: {fmtNum(insp?.mileageKm, "км", 8)}
            </Text>
            <Text style={s.row}>
              Количество переданных ключей: {fmtNum(insp?.keysCount, "шт.", 2)}
            </Text>
            <Text style={s.row}>
              Примерный уровень топлива: {fmtNum(insp?.fuelPercent, "%", 3)}
            </Text>
          </View>
        </View>

        <View style={s.hr} />
        <Text style={s.sectionTitle}>2. ВНЕШНЕЕ СОСТОЯНИЕ АВТОМОБИЛЯ</Text>
        <Text style={s.hint}>
          Схема автомобиля для фиксации повреждений ЛКП и кузовных элементов
        </Text>

        <View style={s.diagramRow} wrap={false}>
          <View style={s.diagramFrame}>
            <View style={s.diagramBox}>
              <Image
                src={actAsset("/templates/acts/car-diagram.png")}
                style={s.diagram}
              />
              {marks.map((m) => (
                <View
                  key={m.id}
                  style={[
                    s.markDot,
                    { left: m.x * DIAGRAM_W - 5.5, top: m.y * DIAGRAM_H - 5.5 },
                  ]}
                >
                  <Text style={s.markText}>{DAMAGE_SYMBOL[m.type]}</Text>
                </View>
              ))}
            </View>
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

        {marks.length > 0 ? (
          <View style={{ marginBottom: 3 }}>
            <Text style={{ fontWeight: "bold", marginBottom: 1 }}>
              Зафиксированные повреждения:
            </Text>
            {marks.map((m, i) => (
              <Text key={m.id} style={s.row}>
                {i + 1}. {DAMAGE_SYMBOL[m.type]} — {DAMAGE_LABEL[m.type]},{" "}
                {m.element}
                {m.note ? `: ${m.note}` : ""}
                {m.photos.length ? ` (фото: ${m.photos.length})` : ""}
              </Text>
            ))}
          </View>
        ) : insp?.noDefectsConfirmed ? (
          <Text style={s.note}>
            Повреждений ЛКП и кузовных элементов не обнаружено (подтверждено
            сотрудником при приёмке).
          </Text>
        ) : (
          <Text style={s.note}>
            Внешнее состояние не зафиксировано: повреждения не отмечены и их
            отсутствие не подтверждено.
          </Text>
        )}
        <Optional label="Дополнительные замечания" value={insp?.exteriorNote} />

        <View style={s.hr} />
        <Text style={s.sectionTitle}>3. СОСТОЯНИЕ САЛОНА</Text>
        {INTERIOR_KEYS.map((key) => {
          const flag = insp?.interior?.[key];
          return (
            <Text key={key} style={s.check}>
              {INTERIOR_LABEL[key]}: {box(flag === "NONE")} замечаний нет{"  "}
              {box(flag === "PRESENT")} есть замечания
            </Text>
          );
        })}
        <Optional label="Примечания" value={insp?.interiorNote} />

        <View style={s.hr} />
        <Text style={s.sectionTitle}>
          4. ПРОВЕРКА РАБОТОСПОСОБНОСТИ ДОСТУПНЫХ СИСТЕМ
        </Text>
        {SYSTEM_KEYS.map((key, i) => {
          const v = insp?.systems?.[key];
          const w = SYSTEM_WORDS[key];
          return (
            <View key={key} wrap={false}>
              <Text style={s.row}>
                {i + 1}. {SYSTEM_LABEL[key]}: {box(v?.status === "OK")} {w.OK}
                {"  "}
                {box(v?.status === "FAULTY")} {w.FAULTY}
                {"  "}
                {box(v?.status === "NOT_CHECKED")} {NOT_CHECKED_WORD}
              </Text>
              {v?.note ? <Text style={s.hint}>Комментарий: {v.note}</Text> : null}
            </View>
          );
        })}
        <Optional label="Примечания" value={insp?.systemsNote} />

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
        {insp?.specialTerms?.trim() ? (
          <Text style={s.row}>
            Индивидуально согласованные особенности: {insp.specialTerms.trim()}
          </Text>
        ) : null}
        {insp?.note?.trim() ? (
          <Text style={s.row}>Комментарий приёмщика: {insp.note.trim()}</Text>
        ) : null}
        <Text style={{ marginTop: 5, fontWeight: "bold" }}>
          Заказчик подтверждает, что:
        </Text>
        <Text style={s.row}>— из автомобиля изъяты личные вещи и ценности;</Text>
        <Text style={s.row}>— внешнее состояние автомобиля осмотрено;</Text>
        <Text style={s.row}>
          — имеющиеся дефекты зафиксированы настоящим актом.
        </Text>

        <View style={s.hr} />
        <View wrap={false}>
          <Text style={s.sectionTitle}>6. ПЕРЕДАЧА ТРАНСПОРТНОГО СРЕДСТВА</Text>
          <Text style={s.row}>
            Транспортное средство передано Исполнителю для выполнения работ по
            договору.
          </Text>
          <Text style={{ marginTop: 6 }}>
            Дата и время приёма: {formatDateTimeRu(receivedAt)}
          </Text>

          <View style={s.hr} />
          <View style={s.signs}>
            <View style={s.signCol}>
              <Text style={{ fontWeight: "bold" }}>Исполнитель</Text>
              <View style={s.signLine} />
              <Text>/{props.issuer.signerName}/</Text>
              <Text style={{ marginTop: 10 }}>Мастер-приёмщик</Text>
              <View style={s.signLine} />
              <Text>/{receiver}/</Text>
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
            `Акт приёма-передачи к Договору № ${props.contractNumber} · Стр. ${pageNumber} из ${totalPages}`
          }
        />
      </Page>
    </Document>
  );
}
