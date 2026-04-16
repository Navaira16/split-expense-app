const nameInput = document.getElementById("name");
const amountInput = document.getElementById("amount");
const addBtn = document.getElementById("addBtn");
const expenseList = document.getElementById("expenseList");
const result = document.getElementById("result");
const progress = document.getElementById("progress");
const toggleTheme = document.getElementById("toggleTheme");

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

// Save to localStorage
function save() {
  localStorage.setItem("expenses", JSON.stringify(expenses));
}

// Add with Enter key
[nameInput, amountInput].forEach(input => {
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") addExpense();
  });
});

// Button click
addBtn.onclick = addExpense;

// Add Expense
function addExpense() {
  const name = nameInput.value.trim();
  const amount = parseFloat(amountInput.value);

  if (!name || isNaN(amount) || amount <= 0) return;

  expenses.push({
    id: Date.now(),
    name,
    amount: amount
  });

  nameInput.value = "";
  amountInput.value = "";

  save();
  render();
}

// Render List
function render() {
  expenseList.innerHTML = "";

  expenses.forEach(e => {
    const li = document.createElement("li");

    li.innerHTML = `
      <span ondblclick="editExpense(${e.id}, this)">
        ${e.name} - Rs ${e.amount}
      </span>
      <button onclick="deleteExpense(${e.id})">❌</button>
    `;

    expenseList.appendChild(li);
  });

  calculate();
}

// Delete
function deleteExpense(id) {
  expenses = expenses.filter(e => e.id !== id);
  save();
  render();
}

// Edit inline
function editExpense(id, el) {
  const exp = expenses.find(e => e.id === id);

  const input = document.createElement("input");
  input.value = exp.amount;

  input.onblur = () => saveEdit(id, input);
  input.onkeydown = e => {
    if (e.key === "Enter") saveEdit(id, input);
  };

  el.replaceWith(input);
  input.focus();
}

// Save edited value
function saveEdit(id, input) {
  const value = parseFloat(input.value);
  if (isNaN(value) || value <= 0) return render();

  expenses = expenses.map(e =>
    e.id === id ? { ...e, amount: value } : e
  );

  save();
  render();
}

// CALCULATE SPLIT
function calculate() {
  if (!expenses.length) {
    result.innerHTML = "";
    progress.innerHTML = "";
    return;
  }

  let total = expenses.reduce((s, e) => s + e.amount, 0);
  let people = [...new Set(expenses.map(e => e.name))];

  let perPerson = total / people.length;

  let balances = people.map(p => {
    let paid = expenses
      .filter(e => e.name === p)
      .reduce((s, e) => s + e.amount, 0);

    let balance = paid - perPerson;

    return { name: p, paid, balance };
  });

  // Progress bars
  progress.innerHTML = balances.map(b => `
    <div>${b.name}</div>
    <div class="bar" style="width:${(b.paid / total) * 100}%"></div>
  `).join("");

  // Result
  result.innerHTML = `
    <h3>Total: Rs. ${total}</h3>
    <h4>Each Person Should Pay: Rs. ${perPerson.toFixed(2)}</h4>
    <br>

    ${balances.map(b =>
      `<div class="${b.balance >= 0 ? 'positive' : 'negative'}">
        ${b.name} → 
        ${b.balance >= 0 
          ? `Gets back Rs. ${Math.abs(b.balance).toFixed(2)}`
          : `Owes Rs. ${Math.abs(b.balance).toFixed(2)}`
        }
      </div>`
    ).join("")}
  `;
}

// Dark Mode (ONLY ONE HANDLER)
toggleTheme.onclick = () => {
  document.body.classList.toggle("dark");
};

// Init
render();