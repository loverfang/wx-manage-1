<template>
    <div class="mod-config">
        <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()" size="small">
            <el-form-item>
                <el-input v-model="dataForm.categoryName" placeholder="模型名称" clearable></el-input>
            </el-form-item>
            <el-form-item>
                <el-button @click="getDataList()">查询</el-button>
                <el-button type="primary" @click="addOrUpdateHandle()">新增</el-button>
            </el-form-item>
        </el-form>

        <el-table
            ref="dataTable"
            v-loading="loading"
            :data="dataList"
            style="width: 100%"
            row-key="categoryId"
            border
            lazy
            :load="load"
            :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
            <el-table-column prop="categoryName" header-align="left" align="left" label="类别名称">
            </el-table-column>
            <el-table-column prop="parentName" header-align="left" align="left" label="父类别名称">
            </el-table-column>
            <el-table-column prop="priority" header-align="center" align="center" label="显示顺序" width="100">
            </el-table-column>
            <el-table-column prop="categoryUrl" header-align="center" align="left" label="连接地址">
            </el-table-column>
            <el-table-column prop="isNavigater" header-align="center" align="left" label="导航是否显示">
                <template slot-scope="scope">
                    <span v-if="scope.row.isNavigater == 1">显示</span>
                    <span v-else-if="scope.row.isNavigater == 0">不显示</span>
                    <span v-else>不显示</span>
                </template>
            </el-table-column>
            <el-table-column fixed="right" header-align="center" align="center" width="150" label="操作">
                <template slot-scope="scope">
                    <el-button type="text" size="small" @click="addOrUpdateHandle(scope.row)">修改</el-button>
                    <el-button type="text" size="small" @click="deleteHandle(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle" :current-page="pageIndex" :page-sizes="[10, 20, 50, 100]" :page-size="pageSize" :total="totalCount" layout="total, sizes, prev, pager, next, jumper">
        </el-pagination>
        <!-- 弹窗, 新增 / 修改 -->
        <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList" @refreshRowData="refreshRows" :categoryTreeList="allCategoryTreeList"></add-or-update>
    </div>
</template>

<script>
    import AddOrUpdate from './category-add-or-update';
    import { treeDataTranslate } from '@/utils'

    export default{
        name: "category",
        data(){
            return {
                dataForm: {
                    categoryName: ''
                },
                maps: new Map(),
                dataList: [],
                pageIndex: 1,
                pageSize: 10,
                totalCount: 0,
                loading: true,
                dataListSelections: [],
                addOrUpdateVisible: false,
                allCategoryTreeList:[],
            }
        },
        components: {
            AddOrUpdate
        },
        created() {
            // 加载表格数据
            this.getDataList();
            // 树形类别
            this.getAllCategoryList();
        },

        methods: {
            // 定义函数
            // 获取数据列表
            getDataList() {
                this.loading = true
                this.$http({
                    url: this.$http.adornUrl('/cms/category/list'),
                    method: 'get',
                    params: this.$http.adornParams({
                        'page': this.pageIndex,
                        'limit': this.pageSize,
                        'parentId': 0,
                        'categoryName': this.dataForm.categoryName
                    })
                }).then(({ data }) => {
                    if (data && data.code === 200) {
                        data.page.list.filter(item => item.childCount >0).forEach(item => {
                            item.hasChildren = [];
                        })
                        this.dataList = data.page.list
                        this.totalCount = data.page.totalCount
                    } else {
                        this.dataList = []
                        this.totalCount = 0
                    }
                    this.loading = false
                })
            },

            // 获得所有类别数据用于初始化父级类别选项
            getAllCategoryList(){
                this.$http({
                    url: this.$http.adornUrl('/cms/category/treeList'),
                    method: 'get',
                    params: this.$http.adornParams()
                }).then( ({data}) => {
                    //数据操作
                    if (data && data.code === 200) {
                        console.log(data)
                        this.allCategoryTreeList = treeDataTranslate(data.treeList,'categoryId');
                    }
                })
            },

            load(tree, treeNode, resolve) {
                const pid = tree.categoryId;
                this.maps.set(pid,{ tree, treeNode, resolve }) //将当前选中节点数据存储到maps中
                this.$http({
                    url: this.$http.adornUrl('/cms/category/childList'),
                    method: 'get',
                    params: {"parentId":pid}
                }).then(({data}) => {
                    if (data && data.code === 200){
                        let menuList = data.page;
                        menuList.filter(item => item.childCount >0).forEach(item => {
                            item.hasChildren = [];
                        })
                        resolve(menuList)
                    }else{
                        this.$message.error(res)
                    }
                })
            },

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

            // 多选
            selectionChangeHandle(val) {
                this.dataListSelections = val
            },

            // 新增 / 修改
            addOrUpdateHandle(row) {
                const pid = row ? row.categoryId : 0;
                this.addOrUpdateVisible = true
                this.$nextTick(() => {
                    // 打开弹出层后调用初始方法
                    this.$refs.addOrUpdate.init(pid)
                })
            },

            refreshRows( pid ){
                if(pid || pid !=0){
                    this.$http({
                        url: this.$http.adornUrl('/cms/category/childList'),
                        method: 'get',
                        params: {"parentId":pid}
                    }).then(({data}) => {
                        if (data && data.code === 200){
                            let childList = data.page;
                            this.$set(this.$refs.dataTable.store.states.lazyTreeNodeMap, pid, childList); //将对应节点下的数据清空，从而实现数据的重新加载
                        }else{
                            this.$message.error(res)
                        }
                    })
                }else{
                    console.log('要刷新的行，不存在或者是根目录')
                }
            },

            // 删除
            deleteHandle(row) {
                var ids = row ? [row.categoryId] : this.dataListSelections.map(item => item.modelId)
                this.$confirm(`确定对[id=${ids.join(',')}]进行[${ids ? '删除' : '批量删除'}]操作?`, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.$http({
                        url: this.$http.adornUrl('/cms/category/delete'),
                        method: 'post',
                        data: this.$http.adornData(ids, false)
                    }).then(({ data }) => {
                        if (data && data.code === 200) {
                            this.$message({
                                message: '操作成功',
                                type: 'success',
                                duration: 1500,
                                onClose: () => this.refreshRows(row.parentId)
                            })
                        } else {
                            this.$message.error(data.msg)
                        }
                    })
                }).catch(() => { })
            },

        }
    }
</script>

<style scoped>
</style>