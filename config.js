
window.MONI_CONFIG={
  supabaseUrl:'https://whdymuqmzuwmrsqaqywd.supabase.co',   
  supabaseKey:'sb_publishable_PTQy5zVYkMK6GtjDxXiukA_23Jxbd6v'   
};

// GLM online: Supabase Edge Function do mesmo projeto.
window.MONI_CONFIG.glmApiUrl = window.MONI_CONFIG.glmApiUrl || (window.MONI_CONFIG.supabaseUrl + '/functions/v1/glm');

// Radar REDEMET: a API key permanece apenas no Secret REDEMET_API_KEY da Edge Function.
window.MONI_CONFIG.radarApiUrl = window.MONI_CONFIG.radarApiUrl || (window.MONI_CONFIG.supabaseUrl + '/functions/v1/radar');
