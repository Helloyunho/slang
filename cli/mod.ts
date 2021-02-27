import { Command } from './deps.ts'

await new Command()
  .name('slang')
  .version('0.0.0')
  .description(
    "Simple and fast 'cross-language' general purpose programming language"
  )
  .command(
    'init [name:string]',
    new Command()
      .option('-g, --git', 'Initialize a Git Repository')
      .description('Create/Initialize a slang project')
      .action((_, name) => {})
  )
  .help('Use with --help flag for more info.')
  .parse(Deno.args)
