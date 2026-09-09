import type { Metadata } from 'next';
import { SiteShell } from '@/components/nero/site-shell';

export const metadata: Metadata = {
  title: 'Condiciones de comercialización',
  description: 'Condiciones generales del servicio de intermediación de NERO Automóviles.',
  alternates: { canonical: '/condiciones' },
};

export default function Terms() {
  return (
    <SiteShell>
      <main id="contenido" className="legal-page container">
        <p className="eyebrow muted">CONDICIONES DEL SERVICIO</p>
        <h1>Condiciones para solicitar la comercialización</h1>
        <p className="legal-intro">Estas condiciones explican cómo trabaja NERO Automóviles como intermediario entre propietarios y posibles compradores.</p>

        <section><h2>1. Solicitud, revisión y publicación</h2><p>Enviar el formulario crea una solicitud para que NERO evalúe el vehículo y la posible gestión. No obliga a NERO a aceptarlo ni lo publica automáticamente. La publicación se realiza únicamente después de revisar la información, acordar las condiciones particulares y recibir la aceptación expresa del propietario.</p></section>
        <section><h2>2. Intermediación</h2><p>NERO presenta y promociona el vehículo, recibe consultas, filtra interesados y acompaña la negociación y la coordinación entre las partes. NERO no compra el vehículo ni recibe el precio total de la operación. El pago del vehículo se realiza directamente entre comprador y propietario.</p></section>
        <section><h2>3. Comisión</h2><p>NERO cobra una comisión del 4% sobre el precio final de venta únicamente cuando la operación se concreta con un comprador conseguido o gestionado por NERO.</p><p>Si el propietario vende el vehículo por su cuenta a una persona que no fue presentada ni gestionada por NERO, no corresponde comisión. No existe costo por adelantado por solicitar la comercialización.</p></section>
        <section><h2>4. Vehículo, ofertas y exclusividad</h2><p>El vehículo permanece siempre en poder del propietario. El servicio no es exclusivo y el propietario conserva la decisión de aceptar o rechazar cualquier oferta. Las condiciones particulares de una gestión pueden acordarse por escrito antes de iniciarla.</p></section>
        <section><h2>5. Información suministrada</h2><p>El solicitante declara que está autorizado para compartir los datos y fotografías enviados. El estado, kilometraje, historial, titularidad y demás antecedentes informados por el propietario se identifican como datos declarados y no como verificados por NERO, salvo que la publicación indique expresamente qué revisión se realizó y su alcance.</p></section>
        <section><h2>6. Coordinación de la operación</h2><p>NERO puede solicitar información adicional y coordinar contactos o visitas. La decisión final, las verificaciones que correspondan y la transferencia del vehículo son responsabilidad de las partes, con el asesoramiento profesional que decidan contratar.</p></section>
      </main>
    </SiteShell>
  );
}
