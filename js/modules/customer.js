// 客户管理相关功能模块
// 打开新增客户模态框
function openCustomerModal() {
    document.getElementById('customerModal').style.display = 'flex';
    clearCustomerForm();
}

// 关闭新增客户模态框
function closeCustomerModal() {
    document.getElementById('customerModal').style.display = 'none';
    clearCustomerForm();
}

// 保存客户信息
function saveCustomer() {
    const customerName = document.getElementById('customerName').value;
    const customerAddress = document.getElementById('customerAddress').value;
    const contactName = document.getElementById('contactName').value;
    const contactPhone = document.getElementById('contactPhone').value;

    if (!customerName || !contactName || !contactPhone) {
        alert('请填写必要的客户信息');
        return;
    }

    // 检查是否为编辑模式
    const editingId = document.getElementById('customerModal').dataset.editingId;

    let customerId;
    if (editingId) {
        // 编辑模式
        customerId = editingId;
        
        // 如果是编辑模式，需要更新线路管理中的相关信息
        updateRouteCustomerInfo(customerId, {
            name: customerName,
            address: customerAddress,
            contact: contactName,
            phone: contactPhone
        });
    } else {
        // 新增模式 - 生成唯一ID
        customerId = 'customer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // 构建客户数据对象
    const customerData = {
        id: customerId,
        name: customerName,
        address: customerAddress,
        contact: contactName,
        phone: contactPhone,
        addTime: editingId ? (getExistingCustomerAddTime(customerId) || new Date().toISOString()) : new Date().toISOString()
    };

    // 优先使用dataManager保存客户
    if (window.dataManager && typeof window.dataManager.saveCustomer === 'function') {
        window.dataManager.saveCustomer(customerData);
        
        // 同时更新旧格式的customerData以保持兼容性
        const existingData = window.dataManager.getCustomerData();
        existingData[customerId] = customerData;
        window.dataManager.setCustomerData(existingData);
    } else {
        // 降级到localStorage操作
        const existingData = JSON.parse(localStorage.getItem('customerData')) || {};
        existingData[customerId] = customerData;
        localStorage.setItem('customerData', JSON.stringify(existingData));
    }

     // 更新客户选择下拉框
    updateCustomerDropdown();

    // 关闭模态框
    closeCustomerModal();

    // 如果当前在客户列表页面，刷新列表
    if (getCurrentSection() === 'customerList') {
        loadCustomerListData();
    }

    const action = editingId ? '更新' : '添加';
    alert(`客户 ${customerName} 已${action}!`);
}

// 获取现有客户的添加时间的辅助函数
function getExistingCustomerAddTime(customerId) {
    try {
        if (window.dataManager && typeof window.dataManager.getCustomers === 'function') {
            const customers = window.dataManager.getCustomers();
            const existingCustomer = customers.find(c => c.id === customerId);
            return existingCustomer?.addTime;
        } else {
            const existingData = JSON.parse(localStorage.getItem('customerData')) || {};
            return existingData[customerId]?.addTime;
        }
    } catch (error) {
        console.error('获取客户添加时间时出错:', error);
        return null;
    }
}

// 更新客户下拉框
function updateCustomerDropdown() {
    const customerSelect = document.getElementById('customer');
    if (!customerSelect) return;

    const customerData = JSON.parse(localStorage.getItem('customerData')) || {};

    // 清空现有选项（保留默认选项）
    customerSelect.innerHTML = '<option value="">请选择客户</option>';

    // 添加客户选项
    Object.entries(customerData).forEach(([id, data]) => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = data.name;
        customerSelect.appendChild(option);
    });
}

// 清空客户表单
function clearCustomerForm() {
    document.getElementById('customerName').value = '';
    document.getElementById('customerAddress').value = '';
    document.getElementById('contactName').value = '';
    document.getElementById('contactPhone').value = '';

    // 清除编辑模式标识
    delete document.getElementById('customerModal').dataset.editingId;

    // 更新模态框标题
    const modalTitle = document.querySelector('#customerModal .modal-header h2');
    if (modalTitle) {
        modalTitle.textContent = '新增客户';
    }
}

// 查看客户详情
function viewCustomerDetail(customerId) {
    const customerData = JSON.parse(localStorage.getItem('customerData')) || {};
    const customer = customerData[customerId];

    if (!customer) {
        alert('客户信息不存在');
        return;
    }

    // 创建详情模态框
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'customerDetailModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>客户详情</h3>
                <span class="close" onclick="closeCustomerDetailModal()">&times;</span>
            </div>
            <div class="modal-body">
                <div class="customer-details">
                    <div class="detail-row">
                        <label>名称：</label>
                        <span>${customer.name}</span>
                    </div>
                    <div class="detail-row">
                        <label>联系人：</label>
                        <span>${customer.contact}</span>
                    </div>
                    <div class="detail-row">
                        <label>联系电话：</label>
                        <span>${customer.phone}</span>
                    </div>
                    <!-- 删除状态显示模块 -->
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-accent" onclick="editCustomer('${customerId}')">编辑</button>
                <button class="btn btn-outline" onclick="closeCustomerDetailModal()">关闭</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

// 关闭客户详情模态框
function closeCustomerDetailModal() {
    const modal = document.getElementById('customerDetailModal');
    if (modal) {
        modal.remove();
    }
}

// 编辑客户
function editCustomer(customerId) {
    // 优先使用dataManager获取客户数据
    let customer;
    if (window.dataManager && typeof window.dataManager.getCustomers === 'function') {
        const customers = window.dataManager.getCustomers();
        customer = customers.find(c => c.id === customerId);
        
        // 如果在新格式中没找到，尝试从旧格式中获取
        if (!customer) {
            const customerData = window.dataManager.getCustomerData();
            customer = customerData[customerId];
            if (customer) {
                // 为旧格式数据添加id字段
                customer.id = customerId;
            }
        }
    } else {
        // 降级到localStorage
        const customerData = JSON.parse(localStorage.getItem('customerData')) || {};
        customer = customerData[customerId];
        if (customer) {
            customer.id = customerId;
        }
    }

    if (!customer) {
        alert('客户信息不存在');
        return;
    }

    // 关闭详情模态框（如果存在）
    closeCustomerDetailModal();

    // 确保模态框元素存在
    const customerModal = document.getElementById('customerModal');
    const customerNameEl = document.getElementById('customerName');
    const customerAddressEl = document.getElementById('customerAddress');
    const contactNameEl = document.getElementById('contactName');
    const contactPhoneEl = document.getElementById('contactPhone');
    
    if (!customerModal || !customerNameEl || !contactNameEl || !contactPhoneEl) {
        console.error('客户编辑模态框元素未找到');
        alert('编辑功能暂时不可用，请刷新页面重试');
        return;
    }

    // 填充表单数据
    customerNameEl.value = customer.name || '';
    if (customerAddressEl) customerAddressEl.value = customer.address || '';
    contactNameEl.value = customer.contact || '';
    contactPhoneEl.value = customer.phone || '';

    // 设置编辑模式标识
    customerModal.dataset.editingId = customerId;

    // 更新模态框标题
    const modalTitle = document.querySelector('#customerModal .modal-header h2');
    if (modalTitle) {
        modalTitle.textContent = '编辑客户';
    }

    // 显示模态框
    customerModal.style.display = 'flex';
}

// 确保editCustomer函数在全局作用域中可用
window.editCustomer = editCustomer;

// 统一客户字段格式
function unifyCustomerFields() {
    if (!window.dataManager) {
        alert('数据管理器未初始化');
        return;
    }
    
    try {
        // 获取所有客户数据
        const customers = window.dataManager.getCustomers();
        const customerData = window.dataManager.getCustomerData();
        
        let updatedCount = 0;
        const unifiedCustomers = [];
        const unifiedCustomerData = {};
        
        // 处理新格式的客户数据
        customers.forEach(customer => {
            const unifiedCustomer = {
                id: customer.id,
                name: customer.name || '',
                contact: customer.contact || '',
                phone: customer.phone || '',
                address: customer.address || '',
                addTime: customer.addTime || new Date().toISOString()
            };
            unifiedCustomers.push(unifiedCustomer);
            unifiedCustomerData[customer.id] = unifiedCustomer;
            updatedCount++;
        });
        
        // 处理旧格式的客户数据
        Object.entries(customerData).forEach(([id, data]) => {
            // 检查是否已经在新格式中处理过
            if (!unifiedCustomers.find(c => c.id === id)) {
                const unifiedCustomer = {
                    id: id,
                    name: data.name || data.pickupFactory || '',
                    contact: data.contact || data.pickupContact || '',
                    phone: data.phone || window.dataManager.extractPhone(data.pickupContact) || '',
                    address: data.address || data.pickupAddress || '',
                    addTime: data.addTime || new Date().toISOString()
                };
                unifiedCustomers.push(unifiedCustomer);
                unifiedCustomerData[id] = unifiedCustomer;
                updatedCount++;
            }
        });
        
        // 保存统一后的数据
        window.dataManager.setCustomers(unifiedCustomers);
        window.dataManager.setCustomerData(unifiedCustomerData);
        
        // 刷新客户列表显示
        if (getCurrentSection() === 'customerList') {
            loadCustomerListData();
        }
        
        // 更新客户选择下拉框
        updateCustomerDropdown();
        
        alert(`客户字段统一完成！共处理 ${updatedCount} 个客户记录。`);
        
    } catch (error) {
        console.error('统一客户字段时出错:', error);
        alert('统一客户字段失败，请查看控制台了解详情。');
    }
}

// 将统一字段函数添加到全局作用域
window.unifyCustomerFields = unifyCustomerFields;

// 删除客户
function deleteCustomer(customerId) {
    // 优先使用dataManager获取客户数据
    let customers;
    if (window.dataManager && typeof window.dataManager.getCustomers === 'function') {
        customers = window.dataManager.getCustomers();
    } else {
        // 降级到localStorage
        const customerData = JSON.parse(localStorage.getItem('customerData')) || {};
        customers = Object.values(customerData);
    }

    const customer = customers.find(c => c.id === customerId);

    if (!customer) {
        alert('客户信息不存在');
        return;
    }

    // 检查是否有线路使用了该客户
    const routesUsingCustomer = checkRoutesUsingCustomer(customerId);
    
    let confirmMessage = `确定要删除客户 "${customer.name}" 吗？此操作不可恢复。`;
    if (routesUsingCustomer.length > 0) {
        confirmMessage += `\n\n注意：该客户被以下 ${routesUsingCustomer.length} 条线路使用：\n${routesUsingCustomer.map(route => `• ${route.name || '未命名线路'}`).join('\n')}\n\n删除客户后，这些线路中的相关途经点信息将被清空。`;
    }

    if (confirm(confirmMessage)) {
        // 优先使用dataManager删除客户
        if (window.dataManager && typeof window.dataManager.deleteCustomer === 'function') {
            window.dataManager.deleteCustomer(customerId);
        } else {
            // 降级到localStorage操作
            const customerData = JSON.parse(localStorage.getItem('customerData')) || {};
            delete customerData[customerId];
            localStorage.setItem('customerData', JSON.stringify(customerData));
        }
        
        // 从线路管理中移除该客户的相关信息
        removeCustomerFromRoutes(customerId);

        // 更新客户下拉框
        updateCustomerDropdown();

        // 如果当前在客户列表页面，刷新列表
        if (getCurrentSection() === 'customerList') {
            loadCustomerListData();
        }

        alert(`客户 "${customer.name}" 已删除`);
    }
}

// 客户批量操作相关函数

// 全选/取消全选客户
function toggleCustomerSelectAll() {
    const selectAllCheckbox = document.getElementById('customerSelectAll');
    const customerCheckboxes = document.querySelectorAll('.customer-checkbox');
    
    customerCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
    
    updateCustomerBatchButtons();
}

// 更新客户批量操作按钮状态
function updateCustomerBatchButtons() {
    const customerCheckboxes = document.querySelectorAll('.customer-checkbox');
    const checkedBoxes = document.querySelectorAll('.customer-checkbox:checked');
    const selectAllCheckbox = document.getElementById('customerSelectAll');
    
    // 更新全选复选框状态
    if (selectAllCheckbox) {
        if (checkedBoxes.length === 0) {
            selectAllCheckbox.indeterminate = false;
            selectAllCheckbox.checked = false;
        } else if (checkedBoxes.length === customerCheckboxes.length) {
            selectAllCheckbox.indeterminate = false;
            selectAllCheckbox.checked = true;
        } else {
            selectAllCheckbox.indeterminate = true;
            selectAllCheckbox.checked = false;
        }
    }
    
    // 更新批量操作按钮状态
    const batchButtons = document.querySelectorAll('.customer-batch-btn');
    batchButtons.forEach(button => {
        button.disabled = checkedBoxes.length === 0;
    });
}

// 批量删除客户
function batchDeleteCustomers() {
    const checkedBoxes = document.querySelectorAll('.customer-checkbox:checked');
    
    if (checkedBoxes.length === 0) {
        alert('请选择要删除的客户');
        return;
    }
    
    const customerIds = Array.from(checkedBoxes).map(checkbox => checkbox.value);
    
    // 检查哪些客户被线路使用
    let routesAffected = [];
    customerIds.forEach(customerId => {
        const routes = checkRoutesUsingCustomer(customerId);
        routesAffected = routesAffected.concat(routes);
    });
    
    // 去重
    const uniqueRoutesAffected = routesAffected.filter((route, index, self) => 
        index === self.findIndex(r => r.id === route.id)
    );
    
    let confirmMessage = `确定要删除选中的 ${checkedBoxes.length} 个客户吗？此操作不可恢复。`;
    if (uniqueRoutesAffected.length > 0) {
        confirmMessage += `\n\n注意：这些客户被以下 ${uniqueRoutesAffected.length} 条线路使用：\n${uniqueRoutesAffected.map(route => `• ${route.name || '未命名线路'}`).join('\n')}\n\n删除客户后，这些线路中的相关途经点信息将被清空。`;
    }
    
    if (confirm(confirmMessage)) {
        // 优先使用dataManager删除客户
        if (window.dataManager && typeof window.dataManager.deleteCustomer === 'function') {
            // 使用dataManager逐个删除客户
            customerIds.forEach(customerId => {
                window.dataManager.deleteCustomer(customerId);
                // 从线路管理中移除该客户的相关信息
                removeCustomerFromRoutes(customerId);
            });
        } else {
            // 降级到localStorage操作
            const customerData = JSON.parse(localStorage.getItem('customerData')) || {};
            
            // 从数据中删除选中的客户
            customerIds.forEach(customerId => {
                delete customerData[customerId];
                // 从线路管理中移除该客户的相关信息
                removeCustomerFromRoutes(customerId);
            });
            
            // 保存到本地存储
            localStorage.setItem('customerData', JSON.stringify(customerData));
        }
        
        // 更新客户下拉框
        updateCustomerDropdown();
        
        // 刷新客户列表
        loadCustomerListData();
        
        alert(`已删除 ${checkedBoxes.length} 个客户`);
    }
}

// 导出选中客户
function exportSelectedCustomers() {
    const checkedBoxes = document.querySelectorAll('.customer-checkbox:checked');
    
    if (checkedBoxes.length === 0) {
        alert('请选择要导出的客户');
        return;
    }
    
    const customerData = JSON.parse(localStorage.getItem('customerData')) || {};
    const selectedCustomers = [];
    
    checkedBoxes.forEach(checkbox => {
        const customerId = checkbox.value;
        const customer = customerData[customerId];
        if (customer) {
            selectedCustomers.push({
                客户名称: customer.name,
                联系人: customer.contact,
                联系电话: customer.phone,
                地址: customer.address || '未填写',
                创建时间: customer.createdAt || '未知'
            });
        }
    });
    
    // 转换为CSV格式
    const headers = ['客户名称', '联系人', '联系电话', '地址', '创建时间'];
    let csvContent = headers.join(',') + '\n';
    
    selectedCustomers.forEach(customer => {
        const row = headers.map(header => {
            const value = customer[header] || '';
            // 处理包含逗号的值
            return value.includes(',') ? `"${value}"` : value;
        });
        csvContent += row.join(',') + '\n';
    });
    
    // 创建下载链接
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `客户列表_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert(`已导出 ${selectedCustomers.length} 个客户的信息`);
}

// 更新线路管理中的客户信息
function updateRouteCustomerInfo(customerId, newCustomerInfo) {
    try {
        // 获取线路数据
        const routes = Utils.StorageUtils.getRoutes();
        let routesUpdated = false;
        
        // 遍历所有线路，查找包含该客户的途经点
        routes.forEach(route => {
            if (route.waypoints && Array.isArray(route.waypoints)) {
                route.waypoints.forEach(waypoint => {
                    // 检查途经点是否包含该客户ID
                    if (waypoint.customerId === customerId) {
                        // 更新客户信息
                        waypoint.customerName = newCustomerInfo.name;
                        waypoint.customerAddress = newCustomerInfo.address;
                        waypoint.customerContact = newCustomerInfo.contact;
                        waypoint.customerPhone = newCustomerInfo.phone;
                        routesUpdated = true;
                    }
                });
            }
        });
        
        // 如果有更新，保存回本地存储
        if (routesUpdated) {
            Utils.StorageUtils.setRoutes(routes);
            console.log(`已更新线路管理中客户 ${customerId} 的信息`);
        }
    } catch (error) {
        console.error('更新线路管理中的客户信息时出错:', error);
    }
}

// 检查哪些线路使用了指定客户
function checkRoutesUsingCustomer(customerId) {
    try {
        const routes = Utils.StorageUtils.getRoutes();
        const routesUsingCustomer = [];
        
        routes.forEach(route => {
            if (route.waypoints && Array.isArray(route.waypoints)) {
                const hasCustomer = route.waypoints.some(waypoint => waypoint.customerId === customerId);
                if (hasCustomer) {
                    routesUsingCustomer.push(route);
                }
            }
        });
        
        return routesUsingCustomer;
    } catch (error) {
        console.error('检查线路使用客户信息时出错:', error);
        return [];
    }
}

// 从线路管理中移除指定客户的相关信息
function removeCustomerFromRoutes(customerId) {
    try {
        const routes = Utils.StorageUtils.getRoutes();
        let routesUpdated = false;
        
        routes.forEach(route => {
            if (route.waypoints && Array.isArray(route.waypoints)) {
                // 过滤掉包含该客户ID的途经点
                const originalLength = route.waypoints.length;
                route.waypoints = route.waypoints.filter(waypoint => waypoint.customerId !== customerId);
                
                if (route.waypoints.length !== originalLength) {
                    routesUpdated = true;
                }
            }
        });
        
        // 如果有更新，保存回本地存储
        if (routesUpdated) {
            Utils.StorageUtils.setRoutes(routes);
            console.log(`已从线路管理中移除客户 ${customerId} 的相关信息`);
        }
    } catch (error) {
        console.error('从线路管理中移除客户信息时出错:', error);
    }
}

// 导入客户数据功能
function importCustomerData() {
    // 创建文件输入元素
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json,.csv';
    fileInput.style.display = 'none';
    
    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                let importData = [];
                const fileContent = e.target.result;
                
                if (file.name.endsWith('.json')) {
                    // 处理JSON文件
                    const jsonData = JSON.parse(fileContent);
                    if (Array.isArray(jsonData)) {
                        importData = jsonData;
                    } else if (typeof jsonData === 'object' && jsonData !== null) {
                        // 如果是对象格式，转换为数组
                        importData = Object.values(jsonData);
                    }
                } else if (file.name.endsWith('.csv')) {
                    // 处理CSV文件
                    importData = parseCSVToCustomers(fileContent);
                }
                
                if (importData.length === 0) {
                    alert('导入文件中没有找到有效的客户数据');
                    return;
                }
                
                // 验证和处理导入数据
                const processedData = validateAndProcessCustomerData(importData);
                
                if (processedData.validData.length === 0) {
                    alert('导入文件中没有找到有效的客户数据');
                    return;
                }
                
                // 显示导入预览
                showImportPreview(processedData, 'customer');
                
            } catch (error) {
                console.error('导入文件解析失败:', error);
                alert('文件格式错误或内容无法解析，请检查文件格式');
            }
        };
        
        reader.readAsText(file, 'UTF-8');
    });
    
    // 触发文件选择
    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
}

// 解析CSV文件为客户数据
function parseCSVToCustomers(csvContent) {
    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const customers = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const customer = {};
        
        headers.forEach((header, index) => {
            if (values[index]) {
                // 映射CSV列名到客户对象属性
                switch (header) {
                    case '客户名称':
                    case '名称':
                    case 'name':
                        customer.name = values[index];
                        break;
                    case '联系人':
                    case 'contact':
                        customer.contact = values[index];
                        break;
                    case '联系电话':
                    case '电话':
                    case 'phone':
                        customer.phone = values[index];
                        break;
                    case '地址':
                    case 'address':
                        customer.address = values[index];
                        break;
                    case '创建时间':
                    case 'createdAt':
                        customer.createdAt = values[index];
                        break;
                }
            }
        });
        
        if (customer.name) {
            customers.push(customer);
        }
    }
    
    return customers;
}

// 验证和处理客户数据
function validateAndProcessCustomerData(importData) {
    const validData = [];
    const invalidData = [];
    const existingCustomers = JSON.parse(localStorage.getItem('customerData')) || {};
    
    importData.forEach((item, index) => {
        const errors = [];
        
        // 验证必填字段
        if (!item.name || typeof item.name !== 'string' || !item.name.trim()) {
            errors.push('客户名称不能为空');
        }
        
        // 验证联系电话格式
        if (item.phone && !/^[\d\s\-\+\(\)]+$/.test(item.phone)) {
            errors.push('联系电话格式不正确');
        }
        
        // 检查是否重复
        const isDuplicate = Object.values(existingCustomers).some(existing => 
            existing.name === item.name && existing.phone === item.phone
        );
        
        if (isDuplicate) {
            errors.push('客户已存在（相同姓名和电话）');
        }
        
        if (errors.length === 0) {
            // 生成客户ID和补充默认值
            const customerId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            const processedCustomer = {
                id: customerId,
                name: item.name.trim(),
                contact: item.contact ? item.contact.trim() : '',
                phone: item.phone ? item.phone.trim() : '',
                address: item.address ? item.address.trim() : '',
                createdAt: item.createdAt || new Date().toLocaleString('zh-CN')
            };
            validData.push(processedCustomer);
        } else {
            invalidData.push({
                index: index + 1,
                data: item,
                errors: errors
            });
        }
    });
    
    return { validData, invalidData };
}

// 显示导入预览
function showImportPreview(processedData, type) {
    const { validData, invalidData } = processedData;
    
    let previewHtml = `
        <div class="import-preview-container">
            <h3><i class="fas fa-upload"></i> 数据导入预览</h3>
            
            <div class="import-summary">
                <div class="summary-item success">
                    <i class="fas fa-check-circle"></i>
                    <span>有效数据：${validData.length} 条</span>
                </div>
                ${invalidData.length > 0 ? `
                    <div class="summary-item error">
                        <i class="fas fa-exclamation-circle"></i>
                        <span>无效数据：${invalidData.length} 条</span>
                    </div>
                ` : ''}
            </div>
    `;
    
    if (validData.length > 0) {
        previewHtml += `
            <div class="preview-section">
                <h4>有效数据预览（前5条）</h4>
                <div class="preview-table-container">
                    <table class="preview-table">
                        <thead>
                            <tr>
                                <th>客户名称</th>
                                <th>联系人</th>
                                <th>联系电话</th>
                                <th>地址</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        validData.slice(0, 5).forEach(customer => {
            previewHtml += `
                <tr>
                    <td>${customer.name}</td>
                    <td>${customer.contact || '-'}</td>
                    <td>${customer.phone || '-'}</td>
                    <td>${customer.address || '-'}</td>
                </tr>
            `;
        });
        
        previewHtml += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
    
    if (invalidData.length > 0) {
        previewHtml += `
            <div class="preview-section error-section">
                <h4>无效数据详情</h4>
                <div class="error-list">
        `;
        
        invalidData.slice(0, 10).forEach(item => {
            previewHtml += `
                <div class="error-item">
                    <strong>第 ${item.index} 行：</strong>
                    <span class="error-data">${JSON.stringify(item.data)}</span>
                    <div class="error-messages">
                        ${item.errors.map(error => `<span class="error-msg">• ${error}</span>`).join('')}
                    </div>
                </div>
            `;
        });
        
        if (invalidData.length > 10) {
            previewHtml += `<div class="more-errors">还有 ${invalidData.length - 10} 条无效数据...</div>`;
        }
        
        previewHtml += `
                </div>
            </div>
        `;
    }
    
    previewHtml += `
            <div class="import-actions">
                <button class="btn btn-primary" onclick="confirmImport()">
                    <i class="fas fa-check"></i> 确认导入 ${validData.length} 条数据
                </button>
                <button class="btn btn-secondary" onclick="closeImportPreview()">
                    <i class="fas fa-times"></i> 取消
                </button>
            </div>
        </div>
    `;
    
    // 存储待导入的数据
    pendingImportData = { type, validData };
    
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'modal import-preview-modal';
    modal.innerHTML = `
        <div class="modal-content import-preview-content">
            ${previewHtml}
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    // 存储模态框引用以便关闭
    window.currentImportModal = modal;
}

// 存储待导入的数据
let pendingImportData = null;

// 确认导入数据
function confirmImport() {
    try {
        if (!pendingImportData) {
            alert('没有待导入的数据');
            return;
        }
        
        const { type, validData } = pendingImportData;
        
        if (type === 'customer') {
            const customerData = JSON.parse(localStorage.getItem('customerData')) || {};
            
            // 添加新客户数据
            validData.forEach(customer => {
                customerData[customer.id] = customer;
            });
            
            // 保存到本地存储
            localStorage.setItem('customerData', JSON.stringify(customerData));
            
            // 更新客户下拉框
            updateCustomerDropdown();
            
            // 刷新客户列表
            if (getCurrentSection() === 'customerList') {
                loadCustomerListData();
            }
            
            alert(`成功导入 ${validData.length} 条客户数据`);
        }
        
        // 清除待导入数据
        pendingImportData = null;
        
        // 关闭预览模态框
        closeImportPreview();
        
    } catch (error) {
        console.error('导入数据时出错:', error);
        alert('导入数据时出现错误，请重试');
    }
}

// 关闭导入预览
function closeImportPreview() {
    if (window.currentImportModal) {
        document.body.removeChild(window.currentImportModal);
        window.currentImportModal = null;
    }
}

// 更新客户下拉框
function updateCustomerDropdown() {
    const customerSelect = document.getElementById('customer');
    if (!customerSelect) {
        return;
    }

    // 清空现有选项（保留第一个默认选项）
    customerSelect.innerHTML = '<option value="">请选择客户</option>';

    // 获取客户数据
    const customerData = JSON.parse(localStorage.getItem('customerData')) || {};

    // 添加客户选项
    Object.keys(customerData).forEach(customerId => {
        const customer = customerData[customerId];
        const option = document.createElement('option');
        option.value = customerId;
        option.textContent = customer.name;
        customerSelect.appendChild(option);
    });
}

// 将函数添加到全局作用域
window.updateCustomerDropdown = updateCustomerDropdown;
window.openCustomerModal = openCustomerModal;
window.closeCustomerModal = closeCustomerModal;
window.saveCustomer = saveCustomer;
window.clearCustomerForm = clearCustomerForm;
window.editCustomer = editCustomer;
window.deleteCustomer = deleteCustomer;
window.viewCustomerDetail = viewCustomerDetail;
window.closeCustomerDetailModal = closeCustomerDetailModal;
window.toggleCustomerSelectAll = toggleCustomerSelectAll;
window.updateCustomerBatchButtons = updateCustomerBatchButtons;
window.batchDeleteCustomers = batchDeleteCustomers;
window.exportSelectedCustomers = exportSelectedCustomers;
window.importCustomerData = importCustomerData;


