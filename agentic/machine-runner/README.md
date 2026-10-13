# @constructive-db/machine-runner

The machine runner: the Node daemon a user installs on their own machine for
Remote Control (constructive-planning#1690). It is a **remote control and
nothing else**: it dials **out** to a machine relay over WebSocket — it never
listens on a port — runs the allow-listed commands the relay hands it (in a pty
for a terminal, on pipes otherwise), streams their bytes back as
`@constructive-db/machine-protocol` frames, and stops them when told. When the
relay connection drops, it redials with exponential backoff and re-registers
the machine.

The runner knows nothing about what it runs. It has no notion of agents,
Claude, Codex, runs, approvals or events; it never reads a byte of a
command's output. Everything agentic sits *above* it, as ordinary commands
(`constructive-agent-cli` from `@constructive-db/agent-cli`,
`constructive-agent-host` from `@constructive-db/agent-host`) that the relay
asks it to run and whose stdout the relay interprets. Keep it that way.

## Install

```
npm i -g @constructive-db/machine-runner
```

MIT-licensed and dependency-light on purpose (`node-pty`, `ws`,
`@pgpmjs/logger`): it holds no database connection and no schema knowledge — every
authorization answer comes from the relay it dials.

## Usage

```
machine-runner enroll --relay wss://relay.example.com \
  --machine <machine-uuid> --database <database-uuid>
# the enrollment token is read from stdin or MACHINE_ENROLLMENT_TOKEN, never argv

machine-runner start          # dial the relay and serve sessions
machine-runner status         # what this runner is enrolled in, never secrets
```

`enroll` writes the config `start` reads: `~/.machine-runner/config.json` at
mode 0600, or wherever `--config <path>` / `MACHINE_RUNNER_CONFIG` points. A
bare `machine-runner --config <path>` still boots the daemon, which is how the
deployed unit and the bundle invoke it.

The config carries a **list of enrollments** — one per relay/database this
machine is enrolled in — plus the local policy:

```json
{
  "enrollments": [
    {
      "machineId": "<machine-uuid>",
      "relayUrl": "wss://relay.example.com",
      "token": "<machine token>",
      "database": "db-uuid"
    }
  ],
  "policy": {
    "allowedCommands": ["echo", "ls", "git"],
    "cwd": "/home/me/work",
    "env": {
      "allow": ["PATH", "HOME", "TERM", "LANG"],
      "set": { "CONSTRUCTIVE_SESSION": "1" }
    }
  }
}
```

The policy is decided here, on the machine, and never travels over the wire: a
command not in `allowedCommands` is refused with an error frame, sessions
start in the policy's `cwd`, and the spawned environment contains only the
allow-listed pass-through variables plus the explicit `set` map — the runner's
own environment (tokens included) never reaches a session.

## What a session is

An `open` frame names a command, its arguments, whether it wants a terminal,
and optionally a directory. The runner:

- refuses the command unless it is in `allowedCommands`, and refuses a `cwd`
  that resolves outside the policy's `cwd` (a sibling such as
  `/home/me/work-other` is outside `/home/me/work`);
- spawns it in a pty (`interactive: true`, with `cols`/`rows`) or on pipes,
  in that directory, with the projected environment;
- streams `output` frames (pipe output tagged `stdout`/`stderr`; pty output is
  the terminal's byte stream), writes `input` frames to its stdin, applies
  `resize` and `signal`, and reports `exit` or `error`;
- keeps a detached interactive session alive with a bounded scrollback until
  a client reattaches or the session is closed.

Separately from sessions, the runner answers two read-only path requests,
`path_list` and `path_read`, each naming a relative `path` under an optional
`root` (itself resolved under the policy's `cwd`, as an `open`'s `cwd` is). It:

- refuses an absolute path, a `..` segment or a NUL byte (`PATH_INVALID`), and
  a path — or a symlink anywhere along it — that resolves outside the root
  (`PATH_OUTSIDE_ROOT`);
- answers `path_listing` (name, kind, size; symlinks reported, not followed)
  or `path_content` (base64 bytes);
- refuses a directory of more than `MAX_LIST_ENTRIES` entries
  (`DIRECTORY_TOO_LARGE`) and a file of more than `MAX_READ_BYTES` bytes
  (`FILE_TOO_LARGE`) rather than truncating either;
- answers every failure as an `error` frame carrying the request's
  `requestId` and one of the `PATH_ERROR_CODES`.

It writes nothing. Which root a request may name is the relay's decision, not
the runner's: the runner only guarantees it stays under its policy.

That is the whole contract. An agent session is one of these whose command
happens to be an agent program — the relay composes that command and reads
its output; the runner ran an allow-listed command:

```json
"policy": {
  "allowedCommands": ["bash", "git", "constructive-agent-cli", "constructive-agent-host"],
  "cwd": "/home/me/work",
  "env": { "allow": ["PATH", "HOME"] }
}
```
