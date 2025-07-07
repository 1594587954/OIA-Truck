// 应用程序入口点 - 简化的初始化逻辑
class Application {
    constructor() {
        this.moduleLoader = null;
        this.initialized = false;
    }

    // 初始化应用程序
    async init() {
        if (this.initialized) {
            console.warn('应用程序已经初始化过了');
            return;
        }

        try {
            console.log('开始初始化应用程序...');

            // 加载模块加载器
            await this.loadModuleLoader();

            // 使用模块加载器加载所有模块
            await this.moduleLoader.loadModules();

            this.initialized = true;
            console.log('应用程序初始化完成');

        } catch (error) {
            console.error('应用程序初始化失败:', error);
            this.handleInitError(error);
        }
    }

    // 加载模块加载器
    async loadModuleLoader() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'js/core/module-loader.js';
            script.onload = () => {
                this.moduleLoader = window.moduleLoader;
                resolve();
            };
            script.onerror = () => reject(new Error('模块加载器加载失败'));
            document.head.appendChild(script);
        });
    }

    // 处理初始化错误
    handleInitError(error) {
        console.error('应用程序启动失败:', error);

        // 显示错误信息给用户
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #f8d7da;
            color: #721c24;
            padding: 20px;
            border: 1px solid #f5c6cb;
            border-radius: 5px;
            z-index: 9999;
            max-width: 400px;
            text-align: center;
        `;
        errorDiv.innerHTML = `
            <h3>应用程序启动失败</h3>
            <p>请刷新页面重试，如果问题持续存在，请联系技术支持。</p>
            <button onclick="location.reload()" style="
                background: #dc3545;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 3px;
                cursor: pointer;
                margin-top: 10px;
            ">刷新页面</button>
        `;
        document.body.appendChild(errorDiv);
    }

    // 获取应用状态
    getStatus() {
        return {
            initialized: this.initialized,
            moduleLoader: this.moduleLoader?.getStatus() || null
        };
    }
}

// 创建全局应用实例
window.app = new Application();

// 页面加载完成后启动应用 - 优化版本
document.addEventListener('DOMContentLoaded', () => {
    // 立即启动应用
    window.app.init();

    // 监听应用完全加载事件
    window.addEventListener('appFullyLoaded', async () => {
        console.log('应用完全加载，执行后续初始化...');

        // 更新仪表盘统计数据
        if (window.dashboardManager) {
            await window.dashboardManager.updateDashboardStats();
        }

        // 如果当前显示的是订单管理页面，加载订单数据
        const orderManagementSection = document.getElementById('order-management');
        if (orderManagementSection && orderManagementSection.style.display !== 'none') {
            if (window.orderManager) {
                await window.orderManager.loadOrdersTable();
            }
        }
    });

        // 快速初始化基础功能（不等待所有模块）
    setTimeout(async () => {
        const startTime = performance.now();

        // 尝试更新基础统计（如果模块已加载）
        if (window.dashboardManager) {
            await window.dashboardManager.updateDashboardStats();
        }

        // 记录初始化渲染时间
        if (window.performanceMonitor) {
            window.performanceMonitor.recordRenderTime('初始化渲染', startTime);
        }
    }, 50);

    // 监控用户交互性能
    document.addEventListener('click', (e) => {
        const startTime = performance.now();
        const target = e.target;
        const actionName = target.textContent?.trim() || target.className || '未知操作';

        // 延迟记录，确保操作完成
        setTimeout(() => {
            if (window.performanceMonitor) {
                window.performanceMonitor.recordInteraction(actionName, startTime);
            }
        }, 10);
    });
});