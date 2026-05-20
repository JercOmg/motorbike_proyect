const userRepository = require('../repositories/userRepository');
const { getPaginationParams, buildPaginatedResponse } = require('../utils/pagination');

const validatePassword = (password) => {
  if (password.length < 8) {
    return { valid: false, error: 'La contraseña debe tener al menos 8 caracteres' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'La contraseña debe tener al menos una mayúscula' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'La contraseña debe tener al menos un número' };
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, error: 'La contraseña debe tener al menos un carácter especial' };
  }
  return { valid: true };
};

class UserController {
  async getAll(req, res) {
    const { is_active, rol } = req.query;
    const isActive = is_active !== undefined ? is_active === 'true' : null;
    const { limit, offset, page } = getPaginationParams(req.query);

    const { rows, count } = await userRepository.findAll(isActive, rol, limit, offset);

    const paginatedResponse = buildPaginatedResponse(rows, count, page, limit);
    res.json(paginatedResponse);
  }

  async getById(req, res) {
    const user = await userRepository.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  }

  async create(req, res) {
    const { nombre, correo, password, rol } = req.body;

    if (!nombre || !correo || !password || !rol) {
      return res.status(400).json({ error: 'nombre, correo, password y rol son obligatorios' });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.error });
    }

    if (!['empleado', 'cliente'].includes(rol)) {
      return res.status(400).json({ error: 'Rol inválido. Solo se permite: empleado, cliente' });
    }

    const existing = await userRepository.findByEmail(correo);
    if (existing) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }

    const user = await userRepository.create({ nombre, correo, password, rol, is_active: true });

    res.status(201).json({ message: 'Usuario creado exitosamente' });
  }

  async update(req, res) {
    const { nombre, correo, password } = req.body;
    const { id } = req.params;

    if (!nombre || !correo) {
      return res.status(400).json({ error: 'nombre y correo son obligatorios' });
    }

    const existing = await userRepository.findByEmail(correo);
    if (existing && existing.id !== parseInt(id)) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }

    const user = await userRepository.findById(id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    await userRepository.update(id, { nombre, correo, password });
    res.json({ message: 'Usuario actualizado exitosamente' });
  }

  async delete(req, res) {
    const user = await userRepository.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    await userRepository.delete(req.params.id);
    res.json({ message: 'Usuario eliminado exitosamente' });
  }

  async toggleActive(req, res) {
    const { id } = req.params;

    const user = await userRepository.findById(id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (user.rol === 'admin') {
      return res.status(403).json({ error: 'No se puede activar/desactivar usuarios con rol admin' });
    }

    await userRepository.update(id, { nombre: user.nombre, correo: user.correo, is_active: !user.is_active });
    res.json({ message: `Usuario ${user.is_active ? 'desactivado' : 'activado'} exitosamente` });
  }

  async changePassword(req, res) {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'currentPassword y newPassword son obligatorios' });
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.error });
    }

    const user = await userRepository.findByEmailWithPassword(req.user.correo);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const isPasswordValid = await userRepository.comparePassword(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }

    const isSamePassword = await userRepository.comparePassword(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ error: 'La nueva contraseña no puede ser igual a la actual' });
    }

    await userRepository.update(userId, { nombre: user.nombre, correo: user.correo, password: newPassword });
    res.json({ message: 'Contraseña actualizada exitosamente' });
  }

  async adminResetPassword(req, res) {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ error: 'newPassword es obligatorio' });
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.error });
    }

    const user = await userRepository.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (user.rol === 'admin') {
      return res.status(403).json({ error: 'No se puede cambiar la contraseña de usuarios admin' });
    }

    await userRepository.update(id, { nombre: user.nombre, correo: user.correo, password: newPassword });
    res.json({ message: 'Contraseña reseteada exitosamente' });
  }
}

module.exports = new UserController();