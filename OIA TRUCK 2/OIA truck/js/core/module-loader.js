// 模块加载器 - 统一管理模块加载和初始化
class ModuleLoader {
    constructor() {
        this.modules = new Map();
        this.coreModules = ['data-manager'];
        this.loadOrder = [
            'performance-monitor', // 性能监控优先加载
            'utils',
            'storage',
            // 'dashboard', // 运营总览已移除
            'orders',
            'customer',
            'dispatch',
            'navigation',
            'transport-team'
        ];
        this.initialized = false;
    }

    // 动态加载脚本 - 带性能监控
    async loadScript(src) {
        const startTime = performance.now();
        const moduleName = src.split('/').pop().replace('.js', '');

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                console.log(`模块加载成功: ${src}`);

                // 记录模块加载时间
                if (window.performanceMonitor) {
                    window.performanceMonitor.recordModuleLoad(moduleName, startTime);
                }

                resolve();
            };
            script.onerror = () => {
                console.error(`模块加载失败: ${src}`);
                reject(new Error(`Failed to load ${src}`));
            };
            document.head.appendChild(script);
        });
    }

    // 批量加载模块 - 优化版本
    async loadModules() {
        if (this.initialized) {
            console.warn('模块已经初始化过了');
            return;
        }

        try {
            console.log('开始快速加载模块...');

            // 并行加载核心模块和关键业务模块
            const criticalModules = ['performance-monitor', 'utils', 'storage', 'dashboard', 'navigation'];
            const nonCriticalModules = ['orders', 'customer', 'dispatch', 'transport-team'];

            // 第一批：核心模块 + 关键业务模块
            const firstBatch = [
                ...this.coreModules.map(module => this.loadScript(`js/core/${module}.js`)),
                ...criticalModules.map(module => this.loadScript(`js/modules/${module}.js`))
            ];

            await Promise.all(firstBatch);
            console.log('关键模块加载完成');

            // 确保数据管理器存在并初始化默认数据
            if (window.dataManager) {
                console.log('初始化DataManager默认数据...');
                window.dataManager.initializeDefaultData();
                console.log('DataManager初始化完成');
            } else {
                console.error('DataManager未找到，尝试手动创建...');
                // 如果DataManager不存在，尝试手动创建
                if (typeof DataManager !== 'undefined') {
                    window.dataManager = new DataManager();
                    window.dataManager.initializeDefaultData();
                    console.log('手动创建DataManager成功');
                }
            }

            // 立即初始化应用程序（不等待非关键模块）
            await this.initializeApplication();
            this.initialized = true;

            // 第二批：非关键模块（后台加载）
            const secondBatch = nonCriticalModules.map(module =>
                this.loadScript(`js/modules/${module}.js`).catch(error => {
                    console.warn(`非关键模块 ${module} 加载失败:`, error);
                })
            );

            // 后台加载非关键模块
            Promise.all(secondBatch).then(() => {
                console.log('所有模块加载完成');
                // 触发完整初始化事件
                this.finalizeInitialization();
            });

        } catch (error) {
            console.error('关键模块加载失败:', error);
            // 即使部分模块失败，也尝试初始化基本功能
            await this.initializeBasicApplication();
            throw error;
        }
    }

        // 初始化应用程序 - 快速版本
    async initializeApplication() {
        console.log('开始快速初始化应用程序...');

        // 初始化DOM
        this.initializeDOM();

        // 初始化导航
        this.initializeNavigation();

        // 加载基础数据
        await this.loadApplicationData();

        console.log('基础应用程序初始化完成');
    }

    // 完成初始化 - 所有模块加载后调用
    finalizeInitialization() {
        console.log('完成应用程序初始化...');

        // 初始化所有组件
        this.initializeComponents();

        // 触发完成事件
        window.dispatchEvent(new CustomEvent('appFullyLoaded'));

        console.log('应用程序完全初始化完成');
    }

        // 基础应用程序初始化（降级模式）
    async initializeBasicApplication() {
        console.log('启动基础应用程序模式...');

        try {
            this.initializeDOM();
            await this.loadApplicationData();
            console.log('基础应用程序启动成功');
        } catch (error) {
            console.error('基础应用程序启动失败:', error);
        }
    }

    // 初始化DOM结构
    initializeDOM() {
        const template = document.getElementById('GHOST_TEMPLATE');
        if (template) {
            const app = document.getElementById('app');
            app.appendChild(template.content.cloneNode(true));
            template.remove();
        }

        // 设置公司logo
        const logoElement = document.getElementById('company-logo');
        if (logoElement && Utils?.CONSTANTS?.LOGO_URL) {
            logoElement.src = Utils.CONSTANTS.LOGO_URL;
        }
    }

    // 初始化导航系统
    initializeNavigation() {
        if (typeof setupNavigation === 'function') {
            setupNavigation();
        }

        // 顶部导航事件绑定
        this.bindTopNavigation();
    }

    // 绑定顶部导航事件
    bindTopNavigation() {
        const topNavLinks = document.querySelectorAll('.nav-links a');
        const navigationMap = {
            '货运管理': () => {
                if (typeof showOrderManagement === 'function') {
                    showOrderManagement();
                } else {
                    console.warn('showOrderManagement 函数未定义');
                }
            },
            'DIY路线': () => {
                if (typeof showDIYRoute === 'function') {
                    showDIYRoute();
                } else {
                    console.warn('showDIYRoute 函数未定义');
                }
            },
            '线路管理': () => window.location.href = 'route-management.html',
            '客户列表': () => {
                if (typeof showCustomerList === 'function') {
                    showCustomerList();
                } else {
                    console.warn('showCustomerList 函数未定义');
                }
            }
        };

        topNavLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();

                // 更新active状态
                topNavLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                // 执行对应的导航操作
                const text = link.textContent.trim();
                const action = navigationMap[text];
                if (action) {
                    action();
                } else {
                    console.warn(`未找到导航操作: ${text}`);
                }
            });
        });
    }

    // 加载应用数据
    async loadApplicationData() {
        if (typeof loadDataFromLocalStorage === 'function') {
            await loadDataFromLocalStorage();
        }
    }

    // 初始化组件
    initializeComponents() {
        // 初始化运输团队
        if (typeof initTransportTeams === 'function') {
            initTransportTeams();
        }

        // 初始化客户下拉框
        if (typeof updateCustomerDropdown === 'function') {
            updateCustomerDropdown();
        }
    }

    // 获取模块状态
    getStatus() {
        return {
            initialized: this.initialized,
            loadedModules: this.loadOrder.length,
            modules: this.modules
        };
    }
}

// 创建全局模块加载器实例
window.moduleLoader = new ModuleLoader();

// 导出模块加载器
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModuleLoader;
}