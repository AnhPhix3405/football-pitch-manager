import { Alert, Button, Checkbox, Form, Input, InputNumber, Select, Spin, message } from 'antd'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { useOwnerPaymentSettings } from '../../hooks/useOwnerPaymentSettings'
import type { SaveOwnerPaymentSettings } from '../payment/interface/payment.interface'

export function OwnerPaymentSettingsPage() {
  const { fieldId = '' } = useParams()
  const { t } = useTranslation()
  const { settings, error, saving, save } = useOwnerPaymentSettings(fieldId)
  const [form] = Form.useForm<SaveOwnerPaymentSettings>()
  const [messageApi, context] = message.useMessage()
  const options = Form.useWatch('options', form)
  const depositType = Form.useWatch('depositType', form)
  const submit = async (values: SaveOwnerPaymentSettings) => {
    try {
      await save({
        ...values,
        depositType: values.options.includes('deposit') ? values.depositType : null,
        depositValue: values.options.includes('deposit') ? values.depositValue : null,
        terminalCode: values.terminalCode?.trim() || undefined,
        hashSecret: values.hashSecret?.trim() || undefined,
      })
      form.resetFields(['hashSecret'])
      messageApi.success(t('payment.settings.saved'))
    } catch (err) {
      messageApi.error(err instanceof Error ? err.message : t('payment.settings.error'))
    }
  }

  return (
    <section className="owner-page">
      {context}
      <header className="user-page__head">
        <h1>{t('payment.settings.title')}</h1>
        <Link to="/owner/fields">{t('nav.myFields')}</Link>
      </header>
      {error && <Alert type="error" title={t('payment.settings.error')} />}
      {!settings && !error && <Spin />}
      {settings && (
        <Form form={form} layout="vertical" initialValues={settings} onFinish={submit}>
          <Form.Item name="options" label={t('payment.selector.title')} rules={[{ required: true }]}>
            <Checkbox.Group options={['cash', 'deposit', 'full'].map((value) => ({
              value, label: t(`payment.options.${value}`),
            }))} />
          </Form.Item>
          {options?.includes('deposit') && (
            <>
              <Form.Item name="depositType" label={t('payment.settings.depositType')} rules={[{ required: true }]}>
                <Select options={[
                  { value: 'percentage', label: t('payment.settings.percentage') },
                  { value: 'fixed', label: t('payment.settings.fixed') },
                ]} />
              </Form.Item>
              <Form.Item name="depositValue" label={t('payment.settings.depositValue')} rules={[{ required: true }]}>
                <InputNumber min={1} max={depositType === 'percentage' ? 100 : 1000000000} precision={0} />
              </Form.Item>
            </>
          )}
          <Form.Item name="terminalCode" label={t('payment.settings.terminal')}>
            <Input autoComplete="off" maxLength={32} />
          </Form.Item>
          <Form.Item name="hashSecret" label={t('payment.settings.secret')} extra={t('payment.settings.secretHelp')}>
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={saving}>{t('payment.settings.save')}</Button>
        </Form>
      )}
    </section>
  )
}
