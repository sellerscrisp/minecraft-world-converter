const fs = require('fs');
const path = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

class WorldConverter {
  constructor(input, output) {
    this.input = input;
    this.output = output;
  }

  async convert() {
    const ora = (await import('ora')).default;
    const spinner = ora(' Converting worlds...').start();

    spinner.color = 'cyan';

    try {
      fs.mkdirSync(this.output, { recursive: true });

      const bukkitYmlPath = path.join(path.dirname(this.input[0]), 'bukkit.yml');
      if (fs.existsSync(bukkitYmlPath)) {
        fs.copyFileSync(bukkitYmlPath, path.join(this.output, 'bukkit.yml'));
      }

      for (const dir of this.input) {
        const dirName = path.basename(dir);
        let targetDir;

        switch (dirName) {
          case 'world':
            targetDir = this.output;
            fs.copyFileSync(path.join(dir, 'level.dat'), path.join(targetDir, 'level.dat'));
            break;
          case 'world_nether':
            targetDir = path.join(this.output, 'DIM-1');
            break;
          case 'world_the_end':
            targetDir = path.join(this.output, 'DIM1');
            break;
          default:
            throw new Error(`Invalid world directory: ${dirName}`);
        }

        this.copyDirectory(dir, targetDir);
      }

      spinner.succeed('Worlds successfully converted.');
    } catch (error) {
      spinner.fail(`Conversion failed: ${error.message}`);
    }
  }

  copyDirectory(src, dest) {
    fs.mkdirSync(dest, { recursive: true });

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

const argv = yargs(hideBin(process.argv))
  .scriptName('worldconverter')
  .usage('Usage: $0 -i [world world_nether world_the_end] -o [output]')
  .option('i', {
    alias: 'input',
    describe: 'Paths to world, world_nether, and world_the_end',
    type: 'array',
    demandOption: true,
  })
  .option('o', {
    alias: 'output',
    describe: 'Path to output the converted singleplayer world',
    type: 'string',
    default: './converted-world',
  })
  .help()
  .version()
  .check((argv) => {
    if (argv.input.length !== 3) {
      throw new Error('Please provide paths to world, world_nether, and world_the_end');
    }
    return true;
  })
  .parse();

const converter = new WorldConverter(argv.input, argv.output);
converter.convert();