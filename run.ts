#!/usr/bin/env ts-node

import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
import md5 from "md5";
import { askLLM } from "./askLLM";
import { postToQiita } from "./postToQiita";
import { Search } from "./search";

const [originalText] = process.argv.slice(2);

console.log(originalText);
if (!originalText) {
    console.log("originalText is required");
    process.exit(1);
}

dotenv.config();
const CUSTOM_SEARCH_API_KEY = process.env.CUSTOM_SEARCH_API_KEY;
const CUSTOM_SEARCH_CX = process.env.CUSTOM_SEARCH_CX;
const QIITA_ACCESS_TOKEN = process.env.QIITA_ACCESS_TOKEN;

if (!CUSTOM_SEARCH_API_KEY) {
    throw new Error("CUSTOM_SEARCH_API_KEY is not set");
}
if (!CUSTOM_SEARCH_CX) {
    throw new Error("CUSTOM_SEARCH_CX is not set");
}
if (!QIITA_ACCESS_TOKEN) {
    throw new Error("QIITA_ACCESS_TOKEN is not set");
}

const WORK_DIR = "./.gomi-qiita-work";
const WEB_PAGE_CACHE_DIR = WORK_DIR + "/web-page-cache";

if (!fs.existsSync(WORK_DIR)) {
    fs.mkdirSync(WORK_DIR);
}

if (!fs.existsSync(WEB_PAGE_CACHE_DIR)) {
    fs.mkdirSync(WEB_PAGE_CACHE_DIR);
}

const search = async (query: string, num = 10) => {
    // GET https://www.googleapis.com/customsearch/v1?key=INSERT_YOUR_API_KEY&cx=017576662512468239146:omuauf_lfve&q=lectures
    const response = await axios.get<Search>(
        `https://www.googleapis.com/customsearch/v1?key=${CUSTOM_SEARCH_API_KEY}&cx=${CUSTOM_SEARCH_CX}&q=${query}&num=${num}`
    );

    console.log(JSON.stringify(response.data, null, 2));

    return (
        response.data.items?.map((result) => ({
            title: result.title,
            description: result.snippet,
            url: result.link,
        })) || []
    );
};
const saveUrls = (urls: string[]) => {
    fs.writeFileSync(`${WORK_DIR}/urls.txt`, urls.join("\n"));
};
const loadUrls = () => {
    return fs.readFileSync(`${WORK_DIR}/urls.txt`, "utf-8").split("\n");
};
const download = async (url: string) => {
    if (fs.existsSync(`${WEB_PAGE_CACHE_DIR}/${md5(url)}`)) {
        return;
    }
    try {
        const response = await axios.get(url, {
            responseType: "arraybuffer",
        });
        const buffer = Buffer.from(response.data, "binary");
        const fileName = md5(url);
        fs.writeFileSync(`${WEB_PAGE_CACHE_DIR}/${fileName}`, buffer);
    } catch (e) {
        console.log(e);
        return;
    }
};

const searchToSummary = async (queries: string[], postStructure: string) => {
    const searchResults = await Promise.all(queries.map((query) => search(query)));
    const result = searchResults.flat();
    console.log(result);

    const urlSelectorResult = await askLLM(`
あなたはプログラマとしてごく短い記事を作成しています。
記事を作成するのに必要なWebページを検索結果から最大6つ選択し、URLだけを1行ずつ出力してください。

# 構成
${postStructure}

# 検索結果
${JSON.stringify(result)}
`);

    saveUrls(urlSelectorResult.split("\n").filter((url) => url.length > 0 && url.startsWith("http")));

    const urls = loadUrls();
    console.log(urls);

    await Promise.all(urls.map((url) => download(url)));

    await Promise.all(
        urls.map(async (url) => {
            if (fs.existsSync(`${WEB_PAGE_CACHE_DIR}/${md5(url)}_summary`)) {
                return;
            }
            if (!fs.existsSync(`${WEB_PAGE_CACHE_DIR}/${md5(url)}`)) {
                return;
            }

            try {
                const summaryResult = await askLLM(`
あなたはプログラマとしてごく短い記事を作成しています。
記事を作成するのに以下のWebページから必要な情報のみを抽出してまとめて
${WEB_PAGE_CACHE_DIR}/${md5(url)}_summary という名前のファイルに出力してください。
文章の長さ（コードは除く）は1000字以内としてください。
参考にならなそうな場合は何も出力しないで終了してください。

# 構成
${postStructure}

# Webページ
@${WEB_PAGE_CACHE_DIR}/${md5(url)}
`);
                console.log(summaryResult);
            } catch (e) {
                console.log(e);
                return;
            }
        })
    );

    return urls
        .filter((url) => fs.existsSync(`${WEB_PAGE_CACHE_DIR}/${md5(url)}_summary`))
        .map((url) => {
            return {
                url,
                summaryFilePath: `${WEB_PAGE_CACHE_DIR}/${md5(url)}_summary`,
            };
        });
};

(async function () {
    // const result = askLLM("こんにちわ");
    // console.log(result);

    const result = await askLLM(`
あなたはプログラマとしてごく短い記事を作成しています。
「${originalText}」という文章にまつわる記事を作成するのに必要な検索クエリを最大3つ、英語で1行ずつ出力してください。
3つはそれぞれ独立し、幅広く、多角的な視点が得られるものにしてください。
`);
    console.log(result);

    const queries = result.split("\n").filter(Boolean);
    console.log(queries);

    const summaries = await searchToSummary(queries, `未定。「${originalText}」という文章にまつわる記事になる予定。`);
    console.log(summaries);

    const postStructureResult = await askLLM(`
あなたはプログラマとしてごく短い記事を作成しています。
「${originalText}」という文章にまつわる記事を作成するのに情報を集めました。
これを元にあなたは以下の記事の構成情報を出力してください。

- 想定読者（人数は多くなくてもいいが、困っているほど良い）
- 記事で伝えたいこと（網羅的なものではなく、1つに絞る）
- 記事のタイトル
- 各章のタイトル

${JSON.stringify(summaries, null, 2)}
`);

    console.log(postStructureResult);

    const writerResult = await askLLM(`
あなたはプログラマとしてごく短い記事を作成しています。
「${originalText}」という文章にまつわる記事を作成します。調査内容と構成は以下にするとき、追加で必要な検索クエリを最大3つ、英語で1行ずつ出力してください。
3つはそれぞれ独立し、幅広く、多角的な視点が得られるものにしてください。


# 調査内容

${JSON.stringify(summaries, null, 2)}

---

# 構成

${postStructureResult}
`);

    console.log(writerResult);

    const additionalQueries = writerResult.split("\n").filter(Boolean);
    console.log(additionalQueries);

    const summaries2 = await searchToSummary(additionalQueries, postStructureResult);
    console.log(summaries2);

    // merged by url
    const mergedSummaries: typeof summaries = [];
    for (const summary of summaries) {
        const merged = summaries2.find((s) => s.url === summary.url);
        if (merged) {
            mergedSummaries.push({
                ...summary,
                summaryFilePath: merged.summaryFilePath,
            });
        } else {
            mergedSummaries.push(summary);
        }
    }
    console.log(mergedSummaries);

    try {
        fs.unlinkSync(`${WORK_DIR}/output.md`);
    } catch (e) {}

    const postWriterResult = await askLLM(
        `
あなたはプログラマとしてごく短い記事をQiita用に作成します。
以下の情報を元にして記事をマークダウン形式で ${WORK_DIR}/output.md に出力してください。

# 制約事項

- 3つの章に分ける
- 1つの章は1500文字以内（コードを除く）
- 1つの章が500文字以上（コードを除く）になるときは2, 3の節に分ける
- 主要な情報のみ
- 「その他の〇〇」や「関連する〇〇」や「まとめ」は削除
- ユーモアは無し
- マニュアルさを無くして平易な表現にする

# 文体の例

- Google Oneの挙動も気になりますね（有料版だとGoogle Driveにフルバックアップがされます）。
- そこで本体に保存。これであとから見返すこともできます。

# Markdown形式
@qiita-markdown-hint.md に記載されている構文を使ってください。
特に以下を使うことで文章が視覚的に単調になるのを防いでください。
- 
- \`Note\` 
- \`Blockquotes\`
- \`リンクカード\`

# 構成

${postStructureResult}

これに加えて、末尾に参考サイトのURLを添付すること。

# 調査内容

${mergedSummaries.map((s) => `@${s.summaryFilePath} (${s.url})`).join("\n")}
`,
        true
    );

    console.log(postWriterResult);

    if (!fs.existsSync(`${WORK_DIR}/output.md`)) {
        console.log("output.md が見つかりません");
        return;
    }

    try {
        fs.unlinkSync(`${WORK_DIR}/title.txt`);
    } catch (e) {}
    try {
        fs.unlinkSync(`${WORK_DIR}/body.txt`);
    } catch (e) {}
    try {
        fs.unlinkSync(`${WORK_DIR}/tags.txt`);
    } catch (e) {}

    const qiitaResult = await askLLM(`
@output.md を元にQiitaに投稿するのに必要な情報を以下のファイルに出力してください。
- ${WORK_DIR}/title.txt 記事のタイトル（例：【〇〇向け】〇〇〇〇〇【〇〇編】）
- ${WORK_DIR}/body.txt 記事の本文（マークダウン形式。タイトル行は含めない）
- ${WORK_DIR}/tags.txt 記事のタグ（スペース禁止。カンマ区切り） 例：AndroidStudio,Android
`);

    console.log(qiitaResult);

    if (!fs.existsSync(`${WORK_DIR}/title.txt`)) {
        console.log("title.txt が見つかりません");
        return;
    }

    if (!fs.existsSync(`${WORK_DIR}/body.txt`)) {
        console.log("body.txt が見つかりません");
        return;
    }

    if (!fs.existsSync(`${WORK_DIR}/tags.txt`)) {
        console.log("tags.txt が見つかりません");
        return;
    }

    const title = fs.readFileSync(`${WORK_DIR}/title.txt`, "utf-8");
    const body = fs.readFileSync(`${WORK_DIR}/body.txt`, "utf-8");
    const tags = fs.readFileSync(`${WORK_DIR}/tags.txt`, "utf-8");

    await postToQiita(
        title,
        body,
        tags
            .split(",")
            // 関係ないのにqiitaってタグつけがち
            .filter((t) => t.toLowerCase() !== "qiita")
            .slice(0, 5)
            .map((t) => ({ name: t.replaceAll(" ", ""), versions: [] })),
        QIITA_ACCESS_TOKEN
    );

    console.log("done");
})();
