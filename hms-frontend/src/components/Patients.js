import React, { useState, useEffect } from "react";
import API from "../api";

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');

  .patients-root * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  .patients-root {
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
    --shadow-sm: 0 1px 3px rgba(15,21,35,0.06), 0 1px 2px rgba(15,21,35,0.04);
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

  .patients-root input,
  .patients-root select,
  .patients-root textarea {
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

  .patients-root input:focus,
  .patients-root select:focus,
  .patients-root textarea:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(58,92,255,0.1);
  }

  .patients-root label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: var(--text-secondary);
    margin-bottom: 6px;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  .patients-root table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
  }

  .patients-root th {
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

  .patients-root th:first-child { border-radius: var(--radius-sm) 0 0 0; }
  .patients-root th:last-child { border-radius: 0 var(--radius-sm) 0 0; }

  .patients-root td {
    padding: 14px 16px;
    font-size: 14px;
    color: var(--text-primary);
    border-bottom: 1px solid var(--border);
    vertical-align: middle;
  }

  .patients-root tr:last-child td { border-bottom: none; }

  .patients-root tbody tr {
    transition: background 0.14s;
  }

  .patients-root tbody tr:hover {
    background: var(--accent-light);
  }

  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: var(--radius-sm);
    padding: 10px 20px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.18s, transform 0.12s, box-shadow 0.18s;
    box-shadow: 0 2px 8px rgba(58,92,255,0.25);
  }

  .btn-primary:hover {
    background: var(--accent-hover);
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(58,92,255,0.35);
  }

  .btn-save {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: var(--green);
    color: white;
    border: none;
    border-radius: var(--radius-sm);
    padding: 10px 22px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.18s, transform 0.12s;
    box-shadow: 0 2px 8px rgba(0,176,122,0.25);
  }

  .btn-save:hover {
    background: #009968;
    transform: translateY(-1px);
  }

  .btn-cancel {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: var(--surface2);
    color: var(--text-secondary);
    border: 1.5px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 10px 22px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.18s, border-color 0.18s;
  }

  .btn-cancel:hover {
    background: #e4e7f0;
    border-color: #c8cee0;
  }

  .btn-edit {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: var(--accent-light);
    color: var(--accent);
    border: none;
    border-radius: 6px;
    padding: 6px 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.14s;
    margin-right: 6px;
  }

  .btn-edit:hover { background: #dce3ff; }

  .btn-delete {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: var(--red-light);
    color: var(--red);
    border: none;
    border-radius: 6px;
    padding: 6px 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.14s;
  }

  .btn-delete:hover { background: #f9c8d0; }

  /* Modal backdrop */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(10,15,30,0.55);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .modal-box {
    background: var(--surface);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    width: 90%;
    max-width: 820px;
    max-height: 88vh;
    overflow-y: auto;
    animation: slideUp 0.25s cubic-bezier(.16,1,.3,1);
  }

  @keyframes slideUp {
    from { transform: translateY(24px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px 28px 20px;
    border-bottom: 1.5px solid var(--border);
  }

  .modal-title {
    font-size: 20px;
    font-weight: 800;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .modal-close {
    width: 32px; height: 32px;
    display: flex; align-items: center; justify-content: center;
    background: var(--surface2);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    color: var(--text-secondary);
    font-size: 16px;
    transition: background 0.14s;
  }

  .modal-close:hover { background: var(--border); }

  .modal-body { padding: 24px 28px; }

  .form-section {
    margin-bottom: 22px;
  }

  .form-section-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .form-section-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .form-grid .full-width {
    grid-column: span 2;
  }

  .field-group { display: flex; flex-direction: column; }

  .modal-footer {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    padding: 20px 28px 24px;
    border-top: 1.5px solid var(--border);
  }

  /* Badge styles */
  .badge {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
  }

  .badge-blood {
    background: var(--red-light);
    color: var(--red);
  }

  .badge-doctor {
    background: var(--accent-light);
    color: var(--accent);
  }

  .badge-disease {
    background: var(--amber-light);
    color: #92400e;
  }

  .empty-state {
    text-align: center;
    padding: 60px 20px;
    color: var(--text-muted);
  }

  .empty-state-icon {
    font-size: 48px;
    margin-bottom: 12px;
    opacity: 0.5;
  }

  .empty-state p {
    font-size: 15px;
    font-weight: 500;
  }

  .error-alert {
    background: var(--red-light);
    color: #9b1e31;
    border: 1.5px solid #f5a6b2;
    border-radius: var(--radius-sm);
    padding: 12px 16px;
    margin-bottom: 20px;
    font-size: 13.5px;
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }

  .loading-screen {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    height: 100vh;
    font-size: 15px;
    color: var(--text-secondary);
    font-family: 'DM Sans', sans-serif;
  }

  .spinner {
    width: 20px; height: 20px;
    border: 2.5px solid var(--border);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .patient-id {
    font-size: 12px;
    font-weight: 700;
    color: var(--text-muted);
    font-variant-numeric: tabular-nums;
  }

  .patient-name {
    font-weight: 600;
    color: var(--text-primary);
  }

  .patient-email {
    font-size: 13px;
    color: var(--text-secondary);
  }
`;

function Patients() {
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingPatient, setEditingPatient] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        date_of_birth: "",
        gender: "M",
        address: "",
        emergency_contact: "",
        disease: "",
        doctor_assigned: "",
        blood_group: "A+",
        admission_date: "",
        discharge_date: ""
    });

    useEffect(() => {
        fetchPatients();
        fetchDoctors();
    }, []);

    const fetchPatients = async () => {
        try {
            const response = await API.get("patients/");
            setPatients(response.data);
        } catch (error) {
            console.error("Error fetching patients:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDoctors = async () => {
        try {
            const response = await API.get("doctors/");
            setDoctors(response.data);
        } catch (error) {
            console.error("Error fetching doctors:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const emptyForm = {
        first_name: "", last_name: "", email: "", phone: "",
        date_of_birth: "", gender: "M", address: "",
        emergency_contact: "", disease: "", doctor_assigned: "",
        blood_group: "A+", admission_date: "", discharge_date: ""
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        const dataToSend = {
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            phone: formData.phone,
            date_of_birth: formData.date_of_birth || null,
            gender: formData.gender,
            address: formData.address || "",
            emergency_contact: formData.emergency_contact || "",
            disease: formData.disease || "",
            doctor_assigned: formData.doctor_assigned ? parseInt(formData.doctor_assigned) : null,
            blood_group: formData.blood_group || "A+",
            admission_date: formData.admission_date || null,
            discharge_date: formData.discharge_date || null
        };

        try {
            if (editingPatient) {
                await API.put(`patients/${editingPatient.id}/`, dataToSend);
                alert("Patient updated successfully!");
            } else {
                await API.post("patients/", dataToSend);
                alert("Patient added successfully!");
            }
            setShowForm(false);
            setEditingPatient(null);
            setFormData(emptyForm);
            fetchPatients();
        } catch (error) {
            console.error("Error:", error);
            if (error.response) {
                setErrorMessage(`Error: ${JSON.stringify(error.response.data)}`);
            } else {
                setErrorMessage("Error saving patient. Check if Django server is running.");
            }
        }
    };

    const handleEdit = (patient) => {
        setEditingPatient(patient);
        setFormData({
            first_name: patient.first_name,
            last_name: patient.last_name,
            email: patient.email,
            phone: patient.phone,
            date_of_birth: patient.date_of_birth || "",
            gender: patient.gender,
            address: patient.address || "",
            emergency_contact: patient.emergency_contact || "",
            disease: patient.disease || "",
            doctor_assigned: patient.doctor_assigned || "",
            blood_group: patient.blood_group || "A+",
            admission_date: patient.admission_date || "",
            discharge_date: patient.discharge_date || ""
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this patient?")) {
            try {
                await API.delete(`patients/${id}/`);
                alert("Patient deleted successfully!");
                fetchPatients();
            } catch (error) {
                alert("Error deleting patient.");
            }
        }
    };

    const handleDownloadReport = async (patientId) => {
        try {
            const response = await API.get(`reports/patients/${patientId}/`, { responseType: "blob" });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `patient_${patientId}_report.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading report:", error);
            alert("Error downloading patient report.");
        }
    };

    if (loading) {
        return (
            <>
                <style>{globalStyles}</style>
                <div className="patients-root">
                    <div className="loading-screen">
                        <div className="spinner"></div>
                        Loading patients...
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <style>{globalStyles}</style>
            <div className="patients-root" style={{ padding: "32px 36px" }}>

                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
                    <div>
                        <h1 style={{ fontSize: "26px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
                            Patient Registry
                        </h1>
                        <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                            {patients.length} patient{patients.length !== 1 ? "s" : ""} on record
                        </p>
                    </div>
                    <button
                        className="btn-primary"
                        onClick={() => {
                            setEditingPatient(null);
                            setErrorMessage("");
                            setFormData(emptyForm);
                            setShowForm(true);
                        }}
                    >
                        <span style={{ fontSize: "18px", lineHeight: 1 }}>+</span>
                        Add New Patient
                    </button>
                </div>

                {/* Error */}
                {errorMessage && (
                    <div className="error-alert">
                        <span>⚠️</span>
                        <span><strong>Error:</strong> {errorMessage}</span>
                    </div>
                )}

                {/* Modal */}
                {showForm && (
                    <div className="modal-backdrop">
                        <div className="modal-box">
                            <div className="modal-header">
                                <div className="modal-title">
                                    <span>{editingPatient ? "✏️" : "👤"}</span>
                                    {editingPatient ? "Edit Patient" : "Register New Patient"}
                                </div>
                                <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">

                                    {/* Personal Info */}
                                    <div className="form-section">
                                        <div className="form-section-label">Personal Information</div>
                                        <div className="form-grid">
                                            <div className="field-group">
                                                <label>First Name *</label>
                                                <input type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} required placeholder="e.g. John" />
                                            </div>
                                            <div className="field-group">
                                                <label>Last Name *</label>
                                                <input type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} required placeholder="e.g. Smith" />
                                            </div>
                                            <div className="field-group">
                                                <label>Email *</label>
                                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="patient@email.com" />
                                            </div>
                                            <div className="field-group">
                                                <label>Phone *</label>
                                                <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} required placeholder="+1 234 567 890" />
                                            </div>
                                            <div className="field-group">
                                                <label>Date of Birth</label>
                                                <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleInputChange} />
                                            </div>
                                            <div className="field-group">
                                                <label>Gender</label>
                                                <select name="gender" value={formData.gender} onChange={handleInputChange}>
                                                    <option value="M">Male</option>
                                                    <option value="F">Female</option>
                                                    <option value="O">Other</option>
                                                </select>
                                            </div>
                                            <div className="field-group full-width">
                                                <label>Address</label>
                                                <textarea name="address" value={formData.address} onChange={handleInputChange} rows="2" placeholder="Street, City, State, ZIP" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Medical Info */}
                                    <div className="form-section">
                                        <div className="form-section-label">Medical Information</div>
                                        <div className="form-grid">
                                            <div className="field-group">
                                                <label>Blood Group</label>
                                                <select name="blood_group" value={formData.blood_group} onChange={handleInputChange}>
                                                    {["A+","A-","B+","B-","O+","O-","AB+","AB-"].map(bg => (
                                                        <option key={bg} value={bg}>{bg}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="field-group">
                                                <label>Assigned Doctor</label>
                                                <select name="doctor_assigned" value={formData.doctor_assigned} onChange={handleInputChange}>
                                                    <option value="">— Select Doctor —</option>
                                                    {doctors.map((doctor) => (
                                                        <option key={doctor.id} value={doctor.id}>
                                                            Dr. {doctor.first_name} {doctor.last_name} — {doctor.specialization}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="field-group">
                                                <label>Disease / Condition</label>
                                                <input type="text" name="disease" value={formData.disease} onChange={handleInputChange} placeholder="Primary diagnosis" />
                                            </div>
                                            <div className="field-group">
                                                <label>Emergency Contact</label>
                                                <input type="text" name="emergency_contact" value={formData.emergency_contact} onChange={handleInputChange} placeholder="Name or phone number" />
                                            </div>
                                            <div className="field-group">
                                                <label>Admission Date</label>
                                                <input type="date" name="admission_date" value={formData.admission_date} onChange={handleInputChange} />
                                            </div>
                                            <div className="field-group">
                                                <label>Discharge Date</label>
                                                <input type="date" name="discharge_date" value={formData.discharge_date} onChange={handleInputChange} />
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                                    <button type="submit" className="btn-save">
                                        {editingPatient ? "💾 Update Patient" : "✅ Save Patient"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Table */}
                <div style={{ background: "var(--surface)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-md)", border: "1.5px solid var(--border)", overflow: "hidden" }}>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Patient</th>
                                <th>Phone</th>
                                <th>Blood</th>
                                <th>Condition</th>
                                <th>Doctor</th>
                                <th style={{ textAlign: "right" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patients.length === 0 ? (
                                <tr>
                                    <td colSpan="7">
                                        <div className="empty-state">
                                            <div className="empty-state-icon">🏥</div>
                                            <p>No patients found. Click <strong>"Add New Patient"</strong> to get started.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                patients.map((patient) => (
                                    <tr key={patient.id}>
                                        <td>
                                            <span className="patient-id">#{String(patient.id).padStart(4, "0")}</span>
                                        </td>
                                        <td>
                                            <div className="patient-name">{patient.first_name} {patient.last_name}</div>
                                            <div className="patient-email">{patient.email}</div>
                                        </td>
                                        <td style={{ color: "var(--text-secondary)", fontSize: "13.5px" }}>{patient.phone}</td>
                                        <td>
                                            {patient.blood_group
                                                ? <span className="badge badge-blood">{patient.blood_group}</span>
                                                : <span style={{ color: "var(--text-muted)" }}>—</span>}
                                        </td>
                                        <td>
                                            {patient.disease
                                                ? <span className="badge badge-disease">{patient.disease}</span>
                                                : <span style={{ color: "var(--text-muted)" }}>—</span>}
                                        </td>
                                        <td>
                                            {patient.doctor_assigned
                                                ? <span className="badge badge-doctor">Dr. {patient.doctor_assigned}</span>
                                                : <span style={{ color: "var(--text-muted)" }}>Unassigned</span>}
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                            <button className="btn-edit" onClick={() => handleDownloadReport(patient.id)}>Report</button><button className="btn-edit" onClick={() => handleEdit(patient)}>✏️ Edit</button>
                                            <button className="btn-delete" onClick={() => handleDelete(patient.id)}>🗑 Delete</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer count */}
                {patients.length > 0 && (
                    <p style={{ marginTop: "14px", fontSize: "12.5px", color: "var(--text-muted)", textAlign: "right" }}>
                        Showing {patients.length} patient{patients.length !== 1 ? "s" : ""}
                    </p>
                )}
            </div>
        </>
    );
}

export default Patients;



