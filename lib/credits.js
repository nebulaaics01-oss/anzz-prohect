const {adminClient}=require('./supabase')
async function ensureDailyReset(){const {error}=await adminClient().rpc('ensure_daily_credit_reset');if(error)throw error}
async function getProfile(userId){await ensureDailyReset();const {data,error}=await adminClient().from('profiles').select('id,email,display_name,role,credits,daily_credits,credit_reset_at').eq('id',userId).single();if(error)throw error;return data}
async function consume(userId,amount=1){await ensureDailyReset();const {data,error}=await adminClient().rpc('consume_credit',{p_user_id:userId,p_amount:amount});if(error)throw error;return data}
module.exports={ensureDailyReset,getProfile,consume}
