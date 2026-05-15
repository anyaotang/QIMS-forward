# QIMS-forward

> **QIMS（Quality Inspection Management System）质量检测管理系统** - 前端应用

基于 Vue 3 + TypeScript + Vite + Element Plus 构建的现代化质量管理系统前端应用。

## 功能模块

| 模块         | 说明                                                     |
| ------------ | -------------------------------------------------------- |
| **仪表盘**   | 系统总览、统计数据可视化                                 |
| **系统管理** | 用户、部门、角色、权限、操作日志管理                     |
| **质量管理** | 节点管理、检测任务、检测项、检测记录、人工录入、推送管理 |
| **生产管理** | 实施反馈                                                 |
| **报表中心** | 质量报表、统计分析                                       |
| **实施方案** | 实施计划管理、反馈记录                                   |

## 技术栈

- **框架**: Vue 3 (Composition API)
- **语言**: TypeScript
- **构建工具**: Vite 8
- **UI 组件库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router 5
- **国际化**: Vue I18n
- **图表**: ECharts + vue-echarts
- **代码规范**: ESLint + Prettier + OXLint

## 快速开始

### 环境要求

- Node.js: ^20.19.0 || >=22.12.0
- pnpm: 推荐使用

### 安装依赖

```sh
pnpm install
```

### 开发模式

```sh
pnpm dev
```

访问 http://localhost:5173

### 生产构建

```sh
pnpm build
```

### 预览构建产物

```sh
pnpm preview
```

### 运行单元测试

```sh
pnpm test:unit
```

### 代码检查

```sh
pnpm lint
```

### 代码格式化

```sh
pnpm format
```

## 项目结构

```
src/
├── api/          # API 接口层
├── assets/       # 静态资源
├── components/   # 公共组件
├── directives/   # 自定义指令（权限指令等）
├── layouts/      # 布局组件
├── locales/      # 国际化语言包
├── router/       # 路由配置
├── stores/       # Pinia 状态管理
├── styles/       # 全局样式
├── types/        # TypeScript 类型定义
├── utils/        # 工具函数
└── views/        # 页面视图
```

## 配置文件

| 文件               | 说明            |
| ------------------ | --------------- |
| `.env`             | 环境变量配置    |
| `vite.config.ts`   | Vite 构建配置   |
| `tsconfig.json`    | TypeScript 配置 |
| `eslint.config.ts` | ESLint 配置     |
| `vitest.config.ts` | Vitest 测试配置 |

## 文档

- [项目文档](PROJECT_DOC.md) - 详细的项目架构说明
- [API 文档](API_DOC.md) - 接口说明文档

---

_质量检测管理系统 © 2026_
