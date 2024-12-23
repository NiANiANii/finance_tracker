"use client";

import { useState, useEffect } from "react";

// Helper function for formatting currency to Rupiah
const formatToRupiah = (number: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(number);
};

export default function Home() {
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [balances, setBalances] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);

  const [newTransaction, setNewTransaction] = useState({
    description: "",
    amount: 0,
    type: "income",
    userId: null,
    categoryId: null,
  });
  const [editingTransaction, setEditingTransaction] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, categoriesRes, balancesRes, transactionsRes] = await Promise.all([
        fetch("/api/users").then((res) => res.json()),
        fetch("/api/category").then((res) => res.json()),
        fetch("/api/balance").then((res) => res.json()),
        fetch("/api/transaction").then((res) => res.json()),
      ]);

      setUsers(usersRes);
      setCategories(categoriesRes);
      setBalances(balancesRes);
      setTransactions(transactionsRes);

      // Hitung total saldo berdasarkan balance dan transaction
      const balanceTotal = balancesRes.reduce((acc, balance) => acc + balance.amount, 0);
      const expenseTotal = transactionsRes
        .filter((t) => t.type === "expense")
        .reduce((acc, t) => acc + t.amount, 0);
      const incomeTotal = transactionsRes
        .filter((t) => t.type === "income")
        .reduce((acc, t) => acc + t.amount, 0);

      setTotalBalance(balanceTotal + incomeTotal - expenseTotal);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const addTransaction = async () => {
    try {
      // Make sure to include userId when creating the transaction
      const updatedTransaction = {
        ...newTransaction,
        user: newTransaction.userId ? { connect: { id: newTransaction.userId } } : undefined,
      };

      await fetch("/api/transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTransaction),
      });

      // Update balance after transaction
      const balanceChange =
        newTransaction.type === "income" ? newTransaction.amount : -newTransaction.amount;

      // Update balance in the database
      await fetch("/api/balance/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: balanceChange,
        }),
      });

      setNewTransaction({
        description: "",
        amount: 0,
        type: "income",
        userId: null,
        categoryId: null,
      });
      fetchData();
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  const updateTransaction = async () => {
    if (!editingTransaction) return;

    try {
      await fetch(`/api/transaction/${editingTransaction.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTransaction),
      });

      // Update balance after transaction
      const balanceChange =
        newTransaction.type === "income" ? newTransaction.amount : -newTransaction.amount;

      await fetch("/api/balance/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: balanceChange,
        }),
      });

      setEditingTransaction(null);
      setNewTransaction({
        description: "",
        amount: 0,
        type: "income",
        userId: null,
        categoryId: null,
      });
      fetchData();
    } catch (error) {
      console.error("Error updating transaction:", error);
    }
  };

  const deleteTransaction = async (id: number) => {
    const confirmed = confirm("Apakah Anda yakin ingin menghapus transaksi ini?");
    if (!confirmed) return;

    try {
      await fetch(`/api/transaction/${id}`, { method: "DELETE" });

      // Update balance after transaction deletion
      await fetch("/api/balance/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 0 }), // Adjust the value to reflect the change
      });

      fetchData();
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  const editTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setNewTransaction({
      description: transaction.description || "",
      amount: transaction.amount || 0,
      type: transaction.type || "income",
      userId: transaction.userId || null,
      categoryId: transaction.categoryId || null,
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-green-700 text-white px-6 py-4 flex justify-between items-center">
        <button
          onClick={() => (window.location.href = "/")}
          className="text-lg font-bold hover:underline"
        >
          FINANCE TRACKER
        </button>
        <button
          onClick={() => (window.location.href = "/users")}
          className="text-lg font-bold hover:underline"
        >
          Users
        </button>
      </nav>

      {/* Content Wrapper */}
      <div className="p-6">
        {/* Wrapper Grid Layout */}
        <div className="grid grid-cols-1 gap-6">
          {/* Total Balance */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-green-700">Total Balance</h2>
            <p className="text-3xl font-bold text-green-900 mt-2">{formatToRupiah(totalBalance)}</p>
          </div>

          {/* Add Transaction */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingTransaction ? "Edit Transaction" : "Add Transaction"}
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <input
                type="text"
                placeholder="Description"
                value={newTransaction.description || ""}
                onChange={(e) =>
                  setNewTransaction({ ...newTransaction, description: e.target.value })
                }
                className="p-3 border rounded"
              />
              <input
                type="number"
                placeholder="Amount"
                value={newTransaction.amount || 0}
                onChange={(e) =>
                  setNewTransaction({ ...newTransaction, amount: Number(e.target.value) })
                }
                className="p-3 border rounded"
              />
              <select
                value={newTransaction.type || "income"}
                onChange={(e) =>
                  setNewTransaction({ ...newTransaction, type: e.target.value })
                }
                className="p-3 border rounded"
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
              <select
                value={newTransaction.categoryId || ""}
                onChange={(e) =>
                  setNewTransaction({ ...newTransaction, categoryId: Number(e.target.value) })
                }
                className="p-3 border rounded"
              >
                <option value="" disabled>
                  Select Category
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <select
                value={newTransaction.userId || ""}
                onChange={(e) =>
                  setNewTransaction({ ...newTransaction, userId: Number(e.target.value) })
                }
                className="p-3 border rounded"
              >
                <option value="" disabled>
                  Select User
                </option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
              <button
                onClick={editingTransaction ? updateTransaction : addTransaction}
                className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
              >
                {editingTransaction ? "Update Transaction" : "Add Transaction"}
              </button>
            </div>
          </div>

          {/* Transactions List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Transactions List</h2>
            <ul>
              {transactions.map((transaction) => (
                <li
                  key={transaction.id}
                  className="flex justify-between items-center py-2 border-b"
                >
                  <div>
                    <p className="font-bold">{transaction.description}</p>
                    <p
                      className={`text-sm ${
                        transaction.type === "income" ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {transaction.type} - {formatToRupiah(transaction.amount)}
                    </p>
                  </div>
                  <div>
                    <button
                      onClick={() => editTransaction(transaction)}
                      className="text-blue-700 hover:underline mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTransaction(transaction.id)}
                      className="text-red-700 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}







