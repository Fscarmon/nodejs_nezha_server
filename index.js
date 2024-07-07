const express = require("express");
const app = express();
const exec = require("child_process").exec;
const os = require("os");

const port = process.env.SERVER_PORT || process.env.PORT || 3000;


console.log(`==============================`);
console.log(``);
console.log("     /stas 查看进程");
console.log("     /listen 查看端口");
console.log("     /start 手动启动脚本");
console.log("     /res 手动恢复dashboard.tar.gz");
console.log("     /backup 手动备份");
console.log(``);
console.log(`==============================`);

app.get("/", function (req, res) {
  res.send("hello world");
});

app.get("/stas", function (req, res) {
  let cmdStr = "ps aux | sed 's@--token.*@--token ${TOK}@g;s@-s data.*@-s ${NEZHA_SERVER}@g'";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.type("html").send("<pre>命令行执行错误：\n" + err + "</pre>");
    } else {
      res.type("html").send("<pre>获取系统进程表：\n" + stdout + "</pre>");
    }
  });
});

app.get("/info", function (req, res) {
  let cmdStr = "cat /etc/os-release";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.send("命令行执行错误：" + err);
    } else {
      res.send(
        "命令行执行结果：\n" +
        "Linux System:" +
        stdout +
        "\nRAM:" +
        os.totalmem() / 1000 / 1000 +
        "MB"
      );
    }
  });
});

app.get("/listen", function (req, res) {
  let cmdStr = "netstat -nltp";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.type("html").send("<pre>命令行执行错误：\n" + err + "</pre>");
    } else {
      res.type("html").send("<pre>获取系统监听端口：\n" + stdout + "</pre>");
    }
  });
});


app.get("/start", (req, res) => {
  const startScript = exec("/dashboard/entrypoint.sh");

  startScript.stdout.on("data", (data) => {
    res.write(data);
  });

  startScript.stderr.on("data", (data) => {
    res.write(`stderr: ${data}`);
  });

  startScript.on("close", (code) => {
    res.write(`Child process exited with code ${code}`);
    res.end();
  });
});

app.get("/res", (req, res) => {
  const resScript = exec("/dashboard/restore.sh dashboard.tar.gz");

  resScript.stdout.on("data", (data) => {
    res.write(data);
  });

  resScript.stderr.on("data", (data) => {
    res.write(`stderr: ${data}`);
  });

  resScript.on("close", (code) => {
    res.write(`Child process exited with code ${code}`);
    res.end();
  });
});

app.get("/backup", (req, res) => {
  const backupScript = exec("/dashboard/backup.sh");

  backupScript.stdout.on("data", (data) => {
    res.write(data);
  });

  backupScript.stderr.on("data", (data) => {
    res.write(`stderr: ${data}`);
  });

  backupScript.on("close", (code) => {
    res.write(`Child process exited with code ${code}`);
    res.end();
  });
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}!\n==============================`);
});
