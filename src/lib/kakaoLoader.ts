// Kakao Maps JS SDK 동적 로더.
// - VITE_KAKAO_MAP_KEY 없으면 reject → 호출부에서 placeholder 처리
// - libraries=clusterer,services 로 마커 클러스터링과 좌표→주소 변환 사용
// - 중복 호출 시 하나의 Promise 재사용

let loadPromise: Promise<typeof window.kakao> | null = null

export function loadKakaoMaps(): Promise<typeof window.kakao> {
  if (loadPromise) return loadPromise

  loadPromise = new Promise((resolve, reject) => {
    const key = import.meta.env.VITE_KAKAO_MAP_KEY
    if (!key) {
      reject(new Error('VITE_KAKAO_MAP_KEY 가 설정되지 않았습니다.'))
      return
    }

    // 이미 로드된 경우
    if (window.kakao && window.kakao.maps) {
      resolve(window.kakao)
      return
    }

    const script = document.createElement('script')
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&libraries=clusterer,services&autoload=false`
    script.async = true
    script.onload = () => {
      window.kakao.maps.load(() => resolve(window.kakao))
    }
    script.onerror = () => reject(new Error('Kakao Maps SDK 로드에 실패했습니다.'))
    document.head.appendChild(script)
  })

  return loadPromise
}
