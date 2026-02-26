import { describe, it, expect, vi, beforeEach } from "vitest";
import { EventEmitter } from "events";
import { UpdownProcess } from "../src/updown-process";

function makeMockProcess(url: string) {
  const proc = new EventEmitter() as EventEmitter & {
    stdout: EventEmitter;
    stderr: EventEmitter;
    kill: ReturnType<typeof vi.fn>;
  };
  proc.stdout = new EventEmitter();
  proc.stderr = new EventEmitter();
  proc.kill = vi.fn();

  // Emit URL on next tick, simulating the process printing to stdout
  setTimeout(() => {
    proc.stdout.emit("data", Buffer.from(`updown listening on ${url}\n`));
  }, 0);

  return proc;
}

describe("UpdownProcess", () => {
  let mockProc: ReturnType<typeof makeMockProcess>;
  let spawnFn: ReturnType<typeof vi.fn>;
  let fetchFn: ReturnType<typeof vi.fn>;
  let openBrowserFn: ReturnType<typeof vi.fn>;
  let updown: UpdownProcess;

  beforeEach(() => {
    mockProc = makeMockProcess("http://localhost:54321");
    spawnFn = vi.fn().mockReturnValue(mockProc);
    fetchFn = vi.fn().mockResolvedValue({ ok: true });
    openBrowserFn = vi.fn();
    updown = new UpdownProcess(spawnFn as never, fetchFn, openBrowserFn);
  });

  it("spawns updown with the correct executable and file path", async () => {
    await updown.start("/vault/slides.md", { updownPath: "/usr/local/bin/updown" });
    expect(spawnFn).toHaveBeenCalledWith(
      "/usr/local/bin/updown",
      ["/vault/slides.md"],
      expect.any(Object),
    );
  });

  it("spawns with PORT=0", async () => {
    await updown.start("/vault/slides.md", { updownPath: "/usr/local/bin/updown" });
    const opts = spawnFn.mock.calls[0][2];
    expect(opts.env).toMatchObject({ PORT: "0" });
  });

  it("passes --plantuml-jar arg when configured", async () => {
    await updown.start("/vault/slides.md", {
      updownPath: "/usr/local/bin/updown",
      plantumlJarPath: "/opt/plantuml.jar",
    });
    const args = spawnFn.mock.calls[0][1];
    expect(args).toContain("--plantuml-jar");
    expect(args).toContain("/opt/plantuml.jar");
  });

  it("does not pass --plantuml-jar when not configured", async () => {
    await updown.start("/vault/slides.md", { updownPath: "/usr/local/bin/updown" });
    const args = spawnFn.mock.calls[0][1];
    expect(args).not.toContain("--plantuml-jar");
  });

  it("polls the health endpoint after finding the URL", async () => {
    await updown.start("/vault/slides.md", { updownPath: "/usr/local/bin/updown" });
    expect(fetchFn).toHaveBeenCalledWith("http://localhost:54321/health");
  });

  it("opens browser with the server URL", async () => {
    await updown.start("/vault/slides.md", { updownPath: "/usr/local/bin/updown" });
    expect(openBrowserFn).toHaveBeenCalledWith("http://localhost:54321");
  });

  it("exposes serverUrl after start", async () => {
    await updown.start("/vault/slides.md", { updownPath: "/usr/local/bin/updown" });
    expect(updown.serverUrl).toBe("http://localhost:54321");
  });

  it("isRunning is false before start", () => {
    expect(updown.isRunning).toBe(false);
  });

  it("isRunning is true after start and false after stop", async () => {
    await updown.start("/vault/slides.md", { updownPath: "/usr/local/bin/updown" });
    expect(updown.isRunning).toBe(true);
    await updown.stop();
    expect(updown.isRunning).toBe(false);
  });

  it("calls POST /stop endpoint on graceful stop", async () => {
    await updown.start("/vault/slides.md", { updownPath: "/usr/local/bin/updown" });
    await updown.stop();
    expect(fetchFn).toHaveBeenCalledWith("http://localhost:54321/stop", { method: "POST" });
    expect(mockProc.kill).not.toHaveBeenCalled();
  });

  it("falls back to kill if /stop endpoint throws", async () => {
    await updown.start("/vault/slides.md", { updownPath: "/usr/local/bin/updown" });
    fetchFn.mockRejectedValueOnce(new Error("connection refused"));
    await updown.stop();
    expect(mockProc.kill).toHaveBeenCalled();
  });

  it("clears serverUrl after stop", async () => {
    await updown.start("/vault/slides.md", { updownPath: "/usr/local/bin/updown" });
    await updown.stop();
    expect(updown.serverUrl).toBeNull();
  });

  it("reload stops the old process and starts a new one", async () => {
    await updown.start("/vault/old.md", { updownPath: "/usr/local/bin/updown" });

    const newProc = makeMockProcess("http://localhost:54322");
    spawnFn.mockReturnValue(newProc);

    await updown.reload("/vault/new.md", { updownPath: "/usr/local/bin/updown" });

    expect(fetchFn).toHaveBeenCalledWith("http://localhost:54321/stop", { method: "POST" });
    expect(spawnFn).toHaveBeenLastCalledWith(
      "/usr/local/bin/updown",
      ["/vault/new.md"],
      expect.any(Object),
    );
    expect(updown.serverUrl).toBe("http://localhost:54322");
  });

  it("rejects if process exits before emitting URL", async () => {
    const failProc = new EventEmitter() as EventEmitter & {
      stdout: EventEmitter;
      kill: ReturnType<typeof vi.fn>;
    };
    failProc.stdout = new EventEmitter();
    failProc.kill = vi.fn();
    setTimeout(() => failProc.emit("exit", 1), 0);
    spawnFn.mockReturnValue(failProc);

    await expect(
      updown.start("/vault/slides.md", { updownPath: "/usr/local/bin/updown" }),
    ).rejects.toThrow("exited");
  });
});
