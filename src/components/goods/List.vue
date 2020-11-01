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
      </el-table-column>g
      <!-- 操作 -->
      <el-table-column label="操作"  width="130px">
        <template slot-scope="scope">
          <el-button @click="showEditList(scope.row)" size="mini" type="primary" icon="el-icon-edit"></el-button>
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

  <!-- 编辑对话框 -->
  <el-dialog
    title="修改商品信息"
    :visible.sync="editVisiable"
    width="50%">
    <!-- 表单验证 -->
    <el-form :model="editRuleForm" :rules="editRules" ref="editRefs" label-width="100px">
      <el-form-item label="商品名称" prop="goods_name">
        <el-input v-model="editRuleForm.goods_name"></el-input>
      </el-form-item>
      <el-form-item label="商品数量" prop="goods_number">
        <el-input v-model="editRuleForm.goods_number"></el-input>
      </el-form-item>
      <el-form-item label="商品价格" prop="goods_price">
        <el-input v-model="editRuleForm.goods_price"></el-input>
      </el-form-item>
      <el-form-item label="商品重量" prop="goods_weight">
        <el-input v-model="editRuleForm.goods_weight"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="editVisiable = false">取 消</el-button>
      <el-button type="primary" @click="editList">确 定</el-button>
    </span>
  </el-dialog>
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
  //控制编辑对话框的显示和隐藏
  editVisiable:false,
  //编辑商品信息的验证
  editRules:{
    goods_name: [
      { required: true, message: '请输入商品名称', trigger: 'blur' },
    ],
    goods_price: [
      { required: true, message: '请输入商品价格', trigger: 'blur' },
    ],
    goods_number: [
      { required: true, message: '请输入商品数量', trigger: 'blur' },
    ],
    goods_weight: [
      { required: true, message: '请输入商品重量', trigger: 'blur' },
    ],
  },
  //编辑对话框的商品信息
  editRuleForm:{
    //将要修改的商品信息的名称
    goods_name:'',
    //商品数量
    goods_number:0,
    //将要修改的商品信息的价格
    goods_price:0,
    //将要修改的商品信息的重量
    goods_weight:0
  },
  //商品的id
  goods_id:0,
};
},
computed: {
  
},
methods: {
  //根据分页获取所有的商品列表
  async getGoodsList(){
  const {data:res} = await this.$http.get('goods',{params:this.queryInfo})
  if(res.meta.status !== 200){
    return this.$message.error('获取商品列表成功失败')
  }
  // this.$message.success('获取商品列表成功')
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
  //点击添加分类按钮 跳转页面
  goAddPage(){
    this.$router.push('/goods/add')
  },
  //点击编辑按钮 显示编辑对话框 赋值
  showEditList(edit){
     this.$message.error('暂无接口，无法修改')
    //赋值给editCateForm.cat_id 输入框显示当前的id名称
    this.goods_id = edit.goods_id
    //赋值给editCateForm.cat_name 输入框显示当前的id名称
    this.editRuleForm.goods_name = edit.goods_name
    //赋值给editCateForm.goods_number 输入框显示当前的商品数量
    this.editRuleForm.goods_number = edit.goods_number
    //赋值给editCateForm.goods_price 输入框显示当前的id商品价格
    this.editRuleForm.goods_price = edit.goods_price
    //赋值给editCateForm.goods_weight 输入框显示当前的商品重量
    this.editRuleForm.goods_weight = edit.goods_weight
    //显示编辑对话框
    this.editVisiable = true
  },
  //点击确定按钮 校验对话框 隐藏对话框
  editList(){
    //1.点击确定 对话框验证
    this.$refs.editRefs.validate(async valid=>{
      if(!valid) return
      //2.获取接口
      // const {data:res} = await this.$http.put(`goods/${this.goods_id}`,
      // {goods_name:this.editRuleForm.goods_name,
      // goods_number:this.editRuleForm.goods_number,
      // goods_price:this.editRuleForm.goods_price,
      // goods_weight:this.editRuleForm.goods_weight,
      // })
      // if(res.meta.status !== 201){
      //   return this.$message.error('更新失败')
      // }
      // this.$message.success('修改成功')
      //3. 刷新列表
      this.getGoodsList()
      // 4.关闭编辑对话框
      // this.editVisiable = false
    })
    this.$message.error('暂无接口，无法修改')
    this.editVisiable = false

  }
},
created() {
  //调用函数 获取所有参数列表
  this.getGoodsList()
},
}
</script>
<style lang='scss' scoped>

</style>