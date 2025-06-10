import {createRouter, createWebHistory, RouteRecordRaw} from 'vue-router'
import Index from '@/views/Index.vue';
import ProjectPageVue from '@/views/ProjectPage.vue';
import UserPageVue from '@/views/UserPage.vue'
import InterfacePageVue from '@/views/InterfacePage.vue';
import MtTool from '@/views/MtTool.vue';
import GlobalVariablePage from '@/views/GlobalVariablePage.vue';
import TestCasePage from '@/views/TestCasePage.vue';
import DashboardPageVue from '@/views/DashboardPage.vue';
import SettingsPageVue from '@/views/SettingsPage.vue';
import SuitePageVue from '@/views/SuitePage.vue';
import TaskPageVue from '@/views/TaskPage.vue';
import TraderToolsPageVue from '@/views/TraderToolsPage.vue';
import SuiteEditorVue from '@/components/suite/SuiteEditor.vue';
import SuggestionPageVue from '@/views/SuggestionPage.vue';
import ExecutionHistoryPageVue from '@/views/ExecutionHistoryPage.vue';

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
                component: DashboardPageVue,
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
                    icon: 'Histogram'
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
                        component: TestCasePage,
                        meta: {
                            title: '用例管理',
                            icon: 'Files'
                        }
                    },
                    {
                        path: 'suite',
                        name: 'suite',
                        component: SuitePageVue,
                        meta: {
                            title: '套件管理',
                            icon: 'SetUp',
                            activeMenu: '/automation/suite',
                            alwaysShow: true,

                        },
                        children: [
                            
                              {
                                path: 'create',
                                name: 'SuiteCreate',
                                component: () => import('@/components/suite/SuiteEditor.vue'),
                                meta: {
                                  inheritParentMeta: true // 继承父级元信息
                                }
                              },
                              {
                                path: ':id',
                                name: 'SuiteEdit',
                                component:  () => import('@/components/suite/SuiteEditor.vue'),
                                props: true,
                                meta: {
                                  inheritParentMeta: true, // 继承父级元信息
                                  activeMenu: '/automation/suite'
                                }
                              },
                              {
                                path: '', // 默认子路由
                                name: 'SuiteList',
                                component:  () => import('@/components/suite/SuiteList.vue')
                              },
                        ]
                    },
                    {
                        path: 'excution-history',
                        name: 'excution-history',
                        component: ExecutionHistoryPageVue,
                        meta: {
                            title: '套件执行记录',
                            icon: 'ScaleToOriginal'
                        }
                    },
                ]
            },
            {
                path: '/task',
                name: 'task',
                meta: {
                    title: '任务管理',
                    isShow: false,
                    icon: 'Clock'
                },
                children: [
                    {
                        path: 'test',
                        name: 'test',
                        // component: TaskPageVue,
                        component: () => import('@/components/suite/SuiteEditor.vue'),
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
                    icon: 'Coin'
                },

            },
            {
                path: '/settings',
                name: 'settings',
                component: SettingsPageVue,
                meta: {
                    title: '系统设置',
                    isShow: false,
                    icon: 'Clock'
                },

            },
            {
                path: '/mt_tool',
                name: 'mt_tool',
                component: TraderToolsPageVue,
                meta: {
                    title: '交易工具',
                    isShow: false,
                    icon: 'Clock'
                },
            },
            {
                path: '/suggestions',
                name: 'suggestions',
                component: SuggestionPageVue,
                meta: {
                    title: '优化反馈',
                    isShow: true,
                    icon: 'Opportunity'
                },
            },
            {
                path: '/python_editor',
                name: 'python_editor',
                component: import('@/views/PythonEditorPage.vue'),
                meta: {
                    title: 'Python函数',   
                    isShow: true,
                    icon: 'Opportunity'
                },
            },
        ]
    },
    // 通配符路由，重定向到 /dashboard
    {
        path: '/:pathMatch(.*)*',
        redirect: '/login',
    },
    
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to) => {
    // 自动补全激活标识
    if (!to.meta.activeMenu) {
      const parent = to.matched[to.matched.length - 2]
      to.meta.activeMenu = parent?.meta.activeMenu || ''
    }
  })


export default router;
