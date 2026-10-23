/**
 * Goals View Controller
 * Manage savings goals, contributions, progress bars
 */

export class GoalsView {
  constructor(store, onDataChange) {
    this.store = store;
    this.onDataChange = onDataChange;
    this.goalIdToDeposit = null;
  }

  render() {
    this.renderGoalsGrid();
    this.bindEvents();
  }

  renderGoalsGrid() {
    const container = document.getElementById('goals-grid-container');
    if (!container) return;

    const goals = this.store.getGoals();

    if (goals.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align:center; padding: 3rem; background: var(--color-white); border-radius: var(--radius-card);">
          <h3>No Savings Goals Yet</h3>
          <p style="color: var(--color-text-muted); margin-bottom: 1.5rem;">Set up your first financial goal to start tracking progress.</p>
          <button class="btn btn-primary" id="btn-empty-add-goal">+ Create Goal</button>
        </div>
      `;
      document.getElementById('btn-empty-add-goal')?.addEventListener('click', () => this.openAddGoalModal());
      return;
    }

    container.innerHTML = goals.map(g => {
      const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
      const targetDateFormatted = new Date(g.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      return `
        <div class="card goal-card">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">
              <h3 style="font-size:1.1rem; color:var(--color-text-dark);">${g.name}</h3>
              <button class="btn-icon-only delete-goal-btn" data-id="${g.id}">🗑️</button>
            </div>
            <div style="font-size:1.5rem; font-weight:800; color:var(--color-primary); margin-bottom:0.25rem;">
              $${g.currentAmount.toLocaleString()} <span style="font-size:0.9rem; font-weight:500; color:var(--color-text-muted);">/ $${g.targetAmount.toLocaleString()}</span>
            </div>
            <div class="progress-bar-container" style="margin: 0.75rem 0 0.5rem 0;">
              <div class="progress-bar-fill" style="width: ${pct}%;"></div>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:var(--color-text-muted);">
              <span>Progress: <strong>${pct}%</strong></span>
              <span>Target: <strong>${targetDateFormatted}</strong></span>
            </div>
          </div>
          <button class="btn btn-secondary deposit-goal-btn" data-id="${g.id}" style="width:100%; margin-top:1rem;">
            + Deposit Contribution
          </button>
        </div>
      `;
    }).join('');
  }

  bindEvents() {
    document.getElementById('btn-open-add-goal')?.addEventListener('click', () => this.openAddGoalModal());

    document.getElementById('goals-grid-container')?.addEventListener('click', (e) => {
      const depositBtn = e.target.closest('.deposit-goal-btn');
      const deleteBtn = e.target.closest('.delete-goal-btn');

      if (depositBtn) {
        const id = depositBtn.dataset.id;
        this.openDepositModal(id);
      } else if (deleteBtn) {
        const id = deleteBtn.dataset.id;
        this.store.deleteGoal(id);
        this.renderGoalsGrid();
        this.onDataChange();
      }
    });

    const addGoalForm = document.getElementById('addGoalModalForm');
    if (addGoalForm) {
      addGoalForm.onsubmit = (e) => {
        e.preventDefault();
        this.handleAddGoalSubmit();
      };
    }

    const depositForm = document.getElementById('depositGoalModalForm');
    if (depositForm) {
      depositForm.onsubmit = (e) => {
        e.preventDefault();
        this.handleDepositSubmit();
      };
    }
  }

  openAddGoalModal() {
    document.getElementById('addGoalModalForm').reset();
    document.getElementById('addGoalModalOverlay').classList.add('active');
  }

  handleAddGoalSubmit() {
    const name = document.getElementById('goalFormName').value;
    const targetAmount = document.getElementById('goalFormTarget').value;
    const currentAmount = document.getElementById('goalFormCurrent').value;
    const targetDate = document.getElementById('goalFormDate').value;

    this.store.addGoal({ name, targetAmount, currentAmount, targetDate });
    document.getElementById('addGoalModalOverlay').classList.remove('active');
    this.renderGoalsGrid();
    this.onDataChange();
  }

  openDepositModal(goalId) {
    this.goalIdToDeposit = goalId;
    document.getElementById('depositGoalModalForm').reset();
    document.getElementById('depositGoalModalOverlay').classList.add('active');
  }

  handleDepositSubmit() {
    const amount = document.getElementById('depositFormAmount').value;
    if (this.goalIdToDeposit && amount) {
      this.store.updateGoalAmount(this.goalIdToDeposit, amount);
      document.getElementById('depositGoalModalOverlay').classList.remove('active');
      this.renderGoalsGrid();
      this.onDataChange();
    }
  }
}
