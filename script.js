/* =========================
    CONFIG
    - https://script.google.com/macros/s/AKfycbz5o-vjl6QC_CoBawUhxsQvqtS67BwqtYvhmxPs7ZR08jIq0J-pGe0E_duLNdCvguxn/exec

    - If empty, sending will be skipped but CSV download still available.
    ========================= */
/* =========================
KIRIM DATA KE GOOGLE SHEET
========================= */
function sendToGoogleSheet(data) {
    fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
        .then(() => {
            console.log("✅ Data berhasil dikirim ke Google Sheet!");
        })
        .catch((error) => {
            console.error("❌ Gagal mengirim data:", error);
        });
}

/* =========================
   SAAT KUIS SELESAI
   ========================= */
function onQuizFinish() {
    const nama = document.getElementById("nama")?.value || "T";
    const kelas = document.getElementById("kelas")?.value || "-";
    const skor = document.getElementById("final-score-text")?.innerText || "0";

    // Ambil semua jawaban uraian (asumsikan ada 5)
    const jawabanUraian = window.jawabanUraian || [];

    // Pastikan panjang array selalu 5 elemen
    let uraian = []
    uraian[0] = document.getElementById("uraian_input_0").value || "";
    const uraian2 = jawabanUraian[1] || "";
    const uraian3 = jawabanUraian[2] || "";
    const uraian4 = jawabanUraian[3] || "";
    const uraian5 = jawabanUraian[4] || "";

    const data = {
        nama: nama,
        kelas: kelas,
        skor: skor,
        uraian: uraian,
        uraian2: uraian2,
        uraian3: uraian3,
        uraian4: uraian4,
        uraian5: uraian5,
    };

    sendToGoogleSheet(data);
    alert("✅ Data berhasil dikirim ke Google Sheet!");
}

/* =========================
   TAMBAHKAN TOMBOL KIRIM
   ========================= */
document.getElementById("btnDownloadCSV").insertAdjacentHTML(
    "afterend",
    `<button id="btnKirimSheet">📤 Kirim ke Google Sheet</button>`
);

/* =========================
   EVENT KETIKA TOMBOL DIKLIK
   ========================= */
document.getElementById("btnKirimSheet").addEventListener("click", onQuizFinish);
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz5o-vjl6QC_CoBawUhxsQvqtS67BwqtYvhmxPs7ZR08jIq0J-pGe0E_duLNdCvguxn/exec";

/* =========================
   DATA
   ========================= */
const aritmatikaSoal = [
    { soal: "3 - 2 = ?", jawab: 1 },
    { soal: "6 - 4 = ?", jawab: 2 },
    { soal: "5 - 2 = ?", jawab: 3 },
    { soal: "7 - 3 = ?", jawab: 4 },
    { soal: "11 - 6 = ?", jawab: 5 },
    { soal: "9 - 3 = ?", jawab: 6 },
    { soal: "16 - 9 = ?", jawab: 7 },
    { soal: "20 - 12 = ?", jawab: 8 },
    { soal: "15 - 6 = ?", jawab: 9 },
    { soal: "20 - 10 = ?", jawab: 10 }
];

const quizData = [
    {
        story: `Bacalah cerita di bawah ini dengan saksama!

"GAGAL"

Tiara mendapat giliran bernyanyi di depan kelas. Sejak pagi, ia sudah berlatih, tetapi ketika berdiri di depan teman-temannya, ia mendadak lupa lirik lagu. Tiara merasa malu dan langsung duduk kembali. Teman-temannya ada yang menertawakan, tetapi ada juga yang memberi semangat. Pak Guru menenangkan dan membujuk Tiara untuk mencoba lagi. Namun, Tiara merasa kecewa dan tidak yakin ingin mencoba lagi.`,
        question: "1. Permasalahan yang dihadapi tokoh Tiara dalam cerita di atas yaitu … .",
        options: ["A. Tiara lupa lirik lagu saat tampil", "B. Tiara malu ketika bernyanyi", "C. Tiara gugup di depan kelas"],
        answer: 0
    },
    {
        story: "",
        question: "2. Solusi yang sebaiknya diambil Tiara untuk mengatasi kesulitannya saat bernyanyi yaitu … .",
        options: ["A. berlatih hafalan lagu sebentar agar tidak lupa", "B. meminta bantuan teman untuk berlatih bersama", "C. mencoba menyanyi dengan percaya diri walau belum hafal"],
        answer: 1
    },
    {
        story: `Perhatikan kalimat berikut!
                
1)“Ibu, aku sudah mengerjakan PR,” kata Rina.
2)Ayah berkata, “Besok kita pergi ke pasar.”
3)Sinta berkata, “Saya suka sekali membaca buku”.
4)“Kita harus menjaga kebersihan, kata Pak Guru.”`,
        question: "3. Kalimat yang menggunakan tanda petik (“…”) secara tepat adalah … .",
        options: ["A. 1 dan 2", "B. 1 dan 3", "C. 2 dan 4"],
        answer: 0
    },
    {
        story: "Perhatikan kalimat berikut!\n\nTugas ini menumpuk setinggi gunung.\n\n",
        question: "4. Makna dari kalimat di atas adalah … .",
        options: ["A. tugas yang dikerjakan", "B. tugas yang banyak", "C. tugas dan gunung sama tinggi"],
        answer: 1
    },
    {
        story: "Perhatikan makna berikut!\n\n“Seseorang merasa lapar sekali.”\n\n",
        question: "5. Kalimat yang menggunakan majas hiperbola sesuai makna di atas adalah … .",
        options: ["A. perutku keroncongan sejak pagi", "B. aku lapar sekali karena belum sarapan", "C. aku lapar sampai bisa menelan seluruh meja makan ini"],
        answer: 2
    },
    {
        story: `Bacalah narasi di bawah ini dengan saksama!
                Tari dan Putri sedang berjalan menuju kelas. Tari membawa banyak tumpukan buku. Tari kehilangan keseimbangan sehingga beberapa buku terjatuh ke lantai. Tari berkata, “Put, ambilkan buku-bukunya!” Putri membantu Tari memungut buku-buku yang jatuh. Tari berkata, “Baik, sudah.” Setelah semua buku diambil, mereka melanjutkan perjalanan menuju kelas.`,
        question: "6. Ucapan Tari masih kurang tepat, sebaiknya … .",
        options: [`A. “Put, tolong ambilkan buku-bukunya” dan “Baik, sudah”`, `B. “Put, tolong ambilkan buku-bukunya” dan “Baik, sudah. Terima kasih”`, `C. “Put, ambilkan buku-bukunya” dan “Baik, sudah. Terima kasih”`],
        answer: 1
    },
    {
        story: "Perhatikan kalimat-kalimat berikut!\n\n(1) Sebuah kolam kecil menambah indah suasana.\n(2) Rumput hijau terhampar luas di halaman.\n(3) Beberapa ekor ikan koi tampak berenang di kolam.\n(4) Halaman rumah Mira sangat asri.\n\n",
        question: "7. Urutan kalimat yang benar agar menjadi paragraf yang padu adalah … .",
        options: ["A. (4)-(2)-(3)-(1)", "B. (4)-(2)-(1)-(3)", "C. (4)-(1)-(2)-(3)"],
        answer: 1
    },
    {
        story: `Bacalah cerita di bawah ini dengan saksama!

                Setiap pagi, Rara membantu ibu menyiram bunga di halaman rumah. Ia dan ibunya memiliki banyak bunga, seperti mawar, melati, dan anggrek. Setelah menyiram, Rara mengelap pot yang kotor dan menata bunga agar terlihat rapi. Ibu Rara selalu mengingatkan agar mereka merawat bunga dengan penuh kasih supaya tumbuh subur. Rara merasa senang melihat halaman rumahnya tampak segar dan berwarna. Halaman rumah Rara tampak indah karena selalu dirawat dengan baik setiap hari.`,
        question: "8. Ide pokok paragraf di atas adalah … .",
        options: ["A. Rara dan ibunya memiliki berbagai bunga yang dirawat di halaman rumah", "B. Ibu Rara selalu mengingatkan Rara untuk merawat bunga dengan penuh kasih", "C. Rara dan ibunya rajin merawat bunga sehingga halaman rumah tampak indah"],
        answer: 2
    },
    {
        story: "Perhatikan kalimat berikut!\n\n1. “Aku lapar sekali,” kata Edo.\n2. Dika berkata “Aku ingin membeli es krim.”\n3. “Besok kita belajar kelompok di rumah Sinta,” ujar Rani.\n4. Guru berkata, “Kerjakan tugasmu dengan sungguh-sungguh.”\n\n",
        question: "9.Kalimat yang menggunakan tanda petik (“…”) secara tepat adalah … .",
        options: ["A. 1 dan 3", "B. 1 dan 4", "C. 2 dan 3"],
        answer: 2
    },
    {
        story: "Perhatikan kalimat-kalimat acak berikut!\n\n1. Di taman, mereka bermain ayunan dan perosotan.\n2. Setelah sarapan, Sinta dan adiknya pergi ke taman.\n3. Mereka pulang dengan perasaan gembira.\n4. Hari Minggu pagi, udara terasa sejuk dan cerah.\n\n",
        question: "10. Urutan kalimat yang benar agar membentuk cerita yang runtut adalah … .",
        options: ["A. 4 – 2 – 1 – 3", "B. 1 – 3 – 2 – 4", "C. 4 – 1 – 2 – 3"],
        answer: 0
    }
];

const uraianData = [
    { q: `1. Berikan 2 contoh kalimat langsung!` },
    {
        q: `2. Bacalah cerita di bawah ini dengan saksama!
Ani melihat tas temannya terjatuh di depan kelas. Ia ingin meminta bantuan Sari untuk mengambilkannya.
Tuliskan kalimat yang sebaiknya diucapkan Ani kepada Sari menggunakan kata ajaib dengan tepat sesuai konteks!.` },

    {
        q: `3. Perhatikan gambar ilustrasi berikut! 
                <a href="https://ibb.co.com/xtqrfY1d"><img src="https://i.ibb.co.com/v64MQh3R/Group-78.png" alt="Group-78" border="0" /></a> 
                Buatlah sebuah cerita secara runtut dan padu berdasarkan urutan gambar tersebut!.` },
    {
        q: `4. Perhatikan 2 kalimat di bawah ini!
(1) Hari ini udara panas sekali rasanya aku bisa pingsan di bawah sinar matahari.
(2) Hari ini udara panas sekali rasanya aku bisa tenggelam oleh keringatku sendiri saat bermain di luar.
Pertanyaan :
a) Kalimat manakah yang menggunakan majas hiperbola?
b) Apa makna sebenarnya dari kalimat bermajas hiperbola tersebut?` },
    {
        q: `5. Bacalah cerita di bawah ini dengan saksama!:
Saat pelajaran menulis, pensil Raka patah, sedangkan ia tidak membawa rautan. Ia meminta bantuan kepada Bima, tetapi Bima masih menggunakannya. Karena tidak sabar menunggu, Raka mengambil rautan itu tanpa izin. Saat sedang meraut, pensil Bima jatuh dan ujungnya patah. Bima tampak kesal dan berkata, “Raka, kenapa kamu pakai rautanku tanpa izin? Pensilku jadi rusak!” Raka merasa bersalah dan segera berkata, “Maaf, Bima. Aku tidak sabar menunggu.” Bima akhirnya memaafkannya dan mengingatkan agar Raka meminta izin terlebih dahulu sebelum memakai barang orang lain. Raka pun berterima kasih dan berjanji tidak akan mengulanginya lagi.
Pertanyaan :
a) Siapakah tokoh utama dalam cerita tersebut?
b) Bagaimana sikap yang ditunjukkan tokoh utama dalam cerita? Jelaskan pendapatmu tentang sikap tersebut!` }
];

/* =========================
   STATE
   ========================= */
let player = { name: '', kelas: '' };
let arithIndex = 0;     // which arithmetic challenge to unlock next
let currentIndex = 0;   // current MC question index shown
let pgScore = 0;
let uraianAnswers = Array(uraianData.length).fill('');

/* =========================
   ELEMENTS
   ========================= */
const el = id => document.getElementById(id);

const loginSection = el('login');
const arithSection = el('arith');
const quizSection = el('quiz');
const postSection = el('post');
const uraianSection = el('uraian');
const finalSection = el('final');

const btnStart = el('btnStart');
const arithBox = el('arith-box');
const arithAnswer = el('arith-answer');
const btnCheckArith = el('btnCheckArith');
const arithFeedback = el('arith-feedback');

const storyBox = el('story-box');
const qText = el('question-text');
const optionsWrap = el('options');
const progressEl = el('progress');
const totalEl = el('total');
const btnPrev = el('btnPrev');
const btnNext = el('btnNext');

const btnToUraian = el('btnToUraian');
const uraianSlideContainer = el('uraian-slide-container');
const btnPrevUraian = el('btnPrevUraian');
const btnNextUraian = el('btnNextUraian');
const btnSubmitUraian = el('btnSubmitUraian');

const finalScoreText = el('final-score-text');
const finalMessage = el('final-message');
const btnDownloadCSV = el('btnDownloadCSV');
const btnRestart = el('btnRestart');

/* Initialize totals */
totalEl.textContent = quizData.length;

/* =========================
   HELPERS
   ========================= */
function show(elm) { elm.classList.remove('hidden'); }
function hide(elm) { elm.classList.add('hidden'); }
function clearChildren(node) { while (node.firstChild) node.removeChild(node.firstChild); }

/* =========================
   LOGIN -> START
   ========================= */
btnStart.addEventListener('click', () => {
    const name = el('name').value.trim();
    const kelas = el('kelas').value.trim();
    if (!name || !kelas) { alert('Isi nama dan kelas dulu ya 😊'); return; }
    player.name = name; player.kelas = kelas;
    // reset state
    arithIndex = 0; currentIndex = 0; pgScore = 0; uraianAnswers = Array(uraianData.length).fill('');
    // go to arith first
    hide(loginSection); show(arithSection);
    showAritmatika();
});

/* =========================
   ARITMATIKA
   ========================= */
function showAritmatika() {
    arithFeedback.textContent = '';
    arithAnswer.value = '';
    if (arithIndex < aritmatikaSoal.length) {
        arithBox.textContent = aritmatikaSoal[arithIndex].soal;
        show(arithSection);
        hide(quizSection); hide(postSection); hide(uraianSection); hide(finalSection);
        setTimeout(() => arithAnswer.focus(), 200);
    } else {
        // if somehow finished arith challenges, start quiz at 0
        arithIndex = 0;
        startQuizForIndex(0);
    }
}

btnCheckArith.addEventListener('click', () => {
    const v = parseInt(arithAnswer.value);
    if (Number.isNaN(v)) { arithFeedback.textContent = 'Tolong isi angka ya 🙂'; return; }
    const correct = aritmatikaSoal[arithIndex].jawab;
    if (v === correct) {
        // open the corresponding MC question (use arithIndex order)
        hide(arithSection);
        currentIndex = arithIndex;
        startQuizForIndex(currentIndex);
    } else {
        arithFeedback.textContent = 'Jawaban salah — coba lagi ya!';
        arithAnswer.value = '';
        arithAnswer.focus();
    }
});

/* =========================
   QUIZ (MC)
   ========================= */
function startQuizForIndex(idx) {
    hide(arithSection);
    hide(postSection);
    hide(uraianSection);
    hide(finalSection);
    show(quizSection);
    currentIndex = idx;
    renderQuestion();
}

function renderQuestion() {
    const q = quizData[currentIndex];
    progressEl.textContent = currentIndex + 1;
    if (q.story && q.story.trim().length > 0) {
        storyBox.style.display = 'block';
        storyBox.innerHTML = q.story.replace(/\n/g, '<br>');
    } else {
        storyBox.style.display = 'none';
        storyBox.textContent = '';
    }
    qText.textContent = q.question;
    clearChildren(optionsWrap);
    q.options.forEach((opt, i) => {
        const div = document.createElement('div');
        div.className = 'option';
        div.innerHTML = `<div class="label">${String.fromCharCode(65 + i)}</div><div style="flex:1">${opt.replace(/^[A-D]\.\s*/i, '')}</div>`;
        div.addEventListener('click', () => handleMCSelect(div, i));
        optionsWrap.appendChild(div);
    });
    btnNext.disabled = true;
    btnPrev.disabled = currentIndex === 0;
}

function handleMCSelect(elm, idx) {
    const q = quizData[currentIndex];
    const children = optionsWrap.querySelectorAll('.option');
    children.forEach(c => c.style.pointerEvents = 'none');
    if (idx === q.answer) {
        elm.classList.add('correct');
        pgScore++;
    } else {
        elm.classList.add('wrong');
        if (children[q.answer]) children[q.answer].classList.add('correct');
    }
    btnNext.disabled = false;
}

/* next after answering current MC */
btnNext.addEventListener('click', () => {
    // after answering, advance arithmetic index + show next arith or end
    arithIndex++;
    currentIndex++;
    if (currentIndex < quizData.length) {
        // show arith to unlock next
        show(arithSection);
        hide(quizSection);
        showAritmatika();
    } else {
        // finished MC
        hide(quizSection);
        show(postSection);
    }
});

/* prev to go back to prior MC (optional) */
btnPrev.addEventListener('click', () => {
    if (currentIndex > 0) {
        currentIndex--;
        startQuizForIndex(currentIndex);
    }
});

/* =========================
   POST -> to URAIAN
   ========================= */
el('btnToUraian').addEventListener('click', () => {
    hide(postSection);
    show(uraianSection);
    buildUraianSlides();
});

/* =========================
   URAIAN SLIDES
   ========================= */
let uraianIndex = 0;
function buildUraianSlides() {
    uraianSlideContainer.innerHTML = '';
    uraianData.forEach((item, i) => {
        const slide = document.createElement('div');
        slide.className = 'uraian-slide';
        slide.style.display = i === 0 ? 'block' : 'none';
        slide.innerHTML = `
      <div class="uraian-q"><strong>${item.q.replace(/\n/g, '<br>')}</strong></div>
      <textarea id="uraian_input_${i}" placeholder="Tulis jawaban kamu di sini...">${uraianAnswers[i] || ''}</textarea>
    `;
        uraianSlideContainer.appendChild(slide);
    });
    uraianIndex = 0;
    updateUraianControls();
}

function updateUraianControls() {
    const slides = uraianSlideContainer.querySelectorAll('.uraian-slide');
    slides.forEach((s, i) => s.style.display = i === uraianIndex ? 'block' : 'none');
    btnPrevUraian.disabled = uraianIndex === 0;
    if (uraianIndex === slides.length - 1) {
        btnNextUraian.style.display = 'none';
        btnSubmitUraian.style.display = 'inline-block';
    } else {
        btnNextUraian.style.display = 'inline-block';
        btnSubmitUraian.style.display = 'none';
    }
    // focus textarea
    setTimeout(() => {
        const ta = document.getElementById(`uraian_input_${uraianIndex}`);
        if (ta) ta.focus();
    }, 150);
}

btnPrevUraian.addEventListener('click', () => {
    saveCurrentUraian();
    if (uraianIndex > 0) { uraianIndex--; updateUraianControls(); }
});
btnNextUraian.addEventListener('click', () => {
    saveCurrentUraian();
    const slides = uraianSlideContainer.querySelectorAll('.uraian-slide');
    if (uraianIndex < slides.length - 1) { uraianIndex++; updateUraianControls(); }
});
function saveCurrentUraian() {
    const ta = document.getElementById(`uraian_input_${uraianIndex}`);
    if (ta) uraianAnswers[uraianIndex] = ta.value.trim();
}

/* SUBMIT URAIAN -> send & final */
btnSubmitUraian.addEventListener('click', () => {
    // save current
    saveCurrentUraian();
    // optional: require at least one answer? we'll allow empty but warn
    const empty = uraianAnswers.some(a => !a || a.length === 0);
    if (empty) {
        if (!confirm('Beberapa jawaban uraian kosong. Tetap kirim? Tekan OK untuk kirim, Cancel untuk melengkapi.')) return;
    }
    // prepare payload
    const payload = {
        nama: player.name,
        kelas: player.kelas,
        skor: pgScore,
        total_pilgan: quizData.length,
        uraian: uraianAnswers,
        timestamp: new Date().toISOString()
    };
    console.log('Payload to send:', payload);
    // try send to Google Script if provided
    if (SCRIPT_URL && SCRIPT_URL.trim().length > 5) {
        fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' }
        }).then(r => {
            // ignore response detail; proceed to final
            showFinal(payload, true);
        }).catch(err => {
            console.error(err);
            // still show final but note send failed
            showFinal(payload, false);
        });
    } else {
        // not sending, just show final
        showFinal(payload, false);
    }
});

/* SHOW FINAL SCORE + enable CSV download */
function showFinal(payload, sentToSheet) {
    hide(uraianSection);
    hide(postSection);
    hide(quizSection);
    hide(arithSection);
    show(finalSection);

    finalScoreText.textContent = `${player.name} dari kelas ${player.kelas}, skor pilihan gandamu: ${pgScore} / ${quizData.length}`;
    if (pgScore >= 9) finalMessage.textContent = "🌟 Luar biasa! Kamu sangat hebat!";
    else if (pgScore >= 7) finalMessage.textContent = "👏 Bagus sekali! Terus pertahankan!";
    else if (pgScore >= 4) finalMessage.textContent = "👍 Bagus! Terus latihan ya!";
    else finalMessage.textContent = "💪 Tetap semangat — coba lagi supaya makin baik!";

    // prepare CSV content for download
    const headers = ['Timestamp', 'Nama', 'Kelas', 'SkorPilihanGanda', 'TotalPilgan'];
    for (let i = 0; i < uraianData.length; i++) headers.push(`Uraian${i + 1}`);
    const row = [payload.timestamp, payload.nama, payload.kelas, payload.skor, payload.total_pilgan, ...payload.uraian];

    // store csv string on element dataset for download
    const csvArr = [headers.join(','), row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')];
    el('btnDownloadCSV').dataset.csv = csvArr.join('\n');
    el('btnDownloadCSV').onclick = () => {
        const csv = el('btnDownloadCSV').dataset.csv;
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'hasil_kuis_mrx.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };
}

/* RESTART */
btnRestart.addEventListener('click', () => {
    // reset and go to login
    player = { name: '', kelas: '' };
    arithIndex = 0; currentIndex = 0; pgScore = 0;
    uraianAnswers = Array(uraianData.length).fill('');
    el('name').value = ''; el('kelas').value = '';
    hide(arithSection); hide(quizSection); hide(postSection); hide(uraianSection); hide(finalSection);
    show(loginSection);
});

/* Accessibility: Enter key for arith & login */
el('arith-answer').addEventListener('keydown', e => { if (e.key === 'Enter') btnCheckArith.click(); });
el('name').addEventListener('keydown', e => { if (e.key === 'Enter') btnStart.click(); });

/* init view */
show(loginSection);
hide(arithSection); hide(quizSection); hide(postSection); hide(uraianSection); hide(finalSection);
