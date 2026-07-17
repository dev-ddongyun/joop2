import { create } from 'zustand'
import type { Report, ReportCategory, ReportStatus } from '../types'
import { SEED_REPORTS } from '../mocks/reports'
import { api } from '../lib/api'
import { parseReportListResponse } from '../lib/reportApi'

/*
 * [백엔드 연동 지점 — 신고(Report)]
 * 목록 조회와 신고 등록은 /reports API를 사용합니다.
 * 상태 변경과 치우기 완료는 계약 확정 전까지 메모리 상태로 동작합니다.
 */

// 신고 생성 시 입력값 (id/status/createdAt은 스토어가 채움)
export interface NewReportInput {
  title: string
  address: string
  description: string
  category: ReportCategory
  lat: number
  lng: number
  photoUrl: string
}

interface CreateReportRequest {
  title: string
  category: ReportCategory
  content: string
  address: string
  latitude: number
  longitude: number
  imageUrl: string
}

function toCreateReportRequest(input: NewReportInput): CreateReportRequest {
  return {
    title: input.title,
    category: input.category,
    content: input.description,
    address: input.address,
    latitude: input.lat,
    longitude: input.lng,
    imageUrl: input.photoUrl,
  }
}

interface ReportsState {
  reports: Report[]
  isLoading: boolean
  loadError: string | null
  fetchReports: () => Promise<void>
  addReport: (input: NewReportInput) => Report
  updateStatus: (id: string, status: ReportStatus) => void
  // 시민이 치우고 처리 후 사진을 올려 완료 처리
  resolveReport: (id: string, resolvedPhotoUrl: string) => void
}

let fetchReportsPromise: Promise<void> | null = null

function toErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

export const useReportsStore = create<ReportsState>((set) => ({
  // 서버 조회 전 또는 실패 시에는 목 데이터를 fallback으로 유지합니다.
  reports: SEED_REPORTS,
  isLoading: false,
  loadError: null,

  fetchReports: () => {
    if (fetchReportsPromise) return fetchReportsPromise

    set({ isLoading: true, loadError: null })
    fetchReportsPromise = api
      .get<unknown>('/reports')
      .then((response) => {
        const reports = parseReportListResponse(response)
        set({ reports, isLoading: false, loadError: null })
      })
      .catch((error) => {
        const message = toErrorMessage(error)
        console.error('신고 목록 API 실패 (/reports), 목 데이터를 사용합니다:', message)
        set({ isLoading: false, loadError: message })
      })
      .finally(() => {
        fetchReportsPromise = null
      })

    return fetchReportsPromise
  },

  // 신고 등록: POST /reports — 화면은 낙관적으로 먼저 반영하고, 서버 응답이 오면 덮어씀
  addReport: (input) => {
    const report: Report = {
      id: `r-${Date.now()}`,
      status: 'received',
      createdAt: new Date().toISOString(),
      ...input,
    }
    set((state) => ({ reports: [report, ...state.reports] }))
    const payload = toCreateReportRequest(input)
    api
      .post<Partial<Report>>('/reports', payload)
      .then((saved) => {
        if (!saved?.id) return
        set((state) => ({
          reports: state.reports.map((r) => (r.id === report.id ? { ...r, ...saved } : r)),
        }))
      })
      .catch((err) => {
        console.error('신고 등록 API 실패 (/reports):', err)
      })
    return report
  },

  // TODO(API): 상태 변경 요청 후 반영 (담당부서)
  updateStatus: (id, status) =>
    set((state) => ({
      reports: state.reports.map((r) => (r.id === id ? { ...r, status } : r)),
    })),

  // TODO(API): 치우기 완료(처리 후 사진 업로드) 요청 후 반영
  resolveReport: (id, resolvedPhotoUrl) =>
    set((state) => ({
      reports: state.reports.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'done',
              resolvedPhotoUrl,
              resolvedAt: new Date().toISOString(),
            }
          : r,
      ),
    })),
}))
