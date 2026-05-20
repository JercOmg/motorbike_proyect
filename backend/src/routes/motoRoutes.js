const express = require('express');
const router = express.Router();
const motoController = require('../controllers/motoController');
const authMiddleware = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Moto:
 *       type: object
 *       required:
 *         - placa
 *         - marca
 *         - modelo
 *         - color
 *         - cilindraje
 *         - id_propietario
 *         - anio
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la moto
 *         placa:
 *           type: string
 *           description: Placa de la moto (única)
 *         marca:
 *           type: string
 *           description: Marca de la moto
 *         modelo:
 *           type: string
 *           description: Modelo de la moto
 *         color:
 *           type: string
 *           description: Color de la moto
 *         cilindraje:
 *           type: string
 *           description: Cilindraje de la moto
 *         id_propietario:
 *           type: integer
 *           description: ID del usuario propietario
 *         responsible_user:
 *           type: integer
 *           description: ID del usuario responsable
 *         anio:
 *           type: integer
 *           description: Año de la moto
 *         create_date:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *       example:
 *         id: 1
 *         placa: ABC123
 *         marca: Honda
 *         modelo: CBR 600
 *         color: Rojo
 *         cilindraje: 600cc
 *         id_propietario: 1
 *         responsible_user: 2
 *         anio: 2020
 *         create_date: "2024-01-01T00:00:00.000Z"
 */

/**
 * @swagger
 * /api/motos:
 *   get:
 *     summary: Obtiene todas las motos
 *     tags: [Motos]
 *     parameters:
 *       - in: query
 *         name: placa
 *         schema:
 *           type: string
 *         description: Filtrar por placa de la moto
 *       - in: query
 *         name: id_propietario
 *         schema:
 *           type: integer
 *         description: Filtrar por ID del propietario
 *     responses:
 *       200:
 *         description: Lista de motos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Moto'
 */
router.get('/', authMiddleware, (req, res) => motoController.getAll(req, res));

/**
 * @swagger
 * /api/motos/{id}:
 *   get:
 *     summary: Obtiene una moto por ID
 *     tags: [Motos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la moto
 *     responses:
 *       200:
 *         description: Moto encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Moto'
 *       404:
 *         description: Moto no encontrada
 */
router.get('/:id', authMiddleware, (req, res) => motoController.getById(req, res));

/**
 * @swagger
 * /api/motos:
 *   post:
 *     summary: Crea una nueva moto
 *     tags: [Motos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - placa
 *               - marca
 *               - modelo
 *               - color
 *               - cilindraje
 *               - id_propietario
 *               - anio
 *             properties:
 *               placa:
 *                 type: string
 *               marca:
 *                 type: string
 *               modelo:
 *                 type: string
 *               color:
 *                 type: string
 *               cilindraje:
 *                 type: string
 *               id_propietario:
 *                 type: integer
 *               anio:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Moto creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Moto'
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: Placa ya existe
 */
router.post('/', authMiddleware, requireRole(['admin', 'empleado']), (req, res) => motoController.create(req, res));

/**
 * @swagger
 * /api/motos/{id}:
 *   put:
 *     summary: Actualiza una moto
 *     tags: [Motos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la moto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_propietario
 *             properties:
 *               placa:
 *                 type: string
 *               marca:
 *                 type: string
 *               modelo:
 *                 type: string
 *               color:
 *                 type: string
 *               cilindraje:
 *                 type: string
 *               id_propietario:
 *                 type: integer
 *                 description: ID del propietario (obligatorio para la actualización)
 *               responsible_user:
 *                 type: integer
 *               anio:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Moto actualizada
 *       400:
 *         description: Datos inválidos o intento de modificar create_date
 *       404:
 *         description: Moto o cliente no encontrado
 *       409:
 *         description: Placa ya existe
 */
router.put('/:id', authMiddleware, requireRole(['admin', 'empleado']), (req, res) => motoController.update(req, res));

/**
 * @swagger
 * /api/motos/{id}:
 *   delete:
 *     summary: Elimina una moto (solo admin y empleado)
 *     tags: [Motos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la moto
 *     responses:
 *       200:
 *         description: Moto eliminada
 *       404:
 *         description: Moto no encontrada
 */
router.delete('/:id', authMiddleware, requireRole(['admin', 'empleado']), (req, res) => motoController.delete(req, res));

module.exports = router;
