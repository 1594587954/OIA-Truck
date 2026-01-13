// 线路管理页面JavaScript

// 全局变量
let allRoutes = [];
let filteredRoutes = [];
let currentRouteId = null;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    loadCompanyLogo();
    loadRoutes();
    setupEventListeners();
});

// 加载公司Logo
function loadCompanyLogo() {
    const logoUrl = Utils.CONSTANTS.LOGO_URL;
    const logoElement = document.getElementById('company-logo');
    if (logoElement) {
        logoElement.src = logoUrl;
    }
}

// 设置事件监听器
function setupEventListeners() {
    // 顶部导航点击事件
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        if (link.textContent.trim() !== '线路管理') {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = 'index.html';
            });
        }
    });
    
    // 侧边栏导航事件
    const sidebarNavItems = document.querySelectorAll('.sidebar .nav-item');
    sidebarNavItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // 所有侧边导航项都跳转到主页面，允许默认行为
            return;
        });
    });
}

// 加载路线数据
function loadRoutes() {
    allRoutes = Utils.StorageUtils.getRoutes();
    
    // 按创建时间降序排序，新增的路线显示在最上面
    allRoutes.sort((a, b) => {
        const timeA = new Date(a.createTime).getTime();
        const timeB = new Date(b.createTime).getTime();
        return timeB - timeA; // 降序排序，最新的在前面
    });
    
    filteredRoutes = [...allRoutes];
    displayRoutes();
}

// 显示路线
function displayRoutes() {
    const routesTableBody = document.getElementById('routesTableBody');
    const emptyState = document.getElementById('emptyState');
    const routesTable = document.getElementById('routesTable');
    
    if (filteredRoutes.length === 0) {
        routesTable.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    routesTable.style.display = 'table';
    emptyState.style.display = 'none';
    
    routesTableBody.innerHTML = filteredRoutes.map(route => createRouteRow(route)).join('');
}

// 创建路线表格行HTML
function createRouteRow(route) {
    // 构建途经点信息文本
    let waypointsText = '';
    if (route.waypoints && route.waypoints.length > 0) {
        waypointsText = route.waypoints.map(wp => wp.customerName || '未知').join(' → ');
    } else {
        waypointsText = '无途经点';
    }
    
    // 构建货物信息文本
    let cargoInfo = '';
    if (route.cargoInfo) {
        const cargoDetails = [];
        if (route.cargoInfo.type) cargoDetails.push(`类型: ${route.cargoInfo.type}`);
        if (route.cargoInfo.weight) cargoDetails.push(`重量: ${route.cargoInfo.weight}KG`);
        if (route.cargoInfo.volume) cargoDetails.push(`体积: ${route.cargoInfo.volume}m³`);
        if (route.cargoInfo.pieces) cargoDetails.push(`件数: ${route.cargoInfo.pieces}件`);
        cargoInfo = cargoDetails.join(', ');
    }
    
    return `
        <tr class="route-row" data-route-id="${route.id}">
            <td class="checkbox-cell">
                <input type="checkbox" class="route-checkbox-input" value="${route.id}" onchange="updateRouteBatchButtons()">
            </td>
            <td class="route-name-cell">
                <div class="route-name-container">
                    <i class="fas fa-route route-icon"></i>
                    <span class="route-name">${route.name || '未命名路线'}</span>
                </div>
            </td>
            <td class="waypoints-cell">
                <span class="waypoints-text" title="${waypointsText}">${waypointsText}</span>
            </td>
            <td class="cargo-info-cell">
                <span class="cargo-info" title="${cargoInfo}">${cargoInfo || '无货物信息'}</span>
            </td>
            <td class="notes-cell">
                <span class="notes" title="${route.notes || ''}">${route.notes || '无备注'}</span>
            </td>
            <td class="actions-cell">
                <div class="action-buttons">
                    <button class="btn btn-sm btn-info" onclick="viewRouteDetails(${route.id})" title="查看详情">
                        <i class="fas fa-eye"></i> 查看
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="editRoute(${route.id})" title="编辑路线">
                        <i class="fas fa-edit"></i> 编辑
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteRoute(${route.id}, '${(route.name || '').replace(/'/g, "\\'")}')" title="删除路线">
                        <i class="fas fa-trash"></i> 删除
                    </button>
                </div>
            </td>
        </tr>
    `;
}

// 获取客户信息
function getCustomerInfo(customerId) {
    if (!customerId) return null;
    
    // 从本地存储获取客户数据
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    return customers.find(customer => customer.id == customerId);
}

// 导入线路数据功能
function importRouteData() {
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
                    importData = parseCSVToRoutes(fileContent);
                }
                
                if (importData.length === 0) {
                    alert('导入文件中没有找到有效的线路数据');
                    return;
                }
                
                // 验证和处理导入数据
                const processedData = validateAndProcessRouteData(importData);
                
                if (processedData.validData.length === 0) {
                    alert('导入文件中没有找到有效的线路数据');
                    return;
                }
                
                // 显示导入预览
                showRouteImportPreview(processedData);
                
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

// 解析CSV文件为线路数据
function parseCSVToRoutes(csvContent) {
    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const routes = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const route = {};
        
        headers.forEach((header, index) => {
            if (values[index]) {
                // 映射CSV列名到线路对象属性
                switch (header) {
                    case '线路名称':
                    case '名称':
                    case 'name':
                        route.name = values[index];
                        break;
                    case '备注':
                    case 'notes':
                        route.notes = values[index];
                        break;
                    case '途经点信息':
                    case 'waypoints':
                        if (values[index]) {
                            // 解析途经点信息：格式为 "客户名|地址|联系人|电话;客户名2|地址2|联系人2|电话2"
                            const waypointStrings = values[index].split(';');
                            route.waypoints = waypointStrings.map((wpStr, wpIndex) => {
                                const parts = wpStr.split('|');
                                return {
                                    customerId: `imported_${Date.now()}_${wpIndex}`,
                                    customerName: parts[0] || '',
                                    customerAddress: parts[1] || '',
                                    customerContact: parts[2] || '',
                                    customerPhone: parts[3] || ''
                                };
                            }).filter(wp => wp.customerName); // 过滤掉空的途经点
                        } else {
                            route.waypoints = [];
                        }
                        break;
                    case '货物类型':
                    case 'cargoType':
                        if (!route.cargoInfo) route.cargoInfo = {};
                        route.cargoInfo.type = values[index];
                        break;
                    case '货物重量':
                    case 'cargoWeight':
                        if (!route.cargoInfo) route.cargoInfo = {};
                        route.cargoInfo.weight = values[index];
                        break;
                    case '货物体积':
                    case 'cargoVolume':
                        if (!route.cargoInfo) route.cargoInfo = {};
                        route.cargoInfo.volume = values[index];
                        break;
                    case '货物件数':
                    case 'cargoPieces':
                        if (!route.cargoInfo) route.cargoInfo = {};
                        route.cargoInfo.pieces = values[index];
                        break;
                    case '创建时间':
                    case 'createTime':
                        route.createTime = values[index];
                        break;
                }
            }
        });
        
        if (route.name) {
            routes.push(route);
        }
    }
    
    return routes;
}

// 验证和处理线路数据
function validateAndProcessRouteData(importData) {
    const validData = [];
    const invalidData = [];
    const existingRoutes = Utils.StorageUtils.getRoutes();
    
    importData.forEach((item, index) => {
        const errors = [];
        
        // 验证必填字段
        if (!item.name || typeof item.name !== 'string' || !item.name.trim()) {
            errors.push('线路名称不能为空');
        }
        
        // 检查是否重复
        const isDuplicate = existingRoutes.some(existing => 
            existing.name === item.name
        );
        
        if (isDuplicate) {
            errors.push('线路名称已存在');
        }
        
        if (errors.length === 0) {
            // 生成线路ID和补充默认值（使用数字ID以保持与DIY路线的一致性）
            const routeId = Date.now() + Math.floor(Math.random() * 1000);
            const processedRoute = {
                id: routeId,
                name: item.name.trim(),
                notes: item.notes ? item.notes.trim() : '',
                waypoints: item.waypoints || [],
                cargoInfo: item.cargoInfo || {},
                createTime: item.createTime || new Date().toISOString()
            };
            validData.push(processedRoute);
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

// 显示线路导入预览
function showRouteImportPreview(processedData) {
    const { validData, invalidData } = processedData;
    
    let previewHtml = `
        <div class="import-preview-container">
            <h3><i class="fas fa-upload"></i> 线路数据导入预览</h3>
            
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
                                <th>线路名称</th>
                                <th>备注</th>
                                <th>途经点</th>
                                <th>货物类型</th>
                                <th>货物重量</th>
                                <th>货物体积</th>
                                <th>货物件数</th>
                                <th>创建时间</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        validData.slice(0, 5).forEach(route => {
            const cargoType = route.cargoInfo?.type || '-';
            const cargoWeight = route.cargoInfo?.weight || '-';
            const cargoVolume = route.cargoInfo?.volume || '-';
            const cargoPieces = route.cargoInfo?.pieces || '-';
            const waypointsText = route.waypoints && route.waypoints.length > 0 
                ? route.waypoints.map(wp => wp.customerName || '未知').join(' → ') 
                : '-';
            const createTime = route.createTime || '-';
            previewHtml += `
                <tr>
                    <td>${route.name}</td>
                    <td>${route.notes || '-'}</td>
                    <td title="${waypointsText}">${waypointsText.length > 30 ? waypointsText.substring(0, 30) + '...' : waypointsText}</td>
                    <td>${cargoType}</td>
                    <td>${cargoWeight}</td>
                    <td>${cargoVolume}</td>
                    <td>${cargoPieces}</td>
                    <td>${createTime}</td>
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
                <button class="btn btn-primary" onclick="confirmRouteImport()">
                    <i class="fas fa-check"></i> 确认导入 ${validData.length} 条数据
                </button>
                <button class="btn btn-secondary" onclick="closeRouteImportPreview()">
                    <i class="fas fa-times"></i> 取消
                </button>
            </div>
        </div>
    `;
    
    // 存储待导入的数据
    pendingRouteImportData = validData;
    
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
    window.currentRouteImportModal = modal;
}

// 存储待导入的线路数据
let pendingRouteImportData = null;

// 确认导入线路数据
function confirmRouteImport() {
    try {
        if (!pendingRouteImportData) {
            alert('没有待导入的数据');
            return;
        }
        
        const validData = pendingRouteImportData;
        
        const existingRoutes = Utils.StorageUtils.getRoutes();
        
        // 添加新线路数据
        validData.forEach(route => {
            existingRoutes.push(route);
        });
        
        // 保存到本地存储
        Utils.StorageUtils.setRoutes(existingRoutes);
        
        // 更新派车单页面的路线选择框
        if (typeof updateRouteSelect === 'function') {
            updateRouteSelect();
        }
        
        // 刷新线路列表
        loadRoutes();
        
        alert(`成功导入 ${validData.length} 条线路数据`);
        
        // 清除待导入数据
        pendingRouteImportData = null;
        
        // 关闭预览模态框
        closeRouteImportPreview();
        
    } catch (error) {
        console.error('导入线路数据时出错:', error);
        alert('导入数据时出现错误，请重试');
    }
}

// 关闭线路导入预览
function closeRouteImportPreview() {
    if (window.currentRouteImportModal) {
        document.body.removeChild(window.currentRouteImportModal);
        window.currentRouteImportModal = null;
    }
}

// 搜索路线
function searchRoutes() {
    const searchTerm = document.getElementById('routeSearch').value.toLowerCase();
    
    if (!searchTerm) {
        filteredRoutes = [...allRoutes];
    } else {
        filteredRoutes = allRoutes.filter(route => {
            const routeName = (route.name || '').toLowerCase();
            const notes = (route.notes || '').toLowerCase();
            
            return routeName.includes(searchTerm) || 
                   notes.includes(searchTerm);
        });
    }
    
    displayRoutes();
}

// 查看路线详情
function viewRouteDetails(routeId) {
    const route = allRoutes.find(r => r.id == routeId);
    if (!route) {
        alert('路线不存在！');
        return;
    }
    
    currentRouteId = routeId;
    
    // 构建详情内容
    let detailsHtml = `
        <div class="detail-section">
            <h4><i class="fas fa-info-circle"></i> 基本信息</h4>
            <p><strong>路线名称：</strong>${route.name || '未命名路线'}</p>
            <p><strong>创建时间：</strong>${route.createTime || '未知'}</p>
        </div>
    `;
    
    // 途经点信息
    detailsHtml += `
        <div class="detail-section">
            <h4><i class="fas fa-map-signs"></i> 途经点</h4>
    `;
    
    if (route.waypoints && route.waypoints.length > 0) {
        route.waypoints.forEach((waypoint, index) => {
            detailsHtml += `
                <div class="waypoint-detail">
                    <h5><i class="fas fa-map-pin"></i> 途经点 ${index + 1}</h5>
                    <div class="customer-details">
                        <p><strong>名称：</strong>${waypoint.customerName || '未知'}</p>
                        <p><strong>地址：</strong>${waypoint.customerAddress || '未知'}</p>
                        <p><strong>联系人：</strong>${waypoint.customerContact || '未知'}</p>
                        <p><strong>联系电话：</strong>${waypoint.customerPhone || '未知'}</p>
                    </div>
                </div>
            `;
        });
    } else {
        detailsHtml += '<p class="no-data">无途经点</p>';
    }
    
    detailsHtml += '</div>';
    
    // 货物信息
    detailsHtml += `
        <div class="detail-section">
            <h4><i class="fas fa-box"></i> 货物信息</h4>
    `;
    
    if (route.cargoInfo && (route.cargoInfo.type || route.cargoInfo.weight || route.cargoInfo.volume || route.cargoInfo.pieces)) {
        detailsHtml += `
            <div class="cargo-details">
                ${route.cargoInfo.type ? `<p><strong>类型：</strong>${route.cargoInfo.type}</p>` : ''}
                ${route.cargoInfo.weight ? `<p><strong>重量：</strong>${route.cargoInfo.weight} KG</p>` : ''}
                ${route.cargoInfo.volume ? `<p><strong>体积：</strong>${route.cargoInfo.volume} m³</p>` : ''}
                ${route.cargoInfo.pieces ? `<p><strong>件数：</strong>${route.cargoInfo.pieces} 件</p>` : ''}
            </div>
        `;
    } else {
        detailsHtml += '<p class="no-data">无货物信息</p>';
    }
    
    detailsHtml += '</div>';
    
    // 备注信息
    detailsHtml += `
        <div class="detail-section">
            <h4><i class="fas fa-sticky-note"></i> 备注信息</h4>
            <p>${route.notes || '无备注信息'}</p>
        </div>
    `;
    
    // 显示模态框
    document.getElementById('modalRouteTitle').innerHTML = `<i class="fas fa-route"></i> ${route.name || '未命名路线'}`;
    document.getElementById('modalRouteContent').innerHTML = detailsHtml;
    document.getElementById('editRouteBtn').onclick = () => editRoute(routeId);
    document.getElementById('routeDetailsModal').style.display = 'block';
}

// 编辑路线
function editRoute(routeId) {
    // 跳转到主页面的DIY路线页面，并传递路线ID
    window.location.href = `index.html?editRoute=${routeId}`;
}

// 删除路线
function deleteRoute(routeId, routeName) {
    currentRouteId = routeId;
    document.getElementById('deleteRouteName').textContent = routeName || '未命名路线';
    document.getElementById('confirmDeleteBtn').onclick = () => confirmDelete(routeId);
    document.getElementById('deleteConfirmModal').style.display = 'block';
}

// 确认删除
function confirmDelete(routeId) {
    // 从本地存储中删除路线 - 使用严格相等比较确保类型匹配
    allRoutes = allRoutes.filter(route => route.id !== routeId && route.id != routeId);
    Utils.StorageUtils.setRoutes(allRoutes);
    
    // 更新派车单页面的路线选择框
    if (typeof updateRouteSelect === 'function') {
        updateRouteSelect();
    }
    
    // 刷新显示
    loadRoutes();
    closeDeleteModal();
    
    Utils.UIUtils.showSuccess('路线删除成功！');
}

// 刷新路线列表
function refreshRoutes() {
    loadRoutes();
    document.getElementById('routeSearch').value = '';
    alert('路线列表已刷新！');
}

// 创建新路线
function createNewRoute() {
    window.location.href = 'index.html';
}

// 关闭模态框
function closeModal() {
    document.getElementById('routeDetailsModal').style.display = 'none';
    currentRouteId = null;
}

// 关闭删除确认模态框
function closeDeleteModal() {
    document.getElementById('deleteConfirmModal').style.display = 'none';
    currentRouteId = null;
}

// 点击模态框外部关闭
window.onclick = function(event) {
    const detailsModal = document.getElementById('routeDetailsModal');
    const deleteModal = document.getElementById('deleteConfirmModal');
    
    if (event.target === detailsModal) {
        closeModal();
    }
    
    if (event.target === deleteModal) {
        closeDeleteModal();
    }
};

// 线路批量操作相关函数

// 全选/取消全选线路
function toggleSelectAll(type) {
    if (type === 'route') {
        const routeCheckboxes = document.querySelectorAll('.route-checkbox-input');
        const allChecked = Array.from(routeCheckboxes).every(checkbox => checkbox.checked);
        
        routeCheckboxes.forEach(checkbox => {
            checkbox.checked = !allChecked;
        });
        
        updateRouteBatchButtons();
    }
}

// 更新线路批量操作按钮状态
function updateRouteBatchButtons() {
    const routeCheckboxes = document.querySelectorAll('.route-checkbox-input');
    const checkedBoxes = document.querySelectorAll('.route-checkbox-input:checked');
    
    // 更新批量操作按钮状态
    const batchDeleteBtn = document.getElementById('batchDeleteRoutesBtn');
    const exportBtn = document.getElementById('exportRoutesBtn');
    
    if (batchDeleteBtn) {
        batchDeleteBtn.disabled = checkedBoxes.length === 0;
    }
    
    if (exportBtn) {
        exportBtn.disabled = checkedBoxes.length === 0;
    }
    
    // 更新全选按钮文本
    const toggleBtn = document.querySelector('.route-controls .btn-outline');
    if (toggleBtn) {
        const allChecked = routeCheckboxes.length > 0 && Array.from(routeCheckboxes).every(checkbox => checkbox.checked);
        toggleBtn.innerHTML = allChecked ? 
            '<i class="fas fa-square-check"></i> 取消全选' : 
            '<i class="fas fa-square"></i> 全选';
    }
}

// 批量删除线路
function batchDeleteRoutes() {
    const checkedBoxes = document.querySelectorAll('.route-checkbox-input:checked');
    
    if (checkedBoxes.length === 0) {
        alert('请选择要删除的线路');
        return;
    }
    
    if (confirm(`确定要删除选中的 ${checkedBoxes.length} 条线路吗？此操作不可恢复。`)) {
        const routeIds = Array.from(checkedBoxes).map(checkbox => checkbox.value);
        
        // 从数据中删除选中的线路 - 支持字符串和数字类型的ID
        allRoutes = allRoutes.filter(route => !routeIds.includes(String(route.id)) && !routeIds.includes(route.id));
        
        // 保存到本地存储
        Utils.StorageUtils.setRoutes(allRoutes);
        
        // 更新派车单页面的路线选择框
        if (typeof updateRouteSelect === 'function') {
            updateRouteSelect();
        }
        
        // 刷新显示
        loadRoutes();
        
        alert(`已删除 ${checkedBoxes.length} 条线路`);
    }
}

// 导出选中线路
function exportSelectedRoutes() {
    const checkedBoxes = document.querySelectorAll('.route-checkbox-input:checked');
    
    if (checkedBoxes.length === 0) {
        alert('请选择要导出的线路');
        return;
    }
    
    const routeIds = Array.from(checkedBoxes).map(checkbox => checkbox.value);
    const selectedRoutes = allRoutes.filter(route => routeIds.includes(String(route.id)) || routeIds.includes(route.id));
    
    // 准备导出数据 - 使用可导入的格式
    const exportData = selectedRoutes.map(route => {
        // 处理途经点信息
        let waypointsInfo = '';
        if (route.waypoints && route.waypoints.length > 0) {
            waypointsInfo = route.waypoints.map(wp => {
                return `${wp.customerName || ''}|${wp.customerAddress || ''}|${wp.customerContact || ''}|${wp.customerPhone || ''}`;
            }).join(';');
        }
        
        return {
            线路名称: route.name || '未命名路线',
            备注: route.notes || '',
            途经点信息: waypointsInfo,
            货物类型: route.cargoInfo?.type || '',
            货物重量: route.cargoInfo?.weight || '',
            货物体积: route.cargoInfo?.volume || '',
            货物件数: route.cargoInfo?.pieces || '',
            创建时间: route.createTime || ''
        };
    });
    
    // 转换为CSV格式
    const headers = ['线路名称', '备注', '途经点信息', '货物类型', '货物重量', '货物体积', '货物件数', '创建时间'];
    let csvContent = headers.join(',') + '\n';
    
    exportData.forEach(route => {
        const row = headers.map(header => {
            const value = route[header] || '';
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
    link.setAttribute('download', `线路列表_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert(`已导出 ${selectedRoutes.length} 条线路的信息`);
}