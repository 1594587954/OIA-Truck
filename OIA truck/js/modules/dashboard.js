// 仪表盘管理模块
class DashboardManager {
    constructor() {
        this.dataManager = window.dataManager;
        this.statusConfig = {
            pending: { label: '待安排', element: 'pending-count' },
            preparing: { label: '准备派车', element: 'preparing-count' },
            inTransit: { label: '运输中', element: 'in-transit-count' },
            completed: { label: '已完成', element: 'completed-count' }
        };
        // 缓存DOM元素
        this.cachedElements = {};
        this.lastUpdateTime = 0;
        this.updateThrottle = 100; // 100ms节流
    }

    // 获取缓存的DOM元素
    getCachedElement(id) {
        if (!this.cachedElements[id]) {
            this.cachedElements[id] = document.getElementById(id);
        }
        return this.cachedElements[id];
    }

    // 更新运营总览统计数据 - 优化版本
    async updateDashboardStats() {
        // 节流控制
        const now = Date.now();
        if (now - this.lastUpdateTime < this.updateThrottle) {
            return;
        }
        this.lastUpdateTime = now;

        console.log('开始更新仪表盘统计数据...');

        try {
            // 从Utils.StorageUtils获取订单数据，确保数据一致性
            let orders = [];
            if (Utils.StorageUtils) {
                orders = await Utils.StorageUtils.getOrders();
            } else if (this.dataManager) {
                orders = this.dataManager.getOrders();
            }

            // 确保orders是数组
            if (!Array.isArray(orders)) {
                console.warn('获取到的订单数据不是数组类型:', typeof orders);
                orders = [];
            }

            console.log('获取到订单数据:', orders.length, '条');

            const stats = this.calculateOrderStats(orders);
            console.log('统计结果:', stats);

            this.updateDashboardDisplay(stats);

        } catch (error) {
            console.error('更新仪表盘统计失败:', error);
            if (typeof Utils !== 'undefined' && Utils.UIUtils && Utils.UIUtils.showError) {
                Utils.UIUtils.showError('仪表盘数据更新失败');
            }
        }
    }

    // 立即更新（跳过节流）
    async updateStatsImmediate() {
        this.lastUpdateTime = 0;
        await this.updateDashboardStats();
    }

    // 计算订单统计
    calculateOrderStats(orders) {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const stats = {
            pending: 0,
            preparing: 0,
            inTransit: 0,
            completed: 0
        };

        orders.forEach(order => {
            const status = this.getOrderStatus(order, now, tomorrow);
            if (status && stats.hasOwnProperty(status)) {
                stats[status]++;
            }
        });

        return stats;
    }

    // 获取订单状态
    getOrderStatus(order, now, tomorrow) {
        const pickupDateTime = order.pickupDateTime ? new Date(order.pickupDateTime) : null;
        const deliveryDateTime = order.deliveryDateTime ? new Date(order.deliveryDateTime) : null;

        if (pickupDateTime) {
            pickupDateTime.setHours(0, 0, 0, 0);
        }

        if (deliveryDateTime) {
            deliveryDateTime.setHours(0, 0, 0, 0);
        }

        // 已完成：当前时间大于等于送货时间
        if (deliveryDateTime && now.getTime() >= deliveryDateTime.getTime()) {
            return 'completed';
        }
        // 运输中：现在时间等于提货时间但是小于等于送货时间，当天提当天送也算
        else if (pickupDateTime && pickupDateTime.getTime() === now.getTime() &&
                (!deliveryDateTime || now.getTime() <= deliveryDateTime.getTime())) {
            return 'inTransit';
        }
        // 准备派车：提货时间是明天
        else if (pickupDateTime && pickupDateTime.getTime() === tomorrow.getTime()) {
            return 'preparing';
        }
        // 待安排：提货时间大于当前时间
        else if (pickupDateTime && pickupDateTime.getTime() > now.getTime()) {
            return 'pending';
        }

        return null;
    }

    // 更新仪表盘显示 - 优化版本
    updateDashboardDisplay(stats) {
        // 使用requestAnimationFrame优化DOM更新
        requestAnimationFrame(() => {
            Object.keys(this.statusConfig).forEach(status => {
                const config = this.statusConfig[status];
                const element = this.getCachedElement(config.element);
                if (element) {
                    // 显示空数据，保留样式
                    const newValue = 0;
                    // 只在值发生变化时更新
                    if (element.textContent !== newValue.toString()) {
                        element.textContent = newValue;
                    }
                }
            });
        });
    }

    // 显示运营总览订单
    showDashboardOrders(status, cardElement) {
        console.log('显示仪表盘订单，状态:', status);

        try {
            // 隐藏所有其他订单区域
            this.hideAllOrdersSections();

            const ordersSection = document.getElementById(`dashboard-orders-${status}`);
            const ordersTable = document.getElementById(`dashboardOrderTable-${status}`);

            if (!ordersSection || !ordersTable) {
                console.error('未找到订单显示区域或表格元素');
                return;
            }

            // 显示空的订单数据，保留样式
            const filteredOrders = [];

            console.log('显示空订单列表');

            // 渲染空的订单表格
            this.renderOrdersTable(ordersTable, filteredOrders);

            // 显示订单区域
            ordersSection.style.display = 'block';

            // 平滑滚动到订单区域
            setTimeout(() => {
                ordersSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);

        } catch (error) {
            console.error('显示仪表盘订单失败:', error);
            Utils.UIUtils.showError('加载订单数据失败');
        }
    }

    // 隐藏所有订单区域
    hideAllOrdersSections() {
        const allOrdersSections = document.querySelectorAll('.dashboard-orders-section');
        allOrdersSections.forEach(section => {
            section.style.display = 'none';
        });
    }

    // 渲染订单表格
    renderOrdersTable(ordersTable, orders) {
        if (!ordersTable) {
            console.error('订单表格元素不存在');
            return;
        }

        ordersTable.innerHTML = '';

        if (!orders || orders.length === 0) {
            ordersTable.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #999;">暂无相关订单</td></tr>';
            return;
        }

        orders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.id || '未知'}</td>
                <td>${order.customer || '未知'}</td>
                <td class="pickup-group">${order.pickupLocation || '未知'}</td>
                <td class="delivery-group">${order.deliveryLocation || '未知'}</td>
                <td class="time-group">${order.pickupDateTime || '未设置'}</td>
                <td class="time-group">${order.deliveryDateTime || '未设置'}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="editOrder('${order.id}')">
                        <i class="fas fa-edit"></i> 编辑
                    </button>
                    <button class="btn btn-sm btn-success" onclick="reprintDispatchSheet('${order.id}')">
                        <i class="fas fa-print"></i> 重新打印
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteOrder('${order.id}')">
                        <i class="fas fa-trash"></i> 删除
                    </button>
                </td>
            `;
            ordersTable.appendChild(row);
        });
    }

    // 隐藏运营总览订单
    hideDashboardOrders(status) {
        const ordersSection = document.getElementById(`dashboard-orders-${status}`);
        if (ordersSection) {
            ordersSection.style.display = 'none';
        }
    }

    // 根据状态过滤订单
    filterOrdersByStatus(orders, status) {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return orders.filter(order => {
            const orderStatus = this.getOrderStatus(order, now, tomorrow);
            return orderStatus === status;
        });
    }
}

// 创建全局仪表盘管理器实例
const dashboardManager = new DashboardManager();
window.dashboardManager = dashboardManager;

// 向后兼容的函数
async function updateDashboardStats(orders) {
    if (window.dashboardManager) {
        await window.dashboardManager.updateDashboardStats();
    }
}

function updateDashboardDisplay(stats) {
    dashboardManager.updateDashboardDisplay(stats);
}

function showDashboardOrders(status, cardElement) {
    dashboardManager.showDashboardOrders(status, cardElement);
}

function hideDashboardOrders(status) {
    dashboardManager.hideDashboardOrders(status);
}

function filterOrdersByStatus(orders, status) {
    return dashboardManager.filterOrdersByStatus(orders, status);
}

// 确保函数在全局作用域中可用
window.showDashboardOrders = showDashboardOrders;
window.hideDashboardOrders = hideDashboardOrders;
window.updateDashboardStats = updateDashboardStats;
window.updateDashboardDisplay = updateDashboardDisplay;
window.filterOrdersByStatus = filterOrdersByStatus;
