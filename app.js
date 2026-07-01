const STORAGE_KEY = "personal-finance-coach-v1";
const DATA_VERSION = 2;

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
  {
    id: "transfer",
    label: "轉帳",
    type: "transfer",
    purpose: "帳戶間資金移動、信用卡繳款",
    role: "不列入消費預算",
    tone: "essential",
    hint: "轉帳只影響現金流與帳戶餘額，不會列入本月收入或支出。",
  },
];

const defaultAccounts = [
  {
    id: "cash",
    name: "現金",
    type: "cash",
    openingBalance: 0,
  },
  {
    id: "bank-main",
    name: "主要銀行",
    type: "bank",
    openingBalance: 0,
  },
  {
    id: "credit-card-main",
    name: "信用卡",
    type: "creditCard",
    openingBalance: 0,
  },
];

const defaultState = {
  version: DATA_VERSION,
  profile: {
    monthlyIncome: 60000,
    emergencyFund: 120000,
    debtPayment: 0,
    emergencyMonths: 6,
    currency: "TWD",
    riskLevel: "medium",
  },
  accounts: defaultAccounts,
  transactions: [],
};

const categoryMap = new Map(categories.map((category) => [category.id, category]));
const expenseCategoryIds = categories.filter((category) => category.type === "expense").map((category) => category.id);
const incomeCategoryIds = categories.filter((category) => category.type === "income").map((category) => category.id);
const validAccountTypes = ["cash", "bank", "creditCard"];
const accountTypeLabels = {
  cash: "現金",
  bank: "銀行帳戶",
  creditCard: "信用卡帳戶",
};
const paymentMethodLabels = {
  cash: "現金",
  bank: "銀行帳戶",
  creditCard: "信用卡",
  transfer: "轉帳",
};

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
  txCategoryField: document.querySelector("#txCategoryField"),
  txPaymentMethod: document.querySelector("#txPaymentMethod"),
  txPaymentMethodField: document.querySelector("#txPaymentMethodField"),
  txAccount: document.querySelector("#txAccount"),
  txAccountLabel: document.querySelector("#txAccountLabel"),
  txTransferAccount: document.querySelector("#txTransferAccount"),
  txTransferField: document.querySelector("#txTransferField"),
  txCreditCardStatementMonth: document.querySelector("#txCreditCardStatementMonth"),
  txStatementField: document.querySelector("#txStatementField"),
  txIncludeInBudget: document.querySelector("#txIncludeInBudget"),
  txIncludeField: document.querySelector("#txIncludeField"),
  txAmount: document.querySelector("#txAmount"),
  txNote: document.querySelector("#txNote"),
  txSubmit: document.querySelector("#txSubmit"),
  cancelEdit: document.querySelector("#cancelEdit"),
  transactionForm: document.querySelector("#transactionForm"),
  quickCategories: document.querySelector("#quickCategories"),
  categoryTable: document.querySelector("#categoryTable"),
  recordsBody: document.querySelector("#recordsBody"),
  emptyState: document.querySelector("#emptyState"),
  accountForm: document.querySelector("#accountForm"),
  accountName: document.querySelector("#accountName"),
  accountType: document.querySelector("#accountType"),
  accountOpeningBalance: document.querySelector("#accountOpeningBalance"),
  accountsList: document.querySelector("#accountsList"),
  accountFilter: document.querySelector("#accountFilter"),
  statementMonthFilter: document.querySelector("#statementMonthFilter"),
  clearFilters: document.querySelector("#clearFilters"),
  backupData: document.querySelector("#backupData"),
  restoreData: document.querySelector("#restoreData"),
  restoreFile: document.querySelector("#restoreFile"),
  exportCsv: document.querySelector("#exportCsv"),
  clearMonth: document.querySelector("#clearMonth"),
  tabButtons: document.querySelectorAll(".view-tab"),
  tabPanels: document.querySelectorAll("[data-tab-panel]"),
  cashflowInTotal: document.querySelector("#cashflowInTotal"),
  cashflowOutTotal: document.querySelector("#cashflowOutTotal"),
  cashflowNetTotal: document.querySelector("#cashflowNetTotal"),
  cardUnpaidTotal: document.querySelector("#cardUnpaidTotal"),
  creditCardSummary: document.querySelector("#creditCardSummary"),
};

let editingTransactionId = null;
let state = loadState();

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function createId(prefix) {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeMonth(value, fallbackDate = getToday()) {
  const month = String(value ?? "");
  if (/^\d{4}-\d{2}$/.test(month)) return month;
  return String(fallbackDate || getToday()).slice(0, 7);
}

function getDefaultAccountId(accounts, type) {
  return accounts.find((account) => account.type === type)?.id || accounts[0]?.id || defaultAccounts[0].id;
}

function inferPaymentMethod(type, transaction) {
  if (type === "transfer") return "transfer";
  if (transaction.paymentMethod && paymentMethodLabels[transaction.paymentMethod]) return transaction.paymentMethod;
  return type === "income" ? "bank" : "cash";
}

function normalizeAccounts(accounts) {
  const source = Array.isArray(accounts) ? accounts : [];
  const normalized = source
    .map((account) => {
      const type = validAccountTypes.includes(account?.type) ? account.type : "bank";
      const id = String(account?.id || createId("account"));
      const name = String(account?.name || accountTypeLabels[type]).trim().slice(0, 30);
      return {
        id,
        name: name || accountTypeLabels[type],
        type,
        openingBalance: toNumber(account?.openingBalance),
      };
    })
    .filter((account, index, list) => list.findIndex((item) => item.id === account.id) === index);

  defaultAccounts.forEach((account) => {
    if (!normalized.some((item) => item.id === account.id)) {
      normalized.push({ ...account });
    }
  });

  return normalized;
}

function normalizeTransaction(transaction, accounts) {
  const type = ["income", "expense", "transfer"].includes(transaction?.type) ? transaction.type : "expense";
  const date = String(transaction?.date || getToday()).slice(0, 10);
  const paymentMethod = inferPaymentMethod(type, transaction || {});
  const fallbackAccountType = paymentMethod === "creditCard" ? "creditCard" : paymentMethod === "cash" ? "cash" : "bank";
  const fallbackAccountId = getDefaultAccountId(accounts, fallbackAccountType);
  const accountId = accounts.some((account) => account.id === transaction?.accountId)
    ? String(transaction.accountId)
    : fallbackAccountId;
  const transferAccountId =
    type === "transfer"
      ? accounts.some((account) => account.id === transaction?.transferAccountId)
        ? String(transaction.transferAccountId)
        : accounts.find((account) => account.id !== accountId)?.id || accountId
      : "";
  const category =
    type === "transfer"
      ? "transfer"
      : categoryMap.get(transaction?.category)?.type === type
        ? String(transaction.category)
        : type === "income"
          ? "income"
          : "essentials";
  const touchesCreditCard =
    accounts.find((account) => account.id === accountId)?.type === "creditCard" ||
    accounts.find((account) => account.id === transferAccountId)?.type === "creditCard";

  return {
    id: String(transaction?.id || createId("tx")),
    date,
    type,
    category,
    amount: Math.max(0, toNumber(transaction?.amount)),
    paymentMethod,
    accountId,
    transferAccountId,
    creditCardStatementMonth: touchesCreditCard ? normalizeMonth(transaction?.creditCardStatementMonth, date) : "",
    includeInBudget: type === "transfer" ? false : transaction?.includeInBudget !== false,
    note: String(transaction?.note ?? "").slice(0, 80),
  };
}

function migrateState(saved) {
  const accounts = normalizeAccounts(saved?.accounts);
  return {
    version: DATA_VERSION,
    profile: { ...defaultState.profile, ...(saved?.profile || {}) },
    accounts,
    transactions: Array.isArray(saved?.transactions)
      ? saved.transactions.map((transaction) => normalizeTransaction(transaction, accounts))
      : [],
  };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return structuredClone(defaultState);
    return migrateState(saved);
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

function getAccountById(accountId) {
  return state.accounts.find((account) => account.id === accountId);
}

function getAccountName(accountId) {
  return getAccountById(accountId)?.name || "未指定帳戶";
}

function getAccountsByType(type) {
  return state.accounts.filter((account) => account.type === type);
}

function isCreditCardAccount(accountId) {
  return getAccountById(accountId)?.type === "creditCard";
}

function isCashFlowAccount(accountId) {
  const type = getAccountById(accountId)?.type;
  return type === "cash" || type === "bank";
}

function isBudgetTransaction(transaction) {
  return transaction.type !== "transfer" && transaction.includeInBudget !== false;
}

function transactionTouchesAccount(transaction, accountId) {
  return transaction.accountId === accountId || transaction.transferAccountId === accountId;
}

function getTransactionTypeLabel(type) {
  if (type === "income") return "收入";
  if (type === "transfer") return "轉帳";
  return "支出";
}

function getTransactionTypeClass(type) {
  if (type === "income") return "income-text";
  if (type === "transfer") return "transfer-text";
  return "expense-text";
}

function getSignedAmount(transaction) {
  if (transaction.type === "income") return transaction.amount;
  if (transaction.type === "transfer") return transaction.amount;
  return -transaction.amount;
}

function getMonthTransactions() {
  const selectedMonth = elements.monthPicker.value;
  return state.transactions.filter((transaction) => transaction.date.startsWith(selectedMonth));
}

function calculateMonthSummary() {
  const monthTransactions = getMonthTransactions();
  const income = monthTransactions
    .filter((transaction) => transaction.type === "income" && isBudgetTransaction(transaction))
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const expense = monthTransactions
    .filter((transaction) => transaction.type === "expense" && isBudgetTransaction(transaction))
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const cashFlow = calculateCashFlow(monthTransactions);

  return {
    income,
    expense,
    net: income - expense,
    cashIn: cashFlow.inflow,
    cashOut: cashFlow.outflow,
    cashNet: cashFlow.inflow - cashFlow.outflow,
    transactions: monthTransactions,
    budgetTransactions: monthTransactions.filter(isBudgetTransaction),
  };
}

function calculateCashFlow(transactions) {
  return transactions.reduce(
    (totals, transaction) => {
      if (transaction.type === "income" && isCashFlowAccount(transaction.accountId)) {
        totals.inflow += transaction.amount;
      }

      if (transaction.type === "expense" && isCashFlowAccount(transaction.accountId)) {
        totals.outflow += transaction.amount;
      }

      if (transaction.type === "transfer") {
        if (isCashFlowAccount(transaction.accountId)) totals.outflow += transaction.amount;
        if (isCashFlowAccount(transaction.transferAccountId)) totals.inflow += transaction.amount;
      }

      return totals;
    },
    { inflow: 0, outflow: 0 },
  );
}

function calculateCreditCardSummary(statementMonth = "") {
  return getAccountsByType("creditCard").map((account) => {
    const openingBalance = statementMonth ? 0 : account.openingBalance;
    const totals = state.transactions.reduce(
      (sum, transaction) => {
        if (statementMonth && transaction.creditCardStatementMonth !== statementMonth) return sum;

        if (transaction.type === "expense" && transaction.accountId === account.id) {
          sum.charges += transaction.amount;
        }

        if (transaction.type === "income" && transaction.accountId === account.id) {
          sum.credits += transaction.amount;
        }

        if (transaction.type === "transfer" && transaction.transferAccountId === account.id) {
          sum.payments += transaction.amount;
        }

        if (transaction.type === "transfer" && transaction.accountId === account.id) {
          sum.charges += transaction.amount;
        }

        return sum;
      },
      { charges: 0, credits: 0, payments: 0 },
    );
    const unpaid = Math.max(0, openingBalance + totals.charges - totals.credits - totals.payments);

    return {
      ...account,
      openingBalance,
      charges: totals.charges,
      credits: totals.credits,
      payments: totals.payments,
      unpaid,
    };
  });
}

function calculateAccountSnapshot(account) {
  if (account.type === "creditCard") {
    return {
      label: "未繳金額",
      value: calculateCreditCardSummary().find((item) => item.id === account.id)?.unpaid ?? account.openingBalance,
    };
  }

  const balance = state.transactions.reduce((sum, transaction) => {
    if (transaction.accountId === account.id) {
      if (transaction.type === "income") return sum + transaction.amount;
      if (transaction.type === "expense") return sum - transaction.amount;
      if (transaction.type === "transfer") return sum - transaction.amount;
    }

    if (transaction.transferAccountId === account.id) {
      return sum + transaction.amount;
    }

    return sum;
  }, account.openingBalance);

  return {
    label: "估算餘額",
    value: balance,
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
    .filter(
      (transaction) =>
        transaction.type === "expense" && transaction.category === categoryId && transaction.includeInBudget !== false,
    )
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
  const ids =
    elements.txType.value === "income"
      ? incomeCategoryIds
      : elements.txType.value === "transfer"
        ? ["transfer"]
        : expenseCategoryIds;

  elements.txCategory.innerHTML = ids
    .map((id) => {
      const category = categoryMap.get(id);
      return `<option value="${category.id}">${category.label}</option>`;
    })
    .join("");
}

function renderPaymentMethodOptions() {
  const type = elements.txType.value;
  const methods = type === "transfer" ? ["transfer"] : ["cash", "bank", "creditCard"];
  const current = elements.txPaymentMethod.value;
  elements.txPaymentMethod.innerHTML = methods
    .map((method) => `<option value="${method}">${paymentMethodLabels[method]}</option>`)
    .join("");
  elements.txPaymentMethod.value = methods.includes(current) ? current : methods[0];
}

function getSelectableAccountsForTransaction() {
  const type = elements.txType.value;
  const paymentMethod = elements.txPaymentMethod.value;
  if (type === "transfer") return state.accounts;
  if (paymentMethod === "creditCard") return getAccountsByType("creditCard");
  if (paymentMethod === "bank") return getAccountsByType("bank");
  return getAccountsByType("cash");
}

function renderAccountOptions(preferredAccountId = elements.txAccount.value, preferredTransferAccountId = elements.txTransferAccount.value) {
  const selectableAccounts = getSelectableAccountsForTransaction();
  const accountOptions = selectableAccounts.length ? selectableAccounts : state.accounts;
  elements.txAccount.innerHTML = accountOptions
    .map((account) => `<option value="${account.id}">${escapeHTML(account.name)}</option>`)
    .join("");

  if (accountOptions.some((account) => account.id === preferredAccountId)) {
    elements.txAccount.value = preferredAccountId;
  }

  const transferOptions = state.accounts.filter((account) => account.id !== elements.txAccount.value);
  elements.txTransferAccount.innerHTML = transferOptions
    .map((account) => `<option value="${account.id}">${escapeHTML(account.name)}</option>`)
    .join("");

  if (transferOptions.some((account) => account.id === preferredTransferAccountId)) {
    elements.txTransferAccount.value = preferredTransferAccountId;
  }
}

function renderTransactionFormControls(preferredAccountId, preferredTransferAccountId) {
  const isTransfer = elements.txType.value === "transfer";
  renderCategorySelect();
  renderPaymentMethodOptions();
  renderAccountOptions(preferredAccountId, preferredTransferAccountId);

  const touchesCreditCard = isCreditCardAccount(elements.txAccount.value) || isCreditCardAccount(elements.txTransferAccount.value);
  elements.txCategoryField.hidden = isTransfer;
  elements.txPaymentMethodField.hidden = isTransfer;
  elements.txTransferField.hidden = !isTransfer;
  elements.txStatementField.hidden = !touchesCreditCard;
  elements.txIncludeField.hidden = isTransfer;
  elements.txAccountLabel.textContent = isTransfer ? "轉出帳戶" : "帳戶";

  if (isTransfer) {
    elements.txIncludeInBudget.checked = false;
    elements.txIncludeInBudget.disabled = true;
  } else {
    elements.txIncludeInBudget.disabled = false;
  }

  if (touchesCreditCard && !elements.txCreditCardStatementMonth.value) {
    elements.txCreditCardStatementMonth.value = normalizeMonth("", elements.txDate.value);
  }
}

function renderQuickCategories() {
  const ids =
    elements.txType.value === "income"
      ? incomeCategoryIds
      : elements.txType.value === "transfer"
        ? ["transfer"]
        : ["essentials", "flex", "learning", "invest", "oneoff"];
  elements.quickCategories.innerHTML = ids
    .map((id) => {
      const category = categoryMap.get(id);
      return `<button type="button" class="quick-chip" data-category="${category.id}">${category.label}</button>`;
    })
    .join("");
}

function renderAccounts() {
  elements.accountsList.innerHTML = state.accounts
    .map((account) => {
      const snapshot = calculateAccountSnapshot(account);
      return `
        <article class="account-card">
          <div>
            <span class="account-type">${accountTypeLabels[account.type]}</span>
            <strong>${escapeHTML(account.name)}</strong>
          </div>
          <div>
            <span>${snapshot.label}</span>
            <strong>${formatMoney(snapshot.value)}</strong>
          </div>
          <button class="delete-account" type="button" data-id="${account.id}" aria-label="刪除帳戶">刪除</button>
        </article>
      `;
    })
    .join("");

  const selectedAccount = elements.accountFilter.value || "all";
  elements.accountFilter.innerHTML = [
    `<option value="all">全部帳戶</option>`,
    ...state.accounts.map((account) => `<option value="${account.id}">${escapeHTML(account.name)}</option>`),
  ].join("");
  elements.accountFilter.value = selectedAccount === "all" || state.accounts.some((account) => account.id === selectedAccount)
    ? selectedAccount
    : "all";
}

function renderCreditCardSummary() {
  const statementMonth = elements.statementMonthFilter.value;
  const cards = calculateCreditCardSummary(statementMonth);
  const totalUnpaid = calculateCreditCardSummary().reduce((sum, card) => sum + card.unpaid, 0);
  elements.cardUnpaidTotal.textContent = formatMoney(totalUnpaid);
  elements.creditCardSummary.innerHTML = cards.length
    ? cards
        .map(
          (card) => `
            <article class="credit-card-card">
              <div>
                <span>${escapeHTML(card.name)}</span>
                <strong>${formatMoney(card.unpaid)}</strong>
              </div>
              <dl>
                <div>
                  <dt>刷卡消費</dt>
                  <dd>${formatMoney(card.charges)}</dd>
                </div>
                <div>
                  <dt>已繳款</dt>
                  <dd>${formatMoney(card.payments)}</dd>
                </div>
              </dl>
            </article>
          `,
        )
        .join("")
    : `<p class="empty-state visible">尚未建立信用卡帳戶</p>`;
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

  if (summary.budgetTransactions.length > 0) {
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
  elements.cashflowInTotal.textContent = formatMoney(summary.cashIn);
  elements.cashflowOutTotal.textContent = formatMoney(summary.cashOut);
  elements.cashflowNetTotal.textContent = formatMoney(summary.cashNet);
}

function getRecordTransactions() {
  const statementMonth = elements.statementMonthFilter.value;
  const accountFilter = elements.accountFilter.value;
  const baseTransactions = statementMonth
    ? state.transactions.filter((transaction) => transaction.creditCardStatementMonth === statementMonth)
    : getMonthTransactions();

  return baseTransactions
    .filter((transaction) => accountFilter === "all" || transactionTouchesAccount(transaction, accountFilter))
    .sort((a, b) => b.date.localeCompare(a.date));
}

function renderRecords() {
  const transactions = getRecordTransactions();
  elements.emptyState.classList.toggle("visible", transactions.length === 0);
  elements.recordsBody.innerHTML = transactions
    .map((transaction) => {
      const category = categoryMap.get(transaction.category);
      const typeLabel = getTransactionTypeLabel(transaction.type);
      const typeClass = getTransactionTypeClass(transaction.type);
      const signedAmount = getSignedAmount(transaction);
      const accountText =
        transaction.type === "transfer"
          ? `${getAccountName(transaction.accountId)} → ${getAccountName(transaction.transferAccountId)}`
          : getAccountName(transaction.accountId);
      const statementText = transaction.creditCardStatementMonth
        ? `<small>帳單 ${transaction.creditCardStatementMonth}</small>`
        : "";
      const budgetText = transaction.includeInBudget === false ? `<small>未列入預算</small>` : "";
      return `
        <tr>
          <td>${transaction.date}</td>
          <td><span class="${typeClass}">${typeLabel}</span></td>
          <td>${escapeHTML(category?.label ?? "未分類")}</td>
          <td class="account-name-cell">${escapeHTML(accountText)}${statementText}</td>
          <td>${escapeHTML(transaction.note || "")}${budgetText}</td>
          <td class="amount-cell">${formatMoney(signedAmount)}</td>
          <td>
            <div class="row-actions">
              <button class="edit-row" type="button" data-id="${transaction.id}">編輯</button>
              <button class="delete-row" type="button" data-id="${transaction.id}" aria-label="刪除">×</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderAll() {
  renderProfile();
  renderAccounts();
  renderTransactionFormControls();
  renderQuickCategories();
  renderCategoryTable();
  renderSummary();
  renderCreditCardSummary();
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

function resetTransactionForm() {
  editingTransactionId = null;
  elements.transactionForm.reset();
  elements.txDate.value = getToday();
  elements.txType.value = "expense";
  elements.txPaymentMethod.value = "cash";
  elements.txIncludeInBudget.checked = true;
  elements.txSubmit.textContent = "新增";
  elements.cancelEdit.hidden = true;
  renderTransactionFormControls();
  renderQuickCategories();
}

function readTransactionForm() {
  const type = elements.txType.value;
  const accountId = elements.txAccount.value;
  const transferAccountId = type === "transfer" ? elements.txTransferAccount.value : "";
  const touchesCreditCard = isCreditCardAccount(accountId) || isCreditCardAccount(transferAccountId);

  return {
    id: editingTransactionId || createId("tx"),
    date: elements.txDate.value,
    type,
    category: type === "transfer" ? "transfer" : elements.txCategory.value,
    amount: Math.max(0, toNumber(elements.txAmount.value)),
    paymentMethod: type === "transfer" ? "transfer" : elements.txPaymentMethod.value,
    accountId,
    transferAccountId,
    creditCardStatementMonth: touchesCreditCard ? normalizeMonth(elements.txCreditCardStatementMonth.value, elements.txDate.value) : "",
    includeInBudget: type === "transfer" ? false : elements.txIncludeInBudget.checked,
    note: elements.txNote.value.trim().slice(0, 80),
  };
}

function addTransaction(event) {
  event.preventDefault();
  const transaction = readTransactionForm();
  if (transaction.amount <= 0) return;
  if (transaction.type === "transfer" && transaction.accountId === transaction.transferAccountId) return;

  if (editingTransactionId) {
    state.transactions = state.transactions.map((item) => (item.id === editingTransactionId ? transaction : item));
  } else {
    state.transactions.push(transaction);
  }

  saveState();
  resetTransactionForm();
  renderAll();
}

function editTransaction(id) {
  const transaction = state.transactions.find((item) => item.id === id);
  if (!transaction) return;
  editingTransactionId = id;
  elements.txDate.value = transaction.date;
  elements.txType.value = transaction.type;
  elements.txPaymentMethod.value = transaction.paymentMethod;
  renderTransactionFormControls(transaction.accountId, transaction.transferAccountId);
  elements.txCategory.value = transaction.category;
  elements.txAccount.value = transaction.accountId;
  renderAccountOptions(transaction.accountId, transaction.transferAccountId);
  elements.txTransferAccount.value = transaction.transferAccountId;
  elements.txCreditCardStatementMonth.value = transaction.creditCardStatementMonth || normalizeMonth("", transaction.date);
  elements.txIncludeInBudget.checked = transaction.includeInBudget !== false;
  elements.txAmount.value = transaction.amount;
  elements.txNote.value = transaction.note || "";
  elements.txSubmit.textContent = "更新";
  elements.cancelEdit.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function deleteTransaction(id) {
  state.transactions = state.transactions.filter((transaction) => transaction.id !== id);
  saveState();
  renderAll();
}

function addAccount(event) {
  event.preventDefault();
  const name = elements.accountName.value.trim();
  if (!name) return;
  state.accounts.push({
    id: createId("account"),
    name: name.slice(0, 30),
    type: elements.accountType.value,
    openingBalance: toNumber(elements.accountOpeningBalance.value),
  });
  saveState();
  elements.accountForm.reset();
  renderAll();
}

function deleteAccount(id) {
  const inUse = state.transactions.some((transaction) => transactionTouchesAccount(transaction, id));
  if (inUse) {
    window.alert("這個帳戶已有交易紀錄，請先修改或刪除相關紀錄。");
    return;
  }

  if (state.accounts.length <= 1) {
    window.alert("至少需要保留一個帳戶。");
    return;
  }

  state.accounts = state.accounts.filter((account) => account.id !== id);
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
    renderTransactionFormControls();
    renderQuickCategories();
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
    version: DATA_VERSION,
    exportedAt: new Date().toISOString(),
    profile: state.profile,
    accounts: state.accounts,
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

      state = migrateState(payload);
      saveState();
      resetTransactionForm();
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
  const monthTransactions = getRecordTransactions();
  const header = ["日期", "類型", "分類", "付款方式", "帳戶", "轉入帳戶", "帳單月份", "列入預算", "備註", "金額"];
  const rows = monthTransactions.map((transaction) => {
    const category = categoryMap.get(transaction.category);
    return [
      transaction.date,
      getTransactionTypeLabel(transaction.type),
      category?.label ?? "未分類",
      paymentMethodLabels[transaction.paymentMethod] ?? transaction.paymentMethod,
      getAccountName(transaction.accountId),
      transaction.transferAccountId ? getAccountName(transaction.transferAccountId) : "",
      transaction.creditCardStatementMonth,
      transaction.includeInBudget === false ? "否" : "是",
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
    navigator.serviceWorker.register("./sw.js?v=4").catch(() => {});
  });
}

function requestPersistentStorage() {
  if (!navigator.storage?.persist) return;
  navigator.storage.persist().catch(() => {});
}

function initialize() {
  elements.monthPicker.value = getCurrentMonth();
  resetTransactionForm();
  renderAll();
  registerServiceWorker();
  requestPersistentStorage();

  elements.profileForm.addEventListener("submit", updateProfile);
  elements.accountForm.addEventListener("submit", addAccount);
  elements.accountsList.addEventListener("click", (event) => {
    const button = event.target.closest(".delete-account");
    if (button) deleteAccount(button.dataset.id);
  });
  elements.transactionForm.addEventListener("submit", addTransaction);
  elements.transactionForm.addEventListener("click", handleQuickInput);
  elements.cancelEdit.addEventListener("click", () => {
    resetTransactionForm();
    renderAll();
  });
  elements.tabButtons.forEach((button) => {
    button.addEventListener("click", () => setActiveTab(button.dataset.tabTarget));
  });
  elements.txType.addEventListener("change", () => {
    renderTransactionFormControls();
    renderQuickCategories();
  });
  elements.txPaymentMethod.addEventListener("change", () => renderTransactionFormControls());
  elements.txAccount.addEventListener("change", () => renderTransactionFormControls(elements.txAccount.value, elements.txTransferAccount.value));
  elements.txTransferAccount.addEventListener("change", () =>
    renderTransactionFormControls(elements.txAccount.value, elements.txTransferAccount.value),
  );
  elements.txDate.addEventListener("change", () => {
    if (!elements.txCreditCardStatementMonth.value) {
      elements.txCreditCardStatementMonth.value = normalizeMonth("", elements.txDate.value);
    }
  });
  elements.monthPicker.addEventListener("change", renderAll);
  elements.accountFilter.addEventListener("change", renderRecords);
  elements.statementMonthFilter.addEventListener("change", () => {
    renderCreditCardSummary();
    renderRecords();
  });
  elements.clearFilters.addEventListener("click", () => {
    elements.accountFilter.value = "all";
    elements.statementMonthFilter.value = "";
    renderCreditCardSummary();
    renderRecords();
  });
  elements.backupData.addEventListener("click", backupData);
  elements.restoreData.addEventListener("click", () => elements.restoreFile.click());
  elements.restoreFile.addEventListener("change", () => {
    const [file] = elements.restoreFile.files;
    if (file) restoreDataFromFile(file);
  });
  elements.exportCsv.addEventListener("click", exportCsv);
  elements.clearMonth.addEventListener("click", clearMonth);
  elements.recordsBody.addEventListener("click", (event) => {
    const editButton = event.target.closest(".edit-row");
    const deleteButton = event.target.closest(".delete-row");
    if (editButton) editTransaction(editButton.dataset.id);
    if (deleteButton) deleteTransaction(deleteButton.dataset.id);
  });
}

initialize();
