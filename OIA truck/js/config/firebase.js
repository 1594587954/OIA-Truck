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

try {
    // 检查Firebase SDK是否已加载
    if (typeof firebase !== 'undefined') {
        app = firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        auth = firebase.auth();
        console.log('Firebase初始化成功');
    } else {
        console.error('Firebase SDK未加载');
    }
} catch (error) {
    console.error('Firebase初始化失败:', error);
}

// 导出Firebase实例
window.FirebaseConfig = {
    app,
    db,
    auth,
    config: firebaseConfig
};

// 数据库操作工具函数
window.FirebaseUtils = {
    // 添加文档
    async addDocument(collection, data) {
        try {
            const docRef = await db.collection(collection).add({
                ...data,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('文档添加成功，ID:', docRef.id);
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('添加文档失败:', error);
            return { success: false, error };
        }
    },

    // 获取文档列表
    async getDocuments(collection, orderBy = 'createdAt', limit = null) {
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
            console.error('获取文档失败:', error);
            return { success: false, error };
        }
    },

    // 更新文档
    async updateDocument(collection, docId, data) {
        try {
            await db.collection(collection).doc(docId).update({
                ...data,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('文档更新成功');
            return { success: true };
        } catch (error) {
            console.error('更新文档失败:', error);
            return { success: false, error };
        }
    },

    // 删除文档
    async deleteDocument(collection, docId) {
        try {
            await db.collection(collection).doc(docId).delete();
            console.log('文档删除成功');
            return { success: true };
        } catch (error) {
            console.error('删除文档失败:', error);
            return { success: false, error };
        }
    },

    // 实时监听文档变化
    listenToCollection(collection, callback, orderBy = 'createdAt') {
        return db.collection(collection)
            .orderBy(orderBy, 'desc')
            .onSnapshot(snapshot => {
                const documents = [];
                snapshot.forEach(doc => {
                    documents.push({ id: doc.id, ...doc.data() });
                });
                callback(documents);
            }, error => {
                console.error('监听失败:', error);
                callback(null, error);
            });
    }
};