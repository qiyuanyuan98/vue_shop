<template>
<div>
  <!-- 面包屑导航区域 -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>商品管理</el-breadcrumb-item>
    <el-breadcrumb-item>添加商品</el-breadcrumb-item>
  </el-breadcrumb>

  <!-- 卡片视图区域 -->
  <el-card>
    <!-- 提示区域 -->
    <el-alert
      title="添加商品信息"
      type="info"
      center
      show-icon
      :closable="false"
      >
    </el-alert> 
    <!-- 步骤条区 -->
    <el-steps align-center :space="200" :active="activeIndex-0" finish-status="success">
      <el-step title="基本信息"></el-step>
      <el-step title="商品参数"></el-step>
      <el-step title="商品属性"></el-step>
      <el-step title="商品图片"></el-step>
      <el-step title="商品内容"></el-step>
      <el-step title="完成"></el-step>
    </el-steps>

    <!-- from表单 -->
    <el-form label-position="top" :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" class="demo-ruleForm">
      <!-- Tab栏区域  ！！el-tab-pane只能作为el-tabs的子元素-->
      <el-tabs @tab-click="tabClicked" :before-leave="beforeTabLeave" v-model="activeIndex" :tab-position="'left'" >
        <el-tab-pane label="基本信息" name='0'>
          <el-form-item label="商品名称" prop="goods_name">
            <el-input v-model="addForm.goods_name"></el-input>
          </el-form-item>
          <el-form-item label="商品价格" prop="goods_price">
            <el-input type="number" v-model="addForm.goods_price"></el-input>
          </el-form-item>
          <el-form-item label="商品重量" prop="goods_weight">
            <el-input type="number" v-model="addForm.goods_weight"></el-input>
          </el-form-item>
          <el-form-item label="商品数量" prop="goods_number">
            <el-input type="number" v-model="addForm.goods_number"></el-input>
          </el-form-item>
          <el-form-item label="商品分类" prop="goods_cat">
            <!-- 级联选择器区域 {props}级联选择器的配置项 {options}数据源-->
            <el-cascader
              v-model="addForm.goods_cat"
              :options="catelist"
              :props="cateProps"
              @change="handleChange">
            </el-cascader>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品参数" name='1'>
          <!-- 渲染表单的item项 -->
          <el-form-item v-for="(item) in manyTableDate" :key="item.attr_id" :label="item.attr_name">
            <!-- 复选框渲染 -->
            <el-checkbox-group  v-model="item.attr_vals">
              <el-checkbox border v-for="(cb,i) in item.attr_vals" :key="i" :label="cb"></el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品属性" name='2'>
          <el-form-item v-for="item in onlyTableDate" :key="item.attr_id" :label="item.attr_name">
            <el-input v-model="item.attr_vals"></el-input>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品图片" name='3'>
          <!-- 图片上传 -->
          <!-- action图片上传到后台api接口 -->
          <el-upload
            :headers="headerObj"
            :action="uploadURL"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            list-type="picture"
            :on-success="handleSuccess">
            <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
        </el-tab-pane>
        <el-tab-pane label="商品内容" name='4'>
          <!-- 富文本编辑器组件 -->
          <quill-editor :v-model="addForm.goods_introduce">
          </quill-editor>
          <!-- 添加商品的按钮 -->
          <el-button @click="add" type="primary" class="btnAdd">添加商品</el-button>
        </el-tab-pane>
      </el-tabs>
    </el-form>
  </el-card>

  <!-- 图片预览 -->
  <el-dialog
    title="图片预览"
    :visible.sync="previewVisible"
    width="30%">
    <img :src="previewPath" alt="" class="previewImg">
  </el-dialog>
</div>
</template>

<script>
var _ = require('lodash');

export default {
data() {
return {
  //激活当前步骤跳索引项
  activeIndex:'0',
  //添加商品的表单数据对象
  addForm:{
    goods_name:'',
    goods_price: 0,
    goods_weight: 0,
    goods_number: 0,
    //商品所属的分类数组
    goods_cat:[],
    //图片的数组
    pics:[],
    //商品的详情
    goods_introduce:'',
    //品的参数（数组），包含 `动态参数` 和 `静态属性`
    attrs:[],
    //
  },
  //表单校验
  addFormRules:{
    goods_name:[
      { required: true, message: '请输入商品名称', trigger: 'blur' }
    ],
    goods_price:[
      { required: true, message: '请输入商品价格', trigger: 'blur' }
    ],
    goods_weight:[
      { required: true, message: '请输入商品重量', trigger: 'blur' }
    ],
    goods_number:[
      { required: true, message: '请输入商品数量', trigger: 'blur' }
    ],
    goods_cat:[
      { required: true, message: '请选择商品分类', trigger: 'blur' }
    ]
  },
  //获取的商品列表
  catelist:[],
  //级联选择器配置
  cateProps:{
    expandTrigger: 'hover',
    label:'cat_name',
    value:'cat_id',
    children:'children'
  },
  //动态参数列表数据
  manyTableDate:[],
  //获取动态属性数据
  onlyTableDate:[],
  //上传图片的URL地址
  uploadURL:'http://timemeetyou.com:8889/api/private/v1/upload',
  //图片上传的请求头
  headerObj:{
    Authorization:window.sessionStorage.getItem('token')
  },
  //图片预览的地址
  previewPath:'',
  //控制图片预览对话框的显示和隐藏
  previewVisible:false,
  //
};
},
computed: {
  //定义商品id
  cateId(){
    if(this.addForm.goods_cat.length === 3){
      return this.addForm.goods_cat[2]
    }
    return null
  },
},
methods: {
  //请求所有商品分类数据
  async getCateList(){
    const {data:res} = await this.$http.get('categories')
    if(res.meta.status !== 200){
      return this.$message.error('获取失败')
    }
    // this.$message.success('获取成功')
    //将获取的商品列表赋值
    this.catelist = res.data
  },
  //级联选择器变化 会触发这个函数
  handleChange(){
    //控制级联选择器 只能选中三级商品分类
    if(this.addForm.goods_cat.length !== 3){
      return this.addForm.goods_cat.length = []
    }
    //选择的商品分类为3时
  },
  //即将进入的标签名 activeName //返回的索引
  //即将离开的标签名 oldActiveName //返回的索引
  beforeTabLeave(activeName,oldActiveName){
    // console.log('即将进入的标签名'+activeName+',即将离开的标签名'+oldActiveName);
    //return false是阻止标签页 切换
    //判断商品名称是否为空
    if(this.addForm.goods_name === undefined){
      this.$message.error('请输入基本信息')
      return false
    }else if(oldActiveName === '0' && this.addForm.goods_cat.length !== 3 ){
      this.$message.error('请选择商品分类')
      return false
    }
  },
  //点击tab切换
  async tabClicked(){
    if(this.activeIndex === '1'){
      const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,{params:{sel:'many'}})
      if(res.meta.status !== 200){
        return this.$message.error('获取动态列表失败')
      }
      // this.$message.success('获取动态列表成功')
      //forEach循环 判断item.attr_vals是否为空 是 返回空数据 否 ,切割为字符串返回
      res.data.forEach(item=>{
        item.attr_vals = item.attr_vals.length === 0?[] : item.attr_vals.split(',')
      })

      //把获取动态列表 赋值给 manyTableDate
      this.manyTableDate = res.data
      //
    }else if(this.activeIndex === '2'){
      const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,{params:{sel:'only'}})
      if(res.meta.status !== 200){
        return this.$message.error('获取动态属性失败')
      }
      // this.$message.success('获取动态属性成功')
      //把获取动态属性 赋值给 onlyTableDate
      this.onlyTableDate = res.data
    }
  },
  //图片上传的 预览事件
  handlePreview(file){
    //赋值图片的地址
    this.previewPath = file.response.data.url
    //展示图片预览对话框
    this.previewVisible = true
  },
  //图片上传 处理移除的事件
  handleRemove(file){
    //1.获取将要删除照片的临时路径
    const filePath = file.response.data.tmp_path
    //2.从pics数组中，找到这个图片对应的索引值
    const i = this.addForm.pics.findIndex(x=>x.pic === filePath)
    //3.调用数组的splice 的方法，把图片信息对象，从pics中移除
    this.addForm.pics.splice(i,1)
    // console.log(this.addForm.pics);
  },
  //监听图片上传成功
  handleSuccess(response, file, fileList){
    //拼接得到一个图片信息对象
    const picInfo  = {pic:response.data.tmp_path}
    //向addForm.pics 添加图片的路径信息
    this.addForm.pics.push(picInfo)
  },
  //添加该商品
  add(){
    this.$refs.addFormRef.validate(async valid => {
      if(!valid){
        return 
      }
      //执行添加的业务逻辑
      //this.addForm.goods_car 有双向绑定 需要拷贝一份 操作拷贝的参数
      //lodash  cloneDeep(obj) 深拷贝
      var form = _.cloneDeep(this.addForm);
      console.log(form);
      form.goods_cat = form.goods_cat.join(',')
      
      // console.log(form);
      //处理动态参数 
      this.manyTableDate.forEach(item => {
        const newInfo = {
          attr_id:item.attr_id,
          attr_value:item.attr_value.join(',')
        }
        this.addForm.attrs.push(newInfo)
      })
      //处理动态属性
      this.onlyTableDate.forEach(item => {
        const newInfo = {
          attr_id:item.attr_id,
          attr_value:item.attr_value.join(',')
        }
        this.addForm.attrs.push(newInfo)
      })
      //赋值操作
      form.attrs = this.addForm.attrs
      //请求添加属性的接口
      const {data:res} = await this.$http.post('goods',form)
      if(res.meta.status !== 201){
        console.log(res);
        return this.$message.error('添加商品失败')
      }
      this.$message.success('添加商品成功')
      this.$router.push('/goods')
    })
  },
},
created() {
  // 获取所有商品分类数据
  this.getCateList()
},
}
</script>
<style lang='scss' scoped>
.el-checkbox{
  margin: 0 10px 0 0!important;
}
.previewImg{
  width: 100%;
}
.btnAdd{
  margin-top: 15px;
}
</style>