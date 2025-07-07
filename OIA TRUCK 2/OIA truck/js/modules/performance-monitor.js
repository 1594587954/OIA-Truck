// 性能监控模块
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            pageLoadStart: performance.now(),
            moduleLoadTimes: {},
            renderTimes: {},
            userInteractions: []
        };
        this.isEnabled = true;
    }

    // 记录模块加载时间
    recordModuleLoad(moduleName, startTime) {
        if (!this.isEnabled) return;
        
        const loadTime = performance.now() - startTime;
        this.metrics.moduleLoadTimes[moduleName] = loadTime;
        console.log(`模块 ${moduleName} 加载耗时: ${loadTime.toFixed(2)}ms`);
    }

    // 记录渲染时间
    recordRenderTime(componentName, startTime) {
        if (!this.isEnabled) return;
        
        const renderTime = performance.now() - startTime;
        this.metrics.renderTimes[componentName] = renderTime;
        console.log(`组件 ${componentName} 渲染耗时: ${renderTime.toFixed(2)}ms`);
    }

    // 记录用户交互响应时间
    recordInteraction(actionName, startTime) {
        if (!this.isEnabled) return;
        
        const responseTime = performance.now() - startTime;
        this.metrics.userInteractions.push({
            action: actionName,
            responseTime: responseTime,
            timestamp: Date.now()
        });
        
        if (responseTime > 100) {
            console.warn(`用户交互 ${actionName} 响应较慢: ${responseTime.toFixed(2)}ms`);
        }
    }

    // 获取页面加载性能报告
    getPerformanceReport() {
        const totalLoadTime = performance.now() - this.metrics.pageLoadStart;
        const navigation = performance.getEntriesByType('navigation')[0];
        
        return {
            总加载时间: `${totalLoadTime.toFixed(2)}ms`,
            DOM加载时间: navigation ? `${(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart).toFixed(2)}ms` : '未知',
            模块加载时间: this.metrics.moduleLoadTimes,
            组件渲染时间: this.metrics.renderTimes,
            平均交互响应时间: this.getAverageInteractionTime(),
            慢交互次数: this.getSlowInteractionCount()
        };
    }

    // 获取平均交互响应时间
    getAverageInteractionTime() {
        if (this.metrics.userInteractions.length === 0) return '0ms';
        
        const total = this.metrics.userInteractions.reduce((sum, interaction) => 
            sum + interaction.responseTime, 0);
        const average = total / this.metrics.userInteractions.length;
        
        return `${average.toFixed(2)}ms`;
    }

    // 获取慢交互次数（>100ms）
    getSlowInteractionCount() {
        return this.metrics.userInteractions.filter(interaction => 
            interaction.responseTime > 100).length;
    }

    // 显示性能报告
    showPerformanceReport() {
        const report = this.getPerformanceReport();
        console.group('📊 页面性能报告');
        Object.entries(report).forEach(([key, value]) => {
            if (typeof value === 'object') {
                console.group(key);
                Object.entries(value).forEach(([subKey, subValue]) => {
                    console.log(`${subKey}: ${subValue}`);
                });
                console.groupEnd();
            } else {
                console.log(`${key}: ${value}`);
            }
        });
        console.groupEnd();
    }

    // 启用/禁用性能监控
    toggle(enabled) {
        this.isEnabled = enabled;
        console.log(`性能监控已${enabled ? '启用' : '禁用'}`);
    }

    // 清除性能数据
    clear() {
        this.metrics = {
            pageLoadStart: performance.now(),
            moduleLoadTimes: {},
            renderTimes: {},
            userInteractions: []
        };
        console.log('性能监控数据已清除');
    }
}

// 创建全局性能监控实例
window.performanceMonitor = new PerformanceMonitor();

// 监听页面完全加载事件
window.addEventListener('load', () => {
    setTimeout(() => {
        window.performanceMonitor.showPerformanceReport();
    }, 1000);
});

// 导出性能监控工具
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceMonitor;
}

// 添加到Utils命名空间
if (typeof Utils !== 'undefined') {
    Utils.PerformanceMonitor = PerformanceMonitor;
}

console.log('🚀 性能监控模块已加载 - 输入 performanceMonitor.showPerformanceReport() 查看性能报告');