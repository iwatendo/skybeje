module.exports = {

  mode: 'development',  

  entry: {
    initialize: './src/Page/Initialize/Script.ts',
    profile: './src/Page/Profile/Script.ts',
    room: './src/Page/Room/Script.ts',
    homeinstance: './src/Page/HomeInstance/Script.ts',
    homevisitor: './src/Page/HomeVisitor/Script.ts',
    castinstance: './src/Page/CastInstance/Script.ts',
    castinstancemobile: './src/Page/CastInstanceMobile/Script.ts',
    castinstancemobileqr: './src/Page/CastInstanceMobileQR/Script.ts',
    castinstancescreenshare: './src/Page/CastInstanceScreenShare/Script.ts',
    castvisitor: './src/Page/CastVisitor/Script.ts',
    raspicastinstance: './src/Page/RaspiCastInstance/Script.ts',
    raspicastvisitor: './src/Page/RaspiCastVisitor/Script.ts',
    gadgetinstance: './src/Page/GadgetInstance/Script.ts',
    gadgetvisitor: './src/Page/GadgetVisitor/Script.ts',
    livehtmlinstance: './src/Page/LiveHTMLInstance/Script.ts',
    livehtmlvisitor: './src/Page/LiveHTMLVisitor/Script.ts',
    voicechat:'./src/Page/VoiceChat/Script.ts',
    voicechatsettings: './src/Page/VoiceChatSettings/Script.ts',
    qrcode: './src/Page/QrCode/Script.ts',
    selectactor: './src/Page/SelectActor/Script.ts',
    usersettings: './src/Page/UserSettings/Script.ts',
  },
  output: {
    path: __dirname + '/dist',
    filename: '[name]/bundle.js'
  },
  externals: {
    'react': 'React',
    'react-dom': 'ReactDOM'
  },
  devtool: 'source-map',

  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          { loader: 'ts-loader', }
        ]
      }
    ]
  },
  performance: {
    hints: false
  }
};
