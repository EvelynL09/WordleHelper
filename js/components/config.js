// 配置组件逻辑

class ConfigComponent {
    constructor() {
        this.answerLengthInput = document.getElementById('answer-length');
        this.guessMinLengthInput = document.getElementById('guess-min-length');
        this.guessMaxLengthInput = document.getElementById('guess-max-length');
        this.config = loadConfig();
    }

    init(onConfigChange) {
        this.onConfigChange = onConfigChange;
        this.render();
        this.bindEvents();
    }

    render() {
        this.answerLengthInput.value = this.config.answerLength;
        this.guessMinLengthInput.value = this.config.guessMinLength;
        this.guessMaxLengthInput.value = this.config.guessMaxLength;
    }

    bindEvents() {
        this.answerLengthInput.addEventListener('change', () => this.handleChange());
        this.guessMinLengthInput.addEventListener('change', () => this.handleChange());
        this.guessMaxLengthInput.addEventListener('change', () => this.handleChange());
    }

    handleChange() {
        const newConfig = {
            answerLength: parseInt(this.answerLengthInput.value),
            guessMinLength: parseInt(this.guessMinLengthInput.value),
            guessMaxLength: parseInt(this.guessMaxLengthInput.value)
        };

        const validation = validateConfig(newConfig);
        if (validation.valid) {
            this.config = newConfig;
            this.saveConfig();
            this.onConfigChange && this.onConfigChange(this.config);
        } else {
            // 显示错误信息
            alert(validation.errors.join('\n'));
            this.render(); // 恢复原来的值
        }
    }

    saveConfig() {
        saveConfig(this.config);
    }

    getConfig() {
        return this.config;
    }

    updateConfig(config) {
        this.config = config;
        this.render();
        this.saveConfig();
        this.onConfigChange && this.onConfigChange(this.config);
    }
}

// 暴露全局类
window.ConfigComponent = ConfigComponent;