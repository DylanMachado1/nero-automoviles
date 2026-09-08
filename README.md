# NERO Automóviles

Primera versión operativa de [NERO Automóviles](https://www.instagram.com/nero.automoviles/), una marca uruguaya de intermediación de vehículos. El propietario conserva el auto; NERO prepara la publicación, recibe consultas, filtra interesados y coordina a las partes.

El sitio público está preparado para operar sin inventar stock, oficinas, teléfonos ni resultados comerciales. Los vehículos aparecen en el catálogo únicamente cuando un administrador cambia su estado a `PUBLICADO`.

## Funcionalidad

- Sitio responsive con identidad negra, blanca y plata, logo oficial, navegación móvil, animaciones con `IntersectionObserver` y soporte para `prefers-reduced-motion`.
- Formularios persistentes para vender un auto, solicitar una búsqueda y realizar consultas u ofertas.
- Hasta 12 fotografías por solicitud o vehículo, con validación real de JPEG, PNG y WebP, límite de 3 MB por archivo y almacenamiento privado en R2.
- Catálogo con filtros por URL, orden, empty state y fichas dinámicas con galería, datos técnicos, consulta, oferta y WhatsApp opcional.
- Panel privado con autenticación de ChatGPT, métricas reales, flujos de estados y CRUD de vehículos.
- Conversión idempotente de una solicitud de venta a borrador, sin publicación automática.
- D1 para datos estructurados, R2 para archivos, rate limiting y auditoría administrativa.
- SEO por página, metadata dinámica para vehículos, sitemap, robots, Open Graph, favicon y 404 propia.

## Requisitos

- Node.js **22.13 o posterior**. Se recomienda la rama activa más reciente compatible con Vinext.
- npm.
- Acceso al proyecto de Sites/Cloudflare correspondiente para usar D1, R2 y el login privado.

## Instalación y desarrollo

```bash
npm ci
cp .env.example .env.local
npm run dev
```

El servidor local informa su URL al iniciar. No agregues secretos al repositorio.

## Variables de entorno

| Variable | Obligatoria | Uso |
| --- | --- | --- |
| `NERO_ADMIN_EMAILS` | Para habilitar el panel | Lista de correos autorizados, separados por coma. La comprobación se realiza en el servidor. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | No | Número internacional, solo dígitos. Si falta, las fichas conservan el formulario interno. |

No hay valores predeterminados porque NERO todavía debe confirmar el correo administrador y el número comercial.

## Base de datos y archivos

El esquema está en `db/schema.ts`. Las migraciones versionadas se generan con:

```bash
npm run db:generate
```

Sites empaqueta y aplica las migraciones incluidas en `drizzle/` durante el despliegue. En desarrollo, Vinext crea bindings locales para:

- `DB`: base D1.
- `FILES`: bucket R2.

Las fotografías de propietarios se guardan con claves privadas. Solo el endpoint administrativo autenticado puede verlas mientras el vehículo sea un borrador. El endpoint público comprueba el estado del vehículo antes de servir cada imagen.

## Calidad y build

```bash
npm run lint
npm run typecheck
npm run build
```

`npm run build:pages` genera una portada estática en `dist/pages`. Esa salida sirve como presentación visual en GitHub Pages, pero no puede ejecutar formularios, autenticación, D1 ni R2. La versión operativa se despliega con Sites.

### Auditoría de dependencias

Se actualizaron sin `--force` React Server Components, Vinext, Vite, el plugin de Cloudflare, Wrangler y sus tipos para corregir las alertas directas y de runtime compatibles. `npm audit` conserva 4 alertas moderadas en la cadena de desarrollo de `drizzle-kit` (`@esbuild-kit`/`esbuild`). La corrección sugerida por npm exige bajar `drizzle-kit` a `0.18.1`, un cambio mayor e incompatible con la configuración actual; se mantiene documentada hasta que exista una actualización ascendente segura. Estas dependencias se usan para generar migraciones y no forman parte del código público de la aplicación.

## Administración

1. Configurá `NERO_ADMIN_EMAILS` con el correo exacto de la cuenta que iniciará sesión.
2. Entrá en `/admin` y autenticá la cuenta.
3. Creá un vehículo o convertí una solicitud de venta.
4. Revisá datos y fotos en estado `BORRADOR`.
5. Cambiá el estado a `PUBLICADO` para incorporarlo al catálogo.

Los estados disponibles son:

- Vehículos: `BORRADOR`, `PUBLICADO`, `RESERVADO`, `VENDIDO`.
- Ventas: `NUEVA`, `CONTACTADO`, `ACEPTADO`, `RECHAZADO`.
- Búsquedas: `NUEVA`, `CONTACTADO`, `BUSCANDO`, `OPCIONES_ENVIADAS`, `FINALIZADA`.
- Consultas: `NUEVA`, `CONTACTADO`, `CERRADA`.

## Despliegue

El proyecto de Sites está registrado en `.openai/hosting.json`. El despliegue operativo requiere un build correcto, las migraciones de `drizzle/` y la configuración de las variables de producción desde Sites.

El repositorio de GitHub es [DylanMachado1/nero-automoviles](https://github.com/DylanMachado1/nero-automoviles). GitHub Pages puede alojar la portada estática una vez que el plan y la visibilidad del repositorio permitan Pages; la aplicación completa necesita el runtime de Sites.

## Datos pendientes del titular

- Correo o correos con acceso administrativo.
- Número de WhatsApp comercial, si se desea ese canal.
- Dominio propio, si se desea reemplazar la URL de Sites.
- Revisión profesional del texto provisional en `/condiciones` y `/privacidad` antes de una apertura pública.
