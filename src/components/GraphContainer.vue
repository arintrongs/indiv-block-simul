<template>
  <div class="container">
    <v-card width="80%" height="auto">
      <v-card-title class="card-title">
        <span class="title">Graph Viewer</span>
      </v-card-title>
      <div class="card-content">
        <d3-network ref="net" :net-nodes="nodes" :options="options" :net-links="links"/>
      </div>
    </v-card>
  </div>
</template>
<script>
import D3Network from 'vue-d3-network'
export default {
  name: 'GraphContainer',
  components: {
    D3Network
  },
  props: {
    peers: Array
  },
  data() {
    return {
      nodeSize: 15
    }
  },
  computed: {
    options() {
      return {
        force: 3000,
        nodeSize: this.nodeSize,
        nodeLabels: true,
        linkLabels: true,
        linkWidth: 2
      }
    },
    nodes() {
      return this.peers.map(peer => ({ id: peer.id, name: `Peer ${peer.id}`, _color: peer.color }))
    },
    links() {
      let links = []
      for (let peer of this.peers) {
        links = links.concat(peer.connected.map(nodeid => ({ sid: peer.id, tid: nodeid })))
      }
      return links
    }
  }
}
</script>
<style scope>
.container {
  width: 100%;
  display: flex;
  justify-content: center;
}
.node-label {
  font-size: 1em;
}
.link-label {
  fill: purple;
  transform: translate(0, 0.5em);
  font-size: 0.8em;
}
.link {
  stroke: #5a5a5a;
}
</style>
