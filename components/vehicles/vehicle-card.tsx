import { ArrowUpRight, MapPin } from 'lucide-react';
import type { VehicleSummary } from '@/types/nero';
import { formatMileage, formatPrice } from '@/lib/format';
import { sitePath } from '@/lib/brand';

const imageUrl = (key: string) => `/api/vehicle-images/${key.split('/').map(encodeURIComponent).join('/')}`;

export function VehicleCard({ vehicle, compact = false }: { vehicle: VehicleSummary; compact?: boolean }) {
  return (
    <a
      className={`vehicle-card${compact ? ' vehicle-card-compact' : ''}`}
      href={sitePath(`/vehiculos/${vehicle.slug}`)}
    >
      <div className="vehicle-card-image">
        {vehicle.imageKey ? (
          <img
            src={imageUrl(vehicle.imageKey)}
            alt={`${vehicle.brand} ${vehicle.model}`}
            width={800}
            height={500}
            sizes={compact
              ? '(max-width: 620px) calc(100vw - 36px), (max-width: 900px) calc(50vw - 42px), (max-width: 1180px) 380px, 300px'
              : '(max-width: 760px) calc(100vw - 40px), (max-width: 1100px) 50vw, 620px'}
            loading="lazy"
            decoding="async"
          />
        ) : <span>Fotografía pendiente</span>}
        {vehicle.status === 'RESERVADO' && <strong>Reservado</strong>}
      </div>
      <div className="vehicle-card-body">
        <span>{vehicle.year} · {formatMileage(vehicle.mileage)}</span>
        <h2>{vehicle.brand} {vehicle.model}</h2>
        {vehicle.version && <p>{vehicle.version}</p>}
        <div>
          <span><MapPin /> {vehicle.city}, {vehicle.department}</span>
          <strong>{formatPrice(vehicle.price, vehicle.currency)}</strong>
        </div>
      </div>
      <ArrowUpRight className="vehicle-card-arrow" />
    </a>
  );
}
