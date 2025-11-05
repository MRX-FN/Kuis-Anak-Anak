/*
  New data-driven flow: fetch CSV -> convert to JSON -> iterate one by one.
  - If row.tipe === "Separator": show the post section (index.html line ~68 block)
  - Keep original script.js untouched; index.html now loads this file.
*/

/* =========================
   CONFIG
   ========================= */
const SHEET_PUBLISHED_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTWThY7lRZFjpKIuz5ofNDMy5XuEQ5wW31kD-Xb3ZpDN0dIRLkvgf1GWKjIuOdIG7JjRgXCMNVv5NA6/pubhtml?gid=0&single=true";

function toCsvExportUrl(publishedUrl) {
  // Convert
  // .../pubhtml?gid=0&single=true
  // to
  // .../pub?gid=0&single=true&output=csv
  try {
    const u = new URL(publishedUrl);
    // Replace last path segment 'pubhtml' with 'pub'
    const parts = u.pathname.split('/');
    const last = parts[parts.length - 1];
    if (last === 'pubhtml') parts[parts.length - 1] = 'pub';
    u.pathname = parts.join('/');
    u.searchParams.set('output', 'csv');
    return u.toString();
  } catch (_) {
    // Fallback: simple replace
    return publishedUrl.replace('/pubhtml?', '/pub?') + '&output=csv';
  }
}

/* =========================
   CSV PARSER (handles quotes, commas, newlines)
   ========================= */
function parseCsv(csvText) {
  const rows = [];
  let i = 0, field = '', row = [], inQuotes = false, stopParsing = false;
  while (i < csvText.length && !stopParsing) {
    const char = csvText[i];
    if (inQuotes) {
      if (char === '"') {
        if (csvText[i + 1] === '"') { // escaped quote
          field += '"';
          i += 2;
          continue;
        } else {
          inQuotes = false; i++; continue;
        }
      } else {
        field += char; i++; continue;
      }
    } else {
      if (char === '"') { inQuotes = true; i++; continue; }
      if (char === ',') { row.push(field); field = ''; i++; continue; }
      if (char === '\n') {
        row.push(field);

        // STOP LOGIC HERE
        // Only check this after header (assume header is the first row)
        if (rows.length > 0) {
          // Try to find header index for 'tipe' and 'soal'
          const header = rows[0] || [];
          const tipeIdx = header.findIndex(h => h.trim().toLowerCase() === 'tipe');
          const soalIdx = header.findIndex(h => h.trim().toLowerCase() === 'soal');
          const tipeVal = tipeIdx >= 0 ? (row[tipeIdx] || '').trim() : '';
          const soalVal = soalIdx >= 0 ? (row[soalIdx] || '').trim() : '';
          if (tipeVal === 'Pilih Tipe' || soalVal === '') {
            stopParsing = true;
            break;
          }
        }

        rows.push(row);
        field = '';
        row = [];
        i++;
        continue;
      }
      if (char === '\r') { // ignore CR, handle CRLF
        i++;
        continue;
      }
      field += char; i++;
    }
  }
  // Only push the last field/row if we haven't already stopped
  if (!stopParsing && (field.length > 0 || row.length > 0)) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function csvRowsToObjects(rows) {
  if (!rows || rows.length === 0) return [];
  const header = rows[0].map(h => (h || '').trim());
  const lowerHeader = header.map(h => h.toLowerCase());
  const out = [];
  for (let r = 1; r < rows.length; r++) {
    const raw = rows[r];
    if (raw.every(v => (v || '').trim().length === 0)) continue; // skip empty line
    const obj = {};
    for (let c = 0; c < header.length; c++) {
      obj[lowerHeader[c] || `col_${c}`] = (raw[c] ?? '').trim();
    }
    out.push(obj);
  }
  return out;
}

async function fetchSheetItems() {
  let csvUrl = toCsvExportUrl(SHEET_PUBLISHED_URL);
  try {
    const u = new URL(csvUrl);
    u.searchParams.set('_cb', String(Date.now()));
    csvUrl = u.toString();
  } catch (_) {
    csvUrl += (csvUrl.includes('?') ? '&' : '?') + `_cb=${Date.now()}`;
  }
  const res = await fetch(csvUrl, { cache: 'no-store' });
  const text = await res.text();
  const rows = parseCsv(text);
  return csvRowsToObjects(rows);
}

/* =========================
   ELEMENTS & HELPERS
   ========================= */
const $ = (id) => document.getElementById(id);

const loginSection = $('login');
const arithSection = $('arith');
const quizSection = $('quiz');
const postSection = $('post');
const uraianSection = $('uraian');
const finalSection = $('final');

const btnStart = $('btnStart');
const arithBox = $('arith-box');
const arithAnswer = $('arith-answer');
const btnCheckArith = $('btnCheckArith');
const arithFeedback = $('arith-feedback');
const storyBox = $('story-box');
const qText = $('question-text');
const optionsWrap = $('options');
const progressEl = $('progress');
const totalEl = $('total');
const btnPrev = $('btnPrev');
const btnNext = $('btnNext');
const btnToUraian = $('btnToUraian');
const btnRestart = $('btnRestart');
const btnDownloadCSV = $('btnDownloadCSV');
const btnKirimSheet = $('btnKirimSheet');

function csvEscape(value) {
  const s = String(value ?? '');
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}
function safeSegment(s) {
  return String(s || '')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^\w\-]+/g, '');
}
function dateStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  return `${y}${m}${day}_${hh}${mm}`;
}

/* =========================
   APP SCRIPT ENDPOINT
   ========================= */
const APP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzmJ_QN7LRUcYo55z0M9wxtdSGsRiePE83JIEcIMVpCqs6cJdvoGlhObVvBIvHUiNI/exec';
// Uraian original section elements (match initial design)
const uraianSlideContainer = $('uraian-slide-container');
const btnPrevUraian = $('btnPrevUraian');
const btnNextUraian = $('btnNextUraian');
const btnSubmitUraian = $('btnSubmitUraian');

function show(node) { node.classList.remove('hidden'); }
function hide(node) { node.classList.add('hidden'); }
function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

/* =========================
   STATE
   ========================= */
let items = [];
let index = 0;
let nameClass = { name: '', kelas: '' };
let pgState = { total: 0, correct: 0, answered: {} };
let essayAnswers = [];

function valuesEqual(expected, actual) {
  const e = (expected ?? '').toString().trim();
  const a = (actual ?? '').toString().trim();
  if (e.length === 0) return false;
  const eNum = Number(e), aNum = Number(a);
  const bothNumeric = !Number.isNaN(eNum) && !Number.isNaN(aNum);
  if (bothNumeric) return eNum === aNum;
  return e.toLowerCase() === a.toLowerCase();
}

function getOptionsFromRow(row) {
  // Prefer explicit 'pilihan1..4' (or with space). If found, use only these.
  const keys = Object.keys(row);
  const pilihan = [];
  keys.forEach((k) => {
    const m = k.match(/^pilihan\s*([1-9][0-9]*)$/i);
    if (m) {
      const num = parseInt(m[1], 10);
      const val = row[k];
      if (val && String(val).trim()) pilihan.push({ label: String(num), text: String(val).trim() });
    }
  });
  if (pilihan.length > 0) {
    pilihan.sort((a, b) => parseInt(a.label, 10) - parseInt(b.label, 10));
    return pilihan;
  }
  // Fallbacks: a..f, opsi/option with labels
  const entries = [];
  const pushIf = (label, value) => {
    if (value && String(value).trim()) entries.push({ label, text: String(value).trim() });
  };
  const letters = ['a','b','c','d','e','f'];
  letters.forEach((l) => pushIf(l, row[l]));
  keys.forEach((k) => {
    const m = k.match(/^(opsi|option)\s*([a-f]|[1-9][0-9]*)$/i);
    if (m) pushIf(m[2].toString().toLowerCase(), row[k]);
  });
  keys.forEach((k) => {
    const m = k.match(/^(opsi|option)([a-f]|[1-9][0-9]*)$/i);
    if (m) pushIf(m[2].toString().toLowerCase(), row[k]);
  });
  const order = (lab) => {
    if (/^[a-f]$/.test(lab)) return letters.indexOf(lab);
    const n = parseInt(lab, 10);
    return Number.isNaN(n) ? 999 : n - 1;
  };
  entries.sort((x, y) => order(x.label) - order(y.label));
  return entries.map(e => ({ label: /^[a-f]$/.test(e.label) ? e.label.toUpperCase() : e.label, text: e.text }));
}

function resolveCorrectIndex(answerRaw, options) {
  if (answerRaw == null) return -1;
  const v = String(answerRaw).trim();
  if (!v) return -1;
  // Letter A..F
  if (/^[A-F]$/i.test(v)) return v.toUpperCase().charCodeAt(0) - 65;
  // Numeric (1-based or 0-based)
  const num = Number(v);
  if (!Number.isNaN(num)) {
    if (num >= 1 && num <= options.length) return num - 1;
    if (num >= 0 && num < options.length) return num;
  }
  // Exact text match to an option (case/label-insensitive)
  const normalize = (s) => String(s).replace(/^[A-Z]\.?\s*/i, '').trim().toLowerCase();
  const target = normalize(v);
  for (let i = 0; i < options.length; i++) {
    const text = typeof options[i] === 'object' ? options[i].text : options[i];
    if (normalize(text) === target) return i;
  }
  return -1;
}

/* =========================
   RENDER
   ========================= */
function renderCurrent() {
  hide(arithSection);
  hide(uraianSection);
  hide(finalSection);
  hide(postSection);

  if (index < 0) index = 0;
  if (index >= items.length) {
    // End reached – show simple final section
    hide(quizSection); hide(postSection);
    show(finalSection);
    const finalScoreText = $('final-score-text');
    const finalMessage = $('final-message');
    if (finalScoreText) finalScoreText.textContent = `Selesai: ${items.length} item telah ditampilkan`;
    if (finalMessage) finalMessage.textContent = `Terima kasih, ${nameClass.name || 'Teman'}!`;
    return;
  }

  const row = items[index];
  const tipe = (row.tipe || '').trim();
  progressEl.textContent = String(index + 1);
  totalEl.textContent = String(items.length);

  if (tipe === 'Aritmatika') {
    hide(quizSection);
    hide(postSection);
    show(arithSection);
    const soal = row.soal || row.question || row.pertanyaan || '';
    arithBox.textContent = soal || 'Isikan jawabanmu';
    arithAnswer.value = '';
    arithFeedback.textContent = '';
    btnNext.disabled = true; // cannot skip aritmatika
    btnPrev.disabled = index === 0;
    btnCheckArith.onclick = () => {
      const expected = row.jawaban || row.answer || row.kunci;
      const ok = valuesEqual(expected, arithAnswer.value);
      if (ok) {
        index++;
        renderCurrent();
      } else {
        arithFeedback.textContent = 'Jawaban salah — coba lagi ya!';
        arithAnswer.focus();
      }
    };
    return;
  }

  if (tipe === 'Separator') {
    hide(quizSection);
    show(postSection);
    // Override post button to continue iteration rather than fixed flow
    btnToUraian.onclick = () => {
      index++;
      renderCurrent();
    };
    return;
  }

  if (tipe === 'Pilihan Ganda') {
    // Explicit MC handling using CSV-driven options and answer
    show(quizSection);
    hide(postSection);
    storyBox.style.display = 'none';
    storyBox.textContent = '';
    clear(optionsWrap);
    btnNext.disabled = true;
    btnPrev.disabled = index === 0;

    const story = row.story || row.cerita || row.teks || '';
    if (story && story.trim().length > 0) {
      storyBox.style.display = 'block';
      storyBox.innerHTML = String(story).replace(/\n/g, '<br>');
    }

    const q = row.question || row.pertanyaan || row.soal || 'Pertanyaan';
    qText.textContent = q;

    const opts = getOptionsFromRow(row);
    const correctIdx = resolveCorrectIndex(row.kunci ?? row.answer ?? row.jawaban, opts);

    if (opts.length === 0) {
      const div = document.createElement('div');
      div.className = 'muted';
      div.textContent = 'Tidak ada opsi pada data. Tekan lanjut.';
      optionsWrap.appendChild(div);
      btnNext.disabled = false;
    } else {
      opts.forEach((opt, i) => {
        const div = document.createElement('div');
        div.className = 'option';
        const labelText = String.fromCharCode(65 + i);
        const optText = (typeof opt === 'object' ? opt.text : String(opt));
        div.innerHTML = `<div class="label">${labelText}</div><div class="option-text" style="flex:1">${optText.replace(/^[A-Z]\.\s*/i, '')}</div>`;
        div.addEventListener('click', () => {
          const children = optionsWrap.querySelectorAll('.option');
          children.forEach(c => c.style.pointerEvents = 'none');
          if (i === correctIdx && correctIdx >= 0) {
            div.classList.add('correct');
            if (!pgState.answered[index]) {
              pgState.correct += 1;
            }
          } else if (correctIdx >= 0) {
            div.classList.add('wrong');
            const correct = children[correctIdx];
            if (correct) correct.classList.add('correct');
          } else {
            div.classList.add('correct');
          }
          if (!pgState.answered[index]) {
            pgState.answered[index] = true;
            window.pgResult = { correct: pgState.correct, total: pgState.total };
            console.log('PG result:', `${pgState.correct}/${pgState.total}`);
          }
          btnNext.disabled = false;
        });
        optionsWrap.appendChild(div);
      });
    }
    return;
  }

  if (tipe === 'Uraian') {
    // Match initial design: use dedicated Uraian section with slide container and controls
    hide(quizSection);
    hide(postSection);
    show(uraianSection);
    // Build single slide for this item
    if (uraianSlideContainer) uraianSlideContainer.innerHTML = '';
    const slide = document.createElement('div');
    slide.className = 'uraian-slide';
    slide.style.display = 'block';
    const story = row.story || row.cerita || row.teks || '';
    const q = row.question || row.pertanyaan || row.soal || 'Pertanyaan';
    const storyHtml = story && story.trim().length > 0 ? `${String(story).replace(/\n/g, '<br>')}<br>` : '';
    slide.innerHTML = `
      <div class="uraian-q"><strong>${storyHtml}${q.replace(/\n/g, '<br>')}</strong></div>
      <textarea id="uraian_input_${index}" placeholder="Tulis jawaban kamu di sini..."></textarea>
    `;
    uraianSlideContainer.appendChild(slide);
    // Controls mimic original behavior visuals
    if (btnPrevUraian) btnPrevUraian.disabled = index === 0;
    if (btnNextUraian) btnNextUraian.style.display = 'inline-block';
    if (btnSubmitUraian) btnSubmitUraian.style.display = 'none';
    // Wire handlers per current index
    const getAnswer = () => {
      const ta = document.getElementById(`uraian_input_${index}`);
      return ta ? ta.value : '';
    };
    if (btnPrevUraian) btnPrevUraian.onclick = () => { if (index > 0) { index--; renderCurrent(); } };
    if (btnNextUraian) btnNextUraian.onclick = () => {
      const ans = getAnswer();
      essayAnswers.push(ans);
      window.uraianAnswers = essayAnswers;
      console.log('Uraian answers:', essayAnswers);
      index++;
      renderCurrent();
    };
    // Focus textarea
    setTimeout(() => {
      const ta = document.getElementById(`uraian_input_${index}`);
      if (ta) ta.focus();
    }, 120);
    return;
  }

  // Default question rendering (MC if options exist) using generic extractor
  show(quizSection);
  storyBox.style.display = 'none';
  storyBox.textContent = '';
  clear(optionsWrap);
  btnNext.disabled = true;
  btnPrev.disabled = index === 0;

  const story = row.story || row.cerita || row.teks || '';
  if (story && story.trim().length > 0) {
    storyBox.style.display = 'block';
    storyBox.innerHTML = String(story).replace(/\n/g, '<br>');
  }

  const q = row.question || row.pertanyaan || row.soal || 'Pertanyaan';
  qText.textContent = q;

  // Collect options from common header variants
  const optionCandidates = getOptionsFromRow(row);

  if (optionCandidates.length === 0) {
    // No options: treat as info/statement; allow user to continue
    const div = document.createElement('div');
    div.className = 'muted';
    div.textContent = 'Tekan "Jawab & Lanjut" untuk melanjutkan.';
    optionsWrap.appendChild(div);
    btnNext.disabled = false;
  } else {
    optionCandidates.forEach((opt, i) => {
      const div = document.createElement('div');
      div.className = 'option';
      const labelText = String.fromCharCode(65 + i);
      const optText = (typeof opt === 'object' ? opt.text : String(opt));
      div.innerHTML = `<div class="label">${labelText}</div><div class="option-text" style="flex:1">${optText.replace(/^[A-Z]\.\s*/i, '')}</div>`;
      div.addEventListener('click', () => {
        // selection just enables next; correctness optional unless sheet provides it
        const children = optionsWrap.querySelectorAll('.option');
        children.forEach(c => c.style.pointerEvents = 'none');
        div.classList.add('correct');
        btnNext.disabled = false;
      });
      optionsWrap.appendChild(div);
    });
  }
}

/* =========================
   EVENTS
   ========================= */
btnStart.addEventListener('click', async () => {
  const name = ($('name').value || '').trim();
  const kelas = ($('kelas').value || '').trim();
  if (!name || !kelas) { alert('Isi nama dan kelas dulu ya 😊'); return; }
  nameClass = { name, kelas };
  try {
    hide(loginSection);
    // Hide unused sections in the new flow at start
    hide(arithSection); hide(postSection); hide(uraianSection); hide(finalSection);
    // Load items
    const data = await fetchSheetItems();
    console.log('Loaded sheet JSON (items):', data);
    items = data;
    // compute Pilihan Ganda totals and reset result state
    pgState.total = Array.isArray(items) ? items.filter(r => (r.tipe || '').trim() === 'Pilihan Ganda').length : 0;
    pgState.correct = 0;
    pgState.answered = {};
    window.pgResult = { correct: pgState.correct, total: pgState.total };
    // init uraian answers as empty raw array (push as user answers Uraian)
    essayAnswers = [];
    window.uraianAnswers = essayAnswers;
    console.log('Uraian answers initialized (empty):', essayAnswers);
    totalEl.textContent = String(items.length);
    index = 0;
    renderCurrent();
    // Bind CSV download to current state
    if (btnDownloadCSV) {
      btnDownloadCSV.onclick = () => {
        const headers = ['name','kelas','nilai_pilihan_ganda'];
        // dynamic uraian headers based on current answers length
        for (let i = 0; i < essayAnswers.length; i++) headers.push(`uraian${i + 1}`);
        const nilai = `${pgState.correct}/${pgState.total}`;
        const row = [nameClass.name || '', nameClass.kelas || '', nilai, ...essayAnswers];
        const csv = headers.map(csvEscape).join(',') + '\n' + row.map(csvEscape).join(',');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const segName = safeSegment(nameClass.name);
        const segKelas = safeSegment(nameClass.kelas);
        a.download = `hasil_kuis_${segName}_${segKelas}_${dateStamp()}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      };
    }
    // Bind Kirim ke Google Sheet button
    if (btnKirimSheet) {
      btnKirimSheet.onclick = async () => {
        try {
          const payload = {
            name: nameClass.name || '',
            kelas: nameClass.kelas || '',
            nilai_pilihan_ganda: `${pgState.correct}/${pgState.total}`,
            uraian: essayAnswers,
            timestamp: new Date().toISOString()
          };
          const res = await fetch(APP_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            mode: "no-cors",
            body: JSON.stringify(payload)
          });
          const text = await res.text();
          // try parse JSON; if fails, still show success toast
          try { console.log('KirimSheet response:', JSON.parse(text)); }
          catch { console.log('KirimSheet response (text):', text); }
          alert('✅ Data berhasil dikirim ke Google Sheet!');
        } catch (err) {
          console.error('KirimSheet error:', err);
          alert('❌ Gagal mengirim data. Coba lagi.');
        }
      };
    }
  } catch (e) {
    console.error(e);
    alert('Gagal memuat data dari Google Sheet. Coba lagi nanti ya.');
    // fallback to login view
    show(loginSection);
  }
});

btnPrev.addEventListener('click', () => {
  if (index > 0) { index--; renderCurrent(); }
});

btnNext.addEventListener('click', () => {
  index++;
  renderCurrent();
});

btnRestart.addEventListener('click', () => {
  // Reset minimal state and go back to login
  items = [];
  index = 0;
  nameClass = { name: '', kelas: '' };
  essayAnswers = [];
  $('name').value = '';
  $('kelas').value = '';
  hide(quizSection); hide(postSection); hide(uraianSection); hide(finalSection);
  show(loginSection);
});

/* =========================
   INIT
   ========================= */
show(loginSection);
hide(arithSection); hide(quizSection); hide(postSection); hide(uraianSection); hide(finalSection);


