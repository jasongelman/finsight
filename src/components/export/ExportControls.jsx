import { exportToCSV } from '../../utils/exportHelpers';

export function ExportControls({ results, inputs, compact }) {
  function handleCSV() {
    if (results && results.length > 0) {
      exportToCSV(results, inputs);
    }
  }

  function handlePDF() {
    window.print();
  }

  if (compact) {
    return (
      <>
        <button className="top-bar-btn" onClick={handleCSV} title="Download CSV">
          ↓ CSV
        </button>
        <button className="top-bar-btn" onClick={handlePDF} title="Print / Save as PDF">
          ⎙ Print
        </button>
      </>
    );
  }

  return (
    <div className="export-controls">
      <button className="btn-export" onClick={handleCSV} title="Download CSV">
        ↓ CSV
      </button>
      <button className="btn-export" onClick={handlePDF} title="Print / Save as PDF">
        ⎙ PDF
      </button>
    </div>
  );
}
