// 通用工具函数模块
// 工具函数集合 - 提供通用的工具方法和常量

// 常量定义
const CONSTANTS = {
    LOGO_URL: 'https://www.oiaglobal.com/wp-content/themes/oiaglobal/images/OIA-Global.svg',
    PDF_CONFIG: {
        LOGO_STYLE: 'height: 90px; margin-bottom: 25px; background-color: #1a3a6c; padding: 15px; border-radius: 5px; border: 3px solid #1a3a6c; box-shadow: 0 0 8px rgba(0,0,0,0.3);',
        LOGO_CONTAINER_STYLE: 'text-align: center; margin-top: 20px; margin-bottom: 25px;'
    },
    DATE_FORMATS: {
        DISPLAY: 'YYYY-MM-DD HH:mm',
        ISO: 'YYYY-MM-DDTHH:mm:ss.sssZ'
    },
    STATUS: {
        PENDING: 'pending',
        PREPARING: 'preparing', 
        IN_TRANSIT: 'in-transit',
        COMPLETED: 'completed'
    }
};

// 存储工具函数（代理到数据管理器）
const StorageUtils = {
    get(key, defaultValue = null) {
        return window.dataManager ? window.dataManager.get(key, defaultValue) : defaultValue;
    },

    set(key, value) {
        return window.dataManager ? window.dataManager.set(key, value) : false;
    },

    remove(key) {
        return window.dataManager ? window.dataManager.remove(key) : false;
    },

    // 数据监听器（代理到数据管理器）
    addDataListener(key, callback) {
        if (window.dataManager) {
            window.dataManager.addListener(key, callback);
        }
    },

    removeDataListener(key, callback) {
        if (window.dataManager) {
            window.dataManager.removeListener(key, callback);
        }
    },

    // 便捷的数据访问方法
    async getOrders() {
        if (window.API) {
            return await window.API.getOrders();
        }
        return window.dataManager ? window.dataManager.getOrders() : [];
    },

    setOrders(orders) {
        return window.dataManager ? window.dataManager.setOrders(orders) : false;
    },

    getCustomerData() {
        return window.dataManager ? window.dataManager.getCustomerData() : {};
    },

    setCustomerData(customerData) {
        return window.dataManager ? window.dataManager.setCustomerData(customerData) : false;
    },

    getCustomers() {
        return window.dataManager ? window.dataManager.getCustomers() : [];
    },

    setCustomers(customers) {
        return window.dataManager ? window.dataManager.setCustomers(customers) : false;
    },

    getRoutes() {
        return window.dataManager ? window.dataManager.getRoutes() : [];
    },

    setRoutes(routes) {
        return window.dataManager ? window.dataManager.setRoutes(routes) : false;
    }
};

// 用户交互工具函数
const UIUtils = {
    // 创建通知元素
    createNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 4px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            max-width: 300px;
            word-wrap: break-word;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        // 设置不同类型的背景色
        const colors = {
            success: '#28a745',
            error: '#dc3545', 
            warning: '#ffc107',
            info: '#17a2b8'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // 动画显示
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // 自动隐藏
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
        
        return notification;
    },

    // 显示成功消息
    showSuccess(message, duration = 3000) {
        return this.createNotification(message, 'success', duration);
    },

    // 显示错误消息
    showError(message, duration = 5000) {
        return this.createNotification(message, 'error', duration);
    },

    // 显示警告消息
    showWarning(message, duration = 4000) {
        return this.createNotification(message, 'warning', duration);
    },

    // 显示信息消息
    showInfo(message, duration = 3000) {
        return this.createNotification(message, 'info', duration);
    },

    // 显示确认对话框
    confirm(message) {
        return confirm(message);
    },

    // 显示加载状态
    showLoading(message = '加载中...') {
        const loading = document.createElement('div');
        loading.id = 'global-loading';
        loading.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;
        
        loading.innerHTML = `
            <div style="
                background: white;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            ">
                <div style="
                    width: 40px;
                    height: 40px;
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #007bff;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 15px;
                "></div>
                <div>${message}</div>
            </div>
        `;
        
        // 添加旋转动画
        if (!document.getElementById('loading-styles')) {
            const style = document.createElement('style');
            style.id = 'loading-styles';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(loading);
        return loading;
    },

    // 隐藏加载状态
    hideLoading() {
        const loading = document.getElementById('global-loading');
        if (loading) {
            loading.remove();
        }
    }
};

// PDF生成工具函数
const PDFUtils = {
    // 检查PDF生成库是否可用
    checkLibraries() {
        if (typeof html2canvas === 'undefined' || (typeof jsPDF === 'undefined' && typeof window.jsPDF === 'undefined')) {
            UIUtils.showError('PDF生成库未加载，请刷新页面重试');
            return false;
        }
        return true;
    },

    // 获取jsPDF实例
    getPDFInstance() {
        return typeof jsPDF !== 'undefined' ? jsPDF : window.jsPDF;
    },

    // 生成公司logo HTML
    generateLogoHTML() {
        return `
            <div style="${CONSTANTS.PDF_CONFIG.LOGO_CONTAINER_STYLE}">
                <img src="${CONSTANTS.LOGO_URL}" alt="公司logo" style="${CONSTANTS.PDF_CONFIG.LOGO_STYLE}">
            </div>
        `;
    },

    // 生成PDF
    async generatePDF(container, formData, isReprint = false) {
        // 检查库是否加载
        if (!this.checkLibraries()) {
            return { success: false, error: 'PDF libraries not loaded' };
        }

        try {
            // 生成文件名
            // 格式：[派车单-Shipment-PO-提货日期-路线名称]
            const shipment = (formData.shipment || 'Unknown').replace(/[\\/:*?"<>|]/g, '_');
            const po = (formData.cw1no || formData.po || 'Unknown').replace(/[\\/:*?"<>|]/g, '_');
            const pickupDate = (formData.pickupDate || this.DateUtils?.getCurrentDate() || new Date().toISOString().split('T')[0]).replace(/[\\/:*?"<>|]/g, '_');
            const routeName = (formData.routeName || '未选择路线').replace(/[\\/:*?"<>|]/g, '_');
            
            const fileName = `派车单-${shipment}-${po}-${pickupDate}-${routeName}.pdf`;

            // 使用 html2canvas + jsPDF 直接生成文件
            const PDF = this.getPDFInstance();
            
            // 临时添加到body以确保渲染
            const tempContainer = container.cloneNode(true);
            tempContainer.style.position = 'fixed';
            tempContainer.style.left = '-9999px';
            tempContainer.style.top = '0';
            tempContainer.style.width = '210mm'; // A4 width
            tempContainer.style.backgroundColor = '#ffffff';
            tempContainer.style.zIndex = '-1';
            document.body.appendChild(tempContainer);

            // 高清配置
            const canvas = await html2canvas(tempContainer, {
                scale: 2, // 提高清晰度
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: tempContainer.scrollWidth,
                windowHeight: tempContainer.scrollHeight
            });

            // 移除临时容器
            document.body.removeChild(tempContainer);

            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const pdf = new PDF('p', 'mm', 'a4');
            
            const pageWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            
            // 计算适应宽度的尺寸
            let finalWidth = pageWidth;
            let finalHeight = canvas.height * pageWidth / canvas.width;
            
            // 如果高度超过一页，则缩放以适应高度（确保永远只有一页）
            if (finalHeight > pageHeight) {
                const scale = pageHeight / finalHeight;
                finalWidth = finalWidth * scale;
                finalHeight = pageHeight;
            }
            
            // 水平居中
            const x = (pageWidth - finalWidth) / 2;
            const y = 0; // 顶部对齐

            pdf.addImage(imgData, 'JPEG', x, y, finalWidth, finalHeight);

            pdf.save(fileName);
            return { success: true, fileName: fileName };

        } catch (error) {
            console.error('PDF生成失败:', error);
            return { success: false, error: error };
        }
    },

    // 废弃：使用浏览器原生打印功能生成PDF（文字版，非图片）
    printPDF(container, formData) {
        return new Promise((resolve, reject) => {
            try {
                // 创建隐藏的iframe
                const iframe = document.createElement('iframe');
                iframe.style.position = 'fixed';
                iframe.style.right = '0';
                iframe.style.bottom = '0';
                iframe.style.width = '0';
                iframe.style.height = '0';
                iframe.style.border = '0';
                
                document.body.appendChild(iframe);
                
                const doc = iframe.contentWindow.document;
                
                // 获取容器的ID和样式
                const containerId = container.id || 'print-content';
                const containerStyle = container.getAttribute('style') || '';
                
                // 获取页面所有的样式表
                const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
                    .map(style => style.outerHTML)
                    .join('');
                
                // 生成文件名用于标题
                // 格式：[派车单-Shipment-PO-提货日期-路线名称]
                const shipment = formData.shipment || 'Unknown'; // Shipment在第一个位置
                const po = formData.cw1no || formData.po || 'Unknown'; // PO在第二个位置
                const pickupDate = formData.pickupDate || this.DateUtils?.getCurrentDate() || new Date().toISOString().split('T')[0];
                const routeName = formData.routeName || '未选择路线';
                
                const title = `派车单-${shipment}-${po}-${pickupDate}-${routeName}`;

                // 写入内容
                doc.open();
                doc.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>${title}</title>
                        <meta charset="UTF-8">
                        ${styles}
                        <style>
                            body { 
                                background: white; 
                                margin: 0; 
                                padding: 0; 
                                -webkit-print-color-adjust: exact; 
                                print-color-adjust: exact; 
                            }
                            @media print {
                                @page { 
                                    size: A4; 
                                    margin: 0; 
                                }
                                body { 
                                    -webkit-print-color-adjust: exact; 
                                    print-color-adjust: exact; 
                                }
                                .no-print { display: none; }
                            }
                            /* 重写容器样式，确保在iframe中正确显示 */
                            #${containerId} { 
                                ${containerStyle} 
                                position: relative !important; 
                                left: auto !important; 
                                top: auto !important;
                                margin: 0 auto !important;
                                box-shadow: none !important;
                            }
                        </style>
                    </head>
                    <body>
                        <div id="${containerId}">
                            ${container.innerHTML}
                        </div>
                        <script>
                            // 等待图片加载完成
                            window.onload = function() {
                                // 稍微延迟以确保渲染完成
                                setTimeout(function() {
                                    window.print();
                                }, 100);
                            };
                        </script>
                    </body>
                    </html>
                `);
                doc.close();

                // 监听打印完成（无法精确检测取消/确认，只能近似处理）
                // 给用户足够的时间进行打印操作，然后再移除iframe
                setTimeout(() => {
                    // 不立即移除，以免打印对话框还没出来就被移除了
                    // 大部分浏览器打印是阻塞的，所以这行代码会在打印对话框关闭后执行
                    // 但为了保险起见，设置一个较长的超时
                    if (document.body.contains(iframe)) {
                        document.body.removeChild(iframe);
                    }
                    resolve({ success: true, fileName: title + '.pdf' });
                }, 1000);
                
            } catch (error) {
                console.error('打印失败:', error);
                reject(error);
            }
        });
    },

    // 旧的基于图片的PDF生成函数（保留作为备用）
    async generateImagePDF(container, formData, isReprint = false) {
        if (!this.checkLibraries()) {
            return false;
        }

        const PDF = this.getPDFInstance();

        try {
            const canvas = await html2canvas(container, {
                scale: 1.5,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
                removeContainer: true
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.85);
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;

            const a4Width = 210;
            const a4Height = 297;
            const margin = 3;
            const contentWidth = a4Width - 2 * margin;
            const contentHeight = a4Height - 2 * margin;

            const scaleX = contentWidth / (imgWidth * 0.264583);
            const scaleY = contentHeight / (imgHeight * 0.264583);
            const scale = Math.min(scaleX, scaleY, 1);

            const scaledWidth = (imgWidth * 0.264583) * scale;
            const scaledHeight = (imgHeight * 0.264583) * scale;

            const needMultiplePages = scaledHeight > contentHeight;
            
            const pdf = new PDF('p', 'mm', 'a4');
            
            if (needMultiplePages) {
                const pageHeight = contentHeight;
                const totalPages = Math.ceil(scaledHeight / pageHeight);
                
                for (let i = 0; i < totalPages; i++) {
                    if (i > 0) pdf.addPage();
                    
                    const yOffset = -i * pageHeight;
                    pdf.addImage(imgData, 'JPEG', margin, margin + yOffset, scaledWidth, scaledHeight);
                }
            } else {
                const x = margin + (contentWidth - scaledWidth) / 2;
                const y = margin + (contentHeight - scaledHeight) / 2;
                pdf.addImage(imgData, 'JPEG', x, y, scaledWidth, scaledHeight);
            }

            const reprintPrefix = isReprint ? '重打-' : '';
            const shipment = formData.po || 'Unknown';
            const po = formData.cw1no || formData.shipment || 'Unknown';
            const pickupDate = formData.pickupDate || Utils.DateUtils.getCurrentDate();
            const fileName = `${reprintPrefix}派车单-${shipment}/${po}-${pickupDate}.pdf`;

            pdf.save(fileName);

            return { success: true, fileName };
        } catch (error) {
            console.error('PDF生成错误:', error);
            UIUtils.showError('生成PDF时出错，请重试');
            return { success: false, error };
        }
    }
};

// 表单验证工具函数
const ValidationUtils = {
    // 检查必填字段
    validateRequired(value, fieldName) {
        if (!value || value.trim() === '') {
            UIUtils.showError(`请填写${fieldName}`);
            return false;
        }
        return true;
    },

    // 验证Shipment信息
    validatePOShipment(po) {
        return this.validateRequired(po, 'Shipment信息');
    },

    // 验证PO或Shipment信息（任意填写一个即可）
    validatePOOrShipment(po, shipment) {
        if (!po && !shipment) {
            UIUtils.showError('请至少填写PO或Shipment中的一项');
            return false;
        }
        return true;
    },

    // 验证TO车队
    validateTransportTeam(transportTeam) {
        return this.validateRequired(transportTeam, 'TO车队');
    },

    // 验证车型
    validateVehicleType(vehicleType) {
        return this.validateRequired(vehicleType, '车型');
    },

    // 验证日期逻辑：送货日期必须大于或等于提货日期
    validateDeliveryDate(pickupDate, deliveryDate) {
        if (!pickupDate || !deliveryDate) {
            return true; // 如果日期为空，跳过验证
        }
        
        const pickup = new Date(pickupDate);
        const delivery = new Date(deliveryDate);
        
        if (delivery < pickup) {
            UIUtils.showError('送货日期不能早于提货日期');
            return false;
        }
        return true;
    },

    // 验证客户信息
    validateCustomerInfo(customerInfo) {
        if (!customerInfo.name || !customerInfo.contact || !customerInfo.address) {
            UIUtils.showError('请填写必要的客户信息');
            return false;
        }
        return true;
    }
};

// 数组操作工具函数
const ArrayUtils = {
    // 根据ID删除数组中的项目
    removeById(array, id, idField = 'id') {
        return array.filter(item => item[idField] !== id);
    },

    // 根据ID查找数组中的项目
    findById(array, id, idField = 'id') {
        return array.find(item => item[idField] === id);
    },

    // 根据ID更新数组中的项目
    updateById(array, id, updates, idField = 'id') {
        return array.map(item => 
            item[idField] === id ? { ...item, ...updates } : item
        );
    }
};

// 导出工具函数
const ExportUtils = {
    // 导出为CSV
    exportToCSV(data, filename, headers) {
        const csvContent = this.arrayToCSV(data, headers);
        this.downloadCSV(csvContent, filename);
    },

    // 将数组转换为CSV格式
    arrayToCSV(data, headers) {
        const headerRow = headers.join(',');
        const dataRows = data.map(row => 
            headers.map(header => {
                const value = row[header] || '';
                return `"${String(value).replace(/"/g, '""')}"`;
            }).join(',')
        );
        return [headerRow, ...dataRows].join('\n');
    },

    // 下载CSV文件
    downloadCSV(csvContent, filename) {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

// 导出所有工具函数
window.Utils = {
    CONSTANTS,
    StorageUtils,
    UIUtils,
    PDFUtils,
    ValidationUtils,
    ArrayUtils,
    ExportUtils
};