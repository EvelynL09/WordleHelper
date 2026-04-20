// 验证工具
window.ValidatorUtil = {
  // 验证候选词
  validateWord: function (word, letterStatus) {
    const errors = [];

    // 检查必存在的字母
    const existLetters = Object.entries(letterStatus)
      .filter(([_, status]) => status.exists === 1)
      .map(([letter]) => letter);

    for (const letter of existLetters) {
      if (!word.includes(letter)) {
        errors.push(`缺少必存在的字母: ${letter}`);
      }
    }

    // 检查已排除的字母
    const excludedLetters = Object.entries(letterStatus)
      .filter(([_, status]) => status.exists === 0)
      .map(([letter]) => letter);

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
          errors.push(
            `字母 ${letter} 应在位置 ${letterStatus[letter].position}`,
          );
        }
      }
    }

    // 检查排除位置的字母
    for (let i = 0; i < word.length; i++) {
      const letter = word[i];
      const position = i + 1; // 位置从1开始

      if (
        letterStatus[letter] &&
        letterStatus[letter].excludedPositions.includes(position)
      ) {
        errors.push(`字母 ${letter} 不能在位置 ${position}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors,
    };
  },

  // 判定猜词结果
  judgeGuess: function (guess, answer) {
    const guessLower = guess.toLowerCase();
    const answerLower = answer.toLowerCase();
    const letterResults = [];
    const tempResult = [];
    const answerCounts = {};

    // 获取当前颜色反馈配置
    let preset = "DEFAULT";
    let feedback = window.Constants.FEEDBACK_PRESETS.DEFAULT;

    if (typeof StorageUtil !== "undefined" && StorageUtil.getFeedbackPreset) {
      preset = StorageUtil.getFeedbackPreset();
      feedback =
        window.Constants.FEEDBACK_PRESETS[preset] ||
        window.Constants.FEEDBACK_PRESETS.DEFAULT;
    }

    // 统计答案中每个字母的出现次数
    for (const char of answerLower) {
      answerCounts[char] = (answerCounts[char] || 0) + 1;
    }

    // 按照文档逻辑：先判断字母是否存在，再判断位置是否正确
    for (let i = 0; i < guessLower.length; i++) {
      const letter = guessLower[i];

      // 判断字母是否在答案中存在
      if (answerLower.includes(letter)) {
        // 字母存在，判断位置是否正确
        if (i < answerLower.length && guessLower[i] === answerLower[i]) {
          tempResult[i] = feedback.CORRECT;
          letterResults.push({ letter: letter, result: feedback.CORRECT });
        } else {
          tempResult[i] = feedback.PRESENT;
          letterResults.push({ letter: letter, result: feedback.PRESENT });
        }
      } else {
        // 字母不存在
        tempResult[i] = feedback.ABSENT;
        letterResults.push({ letter: letter, result: feedback.ABSENT });
      }
    }

    // 生成合并后的结果
    const mergedResult = this.mergeResults(tempResult, feedback, guessLower);

    return {
      letterResults: letterResults,
      rawResult: tempResult.join(""),
      mergedResult: mergedResult,
    };
  },

  // 合并结果
  mergeResults: function (results, feedback, letters) {
    if (results.length === 0) {
      return feedback.ABSENT; // 空猜测返回不存在
    }

    // 统计每个字母的结果状态
    const letterStatus = {};

    for (let i = 0; i < letters.length; i++) {
      const letter = letters[i];
      const result = results[i];

      if (!letterStatus[letter]) {
        letterStatus[letter] = {
          correct: false,
          present: false,
          absent: false,
        };
      }

      if (result === feedback.CORRECT) {
        letterStatus[letter].correct = true;
      } else if (result === feedback.PRESENT) {
        letterStatus[letter].present = true;
      } else if (result === feedback.ABSENT) {
        letterStatus[letter].absent = true;
      }
    }

    // 根据文档逻辑生成合并结果
    const merged = [];

    // 情况A：所有字母都不存在，返回一个⬜
    const allAbsent = Object.values(letterStatus).every(
      (status) => status.absent && !status.correct && !status.present,
    );
    if (allAbsent) {
      return feedback.ABSENT;
    }

    // 情况B：n个🟩正确 + m个🟨存在
    // 先添加所有🟩，再添加所有🟨
    for (const letter in letterStatus) {
      const status = letterStatus[letter];

      // 某一个字母如果有至少一个`🟩 正确`就不需要管其他🟨🟩，直接保留一个`🟩 正确`
      if (status.correct) {
        merged.push(feedback.CORRECT);
      }
    }

    for (const letter in letterStatus) {
      const status = letterStatus[letter];

      // 否则如果存在`🟨 存在`，提供`🟨 存在`
      if (status.present && !status.correct) {
        merged.push(feedback.PRESENT);
      }
    }

    return merged.join("");
  },

  // 验证单词长度
  validateWordLength: function (word, minLength, maxLength) {
    return word.length >= minLength && word.length <= maxLength;
  },

  // 验证是否为字母
  validateLetters: function (word) {
    return /^[a-z]+$/i.test(word);
  },

  // 验证配置
  validateConfig: function (config) {
    const errors = [];

    if (config.answerLength < 4 || config.answerLength > 10) {
      errors.push("答案单词长度应在4-10之间");
    }

    if (config.minGuessLength < 4 || config.minGuessLength > 10) {
      errors.push("猜测单词最小长度应在4-10之间");
    }

    if (config.maxGuessLength < 4 || config.maxGuessLength > 10) {
      errors.push("猜测单词最大长度应在4-10之间");
    }

    if (config.minGuessLength > config.maxGuessLength) {
      errors.push("猜测单词最小长度不能大于最大长度");
    }

    return {
      valid: errors.length === 0,
      errors: errors,
    };
  },
};
