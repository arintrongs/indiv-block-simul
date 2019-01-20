<template>
  <v-app class="overall">
    <v-alert :value="alert" type="error" transition="scale-transition">Something went wrong.</v-alert>
    <div class="app">
      <PeerList
        :peers="peers"
        :addpeer="addpeer"
        :removepeer="removepeer"
        :onselectpeer="onselectpeer"
        :selected_id="selected_id"
      />
      <PeerManager
        :peer="peers[selected_idx]"
        :peers="peers"
        :connect="connect"
        :removeedge="removeedge"
        :addblock="addblock"
        :group_stake="group_stake"
        :total_peer="total_peer"
        :alert="alert"
      />
      <GraphContainer :peers="peers"/>
    </div>
  </v-app>
</template>

<script>
import _ from 'lodash'
import PeerList from './components/PeerList.vue'
import PeerManager from './components/PeerManager.vue'
import GraphContainer from './components/GraphContainer.vue'

export default {
  name: 'app',
  components: {
    PeerList,
    PeerManager,
    GraphContainer
  },
  data() {
    return {
      peers: [
        {
          id: 0,
          connected: [],
          blocks: [],
          selected: null,
          color: '#3e3e3e',
          balance: 100,
          usable: 100,
          input: 0,
          group: 0
        }
      ],
      height: 0,
      selected_idx: 0,
      selected_id: 0,
      total_peer: 1,
      current_peer_id: 1,
      p: [0],
      group_stake: [1],
      alert: false,
      to_add_later: []
    }
  },
  methods: {
    addpeer: function() {
      const cssHSL =
        'hsl(' + 360 * Math.random() + ',' + (55 + 30 * Math.random()) + '%,' + (75 + 10 * Math.random()) + '%)'
      const peer = {
        id: this.current_peer_id,
        connected: [],
        blocks: [],
        selected: null,
        color: cssHSL,
        balance: 100,
        usable: 100,
        input: 0
      }
      this.peers.push(peer)
      this.p.push(peer.id)
      this.total_peer += 1
      this.current_peer_id += 1
      this.calcgroup()
      this.calcusable()
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
      this.total_peer -= 1
      this.$delete(this.peers, peer_idx)
      this.calcgroup()
      this.calcusable()
    },
    removeedge: function(peer_a_id, peer_b_id) {
      if (peer_a_id === null || peer_b_id === null) return
      const peer_a_idx = this.peers.findIndex(obj => obj.id === peer_a_id)
      const peer_b_idx = this.peers.findIndex(obj => obj.id === peer_b_id)
      this.peers[peer_a_idx].connected = _.filter(this.peers[peer_a_idx].connected, n => n !== peer_b_id)
      this.peers[peer_b_idx].connected = _.filter(this.peers[peer_b_idx].connected, n => n !== peer_a_id)
      if (this.peers[peer_a_idx].connected.length === 0) this.p[peer_a_idx] = peer_a_idx
      else {
        this.p[peer_a_idx] = this.p[this.peers[peer_a_idx].connected[0]]
      }
      if (this.peers[peer_b_idx].connected.length === 0) this.p[peer_b_idx] = peer_b_idx
      else {
        this.p[peer_b_idx] = this.p[this.peers[peer_b_idx].connected[0]]
      }
      this.calcgroup()
      this.calcusable()
    },
    connect: function(peer_a_id, peer_b_id) {
      // TODOS : Change to Union Find
      if (peer_a_id === null || peer_b_id === null) return
      const peer_a_idx = this.getpeeridx(peer_a_id)
      const peer_b_idx = this.getpeeridx(peer_b_id)
      const isAinB = this.peers[peer_b_idx].connected.filter(id => id === peer_a_id).length !== 0
      const isBinA = this.peers[peer_a_idx].connected.filter(id => id === peer_b_id).length !== 0
      if (!isAinB && !isBinA) {
        this.peers[peer_a_idx].connected.push(peer_b_id)
        this.peers[peer_b_idx].connected.push(peer_a_id)
        const combined_blocks = _.union(this.peers[peer_b_idx].blocks, this.peers[peer_a_idx].blocks)
        if (this.kodpor(peer_a_idx) !== this.kodpor(peer_b_idx)) {
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
        this.calcgroup()
        this.clearbalance()
      }
    },
    addblock: function(peer_id, input, to_peer_id) {
      // Check whether the input is valid according to the current stake
      const peer = this.peers[this.getpeeridx(peer_id)]
      const to_peer = this.peers[this.getpeeridx(to_peer_id)]
      if (input > peer.usable || input <= 0) {
        // console.log('not enough money!')
        this.alert = true
        setTimeout(() => {
          this.alert = false
        }, 1000)
        return null
      }
      // Add Block
      const visited = _.fill(Array(this.peers.length), 0)
      const peer_idx = this.peers.findIndex(obj => obj.id === peer_id)
      const block = {
        blockid: this.height,
        from: peer_id,
        to: to_peer_id,
        color: this.peers[peer_idx].color,
        value: input
      }
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
      peer.balance -= input
      peer.usable -= input
      if (peer.group === to_peer.group) {
        to_peer.balance += input
        to_peer.usable += input
      } else {
        this.to_add_later.push({ from: peer_id, to: to_peer_id, value: input })
      }
    },
    onselectpeer: function(peer_id) {
      const peer_idx = this.getpeeridx(peer_id)
      this.selected_idx = peer_idx
      this.selected_id = peer_id
    },
    kodpor(peer_idx) {
      if (this.p[peer_idx] !== peer_idx) return (this.p[peer_idx] = this.kodpor(this.p[peer_idx]))
      return this.p[peer_idx]
    },
    calcgroup() {
      var group_num = 0
      const visited = _.fill(Array(this.peers.length), 0)
      const group_stake = _.fill(Array(this.peers.length), 0)
      for (var peer of this.peers) {
        let peer_idx = this.getpeeridx(peer.id)
        if (visited[peer_idx] !== 0) continue
        var stack = []
        stack.push({ current: peer.id, before: peer.id })
        while (stack.length !== 0) {
          var top = stack.pop()
          let peer_idx = this.getpeeridx(top.current)
          if (visited[peer_idx] !== 0) continue
          this.peers[peer_idx].group = group_num
          group_stake[group_num] += 1
          for (let neighbor_id of this.peers[peer_idx].connected) {
            if (neighbor_id != top.before) stack.push({ current: neighbor_id, before: top.current })
          }
          visited[peer_idx] = 1
        }
        group_num += 1
      }
      this.group_stake = group_stake
    },
    getpeeridx(peer_id) {
      return this.peers.findIndex(obj => obj.id === peer_id)
    },
    calcusable() {
      this.peers = this.peers.map(peer => ({
        ...peer,
        usable: (this.group_stake[peer.group] / this.total_peer) * peer.balance
      }))
    },
    clearbalance() {
      const temp = []
      for (const trans of this.to_add_later) {
        const peer = this.peers[this.getpeeridx(trans.from)]
        const to_peer = this.peers[this.getpeeridx(trans.to)]
        if (peer.group !== to_peer.group) {
          temp.push(trans)
        } else {
          to_peer.balance += trans.value
        }
      }
      this.to_add_later = temp
      this.calcusable()
    }
  }
}
</script>

<style>
.overall {
  padding-top: 15px;
}
.app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  justify-content: space-around;
  color: #2c3e50;
  padding-top: 80px;
  display: flex;
  flex-wrap: wrap;
  position: absolute;
  width: 100%;
}
.card-title {
  display: flex;
  justify-content: space-between;
  padding: 8px 10px 8px 20px;
  background-color: #eaeaea;
  min-height: 68px;
}
.card-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 0px 20px 15px 20px;
}
.title {
  font-size: 16px;
}
</style>
