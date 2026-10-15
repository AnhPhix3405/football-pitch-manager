import { ConfigProvider, theme } from 'antd'
import { Provider } from 'react-redux'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { store } from './app/store'
import { env } from './config/env'
import './config/i18n'
import { AppRouter } from './routes/AppRouter'

const appTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#8cfc70',
    colorBgBase: '#000000',
    colorBgContainer: '#181818',
    colorBorder: '#485346',
    colorText: '#ddffdc',
    colorTextSecondary: '#8cab87',
    borderRadius: 8,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
}

function App() {
  return (
    <Provider store={store}>
      <GoogleOAuthProvider clientId={env.googleClientId}>
        <ConfigProvider theme={appTheme}>
          <AppRouter />
        </ConfigProvider>
      </GoogleOAuthProvider>
    </Provider>
  )
}

export default App
