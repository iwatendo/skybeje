# Skybeje

Skybejeはブラウザ上で動作する小さなチャットサーバーです。<br>
会話の内容は外部のサーバーには保持されず、ブラウザのデータベースに保存されます<br>

## クイックスタート

今すぐに利用できる公開サーバーを準備しています。<br>
以下のリンクをクリックするだけで、あなたのブラウザが小さなチャットサーバーになります。

[チャットサーバーインスタンスの起動](https://skybeje.net/homeinstance/)<br>
（デスクトップ版のGoogle Chromeでのみ動作します）<br>

[プライバシーポリシーと利用規約](https://github.com/iwatendo/skybeje/wiki/Terms-of-Service)

## 目次

チャットの利用方法
- [チャットサーバーインタンスについて](#チャットサーバーインタンスについて)
- [チャットクライアントについて](#チャットクライアントについて)
- [チャットメンバーの招待について](#チャットメンバーの招待について)
- [データが保存される場所について](#データが保存される場所について)
- [シークレットウィンドウを利用したチャットのお試しについて](#シークレットウィンドウを利用したチャットのお試しについて)

セキュリティについて
- [通信要件](#通信要件)
- [セキュリティについて](#セキュリティについて)

ライセンスについて
- [Skybejeのライセンスについて](#Skybejeのライセンスについて)
- [音声合成機能：Skybeje.Speakerについて](#音声合成機能：Skybeje.Speakerについて)
- [音声認識機能：WebSpeechAPIについて](#音声認識機能：WebSpeechAPIについて)
- [YouTube同期再生機能について](#YouTube同期再生機能について)

開発者ガイド
- [はじめに](#はじめに)
- [SkyWayについて](#SkyWayについて)
- [開発環境](#開発環境)
- [アーキテクチャ](#アーキテクチャ)
- [ドキュメント](#ドキュメント)

## チャットの利用方法

### チャットサーバーインタンスについて

[クイックスタート](#クイックスタート)にあるリンクをクリックするだけで、あなたのブラウザが、小さなチャットサーバーになります。

### チャットクライアントについて

チャットサーバーインスタンスページの上部にある「チャットクライアント起動」をクリックすると、チャットクライアントが別タブで開きます。<br>

### チャットメンバーの招待について

チャットサーバーインスタンスの上部、またはチャットサーバークライアントの上部にある「接続URLのコピー」を押すと、チャットサーバーに接続する為のURLがクリップボードにコピーされます。

チャットに招待したいメンバーにこのURLを伝えてください。このURLはチャットサーバーインスタンスの起動のたびに変わります。

### データが保存される場所について

チャットのデータは、チャットサーバーインスタンスを起動した端末のブラウザに保存されます。<br>
プロフィール等のユーザー情報は、チャットサーバークライアントを起動した端末のブラウザに保存されます。<br>
<br>
つまり、登録したプロフィール情報等は、チャットサーバーインスタンスが変わっても引き継がれます。

### シークレットウィンドウを利用したチャットのお試しについて

同一クライアントから、複数のチャットクライアントの起動はできません。<br>
但し、Google Chromeのシークレットウィンドウは別クライアント扱いとなります。<br>
<br>
その為、まずは一人で試してみたい場合、シークレットウィンドウを利用する事で、実際複数人でチャットした場合にどのように動作するのか確認する事が可能です。

## セキュリティについて

Skybejeは©NTT Communications様の [SkyWay](https://webrtc.ecl.ntt.com/) を使用しています。<br>
そのため [SkyWayの通信要件](https://support.skyway.io/hc/ja/articles/115002273767-SkyWay%E3%81%AE%E9%80%9A%E4%BF%A1%E8%A6%81%E4%BB%B6%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6) を満たさない環境ではご利用できません。

本サービスのセキュリティについては、以下のページを参照してださい。<br>
[Skybejeのセキュリティについて](https://github.com/iwatendo/skybeje/wiki/Security)

## ライセンスについて
### Skybejeのライセンスについて
Skybejeはオープンソース(AGPL3.0)です。<br>
AGPL3.0はソフトウェアの改変や商用利用が許可されたライセンスです。<br>
<br>
但し、以下の機能を実現する為、様々な外部サービスの  **無料版(一部商用利用禁止の)API** を使用しております。<br>
そのため、公開サーバーのSkybejeについては商用利用を禁止します。<br>
<br>
別のサーバーにプログラムを設置し、商用利用可能なAPIライセンスを取得して頂ければ、商用利用可能となります。<br>

### SkyWayについて
WebRTCを利用したP2Pを実現する為、©NTT Communications様の[SkyWay](https://webrtc.ecl.ntt.com/)を利用しています。<br>
公開サーバーでは Community Edition を使用しております。<br>
（商用利用する場合は Enterprise Edition を利用するのが望ましいと判断しています）

### 音声合成機能：Skybeje.Speakerについて
Skybejeは、[Skybeje.Speaker](https://github.com/iwatendo/Skybeje.Speaker)と連動させる事により、外部の音声合成サービスをボイスチャット等で利用する事が可能です。<br>
外部の音声合成サービスについては、利用するサービスの利用規約に従ってください。

### 音声認識機能：WebSpeechAPIについて
Skybejeは、Google Chrome の Web Speech APIを利用する事により、音声認識によるチャットが可能です。<br>
このAPIの商用利用の可否については所説あるようですが、有料の音声認識サービス(Google Cloud Speech API)がある事から、商用利用にはこちらを使用する事が望ましいと判断しています。

### YouTube同期再生機能について

YouTubeの埋め込み型プレイヤーは商用利用禁止となるケースがあります。<br>
・[参考：YouTubeヘルプ](https://support.google.com/youtube/answer/71011?hl=ja)<br>
<br>
YouTubeの同期再生をメインで使用する場合、非商用では規約違反とはなりませんが、商用利用では規約違反となる可能性があります。<br>
Skybejeを商用利用する場合はこの機能を削除するのが望ましいと判断されます。

## 開発者ガイド

### はじめに
Skybejeは、バグの報告やドキュメント改善等を歓迎します。

バグ報告や要望は、GitHubのIssueまたはTwitterにお願いします。<br>
 ・[Skybeje / Issues](https://github.com/iwatendo/skybeje/issues)<br>
 ・[Twitter (Iwatendo)](https://twitter.com/iwatendo)<br>
<br>
コードのプルリクエストも歓迎します。<br>
 ・[Skybeje / Pull Request](https://github.com/iwatendo/skybeje/pulls)
 
### アーキテクチャ
Skybejeは、P2PとIndexedDBを利用し、ブラウザだけで殆どの処理を完結させる事を目標としたWebサービスです。<br>
詳細については以下のページを参照してください。<br>
・[Skybejeのアーキテクチャ](https://github.com/iwatendo/skybeje/wiki/Architecture)

### 開発環境
開発環境の構築については以下のページを参照してください。<br>
 ・[開発環境の構築手順](https://github.com/iwatendo/skybeje/wiki/%E9%96%8B%E7%99%BA%E7%92%B0%E5%A2%83%E6%A7%8B%E7%AF%89)<br>
 ・[SkyWayの設定手順](https://github.com/iwatendo/skybeje/wiki/Skyway%E3%81%AE%E8%A8%AD%E5%AE%9A)<br>

### ドキュメント

ページ間の通信のシーケンス図のみ PlantUML で作成予定です。<br>
 ・参考：[Visual Studio Code で UML を描こう](https://qiita.com/couzie/items/9dedb834c5aff09ea7b2)
 ・プレビュー表示　ATL+D
