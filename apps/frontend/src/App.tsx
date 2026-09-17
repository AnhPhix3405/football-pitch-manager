import { ConfigProvider, theme } from 'antd'
import { Provider } from 'react-redux'
import { store } from './app/store'
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
      <ConfigProvider theme={appTheme}>
        <AppRouter />
      </ConfigProvider>
    </Provider>
  )
}

export default App
