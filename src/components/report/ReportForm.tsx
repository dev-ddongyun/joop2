import { useEffect, useState } from 'react'
import { IconMapPin, IconEdit, IconCamera, IconX } from '@tabler/icons-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { REPORT_REWARD } from '../../types'
import type { NewReportInput } from '../../store/reportsStore'
import { reverseGeocode } from '../../lib/reverseGeocode'

interface ReportFormProps {
  open: boolean
  coord: { lat: number; lng: number } | null
  onClose: () => void
  onSubmit: (input: NewReportInput) => void
  // 위치 재선택 (모달을 닫고 지도에서 다시 찍기 — 입력값은 유지)
  onRepick: () => void
}

export function ReportForm({ open, coord, onClose, onSubmit, onRepick }: ReportFormProps) {
  const [title, setTitle] = useState('')
  const [address, setAddress] = useState('')
  const [addressLoading, setAddressLoading] = useState(false)
  const [addressError, setAddressError] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [photo, setPhoto] = useState('') // 업로드한 사진 data URL

  useEffect(() => {
    if (!open || !coord) return

    let canceled = false
    setAddress('')
    setAddressLoading(true)
    setAddressError(null)

    reverseGeocode(coord)
      .then((result) => {
        if (!canceled) setAddress(result)
      })
      .catch((error: unknown) => {
        if (canceled) return
        const message = error instanceof Error ? error.message : '주소 자동 입력에 실패했습니다.'
        setAddressError(message)
      })
      .finally(() => {
        if (!canceled) setAddressLoading(false)
      })

    return () => {
      canceled = true
    }
  }, [open, coord])

  const reset = () => {
    setTitle('')
    setAddress('')
    setAddressLoading(false)
    setAddressError(null)
    setDescription('')
    setPhoto('')
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhoto(String(reader.result))
    reader.readAsDataURL(file)
    e.target.value = '' // 같은 파일 재선택 허용
  }

  const canSubmit =
    title.trim().length > 0 && address.trim().length > 0 && coord !== null && photo !== ''

  const handleSubmit = () => {
    if (!canSubmit || !coord) return
    onSubmit({
      title: title.trim(),
      address: address.trim(),
      description: description.trim(),
      category: 'litter', // 단일 카테고리 (쓰레기 무단투기)
      lat: coord.lat,
      lng: coord.lng,
      photoUrl: photo,
    })
    reset()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="신고하기"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            신고 접수 (+{REPORT_REWARD}P)
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {/* 위치 — 클릭 시 지도에서 재선택 */}
        <button
          type="button"
          onClick={onRepick}
          className="flex items-center justify-between gap-2 border border-neutral-300 bg-neutral-50 px-3 py-2 text-left text-sm transition-colors hover:border-esg-600 hover:bg-esg-50"
        >
          <span className="flex items-center gap-2">
            <IconMapPin size={18} className="text-esg-600" />
            {coord ? (
              <span className="text-neutral-700">
                위치: {coord.lat.toFixed(5)}, {coord.lng.toFixed(5)}
              </span>
            ) : (
              <span className="text-neutral-400">지도를 클릭해 위치를 지정하세요</span>
            )}
          </span>
          <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-esg-700">
            <IconEdit size={14} />
            위치 재선택
          </span>
        </button>

        {/* 주소 */}
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-neutral-700">주소</span>
          <input
            value={address}
            onChange={(e) => {
              setAddress(e.target.value)
              setAddressError(null)
            }}
            placeholder={
              addressLoading ? '선택한 위치의 주소를 찾는 중…' : '예: 충북 청주시 상당구 성안로 1'
            }
            className="border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-esg-600"
          />
          {addressError && (
            <span className="text-xs text-red-600">{addressError} 직접 입력해주세요.</span>
          )}
        </label>

        {/* 제목 */}
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-neutral-700">제목</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 성안길 입구 쓰레기 더미"
            className="border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-esg-600"
          />
        </label>

        {/* 설명 */}
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-neutral-700">설명</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="상황을 설명해주세요."
            className="resize-none border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-esg-600"
          />
        </label>

        {/* 사진 업로드 */}
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-neutral-700">사진 (필수)</span>
          {photo ? (
            <div className="relative">
              <img
                src={photo}
                alt="첨부 사진 미리보기"
                className="h-40 w-full border border-neutral-300 object-cover"
              />
              <button
                type="button"
                onClick={() => setPhoto('')}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center border border-neutral-800 bg-white text-neutral-700 hover:text-red-600"
                aria-label="사진 삭제"
              >
                <IconX size={16} />
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer items-center justify-center gap-2 border border-dashed border-neutral-300 py-6 text-sm text-neutral-500 transition-colors hover:border-esg-600 hover:text-esg-700">
              <IconCamera size={18} />
              사진 첨부
              <input
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>
    </Modal>
  )
}
