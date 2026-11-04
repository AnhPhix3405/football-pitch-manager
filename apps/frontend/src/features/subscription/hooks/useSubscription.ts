import { useState, useEffect, useCallback } from 'react'
import { message } from 'antd'
import { useTranslation } from 'react-i18next'
import {
  getActiveSubscriptionPlans,
  getMySubscription,
  subscribePlan,
  cancelSubscription,
} from '../service/subscription.service'
import type {
  SubscriptionPlan,
  UserSubscription,
} from '../interface/subscription.interface'

export function useSubscription() {
  const { t } = useTranslation()
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [mySubscription, setMySubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [plansData, currentSub] = await Promise.all([
        getActiveSubscriptionPlans().catch(() => []),
        getMySubscription().catch(() => null),
      ])
      setPlans(plansData)
      setMySubscription(currentSub)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSubscribe = async (planId: string) => {
    setSubscribing(true)
    try {
      const res = await subscribePlan({ planId })
      setMySubscription(res)
      message.success(t('subscription.subscribeSuccess', { defaultValue: 'Đăng ký gói hội viên thành công!' }))
      return res
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : t('subscription.subscribeFailed', { defaultValue: 'Đăng ký gói hội viên thất bại.' })
      message.error(errorMsg)
      return null
    } finally {
      setSubscribing(false)
    }
  }

  const handleCancel = async (id: string) => {
    setSubscribing(true)
    try {
      const res = await cancelSubscription(id)
      setMySubscription(res)
      message.success(t('subscription.cancelSuccess', { defaultValue: 'Hủy gói hội viên thành công.' }))
      return res
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : t('subscription.cancelFailed', { defaultValue: 'Hủy gói hội viên thất bại.' })
      message.error(errorMsg)
      return null
    } finally {
      setSubscribing(false)
    }
  }

  return {
    plans,
    mySubscription,
    loading,
    subscribing,
    fetchData,
    handleSubscribe,
    handleCancel,
  }
}

