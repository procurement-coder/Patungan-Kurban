const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.SUPABASE_CONFIG;
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let participants = [];
let contributions = [];
let targetPerOrang = 0;

function rupiah(n){
  return "Rp" + Math.round(n).toLocaleString("id-ID");
}
function formatDate(iso){
  return new Date(iso).toLocaleDateString("id-ID", { day:"2-digit", month:"short", year:"numeric" });
}

async function loadAll(){
  const [{ data: p, error: pErr }, { data: c, error: cErr }, { data: s, error: sErr }] = await Promise.all([
    supabase.from("participants").select("*").order("id"),
    supabase.from("contributions").select("*").order("created_at", { ascending: false }),
    supabase.from("settings").select("*").eq("key", "target_per_orang").maybeSingle()
  ]);

  if(pErr || cErr){
    document.getElementById("roster").innerHTML =
      `<p class="empty">Gagal memuat data. Pastikan config.js sudah diisi dengan URL dan anon key Supabase yang benar, dan skema SQL sudah dijalankan.</p>`;
    console.error(pErr || cErr);
    return;
  }

  participants = p || [];
  contributions = c || [];
  targetPerOrang = s && s.value ? parseFloat(s.value) : 2600000;

  document.getElementById("input-target").value = targetPerOrang;

  renderAll();
}

function totalOf(participantId){
  return contributions
    .filter(c => c.participant_id === participantId)
    .reduce((sum, c) => sum + parseFloat(c.amount), 0);
}

function renderAll(){
  renderHero();
  renderRoster();
  renderSelect();
  renderFeed();
}

function renderHero(){
  const grandTotal = contributions.reduce((s, c) => s + parseFloat(c.amount), 0);
  const overallTarget = targetPerOrang * participants.length;
  const pct = overallTarget > 0 ? Math.min(100, Math.round((grandTotal / overallTarget) * 100)) : 0;

  document.getElementById("grand-total").textContent = rupiah(grandTotal);
  document.getElementById("progress-pct").textContent = pct + "%";
  document.getElementById("progress-fill").style.width = pct + "%";
}

function renderRoster(){
  const el = document.getElementById("roster");
  if(participants.length === 0){
    el.innerHTML = `<p class="empty">Belum ada peserta. Jalankan supabase-schema.sql untuk mengisi data awal.</p>`;
    return;
  }
  el.innerHTML = participants.map((p, i) => {
    const total = totalOf(p.id);
    const count = contributions.filter(c => c.participant_id === p.id).length;
    const lunas = targetPerOrang > 0 && total >= targetPerOrang;
    return `
      <div class="roster-row">
        <span class="roster-idx">${String(i+1).padStart(2,"0")}</span>
        <div class="roster-name">${p.name}<span class="sub">${count} setoran</span></div>
        <span class="chip ${lunas ? "lunas" : ""}">${lunas ? "Lunas" : rupiah(targetPerOrang - total) + " lagi"}</span>
        <span class="roster-amount">${rupiah(total)}</span>
      </div>`;
  }).join("");
}

function renderSelect(){
  const el = document.getElementById("select-name");
  const prev = el.value;
  el.innerHTML = participants.map(p => `<option value="${p.id}">${p.name}</option>`).join("");
  if(prev) el.value = prev;
}

function renderFeed(){
  const el = document.getElementById("stamp-feed");
  if(contributions.length === 0){
    el.innerHTML = `<p class="empty">Belum ada setoran yang tercatat.</p>`;
    return;
  }
  el.innerHTML = contributions.map(c => {
    const p = participants.find(p => p.id === c.participant_id);
    return `
      <div class="stamp-entry">
        <div class="stamp">Lunas<br>${formatDate(c.created_at)}</div>
        <div class="stamp-info">
          <div class="who">${p ? p.name : "Tidak diketahui"}</div>
          <div class="when">${formatDate(c.created_at)}${c.note ? " &middot; " + c.note : ""}</div>
        </div>
        <div class="stamp-amount">${rupiah(c.amount)}</div>
        <button class="del-link" data-id="${c.id}" aria-label="Hapus setoran"><i class="ti ti-trash"></i>&times;</button>
      </div>`;
  }).join("");

  el.querySelectorAll(".del-link").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      const { error } = await supabase.from("contributions").delete().eq("id", id);
      if(!error){
        contributions = contributions.filter(c => String(c.id) !== String(id));
        renderAll();
      }
    });
  });
}

// ---- tabs ----
document.querySelectorAll("nav.tabs button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("nav.tabs button").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("panel-" + btn.dataset.panel).classList.add("active");
  });
});

// ---- add contribution ----
document.getElementById("btn-add").addEventListener("click", async () => {
  const participantId = document.getElementById("select-name").value;
  const amountInput = document.getElementById("input-amount");
  const noteInput = document.getElementById("input-note");
  const amount = parseFloat(amountInput.value);

  if(!participantId || !amount || amount <= 0) return;

  const { data, error } = await supabase
    .from("contributions")
    .insert({ participant_id: participantId, amount, note: noteInput.value || null })
    .select()
    .single();

  if(error){
    console.error(error);
    return;
  }

  contributions.unshift(data);
  amountInput.value = "";
  noteInput.value = "";
  renderAll();
});

// ---- save target ----
document.getElementById("btn-save-target").addEventListener("click", async () => {
  const val = parseFloat(document.getElementById("input-target").value);
  if(!val || val <= 0) return;

  const { error } = await supabase
    .from("settings")
    .upsert({ key: "target_per_orang", value: String(val) });

  if(!error){
    targetPerOrang = val;
    renderAll();
  }
});

loadAll();
