export function formatPrice(value:number|null|undefined,currency='USD'){if(value==null)return 'Consultar';return new Intl.NumberFormat('es-UY',{style:'currency',currency,maximumFractionDigits:0}).format(value)}
export function formatMileage(value:number){return `${new Intl.NumberFormat('es-UY').format(value)} km`}
export function slugify(value:string){return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
