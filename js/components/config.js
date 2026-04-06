// 配置组件
window.ConfigComponent = {
    // 初始化
    init: function() {
        this.loadConfig();
        this.setupEventListeners();
    },
    
    // 加载配置
    loadConfig: function() {
        const config = StorageUtil.getConfig();
        document.getElementById('answerLength').value = config.answerLength;
        document.getElementById('minGuessLength').value = config.minGuessLength;
        document.getElementById('maxGuessLength').value = config.maxGuessLength;
        document.getElementById('feedbackPreset').value = config.feedbackPreset || window.Constants.DEFAULT_FEEDBACK_PRESET;
    },
    
    // 设置事件监听器
    setupEventListeners: function() {
        // 答案长度输入
        document.getElementById('answerLength').addEventListener('change', () => {
            this.updateConfig();
        });
        
        // 最小猜测长度输入
        document.getElementById('minGuessLength').addEventListener('change', () => {
            this.updateConfig();
        });
        
        // 最大猜测长度输入
        document.getElementById('maxGuessLength').addEventListener('change', () => {
            this.updateConfig();
        });
        
        // 颜色反馈配置输入
        document.getElementById('feedbackPreset').addEventListener('change', () => {
            this.updateConfig();
        });
    },
    
    // 更新配置
    updateConfig: function() {
        const config = {
            answerLength: parseInt(document.getElementById('answerLength').value) || 5,
            minGuessLength: parseInt(document.getElementById('minGuessLength').value) || 4,
            maxGuessLength: parseInt(document.getElementById('maxGuessLength').value) || 10,
            feedbackPreset: document.getElementById('feedbackPreset').value || window.Constants.DEFAULT_FEEDBACK_PRESET
        };
        
        // 验证配置
        const validation = ValidatorUtil.validateConfig(config);
        if (validation.valid) {
            StorageUtil.saveConfig(config);
            
            // 通知主应用配置已更新
            if (window.App) {
                window.App.onConfigChange(config);
            }
        } else {
            // 显示错误信息
            alert(validation.errors.join('\n'));
            // 恢复之前的配置
            this.loadConfig();
        }
    },
    
    // 获取当前配置
    getConfig: function() {
        return StorageUtil.getConfig();
    },
    
    // 获取答案单词长度
    getAnswerLength: function() {
        return StorageUtil.getConfig().answerLength;
    },
    
    // 获取猜测单词长度范围
    getGuessLengthRange: function() {
        const config = StorageUtil.getConfig();
        return {
            min: config.minGuessLength,
            max: config.maxGuessLength
        };
    }
};