// 主应用逻辑
window.App = {
    // 初始化
    init: function() {
        // 初始化各个组件
        StatusComponent.init();
        ConfigComponent.init();
        GuessesComponent.init();
        LettersComponent.init();
        ValidatorComponent.init();
        ShareComponent.init();
        
        // 初始化出题人辅助判定模式
        this.initJudgeMode();
        
        // 应用当前模式
        this.applyMode(StorageUtil.getMode());
    },
    
    // 初始化出题人辅助判定模式
    initJudgeMode: function() {
        // 保存答案按钮
        document.getElementById('saveAnswerBtn').addEventListener('click', () => {
            this.saveAnswer();
        });
        
        // 判定按钮
        document.getElementById('judgeBtn').addEventListener('click', () => {
            this.judgeGuess();
        });
        
        // 回车键判定
        document.getElementById('guessInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.judgeGuess();
            }
        });
    },
    
    // 保存答案
    saveAnswer: function() {
        const answerInput = document.getElementById('answerInput');
        const answer = answerInput.value.toLowerCase().trim();
        
        if (!answer) {
            alert('请输入正确答案');
            return;
        }
        
        // 验证单词长度
        const answerLength = ConfigComponent.getAnswerLength();
        if (answer.length !== answerLength) {
            alert(`答案长度应为${answerLength}个字母`);
            return;
        }
        
        // 验证是否为字母
        if (!ValidatorUtil.validateLetters(answer)) {
            alert('答案只能包含字母');
            return;
        }
        
        // 保存答案
        StorageUtil.setItem('wordle_answer', answer);
        alert('答案保存成功');
    },
    
    // 判定猜词
    judgeGuess: function() {
        const answer = StorageUtil.getItem('wordle_answer');
        if (!answer) {
            alert('请先保存正确答案');
            return;
        }
        
        const guessInput = document.getElementById('guessInput');
        const guess = guessInput.value.toLowerCase().trim();
        
        if (!guess) {
            alert('请输入猜测单词');
            return;
        }
        
        // 验证是否为字母
        if (!ValidatorUtil.validateLetters(guess)) {
            alert('猜测单词只能包含字母');
            return;
        }
        
        // 判定结果
        const result = ValidatorUtil.judgeGuess(guess, answer);
        
        // 显示结果
        this.showJudgeResult(guess, result);
        
        // 保存到历史记录
        this.saveJudgeHistory(guess, result);
        
        // 清空输入
        guessInput.value = '';
    },
    
    // 显示判定结果
    showJudgeResult: function(guess, result) {
        const resultDetails = document.getElementById('resultDetails');
        const resultPlayer = document.getElementById('resultPlayer');
        
        // 显示详细结果（每个字母对应版本）
        let detailsHTML = '';
        for (const item of result.letterResults) {
            detailsHTML += `<div class="result-letter">
                <span>${item.letter.toUpperCase()}</span>
                <span class="result-emoji">${item.result}</span>
            </div>`;
        }
        resultDetails.innerHTML = detailsHTML;
        
        // 显示玩家版本（合并后的结果）
        resultPlayer.textContent = result.mergedResult;
        
        // 复制到剪贴板
        this.copyToClipboard(result.mergedResult);
    },
    
    // 复制到剪贴板
    copyToClipboard: function(text) {
        navigator.clipboard.writeText(text).then(() => {
            // 可以添加一个短暂的提示
            const resultPlayer = document.getElementById('resultPlayer');
            const originalText = resultPlayer.textContent;
            resultPlayer.textContent = '已复制到剪贴板';
            setTimeout(() => {
                resultPlayer.textContent = originalText;
            }, 1000);
        }).catch(err => {
            console.error('复制失败:', err);
        });
    },
    
    // 保存判定历史
    saveJudgeHistory: function(guess, result) {
        const history = StorageUtil.getItem('wordle_judge_history', []);
        history.unshift({ 
            guess, 
            feedback: result.rawResult, 
            mergedResult: result.mergedResult, 
            timestamp: Date.now() 
        });
        
        // 只保留最近10条记录
        if (history.length > 10) {
            history.splice(10);
        }
        
        StorageUtil.setItem('wordle_judge_history', history);
        this.renderJudgeHistory();
    },
    
    // 渲染判定历史
    renderJudgeHistory: function() {
        const history = StorageUtil.getItem('wordle_judge_history', []);
        const historyList = document.getElementById('historyList');
        
        historyList.innerHTML = '';
        history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const wordSpan = document.createElement('span');
            wordSpan.className = 'history-word';
            wordSpan.textContent = item.guess;
            
            const feedbackSpan = document.createElement('span');
            feedbackSpan.className = 'history-feedback';
            feedbackSpan.textContent = item.mergedResult || item.feedback;
            
            const copyBtn = document.createElement('button');
            copyBtn.className = 'btn btn-sm copy-btn';
            copyBtn.textContent = '复制';
            copyBtn.addEventListener('click', () => {
                this.copyToClipboard(item.mergedResult || item.feedback);
            });
            
            historyItem.appendChild(wordSpan);
            historyItem.appendChild(feedbackSpan);
            historyItem.appendChild(copyBtn);
            historyList.appendChild(historyItem);
        });
    },
    
    // 应用模式
    applyMode: function(mode) {
        if (mode === 'judge') {
            this.renderJudgeHistory();
        }
    },
    
    // 模式切换回调
    onModeChange: function(mode) {
        this.applyMode(mode);
    },
    
    // 配置更新回调
    onConfigChange: function(config) {
        StatusComponent.updateStatusInputs();
        if (window.GuessesComponent) {
            window.GuessesComponent.updateLabels();
        }
    },
    
    // 字母状态更新回调
    onLetterStatusChange: function() {
        LettersComponent.renderLetters();
        StatusComponent.updateStatusInputs();
    },
    
    // 数据导入回调
    onDataImported: function() {
        GuessesComponent.loadGuesses();
        LettersComponent.renderLetters();
        StatusComponent.updateStatusInputs();
    }
};

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', function() {
    window.App.init();
});