/**
 * FITNANCE Local Store & Data Management
 * Handles localStorage persistence and sample seed data.
 */

const STORAGE_KEYS = {
  TRANSACTIONS: 'fitnance_transactions',
  CARDS: 'fitnance_cards',
  GOALS: 'fitnance_goals',
  BUDGETS: 'fitnance_budgets',
  SPENDING_LIMIT: 'fitnance_spending_limit',
  THEME: 'fitnance_theme'
};

// Default Expense Categories
export const EXPENSE_CATEGORIES = [
  'Food & Grocery',
  'Transportation',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Bills & Utilities',
  'Travel',
  'Education',
  'Subscriptions',
  'Other'
];

// Default Income Categories
export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Investments',
  'Rental Income',
  'Gifts',
  'Refunds',
  'Other'
];

// Default Budget Categories
export const BUDGET_CATEGORIES = [
  'Investment',
  'Travelling',
  'Food & Grocery',
  'Entertainment',
  'Healthcare'
];

export class Store {
  constructor() {
    this.initSeedData();
  }

  // Initialize Seed Data if missing
  initSeedData() {
    if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
      const initialTransactions = this.generateSampleTransactions();
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(initialTransactions));
    }

    if (!localStorage.getItem(STORAGE_KEYS.CARDS)) {
      const initialCards = [
        {
          id: 'card_1',
          cardNumber: '•••• •••• •••• 4829',
          cardholderName: 'Alex Morgan',
          expiryDate: '08/28',
          cardType: 'visa',
          nickname: 'Primary Platinum',
          createdAt: new Date().toISOString()
        },
        {
          id: 'card_2',
          cardNumber: '•••• •••• •••• 7102',
          cardholderName: 'Alex Morgan',
          expiryDate: '11/26',
          cardType: 'mastercard',
          nickname: 'Travel Rewards',
          createdAt: new Date().toISOString()
        },
        {
          id: 'card_3',
          cardNumber: '•••• •••• •••• 3910',
          cardholderName: 'Alex Morgan',
          expiryDate: '04/27',
          cardType: 'amex',
          nickname: 'Business Elite',
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(initialCards));
    }

    if (!localStorage.getItem(STORAGE_KEYS.GOALS)) {
      const initialGoals = [
        {
          id: 'goal_1',
          name: 'Emergency Savings Fund',
          targetAmount: 15000,
          currentAmount: 11250,
          targetDate: '2026-12-31',
          createdAt: new Date().toISOString()
        },
        {
          id: 'goal_2',
          name: 'European Summer Vacation',
          targetAmount: 5000,
          currentAmount: 3400,
          targetDate: '2026-09-15',
          createdAt: new Date().toISOString()
        },
        {
          id: 'goal_3',
          name: 'New Electric Vehicle Deposit',
          targetAmount: 8000,
          currentAmount: 2600,
          targetDate: '2027-03-01',
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(initialGoals));
    }

    if (!localStorage.getItem(STORAGE_KEYS.BUDGETS)) {
      const initialBudgets = [
        { id: 'b_1', category: 'Investment', allocatedAmount: 1500, spentAmount: 1200, month: '2026-08' },
        { id: 'b_2', category: 'Travelling', allocatedAmount: 800, spentAmount: 650, month: '2026-08' },
        { id: 'b_3', category: 'Food & Grocery', allocatedAmount: 1200, spentAmount: 940, month: '2026-08' },
        { id: 'b_4', category: 'Entertainment', allocatedAmount: 500, spentAmount: 320, month: '2026-08' },
        { id: 'b_5', category: 'Healthcare', allocatedAmount: 400, spentAmount: 150, month: '2026-08' }
      ];
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(initialBudgets));
    }

    if (!localStorage.getItem(STORAGE_KEYS.SPENDING_LIMIT)) {
      localStorage.setItem(STORAGE_KEYS.SPENDING_LIMIT, '4500');
    }
  }

  // Helper to generate seed transactions
  generateSampleTransactions() {
    const sampleVendors = [
      { name: 'Whole Foods Market', category: 'Food & Grocery', type: 'expense', amount: 142.50 },
      { name: 'Tech Solutions Inc', category: 'Salary', type: 'income', amount: 4850.00, subType: 'Fixed' },
      { name: 'Netflix Subscription', category: 'Subscriptions', type: 'expense', amount: 19.99 },
      { name: 'Uber Ride', category: 'Transportation', type: 'expense', amount: 28.40 },
      { name: 'Upwork Freelance Client', category: 'Freelance', type: 'income', amount: 950.00, subType: 'Variable' },
      { name: 'Delta Airlines', category: 'Travel', type: 'expense', amount: 480.00 },
      { name: 'Equinox Gym', category: 'Healthcare', type: 'expense', amount: 180.00 },
      { name: 'Vanguard Dividend', category: 'Investments', type: 'income', amount: 320.00, subType: 'Variable' },
      { name: 'Starbucks Coffee', category: 'Food & Grocery', type: 'expense', amount: 12.75 },
      { name: 'Apple Store', category: 'Shopping', type: 'expense', amount: 249.00 },
      { name: 'City Power & Electric', category: 'Bills & Utilities', type: 'expense', amount: 115.30 },
      { name: 'Amazon Online', category: 'Shopping', type: 'expense', amount: 89.90 }
    ];

    const transactions = [];
    const now = new Date();

    for (let i = 0; i < 45; i++) {
      const template = sampleVendors[i % sampleVendors.length];
      const date = new Date(now);
      date.setDate(date.getDate() - (i * 2)); // Spread over past 90 days

      // Vary amounts slightly
      const randomMultiplier = 0.9 + Math.random() * 0.2;
      const finalAmount = parseFloat((template.amount * randomMultiplier).toFixed(2));

      transactions.push({
        id: `TXN-${1000 + i}`,
        recipientName: template.name,
        type: template.type,
        subType: template.subType || (template.type === 'income' ? 'Fixed' : null),
        category: template.category,
        amount: finalAmount,
        status: i % 15 === 0 ? 'Pending' : (i % 25 === 0 ? 'Failed' : 'Completed'),
        date: date.toISOString(),
        notes: `Sample transaction record for ${template.name}`
      });
    }

    return transactions;
  }

  // --- Transaction Methods ---
  getTransactions() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
  }

  addTransaction(txnData) {
    const transactions = this.getTransactions();
    const newTxn = {
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      ...txnData,
      status: txnData.status || 'Completed',
      createdAt: new Date().toISOString()
    };
    transactions.unshift(newTxn);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    return newTxn;
  }

  updateTransaction(id, updatedFields) {
    let transactions = this.getTransactions();
    transactions = transactions.map(t => t.id === id ? { ...t, ...updatedFields } : t);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }

  deleteTransaction(id) {
    let transactions = this.getTransactions();
    transactions = transactions.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }

  // --- Cards Methods ---
  getCards() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CARDS) || '[]');
  }

  addCard(cardData) {
    const cards = this.getCards();
    const last4 = cardData.cardNumber.replace(/\D/g, '').slice(-4) || '1234';
    const newCard = {
      id: `card_${Date.now()}`,
      cardNumber: `•••• •••• •••• ${last4}`,
      cardholderName: cardData.cardholderName,
      expiryDate: cardData.expiryDate,
      cardType: cardData.cardType || 'visa',
      nickname: cardData.nickname || 'Personal Card',
      createdAt: new Date().toISOString()
    };
    cards.push(newCard);
    localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
    return newCard;
  }

  deleteCard(id) {
    let cards = this.getCards();
    cards = cards.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
  }

  // --- Goals Methods ---
  getGoals() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.GOALS) || '[]');
  }

  addGoal(goalData) {
    const goals = this.getGoals();
    const newGoal = {
      id: `goal_${Date.now()}`,
      name: goalData.name,
      targetAmount: parseFloat(goalData.targetAmount),
      currentAmount: parseFloat(goalData.currentAmount || 0),
      targetDate: goalData.targetDate,
      createdAt: new Date().toISOString()
    };
    goals.push(newGoal);
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    return newGoal;
  }

  updateGoalAmount(id, addAmount) {
    let goals = this.getGoals();
    goals = goals.map(g => {
      if (g.id === id) {
        return { ...g, currentAmount: g.currentAmount + parseFloat(addAmount) };
      }
      return g;
    });
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  }

  deleteGoal(id) {
    let goals = this.getGoals();
    goals = goals.filter(g => g.id !== id);
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  }

  // --- Budgets Methods ---
  getBudgets() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.BUDGETS) || '[]');
  }

  // --- Spending Limit ---
  getSpendingLimit() {
    return parseFloat(localStorage.getItem(STORAGE_KEYS.SPENDING_LIMIT) || '4500');
  }

  setSpendingLimit(limit) {
    localStorage.setItem(STORAGE_KEYS.SPENDING_LIMIT, limit.toString());
  }

  // Theme
  getTheme() {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
  }

  setTheme(theme) {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }
}
