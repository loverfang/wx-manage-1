<template>
    <div class="app-container">
        <el-row :gutter="20">
            <!--资料类别数据-->
            <el-col :span="4" :xs="24">
                <div class="head-container">
                    <el-input v-model="deptName" size="small" placeholder="请输入类别名称" clearable prefix-icon="el-icon-search" style="margin-bottom: 20px" />
                </div>
                <div class="head-container">
                    <el-tree 
                    :data="deptOptions" 
                    :props="defaultProps" 
                    :expand-on-click-node="false" 
                    :filter-node-method="filterNode" 
                    ref="tree" 
                    default-expand-all 
                    @node-click="handleNodeClick" />
                </div>
            </el-col>

            <!--用户数据-->
            <el-col :span="20" :xs="24">
                <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px" size="small">
                    <el-form-item label="资料名称" prop="name">
                        <el-input v-model="queryParams.name" placeholder="请输入资料名称" clearable  style="width: 240px" @keyup.enter.native="handleQuery" />
                    </el-form-item>
                    <el-form-item label="资料作者" prop="author">
                        <el-input v-model="queryParams.author" placeholder="请输入资料作者" clearable  style="width: 240px" @keyup.enter.native="handleQuery" />
                    </el-form-item>
                    <el-form-item label="上传时间">
                        <el-date-picker v-model="dateRange"  style="width: 240px" value-format="yyyy-MM-dd" type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="cyan" icon="el-icon-search"  @click="handleQuery">搜索</el-button>
                        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
                    </el-form-item>
                </el-form>

                <el-row :gutter="10" class="mb8">
                    <el-col :span="1.5">
                        <el-button type="primary" size="small" icon="el-icon-plus" @click="handleAdd" v-hasPermi="['system:user:add']">新增</el-button>
                    </el-col>
                    <el-col :span="1.5">
                        <el-button type="success" size="small" icon="el-icon-edit" :disabled="single" @click="handleUpdate" v-hasPermi="['system:user:edit']">修改</el-button>
                    </el-col>
                    <el-col :span="1.5">
                        <el-button type="danger" size="small" icon="el-icon-delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['system:user:remove']">删除</el-button>
                    </el-col>
                    <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
                </el-row>

                <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange">
                    <el-table-column type="selection" width="50" align="center" />
                    <el-table-column label="资料名称" align="center" prop="name" />
                    <el-table-column label="资料类别" align="center" prop="categoryName" />
                    <el-table-column label="资料作者" align="center" prop="author" :show-overflow-tooltip="true" />
                    <el-table-column label="发表平台" align="center" prop="platform" :show-overflow-tooltip="true" />
                    <el-table-column label="资料来源" align="center" prop="source" :show-overflow-tooltip="true" />
                    <el-table-column label="上传时间" align="center" prop="createTime" width="160">
                        <template slot-scope="scope">
                            <span>{{ parseTime(scope.row.createTime) }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" align="center" width="180" class-name="small-padding fixed-width">
                        <template slot-scope="scope">
                            <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:user:edit']">修改</el-button>
                            <el-button v-if="scope.row.userId !== 1" size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row.dataId)" v-hasPermi="['system:user:remove']">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle" :current-page="page" :page-sizes="[10, 20, 50, 100]" :page-size="pageSize" :total="totalCount" layout="total, sizes, prev, pager, next, jumper" />
            </el-col>
        </el-row>

        <!-- 添加或修改参数配置对话框 -->
        <el-dialog :title="title" :visible.sync="open" width="960px" append-to-body>
            <el-form ref="form" :model="form" :rules="rules" label-width="80px" size="small">
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="所属类别" prop="categoryId">
                            <treeselect
                                :options="deptOptions"
                                :normalizer="normalizer"
                                placeholder="请选择资料对应的类别"                   
                                v-model="form.categoryId"/>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="资料名称" prop="name">
                            <el-input v-model="form.name" placeholder="请输入用资料名称" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="资料来源" prop="source">
                            <el-input v-model="form.source" placeholder="请输入手机号码" maxlength="11" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="资料作者" prop="author">
                            <el-input v-model="form.author" placeholder="请输入邮箱" maxlength="50" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="发表平台">
                            <el-input v-model="form.platform" placeholder="请输入发表平台" maxlength="11" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="资料编号">
                            <el-input v-model="form.publicNum" placeholder="资料编号" maxlength="50" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="资料摘要">
                            <el-input v-model="form.abstracts" type="textarea" placeholder="请输入内容" :rows=5></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row>
                    <el-col :span="24">
                        <el-form-item label="资料封面" v-model="form.coverImgUrl" prop="coverImgUrl">
                            <el-upload
                                class="avatar-uploader"
                                action="/api/sys/oss/uploadFile"
                                :data="coverChildPath"
                                :headers="uploadHeaders"
                                :show-file-list="false"
                                :on-success="handleAvatarSuccess"
                                :before-upload="beforeAvatarUpload">
                                <img v-if="imageUrl" :src="imageUrl" class="avatar">
                                <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                            </el-upload>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row>
                    <el-col :span="24">
                        <el-form-item label="资料附件">
                            <el-upload
                                class="upload-demo"
                                action="/api/sys/oss/uploadFile"
                                :on-success="handleSuccess"
                                :on-remove="handleRemove"
                                :on-preview="handlePreview"
                                :on-error="handleError"
                                :before-remove="beforeRemove"
                                :limit="1"
                                :headers="uploadHeaders"
                                :on-exceed="handleExceed"
                                :before-upload="uploadBefore"
                                accept=".jpg,.gif,.png,.jpeg,.txt,.pdf,.doc,.docx,.xls,.xlsx"
                                :file-list="fileList">
                                <el-button size="small" type="primary">点击上传</el-button>
                                <div slot="tip" class="el-upload__tip">只能上传PDF文件，且不超过200M</div>
                            </el-upload>

                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>

            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="submitForm" size="small">确 定</el-button>
                <el-button @click="cancel" size="small">取 消</el-button>
            </div>
        </el-dialog>

    </div>
</template>

<script>
    import { treeDataTranslate } from '@/utils'
    import Treeselect from "@riophae/vue-treeselect";
    import "@riophae/vue-treeselect/dist/vue-treeselect.css";

    export default {
        name: "User",
        components: { Treeselect },
        data() {
            return {
                // 遮罩层
                loading: true,
                // 选中数组
                ids: [],
                // 非单个禁用
                single: true,
                // 非多个禁用
                multiple: true,
                // 显示搜索条件
                showSearch: true,
                // 总条数
                total: 0,
                // 用户表格数据
                dataList: null,
                // 弹出层标题
                title: "",
                // 部门树选项
                deptOptions: undefined,
                // 是否显示弹出层
                open: false,
                // 部门名称
                deptName: undefined,
                // 默认密码
                initPassword: undefined,
                // 日期范围
                dateRange: [],
                // 状态数据字典
                statusOptions: [],
                // 性别状态字典
                sexOptions: [],
                // 岗位选项
                postOptions: [],
                // 角色选项
                roleOptions: [],
                // 表单参数
                form: {},
                defaultProps: {
                    value: "categoryId",
                    label: "categoryName",
                    children: "children"
                },

                // 封面图片地址
                imageUrl: '',

                fileList:[],
                
                uploadHeaders: {token: this.$cookie.get('token')},
                coverChildPath: {childPath:'covers_'},
                fileChildPath:  {childPath:'files_'},
                // 查询参数
                queryParams: {
                    page: 1,
                    limit: 10,
                    categoryId: undefined,
                    name: undefined,
                    author: undefined,
                },

                // 表单校验
                rules: {
                    categoryId: [
                        { required: true, message: "资料类型不能为空", trigger: "blur" },
                    ],
                    name: [
                        { required: true, message: "资料名称不能为空", trigger: "blur" },
                    ]
                },
            };
        },

        watch: {
            // 根据名称筛选部门树
            deptName(val) {
                this.$refs.tree.filter(val);
            },
        },

        created() {
            // 获取页面数据
            this.getList();
            this.getTreeselect();
            // this.getDicts("sys_normal_disable").then((response) => {
            //     this.statusOptions = response.data;
            // });
            // this.getDicts("sys_user_sex").then((response) => {
            //     this.sexOptions = response.data;
            // });
            // this.getConfigKey("sys.user.initPassword").then((response) => {
            //     this.initPassword = response.msg;
            // });
        },

        methods: {
            /** 查询资料列表 */
            getList() {
                this.loading = true;
                this.$http({
                    url: this.$http.adornUrl('/cms/data/list'),
                    method: 'get',
                    params: this.$http.adornParams( this.addDateRange(this.queryParams, this.dateRange) )
                }).then( ({data}) => {
                    if (data && data.code === 200) {
                        this.dataList = data.page.list
                        this.totalCount = data.page.totalCount
                    } else {
                        this.dataList = []
                        this.totalCount = 0
                    }
                    this.loading = false
                })
            },

            /** 查询部门下拉树结构 */
            getTreeselect() {
                this.$http({
                    url: this.$http.adornUrl('/cms/category/treeList'),
                    method: 'get',
                    params: this.$http.adornParams()
                }).then( ({data}) => {
                    //数据操作
                    if (data && data.code === 200) {
                        console.log(data)
                        this.deptOptions = treeDataTranslate(data.treeList,'categoryId');
                    }
                })
            },
            
            // 筛选节点
            filterNode(value, data) {
                if (!value) return true;
                return data.categoryName.indexOf(value) !== -1;
            },

            // 节点单击事件
            handleNodeClick(data) {
                this.queryParams.categoryId = data.categoryId;
                // 加载左侧树的内容
                this.getList();
            },

            // 用户状态修改
            handleStatusChange(row) {
                let text = row.status === "0" ? "启用" : "停用";
                this.$confirm(
                    '确认要"' + text + '""' + row.userName + '"用户吗?',
                    "警告",
                    {
                        confirmButtonText: "确定",
                        cancelButtonText: "取消",
                        type: "warning",
                    }
                )
                    .then(function () {
                        return changeUserStatus(row.userId, row.status);
                    })
                    .then(() => {
                        this.msgSuccess(text + "成功");
                    })
                    .catch(function () {
                        row.status = row.status === "0" ? "1" : "0";
                    });
            },
            // 取消按钮
            cancel() {
                this.open = false;
                this.reset();
            },
            
            // 表单重置
            reset() {
                this.form = {
                    dataId: undefined,
                    categoryId: undefined,
                    categoryName: undefined,
                    name: undefined,
                    abstracts: undefined,
                    content: undefined,
                    coverImgUrl: undefined,
                    author: undefined,
                    platform: undefined,
                    source: undefined,
                    publicNum: undefined,
                    dataFileList:[]
                };
                this.fileList = [];
                this.resetForm("form");
            },

            /** 搜索按钮操作 */
            handleQuery() {
                this.queryParams.page = 1;
                this.getList();
            },
            /** 重置按钮操作 */
            resetQuery() {
                this.queryParams.categoryId = undefined;
                this.dateRange = [];
                this.resetForm("queryForm");
                this.handleQuery();
            },
            // 多选框选中数据
            handleSelectionChange(selection) {
                this.ids = selection.map((item) => item.dataId);
                this.single = selection.length != 1;
                this.multiple = !selection.length;
            },
            /** 新增按钮操作 */
            handleAdd() {
                this.reset();
                this.getTreeselect();
                
                this.open = true;
                this.title = "添加资料";

            },

            /** 修改按钮操作 */
            handleUpdate(row) {
                this.reset();
                this.getTreeselect();

                const dataId = row.dataId || this.ids;

                this.$http({
                    url: this.$http.adornUrl(`/cms/data/detail`),
                    method: 'get',
                    params: this.$http.adornParams({"id": dataId})
                }).then(({ data }) => {
                    if (data && data.code === 200) {
                        this.form.dataId = data.dataInfo.dataId;
                        this.form.categoryId=data.dataInfo.categoryId;
                        this.form.categoryName=data.dataInfo.categoryName;
                        this.form.name=data.dataInfo.name;
                        this.form.abstracts=data.dataInfo.abstracts;
                        this.form.content=data.dataInfo.content;
                        this.form.coverImgUrl=data.dataInfo.coverImgUrl;
                        this.form.author=data.dataInfo.author;
                        this.form.platform=data.dataInfo.platform
                        this.form.source=data.dataInfo.source;
                        this.form.publicNum=data.dataInfo.publicNum;

                        var oldDataFileList = data.dataInfo.dataFileList;

                        // 附件列表
                        if(oldDataFileList !=null && oldDataFileList.length>0){
                            for(var k=0;k<oldDataFileList.length;k++){
                                // 用于页面显示的附件信息
                                const viewFiles = {
                                    uid: oldDataFileList[k].fileId,
                                    name: oldDataFileList[k].fileName,
                                    url: oldDataFileList[k].filePath
                                };
                                this.fileList.push(viewFiles);

                                // 用于数据提交的附件信息
                                const fileData = {
                                    uid: oldDataFileList[k].fileId,
                                    fileName: oldDataFileList[k].fileName,
                                    fileType: oldDataFileList[k].fileType,
                                    fileSize: oldDataFileList[k].fileSize,
                                    filePath: oldDataFileList[k].filePath,
                                };
                                this.form.dataFileList.push( fileData )
                            }
                        }

                        this.open = true;
                        this.title = "修改资料";
                    }
                })
            },
            
            /** 重置密码按钮操作 */
            handleResetPwd(row) {
                this.$prompt('请输入"' + row.userName + '"的新密码', "提示", {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                })
                    .then(({ value }) => {
                        resetUserPwd(row.userId, value).then((response) => {
                            if (response.code === 200) {
                                this.msgSuccess("修改成功，新密码是：" + value);
                            }
                        });
                    })
                    .catch(() => {});
            },
            
            /** 提交按钮 */
            submitForm: function () {
                this.$refs["form"].validate((valid) => {
                    if (valid) {
                        let subUrl = this.form.dataId == undefined ? '/cms/data/add' : '/cms/data/update';
                        this.$http({
                            url: this.$http.adornUrl( subUrl ),
                            method: 'post',
                            data: this.$http.adornData(this.form)
                        }).then(({ data }) => {
                            if (data && data.code === 200) {
                                this.$message({
                                    message: '操作成功',
                                    type: 'success',
                                    duration: 1500,
                                    onClose: () => {
                                        this.getList();
                                        this.open = false;
                                    }
                                })
                            } else {
                                this.$message.error(data.msg)
                            }
                        })

                    }
                });
            },

            /** 删除按钮操作 */
            handleDelete(id) {

                var ids = id ? [id] : this.ids
                this.$confirm(`确定对[id=${ids.join(',')}]进行[${ids.length<=1 ? '删除' : '批量删除'}]操作?`, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.$http({
                        url: this.$http.adornUrl('/cms/data/delete'),
                        method: 'post',
                        data: this.$http.adornData(ids, false)
                    }).then(({ data }) => {
                        if (data && data.code === 200) {
                            this.$message({
                                message: '操作成功',
                                type: 'success',
                                duration: 1500,
                                onClose: () => this.getList()
                            })
                        } else {
                            this.$message.error(data.msg)
                        }
                    })
                }).catch(() => { })

            },

            /** 下载模板操作 */
            importTemplate() {
                importTemplate().then((response) => {
                    this.download(response.msg);
                });
            },

            // 文件上传
            handleRemove(file, fileList) {
                for(var i = 0; i < this.form.dataFileList.length; i++){
                    if(file.uid == this.form.dataFileList[i].uid){
                        this.form.dataFileList.splice(i,1)
                    }
                }
            },

            handleSuccess(res, file) {
                if (res && res.code === 200) {
                    const files = {
                        uid: file.uid,
                        url: res.files[0].filePath,
                        fileName: res.files[0].fileName,
                        fileType: res.files[0].fileType,
                        fileSize: res.files[0].fileSize,
                        filePath: res.files[0].filePath
                    };
                    this.form.dataFileList.push(files); 
                } else {
                    this.$message.error(res.msg)
                }
            },

            handleError(err, file, fileList){
                console.log( err )
                this.$message.error( '文件上传出错,请联系管理员!' )
            },

            handlePreview(file) {
                console.log(file);
            },
            
            uploadBefore(file) {
                if (file.size > 500 * 1024 * 1024) {
                    this.$message.error("File size exceeded 500M!");
                    return false;
                }
            },

            handleExceed(files, fileList) {
                this.$message.warning(`Number of files exceeded 1!`);
            },

            beforeRemove(file, fileList) {
                return this.$confirm(`Remove ${ file.name }？`, {
                    confirmButtonText: 'Confirm',
                    cancelButtonText: 'Cancel'
                });
            },

            // 封面上传成功后的回调
            handleAvatarSuccess(res, file) {
                // 页面显示地址
                this.imageUrl = URL.createObjectURL(file.raw);
                // debugger
                // 表单地址
                this.form.coverImgUrl  = res.files[0].filePath;
            },

            // 封面上传前的验证
            beforeAvatarUpload(file) {
                const isJPG = file.type === 'image/jpeg';
                const isLt10M = file.size / 1024 / 1024 < 50;
                if (!isJPG) {
                this.$message.error('上传头像图片只能是 JPG 格式!');
                }
                if (!isLt10M) {
                this.$message.error('上传头像图片大小不能超过 50MB!');
                }
                return isJPG && isLt10M;
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
            },

            // 分也插件相关方法
            // 每页数
            sizeChangeHandle(val) {
                this.pageSize = val
                this.pageIndex = 1
                this.getDataList()
            },
            // 当前页
            currentChangeHandle(val) {
                this.pageIndex = val
                this.getDataList()
            },
        },
    };
</script>

<style>
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 112px;
    height: 153px;
    line-height: 153px;
    text-align: center;
  }
  .avatar {
    width: 224px;
    height: 153;
    display: block;
  }


.el-dialog{
    display: flex;
    display: -ms-flex; /* 兼容IE */
    flex-direction: column;
    -ms-flex-direction: column; /* 兼容IE */
    margin:0 !important;
    position:absolute;
    top:50%;
    left:50%;
    transform:translate(-50%,-50%);
    max-height:calc(100% - 30px);
    max-width:calc(100% - 30px);
  }
.el-dialog .el-dialog__body{
    max-height: 100%;
    flex: 1;
    -ms-flex: 1 1 auto; /* 兼容IE */
    overflow-y: auto;
    overflow-x: hidden;
}

.el-dialog__wrapper {
    /*隐藏ie和edge中遮罩的滚动条*/
    overflow: hidden;
}
</style>