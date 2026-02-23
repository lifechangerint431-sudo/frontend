import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button, Form, Input, message } from 'antd'
import axios from 'axios'
import { UserPlus } from 'lucide-react'

const { Item } = Form

export const Register = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

const onFinish = async (values) => {
  setLoading(true)
  try {
    console.log('📤 Envoi:', values); // DEBUG Frontend
    
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/super-admin/register/super-admin-register-secret`,
      values,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    
    console.log('✅ Réponse:', response.data); // DEBUG
    localStorage.setItem('token', response.data.token)
    message.success('Super Admin créé!')
    navigate('/admin/dashboard')
  } catch (error) {
    console.error('❌ Erreur complète:', error.response?.data || error.message);
    message.error(error.response?.data?.message || 'Erreur serveur')
  } finally {
    setLoading(false)
  }
}


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-10 border border-white/30">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
            <UserPlus className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Créer Super Admin</h2>
          <p className="mt-2 text-sm text-gray-600">
            URL secrète activée - Accès unique
          </p>
        </div>

        <Form layout="vertical" onFinish={onFinish} size="large">
          <Item
            name="nom"
            rules={[{ required: true, message: 'Nom requis!' }]}
          >
            <Input placeholder="Nom complet" />
          </Item>

          <Item
            name="email"
            rules={[
              { required: true, message: 'Email requis!' },
              { type: 'email', message: 'Email invalide!' }
            ]}
          >
            <Input placeholder="Email@exemple.com" />
          </Item>

          <Item
            name="password"
            rules={[{ required: true, message: 'Mot de passe requis!' }]}
          >
            <Input.Password placeholder="Mot de passe sécurisé" />
          </Item>

          <Item
            name="telephone"
            rules={[{ required: false }]}
          >
            <Input placeholder="Téléphone (optionnel)" />
          </Item>

          <Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {loading ? 'Création...' : 'Créer Super Admin'}
            </Button>
          </Item>
        </Form>

        <div className="text-center">
          <Link to="/admin/login" className="text-sm text-blue-600 hover:text-blue-500 font-medium">
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  )
}
