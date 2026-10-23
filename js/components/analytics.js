/**
 * Analytics & Reports View Controller
 * Spending breakdowns, trends, and CSV/PDF export features
 */

export class AnalyticsView {
  constructor(store) {
    this.store = store;
    this.categoryChart = null;
    this.trendChart = null;
  }

  render() {
    this.renderCategoryBreakdown();
    this.renderTrendComparison();
    this.bindEvents();
  }

  renderCategoryBreakdown() {
    const ctx = document.getElementById('analyticsCategoryChart');
    if (!ctx) return;

    if (this.categoryChart) {
      this.categoryChart.destroy();
    }

    const transactions = this.store.getTransactions().filter(t => t.type === 'expense' && t.status === 'Completed');
    const categoryTotals = {};

    transactions.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);

    this.categoryChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: [
            '#2E3A8C', '#4A5FD9', '#10B981', '#F59E0B', '#EF4444',
            '#8B5CF6', '#EC4899', '#14B8A6', '#6366F1', '#64748B'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right' }
        }
      }
    });
  }

  renderTrendComparison() {
    const ctx = document.getElementById('analyticsTrendChart');
    if (!ctx) return;

    if (this.trendChart) {
      this.trendChart.destroy();
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
    const incomeData = [6050, 5800, 6250, 5950, 5650, 6200, 6450, 6120];
    const expenseData = [3400, 3100, 4200, 3800, 2900, 3600, 4100, 3850];

    this.trendChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: months,
        datasets: [
          {
            label: 'Monthly Income',
            data: incomeData,
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.3
          },
          {
            label: 'Monthly Expenses',
            data: expenseData,
            borderColor: '#EF4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: true,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' }
        },
        scales: {
          y: {
            ticks: { callback: (val) => `$${val}` }
          }
        }
      }
    });
  }

  bindEvents() {
    // Export CSV
    document.getElementById('btn-export-csv')?.addEventListener('click', () => this.exportCSV());

    // Print / PDF Report
    document.getElementById('btn-export-pdf')?.addEventListener('click', () => window.print());
  }

  exportCSV() {
    const transactions = this.store.getTransactions();
    if (transactions.length === 0) {
      alert('No transaction data to export.');
      return;
    }

    const headers = ['ID', 'Recipient/Source', 'Type', 'Category', 'Amount', 'Status', 'Date', 'Notes'];
    const rows = transactions.map(t => [
      t.id,
      `"${t.recipientName.replace(/"/g, '""')}"`,
      t.type,
      t.category,
      t.amount,
      t.status,
      t.date,
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FITNANCE_Transactions_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
