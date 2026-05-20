const errorHandler = (err, req, res, next) => {
  if (err.code === '23505') {
    const constraint = err.constraint;
    
    if (constraint === 'users_correo_key') {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }
    
    return res.status(409).json({ error: 'Valor duplicado en la base de datos' });
  }

  if (err.code === '23503') {
    return res.status(400).json({ error: 'Violación de llave foránea' });
  }

  if (err.code === '23502') {
    return res.status(400).json({ error: 'Campo obligatorio faltante' });
  }

  console.error('Error no manejado:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
};

module.exports = errorHandler;
