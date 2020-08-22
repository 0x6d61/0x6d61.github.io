<template>
  <div class="console">
    <div v-for="(r,index) in result" :key="index">
      <span class="prmptColor">
        {{ r.prmpt }}
        <span class="commandResult">~ $ {{r.command}}</span>
      </span>
      <div>
        <span
          v-if="r.command.includes('cat')"
          class="commandResult"
          style="content:'\A' ;white-space: pre ;"
        >{{r.result}}</span>
      <span v-else class="commandResult">{{r.result}}</span>
      </div>
    </div>
    <label>
      <span class="prmptColor">
        {{ prmpt }}
        <span style="color:white">~ $ </span>
      </span>
      <input
        autofocus
        class="commandInput"
        type="text"
        v-model="command"
        style="font-family: monospace;font-size:16px;"
        v-on:keydown.enter="execCommand(command)"
      />
    </label>
  </div>
</template>


<script>
import dayjs from "dayjs";

export default {
  name: "App",
  data() {
    return {
      nowTime: dayjs(Date.now()).format("HH:mm:ss"),
      command: ""
    };
  },
  computed: {
    prmpt() {
      return `0x6d61@wei ${this.nowTime}`;
    },
    history() {
      return this.$store.state.history;
    },
    result() {
      return this.$store.state.result;
    }
  },
  methods: {
    execCommand(command) {
      this.$store.dispatch("execCommand", { prmpt: this.prmpt, command });
      this.command = "";
    }
  }
};
</script>

<style>
body {
  background: black;
  font-family: monospace;
  font-size:16px;
}

.prmptColor {
  color: greenyellow;
}

.commandResult {
  color: white;
}

.commandInput {
  outline: none;
  background: black;
  color: white;
  border: none;
  min-width: 70%;
}
</style>