import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
});

export const santeApi = {
  getAll: (params = {}) => 
    axios.get(`${API_URL}/super-admin/sante`, { 
      headers: getHeaders(), 
      params 
    }),

  getById: (id) => 
    axios.get(`${API_URL}/super-admin/sante/${id}`, { 
      headers: getHeaders() 
    }),

  create: (data, videoFile = null) => {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    
    if (videoFile) {
      console.log('📤 CRÉATION - Vidéo:', videoFile.name);
      formData.append('videoDemoFile', videoFile);
    }

    return axios.post(`${API_URL}/super-admin/sante`, formData, {
      headers: {
        ...getHeaders(),
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  update: (id, data, videoFile = null) => {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    
    if (videoFile) {
      console.log('📤 UPDATE - NOUVELLE VIDÉO:', videoFile.name);
      formData.append('videoDemoFile', videoFile);
    }
    
    return axios.put(`${API_URL}/super-admin/sante/${id}`, formData, {
      headers: {
        ...getHeaders(),
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  delete: (id) => 
    axios.delete(`${API_URL}/super-admin/sante/${id}`, { 
      headers: getHeaders() 
    }),

  toggleStatus: (id) => 
    axios.patch(`${API_URL}/super-admin/sante/${id}/toggle`, {}, { 
      headers: getHeaders() 
    })
};

export default santeApi;
