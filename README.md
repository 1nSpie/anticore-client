This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Личный кабинет

Маршруты: `/cabinet` (редирект), `/cabinet/login`, `/cabinet/register`, `/cabinet/forgot-password`, после входа — `/cabinet/profile`, `/cabinet/history`, `/cabinet/notifications`, `/cabinet/security`.

Переменная окружения: `NEXT_PUBLIC_BACKEND_API_URL` — база API с суффиксом `/api` (например `http://localhost:4444/api`). Запросы идут с `credentials`, refresh-токен — httpOnly-кука с бэкенда.

В админ-панели (`/admin`) вкладка **Клиенты ЛК**: список, карточка с полным редактированием (кроме телефона), блокировка, визиты, массовая SMS-рассылка.

При регистрации обязательны три согласия (152-ФЗ): политика конфиденциальности, согласие на обработку ПДн, пользовательское соглашение — страницы `/cabinet/legal/*`.

Дату рождения в профиле клиент может менять не чаще одного раза в сутки; администратор меняет без ограничений.

В профиле автомобиль выбирается из того же каталога марок/моделей, что и в калькуляторе на главной (API `/cars/brands`, `/brands/:id`).

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
