import axios from 'axios';
import { getApiOrigin } from '../utils/apiBase';

// Base consistente con el resto de la app: http://localhost:81/apiticket/tecnico
const API = getApiOrigin();
const BASE_URL = `${API}/apiticket/tecnico`;

class TecnicoService {
  // ✅ Obtener todos los técnicos
  // GET: http://localhost:81/apiticket/tecnico
  getTecnicos() {
    return axios.get(BASE_URL);
  }

  // ✅ Obtener un técnico por ID
  // GET: http://localhost:81/apiticket/tecnico/1
  getTecnicoById(tecnicoId) {
    return axios.get(`${BASE_URL}/${tecnicoId}`);
  }

  // ✅ Crear un técnico (junto con su usuario dentro del mismo endpoint transaccional)
  // POST: http://localhost:81/apiticket/tecnico
  createTecnico(tecnicoData) {
    return axios.post(BASE_URL, tecnicoData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // ✅ Actualizar un técnico
  // PUT: http://localhost:81/apiticket/tecnico
  updateTecnico(tecnicoData) {
    return axios.put(BASE_URL, tecnicoData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // ✅ Toggle disponibilidad de un técnico
  // POST: http://localhost:81/apiticket/tecnico/toggleDisponibilidad/{id}
  toggleDisponibilidad(tecnicoId) {
    return axios.post(`${BASE_URL}/toggleDisponibilidad/${tecnicoId}`);
  }
}

export default new TecnicoService();
