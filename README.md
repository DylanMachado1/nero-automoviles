# NERO Automóviles

Sitio de NERO Automóviles: compra, venta y búsqueda de vehículos en Uruguay.
Instagram: https://www.instagram.com/nero.automoviles/

## GitHub Pages

- Repositorio: https://github.com/DylanMachado1/nero-automoviles
- URL prevista: https://dylanmachado1.github.io/nero-automoviles/
- Instalar Node.js 22 o posterior y ejecutar `npm ci`.
- `npm run build:pages` genera el sitio estático en `dist/pages`.
- En Settings → Pages seleccionar **GitHub Actions** cuando Pages esté habilitado.
- El workflow compila cada cambio en main. El despliegue automático se activa para el repositorio público; también se puede ejecutar manualmente una vez habilitado Pages.

La versión actual incluye el diseño de inicio, menú móvil, proceso con pestañas y enlaces al Instagram real. No incluye recepción de formularios, autenticación administrativa ni base de datos operativa. GitHub Pages sirve archivos estáticos: esas funciones requieren un backend independiente.

## Desarrollo original

`npm run dev` conserva el entorno Vinext/Sites. El build de Pages reutiliza los mismos componentes y estilos mediante `pages/main.tsx` y `vite.pages.config.ts`; no publica archivos de servidor ni configuración de almacenamiento. El isotipo original sigue pendiente: el favicon es una inicial tipográfica provisional.
