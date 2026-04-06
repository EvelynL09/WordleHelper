// 猜词记录组件
window.GuessesComponent = {
    // 初始化
    init: function() {
        this.setupEventListeners();
        this.loadGuesses();
        this.setupDragAndDrop();
    },
    
    // 设置事件监听器
    setupEventListeners: function() {
        // 添加猜词按钮
        const addGuessBtn = document.getElementById('addGuessBtn');
        if (addGuessBtn) {
            addGuessBtn.addEventListener('click', () => {
                this.addGuess();
            });
        }
        
        // 回车键提交
        const newGuessInput = document.getElementById('newGuessInput');
        if (newGuessInput) {
            newGuessInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addGuess();
                }
            });
            
            // 粘贴导入功能
            newGuessInput.addEventListener('paste', (e) => {
                this.handlePaste(e);
            });
        }
        
        // 正确计数加减
        const correctMinus = document.getElementById('correctMinus');
        if (correctMinus) {
            correctMinus.addEventListener('click', () => {
                this.updateCount('correctCount', -1);
            });
        }
        const correctPlus = document.getElementById('correctPlus');
        if (correctPlus) {
            correctPlus.addEventListener('click', () => {
                this.updateCount('correctCount', 1);
            });
        }
        
        // 存在计数加减
        const presentMinus = document.getElementById('presentMinus');
        if (presentMinus) {
            presentMinus.addEventListener('click', () => {
                this.updateCount('presentCount', -1);
            });
        }
        const presentPlus = document.getElementById('presentPlus');
        if (presentPlus) {
            presentPlus.addEventListener('click', () => {
                this.updateCount('presentCount', 1);
            });
        }
        
        // 初始化标签文本
        this.updateLabels();
    },
    
    // 更新标签文本
    updateLabels: function() {
        const preset = StorageUtil.getFeedbackPreset();
        const feedback = window.Constants.FEEDBACK_PRESETS[preset] || window.Constants.FEEDBACK_PRESETS.DEFAULT;
        
        const correctLabel = document.getElementById('correctLabel');
        if (correctLabel) {
            correctLabel.textContent = feedback.CORRECT + '：';
        }
        const presentLabel = document.getElementById('presentLabel');
        if (presentLabel) {
            presentLabel.textContent = feedback.PRESENT + '：';
        }
    },
    
    // 更新计数
    updateCount: function(id, delta) {
        const input = document.getElementById(id);
        if (input) {
            const currentValue = parseInt(input.value) || 0;
            const newValue = Math.max(0, currentValue + delta);
            input.value = newValue;
        }
    },
    
    // 加载猜词记录
    loadGuesses: function() {
        const guesses = StorageUtil.getGuesses();
        this.renderGuesses(guesses);
    },
    
    // 渲染猜词记录
    renderGuesses: function(guesses) {
        const guessesList = document.getElementById('guessesList');
        guessesList.innerHTML = '';
        
        guesses.forEach((guess, index) => {
            const guessItem = document.createElement('div');
            guessItem.className = 'guess-item';
            guessItem.dataset.index = index;
            
            // 拖动按钮
            const dragBtn = document.createElement('button');
            dragBtn.className = 'guess-actions-btn drag-btn';
            dragBtn.textContent = '☰';
            dragBtn.draggable = true;
            
            // 猜词单词
            const wordSpan = document.createElement('span');
            wordSpan.className = 'guess-word';
            wordSpan.textContent = guess.word;
            
            // 反馈emoji
            const feedbackSpan = document.createElement('span');
            feedbackSpan.className = 'guess-feedback';
            feedbackSpan.textContent = guess.feedback;
            
            // 操作按钮
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'guess-actions';
            
            const editBtn = document.createElement('button');
            editBtn.className = 'guess-actions-btn';
            editBtn.textContent = '编辑';
            editBtn.addEventListener('click', () => {
                this.editGuess(index);
            });
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'guess-actions-btn';
            deleteBtn.textContent = '删除';
            deleteBtn.addEventListener('click', () => {
                this.deleteGuess(index);
            });
            
            actionsDiv.appendChild(editBtn);
            actionsDiv.appendChild(deleteBtn);
            
            guessItem.appendChild(dragBtn);
            guessItem.appendChild(wordSpan);
            guessItem.appendChild(feedbackSpan);
            guessItem.appendChild(actionsDiv);
            
            guessesList.appendChild(guessItem);
        });
        
        // 重新设置拖放事件
        this.setupDragAndDrop();
    },
    
    // 添加猜词记录
    addGuess: function() {
        const wordInput = document.getElementById('newGuessInput');
        const correctInput = document.getElementById('correctCount');
        const presentInput = document.getElementById('presentCount');
        
        if (!wordInput || !correctInput || !presentInput) {
            return;
        }
        
        const word = wordInput.value.toLowerCase().trim();
        const correct = parseInt(correctInput.value) || 0;
        const present = parseInt(presentInput.value) || 0;
        
        if (!word) {
            alert('请输入猜测单词');
            return;
        }
        
        // 验证单词长度
        const { min, max } = ConfigComponent.getGuessLengthRange();
        if (!ValidatorUtil.validateWordLength(word, min, max)) {
            alert(`单词长度应在${min}-${max}之间`);
            return;
        }
        
        // 验证是否为字母
        if (!ValidatorUtil.validateLetters(word)) {
            alert('单词只能包含字母');
            return;
        }
        
        // 生成反馈emoji
        const feedback = ParserUtil.generateFeedback(word, correct, present);
        
        // 添加到猜词记录
        const guesses = StorageUtil.getGuesses();
        guesses.push({
            word: word,
            correct: correct,
            present: present,
            feedback: feedback
        });
        
        StorageUtil.saveGuesses(guesses);
        this.renderGuesses(guesses);
        
        // 更新字母状态
        this.updateLetterStatus(word, correct, present);
        
        // 清空输入
        wordInput.value = '';
        correctInput.value = '0';
        presentInput.value = '0';
    },
    
    // 编辑猜词记录
    editGuess: function(index) {
        const guesses = StorageUtil.getGuesses();
        const guess = guesses[index];
        
        const newGuessInput = document.getElementById('newGuessInput');
        const correctCount = document.getElementById('correctCount');
        const presentCount = document.getElementById('presentCount');
        
        if (newGuessInput && correctCount && presentCount) {
            newGuessInput.value = guess.word;
            correctCount.value = guess.correct || guess.green || 0;
            presentCount.value = guess.present || guess.yellow || 0;
        }
        
        // 删除原记录
        this.deleteGuess(index);
    },
    
    // 删除猜词记录
    deleteGuess: function(index) {
        const guesses = StorageUtil.getGuesses();
        guesses.splice(index, 1);
        StorageUtil.saveGuesses(guesses);
        this.renderGuesses(guesses);
        
        // 重新计算字母状态
        this.recalculateLetterStatus();
    },
    
    // 更新字母状态
    updateLetterStatus: function(word, correct, present) {
        const letterStatus = StorageUtil.getLetterStatus();
        
        if (correct === 0 && present === 0) {
            // 情况A：所有字母都不存在
            for (const char of word) {
                if (letterStatus[char].exists === 1) {
                    if (!confirm(`字母 ${char} 被标记为必存在，确定要标记为排除吗？`)) {
                        return;
                    }
                }
                letterStatus[char].exists = 0;
                letterStatus[char].position = -1;
                letterStatus[char].excludedPositions = [];
            }
        } else if (present > 0 && correct === 0) {
            // 情况B：只有存在但位置不正确
            for (let i = 0; i < word.length; i++) {
                const char = word[i];
                const position = i + 1;
                if (!letterStatus[char].excludedPositions.includes(position)) {
                    letterStatus[char].excludedPositions.push(position);
                }
                if (letterStatus[char].exists === -1) {
                    letterStatus[char].exists = 1;
                }
            }
        } else if (correct + present === word.length) {
            // 情况C：所有字母都存在
            for (const char of word) {
                letterStatus[char].exists = 1;
            }
        }
        
        StorageUtil.saveLetterStatus(letterStatus);
        
        // 通知主应用字母状态已更新
        if (window.App) {
            window.App.onLetterStatusChange();
        }
    },
    
    // 重新计算字母状态
    recalculateLetterStatus: function() {
        const guesses = StorageUtil.getGuesses();
        const letterStatus = StorageUtil.getDefaultLetterStatus();
        
        guesses.forEach(guess => {
            this.updateLetterStatus(guess.word, guess.correct || guess.green || 0, guess.present || guess.yellow || 0);
        });
    },
    
    // 设置拖放功能
    setupDragAndDrop: function() {
        const guessItems = document.querySelectorAll('.guess-item');
        let draggedItem = null;
        
        guessItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                draggedItem = item;
                item.classList.add('dragging');
            });
            
            item.addEventListener('dragend', (e) => {
                item.classList.remove('dragging');
                draggedItem = null;
            });
            
            item.addEventListener('dragover', (e) => {
                e.preventDefault();
            });
            
            item.addEventListener('drop', (e) => {
                e.preventDefault();
                if (draggedItem !== item) {
                    const guesses = StorageUtil.getGuesses();
                    const draggedIndex = parseInt(draggedItem.dataset.index);
                    const targetIndex = parseInt(item.dataset.index);
                    
                    const [draggedGuess] = guesses.splice(draggedIndex, 1);
                    guesses.splice(targetIndex, 0, draggedGuess);
                    
                    StorageUtil.saveGuesses(guesses);
                    this.renderGuesses(guesses);
                }
            });
        });
    },
    
    // 获取猜词记录
    getGuesses: function() {
        return StorageUtil.getGuesses();
    },
    
    // 设置猜词记录
    setGuesses: function(guesses) {
        StorageUtil.saveGuesses(guesses);
        this.renderGuesses(guesses);
        this.recalculateLetterStatus();
    },
    
    // 处理粘贴事件
    handlePaste: function(e) {
        e.preventDefault();
        const clipboardData = e.clipboardData || window.clipboardData;
        const pastedText = clipboardData.getData('text').trim();
        
        // 解析粘贴的文本，格式为 "单词 颜色emoji序列"
        const match = pastedText.match(/^([a-zA-Z]+)\s+([🟩🟨⬜●○×]+)$/);
        if (match) {
            const word = match[1].toLowerCase();
            const feedback = match[2];
            
            // 解析反馈emoji，计算正确和存在的数量
            const preset = StorageUtil.getFeedbackPreset();
            const feedbackConfig = window.Constants.FEEDBACK_PRESETS[preset] || window.Constants.FEEDBACK_PRESETS.DEFAULT;
            
            let correct = 0;
            let present = 0;
            
            for (const emoji of feedback) {
                if (emoji === feedbackConfig.CORRECT) {
                    correct++;
                } else if (emoji === feedbackConfig.PRESENT) {
                    present++;
                }
            }
            
            // 填充到输入框
            document.getElementById('newGuessInput').value = word;
            document.getElementById('correctCount').value = correct;
            document.getElementById('presentCount').value = present;
        }
    }
};