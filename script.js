<button id="loginBtn">Вход</button>
                <button id="registerBtn">Регистрация</button>
            ;
            
            document.getElementById('loginBtn').addEventListener('click', () => showModal('loginModal'));
            document.getElementById('registerBtn').addEventListener('click', () => showModal('registerModal'));
            
            content.innerHTML = '';
        }
    }

    function showProfile() {
        const content = document.getElementById('content');
        content.innerHTML = 
            <h2>Здравствуйте: ${currentUser}</h2>
            <button id="logoutBtn">Выход</button>
        ;
        document.getElementById('logoutBtn').addEventListener('click', logout);
    }

    function showBalance() {
        const content = document.getElementById('content');
        content.innerHTML = 
            <h2>Здравствуйте: ${currentUser}</h2>
            <p>Ваш баланс: 0₽</p>
        ;
    }

    function showSupport() {
        const content = document.getElementById('content');
        content.innerHTML = 
            <h2>Необходима помощь?</h2>
            <p>Кодер @animarovs - telegram.</p>
        `;
    }

    // Инициализация
    updateUI();
});
