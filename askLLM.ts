import { spawnAsync } from "./spawnAsync";

export const askLLM = async (input: string, usePro = false, timeout = 3 * 60 * 1000) => {
    try {
        const { stdout } = await spawnAsync(
            "gemini",
            ["-m", usePro ? "gemini-2.5-pro" : "gemini-2.5-flash", "--yolo"],
            {
                input,
                timeout,
                spawnOptions: { cwd: __dirname },
            }
        );

        return stdout.toString();
    } catch (e) {
        console.log(e);
        return "";
    }
};
