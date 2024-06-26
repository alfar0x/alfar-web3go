# web3go від [alfar](https://t.me/+FozX3VZA0RIyNWY6)

**Примітка:** Цей скрипт все ще знаходиться в розробці. Використовуйте його на свій страх і ризик!

## Основний функціонал
- мінт паспорту (має бути ~$0.15 в bnb на гаманці)
- відкривання доступних подарунків
- відповіді на 6 початкових вікторин
- дейлі check in
- гра в лотерею
- оновлення інформації про акаунти в реальному часі

## Установка
1. Встановити [Node.js](https://nodejs.org/en/download).
1. Запустити `npm install`.
1. Запустити `npm run initialize`.
1. Інструкція для заповнення `input/config.ini`, `input/private-keys.txt` та `input/proxies.txt` файлів знаходиться нижче.

### Конфіг
- rpc: bsc rpc
- isRandomProxy:  __true__ - система вибере випадковий проксі, __false__ - використовуватиме номер гаманця
- errorWaitSec: пауза після помилки в секундах
- errorRetryTimes: кількість спроб у разі помилки
- minutesBeforeStart: пауза в хвилинах перед початком
- minSleepSecOnInit - мінімальний час (секунди) паузи між гаманцями у першій ітерації. При використанні мобільних проксі потрібно мати на увазі, що цього часу має вистачити на зміну проксі
- maxSleepSecOnInit - максимальний час (секунди) паузи між гаманцями у першій ітерації 
- isNewTaskAfterFinish: Якщо __true__, то для кожного акаунту буде створена задача на наступний день, щоб зібрати checkIn бонус, у випадку налаштування __false__ буде створено тільки 1 ітерацію

### Приватні ключі
Кожен рядок - один приватний ключ, зі значеннями, розділеними **;**
- private key: ви можете використовувати приватний ключ з __0x__ або без нього
- name (необов'язково): якщо ви хочете вказати ім'я, ви можете додати його

Приклад приватного ключа: __0xaaaaabbbbb__ або __0xaaaaabbbbb;wallet1__ або __aaaaabbbbb__

### Проксі
Кожен рядок - один проксі, зі значеннями, розділеними **;**
- type: Виберіть __https__ або __socks__
- host: IP-адреса сервера проксі
- port: Номер порту для сервера проксі
- username: Ваше ім'я користувача для проксі
- password: Ваш пароль для проксі
- changeUrl (необов'язково для мобільного проксі): Веб-посилання для зміни налаштувань проксі

Приклад проксі: __https;11.1.1.1;8000;user;password__ або __socks;11.1.1.1;8000;user;password;https://provider-url.com/change-proxy__ (мобільний)

## Режими

### Реєстрація
Логін, мінт пас, відповіді на квізи, отримання вітального опдарунку, чекін. Запуск: `npm run register`. Дані акаунтів записуються після виконання кожного акаунту в таблицю __output/register.csv__ у форматі: __адреса, дата оновлення, відкрито подарунків, відповідей на питання, дейлі стрік, к-сть листків__. 

### Чекін
Логін, чекін. Можна робити через register, але цей режим займає багато часу. Запуск: `npm run checkin`. Дані акаунтів записуються після виконання кожного акаунту в таблицю __output/checkin.csv__ у форматі: __адреса, дата оновлення, дейлі стрік, к-сть листків__. 

### Лотерея
Логін, грав в лотерею поки листів більше 2000. Запуск: `npm run lottery`. Дані акаунтів записуються після виконання кожного акаунту в таблицю __output/lottery.csv__ у форматі: __адреса, дата оновлення, к-сть листів, к-сть частин, к-сть чіпів__. 

### Збір офчейн інформації
Збір інформації з бази даних веб3го про к-сть листів, частини чіпів та чіпів. Запуск: `npm run offchain`. Дані акаунтів записуються після виконання кожного акаунту в таблицю __output/offchain.csv__ у форматі: __адреса, дата оновлення, к-сть листів, к-сть частин, к-сть чіпів__. 

## Оновлення
1. Запустити `npm run update`.
1. Якщо є нові налаштування, система створить резервну копію попереднього конфігураційного файлу та створить новий файл `input/config.ini` зі стандартними налаштуваннями!

Наш канал в [Telegram](https://t.me/+FozX3VZA0RIyNWY6)
