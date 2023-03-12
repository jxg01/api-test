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
                    // 一级菜单才需要这个字段，用于是否显示这个菜单
                    isShow: true,
                    icon: 'Grid'
                }

            },
            {
                path: '/user',
                name: 'user',
                component: UserPageVue,
                meta: {
                    title: '用户管理',
                    isShow: true,
                    icon: 'User'
                }
            },
            {
                path: '/project',
                name: 'project',
                component: ProjectPageVue,
                meta: {
                    title: '项目管理',
                    isShow: true,
                    icon: 'House'
                }
            },
            {
                path: '/interface',
                name: 'interface',
                component: UserPageVue,
                meta: {
                    title: '接口管理',
                    isShow: true,
                    icon: 'Tickets'
                }
            },
            {
                path: '/testcase',
                name: 'testcase',
                component: UserPageVue,
                meta: {
                    title: '用例管理',
                    isShow: true,
                    icon: 'Files'
                }
            },
            {
                path: '/suite',
                name: 'suite',
                component: UserPageVue,
                meta: {
                    title: '套件管理',
                    isShow: true,
                    icon: 'SetUp'
                }
            },
            {
                path: '/task',
                name: 'task',
                // component: UserPageVue,
                meta: {
                    title: '任务管理',
                    isShow: true,
                    icon: 'Clock'
                },
                children: [
                    {
                        path: '/test',
                        name: 'test',
                        component: UserPageVue,
                        meta: {
                            title: '子菜单',
                            icon: 'Clock'
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
