import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

//注册ElementUI 组件
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);

//引用axios
import axios from 'axios'
//配置axios的根路径
axios.defaults.baseURL = 'http://timemeetyou.com:8889/api/private/v1/'
//通过axios请求拦截器，添加token
axios.interceptors.request.use(config=>{
  // console.log(config);
  //为请求头对象，添加token验证的Authorization字段
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
//全局挂载
Vue.prototype.$http = axios

//注册全局可用的table树组件
import TreeTable from 'vue-table-with-tree-grid'
Vue.component('tree-table',TreeTable )

//注册组件
Vue.component('tree-table', TreeTable)

/*导入全局样式表*/
import './assets/css/global.css'

Vue.config.productionTip = false

//注册全局过滤器
Vue.filter('dateFormat',function (originVal) {
  const dt = new Date(originVal)
  //年
  const y = dt.getFullYear()
  //月份默认为0需要+1 , padStart(2,'0')总长度为两位，不足两位 用0 补齐
  const m = (dt.getMonth() + 1 + '').padStart(2,'0')
  //日
  const d = (dt.getDate() + '').padStart(2, '0')
  //时
  const hh = (dt.getHours() + '').padStart(2, '0')
  //分
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  //秒
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

//注册全局文本编辑器组件
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
Vue.use(VueQuillEditor)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
