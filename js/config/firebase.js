// Firebase配置文件
// 请在Firebase控制台获取您的配置信息并替换以下内容

// Firebase配置对象
const firebaseConfig = {
    apiKey: "your-api-key-here",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id",
    databaseURL: "https://your-project-default-rtdb.firebaseio.com/"
};

// 初始化Firebase
let app, db, auth;
let isFirebaseAvailable = false;

// Firebase初始化函数
function initializeFirebase() {
    try {
        // 检查Firebase SDK是否已加载
        if (typeof firebase !== 'undefined') {
            app = firebase.initializeApp(firebaseConfig);
            db = firebase.firestore();
            auth = firebase.auth();
            isFirebaseAvailable = true;
            console.log('✅ Firebase初始化成功');
            
            // 触发Firebase就绪事件
            window.dispatchEvent(new CustomEvent('firebaseReady'));
            return true;
        } else {
            console.warn('⚠️ Firebase SDK未加载，使用本地存储模式');
            return false;
        }
    } catch (error) {
        console.error('❌ Firebase初始化失败:', error);
        isFirebaseAvailable = false;
        return false;
    }
}

// 延迟初始化Firebase（等待SDK加载）
function waitForFirebaseAndInit() {
    let attempts = 0;
    const maxAttempts = 50; // 最多等待5秒
    
    const checkFirebase = () => {
        attempts++;
        
        if (typeof firebase !== 'undefined') {
            initializeFirebase();
        } else if (attempts < maxAttempts) {
            setTimeout(checkFirebase, 100);
        } else {
            console.warn('⚠️ Firebase SDK加载超时，系统将使用本地存储模式');
            // 触发本地模式事件
            window.dispatchEvent(new CustomEvent('firebaseUnavailable'));
        }
    };
    
    checkFirebase();
}

// 立即尝试初始化，如果失败则等待
if (!initializeFirebase()) {
    waitForFirebaseAndInit();
}

// 导出Firebase实例
window.FirebaseConfig = {
    app,
    db,
    auth,
    config: firebaseConfig,
    isAvailable: () => isFirebaseAvailable
};

// 本地存储工具函数
const LocalStorageUtils = {
    // 生成唯一ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // 获取当前时间戳
    getTimestamp() {
        return new Date().toISOString();
    },

    // 添加文档到本地存储
    addDocument(collection, data) {
        try {
            const id = this.generateId();
            const timestamp = this.getTimestamp();
            const document = {
                id,
                ...data,
                createdAt: timestamp,
                updatedAt: timestamp
            };
            
            const existingData = JSON.parse(localStorage.getItem(collection) || '[]');
            existingData.push(document);
            localStorage.setItem(collection, JSON.stringify(existingData));
            
            console.log('📱 文档添加到本地存储成功，ID:', id);
            return { success: true, id };
        } catch (error) {
            console.error('本地存储添加失败:', error);
            return { success: false, error };
        }
    },

    // 从本地存储获取文档
    getDocuments(collection, orderBy = 'createdAt', limit = null) {
        try {
            const data = JSON.parse(localStorage.getItem(collection) || '[]');
            
            // 排序
            data.sort((a, b) => {
                const aValue = new Date(a[orderBy] || 0);
                const bValue = new Date(b[orderBy] || 0);
                return bValue - aValue; // 降序
            });
            
            // 限制数量
            const result = limit ? data.slice(0, limit) : data;
            
            return { success: true, data: result };
        } catch (error) {
            console.error('本地存储获取失败:', error);
            return { success: false, error };
        }
    },

    // 更新本地存储文档
    updateDocument(collection, docId, data) {
        try {
            const existingData = JSON.parse(localStorage.getItem(collection) || '[]');
            const index = existingData.findIndex(doc => doc.id === docId);
            
            if (index !== -1) {
                existingData[index] = {
                    ...existingData[index],
                    ...data,
                    updatedAt: this.getTimestamp()
                };
                localStorage.setItem(collection, JSON.stringify(existingData));
                console.log('📱 本地存储文档更新成功');
                return { success: true };
            } else {
                throw new Error('文档未找到');
            }
        } catch (error) {
            console.error('本地存储更新失败:', error);
            return { success: false, error };
        }
    },

    // 删除本地存储文档
    deleteDocument(collection, docId) {
        try {
            const existingData = JSON.parse(localStorage.getItem(collection) || '[]');
            const filteredData = existingData.filter(doc => doc.id !== docId);
            localStorage.setItem(collection, JSON.stringify(filteredData));
            console.log('📱 本地存储文档删除成功');
            return { success: true };
        } catch (error) {
            console.error('本地存储删除失败:', error);
            return { success: false, error };
        }
    }
};

// 数据库操作工具函数（自动选择Firebase或本地存储）
window.FirebaseUtils = {
    // 添加文档
    async addDocument(collection, data) {
        if (isFirebaseAvailable && db) {
            try {
                const docRef = await db.collection(collection).add({
                    ...data,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                console.log('☁️ Firebase文档添加成功，ID:', docRef.id);
                return { success: true, id: docRef.id };
            } catch (error) {
                console.error('Firebase添加失败，回退到本地存储:', error);
                return LocalStorageUtils.addDocument(collection, data);
            }
        } else {
            return LocalStorageUtils.addDocument(collection, data);
        }
    },

    // 获取文档列表
    async getDocuments(collection, orderBy = 'createdAt', limit = null) {
        if (isFirebaseAvailable && db) {
            try {
                let query = db.collection(collection).orderBy(orderBy, 'desc');
                if (limit) {
                    query = query.limit(limit);
                }
                const snapshot = await query.get();
                const documents = [];
                snapshot.forEach(doc => {
                    documents.push({ id: doc.id, ...doc.data() });
                });
                return { success: true, data: documents };
            } catch (error) {
                console.error('Firebase获取失败，回退到本地存储:', error);
                return LocalStorageUtils.getDocuments(collection, orderBy, limit);
            }
        } else {
            return LocalStorageUtils.getDocuments(collection, orderBy, limit);
        }
    },

    // 更新文档
    async updateDocument(collection, docId, data) {
        if (isFirebaseAvailable && db) {
            try {
                await db.collection(collection).doc(docId).update({
                    ...data,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                console.log('☁️ Firebase文档更新成功');
                return { success: true };
            } catch (error) {
                console.error('Firebase更新失败，回退到本地存储:', error);
                return LocalStorageUtils.updateDocument(collection, docId, data);
            }
        } else {
            return LocalStorageUtils.updateDocument(collection, docId, data);
        }
    },

    // 删除文档
    async deleteDocument(collection, docId) {
        if (isFirebaseAvailable && db) {
            try {
                await db.collection(collection).doc(docId).delete();
                console.log('☁️ Firebase文档删除成功');
                return { success: true };
            } catch (error) {
                console.error('Firebase删除失败，回退到本地存储:', error);
                return LocalStorageUtils.deleteDocument(collection, docId);
            }
        } else {
            return LocalStorageUtils.deleteDocument(collection, docId);
        }
    },

    // 实时监听文档变化（仅Firebase支持）
    listenToCollection(collection, callback, orderBy = 'createdAt') {
        if (isFirebaseAvailable && db) {
            return db.collection(collection)
                .orderBy(orderBy, 'desc')
                .onSnapshot(snapshot => {
                    const documents = [];
                    snapshot.forEach(doc => {
                        documents.push({ id: doc.id, ...doc.data() });
                    });
                    callback(documents);
                }, error => {
                    console.error('Firebase监听失败:', error);
                    callback(null, error);
                });
        } else {
            console.warn('⚠️ 实时监听功能需要Firebase支持，当前使用本地存储模式');
            // 返回一个空的取消监听函数
            return () => {};
        }
    },

    // 检查当前使用的存储模式
    getStorageMode() {
        return isFirebaseAvailable ? 'firebase' : 'localStorage';
    },

    // 手动同步本地数据到Firebase（当Firebase恢复可用时）
    async syncLocalToFirebase() {
        if (!isFirebaseAvailable || !db) {
            console.warn('Firebase不可用，无法同步');
            return { success: false, error: 'Firebase不可用' };
        }

        try {
            const collections = ['orders', 'customers', 'transportTeams']; // 根据实际需要调整
            let syncCount = 0;

            for (const collection of collections) {
                const localData = JSON.parse(localStorage.getItem(collection) || '[]');
                
                for (const doc of localData) {
                    // 检查Firebase中是否已存在
                    const existingDoc = await db.collection(collection).doc(doc.id).get();
                    
                    if (!existingDoc.exists) {
                        await db.collection(collection).doc(doc.id).set(doc);
                        syncCount++;
                    }
                }
            }

            console.log(`✅ 同步完成，共同步 ${syncCount} 条记录`);
            return { success: true, syncCount };
        } catch (error) {
            console.error('同步失败:', error);
            return { success: false, error };
        }
    }
};