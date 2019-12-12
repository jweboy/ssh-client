const Client = require('ssh2-sftp-client');
const fs = require('fs');
const path = require('path');

const sftp = new Client();
const fsPromises = fs.promises;

async function getEntries(localPath, remotePath) {
  const entries = await fsPromises.readdir(localPath);

/* eslint-disable */
  for (const entry of entries) {
    const entryPath = path.resolve(localPath, entry);
    const stat = await fsPromises.stat(entryPath);

    if (stat.isFile()) {
      await sftp.fastPut(entryPath, `${remotePath}/${entry}`);
      console.log(`${entryPath} 上传成功～`);
    }


    if (stat.isDirectory()) {
      await checkRemoteDir(entryPath, `${remotePath}/${entry}`);
    }
  }
}

async function checkRemoteDir(localPath, remotePath) {
  const isDirExist = await sftp.exists(remotePath);
  if (isDirExist) {
    // 遍历子目录或子文件并上传
    await getEntries(localPath, remotePath);
  } else {
    // 创建目录
    await sftp.mkdir(remotePath);
    console.log(`${remotePath} 目录创建成功`);
    // 遍历子目录或子文件并上传
    await getEntries(localPath, remotePath);
  }
}

async function sshClient(localPath, config) {
  const paths = localPath.split(path.sep);
  const projectName = paths[paths.length - 1];
  const remotePath = path.join('/', config.username, config.baseDir, projectName);

  try {
    await sftp.connect(config);
    await checkRemoteDir(localPath, remotePath);
  } catch (err) {
    console.log(`Ssh error: ${err.message}`);
    throw err;
  } finally {
    await sftp.end();
  }
}

module.exports = sshClient;

process.on('unhandledRejection', function(err) {
  throw err;
});
