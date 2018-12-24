<template>
  <div class="peer-manager">
    <v-card width="100%" height="700">
      <v-card-title class="card-title">
        <span class="title">Peer Manager</span>
      </v-card-title>
      <div class="card-content">
        <div class="item">
          <span class="topic">Peer Name :</span>
          <v-chip>
            <v-avatar>
              <v-icon :color="peer.color">account_circle</v-icon>
            </v-avatar>
            Peer {{peer.id}}
          </v-chip>
        </div>
        <v-divider/>
        <div class="item">
          <span class="topic">Connect :</span>
          <div class="select">
            <v-select
              v-model="selected"
              :items="items"
              item-text="text"
              item-value="value"
              label="Peer"
            ></v-select>
          </div>
          <v-btn
            small
            dark
            depressed
            color="#1E88E5"
            v-on:click="connect(peer.id, selected)"
          >Connect</v-btn>
        </div>
        <v-divider/>
        <div class="item">
          <span class="topic">Connected To :</span>
          <div class="neighbor-chips">
            <v-chip
              close
              v-for="(neighbor_id,idx) in peer.connected"
              :key="idx"
              @input="removeedge(peer.id,neighbor_id)"
            >
              <v-avatar>
                <v-icon :color="peercolor(neighbor_id)">account_circle</v-icon>
              </v-avatar>
              Peer {{neighbor_id}}
            </v-chip>
          </div>
        </div>
        <v-divider/>
        <div class="item-block">
          <div>
            <span class="topic">Blocks :</span>
            <v-btn small dark depressed :color="peer.color" v-on:click="addblock(peer.id)">Add Block</v-btn>
          </div>
          <div class="blocks">
            <div
              class="block"
              v-for="(block, idx) of peer.blocks"
              :key="idx"
              :style="{'border-color' : block.color}"
            >
              BlockID : {{block.blockid}}
              <br>
              Owner : Peer {{block.owner}}
            </div>
          </div>
        </div>
        <v-divider/>
      </div>
    </v-card>
  </div>
</template>
<script>
export default {
  name: 'PeerManager',
  props: {
    peer: Object,
    peers: Array,
    connect: Function,
    removeedge: Function,
    addblock: Function
  },
  data() {
    return { selected: null }
  },
  computed: {
    items: function() {
      const filtered = this.peers
        .filter(peer => peer.id !== this.peer.id)
        .map(peer => ({ text: `Peer ${peer.id}`, value: peer.id }))
      return filtered
    }
  },
  methods: {
    peercolor: function(peer_id) {
      const peer_idx = this.peers.findIndex(obj => obj.id === peer_id)
      return this.peers[peer_idx].color || 'black'
    }
  }
}
</script>
<style scoped>
.peer-manager {
  width: 950px;
  text-align: center;
}
.card-title {
  display: flex;
  justify-content: space-between;
  padding: 8px 10px 8px 20px;
  background-color: #eaeaea;
  height: 68px;
}
.title {
  font-size: 16px;
}
.card-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 0px 20px 15px 20px;
}
.item {
  display: flex;
  align-items: center;
  width: 100%;
  text-align: left;
  padding-left: 10px;
  margin-top: 10px;
  margin-bottom: 10px;
}
.topic {
  font-size: 16px;
  font-weight: 600;
  margin-right: 20px;
}
.select {
  width: 350px;
}
.margin-bot {
  margin-bottom: 10px;
}
.item-block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  padding-left: 10px;
  margin-top: 10px;
  margin-bottom: 10px;
}
.item-block .topic {
  margin-bottom: 10px;
}
.blocks {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  margin-top: 15px;
}
.block {
  width: 120px;
  height: 60px;
  border: solid;
  margin-right: 5px;
  margin-bottom: 10px;
  padding: 10px 5px 5px 5px;
}
</style>
