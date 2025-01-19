// Подключаем необходимые библиотеки
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { secret } = require('./config');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Подключение моделей
const User = require('./models/user');
const Post = require('./models/post');
const Role = require('./models/role');
const crypto = require("crypto");

// Функция для генерации токена доступа
const generateAccessToken = (id, roles) => {
    const payload = {
        id,
        roles,
    };

    // Генерируем JWT токен с истечением через 24 часа
    return jwt.sign(payload, secret, { expiresIn: '24h' });
}

// Конфигурация хранилища для multer (для загрузки файлов)
const storage = multer.diskStorage({
    // Указываем папку для загрузки файлов
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'uploads', 'posts');
        fs.mkdirSync(uploadPath, { recursive: true }); // Создаем папку, если ее нет
        cb(null, uploadPath);
    },
    // Уникальное имя файла для предотвращения дубликатов
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
});

// Экземпляр multer с указанным хранилищем
const upload = multer({ storage });

// Контроллер аутентификации и работы с пользователями
class authController {
    // Коллбэк для GitHub аутентификации
    async githubCallback(req, res) {
        try {
            const user = req.user; // Получаем пользователя из профиля GitHub
            const username = user.username;

            // Проверяем, существует ли уже пользователь с таким именем
            let existingUser = await User.findOne({ username });

            if (!existingUser) {
                // Генерация случайного пароля, если пользователь новый
                const randomPassword = crypto.randomBytes(8).toString('hex');
                const hashedPassword = bcrypt.hashSync(randomPassword, 8);

                // Находим роль для пользователя (если не найдена, возвращаем ошибку)
                const userRole = await Role.findOne({ value: "USER" });
                if (!userRole) {
                    return res.status(400).json({ message: 'Role "USER" not found' });
                }

                // Создаем нового пользователя
                existingUser = new User({
                    username: username,
                    password: hashedPassword,
                    roles: [userRole.value],
                    git: 'git',
                });
                await existingUser.save();
            }

            // Генерируем токен для нового пользователя
            const userId = existingUser._id;
            const userRoles = existingUser.roles;

            const token = generateAccessToken(userId, userRoles);

            // Перенаправляем пользователя на страницу входа с токеном
            res.redirect(`http://45.9.43.165:3000/login?token=${token}&name=${username}`);
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: 'GitHub Login Error' });
        }
    }

    // Регистрация пользователя
    async registration(req, res) {
        try {
            // Проверяем наличие ошибок в запросе (например, пустой логин)
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: "Username must not be empty" });
            }

            const { username, password } = req.body;
            const candidate = await User.findOne({ username });
            if (candidate) { // Проверяем, существует ли пользователь
                return res.status(400).json({ message: "User already exists" });
            }

            // Хэшируем пароль и создаем нового пользователя
            const hashPassword = bcrypt.hashSync(password, 8);
            const userRole = await Role.findOne({ value: "USER" });
            const user = new User({ username, password: hashPassword, roles: [userRole.value] });

            await user.save();
            return res.status(201).json({ message: "Registration successfully" });
        } catch (e) {
            console.error("Registration error:", e);
            return res.status(500).json({ message: "Registration error" });
        }
    }

    // Вход пользователя
    async login(req, res) {
        try {
            const { username, password } = req.body;
            const user = await User.findOne({ username });
            if (!user) {
                return res.status(400).json({ message: "User not found" });
            }

            // Проверяем правильность пароля
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({ message: "Password is incorrect" });
            }

            // Генерируем токен для входа
            const token = generateAccessToken(user._id, user.roles);
            return res.json({ token });
        } catch (e) {
            console.error("Login error:", e);
            return res.status(500).json({ message: "Login error" });
        }
    }

    // Получение всех пользователей
    async getUsers(req, res) {
        try {
            const users = await User.find();
            res.json(users);
        } catch (e) {
            console.log(e);
        }
    }

    // Получение профиля текущего пользователя
    async getProfile(req, res) {
        try {
            const userId = req.user.id;
            const user = await User.findById(userId).select('-password'); // Исключаем поле с паролем
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json(user);
        } catch (e) {
            console.log(e);
            res.status(400).json({ message: 'Error fetching profile' });
        }
    }

    // Добавление нового поста
    async addPost(req, res) {
        try {
            const { title, description, kitty } = req.body;

            // Обрабатываем изображение, если оно прикреплено
            let imagePath = null;
            if (req.file) {
                imagePath = req.file.path;
            }

            // Создаем новый пост
            const newPost = new Post({
                title,
                description,
                kitty,
                img: imagePath,
                user: req.user ? req.user.id : null, // Если есть автор, сохраняем его id
            });

            const savedPost = await newPost.save();

            // Перемещаем изображение в папку с постом
            if (req.file) {
                const postDir = path.join(__dirname, 'uploads', 'posts', savedPost._id.toString());
                fs.mkdirSync(postDir, { recursive: true });

                const oldPath = req.file.path;
                const newPath = path.join(postDir, req.file.filename);
                fs.renameSync(oldPath, newPath);
            }

            res.status(201).json(savedPost);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error creating post' });
        }
    }

    // Получение всех постов
    async getAllPosts(req, res) {
        try {
            const post = await Post.find();

            if (!post) {
                return res.status(404).json({ message: 'Cat not found' });
            }

            res.json(post);
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: 'Error fetching cat' });
        }
    }
}

// Экспортируем контроллер
module.exports = new authController();
