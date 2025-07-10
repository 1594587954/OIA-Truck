// 派车单相关功能模块

// 切换路线搜索模式
function toggleRouteSearchMode() {
    const routeSelect = document.getElementById('route');
    const routeSearchContainer = document.getElementById('routeSearchContainer');
    const toggleBtn = document.getElementById('toggleSearchBtn');
    const routeSearch = document.getElementById('routeSearch');
    const selectedRouteId = document.getElementById('selectedRouteId');

    if (routeSearchContainer.style.display === 'none') {
        // 切换到搜索模式
        routeSelect.style.display = 'none';
        routeSearchContainer.style.display = 'block';
        toggleBtn.innerHTML = '<i class="fas fa-list"></i>';
        toggleBtn.title = '切换到下拉选择模式';
        routeSearch.focus();

        // 清空下拉选择的值
        routeSelect.value = '';
    } else {
        // 切换到下拉选择模式
        routeSelect.style.display = 'block';
        routeSearchContainer.style.display = 'none';
        toggleBtn.innerHTML = '<i class="fas fa-search"></i>';
        toggleBtn.title = '切换到搜索模式';

        // 清空搜索相关的值
        routeSearch.value = '';
        selectedRouteId.value = '';
        document.getElementById('routeDropdown').style.display = 'none';
    }
}

// 搜索并显示路线
function searchAndDisplayRoutes() {
    const searchInput = document.getElementById('routeSearch');
    const dropdown = document.getElementById('routeDropdown');
    const dropdownContent = dropdown.querySelector('.route-dropdown-content');
    const searchTerm = searchInput.value.toLowerCase().trim();

    if (!searchTerm) {
        dropdown.style.display = 'none';
        return;
    }

    const routes = Utils.StorageUtils.getRoutes();
    const filteredRoutes = routes.filter(route => {
        const routeName = (route.name || '').toLowerCase();
        const notes = (route.notes || '').toLowerCase();
        const waypointsText = route.waypoints ?
            route.waypoints.map(wp => (wp.customerName || '').toLowerCase()).join(' ') : '';

        return routeName.includes(searchTerm) ||
               notes.includes(searchTerm) ||
               waypointsText.includes(searchTerm);
    });

    if (filteredRoutes.length === 0) {
        dropdownContent.innerHTML = '<div class="no-routes-found">未找到匹配的路线</div>';
    } else {
        dropdownContent.innerHTML = filteredRoutes.map(route => {
            const waypointsText = route.waypoints && route.waypoints.length > 0 ?
                route.waypoints.map(wp => wp.customerName || '未知').join(' → ') : '无途经点';

            let cargoInfo = '';
            if (route.cargoInfo) {
                const cargoDetails = [];
                if (route.cargoInfo.type) cargoDetails.push(`类型: ${route.cargoInfo.type}`);
                if (route.cargoInfo.weight) cargoDetails.push(`重量: ${route.cargoInfo.weight}KG`);
                cargoInfo = cargoDetails.join(', ');
            }

            return `
                <div class="route-option" onclick="selectRoute(${route.id}, '${route.name}')">
                    <div class="route-option-name">${route.name || '未命名路线'}</div>
                    <div class="route-option-details">
                        途经点: ${waypointsText}<br>
                        ${cargoInfo ? `货物: ${cargoInfo}<br>` : ''}
                        ${route.notes ? `备注: ${route.notes}` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    dropdown.style.display = 'block';
}

// 显示路线下拉框
function showRouteDropdown() {
    const searchInput = document.getElementById('routeSearch');
    if (searchInput.value.trim()) {
        searchAndDisplayRoutes();
    }
}

// 隐藏路线下拉框
function hideRouteDropdown() {
    setTimeout(() => {
        const dropdown = document.getElementById('routeDropdown');
        dropdown.style.display = 'none';
    }, 200); // 延迟隐藏，允许点击选项
}

// 选择路线
function selectRoute(routeId, routeName) {
    const searchInput = document.getElementById('routeSearch');
    const selectedRouteIdInput = document.getElementById('selectedRouteId');
    const dropdown = document.getElementById('routeDropdown');

    searchInput.value = routeName;
    selectedRouteIdInput.value = routeId;
    dropdown.style.display = 'none';

    // 填充路线信息
    fillRouteInfo(routeId);
}

// 根据路线ID填充信息
function fillRouteInfo(routeId = null) {
    // 如果没有传入routeId，则根据当前模式获取
    if (!routeId) {
        const routeSelect = document.getElementById('route');
        const selectedRouteId = document.getElementById('selectedRouteId');
        const routeSearchContainer = document.getElementById('routeSearchContainer');

        if (routeSearchContainer.style.display === 'none') {
            // 下拉选择模式
            routeId = routeSelect.value;
        } else {
            // 搜索模式
            routeId = selectedRouteId.value;
        }
    }

    console.log('fillRouteInfo函数被调用，路线ID:', routeId);

    if (routeId) {
        const routes = Utils.StorageUtils.getRoutes();
        console.log('本地存储的路线数据:', routes);
        // 将routeId转换为数字进行比较，因为存储的ID是数字类型
        const route = routes.find(r => r.id === parseInt(routeId));
        console.log('找到的路线:', route);

        if (route && route.waypoints && route.waypoints.length > 0) {
            console.log('路线途经点数据:', route.waypoints);

            // 清空现有的提货点和送货点容器
            clearPickupAndDeliveryPoints();

            // 分类处理途经点：前面的作为提货点，最后一个作为送货点，中间的作为物流园
            const pickupPoints = [];
            const deliveryPoints = [];
            let logisticsPark = null;

            // 根据途经点数量分配角色
            if (route.waypoints.length === 1) {
                // 只有一个点，既是提货点也是送货点
                pickupPoints.push(route.waypoints[0]);
                deliveryPoints.push(route.waypoints[0]);
            } else if (route.waypoints.length === 2) {
                // 两个点：第一个是提货点，第二个是送货点
                pickupPoints.push(route.waypoints[0]);
                deliveryPoints.push(route.waypoints[1]);
            } else {
                // 三个或更多点：第一个是提货点，中间的是物流园，最后一个是送货点
                // 如果有多个前置点，都作为提货点
                for (let i = 0; i < route.waypoints.length - 2; i++) {
                    pickupPoints.push(route.waypoints[i]);
                }
                logisticsPark = route.waypoints[route.waypoints.length - 2]; // 倒数第二个作为物流园
                deliveryPoints.push(route.waypoints[route.waypoints.length - 1]); // 最后一个作为送货点
            }

            // 填充提货点信息
            fillPickupPoints(pickupPoints);

            // 填充物流园信息
            if (logisticsPark) {
                fillLogisticsPark(logisticsPark);
            }

            // 填充送货点信息
            fillDeliveryPoints(deliveryPoints);

            // 填充货物信息（如果存在）
            if (route.cargoInfo) {
                console.log('路线货物信息:', route.cargoInfo);

                const cargoTypeEl = document.getElementById('cargoType');
                const cargoWeightEl = document.getElementById('cargoWeight');
                const cargoVolumeEl = document.getElementById('cargoVolume');
                const cargoPiecesEl = document.getElementById('cargoPieces');
                const cargoNotesEl = document.getElementById('cargoNotes');

                console.log('货物表单元素:', {cargoTypeEl, cargoWeightEl, cargoVolumeEl, cargoPiecesEl, cargoNotesEl});

                if (cargoTypeEl) cargoTypeEl.value = route.cargoInfo.type || '';
                if (cargoWeightEl) cargoWeightEl.value = route.cargoInfo.weight || '';
                if (cargoVolumeEl) cargoVolumeEl.value = route.cargoInfo.volume || '';
                if (cargoPiecesEl) cargoPiecesEl.value = route.cargoInfo.pieces || '';

                console.log('填充货物信息:', {
                    type: route.cargoInfo.type,
                    weight: route.cargoInfo.weight,
                    volume: route.cargoInfo.volume,
                    pieces: route.cargoInfo.pieces
                });
            }

            // 填充备注信息
            if (route.notes) {
                const cargoNotesEl = document.getElementById('cargoNotes');
                if (cargoNotesEl) {
                    cargoNotesEl.value = route.notes;
                    console.log('填充备注信息:', route.notes);
                }
            }

            console.log('路线信息填充完成');
        } else {
            console.log('未找到路线或路线没有途经点');
        }
    } else {
        console.log('未选择路线');
    }
}

// 打开路线管理页面
function openRouteManagement() {
    window.location.href = 'route-management.html';
}



// 清空派车单表单
function clearDispatchForm() {
    console.log('开始清空派车表单...');
    
    // 使用字段映射配置清空表单
    if (window.fieldMapping) {
        window.fieldMapping.clearAllFields();
    } else {
        // 降级处理：手动清空主要字段
        console.warn('字段映射配置未加载，使用降级清空方式');
        clearFormFieldsManually();
    }
    
    // 清空提货点和送货点容器
    clearPickupAndDeliveryPoints();
    
    // 重置路线选择模式到下拉选择
    resetRouteSelectionMode();
    
    console.log('派车表单已清空');
}

// 手动清空表单字段（降级处理）
function clearFormFieldsManually() {
    const fieldIds = [
        'cw1no', 'po', 'route', 'routeSearch', 'selectedRouteId',
        'transportTeam', 'vehicleType',
        'pickupFactory', 'pickupContact', 'pickupAddress', 'pickupDate',
        'deliveryFactory', 'deliveryContact', 'deliveryAddress', 'deliveryDate',
        'parkName', 'parkContact', 'parkAddress',
        'cargoType', 'cargoWeight', 'cargoVolume', 'cargoPieces', 'cargoNotes'
    ];
    
    fieldIds.forEach(fieldId => {
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

// 重置路线选择模式
function resetRouteSelectionMode() {
    const routeSelect = document.getElementById('route');
    const routeSearchContainer = document.getElementById('routeSearchContainer');
    const routeDropdownEl = document.getElementById('routeDropdown');
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
    if (routeDropdownEl) {
        routeDropdownEl.style.display = 'none';
    }
}

// 获取派车单表单数据
function getDispatchFormData() {
    const routeElement = document.getElementById('route');
    const transportTeamElement = document.getElementById('transportTeam');

    // 获取路线信息 - 支持下拉选择和搜索模式
    let routeId = '';
    let routeName = '未选择路线';

    const routeSearchContainer = document.getElementById('routeSearchContainer');
    const selectedRouteIdInput = document.getElementById('selectedRouteId');
    const routeSearchInput = document.getElementById('routeSearch');

    if (routeSearchContainer && routeSearchContainer.style.display !== 'none') {
        // 搜索模式
        routeId = selectedRouteIdInput ? selectedRouteIdInput.value : '';
        routeName = routeSearchInput ? routeSearchInput.value : '未选择路线';
    } else {
        // 下拉选择模式
        routeId = routeElement.value;
        routeName = routeElement.options[routeElement.selectedIndex]?.text || '未选择路线';
    }

    // 收集所有提货点数据
    const pickupPoints = [];
    const pickupContainers = document.querySelectorAll('#pickupPointsContainer .pickup-point-container');
    pickupContainers.forEach((container, index) => {
        const pointData = container.querySelector('.pickup-point');
        if (pointData) {
            const inputs = pointData.querySelectorAll('input');
            const addressInput = container.querySelector('.form-row:not(.pickup-point) input[placeholder*="提货地址"]');

            pickupPoints.push({
                factory: inputs[0]?.value || '',
                contact: inputs[1]?.value || '',
                date: inputs[2]?.value || '',
                address: addressInput?.value || ''
            });
        }
    });

    // 收集所有送货点数据
    const deliveryPoints = [];
    const deliveryContainers = document.querySelectorAll('#deliveryPointsContainer .delivery-point-container');
    deliveryContainers.forEach((container, index) => {
        const pointData = container.querySelector('.delivery-point');
        if (pointData) {
            const inputs = pointData.querySelectorAll('input');
            const addressInput = container.querySelector('.form-row:not(.delivery-point) input[placeholder*="送货地址"]');

            deliveryPoints.push({
                factory: inputs[0]?.value || '',
                contact: inputs[1]?.value || '',
                date: inputs[2]?.value || '',
                address: addressInput?.value || ''
            });
        }
    });

    return {
        route: routeId,
        routeName: routeName,
        cw1no: document.getElementById('cw1no').value,
        po: document.getElementById('po').value,
        transportTeam: transportTeamElement.options[transportTeamElement.selectedIndex]?.text || '未选择车队',
        vehicleType: document.getElementById('vehicleType').value || '未选择',

        // 保持向后兼容性 - 第一个提货点和送货点的数据
        pickupFactory: pickupPoints[0]?.factory || '',
        pickupContact: pickupPoints[0]?.contact || '',
        pickupAddress: pickupPoints[0]?.address || '',
        pickupDate: pickupPoints[0]?.date || '',
        deliveryFactory: deliveryPoints[0]?.factory || '',
        deliveryContact: deliveryPoints[0]?.contact || '',
        deliveryAddress: deliveryPoints[0]?.address || '',
        deliveryDate: deliveryPoints[0]?.date || '',

        // 新增：所有提货点和送货点数据
        pickupPoints: pickupPoints,
        deliveryPoints: deliveryPoints,

        // 物流园信息
        parkName: document.getElementById('parkName').value,
        parkContact: document.getElementById('parkContact').value,
        parkAddress: document.getElementById('parkAddress').value,

        // 货物信息
        cargoType: document.getElementById('cargoType').value || '未指定',
        cargoWeight: document.getElementById('cargoWeight').value,
        cargoVolume: document.getElementById('cargoVolume').value,
        cargoPieces: document.getElementById('cargoPieces').value,
        cargoNotes: document.getElementById('cargoNotes').value
    };
}

// 创建符合订单管理格式的订单数据对象
function createOrderDataForManagement(formData) {
    // 格式化日期和时间，确保格式一致
    const formatPickupDateTime = formData.pickupDate || '未设置';
    const formatDeliveryDateTime = formData.deliveryDate || '未设置';

    // 创建完整的订单数据对象，包含所有必要字段
    const orderData = {
        // 基本订单信息
        id: formData.po,
        customer: formData.transportTeam,
        routeName: formData.routeName,
        route: formData.route,
        cw1no: formData.cw1no,
        transportTeam: formData.transportTeam,
        vehicleType: formData.vehicleType,

        // 提货信息
        pickupLocation: formData.pickupFactory,
        pickupContact: formData.pickupContact,
        pickupAddress: formData.pickupAddress,
        pickupDateTime: formatPickupDateTime,

        // 物流园信息
        parkName: formData.parkName,
        parkContact: formData.parkContact,
        parkAddress: formData.parkAddress,

        // 送货信息
        deliveryLocation: formData.deliveryFactory,
        deliveryContact: formData.deliveryContact,
        deliveryAddress: formData.deliveryAddress,
        deliveryDateTime: formatDeliveryDateTime,

        // 货物信息
        cargoType: formData.cargoType || '未指定',
        cargoWeight: formData.cargoWeight || '',
        cargoVolume: formData.cargoVolume || '',
        cargoPieces: formData.cargoPieces || '',
        cargoNotes: formData.cargoNotes || '',

        // 订单创建时间
        vehicle: '待安排',

        // 创建时间戳
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString()
    };

    console.log('创建的订单数据对象:', orderData);
    return orderData;
}

// 生成派车单PDF（同时保存派车单）
async function generateDispatchSheet() {
    console.log('开始生成派车单PDF并保存...');

    // 获取表单数据
    const formData = getDispatchFormData();
    console.log('表单数据:', formData);

    // 验证必填字段（PO或Shipment任意填写一项即可）
    if (!Utils.ValidationUtils.validatePOOrShipment(formData.po, formData.cw1no)) {
        return;
    }

    // 验证TO车队
    if (!Utils.ValidationUtils.validateTransportTeam(formData.transportTeam)) {
        return;
    }

    // 验证车型
    if (!Utils.ValidationUtils.validateVehicleType(formData.vehicleType)) {
        return;
    }

    // 验证送货日期不能早于提货日期
    if (!Utils.ValidationUtils.validateDeliveryDate(formData.pickupDate, formData.deliveryDate)) {
        return;
    }

    // 先执行保存逻辑
    console.log('执行保存派车单逻辑...');

    // 创建符合订单管理格式的订单数据对象
    const orderData = createOrderDataForManagement(formData);
    console.log('订单数据:', orderData);

    // 直接保存到本地存储
    if (typeof saveOrderToLocalStorage === 'function') {
        console.log('保存订单到本地存储...');
        saveOrderToLocalStorage(orderData);
        console.log('订单已保存到本地存储');

        // 显示成功提示
        if (typeof Utils !== 'undefined' && Utils.UIUtils && Utils.UIUtils.showSuccess) {
            Utils.UIUtils.showSuccess('派车单已成功保存，可在订单管理中查看');
        } else {
            alert('派车单已成功保存，可在订单管理中查看');
        }
    } else {
        console.error('saveOrderToLocalStorage函数未定义');
        alert('系统错误：订单保存功能不可用');
        return;
    }

    // 强制更新订单管理界面和仪表盘
    console.log('强制更新界面显示...');

    // 更新订单管理表格
    if (window.orderManager) {
        window.orderManager.loadOrdersTable();
    } else if (typeof loadOrdersTable === 'function') {
        loadOrdersTable();
    }

    // 更新仪表盘统计
    if (window.dashboardManager) {
        await window.dashboardManager.updateDashboardStats();
    }

    // 如果当前在订单管理页面，确保表格显示最新数据
    const orderTable = document.getElementById('orderTable');
    if (orderTable && typeof window.addOrderToTable === 'function') {
        console.log('直接添加订单到表格显示...');
        window.addOrderToTable(orderData, false); // false表示不重复保存到存储
    }

    console.log('派车单保存完成，开始生成PDF...');

    // 创建隐藏的PDF模板容器
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
        padding: 3mm; /* 减少页边距，从5mm改为3mm，与CSS文件保持一致 */
        font-family: 'Microsoft YaHei', 'Noto Sans SC', Arial, sans-serif;
        font-size: 14px; /* 放大字体，从12px改为14px，与CSS文件保持一致 */
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
            return '<p style="margin: 5px 0; color: #999;">暂无提货点信息</p>';
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
            return '<p style="margin: 5px 0; color: #999;">暂无送货点信息</p>';
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
                <p style="margin: 4px 0; width: 48%;"><strong>物流园名称:</strong> ${formData.parkName || '无'}</p>
                <p style="margin: 4px 0; width: 48%;"><strong>联系人:</strong> ${formData.parkContact || '无'}</p>
                <p style="margin: 4px 0; width: 100%;"><strong>物流园地址:</strong> ${formData.parkAddress || '无'}</p>
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

    // 将容器添加到页面
    document.body.appendChild(pdfContainer);

    // 等待图片加载完成后生成PDF
    const img = pdfContainer.querySelector('img');
    if (img) {
        img.onload = function() {
            generatePDFFromContainer(pdfContainer, formData);
        };
        img.onerror = function() {
            // 如果图片加载失败，仍然生成PDF
            generatePDFFromContainer(pdfContainer, formData);
        };
    } else {
        generatePDFFromContainer(pdfContainer, formData);
    }
}

// 全局函数定义
window.removePickupPoint = function(element) {
    console.log('removePickupPoint被调用', element);
    const container = element.closest('.pickup-point-container');
    console.log('找到的容器:', container);
    if (container) {
        container.remove();
        console.log('提货点已删除');
    } else {
        console.log('未找到要删除的提货点容器');
    }
};

// 添加提货点函数
window.addPickupPoint = function() {
    console.log('addPickupPoint被调用');
    const container = document.getElementById('pickupPointsContainer');
    if (!container) {
        console.error('未找到提货点容器');
        return;
    }

    const existingPoints = container.querySelectorAll('.pickup-point-container');
    const newIndex = existingPoints.length;

    const newPickupPoint = document.createElement('div');
    newPickupPoint.className = 'pickup-point-container';
    newPickupPoint.innerHTML = `
        <div class="point-remove" onclick="removePickupPoint(this)">×</div>
        <div class="form-row pickup-point" data-point-index="${newIndex}">
            <div class="form-col">
                <label><i class="fas fa-industry"></i> 名称</label>
                <input type="text" class="form-control" placeholder="请输入提货工厂名称">
            </div>
            <div class="form-col">
                <label><i class="fas fa-user"></i> 联系人</label>
                <input type="text" class="form-control" placeholder="请输入联系人姓名">
            </div>
            <div class="form-col">
                <label><i class="fas fa-calendar"></i> 提货日期</label>
                <input type="date" class="form-control">
            </div>
        </div>
        <div class="form-row">
            <div class="form-col full-width">
                <label><i class="fas fa-map-marker-alt"></i> 提货地址</label>
                <input type="text" class="form-control" placeholder="请输入提货地址">
            </div>
        </div>
    `;

    container.appendChild(newPickupPoint);
    console.log('新提货点已添加，索引:', newIndex);
};

// 添加送货点函数
window.addDeliveryPoint = function() {
    console.log('addDeliveryPoint被调用');
    const container = document.getElementById('deliveryPointsContainer');
    if (!container) {
        console.error('未找到送货点容器');
        return;
    }

    const existingPoints = container.querySelectorAll('.delivery-point-container');
    const newIndex = existingPoints.length;

    const newDeliveryPoint = document.createElement('div');
    newDeliveryPoint.className = 'delivery-point-container';
    newDeliveryPoint.innerHTML = `
        <div class="point-remove" onclick="removeDeliveryPoint(this)">×</div>
        <div class="form-row delivery-point" data-point-index="${newIndex}">
            <div class="form-col">
                <label><i class="fas fa-industry"></i> 名称</label>
                <input type="text" class="form-control" placeholder="请输入送货工厂名称">
            </div>
            <div class="form-col">
                <label><i class="fas fa-user"></i> 联系人</label>
                <input type="text" class="form-control" placeholder="请输入联系人姓名">
            </div>
            <div class="form-col">
                <label><i class="fas fa-calendar"></i> 送货日期</label>
                <input type="date" class="form-control">
            </div>
        </div>
        <div class="form-row">
            <div class="form-col full-width">
                <label><i class="fas fa-map-marker-alt"></i> 送货地址</label>
                <input type="text" class="form-control" placeholder="请输入送货地址">
            </div>
        </div>
    `;

    container.appendChild(newDeliveryPoint);
    console.log('新送货点已添加，索引:', newIndex);
};

// 删除送货点函数
window.removeDeliveryPoint = function(element) {
    console.log('removeDeliveryPoint被调用', element);
    const container = element.closest('.delivery-point-container');
    console.log('找到的容器:', container);
    if (container) {
        container.remove();
        console.log('送货点已删除');
    } else {
        console.log('未找到要删除的送货点容器');
    }
};

// 从容器生成PDF文件
async function generatePDFFromContainer(container, formData) {
    const result = await Utils.PDFUtils.generatePDF(container, formData, false);

    // 移除临时容器
    document.body.removeChild(container);

    if (result.success) {
        console.log('PDF生成成功:', result.fileName);

                // 更新运营总览数据
        const allOrders = await Utils.StorageUtils.getOrders();
        if (typeof updateDashboardStats === 'function') {
            await updateDashboardStats(allOrders);
        }

        // 更新仪表盘统计
        if (window.dashboardManager) {
            await window.dashboardManager.updateDashboardStats();
        }

        // 更新订单管理表格
        if (window.orderManager) {
            await window.orderManager.loadOrdersTable();
        }

        // 清空表单
        if (typeof clearDispatchForm === 'function') {
            clearDispatchForm();
        }

        const viewOrders = Utils.UIUtils.confirm(`派车单已成功保存并生成PDF！\nPO: ${formData.cw1no}\nShipment: ${formData.po}\nPDF文件: ${result.fileName}\n\n是否立即查看订单管理？`);

        if (viewOrders && typeof showOrderManagement === 'function') {
            showOrderManagement();
        }
    }
}

// 清空提货点和送货点容器
function clearPickupAndDeliveryPoints() {
    const pickupContainer = document.getElementById('pickupPointsContainer');
    const deliveryContainer = document.getElementById('deliveryPointsContainer');

    // 清空提货点容器，保留第一个
    if (pickupContainer) {
        const firstPickup = pickupContainer.querySelector('.pickup-point-container');
        pickupContainer.innerHTML = '';
        if (firstPickup) {
            // 清空第一个提货点的内容
            const inputs = firstPickup.querySelectorAll('input');
            inputs.forEach(input => input.value = '');
            pickupContainer.appendChild(firstPickup);
        }
    }

    // 清空送货点容器，保留第一个
    if (deliveryContainer) {
        const firstDelivery = deliveryContainer.querySelector('.delivery-point-container');
        deliveryContainer.innerHTML = '';
        if (firstDelivery) {
            // 清空第一个送货点的内容
            const inputs = firstDelivery.querySelectorAll('input');
            inputs.forEach(input => input.value = '');
            deliveryContainer.appendChild(firstDelivery);
        }
    }
}

// 填充提货点信息
function fillPickupPoints(pickupPoints) {
    console.log('填充提货点信息:', pickupPoints);
    const container = document.getElementById('pickupPointsContainer');
    if (!container || pickupPoints.length === 0) return;

    pickupPoints.forEach((point, index) => {
        let pickupContainer;

        if (index === 0) {
            // 使用第一个现有的提货点容器
            pickupContainer = container.querySelector('.pickup-point-container');
        } else {
            // 创建新的提货点容器
            addPickupPoint();
            const containers = container.querySelectorAll('.pickup-point-container');
            pickupContainer = containers[containers.length - 1];
        }

        if (pickupContainer) {
            // 填充提货点信息
            const nameInput = pickupContainer.querySelector('input[placeholder*="提货工厂名称"], #pickupFactory');
            const contactInput = pickupContainer.querySelector('input[placeholder*="联系人姓名"], #pickupContact');
            const addressInput = pickupContainer.querySelector('input[placeholder*="提货地址"], #pickupAddress');

            if (nameInput) nameInput.value = point.customerName || '';
            if (addressInput) addressInput.value = point.customerAddress || '';

            // 联系人和电话合并显示
            const contact = point.customerContact || '';
            const phone = point.customerPhone || '';
            const contactInfo = contact && phone ? `${contact} (${phone})` : contact || phone || '';
            if (contactInput) contactInput.value = contactInfo;

            console.log(`填充第${index + 1}个提货点:`, {
                customerName: point.customerName,
                customerAddress: point.customerAddress,
                contactInfo: contactInfo
            });
        }
    });
}

// 填充物流园信息
function fillLogisticsPark(logisticsPark) {
    console.log('填充物流园信息:', logisticsPark);

    const parkNameEl = document.getElementById('parkName');
    const parkAddressEl = document.getElementById('parkAddress');
    const parkContactEl = document.getElementById('parkContact');

    if (parkNameEl) parkNameEl.value = logisticsPark.customerName || '';
    if (parkAddressEl) parkAddressEl.value = logisticsPark.customerAddress || '';

    // 联系人和电话合并显示
    const contact = logisticsPark.customerContact || '';
    const phone = logisticsPark.customerPhone || '';
    const contactInfo = contact && phone ? `${contact} (${phone})` : contact || phone || '';
    if (parkContactEl) parkContactEl.value = contactInfo;

    console.log('物流园信息已填充:', {
        customerName: logisticsPark.customerName,
        customerAddress: logisticsPark.customerAddress,
        contactInfo: contactInfo
    });
}

// 填充送货点信息
function fillDeliveryPoints(deliveryPoints) {
    console.log('填充送货点信息:', deliveryPoints);
    const container = document.getElementById('deliveryPointsContainer');
    if (!container || deliveryPoints.length === 0) return;

    deliveryPoints.forEach((point, index) => {
        let deliveryContainer;

        if (index === 0) {
            // 使用第一个现有的送货点容器
            deliveryContainer = container.querySelector('.delivery-point-container');
        } else {
            // 创建新的送货点容器
            addDeliveryPoint();
            const containers = container.querySelectorAll('.delivery-point-container');
            deliveryContainer = containers[containers.length - 1];
        }

        if (deliveryContainer) {
            // 填充送货点信息
            const nameInput = deliveryContainer.querySelector('input[placeholder*="送货工厂名称"], #deliveryFactory');
            const contactInput = deliveryContainer.querySelector('input[placeholder*="联系人姓名"], #deliveryContact');
            const addressInput = deliveryContainer.querySelector('input[placeholder*="送货地址"], #deliveryAddress');

            if (nameInput) nameInput.value = point.customerName || '';
            if (addressInput) addressInput.value = point.customerAddress || '';

            // 联系人和电话合并显示
            const contact = point.customerContact || '';
            const phone = point.customerPhone || '';
            const contactInfo = contact && phone ? `${contact} (${phone})` : contact || phone || '';
            if (contactInput) contactInput.value = contactInfo;

            console.log(`填充第${index + 1}个送货点:`, {
                customerName: point.customerName,
                customerAddress: point.customerAddress,
                contactInfo: contactInfo
            });
        }
    });
}



// 实时验证日期范围
function validateDateRange() {
    const pickupDate = document.getElementById('pickupDate').value;
    const deliveryDate = document.getElementById('deliveryDate').value;

    if (pickupDate && deliveryDate) {
        Utils.ValidationUtils.validateDeliveryDate(pickupDate, deliveryDate);
    }
}

// 确保函数在全局可用
window.validateDateRange = validateDateRange;

// 从容器生成PDF文件
async function generatePDFFromContainer(container, formData) {
    const result = await Utils.PDFUtils.generatePDF(container, formData, false);

    // 移除临时容器
    document.body.removeChild(container);

    if (result.success) {
        console.log('PDF生成成功:', result.fileName);

        // 更新运营总览数据
        const allOrders = await Utils.StorageUtils.getOrders();
        if (typeof updateDashboardStats === 'function') {
            await updateDashboardStats(allOrders);
        }

        // 更新仪表盘统计
        if (window.dashboardManager) {
            await window.dashboardManager.updateDashboardStats();
        }

        // 更新订单管理表格
        if (window.orderManager) {
            await window.orderManager.loadOrdersTable();
        }

        // 清空表单
        if (typeof clearDispatchForm === 'function') {
            clearDispatchForm();
        }

        const viewOrders = Utils.UIUtils.confirm(`派车单已成功保存并生成PDF！\nPO: ${formData.cw1no}\nShipment: ${formData.po}\nPDF文件: ${result.fileName}\n\n是否立即查看订单管理？`);

        if (viewOrders && typeof showOrderManagement === 'function') {
            showOrderManagement();
        }
    }
}

// 清空提货点和送货点容器
function clearPickupAndDeliveryPoints() {
    const pickupContainer = document.getElementById('pickupPointsContainer');
    const deliveryContainer = document.getElementById('deliveryPointsContainer');

    // 清空提货点容器，保留第一个
    if (pickupContainer) {
        const firstPickup = pickupContainer.querySelector('.pickup-point-container');
        pickupContainer.innerHTML = '';
        if (firstPickup) {
            // 清空第一个提货点的内容
            const inputs = firstPickup.querySelectorAll('input');
            inputs.forEach(input => input.value = '');
            pickupContainer.appendChild(firstPickup);
        }
    }

    // 清空送货点容器，保留第一个
    if (deliveryContainer) {
        const firstDelivery = deliveryContainer.querySelector('.delivery-point-container');
        deliveryContainer.innerHTML = '';
        if (firstDelivery) {
            // 清空第一个送货点的内容
            const inputs = firstDelivery.querySelectorAll('input');
            inputs.forEach(input => input.value = '');
            deliveryContainer.appendChild(firstDelivery);
        }
    }
}

// 填充提货点信息
function fillPickupPoints(pickupPoints) {
    console.log('填充提货点信息:', pickupPoints);
    const container = document.getElementById('pickupPointsContainer');
    if (!container || pickupPoints.length === 0) return;

    pickupPoints.forEach((point, index) => {
        let pickupContainer;

        if (index === 0) {
            // 使用第一个现有的提货点容器
            pickupContainer = container.querySelector('.pickup-point-container');
        } else {
            // 创建新的提货点容器
            addPickupPoint();
            const containers = container.querySelectorAll('.pickup-point-container');
            pickupContainer = containers[containers.length - 1];
        }

        if (pickupContainer) {
            // 填充提货点信息
            const nameInput = pickupContainer.querySelector('input[placeholder*="提货工厂名称"], #pickupFactory');
            const contactInput = pickupContainer.querySelector('input[placeholder*="联系人姓名"], #pickupContact');
            const addressInput = pickupContainer.querySelector('input[placeholder*="提货地址"], #pickupAddress');

            if (nameInput) nameInput.value = point.customerName || '';
            if (addressInput) addressInput.value = point.customerAddress || '';

            // 联系人和电话合并显示
            const contact = point.customerContact || '';
            const phone = point.customerPhone || '';
            const contactInfo = contact && phone ? `${contact} (${phone})` : contact || phone || '';
            if (contactInput) contactInput.value = contactInfo;

            console.log(`填充第${index + 1}个提货点:`, {
                customerName: point.customerName,
                customerAddress: point.customerAddress,
                contactInfo: contactInfo
            });
        }
    });
}

// 填充物流园信息
function fillLogisticsPark(logisticsPark) {
    console.log('填充物流园信息:', logisticsPark);

    const parkNameEl = document.getElementById('parkName');
    const parkAddressEl = document.getElementById('parkAddress');
    const parkContactEl = document.getElementById('parkContact');

    if (parkNameEl) parkNameEl.value = logisticsPark.customerName || '';
    if (parkAddressEl) parkAddressEl.value = logisticsPark.customerAddress || '';

    // 联系人和电话合并显示
    const contact = logisticsPark.customerContact || '';
    const phone = logisticsPark.customerPhone || '';
    const contactInfo = contact && phone ? `${contact} (${phone})` : contact || phone || '';
    if (parkContactEl) parkContactEl.value = contactInfo;

    console.log('物流园信息已填充:', {
        customerName: logisticsPark.customerName,
        customerAddress: logisticsPark.customerAddress,
        contactInfo: contactInfo
    });
}

// 填充送货点信息
function fillDeliveryPoints(deliveryPoints) {
    console.log('填充送货点信息:', deliveryPoints);
    const container = document.getElementById('deliveryPointsContainer');
    if (!container || deliveryPoints.length === 0) return;

    deliveryPoints.forEach((point, index) => {
        let deliveryContainer;

        if (index === 0) {
            // 使用第一个现有的送货点容器
            deliveryContainer = container.querySelector('.delivery-point-container');
        } else {
            // 创建新的送货点容器
            addDeliveryPoint();
            const containers = container.querySelectorAll('.delivery-point-container');
            deliveryContainer = containers[containers.length - 1];
        }

        if (deliveryContainer) {
            // 填充送货点信息
            const nameInput = deliveryContainer.querySelector('input[placeholder*="送货工厂名称"], #deliveryFactory');
            const contactInput = deliveryContainer.querySelector('input[placeholder*="联系人姓名"], #deliveryContact');
            const addressInput = deliveryContainer.querySelector('input[placeholder*="送货地址"], #deliveryAddress');

            if (nameInput) nameInput.value = point.customerName || '';
            if (addressInput) addressInput.value = point.customerAddress || '';

            // 联系人和电话合并显示
            const contact = point.customerContact || '';
            const phone = point.customerPhone || '';
            const contactInfo = contact && phone ? `${contact} (${phone})` : contact || phone || '';
            if (contactInput) contactInput.value = contactInfo;

            console.log(`填充第${index + 1}个送货点:`, {
                customerName: point.customerName,
                customerAddress: point.customerAddress,
                contactInfo: contactInfo
            });
        }
    });
}



// 确保函数在全局作用域中可用，以便onclick事件能够调用
// 这些函数已经通过window对象暴露，所以onclick应该能正常工作
console.log('dispatch.js模块已加载，addPickupPoint和addDeliveryPoint函数已可用');
