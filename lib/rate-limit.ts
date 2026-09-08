import { getBindings } from '@/db';
export async function enforceRateLimit(request:Request,scope:string,limit=8,windowMinutes=15){
  const ip=request.headers.get('cf-connecting-ip')??request.headers.get('x-forwarded-for')??'local';
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(`${scope}:${ip}`));
  const key=Array.from(new Uint8Array(digest)).map(v=>v.toString(16).padStart(2,'0')).join('');
  const {db}=getBindings();const now=new Date();const existing=await db.prepare('SELECT count, expires_at FROM rate_limits WHERE key = ?').bind(key).first<{count:number;expires_at:string}>();
  if(!existing||new Date(existing.expires_at)<=now){const expires=new Date(now.getTime()+windowMinutes*60000).toISOString();await db.prepare('INSERT INTO rate_limits (key,count,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=1, expires_at=excluded.expires_at').bind(key,expires).run();return}
  if(existing.count>=limit)throw new Error('Recibimos varios intentos. Esperá unos minutos y probá de nuevo.');
  await db.prepare('UPDATE rate_limits SET count=count+1 WHERE key=?').bind(key).run();
}
