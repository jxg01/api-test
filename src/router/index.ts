import {createRouter, createWebHistory, RouteRecordRaw} from 'vue-router'
import Index from '@/views/Index.vue';
import ProjectPageVue from '@/views/ProjectPage.vue';
import UserPageVue from '@/views/UserPage.vue'
import InterfacePageVue from '@/views/InterfacePage.vue';
import MtTool from '@/views/MtTool.vue';
import GlobalVariablePage from '@/views/GlobalVariablePage.vue';

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
                component: Index,
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
                path: '/automation',
                name: 'automation',
                redirect: '/automation/interface',
                meta: {
                    title: '接口自动化',
                    isShow: true,
                    icon: 'Grid'
                },
                children: [
                    {
                        path: 'interface',
                        name: 'interface',
                        component: InterfacePageVue,
                        meta: {
                            title: '接口管理',
                            icon: 'Tickets'
                        }
                    },
                    {
                        path: 'testcase',
                        name: 'testcase',
                        component: UserPageVue,
                        meta: {
                            title: '用例管理',
                            icon: 'Files'
                        }
                    },
                    {
                        path: 'suite',
                        name: 'suite',
                        component: UserPageVue,
                        meta: {
                            title: '套件管理',
                            icon: 'SetUp'
                        }
                    },
                ]
            },
            {
                path: '/task',
                name: 'task',
                meta: {
                    title: '任务管理',
                    isShow: true,
                    icon: 'Clock'
                },
                children: [
                    {
                        path: 'test',
                        name: 'test',
                        component: UserPageVue,
                        meta: {
                            title: '任务配置',
                            icon: 'Clock'
                        }
                    }
                ]
            },
            {
                path: '/variable',
                name: 'variable',
                component: GlobalVariablePage,
                meta: {
                    title: '全局变量',
                    isShow: true,
                    icon: 'Clock'
                },

            },
            {
                path: '/settings',
                name: 'settings',
                component: UserPageVue,
                meta: {
                    title: '系统设置',
                    isShow: true,
                    icon: 'Clock'
                },

            },
            {
                path: '/mt_tool',
                name: 'mt_tool',
                component: MtTool,
                meta: {
                    title: '交易工具',
                    isShow: true,
                    icon: 'Clock'
                },

            },
        ]
    },
    // 通配符路由，重定向到 /dashboard
    {
        path: '/:pathMatch(.*)*',
        redirect: '/dashboard',
    },
    
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router;
