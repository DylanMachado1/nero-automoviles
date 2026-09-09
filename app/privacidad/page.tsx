import type { Metadata } from 'next';
import { SiteShell } from '@/components/nero/site-shell';
import { BRAND } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Privacidad',
  description: 'Cómo NERO Automóviles utiliza y protege los datos recibidos.',
  alternates: { canonical: '/privacidad' },
};

export default function Privacy() {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();
  return (
    <SiteShell>
      <main id="contenido" className="legal-page container">
        <p className="eyebrow muted">PRIVACIDAD</p>
        <h1>Cómo utilizamos tu información</h1>
        <p className="legal-intro">NERO recibe únicamente la información que las personas envían para solicitar una venta, una búsqueda de vehículo o una consulta.</p>

        <section><h2>Datos que recibimos</h2><p>Podemos recibir datos de contacto, ubicación general, preferencias de compra, información declarada del vehículo, datos privados necesarios para evaluar una gestión y fotografías adjuntas.</p></section>
        <section><h2>Para qué se utilizan</h2><p>Usamos estos datos para revisar solicitudes, responder consultas, evaluar vehículos, preparar publicaciones aprobadas, buscar opciones y coordinar la intermediación entre las partes. NERO no vende datos personales.</p></section>
        <section><h2>Información privada y catálogo público</h2><p>Los datos privados del propietario no se muestran públicamente. Teléfono, email, cédula, padrón, matrícula, precio mínimo, la base de ese mínimo, documentación y notas internas nunca forman parte automática del catálogo. Las fotografías enviadas permanecen privadas hasta que NERO aprueba una publicación.</p></section>
        <section><h2>Acceso y publicación</h2><p>Las solicitudes y sus archivos son accesibles únicamente desde el panel administrativo protegido. Una publicación pública contiene solo la información seleccionada y aprobada para presentar el vehículo.</p></section>
        <section><h2>Consultas sobre tus datos</h2><p>Podés solicitar una actualización o eliminación de la información que enviaste a través de <a href={BRAND.instagram} target="_blank" rel="noreferrer">{BRAND.instagramHandle}</a>{contactEmail ? <> o por email a <a href={`mailto:${contactEmail}`}>{contactEmail}</a></> : null}. NERO evaluará la solicitud y conservará únicamente lo necesario para gestionar obligaciones pendientes.</p></section>
      </main>
    </SiteShell>
  );
}
