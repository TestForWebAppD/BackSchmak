// Импорт необходимых модулей
const { validationResult } = require('express-validator'); // Для проверки валидации входных данных
const jwt = require('jsonwebtoken'); // Для работы с JWT токенами
const { secret } = require('../config'); // Секретный ключ для подписи и проверки токенов

// Импорт моделей
const User = require('../models/user'); // Модель пользователя
const Cat = require('../models/cat'); // Модель кота

// Класс для управления функционалом, связанным с котами
class catController {
    // Метод для добавления нового кота
    async addCat(req, res) {
        try {
            // Проверка входных данных на ошибки валидации
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: "error cat >*<" }); // Ответ с ошибкой валидации
            }

            // Извлечение токена из заголовков авторизации
            const token = req.headers.authorization.split(' ')[1];
            const decodedData = jwt.verify(token, secret); // Декодирование токена
            const userId = decodedData.id; // Извлечение ID пользователя из токена

            // Извлечение данных кота из тела запроса
            const { name, breed, sex, age, story, img } = req.body;

            // Создание нового объекта кота
            const newCat = new Cat({
                name,
                breed,
                sex,
                age,
                story,
                img,
                owner: userId, // Привязка кота к пользователю
            });

            await newCat.save(); // Сохранение нового кота в базе данных

            // Обновление списка котов у пользователя
            const user = await User.findById(userId);
            user.cats.push(newCat._id); // Добавление ID кота в массив пользователя
            await user.save();

            // Ответ об успешном добавлении кота
            res.status(201).json({ message: "Cat success added", cat: newCat });
        } catch (e) {
            console.log(e); // Логирование ошибки
            res.status(400).json({ message: "error cat >*<" }); // Ответ с ошибкой
        }
    }

    // Метод для получения всех котов
    async getAllCat(req, res) {
        try {
            const cat = await Cat.find(); // Поиск всех котов в базе данных
            res.json(cat); // Ответ с массивом котов
        } catch (e) {
            res.status(404).json({ message: 'Login error' }); // Ответ с ошибкой
            console.log(e); // Логирование ошибки
        }
    }

    // Метод для получения кота по ID
    async getCatById(req, res) {
        try {
            const { id } = req.body; // Извлечение ID кота из тела запроса
            const cat = await Cat.findById(id); // Поиск кота в базе данных по ID

            if (!cat) {
                return res.status(404).json({ message: 'Cat not found' }); // Ответ, если кот не найден
            }

            res.json(cat); // Ответ с данными кота
        } catch (e) {
            console.error(e); // Логирование ошибки
            res.status(500).json({ message: 'Error fetching cat' }); // Ответ с ошибкой
        }
    }

    // Метод для получения котов по породе
    async getCatByBreed(req, res) {
        try {
            const { breed } = req.body; // Извлечение породы кота из тела запроса
            const cat = await Cat.find({ breed: breed }); // Поиск котов по породе

            if (!cat) {
                return res.status(404).json({ message: 'Cat not found' }); // Ответ, если коты не найдены
            }

            res.json(cat); // Ответ с массивом котов
        } catch (e) {
            console.error(e); // Логирование ошибки
            res.status(404).json({ message: 'Login error' }); // Ответ с ошибкой
        }
    }
}

// Экспорт экземпляра класса для использования в других модулях
module.exports = new catController();
