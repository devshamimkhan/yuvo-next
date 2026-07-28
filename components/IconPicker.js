"use client";

import { useState, useRef, useEffect } from "react";
import * as FaIcons from "react-icons/fa6";

const CURATED_ICONS = [
  "FaShieldHalved", "FaDumbbell", "FaHeartPulse", "FaBolt", "FaFire",
  "FaCheck", "FaStar", "FaHeart", "FaUser", "FaGear",
  "FaGlobe", "FaLock", "FaAward", "FaBox", "FaDroplet",
  "FaFeather", "FaLeaf", "FaMedal", "FaPlus", "FaTag",
  "FaCrown", "FaMagnifyingGlass", "FaWrench", "FaSun", "FaMoon",
  "FaPersonRunning", "FaPersonBiking", "FaPersonSwimming", "FaBed", "FaWind",
  "FaWater", "FaFireFlameCurved", "FaMountain", "FaStopwatch", "FaClock",
  "FaCalendar", "FaChartLine", "FaArrowUp", "FaArrowDown", "FaArrowsSpin",
  "FaThumbsUp", "FaHandshake", "FaFaceSmile", "FaFaceSmileWink", "FaFaceGrinStars"
];

export default function IconPicker({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredIcons = CURATED_ICONS.filter(name => 
    name.toLowerCase().includes(search.toLowerCase()) ||
    name.replace('Fa', '').toLowerCase().includes(search.toLowerCase())
  );

  const SelectedIcon = value && FaIcons[value] ? FaIcons[value] : null;

  return (
    <div className="icon-picker-container" ref={dropdownRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex", alignItems: "center", gap: "8px",
          width: "100%", padding: "10px 16px",
          background: "rgba(255, 255, 255, 0.55)",
          border: "1px solid rgba(55, 80, 62, 0.14)",
          borderRadius: "12px", cursor: "pointer",
          fontSize: "14px", color: "var(--yuvo-text)",
          textAlign: "left", fontFamily: "var(--font)",
          transition: "all 0.25s ease",
          outline: "none"
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--yuvo-blue)";
          e.currentTarget.style.boxShadow = "0 0 0 4px rgba(14, 79, 168, 0.08)";
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.85)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "rgba(55, 80, 62, 0.14)";
          e.currentTarget.style.boxShadow = "none";
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.55)";
        }}
      >
        {SelectedIcon ? <SelectedIcon size={18} style={{ color: "var(--yuvo-blue)" }} /> : <FaIcons.FaCircleQuestion size={18} style={{ opacity: 0.3 }} />}
        {value || "Select Icon..."}
      </button>

      {isOpen && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", left: 0,
          width: "320px", background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(55,80,62,0.14)",
          borderRadius: "16px", padding: "16px",
          boxShadow: "0 24px 60px rgba(20, 38, 56, .14)",
          zIndex: 100
        }}>
          <input 
            type="text" 
            placeholder="Search icons..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "10px 14px",
              borderRadius: "10px", border: "1px solid rgba(55, 80, 62, 0.14)",
              background: "rgba(255, 255, 255, 0.6)",
              marginBottom: "16px", fontSize: "13px",
              fontFamily: "var(--font)", outline: "none"
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--yuvo-blue)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(55, 80, 62, 0.14)";
            }}
          />
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(6, 1fr)",
            gap: "10px", maxHeight: "240px", overflowY: "auto",
            paddingRight: "8px"
          }}>
            {filteredIcons.map(name => {
              const IconComp = FaIcons[name];
              const isSelected = value === name;
              return (
                <button
                  key={name}
                  type="button"
                  title={name}
                  onClick={() => {
                    onChange(name);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  style={{
                    display: "flex", justifyContent: "center", alignItems: "center",
                    padding: "10px", border: "none", 
                    background: isSelected ? "rgba(14, 79, 168, 0.1)" : "transparent",
                    borderRadius: "10px", cursor: "pointer",
                    color: isSelected ? "var(--yuvo-blue)" : "var(--yuvo-muted)",
                    transition: "all 0.2s"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = "rgba(14, 79, 168, 0.08)"}
                  onMouseOut={(e) => e.currentTarget.style.background = isSelected ? "rgba(14, 79, 168, 0.1)" : "transparent"}
                >
                  <IconComp size={20} />
                </button>
              );
            })}
            {filteredIcons.length === 0 && (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", fontSize: "13px", color: "var(--yuvo-muted)", padding: "16px 0" }}>
                No icons found matching "{search}".
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
