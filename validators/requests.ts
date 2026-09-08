const phonePattern=/^[+\d][\d\s().-]{6,24}$/;const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function clean(value:FormDataEntryValue|null,max=200){return typeof value==='string'?value.trim().slice(0,max):''}
export function required(form:FormData,name:string,label:string,max=200){const value=clean(form.get(name),max);if(!value)throw new Error(`Completá ${label}.`);return value}
export function optional(form:FormData,name:string,max=200){return clean(form.get(name),max)||null}
export function integer(form:FormData,name:string,label:string,min:number,max:number,optionalValue=false){const raw=clean(form.get(name),20);if(!raw&&optionalValue)return null;const value=Number(raw);if(!Number.isInteger(value)||value<min||value>max)throw new Error(`${label} no es válido.`);return value}
export function phone(form:FormData){const value=required(form,'phone','tu teléfono',30);if(!phonePattern.test(value))throw new Error('Ingresá un teléfono válido.');return value}
export function email(form:FormData){const value=optional(form,'email',160);if(value&&!emailPattern.test(value))throw new Error('Ingresá un email válido.');return value}
export function assertHoneypot(form:FormData){if(clean(form.get('website')))throw new Error('No pudimos procesar la solicitud.')}
export function assertSameOrigin(request:Request){const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)throw new Error('Origen no permitido.')}
