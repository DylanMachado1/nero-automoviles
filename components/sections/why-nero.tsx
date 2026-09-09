import { ArrowRight, Check } from 'lucide-react';
import { sitePath } from '@/lib/brand';

const ownerTasks = ['Responder consultas', 'Filtrar curiosos', 'Negociar', 'Coordinar visitas', 'Actualizar publicaciones', 'Gestionar interesados'];
const neroTasks = ['Presentación profesional', 'Promoción del vehículo', 'Consultas gestionadas', 'Interesados filtrados', 'Negociación acompañada', 'Coordinación de la operación'];

export function WhyNero() {
  return <section className="why-nero container" data-reveal><header><p className="eyebrow muted">POR QUÉ VENDER CON NERO</p><h2>Publicar un auto es fácil.<br /><em>Venderlo lleva tiempo.</em></h2></header><div className="why-columns"><div><span>CUANDO LO HACÉS SOLO</span>{ownerTasks.map((task) => <p key={task}>{task}</p>)}</div><div><span>CON LA GESTIÓN DE NERO</span>{neroTasks.map((task) => <p key={task}><Check />{task}</p>)}</div></div><a className="quiet-link" href={sitePath('/vende-tu-auto')}>Conocer la propuesta <ArrowRight /></a></section>;
}
