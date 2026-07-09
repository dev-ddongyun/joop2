import type { Report } from '../types'

// 예시 신고 1건 (청주 성안길 인근, 미처리)
export const SEED_REPORTS: Report[] = [
  {
    id: 'r1',
    title: '성안길 입구 쓰레기 더미',
    description: '분리수거 안 된 쓰레기가 쌓여 있습니다.',
    category: 'litter',
    status: 'received',
    lat: 36.6348,
    lng: 127.4892,
    createdAt: '2026-07-01T09:12:00.000Z',
  },
]
