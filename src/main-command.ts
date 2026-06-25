import { NestFactory } from '@nestjs/core';
import { CommandModule } from '@modules/command/command.module';
import { CreatePostsCommand } from '@modules/command/create-posts.command';
import { SeedUsersCommand } from '@modules/command/seed-users.command';

/**
 * Parse all --key=value flags from argv into a plain object.
 * Example: ['--command=seed-posts', '--count=50'] → { command: 'seed-posts', count: '50' }
 */
function parseArgs(argv: string[]): Record<string, string> {
  return argv.reduce(
    (acc, arg) => {
      const match = arg.match(/^--([^=]+)=(.+)$/);
      if (match) acc[match[1]] = match[2];
      return acc;
    },
    {} as Record<string, string>,
  );
}

/**
 * Require a param by key; exit with a usage message if missing or not a positive integer.
 */
function requireIntParam(
  params: Record<string, string>,
  key: string,
  commandName: string,
): number {
  const raw = params[key];
  const value = parseInt(raw, 10);
  if (!raw || isNaN(value) || value <= 0) {
    console.error(
      `Missing or invalid --${key}. Usage: npm run command -- --command=${commandName} --${key}=<positive number>`,
    );
    process.exit(1);
  }
  return value;
}

async function bootstrap() {
  // npm run command -- --command=seed-users --count=50
  // npm run command -- --command=seed-posts --count=500
  const params = parseArgs(process.argv.slice(2));
  const commandName = params['command'];

  if (!commandName) {
    console.error(
      'Missing --command flag.\n' +
        'Available commands:\n' +
        '  seed-posts  --count=<number>\n' +
        '  seed-users  --count=<number>',
    );
    process.exit(1);
  }

  // Bootstrap a lightweight NestJS context (no HTTP server)
  const app = await NestFactory.createApplicationContext(CommandModule, {
    logger: ['log', 'error', 'warn'],
  });

  switch (commandName) {
    case 'seed-posts': {
      const count = requireIntParam(params, 'count', commandName);
      await app.get(CreatePostsCommand).run(count);
      break;
    }

    case 'seed-users': {
      const count = requireIntParam(params, 'count', commandName);
      await app.get(SeedUsersCommand).run(count);
      break;
    }

    default:
      console.error(`Unknown command: "${commandName}"`);
      process.exit(1);
  }

  await app.close();
  process.exit(0);
}
bootstrap();
