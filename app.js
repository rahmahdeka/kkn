/* =========================================================
   VARIABEL GLOBAL CHART
========================================================= */
let chartBBU, chartTBU, chartBBTB;

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
  if (tb < sd["-3"]) return "Sangat Pendek (Severely Stunted)";
  if (tb < sd["-2"]) return "Pendek (Stunted)";
  if (tb <= sd["+3"]) return "Normal";
  return "Tinggi";
}

function statusBBTB(bb, sd) {
  if (bb < sd["-3"]) return "Gizi Buruk";
  if (bb < sd["-2"]) return "Gizi Kurang";
  if (bb <= sd["+1"]) return "Normal";
  if (bb <= sd["+2"]) return "Berisiko Gizi Lebih";
  if (bb <= sd["+3"]) return "Gizi Lebih";
  return "Obesitas";
}

/* =========================================================
   PENJELASAN RAMAH IBU-IBU
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
      "Sangat Pendek (Severely Stunted)":
        "Tinggi badan anak jauh lebih pendek dari anak seusianya. Anak perlu diperiksa lebih lanjut.",
      "Pendek (Stunted)":
        "Tinggi badan anak lebih pendek dari normal. Perlu perhatian pada asupan gizi anak.",
      "Normal":
        "Tinggi badan anak sesuai dengan umurnya. Pertumbuhan anak tergolong baik.",
      "Tinggi":
        "Tinggi badan anak lebih tinggi dari anak seusianya. Tetap pantau pertumbuhan anak."
    },
    BBTB: {
      "Gizi Buruk":
        "Berat badan anak sangat kurang dibandingkan tinggi badannya. Perlu penanganan segera.",
      "Gizi Kurang":
        "Berat badan anak masih kurang dibandingkan tinggi badannya. Perlu perbaikan gizi.",
      "Normal":
        "Berat dan tinggi badan anak sudah seimbang. Pertahankan pola makan sehat.",
      "Berisiko Gizi Lebih":
        "Berat badan anak mulai berlebih. Kurangi makanan manis dan berlemak.",
      "Gizi Lebih":
        "Berat badan anak berlebih. Perlu pengaturan pola makan dan aktivitas fisik.",
      "Obesitas":
        "Berat badan anak sangat berlebih. Sebaiknya dikonsultasikan ke tenaga kesehatan."
    }
  };

  return data[indeks][status] || "";
}

/* =========================================================
   GRAFIK
========================================================= */
function makeDataset(json) {
  const labels = ["-3","-2","-1","0","+1","+2","+3"];
  const colors = ["#dc2626","#f97316","#facc15","#22c55e","#38bdf8","#6366f1","#a855f7"];

  return labels.map((l,i)=>({
    label: `${l} SD`,
    data: json.data.map(d => d.sd[l]),
    borderColor: colors[i],
    borderWidth: 2,
    pointRadius: 0
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
}

/* =========================================================
   ELEMENT HTML
========================================================= */
const jkEl = document.getElementById("jk");
const usiaEl = document.getElementById("usia");
const beratEl = document.getElementById("berat");
const tinggiEl = document.getElementById("tinggi");
