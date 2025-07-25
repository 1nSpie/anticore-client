import { ServicePackage } from "./types";

export const services: ServicePackage[] = [
  {
    id: 1,
    title: "Комплексная обработка",
    content: [
      {
        name: "Стандарт ML",
        steps: [
          "Разборка",
          "Мойка",
          "Сушка",
          "Обработка скрытых полостей",
          "Обработка днища и арок консервирующими составами",
          "Сборка",
        ],
        prices: [
          { carType: "До 4-х метров", price: 21000 },
          { carType: "От 4-х метров", price: 23000 },
          { carType: "Кроссоверы/универсалы", price: 28000 },
          { carType: "Внедорожники/минивэны", price: 30000 },
        ],
      },
      {
        name: " Стандарт ML/Body",
        steps: [
          "Разборка",
          "Мойка",
          "Сушка",
          "Зачистка очагов коррозии",
          "Нанесение грунтовочного слоя",
          "Обработка скрытых полостей",
          "Обработка днища и арок износостойким антикоррозийным покрытием",
          "Сборка",
        ],
        prices: [
          { carType: "До 4-х метров", price: 23000 },
          { carType: "От 4-х метров", price: 27000 },
          { carType: "Кроссоверы/универсалы", price: 30000 },
          { carType: "Внедорожники/минивэны", price: 35000 },
        ],
      },
      {
        name: "Комплекс ML",
        steps: [
          "Разборка пластиковых навесных элементов авто, а так же разборка салона",
          "Мойка",
          "Сушка",
          "Зачистка очагов коррозии",
          "Нанесение грунтовочного слоя",
          "Обработка скрытых полостей",
          "Обработка днища и арок износостойким антикоррозийным покрытием с эффектом шумопоглощения в несколько слоев с промежуточной сушкой",
          "Сборка",
        ],
        prices: [
          { carType: "До 4-х метров", price: 26000 },
          { carType: "От 4-х метров", price: 30000 },
          { carType: "Кроссоверы/универсалы", price: 33000 },
          { carType: "Внедорожники/минивэны", price: 38000 },
        ],
      },
      {
        name: "Комплекс ML/Body",
        steps: [
          "Разборка пластиковых навесных элементов авто, а так же разборка салона",
          "Мойка",
          "Сушка",
          "Зачистка очагов коррозии",
          "Нанесение грунтовочного слоя",
          "Обработка скрытых полостей",
          "Обработка днища и арок износостойким антикоррозийным покрытием с эффектом шумопоглощения в несколько слоев с промежуточной сушкой",
          "Обработка пола салона антикоррозийным покрытием с эффектом шумопоглощения",
          "Сборка",
        ],
        prices: [
          { carType: "До 4-х метров", price: 26000 },
          { carType: "От 4-х метров", price: 30000 },
          { carType: "Кроссоверы/универсалы", price: 33000 },
          { carType: "Внедорожники/минивэны", price: 38000 },
        ],
      },
    ],
  },
];

export const carType = [
  "До 4-х метров",
  "От 4-х метров",
  "Кроссоверы/универсалы",
  "Внедорожники/минивэны",
];
