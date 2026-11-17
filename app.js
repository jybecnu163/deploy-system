(function () {
    'use strict';

    const STORAGE_KEY = 'deploy-static-demo:v2';
    const ENV_ORDER = ['dev', 'test', 'prod'];
    const ENV_LABEL = {dev: 'DEV', test: 'TEST', prod: 'PROD'};
    const IMPORTANCE_LABEL = {light: '轻', middle: '中', important: '重要'};
    const STATUS_LABEL = {
        pending: '等待中',
        pending_approval: '等待审批',
        approved: '审批通过',
        running: '发布中',
        batch_running: '批次执行中',
        batch_success: '批次成功',
        success: '发布成功',
        failed: '发布失败',
        rollback: '回滚中',
        rollback_success: '回滚成功',
        rollback_failed: '回滚失败',
        rejected: '审批拒绝'
    };

    function seedDB() {
        return {
            version: 2,
            apps: [
                {
                    id: 1001, name: 'order-service', chineseName: '订单服务', owner: 'zhangsan',
                    ownerEmail: 'zhangsan@example.com', org: '电商事业部', productLine: '交易平台',
                    createdAt: '2024-01-10 10:00:00', updatedAt: '2024-05-15 14:30:00',
                    description: '处理用户订单的核心服务', status: 'active', importance: 'middle'
                },
                {
                    id: 1002, name: 'payment-api', chineseName: '支付 API', owner: 'lisi',
                    ownerEmail: 'lisi@example.com', org: '电商事业部', productLine: '交易平台',
                    createdAt: '2024-02-15 09:00:00', updatedAt: '2024-05-18 11:20:00',
                    description: '处理支付请求的 API 服务', status: 'active', importance: 'light'
                },
                {
                    id: 1003, name: 'user-center', chineseName: '用户中心', owner: 'wangwu',
                    ownerEmail: 'wangwu@example.com', org: '基础平台部', productLine: '用户平台',
                    createdAt: '2024-03-20 16:40:00', updatedAt: '2024-05-20 10:10:00',
                    description: '统一用户资料与权限接入服务', status: 'active', importance: 'important'
                }
            ],
            registeredClusters: [
                {
                    id: 1, name: 'k8s-shanghai-test', envType: 'test',
                    apiEndpoint: 'https://k8s-test.example.com:6443', status: 'online',
                    lastHeartbeat: '2026-11-17 09:30:00', kubeconfig: 'apiVersion: v1\nclusters: []'
                },
                {
                    id: 2, name: 'k8s-shanghai-prod', envType: 'prod',
                    apiEndpoint: 'https://k8s-prod.example.com:6443', status: 'online',
                    lastHeartbeat: '2026-11-17 09:29:00', kubeconfig: 'apiVersion: v1\nclusters: []'
                },
                {
                    id: 3, name: 'k8s-beijing-dev', envType: 'dev',
                    apiEndpoint: 'https://k8s-dev.example.com:6443', status: 'offline',
                    lastHeartbeat: '2026-11-16 18:00:00', kubeconfig: ''
                }
            ],
            envNamespaces: {
                1: [{env: 'dev', namespace: 'app-dev'}, {env: 'test', namespace: 'app-test'}],
                2: [{env: 'prod', namespace: 'app-prod'}],
                3: [{env: 'dev', namespace: 'bj-app-dev'}]
            },
            clusters: [
                {
                    id: 201, appId: 1001, name: 'order-dev-01', env: 'dev', region: 'cn-shanghai',
                    instances: 2, cpu: 2, memory: 4096, disk: 50, status: 'running',
                    serviceId: 1, registeredClusterId: 1, image: 'order-service:v1.1'
                },
                {
                    id: 202, appId: 1001, name: 'order-dev-02', env: 'dev', region: 'cn-beijing',
                    instances: 3, cpu: 2, memory: 4096, disk: 50, status: 'running',
                    serviceId: 1, registeredClusterId: 3, image: 'order-service:v1.1'
                },
                {
                    id: 203, appId: 1001, name: 'order-test-01', env: 'test', region: 'cn-shanghai',
                    instances: 4, cpu: 4, memory: 8192, disk: 100, status: 'running',
                    serviceId: 1, registeredClusterId: 1, image: 'order-service:v1.0'
                },
                {
                    id: 204, appId: 1001, name: 'order-prod-01', env: 'prod', region: 'cn-shanghai',
                    instances: 10, cpu: 8, memory: 16384, disk: 200, status: 'running',
                    serviceId: 2, registeredClusterId: 2, image: 'order-service:v1.0'
                },
                {
                    id: 301, appId: 1002, name: 'payment-dev-01', env: 'dev', region: 'cn-shanghai',
                    instances: 2, cpu: 2, memory: 4096, disk: 50, status: 'running',
                    serviceId: 3, registeredClusterId: 1, image: 'payment-api:v1.0'
                },
                {
                    id: 302, appId: 1002, name: 'payment-test-01', env: 'test', region: 'cn-shanghai',
                    instances: 2, cpu: 4, memory: 8192, disk: 100, status: 'running',
                    serviceId: 3, registeredClusterId: 1, image: 'payment-api:v1.0'
                },
                {
                    id: 303, appId: 1002, name: 'payment-prod-01', env: 'prod', region: 'cn-shanghai',
                    instances: 5, cpu: 8, memory: 16384, disk: 200, status: 'running',
                    serviceId: 3, registeredClusterId: 2, image: 'payment-api:v1.0'
                },
                {
                    id: 401, appId: 1003, name: 'user-dev-01', env: 'dev', region: 'cn-beijing',
                    instances: 1, cpu: 2, memory: 4096, disk: 50, status: 'running',
                    serviceId: 4, registeredClusterId: 3, image: 'user-center:v1.0'
                },
                {
                    id: 403, appId: 1003, name: 'user-prod-01', env: 'prod', region: 'cn-shanghai',
                    instances: 3, cpu: 4, memory: 8192, disk: 100, status: 'running',
                    serviceId: 4, registeredClusterId: 2, image: 'user-center:v0.9'
                }
            ],
            images: [
                {
                    id: 101, appId: 1001, name: 'order-service:v1.0', creator: 'zhangsan',
                    createdAt: '2024-01-15', releaseStatusDev: true, releaseStatusTest: true,
                    releaseStatusProd: true, deleted: false
                },
                {
                    id: 102, appId: 1001, name: 'order-service:v1.1', creator: 'zhangsan',
                    createdAt: '2024-02-20', releaseStatusDev: true, releaseStatusTest: false,
                    releaseStatusProd: false, deleted: false
                },
                {
                    id: 103, appId: 1001, name: 'order-service:v1.2', creator: 'lisi',
                    createdAt: '2024-03-10', releaseStatusDev: false, releaseStatusTest: false,
                    releaseStatusProd: false, deleted: false
                },
                {
                    id: 201, appId: 1002, name: 'payment-api:v1.0', creator: 'lisi',
                    createdAt: '2024-02-01', releaseStatusDev: true, releaseStatusTest: true,
                    releaseStatusProd: true, deleted: false
                },
                {
                    id: 202, appId: 1002, name: 'payment-api:v2.0', creator: 'wangwu',
                    createdAt: '2024-05-01', releaseStatusDev: false, releaseStatusTest: false,
                    releaseStatusProd: false, deleted: false
                },
                {
                    id: 301, appId: 1003, name: 'user-center:v1.0', creator: 'wangwu',
                    createdAt: '2024-03-25', releaseStatusDev: true, releaseStatusTest: false,
                    releaseStatusProd: false, deleted: false
                }
            ],
            services: [
                {
                    id: 1, appId: 1001, name: 'http-service', type: 'cluster_ip', port: 8080,
                    targetPort: 8080, protocol: 'TCP', enabled: true
                },
                {
                    id: 2, appId: 1001, name: 'grpc-service', type: 'cluster_ip', port: 9090,
                    targetPort: 9090, protocol: 'TCP', enabled: true
                },
                {
                    id: 3, appId: 1002, name: 'payment-http', type: 'node_port', port: 8080,
                    targetPort: 8080, protocol: 'TCP', enabled: true
                },
                {
                    id: 4, appId: 1003, name: 'user-http', type: 'cluster_ip', port: 8080,
                    targetPort: 8080, protocol: 'TCP', enabled: true
                }
            ],
            notifications: [
                {
                    id: 1, appId: 1001, type: 'release',
                    targets: 'zhangsan@example.com,lisi@example.com', webhook: 'https://webhook.example.com/order'
                },
                {id: 2, appId: 1001, type: 'scale', targets: 'zhangsan@example.com', webhook: ''},
                {id: 3, appId: 1003, type: 'release', targets: 'wangwu@example.com', webhook: ''}
            ],
            releaseHistory: [
                {
                    id: 1, appId: 1001, time: '2024-05-20 10:00:00', image: 'order-service:v1.0',
                    env: 'dev', operator: 'zhangsan', status: 'success'
                },
                {
                    id: 2, appId: 1001, time: '2024-05-21 14:30:00', image: 'order-service:v1.0',
                    env: 'test', operator: 'lisi', status: 'success'
                },
                {
                    id: 3, appId: 1002, time: '2024-05-18 11:00:00', image: 'payment-api:v1.0',
                    env: 'dev', operator: 'lisi', status: 'success'
                }
            ],
            approvals: [],
            releaseTasks: [],
            pods: {}
        };
    }

    let db = loadDB();
    let ui = defaultUI();
    let pollTimer = null;
    let pollingTaskId = null;

    function defaultUI() {
        return {
            sidebarOpen: true,
            appList: {keyword: '', page: 1},
            registered: {keyword: '', page: 1, checking: null},
            env: {selected: null},
            detail: {appId: null, tab: 0, imageKeyword: '', imagePage: 1, expanded: {}},
            release: {
                open: false, clusterId: '', imageId: '', strategyExpanded: false,
                running: false, taskId: null,
                strategy: {
                    batchRatio: 20, batchWaitTime: 30, timeoutSeconds: 300,
                    warmupSeconds: 30, healthCheckPath: '/health', healthCheckPort: 8080
                },
                progress: {status: '', currentBatch: 0, totalBatches: 0, message: '', errorMessage: ''}
            },
            modal: null
        };
    }

    function loadDB() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && parsed.version === 2) return parsed;
            }
        } catch (err) {
            console.warn('读取演示数据失败，使用初始数据', err);
        }
        return seedDB();
    }

    function saveDB() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
        } catch (err) {
            console.warn('保存演示数据失败', err);
        }
    }

    function esc(value) {
        return String(value === undefined || value === null ? '' : value)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function now() {
        return new Date().toLocaleString('zh-CN', {hour12: false});
    }

    function fmtDate(value) {
        if (!value) return '-';
        const normalized = String(value).replace(/-/g, '/').replace('T', ' ');
        const date = new Date(normalized);
        return isNaN(date.getTime()) ? String(value) : date.toLocaleString('zh-CN', {hour12: false});
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function nextId(list) {
        return list.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
    }

    function getPath(obj, path) {
        return path.split('.').reduce((acc, key) => (acc || {})[key], obj);
    }

    function setPath(obj, path, value) {
        const keys = path.split('.');
        const last = keys.pop();
        const target = keys.reduce((acc, key) => {
            if (!acc[key] || typeof acc[key] !== 'object') acc[key] = {};
            return acc[key];
        }, obj);
        target[last] = value;
    }

    function base64Encode(text) {
        const bytes = new TextEncoder().encode(text);
        let binary = '';
        bytes.forEach(byte => binary += String.fromCharCode(byte));
        return btoa(binary);
    }

    function statusKey(env) {
        return 'releaseStatus' + env.charAt(0).toUpperCase() + env.slice(1);
    }

    function getApp(id) {
        return db.apps.find(app => Number(app.id) === Number(id));
    }

    function getClusters(appId) {
        return db.clusters.filter(cluster => Number(cluster.appId) === Number(appId));
    }

    function getImages(appId) {
        return db.images.filter(image => Number(image.appId) === Number(appId) && !image.deleted);
    }

    function getServices(appId) {
        return db.services.filter(service => Number(service.appId) === Number(appId));
    }

    function getNotifications(appId) {
        return db.notifications.filter(item => Number(item.appId) === Number(appId));
    }

    function getNextEnv(image) {
        if (!image) return null;
        return ENV_ORDER.find(env => !image[statusKey(env)]) || null;
    }

    function needApproval(importance, env) {
        if (importance === 'light') return false;
        if (importance === 'middle') return env === 'prod';
        if (importance === 'important') return env === 'test' || env === 'prod';
        return false;
    }

    function getPods(clusterId) {
        const key = String(clusterId);
        const cluster = db.clusters.find(item => Number(item.id) === Number(clusterId));
        if (!cluster) return [];
        if (!db.pods[key]) {
            const count = Math.max(1, Number(cluster.instances) || 1);
            db.pods[key] = Array.from({length: count}, (_, index) => ({
                name: `${cluster.name}-pod-${index + 1}`,
                ip: `10.244.${Number(cluster.id) % 255}.${10 + index}`,
                status: 'Running',
                cpu: cluster.cpu || 1,
                memory: cluster.memory || 1024
            }));
            saveDB();
        }
        return db.pods[key];
    }

    function parseRoute() {
        const hash = location.hash || '#/apps';
        if (hash.startsWith('#/app/') && hash.endsWith('/detail')) {
            const id = hash.slice('#/app/'.length, -'/detail'.length);
            return {name: 'detail', appId: Number(id)};
        }
        if (hash.startsWith('#/registered-clusters')) return {name: 'registered'};
        if (hash.startsWith('#/env_namespace')) return {name: 'env'};
        return {name: 'apps'};
    }

    function showToast(message, type) {
        const root = document.getElementById('toast-root');
        const toast = document.createElement('div');
        toast.className = 'toast ' + (type || 'success');
        toast.textContent = message;
        root.appendChild(toast);
        setTimeout(() => toast.remove(), 3200);
    }

    function paginationHtml(total, pageSize, currentPage, action) {
        const pages = Math.max(1, Math.ceil(total / pageSize));
        const page = Math.min(Math.max(1, currentPage), pages);
        let html = '<div class="pagination">';
        html += `<button data-action="${action}" data-page="${page - 1}" ${page <= 1 ? 'disabled' : ''}>上一页</button>`;
        for (let i = 1; i <= pages; i++) {
            html += `<button data-action="${action}" data-page="${i}" class="${i === page ? 'active' : ''}">${i}</button>`;
        }
        html += `<button data-action="${action}" data-page="${page + 1}" ${page >= pages ? 'disabled' : ''}>下一页</button>`;
        return html + '</div>';
    }

    function renderPage(options) {
        const preserve = options && options.preserveFocus;
        const active = document.activeElement;
        const focus = preserve && active && active.id ? {
            id: active.id,
            start: typeof active.selectionStart === 'number' ? active.selectionStart : null,
            end: typeof active.selectionEnd === 'number' ? active.selectionEnd : null
        } : null;

        const route = parseRoute();
        if (route.name === 'detail' && ui.detail.appId !== route.appId) {
            ui.detail.appId = route.appId;
            ui.detail.tab = 0;
            ui.detail.imageKeyword = '';
            ui.detail.imagePage = 1;
            ui.detail.expanded = {};
            ui.release.open = false;
        }
        if (route.name !== 'detail') ui.release.open = false;

        document.getElementById('app').innerHTML = shellHtml(route);
        if (focus) {
            const node = document.getElementById(focus.id);
            if (node) {
                node.focus();
                if (focus.start !== null) {
                    try { node.setSelectionRange(focus.start, focus.end); } catch (err) { /* ignore */ }
                }
            }
        }
        updateDrawerState();
    }

    function shellHtml(route) {
        const nav = [
            {hash: '#/apps', label: '应用管理', icon: '▦', match: name => name === 'apps' || name === 'detail'},
            {hash: '#/registered-clusters', label: '集群管理', icon: '▣', match: name => name === 'registered'},
            {hash: '#/env_namespace', label: '环境集群管理', icon: '◫', match: name => name === 'env'}
        ];
        return `
<div class="layout">
    <aside class="sidebar ${ui.sidebarOpen ? '' : 'collapsed'}" id="sidebar">
        <div class="brand"><span class="brand-mark">P</span><span class="nav-label">发布控制台</span></div>
        <nav>
            ${nav.map(item => `<a href="${item.hash}" class="${item.match(route.name) ? 'active' : ''}"><span class="nav-icon">${item.icon}</span><span class="nav-label">${item.label}</span></a>`).join('')}
        </nav>
        <div class="spacer"></div>
        <button class="reset" data-action="reset-demo" title="重置演示数据">⟳ <span class="reset-label">重置演示数据</span></button>
    </aside>
    <div class="main">
        <header class="topbar">
            <button class="menu-btn" data-action="toggle-sidebar" title="展开/收起菜单">☰</button>
            <span class="title">服务 控制台</span>
            <span class="spacer"></span>
            <span class="user">演示用户: admin</span>
        </header>
        <main id="page">${pageHtml(route)}</main>
    </div>
</div>`;
    }

    function pageHtml(route) {
        switch (route.name) {
            case 'detail':
                return appDetailHtml(route.appId);
            case 'registered':
                return registeredPageHtml();
            case 'env':
                return envNamespacePageHtml();
            default:
                return appListHtml();
        }
    }

    function appListHtml() {
        const keyword = ui.appList.keyword.trim().toLowerCase();
        const filtered = db.apps.filter(app =>
            !keyword || [app.name, app.chineseName, app.owner].some(value => String(value || '').toLowerCase().includes(keyword))
        );
        const pageSize = 10;
        const page = Math.min(ui.appList.page, Math.max(1, Math.ceil(filtered.length / pageSize)));
        const rows = filtered.slice((page - 1) * pageSize, page * pageSize);
        return `
<section class="card">
    <div class="toolbar">
        <div><h2>应用列表</h2><div class="muted">共 ${filtered.length} 个应用 · 静态演示数据</div></div>
        <span class="chip">Spring Boot 静态页面</span>
    </div>
    <div class="table-tools">
        <input id="app-search" class="search" type="text" placeholder="搜索应用名称、中文名或负责人"
               value="${esc(ui.appList.keyword)}" data-bind="appList.keyword">
    </div>
    <div class="table-wrap">
        <table>
            <thead><tr><th>App ID</th><th>应用名称</th><th>负责人</th><th>创建时间</th><th>重要性</th><th>操作</th></tr></thead>
            <tbody>
            ${rows.length ? rows.map(app => `
                <tr>
                    <td>${app.id}</td>
                    <td>${esc(app.chineseName || app.name)} <span class="muted">(${esc(app.name)})</span></td>
                    <td>${esc(app.owner)}</td>
                    <td>${fmtDate(app.createdAt)}</td>
                    <td><span class="chip ${app.importance}">${IMPORTANCE_LABEL[app.importance] || '-'}</span></td>
                    <td><a href="#/app/${app.id}/detail">详情</a></td>
                </tr>`).join('') : '<tr><td class="empty" colspan="6">暂无应用数据</td></tr>'}
            </tbody>
        </table>
    </div>
    ${paginationHtml(filtered.length, pageSize, page, 'app-page')}
</section>`;
    }

    function appDetailHtml(appId) {
        const app = getApp(appId);
        if (!app) {
            return `<section class="card"><h2>应用不存在</h2><p><a href="#/apps">返回应用列表</a></p></section>`;
        }
        const tabs = ['集群管理', '镜像管理', '服务配置', '通知配置'];
        let tabContent = '';
        switch (Number(ui.detail.tab)) {
            case 1:
                tabContent = imageTabHtml(app);
                break;
            case 2:
                tabContent = serviceTabHtml(app);
                break;
            case 3:
                tabContent = notificationTabHtml(app);
                break;
            default:
                tabContent = clusterTabHtml(app);
        }
        return `
<div class="page-head"><a href="#/apps">← 返回应用列表</a></div>
${infoCardHtml(app)}
<div class="tabs">
    ${tabs.map((label, index) => `<button class="${Number(ui.detail.tab) === index ? 'active' : ''}" data-action="tab" data-tab="${index}">${label}</button>`).join('')}
</div>
<section class="card tab-card">${tabContent}</section>
${ui.release.open ? releaseDrawerHtml(app) : ''}`;
    }

    function infoCardHtml(app) {
        const fields = [
            ['负责人', app.owner], ['邮箱', app.ownerEmail], ['组织', app.org],
            ['产品线', app.productLine], ['创建时间', fmtDate(app.createdAt)],
            ['更新时间', fmtDate(app.updatedAt)], ['描述', app.description]
        ];
        return `
<section class="card">
    <div class="info-head">
        <span class="avatar">${esc((app.chineseName || app.name || '?').charAt(0))}</span>
        <h1>${esc(app.chineseName)} (${esc(app.name)})</h1>
        <span class="chip ${app.status === 'active' ? 'online' : 'offline'}">${app.status === 'active' ? '运行中' : '已停止'}</span>
        <span class="chip ${app.importance}">${IMPORTANCE_LABEL[app.importance] || '-'}</span>
        <button class="icon-btn" data-action="open-importance" title="修改重要性">✎</button>
        <span class="spacer"></span>
        <button class="btn primary" data-action="open-release">发布</button>
    </div>
    <div class="info-grid">
        ${fields.map(([label, value]) => `<div><div class="label">${label}</div><div class="value">${esc(value || '-')}</div></div>`).join('')}
    </div>
</section>`;
    }

    function clusterTabHtml(app) {
        const clusters = getClusters(app.id);
        return `
<div class="toolbar">
    <div><h3>集群管理</h3><div class="muted">展开行可查看机器（Pod）列表</div></div>
    <button class="btn primary" data-action="add-cluster">＋ 新增集群</button>
</div>
<div class="table-wrap">
    <table>
        <thead><tr><th></th><th>名称</th><th>环境</th><th>区域</th><th>实例数</th><th>CPU</th><th>内存(MB)</th><th>磁盘(GB)</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
        ${clusters.length ? clusters.map(cluster => {
            const expanded = !!ui.detail.expanded[cluster.id];
            const pods = getPods(cluster.id);
            return `
            <tr>
                <td><button class="icon-btn" data-action="toggle-cluster" data-id="${cluster.id}">${expanded ? '▴' : '▾'}</button></td>
                <td>${esc(cluster.name)}</td>
                <td><span class="chip ${cluster.env}">${ENV_LABEL[cluster.env] || String(cluster.env).toUpperCase()}</span></td>
                <td>${esc(cluster.region || '-')}</td>
                <td>${cluster.instances}</td><td>${cluster.cpu}</td><td>${cluster.memory}</td><td>${cluster.disk}</td>
                <td><span class="chip ${cluster.status}">${esc(cluster.status)}</span></td>
                <td class="actions">
                    <button class="icon-btn" data-action="edit-cluster" data-id="${cluster.id}" title="编辑">✎</button>
                    <button class="icon-btn danger" data-action="delete-cluster" data-id="${cluster.id}" title="删除">🗑</button>
                    ${cluster.serviceId ? `<button class="btn small warn" data-action="unbind-service" data-id="${cluster.id}">解绑服务</button>` : ''}
                </td>
            </tr>
            ${expanded ? `<tr class="detail-row"><td colspan="10"><div class="detail-inner">
                <strong>机器列表</strong>
                <table class="subtable">
                    <thead><tr><th>名称</th><th>IP</th><th>状态</th><th>CPU</th><th>内存(MB)</th><th>操作</th></tr></thead>
                    <tbody>${pods.map(pod => `
                        <tr>
                            <td>${esc(pod.name)}</td><td>${esc(pod.ip || '-')}</td>
                            <td><span class="chip ${pod.status === 'Running' ? 'online' : 'offline'}">${esc(pod.status)}</span></td>
                            <td>${pod.cpu}</td><td>${pod.memory}</td>
                            <td><button class="btn small" data-action="toggle-pod" data-cluster="${cluster.id}" data-pod="${esc(pod.name)}">${pod.status === 'Running' ? '下线' : '上线'}</button></td>
                        </tr>`).join('')}</tbody>
                </table>
            </div></td></tr>` : ''}`;
        }).join('') : '<tr><td class="empty" colspan="10">暂无集群数据</td></tr>'}
        </tbody>
    </table>
</div>`;
    }

    function imageStatusCell(image, env) {
        const active = !!image[statusKey(env)];
        return `<span class="${active ? 'ok' : 'no'}" title="${ENV_LABEL[env]} ${active ? '已发布' : '未发布'}">${active ? '✓' : '✗'}</span>`;
    }

    function imageTabHtml(app) {
        const keyword = ui.detail.imageKeyword.trim().toLowerCase();
        const all = getImages(app.id);
        const filtered = all.filter(image =>
            !keyword || [image.name, image.creator].some(value => String(value || '').toLowerCase().includes(keyword))
        );
        const pageSize = 10;
        const page = Math.min(ui.detail.imagePage, Math.max(1, Math.ceil(filtered.length / pageSize)));
        const rows = filtered.slice((page - 1) * pageSize, page * pageSize);
        return `
<div class="toolbar">
    <div><h3>镜像管理</h3><div class="muted">镜像按 DEV → TEST → PROD 顺序逐级发布</div></div>
    <button class="btn primary" data-action="add-image">＋ 新增镜像</button>
</div>
<div class="table-tools">
    <input id="image-search" class="search" type="text" placeholder="搜索镜像名称或创建人"
           value="${esc(ui.detail.imageKeyword)}" data-bind="detail.imageKeyword">
</div>
<div class="table-wrap">
    <table>
        <thead><tr><th>镜像名称</th><th>创建人</th><th>创建时间</th><th style="text-align:center">DEV</th><th style="text-align:center">TEST</th><th style="text-align:center">PROD</th><th>操作</th></tr></thead>
        <tbody>
        ${rows.length ? rows.map(image => `
            <tr>
                <td>${esc(image.name)}</td><td>${esc(image.creator || '-')}</td><td>${fmtDate(image.createdAt)}</td>
                <td style="text-align:center">${imageStatusCell(image, 'dev')}</td>
                <td style="text-align:center">${imageStatusCell(image, 'test')}</td>
                <td style="text-align:center">${imageStatusCell(image, 'prod')}</td>
                <td class="actions">
                    <button class="icon-btn" data-action="edit-image" data-id="${image.id}" title="编辑">✎</button>
                    <button class="icon-btn danger" data-action="delete-image" data-id="${image.id}" title="删除">🗑</button>
                </td>
            </tr>`).join('') : '<tr><td class="empty" colspan="7">暂无镜像数据</td></tr>'}
        </tbody>
    </table>
</div>
${paginationHtml(filtered.length, pageSize, page, 'image-page')}`;
    }

    function serviceTabHtml(app) {
        const services = getServices(app.id);
        const typeLabel = {cluster_ip: 'ClusterIP', node_port: 'NodePort', load_balancer: 'LoadBalancer'};
        return `
<div class="toolbar">
    <div><h3>服务配置</h3></div>
    <button class="btn primary" data-action="add-service">＋ 新增服务配置</button>
</div>
<div class="table-wrap">
    <table>
        <thead><tr><th>名称</th><th>类型</th><th>端口</th><th>目标端口</th><th>协议</th><th>启用</th><th>操作</th></tr></thead>
        <tbody>
        ${services.length ? services.map(service => `
            <tr>
                <td>${esc(service.name)}</td><td>${typeLabel[service.type] || esc(service.type)}</td>
                <td>${service.port}</td><td>${service.targetPort}</td><td>${esc(service.protocol)}</td>
                <td>${service.enabled ? '是' : '否'}</td>
                <td class="actions">
                    <button class="icon-btn" data-action="edit-service" data-id="${service.id}">✎</button>
                    <button class="icon-btn danger" data-action="delete-service" data-id="${service.id}">🗑</button>
                </td>
            </tr>`).join('') : '<tr><td class="empty" colspan="7">暂无服务配置</td></tr>'}
        </tbody>
    </table>
</div>`;
    }

    function notificationTabHtml(app) {
        const items = getNotifications(app.id);
        return `
<div class="toolbar">
    <div><h3>通知配置</h3></div>
    <button class="btn primary" data-action="add-notification">＋ 新增通知</button>
</div>
<div class="table-wrap">
    <table>
        <thead><tr><th>类型</th><th>通知目标</th><th>Webhook</th><th>操作</th></tr></thead>
        <tbody>
        ${items.length ? items.map(item => `
            <tr>
                <td>${item.type === 'release' ? '发布通知' : '扩缩容通知'}</td>
                <td>${esc(item.targets || '-')}</td><td>${esc(item.webhook || '-')}</td>
                <td class="actions">
                    <button class="icon-btn" data-action="edit-notification" data-id="${item.id}">✎</button>
                    <button class="icon-btn danger" data-action="delete-notification" data-id="${item.id}">🗑</button>
                </td>
            </tr>`).join('') : '<tr><td class="empty" colspan="4">暂无通知配置</td></tr>'}
        </tbody>
    </table>
</div>`;
    }

    function progressHtml() {
        const p = ui.release.progress;
        if (!p.status) return '';
        const total = Number(p.totalBatches) || 0;
        const current = Number(p.currentBatch) || 0;
        const percent = p.status === 'success' ? 100 : (total ? Math.round(current / total * 100) : 0);
        return `
<div class="progress-box">
    <div>发布进度：<span class="chip ${p.status}">${STATUS_LABEL[p.status] || esc(p.status)}</span></div>
    <div class="progress"><div style="width:${percent}%"></div></div>
    <div class="muted">批次 ${current}/${total || '-'} · ${esc(p.message || '')}</div>
    ${p.errorMessage ? `<div class="hint error">${esc(p.errorMessage)}</div>` : ''}
</div>`;
    }

    function releaseDrawerHtml(app) {
        const clusters = getClusters(app.id);
        const images = getImages(app.id);
        const history = db.releaseHistory.filter(item => Number(item.appId) === Number(app.id)).slice(0, 8);
        const selectedImage = images.find(image => Number(image.id) === Number(ui.release.imageId));
        const nextEnv = getNextEnv(selectedImage);
        const strategy = ui.release.strategy;
        const disabled = ui.release.running ? 'disabled' : '';
        return `
<div class="drawer-backdrop" data-action="close-drawer"></div>
<aside class="drawer">
    <header><span>发布管理</span><button class="icon-btn" data-action="close-drawer" title="关闭">✕</button></header>
    <div class="drawer-body">
        <h3>发布操作</h3>
        <div class="form-row">
            <label>选择集群</label>
            <select id="release-cluster" data-release-field="clusterId" ${disabled}>
                <option value="">请选择集群</option>
                ${clusters.map(cluster => `<option value="${cluster.id}" ${String(ui.release.clusterId) === String(cluster.id) ? 'selected' : ''}>${esc(cluster.name)} (${ENV_LABEL[cluster.env] || String(cluster.env).toUpperCase()})</option>`).join('')}
            </select>
        </div>
        <div class="form-row">
            <label>选择镜像</label>
            <select id="release-image" data-release-field="imageId" ${disabled}>
                <option value="">请选择镜像</option>
                ${images.map(image => {
                    const env = getNextEnv(image);
                    return `<option value="${image.id}" ${String(ui.release.imageId) === String(image.id) ? 'selected' : ''}>${esc(image.name)} ${env ? `(可发布: ${ENV_LABEL[env]})` : '(已全发布)'}</option>`;
                }).join('')}
            </select>
        </div>
        <div class="collapse">
            <button data-action="toggle-strategy">发布策略配置 ${ui.release.strategyExpanded ? '▴' : '▾'}</button>
            ${ui.release.strategyExpanded ? `
            <div class="collapse-body">
                <div class="form-grid">
                    <div class="form-row"><label>批次比例</label>
                        <select data-release-field="strategy.batchRatio" ${disabled}>
                            ${[10, 20, 30, 50].map(ratio => `<option value="${ratio}" ${Number(strategy.batchRatio) === ratio ? 'selected' : ''}>${ratio}%</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-row"><label>批次等待时间(秒)</label><input type="number" min="0" data-release-field="strategy.batchWaitTime" value="${esc(strategy.batchWaitTime)}" ${disabled}></div>
                    <div class="form-row"><label>单次超时时间(秒)</label><input type="number" min="1" data-release-field="strategy.timeoutSeconds" value="${esc(strategy.timeoutSeconds)}" ${disabled}></div>
                    <div class="form-row"><label>启动预热时间(秒)</label><input type="number" min="0" data-release-field="strategy.warmupSeconds" value="${esc(strategy.warmupSeconds)}" ${disabled}></div>
                    <div class="form-row"><label>健康检查路径</label><input type="text" data-release-field="strategy.healthCheckPath" value="${esc(strategy.healthCheckPath)}" ${disabled}></div>
                    <div class="form-row"><label>健康检查端口</label><input type="number" min="1" data-release-field="strategy.healthCheckPort" value="${esc(strategy.healthCheckPort)}" ${disabled}></div>
                </div>
                <div class="muted" style="margin-top:10px">演示模式：批次等待按 1/10 加速；每批健康检查有 80% 成功率。</div>
            </div>` : ''}
        </div>
        ${nextEnv ? `<div class="hint">下一步可发布：<strong>${ENV_LABEL[nextEnv]}</strong>${needApproval(app.importance, nextEnv) ? ' · 需要审批' : ' · 无需审批'}</div>` : ''}
        <div id="release-progress">${progressHtml()}</div>
        <button id="release-submit" class="btn primary block" data-action="start-release" ${disabled || (!ui.release.clusterId || !ui.release.imageId ? 'disabled' : '')}>${ui.release.running ? '发布中...' : '发布'}</button>
        <h3 style="margin-top:24px">发布记录</h3>
        <div class="table-wrap">
            <table class="subtable">
                <thead><tr><th>时间</th><th>镜像</th><th>环境</th><th>状态</th></tr></thead>
                <tbody>${history.length ? history.map(item => `
                    <tr><td>${fmtDate(item.time)}</td><td>${esc(item.image)}</td><td>${ENV_LABEL[item.env] || esc(item.env)}</td><td><span class="chip ${item.status}">${STATUS_LABEL[item.status] || esc(item.status)}</span></td></tr>`).join('') : '<tr><td class="empty" colspan="4">暂无发布记录</td></tr>'}</tbody>
            </table>
        </div>
    </div>
</aside>`;
    }

    function registeredPageHtml() {
        const keyword = ui.registered.keyword.trim().toLowerCase();
        const filtered = db.registeredClusters.filter(cluster =>
            !keyword || [cluster.name, cluster.apiEndpoint].some(value => String(value || '').toLowerCase().includes(keyword))
        );
        const pageSize = 10;
        const page = Math.min(ui.registered.page, Math.max(1, Math.ceil(filtered.length / pageSize)));
        const rows = filtered.slice((page - 1) * pageSize, page * pageSize);
        return `
<section class="card">
    <div class="toolbar">
        <div><h2>物理集群注册</h2><div class="muted">kubeconfig 保存时做 Base64 编码演示（不会真正连接 Kubernetes）</div></div>
        <button class="btn primary" data-action="add-registered">＋ 注册集群</button>
    </div>
    <div class="table-tools">
        <input id="registered-search" class="search" type="text" placeholder="搜索集群名称或 API Endpoint"
               value="${esc(ui.registered.keyword)}" data-bind="registered.keyword">
    </div>
    <div class="table-wrap">
        <table>
            <thead><tr><th>ID</th><th>名称</th><th>API Endpoint</th><th>状态</th><th>最后心跳</th><th>操作</th></tr></thead>
            <tbody>
            ${rows.length ? rows.map(cluster => `
                <tr>
                    <td>${cluster.id}</td><td>${esc(cluster.name)}</td><td>${esc(cluster.apiEndpoint)}</td>
                    <td><span class="chip ${cluster.status}">${esc(cluster.status)}</span></td>
                    <td>${fmtDate(cluster.lastHeartbeat)}</td>
                    <td class="actions">
                        <button class="btn small" data-action="health-check" data-id="${cluster.id}" ${ui.registered.checking === cluster.id ? 'disabled' : ''}>健康检查</button>
                        <button class="icon-btn" data-action="edit-registered" data-id="${cluster.id}" title="编辑">✎</button>
                        <button class="icon-btn danger" data-action="delete-registered" data-id="${cluster.id}" title="删除">🗑</button>
                    </td>
                </tr>`).join('') : '<tr><td class="empty" colspan="6">暂无注册集群</td></tr>'}
            </tbody>
        </table>
    </div>
    ${paginationHtml(filtered.length, pageSize, page, 'registered-page')}
</section>`;
    }

    function envNamespacePageHtml() {
        if (!db.registeredClusters.some(cluster => Number(cluster.id) === Number(ui.env.selected))) {
            ui.env.selected = db.registeredClusters.length ? db.registeredClusters[0].id : null;
        }
        const selected = ui.env.selected;
        const mappings = selected ? (db.envNamespaces[String(selected)] || []) : [];
        return `
<section class="card">
    <div class="toolbar"><div><h2>环境-命名空间映射管理</h2><div class="muted">为物理集群配置 DEV / TEST / PROD 对应的 Namespace</div></div></div>
    <div class="form-row" style="max-width:480px">
        <label>选择物理集群</label>
        <select id="env-cluster-select">
            <option value="">请选择物理集群</option>
            ${db.registeredClusters.map(cluster => `<option value="${cluster.id}" ${Number(selected) === Number(cluster.id) ? 'selected' : ''}>${esc(cluster.name)} (${esc(cluster.apiEndpoint)})</option>`).join('')}
        </select>
    </div>
    ${selected ? `
        <div class="toolbar"><div class="muted">当前集群：${esc(db.registeredClusters.find(cluster => Number(cluster.id) === Number(selected)).name)}</div>
        <button class="btn primary" data-action="add-mapping">＋ 添加映射</button></div>
        <div class="table-wrap">
            <table>
                <thead><tr><th>环境</th><th>Namespace</th><th>操作</th></tr></thead>
                <tbody>${mappings.length ? mappings.map(mapping => `
                    <tr><td><span class="chip ${mapping.env}">${ENV_LABEL[mapping.env] || String(mapping.env).toUpperCase()}</span></td>
                    <td>${esc(mapping.namespace)}</td>
                    <td><button class="icon-btn danger" data-action="delete-mapping" data-env="${esc(mapping.env)}" title="删除">🗑</button></td></tr>`).join('') : '<tr><td class="empty" colspan="3">暂无映射</td></tr>'}</tbody>
            </table>
        </div>` : '<div class="hint warn">请先注册一个物理集群，再配置环境映射。</div>'}
</section>`;
    }

    function openModal(config) {
        ui.modal = config;
        renderModal();
    }

    function closeModal() {
        ui.modal = null;
        renderModal();
    }

    function renderModal() {
        const root = document.getElementById('modal-root');
        if (!ui.modal) {
            root.innerHTML = '';
            return;
        }
        const modal = ui.modal;
        const footer = modal.footer || `<button type="button" data-action="modal-cancel">取消</button><button type="submit" class="btn primary">${esc(modal.submitText || '保存')}</button>`;
        root.innerHTML = `
<div class="modal-backdrop">
    <div class="modal">
        <h3>${esc(modal.title)}</h3>
        <form id="modal-form">
            <div class="modal-content">${modal.body}</div>
            <footer>${footer}</footer>
        </form>
    </div>
</div>`;
    }

    function formRow(label, control) {
        return `<div class="form-row"><label>${label}</label>${control}</div>`;
    }

    function openImportanceModal(app) {
        const options = [
            ['light', '轻（无需审批）'],
            ['middle', '中（仅生产审批）'],
            ['important', '重（测试/生产均需审批）']
        ];
        openModal({
            title: '修改应用重要性',
            body: options.map(([value, label]) => `
                <label style="display:flex;gap:8px;align-items:center;margin:8px 0">
                    <input type="radio" name="importance" value="${value}" ${app.importance === value ? 'checked' : ''}> ${label}
                </label>`).join('') + '<div class="muted" style="margin-top:10px">重要性决定发布审批策略。</div>',
            onSubmit(form) {
                const importance = form.get('importance');
                if (!importance) return;
                app.importance = importance;
                app.updatedAt = now();
                saveDB();
                closeModal();
                renderPage();
                showToast('应用重要性已更新');
            }
        });
    }

    function openClusterModal(appId, editing) {
        const cluster = editing || {
            name: '', env: 'dev', region: 'cn-shanghai', instances: 1, cpu: 1,
            memory: 1024, disk: 20, registeredClusterId: db.registeredClusters.length ? db.registeredClusters[0].id : null,
            serviceId: null
        };
        const physicalOptions = db.registeredClusters.map(item => `<option value="${item.id}" ${Number(cluster.registeredClusterId) === Number(item.id) ? 'selected' : ''}>${esc(item.name)}</option>`).join('');
        const envOptions = (db.envNamespaces[String(cluster.registeredClusterId)] || [])
            .map(item => `<option value="${esc(item.env)}" ${cluster.env === item.env ? 'selected' : ''}>${ENV_LABEL[item.env] || String(item.env).toUpperCase()} / ${esc(item.namespace)}</option>`).join('');
        openModal({
            title: editing ? '编辑集群' : '新增集群',
            body: `
                ${formRow('集群名称', `<input type="text" name="name" value="${esc(cluster.name)}" placeholder="例如 order-dev-01">`)}
                <div class="form-grid">
                    ${formRow('物理集群', `<select id="modal-physical" name="registeredClusterId">${physicalOptions || '<option value="">暂无物理集群</option>'}</select>`)}
                    ${formRow('环境', `<select id="modal-env" name="env">${envOptions || '<option value="">请先配置环境映射</option>'}</select>`)}
                </div>
                <div class="form-grid" style="margin-top:12px">
                    ${formRow('区域', `<input type="text" name="region" value="${esc(cluster.region || 'cn-shanghai')}">`)}
                    ${formRow('实例数', `<input type="number" name="instances" min="0" value="${esc(cluster.instances)}">`)}
                    ${formRow('CPU（核）', `<input type="number" name="cpu" min="1" value="${esc(cluster.cpu)}">`)}
                    ${formRow('内存（MB）', `<input type="number" name="memory" min="128" value="${esc(cluster.memory)}">`)}
                    ${formRow('磁盘（GB）', `<input type="number" name="disk" min="1" value="${esc(cluster.disk)}">`)}
                </div>`,
            onSubmit(form) {
                const name = String(form.get('name') || '').trim();
                const env = String(form.get('env') || '');
                if (!name || !env) {
                    showToast('请填写集群名称并选择物理集群环境', 'warn');
                    return;
                }
                const payload = {
                    name: name,
                    env: env,
                    region: String(form.get('region') || '').trim() || '-',
                    instances: Math.max(0, Number(form.get('instances')) || 0),
                    cpu: Math.max(1, Number(form.get('cpu')) || 1),
                    memory: Math.max(128, Number(form.get('memory')) || 1024),
                    disk: Math.max(1, Number(form.get('disk')) || 20),
                    registeredClusterId: Number(form.get('registeredClusterId')) || null
                };
                if (editing) {
                    Object.assign(editing, payload);
                } else {
                    db.clusters.push({
                        id: nextId(db.clusters), appId: Number(appId), status: 'running',
                        serviceId: null, image: '', ...payload
                    });
                }
                saveDB();
                closeModal();
                renderPage();
                showToast(editing ? '集群配置已更新' : '集群已创建');
            }
        });
    }

    function openImageModal(editing) {
        const image = editing || {name: '', creator: ''};
        openModal({
            title: editing ? '编辑镜像' : '新增镜像',
            body: `
                ${formRow('镜像地址（含版本）', `<input type="text" name="name" value="${esc(image.name)}" placeholder="例如 order-service:v1.3">`)}
                ${formRow('创建人', `<input type="text" name="creator" value="${esc(image.creator)}" ${editing ? 'disabled' : ''}>`)}`,
            onSubmit(form) {
                const name = String(form.get('name') || '').trim();
                if (!name) {
                    showToast('镜像地址不能为空', 'warn');
                    return;
                }
                if (editing) {
                    editing.name = name;
                } else {
                    db.images.push({
                        id: nextId(db.images), appId: Number(ui.detail.appId), name: name,
                        creator: String(form.get('creator') || '').trim() || 'admin', createdAt: now().slice(0, 10),
                        releaseStatusDev: false, releaseStatusTest: false, releaseStatusProd: false, deleted: false
                    });
                }
                saveDB();
                closeModal();
                renderPage();
                showToast(editing ? '镜像已更新' : '镜像已新增');
            }
        });
    }

    function openServiceModal(editing) {
        const service = editing || {name: '', type: 'cluster_ip', port: 8080, targetPort: 8080, protocol: 'TCP', enabled: true};
        const typeOptions = [['cluster_ip', 'ClusterIP'], ['node_port', 'NodePort'], ['load_balancer', 'LoadBalancer']]
            .map(([value, label]) => `<option value="${value}" ${service.type === value ? 'selected' : ''}>${label}</option>`).join('');
        openModal({
            title: editing ? '编辑服务配置' : '新增服务配置',
            body: `
                ${formRow('服务名称', `<input type="text" name="name" value="${esc(service.name)}">`)}
                <div class="form-grid">
                    ${formRow('类型', `<select name="type">${typeOptions}</select>`)}
                    ${formRow('协议', `<select name="protocol"><option ${service.protocol === 'TCP' ? 'selected' : ''}>TCP</option><option ${service.protocol === 'UDP' ? 'selected' : ''}>UDP</option></select>`)}
                    ${formRow('服务端口', `<input type="number" name="port" value="${esc(service.port)}">`)}
                    ${formRow('目标端口', `<input type="number" name="targetPort" value="${esc(service.targetPort)}">`)}
                </div>
                <label style="display:flex;gap:8px;align-items:center;margin-top:14px"><input type="checkbox" name="enabled" ${service.enabled ? 'checked' : ''}> 启用</label>`,
            onSubmit(form) {
                const payload = {
                    name: String(form.get('name') || '').trim() || 'unnamed-service',
                    type: String(form.get('type')),
                    protocol: String(form.get('protocol')),
                    port: Number(form.get('port')) || 8080,
                    targetPort: Number(form.get('targetPort')) || 8080,
                    enabled: form.has('enabled')
                };
                if (editing) {
                    Object.assign(editing, payload);
                } else {
                    db.services.push({id: nextId(db.services), appId: Number(ui.detail.appId), ...payload});
                }
                saveDB();
                closeModal();
                renderPage();
                showToast('服务配置已保存');
            }
        });
    }

    function openNotificationModal(editing) {
        const item = editing || {type: 'release', targets: '', webhook: ''};
        openModal({
            title: editing ? '编辑通知' : '新增通知',
            body: `
                ${formRow('类型', `<select name="type"><option value="release" ${item.type === 'release' ? 'selected' : ''}>发布通知</option><option value="scale" ${item.type === 'scale' ? 'selected' : ''}>扩缩容通知</option></select>`)}
                ${formRow('通知邮箱（多个用逗号分隔）', `<input type="text" name="targets" value="${esc(item.targets)}">`)}
                ${formRow('Webhook URL（可选）', `<input type="text" name="webhook" value="${esc(item.webhook || '')}">`)}`,
            onSubmit(form) {
                const payload = {
                    type: String(form.get('type')),
                    targets: String(form.get('targets') || '').trim(),
                    webhook: String(form.get('webhook') || '').trim()
                };
                if (!payload.targets && !payload.webhook) {
                    showToast('请填写通知邮箱或 Webhook', 'warn');
                    return;
                }
                if (editing) {
                    Object.assign(editing, payload);
                } else {
                    db.notifications.push({id: nextId(db.notifications), appId: Number(ui.detail.appId), ...payload});
                }
                saveDB();
                closeModal();
                renderPage();
                showToast('通知配置已保存');
            }
        });
    }

    function openRegisteredModal(editing) {
        const cluster = editing || {name: '', envType: 'test', apiEndpoint: '', kubeconfig: ''};
        const envOptions = [['dev', '开发'], ['test', '测试'], ['prod', '生产']]
            .map(([value, label]) => `<option value="${value}" ${cluster.envType === value ? 'selected' : ''}>${label}</option>`).join('');
        openModal({
            title: editing ? '编辑物理集群' : '注册物理集群',
            body: `
                ${formRow('集群名称', `<input type="text" name="name" value="${esc(cluster.name)}">`)}
                ${formRow('环境类型', `<select name="envType">${envOptions}</select>`)}
                ${formRow('API Server 地址', `<input type="text" name="apiEndpoint" value="${esc(cluster.apiEndpoint)}" placeholder="https://cluster-api.example.com:6443">`)}
                ${formRow('kubeconfig 内容（YAML）', `<textarea name="kubeconfig" rows="6" placeholder="${editing ? '编辑时留空表示不修改' : '粘贴 kubeconfig 内容'}"></textarea>`)}
                <div class="hint">保存时对 kubeconfig 做 Base64 编码；本演示不会真正连接 Kubernetes。</div>`,
            onSubmit(form) {
                const name = String(form.get('name') || '').trim();
                const apiEndpoint = String(form.get('apiEndpoint') || '').trim();
                if (!name || !apiEndpoint) {
                    showToast('请填写集群名称和 API Endpoint', 'warn');
                    return;
                }
                const kube = String(form.get('kubeconfig') || '').trim();
                const payload = {name, apiEndpoint, envType: String(form.get('envType'))};
                if (kube) payload.kubeconfig = base64Encode(kube);
                if (editing) {
                    Object.assign(editing, payload);
                } else {
                    const id = nextId(db.registeredClusters);
                    db.registeredClusters.push({
                        id, status: 'offline', lastHeartbeat: '', kubeconfig: '', ...payload
                    });
                    db.envNamespaces[String(id)] = [];
                }
                saveDB();
                closeModal();
                renderPage();
                showToast(editing ? '物理集群已更新' : '物理集群已注册');
            }
        });
    }

    function openMappingModal() {
        const clusterId = Number(ui.env.selected);
        const existing = db.envNamespaces[String(clusterId)] || [];
        const options = ENV_ORDER.map(env => `<option value="${env}">${ENV_LABEL[env]}</option>`).join('');
        openModal({
            title: '添加环境-命名空间映射',
            body: `
                ${formRow('环境', `<select name="env">${options}</select>`)}
                ${formRow('Namespace', `<input type="text" name="namespace" placeholder="例如 order-prod">`)}`,
            onSubmit(form) {
                const env = String(form.get('env'));
                const namespace = String(form.get('namespace') || '').trim();
                if (!namespace) {
                    showToast('请填写 Namespace', 'warn');
                    return;
                }
                const item = existing.find(mapping => mapping.env === env);
                if (item) item.namespace = namespace;
                else existing.push({env, namespace});
                db.envNamespaces[String(clusterId)] = existing;
                saveDB();
                closeModal();
                renderPage();
                showToast(item ? '映射已更新' : '映射已添加');
            }
        });
    }

    function updateModalEnvOptions(physicalId) {
        const select = document.getElementById('modal-env');
        if (!select) return;
        const mappings = db.envNamespaces[String(physicalId)] || [];
        select.innerHTML = mappings.length
            ? mappings.map(item => `<option value="${esc(item.env)}">${ENV_LABEL[item.env] || String(item.env).toUpperCase()} / ${esc(item.namespace)}</option>`).join('')
            : '<option value="">请先配置环境映射</option>';
    }

    function findTask(taskId) {
        return db.releaseTasks.find(task => task.id === taskId);
    }

    function setTask(taskId, patch) {
        const task = findTask(taskId);
        if (!task) return;
        Object.assign(task, patch, {updatedAt: now()});
        saveDB();
        updateDrawerState();
    }

    function taskStopped(taskId) {
        const task = findTask(taskId);
        return !task || task.status === 'rejected';
    }

    function openApprovalModal(task, app, env) {
        ui.modal = {
            title: '发布审批',
            body: `
                <div class="hint warn">应用 <strong>${esc(app.chineseName || app.name)}</strong> 重要性为 <strong>${IMPORTANCE_LABEL[app.importance]}</strong>，发布到 <strong>${ENV_LABEL[env]}</strong> 需要审批。</div>
                ${formRow('审批意见', '<textarea id="approval-comment" rows="4" placeholder="可填写审批意见"></textarea>')}`,
            footer: `<button type="button" data-action="approval-reject" class="btn danger">拒绝</button><button type="button" data-action="approval-approve" class="btn primary">同意并发布</button>`,
            taskId: task.id,
            appId: app.id,
            env: env
        };
        renderModal();
    }

    function approvalComment() {
        const input = document.getElementById('approval-comment');
        return input ? input.value.trim() : '';
    }

    function startPolling(taskId) {
        if (pollTimer && pollingTaskId === taskId) return;
        if (pollTimer) clearInterval(pollTimer);
        pollingTaskId = taskId;
        pollTimer = setInterval(() => {
            const task = findTask(taskId);
            if (!task) {
                stopPolling();
                return;
            }
            ui.release.progress = {
                status: task.status,
                currentBatch: task.currentBatch || 0,
                totalBatches: task.totalBatches || 0,
                message: task.message || '',
                errorMessage: task.errorMessage || ''
            };
            updateDrawerState();
            if (['success', 'rejected', 'rollback_success', 'rollback_failed'].includes(task.status)) {
                stopPolling();
                finishRelease(task);
            }
        }, 1000);
    }

    function stopPolling() {
        if (pollTimer) clearInterval(pollTimer);
        pollTimer = null;
        pollingTaskId = null;
    }

    function finishRelease(task) {
        if (task.finished) return;
        task.finished = true;
        saveDB();
        ui.release.running = false;
        ui.release.progress = {
            status: task.status,
            currentBatch: task.currentBatch || 0,
            totalBatches: task.totalBatches || 0,
            message: task.message || '',
            errorMessage: task.errorMessage || ''
        };
        if (task.status === 'success') {
            const image = db.images.find(item => Number(item.id) === Number(task.imageId));
            if (image) image[statusKey(task.targetEnv)] = true;
            db.releaseHistory.unshift({
                id: Date.now(), appId: task.appId, time: now(), image: task.image || (image ? image.name : '-'),
                env: task.targetEnv, operator: 'current_user', status: 'success'
            });
            saveDB();
            ui.release.open = false;
            ui.release.clusterId = '';
            ui.release.imageId = '';
            renderPage();
            showToast(`成功发布到 ${ENV_LABEL[task.targetEnv]}`);
        } else if (task.status === 'rejected') {
            renderPage();
            showToast(`发布到 ${ENV_LABEL[task.targetEnv]} 已被拒绝`, 'error');
        } else if (task.status === 'rollback_success') {
            renderPage();
            showToast('发布失败，已回滚到上一版本', 'warn');
        } else {
            renderPage();
            showToast(`发布结束：${STATUS_LABEL[task.status] || task.status}`, 'error');
        }
    }

    async function simulateRelease(taskId) {
        const task = findTask(taskId);
        if (!task || task.status !== 'approved') return;
        const cluster = db.clusters.find(item => Number(item.id) === Number(task.clusterId));
        const total = Math.max(1, cluster ? Number(cluster.instances) || 1 : 1);
        const strategy = task.strategy;
        const batchSize = Math.max(1, Math.ceil(total * (Number(strategy.batchRatio) / 100)));
        const totalBatches = Math.ceil(total / batchSize);
        setTask(taskId, {totalBatches, status: 'running', message: '正在启动发布...'});

        for (let batch = 1; batch <= totalBatches; batch++) {
            if (taskStopped(taskId)) return;
            setTask(taskId, {
                status: 'batch_running',
                currentBatch: batch,
                message: `开始执行第 ${batch}/${totalBatches} 批（本批 ${batchSize} 个实例）`
            });
            await sleep(1200);
            await sleep(500 + Math.random() * 1500);
            if (taskStopped(taskId)) return;
            const healthOk = Math.random() > 0.2;
            if (!healthOk) {
                setTask(taskId, {
                    status: 'failed',
                    errorMessage: `第 ${batch} 批健康检查失败（${strategy.healthCheckPath}:${strategy.healthCheckPort}），发布终止`
                });
                await sleep(700);
                setTask(taskId, {status: 'rollback', message: '正在回滚已变更的实例...'});
                await sleep(1500);
                setTask(taskId, {status: 'rollback_success', message: '回滚完成，集群已恢复至发布前状态'});
                return;
            }
            setTask(taskId, {status: 'batch_success', message: `第 ${batch} 批发布成功，实例健康检查通过`});
            if (batch < totalBatches && Number(strategy.batchWaitTime) > 0) {
                setTask(taskId, {
                    status: 'running',
                    message: `等待 ${strategy.batchWaitTime} 秒后执行下一批（演示已加速）...`
                });
                await sleep(Math.max(200, Number(strategy.batchWaitTime) * 100));
            }
        }
        setTask(taskId, {status: 'success', currentBatch: totalBatches, message: '所有批次发布成功！'});
    }

    function handleStartRelease() {
        if (ui.release.running) return;
        const app = getApp(ui.detail.appId);
        const cluster = db.clusters.find(item => Number(item.id) === Number(ui.release.clusterId));
        const image = db.images.find(item => Number(item.id) === Number(ui.release.imageId) && !item.deleted);
        if (!app || !cluster) return showToast('请选择集群', 'warn');
        if (!image) return showToast('请选择镜像', 'warn');
        const nextEnv = getNextEnv(image);
        if (!nextEnv) return showToast('该镜像已发布所有环境，无需再次发布', 'warn');
        const index = ENV_ORDER.indexOf(nextEnv);
        for (let i = 0; i < index; i++) {
            if (!image[statusKey(ENV_ORDER[i])]) {
                return showToast(`请先发布 ${ENV_LABEL[ENV_ORDER[i]]} 环境，不能越级发布到 ${ENV_LABEL[nextEnv]}`, 'warn');
            }
        }

        const approval = needApproval(app.importance, nextEnv);
        const task = {
            id: `release-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            appId: app.id, clusterId: cluster.id, imageId: image.id, image: image.name,
            targetEnv: nextEnv, strategy: {...ui.release.strategy},
            status: approval ? 'pending_approval' : 'approved',
            currentBatch: 0, totalBatches: 0, message: approval ? '等待审批' : '准备发布',
            errorMessage: '', operator: 'current_user', createdAt: now(), finished: false
        };
        db.releaseTasks.unshift(task);
        saveDB();
        ui.release.taskId = task.id;
        ui.release.running = true;
        ui.release.progress = {
            status: task.status, currentBatch: 0, totalBatches: 0,
            message: task.message, errorMessage: ''
        };
        if (approval) {
            renderPage();
            openApprovalModal(task, app, nextEnv);
        } else {
            startPolling(task.id);
            simulateRelease(task.id);
            renderPage();
        }
    }

    function updateDrawerState() {
        const box = document.getElementById('release-progress');
        if (box) box.innerHTML = progressHtml();
        const submit = document.getElementById('release-submit');
        if (submit) {
            submit.disabled = ui.release.running || !ui.release.clusterId || !ui.release.imageId;
            submit.textContent = ui.release.running ? '发布中...' : '发布';
        }
        ['release-cluster', 'release-image'].forEach(id => {
            const node = document.getElementById(id);
            if (node) node.disabled = !!ui.release.running;
        });
    }

    function handleClick(event) {
        const target = event.target.closest('[data-action]');
        if (!target) return;
        const action = target.dataset.action;
        const id = Number(target.dataset.id);
        const appId = Number(ui.detail.appId);

        switch (action) {
            case 'toggle-sidebar':
                ui.sidebarOpen = !ui.sidebarOpen;
                renderPage();
                break;
            case 'reset-demo':
                if (confirm('确定重置所有演示数据吗？本地修改将丢失。')) {
                    localStorage.removeItem(STORAGE_KEY);
                    db = seedDB();
                    ui = defaultUI();
                    stopPolling();
                    saveDB();
                    renderModal();
                    renderPage();
                    showToast('演示数据已重置');
                }
                break;
            case 'app-page':
                ui.appList.page = Number(target.dataset.page);
                renderPage({preserveFocus: true});
                break;
            case 'image-page':
                ui.detail.imagePage = Number(target.dataset.page);
                renderPage({preserveFocus: true});
                break;
            case 'registered-page':
                ui.registered.page = Number(target.dataset.page);
                renderPage({preserveFocus: true});
                break;
            case 'tab':
                ui.detail.tab = Number(target.dataset.tab);
                renderPage();
                break;
            case 'open-importance':
                openImportanceModal(getApp(appId));
                break;
            case 'open-release':
                ui.release.open = true;
                renderPage();
                break;
            case 'close-drawer':
                ui.release.open = false;
                renderPage();
                break;
            case 'toggle-strategy':
                ui.release.strategyExpanded = !ui.release.strategyExpanded;
                renderPage();
                break;
            case 'start-release':
                handleStartRelease();
                break;
            case 'toggle-cluster':
                ui.detail.expanded[id] = !ui.detail.expanded[id];
                renderPage();
                break;
            case 'toggle-pod': {
                const pods = getPods(Number(target.dataset.cluster));
                const pod = pods.find(item => item.name === target.dataset.pod);
                if (pod) {
                    pod.status = pod.status === 'Running' ? 'Pending' : 'Running';
                    saveDB();
                    renderPage();
                }
                break;
            }
            case 'add-cluster':
                openClusterModal(appId, null);
                break;
            case 'edit-cluster':
                openClusterModal(appId, db.clusters.find(item => Number(item.id) === id));
                break;
            case 'delete-cluster': {
                const cluster = db.clusters.find(item => Number(item.id) === id);
                if (!cluster) break;
                const blockers = [];
                if (Number(cluster.instances) > 0) blockers.push('实例数需先缩容至 0');
                if (cluster.serviceId) blockers.push('需先解绑服务配置');
                if (blockers.length) {
                    showToast('删除失败：' + blockers.join('，'), 'warn');
                    break;
                }
                if (confirm(`确定删除集群 ${cluster.name} 吗？`)) {
                    db.clusters = db.clusters.filter(item => Number(item.id) !== id);
                    delete db.pods[String(id)];
                    saveDB();
                    renderPage();
                    showToast('集群已删除');
                }
                break;
            }
            case 'unbind-service': {
                const cluster = db.clusters.find(item => Number(item.id) === id);
                if (cluster && confirm(`确定解绑 ${cluster.name} 的服务配置吗？`)) {
                    cluster.serviceId = null;
                    saveDB();
                    renderPage();
                    showToast('服务配置已解绑');
                }
                break;
            }
            case 'add-image':
                openImageModal(null);
                break;
            case 'edit-image':
                openImageModal(db.images.find(item => Number(item.id) === id));
                break;
            case 'delete-image': {
                const image = db.images.find(item => Number(item.id) === id);
                if (!image) break;
                if (ENV_ORDER.some(env => image[statusKey(env)])) {
                    showToast('已发布环境的镜像不可删除', 'warn');
                    break;
                }
                if (confirm(`确定删除镜像 ${image.name} 吗？`)) {
                    image.deleted = true;
                    saveDB();
                    renderPage();
                    showToast('镜像已删除');
                }
                break;
            }
            case 'add-service':
                openServiceModal(null);
                break;
            case 'edit-service':
                openServiceModal(db.services.find(item => Number(item.id) === id));
                break;
            case 'delete-service':
                if (confirm('确定删除该服务配置吗？')) {
                    db.services = db.services.filter(item => Number(item.id) !== id);
                    db.clusters.forEach(cluster => {
                        if (Number(cluster.serviceId) === id) cluster.serviceId = null;
                    });
                    saveDB();
                    renderPage();
                    showToast('服务配置已删除');
                }
                break;
            case 'add-notification':
                openNotificationModal(null);
                break;
            case 'edit-notification':
                openNotificationModal(db.notifications.find(item => Number(item.id) === id));
                break;
            case 'delete-notification':
                if (confirm('确定删除该通知配置吗？')) {
                    db.notifications = db.notifications.filter(item => Number(item.id) !== id);
                    saveDB();
                    renderPage();
                    showToast('通知配置已删除');
                }
                break;
            case 'add-registered':
                openRegisteredModal(null);
                break;
            case 'edit-registered':
                openRegisteredModal(db.registeredClusters.find(item => Number(item.id) === id));
                break;
            case 'delete-registered':
                if (confirm('确定删除该物理集群吗？其环境映射也会一起删除。')) {
                    db.registeredClusters = db.registeredClusters.filter(item => Number(item.id) !== id);
                    delete db.envNamespaces[String(id)];
                    saveDB();
                    renderPage();
                    showToast('物理集群已删除');
                }
                break;
            case 'health-check': {
                ui.registered.checking = id;
                renderPage();
                setTimeout(() => {
                    const cluster = db.registeredClusters.find(item => Number(item.id) === id);
                    if (cluster) {
                        cluster.status = Math.random() > 0.2 ? 'online' : 'offline';
                        cluster.lastHeartbeat = now();
                    }
                    ui.registered.checking = null;
                    saveDB();
                    renderPage();
                    showToast(`健康检查完成：${cluster ? cluster.status : '集群不存在'}`, cluster && cluster.status === 'online' ? 'success' : 'warn');
                }, 700);
                break;
            }
            case 'add-mapping':
                openMappingModal();
                break;
            case 'delete-mapping': {
                const env = target.dataset.env;
                const clusterName = (db.registeredClusters.find(item => Number(item.id) === Number(ui.env.selected)) || {}).name || '';
                if (confirm(`确定删除物理集群 ${clusterName} 的环境 ${env} 映射吗？`)) {
                    db.envNamespaces[String(ui.env.selected)] = (db.envNamespaces[String(ui.env.selected)] || [])
                        .filter(mapping => mapping.env !== env);
                    saveDB();
                    renderPage();
                    showToast('映射已删除');
                }
                break;
            }
            case 'modal-cancel':
                closeModal();
                break;
            case 'approval-approve': {
                const modal = ui.modal;
                const task = modal ? findTask(modal.taskId) : null;
                if (task) {
                    task.status = 'approved';
                    task.message = '审批通过，准备发布';
                    db.approvals.unshift({
                        id: Date.now(), appId: modal.appId, env: modal.env, status: 'approved',
                        comment: approvalComment(), applicant: 'current_user', time: now()
                    });
                    saveDB();
                    closeModal();
                    startPolling(task.id);
                    simulateRelease(task.id);
                    renderPage();
                    showToast('审批通过，发布已开始');
                }
                break;
            }
            case 'approval-reject': {
                const modal = ui.modal;
                const task = modal ? findTask(modal.taskId) : null;
                if (task) {
                    task.status = 'rejected';
                    task.message = '审批拒绝，发布终止';
                    db.approvals.unshift({
                        id: Date.now(), appId: modal.appId, env: modal.env, status: 'rejected',
                        comment: approvalComment(), applicant: 'current_user', time: now()
                    });
                    saveDB();
                    closeModal();
                    ui.release.running = false;
                    ui.release.progress = {
                        status: 'rejected', currentBatch: 0, totalBatches: 0,
                        message: '审批拒绝，发布终止', errorMessage: ''
                    };
                    renderPage();
                    showToast('审批已拒绝', 'error');
                }
                break;
            }
            default:
                break;
        }
    }

    function handleInput(event) {
        const target = event.target;
        if (target.dataset.bind) {
            setPath(ui, target.dataset.bind, target.value);
            if (target.dataset.bind === 'appList.keyword' || target.dataset.bind === 'registered.keyword') {
                setPath(ui, target.dataset.bind.replace('.keyword', '.page'), 1);
            }
            if (target.dataset.bind === 'detail.imageKeyword') ui.detail.imagePage = 1;
            renderPage({preserveFocus: true});
            return;
        }
        if (target.dataset.releaseField) {
            const value = target.type === 'number' ? Number(target.value) : target.value;
            setPath(ui.release, target.dataset.releaseField, value);
            updateDrawerState();
        }
    }

    function handleChange(event) {
        const target = event.target;
        if (target.id === 'env-cluster-select') {
            ui.env.selected = Number(target.value) || null;
            renderPage();
            return;
        }
        if (target.id === 'modal-physical') {
            updateModalEnvOptions(Number(target.value));
        }
    }

    function handleSubmit(event) {
        if (event.target.id !== 'modal-form' || !ui.modal || !ui.modal.onSubmit) return;
        event.preventDefault();
        ui.modal.onSubmit(new FormData(event.target));
    }

    document.addEventListener('click', handleClick);
    document.addEventListener('input', handleInput);
    document.addEventListener('change', handleChange);
    document.addEventListener('submit', handleSubmit);
    window.addEventListener('hashchange', () => renderPage());

    if (!location.hash) location.hash = '#/apps';
    renderPage();
})();
