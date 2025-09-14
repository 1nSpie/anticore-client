# Унифицированная тёмная тема главной страницы

## Обзор изменений

Все блоки главной страницы приведены в соответствие с дизайном блока AwesomeServices. Создана единая система градиентных фонов в тёмных оттенках slate с teal акцентами.

## Цветовая схема

### Основные цвета
- **Бренд-цвет**: `#007478` (orangeDefault) - основной teal цвет
- **Ховер**: `#005d61` (orangeDefaultHover)
- **Акцент**: `#009ba0` (светлый teal)

### Фоновая градация (от тёмного к светлому)

1. **AwesomeServices (Hero)** - `bg-slate-900`
   - Самый тёмный фон для главного блока
   - Радиальные градиенты с teal accent

2. **AutoPrice, TechProcces** - `bg-slate-800` / `bg-slate-700` 
   - Средне-тёмный фон
   - Плавный переход от hero секции

3. **Garanty, Carousel** - `bg-slate-600` / `bg-slate-500`
   - Средний фон
   - Сохраняет тёмную тему но светлее предыдущих

4. **PriceList, MainVideoPlayer** - `bg-slate-400` / `bg-slate-300`
   - Самые светлые секции
   - Завершают градацию к концу страницы

## Текстовые цвета

Все секции теперь используют единую схему:
- **Заголовки**: `text-white` - белый для максимального контраста
- **Подзаголовки**: `text-gray-300` - светло-серый для описаний
- **Акценты**: `text-orangeDefault` - teal brand цвет

## Декоративные элементы

Каждая секция имеет:
- Фоновые blur-circle элементы с teal и slate градиентами
- Радиальные градиенты для глубины
- Консистентные размеры и позиционирование

## Тёмная тема

Система автоматически адаптируется к тёмной теме через:
- `dark:` префиксы в Tailwind
- Увеличенная непрозрачность фоновых элементов
- Смягчённые glow эффекты

## Структура компонентов

Каждый блок теперь следует паттерну:

```tsx
<section
  className="relative overflow-hidden py-16 lg:py-20 bg-slate-[xxx]"
  style={{
    background: `
      radial-gradient(...),
      linear-gradient(...)
    `,
  }}
>
  {/* Background decorations */}
  <div className="absolute inset-0 bg-gradient-to-br ..." />
  <div className="absolute top-[x] right-[x]">
    <div className="w-[x] h-[x] bg-gradient-to-br from-teal-[x] ..." />
  </div>
  
  {/* Content */}
  <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
    <!-- Заголовок -->
    <h2 className="text-4xl font-bold text-white">...</h2>
    <p className="text-gray-300">...</p>
  </div>
</section>
```

## Плавные переходы

Секции создают визуальный flow:
AwesomeServices (slate-900) → AutoPrice (slate-800) → TechProcces (slate-700) → Garanty (slate-600) → Carousel (slate-500) → PriceList (slate-400) → MainVideoPlayer (slate-300)

## Применение в других компонентах

Для новых компонентов используйте:
1. Цвета из `src/lib/colors.ts`
2. Паттерны из обновлённых компонентов
3. Консистентную структуру фонов и текстов

## Результат

- ✅ Все блоки визуально связаны
- ✅ Единая тёмная тема
- ✅ Плавные переходы между секциями
- ✅ Поддержка автоматической тёмной темы
- ✅ Консистентная типографика
- ✅ Профессиональный внешний вид
