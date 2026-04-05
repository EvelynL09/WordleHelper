// 验证工具

function validateCandidateWord(word, letterStatus, config) {
    word = word.toLowerCase();
    const errors = [];

    if (word.length < config.guessMinLength || word.length > config.guessMaxLength) {
        errors.push(`单词长度必须在 ${config.guessMinLength} 到 ${config.guessMaxLength} 之间`);
        return { valid: false, errors };
    }

    for (const [letter, status] of Object.entries(letterStatus)) {
        if (status === 'excluded' && word.includes(letter)) {
            errors.push(`单词包含已排除的字母: ${letter}`);
        }
    }

    const mustExistLetters = Object.entries(letterStatus)
        .filter(([_, status]) => status === 'must-exist' || status === 0)
        .map(([letter]) => letter);

    for (const letter of mustExistLetters) {
        if (!word.includes(letter)) {
            errors.push(`单词必须包含字母: ${letter}`);
        }
    }

    const positionFixedLetters = Object.entries(letterStatus)
        .filter(([_, status]) => typeof status === 'number' && status > 0)
        .map(([letter, status]) => {
            const position = status - 1;
            return { letter, position };
        });

    for (const { letter, position } of positionFixedLetters) {
        if (position >= word.length || word[position] !== letter) {
            errors.push(`字母 ${letter} 必须在位置 ${position + 1}`);
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

function validateConfig(config) {
    const errors = [];

    if (config.answerLength < 4 || config.answerLength > 10) {
        errors.push('答案单词长度必须在 4 到 10 之间');
    }

    if (config.guessMinLength < 4 || config.guessMinLength > 10) {
        errors.push('猜测单词最小长度必须在 4 到 10 之间');
    }

    if (config.guessMaxLength < 4 || config.guessMaxLength > 10) {
        errors.push('猜测单词最大长度必须在 4 到 10 之间');
    }

    if (config.guessMinLength > config.guessMaxLength) {
        errors.push('猜测单词最小长度不能大于最大长度');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

function validateGuess(guess, config) {
    const errors = [];

    if (!guess.word || guess.word.length === 0) {
        errors.push('猜测单词不能为空');
    } else if (guess.word.length < config.guessMinLength || guess.word.length > config.guessMaxLength) {
        errors.push(`猜测单词长度必须在 ${config.guessMinLength} 到 ${config.guessMaxLength} 之间`);
    } else if (!/^[a-zA-Z]+$/.test(guess.word)) {
        errors.push('猜测单词只能包含字母');
    }

    if (guess.green < 0) {
        errors.push('绿色方块数量不能为负数');
    }

    if (guess.yellow < 0) {
        errors.push('黄色方块数量不能为负数');
    }

    if (guess.green + guess.yellow > guess.word.length) {
        errors.push('绿色和黄色方块数量之和不能超过单词长度');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

function validateLetterStatus(letterStatus) {
    for (const [letter, status] of Object.entries(letterStatus)) {
        if (!/^[a-z]$/.test(letter)) {
            return { valid: false, error: `无效的字母: ${letter}` };
        }
        
        if (typeof status === 'number') {
            if (status < -1 || status > 10) {
                return { valid: false, error: `无效的数字状态: ${status}` };
            }
        } else if (status !== 'unknown' && status !== 'excluded' && status !== 'must-exist') {
            return { valid: false, error: `无效的字母状态: ${status}` };
        }
    }
    
    return { valid: true, error: null };
}

window.validateCandidateWord = validateCandidateWord;
window.validateConfig = validateConfig;
window.validateGuess = validateGuess;
window.validateLetterStatus = validateLetterStatus;
