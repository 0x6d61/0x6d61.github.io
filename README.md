# Mind Injection

0x6d61の個人ブログです。Markdownをpushすると、GitHub Actionsが静的HTMLを生成してGitHub Pagesへ公開します。

## 記事を書く

`content/` にMarkdownファイルを追加します。

```md
---
title: 記事タイトル
date: 2026-08-01
tags:
  - Security
---

ここに本文を書きます。
```

画像は `content/assets/` に置き、通常のMarkdownまたはObsidian記法で参照できます。

```md
![説明](assets/example.png)
![[example.png]]
```

記事用ブランチを作ってPull Requestを開くと、サイトが正しく生成できるか自動確認されます。Pull Requestを`main`へマージすると公開され、記事一覧、タグ、RSS、サイトマップも自動更新されます。

```sh
git switch main
git pull
git switch -c article/記事名
# content/へ記事を追加
git add content
git commit -m "記事を追加"
git push -u origin article/記事名
```

## ローカルで確認する

Node.js 22以降を用意して、次を実行します。

```sh
corepack npm install
corepack npm run dev
```

本番用の生成確認は `corepack npm run build` で行えます。生成物は `_site/` に出力されます。
