import { loadKakaoMaps } from './kakaoLoader'

export interface Coordinate {
  lat: number
  lng: number
}

export async function reverseGeocode({ lat, lng }: Coordinate): Promise<string> {
  const kakao = await loadKakaoMaps()

  return new Promise((resolve, reject) => {
    const geocoder = new kakao.maps.services.Geocoder()
    geocoder.coord2Address(lng, lat, (results: any[], status: string) => {
      if (status !== kakao.maps.services.Status.OK || !results[0]) {
        reject(new Error('선택한 위치의 주소를 찾지 못했습니다.'))
        return
      }

      const address =
        results[0].road_address?.address_name ?? results[0].address?.address_name

      if (!address) {
        reject(new Error('선택한 위치의 주소를 찾지 못했습니다.'))
        return
      }

      resolve(address)
    })
  })
}
