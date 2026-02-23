import { useState, useEffect, useCallback } from 'react'
import { 
  Table, Button, Modal, Form, Input, Select, Upload, message, Tag, Space, Popconfirm,
  Pagination, Row, Col, Card, Typography, Spin, Empty, InputNumber 
} from 'antd'
import { Plus, Edit2, Trash2, Package, Upload as UploadIcon, VideoIcon } from 'lucide-react'
import { produitsApi } from '../../api/produits'

const { Option } = Select
const { Title } = Typography
const { TextArea } = Input

const categories = [
  'soin_sante', 'cosmetique', 'complement_alimentaire', 
  'electronique', 'electromenager', 'agroalimentaire', 
  'usage_quotidien', 'textile'
]

const CATEGORIE_LABELS = {
  soin_sante: 'Santé', cosmetique: 'Cosmétique', complement_alimentaire: 'Compléments',
  electronique: 'Électronique', electromenager: 'Électroménager', agroalimentaire: 'Agroalimentaire',
  usage_quotidien: 'Usage quotidien', textile: 'Textile'
}

const validateNumber = (_, value) => {
  if (!value && value !== 0) {
    return Promise.reject(new Error('Champ obligatoire'))
  }
  if (isNaN(value) || value < 0) {
    return Promise.reject(new Error('Doit être un nombre positif'))
  }
  return Promise.resolve()
}

export const Produits = () => {
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [produits, setProduits] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [selectedProduit, setSelectedProduit] = useState(null)

  const fetchProduits = useCallback(async (page = 1, pageSize = 10) => {
    setLoading(true)
    try {
      const response = await produitsApi.getAll({ page, limit: pageSize })
      setProduits(response.data.produits || [])
      setPagination({
        current: response.data.pagination?.current || 1,
        pageSize,
        total: response.data.pagination?.total || 0
      })
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProduits()
  }, [fetchProduits])

  const openModal = (produit = null) => {
    setSelectedProduit(produit)
    setModalVisible(true)
    
    setTimeout(() => {
      form.resetFields()
      if (produit) {
        const formValues = {
          nom: produit.nom,
          categorie: produit.categorie,
          pv: produit.pv,
          prixClient: produit.prixClient,
          prixPartenaire: produit.prixPartenaire || 0,
          description: produit.description,
          modeEmploi: produit.modeEmploi || '',
          promoActive: produit.promoActive || false,
          prixPromo: produit.prixPromo || '',
          consignePromo: produit.consignePromo || ''
        }
        form.setFieldsValue(formValues)

        const photoList = produit.photo ? [{
          uid: '-1',
          name: 'photo.jpg',
          status: 'done',
          url: produit.photo
        }] : []
        
        const videoList = produit.videoDemo ? [{
          uid: '-2',
          name: 'video.mp4',
          status: 'done',
          url: produit.videoDemo
        }] : []

        form.setFieldsValue({ photoFile: photoList, videoDemoFile: videoList })
      } else {
        form.setFieldsValue({ 
          promoActive: false, 
          prixPartenaire: 0,
          prixPromo: '',
          consignePromo: ''
        })
      }
    }, 100)
  }

  const handleSubmit = async (values) => {
    console.log('✅ FORM VALUES:', values)
    
    try {
      const photoFile = values.photoFile?.[0]
      const videoFile = values.videoDemoFile?.[0]
      
      // ✅ NOUVELLE IMAGE UNIQUEMENT si originFileObj existe
      const newPhotoFile = photoFile?.originFileObj
      const newVideoFile = videoFile?.originFileObj

      const submitData = {
        nom: values.nom?.trim(),
        pv: Number(values.pv),
        consignePromo: values.consignePromo?.trim() || null,
        prixPartenaire: Number(values.prixPartenaire || 0),
        prixClient: Number(values.prixClient),
        prixPromo: values.prixPromo ? Number(values.prixPromo) : null,
        promoActive: Boolean(values.promoActive),
        categorie: values.categorie,
        description: values.description?.trim(),
        modeEmploi: values.modeEmploi?.trim() || null
      }

      console.log('✅ ENVOI API:', submitData)
      console.log('📸 Nouvelle photo:', newPhotoFile ? 'OUI' : 'NON')
      console.log('🎥 Nouvelle vidéo:', newVideoFile ? 'OUI' : 'NON')

      if (selectedProduit) {
        await produitsApi.update(selectedProduit.id, submitData, newPhotoFile, newVideoFile)
        message.success('✅ Produit mis à jour !')
      } else {
        await produitsApi.create(submitData, newPhotoFile, newVideoFile)
        message.success('✅ Produit créé !')
      }

      setModalVisible(false)
      fetchProduits()
    } catch (error) {
      console.error('❌ ERREUR:', error)
      message.error(error.response?.data?.message || 'Erreur')
    }
  }

  const handleDelete = async (id) => {
    try {
      await produitsApi.delete(id)
      message.success('Supprimé !')
      fetchProduits()
    } catch (error) {
      message.error('Erreur suppression')
    }
  }

  const columns = [
    { 
      title: 'Image', 
      dataIndex: 'photo', 
      width: 80,
      render: (photo) => (
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center border">
          {photo ? <img src={photo} className="w-full h-full object-cover" /> : <Package className="w-6 h-6 text-gray-400" />}
        </div>
      )
    },
    { title: 'Nom', dataIndex: 'nom', render: text => <b className="text-gray-900">{text}</b> },
    { 
      title: 'Prix', 
      width: 160,
      render: (_, record) => (
        <div>
          <div className="font-bold text-emerald-600 text-lg">{record.prixClient} FCFA</div>
          {record.prixPartenaire && <div className="text-sm text-orange-600">Part: {record.prixPartenaire} FCFA</div>}
        </div>
      )
    },
    { title: 'Catégorie', dataIndex: 'categorie', width: 120, render: cat => <Tag color="blue">{CATEGORIE_LABELS[cat]}</Tag> },
    { title: 'Statut', width: 90, render: (_, r) => <Tag color={r.isActive ? 'green' : 'gray'}>{r.isActive ? 'Actif' : 'Inactif'}</Tag> },
    { title: 'Promo', width: 70, render: (_, r) => <Tag color={r.promoActive ? 'orange' : 'default'}>{r.promoActive ? 'ON' : 'OFF'}</Tag> },
    { 
      title: 'Actions', 
      width: 160,
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<Edit2 className="w-4 h-4" />} onClick={() => openModal(record)}>Modifier</Button>
          <Popconfirm title="Supprimer ?" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger>Supprimer</Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Card>
        <div className="flex justify-between items-center">
          <Title level={2}>Produits Longrich ({pagination.total})</Title>
          <Button type="primary" icon={<Plus />} onClick={() => openModal()} size="large">Nouveau</Button>
        </div>
      </Card>

      <Card>
        <Spin spinning={loading}>
          {produits.length === 0 ? <Empty /> : (
            <>
              <Table columns={columns} dataSource={produits} rowKey="id" pagination={false} scroll={{ x: 1000 }} />
              {pagination.total > 10 && (
                <div className="pt-6 flex justify-center">
                  <Pagination current={pagination.current} total={pagination.total} pageSize={10} onChange={page => fetchProduits(page, 10)} />
                </div>
              )}
            </>
          )}
        </Spin>
      </Card>

      <Modal
        title={selectedProduit ? `Modifier "${selectedProduit.nom}"` : 'Nouveau produit'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={1000}
        destroyOnHidden={true}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="pt-4">
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item name="nom" label="Nom" rules={[{ required: true, message: 'Nom requis' }]}>
                <Input size="large" placeholder="Nom du produit" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="categorie" label="Catégorie" rules={[{ required: true }]}>
                <Select size="large" placeholder="Choisir">
                  {categories.map(cat => <Option key={cat} value={cat}>{CATEGORIE_LABELS[cat]}</Option>)}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={8}>
              <Form.Item name="pv" label="Prix Vente (PV)" rules={[{ validator: validateNumber }]}>
                <InputNumber style={{ width: '100%' }} min={0} precision={2} size="large" placeholder="50000" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="prixClient" label="Prix Client" rules={[{ validator: validateNumber }]}>
                <InputNumber style={{ width: '100%' }} min={0} precision={2} size="large" placeholder="45000" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="prixPartenaire" label="Prix Partenaire">
                <InputNumber style={{ width: '100%' }} min={0} precision={2} size="large" placeholder="40000" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item name="description" label="Description" rules={[{ required: true, min: 10 }]}>
                <TextArea rows={4} placeholder="Description..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="modeEmploi" label="Mode d'emploi">
                <TextArea rows={3} placeholder="Instructions..." />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            {/* 🔥 PHOTO - SUPPRIMER ✅ AJOUTER ✅ */}
            <Col span={8}>
              <Form.Item 
                name="photoFile" 
                label="Photo" 
                valuePropName="fileList" 
                getValueFromEvent={e => Array.isArray(e) ? e : e?.fileList || []}
              >
                <Upload 
                  name="photo"  // ✅ Backend attend 'photo'
                  listType="picture-card" 
                  accept="image/*" 
                  beforeUpload={() => false} 
                  maxCount={1}
                  onRemove={(file) => {
                    console.log('🗑️ IMAGE SUPPRIMÉE:', file.name);
                    message.success('✅ Image supprimée ! Ajoutez la nouvelle.');
                    return true;
                  }}
                  onChange={({ fileList }) => {
                    if (fileList.length > 0 && fileList[0].originFileObj) {
                      console.log('📸 NOUVELLE IMAGE SÉLECTIONNÉE:', fileList[0].originFileObj.name);
                      message.info('✅ Nouvelle image prête !');
                    }
                  }}
                >
                  <div className="flex flex-col items-center">
                    <UploadIcon className="w-8 h-8 mx-auto text-gray-400" />
                    <div className="text-xs mt-1 text-gray-600">Cliquer ou glisser</div>
                  </div>
                </Upload>
              </Form.Item>
            </Col>

            {/* VIDÉO */}
            <Col span={8}>
              <Form.Item name="videoDemoFile" label="Vidéo" valuePropName="fileList" getValueFromEvent={e => Array.isArray(e) ? e : e?.fileList || []}>
                <Upload listType="picture-card" accept="video/*" beforeUpload={() => false} maxCount={1}>
                  <div className="flex flex-col items-center">
                    <VideoIcon className="w-8 h-8 mx-auto text-gray-400" />
                    <div className="text-xs mt-1 text-gray-600">Vidéo (optionnel)</div>
                  </div>
                </Upload>
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item name="promoActive" label="Promo active" valuePropName="value">
                <Select>
                  <Option value={false}>Non</Option>
                  <Option value={true}>Oui</Option>
                </Select>
              </Form.Item>
              <Form.Item name="prixPromo" label="Prix promo">
                <InputNumber style={{ width: '100%' }} min={0} precision={2} />
              </Form.Item>
              <Form.Item name="consignePromo" label="Conditions promo">
                <TextArea rows={2} />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end space-x-3 pt-6">
            <Button onClick={() => setModalVisible(false)}>Annuler</Button>
            <Button type="primary" htmlType="submit" size="large">
              {selectedProduit ? 'Mettre à jour' : 'Créer'} Produit
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}
