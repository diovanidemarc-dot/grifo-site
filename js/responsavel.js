/* Página do responsável: digita o código do aluno, vê a semana e combina limites. Sem conta, sem instalar nada. */
(function(){
  const C = EQ.CONFIG, el = document.getElementById("r");
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const toast = m => { const t = document.getElementById("toast"); t.textContent = m; t.classList.add("show"); setTimeout(() => t.classList.remove("show"), 2200); };
  const AREAS = {ling:"Linguagens", hum:"Humanas", nat:"Natureza", mat:"Matemática"};
  const tokKey = "eq.resp.token";
  let token = null; try { token = localStorage.getItem(tokKey); } catch(e){}
  async function rpc(nome, args){
    const r = await fetch(C.supabaseUrl + "/rest/v1/rpc/" + nome, {method:"POST", headers:{apikey:C.supabaseAnonKey, "Content-Type":"application/json"}, body: JSON.stringify(args)});
    const j = await r.json().catch(() => null);
    if (!r.ok) throw new Error((j && (j.message || j.msg)) || "erro " + r.status);
    return j;
  }
  function telaCodigo(msg){
    el.innerHTML = `<section class="screen">
      <div class="eyebrow">Acompanhar um estudante</div><h2>Digite o código do app</h2>
      <p class="muted">O estudante gera o código no app, em <b>Perfil → Responsável</b>. O código vale por 24 horas e só pode ser usado uma vez.</p>
      <div class="campo"><label for="cod">Código</label><input id="cod" maxlength="6" autocomplete="off" autocapitalize="characters" placeholder="ABC123" style="text-transform:uppercase;letter-spacing:.2em;font-size:1.4rem;text-align:center"></div>
      <p class="muted small" id="msg" role="status">${esc(msg || "")}</p>
      <button class="cta" id="ir">Acompanhar</button>
      <p class="note">Você verá: minutos de estudo por dia, metas cumpridas e acertos por área. Não verá mensagens nem respostas individuais.</p>
    </section>`;
    if (!C.servidor) { document.getElementById("msg").textContent = "Servidor não configurado nesta versão."; document.getElementById("ir").disabled = true; return; }
    document.getElementById("ir").onclick = async () => {
      const cod = document.getElementById("cod").value.trim().toUpperCase();
      if (cod.length !== 6) return document.getElementById("msg").textContent = "O código tem 6 caracteres.";
      // O servidor devolve null para código errado (e conta a tentativa) e recusa quando há tentativas demais.
      let novo = null, erro = null;
      try { novo = await rpc("responsavel_vincular", {p_codigo: cod}); } catch(e){ erro = e; }
      if (!novo) return document.getElementById("msg").textContent = /tentativas/.test(erro?.message || "")
        ? "Muitas tentativas. Espere uma hora e tente de novo." : "Código inválido ou vencido. Peça um novo no app.";
      token = novo; try { localStorage.setItem(tokKey, token); } catch(e){} painel();
    };
  }
  async function painel(){
    let p;
    try { p = await rpc("responsavel_painel", {p_token: token}); }
    catch(e){ try { localStorage.removeItem(tokKey); } catch(_){} return telaCodigo("O acesso foi encerrado. Peça um novo código."); }
    const max = Math.max(30, ...p.dias.map(d => d.minutos), p.limite_min || 0);
    const dia = s => ["dom","seg","ter","qua","qui","sex","sáb"][new Date(s + "T12:00").getDay()];
    const total = p.dias.reduce((a, d) => a + d.minutos, 0), metas = p.dias.filter(d => d.meta_ok).length;
    const areas = Object.entries(AREAS).map(([k, n]) => { const a = p.areas[k]; const pct = a ? Math.round(100 * a.acertos / a.respondidas) : null;
      return `<div class="arearow"><span>${n}</span><span class="trk"><i style="width:${pct ?? 0}%"></i></span><b>${pct == null ? "—" : pct + "%"}</b></div>`; }).join("");
    el.innerHTML = `<section class="screen">
      <div class="eyebrow">Últimos 7 dias</div><h2>${esc(p.apelido)}</h2>
      <div class="tiles"><div class="tile"><b>${total}</b><span>minutos</span></div><div class="tile"><b>${metas}/7</b><span>metas cumpridas</span></div><div class="tile"><b>${p.ofensiva}</b><span>dias seguidos</span></div></div>
      <div class="card"><h3>Minutos por dia</h3>
        <div class="semana">${p.dias.map(d => `<div class="col"><small>${d.minutos}</small><div class="b ${d.meta_ok ? "meta" : ""}" style="height:${Math.round(100 * d.minutos / max)}%"></div><small>${dia(d.dia)}</small></div>`).join("")}</div>
        <p class="muted small">Laranja = meta do dia cumprida.${p.limite_min ? ` Limite combinado: ${p.limite_min} min/dia.` : ""}</p></div>
      <div class="card"><h3>Acertos por área</h3>${areas}<p class="muted small">Questões das provas antigas do ENEM respondidas na semana.</p></div>
      <div class="card"><h3>Combinados</h3>
        <div class="campo"><label for="lim">Limite de estudo por dia no app</label>
          <select id="lim"><option value="">Sem limite</option>${[15,20,30,45,60,90,120].map(m => `<option value="${m}" ${p.limite_min === m ? "selected" : ""}>${m} minutos</option>`).join("")}</select></div>
        <label class="switch"><span>Permitir duelos (contra robô de treino)</span><input type="checkbox" id="duel" ${p.duelos_ok ? "checked" : ""}></label>
        <button class="cta" id="salvar">Salvar combinados</button>
        <p class="muted small">Quando o limite é atingido, o app mostra uma pausa até o dia seguinte. A ofensiva do estudante não se perde.</p></div>
      <button class="ghost" id="sair">Parar de acompanhar</button>
    </section>`;
    document.getElementById("salvar").onclick = async () => {
      const v = document.getElementById("lim").value;
      try { await rpc("responsavel_ajustar", {p_token: token, p_limite_min: v ? +v : null, p_duelos_ok: document.getElementById("duel").checked}); toast("Combinados salvos. O app atualiza na próxima conexão."); }
      catch(e){ toast("Não foi possível salvar: " + e.message); }
    };
    document.getElementById("sair").onclick = async () => {
      const b = document.getElementById("sair");
      if (!b.dataset.ok) { b.dataset.ok = 1; b.textContent = "Toque de novo para confirmar"; return; }
      try { await rpc("responsavel_desvincular", {p_token: token}); } catch(e){}
      try { localStorage.removeItem(tokKey); } catch(e){}
      token = null; telaCodigo("Acompanhamento encerrado.");
    };
  }
  token ? painel() : telaCodigo();
})();
