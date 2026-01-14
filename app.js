/* =========================================================
   VARIABEL GLOBAL CHART
========================================================= */
let chartBBU, chartTBU, chartBBTB, chartIMTU;

/* =========================================================
   SLIDER
========================================================= */
let currentSlide = 0;
const slides = document.querySelectorAll(".slide");
const indicator = document.getElementById("slideIndicator");

function showSlide(i) {
  slides.forEach((s, idx) => s.classList.toggle("active", idx === i));
  indicator.textContent = `${i + 1} / ${slides.length}`;
}
function nextSlide() {
  currentSlide = (currentSlide + 1) % slides.length;
  showSlide(currentSlide);
}
function prevSlide() {
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  showSlide(currentSlide);
}
showSlide(0);

/* =========================================================
   HELPER
========================================================= */
async function loadJSON(path) {
  const res = await fetch(path);
  return res.json();
}

function getSD(data, x) {
  return data.find(d => d.x == x);
}

/* =========================================================
   STATUS GIZI (STANDAR WHO / PERMENKES)
========================================================= */
function statusBBU(bb, sd) {
  if (bb < sd["-3"]) return "Berat Badan Sangat Kurang";
  if (bb < sd["-2"]) return "Berat Badan Kurang";
  if (bb <= sd["+1"]) return "Normal";
  return "Risiko Berat Badan Lebih";
}

function statusTBU(tb, sd) {
  if (tb < sd["-3"]) return "Sangat Pendek (Sangat Stunting)";
  if (tb < sd["-2"]) return "Pendek (Stunting)";
  if (tb <= sd["+3"]) return "Normal";
  return "Tinggi";
}

function statusBBTB(bb, sd) {
  if (bb < sd["-3"]) return "Sangat Kurus";
  if (bb < sd["-2"]) return "Kurus";
  if (bb <= sd["+1"]) return "Normal";
  if (bb <= sd["+2"]) return "Risiko Gemuk";
  if (bb <= sd["+3"]) return "Gemuk";
  return "Sangat Gemuk";
}


function statusIMTU(imt, sd) {
  if (imt < sd["-3"]) return "Sangat Kurus";
  if (imt < sd["-2"]) return "Kurus";
  if (imt <= sd["+1"]) return "Normal";
  if (imt <= sd["+2"]) return "Risiko Gemuk";
  if (imt <= sd["+3"]) return "Gemuk";
  return "Sangat Gemuk";
}


/* =========================================================
   PENJELASAN 
========================================================= */
function penjelasan(status, indeks) {
  const data = {
    BBU: {
      "Berat Badan Sangat Kurang":
        "Berat badan anak jauh di bawah normal. Sebaiknya segera diperiksa ke tenaga kesehatan.",
      "Berat Badan Kurang":
        "Berat badan anak masih kurang dari normal. Perlu pemantauan rutin dan perbaikan pola makan.",
      "Normal":
        "Berat badan anak sudah sesuai dengan umurnya. Tetap jaga pola makan dan pantau tiap bulan.",
      "Risiko Berat Badan Lebih":
        "Berat badan anak mulai berlebih. Perlu mengatur pola makan dan aktivitas anak."
    },
    TBU: {
      "Sangat Pendek (Sangat Stunting)":
        "Tinggi badan anak jauh lebih pendek dari anak seusianya. Anak perlu diperiksa lebih lanjut.",
      "Pendek (Stunting)":
        "Tinggi badan anak lebih pendek dari normal. Perlu perhatian pada asupan gizi anak.",
      "Normal":
        "Tinggi badan anak sesuai dengan umurnya. Pertumbuhan anak tergolong baik.",
      "Tinggi":
        "Tinggi badan anak lebih tinggi dari anak seusianya. Tetap pantau pertumbuhan anak."
    },
    BBTB: {
      "Sangat Kurus":
        "Berat badan anak sangat rendah dibandingkan tinggi badannya saat ini. Kondisi ini menandakan kekurangan gizi akut dan perlu penanganan segera.",
      "Kurus":
        "Berat badan anak lebih rendah dari yang seharusnya dibandingkan tinggi badannya. Perlu peningkatan asupan gizi dan pemantauan rutin.",
      "Normal":
        "Berat badan anak seimbang dengan tinggi badannya. Kondisi ini menunjukkan status gizi saat ini tergolong baik.",
      "Risiko Gemuk":
        "Berat badan anak mulai melebihi proporsi tinggi badannya. Perlu pengaturan pola makan agar tidak berlanjut.",
      "Gemuk":
        "Berat badan anak melebihi proporsi tinggi badannya. Anak berisiko mengalami gangguan kesehatan.",
      "Sangat Gemuk (Obesitas)":
        "Berat badan anak jauh melebihi proporsi tinggi badannya. Kondisi ini memerlukan perhatian dan pengelolaan gizi khusus."
        },
    IMTU: {
      "Sangat Kurus":
        "Indeks massa tubuh anak sangat rendah untuk usianya. Kondisi ini menunjukkan kekurangan gizi berat dan perlu penanganan segera.",
      "Kurus":
        "Indeks massa tubuh anak lebih rendah dari normal. Perlu peningkatan asupan gizi dan pemantauan rutin.",
      "Normal":
        "Indeks massa tubuh anak sesuai dengan usianya. Status gizi anak baik dan perlu dipertahankan.",
      "Risiko Gemuk":
        "Indeks massa tubuh anak mulai meningkat. Perlu pengaturan pola makan dan aktivitas fisik agar tidak berlanjut.",
      "Gemuk (Kelebihan Berat Badan)":
        "Indeks massa tubuh anak melebihi normal. Anak berisiko mengalami masalah kesehatan dan perlu pengelolaan gizi.",
      "Sangat Gemuk (Obesitas)":
        "Indeks massa tubuh anak sangat tinggi untuk usianya. Kondisi ini meningkatkan risiko penyakit dan memerlukan intervensi gizi."
}
    
  };
  return data[indeks][status] || "";
}

/* =========================================================
   GRAFIK
========================================================= */
function makeDataset(json) {
  const sdKeys = ["-3","-2","-1","0","+1","+2","+3"];

  const zonaLabel = {
    "-3": "Perlu Perhatian",
    "-2": "Perlu Pemantauan",
    "-1": "Perlu Pemantauan",
    "0":  "Normal",
    "+1": "Normal",
    "+2": "Di atas rata-rata",
    "+3": "Di atas rata-rata"
  };

  const colors = [
    "#dc2626", // merah
    "#f97316", // oranye
    "#facc15", // kuning
    "#22c55e", // hijau
    "#38bdf8", // biru muda
    "#6366f1", // biru
    "#a855f7"  // ungu
  ];

  return sdKeys.map((sd, i) => ({
    label: zonaLabel[sd],
    data: json.data.map(d => d.sd[sd]),
    borderColor: colors[i],
    borderWidth: 2,
    pointRadius: 0,
    tension: 0.3
  }));
}


function addAnak(ds, x, y) {
  ds.push({
    label: "Anak Anda",
    type: "scatter",
    data: [{ x, y }],
    backgroundColor: "#2563eb",
    pointRadius: 7
  });
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { font: { size: 13, weight: "bold" } } }
  }
};

/* =========================================================
   MAIN HITUNG
========================================================= */
async function hitung() {
  const jk = jkEl.value;
  const usia = +usiaEl.value;
  const bb = +beratEl.value;
  const tb = +tinggiEl.value;
  const gender = jk === "L" ? "L" : "P";

  /* ===== BB/U ===== */
  const bbu = await loadJSON(`data/BB_U_${gender}_0_60.json`);
  const sdBBU = getSD(bbu.data, usia);
  const statusBBUText = statusBBU(bb, sdBBU.sd);

  hasilBBU.innerHTML = `
    <b>Status:</b> ${statusBBUText}<br>
    <b>Berat ideal:</b> ± ${sdBBU.sd["0"]} kg<br>
    <small>${penjelasan(statusBBUText, "BBU")}</small>
  `;

  if (chartBBU) chartBBU.destroy();
  const dsBBU = makeDataset(bbu);
  addAnak(dsBBU, usia, bb);
  chartBBU = new Chart(grafikBBU, {
    type: "line",
    data: { labels: bbu.data.map(d => d.x), datasets: dsBBU },
    options: chartOptions
  });

  /* ===== TB/U atau PB/U ===== */
  const tbuFile = usia <= 24
    ? `data/PB_U_${gender}_0_24.json`
    : `data/TB_U_${gender}_24_60.json`;

  const tbu = await loadJSON(tbuFile);
  const sdTBU = getSD(tbu.data, usia);
  const statusTBUText = statusTBU(tb, sdTBU.sd);

  hasilTBU.innerHTML = `
    <b>Status:</b> ${statusTBUText}<br>
    <b>Tinggi ideal:</b> ± ${sdTBU.sd["0"]} cm<br>
    <small>${penjelasan(statusTBUText, "TBU")}</small>
  `;

  if (chartTBU) chartTBU.destroy();
  const dsTBU = makeDataset(tbu);
  addAnak(dsTBU, usia, tb);
  chartTBU = new Chart(grafikTBU, {
    type: "line",
    data: { labels: tbu.data.map(d => d.x), datasets: dsTBU },
    options: chartOptions
  });

  /* ===== BB/TB atau BB/PB ===== */
  const bbtbFile = usia <= 24
    ? `data/BB_PB_${gender}_0_24.json`
    : `data/BB_TB_${gender}_24_60.json`;

  const bbtb = await loadJSON(bbtbFile);
  const sdBBTB = getSD(bbtb.data, tb);
  const statusBBTBText = statusBBTB(bb, sdBBTB.sd);

  hasilBBTB.innerHTML = `
    <b>Status:</b> ${statusBBTBText}<br>
    <b>Berat seimbang:</b> ± ${sdBBTB.sd["0"]} kg<br>
    <small>${penjelasan(statusBBTBText, "BBTB")}</small>
  `;

  if (chartBBTB) chartBBTB.destroy();
  const dsBBTB = makeDataset(bbtb);
  addAnak(dsBBTB, tb, bb);
  chartBBTB = new Chart(grafikBBTB, {
    type: "line",
    data: { labels: bbtb.data.map(d => d.x), datasets: dsBBTB },
    options: chartOptions
  });

    /* ===== IMT/U ===== */
  const imt = bb / Math.pow(tb / 100, 2);

  const imtuFile = usia <= 24
    ? `data/IMT_U_${gender}_0_24.json`
    : `data/IMT_U_${gender}_24_60.json`;

  const imtu = await loadJSON(imtuFile);
  const sdIMTU = getSD(imtu.data, usia);
  const statusIMTUText = statusIMTU(imt, sdIMTU.sd);

  hasilIMTU.innerHTML = `
    <b>Status:</b> ${statusIMTUText}<br>
    <b>IMT anak:</b> ${imt.toFixed(2)}<br>
    <small>${penjelasan(statusIMTUText, "IMTU")}</small>
  `;

  if (chartIMTU) chartIMTU.destroy();
  const dsIMTU = makeDataset(imtu);
  addAnak(dsIMTU, usia, imt);

  chartIMTU = new Chart(grafikIMTU, {
    type: "line",
    data: { labels: imtu.data.map(d => d.x), datasets: dsIMTU },
    options: chartOptions
  });

}

/* =========================================================
   ELEMENT HTML
========================================================= */
const jkEl = document.getElementById("jk");
const usiaEl = document.getElementById("usia");
const beratEl = document.getElementById("berat");
const tinggiEl = document.getElementById("tinggi");

