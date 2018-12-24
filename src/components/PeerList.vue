<template>
  <div>
    <v-card width="300" height="700">
      <v-card-title class="card-title">
        <span class="title">Peer List</span>
        <v-btn fab small dark color="#66c7bb" v-on:click="addpeer()">
          <v-icon dark>add</v-icon>
        </v-btn>
      </v-card-title>
      <v-list class="peer-list" id="peer-list">
        <v-list-tile v-for="peer in peers" :key="peer.id" avatar @click="onselectpeer(peer.id)">
          <v-list-tile-avatar>
            <v-icon :color="peer.color">account_circle</v-icon>
          </v-list-tile-avatar>
          <v-list-tile-content>Peer {{peer.id}}</v-list-tile-content>
          <v-list-tile-action v-on:click="removepeer(peer.id)">
            <v-btn flat icon color="red">
              <v-icon>remove_circle_outline</v-icon>
            </v-btn>
          </v-list-tile-action>
        </v-list-tile>
      </v-list>
    </v-card>
  </div>
</template>
<script>
export default {
  name: 'PeerList',
  props: {
    peers: Array,
    addpeer: Function,
    removepeer: Function,
    onselectpeer: Function
  },
  updated() {
    var container = this.$el.querySelector('#peer-list')
    container.scrollTop = container.scrollHeight
  }
}
</script>
<style scoped>
.peer-container {
  margin-top: 20px;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  flex-direction: column;
}
.peer-list {
  height: 620px;
  overflow-y: scroll;
}
.card-title {
  display: flex;
  justify-content: space-between;
  padding: 8px 10px 8px 20px;
  background-color: #eaeaea;
}
.title {
  font-size: 16px;
}
</style>



