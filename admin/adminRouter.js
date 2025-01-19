// Импорт необходимых модулей
const Router = require('express'); // Экспресс для создания маршрутов
const router = new Router(); // Создание нового роутера
const controller = require('./adminController'); // Контроллер администратора
const authMiddleware = require('../middleware/authMiddleware'); // Миддлвар для проверки авторизации
const passport = require("passport"); // Для работы с аутентификацией через GitHub

// Проверка валидности токена
router.get('/validate-token', authMiddleware, (req, res) => {
    res.status(200).json({ valid: true }); // Если токен валиден, возвращаем статус 200
});

// Маршрут для начала аутентификации через GitHub
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

// Обработка обратного вызова после аутентификации через GitHub
router.get(
    '/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }), // В случае ошибки редирект на /login
    controller.githubCallback // Обработка успешной аутентификации
);

// Ручной логин для администратора
router.post('/login', controller.login);

// Обновление данных кота (PUT)
router.put('/updateCat', controller.updateCat);

// Удаление кота (DELETE)
router.delete('/deleteCat', controller.deleteCat);

// Получение всех названий пород (GET)
router.get('/AllBreeds', controller.getAllBreeds);

// Получение полной информации о всех породах (GET)
router.get('/getAllBreedsInfo', controller.getAllBreedsInfo);

// Получение всех пользователей (GET)
router.get('/getAllUsers', controller.getAllUsers);

// Добавление новой породы (POST)
router.post('/addBreed', controller.addBreed);

// Обновление информации о породе (PUT)
router.put('/updateBreed', controller.updateBreed);

// Удаление породы (DELETE)
router.delete('/deleteBreed', controller.deleteBreed);

// Удаление пользователя (DELETE)
router.delete('/deleteUser', controller.deleteUser);

// Экспорт маршрутов
module.exports = router;
