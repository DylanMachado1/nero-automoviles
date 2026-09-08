import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { metadataBase: new URL('https://nero-automoviles.green-crow-0507.chatgpt.site'), title: 'NERO Automóviles | Tu auto. Nuestra gestión.', description: 'Comprá, vendé o encontrá tu próximo auto en Uruguay. NERO conecta compradores y propietarios con una gestión transparente y personalizada.', openGraph: { title: 'NERO Automóviles', description: 'Tu auto. Nuestra gestión. Compra, venta y búsqueda de vehículos en todo Uruguay.', locale: 'es_UY', type: 'website' } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {return <html lang="es-UY"><body>{children}</body></html>}
