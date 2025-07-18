const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Подключение к MongoDB
mongoose.connect('mongodb://your-mongodb-uri', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'));

// Схема пользователя
const userSchema = new mongoose.Schema({
    userId: { type: String, unique: true },
    coins: { type: Number, default: 0 }
});
const User = mongoose.model('User', userSchema);

// Получение баланса
app.get('/balance/:userId', async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.params.userId });
        res.json({ coins: user ? user.coins : 0 });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Добавление монеты
app.post('/add-coin', async (req, res) => {
    try {
        const { userId } = req.body;
        let user = await User.findOne({ userId });
        if (!user) {
            user = new User({ userId, coins: 0 });
        }
        user.coins += 1;
        await user.save();
        res.json({ coins: user.coins });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Сброс монет
app.post('/reset', async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findOne({ userId });
        if (user) {
            user.coins = 0;
            await user.save();
        }
        res.json({ coins: 0 });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Перевод монет
app.post('/transfer', async (req, res) => {
    try {
        const { senderId, recipientId, amount } = req.body;
        if (senderId === recipientId) {
            return res.json({ success: false, message: 'Нельзя перевести монеты самому себе' });
        }
        let sender = await User.findOne({ userId: senderId });
        if (!sender) {
            sender = new User({ userId: senderId, coins: 0 });
        }
        if (sender.coins < amount) {
            return res.json({ success: false, message: 'Недостаточно монет' });
        }
        let recipient = await User.findOne({ userId: recipientId });
        if (!recipient) {
            recipient = new User({ userId: recipientId, coins: 0 });
        }
        sender.coins -= amount;
        recipient.coins += amount;
        await sender.save();
        await recipient.save();
        res.json({ success: true, senderCoins: sender.coins });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
