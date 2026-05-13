// ============ 通用 ============
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

export interface PageResult<T> {
  list: T[]
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
  id: number
  title: string
  description?: string
  targetDate?: string
  assignee?: string
  status?: number // 0=待处理, 1=进行中, 2=已完成
  feedback?: string
  feedbackTime?: string
  nodeId?: number
  nodeName?: string
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

// ============ 字令典 ============
export interface DictData {
  label: string
  value: number | string
  type: string
}
