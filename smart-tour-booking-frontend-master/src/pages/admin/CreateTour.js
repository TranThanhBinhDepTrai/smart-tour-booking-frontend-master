const handleImageChange = async (e) => {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;

  setUploading(true);
  setError('');

  try {
    // Upload từng ảnh một và thu thập URLs
    const uploadedUrls = [];
    
    for (const file of files) {
      const formData = new FormData();
      formData.append('images', file);
      
      const response = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // API trả về URL dạng string
      if (response.data) {
        uploadedUrls.push(response.data);
      }
    }

    console.log('Uploaded image URLs:', uploadedUrls);

    // Cập nhật state với URLs mới
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...uploadedUrls]
    }));

    setSuccess(`Đã tải lên ${uploadedUrls.length} ảnh thành công!`);
  } catch (err) {
    console.error('Error uploading images:', err);
    const errorMessage = err.response?.data?.message || 'Lỗi khi tải ảnh lên. Vui lòng thử lại.';
    setError(errorMessage);
  } finally {
    setUploading(false);
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  setSuccess('');

  try {
    // Validate dữ liệu
    if (!formData.title?.trim()) throw new Error('Vui lòng nhập tên tour');
    if (!formData.description?.trim()) throw new Error('Vui lòng nhập mô tả tour');
    if (!formData.code?.trim()) throw new Error('Vui lòng nhập mã tour');
    if (!formData.destination?.trim()) throw new Error('Vui lòng nhập điểm đến');
    if (!formData.startDate) throw new Error('Vui lòng chọn ngày bắt đầu');
    if (!formData.endDate) throw new Error('Vui lòng chọn ngày kết thúc');
    
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      throw new Error('Ngày bắt đầu phải trước ngày kết thúc');
    }

    // Format dữ liệu theo yêu cầu của API
    const tourData = {
      title: String(formData.title).trim(),
      description: String(formData.description).trim(),
      capacity: Number(formData.capacity),
      priceAdults: Number(formData.priceAdults),
      priceChildren: Number(formData.priceChildren),
      startDate: formData.startDate,
      endDate: formData.endDate,
      destination: String(formData.destination).trim(),
      region: "DOMESTIC",
      category: "ADVENTURE",
      airline: String(formData.airline || '').trim(),
      code: String(formData.code).trim(),
      available: true,
      itinerary: formData.itinerary
        .filter(item => item && typeof item === 'string' && item.trim())
        .map(item => String(item).trim()),
      images: formData.images
        .filter(url => url && typeof url === 'string' && url.trim())
        .map(url => String(url).trim())
    };

    // Log để debug
    console.log('Tour data to be sent:', JSON.stringify(tourData, null, 2));

    // Gửi request tạo tour
    const response = await api.post('/tours', tourData);
    console.log('Tour creation response:', response);

    setSuccess('Tour đã được tạo thành công!');
    setTimeout(() => {
      navigate('/admin/tours');
    }, 1500);
  } catch (err) {
    console.error('Error details:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status
    });
    
    let errorMessage = 'Có lỗi xảy ra khi tạo tour';
    
    if (err.response?.data?.message) {
      errorMessage = err.response.data.message;
    } else if (err.response?.status === 403) {
      errorMessage = 'Bạn không có quyền thực hiện thao tác này';
    } else if (err.message.includes('JSON parse error')) {
      errorMessage = 'Dữ liệu không đúng định dạng. Vui lòng kiểm tra lại thông tin nhập vào.';
    }
    
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};

// Thêm hàm format dữ liệu itinerary
const handleInputChange = (e) => {
  const { name, value, type, checked } = e.target;
  if (name === 'itinerary') {
    // Format itinerary thành mảng các string
    const items = value.split('\n')
      .map(item => item.trim())
      .filter(item => item.length > 0);
    setFormData(prev => ({ ...prev, itinerary: items }));
  } else {
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value, 10) : value)
    }));
  }
}; 