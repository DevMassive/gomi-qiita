import { spawn } from "child_process";

export function spawnAsync(
    command: string,
    args: string[] = [],
    options?: {
        input?: string;
        timeout?: number;
        spawnOptions?: {};
    }
): Promise<{ code: number | null; stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, { shell: true, ...options.spawnOptions });

        let stdout = "";
        let stderr = "";

        const timeout = options.timeout
            ? setTimeout(() => {
                  if (!child.killed) {
                      child.kill("SIGINT");
                  }
              }, options.timeout)
            : null;

        child.stdout.on("data", (data) => {
            stdout += data.toString();
        });

        child.stderr.on("data", (data) => {
            stderr += data.toString();
        });

        child.on("close", (code) => {
            timeout && clearTimeout(timeout);
            if (code === 0) {
                resolve({ code, stdout, stderr });
            } else {
                reject(new Error(`Command failed with exit code ${code}\n${stderr}`));
            }
        });

        child.on("error", (err) => {
            timeout && clearTimeout(timeout);
            reject(err);
        });

        if (options.input) {
            child.stdin.write(options.input);
        }
        child.stdin.end();
    });
}
