import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'
<<<<<<< HEAD
=======

//注册全局可用组件
Vue.component('tree-table',TreeTable )
>>>>>>> goods_params

//配置axios的根路径
axios.defaults.baseURL = 'http://timemeetyou.com:8889/api/private/v1/'
//通过axios请求拦截器，添加token
axios.interceptors.request.use(config=>{
  // console.log(config);
  //为请求头对象，添加token验证的Authorization字段
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios
Vue.component('tree-table', TreeTable)
/*导入全局样式表*/
import './assets/css/global.css'
Vue.use(ElementUI);

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
