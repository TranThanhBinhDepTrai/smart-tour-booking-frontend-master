import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { exportService } from '../../services/exportService';

function ExportPDF() {
  const navigate = useNavigate();

  useEffect(() => {
    const downloadPDF = async () => {
      try {
        await exportService.exportPDF();
        // Navigate back to revenue page after download starts
        navigate('/admin/revenue');
      } catch (error) {
        console.error('Failed to export PDF:', error);
        // You might want to show an error message here
        navigate('/admin/revenue');
      }
    };

    downloadPDF();
  }, [navigate]);

  return null; // This component doesn't render anything
}

export default ExportPDF; 