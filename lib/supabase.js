const { createClient } = require('@supabase/supabase-js')
function getConfig(){return {url:process.env.SUPABASE_URL,anonKey:process.env.SUPABASE_ANON_KEY,serviceKey:process.env.SUPABASE_SERVICE_ROLE_KEY}}
function adminClient(){const c=getConfig();if(!c.url||!c.serviceKey)throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi');return createClient(c.url,c.serviceKey,{auth:{autoRefreshToken:false,persistSession:false}})}
async function userFromRequest(req){const h=req.headers.authorization||'';const token=h.startsWith('Bearer ')?h.slice(7).trim():'';if(!token)return{error:'Login diperlukan.'};const sb=adminClient();const {data,error}=await sb.auth.getUser(token);if(error||!data.user)return{error:'Sesi login tidak valid atau sudah kedaluwarsa.'};return{user:data.user,token,sb}}
module.exports={createClient,getConfig,adminClient,userFromRequest}
