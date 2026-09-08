'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { EntityActions } from './entity-table';

export function VehicleCreateForm() {
  const [state, setState] = useState('');
  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault(); setState('Guardando…');
    const response = await fetch('/api/admin/vehicles', { method: 'POST', body: new FormData(event.currentTarget) });
    const data = await response.json() as { error?: string };
    if (response.ok) { setState('Borrador creado'); event.currentTarget.reset(); location.reload(); }
    else setState(data.error ?? 'No se pudo guardar');
  }
  return <details className="admin-create"><summary>Crear vehículo</summary><form onSubmit={submit}>
    <input name="brand" placeholder="Marca" aria-label="Marca" required /><input name="model" placeholder="Modelo" aria-label="Modelo" required /><input name="version" placeholder="Versión" aria-label="Versión" />
    <input name="year" type="number" placeholder="Año" aria-label="Año" required /><input name="mileage" type="number" placeholder="Kilometraje" aria-label="Kilometraje" required /><input name="price" type="number" placeholder="Precio USD" aria-label="Precio USD" />
    <input name="fuel" placeholder="Combustible" aria-label="Combustible" required /><input name="transmission" placeholder="Transmisión" aria-label="Transmisión" required /><input name="engine" placeholder="Motor" aria-label="Motor" />
    <input name="department" placeholder="Departamento" aria-label="Departamento" required /><input name="city" placeholder="Ciudad" aria-label="Ciudad" required /><input name="color" placeholder="Color" aria-label="Color" /><input name="doors" type="number" placeholder="Puertas" aria-label="Puertas" />
    <textarea name="description" placeholder="Descripción" aria-label="Descripción" required /><textarea name="equipment" placeholder="Equipamiento, una línea por elemento" aria-label="Equipamiento" />
    <input name="images" type="file" accept="image/jpeg,image/png,image/webp" multiple aria-label="Imágenes" /><button className="button button-light">Crear borrador</button><span aria-live="polite">{state}</span>
  </form></details>;
}

export function VehicleActions({ id, status }: { id: string; status: string }) {
  return <div className="vehicle-admin-actions"><a href={`/admin/vehiculos/${id}`}><Pencil /> Editar</a><EntityActions id={id} type="vehicle" status={status} options={['BORRADOR', 'PUBLICADO', 'RESERVADO', 'VENDIDO']} /></div>;
}
