import Vue from "vue";
import Vuex from "vuex";


Vue.use(Vuex);


const fileConstracut = {
  "/": {
    "home": {
      "0x6d61": {
        "file": ["about.txt", "skil.txt", "icon.jpg"],
        "about.txt": `
北海道に住んでいる0x6d61です。
インフラやセキュリティとか仕事でやってました。
今はアプリケーションエンジニアでバックエンドとフロントエンドをフラフラしてます。
主に使用している言語はPython,JavaScriptです。
        `,
        "skill.txt": `
業務経験あり || できる

- AWS
- Node
- Python
- Docker
- Vue

趣味

- Elm
- Svelte
`,
        "icon.jpg": "",
        "sns": {
          "file": ["account.txt"],
          "account.txt": `
Twitter : 0x6d61@gmail.com
github  : https://github.com/0x6d61
mail    : 0x6d61@gmail.com
          `
        }
      }
    }
  }
}

const dirExistence = (currentDir, dirs, fileTree) => {
  if (currentDir in fileTree) {
    const nextDir = dirs[0]
    const leftDirs = dirs.slice(1)
    if (dirs.length === 0) {
      return true
    }
    return dirExistence(nextDir, leftDirs, fileTree[currentDir])
  }

  return false
}

const getFileList = (currentDir, dirs, fileTree) => {
  if (dirs.length === 0) {
    if(currentDir in fileTree && "file" in fileTree[currentDir]) {
      return fileTree[currentDir]["file"]
    }else{
      return []
    }
  }
  
  if (currentDir in fileTree) {
    const nextDir = dirs[0]
    const leftDirs = dirs.slice(1)
    return getFileList(nextDir, leftDirs, fileTree[currentDir])
  }
}

const fileToDisplay = (currentDir, dirs, fileTree) => {
  if (currentDir in fileTree) {
    const nextDir = dirs[0]
    const leftDirs = dirs.slice(1)
    if (dirs.length === 0) {
      return fileTree[currentDir]
    }
    return fileToDisplay(nextDir, leftDirs, fileTree[currentDir])
  }

  return ""
}

const deletePathReturn = path => {

  if (path.includes("..")) {

    const dirs = path.split("/")
    const pathReturnIndex = dirs.indexOf("..")

    dirs.splice(pathReturnIndex - 1, 2)

    return deletePathReturn(`/${dirs.join("/")}`)
  }
  return path
}

const makePath = (path, currentDir) => {
  if (path[0] === "/") {
    return path
  } else if (path[0] !== "/") {
    return `${currentDir}/${path}`
  }
}

const isChangeDirectory = (path, currentDir, fileTree) => {
  const newPath = deletePathReturn(makePath(path, currentDir))
  const dirs = newPath.split("/").filter(d => d !== "")
  const isDirectoryMoved = dirExistence("/", dirs, fileTree)
  if (isDirectoryMoved && !(newPath.includes("."))) {
    return { path: `/${dirs.join("/")}`, result: true }
  } else {
    return { error: `cd: ${path}: No such file or directory`, result: false }
  }
}

export default new Vuex.Store({
  state: {
    result: [],
    history: [],
    currentDirectory: "/home/0x6d61"
  },

  mutations: {
    execCommand(state, payload) {
      const { prmpt, command } = payload
      const parseCommand = command.split(" ")
      const [cmd, ...args] = parseCommand
      this.state.history.push({ command })
      const commandExecResult = {
        prmpt,
        command,
      }
      switch (cmd) {
        case "hello":
          commandExecResult.result = "world"
          break
        case "echo":
          commandExecResult.result = args.join()
          break
        case "ls": {
          const currentPath = args.length > 0 ? deletePathReturn(makePath(args[0], this.state.currentDirectory)) : this.state.currentDirectory
          const dirs = currentPath.split("/").filter(d => d !== "")
          const fileName = dirs[dirs.length-1]
          const newDirs = fileName.includes(".") ? dirs.slice(0,dirs.length-2) : dirs
          const fileList = getFileList("/",newDirs,fileConstracut)
          const isDirExistence = dirExistence("/",newDirs,fileConstracut)
          const isFileExistence =  fileList.some(f => f === fileName)
          if(fileList.length > 0 || isFileExistence || isDirExistence) {
            commandExecResult.result = args.length > 0 ? args[0] : fileList.join(" ")
          }else{
            commandExecResult.result = `ls: ${args[0]}: No such file or directory`
          }
          break
        }
        case "cat":{
          if(args.length > 0) {
            const currentPath = deletePathReturn(makePath(args[0], this.state.currentDirectory))
            const dirs = currentPath.split("/").filter(d => d !== "")
            const fileBody = fileToDisplay("/",dirs,fileConstracut)
            if (fileBody !== "") {
              commandExecResult.result = fileBody
            }else{
              commandExecResult.result = `cat: ${args[0]}: No such file or directory`
            }
          }
          break
        }
        case "cd": {
          if (args[0] === "/") {
            this.state.currentDirectory = "/"
          } else {
            const { path, error, result } = isChangeDirectory(args[0], this.state.currentDirectory, fileConstracut)
            if (result) {
              this.state.currentDirectory = path
            } else {
              commandExecResult.result = error
            }
          }
          break
        }
        case "pwd":
          commandExecResult.result = this.state.currentDirectory
          break
        default:
          commandExecResult.result = `${cmd}: Command not found.  Use 'help' to see the command list.`
          break
      }
      this.state.result.push(commandExecResult)
    }
  },
  actions: {
    execCommand({ commit }, command) {
      commit('execCommand', command)
    }
  }
});
