import React, { useState, useEffect } from "react";
import API from "../api";

function LabReports() {
    const [labReports, setLabReports] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [formData, setFormData] = useState({
        patient: "",
        doctor: "",
        test_name: "",
        result_summary: "",
        test_date: "",
        status: "Pending",
        result_file: null
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [labRes, patRes, docRes] = await Promise.all([
                API.get("lab-reports/"),
                API.get("patients/"),
                API.get("doctors/")
            ]);
            setLabReports(labRes.data);
            setPatients(patRes.data);
            setDoctors(docRes.data);
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

    const handleFileChange = (e) => {
        setFormData({ ...formData, result_file: e.target.files[0] });
    };

    const resolveDoctor = (report) => {
        if (report.doctor && typeof report.doctor === "object") return report.doctor;
        const id = typeof report.doctor === "number" ? report.doctor : parseInt(report.doctor);
        return doctors.find(d => d.id === id) || null;
    };

    const getDoctorName = (doctor) => {
        if (!doctor) return "—";
        if (doctor.name) return `Dr. ${doctor.name}`;
        if (doctor.first_name) return `Dr. ${doctor.first_name} ${doctor.last_name}`;
        return "—";
    };

    const resolvePatient = (report) => {
        if (report.patient && typeof report.patient === "object") return report.patient;
        const id = typeof report.patient === "number" ? report.patient : parseInt(report.patient);
        return patients.find(p => p.id === id) || null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        if (!formData.patient) return setErrorMessage("Please select a patient");
        if (!formData.doctor) return setErrorMessage("Please select a doctor");
        if (!formData.test_name) return setErrorMessage("Please enter a test name");
        if (!formData.test_date) return setErrorMessage("Please select a test date");

        const data = new FormData();
        data.append("patient", formData.patient);
        data.append("doctor", formData.doctor);
        data.append("test_name", formData.test_name);
        data.append("result_summary", formData.result_summary);
        data.append("test_date", formData.test_date);
        data.append("status", formData.status);
        if (formData.result_file) {
            data.append("result_file", formData.result_file);
        }

        try {
            await API.post("lab-reports/", data, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setShowForm(false);
            setFormData({
                patient: "", doctor: "", test_name: "",
                result_summary: "", test_date: "", status: "Pending", result_file: null
            });
            fetchData();
        } catch (error) {
            if (error.response) {
                setErrorMessage(`Error: ${JSON.stringify(error.response.data)}`);
            } else {
                setErrorMessage("Error creating lab report. Make sure the server is running.");
            }
        }
    };

    const deleteReport = async (id) => {
        if (window.confirm("Are you sure you want to delete this lab report?")) {
            try {
                await API.delete(`lab-reports/${id}/`);
                fetchData();
            } catch {
                alert("Error deleting lab report");
            }
        }
    };

    if (loading) {
        return (
            <div style={s.loadingWrap}>
                <div style={s.spinner} />
                <p style={s.loadingText}>Loading lab reports…</p>
            </div>
        );
    }

    return (
        <div style={s.page}>
            <style>{css}</style>

            <div style={s.topBar}>
                <div>
                    <h1 style={s.pageTitle}>Lab Reports</h1>
                    <p style={s.pageSubtitle}>{labReports.length} report{labReports.length !== 1 ? "s" : ""} on file</p>
                </div>
                <button className="btn-primary" onClick={() => setShowForm(true)}>
                    <span style={s.btnIcon}>+</span> New Lab Report
                </button>
            </div>

            {errorMessage && (
                <div style={s.alertError}>
                    <span style={s.alertIcon}>⚠</span>
                    <span>{errorMessage}</span>
                    <button style={s.alertClose} onClick={() => setErrorMessage("")}>✕</button>
                </div>
            )}

            {showForm && (
                <div style={s.backdrop} onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
                    <div style={s.modal}>
                        <div style={s.modalHeader}>
                            <div>
                                <h2 style={s.modalTitle}>New Lab Report</h2>
                                <p style={s.modalSubtitle}>Fill in the test details below</p>
                            </div>
                            <button style={s.closeBtn} onClick={() => setShowForm(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div style={s.formGrid}>
                                <div style={s.field}>
                                    <label style={s.label}>Patient <span style={s.req}>*</span></label>
                                    <select name="patient" value={formData.patient} onChange={handleInputChange} style={s.select} required>
                                        <option value="">Select patient…</option>
                                        {patients.map(p => (
                                            <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={s.field}>
                                    <label style={s.label}>Doctor <span style={s.req}>*</span></label>
                                    <select name="doctor" value={formData.doctor} onChange={handleInputChange} style={s.select} required>
                                        <option value="">Select doctor…</option>
                                        {doctors.map(d => (
                                            <option key={d.id} value={d.id}>{d.name ? `Dr. ${d.name}` : `Dr. ${d.first_name} ${d.last_name}`}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={s.field}>
                                <label style={s.label}>Test Name <span style={s.req}>*</span></label>
                                <input type="text" name="test_name" value={formData.test_name} onChange={handleInputChange} placeholder="e.g., Complete Blood Count" style={s.input} required />
                            </div>

                            <div style={s.formGrid}>
                                <div style={s.field}>
                                    <label style={s.label}>Test Date <span style={s.req}>*</span></label>
                                    <input type="date" name="test_date" value={formData.test_date} onChange={handleInputChange} style={s.input} required />
                                </div>
                                <div style={s.field}>
                                    <label style={s.label}>Status</label>
                                    <select name="status" value={formData.status} onChange={handleInputChange} style={s.select}>
                                        <option value="Pending">Pending</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </div>
                            </div>

                            <div style={s.field}>
                                <label style={s.label}>Result Summary</label>
                                <textarea name="result_summary" value={formData.result_summary} onChange={handleInputChange} rows="3" placeholder="Describe the findings…" style={s.textarea} />
                            </div>

                            <div style={s.field}>
                                <label style={s.label}>Upload Result File (PDF/Image)</label>
                                <input type="file" onChange={handleFileChange} style={s.input} accept=".pdf,.jpg,.jpeg,.png" />
                            </div>

                            <div style={s.modalFooter}>
                                <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Save Lab Report</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {labReports.length === 0 ? (
                <div style={s.empty}>
                    <div style={s.emptyIcon}>🧪</div>
                    <p style={s.emptyTitle}>No lab reports yet</p>
                    <p style={s.emptySub}>Create your first lab report to get started.</p>
                </div>
            ) : (
                <div style={s.tableWrap}>
                    <table style={s.table}>
                        <thead>
                            <tr>
                                {["ID", "Patient", "Doctor", "Test", "Status", "Date", "File", "Actions"].map(h => (
                                    <th key={h} style={s.th}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {labReports.map((report, i) => {
                                const doctor = resolveDoctor(report);
                                const patient = resolvePatient(report);
                                return (
                                    <tr key={report.id} style={{ backgroundColor: i % 2 === 0 ? "transparent" : "rgba(0,0,0,0.015)" }} className="table-row">
                                        <td style={s.td}><span style={s.idBadge}>#{report.id}</span></td>
                                        <td style={s.td}>
                                            <div style={s.nameCell}>
                                                <div style={s.avatar}>
                                                    {(patient?.first_name?.[0] || "?")}{(patient?.last_name?.[0] || "")}
                                                </div>
                                                <span>{patient ? `${patient.first_name} ${patient.last_name}` : "—"}</span>
                                            </div>
                                        </td>
                                        <td style={s.td}><span style={s.doctorName}>{getDoctorName(doctor)}</span></td>
                                        <td style={s.td}>{report.test_name}</td>
                                        <td style={s.td}>
                                            <span style={{
                                                ...s.statusTag,
                                                background: report.status === "Completed" ? "#f0fdf4" : "#fffbeb",
                                                color: report.status === "Completed" ? "#15803d" : "#b45309",
                                                border: `1px solid ${report.status === "Completed" ? "#bbf7d0" : "#fde68a"}`
                                            }}>
                                                {report.status}
                                            </span>
                                        </td>
                                        <td style={s.td}><span style={s.dateText}>{report.test_date}</span></td>
                                        <td style={s.td}>
                                            {report.result_file ? (
                                                <a href={report.result_file} target="_blank" rel="noopener noreferrer" style={s.fileLink}>View</a>
                                            ) : (
                                                <span style={s.noMed}>—</span>
                                            )}
                                        </td>
                                        <td style={s.td}>
                                            <button className="btn-danger-sm" onClick={() => deleteReport(report.id)}>Delete</button>
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
  * { box-sizing: border-box; }
  .btn-primary {
    display: inline-flex; align-items: center; gap: 6px;
    background: #1a56db; color: #fff;
    border: none; border-radius: 8px;
    padding: 10px 20px; font-size: 14px; font-weight: 500;
    cursor: pointer; transition: background 0.15s, transform 0.1s;
  }
  .btn-primary:hover { background: #1648c0; }
  .btn-primary:active { transform: scale(0.98); }
  .btn-ghost {
    background: transparent; color: #6b7280;
    border: 1.5px solid #e5e7eb; border-radius: 8px;
    padding: 10px 20px; font-size: 14px; font-weight: 500;
    cursor: pointer; transition: all 0.15s;
  }
  .btn-ghost:hover { background: #f9fafb; color: #374151; }
  .btn-danger-sm {
    background: transparent; color: #dc2626;
    border: 1.5px solid #fecaca; border-radius: 6px;
    padding: 5px 11px; font-size: 12px; font-weight: 500;
    cursor: pointer; transition: all 0.15s;
  }
  .btn-danger-sm:hover { background: #fef2f2; }
  .table-row { transition: background 0.1s; }
  .table-row:hover td { background: #f0f7ff !important; }
`;

const s = {
    page: { padding: "32px 36px", fontFamily: "'DM Sans', sans-serif", background: "#f8fafc", minHeight: "100vh", color: "#111827" },
    topBar: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", flexWrap: "wrap", gap: "12px" },
    pageTitle: { fontSize: "26px", fontWeight: 700, color: "#0f172a", margin: 0 },
    pageSubtitle: { fontSize: "13px", color: "#6b7280", margin: 0 },
    btnIcon: { fontSize: "16px", lineHeight: 1 },
    alertError: { display: "flex", alignItems: "center", gap: "10px", background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: "10px", padding: "12px 16px", marginBottom: "24px", fontSize: "14px", color: "#b91c1c" },
    alertIcon: { fontSize: "15px" },
    alertClose: { marginLeft: "auto", background: "none", border: "none", color: "#b91c1c", cursor: "pointer", fontSize: "14px", padding: "0 4px" },
    loadingWrap: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "300px", gap: "16px" },
    spinner: { width: "36px", height: "36px", border: "3px solid #e5e7eb", borderTop: "3px solid #1a56db", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
    loadingText: { fontSize: "14px", color: "#9ca3af", margin: 0 },
    backdrop: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(15, 23, 42, 0.5)", backdropFilter: "blur(2px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "20px" },
    modal: { background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "560px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", padding: "28px 32px" },
    modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" },
    modalTitle: { fontSize: "20px", fontWeight: "600", color: "#0f172a", margin: "0 0 4px" },
    modalSubtitle: { fontSize: "13px", color: "#6b7280", margin: 0 },
    closeBtn: { background: "#f1f5f9", border: "none", borderRadius: "8px", width: "32px", height: "32px", cursor: "pointer", color: "#6b7280", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center" },
    modalFooter: { display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "28px", paddingTop: "20px", borderTop: "1px solid #f1f5f9" },
    formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
    field: { marginBottom: "18px" },
    label: { display: "block", fontSize: "13px", fontWeight: "500", color: "#374151", marginBottom: "6px" },
    req: { color: "#dc2626" },
    input: { width: "100%", padding: "9px 12px", border: "1.5px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", color: "#111827", outline: "none", background: "#fff" },
    select: { width: "100%", padding: "9px 12px", border: "1.5px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", color: "#111827", outline: "none", background: "#fff", cursor: "pointer" },
    textarea: { width: "100%", padding: "9px 12px", border: "1.5px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", color: "#111827", outline: "none", resize: "vertical", background: "#fff", lineHeight: "1.5" },
    tableWrap: { background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: "14px", overflow: "hidden" },
    table: { width: "100%", borderCollapse: "collapse", fontSize: "14px" },
    th: { padding: "13px 16px", background: "#f8fafc", borderBottom: "1.5px solid #e5e7eb", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#6b7280", letterSpacing: "0.5px", textTransform: "uppercase" },
    td: { padding: "13px 16px", borderBottom: "1px solid #f1f5f9", verticalAlign: "middle", color: "#374151" },
    idBadge: { fontFamily: "monospace", fontSize: "12px", fontWeight: "500", color: "#6b7280", background: "#f3f4f6", padding: "3px 8px", borderRadius: "5px" },
    nameCell: { display: "flex", alignItems: "center", gap: "10px" },
    avatar: { width: "32px", height: "32px", borderRadius: "50%", background: "#dbeafe", color: "#1d4ed8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "600", flexShrink: 0, textTransform: "uppercase" },
    doctorName: { color: "#374151", fontWeight: "500" },
    statusTag: { fontSize: "12px", fontWeight: "500", padding: "3px 9px", borderRadius: "6px" },
    dateText: { fontFamily: "monospace", fontSize: "12px", color: "#6b7280" },
    fileLink: { color: "#1a56db", fontSize: "13px", fontWeight: "500", textDecoration: "none" },
    noMed: { color: "#d1d5db", fontSize: "16px" },
    empty: { background: "#fff", border: "1.5px dashed #e5e7eb", borderRadius: "14px", padding: "64px 32px", textAlign: "center" },
    emptyIcon: { fontSize: "40px", marginBottom: "16px" },
    emptyTitle: { fontSize: "17px", fontWeight: "600", color: "#374151", margin: "0 0 8px" },
    emptySub: { fontSize: "14px", color: "#9ca3af", margin: 0 },
};

export default LabReports;
