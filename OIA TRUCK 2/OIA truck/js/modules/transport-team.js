// 车队管理相关功能模块

// 存储车队数据的键名
const TRANSPORT_TEAMS_KEY = 'transportTeams';

// 初始化车队数据
function initTransportTeams() {
    const teams = localStorage.getItem(TRANSPORT_TEAMS_KEY);
    if (!teams) {
        const defaultTeams = [
            { id: 'team1', name: '通富', contact: '', phone: '' },
            { id: 'team2', name: '正丰', contact: '', phone: '' },
            { id: 'team3', name: '祥隆', contact: '', phone: '' }
        ];
        localStorage.setItem(TRANSPORT_TEAMS_KEY, JSON.stringify(defaultTeams));
    }
    loadTransportTeams();
}

// 加载车队数据到下拉列表
function loadTransportTeams() {
    const teams = JSON.parse(localStorage.getItem(TRANSPORT_TEAMS_KEY) || '[]');
    const select = document.getElementById('transportTeam');

    // 清空现有选项，保留默认选项
    select.innerHTML = '<option value="">请选择车队</option>';

    // 添加车队选项
    teams.forEach(team => {
        const option = document.createElement('option');
        option.value = team.id;
        option.textContent = team.name;
        select.appendChild(option);
    });
}

// 打开新增车队模态框
function openTransportTeamModal() {
    document.getElementById('transportTeamModal').style.display = 'block';
    // 清空表单
    document.getElementById('teamName').value = '';
    document.getElementById('teamContact').value = '';
    document.getElementById('teamPhone').value = '';
}

// 关闭新增车队模态框
function closeTransportTeamModal() {
    document.getElementById('transportTeamModal').style.display = 'none';
}

// 保存新增车队
function saveTransportTeam() {
    const name = document.getElementById('teamName').value.trim();
    const contact = document.getElementById('teamContact').value.trim();
    const phone = document.getElementById('teamPhone').value.trim();

    if (!name) {
        alert('请输入车队名称');
        return;
    }

    const teams = JSON.parse(localStorage.getItem(TRANSPORT_TEAMS_KEY) || '[]');

    // 检查是否存在同名车队
    if (teams.some(team => team.name === name)) {
        alert('车队名称已存在');
        return;
    }

    // 创建新车队数据
    const newTeam = {
        id: 'team' + (teams.length + 1),
        name,
        contact,
        phone
    };

    // 添加到存储
    teams.push(newTeam);
    localStorage.setItem(TRANSPORT_TEAMS_KEY, JSON.stringify(teams));

    // 刷新下拉列表
    loadTransportTeams();

    // 关闭模态框
    closeTransportTeamModal();
    alert('车队添加成功');
}

// 打开车队管理模态框
function openTeamManageModal() {
    document.getElementById('teamManageModal').style.display = 'block';
    loadTeamTable();
}

// 关闭车队管理模态框
function closeTeamManageModal() {
    document.getElementById('teamManageModal').style.display = 'none';
}

// 加载车队管理表格
function loadTeamTable() {
    const teams = JSON.parse(localStorage.getItem(TRANSPORT_TEAMS_KEY) || '[]');
    const tbody = document.getElementById('teamTable');
    tbody.innerHTML = '';

    teams.forEach(team => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${team.name}</td>
            <td>${team.contact || '-'}</td>
            <td>${team.phone || '-'}</td>
            <td>
                <button class="btn btn-sm btn-outline" onclick="deleteTeam('${team.id}')">删除</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 删除车队
function deleteTeam(teamId) {
    if (!confirm('确定要删除这个车队吗？')) {
        return;
    }

    let teams = JSON.parse(localStorage.getItem(TRANSPORT_TEAMS_KEY) || '[]');
    teams = teams.filter(team => team.id !== teamId);
    localStorage.setItem(TRANSPORT_TEAMS_KEY, JSON.stringify(teams));

    // 刷新表格和下拉列表
    loadTeamTable();
    loadTransportTeams();
}