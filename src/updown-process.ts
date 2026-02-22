import { spawn as nodeSpawn } from "child_process";
import type { ChildProcess, SpawnOptions } from "child_process";

const HEALTH_POLL_INTERVAL = 300;
const HEALTH_TIMEOUT = 10000;

export type UpdownProcessOptions = {
  updownPath: string;
  plantumlJarPath?: string;
};

type SpawnFn = (cmd: string, args: string[], opts: SpawnOptions) => ChildProcess;
type FetchFn = (url: string) => Promise<{ ok: boolean }>;
type OpenBrowserFn = (url: string) => void;

function defaultOpenBrowser(url: string): void {
  // electron is provided by the Obsidian/Electron runtime — not a build dependency
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
  const { shell } = require("electron") as any;
  shell.openExternal(url);
}

export class UpdownProcess {
  private proc: ChildProcess | null = null;
  private url: string | null = null;

  constructor(
    private spawnFn: SpawnFn = nodeSpawn,
    private fetchFn: FetchFn = (url) => fetch(url),
    private openBrowserFn: OpenBrowserFn = defaultOpenBrowser,
  ) {}

  get isRunning(): boolean {
    return this.proc !== null;
  }

  get serverUrl(): string | null {
    return this.url;
  }

  async start(filePath: string, options: UpdownProcessOptions): Promise<void> {
    if (this.proc) {
      await this.stop();
    }

    const env: Record<string, string> = {
      ...(process.env as Record<string, string>),
      PORT: "0",
    };

    if (options.plantumlJarPath) {
      env["PLANTUML_JAR"] = options.plantumlJarPath;
    }

    const proc = this.spawnFn(options.updownPath, [filePath], {
      env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    this.proc = proc;

    const url = await this.waitForUrl(proc);
    this.url = url;

    await this.waitForHealth(url);

    this.openBrowserFn(url);
  }

  async stop(): Promise<void> {
    if (this.proc) {
      this.proc.kill();
      this.proc = null;
      this.url = null;
    }
  }

  async reload(filePath: string, options: UpdownProcessOptions): Promise<void> {
    await this.stop();
    await this.start(filePath, options);
  }

  private waitForUrl(proc: ChildProcess): Promise<string> {
    return new Promise((resolve, reject) => {
      let output = "";
      let settled = false;

      proc.stdout?.on("data", (chunk: Buffer) => {
        output += chunk.toString();
        const match = output.match(/http:\/\/\S+/);
        if (match && !settled) {
          settled = true;
          resolve(match[0]!.replace(/\/$/, ""));
        }
      });

      proc.on("error", (err) => {
        if (!settled) {
          settled = true;
          reject(err);
        }
      });

      proc.on("exit", (code) => {
        if (!settled) {
          settled = true;
          reject(new Error(`updown exited (code ${code}) before emitting server URL`));
        }
      });
    });
  }

  private async waitForHealth(baseUrl: string): Promise<void> {
    const deadline = Date.now() + HEALTH_TIMEOUT;
    while (Date.now() < deadline) {
      try {
        const res = await this.fetchFn(`${baseUrl}/health`);
        if (res.ok) return;
      } catch {
        // not ready yet
      }
      await sleep(HEALTH_POLL_INTERVAL);
    }
    throw new Error(`updown did not respond to health check within ${HEALTH_TIMEOUT}ms`);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
