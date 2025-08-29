class CoinClicker {
    constructor() {
        this.userId = null;
        this.balance = 0;
        this.telegram = null;
        this.scriptURL = 'https://script.google.com/macros/s/AKfycbyHp75FuBvWx_S-LXq-9LgsFAQILxRZ0y05Fa7_urGCS1scJK5wqcEuFLfb8CbRnRF0/exec';
        this.init();
    }

    async init() {
        try {
            // Инициализация Telegram Web App
            this.telegram = window.Telegram.WebApp;
            if (this.telegram) {
                this.telegram.expand();
                this.telegram.enableClosingConfirmation();
                this.userId = this.telegram.initDataUnsafe.user?.id;
            }
            
            // Если нет Telegram user ID, создаем гостевой
            if (!this.userId) {
                this.userId = 'guest_' + Math.random().toString(36).substr(2, 9);
            }

            await this.loadBalance();
            await this.loadLeaderboard();
            
            // Добавляем обработчик клика
            document.getElementById('coin').addEventListener('click', () => this.handleClick());
            
        } catch (error) {
            console.error('Ошибка инициализации:', error);
            document.getElementById('balance').textContent = 'Ошибка загрузки';
        }
    }

    async handleClick() {
        this.balance++;
        document.getElementById('balance').textContent = `${this.balance} монет`;
        
        try {
            await this.updateBalance();
            await this.loadLeaderboard();
        } catch (error) {
            console.error('Ошибка при обновлении:', error);
            // Сохраняем локально при ошибке сети
            localStorage.setItem(`coin_balance_${this.userId}`, this.balance);
        }
    }

    async makeRequest(url, options = {}) {
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });
            
            if (!response.ok) throw new Error('Network error');
            return await response.json();
            
        } catch (error) {
            console.log('Прямой запрос не удался, пробуем CORS proxy');
            
            // Используем CORS proxy как fallback
            try {
                const corsProxy = 'https://api.allorigins.win/raw?url=';
                const proxyUrl = corsProxy + encodeURIComponent(url);
                
                const proxyResponse = await fetch(proxyUrl, options);
                if (!proxyResponse.ok) throw new Error('CORS proxy also failed');
                return await proxyResponse.json();
            } catch (proxyError) {
                throw new Error('Все методы запроса не удались');
            }
        }
    }

    async updateBalance() {
        const data = {
            action: 'update',
            userId: this.userId,
            balance: this.balance,
            username: this.telegram?.initDataUnsafe.user?.username || 'Гость',
            firstName: this.telegram?.initDataUnsafe.user?.first_name || 'Игрок'
        };

        const response = await this.makeRequest(this.scriptURL, {
            method: 'POST',
            body: JSON.stringify(data)
        });

        if (!response.success) {
            throw new Error('Ошибка обновления баланса');
        }
    }

    async loadBalance() {
        try {
            const url = `${this.scriptURL}?action=get&userId=${encodeURIComponent(this.userId)}&t=${Date.now()}`;
            const data = await this.makeRequest(url);
            
            if (data.success && data.balance !== undefined) {
                this.balance = data.balance;
            } else {
                // Пробуем загрузить из localStorage
                const saved = localStorage.getItem(`coin_balance_${this.userId}`);
                this.balance = saved ? parseInt(saved) : 0;
            }
            
            document.getElementById('balance').textContent = `${this.balance} монет`;
            
        } catch (error) {
            console.error('Ошибка загрузки баланса:', error);
            const saved = localStorage.getItem(`coin_balance_${this.userId}`);
            this.balance = saved ? parseInt(saved) : 0;
            document.getElementById('balance').textContent = `${this.balance} монет`;
        }
    }

    async loadLeaderboard() {
        try {
            const url = `${this.scriptURL}?action=leaderboard&t=${Date.now()}`;
            const data = await this.makeRequest(url);
            
            if (data.success) {
                this.displayLeaderboard(data.leaderboard);
                this.displayUserRank(data.leaderboard);
            }
        } catch (error) {
            console.error('Ошибка загрузки таблицы лидеров:', error);
            document.getElementById('leaderboard').innerHTML = 
                '<div class="loading">Не удалось загрузить рейтинг</div>';
        }
    }

    displayLeaderboard(leaderboard) {
        const leaderboardElement = document.getElementById('leaderboard');
        
        if (!leaderboard || leaderboard.length === 0) {
            leaderboardElement.innerHTML = '<div class="loading">Рейтинг пуст</div>';
            return;
        }

        let html = '';
        leaderboard.slice(0, 100).forEach((player, index) => {
            const displayName = player.username || player.firstName || `Игрок ${player.userId.substr(0, 6)}`;
            
            html += `
                <div class="leaderboard-item">
                    <span class="rank">${index + 1}.</span>
                    <span class="username">${this.escapeHtml(displayName)}</span>
                    <span class="user-balance">${player.balance} ₿</span>
                </div>
            `;
        });
        
        leaderboardElement.innerHTML = html;
    }

    displayUserRank(leaderboard) {
        const userRankElement = document.getElementById('user-rank');
        const userPositionElement = document.getElementById('user-position');
        
        if (!leaderboard) {
            userRankElement.style.display = 'none';
            return;
        }

        const userIndex = leaderboard.findIndex(player => player.userId === this.userId);
        
        if (userIndex !== -1) {
            userPositionElement.textContent = `${userIndex + 1} место`;
            userRankElement.style.display = 'block';
        } else {
            userRankElement.style.display = 'none';
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
    new CoinClicker();
});
