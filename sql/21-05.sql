-- Creaci�n de la base de datos



-- Tabla: Tipo_Convocatoria
CREATE TABLE Tipo_Convocatoria (
    id_tipo INT PRIMARY KEY identity,
    nombre VARCHAR(50) NOT NULL, -- Ej: Bienes, Servicios, Consultor�a
    descripcion TEXT
);

-- Tabla: Convocatoria (actualizada para usar id_convenio)
CREATE TABLE Convocatoria (
    id_convocatoria INT PRIMARY KEY IDENTITY(1,1), -- Starting from 1, autoincrement by 1
    id_convenio VARCHAR(50) NOT NULL,
    id_tipo INT NOT NULL,
    codigo_seace VARCHAR(50) UNIQUE,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    presupuesto DECIMAL(15, 2) NOT NULL,
    fecha_publicacion DATE NOT NULL,
    fecha_limite_ofertas DATE NOT NULL,
    fecha_estimada_adjudicacion DATE,
    duracion_contrato INT, -- In days
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(), -- Corrected for creation date
    FOREIGN KEY (id_convenio) REFERENCES Convenios(id_convenio),
    FOREIGN KEY (id_tipo) REFERENCES Tipo_Convocatoria(id_tipo)
);

-- Tabla: Item_Convocatoria
CREATE TABLE Item_Convocatoria (
    id_item INT PRIMARY KEY identity,
    id_convocatoria INT NOT NULL,
    descripcion TEXT NOT NULL,
    tipo_material VARCHAR(100), -- Ej: Material de oficina, Equipo m�dico
    cantidad INT NOT NULL,
    unidad_medida VARCHAR(50), -- Ej: Unidades, Litros, Horas
    precio_referencial DECIMAL(15, 2),
    especificaciones_tecnicas TEXT,
    FOREIGN KEY (id_convocatoria) REFERENCES Convocatoria(id_convocatoria)
);

-- Tabla: Postor
CREATE TABLE Postor (
    id_postor INT PRIMARY KEY identity,
    ruc VARCHAR(11) NOT NULL UNIQUE,
    razon_social VARCHAR(255) NOT NULL,
    direccion TEXT,
    correo VARCHAR(100),
    telefono VARCHAR(20),
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
);

-- Tabla: Oferta
CREATE TABLE Oferta (
    id_oferta INT PRIMARY KEY identity,
    id_convocatoria INT NOT NULL,
    id_postor INT NOT NULL,
    monto_propuesto DECIMAL(15, 2) NOT NULL,
    fecha_presentacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    observaciones TEXT,
    FOREIGN KEY (id_convocatoria) REFERENCES Convocatoria(id_convocatoria),
    FOREIGN KEY (id_postor) REFERENCES Postor(id_postor)
);

-- Tabla: Adjudicacion
CREATE TABLE Adjudicacion (
    id_adjudicacion INT PRIMARY KEY identity,
    id_convocatoria INT NOT NULL,
    id_postor INT NOT NULL,
    id_oferta INT NOT NULL,
    monto_adjudicado DECIMAL(15, 2) NOT NULL,
    fecha_adjudicacion DATE NOT NULL,
    comentarios TEXT,
    FOREIGN KEY (id_convocatoria) REFERENCES Convocatoria(id_convocatoria),
    FOREIGN KEY (id_postor) REFERENCES Postor(id_postor),
    FOREIGN KEY (id_oferta) REFERENCES Oferta(id_oferta)
);

-- Tabla: Documento (actualizada para soportar m�ltiples formatos)
CREATE TABLE Documento (
    id_documento INT PRIMARY KEY identity,
    id_convocatoria INT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- Ej: Bases, Formato, T�rminos de Referencia
    formato VARCHAR(10) NOT NULL, -- Ej: pdf, xlsx, xls
    ruta_archivo VARCHAR(255) NOT NULL, -- Ruta en el servidor
    fecha_subida DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (id_convocatoria) REFERENCES Convocatoria(id_convocatoria),
    CONSTRAINT chk_formato CHECK (formato IN ('pdf', 'xlsx', 'xls'))
);

-- Tabla: Estado_Convocatoria
CREATE TABLE Estado_Convocatoria2 (
    id_estado INT PRIMARY KEY identity,
    id_convocatoria INT NOT NULL,
    estado VARCHAR(50) NOT NULL, -- Ej: Publicada, En evaluaci�n, Adjudicada
    fecha_cambio DATETIME2 NOT NULL DEFAULT GETDATE(),
    comentarios TEXT,
    FOREIGN KEY (id_convocatoria) REFERENCES Convocatoria(id_convocatoria)
);

-- �ndices para optimizar consultas
CREATE INDEX idx_convocatoria_convenio ON Convocatoria(id_convenio);
CREATE INDEX idx_convocatoria_fecha ON Convocatoria(fecha_publicacion);
CREATE INDEX idx_oferta_convocatoria ON Oferta(id_convocatoria);
CREATE INDEX idx_estado_convocatoria ON Estado_Convocatoria2(id_convocatoria);




-- Tabla: Documento (actualizada para validaciones)
CREATE TABLE Documento (
    id_documento INT PRIMARY KEY IDENTITY,
    id_convocatoria INT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- Ej: Bases, Formato, T�rminos de Referencia
    formato VARCHAR(10) NOT NULL, -- Ej: pdf, xlsx, xls
    ruta_archivo VARCHAR(255) NOT NULL, -- Ruta en el servidor
    version INT NOT NULL DEFAULT 1, -- Para rastrear versiones de bases
    fecha_subida DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (id_convocatoria) REFERENCES Convocatoria(id_convocatoria),
    CONSTRAINT chk_formato CHECK (formato IN ('pdf', 'xlsx', 'xls'))
);

-- Tabla: Validacion_Bases (nueva para gestionar validaciones)
CREATE TABLE Validacion_Bases (
    id_validacion INT PRIMARY KEY IDENTITY,
    id_documento INT NOT NULL,
    nivel_validacion VARCHAR(20) NOT NULL, -- Ej: Residente, Supervisor, Monitor, Representante
    estado VARCHAR(20) NOT NULL, -- Ej: Pendiente, Aprobado, Rechazado
    usuario_validador VARCHAR(100) NOT NULL, -- Nombre o ID del usuario que valida
    fecha_validacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    comentarios TEXT, -- Motivo del rechazo, si aplica
    FOREIGN KEY (id_documento) REFERENCES Documento(id_documento),
    CONSTRAINT chk_nivel CHECK (nivel_validacion IN ('Residente', 'Supervisor', 'Monitor', 'Representante')),
    CONSTRAINT chk_estado CHECK (estado IN ('Pendiente', 'Aprobado', 'Rechazado'))
);
-----




-- Inserciones en Convenio (requerida por Convocatoria)
INSERT INTO Convenio (codigo_convenio, nombre, descripcion, fecha_inicio, fecha_fin, created_at)
VALUES 
    ('CONV-2025-001', 'Convenio Equipamiento M�dico', 'Convenio para adquisici�n de equipos m�dicos en hospitales', '2025-01-01', '2025-12-31', CURRENT_TIMESTAMP),
    ('CONV-2025-002', 'Convenio Material Educativo', 'Convenio para suministro de materiales educativos', '2025-02-01', '2025-11-30', CURRENT_TIMESTAMP);

-- Inserciones en Tipo_Convocatoria
INSERT INTO Tipo_Convocatoria (nombre, descripcion)
VALUES 
    ('Bienes', 'Adquisici�n de bienes tangibles como equipos o materiales'),
   ( 'Servicios', 'Contrataci�n de servicios como mantenimiento o consultor�a');

-- Inserciones en Convocatoria
INSERT INTO Convocatoria (
    id_convenio, id_tipo, codigo_seace, titulo, descripcion, presupuesto, fecha_publicacion, fecha_limite_ofertas, fecha_estimada_adjudicacion, duracion_contrato
) VALUES 
    ('CONV001', 1, 'SEACE-2025-001', 'Adquisici�n de Equipos M�dicos', 'Compra de ventiladores y monitores para hospitales p�blicos.', 1500000.00, '2025-06-01', '2025-06-15', '2025-06-20', 90),
    ('CONV001', 1, 'SEACE-2025-002', 'Suministro de Materiales Educativos', 'Adquisici�n de cuadernos y l�pices para escuelas.', 500000.00, '2025-07-01', '2025-07-10', '2025-07-15', 60);

-- Inserciones en Item_Convocatoria
INSERT INTO Item_Convocatoria (
    id_convocatoria, descripcion, tipo_material, cantidad, unidad_medida, precio_referencial, especificaciones_tecnicas
) VALUES 
    (2, 'Ventiladores mec�nicos para UCI', 'Equipo m�dico', 50, 'Unidades', 25000.00, 'Ventiladores con ventilaci�n invasiva y no invasiva, certificaci�n ISO.'),
    (2, 'Monitores de signos vitales', 'Equipo m�dico', 30, 'Unidades', 15000.00, 'Monitores con pantalla LED, ECG, SpO2, presi�n arterial.'),
    (3, 'Cuadernos de 100 hojas', 'Material educativo', 10000, 'Unidades', 5.00, 'Cuadernos A4, tapa dura, rayados.'),
    (3, 'L�pices HB', 'Material educativo', 20000, 'Unidades', 0.50, 'L�pices de grafito HB con borrador.');

-- Inserciones en Postor
INSERT INTO Postor (ruc, razon_social, direccion, correo, telefono, created_at)
VALUES 
    ('20123456789', 'MedEquip SAC', 'Av. Salud 123, Lima', 'contacto@medequip.pe', '01-4567890', CURRENT_TIMESTAMP),
    ('20987654321', 'EduSupplies SRL', 'Jr. Escuela 456, Arequipa', 'ventas@edusupplies.pe', '054-123456', CURRENT_TIMESTAMP),
    ('20321456789', 'TechMed SA', 'Av. Progreso 789, Lima', 'info@techmed.pe', '01-9876543', CURRENT_TIMESTAMP);

-- Inserciones en Oferta
INSERT INTO Oferta (
    id_convocatoria, id_postor, monto_propuesto, fecha_presentacion, observaciones
) VALUES 
    (2, 1, 1450000.00, '2025-06-10 10:00:00', 'Incluye capacitaci�n para personal m�dico.'),
    (2, 3, 1480000.00, '2025-06-12 15:00:00', 'Garant�a extendida de 2 a�os.'),
    (3, 2, 490000.00, '2025-07-08 09:00:00', 'Entrega en 30 d�as.'),
    (3, 1, 495000.00, '2025-07-09 14:00:00', 'Incluye transporte a nivel nacional.');

-- Inserciones en Adjudicacion
INSERT INTO Adjudicacion (
    id_convocatoria, id_postor, id_oferta, monto_adjudicado, fecha_adjudicacion, comentarios
) VALUES 
    (2, 1, 1, 1450000.00, '2025-06-20', 'Adjudicado por mejor oferta econ�mica y t�cnica.'),
    (3, 2, 3, 490000.00, '2025-07-15', 'Cumple con plazos y especificaciones.');

-- Inserciones en Documento
INSERT INTO Documento (
    id_convocatoria, nombre, tipo, formato, ruta_archivo, version, fecha_subida
) VALUES 
    (3, 'Bases Equipos M�dicos', 'Bases', 'pdf', '/archivos/conv_001_bases.pdf', 1, '2025-05-25 08:00:00'),
    (3, 'Formato Oferta M�dica', 'Formato', 'xlsx', '/archivos/conv_001_formato.xlsx', 1, '2025-05-25 08:30:00'),
    (2, 'Bases Material Educativo', 'Bases', 'pdf', '/archivos/conv_002_bases.pdf', 1, '2025-06-20 09:00:00'),
    (2, 'Formato Oferta Educativa', 'Formato', 'xlsx', '/archivos/conv_002_formato.xlsx', 1, '2025-06-20 09:30:00');


	select * from Documento
-- Inserciones en Validacion_Bases
INSERT INTO Validacion_Bases (
    id_documento, nivel_validacion, estado, usuario_validador, fecha_validacion, comentarios
) VALUES 
    -- Validaciones para Documento 1 (Bases Convocatoria 1)
    (2, 'Residente', 'Aprobado', 'residente_001', '2025-05-25 08:00:00', 'Bases generadas correctamente.'),
    (2, 'Supervisor', 'Aprobado', 'supervisor_001', '2025-05-26 10:00:00', 'Especificaciones claras.'),
    (2, 'Monitor', 'Aprobado', 'monitor_001', '2025-05-27 12:00:00', 'Cumple normativa.'),
    (2, 'Representante', 'Aprobado', 'representante_001', '2025-05-28 15:00:00', 'Listo para publicaci�n.'),
    -- Validaciones para Documento 3 (Bases Convocatoria 2)
    (3, 'Residente', 'Aprobado', 'residente_002', '2025-06-20 09:00:00', 'Bases completas.'),
    (3, 'Supervisor', 'Aprobado', 'supervisor_002', '2025-06-21 11:00:00', 'Sin observaciones.'),
    (3, 'Monitor', 'Aprobado', 'monitor_002', '2025-06-22 14:00:00', 'Alineado con SEACE.'),
    (3, 'Representante', 'Aprobado', 'representante_002', '2025-06-23 16:00:00', 'Aprobado para publicaci�n.');

-- Inserciones en Estado_Convocatoria
INSERT INTO Estado_Convocatoria2 (
    id_convocatoria, estado, fecha_cambio, comentarios
) VALUES 
    (3, 'Publicada', '2025-06-01 09:00:00', 'Convocatoria publicada en SEACE.'),
    (3, 'En evaluaci�n', '2025-06-16 09:00:00', 'Evaluaci�n de ofertas en curso.'),
    (3, 'Adjudicada', '2025-06-20 15:00:00', 'Adjudicaci�n completada.'),
    (2, 'Publicada', '2025-07-01 09:00:00', 'Convocatoria publicada.'),
    (2, 'En evaluaci�n', '2025-07-11 09:00:00', 'Revisi�n de ofertas.'),
    (2, 'Adjudicada', '2025-07-15 15:00:00', 'Adjudicaci�n finalizada.');


	
	CREATE TABLE [PNVR].[dbo].[Auditoria_Cambios] (
    id_auditoria INT IDENTITY(1,1) PRIMARY KEY,
    tabla_afectada NVARCHAR(50),
    id_registro INT,
    campo_modificado NVARCHAR(100),
    valor_anterior NVARCHAR(MAX),
    valor_nuevo NVARCHAR(MAX),
    usuario NVARCHAR(100),
    fecha_cambio DATETIME DEFAULT GETDATE()
);


	CREATE TABLE [PNVR].[dbo].[Item_Convocatoria2] (
    id_item_convocatoria INT IDENTITY(1,1) PRIMARY KEY,
    descripcion NVARCHAR(50),
    id_tipo_item_convocatoria int,
	id_tipo_Unidad_Medida int,
    valor_anterior NVARCHAR(MAX),
    valor_nuevo NVARCHAR(MAX),
    usuario NVARCHAR(100),
    fecha_cambio DATETIME DEFAULT GETDATE(),

FOREIGN KEY (id_tipo_Unidad_Medida) REFERENCES Tipo_Unidad_Medida(id_tipo_Unidad_Medida),
FOREIGN KEY (id_tipo_item_convocatoria) REFERENCES Tipo_Item_convocatoria(id_tipo_item_convoctoria),
);

	CREATE TABLE [PNVR].[dbo].[Tipo_Item_convocatoria] (
    id_tipo_item_convocatoria INT IDENTITY(1,1) PRIMARY KEY,
    descripcion NVARCHAR(50),
	estado int
);

CREATE TABLE [PNVR].[dbo].[Tipo_Unidad_Medida] (
    id_tipo_Unidad_Medida INT IDENTITY(1,1) PRIMARY KEY,
    descripcion NVARCHAR(50),
);


alter table convocatoria 
add id_item_convocatoria int


alter table Item_Convocatoria2
ADD CONSTRAINT FKCONVOCTORIA_ITEM
 FOREIGN KEY (id_item_convocatoria) REFERENCES Item_Convocatoria2(id_item_convocatoria);



	  alter table convocatoria
	  add  vigencia BIT NOT NULL DEFAULT 1;
	   alter table convocatoria
	  add   pdf_file_path NVARCHAR(255);
	   alter table convocatoria
	  add  word_file_path NVARCHAR(255);
	 ALTER TABLE convocatoria
		ADD id_estado_convocatoria INT NULL;


	-----


	
-- Crear tabla Tipo_unidad_medida para almacenar unidades de medida usadas en obras y convocatorias
CREATE TABLE Tipo_unidad_medida (
    id_tipo_unidad_medida INT IDENTITY(1,1) NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    abreviatura VARCHAR(10) NOT NULL,
    descripcion VARCHAR(200) NULL,
    activo BIT NOT NULL DEFAULT 1,
    CONSTRAINT PK_Tipo_unidad_medida PRIMARY KEY (id_tipo_unidad_medida),
    CONSTRAINT UQ_Tipo_unidad_medida_nombre UNIQUE (nombre),
    CONSTRAINT UQ_Tipo_unidad_medida_abreviatura UNIQUE (abreviatura)
);



alter table Item_Convocatoria2
ADD CONSTRAINT FKCONVOCTORIA_UNIDAD_MEDIDA
 FOREIGN KEY (id_tipo_unidad_medida) REFERENCES Tipo_unidad_medida(id_tipo_unidad_medida);


	select * from Convenios
select * from Tipo_Intervencion
select *  from Tipo_Material
select * from Tipo_Fenomeno
select * from grupo
select * from Tipos_Meta
select * from Estado_conv
select * from Sub_Estado
select * from Vivienda


INSERT INTO Estado_Conv (descripcion) VALUES ('EN EJECUCION');
INSERT INTO Estado_Conv (descripcion) VALUES ('CONCLUIDO');
INSERT INTO Estado_Conv (descripcion) VALUES ('LIQUIDADO');



alter table personal
 add profesion NVARCHAR(500);

 alter table personal
 add estado NVARCHAR(500);

  alter table Tipo_Fenomeno
 add estado int;

  alter table Tipo_Intervencion
 add estado int;

 alter table Tipo_Material
 add estado int;

   alter table Tipo_Fenomeno
   alter column estado int



   INSERT INTO Tipo_unidad_medida (nombre, abreviatura, descripcion, activo)
VALUES 
    ('Metro', 'm', 'Unidad de longitud para medir distancias en obras', 1),
    ('Metro cuadrado', 'm�', 'Unidad de �rea para superficies en construcci�n', 1),
    ('Metro c�bico', 'm�', 'Unidad de volumen para materiales como concreto', 1),
    ('Kilogramo', 'kg', 'Unidad de masa para materiales como acero', 1),
    ('Unidad', 'u', 'Unidad para conteo de elementos individuales', 1);

	INSERT INTO tipo_item_convocatoria(descripcion,estado)
	values('Bienes',1),
	('Servicios',1);


	INSERT INTO Item_Convocatoria2 (descripcion,id_tipo_item_convocatoria, id_tipo_Unidad_Medida)
VALUES 
    ('Cemento Portland Tipo IP 42 kg', 1,5);        -- Metro c�bico para concreto



	
	alter table CONVOCATORIA
	ADD id_tipo_unidad_medida int;

	alter table CONVOCATORIA
	ADD id_tipo_item_convocatoria int;

		alter table tipo_convocatoria
	ADD estado int;

	alter table Validacion_Bases
	ADD estado_va int;


		alter table CONVOCATORIA
ADD CONSTRAINT FKtipo_item_convocatoriaaa
 FOREIGN KEY (id_tipo_item_convocatoria) REFERENCES tipo_item_convocatoria(id_tipo_item_convocatoria);

 	alter table CONVOCATORIA
ADD CONSTRAINT FKtipo_item_convocatoria
 FOREIGN KEY (id_tipo_item_convocatoria) REFERENCES tipo_item_convocatoria(id_tipo_item_convocatoria);


 update tipo_convocatoria
 set estado = 1  where id_convocatoria = 2

  update Convocatoria
 set id_item_convocatoria = 2  where id_convocatoria = 3


   update Convocatoria
 set id_tipo_unidad_medida = 5  where id_convocatoria = 3

   update Convocatoria
 set id_tipo_unidad_medida = 5  where id_convocatoria = 2


    update Convocatoria
 set id_tipo_item_convocatoria = 2  where id_convocatoria = 2

 
    update Convocatoria
 set id_tipo_item_convocatoria = 2  where id_convocatoria = 3



 CREATE TABLE item_convocatoria (
    id_item_convocatoria INT PRIMARY KEY IDENTITY,
    descripcion VARCHAR(255) NOT NULL,
    id_tipo_item_convocatoria INT,
    cantidad INT NOT NULL,
    id_unidad_medida INT NOT NULL,
    precio_referencial DECIMAL(10, 2) NOT NULL,
    especificaciones_tecnicas TEXT,
    id_convocatoria INT NOT NULL,
    FOREIGN KEY (id_tipo_item_convocatoria) REFERENCES tipo_item_convocatoria(id_tipo_item_convocatoria),
    FOREIGN KEY (id_unidad_medida) REFERENCES tipo_unidad_medida(id_tipo_unidad_medida),
    FOREIGN KEY (id_convocatoria) REFERENCES convocatoria(id_convocatoria)
);



INSERT INTO Item_Convocatoria (  descripcion, cantidad, id_unidad_medida, precio_referencial, especificaciones_tecnicas,id_convocatoria) VALUES 
    ( 'Ventiladores mec�nicos para UCI',  50, 5, 25000.00, 'Ventiladores con ventilaci�n invasiva y no invasiva, certificaci�n ISO.',2),
    ('Monitores de signos vitales',  30, 5, 15000.00, 'Monitores con pantalla LED, ECG, SpO2, presi�n arterial.',2),
    ( 'Cuadernos de 100 hojas',  10000, 5, 5.00, 'Cuadernos A4, tapa dura, rayados.',2),
    ('L�pices HB',  20000, 5, 0.50, 'L�pices de grafito HB con borrador.',2);


	ALTER TABLE Convocatoria
add id_estado int

ALTER TABLE Convocatoria
add fecha_fin_publicacion datetime;

ALTER TABLE Convocatoria
add fecha_apertura_sobre datetime;

ALTER TABLE Convocatoria
add fecha_inicio_oferetas datetime;
select * from Convocatoria

ALTER TABLE Convocatoria
add fecha_inicio_oferetas datetime;

ALTER TABLE Convocatoria
add Anexos varchar(200);

ALTER TABLE Convocatoria
add QR_PATH VARCHAR(500) NULL;


ALTER TABLE Convocatoria
add Id_documenacion int  NULL;

ALTER TABLE Documento
add Id_documenacion int  primary key;



ALTER TABLE CONVOCATORIA
add id_Convocatoria_documento int,
FOREIGN KEY (id_Convocatoria_documento) REFERENCES Convocatoria_documento(id_Convocatoria_documento);

update Convocatoria
set id_estado =  1

CREATE TABLE Convocatoria_documento (
	id_Convocatoria_documento int ,
    id_convocatoria INT,
    id_documento INT,
     FOREIGN KEY (id_convocatoria) REFERENCES convocatoria(id_convocatoria),
    FOREIGN KEY (id_documento) REFERENCES documento(id_documento)
);


INSERT INTO convocatoria_documento (id_convocatoria_documento,id_convocatoria, id_documento) VALUES (1,2, 4);
INSERT INTO convocatoria_documento (id_convocatoria_documento,id_convocatoria, id_documento) VALUES (1,3, 5);


update Convocatoria
set id_convocatoria_documento = 1



-----

-- Base de datos: RuralHousingProgram

-- Tabla para almacenar informaci�n general del proyecto
CREATE TABLE Convenio (
    ConvenioId INT PRIMARY KEY IDENTITY(1,1),
    NombreProyecto NVARCHAR(500) NOT NULL, -- Ej: "MEJORAMIENTO DE VIVIENDA RURAL..."
    Localidad NVARCHAR(255), -- Ej: PUCALOMA - UTCUMAYO - AGUAS DE NIEVE
    Distrito NVARCHAR(255), -- Ej: VITOC - MONOBAMBA
    Provincia NVARCHAR(255), -- Ej: CHANCHAMAYO
    Departamento NVARCHAR(255), -- Ej: JUNIN
    Entidad NVARCHAR(255), -- Ej: MINISTERIO DE VIVIENDA
    Programa NVARCHAR(255), -- Ej: PROGRAMA NACIONAL DE VIVIENDA RURAL
    Proyectista NVARCHAR(255), -- Ej: ING. KEMMER EMELY SANCHEZ ZARATE
    Evaluador NVARCHAR(255), -- Ej: ARQ. ELLUZMARY GLENDY LIMAYLLA GUTIERREZ
    PresupuestoBase DECIMAL(18,2), -- Ej: 2040201.77
    PresupuestoFinanciamiento DECIMAL(18,2), -- Ej: 1908106.14
    AporteBeneficiario DECIMAL(18,2), -- Ej: 132095.63
    SimboloMonetario NVARCHAR(10), -- Ej: S/.
    IGV DECIMAL(5,2), -- Impuesto General a las Ventas, ej: 0.18
    PlazoEjecucionMeses INT, -- Ej: 5
    PlazoEjecucionDias INT, -- Ej: 150
    NumeroBeneficiarios INT, -- Ej: 42 familias
    CreadoEn DATETIME DEFAULT GETDATE(),
    ActualizadoEn DATETIME DEFAULT GETDATE()
);

-- Tabla para almacenar beneficiarios
CREATE TABLE Beneficiarios (
    BeneficiarioID INT PRIMARY KEY IDENTITY(1,1),
    ConvenioId INT,
    NombreFamilia NVARCHAR(255), -- Nombre de la familia beneficiaria
    CreadoEn DATETIME DEFAULT GETDATE(),
    ActualizadoEn DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ConvenioId) REFERENCES Convenio(ConvenioId)
);

-- Tabla para categor�as de presupuesto (ej: Obras Provisionales, Movimiento de Tierras)
CREATE TABLE CategoriasPresupuesto (
    CategoriaID INT PRIMARY KEY IDENTITY(1,1),
    CodigoCategoria NVARCHAR(50), -- Ej: '1.0.0', '2.0.0'
    NombreCategoria NVARCHAR(255) NOT NULL, -- Ej: OBRAS PROVISIONALES
    CreadoEn DATETIME DEFAULT GETDATE(),
    ActualizadoEn DATETIME DEFAULT GETDATE()
);

-- Tabla para �tems de presupuesto
CREATE TABLE ItemsPresupuesto (
    ItemPresupuestoID INT PRIMARY KEY IDENTITY(1,1),
    ConvenioId INT,
    CategoriaID INT,
    CodigoItem NVARCHAR(50), -- Ej: '1.1.1', '4.3.1'
    Descripcion NVARCHAR(500), -- Ej: CARTEL DE OBRA 4.00 X 2.50
    Unidad NVARCHAR(50), -- Ej: m2, m3, kg, und
    Cantidad DECIMAL(18,4), -- Ej: 53.24
    PrecioUnitario DECIMAL(18,2), -- Calculado si necesario
    CostoTotal DECIMAL(18,2), -- Ej: 2236.25
    ReferenciaPlano NVARCHAR(50), -- Ej: A-01, E-01
    Eje NVARCHAR(50), -- Ej: EJE 1, EJE A
    Detalle NVARCHAR(255), -- Ej: Cartel de obra
    NumeroVeces INT, -- Ej: 1 (N� Veces)
    Largo DECIMAL(18,4), -- Ej: 7.83
    Ancho DECIMAL(18,4), -- Ej: 6.8
    Alto DECIMAL(18,4), -- Ej: 0.27
    Area DECIMAL(18,4), -- Ej: 53.244
    CantidadPorVivienda DECIMAL(18,4), -- Ej: 53.24
    NumeroViviendas INT, -- Ej: 42
    MetradoTotal DECIMAL(18,4), -- Ej: 2236.248
    CreadoEn DATETIME DEFAULT GETDATE(),
    ActualizadoEn DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ConvenioId) REFERENCES Convenio(ConvenioId),
    FOREIGN KEY (CategoriaID) REFERENCES CategoriasPresupuesto(CategoriaID)
);

-- Tabla para insumos (Relaci�n de Insumos Total)
CREATE TABLE Insumos (
    InsumoID INT PRIMARY KEY IDENTITY(1,1),
    ConvenioId INT,
    CodigoInsumo NVARCHAR(50), -- Ej: 204030001
    Descripcion NVARCHAR(255), -- Ej: ACERO CORRUGADO fy = 4200 kg/cm2 GRADO 60
    Unidad NVARCHAR(50), -- Ej: kg, und, m3
    Cantidad DECIMAL(18,4), -- Ej: 29297.5217
    PrecioUnitario DECIMAL(18,2), -- Ej: 4.60
    CostoTotal DECIMAL(18,2), -- Ej: 134768.60
    CreadoEn DATETIME DEFAULT GETDATE(),
    ActualizadoEn DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ConvenioId) REFERENCES Convenio(ConvenioId)
);

-- Tabla para mano de obra (del cronograma de gasto)
CREATE TABLE ManoObra (
    ManoObraID INT PRIMARY KEY IDENTITY(1,1),
    ConvenioId INT,
    Codigo NVARCHAR(50), -- Ej: 101010003
    Descripcion NVARCHAR(255), -- Ej: OPERARIO
    Unidad NVARCHAR(50), -- Ej: hh (horas hombre)
    Cantidad DECIMAL(18,4), -- Ej: 12217.6671
    PrecioUnitario DECIMAL(18,2), -- Ej: 18.75
    CostoTotal DECIMAL(18,2), -- Ej: 229081.26
    Mes1Cantidad DECIMAL(18,4),
    Mes1Parcial DECIMAL(18,2),
    Mes1Porcentaje DECIMAL(18,4),
    Mes2Cantidad DECIMAL(18,4),
    Mes2Parcial DECIMAL(18,2),
    Mes2Porcentaje DECIMAL(18,4),
    -- Repetir para Mes3, Mes4, Mes5, Mes5.5
    Mes3Cantidad DECIMAL(18,4),
    Mes3Parcial DECIMAL(18,2),
    Mes3Porcentaje DECIMAL(18,4),
    Mes4Cantidad DECIMAL(18,4),
    Mes4Parcial DECIMAL(18,2),
    Mes4Porcentaje DECIMAL(18,4),
    Mes5Cantidad DECIMAL(18,4),
    Mes5Parcial DECIMAL(18,2),
    Mes5Porcentaje DECIMAL(18,4),
    Mes5_5Cantidad DECIMAL(18,4),
    Mes5_5Parcial DECIMAL(18,2),
    Mes5_5Porcentaje DECIMAL(18,4),
    CreadoEn DATETIME DEFAULT GETDATE(),
    ActualizadoEn DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ConvenioId) REFERENCES Convenio(ConvenioId)
);

-- Tabla para equipos (herramientas)
CREATE TABLE Equipos (
    EquipoID INT PRIMARY KEY IDENTITY(1,1),
    ConvenioId INT,
    Codigo NVARCHAR(50), -- Ej: 301010006
    Descripcion NVARCHAR(255), -- Ej: HERRAMIENTAS MANUALES
    Unidad NVARCHAR(50), -- Ej: %mo, hm, d�a
    Cantidad DECIMAL(18,4), -- Ej: 1
    PrecioUnitario DECIMAL(18,2), -- Ej: 13695.45
    CostoTotal DECIMAL(18,2), -- Ej: 13695.45
    Observaciones NVARCHAR(500), -- Ej: NOTA: EL PERSONAL DE MANO DE OBRA CALIFICADA...
    CreadoEn DATETIME DEFAULT GETDATE(),
    ActualizadoEn DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ConvenioId) REFERENCES Convenio(ConvenioId)
);

-- Tabla para fletes
CREATE TABLE Fletes (
    FleteID INT PRIMARY KEY IDENTITY(1,1),
    ConvenioId INT,
    Codigo NVARCHAR(50), -- Ej: 203020002
    Descripcion NVARCHAR(255), -- Ej: FLETE TERRESTRE TRANSP. MATERIALES...
    Unidad NVARCHAR(50), -- Ej: glb
    Cantidad DECIMAL(18,4), -- Ej: 1
    PrecioUnitario DECIMAL(18,2), -- Ej: 80710.93
    CostoTotal DECIMAL(18,2), -- Ej: 80710.93
    CreadoEn DATETIME DEFAULT GETDATE(),
    ActualizadoEn DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ConvenioId) REFERENCES Convenio(ConvenioId)
);

-- Tabla para autorizaci�n de �tems de costo
CREATE TABLE Autorizaciones (
    AutorizacionID INT PRIMARY KEY IDENTITY(1,1),
    ItemPresupuestoID INT NULL, -- Puede ser nulo si la autorizaci�n es para otro tipo de �tem
    InsumoID INT NULL, -- Relaci�n con insumos, si aplica
    Estado NVARCHAR(50), -- Ej: Pendiente, Aprobado, Rechazado
    AutorizadorID INT, -- ID del usuario que autoriza
    Comentario NVARCHAR(500), -- Observaciones del autorizador
    FechaAutorizacion DATETIME,
    CreadoEn DATETIME DEFAULT GETDATE(),
    ActualizadoEn DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ItemPresupuestoID) REFERENCES ItemsPresupuesto(ItemPresupuestoID),
    FOREIGN KEY (InsumoID) REFERENCES Insumos(InsumoID)
);

-- Tabla para usuarios (para gestionar autorizaciones)
CREATE TABLE Usuarios (
    UsuarioID INT PRIMARY KEY IDENTITY(1,1),
    Nombre NVARCHAR(255),
    Rol NVARCHAR(50), -- Ej: Administrador, Autorizador, Proyectista
    Email NVARCHAR(255),
    Contrase�a NVARCHAR(255), -- Hasheada para seguridad
    CreadoEn DATETIME DEFAULT GETDATE(),
    ActualizadoEn DATETIME DEFAULT GETDATE()
);


-- Tabla para almacenar informaci�n del expediente t�cnico (archivos Excel, PDF, etc.)
CREATE TABLE ExpedienteTecnico (
    ExpedienteID INT PRIMARY KEY IDENTITY(1,1),
    ConvenioId INT, -- Relaci�n con la tabla Convenio
    NombreArchivo NVARCHAR(255) NOT NULL, -- Ej: "Presupuesto_Proyecto.xlsx", "Plano_A-01.pdf"
    TipoArchivo NVARCHAR(50), -- Ej: "Excel", "PDF", "Word"
    RutaArchivo NVARCHAR(500), -- Ruta o URL donde se almacena el archivo (ej: "C:\Archivos\Expedientes\Presupuesto_Proyecto.xlsx")
    Tama�oArchivo DECIMAL(18,2), -- Tama�o del archivo en KB o MB
    Descripcion NVARCHAR(500), -- Descripci�n del contenido del archivo
    FechaCarga DATETIME DEFAULT GETDATE(), -- Fecha en que se subi� el archivo
    CreadoEn DATETIME DEFAULT GETDATE(),
    ActualizadoEn DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ConvenioId) REFERENCES Convenio(ConvenioId)
);

ALTER TABLE Autorizaciones
ADD ExpedienteID INT NULL,
FOREIGN KEY (ExpedienteID) REFERENCES ExpedienteTecnico(ExpedienteID);

CREATE INDEX IX_ExpedienteTecnico_ConvenioId ON ExpedienteTecnico(ConvenioId);

ALTER TABLE ExpedienteTecnico
ADD Categoria NVARCHAR(255); -- Ej: "1. MEMORIA DESCRIPTIVA"




INSERT INTO ExpedienteTecnico (ConvenioId, NombreArchivo, TipoArchivo, RutaArchivo, Tama�oArchivo, Descripcion, Categoria, FechaCarga)
VALUES 
    -- 1. MEMORIA DESCRIPTIVA
    (1, 'Memoria_Descriptiva.pdf', 'PDF', '/Expedientes/1_MEMORIA_DESCRIPTIVA/Memoria_Descriptiva.pdf', 2048.30, 'Memoria descriptiva del proyecto', '1. MEMORIA DESCRIPTIVA', '2025-03-26'),
    -- 2. MEMORIA DE CALCULO
    (1, 'Calculo_Estructural.xlsx', 'Excel', '/Expedientes/2_MEMORIA_DE_CALCULO/Calculo_Estructural.xlsx', 1536.20, 'C�lculos estructurales', '2. MEMORIA DE CALCULO', '2025-03-26'),
    -- 3. METRADOS Y PRESUPUESTO
    (1, 'Presupuesto_Detallado.xlsx', 'Excel', '/Expedientes/3_METRADOS_Y_PRESUPUESTO/Presupuesto_Detallado.xlsx', 1024.50, 'Presupuesto y metrados', '3. METRADOS Y PRESUPUESTO', '2025-03-26'),
    (1, 'Metrados.pdf', 'PDF', '/Expedientes/3_METRADOS_Y_PRESUPUESTO/Metrados.pdf', 512.75, 'Metrados detallados', '3. METRADOS Y PRESUPUESTO', '2025-03-26'),
    -- 4. ACU
    (1, 'Analisis_Costos.pdf', 'PDF', '/Expedientes/4_ACU/Analisis_Costos.pdf', 768.10, 'An�lisis de costos unitarios', '4. ACU', '2025-03-26'),
    -- 5. CUADRO COMPARATIVO
    (1, 'Cuadro_Comparativo.xlsx', 'Excel', '/Expedientes/5_CUADRO_COMPARATIVO/Cuadro_Comparativo.xlsx', 896.40, 'Cuadro comparativo de costos', '5. CUADRO COMPARATIVO', '2025-03-26'),
    -- 6. CRONOGRAMA GANTT
    (1, 'Cronograma_Gantt.pdf', 'PDF', '/Expedientes/6_CRONOGRAMA_GANTT/Cronograma_Gantt.pdf', 640.25, 'Cronograma de ejecuci�n Gantt', '6. CRONOGRAMA GANTT', '2025-03-26'),
    -- 7. ESPECIFICACIONES TECNICAS
    (1, 'Especificaciones_Tecnicas.pdf', 'PDF', '/Expedientes/7_ESPECIFICACIONES_TECNICAS/Especificaciones_Tecnicas.pdf', 1280.60, 'Especificaciones t�cnicas del proyecto', '7. ESPECIFICACIONES TECNICAS', '2025-03-26'),
    -- 8. PLANOS
    (1, 'Plano_A-01.pdf', 'PDF', '/Expedientes/8_PLANOS/Plano_A-01.pdf', 512.75, 'Plano arquitect�nico principal', '8. PLANOS', '2025-03-26'),
    (1, 'Plano_E-01.pdf', 'PDF', '/Expedientes/8_PLANOS/Plano_E-01.pdf', 512.75, 'Plano estructural', '8. PLANOS', '2025-03-26'),
    -- 9. ESTUDIOS BASICOS
    (1, 'Estudio_Suelos.pdf', 'PDF', '/Expedientes/9_ESTUDIOS_BASICOS/Estudio_Suelos.pdf', 1792.80, 'Estudio de suelos', '9. ESTUDIOS BASICOS', '2025-03-26'),
    -- 10. ANEXOS
    (1, 'Anexo_1.pdf', 'PDF', '/Expedientes/10_ANEXOS/Anexo_1.pdf', 384.15, 'Documentos adicionales', '10. ANEXOS', '2025-03-26');



	USE [PNVR]
GO

INSERT INTO Convenio (NombreProyecto, Localidad, Distrito, Provincia, Departamento, Entidad, Programa, Proyectista, Evaluador, PresupuestoBase, PresupuestoFinanciamiento, AporteBeneficiario, SimboloMonetario, IGV, PlazoEjecucionMeses, PlazoEjecucionDias, NumeroBeneficiarios)
VALUES 
    ('CONSTRUCCION DE PUENTE PEATONAL', 'CASCAS - LA ESPERANZA', 'GRAN CHIM�', 'SANCHEZ CARRION', 'LA LIBERTAD', 'GOBIERNO REGIONAL LA LIBERTAD', 'PROGRAMA NACIONAL DE INFRAESTRUCTURA', 'ING. MARIA ISABEL RAMOS FLORES', 'ING. CARLOS ALBERTO P�REZ L�PEZ', 1500000.50, 1350000.45, 150000.05, 'S/.', 0.18, 4, 120, 30),
    ('MEJORAMIENTO DE CENTRO DE SALUD', 'HUANCAYO - EL TAMBO', 'HUANCAYO', 'HUANCAYO', 'JUNIN', 'MINISTERIO DE SALUD', 'PROGRAMA NACIONAL DE SALUD', 'ING. JUAN PABLO GONZALES TORRES', 'MED. ANA LUCIA RAMIREZ VARGAS', 3000000.75, 2700000.68, 300000.07, 'S/.', 0.18, 6, 180, 50),
    ('INSTALACION DE SISTEMA DE AGUA', 'CHIMBOTE - COISHCO', 'SANTA', 'SANTA', 'ANCASH', 'GOBIERNO REGIONAL ANCASH', 'PROGRAMA NACIONAL DE AGUA Y SANEAMIENTO', 'ING. LUISA FERNANDA CASTRO MEJIA', 'ING. PEDRO ANTONIO SALAS ORTEGA', 2500000.90, 2250000.81, 250000.09, 'S/.', 0.18, 5, 150, 45),
    ('REHABILITACION DE CARRETERA RURAL', 'ABANCAY - COTARUSE', 'ABANCAY', 'ABANCAY', 'APURIMAC', 'MINISTERIO DE TRANSPORTES', 'PROGRAMA NACIONAL DE INFRAESTRUCTURA', 'ING. RAFAEL EDUARDO QUISPE PUMA', 'ING. SOFIA DEL CARMEN HUAMAN� TORRES', 4000000.25, 3600000.23, 400000.02, 'S/.', 0.18, 7, 210, 60),
    ('CONSTRUCCION DE ESCUELA PRIMARIA', 'AREQUIPA - PAUCARPATA', 'AREQUIPA', 'AREQUIPA', 'AREQUIPA', 'MINISTERIO DE EDUCACION', 'PROGRAMA NACIONAL DE EDUCACION', 'ING. JORGE LUIS MAMANI CHAVEZ', 'ARQ. MARIA ELENA SALAZAR PIZARRO', 1800000.60, 1620000.54, 180000.06, 'S/.', 0.18, 4, 120, 35);
GO
3. METRADOS Y PRESUPUESTO

	truncate table ExpedienteTecnico
	delete  from ExpedienteTecnico


	SELECT CodigoInsumo AS Codigo, Descripcion, Unidad, Cantidad, PrecioUnitario, CostoTotal, 'Materials' AS Category
FROM Insumos WHERE ConvenioId = 1
UNION
SELECT Codigo, Descripcion, Unidad, Cantidad, PrecioUnitario, CostoTotal, 'Labor' AS Category
FROM ManoObra WHERE ConvenioId = 1
UNION
SELECT Codigo, Descripcion, Unidad, Cantidad, PrecioUnitario, CostoTotal, 'Equipment' AS Category
FROM Equipos WHERE ConvenioId = 1
UNION
SELECT Codigo, Descripcion, Unidad, Cantidad, PrecioUnitario, CostoTotal, 'Freight' AS Category
FROM Fletes WHERE ConvenioId = 1;



	-- Insert project into Convenio
INSERT INTO Convenio (
    NombreProyecto, Localidad, Distrito, Provincia, Departamento, Entidad, Programa, 
    Proyectista, Evaluador, PresupuestoBase, PresupuestoFinanciamiento, AporteBeneficiario, 
    SimboloMonetario, IGV, PlazoEjecucionMeses, PlazoEjecucionDias, NumeroBeneficiarios
) VALUES (
    'MEJORAMIENTO DE VIVIENDA RURAL EN EL CENTRO POBLADO AGUAS DE NIEVE',
    'PUCALOMA - UTCUMAYO - AGUAS DE NIEVE',
    'VITOC - MONOBAMBA',
    'CHANCHAMAYO',
    'JUNIN',
    'MINISTERIO DE VIVIENDA, CONSTRUCCION Y SANEAMIENTO',
    'PROGRAMA NACIONAL DE VIVIENDA RURAL',
    'ING. KEMMER EMELY SANCHEZ ZARATE',
    'ARQ. ELLUZMARY GLENDY LIMAYLLA GUTIERREZ',
    2040201.77,
    1908106.14,
    132095.63,
    'S/.',
    0.18,
    5,
    150,
    42
);

-- Insert cost categories into CategoriasPresupuesto
INSERT INTO CategoriasPresupuesto (CodigoCategoria, NombreCategoria) VALUES
('1.0.0', 'MATERIALES'),
('2.0.0', 'MANO DE OBRA'),
('3.0.0', 'EQUIPOS'),
('4.0.0', 'FLETES');

-- Insert sample budget items into ItemsPresupuesto (example for a few items)
INSERT INTO ItemsPresupuesto (
    ConvenioId, CategoriaID, CodigoItem, Descripcion, Unidad, Cantidad, PrecioUnitario, CostoTotal, 
    NumeroViviendas, MetradoTotal
) VALUES
(1, 1, '1.1.1', 'CARTEL DE OBRA 4.00 X 2.50', 'und', 1, 4200.00, 4200.00, 42, 1),
(1, 1, '1.2.1', 'ACERO CORRUGADO fy = 4200 kg/cm2 GRADO 60', 'kg', 29297.5217, 4.60, 134768.60, 42, 29297.5217);

-- Insert sample materials into Insumos
INSERT INTO Insumos (
    ConvenioId, CodigoInsumo, Descripcion, Unidad, Cantidad, PrecioUnitario, CostoTotal
) VALUES
(1, '204030001', 'ACERO CORRUGADO fy = 4200 kg/cm2 GRADO 60', 'kg', 29297.5217, 4.60, 134768.60),
(1, '201010001', 'CEMENTO PORTLAND TIPO I (42.5 kg)', 'bol', 2520.0000, 42.00, 105840.00);

-- Insert sample labor into ManoObra
INSERT INTO ManoObra (
    ConvenioId, Codigo, Descripcion, Unidad, Cantidad, PrecioUnitario, CostoTotal
) VALUES
(1, '101010003', 'OPERARIO', 'hh', 12217.6671, 18.75, 229081.26),
(1, '101010004', 'OFICIAL', 'hh', 1556.6667, 16.25, 25295.83);

-- Insert sample equipment into Equipos
INSERT INTO Equipos (
    ConvenioId, Codigo, Descripcion, Unidad, Cantidad, PrecioUnitario, CostoTotal
) VALUES
(1, '301010006', 'HERRAMIENTAS MANUALES', '%mo', 1, 13695.45, 13695.45),
(1, '301010007', 'MEZCLADORA DE CONCRETO', 'd�a', 210, 150.00, 31500.00);

-- Insert sample freight into Fletes
INSERT INTO Fletes (
    ConvenioId, Codigo, Descripcion, Unidad, Cantidad, PrecioUnitario, CostoTotal
) VALUES
(1, '203020002', 'FLETE TERRESTRE TRANSP. MATERIALES', 'glb', 1, 80710.93, 80710.93),
(1, '203020003', 'FLETE ACEMILA TRANSP. MATERIALES', 'glb', 1, 189251.11, 189251.11);

SELECT CodigoInsumo AS Codigo, Descripcion, Unidad, Cantidad, PrecioUnitario, CostoTotal, 'Materials' AS Category
FROM Insumos WHERE ConvenioId = 1
UNION
SELECT Codigo, Descripcion, Unidad, Cantidad, PrecioUnitario, CostoTotal, 'Labor' AS Category
FROM ManoObra WHERE ConvenioId = 1
UNION
SELECT Codigo, Descripcion, Unidad, Cantidad, PrecioUnitario, CostoTotal, 'Equipment' AS Category
FROM Equipos WHERE ConvenioId = 1
UNION
SELECT Codigo, Descripcion, Unidad, Cantidad, PrecioUnitario, CostoTotal, 'Freight' AS Category
FROM Fletes WHERE ConvenioId = 1;


SELECT RutaArchivo FROM [PNVR].[dbo].[ExpedienteTecnico]
WHERE ConvenioId = 1 AND Categoria = '3. METRADOS Y PRESUPUESTO' AND TipoArchivo = 'Excel';


UPDATE [PNVR].[dbo].[ExpedienteTecnico]
SET RutaArchivo = '/Expedientes/3__METRADOS_Y_PRESUPUESTO/NE_007.xlsx'
WHERE ConvenioId = 1 AND Categoria = '3. METRADOS Y PRESUPUESTO';

/Expedientes/3__METRADOS_Y_PRESUPUESTO/NE_007.xlsx
C:\PNVR\APP PNVR W\WebPNVR\public\Expedientes\3__METRADOS_Y_PRESUPUESTO
select * from ExpedienteTecnico


```sql
UPDATE [PNVR].[dbo].[ExpedienteTecnico]
SET RutaArchivo = '/Expedientes/3__METRADOS_Y_PRESUPUESTO/NE_007.xlsx'
WHERE ConvenioId = 1
  AND Categoria = '3. METRADOS Y PRESUPUESTO'
  AND TipoArchivo = 'Excel';
```


	select  * from ExpedienteTecnico
	select * from Convenio
	select * from Convenios
	select * from CategoriasPresupuesto
	select * from Insumos
	select * from ItemsPresupuesto
	select * from ManoObra
	select * from Equipos
	select * from Fletes


---

	INSERT INTO CategoriasPresupuesto (CodigoCategoria, NombreCategoria) VALUES
('01.', 'OBRAS PROVISIONALES, TRABAJOS PRELIMINARES, SEGURIDAD Y SALUD'),
('02.', 'MOVIMIENTO DE TIERRAS'),
('03.', 'OBRAS DE CONCRETO SIMPLE'),
('04.', 'OBRAS DE CONCRETO ARMADO'),
('05.', 'ESTRUCTURA METÁLICA'),
('06.', 'COBERTURA'),
('07.', 'CIELO RASOS'),
('08.', 'MUROS Y TABIQUES DE ALBAÑILERIA'),
('09.', 'REVOQUES ENLUCIDOS Y MOLDURAS'),
('10.', 'PISOS Y PAVIMENTOS'),
('11.', 'ZOCALOS Y CONTRAZOCALOS'),
('12.', 'PUERTAS Y VENTANAS'),
('13.', 'PINTURAS'),
('14.', 'INSTALACIONES SANITARIAS'),
('15.', 'INSTALACIONES ELECTRICAS'),
('16.', 'MITIGACION DE IMPACTO AMBIENTAL'),
('17.', 'FLETE Y TRANSPORTE'),
('18.', 'COSTO DIRECTO'),
('19.', 'COSTO INDIRECTO'),
('20.', 'COSTO TOTAL'),
('21.', 'APORTE'),
('22.', 'FINANCIA PNVR');



INSERT INTO SubcategoriasPresupuesto (CategoriaID,CodigoSubcategoria,NombreSubcategoria) VALUES
(1,'01.01.',    'TRABAJOS PRELIMINARES'),
(1,'01.02.',    'TRAZO NIVELES Y REPLANTEO PRELIMINAR'),
(1,'01.03.',    'SEGURIDAD Y SALUD'),

(1,'02.01.',    'EXCAVACIONES'),
(1,'03.01.',    'CIMIENTOS'),
(1,'01.01.',    'CONCRETO '),
(1,'01.01.',    'ENCOFRADO Y DESENCOFRADO'),
(1,'01.01.',    'ACERO CORRUGADO'),
(1,'01.01.',    'TIJERAL Y RETICULARES'),
(1,'01.01.',    'MUROS Y TABIQUES'),
(1,'01.01.',    'TARRAJEO VESTIDURAS Y DERRAMES'),
(1,'01.01.',    'PISOS'),
(1,'01.01.',    'VEREDAS'),
(1,'01.01.',    'ZOCALOS'),
(1,'01.01.',    'PUERTA'),
(1,'01.01.',    'VENTANAS'),
(1,'01.01.',    'PINTURA EN INTERIORES (CIELO RASO)'),
(1,'01.01.',    'PINTURA DE COLUMNAS'),
(1,'01.01.','PINTURA DE VIGAS Y DINTELES  INTERIOR Y EXTERIOR'),
(1,'01.01.','PINTURA ESMALTE EN ZOCALOS'),
(1,'01.01.','CANALETA DE PLANCHA GALVANIZADA SEGÚN DISEÑO e=0.30mm'),
(1,'01.01.','MONTANTE DE DRENAJE PLUVIAL PVC 3" '),
(1,'01.01.','DADO DE CONCRETO PARA PROTECCION DE TUBERIA PLUVIAL'),
(1,'01.01.','INSTALACIONES ELECTRICAS EN MODULO'),
(1,'01.01.','MITIGACION DEL IMPACTO AMBIENTAL (APORTE)'),
(1,'01.01.','LIMPIEZA FINAL DE OBRA (APORTE)'),
(1,'01.01.','   TRABAJOS PRELIMINARES'),

(1,'01.01.','FLETE Y TRANSPORTE DE MATERIALES'),
(1,'01.01.','FLETE Y TRANSPORTE DE AGREGADO Y PIEDRA'),

---


select * from CategoriasPresupuesto
	select * from SubcategoriasPresupuesto
	select * from ItemsPresupuesto


    	SELECT * FROM GeovisorV52025 WHERE YEAR(fecha_hora) = 2024 AND nro_conv = '1082-2104-2023-090-PUN/VMVU/PNVR' AND MONTH(fecha_hora)= 09

	SELECT * FROM GeovisorV52025  WHERE YEAR(fecha_hora) = 2024 AND nro_conv = '1082-0905-2023-037-HCA/VMVU/PNVR' AND DUPLICADO1 IS NOT NULL

	SELECT * FROM GeovisorV52025  WHERE url_foto= 'https://pnvr.vivienda.gob.pe/supervisores/get_img_app2019super44xid/{021D876F-391F-4A40-AF83-7B2952FB7C06}'
	SELECT * FROM GeovisorV52025  WHERE objectid= '591024'
	




INSERT INTO Tipo_Convocatoria (nombre, descripcion)
VALUES 
    ('Bienes', 'Adquisici?n de bienes tangibles como equipos o materiales'),
   ( 'Servicios', 'Contrataci?n de servicios como mantenimiento o consultor?a');

   INSERT INTO Convocatoria (
    id_convenio, id_tipo, codigo_seace, titulo, descripcion, presupuesto, fecha_publicacion, fecha_limite_ofertas, fecha_estimada_adjudicacion, duracion_contrato,vigencia
) VALUES 
    (1, 1, 'SEACE-2025-001', 'Adquisici?n de Equipos M?dicos', 'Compra de ventiladores y monitores para hospitales p?blicos.', 1500000.00, '2025-06-01', '2025-06-15', '2025-06-20', 90,1),
    (1, 1, 'SEACE-2025-002', 'Suministro de Materiales Educativos', 'Adquisici?n de cuadernos y l?pices para escuelas.', 500000.00, '2025-07-01', '2025-07-10', '2025-07-15', 60,1);



   INSERT INTO Tipo_unidad_medida (nombre, abreviatura, descripcion, activo)
VALUES 
    ('Metro', 'm', 'Unidad de longitud para medir distancias en obras', 1),
    ('Metro cuadrado', 'm2', 'Unidad de ?rea para superficies en construcci?n', 1),
    ('Metro cubico', 'm3', 'Unidad de volumen para materiales como concreto', 1),
    ('Kilogramo', 'kg', 'Unidad de masa para materiales como acero', 1),
    ('Unidad', 'u', 'Unidad para conteo de elementos individuales', 1);



		INSERT INTO Item_Convocatoria (
    id_convocatoria, descripcion, cantidad, id_unidad_medida, precio_referencial, especificaciones_tecnicas
) VALUES 
    (2, 'Ventiladores mecánicos para UCI',  50, 5, 25000.00, 'Ventiladores con ventilación invasiva y no invasiva, certificación ISO.'),
    (2, 'Monitores de signos vitales',  30, 5, 15000.00, 'Monitores con pantalla LED, ECG, SpO2, presi?n arterial.'),
    (3, 'Cuadernos de 100 hojas',  10000, 5, 5.00, 'Cuadernos A4, tapa dura, rayados.'),
    (3, 'Lápices HB',  20000, 5, 0.50, 'Lápices de grafito HB con borrador.');
	select  * from Convocatoria

	select * from Tipo_unidad_medida
	select * from Item_convocatoria

	select * from ExpedienteTecnico

	select * from CategoriasPresupuesto
	select * from SubcategoriasPresupuesto
	select * from ItemsPresupuesto
	
	CREATE TABLE CategoriasPresupuesto (
    CategoriaID INT PRIMARY KEY IDENTITY(1,1),
    CodigoCategoria NVARCHAR(50), -- Ej: '1.0.0', '2.0.0'
    NombreCategoria NVARCHAR(255) NOT NULL, -- Ej: OBRAS PROVISIONALES
    CreadoEn DATETIME DEFAULT GETDATE(),
    ActualizadoEn DATETIME DEFAULT GETDATE()
);
	CREATE TABLE SubcategoriasPresupuesto (
    SubCategoriaID INT PRIMARY KEY IDENTITY(1,1),
    CategoriaID INT, -- Ej: '1.0.0', '2.0.0'
	CodigoSubCategoria varchar(20),
    NombreSubCategoria NVARCHAR(255) NOT NULL, -- Ej: OBRAS PROVISIONALES
    CreadoEn DATETIME DEFAULT GETDATE(),
    ActualizadoEn DATETIME DEFAULT GETDATE()
	FOREIGN KEY (CategoriaID) REFERENCES CategoriasPresupuesto(CategoriaID)
);


CREATE TABLE ItemsPresupuesto (
    ItemPresupuestoID INT PRIMARY KEY IDENTITY(1,1),
    CategoriaID INT,
	SubCategoriaID INT,
    CodigoItem NVARCHAR(50), -- Ej: '1.1.1', '4.3.1'
    Descripcion NVARCHAR(500), -- Ej: CARTEL DE OBRA 4.00 X 2.50
    Unidad NVARCHAR(50), -- Ej: m2, m3, kg, und
    Cantidad DECIMAL(18,4), -- Ej: 53.24
    PrecioUnitario DECIMAL(18,2), -- Calculado si necesario
    CostoTotal DECIMAL(18,2), -- Ej: 2236.25
    ReferenciaPlano NVARCHAR(50), -- Ej: A-01, E-01
    Eje NVARCHAR(50), -- Ej: EJE 1, EJE A
    Detalle NVARCHAR(255), -- Ej: Cartel de obra
    NumeroVeces INT, -- Ej: 1 (N� Veces)
    Largo DECIMAL(18,4), -- Ej: 7.83
    Ancho DECIMAL(18,4), -- Ej: 6.8
    Alto DECIMAL(18,4), -- Ej: 0.27
    Area DECIMAL(18,4), -- Ej: 53.244
    CantidadPorVivienda DECIMAL(18,4), -- Ej: 53.24
    NumeroViviendas INT, -- Ej: 42
    MetradoTotal DECIMAL(18,4), -- Ej: 2236.248
    CreadoEn DATETIME DEFAULT GETDATE(),
    ActualizadoEn DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (SubCategoriaID) REFERENCES SubcategoriasPresupuesto(SubCategoriaID),
    FOREIGN KEY (CategoriaID) REFERENCES CategoriasPresupuesto(CategoriaID)
);




INSERT INTO SubcategoriasPresupuesto (CategoriaID,CodigoSubcategoria,NombreSubcategoria) VALUES
(1,'01.01.','   TRABAJOS PRELIMINARES'),
(1,'01.01.','   TRABAJOS PRELIMINARES'),
(1,'01.01.','   TRABAJOS PRELIMINARES'),
(1,'01.01.','   TRABAJOS PRELIMINARES'),
(1,'01.01.','   TRABAJOS PRELIMINARES'),
(1,'01.01.','   TRABAJOS PRELIMINARES'),
(1,'01.01.','   TRABAJOS PRELIMINARES'),
(1,'01.01.','   TRABAJOS PRELIMINARES'),
(1,'01.01.','   TRABAJOS PRELIMINARES'),
(1,'01.01.','   TRABAJOS PRELIMINARES'),
(1,'01.01.','   TRABAJOS PRELIMINARES'),
(1,'01.01.','   TRABAJOS PRELIMINARES'),
(1,'01.01.','   TRABAJOS PRELIMINARES'),
(1,'01.01.','   TRABAJOS PRELIMINARES'),
(1,'01.01.','   TRABAJOS PRELIMINARES'),
(1,'01.01.','   TRABAJOS PRELIMINARES'),
(1,'01.01.','   TRABAJOS PRELIMINARES'),
(1,'01.01.','   TRABAJOS PRELIMINARES'),
(1,'01.01.','   TRABAJOS PRELIMINARES'),
(1,'01.01.','   TRABAJOS PRELIMINARES'),
(1,'01.01.','   TRABAJOS PRELIMINARES'),
(1,'01.01.','   TRABAJOS PRELIMINARES'),
(1,'01.01.','   TRABAJOS PRELIMINARES'),
(1,'01.01.','   TRABAJOS PRELIMINARES'),
(1,'01.01.','   TRABAJOS PRELIMINARES'),
(1,'01.01.','   TRABAJOS PRELIMINARES'),
(1,'01.01.','   TRABAJOS PRELIMINARES'),
(1,'01.01.','   TRABAJOS PRELIMINARES'),

----
29/05

select * from convenios
select * from grupo




---


select * from Grupo
select * from Departamento
select * from Provincia
select * from Distrito
select * from Localidad
select * from Programa_Presupuestal
select * from Convenios
select * from Personal
select * from Cargo
select * from Personal_Cargo
INSERT INTO Grupo (nombre,estado)
VALUES 
    ('PMFH 2024',1),
    ('PMFH 2024 CONTINUIDAD',1),
    ('PMFH 2025',1),
    ('REGULAR 2024',1),
	('REGULAR 2024 CONTINUIDAD',1);
   

	DELETE FROM  GRUPO WHERE id_grupo IS NOT NULL

	alter table Programa_Presupuestal
	add descripcion varchar(200)

	update Programa_Presupuestal
	set descripcion = 'Reducción de la Vulnerabilidad y Atención de Emergencias por Desastres'


	alter table convenios
	add id_representante int

	---

	SELECT * FROM Convenio_Personal

	select * from personal
	select * from Cargo

	delete from Convenio_Personal

	CREATE TABLE Convenio_personal (
    id_convenio_personal INT identity PRIMARY KEY,
    id_convenio INT NOT NULL,
    id_personal INT NOT NULL,
    id_cargo INT NOT NULL,
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME DEFAULT NULL,
    FOREIGN KEY (id_convenio) REFERENCES convenios(id_convenio),
    FOREIGN KEY (id_personal) REFERENCES personal(id_personal),
    FOREIGN KEY (id_cargo) REFERENCES cargo(id_cargo)
);

INSERT INTO convenio_personal (id_convenio, id_personal, id_cargo, fecha_inicio)
VALUES (1, 7, 1, '2025-05-01 00:00:00');

INSERT INTO convenio_personal (id_convenio, id_personal, id_cargo, fecha_inicio)
VALUES (1, 107, 9, '2025-05-01 00:00:00');

UPDATE convenio_personal
SET fecha_fin = '2025-05-14 23:59:59'
WHERE id_convenio = 1 AND id_personal = 7 AND fecha_fin IS NULL;

INSERT INTO convenio_personal (id_convenio, id_personal, id_cargo, fecha_inicio)
VALUES (1, 14, 9, '2025-05-15 00:00:00');


SELECT p.nombre, p.apellido_paterno, c.descripcion
FROM convenio_personal cp
JOIN personal p ON cp.id_personal = p.id_personal
JOIN cargo c ON cp.id_cargo = c.id_cargo
WHERE cp.id_convenio = 1
AND '2025-05-29 16:48:00' BETWEEN cp.fecha_inicio AND COALESCE(cp.fecha_fin, '9999-12-31 23:59:59');


---
select * from Personal

select * from Convenio_personal


CREATE TABLE Hogar (
    id_hogar INT  IDENTITY PRIMARY KEY,
    codigo_hogar VARCHAR(20) UNIQUE NOT NULL,
    direccion VARCHAR(200) NOT NULL,
    ubigeo VARCHAR(6) NOT NULL,
    tipo_vivienda ENUM VARCHAR(6) NOT NULL,
    material_vivienda ENUM('Ladrillo', 'Adobe', 'Madera', 'Otro') NOT NULL,
    acceso_agua ENUM('Red pública', 'Pozo', 'Río', 'Otro') NOT NULL,
    acceso_electricidad BOOLEAN DEFAULT FALSE,
    numero_integrantes INT NOT NULL,
    clasificacion_socioeconomica ENUM('Pobre extremo', 'Pobre no extremo', 'No pobre') DEFAULT NULL,
    fecha_registro DATE NOT NULL
);}



select * from Vivienda
select * from Persona

CREATE TABLE Persona_Parentesco (
    id_persona_parentesco INT IDENTITY PRIMARY KEY,
    codigo_parentesco VARCHAR(8) NOT NULL UNIQUE,
    descripcion VARCHAR(50) NOT NULL UNIQUE,
    CONSTRAINT chk_codigo_parentesco CHECK (codigo_parentesco IN (
        '00230201',
        '00230202',
        '00230203',
        '00230204',
        '00230205',
        '00230206',
        '00230207',
        '00230208',
        '00230209',
        '00230210',
        '00230211',
        '00230200'
    ))
);

INSERT INTO Persona_Parentesco (codigo_parentesco, descripcion) VALUES
('00230201', 'JEFE'),
('00230202', 'CONYUGE'),
('00230203', 'HIJO/A'),
('00230204', 'YERNO/NUERA'),
('00230205', 'NIETO/A'),
('00230206', 'PADRES/SUEGROS'),
('00230207', 'HERMANO/A'),
('00230208', 'TRABAJADOR DE HOGAR'),
('00230209', 'PENSIONISTA'),
('00230210', 'OTROS PARIENTES'),
('00230211', 'OTROS NO PARIENTES'),
('00230200', 'SIN DATO');

INSERT INTO [dbo].[Vivienda]([cod]           ,[cuv]           ,[id_convenio]           ,[id_ubicacion]           ,[id_estado]
           ,[id_sub_estado]           ,[fecha_inicio]           ,[fecha_termino]           ,[costo_total]
		   ,[observaciones])
     VALUES
           (<cod, varchar(20),>
           ,<cuv, varchar(20),>
           ,<id_convenio, int,>
           ,<id_ubicacion, int,>
           ,<id_estado, int,>
           ,<id_sub_estado, int,>
           ,<fecha_inicio, date,>
           ,<fecha_termino, date,>
           ,<costo_total, decimal(15,2),>
           ,<observaciones, text,>)
GO



	alter table persona
	add id_Persona_Parentesco int;




	alter table vivienda
	add hogar_ubigeo int;




	drop table Persona_Parentesco;

ALTER TABLE Persona
ADD CONSTRAINT FK_Persona_parentesco
FOREIGN KEY (id_Persona_Parentesco) REFERENCES Persona_Parentesco(id_Persona_Parentesco);

--- table Ficha Evaluacion Social
--- table ficha evaluacion tecnica
--  especialista sociales
--  supervisores
--  Evaluadores

create table MAE_AREA (
Id_Area int identity primary key,
Descripcion varchar(20),
Estado int)

select * from Personal
select * from MAE_AREA
select 


alter table personal
add Id_Area int

alter table MAE_AREA
add Abreviatura varchar(10)

ALTER TABLE MAE_AREA
ALTER COLUMN Descripcion VARCHAR(50);

alter table Personal
ADD CONSTRAINT FK_Personal_Area
FOREIGN KEY (id_Area) REFERENCES MAE_AREA(id_Area);

insert into MAE_AREA(Abreviatura,Descripcion,Estado)
values ('UGS','UNIDAD DE GESTIÓN SOCIAL',1)


insert into MAE_AREA(Abreviatura,Descripcion,Estado)
values ('UGT','UNIDAD DE GESTION TÉCNICA',1)
insert into MAE_AREA(Abreviatura,Descripcion,Estado)
values ('UATS','UNIDAD DE ASISTENCIA TECNICA Y SOSTENIBILIDAD',1)
insert into MAE_AREA(Abreviatura,Descripcion,Estado)
values ('CT','COORDINACIÓN TÉCNICA',1)
insert into MAE_AREA(Abreviatura,Descripcion,Estado)
values ('DE','DIRECCIÓN EJECUTIVA',1)

insert into MAE_AREA(Abreviatura,Descripcion,Estado)
values ('AAL','AREA ASESORIA LEGAL',1)



TRUNCATE  MAE_AREA WHERE  ID_AREA IS NOT NULL

DELETE FROM MAE_AREA WHERE ID_AREA IS NOT NULL;


UPDATE PersonaL set ID_AREA = 9


	select * from Convenios
	select * from Vivienda
	select * from Persona
	select * from Persona_Parentesco
	select * from Departamento
	select * from Provincia
	select * from Distrito
	select * from Tipo_Discapacidad

	ALTER TABLE Vivienda
	add  id_Departamento int;

	ALTER TABLE Vivienda
	add  id_Provincia int;

	ALTER TABLE Vivienda
	add  id_Distrito int;

	ALTER TABLE Vivienda
	add  Ubigeo_Vivienda VARCHAR(50);

	ALTER TABLE Vivienda
	add  Ubigeo_Vivienda VARCHAR(50);

	ALTER TABLE Persona
	add  Vigencia_Hogar varchar(2);

	ALTER TABLE persona
	add  Lengua_Originaria varchar(50);

	ALTER TABLE persona
	add  Discapacidad Varchar(2);

	ALTER TABLE [dbo].[Persona]
	ADD [id_tipo_discapacidad] [int] NULL;
	--
	tipo discacidad

	CREATE TABLE [dbo].[Tipo_Discapacidad](
    [id_tipo_discapacidad] [int] IDENTITY(1,1) NOT NULL,
    [nombre_discapacidad] [varchar](50) NOT NULL,
    [descripcion] [varchar](200) NULL,
    [activo] [bit] NOT NULL DEFAULT (1),
    CONSTRAINT [PK_Tipo_Discapacidad] PRIMARY KEY CLUSTERED ([id_tipo_discapacidad] ASC)
);


INSERT INTO [dbo].[Tipo_Discapacidad] ([nombre_discapacidad], [descripcion], [activo])
VALUES 
    ('Visual', 'Discapacidad relacionada con la pérdida total o parcial de la visión.', 1),
    ('Auditiva', 'Discapacidad relacionada con la pérdida total o parcial de la audición.', 1),
    ('Motriz', 'Discapacidad que afecta la movilidad física.', 1),
    ('Intelectual', 'Discapacidad que afecta las capacidades cognitivas.', 1),
    ('Psicosocial', 'Discapacidad relacionada con trastornos mentales o emocionales.', 1);


	ALTER TABLE [dbo].[Persona]
ADD CONSTRAINT [FK_Persona_Tipo_Discapacidad] 
FOREIGN KEY ([id_tipo_discapacidad]) 
REFERENCES [dbo].[Tipo_Discapacidad] ([id_tipo_discapacidad]);

	--
	INSERT INTO [dbo].[Vivienda] (
    [cod], [cuv], [id_convenio], [id_estado], [id_sub_estado], 
    [fecha_inicio], [fecha_termino], [costo_total], [observaciones], 
    [Ubigeo_Vivienda], [id_Departamento], [id_Provincia], [id_Distrito]
)
VALUES (
    'VIV002',          -- cod
    'CUV453',       -- cuv
    5,                -- id_convenio
    2,                -- id_estado
    3,                -- id_sub_estado
    '2025-01-01',     -- fecha_inicio
    '2025-12-31',     -- fecha_termino
    150000.50,        -- costo_total
    'Vivienda en focalización', -- observaciones
    '150101',         -- Ubigeo_Vivienda
    1,               -- id_Departamento
    3,             -- id_Provincia
    2            -- id_Distrito
);

select * from db_accessadmin;


truncate table persona
SELECT * FROM PERSONA
ALTER TABLE [dbo].[Persona]
DROP CONSTRAINT CK__Persona__benefic__58D1301D;



--
INSERT INTO [dbo].[Persona] (
    [id_vivienda], [nombre], [apellido_paterno], [apellido_materno], [dni], [sexo], 
    [fecha_nacimiento], [id_Persona_Parentesco], [Vigencia_Hogar], [Discapacidad], 
    [Lengua_Originaria], [id_tipo_discapacidad]
)
VALUES 
    (1,    'Carlos', 'García',   'Martínez', '11223344', 'Masculino', '1995-03-10', 1,    'Sí', 'No', 'Aymara', NULL), -- 12 values
    (1, 'Ana',    'Sánchez',  'Ramírez',  '44332211', 'Femenino',  '2000-07-25', 2, 'Sí', 'Sí', 'Español',      2),    -- 12 values
    (1,    'Luis',   'Torres',   'Vega',     '99887766', 'Masculino', '1980-12-01', 3,    'Sí', 'No', 'Español', NULL); -- 12 values

	--
	INSERT INTO [dbo].[Persona] (
    [id_vivienda], [nombre], [apellido_paterno], [apellido_materno], [dni], [sexo], 
    [fecha_nacimiento], [id_Persona_Parentesco], [Vigencia_Hogar], [Discapacidad], 
    [Lengua_Originaria], [id_tipo_discapacidad]
)
VALUES 
 -- 12 values
    (2, 'Ana',    'Sánchez',  'Ramírez',  '44332211', 'Femenino',  '2000-07-25', 2, 'Sí', 'Sí', 'Español', 2);   




	select * from convenios
	select * from GRUPO
	SELECT * FROM Tipo_Fenomeno,
	SELECT * FROM LOCALIDAD
	---
	INSERT INTO [dbo].[Convenios] (
    [cod_ugt], [cod_Convenio], [nombre_Convenio], [id_grupo], [id_tipo_intervencion], 
    [id_programa_presupuestal], [id_tipo_fenomeno], [id_tipo_material], [id_estado], 
    [id_sub_estado], [id_priorizacion], [id_tipo_meta], [id_Localidad], [id_Distrito], 
    [id_Provincia], [id_Departamento], [fecha_Convenios], [fecha_transferencia], 
    [fecha_limite_inicio], [fecha_inicio], [plazo_ejecucion], [dias_paralizados], 
    [dias_ampliacion], [fecha_termino], [fecha_acta_termino], [motivo_atraso], 
    [accion_mitigacion], [fecha_inicio_estimada], [fecha_termino_estimada], 
    [anio_intervencion], [Entidad], [Programa],  
    [PresupuestoBase], [PresupuestoFinanciamiento], [AporteBeneficiario], 
    [SimboloMonetario], [IGV], [PlazoEjecucionMeses], [PlazoEjecucionDias], 
    [NumeroBeneficiarios], [CreadoEn], [ActualizadoEn]
)
VALUES (
    'MOQ-002-2026',         -- cod_ugt
    '1082-MOQ-001-MVCS/PNVR/2025',        -- cod_Convenio
    'MEJORAMIENTO DE VIVIENDA RURAL', -- nombre_Convenio
    7,                -- id_grupo
    1,                -- id_tipo_intervencion
    1,                -- id_programa_presupuestal
    2,                -- id_tipo_fenomeno
    1,                -- id_tipo_material
    1,                -- id_estado
    1,                -- id_sub_estado
    1,                -- id_priorizacion
    1,                -- id_tipo_meta
    19,              -- id_Localidad
    2,           -- id_Distrito
    3,             -- id_Provincia
    1,               -- id_Departamento
    '2025-01-01',     -- fecha_Convenios
    '2025-01-15',     -- fecha_transferencia
    '2025-02-01',     -- fecha_limite_inicio
    '2025-02-10',     -- fecha_inicio
    180,              -- plazo_ejecucion
    10,               -- dias_paralizados
    20,               -- dias_ampliacion
    '2025-08-10',     -- fecha_termino
    '2025-08-15',     -- fecha_acta_termino
    'Retraso en permisos', -- motivo_atraso
    'Agilizar trámites',   -- accion_mitigacion
    '2025-02-05',     -- fecha_inicio_estimada
    '2025-08-05',     -- fecha_termino_estimada
    2025,             -- anio_intervencion
    'Municipalidad XYZ', -- Entidad
    'Programa Reconstrucción', -- Programa
    
    500000.00,        -- PresupuestoBase
    450000.00,        -- PresupuestoFinanciamiento
    50000.00,         -- AporteBeneficiario
    'PEN',            -- SimboloMonetario
    18.00,            -- IGV
    6,                -- PlazoEjecucionMeses
    180,              -- PlazoEjecucionDias
    100,              -- NumeroBeneficiarios
    '2025-01-01 10:00:00', -- CreadoEn
    '2025-01-02 15:30:00'  -- ActualizadoEn
);

ALTER TABLE [dbo].[Persona]
DROP CONSTRAINT [UQ_Persona_dni];
select * from persona

update persona set vigencia_hogar = 'No' where id_persona=2

update persona set id_persona_parentesco = 1 where id_persona=4


CREATE TABLE [dbo].[Comunidades_Nativas](
    [id_comunidad] [int] IDENTITY(1,1) NOT NULL,
    [nombre_comunidad] [varchar](100) NOT NULL,
    [grupo_etnico] [varchar](50) NULL,
    [id_Departamento] [int] NULL,
    [id_Provincia] [int] NULL,
    [id_Distrito] [int] NULL,
    [ubigeo] [varchar](6) NULL,
    [lengua_originaria] [varchar](50) NULL,
    [titulo_propiedad] [varchar](3) NULL,
    [fecha_titulacion] [date] NULL,
    [activo] [bit] NOT NULL DEFAULT (1),
    [fecha_creacion] [datetime] NULL,
    [fecha_actualizacion] [datetime] NULL,
    CONSTRAINT [PK_Comunidades_Nativas] PRIMARY KEY CLUSTERED ([id_comunidad] ASC)
);

INSERT INTO [dbo].[Comunidades_Nativas] (
    [nombre_comunidad], [grupo_etnico], [id_Departamento], [id_Provincia], [id_Distrito], 
    [ubigeo], [lengua_originaria], [titulo_propiedad], [fecha_titulacion], [activo], 
    [fecha_creacion], [fecha_actualizacion]
)
VALUES 
    ('Comunidad Quechua de Cusco', 'Quechua', 8, 801, 80101, '080101', 'Quechua', 'Sí', '2020-06-10', 1, '2025-05-30 09:00:00', NULL),
    ('Comunidad Aymara de Puno', 'Aymara', 21, 2101, 210101, '210101', 'Aymara', 'No', NULL, 1, '2025-05-30 10:00:00', '2025-05-30 12:00:00'),
    ('Comunidad Awajún de Amazonas', 'Awajún', 1, 101, 10101, '010101', 'Awajún', 'Sí', '2023-12-01', 1, '2025-05-30 11:00:00', NULL);

	truncate comunidades nativas