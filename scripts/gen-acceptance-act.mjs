/**
 * Visual QA for AcceptanceActPdf — mirrors production layout.
 * Run: node scripts/gen-acceptance-act.mjs
 */
import React from "react";
import { writeFileSync } from "fs";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
  pdf,
} from "@react-pdf/renderer";

const cwd = process.cwd();
const asset = (p) => `${cwd}/public${p}`;

Font.register({
  family: "DejaVu",
  fonts: [
    { src: asset("/fonts/DejaVuSans.ttf"), fontWeight: "normal" },
    { src: asset("/fonts/DejaVuSans-Bold.ttf"), fontWeight: "bold" },
  ],
});

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
  yearCenter: { fontSize: 9, textAlign: "center", marginTop: -2, marginBottom: 4 },
  title: { fontSize: 11, fontWeight: "bold", textAlign: "center", marginBottom: 3 },
  subtitle: { fontSize: 9, textAlign: "center", marginBottom: 8 },
  parties: { flexDirection: "row", justifyContent: "space-between", gap: 16, marginBottom: 6 },
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

function blank(v, w = 28) {
  const t = typeof v === "string" ? v.trim() : "";
  return t || "_".repeat(w);
}
function box(on) {
  return on ? "☑" : "☐";
}
function Lines({ count = 3 }) {
  return React.createElement(
    View,
    { style: s.lines },
    ...Array.from({ length: count }, (_, i) =>
      React.createElement(View, { key: i, style: s.line }),
    ),
  );
}

const props = {
  contractNumber: 12345,
  lastName: "Иванов",
  firstName: "Иван",
  patronymic: "Иванович",
  carModel: "Toyota Camry",
  vin: "XW7BF4FK50S123456",
  plate: null,
  year: null,
  startsAt: new Date("2026-07-18T10:30:00"),
};

const fio = "Иванов Иван Иванович";
const contractDate = "18.07.2026";
const dateTime = "18.07.2026 10:30";
const year = `${"_".repeat(8)} г`;

const doc = React.createElement(
  Document,
  null,
  React.createElement(
    Page,
    { size: "A4", style: s.page },
    React.createElement(
      View,
      { style: s.topRow },
      React.createElement(Image, {
        src: asset("/templates/acts/avancor-logo.png"),
        style: s.logo,
      }),
      React.createElement(
        View,
        { style: s.cityDateCol },
        React.createElement(Text, { style: s.cityDate }, "г. Жуковский 18 ИЮЛЯ 2026г."),
      ),
    ),
    React.createElement(
      Text,
      { style: s.title },
      "АКТ ПРИЁМА-ПЕРЕДАЧИ ТРАНСПОРТНОГО СРЕДСТВА",
    ),
    React.createElement(
      Text,
      { style: s.subtitle },
      `к Договору № ${props.contractNumber} от ${contractDate} г.`,
    ),
    React.createElement(
      View,
      { style: s.parties },
      React.createElement(
        View,
        { style: s.partyCol },
        React.createElement(Text, { style: s.partyLabel }, "Исполнитель:"),
        React.createElement(Text, null, "ИП Стражников А.Л. (АванКор Жуковский)"),
      ),
      React.createElement(
        View,
        { style: s.partyCol },
        React.createElement(Text, { style: s.partyLabel }, "Заказчик:"),
        React.createElement(Text, null, fio),
      ),
    ),
    React.createElement(
      Text,
      { style: s.intro },
      "Настоящие Стороны подтверждают передачу транспортного средства Исполнителю для выполнения работ по антикоррозийной обработке и сопутствующим работам.",
    ),
    React.createElement(View, { style: s.hr }),
    React.createElement(Text, { style: s.sectionTitle }, "1. ДАННЫЕ ТРАНСПОРТНОГО СРЕДСТВА"),
    React.createElement(
      View,
      { style: s.grid2 },
      React.createElement(
        View,
        { style: s.col },
        React.createElement(Text, { style: s.row }, `Марка, модель : ${blank(props.carModel, 28)}`),
        React.createElement(Text, { style: s.row }, `Гос номер: ${blank(props.plate, 16)}`),
        React.createElement(Text, { style: s.row }, `VIN: ${blank(props.vin, 20)}`),
        React.createElement(Text, { style: s.row }, `Год выпуска: ${year}`),
      ),
      React.createElement(
        View,
        { style: s.col },
        React.createElement(Text, { style: s.row }, `Пробег на момент приёма: ${"_".repeat(8)} км`),
        React.createElement(Text, { style: s.row }, "Количество переданных ключей: 1 шт."),
        React.createElement(Text, { style: s.row }, `Примерный уровень топлива: ${"_".repeat(3)} %`),
      ),
    ),
    React.createElement(View, { style: s.hr }),
    React.createElement(Text, { style: s.sectionTitle }, "2. ВНЕШНЕЕ СОСТОЯНИЕ АВТОМОБИЛЯ"),
    React.createElement(
      Text,
      { style: s.hint },
      "Схема автомобиля для фиксации повреждений ЛКП и кузовных элементов",
    ),
    React.createElement(
      Text,
      { style: s.hint },
      "(отметить дефекты, указать характер повреждения и зону)",
    ),
    React.createElement(
      View,
      { style: s.diagramRow, wrap: false },
      React.createElement(
        View,
        { style: s.diagramFrame },
        React.createElement(Image, {
          src: asset("/templates/acts/car-diagram.png"),
          style: s.diagram,
        }),
      ),
      React.createElement(
        View,
        { style: s.legend },
        React.createElement(Text, { style: s.legendTitle }, "Обозначения:"),
        React.createElement(Text, null, "X — царапина"),
        React.createElement(Text, null, "O — вмятина"),
        React.createElement(Text, null, "K — коррозия"),
        React.createElement(Text, null, "S — скол"),
        React.createElement(Text, null, "D — иное повреждение"),
      ),
    ),
    React.createElement(Text, null, "Дополнительные замечания:"),
    React.createElement(Lines, { count: 3 }),
    React.createElement(View, { style: s.hr }),
    React.createElement(Text, { style: s.sectionTitle }, "3. СОСТОЯНИЕ САЛОНА"),
    React.createElement(Text, { style: s.check }, `${box(false)} Загрязнения салона`),
    React.createElement(Text, { style: s.check }, `${box(false)} Повреждения элементов интерьера`),
    React.createElement(Text, { style: s.check }, `${box(false)} Повреждения обивки`),
    React.createElement(Text, { style: s.check }, `${box(false)} Посторонние запахи`),
    React.createElement(Text, { style: { marginTop: 4 } }, "Примечания:"),
    React.createElement(Lines, { count: 1 }),
    React.createElement(
      Text,
      { style: s.footerNote },
      `Акт приёма-передачи транспортного средства к Договору № ${props.contractNumber} · Стр. 1 из 2`,
    ),
  ),
  React.createElement(
    Page,
    { size: "A4", style: s.page },
    React.createElement(
      Text,
      { style: s.sectionTitle },
      "4. ПРОВЕРКА РАБОТОСПОСОБНОСТИ ДОСТУПНЫХ СИСТЕМ",
    ),
    React.createElement(Text, { style: s.row }, "1. Световые приборы: исправны / неисправны"),
    React.createElement(Text, { style: s.row }, "2. Поворотники: исправны / неисправны"),
    React.createElement(Text, { style: s.row }, "3. Стоп-сигналы: исправны / неисправны"),
    React.createElement(Text, { style: s.row }, "4. Стеклоочистители: исправны / неисправны"),
    React.createElement(Text, { style: s.row }, "5. Звуковой сигнал: исправен / неисправен"),
    React.createElement(Text, { style: s.row }, "6. Климатическая система: исправна / неисправна"),
    React.createElement(Text, { style: s.row }, "7. Скорости вентилятора печки: исправны / неисправны"),
    React.createElement(Text, { style: s.row }, "8. Приборная панель (ошибки): отсутствуют / имеются"),
    React.createElement(Text, { style: { marginTop: 5 } }, "Примечания:"),
    React.createElement(Lines, { count: 3 }),
    React.createElement(View, { style: s.hr }),
    React.createElement(Text, { style: s.sectionTitle }, "5. УСЛОВИЯ ПРИЁМА ТРАНСПОРТНОГО СРЕДСТВА"),
    React.createElement(
      Text,
      { style: s.row },
      "Автомобиль принят Исполнителем без полной разборки, демонтажа элементов кузова и дефектовки скрытых полостей.",
    ),
    React.createElement(
      Text,
      { style: s.row },
      "Скрытые коррозионные повреждения, эксплуатационный износ, ранее выполненные ремонты либо восстановленные элементы кузова могут быть выявлены только в процессе выполнения работ.",
    ),
    React.createElement(
      Text,
      { style: s.row },
      "Исполнитель вправе осуществлять фото- и видеофиксацию состояния транспортного средства.",
    ),
    React.createElement(Text, { style: { marginTop: 5, fontWeight: "bold" } }, "Заказчик подтверждает, что:"),
    React.createElement(Text, { style: s.row }, "— из автомобиля изъяты личные вещи и ценности;"),
    React.createElement(Text, { style: s.row }, "— внешнее состояние автомобиля осмотрено;"),
    React.createElement(Text, { style: s.row }, "— имеющиеся дефекты зафиксированы настоящим актом."),
    React.createElement(View, { style: s.hr }),
    React.createElement(Text, { style: s.sectionTitle }, "6. ПЕРЕДАЧА ТРАНСПОРТНОГО СРЕДСТВА"),
    React.createElement(
      Text,
      { style: s.row },
      "Транспортное средство передано Исполнителю для выполнения работ по договору.",
    ),
    React.createElement(Text, { style: { marginTop: 6 } }, `Дата и время приёма: ${dateTime}`),
    React.createElement(View, { style: s.hr }),
    React.createElement(
      View,
      { style: s.signs },
      React.createElement(
        View,
        { style: s.signCol },
        React.createElement(Text, { style: { fontWeight: "bold" } }, "Исполнитель"),
        React.createElement(View, { style: s.signLine }),
        React.createElement(Text, null, "/Стражников А.Л./"),
        React.createElement(Text, { style: { marginTop: 10 } }, "Мастер-приёмщик"),
        React.createElement(View, { style: s.signLine }),
        React.createElement(Text, null, `/${"_".repeat(18)}/`),
      ),
      React.createElement(
        View,
        { style: s.signCol },
        React.createElement(Text, { style: { fontWeight: "bold" } }, "Заказчик"),
        React.createElement(View, { style: s.signLine }),
        React.createElement(Text, null, `/${fio}/`),
      ),
    ),
    React.createElement(
      Text,
      { style: s.footerNote },
      `Акт приёма-передачи к Договору № ${props.contractNumber} · Стр. 2 из 2`,
    ),
  ),
);

const blob = await pdf(doc).toBlob();
const buf = Buffer.from(await blob.arrayBuffer());
writeFileSync("/tmp/akt-check.pdf", buf);
console.log("wrote /tmp/akt-check.pdf", buf.length, "pages via pdfinfo next");
