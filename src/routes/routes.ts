import type { Application } from 'express';
import auth_router from './auth.routes.js';
import profile_router from './profile.routes.js';
// import kategori_model_baju_management_router from './admin/kategori_model_baju.management.routes.js';
// import passwordRouter from './auth/password.routes.js';
// import dashboard_router from './admin/dashboard.routes.js';
// import kasir_router from './admin/kasir.routes.js';
// import rekapitulasi_router from './admin/rekapitulasi.routes.js';
// import google_auth_router from './auth/google-auth.routes.js';
// import router lain di sini
// import user_router from "./user/user.routes.js";
// import material_router from "./material/material.routes.js";
// import contact_router from "./contact/contact.routes.js";

interface Route {
    path: string;
    router: any;
}

// Group routes by logical area, then flatten to the `routes` map used by the rest of the file.
type RouteGroup = {
    // optional group-level path prefix (e.g. '/admin')
    path?: string;
    [key: string]: Route | string | undefined;
};

const groupedRoutes: Record<string, RouteGroup> = {
    public: {
        auth: {
            path: '/auth',
            router: auth_router,
        },
        profile: {
            path: '/profile',
            router: profile_router,
        },
        // contacts: {
        //     path: '/contacts',
        //     router: contact_router,
        // },
        // custom_order: {
        //     path: '/orders/custom',
        //     router: custom_order_router,
        // },
        // transactions: {
        //     path: '/transactions',
        //     router: transaction_router,
        // },
        // password: {
        //     path: '/reset-password',
        //     router: passwordRouter,
        // },
        // oauth: {
        //     path: '/oauth',
        //     router: google_auth_router
        // }

    },
    admin: {
        path: '/admin',
        // materials: {
        //     // keep admin routes under an admin namespace; can change path if desired
        //     path: '/materials',
        //     router: material_router,
        // },
        // user: {
        //     path: '/users',
        //     router: admin_user_router,
        // },
        // custom_order: {
        //     path: '/orders/custom',
        //     router: custom_order_management_router,
        // },
        // model_baju: {
        //     path: '/model-baju',
        //     router: model_baju_management_router,
        // },
        // kategori_model_baju: {
        //     path: '/kategori-model-baju',
        //     router: kategori_model_baju_management_router,
        // },
        // dashboard: {
        //     path: '/dashboard',
        //     router: dashboard_router,
        // },
        // kasir : {
        //     path: '/kasir',
        //     router: kasir_router,
        // },
        // rekapitulasi : {
        //     path: '/rekapitulasi',
        //     router: rekapitulasi_router, // Ganti dengan router rekapitulasi yang sebenarnya
        // }
        // Tambahkan route admin lain di sini
    },
    // Tambahkan group lain seperti 'user', 'internal', 'apiV2' dsb. Contoh:
    // user: {
    //     profile: { path: '/users/profile', router: user_router },
    // },
};

// Flatten groupedRoutes to a single map expected by registerRoutes, getRegisteredRoutes, dll.
const routes: Record<string, Route> = Object.entries(groupedRoutes).reduce((acc, [groupName, group]) => {
    const groupPrefix = typeof group.path === 'string' ? group.path : '';
    Object.entries(group).forEach(([routeName, route]) => {
        // skip group-level metadata (e.g. 'path') which may be a string
        if (!route || typeof route !== 'object' || !('router' in route) || !('path' in route)) {
            return;
        }
        // combine group prefix with route path so admin routes become /admin/materials
        const routeObj = route as Route;
        acc[`${groupName}.${routeName}`] = {
            path: `${groupPrefix}${routeObj.path}`,
            router: routeObj.router
        };
    });
    return acc;
}, {} as Record<string, Route>);

/**
 * Register all routes to Express app
 * @param app - Express application instance
 * @param prefix - API prefix (default: '/api')
 */
export const registerRoutes = (app: Application, prefix: string = '/api'): void => {
    Object.entries(routes).forEach(([name, route]) => {
        const fullPath = `${prefix}${route.path}`;
        app.use(fullPath, route.router);
        console.log(`Route registered: ${fullPath}`);
    });
};


/**
 * Get all registered routes
 * @param prefix - API prefix
 * @returns Array of route paths
 */
export const getRegisteredRoutes = (prefix: string = '/api'): string[] => {
    return Object.entries(routes).map(([name, route]) => {
        return `${prefix}${route.path}`;
    });
};

/**
 * Display all registered routes in console
 * @param prefix - API prefix
 */
export const displayRoutes = (prefix: string = '/api'): void => {
    console.log('\n📋 Registered Routes:');
    console.log('─'.repeat(50));

    Object.entries(routes).forEach(([name, route]) => {
        const fullPath = `${prefix}${route.path}`;
        console.log(`  ${name.padEnd(15)} → ${fullPath}`);
    });

    console.log('─'.repeat(50));
    console.log(`Total: ${Object.keys(routes).length} route group(s)\n`);
};
export default routes;