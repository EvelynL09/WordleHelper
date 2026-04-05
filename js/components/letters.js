// 字母状态组件逻辑

class LettersComponent {
    constructor() {
        this.lettersContainer = {
            mustExist: document.querySelector('#must-exist .letter-buttons'),
            mayExist: document.querySelector('#may-exist .letter-buttons'),
            excluded: document.querySelector('#excluded .letter-buttons')
        };
        this.letterStatus = loadLetterStatus();
        this.letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
    }

    init(onLetterStatusChange) {
        this.onLetterStatusChange = onLetterStatusChange;
        this.render();
    }

    render() {
        Object.values(this.lettersContainer).forEach(container => {
            container.innerHTML = '';
        });

        this.letters.forEach(letter => {
            const status = this.letterStatus[letter];
            const button = this.createLetterButton(letter, status);
            
            let container;
            if (status === 'excluded') {
                container = this.lettersContainer.excluded;
            } else if (status === 'must-exist' || status === 0) {
                container = this.lettersContainer.mustExist;
            } else {
                container = this.lettersContainer.mayExist;
            }
            
            container.appendChild(button);
        });
    }

    createLetterButton(letter, status) {
        const button = document.createElement('button');
        button.className = 'letter-btn';
        
        if (status === 'excluded') {
            button.classList.add('excluded');
        } else if (status === 'must-exist' || status === 0) {
            button.classList.add('must-exist');
        } else if (typeof status === 'number' && status > 0) {
            button.classList.add('position-fixed');
        }
        
        button.textContent = letter.toUpperCase();
        
        button.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleLetterClick(letter);
        });
        
        button.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.handleRightClick(letter);
        });
        
        return button;
    }

    handleLetterClick(letter) {
        const currentStatus = this.letterStatus[letter];
        let newStatus;

        if (currentStatus === 'excluded') {
            newStatus = 'unknown';
        } else if (currentStatus === 'must-exist' || currentStatus === 0) {
            newStatus = 'unknown';
        } else if (typeof currentStatus === 'number' && currentStatus > 0) {
            newStatus = 'unknown';
        } else {
            newStatus = 'must-exist';
        }

        this.letterStatus[letter] = newStatus;
        this.saveLetterStatus();
        this.render();
        this.onLetterStatusChange && this.onLetterStatusChange(this.letterStatus);
    }

    handleRightClick(letter) {
        this.letterStatus[letter] = 'excluded';
        this.saveLetterStatus();
        this.render();
        this.onLetterStatusChange && this.onLetterStatusChange(this.letterStatus);
    }

    saveLetterStatus() {
        const validation = validateLetterStatus(this.letterStatus);
        if (validation.valid) {
            saveLetterStatus(this.letterStatus);
        }
    }

    getLetterStatus() {
        return this.letterStatus;
    }

    updateLetterStatus(letterStatus) {
        this.letterStatus = letterStatus;
        this.saveLetterStatus();
        this.render();
        // 移除对 onLetterStatusChange 的调用，避免循环依赖
        // this.onLetterStatusChange && this.onLetterStatusChange(this.letterStatus);
    }

    updateFromCurrentStatus(currentStatus) {
        const newLetterStatus = { ...this.letterStatus };
        
        currentStatus.forEach((letter, index) => {
            if (letter) {
                newLetterStatus[letter] = index + 1;
            }
        });
        
        this.updateLetterStatus(newLetterStatus);
    }

    clear() {
        this.letterStatus = {};
        this.saveLetterStatus();
        this.render();
        this.onLetterStatusChange && this.onLetterStatusChange(this.letterStatus);
    }
}

window.LettersComponent = LettersComponent;
