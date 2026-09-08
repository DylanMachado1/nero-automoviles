import { Navigation } from './navigation';
import { Footer } from './footer';
export function SiteShell({ children }: { children: React.ReactNode }) { return <><Navigation />{children}<Footer /></>; }
