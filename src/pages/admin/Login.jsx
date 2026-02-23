import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button, Form, Input, message } from 'antd'  // ✅ message direct import
import axios from 'axios'
import { Shield, Mail, Lock } from 'lucide-react'

const { Item } = Form

export const Login = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      const response = await axios.post(`${API_URL}/super-admin/login`, values)
      
      localStorage.setItem('token', response.data.token)
      
      // ✅ message() direct - AUCUN App.message
      message.success('Connexion réussie ! 🎉')
      
      setTimeout(() => {
        navigate('/admin/dashboard', { replace: true })
      }, 800)
      
    } catch (error) {
      console.error('Login error:', error)
      
      // ✅ Gestion 100% safe des erreurs
      let errorMessage = 'Erreur de connexion'
      
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'Route login non trouvée. Backend OK mais route manquante.'
        } else if (error.response.status === 401) {
          errorMessage = 'Identifiants incorrects'
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message
        }
      } else if (error.request) {
        errorMessage = 'Serveur inaccessible. Vérifiez backend.'
      }
      
      message.error(errorMessage)
      
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10 border border-white/50">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <Shield className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Super Admin</h2>
          <p className="text-sm text-gray-600 mb-1">Accès administrateur principal</p>
          <p className="text-xs text-indigo-600 font-medium">Longrich Boutique Management</p>
        </div>

        {/* Formulaire */}
        <Form 
          form={form}
          layout="vertical" 
          onFinish={onFinish} 
          size="large"
          autoComplete="off"
          className="space-y-4"
        >
          <Item
            name="email"
            rules={[
              { required: true, message: 'Email requis !' },
              { type: 'email', message: 'Format email invalide !' }
            ]}
            className="mb-0"
          >
            <Input 
              prefix={<Mail className="w-4 h-4 text-gray-400" />}
              placeholder="admin@longrich.cm" 
              className="rounded-xl h-12 pl-10"
            />
          </Item>

          <Item
            name="password"
            rules={[
              { required: true, message: 'Mot de passe requis !' },
              { min: 6, message: 'Minimum 6 caractères' }
            ]}
            className="mb-0"
          >
            <Input.Password 
              prefix={<Lock className="w-4 h-4 text-gray-400" />}
              placeholder="••••••••" 
              className="rounded-xl h-12 pl-10"
            />
          </Item>

          <Item className="mb-4">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 h-12"
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </Button>
          </Item>
        </Form>

        {/* Debug + Liens */}
        <div className="text-center space-y-3 pt-4">
          <div className="text-xs text-gray-500 bg-gray-100 p-3 rounded-xl">
            <p>🔌 Backend: {import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}</p>
            <p>✅ Backend OK ! (Login détecté)</p>
            <p>📱 Test: admin@longrich.cm / admin123</p>
          </div>
          
          <Link 
            to="/admin/register" 
            className="block w-full bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl py-3 px-4 text-sm font-medium text-gray-700 hover:bg-white hover:border-gray-300 hover:shadow-md transition-all duration-200"
          >
            👆 Première connexion ? Créer un compte
          </Link>
        </div>
      </div>
    </div>
  )
}
