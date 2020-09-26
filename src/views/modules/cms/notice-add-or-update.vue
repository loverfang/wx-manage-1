<template>
    <el-dialog :title="!dataForm.id ? '新增' : '修改'" :close-on-click-modal="false" :visible.sync="visible" width="65%">
        <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="120px">
            <el-form-item label="公告标题" prop="title">
                <el-input v-model="dataForm.title" placeholder="公告标题"></el-input>
            </el-form-item>
            <el-form-item label="发表部门">
                <el-input v-model="dataForm.author" placeholder="发表部门"></el-input>
            </el-form-item>
            <el-form-item label="公告来源">
                <el-input v-model="dataForm.source" placeholder="公告来源"></el-input>
            </el-form-item>
            <el-form-item label="显示顺序">
                <el-input-number v-model="dataForm.priority" controls-position="right" @change="handleChange" :min="1"></el-input-number>
            </el-form-item>
            <el-form-item label="公告内容">
                <tinymce-editor ref="editor" v-model="dataForm.content"></tinymce-editor>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="visible = false">取消</el-button>
            <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
        </span>
    </el-dialog>
</template>

<script>
export default {
    components: {
        TinymceEditor: () => import("@/components/tinymce-editor")
    },
    data() {
        return {
            visible: false,
            dataForm: {
                id: 0,
                title: '',
                author: '',
                source: '',
                priority: 1,
                content:''
            },
            dataRule: {
                title: [
                    { required: true, message: '公告标题不能为空', trigger: 'blur' }
                ],
                content: [
                    { required: true, message: '公告内容不能为空', trigger: 'blur' }
                ]
            }
        }
    },
    methods: {
        init(id) {
            this.dataForm.id = id || 0
            this.visible = true
            this.$nextTick(() => {
                this.$refs['dataForm'].resetFields()
                if (this.dataForm.id) {
                    this.$http({
                        url: this.$http.adornUrl(`/cms/notice/detail/`),
                        method: 'get',
                        params: this.$http.adornParams({"id":this.dataForm.id})
                    }).then(({ data }) => {
                        if (data && data.code === 200) {
                            this.dataForm.id = data.noticeInfo.noticeId
                            this.dataForm.title = data.noticeInfo.title
                            this.dataForm.author = data.noticeInfo.author
                            this.dataForm.source = data.noticeInfo.source
                            this.dataForm.priority = data.noticeInfo.priority
                            this.dataForm.content = data.noticeInfo.content
                        }
                    })
                }
            })
        },

        // 表单提交
        dataFormSubmit() {
            this.$refs['dataForm'].validate((valid) => {
                if (valid) {
                    this.$http({
                        url: this.$http.adornUrl(`/cms/notice/${!this.dataForm.id ? 'add' : 'update'}`),
                        method: 'post',
                        data: this.$http.adornData({
                            'noticeId': this.dataForm.id || undefined,
                            'title': this.dataForm.title,
                            'author': this.dataForm.author,
                            'source': this.dataForm.source,
                            'priority': this.dataForm.priority,
                            'content': this.dataForm.content
                        })
                    }).then(({ data }) => {
                        if (data && data.code === 200) {
                            this.$message({
                                message: '操作成功',
                                type: 'success',
                                duration: 1500,
                                onClose: () => {
                                    this.visible = false
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
        handleChange(value) {
            console.log(value);
        }
    }
}
</script>

<style>
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