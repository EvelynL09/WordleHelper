// 顶部状态组件逻辑

class StatusComponent {
    constructor() {
        this.statusDisplay = document.getElementById('status-display');
        this.currentStatus = [];
        this.answerLength = 5;
    }

    init(answerLength, letterStatus, onStatusChange) {
        this.answerLength = answerLength;
        this.currentStatus = loadCurrentStatus() || [];
        this.onStatusChange = onStatusChange;
        this.render();
    }

    render() {
        this.statusDisplay.innerHTML = '';
        
        for (let i = 0; i < this.answerLength; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'status-input';
            input.maxLength = 1;
            input.value = this.currentStatus[i] || '';
            input.addEventListener('input', (e) => this.handleInput(e, i));
            this.statusDisplay.appendChild(input);
        }
    }

    handleInput(e, index) {
        const value = e.target.value.toLowerCase();
        if (/^[a-z]?$/.test(value)) {
            this.currentStatus[index] = value;
            this.saveStatus();
            this.onStatusChange && this.onStatusChange(this.currentStatus);
        } else {
            e.target.value = this.currentStatus[index] || '';
        }
    }

    saveStatus() {
        saveCurrentStatus(this.currentStatus);
    }

    updateStatus(status) {
        this.currentStatus = status;
        this.render();
        this.saveStatus();
    }

    updateAnswerLength(length) {
        this.answerLength = length;
        // 调整当前状态长度
        while (this.currentStatus.length < length) {
            this.currentStatus.push('');
        }
        while (this.currentStatus.length > length) {
            this.currentStatus.pop();
        }
        this.render();
        this.saveStatus();
    }

    getCurrentStatus() {
        return this.currentStatus;
    }

    clear() {
        this.currentStatus = Array(this.answerLength).fill('');
        this.render();
        this.saveStatus();
        this.onStatusChange && this.onStatusChange(this.currentStatus);
    }
}

// 暴露全局类
window.StatusComponent = StatusComponent;