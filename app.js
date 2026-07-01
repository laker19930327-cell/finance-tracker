const STORAGE_KEY = "personal-finance-coach-v1";

const categories = [
  {
    id: "income",
    label: "收入",
    type: "income",
    purpose: "薪資、副業、獎金、其他入帳",
    role: "現金流來源",
    tone: "essential",
    hint: "收入增加時，先把多出的部分分配到預備金、投資或學習。",
  },
  {
    id: "essentials",
    label: "必要生活",
    type: "expense",
    purpose: "房租、房貸、餐食、交通、水電、保險",
    role: "每月上限 50%",
    tone: "essential",
    hint: "先檢查固定費、保險、通勤與餐食習慣，通常比少買一次東西更有感。",
  },
  {
    id: "flex",
    label: "彈性消費",
    type: "expense",
    purpose: "外食升級、娛樂、購物、訂閱、旅遊",
    role: "每月上限 20%",
    tone: "flex",
    hint: "最適合優先節流，從訂閱、衝動購物、外送與娛樂頻率開始看。",
  },
  {
    id: "reserve",
    label: "儲蓄預備金",
    type: "expense",
    purpose: "緊急預備金、短期目標、年度支出準備",
    role: "優先 15%",
    tone: "essential",
    hint: "這筆錢是安全墊，不建議當作可節流項目。",
  },
  {
    id: "invest",
    label: "長期投資",
    type: "expense",
    purpose: "定期定額、退休帳戶、長期資產配置",
    role: "建議 10%",
    tone: "growth",
    hint: "投資前先確認緊急預備金與高利負債狀態，避免被迫賣出。",
  },
  {
    id: "learning",
    label: "專業學習",
    type: "expense",
    purpose: "課程、書籍、證照、工具、顧問諮詢",
    role: "建議 5%",
    tone: "growth",
    hint: "保留能提高收入或效率的學習，刪掉只讓你焦慮卻不會使用的課程。",
  },
  {
    id: "debt",
    label: "債務加速",
    type: "expense",
    purpose: "信用卡、信貸、其他高利負債額外還款",
    role: "高利率優先",
    tone: "risk",
    hint: "若利率偏高，通常比增加投資更值得優先處理。",
  },
  {
    id: "oneoff",
    label: "一次性支出",
    type: "expense",
    purpose: "醫療、維修、禮金、不可預期支出",
    role: "單獨追蹤",
    tone: "risk",
    hint: "一次性支出不一定要砍，但要看是否能提前準備或分月攤提。",
  },
];

const defaultState = {
  profile: {
    monthlyIncome: 60000,
    emergencyFund: 120000,
    debtPayment: 0,
    emergencyMonths: 6,
    currency: "TWD",
    riskLevel: "medium",
  },
  transactions: [],
};

const categoryMap = new Map(categories.map((category) => [category.id, category]));
const expenseCategoryIds = categories.filter((category) => category.type === "expense").map((category) => category.id);
const incomeCategoryIds = categories.filter((category) => category.type === "income").map((category) => category.id);

const elements = {
  monthPicker: document.querySelector("#monthPicker"),
  monthlyIncome: document.querySelector("#monthlyIncome"),
  emergencyFund: document.querySelector("#emergencyFund"),
  debtPayment: document.querySelector("#debtPayment"),
  emergencyMonths: document.querySelector("#emergencyMonths"),
  currency: document.querySelector("#currency"),
  riskLevel: document.querySelector("#riskLevel"),
  profileForm: document.querySelector("#profileForm"),
  incomeTotal: document.querySelector("#incomeTotal"),
  expenseTotal: document.querySelector("#expenseTotal"),
  netTotal: document.querySelector("#netTotal"),
  growthMoney: document.querySelector("#growthMoney"),
  analysisSummary: document.querySelector("#analysisSummary"),
  dailyAverage: document.querySelector("#dailyAverage"),
  projectedExpense: document.querySelector("#projectedExpense"),
  savingPotential: document.querySelector("#savingPotential"),
  categoryBreakdown: document.querySelector("#categoryBreakdown"),
  budgetList: document.querySelector("#budgetList"),
  priorityList: document.querySelector("#priorityList"),
  txDate: document.querySelector("#txDate"),
  txType: document.querySelector("#txType"),
  txCategory: document.querySelector("#txCategory"),
  txAmount: document.querySelector("#txAmount"),
  txNote: document.querySelector("#txNote"),
  transactionForm: document.querySelector("#transactionForm"),
  quickCategories: document.querySelector("#quickCategories"),
  categoryTable: document.querySelector("#categoryTable"),
  recordsBody: document.querySelector("#recordsBody"),
  emptyState: document.querySelector("#emptyState"),
  backupData: document.querySelector("#backupData"),
  restoreData: document.querySelector("#restoreData"),
  restoreFile: document.querySelector("#restoreFile"),
  exportCsv: document.querySelector("#exportCsv"),
  clearMonth: document.querySelector("#clearMonth"),
  tabButtons: document.querySelectorAll(".view-tab"),
  tabPanels: document.querySelectorAll("[data-tab-panel]"),
};

let state = loadState();

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return structuredClone(defaultState);
    return {
      profile: { ...defaultState.profile, ...saved.profile },
      transactions: Array.isArray(saved.transactions) ? saved.transactions : [],
    };
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getToday() {
  return getLocalDateString();
}

function getCurrentMonth() {
  return getToday().slice(0, 7);
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[character];
  });
}

function formatMoney(value) {
  const currency = state.profile.currency || "TWD";
  return new Intl.NumberFormat("zh-Hant", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "JPY" ? 0 : 0,
  }).format(value);
}

function getMonthTransactions() {
  const selectedMonth = elements.monthPicker.value;
  return state.transactions.filter((transaction) => transaction.date.startsWith(selectedMonth));
}

function calculateMonthSummary() {
  const monthTransactions = getMonthTransactions();
  const income = monthTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const expense = monthTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  return {
    income,
    expense,
    net: income - expense,
    transactions: monthTransactions,
  };
}

function getBudgetPlan() {
  const income = state.profile.monthlyIncome;
  const debtPayment = state.profile.debtPayment;
  const riskLevel = state.profile.riskLevel;
  const hasDebt = debtPayment > 0;

  let plan = [
    { id: "essentials", label: "必要生活", ratio: 0.5, color: "#23624d" },
    { id: "flex", label: "彈性消費", ratio: 0.2, color: "#245c93" },
    { id: "reserve", label: "儲蓄預備金", ratio: 0.15, color: "#34816a" },
    { id: "invest", label: "長期投資", ratio: 0.1, color: "#a35f00" },
    { id: "learning", label: "專業學習", ratio: 0.05, color: "#7b5bb7" },
  ];

  if (riskLevel === "low") {
    plan = [
      { id: "essentials", label: "必要生活", ratio: 0.5, color: "#23624d" },
      { id: "flex", label: "彈性消費", ratio: 0.15, color: "#245c93" },
      { id: "reserve", label: "儲蓄預備金", ratio: 0.2, color: "#34816a" },
      { id: "invest", label: "長期投資", ratio: 0.08, color: "#a35f00" },
      { id: "learning", label: "專業學習", ratio: 0.07, color: "#7b5bb7" },
    ];
  }

  if (riskLevel === "high") {
    plan = [
      { id: "essentials", label: "必要生活", ratio: 0.5, color: "#23624d" },
      { id: "flex", label: "彈性消費", ratio: 0.18, color: "#245c93" },
      { id: "reserve", label: "儲蓄預備金", ratio: 0.12, color: "#34816a" },
      { id: "invest", label: "長期投資", ratio: 0.15, color: "#a35f00" },
      { id: "learning", label: "專業學習", ratio: 0.05, color: "#7b5bb7" },
    ];
  }

  if (hasDebt) {
    plan = plan.map((item) => {
      if (item.id === "invest") return { ...item, ratio: Math.max(0.03, item.ratio - 0.05) };
      if (item.id === "debt") return item;
      return item;
    });
    plan.push({ id: "debt", label: "債務加速", ratio: 0.05, color: "#a13b37" });
  }

  return plan.map((item) => ({ ...item, amount: Math.round(income * item.ratio) }));
}

function calculateCategorySpend(categoryId) {
  return getMonthTransactions()
    .filter((transaction) => transaction.type === "expense" && transaction.category === categoryId)
    .reduce((sum, transaction) => sum + transaction.amount, 0);
}

function getSelectedMonthStats() {
  const [year, month] = elements.monthPicker.value.split("-").map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const currentMonth = getCurrentMonth();
  const today = new Date();
  const selectedMonth = elements.monthPicker.value;
  let elapsedDays = daysInMonth;

  if (selectedMonth === currentMonth) {
    elapsedDays = Math.min(today.getDate(), daysInMonth);
  } else if (selectedMonth > currentMonth) {
    elapsedDays = 1;
  }

  return {
    daysInMonth,
    elapsedDays: Math.max(1, elapsedDays),
    remainingDays: Math.max(daysInMonth - elapsedDays, 0),
  };
}

function getCategoryAnalysis() {
  const plan = getBudgetPlan();
  const planMap = new Map(plan.map((item) => [item.id, item]));
  const ids = [...new Set([...expenseCategoryIds, ...plan.map((item) => item.id)])];

  return ids.map((id) => {
    const category = categoryMap.get(id);
    const budget = planMap.get(id)?.amount ?? 0;
    const spent = calculateCategorySpend(id);
    const remaining = budget > 0 ? budget - spent : -spent;
    const usage = budget > 0 ? spent / budget : spent > 0 ? 1 : 0;
    let status = "未使用";
    let severity = "quiet";

    if (spent > 0 && budget === 0) {
      status = "單獨檢查";
      severity = "watch";
    } else if (usage >= 1) {
      status = "已超支";
      severity = "over";
    } else if (usage >= 0.8) {
      status = "接近上限";
      severity = "watch";
    } else if (spent > 0) {
      status = "穩定";
      severity = "good";
    }

    return {
      id,
      label: category?.label ?? id,
      hint: category?.hint ?? "",
      budget,
      spent,
      remaining,
      usage,
      status,
      severity,
      tone: category?.tone ?? "essential",
    };
  });
}

function getSavingAnalysis(summary = calculateMonthSummary()) {
  const categoryAnalysis = getCategoryAnalysis();
  const monthStats = getSelectedMonthStats();
  const dailyAverage = summary.expense / monthStats.elapsedDays;
  const projectedExpense = dailyAverage * monthStats.daysInMonth;
  const plannedExpense = getBudgetPlan().reduce((sum, item) => sum + item.amount, 0);
  const overBudget = categoryAnalysis.reduce((sum, item) => {
    if (item.budget <= 0) return sum;
    return sum + Math.max(item.spent - item.budget, 0);
  }, 0);
  const flex = categoryAnalysis.find((item) => item.id === "flex");
  const oneoff = categoryAnalysis.find((item) => item.id === "oneoff");
  const flexOpportunity = flex ? Math.max(flex.spent - flex.budget * 0.8, 0) : 0;
  const oneoffReview = oneoff?.spent > 0 ? Math.round(oneoff.spent * 0.2) : 0;
  const projectedOver = Math.max(projectedExpense - plannedExpense, 0);
  const savingPotential = Math.round(Math.max(overBudget, flexOpportunity + oneoffReview, projectedOver * 0.35));
  const overCategoryCount = categoryAnalysis.filter((item) => item.severity === "over").length;
  const watchCategoryCount = categoryAnalysis.filter((item) => item.severity === "watch").length;

  let score = 100;
  if (plannedExpense > 0) score -= Math.min(35, (overBudget / plannedExpense) * 100);
  if (plannedExpense > 0) score -= Math.min(25, (projectedOver / plannedExpense) * 60);
  score -= Math.min(30, overCategoryCount * 10 + watchCategoryCount * 4);
  if (summary.net < 0) score -= 25;
  if (summary.expense === 0) score = 0;
  score = Math.max(0, Math.round(score));

  const topSavingTargets = categoryAnalysis
    .filter((item) => item.spent > 0 && ["flex", "essentials", "oneoff"].includes(item.id))
    .sort((a, b) => {
      const aPressure = a.budget > 0 ? a.usage : 1;
      const bPressure = b.budget > 0 ? b.usage : 1;
      return bPressure - aPressure || b.spent - a.spent;
    })
    .slice(0, 3);

  return {
    categoryAnalysis,
    dailyAverage,
    projectedExpense,
    plannedExpense,
    savingPotential,
    score,
    overCategoryCount,
    watchCategoryCount,
    topSavingTargets,
    monthStats,
  };
}

function getMonthlyCoreExpenseEstimate() {
  const plan = getBudgetPlan();
  const essentials = plan.find((item) => item.id === "essentials")?.amount ?? 0;
  return Math.max(essentials + state.profile.debtPayment, state.profile.monthlyIncome * 0.5);
}

function renderProfile() {
  elements.monthlyIncome.value = state.profile.monthlyIncome;
  elements.emergencyFund.value = state.profile.emergencyFund;
  elements.debtPayment.value = state.profile.debtPayment;
  elements.emergencyMonths.value = state.profile.emergencyMonths;
  elements.currency.value = state.profile.currency;
  elements.riskLevel.value = state.profile.riskLevel;
}

function renderCategorySelect() {
  const ids = elements.txType.value === "income" ? incomeCategoryIds : expenseCategoryIds;
  elements.txCategory.innerHTML = ids
    .map((id) => {
      const category = categoryMap.get(id);
      return `<option value="${category.id}">${category.label}</option>`;
    })
    .join("");
}

function renderQuickCategories() {
  const ids =
    elements.txType.value === "income" ? incomeCategoryIds : ["essentials", "flex", "learning", "invest", "oneoff"];
  elements.quickCategories.innerHTML = ids
    .map((id) => {
      const category = categoryMap.get(id);
      return `<button type="button" class="quick-chip" data-category="${category.id}">${category.label}</button>`;
    })
    .join("");
}

function renderCategoryTable() {
  elements.categoryTable.innerHTML = categories
    .filter((category) => category.type === "expense")
    .map(
      (category) => `
        <tr>
          <td><span class="category-pill tone-${category.tone}">${category.label}</span></td>
          <td>${category.purpose}</td>
          <td>${category.role}</td>
        </tr>
      `,
    )
    .join("");
}

function renderBudget() {
  const plan = getBudgetPlan();
  const rows = plan
    .map((item) => {
      const used = calculateCategorySpend(item.id);
      const fill = item.amount > 0 ? Math.min((used / item.amount) * 100, 100) : 0;
      return `
        <div class="budget-row">
          <div class="budget-topline">
            <span class="budget-name">${item.label}</span>
            <span class="budget-ratio">${Math.round(item.ratio * 100)}%</span>
            <span class="budget-value">${formatMoney(item.amount)}</span>
          </div>
          <div class="progress-shell" aria-label="${item.label} 已用 ${Math.round(fill)}%">
            <div class="progress-fill" style="--fill: ${fill}%; --bar: ${item.color}"></div>
          </div>
        </div>
      `;
    })
    .join("");
  elements.budgetList.innerHTML = rows;
}

function renderAnalysis() {
  const summary = calculateMonthSummary();
  const analysis = getSavingAnalysis(summary);
  const categoryRows = analysis.categoryAnalysis
    .filter((item) => item.spent > 0 || item.budget > 0)
    .sort((a, b) => b.spent - a.spent || b.usage - a.usage)
    .map((item) => {
      const fill = item.budget > 0 ? Math.min(item.usage * 100, 100) : item.spent > 0 ? 100 : 0;
      const budgetText = item.budget > 0 ? ` / ${formatMoney(item.budget)}` : "";
      const remainingText =
        item.budget > 0
          ? item.remaining >= 0
            ? `剩 ${formatMoney(item.remaining)}`
            : `超 ${formatMoney(Math.abs(item.remaining))}`
          : "未列入月預算";

      return `
        <div class="category-status">
          <div class="category-status-top">
            <span class="category-pill tone-${item.tone}">${item.label}</span>
            <span class="status-badge status-${item.severity}">${item.status}</span>
          </div>
          <div class="category-amounts">
            <strong>${formatMoney(item.spent)}${budgetText}</strong>
            <span>${remainingText}</span>
          </div>
          <div class="progress-shell">
            <div class="progress-fill" style="--fill: ${fill}%; --bar: ${item.severity === "over" ? "#a13b37" : "#23624d"}"></div>
          </div>
        </div>
      `;
    })
    .join("");

  let summaryTitle = "先建立記帳樣本";
  let summaryText = "連續記錄 7 天後，這裡會更準確地指出哪些分類最值得節流。";
  let scoreTone = "quiet";

  if (summary.transactions.length > 0) {
    if (summary.net < 0) {
      summaryTitle = "本月現金流為負";
      summaryText = "先暫停非必要消費，確認固定支出與一次性支出是否擠壓到基本現金流。";
      scoreTone = "over";
    } else if (analysis.overCategoryCount > 0) {
      summaryTitle = "部分分類已超支";
      summaryText = "先處理已超支分類，再看接近上限的項目；這會比平均少花更容易執行。";
      scoreTone = "over";
    } else if (analysis.projectedExpense > analysis.plannedExpense) {
      summaryTitle = "照目前速度可能超支";
      summaryText = "優先看彈性消費與一次性支出，先設定每週上限會比月底才檢查更有效。";
      scoreTone = "watch";
    } else if (analysis.savingPotential > 0) {
      summaryTitle = "有可整理的節流空間";
      summaryText = "目前仍在可控範圍內，但有些分類已接近上限，可以先做小幅調整。";
      scoreTone = "watch";
    } else {
      summaryTitle = "目前節奏健康";
      summaryText = "支出速度和預算相符，可以維持記帳頻率並把結餘導向預備金、投資或學習。";
      scoreTone = "good";
    }
  }

  const targetList = analysis.topSavingTargets.length
    ? `<ul>${analysis.topSavingTargets
        .map((item) => `<li><strong>${item.label}</strong>：${item.hint}</li>`)
        .join("")}</ul>`
    : `<p>目前還沒有足夠的支出紀錄可判斷節流目標。</p>`;

  elements.analysisSummary.innerHTML = `
    <div class="score-card score-${scoreTone}">
      <div class="score-number">
        <strong>${analysis.score}</strong>
        <span>分</span>
      </div>
      <div>
        <h3>${summaryTitle}</h3>
        <p>${summaryText}</p>
      </div>
    </div>
    <div class="saving-targets">
      <h3>優先檢查</h3>
      ${targetList}
    </div>
  `;
  elements.dailyAverage.textContent = formatMoney(Math.round(analysis.dailyAverage));
  elements.projectedExpense.textContent = formatMoney(Math.round(analysis.projectedExpense));
  elements.savingPotential.textContent = formatMoney(analysis.savingPotential);
  elements.categoryBreakdown.innerHTML = categoryRows || `<p class="empty-state visible">新增支出後會顯示分類狀態</p>`;
}

function renderPriorities() {
  const monthlyCoreExpense = getMonthlyCoreExpenseEstimate();
  const targetEmergency = Math.round(monthlyCoreExpense * state.profile.emergencyMonths);
  const emergencyGap = Math.max(targetEmergency - state.profile.emergencyFund, 0);
  const plan = getBudgetPlan();
  const invest = plan.find((item) => item.id === "invest")?.amount ?? 0;
  const learning = plan.find((item) => item.id === "learning")?.amount ?? 0;
  const debt = plan.find((item) => item.id === "debt")?.amount ?? 0;

  const priorities = [
    `<strong>現金流為正：</strong>先讓本月結餘大於 0，再提高其他配置。`,
    `<strong>緊急預備金：</strong>目標 ${formatMoney(targetEmergency)}，目前缺口 ${formatMoney(emergencyGap)}。`,
  ];

  if (state.profile.debtPayment > 0) {
    priorities.push(`<strong>高利負債：</strong>最低付款外，先預留約 ${formatMoney(debt)} 做加速清償。`);
  }

  priorities.push(`<strong>專業學習：</strong>本月可安排約 ${formatMoney(learning)}，以能增加收入或效率的項目優先。`);
  priorities.push(`<strong>長期投資：</strong>本月可安排約 ${formatMoney(invest)}，以分散、長期、低成本為原則。`);

  elements.priorityList.innerHTML = priorities.map((item) => `<li>${item}</li>`).join("");
}

function renderSummary() {
  const summary = calculateMonthSummary();
  const plan = getBudgetPlan();
  const invest = plan.find((item) => item.id === "invest")?.amount ?? 0;
  const learning = plan.find((item) => item.id === "learning")?.amount ?? 0;

  elements.incomeTotal.textContent = formatMoney(summary.income);
  elements.expenseTotal.textContent = formatMoney(summary.expense);
  elements.netTotal.textContent = formatMoney(summary.net);
  elements.growthMoney.textContent = formatMoney(invest + learning);
}

function renderRecords() {
  const transactions = getMonthTransactions().sort((a, b) => b.date.localeCompare(a.date));
  elements.emptyState.classList.toggle("visible", transactions.length === 0);
  elements.recordsBody.innerHTML = transactions
    .map((transaction) => {
      const category = categoryMap.get(transaction.category);
      const typeLabel = transaction.type === "income" ? "收入" : "支出";
      const typeClass = transaction.type === "income" ? "income-text" : "expense-text";
      const signedAmount = transaction.type === "income" ? transaction.amount : -transaction.amount;
      return `
        <tr>
          <td>${transaction.date}</td>
          <td><span class="${typeClass}">${typeLabel}</span></td>
          <td>${escapeHTML(category?.label ?? "未分類")}</td>
          <td>${escapeHTML(transaction.note || "")}</td>
          <td class="amount-cell">${formatMoney(signedAmount)}</td>
          <td><button class="delete-row" type="button" data-id="${transaction.id}" aria-label="刪除">×</button></td>
        </tr>
      `;
    })
    .join("");
}

function renderAll() {
  renderProfile();
  renderCategorySelect();
  renderQuickCategories();
  renderCategoryTable();
  renderSummary();
  renderAnalysis();
  renderBudget();
  renderPriorities();
  renderRecords();
}

function setActiveTab(target) {
  elements.tabButtons.forEach((button) => {
    const isActive = button.dataset.tabTarget === target;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  elements.tabPanels.forEach((panel) => {
    const isActive = panel.dataset.tabPanel === target;
    panel.classList.toggle("active", isActive);
    panel.hidden = !isActive;
  });
}

function updateProfile(event) {
  event.preventDefault();
  state.profile = {
    monthlyIncome: toNumber(elements.monthlyIncome.value),
    emergencyFund: toNumber(elements.emergencyFund.value),
    debtPayment: toNumber(elements.debtPayment.value),
    emergencyMonths: Math.max(1, toNumber(elements.emergencyMonths.value)),
    currency: elements.currency.value,
    riskLevel: elements.riskLevel.value,
  };
  saveState();
  renderAll();
}

function addTransaction(event) {
  event.preventDefault();
  const amount = toNumber(elements.txAmount.value);
  if (amount <= 0) return;

  state.transactions.push({
    id: crypto.randomUUID(),
    date: elements.txDate.value,
    type: elements.txType.value,
    category: elements.txCategory.value,
    amount,
    note: elements.txNote.value.trim(),
  });

  saveState();
  elements.transactionForm.reset();
  elements.txDate.value = getToday();
  elements.txType.value = "expense";
  renderAll();
}

function deleteTransaction(id) {
  state.transactions = state.transactions.filter((transaction) => transaction.id !== id);
  saveState();
  renderAll();
}

function handleQuickInput(event) {
  const button = event.target.closest(".quick-chip");
  if (!button) return;

  if (button.dataset.amount) {
    elements.txAmount.value = button.dataset.amount;
  }

  if (button.dataset.note) {
    const currentNote = elements.txNote.value.trim();
    elements.txNote.value = currentNote ? `${currentNote} ${button.dataset.note}` : button.dataset.note;
  }

  if (button.dataset.category) {
    const category = categoryMap.get(button.dataset.category);
    if (!category) return;
    elements.txType.value = category.type;
    renderCategorySelect();
    elements.txCategory.value = category.id;
  }
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function backupData() {
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    profile: state.profile,
    transactions: state.transactions,
  };
  downloadFile(`finance-backup-${getToday()}.json`, JSON.stringify(payload, null, 2), "application/json;charset=utf-8");
}

function restoreDataFromFile(file) {
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const payload = JSON.parse(String(reader.result ?? "{}"));
      if (!payload.profile || !Array.isArray(payload.transactions)) {
        throw new Error("Invalid backup file");
      }
      const shouldRestore = window.confirm("匯入備份會覆蓋目前資料，確定要繼續嗎？");
      if (!shouldRestore) return;

      state = {
        profile: { ...defaultState.profile, ...payload.profile },
        transactions: payload.transactions
          .filter((transaction) => transaction.date && transaction.type && transaction.category)
          .map((transaction) => ({
            id: transaction.id || crypto.randomUUID(),
            date: String(transaction.date),
            type: transaction.type === "income" ? "income" : "expense",
            category: String(transaction.category),
            amount: Math.max(0, toNumber(transaction.amount)),
            note: String(transaction.note ?? "").slice(0, 60),
          })),
      };
      saveState();
      renderAll();
    } catch {
      window.alert("備份檔格式無法讀取，請確認是從本工具匯出的 JSON 檔。");
    } finally {
      elements.restoreFile.value = "";
    }
  });
  reader.readAsText(file);
}

function exportCsv() {
  const monthTransactions = getMonthTransactions();
  const header = ["日期", "類型", "分類", "備註", "金額"];
  const rows = monthTransactions.map((transaction) => {
    const category = categoryMap.get(transaction.category);
    return [
      transaction.date,
      transaction.type === "income" ? "收入" : "支出",
      category?.label ?? "未分類",
      transaction.note,
      transaction.amount,
    ];
  });

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(","))
    .join("\n");
  downloadFile(`finance-${elements.monthPicker.value}.csv`, `\ufeff${csv}`, "text/csv;charset=utf-8");
}

function clearMonth() {
  const selectedMonth = elements.monthPicker.value;
  state.transactions = state.transactions.filter((transaction) => !transaction.date.startsWith(selectedMonth));
  saveState();
  renderAll();
}

function registerServiceWorker() {
  const canUseServiceWorker = "serviceWorker" in navigator && window.isSecureContext;

  if (!canUseServiceWorker) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js?v=3").catch(() => {});
  });
}

function requestPersistentStorage() {
  if (!navigator.storage?.persist) return;
  navigator.storage.persist().catch(() => {});
}

function initialize() {
  elements.monthPicker.value = getCurrentMonth();
  elements.txDate.value = getToday();
  renderAll();
  registerServiceWorker();
  requestPersistentStorage();

  elements.profileForm.addEventListener("submit", updateProfile);
  elements.transactionForm.addEventListener("submit", addTransaction);
  elements.transactionForm.addEventListener("click", handleQuickInput);
  elements.tabButtons.forEach((button) => {
    button.addEventListener("click", () => setActiveTab(button.dataset.tabTarget));
  });
  elements.txType.addEventListener("change", () => {
    renderCategorySelect();
    renderQuickCategories();
  });
  elements.monthPicker.addEventListener("change", renderAll);
  elements.backupData.addEventListener("click", backupData);
  elements.restoreData.addEventListener("click", () => elements.restoreFile.click());
  elements.restoreFile.addEventListener("change", () => {
    const [file] = elements.restoreFile.files;
    if (file) restoreDataFromFile(file);
  });
  elements.exportCsv.addEventListener("click", exportCsv);
  elements.clearMonth.addEventListener("click", clearMonth);
  elements.recordsBody.addEventListener("click", (event) => {
    const button = event.target.closest(".delete-row");
    if (button) deleteTransaction(button.dataset.id);
  });
}

initialize();
