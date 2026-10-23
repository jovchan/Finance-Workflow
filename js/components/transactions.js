/**
 * Transactions View Controller
 * Data table, search, multi-filter, sort, pagination, Add/Edit/Delete modals
 */

import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../store.js';

export class TransactionsView {
  constructor(store, onDataChange) {
    this.store = store;
    this.onDataChange = onDataChange;
    this.currentPage = 1;
    this.pageSize = 10;
    this.currentTxnIdToEdit = null;
    this.currentTxnIdToDelete = null;

    this.filters = {
      search: '',
      type: 'ALL',
      category: 'ALL',
      status: 'ALL',
      dateStart: '',
      dateEnd: '',
      sortBy: 'date',
      sortOrder: 'desc'
    };
  }

  render() {
    this.populateCategoryFilterDropdown();
    this.renderTable();
    this.bindEvents();
  }

  populateCategoryFilterDropdown() {
    const categorySelect = document.getElementById('txnFilterCategory');
    if (!categorySelect) return;

    const allCategories = [...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])];
    categorySelect.innerHTML = `
      <option value="ALL">All Categories</option>
      ${allCategories.map(c => `<option value="${c}">${c}</option>`).join('')}
    `;

    const formCatSelect = document.getElementById('txnFormCategory');
    if (formCatSelect) {
      formCatSelect.innerHTML = allCategories.map(c => `<option value="${c}">${c}</option>`).join('');
    }
  }

  getFilteredTransactions() {
    let list = this.store.getTransactions();

    // Search filter
    if (this.filters.search) {
      const q = this.filters.search.toLowerCase();
      list = list.filter(t => 
        t.recipientName.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        (t.notes && t.notes.toLowerCase().includes(q))
      );
    }

    // Type filter
    if (this.filters.type !== 'ALL') {
      list = list.filter(t => t.type.toLowerCase() === this.filters.type.toLowerCase());
    }

    // Category filter
    if (this.filters.category !== 'ALL') {
      list = list.filter(t => t.category === this.filters.category);
    }

    // Status filter
    if (this.filters.status !== 'ALL') {
      list = list.filter(t => t.status === this.filters.status);
    }

    // Date range
    if (this.filters.dateStart) {
      list = list.filter(t => new Date(t.date) >= new Date(this.filters.dateStart));
    }
    if (this.filters.dateEnd) {
      const endDate = new Date(this.filters.dateEnd);
      endDate.setHours(23, 59, 59, 999);
      list = list.filter(t => new Date(t.date) <= endDate);
    }

    // Sort
    list.sort((a, b) => {
      let valA = a[this.filters.sortBy];
      let valB = b[this.filters.sortBy];

      if (this.filters.sortBy === 'date') {
        valA = new Date(a.date).getTime();
        valB = new Date(b.date).getTime();
      } else if (this.filters.sortBy === 'amount') {
        valA = a.amount;
        valB = b.amount;
      } else if (this.filters.sortBy === 'recipientName') {
        valA = a.recipientName.toLowerCase();
        valB = b.recipientName.toLowerCase();
      }

      if (valA < valB) return this.filters.sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return this.filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }

  renderTable() {
    const tbody = document.getElementById('full-transactions-tbody');
    if (!tbody) return;

    const filtered = this.getFilteredTransactions();
    const totalPages = Math.ceil(filtered.length / this.pageSize) || 1;
    if (this.currentPage > totalPages) this.currentPage = totalPages;

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const paginated = filtered.slice(startIndex, startIndex + this.pageSize);

    if (paginated.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center; padding: 2rem; color: var(--color-text-muted);">
            No transactions found matching the selected filters.
          </td>
        </tr>
      `;
    } else {
      tbody.innerHTML = paginated.map(t => {
        const isIncome = t.type === 'income';
        const formattedAmount = `${isIncome ? '+' : '-'}$${t.amount.toFixed(2)}`;
        const amountClass = isIncome ? 'amount-pos' : 'amount-neg';
        const initials = t.recipientName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
        const statusBadge = `<span class="badge badge-${t.status.toLowerCase()}">${t.status}</span>`;
        const dateStr = new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        return `
          <tr>
            <td>
              <div class="table-user">
                <div class="table-user-avatar">${initials}</div>
                <div>
                  <div>${t.recipientName}</div>
                  ${t.notes ? `<small style="color:var(--color-text-muted);">${t.notes}</small>` : ''}
                </div>
              </div>
            </td>
            <td><code style="font-size:0.8rem; color:var(--color-text-muted);">${t.id}</code></td>
            <td><span style="font-weight:600;">${t.category}</span></td>
            <td>${statusBadge}</td>
            <td>${dateStr}</td>
            <td class="${amountClass}">${formattedAmount}</td>
            <td>
              <button class="btn-icon-only edit-txn-btn" data-id="${t.id}" title="Edit Transaction">✏️</button>
              <button class="btn-icon-only delete-txn-btn" data-id="${t.id}" title="Delete Transaction">🗑️</button>
            </td>
          </tr>
        `;
      }).join('');
    }

    // Update Pagination UI
    document.getElementById('txn-pagination-info').textContent = `Showing ${filtered.length > 0 ? startIndex + 1 : 0} to ${Math.min(startIndex + this.pageSize, filtered.length)} of ${filtered.length} transactions`;
    document.getElementById('btn-prev-page').disabled = this.currentPage === 1;
    document.getElementById('btn-next-page').disabled = this.currentPage >= totalPages;
  }

  bindEvents() {
    // Search input
    const searchInput = document.getElementById('txnSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filters.search = e.target.value;
        this.currentPage = 1;
        this.renderTable();
      });
    }

    // Type filter
    const typeSelect = document.getElementById('txnFilterType');
    if (typeSelect) {
      typeSelect.addEventListener('change', (e) => {
        this.filters.type = e.target.value;
        this.currentPage = 1;
        this.renderTable();
      });
    }

    // Category filter
    const categorySelect = document.getElementById('txnFilterCategory');
    if (categorySelect) {
      categorySelect.addEventListener('change', (e) => {
        this.filters.category = e.target.value;
        this.currentPage = 1;
        this.renderTable();
      });
    }

    // Status filter
    const statusSelect = document.getElementById('txnFilterStatus');
    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        this.filters.status = e.target.value;
        this.currentPage = 1;
        this.renderTable();
      });
    }

    // Date picker filters
    const dateStart = document.getElementById('txnFilterDateStart');
    const dateEnd = document.getElementById('txnFilterDateEnd');
    if (dateStart && dateEnd) {
      dateStart.addEventListener('change', (e) => {
        this.filters.dateStart = e.target.value;
        this.currentPage = 1;
        this.renderTable();
      });
      dateEnd.addEventListener('change', (e) => {
        this.filters.dateEnd = e.target.value;
        this.currentPage = 1;
        this.renderTable();
      });
    }

    // Sort selector
    const sortSelect = document.getElementById('txnSortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        const [field, order] = e.target.value.split('-');
        this.filters.sortBy = field;
        this.filters.sortOrder = order;
        this.renderTable();
      });
    }

    // Pagination controls
    document.getElementById('btn-prev-page')?.addEventListener('click', () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.renderTable();
      }
    });
    document.getElementById('btn-next-page')?.addEventListener('click', () => {
      this.currentPage++;
      this.renderTable();
    });

    // Add Transaction Modal Triggers
    const addBtn = document.getElementById('btn-open-add-txn');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.openAddModal());
    }

    // Delegation for edit/delete buttons
    document.getElementById('full-transactions-tbody')?.addEventListener('click', (e) => {
      const editBtn = e.target.closest('.edit-txn-btn');
      const deleteBtn = e.target.closest('.delete-txn-btn');

      if (editBtn) {
        const id = editBtn.dataset.id;
        this.openEditModal(id);
      } else if (deleteBtn) {
        const id = deleteBtn.dataset.id;
        this.openDeleteModal(id);
      }
    });

    // Modal Form Submissions
    const form = document.getElementById('transactionModalForm');
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        this.handleFormSubmit();
      };
    }

    // Confirm Delete Action
    const confirmDeleteBtn = document.getElementById('btn-confirm-delete-txn');
    if (confirmDeleteBtn) {
      confirmDeleteBtn.onclick = () => {
        if (this.currentTxnIdToDelete) {
          this.store.deleteTransaction(this.currentTxnIdToDelete);
          this.closeDeleteModal();
          this.renderTable();
          this.onDataChange();
        }
      };
    }
  }

  openAddModal() {
    this.currentTxnIdToEdit = null;
    document.getElementById('txnModalTitle').textContent = 'Add New Transaction';
    document.getElementById('transactionModalForm').reset();
    document.getElementById('txnFormDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('txnModalOverlay').classList.add('active');
  }

  openEditModal(id) {
    const txn = this.store.getTransactions().find(t => t.id === id);
    if (!txn) return;

    this.currentTxnIdToEdit = id;
    document.getElementById('txnModalTitle').textContent = 'Edit Transaction';
    document.getElementById('txnFormType').value = txn.type;
    document.getElementById('txnFormAmount').value = txn.amount;
    document.getElementById('txnFormCategory').value = txn.category;
    document.getElementById('txnFormRecipient').value = txn.recipientName;
    document.getElementById('txnFormDate').value = new Date(txn.date).toISOString().split('T')[0];
    document.getElementById('txnFormStatus').value = txn.status;
    document.getElementById('txnFormNotes').value = txn.notes || '';
    document.getElementById('txnModalOverlay').classList.add('active');
  }

  handleFormSubmit() {
    const type = document.getElementById('txnFormType').value;
    const amount = parseFloat(document.getElementById('txnFormAmount').value);
    const category = document.getElementById('txnFormCategory').value;
    const recipientName = document.getElementById('txnFormRecipient').value;
    const date = document.getElementById('txnFormDate').value;
    const status = document.getElementById('txnFormStatus').value;
    const notes = document.getElementById('txnFormNotes').value;

    const data = {
      type,
      amount,
      category,
      recipientName,
      date: new Date(date).toISOString(),
      status,
      notes
    };

    if (this.currentTxnIdToEdit) {
      this.store.updateTransaction(this.currentTxnIdToEdit, data);
    } else {
      this.store.addTransaction(data);
    }

    document.getElementById('txnModalOverlay').classList.remove('active');
    this.renderTable();
    this.onDataChange();
  }

  openDeleteModal(id) {
    this.currentTxnIdToDelete = id;
    document.getElementById('deleteTxnModalOverlay').classList.add('active');
  }

  closeDeleteModal() {
    this.currentTxnIdToDelete = null;
    document.getElementById('deleteTxnModalOverlay').classList.remove('active');
  }
}
