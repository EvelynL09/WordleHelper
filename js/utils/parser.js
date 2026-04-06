// 数据解析工具
window.ParserUtil = {
    // 解析分享文本
    parseShareText: function(text) {
        const lines = text.trim().split('\n');
        const guesses = [];
        const letterStatus = StorageUtil.getDefaultLetterStatus();
        let parsingGuesses = true;
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;
            
            // 检查是否开始解析字母状态
            if (trimmedLine.match(/^[a-z]:/i)) {
                parsingGuesses = false;
            }
            
            if (parsingGuesses) {
                // 解析猜词记录
                const match = trimmedLine.match(/^([a-z]+)\s+([🟩🟨⬜]+)$/i);
                if (match) {
                    const word = match[1].toLowerCase();
                    const feedback = match[2];
                    const greenCount = (feedback.match(/🟩/g) || []).length;
                    const yellowCount = (feedback.match(/🟨/g) || []).length;
                    
                    guesses.push({
                        word: word,
                        green: greenCount,
                        yellow: yellowCount,
                        feedback: feedback
                    });
                }
            } else {
                // 解析字母状态
                const match = trimmedLine.match(/^([a-z]):\s*([-101])\s*([-10-9]+)\s*\[([\d, ]*)\]$/i);
                if (match) {
                    const letter = match[1].toLowerCase();
                    const exists = parseInt(match[2]);
                    const position = parseInt(match[3]);
                    const excludedPositions = match[4]
                        .split(',')
                        .map(p => parseInt(p.trim()))
                        .filter(p => !isNaN(p));
                    
                    if (letterStatus[letter]) {
                        letterStatus[letter] = {
                            exists: exists,
                            position: position,
                            excludedPositions: excludedPositions
                        };
                    }
                }
            }
        }
        
        return { guesses, letterStatus };
    },
    
    // 生成分享文本
    generateShareText: function(guesses, letterStatus) {
        let text = '';
        
        // 添加猜词记录
        guesses.forEach(guess => {
            text += `${guess.word} ${guess.feedback}\n`;
        });
        
        text += '\n';
        
        // 添加字母状态
        Object.entries(letterStatus).forEach(([letter, status]) => {
            if (status.exists !== -1 || status.position !== 0 || status.excludedPositions.length > 0) {
                text += `${letter}: ${status.exists} ${status.position} [${status.excludedPositions.join(', ')}]\n`;
            }
        });
        
        return text.trim();
    },
    
    // 解析单个猜词记录
    parseGuess: function(text) {
        const match = text.trim().match(/^([a-z]+)\s+([🟩🟨⬜]+)$/i);
        if (match) {
            const word = match[1].toLowerCase();
            const feedback = match[2];
            const greenCount = (feedback.match(/🟩/g) || []).length;
            const yellowCount = (feedback.match(/🟨/g) || []).length;
            
            return {
                word: word,
                green: greenCount,
                yellow: yellowCount,
                feedback: feedback
            };
        }
        return null;
    },
    
    // 生成反馈emoji
    generateFeedback: function(word, green, yellow) {
        if (green === 0 && yellow === 0) {
            return '⬜'.repeat(word.length);
        }
        
        let feedback = '';
        for (let i = 0; i < word.length; i++) {
            if (i < green) {
                feedback += '🟩';
            } else if (i < green + yellow) {
                feedback += '🟨';
            } else {
                feedback += '⬜';
            }
        }
        return feedback;
    }
};