import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE + '/apiticket/imagen';

class ImageService {
  createImage(formData) {
    return axios.post(BASE_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
}

export default new ImageService();
