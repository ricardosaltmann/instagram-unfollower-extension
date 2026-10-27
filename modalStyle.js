// Estilos injetados no Instagram - Versão Ampliada e Confortável
if (!document.getElementById('instacleaner-style')) {
  const style = document.createElement('style');
  style.id = 'instacleaner-style';
  style.textContent = `
    .ic-modal {
      position: fixed;
      inset: 0;
      z-index: 999999 !important;
      background-color: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
    }
    .ic-dialog {
      background: #ffffff;
      width: 95%;
      max-width: 760px; /* Janela mais larga */
      height: 94vh;
      max-height: 880px; /* Janela mais alta */
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
      overflow: hidden;
      animation: icFadeIn 0.25s ease-out;
    }
    @keyframes icFadeIn {
      from { opacity: 0; transform: scale(0.96); }
      to { opacity: 1; transform: scale(1); }
    }
    .ic-header {
      padding: 14px 20px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8fafc;
    }
    .ic-title {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .ic-badge {
      font-size: 11px;
      font-weight: 600;
      background: #10b981;
      color: #ffffff;
      padding: 2px 8px;
      border-radius: 12px;
    }
    .ic-close {
      background: none;
      border: none;
      font-size: 24px;
      color: #64748b;
      cursor: pointer;
      line-height: 1;
      padding: 4px;
      border-radius: 6px;
    }
    .ic-close:hover {
      background: #e2e8f0;
      color: #0f172a;
    }
    .ic-body {
      flex: 1;
      overflow-y: auto;
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .ic-desc {
      font-size: 12px;
      color: #64748b;
      line-height: 1.4;
    }
    .ic-stats-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }
    .ic-stat-card {
      background: #f1f5f9;
      padding: 8px 12px;
      border-radius: 10px;
      text-align: center;
    }
    .ic-stat-val {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
    }
    .ic-stat-lbl {
      font-size: 11px;
      color: #64748b;
      margin-top: 1px;
    }
    .ic-stat-card.highlight {
      background: #fef2f2;
      border: 1px solid #fecaca;
    }
    .ic-stat-card.highlight .ic-stat-val {
      color: #ef4444;
    }
    .ic-actions-bar {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    .ic-btn {
      padding: 9px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    .ic-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .ic-btn-primary {
      background: #2563eb;
      color: #ffffff;
    }
    .ic-btn-primary:hover:not(:disabled) {
      background: #1d4ed8;
    }
    .ic-btn-danger {
      background: #ef4444;
      color: #ffffff;
    }
    .ic-btn-danger:hover:not(:disabled) {
      background: #dc2626;
    }
    .ic-btn-secondary {
      background: #e2e8f0;
      color: #334155;
    }
    .ic-btn-secondary:hover:not(:disabled) {
      background: #cbd5e1;
    }
    .ic-speed-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 10px 14px;
      border-radius: 10px;
      font-size: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .ic-speed-options {
      display: flex;
      gap: 16px;
      align-items: center;
    }
    .ic-speed-options label {
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      font-weight: 500;
      color: #334155;
    }
    .ic-filter-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      margin-top: 2px;
    }
    .ic-search {
      flex: 1;
      padding: 8px 12px;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      font-size: 13px;
      outline: none;
    }
    .ic-search:focus {
      border-color: #2563eb;
    }
    .ic-select-all {
      font-size: 12px;
      color: #2563eb;
      cursor: pointer;
      white-space: nowrap;
      user-select: none;
      font-weight: 500;
    }
    .ic-select-all:hover {
      text-decoration: underline;
    }
    /* Lista agora ocupa muito mais espaço vertical */
    .ic-list {
      flex: 1;
      min-height: 380px; /* Área de rolagem bem maior */
      max-height: 520px;
      display: flex;
      flex-direction: column;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      overflow-y: auto;
      background: #ffffff;
    }
    .ic-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 9px 14px;
      border-bottom: 1px solid #f1f5f9;
      transition: background 0.15s;
    }
    .ic-item:last-child {
      border-bottom: none;
    }
    .ic-item:hover {
      background: #f8fafc;
    }
    .ic-item.active-processing {
      background: #eff6ff;
      border-left: 3px solid #2563eb;
    }
    .ic-user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }
    .ic-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      background: #e2e8f0;
    }
    .ic-names {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .ic-username {
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
      text-decoration: none;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .ic-username:hover {
      color: #2563eb;
    }
    .ic-fullname {
      font-size: 12px;
      color: #64748b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .ic-status-tag {
      font-size: 11px;
      padding: 3px 9px;
      border-radius: 6px;
      font-weight: 600;
    }
    .ic-status-removed {
      background: #dcfce7;
      color: #15803d;
    }
    .ic-progress-container {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 10px 14px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .ic-progress-bar-bg {
      width: 100%;
      height: 8px;
      background: #e2e8f0;
      border-radius: 4px;
      overflow: hidden;
    }
    .ic-progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #10b981, #06b6d4);
      width: 0%;
      transition: width 0.3s ease;
    }
    .ic-log-text {
      font-family: monospace;
      font-size: 11px;
      color: #475569;
    }
    .ic-footer {
      padding: 10px 20px;
      border-top: 1px solid #e2e8f0;
      background: #f8fafc;
      font-size: 12px;
      color: #64748b;
      text-align: center;
    }
    .ic-hidden {
      display: none !important;
    }
  `;
  document.head.appendChild(style);
}
