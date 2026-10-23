/**
 * FITNANCE Main Application Entry Point
 * Routing, Header, Theme Manager, Modal handlers
 */

import { Store } from './store.js';
import { DashboardView } from './components/dashboard.js';
import { TransactionsView } from './components/transactions.js';
import { WalletView } from './components/wallet.js';
import { GoalsView } from './components/goals.js';
import { AnalyticsView } from './components/analytics.js';

class App {
  constructor() {
    this.store = new Store();
    
    // Instantiate Views
    this.dashboardView = new DashboardView(this.store);
    this.transactionsView = new TransactionsView(this.store, () => this.handleDataChange());
    this.walletView = new WalletView(this.store, () => this.handleDataChange());
    this.goalsView = new GoalsView(this.store, () => this.handleDataChange());
    this.analyticsView = new AnalyticsView(this.store);

    this.activeTab = 'dashboard';
  }

  init() {
    this.initTheme();
    this.bindNavigation();
    this.bindGlobalModals();
    this.renderActiveTab();
  }

  initTheme() {
    const savedTheme = this.store.getTheme();
    document.documentElement.setAttribute('data-theme', savedTheme);

    const themeToggleBtn = document.getElementById('btn-toggle-theme');
    if (themeToggleBtn) {
      themeToggleBtn.innerHTML = savedTheme === 'dark' ? '☀️' : '🌙';
      themeToggleBtn.onclick = () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', nextTheme);
        this.store.setTheme(nextTheme);
        themeToggleBtn.innerHTML = nextTheme === 'dark' ? '☀️' : '🌙';
        
        // Re-render charts for theme color contrast
        this.dashboardView.renderIncomeChart('thisMonth');
        this.dashboardView.renderBudgetChart('thisMonth');
      };
    }
  }

  bindNavigation() {
    const navButtons = document.querySelectorAll('.nav-tab');
    navButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tabTarget = e.currentTarget.dataset.tab;
        if (tabTarget) {
          this.switchTab(tabTarget);
        }
      });
    });

    // "See all" link on Dashboard recent transactions card
    document.getElementById('link-see-all-transactions')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.switchTab('transactions');
    });
  }

  switchTab(tabName) {
    this.activeTab = tabName;

    // Update Nav buttons
    document.querySelectorAll('.nav-tab').forEach(b => {
      if (b.dataset.tab === tabName) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    // Show/Hide Page Sections
    document.querySelectorAll('.tab-page').forEach(page => {
      if (page.id === `page-${tabName}`) {
        page.classList.add('active');
      } else {
        page.classList.remove('active');
      }
    });

    this.renderActiveTab();
  }

  renderActiveTab() {
    switch (this.activeTab) {
      case 'dashboard':
        this.dashboardView.render();
        break;
      case 'transactions':
        this.transactionsView.render();
        break;
      case 'wallet':
        this.walletView.render();
        break;
      case 'goals':
        this.goalsView.render();
        break;
      case 'analytics':
      case 'reports':
        this.analyticsView.render();
        break;
    }
  }

  handleDataChange() {
    // Refresh active view and dashboard calculations
    this.dashboardView.renderMetrics();
    this.dashboardView.renderRecentTransactions('all');
    this.dashboardView.renderSpendingLimitWidget();
    this.dashboardView.renderCardWidget();
  }

  bindGlobalModals() {
    // Close buttons on all modals
    document.querySelectorAll('.btn-close-modal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const overlay = e.target.closest('.modal-overlay');
        if (overlay) overlay.classList.remove('active');
      });
    });

    // Close on overlay click outside card
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('active');
        }
      });
    });
  }
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
