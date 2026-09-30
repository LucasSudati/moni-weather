
window.MONI_CONFIG={
  supabaseUrl:'https://whdymuqmzuwmrsqaqywd.supabase.co',   
  supabaseKey:'sb_publishable_PTQy5zVYkMK6GtjDxXiukA_23Jxbd6v'   
};

// GLM online: Supabase Edge Function do mesmo projeto.
window.MONI_CONFIG.glmApiUrl = window.MONI_CONFIG.glmApiUrl || (window.MONI_CONFIG.supabaseUrl + '/functions/v1/glm');

// Radar REDEMET: a API key permanece apenas no Secret REDEMET_API_KEY da Edge Function.
window.MONI_CONFIG.radarApiUrl = window.MONI_CONFIG.radarApiUrl || (window.MONI_CONFIG.supabaseUrl + '/functions/v1/radar');

// MONI MAXCAPPI Analyzer v5.4 — células, tracking e nowcast.
window.MONI_CONFIG.maxcappiAnalyzeUrl = window.MONI_CONFIG.maxcappiAnalyzeUrl || (window.MONI_CONFIG.supabaseUrl + '/functions/v1/maxcappi-analyze');

// Focos ativos INPE — proxy da Edge Function (sem segredos no frontend).
window.MONI_CONFIG.fireApiUrl = window.MONI_CONFIG.fireApiUrl || (window.MONI_CONFIG.supabaseUrl + '/functions/v1/fires');

// Rotas internas MONI — proxy Supabase para evitar bloqueios CORS do navegador.
window.MONI_CONFIG.routeApiUrl = window.MONI_CONFIG.routeApiUrl || (window.MONI_CONFIG.supabaseUrl + '/functions/v1/route');
