import { client } from './client';

export const motosService = {
  /**
   * Obtiene listado paginado de motos con filtros opcionales.
   * @param {object} params - { page, limit, placa, id_propietario }
   */
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.page)           query.append('page', params.page);
    if (params.limit)          query.append('limit', params.limit);
    if (params.placa)          query.append('placa', params.placa);
    if (params.id_propietario) query.append('id_propietario', params.id_propietario);

    const qs = query.toString();
    return client.get(`/motos${qs ? `?${qs}` : ''}`);
  },

  getById: (id) => client.get(`/motos/${id}`),

  create: (body) => client.post('/motos', body),

  update: (id, body) => client.put(`/motos/${id}`, body),

  remove: (id) => client.delete(`/motos/${id}`),
};
