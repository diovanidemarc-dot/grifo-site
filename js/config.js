/* ===== Configuração do app =====
   Preencha antes de gerar as versões das lojas. Com supabaseUrl vazio o app roda em "modo local":
   tudo funciona no aparelho, sem conta e sem sincronizar (é o modo do protótipo). */
window.EQ = window.EQ || {};
EQ.CONFIG = Object.assign({
  versao: "1.0.0",
  supabaseUrl: "https://qksobdymbrtumiewkbru.supabase.co",   // projeto "grifo" (São Paulo)
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrc29iZHltYnJ0dW1pZXdrYnJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwMDM0NTcsImV4cCI6MjEwODU3OTQ1N30.RHYD-174MfBrc2H9LTYJFA2yiTFrPM2C3lOowonRZOA",   // chave "anon public" (pode ficar no app)
  conteudoUrl: "",                 // vazio = <supabaseUrl>/storage/v1/object/public/conteudo/
  funcoesUrl: "",                  // vazio = <supabaseUrl>/functions/v1/
  responsavelUrl: "",              // endereço público da página do responsável (responsavel.html)
  posthogKey: "", posthogHost: "https://us.i.posthog.com",
  sentryDsn: "",
  revenuecat: { ios: "", android: "" }, entitlement: "premium",
  admob: {                          // IDs de TESTE do Google; troque pelos seus antes de publicar
    rewardedAndroid: "ca-app-pub-3940256099942544/5224354917",
    rewardedIos: "ca-app-pub-3940256099942544/1712485313"
  },
  privacidadeUrl: "", termosUrl: "",
  painelTeste: false                // true só no build do teste fechado: mostra no Perfil o painel de resumos para quem aplica o teste
                                    // (no navegador o painel sempre aparece)
}, window.EQ_OVERRIDE || {});
(function(c){
  if (c.supabaseUrl) {
    c.supabaseUrl = c.supabaseUrl.replace(/\/$/, "");
    if (!c.conteudoUrl) c.conteudoUrl = c.supabaseUrl + "/storage/v1/object/public/conteudo/";
    if (!c.funcoesUrl) c.funcoesUrl = c.supabaseUrl + "/functions/v1/";
  }
  c.servidor = !!(c.supabaseUrl && c.supabaseAnonKey);
})(EQ.CONFIG);
