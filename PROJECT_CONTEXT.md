# Контекст проекта ANTICORE (АванКор)

Документ описывает структуру, технологии и ключевые решения проекта для быстрой ориентации.

---

## 1. О проекте

**Название:** АванКор (ANTICORE)  
**Тип:** Сайт компании по антикоррозийной обработке автомобилей  
**Стек:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Framer Motion  

**Регионы:** Жуковский, Раменское, Люберцы, Балашиха, Бронницы, Коломна, Воскресенск, Москва  

**Функции:**
- Лендинг с услугами, ценами, этапами работ, гарантией, примерами работ
- Блог
- Прайс-лист услуг
- Примеры работ (портфолио)
- Ответы на вопросы
- Админ-панель (цены по сегментам, автомобили, работы, блог)
- Интеграции: Yandex.Metrika, Google, карты, обратная связь

---

## 2. Структура проекта

```
anticore-client/
├── public/                 # Статика: изображения, иконки, логотипы
├── src/
│   ├── app/                # App Router Next.js
│   │   ├── admin/          # Админ-панель (auth, цены, авто, работы, блог)
│   │   ├── answers/        # Страница "Ответы на вопросы"
│   │   ├── blog/           # Блог (список + [id])
│   │   ├── glav/           # Компоненты главной страницы
│   │   ├── price/          # Прайс-лист услуг
│   │   ├── process/        # Процесс обработки
│   │   ├── works/          # Примеры работ
│   │   ├── ui/             # Общие UI: модалки, кнопки, формы
│   │   ├── layout.tsx      # Корневой layout
│   │   ├── page.tsx        # Главная страница
│   │   └── globals.css
│   ├── components/         # Глобальные: Navigation, Footer, DelayedModal
│   ├── lib/                # API, константы, хуки, утилиты, ModalContext
│   └── shadcn/             # UI-компоненты (Radix + Tailwind)
```

---

## 3. Главная страница (`/`)

**Файл:** `src/app/page.tsx`

**Секции по порядку:**
1. **AwesomeServices** (`id="hero"`) — герой-блок
2. **AntiCorrosionSection** — антикоррозийная секция
3. **AutoPrice** (`id="auto-price"`) — калькулятор цен по классам авто
4. **VideoCarousel** — видео-карусель
5. **TechProcces** (`id="tech-process"`) — этапы работ
6. **Garanty** (`id="garanty"`) — гарантия
7. **MainVideoPlayer** — главное видео
8. **Carousel** (`id="reviews"`) — отзывы/материалы
9. **PriceCardList** (`id="prices"`) — прайс-лист
10. **YandexMap** (`id="map"`) — карта и контакты

**Дополнительно:** FloatingNavigation (боковая навигация по секциям), Marquee-строки между блоками.

**Данные:** Цены по сегментам и списки авто подтягиваются с бэкенда (`glav/api.ts`, сегменты 1–6).

---

## 4. Навигация и layout

**Layout** (`src/app/layout.tsx`):
- ThemeProvider (next-themes): `defaultTheme="dark"`, `forcedTheme="dark"`
- ModalProvider — управление модалками (useModal)
- Компоненты: DelayedModal, **Navigation**, children, **FloatingContactButton**, Footer, Toaster
- Yandex.Metrika включается при `USE_YANDEX_METRICS === "true"`

**Navigation** (`src/components/Navigation.tsx`):
- Фиксированная шапка: при скролле — фон с blur, без скрытия
- Логотип (trans_bg.svg / shapka_dark.svg в зависимости от pathname)
- Ссылки: цены (`/#auto-price`), адреса (выпадающий список), телефон, кнопка меню
- Кнопка меню открывает **NavButton** — полноэкранное меню с пунктами из `navigationLinks`

**Пункты меню** (`src/lib/contants.ts`):
- Главная `/`, Услуги `/price`, Процесс обработки `/process`, Примеры работ `/works`, Блог `/blog`, Ответы на вопросы `/answers`

---

## 5. Цвета и тема

**Файлы:** `src/lib/colors.ts`, `THEME_GUIDE.md`, `src/app/globals.css`

**Бренд:**
- Основной: `#007478` (orangeDefault / teal)
- Hover: `#005d61`, светлый акцент: `#009ba0`
- В Tailwind: `orangeDefault`, `orangeDefaultHover`, `orangeLight`, `orangeDark`

**Тема:** Тёмная, градиенты slate + teal. Секции идут от тёмного (slate-900) к более светлому (slate-300/400). Используются радиальные градиенты и blur-элементы.

**Админка:** Класс `.bg-gradient-admin` в `globals.css` — тёмный градиент с emerald/teal акцентами.

---

## 6. API и бэкенд

**Base URL:** `process.env.NEXT_PUBLIC_BACKEND_API_URL` или `http://localhost:4444`  
**API префикс:** `/api` (blog, works, cars, segment, admin и т.д.)

**Основные модули:**
- `src/lib/api.ts` — общий API, статика изображений
- `src/app/glav/api.ts` — бренды, машины, цены по сегментам для главной
- `src/app/blog/blogApi.ts` — посты, категории, теги, изображения блога
- `src/app/works/worksApi.ts` — работы, категории, фильтры
- `src/app/admin/_lib/api.ts` — авторизованный axios для админки (Bearer token)

**Админка:** Токен в `localStorage` под ключом `admin_auth_token`. Проверка: `GET /admin/check-auth`, логин: `POST /admin/login`.

---

## 7. Админ-панель (`/admin`)

**Структура:**
- `src/app/admin/page.tsx` — точка входа, переключение между логином и дашбордом
- **hooks:** useAuth, usePrices
- **lib:** api, constants, types
- **Компоненты:**
  - auth: LoginForm, LoadingScreen
  - layout: AdminDashboard, AdminHeader
  - prices: PriceManagement, PriceSegmentCard
  - cars: CarsManager
  - works: WorksManager
  - blog: BlogManager

**Функционал:**
- Вход по логину/паролю, проверка токена при загрузке
- Вкладки: Цены (сегменты 1–6, standartML, standartMLBody, complexML, complexMLBody), Автомобили (марки/модели, сегменты), Работы, Блог (CRUD постов, категории, контент-блоки)

**Сегменты авто:** 1–6 (например: до 4 м, от 4 м, кроссоверы и т.д.), имена в `admin/_lib/types.ts` (SEGMENT_NAMES).

---

## 8. Страницы и роуты

| Путь | Описание |
|------|----------|
| `/` | Главная (лендинг) |
| `/admin` | Админ-панель |
| `/price` | Прайс-лист услуг |
| `/price/[id]` | Услуга по id |
| `/process` | Процесс обработки |
| `/works` | Примеры работ |
| `/works/[id]` | Одна работа |
| `/blog` | Блог |
| `/blog/[id]` | Статья блога |
| `/answers` | Ответы на вопросы |
| `/pk` | Отдельная страница |

Редирект: `/glav` → `/` (permanent).

---

## 9. UI и компоненты

- **shadcn:** кнопки, карточки, инпуты, селекты, табы, диалоги, drawer, carousel и т.д. (Radix + Tailwind)
- **Модалки:** ModalContext (openModal/closeModal по id), CallbackModal, DuplicateWarningModal, DelayedModal
- **Формы:** react-hook-form, zod (validations.ts)
- **Уведомления:** sonner (Toaster)
- **Карта:** Yandex Maps (ymap3-components, @iminside/react-yandex-maps)

---

## 10. Важные зависимости

- next 16, react 19, typescript 5
- tailwind 4, tw-animate-css
- framer-motion — анимации
- axios — запросы к API
- next-themes — тема
- embla-carousel-react — карусели
- react-fast-marquee — бегущие строки
- zustand — состояние (если используется)
- zod — валидация

---

## 11. Переменные окружения

- `NEXT_PUBLIC_BACKEND_API_URL` — базовый URL бэкенда (например `http://localhost:4444/api` или полный URL с `/api`)
- `USE_YANDEX_METRICS` — включение счётчика Yandex.Metrika (`"true"`)

---

## 12. Документация в репозитории

- `README.md` — старт проекта (Next.js)
- `THEME_GUIDE.md` — тёмная тема, градиенты, паттерны блоков
- `COLOR_SCHEME_DOCUMENTATION.md` — цвета и схема
- `PROJECT_CONTEXT.md` — этот файл (общий контекст)

---

*Документ сформирован для сохранения контекста проекта. При значительных изменениях структуры или API его стоит обновлять.*
