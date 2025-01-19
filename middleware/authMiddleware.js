// Импорт метода verify из библиотеки jsonwebtoken для проверки токена
const { verify } = require("jsonwebtoken");
// Импорт секретного ключа для проверки токена
const { secret } = require("../config");

// Экспорт функции-миддлвара для проверки авторизации пользователя
module.exports = function(req, res, next) {
    // Проверяем, является ли метод запроса OPTIONS
    // Метод OPTIONS используется для предварительных запросов, поэтому его можно пропустить
    if (req.method === 'OPTIONS') {
        next(); // Переходим к следующему обработчику
    }

    try {
        // Извлекаем токен из заголовка Authorization
        const token = req.headers.authorization.split(' ')[1];

        // Если токен отсутствует, возвращаем ошибку 403 (доступ запрещен)
        if (!token) return res.status(403).json({ message: 'User not auth' });

        // Расшифровываем и проверяем токен с использованием секретного ключа
        const decodedData = verify(token, secret);

        // Добавляем расшифрованные данные пользователя в объект req
        req.user = decodedData;

        // Переходим к следующему обработчику или маршруту
        next();
    } catch (e) {
        // Логируем ошибку, если что-то пошло не так
        console.log(e);

        // Возвращаем ошибку 403 (доступ запрещен) с сообщением
        return res.status(403).json({ message: 'User not auth' });
    }
};
