const fs = require('fs');
const path = require('path');
const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');

class WorldConverter {
  constructor(input, output) {
    this.input = input;
    this.output = output;
  }

  async convert() {
    const ora = (await import('ora')).default;
    const spinner = ora('Converting worlds...').start();

    try {
      fs.mkdirSync(this.output, { recursive: true });

      for (const dir of this.input) {
        const dirName = path.basename(dir);
        let targetDir;

        switch (dirName) {
          case 'world':
            targetDir = this.output;
            break;
          case 'world_nether':
            targetDir = path.join(this.output, 'DIM-1');
            break;
          case 'world_end':
            targetDir = path.join(this.output, 'DIM1');
            break;
          default:
            throw new Error(`Invalid world directory: ${dirName}`);
        }

        fs.mkdirSync(targetDir, { recursive: true });
        fs.readdirSync(dir).forEach((file) => {
          fs.copyFileSync(path.join(dir, file), path.join(targetDir, file));
        });
      }

      spinner.succeed('Worlds successfully converted.');
    } catch (error) {
      spinner.fail(`Conversion failed: ${error.message}`);
    }
  }
}

const argv = yargs(hideBin(process.argv))
  .scriptName('worldconverter')
  .usage('Usage: $0 -i [world world_nether world_end] -o [output]')
  .option('i', {
    alias: 'input',
    describe: 'Paths to world, world_nether, and world_end',
    type: 'array',
    demandOption: true,
  })
  .option('o', {
    alias: 'output',
    describe: 'Path to output the converted singleplayer world',
    type: 'string',
    default: './converted-world',
  })
  .option('h', {
    alias: 'help',
    type: 'boolean',
    description: 'Show help',
  })
  .option('v', {
    alias: 'version',
    type: 'boolean',
    description: 'Show version',
  })
  .check((argv) => {
    if (argv.input.length !== 3) {
      throw new Error('Please provide paths to world, world_nether, and world_end');
    }
    return true;
  })
  .parse();

const converter = new WorldConverter(argv.input, argv.output);
converter.convert();