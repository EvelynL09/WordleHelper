// 候选词验证组件逻辑

class ValidatorComponent {
    constructor() {
        this.candidateWordInput = document.getElementById('candidate-word');
        this.validateButton = document.getElementById('validate-word');
        this.validationResult = document.getElementById('validation-result');
    }

    init(letterStatus, config) {
        this.letterStatus = letterStatus;
        this.config = config;
        this.bindEvents();
    }

    bindEvents() {
        this.validateButton.addEventListener('click', () => this.validate());
        this.candidateWordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.validate();
            }
        });
    }

    validate() {
        const word = this.candidateWordInput.value.trim();
        if (!word) {
            this.showResult(false, ['请输入候选词']);
            return;
        }

        const result = validateCandidateWord(word, this.letterStatus, this.config);
        this.showResult(result.valid, result.errors);
    }

    showResult(valid, errors) {
        this.validationResult.className = `validation-result ${valid ? 'valid' : 'invalid'} show`;
        
        if (valid) {
            this.validationResult.textContent = '验证通过！';
        } else {
            this.validationResult.textContent = errors.join('\n');
        }

        // 3秒后自动隐藏
        setTimeout(() => {
            this.validationResult.classList.remove('show');
        }, 3000);
    }

    updateLetterStatus(letterStatus) {
        this.letterStatus = letterStatus;
    }

    updateConfig(config) {
        this.config = config;
    }

    clear() {
        this.candidateWordInput.value = '';
        this.validationResult.textContent = '';
        this.validationResult.className = 'validation-result';
    }
}

// 暴露全局类
window.ValidatorComponent = ValidatorComponent;