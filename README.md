# SOMEP — Sociedad Mexicana de Péptidos
## Catálogo Interactivo y Glosario Médico-Educativo de Péptidos y Moléculas

[![Java 21](https://img.shields.io/badge/Java-21%20LTS-007396?logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.5-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![HTML5 & Vanilla JS](https://img.shields.io/badge/Frontend-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/)

Aplicación web educativa desarrollada con arquitectura cliente-servidor para la **SOMEP (Sociedad Mexicana de Péptidos)**. Funciona como un catálogo digital y glosario médico-educativo que permite consultar fichas científicas rigurosas sobre péptidos, moléculas pequeñas, coenzimas, nutrientes y formulaciones en investigación.

---

## 🏛️ 1. Identidad Visual Institucional

El diseño sigue una línea sobria, moderna y científica, inspirada en la identidad de SOMEP:

- **Púrpura Institucional (`#4A154B`):** Predomina en encabezados, identidad de marca y elementos institucionales.
- **Verde Institucional (`#006847`):** Empleado en subtítulos, indicadores activos y contrastes positivos.
- **Dorado / Ocre (`#C5A059`):** Reservado para líneas de acento, bordes de advertencia y detalles de jerarquía.
- **Fondo General (`#FAF9F6`):** Tono cálido de baja fatiga visual.
- **Superficies (`#FFFFFF`):** Tarjetas y modales con elevación sutil.

### Aviso Médico Obligatorio
En cumplimiento estricto con los lineamientos de SOMEP, la aplicación exhibe de forma prominente en el cintillo superior, en el pie de página y en las fichas ampliadas el texto:
> **“Información educativa. No sustituye una valoración médica.”**

---

## ⚙️ 2. Arquitectura de la Solución

```
SOMEP-Catalogo/
├── database/
│   └── init.sql                  # Script DDL/DML de MySQL reproducible
├── src/
│   ├── main/
│   │   ├── java/com/somep/catalogo/
│   │   │   ├── config/           # DataInitializer (precarga sin duplicados)
│   │   │   ├── controller/       # PeptidoController (Endpoints REST)
│   │   │   ├── dto/              # PeptidoResponse (Transferencia de datos)
│   │   │   ├── exception/        # GlobalExceptionHandler y ErrorResponse
│   │   │   ├── model/            # Peptido (Entidad JPA relacional)
│   │   │   ├── repository/       # PeptidoRepository (Spring Data JPA)
│   │   │   ├── service/          # PeptidoService y PeptidoServiceImpl
│   │   │   └── SomepCatalogoApplication.java # Clase principal Spring Boot
│   │   └── resources/
│   │       ├── application.properties # Configuración de conexión y puertos
│   │       └── static/           # Frontend servido directamente desde Spring Boot
│   │           ├── index.html    # HTML5 semántico
│   │           ├── css/styles.css # CSS3 puro (variables, Grid, Flexbox, accesibilidad)
│   │           ├── js/app.js     # JavaScript vanilla ES6+ (Fetch, estados, modales)
│   │           └── assets/       # Logotipo oficial e infografías originales
│   └── test/                     # Pruebas unitarias e integración con MockMvc y H2
├── .env.example                  # Plantilla de variables de entorno
├── pom.xml                       # Descriptor Maven de dependencias
└── README.md                     # Documentación completa del proyecto
```

---

## 📋 3. Requisitos Previos

1. **Java JDK 21 LTS** instalado y configurado en el `PATH` (`java -version`).
2. **Apache Maven 3.9+** instalado (`mvn -version`).
3. **MySQL Server 8.0+** en ejecución local o remota en el puerto `3306`.

---

## 🗄️ 4. Configuración de Base de Datos MySQL

### Paso 1: Crear la base de datos
Abra su cliente de MySQL o Workbench y ejecute:

```sql
CREATE DATABASE IF NOT EXISTS somep_catalogo 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;
```

*(Opcional: Si desea cargar las tablas manualmente, ejecute el script `database/init.sql`. De no hacerlo, Spring Boot creará el esquema y cargará automáticamente los registros iniciales mediante el `DataInitializer` al arrancar).*

### Paso 2: Configuración de Credenciales
Por defecto, la aplicación lee los siguientes parámetros de `src/main/resources/application.properties` o variables de entorno:

| Variable | Valor por defecto | Descripción |
| :--- | :--- | :--- |
| `DB_URL` | `jdbc:mysql://localhost:3306/somep_catalogo?...` | Cadena de conexión JDBC |
| `DB_USERNAME` | `root` | Usuario de MySQL |
| `DB_PASSWORD` | `sasa1234` | Contraseña del usuario |
| `SERVER_PORT` | `8080` | Puerto del servidor web |

Puede sobrescribir cualquier valor exportando la variable en su consola:
```powershell
# En Windows PowerShell
$env:DB_USERNAME="mi_usuario"
$env:DB_PASSWORD="mi_password_seguro"
```

---

## 🚀 5. Compilación y Ejecución

### Opción A: Ejecutar con Maven en desarrollo
```powershell
mvn clean spring-boot:run
```

### Opción B: Empaquetar y ejecutar como JAR autónomo
```powershell
mvn clean package
java -jar target/somep-catalogo-1.0.0.jar
```

Una vez iniciado el servidor, abra su navegador web en:
👉 **[http://localhost:8080](http://localhost:8080)**

---

## 📡 6. Especificación de la API REST

Todos los endpoints devuelven respuestas en formato `application/json` con codificación UTF-8.

### 1. Listar Catálogo General
`GET /api/peptidos`
Devuelve la lista completa de compuestos ordenados alfabéticamente.

### 2. Filtrar por Categoría
`GET /api/peptidos?categoria={nombre_categoria}`
- Ejemplo: `GET /api/peptidos?categoria=Medicamento peptídico`

### 3. Búsqueda en Tiempo Real
`GET /api/peptidos?buscar={texto}`
- Realiza búsquedas sin distinción de mayúsculas/minúsculas en el nombre, subtítulo, categoría, mecanismo, punto clave y definición.
- Ejemplo: `GET /api/peptidos?buscar=insulina`

### 4. Combinar Búsqueda y Filtro
`GET /api/peptidos?categoria=Péptido en investigación&buscar=telomerasa`

### 5. Consultar Detalle por ID
`GET /api/peptidos/{id}`
- Si el ID existe: `200 OK` con el objeto del compuesto.
- Si el ID no existe: `404 Not Found` con mensaje estructurado.

#### Ejemplo de Respuesta `200 OK` (`/api/peptidos/3`):
```json
{
  "id": 3,
  "nombre": "Tirzepatida",
  "subtitulo": "Agonista de los receptores GIP y GLP-1",
  "categoria": "Medicamento peptídico",
  "queEs": "Medicamento peptídico sintético con un residuo diácido graso que actúa como agonista dual sobre vías neuroendocrinas de glucosa y apetito.",
  "queHaceOEstudia": "Estimulación dependiente de glucosa de la secreción de insulina, disminución del glucagón posprandial y retraso del vaciamiento gástrico.",
  "usoMedico": "Tratamiento de diabetes mellitus tipo 2 y manejo crónico de peso en adultos con obesidad o sobrepeso y factores de riesgo asociados (sujeto a indicación aprobada por FDA, COFEPRIS y EMA).",
  "clave": "Requiere valoración y prescripción médica. Puede causar efectos gastrointestinales. La autorización no se extiende a cualquier vial vendido con su nombre.",
  "fuente": "Fuente: FDA (U.S. Food and Drug Administration) · Información oficial de prescripción de tirzepatida · COFEPRIS.",
  "imagenUrl": "/assets/images/tirzepatida.jpeg",
  "fechaCreacion": "2026-10-26T10:14:00",
  "fechaActualizacion": "2026-10-26T10:14:00"
}
```

### 6. Listar Categorías Disponibles
`GET /api/peptidos/categorias`
Devuelve la lista de categorías científicas indexadas actualmente en la base de datos para la generación dinámica de filtros.

---

## 🧪 7. Pruebas Automatizadas

El proyecto incluye pruebas unitarias para la capa de servicios (`PeptidoServiceTest`) y pruebas de integración web slice para los controladores (`PeptidoControllerTest`) utilizando Mockito, MockMvc y base de datos H2 en memoria.

Para ejecutar la suite de pruebas:
```powershell
mvn test
```

---

## 📚 8. Compuestos Iniciales Indexados

1. **Wolverine:** *Composición por verificar* — Advertencia sobre denominaciones comerciales sin fórmula comprobable.
2. **Vitamina B12:** *Vitamina y nutriente* — Nutriente hidrosoluble esencial, diferenciado claramente de un péptido.
3. **Tirzepatida:** *Medicamento peptídico* — Fármaco con autorización regulatoria específica y supervisión médica estricta.
4. **Semax:** *Péptido en investigación* — Heptapéptido con evidencia preliminar y limitaciones de seguridad.
5. **Retatrutide:** *Medicamento en investigación* — Molécula triple agonista en ensayos clínicos de fase 3.
6. **NAD:** *Coenzima* — Dinucleótido metabólico celular; advertencia sobre infusiones no estandarizadas.
7. **Glutatión:** *Tripéptido* — Antioxidante endógeno; relevancia de la esterilidad y vía de administración.
8. **Epitalon:** *Péptido en investigación* — Tetrapéptido experimental sobre senescencia celular.
9. **Cerebrolysin:** *Preparación de péptidos* — Derivado porcino para indicaciones neurológicas específicas.
10. **5-amino-1MQ:** *Molécula en investigación* — Inhibidor experimental de NNMT en modelos preclínicos.
11. **ARA 290:** *Péptido en investigación* — Derivado de eritropoyetina en estudio para neuropatías.

---

## 📞 9. Información de Contacto y Vinculación SOMEP
- **Línea de Vinculación:** 55 7924 7494
- **Comunidad y Membresías:** República Mexicana y Latinoamérica
- **Propósito:** Conectar conocimiento científico, formación continua y acceso profesional documentado.
