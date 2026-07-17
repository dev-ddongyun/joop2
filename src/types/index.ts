// 신고 카테고리
export type ReportCategory = 'litter' | 'damage' | 'recycling' | 'other'

// 신고 처리 상태 — 미처리(received) / 완료(done) 두 가지뿐
export type ReportStatus = 'received' | 'done'

// 신고 1건
export interface Report {
  id: string
  title: string
  description: string
  address?: string
  category: ReportCategory
  status: ReportStatus
  lat: number
  lng: number
  photoUrl?: string
  createdAt: string // ISO 문자열
  // 다른 시민이 치우고 올린 "처리 후" 사진/시각
  resolvedPhotoUrl?: string
  resolvedAt?: string
}

// 기프티콘 1건
export interface Gifticon {
  id: string
  name: string
  brand: string
  cost: number // 필요 마일리지
  imageUrl?: string
}

// ---- 한국어 라벨 매핑 ----

export const CATEGORY_LABEL: Record<ReportCategory, string> = {
  litter: '쓰레기 무단투기',
  damage: '환경 훼손',
  recycling: '재활용 문제',
  other: '기타',
}

export const STATUS_LABEL: Record<ReportStatus, string> = {
  received: '미처리',
  done: '완료',
}

// 신고 시 적립 마일리지
export const REPORT_REWARD = 100

// 신고된 쓰레기를 직접 치우고 처리했을 때 적립 마일리지
export const CLEANUP_REWARD = 200
