import axios from 'axios';

// Construimos la URL base usando la variable de entorno (igual que en MovieService)
const BASE_URL = import.meta.env.VITE_BASE_URL + 'tecnico';

class TecnicoService {
  // ✅ Obtener todos los técnicos
  // GET: http://localhost:81/api/tecnico
  getTecnicos() {
    return axios.get(BASE_URL);
  }

  // ✅ Obtener un técnico por ID
  // GET: http://localhost:81/api/tecnico/1
  getTecnicoById(tecnicoId) {
    return axios.get(`${BASE_URL}/${tecnicoId}`);
  }

  // ✅ Crear un técnico (junto con su usuario dentro del mismo endpoint transaccional)
  // POST: http://localhost:81/api/tecnico
  createTecnico(tecnicoData) {
    return axios.post(BASE_URL, JSON.stringify(tecnicoData), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // ✅ Actualizar un técnico
  // PUT: http://localhost:81/api/tecnico
  updateTecnico(tecnicoData) {
    return axios.put(BASE_URL, JSON.stringify(tecnicoData), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export default new TecnicoService();
