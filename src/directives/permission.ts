/**
 * v-permission 指令
 * 用法: <el-button v-permission="'user:create'">新增</el-button>
 */
import { type Directive, type DirectiveBinding } from 'vue'
import { useUserStore } from '@/stores/user'

/**
 * 权限指令值类型：
 * - string: 单个权限码
 * - string[]: 权限码数组（任一满足即可）
 * - { and: string[] }: 权限码数组（全部满足）
 */
type PermissionValue = string | string[] | { and: string[] }

function hasPermission(el: HTMLElement, binding: DirectiveBinding<PermissionValue>) {
  const userStore = useUserStore()
  const value = binding.value
  if (!value) return

  let allowed = false
  if (typeof value === 'string') {
    allowed = userStore.hasPermission(value)
  } else if (Array.isArray(value)) {
    allowed = value.some((p) => userStore.hasPermission(p))
  } else if (value && typeof value === 'object' && 'and' in value) {
    allowed = (value.and as string[]).every((p) => userStore.hasPermission(p))
  }

  if (!allowed) {
    el.style.display = 'none'
  }
}

export const permissionDirective: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding<PermissionValue>) {
    hasPermission(el, binding)
  },
  updated(el: HTMLElement, binding: DirectiveBinding<PermissionValue>) {
    hasPermission(el, binding)
  },
}
