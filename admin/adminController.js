// Импорт необходимых модулей и моделей
const Cat = require('../models/cat'); // Модель котов
const User = require('../models/user'); // Модель пользователей
const Role = require('../models/role'); // Модель ролей
const Breed = require('../models/Breed'); // Модель пород
const bcrypt = require("bcryptjs"); // Модуль для хэширования паролей
const jwt = require('jsonwebtoken'); // Для работы с JWT токенами
const { secret } = require('../config'); // Секретный ключ для токенов
const crypto = require("crypto"); // Модуль для генерации случайных значений

// Функция для генерации JWT токена
const generateAccessToken = (id, roles) => {
    const payload = { id, roles }; // Данные, включаемые в токен
    return jwt.sign(payload, secret, { expiresIn: '24h' }); // Подпись токена с установленным сроком действия
};

// Класс `adminController`, содержащий методы для работы с данными администратора
class adminController {
    // Обработка обратного вызова после аутентификации через GitHub
    async githubCallback(req, res) {
        try {
            const user = req.user; // Получение пользователя из запроса
            const username = user.username; // Имя пользователя

            // Проверка существования пользователя в базе данных
            let existingUser = await User.findOne({ username });

            if (!existingUser) {
                // Если пользователь не существует, создаем нового
                const randomPassword = crypto.randomBytes(16).toString('hex'); // Генерация случайного пароля
                const hashedPassword = bcrypt.hashSync(randomPassword, 8); // Хэширование пароля

                const userRole = await Role.findOne({ value: "USER" }); // Получение роли "USER"
                if (!userRole) {
                    return res.status(400).json({ message: 'Role "USER" not found' });
                }

                if (!user.roles.includes('ADMIN')) {
                    return res.status(403).json({ message: 'Access denied. Not an admin.' }); // Проверка прав администратора
                }

                // Создание нового пользователя
                existingUser = new User({
                    username: username,
                    password: hashedPassword,
                    roles: [userRole.value],
                    git: 'git',
                });
                await existingUser.save(); // Сохранение пользователя
            }

            const userId = existingUser._id;
            const userRoles = existingUser.roles;

            const token = generateAccessToken(userId, userRoles); // Генерация токена

            // Перенаправление пользователя на клиентское приложение
            res.redirect(`http://45.9.43.165:3000/login?token=${token}&name=${username}`);
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: 'GitHub Login Error' });
        }
    }

    async getAllBreedsInfo(req, res) {
        try {
            const breeds = await Breed.find();
            res.json({ breeds });
        } catch (error) {
            console.error("Error fetching breeds:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    async updateBreed(req, res) {
        const { oldBreedName, newBreedName, description, character, appearance } = req.body;

        if (!oldBreedName || !newBreedName || !description || !character || !appearance) {
            return res.status(400).json({ message: "All fields (oldBreedName, newBreedName, description, character, appearance) are required" });
        }

        try {
            const updatedBreed = await Breed.findOneAndUpdate(
                { name: oldBreedName },
                {
                    name: newBreedName,
                    description,
                    character,
                    appearance,
                },
                { new: true }
            );

            if (!updatedBreed) {
                return res.status(404).json({ message: "Breed not found" });
            }

            res.json({ message: "Breed updated", breed: updatedBreed });
        } catch (error) {
            console.error("Error updating breed:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    // Логин администратора
    async login(req, res) {
        try {
            const { username, password } = req.body; // Получение данных из запроса

            const user = await User.findOne({ username }); // Поиск пользователя
            if (!user) {
                return res.status(404).json({ message: 'Invalid password or login' });
            }

            if (!user.roles.includes('ADMIN')) {
                return res.status(403).json({ message: 'User is not admin' });
            }

            const isPasswordValid = bcrypt.compareSync(password, user.password); // Проверка пароля
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid password or login' });
            }

            const token = generateAccessToken(user._id, user.roles); // Генерация токена
            return res.status(200).json({ token });
        } catch (e) {
            console.error('Login error:', e);
            return res.status(500).json({ message: 'Login error' });
        }
    }

    // Обновление данных кота
    async updateCat(req, res) {
        const { id, name, breed, sex, age, story, img } = req.body;

        if (!id || !name || !breed || !age || !story) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        try {
            console.log("Updating kitty with ID:", id);
            const updatedKitty = await Cat.findByIdAndUpdate(
                id,
                { name, breed, sex, age, story, img },
                { new: true }
            );

            if (!updatedKitty) {
                return res.status(404).json({ message: 'Kitty not found' });
            }

            res.status(200).json(updatedKitty);
        } catch (error) {
            console.error('Error updating kitty:', error);
            res.status(500).json({ message: 'Error updating kitty' });
        }
    }

    // Удаление кота
    async deleteCat(req, res) {
        const { id } = req.body;

        try {
            const deletedKitty = await Cat.findByIdAndDelete(id);

            if (!deletedKitty) {
                return res.status(404).json({ message: 'Kitty not found' });
            }

            res.status(204).send();
        } catch (error) {
            console.error('Error deleting kitty:', error);
            res.status(500).json({ message: 'Error deleting kitty' });
        }
    }

    // Получение всех пород
    async getAllBreeds(req, res) {
        try {
            const breeds = await Breed.find().select('name'); // Получаем только названия пород
            const breedNames = breeds.map(breed => breed.name);
            res.json({ breeds: breedNames });
        } catch (error) {
            console.error("Error fetching breeds:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    // Добавление новой породы
    async addBreed(req, res) {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Breed name is required" });
        }

        try {
            const newBreed = new Breed({ name });
            await newBreed.save();
            res.status(201).json({ message: "Breed added", breed: newBreed });
        } catch (error) {
            if (error.code === 11000) {
                return res.status(400).json({ message: "Breed already exists" });
            }
            console.error("Error adding breed:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    // Удаление породы
    async deleteBreed(req, res) {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Breed name is required" });
        }

        try {
            const deletedBreed = await Breed.findOneAndDelete({ name });
            if (!deletedBreed) {
                return res.status(404).json({ message: "Breed not found" });
            }

            res.json({ message: "Breed deleted", breed: deletedBreed });
        } catch (error) {
            console.error("Error deleting breed:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    // Получение всех пользователей
    async getAllUsers(req, res) {
        try {
            const users = await User.find();
            res.status(200).json(users);
        } catch (error) {
            console.error("Error fetching users:", error);
            res.status(500).json({ error: "Error fetching users" });
        }
    }

    // Удаление пользователя
    async deleteUser(req, res) {
        try {
            const { userId } = req.body;

            const deletedUser = await User.findOneAndDelete({ username: userId });

            if (!deletedUser) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }

            res.status(200).json({ message: 'Пользователь удалён' });
        } catch (error) {
            console.error('Ошибка при удалении пользователя:', error);
            res.status(500).json({ message: 'Ошибка сервера при удалении пользователя' });
        }
    }
}

// Экспорт экземпляра контроллера
module.exports = new adminController();
