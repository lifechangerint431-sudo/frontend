import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
});

export const produitsApi = {
  // Liste paginée
  getAll: (params = {}) => 
    axios.get(`${API_URL}/super-admin/produits`, { 
      headers: getHeaders(), 
      params 
    }),

  // Détail
  getById: (id) => 
    axios.get(`${API_URL}/super-admin/produits/${id}`, { 
      headers: getHeaders() 
    }),

  // Créer - Support photo + vidéo
  create: (data, photoFile = null, videoFile = null) => {
    const formData = new FormData();
    
    // Ajoute tous les champs texte
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    
    // Ajoute photo si fournie
    if (photoFile) {
      console.log('📤 CRÉATION - Photo:', photoFile.name);
      formData.append('photo', photoFile);
    }
    
    // Ajoute vidéo si fournie
    if (videoFile) {
      console.log('📤 CRÉATION - Vidéo:', videoFile.name);
      formData.append('videoDemoFile', videoFile);
    }

    return axios.post(`${API_URL}/super-admin/produits`, formData, {
      headers: {
        ...getHeaders(),
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Update - Support photo + vidéo + SUPPRESSION ANCIENNE
  update: async (id, data, photoFile = null, videoFile = null) => {
    const formData = new FormData();
    
    // TOUS les champs texte
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    
    // 🔥 NOUVELLE PHOTO UNIQUEMENT
    if (photoFile) {
      console.log('📤 UPDATE - NOUVELLE PHOTO:', photoFile.name);
      formData.append('photo', photoFile);
    }
    
    // NOUVELLE VIDÉO
    if (videoFile) {
      console.log('📤 UPDATE - NOUVELLE VIDÉO:', videoFile.name);
      formData.append('videoDemoFile', videoFile);
    }
    
    return axios.put(`${API_URL}/super-admin/produits/${id}`, formData, {
      headers: {
        ...getHeaders(),
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Supprimer
  delete: (id) => 
    axios.delete(`${API_URL}/super-admin/produits/${id}`, { 
      headers: getHeaders() 
    }),

  // Toggle statut
  toggleStatus: (id) => 
    axios.patch(`${API_URL}/super-admin/produits/${id}/toggle`, {}, { 
      headers: getHeaders() 
    })
};

export default produitsApi;
