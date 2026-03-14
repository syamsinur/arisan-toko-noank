import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  update,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// config firebase
const firebaseConfig = {
    apiKey: "AIzaSyBl8JvlW7ogHyTUfesUIppV06SOxdKfAFU",
    databaseURL: "https://arisan-project-cdd36-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "arisan-project-cdd36",
    appId: "1:582708258054:web:a32d2ceca13015dde6ea87",
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
        update(ref(db, "payment/" + name), { total: newTotal });
    }
};

function markWin(name, statusWin) {
    if(confirm(`Update status menang ${name}?`)) {
        update(ref(db, "payment/" + name), { statusWin: !statusWin });
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
            update(ref(db, "payment/" + name), { total: 0 })
        });
    }
});

bResetAll.addEventListener('click', function() {
    if(confirm("⚠️ PERINGATAN: Hapus semua data?")) {
        users.forEach((name) => {
            update(ref(db, "payment/" + name), { total: 0, statusWin: false })
        });
    }
});

// render (realtime)
onValue(ref(db, "payment"), (snapshot) => {
    const data = snapshot.val() || {};
    const tbody = document.getElementById("table-user");
    tbody.innerHTML = "";

    users.forEach((name, index) => {
        const user = data[name] || { total: 0, statusWin: false };
        const remaining = target - user.total;
        const paidOff = remaining <= 0;

        tbody.innerHTML += `
            <tr class="${user.statusWin ? "bg-green-50" : "odd:bg-neutral-primary even:bg-neutral-secondary-soft"} lg:text-base border-b border-default">
                <td class="px-6 py-4 text-center font-medium">
                    ${index + 1}
                </td>
                <td class="px-6 py-4 text-center">
                    <div class="${user.statusWin ? "text-green-700" : ""} text-base font-medium">
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
                    <span class="hidden sm:inline-flex ${user.statusWin ? "hidden" : ""}"> | </span>
                    <button onclick="markWin('${name}', ${user.statusWin})" class="${user.statusWin ? "hidden" : ""} px-2 py-1 text-xs font-medium text-white bg-green-500 rounded-xs hover:underline hover:text-inherit hover:bg-white border lg:text-base">Win</button>
                    <span class="text-lg lg:text-2xl">${user.statusWin ? "🏆" : ""}</span>
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
