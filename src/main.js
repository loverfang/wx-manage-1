//import Vue from 'vue'
import App from './App.vue'

import router from './router'
import store from './store'

import VueCookie from 'vue-cookie'

// import ElementUI from'element-ui'; 
// import'element-ui/lib/theme-chalk/index.css';

import './assets/css/common.css'
import './assets/scss/index.scss'

import httpRequest from '@/utils/httpRequest' // api: https://github.com/axios/axios
import { isAuth, addDateRange, resetForm, parseTime} from '@/utils'
import VueClipboard from 'vue-clipboard2'

Vue.use(VueClipboard)
Vue.use(VueCookie)

Vue.config.productionTip = false

// 挂载全局
Vue.prototype.$http = httpRequest // ajax请求方法
Vue.prototype.isAuth = isAuth     // 权限方法

Vue.prototype.addDateRange = addDateRange    // 权限方法
Vue.prototype.parseTime = parseTime
Vue.prototype.resetForm = resetForm  //重置表单
Vue.prototype.$cookie = VueCookie;

moment.locale('zh-cn');
Vue.prototype.$moment = moment; //时间处理

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')
