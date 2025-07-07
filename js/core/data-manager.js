// 数据管理器 - 统一管理数据存储、加载和同步
class DataManager {
    constructor() {
        this.storageKeys = {
            DISPATCH_ORDERS: 'dispatchOrders',
            CUSTOMER_DATA: 'customerData', 
            CUSTOMERS: 'customers',
            DIY_ROUTES: 'diyRoutes',
            TRANSPORT_TEAMS: 'transportTeams'
        };
        this.cache = new Map();
        this.listeners = new Map();
    }

    // 通用存储操作
    get(key, defaultValue = null) {
        try {
            // 先检查缓存
            if (this.cache.has(key)) {
                return this.cache.get(key);
            }

            // 从localStorage获取
            const data = localStorage.getItem(key);
            const result = data ? JSON.parse(data) : defaultValue;
            
            // 更新缓存
            this.cache.set(key, result);
            return result;
        } catch (error) {
            console.error(`获取数据失败 (${key}):`, error);
            return defaultValue;
        }
    }

    set(key, value) {
        try {
            // 更新localStorage
            localStorage.setItem(key, JSON.stringify(value));
            
            // 更新缓存
            this.cache.set(key, value);
            
            // 触发监听器
            this.notifyListeners(key, value);
            
            return true;
        } catch (error) {
            console.error(`保存数据失败 (${key}):`, error);
            return false;
        }
    }

    remove(key) {
        try {
            localStorage.removeItem(key);
            this.cache.delete(key);
            this.notifyListeners(key, null);
            return true;
        } catch (error) {
            console.error(`删除数据失败 (${key}):`, error);
            return false;
        }
    }

    // 订单相关操作
    getOrders() {
        const orders = this.get(this.storageKeys.DISPATCH_ORDERS, []);
        return Array.isArray(orders) ? orders : [];
    }

    setOrders(orders) {
        const orderArray = Array.isArray(orders) ? orders : [];
        return this.set(this.storageKeys.DISPATCH_ORDERS, orderArray);
    }

    addOrder(order) {
        const orders = this.getOrders();
        const existingIndex = orders.findIndex(o => o.id === order.id);
        
        if (existingIndex >= 0) {
            orders[existingIndex] = order;
        } else {
            orders.unshift(order);
        }
        
        return this.setOrders(orders);
    }

    removeOrder(orderId) {
        const orders = this.getOrders();
        const filteredOrders = orders.filter(o => o.id !== orderId);
        return this.setOrders(filteredOrders);
    }

    // 删除订单（别名方法）
    deleteOrder(orderId) {
        return this.removeOrder(orderId);
    }

    // 根据ID获取订单
    getOrderById(orderId) {
        const orders = this.getOrders();
        return orders.find(order => order.id === orderId) || null;
    }

    // 客户相关操作
    getCustomers() {
        // 优先获取新格式的客户数据
        let customers = this.get(this.storageKeys.CUSTOMERS, []);
        
        if (!Array.isArray(customers) || customers.length === 0) {
            // 降级到旧格式
            const customerData = this.get(this.storageKeys.CUSTOMER_DATA, {});
            customers = Object.entries(customerData).map(([id, data]) => ({
                id,
                name: data.name || data.pickupFactory || `客户${id}`,
                contact: data.contact || data.pickupContact || '',
                phone: data.phone || this.extractPhone(data.pickupContact) || '',
                address: data.address || data.pickupAddress || '',
                addTime: data.addTime || data.createdAt || new Date().toISOString(),
                ...data
            }));
        }
        
        return customers;
    }

    // 从联系人信息中提取电话号码
    extractPhone(contactInfo) {
        if (!contactInfo) return '';
        const phoneMatch = contactInfo.match(/\((\d+)\)/);
        return phoneMatch ? phoneMatch[1] : '';
    }

    setCustomers(customers) {
        const customerArray = Array.isArray(customers) ? customers : [];
        return this.set(this.storageKeys.CUSTOMERS, customerArray);
    }

    getCustomerData() {
        return this.get(this.storageKeys.CUSTOMER_DATA, {});
    }

    setCustomerData(customerData) {
        return this.set(this.storageKeys.CUSTOMER_DATA, customerData || {});
    }

    // 路线相关操作
    getRoutes() {
        return this.get(this.storageKeys.DIY_ROUTES, []);
    }

    setRoutes(routes) {
        const routeArray = Array.isArray(routes) ? routes : [];
        return this.set(this.storageKeys.DIY_ROUTES, routeArray);
    }

    // 运输团队相关操作
    getTransportTeams() {
        return this.get(this.storageKeys.TRANSPORT_TEAMS, []);
    }

    setTransportTeams(teams) {
        const teamArray = Array.isArray(teams) ? teams : [];
        return this.set(this.storageKeys.TRANSPORT_TEAMS, teamArray);
    }

    // 数据监听器
    addListener(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key).add(callback);
    }

    removeListener(key, callback) {
        if (this.listeners.has(key)) {
            this.listeners.get(key).delete(callback);
        }
    }

    notifyListeners(key, value) {
        if (this.listeners.has(key)) {
            this.listeners.get(key).forEach(callback => {
                try {
                    callback(value, key);
                } catch (error) {
                    console.error('监听器执行失败:', error);
                }
            });
        }
    }

    // 初始化默认数据
    initializeDefaultData() {
        console.log('初始化默认数据...');
        
        // 初始化客户数据（如果不存在）
        if (!this.get(this.storageKeys.CUSTOMER_DATA)) {
            const defaultCustomerData = {
                customer1: {
                    name: "东莞电子产品有限公司",
                    contact: "王经理",
                    phone: "13800138000",
                    address: "广东省东莞市东城区科技路88号",
                    addTime: new Date().toISOString(),
                    // 保留原有字段以兼容
                    pickupFactory: "东莞电子产品有限公司",
                    pickupAddress: "广东省东莞市东城区科技路88号",
                    pickupContact: "王经理 (13800138000)",
                    deliveryFactory: "深圳华南物流中心",
                    deliveryAddress: "深圳市宝安区物流园大道16号",
                    deliveryContact: "张主任 (13510101010)"
                },
                customer2: {
                    name: "深圳科技集团",
                    contact: "张总监",
                    phone: "13500135000",
                    address: "深圳市南山区科技园南区6栋",
                    addTime: new Date().toISOString(),
                    // 保留原有字段以兼容
                    pickupFactory: "深圳科技集团",
                    pickupAddress: "深圳市南山区科技园南区6栋",
                    pickupContact: "张总监 (13500135000)",
                    deliveryFactory: "广州高新科技园",
                    deliveryAddress: "广州市天河区科韵路18号",
                    deliveryContact: "李主管 (13600136000)"
                },
                customer3: {
                    name: "广州机械设备厂",
                    contact: "李厂长",
                    phone: "13900139000",
                    address: "广州市黄埔区工业路168号",
                    addTime: new Date().toISOString(),
                    // 保留原有字段以兼容
                    pickupFactory: "广州机械设备厂",
                    pickupAddress: "广州市黄埔区工业路168号",
                    pickupContact: "李厂长 (13900139000)",
                    deliveryFactory: "佛山机械分销中心",
                    deliveryAddress: "佛山市南海区工业大道88号",
                    deliveryContact: "陈主任 (13700137000)"
                },
                customer4: {
                    name: "佛山电器制造",
                    contact: "陈主管",
                    phone: "13700137000",
                    address: "佛山市顺德区工业大道28号",
                    addTime: new Date().toISOString(),
                    // 保留原有字段以兼容
                    pickupFactory: "佛山电器制造",
                    pickupAddress: "佛山市顺德区工业大道28号",
                    pickupContact: "陈主管 (13700137000)",
                    deliveryFactory: "中山电器物流中心",
                    deliveryAddress: "中山市石岐区光明路128号",
                    deliveryContact: "刘经理 (13600136000)"
                },
                customer5: {
                    name: "中山包装材料厂",
                    contact: "刘主任",
                    phone: "13600136000",
                    address: "中山市火炬开发区兴中路15号",
                    addTime: new Date().toISOString(),
                    // 保留原有字段以兼容
                    pickupFactory: "中山包装材料厂",
                    pickupAddress: "中山市火炬开发区兴中路15号",
                    pickupContact: "刘主任 (13600136000)",
                    deliveryFactory: "东莞包装材料分拣中心",
                    deliveryAddress: "东莞市南城区物流大道28号",
                    deliveryContact: "赵经理 (13400134000)"
                }
            };
            this.setCustomerData(defaultCustomerData);
        }

        // 初始化其他默认数据
        if (!this.get(this.storageKeys.DISPATCH_ORDERS)) {
            // 创建示例订单数据
            const sampleOrders = [
                {
                    id: 'ORDER-' + Date.now() + '-001',
                    customerName: '广州制造有限公司',
                    pickupLocation: '广州市天河区工业大道123号',
                    deliveryLocation: '深圳市南山区科技园456号',
                    pickupTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 明天
                    deliveryTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 后天
                    status: 'pending',
                    priority: 'high',
                    cargoType: '电子产品',
                    weight: '2.5吨',
                    volume: '15立方米',
                    createTime: new Date().toISOString(),
                    updateTime: new Date().toISOString(),
                    notes: '易碎物品，请小心搬运'
                },
                {
                    id: 'ORDER-' + Date.now() + '-002',
                    customerName: '东莞纺织集团',
                    pickupLocation: '东莞市长安镇工业区88号',
                    deliveryLocation: '佛山市南海区物流园区99号',
                    pickupTime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // 12小时后
                    deliveryTime: new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString(), // 36小时后
                    status: 'preparing',
                    priority: 'medium',
                    cargoType: '纺织品',
                    weight: '3.8吨',
                    volume: '25立方米',
                    createTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2小时前创建
                    updateTime: new Date().toISOString(),
                    notes: '防潮包装'
                },
                {
                    id: 'ORDER-' + Date.now() + '-003',
                    customerName: '中山机械制造',
                    pickupLocation: '中山市火炬开发区创新路66号',
                    deliveryLocation: '珠海市香洲区港湾大道188号',
                    pickupTime: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6小时前
                    deliveryTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6小时后
                    status: 'in-transit',
                    priority: 'high',
                    cargoType: '机械设备',
                    weight: '5.2吨',
                    volume: '12立方米',
                    createTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 昨天创建
                    updateTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30分钟前更新
                    notes: '重型货物，需要专用车辆'
                },
                {
                    id: 'ORDER-' + Date.now() + '-004',
                    customerName: '惠州电子科技',
                    pickupLocation: '惠州市惠城区科技大道77号',
                    deliveryLocation: '广州市番禺区工业园区55号',
                    pickupTime: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2天前
                    deliveryTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 昨天
                    status: 'completed',
                    priority: 'medium',
                    cargoType: '电子元件',
                    weight: '1.8吨',
                    volume: '8立方米',
                    createTime: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), // 3天前创建
                    updateTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 昨天更新
                    notes: '已成功交付'
                }
            ];
            this.setOrders(sampleOrders);
            console.log('已创建示例订单数据');
        }

        if (!this.get(this.storageKeys.DIY_ROUTES)) {
            this.setRoutes([]);
        }

        if (!this.get(this.storageKeys.TRANSPORT_TEAMS)) {
            this.setTransportTeams([]);
        }

        console.log('默认数据初始化完成');
    }

    // 删除客户
    deleteCustomer(customerId) {
        try {
            // 获取当前客户数据
            const customers = this.getCustomers();
            
            // 过滤掉要删除的客户
            const updatedCustomers = customers.filter(customer => customer.id !== customerId);
            
            // 保存更新后的客户数据
            this.setCustomers(updatedCustomers);
            
            console.log(`客户 ${customerId} 已删除`);
            return true;
        } catch (error) {
            console.error('删除客户时出错:', error);
            return false;
        }
    }

    // 设置客户数据
    setCustomers(customers) {
        try {
            // 将数组格式转换为对象格式以兼容旧系统
            const customerData = {};
            customers.forEach(customer => {
                customerData[customer.id] = customer;
            });
            
            // 保存到新格式
            this.set(this.storageKeys.CUSTOMERS, customers);
            
            // 同时保存到旧格式以确保兼容性
            localStorage.setItem('customerData', JSON.stringify(customerData));
            
            // 清除缓存
            this.cache.delete(this.storageKeys.CUSTOMERS);
            
            return true;
        } catch (error) {
            console.error('保存客户数据时出错:', error);
            return false;
        }
    }

    // 添加或更新客户
    saveCustomer(customer) {
        try {
            const customers = this.getCustomers();
            const existingIndex = customers.findIndex(c => c.id === customer.id);
            
            if (existingIndex >= 0) {
                // 更新现有客户
                customers[existingIndex] = { ...customers[existingIndex], ...customer };
            } else {
                // 添加新客户
                customers.push(customer);
            }
            
            return this.setCustomers(customers);
        } catch (error) {
            console.error('保存客户时出错:', error);
            return false;
        }
    }

    // 清除所有缓存
    clearCache() {
        this.cache.clear();
    }

    // 获取存储统计信息
    getStorageStats() {
        const stats = {};
        Object.values(this.storageKeys).forEach(key => {
            const data = this.get(key);
            stats[key] = {
                exists: data !== null,
                type: Array.isArray(data) ? 'array' : typeof data,
                length: Array.isArray(data) ? data.length : Object.keys(data || {}).length
            };
        });
        return stats;
    }
}

// 创建全局数据管理器实例
window.dataManager = new DataManager();

// 导出数据管理器
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataManager;
}