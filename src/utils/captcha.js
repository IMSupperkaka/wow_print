/*
 * @Date: 2020-11-25 23:20:23
 * @LastEditors: Shawn
 * @LastEditTime: 2020-11-26 00:14:13
 * @FilePath: \wow_print\src\utils\captcha.js
 * @Description: Descrip Content
 */

function getTimestamp(msec) {
  msec = !msec && msec !== 0 ? msec : 1;
  return parseInt((new Date()).valueOf() / msec, 10);
}

export const loadScript = (url, cb, errcb) => {
  var head = document.head || document.getElementsByTagName('head')[0];
  var script = document.createElement('script');

  cb = cb || function () { };
  errcb = errcb || function () { };

  script.type = 'text/javascript';
  script.src = url;

  if (!('onload' in script)) {
      script.onreadystatechange = function () {
          if (this.readyState !== 'complete' && this.readyState !== 'loaded') return;
          this.onreadystatechange = null;
          cb(script);
      }
  }

  script.onload = function () {
      this.onload = null;
      cb(script);
  }

  script.onerror = function () {
      this.onload = null;
      errcb();
  }

  head.appendChild(script);
}

export const loadNECaptcha = (opt) => {
  const url = 'https://cstaticdun.126.net/load.min.js' + '?t=' + getTimestamp(1 * 60 * 1000);
  const buildInstance = function (initNECaptcha, resolve, reject) {
      if (!document.getElementById('captcha')) {
          let element = document.createElement('div');
          element.id = 'captcha';
          let body = document.body || document.getElementsByTagName('body')[0];
          body.appendChild(element);
      }
      initNECaptcha({
          captchaId: '0cb21f30fc9b487ab31e55c5243fd299',
          mode: 'bind',
          protocol: 'https',
          element: '#captcha',
          width: '5.5rem',
          ...opt
      }, function (instance) {
          // 初始化成功后得到验证实例instance，可以调用实例的方法
          resolve(instance);
      }, function (err) {
          // 初始化失败后触发该函数，err对象描述当前错误信息
          reject(err);
      })
  }
  return new Promise((resolve, reject) => {
      if (window.initNECaptcha) {
          buildInstance(window.initNECaptcha, resolve, reject);
      } else {
          loadScript(url, function () {
              buildInstance(window.initNECaptcha, resolve, reject);
          }, function () {
              reject('验证码模块加载失败')
          })
      }
  })
}
