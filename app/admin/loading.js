/**
 * Admin loading state — shown during page transitions.
 * The sidebar and footer stay mounted (they live in layout.js).
 * Only the main content area between them is replaced.
 */
export default function AdminLoading() {
  return (
    <div className="admin-loading-shell" style={{ padding: "32px" }}>
      {/* Topbar skeleton */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
        }}
      >
        <div>
          <div
            style={{
              width: "180px",
              height: "26px",
              background: "#e5e7eb",
              borderRadius: "6px",
              marginBottom: "8px",
            }}
          />
          <div
            style={{
              width: "120px",
              height: "14px",
              background: "#e5e7eb",
              borderRadius: "6px",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              background: "#e5e7eb",
              borderRadius: "50%",
            }}
          />
          <div
            style={{
              width: "36px",
              height: "36px",
              background: "#e5e7eb",
              borderRadius: "50%",
            }}
          />
          <div
            style={{
              width: "38px",
              height: "38px",
              background: "#e5e7eb",
              borderRadius: "50%",
            }}
          />
        </div>
      </div>

      {/* Stats cards skeleton */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            <div
              style={{
                width: "60%",
                height: "14px",
                background: "#e5e7eb",
                borderRadius: "6px",
                marginBottom: "12px",
              }}
            />
            <div
              style={{
                width: "40%",
                height: "28px",
                background: "#e5e7eb",
                borderRadius: "6px",
                marginBottom: "8px",
              }}
            />
            <div
              style={{
                width: "30%",
                height: "12px",
                background: "#e5e7eb",
                borderRadius: "6px",
              }}
            />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              width: "140px",
              height: "20px",
              background: "#e5e7eb",
              borderRadius: "6px",
            }}
          />
          <div
            style={{
              width: "80px",
              height: "20px",
              background: "#e5e7eb",
              borderRadius: "6px",
            }}
          />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
              gap: "16px",
              padding: "14px 20px",
              borderBottom: "1px solid #f3f4f6",
            }}
          >
            <div
              style={{
                width: "80%",
                height: "16px",
                background: "#f3f4f6",
                borderRadius: "6px",
              }}
            />
            <div
              style={{
                width: "60%",
                height: "16px",
                background: "#f3f4f6",
                borderRadius: "6px",
              }}
            />
            <div
              style={{
                width: "40%",
                height: "16px",
                background: "#f3f4f6",
                borderRadius: "6px",
              }}
            />
            <div
              style={{
                width: "50%",
                height: "16px",
                background: "#f3f4f6",
                borderRadius: "6px",
              }}
            />
            <div
              style={{
                width: "70%",
                height: "16px",
                background: "#f3f4f6",
                borderRadius: "6px",
              }}
            />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes adminPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .admin-loading-shell > * {
          animation: adminPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}
