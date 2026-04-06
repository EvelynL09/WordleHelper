// 验证工具
window.ValidatorUtil = {
    // 验证候选词
    validateWord: function(word, letterStatus) {
        const errors = [];
        
        // 检查必存在的字母
        const existLetters = Object.entries(letterStatus)
            .filter(([_, status]) => status.exists === 1)
            .map(([letter, _]) => letter);
        
        for (const letter of existLetters) {
            if (!word.includes(letter)) {
                errors.push(`缺少必存在的字母: ${letter}`);
            }
        }
        
        // 检查已排除的字母
        const excludedLetters = Object.entries(letterStatus)
            .filter(([_, status]) => status.exists === 0)
            .map(([letter, _]) => letter);
        
        for (const letter of excludedLetters) {
            if (word.includes(letter)) {
                errors.push(`包含已排除的字母: ${letter}`);
            }
        }
        
        // 检查固定位置的字母
        for (let i = 0; i < word.length; i++) {
            const letter = word[i];
            const position = i + 1; // 位置从1开始
            
            if (letterStatus[letter] && letterStatus[letter].position > 0) {
                if (letterStatus[letter].position !== position) {
                    errors.push(`字母 ${letter} 应在位置 ${letterStatus[letter].position}`);
                }
            }
        }
        
        // 检查排除位置的字母
        for (let i = 0; i < word.length; i++) {
            const letter = word[i];
            const position = i + 1; // 位置从1开始
            
            if (letterStatus[letter] && letterStatus[letter].excludedPositions.includes(position)) {
                errors.push(`字母 ${letter} 不能在位置 ${position}`);
            }
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    },
    
    // 判定猜词结果
    judgeGuess: function(guess, answer) {
        const guessLower = guess.toLowerCase();
        const answerLower = answer.toLowerCase();
        const letterResults = [];
        const answerCounts = {};
        
        // 获取当前颜色反馈配置
        let preset = 'DEFAULT';
        let feedback = window.Constants.FEEDBACK_PRESETS.DEFAULT;
        
        if (typeof StorageUtil !== 'undefined' && StorageUtil.getFeedbackPreset) {
            preset = StorageUtil.getFeedbackPreset();
            feedback = window.Constants.FEEDBACK_PRESETS[preset] || window.Constants.FEEDBACK_PRESETS.DEFAULT;
        }
        
        // 统计答案中每个字母的出现次数
        for (const char of answerLower) {
            answerCounts[char] = (answerCounts[char] || 0) + 1;
        }
        
        // 先标记绿色（位置正确）
        const tempAnswer = answerLower.split('');
        const tempResult = [];
        
        for (let i = 0; i < guessLower.length; i++) {
            if (i < answerLower.length && guessLower[i] === answerLower[i]) {
                tempResult.push(feedback.CORRECT);
                tempAnswer[i] = null; // 标记为已处理
                answerCounts[guessLower[i]]--;
            } else {
                tempResult.push(undefined);
            }
        }
        
        // 再标记黄色（存在但位置不正确）和灰色（不存在）
        for (let i = 0; i < guessLower.length; i++) {
            if (tempResult[i] === undefined) {
                const char = guessLower[i];
                if (answerCounts[char] > 0) {
                    tempResult[i] = feedback.PRESENT;
                    answerCounts[char]--;
                } else {
                    tempResult[i] = feedback.ABSENT;
                }
            }
        }
        
        // 构建每个字母的结果
        for (let i = 0; i < guessLower.length; i++) {
            letterResults.push({
                letter: guessLower[i],
                result: tempResult[i]
            });
        }
        
        // 生成合并后的结果
        const mergedResult = this.mergeResults(tempResult, feedback);
        
        return {
            letterResults: letterResults,
            rawResult: tempResult.join(''),
            mergedResult: mergedResult
        };
    },
    
    // 合并结果
    mergeResults: function(results, feedback) {
        // 如果没有传入feedback参数，使用默认配置
        if (!feedback) {
            feedback = window.Constants.FEEDBACK_PRESETS.DEFAULT;
        }
        
        let correctCount = 0;
        let presentCount = 0;
        let hasMatch = false;
        
        for (const result of results) {
            if (result === feedback.CORRECT) {
                correctCount++;
                hasMatch = true;
            } else if (result === feedback.PRESENT) {
                presentCount++;
                hasMatch = true;
            }
        }
        
        if (!hasMatch) {
            return feedback.ABSENT;
        }
        
        let merged = '';
        for (let i = 0; i < correctCount; i++) {
            merged += feedback.CORRECT;
        }
        for (let i = 0; i < presentCount; i++) {
            merged += feedback.PRESENT;
        }
        
        return merged;
    },
    
    // 验证单词长度
    validateWordLength: function(word, minLength, maxLength) {
        return word.length >= minLength && word.length <= maxLength;
    },
    
    // 验证是否为字母
    validateLetters: function(word) {
        return /^[a-z]+$/i.test(word);
    },
    
    // 验证配置
    validateConfig: function(config) {
        const errors = [];
        
        if (config.answerLength < 4 || config.answerLength > 10) {
            errors.push('答案单词长度应在4-10之间');
        }
        
        if (config.minGuessLength < 4 || config.minGuessLength > 10) {
            errors.push('猜测单词最小长度应在4-10之间');
        }
        
        if (config.maxGuessLength < 4 || config.maxGuessLength > 10) {
            errors.push('猜测单词最大长度应在4-10之间');
        }
        
        if (config.minGuessLength > config.maxGuessLength) {
            errors.push('猜测单词最小长度不能大于最大长度');
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
};