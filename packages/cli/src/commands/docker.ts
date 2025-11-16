import { spawn } from 'child_process';
import { CLIOptions, Inquirerer } from 'inquirerer';

import { cliExitWithError,extractFirst } from '../utils';

const dockerUsageText = `
Docker Command:

  pgpm docker <subcommand> [OPTIONS]

  Manage PostgreSQL Docker containers for local development.

Subcommands:
  start              Start PostgreSQL container
  stop               Stop PostgreSQL container

Options:
  --help, -h         Show this help message
  --name <name>      Container name (default: postgres)
  --image <image>    Docker image (default: pyramation/pgvector:13.3-alpine)
  --port <port>      Host port mapping (default: 5432)
  --user <user>      PostgreSQL user (default: postgres)
  --password <pass>  PostgreSQL password (default: password)
  --recreate         Remove and recreate container on start

Examples:
  pgpm docker start                           Start default PostgreSQL container
  pgpm docker start --port 5433               Start on custom port
  pgpm docker start --recreate                Remove and recreate container
  pgpm docker stop                            Stop PostgreSQL container
`;

interface DockerRunOptions {
  name: string;
  image: string;
  port: number;
  user: string;
  password: string;
  recreate?: boolean;
}

interface SpawnResult {
  code: number;
  stdout: string;
  stderr: string;
}

function run(command: string, args: string[], options: { stdio?: 'inherit' | 'pipe' } = {}): Promise<SpawnResult> {
  return new Promise((resolve, reject) => {
    const stdio = options.stdio || 'pipe';
    const child = spawn(command, args, { stdio });

    let stdout = '';
    let stderr = '';

    if (stdio === 'pipe') {
      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });
    }

    child.on('error', (error) => {
      reject(error);
    });

    child.on('close', (code) => {
      resolve({
        code: code ?? 0,
        stdout: stdout.trim(),
        stderr: stderr.trim()
      });
    });
  });
}

async function checkDockerAvailable(): Promise<boolean> {
  try {
    const result = await run('docker', ['--version']);
    return result.code === 0;
  } catch (error) {
    return false;
  }
}

async function isContainerRunning(name: string): Promise<boolean | null> {
  try {
    const result = await run('docker', ['inspect', '-f', '{{.State.Running}}', name]);
    if (result.code === 0) {
      return result.stdout.trim() === 'true';
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function containerExists(name: string): Promise<boolean> {
  try {
    const result = await run('docker', ['inspect', name]);
    return result.code === 0;
  } catch (error) {
    return false;
  }
}

async function startContainer(options: DockerRunOptions): Promise<void> {
  const { name, image, port, user, password, recreate } = options;

  const dockerAvailable = await checkDockerAvailable();
  if (!dockerAvailable) {
    await cliExitWithError('Docker is not installed or not available in PATH. Please install Docker first.');
    return;
  }

  const exists = await containerExists(name);
  const running = await isContainerRunning(name);

  if (running === true) {
    console.log(`✅ Container "${name}" is already running`);
    return;
  }

  if (recreate && exists) {
    console.log(`🗑️  Removing existing container "${name}"...`);
    const removeResult = await run('docker', ['rm', '-f', name], { stdio: 'inherit' });
    if (removeResult.code !== 0) {
      await cliExitWithError(`Failed to remove container "${name}"`);
      return;
    }
  }

  if (exists && running === false) {
    console.log(`🔄 Starting existing container "${name}"...`);
    const startResult = await run('docker', ['start', name], { stdio: 'inherit' });
    if (startResult.code === 0) {
      console.log(`✅ Container "${name}" started successfully`);
    } else {
      await cliExitWithError(`Failed to start container "${name}"`);
    }
    return;
  }

  console.log(`🚀 Creating and starting new container "${name}"...`);
  const runArgs = [
    'run',
    '-d',
    '--name', name,
    '-e', `POSTGRES_USER=${user}`,
    '-e', `POSTGRES_PASSWORD=${password}`,
    '-p', `${port}:5432`,
    image
  ];

  const runResult = await run('docker', runArgs, { stdio: 'inherit' });
  if (runResult.code === 0) {
    console.log(`✅ Container "${name}" created and started successfully`);
    console.log(`📌 PostgreSQL is available at localhost:${port}`);
    console.log(`👤 User: ${user}`);
    console.log(`🔑 Password: ${password}`);
  } else {
    await cliExitWithError(`Failed to create container "${name}". Check if port ${port} is already in use.`);
  }
}

async function stopContainer(name: string): Promise<void> {
  const dockerAvailable = await checkDockerAvailable();
  if (!dockerAvailable) {
    await cliExitWithError('Docker is not installed or not available in PATH. Please install Docker first.');
    return;
  }

  const exists = await containerExists(name);
  if (!exists) {
    console.log(`ℹ️  Container "${name}" not found`);
    return;
  }

  const running = await isContainerRunning(name);
  if (running === false) {
    console.log(`ℹ️  Container "${name}" is already stopped`);
    return;
  }

  console.log(`🛑 Stopping container "${name}"...`);
  const stopResult = await run('docker', ['stop', name], { stdio: 'inherit' });
  if (stopResult.code === 0) {
    console.log(`✅ Container "${name}" stopped successfully`);
  } else {
    await cliExitWithError(`Failed to stop container "${name}"`);
  }
}

export default async (
  argv: Partial<Record<string, any>>,
  _prompter: Inquirerer,
  _options: CLIOptions
) => {
  if (argv.help || argv.h) {
    console.log(dockerUsageText);
    process.exit(0);
  }

  const { first: subcommand, newArgv } = extractFirst(argv);
  const args = newArgv as Partial<Record<string, any>>;

  if (!subcommand) {
    console.log(dockerUsageText);
    await cliExitWithError('No subcommand provided. Use "start" or "stop".');
    return;
  }

  const name = (args.name as string) || 'postgres';
  const image = (args.image as string) || 'pyramation/pgvector:13.3-alpine';
  const port = typeof args.port === 'number' ? args.port : 5432;
  const user = (args.user as string) || 'postgres';
  const password = (args.password as string) || 'password';
  const recreate = args.recreate === true;

  switch (subcommand) {
  case 'start':
    await startContainer({ name, image, port, user, password, recreate });
    break;

  case 'stop':
    await stopContainer(name);
    break;

  default:
    console.log(dockerUsageText);
    await cliExitWithError(`Unknown subcommand: ${subcommand}. Use "start" or "stop".`);
  }
};
