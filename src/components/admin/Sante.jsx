import { useState, useEffect, useCallback } from 'react'
import { 
  Table, Button, Modal, Form, Input, Select, Upload, message, Tag, Space, Popconfirm,
  Pagination, Row, Col, Card, Typography, Spin, Empty, InputNumber 
} from 'antd'
import { Plus, Edit2, Trash2, Video, Upload as UploadIcon } from 'lucide-react'
import { santeApi } from '../../api/sante'
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

export const Sante = () => {
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [santes, setSantes] = useState([])
  const [produits, setProduits] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [selectedSante, setSelectedSante] = useState(null)

  // Charger produits pour select
  useEffect(() => {
    produitsApi.getAll({ limit: 100 }).then(res => {
      setProduits(res.data.santes || [])
    }).catch(console.error)
  }, [])

  const fetchSantes = useCallback(async (page = 1, pageSize = 10) => {
    setLoading(true)
    try {
      const response = await santeApi.getAll({ page, limit: pageSize })
      setSantes(response.data.santes || [])
      setPagination({
        current: response.data.pagination?.current || 1,
        pageSize,
        total: response.data.pagination?.total || 0
      })
    } catch (error) {
      console.error('Fetch sante error:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSantes()
  }, [fetchSantes])

  const openModal = (sante = null) => {
    setSelectedSante(sante)
    setModalVisible(true)
    
    setTimeout(() => {
      form.resetFields()
      if (sante) {
        form.setFieldsValue({
          categorie: sante.categorie,
          probleme: sante.probleme,
          packProduits: JSON.stringify(sante.packProduits, null, 2),
          consigneUtilisation: sante.consigneUtilisation,
          produitId: sante.produitId,
          videoDemoFile: sante.videoDemo ? [{
            uid: '-1',
            name: 'video.mp4',
            status: 'done',
            url: sante.videoDemo
          }] : []
        })
      }
    }, 100)
  }

  const handleSubmit = async (values) => {
    try {
      const videoFile = values.videoDemoFile?.[0]?.originFileObj
      const submitData = {
        categorie: values.categorie,
        probleme: values.probleme,
        packProduits: values.packProduits,
        consigneUtilisation: values.consigneUtilisation,
        produitId: values.produitId || null
      }

      if (selectedSante) {
        await santeApi.update(selectedSante.id, submitData, videoFile)
        message.success('✅ Pack santé mis à jour !')
      } else {
        await santeApi.create(submitData, videoFile)
        message.success('✅ Pack santé créé !')
      }

      setModalVisible(false)
      fetchSantes()
    } catch (error) {
      console.error('❌ ERREUR:', error)
      message.error(error.response?.data?.message || 'Erreur')
    }
  }

  const handleDelete = async (id) => {
    try {
      await santeApi.delete(id)
      message.success('Supprimé !')
      fetchSantes()
    } catch (error) {
      message.error('Erreur suppression')
    }
  }

  const columns = [
    { 
      title: 'Catégorie', 
      dataIndex: 'categorie', 
      width: 120,
      render: cat => <Tag color="purple">{CATEGORIE_LABELS[cat]}</Tag>
    },
    { 
      title: 'Problème', 
      dataIndex: 'probleme',
      render: text => <b className="text-gray-900 block truncate max-w-xs">{text}</b>
    },
    { 
      title: 'Pack Produits', 
      width: 200,
      render: (_, record) => (
        <div className="space-y-1">
          {record.packProduits?.slice(0, 3).map((p, i) => (
            <Tag key={i} color="green">{p.nom || `Produit ${i+1}`}</Tag>
          ))}
          {record.packProduits?.length > 3 && (
            <span className="text-xs text-gray-500">+{record.packProduits.length - 3}</span>
          )}
        </div>
      )
    },
    { 
      title: 'Produit Principal', 
      width: 150,
      render: (_, record) => record.monProduit ? (
        <div className="flex items-center gap-2">
          <img src={record.monProduit.photo} className="w-8 h-8 rounded object-cover" />
          <span className="font-medium">{record.monProduit.nom}</span>
        </div>
      ) : '-'
    },
    { 
      title: 'Vidéo', 
      width: 80,
      render: (_, record) => record.videoDemo ? (
        <Video className="w-5 h-5 text-blue-500" />
      ) : <span className="text-gray-400">—</span>
    },
    { 
      title: 'Statut', 
      width: 90,
      render: (_, r) => <Tag color={r.isActive ? 'green' : 'gray'}>{r.isActive ? 'Actif' : 'Inactif'}</Tag>
    },
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
          <Title level={2}>🏥 Packs Santé ({pagination.total})</Title>
          <Button type="primary" icon={<Plus />} onClick={() => openModal()} size="large">Nouveau Pack</Button>
        </div>
      </Card>

      <Card>
        <Spin spinning={loading}>
          {santes.length === 0 ? <Empty description="Aucun pack santé" /> : (
            <>
              <Table 
                columns={columns} 
                dataSource={santes} 
                rowKey="id" 
                pagination={false} 
                scroll={{ x: 1200 }}
              />
              {pagination.total > 10 && (
                <div className="pt-6 flex justify-center">
                  <Pagination 
                    current={pagination.current} 
                    total={pagination.total} 
                    pageSize={10} 
                    onChange={page => fetchSantes(page, 10)} 
                  />
                </div>
              )}
            </>
          )}
        </Spin>
      </Card>

      <Modal
        title={selectedSante ? `Modifier "${selectedSante.probleme?.slice(0, 30)}..."` : 'Nouveau pack santé'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={1000}
        destroyOnHidden={true}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="pt-4">
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item name="categorie" label="Catégorie" rules={[{ required: true }]}>
                <Select size="large" placeholder="Choisir">
                  {categories.map(cat => <Option key={cat} value={cat}>{CATEGORIE_LABELS[cat]}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="probleme" label="Problème santé" rules={[{ required: true, min: 10 }]}>
                <Input.TextArea rows={2} placeholder="Ex: Douleurs articulaires, fatigue chronique..." />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item name="produitId" label="Produit principal">
                <Select placeholder="Optionnel" allowClear showSearch>
                  {produits.map(p => (
                    <Option key={p.id} value={p.id}>{p.nom}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="packProduits" label="Pack produits (JSON)" rules={[{ required: true }]}>
                <TextArea 
                  rows={4} 
                  placeholder='[{"nom": "Produit 1", "quantite": 2}, {"nom": "Produit 2", "quantite": 1}]'
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={24}>
              <Form.Item name="consigneUtilisation" label="Consigne utilisation" rules={[{ required: true }]}>
                <TextArea rows={4} placeholder="Instructions détaillées..." />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="videoDemoFile" label="Vidéo démo" valuePropName="fileList" getValueFromEvent={e => Array.isArray(e) ? e : e?.fileList || []}>
                <Upload 
                  name="videoDemoFile"
                  listType="picture-card" 
                  accept="video/*" 
                  beforeUpload={() => false} 
                  maxCount={1}
                  onRemove={() => {
                    message.success('✅ Vidéo supprimée !')
                    return true
                  }}
                >
                  <div className="flex flex-col items-center">
                    <Video className="w-8 h-8 mx-auto text-gray-400" />
                    <div className="text-xs mt-1">Vidéo (optionnel)</div>
                  </div>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end space-x-3 pt-6">
            <Button onClick={() => setModalVisible(false)}>Annuler</Button>
            <Button type="primary" htmlType="submit" size="large">
              {selectedSante ? 'Mettre à jour' : 'Créer'} Pack
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}
