<template>
<div class=''>
   <el-button type="info" @click="logout">退出登录</el-button>
</div>
</template>

<script>

export default {
components: {},
data() {
return {

};
},
computed: {},
watch: {},
methods: {
  logout(){
    //退出登录原理，清除token
    window.sessionStorage.clear()
    //页面跳转登录页
    this.$router.push("./login")
  }
},
created() {

},
mounted() {

},
activated() {}, 
}
</script>
<style lang='scss' scoped>
</style>