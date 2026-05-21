# Motorbike API

Backend con Express + PostgreSQL + Sequelize, arquitectura por capas con migraciones y Swagger.

## Requisitos

- Node.js 22+
- Docker y Docker Compose
- PostgreSQL (si corre local sin Docker)

## Arquitectura

```
src/
├── config/              # DB config (Sequelize), swagger
├── controllers/         # Lógica de endpoints (thin)
├── repositories/        # Acceso a datos (ORM Sequelize)
├── models/              # Models Sequelize (User, Empleado, Cliente)
├── routes/              # Rutas + anotaciones Swagger
├── migrations-sequelize/ # Migraciones de base de datos (Sequelize)
├── middlewares/         # Auth, roles, error handling
└── app.js               # Setup de Express

Flujo: Routes → Controllers → Repositories → Models (Sequelize) → PostgreSQL
```

## Modelos

### User

| Campo     | Tipo      | Restricciones                       |
|-----------|-----------|-------------------------------------|
| id        | INTEGER   | PRIMARY KEY, AUTO INCREMENT         |
| nombre    | VARCHAR   | NOT NULL                            |
| correo    | VARCHAR   | NOT NULL, UNIQUE                    |
| cedula    | VARCHAR   | NOT NULL, UNIQUE                    |
| telefono  | VARCHAR   | NOT NULL                            |
| password  | VARCHAR   | NOT NULL                            |
| rol       | ENUM      | NOT NULL (admin, empleado, cliente) |
| is_active | BOOLEAN   | NOT NULL, DEFAULT true              |

### Empleado

| Campo   | Tipo    | Restricciones              |
|---------|---------|----------------------------|
| id      | INTEGER | PRIMARY KEY, AUTO INCREMENT|
| user_id | INTEGER | NOT NULL, UNIQUE, FK users |

### Cliente

| Campo   | Tipo    | Restricciones              |
|---------|---------|----------------------------|
| id      | INTEGER | PRIMARY KEY, AUTO INCREMENT|
| user_id | INTEGER | NOT NULL, UNIQUE, FK users |

### Moto

| Campo            | Tipo      | Restricciones                                  |
|------------------|-----------|------------------------------------------------|
| id               | INTEGER   | PRIMARY KEY, AUTO INCREMENT                    |
| placa            | VARCHAR   | NOT NULL, UNIQUE                               |
| marca            | VARCHAR   | NOT NULL                                       |
| modelo           | VARCHAR   | NOT NULL                                       |
| color            | VARCHAR   | NOT NULL                                       |
| cilindraje       | VARCHAR   | NOT NULL                                       |
| id_propietario   | INTEGER   | NOT NULL, FK users                             |
| responsible_user | INTEGER   | NOT NULL, FK users                             |
| anio             | INTEGER   | NOT NULL                                       |
| create_date      | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP            |

### Repuesto

| Campo            | Tipo      | Restricciones                                  |
|------------------|-----------|------------------------------------------------|
| id_repuesto      | INTEGER   | PRIMARY KEY, AUTO INCREMENT                    |
| referencia       | VARCHAR   | NOT NULL, UNIQUE                               |
| nombre           | VARCHAR   | NOT NULL                                       |
| stock            | INTEGER   | NOT NULL                                       |
| precio           | DOUBLE    | NOT NULL                                       |
| created_at       | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP            |
| updated_at       | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP            |
| responsible_user | INTEGER   | NOT NULL, FK users                             |

### Orden de Trabajo

| Campo               | Tipo      | Restricciones                                                                    |
|---------------------|-----------|----------------------------------------------------------------------------------|
| id_orden_trabajo    | INTEGER   | PRIMARY KEY, AUTO INCREMENT                                                      |
| id_moto             | INTEGER   | NOT NULL, FK motos                                                               |
| id_mecanico         | INTEGER   | NOT NULL, FK users (mecanico con rol empleado)                                   |
| fecha_ingreso       | TIMESTAMP | NOT NULL                                                                         |
| fecha_entrega       | TIMESTAMP | NULLABLE (se asigna automáticamente al cambiar a estado Entregado)              |
| diagnostico         | TEXT      | NOT NULL                                                                         |
| estado              | ENUM      | NOT NULL (Recepcion, Diagnostico, Cotizacion, Reparacion, Entregado)            |
| valor_mano_obra     | DOUBLE    | NOT NULL, no negativo                                                            |
| total               | DOUBLE    | NOT NULL, autocalculado (mano de obra + suma de subtotales de repuestos)         |
| id_responsible_user | INTEGER   | NOT NULL, FK users (usuario del token)                                           |

### Detalle de Orden

| Campo            | Tipo      | Restricciones                                 |
|------------------|-----------|-----------------------------------------------|
| id_detalle_orden | INTEGER   | PRIMARY KEY, AUTO INCREMENT                   |
| id_orden_trabajo | INTEGER   | NOT NULL, FK ordenes_trabajo (ON DELETE CASCADE)|
| id_repuesto      | INTEGER   | NOT NULL, FK repuestos                        |
| cantidad         | INTEGER   | NOT NULL, no negativo                         |
| subtotal         | DOUBLE    | NOT NULL, autocalculado (precio * cantidad)   |


## Endpoints

### Auth
| Método | Ruta              | Descripción         |
|--------|-------------------|---------------------|
| POST   | /api/auth/login   | Iniciar sesión      |

### Users
| Método | Ruta                           | Descripción                                                                | Permisos                    |
|--------|--------------------------------|----------------------------------------------------------------------------|-----------------------------|
| GET    | /api/users                     | Listar usuarios (paginado, `page`, `limit`, filtros `is_active`, `rol`). Incluye `cedula` y `telefono` | Cualquier usuario activo    |
| GET    | /api/users/:id                 | Obtener usuario por ID. Incluye `cedula` y `telefono`                      | Cualquier usuario activo    |
| POST   | /api/users                     | Crear usuario. Admin: puede crear `empleado` o `cliente`. Empleado: solo `cliente`. Requiere `cedula` y `telefono` | Admin y Empleado            |
| PUT    | /api/users/:id                 | Actualizar usuario (nombre, correo, cedula, telefono obligatorios)         | Admin                       |
| DELETE | /api/users/:id                 | Eliminar usuario. **Bloqueado si el usuario está asociado a motos, repuestos u órdenes de trabajo** | Admin                       |
| PATCH  | /api/users/:id/toggle-active   | Activar/desactivar usuario (no aplica a admins)                            | Admin                       |
| PATCH  | /api/users/change-password     | Cambiar contraseña propia                                                  | Cualquier usuario activo    |
| PATCH  | /api/users/:id/reset-password  | Resetear contraseña de un usuario (no aplica a admins)                     | Admin                       |

### Motos
| Método | Ruta                          | Descripción                                                           | Permisos               |
|--------|-------------------------------|-----------------------------------------------------------------------|------------------------|
| GET    | /api/motos                    | Listar motos (paginado con `page`, `limit` y filtros `placa`, `id_propietario`) | Cualquier usuario activo|
| GET    | /api/motos/:id                | Obtener moto por ID                                                   | Cualquier usuario activo|
| POST   | /api/motos                    | Crear moto (requiere anio, valida propietario existente)                   | Admin y Empleado       |
| PUT    | /api/motos/:id                | Actualizar moto (id_propietario obligatorio, anio opcional, no create_date)| Admin y Empleado       |
| DELETE | /api/motos/:id                | Eliminar moto. **Bloqueado si la moto tiene órdenes de trabajo asociadas** | Admin y Empleado       |

### Repuestos
| Método | Ruta                          | Descripción                                                           | Permisos               |
|--------|-------------------------------|-----------------------------------------------------------------------|------------------------|
| GET    | /api/repuestos                | Listar repuestos (paginado, filtros `referencia`, `nombre`. Retorna info básica) | Cualquier usuario activo|
| GET    | /api/repuestos/:id            | Obtener repuesto por ID (retorna info básica: id_repuesto, referencia, nombre, stock, precio) | Cualquier usuario activo|
| POST   | /api/repuestos                | Crear repuesto (todos los campos obligatorios, referencia única, >=0, auto user) | Admin y Empleado       |
| PUT    | /api/repuestos/:id            | Actualizar repuesto (todos los campos obligatorios, referencia única, >=0, auto user) | Admin y Empleado       |
| DELETE | /api/repuestos/:id            | Eliminar repuesto. **Bloqueado si el repuesto está ligado a alguna orden de trabajo** | Admin y Empleado       |

### Órdenes de Trabajo
| Método | Ruta                          | Descripción                                                                                                                                                                     | Permisos               |
|--------|-------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------|
| GET    | /api/ordenes                  | Listar órdenes (paginado con `page`/`limit`, filtros `id_moto`, `id_mecanico`, `estado`)                                                                                        | Cualquier usuario activo|
| GET    | /api/ordenes/:id              | Obtener orden individual por ID (incluye `placa_moto`, `nombre_mecanico`, y detalle de repuestos con `nombre_Respuesto`)                                                         | Cualquier usuario activo|
| GET    | /api/ordenes/:id/pdf          | Generar y descargar factura en PDF de la orden. Nombre del archivo: `[placa]_[fechaEntrega]_[id].pdf`. Incluye datos de la moto (marca, modelo, color, cilindraje), diagnóstico, tabla de repuestos y totales | Cualquier usuario activo|
| POST   | /api/ordenes                  | Crear orden. Valida mecánico con rol `empleado`, stock de repuestos, descuenta stock automáticamente. No permite `id_repuesto` duplicados en `detalleOrden`. Estado inicial: `Recepcion`. Transaccional | Admin y Empleado       |
| PUT    | /api/ordenes/:id              | Actualizar orden. **`id_moto` no se puede modificar.** Restaura stock anterior y valida/descuenta nuevo stock. No actualizable si está en estado `Entregado`. No permite `id_repuesto` duplicados en `detalleOrden` | Admin y Empleado       |
| DELETE | /api/ordenes/:id              | Eliminar orden (devuelve el stock de todos los repuestos asociados al inventario antes de eliminar)                                                                               | Solo Admin             |

Swagger docs: http://localhost:3000/api-docs

---

## Setup y comandos

### Opción 1: Todo con Docker (recomendado)

```bash
# Crear y levantar ambos contenedores (app + db)
docker-compose up --build

# Detener los contenedores
docker-compose down

# Detener y eliminar volúmenes (limpia DB)
docker-compose down -v
```

### Opción 2: Postgres con Docker, app local

```bash
# 1. Levantar solo la base de datos
docker-compose up -d db

# 2. Configurar variables de entorno locales
cp .env.example .env
# Editar .env con tus credenciales

# 3. Instalar dependencias
npm install

# 4. Ejecutar migraciones de Sequelize
npm run migrate

# 5. Iniciar app local
npm run dev
```

### Opción 3: Todo local (sin Docker)

```bash
# 1. Crear base de datos PostgreSQL
# psql -U postgres -c "CREATE DATABASE motorbike;"

# 2. Configurar .env con los datos de tu Postgres
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=motorbike
# DB_USER=tu_usuario
# DB_PASSWORD=tu_password
# NODE_ENV=development
# JWT_KEY=tu_jwt_secret

# 3. Instalar dependencias
npm install

# 4. Ejecutar migraciones de Sequelize
npm run migrate

# 5. Iniciar
npm run dev
```

---

## Scripts disponibles

```bash
npm run dev           # Iniciar en modo desarrollo (localhost:3000)
npm start             # Iniciar en producción

# Migraciones de Sequelize
npm run migrate       # Aplicar migraciones pendientes
npm run migrate:undo  # Revertir última migración
npm run migrate:create # Crear nueva migración (agregar --name nombre)
```

---

## Variables de entorno

| Variable    | Descripción                  | Default    |
|-------------|-------------------------------|------------|
| DB_HOST     | Host de PostgreSQL            | localhost  |
| DB_PORT     | Puerto de PostgreSQL          | 5432       |
| DB_NAME     | Nombre de la base de datos   | motorbike  |
| DB_USER     | Usuario de PostgreSQL         | postgres   |
| DB_PASSWORD | Contraseña de PostgreSQL      | postgres   |
| NODE_ENV    | Entorno de ejecución          | development|
| JWT_KEY     | Clave secreta para JWT        | -          |
| PORT        | Puerto de la app              | 3000       |

Para desarrollo local, copiar `.env.example` a `.env` y ajustar las credenciales.

---

## Notas

- **ORM**: Se usa Sequelize como ORM para acceso a datos. Los Models están en `src/models/`.
- **Migraciones**: Las migraciones se ejecutan con Sequelize CLI. En Docker, se ejecutan automáticamente antes de iniciar la app.
- **Validaciones de contraseña**: Las contraseñas requieren mínimo 8 caracteres, una mayúscula, un número y un carácter especial.
- **Usuarios admin**: Los usuarios con rol admin no pueden ser activados/desactivados ni tener su contraseña reseteada por otros admins.
- **Swagger UI**: Disponible en `/api-docs` una vez que la app está corriendo.
- **Protección de eliminación**: Los endpoints DELETE de `User`, `Moto` y `Repuesto` verifican activamente relaciones vigentes antes de proceder. Si existen registros dependientes (ej. motos de un usuario, órdenes de una moto, detalles de un repuesto), la eliminación es bloqueada con `HTTP 400`.
- **Generación de PDF**: El endpoint `GET /api/ordenes/:id/pdf` utiliza `pdfkit` para generar un documento A4 estilizado con paleta corporativa. El nombre del archivo descargado sigue el formato `[placa]_[fechaEntrega_o_Pendiente]_[id].pdf`.
- **Restricción en actualización de orden**: Al actualizar una orden (`PUT /api/ordenes/:id`), el campo `id_moto` **no debe enviarse** ni se procesa. La moto queda permanentemente ligada a la orden desde su creación.
- **Sin duplicados en detalles**: En los endpoints de creación y actualización de órdenes, el array `detalleOrden` no puede contener el mismo `id_repuesto` más de una vez. En caso de duplicados, se retorna `HTTP 400`.
- **Generación de total automática**: El campo `total` de la orden se calcula automáticamente como `valor_mano_obra + Σ(cantidad × precio_repuesto)`. El campo `subtotal` de cada detalle también se calcula automáticamente.