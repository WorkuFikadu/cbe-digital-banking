import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Home, CreditCard, PieChart, TrendingUp, Bell, Activity, Sparkles, Send, Zap, Calculator, Download, Globe, CheckCircle2, RefreshCw, ShieldCheck, Lock, Unlock, QrCode, Target, PiggyBank, Users, Leaf, Cpu, Building2, Link as LinkIcon, ArrowRightLeft, Wallet, Check } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import api from '../services/api';
import CBELogo from '../components/CBELogo';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

// Amharic / English Dictionary
const translations = {
  EN: {
    overview: 'Overview',
    accounts: 'Accounts',
    ethswitch: 'Ethswitch Interbank',
    cards: 'Digital Cards',
    vaults: 'Savings Vaults',
    transfers: 'Fund Transfer',
    billPay: 'Bill Payments',
    qrPay: 'QR & Split Bill',
    transactions: 'Transactions',
    fxRates: 'FX Exchange Rates',
    loanCalc: 'Loan Calculator',
    budgets: 'Budgets',
    investments: 'Investments',
    aiInsights: 'AI Assistant',
    welcomeBack: 'Welcome back',
    netWorth: 'Net Worth',
    totalBalance: 'Total Balance',
    monthlyIncome: 'Monthly Income',
    monthlyExpenses: 'Monthly Expenses',
    newTransaction: '+ New Transaction',
    addAccount: '+ Add Account',
    linkBank: '+ Link Local Bank',
    issueCard: '+ Issue Digital Card',
    newVault: '+ Create Savings Vault',
    setBudget: '+ Set Budget',
    addInvestment: '+ Add Investment',
    newTransfer: 'Send Money',
    payBill: 'Pay Bill',
    exportStatement: 'Export Statement (CSV)',
    signOut: 'Sign Out',
    cbeTitle: 'Commercial Bank of Ethiopia',
    accountNumber: 'Account No',
  },
  AM: {
    overview: 'አጠቃላይ እይታ',
    accounts: 'ሂሳቦች',
    ethswitch: 'ኢትስዊች ባንኮች ማስተላለፊያ',
    cards: 'ዲጂታል ካርዶች',
    vaults: 'የቁጠባ ካዝናዎች',
    transfers: 'ገንዘብ ማስተላለፊያ',
    billPay: 'ክፍያዎች (ቢል)',
    qrPay: 'QR እና ሂሳብ ከፋይ',
    transactions: 'የገንዘብ እንቅስቃሴ',
    fxRates: 'የምንዛሬ ተመን',
    loanCalc: 'የብድር ማስያ',
    budgets: 'በጀት',
    investments: 'ኢንቨስትመንት',
    aiInsights: 'ኤአይ ረዳት',
    welcomeBack: 'እንኳን ደህና መጡ',
    netWorth: 'ጠቅላላ ሀብት',
    totalBalance: 'ጠቅላላ ቀሪ ሂሳብ',
    monthlyIncome: 'ወርሃዊ ገቢ',
    monthlyExpenses: 'ወርሃዊ ወጪ',
    newTransaction: '+ አዲስ እንቅስቃሴ',
    addAccount: '+ አዲስ ሂሳብ ከፍት',
    linkBank: '+ ሌላ ኢትዮጵያ ባንክ አያይዝ',
    issueCard: '+ አዲስ ካርድ አውጣ',
    newVault: '+ ቁጠባ ካዝና ክፈት',
    setBudget: '+ በጀት መድብ',
    addInvestment: '+ ኢንቨስትመንት ጨምር',
    newTransfer: 'ገንዘብ አስተላልፍ',
    payBill: 'ክፍያ ፈጽም',
    exportStatement: 'የሂሳብ መግለጫ አውርድ (CSV)',
    signOut: 'ውጣ',
    cbeTitle: 'የኢትዮጵያ ንግድ ባንክ',
    accountNumber: 'የሂሳብ ቁጥር',
  }
};

const ethBanksList = [
  'Awash Bank',
  'Bank of Abyssinia',
  'Dashen Bank',
  'Hibret Bank',
  'Cooperative Bank of Oromia (COOP)',
  'Nib International Bank',
  'Wegagen Bank',
  'Zemen Bank',
  'Berhan Bank',
  'Telebirr SuperApp Wallet'
];

// CBE Exchange Rates (ETB)
const initialFxRates = [
  { currency: 'USD', name: 'US Dollar', buy: 124.50, sell: 136.95, flag: '🇺🇸' },
  { currency: 'EUR', name: 'Euro', buy: 134.20, sell: 147.80, flag: '🇪🇺' },
  { currency: 'GBP', name: 'British Pound', buy: 156.40, sell: 172.00, flag: '🇬🇧' },
  { currency: 'CAD', name: 'Canadian Dollar', buy: 90.10, sell: 99.50, flag: '🇨🇦' },
  { currency: 'AED', name: 'UAE Dirham', buy: 33.80, sell: 37.20, flag: '🇦🇪' },
];

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [lang, setLang] = useState('EN');
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState('Overview');
  
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [billPayments, setBillPayments] = useState([]);
  const [cards, setCards] = useState([]);
  const [vaults, setVaults] = useState([]);
  const [externalBanks, setExternalBanks] = useState([]);

  // Modals
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showVaultModal, setShowVaultModal] = useState(false);
  const [showLinkBankModal, setShowLinkBankModal] = useState(false);
  const [showEthswitchModal, setShowEthswitchModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState(null);

  // Forms
  const [newTransaction, setNewTransaction] = useState({ amount: '', type: 'Expense', category: 'Food', accountId: '', paymentMethod: 'CBE Card' });
  const [newAccount, setNewAccount] = useState({ name: 'CBE Savings', type: 'Savings', balance: '1000', currency: 'ETB' });
  const [newBudget, setNewBudget] = useState({ category: 'Food', amount: '5000' });
  const [newInvestment, setNewInvestment] = useState({ name: 'Ethio Telecom Bond', type: 'Mutual Fund', quantity: '10', purchasePrice: '1000' });
  const [newTransfer, setNewTransfer] = useState({ senderAccountId: '', receiverAccountNumber: '', receiverName: '', amount: '', notes: '' });
  const [newBill, setNewBill] = useState({ provider: 'Ethio Telecom', accountNo: '', amount: '', accountId: '' });
  const [newCard, setNewCard] = useState({ type: 'Virtual', spendingLimit: '50000' });
  const [newVault, setNewVault] = useState({ name: 'House Down Payment', targetAmount: '100000', initialAmount: '5000', category: 'Goal', roundUpEnabled: true });
  const [newBankLink, setNewBankLink] = useState({ bankName: 'Awash Bank', accountNumber: '', initialBalance: '10000' });
  const [ethswitchForm, setEthswitchForm] = useState({ fromBankId: '', toBankName: 'Awash Bank', toAccountNumber: '', toAccountHolder: '', amount: '' });
  const [loanForm, setLoanForm] = useState({ depositAccountId: '', purpose: 'Personal & Housing' });

  // Split Bill State
  const [splitTotal, setSplitTotal] = useState('1200');
  const [splitPeople, setSplitPeople] = useState('4');

  // FX Converter State
  const [fxAmount, setFxAmount] = useState('100');
  const [fxCurrency, setFxCurrency] = useState('USD');
  const [fxMode, setFxMode] = useState('Buy');

  // Loan Calculator State
  const [loanAmount, setLoanAmount] = useState(500000);
  const [loanYears, setLoanYears] = useState(5);
  const [loanRate, setLoanRate] = useState(14.5);

  // AI State
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [accRes, txRes, budgRes, invRes, trRes, billRes, cardRes, vaultRes, extRes] = await Promise.all([
        api.get('/accounts'),
        api.get('/transactions'),
        api.get('/budgets'),
        api.get('/investments'),
        api.get('/transfers').catch(() => ({ data: [] })),
        api.get('/bills').catch(() => ({ data: [] })),
        api.get('/cards').catch(() => ({ data: [] })),
        api.get('/vaults').catch(() => ({ data: [] })),
        api.get('/external-banks').catch(() => ({ data: [] }))
      ]);
      setAccounts(accRes.data);
      setTransactions(txRes.data);
      setBudgets(budgRes.data);
      setInvestments(invRes.data);
      setTransfers(trRes.data || []);
      setBillPayments(billRes.data || []);
      setCards(cardRes.data || []);
      setVaults(vaultRes.data || []);
      setExternalBanks(extRes.data || []);
      
      if (accRes.data.length > 0) {
        setNewTransaction(prev => ({ ...prev, accountId: accRes.data[0].id }));
        setNewTransfer(prev => ({ ...prev, senderAccountId: accRes.data[0].id }));
        setNewBill(prev => ({ ...prev, accountId: accRes.data[0].id }));
        setEthswitchForm(prev => ({ ...prev, fromBankId: accRes.data[0].id }));
        setLoanForm(prev => ({ ...prev, depositAccountId: accRes.data[0].id }));
      }
    } catch (err) {
      console.error('Error fetching data');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const submitTransaction = async (e) => {
    e.preventDefault();
    try {
      await api.post('/transactions', newTransaction);
      setShowTransactionModal(false);
      fetchData();
    } catch (err) { alert('Failed to add transaction'); }
  };

  const submitAccount = async (e) => {
    e.preventDefault();
    try {
      await api.post('/accounts', newAccount);
      setShowAccountModal(false);
      fetchData();
    } catch (err) { alert('Failed to add account'); }
  };

  const submitBudget = async (e) => {
    e.preventDefault();
    try {
      await api.post('/budgets', newBudget);
      setShowBudgetModal(false);
      fetchData();
    } catch (err) { alert('Failed to add budget'); }
  };

  const submitInvestment = async (e) => {
    e.preventDefault();
    try {
      await api.post('/investments', newInvestment);
      setShowInvestmentModal(false);
      fetchData();
    } catch (err) { alert('Failed to add investment'); }
  };

  const submitTransfer = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/transfers', newTransfer);
      setShowTransferModal(false);
      setActiveReceipt({
        title: 'CBE Fund Transfer Receipt',
        ref: res.data.transfer.reference,
        amount: res.data.transfer.amount,
        details: `Transferred to ${res.data.transfer.receiverName} (${res.data.transfer.receiverAccountNumber})`,
        date: new Date(res.data.transfer.date).toLocaleString(),
        status: res.data.transfer.status
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Transfer failed');
    }
  };

  const submitBill = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/bills', newBill);
      setShowBillModal(false);
      setActiveReceipt({
        title: `${newBill.provider} Bill Payment Receipt`,
        ref: res.data.receipt.receiptNo,
        amount: res.data.receipt.amount,
        details: `Paid ${newBill.provider} Bill #${res.data.receipt.accountNo}`,
        date: new Date(res.data.receipt.date).toLocaleString(),
        status: res.data.receipt.status
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Bill payment failed');
    }
  };

  const submitCard = async (e) => {
    e.preventDefault();
    try {
      await api.post('/cards', newCard);
      setShowCardModal(false);
      fetchData();
    } catch (err) { alert('Failed to issue card'); }
  };

  const toggleFreezeCard = async (id) => {
    try {
      await api.put(`/cards/${id}/freeze`);
      fetchData();
    } catch (err) { alert('Failed to freeze/unfreeze card'); }
  };

  const submitVault = async (e) => {
    e.preventDefault();
    try {
      await api.post('/vaults', newVault);
      setShowVaultModal(false);
      fetchData();
    } catch (err) { alert('Failed to create vault'); }
  };

  const submitBankLink = async (e) => {
    e.preventDefault();
    try {
      await api.post('/external-banks/link', newBankLink);
      setShowLinkBankModal(false);
      fetchData();
    } catch (err) { alert('Failed to link local bank'); }
  };

  const submitEthswitchTransfer = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/external-banks/ethswitch', ethswitchForm);
      setShowEthswitchModal(false);
      setActiveReceipt({
        title: `Ethswitch Interbank Receipt (${ethswitchForm.toBankName})`,
        ref: res.data.reference,
        amount: parseFloat(ethswitchForm.amount),
        details: `Ethswitch Transfer to ${ethswitchForm.toAccountHolder} (${ethswitchForm.toBankName} - #${ethswitchForm.toAccountNumber})`,
        date: new Date().toLocaleString(),
        status: 'Completed (5 ETB Ethswitch Fee Applied)'
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Ethswitch Interbank transfer failed');
    }
  };

  const submitLoanApplication = async (e) => {
    e.preventDefault();
    try {
      const targetAccountId = loanForm.depositAccountId || accounts[0]?.id;
      if (!targetAccountId) {
        alert('Please select an active CBE account to deposit loan funds.');
        return;
      }

      // Add Income transaction for approved loan disbursal
      await api.post('/transactions', {
        amount: loanAmount,
        type: 'Income',
        category: 'CBE Loan Disbursal',
        paymentMethod: 'CBE Direct Credit',
        notes: `Approved CBE Loan (${loanForm.purpose}). Principal: ${loanAmount.toLocaleString()} ETB`,
        accountId: targetAccountId
      });

      setShowLoanModal(false);
      setActiveReceipt({
        title: 'CBE Loan Disbursal Receipt',
        ref: 'CBE-LOAN-' + Math.floor(10000000 + Math.random() * 90000000),
        amount: loanAmount,
        details: `Loan Approved & Deposited into CBE Account! Monthly Installment: ${monthlyInstallment.toFixed(2)} ETB (${loanYears * 12} Months at ${loanRate}%)`,
        date: new Date().toLocaleString(),
        status: 'Approved & Credited'
      });
      fetchData();
    } catch (err) {
      alert('Failed to process CBE Loan application.');
    }
  };

  const exportStatementCSV = () => {
    if (transactions.length === 0) {
      alert('No transactions to export.');
      return;
    }
    const headers = ['Date', 'Type', 'Category', 'Amount (ETB)', 'Account', 'Method', 'Notes'];
    const rows = transactions.map(t => [
      new Date(t.date).toLocaleDateString(),
      t.type,
      t.category,
      t.amount.toFixed(2),
      t.account?.name || 'CBE Account',
      t.paymentMethod,
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CBE_Statement_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateAiInsights = () => {
    setIsAiLoading(true);
    setTimeout(() => {
      setAiInsights([
        { title: "CBE High Yield Savings Opportunity", desc: "You have 45,000 ETB in liquid checking. Move 30,000 ETB to CBE Special Interest Savings to earn 8.5% annual yield.", type: "success" },
        { title: "Ethio Telecom Utility Spending Alert", desc: "Your telecom & airtime spending increased by 25% this month compared to your monthly average.", type: "warning" },
        { title: "Foreign Exchange Remittance Tip", desc: "Current USD to ETB official rate is 136.95 ETB/USD. Consider holding foreign currency transfers for upcoming CBE incentive campaigns.", type: "alert" }
      ]);
      setIsAiLoading(false);
    }, 1200);
  };

  // Financial Calculations
  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);
  const totalExternalBalance = externalBanks.reduce((acc, curr) => acc + curr.balance, 0);
  const totalInvestments = investments.reduce((acc, curr) => acc + (curr.quantity * curr.currentPrice), 0);
  const totalVaultSavings = vaults.reduce((acc, curr) => acc + curr.currentAmount, 0);
  const netWorth = totalBalance + totalExternalBalance + totalInvestments + totalVaultSavings;
  
  const currentMonth = new Date().getMonth();
  const monthlyIncome = transactions
    .filter(t => t.type === 'Income' && new Date(t.date).getMonth() === currentMonth)
    .reduce((acc, curr) => acc + curr.amount, 0);
    
  const monthlyExpenses = transactions
    .filter(t => t.type === 'Expense' && new Date(t.date).getMonth() === currentMonth)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const expensesByCategory = transactions
    .filter(t => t.type === 'Expense' && new Date(t.date).getMonth() === currentMonth)
    .reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});

  const doughnutData = {
    labels: Object.keys(expensesByCategory),
    datasets: [{
      data: Object.values(expensesByCategory),
      backgroundColor: ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e'],
      borderWidth: 0,
    }]
  };

  // Loan Math
  const monthlyRate = (loanRate / 100) / 12;
  const numPayments = loanYears * 12;
  const monthlyInstallment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  const totalRepayment = monthlyInstallment * numPayments;
  const totalInterest = totalRepayment - loanAmount;

  // FX Conversion Math
  const selectedFxObj = initialFxRates.find(f => f.currency === fxCurrency) || initialFxRates[0];
  const rateUsed = fxMode === 'Buy' ? selectedFxObj.buy : selectedFxObj.sell;
  const convertedFxValue = (parseFloat(fxAmount) || 0) * rateUsed;

  // Split Bill Math
  const splitAmountPerPerson = (parseFloat(splitTotal) || 0) / (parseInt(splitPeople) || 1);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-tertiary)' }}>
      {/* Sidebar with Official CBE SVG Logo */}
      <aside style={{ width: '270px', backgroundColor: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)', padding: '24px 16px', display: 'flex', flexDirection: 'column', zIndex: 10 }}>
        <div style={{ marginBottom: '28px', padding: '0 8px' }}>
          <CBELogo size={42} showText={true} />
        </div>
        
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
          <NavItem icon={<Home size={18} />} label={t.overview} active={activeTab === 'Overview'} onClick={() => setActiveTab('Overview')} />
          <NavItem icon={<Building2 size={18} />} label={t.ethswitch} active={activeTab === 'Ethswitch Hub'} onClick={() => setActiveTab('Ethswitch Hub')} isNew={true} />
          <NavItem icon={<CreditCard size={18} />} label={t.cards} active={activeTab === 'Cards'} onClick={() => setActiveTab('Cards')} />
          <NavItem icon={<PiggyBank size={18} />} label={t.vaults} active={activeTab === 'Vaults'} onClick={() => setActiveTab('Vaults')} />
          <NavItem icon={<QrCode size={18} />} label={t.qrPay} active={activeTab === 'QR & Split Bill'} onClick={() => setActiveTab('QR & Split Bill')} />
          <NavItem icon={<Send size={18} />} label={t.transfers} active={activeTab === 'Transfers'} onClick={() => setActiveTab('Transfers')} />
          <NavItem icon={<Zap size={18} />} label={t.billPay} active={activeTab === 'Bill Pay'} onClick={() => setActiveTab('Bill Pay')} />
          <NavItem icon={<CreditCard size={18} />} label={t.accounts} active={activeTab === 'Accounts'} onClick={() => setActiveTab('Accounts')} />
          <NavItem icon={<TrendingUp size={18} />} label={t.transactions} active={activeTab === 'Transactions'} onClick={() => setActiveTab('Transactions')} />
          <NavItem icon={<RefreshCw size={18} />} label={t.fxRates} active={activeTab === 'FX Rates'} onClick={() => setActiveTab('FX Rates')} />
          <NavItem icon={<Calculator size={18} />} label={t.loanCalc} active={activeTab === 'Loan Calculator'} onClick={() => setActiveTab('Loan Calculator')} />
          <NavItem icon={<PieChart size={18} />} label={t.budgets} active={activeTab === 'Budgets'} onClick={() => setActiveTab('Budgets')} />
          <NavItem icon={<Activity size={18} />} label={t.investments} active={activeTab === 'Investments'} onClick={() => setActiveTab('Investments')} />
          <div style={{ margin: '12px 0', borderBottom: '1px solid var(--border-color)' }}></div>
          <NavItem icon={<Sparkles size={18} />} label={t.aiInsights} active={activeTab === 'AI Insights'} onClick={() => setActiveTab('AI Insights')} isAi={true} />
        </nav>
        
        <div style={{ paddingTop: '16px' }}>
          <div className="glass-panel" style={{ padding: '14px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600' }}>
                {user?.name?.charAt(0)}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: '600', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{user?.name}</p>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>CBE Customer</p>
              </div>
            </div>
            <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '8px', color: 'var(--text-secondary)', borderRadius: 'var(--border-radius-sm)', transition: 'background-color 0.2s', fontSize: '0.85rem' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
              <LogOut size={16} />
              <span style={{ fontWeight: '500' }}>{t.signOut}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '36px', overflowY: 'auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <CBELogo showText={false} size={28} />
              <h1 className="heading-1" style={{ margin: 0 }}>{t[activeTab.toLowerCase()] || activeTab}</h1>
            </div>
            <p className="text-muted">{t.welcomeBack}, {user?.name?.split(' ')[0] || 'User'}. Commercial Bank of Ethiopia Modern Digital Platform.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Language Switcher */}
            <button onClick={() => setLang(lang === 'EN' ? 'AM' : 'EN')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '20px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
              <Globe size={16} />
              <span>{lang === 'EN' ? 'አማርኛ' : 'English'}</span>
            </button>

            <button style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-secondary)', cursor: 'pointer' }}>
              <Bell size={18} color="var(--text-secondary)" />
            </button>
            <button className="btn-primary" onClick={() => setShowTransactionModal(true)}>{t.newTransaction}</button>
          </div>
        </header>

        {activeTab === 'Overview' && (
          <>
            {/* Ultra Modern Widgets Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
              <StatCard title={t.netWorth} amount={`${netWorth.toLocaleString(undefined, {minimumFractionDigits: 2})} ETB`} trend="+4.2%" positive={true} />
              <StatCard title={t.totalBalance} amount={`${totalBalance.toLocaleString(undefined, {minimumFractionDigits: 2})} ETB`} trend="+3.1%" positive={true} />
              <StatCard title={t.monthlyIncome} amount={`${monthlyIncome.toLocaleString(undefined, {minimumFractionDigits: 2})} ETB`} trend="+6.5%" positive={true} />
              <StatCard title={t.monthlyExpenses} amount={`${monthlyExpenses.toLocaleString(undefined, {minimumFractionDigits: 2})} ETB`} trend="-2.1%" positive={true} />
            </div>

            {/* Global Credit Health & Carbon Impact Banner */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
              <div className="card glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(37,99,235,0.08))' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--accent-success)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h4 style={{ fontWeight: '700', fontSize: '1.1rem' }}>CBE Credit Rating: <span style={{ color: 'var(--accent-success)' }}>785 (Excellent)</span></h4>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>You qualify for CBE instant pre-approved loans up to 1,500,000 ETB.</p>
                </div>
              </div>

              <div className="card glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(236,72,153,0.08))' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--accent-ai)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Leaf size={24} />
                </div>
                <div>
                  <h4 style={{ fontWeight: '700', fontSize: '1.1rem' }}>Eco Carbon Saved: <span style={{ color: 'var(--accent-ai)' }}>18.4 kg CO₂</span></h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>100% paperless digital payments saved 4 trees this year!</p>
                </div>
              </div>
            </div>

            {/* Quick Action Banner */}
            <div className="card glass-panel" style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(16,185,129,0.08))' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '4px' }}>CBE Direct Money Transfer & Bill Pay</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Instantly transfer funds to any CBE 13-digit account or settle Ethio Telecom / Utility bills.</p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn-primary" style={{ padding: '10px 18px', fontSize: '0.875rem' }} onClick={() => setShowTransferModal(true)}>
                  <Send size={16} style={{ marginRight: '6px' }} /> {t.newTransfer}
                </button>
                <button className="btn-primary" style={{ padding: '10px 18px', fontSize: '0.875rem', backgroundColor: '#10b981' }} onClick={() => setShowBillModal(true)}>
                  <Zap size={16} style={{ marginRight: '6px' }} /> {t.payBill}
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
              <div className="card" style={{ minHeight: '380px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 className="heading-2">Recent Transactions</h2>
                  <button onClick={exportStatementCSV} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--accent-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
                    <Download size={16} /> {t.exportStatement}
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {transactions.slice(0, 5).map(tx => (
                    <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--border-radius-sm)' }}>
                      <div>
                        <p style={{ fontWeight: '600', fontSize: '0.95rem' }}>{tx.category} • {tx.account?.name || 'CBE Account'}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(tx.date).toLocaleDateString()} • {tx.paymentMethod}</p>
                      </div>
                      <span style={{ fontWeight: '700', fontSize: '1rem', color: tx.type === 'Income' ? 'var(--accent-success)' : 'var(--text-primary)' }}>
                        {tx.type === 'Income' ? '+' : '-'}{tx.amount.toFixed(2)} ETB
                      </span>
                    </div>
                  ))}
                  {transactions.length === 0 && <p className="text-muted">No transactions found.</p>}
                </div>
              </div>

              <div className="card" style={{ minHeight: '380px', display: 'flex', flexDirection: 'column' }}>
                <h2 className="heading-2" style={{ marginBottom: '20px' }}>Expenses by Category</h2>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {Object.keys(expensesByCategory).length > 0 ? (
                    <Doughnut data={doughnutData} options={{ maintainAspectRatio: false, cutout: '75%', plugins: { legend: { position: 'bottom' } } }} />
                  ) : (
                    <p className="text-muted">No expenses recorded this month.</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Ethswitch Interbank Hub Tab */}
        {activeTab === 'Ethswitch Hub' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <div>
                <h2 className="heading-2">Ethswitch Ethiopian Interbank Gateway</h2>
                <p className="text-muted">Transfer money instantly across all Ethiopian commercial banks & mobile wallets connected to National Ethswitch.</p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn-primary" style={{ backgroundColor: '#8b5cf6' }} onClick={() => setShowLinkBankModal(true)}>+ Link Local Bank</button>
                <button className="btn-primary" onClick={() => setShowEthswitchModal(true)}>
                  <ArrowRightLeft size={16} style={{ marginRight: '6px' }} /> Ethswitch Transfer
                </button>
              </div>
            </div>

            {/* Linked Banks Grid */}
            <h3 className="heading-2" style={{ marginBottom: '16px' }}>Your Linked Ethiopian Banks & Wallets</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '36px' }}>
              {externalBanks.map(eb => (
                <div key={eb.id} className="card glass-panel" style={{ borderLeft: '4px solid var(--accent-primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Building2 size={24} color="var(--accent-primary)" />
                      <h4 style={{ fontWeight: '700', fontSize: '1.1rem' }}>{eb.bankName}</h4>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--accent-success)', backgroundColor: 'rgba(16,185,129,0.1)', padding: '4px 8px', borderRadius: '12px', fontWeight: '600' }}>{eb.status}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>Account: <span style={{ fontWeight: '600' }}>{eb.accountNumber}</span> ({eb.accountHolder})</p>
                  <p style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-primary)' }}>{eb.balance.toLocaleString(undefined, {minimumFractionDigits: 2})} ETB</p>
                </div>
              ))}
            </div>

            {/* Supported Ethiopian Banks Showcase */}
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px' }}>Supported Ethswitch Interbank Members</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                {ethBanksList.map(bank => (
                  <div key={bank} style={{ padding: '12px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--border-radius-sm)', textAlign: 'center', fontWeight: '600', fontSize: '0.85rem' }}>
                    {bank}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Digital Cards Hub Tab */}
        {activeTab === 'Cards' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <div>
                <h2 className="heading-2">CBE Digital & Virtual Cards</h2>
                <p className="text-muted">Manage virtual, physical, and single-use disposable shopping cards with instant freeze controls.</p>
              </div>
              <button className="btn-primary" onClick={() => setShowCardModal(true)}>{t.issueCard}</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              {cards.map(card => (
                <div key={card.id} className="card" style={{ position: 'relative', overflow: 'hidden', background: card.status === 'Frozen' ? '#334155' : card.type === 'Virtual' ? 'linear-gradient(135deg, #1e3a8a, #2563eb)' : card.type === 'Disposable' ? 'linear-gradient(135deg, #7c3aed, #db2777)' : 'linear-gradient(135deg, #0f172a, #334155)', color: 'white', border: 'none', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CBELogo showText={false} size={26} />
                      <span style={{ fontWeight: '700', letterSpacing: '0.05em', fontSize: '0.85rem' }}>{card.type.toUpperCase()} CARD</span>
                    </div>
                    <button onClick={() => toggleFreezeCard(card.id)} style={{ backgroundColor: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: '600' }}>
                      {card.status === 'Frozen' ? <Lock size={14} /> : <Unlock size={14} />}
                      {card.status === 'Frozen' ? 'UNFREEZE' : 'FREEZE'}
                    </button>
                  </div>

                  <p style={{ fontSize: '1.4rem', fontWeight: '700', letterSpacing: '0.15em', marginBottom: '24px', fontFamily: 'monospace' }}>{card.cardNumber}</p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <p style={{ fontSize: '0.68rem', opacity: 0.8 }}>CARD HOLDER</p>
                      <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{card.cardHolder}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.68rem', opacity: 0.8 }}>EXPIRES</p>
                      <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{card.expiry}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.68rem', opacity: 0.8 }}>CVV</p>
                      <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>***</p>
                    </div>
                  </div>
                </div>
              ))}
              {cards.length === 0 && <p className="text-muted">No cards issued yet. Click "+ Issue Digital Card" to get started.</p>}
            </div>
          </div>
        )}

        {/* Savings Vaults Tab */}
        {activeTab === 'Vaults' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <div>
                <h2 className="heading-2">CBE Smart Savings Vaults</h2>
                <p className="text-muted">Set target goals, save spare change automatically with transaction round-ups.</p>
              </div>
              <button className="btn-primary" onClick={() => setShowVaultModal(true)}>{t.newVault}</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              {vaults.map(v => {
                const progress = Math.min((v.currentAmount / v.targetAmount) * 100, 100);
                return (
                  <div key={v.id} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div>
                        <h3 style={{ fontWeight: '700', fontSize: '1.2rem' }}>{v.name}</h3>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Category: {v.category}</span>
                      </div>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(16,185,129,0.1)', color: 'var(--accent-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Target size={20} />
                      </div>
                    </div>

                    <p style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {v.currentAmount.toLocaleString(undefined, {minimumFractionDigits: 2})} ETB
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                      Target: <span style={{ fontWeight: '600' }}>{v.targetAmount.toLocaleString()} ETB</span> ({progress.toFixed(0)}% reached)
                    </p>

                    <div style={{ height: '10px', width: '100%', backgroundColor: 'var(--bg-tertiary)', borderRadius: '5px', overflow: 'hidden', marginBottom: '16px' }}>
                      <div style={{ height: '100%', width: `${progress}%`, backgroundColor: 'var(--accent-success)', transition: 'width 0.5s ease-out' }}></div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        Round-Up Savings: <strong style={{ color: v.roundUpEnabled ? 'var(--accent-success)' : 'var(--text-tertiary)' }}>{v.roundUpEnabled ? 'ENABLED' : 'DISABLED'}</strong>
                      </span>
                      <button className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => {
                        const amt = prompt('Enter deposit amount (ETB):');
                        if (amt && !isNaN(amt)) {
                          api.post(`/vaults/${v.id}/deposit`, { amount: amt }).then(() => fetchData());
                        }
                      }}>+ Deposit</button>
                    </div>
                  </div>
                );
              })}
              {vaults.length === 0 && <p className="text-muted">No savings vaults created yet.</p>}
            </div>
          </div>
        )}

        {/* QR & Split Bill Hub Tab */}
        {activeTab === 'QR & Split Bill' && (
          <div>
            <div style={{ marginBottom: '28px' }}>
              <h2 className="heading-2">CBE QR Pay & Split Bill Hub</h2>
              <p className="text-muted">Share your instant payment QR code or split restaurant & group expenses with friends.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
              <div className="card glass-panel" style={{ textAlign: 'center', padding: '32px' }}>
                <CBELogo size={32} showText={true} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginTop: '16px', marginBottom: '8px' }}>Receive Money via QR</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>Scan with CBE Birr or Mobile Banking to send funds instantly.</p>

                <div style={{ width: '180px', height: '180px', margin: '0 auto 20px', padding: '16px', background: 'white', borderRadius: '16px', boxShadow: '0 8px 20px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <QrCode size={140} color="#0f172a" />
                </div>

                <p style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--accent-primary)', marginBottom: '16px' }}>
                  CBE Account: {accounts[0]?.accountNumber || '1000123456789'}
                </p>

                <button className="btn-primary" onClick={() => alert('Payment QR Link copied to clipboard!')}>
                  Share Payment Link
                </button>
              </div>

              <div className="card">
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px' }}>P2P Split Bill Calculator</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>Split restaurant, travel, or event bills equally with friends.</p>

                <div className="form-group">
                  <label>Total Bill Amount (ETB)</label>
                  <input type="number" className="form-input" value={splitTotal} onChange={e => setSplitTotal(e.target.value)} />
                </div>

                <div className="form-group">
                  <label>Number of People</label>
                  <input type="number" min="1" max="50" className="form-input" value={splitPeople} onChange={e => setSplitPeople(e.target.value)} />
                </div>

                <div style={{ backgroundColor: 'var(--bg-primary)', padding: '20px', borderRadius: 'var(--border-radius-sm)', textAlign: 'center', marginTop: '24px' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Amount Per Person</p>
                  <p style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--accent-primary)' }}>{splitAmountPerPerson.toFixed(2)} ETB</p>
                </div>

                <button className="btn-primary" style={{ width: '100%', marginTop: '20px', backgroundColor: '#10b981' }} onClick={() => alert(`Split request for ${splitAmountPerPerson.toFixed(2)} ETB sent to ${splitPeople} contacts!`)}>
                  Request Split Payment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Existing Transfers Tab */}
        {activeTab === 'Transfers' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <div>
                <h2 className="heading-2">CBE Fund Transfers</h2>
                <p className="text-muted">Transfer funds between your accounts or to any CBE 13-digit account.</p>
              </div>
              <button className="btn-primary" onClick={() => setShowTransferModal(true)}>+ New Transfer</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {transfers.map(tr => (
                <div key={tr.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'rgba(37,99,235,0.1)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Send size={20} />
                    </div>
                    <div>
                      <p style={{ fontWeight: '600', fontSize: '1rem' }}>To: {tr.receiverName} ({tr.receiverAccountNumber})</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Ref: {tr.reference} • {new Date(tr.date).toLocaleString()}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: '700', fontSize: '1.15rem', color: 'var(--accent-primary)' }}>
                      -{tr.amount.toFixed(2)} {tr.currency}
                    </span>
                    <p style={{ fontSize: '0.75rem', color: 'var(--accent-success)', fontWeight: '600' }}>{tr.status}</p>
                  </div>
                </div>
              ))}
              {transfers.length === 0 && (
                <div className="card text-muted" style={{ textAlign: 'center', padding: '40px' }}>
                  <Send size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                  <p>No fund transfers executed yet. Click "+ New Transfer" to send money.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Existing Bill Pay Tab */}
        {activeTab === 'Bill Pay' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <div>
                <h2 className="heading-2">CBE Utility & Bill Settlement</h2>
                <p className="text-muted">Pay Ethio Telecom, EEU Electricity, AAWSA Water, and CBE Services instantly.</p>
              </div>
              <button className="btn-primary" style={{ backgroundColor: '#10b981' }} onClick={() => setShowBillModal(true)}>+ Pay Utility Bill</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              <BillProviderCard title="Ethio Telecom" desc="Mobile Airtime & Telebirr settlement" icon="📱" onClick={() => { setNewBill(p => ({...p, provider: 'Ethio Telecom'})); setShowBillModal(true); }} />
              <BillProviderCard title="EEU Electricity" desc="Ethiopian Electric Utility prepaid/postpaid" icon="⚡" onClick={() => { setNewBill(p => ({...p, provider: 'EEU Electricity'})); setShowBillModal(true); }} />
              <BillProviderCard title="AAWSA Water" desc="Addis Ababa Water & Sewerage Authority" icon="💧" onClick={() => { setNewBill(p => ({...p, provider: 'AAWSA Water'})); setShowBillModal(true); }} />
              <BillProviderCard title="School & Edu Fees" desc="CBE Educational tuition settlements" icon="🎓" onClick={() => { setNewBill(p => ({...p, provider: 'CBE Education'})); setShowBillModal(true); }} />
            </div>

            <h3 className="heading-2" style={{ marginBottom: '16px' }}>Payment History</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {billPayments.map(b => (
                <div key={b.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
                  <div>
                    <p style={{ fontWeight: '600' }}>{b.provider} Bill (#{b.accountNo})</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Receipt: {b.receiptNo} • {new Date(b.date).toLocaleDateString()}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>-{b.amount.toFixed(2)} ETB</span>
                    <p style={{ fontSize: '0.75rem', color: 'var(--accent-success)', fontWeight: '600' }}>{b.status}</p>
                  </div>
                </div>
              ))}
              {billPayments.length === 0 && <p className="text-muted">No bill payments recorded yet.</p>}
            </div>
          </div>
        )}

        {/* Existing FX Exchange Rates Tab */}
        {activeTab === 'FX Rates' && (
          <div>
            <div style={{ marginBottom: '28px' }}>
              <h2 className="heading-2">Commercial Bank of Ethiopia – FX Rates</h2>
              <p className="text-muted">Official CBE foreign currency exchange rates & remittance converter.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', marginBottom: '36px' }}>
              <div className="card">
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px' }}>CBE Foreign Currency Rates (ETB)</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {initialFxRates.map(fx => (
                    <div key={fx.currency} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--border-radius-sm)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '1.4rem' }}>{fx.flag}</span>
                        <div>
                          <p style={{ fontWeight: '700' }}>{fx.currency}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{fx.name}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '24px', textAlign: 'right' }}>
                        <div>
                          <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>BUY</p>
                          <p style={{ fontWeight: '700', color: 'var(--accent-success)' }}>{fx.buy.toFixed(2)} ETB</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>SELL</p>
                          <p style={{ fontWeight: '700', color: 'var(--accent-primary)' }}>{fx.sell.toFixed(2)} ETB</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card glass-panel">
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px' }}>Currency & Remittance Calculator</h3>
                <div className="form-group">
                  <label>Amount in Foreign Currency</label>
                  <input type="number" className="form-input" value={fxAmount} onChange={e => setFxAmount(e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div className="form-group">
                    <label>Currency</label>
                    <select className="form-input" value={fxCurrency} onChange={e => setFxCurrency(e.target.value)}>
                      {initialFxRates.map(f => <option key={f.currency} value={f.currency}>{f.currency} ({f.name})</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Transaction Type</label>
                    <select className="form-input" value={fxMode} onChange={e => setFxMode(e.target.value)}>
                      <option value="Buy">Buy (Remittance/Receive)</option>
                      <option value="Sell">Sell (Send Foreign)</option>
                    </select>
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-primary)', padding: '20px', borderRadius: 'var(--border-radius-sm)', textAlign: 'center', marginTop: '20px' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Equivalent Amount in Ethiopian Birr</p>
                  <p style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--accent-primary)' }}>{convertedFxValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} ETB</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>Rate Used: 1 {fxCurrency} = {rateUsed.toFixed(2)} ETB</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Interactive CBE Loan & Mortgage Calculator Tab */}
        {activeTab === 'Loan Calculator' && (
          <div>
            <div style={{ marginBottom: '28px' }}>
              <h2 className="heading-2">CBE Loan & Housing Mortgage Estimator</h2>
              <p className="text-muted">Calculate monthly installments & interest rates for CBE Personal, Business, and Mortgage loans.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
              <div className="card">
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '20px' }}>Loan Parameters</h3>
                
                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label>Loan Amount (ETB)</label>
                    <span style={{ fontWeight: '700', color: 'var(--accent-primary)' }}>{loanAmount.toLocaleString()} ETB</span>
                  </div>
                  <input type="range" min="50000" max="5000000" step="25000" value={loanAmount} onChange={e => setLoanAmount(Number(e.target.value))} style={{ width: '100%' }} />
                </div>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label>Loan Tenure (Years)</label>
                    <span style={{ fontWeight: '700', color: 'var(--accent-primary)' }}>{loanYears} Years ({loanYears * 12} Months)</span>
                  </div>
                  <input type="range" min="1" max="25" step="1" value={loanYears} onChange={e => setLoanYears(Number(e.target.value))} style={{ width: '100%' }} />
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label>Interest Rate (% Annual)</label>
                    <span style={{ fontWeight: '700', color: 'var(--accent-primary)' }}>{loanRate}%</span>
                  </div>
                  <input type="range" min="8" max="20" step="0.5" value={loanRate} onChange={e => setLoanRate(Number(e.target.value))} style={{ width: '100%' }} />
                </div>
              </div>

              {/* Loan Breakdown Card */}
              <div className="card glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '20px' }}>Estimated Monthly Installment</h3>
                  <div style={{ textAlign: 'center', padding: '24px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--border-radius-md)', marginBottom: '24px' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Monthly Payment</p>
                    <p style={{ fontSize: '2.4rem', fontWeight: '800', color: 'var(--accent-primary)', margin: '6px 0' }}>
                      {monthlyInstallment.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} ETB
                    </p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>For {numPayments} consecutive months</p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid var(--border-color)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Principal Amount</span>
                      <span style={{ fontWeight: '600' }}>{loanAmount.toLocaleString()} ETB</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid var(--border-color)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Total Interest Payable</span>
                      <span style={{ fontWeight: '600', color: 'var(--accent-danger)' }}>{totalInterest.toLocaleString(undefined, {maximumFractionDigits: 0})} ETB</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Total Amount Payable</span>
                      <span style={{ fontWeight: '700' }}>{totalRepayment.toLocaleString(undefined, {maximumFractionDigits: 0})} ETB</span>
                    </div>
                  </div>
                </div>

                <button className="btn-primary" style={{ width: '100%', marginTop: '24px' }} onClick={() => setShowLoanModal(true)}>
                  Apply for CBE Loan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Existing Accounts Tab */}
        {activeTab === 'Accounts' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h2 className="heading-2">Your CBE Accounts</h2>
              <button className="btn-primary" onClick={() => setShowAccountModal(true)}>{t.addAccount}</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              {accounts.map(acc => (
                <div key={acc.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontWeight: '600', fontSize: '1.25rem' }}>{acc.name}</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{t.accountNumber}: <span style={{ fontWeight: '600', color: 'var(--accent-primary)' }}>{acc.accountNumber}</span></p>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '6px 12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '20px', fontWeight: '500', height: 'fit-content' }}>{acc.type}</span>
                  </div>
                  <p style={{ fontSize: '2.2rem', fontWeight: '700', letterSpacing: '-0.02em', marginBottom: '8px' }}>{acc.balance.toLocaleString(undefined, {minimumFractionDigits: 2})} {acc.currency}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Status: <span style={{ color: 'var(--accent-success)', fontWeight: '500' }}>{acc.status}</span></p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{acc.currency}</p>
                  </div>
                </div>
              ))}
              {accounts.length === 0 && <p className="text-muted">No accounts linked yet.</p>}
            </div>
          </div>
        )}

        {/* Existing Transactions Tab */}
        {activeTab === 'Transactions' && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 className="heading-2">Transaction History</h2>
              <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={exportStatementCSV}>
                <Download size={16} style={{ marginRight: '6px' }} /> {t.exportStatement}
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {transactions.map(tx => (
                <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--border-radius-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Activity size={20} color={tx.type === 'Income' ? 'var(--accent-success)' : 'var(--text-secondary)'} />
                    </div>
                    <div>
                      <p style={{ fontWeight: '600', fontSize: '1rem' }}>{tx.category}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(tx.date).toLocaleDateString()} • {tx.paymentMethod} • {tx.notes || tx.account?.name}</p>
                    </div>
                  </div>
                  <span style={{ fontWeight: '700', fontSize: '1.15rem', color: tx.type === 'Income' ? 'var(--accent-success)' : 'var(--text-primary)' }}>
                    {tx.type === 'Income' ? '+' : '-'}{tx.amount.toFixed(2)} ETB
                  </span>
                </div>
              ))}
              {transactions.length === 0 && <p className="text-muted">No transactions found.</p>}
            </div>
          </div>
        )}

        {/* Existing Budgets Tab */}
        {activeTab === 'Budgets' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h2 className="heading-2">Monthly Budgets</h2>
              <button className="btn-primary" onClick={() => setShowBudgetModal(true)}>{t.setBudget}</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {budgets.map(budg => {
                const spent = expensesByCategory[budg.category] || 0;
                const percentage = Math.min((spent / budg.amount) * 100, 100);
                const isOver = spent > budg.amount;
                return (
                  <div key={budg.id} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                      <h3 style={{ fontWeight: '600', fontSize: '1.25rem' }}>{budg.category}</h3>
                      <p style={{ fontWeight: '600', fontSize: '1.125rem' }}>{spent.toFixed(2)} ETB <span style={{ color: 'var(--text-tertiary)', fontWeight: '400' }}>/ {budg.amount.toFixed(2)} ETB</span></p>
                    </div>
                    <div style={{ height: '12px', width: '100%', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${percentage}%`, backgroundColor: isOver ? 'var(--accent-danger)' : 'var(--accent-primary)', transition: 'width 0.5s ease-out' }}></div>
                    </div>
                    {isOver && <p style={{ color: 'var(--accent-danger)', fontSize: '0.875rem', marginTop: '12px', fontWeight: '500' }}>Budget limit exceeded by {(spent - budg.amount).toFixed(2)} ETB</p>}
                  </div>
                );
              })}
              {budgets.length === 0 && <p className="text-muted">No budgets set yet.</p>}
            </div>
          </div>
        )}

        {/* Existing Investments Tab */}
        {activeTab === 'Investments' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h2 className="heading-2">Investment Portfolio</h2>
              <button className="btn-primary" onClick={() => setShowInvestmentModal(true)}>{t.addInvestment}</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              {investments.map(inv => {
                const currentValue = inv.quantity * (inv.currentPrice || inv.purchasePrice);
                const profitLoss = currentValue - (inv.quantity * inv.purchasePrice);
                const profitLossPercent = (profitLoss / (inv.quantity * inv.purchasePrice)) * 100;
                const isPositive = profitLoss >= 0;
                return (
                  <div key={inv.id} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                      <h3 style={{ fontWeight: '600', fontSize: '1.25rem' }}>{inv.name}</h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '6px 12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '20px', fontWeight: '500' }}>{inv.type}</span>
                    </div>
                    <p style={{ fontSize: '2.2rem', fontWeight: '700', letterSpacing: '-0.02em', marginBottom: '16px' }}>{currentValue.toLocaleString(undefined, {minimumFractionDigits: 2})} ETB</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.875rem', fontWeight: '600', backgroundColor: isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: isPositive ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                          {isPositive ? '+' : ''}{profitLossPercent.toFixed(2)}%
                        </span>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>Return</span>
                      </div>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{inv.quantity} units</p>
                    </div>
                  </div>
                );
              })}
              {investments.length === 0 && <p className="text-muted">No investments added yet.</p>}
            </div>
          </div>
        )}

        {/* Existing AI Insights Tab */}
        {activeTab === 'AI Insights' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(139, 92, 246, 0.3)' }}>
                <Sparkles size={32} color="white" />
              </div>
              <h2 className="heading-1">CBE AI Financial Assistant</h2>
              <p className="text-muted" style={{ fontSize: '1.125rem' }}>Personalized financial analytics tailored for your CBE accounts.</p>
              {!aiInsights && !isAiLoading && (
                <button className="btn-ai" style={{ marginTop: '32px', fontSize: '1.125rem', padding: '16px 32px' }} onClick={generateAiInsights}>
                  Analyze My CBE Account
                </button>
              )}
            </div>

            {isAiLoading && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-ai)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              </div>
            )}

            {aiInsights && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {aiInsights.map((insight, idx) => (
                  <div key={idx} className="ai-card">
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: insight.type === 'warning' ? 'var(--accent-warning)' : insight.type === 'success' ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                      {insight.title}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6' }}>{insight.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* MODALS */}

      {/* CBE Loan Application Modal */}
      {showLoanModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}>
          <div className="card" style={{ width: '100%', maxWidth: '460px' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <CBELogo size={40} showText={true} />
              <h2 className="heading-2" style={{ marginTop: '12px' }}>Confirm CBE Loan Application</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Review your requested loan terms and deposit account.</p>
            </div>

            <form onSubmit={submitLoanApplication}>
              <div style={{ backgroundColor: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--border-radius-sm)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Requested Amount</span>
                  <span style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--accent-primary)' }}>{loanAmount.toLocaleString()} ETB</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Tenure & Rate</span>
                  <span style={{ fontWeight: '600', fontSize: '0.88rem' }}>{loanYears} Years ({loanRate}%)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Monthly Installment</span>
                  <span style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--accent-success)' }}>{monthlyInstallment.toFixed(2)} ETB</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Repayment</span>
                  <span style={{ fontWeight: '600', fontSize: '0.88rem' }}>{totalRepayment.toFixed(0)} ETB</span>
                </div>
              </div>

              <div className="form-group">
                <label>Deposit Loan Proceeds To Account</label>
                <select className="form-input" value={loanForm.depositAccountId} onChange={e => setLoanForm({...loanForm, depositAccountId: e.target.value})} required>
                  {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({acc.accountNumber})</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Loan Purpose</label>
                <select className="form-input" value={loanForm.purpose} onChange={e => setLoanForm({...loanForm, purpose: e.target.value})}>
                  <option>Personal & Housing Mortgage</option>
                  <option>Vehicle / Transport Business</option>
                  <option>Commercial Trade & Expansion</option>
                  <option>Agricultural Development</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
                <button type="button" className="btn-primary" style={{ backgroundColor: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} onClick={() => setShowLoanModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, backgroundColor: '#2563eb' }}>Confirm & Deposit Loan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Link External Ethiopian Bank Modal */}
      {showLinkBankModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '440px' }}>
            <h2 className="heading-2" style={{ marginBottom: '20px' }}>Link Local Ethiopian Bank</h2>
            <form onSubmit={submitBankLink}>
              <div className="form-group">
                <label>Select Bank / Wallet</label>
                <select className="form-input" value={newBankLink.bankName} onChange={e => setNewBankLink({...newBankLink, bankName: e.target.value})}>
                  {ethBanksList.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Account / Wallet Number</label>
                <input type="text" className="form-input" placeholder="e.g. AW77001982 or Phone" value={newBankLink.accountNumber} onChange={e => setNewBankLink({...newBankLink, accountNumber: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Current Account Balance (ETB)</label>
                <input type="number" step="0.01" className="form-input" value={newBankLink.initialBalance} onChange={e => setNewBankLink({...newBankLink, initialBalance: e.target.value})} required />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
                <button type="button" className="btn-primary" style={{ backgroundColor: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} onClick={() => setShowLinkBankModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, backgroundColor: '#8b5cf6' }}>Link Account Now</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ethswitch Interbank Transfer Modal */}
      {showEthswitchModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '440px' }}>
            <h2 className="heading-2" style={{ marginBottom: '20px' }}>Ethswitch Interbank Transfer</h2>
            <form onSubmit={submitEthswitchTransfer}>
              <div className="form-group">
                <label>From CBE Account</label>
                <select className="form-input" value={ethswitchForm.fromBankId} onChange={e => setEthswitchForm({...ethswitchForm, fromBankId: e.target.value})} required>
                  {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({acc.accountNumber}) - {acc.balance.toFixed(2)} ETB</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Destination Ethiopian Bank / Wallet</label>
                <select className="form-input" value={ethswitchForm.toBankName} onChange={e => setEthswitchForm({...ethswitchForm, toBankName: e.target.value})}>
                  {ethBanksList.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Destination Account / Phone Number</label>
                <input type="text" className="form-input" placeholder="e.g. 0132049281" value={ethswitchForm.toAccountNumber} onChange={e => setEthswitchForm({...ethswitchForm, toAccountNumber: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Receiver Full Name</label>
                <input type="text" className="form-input" placeholder="e.g. Almaz Ayana" value={ethswitchForm.toAccountHolder} onChange={e => setEthswitchForm({...ethswitchForm, toAccountHolder: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Transfer Amount (ETB)</label>
                <input type="number" step="0.01" className="form-input" placeholder="0.00" value={ethswitchForm.amount} onChange={e => setEthswitchForm({...ethswitchForm, amount: e.target.value})} required />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: '8px 0' }}>National Ethswitch Network Fee: <strong>5.00 ETB</strong></p>
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn-primary" style={{ backgroundColor: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} onClick={() => setShowEthswitchModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Execute Interbank Transfer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Issue Digital Card Modal */}
      {showCardModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '440px' }}>
            <h2 className="heading-2" style={{ marginBottom: '20px' }}>Issue Digital Card</h2>
            <form onSubmit={submitCard}>
              <div className="form-group">
                <label>Card Type</label>
                <select className="form-input" value={newCard.type} onChange={e => setNewCard({...newCard, type: e.target.value})}>
                  <option value="Virtual">Virtual Card (Online Purchases)</option>
                  <option value="Disposable">Single-Use Disposable Card (Safe Shopping)</option>
                  <option value="Physical">Physical Debit Card (ATM & POS)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Monthly Spending Limit (ETB)</label>
                <input type="number" step="1000" className="form-input" value={newCard.spendingLimit} onChange={e => setNewCard({...newCard, spendingLimit: e.target.value})} required />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
                <button type="button" className="btn-primary" style={{ backgroundColor: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} onClick={() => setShowCardModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Issue Instant Card</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Savings Vault Modal */}
      {showVaultModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '440px' }}>
            <h2 className="heading-2" style={{ marginBottom: '20px' }}>Create Savings Vault</h2>
            <form onSubmit={submitVault}>
              <div className="form-group">
                <label>Vault Name</label>
                <input type="text" className="form-input" placeholder="e.g. Vacation to Lalibela" value={newVault.name} onChange={e => setNewVault({...newVault, name: e.target.value})} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Target (ETB)</label>
                  <input type="number" className="form-input" value={newVault.targetAmount} onChange={e => setNewVault({...newVault, targetAmount: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Initial Deposit</label>
                  <input type="number" className="form-input" value={newVault.initialAmount} onChange={e => setNewVault({...newVault, initialAmount: e.target.value})} required />
                </div>
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '8px' }}>
                  <input type="checkbox" checked={newVault.roundUpEnabled} onChange={e => setNewVault({...newVault, roundUpEnabled: e.target.checked})} />
                  <span>Auto deposit spare change from round-ups</span>
                </label>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
                <button type="button" className="btn-primary" style={{ backgroundColor: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} onClick={() => setShowVaultModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, backgroundColor: '#10b981' }}>Create Vault</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fund Transfer Modal */}
      {showTransferModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '440px' }}>
            <h2 className="heading-2" style={{ marginBottom: '20px' }}>CBE Money Transfer</h2>
            <form onSubmit={submitTransfer}>
              <div className="form-group">
                <label>From CBE Account</label>
                <select className="form-input" value={newTransfer.senderAccountId} onChange={e => setNewTransfer({...newTransfer, senderAccountId: e.target.value})} required>
                  {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({acc.accountNumber}) - {acc.balance.toFixed(2)} ETB</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Receiver CBE Account Number (13 digits)</label>
                <input type="text" className="form-input" placeholder="e.g. 1000123456789" value={newTransfer.receiverAccountNumber} onChange={e => setNewTransfer({...newTransfer, receiverAccountNumber: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Receiver Full Name</label>
                <input type="text" className="form-input" placeholder="e.g. Abebe Bikila" value={newTransfer.receiverName} onChange={e => setNewTransfer({...newTransfer, receiverName: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Amount (ETB)</label>
                <input type="number" step="0.01" className="form-input" placeholder="0.00" value={newTransfer.amount} onChange={e => setNewTransfer({...newTransfer, amount: e.target.value})} required />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
                <button type="button" className="btn-primary" style={{ backgroundColor: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} onClick={() => setShowTransferModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Send Money Now</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bill Pay Modal */}
      {showBillModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '440px' }}>
            <h2 className="heading-2" style={{ marginBottom: '20px' }}>Pay Utility / Bill</h2>
            <form onSubmit={submitBill}>
              <div className="form-group">
                <label>Provider</label>
                <select className="form-input" value={newBill.provider} onChange={e => setNewBill({...newBill, provider: e.target.value})}>
                  <option>Ethio Telecom</option>
                  <option>EEU Electricity</option>
                  <option>AAWSA Water</option>
                  <option>CBE Education</option>
                </select>
              </div>
              <div className="form-group">
                <label>Customer / Meter / Phone Number</label>
                <input type="text" className="form-input" placeholder="e.g. 0911234567 or Meter ID" value={newBill.accountNo} onChange={e => setNewBill({...newBill, accountNo: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Pay From Account</label>
                <select className="form-input" value={newBill.accountId} onChange={e => setNewBill({...newBill, accountId: e.target.value})} required>
                  {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({acc.balance.toFixed(2)} ETB)</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Bill Amount (ETB)</label>
                <input type="number" step="0.01" className="form-input" placeholder="0.00" value={newBill.amount} onChange={e => setNewBill({...newBill, amount: e.target.value})} required />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
                <button type="button" className="btn-primary" style={{ backgroundColor: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} onClick={() => setShowBillModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, backgroundColor: '#10b981' }}>Confirm Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction & Loan Receipt Modal */}
      {activeReceipt && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}>
          <div className="card" style={{ width: '100%', maxWidth: '430px', textAlign: 'center', padding: '32px' }}>
            <div style={{ marginBottom: '16px' }}>
              <CBELogo size={40} showText={true} />
            </div>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(16,185,129,0.1)', color: 'var(--accent-success)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <CheckCircle2 size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '6px' }}>{activeReceipt.title}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>{activeReceipt.date}</p>
            
            <div style={{ backgroundColor: 'var(--bg-primary)', padding: '20px', borderRadius: 'var(--border-radius-sm)', textAlign: 'left', marginBottom: '24px' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Reference Number</p>
              <p style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--accent-primary)', marginBottom: '12px' }}>{activeReceipt.ref}</p>
              
              <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Details</p>
              <p style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '12px' }}>{activeReceipt.details}</p>
              
              <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Amount / Disbursal</p>
              <p style={{ fontWeight: '800', fontSize: '1.4rem', color: 'var(--accent-success)' }}>{activeReceipt.amount.toLocaleString()} ETB</p>
            </div>

            <button className="btn-primary" style={{ width: '100%' }} onClick={() => setActiveReceipt(null)}>
              Done
            </button>
          </div>
        </div>
      )}

      {/* Existing Modals for Transaction, Account, Budget, Investment */}
      {showTransactionModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '440px' }}>
            <h2 className="heading-2" style={{ marginBottom: '24px' }}>Add Transaction</h2>
            <form onSubmit={submitTransaction}>
              <div className="form-group">
                <label>Amount (ETB)</label>
                <input type="number" step="0.01" className="form-input" value={newTransaction.amount} onChange={e => setNewTransaction({...newTransaction, amount: e.target.value})} required autoFocus />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Type</label>
                  <select className="form-input" value={newTransaction.type} onChange={e => setNewTransaction({...newTransaction, type: e.target.value})}>
                    <option>Expense</option>
                    <option>Income</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <input type="text" className="form-input" value={newTransaction.category} onChange={e => setNewTransaction({...newTransaction, category: e.target.value})} required placeholder="e.g. Groceries" />
                </div>
              </div>
              <div className="form-group">
                <label>Account</label>
                <select className="form-input" value={newTransaction.accountId} onChange={e => setNewTransaction({...newTransaction, accountId: e.target.value})} required>
                  <option value="">Select Account</option>
                  {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({acc.balance} ETB)</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                <button type="button" className="btn-primary" style={{ backgroundColor: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} onClick={() => setShowTransactionModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save Transaction</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAccountModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '440px' }}>
            <h2 className="heading-2" style={{ marginBottom: '24px' }}>Add Account</h2>
            <form onSubmit={submitAccount}>
              <div className="form-group">
                <label>Account Name</label>
                <input type="text" className="form-input" value={newAccount.name} onChange={e => setNewAccount({...newAccount, name: e.target.value})} required placeholder="e.g. CBE Savings" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Type</label>
                  <select className="form-input" value={newAccount.type} onChange={e => setNewAccount({...newAccount, type: e.target.value})}>
                    <option>Savings</option>
                    <option>Checking</option>
                    <option>Special Interest</option>
                    <option>Investment</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Initial Balance (ETB)</label>
                  <input type="number" step="0.01" className="form-input" value={newAccount.balance} onChange={e => setNewAccount({...newAccount, balance: e.target.value})} required />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                <button type="button" className="btn-primary" style={{ backgroundColor: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} onClick={() => setShowAccountModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBudgetModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '440px' }}>
            <h2 className="heading-2" style={{ marginBottom: '24px' }}>Set Budget</h2>
            <form onSubmit={submitBudget}>
              <div className="form-group">
                <label>Category</label>
                <input type="text" className="form-input" value={newBudget.category} onChange={e => setNewBudget({...newBudget, category: e.target.value})} required placeholder="e.g. Food" />
              </div>
              <div className="form-group">
                <label>Monthly Limit (ETB)</label>
                <input type="number" step="0.01" className="form-input" value={newBudget.amount} onChange={e => setNewBudget({...newBudget, amount: e.target.value})} required />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                <button type="button" className="btn-primary" style={{ backgroundColor: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} onClick={() => setShowBudgetModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save Budget</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showInvestmentModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '440px' }}>
            <h2 className="heading-2" style={{ marginBottom: '24px' }}>Add Investment</h2>
            <form onSubmit={submitInvestment}>
              <div className="form-group">
                <label>Asset Name</label>
                <input type="text" className="form-input" value={newInvestment.name} onChange={e => setNewInvestment({...newInvestment, name: e.target.value})} required placeholder="e.g. Ethio Telecom Shares" />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select className="form-input" value={newInvestment.type} onChange={e => setNewInvestment({...newInvestment, type: e.target.value})}>
                  <option>Mutual Fund</option>
                  <option>Stock</option>
                  <option>Treasury Bond</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Quantity</label>
                  <input type="number" step="0.001" className="form-input" value={newInvestment.quantity} onChange={e => setNewInvestment({...newInvestment, quantity: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Purchase Price (ETB)</label>
                  <input type="number" step="0.01" className="form-input" value={newInvestment.purchasePrice} onChange={e => setNewInvestment({...newInvestment, purchasePrice: e.target.value})} required />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                <button type="button" className="btn-primary" style={{ backgroundColor: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} onClick={() => setShowInvestmentModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save Investment</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

const NavItem = ({ icon, label, active, onClick, isAi, isNew }) => {
  const activeBg = isAi ? 'linear-gradient(90deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1))' : 'var(--bg-primary)';
  const activeColor = isAi ? 'var(--accent-ai)' : 'var(--accent-primary)';
  
  return (
    <button onClick={onClick} style={{ 
      display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', 
      borderRadius: 'var(--border-radius-sm)', 
      background: active ? activeBg : 'transparent', 
      color: active ? activeColor : 'var(--text-secondary)', 
      transition: 'all 0.2s', width: '100%', textAlign: 'left',
      fontSize: '0.88rem', cursor: 'pointer', border: 'none', position: 'relative'
    }} 
    onMouseOver={e => !active && (e.currentTarget.style.backgroundColor = 'var(--bg-primary)')} 
    onMouseOut={e => !active && (e.currentTarget.style.backgroundColor = 'transparent')}>
      {icon}
      <span style={{ fontWeight: active ? '600' : '500' }}>{label}</span>
      {isNew && <span style={{ marginLeft: 'auto', fontSize: '0.6rem', padding: '2px 6px', background: '#10b981', color: 'white', borderRadius: '4px', fontWeight: 'bold' }}>NEW</span>}
    </button>
  );
};

const StatCard = ({ title, amount, trend, positive }) => (
  <div className="card glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px' }}>
    <p style={{ color: 'var(--text-secondary)', fontWeight: '500', fontSize: '0.875rem' }}>{title}</p>
    <h3 style={{ fontSize: '1.6rem', fontWeight: '700', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>{amount}</h3>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', backgroundColor: positive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: positive ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
        {trend}
      </span>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>vs last month</span>
    </div>
  </div>
);

const BillProviderCard = ({ title, desc, icon, onClick }) => (
  <div className="card" onClick={onClick} style={{ cursor: 'pointer', transition: 'all 0.2s', display: 'flex', gap: '16px', alignItems: 'center' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
    <div style={{ fontSize: '2rem' }}>{icon}</div>
    <div>
      <h4 style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '2px' }}>{title}</h4>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{desc}</p>
    </div>
  </div>
);

export default Dashboard;
