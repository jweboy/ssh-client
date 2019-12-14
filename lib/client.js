// @ts-nocheck
const Client = require('ssh2-sftp-client');
const fs = require('fs');
const path = require('path');

const sftp = new Client();
const fsPromises = fs.promises;

/**
 * @description 循环遍历目录中的文件和子目录，如果是文件的话就直接上传到远程服务器，如果是目录的话检查目录是否存在，如果不存在就新建一个目录，然后依次往下执行遍历，上传目录中的子文件，直到遍历到目录末尾。
 *
 * @param {string} localPath 本地目录路径
 * @param {string} remotePath 远程服务器目录路径
 */
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

/**
 * @description 检查需要部署的目录是否在远程服务器中，如不存在就新建一个空目录
 *
 * @param {string} localPath 本地目录路径
 * @param {string} remotePath 远程服务器目录路径
 */
async function checkRemoteDir(localPath, remotePath) {
  const isDirExist = await sftp.exists(remotePath);

  if (!isDirExist) {
    // 创建目录
    await sftp.mkdir(remotePath);
    console.log(`${remotePath} 目录创建成功`);
  }
}

/**
 * @description 上传静态资源
 *
 * @param {string} localPath 需要上传的文件目录
 * @param {Object} config 通过 ssh 连接服务器的配置项
 * @param {string} config.host 服务器的主机名
 * @param {string} config.username 登录服务器的用户名
 * @param {string} config.baseDir 需要部署的远程服务器目录
 * @param {buffer} config.privateKey ssh 连接的私钥 (~/.ssh/id_rsa)
 */
async function sshClient(localPath, config) {
  const paths = localPath.split(path.sep);
  const projectName = paths[paths.length - 1];
  const remotePath = path.join('/', config.username, config.baseDir, projectName);

  try {
    // 连接服务器
    await sftp.connect(config);
    // 检查远程服务器对应目录是否存在
    await checkRemoteDir(localPath, remotePath);
    // 遍历子目录或子文件并上传
    await getEntries(localPath, remotePath);
  } catch (err) {
    console.log(`Ssh error: ${err.message}`);
    throw err;
  } finally {
    await sftp.end();
  }
}

process.on('unhandledRejection', function(err) {
  throw err;
});

module.exports = sshClient;
