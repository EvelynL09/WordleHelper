// 候选词验证组件
window.ValidatorComponent = {
    // 初始化
    init: function() {
        this.setupEventListeners();
    },
    
    // 设置事件监听器
    setupEventListeners: function() {
        // 验证按钮
        document.getElementById('validateBtn').addEventListener('click', () => {
            this.validateWord();
        });
        
        // 回车键验证
        document.getElementById('validatorInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.validateWord();
            }
        });
    },
    
    // 验证候选词
    validateWord: function() {
        const input = document.getElementById('validatorInput');
        const word = input.value.toLowerCase().trim();
        
        if (!word) {
            this.showValidationResult('请输入候选词', 'invalid');
            return;
        }
        
        // 验证是否为字母
        if (!ValidatorUtil.validateLetters(word)) {
            this.showValidationResult('候选词只能包含字母', 'invalid');
            return;
        }
        
        // 获取字母状态
        const letterStatus = StorageUtil.getLetterStatus();
        
        // 验证候选词
        const validation = ValidatorUtil.validateWord(word, letterStatus);
        
        if (validation.valid) {
            this.showValidationResult('验证通过', 'valid');
        } else {
            this.showValidationResult(validation.errors.join('\n'), 'invalid');
        }
    },
    
    // 显示验证结果
    showValidationResult: function(message, type) {
        const resultElement = document.getElementById('validationResult');
        resultElement.textContent = message;
        resultElement.className = `validation-result ${type}`;
    }
};