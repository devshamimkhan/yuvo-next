import TopProgressBar from "@/components/TopProgressBar";

export default function LoadingMovementHub() {
  return (
    <>
      <TopProgressBar />
      <main className="page" id="page-movement">
        {/* SKELETON HERO */}
        <section className="mh-hero" aria-label="Loading..." style={{ backgroundColor: '#e5e7eb', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
          <div className="mh-hero-inner">
            <div className="mh-hero-copy">
              <div style={{ width: '100px', height: '20px', backgroundColor: '#d1d5db', marginBottom: '20px' }}></div>
              <div style={{ width: '80%', height: '40px', backgroundColor: '#d1d5db', marginBottom: '10px' }}></div>
              <div style={{ width: '60%', height: '40px', backgroundColor: '#d1d5db', marginBottom: '20px' }}></div>
              <div style={{ width: '90%', height: '20px', backgroundColor: '#d1d5db', marginBottom: '10px' }}></div>
              <div style={{ width: '85%', height: '20px', backgroundColor: '#d1d5db' }}></div>
            </div>
          </div>
        </section>

        {/* SKELETON ROUTINES */}
        <section className="mh-section mh-routines" aria-label="Loading routines">
          <div className="mh-section-heading">
            <div style={{ width: '300px', height: '30px', backgroundColor: '#e5e7eb', marginBottom: '10px', marginLeft: 'auto', marginRight: 'auto', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
            <div style={{ width: '400px', height: '20px', backgroundColor: '#e5e7eb', margin: '0 auto', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
            <div className="mh-line" aria-hidden="true"></div>
          </div>

          <div className="mh-routine-grid">
            {[1, 2, 3].map((i) => (
              <article className="mh-routine-card" key={i} style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
                <div className="mh-routine-image">
                  <div style={{ width: '100%', height: '100%', backgroundColor: '#e5e7eb' }}></div>
                </div>
                <div className="mh-routine-body">
                  <div style={{ width: '70%', height: '24px', backgroundColor: '#e5e7eb', marginBottom: '15px' }}></div>
                  <div style={{ width: '100%', height: '16px', backgroundColor: '#e5e7eb', marginBottom: '8px' }}></div>
                  <div style={{ width: '90%', height: '16px', backgroundColor: '#e5e7eb', marginBottom: '8px' }}></div>
                  <div style={{ width: '80%', height: '16px', backgroundColor: '#e5e7eb', marginBottom: '20px' }}></div>
                  <div style={{ width: '120px', height: '16px', backgroundColor: '#e5e7eb' }}></div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
    </>
  );
}
