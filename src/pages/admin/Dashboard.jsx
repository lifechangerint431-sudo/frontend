import { useEffect, useState } from 'react'
import { useNavigate, Outlet, useLocation } from 'react-router-dom'
import { Layout, Menu, Card, Statistic, Row, Col, Button, message, App as AntdApp, Spin } from 'antd'
import { 
  LogOut, Package, Store, User, Users, Truck, ChevronLeft, ChevronRight,
  ShoppingCart, DollarSign 
} from 'lucide-react'
import { produitsApi } from '../../api/produits'
import axios from 'axios'

const { Header, Sider, Content } = Layout

export const Dashboard = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [superAdmin, setSuperAdmin] = useState(null)
  const [stats, setStats] = useState({
    produits: 0,
    boutiques: 0,
    commandes: 0,
    livraisons: 0,
    revenus: 0
  })
  const [loading, setLoading] = useState(true)
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { message: msg } = AntdApp.useApp()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/admin/login')
      return
    }

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    loadDashboardData()
  }, [navigate])

  const loadDashboardData = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      
      const [profileRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/super-admin/profile`),
        axios.get(`${API_URL}/super-admin/stats`).catch(() => null)
      ])
      
      setSuperAdmin(profileRes.data.superAdmin)
      
      if (statsRes?.data) {
        setStats(statsRes.data)
      } else {
        try {
          const produitsRes = await produitsApi.getAll({ limit: 1 })
          setStats(prev => ({ ...prev, produits: produitsRes.data.count || 0 }))
        } catch {}
      }
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        msg.error('Session expirée')
        navigate('/admin/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    msg.success('Déconnexion réussie')
    navigate('/admin/login')
  }

  const menuItems = [
    { 
      key: 'produits', 
      icon: <Package className="w-5 h-5" />, 
      label: 'Produits Longrich',
      path: '/admin/dashboard/produits',
      onClick: () => navigate('/admin/dashboard/produits')
    },
    { 
      key: 'proprietaires', 
      icon: <User className="w-5 h-5" />, 
      label: 'Propriétaires',
      path: '/admin/dashboard/proprietaires'
    },
    { 
      key: 'boutiques', 
      icon: <Store className="w-5 h-5" />, 
      label: 'Boutiques',
      path: '/admin/dashboard/boutiques'
    },
    { 
      key: 'admins', 
      icon: <Users className="w-5 h-5" />, 
      label: 'Admins Secondaires',
      path: '/admin/dashboard/admins'
    },
    { 
      key: 'livraisons', 
      icon: <Truck className="w-5 h-5" />, 
      label: 'Livraisons',
      path: '/admin/dashboard/livraisons'
    }
  ]

  const currentKey = menuItems.find(item => 
    location.pathname.includes(item.key)
  )?.key || 'produits'

  const handleMenuClick = ({ key }) => {
    const item = menuItems.find(m => m.key === key)
    if (item?.onClick) item.onClick()
    setMobileMenuOpen(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Spin size="large" className="mb-6" />
        <p className="text-lg font-semibold text-gray-700">Chargement du Dashboard...</p>
      </div>
    )
  }

  return (
    <AntdApp className="min-h-screen">
      <Layout className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar Desktop */}
        <Sider 
          className="hidden lg:block fixed h-full z-30 shadow-2xl glass-effect transition-all duration-300"
          width={280}
          collapsed={collapsed}
          collapsible
        >
          <div className="p-6 h-full flex flex-col">
            {/* Header Sidebar */}
            <div className={`mb-8 ${collapsed ? 'text-center' : ''}`}>
              <div className={`flex items-center ${collapsed ? 'justify-center mb-6' : 'justify-between mb-8'}`}>
                {collapsed ? (
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Super Admin
                    </h1>
                    <Button
                      type="text"
                      onClick={() => setCollapsed(!collapsed)}
                      className="p-1 rounded-lg hover:bg-white/50"
                      icon={
                        collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />
                      }
                    />
                  </>
                )}
              </div>

              {/* Profil */}
              {!collapsed && superAdmin && (
                <div className="mb-8 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 truncate">{superAdmin.nom}</p>
                      <p className="text-xs text-indigo-700 truncate">{superAdmin.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Menu avec routing */}
            <Menu
              mode="inline"
              selectedKeys={[currentKey]}
              onClick={handleMenuClick}
              className="border-none flex-1 glass-effect rounded-2xl shadow-inner mb-8"
              inlineCollapsed={collapsed}
              items={menuItems.map(item => ({
                key: item.key,
                icon: item.icon,
                label: collapsed ? null : item.label,
                className: 'h-14 rounded-xl mx-2 my-2 py-3 hover:bg-white/50 backdrop-blur-sm'
              }))}
            />

            {/* Logout */}
            <Button
              onClick={logout}
              block
              size="large"
              className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-xl h-14 font-semibold rounded-2xl"
              icon={<LogOut className="w-5 h-5" />}
            >
              {collapsed ? '' : 'Déconnexion'}
            </Button>
          </div>
        </Sider>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed left-0 top-0 h-full w-80 z-50 glass-effect shadow-2xl">
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Super Admin
                </h1>
                <Button
                  type="text"
                  onClick={() => setMobileMenuOpen(false)}
                  icon={<ChevronLeft className="w-6 h-6" />}
                />
              </div>

              {superAdmin && (
                <div className="mb-8 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl">
                  <p className="text-sm font-bold text-gray-900">{superAdmin.nom}</p>
                  <p className="text-xs text-indigo-700">{superAdmin.email}</p>
                </div>
              )}

              <Menu
                mode="inline"
                selectedKeys={[currentKey]}
                onClick={handleMenuClick}
                className="border-none flex-1 mb-8"
                items={menuItems.map(item => ({
                  key: item.key,
                  icon: item.icon,
                  label: item.label,
                  className: 'h-14 rounded-xl py-3 my-1 hover:bg-indigo-50'
                }))}
              />

              <Button
                onClick={logout}
                block
                size="large"
                className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-xl h-14 font-semibold rounded-2xl"
                icon={<LogOut className="w-5 h-5" />}
              >
                Déconnexion
              </Button>
            </div>
          </div>
        )}

        {/* Main Layout */}
        <Layout className="lg:ml-280 transition-all duration-300">
          <Header className="glass-effect shadow-lg sticky top-0 z-20 bg-white/90 backdrop-blur-xl border-b">
            <div className="flex items-center justify-between h-16 px-4 lg:px-6">
              <div className="flex items-center">
                <Button
                  type="text"
                  icon={<ChevronLeft className="w-5 h-5 lg:hidden" />}
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden p-2"
                />
                <div className="ml-4 hidden sm:flex items-center space-x-3">
                  <Package className="w-6 h-6 text-indigo-600" />
                  <span className="text-xl font-bold text-gray-800">Dashboard Super Admin</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {superAdmin && (
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-bold text-gray-900">Bonjour, {superAdmin.nom}</p>
                    <p className="text-xs text-gray-500">
                      {new Date().toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Header>

          <Content className="p-4 sm:p-6 lg:p-8 overflow-auto">
            {/* Stats Cards - ✅ valueStyle → styles.content */}
            <Row gutter={[24, 24]} className="mb-8">
              <Col xs={24} sm={12} lg={6}>
                <Card className="glass-effect h-32 hover:shadow-2xl transition-all border-0">
                  <Statistic
                    title="Produits Longrich"
                    value={stats.produits}
                    styles={{ content: { color: '#3b82f6', fontSize: '2rem' } }}  // ✅ FIXÉ
                    prefix={<Package className="w-8 h-8 text-indigo-600" />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card className="glass-effect h-32 hover:shadow-2xl transition-all border-0">
                  <Statistic
                    title="Boutiques"
                    value={stats.boutiques}
                    styles={{ content: { color: '#10b981', fontSize: '2rem' } }}  // ✅ FIXÉ
                    prefix={<Store className="w-8 h-8 text-emerald-600" />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card className="glass-effect h-32 hover:shadow-2xl transition-all border-0">
                  <Statistic
                    title="Commandes"
                    value={stats.commandes}
                    styles={{ content: { color: '#f59e0b', fontSize: '2rem' } }}  // ✅ FIXÉ
                    prefix={<ShoppingCart className="w-8 h-8 text-amber-600" />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card className="glass-effect h-32 hover:shadow-2xl transition-all border-0">
                  <Statistic
                    title="Revenus"
                    value={stats.revenus || 0}
                    precision={0}
                    styles={{ content: { color: '#059669', fontSize: '1.5rem' } }}  // ✅ FIXÉ
                    prefix={<DollarSign className="w-8 h-8 text-emerald-600" />}
                    suffix="FCFA"
                  />
                </Card>
              </Col>
            </Row>

            {/* ✅ OUTLET POUR PAGES (Produits.jsx etc) */}
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </AntdApp>
  )
}
