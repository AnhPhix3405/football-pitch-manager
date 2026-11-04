import { useCallback, useEffect, useState } from 'react'
import {
  checkFieldAvailability,
  createOwnerPricing,
  deleteOwnerPricing,
  getOwnerPricingList,
  getPriceQuote,
  updateOwnerPricing,
} from '../service/owner.service'
import type {
  CheckAvailabilityQuery,
  CreatePricingPayload,
  FieldAvailabilityResult,
  FieldPricingItem,
  PriceQuoteQuery,
  PriceQuoteResult,
  PricingQueryParams,
  UpdatePricingPayload,
} from '../interface/owner-field.types'

export function useOwnerPricing(fieldId?: string) {
  const [pricingList, setPricingList] = useState<FieldPricingItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Quote & Availability states
  const [quoteResult, setQuoteResult] = useState<PriceQuoteResult | null>(null)
  const [calculatingQuote, setCalculatingQuote] = useState(false)
  const [quoteError, setQuoteError] = useState<string | null>(null)

  const [availabilityResult, setAvailabilityResult] = useState<FieldAvailabilityResult | null>(null)
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  const [availabilityError, setAvailabilityError] = useState<string | null>(null)

  const loadPricing = useCallback(
    async (params?: PricingQueryParams) => {
      if (!fieldId) return []
      try {
        setLoading(true)
        setError(null)
        const list = await getOwnerPricingList(fieldId, params)
        setPricingList(list)
        return list
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Lỗi tải danh sách bảng giá'
        setError(msg)
        return []
      } finally {
        setLoading(false)
      }
    },
    [fieldId],
  )

  useEffect(() => {
    if (fieldId) {
      void loadPricing()
    }
  }, [fieldId, loadPricing])

  const createPricing = async (payload: CreatePricingPayload) => {
    if (!fieldId) throw new Error('Field ID is required')
    const created = await createOwnerPricing(fieldId, payload)
    setPricingList((prev) => [...prev, created])
    return created
  }

  const updatePricing = async (pricingId: string, payload: UpdatePricingPayload) => {
    if (!fieldId) throw new Error('Field ID is required')
    const updated = await updateOwnerPricing(fieldId, pricingId, payload)
    setPricingList((prev) => prev.map((item) => (item.id === pricingId ? updated : item)))
    return updated
  }

  const deletePricing = async (pricingId: string) => {
    if (!fieldId) throw new Error('Field ID is required')
    await deleteOwnerPricing(fieldId, pricingId)
    setPricingList((prev) => prev.filter((item) => item.id !== pricingId))
  }

  const calculateQuote = async (params: PriceQuoteQuery) => {
    if (!fieldId) throw new Error('Field ID is required')
    try {
      setCalculatingQuote(true)
      setQuoteError(null)
      const quote = await getPriceQuote(fieldId, params)
      setQuoteResult(quote)
      return quote
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi tính toán báo giá'
      setQuoteError(msg)
      setQuoteResult(null)
      throw err
    } finally {
      setCalculatingQuote(false)
    }
  }

  const checkAvailability = async (params: CheckAvailabilityQuery) => {
    if (!fieldId) throw new Error('Field ID is required')
    try {
      setCheckingAvailability(true)
      setAvailabilityError(null)
      const res = await checkFieldAvailability(fieldId, params)
      setAvailabilityResult(res)
      return res
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi kiểm tra tình trạng trống'
      setAvailabilityError(msg)
      setAvailabilityResult(null)
      throw err
    } finally {
      setCheckingAvailability(false)
    }
  }

  return {
    pricingList,
    loading,
    error,
    loadPricing,
    createPricing,
    updatePricing,
    deletePricing,
    quoteResult,
    calculatingQuote,
    quoteError,
    calculateQuote,
    availabilityResult,
    checkingAvailability,
    availabilityError,
    checkAvailability,
  }
}
