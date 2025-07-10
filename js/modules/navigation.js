// 导航相关功能模块
// 导航状态管理
let currentSection = 'dashboard';

// 获取当前显示的页面ID
function getCurrentSection() {
    return currentSection;
}

// 导航设置 - 优化版本
function setupNavigation() {
    // 初始化页面显示
    showContent(CONTENT_SECTIONS.dashboard);

    // 使用事件委托优化侧边栏导航事件
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.addEventListener('click', function(e) {
            const navItem = e.target.closest('.nav-item');
            if (!navItem) return;

            e.preventDefault();

            // 移除所有导航项的active类
            const navItems = sidebar.querySelectorAll('.nav-item');
            navItems.forEach(nav => nav.classList.remove('active'));
            // 为当前点击的导航项添加active类
            navItem.classList.add('active');

            // 同步更新顶部导航的active状态
            const text = navItem.textContent.trim();
            updateTopNavigation(text);

            // 根据点击的导航项显示相应内容
            if (text.includes('总览')) {
                showOverviewDashboard();
            } else if (text.includes('订单管理') || text.includes('货物追踪')) {
                showOrderManagement();
            } else if (text.includes('创建派车单')) {
                showDispatchForm();
            } else if (text.includes('历史派车单')) {
                showOrderManagement();
            }
        });
    }
}

// 更新顶部导航状态
function updateTopNavigation(sidebarText) {
    const topNavLinks = document.querySelectorAll('.nav-links a');
    topNavLinks.forEach(link => {
        const linkText = link.textContent.trim();
        if (
            (sidebarText.includes('总览') && linkText === '货运管理') ||
            (sidebarText.includes('订单管理') && linkText === '货运管理') ||
            (sidebarText.includes('创建派车单') && linkText === 'DIY路线')
        ) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// 客户列表相关变量
let currentCustomerPageSize = 10;
let currentCustomerPage = 1;
const customersPerPage = 10;
let filteredCustomers = [];
let currentSelectionType = ''; // 'startPoint' 或 'waypoint'
let currentWaypointId = '';



// 显示客户选择模态框
function showCustomerListModal(type, waypointId = null) {
    currentSelectionType = type;
    currentWaypointId = waypointId;

    const modal = document.getElementById('customerSelectionModal');
    modal.style.display = 'flex';

    loadCustomerSelectionList();
}

// 关闭客户选择模态框
function closeCustomerSelectionModal() {
    const modal = document.getElementById('customerSelectionModal');
    modal.style.display = 'none';
    document.getElementById('customerSelectionSearch').value = '';
}

// 加载客户选择列表
function loadCustomerSelectionList() {
    let customers = [];

    // 优先使用DataManager获取客户数据
    if (window.dataManager) {
        customers = window.dataManager.getCustomers();
    } else {
        // 降级到直接访问localStorage
        try {
            const customersArray = JSON.parse(localStorage.getItem('customers') || '[]');
            if (customersArray.length > 0) {
                customers = customersArray;
            } else {
                const customerData = JSON.parse(localStorage.getItem('customerData') || '{}');
                customers = Object.entries(customerData).map(([id, data]) => ({
                    id,
                    name: data.name || `客户${id}`,
                    contact: data.contact || '',
                    phone: data.phone || '',
                    address: data.address || '',
                    ...data
                }));
            }
        } catch (error) {
            console.error('加载客户选择列表失败:', error);
            customers = [];
        }
    }

    renderCustomerSelectionList(customers);
}

// 渲染客户选择列表
function renderCustomerSelectionList(customers) {
    const container = document.getElementById('customerSelectionList');
    container.innerHTML = '';

    if (customers.length === 0) {
        return;
    }

    customers.forEach(customer => {
        const customerDiv = document.createElement('div');
        customerDiv.className = 'customer-selection-item';
        customerDiv.innerHTML = `
            <div class="customer-info">
                <div class="customer-name">${customer.name || customer.pickupFactory || ''}</div>
                <div class="customer-details">
                    <span class="customer-contact">${customer.contact || customer.pickupContact || ''}</span>
                    <span class="customer-address">${customer.address || customer.pickupAddress || ''}</span>
                </div>
            </div>
            <div class="customer-actions">
                <button class="btn btn-sm btn-accent" onclick="selectCustomerFromModal('${customer.id}')">
                    选择
                </button>
            </div>
        `;
        container.appendChild(customerDiv);
    });
}

// 从模态框选择客户
function selectCustomerFromModal(customerId) {
    let customers = [];

    // 优先使用DataManager获取客户数据
    if (window.dataManager) {
        customers = window.dataManager.getCustomers();
    } else {
        // 降级到直接访问localStorage
        try {
            const customersArray = JSON.parse(localStorage.getItem('customers') || '[]');
            if (customersArray.length > 0) {
                customers = customersArray;
            } else {
                const customerData = JSON.parse(localStorage.getItem('customerData') || '{}');
                customers = Object.entries(customerData).map(([id, data]) => ({
                    id: id,
                    name: data.name,
                    contact: data.contact,
                    phone: data.phone,
                    address: data.address
                }));
            }
        } catch (error) {
            console.error('从模态框选择客户失败:', error);
            customers = [];
        }
    }

    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    // 根据选择类型填充不同的表单字段
    if (currentSelectionType === 'pickup') {
        fillPickupInfo(customer);
    } else if (currentSelectionType === 'logistics') {
        fillLogisticsInfo(customer);
    } else if (currentSelectionType === 'delivery') {
        fillDeliveryInfo(customer);
    } else if (currentSelectionType === 'waypoint') {
        if (currentWaypointId) {
            const select = document.getElementById(`waypointCustomer_${currentWaypointId}`);
            if (select) {
                select.value = customerId;
                selectWaypointCustomer(currentWaypointId);
            }
        } else {
            addWaypointFromCustomer(customer);
        }
    }

    closeCustomerSelectionModal();
}

// 填充提货信息
function fillPickupInfo(customer) {
    const pickupFactory = document.getElementById('pickupFactory');
    const pickupContact = document.getElementById('pickupContact');
    const pickupAddress = document.getElementById('pickupAddress');

    if (pickupFactory) pickupFactory.value = customer.name || '';
    if (pickupContact) pickupContact.value = customer.contact || '';
    if (pickupAddress) pickupAddress.value = customer.address || '';
}

// 填充物流园信息
function fillLogisticsInfo(customer) {
    console.log('fillLogisticsInfo', customer);
    const parkName = document.getElementById('parkName');
    const parkContact = document.getElementById('parkContact');
    const parkAddress = document.getElementById('parkAddress');

    if (parkName) parkName.value = customer.name || '';
    if (parkContact) parkContact.value = customer.contact || '';
    if (parkAddress) parkAddress.value = customer.address || '';
}

// 填充送货信息
function fillDeliveryInfo(customer) {
    const deliveryFactory = document.getElementById('deliveryFactory');
    const deliveryContact = document.getElementById('deliveryContact');
    const deliveryAddress = document.getElementById('deliveryAddress');

    if (deliveryFactory) deliveryFactory.value = customer.name || '';
    if (deliveryContact) deliveryContact.value = customer.contact || '';
    if (deliveryAddress) deliveryAddress.value = customer.address || '';
}

// 从客户信息添加途经点
function addWaypointFromCustomer(customer, waypointId = null) {
    const container = document.getElementById('waypointsContainer');
    const waypointCount = container.children.length + 1;
    const finalWaypointId = waypointId || `waypoint_${Date.now()}_${waypointCount}`;

    const waypointDiv = document.createElement('div');
    waypointDiv.className = 'waypoint-item';
    waypointDiv.setAttribute('data-waypoint-id', finalWaypointId);
    waypointDiv.innerHTML = `
        <div class="form-group">
            <div class="form-row">
                <div class="form-col">
                    <label><i class="fas fa-map-pin"></i> 途经点 ${waypointCount}</label>
                    <div class="customer-select-group">
                        <select id="waypointCustomer_${finalWaypointId}" class="form-control waypoint-customer-select" onchange="selectWaypointCustomer('${finalWaypointId}')">
                            <option value="">请选择客户作为途经点</option>
                        </select>
                        <button type="button" class="btn btn-sm btn-outline" onclick="showCustomerListModal('waypoint', '${finalWaypointId}')">
                            <i class="fas fa-list"></i> 客户列表
                        </button>
                    </div>
                </div>
                <div class="form-col-auto">
                    <button type="button" class="btn btn-sm btn-danger" onclick="removeWaypoint(this)">
                        <i class="fas fa-trash"></i> 删除
                    </button>
                </div>
            </div>
            <!-- 途经点客户信息显示 -->
            <div id="waypointCustomerInfo_${finalWaypointId}" class="customer-info-display" style="display: block;">
                <div class="customer-info-card">
                    <h4><i class="fas fa-info-circle"></i> 途经点客户信息</h4>
                    <div class="customer-details">
                        <p><strong>名称：</strong><span id="waypointCustomerName_${finalWaypointId}">${customer.name || ''}</span></p>
                        <p><strong>联系人：</strong><span id="waypointCustomerContact_${finalWaypointId}">${customer.contact || ''}</span></p>
                        <p><strong>联系电话：</strong><span id="waypointCustomerPhone_${finalWaypointId}">${customer.phone || ''}</span></p>
                        <p><strong>地址：</strong><span id="waypointCustomerAddress_${finalWaypointId}">${customer.address || ''}</span></p>
                    </div>
                </div>
            </div>
        </div>
    `;

    container.appendChild(waypointDiv);

    // 为新添加的途经点加载客户数据并设置选中的客户
    loadCustomersToWaypointSelect(finalWaypointId);
    setTimeout(() => {
        const select = document.getElementById(`waypointCustomer_${finalWaypointId}`);
        if (select) {
            select.value = customer.id;
        }
    }, 100);
}

// 过滤客户选择列表
function filterCustomerSelection() {
    const searchTerm = document.getElementById('customerSelectionSearch').value.toLowerCase();

    let customers = [];

    // 优先使用DataManager获取客户数据
    if (window.dataManager) {
        customers = window.dataManager.getCustomers();
    } else {
        // 降级到直接访问localStorage
        try {
            const customersArray = JSON.parse(localStorage.getItem('customers') || '[]');
            if (customersArray.length > 0) {
                customers = customersArray;
            } else {
                const customerData = JSON.parse(localStorage.getItem('customerData') || '{}');
                customers = Object.entries(customerData).map(([id, data]) => ({
                    id,
                    name: data.name || `客户${id}`,
                    contact: data.contact || '',
                    phone: data.phone || '',
                    address: data.address || '',
                    ...data
                }));
            }
        } catch (error) {
            console.error('获取客户数据失败:', error);
            customers = [];
        }
    }

    const filteredCustomers = customers.filter(customer => {
        const name = (customer.name || '').toLowerCase();
        const contact = (customer.contact || '').toLowerCase();
        const address = (customer.address || '').toLowerCase();

        return name.includes(searchTerm) || contact.includes(searchTerm) || address.includes(searchTerm);
    });

    renderCustomerSelectionList(filteredCustomers);
}

// 为途经点加载客户数据到下拉框
function loadCustomersToWaypointSelect(waypointId) {
    const select = document.getElementById(`waypointCustomer_${waypointId}`);
    if (!select) return;

    // 清空现有选项（保留第一个默认选项）
    while (select.options.length > 1) {
        select.remove(1);
    }

    // 优先使用DataManager获取客户数据
    let customers = [];
    if (window.dataManager && typeof window.dataManager.getCustomers === 'function') {
        customers = window.dataManager.getCustomers();
    } else {
        // 降级到直接从localStorage获取
        try {
            const customersArray = JSON.parse(localStorage.getItem('customers') || '[]');
            if (customersArray.length > 0) {
                customers = customersArray;
            } else {
                // 如果没有数组格式，尝试从对象格式加载
                const customerData = JSON.parse(localStorage.getItem('customerData') || '{}');
                customers = Object.entries(customerData).map(([id, data]) => ({
                    id,
                    name: data.name || `客户${id}`,
                    contact: data.contact || '',
                    address: data.address || '',
                    ...data
                }));
            }
        } catch (error) {
            console.error('加载客户数据失败:', error);
        }
    }

    // 添加客户到下拉框
    customers.forEach(customer => {
        const option = document.createElement('option');
        option.value = customer.id;
        option.textContent = customer.name || `客户${customer.id}`;
        select.appendChild(option);
    });
}

// 从下拉框选择途经点客户
function selectWaypointCustomer(waypointId) {
    const select = document.getElementById(`waypointCustomer_${waypointId}`);
    const selectedId = select.value;

    if (!selectedId) {
        // 隐藏客户信息
        const customerInfo = document.getElementById(`waypointCustomerInfo_${waypointId}`);
        if (customerInfo) {
            customerInfo.style.display = 'none';
        }
        return;
    }

    // 获取客户数据
    let customers = [];
    if (window.dataManager && typeof window.dataManager.getCustomers === 'function') {
        customers = window.dataManager.getCustomers();
    } else {
        // 降级到直接从localStorage获取
        try {
            const customersArray = JSON.parse(localStorage.getItem('customers') || '[]');
            if (customersArray.length > 0) {
                customers = customersArray;
            } else {
                const customerData = JSON.parse(localStorage.getItem('customerData') || '{}');
                customers = Object.entries(customerData).map(([id, data]) => ({
                    id,
                    name: data.pickupFactory || `客户${id}`,
                    contact: data.pickupContact || '',
                    phone: data.pickupContact ? data.pickupContact.match(/\((\d+)\)/)?.[1] || '' : '',
                    address: data.pickupAddress || '',
                    ...data
                }));
            }
        } catch (error) {
            console.error('获取客户数据失败:', error);
        }
    }

    const customer = customers.find(c => c.id === selectedId);
    if (customer) {
        // 显示客户信息
        const customerInfo = document.getElementById(`waypointCustomerInfo_${waypointId}`);
        if (customerInfo) {
            document.getElementById(`waypointCustomerName_${waypointId}`).textContent = customer.name || '';
            document.getElementById(`waypointCustomerContact_${waypointId}`).textContent = customer.contact || '';
            document.getElementById(`waypointCustomerPhone_${waypointId}`).textContent = customer.phone || '';
            document.getElementById(`waypointCustomerAddress_${waypointId}`).textContent = customer.address || '';
            customerInfo.style.display = 'block';
        }
    }
}

// 显示客户列表
function showCustomerList() {
    showContent(CONTENT_SECTIONS.customerList);
    loadCustomerData();
    setupCustomerListFeatures();
}

// 显示DIY路线页面
function showDIYRoute() {
    showContent(CONTENT_SECTIONS.diyRoute);
    setupDIYRouteFeatures();
}

// 设置DIY路线功能
function setupDIYRouteFeatures() {
    // 初始化路线表单
    clearRouteForm();

    // 检查URL参数，如果有editRoute参数则加载对应路线进行编辑
    const urlParams = new URLSearchParams(window.location.search);
    const editRouteId = urlParams.get('editRoute');
    if (editRouteId) {
        loadRouteForEdit(editRouteId);
        // 清除URL参数
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

// 添加途经点
function addWaypoint() {
    const container = document.getElementById('waypointsContainer');
    const waypointCount = container.children.length + 1;
    const waypointId = `waypoint_${Date.now()}_${waypointCount}`;

    const waypointDiv = document.createElement('div');
    waypointDiv.className = 'waypoint-item';
    waypointDiv.setAttribute('data-waypoint-id', waypointId);
    waypointDiv.innerHTML = `
        <div class="form-group">
            <div class="form-row">
                <div class="form-col">
                    <label><i class="fas fa-map-pin"></i> 途经点 ${waypointCount}</label>
                    <div class="customer-select-group">
                        <select id="waypointCustomer_${waypointId}" class="form-control waypoint-customer-select" onchange="selectWaypointCustomer('${waypointId}')">
                            <option value="">请选择客户作为途经点</option>
                        </select>
                        <button type="button" class="btn btn-sm btn-outline" onclick="showCustomerListModal('waypoint', '${waypointId}')">
                            <i class="fas fa-list"></i> 客户列表
                        </button>
                    </div>
                </div>
                <div class="form-col-auto">
                    <button type="button" class="btn btn-sm btn-danger" onclick="removeWaypoint(this)">
                        <i class="fas fa-trash"></i> 删除
                    </button>
                </div>
            </div>
            <!-- 途经点客户信息显示 -->
            <div id="waypointCustomerInfo_${waypointId}" class="customer-info-display" style="display: none;">
                <div class="customer-info-card">
                    <h4><i class="fas fa-info-circle"></i> 途经点客户信息</h4>
                    <div class="customer-details">
                        <p><strong>名称：</strong><span id="waypointCustomerName_${waypointId}"></span></p>
                        <p><strong>联系人：</strong><span id="waypointCustomerContact_${waypointId}"></span></p>
                        <p><strong>联系电话：</strong><span id="waypointCustomerPhone_${waypointId}"></span></p>
                        <p><strong>地址：</strong><span id="waypointCustomerAddress_${waypointId}"></span></p>
                    </div>
                </div>
            </div>
        </div>
    `;

    container.appendChild(waypointDiv);

    // 为新添加的途经点加载客户数据
    loadCustomersToWaypointSelect(waypointId);
}

// 删除途经点
function removeWaypoint(button) {
    const waypointItem = button.closest('.waypoint-item');
    waypointItem.remove();

    // 重新编号剩余的途经点
    updateWaypointNumbers();
}

// 更新途经点编号
function updateWaypointNumbers() {
    const container = document.getElementById('waypointsContainer');
    const waypoints = container.querySelectorAll('.waypoint-item');
    waypoints.forEach((waypoint, index) => {
        const label = waypoint.querySelector('label');
        label.innerHTML = `<i class="fas fa-map-pin"></i> 途经点 ${index + 1}`;
    });
}

// 保存路线
function saveRoute() {
    const waypoints = getWaypoints();
    const cargoInfo = getCargoInfo();

    // 获取基本信息字段
    const shipmentEl = document.getElementById('po');
    const poEl = document.getElementById('cw1no');
    const transportTeamEl = document.getElementById('transportTeam');
    const vehicleTypeEl = document.getElementById('vehicleType');

    const routeData = {
        id: Date.now(),
        name: document.getElementById('routeName').value,
        waypoints: waypoints,
        cargoInfo: cargoInfo,
        notes: document.getElementById('routeNotes').value,
        // 新增基本信息字段
        shipment: shipmentEl ? shipmentEl.value : '',
        po: poEl ? poEl.value : '',
        transportTeam: transportTeamEl ? transportTeamEl.value : '',
        vehicleType: vehicleTypeEl ? vehicleTypeEl.value : '',
        createTime: new Date().toISOString()
    };

    // 验证必填字段
    if (!routeData.name) {
        alert('请填写路线名称！');
        return;
    }

    if (waypoints.length === 0) {
        alert('请至少添加一个途经点！');
        return;
    }

    // 保存到本地存储
    let routes = Utils.StorageUtils.getRoutes();
    routes.unshift(routeData); // 使用unshift将新路线添加到数组开头
    Utils.StorageUtils.setRoutes(routes);

    // 更新派车单页面的路线选择框
    if (typeof updateRouteSelect === 'function') {
        updateRouteSelect();
    }

    alert('路线保存成功！');
    clearRouteForm();
}

// 获取货物信息
function getCargoInfo() {
    return {
        type: document.getElementById('routeCargoType').value || '',
        weight: document.getElementById('routeCargoWeight').value || '',
        volume: document.getElementById('routeCargoVolume').value || '',
        pieces: document.getElementById('routeCargoPieces').value || ''
    };
}

// 获取所有途经点
function getWaypoints() {
    const waypointItems = document.querySelectorAll('.waypoint-item');
    const waypoints = [];

    waypointItems.forEach(item => {
        const waypointId = item.getAttribute('data-waypoint-id');
        const select = document.getElementById(`waypointCustomer_${waypointId}`);

        if (select && select.value) {
            // 获取选中的客户信息
            const customerName = document.getElementById(`waypointCustomerName_${waypointId}`)?.textContent || '';
            const customerAddress = document.getElementById(`waypointCustomerAddress_${waypointId}`)?.textContent || '';
            const customerContact = document.getElementById(`waypointCustomerContact_${waypointId}`)?.textContent || '';
            const customerPhone = document.getElementById(`waypointCustomerPhone_${waypointId}`)?.textContent || '';

            waypoints.push({
                customerId: select.value,
                customerName: customerName,
                customerAddress: customerAddress,
                customerContact: customerContact,
                customerPhone: customerPhone
            });
        }
    });

    return waypoints;
}

// 预览路线
function previewRoute() {
    const routeName = document.getElementById('routeName').value;
    const waypoints = getWaypoints();
    const cargoInfo = getCargoInfo();

    if (waypoints.length === 0) {
        alert('请先添加途经点！');
        return;
    }

    let previewText = `路线预览：\n`;
    previewText += `路线名称：${routeName || '未命名路线'}\n`;

    if (waypoints.length > 0) {
        previewText += `途经点：\n`;
        waypoints.forEach((waypoint, index) => {
            previewText += `  ${index + 1}. ${waypoint.customerName}`;
            if (waypoint.customerAddress) {
                previewText += ` (${waypoint.customerAddress})`;
            }
            previewText += `\n`;
        });
    }

    // 添加货物信息预览
    if (cargoInfo.type || cargoInfo.weight || cargoInfo.volume || cargoInfo.pieces) {
        previewText += `\n货物信息：\n`;
        if (cargoInfo.type) previewText += `  类型：${cargoInfo.type}\n`;
        if (cargoInfo.weight) previewText += `  重量：${cargoInfo.weight} KG\n`;
        if (cargoInfo.volume) previewText += `  体积：${cargoInfo.volume} m³\n`;
        if (cargoInfo.pieces) previewText += `  件数：${cargoInfo.pieces} 件\n`;
    }

    alert(previewText);
}

// 清空路线表单
function clearRouteForm() {
    document.getElementById('routeName').value = '';
    document.getElementById('routeNotes').value = '';

    // 清空货物信息
    document.getElementById('routeCargoType').value = '';
    document.getElementById('routeCargoWeight').value = '';
    document.getElementById('routeCargoVolume').value = '';
    document.getElementById('routeCargoPieces').value = '';

    // 清空所有途经点
    const container = document.getElementById('waypointsContainer');
    container.innerHTML = '';
}

// 页面内容区域的类名
const CONTENT_SECTIONS = {
    dashboard: 'dashboard-overview',
    overview: 'overview-dashboard',
    orders: 'order-management',
    dispatch: 'dispatch-form',
    diyRoute: 'diy-route',
    customerList: 'customer-list'
};

// 显示指定的内容区域
function showContent(sectionId) {
    // 获取所有内容区域
    const sections = Object.values(CONTENT_SECTIONS);

    // 更新当前页面状态
    currentSection = Object.entries(CONTENT_SECTIONS).find(([key, value]) => value === sectionId)?.[0] || 'dashboard';

    // 先将所有区域隐藏并移除动画类
    sections.forEach(id => {
        const section = document.getElementById(id);
        if (section) {
            section.style.opacity = '0';
            section.style.transform = 'translateX(-20px)';
            setTimeout(() => {
                section.style.display = 'none';
            }, 100);
        }
    });

    // 显示目标区域并添加动画
    setTimeout(() => {
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.style.display = 'block';
            setTimeout(() => {
                targetSection.style.opacity = '1';
                targetSection.style.transform = 'translateX(0)';
            }, 50);
        }

        // 触发导航变更事件
        const navChangedEvent = new CustomEvent('navChanged', {
            detail: {
                target: sectionId,
                previousSection: currentSection
            }
        });
        document.dispatchEvent(navChangedEvent);
        console.log(`已触发navChanged事件，目标页面: ${sectionId}`);

        // 订单管理页面特殊处理
        if (sectionId === 'order-management') {
            console.log('切换到订单管理页面，加载订单数据...');

            // 延迟加载订单数据，确保DOM已完全渲染
            setTimeout(async () => {
                    // 确保订单管理器已初始化
                    if (window.orderManager) {
                        await window.orderManager.loadOrdersTable();
                    } else if (typeof loadOrdersTable === 'function') {
                        await loadOrdersTable();
                    } else {
                        console.error('订单管理器未初始化');
                    }
                }, 200); // 增加延迟时间到200ms
        }
    }, 150); // 增加外层延迟时间到150ms
}

// 加载客户数据
function loadCustomerData() {
    let customers = [];

    // 优先使用DataManager获取客户数据
    if (window.dataManager) {
        customers = window.dataManager.getCustomers();
    } else {
        // 降级到直接访问localStorage
        try {
            // 首先尝试从 'customers' 键加载（数组格式）
            const customersArray = JSON.parse(localStorage.getItem('customers') || '[]');
            if (customersArray.length > 0) {
                customers = customersArray;
            } else {
                // 如果没有数组格式，尝试从 'customerData' 键加载（对象格式）
                const customerData = JSON.parse(localStorage.getItem('customerData') || '{}');
                customers = Object.entries(customerData).map(([id, data]) => ({
                    id,
                    ...data,
                    addTime: data.addTime || new Date().toLocaleDateString()
                }));

                // 按添加时间降序排序，新增的客户显示在最上面
                customers.sort((a, b) => {
                    const timeA = new Date(a.addTime).getTime();
                    const timeB = new Date(b.addTime).getTime();
                    return timeB - timeA; // 降序排序，最新的在前面
                });
            }
        } catch (error) {
            console.error('加载客户数据失败:', error);
            customers = [];
        }
    }

    renderCustomerList(customers);
}

// 设置客户列表功能
function setupCustomerListFeatures() {
    setupCustomerSearch();
    setupSortingAndPagination();
}

// 渲染客户列表（表格或卡片视图）
function renderCustomerList(customers) {
    const filteredAndSortedCustomers = getFilteredAndSortedCustomers(customers);

    renderCustomerTable(filteredAndSortedCustomers);

    updateCustomerPagination(filteredAndSortedCustomers.length);
}

// 获取过滤后的客户数据
function getFilteredAndSortedCustomers(customers) {
    const searchTerm = document.getElementById('customerSearch')?.value.toLowerCase() || '';
    const filterType = document.getElementById('customerStatusFilter')?.value || '';

    // 过滤
    let filteredCustomers = customers.filter(customer => {
        const matchesSearch = !searchTerm ||
            (customer.name && customer.name.toLowerCase().includes(searchTerm)) ||
            (customer.contact && customer.contact.toLowerCase().includes(searchTerm)) ||
            (customer.phone && customer.phone.includes(searchTerm)) ||
            (customer.address && customer.address.toLowerCase().includes(searchTerm));

        const matchesStatus = !filterType || customer.status === filterType;

        return matchesSearch && matchesStatus;
    });

    // 按添加时间降序排序，最新添加的客户显示在最顶部
    filteredCustomers.sort((a, b) => {
        const timeA = new Date(a.addTime || 0);
        const timeB = new Date(b.addTime || 0);
        return timeB - timeA;
    });

    return filteredCustomers;
}

// 渲染客户表格
function renderCustomerTable(customers) {
    const tableContainer = document.querySelector('.table-view-container');
    const cardContainer = document.querySelector('.card-view-container');

    if (tableContainer) tableContainer.style.display = 'block';
    if (cardContainer) cardContainer.style.display = 'none';

    const tableBody = document.getElementById('customerTableBody');
    if (!tableBody) return;

    const startIndex = (currentCustomerPage - 1) * currentCustomerPageSize;
    const endIndex = startIndex + currentCustomerPageSize;
    const pageCustomers = customers.slice(startIndex, endIndex);

    tableBody.innerHTML = '';

    if (pageCustomers.length === 0) {
        return;
    }

    pageCustomers.forEach(customer => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="width: 40px; text-align: center;">
                <input type="checkbox" class="customer-checkbox" value="${customer.id}" onchange="updateCustomerBatchButtons()">
            </td>
            <td>
                <div class="customer-name">${customer.name}</div>
                <div class="customer-id">#${customer.id}</div>
            </td>
            <td>${customer.contact}</td>
            <td>
                <div class="phone-number">${customer.phone}</div>
            </td>
            <td>
                <div class="address-text">${customer.address || '未填写'}</div>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-outline" onclick="viewCustomerDetail('${customer.id}')" title="查看详情">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-accent" onclick="editCustomer('${customer.id}')" title="编辑">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteCustomer('${customer.id}')" title="删除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // 更新批量操作按钮状态
    if (typeof updateCustomerBatchButtons === 'function') {
        updateCustomerBatchButtons();
    }
}







// 设置分页
function setupSortingAndPagination() {
    // 分页功能保留，排序功能已移除
}

// 设置客户搜索功能
function setupCustomerSearch() {
    const searchInput = document.getElementById('customerSearch');
    const statusFilter = document.getElementById('customerStatusFilter');
    const clearBtn = document.querySelector('.search-clear-btn');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentCustomerPage = 1;
            loadCustomerData();

            // 显示/隐藏清除按钮
            if (clearBtn) {
                clearBtn.style.display = e.target.value ? 'block' : 'none';
            }
        });
    }

    if (statusFilter) {
        statusFilter.addEventListener('change', () => {
            currentCustomerPage = 1;
            loadCustomerData();
        });
    }
}

// 筛选客户（保留原有函数以兼容）
function filterCustomers() {
    currentCustomerPage = 1;
    loadCustomerData();
}

// 加载客户列表数据（保留原有函数以兼容）
function loadCustomerListData() {
    loadCustomerData();
}

// 清除客户搜索
function clearCustomerSearch() {
    const searchInput = document.getElementById('customerSearch');
    if (searchInput) {
        searchInput.value = '';
        currentCustomerPage = 1;
        loadCustomerData();

        // 隐藏清除按钮
        const clearBtn = document.querySelector('.search-clear-btn');
        if (clearBtn) {
            clearBtn.style.display = 'none';
        }
    }
}







// 跳转到客户最后一页
function goToCustomerLastPage() {
    let customers = [];

    // 优先使用DataManager获取客户数据
    if (window.dataManager) {
        customers = window.dataManager.getCustomers();
    } else {
        // 降级到直接访问localStorage
        try {
            const customersArray = JSON.parse(localStorage.getItem('customers') || '[]');
            if (customersArray.length > 0) {
                customers = customersArray;
            } else {
                const customerData = JSON.parse(localStorage.getItem('customerData') || '{}');
                customers = Object.entries(customerData).map(([id, data]) => ({
                    id,
                    ...data,
                    addTime: data.addTime || new Date().toLocaleDateString()
                }));
            }
        } catch (error) {
            console.error('获取客户数据失败:', error);
            customers = [];
        }
    }

    const filteredCustomers = getFilteredAndSortedCustomers(customers);
    const totalPages = Math.ceil(filteredCustomers.length / currentCustomerPageSize);

    if (totalPages > 0) {
        currentCustomerPage = totalPages;
        loadCustomerData();
    }
}

// 查看客户详情
function viewCustomerDetail(customerId) {
    let customers = [];

    // 优先使用DataManager获取客户数据
    if (window.dataManager) {
        customers = window.dataManager.getCustomers();
    } else {
        // 降级到直接访问localStorage
        try {
            const customerData = JSON.parse(localStorage.getItem('customerData') || '{}');
            customers = Object.entries(customerData).map(([id, data]) => ({ id, ...data }));
        } catch (error) {
            console.error('获取客户详情失败:', error);
            return;
        }
    }

    const customer = customers.find(c => c.id === customerId);

    if (customer) {
        // 填充客户详情模态框
        document.getElementById('detailCustomerName').textContent = customer.name || '';
        document.getElementById('detailCustomerAddress').textContent = customer.address || '';
        document.getElementById('detailCustomerContact').textContent = customer.contact || '';
        document.getElementById('detailCustomerPhone').textContent = customer.phone || '';

        // 显示模态框
        const modal = document.getElementById('customerDetailsModal');
        if (modal) {
            modal.style.display = 'block';
        }
    }
}

// 编辑客户功能已移至customer.js模块

// 删除客户
function deleteCustomer(customerId) {
    if (confirm('确定要删除这个客户吗？')) {
        // 优先使用DataManager删除客户数据
        if (window.dataManager) {
            const customers = window.dataManager.getCustomers();
            const updatedCustomers = customers.filter(c => c.id !== customerId);
            window.dataManager.setCustomers(updatedCustomers);
        } else {
            // 降级到直接访问localStorage
            try {
                const customerData = JSON.parse(localStorage.getItem('customerData') || '{}');
                delete customerData[customerId];
                localStorage.setItem('customerData', JSON.stringify(customerData));
            } catch (error) {
                console.error('删除客户失败:', error);
                return;
            }
        }

        // 重新加载客户数据
        loadCustomerData();

        // 更新客户下拉选择
        if (window.updateCustomerDropdown) {
            window.updateCustomerDropdown();
        }
    }
}

// 关闭客户详情
function closeCustomerDetails() {
    const modal = document.getElementById('customerDetailsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 更新客户分页信息
function updateCustomerPagination(totalCustomers) {
    const totalPages = Math.ceil(totalCustomers / currentCustomerPageSize);
    const paginationContainer = document.querySelector('.enhanced-pagination-container');

    if (!paginationContainer) return;

    // 更新分页信息
    const paginationInfo = paginationContainer.querySelector('.pagination-info');
    if (paginationInfo) {
        const startIndex = totalCustomers > 0 ? (currentCustomerPage - 1) * currentCustomerPageSize + 1 : 0;
        const endIndex = Math.min(currentCustomerPage * currentCustomerPageSize, totalCustomers);
        paginationInfo.textContent = `显示 ${startIndex}-${endIndex} 条，共 ${totalCustomers} 条`;
    }



    // 更新分页控制按钮
    updatePaginationControls(totalPages);
}

// 更新分页控制按钮
function updatePaginationControls(totalPages) {
    const paginationControls = document.querySelector('.pagination-controls');
    if (!paginationControls) return;

    // 清空现有控件
    paginationControls.innerHTML = '';

    // 首页按钮
    const firstBtn = createPaginationButton('首页', () => goToCustomerPage(1), currentCustomerPage <= 1);
    paginationControls.appendChild(firstBtn);

    // 上一页按钮
    const prevBtn = createPaginationButton('上一页', () => changeCustomerPage('prev'), currentCustomerPage <= 1);
    paginationControls.appendChild(prevBtn);

    // 页码按钮
    const pageNumbersContainer = document.createElement('div');
    pageNumbersContainer.className = 'page-numbers';

    const startPage = Math.max(1, currentCustomerPage - 2);
    const endPage = Math.min(totalPages, currentCustomerPage + 2);

    // 如果不是从第1页开始，显示省略号
    if (startPage > 1) {
        const firstPageBtn = createPageNumberButton(1, () => goToCustomerPage(1), false);
        pageNumbersContainer.appendChild(firstPageBtn);

        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.className = 'page-ellipsis';
            pageNumbersContainer.appendChild(ellipsis);
        }
    }

    // 显示当前页面附近的页码
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = createPageNumberButton(i, () => goToCustomerPage(i), i === currentCustomerPage);
        pageNumbersContainer.appendChild(pageBtn);
    }

    // 如果不是到最后一页，显示省略号
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.className = 'page-ellipsis';
            pageNumbersContainer.appendChild(ellipsis);
        }

        const lastPageBtn = createPageNumberButton(totalPages, () => goToCustomerPage(totalPages), false);
        pageNumbersContainer.appendChild(lastPageBtn);
    }

    paginationControls.appendChild(pageNumbersContainer);

    // 下一页按钮
    const nextBtn = createPaginationButton('下一页', () => changeCustomerPage('next'), currentCustomerPage >= totalPages);
    paginationControls.appendChild(nextBtn);

    // 末页按钮
    const lastBtn = createPaginationButton('末页', () => goToCustomerPage(totalPages), currentCustomerPage >= totalPages);
    paginationControls.appendChild(lastBtn);
}

// 创建分页按钮
function createPaginationButton(text, onClick, disabled = false) {
    const button = document.createElement('button');
    button.className = 'btn btn-sm btn-outline';
    button.textContent = text;
    button.disabled = disabled;
    if (!disabled) {
        button.addEventListener('click', onClick);
    }
    return button;
}

// 创建页码按钮
function createPageNumberButton(pageNumber, onClick, isActive = false) {
    const button = document.createElement('button');
    button.className = `page-number-btn ${isActive ? 'active' : ''}`;
    button.textContent = pageNumber;
    if (!isActive) {
        button.addEventListener('click', onClick);
    }
    return button;
}

// 跳转到指定页面
function goToCustomerPage(page) {
    currentCustomerPage = page;
    loadCustomerData();
}

// 切换客户页面
function changeCustomerPage(direction) {
    let customers = [];

    // 优先使用DataManager获取客户数据
    if (window.dataManager) {
        customers = window.dataManager.getCustomers();
    } else {
        // 降级到直接访问localStorage
        try {
            const customersArray = JSON.parse(localStorage.getItem('customers') || '[]');
            if (customersArray.length > 0) {
                customers = customersArray;
            } else {
                const customerData = JSON.parse(localStorage.getItem('customerData') || '{}');
                customers = Object.entries(customerData).map(([id, data]) => ({
                    id,
                    ...data,
                    addTime: data.addTime || new Date().toLocaleDateString()
                }));
            }
        } catch (error) {
            console.error('获取客户数据失败:', error);
            customers = [];
        }
    }

    const filteredCustomers = getFilteredAndSortedCustomers(customers);
    const totalPages = Math.ceil(filteredCustomers.length / currentCustomerPageSize);

    if (direction === 'prev' && currentCustomerPage > 1) {
        currentCustomerPage--;
    } else if (direction === 'next' && currentCustomerPage < totalPages) {
        currentCustomerPage++;
    }

    loadCustomerData();
}

// 显示运营总览 - 优化版本
// 运营总览功能已移除

// 显示订单管理 - 优化版本
function showOverviewDashboard() {
    showContent(CONTENT_SECTIONS.overview);

    // 加载总览数据
    loadOverviewData();

    // 隐藏订单列表区域
    document.getElementById('overview-orders-section').style.display = 'none';
}

function loadOverviewData() {
    // 获取订单数据
    let orders = [];

    if (window.dataManager) {
        orders = window.dataManager.getOrders();
    } else {
        const storedOrders = localStorage.getItem('dispatchOrders');
        if (storedOrders) {
            try {
                orders = JSON.parse(storedOrders);
            } catch (e) {
                console.error('解析订单数据失败:', e);
                orders = [];
            }
        }
    }

    // 计算各种统计数据
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // 保存订单数据到全局变量，供点击卡片时使用
    window.overviewData = { orders: orders };

    // 运输中订单数量：现在时间等于提货时间但是小于等于送货时间，当天提当天送也算
    const inTransitOrders = orders.filter(order => {
        const pickupDate = order.pickupDateTime ? new Date(order.pickupDateTime) : null;
        const deliveryDate = order.deliveryDateTime ? new Date(order.deliveryDateTime) : null;

        if (!pickupDate) return false;

        // 设置时间为当天的开始（00:00:00）
        const pickupDateOnly = new Date(pickupDate);
        pickupDateOnly.setHours(0, 0, 0, 0);

        const nowDateOnly = new Date(now);
        nowDateOnly.setHours(0, 0, 0, 0);

        const deliveryDateOnly = deliveryDate ? new Date(deliveryDate) : null;
        if (deliveryDateOnly) {
            deliveryDateOnly.setHours(0, 0, 0, 0);
        }

        // 现在时间等于提货时间但是小于等于送货时间
        return pickupDateOnly.getTime() === nowDateOnly.getTime() &&
               (!deliveryDateOnly || nowDateOnly.getTime() <= deliveryDateOnly.getTime());
    });

    // 已完成订单数量
    const completedOrders = orders.filter(order => {
        const deliveryDate = order.deliveryDateTime ? new Date(order.deliveryDateTime) : null;
        return deliveryDate && deliveryDate <= now;
    });

    // 本月订单数量
    const monthlyOrders = orders.filter(order => {
        const orderDate = order.createdAt ? new Date(order.createdAt) :
                         (order.pickupDateTime ? new Date(order.pickupDateTime) : null);
        return orderDate &&
               orderDate.getMonth() === currentMonth &&
               orderDate.getFullYear() === currentYear;
    });

    // 准备派车订单数量（提货日期前一天，智能处理周末）
    const prepareDispatchOrders = orders.filter(order => {
        const pickupDate = order.pickupDateTime ? new Date(order.pickupDateTime) : null;
        if (!pickupDate) return false;

        // 计算提货日期前一天
        const dayBeforePickup = new Date(pickupDate);
        dayBeforePickup.setDate(dayBeforePickup.getDate() - 1);

        // 如果前一天是周末，则提前到周五显示
        const dayOfWeek = dayBeforePickup.getDay();
        if (dayOfWeek === 0) { // 周日，提前到周五
            dayBeforePickup.setDate(dayBeforePickup.getDate() - 2);
        } else if (dayOfWeek === 6) { // 周六，提前到周五
            dayBeforePickup.setDate(dayBeforePickup.getDate() - 1);
        }

        // 检查今天是否是应该显示准备派车的日期
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dayBeforePickup.setHours(0, 0, 0, 0);

        return today.getTime() === dayBeforePickup.getTime();
    });

    // 统计常用路线
    const routeCounts = {};
    orders.forEach(order => {
        const routeName = order.routeName || order.route || '未知路线';
        routeCounts[routeName] = (routeCounts[routeName] || 0) + 1;
    });

    const popularRoutes = Object.keys(routeCounts).sort((a, b) => routeCounts[b] - routeCounts[a]);

    // 更新UI
    document.getElementById('inTransitOrdersCount').textContent = inTransitOrders.length;
    document.getElementById('completedOrdersCount').textContent = completedOrders.length;
    document.getElementById('monthlyOrdersCount').textContent = monthlyOrders.length;
    document.getElementById('prepareDispatchCount').textContent = prepareDispatchOrders.length;

    // 更新全局变量中的订单分类数据
    window.overviewData.inTransitOrders = inTransitOrders;
    window.overviewData.completedOrders = completedOrders;
    window.overviewData.monthlyOrders = monthlyOrders;
    window.overviewData.prepareDispatchOrders = prepareDispatchOrders;
    window.overviewData.popularRouteOrders = popularRoutes.map(route => {
        return orders.filter(order => (order.routeName || order.route || '未知路线') === route);
    }).flat();
}

// 显示特定类型的订单列表
function showOverviewOrdersByType(type) {
    // 获取订单数据
    if (!window.overviewData) {
        loadOverviewData();
    }

    let orders = [];
    let title = '';

    // 根据类型获取对应的订单列表
    switch(type) {
        case 'inTransit':
            orders = window.overviewData.inTransitOrders || [];
            title = '运输中订单';
            break;
        case 'completed':
            orders = window.overviewData.completedOrders || [];
            title = '已完成订单';
            break;
        case 'monthly':
        orders = window.overviewData.monthlyOrders || [];
        title = '本月订单';
        break;
    case 'prepareDispatch':
        orders = window.overviewData.prepareDispatchOrders || [];
        title = '准备派车订单';
        break;
    case 'popular':
        orders = window.overviewData.popularRouteOrders || [];
        title = '常用路线订单';
        break;
        default:
            return;
    }

    // 更新标题
    document.getElementById('overview-orders-title').textContent = title + ' (' + orders.length + ')';

    // 清空并填充订单表格
    const tableBody = document.getElementById('overviewOrderTable');
    tableBody.innerHTML = '';

    if (orders.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="8" class="text-center">暂无订单数据</td>`;
        tableBody.appendChild(emptyRow);
    } else {
        orders.forEach(order => {
            const row = createOverviewOrderRow(order);
            tableBody.appendChild(row);
        });
    }

    // 显示订单列表区域
    document.getElementById('overview-orders-section').style.display = 'block';
}

// 创建总览页面的订单行
function createOverviewOrderRow(orderData) {
    const row = document.createElement('tr');
    row.dataset.orderId = orderData.id;

    row.innerHTML = `
        <td>
            <input type="checkbox" class="overviewOrder-checkbox" value="${orderData.id}" onchange="updateBatchButtons('overviewOrder')">
        </td>
        <td>${getOrderNumber(orderData)}</td>
        <td>${orderData.routeName || orderData.route || '未选择路线'}</td>
        <td class="pickup-group">${orderData.pickupLocation || '未设置'}</td>
        <td class="delivery-group">${orderData.deliveryLocation || '未设置'}</td>
        <td class="time-group">${orderData.pickupDateTime || '未设置'}</td>
        <td class="time-group">${orderData.deliveryDateTime || '未设置'}</td>
        <td>
            <button class="btn btn-sm btn-info" onclick="editOrder('${orderData.id}')"><i class="fas fa-edit"></i> 编辑</button>
            <button class="btn btn-sm btn-success" onclick="reprintDispatchSheet('${orderData.id}')"><i class="fas fa-print"></i> 重新打印</button>
            <button class="btn btn-sm btn-danger" onclick="deleteOrder('${orderData.id}')"><i class="fas fa-trash"></i> 删除</button>
        </td>
    `;

    return row;
}

// 获取订单编号
function getOrderNumber(orderData) {
    return orderData.orderNumber || orderData.id.substring(0, 8);
}

// 隐藏订单列表
function hideOverviewOrders() {
    document.getElementById('overview-orders-section').style.display = 'none';
}

function showOrderManagement() {
    showContent(CONTENT_SECTIONS.orders);

    // 立即尝试加载订单数据
    if (window.orderManager) {
        window.orderManager.loadOrdersTable();
    } else if (typeof loadOrdersTable === 'function') {
        loadOrdersTable();
    } else {
        // 如果模块还未加载，等待模块加载完成
        document.addEventListener('appFullyLoaded', function() {
            if (window.orderManager) {
                window.orderManager.loadOrdersTable();
            } else if (typeof loadOrdersTable === 'function') {
                loadOrdersTable();
            }
        }, { once: true });

        // 同时尝试直接加载（如果数据存在）
        const storedOrders = localStorage.getItem('dispatchOrders');
        if (storedOrders) {
            const orders = JSON.parse(storedOrders);
            const orderTableBody = document.getElementById('orderTable');
            if (orderTableBody && typeof window.addOrderToTable === 'function') {
                orderTableBody.innerHTML = '';
                orders.forEach(order => {
                    window.addOrderToTable(order, false);
                });
            }
        }
    }
}

// 显示派车单表单
function showDispatchForm() {
    showContent(CONTENT_SECTIONS.dispatch);

    // 更新路线选择框
    if (typeof updateRouteSelect === 'function') {
        updateRouteSelect();
    }

    // 清空表单
    clearDispatchForm();
}

// 清空派车单表单
function clearDispatchForm() {
    console.log('Navigation: 开始清空派车表单...');
    
    // 使用字段映射配置清空表单
    if (window.fieldMapping) {
        window.fieldMapping.clearAllFields();
    } else {
        // 降级处理：手动清空主要字段
        console.warn('字段映射配置未加载，使用降级清空方式');
        clearFormFieldsManuallyInNavigation();
    }
    
    // 清空提货点和送货点容器
    clearPickupAndDeliveryPointsInNavigation();
    
    // 重置路线选择模式
    resetRouteSelectionModeInNavigation();
    
    console.log('Navigation: 派车表单已清空');
}

// 手动清空表单字段（Navigation模块降级处理）
function clearFormFieldsManuallyInNavigation() {
    const formFields = [
        'cw1no', 'po', 'transportTeam', 'route', 'routeSearch', 'selectedRouteId', 'vehicleType',
        'pickupFactory', 'pickupContact', 'pickupAddress', 'pickupDate', 'pickupTime',
        'deliveryFactory', 'deliveryContact', 'deliveryAddress', 'deliveryDate', 'deliveryTime',
        'parkName', 'parkContact', 'parkAddress',
        'cargoType', 'cargoWeight', 'cargoVolume', 'cargoPieces', 'cargoNotes'
    ];

    formFields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            if (element.tagName === 'SELECT') {
                element.selectedIndex = 0;
            } else {
                element.value = '';
            }
        }
    });
}

// 清空提货点和送货点容器（Navigation模块）
function clearPickupAndDeliveryPointsInNavigation() {
    // 清空提货点容器（保留第一个，删除其他）
    const pickupContainer = document.getElementById('pickupPointsContainer');
    if (pickupContainer) {
        const pickupPoints = pickupContainer.querySelectorAll('.pickup-point-container');
        // 保留第一个提货点并清空其值
        if (pickupPoints.length > 0) {
            const firstPoint = pickupPoints[0];
            const inputs = firstPoint.querySelectorAll('input');
            inputs.forEach(input => input.value = '');

            // 删除其他提货点
            for (let i = 1; i < pickupPoints.length; i++) {
                pickupPoints[i].remove();
            }
        }
    }

    // 清空送货点容器（保留第一个，删除其他）
    const deliveryContainer = document.getElementById('deliveryPointsContainer');
    if (deliveryContainer) {
        const deliveryPoints = deliveryContainer.querySelectorAll('.delivery-point-container');
        // 保留第一个送货点并清空其值
        if (deliveryPoints.length > 0) {
            const firstPoint = deliveryPoints[0];
            const inputs = firstPoint.querySelectorAll('input');
            inputs.forEach(input => input.value = '');

            // 删除其他送货点
            for (let i = 1; i < deliveryPoints.length; i++) {
                deliveryPoints[i].remove();
            }
        }
    }
}

// 重置路线选择模式（Navigation模块）
function resetRouteSelectionModeInNavigation() {
    const routeSelect = document.getElementById('route');
    const routeSearchContainer = document.getElementById('routeSearchContainer');
    const routeDropdown = document.getElementById('routeDropdown');
    const toggleBtn = document.getElementById('toggleSearchBtn');
    
    // 切换回下拉选择模式
    if (routeSelect && routeSearchContainer) {
        routeSelect.style.display = 'block';
        routeSearchContainer.style.display = 'none';
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="fas fa-search"></i>';
            toggleBtn.title = '切换到搜索模式';
        }
    }
    
    // 隐藏路线下拉框
    if (routeDropdown) {
        routeDropdown.style.display = 'none';
    }
}

// 加载路线进行编辑
function loadRouteForEdit(routeId) {
    const routes = JSON.parse(localStorage.getItem('diyRoutes') || '[]');
    const route = routes.find(r => r.id == routeId);

    if (!route) {
        alert('路线不存在！');
        return;
    }

    // 填充基本信息
    document.getElementById('routeName').value = route.name || '';
    document.getElementById('routeNotes').value = route.notes || '';

    // 填充货物信息（如果存在）
    if (route.cargoInfo) {
        document.getElementById('cargoType').value = route.cargoInfo.type || '';
        document.getElementById('cargoWeight').value = route.cargoInfo.weight || '';
        document.getElementById('cargoVolume').value = route.cargoInfo.volume || '';
        document.getElementById('cargoPieces').value = route.cargoInfo.pieces || '';
    }

    // 添加途经点
    if (route.waypoints && route.waypoints.length > 0) {
        route.waypoints.forEach(waypoint => {
            addWaypointFromCustomerData(waypoint);
        });
    }

    alert('路线数据已加载，可以开始编辑！');
}

// 根据客户数据添加途经点
function addWaypointFromCustomerData(waypointData) {
    const container = document.getElementById('waypointsContainer');
    const waypointCount = container.children.length + 1;
    const waypointId = `waypoint_${Date.now()}_${waypointCount}`;

    const waypointDiv = document.createElement('div');
    waypointDiv.className = 'waypoint-item';
    waypointDiv.setAttribute('data-waypoint-id', waypointId);
    waypointDiv.innerHTML = `
        <div class="form-group">
            <div class="form-row">
                <div class="form-col">
                    <label><i class="fas fa-map-pin"></i> 途经点 ${waypointCount}</label>
                    <div class="customer-select-group">
                        <select id="waypointCustomer_${waypointId}" class="form-control waypoint-customer-select" onchange="selectWaypointCustomer('${waypointId}')">
                            <option value="">请选择客户作为途经点</option>
                        </select>
                        <button type="button" class="btn btn-sm btn-outline" onclick="showCustomerListModal('waypoint', '${waypointId}')">
                            <i class="fas fa-list"></i> 客户列表
                        </button>
                    </div>
                </div>
                <div class="form-col-auto">
                    <button type="button" class="btn btn-sm btn-danger" onclick="removeWaypoint(this)">
                        <i class="fas fa-trash"></i> 删除
                    </button>
                </div>
            </div>
            <!-- 途经点客户信息显示 -->
            <div id="waypointCustomerInfo_${waypointId}" class="customer-info-display">
                <div class="customer-info-card">
                    <h4><i class="fas fa-info-circle"></i> 途经点客户信息</h4>
                    <div class="customer-details">
                        <p><strong>名称：</strong><span id="waypointCustomerName_${waypointId}">${waypointData.customerName || ''}</span></p>
                        <p><strong>联系人：</strong><span id="waypointCustomerContact_${waypointId}"></span></p>
                        <p><strong>联系电话：</strong><span id="waypointCustomerPhone_${waypointId}"></span></p>
                        <p><strong>地址：</strong><span id="waypointCustomerAddress_${waypointId}">${waypointData.customerAddress || ''}</span></p>
                    </div>
                </div>
            </div>
        </div>
    `;

    container.appendChild(waypointDiv);

    // 为新添加的途经点加载客户数据
    loadCustomersToWaypointSelect(waypointId);

    // 如果有客户ID，设置选中状态
    if (waypointData.customerId) {
        setTimeout(() => {
            const select = document.getElementById(`waypointCustomer_${waypointId}`);
            if (select) {
                select.value = waypointData.customerId;
                selectWaypointCustomer(waypointId);
            }
        }, 100);
    }
}

// 确保所有客户相关函数在全局作用域中可用
window.showCustomerList = showCustomerList;
window.loadCustomerListData = loadCustomerListData;
window.loadCustomerData = loadCustomerData;
window.showCustomerListModal = showCustomerListModal;
window.closeCustomerSelectionModal = closeCustomerSelectionModal;
window.filterCustomerSelection = filterCustomerSelection;
window.clearCustomerSearch = clearCustomerSearch;
window.goToCustomerPage = goToCustomerPage;
window.changeCustomerPage = changeCustomerPage;
window.goToCustomerLastPage = goToCustomerLastPage;
window.viewCustomerDetail = viewCustomerDetail;
window.toggleCustomerSelectAll = toggleCustomerSelectAll;
window.updateCustomerBatchButtons = updateCustomerBatchButtons;
