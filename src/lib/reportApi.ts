import type { Report, ReportCategory, ReportStatus } from '../types'

interface BackendReport {
  id?: string | number
  title: string
  category: string
  content: string
  address: string
  latitude: number
  longitude: number
  imageUrl: string
  status?: string
  createdAt?: string
}

const REPORT_CATEGORIES: ReportCategory[] = ['litter', 'damage', 'recycling', 'other']
const REPORT_STATUSES: ReportStatus[] = ['received', 'done']

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isBackendReport(value: unknown): value is BackendReport {
  if (!isRecord(value)) return false

  return (
    typeof value.title === 'string' &&
    typeof value.category === 'string' &&
    typeof value.content === 'string' &&
    typeof value.address === 'string' &&
    typeof value.latitude === 'number' &&
    Number.isFinite(value.latitude) &&
    typeof value.longitude === 'number' &&
    Number.isFinite(value.longitude) &&
    typeof value.imageUrl === 'string'
  )
}

function normalizeCategory(value: string): ReportCategory {
  return REPORT_CATEGORIES.includes(value as ReportCategory)
    ? (value as ReportCategory)
    : 'other'
}

function normalizeStatus(value?: string): ReportStatus {
  return value && REPORT_STATUSES.includes(value as ReportStatus)
    ? (value as ReportStatus)
    : 'received'
}

function normalizeCreatedAt(value?: string) {
  return value && !Number.isNaN(Date.parse(value)) ? value : new Date().toISOString()
}

function fallbackId(report: BackendReport, index: number) {
  const source = `${report.title}|${report.latitude}|${report.longitude}|${index}`
  let hash = 0
  for (let i = 0; i < source.length; i += 1) {
    hash = (hash * 31 + source.charCodeAt(i)) | 0
  }
  return `api-${Math.abs(hash)}`
}

function toReport(report: BackendReport, index: number): Report {
  const id = report.id === undefined ? fallbackId(report, index) : String(report.id)

  return {
    id,
    title: report.title,
    description: report.content,
    address: report.address,
    category: normalizeCategory(report.category),
    status: normalizeStatus(report.status),
    lat: report.latitude,
    lng: report.longitude,
    photoUrl: report.imageUrl || undefined,
    createdAt: normalizeCreatedAt(report.createdAt),
  }
}

export function parseReportListResponse(value: unknown): Report[] {
  if (!Array.isArray(value)) {
    throw new Error('신고 목록 응답이 배열 형식이 아닙니다.')
  }

  return value.map((item, index) => {
    if (!isBackendReport(item)) {
      throw new Error(`신고 목록 ${index + 1}번째 항목의 필드 형식이 올바르지 않습니다.`)
    }
    return toReport(item, index)
  })
}
