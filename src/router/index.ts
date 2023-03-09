import {createRouter, createWebHistory, RouteRecordRaw} from 'vue-router'
import Index from '../views/Index.vue';
import ProjectPageVue from '../views/ProjectPage.vue';
import UserPageVue from '../views/UserPage.vue'

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'Base',
        component: () => import('../views/Login.vue')
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/Login.vue')
    },
    {
        path: '/index',
        name: 'index',
        component: Index,
        redirect: '/dashboard',
        children: [
            {
                path: '/dashboard',
                name: 'dashboard',
                component: UserPageVue,
                meta: {
                    title: '首页',
                    isShow: true
                }

            },
            {
                path: '/user',
                name: 'User',
                component: UserPageVue,
                meta: {
                    title: '用户管理',
                    isShow: true
                }
            },
            {
                path: '/project',
                name: 'Project',
                component: ProjectPageVue,
                meta: {
                    title: '项目管理',
                    isShow: true
                }
            },
            {
                path: '/automation',
                name: 'automation',
                // component: UserPageVue,
                meta: {
                    title: '接口测试',
                    isShow: true
                },
                children: [
                    {
                        path: '/interface',
                        name: 'interface',
                        component: UserPageVue,
                        meta: {
                            title: '接口管理'
                        }
                    },
                    {
                        path: '/testcase',
                        name: 'testcase',
                        component: UserPageVue,
                        meta: {
                            title: '用例管理'
                        }
                    }
                ]

            }
        ]
    },
    
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router;
