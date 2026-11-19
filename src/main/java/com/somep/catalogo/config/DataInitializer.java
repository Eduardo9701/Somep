package com.somep.catalogo.config;

import com.somep.catalogo.model.Curso;
import com.somep.catalogo.model.Peptido;
import com.somep.catalogo.model.Usuario;
import com.somep.catalogo.repository.CursoRepository;
import com.somep.catalogo.repository.PeptidoRepository;
import com.somep.catalogo.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

/**
 * Inicializador seguro y reproducible para la carga inicial de los registros
 * científicos, cursos académicos y el usuario administrador inicial en MySQL.
 * Garantiza idempotencia: si los registros ya existen, no los duplica.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);
    private final PeptidoRepository peptidoRepository;
    private final CursoRepository cursoRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(PeptidoRepository peptidoRepository,
                           CursoRepository cursoRepository,
                           UsuarioRepository usuarioRepository,
                           PasswordEncoder passwordEncoder) {
        this.peptidoRepository = peptidoRepository;
        this.cursoRepository = cursoRepository;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        inicializarUsuarioAdmin();
        inicializarCatalogoPeptidos();
        inicializarCursosAcademicos();
    }

    private void inicializarUsuarioAdmin() {
        if (usuarioRepository.count() == 0) {
            String adminUser = System.getenv().getOrDefault("ADMIN_USERNAME", "admin");
            String adminPass = System.getenv().getOrDefault("ADMIN_PASSWORD", "SomepAdmin2026!");
            String adminEmail = System.getenv().getOrDefault("ADMIN_EMAIL", "admin@somep.org.mx");

            Usuario admin = new Usuario(
                    adminUser,
                    passwordEncoder.encode(adminPass),
                    adminEmail,
                    "Administrador General SOMEP",
                    "ROLE_ADMIN"
            );
            admin.setActivo(true);
            usuarioRepository.save(admin);
            log.info("Usuario administrador inicial ({}) creado exitosamente con credenciales protegidas.", adminUser);
        } else {
            log.info("Usuarios administradores existentes verificados: {} registrados.", usuarioRepository.count());
        }
    }

    private void inicializarCatalogoPeptidos() {
        log.info("Verificando catálogo inicial de compuestos en la base de datos...");

        List<Peptido> registrosIniciales = Arrays.asList(
            // Registro 1: Wolverine
            new Peptido(
                "Wolverine",
                "El nombre no identifica la fórmula",
                "Composición por verificar",
                "Denominación comercial que, por sí sola, no permite establecer la composición exacta del producto. No constituye una entidad química ni farmacológica definida.",
                "Ingredientes, concentraciones, fabricante, pureza, autenticidad y documentación regulatoria del producto que deben verificarse con rigor analítico.",
                "Ninguno reconocido para esta denominación no regulada ni registrada ante autoridades de salud.",
                "Sin una etiqueta verificable y documentación fiable, no debe asumirse que contiene BPC-157 ni atribuirle beneficios específicos.",
                "Referencia: denominación de la lista comercial de origen · Revisión técnica y documental SOMEP 2026.",
                "/assets/images/wolverine.jpeg"
            ),

            // Registro 2: Vitamina B12
            new Peptido(
                "Vitamina B12",
                "Un nutriente esencial",
                "Vitamina y nutriente",
                "Vitamina hidrosoluble esencial (cobalamina) que contiene cobalto en su estructura molecular; no es un péptido.",
                "Participa como cofactor enzimático en la formación de glóbulos rojos (eritropoyesis), la síntesis de ADN, el metabolismo de ácidos grasos y el mantenimiento del sistema nervioso.",
                "Prevención y tratamiento médico de la deficiencia de cobalamina, anemia perniciosa, neuropatías carenciales y estados de malabsorción gastrointestinal autorizados.",
                "Corregir una deficiencia no equivale a proporcionar energía adicional a una persona que ya tiene niveles suficientes.",
                "Fuente: NIH (National Institutes of Health) · Office of Dietary Supplements · Ficha informativa de Vitamina B12.",
                "/assets/images/vitamina-b12.jpeg"
            ),

            // Registro 3: Tirzepatida
            new Peptido(
                "Tirzepatida",
                "Agonista de los receptores GIP y GLP-1",
                "Medicamento peptídico",
                "Medicamento peptídico sintético con un residuo diácido graso que actúa como agonista dual sobre vías neuroendocrinas de glucosa y apetito.",
                "Estimulación dependiente de glucosa de la secreción de insulina, disminución del glucagón posprandial y retraso del vaciamiento gástrico.",
                "Tratamiento de diabetes mellitus tipo 2 y manejo crónico de peso en adultos con obesidad o sobrepeso y factores de riesgo asociados (sujeto a indicación aprobada por FDA, COFEPRIS y EMA).",
                "Requiere valoración y prescripción médica. Puede causar efectos gastrointestinales. La autorización no se extiende a cualquier vial vendido con su nombre.",
                "Fuente: FDA (U.S. Food and Drug Administration) · Información oficial de prescripción de tirzepatida · COFEPRIS.",
                "/assets/images/tirzepatida.jpeg"
            ),

            // Registro 4: Semax
            new Peptido(
                "Semax",
                "Péptido sintético de siete aminoácidos",
                "Péptido en investigación",
                "Heptapéptido sintético relacionado con la secuencia ACTH(4-10) enlazada con un tripéptido Pro-Gly-Pro que le confiere resistencia a la degradación enzimática.",
                "Sus posibles efectos sobre la expresión del factor neurotrófico cerebral (BDNF), neuromodulación de neurotransmisores y procesos cognitivos en modelos experimentales.",
                "Aprobado y registrado en la farmacopea de Rusia para trastornos cerebrovasculares y recuperación neurológica; no cuenta con aprobación de la FDA ni de la EMA.",
                "La evidencia disponible no permite garantizar mejoras cognitivas en personas sanas. Existen vacíos de información sobre su seguridad a largo plazo.",
                "Fuente: FDA · Evaluación técnica de sustancias no aprobadas (2026) · Registro Oficial de Medicamentos de la Federación Rusa.",
                "/assets/images/semax.jpeg"
            ),

            // Registro 5: Retatrutide
            new Peptido(
                "Retatrutide",
                "Molécula en investigación clínica",
                "Medicamento en investigación",
                "Péptido sintético en investigación que actúa como triple agonista simultáneo de los receptores GIP, GLP-1 y glucagón.",
                "Su eficacia y seguridad en ensayos clínicos avanzados para el manejo de la obesidad severa, diabetes tipo 2 y esteatohepatitis asociada a disfunción metabólica (MASH).",
                "Ninguno autorizado actualmente. Se encuentra en fase de investigación clínica activa (fase 3).",
                "Continúa en investigación. No es un medicamento aprobado por la FDA ni COFEPRIS y no debe presentarse como tratamiento establecido.",
                "Fuentes: Eli Lilly and Company & FDA · ClinicalTrials.gov (NCT05882045) · Actualización regulatoria octubre 2026.",
                "/assets/images/retatrutide.jpeg"
            ),

            // Registro 6: NAD
            new Peptido(
                "NAD",
                "Una coenzima del metabolismo",
                "Coenzima",
                "Dinucleótido de nicotinamida y adenina; coenzima celular fundamental de óxido-reducción presente en todas las células; no es un péptido.",
                "Participa en reacciones celulares de transferencia de electrones que permiten obtener y utilizar energía (cadena respiratoria) y actúa como cosustrato para sirtuinas y PARP.",
                "Terapia de rescate en deficiencia severa de niacina (pelagra). No tiene autorización regulatoria como terapia antienvejecimiento o reconstituyente general.",
                "Su función natural no prueba beneficios de las infusiones. La FDA ha recibido reportes de reacciones adversas con NAD+ inyectable.",
                "Fuente: FDA · Seguridad y advertencias sobre preparados estériles parenterales · NIH PubChem (CID 5892).",
                "/assets/images/nad.jpeg"
            ),

            // Registro 7: Glutatión
            new Peptido(
                "Glutatión",
                "Un tripéptido presente en las células",
                "Tripéptido",
                "Tripéptido endógeno de bajo peso molecular sintetizado intracelularmente a partir de glutamato, cisteína y glicina.",
                "Participa de forma prioritaria en la defensa antioxidante celular, la conjugación de xenobióticos y el equilibrio redox celular.",
                "Coadyuvante farmacéutico aprobado en indicaciones selectas (prevención de neurotoxicidad por quimioterapia con cisplatino en formulaciones hospitalarias). No para aclaramiento cutáneo.",
                "Su función natural no garantiza beneficios al inyectarlo. La calidad de las preparaciones estériles es fundamental ante riesgos de contaminación y anafilaxia.",
                "Fuentes: NIH PubChem (CID 124882) · FDA Consumer Updates sobre seguridad de inyecciones de glutatión.",
                "/assets/images/glutation.jpeg"
            ),

            // Registro 8: Epitalon
            new Peptido(
                "Epitalon",
                "Péptido sintético en investigación",
                "Péptido en investigación",
                "Tetrapéptido sintético con la secuencia Ala-Glu-Asp-Gly (AEDG), formulado experimentalmente a partir del extracto epifisiario epithalamina.",
                "Procesos biológicos celulares vinculados a la modulación de telomerasa, regulación de ritmos neuroendocrinos y marcadores de senescencia en modelos preclínicos.",
                "Sin usos médicos aprobados ni autorizaciones de comercialización por FDA, EMA o COFEPRIS.",
                "No hay evidencia clínica sólida que permita prometer rejuvenecimiento o mayor longevidad. Su seguridad requiere más investigación.",
                "Fuente: FDA · Evaluación técnica de Epitalon (2026) · Estudios experimentales del Instituto de Biogerontología.",
                "/assets/images/epitalon.jpeg"
            ),

            // Registro 9: Cerebrolysin
            new Peptido(
                "Cerebrolysin",
                "Una mezcla de péptidos y aminoácidos",
                "Preparación de péptidos",
                "Preparación biológica obtenida mediante hidrólisis enzimática controlada y estandarizada de proteínas de tejido cerebral porcino purificado.",
                "Se ha evaluado en ensayos clínicos de recuperación neurológica, neuroplasticidad y apoyo tras un accidente cerebrovascular isquémico agudo o traumatismo.",
                "Aprobado como adyuvante neurológico en más de 40 países de Europa y Asia para secuelas de ictus y demencia vascular. No aprobado por la FDA en Estados Unidos.",
                "Estos estudios no demuestran que mejore la memoria de personas sanas. Su evaluación corresponde al especialista.",
                "Fuente: ensayo CARS (Cerebrolysin Acute Recovery Study) · PMID 26564102 · Monografía científica de producto.",
                "/assets/images/cerebrolysin.jpeg"
            ),

            // Registro complementario 10: 5-amino-1MQ
            new Peptido(
                "5-amino-1MQ",
                "Molécula pequeña en investigación",
                "Molécula en investigación",
                "Un inhibidor experimental selectivo de la enzima nicotinamida N-metiltransferasa (NNMT). No es un péptido.",
                "Su relación con el gasto energético metabólico y la composición corporal en modelos animales de laboratorio.",
                "Ninguno reconocido para uso en seres humanos. Compuesto puramente de investigación básica de laboratorio.",
                "Los resultados en ratones no demuestran eficacia ni seguridad en personas.",
                "Fuente: investigación preclínica · PMID 39161060 · Biochemical Pharmacology.",
                "/assets/images/5-amino-1mq.jpeg"
            ),

            // Registro complementario 11: ARA 290
            new Peptido(
                "ARA 290",
                "También llamado cibinetide",
                "Péptido en investigación",
                "Un péptido sintético de 11 aminoácidos derivado de la estructura de la hélice B de la eritropoyetina.",
                "Se ha evaluado en pequeños ensayos preliminares sobre neuropatía de fibras pequeñas y modulación del receptor de reparación de tejidos.",
                "Designación de medicamento huérfano en investigación para sarcoidosis; sin aprobación comercial general.",
                "La evidencia es preliminar y no permite prometer regeneración nerviosa.",
                "Fuente: Brines et al., 2015 · PMC4365069 · Journal of Translational Medicine.",
                "/assets/images/ara-290.jpeg"
            )
        );

        int nuevos = 0;
        for (Peptido p : registrosIniciales) {
            if (peptidoRepository.findByNombreIgnoreCase(p.getNombre()).isEmpty()) {
                peptidoRepository.save(p);
                nuevos++;
            }
        }

        log.info("Inicialización completada: {} nuevos compuestos registrados. Total en base de datos: {}",
                nuevos, peptidoRepository.count());
    }

    private void inicializarCursosAcademicos() {
        if (cursoRepository.count() == 0) {
            log.info("Cargando programas académicos iniciales en la base de datos...");

            List<Curso> cursosIniciales = Arrays.asList(
                // 1. Diplomado Internacional (curso)
                new Curso(
                    "curso",
                    "Curso con Constancia",
                    "Inscripciones Abiertas",
                    "Diplomado Internacional en Terapéutica Peptídica y Bioquímica Celular",
                    "60 Horas Académicas",
                    "Modalidad Online Asíncrona + Tutoría",
                    "Formación exhaustiva sobre la bioquímica y farmacocinética de péptidos bioactivos, receptores hormonales acoplados a proteínas G, cascadas de señalización y análisis crítico de la literatura preclínica y clínica internacional.",
                    "Acreditación SOMEP: Constancia con folio de registro institucional único, desglose curricular de horas crédito y verificación digital QR.",
                    "https://wa.me/525579247494?text=Hola%20SOMEP%2C%20solicito%20informaci%C3%B3n%20sobre%20el%20Diplomado%20Internacional%20en%20Terap%C3%A9utica%20Pept%C3%ADdica",
                    "Solicitar Programa e Inscripción",
                    "/assets/images/curso-peptidos.jpg",
                    1,
                    true
                ),
                // 2. Seminario Avanzado (seminario)
                new Curso(
                    "seminario",
                    "Seminario Clínico",
                    "Próxima Edición",
                    "Seminario Avanzado: Agonistas GLP-1 / GIP / Glucagón y Nuevas Moléculas Metabólicas",
                    "16 Horas Teórico-Prácticas",
                    "Sesiones en Vivo con Expertos",
                    "Actualización profunda sobre tirzepatida, retatrutide e incretinas sintéticas. Revisión de mecanismos fisiopatológicos, perfiles de seguridad, manejo de reacciones adversas y marco regulatorio vigente ante COFEPRIS y FDA.",
                    "Acreditación SOMEP: Constancia institucional de actualización médica continua con evaluación de casos y constancia foliada.",
                    "https://wa.me/525579247494?text=Hola%20SOMEP%2C%20solicito%20informaci%C3%B3n%20sobre%20el%20Seminario%20de%20Agonistas%20GLP-1%20y%20GIP",
                    "Solicitar Programa e Inscripción",
                    "/assets/images/seminario-metabolico.jpg",
                    2,
                    true
                ),
                // 3. Simposio Nacional (conferencia)
                new Curso(
                    "conferencia",
                    "Simposio Nacional",
                    "Convocatoria 2026",
                    "I Simposio Nacional SOMEP: Fronteras Científicas en Péptidos y Medicina de Precisión",
                    "Híbrido: CDMX & Streaming",
                    "Mesas de Diálogo y Vinculación",
                    "El evento magno de vinculación científica. Conferencias magistrales con investigadores y docentes sobre neuroprotección (Semax, Cerebrolysin), equilibrio redox (Glutatión, NAD) y el futuro del portafolio documentado en México.",
                    "Acreditación SOMEP: Constancia oficial de asistencia institucional con código QR y valor curricular para miembros de la sociedad.",
                    "https://wa.me/525579247494?text=Hola%20SOMEP%2C%20solicito%20informaci%C3%B3n%20para%20asistir%20al%20I%20Simposio%20Nacional%20SOMEP",
                    "Reservar Lugar / Información",
                    "/assets/images/conferencia-anual.jpg",
                    3,
                    true
                )
            );

            cursoRepository.saveAll(cursosIniciales);
            log.info("Inicialización de cursos completada: {} programas registrados exitosamente.", cursosIniciales.size());
        } else {
            log.info("Cursos académicos existentes en base de datos: {} registrados.", cursoRepository.count());
        }
    }
}
