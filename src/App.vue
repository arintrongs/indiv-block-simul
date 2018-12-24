<template>
  <div id="app">
    <h1></h1>
    <PeerList
      :peers="peers"
      :addpeer="addpeer"
      :removepeer="removepeer"
      :onselectpeer="onselectpeer"
    />
    <PeerManager
      :peer="peers[selected_idx]"
      :peers="peers"
      :connect="connect"
      :removeedge="removeedge"
      :addblock="addblock"
    />
  </div>
</template>

<script>
import Vue from 'vue'
import _ from 'lodash'
import PeerList from './components/PeerList.vue'
import PeerManager from './components/PeerManager.vue'

export default {
  name: 'app',
  components: {
    PeerList,
    PeerManager
  },
  data() {
    return {
      peers: [
        {
          id: 0,
          connected: [],
          blocks: [],
          selected: null,
          color: '#3e3e3e'
        }
      ],
      height: 0,
      selected_idx: 0,
      total_peer: 1,
      p: [0]
    }
  },
  methods: {
    addpeer: function() {
      const cssHSL =
        'hsl(' + 360 * Math.random() + ',' + (55 + 30 * Math.random()) + '%,' + (75 + 10 * Math.random()) + '%)'
      const peer = {
        id: this.total_peer,
        connected: [],
        blocks: [],
        selected: null,
        color: cssHSL
      }
      this.peers.push(peer)
      this.p.push(peer.id)
      this.total_peer += 1
    },
    removepeer: function(peer_id) {
      // Remove from all neighbor
      const peer_idx = this.peers.findIndex(obj => obj.id === peer_id)
      for (let neighbor_id of this.peers[peer_idx].connected) {
        const n_idx = this.peers.findIndex(obj => obj.id === neighbor_id)
        const p_idx = this.peers[n_idx].connected.findIndex(id => id === peer_id)
        this.$delete(this.peers[n_idx].connected, p_idx)
      }

      // Remove itself
      this.$delete(this.peers, peer_idx)
    },
    removeedge: function(peer_a_id, peer_b_id) {
      if (peer_a_id === null || peer_b_id === null) return
      const peer_a_idx = this.peers.findIndex(obj => obj.id === peer_a_id)
      const peer_b_idx = this.peers.findIndex(obj => obj.id === peer_b_id)
      this.peers[peer_a_idx].connected = _.filter(this.peers[peer_a_idx].connected, n => n !== peer_b_id)
      this.peers[peer_b_idx].connected = _.filter(this.peers[peer_b_idx].connected, n => n !== peer_a_id)
      if (this.peers[peer_a_idx].connected.length === 0) this.p[peer_a_id] = peer_a_id
      else {
        this.p[peer_a_id] = p[this.peers[peer_a_idx].connected[0]]
      }
      if (this.peers[peer_b_idx].connected.length === 0) this.p[peer_b_id] = peer_b_id
      else {
        this.p[peer_b_id] = p[this.peers[peer_b_idx].connected[0]]
      }
    },
    connect: function(peer_a_id, peer_b_id) {
      // TODOS : Change to Union Find
      if (peer_a_id === null || peer_b_id === null) return
      const peer_a_idx = this.peers.findIndex(obj => obj.id === peer_a_id)
      const peer_b_idx = this.peers.findIndex(obj => obj.id === peer_b_id)
      const isAinB = this.peers[peer_b_idx].connected.filter(id => id === peer_a_id).length !== 0
      const isBinA = this.peers[peer_a_idx].connected.filter(id => id === peer_b_id).length !== 0
      if (!isAinB && !isBinA) {
        this.peers[peer_a_idx].connected.push(peer_b_id)
        this.peers[peer_b_idx].connected.push(peer_a_id)
        const combined_blocks = _.union(this.peers[peer_b_idx].blocks, this.peers[peer_a_idx].blocks)
        if (this.kodpor(peer_a_id) !== this.kodpor(peer_b_id)) {
          this.p[peer_a_idx] = this.kodpor(this.p[peer_b_idx])
          const visited = _.fill(Array(this.peers.length), 0)
          var stack = []
          stack.push({ current: peer_a_id, before: peer_a_id })
          while (stack.length !== 0) {
            var top = stack.pop()
            const peer_idx = this.peers.findIndex(obj => obj.id === top.current)
            if (visited[peer_idx] !== 0) continue
            this.peers[peer_idx].blocks = [...combined_blocks]
            for (let neighbor_id of this.peers[peer_idx].connected) {
              if (neighbor_id != top.before) stack.push({ current: neighbor_id, before: top.current })
            }
            visited[peer_idx] = 1
          }
        }
      }
    },
    addblock: function(peer_id) {
      const visited = _.fill(Array(this.peers.length), 0)
      const peer_idx = this.peers.findIndex(obj => obj.id === peer_id)
      const block = { blockid: this.height, owner: peer_id, color: this.peers[peer_idx].color }
      var stack = []
      stack.push({ current: peer_id, before: peer_id })
      while (stack.length !== 0) {
        var top = stack.pop()
        const peer_idx = this.peers.findIndex(obj => obj.id === top.current)
        if (visited[peer_idx] !== 0) continue
        this.peers[peer_idx].blocks.push(block)
        for (let neighbor_id of this.peers[peer_idx].connected) {
          if (neighbor_id != top.before) stack.push({ current: neighbor_id, before: top.current })
        }
        visited[peer_idx] = 1
      }
      this.height += 1
    },
    onselectpeer: function(peer_id) {
      const peer_idx = this.peers.findIndex(obj => obj.id === peer_id)
      this.selected_idx = peer_idx
    },
    kodpor(peer_id) {
      if (this.p[peer_id] !== peer_id) return (this.p[peer_id] = this.kodpor(this.p[peer_id]))
      return this.p[peer_id]
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  justify-content: space-around;
  color: #2c3e50;
  margin-top: 60px;
  display: flex;
  flex-wrap: wrap;
}
</style>
