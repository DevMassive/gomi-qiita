import axios from "axios";

export const postToQiita = async (
    title: string,
    body: string,
    tags: { name: string; versions: string[] }[],
    accessToken: string
) => {
    await axios("https://qiita.com/api/v2/items", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        data: {
            body,
            coediting: false,
            // AIが生成した内容で正しいかどうかを検証していないものは投稿してはいけません
            private: true,
            tags,
            title,
            tweet: false,
            slide: false,
        },
    });
};
