let purchases = JSON.parse(localStorage.getItem("purchases") || "[]");

function saveSettings(salary, savingPercent) {
  localStorage.setItem("salary", salary);
  localStorage.setItem("savingGoal", savingPercent * 100);
}

function loadSettings() {
  const storedSalary = localStorage.getItem("salary");
  const storedSaving = localStorage.getItem("savingGoal");

  if (storedSalary) document.getElementById("salaryInput").value = storedSalary;
  if (storedSaving) document.getElementById("savingInput").value = storedSaving;
}

function addPurchase() {
  const name = document.getElementById("itemName").value.trim();
  const price = parseFloat(document.getElementById("itemPrice").value.trim());

  if (!name || isNaN(price)) {
    alert("Enter a valid item name and price.");
    return;
  }

  const now = new Date().toISOString();
  purchases.push({ name, price, date: now });

  localStorage.setItem("purchases", JSON.stringify(purchases));

  document.getElementById("itemName").value = "";
  document.getElementById("itemPrice").value = "";

  updateDisplay();
}

function updateDisplay() {
  const salary = parseFloat(document.getElementById("salaryInput").value);
  const savingPercent = parseFloat(document.getElementById("savingInput").value) / 100;

  if (
    isNaN(salary) ||
    isNaN(savingPercent) ||
    salary === 0 ||
    savingPercent === 0 ||
    savingPercent <= 0 ||
    savingPercent >= 1
  ) {
    return;
  }

  saveSettings(salary, savingPercent);

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const weekStart = getMonday(now);
  weekStart.setHours(0, 0, 0, 0);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);

  let totals = { today: 0, week: 0, month: 0, year: 0 };

  for (const p of purchases) {
    const d = new Date(p.date);
    if (d >= todayStart) totals.today += p.price;
    if (d >= weekStart) totals.week += p.price;
    if (d >= monthStart) totals.month += p.price;
    if (d >= yearStart) totals.year += p.price;
  }

  const perDay = salary / 30;
  const perWeek = (salary * 12) / 52;
  const perMonth = salary;
  const perYear = salary * 12;

  const limits = {
    today: perDay * (1 - savingPercent),
    week: perWeek * (1 - savingPercent),
    month: perMonth * (1 - savingPercent),
    year: perYear * (1 - savingPercent),
  };

  updateGauge("today", totals.today, limits.today);
  updateGauge("week", totals.week, limits.week);
  updateGauge("month", totals.month, limits.month);
  updateGauge("year", totals.year, limits.year);

  document.getElementById("header-salary").textContent = `£${(salary * 12).toLocaleString()} Yearly Salary`;

  const realSaving = salary - totals.month;
  document.getElementById("header-saving").textContent = `Saving £${realSaving.toFixed(2)} This Month`;

  const monthlySavings = {};

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlySavings[key] = salary;
  }

  for (const p of purchases) {
    const d = new Date(p.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (monthlySavings[key] !== undefined) {
      monthlySavings[key] -= p.price;
    }
  }

  localStorage.setItem("monthlySavings", JSON.stringify(monthlySavings));
  updateSavingsChart(monthlySavings);
  updatePurchaseTable();
}

function updateGauge(key, spent, allowed) {
  document.getElementById(`spent-${key}`).textContent = `£${spent.toFixed(2)}`;
  const percent = Math.round((spent / allowed) * 100);
  document.getElementById(`percent-${key}`).textContent = `${percent}%`;
}

function updatePurchaseTable() {
  const tbody = document.getElementById("purchaseTableBody");
  tbody.innerHTML = "";

  const sorted = [...purchases].sort((a, b) => new Date(b.date) - new Date(a.date));

  sorted.forEach((p, i) => {
    const row = document.createElement("tr");

    const itemCell = document.createElement("td");
    itemCell.textContent = p.name;

    const priceCell = document.createElement("td");
    priceCell.textContent = `£${parseFloat(p.price).toFixed(2)}`;

    const dateCell = document.createElement("td");
    const date = new Date(p.date);
    dateCell.textContent = date.toLocaleDateString();

    const deleteCell = document.createElement("td");
    deleteCell.innerHTML = `<button class="delete-btn" onclick="deletePurchase(${i})">✖</button>`;

    row.appendChild(itemCell);
    row.appendChild(priceCell);
    row.appendChild(dateCell);
    row.appendChild(deleteCell);

    tbody.appendChild(row);
  });
}

function deletePurchase(index) {
  purchases.splice(index, 1);
  localStorage.setItem("purchases", JSON.stringify(purchases));
  updateDisplay();
}

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
}

function exportCSV() {
  const csv = ["Item,Price,Date"];
  for (const p of purchases) {
    csv.push(`${p.name},${p.price},${p.date}`);
  }
  const blob = new Blob([csv.join("\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "purchases.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

function exportSavingsCSV() {
  const monthlySavings = JSON.parse(localStorage.getItem("monthlySavings") || "{}");
  const csv = ["Month,Saving"];
  for (const [month, saving] of Object.entries(monthlySavings)) {
    csv.push(`${month},${saving.toFixed(2)}`);
  }
  const blob = new Blob([csv.join("\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "monthly_savings.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

document.getElementById("csvFile").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    const text = event.target.result.trim();
    const lines = text.split("\n").slice(1);
    purchases = lines.map(line => {
      const [name, price, date] = line.split(",");
      return { name, price: parseFloat(price), date };
    });
    localStorage.setItem("purchases", JSON.stringify(purchases));
    updateDisplay();
  };
  reader.readAsText(file);
});

document.getElementById("savingsCsvFile").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    const text = event.target.result.trim();
    const lines = text.split("\n").slice(1);
    const newSavings = {};
    for (const line of lines) {
      const [month, value] = line.split(",");
      if (!month || isNaN(value)) continue;
      newSavings[month] = parseFloat(value);
    }
    localStorage.setItem("monthlySavings", JSON.stringify(newSavings));
    updateSavingsChart(newSavings);
  };
  reader.readAsText(file);
});

let savingsChart;

function updateSavingsChart(monthlySavings) {
  const data = Object.entries(monthlySavings).map(([month, value]) => ({
    x: month,
    value,
  }));

  if (!savingsChart) {
    savingsChart = anychart.area();
    const series = savingsChart.area(data);
    savingsChart.baseline(0);

    series.fill(function () {
      return this.value >= 0 ? "#3F9CD7" : "#F37E59";
    });
    series.stroke(function () {
      return this.value >= 0 ? "#3F9CD7" : "#F37E59";
    });

    savingsChart.xAxis().title("Month");
    savingsChart.yAxis().title("Savings (£)");
    savingsChart.container("savingsChart");
    savingsChart.draw();
  } else {
    const chartSeries = savingsChart.getSeriesAt(0);
    chartSeries.data(data);
  }
}

window.addEventListener("load", () => {
  loadSettings();
  updateDisplay();

  const savedMonthly = localStorage.getItem("monthlySavings");
  if (savedMonthly) {
    updateSavingsChart(JSON.parse(savedMonthly));
  }
});
