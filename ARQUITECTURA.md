# NERO Automóviles — arquitectura propuesta

Estado: propuesta para revisión previa al desarrollo funcional.

## 1. Alcance de la primera versión

Aplicación web en español de Uruguay, responsive, con catálogo real, fichas individuales, recepción persistente de solicitudes y panel privado. NERO actúa como intermediario; el vehículo permanece con su propietario. No se cargarán vehículos de demostración, testimonios, cifras comerciales ni contactos ficticios.

Instagram confirmado: https://www.instagram.com/nero.automoviles/

El lanzamiento dará prioridad a captar vehículos con «Vendé tu auto con NERO». El catálogo vacío tendrá una presentación intencional y acceso al formulario de venta.

## 2. Stack propuesto

| Capa | Elección | Motivo |
| --- | --- | --- |
| Interfaz y páginas | React + TypeScript, Vinext con convenciones App Router | Componentes compartidos, rutas individuales y renderizado en servidor |
| Estilos y controles | Tailwind CSS y componentes accesibles Shadcn | Identidad consistente y controles reutilizables |
| Servidor | Rutas de servidor en Cloudflare Workers mediante Sites | Una aplicación con validación y autorización centralizadas |
| Datos | Cloudflare D1 (SQLite), consultas parametrizadas | Persistencia relacional y búsquedas indexadas |
| Migraciones | Drizzle | Evolución versionada del esquema |
| Fotografías | Cloudflare R2 | Archivos separados de los datos comerciales |
| Acceso administrativo | Login propio de NERO con PBKDF2 y sesión firmada | Un administrador inicial, contraseña sin texto plano y acceso limitado por cookie segura |
| Alojamiento inicial | Sites, con revisión privada antes de lanzamiento público | Validar la aplicación sin exponer solicitudes ni un sitio sin revisar |

El acceso administrativo usa `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` y `ADMIN_SESSION_SECRET` como secretos del servidor. Los visitantes no necesitan iniciar sesión para consultar o enviar solicitudes.

Vinext es la base que proporciona Sites y su versión instalada está identificada como beta. Mantendremos versiones fijadas, pruebas de los flujos críticos y la lógica comercial separada del framework. D1 es adecuado para este alcance; una futura migración a PostgreSQL requerirá adaptar el repositorio de datos y las migraciones, no rehacer la interfaz.

## 3. Páginas públicas

| Ruta | Contenido |
| --- | --- |
| `/` | Hero, servicios, captación de vendedores, cómo funciona y confianza |
| `/vehiculos` | Catálogo, filtros, orden y paginación; estado vacío real |
| `/vehiculos/[slug]` | Galería, información del vehículo, consulta y oferta |
| `/vende-tu-auto` | Servicio, explicación del proceso y formulario con fotografías |
| `/buscamos-tu-auto` | Preferencias, presupuesto y solicitud de búsqueda |
| `/contacto` | Formulario e Instagram; WhatsApp y email solo cuando existan |
| `/condiciones` | Condiciones de solicitud revisadas por NERO |
| `/privacidad` | Información sobre tratamiento y conservación de datos definida con NERO |

Las condiciones explicarán que enviar una solicitud no publica el auto ni formaliza automáticamente un acuerdo de intermediación. No se inventarán porcentajes, precios ni condiciones comerciales todavía no definidos. Los textos legales definitivos quedan pendientes de revisión antes de la apertura pública.

## 4. Panel privado

Ruta `/admin`, sin enlace en la navegación pública. Ocultar el enlace no es una medida de seguridad: cada página y operación verificará identidad y rol en el servidor.

- **Vehículos:** crear, editar, eliminar con confirmación, publicar, despublicar, reservar y marcar vendido. Gestionar y reordenar fotografías.
- **Solicitudes de venta:** consultar datos privados, fotos y fecha; aceptar, rechazar, registrar contacto y convertir en borrador.
- **Solicitudes de búsqueda:** nueva, contactado, buscando, opciones enviadas y finalizada.
- **Consultas:** revisar motivo, mensaje, vehículo asociado y oferta cuando corresponda; marcar nueva, contactada o cerrada.

No habrá registro público de administradores ni asignación de permisos al primer usuario que se conecte. El administrador inicial se habilitará mediante una configuración controlada de identidad. Un usuario autenticado que no esté autorizado recibirá una denegación de acceso.

## 5. Modelo de datos

Todos los registros tendrán identificador estable y fechas de creación/actualización. Las relaciones usarán claves foráneas. Los precios se guardarán como enteros en unidades mínimas con moneda explícita, nunca como números flotantes.

| Entidad | Campos y responsabilidad |
| --- | --- |
| `admins` | Identidad externa única, rol, habilitado; sin contraseñas |
| `vehicles` | Slug único, marca, modelo, versión, año, precio, moneda, kilómetros, combustible, transmisión, motor, departamento, ciudad, color, puertas, estado general, descripción, equipamiento, información adicional y estado de publicación |
| `vehicle_images` | Vehículo, clave del objeto R2, formato, tamaño, orden y texto alternativo |
| `seller_requests` | Datos privados del solicitante, datos del vehículo, estado, aceptación de condiciones y versión aceptada, referencia al borrador resultante |
| `seller_request_images` | Solicitud, clave privada del objeto, formato, tamaño y orden |
| `buyer_requests` | Contacto privado, preferencias, presupuestos, año mínimo, kilómetros máximos, ubicación, alcance nacional, comentarios y estado |
| `inquiries` | Contacto privado, motivo, mensaje, vehículo opcional, oferta opcional y estado |
| `audit_events` | Administrador, acción, registro afectado y fecha; sin duplicar datos privados innecesarios |
| `rate_limits` | Contadores de solicitudes con vencimiento para reducir abuso de endpoints públicos |

Los datos personales no se guardarán dentro del contenido público del vehículo. La API pública devolverá una lista explícita de campos permitidos, nunca el registro privado completo.

Índices iniciales: slug único; estado/fecha del catálogo; estado/marca/año; relaciones de imágenes; estados/fechas de las solicitudes. La paginación limitará el volumen de datos leído y enviado.

## 6. Flujo de venta y publicación

1. El propietario completa los campos, adjunta imágenes y acepta las condiciones.
2. El servidor valida información y archivos, limita abuso y guarda una solicitud **PENDIENTE**.
3. La confirmación se muestra únicamente después de guardar correctamente. Un error conserva el formulario y ofrece reintentar.
4. Un administrador revisa y acepta o rechaza. Aceptar no publica.
5. «Convertir en borrador» crea un vehículo **BORRADOR** y relaciona la solicitud. Repetir la acción no genera duplicados.
6. El administrador revisa texto, fotografías y datos públicos antes de publicar.
7. Solo **PUBLICADO** y **RESERVADO** aparecen como opciones en el catálogo. **VENDIDO** deja de aparecer entre disponibles; su ficha puede conservarse identificada como vendida y sin oferta activa. **BORRADOR** nunca es público.

No habrá envíos automáticos por Instagram, WhatsApp o email en esta etapa. «Contactar» abrirá el canal real del solicitante cuando corresponda; los cambios de estado se registrarán por separado.

## 7. Fotografías y privacidad

- Múltiples archivos JPEG, PNG o WebP, con límites definidos tanto en interfaz como en servidor.
- Propuesta inicial: hasta 12 imágenes por vehículo, hasta 5 MB por imagen y un límite total por solicitud.
- Comprobar contenido real y tipo de archivo; rechazar SVG y archivos que no sean imágenes válidas.
- Preparar versiones de tamaño adecuado y eliminar metadatos de ubicación antes de servir imágenes públicas.
- Fotos de solicitudes accesibles solo al administrador. No basta con una URL difícil de adivinar.
- Entrega pública de imágenes condicionada al estado público del vehículo asociado.
- No exponer dirección exacta, teléfono, email ni nombres de propietarios.
- Subida por archivo con control de concurrencia para no cargar una solicitud completa en memoria del servidor.
- Limpieza de cargas incompletas y tratamiento de fallos entre almacenamiento y base de datos.

## 8. Validación y seguridad

- Autorización de servidor en todas las operaciones administrativas y acceso a archivos privados.
- Validación de campos, longitud y rangos en servidor; presupuesto mínimo no superior al máximo.
- Consultas SQL parametrizadas y transacciones por lotes para cambios relacionados.
- Protección de escrituras contra solicitudes entre orígenes no autorizados.
- Límites de frecuencia, tamaño de cuerpo y cantidad de archivos; campo trampa antispam en formularios públicos.
- No renderizar HTML aportado por usuarios.
- Errores públicos comprensibles sin consultas SQL, secretos ni datos personales.
- Secretos solo en configuración de servidor, excluidos de Git y del navegador.
- Confirmación antes de eliminaciones y registro de acciones administrativas relevantes.

## 9. Diseño y experiencia

Negro predominante, blanco y plata; tipografía clara, títulos amplios, composición sobria y transiciones breves. La identidad se apoyará en el contenido y los servicios desde el primer día, sin depender de un catálogo poblado.

El logo original no fue adjuntado. No se reconstruirá ni se presentará una N inventada como el logo oficial. Se usará temporalmente el nombre tipográfico y se incorporará el archivo real al recibirlo.

Si se utiliza una imagen editorial de automóviles, será claramente decorativa y no se presentará como vehículo a la venta, stock propio o local de NERO.

Formularios con secciones comprensibles, etiquetas visibles, errores junto al campo, estados de envío y confirmación. Navegación con teclado, foco visible, contraste suficiente y respeto por la preferencia de movimiento reducido. Diseño móvil desde el inicio.

## 10. SEO y configuración

Metadata renderizada en servidor, títulos y descripciones por ruta, Open Graph, favicon, URLs canónicas al configurar el origen real, sitemap solo con páginas públicas y fichas publicables, y robots que excluya administración. La exclusión de robots no sustituye la autorización.

Configuración prevista:

- URL de producción/dominio: pendiente.
- Instagram: `https://www.instagram.com/nero.automoviles/`.
- WhatsApp Business: sin valor hasta recibir número real.
- Email comercial: sin valor hasta recibir dirección real.
- Identidades administrativas autorizadas: pendientes de configuración controlada.

Sin WhatsApp, la consulta se guarda en `inquiries`. Cuando se configure, el botón podrá abrir un mensaje con modelo y enlace de la ficha usando valores codificados correctamente.

## 11. Orden de implementación

1. Revisar esta arquitectura y decisiones de acceso administrativo.
2. Implementar esquema, migraciones, autorización y capa de datos.
3. Construir inicio, navegación, catálogo vacío y formularios persistentes.
4. Implementar administración, carga de imágenes y publicación explícita.
5. Completar fichas, filtros, consultas, SEO y estados responsive.
6. Ejecutar pruebas funcionales y de autorización; preparar revisión privada.
7. Incorporar logo/contactos reales, revisar textos de condiciones y privacidad, y definir apertura pública.

## 12. Criterios de aceptación

- Enviar una solicitud de venta con fotos, volver a abrir el panel y comprobar que sigue guardada.
- La solicitud no aparece en el catálogo; convertirla produce solo un borrador incluso al repetir la operación.
- Publicar, reservar, vender y despublicar actualiza correctamente catálogo, ficha e imágenes accesibles.
- Crear y editar vehículos desde administración, cambiar el orden de fotos y confirmar persistencia.
- Solicitudes de búsqueda y consultas llegan al panel, conservan todos los campos y admiten sus cambios de estado.
- Visitantes anónimos y usuarios sin rol no pueden leer solicitudes, ver fotos privadas ni modificar datos.
- Validaciones rechazan archivos inválidos, cargas excesivas y rangos incoherentes.
- Filtros y orden funcionan con datos de prueba aislados que se eliminan antes de entregar; no se publican autos ficticios.
- Los recorridos principales funcionan en móvil, tablet y escritorio; no hay desbordes ni controles inaccesibles.
- El build de producción y las migraciones pasan; se prueba persistencia real del entorno desplegado.

## 13. Estado del repositorio

Se generó la estructura inicial de Sites con módulos de interfaz, datos, archivos y autenticación y finalizó la instalación de dependencias. Esto todavía no constituye una aplicación funcional ni una web publicada. El instalador informó incompatibilidad con el Node 20 del sistema y 14 alertas de dependencias (6 moderadas y 8 altas): antes de validar la aplicación habrá que usar un runtime compatible y revisar las alertas, sin aplicar actualizaciones forzadas a ciegas.
