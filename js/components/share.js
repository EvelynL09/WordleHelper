// 分享与导入组件逻辑

class ShareComponent {
    constructor() {
        this.exportButton = document.getElementById('export-data');
        this.importText = document.getElementById('import-text');
        this.importButton = document.getElementById('import-data');
    }

    init(guesses, letterStatus, config, onImport) {
        this.guesses = guesses;
        this.letterStatus = letterStatus;
        this.config = config;
        this.onImport = onImport;
        this.bindEvents();
    }

    bindEvents() {
        this.exportButton.addEventListener('click', () => this.exportData());
        this.importButton.addEventListener('click', () => this.importData());
    }

    exportData() {
        const shareText = generateShareText(this.guesses, this.letterStatus, this.config);
        
        // 复制到剪贴板
        navigator.clipboard.writeText(shareText).then(() => {
            this.showMessage('导出成功，已复制到剪贴板！', 'success');
        }).catch(err => {
            console.error('复制失败:', err);
            this.showMessage('导出失败，请手动复制文本', 'error');
        });
    }

    importData() {
        const text = this.importText.value.trim();
        if (!text) {
            this.showMessage('请输入要导入的文本', 'error');
            return;
        }

        const parsedData = parseShareText(text);
        if (parsedData) {
            this.onImport(parsedData);
            this.importText.value = '';
            this.showMessage('导入成功！', 'success');
        } else {
            this.showMessage('导入失败，请检查文本格式', 'error');
        }
    }

    showMessage(message, type) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        messageElement.textContent = message;
        
        const shareSection = document.querySelector('.share-section');
        shareSection.appendChild(messageElement);
        
        // 3秒后自动移除
        setTimeout(() => {
            messageElement.remove();
        }, 3000);
    }

    updateGuesses(guesses) {
        this.guesses = guesses;
    }

    updateLetterStatus(letterStatus) {
        this.letterStatus = letterStatus;
    }

    updateConfig(config) {
        this.config = config;
    }

    clear() {
        this.importText.value = '';
    }
}

// 暴露全局类
window.ShareComponent = ShareComponent;