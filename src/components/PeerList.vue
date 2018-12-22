<template>
  <div class="peer-list">
    <h1>My Peer List</h1>
    <button v-on:click="addpeer()">Add Peer</button>
    <div class="peer-container">
      <div class="peer" v-for="peer in peers" :key="peer.idx">
        <h3>Peer{{peer.idx}}</h3>
        <div v-for="(value, key, index) in peer" :key="index">{{ key }}: {{ value }}</div>
        <button v-on:click="addblock(peer.idx)">Add Block</button>
        <br>
        <select v-model="peers[peer.idx].selected" type="number">
          <template v-for="peer_n in peers">
            <option
              v-if="peer_n.idx!=peer.idx"
              :value="peer_n.idx"
              :key="peer_n.idx"
            >Peer{{peer_n.idx}}</option>
          </template>
        </select>
        <button v-on:click="connect(peer.idx, peers[peer.idx].selected)">Connect</button>
      </div>
    </div>
  </div>
</template>
<script>
import _ from 'lodash'
export default {
  name: 'PeerList',
  data() {
    return { peers: [], height: 0 }
  },
  methods: {
    addpeer: function() {
      const peer = {
        idx: this.peers.length,
        connected: [],
        blocks: [],
        selected: null
      }
      this.peers.push(peer)
    },
    connect: function(peer_a_idx, peer_b_idx) {
      if (peer_a_idx === null || peer_b_idx === null) return
      const isAinB =
        this.peers[peer_b_idx].connected.filter(idx => idx === peer_a_idx)
          .length != 0
      const isBinA =
        this.peers[peer_a_idx].connected.filter(idx => idx === peer_b_idx)
          .length != 0
      if (!isAinB && !isBinA) {
        this.peers[peer_a_idx].connected.push(peer_b_idx)
        this.peers[peer_b_idx].connected.push(peer_a_idx)
        const combined_blocks = _.union(
          this.peers[peer_a_idx].blocks,
          this.peers[peer_b_idx].blocks
        )
        var stack = []
        stack.push({ current: peer_a_idx, before: peer_a_idx })
        while (stack.length !== 0) {
          var top = stack.pop()
          this.peers[top.current].blocks = [...combined_blocks]
          for (let neighbor_idx of this.peers[top.current].connected) {
            if (neighbor_idx != top.before)
              stack.push({ current: neighbor_idx, before: top.current })
          }
        }
      }
    },
    addblock: function(peer_idx) {
      const block = { blockid: this.height, owner: peer_idx }
      var stack = []
      stack.push({ current: peer_idx, before: peer_idx })
      while (stack.length !== 0) {
        var top = stack.pop()
        this.peers[top.current].blocks.push(block)
        for (let neighbor_idx of this.peers[top.current].connected) {
          if (neighbor_idx != top.before)
            stack.push({ current: neighbor_idx, before: top.current })
        }
      }
      this.height += 1
    }
  }
}
</script>
<style scoped>
.peer-list {
  width: 100%;
  text-align: center;
}
.peer-container {
  margin: auto;
  margin-top: 20px;
  width: 750px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  flex-direction: column;
}
</style>



