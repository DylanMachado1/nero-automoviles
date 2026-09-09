import { MessageCircle } from 'lucide-react';

export function WhatsAppButton({ message }: { message: string }) {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, '');
  if (!number || number.length < 8 || number.length > 15) return null;
  return <a className="whatsapp-float" href={`https://wa.me/${number}?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer" aria-label="Consultar a NERO por WhatsApp"><MessageCircle /><span>WhatsApp</span></a>;
}
