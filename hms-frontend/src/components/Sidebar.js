import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const NAV_ITEMS = [
    {
        to: "/dashboard",
        label: "Dashboard",
        icon: (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
        ),
    },
    {
        to: "/patients",
        label: "Patients",
        icon: (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
        ),
    },
    {
        to: "/doctors",
        label: "Doctors",
        icon: (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a5 5 0 1 0 0 10A5 5 0 0 0 12 2z"/>
                <path d="M12 14c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z"/>
                <line x1="12" y1="18" x2="12" y2="22"/><line x1="10" y1="20" x2="14" y2="20"/>
            </svg>
        ),
    },
    {
        to: "/appointments",
        label: "Appointments",
        icon: (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
        ),
    },
    {
        to: "/prescriptions",
        label: "Prescriptions",
        icon: (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
            </svg>
        ),
    },
    {
        to: "/billing",
        label: "Billing",
        icon: (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
        ),
    },
    {
        to: "/pharmacy",
        label: "Pharmacy",
        icon: (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3h18v18H3z"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
        ),
    },    {
        to: "/lab-reports",
        label: "Lab Reports",
        icon: (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 2v6l-5 10a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3L15 8V2"/><line x1="9" y1="2" x2="15" y2="2"/>
            </svg>
        ),
    },
    {
        to: "/reports",
        label: "Reports",
        icon: (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
            </svg>
        ),
    },
];

function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [hoveredItem, setHoveredItem] = useState(null);
    const [logoutHover, setLogoutHover] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        navigate("/login");
    };

    return (
        <div style={s.sidebar}>
            <style>{css}</style>

            {/* Logo / Brand */}
            <div style={s.brand}>
                <div style={s.brandIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                    </svg>
                </div>
                <div>
                    <p style={s.brandName}>MediCore</p>
                    <p style={s.brandTag}>Hospital Management</p>
                </div>
            </div>

            {/* Section label */}
            <p style={s.sectionLabel}>MAIN MENU</p>

            {/* Navigation */}
            <nav style={s.nav}>
                {NAV_ITEMS.map(item => {
                    const isActive = location.pathname === item.to;
                    const isHovered = hoveredItem === item.to;
                    return (
                        <Link
                            key={item.to}
                            to={item.to}
                            style={{
                                ...s.link,
                                ...(isActive ? s.linkActive : {}),
                                ...(isHovered && !isActive ? s.linkHover : {}),
                            }}
                            onMouseEnter={() => setHoveredItem(item.to)}
                            onMouseLeave={() => setHoveredItem(null)}
                        >
                            {isActive && <span style={s.activePill} />}
                            <span style={{
                                ...s.linkIcon,
                                color: isActive ? "#38bdf8" : "rgba(255,255,255,0.55)",
                            }}>
                                {item.icon}
                            </span>
                            <span style={{
                                ...s.linkLabel,
                                color: isActive ? "#f0f9ff" : "rgba(255,255,255,0.7)",
                                fontWeight: isActive ? "500" : "400",
                            }}>
                                {item.label}
                            </span>
                            {isActive && (
                                <span style={s.activeDot} />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* User / Logout */}
            <div style={s.bottom}>
                <div style={s.userCard}>
                    <div style={s.userAvatar}>A</div>
                    <div style={s.userInfo}>
                        <p style={s.userName}>Admin</p>
                        <p style={s.userRole}>Administrator</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    style={{ ...s.logoutBtn, ...(logoutHover ? s.logoutBtnHover : {}) }}
                    onMouseEnter={() => setLogoutHover(true)}
                    onMouseLeave={() => setLogoutHover(false)}
                >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Sign out
                </button>
            </div>
        </div>
    );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');
  * { box-sizing: border-box; }
`;

const s = {
    sidebar: {
        width: "240px",
        height: "100vh",
        background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
        position: "fixed",
        top: 0,
        left: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: "'DM Sans', sans-serif",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        zIndex: 100,
    },

    // Brand
    brand: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "24px 20px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
    },
    brandIcon: {
        width: "38px",
        height: "38px",
        background: "linear-gradient(135deg, #38bdf8, #0ea5e9)",
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxShadow: "0 4px 14px rgba(56,189,248,0.35)",
    },
    brandName: {
        margin: 0,
        fontSize: "15px",
        fontWeight: "600",
        color: "#f1f5f9",
        letterSpacing: "-0.3px",
    },
    brandTag: {
        margin: 0,
        fontSize: "10px",
        color: "rgba(255,255,255,0.35)",
        letterSpacing: "0.3px",
        textTransform: "uppercase",
        fontWeight: "500",
    },

    sectionLabel: {
        fontSize: "10px",
        fontWeight: "600",
        color: "rgba(255,255,255,0.25)",
        letterSpacing: "1.2px",
        margin: "18px 20px 8px",
    },

    // Nav
    nav: {
        display: "flex",
        flexDirection: "column",
        gap: "2px",
        padding: "0 10px",
        overflowY: "auto",
    },
    link: {
        display: "flex",
        alignItems: "center",
        gap: "11px",
        padding: "10px 12px",
        borderRadius: "9px",
        textDecoration: "none",
        position: "relative",
        transition: "background 0.15s",
        cursor: "pointer",
    },
    linkActive: {
        background: "rgba(56,189,248,0.12)",
    },
    linkHover: {
        background: "rgba(255,255,255,0.06)",
    },
    activePill: {
        position: "absolute",
        left: 0,
        top: "50%",
        transform: "translateY(-50%)",
        width: "3px",
        height: "18px",
        borderRadius: "0 3px 3px 0",
        background: "#38bdf8",
    },
    linkIcon: {
        flexShrink: 0,
        transition: "color 0.15s",
    },
    linkLabel: {
        fontSize: "13.5px",
        transition: "color 0.15s",
        flex: 1,
    },
    activeDot: {
        width: "5px",
        height: "5px",
        borderRadius: "50%",
        background: "#38bdf8",
        opacity: 0.7,
    },

    // Bottom
    bottom: {
        padding: "12px 10px 16px",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
    },
    userCard: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 12px",
        borderRadius: "9px",
        background: "rgba(255,255,255,0.05)",
    },
    userAvatar: {
        width: "32px",
        height: "32px",
        borderRadius: "8px",
        background: "linear-gradient(135deg, #818cf8, #6366f1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "13px",
        fontWeight: "600",
        color: "#fff",
        flexShrink: 0,
    },
    userInfo: { flex: 1 },
    userName: {
        margin: 0,
        fontSize: "13px",
        fontWeight: "500",
        color: "#e2e8f0",
    },
    userRole: {
        margin: 0,
        fontSize: "11px",
        color: "rgba(255,255,255,0.35)",
    },
    logoutBtn: {
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "9px 14px",
        background: "rgba(239,68,68,0.1)",
        color: "rgba(252,165,165,0.9)",
        border: "1px solid rgba(239,68,68,0.2)",
        borderRadius: "9px",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: "500",
        transition: "all 0.15s",
        fontFamily: "'DM Sans', sans-serif",
    },
    logoutBtnHover: {
        background: "rgba(239,68,68,0.18)",
        color: "#fca5a5",
        borderColor: "rgba(239,68,68,0.35)",
    },
};

export default Sidebar;
