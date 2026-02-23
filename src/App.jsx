import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider, App as AntdApp } from 'antd'
import { Register } from './pages/admin/Register'
import { Login } from './pages/admin/Login'
import { Dashboard } from './pages/admin/Dashboard'  // ✅ UNIQUEMENT Dashboard
import { Produits as ProduitsPage } from './components/admin/Produits'  // ✅ CORRECT

function AppContent() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/register" element={<Register />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/dashboard" element={<Dashboard />}>
          <Route index element={<ProduitsPage />} />        {/* Page d'accueil = Produits */}
          <Route path="produits" element={<ProduitsPage />} />
          {/* Futurs onglets */}
          <Route path="proprietaires" element={<div className="p-8 text-center"><h2>👨‍💼 Propriétaires bientôt !</h2></div>} />
          <Route path="boutiques" element={<div className="p-8 text-center"><h2>🏪 Boutiques bientôt !</h2></div>} />
          <Route path="admins" element={<div className="p-8 text-center"><h2>👥 Admins bientôt !</h2></div>} />
          <Route path="livraisons" element={<div className="p-8 text-center"><h2>🚚 Livraisons bientôt !</h2></div>} />
        </Route>
        <Route path="/" element={<Navigate to="/admin/login" />} />
        <Route path="*" element={<Navigate to="/admin/login" />} />
      </Routes>
    </Router>
  )
}

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#4f46e5',
          borderRadius: 12,
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        },
        components: {
          Statistic: {
            valueFontSize: 24,
          },
          Menu: {
            itemSelectedColor: '#4f46e5',
            itemHoverColor: '#6366f1',
          }
        }
      }}
    >
      <AntdApp>
        <AppContent />
      </AntdApp>
    </ConfigProvider>
  )
}

export default App
