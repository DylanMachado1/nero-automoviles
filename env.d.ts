declare namespace Cloudflare {
  interface Env {
    FILES: R2Bucket;
    DB: D1Database;
    ADMIN_EMAIL?: string;
    ADMIN_PASSWORD_HASH?: string;
    ADMIN_SESSION_SECRET?: string;
    NEXT_PUBLIC_WHATSAPP_NUMBER?: string;
    NEXT_PUBLIC_CONTACT_EMAIL?: string;
  }
}
