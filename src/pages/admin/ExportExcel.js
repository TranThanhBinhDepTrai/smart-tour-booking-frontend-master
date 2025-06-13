import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { exportService } from '../../services/exportService';

function ExportExcel() {
  const navigate = useNavigate();

  useEffect(() => {
    const downloadExcel = async () => {
      try {
        await exportService.exportExcel();
        // Navigate back to revenue page after download starts
        navigate('/admin/revenue');
      } catch (error) {
        console.error('Failed to export Excel:', error);
        // You might want to show an error message here
        navigate('/admin/revenue');
      }
    };

    downloadExcel();
  }, [navigate]);

  return null; // This component doesn't render anything
}

export default ExportExcel; 