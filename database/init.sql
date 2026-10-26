-- ====================================================================
-- SOMEP — SOCIEDAD MEXICANA DE PÉPTIDOS
-- Script de Creación de Base de Datos y Precarga Inicial de Compuestos
-- ====================================================================

CREATE DATABASE IF NOT EXISTS somep_catalogo
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE somep_catalogo;

-- Creación de la tabla 'peptidos'
CREATE TABLE IF NOT EXISTS peptidos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    subtitulo VARCHAR(250) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    que_es TEXT NOT NULL,
    que_hace_o_estudia TEXT NOT NULL,
    uso_medico TEXT NULL,
    clave TEXT NOT NULL,
    fuente TEXT NULL,
    imagen_url VARCHAR(300) NULL,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_peptido_nombre (nombre),
    INDEX idx_peptido_categoria (categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Precarga Inicial Idempotente (9 Registros Principales + 2 Registros Institucionales SOMEP)
INSERT INTO peptidos (nombre, subtitulo, categoria, que_es, que_hace_o_estudia, uso_medico, clave, fuente, imagen_url, fecha_creacion, fecha_actualizacion)
SELECT * FROM (
    SELECT 
        'Wolverine' AS nombre,
        'El nombre no identifica la fórmula' AS subtitulo,
        'Composición por verificar' AS categoria,
        'Denominación comercial que, por sí sola, no permite establecer la composición exacta del producto. No constituye una entidad química ni farmacológica definida.' AS que_es,
        'Ingredientes, concentraciones, fabricante, pureza, autenticidad y documentación regulatoria del producto que deben verificarse con rigor analítico.' AS que_hace_o_estudia,
        'Ninguno reconocido para esta denominación no regulada ni registrada ante autoridades de salud.' AS uso_medico,
        'Sin una etiqueta verificable y documentación fiable, no debe asumirse que contiene BPC-157 ni atribuirle beneficios específicos.' AS clave,
        'Referencia: denominación de la lista comercial de origen · Revisión técnica y documental SOMEP 2026.' AS fuente,
        '/assets/images/wolverine.jpeg' AS imagen_url,
        NOW() AS fecha_creacion,
        NOW() AS fecha_actualizacion
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM peptidos WHERE LOWER(nombre) = 'wolverine');

INSERT INTO peptidos (nombre, subtitulo, categoria, que_es, que_hace_o_estudia, uso_medico, clave, fuente, imagen_url, fecha_creacion, fecha_actualizacion)
SELECT * FROM (
    SELECT 
        'Vitamina B12' AS nombre,
        'Un nutriente esencial' AS subtitulo,
        'Vitamina y nutriente' AS categoria,
        'Vitamina hidrosoluble esencial (cobalamina) que contiene cobalto en su estructura molecular; no es un péptido.' AS que_es,
        'Participa como cofactor enzimático en la formación de glóbulos rojos (eritropoyesis), la síntesis de ADN, el metabolismo de ácidos grasos y el mantenimiento del sistema nervioso.' AS que_hace_o_estudia,
        'Prevención y tratamiento médico de la deficiencia de cobalamina, anemia perniciosa, neuropatías carenciales y estados de malabsorción gastrointestinal autorizados.' AS uso_medico,
        'Corregir una deficiencia no equivale a proporcionar energía adicional a una persona que ya tiene niveles suficientes.' AS clave,
        'Fuente: NIH (National Institutes of Health) · Office of Dietary Supplements · Ficha informativa de Vitamina B12.' AS fuente,
        '/assets/images/vitamina-b12.jpeg' AS imagen_url,
        NOW() AS fecha_creacion,
        NOW() AS fecha_actualizacion
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM peptidos WHERE LOWER(nombre) = 'vitamina b12');

INSERT INTO peptidos (nombre, subtitulo, categoria, que_es, que_hace_o_estudia, uso_medico, clave, fuente, imagen_url, fecha_creacion, fecha_actualizacion)
SELECT * FROM (
    SELECT 
        'Tirzepatida' AS nombre,
        'Agonista de los receptores GIP y GLP-1' AS subtitulo,
        'Medicamento peptídico' AS categoria,
        'Medicamento peptídico sintético con un residuo diácido graso que actúa como agonista dual sobre vías neuroendocrinas de glucosa y apetito.' AS que_es,
        'Estimulación dependiente de glucosa de la secreción de insulina, disminución del glucagón posprandial y retraso del vaciamiento gástrico.' AS que_hace_o_estudia,
        'Tratamiento de diabetes mellitus tipo 2 y manejo crónico de peso en adultos con obesidad o sobrepeso y factores de riesgo asociados (sujeto a indicación aprobada por FDA, COFEPRIS y EMA).' AS uso_medico,
        'Requiere valoración y prescripción médica. Puede causar efectos gastrointestinales. La autorización no se extiende a cualquier vial vendido con su nombre.' AS clave,
        'Fuente: FDA (U.S. Food and Drug Administration) · Información oficial de prescripción de tirzepatida · COFEPRIS.' AS fuente,
        '/assets/images/tirzepatida.jpeg' AS imagen_url,
        NOW() AS fecha_creacion,
        NOW() AS fecha_actualizacion
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM peptidos WHERE LOWER(nombre) = 'tirzepatida');

INSERT INTO peptidos (nombre, subtitulo, categoria, que_es, que_hace_o_estudia, uso_medico, clave, fuente, imagen_url, fecha_creacion, fecha_actualizacion)
SELECT * FROM (
    SELECT 
        'Semax' AS nombre,
        'Péptido sintético de siete aminoácidos' AS subtitulo,
        'Péptido en investigación' AS categoria,
        'Heptapéptido sintético relacionado con la secuencia ACTH(4-10) enlazada con un tripéptido Pro-Gly-Pro que le confiere resistencia a la degradación enzimática.' AS que_es,
        'Sus posibles efectos sobre la expresión del factor neurotrófico cerebral (BDNF), neuromodulación de neurotransmisores y procesos cognitivos en modelos experimentales.' AS que_hace_o_estudia,
        'Aprobado y registrado en la farmacopea de Rusia para trastornos cerebrovasculares y recuperación neurológica; no cuenta con aprobación de la FDA ni de la EMA.' AS uso_medico,
        'La evidencia disponible no permite garantizar mejoras cognitivas en personas sanas. Existen vacíos de información sobre su seguridad a largo plazo.' AS clave,
        'Fuente: FDA · Evaluación técnica de sustancias no aprobadas (2026) · Registro Oficial de Medicamentos de la Federación Rusa.' AS fuente,
        '/assets/images/semax.jpeg' AS imagen_url,
        NOW() AS fecha_creacion,
        NOW() AS fecha_actualizacion
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM peptidos WHERE LOWER(nombre) = 'semax');

INSERT INTO peptidos (nombre, subtitulo, categoria, que_es, que_hace_o_estudia, uso_medico, clave, fuente, imagen_url, fecha_creacion, fecha_actualizacion)
SELECT * FROM (
    SELECT 
        'Retatrutide' AS nombre,
        'Molécula en investigación clínica' AS subtitulo,
        'Medicamento en investigación' AS categoria,
        'Péptido sintético en investigación que actúa como triple agonista simultáneo de los receptores GIP, GLP-1 y glucagón.' AS que_es,
        'Su eficacia y seguridad en ensayos clínicos avanzados para el manejo de la obesidad severa, diabetes tipo 2 y esteatohepatitis asociada a disfunción metabólica (MASH).' AS que_hace_o_estudia,
        'Ninguno autorizado actualmente. Se encuentra en fase de investigación clínica activa (fase 3).' AS uso_medico,
        'Continúa en investigación. No es un medicamento aprobado por la FDA ni COFEPRIS y no debe presentarse como tratamiento establecido.' AS clave,
        'Fuentes: Eli Lilly and Company & FDA · ClinicalTrials.gov (NCT05882045) · Actualización regulatoria octubre 2026.' AS fuente,
        '/assets/images/retatrutide.jpeg' AS imagen_url,
        NOW() AS fecha_creacion,
        NOW() AS fecha_actualizacion
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM peptidos WHERE LOWER(nombre) = 'retatrutide');

INSERT INTO peptidos (nombre, subtitulo, categoria, que_es, que_hace_o_estudia, uso_medico, clave, fuente, imagen_url, fecha_creacion, fecha_actualizacion)
SELECT * FROM (
    SELECT 
        'NAD' AS nombre,
        'Una coenzima del metabolismo' AS subtitulo,
        'Coenzima' AS categoria,
        'Dinucleótido de nicotinamida y adenina; coenzima celular fundamental de óxido-reducción presente en todas las células; no es un péptido.' AS que_es,
        'Participa en reacciones celulares de transferencia de electrones que permiten obtener y utilizar energía (cadena respiratoria) y actúa como cosustrato para sirtuinas y PARP.' AS que_hace_o_estudia,
        'Terapia de rescate en deficiencia severa de niacina (pelagra). No tiene autorización regulatoria como terapia antienvejecimiento o reconstituyente general.' AS uso_medico,
        'Su función natural no prueba beneficios de las infusiones. La FDA ha recibido reportes de reacciones adversas con NAD+ inyectable.' AS clave,
        'Fuente: FDA · Seguridad y advertencias sobre preparados estériles parenterales · NIH PubChem (CID 5892).' AS fuente,
        '/assets/images/nad.jpeg' AS imagen_url,
        NOW() AS fecha_creacion,
        NOW() AS fecha_actualizacion
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM peptidos WHERE LOWER(nombre) = 'nad');

INSERT INTO peptidos (nombre, subtitulo, categoria, que_es, que_hace_o_estudia, uso_medico, clave, fuente, imagen_url, fecha_creacion, fecha_actualizacion)
SELECT * FROM (
    SELECT 
        'Glutatión' AS nombre,
        'Un tripéptido presente en las células' AS subtitulo,
        'Tripéptido' AS categoria,
        'Tripéptido endógeno de bajo peso molecular sintetizado intracelularmente a partir de glutamato, cisteína y glicina.' AS que_es,
        'Participa de forma prioritaria en la defensa antioxidante celular, la conjugación de xenobióticos y el equilibrio redox celular.' AS que_hace_o_estudia,
        'Coadyuvante farmacéutico aprobado en indicaciones selectas (prevención de neurotoxicidad por quimioterapia con cisplatino en formulaciones hospitalarias). No para aclaramiento cutáneo.' AS uso_medico,
        'Su función natural no garantiza beneficios al inyectarlo. La calidad de las preparaciones estériles es fundamental ante riesgos de contaminación y anafilaxia.' AS clave,
        'Fuentes: NIH PubChem (CID 124882) · FDA Consumer Updates sobre seguridad de inyecciones de glutatión.' AS fuente,
        '/assets/images/glutation.jpeg' AS imagen_url,
        NOW() AS fecha_creacion,
        NOW() AS fecha_actualizacion
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM peptidos WHERE LOWER(nombre) = 'glutatión');

INSERT INTO peptidos (nombre, subtitulo, categoria, que_es, que_hace_o_estudia, uso_medico, clave, fuente, imagen_url, fecha_creacion, fecha_actualizacion)
SELECT * FROM (
    SELECT 
        'Epitalon' AS nombre,
        'Péptido sintético en investigación' AS subtitulo,
        'Péptido en investigación' AS categoria,
        'Tetrapéptido sintético con la secuencia Ala-Glu-Asp-Gly (AEDG), formulado experimentalmente a partir del extracto epifisiario epithalamina.' AS que_es,
        'Procesos biológicos celulares vinculados a la modulación de telomerasa, regulación de ritmos neuroendocrinos y marcadores de senescencia en modelos preclínicos.' AS que_hace_o_estudia,
        'Sin usos médicos aprobados ni autorizaciones de comercialización por FDA, EMA o COFEPRIS.' AS uso_medico,
        'No hay evidencia clínica sólida que permita prometer rejuvenecimiento o mayor longevidad. Su seguridad requiere más investigación.' AS clave,
        'Fuente: FDA · Evaluación técnica de Epitalon (2026) · Estudios experimentales del Instituto de Biogerontología.' AS fuente,
        '/assets/images/epitalon.jpeg' AS imagen_url,
        NOW() AS fecha_creacion,
        NOW() AS fecha_actualizacion
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM peptidos WHERE LOWER(nombre) = 'epitalon');

INSERT INTO peptidos (nombre, subtitulo, categoria, que_es, que_hace_o_estudia, uso_medico, clave, fuente, imagen_url, fecha_creacion, fecha_actualizacion)
SELECT * FROM (
    SELECT 
        'Cerebrolysin' AS nombre,
        'Una mezcla de péptidos y aminoácidos' AS subtitulo,
        'Preparación de péptidos' AS categoria,
        'Preparación biológica obtenida mediante hidrólisis enzimática controlada y estandarizada de proteínas de tejido cerebral porcino purificado.' AS que_es,
        'Se ha evaluado en ensayos clínicos de recuperación neurológica, neuroplasticidad y apoyo tras un accidente cerebrovascular isquémico agudo o traumatismo.' AS que_hace_o_estudia,
        'Aprobado como adyuvante neurológico en más de 40 países de Europa y Asia para secuelas de ictus y demencia vascular. No aprobado por la FDA en Estados Unidos.' AS uso_medico,
        'Estos estudios no demuestran que mejore la memoria de personas sanas. Su evaluación corresponde al especialista.' AS clave,
        'Fuente: ensayo CARS (Cerebrolysin Acute Recovery Study) · PMID 26564102 · Monografía científica de producto.' AS fuente,
        '/assets/images/cerebrolysin.jpeg' AS imagen_url,
        NOW() AS fecha_creacion,
        NOW() AS fecha_actualizacion
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM peptidos WHERE LOWER(nombre) = 'cerebrolysin');

INSERT INTO peptidos (nombre, subtitulo, categoria, que_es, que_hace_o_estudia, uso_medico, clave, fuente, imagen_url, fecha_creacion, fecha_actualizacion)
SELECT * FROM (
    SELECT 
        '5-amino-1MQ' AS nombre,
        'Molécula pequeña en investigación' AS subtitulo,
        'Molécula en investigación' AS categoria,
        'Un inhibidor experimental selectivo de la enzima nicotinamida N-metiltransferasa (NNMT). No es un péptido.' AS que_es,
        'Su relación con el gasto energético metabólico y la composición corporal en modelos animales de laboratorio.' AS que_hace_o_estudia,
        'Ninguno reconocido para uso en seres humanos. Compuesto puramente de investigación básica de laboratorio.' AS uso_medico,
        'Los resultados en ratones no demuestran eficacia ni seguridad en personas.' AS clave,
        'Fuente: investigación preclínica · PMID 39161060 · Biochemical Pharmacology.' AS fuente,
        '/assets/images/5-amino-1mq.jpeg' AS imagen_url,
        NOW() AS fecha_creacion,
        NOW() AS fecha_actualizacion
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM peptidos WHERE LOWER(nombre) = '5-amino-1mq');

INSERT INTO peptidos (nombre, subtitulo, categoria, que_es, que_hace_o_estudia, uso_medico, clave, fuente, imagen_url, fecha_creacion, fecha_actualizacion)
SELECT * FROM (
    SELECT 
        'ARA 290' AS nombre,
        'También llamado cibinetide' AS subtitulo,
        'Péptido en investigación' AS categoria,
        'Un péptido sintético de 11 aminoácidos derivado de la estructura de la hélice B de la eritropoyetina.' AS que_es,
        'Se ha evaluado en pequeños ensayos preliminares sobre neuropatía de fibras pequeñas y modulación del receptor de reparación de tejidos.' AS que_hace_o_estudia,
        'Designación de medicamento huérfano en investigación para sarcoidosis; sin aprobación comercial general.' AS uso_medico,
        'La evidencia es preliminar y no permite prometer regeneración nerviosa.' AS clave,
        'Fuente: Brines et al., 2015 · PMC4365069 · Journal of Translational Medicine.' AS fuente,
        '/assets/images/ara-290.jpeg' AS imagen_url,
        NOW() AS fecha_creacion,
        NOW() AS fecha_actualizacion
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM peptidos WHERE LOWER(nombre) = 'ara 290');
