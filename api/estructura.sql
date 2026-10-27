-- Estructura basada exclusivamente en los formularios del Sistema Biblioteca.
CREATE DATABASE IF NOT EXISTS sistema_biblioteca CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sistema_biblioteca;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS devoluciones;
DROP TABLE IF EXISTS solicitudes_prestamo;
DROP TABLE IF EXISTS prestamos;
DROP TABLE IF EXISTS libros;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS detalle_prestamo;
DROP TABLE IF EXISTS ejemplares;
DROP TABLE IF EXISTS autores;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS estudiantes;
DROP TABLE IF EXISTS docentes;
DROP TABLE IF EXISTS programas;
DROP TABLE IF EXISTS roles;
SET FOREIGN_KEY_CHECKS = 1;

-- Personas registradas desde el formulario de usuarios.
CREATE TABLE usuarios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tipo ENUM('Estudiante','Docente','Administrativo') NOT NULL,
  nombres VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  dni VARCHAR(15) NOT NULL UNIQUE,
  codigo VARCHAR(30) NOT NULL UNIQUE,
  correo VARCHAR(150) NULL,
  telefono VARCHAR(30) NULL,
  nacimiento DATE NULL,
  genero VARCHAR(30) NULL,
  programa VARCHAR(150) NULL,
  ciclo VARCHAR(20) NULL,
  direccion VARCHAR(255) NULL,
  foto MEDIUMTEXT NULL,
  estado ENUM('Activo','Inactivo') NOT NULL DEFAULT 'Activo',
  fecha_registro DATE NOT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Catálogo bibliográfico registrado desde el formulario de libros.
CREATE TABLE libros (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(30) NOT NULL UNIQUE,
  titulo VARCHAR(150) NOT NULL,
  autor VARCHAR(150) NOT NULL,
  anio SMALLINT UNSIGNED NOT NULL,
  editorial VARCHAR(100) NULL,
  edicion VARCHAR(50) NULL,
  isbn VARCHAR(20) NULL UNIQUE,
  categoria VARCHAR(150) NOT NULL,
  ejemplares SMALLINT UNSIGNED NOT NULL,
  disponibles SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  disponibilidad VARCHAR(50) NULL,
  ubicacion VARCHAR(100) NOT NULL,
  adquisicion VARCHAR(50) NOT NULL,
  procedencia VARCHAR(150) NULL,
  modalidad VARCHAR(50) NOT NULL,
  estado VARCHAR(50) NOT NULL,
  resumen TEXT NULL,
  portada MEDIUMTEXT NULL,
  fecha_registro DATE NOT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Incluye préstamos de usuarios registrados y préstamos a visitantes o administrativos.
CREATE TABLE prestamos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NULL,
  libro_id INT UNSIGNED NULL,
  codigo VARCHAR(40) NOT NULL UNIQUE,
  origen ENUM('normal','externo') NOT NULL DEFAULT 'normal',
  tipo_usuario VARCHAR(40) NULL,
  usuario VARCHAR(200) NULL,
  documento VARCHAR(20) NULL,
  nombres VARCHAR(100) NULL,
  apellidos VARCHAR(100) NULL,
  telefono VARCHAR(30) NULL,
  area VARCHAR(100) NULL,
  direccion VARCHAR(255) NULL,
  codigo_libro VARCHAR(30) NULL,
  titulo_libro VARCHAR(150) NOT NULL,
  ejemplar VARCHAR(50) NULL,
  fecha_prestamo DATE NOT NULL,
  fecha_devolucion DATE NOT NULL,
  modalidad VARCHAR(60) NULL,
  observaciones TEXT NULL,
  estado ENUM('Activo','Devuelto','Vencido') NOT NULL DEFAULT 'Activo',
  fecha_devolucion_real DATE NULL,
  estado_fisico VARCHAR(50) NULL,
  cumplimiento VARCHAR(50) NULL,
  observaciones_devolucion TEXT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_prestamo_estado (estado),
  INDEX idx_prestamo_vencimiento (fecha_devolucion),
  CONSTRAINT fk_prestamo_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  CONSTRAINT fk_prestamo_libro FOREIGN KEY (libro_id) REFERENCES libros(id),
  CONSTRAINT chk_prestamo_fechas CHECK (fecha_devolucion >= fecha_prestamo)
) ENGINE=InnoDB;

-- Solicitudes enviadas por estudiantes o docentes desde el catálogo.
CREATE TABLE solicitudes_prestamo (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NULL,
  libro_id INT UNSIGNED NULL,
  codigo_solicitud VARCHAR(80) NOT NULL UNIQUE,
  codigo_libro VARCHAR(30) NOT NULL,
  libro VARCHAR(150) NOT NULL,
  tipo VARCHAR(30) NOT NULL,
  usuario VARCHAR(150) NOT NULL,
  fecha_solicitud DATE NOT NULL,
  fecha_recojo DATE NOT NULL,
  dias_prestamo TINYINT UNSIGNED NOT NULL,
  programa VARCHAR(150) NULL,
  semestre VARCHAR(30) NULL,
  motivo VARCHAR(150) NULL,
  observacion VARCHAR(250) NULL,
  estado ENUM('Pendiente','Aprobada','Rechazada','Atendida') NOT NULL DEFAULT 'Pendiente',
  fecha_aprobacion DATE NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  ,CONSTRAINT fk_solicitud_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
  ,CONSTRAINT fk_solicitud_libro FOREIGN KEY (libro_id) REFERENCES libros(id)
) ENGINE=InnoDB;

-- Historial de devoluciones; cada devolución siempre pertenece a un préstamo.
CREATE TABLE devoluciones (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  prestamo_id INT UNSIGNED NOT NULL,
  fecha_devolucion_real DATE NOT NULL,
  estado_fisico VARCHAR(50) NULL,
  cumplimiento VARCHAR(50) NULL,
  observaciones TEXT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_devolucion_prestamo FOREIGN KEY (prestamo_id) REFERENCES prestamos(id)
) ENGINE=InnoDB;
