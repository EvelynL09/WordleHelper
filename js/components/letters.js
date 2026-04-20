// 字母状态组件
window.LettersComponent = {
  // 初始化
  init: function () {
    this.renderLetters();
  },

  // 渲染字母状态
  renderLetters: function () {
    const letterStatus = StorageUtil.getLetterStatus();

    // 分类字母
    const existLetters = [];
    const possibleLetters = [];
    const excludedLetters = [];

    Object.entries(letterStatus).forEach(([letter, status]) => {
      if (status.exists === 1) {
        existLetters.push({ letter, status });
      } else if (status.exists === 0) {
        excludedLetters.push({ letter, status });
      } else if (status.exists === -1) {
        possibleLetters.push({ letter, status });
      }
    });

    // 渲染必存在字母
    this.renderLetterList("existLetters", existLetters, "exist");

    // 渲染可能存在字母
    this.renderLetterList("possibleLetters", possibleLetters, "possible");

    // 渲染已排除字母
    this.renderLetterList("excludedLetters", excludedLetters, "excluded");
  },

  // 渲染字母列表
  renderLetterList: function (containerId, letters, type) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    letters.forEach(({ letter, status }) => {
      const letterItem = document.createElement("div");
      letterItem.className = `letter-item ${type}`;
      letterItem.textContent = letter;
      letterItem.title = this.getLetterTooltip(letter, status);

      // 左键点击切换状态
      letterItem.addEventListener("click", () => {
        this.toggleLetterStatus(letter);
      });

      // 右键点击标记为已排除
      letterItem.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        this.markAsExcluded(letter);
      });

      container.appendChild(letterItem);
    });
  },

  // 获取字母提示信息
  getLetterTooltip: function (letter, status) {
    let tooltip = `字母: ${letter}\n`;

    if (status.exists === 1) {
      tooltip += "状态: 必存在\n";
    } else if (status.exists === 0) {
      tooltip += "状态: 已排除\n";
    } else {
      tooltip += "状态: 可能存在\n";
    }

    if (status.position > 0) {
      tooltip += `位置: ${status.position}\n`;
    }

    if (status.excludedPositions.length > 0) {
      tooltip += `排除位置: ${status.excludedPositions.join(", ")}\n`;
    }

    return tooltip;
  },

  // 切换字母状态
  toggleLetterStatus: function (letter) {
    const letterStatus = StorageUtil.getLetterStatus();
    const currentStatus = letterStatus[letter].exists;

    if (currentStatus === -1) {
      // 不确定 -> 必存在
      letterStatus[letter].exists = 1;
    } else if (currentStatus === 1) {
      // 必存在 -> 可能存在
      letterStatus[letter].exists = -1;
      letterStatus[letter].position = 0;
    } else if (currentStatus === 0) {
      // 已排除 -> 可能存在
      letterStatus[letter].exists = -1;
      letterStatus[letter].position = 0;
      letterStatus[letter].excludedPositions = [];
    }

    StorageUtil.saveLetterStatus(letterStatus);
    this.renderLetters();

    // 通知主应用字母状态已更新
    if (window.App) {
      window.App.onLetterStatusChange();
    }
  },

  // 标记字母为已排除
  markAsExcluded: function (letter) {
    const letterStatus = StorageUtil.getLetterStatus();

    if (letterStatus[letter].exists === 1) {
      if (!confirm(`字母 ${letter} 被标记为必存在，确定要标记为排除吗？`)) {
        return;
      }
    }

    letterStatus[letter].exists = 0;
    letterStatus[letter].position = -1;
    letterStatus[letter].excludedPositions = [];

    StorageUtil.saveLetterStatus(letterStatus);
    this.renderLetters();

    // 通知主应用字母状态已更新
    if (window.App) {
      window.App.onLetterStatusChange();
    }
  },

  // 获取字母状态
  getLetterStatus: function () {
    return StorageUtil.getLetterStatus();
  },

  // 设置字母状态
  setLetterStatus: function (letterStatus) {
    StorageUtil.saveLetterStatus(letterStatus);
    this.renderLetters();
  },
};
