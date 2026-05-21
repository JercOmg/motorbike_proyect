import { client } from './client';

export const usersService = {
  /**
   * Obtiene listado paginado de usuarios con filtros opcionales.
   * @param {object} params - { page, limit, rol, is_active }
   */
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.page)      query.append('page', params.page);
    if (params.limit)     query.append('limit', params.limit);
    if (params.rol)       query.append('rol', params.rol);
    if (params.is_active !== undefined) query.append('is_active', params.is_active);

    const qs = query.toString();
    return client.get(`/users${qs ? `?${qs}` : ''}`);
  },

  getById: (id) => client.get(`/users/${id}`),

  create: (body) => client.post('/users', body),

  update: (id, body) => client.put(`/users/${id}`, body),

  remove: (id) => client.delete(`/users/${id}`),

  toggleActive: (id) => client.patch(`/users/${id}/toggle-active`),

  changePassword: (body) => client.patch('/users/change-password', body),

  resetPassword: (id, body) => client.patch(`/users/${id}/reset-password`, body),
};
