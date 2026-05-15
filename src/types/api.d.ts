// ============ 通用 ============
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

export interface PageResult<T> {
  records: T[]
  total: number
  page: number
  pageSize: number
}

export interface PageQuery {
  page?: number
  pageSize?: number
  keyword?: string
}

// ============ 认证 ============
export interface LoginForm {
  username: string
  password: string
}

export interface LoginVO {
  token: string
  userId: number
  username: string
  departmentId?: number
  roles: string[]
  permissions: string[]
  expiresAt: string
}

// ============ 用户 ============
export interface UserInfo {
  userId: number
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

export interface UserForm {
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

// ============ 部门 ============
export interface DepartmentTreeNode {
  id: number
  name: string
  parentId?: number
  orderNum?: number
  children?: DepartmentTreeNode[]

  [key: string]: unknown
}

// ============ 节点 ============
export interface NodeTreeNode {
  id: number
  name: string
  code?: string
  parentId?: number
  type?: number // 0=根节点, 1=区域, 2=产线, 3=工位
  orderNum?: number
  description?: string
  children?: NodeTreeNode[]

  [key: string]: unknown
}

export interface NodeForm {
  id?: number
  name: string
  code?: string
  parentId?: number | null
  type?: number
  orderNum?: number
  description?: string
}

// ============ 检测项 ============
export interface InspectionItem {
  id: number
  name: string
  code: string
  nodeId?: number
  nodeName?: string
  targetValue?: number
  unit?: string
  upperLimit?: number
  lowerLimit?: number
  dataSource: number // 0=自动, 1=半自动, 2=手动
  cronExpression?: string
  isActive?: boolean
  formula?: string
  defaultValueGroup?: string
  pushCondition?: string
  remark?: string
  status?: number
  createTime?: string
  updateTime?: string
}

export interface InspectionItemForm {
  id?: number
  name: string
  code: string
  nodeId?: number
  targetValue?: number
  unit?: string
  upperLimit?: number
  lowerLimit?: number
  dataSource?: number
  cronExpression?: string
  isActive?: boolean
  formula?: string
  defaultValueGroup?: string
  pushCondition?: string
  remark?: string
}

export interface DefaultValueGroup {
  groupName: string
  values: Record<string, number>
}

// ============ 检测记录 ============
export interface InspectionRecord {
  id: number
  itemId: number
  itemName: string
  nodeId?: number
  nodeName?: string
  value: number
  targetValue?: number
  unit?: string
  deviation?: number
  isQualified?: boolean
  dataSource: number
  recordTime?: string
  inspector?: string
  remark?: string
  createTime?: string
}

export interface ManualRecordForm {
  itemId: number
  nodeId?: number
  value: number
  recordTime?: string
  inspector?: string
  remark?: string
}

// ============ 检测任务 ============
export interface InspectionTask {
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
  createTime?: string
  updateTime?: string
}

export interface InspectionTaskForm {
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

export interface InspectionTaskDetail extends InspectionTask {
  items: InspectionTaskItem[]
}

export interface InspectionTaskItem {
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

// ============ 报表 ============
export interface QualityReport {
  id: number
  itemId: number
  itemName: string
  nodeId?: number
  nodeName?: string
  value: number
  targetValue?: number
  unit?: string
  deviation?: number
  deviationRate?: number // 偏差率%
  isQualified: boolean
  dataSource: number
  recordTime: string
  inspector?: string
}

export interface ReportQuery extends PageQuery {
  nodeId?: number
  itemId?: number
  startDate?: string
  endDate?: string
  isQualified?: boolean
}

// ============ 实施方案 ============
export interface ImplementationPlan {
  id?: number
  name?: string          // 对应数据库字段 name
  description?: string
  deadline?: string      // 对应数据库字段 deadline（日期）
  responsible?: string  // 对应数据库字段 responsible（负责人）
  parentId?: number     // 对应数据库字段 parent_id（父方案ID）
  status?: number       // 0=未开始, 1=进行中, 2=已完成
  feedback?: string
  feedbackTime?: string
  nodeId?: number
  nodeName?: string
  children?: ImplementationPlan[] // 树形结构（非数据库字段）
  createTime?: string
}

export interface FeedbackForm {
  planId: number
  feedback: string
}

// ============ 统计 ============
export interface Statistics {
  totalItems: number
  activeItems: number
  qualifiedRate: number
  todayRecords: number
  unqualifiedCount: number
  nodeCount: number
  departmentCount: number
}

// ============ 菜单 ============
export interface MenuDTO {
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

// ============ 权限/菜单表单 ============
export interface MenuForm {
  id?: number
  name: string
  code: string
  type: number // 1=菜单 2=按钮
  parentId?: number | null
  sort?: number
  path?: string
  icon?: string
  permission?: string
  status?: number // 0=禁用 1=启用
}

// ============ 字令典 ============
export interface DictData {
  label: string
  value: number | string
  type: string
}

// ============ 角色 ============
export interface RoleInfo {
  id: number
  name: string
  code: string
  status: number // 1=启用 0=禁用
  dataScope?: number // 数据范围：1全部 2本部门 3本部门及子部门 4仅本人
  remark?: string
  createTime?: string
  updateTime?: string
}

export interface RoleForm {
  id?: number
  name: string
  code: string
  status: number
  dataScope?: number
  remark?: string
}

// ============ 操作日志 ============
export interface LogInfo {
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
