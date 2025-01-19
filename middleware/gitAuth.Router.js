// Подключение dotenv для работы с переменными окружения из файла .env
require('dotenv').config();

// Подключение Passport.js для аутентификации
const passport = require('passport');

// Подключение стратегии GitHub для Passport
const GitHubStrategy = require('passport-github2').Strategy;

// Настройка стратегии GitHub
passport.use(
    new GitHubStrategy(
        {
            // Установка параметров стратегии с использованием переменных окружения
            clientID: process.env.GITHUB_CLIENT_ID, // ID клиента GitHub
            clientSecret: process.env.GITHUB_CLIENT_SECRET, // Секрет клиента GitHub
            callbackURL: `${process.env.BACKEND_URL}/auth/github/callback`, // URL для обратного вызова после аутентификации
        },
        // Асинхронный обработчик для обработки данных профиля пользователя
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Извлечение необходимых данных из профиля пользователя
                const { id, username, emails, photos } = profile;
                const email = emails && emails[0]?.value; // Основной email пользователя
                const avatarUrl = photos && photos[0]?.value; // Ссылка на аватар пользователя

                // Завершение процесса сессии, передача данных пользователя
                done(null, { id, username, email, avatarUrl });
            } catch (error) {
                // Обработка ошибок и завершение процесса с ошибкой
                done(error);
            }
        }
    )
);

// Сериализация пользователя для сохранения в сессии
passport.serializeUser((user, done) => {
    done(null, user); // Сохранение всех данных пользователя в сессии
});

// Десериализация пользователя из сессии
passport.deserializeUser((obj, done) => {
    done(null, obj); // Восстановление данных пользователя из сессии
});

// Экспорт настроенного объекта Passport для использования в других модулях
module.exports = passport;
