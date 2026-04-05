// 数据解析工具

function parseShareText(text) {
    try {
        const lines = text.trim().split('\n');
        const guesses = [];
        const letterStatus = {};
        let isGuessSection = true;

        for (const line of lines) {
            if (line.trim() === '---') {
                isGuessSection = false;
                continue;
            }

            if (isGuessSection) {
                const match = line.match(/^(\w+)\s+([⬜🟩🟨]+)$/);
                if (match) {
                    const [, word, feedback] = match;
                    const greenCount = (feedback.match(/🟩/g) || []).length;
                    const yellowCount = (feedback.match(/🟨/g) || []).length;
                    guesses.push({
                        word: word.toLowerCase(),
                        green: greenCount,
                        yellow: yellowCount
                    });
                }
            } else {
                const parts = line.split(';').filter(p => p.trim());
                for (const part of parts) {
                    const match = part.match(/^(\w):([^;]+)$/);
                    if (match) {
                        const [, letter, status] = match;
                        letterStatus[letter.toLowerCase()] = parseLetterStatus(status.trim());
                    }
                }
            }
        }

        return {
            guesses,
            letterStatus
        };
    } catch (error) {
        console.error('解析分享文本失败:', error);
        return null;
    }
}

function parseLetterStatus(status) {
    if (status === '?') {
        return 'unknown';
    } else if (status === '-1') {
        return 'excluded';
    } else if (status === '0') {
        return 'must-exist';
    } else if (!isNaN(status) && parseInt(status) > 0) {
        return parseInt(status);
    }
    return 'unknown';
}

function generateShareText(guesses, letterStatus, config) {
    try {
        let text = '';

        for (const guess of guesses) {
            let feedback;
            if (guess.green === 0 && guess.yellow === 0) {
                feedback = '⬜';
            } else {
                feedback = '🟩'.repeat(guess.green) + '🟨'.repeat(guess.yellow);
            }
            text += `${guess.word} ${feedback}\n`;
        }

        text += '---\n';

        const vowels = 'aeiou';
        let vowelLine = '';
        for (const vowel of vowels) {
            const status = letterStatus[vowel];
            vowelLine += `${vowel}:${formatLetterStatus(status)};`;
        }
        text += vowelLine + '\n';

        const consonants = 'bcdfghjklmnpqrstvwxyz';
        for (const consonant of consonants) {
            if (letterStatus[consonant]) {
                text += `${consonant}:${formatLetterStatus(letterStatus[consonant])};\n`;
            }
        }

        return text;
    } catch (error) {
        console.error('生成分享文本失败:', error);
        return '';
    }
}

function formatLetterStatus(status) {
    if (status === 'unknown' || status === undefined) {
        return '?';
    } else if (status === 'excluded') {
        return '-1';
    } else if (status === 'must-exist') {
        return '0';
    } else if (typeof status === 'number' && status > 0) {
        return String(status);
    }
    return '?';
}

function generateCurrentStatus(letterStatus, answerLength) {
    const status = [];
    for (let i = 1; i <= answerLength; i++) {
        let letter = '';
        for (const [key, value] of Object.entries(letterStatus)) {
            if (value === i) {
                letter = key;
                break;
            }
        }
        status.push(letter);
    }
    return status;
}

function updateLetterStatusFromCurrentStatus(currentStatus, letterStatus) {
    const newLetterStatus = { ...letterStatus };
    
    for (const [key, value] of Object.entries(newLetterStatus)) {
        if (typeof value === 'number' && value > 0) {
            delete newLetterStatus[key];
        }
    }
    
    currentStatus.forEach((letter, index) => {
        if (letter) {
            newLetterStatus[letter] = index + 1;
        }
    });
    
    return newLetterStatus;
}

window.parseShareText = parseShareText;
window.parseLetterStatus = parseLetterStatus;
window.generateShareText = generateShareText;
window.formatLetterStatus = formatLetterStatus;
window.generateCurrentStatus = generateCurrentStatus;
window.updateLetterStatusFromCurrentStatus = updateLetterStatusFromCurrentStatus;
