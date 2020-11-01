<template>
<div>
  <!-- 面包屑导航区域 -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>数据统计</el-breadcrumb-item>
    <el-breadcrumb-item>数据报表</el-breadcrumb-item>
  </el-breadcrumb>

  <!-- 卡片视图区域 -->
  <el-card>
    <!-- 2.为 ECharts 准备一个具备大小（宽高）的 DOM -->
    <div id="main" style="width: 600px;height:400px;"></div>

  </el-card>
</div>
</template>

<script>
//1. 导入 echarts
 import echarts from 'echarts'
//导入深拷贝
import _ from "lodash";

export default {
components: {},
data() {
return {
  //需要合并的echarts数据
  options: {
          title: {
            text: '用户来源'
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
              label: {
                backgroundColor: '#E9EEF3'
              }
            }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: [
            {
              boundaryGap: false
            }
          ],
          yAxis: [
            {
              type: 'value'
            }
          ]
        }
};
},
computed: {},
watch: {},
methods: {

},
created() {

},
async mounted() {
  //初始化图表 需要在页面渲染完毕后执行
  //3.基于准备好的dom，初始化echarts实例
  var myChart = echarts.init(document.getElementById('main'));

  //请求接口数据
  const {data:res} = await this.$http.get('reports/type/1')
  if(res.meta.status !== 200){
    return this.$message.error('请求数据失败')
  }

  //4.准备数据和配置项
  const results = _.merge(res.data,this.options)
  // 5. 展示数据
  myChart.setOption(results);
},
activated() {}, 
}
</script>
<style lang='scss' scoped>
</style>