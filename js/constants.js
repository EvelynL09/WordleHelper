// 常量定义
window.Constants = {
    // 模式常量
    MODES: {
        NOTE: 'note',
        JUDGE: 'judge'
    },
    
    // 字母状态常量
    LETTER_STATUS: {
        EXIST: 1,
        NOT_EXIST: 0,
        UNKNOWN: -1
    },
    
    // 位置状态常量
    POSITION_STATUS: {
        FIXED: 1,
        UNKNOWN: 0,
        NOT_EXIST: -1
    },
    
    // 颜色反馈配置预设
    FEEDBACK_PRESETS: {
        DEFAULT: {
            CORRECT: '🟩',
            PRESENT: '🟨',
            ABSENT: '⬜'
        },
        CUSTOM: {
            CORRECT: '●',
            PRESENT: '○',
            ABSENT: '×'
        }
    },
    
    // 默认颜色反馈配置
    DEFAULT_FEEDBACK_PRESET: 'DEFAULT',
    
    // 存储键名常量
    STORAGE_KEYS: {
        GUESSES: 'wordle_guesses',
        LETTER_STATUS: 'wordle_letter_status',
        CONFIG: 'wordle_config',
        MODE: 'wordle_mode',
        ANSWER: 'wordle_answer',
        JUDGE_HISTORY: 'wordle_judge_history'
    },
    
    // 配置默认值
    DEFAULT_CONFIG: {
        answerLength: 5,
        minGuessLength: 4,
        maxGuessLength: 10
    },
    
    // 历史记录最大数量
    MAX_HISTORY_ITEMS: 10
};