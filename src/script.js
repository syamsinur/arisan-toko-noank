import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  update,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// config firebase
const firebaseConfig = {
    apiKey: "AIzaSyBkVzen-wEg8ziqsDYhtY3JsxsjFPlls2M",
    databaseURL: "https://arisan-toko-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "arisan-toko",
    appId: "1:6599577855:web:3a2620f67c27e414bbfcca",
};

// initialize firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// data user
const users = ["Aisyah 1", "Aisyah 2", "Aisyah 3", "Eva", "Evi", "Aliyah", "Dila Oyong", "Lilis Pasar", "Majid", "Margono", "Naura", "Ayu", "Ila", "Luluk", "Juhey", "Sela", "Wakik", "H Amin", "Noank", "Nayla"];
const target = 500000;

// utility
function pay(name, currentTotal) {
    const input = prompt(`Masukkan jumlah setoran untuk ${name}:`);
    if(input) {
        const nominal = parseInt(input);
        const newTotal = currentTotal + nominal;

        if(newTotal > target) return alert("nominal melebihi target!");
        update(ref(db, "pembayaran/" + name), { total: newTotal });
    }
};

function markWin(name, statusWin) {
    if(confirm(`Update status menang ${name}?`)) {
        update(ref(db, "pembayaran/" + name), { sudahMenang: !statusWin });
    }
};

window.pay = pay;
window.markWin = markWin;

// controller
const bResetMonth = document.getElementById("btn-reset-month");
const bResetAll = document.getElementById("btn-reset-all");

bResetMonth.addEventListener('click', function() {
    if(confirm("Reset Bulan?")) {
        users.forEach((name) => {
            update(ref(db, "pembayaran/" + name), { total: 0 })
        });
    }
});

bResetAll.addEventListener('click', function() {
    if(confirm("⚠️ PERINGATAN: Hapus semua data?")) {
        users.forEach((name) => {
            update(ref(db, "pembayaran/" + name), { total: 0, sudahMenang: false })
        });
    }
});

// render (realtime)
onValue(ref(db, "pembayaran"), (snapshot) => {
    const data = snapshot.val() || {};
    const tbody = document.getElementById("table-user");
    tbody.innerHTML = "";

    users.forEach((name, index) => {
        const user = data[name] || { total: 0, sudahMenang: false };
        const remaining = target - user.total;
        const paidOff = remaining <= 0;

        tbody.innerHTML += `
            <tr class="${user.sudahMenang ? "bg-green-50" : "odd:bg-neutral-primary even:bg-neutral-secondary-soft"} lg:text-base border-b border-default">
                <td class="px-6 py-4 text-center font-medium">
                    ${index + 1}
                </td>
                <td class="px-6 py-4 text-center">
                    <div class="${user.sudahMenang ? "text-green-700" : ""} text-base font-medium">
                        ${name}
                    </div>
                    <div class="text-xs ${paidOff ? "text-green-600" : "text-red-400"} font-medium">
                        ${paidOff ? "LUNAS" : "SISA: Rp " + remaining.toLocaleString()}
                    </div>
                </td>
                <td class="px-6 py-4 text-center">
                    Rp ${user.total.toLocaleString()}
                </td>
                <td class="px-6 py-4 text-center">
                    <button onclick="pay('${name}', ${user.total})" class="px-2 py-1 text-xs font-medium text-white bg-blue-500 rounded-xs hover:underline hover:text-inherit hover:bg-white border lg:text-base">Pay</button>
                    <span class="hidden sm:inline-flex ${user.sudahMenang ? "hidden" : ""}"> | </span>
                    <button onclick="markWin('${name}', ${user.sudahMenang})" class="${user.sudahMenang ? "hidden" : ""} px-2 py-1 text-xs font-medium text-white bg-green-500 rounded-xs hover:underline hover:text-inherit hover:bg-white border lg:text-base">Win</button>
                    <span class="text-lg lg:text-2xl">${user.sudahMenang ? "🏆" : ""}</span>
                </td>
            </tr>
        `;
    });
});

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('../sw.js')
      .then(() => console.log("PWA Aktif!"))
      .catch((err) => console.log("PWA Gagal", err));
  });
}
