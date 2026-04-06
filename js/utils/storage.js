// 本地存储工具
window.StorageUtil = {
    // 存储数据
    setItem: function(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('存储数据失败:', error);
        }
    },
    
    // 获取数据
    getItem: function(key, defaultValue) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (error) {
            console.error('获取数据失败:', error);
            return defaultValue;
        }
    },
    
    // 删除数据
    removeItem: function(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('删除数据失败:', error);
        }
    },
    
    // 清空所有数据
    clear: function() {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('清空数据失败:', error);
        }
    },
    
    // 存储猜词记录
    saveGuesses: function(guesses) {
        this.setItem('wordle_guesses', guesses);
    },
    
    // 获取猜词记录
    getGuesses: function() {
        return this.getItem('wordle_guesses', []);
    },
    
    // 存储字母状态
    saveLetterStatus: function(letterStatus) {
        this.setItem('wordle_letter_status', letterStatus);
    },
    
    // 获取字母状态
    getLetterStatus: function() {
        return this.getItem('wordle_letter_status', this.getDefaultLetterStatus());
    },
    
    // 存储配置
    saveConfig: function(config) {
        this.setItem('wordle_config', config);
    },
    
    // 获取配置
    getConfig: function() {
        return this.getItem('wordle_config', {
            answerLength: 5,
            minGuessLength: 4,
            maxGuessLength: 10,
            feedbackPreset: window.Constants.DEFAULT_FEEDBACK_PRESET
        });
    },
    
    // 存储颜色反馈配置
    saveFeedbackPreset: function(preset) {
        const config = this.getConfig();
        config.feedbackPreset = preset;
        this.saveConfig(config);
    },
    
    // 获取颜色反馈配置
    getFeedbackPreset: function() {
        return this.getConfig().feedbackPreset || window.Constants.DEFAULT_FEEDBACK_PRESET;
    },
    
    // 存储当前模式
    saveMode: function(mode) {
        this.setItem('wordle_mode', mode);
    },
    
    // 获取当前模式
    getMode: function() {
        return this.getItem('wordle_mode', 'note'); // 'note' 或 'judge'
    },
    
    // 获取默认字母状态
    getDefaultLetterStatus: function() {
        const letterStatus = {};
        for (let i = 97; i <= 122; i++) {
            const letter = String.fromCharCode(i);
            letterStatus[letter] = {
                exists: -1, // -1: 不确定, 1: 存在, 0: 不存在
                position: 0, // 0: 位置不确定, 正数: 固定位置, -1: 不存在
                excludedPositions: [] // 排除的位置列表
            };
        }
        return letterStatus;
    }
};