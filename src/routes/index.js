import Users from '../pages/admin/Users';

const routes = [
    {
        path: '/admin/users',
        component: Users,
        layout: AdminLayout,
        role: ['admin']
    },
]; 

const canShowCancelButton = (booking) => {
    return booking.status === 'PENDING' && !booking.refund;
}; 