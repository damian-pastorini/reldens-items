/**
 *
 * Reldens - Items System Test Runner
 *
 */

const { sc } = require('@reldens/utils');
const { run } = require('node:test');
const { spec } = require('node:test/reporters');
const fs = require('fs');
const path = require('path');

async function runTests()
{
    process.stderr.write('='.repeat(60)+'\n');
    process.stderr.write('@RELDENS/ITEMS-SYSTEM - UNIT TESTS\n');
    process.stderr.write('='.repeat(60)+'\n');
    process.stderr.write('Test execution started: '+sc.formatDate(new Date())+'\n\n');
    let filter = null;
    let breakOnError = false;
    for(let arg of process.argv){
        if(arg.startsWith('--filter=')){
            filter = arg.split('=')[1];
            process.stderr.write('Filter applied: '+filter+'\n');
        }
        if(arg === '--break-on-error'){
            breakOnError = true;
            process.stderr.write('Break on error enabled\n');
        }
    }
    let testFiles = await getTestFiles(path.join(__dirname, 'unit'));
    if(filter){
        testFiles = testFiles.filter(file => file.includes(filter));
    }
    if(0 === testFiles.length){
        let filterMsg = filter ? ' matching filter: '+filter : '';
        process.stderr.write('No test files found'+filterMsg+'\n');
        process.exit(1);
    }
    process.stderr.write('Found '+testFiles.length+' test file(s)\n\n');
    let testStream = run({
        files: testFiles,
        concurrency: true
    });
    testStream.compose(spec).pipe(process.stdout);
    testStream.on('test:fail', () => {
        process.exitCode = 1;
    });
}

async function getTestFiles(directory)
{
    let files = [];
    if(!fs.existsSync(directory)){
        return files;
    }
    let items = fs.readdirSync(directory);
    for(let item of items){
        let fullPath = path.join(directory, item);
        let stat = fs.statSync(fullPath);
        if(stat.isDirectory()){
            let subFiles = await getTestFiles(fullPath);
            files = files.concat(subFiles);
            continue;
        }
        if(item.startsWith('test-') && item.endsWith('.js')){
            files.push(fullPath);
        }
    }
    return files;
}

process.on('unhandledRejection', (reason, promise) => {
    process.stderr.write('Unhandled Rejection at: '+promise+' reason: '+reason+'\n');
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    process.stderr.write('Uncaught Exception: '+error.message+'\n');
    process.stderr.write(error.stack+'\n');
    process.exit(1);
});

runTests().catch(error => {
    process.stderr.write('Test runner error: '+error.message+'\n');
    process.stderr.write(error.stack+'\n');
    process.exit(1);
});
