import React, { useState, useEffect } from "react";
import API from "../api";

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');

  .pharmacy-root * { box-sizing: border-box; margin: 0; padding: 0; }

  .pharmacy-root {
    --bg: #f7f8fc;
    --surface: #ffffff;
    --surface2: #f0f2f8;
    --border: #e4e7f0;
    --text-primary: #0f1523;
    --text-secondary: #5a6382;
    --text-muted: #9aa3be;
    --accent: #3a5cff;
    --accent-light: #eef1ff;
    --accent-hover: #2945e0;
    --green: #00b07a;
    --green-light: #e6f9f4;
    --red: #e63757;
    --red-light: #fdedf0;
    --amber: #f59e0b;
    --amber-light: #fef3c7;
    --teal: #0891b2;
    --teal-light: #e0f2fe;
    --shadow-sm: 0 1px 3px rgba(15,21,35,0.06);
    --shadow-md: 0 4px 16px rgba(15,21,35,0.08), 0 2px 6px rgba(15,21,35,0.04);
    --shadow-lg: 0 20px 60px rgba(15,21,35,0.14), 0 8px 24px rgba(15,21,35,0.08);
    --radius: 12px;
    --radius-sm: 8px;
    --radius-lg: 16px;
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    min-height: 100vh;
    color: var(--text-primary);
  }

  .pharmacy-root input,
  .pharmacy-root select,
  .pharmacy-root textarea {
    width: 100%;
    padding: 10px 14px;
    border: 1.5px solid var(--border);
    border-radius: var(--radius-sm);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: var(--text-primary);
    background: var(--surface);
    transition: border-color 0.18s, box-shadow 0.18s;
    outline: none;
  }

  .pharmacy-root input:focus,
  .pharmacy-root select:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(58,92,255,0.1);
  }

  .pharmacy-root label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: var(--text-secondary);
    margin-bottom: 6px;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  .pharmacy-root table { width: 100%; border-collapse: separate; border-spacing: 0; }

  .pharmacy-root th {
    background: var(--surface2);
    color: var(--text-secondary);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 12px 16px;
    text-align: left;
    border-bottom: 1.5px solid var(--border);
  }

  .pharmacy-root td {
    padding: 14px 16px;
    font-size: 14px;
    color: var(--text-primary);
    border-bottom: 1px solid var(--border);
    vertical-align: middle;
  }

  .pharmacy-root tr:last-child td { border-bottom: none; }
  .pharmacy-root tbody tr { transition: background 0.14s; }
  .pharmacy-root tbody tr:hover { background: var(--accent-light); }

  .ph-btn-primary {
    display: inline-flex; align-items: center; gap: 7px;
    background: var(--accent); color: white; border: none;
    border-radius: var(--radius-sm); padding: 10px 20px;
    font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600;
    cursor: pointer; transition: background 0.18s, transform 0.12s, box-shadow 0.18s;
    box-shadow: 0 2px 8px rgba(58,92,255,0.25);
  }
  .ph-btn-primary:hover { background: var(--accent-hover); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(58,92,255,0.35); }

  .ph-btn-save {
    display: inline-flex; align-items: center; gap: 7px;
    background: var(--green); color: white; border: none;
    border-radius: var(--radius-sm); padding: 10px 22px;
    font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600;
    cursor: pointer; transition: background 0.18s, transform 0.12s;
    box-shadow: 0 2px 8px rgba(0,176,122,0.25);
  }
  .ph-btn-save:hover { background: #009968; transform: translateY(-1px); }

  .ph-btn-cancel {
    display: inline-flex; align-items: center; gap: 7px;
    background: var(--surface2); color: var(--text-secondary);
    border: 1.5px solid var(--border); border-radius: var(--radius-sm);
    padding: 10px 22px; font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 600; cursor: pointer;
    transition: background 0.18s, border-color 0.18s;
  }
  .ph-btn-cancel:hover { background: #e4e7f0; border-color: #c8cee0; }

  .ph-btn-sell {
    display: inline-flex; align-items: center; gap: 5px;
    background: var(--red-light); color: var(--red);
    border: none; border-radius: 6px; padding: 6px 12px;
    font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600;
    cursor: pointer; transition: background 0.14s; margin-right: 6px;
  }
  .ph-btn-sell:hover { background: #f9c8d0; }

  .ph-btn-restock {
    display: inline-flex; align-items: center; gap: 5px;
    background: var(--teal-light); color: var(--teal);
    border: none; border-radius: 6px; padding: 6px 12px;
    font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600;
    cursor: pointer; transition: background 0.14s;
  }
  .ph-btn-restock:hover { background: #bae6fd; }

  .modal-backdrop {
    position: fixed; inset: 0;
    background: rgba(10,15,30,0.55);
    backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    z-index: 1000; animation: phFadeIn 0.2s ease;
  }
  @keyframes phFadeIn { from { opacity: 0; } to { opacity: 1; } }

  .modal-box {
    background: var(--surface); border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg); width: 90%; max-width: 580px;
    max-height: 88vh; overflow-y: auto;
    animation: phSlideUp 0.25s cubic-bezier(.16,1,.3,1);
  }
  @keyframes phSlideUp {
    from { transform: translateY(24px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }

  .modal-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 24px 28px 20px; border-bottom: 1.5px solid var(--border);
  }
  .modal-title {
    font-size: 20px; font-weight: 700;
    color: var(--text-primary); display: flex; align-items: center; gap: 10px;
  }
  .modal-close {
    width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
    background: var(--surface2); border: none; border-radius: 50%;
    cursor: pointer; color: var(--text-secondary); font-size: 16px; transition: background 0.14s;
  }
  .modal-close:hover { background: var(--border); }
  .modal-body { padding: 24px 28px; }
  .modal-footer {
    display: flex; gap: 10px; justify-content: flex-end;
    padding: 20px 28px 24px; border-top: 1.5px solid var(--border);
  }

  .form-section-label {
    font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--text-muted);
    margin-bottom: 14px; display: flex; align-items: center; gap: 8px;
  }
  .form-section-label::after { content: ''; flex: 1; height: 1px; background: var(--border); }

  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .field-group { display: flex; flex-direction: column; }
  .field-full { grid-column: span 2; }

  .badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;
  }
  .badge-instock  { background: var(--green-light); color: #065f46; }
  .badge-lowstock { background: var(--red-light);   color: var(--red); }
  .badge-category { background: var(--accent-light); color: var(--accent); }

  .med-name { font-weight: 600; color: var(--text-primary); }
  .med-mfr  { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
  .med-id   { font-size: 12px; font-weight: 700; color: var(--text-muted); font-variant-numeric: tabular-nums; }
  .med-price { font-weight: 600; color: var(--text-primary); font-variant-numeric: tabular-nums; }

  .stock-qty { font-weight: 700; font-size: 15px; }
  .stock-low  { color: var(--red); }
  .stock-ok   { color: var(--green); }

  .empty-state { text-align: center; padding: 60px 20px; color: var(--text-muted); }
  .empty-state-icon { font-size: 48px; margin-bottom: 12px; opacity: 0.5; }
  .empty-state p { font-size: 15px; font-weight: 500; }

  .loading-screen {
    display: flex; align-items: center; justify-content: center;
    gap: 12px; height: 100vh; font-size: 15px; color: var(--text-secondary);
    font-family: 'DM Sans', sans-serif;
  }
  .spinner {
    width: 20px; height: 20px; border: 2.5px solid var(--border);
    border-top-color: var(--accent); border-radius: 50%;
    animation: phSpin 0.7s linear infinite;
  }
  @keyframes phSpin { to { transform: rotate(360deg); } }

  /* Stat cards */
  .stat-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 28px; }
  .stat-card {
    background: var(--surface); border: 1.5px solid var(--border);
    border-radius: var(--radius); padding: 18px 20px;
    box-shadow: var(--shadow-sm);
  }
  .stat-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); margin-bottom: 6px; }
  .stat-value { font-size: 26px; font-weight: 700; color: var(--text-primary); }
  .stat-sub   { font-size: 12px; color: var(--text-muted); margin-top: 3px; }
`;

const CATEGORIES = ["Tablet", "Capsule", "Syrup", "Injection", "Cream"];

const emptyForm = {
    name: "", category: "Tablet", manufacturer: "",
    price: "", stock_quantity: "", reorder_level: "10", expiry_date: ""
};

function Pharmacy() {
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState(emptyForm);

    useEffect(() => { fetchMedicines(); }, []);

    const fetchMedicines = async () => {
        try {
            const response = await API.get("medicines/");
            setMedicines(response.data);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post("medicines/", formData);
            alert("Medicine added successfully!");
            setShowForm(false);
            setFormData(emptyForm);
            fetchMedicines();
        } catch (error) {
            alert("Error adding medicine");
        }
    };

    const updateStock = async (id, quantity, movement_type) => {
        try {
            await API.post(`medicines/${id}/update_stock/`, { quantity, movement_type });
            alert("Stock updated!");
            fetchMedicines();
        } catch (error) {
            alert("Error updating stock");
        }
    };

    // Derived stats
    const totalMeds   = medicines.length;
    const lowStock    = medicines.filter(m => m.stock_quantity <= m.reorder_level).length;
    const totalValue  = medicines.reduce((sum, m) => sum + parseFloat(m.price || 0) * parseInt(m.stock_quantity || 0), 0);

    if (loading) return (
        <>
            <style>{globalStyles}</style>
            <div className="pharmacy-root">
                <div className="loading-screen"><div className="spinner" />Loading medicines...</div>
            </div>
        </>
    );

    return (
        <>
            <style>{globalStyles}</style>
            <div className="pharmacy-root" style={{ padding: "32px 36px" }}>

                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                    <div>
                        <h1 style={{ fontSize: "26px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
                            Pharmacy
                        </h1>
                        <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Inventory & stock management</p>
                    </div>
                    <button className="ph-btn-primary" onClick={() => setShowForm(true)}>
                        <span style={{ fontSize: "18px", lineHeight: 1 }}>+</span>
                        Add Medicine
                    </button>
                </div>

                {/* Stat Cards */}
                <div className="stat-cards">
                    <div className="stat-card">
                        <div className="stat-label">Total Medicines</div>
                        <div className="stat-value">{totalMeds}</div>
                        <div className="stat-sub">unique items</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Low Stock Alerts</div>
                        <div className="stat-value" style={{ color: lowStock > 0 ? "var(--red)" : "var(--green)" }}>{lowStock}</div>
                        <div className="stat-sub">{lowStock > 0 ? "need restocking" : "all levels healthy"}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Inventory Value</div>
                        <div className="stat-value">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <div className="stat-sub">total stock value</div>
                    </div>
                </div>

                {/* Modal */}
                {showForm && (
                    <div className="modal-backdrop">
                        <div className="modal-box">
                            <div className="modal-header">
                                <div className="modal-title"><span>💊</span> Add New Medicine</div>
                                <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="form-section-label">Basic Details</div>
                                    <div className="form-grid">
                                        <div className="field-group field-full">
                                            <label>Medicine Name *</label>
                                            <input name="name" placeholder="e.g. Paracetamol 500mg" onChange={handleInputChange} required />
                                        </div>
                                        <div className="field-group">
                                            <label>Category *</label>
                                            <select name="category" value={formData.category} onChange={handleInputChange}>
                                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div className="field-group">
                                            <label>Manufacturer</label>
                                            <input name="manufacturer" placeholder="Manufacturer name" onChange={handleInputChange} />
                                        </div>
                                    </div>

                                    <div className="form-section-label" style={{ marginTop: "8px" }}>Stock & Pricing</div>
                                    <div className="form-grid">
                                        <div className="field-group">
                                            <label>Price *</label>
                                            <input name="price" type="number" placeholder="0.00" step="0.01" onChange={handleInputChange} required />
                                        </div>
                                        <div className="field-group">
                                            <label>Stock Quantity *</label>
                                            <input name="stock_quantity" type="number" placeholder="0" onChange={handleInputChange} required />
                                        </div>
                                        <div className="field-group">
                                            <label>Reorder Level</label>
                                            <input name="reorder_level" type="number" placeholder="10" defaultValue="10" onChange={handleInputChange} />
                                        </div>
                                        <div className="field-group">
                                            <label>Expiry Date *</label>
                                            <input name="expiry_date" type="date" onChange={handleInputChange} required />
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="ph-btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                                    <button type="submit" className="ph-btn-save">✅ Save Medicine</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Table */}
                <div style={{ background: "var(--surface)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-md)", border: "1.5px solid var(--border)", overflow: "hidden" }}>
                    <div style={{ overflowX: "auto" }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Medicine</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Status</th>
                                    <th>Expiry</th>
                                    <th style={{ textAlign: "right" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {medicines.length === 0 ? (
                                    <tr>
                                        <td colSpan="8">
                                            <div className="empty-state">
                                                <div className="empty-state-icon">💊</div>
                                                <p>No medicines found. Click <strong>"Add Medicine"</strong> to get started.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    medicines.map((med) => {
                                        const isLow = med.stock_quantity <= med.reorder_level;
                                        return (
                                            <tr key={med.id}>
                                                <td><span className="med-id">#{String(med.id).padStart(4, "0")}</span></td>
                                                <td>
                                                    <div className="med-name">{med.name}</div>
                                                    {med.manufacturer && <div className="med-mfr">{med.manufacturer}</div>}
                                                </td>
                                                <td><span className="badge badge-category">{med.category}</span></td>
                                                <td><span className="med-price">${parseFloat(med.price).toFixed(2)}</span></td>
                                                <td>
                                                    <span className={`stock-qty ${isLow ? "stock-low" : "stock-ok"}`}>
                                                        {med.stock_quantity}
                                                    </span>
                                                    <span style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "4px" }}>
                                                        / min {med.reorder_level}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${isLow ? "badge-lowstock" : "badge-instock"}`}>
                                                        {isLow ? "⚠ Low Stock" : "✓ In Stock"}
                                                    </span>
                                                </td>
                                                <td style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{med.expiry_date}</td>
                                                <td style={{ textAlign: "right" }}>
                                                    <button className="ph-btn-sell" onClick={() => updateStock(med.id, 1, "OUT")}>
                                                        − Sell 1
                                                    </button>
                                                    <button className="ph-btn-restock" onClick={() => updateStock(med.id, 10, "IN")}>
                                                        + Add 10
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {medicines.length > 0 && (
                    <p style={{ marginTop: "14px", fontSize: "12.5px", color: "var(--text-muted)", textAlign: "right" }}>
                        Showing {medicines.length} medicine{medicines.length !== 1 ? "s" : ""}
                    </p>
                )}
            </div>
        </>
    );
}

export default Pharmacy;



