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
import { getCarsBySegment, type ApiCar } from "../api";

const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:4444";
const SEGMENT_LIST_URL = `${API_BASE.replace(/\/$/, "")}${
  API_BASE.endsWith("/api") ? "" : "/api"
}/segment`;

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
    name: "Минивэны, кроссоверы",
    imageSrc: car3,
    imageAlt: "Минивэны, кроссоверы",
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

function formatExampleCars(cars: ApiCar[]): string {
  if (!cars.length) return "";
  const picked = cars.slice(0, 7);
  return picked
    .map((c) => (c.brand?.name ? `${c.brand.name} ${c.model}` : c.model))
    .join(", ");
}

function formatPrice(value: number | null): string {
  return value == null ? "Договорная" : `${value} руб`;
}

type Props = {
  id?: string;
};

export default function PriceCardList({ id }: Props) {
  const [segments, setSegments] = useState<SegmentPrice[]>([]);
  const [exampleCars, setExampleCars] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(SEGMENT_LIST_URL)
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка загрузки");
        return res.json();
      })
      .then((data: SegmentPrice[]) => {
        if (cancelled) return;
        setSegments(data);
        const segmentIds = Array.from(new Set(data.map((s) => s.segment)));
        return Promise.all(
          segmentIds.map((segId) =>
            getCarsBySegment(segId)
              .then((cars) => ({ segId, cars }))
              .catch(() => ({ segId, cars: [] as ApiCar[] }))
          )
        );
      })
      .then((results) => {
        if (!results || cancelled) return;
        const map: Record<number, string> = {};
        results.forEach(({ segId, cars }) => {
          const str = formatExampleCars(cars);
          if (str) {
            map[segId] = str;
          }
        });
        setExampleCars(map);
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
                  {exampleCars[segment.segment] || "—"}
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
