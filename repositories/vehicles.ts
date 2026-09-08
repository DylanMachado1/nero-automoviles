import { getBindings } from '@/db';
import type { VehicleSummary } from '@/types/nero';
type Row={id:string;slug:string;brand:string;model:string;version:string|null;year:number;price:number|null;currency:string;mileage:number;fuel:string;transmission:string;department:string;city:string;status:string;image_key:string|null};
function map(row:Row):VehicleSummary{return {...row,imageKey:row.image_key,status:row.status as VehicleSummary['status']}}
export async function listPublicVehicles(query:Record<string,string|undefined>={}){
 const {db}=getBindings();const clauses=["v.status IN ('PUBLICADO','RESERVADO')"];const values:unknown[]=[];
 const add=(sql:string,value:string|undefined)=>{if(value){clauses.push(sql);values.push(value)}};
 add('lower(v.brand)=lower(?)',query.brand);add('lower(v.model)=lower(?)',query.model);add('v.fuel=?',query.fuel);add('v.transmission=?',query.transmission);add('v.department=?',query.department);
 for(const [key,op,param] of [['yearFrom','>=','yearFrom'],['yearTo','<=','yearTo'],['priceMin','>=','priceMin'],['priceMax','<=','priceMax'],['mileage','<=','mileage']] as const){const val=query[key];if(val&&Number.isFinite(Number(val))){clauses.push(`v.${param==='yearFrom'||param==='yearTo'?'year':param==='mileage'?'mileage':'price'} ${op} ?`);values.push(Number(val))}}
 const orders:Record<string,string>={priceAsc:'v.price ASC',priceDesc:'v.price DESC',mileage:'v.mileage ASC',year:'v.year DESC',recent:'v.created_at DESC'};const order=orders[query.order??'recent']??orders.recent;
 const sql=`SELECT v.id,v.slug,v.brand,v.model,v.version,v.year,v.price,v.currency,v.mileage,v.fuel,v.transmission,v.department,v.city,v.status,(SELECT object_key FROM vehicle_images WHERE vehicle_id=v.id ORDER BY is_primary DESC,position ASC LIMIT 1) image_key FROM vehicles v WHERE ${clauses.join(' AND ')} ORDER BY ${order} LIMIT 60`;
 const result=await db.prepare(sql).bind(...values).all<Row>();return result.results.map(map);
}
export async function getPublicVehicle(slug:string){const {db}=getBindings();return db.prepare("SELECT * FROM vehicles WHERE slug=? AND status IN ('PUBLICADO','RESERVADO','VENDIDO') LIMIT 1").bind(slug).first<Record<string,unknown>>();}
