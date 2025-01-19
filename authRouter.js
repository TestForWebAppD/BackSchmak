// Подключаем необходимые модули
const Router = require('express');  // Express для создания маршрутов
const passport = require('passport');  // Passport для аутентификации через сторонние сервисы, например, GitHub
const router = new Router();  // Создаем новый экземпляр маршрутизатора Express
const controller = require('./authController');  // Импортируем контроллер для аутентификации и обработки запросов
const { check } = require('express-validator');  // Для валидации данных в запросах
const authMiddleware = require('./middleware/authMiddleware');  // Мидлвар для проверки аутентификации пользователя

// Проверка токена для валидности
router.get('/validate-token', authMiddleware, (req, res) => {
    // Если токен действителен, возвращаем успешный статус
    res.status(200).json({ valid: true });
});

// Запрос на аутентификацию через GitHub
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

// Обработка коллбэка после аутентификации через GitHub
router.get(
    '/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),  // Перенаправляем на страницу логина в случае ошибки
    controller.githubCallback  // Вызываем функцию для обработки данных после успешной аутентификации
);

// Регистрация нового пользователя с валидацией
router.post('/registration', [
    check('username', "username must not be empty").notEmpty(),  // Проверяем, чтобы поле username не было пустым
    check('password', "password must not be empty").isLength({min: 8, max: 64}),  // Проверяем длину пароля
], controller.registration);  // Вызываем метод регистрации из контроллера

// Вход пользователя
router.post('/login', controller.login);  // Обрабатываем запрос на вход и вызываем метод login из контроллера

// Добавление поста, требует аутентификации
router.post('/addPost', authMiddleware, controller.addPost);  // Применяем middleware для проверки токена и вызываем метод addPost из контроллера

// Получение всех постов
router.get('/getAllPosts', controller.getAllPosts);  // Возвращаем все посты из базы данных

// Получение всех пользователей, требует аутентификации
router.get('/users', authMiddleware, controller.getUsers);  // Применяем middleware для проверки токена и вызываем метод getUsers из контроллера

// Получение профиля текущего пользователя
router.get('/profile', authMiddleware, controller.getProfile);  // Применяем middleware для проверки токена и вызываем метод getProfile из контроллера

// Экспортируем маршруты для использования в другом месте
module.exports = router;
