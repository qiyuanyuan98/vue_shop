<template>
<div >
  <!-- 面包屑导航区域 -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>用户管理</el-breadcrumb-item>
    <el-breadcrumb-item>用户列表</el-breadcrumb-item>
  </el-breadcrumb>

  <!-- 卡片视图区域 -->
  <el-card class="box-card">
    <el-row :gutter="20">
      <el-col :span="8">
        <!-- 搜索框 -->
        <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUsersList">
          <el-button slot="append" icon="el-icon-search" @click="getUsersList"></el-button>
        </el-input>
      </el-col>
      <el-col :span="4">
        <!-- 添加用户按钮 -->
        <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
      </el-col>
    </el-row>
    <!-- 用户列表区 -->
    <el-table :data="userlist" style="width: 100%" border stripe>
      <!-- 索引列 -->
      <el-table-column type="index" label="#">
      </el-table-column> 
      <el-table-column prop="username" label="姓名">
      </el-table-column> 
      <el-table-column prop="email" label="邮箱">
      </el-table-column> 
      <el-table-column prop="mobile" label="电话">
      </el-table-column>
      <el-table-column prop="role_name" label="角色">
      </el-table-column>
      <!-- 状态 -->
      <el-table-column label="状态">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
        </template>
      </el-table-column>
      <!-- 操作 -->
      <el-table-column label="操作">
        <template slot-scope="scope">
          <!-- 修改按钮 -->
          <el-button type="primary" icon="el-icon-edit" size='mini' @click="showEditDialog(scope.row.id)"></el-button>
          <!-- 删除角色按钮 -->
          <el-button type="danger" icon="el-icon-delete" size='mini' @click="removeUserByid(scope.row.id)"></el-button>
          <!-- 文字气泡提示 -->
           <el-tooltip :enterable="false" effect="dark" content="分配角色" placement="top-start">
            <!-- 分配角色按钮 -->
            <el-button @click="setRole(scope.row)" type="warning" icon="el-icon-setting" size='mini'></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <!-- 添加用户信息的对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 内容主题区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
         <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
         <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
         <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户信息的对话框 -->
    <el-dialog title="修改用户信息" :visible.sync="editDilogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名" >
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDilogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUersInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色的对话框 -->
    <el-dialog @close="setRoleClosed" title="分配角色" :visible.sync="setRoleDialogVisible" width="50%" >
      <div>
        <p>当前的用户：{{userinfo.username}}</p>
        <p>当前的角色：{{userinfo.role_name}}</p>
        <p>分配新角色：
          <el-select v-model="selectRoleId" placeholder="请选择">
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
            </el-option>
          </el-select></p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分页区 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[1, 2, 5, 10]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="this.total">
    </el-pagination>
  </el-card>
  </div>
</template>

<script>

export default {
components: {},
data() {
  //验证邮箱的规则
  let checkEmail = (rule,value,cb) => {
    //验证邮箱的正则表达式
    const regEmail = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/
    if(regEmail.test(value)){
      //合法的邮箱
      return cb()
    }
    cb(new Error('请输入合法的邮箱'))
  }
  //验证手机号的正则表达式
  let checkMobile = (rule,value,cb) => {
    //验证邮箱的正则表达式
    const regMobile = /^((13[0-9])|(17[0-1,6-8])|(15[^4,\\D])|(18[0-9]))\d{8}$/
    if(regMobile.test(value)){
      //合法的邮箱
      return cb()
    }
    cb(new Error('请输入正确的手机号'))
  }
  return {
    //获取用户列表的参数对象
    queryInfo:{
      //搜索关键字
      query:'',
      //当前的页数
      pagenum:1,
      //当前每页显示多少数据数据
      pagesize:2
    },
    //用户列表
    userlist:[],
    //数据总数
    total:0,
    //控制添加用户对话框的显示和隐藏
    addDialogVisible:false,
    //添加用户的表单数据
    addForm:{},
    //添加表单的验证规则对象
    addFormRules:{
      username:[
        {required:true,message:'请输入用户名',trigger:'blur'},{min:3,max:10,message:'用户名的长度在3~10个字符之前',trigger:'blur'}
      ],
      password:[
        {required:true,message:'请输入密码',trigger:'blur'},{min:6,max:15,message:'密码的长度在6~15个字符之前',trigger:'blur'}
      ],
      //校验是否输入 和 自定义校验规则
      email:[
        {required:true,message:'请输入用户邮箱',trigger:'blur'},{validator:checkEmail,trigger:'blur'}
      ],
      //校验是否输入 和 自定义校验规则
      mobile:[
        {required:true,message:'请输入手机号',trigger:'blur'},{validator:checkMobile,trigger:'blur'}
      ]
    },
    //控制修改用户对话框的显示与隐藏
    editDilogVisible:false,
    //查询到的用户对象信息对象
    editForm:{},
    //修改表单的验证规则对象
    editFormRules:{
      email:[
        { required:true,message:'请输入用户邮箱',trigger:'blur' },{ validator:checkEmail,trigger:'blur' }
      ],
      mobile:[
        {required:true,message:'请输入用户手机号',trigger:'blur'},{validator:checkMobile,trigger:'blur'}
      ]
    },
    //控制分配角色的显示与隐藏
    setRoleDialogVisible:false,
    //需要被分配角色的用户信息
    userinfo:{},
    //获取所有角色的数据列表
    roleList:[],
    //已选中的角色id值
    selectRoleId:'',
  };
},
methods: {
  //获取数据列表数据
  async getUsersList(){
    const {data:res} = await this.$http.get('users',{ params : this.queryInfo })
    if(res.meta.status !==200) return this.$message.error('获取用户列表失败')
    this.userlist = res.data.users
    this.total = res.data.total
  },
  //监听pagesize 改变的事件
  handleSizeChange(newSize){
    this.queryInfo.pagesize = newSize
    // console.log(newSize)
    this.getUsersList()
  },
  //监听 页码值 改变的事件
  handleCurrentChange(newPage){
    this.queryInfo.pagenum = newPage
    this.getUsersList()
  },
  //监听switch状态的改变
  async userStateChanged(userinfo){
    const { data:res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
    if(res.meta.status !== 200){
      userinfo.mg_state = !userinfo.mg_state
      return this.$message.error('更新用户状态失败')
    }
    this.$message.success('更新用户状态成功')
  },
  //监听添加用户对象框的关闭事件
  addDialogClosed(){
    //resetFields重置表单
    this.$refs.addFormRef.resetFields()
  },
  //添加确定按钮的预校验作用
  addUser(){
    this.$refs.addFormRef.validate(async vaild =>{
      // console.log(vaild); true false
      if(!vaild) return 
      //如果通过了 可以发起真正的网络请求
      const {data:res} = await this.$http.post('users',this.addForm)
      if(res.meta.status !== 201) return this.$message.error('添加用户失败')
      this.$message.success('添加用户成功')
      //隐藏添加的对话框
      this.addDialogVisible = false
      //重新获取列表数据
      this.getUsersList()
    })
  },
  //展示编辑用户的对话框
  async showEditDialog(id){
    const {data:res} = await this.$http.get(`users/`+ id)
   if(res.meta.status !== 200) {
     return this.$message.error('查询用户信息失败')
   }
   //给请求到的数据赋值
   this.editForm = res.data
   //显示对话框
   this.editDilogVisible = true
  },
  //监听修改用户对话框的关闭事件
  editDialogClosed(){
    //resetFields重置表单
    this.$refs.editFormRef.resetFields()
  },
  //修改用户信息并提交
  editUersInfo(){
    //validate 验证
    this.$refs.editFormRef.validate(async valid => {
      if(!valid) return
      //发起修改用户信息的请求
     const {data:res} = await this.$http.put('users/' + this.editForm.id,{email:this.editForm.email,mobile:this.editForm.mobile})
     if(res.meta.status !== 200) {return this.$message.error('更新用户信息失败')}
     //关闭对话框
     this.editDilogVisible = false
     //刷新数据列表
     this.getUsersList()
     //提示修改成功
     this.$message.success('更新信息成功')
    })
  },
  //根据id删除对应的用户信息
  async removeUserByid(id){
    // console.log(id);
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
    const {data : res} = await this.$http.delete('users/'+id)
    if(res.meta.status !== 200){
      return this.$message.error('删除用户失败！')
    }
    this.$message.success('删除用户成功')
    //弹出成功信息
    this.$message.info('已经确认删除')
    //重新刷新列表
    this.getUsersList()
  },
  //展示分配角色的对话框
  async setRole(userinfo){
    //赋值userinfo
    this.userinfo = userinfo
    //展示对话框之前 获取所有角色的列表
    const {data:res} = await this.$http.get('roles')
    if(res.meta.status !== 200){
     return this.$message.error('获取用户列表失败')
    }
    //将返回的res赋值给 roleList
   this.roleList = res.data
    //显示分配角色的对话框
    this.setRoleDialogVisible = true
  },
  //点击按钮 分配角色
  async saveRoleInfo(){
    //判断角色是否选择
    if(!this.selectRoleId){
      return this.$message.error('请选择角色')
    }
    //获取分配用户角色的数据
    const {data:res} = await this.$http.put(`users/${this.userinfo.id}/role`,{rid:this.selectRoleId})
    if(res.meta.status !== 200){
      return this.$message.error('分配角色失败')
    }
    this.$message.success('分配角色成功')
    //刷新用户列表
    this.getUsersList()
    //隐藏分配角色的对话框
    this.setRoleDialogVisible = false
  },
  //监听角色对话框的关闭事件
  setRoleClosed(){
    //重置selectRoleId  userinfo为空
    this.selectRoleId = ''
    this.userinfo = {}
  },

},
created() {
  this.getUsersList()
},
mounted() {
}
}
</script>
<style lang='scss' scoped>
</style>