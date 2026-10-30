// Client script for the sadcowgirl analytics panel (/panel-<KEY>/analytics).
// Fetches /api/stats and renders the lewdlevel-style terminal dashboard.
(function () {
  var KEY = (location.pathname.match(/^\/panel-([a-z0-9]+)\/analytics/) || [])[1] || '';
  var rangeEl = document.getElementById('range');
  function esc(s) { return (s || '').replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fmt(n) { return n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'K' : String(n); }
  function fmtTime(ts) { return new Date(String(ts).replace(' ', 'T') + 'Z').toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  function flagHTML(code) { return !code ? '' : '<img class="flag" src="https://flagcdn.com/w40/' + code.toLowerCase() + '.png" alt="">'; }
  function bar(n, max) { return '<div class="barwrap"><div class="bar" style="width:' + Math.round(100 * n / (max || 1)) + '%"></div></div>'; }
  function row(name, n, max) { return '<div class="row"><span class="name">' + name + '</span>' + bar(n, max) + '<span class="mono" style="width:70px;text-align:right">' + fmt(n) + '</span></div>'; }
  function card(label, val, note) { return '<div class="card"><div class="label">' + label + '</div><div class="val">' + val + '</div><div class="note">' + (note || '') + '</div></div>'; }
  var thumbs = {};
  fetch('/data/videos.json').then(function (x) { return x.json(); }).then(function (vs) {
    vs.forEach(function (v) { thumbs[v.id] = v; });
    render();
  }).catch(function () { render(); });
  window.__renderPanel = render;
  function render() {
    fetch('/api/stats?key=' + encodeURIComponent(KEY) + '&days=' + rangeEl.value).then(function (r) {
      if (!r.ok) throw new Error('bad key');
      return r.json();
    }).then(function (d) {
      var maxC = (d.top_countries[0] && d.top_countries[0].n) || 1;
      var maxP = (d.top_pages[0] && d.top_pages[0].n) || 1;
      var maxR = (d.referrers[0] && d.referrers[0].n) || 1;
      var maxV = (d.top_videos[0] && d.top_videos[0].n) || 1;
      var cats = d.top_categories.map(function (c) {
        var slug = c.path.replace('/c/', '');
        return row('<a class="mono" href="/c/' + esc(slug) + '">' + esc(decodeURIComponent(slug).replace(/-/g, ' ')) + '</a>', c.n, (d.top_categories[0] && d.top_categories[0].n) || 1);
      }).join('');
      var pages = d.top_pages.map(function (pg) {
        return row('<a class="mono" href="' + esc(pg.path) + '">' + esc(pg.path.slice(0, 70)) + '</a>', pg.n, maxP);
      }).join('');
      var html = [
        '<div class="cards">',
        card('TODAY', fmt(d.visits_today), 'page views so far'),
        card('PAGE VIEWS', fmt(d.pageviews), 'last ' + d.days + ' days'),
        card('UNIQUES', fmt(d.uniques), 'last ' + d.days + ' days'),
        card('BEST DAY', fmt(d.best_day), 'in the last ' + d.days + ' days'),
        card('COUNTRIES', d.countries_seen, 'seen in the last ' + d.days + ' days'),
        '</div>',
        '<div class="grid2"><div class="panel"><h3>VISITS / DAY</h3><canvas id="line" height="120"></canvas></div><div class="panel"><h3>DEVICES</h3><canvas id="device" height="160"></canvas></div></div>',
        '<div class="grid2"><div class="panel"><h3>TOP COUNTRIES</h3>' + (d.top_countries.map(function (c) { return row(flagHTML(c.code) + ' ' + esc(c.code || 'unknown'), c.n, maxC); }).join('') || '<div class="loading">no data yet</div>') + '</div>',
        '<div class="panel"><h3>REFERRERS</h3>' + (d.referrers.map(function (rf) { return row('<span class="mono">' + esc(rf.src.slice(0, 60)) + '</span>', rf.n, maxR); }).join('') || '<div class="loading">no referrer data yet</div>') + '</div></div>',
        '<div class="panel" style="margin-top:12px"><h3>TOP VIDEOS — WATCH EVENTS</h3><div id="topvideos"><div class="loading">loading…</div></div></div>',
        '<div class="grid2"><div class="panel"><h3>TOP PAGES</h3>' + (pages || '<div class="loading">no data yet</div>') + '</div><div class="panel"><h3>TOP CATEGORIES</h3>' + (cats || '<div class="loading">no data yet</div>') + '</div></div>',
        '<div class="panel" style="margin-top:12px"><h3>RECENT VISITORS — LIVE FEED</h3><table><thead><tr><th>TIME</th><th>COUNTRY</th><th>KIND</th><th>PAGE</th><th>DEVICE</th></tr></thead><tbody>',
        d.live.map(function (v) { return '<tr><td class="mono">' + fmtTime(v.ts) + '</td><td>' + flagHTML(v.country) + ' ' + esc(v.country || '') + '</td><td><span class="chip">' + esc(v.kind) + '</span></td><td class="mono">' + esc(v.path) + '</td><td>' + esc(v.device) + '</td></tr>'; }).join(''),
        '</tbody></table></div>'
      ].join('\n');
      document.getElementById('content').innerHTML = html;
      var tv = document.getElementById('topvideos');
      if (tv) tv.innerHTML = d.top_videos.map(function (w) {
        var m = thumbs[w.id] || {};
        return '<div class="row"><img class="th" src="' + (m.thumbUrl || '') + '"><span class="name">' + esc(m.title || w.id) + '</span>' + bar(w.n, maxV) + '<span class="mono" style="width:70px;text-align:right">' + fmt(w.n) + '</span></div>';
      }).join('') || '<div class="loading">no watch events yet</div>';
      if (window.Chart) {
        new Chart(document.getElementById('line'), { type: 'line', data: { labels: d.series.map(function (s) { return s.day.slice(5); }), datasets: [{ data: d.series.map(function (s) { return s.n; }), borderColor: '#E07A5F', backgroundColor: 'rgba(224,122,95,.12)', fill: true, tension: 0.3, pointRadius: 2 }] }, options: { plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#737373' } }, y: { ticks: { color: '#737373' }, beginAtZero: true } } } });
        new Chart(document.getElementById('device'), { type: 'bar', data: { labels: d.devices.map(function (x) { return x.device || 'unknown'; }), datasets: [{ data: d.devices.map(function (x) { return x.n; }), backgroundColor: '#ffffff' }] }, options: { plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#737373' } }, y: { ticks: { color: '#737373' }, beginAtZero: true } } } });
      }
    }).catch(function (e) {
      document.getElementById('content').textContent = 'failed to load analytics (' + e + ')';
    });
  }
  rangeEl.addEventListener('change', render);
  setInterval(render, 30000);
})();