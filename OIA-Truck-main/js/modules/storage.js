// 数据存储相关功能模块

// 存储管理模块 - 简化的数据操作接口

// 数据加载和初始化管理
class StorageManager {
    constructor() {
        this.dataManager = window.dataManager;
    }

    // 从存储加载所有数据
    async loadDataFromLocalStorage() {
        console.log('开始加载本地存储数据...');

        try {
            // 加载并更新客户下拉框
            this.updateCustomerSelect();

            // 加载并更新路线选择
            this.updateRouteSelect();

            // 加载并更新订单表格
            this.updateOrderTable();

            // 更新仪表盘统计
            await this.updateDashboardStats();

            console.log('本地存储数据加载完成');
        } catch (error) {
            console.error('加载本地存储数据失败:', error);
            Utils.UIUtils.showError('数据加载失败，请刷新页面重试');
        }
    }

    // 更新订单表格
    updateOrderTable() {
        const tableBody = document.getElementById('orderTable');
        if (!tableBody) {
            console.log('orderTable元素未找到，可能不在订单管理页面');
            return;
        }

        const orders = this.dataManager ? this.dataManager.getOrders() : [];
        console.log('更新订单表格，订单数量:', orders.length);

        // 清空现有表格内容
        tableBody.innerHTML = '';

        // 添加每个订单到表格
        orders.forEach(order => {
            if (typeof addOrderToTable === 'function') {
                addOrderToTable(order, false); // false表示不重复保存到存储
            }
        });

        console.log('订单表格更新完成');
    }

    // 更新客户下拉列表
    updateCustomerSelect() {
        const customerSelect = document.getElementById('customer');
        if (!customerSelect) {
            console.log('customer下拉框未找到');
            return;
        }

        // 清除除了第一个选项外的所有选项
        while (customerSelect.options.length > 1) {
            customerSelect.remove(1);
        }

        // 获取客户数据
        const customers = this.dataManager ? this.dataManager.getCustomers() : [];
        const customerData = this.dataManager ? this.dataManager.getCustomerData() : {};

        // 优先使用新格式的客户数据
        if (customers.length > 0) {
            customers.forEach(customer => {
                const option = document.createElement('option');
                option.value = customer.id;
                option.textContent = customer.name || customer.pickupFactory || `客户${customer.id}`;
                customerSelect.appendChild(option);
            });
        } else {
            // 降级到旧格式
            Object.entries(customerData).forEach(([customerId, data]) => {
                const option = document.createElement('option');
                option.value = customerId;
                option.textContent = data.name || `客户${customerId}`;
                customerSelect.appendChild(option);
            });
        }

        console.log('客户下拉框更新完成');
    }

    // 更新路线下拉列表
    updateRouteSelect() {
        const routeSelect = document.getElementById('route');
        if (!routeSelect) {
            console.log('route下拉框未找到');
            return;
        }

        // 清除除了第一个选项外的所有选项
        while (routeSelect.options.length > 1) {
            routeSelect.remove(1);
        }

        // 获取路线数据
        const routes = this.dataManager ? this.dataManager.getRoutes() : [];

        // 添加路线到下拉列表
        routes.forEach(route => {
            const option = document.createElement('option');
            option.value = route.id;
            option.textContent = route.name || `路线 ${route.id}`;
            routeSelect.appendChild(option);
        });

        console.log('路线下拉框更新完成');
    }

    // 更新仪表盘统计
    async updateDashboardStats() {
        if (typeof updateDashboardStats === 'function') {
            await updateDashboardStats();
        }
    }

        // 保存订单到存储
    async saveOrderToLocalStorage(orderData) {
        console.log('保存订单数据:', orderData);

        if (this.dataManager) {
            // 使用addOrder方法来添加单个订单，而不是setOrders
            this.dataManager.addOrder(orderData);
            console.log('订单已成功保存到本地存储');

            // 更新订单管理表格显示
            this.updateOrderTable();

            // 更新仪表盘统计
            if (window.dashboardManager) {
                await window.dashboardManager.updateDashboardStats();
            }
        } else {
            console.error('DataManager未初始化');
        }
    }
}

// 创建全局存储管理器实例
const storageManager = new StorageManager();

// 向后兼容的函数
async function loadDataFromLocalStorage() {
    await storageManager.loadDataFromLocalStorage();
}

function updateOrderTable(orders) {
    storageManager.updateOrderTable();
}

function updateCustomerSelect(customerData) {
    storageManager.updateCustomerSelect();
}

function updateRouteSelect() {
    storageManager.updateRouteSelect();
}

async function saveOrderToLocalStorage(orderData) {
    try {
        console.log('保存订单到本地存储:', orderData);
        
        // 确保 dispatchOrders 存在并且是数组
        if (!localStorage.getItem('dispatchOrders')) {
            localStorage.setItem('dispatchOrders', JSON.stringify([]));
        }
        
        await storageManager.saveOrderToLocalStorage(orderData);
        console.log('订单已保存到本地存储');
        
        // 更新订单管理表格
        updateOrderTable();
        
        // 更新仪表盘统计
        if (window.dashboardManager) {
            await window.dashboardManager.updateDashboardStats();
        }
        
        return true;
    } catch (error) {
        console.error('保存订单到本地存储失败:', error);
        return false;
    }
}
