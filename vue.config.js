module.exports = {
	publicPath: "./",
	devServer: {
		host: '0.0.0.0', //ip地址
		hot: true, //热加载
		port: 8001, //端口
		https: false, //false关闭https，true为开启
		open: true, //自动打开浏览器
		proxy: {
		  '/api': {
			target: 'http://localhost:8088/',
			// 在本地会创建一个虚拟服务端，然后发送请求的数据，并同时接收请求的数据，这样服务端和服务端进行数据的交互就不会有跨域问题
			changeOrigin: true,
			// ws: true,
			pathRewrite: {
			  // 替换target中的请求地址，也就是说以后你在请求http://api.jisuapi.com/XXXXX这个地址的时候直接写成/api/xxx即可
			  '^/api': '/api'
			}
		  },
	    }
	},

	configureWebpack:{
		devServer: {
			disableHostCheck: true
		},
		externals: {
			vue: "Vue",
			"vue-router": "Router",
            "element-ui": "ELEMENT",
            "tinymce":"tinymce"
		}
	},
	chainWebpack: config => {
		// 移除 prefetch 插件
		config.plugins.delete('prefetch')
	},

	outputDir: 'dist',
	assetsDir: 'res/admin/',
	runtimeCompiler: undefined,
	productionSourceMap: false,
	parallel: undefined,
	css: undefined
}