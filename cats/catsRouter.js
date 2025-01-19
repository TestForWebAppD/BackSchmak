// Импорт модуля Express для создания маршрутов
const Router = require('express');
const router = new Router(); // Создание экземпляра маршрутизатора

// Импорт контроллера для обработки маршрутов
const controller = require('./catsController');

// Маршрут для получения всех котов (GET-запрос)
// Вызов метода `getAllCat` из контроллера
router.get('/allCats', controller.getAllCat);

//(POST-запросы)
// Маршрут для добавления нового кота
// Вызов метода `addCat` из контроллера
router.post('/add', controller.addCat);

// Маршрут для получения кота по его ID
// Вызов метода `getCatById` из контроллера
router.post('/get', controller.getCatById);

// Маршрут для получения котов по их породе
// Вызов метода `getCatByBreed` из контроллера
router.post('/catsByBreed', controller.getCatByBreed);

// Экспорт маршрутизатора для использования в других модулях
module.exports = router;
