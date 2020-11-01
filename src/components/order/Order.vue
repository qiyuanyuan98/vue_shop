<template>
<div>
   <!-- 面包屑导航区域 -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>订单管理</el-breadcrumb-item>
    <el-breadcrumb-item>订单列表</el-breadcrumb-item>
  </el-breadcrumb>

  <!-- 卡片视图区域 -->
  <el-card>
    <el-row>
      <el-col :span='8'>
        <!-- 搜索文本框 -->
        <el-input v-model="inputValue" placeholder="请输入内容" class="input-with-select">
          <el-button @click="clickinput" slot="append" icon="el-icon-search"></el-button>
        </el-input>
      </el-col>
    </el-row>
    <!-- 订单列表数据 -->
    <el-table :data="orderlist" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status === '0'">未付款</el-tag>
            <el-tag type="danger" v-if="scope.row.pay_status === '1'">已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <template slot-scope="scope">
            {{scope.row.create_time |dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button @click="showBox" size="mini" type="primary" icon="el-icon-edit"></el-button>
            <el-button @click="showProgressBox" size="mini" type="success" icon="el-icon-location"></el-button>
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
      :total="total">
    </el-pagination>
  </el-card>

  <!-- 修改地址的对话框 -->
  <el-dialog
    title="修改地址"
    :visible.sync="addressVisible"
    width="50%"
    @close="addressDialogClosed">
    <el-form :model="addressForm" :rules="addressRules" ref="addressRef" label-width="100px">
      <el-form-item label="省市区/县" prop="address1">
        <!-- 级联选择器 -->
        <el-cascader
          v-model="addressForm.address1"
          :options="citydita"
          :props="{ expandTrigger: 'hover' }">
        </el-cascader>
      </el-form-item>
      <el-form-item label="详细地址" prop="address2">
        <el-input v-model="addressForm.address2"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="addressVisible = false">取 消</el-button>
      <el-button type="primary" @click="editOrder">确 定</el-button>
    </span>
  </el-dialog>

  <!-- 显示物流进度的对话框 -->
  <el-dialog
    title="物流进度"
    :visible.sync="ProgressVisible"
    width="50%">
    <!-- 物流进度 -->

    <span slot="footer" class="dialog-footer">
      <el-button @click="ProgressVisible = false">取 消</el-button>
      <el-button type="primary" @click="ProgressVisible = false">确 定</el-button>
    </span>
  </el-dialog>
</div>
</template>

<script>
import citydita from "./citydata";

export default {
components: {},
data() {
return {
  //查询条件
  queryInfo:{
    query:'',
    pagenum:1,
    pagesize:10
  },
  //订单列表
  orderlist:[],
  //商品列表总数
  total:0,
  //控制修改地址对话的显示与隐藏
  addressVisible:false,
  //编辑表单验证的双向绑定数据
  addressForm:{
    address1:[],
    address2:''
  },
  //表单对话框的对话规则
  addressRules:{
    address1:{required: true, message: '请选择省市区/县', trigger: 'blur' },
    address2:{required: true, message: '请输入详细地址', trigger: 'blur' }
  },
  //省市区/县
  citydita,
  //控制物流进度的显示和隐藏
  ProgressVisible:false,
  //搜索框 双向绑定
  inputValue:''
};
},
computed: {},
methods: {
  //获取商品数据列表
  async getOrderList(){
    const {data:res} = await this.$http.get('orders',{params:this.queryInfo})
    if(res.meta.status !== 200){
      return this.$message.error('获取数据列表失败')
    } 
    //赋值 订单列表数据 
    this.orderlist = res.data.goods
    //赋值 总参数数量
    this.total = res.data.total
  },
  //分页 --监听 选择展示的数据条数 
  handleSizeChange(newSize){
    this.queryInfo.pagesize = newSize
    this.getOrderList()
  },
  //分页 --监听 点击页码
  handleCurrentChange(newPage){
    this.queryInfo.pagenum = newPage
    this.getOrderList()
  },  
  //展示修改地址的对话框
  showBox(){
    //无法修改地址
    this.$message.error('暂无接口，无法完成修改')
    //显示编辑对话框
    this.addressVisible = true
  },
  //监听修改地址对话框关闭事件
  addressDialogClosed(){
    this.$refs.addressRef.resetFields()
  },
  //点击确定按钮 校验修改地址 并完成修改
  editOrder(){
    //1.校验 输入框
    this.$refs.addressRef.validate(v => {
      if(!v)return
      //2.请求接口地址
      //3.完成修改
    })
    //4.关闭对话框
      this.addressVisible = false
  },
  //触发事件 显示对话框
  async showProgressBox(){
    return this.$message.error('暂无物流信息接口');
    //物流信息请求
    // const {data:res} = await this.$http.get('/kuaidi/1106975712662')
    // if(res.meta.status !== 200){
    //   return this.$message.error('暂无物流信息接口');
    // }
    //赋值操作 定义个P参数
    //this.P = res.data
    //显示对话框
    // this.ProgressVisible = true
  },

  //输入框搜索功能
  clickinput(){
    this.$message.error('暂无搜索功能')
  }
},
created() {
  //获取订单数据列表
  this.getOrderList()
},
}
</script>
<style lang='scss' scoped>
.el-cascader{
  width: 100%;
}
</style>