// 数据备份和导入模块
class DataBackupManager {
    constructor() {
        this.dataManager = window.dataManager;
        this.version = '1.0.0';
        this.supportedDataTypes = [
            'dispatchOrders',
            'customerData',
            'customers', 
            'diyRoutes',
            'transportTeams'
        ];
    }

    // 导出所有数据
    exportAllData() {
        try {
            console.log('开始导出所有数据...');
            
            // 收集所有数据
            const backupData = {
                version: this.version,
                timestamp: new Date().toISOString(),
                data: {}
            };

            // 获取所有存储的数据
            this.supportedDataTypes.forEach(dataType => {
                const key = this.getStorageKey(dataType);
                const data = this.dataManager.get(key, null);
                if (data !== null) {
                    backupData.data[dataType] = data;
                }
            });

            // 添加统计信息
            backupData.stats = {
                ordersCount: Array.isArray(backupData.data.dispatchOrders) ? backupData.data.dispatchOrders.length : 0,
                customersCount: Array.isArray(backupData.data.customers) ? backupData.data.customers.length : 
                               (backupData.data.customerData ? Object.keys(backupData.data.customerData).length : 0),
                routesCount: Array.isArray(backupData.data.diyRoutes) ? backupData.data.diyRoutes.length : 0,
                teamsCount: Array.isArray(backupData.data.transportTeams) ? backupData.data.transportTeams.length : 0
            };

            // 生成文件名
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            const filename = `OIA-TRUCK-备份-${timestamp}.json`;

            // 下载文件
            this.downloadJSON(backupData, filename);
            
            // 显示成功消息
            this.showMessage('数据备份成功！', 'success');
            
            console.log('数据导出完成:', backupData.stats);
            
        } catch (error) {
            console.error('导出数据失败:', error);
            this.showMessage('数据备份失败: ' + error.message, 'error');
        }
    }

    // 导入数据
    importAllData() {
        try {
            // 创建文件输入元素
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.style.display = 'none';
            
            input.onchange = (event) => {
                const file = event.target.files[0];
                if (!file) return;
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const backupData = JSON.parse(e.target.result);
                        this.processImportData(backupData);
                    } catch (error) {
                        console.error('解析备份文件失败:', error);
                        this.showMessage('备份文件格式错误，请选择有效的备份文件', 'error');
                    }
                };
                reader.readAsText(file);
            };
            
            document.body.appendChild(input);
            input.click();
            document.body.removeChild(input);
            
        } catch (error) {
            console.error('导入数据失败:', error);
            this.showMessage('数据导入失败: ' + error.message, 'error');
        }
    }

    // 处理导入的数据
    processImportData(backupData) {
        try {
            // 验证备份数据格式
            if (!this.validateBackupData(backupData)) {
                this.showMessage('备份文件格式不正确', 'error');
                return;
            }

            // 显示确认对话框
            const stats = backupData.stats || {};
            const message = `确定要导入以下数据吗？\n\n` +
                          `• 订单: ${stats.ordersCount || 0} 条\n` +
                          `• 客户: ${stats.customersCount || 0} 个\n` +
                          `• 路线: ${stats.routesCount || 0} 条\n` +
                          `• 运输团队: ${stats.teamsCount || 0} 个\n\n` +
                          `备份时间: ${backupData.timestamp ? new Date(backupData.timestamp).toLocaleString() : '未知'}\n\n` +
                          `注意：这将覆盖当前所有数据！`;

            if (!confirm(message)) {
                return;
            }

            // 执行数据导入
            let importedCount = 0;
            const importResults = {};

            this.supportedDataTypes.forEach(dataType => {
                if (backupData.data[dataType] !== undefined) {
                    const key = this.getStorageKey(dataType);
                    const success = this.dataManager.set(key, backupData.data[dataType]);
                    importResults[dataType] = success;
                    if (success) importedCount++;
                }
            });

            // 清除缓存以确保数据更新
            this.dataManager.clearCache();

            // 刷新页面数据显示
            this.refreshPageData();

            // 显示导入结果
            if (importedCount > 0) {
                this.showMessage(`数据导入成功！已导入 ${importedCount} 类数据`, 'success');
                console.log('数据导入完成:', importResults);
            } else {
                this.showMessage('没有数据被导入', 'warning');
            }

        } catch (error) {
            console.error('处理导入数据失败:', error);
            this.showMessage('数据导入失败: ' + error.message, 'error');
        }
    }

    // 验证备份数据格式
    validateBackupData(backupData) {
        if (!backupData || typeof backupData !== 'object') {
            return false;
        }

        // 检查必要字段
        if (!backupData.data || typeof backupData.data !== 'object') {
            return false;
        }

        // 检查版本兼容性
        if (backupData.version && !this.isVersionCompatible(backupData.version)) {
            console.warn('备份文件版本可能不兼容:', backupData.version);
        }

        return true;
    }

    // 检查版本兼容性
    isVersionCompatible(version) {
        // 简单的版本兼容性检查
        const currentMajor = parseInt(this.version.split('.')[0]);
        const backupMajor = parseInt(version.split('.')[0]);
        return currentMajor === backupMajor;
    }

    // 获取存储键名
    getStorageKey(dataType) {
        const keyMap = {
            'dispatchOrders': 'dispatchOrders',
            'customerData': 'customerData',
            'customers': 'customers',
            'diyRoutes': 'diyRoutes',
            'transportTeams': 'transportTeams'
        };
        return keyMap[dataType] || dataType;
    }

    // 下载JSON文件
    downloadJSON(data, filename) {
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }

    // 刷新页面数据显示
    refreshPageData() {
        try {
            // 刷新存储管理器数据
            if (window.storageManager && typeof window.storageManager.loadDataFromLocalStorage === 'function') {
                window.storageManager.loadDataFromLocalStorage();
            }

            // 刷新仪表盘统计
            if (window.dashboardManager && typeof window.dashboardManager.updateStats === 'function') {
                window.dashboardManager.updateStats();
            }

            // 触发页面重新加载数据的事件
            window.dispatchEvent(new CustomEvent('dataImported', {
                detail: { timestamp: new Date().toISOString() }
            }));

            console.log('页面数据已刷新');
        } catch (error) {
            console.error('刷新页面数据失败:', error);
        }
    }

    // 显示消息
    showMessage(message, type = 'info') {
        // 创建消息元素
        const messageDiv = document.createElement('div');
        messageDiv.className = `backup-message backup-message-${type}`;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideInRight 0.3s ease-out;
        `;

        // 设置背景色
        const colors = {
            'success': '#28a745',
            'error': '#dc3545',
            'warning': '#ffc107',
            'info': '#17a2b8'
        };
        messageDiv.style.backgroundColor = colors[type] || colors.info;

        messageDiv.textContent = message;

        // 添加关闭按钮
        const closeBtn = document.createElement('span');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.cssText = `
            float: right;
            margin-left: 10px;
            cursor: pointer;
            font-size: 18px;
            line-height: 1;
        `;
        closeBtn.onclick = () => messageDiv.remove();
        messageDiv.appendChild(closeBtn);

        // 添加动画样式
        if (!document.getElementById('backup-message-styles')) {
            const style = document.createElement('style');
            style.id = 'backup-message-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(messageDiv);

        // 自动移除消息
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, type === 'error' ? 8000 : 5000);
    }
}

// 创建全局实例
window.dataBackupManager = new DataBackupManager();

// 全局函数供HTML调用
window.exportAllData = function() {
    window.dataBackupManager.exportAllData();
};

window.importAllData = function() {
    window.dataBackupManager.importAllData();
};

// 模块导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataBackupManager;
}