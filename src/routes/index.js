import Users from '../pages/admin/Users';
import CustomTour from '../components/CustomTour/CustomTour';
import CustomTourPage from '../pages/custom-tour/CustomTourPage';

const routes = [
    {
        path: '/admin/users',
        component: Users,
        layout: AdminLayout,
        role: ['admin']
    },
    {
        path: '/custom-tour',
        element: <CustomTourPage />
    },
]; 

const canShowCancelButton = (booking) => {
    return booking.status === 'PENDING' && !booking.refund;
}; 