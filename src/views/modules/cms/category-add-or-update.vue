<template>
    <el-dialog :title="!dataForm.id ? '新增' : '修改'" :close-on-click-modal="false" :visible.sync="visible" v-if='visible' width="40%"  @close="closeDialogForm()">
        <el-form  ref="dialogDataForm" :model="dataForm" :rules="dataRule" @keyup.enter.native="dataFormSubmit()" label-width="120px" size="small">
            <el-form-item label="类别名称" prop="categoryName">
                <el-input v-model="dataForm.categoryName" placeholder="类别名称"></el-input>
            </el-form-item>

            <el-form-item label="父类别" prop="parentId">
                <!-- 下拉树 -->
                <treeselect
                    :options="optionData"
                    :normalizer="normalizer"
                    placeholder="请选择父类别"                   
                    v-model="dataForm.parentId"/>
            </el-form-item>

            <el-form-item label="跳转地址" prop="categoryUrl">
                <el-input v-model="dataForm.categoryUrl" placeholder="如(http://192.168.0.1:8000)"></el-input>
            </el-form-item>

            <el-form-item label="导航是否展示" prop="categoryUrl">
                <el-switch
                    active-color="#13ce66"
                    v-model="dataForm.isNavigater"> 
                </el-switch> <label>绿色:展示，灰色:不展示</label>
            </el-form-item>

            <el-form-item label="显示顺序" prop="priority">
                <el-input-number v-model="dataForm.priority" controls-position="right" @change="handleChange" :min="1"></el-input-number>
            </el-form-item>

            <el-form-item label="备注" prop="remark">
                <el-input type="textarea" v-model="dataForm.remark" placeholder="备注"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="visible = false" size="small" >取消</el-button>
            <el-button type="primary" @click="dataFormSubmit()" size="small">确定</el-button>
        </span>
    </el-dialog>
</template>

<script>
    import Treeselect from "@riophae/vue-treeselect";
    import "@riophae/vue-treeselect/dist/vue-treeselect.css";

    export default {
        name:'category-add-or-update',
        components: { Treeselect },
        props:{
            categoryTreeList:{
                type: Array,
                default:[]
            }
        },
        data() {
            return {
                visible: false,
                dataForm: {
                    id: 0,
                    categoryName: '',
                    categoryUrl: '',
                    parentId: 0,
                    priority: 1,
                    isNavigater: true,
                    remark:''
                },

                dataRule: {
                    categoryName: [
                        { required: true, message: '类别名称不能为空', trigger: 'blur' }
                    ],
                    priority: [
                        { required: true, message: '显示顺序不能为空', trigger: 'blur' }
                    ],
                },

                optionData:[],

                viewTreeSelect: false, //控制下拉树的问题
                isClearable: true, // 可清空（可选）
                isAccordion: true, // 可收起（可选）
                valueId: 0, // 树形下拉默认也选中根栏目
                props: {
                    // 配置项（必选）
                    value: "categoryId",
                    label: "categoryName",
                    children: "children"
                    // disabled:true
                }
            }
        },
        
        // 请求数据
        created(){
            // 父组件将不变的数据传到子组件
            console.log("父组件传过来的值", this.categoryTreeList)
            this.optionData = this.categoryTreeList
        },

        watch:{
            //正确给 cData 赋值的 方法
            categoryTreeList: function(newVal, oldVal){
                console.log('监听到他还是变化了的', newVal, oldVal)
                this.optionData = newVal;   //newVal即是optionData
            }
        },

        // 请求数据
        methods: {
            init(id) {
                this.dataForm.id = id || 0

                this.reset();
                this.visible = true
                this.resetForm("dataForm")

                // 打开弹出框
                this.visible = true
                this.$nextTick(() => {
                    if (this.dataForm.id) {
                        this.$http({
                            url: this.$http.adornUrl(`/cms/category/detail`),
                            method: 'get',
                            params: this.$http.adornParams({"categoryId":this.dataForm.id})
                        }).then(({data}) => {
                            if (data && data.code === 200) {
                                console.log('data',data.category)
                                this.dataForm.id = data.category.categoryId
                                this.dataForm.categoryName = data.category.categoryName
                                this.dataForm.parentId = data.category.parentId
                                this.dataForm.categoryUrl = data.category.categoryUrl
                                this.dataForm.priority = data.category.priority
                                this.dataForm.isNavigater = (data.category.isNavigater==1)?true:false
                                this.dataForm.remark = data.category.remark
                                this.valueId = data.category.parentId
                            }
                        })
                    }
                    this.viewTreeSelect = true
                })
            },
 
            watch:{
                 categoryTreeList(newValue){
                    this.optionData = newValue
                 }
            },

            // 表单重置
            reset() {
                this.form = {
                    id: undefined,
                    categoryName: undefined,
                    parentId: undefined,
                    priority: 1,
                    isNavigater: false,
                    remark:undefined
                };
                this.valueId = undefined
                this.resetForm("form");
            },

            // 表单提交
            dataFormSubmit() {
                this.$refs['dialogDataForm'].validate((valid) => {
                    if (valid) {
                        console.log(`/cms/category/${!this.dataForm.id ? 'add' : 'update'}`)
                        this.$http({
                            url: this.$http.adornUrl(`/cms/category/${!this.dataForm.id ? 'add' : 'update'}`),
                            method: 'post',
                            data: this.$http.adornData({
                                'categoryId': this.dataForm.id || undefined,
                                'categoryName': this.dataForm.categoryName,
                                'parentId': this.dataForm.parentId,
                                'categoryUrl': this.dataForm.categoryUrl,
                                'isNavigater': (this.dataForm.isNavigater)?1:0,
                                'priority': this.dataForm.priority,
                                'remark': this.dataForm.remark
                            })
                        }).then(({ data }) => {
                            if (data && data.code === 200) {
                                this.$message({
                                    message: '操作成功',
                                    type: 'success',
                                    duration: 1500,
                                    onClose: () => {
                                        this.visible = false
                                        // 树形Table中某行的数据刷新
                                        // console.log('zi----->', this.dataForm.parentId)
                                        if(this.dataForm.parentId != 0){
                                            // 第一层就直接刷新页面就行了
                                            this.$emit('refreshRowData',this.dataForm.parentId)
                                        }
                                        // 刷新父页面中的方法
                                        this.$emit('refreshDataList')
                                    }
                                })
                                
                            } else {
                                this.$message.error(data.msg)
                            }
                        })
                    }
                })
            },
            
            // 关闭弹出层
            closeDialogForm(){
                this.visible = false
                this.$refs["dialogDataForm"].resetFields();
            },

            handleChange(value) {
                console.log(value);
            },

            // 树形菜单自定义属性,有了这些属性转换才能政策显示
            // 这是normalizer的方法 （就相当于函数执行）
            // 后台返回的数据如果和Vue Treeselect要求的数据结构不同，需要进行转换
            normalizer(node){
                //将里面children=[]为空的时候去掉（如果不加的这句的话 如果里面children属性值为空 数状选择器里就给他默认有下一层  可里面没有所以显示空数据）
                if(node.children && !node.children.length){
                    delete node.children;
                }
                // 将后台传来的数组进行修改
                return {
                    id: node.categoryId,
                    label:node.categoryName,
                    children:node.children
                }
            }
        }
    }
</script>
