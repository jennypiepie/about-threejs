const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
    mode:'development',
    entry: './src',
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
                
            },
            {
                test: /\.(jpg|png|jpeg|gif|svg)$/,
                type: "asset/resource",
                generator: {
                    filename: "image/[name].[hash:8][ext]" 
                }    
            }

        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html'
        })
    ],
    performance: {
	    //入口起点的最大体积
      maxEntrypointSize: 50000000,
	    //生成文件的最大体积
      maxAssetSize: 30000000,
    },
    devServer: {
    static: 'static', // 静态文件目录
    compress: true, //是否启动压缩 gzip
    port: 8080, // 端口号
    open:true  // 是否自动打开浏览器
  },
};
