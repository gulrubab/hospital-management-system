import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { FaUserInjured, FaUserMd, FaCalendarCheck, FaClock, FaRupeeSign } from "react-icons/fa";

function Dashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total_patients: 0,
        total_doctors: 0,
        total_appointments: 0,
        today_appointments: 0,
        total_revenue: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchDashboardData(); }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await API.get("dashboard/stats/");
            setStats(response.data);
        } catch (error) {
            console.error("Dashboard Error:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={s.loadingScreen}>
                <div style={s.spinner} />
                <p style={s.loadingText}>Loading Dashboard...</p>
            </div>
        );
    }

    const cards = [
        {
            title: "Total Patients",
            value: stats.total_patients,
            icon: <FaUserInjured />,
            accent: "#1d9e75",
            bg: "#e6faf3",
            border: "#6ee7b7",
            sub: "Registered patients",
            path: "/patients",
        },
        {
            title: "Total Doctors",
            value: stats.total_doctors,
            icon: <FaUserMd />,
            accent: "#1d4ed8",
            bg: "#e6f4ff",
            border: "#93c5fd",
            sub: "Active medical staff",
            path: "/doctors",
        },
        {
            title: "Total Appointments",
            value: stats.total_appointments,
            icon: <FaCalendarCheck />,
            accent: "#b45309",
            bg: "#fff7e6",
            border: "#fcd34d",
            sub: "All time bookings",
            path: "/appointments",
        },
        {
            title: "Today's Appointments",
            value: stats.today_appointments,
            icon: <FaClock />,
            accent: "#7c3aed",
            bg: "#f5f0ff",
            border: "#c4b5fd",
            sub: "Scheduled for today",
            path: "/appointments",
        },
        {
            title: "Total Revenue",
            value: `Rs ${stats.total_revenue.toLocaleString()}`,
            icon: <FaRupeeSign />,
            accent: "#be185d",
            bg: "#fff0f6",
            border: "#f9a8d4",
            sub: "From paid bills",
            path: "/billing",
        },
    ];

    const today = new Date().toLocaleDateString("en-PK", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
    });

    return (
        <div style={s.page}>

            {/* ── Page Header ── */}
            <div style={s.header}>
                <div>
                    <div style={s.badge}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                            stroke="#1d9e75" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        </svg>
                        Overview
                    </div>
                    <h1 style={s.pageTitle}>Hospital Dashboard</h1>
                    <p style={s.pageSub}>{today}</p>
                </div>

                <button
                    onClick={fetchDashboardData}
                    style={s.refreshBtn}
                    onMouseEnter={e => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.borderColor = "#94a3b8"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="23 4 23 10 17 10"/>
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                    </svg>
                    Refresh
                </button>
            </div>

            {/* ── Stat Cards ── */}
            <div style={s.grid}>
                {cards.map((card, index) => (
                    <div
                        key={index}
                        style={{ ...s.card, cursor: "pointer" }}
                        onClick={() => navigate(card.path)}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = "translateY(-4px)";
                            e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.10)";
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 1px 6px rgba(0,0,0,0.07)";
                        }}
                    >
                        {/* Top accent bar */}
                        <div style={{ ...s.cardBar, background: card.accent }} />

                        <div style={s.cardInner}>
                            {/* Icon */}
                            <div style={{ ...s.iconWrap, background: card.bg, border: `1px solid ${card.border}` }}>
                                <span style={{ ...s.iconEl, color: card.accent }}>{card.icon}</span>
                            </div>

                            {/* Text */}
                            <div style={s.cardText}>
                                <p style={s.cardTitle}>{card.title}</p>
                                <p style={{ ...s.cardValue, color: card.accent }}>{card.value}</p>
                                <p style={s.cardSub}>{card.sub}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Quick Info Row ── */}
            <div style={s.infoRow}>
                <div style={s.infoCard}>
                    <p style={s.infoLabel}>Doctors per Patient</p>
                    <p style={s.infoValue}>
                        {stats.total_patients > 0
                            ? (stats.total_doctors / stats.total_patients).toFixed(2)
                            : "—"}
                    </p>
                </div>
                <div style={s.infoCard}>
                    <p style={s.infoLabel}>Avg. Revenue / Patient</p>
                    <p style={s.infoValue}>
                        {stats.total_patients > 0
                            ? `Rs ${(stats.total_revenue / stats.total_patients).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                            : "—"}
                    </p>
                </div>
                <div style={s.infoCard}>
                    <p style={s.infoLabel}>Today vs Total Appointments</p>
                    <p style={s.infoValue}>
                        {stats.total_appointments > 0
                            ? `${((stats.today_appointments / stats.total_appointments) * 100).toFixed(1)}%`
                            : "—"}
                    </p>
                </div>
                <div style={{ ...s.infoCard, borderTop: "3px solid #1d9e75" }}>
                    <p style={s.infoLabel}>System Status</p>
                    <p style={{ ...s.infoValue, color: "#1d9e75", fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#1d9e75", display: "inline-block" }} />
                        All Systems Operational
                    </p>
                </div>
            </div>
        </div>
    );
}

const s = {
    page: {
        padding: "28px 32px",
        background: "#f8fafc",
        minHeight: "100vh",
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    },

    loadingScreen: {
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", minHeight: "100vh",
    },
    spinner: {
        width: 36, height: 36,
        border: "3px solid #e2e8f0",
        borderTop: "3px solid #1d9e75",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
    },
    loadingText: { color: "#64748b", marginTop: 14, fontSize: 14 },

    // Header
    header: {
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: 32,
    },
    badge: {
        display: "inline-flex", alignItems: "center", gap: 6,
        fontSize: 11, fontWeight: 500, letterSpacing: "0.07em",
        textTransform: "uppercase", color: "#1d9e75",
        background: "rgba(29,158,117,0.09)", padding: "4px 10px",
        borderRadius: 20, marginBottom: 10,
    },
    pageTitle: { fontSize: 26, fontWeight: 700, color: "#0f172a", margin: 0 },
    pageSub: { fontSize: 13, color: "#94a3b8", marginTop: 4 },
    refreshBtn: {
        display: "flex", alignItems: "center", gap: 8,
        background: "#fff", color: "#64748b",
        border: "1px solid #e2e8f0", borderRadius: 8,
        padding: "9px 16px", fontSize: 13, fontWeight: 500,
        cursor: "pointer", transition: "background 0.15s, border-color 0.15s",
    },

    // Stat grid
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 20, marginBottom: 28,
    },
    card: {
        background: "#fff", borderRadius: 12, overflow: "hidden",
        boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
        cursor: "pointer",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
    },
    cardBar: { height: 4, width: "100%" },
    cardInner: {
        padding: "20px 22px",
        display: "flex", alignItems: "center", gap: 18,
    },
    iconWrap: {
        width: 52, height: 52, borderRadius: 12, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
    },
    iconEl: { fontSize: 22, display: "flex" },
    cardText: { flex: 1 },
    cardTitle: { fontSize: 12, color: "#94a3b8", margin: 0, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" },
    cardValue: { fontSize: 26, fontWeight: 700, margin: "4px 0 2px", lineHeight: 1.1 },
    cardSub: { fontSize: 11, color: "#cbd5e1", margin: 0 },

    // Info row
    infoRow: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 16,
    },
    infoCard: {
        background: "#fff", borderRadius: 10, padding: "18px 20px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        borderTop: "3px solid #e2e8f0",
    },
    infoLabel: { fontSize: 11, color: "#94a3b8", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 },
    infoValue: { fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 },
};

export default Dashboard;




