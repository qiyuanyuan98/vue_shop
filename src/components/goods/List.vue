<template>
<div>
  <!-- 面包屑导航区域 -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>商品管理</el-breadcrumb-item>
    <el-breadcrumb-item>商品列表</el-breadcrumb-item>
  </el-breadcrumb>

  <!-- 卡片视图区域 -->
  <el-card>
    <el-row :gutter="20">
      <el-col :span="8">
        <!-- 搜索文本输入框 -->
        <el-input placeholder="请输入内容" v-model="queryInfo.query"
        clearable @clear="getGoodsList">
          <el-button @click="getGoodsList" slot="append" icon="el-icon-search"></el-button>
        </el-input>
      </el-col>
      <el-col :span="14">
        <el-button type="primary" @click="goAddPage">添加商品</el-button>
      </el-col>
    </el-row>

    <!-- table表格区域 -->
    <el-table :data="goodslist" border stripe>
      <!-- 索引列 -->
      <el-table-column type="index" label="#"></el-table-column>
      <el-table-column label="商品名称" prop="goods_name"></el-table-column>
      <el-table-column prop="goods_price" label="商品价格(元)" width="105px"></el-table-column>
      <el-table-column prop="goods_weight" label="商品重量" width="95px"></el-table-column>
      <el-table-column prop="add_time" label="创建时间"  width="150px">
        <!-- 时间过滤器 -->
        <template slot-scope="scope">
          {{scope.row.add_time | dateFormat}}
        </template>
      </el-table-column>
      <!-- 操作 -->
      <el-table-column label="操作"  width="130px">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" icon="el-icon-edit"></el-button>
          <el-button size="mini" type="danger" icon="el-icon-edit" @click="removeById(scope.row.goods_id)"></el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页功能 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[5, 10, 15, 20]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      background>
    </el-pagination>
  </el-card>
</div>
</template>

<script>

export default {
components: {},
data() {
return {
  //查询参数对象
  queryInfo:{ 
    query:'',
    //当前的页码值
    pagenum:1,
    //当前展示的页码数量
    pagesize:10
  },
  //商品列表
  goodslist:[],
  //总数据 分页
  total:0,
  //

};
},
computed: {},
methods: {
  //根据分页获取所有的商品列表
  async getGoodsList(){
  const {data:res} = await this.$http.get('goods',{params:this.queryInfo})
  if(res.meta.status !== 200){
    return this.$message.error('获取商品列表成功失败')
  }
  this.$message.success('获取商品列表成功')
  //商品列表 赋值
  this.goodslist = res.data.goods
  //商品总数 赋值
  this.total =  res.data.total
  },
  //当前选择展示的页数
  handleSizeChange(newSize){
    this.queryInfo.pagesize = newSize
    //重新获取数据
    this.getGoodsList()
  },
  //当前选择的页码
  handleCurrentChange(newPage){
    this.queryInfo.pagenum = newPage
    //重新获取数据
    this.getGoodsList()
  },
  //点击删除按钮功能
  async removeById(id){
    const confirmResule = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).catch(err=>err)
    if(confirmResule !== "confirm"){
      return this.$message.info('已取消删除')
    }
    //否则 发起删除该id的请求
    const {data:res} = await this.$http.delete(`goods/${id}`)
    if(res.meta.status !== 200){
      return this.$mesaage.error('删除失败')
    }
    //提示删除成功的消息
    this.$message.success('删除成功')
    //刷新数据列表
    this.getGoodsList()
  },
  //
  goAddPage(){
    this.$router.push('/goods/add')
  },
  //
},
created() {
  //调用函数 获取所有参数列表
  this.getGoodsList()
},
}
</script>
<style lang='scss' scoped>

</style>