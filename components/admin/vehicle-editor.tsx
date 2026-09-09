'use client';

import { useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowUp, Star, Trash2, Upload } from 'lucide-react';

type Vehicle = Record<string, string | number | null> & { id: string };
type Image = { id: string; object_key: string; alt: string | null; is_primary: number };

const fileUrl = (key: string) => `/api/admin/files/${key.split('/').map(encodeURIComponent).join('/')}`;

export function VehicleEditor({ vehicle, initialImages }: { vehicle: Vehicle; initialImages: Image[] }) {
  const [images, setImages] = useState(initialImages);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function save(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage('Guardando…');
    const response = await fetch(`/api/admin/vehicles/${vehicle.id}`, { method: 'PATCH', body: new FormData(event.currentTarget) });
    const data = await response.json() as { error?: string };
    setMessage(response.ok ? 'Cambios guardados.' : data.error ?? 'No se pudo guardar.'); setBusy(false);
  }

  async function updateGallery(body: Record<string, unknown>, next?: Image[]) {
    setBusy(true); setMessage('Actualizando galería…');
    const response = await fetch('/api/admin/vehicle-images', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ vehicleId: vehicle.id, ...body }) });
    const data = await response.json() as { error?: string };
    if (response.ok && next) setImages(next);
    setMessage(response.ok ? 'Galería actualizada.' : data.error ?? 'No se pudo actualizar.'); setBusy(false);
  }

  function move(index: number, direction: number) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images]; [next[index], next[target]] = [next[target], next[index]];
    void updateGallery({ imageIds: next.map((image) => image.id) }, next);
  }

  async function addImages(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage('Subiendo imágenes…');
    const form = new FormData(event.currentTarget); form.set('vehicleId', vehicle.id);
    const response = await fetch('/api/admin/vehicle-images', { method: 'POST', body: form });
    const data = await response.json() as { error?: string };
    if (response.ok) location.reload();
    setMessage(data.error ?? 'No se pudieron subir.'); setBusy(false);
  }

  async function remove(image: Image) {
    if (!window.confirm('¿Eliminar esta imagen de forma permanente?')) return;
    await updateGallery({ removeId: image.id }, images.filter((item) => item.id !== image.id));
  }

  async function removeVehicle() {
    if (!window.confirm('¿Eliminar este vehículo y sus imágenes? Esta acción no se puede deshacer.')) return;
    setBusy(true);
    const response = await fetch(`/api/admin/vehicles/${vehicle.id}`, { method: 'DELETE' });
    if (response.ok) location.assign('/admin/vehiculos');
    else { const data = await response.json() as { error?: string }; setMessage(data.error ?? 'No se pudo eliminar.'); setBusy(false); }
  }

  return (
    <div className="admin-editor">
      <a className="admin-back" href="/admin/vehiculos"><ArrowLeft /> Volver a vehículos</a>
      <form className="admin-edit-form" onSubmit={save}>
        <label>Marca<input name="brand" required defaultValue={String(vehicle.brand ?? '')} /></label>
        <label>Modelo<input name="model" required defaultValue={String(vehicle.model ?? '')} /></label>
        <label>Versión<input name="version" defaultValue={String(vehicle.version ?? '')} /></label>
        <label>Año<input name="year" type="number" required defaultValue={String(vehicle.year ?? '')} /></label>
        <label>Precio<input name="price" type="number" defaultValue={String(vehicle.price ?? '')} /></label>
        <label>Moneda<select name="currency" defaultValue={String(vehicle.currency ?? 'USD')}><option>USD</option><option>UYU</option></select></label>
        <label>Kilometraje<input name="mileage" type="number" required defaultValue={String(vehicle.mileage ?? '')} /></label>
        <label>Combustible<input name="fuel" required defaultValue={String(vehicle.fuel ?? '')} /></label>
        <label>Transmisión<input name="transmission" required defaultValue={String(vehicle.transmission ?? '')} /></label>
        <label>Motor<input name="engine" defaultValue={String(vehicle.engine ?? '')} /></label>
        <label>Departamento<input name="department" required defaultValue={String(vehicle.department ?? '')} /></label>
        <label>Ciudad<input name="city" required defaultValue={String(vehicle.city ?? '')} /></label>
        <label>Color<input name="color" defaultValue={String(vehicle.color ?? '')} /></label>
        <label>Puertas<input name="doors" type="number" defaultValue={String(vehicle.doors ?? '')} /></label>
        <label>Condición<input name="condition" defaultValue={String(vehicle.condition ?? '')} /></label>
        <label className="wide">Descripción<textarea name="description" required defaultValue={String(vehicle.description ?? '')} /></label>
        <label className="wide">Equipamiento<textarea name="equipment" defaultValue={String(vehicle.equipment ?? '')} /></label>
        <label className="wide">Información adicional<textarea name="additionalInfo" defaultValue={String(vehicle.additional_info ?? '')} /></label>
        <label className="wide">Revisión NERO<textarea name="reviewNotes" placeholder="Registrá únicamente observaciones que NERO haya revisado realmente y su alcance." defaultValue={String(vehicle.review_notes ?? '')} /></label>
        <div className="wide admin-edit-actions"><button className="button button-light" disabled={busy}>Guardar cambios</button><span aria-live="polite">{message}</span></div>
      </form>

      <section className="admin-gallery">
        <div><h2>Galería</h2><span>{images.length} / 12 imágenes</span></div>
        <div className="admin-gallery-grid">
          {images.map((image, index) => (
            <figure key={image.id}>
              <img src={fileUrl(image.object_key)} alt={image.alt ?? ''} />
              {image.is_primary ? <strong>Principal</strong> : null}
              <figcaption>
                <button disabled={busy || index === 0} onClick={() => move(index, -1)} aria-label="Mover antes"><ArrowUp /></button>
                <button disabled={busy || index === images.length - 1} onClick={() => move(index, 1)} aria-label="Mover después"><ArrowDown /></button>
                <button disabled={busy || Boolean(image.is_primary)} onClick={() => updateGallery({ primaryId: image.id }, images.map((item) => ({ ...item, is_primary: item.id === image.id ? 1 : 0 })))} aria-label="Marcar como principal"><Star /></button>
                <button disabled={busy} onClick={() => remove(image)} aria-label="Eliminar imagen"><Trash2 /></button>
              </figcaption>
            </figure>
          ))}
        </div>
        {images.length < 12 && <form className="admin-upload" onSubmit={addImages}><input name="images" type="file" accept="image/jpeg,image/png,image/webp" multiple required /><button disabled={busy}><Upload /> Subir imágenes</button></form>}
      </section>

      <section className="danger-zone"><h2>Eliminar vehículo</h2><p>Elimina la ficha y sus imágenes. Las consultas se conservan sin asociación.</p><button disabled={busy} onClick={removeVehicle}><Trash2 /> Eliminar definitivamente</button></section>
    </div>
  );
}
