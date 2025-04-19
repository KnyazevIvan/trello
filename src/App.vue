<template>
  <div class="min-h-screen">
    <TrelloBoard />
  </div>
</template>

<script>
import TrelloBoard from './TrelloBoard.vue'

export default {
  name: 'App',
  components: {
    TrelloBoard
  }
}
</script>

<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

* {
  box-sizing: border-box;
}
</style>