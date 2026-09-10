import type { Metadata } from 'next';
import { CarFront } from 'lucide-react';
import { SiteShell } from '@/components/nero/site-shell';
import { CatalogFilters } from '@/components/vehicles/catalog-filters';
import { VehicleCard } from '@/components/vehicles/vehicle-card';
import { listPublicVehicles } from '@/repositories/vehicles';
import type { VehicleSummary } from '@/types/nero';
import { sitePath } from '@/lib/brand';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Vehículos',
  description: 'Vehículos que sus propietarios confiaron a NERO para su comercialización en Uruguay.',
  alternates: { canonical: '/vehiculos' },
};

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const query = await searchParams;
  let vehicles: VehicleSummary[] = [];

  try {
    vehicles = await listPublicVehicles(query);
  } catch {
    // A fresh deployment can render the empty state before its first migration.
  }

  return (
    <SiteShell>
      <main id="contenido" className="catalog-page container">
        <header>
          <p className="eyebrow muted">CATÁLOGO NERO</p>
          <h1>Vehículos.</h1>
          <p>Publicaciones revisadas y gestionadas por NERO. Cada vehículo permanece con su propietario.</p>
        </header>

        <div className="catalog-layout">
          <CatalogFilters defaults={query} />
          <div className="catalog-results">
            <div className="catalog-toolbar">
              <span>{vehicles.length} {vehicles.length === 1 ? 'vehículo encontrado' : 'vehículos encontrados'}</span>
              <form>
                {Object.entries(query).filter(([key]) => key !== 'order').map(([key, value]) => (
                  value ? <input key={key} type="hidden" name={key} value={value} /> : null
                ))}
                <label htmlFor="catalog-order">Ordenar por</label>
                <select id="catalog-order" name="order" defaultValue={query.order ?? 'recent'}>
                  <option value="recent">Más recientes</option>
                  <option value="priceAsc">Menor precio</option>
                  <option value="priceDesc">Mayor precio</option>
                  <option value="mileage">Menor kilometraje</option>
                  <option value="year">Más nuevos</option>
                </select>
                <button>Ordenar</button>
              </form>
            </div>
            <section className="vehicle-grid" aria-label="Resultados">
              {vehicles.length ? vehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} compact />
              )) : (
                <div className="catalog-page-empty">
                  <CarFront />
                  <p className="eyebrow muted">CATÁLOGO EN PREPARACIÓN</p>
                  <h2>Estamos incorporando nuestros primeros vehículos.</h2>
                  <p>Cada vehículo publicado en NERO corresponde a una gestión real con su propietario. No mostramos stock ficticio.</p>
                  <div className="catalog-empty-actions"><a className="button button-light" href={sitePath('/vende-tu-auto')}>Vendé tu auto con NERO</a><a className="button button-outline" href={sitePath('/buscamos-tu-auto')}>Decinos qué auto buscás</a></div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </SiteShell>
  );
}
