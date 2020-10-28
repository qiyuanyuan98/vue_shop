<template>
<div class=''>
  <!-- 面包屑导航区域 -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>权限管理</el-breadcrumb-item>
    <el-breadcrumb-item>角色列表</el-breadcrumb-item>
  </el-breadcrumb>

  <!-- 卡片视图 -->
  <el-card>
    <!-- 添加角色区域 -->
    <el-row>
      <el-col>
        <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
      </el-col>
    </el-row>

    <!-- 角色列表区域 -->
    <el-table :data="roleList" border stripe>
      <!-- 展开列 -->
      <el-table-column type="expand" label="#">
        <template slot-scope="scope">
          <el-row :class="['bdbottom',i1 == 0?'bdtop':'','vcenter']" v-for="(item1,i1) in scope.row.children" :key="item1.id">
            <!-- 渲染一级权限 -->
            <el-col :span="5">
              <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
              <i class="el-icon-caret-right"></i>
            </el-col>
            <!-- 渲染二级权限 -->
            <el-col :span="19" >
              <!-- 通过for循环 嵌套二级权限 -->
              <el-row :class="[i2 === 0?'':'bdtop','vcenter']" v-for="(item2,i2) in scope.row.children" :key="item2.id">
                <el-col :span="6">
                  <el-tag closable type="success" @close="removeRightById(scope.row,item2.id)">{{item2.authName}} </el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col >
                <!-- 通过for循环 嵌套三级权限 -->
                <el-col :span="18">
                  <el-tag closable @close="removeRightById(scope.row,item3.id)" type="warning" v-for="(item3,i3) in item2.children" :key="item3.id">{{item3.authName}}</el-tag>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </template>
      </el-table-column>
      <!-- 索引列 -->
      <el-table-column type="index" label="#"></el-table-column>
      <el-table-column  label="角色名称" prop="roleName"></el-table-column>
      <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
      <!-- 操作 -->
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" icon="el-icon-edit"  @click="showEditDialog(scope.row.id)">编辑</el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeUserByid(scope.row.id)">删除</el-button>
          <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 添加用户信息的对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 内容主题区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
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
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item> 
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDilogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUersInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限的对话框 -->
    <el-dialog @close="setRightDialogClose" title="提示" :visible.sync="setRightDialogVisible" width="50%">
      <!-- 树形控件 -->
      <el-tree ref='treeRef' :default-checked-keys='defKeys' default-expand-all node-key="id" show-checkbox :data="rightList" :props="treeProps"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </el-card>
</div>
</template>
<script>

export default {
data() {
return {
  //所有角色列表数据
  roleList:[],
  //控制添加用户对话框的显示和隐藏
  addDialogVisible:false,
  //添加用户的表单数据
  addForm:{},
  //添加表单的验证规则对象
  addFormRules:{
    roleName:[
      {required:true,message:'请输入用户名',trigger:'blur'},{min:3,max:10,message:'用户名的长度在3~10个字符之前',trigger:'blur'}
    ],
    roleDesc:[
      {required:true,message:'请输入用户描述',trigger:'blur'},{min:6,max:15,message:'用户名的长度在6~15个字符之前',trigger:'blur'}
    ]
  },
  //控制修改用户对话框的显示与隐藏
  editDilogVisible:false,
  //查询到的用户对象信息对象
  editForm:{},
  //修改表单的验证规则对象
  editFormRules:{
    roleName:[
      {required:true,message:'请输入用户名',trigger:'blur'},{min:3,max:10,message:'用户名的长度在3~10个字符之前',trigger:'blur'}
    ],
    roleDesc:[
      {required:true,message:'请输入用户描述',trigger:'blur'},{min:6,max:15,message:'用户名的长度在6~15个字符之前',trigger:'blur'}
    ]
  },
  //控制分配权限对话框的显示与隐藏
  setRightDialogVisible:false,
  //所有权限的数据
  rightList:'',
  //树形控件的属性绑定对象
  treeProps:{
    label:'authName',
    children:'children'
  },
  //默认选中的节点id值
  defKeys:[],
  //即将分配角色权限的id
  roleId:'',
  //
};
},
methods: {
  //获取角色列表数据
  async getRolesList(){
  const {data:res} = await this.$http.get('roles')
  if(res.meta.status !== 200){
    return this.$message.error('获取用户列表失败')
  }
  this.roleList = res.data
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
      const {data:res} = await this.$http.post('roles',this.addForm)
      console.log(res);
      if(res.meta.status !== 201) return this.$message.error('添加用户失败')
      this.$message.success('添加用户成功')
      //隐藏添加的对话框
      this.addDialogVisible = false
      //重新获取列表数据
      this.getRolesList()
    })
  },

  //监听修改用户对话框的关闭事件
  editDialogClosed(){
    //resetFields重置表单
    this.$refs.editFormRef.resetFields()
  },
  
  //展示编辑用户的对话框
  async showEditDialog(id){
    const {data:res} = await this.$http.get(`roles/`+ id)
   if(res.meta.status !== 200) {
     return this.$message.error('查询用户信息失败')
   }
   //给请求到的数据赋值
   this.editForm = res.data
   //显示对话框
    this.editDilogVisible = true
  },

  //修改用户信息并提交
  editUersInfo(){
    //validate 验证
    this.$refs.editFormRef.validate(async valid => {
      if(!valid) return
      //发起修改用户信息的请求
     const {data:res} = await this.$http.put('roles/' + this.editForm.roleId,{roleName:this.editForm.roleName})
     console.log(res);
     if(res.meta.status !== 200) {return this.$message.error('更新用户信息失败')}
     //关闭对话框
     this.editDilogVisible = false
     //刷新数据列表
     this.getRolesList()
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
    const {data : res} = await this.$http.delete('roles/'+id)
    if(res.meta.status !== 200){
      return this.$message.error('删除用户失败！')
    }
    this.$message.success('删除用户成功')
    //弹出成功信息
    this.$message.info('已经确认删除')
    //重新刷新列表
    this.getRolesList()
  },

  //根据ID删除对应的权限
  async removeRightById(role,rightId){
    // console.log(role,role.id,rightId);
     const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).catch(err=>err)
    //confirmResult 点击确认弹出confirm 点击取消弹出cancel
    if(confirmResult !=='confirm'){
      return this.$message.info('取消删除')
    }
    //删除操作
    const {data:res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
    if(res.meta.status !== 200){
      return this.$message.error('删除权限失败')
    }
    //删除成功 重新赋值角色信息
    role.children = res.data
  },

  //展示分配权限的对话框
  async showSetRightDialog(role){
    //定义保存角色id
    this.roleId = role.id
    //获取所有权限的数据
    const {data:res} = await this.$http.get('rights/tree')
    if(res.meta.status !== 200){
      return this.$message.error('获取权限失败')
    }
    //获取到的权限数据保存在 this.rightList中
    this.rightList = res.data
    // console.log(this.rightList);
    //递归获取三级节点的id
    this.getLeafKeys(role,this.defKeys)
    //展示分配权限对话框
    this.setRightDialogVisible = true
  },

  //通过递归的形式获取角色下所有三级权限的id 并保存到defKeys数组中
  getLeafKeys(node,arr){
    //如果当前node节点不包含children属性，这是三级节点
    if(!node.children){
      return arr.push(node.id)
    }
    //递归
    node.children.forEach(item => 
      this.getLeafKeys(item,arr))
  },

  //监听分配权限对话框的关闭事件
  setRightDialogClose(){
    this.defKeys = []
  },

  //点击为角色分配权限
  async allotRights(){
    //es6语法 展开运算符... 合并选中的id 和半选中id
    const keys = [
    ...this.$refs.treeRef.getCheckedKeys(),
    ...this.$refs.treeRef.getHalfCheckedKeys()
    ]// console.log(keys);
    //以 `,` 分割的权限 ID 列表
    const idStr = keys.join(',')// console.log(idStr);
    //获取角色授权接口
    const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})
    if(res.meta.status !== 200){
      return this.$message.error('分配权限失败')
    }
    this.$message.success('分配权限成功')
    //刷新列表
    this.getRolesList()
    //隐藏分配权限对话框
    this.setRightDialogVisible = false
  },
},
created() {
  //调用获取角色列表数据函数
  this.getRolesList()
},
mounted() {

},
}
</script>
<style lang='scss' scoped>
.el-tag{
  margin-top: 7px;
  margin-bottom: 7px;
  margin-right: 7px;
}
.bdtop{
  border-top: 1px solid #eee;
}
.bdbottom{
  border-bottom: 1px solid #eee;
}
.vcenter{
  display: flex;
  align-items: center;
}
</style>