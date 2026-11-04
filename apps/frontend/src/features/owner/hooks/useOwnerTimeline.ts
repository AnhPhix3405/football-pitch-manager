import { useCallback, useEffect, useState } from 'react'
import type { BackendFieldItem } from '../../fields/service/field.service'
import type { OwnerCourtTimeline } from '../interface/owner-booking.types'
import { getOwnerCourtTimeline, getOwnerFields } from '../service/owner.service'

const today = () => {
  const date = new Date()
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10)
}

export function useOwnerTimeline() {
  const [fields, setFields] = useState<BackendFieldItem[]>([])
  const [fieldId, setFieldId] = useState('')
  const [date, setDate] = useState(today)
  const [timeline, setTimeline] = useState<OwnerCourtTimeline | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getOwnerFields({ page: 1, limit: 100 })
      .then((result) => {
        setFields(result.items)
        setFieldId((current) => current || result.items[0]?.id || '')
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Unable to load fields'))
  }, [])

  const reload = useCallback(async () => {
    if (!fieldId || !date) {
      setTimeline(null)
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)
      setTimeline(await getOwnerCourtTimeline(fieldId, date))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to load timeline')
      setTimeline(null)
    } finally {
      setLoading(false)
    }
  }, [date, fieldId])

  useEffect(() => { void reload() }, [reload])

  return { fields, fieldId, setFieldId, date, setDate, timeline, loading, error, reload }
}
