<template>
  <div id="app">
    <PeerList />
  </div>
</template>

<script>
import PeerList from './components/PeerList.vue'

export default {
  name: 'app',
  components: {
    PeerList
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  justify-content: center;
  color: #2c3e50;
  margin-top: 60px;
  display:flex;
  flex-wrap: wrap;
}
</style>
