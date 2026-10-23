/**
 * Dashboard View Controller
 * Computes Metrics, Renders Income Chart (Bar), Budget Chart (Donut), Recent Transactions, Spending Limit, Card Preview
 */

export class DashboardView {
  constructor(store) {
    this.store = store;
    this.incomeChart = null;
    this.budgetChart = null;
  }

  render() {
    this.renderMetrics();
    this.renderIncomeChart('thisMonth');
    this.renderBudgetChart('thisMonth');
    this.renderRecentTransactions('all');
    this.renderSpendingLimitWidget();
    this.renderCardWidget();
    this.bindEvents();
  }

  renderMetrics() {
    const transactions = this.store.getTransactions();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Current Month Transactions
    const currentMonthTxns = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.status === 'Completed';
    });

    // Last Month Transactions for MoM comparison
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastMonthYear = lastMonthDate.getFullYear();

    const lastMonthTxns = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear && t.status === 'Completed';
    });

    // Income
    const currentIncome = currentMonthTxns.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const lastIncome = lastMonthTxns.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0) || 1;
    const incomeChange = (((currentIncome - lastIncome) / lastIncome) * 100).toFixed(1);

    // Expense
    const currentExpense = currentMonthTxns.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const lastExpense = lastMonthTxns.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0) || 1;
    const expenseChange = (((currentExpense - lastExpense) / lastExpense) * 100).toFixed(1);

    // Balance (Sum of all income minus expenses ever)
    const totalIncomeAll = transactions.filter(t => t.type === 'income' && t.status === 'Completed').reduce((acc, t) => acc + t.amount, 0);
    const totalExpenseAll = transactions.filter(t => t.type === 'expense' && t.status === 'Completed').reduce((acc, t) => acc + t.amount, 0);
    const totalBalance = totalIncomeAll - totalExpenseAll;
    const balanceChange = (incomeChange - expenseChange).toFixed(1);

    // Savings
    const totalSavings = currentIncome - currentExpense;
    const savingsChange = (incomeChange - (expenseChange * 0.5)).toFixed(1);

    // Update DOM
    document.getElementById('metric-total-balance').textContent = `$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    document.getElementById('metric-balance-change').innerHTML = this.formatChangeBadge(balanceChange);

    document.getElementById('metric-total-income').textContent = `$${currentIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    document.getElementById('metric-income-change').innerHTML = this.formatChangeBadge(incomeChange);

    document.getElementById('metric-total-expense').textContent = `$${currentExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    document.getElementById('metric-expense-change').innerHTML = this.formatChangeBadge(expenseChange, true); // Expense up can be red

    document.getElementById('metric-total-savings').textContent = `$${totalSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    document.getElementById('metric-savings-change').innerHTML = this.formatChangeBadge(savingsChange);
  }

  formatChangeBadge(changeValue, isExpense = false) {
    const num = parseFloat(changeValue);
    const isPositive = num >= 0;
    let colorClass = isPositive ? 'positive' : 'negative';
    if (isExpense) {
      colorClass = isPositive ? 'negative' : 'positive';
    }
    const icon = isPositive ? '↑' : '↓';
    return `<span class="metric-change ${colorClass}">${icon} ${Math.abs(num)}% from last month</span>`;
  }

  renderIncomeChart(period) {
    const ctx = document.getElementById('incomeChartCanvas');
    if (!ctx) return;

    if (this.incomeChart) {
      this.incomeChart.destroy();
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const fixedData = [4850, 4850, 4850, 4850, 4850, 4850, 4850, 4850, 4850, 4850, 4850, 4850];
    const variableData = [1200, 950, 1400, 1100, 800, 1350, 1600, 1270, 900, 1150, 1400, 1800];

    const primaryColor = getComputedStyle(document.body).getPropertyValue('--color-primary').trim() || '#2E3A8C';
    const secondaryColor = getComputedStyle(document.body).getPropertyValue('--color-primary-light').trim() || '#4A5FD9';

    this.incomeChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [
          {
            label: 'Fixed Income',
            data: fixedData,
            backgroundColor: primaryColor,
            borderRadius: 6
          },
          {
            label: 'Variable Income',
            data: variableData,
            backgroundColor: secondaryColor,
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { font: { family: 'Inter', weight: '600' } }
          },
          tooltip: {
            callbacks: {
              label: (context) => `${context.dataset.label}: $${context.raw.toLocaleString()}`
            }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            grid: { color: '#E2E8F0' },
            ticks: {
              callback: (value) => `$${value}`
            }
          }
        }
      }
    });
  }

  renderBudgetChart(period) {
    const ctx = document.getElementById('budgetChartCanvas');
    if (!ctx) return;

    if (this.budgetChart) {
      this.budgetChart.destroy();
    }

    const budgets = this.store.getBudgets();
    const labels = budgets.map(b => b.category);
    const spentData = budgets.map(b => b.spentAmount);

    const totalAllocated = budgets.reduce((acc, b) => acc + b.allocatedAmount, 0);
    const totalSpent = budgets.reduce((acc, b) => acc + b.spentAmount, 0);

    document.getElementById('budget-center-spent').textContent = `$${totalSpent.toLocaleString()}`;
    document.getElementById('budget-center-total').textContent = `of $${totalAllocated.toLocaleString()}`;

    this.budgetChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: spentData,
          backgroundColor: [
            '#2E3A8C',
            '#4A5FD9',
            '#10B981',
            '#F59E0B',
            '#8B5CF6'
          ],
          borderWidth: 2,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { font: { family: 'Inter', size: 12, weight: '500' } }
          }
        }
      }
    });
  }

  renderRecentTransactions(filter) {
    const tbody = document.getElementById('recent-transactions-tbody');
    if (!tbody) return;

    let transactions = this.store.getTransactions();
    const now = new Date();

    if (filter === 'thisWeek') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      transactions = transactions.filter(t => new Date(t.date) >= oneWeekAgo);
    } else if (filter === 'thisMonth') {
      transactions = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    }

    // Recent 6 items
    const recent = transactions.slice(0, 6);

    tbody.innerHTML = recent.map(t => {
      const isIncome = t.type === 'income';
      const formattedAmount = `${isIncome ? '+' : '-'}$${t.amount.toFixed(2)}`;
      const amountClass = isIncome ? 'amount-pos' : 'amount-neg';
      const initials = t.recipientName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
      const statusBadge = `<span class="badge badge-${t.status.toLowerCase()}">${t.status}</span>`;
      const dateStr = new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

      return `
        <tr>
          <td>
            <div class="table-user">
              <div class="table-user-avatar">${initials}</div>
              <span>${t.recipientName}</span>
            </div>
          </td>
          <td><code style="font-size:0.8rem; color:var(--color-text-muted);">${t.id}</code></td>
          <td>${statusBadge}</td>
          <td>${dateStr}</td>
          <td class="${amountClass}">${formattedAmount}</td>
        </tr>
      `;
    }).join('');
  }

  renderSpendingLimitWidget() {
    const limit = this.store.getSpendingLimit();
    const transactions = this.store.getTransactions();
    const now = new Date();

    const currentSpent = transactions
      .filter(t => {
        const d = new Date(t.date);
        return t.type === 'expense' && t.status === 'Completed' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((acc, t) => acc + t.amount, 0);

    const percentage = Math.min(100, Math.round((currentSpent / limit) * 100));

    document.getElementById('widget-spent-amount').textContent = `$${currentSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    document.getElementById('widget-limit-amount').textContent = `$${limit.toLocaleString()}`;
    document.getElementById('widget-limit-progress').style.width = `${percentage}%`;
  }

  renderCardWidget() {
    const cards = this.store.getCards();
    const primaryCard = cards[0] || {
      cardNumber: '•••• •••• •••• 0000',
      cardholderName: 'Alex Morgan',
      expiryDate: '12/28',
      cardType: 'visa'
    };

    document.getElementById('widget-card-number').textContent = primaryCard.cardNumber;
    document.getElementById('widget-card-holder').textContent = primaryCard.cardholderName;
    document.getElementById('widget-card-expiry').textContent = primaryCard.expiryDate;
    document.getElementById('widget-card-type').textContent = primaryCard.cardType.toUpperCase();
  }

  bindEvents() {
    const incomeSelector = document.getElementById('incomeTimePeriodSelect');
    if (incomeSelector) {
      incomeSelector.addEventListener('change', (e) => this.renderIncomeChart(e.target.value));
    }

    const budgetSelector = document.getElementById('budgetTimePeriodSelect');
    if (budgetSelector) {
      budgetSelector.addEventListener('change', (e) => this.renderBudgetChart(e.target.value));
    }

    const txnFilterSelector = document.getElementById('recentTxnFilterSelect');
    if (txnFilterSelector) {
      txnFilterSelector.addEventListener('change', (e) => this.renderRecentTransactions(e.target.value));
    }
  }
}
