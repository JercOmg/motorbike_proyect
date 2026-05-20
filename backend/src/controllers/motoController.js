const motoRepository = require('../repositories/motoRepository');
const { User } = require('../models');
const { getPaginationParams, buildPaginatedResponse } = require('../utils/pagination');

class MotoController {
  async getAll(req, res) {
    const { placa, id_propietario } = req.query;
    const { limit, offset, page } = getPaginationParams(req.query);

    const { rows, count } = await motoRepository.findAll({
      placa,
      id_propietario,
      limit,
      offset
    });

    const paginatedResponse = buildPaginatedResponse(rows, count, page, limit);
    res.json(paginatedResponse);
  }

  async getById(req, res) {
    const moto = await motoRepository.findById(req.params.id);
    if (!moto) return res.status(404).json({ error: 'Moto no encontrada' });
    res.json(moto);
  }

  async create(req, res) {
    const { placa, marca, modelo, color, cilindraje, id_propietario, anio } = req.body;
    const responsible_user = req.user.id;

    if (!placa || !marca || !modelo || !color || !cilindraje || !id_propietario || anio === undefined || anio === null) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios: placa, marca, modelo, color, cilindraje, id_propietario, anio' });
    }

    if (typeof anio !== 'number' || !Number.isInteger(anio)) {
      return res.status(400).json({ error: 'El campo anio debe ser un número entero' });
    }

    if (anio <= 1900) {
      return res.status(400).json({ error: 'El campo anio debe ser posterior a 1900' });
    }

    // Validar existencia de propietario (usuario)
    const user = await User.findByPk(id_propietario);
    if (!user) {
      return res.status(404).json({ error: 'El propietario (usuario) especificado no existe' });
    }

    const existingMoto = await motoRepository.findByPlaca(placa);
    if (existingMoto) {
      return res.status(409).json({ error: 'La placa ya está registrada' });
    }

    const moto = await motoRepository.create({
      placa,
      marca,
      modelo,
      color,
      cilindraje,
      id_propietario,
      responsible_user,
      anio
    });

    res.status(201).json({ message: 'Moto creada exitosamente', moto });
  }

  async update(req, res) {
    const { id } = req.params;
    const { placa, marca, modelo, color, cilindraje, id_propietario, responsible_user, anio } = req.body;

    // No se puede modificar el create_date
    if (req.body.create_date !== undefined) {
      return res.status(400).json({ error: 'No se puede modificar la fecha de creación (create_date)' });
    }

    // Es obligatorio que el propietario esté en el actualizar
    if (id_propietario === undefined || id_propietario === null) {
      return res.status(400).json({ error: 'El id_propietario es obligatorio' });
    }

    // Validar que los campos de texto no sean cadenas vacías
    const stringFields = { placa, marca, modelo, color, cilindraje };
    for (const [campo, valor] of Object.entries(stringFields)) {
      if (valor !== undefined && (typeof valor !== 'string' || valor.trim() === '')) {
        return res.status(400).json({ error: `El campo ${campo} no puede estar vacío` });
      }
    }

    const moto = await motoRepository.findById(id);
    if (!moto) return res.status(404).json({ error: 'Moto no encontrada' });

    // Validar que el propietario exista
    const user = await User.findByPk(id_propietario);
    if (!user) {
      return res.status(404).json({ error: 'El propietario (usuario) especificado no existe' });
    }

    // Validar anio si se pasa
    if (anio !== undefined && (typeof anio !== 'number' || !Number.isInteger(anio))) {
      return res.status(400).json({ error: 'El campo anio debe ser un número entero' });
    }

    if (anio !== undefined && anio <= 1900) {
      return res.status(400).json({ error: 'El campo anio debe ser posterior a 1900' });
    }

    // Validar duplicidad de placa exceptuando el mismo
    if (placa) {
      const existingMoto = await motoRepository.findByPlaca(placa);
      if (existingMoto && existingMoto.id !== parseInt(id)) {
        return res.status(409).json({ error: 'La placa ya está registrada' });
      }
    }

    const updatedMoto = await motoRepository.update(id, {
      placa,
      marca,
      modelo,
      color,
      cilindraje,
      id_propietario,
      responsible_user,
      anio
    });

    res.json({ message: 'Moto actualizada exitosamente', moto: updatedMoto });
  }

  async delete(req, res) {
    const moto = await motoRepository.findById(req.params.id);
    if (!moto) return res.status(404).json({ error: 'Moto no encontrada' });
    await motoRepository.delete(req.params.id);
    res.json({ message: 'Moto eliminada exitosamente' });
  }
}

module.exports = new MotoController();
