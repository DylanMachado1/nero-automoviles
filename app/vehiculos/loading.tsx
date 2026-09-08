export default function VehiclesLoading() {
  return <main className="catalog-page container" aria-busy="true" aria-label="Cargando vehículos"><div className="skeleton skeleton-title" /><div className="skeleton-grid">{Array.from({ length: 4 }, (_, index) => <div key={index}><div className="skeleton skeleton-image" /><div className="skeleton skeleton-line" /><div className="skeleton skeleton-line short" /></div>)}</div></main>;
}
