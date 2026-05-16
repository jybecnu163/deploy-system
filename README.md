#   云原生应用发布管理平台
本系统 是一个面向 Kubernetes 的轻量级 PaaS 平台，提供应用管理、镜像管理、多集群/多环境发布、审批流、滚动更新、健康检查等核心功能，帮助团队安全、高效地管理容器化应用的生命周期。

##   ✨ 主要特性
### 多级集群管理

注册物理 Kubernetes 集群，自动健康检查（心跳+离线判定）

支持为物理集群配置多个环境（dev/test/prod）对应的 Namespace

业务集群（Deployment）管理：创建、扩缩容、编辑资源、删除（软删除）

### 镜像管理

镜像列表分页、搜索、软删除

自动跟踪镜像在各环境的发布状态（DEV/TEST/PROD）

发布时自动校验前置环境，防止越级发布

### 发布流程

支持发布策略：批次比例、超时时间、预热时间、健康检查（HTTP）

利用 Kubernetes 原生滚动更新 + maxUnavailable 实现分批发布

发布后可主动探测 Pod 健康接口，失败则标记发布失败

应用重要性驱动的审批流（轻/中/重）：

轻 → 无审批

中 → 仅PROD审批

重 → TEST 和PROD均需审批

### 服务 & 通知配置

应用级服务配置（ClusterIP/NodePort/LoadBalancer）

邮件/Webhook 订阅（发布、扩缩容事件）

### 发布历史 & 审批记录

完整记录每一次发布任务和审批意见，支持前端轮询实时状态

### Kubernetes 集成

基于 Fabric8 客户端，支持多集群 kubeconfig 加密存储

Deployment 全生命周期管理（创建、更新镜像、扩缩容、资源修改）

实时同步 Pod 信息到数据库，支持前端展示机器列表

##  🧰 技术栈
### 后端
Java 17

Spring Boot 2.7+

Spring Security + JWT（可选）

MyBatis-Plus + MySQL

Fabric8 Kubernetes Client

Lombok

### 前端
React 18

Material-UI (MUI) v5

React Router v6

Fetch API

### 基础设施
Kubernetes（支持多集群）

Docker / Docker Desktop

##  🚀 快速开始
环境要求
JDK 17

Node.js 16+

MySQL 8.0

kubectl 可访问的 Kubernetes 集群（本地可使用 Docker Desktop）

后端启动
克隆代码

```bash
git clone git@github.com:jybecnu163/deploy-system.git
cd deploy-system/backend
```
配置数据库
修改 application.yml 中的 MySQL 连接信息，并执行 docs/schema.sql 创建所有表。

启动应用

```bash
./mvnw spring-boot:run
```
默认端口 8080，API 前缀 /api

前端启动
```bash
cd frontend
npm install
npm start
```
访问 http://localhost:3000

初始数据
首次启动请执行 docs/data.sql 插入示例应用、集群映射等。

###  📦 核心 API
模块	方法	路径	说明
应用	GET	/api/apps	分页获取应用列表
应用	PUT	/api/apps/{id}/importance	修改应用重要性
镜像	GET	/api/apps/{appId}/images	获取镜像列表
镜像	DELETE	/api/images/{id}	软删除镜像
业务集群	POST	/api/clusters	创建业务集群
业务集群	PUT	/api/clusters/{id}	异步更新集群配置（返回任务ID）
发布	POST	/api/releases	创建发布任务
发布	GET	/api/releases/{id}/status	轮询发布状态
审批	POST	/api/approvals/{releaseId}/approve	审批通过
物理集群	POST	/api/admin/registered-clusters	注册 K8s 集群
环境映射	POST	/api/admin/cluster-env-namespaces/cluster/{clusterId}	添加环境-命名空间映射

###     📁 数据库核心表
application：应用信息、重要性
image：镜像、发布状态、软删除
cluster：业务集群（关联物理集群和环境）
registered_cluster：物理 K8s 集群（加密 kubeconfig）
cluster_env_namespace：环境与 Namespace 映射
release_task：发布任务、状态、策略 JSON
approval_record：审批记录
pod_instance：Pod 实例快照

##  🧪 扩展计划
发布监控与自动回滚（集成 Prometheus 指标）

金丝雀发布（Istio 流量权重）

镜像安全扫描（Trivy）

多租户与操作审计

GitOps 集成（ArgoCD）

##  📄 License
MIT License

##  🙏 致谢
Kubernetes & Fabric8

Spring Boot & MyBatis-Plus

Material-UI & React