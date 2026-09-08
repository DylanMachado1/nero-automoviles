export type FormState={kind:'idle'|'sending'|'success'|'error';message?:string};
export function FormStatus({state}:{state:FormState}){if(state.kind==='idle')return null;return <output className={`form-status ${state.kind}`} aria-live="polite">{state.kind==='sending'?'Enviando…':state.message}</output>}
