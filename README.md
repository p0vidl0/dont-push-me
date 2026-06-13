# dont-push-me

Калькулятор рекомендуемого давления в велосипедных покрышках. Учитывает массу райдера и велосипеда, ширину обода и покрышки, диаметр колеса, тип обода, стиль езды, покрытие и корпус покрышки.

Результат — стартовая оценка в psi и bar, а не замена давления по ощущениям и инструкциям производителя.

## Возможности

- Расчёт давления для переднего и заднего колеса
- Предупреждения, если давление выходит за пределы полосы ширины покрышки
- Сохранение расчётов в `localStorage`
- Светлая, тёмная и системная тема

## Быстрый старт

Требуется [Node.js](https://nodejs.org/) 20+ и [pnpm](https://pnpm.io/) 10.

```bash
pnpm install
pnpm dev:tire-pressure
```

Откроется локальный сервер с приложением `tire-pressure`.

## Скрипты

| Команда | Описание |
| --- | --- |
| `pnpm dev:tire-pressure` | Режим разработки (Parcel) |
| `pnpm build` | Сборка в `dist/tire-pressure` |
| `pnpm test` | Запуск тестов (`node --test`) |

## Структура

```
tire-pressure/
├── index.html              # Разметка приложения
├── app.js                  # UI, форма, сохранённые расчёты
├── calculation.js          # Обёртка над моделью давления
├── tire-pressure.js        # Модель расчёта (мбар → psi/bar)
├── labels.js               # Подписи параметров
├── saved-calculations.js   # Работа с localStorage
├── condition-icons.js      # Иконки стиля езды и покрытия
├── theme.js                # Переключение темы
└── styles.css              # Tailwind + basecoat-css
```

## Деплой

При пуше в ветку `master` GitHub Actions собирает проект и публикует содержимое `dist/tire-pressure` на GitHub Pages (см. `.github/workflows/deploy-pages.yml`).

## Лицензия

[MIT](LICENSE) © Alex K.
