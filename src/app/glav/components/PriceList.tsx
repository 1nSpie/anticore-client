"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import car1 from "../../../../public/Auto_A_Class.png";
import car2 from "../../../../public/Auto_B_Class.png";
import car3 from "../../../../public/Auto_C_Class.png";
import car4 from "../../../../public/Auto_D_Class.png";
import car5 from "../../../../public/Auto_E_Class.png";
import car6 from "../../../../public/Auto_F_Class.png";

const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:4444";
const SEGMENT_LIST_URL = `${API_BASE.replace(/\/$/, "")}${API_BASE.endsWith("/api") ? "" : "/api"}/segment`;

interface SegmentPrice {
  id: number;
  segment: number;
  standartML: number | null;
  standartMLBody: number | null;
  complexML: number | null;
  complexMLBody: number | null;
}

const SEGMENT_META: Record<
  number,
  { name: string; exampleCars: string; imageSrc: typeof car1; imageAlt: string }
> = {
  1: {
    name: "Легковые автомобили до 4 метров (Класс A,B)",
    exampleCars:
      "Kia Picanto, Ford Fiesta, Chevrolet Spark, Lada Kalina, Nissan Micra, Peugeot 1007",
    imageSrc: car1,
    imageAlt: "Класс A,B",
  },
  2: {
    name: "Легковые автомобили от 4 до 5 метров (Класс C,D,E)",
    exampleCars:
      "Mazda 3, Ford Mondeo, Focus, Mazda 6, Toyota Camry, Corolla, Avensis, KIA Optima, Rio, Hyundai Solaris",
    imageSrc: car4,
    imageAlt: "Класс C,D,E",
  },
  3: {
    name: "Минивэны, кроссоверы",
    exampleCars:
      "KIA Sportage, Hyundai ix35, Nissan Qashqai, Renault Duster, Ford Kuga, Geely Engrand X7",
    imageSrc: car3,
    imageAlt: "Минивэны, кроссоверы",
  },
  4: {
    name: "Внедорожники",
    exampleCars:
      "Toyota Land Cruiser 100, 200, Prado, Highlander, Jeep, Opel Frontera, Cadillac Escalade, Chevrolet Suburban, УАЗ",
    imageSrc: car5,
    imageAlt: "Внедорожники",
  },
  5: {
    name: "Микроавтобусы и пикапы",
    exampleCars:
      "Mercedes-Benz Sprinter, Ford Transit, Fiat Ducato, Газель, Ford F150, Dodge Ram, Toyota Tundra, Volkswagen Amarok, Chevrolet Silverado",
    imageSrc: car6,
    imageAlt: "Микроавтобусы и пикапы",
  },
  6: {
    name: "Премиум класс",
    exampleCars:
      "Jaguar, BMW, Audi, Mercedes, Rover, Land Rover, Lexus, Volkswagen, Volvo, Mitsubishi Pajero, Toyota Alphard",
    imageSrc: car2,
    imageAlt: "Премиум класс",
  },
};

function formatPrice(value: number | null): string {
  return value == null ? "Договорная" : `${value} руб`;
}

type Props = {
  id?: string;
};

export default function PriceCardList({ id }: Props) {
  const [segments, setSegments] = useState<SegmentPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(SEGMENT_LIST_URL)
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка загрузки");
        return res.json();
      })
      .then((data: SegmentPrice[]) => setSegments(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section
        id={id}
        className="relative py-16 sm:py-24 overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url(/videocarouselbg.png)" }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center py-12">
          <p className="text-gray-600">Загрузка прайс-листа...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      null
    );
  }

  return (
    <section
      id={id}
      className="relative py-16 sm:py-24 overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: "url(/videocarouselbg.png)" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {segments.map((segment, index) => {
            const meta = SEGMENT_META[segment.segment];
            if (!meta) return null;

            return (
              <motion.article
                key={segment.id}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
              >
                <div className="flex gap-4 mb-4">
                  <div className="flex-shrink-0 w-24 h-20 relative">
                    <Image
                      src={meta.imageSrc}
                      alt={meta.imageAlt}
                      fill
                      className="object-contain object-left"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-black leading-tight">
                    {meta.name}
                  </h3>
                </div>

                <p className="text-sm text-gray-800 mb-4">
                  <span className="font-medium">Например: </span>
                  {meta.exampleCars}
                </p>

                <div className="space-y-2">
                  <div className="flex justify-between gap-2">
                    <span className="font-bold text-black">Стандарт ML:</span>
                    <span className="text-black">
                      {formatPrice(segment.segment === 6 ? null : segment.standartML)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="font-bold text-black">Стандарт ML/Body:</span>
                    <span className="text-black">
                      {formatPrice(segment.segment === 6 ? null : segment.standartMLBody)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="font-bold text-black">Комплекс ML:</span>
                    <span className="text-black">
                      {formatPrice(segment.segment === 6 ? null : segment.complexML)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="font-bold text-black">Комплекс ML/Body:</span>
                    <span className="text-black">
                      {formatPrice(segment.segment === 6 ? null : segment.complexMLBody)}
                    </span>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
