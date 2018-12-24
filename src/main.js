import 'vuetify/dist/vuetify.min.css'
import Vue from 'vue'
import Vuetify from 'vuetify'
import App from './App.vue'

Vue.config.productionTip = false
document.body.setAttribute('data-app', true)
Vue.use(Vuetify)

new Vue({
  render: h => h(App)
}).$mount('#app')
