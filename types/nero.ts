export type VehicleStatus = 'BORRADOR' | 'PUBLICADO' | 'RESERVADO' | 'VENDIDO';
export type RequestStatus = 'PENDIENTE' | 'EN_REVISION' | 'ACEPTADA' | 'RECHAZADA';
export type BuyerRequestStatus = 'NUEVA' | 'CONTACTADO' | 'BUSCANDO' | 'OPCIONES_ENVIADAS' | 'FINALIZADA';
export type InquiryStatus = 'NUEVA' | 'CONTACTADO' | 'CERRADA';
export interface VehicleSummary { id:string;slug:string;brand:string;model:string;version?:string|null;year:number;price?:number|null;currency:string;mileage:number;fuel:string;transmission:string;department:string;city:string;status:VehicleStatus;imageKey?:string|null }
