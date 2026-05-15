# QIMS API 接口文档

> **Base URL**: `/api` （可通过 `VITE_API_BASE_URL` 环境变量覆盖）
>
> **认证方式**: `Authorization: Bearer <token>`（请求拦截器自动附加）
>
> **统一响应格式**:
> ```json
> {
>   "code": 0,
>   "message": "success",
>   "data": <T>
> }
> ```
> 其中 `code === 0 || code === 200` 视为成功。

---

## 目录

- [1. 认证模块](#1-认证模块-auth)
- [2. 用户模块](#2-用户模块-user)
- [3. 部门模块](#3-部门模块-department)
- [4. 角色模块](#4-角色模块-role)
- [5. 权限模块](#5-权限模块-permission)
- [6. 节点模块](#6-节点模块-node)
- [7. 检测项模块](#7-检测项模块-inspectionitem)
- [8. 检测任务模块](#8-检测任务模块-inspectiontask)
- [9. 检测记录模块](#9-检测记录模块-record)
- [10. 报表模块](#10-报表模块-report)
- [11. 实施方案模块](#11-实施方案模块-implementation)
- [12. 统计模块](#12-统计模块-statistics)
- [13. 字典模块](#13-字典模块-dict)
- [14. 日志模块](#14-日志模块-log)

---

## 1. 认证模块 (`/auth`)

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| `authApi.login` | POST | `/auth/login` | 用户名密码登录 |
| `authApi.urlLogin` | GET | `/auth/url-login?token=xxx` | URL Token 单点登录 |
| `authApi.logout` | POST | `/auth/logout` | 退出登录 |
| `authApi.menus` | GET | `/auth/menus` | 获取当前用户菜单树（侧边栏动态渲染） |

### POST /auth/login

**请求体**:
```ts
interface LoginForm {
  username: string
  password: string
}
```

**响应数据** (`LoginVO`):
```ts
interface LoginVO {
  token: string
  userId: number
  username: string
  departmentId?: number
  roles: string[]
  permissions: string[]
  expiresAt: string
}
```

---

## 2. 用户模块 (`/user`)

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| `userApi.info` | GET | `/user/info` | 获取当前登录用户信息 |
| `userApi.list` | GET | `/user/page?page=&pageSize=&departmentId=&status=` | 分页查询用户列表 |
| `userApi.create` | POST | `/user` | 创建用户 |
| `userApi.update` | PUT | `/user` | 更新用户 |
| `userApi.delete` | DELETE | `/user/:id` | 删除用户 |
| `userApi.resetPassword` | POST | `/user/:id/reset-password` | 重置用户密码 |
| `userApi.permissions` | GET | `/user/permissions` | 获取当前用户权限码列表 |
| `userApi.hasPermission` | GET | `/user/has-permission?code=xxx` | 检查当前用户是否有指定权限 |

### GET /user/info

**响应数据** (`UserInfo`):
```ts
interface UserInfo {
  id: string
  username: string
  nickname?: string
  email?: string
  phone?: string
  departmentId?: number
  departmentName?: string
  roles: string[]
  permissions: string[]
  avatar?: string
  status: number
}
```

### POST /user

**请求体** (`UserForm`):
```ts
interface UserForm {
  userId?: number
  username: string
  password?: string
  nickname?: string
  email?: string
  phone?: string
  departmentId?: number
  roleIds?: number[]
  status?: number
}
```

---

## 3. 部门模块 (`/department`)

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| `departmentApi.tree` | GET | `/department/tree` | 获取部门树（嵌套结构） |
| `departmentApi.list` | GET | `/department/list` | 获取部门列表（平铺） |
| `departmentApi.create` | POST | `/department` | 创建部门 |
| `departmentApi.update` | PUT | `/department` | 更新部门 |
| `departmentApi.delete` | DELETE | `/department/:id` | 删除部门 |
| `departmentApi.inheritRole` | POST | `/department/:id/inherit-role` | 部门继承角色 |

### GET /department/tree

**响应数据**: `DepartmentTreeNode[]`

```ts
interface DepartmentTreeNode {
  id: number
  name: string
  parentId?: number
  orderNum?: number
  children?: DepartmentTreeNode[]
}
```

---

## 4. 角色模块 (`/role`)

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| `roleApi.page` | GET | `/role/page?page=&pageSize=&keyword=` | 分页查询角色列表 |
| `roleApi.detail` | GET | `/role/:id` | 获取角色详情 |
| `roleApi.create` | POST | `/role` | 创建角色 |
| `roleApi.update` | PUT | `/role` | 更新角色 |
| `roleApi.delete` | DELETE | `/role/:id` | 删除角色 |
| `roleApi.permissions` | GET | `/role/:id/permissions` | 获取角色权限 |
| `roleApi.assignPermissions` | POST | `/role/:id/permissions` | 分配角色权限 |

### POST /role

**请求体** (`RoleForm`):
```ts
interface RoleForm {
  id?: number
  name: string
  code: string
  status: number
  dataScope?: number
  remark?: string
}
```

---

## 5. 权限模块 (`/permission`)

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| `permissionApi.menuTree` | GET | `/permission/menu-tree` | 获取菜单树（含权限信息） |
| `permissionApi.list` | GET | `/permission/list` | 获取权限列表 |
| `permissionApi.create` | POST | `/permission` | 创建权限 |
| `permissionApi.update` | PUT | `/permission` | 更新权限 |
| `permissionApi.delete` | DELETE | `/permission/:id` | 删除权限 |

### GET /permission/menu-tree

**响应数据**: `MenuDTO[]`

```ts
interface MenuDTO {
  id: number
  name: string
  code: string
  type: number // 1=菜单 2=按钮
  parentId?: number | null
  sort?: number
  path?: string
  icon?: string
  children?: MenuDTO[]
}
```

---

## 6. 节点模块 (`/node`)

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| `nodeApi.tree` | GET | `/node/tree?type=&keyword=` | 获取节点树（嵌套结构） |
| `nodeApi.list` | GET | `/node/list?page=&pageSize=&type=&parentId=` | 分页查询节点列表 |
| `nodeApi.create` | POST | `/node` | 创建节点 |
| `nodeApi.update` | PUT | `/node` | 更新节点 |
| `nodeApi.delete` | DELETE | `/node/:id` | 删除节点 |
| `nodeApi.move` | POST | `/node/:id/move` | 移动节点（调整父子关系和排序） |

### 请求参数说明

- `tree` 接口: `type` - 节点类型（0=根节点, 1=区域, 2=产线, 3=工位）
- `move` 接口请求体: `{ parentId: number | null, orderNum: number }`

### GET /node/tree

**响应数据**: `NodeTreeNode[]`

```ts
interface NodeTreeNode {
  id: number
  name: string
  code?: string
  parentId?: number
  type?: number      // 0=根节点, 1=区域, 2=产线, 3=工位
  orderNum?: number
  description?: string
  children?: NodeTreeNode[]
}
```

---

## 7. 检测项模块 (`/inspectionitem`)

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| `inspectionItemApi.page` | GET | `/inspectionitem/page?page=&pageSize=&nodeId=&dataSource=&status=` | 分页查询检测项 |
| `inspectionItemApi.detail` | GET | `/inspectionitem/:id` | 获取检测项详情 |
| `inspectionItemApi.create` | POST | `/inspectionitem` | 创建检测项 |
| `inspectionItemApi.update` | PUT | `/inspectionitem` | 更新检测项 |
| `inspectionItemApi.delete` | DELETE | `/inspectionitem/:id` | 删除检测项 |
| `inspectionItemApi.toggleActive` | POST | `/inspectionitem/:id/toggle-active` | 启用/停用检测项 |
| `inspectionItemApi.defaultValueGroups` | GET | `/inspectionitem/default-value` | 获取默认值分组列表 |
| `inspectionItemApi.createDefaultValueGroup` | POST | `/inspectionitem/default-value` | 创建默认值分组 |
| `inspectionItemApi.updateDefaultValueGroup` | PUT | `/inspectionitem/default-value` | 更新默认值分组 |
| `inspectionItemApi.deleteDefaultValueGroup` | DELETE | `/inspectionitem/default-value?groupName=xxx` | 删除默认值分组 |

### POST /inspectionitem/:id/toggle-active

**请求体**: `{ isActive: boolean }`

---

## 8. 检测任务模块 (`/inspectiontask`)

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| `inspectionTaskApi.page` | GET | `/inspectiontask/page?page=&pageSize=&nodeId=&status=` | 分页查询检测任务 |
| `inspectionTaskApi.detail` | GET | `/inspectiontask/:id` | 获取检测任务详情（含检测项列表） |
| `inspectionTaskApi.create` | POST | `/inspectiontask` | 创建检测任务 |
| `inspectionTaskApi.update` | PUT | `/inspectiontask` | 更新检测任务 |
| `inspectionTaskApi.delete` | DELETE | `/inspectiontask/:id` | 删除检测任务 |
| `inspectionTaskApi.start` | POST | `/inspectiontask/:id/start` | 开始检测任务 |
| `inspectionTaskApi.complete` | POST | `/inspectiontask/:id/complete` | 完成检测任务 |
| `inspectionTaskApi.cancel` | POST | `/inspectiontask/:id/cancel` | 取消检测任务 |
| `inspectionTaskApi.submitItem` | POST | `/inspectiontask/:id/item` | 提交单个检测项结果 |

### POST /inspectiontask

**请求体** (`InspectionTaskForm`):
```ts
interface InspectionTaskForm {
  id?: number
  name: string
  code: string
  nodeId: number
  planStartTime?: string
  planEndTime?: string
  inspector?: string
  remark?: string
  itemIds?: number[]
}
```

### GET /inspectiontask/:id

**响应数据** (`InspectionTaskDetail`):
```ts
interface InspectionTaskDetail extends InspectionTask {
  items: InspectionTaskItem[]
}

interface InspectionTask {
  id: number
  name: string
  code: string
  nodeId: number
  nodeName?: string
  status: number // 0=待检测 1=检测中 2=已完成 3=已取消
  totalItems: number
  completedItems: number
  qualifiedCount: number
  unqualifiedCount: number
  planStartTime?: string
  planEndTime?: string
  actualStartTime?: string
  actualEndTime?: string
  inspector?: string
  remark?: string
}

interface InspectionTaskItem {
  id: number
  taskId: number
  itemId: number
  itemName: string
  itemCode: string
  targetValue?: number
  unit?: string
  upperLimit?: number
  lowerLimit?: number
  actualValue?: number
  deviation?: number
  isQualified?: boolean
  status: number // 0=待检测 1=已检测 2=跳过
  recordTime?: string
  inspector?: string
  remark?: string
}
```

---

## 9. 检测记录模块 (`/record`)

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| `recordApi.page` | GET | `/record/page?page=&pageSize=&itemId=&nodeId=&startDate=&endDate=` | 分页查询检测记录 |
| `recordApi.manual` | POST | `/record/manual` | 手动录入检测记录 |

### POST /record/manual

**请求体** (`ManualRecordForm`):
```ts
interface ManualRecordForm {
  itemId: number
  nodeId?: number
  value: number
  recordTime?: string
  inspector?: string
  remark?: string
}
```

---

## 10. 报表模块 (`/report`)

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| `reportApi.quality` | GET | `/report/quality?page=&pageSize=&nodeId=&itemId=&startDate=&endDate=&isQualified=` | 质量报表（分页） |
| `reportApi.export` | GET | `/report/quality/export?...` | 导出质量报表（返回 Blob/Excel 文件） |

> ⚠️ `export` 接口直接请求 `${VITE_API_BASE_URL}/report/quality/export`，绕过 axios baseURL，确保文件下载正确。

---

## 11. 实施方案模块 (`/implementation`)

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| `implementationApi.planTree` | GET | `/implementation/plan/tree?nodeId=&status=` | 获取实施方案树（按节点/状态筛选） |
| `implementationApi.planList` | GET | `/implementation/plan/list?page=&pageSize=` | 分页查询实施方案列表 |
| `implementationApi.planDetail` | GET | `/implementation/plan/:id` | 获取实施方案详情 |
| `implementationApi.createPlan` | POST | `/implementation/plan` | 创建实施方案 |
| `implementationApi.updatePlan` | PUT | `/implementation/plan` | 更新实施方案 |
| `implementationApi.deletePlan` | DELETE | `/implementation/plan/:id` | 删除实施方案 |
| `implementationApi.submitFeedback` | POST | `/implementation/feedback` | 提交实施方案反馈 |

### POST /implementation/feedback

**请求体** (`FeedbackForm`):
```ts
interface FeedbackForm {
  planId: number
  feedback: string
}
```

### GET /implementation/plan/tree

**响应数据**: `ImplementationPlan[]`

```ts
interface ImplementationPlan {
  id?: number
  name?: string
  description?: string
  deadline?: string
  responsible?: string
  parentId?: number
  status?: number // 0=未开始, 1=进行中, 2=已完成
  feedback?: string
  feedbackTime?: string
  nodeId?: number
  nodeName?: string
  children?: ImplementationPlan[]
}
```

---

## 12. 统计模块 (`/statistics`)

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| `statisticsApi.dashboard` | GET | `/statistics` | 获取仪表盘统计数据 |

### GET /statistics

**响应数据** (`Statistics`):
```ts
interface Statistics {
  totalItems: number
  activeItems: number
  qualifiedRate: number
  todayRecords: number
  unqualifiedCount: number
  nodeCount: number
  departmentCount: number
}
```

---

## 13. 字典模块 (`/dict`)

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| `dictApi.list` | GET | `/dict/list?type=xxx` | 按类型获取字典数据 |

### GET /dict/list?type=xxx

**响应数据**: `DictData[]`

```ts
interface DictData {
  label: string
  value: number | string
  type: string
}
```

---

## 14. 日志模块 (`/log`)

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| `logApi.page` | GET | `/log/page?page=&pageSize=&username=&module=&startDate=&endDate=` | 分页查询操作日志 |
| `logApi.detail` | GET | `/log/:id` | 获取日志详情 |

### GET /log/page

**响应数据**: `PageResult<LogInfo>`

```ts
interface LogInfo {
  id: number
  username: string
  module: string
  description: string
  method: string
  url: string
  ip: string
  params: string
  result: string
  duration: number
  createTime: string
}
```

---

## 前端调用示例

```ts
// 在 Vue 组件中
import { userApi } from '@/api/user'
import { extractData } from '@/utils/request'

const res = await userApi.info()
const userInfo = extractData(res)
console.log(userInfo.username)
```

```ts
// 使用 authApi（含 menus）
import { authApi } from '@/api/auth'
import type { MenuDTO } from '@/types/api'

const res = await authApi.menus()
const menus: MenuDTO[] = extractData(res)
// menus 用于 Sidebar 动态渲染
```

```ts
// 使用 inspectionTaskApi
import { inspectionTaskApi } from '@/api/inspectionTask'
import type { InspectionTaskDetail } from '@/types/api'

const res = await inspectionTaskApi.detail(taskId)
const task: InspectionTaskDetail = extractData(res)
```