# Docker-настройка для Clixxx.me

Это руководство объясняет, как запустить монорепозиторий Clixxx.me с помощью Docker и Docker Compose.

## Необходимые условия

- Docker
- Docker Compose
- JSON-файл сервисного аккаунта Firebase (для backend)

## Быстрый старт

1. **Клонируйте репозиторий и перейдите в корневую директорию**

2. **Настройте переменные окружения**
   ```bash
   cp .env.example .env
   ```
   Отредактируйте файл `.env`, указав свои реальные значения.

3. **Добавьте учетные данные Firebase**
   - Поместите JSON-файл сервисного аккаунта Firebase в директорию `backend/`
   - Назовите его `clixxx-dev-44e45f09d47f.json` или обновите конфигурацию Docker соответствующим образом

4. **Соберите и запустите сервисы**
   ```bash
   docker compose up --build
   ```

5. **Доступ к приложению**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - PostgreSQL: localhost:5432

## Сервисы

### Frontend (Next.js)
- **Порт**: 3000
- **Технологии**: Next.js 15.2.4 с React 19
- **Сборка**: Многоступенчатая сборка Docker с оптимизациями
- **Особенности**: Standalone-вывод, оптимизировано для production
- **Команды сборки**: 
  - `yarn build` — Production-сборка (используется в Docker)
  - `yarn build:dev` — Development-сборка с git-метаданными

### Backend (Go)
- **Порт**: 8080
- **Технологии**: Go 1.24.4 с Gin framework
- **Особенности**: Аутентификация через Firebase, интеграция с PostgreSQL
- **Миграции**: Автоматические миграции базы данных при запуске

### База данных (PostgreSQL)
- **Порт**: 5432
- **Версия**: PostgreSQL 15 Alpine
- **Особенности**: Health checks, постоянное хранение данных (volume)

## Команды для разработки

### Запустить все сервисы
```bash
docker compose up
```

### Запустить сервисы в фоне
```bash
docker compose up -d
```

### Пересобрать и запустить сервисы
```bash
docker compose up --build
```

### Остановить все сервисы
```bash
docker compose down
```

### Просмотреть логи
```bash
# Все сервисы
docker compose logs

# Конкретный сервис
docker compose logs frontend
docker compose logs backend
docker compose logs postgres
```

### Доступ к контейнерам сервисов
```bash
# Контейнер backend
docker compose exec backend sh

# Контейнер frontend
docker compose exec frontend sh

# Контейнер базы данных
docker compose exec postgres psql -U clixxx_user -d clixxx_db
```

## Переменные окружения

### Переменные окружения backend
- `DB_HOST`: Хост базы данных (по умолчанию: postgres)
- `DB_PORT`: Порт базы данных (по умолчанию: 5432)
- `DB_USER`: Имя пользователя базы данных
- `DB_PASSWORD`: Пароль базы данных
- `DB_NAME`: Имя базы данных
- `APP_PORT`: Порт приложения (по умолчанию: 8080)
- `GIN_MODE`: Режим Gin (development/release)

### Переменные окружения frontend
- `NODE_ENV`: Окружение Node (development/production)
- `NEXT_PUBLIC_API_URL`: URL backend API
- `NEXT_PUBLIC_FIREBASE_*`: Конфигурация Firebase

**Примечание**: Docker-сборка использует `yarn build`, который не включает генерацию git-метаданных. Для development-сборки с git-информацией используйте `yarn build:dev` локально.

## Управление базой данных

### Запустить миграции вручную
```bash
docker compose exec backend ./main -migrate up
```

### Доступ к базе данных напрямую
```bash
docker compose exec postgres psql -U clixxx_user -d clixxx_db
```

### Резервное копирование базы данных
```bash
docker compose exec postgres pg_dump -U clixxx_user clixxx_db > backup.sql
```

### Восстановление базы данных
```bash
docker compose exec -T postgres psql -U clixxx_user clixxx_db < backup.sql
```

## Устранение неполадок

### Частые проблемы

1. **Конфликты портов**
   - Убедитесь, что порты 3000, 8080 и 5432 не заняты
   - При необходимости измените порт в `docker-compose.yml`

2. **Отсутствуют учетные данные Firebase**
   - Проверьте, что JSON-файл Firebase находится в нужной директории
   - Проверьте volume-монтирование в сервисе backend

3. **Проблемы с подключением к базе данных**
   - Дождитесь успешного прохождения health check у PostgreSQL
   - Проверьте переменные окружения базы данных

4. **Ошибки сборки**
   - Очистите кэш Docker: `docker system prune -a`
   - Пересоберите без кэша: `docker compose build --no-cache`

### Логи и отладка

```bash
# Проверить статус сервисов
docker compose ps

# Просмотр логов в реальном времени
docker compose logs -f

# Проверить использование ресурсов контейнерами
docker stats

# Инспектировать конкретный контейнер
docker compose exec backend printenv
```

## Production-деплой

### Настройка окружения
1. Обновите переменные окружения для production
2. Используйте безопасное хранение секретов
3. Настройте CORS для production
4. Настройте SSL-сертификаты
5. Настройте обратный прокси (nginx/traefik)

### Вопросы безопасности
- Измените стандартные учетные данные базы данных
- Используйте секреты для конфиденциальных настроек
- Включите SSL/TLS
- Настройте корректные правила firewall
- Регулярно обновляйте систему безопасности

## Оптимизация производительности

### База данных
- Настройте PostgreSQL для production-нагрузок
- Используйте connection pooling
- Оптимизируйте запросы и индексы

### Frontend
- Включите оптимизации Next.js
- Используйте CDN для статики
- Реализуйте грамотное кэширование

### Backend
- Настройте Go-приложение для production
- Включите логирование и мониторинг
- Реализуйте health checks 