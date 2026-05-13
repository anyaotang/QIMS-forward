# QIMS 质量检测管理系统（前端）— 项目文档

> **项目名称**：QIMS-forward（Quality Inspection Management System - Frontend）
>
> **版本**：0.0.0
>
> **技术栈**：Vue 3 + TypeScript + Vite + Element Plus + Pinia + Vue Router 5

---

## 目录

- [1. 项目概述](#1-项目概述)
- [2. 技术栈与依赖](#2-技术栈与依赖)
- [3. 项目结构](#3-项目结构)
- [4. 核心架构](#4-核心架构)
- [5. 模块详解](#5-模块详解)
- [6. API 接口层](#6-api-接口层)
- [7. 类型定义](#7-类型定义)
- [8. 权限系统](#8-权限系统)
- [9. 国际化（i18n）](#9-国际化i18n)
- [10. 主题系统](#10-主题系统)
- [11. 构建与开发](#11-构建与开发)
- [12. 环境配置](#12-环境配置)

---

## 1. 项目概述

QIMS（Quality Inspection Management System）是一个**质量检测管理系统**的前端应用。系统面向制造业/工业场景，提供从质量节点管理、检测项配置、检测记录追踪到质量报表分析的完整闭环功能。

### 核心业务模块

| 模块 | 说明 | 权限前缀 |
|------|------|----------|
| 仪表盘 | 系统总览、统计数据展示 | — |
| 系统管理 | 用户、部门、角色管理 | `system:` |
| 质量管理 | 节点、检测项、检测记录、人工录入 | `quality:` |
| 报表中心 | 质量报表查看与导出 | `report:` |
| 实施方案 | 实施计划管理与反馈跟踪 | `implementation:` |

---

## 2. 技术栈与依赖

### 生产依赖

| 包名 | 版本 | 用途 |
|------|------|------|
| `vue` | ^3.5.32 | 渐进式前端框架（Composition API） |
| `vue-router` | ^5.0.4 | 路由管理 |
| `pinia` | ^3.0.4 | 状态管理 |
| `vue-i18n` | ^11.4.2 | 国际化多语言 |
| `element-plus` | ^2.14.0 | UI 组件库 |
| `@element-plus/icons-vue` | ^2.3.2 | Element Plus 图标集 |
| `axios` | ^1.16.0 | HTTP 客户端 |
| `nprogress` | ^0.2.0 | 页面加载进度条 |

### 开发依赖

| 包名 | 用途 |
|------|------|
| `vite` ^8.0.8 | 构建工具 |
| `typescript` ~6.0.0 | 类型系统 |
| `vue-tsc` ^3.2.6 | Vue TypeScript 类型检查 |
| `sass-embedded` ^1.99.0 | SCSS 预处理器 |
| `unplugin-auto-import` ^21.0.0 | 自动导入 API（ref/computed 等） |
| `unplugin-vue-components` ^32.0.0 | 组件自动注册 |
| `vitest` ^4.1.4 | 单元测试 |
| `eslint` / `prettier` / `oxlint` | 代码规范 |

### Node.js 要求

```
^20.19.0 || >=22.12.0
```

---

## 3. 项目结构

```
QIMS-forward/
├── public/                      # 静态资源
├── src/
│   ├── api/                     # （预留）API 接口聚合层
│   ├── assets/                  # 静态资源（CSS、图片）
│   │   ├── base.css             # 基础样式重置
│   │   ├── main.css             # 全局样式
│   │   └── logo.svg             # Logo
│   ├── components/              # 公共组件
│   │   └── icons/               # 图标组件
│   ├── directives/              # 自定义指令
│   │   └── permission.ts        # v-permission 权限指令
│   ├── layouts/                 # 布局组件
│   │   ├── MainLayout.vue       # 主布局（侧边栏+顶栏+内容区）
│   │   ├── Sidebar.vue          # 左侧导航菜单
│   │   ├── Header.vue           # 顶部栏（面包屑+工具）
│   │   └── TagsView.vue         # 标签页导航
│   ├── locales/                 # 国际化
│   │   ├── index.ts             # i18n 实例初始化
│   │   zh-CN.ts                 # 中文语言包
│   │   └── en-US.ts             # 英文语言包
│   ├── router/                  # 路由
│   │   └── index.ts             # 路由配置 + 全局守卫
│   ├── stores/                  # Pinia 状态管理
│   │   ├── user.ts              # 用户 & 认证状态
│   │   ├── permission.ts        # 权限 & 动态路由
│   │   ├── locale.ts            # 语言偏好
│   │   └── theme.ts             # 主题（亮色/暗色）
│   ├── styles/                  # 全局样式
│   │   └── index.scss           # SCSS 入口（CSS 变量定义）
│   ├── types/                   # TypeScript 类型定义
│   │   └── api.d.ts             # API 相关全部类型
│   ├── utils/                   # 工具函数
│   │   ├── request.ts           # Axios 封装 + 全部 API 模块
│   │   └── auth.ts              # 认证工具（Token 管理）
│   ├── views/                   # 页面视图
│   │   ├── dashboard/           # 仪表盘
│   │   ├── login/               # 登录页
│   │   ├── error/               # 404 错误页
│   │   ├── profile/             # 个人中心
│   │   ├── system/              # 系统管理
│   │   │   ├── user/            # 用户管理
│   │   │   ├── department/      # 部门管理
│   │   │   └── role/            # 角色管理
│   │   ├── quality/             # 质量管理
│   │   │   ├── node/            # 节点管理
│   │   │   ├── inspection-item/ # 检测项管理
│   │   │   ├── inspection-record/# 检测记录
│   │   │   └── manual-entry/    # 人工录入
│   │   ├── report/              # 报表中心
│   │   │   └── quality/         # 质量报表
│   │   └── implementation/      # 实施方案
│   │       ├── plan/            # 实施方案列表
│   │       └── feedback/        # 反馈记录
│   ├── App.vue                  # 根组件
│   ├── main.ts                  # 应用入口
│   ├── auto-imports.d.ts        # 自动导入类型声明
│   └── components.d.ts          # 组件自动注册类型声明
├── index.html                   # HTML 入口
├── package.json                 # 项目配置
├── tsconfig.json                # TS 配置
├── vite.config.ts               # Vite 配置
└── env.d.ts                     # 环境变量类型
```

---

## 4. 核心架构

### 4.1 应用启动流程

```
main.ts
  │
  ├─ createApp(App)                    创建 Vue 实例
  ├─ 注册 Element Plus Icons           全局图标组件
  ├─ app.use(pinia)                    安装 Pinia（必须在路由之前）
  ├─ 注册 v-permission 指令
  │
  └─ bootstrap() [异步]
       ├─ 动态 import router           延迟加载路由
       ├─ app.use(router)              安装路由
       ├─ app.use(i18n)                安装国际化
       ├─ app.use(ElementPlus)         安装 UI 库
       └─ app.mount('#app')            挂载 DOM
```

### 4.2 路由守卫流程

```
用户访问页面
  │
  ├─ 显示 NProgress 进度条
  ├─ 设置页面标题
  │
  ├─ 检查 URL token 参数 → 自动登录
  │
  ├─ 是 /login 页面？
  │   ├─ 已登录 → 重定向 /dashboard
  │   └─ 未登录 → 放行
  │
  ├─ 未登录？→ 重定向 /login?redirect=...
  │
  ├─ 用户信息未加载？→ fetchUserInfo()
  │
  ├─ 菜单未加载？
  │   ├─ filterRoutesByPermission()     按权限过滤路由
  │   ├─ router.addRoute()             动态添加路由
  │   ├─ 添加 404 兜底路由
  │   └─ next({ ...to, replace: true }) 重新导航
  │
  └─ next()  放行
```

### 4.3 数据流架构

```
┌─────────────┐     HTTP      ┌──────────────┐
│  后端 API   │ ◄──────────►  │  utils/request │  (Axios 封装)
└─────────────┘               └──────────────┘
                                      │
                              extractData() 统一提取
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
             ┌──────────┐     ┌──────────┐     ┌──────────┐
             │ userStore│     │permission│     │  Views   │
             │ (Pinia)  │     │ Store    │     │ (.vue)   │
             └──────────┘     └──────────┘     └──────────┘
                    │                 │
                    ▼                 ▼
             认证 & 用户信息    动态路由 & 菜单
```

---

## 5. 模块详解

### 5.1 布局系统（layouts/）

#### MainLayout.vue — 主布局框架

采用经典后台布局：**固定侧边栏 + 固定顶栏 + 可滚动内容区**

| 区域 | 组件 | 特性 |
|------|------|------|
| 侧边栏 | `Sidebar.vue` | 固定定位，支持折叠（220px ↔ 64px） |
| 顶栏 | `Header.vue` | 固定定位，高度 CSS 变量控制 |
| 标签导航 | `TagsView.vue` | 多标签页切换 |
| 内容区 | `<RouterView>` | 带 fade 过渡动画 |

#### Sidebar.vue — 侧边导航

- 基于 `el-menu` 实现，支持折叠/展开
- 菜单项根据用户**权限码动态显示/隐藏**
- 使用 CSS 变量控制配色（适配亮暗主题）
- 图标通过 `iconMap` 映射 Element Plus Icons

#### Header.vue — 顶部工具栏

左侧：折叠按钮 + 面包屑导航
右侧：
- 🔔 通知铃铛（Badge）
- 🌓 主题切换（亮色/暗色）
- 🌐 语言切换（中文/English 下拉菜单）
- 👤 用户头像 + 退出登录

### 5.2 状态管理（stores/）

#### user.ts — 用户认证 Store

| State | 类型 | 说明 |
|-------|------|------|
| `token` | `Ref<string>` | JWT Token |
| `userInfo` | `Ref<UserInfo \| null>` | 当前用户信息 |
| `permissions` | `Ref<string[]>` | 权限码列表 |
| `roles` | `Ref<string[]>` | 角色列表 |

| Action | 说明 |
|--------|------|
| `login(form)` | 用户名密码登录 |
| `urlLogin(token)` | URL Token 单点登录 |
| `fetchUserInfo()` | 获取当前用户信息 |
| `logout()` | 退出登录，清除本地数据 |
| `hasPermission(code)` | 检查是否拥有指定权限 |
| `hasRole(role)` | 检查是否拥有指定角色 |

#### permission.ts — 权限 & 路由 Store

| State | 类型 |说明 |
|-------|------|------|
| `routes` | `Ref<AppRouteRecordRaw[]>` | 全部路由配置 |
| `addRoutes` | `Ref<AppRouteRecordRaw[]>` | 过滤后的可访问路由 |
| `isMenuLoaded` | `Ref<boolean>` | 菜单是否已加载 |

| 核心方法 | 说明 |
|----------|------|
| `filterRoutesByPermission(routes, permissions)` | 递归过滤路由树，按 `meta.permission` 字段匹配用户权限 |
| `filterHidden(routes)` | 过滤掉 `hidden: true` 的路由（用于侧边栏渲染） |
| `getFlatRoutes(routes)` | 将路由树展平（用于 TagsView） |

#### locale.ts — 语言偏好 Store

- 管理 `zh-CN` / `en-US` 两种语言
- 通过 `localStorage` 持久化 key: `qims_locale`

#### theme.ts — 主题 Store

- 支持 `light` / `dark` 两种模式
- 切换时操作 DOM：`html.classList.add/remove('dark')`
- 通过 `localStorage` 持久化 key: `qims_theme`

### 5.3 视图页面（views/）

#### dashboard/index.vue — 仪表盘
展示系统统计概览（总检测项、合格率、今日记录数等）

#### system/ — 系统管理
- **user/**：用户 CRUD、角色分配、密码重置、部门关联
- **department/**：部门树形结构管理
- **role/**：角色权限管理

#### quality/ — 质量管理（核心模块）
- **node/**：检测节点树形管理（根节点 → 区域 → 产线 → 工位）
- **inspection-item/**：检测项配置（目标值、上下限、数据源类型、采集频率等）
- **inspection-record/**：检测记录查询（分页、筛选、合格判定）
- **manual-entry/**：人工录入检测数据

#### report/quality/ — 质量报表
- 数据可视化展示
- 支持 Excel 导出（Blob 下载）

#### implementation/ — 实施方案
- **plan/**：实施计划列表（按节点/状态筛选）
- **feedback/**：反馈记录提交

---

## 6. API 接口层

所有 API 集中在 `src/utils/request.ts` 中定义，基于 Axios 封装。

### 请求配置

```ts
baseURL: import.meta.env.VITE_API_BASE_URL || '/api'
timeout: 15000
headers: { 'Content-Type': 'application/json' }
```

### 请求拦截器

- 自动附加 `Authorization: Bearer <token>`（优先 localStorage，其次 URL 参数）

### 响应拦截器

| HTTP 状态码 | 处理逻辑 |
|-------------|----------|
| 200 / code=0 | 成功，返回 response |
| 401 | 清除 Token，跳转登录页 |
| 403 | 提示无权限 |
| 500 | 提示服务器错误 |
| 其他 | 提示网络失败 |

### API 模块清单

| 模块 | 对象 | 方法 | 接口路径 |
|------|------|------|----------|
| **认证** | `authApi` | `login` | POST `/auth/login` |
| | | `urlLogin` | GET `/auth/url-login` |
| | | `logout` | POST `/auth/logout` |
| **用户** | `userApi` | `info` | GET `/user/info` |
| | | `list` | GET `/user/page` |
| | | `create` | POST `/user` |
| | | `update` | PUT `/user` |
| | | `delete` | DELETE `/user/{id}` |
| | | `resetPassword` | POST `/user/{id}/reset-password` |
| | | `permissions` | GET `/user/permissions` |
| **部门** | `departmentApi` | `tree` | GET `/department/tree` |
| | | `list` | GET `/department/list` |
| | | `create/update/delete` | CRUD |
| | | `inheritRole` | POST `/department/{id}/inherit-role` |
| **节点** | `nodeApi` | `tree` | GET `/node/tree` |
| | | `list` | GET `/node/list` |
| | | `create/update/delete` | CRUD |
| | | `move` | POST `/node/{id}/move` |
| **检测项** | `inspectionItemApi` | `page/detail` | 分页/详情 |
| | | `create/update/delete` | CRUD |
| | | `toggleActive` | 启用/停用 |
| | | `defaultValueGroups/*` | 默认值组 CRUD |
| **检测记录** | `recordApi` | `page` | GET `/record/page` |
| | | `manual` | POST `/record/manual` |
| **报表** | `reportApi` | `quality` | GET `/report/quality` |
| | | `export` | GET `/report/quality/export` (Blob) |
| **实施方案** | `implementationApi` | `planTree` | GET `/implementation/plan/tree` |
| | | `submitFeedback` | POST `/implementation/feedback` |
| **统计** | `statisticsApi` | `dashboard` | GET `/statistics` |
| **字典** | `dictApi` | `list` | GET `/dict/list` |

---

## 7. 类型定义

全部集中在 `src/types/api.d.ts`，涵盖：

| 类别 | 接口 | 说明 |
|------|------|------|
| 通用 | `ApiResponse<T>` | 统一响应格式 `{ code, message, data }` |
| 通用 | `PageResult<T>` | 分页结果 `{ list, total, page, pageSize }` |
| 通用 | `PageQuery` | 分页查询参数 `{ page, pageSize, keyword }` |
| 认证 | `LoginForm` | 登录表单 `{ username, password }` |
| 认证 | `LoginVO` | 登录返回 `{ token, roles, permissions, ... }` |
| 用户 | `UserInfo` / `UserForm` | 用户信息 / 表单 |
| 部门 | `DepartmentTreeNode` | 部门树节点 |
| 节点 | `NodeTreeNode` / `NodeForm` | 检测节点树节点 / 表单 |
| 检测项 | `InspectionItem` / `InspectionItemForm` | 检测项完整定义 |
| 检测项 | `DefaultValueGroup` | 默认值组 `{ groupName, values }` |
| 记录 | `InspectionRecord` / `ManualRecordForm` | 检测记录 / 手动录入 |
| 报表 | `QualityReport` / `ReportQuery` | 质量报表 / 查询条件 |
| 实施 | `ImplementationPlan` / `FeedbackForm` | 实施方案 / 反馈 |
| 统计 | `Statistics` | 仪表盘统计数据 |
| 字典 | `DictData` | 字典数据 `{ label, value, type }` |

---

## 8. 权限系统

QIMS 采用 **RBAC（基于角色的访问控制）** + **细粒度权限码** 双层模型。

### 8.1 权限码体系

格式：`模块:操作`，例如：

| 权限码 | 含义 |
|--------|------|
| `system:view` | 查看系统管理 |
| `user:view` / `user:create` | 用户查看/创建 |
| `quality:view` | 查看质量管理 |
| `node:view` | 查看节点管理 |
| `inspection:view` | 查看检测项 |
| `record:view` / `record:manual` | 查看记录/人工录入 |
| `report:view` / `report:quality` | 报表查看 |
| `implementation:view` / `implementation:plan` / `implementation:feedback` | 实施方案相关 |

### 8.2 权限控制方式

#### 方式一：路由级权限（动态路由过滤）

在 `router/index.ts` 的全局守卫中，`filterRoutesByPermission()` 根据 `meta.permission` 递归过滤路由树，未授权的路由不会注册到 router。

#### 方式二：菜单级权限（v-if 控制）

`Sidebar.vue` 中每个菜单项使用 `v-if="userStore.hasPermission('xxx')"` 控制显隐。

#### 方式三：按钮级权限（v-permission 指令）

```vue
<!-- 单个权限 -->
<el-button v-permission="'user:create'">新增</el-button>

<!-- 任一满足（OR） -->
<el-button v-permission="['user:create', 'user:update']">编辑</el-button>

<!-- 全部满足（AND） -->
<el-button v-permission="{ and: ['user:create', 'department:view'] }">操作</el-button>
```

不满足权限时，指令会将元素 `display: none`。

---

## 9. 国际化（i18n）

### 配置

- **框架**：vue-i18n @^11.4.2
- **模式**：Composition API（`legacy: false`）
- **默认语言**：`zh-CN`
- **回退语言**：`zh-CN`
- **语言持久化**：localStorage key = `qims_locale`

### 语言文件

| 文件 | 语言 | 内容覆盖 |
|------|------|----------|
| `locales/zh-CN.ts` | 简体中文 | 菜单、按钮、提示、校验等 |
| `locales/en-US.ts` | English | 同上英文版 |

### 初始化注意

⚠️ `locales/index.ts` 中 i18n 初始化**不能调用 Pinia store**（详见此前修复的 Pinia 时序问题），改为直接从 `localStorage` 读取初始语言。

### 使用方式

```vue
<script setup>
const { t, locale } = useI18n()
</script>

<template>{{ t('common.confirm') }}</template>
```

---

## 10. 主题系统

### 支持模式

| 模式 | 值 | 说明 |
|------|-----|------|
| 亮色 | `light` | 默认模式 |
| 暗色 | `dark` | 深色背景 |

### 实现机制

通过 `themeStore` 切换时：
1. 更新 `document.documentElement` 的 `.dark` class
2. 设置 `data-theme` 属性
3. Element Plus 暗色适配（`el-loading-parent--dark`）
4. CSS 变量自动切换（定义在 `styles/index.scss`）

### 持久化

localStorage key = `qims_theme`

---

## 11. 构建与开发

### 可用脚本

```bash
# 开发服务器（端口 5173）
npm run dev

# 生产构建
npm run build

# 预览构建产物
npm run preview

# 类型检查
npm run type-check

# 仅构建（不跑类型检查）
npm run build-only

# 单元测试
npm run test:unit

# 代码检查
npm run lint

# 代码格式化
npm run format
```

### Vite 构建优化

- **自动导入**：Vue / Router / Pinia API 无需手动 import
- **组件自动注册**：Element Plus 按需引入
- **代码分割**：
  - `element-plus` 独立 chunk
  - `vue` + `@vue` 独立 chunk
- **路径别名**：`@` → `src/`
- **开发代理**：`/api` → `http://localhost:8080`

---

## 12. 环境配置

### 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `VITE_API_BASE_URL` | 后端 API 基础路径 | `/api` |

### 本地存储 Key 汇总

| Key | 类型 | 说明 |
|-----|------|------|
| `qims_token` | string | JWT 认证 Token |
| `qims_user` | JSON string | 登录后用户信息 |
| `qims_locale` | string | 语言偏好 (`zh-CN` / `en-US`) |
| `qims_theme` | string | 主题偏好 (`light` / `dark`) |

---

*文档生成时间：2026-05-12*
*基于 QIMS-forward 源码自动分析生成*
