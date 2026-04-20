// 顶部状态组件
window.StatusComponent = {
  // 初始化
  init: function () {
    this.setupEventListeners();
    this.updateStatusInputs();
    this.updateModeDisplay();
  },

  // 设置事件监听器
  setupEventListeners: function () {
    // 模式切换按钮
    document.getElementById("modeToggle").addEventListener("click", () => {
      this.toggleMode();
    });

    // 重置按钮
    document.getElementById("resetBtn").addEventListener("click", () => {
      this.resetApp();
    });
  },

  // 切换模式
  toggleMode: function () {
    const currentMode = StorageUtil.getMode();
    const newMode = currentMode === "note" ? "judge" : "note";

    StorageUtil.saveMode(newMode);
    this.updateModeDisplay();
    this.updateModeSection();

    // 通知主应用模式已切换
    if (window.App) {
      window.App.onModeChange(newMode);
    }
  },

  // 更新模式显示
  updateModeDisplay: function () {
    const mode = StorageUtil.getMode();
    const modeText = mode === "note" ? "猜词笔记模式" : "出题人辅助判定模式";
    document.getElementById("currentMode").textContent = modeText;
  },

  // 更新模式区域显示
  updateModeSection: function () {
    const mode = StorageUtil.getMode();
    document
      .getElementById("noteMode")
      .classList.toggle("active", mode === "note");
    document
      .getElementById("judgeMode")
      .classList.toggle("active", mode === "judge");
  },

  // 更新状态输入框
  updateStatusInputs: function () {
    const config = StorageUtil.getConfig();
    const statusInputs = document.getElementById("statusInputs");
    statusInputs.innerHTML = "";

    for (let i = 0; i < config.answerLength; i++) {
      const input = document.createElement("input");
      input.type = "text";
      input.maxLength = 1;
      input.className = "status-input";
      input.dataset.position = i + 1;

      // 从字母状态中获取固定位置的字母
      const letter = this.getLetterAtPosition(i + 1);
      if (letter) {
        input.value = letter;
      }

      // 输入事件处理
      input.addEventListener("input", (e) => {
        const value = e.target.value.toLowerCase();
        if (/^[a-z]$/.test(value)) {
          this.updateLetterPosition(value, parseInt(e.target.dataset.position));
        } else {
          e.target.value = "";
          this.clearLetterPosition(parseInt(e.target.dataset.position));
        }
      });

      statusInputs.appendChild(input);
    }
  },

  // 获取指定位置的字母
  getLetterAtPosition: function (position) {
    const letterStatus = StorageUtil.getLetterStatus();
    for (const [letter, status] of Object.entries(letterStatus)) {
      if (status.position === position) {
        return letter;
      }
    }
    return "";
  },

  // 更新字母位置
  updateLetterPosition: function (letter, position) {
    const letterStatus = StorageUtil.getLetterStatus();

    // 清除其他字母在该位置的固定状态
    for (const [key, status] of Object.entries(letterStatus)) {
      if (status.position === position) {
        letterStatus[key].position = 0;
        letterStatus[key].exists = 1; // 保持存在状态
      }
    }

    // 设置当前字母的位置
    letterStatus[letter].position = position;
    letterStatus[letter].exists = 1;

    StorageUtil.saveLetterStatus(letterStatus);

    // 通知主应用字母状态已更新
    if (window.App) {
      window.App.onLetterStatusChange();
    }
  },

  // 清除字母位置
  clearLetterPosition: function (position) {
    const letterStatus = StorageUtil.getLetterStatus();

    for (const [key, status] of Object.entries(letterStatus)) {
      if (status.position === position) {
        letterStatus[key].position = 0;
        // 保持exists状态不变
      }
    }

    StorageUtil.saveLetterStatus(letterStatus);

    // 通知主应用字母状态已更新
    if (window.App) {
      window.App.onLetterStatusChange();
    }
  },

  // 重置应用
  resetApp: function () {
    if (confirm("确定要重置所有数据吗？")) {
      StorageUtil.clear();
      location.reload();
    }
  },

  // 获取当前模式
  getCurrentMode: function () {
    return StorageUtil.getMode();
  },
};
