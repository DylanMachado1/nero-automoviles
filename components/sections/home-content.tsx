import type { ReactNode } from 'react';
import { SiteShell } from '@/components/nero/site-shell';
import { RevealController } from '@/components/nero/reveal';
import { WhatsAppButton } from '@/components/nero/whatsapp-button';
import { HomeHero } from '@/components/sections/home-hero';
import { Services } from '@/components/sections/services';
import { OwnerControl } from '@/components/sections/owner-control';
import { WhyNero } from '@/components/sections/why-nero';
import { SellHome } from '@/components/sections/sell-home';
import { HomeBottom } from '@/components/sections/home-bottom';

export function HomeContent({ featured }: { featured?: ReactNode }) {
  return <SiteShell><RevealController /><main id="contenido"><HomeHero /><Services /><OwnerControl /><WhyNero /><SellHome />{featured}<HomeBottom /></main><WhatsAppButton message="Hola, estuve viendo la web de NERO Automóviles y quería hacer una consulta." /></SiteShell>;
}
