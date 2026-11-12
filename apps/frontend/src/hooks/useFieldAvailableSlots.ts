import { useEffect, useState } from 'react'
import type { AvailableSlotsResponse } from '../features/bookings/interface/booking.types'
import { getFieldAvailableSlotsApi } from '../features/bookings/service/booking.service'

interface AvailableSlotsState {
  key: string
  data: AvailableSlotsResponse | null
  loading: boolean
  error: boolean
}

export function useFieldAvailableSlots(
  fieldId: string,
  date: string,
  courtType: string,
  enabled: boolean,
) {
  const key = `${fieldId}:${date}:${courtType}`
  const [state, setState] = useState<AvailableSlotsState>({
    key: '',
    data: null,
    loading: false,
    error: false,
  })

  useEffect(() => {
    if (!enabled || !fieldId) return

    const controller = new AbortController()
    setState({ key, data: null, loading: true, error: false })
    getFieldAvailableSlotsApi(fieldId, { date, courtType }, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setState({ key, data, loading: false, error: false })
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setState({ key, data: null, loading: false, error: true })
        }
      })

    return () => controller.abort()
  }, [fieldId, date, courtType, enabled, key])

  const current = enabled && state.key === key ? state : null
  return {
    slots: current?.data?.slots ?? [],
    isClosed: current?.data?.isClosed ?? false,
    loading: enabled && (!current || current.loading),
    error: current?.error ?? false,
  }
}
