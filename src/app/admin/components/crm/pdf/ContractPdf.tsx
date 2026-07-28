import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import {
  blank,
  formatCityDateUpper,
  formatDateDots,
  formatFioForAct,
  formatPriceLine,
  registerActFonts,
  type ActDocInput,
} from "./actShared";

registerActFonts();

const s = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 40,
    fontSize: 10,
    fontFamily: "DejaVu",
    color: "#111",
    lineHeight: 1.45,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: { fontSize: 9, textAlign: "center", marginBottom: 14 },
  hr: {
    borderBottomWidth: 1,
    borderBottomColor: "#222",
    marginVertical: 10,
  },
  row: { marginBottom: 6 },
  section: { marginTop: 10, marginBottom: 6 },
  sectionTitle: { fontWeight: "bold", marginBottom: 4 },
  signRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 28,
    gap: 24,
  },
  signCol: { flex: 1 },
  signLine: {
    marginTop: 24,
    borderBottomWidth: 0.7,
    borderBottomColor: "#333",
    marginBottom: 4,
  },
});

function formatPhone8(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("7")) {
    return `8${digits.slice(1)}`;
  }
  if (digits.length === 11 && digits.startsWith("8")) return digits;
  if (digits.length === 10) return `8${digits}`;
  return phone;
}

export type ContractPdfInput = ActDocInput & {
  phone: string;
  birthDate?: string | null;
};

export function ContractPdf(props: ContractPdfInput) {
  const fio = formatFioForAct(props);
  const price = formatPriceLine(props.priceRub);
  const start = formatDateDots(props.startsAt);
  const end = formatDateDots(props.endsAt);
  const cityDate = formatCityDateUpper(props.startsAt);

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <Text style={s.title}>ДОГОВОР № {props.contractNumber}</Text>
        <Text style={s.subtitle}>
          на оказание услуг по антикоррозийной обработке автомобиля
        </Text>
        <Text style={s.row}>{cityDate}</Text>

        <View style={s.hr} />

        <View style={s.section}>
          <Text style={s.sectionTitle}>Исполнитель</Text>
          <Text>ИП Стражников А.Л. (АванКор Жуковский)</Text>
          <Text>г. Жуковский, Речной пр., д. 14</Text>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Заказчик</Text>
          <Text>ФИО: {fio}</Text>
          <Text>Телефон: {formatPhone8(props.phone)}</Text>
          {props.birthDate && (
            <Text>Дата рождения: {formatDateDots(props.birthDate)}</Text>
          )}
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Предмет договора</Text>
          <Text>
            Исполнитель обязуется выполнить услугу «{props.serviceType}» по
            автомобилю {blank(props.carModel, 20)}, VIN: {blank(props.vin, 17)}.
          </Text>
          <Text style={{ marginTop: 4 }}>
            Срок выполнения работ: с {start} по {end}.
          </Text>
          <Text style={{ marginTop: 4 }}>
            Стоимость услуг: {price.digits} {price.words}.
          </Text>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Условия</Text>
          <Text>
            Стороны подтверждают согласие с правилами оказания услуг,
            перечнем работ и гарантийными обязательствами исполнителя.
            Подписание настоящего договора подтверждает ознакомление заказчика
            с условиями обработки и сроками выполнения работ.
          </Text>
        </View>

        <View style={s.signRow}>
          <View style={s.signCol}>
            <Text>Исполнитель</Text>
            <View style={s.signLine} />
            <Text>/ Стражников А.Л. /</Text>
          </View>
          <View style={s.signCol}>
            <Text>Заказчик</Text>
            <View style={s.signLine} />
            <Text>/ {fio} /</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
