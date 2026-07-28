export default function TopProgressBar() {
  return (
    <div className="top-progress-bar-container">
      <div className="top-progress-bar"></div>
      <style>{`
        .top-progress-bar-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
          z-index: 9999;
          pointer-events: none;
        }
        .top-progress-bar {
          height: 100%;
          background: var(--mg-blue, #0e4fa8);
          width: 0%;
          animation: top-progress-indeterminate 2s infinite ease-in-out;
        }
        @keyframes top-progress-indeterminate {
          0% { width: 0%; transform: translateX(0); }
          50% { width: 100%; transform: translateX(0); }
          100% { width: 100%; transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
