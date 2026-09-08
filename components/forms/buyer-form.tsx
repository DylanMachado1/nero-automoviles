'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { FormStatus, type FormState } from './form-status';
import { SelectField, TextAreaField, TextField, departments, fuelOptions, transmissionOptions } from './fields';

export function BuyerForm() {
  const [state, setState] = useState<FormState>({ kind: 'idle' });
  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault(); setState({ kind: 'sending' });
    try {
      const response = await fetch('/api/buyer-requests', { method: 'POST', body: new FormData(event.currentTarget) });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error);
      setState({ kind: 'success', message: 'Recibimos tu búsqueda. Vamos a revisar tus preferencias antes de contactarte.' });
      event.currentTarget.reset();
    } catch (error) {
      setState({ kind: 'error', message: error instanceof Error ? error.message : 'No pudimos guardar tu búsqueda.' });
    }
  }
  if (state.kind === 'success') return <div className="success-panel"><CheckCircle2 /><p className="eyebrow muted">BÚSQUEDA RECIBIDA</p><h2>Ya sabemos por dónde empezar.</h2><p>{state.message}</p><a href="/vehiculos" className="button button-light">Ver vehículos <ArrowRight /></a></div>;
  return <form className="nero-form" onSubmit={submit}>
    <input name="website" tabIndex={-1} className="honeypot" /><FormStatus state={state} />
    <fieldset><legend><span>01</span> Contacto</legend><div className="form-grid">
      <TextField label="Nombre" name="name" required autoComplete="name" /><TextField label="Teléfono / WhatsApp" name="phone" required type="tel" autoComplete="tel" /><TextField label="Email" name="email" type="email" autoComplete="email" />
    </div></fieldset>
    <fieldset><legend><span>02</span> Qué buscás</legend><div className="form-grid">
      <TextField label="Marca preferida" name="brand" /><TextField label="Modelo preferido" name="model" />
      <SelectField label="Tipo de vehículo" name="vehicleType"><option>Hatchback</option><option>Sedán</option><option>SUV</option><option>Pickup</option><option>Utilitario</option><option>Otro</option></SelectField>
      <TextField label="Presupuesto mínimo (USD)" name="minBudget" type="number" min={0} /><TextField label="Presupuesto máximo (USD)" name="maxBudget" type="number" min={0} />
      <TextField label="Año mínimo" name="minYear" type="number" min={1900} max={new Date().getFullYear() + 1} /><TextField label="Kilometraje máximo" name="maxMileage" type="number" min={0} />
      <SelectField label="Combustible" name="fuel">{fuelOptions.map((value) => <option key={value}>{value}</option>)}</SelectField><SelectField label="Transmisión" name="transmission">{transmissionOptions.map((value) => <option key={value}>{value}</option>)}</SelectField>
      <SelectField label="Departamento" name="department">{departments.map((value) => <option key={value}>{value}</option>)}</SelectField><SelectField label="¿Buscar en todo Uruguay?" name="nationwide" required><option value="yes">Sí</option><option value="no">No</option></SelectField>
      <TextAreaField label="Comentarios" name="comments" placeholder="Contanos prioridades o detalles que debamos tener en cuenta." />
    </div></fieldset>
    <button className="button button-light submit-button" disabled={state.kind === 'sending'}>Empezar mi búsqueda <ArrowRight /></button>
  </form>;
}
