import dotenv from "dotenv";
import fs from "fs";
import { askLLM } from "./askLLM";
import { postToQiita } from "./postToQiita";

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

(async function () {
    const qiitaResult = await askLLM(`
@${WORK_DIR}/output.md を元にQiitaに投稿するのに必要な情報を以下のファイルに出力してください。
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
