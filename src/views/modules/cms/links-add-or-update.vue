<template>
    <el-dialog :title="!dataForm.id ? '新增' : '修改'" :close-on-click-modal="false" :visible.sync="visible" width="40%">
        <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="120px" size="small">
            <el-form-item label="连接名词" prop="name">
                <el-input v-model="dataForm.name" placeholder="连接名词"></el-input>
            </el-form-item>
            <el-form-item label="连接路径" prop="url">
                <el-input v-model="dataForm.url" placeholder="连接路径"></el-input>
            </el-form-item>
            <el-form-item label="显示顺序">
                <el-input-number v-model="dataForm.priority" controls-position="right" @change="handleChange" :min="1"></el-input-number>
            </el-form-item>
            <el-form-item label="备注" prop="remark">
                <el-input type="textarea" v-model="dataForm.remark" placeholder="备注"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="visible = false" size="small">取消</el-button>
            <el-button type="primary" @click="dataFormSubmit()" size="small">确定</el-button>
        </span>
    </el-dialog>
</template>

<script>
export default {
    data() {
        return {
            visible: false,
            dataForm: {
                id: 0,
                name: undefined,
                url: undefined,
                priority: 1,
                remark:undefined
            },
            dataRule: {
                name: [
                    { required: true, message: '连接名称不能为空', trigger: 'blur' }
                ],
                url: [
                    { required: true, message: '连接地址不能为空', trigger: 'blur' }
                ]
            }
        }
    },
    methods: {
        init(id) {
            this.dataForm.id = id || 0
            this.reset();
            this.visible = true
            this.resetForm("dataForm")
            this.$nextTick(() => {
                if (this.dataForm.id) {
                    this.$http({
                        url: this.$http.adornUrl(`/cms/link/detail/`),
                        method: 'get',
                        params: this.$http.adornParams({"id":this.dataForm.id})
                    }).then(({ data }) => {
                        if (data && data.code === 200) {
                            this.dataForm.id = data.linkInfo.linkId
                            this.dataForm.name = data.linkInfo.name
                            this.dataForm.url = data.linkInfo.url
                            this.dataForm.priority = data.linkInfo.priority
                            this.dataForm.remark = data.linkInfo.remark
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
                        url: this.$http.adornUrl(`/cms/link/${!this.dataForm.id ? 'add' : 'update'}`),
                        method: 'post',
                        data: this.$http.adornData({
                            'linkId': this.dataForm.id || undefined,
                            'name': this.dataForm.name,
                            'url': this.dataForm.url,
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

        // 表单重置
        reset() {
            this.form = {
                id: undefined,
                name: undefined,
                url: undefined,
                priority: 1,
                remark:undefined
            };
            this.resetForm("form");
        },

        handleChange(value) {
            console.log(value);
        }
    }
}
</script>
