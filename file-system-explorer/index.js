const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

// Create readline interface for terminal input/output
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Starting directory (current working directory)
let currentDir = process.cwd();

// Utility function to ask a question and get input
function askQuestion(query) {
    return new Promise((resolve) => rl.question(query, resolve));
}

// Display available commands
function showHelp() {
    console.log(`
File System Explorer Commands:
  ls/dir          - List contents of current directory
  cd <dir>        - Change to specified directory
  pwd             - Show current directory path
  mkdir <name>    - Create a new directory
  rmdir <name>    - Remove a directory
  touch <name>    - Create a new empty file
  rm <name>       - Delete a file
  read <name>     - Read file contents
  write <name>    - Write text to a file
  append <name>   - Append text to a file
  rename <old> <new> - Rename a file or directory
  stats <name>    - Show file/directory stats
  help            - Show this help menu
  exit            - Exit the explorer
    `);
}

// Main explorer function
async function fileSystemExplorer() {
    console.log('Welcome to File System Explorer! Type "help" for commands.');
    while (true) {
        const input = await askQuestion(`${path.basename(currentDir)} > `);
        const [command, ...args] = input.trim().split(' ');

        try {
            switch (command.toLowerCase()) {
                case 'ls':
                case 'dir':
                    const files = await fs.readdir(currentDir);
                    console.log('Directory contents:', files);
                    break;

                case 'cd':
                    if (!args[0]) {
                        console.log('Please specify a directory.');
                        break;
                    }
                    const newDir = path.resolve(currentDir, args[0]);
                    await fs.access(newDir, fs.constants.F_OK);
                    currentDir = newDir;
                    console.log(`Changed to: ${currentDir}`);
                    break;

                case 'pwd':
                    console.log(currentDir);
                    break;

                case 'mkdir':
                    if (!args[0]) {
                        console.log('Please specify a directory name.');
                        break;
                    }
                    const dirPath = path.join(currentDir, args[0]);
                    await fs.mkdir(dirPath, { recursive: true });
                    console.log(`Created directory: ${dirPath}`);
                    break;

                case 'rmdir':
                    if (!args[0]) {
                        console.log('Please specify a directory name.');
                        break;
                    }
                    const dirToRemove = path.join(currentDir, args[0]);
                    await fs.rmdir(dirToRemove, { recursive: true });
                    console.log(`Removed directory: ${dirToRemove}`);
                    break;

                case 'touch':
                    if (!args[0]) {
                        console.log('Please specify a file name.');
                        break;
                    }
                    const filePath = path.join(currentDir, args[0]);
                    await fs.writeFile(filePath, '');
                    console.log(`Created file: ${filePath}`);
                    break;

                case 'rm':
                    if (!args[0]) {
                        console.log('Please specify a file name.');
                        break;
                    }
                    const fileToRemove = path.join(currentDir, args[0]);
                    await fs.unlink(fileToRemove);
                    console.log(`Deleted file: ${fileToRemove}`);
                    break;

                case 'read':
                    if (!args[0]) {
                        console.log('Please specify a file name.');
                        break;
                    }
                    const fileToRead = path.join(currentDir, args[0]);
                    const content = await fs.readFile(fileToRead, 'utf8');
                    console.log(`Content of ${args[0]}:\n${content}`);
                    break;

                case 'write':
                    if (!args[0]) {
                        console.log('Please specify a file name.');
                        break;
                    }
                    const fileToWrite = path.join(currentDir, args[0]);
                    const textToWrite = await askQuestion('Enter text to write: ');
                    await fs.writeFile(fileToWrite, textToWrite);
                    console.log(`Wrote to file: ${fileToWrite}`);
                    break;

                case 'append':
                    if (!args[0]) {
                        console.log('Please specify a file name.');
                        break;
                    }
                    const fileToAppend = path.join(currentDir, args[0]);
                    const textToAppend = await askQuestion('Enter text to append: ');
                    await fs.appendFile(fileToAppend, textToAppend + '\n');
                    console.log(`Appended to file: ${fileToAppend}`);
                    break;

                case 'rename':
                    if (args.length < 2) {
                        console.log('Please specify old and new names.');
                        break;
                    }
                    const oldPath = path.join(currentDir, args[0]);
                    const newPath = path.join(currentDir, args[1]);
                    await fs.rename(oldPath, newPath);
                    console.log(`Renamed ${args[0]} to ${args[1]}`);
                    break;

                case 'stats':
                    if (!args[0]) {
                        console.log('Please specify a file or directory name.');
                        break;
                    }
                    const statsPath = path.join(currentDir, args[0]);
                    const stats = await fs.stat(statsPath);
                    console.log('Stats:', {
                        isFile: stats.isFile(),
                        isDirectory: stats.isDirectory(),
                        size: stats.size + ' bytes',
                        modified: stats.mtime
                    });
                    break;

                case 'help':
                    showHelp();
                    break;

                case 'exit':
                    console.log('Goodbye!');
                    rl.close();
                    return;

                default:
                    console.log('Unknown command. Type "help" for options.');
            }
        } catch (err) {
            console.error('Error:', err.message);
        }
    }
}

// Start the explorer
fileSystemExplorer();