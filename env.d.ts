declare namespace Cloudflare {
  interface Env {
    FILES: R2Bucket;
    DB: D1Database;
    NERO_ADMIN_EMAILS?: string;
    NEXT_PUBLIC_WHATSAPP_NUMBER?: string;
    NEXT_PUBLIC_CONTACT_EMAIL?: string;
  }
}
