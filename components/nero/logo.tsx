import { BRAND,sitePath } from '@/lib/brand';
export function Logo({compact=false}:{compact?:boolean}){return <img className={compact?'brand-logo compact':'brand-logo'} src={sitePath(BRAND.logoPath)} alt="NERO Automóviles" width={compact?92:148} height={compact?92:148} decoding="async"/>}
