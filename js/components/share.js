// 分享导入组件
window.ShareComponent = {
    // 初始化
    init: function() {
        this.setupEventListeners();
    },
    
    // 设置事件监听器
    setupEventListeners: function() {
        // 导出按钮
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportData();
        });
        
        // 导入按钮
        document.getElementById('importBtn').addEventListener('click', () => {
            this.importData();
        });
    },
    
    // 导出数据
    exportData: function() {
        const guesses = StorageUtil.getGuesses();
        const letterStatus = StorageUtil.getLetterStatus();
        
        // 生成分享文本
        const shareText = ParserUtil.generateShareText(guesses, letterStatus);
        
        // 填充到文本框
        document.getElementById('shareText').value = shareText;
        
        // 复制到剪贴板
        this.copyToClipboard(shareText);
        alert('数据已导出并复制到剪贴板');
    },
    
    // 导入数据
    importData: function() {
        const shareText = document.getElementById('shareText').value.trim();
        
        if (!shareText) {
            alert('请粘贴分享文本');
            return;
        }
        
        try {
            // 解析分享文本
            const { guesses, letterStatus } = ParserUtil.parseShareText(shareText);
            
            // 保存数据
            StorageUtil.saveGuesses(guesses);
            StorageUtil.saveLetterStatus(letterStatus);
            
            // 通知主应用数据已更新
            if (window.App) {
                window.App.onDataImported();
            }
            
            alert('数据导入成功');
        } catch (error) {
            alert('导入失败，请检查分享文本格式');
            console.error('导入错误:', error);
        }
    },
    
    // 复制到剪贴板
    copyToClipboard: function(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
};