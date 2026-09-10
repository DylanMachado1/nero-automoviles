export default function AdminLoading() {
  return <main className="admin-content" aria-busy="true" aria-label="Cargando administración"><div className="skeleton skeleton-title" /><div className="admin-stats">{Array.from({ length: 3 }, (_, index) => <article key={index}><div className="skeleton skeleton-line" /><div className="skeleton skeleton-number" /></article>)}</div></main>;
}
