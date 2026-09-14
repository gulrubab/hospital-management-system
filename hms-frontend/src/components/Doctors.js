import React, { useState, useEffect } from "react";
import API from "../api";

const SPEC_COLORS = {
    Cardiology:    { bg: "#fef2f2", color: "#991b1b", border: "#fca5a5" },
    Dermatology:   { bg: "#fff7e6", color: "#b45309", border: "#fcd34d" },
    Pediatrics:    { bg: "#e6faf3", color: "#065f46", border: "#6ee7b7" },
    Orthopedics:   { bg: "#e6f4ff", color: "#1d4ed8", border: "#93c5fd" },
    Neurology:     { bg: "#f5f0ff", color: "#7c3aed", border: "#c4b5fd" },
    Gynecology:    { bg: "#fff0f6", color: "#be185d", border: "#f9a8d4" },
    Ophthalmology: { bg: "#f0fdf4", color: "#166534", border: "#86efac" },
    ENT:           { bg: "#fef9c3", color: "#854d0e", border: "#fde047" },
    Psychiatry:    { bg: "#f0f4ff", color: "#3730a3", border: "#a5b4fc" },
    Radiology:     { bg: "#f8fafc", color: "#475569", border: "#cbd5e1" },
};

const SPECIALIZATIONS = Object.keys(SPEC_COLORS);

const DEFAULT_FORM = {
    name: "", email: "", phone: "",
    specialization: "Cardiology", qualification: "",
    father_name: "", cnic: "",
    experience_years: "", consultation_fee: "",
    available_days: "Mon, Tue, Wed, Thu, Fri",
    available_time_start: "09:00", available_time_end: "17:00",
    is_available: true,
};

function Doctors() {
    const [doctors, setDoctors]           = useState([]);
    const [loading, setLoading]           = useState(true);
    const [showForm, setShowForm]         = useState(false);
    const [editingDoctor, setEditingDoctor] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [deletingId, setDeletingId]     = useState(null);
    const [formData, setFormData]         = useState(DEFAULT_FORM);

    useEffect(() => { fetchDoctors(); }, []);

    const fetchDoctors = async () => {
        try {
            const response = await API.get("doctors/");
            setDoctors(response.data);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        const dataToSend = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            specialization: formData.specialization,
            qualification: formData.qualification || "MBBS",
            father_name: formData.father_name || "",
            cnic: formData.cnic || "",
            experience_years: parseInt(formData.experience_years) || 0,
            consultation_fee: parseFloat(formData.consultation_fee) || 0,
            available_days: formData.available_days,
            available_time_start: formData.available_time_start + ":00",
            available_time_end: formData.available_time_end + ":00",
            is_available: formData.is_available,
        };
        console.log("Sending doctor data:", dataToSend);
        try {
            if (editingDoctor) {
                await API.put(`doctors/${editingDoctor.id}/`, dataToSend);
                alert("Doctor updated successfully!");
            } else {
                await API.post("doctors/", dataToSend);
                alert("Doctor added successfully!");
            }
            setShowForm(false);
            resetForm();
            fetchDoctors();
        } catch (error) {
            console.error("Error:", error);
            setErrorMessage(error.response ? JSON.stringify(error.response.data) : "Error saving doctor");
        }
    };

    const resetForm = () => { setFormData(DEFAULT_FORM); setEditingDoctor(null); };

    const handleEdit = (doctor) => {
        setEditingDoctor(doctor);
        setFormData({
            name: doctor.name || "",
            email: doctor.email,
            phone: doctor.phone,
            specialization: doctor.specialization,
            qualification: doctor.qualification || "",
            father_name: doctor.father_name || "",
            cnic: doctor.cnic || "",
            experience_years: doctor.experience_years || "",
            consultation_fee: doctor.consultation_fee || "",
            available_days: doctor.available_days || "Mon, Tue, Wed, Thu, Fri",
            available_time_start: doctor.available_time_start?.slice(0, 5) || "09:00",
            available_time_end: doctor.available_time_end?.slice(0, 5) || "17:00",
            is_available: doctor.is_available,
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this doctor?")) return;
        setDeletingId(id);
        try {
            await API.delete(`doctors/${id}/`);
            alert("Doctor deleted successfully!");
            fetchDoctors();
        } catch {
            alert("Error deleting doctor");
        } finally {
            setDeletingId(null);
        }
    };

    const focusStyle = (e) => {
        e.target.style.borderColor = "#1d9e75";
        e.target.style.boxShadow   = "0 0 0 3px rgba(29,158,117,0.1)";
    };
    const blurStyle = (e) => {
        e.target.style.borderColor = "#e2e8f0";
        e.target.style.boxShadow   = "none";
    };

    if (loading) {
        return (
            <div style={s.loadingScreen}>
                <div style={s.spinner} />
                <p style={s.loadingText}>Loading doctors...</p>
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
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        </svg>
                        Medical Staff
                    </div>
                    <h1 style={s.pageTitle}>Doctors Management</h1>
                    <p style={s.pageSub}>{doctors.length} doctor{doctors.length !== 1 ? "s" : ""} registered</p>
                </div>
                <button style={s.addBtn}
                    onClick={() => { resetForm(); setErrorMessage(""); setShowForm(true); }}
                    onMouseEnter={e => e.currentTarget.style.background = "#0f6e56"}
                    onMouseLeave={e => e.currentTarget.style.background = "#1d9e75"}
                >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Add New Doctor
                </button>
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
                                <h2 style={s.modalTitle}>{editingDoctor ? "Edit Doctor" : "Add New Doctor"}</h2>
                                <p style={s.modalSub}>{editingDoctor ? `Editing Dr. ${editingDoctor.name}` : "Fill in the doctor's details below"}</p>
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

                            {/* Full Name */}
                            <div style={s.fg}>
                                <label style={s.label}>Name <Req /></label>
                                <input type="text" name="name" placeholder="Dr. John Smith" value={formData.name}
                                    onChange={handleInputChange} required style={s.input}
                                    onFocus={focusStyle} onBlur={blurStyle} />
                            </div>

                            {/* Father Name + CNIC */}
                        <div style={s.row}>
                            <div style={s.fg}>
                                <label style={s.label}>Father Name</label>
                                <input type="text" name="father_name" value={formData.father_name}
                                    placeholder="Father's Name" onChange={handleInputChange} style={s.input}
                                    onFocus={focusStyle} onBlur={blurStyle} />
                            </div>
                            <div style={s.fg}>
                                <label style={s.label}>CNIC</label>
                                <input type="text" name="cnic" value={formData.cnic}
                                    placeholder="XXXXX-XXXXXXX-X" onChange={handleInputChange} style={s.input}
                                    onFocus={focusStyle} onBlur={blurStyle} />
                            </div>
                        </div>

                            {/* Email + Phone */}
                            <div style={s.row}>
                                <div style={s.fg}>
                                    <label style={s.label}>Email <Req /></label>
                                    <input type="email" name="email" value={formData.email}
                                        onChange={handleInputChange} required style={s.input}
                                        onFocus={focusStyle} onBlur={blurStyle} />
                                </div>
                                <div style={s.fg}>
                                    <label style={s.label}>Phone <Req /></label>
                                    <input type="text" name="phone" value={formData.phone}
                                        onChange={handleInputChange} required style={s.input}
                                        onFocus={focusStyle} onBlur={blurStyle} />
                                </div>
                            </div>

                            {/* Specialization + Qualification */}
                            <div style={s.row}>
                                <div style={s.fg}>
                                    <label style={s.label}>Specialization <Req /></label>
                                    <select name="specialization" value={formData.specialization}
                                        onChange={handleInputChange} required style={s.select}
                                        onFocus={focusStyle} onBlur={blurStyle}>
                                        {SPECIALIZATIONS.map(sp => <option key={sp} value={sp}>{sp}</option>)}
                                    </select>
                                </div>
                                <div style={s.fg}>
                                    <label style={s.label}>Qualification</label>
                                    <input type="text" name="qualification" value={formData.qualification}
                                        placeholder="MBBS, MD" onChange={handleInputChange} style={s.input}
                                        onFocus={focusStyle} onBlur={blurStyle} />
                                </div>
                        </div>

                            {/* Experience + Fee */}
                            <div style={s.row}>
                                <div style={s.fg}>
                                    <label style={s.label}>Experience (years)</label>
                                    <input type="number" name="experience_years" value={formData.experience_years}
                                        onChange={handleInputChange} style={s.input}
                                        onFocus={focusStyle} onBlur={blurStyle} />
                                </div>
                                <div style={s.fg}>
                                    <label style={s.label}>Consultation Fee (Rs)</label>
                                    <input type="number" name="consultation_fee" value={formData.consultation_fee}
                                        step="0.01" onChange={handleInputChange} style={s.input}
                                        onFocus={focusStyle} onBlur={blurStyle} />
                                </div>
                            </div>

                            {/* Available Days */}
                            <div style={s.fg}>
                                <label style={s.label}>Available Days</label>
                                <input type="text" name="available_days" value={formData.available_days}
                                    placeholder="Mon, Tue, Wed, Thu, Fri" onChange={handleInputChange} style={s.input}
                                    onFocus={focusStyle} onBlur={blurStyle} />
                            </div>

                            {/* Time */}
                            <div style={s.row}>
                                <div style={s.fg}>
                                    <label style={s.label}>Start Time</label>
                                    <input type="time" name="available_time_start" value={formData.available_time_start}
                                        onChange={handleInputChange} style={s.input}
                                        onFocus={focusStyle} onBlur={blurStyle} />
                                </div>
                                <div style={s.fg}>
                                    <label style={s.label}>End Time</label>
                                    <input type="time" name="available_time_end" value={formData.available_time_end}
                                        onChange={handleInputChange} style={s.input}
                                        onFocus={focusStyle} onBlur={blurStyle} />
                                </div>
                            </div>

                            {/* Checkbox */}
                            <div style={s.checkRow}>
                                <label style={s.checkLabel}>
                                    <input type="checkbox" name="is_available" checked={formData.is_available}
                                        onChange={handleInputChange} style={{ accentColor: "#1d9e75", width: 16, height: 16 }} />
                                    <span>Available for appointments</span>
                                </label>
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
                                    {editingDoctor ? "Update Doctor" : "Save Doctor"}
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
                                {["ID", "Doctor", "Specialization", "Phone", "Fee", "Hours", "Status", "Actions"].map(h => (
                                    <th key={h} style={s.th}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {doctors.length === 0 ? (
                                <tr>
                                    <td colSpan="8" style={s.emptyCell}>
                                        <div style={s.emptyState}>
                                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                            </svg>
                                            <p style={{ color: "#94a3b8", margin: "10px 0 4px", fontWeight: 500 }}>No doctors found</p>
                                            <p style={{ color: "#cbd5e1", fontSize: 13 }}>Click "Add New Doctor" to get started</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                doctors.map((doctor, idx) => {
                                    const spec = SPEC_COLORS[doctor.specialization] || SPEC_COLORS.Radiology;
                                    const initials = doctor.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "DR";
                                    return (
                                        <tr key={doctor.id}
                                            style={{ background: idx % 2 === 0 ? "#fff" : "#f8fafc" }}
                                            onMouseEnter={e => e.currentTarget.style.background = "#f0fdf8"}
                                            onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? "#fff" : "#f8fafc"}
                                        >
                                            <td style={s.td}>
                                                <span style={s.idBadge}>#{doctor.id}</span>
                                            </td>
                                            <td style={s.td}>
                                                <div style={s.nameCell}>
                                                    <div style={{ ...s.avatar, background: spec.bg, color: spec.color }}>
                                                        {initials}
                                                    </div>
                                                    <div>
                                                        <p style={{ margin: 0, fontWeight: 600, color: "#1e293b", fontSize: 14 }}>Dr. {doctor.name}</p>
                                                        <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>{doctor.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={s.td}>
                                                <span style={{ ...s.specBadge, background: spec.bg, color: spec.color, borderColor: spec.border }}>
                                                    {doctor.specialization}
                                                </span>
                                            </td>
                                            <td style={s.td}>
                                                <span style={s.phoneText}>{doctor.phone}</span>
                                            </td>
                                            <td style={s.td}>
                                                <span style={s.feeText}>Rs {parseFloat(doctor.consultation_fee || 0).toLocaleString()}</span>
                                            </td>
                                            <td style={s.td}>
                                                <div style={s.hoursCell}>
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                                    <span style={{ fontSize: 12, color: "#475569" }}>
                                                        {doctor.available_time_start?.slice(0, 5)} – {doctor.available_time_end?.slice(0, 5)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={s.td}>
                                                <span style={doctor.is_available ? s.availBadge : s.busyBadge}>
                                                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: doctor.is_available ? "#1d9e75" : "#dc2626", display: "inline-block" }} />
                                                    {doctor.is_available ? "Available" : "Busy"}
                                                </span>
                                            </td>
                                            <td style={s.td}>
                                                <div style={s.actionGroup}>
                                                    <button onClick={() => handleEdit(doctor)} style={s.editBtn}
                                                        onMouseEnter={e => e.currentTarget.style.background = "#1d4ed8"}
                                                        onMouseLeave={e => e.currentTarget.style.background = "#3b82f6"}
                                                    >
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(doctor.id)}
                                                        disabled={deletingId === doctor.id}
                                                        style={{ ...s.deleteBtn, opacity: deletingId === doctor.id ? 0.6 : 1 }}
                                                        onMouseEnter={e => { if (deletingId !== doctor.id) e.currentTarget.style.background = "#7f1d1d"; }}
                                                        onMouseLeave={e => { if (deletingId !== doctor.id) e.currentTarget.style.background = "#dc2626"; }}
                                                    >
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                                                        {deletingId === doctor.id ? "…" : "Delete"}
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

// Small helper — no unused vars
function Req() {
    return <span style={{ color: "#e74c3c", marginLeft: 2 }}>*</span>;
}

const s = {
    page: { padding: "28px 32px", background: "#f8fafc", minHeight: "100vh", fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif" },

    loadingScreen: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" },
    spinner: { width: 36, height: 36, border: "3px solid #e2e8f0", borderTop: "3px solid #1d9e75", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
    loadingText: { color: "#64748b", marginTop: 14, fontSize: 14 },

    header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 },
    badge: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase", color: "#1d9e75", background: "rgba(29,158,117,0.09)", padding: "4px 10px", borderRadius: 20, marginBottom: 10 },
    pageTitle: { fontSize: 26, fontWeight: 700, color: "#0f172a", margin: 0 },
    pageSub: { fontSize: 13, color: "#94a3b8", marginTop: 4 },
    addBtn: { display: "flex", alignItems: "center", gap: 8, background: "#1d9e75", color: "#fff", border: "none", borderRadius: 8, padding: "11px 20px", fontSize: 14, fontWeight: 500, cursor: "pointer", transition: "background 0.15s" },

    errorBanner: { display: "flex", alignItems: "center", gap: 8, background: "#fff0f0", color: "#991b1b", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 20 },

    overlay: { position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(2px)" },
    modal: { background: "#fff", borderRadius: 14, width: "100%", maxWidth: 600, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" },
    modalHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "24px 28px 16px", borderBottom: "1px solid #f1f5f9" },
    modalTitle: { fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 },
    modalSub: { fontSize: 13, color: "#94a3b8", marginTop: 4 },
    closeBtn: { background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 6, display: "flex", alignItems: "center" },

    fg: { marginBottom: 16, flex: 1 },
    row: { display: "flex", gap: 16 },
    label: { display: "block", fontSize: 11, fontWeight: 500, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" },
    input: { width: "100%", padding: "10px 12px", fontSize: 14, color: "#1e293b", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, outline: "none", transition: "border-color 0.15s, box-shadow 0.15s", boxSizing: "border-box" },
    select: { width: "100%", padding: "10px 12px", fontSize: 14, color: "#1e293b", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, outline: "none", cursor: "pointer", boxSizing: "border-box", transition: "border-color 0.15s, box-shadow 0.15s" },
    checkRow: { marginBottom: 16 },
    checkLabel: { display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#334155", cursor: "pointer", userSelect: "none" },

    modalFoot: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 },
    cancelBtn: { background: "#fff", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 20px", fontSize: 14, cursor: "pointer", fontWeight: 500, transition: "background 0.15s" },
    saveBtn: { background: "#1d9e75", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: 6, transition: "background 0.15s" },

    tableCard: { background: "#fff", borderRadius: 12, boxShadow: "0 1px 6px rgba(0,0,0,0.07)", overflow: "hidden" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { background: "#0f172a", color: "#e2e8f0", padding: "13px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" },
    td: { padding: "12px 16px", borderBottom: "1px solid #f1f5f9", verticalAlign: "middle", fontSize: 13, transition: "background 0.12s" },
    emptyCell: { padding: "60px 20px", textAlign: "center", borderBottom: "1px solid #f1f5f9" },
    emptyState: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4 },

    idBadge: { display: "inline-block", background: "#f1f5f9", color: "#475569", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600, fontFamily: "monospace" },
    nameCell: { display: "flex", alignItems: "center", gap: 10 },
    avatar: { width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 },
    specBadge: { display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500, border: "1px solid" },
    phoneText: { fontSize: 13, color: "#475569", fontFamily: "monospace" },
    feeText: { fontSize: 13, fontWeight: 600, color: "#065f46" },
    hoursCell: { display: "flex", alignItems: "center", gap: 5 },
    availBadge: { display: "inline-flex", alignItems: "center", gap: 5, background: "#e6faf3", color: "#065f46", border: "1px solid #6ee7b7", borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 500 },
    busyBadge:  { display: "inline-flex", alignItems: "center", gap: 5, background: "#fef2f2", color: "#991b1b", border: "1px solid #fca5a5", borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 500 },

    actionGroup: { display: "flex", gap: 6 },
    editBtn:   { display: "flex", alignItems: "center", gap: 4, background: "#3b82f6", color: "#fff", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "background 0.15s" },
    deleteBtn: { display: "flex", alignItems: "center", gap: 4, background: "#dc2626", color: "#fff", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "background 0.15s, opacity 0.15s" },
};

export default Doctors;





