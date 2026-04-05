// 主脚本文件

let statusComponent, configComponent, guessesComponent, lettersComponent, validatorComponent, shareComponent;

function initApp() {
    statusComponent = new StatusComponent();
    configComponent = new ConfigComponent();
    guessesComponent = new GuessesComponent();
    lettersComponent = new LettersComponent();
    validatorComponent = new ValidatorComponent();
    shareComponent = new ShareComponent();
    
    const config = configComponent.getConfig();
    const letterStatus = lettersComponent.getLetterStatus();
    const guesses = guessesComponent.getGuesses();

    configComponent.init(onConfigChange);
    statusComponent.init(config.answerLength, letterStatus, onStatusChange);
    guessesComponent.init(config, onGuessesChange, onLetterStatusChange);
    lettersComponent.init(onLetterStatusChange);
    validatorComponent.init(letterStatus, config);
    shareComponent.init(guesses, letterStatus, config, onImport);

    const currentStatus = statusComponent.getCurrentStatus();
    lettersComponent.updateFromCurrentStatus(currentStatus);
    
    guessesComponent.updateLetterStatus(letterStatus);

    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetApp);
    }
}

function onConfigChange(config) {
    statusComponent.updateAnswerLength(config.answerLength);
    guessesComponent.updateConfig(config);
    validatorComponent.updateConfig(config);
    shareComponent.updateConfig(config);
}

function onStatusChange(currentStatus) {
    lettersComponent.updateFromCurrentStatus(currentStatus);
}

function onGuessesChange(guesses) {
    shareComponent.updateGuesses(guesses);
}

function onLetterStatusChange(letterStatus) {
    validatorComponent.updateLetterStatus(letterStatus);
    shareComponent.updateLetterStatus(letterStatus);
    // 移除对 guessesComponent 的调用，避免循环依赖
    // guessesComponent.updateLetterStatus(letterStatus);
    // 直接更新 lettersComponent，确保字母状态面板同步
    lettersComponent.updateLetterStatus(letterStatus);
}

function onImport(data) {
    if (data.letterStatus) {
        lettersComponent.updateLetterStatus(data.letterStatus);
    }
    if (data.guesses) {
        guessesComponent.updateGuesses(data.guesses);
    }
}

function resetApp() {
    if (confirm('确定要重置所有数据吗？')) {
        statusComponent.clear();
        guessesComponent.clear();
        lettersComponent.clear();
        alert('重置完成！');
    }
}

window.addEventListener('DOMContentLoaded', initApp);

function testApp() {
    console.log('Wordle游戏辅助工具初始化完成');
    console.log('配置:', configComponent.getConfig());
    console.log('字母状态:', lettersComponent.getLetterStatus());
    console.log('猜词记录:', guessesComponent.getGuesses());
}

window.testApp = testApp;
