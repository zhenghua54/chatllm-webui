<template>
    <div class="fixed top-5 left-5 grid-cols-1 grid gap-2 z-10">
        <button @click="closeChart" class="h-10 w-10"><img  src="../assets/icon/close_graph.svg" alt="" title="关闭"></button>
        <button @click="update('last')" :disabled="graph.data.length==1" class="h-10 w-10"><img src="../assets/icon/last_graph.svg" alt="" title="上一图谱"></button>
        <button @click="update('reset')" :disabled="graph.data.length==1" class="h-10 w-10"><img  src="../assets/icon/reset_graph.svg" alt="" title="重置"></button>
    </div>
    <div class="w-full h-full z-5" ref="myChart">
        
    </div>
   
</template>
  
<script>
import * as echarts from 'echarts/core';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components';
import { GraphChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import axios from 'axios';

echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GraphChart,
  CanvasRenderer
]);


export default {
    name:'chart',
    props: {
        data: Object
    },
    data(){
        return{
            src:'6533', 
            node_id_name_map: {}, 
            graph:{
            data:[],
            'categories':[
                {'name':'疾病'},
                {'name':'症状'},
                {'name':'药物'},
                {'name':'食物'},
                {'name':'检查检验方式'}, 
                {'name':'科室'},
                {'name':'制药公司'},
                {'name':'食物(忌食)'}]
            },
            option:{
                title: {  
                text: '关系图',
                top: 'bottom',
                left: 'right'
                },
                animation: false,
                animationEasingUpdate:"quinticInOut",
                tooltip: {
                    formatter: this.myFormatter
                },
                legend: { 
                    data:[]
                },
                series:[{
                    type: 'graph',  
                    layout: 'force', 
                    data: [],  
                    links: [], 
                    symbolSize:15, 
                    animationDurationUpdate:1000, 
                    focusNodeAdjacency:true, 
                    emphasis: {  
                        edgeLabel: {
                            show: true, 
                            opacity: 0.8,
                        },
                        focus: 'adjacency',
                        lineStyle: {
                            color: 'target',
                            opacity:1,
                            width: 5
                        }
                    },
                    categories:[],  
                    force:{  
                        // initLayout: 'circular',
                        gravity: 0.6,
                        friction:0.2,
                        repulsion: 500,
                        edgeLength: 50
                    },
                    draggable: true, 
                    roam: true, 
                    scaleLimit:{min:0.5,max:1.5},
                    label: {
                        show:true,
                        position: 'right',
                        fontSize: 12,
                        layout: 'vertical'
                    },
                    edgeSymbol:['none', 'none'], 
                    edgeSymbolSize:[4, 10],
                    edgeLabel:{ 
                        show: false,
                        fontSize: 12,
                        formatter: function (params) {
                            return params.data.label; 
                        },
                        textStyle: {
                            color: 'black',
                        }
                    },
                    lineStyle:{ 
                        opacity:0.3,
                        width:2,
                        curveness:0,
                    },
                    
                }]
            },
            myChart:Object
        }
    },
    mounted(){
        this.initChart();
        this.graph.data.push({'nodes':this.data.nodes,'links':this.data.links})
        this.update('new');
    },
    methods:{
        initChart() {
            this.option.legend.data=this.graph.categories;
            this.option.series[0].categories=this.graph.categories
            this.myChart = echarts.init(this.$refs.myChart); 
            this.myChart.showLoading(); 
            this.myChart.on('click', ({data})=>{
                if(data && data.id&&data.id!='000001'&&data.id!='000002'&&data.id!='000003'&&data.id!='000004'&&data.id!='000005'){//&&data.id!=this.src
                    axios.get('http://10.90.1.19:22507/search', {
                        params: {
                            id: parseInt(data.id,10)
                        }})
                    .then(response=>{
                        this.src = data.id;
                        console.log(this.graph.data.length+1)
                        this.graph.data.push({'nodes':response.data.context.nodes,'links':response.data.context.links})
                        this.update('new');
                    }).catch(error=>{
                        console.log(error)
                    })
                }
            })
        },
        closeChart(){
            this.$emit("closeChart");
        },
        update(param){
            this.myChart.showLoading();
            var len = this.graph.data.length
            if(param == 'new'){
                this.graph.data[len - 1].nodes = this.convertValuesToString(this.graph.data[len - 1].nodes);
                this.graph.data[len - 1].links = this.convertValuesToString(this.graph.data[len - 1].links);
                this.graph.data[len - 1].nodes.push({'id': '000001', 'category': '疾病', 'name': '并发症','symbolSize':25});
                this.graph.data[len - 1].nodes.push({'id': '000002', 'category': '食物', 'name': '食物','symbolSize':25})
                this.graph.data[len - 1].nodes.push({'id': '000003', 'category': '症状', 'name': '症状','symbolSize':25})
                this.graph.data[len - 1].nodes.push({'id': '000004', 'category': '药物', 'name': '药物','symbolSize':25})
                this.graph.data[len - 1].nodes.push({'id': '000005', 'category': '检查检验方式', 'name': '检查检验方式','symbolSize':25})
                this.graph.data[len - 1].nodes.push({'id': '000006', 'category': '科室', 'name': '科室','symbolSize':25})
                this.graph.data[len - 1].links.push({'source':this.src, 'target':'000001','label':'并发症', })
                this.graph.data[len - 1].links.push({'source':this.src, 'target':'000002','label':'食物', })
                this.graph.data[len - 1].links.push({'source':this.src, 'target':'000003','label':'症状',})
                this.graph.data[len - 1].links.push({'source':this.src, 'target':'000004','label':'药物', })
                this.graph.data[len - 1].links.push({'source':this.src, 'target':'000005','label':'检查检验方式',})
                this.graph.data[len - 1].links.push({'source':this.src, 'target':'000006','label':'科室',})
                if(this.graph.data[len - 1].links.length!=0){
                    this.src = this.graph.data[len - 1].links[0].source;
                }
                var prohibited_foods = [];
                this.graph.data[len - 1].links.forEach(link=>{
                    if(link.label == 'acompany_with'){
                        if(link.source==this.src){
                            link.source = '000001';
                        }
                        link.label = '并发症';
                    }else if(link.label == 'common_drug' || link.label == 'recommand_drug' ){
                        if(link.source==this.src){
                            link.source = '000004';
                        }
                        
                        link.label = '常用药物';
                    }else if(link.label == 'has_symptom'){
                        if(link.source==this.src){
                            link.source = '000003';
                        }
                        
                        link.label = '常见症状';
                    }else if(link.label == 'need_check'){
                        if(link.source==this.src){
                            link.source = '000005';
                        }
                        
                        link.label = '常用检查检验方式';
                    }else if(link.label == 'no_eat'){
                        if(link.source==this.src){
                            link.source = '000002';
                        }
                        
                        link.label = '禁止食用';
                        prohibited_foods.push(link.target);
                    }else if(link.label == 'recommend_drug'){
                        if(link.source==this.src){
                            link.source = '000004';
                        }
                        
                        link.label = '推荐药物';
                    }else if(link.label == 'recommend_eat'){
                        if(link.source==this.src){
                            link.source = '000002';
                        }
                        
                        link.label = '推荐食用';
                    }else if(link.label == 'do_eat'){
                        if(link.source==this.src){
                            link.source = '000002';
                        }
                        
                        link.label = '可以食用';
                    }else if(link.label == 'recommand_eat'){
                      if(link.source==this.src){
                        link.source = '000002';
                      }

                      link.label = '可以食用';
                    }else if(link.label == 'belongs_to'){
                      if(link.source==this.src){
                        link.source = '000006';
                      }
                        link.label = '科室';
                    }else if(link.label == 'drugs_of'){
                        link.label = '生产药品';
                    }
                });
                this.graph.data[len - 1].nodes.forEach(node=>{
                    if(node.id==this.src){
                        node.symbolSize = 30
                    }
                    if(prohibited_foods.includes(node.id)){
                        node.category = '食物(忌食)';
                        // node.x = Math.floor(Math.random() * (450 - 300 + 1)) + 300;
                        // node.y = Math.floor(Math.random() * (450 - 300 + 1)) + 300;
                    }else{
                        if(node.category=='Disease'){
                            node.category='疾病';
                            // node.symbolSize = 30;
                            // node.x = Math.floor(Math.random() * (300 - 200 + 1)) + 200;
                            // node.y = Math.floor(Math.random() * (300 - 200 + 1)) + 200;
                        }else if(node.category=='Symptom'){
                            node.category='症状';
                            // node.symbolSize = 10;
                            // node.x = Math.floor(Math.random() * (200 - 0 + 1)) + 0;
                            // node.y = Math.floor(Math.random() * (200 - 100 + 1)) + 100;
                        }else if(node.category=='Drug'){
                            node.category='药物';
                            // node.x = Math.floor(Math.random() * (200 - 0 + 1)) + 0;
                            // node.y = Math.floor(Math.random() * (0 + 100 + 1)) -100;
                        }else if(node.category=='Food'){
                            node.category='食物';
                            // node.x = Math.floor(Math.random() * (300 - 100 + 1)) + 100;
                            // node.y = Math.floor(Math.random() * (0 + 100 + 1)) -100;
                        }else if(node.category=='Department'){
                            node.category='科室';
                            // node.x = Math.floor(Math.random() * (50 - 0 + 1)) + 0;
                            // node.y = Math.floor(Math.random() * (50 - 0 + 1)) + 0;
                        }else if(node.category=='Producer'){
                            node.category='制药公司';
                            // node.x = Math.floor(Math.random() * (0 + 100 + 1)) - 100;
                            // node.y = Math.floor(Math.random() * (0 + 100 + 1)) - 100;
                        }else if(node.category=='Check'){
                            node.category='检查检验方式';
                            // node.x = Math.floor(Math.random() * (-100 + 200 + 1)) - 200;
                            // node.y = Math.floor(Math.random() * (-100 + 200 + 1)) - 200;
                        }
                    }
                })
                this.make_dict(this.graph.data[len - 1].nodes)  // 更新映射字典
                console.log(this.graph.data[len - 1].links);
                console.log(this.graph.data[len - 1].nodes);
                this.option.series[0].data=this.graph.data[len - 1].nodes;  // 选择最新的节点
                this.option.series[0].links=this.graph.data[len - 1].links;

            }
            else if(param == 'last'){
                if(len!=1){
                    this.graph.data.pop();
                    this.make_dict(this.graph.data[len - 2].nodes) 
                    this.option.series[0].data=this.graph.data[len - 2].nodes;
                    this.option.series[0].links=this.graph.data[len - 2].links;
                } 
            }
            else if(param == 'reset'){
                var temp = this.graph.data[0];
                this.graph.data = [];
                this.graph.data.push(temp);
                this.make_dict(this.graph.data[0].nodes) 
                this.option.series[0].data=this.graph.data[0].nodes;
                this.option.series[0].links=this.graph.data[0].links;
            }
            this.myChart.hideLoading();
            this.myChart.setOption(this.option);
        },
        convertValuesToString(obj) {  
            if (typeof obj === 'object' && obj !== null) {
                if (Array.isArray(obj)) {
                // 处理数组
                return obj.map(item => this.convertValuesToString(item));
                } else {
                // 处理对象
                const newObj = {};
                for (const key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    newObj[key] = this.convertValuesToString(obj[key]);
                    }
                }
                return newObj;
                }
            } else if (typeof obj === 'number') {
                // 将数值类型转换为字符串
                return String(obj);
            } else {
                // 其他类型不变
                return obj;
            }
        },
        make_dict(obj){
            console.log(obj)
            this.node_id_name_map = {}
            obj.forEach(node=>{
                this.node_id_name_map[node.id]=node.name
            })
        },
        myFormatter(params, ticket, callback) { 
            if (params.dataType === 'node') {
                let coloredCircle = '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:' + params.color + '"></span>';
                // 返回字符串包含节点名称和颜色圆点
                return coloredCircle + params.name;

            } else if (params.dataType === 'edge') {
                // 对于边数据，返回自定义的悬浮文字
                if(params.data.time)
                    return params.data.time + "  "  + this.node_id_name_map[params.data.source] + ' > ' + this.node_id_name_map[params.data.target];  // 假设边的数据包含一个 'label' 信息
                else
                    return this.node_id_name_map[params.data.source] + ' > ' + this.node_id_name_map[params.data.target];
            }
        },
    },
    watch:{
        
    }
};
</script>
