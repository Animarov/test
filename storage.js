// storage.js - Альтернативное хранилище для случаев, когда CloudStorage недоступен

class CoinStorage {
    constructor() {
        this.STORAGE_KEY = 'tg_coins_storage';
        this.data = this.loadData();
    }

    loadData() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            console.error('Failed to load storage data:', e);
            return {};
        }
    }

    saveData() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
        } catch (e) {
            console.error('Failed to save storage data:', e);
        }
    }

    async getCoins(userId) {
        if (Telegram.WebApp.isVersionAtLeast('6.9')) {
            try {
                const result = await Telegram.WebApp.CloudStorage.getItem(`coins_${userId}`);
                return parseInt(result || '0') || 0;
            } catch (e) {
                console.error('CloudStorage error, falling back to local:', e);
            }
        }
        return this.data[userId] || 0;
    }

    async setCoins(userId, count) {
        if (Telegram.WebApp.isVersionAtLeast('6.9')) {
            try {
                await Telegram.WebApp.CloudStorage.setItem(`coins_${userId}`, count.toString());
            } catch (e) {
                console.error('CloudStorage error, falling back to local:', e);
            }
        }
        this.data[userId] = count;
        this.saveData();
    }
}

// Экспорт для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CoinStorage;
}
const storage = new CoinStorage();

// Получение монет
storage.getCoins(user.id).then(count => {
    coinCount = count;
    document.getElementById('coin-count').textContent = coinCount;
});

// Сохранение монет
storage.setCoins(user.id, coinCount).then(() => {
    console.log('Coins saved');
});
