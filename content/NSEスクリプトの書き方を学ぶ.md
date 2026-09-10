---
title: NSEスクリプトの書き方を学ぶ
date: 2026-09-10
tags:
  - Nmap
  - NSE
---

Nmapでポートを見つけたあと、そのサービスにリクエストを送り、応答を調べたいことがあります。
その処理をLuaで記述してNmapから実行できるのが、**NSE（Nmap Scripting Engine）** です。
スキャンで得たホストやポートの情報を受け取り、調査結果をNmapの出力にまとめられます。

今回は、まず小さなスクリプトでNSEの書き方を確認します。

## NSEスクリプトの基本構成

NSEスクリプトは、拡張子を`.nse`にしたLuaのファイルです。
主に、説明などのメタデータ、実行条件を決めるルール、処理本体の`action`関数で構成します。
ポートを対象とする場合は、`portrule`が真を返したホストとポートについて、Nmapが`action(host, port)`を呼び出します。
ルールの種類や各フィールドの定義は、[公式ドキュメントのScript Format](https://nmap.org/book/nse-script-format.html)で確認できます。
NSEのカテゴリーは、公式ドキュメントでは次の14種類です。1つのスクリプトに複数のカテゴリーを指定できます。[公式のカテゴリー一覧](https://nmap.org/book/nse-usage.html#nse-categories)

ポートスキャンをしてHTTPが存在している場合、サーバーのヘッダー情報を取得するNSEを書いてみます。
次のコードを`http-server-info.nse`という名前で保存します。

```lua
local http = require "http"
local shortport = require "shortport"

description = [[
  Retrieves the HTTP status and Server header from /.
]]

author = "0x6d61"
license = "Same as Nmap--See https://nmap.org/book/man-legal.html"
categories = {"discovery", "safe"}

-- HTTPと推定されるポートで実行する
portrule = shortport.http

action = function(host, port)
  local response = http.get(host, port, "/")

  -- HTTP応答を取得できなかった場合は結果を表示しない
  if not response or not response.status then
    return nil
  end

  return {
    status = response.status,
    server = response.header["server"] or "(not provided)"
  }
end
```

`require`で読み込んでいる`shortport`は、ポート番号やサービス名から実行条件を作るためのライブラリです。
この例では開いているTCPポートのうち、HTTPっぽいプロトコルを対象としています。`action`では`http.get`でリクエストを送り
HTTPレスポンスが取得できなかった場合は`nil`で取得できた場合はステータスコードとヘッダー情報を返すようにしています。
ちなみにluaでは`[[...]]`が複数行文字列リテラルだそうです。初めて知りました。
licenseはnmapと同じ！みたいなやつが使えるっぽいです。少し雑で面白い。

実際にHTTP サーバーを立ててヘッダーとステータスコードが取得できるか確認してみます。

```
python3 -m http.server 8000 --bind 127.0.0.1
```

nmapの実行結果

```
nmap -p 8000  --script ./http-server-info.nse 127.0.0.1
Starting Nmap 7.94SVN ( https://nmap.org ) at 2026-09-10 12:07 JST
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00040s latency).

PORT     STATE SERVICE
8000/tcp open  http-alt
| http-server-info:
|   status: 200
|_  server: SimpleHTTP/0.6 Python/3.12.3

Nmap done: 1 IP address (1 host up) scanned in 0.14 second
```

基本的なNSEを書いて機能を確認することができました。
多分あんまり使う機会ないと思うけど…
