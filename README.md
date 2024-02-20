# web3go від [alfar](https://t.me/+FozX3VZA0RIyNWY6)

**Примітка:** Цей скрипт все ще знаходиться в розробці. Використовуйте його на свій страх і ризик!

## Що може цей скрипт
- увійти в свій обліковий запис web3go
- створити паспорт, якщо потрібно (має бути ~$0.15 в bnb на гаманці)
- відкрити подарунки, якщо вони доступні
- відповісти на 6 вікторин, якщо доступні
- отримати checkIn бонус

Ви також можете перевірити дані в реальному часі у файлі output/table.txt. Таблиця буде оновлюється після виконання кожного акаунту.

## Як встановити
1. Завантажте та встановіть [Node.js](https://nodejs.org/en/download).
1. Встановіть команду - `npm install`.
1. Запустіть налаштування - `npm run initialize`.

## Налаштування
1. Заповніть файли `input/config.ini`, `input/private-keys.txt` та `input/proxies.txt`.

### Config
Значення в dynamic скупі можна змінювати під час виконання програми

- rpc: bsc rpc
- isRandomProxy:  __true__ - система вибере випадковий проксі, __false__ - використовуватиме номер гаманця
- minutesToInitializeAll: Час у хвилинах для налаштування всіх гаманців в першій ітерації. Для великої кількості гаманців можна поставити наприклад 7 днів (у хвилинах), щоб реєстрація була плавною
- minutesBeforeStart: Час у хвилинах для паузи перед початком роботи, якщо потрібно відкласти запуск
- isNewTaskAfterFinish (dynamic): Якщо __true__, то для кожного акаунту буде створена задача на наступний день, щоб зібрати checkIn бонус, у випадку налаштування __false__ задачі створяться тільки 1 раз

### Private keys
Кожен рядок - один приватний ключ, зі значеннями, розділеними **;**
- private key: ви можете використовувати приватний ключ з __0x__ або без нього
- name (необов'язково): якщо ви хочете вказати ім'я, ви можете додати його

Приклад приватного ключа: __0xaaaaabbbbb__ або __0xaaaaabbbbb;wallet1__ або __aaaaabbbbb__

### Proxies
Кожен рядок - один проксі, зі значеннями, розділеними **;**
- type: Виберіть __http__ або __socks__
- host: IP-адреса сервера проксі
- port: Номер порту для сервера проксі
- username: Ваше ім'я користувача для проксі
- password: Ваш пароль для проксі
- changeUrl (необов'язково для мобільного проксі): Веб-посилання для зміни налаштувань проксі

Приклад проксі: __http;11.1.1.1;8000;user;password__ або __socks;11.1.1.1;8000;user;password;https://provider-url.com/change-proxy__ (мобільний)

## Режим збору всіх
1. Введіть `npm run collect` і натисніть Enter.

## Як оновити
1. Введіть `npm run update`.
1. Якщо є нові налаштування, система створить резервну копію попереднього конфігураційного файлу та створить новий файл `input/config.ini`, який потрібно оновити!.

Наш канал в [Telegram](https://t.me/+FozX3VZA0RIyNWY6).
