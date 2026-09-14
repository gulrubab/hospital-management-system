import React, { useState, useEffect } from "react";
import API from "../api";

function Prescriptions() {
    const [prescriptions, setPrescriptions] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showItemsForm, setShowItemsForm] = useState(false);
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [formData, setFormData] = useState({
        patient: "",
        doctor: "",
        appointment: "",
        diagnosis: "",
        notes: ""
    });
    const [itemData, setItemData] = useState({
        prescription: "",
        medicine_name: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: ""
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [presRes, patRes, docRes, appRes] = await Promise.all([
                API.get("prescriptions/"),
                API.get("patients/"),
                API.get("doctors/"),
                API.get("appointments/")
            ]);
            setPrescriptions(presRes.data);
            setPatients(patRes.data);
            setDoctors(docRes.data);
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

    const handleItemChange = (e) => {
        setItemData({ ...itemData, [e.target.name]: e.target.value });
    };

    const getFilteredAppointments = () => {
        if (!formData.patient) return appointments;
        return appointments.filter(apt => apt.patient === parseInt(formData.patient));
    };

    // Resolve doctor/patient whether API returns an object or just an ID
    const resolveDoctor = (pres) => {
        if (pres.doctor && typeof pres.doctor === "object") return pres.doctor;
        const id = typeof pres.doctor === "number" ? pres.doctor : parseInt(pres.doctor);
        return doctors.find(d => d.id === id) || null;
    };

    const getDoctorName = (doctor) => {
        if (!doctor) return "—";
        if (doctor.name) return `Dr. ${doctor.name}`;
        if (doctor.first_name) return `Dr. ${doctor.first_name} ${doctor.last_name}`;
        return "—";
    };

    const resolvePatient = (pres) => {
        if (pres.patient && typeof pres.patient === "object") return pres.patient;
        const id = typeof pres.patient === "number" ? pres.patient : parseInt(pres.patient);
        return patients.find(p => p.id === id) || null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        if (!formData.patient) return setErrorMessage("Please select a patient");
        if (!formData.doctor) return setErrorMessage("Please select a doctor");
        if (!formData.appointment) return setErrorMessage("Please select an appointment");
        if (!formData.diagnosis) return setErrorMessage("Please enter a diagnosis");

        const dataToSend = {
            patient: parseInt(formData.patient),
            doctor: parseInt(formData.doctor),
            appointment: parseInt(formData.appointment),
            diagnosis: formData.diagnosis,
            notes: formData.notes || ""
        };

        try {
            const response = await API.post("prescriptions/", dataToSend);
            setShowForm(false);
            setFormData({ patient: "", doctor: "", appointment: "", diagnosis: "", notes: "" });
            fetchData();
            setSelectedPrescription(response.data);
            setShowItemsForm(true);
        } catch (error) {
            if (error.response) {
                setErrorMessage(`Error: ${JSON.stringify(error.response.data)}`);
            } else {
                setErrorMessage("Error creating prescription. Make sure the server is running.");
            }
        }
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        const dataToSend = {
            prescription: selectedPrescription.id,
            medicine_name: itemData.medicine_name,
            dosage: itemData.dosage,
            frequency: itemData.frequency,
            duration: itemData.duration,
            instructions: itemData.instructions
        };
        try {
            await API.post("prescription-items/", dataToSend);
            setItemData({ prescription: "", medicine_name: "", dosage: "", frequency: "", duration: "", instructions: "" });
            fetchData();
        } catch (error) {
            alert("Error adding medicine: " + (error.response?.data ? JSON.stringify(error.response.data) : error.message));
        }
    };

    const deletePrescription = async (id) => {
        if (window.confirm("Are you sure you want to delete this prescription?")) {
            try {
                await API.delete(`prescriptions/${id}/`);
                fetchData();
            } catch {
                alert("Error deleting prescription");
            }
        }
    };

    if (loading) {
        return (
            <div style={s.loadingWrap}>
                <div style={s.spinner} />
                <p style={s.loadingText}>Loading prescriptions…</p>
            </div>
        );
    }

    return (
        <div style={s.page}>
            <style>{css}</style>

            {/* Header */}
            <div style={s.topBar}>
                <div>
                    <h1 style={s.pageTitle}>Prescriptions</h1>
                    <p style={s.pageSubtitle}>{prescriptions.length} record{prescriptions.length !== 1 ? "s" : ""} on file</p>
                </div>
                <button className="btn-primary" onClick={() => setShowForm(true)}>
                    <span style={s.btnIcon}>＋</span> New Prescription
                </button>
            </div>

            {errorMessage && (
                <div style={s.alertError}>
                    <span style={s.alertIcon}>⚠</span>
                    <span>{errorMessage}</span>
                    <button style={s.alertClose} onClick={() => setErrorMessage("")}>✕</button>
                </div>
            )}

            {/* Create Prescription Modal */}
            {showForm && (
                <div style={s.backdrop} onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
                    <div style={s.modal}>
                        <div style={s.modalHeader}>
                            <div>
                                <h2 style={s.modalTitle}>New Prescription</h2>
                                <p style={s.modalSubtitle}>Fill in the details below</p>
                            </div>
                            <button style={s.closeBtn} onClick={() => setShowForm(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div style={s.formGrid}>
                                <div style={s.field}>
                                    <label style={s.label}>Patient <span style={s.req}>*</span></label>
                                    <select
                                        name="patient"
                                        value={formData.patient}
                                        onChange={(e) => {
                                            handleInputChange(e);
                                            setFormData(prev => ({ ...prev, patient: e.target.value, appointment: "" }));
                                        }}
                                        style={s.select}
                                        required
                                    >
                                        <option value="">Select patient…</option>
                                        {patients.map(p => (
                                            <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div style={s.field}>
                                    <label style={s.label}>Attending Doctor <span style={s.req}>*</span></label>
                                    <select name="doctor" value={formData.doctor} onChange={handleInputChange} style={s.select} required>
                                        <option value="">Select doctor…</option>
                                        {doctors.map(d => (
                                            <option key={d.id} value={d.id}>{d.name ? `Dr. ${d.name}` : `Dr. ${d.first_name} ${d.last_name}`} — {d.specialization}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={s.field}>
                                <label style={s.label}>Appointment <span style={s.req}>*</span></label>
                                <select name="appointment" value={formData.appointment} onChange={handleInputChange} style={s.select} required>
                                    <option value="">Select appointment…</option>
                                    {getFilteredAppointments().map(apt => (
                                        <option key={apt.id} value={apt.id}>
                                            {apt.appointment_date} at {apt.appointment_time}
                                            {apt.doctor && apt.doctor.name ? ` — Dr. ${apt.doctor.name}` : ""}
                                        </option>
                                    ))}
                                </select>
                                {formData.patient && getFilteredAppointments().length === 0 && (
                                    <p style={s.hint}>No appointments found for this patient. Please create one first.</p>
                                )}
                            </div>

                            <div style={s.field}>
                                <label style={s.label}>Diagnosis <span style={s.req}>*</span></label>
                                <textarea
                                    name="diagnosis"
                                    value={formData.diagnosis}
                                    onChange={handleInputChange}
                                    rows="3"
                                    placeholder="Describe the diagnosis…"
                                    style={s.textarea}
                                    required
                                />
                            </div>

                            <div style={s.field}>
                                <label style={s.label}>Additional Notes</label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    rows="2"
                                    placeholder="Optional follow-up notes or instructions…"
                                    style={s.textarea}
                                />
                            </div>

                            <div style={s.modalFooter}>
                                <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Create Prescription</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Medicine Modal */}
            {showItemsForm && selectedPrescription && (
                <div style={s.backdrop} onClick={(e) => e.target === e.currentTarget && setShowItemsForm(false)}>
                    <div style={s.modal}>
                        <div style={s.modalHeader}>
                            <div>
                                <h2 style={s.modalTitle}>Add Medicine</h2>
                                <p style={s.modalSubtitle}>Prescription #{selectedPrescription.id}</p>
                            </div>
                            <button style={s.closeBtn} onClick={() => setShowItemsForm(false)}>✕</button>
                        </div>
                        <form onSubmit={handleAddItem}>
                            <div style={s.field}>
                                <label style={s.label}>Medicine Name <span style={s.req}>*</span></label>
                                <input type="text" name="medicine_name" value={itemData.medicine_name} onChange={handleItemChange} placeholder="e.g., Amoxicillin" style={s.input} required />
                            </div>

                            <div style={s.formGrid}>
                                <div style={s.field}>
                                    <label style={s.label}>Dosage <span style={s.req}>*</span></label>
                                    <input type="text" name="dosage" value={itemData.dosage} onChange={handleItemChange} placeholder="e.g., 500 mg" style={s.input} required />
                                </div>
                                <div style={s.field}>
                                    <label style={s.label}>Frequency</label>
                                    <input type="text" name="frequency" value={itemData.frequency} onChange={handleItemChange} placeholder="e.g., Twice daily" style={s.input} />
                                </div>
                            </div>

                            <div style={s.formGrid}>
                                <div style={s.field}>
                                    <label style={s.label}>Duration <span style={s.req}>*</span></label>
                                    <input type="text" name="duration" value={itemData.duration} onChange={handleItemChange} placeholder="e.g., 7 days" style={s.input} required />
                                </div>
                                <div style={s.field}>
                                    <label style={s.label}>Instructions</label>
                                    <input type="text" name="instructions" value={itemData.instructions} onChange={handleItemChange} placeholder="e.g., Take with food" style={s.input} />
                                </div>
                            </div>

                            <div style={s.modalFooter}>
                                <button type="button" className="btn-ghost" onClick={() => setShowItemsForm(false)}>Done</button>
                                <button type="submit" className="btn-primary">Add Medicine</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Table */}
            {prescriptions.length === 0 ? (
                <div style={s.empty}>
                    <div style={s.emptyIcon}>💊</div>
                    <p style={s.emptyTitle}>No prescriptions yet</p>
                    <p style={s.emptySub}>Create your first prescription to get started.</p>
                </div>
            ) : (
                <div style={s.tableWrap}>
                    <table style={s.table}>
                        <thead>
                            <tr>
                                {["ID", "Patient", "Doctor", "Diagnosis", "Medicines", "Date", "Actions"].map(h => (
                                    <th key={h} style={s.th}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {prescriptions.map((pres, i) => {
                                const doctor = resolveDoctor(pres);
                                const patient = resolvePatient(pres);
                                return (
                                <tr key={pres.id} style={{ backgroundColor: i % 2 === 0 ? "transparent" : "rgba(0,0,0,0.015)" }} className="table-row">
                                    <td style={s.td}>
                                        <span style={s.idBadge}>#{pres.id}</span>
                                    </td>
                                    <td style={s.td}>
                                        <div style={s.nameCell}>
                                            <div style={s.avatar}>
                                                {(patient?.first_name?.[0] || "?")}{(patient?.last_name?.[0] || "")}
                                            </div>
                                            <span>{patient ? `${patient.first_name} ${patient.last_name}` : "—"}</span>
                                        </div>
                                    </td>
                                    <td style={s.td}>
                                        <span style={s.doctorName}>
                                            {getDoctorName(doctor)}
                                        </span>
                                    </td>
                                    <td style={{ ...s.td, maxWidth: "220px" }}>
                                        <span style={s.diagnosisText} title={pres.diagnosis}>
                                            {pres.diagnosis?.length > 60
                                                ? pres.diagnosis.substring(0, 60) + "…"
                                                : pres.diagnosis}
                                        </span>
                                    </td>
                                    <td style={s.td}>
                                        {pres.items && pres.items.length > 0 ? (
                                            <div style={s.medList}>
                                                {pres.items.map((item, idx) => (
                                                    <span key={idx} style={s.medTag}>
                                                        {item.medicine_name}
                                                        {item.dosage && <span style={s.medDose}> · {item.dosage}</span>}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span style={s.noMed}>—</span>
                                        )}
                                    </td>
                                    <td style={s.td}>
                                        <span style={s.dateText}>{new Date(pres.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
                                    </td>
                                    <td style={s.td}>
                                        <div style={s.actions}>
                                            <button
                                                className="btn-outline-sm"
                                                onClick={() => { setSelectedPrescription(pres); setShowItemsForm(true); }}
                                            >
                                                + Medicine
                                            </button>
                                            <button
                                                className="btn-secondary-sm"
                                                onClick={() => window.open(`http://127.0.0.1:8000/api/pdf/${pres.id}/`, "_blank")}
                                            >
                                                Print
                                            </button>
                                            <button
                                                className="btn-danger-sm"
                                                onClick={() => deletePrescription(pres.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  * { box-sizing: border-box; }

  body { font-family: 'DM Sans', sans-serif; }

  .btn-primary {
    display: inline-flex; align-items: center; gap: 6px;
    background: #1a56db; color: #fff;
    border: none; border-radius: 8px;
    padding: 10px 20px; font-size: 14px; font-weight: 500;
    cursor: pointer; transition: background 0.15s, transform 0.1s;
    font-family: 'DM Sans', sans-serif;
  }
  .btn-primary:hover { background: #1648c0; }
  .btn-primary:active { transform: scale(0.98); }

  .btn-ghost {
    background: transparent; color: #6b7280;
    border: 1.5px solid #e5e7eb; border-radius: 8px;
    padding: 10px 20px; font-size: 14px; font-weight: 500;
    cursor: pointer; transition: all 0.15s;
    font-family: 'DM Sans', sans-serif;
  }
  .btn-ghost:hover { background: #f9fafb; color: #374151; }

  .btn-outline-sm {
    background: transparent; color: #1a56db;
    border: 1.5px solid #bfdbfe; border-radius: 6px;
    padding: 5px 11px; font-size: 12px; font-weight: 500;
    cursor: pointer; transition: all 0.15s; white-space: nowrap;
    font-family: 'DM Sans', sans-serif;
  }
  .btn-outline-sm:hover { background: #eff6ff; }

  .btn-danger-sm {
    background: transparent; color: #dc2626;
    border: 1.5px solid #fecaca; border-radius: 6px;
    padding: 5px 11px; font-size: 12px; font-weight: 500;
    cursor: pointer; transition: all 0.15s;
    font-family: 'DM Sans', sans-serif;
  }
  .btn-danger-sm:hover { background: #fef2f2; }

  .table-row { transition: background 0.1s; }
  .table-row:hover td { background: #f0f7ff !important; }

  input, select, textarea {
    font-family: 'DM Sans', sans-serif !important;
    font-size: 14px !important;
  }
`;

const s = {
    page: {
        padding: "32px 36px",
        fontFamily: "'DM Sans', sans-serif",
        background: "#f8fafc",
        minHeight: "100vh",
        color: "#111827",
    },
    topBar: {
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: "28px",
        flexWrap: "wrap", gap: "12px",
    },
    pageTitle: {
        fontSize: "26px", fontWeight: 700,
        color: "#0f172a", margin: 0,
    },
    pageSubtitle: {
        fontSize: "13px", color: "#6b7280", margin: 0,
    },
    btnIcon: { fontSize: "16px", lineHeight: 1 },

    alertError: {
        display: "flex", alignItems: "center", gap: "10px",
        background: "#fef2f2", border: "1.5px solid #fecaca",
        borderRadius: "10px", padding: "12px 16px",
        marginBottom: "24px", fontSize: "14px", color: "#b91c1c",
    },
    alertIcon: { fontSize: "15px" },
    alertClose: {
        marginLeft: "auto", background: "none", border: "none",
        color: "#b91c1c", cursor: "pointer", fontSize: "14px", padding: "0 4px",
    },

    loadingWrap: {
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", minHeight: "300px", gap: "16px",
    },
    spinner: {
        width: "36px", height: "36px",
        border: "3px solid #e5e7eb",
        borderTop: "3px solid #1a56db",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
    },
    loadingText: { fontSize: "14px", color: "#9ca3af", margin: 0 },

    // Modal
    backdrop: {
        position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
        backgroundColor: "rgba(15, 23, 42, 0.5)",
        backdropFilter: "blur(2px)",
        display: "flex", justifyContent: "center", alignItems: "center",
        zIndex: 1000, padding: "20px",
    },
    modal: {
        background: "#fff", borderRadius: "16px",
        width: "100%", maxWidth: "560px",
        maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        padding: "28px 32px",
    },
    modalHeader: {
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: "24px",
    },
    modalTitle: {
        fontSize: "20px", fontWeight: "600",
        color: "#0f172a", margin: "0 0 4px",
    },
    modalSubtitle: { fontSize: "13px", color: "#6b7280", margin: 0 },
    closeBtn: {
        background: "#f1f5f9", border: "none", borderRadius: "8px",
        width: "32px", height: "32px", cursor: "pointer",
        color: "#6b7280", fontSize: "14px", display: "flex",
        alignItems: "center", justifyContent: "center",
    },
    modalFooter: {
        display: "flex", gap: "10px", justifyContent: "flex-end",
        marginTop: "28px", paddingTop: "20px",
        borderTop: "1px solid #f1f5f9",
    },

    // Form
    formGrid: {
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px",
    },
    field: { marginBottom: "18px" },
    label: {
        display: "block", fontSize: "13px", fontWeight: "500",
        color: "#374151", marginBottom: "6px",
    },
    req: { color: "#dc2626" },
    input: {
        width: "100%", padding: "9px 12px",
        border: "1.5px solid #e5e7eb", borderRadius: "8px",
        fontSize: "14px", color: "#111827",
        outline: "none", transition: "border-color 0.15s",
        background: "#fff",
    },
    select: {
        width: "100%", padding: "9px 12px",
        border: "1.5px solid #e5e7eb", borderRadius: "8px",
        fontSize: "14px", color: "#111827",
        outline: "none", background: "#fff",
        cursor: "pointer",
    },
    textarea: {
        width: "100%", padding: "9px 12px",
        border: "1.5px solid #e5e7eb", borderRadius: "8px",
        fontSize: "14px", color: "#111827",
        outline: "none", resize: "vertical", background: "#fff",
        lineHeight: "1.5",
    },
    hint: {
        fontSize: "12px", color: "#dc2626",
        margin: "6px 0 0", lineHeight: "1.4",
    },

    // Table
    tableWrap: {
        background: "#fff",
        border: "1.5px solid #e5e7eb",
        borderRadius: "14px",
        overflow: "hidden",
    },
    table: {
        width: "100%", borderCollapse: "collapse",
        fontSize: "14px",
    },
    th: {
        padding: "13px 16px",
        background: "#f8fafc",
        borderBottom: "1.5px solid #e5e7eb",
        textAlign: "left", fontSize: "12px",
        fontWeight: "600", color: "#6b7280",
        letterSpacing: "0.5px", textTransform: "uppercase",
    },
    td: {
        padding: "13px 16px",
        borderBottom: "1px solid #f1f5f9",
        verticalAlign: "middle",
        color: "#374151",
    },

    // Cell content
    idBadge: {
        fontFamily: "'DM Mono', monospace",
        fontSize: "12px", fontWeight: "500",
        color: "#6b7280", background: "#f3f4f6",
        padding: "3px 8px", borderRadius: "5px",
    },
    nameCell: {
        display: "flex", alignItems: "center", gap: "10px",
    },
    avatar: {
        width: "32px", height: "32px", borderRadius: "50%",
        background: "#dbeafe", color: "#1d4ed8",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "11px", fontWeight: "600", flexShrink: 0,
        textTransform: "uppercase",
    },
    doctorName: { color: "#374151", fontWeight: "500" },
    diagnosisText: {
        display: "block", color: "#6b7280",
        lineHeight: "1.4", fontSize: "13px",
    },
    medList: {
        display: "flex", flexWrap: "wrap", gap: "5px",
    },
    medTag: {
        background: "#f0fdf4", color: "#15803d",
        border: "1px solid #bbf7d0",
        borderRadius: "5px", padding: "2px 8px",
        fontSize: "12px", fontWeight: "500",
    },
    medDose: { color: "#16a34a", fontWeight: "400" },
    noMed: { color: "#d1d5db", fontSize: "16px" },
    dateText: {
        fontFamily: "'DM Mono', monospace",
        fontSize: "12px", color: "#9ca3af",
    },
    actions: { display: "flex", gap: "6px", alignItems: "center" },

    // Empty state
    empty: {
        background: "#fff",
        border: "1.5px dashed #e5e7eb",
        borderRadius: "14px",
        padding: "64px 32px",
        textAlign: "center",
    },
    emptyIcon: { fontSize: "40px", marginBottom: "16px" },
    emptyTitle: {
        fontSize: "17px", fontWeight: "600",
        color: "#374151", margin: "0 0 8px",
    },
    emptySub: { fontSize: "14px", color: "#9ca3af", margin: 0 },
};

export default Prescriptions;

