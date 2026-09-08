export const BRAND={name:'NERO Automóviles',slogan:'Tu auto. Nuestra gestión.',instagram:'https://www.instagram.com/nero.automoviles/',instagramHandle:'@nero.automoviles',logoPath:'/brand/nero-logo.jpeg'} as const;
export function sitePath(path:string){return `${process.env.GITHUB_PAGES==='true'?'/nero-automoviles':''}${path}`}
