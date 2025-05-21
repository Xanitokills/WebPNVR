-- Base de datos: RuralHousingProgram

-- Tabla para almacenar información general del proyecto
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

-- Tabla para categorías de presupuesto (ej: Obras Provisionales, Movimiento de Tierras)
CREATE TABLE CategoriasPresupuesto (
    CategoriaID INT PRIMARY KEY IDENTITY(1,1),
    CodigoCategoria NVARCHAR(50), -- Ej: '1.0.0', '2.0.0'
    NombreCategoria NVARCHAR(255) NOT NULL, -- Ej: OBRAS PROVISIONALES
    CreadoEn DATETIME DEFAULT GETDATE(),
    ActualizadoEn DATETIME DEFAULT GETDATE()
);

-- Tabla para ítems de presupuesto
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
    NumeroVeces INT, -- Ej: 1 (Nº Veces)
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

-- Tabla para insumos (Relación de Insumos Total)
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
    Unidad NVARCHAR(50), -- Ej: %mo, hm, día
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

-- Tabla para autorización de ítems de costo
CREATE TABLE Autorizaciones (
    AutorizacionID INT PRIMARY KEY IDENTITY(1,1),
    ItemPresupuestoID INT NULL, -- Puede ser nulo si la autorización es para otro tipo de ítem
    InsumoID INT NULL, -- Relación con insumos, si aplica
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
    Contraseña NVARCHAR(255), -- Hasheada para seguridad
    CreadoEn DATETIME DEFAULT GETDATE(),
    ActualizadoEn DATETIME DEFAULT GETDATE()
);