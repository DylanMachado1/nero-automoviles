# NERO Automóviles

Plataforma comercial de [NERO Automóviles](https://www.instagram.com/nero.automoviles/), un servicio uruguayo de intermediación digital de vehículos.

El propietario conserva el vehículo, decide si acepta o rechaza ofertas y puede seguir vendiéndolo por su cuenta. NERO prepara su presentación, promociona la gestión, recibe consultas, filtra interesados y acompaña la negociación. No existe costo inicial ni exclusividad. La comisión es del 4% del valor total acordado de la operación únicamente cuando la venta se concreta con un comprador conseguido o gestionado por NERO; si existe una permuta, esa base incluye el efectivo y el valor atribuido al vehículo entregado. El pago del vehículo se realiza directamente entre comprador y propietario.

El sitio está preparado para operar sin inventar stock, resultados comerciales, oficinas ni verificaciones. Los vehículos aparecen en el catálogo únicamente cuando un administrador cambia su estado a `PUBLICADO`.

## Funcionalidad

- Sitio responsive con identidad negra, blanca y plata, logo oficial, navegación móvil, animaciones sutiles y `prefers-reduced-motion`.
- Home orientada a captar propietarios y compradores, con el modelo comercial explicado en lenguaje directo.
- Formularios persistentes para vender un auto, solicitar una búsqueda y realizar consultas u ofertas.
- Datos privados del propietario separados de la futura publicación pública, incluido el precio mínimo y si representa un precio total de venta o el neto esperado después de la comisión.
- Hasta 12 fotografías por solicitud o vehículo, con validación real de JPEG, PNG y WebP, límite de 3 MB por archivo y almacenamiento privado en R2.
- Catálogo con filtros por URL, orden, estado vacío y fichas dinámicas con galería, información declarada, revisión NERO, consulta y oferta.
- Hasta tres vehículos destacados en la home cuando existan publicaciones reales; la sección se oculta mientras el catálogo esté vacío.
- Panel privado con login propio de NERO, sesión firmada, métricas reales, flujos de estados y CRUD de vehículos.
- Conversión idempotente de una solicitud aceptada a vehículo `BORRADOR`, sin publicación automática.
- D1 para datos estructurados, R2 para archivos, rate limiting y auditoría administrativa.
- SEO por página, metadata dinámica para vehículos, sitemap, robots, Open Graph, Twitter Card, favicon y 404 propia.

## Requisitos

- Node.js 22.13 o posterior.
- npm.
- Acceso al proyecto de Sites correspondiente para usar D1, R2 y el panel protegido.

## Instalación y desarrollo

```bash
npm ci
cp .env.example .env.local
npm run dev
```

No agregues secretos al repositorio.

## Variables de entorno

| Variable | Obligatoria | Uso |
| --- | --- | --- |
| `ADMIN_EMAIL` | Sí | Correo del único administrador inicial. Solo se comprueba en el servidor. |
| `ADMIN_PASSWORD_HASH` | Sí | Hash PBKDF2-SHA256 de la contraseña. Nunca se guarda la contraseña en texto plano. |
| `ADMIN_SESSION_SECRET` | Sí | Secreto aleatorio de al menos 32 caracteres para firmar las sesiones. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | No | Número internacional, solo dígitos. Si falta, no aparece el botón de WhatsApp. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | No | Email comercial visible en contacto y privacidad. Si falta, se muestra solamente Instagram. |

No se incluyen valores predeterminados para WhatsApp o email porque deben corresponder a canales confirmados por NERO.

## Datos y privacidad

El esquema está en `db/schema.ts` y las migraciones versionadas en `drizzle/`. Las nuevas migraciones se generan con:

```bash
npm run db:generate
```

Sites aplica las migraciones incluidas durante el despliegue. En desarrollo, Vinext crea los bindings locales `DB` y `FILES`.

Las fotografías y los datos privados de propietarios se guardan fuera del frontend público. El endpoint administrativo autenticado puede consultarlos; las imágenes solo se sirven públicamente cuando pertenecen a un vehículo con estado público admitido.

## Calidad y build

```bash
npm run lint
npm run typecheck
npm run build
npm run build:pages
```

`npm run build:pages` genera una portada estática en `dist/pages`. GitHub Pages no ejecuta formularios, autenticación, D1 ni R2. Por eso la portada mantiene el mismo diseño y dirige las acciones comerciales a la aplicación completa de Sites, que es el origen canónico.

`npm audit --omit=dev` informa 0 vulnerabilidades en las dependencias de producción. La auditoría completa conserva 8 alertas en herramientas de desarrollo: 4 moderadas en la cadena de `drizzle-kit` (`@esbuild-kit`/`esbuild`) y 4 altas en la cadena local de Cloudflare (`miniflare`/`wrangler`/`sharp`). Las correcciones propuestas por npm requieren cambios de versión incompatibles, por lo que no se fuerzan sin una migración específica.

## Administración

1. Generá el hash con `npm run --silent admin:hash-password -- "MiContraseña"` y guardalo como `ADMIN_PASSWORD_HASH`.
2. Generá `ADMIN_SESSION_SECRET` con `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"`.
3. Configurá `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` y `ADMIN_SESSION_SECRET` como secretos del proyecto de Sites. Para desarrollo local, ponelos solamente en `.env.local`.
4. Entrá en `/admin/login`. Una sesión válida dura siete días y puede cerrarse desde el panel.
5. Llevá la solicitud de `PENDIENTE` a `EN_REVISION` y, si corresponde, a `ACEPTADA`. Solamente entonces puede convertirse en vehículo.
6. Revisá datos, fotografías, información declarada y notas de revisión en estado `BORRADOR`.
7. Cambiá el estado a `PUBLICADO` para incorporarlo al catálogo.

Estados disponibles:

- Vehículos: `BORRADOR`, `PUBLICADO`, `RESERVADO`, `VENDIDO`.
- Solicitudes de vendedores: `PENDIENTE`, `EN_REVISION`, `ACEPTADA`, `RECHAZADA`.
- Solicitudes de compradores: `NUEVA`, `CONTACTADO`, `BUSCANDO`, `OPCIONES_ENVIADAS`, `FINALIZADA`.
- Consultas: `NUEVA`, `CONTACTADO`, `CERRADA`.

## Publicación

- Repositorio y portada estática: [DylanMachado1/nero-automoviles](https://github.com/DylanMachado1/nero-automoviles) y [GitHub Pages](https://dylanmachado1.github.io/nero-automoviles/).
- Aplicación completa: [NERO Automóviles en Sites](https://nero-automoviles.dylanvpi1899.chatgpt.site/).

GitHub Pages sirve la home sin backend. Sites sirve todas las rutas, formularios, base de datos, archivos y administración. La identidad visual es compartida para reducir el cambio de contexto; un dominio propio puede apuntar a la aplicación completa en el futuro.

## Datos pendientes del titular

- Número de WhatsApp comercial, si se desea ese canal.
- Email comercial, si se desea mostrarlo.
- Dominio propio, si se desea reemplazar la URL actual.
- Revisión profesional de las condiciones y la política de privacidad cuando el negocio avance o cambien sus procesos.
