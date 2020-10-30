<template>
<div>
  <!-- 面包屑导航区域 -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>商品管理</el-breadcrumb-item>
    <el-breadcrumb-item>商品列表</el-breadcrumb-item>
  </el-breadcrumb>
  <!-- 卡片视图 -->
  <el-card>
    <!-- 添加分类按钮 -->
    <el-row>
      <el-col>
        <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
      </el-col>
    </el-row>
    <!-- 表格区域 -->
    <tree-table :data="cateList" 
    :columns="columns" 
    :selection-type="false" 
    :expand-type="false" 
    show-index 
    index-test="#"
    border
    :show-row-hover="false"
    class="treetable" 
    >
    <!-- 模板列 是否有效-->
      <template slot="isok" slot-scope="scope">
        <i v-if="scope.row.cat_deleted === false" class="el-icon-success" style="color:lightgreen"></i>
        <i v-else class="el-icon-error" style="color:red"></i>
      </template>
    <!-- 模板列 排序-->
      <template slot="order" slot-scope="scope">
        <el-tag size='mini' v-if="scope.row.cat_level === 0">一级</el-tag>
        <el-tag type='success' size='mini'  v-else-if="scope.row.cat_level === 1">二级</el-tag>
        <el-tag type='warning' size='mini' v-else>三级</el-tag>
      </template>
    <!-- 模板列 操作-->
      <template slot="opt" slot-scope="scope">
        <el-button size='mini' type='primary' @click="showEditDilog(scope.row)">编辑</el-button>
        <el-button size='mini' type='danger' @click="deleteEditDilog(scope.row)">删除</el-button>
      </template>
    </tree-table>
  <!-- 分页区域 -->
  <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="querinfo.pagenum"
      :page-sizes="[5, 10, 15, 20]"
      :page-size="querinfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      >
  </el-pagination>
  </el-card>
  <!-- 添加分类的对话框 -->
  <el-dialog
  title="添加分类"
  :visible.sync="addCatedialogVisible"
  width="50%"
  @close='addCatedialogClose'>
  <!-- 添加分类的表单 -->
  <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
    <el-form-item label="分类名称" prop="cat_name">
      <el-input v-model="addCateForm.cat_name"></el-input>
    </el-form-item>
    <el-form-item label="父级分类" >
       <el-cascader
        v-model="selectedKeys"
        :options="parentCartList"
        :props="cascaderProps"
        @change="parentCateChange"
        clearable
        >
        </el-cascader>
    </el-form-item>
  </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="addCatedialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addCate">确 定</el-button>
  </span>
</el-dialog>
  <!-- 编辑对话框 -->
  <el-dialog
  title="修改分类"
  :visible.sync="editDialogVisible"
  width="50%"
  >
  <el-form :model="editCateForm" :rules="aditRules" ref="editRef" label-width="100px" class="demo-ruleForm">
    <el-form-item label="分类名称" prop="cat_name">
      <el-input v-model="editCateForm.cat_name"></el-input>
    </el-form-item>
  </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editCate">确 定</el-button>
  </span>
</el-dialog>
</div>
</template>

<script>

export default {
data() {
return {
  //商品分类数据列表
  cateList:[],
  //查询条件
  querinfo:{
    type:3,
    pagenum:1,
    pagesize:2
  },
  //总数据条数
  total:0,
  //为table指定列的定义
  columns:[{
    label:'分类名称',
    prop:'cat_name'
  },{
    label:'是否有效',
    //表示, 将当前列定义为模板列
    type:'template',
    //表示 当前这一列使用的模板名称
    template:'isok'
  },{
    label:'排序',
    type:'template',
    template:'order'
  },{
    label:'操作',
    type:'template',
    template:'opt'
  }],
  //控制添加分类对话框的显示与隐藏
  addCatedialogVisible:false,
  //添加分类的表单数据对象
  addCateForm:{
    //将要添加的分类名称
    cat_name:'',
    //父级分类的id
    cat_pid:0,
    //分类层级 默认要添加的是1级分类
    cat_level:0
  },
  //添加分类表单验证规则对象
  addCateFormRules:{
    //cat_name 校验规则
    cat_name:[
      { required: true, message: '请输入分类名称', trigger: 'blur' }
    ]
  },
  //父级分类的数组
  parentCartList:[],
  //指定级联选择器的配置对象
  cascaderProps:{
    //次级菜单的展开方式 hover
    expandTrigger:'hover',
    value:'cat_id',
    label:'cat_name',
    children:'children',
    checkStrictly:"true"
  },
  //选中父级分类id数组
  selectedKeys:[],
  //控制修改分类对话框的显示与隐藏
  editDialogVisible : false,
  //修改分类表单验证规则
  editCateForm:{
    //将要修改的分类名称
    cat_name:'',
    //分类的id
    cat_id:0,
  },
  //修改分类的校验规则
  aditRules:{
    //cat_name 校验规则
    cat_name:[
      { required: true, message: '请输入分类名称', trigger: 'blur' }
    ]
  },
};
},
methods: {
  //获取商品分类数据列表
  async getcategories(){
    const {data:res} = await this.$http.get('categories',{params:this.querinfo})
    if(res.meta.status !== 200){
      return this.$message.error('获取数据列表失败')
    }
    //把数据列表，赋值给cateList
    this.cateList = res.data.result
    //为总数据total 赋值
    this.total = res.data.total
  },
  //监听 pagesize 改变
  handleSizeChange(newSize){
    //监听改变后赋值
    this.querinfo.pagesize = newSize
    //重新刷新
    this.getcategories()
  },
  //监听 pagenum 的改变
  handleCurrentChange(newPage){
    this.querinfo.pagenum = newPage
    //重新刷新
    this.getcategories()
  },
  //点击按钮显示添加分类的对话框
  showAddCateDialog(){
    //获取父级分类的列表
    this.getParentCateList()
    //显示对话框
    this.addCatedialogVisible = true
  },
  //获取父级分类的数据列表
  async getParentCateList(){
    const {data:res} = await this.$http.get('categories',{params:{type:2}})
    if(res.meta.status !== 200){
      return this.$message.error('获取数据失败')
    }
    //赋值给 parentCartList
    this.parentCartList = res.data
  },
  //级联选择器：选中项发生变化出发这个函数
  parentCateChange(){
    if(this.selectedKeys.length > 0){
      //父级分类的id
      this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
      //为当前分类的等级赋值
      this.addCateForm.cat_level = this.selectedKeys.length
      return
    }else{
      //父级分类的id
      this.addCateForm.cat_pid = 0
      //为当前分类的等级赋值
      this.addCateForm.cat_level = 0
    }
  },
  //点击添加分类的确认按钮
  addCate(){
    //关闭对话框预验证
     this.$refs.addCateFormRef.validate(async valid =>{
       if(!valid)return 
       const {data:res} = await this.$http.post('categories',this.addCateForm)
        if(res.meta.status !== 201){
          return this.$message.error('添加分类失败')
        }
        //提示添加成功消息
        this.$message.success('添加分类成功')
        //刷新数据列表
        this.getcategories()
        //隐藏对话框
        this.addCatedialogVisible = false
     })
  },
  //监听添加分类对话框的关闭事件
  addCatedialogClose(){
    //重置表单数据
    this.$refs.addCateFormRef.resetFields()
    //重置级联选择器的数据
    this.selectedKeys = []
    this.addCateForm.cat_pid = 0
    this.addCateForm.cat_level = 0
  },
  //点击编辑按钮 显示编辑对话框
  async showEditDilog(edit){
    //赋值给editCateForm.cat_id 输入框显示当前的id名称
    this.editCateForm.cat_id = edit.cat_id
    //赋值给editCateForm.cat_name 输入框显示当前的id名称
    this.editCateForm.cat_name = edit.cat_name
    //显示编辑对话框
    this.editDialogVisible = true
  },
  //点击确定按钮 实现更改分类名
   editCate(){
    this.$refs.editRef.validate(async valid=>{
      if(!valid) return
      const {data:res} = await this.$http.put(`categories/${this.editCateForm.cat_id}`,{cat_name:this.editCateForm.cat_name})
      if(res.meta.status !== 200){
        return this.$message.error('更新失败')
      }
      this.$message.success('修改成功')
      //刷新列表
      this.getcategories()
      //关闭编辑对话框
      this.editDialogVisible = false
    })
  },
  //分类删除按钮
  async deleteEditDilog(edit){
    console.log(edit.cat_id);
    //弹框询问用户是否删除当前用户信息
    const confirmResult = await this.$confirm('此操作将永久删除该用户信息, 是否继续?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).catch(err=>{
      return err
    })
    //如果用户确认删除 则返回字符串confirm  取消删除则返回字符串cancel
    // console.log(confirmResult);
    if(confirmResult !== 'confirm'){
      return this.$message.info('已经取消删除')
    }
    //请求删除个人用户的api
    const {data : res} = await this.$http.delete('categories/' + edit.cat_id)
    if(res.meta.status !== 200){
      return this.$message.error('删除用户失败！')
    }
    this.$message.success('删除用户成功')
    //弹出成功信息
    this.$message.info('已经确认删除')
    //重新刷新列表
    this.getcategories()
  },
},
created() {
  //调用getcategories请求商品分类列表
  this.getcategories()
},
mounted() {
},
}
</script>
<style lang='scss' scoped>
.treetable{
  margin-top: 15px;
}
.el-cascader{
  width: 100%;
}
</style>