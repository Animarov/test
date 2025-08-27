// Инициализируем Telegram Web App
let tg = window.Telegram.WebApp;
tg.expand(); // Раскрываем приложение на весь экран
let user_id = tg.initDataUnsafe.user.id; // Получаем ID пользователя

const coinsDisplay = document.getElementById('coins');
const clickButton = document.getElementById('clickBtn');

// Замените эту ссылку на URL вашего Google Apps Script!
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxonasAJEwvD25m-s_YXNVFUMorpQm0eNDYB9ix3FbNJmZEO1omXzHplHJVMaRfJrQsIw/exec";

// Функция для загрузки баланса при старте
function loadCoins() {
    fetch(`${SCRIPT_URL}?user_id=${user_id}`)
        .then(response => response.text())
        .then(data => {
            coinsDisplay.innerText = data;
        });
}

// Функция для обработки клика
function handleClick() {
    // Отправляем запрос на сервер, чтобы увеличить счетчик
    fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `user_id=${user_id}`
    })
    .then(response => response.text())
    .then(newBalance => {
        coinsDisplay.innerText = newBalance; // Обновляем счетчик на экране
    });
}

// Вешаем обработчик на кнопку
clickButton.addEventListener('click', handleClick);

// Загружаем монеты при запуске
loadCoins();
