import { BaseConfig } from '../src';
import { TestApp } from './DemoApp';

class Config extends BaseConfig {
  HTTPS_KEY = `${__dirname}/ah-server_key.txt`;
  HTTPS_CERT = `${__dirname}/ah-server_ssl.crt`;
}

const config = new Config();
const app = new TestApp(config);

app
  .start()
  .then(() => {
    console.log('close in 5s');
    setTimeout(() => app.stop(), 5000);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
