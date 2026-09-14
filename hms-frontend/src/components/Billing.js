import React, { useState, useEffect } from "react";
import API from "../api";

const STATUS_CONFIG = {
    Pending:  { bg: "#fff7e6", color: "#b45309", border: "#fcd34d" },
    Paid:     { bg: "#e6faf3", color: "#065f46", border: "#6ee7b7" },
    Overdue:  { bg: "#fef2f2", color: "#991b1b", border: "#fca5a5" },
    Refunded: { bg: "#f0f4ff", color: "#3730a3", border: "#a5b4fc" },
};

const METHOD_ICONS = {
    Cash:      "💵",
    Card:      "💳",
    Insurance: "🏥",
    Online:    "🌐",
};

function Billing() {
    const [bills, setBills]               = useState([]);
    const [patients, setPatients]         = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading]           = useState(true);
    const [showForm, setShowForm]         = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [deletingId, setDeletingId]     = useState(null);
    const [formData, setFormData]         = useState({
        patient: "", appointment: "", amount: "", tax: "0",
        discount: "0", description: "", status: "Pending", payment_method: "Cash",
    });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [billRes, patRes, appRes] = await Promise.all([
                API.get("billing/"), API.get("patients/"), API.get("appointments/"),
            ]);
            setBills(billRes.data);
            setPatients(patRes.data);
            setAppointments(appRes.data);
        } catch (error) {
            console.error("Error fetching data:", error);
            setErrorMessage("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const getFilteredAppointments = () => {
        if (!formData.patient) return [];
        return appointments.filter(apt => apt.patient === parseInt(formData.patient));
    };

    const calculateTotal = () => {
        const amount   = parseFloat(formData.amount)   || 0;
        const tax      = parseFloat(formData.tax)      || 0;
        const discount = parseFloat(formData.discount) || 0;
        return (amount + tax - discount).toFixed(2);
    };

    const formatCurrency = (amount) =>
        `Rs ${parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        if (!formData.patient) { setErrorMessage("Please select a patient"); return; }
        if (!formData.amount || parseFloat(formData.amount) <= 0) { setErrorMessage("Please enter a valid amount"); return; }

        const amount       = parseFloat(formData.amount);
        const tax          = parseFloat(formData.tax)      || 0;
        const discount     = parseFloat(formData.discount) || 0;
        const total_amount = amount + tax - discount;
        const billNumber   = `BILL-${Date.now()}`;

        const dataToSend = {
            patient: parseInt(formData.patient),
            appointment: formData.appointment ? parseInt(formData.appointment) : null,
            bill_number: billNumber, amount, tax, discount, total_amount,
            description: formData.description || "",
            status: formData.status, payment_method: formData.payment_method,
        };

        try {
            await API.post("billing/", dataToSend);
            alert("Bill created successfully!");
            setShowForm(false);
            setFormData({ patient: "", appointment: "", amount: "", tax: "0", discount: "0", description: "", status: "Pending", payment_method: "Cash" });
            fetchData();
        } catch (error) {
            console.error("Error:", error);
            setErrorMessage(error.response
                ? `Error: ${JSON.stringify(error.response.data)}`
                : "Error creating bill. Make sure Django is running."
            );
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await API.patch(`billing/${id}/`, { status });
            alert(`Bill ${status}!`);
            fetchData();
        } catch {
            alert("Error updating status");
        }
    };

    const deleteBill = async (id) => {
        if (!window.confirm("Are you sure you want to delete this bill?")) return;
        setDeletingId(id);
        try {
            await API.delete(`billing/${id}/`);
            alert("Bill deleted successfully!");
            fetchData();
        } catch {
            alert("Error deleting bill");
        } finally {
            setDeletingId(null);
        }
    };

    // Summary stats
    const totalRevenue  = bills.filter(b => b.status === "Paid").reduce((s, b) => s + parseFloat(b.total_amount || 0), 0);
    const pendingCount  = bills.filter(b => b.status === "Pending").length;
    const overdueCount  = bills.filter(b => b.status === "Overdue").length;

    if (loading) {
        return (
            <div style={s.loadingScreen}>
                <div style={s.spinner} />
                <p style={{ color: "#64748b", marginTop: 14, fontSize: 14 }}>Loading bills...</p>
            </div>
        );
    }

    return (
        <div style={s.page}>

            {/* ── Header ── */}
            <div style={s.header}>
                <div>
                    <div style={s.badge}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1d9e75" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                        </svg>
                        Billing Management
                    </div>
                    <h1 style={s.pageTitle}>Bills &amp; Payments</h1>
                    <p style={s.pageSub}>{bills.length} total bill{bills.length !== 1 ? "s" : ""}</p>
                </div>
                <button style={s.addBtn}
                    onClick={() => { setErrorMessage(""); setShowForm(true); }}
                    onMouseEnter={e => e.currentTarget.style.background = "#0f6e56"}
                    onMouseLeave={e => e.currentTarget.style.background = "#1d9e75"}
                >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Create New Bill
                </button>
            </div>

            {/* ── Summary Cards ── */}
            <div style={s.statsGrid}>
                <div style={{ ...s.statCard, borderTop: "3px solid #6ee7b7" }}>
                    <p style={s.statLabel}>Total Revenue</p>
                    <p style={{ ...s.statValue, color: "#065f46" }}>{formatCurrency(totalRevenue)}</p>
                </div>
                <div style={{ ...s.statCard, borderTop: "3px solid #fcd34d" }}>
                    <p style={s.statLabel}>Pending Bills</p>
                    <p style={{ ...s.statValue, color: "#b45309" }}>{pendingCount}</p>
                </div>
                <div style={{ ...s.statCard, borderTop: "3px solid #fca5a5" }}>
                    <p style={s.statLabel}>Overdue Bills</p>
                    <p style={{ ...s.statValue, color: "#991b1b" }}>{overdueCount}</p>
                </div>
                <div style={{ ...s.statCard, borderTop: "3px solid #93c5fd" }}>
                    <p style={s.statLabel}>Total Bills</p>
                    <p style={{ ...s.statValue, color: "#1d4ed8" }}>{bills.length}</p>
                </div>
            </div>

            {/* ── Global Error ── */}
            {errorMessage && !showForm && (
                <div style={s.errorBanner}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#991b1b" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {errorMessage}
                </div>
            )}

            {/* ── Modal ── */}
            {showForm && (
                <div style={s.overlay} onClick={e => e.target === e.currentTarget && setShowForm(false)}>
                    <div style={s.modal}>

                        <div style={s.modalHead}>
                            <div>
                                <h2 style={s.modalTitle}>Create New Bill</h2>
                                <p style={s.modalSub}>Fill in the billing details below</p>
                            </div>
                            <button style={s.closeBtn} onClick={() => setShowForm(false)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>

                        {errorMessage && (
                            <div style={{ ...s.errorBanner, margin: "0 28px 4px" }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#991b1b" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                {errorMessage}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ padding: "0 28px 28px" }}>

                            {/* Patient */}
                            <div style={s.fg}>
                                <label style={s.label}>Patient <span style={{ color: "#e74c3c" }}>*</span></label>
                                <select name="patient" value={formData.patient} onChange={handleInputChange} required style={s.select}>
                                    <option value="">Select patient…</option>
                                    {patients.map(p => (
                                        <option key={p.id} value={p.id}>{p.first_name} {p.last_name} — {p.phone}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Appointment */}
                            <div style={s.fg}>
                                <label style={s.label}>Appointment <span style={s.optional}>(optional)</span></label>
                                <select name="appointment" value={formData.appointment} onChange={handleInputChange} style={s.select}>
                                    <option value="">No appointment linked</option>
                                    {getFilteredAppointments().map(apt => (
                                        <option key={apt.id} value={apt.id}>{apt.appointment_date} — {apt.appointment_time}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Amount + Tax */}
                            <div style={s.row}>
                                <div style={s.fg}>
                                    <label style={s.label}>Amount (Rs) <span style={{ color: "#e74c3c" }}>*</span></label>
                                    <input type="number" name="amount" value={formData.amount} onChange={handleInputChange}
                                        placeholder="0.00" step="0.01" required style={s.input}
                                        onFocus={e => { e.target.style.borderColor = "#1d9e75"; e.target.style.boxShadow = "0 0 0 3px rgba(29,158,117,0.1)"; }}
                                        onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
                                    />
                                </div>
                                <div style={s.fg}>
                                    <label style={s.label}>Tax (Rs)</label>
                                    <input type="number" name="tax" value={formData.tax} onChange={handleInputChange}
                                        placeholder="0.00" step="0.01" style={s.input}
                                        onFocus={e => { e.target.style.borderColor = "#1d9e75"; e.target.style.boxShadow = "0 0 0 3px rgba(29,158,117,0.1)"; }}
                                        onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
                                    />
                                </div>
                            </div>

                            {/* Discount + Total */}
                            <div style={s.row}>
                                <div style={s.fg}>
                                    <label style={s.label}>Discount (Rs)</label>
                                    <input type="number" name="discount" value={formData.discount} onChange={handleInputChange}
                                        placeholder="0.00" step="0.01" style={s.input}
                                        onFocus={e => { e.target.style.borderColor = "#1d9e75"; e.target.style.boxShadow = "0 0 0 3px rgba(29,158,117,0.1)"; }}
                                        onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
                                    />
                                </div>
                                <div style={s.fg}>
                                    <label style={s.label}>Total Amount</label>
                                    <div style={s.totalBox}>
                                        <span style={s.totalLabel}>Rs</span>
                                        <span style={s.totalValue}>{calculateTotal()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div style={s.fg}>
                                <label style={s.label}>Description</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange}
                                    rows="2" placeholder="Bill description…" style={s.textarea}
                                    onFocus={e => { e.target.style.borderColor = "#1d9e75"; e.target.style.boxShadow = "0 0 0 3px rgba(29,158,117,0.1)"; }}
                                    onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
                                />
                            </div>

                            {/* Status + Method */}
                            <div style={s.row}>
                                <div style={s.fg}>
                                    <label style={s.label}>Status</label>
                                    <select name="status" value={formData.status} onChange={handleInputChange} style={s.select}>
                                        <option value="Pending">Pending</option>
                                        <option value="Paid">Paid</option>
                                        <option value="Overdue">Overdue</option>
                                        <option value="Refunded">Refunded</option>
                                    </select>
                                </div>
                                <div style={s.fg}>
                                    <label style={s.label}>Payment Method</label>
                                    <select name="payment_method" value={formData.payment_method} onChange={handleInputChange} style={s.select}>
                                        <option value="Cash">💵 Cash</option>
                                        <option value="Card">💳 Card</option>
                                        <option value="Insurance">🏥 Insurance</option>
                                        <option value="Online">🌐 Online</option>
                                    </select>
                                </div>
                            </div>

                            <div style={s.modalFoot}>
                                <button type="button" style={s.cancelBtn} onClick={() => setShowForm(false)}
                                    onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"}
                                    onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                                >Cancel</button>
                                <button type="submit" style={s.saveBtn}
                                    onMouseEnter={e => e.currentTarget.style.background = "#0f6e56"}
                                    onMouseLeave={e => e.currentTarget.style.background = "#1d9e75"}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                                    Create Bill
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Table ── */}
            <div style={s.tableCard}>
                <div style={{ overflowX: "auto" }}>
                    <table style={s.table}>
                        <thead>
                            <tr>
                                {["Bill #", "Patient", "Amount", "Tax", "Discount", "Total", "Status", "Method", "Date", "Actions"].map(h => (
                                    <th key={h} style={s.th}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {bills.length === 0 ? (
                                <tr>
                                    <td colSpan="10" style={s.emptyCell}>
                                        <div style={s.emptyState}>
                                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round">
                                                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                                            </svg>
                                            <p style={{ color: "#94a3b8", margin: "10px 0 4px", fontWeight: 500 }}>No bills yet</p>
                                            <p style={{ color: "#cbd5e1", fontSize: 13 }}>Click "Create New Bill" to get started</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                bills.map((bill, idx) => {
                                    const cfg = STATUS_CONFIG[bill.status] || STATUS_CONFIG.Pending;
                                    return (
                                        <tr key={bill.id}
                                            style={{ background: idx % 2 === 0 ? "#fff" : "#f8fafc" }}
                                            onMouseEnter={e => e.currentTarget.style.background = "#f0fdf8"}
                                            onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? "#fff" : "#f8fafc"}
                                        >
                                            {/* Bill # */}
                                            <td style={s.td}>
                                                <span style={s.billNum}>{bill.bill_number}</span>
                                            </td>

                                            {/* Patient */}
                                            <td style={s.td}>
                                                <div style={s.nameCell}>
                                                    <div style={s.avatar}>
                                                        {bill.patient?.first_name?.[0]}{bill.patient?.last_name?.[0]}
                                                    </div>
                                                    <span style={{ fontWeight: 500, color: "#1e293b" }}>
                                                        {bill.patient?.first_name} {bill.patient?.last_name}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Amount */}
                                            <td style={s.td}>
                                                <span style={s.mono}>{formatCurrency(bill.amount)}</span>
                                            </td>

                                            {/* Tax */}
                                            <td style={s.td}>
                                                <span style={{ ...s.mono, color: "#64748b" }}>{formatCurrency(bill.tax)}</span>
                                            </td>

                                            {/* Discount */}
                                            <td style={s.td}>
                                                <span style={{ ...s.mono, color: "#059669" }}>-{formatCurrency(bill.discount)}</span>
                                            </td>

                                            {/* Total */}
                                            <td style={s.td}>
                                                <span style={{ ...s.mono, fontWeight: 700, color: "#0f172a", fontSize: 14 }}>
                                                    {formatCurrency(bill.total_amount)}
                                                </span>
                                            </td>

                                            {/* Status dropdown */}
                                            <td style={s.td}>
                                                <select
                                                    value={bill.status}
                                                    onChange={e => updateStatus(bill.id, e.target.value)}
                                                    style={{ ...s.statusSelect, background: cfg.bg, color: cfg.color, borderColor: cfg.border }}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Paid">Paid</option>
                                                    <option value="Overdue">Overdue</option>
                                                    <option value="Refunded">Refunded</option>
                                                </select>
                                            </td>

                                            {/* Method */}
                                            <td style={s.td}>
                                                <span style={s.methodBadge}>
                                                    {METHOD_ICONS[bill.payment_method] || "—"} {bill.payment_method || "—"}
                                                </span>
                                            </td>

                                            {/* Date */}
                                            <td style={s.td}>
                                                <span style={s.dateText}>
                                                    {new Date(bill.created_at).toLocaleDateString()}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td style={s.td}>
                                                <div style={s.actionGroup}>
                                                    <button
                                                        onClick={() => updateStatus(bill.id, "Paid")}
                                                        disabled={bill.status === "Paid"}
                                                        style={{ ...s.paidBtn, opacity: bill.status === "Paid" ? 0.45 : 1, cursor: bill.status === "Paid" ? "not-allowed" : "pointer" }}
                                                        onMouseEnter={e => { if (bill.status !== "Paid") e.currentTarget.style.background = "#1d4ed8"; }}
                                                        onMouseLeave={e => { if (bill.status !== "Paid") e.currentTarget.style.background = "#3b82f6"; }}
                                                    >
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                                                        Paid
                                                    </button>
                                                    <button
                                                        onClick={() => deleteBill(bill.id)}
                                                        disabled={deletingId === bill.id}
                                                        style={{ ...s.deleteBtn, opacity: deletingId === bill.id ? 0.6 : 1 }}
                                                        onMouseEnter={e => { if (deletingId !== bill.id) e.currentTarget.style.background = "#7f1d1d"; }}
                                                        onMouseLeave={e => { if (deletingId !== bill.id) e.currentTarget.style.background = "#dc2626"; }}
                                                    >
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                                                        {deletingId === bill.id ? "…" : "Delete"}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

const s = {
    page: { padding: "28px 32px", background: "#f8fafc", minHeight: "100vh", overflowX: "hidden", fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif" },

    loadingScreen: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" },
    spinner: { width: 36, height: 36, border: "3px solid #e2e8f0", borderTop: "3px solid #1d9e75", borderRadius: "50%", animation: "spin 0.8s linear infinite" },

    header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 },
    badge: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase", color: "#1d9e75", background: "rgba(29,158,117,0.09)", padding: "4px 10px", borderRadius: 20, marginBottom: 10 },
    pageTitle: { fontSize: 26, fontWeight: 700, color: "#0f172a", margin: 0 },
    pageSub: { fontSize: 13, color: "#94a3b8", marginTop: 4 },
    addBtn: { display: "flex", alignItems: "center", gap: 8, background: "#1d9e75", color: "#fff", border: "none", borderRadius: 8, padding: "11px 20px", fontSize: 14, fontWeight: 500, cursor: "pointer", transition: "background 0.15s" },

    statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 },
    statCard: { background: "#fff", borderRadius: 10, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
    statLabel: { fontSize: 12, color: "#94a3b8", margin: 0, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" },
    statValue: { fontSize: 22, fontWeight: 700, margin: 0 },

    errorBanner: { display: "flex", alignItems: "center", gap: 8, background: "#fff0f0", color: "#991b1b", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 20 },

    overlay: { position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(2px)" },
    modal: { background: "#fff", borderRadius: 14, width: "100%", maxWidth: 580, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" },
    modalHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "24px 28px 16px", borderBottom: "1px solid #f1f5f9" },
    modalTitle: { fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 },
    modalSub: { fontSize: 13, color: "#94a3b8", marginTop: 4 },
    closeBtn: { background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 6, display: "flex", alignItems: "center" },

    fg: { marginBottom: 16 },
    row: { display: "flex", gap: 16 },
    label: { display: "block", fontSize: 11, fontWeight: 500, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" },
    optional: { fontWeight: 400, color: "#94a3b8", textTransform: "none", letterSpacing: 0 },
    select: { width: "100%", padding: "10px 12px", fontSize: 14, color: "#1e293b", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, outline: "none", cursor: "pointer", boxSizing: "border-box" },
    input: { width: "100%", padding: "10px 12px", fontSize: 14, color: "#1e293b", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, outline: "none", transition: "border-color 0.15s, box-shadow 0.15s", boxSizing: "border-box" },
    textarea: { width: "100%", padding: "10px 12px", fontSize: 14, color: "#1e293b", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, outline: "none", resize: "vertical", fontFamily: "inherit", transition: "border-color 0.15s, box-shadow 0.15s", boxSizing: "border-box" },
    totalBox: { display: "flex", alignItems: "center", gap: 8, background: "#f0fdf8", border: "1px solid #6ee7b7", borderRadius: 8, padding: "10px 14px" },
    totalLabel: { fontSize: 13, fontWeight: 600, color: "#065f46" },
    totalValue: { fontSize: 18, fontWeight: 700, color: "#065f46" },

    modalFoot: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 },
    cancelBtn: { background: "#fff", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 20px", fontSize: 14, cursor: "pointer", fontWeight: 500, transition: "background 0.15s" },
    saveBtn: { background: "#1d9e75", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: 6, transition: "background 0.15s" },

    tableCard: { background: "#fff", borderRadius: 12, boxShadow: "0 1px 6px rgba(0,0,0,0.07)", overflow: "hidden" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { background: "#0f172a", color: "#e2e8f0", padding: "13px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" },
    td: { padding: "11px 14px", borderBottom: "1px solid #f1f5f9", verticalAlign: "middle", fontSize: 13, transition: "background 0.12s" },
    emptyCell: { padding: "60px 20px", textAlign: "center", borderBottom: "1px solid #f1f5f9" },
    emptyState: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4 },

    billNum: { display: "inline-block", background: "#f1f5f9", color: "#475569", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600, fontFamily: "monospace" },
    nameCell: { display: "flex", alignItems: "center", gap: 8 },
    avatar: { width: 30, height: 30, borderRadius: "50%", background: "#e6faf3", color: "#065f46", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0, textTransform: "uppercase" },
    mono: { fontFamily: "monospace", fontSize: 13, color: "#1e293b" },
    statusSelect: { padding: "4px 10px", borderRadius: 6, border: "1px solid", fontSize: 12, fontWeight: 500, cursor: "pointer", outline: "none" },
    methodBadge: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "#475569", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, padding: "3px 8px" },
    dateText: { fontSize: 12, color: "#64748b" },

    actionGroup: { display: "flex", gap: 6 },
    paidBtn: { display: "flex", alignItems: "center", gap: 4, background: "#3b82f6", color: "#fff", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 12, fontWeight: 500, transition: "background 0.15s" },
    deleteBtn: { display: "flex", alignItems: "center", gap: 4, background: "#dc2626", color: "#fff", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "background 0.15s, opacity 0.15s" },
};

export default Billing;

