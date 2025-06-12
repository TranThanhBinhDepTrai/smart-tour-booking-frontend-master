import Users from '../pages/admin/Users';

const routes = [
    {
        path: '/admin/users',
        component: Users,
        layout: AdminLayout,
        role: ['admin']
    },
]; 