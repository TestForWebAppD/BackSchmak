// Импорт модуля JSON Web Token для работы с токенами
const jwt = require('jsonwebtoken');
// Импорт секретного ключа для проверки токена
const { secret } = require('../config');

// Миддлвар для проверки авторизации администратора
const authAdminMiddleware = (req, res, next) => {
    try {
        // Извлекаем токен из заголовка Authorization
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            // Если токен отсутствует, возвращаем ошибку 401 (не авторизован)
            return res.status(401).json({ message: 'Authorization required' });
        }

        // Расшифровываем и проверяем токен с использованием секретного ключа
        const decoded = jwt.verify(token, secret);

        // Проверяем, содержит ли токен роль "ADMIN"
        if (!decoded.roles.includes('ADMIN')) {
            // Если роль не соответствует, возвращаем ошибку 403 (доступ запрещен)
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        // Добавляем информацию о пользователе в объект `req` для дальнейшего использования
        req.user = decoded;

        // Переходим к следующему миддлвару или маршруту
        next();
    } catch (e) {
        // Обрабатываем ошибки, например, неверный или истекший токен
        console.error('Admin authentication error:', e);
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Экспорт миддлвара для использования в маршрутах
module.exports = authAdminMiddleware;
