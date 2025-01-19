// Подключение необходимых модулей
const express = require('express'); // Экспресс-фреймворк для создания серверного приложения
const mongoose = require('mongoose'); // Mongoose для работы с MongoDB
const cors = require('cors'); // CORS для управления междоменными запросами

const session = require('express-session'); // Сессии для хранения данных между запросами
const passport = require('./config/passport'); // Конфигурация Passport для аутентификации

// Роутеры
const authRouter = require('./authRouter'); // Роутер для обработки маршрутов аутентификации
const catsRouter = require('./cats/catsRouter'); // Роутер для обработки маршрутов, связанных с котами
const adminRouter = require('./admin/adminRouter'); // Роутер для маршрутов администрирования

// Создание приложения Express
const app = express();

// Порт по умолчанию
const PORT = 5000;

// Мидлвары для обработки JSON и разрешения CORS
app.use(express.json()); // Мидлвар для парсинга JSON
app.use(cors()); // Мидлвар для разрешения запросов из других источников

app.get('/', (req, res) => {
    res.send('Сервер работает!');
});

/*
    Подключение к базе данных MongoDB, таблице aljena
*/
mongoose.connect('mongodb+srv://admin:ZxcGul1000minus7@cluster0.r7acfi5.mongodb.net/aljena?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => {
        console.log('DB OK'); // Вывод сообщения об успешном подключении
    })
    .catch((err) => console.log('DB error: ' + err)); // Обработка ошибок подключения

// Конфигурация сессий
app.use(
    session({
        secret: 'cb0c0a4b4a480fe1e6934f1ece7d39143e311284', // Секретный ключ для подписи сессий
        resave: false, // Не пересохранять сессию, если она не изменялась
        saveUninitialized: true, // Сохранять пустую сессию, даже если в ней нет данных
    })
);

// Инициализация Passport.js для аутентификации
app.use(passport.initialize()); // Инициализация Passport
app.use(passport.session()); // Использование сессий с Passport

// Регистрация маршрутов
app.use('/auth', authRouter); // Маршруты аутентификации
app.use('/cats', catsRouter); // Маршруты для работы с котами
app.use('/admin', adminRouter); // Маршруты для администрирования

// Запуск сервера
app.listen(PORT, '0.0.0.0', () => console.log("Server run on port 5000!")); // Сервер слушает указанный порт
