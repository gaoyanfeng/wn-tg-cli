#!/usr/bin/env node
const fs = require('fs');
const program = require('commander');
const download = require('download-git-repo');
const handlebars = require('handlebars');
const inquirer = require('inquirer');
const ora = require('ora');
const chalk = require('chalk');
const symbols = require('log-symbols');

let projectName = 'wn-bms-front'
// 自定义交互式命令行的问题及简单的校验
let question = [
    {
        name: "name",
        type: 'input',
        message: "请输入项目名称",
        default: projectName,
        validate (val) {
            if (fs.existsSync(val)) {
                console.log(symbols.error, chalk.red("项目已存在"));
                return false
            } else {
                return true
            }
        }
    },
    {
        name: "description",
        type: 'input',
        message: "请输入项目描述",
        default: 'this is bms project',
        validate () {
            return true
        }
    },
    {
        name: 'author',
        message: '请输入作者名称'
    }
]
program
    .version('1.0.0', '-v, --version')
    .alias('d')
    .command('init <name>')
    .action (inquirer.prompt(question).then(answers => {
        run(projectName, answers)
    }))
function run(name, answers) {
    if (answers.name === '') {
        answers.name = name
    }
    const spinner = ora('正在下载模板...');
    spinner.start();
    download('direct:https://github.com/gaoyanfeng/wn-bms-front.git#master', answers.name, {clone: true}, (err) => {
        if(err){
            spinner.fail();
            console.log(symbols.error, chalk.red(`拉取远程仓库失败${err}`));
        }else{
            spinner.succeed();
            modifyPackage(answers);
            console.log(symbols.success, chalk.green("项目初始化完成"));
        }
    })
}

function modifyPackage(answers) {
    const file = `${answers.name}/package.json`;
    let meta = {
        name: answers.name,
        description: answers.description,
        author: answers.author
    }
    if(fs.existsSync(file)){
        const content = fs.readFileSync(file).toString();
        // const result = handlebars.compile(content)(meta);
        const contentJson = JSON.parse(content)
        for (let key in meta) {
            contentJson[key] = meta[key]
        }
        fs.writeFileSync(file, JSON.stringify(contentJson, null, 4));
    }
}
// program.parse(process.argv);
