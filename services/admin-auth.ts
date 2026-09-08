import { getBindings } from '@/db';
import { getChatGPTUser, requireChatGPTUser } from '@/app/chatgpt-auth';
export async function isAdmin(){
  const user=await getChatGPTUser();if(!user)return null;
  const {db,adminEmails}=getBindings();const allowed=adminEmails.split(',').map(v=>v.trim().toLowerCase()).filter(Boolean);
  if(allowed.includes(user.email.toLowerCase()))return user;
  const row=await db.prepare('SELECT enabled FROM admins WHERE external_user_id=? OR lower(email)=lower(?) LIMIT 1').bind(user.userId,user.email).first<{enabled:number}>();
  return row?.enabled?user:null;
}
export async function requireAdmin(returnTo='/admin'){
  const user=await requireChatGPTUser(returnTo);const admin=await isAdmin();if(!admin)throw new Error(`La cuenta ${user.email} no está autorizada para administrar NERO.`);return admin;
}
