// Конфигурация
const API_BASE_URL = 'https://your-worker-url.workers.dev'; // ЗАМЕНИТЕ на URL вашего Worker

// Инициализация
let tg = window.Telegram.WebApp;
let userTelegramId = tg.initDataUnsafe.user?.id;
let currentCoins = 0;

tg.expand();
tg.enableClosingConfirmation();
document.getElementById('userId').textContent = userTelegramId;

// Загружаем данные пользователя при запуске
fetchUserData();

// Функция загрузки данных пользователя
async function fetchUserData() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/user/${userTelegramId}`);
        const userData = await response.json();
        if (userData.error) throw new Error(userData.error);
        currentCoins = userData.coins;
        updateUI();
    } catch (error) {
        console.error('Ошибка загрузки:', error);
    }
}

// Обработчик клика
document.getElementById('clickBtn').addEventListener('click', async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/click`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegramId: userTelegramId })
        });
        const result = await response.json();
        if (result.success) {
            currentCoins++;
            updateUI();
            tg.HapticFeedback.impactOccurred('light');
        }
    } catch (error) {
        console.error('Ошибка клика:', error);
    }
});

// Обработчик перевода
document.getElementById('transferBtn').addEventListener('click', async () => {
    const receiverId = document.getElementById('receiverId').value;
    const amount = parseInt(document.getElementById('transferAmount').value);
    const statusEl = document.getElementById('transferStatus');

    if (!receiverId || !amount) {
        statusEl.textContent = 'Заполните все поля!';
        return;
    }
    if (amount > currentCoins) {
        statusEl.textContent = 'Недостаточно монет!';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/transfer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fromTelegramId: userTelegramId,
                toTelegramId: receiverId,
                amount: amount
            })
        });
        const result = await response.json();
        if (result.success) {
            statusEl.textContent = `Успешно переведено ${amount} монет!`;
            currentCoins -= amount;
            updateUI();
            tg.HapticFeedback.notificationOccurred('success');
        } else {
            statusEl.textContent = 'Ошибка: ' + result.error;
            tg.HapticFeedback.notificationOccurred('error');
        }
    } catch (error) {
        statusEl.textContent = 'Ошибка сети';
        console.error('Ошибка перевода:', error);
    }
});

// Обновление интерфейса
function updateUI() {
    document.getElementById('coins').textContent = currentCoins;
}
