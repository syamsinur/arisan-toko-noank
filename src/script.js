import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  update,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// 1. CONFIG FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyBkVzen-wEg8ziqsDYhtY3JsxsjFPlls2M",
  databaseURL: "https://arisan-toko-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "arisan-toko",
  appId: "1:6599577855:web:3a2620f67c27e414bbfcca",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 2. DATA ANGGOTA (Hardcoded)
const daftarAnggota = ["Bu Tejo", "Pak RT", "Mbak Pur", "Mas Bro", "Ibu Hajah"];
const TARGET = 500000;

// 3. FUNGSI-FUNGSI AKSI
window.bayar = (nama, saatIni) => {
  const input = prompt(`Masukkan setoran untuk ${nama}:`);
  if (input) {
    const nominal = parseInt(input);
    const totalBaru = saatIni + nominal;
    if (totalBaru > TARGET) return alert("Kelebihan iuran!");
    update(ref(db, "pembayaran/" + nama), { total: totalBaru });
  }
};

window.tandaiMenang = (nama, statusSekarang) => {
  if (confirm(`Update status menang ${nama}?`)) {
    update(ref(db, "pembayaran/" + nama), { sudahMenang: !statusSekarang });
  }
};

// 4. LOGIKA TOMBOL RESET (Pakai Event Listener agar rapi)
document.getElementById("btnResetBulan").onclick = () => {
  if (confirm("Reset cicilan semua orang jadi Rp 0?")) {
    daftarAnggota.forEach((nama) =>
      update(ref(db, "pembayaran/" + nama), { total: 0 }),
    );
  }
};

document.getElementById("btnResetTotal").onclick = () => {
  if (confirm("⚠️ PERINGATAN: Hapus semua data termasuk riwayat menang?")) {
    daftarAnggota.forEach((nama) =>
      update(ref(db, "pembayaran/" + nama), { total: 0, sudahMenang: false }),
    );
  }
};

// 5. RENDER REALTIME
onValue(ref(db, "pembayaran"), (snapshot) => {
  const data = snapshot.val() || {};
  const tbody = document.getElementById("tabelArisan");
  tbody.innerHTML = "";

  daftarAnggota.forEach((nama) => {
    const user = data[nama] || { total: 0, sudahMenang: false };
    const sisa = TARGET - user.total;
    const isLunas = sisa <= 0;

    tbody.innerHTML += `
            <tr class="border-b ${user.sudahMenang ? "bg-green-50" : ""}">
                <td class="py-4 px-2">
                    <div class="font-bold ${user.sudahMenang ? "text-green-700" : ""}">
                        ${nama} ${user.sudahMenang ? "🏆" : ""}
                    </div>
                    <div class="text-[10px] ${isLunas ? "text-green-600" : "text-red-400"} font-bold">
                        ${isLunas ? "LUNAS" : "SISA: Rp " + sisa.toLocaleString()}
                    </div>
                </td>
                <td class="py-4 px-2 text-right font-mono text-sm">
                    Rp ${user.total.toLocaleString()}
                </td>
                <td class="py-4 px-2 text-center flex justify-center gap-1">
                    ${!isLunas ? `<button onclick="bayar('${nama}', ${user.total})" class="bg-blue-600 text-white p-1 px-2 rounded text-[10px]">BAYAR</button>` : "✅"}
                    <button onclick="tandaiMenang('${nama}', ${user.sudahMenang})" class="bg-gray-200 text-gray-700 p-1 px-2 rounded text-[10px] hover:bg-yellow-400 transition">
                        WIN
                    </button>
                </td>
            </tr>
        `;
  });
});
