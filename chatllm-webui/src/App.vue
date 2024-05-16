<template>

    <div v-if="!loggedInit">
      <!-- 路由视图用于显示当前路由匹配的组件 -->
      <router-view class="router-view-popup" v-if="!loggedInit" @login-success="handleLoginSuccessByUser" @login-success-admin="handleLoginSuccessByAdmin"></router-view>

      <!-- 只有当用户没有登录时，才显示登录组件 -->
      <login-form-component v-if="!loggedInit" @login-success="handleLoginSuccessByUser" @login-success-admin="handleLoginSuccessByAdmin" />
    </div>


  <div v-if="showChart" class=" rounded-3xl w-full h-full fixed flex items-center justify-center z-10 bg-white">
        <Chart :data="data" @closeChart="toggleShowChart"></Chart>
  </div>
  <div class="flex h-screen antialiased text-gray-800">
    <div class="flex flex-row h-full w-full overflow-x-hidden">
      <!-- 侧边栏 -->
      <div class="flex flex-col py-8 pl-6 pr-2 w-64 bg-white flex-shrink-0">
        <div class="flex flex-row items-center justify-center h-12 w-full">
        <!-- 主页面左上角图片与标题 -->
          <div class="flex items-center justify-center rounded-2xl text-indigo-700 bg-indigo-100 h-10 w-10">
            <i><img class="w-8 h-8" src="./assets/icon/chaticon.png"></i>
          </div>
          <div class="ml-2 font-bold text-2xl">ChatLLM</div>
        </div>
        <!-- 介绍 -->
        <div class="flex flex-col items-center bg-indigo-100 border border-gray-200 mt-4 w-full py-6 px-4 rounded-lg">
          <h1 class="text-justify">基于LangChain、知识图谱、本地大语言模型、向量数据库, 提供基于私有知识的自动问答服务</h1>
        </div>

        <!-- 配置 -->
        <div class="flex flex-col bg-indigo-100 border border-gray-200 mt-4 w-full py-6 px-4 rounded-lg">
          <div>
              <label>Language Model</label>
              <select class="w-48 ring-1 ring-black rounded-md shadow-inner" v-model="selected_model">
                <option>{{ selected_model }}</option>
              </select>
            </div>
            <div>
              <label>Knowledge Base</label>
              <select class="w-48 ring-1 ring-black rounded-md shadow-inner" v-model="selected_base">
                <option>Graph</option>
                <option>Vector</option>
              </select>
            </div>
        </div>
        <div class="flex flex-col bg-indigo-100 border border-gray-200 mt-4 w-full py-6 px-4 rounded-lg">
          <div class="">
            <label>history_len:{{history_len}}</label>
            <input class="w-48 rounded-lg overflow-hidden appearance-none bg-gray-400 h-3 w-140" type="range" min="0" max="5" step="1" v-model="history_len" />
          </div>
          <div class="">
            <label>top_k:{{top_k}}</label>
            <input class="w-48 rounded-lg overflow-hidden appearance-none bg-gray-400 h-3 w-140" type="range" min="3" max="10" step="1" v-model="top_k" />
          </div>
          <div class="">
            <label>top_p:{{top_p}}</label>
            <input class="w-48 rounded-lg overflow-hidden appearance-none bg-gray-400 h-3 w-140" type="range" min="0" max="1" step="0.1" v-model="top_p" />
          </div>
          <div class="">
            <label>temperature:{{temperature}}</label>
            <input class="w-48 rounded-lg overflow-hidden appearance-none bg-gray-400 h-3 w-140" type="range" min="0" max="1" step="0.01" v-model="temperature" />
          </div>
        </div>

        <br>
        <br>
        <div v-if="loggedInAdmin" class="file-upload-container">
          <input type="file" id="fileInput" @change="onFileSelected" class="file-input">
          <label for="fileInput" class="file-label">选取文件</label>
          <button @click="submitFile" class="upload-btn">上传文件</button>
        </div>
      </div>
      <!-- 主体 -->
      <div class="flex flex-col flex-auto h-full p-6">
        <!-- ChatBox -->
        <div class="flex flex-col flex-auto flex-shrink-0 rounded-2xl bg-gray-100 h-full p-4">
          <div class="flex flex-col h-full overflow-x-auto mb-4">
              <!-- examples 无对话记录时显示  -->
            <div class=" h-full" v-if="chat_history && chat_history.length === 0">
                <img style="float: left" class="ml-20 w-8/12" src="./assets/icon/doctor.png" >
                <!--按钮-->

              <!-- 普通用户按钮（不做改变，仅作对比） -->
              <button v-if="!loggedInUser && !loggedInAdmin" style="float: left; display: flex; justify-content: center; align-items: center; height: 40px; width:120px; margin: 5px;  color: black; border: none; border-radius: 5px; cursor:pointer;" id="common-user">普通用户</button>

              <!-- 私人用户按钮 和 管理员按钮，当点击时调用 goToLoginRegister 方法 -->
              <button v-if="!loggedInUser && !loggedInAdmin" @click="goToLoginRegisterByUser" style="float: left; display: flex; justify-content: center; align-items: center; height: 40px; width:120px; margin: 5px; background-color: #008CBA; color: white; border: none; border-radius: 5px; cursor:pointer;">私人用户登录</button>
              <div v-else-if="loggedInUser" style="float: left; display: flex; justify-content: center; align-items: center;">
                <i class="fas fa-user"></i> &nbsp; 欢迎您，{{ loggedInUser }}&nbsp;&nbsp;
              </div>
              <div v-if="loggedInUser" style="float: left; display: flex; justify-content: center; align-items: center;">
                <b @click="exitLogin">注销</b>
              </div>

              <button v-if="!loggedInUser && !loggedInAdmin" @click="goToLoginRegisterByAdmin" style="float: left; display: flex; justify-content: center; align-items: center; height: 40px; width:120px; margin: 5px; background-color: #f44336; color: white; border: none; border-radius: 5px; cursor:pointer;">管理员登录</button>
              <div v-else-if="loggedInAdmin" style="float: left; display: flex; justify-content: center; align-items: center;">
                <i class="fas fa-user"></i> &nbsp; 欢迎您，{{ loggedInAdmin }}&nbsp;&nbsp;
              </div>

              <div v-if="loggedInAdmin" style="float: left; display: flex; justify-content: center; align-items: center;">
                <b @click="exitLogin">注销</b>
              </div>

              <div style="clear: both;"></div>
                <span class="ml-20 mt-1 text-left text-2xl font-bold">你可以这样问：</span>
                <div class="grid grid-cols-3 gap-5 mt-5">
                  <div class=" px-5 h-20 w-52 max-w-screen-sm rounded-lg border border-solid border-slate-600 flex mx-auto"  v-for="(item,index) in question_examples" :key="'example-'+index">
                    <button @click="exampleClickFunc" class="text-center">{{ item }}</button>
                  </div>
                </div>
            </div>
              <!-- 对话 -->
            <div class="flex flex-col h-full ">
              <!-- 对话 -->
              <div class="grid gap-y-2" v-for="(item) in chat_history" :key="'chat-'+item.id">
                <!-- 用户 -->
                <div class="p-3 rounded-lg">
                  <!-- 行 -->
                  <div class="flex justify-start flex-row-reverse">
                    <!-- 头像框 -->
                    <div class="flex justify-self-start items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0">
                      <i><img class="w-8 h-8" src="./assets/icon/user.png"></i>
                    </div>
                    <!-- 内容 -->
                    <div class="relative mr-3 text-sm bg-white py-2 px-4 shadow rounded-xl">
                      <div>
                        <p>{{item.question}}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- 机器人 -->
                <div class="p-3 rounded-lg">
                  <!-- 行 -->
                  <div class="flex flex-row">
                    <!-- 头像框 -->
                    <div class="flex justify-self-start items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0">
                      <i><img class="w-8 h-8" src="./assets/icon/robot.png"></i>
                    </div>
                    <!-- 内容 -->
                    <div class="relative ml-3 text-sm bg-white py-2 px-4 shadow rounded-xl ">
                      <div class="max-w-2xl text-wrap overflow-hidden">
                        <p >{{item.done?item.answer:"思考中..."}}</p>
                      </div>
                    </div>
                  </div>
                  <div class="self-end ml-10" v-if="item.done">
                    <button @click="showChartFunc(item.data)"><span class="ml-3 text-sm font-thin text-zinc-400">查看关系图</span></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- 输入发送栏 -->
          <div class="flex flex-row items-center h-16 rounded-xl bg-white w-full px-4">
            <!-- clear按钮 -->
            <div>
              <button @click="clearChatHistory" class="flex items-center justify-center text-gray-400 hover:text-gray-600" >
                <label>Clear</label>
                <img class="w-5 h-5" src="./assets/icon/clear.png"/>
              </button>
            </div>
            <!-- 输入框底栏 -->
            <div class="flex-grow ml-4 ">
              <div class="relative w-full">
                <!-- 输入框 -->
                <input type="text" placeholder="请输入您的问题..."  @keyup.enter="stream_answer" ref="inputRef"
                v-model.lazy="question" class="flex w-full border rounded-xl focus:outline-none focus:border-indigo-300 pl-4 h-10"/>
              </div>
            </div>
            <!-- 发送框底栏 -->
            <div class="ml-4">
              <!-- 发送按钮 -->
              <button :class="{ 'cursor-not-allowed shadow-none hover:shadow-none': disableSendButton }"
                :disabled="disableSendButton"
                class=" flex items-center bg-gradient-to-br from-[#6025F5] to-[#FF5555] justify-center rounded-xl text-white px-4 py-1 flex-shrink-0 text-base font-medium transition duration-200 hover:shadow-md hover:shadow-[#321369]"
                @click="stream_answer"
                >
                <span>Send</span>
                <i class="ml-2">
                  <i><img class="w-8 h-8" src="./assets/icon/send.png" ></i>
                </i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>
<script>
import Chart from "./components/MyChart.vue";
import axios from 'axios';

// document.getElementById('private-user').onclick = function() {
//   alert('您正在尝试作为“私人用户”登录，请先注册或登录！');
// }
//
// // 绑定管理员按钮的点击事件
// document.getElementById('admin-user').onclick = function() {
//   alert('您正在尝试作为“管理员”登录，请先注册或登录！');
// }
export default {
  components: {
    Chart
  },
  data() {
    return {
      selectedFileName: null,
      disableSendButton: false,
      showChart:false,
      question:'',
      history_len: 5,
      top_k: 5,
      top_p: 0.7,
      temperature: 0.8,
      selected_model: '模型1',
      selected_base: 'Graph',
      chat_history: [],  // 存储历史记录
      question_examples:[
        "百日咳有哪些并发症？","感冒了能吃油条吗？","喉炎有哪些症状？",
        "张三患有什么疾病","问题E:（内容内容）","问题F:（内容内容）",
       ],
      data:[],
      stream_data:"",
      selectedFile: null,
      loggedInUser: null,
      loggedInAdmin:null,
      loggedInit:null,
    };
  },
  methods: {
    // 当用户选择文件时调用
    onFileSelected(event) {
      this.selectedFile = event.target.files[0];
    },
    // 点击按钮时调用，上传文件
    submitFile() {
      if (!this.selectedFile) {
        alert('请先选择一个文件！');
        return;
      }

      let formData = new FormData();
      formData.append('file', this.selectedFile);

      axios.post('http://10.90.1.19:22507/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then(response => {
        console.log(response);
        alert('文件上传成功！');
      }).catch(error => {
        console.error(error);
      });
    },
    stream_answer(){
      if(this.question==''){
        alert('请输入你的问题！');
      }else{
        const vm = this
        this.disableSendButton=true;
        // alert('提问内容：'+this.question);
        var i = 0;
        var question = this.question
        
        if(this.chat_history&&this.chat_history.length!=0){
          i = this.chat_history.length;
        }
        this.chat_history.push({question:question,answer:'',done:false,data:undefined,id:i})
        this.question = ''
        this.$refs.inputRef.value = ''; // 清空输入框的值
        var dataToSend = {  // 请求负载
            "question": question,
            "top_k": this.top_k,
            "history_len": this.history_len,
            "temperature": this.temperature,
            "top_p": this.top_p,
            "knowledgebase": this.selected_base,
            "chat_history": this.chat_history
          }
        
        fetch('http://10.90.1.19:22507/predict', {
                method: "POST",
                body: JSON.stringify(dataToSend),
                headers: {
                  'Content-Type': 'application/json'
                },
              })
        .then(response => {
          // 首先检查响应是否 ok
          if(!response.ok) throw new Error(response.statusText);

          // 读取这个可读流，每次获取到数据都更新到我们的数据对象中
          const reader = response.body.getReader();

          // 这个函数被递归调用，以便每次数据到达时都能被处理
          const stream = new ReadableStream({
            start(controller) {
              function push() {
                reader.read().then(({done, value}) => {
                  // 当我们完全读完数据后，关闭流
                  if (done) {
                    controller.close();
                    return;
                  }
                  // 获取到数据后，我们直接把数据放到流中
                  // const text = new TextDecoder().decode(value);
                  // console.log(text)
                  // this.stream_data = text
                  // 递归调用，以便读取下一段数据
                  vm.$nextTick(() => {
                    const text = new TextDecoder().decode(value);
                    const data = JSON.parse(text)
                    vm.chat_history[i].answer = data.answer;  // 回答结果
                    vm.chat_history[i].done = true;  // 设置当前提问回答完成，显示回答信息
                    vm.chat_history[i].data = data.context;  // {node:{id, category, name}, link:{source, target, time, label}}
                    vm.disableSendButton=false;
                  })
                  push();
                })
              }
              push();
            }
          });
          return new Response(stream, { headers: { "Content-Type": "text/html" } });
        })
        .catch(error => {
          // 处理异常
          console.error(error);
        });
      }
    },
    selectFile(e){
      this.selectedFileName = e.target.files[0];
    },
    toggleShowChart(){
      if(this.showChart == true){
        this.showChart = false;
      }else{
        this.showChart = true;
      }
    },
    showChartFunc(param){
      this.data = param;
      this.toggleShowChart()
    },
    exampleClickFunc(e) {
      this.question=e.target.innerText;
      this.sendQuestion;
    },
    clearChatHistory(){
      this.chat_history=[]
      this.data=[]
    },
    sendQuestion() {
      if(this.question==''){
        alert('请输入你的问题！');
      }else{
        this.disableSendButton=true;
        // alert('提问内容：'+this.question);
        var i = 0;
        var question = this.question
        this.question = ''
        if(this.chat_history&&this.chat_history.length!=0){
          i = this.chat_history.length;
        }
        this.chat_history.push({question:question,answer:'',done:false,data:undefined,id:i})
        
        var dataToSend = {  // 请求负载
          "question": question,
          "top_k": this.top_k,
          "history_len": this.history_len,
          "temperature": this.temperature,
          "top_p": this.top_p,
          "knowledgebase": this.selected_base,
          "chat_history": this.chat_history
        }
        axios.post('http://10.90.1.19:22507/predict', dataToSend)
        .then(response => {
          // 处理成功返回的数据
          this.chat_history[i].answer = response.data.answer;  // 回答结果
          this.chat_history[i].done = true;  // 设置当前提问回答完成，显示回答信息
          this.chat_history[i].data = response.data.context;  // {node:{id, category, name}, link:{source, target, time, label}}
          this.disableSendButton=false;
          // this.console.log(response)
        })
        .catch(error => {
          // 处理请求错误
          console.error('Error:', error);
        });
        
      }
    },
    goToLoginRegisterByUser() {
      // 跳转到LoginRegister组件页面
      this.$router.push({name: 'LoginRegister',  query: { role: 'user' } });
      // const publicPath = process.env.BASE_URL; // 这将解析为开发服务器的根目录
      // window.location.href = `${publicPath}/load/load.html`;
    },
    goToLoginRegisterByAdmin() {
      // 跳转到LoginRegister组件页面
      this.$router.push({name: 'LoginRegister',  query: { role: 'admin' } });
      // const publicPath = process.env.BASE_URL; // 这将解析为开发服务器的根目录
      // window.location.href = `${publicPath}/load/load.html`;
    },
    handleLoginSuccessByUser(username) {
      // 假设您有一个data属性来更新按钮文本
      this.loggedInUser = username;
      this.loggedInit = "logged";

      // 现在可以使用 this.loggedInUser 来更改界面
      // 例如将文本从 "私人账号" 更改为用户的名字
    },
    handleLoginSuccessByAdmin(adminname) {
      // 假设您有一个data属性来更新按钮文本
      this.loggedInAdmin = adminname;
      this.loggedInit = "logged";

      // 现在可以使用 this.loggedInUser 来更改界面
      // 例如将文本从 "私人账号" 更改为用户的名字
    },

    exitLogin(){
      this.loggedInUser = null;
      this.loggedInAdmin = null;
      this.loggedInit = null;
    }

  }
}
</script>
<style>
.router-view-popup {
  position: fixed; /* 或者 absolute 根据需求选择 */
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 100; /* 确保在最上层 */
  width: 80%; /* 根据需要调整 */
  height: 60%; /* 根据需要调整 */
  background-color: white;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1); /* 可选: 添加一些阴影效果 */
  padding: 20px;
  overflow: auto; /* 如果内容超出高度,添加滚动条 */
}

.file-upload-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-input {
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
}

.file-label {
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

.file-label:hover,
.upload-btn:hover {
  background-color: #0056b3;
}

.upload-btn {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}
 </style>