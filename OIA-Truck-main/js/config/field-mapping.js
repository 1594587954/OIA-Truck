// 字段映射配置 - 统一派车单创建和订单管理的字段ID
class FieldMapping {
    constructor() {
        // 基本信息字段映射
        this.basicFields = {
            // PO和Shipment
            po: 'po',                    // PO号
            shipment: 'shipment',             // Shipment号
            
            // 运输团队信息
            transportTeam: 'transportTeam',   // 运输团队
            vehicleType: 'vehicleType',       // 车型
            route: 'route',                   // 路线
            
            // 提货信息
            pickupFactory: 'pickupFactory',       // 提货工厂
            pickupContact: 'pickupContact',       // 提货联系人
            pickupAddress: 'pickupAddress',       // 提货地址
            pickupDate: 'pickupDate',             // 提货日期
            pickupTime: 'pickupTime',             // 提货时间
            
            // 送货信息
            deliveryFactory: 'deliveryFactory',   // 送货工厂
            deliveryContact: 'deliveryContact',   // 送货联系人
            deliveryAddress: 'deliveryAddress',   // 送货地址
            deliveryDate: 'deliveryDate',         // 送货日期
            deliveryTime: 'deliveryTime',         // 送货时间
            
            // 物流园信息
            parkName: 'parkName',                 // 物流园名称
            parkContact: 'parkContact',           // 物流园联系人
            parkAddress: 'parkAddress',           // 物流园地址
            
            // 货物信息
            cargoType: 'cargoType',               // 货物类型
            cargoWeight: 'cargoWeight',           // 货物重量
            cargoVolume: 'cargoVolume',           // 货物体积
            cargoPieces: 'cargoPieces',           // 货物件数
            cargoNotes: 'cargoNotes'              // 货物备注
        };
        
        // 订单管理表格字段到表单字段的映射
        this.orderToFormMapping = {
            // 基本信息映射
            'orderId': 'shipment',                   // 订单ID映射到Shipment
            'orderNumber': 'po',                  // 订单号映射到PO
            'route': 'route',                     // 路线
            'transportTeam': 'transportTeam',     // 运输团队
            'vehicleType': 'vehicleType',         // 车型
            
            // 提货信息映射
            'pickupLocation': 'pickupFactory',    // 提货地点映射到提货工厂
            'pickupContact': 'pickupContact',     // 提货联系人
            'pickupAddress': 'pickupAddress',     // 提货地址
            'pickupDateTime': 'pickupDate',       // 提货时间映射到提货日期
            
            // 送货信息映射
            'deliveryLocation': 'deliveryFactory', // 送货地点映射到送货工厂
            'deliveryContact': 'deliveryContact',   // 送货联系人
            'deliveryAddress': 'deliveryAddress',   // 送货地址
            'deliveryDateTime': 'deliveryDate',     // 送货时间映射到送货日期
            
            // 物流园信息映射
            'logisticsPark': 'parkName',            // 物流园映射到物流园名称
            'parkContact': 'parkContact',           // 物流园联系人
            'parkAddress': 'parkAddress',           // 物流园地址
            
            // 货物信息映射
            'cargoInfo': 'cargoType',               // 货物信息映射到货物类型
            'cargoWeight': 'cargoWeight',           // 货物重量
            'cargoVolume': 'cargoVolume',           // 货物体积
            'cargoPieces': 'cargoPieces',           // 货物件数
            'cargoNotes': 'cargoNotes'              // 货物备注
        };
        
        // 表单验证规则
        this.validationRules = {
            required: ['transportTeam', 'vehicleType'],  // 必填字段
            optional: ['po', 'shipment'],                   // 可选字段（但至少填一个）
            dateFields: ['pickupDate', 'deliveryDate'],  // 日期字段
            timeFields: ['pickupTime', 'deliveryTime']   // 时间字段
        };
    }
    
    /**
     * 获取表单字段ID
     * @param {string} fieldName 字段名称
     * @returns {string} 字段ID
     */
    getFieldId(fieldName) {
        return this.basicFields[fieldName] || fieldName;
    }
    
    /**
     * 获取订单数据到表单字段的映射
     * @param {string} orderField 订单字段名
     * @returns {string} 表单字段ID
     */
    getFormFieldFromOrder(orderField) {
        return this.orderToFormMapping[orderField] || orderField;
    }
    
    /**
     * 获取所有基本字段ID列表
     * @returns {Array} 字段ID数组
     */
    getAllFieldIds() {
        return Object.values(this.basicFields);
    }
    
    /**
     * 检查字段是否为必填字段
     * @param {string} fieldName 字段名称
     * @returns {boolean} 是否必填
     */
    isRequiredField(fieldName) {
        return this.validationRules.required.includes(fieldName);
    }
    
    /**
     * 检查字段是否为日期字段
     * @param {string} fieldName 字段名称
     * @returns {boolean} 是否为日期字段
     */
    isDateField(fieldName) {
        return this.validationRules.dateFields.includes(fieldName);
    }
    
    /**
     * 检查字段是否为时间字段
     * @param {string} fieldName 字段名称
     * @returns {boolean} 是否为时间字段
     */
    isTimeField(fieldName) {
        return this.validationRules.timeFields.includes(fieldName);
    }
    
    /**
     * 格式化日期时间字段
     * @param {string} dateTimeStr 日期时间字符串
     * @returns {Object} 包含日期和时间的对象
     */
    formatDateTime(dateTimeStr) {
        if (!dateTimeStr || dateTimeStr === '未设置') {
            return { date: '', time: '' };
        }
        
        // 尝试解析不同格式的日期时间
        const dateTime = new Date(dateTimeStr);
        if (isNaN(dateTime.getTime())) {
            // 如果无法解析，尝试分割字符串
            const parts = dateTimeStr.split(' ');
            return {
                date: parts[0] || '',
                time: parts[1] || ''
            };
        }
        
        // 格式化为标准格式
        const year = dateTime.getFullYear();
        const month = String(dateTime.getMonth() + 1).padStart(2, '0');
        const day = String(dateTime.getDate()).padStart(2, '0');
        const hours = String(dateTime.getHours()).padStart(2, '0');
        const minutes = String(dateTime.getMinutes()).padStart(2, '0');
        
        return {
            date: `${year}-${month}-${day}`,
            time: `${hours}:${minutes}`
        };
    }
    
    /**
     * 清空表单所有字段
     */
    clearAllFields() {
        this.getAllFieldIds().forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element) {
                element.value = '';
            }
        });
        
        // 清空路线搜索相关字段
        const routeSearchEl = document.getElementById('routeSearch');
        const selectedRouteIdEl = document.getElementById('selectedRouteId');
        if (routeSearchEl) routeSearchEl.value = '';
        if (selectedRouteIdEl) selectedRouteIdEl.value = '';
        
        // 重置路线选择模式
        const routeDropdownEl = document.getElementById('routeDropdown');
        if (routeDropdownEl) routeDropdownEl.style.display = 'none';
    }
}

// 创建全局实例
window.fieldMapping = new FieldMapping();

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FieldMapping;
}