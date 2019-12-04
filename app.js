import ssh2 from 'ssh2';
import fs from 'fs';

const { Client } = ssh2;
const conn = new Client();

// https://github.com/mscdex/ssh2

const privateKey = fs.readFileSync('/Users/jianglei/.ssh/id_rsa');

conn
  .on('ready', function ready() {
    console.log('Client ready');
    conn.exec('uptime', function(err, stream) {
      if (err) throw err;
      stream
        .on('close', function(code, signal) {
          console.log(`Stream :: close :: code: ${code}, signal: ${signal}`);
          conn.end();
        })
        .on('data', function(data) {
          console.log(`STDOUT: ${data}`);
        })
        .stderr.on('data', function(data) {
          console.log(`STDERR: ${data}`);
        });
    });
  })
  .connect({
    host: '118.24.155.105',
    port: 22,
    username: 'root',
    privateKey,
  });
