import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica" },
  header: { marginBottom: 16, lineHeight: 1.4 },
  divider: { borderBottomWidth: 1, marginVertical: 12 },
  title: { fontSize: 14, fontWeight: "bold", marginBottom: 12 },
  row: { marginBottom: 6 },
});

export type DocPayload = {
  company: { name: string; inn: string; address: string };
  docNumber: string;
  fio: string;
  carModel: string;
  vin: string;
  service: string;
  price: number;
  date: string;
};

function Header({ company }: { company: DocPayload["company"] }) {
  return (
    <View style={styles.header}>
      <Text>{company.name}</Text>
      <Text>ИНН {company.inn}</Text>
      <Text>{company.address}</Text>
    </View>
  );
}

export function ContractPdf(props: DocPayload) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Header company={props.company} />
        <View style={styles.divider} />
        <Text style={styles.title}>ДОГОВОР № {props.docNumber}</Text>
        <Text style={styles.row}>Клиент: {props.fio}</Text>
        <Text style={styles.row}>
          Автомобиль: {props.carModel}, VIN: {props.vin}
        </Text>
        <Text style={styles.row}>Услуга: {props.service}</Text>
        <Text style={styles.row}>Стоимость: {props.price} руб.</Text>
        <Text style={styles.row}>Дата выполнения: {props.date}</Text>
      </Page>
    </Document>
  );
}

export function ActPdf(props: DocPayload) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Header company={props.company} />
        <View style={styles.divider} />
        <Text style={styles.title}>АКТ выполненных работ № {props.docNumber}</Text>
        <Text style={styles.row}>Клиент: {props.fio}</Text>
        <Text style={styles.row}>
          Автомобиль: {props.carModel}, VIN: {props.vin}
        </Text>
        <Text style={styles.row}>Услуга: {props.service}</Text>
        <Text style={styles.row}>Стоимость: {props.price} руб.</Text>
        <Text style={styles.row}>Дата выполнения: {props.date}</Text>
      </Page>
    </Document>
  );
}
