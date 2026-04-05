// 本地存储工具

const STORAGE_KEYS = {
    CONFIG: 'wordle-helper-config',
    GUESSES: 'wordle-helper-guesses',
    LETTER_STATUS: 'wordle-helper-letter-status',
    CURRENT_STATUS: 'wordle-helper-current-status'
};

// 保存数据到localStorage
function saveData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('保存数据失败:', error);
        return false;
    }
}

// 从localStorage加载数据
function loadData(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error('加载数据失败:', error);
        return defaultValue;
    }
}

// 保存配置
function saveConfig(config) {
    return saveData(STORAGE_KEYS.CONFIG, config);
}

// 加载配置
function loadConfig() {
    return loadData(STORAGE_KEYS.CONFIG, {
        answerLength: 5,
        guessMinLength: 4,
        guessMaxLength: 10
    });
}

// 保存猜词记录
function saveGuesses(guesses) {
    return saveData(STORAGE_KEYS.GUESSES, guesses);
}

// 加载猜词记录
function loadGuesses() {
    return loadData(STORAGE_KEYS.GUESSES, []);
}

// 保存字母状态
function saveLetterStatus(letterStatus) {
    return saveData(STORAGE_KEYS.LETTER_STATUS, letterStatus);
}

// 加载字母状态
function loadLetterStatus() {
    return loadData(STORAGE_KEYS.LETTER_STATUS, {});
}

// 保存当前状态
function saveCurrentStatus(status) {
    return saveData(STORAGE_KEYS.CURRENT_STATUS, status);
}

// 加载当前状态
function loadCurrentStatus() {
    return loadData(STORAGE_KEYS.CURRENT_STATUS, []);
}

// 清除所有数据
function clearAllData() {
    try {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        return true;
    } catch (error) {
        console.error('清除数据失败:', error);
        return false;
    }
}

// 导出所有数据
function exportAllData() {
    const data = {
        config: loadConfig(),
        guesses: loadGuesses(),
        letterStatus: loadLetterStatus(),
        currentStatus: loadCurrentStatus()
    };
    return JSON.stringify(data);
}

// 导入所有数据
function importAllData(data) {
    try {
        const parsedData = JSON.parse(data);
        if (parsedData.config) saveConfig(parsedData.config);
        if (parsedData.guesses) saveGuesses(parsedData.guesses);
        if (parsedData.letterStatus) saveLetterStatus(parsedData.letterStatus);
        if (parsedData.currentStatus) saveCurrentStatus(parsedData.currentStatus);
        return true;
    } catch (error) {
        console.error('导入数据失败:', error);
        return false;
    }
}

// 暴露全局函数
window.saveData = saveData;
window.loadData = loadData;
window.saveConfig = saveConfig;
window.loadConfig = loadConfig;
window.saveGuesses = saveGuesses;
window.loadGuesses = loadGuesses;
window.saveLetterStatus = saveLetterStatus;
window.loadLetterStatus = loadLetterStatus;
window.saveCurrentStatus = saveCurrentStatus;
window.loadCurrentStatus = loadCurrentStatus;
window.clearAllData = clearAllData;
window.exportAllData = exportAllData;
window.importAllData = importAllData;