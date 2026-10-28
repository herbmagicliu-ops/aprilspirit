/* 站內搜尋：讀 /search.json，在瀏覽器裡比對。中文用字串比對，不需要斷詞。 */
(function () {
  var G = typeof window !== 'undefined' ? window : globalThis;

  function clean(t) {
    return (t || '')
      .replace(/\{\{[^}]*\}\}|\{%[^%]*%\}/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function reEscape(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function prepare(list) {
    return list.map(function (d) {
      d.content = clean(d.content);
      d._t = (d.title || '').toLowerCase();
      d._c = d.content.toLowerCase();
      d._p = (d.topic || '').toLowerCase();
      return d;
    });
  }

  function terms(q) {
    return q.toLowerCase().split(/\s+/).filter(Boolean);
  }

  function countOf(hay, needle) {
    var n = 0, i = 0;
    while ((i = hay.indexOf(needle, i)) !== -1) { n++; i += needle.length; }
    return n;
  }

  function search(data, q) {
    var ts = terms(q);
    if (!ts.length) return [];
    var out = [];
    data.forEach(function (d) {
      var score = 0;
      for (var k = 0; k < ts.length; k++) {
        var t = ts[k];
        var inT = d._t.indexOf(t) !== -1;
        var inP = d._p.indexOf(t) !== -1;
        var nC = countOf(d._c, t);
        if (!inT && !inP && !nC) return; // 每個詞都要出現
        score += (inT ? 10 : 0) + (inP ? 3 : 0) + Math.min(nC, 5);
      }
      out.push({ d: d, score: score });
    });
    out.sort(function (a, b) { return b.score - a.score; });
    return out.map(function (x) { return x.d; });
  }

  function highlight(text, ts) {
    if (!ts.length) return esc(text);
    var re = new RegExp('(' + ts.map(reEscape).join('|') + ')', 'gi');
    return text.split(re).map(function (part, i) {
      return i % 2 ? '<mark>' + esc(part) + '</mark>' : esc(part);
    }).join('');
  }

  function snippet(d, ts) {
    var text = d.content;
    if (!text) return '';
    var low = d._c, idx = -1;
    for (var k = 0; k < ts.length; k++) {
      idx = low.indexOf(ts[k]);
      if (idx !== -1) break;
    }
    var start = idx > 30 ? idx - 30 : 0;
    var piece = text.substr(start, 110);
    return (start > 0 ? '…' : '') + piece + (start + 110 < text.length ? '…' : '');
  }

  G.AprilSearch = { clean: clean, prepare: prepare, search: search, highlight: highlight, snippet: snippet, terms: terms };

  /* ---- 以下是頁面互動，只在瀏覽器、且在搜尋頁才執行 ---- */
  if (typeof document === 'undefined') return;
  var root = document.getElementById('search-app');
  if (!root) return;

  var input = document.getElementById('search-input');
  var form = document.getElementById('search-form');
  var results = document.getElementById('search-results');
  var status = document.getElementById('search-status');
  var data = null, loading = null, composing = false;

  function load() {
    if (loading) return loading;
    loading = fetch(root.getAttribute('data-index'))
      .then(function (r) { return r.json(); })
      .then(function (j) { data = prepare(j); return data; });
    return loading;
  }

  function render(q) {
    var ts = terms(q);
    if (!ts.length) {
      results.innerHTML = '';
      status.textContent = '輸入想找的詞，按 Enter 或點「搜尋」。多個詞用空白隔開，會找同時出現這些詞的內容。';
      return;
    }
    var found = search(data, q);
    if (!found.length) {
      results.innerHTML = '';
      status.textContent = '找不到「' + q + '」。換個說法，或少打幾個字試試。';
      return;
    }
    status.textContent = '找到 ' + found.length + ' 筆結果';
    results.innerHTML = '<ul class="entry-list">' + found.map(function (d) {
      var tags = '<span class="tag">' + esc(d.type) + '</span>' +
        (d.topic ? '<span class="tag">' + esc(d.topic) + '</span>' : '');
      return '<li><article><p class="meta">' + tags + '</p>' +
        '<h3><a href="' + esc(d.url) + '">' + highlight(d.title, ts) + '</a></h3>' +
        '<p>' + highlight(snippet(d, ts), ts) + '</p></article></li>';
    }).join('') + '</ul>';
  }

  function run() {
    var q = input.value;
    if (history.replaceState) {
      var url = location.pathname + (q.trim() ? '?q=' + encodeURIComponent(q.trim()) : '');
      history.replaceState(null, '', url);
    }
    status.textContent = '搜尋中…';
    load().then(function () { render(q); }, function () {
      status.textContent = '搜尋功能暫時無法使用，請稍後再試。';
    });
  }

  input.addEventListener('compositionstart', function () { composing = true; });
  input.addEventListener('compositionend', function () { composing = false; run(); });
  input.addEventListener('input', function () { if (!composing) run(); });
  form.addEventListener('submit', function (e) { e.preventDefault(); run(); });

  var m = location.search.match(/[?&]q=([^&]*)/);
  if (m) {
    try { input.value = decodeURIComponent(m[1].replace(/\+/g, ' ')); } catch (e) { input.value = m[1]; }
  }
  if (input.value.trim()) { run(); } else { render(''); }
  input.focus();
})();
