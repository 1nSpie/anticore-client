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

interface SegmentPrice {
  id: number;
  segment: number;
  standartML: number | null;
  standartMLBody: number | null;
  complexML: number | null;
  complexMLBody: number | null;
}


const SEGMENT_EXAMPLES: Record<number, string> = {
  1: "Toyota Pixis Epoch, Hyundai EON, Peugeot 107, Suzuki Kei, Subaru R2, Toyota Sparky, Honda N-One",
  2: "Subaru Legacy Lancaster, Москвич 6, Toyota Sprinter, Mitsubishi Colt, Skoda Octavia RS, Dodge Stratus, Geely Geometry A",
  3: "Haval M6, Mazda CX-5, Volga K50, Tenet T7, Honda CR-V, Hyundai ix35, Kia Sportage, Suzuki Grand Vitara, Geely Monjaro",
  4: "Mitsubishi Pajero Sport, Kia Mohave, Tank 300, УАЗ «Патриот», Haval H5, Toyota Land Cruiser, SsangYong Kyron, Nissan Patrol",
  5: "Hyundai Staria, Volkswagen Multivan, Kia Carnival, Toyota Alphard, Nissan Serena, Nissan Elgrand, Toyota Tundra, Toyota Hilux, Nissan Navara, Volkswagen Amarok",
  6: "Cadillac Celestiq, Mercedes-Benz X-Knacc, Dodge RAM, Mercedes-Benz Maybach GLS, Комбат Т98, Tesla Cybertruck, Honda NSX",
};

const SEGMENT_META: Record<
  number,
  { name: string; imageSrc: typeof car1; imageAlt: string }
> = {
  1: {
    name: "Легковые автомобили до 4 метров (Класс A,B)",
    imageSrc: car1,
    imageAlt: "Класс A,B",
  },
  2: {
    name: "Легковые автомобили от 4 до 5 метров (Класс C,D,E)",
    imageSrc: car4,
    imageAlt: "Класс C,D,E",
  },
  3: {
    name: "Кроссоверы",
    imageSrc: car3,
    imageAlt: "Кроссоверы",
  },
  4: {
    name: "Внедорожники",
    imageSrc: car5,
    imageAlt: "Внедорожники",
  },
  5: {
    name: "Микроавтобусы и пикапы",
    imageSrc: car6,
    imageAlt: "Микроавтобусы и пикапы",
  },
  6: {
    name: "Премиум класс",
    imageSrc: car2,
    imageAlt: "Премиум класс",
  },
};

function formatPrice(value: number | null): string {
  return value == null ? "Договорная" : `${value.toLocaleString()} руб`;
}

type Props = {
  id?: string;
};

export default function PriceCardList({ id }: Props) {
  const [segments, setSegments] = useState<SegmentPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`${API_BASE.replace(/\/$/, "")}/segment`)
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка загрузки");
        return res.json();
      })
      .then((data: SegmentPrice[]) => {
        if (cancelled) return;
        setSegments(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
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
    return null;
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
                  {SEGMENT_EXAMPLES[segment.segment] || "—"}
                </p>

                <div className="space-y-2">
                  <div className="flex justify-between gap-2">
                    <span className="font-bold text-black">Стандарт ML:</span>
                    <span className="text-black">
                      {formatPrice(segment.standartML)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="font-bold text-black">Стандарт ML/Body:</span>
                    <span className="text-black">
                      {formatPrice(segment.standartMLBody)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="font-bold text-black">Комплекс ML:</span>
                    <span className="text-black">
                      {formatPrice(segment.complexML)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="font-bold text-black">Комплекс ML/Body:</span>
                    <span className="text-black">
                      {formatPrice(segment.complexMLBody)}
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