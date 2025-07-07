# 派车单管理系统 - 动态网页版

这是一个现代化的派车单管理系统，支持本地存储和云端数据同步功能。

## 功能特性

### 🚀 动态网页功能
- **实时数据同步**: 支持多设备间数据实时同步
- **离线工作**: 网络断开时自动切换到本地存储模式
- **云端备份**: 数据自动备份到云端数据库
- **响应式设计**: 适配各种设备屏幕

### 📋 核心功能
- 派车单创建和管理
- 客户信息管理
- 路线规划
- PDF报表生成
- 数据统计和分析

## 技术架构

### 前端技术
- **HTML5/CSS3/JavaScript**: 原生Web技术
- **模块化设计**: 组件化开发模式
- **响应式布局**: 支持移动端和桌面端

### 后端服务
- **Firebase Firestore**: 云端数据库
- **实时监听**: 数据变化实时推送
- **离线支持**: 本地缓存机制

## 快速开始

### 1. 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问应用
# 打开浏览器访问 http://localhost:3000
```

### 2. GitHub Pages 部署

```bash
# 安装 gh-pages 依赖
npm install

# 部署到 GitHub Pages
npm run deploy-github
```

**自动部署设置：**
1. 将代码推送到 GitHub 仓库
2. 在仓库设置中启用 GitHub Pages
3. 选择 GitHub Actions 作为部署源
4. 推送到 main 分支时会自动部署

### 3. Firebase配置

1. 创建Firebase项目:
   - 访问 [Firebase Console](https://console.firebase.google.com/)
   - 创建新项目
   - 启用Firestore数据库

2. 获取配置信息:
   - 在项目设置中找到Web应用配置
   - 复制配置对象

3. 更新配置文件:
   ```javascript
   // 编辑 js/modules/firebase.js
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "your-app-id"
   };
   ```

### 3. Netlify部署

#### 方法一: 通过Git连接

1. 将代码推送到GitHub/GitLab
2. 在Netlify中连接仓库
3. 设置构建命令:
   ```
   Build command: npm run build
   Publish directory: dist
   ```

#### 方法二: 手动部署

1. 构建项目:
   ```bash
   npm run build
   ```

2. 将`dist`文件夹拖拽到Netlify部署页面

#### 环境变量配置

在Netlify中设置以下环境变量:
```
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=your-app-id
```

## 使用指南

### 网络状态指示器
- **绿色"在线模式"**: 已连接到云端数据库
- **红色"离线模式"**: 使用本地存储

### 数据同步
- 在线时，所有操作自动同步到云端
- 离线时，数据保存在本地
- 重新连接后，本地数据会自动上传

### 多设备使用
- 使用相同的Firebase项目配置
- 数据在所有设备间实时同步
- 支持多人协作

## 文件结构

```
XL/
├── index.html              # 主页面
├── package.json            # 项目配置
├── README.md              # 说明文档
├── style/                 # 样式文件
│   ├── common.css
│   ├── card-styles.css
│   └── pdf-styles.css
└── js/
    ├── index.js           # 主入口文件
    └── modules/           # 功能模块
        ├── firebase.js    # Firebase配置
        ├── api.js         # API服务层
        ├── utils.js       # 工具函数
        ├── storage.js     # 存储管理
        ├── dashboard.js   # 仪表盘
        ├── orders.js      # 订单管理
        ├── customer.js    # 客户管理
        ├── dispatch.js    # 派车管理
        ├── navigation.js  # 导航功能
        └── transport-team.js # 运输团队
```

## 开发指南

### 添加新功能

1. 在`js/modules/`中创建新模块
2. 使用`StorageUtils`进行数据操作
3. 添加必要的CSS样式
4. 在`index.js`中注册模块

### 数据操作

```javascript
// 获取数据（自动支持云端/本地）
const orders = await StorageUtils.getOrders();

// 保存数据（自动同步）
StorageUtils.setOrders(newOrders);

// 监听数据变化
StorageUtils.addDataListener('orders', (data) => {
    console.log('订单数据已更新:', data);
});
```

## 故障排除

### 常见问题

1. **Firebase连接失败**
   - 检查网络连接
   - 验证Firebase配置
   - 确认Firestore规则设置

2. **数据不同步**
   - 检查网络状态指示器
   - 刷新页面重试
   - 查看浏览器控制台错误

3. **部署问题**
   - 确认构建命令正确
   - 检查环境变量设置
   - 验证文件路径

### 调试模式

打开浏览器开发者工具，查看控制台输出:
- 绿色日志: 正常操作
- 黄色警告: 功能降级
- 红色错误: 需要处理的问题

## 更新日志

### v2.0.0 (动态网页版)
- ✅ 添加Firebase云端数据库支持
- ✅ 实现离线/在线模式切换
- ✅ 添加实时数据同步
- ✅ 优化用户体验
- ✅ 支持Netlify部署

### v1.0.0 (静态版)
- ✅ 基础派车单管理功能
- ✅ 本地数据存储
- ✅ PDF报表生成

## 支持与反馈

如有问题或建议，请通过以下方式联系:
- 创建GitHub Issue
- 发送邮件反馈
- 在线技术支持

---

**注意**: 首次使用时需要配置Firebase项目，详细步骤请参考上述配置指南。