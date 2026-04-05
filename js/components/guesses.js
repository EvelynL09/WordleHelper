// 猜词记录组件逻辑

class GuessesComponent {
    constructor() {
        this.guessesList = document.getElementById('guesses-list');
        this.newWordInput = document.getElementById('new-word');
        this.greenMinusBtn = document.getElementById('green-minus');
        this.greenPlusBtn = document.getElementById('green-plus');
        this.greenCountDisplay = document.getElementById('green-count');
        this.yellowMinusBtn = document.getElementById('yellow-minus');
        this.yellowPlusBtn = document.getElementById('yellow-plus');
        this.yellowCountDisplay = document.getElementById('yellow-count');
        this.submitBtn = document.getElementById('submit-guess');
        
        this.guesses = loadGuesses();
        this.greenCount = 0;
        this.yellowCount = 0;
        this.letterStatus = {};
        this.editingIndex = -1; // 用于跟踪当前正在编辑的猜测索引
        this.onLetterStatusChange = null;
    }

    init(config, onGuessesChange, onLetterStatusChange) {
        this.config = config;
        this.onGuessesChange = onGuessesChange;
        this.onLetterStatusChange = onLetterStatusChange;
        this.render();
        this.bindEvents();
    }

    render() {
        this.guessesList.innerHTML = '';
        
        this.guesses.forEach((guess, index) => {
            const row = this.createGuessRow(guess, index);
            this.guessesList.appendChild(row);
        });
        
        this.updateCountDisplays();
    }

    createGuessRow(guess, index) {
        const row = document.createElement('div');
        row.className = 'guess-row';
        row.draggable = true;
        row.dataset.index = index;
        
        // 添加拖动排序按钮
        const dragHandle = document.createElement('div');
        dragHandle.className = 'drag-handle';
        dragHandle.textContent = '☰';
        
        const wordContainer = document.createElement('div');
        wordContainer.className = 'guess-word';
        
        guess.word.split('').forEach((char, charIndex) => {
            const letterSpan = document.createElement('span');
            letterSpan.className = 'letter';
            letterSpan.textContent = char;
            letterSpan.dataset.char = char;
            letterSpan.dataset.index = charIndex;
            this.applyLetterStyle(letterSpan, char);
            wordContainer.appendChild(letterSpan);
        });
        
        const feedbackContainer = document.createElement('div');
        feedbackContainer.className = 'guess-feedback';
        feedbackContainer.textContent = this.getFeedbackEmoji(guess);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'guess-delete';
        deleteBtn.textContent = '删除';
        deleteBtn.addEventListener('click', () => this.deleteGuess(index));
        
        const editBtn = document.createElement('button');
        editBtn.className = 'guess-edit';
        editBtn.textContent = '编辑';
        editBtn.addEventListener('click', () => this.editGuess(index));
        
        // 添加拖动事件监听器
        row.addEventListener('dragstart', (e) => this.handleDragStart(e, index));
        row.addEventListener('dragover', (e) => this.handleDragOver(e));
        row.addEventListener('drop', (e) => this.handleDrop(e, index));
        
        row.appendChild(dragHandle);
        row.appendChild(wordContainer);
        row.appendChild(feedbackContainer);
        row.appendChild(editBtn);
        row.appendChild(deleteBtn);
        
        return row;
    }
    
    handleDragStart(e, index) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index);
        e.target.classList.add('dragging');
    }
    
    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        return false;
    }
    
    handleDrop(e, dropIndex) {
        e.preventDefault();
        const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
        
        if (dragIndex !== dropIndex) {
            // 重新排序猜测记录
            const [movedGuess] = this.guesses.splice(dragIndex, 1);
            this.guesses.splice(dropIndex, 0, movedGuess);
            
            // 保存并重新渲染
            this.saveGuesses();
            this.render();
            this.onGuessesChange && this.onGuessesChange(this.guesses);
        }
        
        e.target.classList.remove('dragging');
        return false;
    }

    applyLetterStyle(element, char) {
        const status = this.letterStatus[char] || 'unknown';
        
        element.classList.remove('excluded', 'correct', 'present');
        
        if (status === 'excluded') {
            element.classList.add('excluded');
        } else if (typeof status === 'number' && status > 0) {
            element.classList.add('correct');
        } else if (status === 'must-exist' || status === 0) {
            element.classList.add('present');
        }
    }

    getFeedbackEmoji(guess) {
        if (guess.green === 0 && guess.yellow === 0) {
            return '⬜';
        }
        return '🟩'.repeat(guess.green) + '🟨'.repeat(guess.yellow);
    }

    bindEvents() {
        this.greenMinusBtn.addEventListener('click', () => this.adjustCount('green', -1));
        this.greenPlusBtn.addEventListener('click', () => this.adjustCount('green', 1));
        this.yellowMinusBtn.addEventListener('click', () => this.adjustCount('yellow', -1));
        this.yellowPlusBtn.addEventListener('click', () => this.adjustCount('yellow', 1));
        this.greenCountDisplay.addEventListener('input', (e) => this.handleDirectInput('green', e));
        this.yellowCountDisplay.addEventListener('input', (e) => this.handleDirectInput('yellow', e));
        this.submitBtn.addEventListener('click', () => this.submitGuess());
        this.newWordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitGuess();
            }
        });
        this.newWordInput.addEventListener('paste', (e) => {
            setTimeout(() => this.handlePaste(), 0);
        });
    }

    handleDirectInput(type, e) {
        let value = parseInt(e.target.value) || 0;
        value = Math.max(0, Math.min(10, value));
        if (type === 'green') {
            this.greenCount = value;
        } else {
            this.yellowCount = value;
        }
        this.updateCountDisplays();
    }

    handlePaste() {
        const text = this.newWordInput.value.trim();
        const match = text.match(/^([a-z]+)\s+([⬜🟩🟨]+)$/i);
        
        if (match) {
            const word = match[1].toLowerCase();
            const emojis = match[2];
            
            let green = 0;
            let yellow = 0;
            
            for (const emoji of emojis) {
                if (emoji === '🟩') green++;
                else if (emoji === '🟨') yellow++;
            }
            
            this.newWordInput.value = word;
            this.greenCount = green;
            this.yellowCount = yellow;
            this.updateCountDisplays();
        }
    }

    adjustCount(type, delta) {
        if (type === 'green') {
            this.greenCount = Math.max(0, this.greenCount + delta);
        } else {
            this.yellowCount = Math.max(0, this.yellowCount + delta);
        }
        this.updateCountDisplays();
    }

    updateCountDisplays() {
        this.greenCountDisplay.value = this.greenCount;
        this.yellowCountDisplay.value = this.yellowCount;
    }

    submitGuess() {
        const word = this.newWordInput.value.trim().toLowerCase();
        
        if (!word) {
            alert('请输入猜测单词');
            return;
        }
        
        if (word.length < this.config.guessMinLength || word.length > this.config.guessMaxLength) {
            alert(`单词长度必须在 ${this.config.guessMinLength} 到 ${this.config.guessMaxLength} 之间`);
            return;
        }
        
        if (this.greenCount + this.yellowCount > word.length) {
            alert('🟩和🟨的总数不能超过单词长度');
            return;
        }
        
        const newGuess = {
            word: word,
            green: this.greenCount,
            yellow: this.yellowCount
        };
        
        // 处理情况A：⬜ - 所有字母都不在答案中
        if (this.greenCount === 0 && this.yellowCount === 0) {
            let needsConfirmation = false;
            const lettersToExclude = word.split('');
            
            // 检查是否有字母当前状态为必定存在
            for (const letter of lettersToExclude) {
                const currentStatus = this.letterStatus[letter];
                if (currentStatus === 'must-exist' || (typeof currentStatus === 'number' && currentStatus > 0)) {
                    needsConfirmation = true;
                    break;
                }
            }
            
            if (needsConfirmation) {
                const confirmed = confirm('猜测单词中的某些字母当前标记为必定存在，确定要将它们标记为已排除吗？');
                if (!confirmed) {
                    return;
                }
            }
            
            // 将所有字母标记为已排除
            for (const letter of lettersToExclude) {
                this.letterStatus[letter] = 'excluded';
            }
        } else {
            // 处理情况B：n个🟩+m个🟨 - 有字母在答案中
            // 根据需求，因为无法确定哪些字母，所以不要因为情况B而改变字母状态
        }
        
        this.guesses.push(newGuess);
        this.saveGuesses();
        this.render();
        this.onGuessesChange && this.onGuessesChange(this.guesses);
        // 通知其他组件字母状态已更新
        this.onLetterStatusChange && this.onLetterStatusChange(this.letterStatus);
        
        this.newWordInput.value = '';
        this.greenCount = 0;
        this.yellowCount = 0;
        this.updateCountDisplays();
        this.newWordInput.focus();
    }

    deleteGuess(index) {
        this.guesses.splice(index, 1);
        this.saveGuesses();
        this.render();
        this.onGuessesChange && this.onGuessesChange(this.guesses);
    }

    editGuess(index) {
        const guess = this.guesses[index];
        
        // 将猜测的单词和反馈值填充到输入框和计数器中
        this.newWordInput.value = guess.word;
        this.greenCount = guess.green;
        this.yellowCount = guess.yellow;
        this.updateCountDisplays();
        
        // 从guesses数组中移除该猜测
        this.guesses.splice(index, 1);
        this.saveGuesses();
        this.render();
        
        // 聚焦到输入框，方便用户编辑
        this.newWordInput.focus();
    }

    saveGuesses() {
        const validGuesses = this.guesses.filter(guess => {
            const validation = validateGuess(guess, this.config);
            return validation.valid;
        });
        saveGuesses(validGuesses);
    }

    getGuesses() {
        return this.guesses;
    }

    updateGuesses(guesses) {
        this.guesses = guesses;
        this.saveGuesses();
        this.render();
        this.onGuessesChange && this.onGuessesChange(this.guesses);
    }

    updateConfig(config) {
        this.config = config;
        this.saveGuesses();
        this.render();
    }

    updateLetterStatus(letterStatus) {
        this.letterStatus = letterStatus;
        this.render();
    }

    clear() {
        this.guesses = [];
        this.saveGuesses();
        this.render();
        this.onGuessesChange && this.onGuessesChange(this.guesses);
    }
}

window.GuessesComponent = GuessesComponent;
