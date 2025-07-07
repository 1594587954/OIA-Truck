// API服务层 - 处理所有数据操作
// 支持Firebase云端存储和本地存储的混合模式

class APIService {
    constructor() {
        this.isOnline = navigator.onLine;
        this.useFirebase = typeof FirebaseUtils !== 'undefined' && FirebaseUtils.db;
        
        // 监听网络状态
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.syncOfflineData();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
        
        console.log('API服务初始化:', {
            isOnline: this.isOnline,
            useFirebase: this.useFirebase
        });
    }

    // 获取存储方式
    getStorageMethod() {
        return this.isOnline && this.useFirebase ? 'firebase' : 'localStorage';
    }

    // 订单相关操作
    async getOrders() {
        try {
            if (this.getStorageMethod() === 'firebase') {
                const result = await FirebaseUtils.getDocuments('orders');
                if (result.success) {
                    // 同时更新本地缓存
                    Utils.StorageUtils.setOrders(result.data);
                    return result.data;
                }
            }
            // 降级到本地存储
            return Utils.StorageUtils.getOrders();
        } catch (error) {
            console.error('获取订单失败:', error);
            return Utils.StorageUtils.getOrders();
        }
    }

    async createOrder(orderData) {
        try {
            // 生成本地ID
            const localId = 'order_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            const orderWithId = { ...orderData, localId, status: 'pending' };

            if (this.getStorageMethod() === 'firebase') {
                const result = await FirebaseUtils.addDocument('orders', orderWithId);
                if (result.success) {
                    orderWithId.firebaseId = result.id;
                    // 更新本地缓存
                    const orders = Utils.StorageUtils.getOrders();
                    orders.push(orderWithId);
                    Utils.StorageUtils.setOrders(orders);
                    return { success: true, data: orderWithId };
                }
            }
            
            // 降级到本地存储
            const orders = Utils.StorageUtils.getOrders();
            orders.push(orderWithId);
            Utils.StorageUtils.setOrders(orders);
            
            // 标记为需要同步
            this.markForSync('orders', 'create', orderWithId);
            
            return { success: true, data: orderWithId };
        } catch (error) {
            console.error('创建订单失败:', error);
            return { success: false, error };
        }
    }

    async updateOrder(orderId, updates) {
        try {
            if (this.getStorageMethod() === 'firebase') {
                // 查找Firebase ID
                const orders = Utils.StorageUtils.getOrders();
                const order = orders.find(o => o.localId === orderId || o.firebaseId === orderId);
                
                if (order && order.firebaseId) {
                    const result = await FirebaseUtils.updateDocument('orders', order.firebaseId, updates);
                    if (result.success) {
                        // 更新本地缓存
                        const updatedOrders = orders.map(o => 
                            (o.localId === orderId || o.firebaseId === orderId) 
                                ? { ...o, ...updates } 
                                : o
                        );
                        Utils.StorageUtils.setOrders(updatedOrders);
                        return { success: true };
                    }
                }
            }
            
            // 降级到本地存储
            const orders = Utils.StorageUtils.getOrders();
            const updatedOrders = orders.map(order => 
                order.localId === orderId ? { ...order, ...updates } : order
            );
            Utils.StorageUtils.setOrders(updatedOrders);
            
            // 标记为需要同步
            this.markForSync('orders', 'update', { id: orderId, updates });
            
            return { success: true };
        } catch (error) {
            console.error('更新订单失败:', error);
            return { success: false, error };
        }
    }

    async deleteOrder(orderId) {
        try {
            if (this.getStorageMethod() === 'firebase') {
                const orders = Utils.StorageUtils.getOrders();
                const order = orders.find(o => o.localId === orderId || o.firebaseId === orderId);
                
                if (order && order.firebaseId) {
                    const result = await FirebaseUtils.deleteDocument('orders', order.firebaseId);
                    if (result.success) {
                        // 更新本地缓存
                        const filteredOrders = orders.filter(o => 
                            o.localId !== orderId && o.firebaseId !== orderId
                        );
                        Utils.StorageUtils.setOrders(filteredOrders);
                        return { success: true };
                    }
                }
            }
            
            // 降级到本地存储
            const orders = Utils.StorageUtils.getOrders();
            const filteredOrders = orders.filter(order => order.localId !== orderId);
            Utils.StorageUtils.setOrders(filteredOrders);
            
            // 标记为需要同步
            this.markForSync('orders', 'delete', { id: orderId });
            
            return { success: true };
        } catch (error) {
            console.error('删除订单失败:', error);
            return { success: false, error };
        }
    }

    // 客户相关操作
    async getCustomers() {
        try {
            if (this.getStorageMethod() === 'firebase') {
                const result = await FirebaseUtils.getDocuments('customers');
                if (result.success) {
                    Utils.StorageUtils.set(Utils.CONSTANTS.STORAGE_KEYS.CUSTOMERS, result.data);
                    return result.data;
                }
            }
            return Utils.StorageUtils.get(Utils.CONSTANTS.STORAGE_KEYS.CUSTOMERS, []);
        } catch (error) {
            console.error('获取客户失败:', error);
            return Utils.StorageUtils.get(Utils.CONSTANTS.STORAGE_KEYS.CUSTOMERS, []);
        }
    }

    async createCustomer(customerData) {
        try {
            const localId = 'customer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            const customerWithId = { ...customerData, localId };

            if (this.getStorageMethod() === 'firebase') {
                const result = await FirebaseUtils.addDocument('customers', customerWithId);
                if (result.success) {
                    customerWithId.firebaseId = result.id;
                    const customers = Utils.StorageUtils.get(Utils.CONSTANTS.STORAGE_KEYS.CUSTOMERS, []);
                    customers.push(customerWithId);
                    Utils.StorageUtils.set(Utils.CONSTANTS.STORAGE_KEYS.CUSTOMERS, customers);
                    return { success: true, data: customerWithId };
                }
            }
            
            const customers = Utils.StorageUtils.get(Utils.CONSTANTS.STORAGE_KEYS.CUSTOMERS, []);
            customers.push(customerWithId);
            Utils.StorageUtils.set(Utils.CONSTANTS.STORAGE_KEYS.CUSTOMERS, customers);
            
            this.markForSync('customers', 'create', customerWithId);
            return { success: true, data: customerWithId };
        } catch (error) {
            console.error('创建客户失败:', error);
            return { success: false, error };
        }
    }

    // 离线数据同步
    markForSync(collection, operation, data) {
        if (!this.isOnline) {
            const syncQueue = Utils.StorageUtils.get('syncQueue', []);
            syncQueue.push({
                collection,
                operation,
                data,
                timestamp: Date.now()
            });
            Utils.StorageUtils.set('syncQueue', syncQueue);
        }
    }

    async syncOfflineData() {
        if (!this.useFirebase) return;
        
        const syncQueue = Utils.StorageUtils.get('syncQueue', []);
        if (syncQueue.length === 0) return;
        
        console.log('开始同步离线数据:', syncQueue.length, '项');
        
        for (const item of syncQueue) {
            try {
                switch (item.operation) {
                    case 'create':
                        await FirebaseUtils.addDocument(item.collection, item.data);
                        break;
                    case 'update':
                        await FirebaseUtils.updateDocument(item.collection, item.data.id, item.data.updates);
                        break;
                    case 'delete':
                        await FirebaseUtils.deleteDocument(item.collection, item.data.id);
                        break;
                }
            } catch (error) {
                console.error('同步失败:', item, error);
            }
        }
        
        // 清空同步队列
        Utils.StorageUtils.remove('syncQueue');
        console.log('离线数据同步完成');
    }

    // 实时数据监听
    listenToOrders(callback) {
        if (this.useFirebase) {
            return FirebaseUtils.listenToCollection('orders', (orders, error) => {
                if (orders) {
                    Utils.StorageUtils.setOrders(orders);
                    callback(orders);
                } else {
                    console.error('监听订单失败:', error);
                    callback(Utils.StorageUtils.getOrders());
                }
            });
        } else {
            // 本地模式下定期检查数据变化
            setInterval(() => {
                callback(Utils.StorageUtils.getOrders());
            }, 5000);
        }
    }
}

// 创建全局API实例
window.API = new APIService();

console.log('API服务层加载完成');