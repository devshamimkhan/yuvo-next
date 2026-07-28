import TopProgressBar from "@/components/TopProgressBar";

export default function LoadingMoveGuide() {
  return (
    <>
      <TopProgressBar />
      <style>{`
        :root {
          --mg-line: rgba(55, 80, 62, 0.16);
          --mg-soft: #eef5ff;
        }
        .skel-page {
          padding: 132px 0 64px !important;
          background: #f9faf7;
          min-height: 100vh;
        }
        .skel-inner {
          width: min(1120px, calc(100% - 32px));
          margin: auto;
        }
        .skel-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(460px, 1.1fr);
          gap: 24px;
        }
        .skel-card {
          background: #ffffff; border: 1px solid var(--mg-line); border-radius: 24px;
          box-shadow: 0 16px 40px rgba(20, 38, 56, 0.08);
          animation: skel-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .skel-move { padding: 36px 32px; display: flex; flex-direction: column; min-height: 820px; }
        .skel-right { padding: 32px; }
        @keyframes skel-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .6; }
        }
        .skel-box { background: #e6eef9; border-radius: 8px; }
        @media (max-width: 1024px) {
          .skel-grid { grid-template-columns: 1fr; }
          .skel-move { min-height: auto; }
        }
        @media (max-width: 640px) {
          .skel-inner { width: calc(100% - 24px); }
          .skel-move { padding: 24px 20px; }
          .skel-right { padding: 24px 20px; }
        }
      `}</style>

      <main className="skel-page">
        <div className="skel-inner">
          {/* Top link skeleton */}
          <div className="skel-box" style={{ width: '250px', height: '20px', marginBottom: '28px', marginLeft: '4px' }}></div>

          <div className="skel-grid">
            {/* LEFT CARD */}
            <div className="skel-card skel-move">
              <div className="skel-box" style={{ width: '120px', height: '14px', marginBottom: '12px' }}></div>
              <div className="skel-box" style={{ width: '80%', height: '38px', marginBottom: '8px' }}></div>
              <div className="skel-box" style={{ width: '60%', height: '38px', marginBottom: '16px' }}></div>
              <div className="skel-box" style={{ width: '48px', height: '3px', borderRadius: '99px', marginBottom: '24px' }}></div>
              <div className="skel-box" style={{ width: '100%', aspectRatio: '1.6 / 1', borderRadius: '16px' }}></div>
              
              <div className="skel-box" style={{ width: '100%', height: '48px', borderRadius: '12px', marginTop: '24px' }}></div>
              
              <div className="skel-box" style={{ width: '100%', height: '14px', marginTop: '32px', marginBottom: '8px' }}></div>
              <div className="skel-box" style={{ width: '90%', height: '14px', marginBottom: '8px' }}></div>
              <div className="skel-box" style={{ width: '95%', height: '14px', marginBottom: '24px' }}></div>
              
              <div className="skel-box" style={{ width: '100%', height: '60px', borderRadius: '14px', marginTop: 'auto' }}></div>
            </div>

            {/* RIGHT CARD */}
            <div className="skel-card skel-right">
              {/* Timer skeleton */}
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <div className="skel-box" style={{ width: '60px', height: '15px', margin: '0 auto 20px' }}></div>
                <div className="skel-box" style={{ width: '150px', height: '50px', margin: '0 auto 10px' }}></div>
                <div className="skel-box" style={{ width: '180px', height: '15px', margin: '0 auto 24px' }}></div>
                
                {/* Progress bar */}
                <div className="skel-box" style={{ width: '100%', height: '6px', borderRadius: '99px', marginBottom: '24px' }}></div>
                
                {/* Controls */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                  <div className="skel-box" style={{ width: '104px', height: '46px', borderRadius: '99px' }}></div>
                  <div className="skel-box" style={{ width: '104px', height: '46px', borderRadius: '99px' }}></div>
                  <div className="skel-box" style={{ width: '104px', height: '46px', borderRadius: '99px' }}></div>
                </div>
              </div>

              {/* Tools Used */}
              <div style={{ borderTop: '1px solid var(--mg-line)', paddingTop: '28px', marginBottom: '28px' }}>
                <div className="skel-box" style={{ width: '90px', height: '15px', marginBottom: '20px' }}></div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  <div className="skel-box" style={{ width: '100%', height: '120px', borderRadius: '8px' }}></div>
                  <div className="skel-box" style={{ width: '100%', height: '120px', borderRadius: '8px' }}></div>
                  <div className="skel-box" style={{ width: '100%', height: '120px', borderRadius: '8px' }}></div>
                </div>
              </div>

              {/* Routine Steps */}
              <div style={{ borderTop: '1px solid var(--mg-line)', paddingTop: '28px' }}>
                <div className="skel-box" style={{ width: '110px', height: '15px', marginBottom: '20px' }}></div>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: i < 4 ? '1px solid var(--mg-line)' : 'none' }}>
                    <div className="skel-box" style={{ width: '30px', height: '30px', borderRadius: '50%' }}></div>
                    <div className="skel-box" style={{ flex: 1, height: '15px' }}></div>
                    <div className="skel-box" style={{ width: '80px', height: '15px' }}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
