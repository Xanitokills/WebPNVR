CREATE TABLE Convenios(
	id_convenio int identity primary key,
	cod_ugt varchar(50) NULL,
	cod_Convenio varchar(50) NOT NULL,
	nombre_Convenio varchar(50) NOT NULL,
	id_grupo int NULL,
	id_tipo_intervencion int NULL,
	id_programa_presupuestal int NULL,
	id_tipo_fenomeno int NULL,
	id_tipo_material int NULL,
	id_estado int NULL,
	id_sub_estado int NULL,
	id_priorizacion int NULL,
	id_tipo_meta int NULL,
	id_Localidad int NULL,
    id_Distrito int NULL,
    id_Provincia int NULL,
    id_Departamento int NULL,
	fecha_Convenios date NULL,
	fecha_transferencia date NULL,
	fecha_limite_inicio date NULL,
	fecha_inicio date NULL,
	plazo_ejecucion int NULL,
	dias_paralizados int NULL,
	dias_ampliacion int NULL,
	fecha_termino date NULL,
	fecha_acta_termino date NULL,
	motivo_atraso varchar(50) NULL,
	accion_mitigacion varchar(50)  NULL,
	fecha_inicio_estimada date NULL,
	fecha_termino_estimada date NULL,
	anio_intervencion int NULL,
	Entidad VARCHAR(255), -- Ej: MINISTERIO DE VIVIENDA
    Programa VARCHAR(255), -- Ej: PROGRAMA NACIONAL DE VIVIENDA RURAL
    Proyectista int NULL, -- Ej: ING. KEMMER EMELY SANCHEZ ZARATE
    Evaluador int NULL, -- Ej: ARQ. ELLUZMARY GLENDY LIMAYLLA GUTIERREZ
    PresupuestoBase DECIMAL(18,2), -- Ej: 2040201.77
    PresupuestoFinanciamiento DECIMAL(18,2), -- Ej: 1908106.14
    AporteBeneficiario DECIMAL(18,2), -- Ej: 132095.63
    SimboloMonetario VARCHAR(10), -- Ej: S/.
    IGV DECIMAL(5,2), -- Impuesto General a las Ventas, ej: 0.18
    PlazoEjecucionMeses INT, -- Ej: 5
    PlazoEjecucionDias INT, -- Ej: 150
    NumeroBeneficiarios INT, -- Ej: 42 familias
    CreadoEn DATETIME DEFAULT GETDATE(),
    ActualizadoEn DATETIME DEFAULT GETDATE()
)



CREATE TABLE [dbo].[Estado_Conv](
	[id_estado] [int] IDENTITY(1,1) NOT NULL,
	[descripcion] [varchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id_estado] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_Estado_descripcion] UNIQUE NONCLUSTERED 
(
	[descripcion] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

CREATE TABLE Convenio_Personal (
    id_convenio int,
    id_personal INT,
    id_cargo INT,
    PRIMARY KEY (id_convenio, id_personal, id_cargo),  -- Clave compuesta
    FOREIGN KEY (id_convenio) REFERENCES Convenios(id_convenio),
    FOREIGN KEY (id_personal) REFERENCES Personal(id_personal),
    FOREIGN KEY (id_cargo) REFERENCES Cargo(id_cargo)
);



CREATE TABLE [Departamento] (
    id_Departamento INT IDENTITY(1,1) NOT NULL,
    nombre_Departamento NVARCHAR(100) NOT NULL,
    codigo_Departamento NVARCHAR(10) NULL, -- Optional code (e.g., UBIGEO code)
    CreadoEn DATETIME DEFAULT GETDATE() NOT NULL,
    ActualizadoEn DATETIME DEFAULT GETDATE() NOT NULL,
    CONSTRAINT PK_Departamento PRIMARY KEY (id_Departamento),
    CONSTRAINT UQ_Departamento_Nombre UNIQUE (nombre_Departamento)
);

CREATE TABLE [dbo].[Provincia] (
    id_Provincia INT IDENTITY(1,1) NOT NULL,
    nombre_Provincia NVARCHAR(100) NOT NULL,
    codigo_Provincia NVARCHAR(10) NULL, -- Optional code
    id_Departamento INT NOT NULL,
    CreadoEn DATETIME DEFAULT GETDATE() NOT NULL,
    ActualizadoEn DATETIME DEFAULT GETDATE() NOT NULL,
    CONSTRAINT PK_Provincia PRIMARY KEY (id_Provincia),
    CONSTRAINT FK_Provincia_Departamento FOREIGN KEY (id_Departamento) 
        REFERENCES [Departamento](id_Departamento),
    CONSTRAINT UQ_Provincia_Nombre_Departamento UNIQUE (nombre_Provincia, id_Departamento)
);

CREATE TABLE [Distrito] (
    id_Distrito INT IDENTITY(1,1) NOT NULL,
    nombre_Distrito NVARCHAR(100) NOT NULL,
    codigo_Distrito NVARCHAR(10) NULL, -- Optional code
    id_Provincia INT NOT NULL,
    CreadoEn DATETIME DEFAULT GETDATE() NOT NULL,
    ActualizadoEn DATETIME DEFAULT GETDATE() NOT NULL,
    CONSTRAINT PK_Distrito PRIMARY KEY (id_Distrito),
    CONSTRAINT FK_Distrito_Provincia FOREIGN KEY (id_Provincia) 
        REFERENCES [Provincia](id_Provincia),
    CONSTRAINT UQ_Distrito_Nombre_Provincia UNIQUE (nombre_Distrito, id_Provincia)
);

CREATE TABLE [Localidad] (
    id_Localidad INT IDENTITY(1,1) NOT NULL,
    nombre_Localidad NVARCHAR(100) NOT NULL,
    codigo_Localidad NVARCHAR(10) NULL, -- Optional code
    id_Distrito INT NOT NULL,
    CreadoEn DATETIME DEFAULT GETDATE() NOT NULL,
    ActualizadoEn DATETIME DEFAULT GETDATE() NOT NULL,
    CONSTRAINT PK_Localidad PRIMARY KEY (id_Localidad),
    CONSTRAINT FK_Localidad_Distrito FOREIGN KEY (id_Distrito) 
        REFERENCES [Distrito](id_Distrito),
    CONSTRAINT UQ_Localidad_Nombre_Distrito UNIQUE (nombre_Localidad, id_Distrito)
);





CREATE TABLE [dbo].[Convocatoria](
	[id_convocatoria] [int] IDENTITY(1,1) NOT NULL,
	[id_convenio] int NOT NULL,
	[id_tipo] [int] NOT NULL,
	[codigo_seace] [varchar](50) NULL,
	[titulo] [varchar](255) NOT NULL,
	[descripcion] [text] NOT NULL,
	[presupuesto] [decimal](15, 2) NOT NULL,
	[fecha_publicacion] [date] NOT NULL,
	[fecha_limite_ofertas] [date] NOT NULL,
	[fecha_estimada_adjudicacion] [date] NULL,
	[duracion_contrato] [int] NULL,
	[created_at] [datetime2](7) NOT NULL,
	[vigencia] [bit] NOT NULL,
	[pdf_file_path] [nvarchar](255) NULL,
	[word_file_path] [nvarchar](255) NULL,
	[id_item_convocatoria] [int] NULL,
	[id_tipo_item_convocatoria] [int] NULL,
	[cantidad] [int] NULL,
	[id_estado] [int] NULL,
	[fecha_fin_publicacion] [datetime] NULL,
	[fecha_apertura_sobre] [datetime] NULL,
	[fecha_inicio_ofertas] [datetime] NULL,
	[fecha_otorgamiento_buena_pro] [datetime] NULL,
	[Anexos] [varchar](200) NULL,
	[QR_PATH] [varchar](500) NULL,
	[id_convocatoria_documento] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[id_convocatoria] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[codigo_seace] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

CREATE TABLE [dbo].[Adjudicacion](
	[id_adjudicacion] [int] IDENTITY(1,1) NOT NULL,
	[id_convocatoria] [int] NOT NULL,
	[id_postor] [int] NOT NULL,
	[id_oferta] [int] NOT NULL,
	[monto_adjudicado] [decimal](15, 2) NOT NULL,
	[fecha_adjudicacion] [date] NOT NULL,
	[comentarios] [text] NULL,
PRIMARY KEY CLUSTERED 
(
	[id_adjudicacion] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

CREATE TABLE [dbo].[Aprobaciones](
	[id_aprobacion] [int] IDENTITY(1,1) NOT NULL,
	[id_convenio] int NULL,
	[rd_asignacion] [varchar](100) NULL,
	[rd_aprobacion_exp_ejecutivo] [varchar](100) NULL,
	[fecha_rd_aprobacion_exp_ejecutivo] [date] NULL,
	[sesion_orientacion] [varchar](100) NULL,
	[registro_firmas] [varchar](100) NULL,
	[compatibilidad] [varchar](100) NULL,
	[ht_informe_compatibilidad] [varchar](100) NULL,
	[fecha_ht_informe_compatibilidad] [date] NULL,
	[ht_informe_inicial_supervisor] [varchar](100) NULL,
PRIMARY KEY CLUSTERED 
(
	[id_aprobacion] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

CREATE TABLE [dbo].[Auditoria_Cambios](
	[id_auditoria] [int] IDENTITY(1,1) NOT NULL,
	[tabla_afectada] [nvarchar](50) NULL,
	[id_registro] [int] NULL,
	[campo_modificado] [nvarchar](100) NULL,
	[valor_anterior] [nvarchar](max) NULL,
	[valor_nuevo] [nvarchar](max) NULL,
	[usuario] [nvarchar](100) NULL,
	[fecha_cambio] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id_auditoria] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO


CREATE TABLE [dbo].[Autorizaciones](
	[AutorizacionID] [int] IDENTITY(1,1) NOT NULL,
	[ItemPresupuestoID] [int] NULL,
	[InsumoID] [int] NULL,
	[Estado] [nvarchar](50) NULL,
	[AutorizadorID] [int] NULL,
	[Comentario] [nvarchar](500) NULL,
	[FechaAutorizacion] [datetime] NULL,
	[CreadoEn] [datetime] NULL,
	[ActualizadoEn] [datetime] NULL,
	[ExpedienteID] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[AutorizacionID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

CREATE TABLE [dbo].[Autorizaciones_Devoluciones](
	[id_autorizacion] [int] IDENTITY(1,1) NOT NULL,
	[id_convenio] int NULL,
	[numero] [int] NOT NULL,
	[monto_autorizado] [decimal](15, 2) NULL,
	[monto_devolucion] [decimal](15, 2) NULL,
PRIMARY KEY CLUSTERED 
(
	[id_autorizacion] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_Autorizaciones_Convenios_numero] UNIQUE NONCLUSTERED 
(
	[id_convenio] ASC,
	[numero] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO


CREATE TABLE [dbo].[Convocatoria_documento](
	[id_Convocatoria_documento] [int] NULL,
	[id_convocatoria] [int] NULL,
	[id_documento] [int] NULL
) ON [PRIMARY]
GO

CREATE TABLE [dbo].[CategoriasPresupuesto](
	[CategoriaID] [int] IDENTITY(1,1) NOT NULL,
	[CodigoCategoria] [nvarchar](50) NULL,
	[NombreCategoria] [nvarchar](255) NOT NULL,
	[CreadoEn] [datetime] NULL,
	[ActualizadoEn] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[CategoriaID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO


CREATE TABLE [dbo].[Documento](
	[id_documento] [int] IDENTITY(1,1) NOT NULL,
	[nombre] [varchar](255) NOT NULL,
	[tipo] [varchar](50) NOT NULL,
	[formato] [varchar](10) NOT NULL,
	[ruta_archivo] [varchar](255) NOT NULL,
	[version] [int] NOT NULL,
	[fecha_subida] [datetime2](7) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id_documento] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

CREATE TABLE [dbo].[Equipos](
	[EquipoID] [int] IDENTITY(1,1) NOT NULL,
	id_convenio [int] NULL,
	[Codigo] [nvarchar](50) NULL,
	[Descripcion] [nvarchar](255) NULL,
	[Unidad] [nvarchar](50) NULL,
	[Cantidad] [decimal](18, 4) NULL,
	[PrecioUnitario] [decimal](18, 2) NULL,
	[CostoTotal] [decimal](18, 2) NULL,
	[Observaciones] [nvarchar](500) NULL,
	[CreadoEn] [datetime] NULL,
	[ActualizadoEn] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[EquipoID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO


CREATE TABLE [dbo].[Estado_Convocatoria](
	[id_estado] [int] IDENTITY(1,1) NOT NULL,
	[estado] [varchar](50) NOT NULL,
	[fecha_cambio] [datetime2](7) NOT NULL,
	[comentarios] [text] NULL,
PRIMARY KEY CLUSTERED 
(
	[id_estado] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

CREATE TABLE [dbo].[ExpedienteTecnico](
	[ExpedienteID] [int] IDENTITY(1,1) NOT NULL,
	[id_convenio] [int] NULL,
	[NombreArchivo] [nvarchar](255) NOT NULL,
	[TipoArchivo] [nvarchar](50) NULL,
	[RutaArchivo] [nvarchar](500) NULL,
	[TamañoArchivo] [decimal](18, 2) NULL,
	[Descripcion] [nvarchar](500) NULL,
	[FechaCarga] [datetime] NULL,
	[CreadoEn] [datetime] NULL,
	[ActualizadoEn] [datetime] NULL,
	[Categoria] [nvarchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[ExpedienteID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO


CREATE TABLE [dbo].[Finanzas](
	[id_finanzas] [int] IDENTITY(1,1) NOT NULL,
	[id_convenio] int NULL,
	[id_actividad_operativa] [int] NULL,
	[meta_presupuestal] [decimal](15, 2) NULL,
	[costo_directo] [decimal](15, 2) NULL,
	[costo_indirecto] [decimal](15, 2) NULL,
	[transferencia_pnvr] [decimal](15, 2) NULL,
	[aporte_beneficiarios] [decimal](15, 2) NULL,
	[presupuesto_total] [decimal](15, 2) NULL,
	[costo_directo_modificado_1] [decimal](15, 2) NULL,
	[costo_indirecto_modificado_1] [decimal](15, 2) NULL,
	[transferencia_modificada_1] [decimal](15, 2) NULL,
	[aporte_beneficiarios_modificado_1] [decimal](15, 2) NULL,
	[presupuesto_modificado_1] [decimal](15, 2) NULL,
	[costo_directo_modificado_2] [decimal](15, 2) NULL,
	[costo_indirecto_modificado_2] [decimal](15, 2) NULL,
	[transferencia_modificada_2] [decimal](15, 2) NULL,
	[aporte_beneficiarios_modificado_2] [decimal](15, 2) NULL,
	[presupuesto_modificado_2] [decimal](15, 2) NULL,
	[financiamiento_modificado] [decimal](15, 2) NULL,
	[ampliacion_presupuestal] [decimal](15, 2) NULL,
	[monto_por_vivienda] [decimal](15, 2) NULL,
	[total_autorizado] [decimal](15, 2) NULL,
	[total_devolucion_saldo] [decimal](15, 2) NULL,
	[monto_ejecutado] [decimal](15, 2) NULL,
	[monto_deductivo] [decimal](15, 2) NULL,
	[monto_transferido_2025_arrastre] [decimal](15, 2) NULL,
	[pago_supervisor] [decimal](15, 2) NULL,
	[pago_actividades_iniciales] [decimal](15, 2) NULL,
	[pago_informe_compatibilidad] [decimal](15, 2) NULL,
	[pago_ejecucion] [decimal](15, 2) NULL,
	[pago_liquidacion] [decimal](15, 2) NULL,
	[pago_residente] [decimal](15, 2) NULL,
	[pago_asistente_administrativo] [decimal](15, 2) NULL,
	[pago_gestor_social] [decimal](15, 2) NULL,
PRIMARY KEY CLUSTERED 
(
	[id_finanzas] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO


CREATE TABLE [dbo].[Fletes](
	[FleteID] [int] IDENTITY(1,1) NOT NULL,
	[id_convenio] [int] NULL,
	[Codigo] [nvarchar](50) NULL,
	[Descripcion] [nvarchar](255) NULL,
	[Unidad] [nvarchar](50) NULL,
	[Cantidad] [decimal](18, 4) NULL,
	[PrecioUnitario] [decimal](18, 2) NULL,
	[CostoTotal] [decimal](18, 2) NULL,
	[CreadoEn] [datetime] NULL,
	[ActualizadoEn] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[FleteID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO





CREATE TABLE [dbo].[Insumos](
	[InsumoID] [int] IDENTITY(1,1) NOT NULL,
	[id_convenio] [int] NULL,
	[CodigoInsumo] [nvarchar](50) NULL,
	[Descripcion] [nvarchar](255) NULL,
	[Unidad] [nvarchar](50) NULL,
	[Cantidad] [decimal](18, 4) NULL,
	[PrecioUnitario] [decimal](18, 2) NULL,
	[CostoTotal] [decimal](18, 2) NULL,
	[CreadoEn] [datetime] NULL,
	[ActualizadoEn] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[InsumoID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO


CREATE TABLE [dbo].[Item_convocatoria](
	[id_item_convocatoria] [int] IDENTITY(1,1) NOT NULL,
	[descripcion] [varchar](255) NOT NULL,
	[cantidad] [int] NOT NULL,
	[id_unidad_medida] [int] NOT NULL,
	[precio_referencial] [decimal](10, 2) NOT NULL,
	[especificaciones_tecnicas] [text] NULL,
	[id_convocatoria] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id_item_convocatoria] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO


CREATE TABLE [dbo].[ItemsPresupuesto](
	[ItemPresupuestoID] [int] IDENTITY(1,1) NOT NULL,
	id_convenio [int] NULL,
	[CategoriaID] [int] NULL,
	[CodigoItem] [nvarchar](50) NULL,
	[Descripcion] [nvarchar](500) NULL,
	[Unidad] [nvarchar](50) NULL,
	[Cantidad] [decimal](18, 4) NULL,
	[PrecioUnitario] [decimal](18, 2) NULL,
	[CostoTotal] [decimal](18, 2) NULL,
	[ReferenciaPlano] [nvarchar](50) NULL,
	[Eje] [nvarchar](50) NULL,
	[Detalle] [nvarchar](255) NULL,
	[NumeroVeces] [int] NULL,
	[Largo] [decimal](18, 4) NULL,
	[Ancho] [decimal](18, 4) NULL,
	[Alto] [decimal](18, 4) NULL,
	[Area] [decimal](18, 4) NULL,
	[CantidadPorVivienda] [decimal](18, 4) NULL,
	[NumeroViviendas] [int] NULL,
	[MetradoTotal] [decimal](18, 4) NULL,
	[CreadoEn] [datetime] NULL,
	[ActualizadoEn] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[ItemPresupuestoID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

CREATE TABLE [dbo].[ManoObra](
	[ManoObraID] [int] IDENTITY(1,1) NOT NULL,
	id_convenio [int] NULL,
	[Codigo] [nvarchar](50) NULL,
	[Descripcion] [nvarchar](255) NULL,
	[Unidad] [nvarchar](50) NULL,
	[Cantidad] [decimal](18, 4) NULL,
	[PrecioUnitario] [decimal](18, 2) NULL,
	[CostoTotal] [decimal](18, 2) NULL,
	[Mes1Cantidad] [decimal](18, 4) NULL,
	[Mes1Parcial] [decimal](18, 2) NULL,
	[Mes1Porcentaje] [decimal](18, 4) NULL,
	[Mes2Cantidad] [decimal](18, 4) NULL,
	[Mes2Parcial] [decimal](18, 2) NULL,
	[Mes2Porcentaje] [decimal](18, 4) NULL,
	[Mes3Cantidad] [decimal](18, 4) NULL,
	[Mes3Parcial] [decimal](18, 2) NULL,
	[Mes3Porcentaje] [decimal](18, 4) NULL,
	[Mes4Cantidad] [decimal](18, 4) NULL,
	[Mes4Parcial] [decimal](18, 2) NULL,
	[Mes4Porcentaje] [decimal](18, 4) NULL,
	[Mes5Cantidad] [decimal](18, 4) NULL,
	[Mes5Parcial] [decimal](18, 2) NULL,
	[Mes5Porcentaje] [decimal](18, 4) NULL,
	[Mes5_5Cantidad] [decimal](18, 4) NULL,
	[Mes5_5Parcial] [decimal](18, 2) NULL,
	[Mes5_5Porcentaje] [decimal](18, 4) NULL,
	[CreadoEn] [datetime] NULL,
	[ActualizadoEn] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[ManoObraID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO



CREATE TABLE [dbo].[Oferta](
	[id_oferta] [int] IDENTITY(1,1) NOT NULL,
	[id_convocatoria] [int] NOT NULL,
	[id_postor] [int] NOT NULL,
	[monto_propuesto] [decimal](15, 2) NOT NULL,
	[fecha_presentacion] [datetime2](7) NOT NULL,
	[observaciones] [text] NULL,
PRIMARY KEY CLUSTERED 
(
	[id_oferta] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO


CREATE TABLE [dbo].[Persona](
	[id_persona] [int] IDENTITY(1,1) NOT NULL,
	[id_vivienda] [int] NULL,
	[nombre] [varchar](50) NOT NULL,
	[apellido_paterno] [varchar](50) NOT NULL,
	[apellido_materno] [varchar](50) NOT NULL,
	[dni] [varchar](8) NOT NULL,
	[sexo] [varchar](10) NOT NULL,
	[fecha_nacimiento] [date] NOT NULL,
	[beneficiario] [varchar](3) NOT NULL,
	[numero_miembros] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id_persona] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_Persona_dni] UNIQUE NONCLUSTERED 
(
	[dni] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO





CREATE TABLE [dbo].[Personal](
	[id_personal] [int] IDENTITY(1,1) NOT NULL,
	[id_cargo] [int] NULL,
	[nombre] [varchar](200) NOT NULL,
	[Apellido_Paterno] [varchar](50) NULL,
	[Apellido_Materno] [varchar](50) NULL,
	[dni] [varchar](8) NULL,
	[celular] [varchar](9) NULL,
	[correo] [varchar](100) NULL,
	[profesion] [nvarchar](500) NULL,
PRIMARY KEY CLUSTERED 
(
	[id_personal] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Personal_Cargo]    Script Date: 21/05/2025 00:19:23 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Cargo](
	[id_cargo] [int] IDENTITY(1,1) NOT NULL,
	[descripcion] [nvarchar](1000) NOT NULL,
	[estado] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[id_cargo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO



CREATE TABLE [dbo].[Personal_Cargo](
	[id_personal] [int] NOT NULL,
	[id_cargo] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id_personal] ASC,
	[id_cargo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Postor]    Script Date: 21/05/2025 00:19:23 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Postor](
	[id_postor] [int] IDENTITY(1,1) NOT NULL,
	[ruc] [varchar](11) NOT NULL,
	[razon_social] [varchar](255) NOT NULL,
	[direccion] [text] NULL,
	[correo] [varchar](100) NULL,
	[telefono] [varchar](20) NULL,
	[created_at] [datetime2](7) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id_postor] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[ruc] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Priorizaciones]    Script Date: 21/05/2025 00:19:23 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Priorizaciones](
	[id_priorizacion] [int] IDENTITY(1,1) NOT NULL,
	[agrupacion] [varchar](100) NULL,
	[grupo_priorizacion] [varchar](100) NULL,
PRIMARY KEY CLUSTERED 
(
	[id_priorizacion] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_Priorizaciones_agrupacion_grupo] UNIQUE NONCLUSTERED 
(
	[agrupacion] ASC,
	[grupo_priorizacion] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO



CREATE TABLE [dbo].[Grupo](
	[id_grupo] [int] IDENTITY(1,1) NOT NULL,
	[nombre] [varchar](100) NOT NULL,
	[estado] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[id_grupo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_Grupo_nombre] UNIQUE NONCLUSTERED 
(
	[nombre] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO



/****** Object:  Table [dbo].[Programa_Presupuestal]    Script Date: 21/05/2025 00:19:23 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Programa_Presupuestal](
	[id_programa_presupuestal] [int] IDENTITY(1,1) NOT NULL,
	[codigo] [varchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id_programa_presupuestal] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_Programa_Presupuestal_codigo] UNIQUE NONCLUSTERED 
(
	[codigo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Progreso]    Script Date: 21/05/2025 00:19:23 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Progreso](
	[id_progreso] [int] IDENTITY(1,1) NOT NULL,
	[id_convenio] int NULL,
	[fecha] [date] NOT NULL,
	[mes_reporte] [varchar](20) NULL,
	[avance_programado] [decimal](5, 2) NULL,
	[avance_reportado] [decimal](5, 2) NULL,
	[porcentaje_avance_fisico] [decimal](5, 2) NULL,
	[porcentaje_avance_financiero] [decimal](5, 2) NULL,
	[eficiencia] [decimal](5, 2) NULL,
PRIMARY KEY CLUSTERED 
(
	[id_progreso] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Sub_Estado_Conv]    Script Date: 21/05/2025 00:19:23 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Sub_Estado_Conv](
	[id_sub_estado] [int] IDENTITY(1,1) NOT NULL,
	[descripcion] [varchar](100) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id_sub_estado] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_Sub_Estado_descripcion] UNIQUE NONCLUSTERED 
(
	[descripcion] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Tipo_Convocatoria]    Script Date: 21/05/2025 00:19:23 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Tipo_Convocatoria](
	[id_tipo] [int] IDENTITY(1,1) NOT NULL,
	[nombre] [varchar](50) NOT NULL,
	[descripcion] [text] NULL,
	[estado] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[id_tipo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Tipo_Fenomeno]    Script Date: 21/05/2025 00:19:23 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Tipo_Fenomeno](
	[id_tipo_fenomeno] [int] IDENTITY(1,1) NOT NULL,
	[descripcion] [varchar](50) NOT NULL,
	[estado] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[id_tipo_fenomeno] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_Tipo_Fenomeno_descripcion] UNIQUE NONCLUSTERED 
(
	[descripcion] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Tipo_Intervencion]    Script Date: 21/05/2025 00:19:23 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Tipo_Intervencion](
	[id_tipo_intervencion] [int] IDENTITY(1,1) NOT NULL,
	[descripcion] [varchar](200) NOT NULL,
	[estado] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[id_tipo_intervencion] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_Tipo_Intervencion_descripcion] UNIQUE NONCLUSTERED 
(
	[descripcion] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Tipo_Material]    Script Date: 21/05/2025 00:19:23 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Tipo_Material](
	[id_tipo_material] [int] IDENTITY(1,1) NOT NULL,
	[descripcion] [varchar](50) NOT NULL,
	[estado] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[id_tipo_material] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_Tipo_Material_descripcion] UNIQUE NONCLUSTERED 
(
	[descripcion] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Tipo_unidad_medida]    Script Date: 21/05/2025 00:19:23 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Tipo_unidad_medida](
	[id_tipo_unidad_medida] [int] IDENTITY(1,1) NOT NULL,
	[nombre] [varchar](50) NOT NULL,
	[abreviatura] [varchar](10) NOT NULL,
	[descripcion] [varchar](200) NULL,
	[activo] [bit] NOT NULL,
 CONSTRAINT [PK_Tipo_unidad_medida] PRIMARY KEY CLUSTERED 
(
	[id_tipo_unidad_medida] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_Tipo_unidad_medida_abreviatura] UNIQUE NONCLUSTERED 
(
	[abreviatura] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_Tipo_unidad_medida_nombre] UNIQUE NONCLUSTERED 
(
	[nombre] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Tipos_Meta]    Script Date: 21/05/2025 00:19:23 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Tipos_Meta](
	[id_tipo_meta] [int] IDENTITY(1,1) NOT NULL,
	[descripcion] [varchar](50) NOT NULL,
	[estado] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[id_tipo_meta] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_Tipos_Meta_descripcion] UNIQUE NONCLUSTERED 
(
	[descripcion] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO


CREATE TABLE [dbo].[Usuarios](
	[UsuarioID] [int] IDENTITY(1,1) NOT NULL,
	[Nombre] [nvarchar](255) NULL,
	[Rol] [nvarchar](50) NULL,
	[Email] [nvarchar](255) NULL,
	[Contraseña] [nvarchar](255) NULL,
	[CreadoEn] [datetime] NULL,
	[ActualizadoEn] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[UsuarioID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Validacion_Bases]    Script Date: 21/05/2025 00:19:23 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Validacion_Bases](
	[id_validacion] [int] IDENTITY(1,1) NOT NULL,
	[id_documento] [int] NOT NULL,
	[nivel_validacion] [varchar](20) NOT NULL,
	[estado] [varchar](20) NOT NULL,
	[usuario_validador] [varchar](100) NOT NULL,
	[fecha_validacion] [datetime2](7) NOT NULL,
	[comentarios] [text] NULL,
PRIMARY KEY CLUSTERED 
(
	[id_validacion] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Vivienda]    Script Date: 21/05/2025 00:19:23 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Vivienda](
	[id_vivienda] [int] IDENTITY(1,1) NOT NULL,
	[cod] [varchar](20) NOT NULL,
	[cuv] [varchar](20) NULL,
	[id_convenio] int NULL,
	[id_ubicacion] [int] NULL,
	[id_estado] [int] NULL,
	[id_sub_estado] [int] NULL,
	[fecha_inicio] [date] NULL,
	[fecha_termino] [date] NULL,
	[costo_total] [decimal](15, 2) NULL,
	[observaciones] [text] NULL,
PRIMARY KEY CLUSTERED 
(
	[id_vivienda] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_Vivienda_cod] UNIQUE NONCLUSTERED 
(
	[cod] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_Vivienda_cuv] UNIQUE NONCLUSTERED 
(
	[cuv] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

CREATE TABLE [Convenio_Personal] (
    id_convenio int,
    id_personal INT,
    id_cargo INT,
    PRIMARY KEY (id_convenio, id_personal, id_cargo),  -- Clave compuesta
    FOREIGN KEY (id_convenio) REFERENCES Convenios(id_convenio),
    FOREIGN KEY (id_personal) REFERENCES Personal(id_personal),
    FOREIGN KEY (id_cargo) REFERENCES Cargo(id_cargo)
);

SET ANSI_PADDING ON
GO


 
CREATE TABLE [dbo].[Actividades_Operativas](
	[id_actividad_operativa] [int] IDENTITY(1,1) NOT NULL,
	[descripcion] [varchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id_actividad_operativa] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_Actividades_Operativas_descripcion] UNIQUE NONCLUSTERED 
(
	[descripcion] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO


/****** Object:  Index [IX_Aprobaciones_id_convenio]    Script Date: 21/05/2025 00:19:23 ******/
CREATE NONCLUSTERED INDEX [IX_Aprobaciones_id_convenio] ON [dbo].[Aprobaciones]
(
	[id_convenio] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_Autorizaciones_id_convenio]    Script Date: 21/05/2025 00:19:23 ******/
CREATE NONCLUSTERED INDEX [IX_Autorizaciones_id_convenio] ON [dbo].[Autorizaciones_Devoluciones]
(
	[id_convenio] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_Beneficiarios_Agregado_id_convenio]    Script Date: 21/05/2025 00:19:23 ******/

/****** Object:  Index [idx_convocatoria_Convenios]    Script Date: 21/05/2025 00:19:23 ******/
CREATE NONCLUSTERED INDEX [idx_convocatoria_Convenios] ON [dbo].[Convocatoria]
(
	[id_convenio] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [idx_convocatoria_fecha]    Script Date: 21/05/2025 00:19:23 ******/
CREATE NONCLUSTERED INDEX [idx_convocatoria_fecha] ON [dbo].[Convocatoria]
(
	[fecha_publicacion] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_ExpedienteTecnico_ConveniosId]    Script Date: 21/05/2025 00:19:23 ******/
CREATE NONCLUSTERED INDEX [IX_ExpedienteTecnico_ConveniosId] ON [dbo].[ExpedienteTecnico]
(
	id_convenio ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_Finanzas_id_convenio]    Script Date: 21/05/2025 00:19:23 ******/
CREATE NONCLUSTERED INDEX [IX_Finanzas_id_convenio] ON [dbo].[Finanzas]
(
	[id_convenio] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [idx_oferta_convocatoria]    Script Date: 21/05/2025 00:19:23 ******/
CREATE NONCLUSTERED INDEX [idx_oferta_convocatoria] ON [dbo].[Oferta]
(
	[id_convocatoria] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_Persona_dni]    Script Date: 21/05/2025 00:19:23 ******/
CREATE NONCLUSTERED INDEX [IX_Persona_dni] ON [dbo].[Persona]
(
	[dni] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_Progreso_id_convenio_fecha]    Script Date: 21/05/2025 00:19:23 ******/
CREATE NONCLUSTERED INDEX [IX_Progreso_id_convenio_fecha] ON [dbo].[Progreso]
(
	[id_convenio] ASC,
	[fecha] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_Vivienda_cod]    Script Date: 21/05/2025 00:19:23 ******/
CREATE NONCLUSTERED INDEX [IX_Vivienda_cod] ON [dbo].[Vivienda]
(
	[cod] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_Vivienda_cuv]    Script Date: 21/05/2025 00:19:23 ******/
CREATE NONCLUSTERED INDEX [IX_Vivienda_cuv] ON [dbo].[Vivienda]
(
	[cuv] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO



ALTER TABLE [dbo].[Adjudicacion]  WITH CHECK ADD FOREIGN KEY([id_convocatoria])
REFERENCES [dbo].[Convocatoria] ([id_convocatoria])
GO
ALTER TABLE [dbo].[Adjudicacion]  WITH CHECK ADD FOREIGN KEY([id_oferta])
REFERENCES [dbo].[Oferta] ([id_oferta])
GO
ALTER TABLE [dbo].[Adjudicacion]  WITH CHECK ADD FOREIGN KEY([id_postor])
REFERENCES [dbo].[Postor] ([id_postor])
GO
ALTER TABLE [dbo].[Aprobaciones]  WITH CHECK ADD  CONSTRAINT [FK_Aprobaciones_convenios] FOREIGN KEY([id_convenio])
REFERENCES [dbo].[convenios] ([id_convenio])
GO
ALTER TABLE [dbo].[Aprobaciones] CHECK CONSTRAINT [FK_Aprobaciones_convenios]
GO
ALTER TABLE [dbo].[Autorizaciones]  WITH CHECK ADD FOREIGN KEY([ExpedienteID])
REFERENCES [dbo].[ExpedienteTecnico] ([ExpedienteID])
GO
ALTER TABLE [dbo].[Autorizaciones]  WITH CHECK ADD FOREIGN KEY([InsumoID])
REFERENCES [dbo].[Insumos] ([InsumoID])
GO
ALTER TABLE [dbo].[Autorizaciones]  WITH CHECK ADD FOREIGN KEY([ItemPresupuestoID])
REFERENCES [dbo].[ItemsPresupuesto] ([ItemPresupuestoID])
GO
ALTER TABLE [dbo].[Autorizaciones_Devoluciones]  WITH CHECK ADD  CONSTRAINT [FK_Autorizaciones_convenios] FOREIGN KEY([id_convenio])
REFERENCES [dbo].[convenios] ([id_convenio])
GO
ALTER TABLE [dbo].[Autorizaciones_Devoluciones] CHECK CONSTRAINT [FK_Autorizaciones_convenios]
GO


ALTER TABLE [dbo].[convenios]  WITH CHECK ADD  CONSTRAINT [FK_convenios_Estado] FOREIGN KEY([id_estado])
REFERENCES [dbo].[Estado_Conv] ([id_estado])
GO
ALTER TABLE [dbo].[convenios] CHECK CONSTRAINT [FK_convenios_Estado]
GO
ALTER TABLE [dbo].[convenios]  WITH CHECK ADD  CONSTRAINT [FK_convenios_Grupo] FOREIGN KEY([id_grupo])
REFERENCES [dbo].[Grupo] ([id_grupo])
GO
ALTER TABLE [dbo].[convenios] CHECK CONSTRAINT [FK_convenios_Grupo]
GO


ALTER TABLE [dbo].[convenios]  WITH CHECK ADD  CONSTRAINT [FK_convenios_Programa_Presupuestal] FOREIGN KEY([id_programa_presupuestal])
REFERENCES [dbo].[Programa_Presupuestal] ([id_programa_presupuestal])
GO
ALTER TABLE [dbo].[convenios] CHECK CONSTRAINT [FK_convenios_Programa_Presupuestal]
GO
ALTER TABLE [dbo].[convenios]  WITH CHECK ADD  CONSTRAINT [FK_convenios_Sub_Estado] FOREIGN KEY([id_sub_estado])
REFERENCES [dbo].[Sub_Estado_Conv] ([id_sub_estado])
GO
ALTER TABLE [dbo].[convenios] CHECK CONSTRAINT [FK_convenios_Sub_Estado]
GO
ALTER TABLE [dbo].[convenios]  WITH CHECK ADD  CONSTRAINT [FK_convenios_Tipo_Fenomeno] FOREIGN KEY([id_tipo_fenomeno])
REFERENCES [dbo].[Tipo_Fenomeno] ([id_tipo_fenomeno])
GO
ALTER TABLE [dbo].[convenios] CHECK CONSTRAINT [FK_convenios_Tipo_Fenomeno]
GO
ALTER TABLE [dbo].[convenios]  WITH CHECK ADD  CONSTRAINT [FK_convenios_Tipo_Intervencion] FOREIGN KEY([id_tipo_intervencion])
REFERENCES [dbo].[Tipo_Intervencion] ([id_tipo_intervencion])
GO
ALTER TABLE [dbo].[convenios] CHECK CONSTRAINT [FK_convenios_Tipo_Intervencion]
GO
ALTER TABLE [dbo].[convenios]  WITH CHECK ADD  CONSTRAINT [FK_convenios_Tipo_Material] FOREIGN KEY([id_tipo_material])
REFERENCES [dbo].[Tipo_Material] ([id_tipo_material])
GO
ALTER TABLE [dbo].[convenios] CHECK CONSTRAINT [FK_convenios_Tipo_Material]
GO
ALTER TABLE [dbo].[convenios]  WITH CHECK ADD  CONSTRAINT [FK_convenios_Tipos_Meta] FOREIGN KEY([id_tipo_meta])
REFERENCES [dbo].[Tipos_Meta] ([id_tipo_meta])
GO
ALTER TABLE [dbo].[convenios] CHECK CONSTRAINT [FK_convenios_Tipos_Meta]
GO


ALTER TABLE [dbo].[Convocatoria]  WITH CHECK ADD FOREIGN KEY([id_convenio])
REFERENCES [dbo].[convenios] ([id_convenio])
GO
ALTER TABLE [dbo].[Convocatoria]  WITH CHECK ADD FOREIGN KEY([id_estado])
REFERENCES [dbo].[Estado_Convocatoria] ([id_estado])
GO
ALTER TABLE [dbo].[Convocatoria]  WITH CHECK ADD FOREIGN KEY([id_tipo])
REFERENCES [dbo].[Tipo_Convocatoria] ([id_tipo])
GO
ALTER TABLE [dbo].[Convocatoria_documento]  WITH CHECK ADD FOREIGN KEY([id_convocatoria])
REFERENCES [dbo].[Convocatoria] ([id_convocatoria])
GO
ALTER TABLE [dbo].[Convocatoria_documento]  WITH CHECK ADD FOREIGN KEY([id_documento])
REFERENCES [dbo].[Documento] ([id_documento])
GO
ALTER TABLE [dbo].[Equipos]  WITH CHECK ADD FOREIGN KEY(id_convenio)
REFERENCES [dbo].[convenios] (id_convenio)
GO
ALTER TABLE [dbo].[ExpedienteTecnico]  WITH CHECK ADD FOREIGN KEY(id_convenio)
REFERENCES [dbo].[convenios] (id_convenio)
GO


ALTER TABLE [dbo].[Finanzas]  WITH CHECK ADD  CONSTRAINT [FK_Finanzas_Actividades_Operativas] FOREIGN KEY([id_actividad_operativa])
REFERENCES [dbo].[Actividades_Operativas] ([id_actividad_operativa])
GO

ALTER TABLE [dbo].[Finanzas] CHECK CONSTRAINT [FK_Finanzas_Actividades_Operativas]
GO
ALTER TABLE [dbo].[Finanzas]  WITH CHECK ADD  CONSTRAINT [FK_Finanzas_convenios] FOREIGN KEY([id_convenio])
REFERENCES [dbo].[convenios] ([id_convenio])
GO
ALTER TABLE [dbo].[Finanzas] CHECK CONSTRAINT [FK_Finanzas_convenios]
GO
ALTER TABLE [dbo].[Fletes]  WITH CHECK ADD FOREIGN KEY(id_convenio)
REFERENCES [dbo].[Convenios] (id_convenio)
GO
ALTER TABLE [dbo].[Insumos]  WITH CHECK ADD FOREIGN KEY(id_convenio)
REFERENCES [dbo].[Convenios] (id_convenio)
GO
ALTER TABLE [dbo].[item_convocatoria]  WITH CHECK ADD FOREIGN KEY([id_convocatoria])
REFERENCES [dbo].[Convocatoria] ([id_convocatoria])
GO
ALTER TABLE [dbo].[item_convocatoria]  WITH CHECK ADD FOREIGN KEY([id_unidad_medida])
REFERENCES [dbo].[Tipo_unidad_medida] ([id_tipo_unidad_medida])
GO
ALTER TABLE [dbo].[ItemsPresupuesto]  WITH CHECK ADD FOREIGN KEY([CategoriaID])
REFERENCES [dbo].[CategoriasPresupuesto] ([CategoriaID])
GO
ALTER TABLE [dbo].[ItemsPresupuesto]  WITH CHECK ADD FOREIGN KEY(id_convenio)
REFERENCES [dbo].[Convenios] (id_convenio)
GO
ALTER TABLE [dbo].[ManoObra]  WITH CHECK ADD FOREIGN KEY(id_convenio)
REFERENCES [dbo].[Convenios] (id_convenio)
GO
ALTER TABLE [dbo].[Oferta]  WITH CHECK ADD FOREIGN KEY([id_convocatoria])
REFERENCES [dbo].[Convocatoria] ([id_convocatoria])
GO
ALTER TABLE [dbo].[Oferta]  WITH CHECK ADD FOREIGN KEY([id_postor])
REFERENCES [dbo].[Postor] ([id_postor])
GO


ALTER TABLE [dbo].[Persona]  WITH CHECK ADD  CONSTRAINT [FK_Persona_Vivienda] FOREIGN KEY([id_vivienda])
REFERENCES [dbo].[Vivienda] ([id_vivienda])
GO
ALTER TABLE [dbo].[Persona] CHECK CONSTRAINT [FK_Persona_Vivienda]
GO
ALTER TABLE [dbo].[Personal]  WITH CHECK ADD  CONSTRAINT [FK_personal_cargo] FOREIGN KEY([id_cargo])
REFERENCES [dbo].[Cargo] ([id_cargo])
GO
ALTER TABLE [dbo].[Personal] CHECK CONSTRAINT [FK_personal_cargo]
GO
ALTER TABLE [dbo].[Personal_Cargo]  WITH CHECK ADD FOREIGN KEY([id_cargo])
REFERENCES [dbo].[Cargo] ([id_cargo])
GO
ALTER TABLE [dbo].[Personal_Cargo]  WITH CHECK ADD FOREIGN KEY([id_personal])
REFERENCES [dbo].[Personal] ([id_personal])
GO
ALTER TABLE [dbo].[Progreso]  WITH CHECK ADD  CONSTRAINT [FK_Progreso_convenios] FOREIGN KEY([id_convenio])
REFERENCES [dbo].[convenios] ([id_convenio])
GO
ALTER TABLE [dbo].[Progreso] CHECK CONSTRAINT [FK_Progreso_convenios]
GO
ALTER TABLE [dbo].[Validacion_Bases]  WITH CHECK ADD FOREIGN KEY([id_documento])
REFERENCES [dbo].[Documento] ([id_documento])
GO
ALTER TABLE [dbo].[Vivienda]  WITH CHECK ADD  CONSTRAINT [FK_Vivienda_convenios] FOREIGN KEY([id_convenio])
REFERENCES [dbo].[convenios] ([id_convenio])
GO
ALTER TABLE [dbo].[Vivienda] CHECK CONSTRAINT [FK_Vivienda_convenios]
GO


ALTER TABLE [dbo].[Documento]  WITH CHECK ADD  CONSTRAINT [chk_formato] CHECK  (([formato]='xls' OR [formato]='xlsx' OR [formato]='pdf'))
GO
ALTER TABLE [dbo].[Documento] CHECK CONSTRAINT [chk_formato]
GO
ALTER TABLE [dbo].[Persona]  WITH CHECK ADD CHECK  (([beneficiario]='NO' OR [beneficiario]='SÍ'))
GO
ALTER TABLE [dbo].[Persona]  WITH CHECK ADD CHECK  (([numero_miembros]>=(1)))
GO
ALTER TABLE [dbo].[Persona]  WITH CHECK ADD CHECK  (([sexo]='FEMENINO' OR [sexo]='MASCULINO'))
GO
ALTER TABLE [dbo].[Validacion_Bases]  WITH CHECK ADD  CONSTRAINT [chk_estado] CHECK  (([estado]='Rechazado' OR [estado]='Aprobado' OR [estado]='Pendiente'))
GO
ALTER TABLE [dbo].[Validacion_Bases] CHECK CONSTRAINT [chk_estado]
GO
ALTER TABLE [dbo].[Validacion_Bases]  WITH CHECK ADD  CONSTRAINT [chk_nivel] CHECK  (([nivel_validacion]='Representante' OR [nivel_validacion]='Monitor' OR [nivel_validacion]='Supervisor' OR [nivel_validacion]='Residente'))
GO
ALTER TABLE [dbo].[Validacion_Bases] CHECK CONSTRAINT [chk_nivel]
GO




ALTER TABLE [dbo].[convenios]  WITH CHECK ADD  CONSTRAINT [FK_convenios_Priorizaciones] FOREIGN KEY([id_priorizacion])
REFERENCES [dbo].[Priorizaciones] ([id_priorizacion])
GO

ALTER TABLE [dbo].[convenios] CHECK CONSTRAINT [FK_convenios_Priorizaciones]
GO


ALTER TABLE [dbo].[Autorizaciones]  WITH CHECK ADD FOREIGN KEY([ExpedienteID])
REFERENCES [dbo].[ExpedienteTecnico] ([ExpedienteID])
GO

ALTER TABLE [dbo].[ExpedienteTecnico]  WITH CHECK ADD FOREIGN KEY([Id_convenio])
REFERENCES [dbo].[Convenios] ([Id_Convenio])
GO
