// 订单管理模块
class OrderManager {
    constructor() {
        this.dataManager = window.dataManager;
        this.tableBody = null;
        this.initializeElements();
        this.bindEvents();
    }

    // 初始化DOM元素
    initializeElements() {
        this.tableBody = document.getElementById('orderTable');
        this.selectAllCheckbox = document.getElementById('selectAllOrders');
        this.batchDeleteBtn = document.getElementById('batchDeleteOrdersBtn');
        this.batchPrintBtn = document.getElementById('batchPrintOrdersBtn');
        this.exportBtn = document.getElementById('exportOrdersBtn');
        this.exportMonthlyBtn = document.getElementById('exportMonthlyOrdersBtn');

        if (!this.tableBody) {
            console.log('未找到orderTable tbody元素，可能不在订单管理页面');
        }
    }

    // 绑定事件处理程序
    bindEvents() {
        // 确保在订单管理页面或者等待DOM元素加载完成
        const orderManagementSection = document.getElementById('order-management');
        if (!orderManagementSection) {
            console.log('未找到订单管理页面，跳过事件绑定');
            return;
        }

        console.log('绑定订单管理事件处理程序');

        // 获取DOM元素 - 使用更可靠的方式
        this.selectAllCheckbox = document.getElementById('selectAllOrders');
        this.toggleSelectAllBtn = document.getElementById('toggleSelectAllOrdersBtn');
        this.batchDeleteBtn = document.getElementById('batchDeleteOrdersBtn');
        this.batchPrintBtn = document.getElementById('batchPrintOrdersBtn');
        this.exportBtn = document.getElementById('exportOrdersBtn');
        this.exportMonthlyBtn = document.getElementById('exportMonthlyOrdersBtn');

        console.log('DOM元素引用状态:', {
            selectAllCheckbox: !!this.selectAllCheckbox,
            toggleSelectAllBtn: !!this.toggleSelectAllBtn,
            batchDeleteBtn: !!this.batchDeleteBtn,
            batchPrintBtn: !!this.batchPrintBtn,
            exportBtn: !!this.exportBtn,
            exportMonthlyBtn: !!this.exportMonthlyBtn
        });

        // 移除可能存在的旧事件监听器
        this.removeEventListeners();

        // 绑定全选复选框事件
        if (this.selectAllCheckbox) {
            this.selectAllCheckbox.addEventListener('change', this.handleSelectAllChange.bind(this));
            console.log('已绑定全选复选框事件');
        } else {
            console.warn('未找到全选复选框元素 #selectAllOrders');
        }

        // 绑定全选/取消按钮事件
        if (this.toggleSelectAllBtn) {
            this.toggleSelectAllBtn.addEventListener('click', this.handleToggleSelectAll.bind(this));
            console.log('已绑定全选/取消按钮事件');
        } else {
            console.warn('未找到全选/取消按钮 #toggleSelectAllOrdersBtn');
        }

        // 绑定批量删除按钮事件
        if (this.batchDeleteBtn) {
            this.batchDeleteBtn.addEventListener('click', this.handleBatchDelete.bind(this));
            console.log('已绑定批量删除按钮事件');
        } else {
            console.warn('未找到批量删除按钮 #batchDeleteOrdersBtn');
        }

        // 绑定批量打印按钮事件
        if (this.batchPrintBtn) {
            this.batchPrintBtn.addEventListener('click', this.handleBatchPrint.bind(this));
            console.log('已绑定批量打印按钮事件');
        } else {
            console.warn('未找到批量打印按钮 #batchPrintOrdersBtn');
        }

        // 绑定导出选中按钮事件
        if (this.exportBtn) {
            this.exportBtn.addEventListener('click', this.handleExport.bind(this));
            console.log('已绑定导出选中按钮事件');
        } else {
            console.warn('未找到导出选中按钮 #exportOrdersBtn');
        }

        // 绑定导出本月订单按钮事件
        if (this.exportMonthlyBtn) {
            this.exportMonthlyBtn.addEventListener('click', this.handleExportMonthly.bind(this));
            console.log('已绑定导出本月订单按钮事件');
        } else {
            console.warn('未找到导出本月订单按钮 #exportMonthlyOrdersBtn');
        }
    }

    // 移除事件监听器
    removeEventListeners() {
        // 这里我们不能直接移除匿名函数，但可以通过克隆元素来移除所有事件
        if (this.selectAllCheckbox) {
            const newCheckbox = this.selectAllCheckbox.cloneNode(true);
            this.selectAllCheckbox.parentNode.replaceChild(newCheckbox, this.selectAllCheckbox);
            this.selectAllCheckbox = newCheckbox;
        }

        if (this.toggleSelectAllBtn) {
            const newBtn = this.toggleSelectAllBtn.cloneNode(true);
            this.toggleSelectAllBtn.parentNode.replaceChild(newBtn, this.toggleSelectAllBtn);
            this.toggleSelectAllBtn = newBtn;
        }

        if (this.batchDeleteBtn) {
            const newBtn = this.batchDeleteBtn.cloneNode(true);
            this.batchDeleteBtn.parentNode.replaceChild(newBtn, this.batchDeleteBtn);
            this.batchDeleteBtn = newBtn;
        }

        if (this.batchPrintBtn) {
            const newBtn = this.batchPrintBtn.cloneNode(true);
            this.batchPrintBtn.parentNode.replaceChild(newBtn, this.batchPrintBtn);
            this.batchPrintBtn = newBtn;
        }

        if (this.exportBtn) {
            const newBtn = this.exportBtn.cloneNode(true);
            this.exportBtn.parentNode.replaceChild(newBtn, this.exportBtn);
            this.exportBtn = newBtn;
        }

        if (this.exportMonthlyBtn) {
            const newBtn = this.exportMonthlyBtn.cloneNode(true);
            this.exportMonthlyBtn.parentNode.replaceChild(newBtn, this.exportMonthlyBtn);
            this.exportMonthlyBtn = newBtn;
        }
    }

    // 事件处理函数
    handleSelectAllChange() {
        console.log('全选复选框状态改变');
        this.toggleSelectAll('order');
    }

    handleToggleSelectAll() {
        console.log('点击全选/取消按钮');
        if (this.selectAllCheckbox) {
            this.selectAllCheckbox.checked = !this.selectAllCheckbox.checked;
            this.toggleSelectAll('order');
        }
    }

    handleBatchDelete() {
        console.log('点击批量删除按钮');
        this.batchDeleteOrders();
    }

    handleBatchPrint() {
        console.log('点击批量打印按钮');
        this.batchPrintOrders();
    }

    handleExport() {
        console.log('点击导出选中按钮');
        this.exportSelectedOrders();
    }

    handleExportMonthly() {
        console.log('点击导出本月订单按钮');
        this.exportMonthlyOrders();
    }

    // 确保表格元素可用
    ensureTableElement() {
        if (!this.tableBody) {
            this.tableBody = document.getElementById('orderTable');
        }
        return this.tableBody !== null;
    }

    // 添加订单到表格
    addOrderToTable(orderData, saveToStorage = true) {
        console.log('添加订单到表格:', orderData.id);

        // 确保表格元素可用
        if (!this.ensureTableElement()) {
            console.log('orderTable元素未找到，可能不在订单管理页面');
            return;
        }

        try {
            // 创建新行
            const row = this.createOrderRow(orderData);

            // 添加到表格
            this.tableBody.appendChild(row);

            // 如果需要保存到存储
            if (saveToStorage && this.dataManager) {
                this.dataManager.addOrder(orderData);
            }

            console.log('订单行已添加到表格');

        } catch (error) {
            console.error('添加订单到表格失败:', error);
            Utils.UIUtils.showError('添加订单失败');
        }
    }

    // 获取订单号显示格式
    getOrderNumber(orderData) {
        const po = orderData.cw1no || '';
        const shipment = orderData.po || '';

        if (po && shipment) {
            return `${po}/${shipment}`;
        } else if (po) {
            return po;
        } else if (shipment) {
            return shipment;
        } else {
            return orderData.id || '未知';
        }
    }

    // 创建订单行
    createOrderRow(orderData) {
        const row = document.createElement('tr');
        row.dataset.orderId = orderData.id;

        row.innerHTML = `
            <td>
                <input type="checkbox" class="order-checkbox" value="${orderData.id}">
            </td>
            <td>${this.getOrderNumber(orderData)}</td>
            <td>${orderData.routeName || orderData.route || '未选择路线'}</td>
            <td class="pickup-group">${orderData.pickupLocation}</td>
            <td class="delivery-group">${orderData.deliveryLocation}</td>
            <td class="time-group">${orderData.pickupDateTime || '未设置'}</td>
            <td class="time-group">${orderData.deliveryDateTime || '未设置'}</td>
            <td>
                <button class="btn btn-sm btn-info edit-order-btn" data-id="${orderData.id}"><i class="fas fa-edit"></i> 编辑</button>
                <button class="btn btn-sm btn-success reprint-btn" data-id="${orderData.id}"><i class="fas fa-print"></i> 重新打印</button>
                <button class="btn btn-sm btn-danger delete-order-btn" data-id="${orderData.id}"><i class="fas fa-trash"></i> 删除</button>
            </td>
        `;

        // 绑定复选框事件
        const checkbox = row.querySelector('.order-checkbox');
        if (checkbox) {
            checkbox.addEventListener('change', () => {
                this.updateBatchButtons('order');
            });
        }

        // 绑定按钮事件
        const editBtn = row.querySelector('.edit-order-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                if (typeof editOrder === 'function') {
                    editOrder(orderData.id);
                }
            });
        }

        const reprintBtn = row.querySelector('.reprint-btn');
        if (reprintBtn) {
            reprintBtn.addEventListener('click', () => {
                if (typeof reprintDispatchSheet === 'function') {
                    reprintDispatchSheet(orderData.id);
                }
            });
        }

        const deleteBtn = row.querySelector('.delete-order-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                if (typeof deleteOrder === 'function') {
                    deleteOrder(orderData.id);
                }
            });
        }

        return row;
    }

    // 加载订单表格
    async loadOrdersTable() {
        console.log('加载订单表格');

        // 确保表格元素可用
        if (!this.ensureTableElement()) {
            console.warn('订单表格元素不可用，无法加载数据');
            return;
        }

        try {
            // 清空表格
            this.tableBody.innerHTML = '';

            // 获取订单数据
            let orders = [];
            if (this.dataManager) {
                orders = this.dataManager.getOrders() || [];
            } else {
                // 如果没有数据管理器，尝试直接从localStorage获取
                const storedOrders = localStorage.getItem('dispatchOrders');
                if (storedOrders) {
                    orders = JSON.parse(storedOrders);
                }
            }

            console.log(`加载了 ${orders.length} 个订单`);

            // 添加订单到表格
            if (orders.length > 0) {
                orders.forEach(order => {
                    this.addOrderToTable(order, false);
                });
            } else {
                // 如果没有订单，显示空消息
                const emptyRow = document.createElement('tr');
                emptyRow.innerHTML = `<td colspan="8" class="empty-message">暂无订单数据</td>`;
                this.tableBody.appendChild(emptyRow);
            }

            // 重新绑定事件
            this.bindEvents();

            return orders;

        } catch (error) {
            console.error('加载订单表格失败:', error);
            Utils.UIUtils.showError('加载订单数据失败');
            return [];
        }
    }

    // 批量操作相关方法
    toggleSelectAll(type) {
        const checkboxes = document.querySelectorAll(`.${type}-checkbox`);
        const selectAllCheckbox = document.getElementById(`selectAll${type.charAt(0).toUpperCase() + type.slice(1)}s`);

        if (selectAllCheckbox && checkboxes.length > 0) {
            const isChecked = selectAllCheckbox.checked;
            console.log(`全选/取消全选 ${type} 复选框，状态:`, isChecked);

            checkboxes.forEach(checkbox => {
                checkbox.checked = isChecked;
            });

            this.updateBatchButtons(type);
        } else {
            console.warn(`未找到全选复选框或${type}复选框`);
        }
    }

    updateBatchButtons(type) {
        const checkboxes = document.querySelectorAll(`.${type}-checkbox:checked`);
        console.log(`更新批量操作按钮，选中的${type}数量:`, checkboxes.length);

        // 获取批量操作按钮
        const batchDeleteBtn = document.getElementById(`batchDelete${type.charAt(0).toUpperCase() + type.slice(1)}sBtn`);
        const batchPrintBtn = document.getElementById(`batchPrint${type.charAt(0).toUpperCase() + type.slice(1)}sBtn`);
        const exportBtn = document.getElementById(`export${type.charAt(0).toUpperCase() + type.slice(1)}sBtn`);

        // 更新按钮状态
        if (batchDeleteBtn) batchDeleteBtn.disabled = checkboxes.length === 0;
        if (batchPrintBtn) batchPrintBtn.disabled = checkboxes.length === 0;
        if (exportBtn) exportBtn.disabled = checkboxes.length === 0;
    }

    async batchDeleteOrders() {
        const selectedCheckboxes = document.querySelectorAll('.order-checkbox:checked');

        if (selectedCheckboxes.length === 0) {
            Utils.UIUtils.showWarning('请选择要删除的订单');
            return;
        }

        if (!confirm(`确定要删除选中的 ${selectedCheckboxes.length} 个订单吗？`)) {
            return;
        }

        try {
            // 获取选中的订单ID
            const selectedIds = Array.from(selectedCheckboxes).map(cb => cb.value);

            // 从数据管理器中删除
            if (this.dataManager) {
                selectedIds.forEach(id => this.dataManager.deleteOrder(id));
            }

            // 从表格中删除行
            selectedCheckboxes.forEach(checkbox => {
                const row = checkbox.closest('tr');
                if (row) {
                    row.remove();
                }
            });

            // 更新仪表板统计
            if (window.dashboardManager) {
                await window.dashboardManager.updateDashboardStats();
            }

            // 更新批量操作按钮状态
            this.updateBatchButtons('order');

            Utils.UIUtils.showSuccess(`成功删除 ${selectedIds.length} 个订单`);

        } catch (error) {
            console.error('批量删除订单失败:', error);
            Utils.UIUtils.showError('删除订单失败');
        }
    }

    batchPrintOrders() {
        const selectedCheckboxes = document.querySelectorAll('.order-checkbox:checked');

        if (selectedCheckboxes.length === 0) {
            Utils.UIUtils.showWarning('请选择要打印的订单');
            return;
        }

        const selectedIds = Array.from(selectedCheckboxes).map(cb => cb.value);

        // 逐个打印订单，每个之间有延迟
        selectedIds.forEach((orderId, index) => {
            setTimeout(() => {
                this.reprintDispatchSheet(orderId);
            }, index * 1000); // 每个订单间隔1秒
        });

        Utils.UIUtils.showInfo(`开始批量打印 ${selectedIds.length} 个订单`);
    }

    exportSelectedOrders() {
        const selectedCheckboxes = document.querySelectorAll('.order-checkbox:checked');

        if (selectedCheckboxes.length === 0) {
            Utils.UIUtils.showWarning('请选择要导出的订单');
            return;
        }

        try {
            const selectedIds = Array.from(selectedCheckboxes).map(cb => cb.value);
            let selectedOrders = [];

            if (this.dataManager) {
                selectedOrders = selectedIds.map(id => this.dataManager.getOrderById(id)).filter(order => order);
            }

            if (selectedOrders.length === 0) {
                Utils.UIUtils.showError('未找到选中的订单数据');
                return;
            }

            // 使用自定义导出格式
            this.exportCustomFormat(selectedOrders);

        } catch (error) {
            console.error('导出订单失败:', error);
            Utils.UIUtils.showError('导出订单失败');
        }
    }

    // 自定义格式导出：车队、车型、shipment、po、提货名称、送货名称、提送货日期
    exportCustomFormat(orders, isMonthly = false) {
        try {
            // 定义导出的列标题
            const headers = ['车队', '车型', 'Shipment', 'PO', '提货名称', '送货名称', '提货日期', '送货日期'];
            
            // 转换数据格式
            const exportData = orders.map(order => {
                return {
                    '车队': order.transportTeam || order.customer || '',
                    '车型': order.vehicleType || '',
                    'Shipment': order.po || '',
                    'PO': order.cw1no || order.id || '',
                    '提货名称': order.pickupLocation || order.pickupFactory || '',
                    '送货名称': order.deliveryLocation || order.deliveryFactory || '',
                    '提货日期': order.pickupDateTime || '',
                    '送货日期': order.deliveryDateTime || ''
                };
            });

            // 生成文件名
            let filename;
            if (isMonthly) {
                const now = new Date();
                const year = now.getFullYear();
                const month = (now.getMonth() + 1).toString().padStart(2, '0');
                filename = `本月订单导出_${year}年${month}月.csv`;
            } else {
                const currentDate = new Date().toISOString().split('T')[0];
                filename = `订单导出_${currentDate}.csv`;
            }

            // 导出CSV
            if (typeof Utils !== 'undefined' && Utils.ExportUtils) {
                Utils.ExportUtils.exportToCSV(exportData, filename, headers);
                const exportType = isMonthly ? '本月' : '选中';
                Utils.UIUtils.showSuccess(`成功导出${exportType} ${orders.length} 个订单`);
            } else {
                Utils.UIUtils.showError('导出功能暂不可用');
            }

        } catch (error) {
            console.error('自定义格式导出失败:', error);
            Utils.UIUtils.showError('导出失败');
        }
    }

    // 导出本月订单
    async exportMonthlyOrders() {
        try {
            // 获取所有订单数据
            const allOrders = await Utils.StorageUtils.getOrders();
            
            if (!allOrders || !Array.isArray(allOrders) || allOrders.length === 0) {
                Utils.UIUtils.showWarning('暂无订单数据可导出');
                return;
            }

            // 获取当前月份的开始和结束日期
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth();
            const monthStart = new Date(currentYear, currentMonth, 1);
            const monthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

            console.log('筛选本月订单:', {
                monthStart: monthStart.toISOString(),
                monthEnd: monthEnd.toISOString(),
                totalOrders: allOrders.length
            });

            // 筛选本月的订单
            const monthlyOrders = allOrders.filter(order => {
                // 优先使用创建时间，其次使用更新时间
                const orderDate = new Date(order.createTime || order.updateTime || 0);
                return orderDate >= monthStart && orderDate <= monthEnd;
            });

            console.log('本月订单数量:', monthlyOrders.length);

            if (monthlyOrders.length === 0) {
                Utils.UIUtils.showWarning('本月暂无订单数据');
                return;
            }

            // 使用自定义格式导出
            this.exportCustomFormat(monthlyOrders, true);

        } catch (error) {
            console.error('导出本月订单失败:', error);
            Utils.UIUtils.showError('导出本月订单失败');
        }
    }

    // 删除订单
    async deleteOrder(orderId) {
        if (!confirm('确定要删除这个订单吗？')) {
            return;
        }

        try {
            // 从数据管理器删除
            if (this.dataManager) {
                this.dataManager.deleteOrder(orderId);
            }

            // 重新加载订单表格
            await this.loadOrdersTable();

            // 更新仪表板统计
            if (window.dashboardManager) {
                await window.dashboardManager.updateDashboardStats();
            }

            Utils.UIUtils.showSuccess('订单删除成功');

        } catch (error) {
            console.error('删除订单失败:', error);
            Utils.UIUtils.showError('删除订单失败');
        }
    }

    // 编辑订单
    editOrder(orderId) {
        console.log('编辑订单:', orderId);

        try {
            let orderData = null;

            // 优先从数据管理器获取数据
            if (this.dataManager) {
                orderData = this.dataManager.getOrderById(orderId);
            }

            // 如果数据管理器中没有，从表格行中获取
            if (!orderData) {
                const row = document.querySelector(`tr[data-order-id="${orderId}"]`);
                if (!row) {
                    Utils.UIUtils.showError('未找到订单数据');
                    return;
                }

                // 从行中提取数据
                const cells = row.querySelectorAll('td');
                orderData = {
                    id: orderId,
                    customer: cells[2].textContent,
                    pickupLocation: cells[3].textContent,
                    deliveryLocation: cells[4].textContent,
                    pickupDateTime: cells[5].textContent === '未设置' ? '' : cells[5].textContent,
                    deliveryDateTime: cells[6].textContent === '未设置' ? '' : cells[6].textContent
                };
            }

            console.log('提取的订单数据:', orderData);

            // 切换到表单视图
            if (typeof showDispatchForm === 'function') {
                showDispatchForm();
            }

            // 延迟填充表单，确保DOM已更新
            setTimeout(() => {
                this.fillEditFormWithMapping(orderData);
            }, 100);

        } catch (error) {
            console.error('编辑订单失败:', error);
            Utils.UIUtils.showError('编辑订单失败');
        }
    }

    // 填充编辑表单 - 使用字段映射
    fillEditFormWithMapping(orderData) {
        console.log('使用字段映射填充编辑表单:', orderData);
        
        // 确保字段映射配置已加载
        if (!window.fieldMapping) {
            console.error('字段映射配置未加载');
            return;
        }
        
        // 基本信息映射
        this.fillBasicInfo(orderData);
        
        // 提货信息映射
        this.fillPickupInfo(orderData);
        
        // 送货信息映射
        this.fillDeliveryInfo(orderData);
        
        // 物流园信息映射
        this.fillLogisticsParkInfo(orderData);
        
        // 货物信息映射
        this.fillCargoInfo(orderData);
        
        // 运输团队信息映射
        this.fillTransportInfo(orderData);
        
        console.log('表单填充完成');
    }
    
    // 填充基本信息
    fillBasicInfo(orderData) {
        // PO和Shipment信息
        const poEl = document.getElementById('po');
        const cw1noEl = document.getElementById('cw1no');
        
        if (poEl && orderData.po) poEl.value = orderData.po;
        if (cw1noEl && orderData.cw1no) cw1noEl.value = orderData.cw1no;
        
        // 如果没有单独的po和cw1no，尝试从orderNumber解析
        if (orderData.orderNumber && (!orderData.po || !orderData.cw1no)) {
            const parts = orderData.orderNumber.split('/');
            if (parts.length === 2) {
                if (cw1noEl) cw1noEl.value = parts[0];
                if (poEl) poEl.value = parts[1];
            } else {
                // 如果只有一个值，优先填入cw1no
                if (cw1noEl) cw1noEl.value = orderData.orderNumber;
            }
        }
    }
    
    // 填充提货信息
    fillPickupInfo(orderData) {
        const pickupFactoryEl = document.getElementById('pickupFactory');
        const pickupContactEl = document.getElementById('pickupContact');
        const pickupAddressEl = document.getElementById('pickupAddress');
        const pickupDateEl = document.getElementById('pickupDate');
        const pickupTimeEl = document.getElementById('pickupTime');
        
        if (pickupFactoryEl && orderData.pickupLocation) {
            pickupFactoryEl.value = orderData.pickupLocation;
        }
        
        if (pickupContactEl && orderData.pickupContact) {
            pickupContactEl.value = orderData.pickupContact;
        }
        
        if (pickupAddressEl && orderData.pickupAddress) {
            pickupAddressEl.value = orderData.pickupAddress;
        }
        
        // 处理提货日期时间
        if (orderData.pickupDateTime) {
            const dateTime = window.fieldMapping.formatDateTime(orderData.pickupDateTime);
            if (pickupDateEl && dateTime.date) pickupDateEl.value = dateTime.date;
            if (pickupTimeEl && dateTime.time) pickupTimeEl.value = dateTime.time;
        }
    }
    
    // 填充送货信息
    fillDeliveryInfo(orderData) {
        const deliveryFactoryEl = document.getElementById('deliveryFactory');
        const deliveryContactEl = document.getElementById('deliveryContact');
        const deliveryAddressEl = document.getElementById('deliveryAddress');
        const deliveryDateEl = document.getElementById('deliveryDate');
        const deliveryTimeEl = document.getElementById('deliveryTime');
        
        if (deliveryFactoryEl && orderData.deliveryLocation) {
            deliveryFactoryEl.value = orderData.deliveryLocation;
        }
        
        if (deliveryContactEl && orderData.deliveryContact) {
            deliveryContactEl.value = orderData.deliveryContact;
        }
        
        if (deliveryAddressEl && orderData.deliveryAddress) {
            deliveryAddressEl.value = orderData.deliveryAddress;
        }
        
        // 处理送货日期时间
        if (orderData.deliveryDateTime) {
            const dateTime = window.fieldMapping.formatDateTime(orderData.deliveryDateTime);
            if (deliveryDateEl && dateTime.date) deliveryDateEl.value = dateTime.date;
            if (deliveryTimeEl && dateTime.time) deliveryTimeEl.value = dateTime.time;
        }
    }
    
    // 填充物流园信息
    fillLogisticsParkInfo(orderData) {
        const parkNameEl = document.getElementById('parkName');
        const parkContactEl = document.getElementById('parkContact');
        const parkAddressEl = document.getElementById('parkAddress');
        
        // 修复字段映射问题：使用正确的字段名parkName而不是logisticsPark
        if (parkNameEl && orderData.parkName) {
            parkNameEl.value = orderData.parkName;
        }
        
        if (parkContactEl && orderData.parkContact) {
            parkContactEl.value = orderData.parkContact;
        }
        
        if (parkAddressEl && orderData.parkAddress) {
            parkAddressEl.value = orderData.parkAddress;
        }
    }
    
    // 填充货物信息
    fillCargoInfo(orderData) {
        const cargoTypeEl = document.getElementById('cargoType');
        const cargoWeightEl = document.getElementById('cargoWeight');
        const cargoVolumeEl = document.getElementById('cargoVolume');
        const cargoPiecesEl = document.getElementById('cargoPieces');
        const cargoNotesEl = document.getElementById('cargoNotes');
        
        if (cargoTypeEl && orderData.cargoInfo) {
            cargoTypeEl.value = orderData.cargoInfo;
        }
        
        if (cargoWeightEl && orderData.cargoWeight) {
            cargoWeightEl.value = orderData.cargoWeight;
        }
        
        if (cargoVolumeEl && orderData.cargoVolume) {
            cargoVolumeEl.value = orderData.cargoVolume;
        }
        
        if (cargoPiecesEl && orderData.cargoPieces) {
            cargoPiecesEl.value = orderData.cargoPieces;
        }
        
        if (cargoNotesEl && orderData.cargoNotes) {
            cargoNotesEl.value = orderData.cargoNotes;
        }
    }
    
    // 填充运输团队信息
    fillTransportInfo(orderData) {
        const transportTeamEl = document.getElementById('transportTeam');
        const vehicleTypeEl = document.getElementById('vehicleType');
        const routeEl = document.getElementById('route');
        
        if (transportTeamEl && orderData.transportTeam) {
            transportTeamEl.value = orderData.transportTeam;
        }
        
        if (vehicleTypeEl && orderData.vehicleType) {
            vehicleTypeEl.value = orderData.vehicleType;
        }
        
        if (routeEl && orderData.route) {
            routeEl.value = orderData.route;
        }
    }
    
    // 保留原有的fillEditForm方法以保持兼容性
    fillEditForm(orderData) {
        console.log('填充编辑表单:', orderData);

        try {
            // 填充基本字段
            const fields = {
                'orderId': orderData.id || '',
                'pickupLocation': orderData.pickupLocation || '',
                'deliveryLocation': orderData.deliveryLocation || '',
                'pickupDateTime': orderData.pickupDateTime || '',
                'deliveryDateTime': orderData.deliveryDateTime || ''
            };

            Object.entries(fields).forEach(([fieldId, value]) => {
                const element = document.getElementById(fieldId);
                if (element) {
                    element.value = value;
                }
            });

            // 处理客户选择
            this.handleCustomerSelection(orderData.customer);

            console.log('表单填充完成');

        } catch (error) {
            console.error('填充表单失败:', error);
            Utils.UIUtils.showError('填充表单失败');
        }
    }

    // 处理客户选择
    handleCustomerSelection(customerName) {
        const customerSelect = document.getElementById('customerSelect');
        if (!customerSelect || !customerName) return;

        // 检查客户是否在选项中
        let customerFound = false;
        for (let option of customerSelect.options) {
            if (option.text === customerName) {
                option.selected = true;
                customerFound = true;
                break;
            }
        }

        // 如果客户不在选项中，添加新选项
        if (!customerFound) {
            const newOption = document.createElement('option');
            newOption.value = customerName;
            newOption.text = customerName;
            newOption.selected = true;
            customerSelect.appendChild(newOption);
        }
    }

    // 重新打印派送单
    reprintDispatchSheet(orderId) {
        console.log('重新打印派送单:', orderId);

        try {
            let orderData = null;

            // 从数据管理器获取订单数据
            if (this.dataManager) {
                orderData = this.dataManager.getOrderById(orderId);
            }

            if (!orderData) {
                Utils.UIUtils.showError('未找到订单数据');
                return;
            }

            console.log('找到订单数据:', orderData);

            // 将订单数据映射为表单数据格式
            const formData = {
                // 基本信息
                orderId: orderData.id,
                routeName: orderData.routeName || orderData.route || '未选择路线',
                transportTeam: orderData.transportTeam || orderData.customer || '未指定',
                vehicleType: orderData.vehicleType || '未选择',
                cw1no: orderData.cw1no || orderData.orderNumber || '',
                po: orderData.po || orderData.id || '',

                // 提货信息（单点，用于兼容）
                pickupFactory: orderData.pickupFactory || orderData.pickupLocation || '未填写',
                pickupAddress: orderData.pickupAddress || orderData.customerAddress || '未填写',
                pickupContact: orderData.pickupContact || orderData.customer || '未填写',
                pickupDate: orderData.pickupDate || orderData.pickupDateTime || '未设置',

                // 多个提货点
                pickupPoints: orderData.pickupPoints || [],

                // 物流园信息
                parkName: orderData.parkName || '',
                parkContact: orderData.parkContact || '',
                parkAddress: orderData.parkAddress || '',

                // 送货信息（单点，用于兼容）
                deliveryFactory: orderData.deliveryFactory || orderData.deliveryLocation || '未填写',
                deliveryAddress: orderData.deliveryAddress || orderData.deliveryLocation || '未填写',
                deliveryContact: orderData.deliveryContact || orderData.customer || '未填写',
                deliveryDate: orderData.deliveryDate || orderData.deliveryDateTime || '未设置',

                // 多个送货点
                deliveryPoints: orderData.deliveryPoints || [],

                // 货物信息
                cargoType: orderData.cargoType || orderData.items?.[0]?.name || '未指定',
                cargoWeight: orderData.cargoWeight || orderData.weight || '',
                cargoVolume: orderData.cargoVolume || orderData.volume || '',
                cargoPieces: orderData.cargoPieces || orderData.quantity || '',
                cargoNotes: orderData.cargoNotes || orderData.notes || '无',

                // 兼容原有字段
                customer: orderData.customer,
                pickupLocation: orderData.pickupLocation,
                deliveryLocation: orderData.deliveryLocation,
                pickupDateTime: orderData.pickupDateTime,
                deliveryDateTime: orderData.deliveryDateTime,
                customerPhone: orderData.customerPhone || '',
                customerAddress: orderData.customerAddress || '',
                notes: orderData.notes || '',
                items: orderData.items || []
            };

            console.log('映射的表单数据:', formData);

            // 调用PDF生成函数
            if (Utils.PDFUtils && Utils.PDFUtils.checkLibraries()) {
                // 创建PDF模板容器
                const pdfContainer = document.createElement('div');
                pdfContainer.id = 'pdf-template';
                pdfContainer.style.cssText = `
                    position: absolute;
                    left: -9999px;
                    top: -9999px;
                    width: 210mm;
                    min-height: 297mm;
                    max-width: 210mm;
                    background: #fff;
                    padding: 3mm;
                    font-family: 'Microsoft YaHei', 'Noto Sans SC', Arial, sans-serif;
                    font-size: 14px;
                    line-height: 1.4;
                    box-sizing: border-box;
                    overflow: hidden;
                    color: #333;
                `;

                // 获取公司logo URL
                const logoUrl = Utils.CONSTANTS.LOGO_URL;

                // 生成多个提货点的HTML
                const generatePickupPointsHTML = (pickupPoints) => {
                    if (!pickupPoints || pickupPoints.length === 0) {
                        // 如果没有多点数据，使用单点数据
                        return `
                            <div style="margin-bottom: 15px; padding: 8px; border: 1px solid #ddd; border-radius: 3px; background-color: #fafafa;">
                                <div style="display: flex; flex-wrap: wrap;">
                                    <p style="margin: 3px 0; width: 100%;"><strong>地点:</strong> ${formData.pickupFactory || '未填写'}</p>
                                    <p style="margin: 3px 0; width: 100%;"><strong>地址:</strong> ${formData.pickupAddress || '未填写'}</p>
                                    <p style="margin: 3px 0; width: 48%;"><strong>联系人:</strong> ${formData.pickupContact || '未填写'}</p>
                                    <p style="margin: 3px 0; width: 48%;"><strong>日期:</strong> ${formData.pickupDate || '未设置'}</p>
                                </div>
                            </div>
                        `;
                    }

                    return pickupPoints.map((point, index) => {
                        const pointNumber = pickupPoints.length > 1 ? `提货点${index + 1}` : '提货点';
                        return `
                            <div style="margin-bottom: 15px; padding: 8px; border: 1px solid #ddd; border-radius: 3px; background-color: #fafafa;">
                                <h5 style="margin: 0 0 8px 0; color: #1a3a6c; font-size: 14px; font-weight: bold;">${pointNumber}</h5>
                                <div style="display: flex; flex-wrap: wrap;">
                                    <p style="margin: 3px 0; width: 100%;"><strong>地点:</strong> ${point.factory || '未填写'}</p>
                                    <p style="margin: 3px 0; width: 100%;"><strong>地址:</strong> ${point.address || '未填写'}</p>
                                    <p style="margin: 3px 0; width: 48%;"><strong>联系人:</strong> ${point.contact || '未填写'}</p>
                                    <p style="margin: 3px 0; width: 48%;"><strong>日期:</strong> ${point.date || '未设置'}</p>
                                </div>
                            </div>
                        `;
                    }).join('');
                };

                // 生成多个送货点的HTML
                const generateDeliveryPointsHTML = (deliveryPoints) => {
                    if (!deliveryPoints || deliveryPoints.length === 0) {
                        // 如果没有多点数据，使用单点数据
                        return `
                            <div style="margin-bottom: 15px; padding: 8px; border: 1px solid #ddd; border-radius: 3px; background-color: #fafafa;">
                                <div style="display: flex; flex-wrap: wrap;">
                                    <p style="margin: 3px 0; width: 100%;"><strong>地点:</strong> ${formData.deliveryFactory || '未填写'}</p>
                                    <p style="margin: 3px 0; width: 100%;"><strong>地址:</strong> ${formData.deliveryAddress || '未填写'}</p>
                                    <p style="margin: 3px 0; width: 48%;"><strong>联系人:</strong> ${formData.deliveryContact || '未填写'}</p>
                                    <p style="margin: 3px 0; width: 48%;"><strong>日期:</strong> ${formData.deliveryDate || '未设置'}</p>
                                </div>
                            </div>
                        `;
                    }

                    return deliveryPoints.map((point, index) => {
                        const pointNumber = deliveryPoints.length > 1 ? `送货点${index + 1}` : '送货点';
                        return `
                            <div style="margin-bottom: 15px; padding: 8px; border: 1px solid #ddd; border-radius: 3px; background-color: #fafafa;">
                                <h5 style="margin: 0 0 8px 0; color: #1a3a6c; font-size: 14px; font-weight: bold;">${pointNumber}</h5>
                                <div style="display: flex; flex-wrap: wrap;">
                                    <p style="margin: 3px 0; width: 100%;"><strong>地点:</strong> ${point.factory || '未填写'}</p>
                                    <p style="margin: 3px 0; width: 100%;"><strong>地址:</strong> ${point.address || '未填写'}</p>
                                    <p style="margin: 3px 0; width: 48%;"><strong>联系人:</strong> ${point.contact || '未填写'}</p>
                                    <p style="margin: 3px 0; width: 48%;"><strong>日期:</strong> ${point.date || '未设置'}</p>
                                </div>
                            </div>
                        `;
                    }).join('');
                };

                // 创建派车单HTML内容
                pdfContainer.innerHTML = `
                    <div style="${Utils.CONSTANTS.PDF_CONFIG.LOGO_CONTAINER_STYLE}">
                        <img src="${logoUrl}" alt="公司logo" style="${Utils.CONSTANTS.PDF_CONFIG.LOGO_STYLE}">
                        <h2 style="margin: 0; color: #1a3a6c; font-size: 24px;">派车单</h2>
                    </div>

                    <div style="margin-bottom: 10px; margin-top: 5px; padding: 0 10px;">
                        <p style="margin: 5px 0; text-align: left;"><strong style="font-size: 16px; color: #ff0000;">路线:</strong> <span style="font-weight: bold; font-size: 16px; color: #ff0000;">${formData.routeName || '未选择路线'}</span></p>
                    </div>

                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; padding: 0 10px;">
                        <div style="width: 48%;">
                            <p style="margin: 3px 0;"><strong style="font-size: 14px;">TO:</strong> <span style="font-weight: bold; font-size: 14px;">${formData.transportTeam}</span></p>
                            <p style="margin: 3px 0;"><strong>车型:</strong> ${formData.vehicleType || '未选择'}</p>
                        </div>
                        <div style="width: 48%;">
                            <p style="margin: 3px 0;"><strong>PO:</strong> ${formData.cw1no || '无'}</p>
                            <p style="margin: 3px 0;"><strong>Shipment:</strong> ${formData.po}</p>
                        </div>
                    </div>

                    <div style="margin-bottom: 12px; margin-top: 8px; padding: 8px 15px; border-radius: 5px; background-color: #f9f9f9;">
                        <h4 style="margin: 0 0 8px 0; border-bottom: 1px solid #eee; padding-bottom: 4px; color: #1a3a6c; font-size: 16px;">提货信息 ${formData.pickupPoints && formData.pickupPoints.length > 1 ? `(共${formData.pickupPoints.length}个提货点)` : ''}</h4>
                        ${generatePickupPointsHTML(formData.pickupPoints)}
                    </div>

                    <div style="margin-bottom: 12px; margin-top: 8px; padding: 8px 15px; border-radius: 5px; background-color: #f9f9f9;">
                        <h4 style="margin: 0 0 8px 0; border-bottom: 1px solid #eee; padding-bottom: 4px; color: #1a3a6c; font-size: 16px;">物流园信息</h4>
                        <div style="display: flex; flex-wrap: wrap;">
                            <p style="margin: 4px 0; width: 48%;"><strong>物流园名称:</strong> ${formData.parkName || orderData.parkName || '无'}</p>
                            <p style="margin: 4px 0; width: 48%;"><strong>联系人:</strong> ${formData.parkContact || orderData.parkContact || '无'}</p>
                            <p style="margin: 4px 0; width: 100%;"><strong>物流园地址:</strong> ${formData.parkAddress || orderData.parkAddress || '无'}</p>
                        </div>
                    </div>

                    <div style="margin-bottom: 12px; margin-top: 8px; padding: 8px 15px; border-radius: 5px; background-color: #f9f9f9;">
                        <h4 style="margin: 0 0 8px 0; border-bottom: 1px solid #eee; padding-bottom: 4px; color: #1a3a6c; font-size: 16px;">送货信息 ${formData.deliveryPoints && formData.deliveryPoints.length > 1 ? `(共${formData.deliveryPoints.length}个送货点)` : ''}</h4>
                        ${generateDeliveryPointsHTML(formData.deliveryPoints)}
                    </div>

                    <div style="margin-bottom: 12px; margin-top: 8px; padding: 8px 15px; border-radius: 5px; background-color: #f9f9f9;">
                        <h4 style="margin: 0 0 8px 0; border-bottom: 1px solid #eee; padding-bottom: 4px; color: #1a3a6c; font-size: 16px;">货物信息</h4>
                        <div style="display: flex; flex-wrap: wrap;">
                            <p style="margin: 4px 0; width: 48%;"><strong>货物类型:</strong> ${formData.cargoType}</p>
                            <p style="margin: 4px 0; width: 48%;"><strong>件数:</strong> ${formData.cargoPieces || '未指定'}</p>
                            <p style="margin: 4px 0; width: 48%;"><strong>重量:</strong> ${formData.cargoWeight ? formData.cargoWeight + ' KG' : '未指定'}</p>
                            <p style="margin: 4px 0; width: 48%;"><strong>体积:</strong> ${formData.cargoVolume ? formData.cargoVolume + ' m³' : '未指定'}</p>
                        </div>
                    </div>

                    <div style="margin-bottom: 10px; margin-top: 8px; padding: 8px 15px; border-radius: 5px; background-color: #f9f9f9;">
                        <h4 style="margin: 0 0 8px 0; border-bottom: 1px solid #eee; padding-bottom: 4px; color: #1a3a6c; font-size: 16px;">备注信息</h4>
                        <div style="display: flex; flex-wrap: wrap;">
                            <p style="margin: 4px 0; width: 100%; min-height: 50px; white-space: pre-wrap;">${formData.cargoNotes || '无'}</p>
                        </div>
                    </div>
                `;

                document.body.appendChild(pdfContainer);

                // 等待图片加载完成后生成PDF
                 const img = pdfContainer.querySelector('img');
                 if (img) {
                     img.onload = function() {
                         Utils.PDFUtils.generatePDF(pdfContainer, formData, true).then(() => {
                             document.body.removeChild(pdfContainer);
                             Utils.UIUtils.showSuccess('派车单重新打印成功');
                         }).catch((error) => {
                             console.error('PDF生成失败:', error);
                             document.body.removeChild(pdfContainer);
                             Utils.UIUtils.showError('PDF生成失败，请重试');
                         });
                     };
                     img.onerror = function() {
                         // 如果图片加载失败，仍然生成PDF
                         Utils.PDFUtils.generatePDF(pdfContainer, formData, true).then(() => {
                             document.body.removeChild(pdfContainer);
                             Utils.UIUtils.showSuccess('派车单重新打印成功');
                         }).catch((error) => {
                             console.error('PDF生成失败:', error);
                             document.body.removeChild(pdfContainer);
                             Utils.UIUtils.showError('PDF生成失败，请重试');
                         });
                     };
                 } else {
                      Utils.PDFUtils.generatePDF(pdfContainer, formData, true).then(() => {
                          document.body.removeChild(pdfContainer);
                          Utils.UIUtils.showSuccess('派车单重新打印成功');
                      }).catch((error) => {
                          console.error('PDF生成失败:', error);
                          document.body.removeChild(pdfContainer);
                          Utils.UIUtils.showError('PDF生成失败，请重试');
                      });
                   }
            } else {
                Utils.UIUtils.showError('PDF生成功能不可用，请刷新页面重试');
            }

        } catch (error) {
            console.error('重新打印失败:', error);
            Utils.UIUtils.showError('重新打印失败');
        }
    }

    // 加载订单表格
    async loadOrdersTable() {
        console.log('开始加载订单表格...');

        // 确保表格元素可用
        if (!this.ensureTableElement()) {
            console.log('orderTable元素未找到，可能不在订单管理页面');
            return;
        }

        try {
            // 获取所有订单数据
            const orders = await Utils.StorageUtils.getOrders();
            console.log('获取到的订单数据:', orders);

            // 清空表格
            this.tableBody.innerHTML = '';

            // 确保orders是数组
            if (!orders || !Array.isArray(orders) || orders.length === 0) {
                this.tableBody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">暂无订单数据</td></tr>';
                return;
            }

            // 按创建时间倒序排列，最新的订单显示在前面
            const sortedOrders = orders.sort((a, b) => {
                const timeA = new Date(a.createTime || a.updateTime || 0);
                const timeB = new Date(b.createTime || b.updateTime || 0);
                return timeB - timeA;
            });

            // 添加每个订单到表格
            sortedOrders.forEach(order => {
                this.addOrderToTable(order, false); // 不需要再次保存到存储
            });

            console.log(`订单表格加载完成，共 ${orders.length} 条订单`);

            // 更新批量操作按钮状态
            this.updateBatchButtons('order');

        } catch (error) {
            console.error('加载订单表格失败:', error);
            if (typeof Utils !== 'undefined' && Utils.UIUtils && Utils.UIUtils.showError) {
                Utils.UIUtils.showError('加载订单表格失败');
            }

            // 显示错误消息在表格中
            this.tableBody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">加载订单数据失败</td></tr>`;
        }
    }
}

// 创建全局实例
window.orderManager = new OrderManager();

// 在DOM加载完成后重新绑定事件
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM加载完成，重新绑定订单管理事件');
    if (window.orderManager) {
        window.orderManager.bindEvents();
    }
});

// 监听导航事件，当切换到订单管理页面时重新绑定事件
document.addEventListener('navChanged', (event) => {
    if (event.detail && event.detail.target === 'order-management') {
        console.log('导航到订单管理页面，重新绑定事件');
        setTimeout(() => {
            if (window.orderManager) {
                window.orderManager.bindEvents();
            }
        }, 100); // 短暂延迟确保DOM已更新
    }
});

// 保持向后兼容的全局函数
function addOrderToTable(orderData, saveToStorage = true) {
    return window.orderManager.addOrderToTable(orderData, saveToStorage);
}

async function loadOrdersTable() {
    return await window.orderManager.loadOrdersTable();
}

function toggleSelectAll(type) {
    return window.orderManager.toggleSelectAll(type);
}

function updateBatchButtons(type) {
    return window.orderManager.updateBatchButtons(type);
}

async function batchDeleteOrders() {
    return await window.orderManager.batchDeleteOrders();
}

function batchPrintOrders() {
    return window.orderManager.batchPrintOrders();
}

function exportSelectedOrders() {
    return window.orderManager.exportSelectedOrders();
}

function exportMonthlyOrders() {
    return window.orderManager.exportMonthlyOrders();
}

async function deleteOrder(orderId) {
    return await window.orderManager.deleteOrder(orderId);
}

function editOrder(orderId) {
    return window.orderManager.editOrder(orderId);
}

function fillEditForm(data) {
    return window.orderManager.fillEditForm(data);
}

function reprintDispatchSheet(orderId) {
    return window.orderManager.reprintDispatchSheet(orderId);
}

// 将函数添加到全局作用域
window.addOrderToTable = addOrderToTable;
window.loadOrdersTable = loadOrdersTable;
window.deleteOrder = deleteOrder;
window.editOrder = editOrder;
window.reprintDispatchSheet = reprintDispatchSheet;
window.batchDeleteOrders = batchDeleteOrders;
window.batchPrintOrders = batchPrintOrders;
window.exportSelectedOrders = exportSelectedOrders;
window.exportMonthlyOrders = exportMonthlyOrders;
window.toggleSelectAll = toggleSelectAll;
window.updateBatchButtons = updateBatchButtons;
window.fillEditForm = fillEditForm;
