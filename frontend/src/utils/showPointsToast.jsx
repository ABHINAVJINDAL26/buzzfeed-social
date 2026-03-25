import { toast } from 'react-hot-toast';

export const showPointsToast = (action, pts) => {
  toast(
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ color: '#639922', fontSize: '14px' }}>⭐</span>
      <span>+{pts} pts — {action}</span>
    </div>,
    {
      style: {
        background: '#EAF3DE',
        border: '0.5px solid #97C459',
        color: '#27500A',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 500,
        padding: '8px 14px',
        animation: 'toastIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
      },
      duration: 2200,
      position: 'top-right',
    }
  );
};
