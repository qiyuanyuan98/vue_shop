import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const Login = () =>
  import ('../components/Login.vue')
const Home = () =>
  import ('../components/Home.vue')
const Welcome = () =>
  import ('../components/Welcome.vue')
const Users = () =>
  import ('../components/user/Users.vue')
const Rights = () =>
  import ('../components/power/Rights.vue')
const Roles = () =>
  import ('../components/power/Roles.vue')
const Cate = () =>
  import ('../components/goods/Cate.vue')   
const Params = () =>
  import ('../components/goods/Params.vue')
const List = () =>
  import ('../components/goods/List.vue')
const Add = () =>
  import ('../components/goods/Add.vue')
const Order = () =>
  import ('../components/order/Order.vue')
const Report = () =>
  import ('../components/report/Report.vue')
const routes = [
  {
    path:'/',
    redirect:'/login'
  },
 {
   path:'/login',
   component:Login
 },{
   path:'/home',
   component:Home,
   redirect:'/welcome',
   //子路由
   children:[{
     path:'/welcome',
     component:Welcome
   },{
    path:'/users',
    component:Users
   },{
     path:'/rights',
     component:Rights
   },{
    path:'/roles',
    component:Roles
  },{
    path:'/categories',
    component:Cate
  },{
    path:'/params',
    component:Params
  },{
    path:'/goods',
    component:List
  },{
    path:'/goods/add',
    component:Add
  },{
    path:'/orders',
    component:Order
  },{
    path:'/reports',
    component:Report

  }]
 }
]

const router = new VueRouter({
  routes
})

//挂载路由导航守卫
router.beforeEach((to,from,next)=>{
//to 将要访问的路径
//from代表从哪个路径跳转而来
//next是一个函数，表示放行
 //  1. next() 表示放行  2.next('/login')强制跳转 
 if(to.path == '/login') return next()
 //获取token 
 const tokenSter =  window.sessionStorage.getItem('token')
 //如果没有tokenSter 强制跳转 /login
 if(!tokenSter) return next('/login')
 //否则 放行
 next()
})

export default router
