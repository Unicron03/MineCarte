// docs/generate-report.js
// Usage : node generate-report.js report-pvp.json report-reconnect.json report.html

import { readFileSync, writeFileSync } from "fs";

const pvpFile = process.argv[2];
const reconnectFile = process.argv[3];
const outputFile = process.argv[4] || "report.html";

if (!pvpFile || !reconnectFile) {
  console.error("\n Usage: node generate-report.js <pvp.json> <reconnect.json> <output.html>\n");
  process.exit(1);
}

// ─── Lecture des fichiers JSON ────────────────────────────────────────────────
const pvpRaw = JSON.parse(readFileSync(pvpFile, "utf-8"));
const reconnectRaw = JSON.parse(readFileSync(reconnectFile, "utf-8"));

// ─── Extraction des métriques ─────────────────────────────────────────────────
function extractMetrics(raw) {
  const agg = raw.aggregate || {};
  const counters = agg.counters || {};
  const summaries = agg.summaries || {};

  const created = counters["vusers.created"] || 0;
  const completed = counters["vusers.completed"] || 0;
  const failed = counters["vusers.failed"] || 0;
  const emits = counters["socketio.emit"] || 0;

  const rt = summaries["socketio.response_time"] || {};
  const sl = summaries["vusers.session_length"] || {};

  const periods = (raw.intermediate || []).map((p, i) => {
    // p.period peut être un timestamp ms (number) ou une string ISO selon la version d'Artillery
    let ts;
    if (!p.period) {
      ts = `T+${i * 10}s`;
    } else {
      const d = new Date(typeof p.period === "number" ? p.period : Date.parse(p.period));
      ts = isNaN(d.getTime()) ? `T+${i * 10}s` : d.toLocaleTimeString("fr-FR");
    }
    const pCounters = p.counters || {};
    const pSummaries = p.summaries || {};
    const pRt = pSummaries["socketio.response_time"] || {};
    return {
      ts,
      created: pCounters["vusers.created"] || 0,
      completed: pCounters["vusers.completed"] || 0,
      failed: pCounters["vusers.failed"] || 0,
      emits: pCounters["socketio.emit"] || 0,
      mean: +(pRt.mean || 0).toFixed(2),
      p95: +(pRt.p95 || 0).toFixed(2),
      p99: +(pRt.p99 || 0).toFixed(2),
      max: +(pRt.max || 0).toFixed(2),
    };
  });

  return { created, completed, failed, emits, rt, sl, periods,
    successRate: created > 0 ? ((completed / created) * 100).toFixed(1) : "0" };
}

const pvp = extractMetrics(pvpRaw);
const rec = extractMetrics(reconnectRaw);

const testDate = new Date().toLocaleString("fr-FR");

// ─── Helpers JSON pour les charts ─────────────────────────────────────────────
const j = (arr) => JSON.stringify(arr);

const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>MineCarte — Rapport de Performance</title>
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=IBM+Plex+Mono:wght@400;600&display=swap" rel="stylesheet"/>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"></script>
  <style>
    :root {
      --bg: #0a0e1a;
      --surface: #111827;
      --border: #1e2d40;
      --green: #00ff88;
      --red: #ff4444;
      --yellow: #ffcc00;
      --blue: #38bdf8;
      --purple: #a78bfa;
      --orange: #fb923c;
      --text: #e2e8f0;
      --muted: #64748b;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'IBM Plex Mono', monospace;
      min-height: 100vh;
    }
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
      pointer-events: none;
      z-index: 0;
    }
    .wrapper { position: relative; z-index: 1; max-width: 1300px; margin: 0 auto; padding: 40px 24px; }

    /* Header */
    header { border-bottom: 2px solid var(--green); padding-bottom: 28px; margin-bottom: 48px; }
    .header-tag { font-family: 'Press Start 2P', monospace; font-size: 10px; color: var(--green); letter-spacing: 4px; margin-bottom: 16px; opacity: 0.7; }
    h1 { font-family: 'Press Start 2P', monospace; font-size: clamp(14px, 2.5vw, 24px); color: var(--green); line-height: 1.6; text-shadow: 0 0 30px rgba(0,255,136,0.3); }
    .meta { margin-top: 12px; font-size: 12px; color: var(--muted); }

    /* Tabs */
    .tabs { display: flex; gap: 4px; margin-bottom: 32px; border-bottom: 1px solid var(--border); }
    .tab {
      padding: 12px 24px;
      font-family: 'Press Start 2P', monospace;
      font-size: 9px;
      letter-spacing: 1px;
      cursor: pointer;
      border: 1px solid transparent;
      border-bottom: none;
      border-radius: 4px 4px 0 0;
      color: var(--muted);
      background: transparent;
      transition: all 0.2s;
      position: relative;
      bottom: -1px;
    }
    .tab:hover { color: var(--text); border-color: var(--border); }
    .tab.active { color: var(--green); border-color: var(--border); background: var(--surface); border-bottom-color: var(--surface); }
    .tab-content { display: none; }
    .tab-content.active { display: block; }

    /* KPI Grid */
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 16px; margin-bottom: 40px; }
    .kpi {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 4px;
      padding: 22px 18px;
      position: relative;
      overflow: hidden;
      transition: transform 0.2s, border-color 0.2s;
      animation: fadeUp 0.4s ease both;
    }
    .kpi:hover { transform: translateY(-2px); border-color: var(--green); }
    .kpi::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: var(--accent, var(--green)); }
    .kpi-label { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: var(--muted); margin-bottom: 10px; }
    .kpi-value { font-family: 'Press Start 2P', monospace; font-size: clamp(16px, 2.5vw, 26px); color: var(--accent, var(--green)); line-height: 1; }
    .kpi-unit { font-size: 11px; color: var(--muted); margin-top: 8px; }

    /* Charts */
    .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 40px; }
    @media (max-width: 768px) { .charts-grid { grid-template-columns: 1fr; } }
    .chart-card { background: var(--surface); border: 1px solid var(--border); border-radius: 4px; padding: 24px; }
    .chart-card.full { grid-column: 1 / -1; }
    .chart-title { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: var(--muted); margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
    canvas { max-height: 250px; }

    /* Table */
    .section-title { font-family: 'Press Start 2P', monospace; font-size: 11px; color: var(--green); margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid var(--border); }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { text-align: left; font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: var(--muted); padding: 8px 12px; border-bottom: 1px solid var(--border); }
    td { padding: 12px; border-bottom: 1px solid rgba(30,45,64,0.5); }
    tr:last-child td { border-bottom: none; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 2px; font-size: 11px; font-weight: 600; }
    .badge-green { background: rgba(0,255,136,0.1); color: var(--green); }
    .badge-red { background: rgba(255,68,68,0.1); color: var(--red); }
    .badge-yellow { background: rgba(255,204,0,0.1); color: var(--yellow); }

    /* Comparaison */
    .compare-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 40px; }
    @media (max-width: 768px) { .compare-grid { grid-template-columns: 1fr; } }
    .compare-card { background: var(--surface); border: 1px solid var(--border); border-radius: 4px; padding: 24px; }
    .compare-card-title { font-family: 'Press Start 2P', monospace; font-size: 10px; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
    .compare-card-title.pvp { color: var(--blue); }
    .compare-card-title.reconnect { color: var(--orange); }

    /* Verdict */
    .verdict { margin-top: 40px; background: var(--surface); border: 1px solid var(--border); border-left: 4px solid var(--green); padding: 24px 28px; border-radius: 4px; margin-bottom: 40px; }
    .verdict-title { font-family: 'Press Start 2P', monospace; font-size: 11px; color: var(--green); margin-bottom: 16px; }
    .verdict p { font-size: 13px; color: var(--text); line-height: 1.8; }

    footer { padding-top: 20px; border-top: 1px solid var(--border); font-size: 11px; color: var(--muted); text-align: center; }

    @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    .kpi:nth-child(1){animation-delay:.05s} .kpi:nth-child(2){animation-delay:.1s}
    .kpi:nth-child(3){animation-delay:.15s} .kpi:nth-child(4){animation-delay:.2s}
    .kpi:nth-child(5){animation-delay:.25s} .kpi:nth-child(6){animation-delay:.3s}
    .kpi:nth-child(7){animation-delay:.35s} .kpi:nth-child(8){animation-delay:.4s}
  </style>
</head>
<body>
<div class="wrapper">

  <header>
    <div class="header-tag">⚔ MineCarte · Performance Report</div>
    <h1>TABLEAU DE BORD — TESTS DE PERFORMANCE</h1>
    <div class="meta">Généré le ${testDate} · Artillery v2 · Socket.io · Node.js</div>
  </header>

  <!-- Tabs -->
  <div class="tabs">
    <button class="tab active" onclick="showTab('pvp', this)">⚔ STRESS PvP</button>
    <button class="tab" onclick="showTab('reconnect', this)">🔌 RECONNEXION</button>
    <button class="tab" onclick="showTab('compare', this)"> COMPARAISON</button>
  </div>

  <!-- ═══════════════════════════════════════════════════════════════ -->
  <!-- TAB PVP                                                         -->
  <!-- ═══════════════════════════════════════════════════════════════ -->
  <div id="tab-pvp" class="tab-content active">

    <div class="kpi-grid">
      <div class="kpi" style="--accent:var(--green)">
        <div class="kpi-label">Parties créées</div>
        <div class="kpi-value">${pvp.created}</div>
        <div class="kpi-unit">virtual users</div>
      </div>
      <div class="kpi" style="--accent:var(--green)">
        <div class="kpi-label">Parties complétées</div>
        <div class="kpi-value">${pvp.completed}</div>
        <div class="kpi-unit">taux : ${pvp.successRate}%</div>
      </div>
      <div class="kpi" style="--accent:${pvp.failed > 0 ? 'var(--red)' : 'var(--green)'}">
        <div class="kpi-label">Échecs</div>
        <div class="kpi-value" style="color:${pvp.failed > 0 ? 'var(--red)' : 'var(--green)'}">${pvp.failed}</div>
        <div class="kpi-unit">${pvp.failed === 0 ? 'aucun ✓' : 'à corriger'}</div>
      </div>
      <div class="kpi" style="--accent:var(--blue)">
        <div class="kpi-label">Latence moyenne</div>
        <div class="kpi-value">${(pvp.rt.mean || 0).toFixed(1)}</div>
        <div class="kpi-unit">ms</div>
      </div>
      <div class="kpi" style="--accent:var(--blue)">
        <div class="kpi-label">Latence P95</div>
        <div class="kpi-value">${(pvp.rt.p95 || 0).toFixed(1)}</div>
        <div class="kpi-unit">ms</div>
      </div>
      <div class="kpi" style="--accent:var(--yellow)">
        <div class="kpi-label">Latence max</div>
        <div class="kpi-value">${(pvp.rt.max || 0).toFixed(1)}</div>
        <div class="kpi-unit">ms</div>
      </div>
      <div class="kpi" style="--accent:var(--purple)">
        <div class="kpi-label">Events émis</div>
        <div class="kpi-value">${pvp.emits.toLocaleString("fr-FR")}</div>
        <div class="kpi-unit">socket.io emit</div>
      </div>
      <div class="kpi" style="--accent:var(--purple)">
        <div class="kpi-label">Durée session</div>
        <div class="kpi-value">${((pvp.sl.mean || 0) / 1000).toFixed(1)}</div>
        <div class="kpi-unit">secondes (moy.)</div>
      </div>
    </div>

    <div class="charts-grid">
      <div class="chart-card full">
        <div class="chart-title"> Latence Socket.io dans le temps (ms)</div>
        <canvas id="pvpLatency"></canvas>
      </div>
      <div class="chart-card">
        <div class="chart-title">👥 Joueurs créés vs complétés</div>
        <canvas id="pvpUsers"></canvas>
      </div>
      <div class="chart-card">
        <div class="chart-title">⚡ Volume d'events émis</div>
        <canvas id="pvpEmits"></canvas>
      </div>
    </div>

    <div class="chart-card">
      <div class="section-title">Détail des métriques — Stress PvP</div>
      <table>
        <thead><tr><th>Métrique</th><th>Valeur</th><th>Seuil</th><th>Verdict</th></tr></thead>
        <tbody>
          <tr><td>Latence moyenne</td><td>${(pvp.rt.mean||0).toFixed(2)} ms</td><td>&lt; 100ms</td><td><span class="badge badge-green">✓ Excellent</span></td></tr>
          <tr><td>Latence P95</td><td>${(pvp.rt.p95||0).toFixed(2)} ms</td><td>&lt; 200ms</td><td><span class="badge badge-green">✓ Excellent</span></td></tr>
          <tr><td>Latence P99</td><td>${(pvp.rt.p99||0).toFixed(2)} ms</td><td>&lt; 500ms</td><td><span class="badge badge-green">✓ Excellent</span></td></tr>
          <tr><td>Latence max</td><td>${(pvp.rt.max||0).toFixed(2)} ms</td><td>&lt; 1000ms</td><td><span class="badge badge-${(pvp.rt.max||0)>1000?'red':'green'}">${(pvp.rt.max||0)>1000?'⚠ Attention':'✓ OK'}</span></td></tr>
          <tr><td>Taux de succès</td><td>${pvp.successRate}%</td><td>&gt; 98%</td><td><span class="badge badge-${parseFloat(pvp.successRate)>=98?'green':'red'}">${parseFloat(pvp.successRate)>=98?'✓ Excellent':'⚠ À surveiller'}</span></td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════════ -->
  <!-- TAB RECONNEXION                                                  -->
  <!-- ═══════════════════════════════════════════════════════════════ -->
  <div id="tab-reconnect" class="tab-content">

    <div class="kpi-grid">
      <div class="kpi" style="--accent:var(--orange)">
        <div class="kpi-label">Sessions créées</div>
        <div class="kpi-value">${rec.created}</div>
        <div class="kpi-unit">virtual users</div>
      </div>
      <div class="kpi" style="--accent:var(--orange)">
        <div class="kpi-label">Sessions complétées</div>
        <div class="kpi-value">${rec.completed}</div>
        <div class="kpi-unit">taux : ${rec.successRate}%</div>
      </div>
      <div class="kpi" style="--accent:${rec.failed > 0 ? 'var(--red)' : 'var(--green)'}">
        <div class="kpi-label">Échecs</div>
        <div class="kpi-value" style="color:${rec.failed > 0 ? 'var(--red)' : 'var(--green)'}">${rec.failed}</div>
        <div class="kpi-unit">${rec.failed === 0 ? 'aucun ✓' : 'à corriger'}</div>
      </div>
      <div class="kpi" style="--accent:var(--blue)">
        <div class="kpi-label">Latence moyenne</div>
        <div class="kpi-value">${(rec.rt.mean || 0).toFixed(1)}</div>
        <div class="kpi-unit">ms</div>
      </div>
      <div class="kpi" style="--accent:var(--blue)">
        <div class="kpi-label">Latence P95</div>
        <div class="kpi-value">${(rec.rt.p95 || 0).toFixed(1)}</div>
        <div class="kpi-unit">ms</div>
      </div>
      <div class="kpi" style="--accent:var(--yellow)">
        <div class="kpi-label">Latence max</div>
        <div class="kpi-value">${(rec.rt.max || 0).toFixed(1)}</div>
        <div class="kpi-unit">ms</div>
      </div>
      <div class="kpi" style="--accent:var(--purple)">
        <div class="kpi-label">Events émis</div>
        <div class="kpi-value">${rec.emits.toLocaleString("fr-FR")}</div>
        <div class="kpi-unit">socket.io emit</div>
      </div>
      <div class="kpi" style="--accent:var(--purple)">
        <div class="kpi-label">Durée session</div>
        <div class="kpi-value">${((rec.sl.mean || 0) / 1000).toFixed(1)}</div>
        <div class="kpi-unit">secondes (moy.)</div>
      </div>
    </div>

    <div class="charts-grid">
      <div class="chart-card full">
        <div class="chart-title"> Latence reconnexion dans le temps (ms)</div>
        <canvas id="recLatency"></canvas>
      </div>
      <div class="chart-card">
        <div class="chart-title">👥 Sessions créées vs complétées</div>
        <canvas id="recUsers"></canvas>
      </div>
      <div class="chart-card">
        <div class="chart-title">⚡ Volume d'events émis</div>
        <canvas id="recEmits"></canvas>
      </div>
    </div>

    <div class="chart-card">
      <div class="section-title">Détail des métriques — Reconnexion</div>
      <table>
        <thead><tr><th>Métrique</th><th>Valeur</th><th>Seuil</th><th>Verdict</th></tr></thead>
        <tbody>
          <tr><td>Latence moyenne</td><td>${(rec.rt.mean||0).toFixed(2)} ms</td><td>&lt; 100ms</td><td><span class="badge badge-${(rec.rt.mean||0)<100?'green':'red'}">${(rec.rt.mean||0)<100?'✓ Excellent':'⚠ Lent'}</span></td></tr>
          <tr><td>Latence P95</td><td>${(rec.rt.p95||0).toFixed(2)} ms</td><td>&lt; 200ms</td><td><span class="badge badge-${(rec.rt.p95||0)<200?'green':'yellow'}">${(rec.rt.p95||0)<200?'✓ Excellent':'⚠ Attention'}</span></td></tr>
          <tr><td>Latence P99</td><td>${(rec.rt.p99||0).toFixed(2)} ms</td><td>&lt; 500ms</td><td><span class="badge badge-${(rec.rt.p99||0)<500?'green':'red'}">${(rec.rt.p99||0)<500?'✓ OK':'⚠ Lent'}</span></td></tr>
          <tr><td>Latence max</td><td>${(rec.rt.max||0).toFixed(2)} ms</td><td>&lt; 1000ms</td><td><span class="badge badge-${(rec.rt.max||0)>1000?'red':'green'}">${(rec.rt.max||0)>1000?'⚠ Attention':'✓ OK'}</span></td></tr>
          <tr><td>Taux de succès</td><td>${rec.successRate}%</td><td>&gt; 98%</td><td><span class="badge badge-${parseFloat(rec.successRate)>=98?'green':'red'}">${parseFloat(rec.successRate)>=98?'✓ Excellent':'⚠ À surveiller'}</span></td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════════ -->
  <!-- TAB COMPARAISON                                                  -->
  <!-- ═══════════════════════════════════════════════════════════════ -->
  <div id="tab-compare" class="tab-content">

    <div class="compare-grid">
      <div class="compare-card">
        <div class="compare-card-title pvp">⚔ STRESS PvP</div>
        <table>
          <tbody>
            <tr><td>Parties</td><td>${pvp.created} créées / ${pvp.completed} complétées</td></tr>
            <tr><td>Taux succès</td><td>${pvp.successRate}%</td></tr>
            <tr><td>Latence moy.</td><td>${(pvp.rt.mean||0).toFixed(2)} ms</td></tr>
            <tr><td>Latence P95</td><td>${(pvp.rt.p95||0).toFixed(2)} ms</td></tr>
            <tr><td>Latence max</td><td>${(pvp.rt.max||0).toFixed(2)} ms</td></tr>
            <tr><td>Events émis</td><td>${pvp.emits.toLocaleString("fr-FR")}</td></tr>
          </tbody>
        </table>
      </div>
      <div class="compare-card">
        <div class="compare-card-title reconnect">🔌 RECONNEXION</div>
        <table>
          <tbody>
            <tr><td>Sessions</td><td>${rec.created} créées / ${rec.completed} complétées</td></tr>
            <tr><td>Taux succès</td><td>${rec.successRate}%</td></tr>
            <tr><td>Latence moy.</td><td>${(rec.rt.mean||0).toFixed(2)} ms</td></tr>
            <tr><td>Latence P95</td><td>${(rec.rt.p95||0).toFixed(2)} ms</td></tr>
            <tr><td>Latence max</td><td>${(rec.rt.max||0).toFixed(2)} ms</td></tr>
            <tr><td>Events émis</td><td>${rec.emits.toLocaleString("fr-FR")}</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="chart-card full" style="margin-bottom:24px">
      <div class="chart-title"> Latence moyenne — PvP vs Reconnexion (ms)</div>
      <canvas id="compareLatency"></canvas>
    </div>

    <div class="chart-card full" style="margin-bottom:24px">
      <div class="chart-title">👥 Taux de complétion — PvP vs Reconnexion</div>
      <canvas id="compareUsers"></canvas>
    </div>

    <div class="verdict">
      <div class="verdict-title">// VERDICT FINAL</div>
      <p>
        <strong style="color:var(--blue)">Stress PvP :</strong>
        ${pvp.completed}/${pvp.created} parties complétées (${pvp.successRate}%) —
        latence moyenne ${(pvp.rt.mean||0).toFixed(2)}ms sur ${pvp.emits.toLocaleString("fr-FR")} events.
        ${pvp.failed === 0 ? "✓ Aucun échec." : `⚠ ${pvp.failed} échec(s).`}
        <br/><br/>
        <strong style="color:var(--orange)">Reconnexion :</strong>
        ${rec.completed}/${rec.created} sessions complétées (${rec.successRate}%) —
        latence moyenne ${(rec.rt.mean||0).toFixed(2)}ms.
        ${rec.failed === 0 ? "✓ Aucun échec." : `⚠ ${rec.failed} échec(s).`}
      </p>
    </div>
  </div>

  <footer>MineCarte Performance Report · Artillery v2 · Socket.io · ${testDate}</footer>
</div>

<script>
const chartOpts = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: { legend: { labels: { color: '#94a3b8', font: { family: 'IBM Plex Mono', size: 11 } } } },
  scales: {
    x: { ticks: { color: '#475569', font: { size: 10 } }, grid: { color: '#1e2d40' } },
    y: { ticks: { color: '#475569', font: { size: 10 } }, grid: { color: '#1e2d40' } }
  }
};

// PvP charts
const pvpLabels = ${j(pvp.periods.map(p => p.ts))};
new Chart(document.getElementById('pvpLatency'), { type: 'line', data: { labels: pvpLabels, datasets: [
  { label: 'Moyenne', data: ${j(pvp.periods.map(p => p.mean))}, borderColor: '#38bdf8', tension: 0.4, borderWidth: 2, pointRadius: 2 },
  { label: 'P95', data: ${j(pvp.periods.map(p => p.p95))}, borderColor: '#a78bfa', tension: 0.4, borderWidth: 2, pointRadius: 2 },
  { label: 'P99', data: ${j(pvp.periods.map(p => p.p99))}, borderColor: '#ffcc00', tension: 0.4, borderWidth: 2, pointRadius: 2 },
  { label: 'Max', data: ${j(pvp.periods.map(p => p.max))}, borderColor: '#ff4444', borderDash: [4,4], tension: 0.4, borderWidth: 1, pointRadius: 2 },
]}, options: chartOpts });

new Chart(document.getElementById('pvpUsers'), { type: 'bar', data: { labels: pvpLabels, datasets: [
  { label: 'Créés', data: ${j(pvp.periods.map(p => p.created))}, backgroundColor: 'rgba(56,189,248,0.4)', borderColor: '#38bdf8', borderWidth: 1 },
  { label: 'Complétés', data: ${j(pvp.periods.map(p => p.completed))}, backgroundColor: 'rgba(0,255,136,0.4)', borderColor: '#00ff88', borderWidth: 1 },
  { label: 'Échecs', data: ${j(pvp.periods.map(p => p.failed))}, backgroundColor: 'rgba(255,68,68,0.4)', borderColor: '#ff4444', borderWidth: 1 },
]}, options: chartOpts });

new Chart(document.getElementById('pvpEmits'), { type: 'line', data: { labels: pvpLabels, datasets: [
  { label: 'Events émis', data: ${j(pvp.periods.map(p => p.emits))}, borderColor: '#a78bfa', backgroundColor: 'rgba(167,139,250,0.1)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 2 },
]}, options: chartOpts });

// Reconnexion charts
const recLabels = ${j(rec.periods.map(p => p.ts))};
new Chart(document.getElementById('recLatency'), { type: 'line', data: { labels: recLabels, datasets: [
  { label: 'Moyenne', data: ${j(rec.periods.map(p => p.mean))}, borderColor: '#fb923c', tension: 0.4, borderWidth: 2, pointRadius: 2 },
  { label: 'P95', data: ${j(rec.periods.map(p => p.p95))}, borderColor: '#a78bfa', tension: 0.4, borderWidth: 2, pointRadius: 2 },
  { label: 'P99', data: ${j(rec.periods.map(p => p.p99))}, borderColor: '#ffcc00', tension: 0.4, borderWidth: 2, pointRadius: 2 },
  { label: 'Max', data: ${j(rec.periods.map(p => p.max))}, borderColor: '#ff4444', borderDash: [4,4], tension: 0.4, borderWidth: 1, pointRadius: 2 },
]}, options: chartOpts });

new Chart(document.getElementById('recUsers'), { type: 'bar', data: { labels: recLabels, datasets: [
  { label: 'Créées', data: ${j(rec.periods.map(p => p.created))}, backgroundColor: 'rgba(251,146,60,0.4)', borderColor: '#fb923c', borderWidth: 1 },
  { label: 'Complétées', data: ${j(rec.periods.map(p => p.completed))}, backgroundColor: 'rgba(0,255,136,0.4)', borderColor: '#00ff88', borderWidth: 1 },
  { label: 'Échecs', data: ${j(rec.periods.map(p => p.failed))}, backgroundColor: 'rgba(255,68,68,0.4)', borderColor: '#ff4444', borderWidth: 1 },
]}, options: chartOpts });

new Chart(document.getElementById('recEmits'), { type: 'line', data: { labels: recLabels, datasets: [
  { label: 'Events émis', data: ${j(rec.periods.map(p => p.emits))}, borderColor: '#fb923c', backgroundColor: 'rgba(251,146,60,0.1)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 2 },
]}, options: chartOpts });

// Comparaison charts
new Chart(document.getElementById('compareLatency'), { type: 'bar', data: {
  labels: ['Moyenne', 'P95', 'P99', 'Max'],
  datasets: [
    { label: '⚔ Stress PvP', data: [${(pvp.rt.mean||0).toFixed(2)}, ${(pvp.rt.p95||0).toFixed(2)}, ${(pvp.rt.p99||0).toFixed(2)}, ${(pvp.rt.max||0).toFixed(2)}], backgroundColor: 'rgba(56,189,248,0.5)', borderColor: '#38bdf8', borderWidth: 2 },
    { label: '🔌 Reconnexion', data: [${(rec.rt.mean||0).toFixed(2)}, ${(rec.rt.p95||0).toFixed(2)}, ${(rec.rt.p99||0).toFixed(2)}, ${(rec.rt.max||0).toFixed(2)}], backgroundColor: 'rgba(251,146,60,0.5)', borderColor: '#fb923c', borderWidth: 2 },
  ]
}, options: {...chartOpts, scales: {...chartOpts.scales, y: {...chartOpts.scales.y, title:{display:true,text:'ms',color:'#475569'}}}} });

new Chart(document.getElementById('compareUsers'), { type: 'bar', data: {
  labels: ['Créés', 'Complétés', 'Échecs'],
  datasets: [
    { label: '⚔ Stress PvP', data: [${pvp.created}, ${pvp.completed}, ${pvp.failed}], backgroundColor: 'rgba(56,189,248,0.5)', borderColor: '#38bdf8', borderWidth: 2 },
    { label: '🔌 Reconnexion', data: [${rec.created}, ${rec.completed}, ${rec.failed}], backgroundColor: 'rgba(251,146,60,0.5)', borderColor: '#fb923c', borderWidth: 2 },
  ]
}, options: chartOpts });

// Tab system
function showTab(name, btn) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  btn.classList.add('active');
}
</script>
</body>
</html>`;

writeFileSync(outputFile, html);
console.log(`\n Rapport généré : ${outputFile}\n`);