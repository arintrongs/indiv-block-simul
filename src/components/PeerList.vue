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
        <v-list-tile
          v-for="peer in peers"
          :key="peer.id"
          avatar
          @click="onselectpeer(peer.id)"
          v-bind:class="{selected : peer.id === selected_id}"
        >
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
    onselectpeer: Function,
    selected_id: Number
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
.selected {
  background: rgba(0, 0, 0, 0.04);
}
</style>



