# Markdown記法 チートシート

QiitaのMarkdown記法のチートシートです。
記法はGitHub Flavored Markdownに準拠し、一部拡張しています。

Qiitaでシンタックスハイライト可能な言語一覧については、[シンタックスハイライト可能な言語](https://qiita.com/Qiita/items/c892d2021eed554625f0) をご覧下さい。

---

## Code - コードの挿入

### Code blocks - コードブロック

たとえば、「Ruby」で記述したコードをファイル名「qiita.rb」として投稿したいときは、 バッククオート（ ` ） か チルダ（ ~ ） を使用して以下のように投稿するとシンタックスハイライトが適用されます。

**書き方**
```
```ruby:qiita.rb
puts 'The best way to log and share programmers knowledge.'
```
```

**結果**
```ruby:qiita.rb
puts 'The best way to log and share programmers knowledge.'
```

#### Diffと他の言語のシンタックスを同時に使う
Qiitaでサポートしている各シンタックスに、新たに `diff_*` という名前をつけることでDiffを追加することができます。
`-` 、 `+` を行の先頭に書くことでDiffを表現することができます。

### Code spans - コードスパン
コードをインライン表示することも可能です。

**書き方**
```
`puts 'Qiita'` と書くことでインライン表示することも可能です。
```

**結果**
`puts 'Qiita'` と書くことでインライン表示することも可能です。

#### コードスパン内でバッククオートを使う
コードスパン内でバッククオートを使いたいときは、開始・終了のバッククオートをn+1個で囲みます。

**書き方**
```
`` `バッククオート` `` や ``` ``2連続バッククオート`` ``` も記述できます。
```

**結果**
`` `バッククオート` `` や ``` ``2連続バッククオート`` ``` も記述できます。

---

## Format Text - テキストの装飾

### Headings - 見出し
`#` とテキストの間に半角スペースを入れてください。

**書き方**
```markdown
# これはH1タグです
## これはH2タグです
###### これはH6タグです
```

**結果**
# これはH1タグです
## これはH2タグです
###### これはH6タグです

### Emphasis / Strong Emphasis - 強調・強勢
前後に 半角スペース か 改行文字 を入れてください。

**書き方**
```markdown
_ か * で囲むとHTMLのemタグになります。Qiitaでは *italic type* になります。
__ か ** で囲むとHTMLのstrongタグになります。Qiitaでは **太字** になります。
```

**結果**
_ か * で囲むとHTMLのemタグになります。Qiitaでは *italic type* になります。
__ か ** で囲むとHTMLのstrongタグになります。Qiitaでは **太字** になります。

### Strikethrough - 打ち消し線
前後に 半角スペース か 改行文字 を入れてください。

**書き方**
```markdown
打ち消し線を使うには ~~ で囲みます。 ~~打ち消し~~
```

**結果**
打ち消し線を使うには ~~ で囲みます。 ~~打ち消し~~

### Details - 折りたたみ
HTMLの `<details>` タグを使えます。

**書き方**
```html
<details>
  <summary>サンプルコード</summary>
  ```rb
  puts 'Hello, World'
  ```
</details>
```

### Note - 補足説明
補足したい内容を `:::note info` と `:::` で囲みます。 `info` は省略可能です。 `warn` や `alert` も使えます。

**書き方**
```
:::note info
インフォメーション
:::

:::note warn
警告
:::

:::note alert
より強い警告
:::
```

---

## Lists - リスト

### Bullet List - 順序なしリスト
文頭に `*`, `+`, `-` のいずれかを入れると順序なしリストになります。

### Ordered List - 番号付きリスト
文頭に `数字.` を入れると番号付きリストになります。

### Checkbox - チェックボックス
順序なしリストの記述の後ろに `[ ]` または `[x]` を入れます。

**書き方**
```markdown
- [ ] タスク1
- [x] タスク2
```

**結果**
- [ ] タスク1
- [x] タスク2

---

## Blockquotes - 引用
文頭に `>` を置くことで引用になります。

**書き方**
```markdown
> 文頭に>を置くことで引用になります。
> > これはネストされた引用です。
```

**結果**
> 文頭に>を置くことで引用になります。
> > これはネストされた引用です。

---

## Horizontal rules - 水平線
`***` や `---` などで水平線を表示できます。

---

## Links - リンク

**書き方**
```markdown
[リンクテキスト](URL "タイトル")
[Qiita](http://qiita.com)
```

**結果**
[Qiita](http://qiita.com)

### ページ内リンクの書き方
同じページ内の見出しに飛ぶリンクを作れます。
```markdown
[「ページ内リンクの書き方」にジャンプ](#ページ内リンクの書き方)
```

---

## Images - 画像埋め込み

**書き方**
```markdown
![代替テキスト](画像のURL "画像タイトル")
```
HTMLでサイズ調整も可能です。
```html
<img width="50" src="画像のURL">
```

---

## テーブル

**手動で入力する場合**
```markdown
| Left align | Right align | Center align |
|:-----------|------------:|:------------:|
| This       |        This |     This     |
| column     |      column |    column    |
```

**結果**
| Left align | Right align | Center align |
|:-----------|------------:|:------------:|
| This | This | This |
| column | column | column |

---

## 数式の挿入
コードブロックの言語指定に `math` を指定することでTeX記法が使えます。

**書き方**
```
```math
\left( \sum_{k=1}^n a_k b_k \right)^{\!\!2} \leq \left( \sum_{k=1}^n a_k^2 \right) \left( \sum_{k=1}^n b_k^2 \right)
```
```

また、`$`で囲むとインライン表示も可能です。
`$x^2 + y^2 = 1$` → $x^2 + y^2 = 1$

---

## 目次(TOC)の自動挿入
目次は記事内の見出しを元に自動生成され、右側に表示されます。

---

## 脚注
本文中に `[^example]` のように記述し、注釈内容を `[^example]: ...` と記述します。

---

## 絵文字
`:` で囲って、絵文字を埋め込めます。 (例: `:kissing_closed_eyes:`)

---

## リンクカード
URLを単独で記述して前後を空行で囲うと、リンクカードとして表示されます。
Github, X, CodeSandbox, Figma, YouTubeなど、多くのサービスの埋め込みに対応しています。

---

## ダイアグラム

### PlantUMLを使う
コードブロックの言語名を `plantuml` とすることで、PlantUMLが使えます。

### Mermaidを使う
コードブロックの言語名を `mermaid` とすることで、Mermaidが使えます。

---

## その他
バックスラッシュ `\` を使うことでMarkdown記法をエスケープできます。

```