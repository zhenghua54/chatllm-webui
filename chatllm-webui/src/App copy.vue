<template>
  <div v-if="showChart" class=" rounded-3xl w-full h-full fixed flex items-center justify-center z-40 bg-white">
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
        
      </div>
      <!-- 主体 -->
      <div class="flex flex-col flex-auto h-full p-6">
        <!-- ChatBox -->
        <div class="flex flex-col flex-auto flex-shrink-0 rounded-2xl bg-gray-100 h-full p-4">
          <div class="flex flex-col h-full overflow-x-auto mb-4">
              <!-- examples 无对话记录时显示  -->
            <div class=" h-full" v-if="chat_history && chat_history.length === 0">
                <img class="ml-20 w-5/12" src="./assets/icon/doctor.png" >
                <span class="ml-20 mt-1 text-left text-2xl font-bold">你可以这样问：</span>
                <div class="grid grid-cols-3 gap-5 mt-5">
                  <div class=" px-5 h-20 min-w-fit max-w-screen-sm rounded-lg border border-solid border-slate-600 shadow-lg flex items-center justify-between mx-auto"  v-for="(item,index) in question_examples" :key="'example-'+index">
                    <button @click="exampleClickFunc">{{ item }}</button>
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
                <input type="text" placeholder="请输入您的问题..." v-model.lazy="question" class="flex w-full border rounded-xl focus:outline-none focus:border-indigo-300 pl-4 h-10"/>
              </div>
            </div>
            <!-- 发送框底栏 -->
            <div class="ml-4">
              <!-- 发送按钮 -->
              <button :class="{ 'cursor-not-allowed shadow-none hover:shadow-none': disableSendButton }"
                :disabled="disableSendButton"
                class=" flex items-center bg-gradient-to-br from-[#6025F5] to-[#FF5555] justify-center rounded-xl text-white px-4 py-1 flex-shrink-0 text-base font-medium transition duration-200 hover:shadow-md hover:shadow-[#321369]"
                @click="sendQuestion"
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
export default {
  components: {
    Chart
  },
  data() {
    return {
      disableSendButton: false,
      showChart:false,
      question:'',
      history_len: 0,
      top_k: 5,
      top_p: 0.7,
      temperature: 0.2,
      selected_model: '模型1',
      selected_base: 'Graph',
      chat_history: [{
        question:"这是第一个问题？",
        answer:"在这个瞬息万变的世界里，我们发现自己被信息的海洋所淹没。科技的飞速发展改变了我们的生活方式，而社交媒体的兴起连接了世界的每一个角落。然而，在这一切的背后，我们是否真正找到了内心的平静？或许，我们需要在数字的喧嚣中寻找那片宁静的角落，重新发现与自己的对话。在这个快节奏的时代，重新连接内心或许是我们迈向更有意义生活的第一步。",
        data:{'nodes': [{'id': 6533, 'category': 'Disease', 'name': '心脏病'}, {'id': 17833, 'category': 'Food', 'name': '鸡肉'}, {'id': 17800, 'category': 'Food', 'name': '鹌鹑蛋'}, {'id': 18932, 'category': 'Food', 'name': '白酒'}, {'id': 17468, 'category': 'Food', 'name': '鸡腿'}, {'id': 18788, 'category': 'Food', 'name': '芝麻'}, {'id': 18921, 'category': 'Food', 'name': '松子仁'}, {'id': 20565, 'category': 'Food', 'name': '鹅肉'}, {'id': 24823, 'category': 'Department', 'name': '心内科'}, {'id': 15626, 'category': 'Drug', 'name': '依托红霉素片'}, {'id': 14427, 'category': 'Drug', 'name': '依托红霉素颗粒'}, {'id': 22679, 'category': 'Check', 'name': '胸部平片'}, {'id': 23215, 'category': 'Check', 'name': '心电图'}, {'id': 22568, 'category': 'Check', 'name': '多普勒超声心动图'}, {'id': 21753, 'category': 'Check', 'name': '心血管MRI检查'}, {'id': 22986, 'category': 'Check', 'name': '胸部MRI'}, {'id': 22804, 'category': 'Check', 'name': '心脏血管超声检查'}, {'id': 22333, 'category': 'Check', 'name': '冠状动脉造影'}, {'id': 21777, 'category': 'Check', 'name': '红细胞磷丙糖异构酶'}, {'id': 24040, 'category': 'Check', 'name': '心音图检查'}, {'id': 24124, 'category': 'Check', 'name': '二维超声心动图'}, {'id': 837, 'category': 'Symptom', 'name': '畏寒'}, {'id': 2561, 'category': 'Symptom', 'name': '疲乏'}, {'id': 1648, 'category': 'Symptom', 'name': '心律失常'}, {'id': 1770, 'category': 'Symptom', 'name': '硬化'}, {'id': 2292, 'category': 'Symptom', 'name': '阵发性夜间呼吸困难'}, {'id': 2662, 'category': 'Symptom', 'name': '右室肥厚'}, {'id': 4004, 'category': 'Symptom', 'name': '肌痛'}, {'id': 89, 'category': 'Symptom', 'name': '瘫痪'}, {'id': 2132, 'category': 'Symptom', 'name': '肝脏肿大'}, {'id': 156, 'category': 'Symptom', 'name': '卵圆窝未闭'}, {'id': 814, 'category': 'Symptom', 'name': '肝大'}, {'id': 883, 'category': 'Symptom', 'name': '湿啰音'}, {'id': 219, 'category': 'Symptom', 'name': '呼吸衰竭'}, {'id': 4287, 'category': 'Symptom', 'name': '心动过速'}, {'id': 3600, 'category': 'Symptom', 'name': '咳嗽'}, {'id': 1427, 'category': 'Symptom', 'name': '头昏'}, {'id': 3845, 'category': 'Symptom', 'name': '肝肿大'}, {'id': 2923, 'category': 'Symptom', 'name': '低热'}, {'id': 612, 'category': 'Symptom', 'name': '咯血'}, {'id': 1662, 'category': 'Symptom', 'name': '左胸痛'}, {'id': 1108, 'category': 'Symptom', 'name': '震颤'}, {'id': 901, 'category': 'Symptom', 'name': '心功能失代偿'}, {'id': 1925, 'category': 'Symptom', 'name': '动脉粥样硬化'}, {'id': 3495, 'category': 'Symptom', 'name': '劳累后心悸'}, {'id': 3820, 'category': 'Symptom', 'name': '劳动耐力下降'}, {'id': 2116, 'category': 'Symptom', 'name': '腹水'}, {'id': 3599, 'category': 'Symptom', 'name': '啰音'}, {'id': 3597, 'category': 'Symptom', 'name': '心悸'}, {'id': 3333, 'category': 'Symptom', 'name': '狭窄杂音'}, {'id': 1742, 'category': 'Symptom', 'name': '房间隔缺损'}, {'id': 2973, 'category': 'Symptom', 'name': '心音遥远'}, {'id': 2814, 'category': 'Symptom', 'name': '胃肠道淤血'}, {'id': 2488, 'category': 'Symptom', 'name': '浮肿'}, {'id': 2784, 'category': 'Symptom', 'name': '紫癜'}, {'id': 1087, 'category': 'Symptom', 'name': '低血压'}, {'id': 1049, 'category': 'Symptom', 'name': '收缩期震颤'}, {'id': 244, 'category': 'Symptom', 'name': '心排血量减少'}, {'id': 2139, 'category': 'Symptom', 'name': '心肌梗死'}, {'id': 3797, 'category': 'Symptom', 'name': '气急'}, {'id': 2270, 'category': 'Symptom', 'name': '端坐呼吸'}, {'id': 54, 'category': 'Symptom', 'name': '脾肿大'}, {'id': 2271, 'category': 'Symptom', 'name': '背痛'}, {'id': 886, 'category': 'Symptom', 'name': '肾功能衰竭'}, {'id': 2888, 'category': 'Symptom', 'name': '收缩期杂音'}, {'id': 1245, 'category': 'Symptom', 'name': '劳力性呼吸困难'}, {'id': 1626, 'category': 'Symptom', 'name': '头晕'}, {'id': 1424, 'category': 'Symptom', 'name': '心力衰竭'}, {'id': 3673, 'category': 'Symptom', 'name': '运动功能障碍'}, {'id': 2011, 'category': 'Symptom', 'name': '猝死'}, {'id': 3725, 'category': 'Symptom', 'name': '抬举性搏动'}, {'id': 2360, 'category': 'Symptom', 'name': '房颤'}, {'id': 3670, 'category': 'Symptom', 'name': '桶状胸'}, {'id': 4045, 'category': 'Symptom', 'name': '舒张期震颤'}, {'id': 4188, 'category': 'Symptom', 'name': '骨膜炎'}, {'id': 1583, 'category': 'Symptom', 'name': '呕吐'}, {'id': 2487, 'category': 'Symptom', 'name': '右心衰竭'}, {'id': 1113, 'category': 'Symptom', 'name': '瘀血'}, {'id': 378, 'category': 'Symptom', 'name': '疲劳'}, {'id': 4226, 'category': 'Symptom', 'name': '体循环淤血'}, {'id': 94, 'category': 'Symptom', 'name': '水肿'}, {'id': 2277, 'category': 'Symptom', 'name': '胀痛'}, {'id': 3246, 'category': 'Symptom', 'name': '气短'}, {'id': 644, 'category': 'Symptom', 'name': '心率增快'}, {'id': 722, 'category': 'Symptom', 'name': '乏力'}, {'id': 2384, 'category': 'Symptom', 'name': '喘息'}, {'id': 4071, 'category': 'Symptom', 'name': '心脏杂音'}, {'id': 3601, 'category': 'Symptom', 'name': '毒血症'}, {'id': 1718, 'category': 'Symptom', 'name': '三尖瓣狭窄'}, {'id': 3789, 'category': 'Symptom', 'name': '咳痰'}, {'id': 2018, 'category': 'Symptom', 'name': '黄疸'}, {'id': 213, 'category': 'Symptom', 'name': '嗳气'}, {'id': 3788, 'category': 'Symptom', 'name': '呼吸困难'}, {'id': 840, 'category': 'Symptom', 'name': '紫绀'}, {'id': 133, 'category': 'Symptom', 'name': '恶心'}, {'id': 351, 'category': 'Symptom', 'name': '肺动脉狭窄'}, {'id': 15, 'category': 'Symptom', 'name': '贫血'}, {'id': 3312, 'category': 'Symptom', 'name': '颈静脉充盈'}, {'id': 2851, 'category': 'Symptom', 'name': '右心功能不全'}, {'id': 2131, 'category': 'Symptom', 'name': '颈静脉怒张'}, {'id': 902, 'category': 'Symptom', 'name': '心绞痛'}, {'id': 1008, 'category': 'Symptom', 'name': '肺淤血'}, {'id': 1561, 'category': 'Symptom', 'name': '食欲不振'}, {'id': 251, 'category': 'Symptom', 'name': '发绀'}, {'id': 976, 'category': 'Symptom', 'name': '慢性咳嗽'}, {'id': 2724, 'category': 'Symptom', 'name': '下肢水肿'}, {'id': 66, 'category': 'Symptom', 'name': '胸痛'}, {'id': 2167, 'category': 'Symptom', 'name': '钙化'}, {'id': 8522, 'category': 'Disease', 'name': '感染性疾病所致贫血'}, {'id': 4820, 'category': 'Disease', 'name': '缺血性结肠炎'}, {'id': 10791, 'category': 'Disease', 'name': '老年人吸入性肺炎'}, {'id': 4453, 'category': 'Disease', 'name': '小儿结核病'}, {'id': 10456, 'category': 'Disease', 'name': '老年人急进性肾炎'}, {'id': 8594, 'category': 'Disease', 'name': '高原红细胞增多症'}, {'id': 4985, 'category': 'Disease', 'name': '高血压肾病'}, {'id': 12237, 'category': 'Disease', 'name': '妊娠合并哮喘'}, {'id': 8526, 'category': 'Disease', 'name': '感应性妄想性障碍'}, {'id': 7234, 'category': 'Disease', 'name': '先天性再生障碍性贫血'}, {'id': 6490, 'category': 'Disease', 'name': '肺结核'}, {'id': 5115, 'category': 'Disease', 'name': '脑梗塞'}, {'id': 20861, 'category': 'Food', 'name': '豌豆绿豆粥'}, {'id': 19457, 'category': 'Food', 'name': '素炒菠菜'}, {'id': 17658, 'category': 'Food', 'name': '银耳冬瓜羹'}, {'id': 18851, 'category': 'Food', 'name': '芥菜炒蚕豆'}, {'id': 17093, 'category': 'Food', 'name': '素炒小白菜'}, {'id': 19500, 'category': 'Food', 'name': '五香蒜苔'}, {'id': 20640, 'category': 'Food', 'name': '马兰头菜粥'}, {'id': 19230, 'category': 'Food', 'name': '苦瓜粥'}, {'id': 13403, 'category': 'Drug', 'name': '琥乙红霉素颗粒'}, {'id': 12986, 'category': 'Drug', 'name': '琥乙红霉素片'}, {'id': 16636, 'category': 'Drug', 'name': '地高辛片'}], 'links': [{'source': 6533, 'target': 17833, 'label': 'no_eat'}, {'source': 6533, 'target': 17800, 'label': 'no_eat'}, {'source': 6533, 'target': 18932, 'label': 'no_eat'}, {'source': 6533, 'target': 17468, 'label': 'no_eat'}, {'source': 6533, 'target': 17833, 'label': 'do_eat'}, {'source': 6533, 'target': 18788, 'label': 'do_eat'}, {'source': 6533, 'target': 18921, 'label': 'do_eat'}, {'source': 6533, 'target': 20565, 'label': 'do_eat'}, {'source': 6533, 'target': 24823, 'label': 'belongs_to'}, {'source': 6533, 'target': 15626, 'label': 'common_drug'}, {'source': 6533, 'target': 14427, 'label': 'common_drug'}, {'source': 6533, 'target': 22679, 'label': 'need_check'}, {'source': 6533, 'target': 23215, 'label': 'need_check'}, {'source': 6533, 'target': 22568, 'label': 'need_check'}, {'source': 6533, 'target': 21753, 'label': 'need_check'}, {'source': 6533, 'target': 22986, 'label': 'need_check'}, {'source': 6533, 'target': 22804, 'label': 'need_check'}, {'source': 6533, 'target': 22333, 'label': 'need_check'}, {'source': 6533, 'target': 21777, 'label': 'need_check'}, {'source': 6533, 'target': 24040, 'label': 'need_check'}, {'source': 6533, 'target': 24124, 'label': 'need_check'}, {'source': 6533, 'target': 837, 'label': 'has_symptom'}, {'source': 6533, 'target': 2561, 'label': 'has_symptom'}, {'source': 6533, 'target': 1648, 'label': 'has_symptom'}, {'source': 6533, 'target': 1770, 'label': 'has_symptom'}, {'source': 6533, 'target': 2292, 'label': 'has_symptom'}, {'source': 6533, 'target': 2662, 'label': 'has_symptom'}, {'source': 6533, 'target': 4004, 'label': 'has_symptom'}, {'source': 6533, 'target': 89, 'label': 'has_symptom'}, {'source': 6533, 'target': 2132, 'label': 'has_symptom'}, {'source': 6533, 'target': 156, 'label': 'has_symptom'}, {'source': 6533, 'target': 814, 'label': 'has_symptom'}, {'source': 6533, 'target': 883, 'label': 'has_symptom'}, {'source': 6533, 'target': 219, 'label': 'has_symptom'}, {'source': 6533, 'target': 4287, 'label': 'has_symptom'}, {'source': 6533, 'target': 3600, 'label': 'has_symptom'}, {'source': 6533, 'target': 1427, 'label': 'has_symptom'}, {'source': 6533, 'target': 3845, 'label': 'has_symptom'}, {'source': 6533, 'target': 2923, 'label': 'has_symptom'}, {'source': 6533, 'target': 612, 'label': 'has_symptom'}, {'source': 6533, 'target': 1662, 'label': 'has_symptom'}, {'source': 6533, 'target': 1108, 'label': 'has_symptom'}, {'source': 6533, 'target': 901, 'label': 'has_symptom'}, {'source': 6533, 'target': 1925, 'label': 'has_symptom'}, {'source': 6533, 'target': 3495, 'label': 'has_symptom'}, {'source': 6533, 'target': 3820, 'label': 'has_symptom'}, {'source': 6533, 'target': 2116, 'label': 'has_symptom'}, {'source': 6533, 'target': 3599, 'label': 'has_symptom'}, {'source': 6533, 'target': 3597, 'label': 'has_symptom'}, {'source': 6533, 'target': 3333, 'label': 'has_symptom'}, {'source': 6533, 'target': 1742, 'label': 'has_symptom'}, {'source': 6533, 'target': 2973, 'label': 'has_symptom'}, {'source': 6533, 'target': 2814, 'label': 'has_symptom'}, {'source': 6533, 'target': 2488, 'label': 'has_symptom'}, {'source': 6533, 'target': 2784, 'label': 'has_symptom'}, {'source': 6533, 'target': 1087, 'label': 'has_symptom'}, {'source': 6533, 'target': 1049, 'label': 'has_symptom'}, {'source': 6533, 'target': 244, 'label': 'has_symptom'}, {'source': 6533, 'target': 2139, 'label': 'has_symptom'}, {'source': 6533, 'target': 3797, 'label': 'has_symptom'}, {'source': 6533, 'target': 2270, 'label': 'has_symptom'}, {'source': 6533, 'target': 54, 'label': 'has_symptom'}, {'source': 6533, 'target': 2271, 'label': 'has_symptom'}, {'source': 6533, 'target': 886, 'label': 'has_symptom'}, {'source': 6533, 'target': 2888, 'label': 'has_symptom'}, {'source': 6533, 'target': 1245, 'label': 'has_symptom'}, {'source': 6533, 'target': 1626, 'label': 'has_symptom'}, {'source': 6533, 'target': 1424, 'label': 'has_symptom'}, {'source': 6533, 'target': 3673, 'label': 'has_symptom'}, {'source': 6533, 'target': 2011, 'label': 'has_symptom'}, {'source': 6533, 'target': 3725, 'label': 'has_symptom'}, {'source': 6533, 'target': 2360, 'label': 'has_symptom'}, {'source': 6533, 'target': 3670, 'label': 'has_symptom'}, {'source': 6533, 'target': 4045, 'label': 'has_symptom'}, {'source': 6533, 'target': 4188, 'label': 'has_symptom'}, {'source': 6533, 'target': 1583, 'label': 'has_symptom'}, {'source': 6533, 'target': 2487, 'label': 'has_symptom'}, {'source': 6533, 'target': 1113, 'label': 'has_symptom'}, {'source': 6533, 'target': 378, 'label': 'has_symptom'}, {'source': 6533, 'target': 4226, 'label': 'has_symptom'}, {'source': 6533, 'target': 94, 'label': 'has_symptom'}, {'source': 6533, 'target': 2277, 'label': 'has_symptom'}, {'source': 6533, 'target': 3246, 'label': 'has_symptom'}, {'source': 6533, 'target': 644, 'label': 'has_symptom'}, {'source': 6533, 'target': 722, 'label': 'has_symptom'}, {'source': 6533, 'target': 2384, 'label': 'has_symptom'}, {'source': 6533, 'target': 4071, 'label': 'has_symptom'}, {'source': 6533, 'target': 3601, 'label': 'has_symptom'}, {'source': 6533, 'target': 1718, 'label': 'has_symptom'}, {'source': 6533, 'target': 3789, 'label': 'has_symptom'}, {'source': 6533, 'target': 2018, 'label': 'has_symptom'}, {'source': 6533, 'target': 213, 'label': 'has_symptom'}, {'source': 6533, 'target': 3788, 'label': 'has_symptom'}, {'source': 6533, 'target': 840, 'label': 'has_symptom'}, {'source': 6533, 'target': 133, 'label': 'has_symptom'}, {'source': 6533, 'target': 351, 'label': 'has_symptom'}, {'source': 6533, 'target': 15, 'label': 'has_symptom'}, {'source': 6533, 'target': 3312, 'label': 'has_symptom'}, {'source': 6533, 'target': 2851, 'label': 'has_symptom'}, {'source': 6533, 'target': 2131, 'label': 'has_symptom'}, {'source': 6533, 'target': 902, 'label': 'has_symptom'}, {'source': 6533, 'target': 1008, 'label': 'has_symptom'}, {'source': 6533, 'target': 1561, 'label': 'has_symptom'}, {'source': 6533, 'target': 251, 'label': 'has_symptom'}, {'source': 6533, 'target': 976, 'label': 'has_symptom'}, {'source': 6533, 'target': 2724, 'label': 'has_symptom'}, {'source': 6533, 'target': 66, 'label': 'has_symptom'}, {'source': 6533, 'target': 2167, 'label': 'has_symptom'}, {'source': 6533, 'target': 8522, 'label': 'accompany_with'}, {'source': 6533, 'target': 4820, 'label': 'accompany_with'}, {'source': 6533, 'target': 10791, 'label': 'accompany_with'}, {'source': 6533, 'target': 4453, 'label': 'accompany_with'}, {'source': 6533, 'target': 10456, 'label': 'accompany_with'}, {'source': 6533, 'target': 8594, 'label': 'accompany_with'}, {'source': 6533, 'target': 4985, 'label': 'accompany_with'}, {'source': 6533, 'target': 12237, 'label': 'accompany_with'}, {'source': 6533, 'target': 8526, 'label': 'accompany_with'}, {'source': 6533, 'target': 7234, 'label': 'accompany_with'}, {'source': 6533, 'target': 6490, 'label': 'accompany_with'}, {'source': 6533, 'target': 5115, 'label': 'accompany_with'}, {'source': 6533, 'target': 20861, 'label': 'recommend_eat'}, {'source': 6533, 'target': 19457, 'label': 'recommend_eat'}, {'source': 6533, 'target': 17658, 'label': 'recommend_eat'}, {'source': 6533, 'target': 18851, 'label': 'recommend_eat'}, {'source': 6533, 'target': 17093, 'label': 'recommend_eat'}, {'source': 6533, 'target': 19500, 'label': 'recommend_eat'}, {'source': 6533, 'target': 20640, 'label': 'recommend_eat'}, {'source': 6533, 'target': 19230, 'label': 'recommend_eat'}, {'source': 6533, 'target': 13403, 'label': 'recommend_drug'}, {'source': 6533, 'target': 12986, 'label': 'recommend_drug'}, {'source': 6533, 'target': 15626, 'label': 'recommend_drug'}, {'source': 6533, 'target': 14427, 'label': 'recommend_drug'}, {'source': 6533, 'target': 16636, 'label': 'recommend_drug'}]},
        done:true,
        id:1
      },
      {
        question:"这是第二个问题",
        answer:"当每一天都是新的开始，机会和可能性充满着未知的旅程。我们的生活如同一本书，每一页都充满着故事和经历。在追逐梦想的路上，我们会遇到挑战和困难，但正是这些磨砺塑造了我们的坚韧和勇气。不要忘记停下脚步，欣赏身边的美好。生活是一场奇妙的冒险，让我们怀揣希望，勇往直前，发现属于自己的幸福之旅。",
        done:true,
        data:{'nodes':[{'id': 6533, 'category': 'Disease', 'name': '心脏病'}, {'id': 17833, 'category': 'Food', 'name': '鸡肉'}], 'links':[]},
        id:2
      }
       ],
      question_examples:[
        "问题A:（内容内容）","问题B:（内容内容）","问题C:（内容内容）",
        "问题D:（内容内容）","问题E:（内容内容）","问题F:（内容内容）",
        "问题G:（内容内容）","问题H:（内容内容）","问题I:（内容内容）"
       ],
      data:[]
    };
  },
  methods: {
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
        alert('提问内容：'+this.question);
        var i = 0;
        var question = this.question
        this.question = ''
        if(this.chat_history&&this.chat_history.length!=0){
          i = this.chat_history.length;
        }
        this.chat_history.push({question:question,answer:'',done:false,data:undefined,id:i})
        var dataToSend = {
          "question": question,
          "top_k": this.top_k,
          "history_len": this.history_len,
          "temperature": this.temperature,
          "top_p": this.top_p,
          "knowledgebase": this.selected_base,
          "chat_history": this.chat_history
        }
        axios.post('http://10.90.1.19:22077/predict', dataToSend)
        .then(response => {
          // 处理成功返回的数据
          this.chat_history[i].answer = response.data.answer;
          this.chat_history[i].done = true;
          this.chat_history[i].data = response.data.context;
          this.disableSendButton=false;
          // this.console.log(response)
        })
        .catch(error => {
          // 处理请求错误
          console.error('Error:', error);
        });
        
      }
    }
  }
}
</script>
<style>
 </style>


stream_answer1(){
  const vm = this
  fetch('http://10.90.1.19:22507/predict')
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
            vm.$nextTick(() => {
              const text = new TextDecoder().decode(value);
              const data = JSON.parse(text)
              vm.stream_data = data.answer;
            });
            // 注意这里加了一个等待操作
            setTimeout(push, 100);
            
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
},