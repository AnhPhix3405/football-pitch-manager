import { AppleFilled, EyeInvisibleOutlined, EyeOutlined, GoogleOutlined, LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons'
import { Alert, Button, Checkbox, Form, Input } from 'antd'
import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch } from '../../app/hooks'
import { BrandMark } from '../../common/BrandMark'
import { signedIn } from './auth.slice'
import { canRoleAccessPath, getRoleHome } from './auth.routing'
import { login, register } from './auth.service'
import type { LoginCredentials, RegisterDetails } from './auth.types'

type AuthMode = 'login' | 'register'
type FormValues = RegisterDetails & { confirmPassword?: string }

function FieldDiagram() {
  return <div className="field-radar" aria-hidden="true"><span className="radar-ring radar-ring--outer" /><span className="radar-ring radar-ring--inner" /><div className="field-map"><i className="field-map__half" /><i className="field-map__circle" /><i className="field-map__box field-map__box--left" /><i className="field-map__box field-map__box--right" /></div></div>
}

export function AuthPage() {
  const params = useParams<{ mode: string }>()
  const mode: AuthMode = params.mode === 'register' ? 'register' : 'login'
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form] = Form.useForm<FormValues>()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const changeMode = (nextMode: AuthMode) => { setError(null); form.resetFields(); navigate(`/auth/${nextMode}`) }
  const submit = async (values: FormValues) => {
    setError(null)
    try {
      const user = mode === 'login' ? await login(values as LoginCredentials) : await register(values)
      dispatch(signedIn(user))
      const requestedPath = typeof location.state === 'object' && location.state && 'from' in location.state && typeof location.state.from === 'string' ? location.state.from : null
      const destination = requestedPath && canRoleAccessPath(user.role, requestedPath) ? requestedPath : getRoleHome(user.role)
      navigate(destination, { replace: true })
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Không thể kết nối. Vui lòng thử lại.')
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-brand" aria-label="PitchMaster system status"><div><BrandMark /><p>Terminal Authorization</p></div><FieldDiagram /><div className="system-status"><i /> SYSTEM ONLINE</div></section>
      <section className="auth-panel">
        <div className="auth-mobile-brand"><BrandMark /><span><i /> TERMINAL</span></div>
        <div className="auth-card">
          <div className="auth-tabs" role="tablist" aria-label="Authentication mode"><button role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'active' : ''} onClick={() => changeMode('login')}>Đăng nhập</button><button role="tab" aria-selected={mode === 'register'} className={mode === 'register' ? 'active' : ''} onClick={() => changeMode('register')}>Đăng ký</button></div>
          <div className="auth-heading"><span className="eyebrow">SECURE ACCESS NODE</span><h1>{mode === 'login' ? 'Chào mừng trở lại.' : 'Tạo tài khoản mới.'}</h1><p>{mode === 'login' ? 'Đăng nhập để tiếp tục quản lý trận đấu của bạn.' : 'Tham gia cộng đồng và bắt đầu đặt sân.'}</p></div>
          {error && <Alert message={error} type="error" showIcon closable onClose={() => setError(null)} />}
          <Form form={form} layout="vertical" requiredMark={false} onFinish={submit} initialValues={{ remember: true }}>
            {mode === 'register' && <Form.Item label="HỌ VÀ TÊN" name="name" rules={[{ required: true, message: 'Vui lòng nhập họ và tên.' }, { min: 2, message: 'Tên cần có ít nhất 2 ký tự.' }]}><Input prefix={<UserOutlined />} placeholder="Nguyễn Minh Anh" autoComplete="name" /></Form.Item>}
            <Form.Item label="OPERATOR ID (EMAIL)" name="email" rules={[{ required: true, message: 'Vui lòng nhập email.' }, { type: 'email', message: 'Email chưa đúng định dạng.' }]}><Input prefix={<MailOutlined />} placeholder="you@pitchmaster.vn" autoComplete="email" /></Form.Item>
            <Form.Item label={<span className="password-label"><span>ACCESS CODE</span>{mode === 'login' && <button type="button">Đặt lại mã</button>}</span>} name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu.' }, { min: 8, message: 'Mật khẩu cần có ít nhất 8 ký tự.' }]}><Input prefix={<LockOutlined />} type={showPassword ? 'text' : 'password'} placeholder="••••••••" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} suffix={<button className="password-toggle" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>{showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}</button>} /></Form.Item>
            {mode === 'register' && <Form.Item name="confirmPassword" dependencies={['password']} rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu.' }, ({ getFieldValue }) => ({ validator(_, value: string) { return !value || getFieldValue('password') === value ? Promise.resolve() : Promise.reject(new Error('Mật khẩu xác nhận chưa khớp.')) } })]}><Input prefix={<LockOutlined />} type="password" placeholder="Xác nhận mật khẩu" autoComplete="new-password" /></Form.Item>}
            <Form.Item name="remember" valuePropName="checked"><Checkbox>{mode === 'login' ? 'Duy trì kết nối' : 'Tôi đồng ý với điều khoản sử dụng'}</Checkbox></Form.Item>
            <Form.Item><Button className="auth-submit" type="primary" htmlType="submit" block>{mode === 'login' ? 'Khởi tạo kết nối' : 'Tạo tài khoản'}</Button></Form.Item>
          </Form>
          <div className="auth-divider"><span>EXTERNAL AUTH</span></div><div className="social-actions"><Button icon={<GoogleOutlined />}>Google</Button><Button icon={<AppleFilled />}>Apple</Button></div>
          <footer className="auth-footer"><p>{mode === 'login' ? <>Bạn quản lý sân? <Link to="/owner/register">Đăng ký đối tác</Link></> : <>Đã có tài khoản? <button type="button" onClick={() => changeMode('login')}>Đăng nhập</button></>}</p><small>SECURE CONNECTION • ENCRYPTED NODE</small></footer>
        </div>
      </section>
    </main>
  )
}
