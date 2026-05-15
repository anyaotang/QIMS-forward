/**
 * 格式化工具函数
 * 用于处理数据展示格式，特别是大数值ID的字符串化显示
 */

/**
 * 将任意值安全地转换为字符串
 * 主要用于雪花ID等大数值，避免JavaScript Number精度丢失
 *
 * @param value - 任意值（number、string、null、undefined）
 * @returns 字符串形式，空值返回 '-'
 */
export function formatId(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '-'
  }
  return String(value)
}

/**
 * 截断长文本，超出部分用省略号显示
 *
 * @param text - 原始文本
 * @param maxLength - 最大长度（默认18）
 * @returns 截断后的文本
 */
export function truncateText(text: string, maxLength = 18): string {
  if (!text) return '-'
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
}

/**
 * 格式化ID用于表格展示（自动截断）
 *
 * @param value - ID值
 * @param maxLength - 最大显示长度（默认18）
 * @returns 格式化后的ID字符串
 */
export function formatTableId(value: unknown, maxLength = 18): string {
  const str = formatId(value)
  return truncateText(str, maxLength)
}
