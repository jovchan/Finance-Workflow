/**
 * Wallet View Controller
 * Manage Cards, Card List Display, Add / Edit / Delete cards
 */

export class WalletView {
  constructor(store, onDataChange) {
    this.store = store;
    this.onDataChange = onDataChange;
    this.cardIdToDelete = null;
  }

  render() {
    this.renderCardsGrid();
    this.bindEvents();
  }

  renderCardsGrid() {
    const container = document.getElementById('cards-grid-container');
    if (!container) return;

    const cards = this.store.getCards();

    if (cards.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align:center; padding: 3rem; background: var(--color-white); border-radius: var(--radius-card);">
          <h3>No Payment Cards Added</h3>
          <p style="color: var(--color-text-muted); margin-bottom: 1.5rem;">Click the "Add Card" button to save your first card preview.</p>
          <button class="btn btn-primary" id="btn-empty-add-card">+ Add Card</button>
        </div>
      `;
      document.getElementById('btn-empty-add-card')?.addEventListener('click', () => this.openAddCardModal());
      return;
    }

    container.innerHTML = cards.map(c => {
      const typeUpper = c.cardType.toUpperCase();
      let gradient = 'linear-gradient(135deg, #1A2254 0%, #2E3A8C 100%)';
      if (c.cardType === 'mastercard') {
        gradient = 'linear-gradient(135deg, #0F172A 0%, #3B82F6 100%)';
      } else if (c.cardType === 'amex') {
        gradient = 'linear-gradient(135deg, #065F46 0%, #10B981 100%)';
      }

      return `
        <div class="card" style="padding: 0; overflow: hidden;">
          <div class="payment-card-preview" style="background: ${gradient};">
            <div class="card-vendor-top">
              <span>${c.nickname || 'FITNANCE Card'}</span>
              <span>${typeUpper}</span>
            </div>
            <div class="card-number-display">${c.cardNumber}</div>
            <div class="card-footer-info">
              <div>
                <small style="opacity:0.8; font-size:0.65rem; display:block;">CARD HOLDER</small>
                <strong>${c.cardholderName}</strong>
              </div>
              <div>
                <small style="opacity:0.8; font-size:0.65rem; display:block;">EXPIRES</small>
                <strong>${c.expiryDate}</strong>
              </div>
            </div>
          </div>
          <div style="padding: 1rem; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size:0.85rem; color:var(--color-text-muted);">Saved Payment Card</span>
            <button class="btn-icon-only delete-card-btn" data-id="${c.id}" title="Delete Card">🗑️</button>
          </div>
        </div>
      `;
    }).join('');
  }

  bindEvents() {
    const addBtn = document.getElementById('btn-open-add-card');
    if (addBtn) {
      addBtn.onclick = () => this.openAddCardModal();
    }

    document.getElementById('cards-grid-container')?.addEventListener('click', (e) => {
      const deleteBtn = e.target.closest('.delete-card-btn');
      if (deleteBtn) {
        const id = deleteBtn.dataset.id;
        this.openDeleteCardModal(id);
      }
    });

    const cardForm = document.getElementById('addCardModalForm');
    if (cardForm) {
      cardForm.onsubmit = (e) => {
        e.preventDefault();
        this.handleAddCardSubmit();
      };
    }

    const confirmDeleteBtn = document.getElementById('btn-confirm-delete-card');
    if (confirmDeleteBtn) {
      confirmDeleteBtn.onclick = () => {
        if (this.cardIdToDelete) {
          this.store.deleteCard(this.cardIdToDelete);
          document.getElementById('deleteCardModalOverlay').classList.remove('active');
          this.renderCardsGrid();
          this.onDataChange();
        }
      };
    }
  }

  openAddCardModal() {
    document.getElementById('addCardModalForm').reset();
    document.getElementById('addCardModalOverlay').classList.add('active');
  }

  handleAddCardSubmit() {
    const number = document.getElementById('cardFormNumber').value;
    const name = document.getElementById('cardFormName').value;
    const expiry = document.getElementById('cardFormExpiry').value;
    const type = document.getElementById('cardFormType').value;
    const nickname = document.getElementById('cardFormNickname').value;

    this.store.addCard({
      cardNumber: number,
      cardholderName: name,
      expiryDate: expiry,
      cardType: type,
      nickname: nickname
    });

    document.getElementById('addCardModalOverlay').classList.remove('active');
    this.renderCardsGrid();
    this.onDataChange();
  }

  openDeleteCardModal(id) {
    this.cardIdToDelete = id;
    document.getElementById('deleteCardModalOverlay').classList.add('active');
  }
}
