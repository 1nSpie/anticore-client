// model Brand {
//   id   Int    @id @default(autoincrement())
//   name String @unique
//   Car  Car[]
// }

// model Car {
//   id      Int    @id @default(autoincrement())
//   model   String
//   brandId Int?
//   segment Int
//   brand   Brand? @relation(fields: [brandId], references: [id])
// }

// model BodyTypePrice {
//   id             Int  @id @default(autoincrement())
//   segment        Int  @unique // Ценовой сегмент (1-6)
//   standartML     Int?
//   standartMLBody Int?
//   complexML      Int?
//   complexMLBody  Int?
// }

export type Brand = {
  id: number;
  name: string;
};

export type Car = {
  id: number;
  model: string;
  brandId: number;
  segment: number;
  prices: Prices;
};

export type Prices = {
  id: number;
  segment: number;
  standartML: number;
  standartMLBody: number;
  complexML: number;
  complexMLBody: number;
};

export type ServiceItem = {
  label: string;
  price: number;
  icon: string;
};

export type ServiceDescription = {
  title: string;
  description: string;
  includes: string[];
  duration: string;
  warranty: string;
};

export type ServiceDescriptions = {
  [key: string]: ServiceDescription;
};

export type ContactMethod = 'telegram' | 'whatsapp' | 'phone';

export type AutoPriceFormData = {
  brand: string;
  model: string;
  customBrand: string;
  isNotAuto: boolean;
  name: string;
  phone: string;
  contactMethod: ContactMethod;
};

export type AutoPriceProps = {
  id: string;
};
