
-- Insert into Priorizaciones
INSERT INTO Priorizaciones (agrupacion, grupo_priorizacion)
VALUES 
    ('APURIMAC', '2023'),
    ('PASCO', '2025'),
    ('APURIMAC', '2025'),
    ('PASCO', '2023');
INSERT INTO Grupo (nombre)
VALUES 
    ('Grupo II'),
    ('Grupo III'),
    ('Grupo II CONTINUIDAD'),
    ('Canon');

    
-- Insert into Programa_Presupuestal
INSERT INTO Programa_Presupuestal (codigo)
VALUES 
    ('068'); -- PNVR program code

-- Insert into Tipo_Fenomeno
INSERT INTO Tipo_Fenomeno (descripcion)
VALUES 
    ('HELADAS'),    -- High altitudes in Apurímac (e.g., 3965m)
    ('FRIAJE'),    -- Possible for lower areas
    ('NO APLICA'); -- Non-specific cases

-- Insert into Tipo_Material
INSERT INTO Tipo_Material (descripcion)
VALUES 
    ('LADRILLO'),        -- Standard PNVR material
    ('BLOQUETA'),       -- Common in rural housing
    ('LADRILLO - NORTE'); -- Regional variant

-- Insert into Estado
INSERT INTO Estado_Conv (descripcion)
VALUES 
    ('PARALIZADA'),
    ('ACTOS PREVIOS');

-- Insert into Sub_Estado
INSERT INTO Sub_Estado_conv (descripcion)
VALUES 
    ('CON ACTA DE PARALIZACION'),
    ('CON RD ASIGNACION');

-- Insert into Priorizaciones

SELECT * FROM Priorizaciones
INSERT INTO Priorizaciones (agrupacion, grupo_priorizacion)
VALUES 
    ('APURIMAC', '2023'),
    ('PASCO', '2025'),
    ('CUSCO', '2025'),
    ('TACNA', '2023');

-- Insert into Tipos_Meta
INSERT INTO Tipos_Meta (descripcion)
VALUES 
    ('META ANUAL'),
    ('META VIVIENDAS TERMINADAS'),
    ('META EN EJECUCION');

-- Insert into Actividades_Operativas
INSERT INTO Actividades_Operativas (descripcion)
VALUES 
    ('CONSTRUCCION VIVIENDA'),
    ('SUPERVISION');

	
INSERT INTO Convenios (cod_ugt,cod_Convenio,nombre_Convenio)
VALUES ('PUN-001-2025','1082-PUN-001-MVCS/PNVR/2025','MEJORAMIENTO DE VIVIENDA RURAL')


INSERT INTO Tipo_Intervencion (descripcion)
VALUES 
    ('MEJORAMIENTO DE VIVIENDA RURAL');


INSERT INTO [Departamento] (nombre_Departamento, codigo_Departamento, CreadoEn, ActualizadoEn)
VALUES 
    ('Lima', '15', '2025-05-01 08:00:00', '2025-05-01 08:00:00'),
    ('Arequipa', '04', '2025-05-01 08:00:00', '2025-05-01 08:00:00'),
    ('Cusco', '08', '2025-05-02 09:00:00', '2025-05-02 09:00:00'),
    ('Piura', '20', '2025-05-02 10:00:00', '2025-05-02 10:00:00'),
    ('La Libertad', '13', '2025-05-03 11:00:00', '2025-05-03 11:00:00');


	INSERT INTO [Provincia] (nombre_Provincia, codigo_Provincia, id_Departamento, CreadoEn, ActualizadoEn)
VALUES 
    ('Lima', '1501', 1, '2025-05-04 08:00:00', '2025-05-04 08:00:00'), -- Lima in Lima
    ('Arequipa', '0401', 2, '2025-05-04 09:00:00', '2025-05-04 09:00:00'), -- Arequipa in Arequipa
    ('Cusco', '0801', 3, '2025-05-05 10:00:00', '2025-05-05 10:00:00'), -- Cusco in Cusco
    ('Piura', '2001', 4, '2025-05-05 11:00:00', '2025-05-05 11:00:00'), -- Piura in Piura
    ('Trujillo', '1301', 5, '2025-05-06 12:00:00', '2025-05-06 12:00:00'); -- Trujillo in La Libertad



	INSERT INTO [Distrito] (nombre_Distrito, codigo_Distrito, id_Provincia, CreadoEn, ActualizadoEn)
VALUES 
    ('Miraflores', '150120', 1, '2025-05-07 08:00:00', '2025-05-07 08:00:00'), -- Miraflores in Lima
    ('Cayma', '040103', 2, '2025-05-07 09:00:00', '2025-05-07 09:00:00'), -- Cayma in Arequipa
    ('Wanchaq', '080108', 3, '2025-05-08 10:00:00', '2025-05-08 10:00:00'), -- Wanchaq in Cusco
    ('Castilla', '200104', 4, '2025-05-08 11:00:00', '2025-05-08 11:00:00'), -- Castilla in Piura
    ('Trujillo', '130101', 5, '2025-05-09 12:00:00', '2025-05-09 12:00:00'); -- Trujillo in Trujillo


	INSERT INTO [Localidad] (nombre_Localidad, codigo_Localidad, id_Distrito, CreadoEn, ActualizadoEn)
VALUES 
    ('Armendáriz', 'LOC001', 1, '2025-05-10 08:00:00', '2025-05-10 08:00:00'), -- Neighborhood in Miraflores
    ('Yanahuara', 'LOC002', 2, '2025-05-10 09:00:00', '2025-05-10 09:00:00'), -- Neighborhood in Cayma
    ('San Jerónimo', 'LOC003', 3, '2025-05-11 10:00:00', '2025-05-11 10:00:00'), -- Neighborhood in Wanchaq
    ('La Victoria', 'LOC004', 4, '2025-05-11 11:00:00', '2025-05-11 11:00:00'), -- Neighborhood in Castilla
    ('El Porvenir', 'LOC005',5, '2025-05-12 12:00:00', '2025-05-12 12:00:00'); -- Neighborhood in Trujillo


INSERT INTO Convenio_Personal (id_convenio, id_personal, id_cargo)
VALUES 
    ('1', 5, 1),  -- Tania como Asistente Técnico - Planta
    ('1', 16, 2);  -- Gianmarco como Asistente Técnico - Planta

