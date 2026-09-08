'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { ImageUploader } from './image-uploader';
import { FormStatus, type FormState } from './form-status';
import { SelectField, TextAreaField, TextField, departments, fuelOptions, transmissionOptions } from './fields';

export function SellerForm() {
  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<FormState>({ kind: 'idle' });
  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault(); if (state.kind === 'sending') return; setState({ kind: 'sending' });
    const form = new FormData(event.currentTarget); files.forEach((file) => form.append('images', file));
    try {
      const response = await fetch('/api/seller-requests', { method: 'POST', body: form });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error);
      setState({ kind: 'success', message: 'Recibimos tu vehículo. Revisaremos la información antes de publicarlo.' });
      event.currentTarget.reset(); setFiles([]); scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setState({ kind: 'error', message: error instanceof Error ? error.message : 'No pudimos enviar la solicitud.' });
    }
  }
  if (state.kind === 'success') return <div className="success-panel"><CheckCircle2 /><p className="eyebrow muted">SOLICITUD RECIBIDA</p><h2>Gracias por confiar en NERO.</h2><p>{state.message}</p><a href="/" className="button button-light">Volver al inicio <ArrowRight /></a></div>;
  return <form className="nero-form" onSubmit={submit} noValidate>
    <input name="website" tabIndex={-1} autoComplete="off" className="honeypot" /><FormStatus state={state} />
    <fieldset><legend><span>01</span> Tus datos</legend><div className="form-grid">
      <TextField label="Nombre" name="name" required autoComplete="name" /><TextField label="Teléfono / WhatsApp" name="phone" required type="tel" autoComplete="tel" /><TextField label="Email" name="email" type="email" autoComplete="email" />
      <SelectField label="Departamento" name="department" required>{departments.map((value) => <option key={value}>{value}</option>)}</SelectField><TextField label="Ciudad" name="city" required autoComplete="address-level2" />
    </div></fieldset>
    <fieldset><legend><span>02</span> Tu vehículo</legend><div className="form-grid">
      <TextField label="Marca" name="brand" required /><TextField label="Modelo" name="model" required /><TextField label="Versión" name="version" />
      <TextField label="Año" name="year" required type="number" min={1900} max={new Date().getFullYear() + 1} /><TextField label="Kilometraje" name="mileage" required type="number" min={0} />
      <SelectField label="Combustible" name="fuel" required>{fuelOptions.map((value) => <option key={value}>{value}</option>)}</SelectField><SelectField label="Transmisión" name="transmission" required>{transmissionOptions.map((value) => <option key={value}>{value}</option>)}</SelectField>
      <TextField label="Motor" name="engine" /><TextField label="Color" name="color" /><SelectField label="Puertas" name="doors"><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></SelectField>
      <TextField label="Precio pretendido (USD)" name="askingPrice" type="number" min={0} /><SelectField label="Estado general" name="condition" required><option>Excelente</option><option>Muy bueno</option><option>Bueno</option><option>A revisar</option></SelectField>
      <TextAreaField label="Descripción" name="description" required placeholder="Contanos sobre el estado, mantenimiento y cualquier detalle relevante." />
    </div></fieldset>
    <fieldset><legend><span>03</span> Fotografías</legend><ImageUploader onChange={setFiles} /></fieldset>
    <label className="terms-check" htmlFor="terms"><Checkbox id="terms" name="terms" required /><span>He leído y acepto las <a href="/condiciones" target="_blank">condiciones para solicitar la comercialización</a> de mi vehículo.</span></label>
    <button className="button button-light submit-button" disabled={state.kind === 'sending'}>Enviar vehículo a NERO <ArrowRight /></button><p className="submit-note">La solicitud queda pendiente de revisión. El vehículo no se publica automáticamente.</p>
  </form>;
}
