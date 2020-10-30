<template>
<div>
  <!-- 面包屑导航区域 -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>商品管理</el-breadcrumb-item>
    <el-breadcrumb-item>参数列表</el-breadcrumb-item>
  </el-breadcrumb>

  <!-- 卡片视图 -->
  <el-card>
    <!-- 头部的警告区 -->
     <el-alert :closable="false" show-icon title="注意：只允许为第三级分类设置相关参数！" type="warning"> </el-alert>
    <!-- 选择桑品分类区 -->
    <el-row class="cat_opt">
      <el-col>
        <span>选择商品分类：</span>
        <!-- 选择商品分类的级联 -->
         <el-cascader
          v-model="selecteCateKeys"
          :options="cateList"
          :props="cateProps"
          @change="handleChange">
        </el-cascader>
      </el-col>
    </el-row>
    <!-- tabs页签区 -->
    <el-tabs v-model="activeName" @tab-click="handleTabClick">
      <!-- 添加动态参数的面板 -->
      <el-tab-pane label="动态参数" name="many">
        <!-- 添加参数的按钮 -->
        <el-button @click="addDialogVisible=true" :disabled="isBtnDisabled" type="primary" size="mini">添加参数</el-button>
        <!-- 动态参数表格 -->
        <el-table :data="manyTableData" border stripe>
          <!-- 展开行 -->
          <el-table-column type="expand" >
              <template slot-scope="scope">
                <!-- 循环渲染Tag标签 -->
                <el-tag @close="handleClose(i,scope.row)" closable v-for="(item ,i) in scope.row.attr_vals" :key="i">{{item}}</el-tag>
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加的按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">
                  + New Tag</el-button>
              </template>
            </el-table-column>
          <!-- 索引列 -->
          <el-table-column type="index" label="#"></el-table-column>
          <el-table-column label="参数名称" prop="attr_name"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button @click="showEditDilog(scope.row.attr_id)" size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
              <el-button @click="removeParams(scope.row.attr_id)" size="mini" type="danger" icon="el-icon-delete">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
             
      <!-- 添加静态属性的面板 -->
      <el-tab-pane label="静态属性" name="only">
        <!-- 添加属性的按钮 -->
        <el-button  @click="addDialogVisible=true" :disabled="isBtnDisabled" type="primary" size="mini">添加属性</el-button>
          <!-- 静态参数表格 -->
          <el-table :data="onelTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand" >
              <template slot-scope="scope">
                <!-- 循环渲染Tag标签 -->
                <el-tag @close="handleClose(i,scope.row)" closable v-for="(item ,i) in scope.row.attr_vals" :key="i">{{item}}</el-tag>
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加的按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">
                  + New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button @click="showEditDilog(scope.row.attr_id)" size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
                <el-button @click="removeParams(scope.row.attr_id)" size="mini" type="danger" icon="el-icon-delete">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tab-pane>
    </el-tabs>
  </el-card>

  <!-- 添加动态/静态属性的对话框 -->
  <el-dialog
  :title="'添加'+this.titleText"
  :visible.sync="addDialogVisible"
  width="50%"
  @close="addDialogClosed">
  <!-- 添加参数的表单 -->
  <el-form :model="addFrom" :rules="addFromRules" ref="addFromRef" label-width="100px">
  <el-form-item :label="titleText" prop="attr_name">
    <el-input v-model="addFrom.attr_name"></el-input>
  </el-form-item>
  </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addParams">确 定</el-button>
  </span>
</el-dialog>

<!-- 修改参数的对话框 -->
  <el-dialog
  :title="'添加'+this.titleText"
  :visible.sync="editDialogVisible"
  width="50%"
  @close="editDialogClosed">
  <!-- 添加参数的表单 -->
  <el-form :model="editFrom" :rules="editFromRules" ref="editFromRef" label-width="100px">
  <el-form-item :label="titleText" prop="attr_name">
    <el-input v-model="editFrom.attr_name"></el-input>
  </el-form-item>
  </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="aditParams">确 定</el-button>
  </span>
</el-dialog>
</div>
</template>
<script>

export default {
components: {},
data() {
return {
  //商品分类列表
  cateList:[],
  //级联选择框的配置对象
  cateProps:{
    expandTrigger: 'hover',
    value:'cat_id',
    label:'cat_name',
    children:'children',
  },
  //级联选择框 双向绑定的数据
  selecteCateKeys:[],
  //被激活的页签的名称
  activeName:'many',
  //动态参数的数据
  manyTableData:[],
  //静态参数的数据
  onelTableData:[],
  //控制添加对话框的显示和隐藏
  addDialogVisible:false,
  //添加参数表单表单数据对象
  addFrom:{
    attr_name:''
  },
  //添加表单验证贵则对象
  addFromRules:{
    attr_name:[{
      required:true,message:'请输入参数名称',trigger:'blur'
    }]
  },
  //控制修改对话框的显示与隐藏
  editDialogVisible:false,
  //修改的表单数据对象
  editFrom:{
    attr_name:''
  },
  //修改表单的验证规则对象
  editFromRules:{
    attr_name:[{
      required:true,message:'请输入参数名称',trigger:'blur'
    }]
  },
  //控制文本框与按钮的切换显示
  inputVisible:false,
  //文本框输入的内容
  inputValue:'',
  //
};
},
methods: {
  //获取所有商品分类列表
  async getCateList(){
    const {data:res} = await this.$http.get('categories')
    if(res.meta.status !== 200){
      return this.$message.error('获取失败')
    }
    //给cateList赋值
    this.cateList = res.data
    // console.log(this.cateList);
  },
  //获取参数的列表数据
  async getParamsData(){
    //证明选中的不是三级分类
    if(this.selecteCateKeys.length !== 3){
      this.selecteCateKeys = []
      return 
    }
    //证明选中的是三级分类
    // console.log(this.selecteCateKeys);
    //根据所选的id 和所处的面板获取请求
    const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,{params:{sel:this.activeName}})
    if(res.meta.status !== 200){
      return this.$message.error('获取失败')
    }
    
     res.data.forEach(item => {
      item.attr_vals = item.attr_vals?item.attr_vals.split(','):[]
      //控制文本框的显示与隐藏
      item.inputVisible = false
      //文本框中输入的值
      item.inputValue = ''
     });
    if(this.activeName === 'many'){
      this.manyTableData = res.data
    }else{
      this.onelTableData = res.data
    }
  },
  //级联选择框选中 选项变化 会出发这个函数
  async handleChange(){
    //级联发生改变调用 发起请求
    this.getParamsData()
  },
  //tab页签点击事件的处理函数
  async handleTabClick(){
    //tab点击 发生改变调用 发起请求
    this.getParamsData()
  },
  //监听对话框的关闭事件
  addDialogClosed(){
    //重置
    this.$refs.addFromRef.resetFields()
  },
  //点击按钮 添加参数
   addParams(){
    //validate点击确认 验证对话框中的表单 validate
    this.$refs.addFromRef.validate(async valid => {
      if(!valid) return
      const {data:res} = await this.$http.post(`categories/${this.cateId}/attributes`,{
        attr_name:this.addFrom.attr_name,attr_sel:this.activeName
      })
      if(res.meta.status !== 201){return this.$message.error('添加失败')}
      this.$message.success('添加成功')
      //刷新页面
      this.getParamsData()
      //关闭对话框
      this.addDialogVisible= false
    })
  },
  //点击按钮 展示修改的对话框
   async showEditDilog(attr_id){
    //查询当前餐数的信息
    const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`,{params:{attr_sel:this.activeName}})
    if(res.meta.status !== 200 ){
      return this.$message.error('获取失败')
    }
    //赋值
    this.editFrom = res.data
    //显示对话框
    this.editDialogVisible = true
  },
  //监听对话框关闭的事件
  editDialogClosed(){
    //监听对话框关闭时 重置表单
    this.$refs.editFromRef.resetFields()
  },
  //点击确定按钮 修改信息
  aditParams(){
    this.$refs.editFromRef.validate(async valid => {
      if(!valid) return
      const {data:res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.editFrom.attr_id
      }`,{attr_name:this.editFrom.attr_name,attr_sel:this.activeName})
    if(res.meta.status !== 200){
      return this.$message.error('添加失败')
    }
    //提示成功消息
    this.$message.success('添加成功')
    //刷新数据列表
    this.getParamsData()
    //关闭对话框
    this.editDialogVisible = false
    })
  },
  //点击按钮 删除数据
  async removeParams(attr_id){
    const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).catch(err => err)
    //用户取消了删除的操作
    if(confirmResult !== 'confirm'){
      return this.$message.info('已取消删除!')
    }
    //否则 调用api 请求
    const {data:res} = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)
    if(res.meta.status !== 200){
      return this.$message.error('删除失败')
    }
    this.$message.success('删除成功')
    //刷新列表
    this.getParamsData(0)
  },
  //文本框失去焦点或按下都会触发
  async handleInputConfirm(row){
    //判断文本框中的内容是否为空 是：清空文本框 切换为按钮
    if(row.inputValue.trim().length === 0){
      row.inputValue = ''
      row.inputVisible = false
      return 
    }
    //如果没有 return 这是输入了内容 则push进数组中
    row.attr_vals.push(row.inputValue.trim())
    row.inputValue = ''
    row.inputVisible = false
    //需要发起请求 提交到后台数据库中 (抽离到 saveAttrVals)
    this.saveAttrVals(row)
  },

  //将对attr_vals的操作，保存到数据库
  async saveAttrVals(row){
    //需要发起请求 提交到后台数据库中
    const {data:res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,{
      attr_name:row.attr_name,
      attr_sel:row.attr_sel,
      attr_vals:row.attr_vals.join(',')
    })
    if(res.meta.status !== 200){
      return this.$message.error('修改参数项失败')
    }
    this.$message.success('修改参数项成功')
  },
  //点击按钮 展示文本输入框
  showInput(scope){
    //只让自己的文本框 展示
    scope.inputVisible = true
    //让文本框自动获得焦点
    //$nextTick 方法的作用 就是当页面上元素被重新渲染之后，在调用这个函数
    this.$nextTick( _ => {
      this.$refs.saveTagInput.$refs.input.focus()
    })
  },
  //删除对应的参数和选项
  handleClose(i,row){
    //splice()根据索引 i 删除 一项
    row.attr_vals.splice(i,1)
    this.saveAttrVals(row)
  }
},
created() {
  //获取所有商品分类列表
  this.getCateList()
},
computed:{
  //如果按钮需要 被禁用 则返回true
  //否则返回 false
  isBtnDisabled(){
    if(this.selecteCateKeys.length !== 3){
      return true
    }
    return false
  },
  //当前选中的三级分类ID
  cateId(){
    if(this.selecteCateKeys.length === 3){
      return this.selecteCateKeys[2]
    }
    return null
  },
  //动态计算标题的文本
  titleText(){
    if(this.activeName === "many"){
      return "动态参数"
    }
    return "静态属性"
  },
  //
}
}
</script>

<style lang='scss' scoped>
.cat_opt{
  margin: 15px 0;
}
.el-tag{
  margin: 10px;
}
.input-new-tag{
  width: 120px;
}
</style>