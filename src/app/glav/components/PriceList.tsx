"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import car1 from "../../../../public/Auto_A_Class.png";
import car2 from "../../../../public/Auto_B_Class.png";
import car3 from "../../../../public/Auto_C_Class.png";
import car4 from "../../../../public/Auto_D_Class.png";
import car5 from "../../../../public/Auto_E_Class.png";
import car6 from "../../../../public/Auto_F_Class.png";

const products = [
  {
    id: 1,
    name: "Легковые автомобили до 4 метров (Класс А,B)",
    carlist:
      "Kia Picanto, Ford Fiesta, Chevrolet Spark, Lada Kalina, Nissan Micra, Peugeot 1007",
    ML: "18000 руб",
    MLBody: "20000 руб",
    CML: "23000 руб",
    CMLBody: "25000 руб",
    href: "#",
    imageSrc: car1,
    imageAlt: "car1",
  },
  {
    id: 2,
    name: "Легковые автомобили от 4 до 5 метров (Класс C,D,E)",
    href: "#",
    carlist:
      "Mazda 3, Ford Modeo, Focus, Mazda 6, Toyota Camry, Corolla, Avensis, KIA Optima, Rio, Hyundai Solaris",
    ML: "21000 руб",
    MLBody: "23000 руб",
    CML: "28000 руб",
    CMLBody: "30000 руб",
    imageSrc: car4,
    imageAlt:
      "Olive drab green insulated bottle with flared screw lid and flat top",
  },
  {
    id: 3,
    name: "Минивэны, кроссоверы",
    href: "#",
    carlist:
      "KIA Sportage, Hyundai ix35, Nissan Qashqai, Renault Duster, Ford Kuga, Geely Engrand X7",
    ML: "24000 руб",
    MLBody: "26000 руб",
    CML: "33000 руб",
    CMLBody: "35000 руб",
    imageSrc: car3,
    imageAlt:
      "Person using a pen to cross a task off a productivity paper card",
  },
  {
    id: 4,
    name: "Внедорожники",
    href: "#",
    carlist:
      "Toyota Land Cruiser 100, 200, Prado, Highlander, Jeep, Opel Frontera, Cadillac Escalade, Chevrolet Suburban, УАЗ",
    ML: "27000 руб",
    MLBody: "29000 руб",
    CML: "38000 руб",
    CMLBody: "40000 руб",
    imageSrc: car5,
    imageAlt:
      "Hand holding black machined steel mechanical pencil with brass tip and top.",
  },
  {
    id: 5,
    name: "Микроавтобусы и пикапы",
    href: "#",
    carlist:
      "Mercedes-Benz Sprinter, Ford Transit, Fiat Ducato, Газель, Ford F150, Dodge Ram, Toyota Tundra, Volkswagen Amarok, Chevrolet Silverado",
    ML: "30000 руб",
    MLBody: "32000 руб",
    CML: "43000 руб",
    CMLBody: "45000 руб",
    imageSrc: car6,
    imageAlt:
      "Hand holding black machined steel mechanical pencil with brass tip and top.",
  },
  {
    id: 6,
    name: "Премиум класс",
    href: "#",
    carlist:
      "Jaguar, BMW, Audi, Merсedes, Rover, Land Rover, Lexus, Volkswagen, Volvo, Mitsubishi (Pagero), Toyota Alphard",
    ML: "Договорная",
    MLBody: "Договорная",
    CML: "Договорная",
    CMLBody: "Договорная",
    imageSrc: car2,
    imageAlt:
      "Hand holding black machined steel mechanical pencil with brass tip and top",
  },
];

type Props = {
  id: string;
};

export default function PriceCardList({ id }: Props) {
  function PriceCard() {
    return products.map((product, index) => (
      <motion.section
        id={id}
        key={product.id}
        className="group"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
      >
        <div className="lg:h-[50px]">
          <Image className="" alt={product.imageAlt} src={product.imageSrc} />
        </div>
        <h3 className="mt-4 text-lg text-black dark:text-white h-15">
          {product.name}
        </h3>
        <div className="p-0.5 border-greenDefault border-s-2">
          <span className="">Например: </span>
          <span className="dark:text-gray-200 text-gray-800">
            {product.carlist}
          </span>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-800 dark:text-greenDefault">
              Стандарт ML:
            </span>
            <span className="dark:text-white text-black">{product.ML}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-800 dark:text-greenDefault">
              Стандарт ML/Body:
            </span>
            <span className="dark:text-white text-black">{product.MLBody}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-800 dark:text-greenDefault">
              Комплекс ML:
            </span>
            <span className="dark:text-white text-black">{product.CML}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-800 dark:text-greenDefault">
              Комплекс ML/Body:
            </span>
            <span className="dark:text-white text-black">{product.CMLBody}</span>
          </div>
        </div>
        <div className="lg:hidden block w-full border-2 mt-4 border-greenDefault"></div>
      </motion.section>
    ));
  }

  return (
    <div className="bg-transparent">
      <motion.div
        className="mx-auto max-w-[85rem] px-4 py-16 sm:px-6 sm:py-24 lg:px-8 section-surface rounded-3xl"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 lg:grid-cols-2 xl:grid-cols-3 xl:gap-x-8 ">
          {PriceCard()}
        </div>
      </motion.div>
    </div>
  );
}
