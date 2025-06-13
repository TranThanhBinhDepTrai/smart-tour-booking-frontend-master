import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1';

const getAuthToken = () => {
  const token = localStorage.getItem('token');
  return token;
};

export const exportService = {
  exportPDF: async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${API_URL}/tours/export/pdf?page=0&limit=10`, {
        responseType: 'blob', // Important for handling file downloads
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Create a blob from the response data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      // Create a link element and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'tours-report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      throw error;
    }
  },

  exportExcel: async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${API_URL}/tours/export/excel?page=0&limit=10`, {
        responseType: 'blob', // Important for handling file downloads
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Create a blob from the response data
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Create a link element and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'tours-report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting Excel:', error);
      throw error;
    }
  }
}; 