export const BRAND={name:'NERO Automóviles',slogan:'Tu auto. Nuestra gestión.',instagram:'https://www.instagram.com/nero.automoviles/',instagramHandle:'@nero.automoviles',logoPath:'/brand/nero-logo.jpeg'} as const;
const GITHUB_PAGES_BASE='/nero-automoviles';
const APP_ORIGIN='https://nero-automoviles.dylanvpi1899.chatgpt.site';
export function sitePath(path:string){
  if(process.env.GITHUB_PAGES!=='true')return path;
  if(path==='/'||path.startsWith('/#')||path.startsWith('/brand/')||path.startsWith('/images/'))return `${GITHUB_PAGES_BASE}${path}`;
  return `${APP_ORIGIN}${path}`;
}
