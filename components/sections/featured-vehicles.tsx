import { ArrowRight } from 'lucide-react';
import { VehicleCard } from '@/components/vehicles/vehicle-card';
import { listPublicVehicles } from '@/repositories/vehicles';
import { sitePath } from '@/lib/brand';

async function FeaturedVehicleData() {
  let vehicles: Awaited<ReturnType<typeof listPublicVehicles>> = [];
  try {
    vehicles = (await listPublicVehicles({ order: 'recent' })).slice(0, 3);
  } catch {
    return null;
  }
  if (!vehicles.length) return null;
  return <section className="featured-vehicles container" data-reveal><div className="section-heading"><div><p className="eyebrow muted">GESTIONES PUBLICADAS</p><h2 className="section-title">Vehículos destacados.</h2></div><a className="quiet-link" href={sitePath('/vehiculos')}>Ver todos <ArrowRight /></a></div><div className="vehicle-grid">{vehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}</div></section>;
}

export function FeaturedVehicles() {
  if (process.env.GITHUB_PAGES === 'true') return null;
  return <FeaturedVehicleData />;
}
