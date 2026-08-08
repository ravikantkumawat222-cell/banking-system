// LocalStorage Keys & State Management
const STORAGE_KEY = 'kbs_bank_accounts';

// Initial Default Sample Account (as per PDF sample data)
const defaultAccount = {
  accountNumber: "1001001003",
  holderName: "ravikant",
  fatherName: "indraj",
  mobile: "6367434926",
  address: "ganganagar",
  createdDate: "1/8/2026 05:19 pm",
  balance: 2000,
  transactions: [
    {
      ref: "#1",
      dateTime: "1/8/2026 05:19 pm",
      type: "DEPOSIT",
      amount: 2000,
      balanceAfter: 2000
    }
  ]
};

// Fetch all accounts from storage
function getAccounts() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    const initialList = [defaultAccount];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialList));
    return initialList;
  }
  return JSON.parse(data);
}

// Save accounts to storage
function saveAccounts(accounts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

// Switch Tab Operations
function switchTab(tabId) {
  const tabs = document.querySelectorAll('.op-tab');
  const forms = document.querySelectorAll('.op-form');

  tabs.forEach(t => t.classList.remove('active'));
  forms.forEach(f => f.classList.remove('active'));

  const activeForm = document.getElementById(`form-${tabId}`);
  if (activeForm) activeForm.classList.add('active');

  // Activate Tab Button
  const activeBtn = Array.from(tabs).find(b => b.getAttribute('onclick').includes(tabId));
  if (activeBtn) activeBtn.classList.add('active');

  if (tabId === 'directory') renderDirectory();
}

function openOperation(tabId) {
  document.getElementById('dashboard').scrollIntoView({ behavior: 'smooth' });
  switchTab(tabId);
}

// Create New Account
function createNewAccount(e) {
  e.preventDefault();
  const name = document.getElementById('new-name').value.trim();
  const father = document.getElementById('new-father').value.trim();
  const mobile = document.getElementById('new-mobile').value.trim();
  const address = document.getElementById('new-address').value.trim();
  const deposit = parseInt(document.getElementById('new-deposit').value);

  const accounts = getAccounts();
  const newAccNo = (1001001000 + accounts.length + 1).toString();
  const now = new Date();
  const timeStr = `${now.toLocaleDateString('en-IN')} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  const newAcc = {
    accountNumber: newAccNo,
    holderName: name,
    fatherName: father,
    mobile: mobile,
    address: address,
    createdDate: timeStr,
    balance: deposit,
    transactions: [
      {
        ref: `#1`,
        dateTime: timeStr,
        type: "DEPOSIT",
        amount: deposit,
        balanceAfter: deposit
      }
    ]
  };

  accounts.push(newAcc);
  saveAccounts(accounts);

  alert(`🎉 Account Successfully Created!\nAccount Number: ${newAccNo}\nHolder Name: ${name}`);
  e.target.reset();

  // Automatically search and view new account
  document.getElementById('search-acc-input').value = newAccNo;
  loadAccountDetails();
}

// Balance Check
function checkBalance(e) {
  e.preventDefault();
  const accNum = document.getElementById('check-acc-num').value.trim();
  const accounts = getAccounts();
  const acc = accounts.find(a => a.accountNumber === accNum);

  if (!acc) {
    alert("❌ Account Number nahi mila!");
    return;
  }

  alert(`🏦 KBS BALANCE INQUIRY\nAccount Number: ${acc.accountNumber}\nHolder Name: ${acc.holderName}\nAvailable Balance: ₹${acc.balance.toLocaleString('en-IN')}`);
}

// Process Deposit
function processDeposit(e) {
  e.preventDefault();
  const accNum = document.getElementById('dep-acc-num').value.trim();
  const amount = parseInt(document.getElementById('dep-amount').value);

  const accounts = getAccounts();
  const acc = accounts.find(a => a.accountNumber === accNum);

  if (!acc) return alert("❌ Account Number invalid hai!");

  acc.balance += amount;
  const now = new Date();
  const timeStr = `${now.toLocaleDateString('en-IN')} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  acc.transactions.unshift({
    ref: `#${acc.transactions.length + 1}`,
    dateTime: timeStr,
    type: "DEPOSIT",
    amount: amount,
    balanceAfter: acc.balance
  });

  saveAccounts(accounts);
  alert(`✅ ₹${amount.toLocaleString('en-IN')} Deposited Successfully! Updated Balance: ₹${acc.balance.toLocaleString('en-IN')}`);
  e.target.reset();

  document.getElementById('search-acc-input').value = accNum;
  loadAccountDetails();
}

// Process Withdrawal
function processWithdraw(e) {
  e.preventDefault();
  const accNum = document.getElementById('wit-acc-num').value.trim();
  const amount = parseInt(document.getElementById('wit-amount').value);

  const accounts = getAccounts();
  const acc = accounts.find(a => a.accountNumber === accNum);

  if (!acc) return alert("❌ Account Number invalid hai!");
  if (amount > acc.balance) return alert("❌ Insufficient Funds! Account me itne paise nahi hain.");

  acc.balance -= amount;
  const now = new Date();
  const timeStr = `${now.toLocaleDateString('en-IN')} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  acc.transactions.unshift({
    ref: `#${acc.transactions.length + 1}`,
    dateTime: timeStr,
    type: "WITHDRAW",
    amount: amount,
    balanceAfter: acc.balance
  });

  saveAccounts(accounts);
  alert(`✅ ₹${amount.toLocaleString('en-IN')} Withdrawn Successfully! Remaining Balance: ₹${acc.balance.toLocaleString('en-IN')}`);
  e.target.reset();

  document.getElementById('search-acc-input').value = accNum;
  loadAccountDetails();
}

// Render Accounts Directory
function renderDirectory() {
  const tbody = document.getElementById('directory-table-body');
  const accounts = getAccounts();
  tbody.innerHTML = '';

  accounts.forEach(acc => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><b>${acc.accountNumber}</b></td>
      <td>${acc.holderName}</td>
      <td>${acc.mobile}</td>
      <td>${acc.address}</td>
      <td><b style="color:#10b981;">₹${acc.balance.toLocaleString('en-IN')}</b></td>
      <td><button class="btn btn-primary" style="padding:4px 10px; font-size:12px;" onclick="viewAccountFromDir('${acc.accountNumber}')">View Statement</button></td>
    `;
    tbody.appendChild(tr);
  });
}

function viewAccountFromDir(accNo) {
  document.getElementById('search-acc-input').value = accNo;
  loadAccountDetails();
  document.getElementById('profileCard').scrollIntoView({ behavior: 'smooth' });
}

// Load Details into Account Profile & Ledger
function loadAccountDetails() {
  const searchAccNum = document.getElementById('search-acc-input').value.trim();
  const accounts = getAccounts();
  const acc = accounts.find(a => a.accountNumber === searchAccNum);

  if (!acc) {
    alert("❌ Kripya valid Account Number enter karein!");
    return;
  }

  // Set Profile Fields
  document.getElementById('profile-holder').innerText = acc.holderName;
  document.getElementById('profile-acc').innerText = acc.accountNumber;
  document.getElementById('profile-father').innerText = acc.fatherName;
  document.getElementById('profile-mobile').innerText = acc.mobile;
  document.getElementById('profile-address').innerText = acc.address;
  document.getElementById('profile-date').innerText = acc.createdDate;
  document.getElementById('profile-balance').innerText = `₹${acc.balance.toLocaleString('en-IN')}`;

  // Render Transaction Ledger Table
  const tbody = document.getElementById('ledger-table-body');
  tbody.innerHTML = '';

  acc.transactions.forEach(tx => {
    const tr = document.createElement('tr');
    const isDeposit = tx.type === 'DEPOSIT';
    const typeClass = isDeposit ? 'type-deposit' : 'type-withdraw';
    const symbol = isDeposit ? '↓ DEPOSIT' : '↑ WITHDRAW';
    const prefix = isDeposit ? '+' : '-';

    tr.innerHTML = `
      <td>${tx.ref}</td>
      <td>${tx.dateTime}</td>
      <td class="${typeClass}">${symbol}</td>
      <td class="${typeClass}">${prefix}₹${tx.amount.toLocaleString('en-IN')}</td>
      <td><b>₹${tx.balanceAfter.toLocaleString('en-IN')}</b></td>
    `;
    tbody.appendChild(tr);
  });
}

// Initial Run
document.addEventListener('DOMContentLoaded', () => {
  getAccounts(); // Load or init storage
  loadAccountDetails(); // Load default account statement
});