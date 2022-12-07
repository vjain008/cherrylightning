/**
 * App version: 1.44.0
 * SDK version: 4.3.3
 * CLI version: 2.8.1
 *
 * Generated: Fri, 28 Oct 2022 03:49:32 GMT
 */

var APP_uk_sky_lightning_InputHandlerWebApp = (function () {
  'use strict';

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  const settings = {};
  const subscribers = {};
  const initSettings = (appSettings, platformSettings) => {
    settings['app'] = appSettings;
    settings['platform'] = platformSettings;
    settings['user'] = {};
  };
  const publish = (key, value) => {
    subscribers[key] && subscribers[key].forEach(subscriber => subscriber(value));
  };
  const dotGrab = function () {
    let obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    let key = arguments.length > 1 ? arguments[1] : undefined;
    if (obj === null) return undefined;
    const keys = key.split('.');
    for (let i = 0; i < keys.length; i++) {
      obj = obj[keys[i]] = obj[keys[i]] !== undefined ? obj[keys[i]] : {};
    }
    return typeof obj === 'object' && obj !== null ? Object.keys(obj).length ? obj : undefined : obj;
  };
  var Settings = {
    get(type, key) {
      let fallback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
      const val = dotGrab(settings[type], key);
      return val !== undefined ? val : fallback;
    },
    has(type, key) {
      return !!this.get(type, key);
    },
    set(key, value) {
      settings['user'][key] = value;
      publish(key, value);
    },
    subscribe(key, callback) {
      subscribers[key] = subscribers[key] || [];
      subscribers[key].push(callback);
    },
    unsubscribe(key, callback) {
      if (callback) {
        const index = subscribers[key] && subscribers[key].findIndex(cb => cb === callback);
        index > -1 && subscribers[key].splice(index, 1);
      } else {
        if (key in subscribers) {
          subscribers[key] = [];
        }
      }
    },
    clearSubscribers() {
      for (const key of Object.getOwnPropertyNames(subscribers)) {
        delete subscribers[key];
      }
    }
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  const prepLog = (type, args) => {
    const colors = {
      Info: 'green',
      Debug: 'gray',
      Warn: 'orange',
      Error: 'red'
    };
    args = Array.from(args);
    return ['%c' + (args.length > 1 && typeof args[0] === 'string' ? args.shift() : type), 'background-color: ' + colors[type] + '; color: white; padding: 2px 4px; border-radius: 2px', args];
  };
  var Log = {
    info() {
      Settings.get('platform', 'log') && console.log.apply(console, prepLog('Info', arguments));
    },
    debug() {
      Settings.get('platform', 'log') && console.debug.apply(console, prepLog('Debug', arguments));
    },
    error() {
      Settings.get('platform', 'log') && console.error.apply(console, prepLog('Error', arguments));
    },
    warn() {
      Settings.get('platform', 'log') && console.warn.apply(console, prepLog('Warn', arguments));
    }
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  let sendMetric = (type, event, params) => {
    Log.info('Sending metric', type, event, params);
  };
  const initMetrics = config => {
    sendMetric = config.sendMetric;
  };

  // available metric per category
  const metrics$1 = {
    app: ['launch', 'loaded', 'ready', 'close'],
    page: ['view', 'leave'],
    user: ['click', 'input'],
    media: ['abort', 'canplay', 'ended', 'pause', 'play',
    // with some videos there occur almost constant suspend events ... should investigate
    // 'suspend',
    'volumechange', 'waiting', 'seeking', 'seeked']
  };

  // error metric function (added to each category)
  const errorMetric = function (type, message, code, visible) {
    let params = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
    params = {
      params,
      ...{
        message,
        code,
        visible
      }
    };
    sendMetric(type, 'error', params);
  };
  const Metric = function (type, events) {
    let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    return events.reduce((obj, event) => {
      obj[event] = function (name) {
        let params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        params = {
          ...options,
          ...(name ? {
            name
          } : {}),
          ...params
        };
        sendMetric(type, event, params);
      };
      return obj;
    }, {
      error(message, code, params) {
        errorMetric(type, message, code, params);
      },
      event(name, params) {
        sendMetric(type, name, params);
      }
    });
  };
  const Metrics = types => {
    return Object.keys(types).reduce((obj, type) => {
      // media metric works a bit different!
      // it's a function that accepts a url and returns an object with the available metrics
      // url is automatically passed as a param in every metric
      type === 'media' ? obj[type] = url => Metric(type, types[type], {
        url
      }) : obj[type] = Metric(type, types[type]);
      return obj;
    }, {
      error: errorMetric,
      event: sendMetric
    });
  };
  var Metrics$1 = Metrics(metrics$1);

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  var events$1 = {
    abort: 'Abort',
    canplay: 'CanPlay',
    canplaythrough: 'CanPlayThrough',
    durationchange: 'DurationChange',
    emptied: 'Emptied',
    encrypted: 'Encrypted',
    ended: 'Ended',
    error: 'Error',
    interruptbegin: 'InterruptBegin',
    interruptend: 'InterruptEnd',
    loadeddata: 'LoadedData',
    loadedmetadata: 'LoadedMetadata',
    loadstart: 'LoadStart',
    pause: 'Pause',
    play: 'Play',
    playing: 'Playing',
    progress: 'Progress',
    ratechange: 'Ratechange',
    seeked: 'Seeked',
    seeking: 'Seeking',
    stalled: 'Stalled',
    // suspend: 'Suspend', // this one is called a looooot for some videos
    timeupdate: 'TimeUpdate',
    volumechange: 'VolumeChange',
    waiting: 'Waiting'
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  var autoSetupMixin = (function (sourceObject) {
    let setup = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : () => {};
    let ready = false;
    const doSetup = () => {
      if (ready === false) {
        setup();
        ready = true;
      }
    };
    return Object.keys(sourceObject).reduce((obj, key) => {
      if (typeof sourceObject[key] === 'function') {
        obj[key] = function () {
          doSetup();
          return sourceObject[key].apply(sourceObject, arguments);
        };
      } else if (typeof Object.getOwnPropertyDescriptor(sourceObject, key).get === 'function') {
        obj.__defineGetter__(key, function () {
          doSetup();
          return Object.getOwnPropertyDescriptor(sourceObject, key).get.apply(sourceObject);
        });
      } else if (typeof Object.getOwnPropertyDescriptor(sourceObject, key).set === 'function') {
        obj.__defineSetter__(key, function () {
          doSetup();
          return Object.getOwnPropertyDescriptor(sourceObject, key).set.sourceObject[key].apply(sourceObject, arguments);
        });
      } else {
        obj[key] = sourceObject[key];
      }
      return obj;
    }, {});
  });

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  let timeout = null;
  var easeExecution = ((cb, delay) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      cb();
    }, delay);
  });

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  let basePath;
  let proxyUrl;
  const initUtils = config => {
    basePath = ensureUrlWithProtocol(makeFullStaticPath(window.location.pathname, config.path || '/'));
    if (config.proxyUrl) {
      proxyUrl = ensureUrlWithProtocol(config.proxyUrl);
    }
  };
  var Utils = {
    asset(relPath) {
      return basePath + relPath;
    },
    proxyUrl(url) {
      let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return proxyUrl ? proxyUrl + '?' + makeQueryString(url, options) : url;
    },
    makeQueryString() {
      return makeQueryString(...arguments);
    },
    // since imageworkers don't work without protocol
    ensureUrlWithProtocol() {
      return ensureUrlWithProtocol(...arguments);
    }
  };
  const ensureUrlWithProtocol = url => {
    if (/^\/\//.test(url)) {
      return window.location.protocol + url;
    }
    if (!/^(?:https?:)/i.test(url)) {
      return window.location.origin + url;
    }
    return url;
  };
  const makeFullStaticPath = function () {
    let pathname = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '/';
    let path = arguments.length > 1 ? arguments[1] : undefined;
    // ensure path has traling slash
    path = path.charAt(path.length - 1) !== '/' ? path + '/' : path;

    // if path is URL, we assume it's already the full static path, so we just return it
    if (/^(?:https?:)?(?:\/\/)/.test(path)) {
      return path;
    }
    if (path.charAt(0) === '/') {
      return path;
    } else {
      // cleanup the pathname (i.e. remove possible index.html)
      pathname = cleanUpPathName(pathname);

      // remove possible leading dot from path
      path = path.charAt(0) === '.' ? path.substr(1) : path;
      // ensure path has leading slash
      path = path.charAt(0) !== '/' ? '/' + path : path;
      return pathname + path;
    }
  };
  const cleanUpPathName = pathname => {
    if (pathname.slice(-1) === '/') return pathname.slice(0, -1);
    const parts = pathname.split('/');
    if (parts[parts.length - 1].indexOf('.') > -1) parts.pop();
    return parts.join('/');
  };
  const makeQueryString = function (url) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'url';
    // add operator as an option
    options.operator = 'metrological'; // Todo: make this configurable (via url?)
    // add type (= url or qr) as an option, with url as the value
    options[type] = url;
    return Object.keys(options).map(key => {
      return encodeURIComponent(key) + '=' + encodeURIComponent('' + options[key]);
    }).join('&');
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  const initProfile = config => {
    config.getInfo;
    config.setInfo;
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  var Lightning = window.lng;

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  const events = ['timeupdate', 'error', 'ended', 'loadeddata', 'canplay', 'play', 'playing', 'pause', 'loadstart', 'seeking', 'seeked', 'encrypted'];
  let mediaUrl$1 = url => url;
  const initMediaPlayer = config => {
    if (config.mediaUrl) {
      mediaUrl$1 = config.mediaUrl;
    }
  };
  class Mediaplayer extends Lightning.Component {
    _construct() {
      this._skipRenderToTexture = false;
      this._metrics = null;
      this._textureMode = Settings.get('platform', 'textureMode') || false;
      Log.info('Texture mode: ' + this._textureMode);
      console.warn(["The 'MediaPlayer'-plugin in the Lightning-SDK is deprecated and will be removed in future releases.", "Please consider using the new 'VideoPlayer'-plugin instead.", 'https://rdkcentral.github.io/Lightning-SDK/#/plugins/videoplayer'].join('\n\n'));
    }
    static _template() {
      return {
        Video: {
          VideoWrap: {
            VideoTexture: {
              visible: false,
              pivot: 0.5,
              texture: {
                type: Lightning.textures.StaticTexture,
                options: {}
              }
            }
          }
        }
      };
    }
    set skipRenderToTexture(v) {
      this._skipRenderToTexture = v;
    }
    get textureMode() {
      return this._textureMode;
    }
    get videoView() {
      return this.tag('Video');
    }
    _init() {
      //re-use videotag if already there
      const videoEls = document.getElementsByTagName('video');
      if (videoEls && videoEls.length > 0) this.videoEl = videoEls[0];else {
        this.videoEl = document.createElement('video');
        this.videoEl.setAttribute('id', 'video-player');
        this.videoEl.style.position = 'absolute';
        this.videoEl.style.zIndex = '1';
        this.videoEl.style.display = 'none';
        this.videoEl.setAttribute('width', '100%');
        this.videoEl.setAttribute('height', '100%');
        this.videoEl.style.visibility = this.textureMode ? 'hidden' : 'visible';
        document.body.appendChild(this.videoEl);
      }
      if (this.textureMode && !this._skipRenderToTexture) {
        this._createVideoTexture();
      }
      this.eventHandlers = [];
    }
    _registerListeners() {
      events.forEach(event => {
        const handler = e => {
          if (this._metrics && this._metrics[event] && typeof this._metrics[event] === 'function') {
            this._metrics[event]({
              currentTime: this.videoEl.currentTime
            });
          }
          this.fire(event, {
            videoElement: this.videoEl,
            event: e
          });
        };
        this.eventHandlers.push(handler);
        this.videoEl.addEventListener(event, handler);
      });
    }
    _deregisterListeners() {
      Log.info('Deregistering event listeners MediaPlayer');
      events.forEach((event, index) => {
        this.videoEl.removeEventListener(event, this.eventHandlers[index]);
      });
      this.eventHandlers = [];
    }
    _attach() {
      this._registerListeners();
    }
    _detach() {
      this._deregisterListeners();
      this.close();
    }
    _createVideoTexture() {
      const stage = this.stage;
      const gl = stage.gl;
      const glTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, glTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      this.videoTexture.options = {
        source: glTexture,
        w: this.videoEl.width,
        h: this.videoEl.height
      };
    }
    _startUpdatingVideoTexture() {
      if (this.textureMode && !this._skipRenderToTexture) {
        const stage = this.stage;
        if (!this._updateVideoTexture) {
          this._updateVideoTexture = () => {
            if (this.videoTexture.options.source && this.videoEl.videoWidth && this.active) {
              const gl = stage.gl;
              const currentTime = new Date().getTime();

              // When BR2_PACKAGE_GST1_PLUGINS_BAD_PLUGIN_DEBUGUTILS is not set in WPE, webkitDecodedFrameCount will not be available.
              // We'll fallback to fixed 30fps in this case.
              const frameCount = this.videoEl.webkitDecodedFrameCount;
              const mustUpdate = frameCount ? this._lastFrame !== frameCount : this._lastTime < currentTime - 30;
              if (mustUpdate) {
                this._lastTime = currentTime;
                this._lastFrame = frameCount;
                try {
                  gl.bindTexture(gl.TEXTURE_2D, this.videoTexture.options.source);
                  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
                  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.videoEl);
                  this._lastFrame = this.videoEl.webkitDecodedFrameCount;
                  this.videoTextureView.visible = true;
                  this.videoTexture.options.w = this.videoEl.videoWidth;
                  this.videoTexture.options.h = this.videoEl.videoHeight;
                  const expectedAspectRatio = this.videoTextureView.w / this.videoTextureView.h;
                  const realAspectRatio = this.videoEl.videoWidth / this.videoEl.videoHeight;
                  if (expectedAspectRatio > realAspectRatio) {
                    this.videoTextureView.scaleX = realAspectRatio / expectedAspectRatio;
                    this.videoTextureView.scaleY = 1;
                  } else {
                    this.videoTextureView.scaleY = expectedAspectRatio / realAspectRatio;
                    this.videoTextureView.scaleX = 1;
                  }
                } catch (e) {
                  Log.error('texImage2d video', e);
                  this._stopUpdatingVideoTexture();
                  this.videoTextureView.visible = false;
                }
                this.videoTexture.source.forceRenderUpdate();
              }
            }
          };
        }
        if (!this._updatingVideoTexture) {
          stage.on('frameStart', this._updateVideoTexture);
          this._updatingVideoTexture = true;
        }
      }
    }
    _stopUpdatingVideoTexture() {
      if (this.textureMode) {
        const stage = this.stage;
        stage.removeListener('frameStart', this._updateVideoTexture);
        this._updatingVideoTexture = false;
        this.videoTextureView.visible = false;
        if (this.videoTexture.options.source) {
          const gl = stage.gl;
          gl.bindTexture(gl.TEXTURE_2D, this.videoTexture.options.source);
          gl.clearColor(0, 0, 0, 1);
          gl.clear(gl.COLOR_BUFFER_BIT);
        }
      }
    }
    updateSettings() {
      let settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      // The Component that 'consumes' the media player.
      this._consumer = settings.consumer;
      if (this._consumer && this._consumer.getMediaplayerSettings) {
        // Allow consumer to add settings.
        settings = Object.assign(settings, this._consumer.getMediaplayerSettings());
      }
      if (!Lightning.Utils.equalValues(this._stream, settings.stream)) {
        if (settings.stream && settings.stream.keySystem) {
          navigator.requestMediaKeySystemAccess(settings.stream.keySystem.id, settings.stream.keySystem.config).then(keySystemAccess => {
            return keySystemAccess.createMediaKeys();
          }).then(createdMediaKeys => {
            return this.videoEl.setMediaKeys(createdMediaKeys);
          }).then(() => {
            if (settings.stream && settings.stream.src) this.open(settings.stream.src);
          }).catch(() => {
            console.error('Failed to set up MediaKeys');
          });
        } else if (settings.stream && settings.stream.src) {
          // This is here to be backwards compatible, will be removed
          // in future sdk release
          if (Settings.get('app', 'hls')) {
            if (!window.Hls) {
              window.Hls = class Hls {
                static isSupported() {
                  console.warn('hls-light not included');
                  return false;
                }
              };
            }
            if (window.Hls.isSupported()) {
              if (!this._hls) this._hls = new window.Hls({
                liveDurationInfinity: true
              });
              this._hls.loadSource(settings.stream.src);
              this._hls.attachMedia(this.videoEl);
              this.videoEl.style.display = 'block';
            }
          } else {
            this.open(settings.stream.src);
          }
        } else {
          this.close();
        }
        this._stream = settings.stream;
      }
      this._setHide(settings.hide);
      this._setVideoArea(settings.videoPos);
    }
    _setHide(hide) {
      if (this.textureMode) {
        this.tag('Video').setSmooth('alpha', hide ? 0 : 1);
      } else {
        this.videoEl.style.visibility = hide ? 'hidden' : 'visible';
      }
    }
    open(url) {
      let settings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
        hide: false,
        videoPosition: null
      };
      // prep the media url to play depending on platform (mediaPlayerplugin)
      url = mediaUrl$1(url);
      this._metrics = Metrics$1.media(url);
      Log.info('Playing stream', url);
      if (this.application.noVideo) {
        Log.info('noVideo option set, so ignoring: ' + url);
        return;
      }
      // close the video when opening same url as current (effectively reloading)
      if (this.videoEl.getAttribute('src') === url) {
        this.close();
      }
      this.videoEl.setAttribute('src', url);

      // force hide, then force show (in next tick!)
      // (fixes comcast playback rollover issue)
      this.videoEl.style.visibility = 'hidden';
      this.videoEl.style.display = 'none';
      setTimeout(() => {
        this.videoEl.style.display = 'block';
        this.videoEl.style.visibility = 'visible';
      });
      this._setHide(settings.hide);
      this._setVideoArea(settings.videoPosition || [0, 0, 1920, 1080]);
    }
    close() {
      // We need to pause first in order to stop sound.
      this.videoEl.pause();
      this.videoEl.removeAttribute('src');

      // force load to reset everything without errors
      this.videoEl.load();
      this._clearSrc();
      this.videoEl.style.display = 'none';
    }
    playPause() {
      if (this.isPlaying()) {
        this.doPause();
      } else {
        this.doPlay();
      }
    }
    get muted() {
      return this.videoEl.muted;
    }
    set muted(v) {
      this.videoEl.muted = v;
    }
    get loop() {
      return this.videoEl.loop;
    }
    set loop(v) {
      this.videoEl.loop = v;
    }
    isPlaying() {
      return this._getState() === 'Playing';
    }
    doPlay() {
      this.videoEl.play();
    }
    doPause() {
      this.videoEl.pause();
    }
    reload() {
      var url = this.videoEl.getAttribute('src');
      this.close();
      this.videoEl.src = url;
    }
    getPosition() {
      return Promise.resolve(this.videoEl.currentTime);
    }
    setPosition(pos) {
      this.videoEl.currentTime = pos;
    }
    getDuration() {
      return Promise.resolve(this.videoEl.duration);
    }
    seek(time) {
      let absolute = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      if (absolute) {
        this.videoEl.currentTime = time;
      } else {
        this.videoEl.currentTime += time;
      }
    }
    get videoTextureView() {
      return this.tag('Video').tag('VideoTexture');
    }
    get videoTexture() {
      return this.videoTextureView.texture;
    }
    _setVideoArea(videoPos) {
      if (Lightning.Utils.equalValues(this._videoPos, videoPos)) {
        return;
      }
      this._videoPos = videoPos;
      if (this.textureMode) {
        this.videoTextureView.patch({
          smooth: {
            x: videoPos[0],
            y: videoPos[1],
            w: videoPos[2] - videoPos[0],
            h: videoPos[3] - videoPos[1]
          }
        });
      } else {
        const precision = this.stage.getRenderPrecision();
        this.videoEl.style.left = Math.round(videoPos[0] * precision) + 'px';
        this.videoEl.style.top = Math.round(videoPos[1] * precision) + 'px';
        this.videoEl.style.width = Math.round((videoPos[2] - videoPos[0]) * precision) + 'px';
        this.videoEl.style.height = Math.round((videoPos[3] - videoPos[1]) * precision) + 'px';
      }
    }
    _fireConsumer(event, args) {
      if (this._consumer) {
        this._consumer.fire(event, args);
      }
    }
    _equalInitData(buf1, buf2) {
      if (!buf1 || !buf2) return false;
      if (buf1.byteLength != buf2.byteLength) return false;
      const dv1 = new Int8Array(buf1);
      const dv2 = new Int8Array(buf2);
      for (let i = 0; i != buf1.byteLength; i++) if (dv1[i] != dv2[i]) return false;
      return true;
    }
    error(args) {
      this._fireConsumer('$mediaplayerError', args);
      this._setState('');
      return '';
    }
    loadeddata(args) {
      this._fireConsumer('$mediaplayerLoadedData', args);
    }
    play(args) {
      this._fireConsumer('$mediaplayerPlay', args);
    }
    playing(args) {
      this._fireConsumer('$mediaplayerPlaying', args);
      this._setState('Playing');
    }
    canplay(args) {
      this.videoEl.play();
      this._fireConsumer('$mediaplayerStart', args);
    }
    loadstart(args) {
      this._fireConsumer('$mediaplayerLoad', args);
    }
    seeked() {
      this._fireConsumer('$mediaplayerSeeked', {
        currentTime: this.videoEl.currentTime,
        duration: this.videoEl.duration || 1
      });
    }
    seeking() {
      this._fireConsumer('$mediaplayerSeeking', {
        currentTime: this.videoEl.currentTime,
        duration: this.videoEl.duration || 1
      });
    }
    durationchange(args) {
      this._fireConsumer('$mediaplayerDurationChange', args);
    }
    encrypted(args) {
      const video = args.videoElement;
      const event = args.event;
      // FIXME: Double encrypted events need to be properly filtered by Gstreamer
      if (video.mediaKeys && !this._equalInitData(this._previousInitData, event.initData)) {
        this._previousInitData = event.initData;
        this._fireConsumer('$mediaplayerEncrypted', args);
      }
    }
    static _states() {
      return [class Playing extends this {
        $enter() {
          this._startUpdatingVideoTexture();
        }
        $exit() {
          this._stopUpdatingVideoTexture();
        }
        timeupdate() {
          this._fireConsumer('$mediaplayerProgress', {
            currentTime: this.videoEl.currentTime,
            duration: this.videoEl.duration || 1
          });
        }
        ended(args) {
          this._fireConsumer('$mediaplayerEnded', args);
          this._setState('');
        }
        pause(args) {
          this._fireConsumer('$mediaplayerPause', args);
          this._setState('Playing.Paused');
        }
        _clearSrc() {
          this._fireConsumer('$mediaplayerStop', {});
          this._setState('');
        }
        static _states() {
          return [class Paused extends this {}];
        }
      }];
    }
  }

  class localCookie {
    constructor(e) {
      return e = e || {}, this.forceCookies = e.forceCookies || !1, !0 === this._checkIfLocalStorageWorks() && !0 !== e.forceCookies ? {
        getItem: this._getItemLocalStorage,
        setItem: this._setItemLocalStorage,
        removeItem: this._removeItemLocalStorage,
        clear: this._clearLocalStorage
      } : {
        getItem: this._getItemCookie,
        setItem: this._setItemCookie,
        removeItem: this._removeItemCookie,
        clear: this._clearCookies
      };
    }
    _checkIfLocalStorageWorks() {
      if ("undefined" == typeof localStorage) return !1;
      try {
        return localStorage.setItem("feature_test", "yes"), "yes" === localStorage.getItem("feature_test") && (localStorage.removeItem("feature_test"), !0);
      } catch (e) {
        return !1;
      }
    }
    _getItemLocalStorage(e) {
      return window.localStorage.getItem(e);
    }
    _setItemLocalStorage(e, t) {
      return window.localStorage.setItem(e, t);
    }
    _removeItemLocalStorage(e) {
      return window.localStorage.removeItem(e);
    }
    _clearLocalStorage() {
      return window.localStorage.clear();
    }
    _getItemCookie(e) {
      var t = document.cookie.match(RegExp("(?:^|;\\s*)" + function (e) {
        return e.replace(/([.*+?\^${}()|\[\]\/\\])/g, "\\$1");
      }(e) + "=([^;]*)"));
      return t && "" === t[1] && (t[1] = null), t ? t[1] : null;
    }
    _setItemCookie(e, t) {
      var o = new Date(),
        r = new Date(o.getTime() + 15768e7);
      document.cookie = "".concat(e, "=").concat(t, "; expires=").concat(r.toUTCString(), ";");
    }
    _removeItemCookie(e) {
      document.cookie = "".concat(e, "=;Max-Age=-99999999;");
    }
    _clearCookies() {
      document.cookie.split(";").forEach(e => {
        document.cookie = e.replace(/^ +/, "").replace(/=.*/, "=;expires=Max-Age=-99999999");
      });
    }
  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  const initStorage = () => {
    Settings.get('platform', 'id');
    // todo: pass options (for example to force the use of cookies)
    new localCookie();
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  const isFunction$1 = v => {
    return typeof v === 'function';
  };
  const isObject$2 = v => {
    return typeof v === 'object' && v !== null;
  };
  const isBoolean = v => {
    return typeof v === 'boolean';
  };
  const isPage = v => {
    if (v instanceof Lightning.Element || isComponentConstructor(v)) {
      return true;
    }
    return false;
  };
  const isComponentConstructor = type => {
    return type.prototype && 'isComponent' in type.prototype;
  };
  const isArray$1 = v => {
    return Array.isArray(v);
  };
  const ucfirst = v => {
    return "".concat(v.charAt(0).toUpperCase()).concat(v.slice(1));
  };
  const isString$2 = v => {
    return typeof v === 'string';
  };
  const isPromise = method => {
    let result;
    if (isFunction$1(method)) {
      try {
        result = method.apply(null);
      } catch (e) {
        result = e;
      }
    } else {
      result = method;
    }
    return isObject$2(result) && isFunction$1(result.then);
  };
  const getConfigMap = () => {
    const routerSettings = Settings.get('platform', 'router');
    const isObj = isObject$2(routerSettings);
    return ['backtrack', 'gcOnUnload', 'destroyOnHistoryBack', 'lazyCreate', 'lazyDestroy', 'reuseInstance', 'autoRestoreRemote', 'numberNavigation', 'updateHash'].reduce((config, key) => {
      config.set(key, isObj ? routerSettings[key] : Settings.get('platform', key));
      return config;
    }, new Map());
  };
  const getQueryStringParams = hash => {
    let parse = '';
    const getQuery = /([?&].*)/;
    const matches = getQuery.exec(hash);
    const params = {};
    if (document.location && document.location.search) {
      parse = document.location.search;
    }
    if (matches && matches.length) {
      let hashParams = matches[1];
      if (parse) {
        // if location.search is not empty we
        // remove the leading ? to create a
        // valid string
        hashParams = hashParams.replace(/^\?/, '');
        // we parse hash params last so they we can always
        // override search params with hash params
        parse = "".concat(parse, "&").concat(hashParams);
      } else {
        parse = hashParams;
      }
    }
    if (parse) {
      const urlParams = new URLSearchParams(parse);
      for (const [key, value] of urlParams.entries()) {
        params[key] = value;
      }
      return params;
    } else {
      return false;
    }
  };
  const objectToQueryString = obj => {
    if (!isObject$2(obj)) {
      return '';
    }
    return '?' + Object.keys(obj).map(key => {
      return "".concat(key, "=").concat(obj[key]);
    }).join('&');
  };
  const symbols = {
    route: Symbol('route'),
    hash: Symbol('hash'),
    store: Symbol('store'),
    fromHistory: Symbol('fromHistory'),
    expires: Symbol('expires'),
    resume: Symbol('resume'),
    backtrack: Symbol('backtrack'),
    historyState: Symbol('historyState'),
    queryParams: Symbol('queryParams')
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  const hasRegex = /\{\/(.*?)\/([igm]{0,3})\}/g;
  const isWildcard = /^[!*$]$/;
  const hasLookupId = /\/:\w+?@@([0-9]+?)@@/;
  const isNamedGroup = /^\/:/;

  /**
   * Test if a route is part regular expressed
   * and replace it for a simple character
   * @param route
   * @returns {*}
   */
  const stripRegex = function (route) {
    let char = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'R';
    // if route is part regular expressed we replace
    // the regular expression for a character to
    // simplify floor calculation and backtracking
    if (hasRegex.test(route)) {
      route = route.replace(hasRegex, char);
    }
    return route;
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /**
   * Create a local request register
   * @param flags
   * @returns {Map<any, any>}
   */
  const createRegister = flags => {
    const reg = new Map()
    // store user defined and router
    // defined flags in register
    ;
    [...Object.keys(flags), ...Object.getOwnPropertySymbols(flags)].forEach(key => {
      reg.set(key, flags[key]);
    });
    return reg;
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  class Request {
    constructor(hash, navArgs, storeCaller) {
      this._hash = hash;
      this._storeCaller = storeCaller;
      this._register = new Map();
      this._isCreated = false;
      this._isSharedInstance = false;
      this._cancelled = false;

      // if there are arguments attached to navigate()
      // we store them in new request
      if (isObject$2(navArgs)) {
        this._register = createRegister(navArgs);
      } else if (isBoolean(navArgs)) {
        this._storeCaller = navArgs;
      }
      // @todo: remove because we can simply check
      // ._storeCaller property
      this._register.set(symbols.store, this._storeCaller);
    }
    cancel() {
      Log.debug('[router]:', "cancelled ".concat(this._hash));
      this._cancelled = true;
    }
    get url() {
      return this._hash;
    }
    get register() {
      return this._register;
    }
    get hash() {
      return this._hash;
    }
    set hash(args) {
      this._hash = args;
    }
    get route() {
      return this._route;
    }
    set route(args) {
      this._route = args;
    }
    get provider() {
      return this._provider;
    }
    set provider(args) {
      this._provider = args;
    }
    get providerType() {
      return this._providerType;
    }
    set providerType(args) {
      this._providerType = args;
    }
    set page(args) {
      this._page = args;
    }
    get page() {
      return this._page;
    }
    set isCreated(args) {
      this._isCreated = args;
    }
    get isCreated() {
      return this._isCreated;
    }
    get isSharedInstance() {
      return this._isSharedInstance;
    }
    set isSharedInstance(args) {
      this._isSharedInstance = args;
    }
    get isCancelled() {
      return this._cancelled;
    }
  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  class Route {
    constructor() {
      let config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      // keep backwards compatible
      let type = ['on', 'before', 'after'].reduce((acc, type) => {
        return isFunction$1(config[type]) ? type : acc;
      }, undefined);
      this._cfg = config;
      if (type) {
        this._provider = {
          type,
          request: config[type]
        };
      }
    }
    get path() {
      return this._cfg.path;
    }
    get component() {
      return this._cfg.component;
    }
    get options() {
      return this._cfg.options;
    }
    get widgets() {
      return this._cfg.widgets;
    }
    get cache() {
      return this._cfg.cache;
    }
    get hook() {
      return this._cfg.hook;
    }
    get beforeNavigate() {
      return this._cfg.beforeNavigate;
    }
    get provider() {
      return this._provider;
    }
  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /**
   * Simple route length calculation
   * @param route {string}
   * @returns {number} - floor
   */
  const getFloor = route => {
    return stripRegex(route).split('/').length;
  };

  /**
   * return all stored routes that live on the same floor
   * @param floor
   * @returns {Array}
   */
  const getRoutesByFloor = floor => {
    const matches = [];
    // simple filter of level candidates
    for (let [route] of routes.entries()) {
      if (getFloor(route) === floor) {
        matches.push(route);
      }
    }
    return matches;
  };

  /**
   * return a matching route by provided hash
   * hash: home/browse/12 will match:
   * route: home/browse/:categoryId
   * @param hash {string}
   * @returns {boolean|{}} - route
   */
  const getRouteByHash = hash => {
    // @todo: clean up on handleHash
    hash = hash.replace(/^#/, '');
    const getUrlParts = /(\/?:?[@!*\w%\s:-]+)/g;
    // grab possible candidates from stored routes
    const candidates = getRoutesByFloor(getFloor(hash));
    // break hash down in chunks
    const hashParts = hash.match(getUrlParts) || [];

    // to simplify the route matching and prevent look around
    // in our getUrlParts regex we get the regex part from
    // route candidate and store them so that we can reference
    // them when we perform the actual regex against hash
    let regexStore = [];
    let matches = candidates.filter(route => {
      let isMatching = true;
      // replace regex in route with lookup id => @@{storeId}@@
      if (hasRegex.test(route)) {
        const regMatches = route.match(hasRegex);
        if (regMatches && regMatches.length) {
          route = regMatches.reduce((fullRoute, regex) => {
            const lookupId = regexStore.length;
            fullRoute = fullRoute.replace(regex, "@@".concat(lookupId, "@@"));
            regexStore.push(regex.substring(1, regex.length - 1));
            return fullRoute;
          }, route);
        }
      }
      const routeParts = route.match(getUrlParts) || [];
      for (let i = 0, j = routeParts.length; i < j; i++) {
        const routePart = routeParts[i];
        const hashPart = hashParts[i];

        // Since we support catch-all and regex driven name groups
        // we first test for regex lookup id and see if the regex
        // matches the value from the hash
        if (hasLookupId.test(routePart)) {
          const routeMatches = hasLookupId.exec(routePart);
          const storeId = routeMatches[1];
          const routeRegex = regexStore[storeId];

          // split regex and modifiers so we can use both
          // to create a new RegExp
          // eslint-disable-next-line
          const regMatches = /\/([^\/]+)\/([igm]{0,3})/.exec(routeRegex);
          if (regMatches && regMatches.length) {
            const expression = regMatches[1];
            const modifiers = regMatches[2];
            const regex = new RegExp("^/".concat(expression, "$"), modifiers);
            if (!regex.test(hashPart)) {
              isMatching = false;
            }
          }
        } else if (isNamedGroup.test(routePart)) {
          // we kindly skip namedGroups because this is dynamic
          // we only need to the static and regex drive parts
          continue;
        } else if (hashPart && routePart.toLowerCase() !== hashPart.toLowerCase()) {
          isMatching = false;
        }
      }
      return isMatching;
    });
    if (matches.length) {
      if (matches.indexOf(hash) !== -1) {
        const match = matches[matches.indexOf(hash)];
        return routes.get(match);
      } else {
        // we give prio to static routes over dynamic
        matches = matches.sort(a => {
          return isNamedGroup.test(a) ? -1 : 1;
        });
        // would be strange if this fails
        // but still we test
        if (routeExists(matches[0])) {
          return routes.get(matches[0]);
        }
      }
    }
    return false;
  };
  const getValuesFromHash = function () {
    let hash = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    let path = arguments.length > 1 ? arguments[1] : undefined;
    // replace the regex definition from the route because
    // we already did the matching part
    path = stripRegex(path, '');
    const getUrlParts = /(\/?:?[\w%\s:-]+)/g;
    const hashParts = hash.match(getUrlParts) || [];
    const routeParts = path.match(getUrlParts) || [];
    const getNamedGroup = /^\/:([\w-]+)\/?/;
    return routeParts.reduce((storage, value, index) => {
      const match = getNamedGroup.exec(value);
      if (match && match.length) {
        storage.set(match[1], decodeURIComponent(hashParts[index].replace(/^\//, '')));
      }
      return storage;
    }, new Map());
  };
  const getOption = (stack, prop) => {
    // eslint-disable-next-line
    if (stack && stack.hasOwnProperty(prop)) {
      return stack[prop];
    }
    // we explicitly return undefined since we're testing
    // for explicit test values
  };

  /**
   * create and return new Route instance
   * @param config
   */
  const createRoute = config => {
    // we need to provide a bit of additional logic
    // for the bootComponent
    if (config.path === '$') {
      let options = {
        preventStorage: true
      };
      if (isObject$2(config.options)) {
        options = {
          ...config.options,
          ...options
        };
      }
      config.options = options;
      // if configured add reference to bootRequest
      // as router after provider
      if (bootRequest) {
        config.after = bootRequest;
      }
    }
    return new Route(config);
  };

  /**
   * Create a new Router request object
   * @param url
   * @param args
   * @param store
   * @returns {*}
   */
  const createRequest = (url, args, store) => {
    return new Request(url, args, store);
  };
  const getHashByName = obj => {
    if (!obj.to && !obj.name) {
      return false;
    }
    const route = getRouteByName(obj.to || obj.name);
    const hasDynamicGroup = /\/:([\w-]+)\/?/;
    let hash = route;

    // if route contains dynamic group
    // we replace them with the provided params
    if (hasDynamicGroup.test(route)) {
      if (obj.params) {
        const keys = Object.keys(obj.params);
        hash = keys.reduce((acc, key) => {
          return acc.replace(":".concat(key), obj.params[key]);
        }, route);
      }
      if (obj.query) {
        return "".concat(hash).concat(objectToQueryString(obj.query));
      }
    }
    return hash;
  };
  const getRouteByName = name => {
    for (let [path, route] of routes.entries()) {
      if (route.name === name) {
        return path;
      }
    }
    return false;
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  var emit$1 = (function (page) {
    let events = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    let params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    if (!isArray$1(events)) {
      events = [events];
    }
    events.forEach(e => {
      const event = "_on".concat(ucfirst(e));
      if (isFunction$1(page[event])) {
        page[event](params);
      }
    });
  });

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  let activeWidget = null;
  const getReferences = () => {
    if (!widgetsHost) {
      return;
    }
    return widgetsHost.get().reduce((storage, widget) => {
      const key = widget.ref.toLowerCase();
      storage[key] = widget;
      return storage;
    }, {});
  };

  /**
   * update the visibility of the available widgets
   * for the current page / route
   * @param page
   */
  const updateWidgets = (widgets, page) => {
    // force lowercase lookup
    const configured = (widgets || []).map(ref => ref.toLowerCase());
    widgetsHost.forEach(widget => {
      widget.visible = configured.indexOf(widget.ref.toLowerCase()) !== -1;
      if (widget.visible) {
        emit$1(widget, ['activated'], page);
      }
    });
    if (app.state === 'Widgets' && activeWidget && !activeWidget.visible) {
      app._setState('');
    }
  };
  const getWidgetByName = name => {
    name = ucfirst(name);
    return widgetsHost.getByRef(name) || false;
  };

  /**
   * delegate app focus to a on-screen widget
   * @param name - {string}
   */
  const focusWidget = name => {
    const widget = getWidgetByName(name);
    if (widget) {
      setActiveWidget(widget);

      // if app is already in 'Widgets' state we can assume that
      // focus has been delegated from one widget to another so
      // we need to set the new widget reference and trigger a
      // new focus calculation of Lightning's focuspath
      if (app.state === 'Widgets') {
        app.reload(activeWidget);
      } else {
        app._setState('Widgets', [activeWidget]);
      }
    }
  };
  const restoreFocus = () => {
    activeWidget = null;
    app._setState('');
  };
  const getActiveWidget = () => {
    return activeWidget;
  };
  const setActiveWidget = instance => {
    activeWidget = instance;
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  const createComponent = (stage, type) => {
    return stage.c({
      type,
      visible: false,
      widgets: getReferences()
    });
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /**
   * Simple flat array that holds the visited hashes + state Object
   * so the router can navigate back to them
   * @type {Array}
   */
  let history = [];
  const updateHistory = request => {
    const hash = getActiveHash();
    if (!hash) {
      return;
    }

    // navigate storage flag
    const register = request.register;
    const forceNavigateStore = register.get(symbols.store);

    // test preventStorage on route configuration
    const activeRoute = getRouteByHash(hash);
    const preventStorage = getOption(activeRoute.options, 'preventStorage');

    // we give prio to navigate storage flag
    let store = isBoolean(forceNavigateStore) ? forceNavigateStore : !preventStorage;
    if (store) {
      const toStore = hash.replace(/^\//, '');
      const location = locationInHistory(toStore);
      const stateObject = getStateObject(getActivePage());
      const routerConfig = getRouterConfig();

      // store hash if it's not a part of history or flag for
      // storage of same hash is true
      if (location === -1 || routerConfig.get('storeSameHash')) {
        history.push({
          hash: toStore,
          state: stateObject
        });
      } else {
        // if we visit the same route we want to sync history
        const prev = history.splice(location, 1)[0];
        history.push({
          hash: prev.hash,
          state: stateObject
        });
      }
    }
  };
  const locationInHistory = hash => {
    for (let i = 0; i < history.length; i++) {
      if (history[i].hash === hash) {
        return i;
      }
    }
    return -1;
  };
  const getHistoryState = hash => {
    let state = null;
    if (history.length) {
      // if no hash is provided we get the last
      // pushed history record
      if (!hash) {
        const record = history[history.length - 1];
        // could be null
        state = record.state;
      } else {
        if (locationInHistory(hash) !== -1) {
          const record = history[locationInHistory(hash)];
          state = record.state;
        }
      }
    }
    return state;
  };
  const replaceHistoryState = function () {
    let state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    let hash = arguments.length > 1 ? arguments[1] : undefined;
    if (!history.length) {
      return;
    }
    const location = hash ? locationInHistory(hash) : history.length - 1;
    if (location !== -1 && isObject$2(state)) {
      history[location].state = state;
    }
  };
  const getStateObject = page => {
    if (page && isFunction$1(page.historyState)) {
      return page.historyState();
    }
    return null;
  };
  const getHistory = () => {
    return history.slice(0);
  };
  const setHistory = function () {
    let arr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    if (isArray$1(arr)) {
      history = arr;
    }
  };

  var isMergeableObject = function isMergeableObject(value) {
    return isNonNullObject(value) && !isSpecial(value);
  };
  function isNonNullObject(value) {
    return !!value && typeof value === 'object';
  }
  function isSpecial(value) {
    var stringValue = Object.prototype.toString.call(value);
    return stringValue === '[object RegExp]' || stringValue === '[object Date]' || isReactElement(value);
  }

  // see https://github.com/facebook/react/blob/b5ac963fb791d1298e7f396236383bc955f916c1/src/isomorphic/classic/element/ReactElement.js#L21-L25
  var canUseSymbol = typeof Symbol === 'function' && Symbol.for;
  var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for('react.element') : 0xeac7;
  function isReactElement(value) {
    return value.$$typeof === REACT_ELEMENT_TYPE;
  }
  function emptyTarget(val) {
    return Array.isArray(val) ? [] : {};
  }
  function cloneUnlessOtherwiseSpecified(value, options) {
    return options.clone !== false && options.isMergeableObject(value) ? deepmerge(emptyTarget(value), value, options) : value;
  }
  function defaultArrayMerge(target, source, options) {
    return target.concat(source).map(function (element) {
      return cloneUnlessOtherwiseSpecified(element, options);
    });
  }
  function getMergeFunction(key, options) {
    if (!options.customMerge) {
      return deepmerge;
    }
    var customMerge = options.customMerge(key);
    return typeof customMerge === 'function' ? customMerge : deepmerge;
  }
  function getEnumerableOwnPropertySymbols(target) {
    return Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(target).filter(function (symbol) {
      return target.propertyIsEnumerable(symbol);
    }) : [];
  }
  function getKeys(target) {
    return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target));
  }
  function propertyIsOnObject(object, property) {
    try {
      return property in object;
    } catch (_) {
      return false;
    }
  }

  // Protects from prototype poisoning and unexpected merging up the prototype chain.
  function propertyIsUnsafe(target, key) {
    return propertyIsOnObject(target, key) // Properties are safe to merge if they don't exist in the target yet,
    && !(Object.hasOwnProperty.call(target, key) // unsafe if they exist up the prototype chain,
    && Object.propertyIsEnumerable.call(target, key)); // and also unsafe if they're nonenumerable.
  }

  function mergeObject(target, source, options) {
    var destination = {};
    if (options.isMergeableObject(target)) {
      getKeys(target).forEach(function (key) {
        destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
      });
    }
    getKeys(source).forEach(function (key) {
      if (propertyIsUnsafe(target, key)) {
        return;
      }
      if (propertyIsOnObject(target, key) && options.isMergeableObject(source[key])) {
        destination[key] = getMergeFunction(key, options)(target[key], source[key], options);
      } else {
        destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
      }
    });
    return destination;
  }
  function deepmerge(target, source, options) {
    options = options || {};
    options.arrayMerge = options.arrayMerge || defaultArrayMerge;
    options.isMergeableObject = options.isMergeableObject || isMergeableObject;
    // cloneUnlessOtherwiseSpecified is added to `options` so that custom arrayMerge()
    // implementations can use it. The caller may not replace it.
    options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified;
    var sourceIsArray = Array.isArray(source);
    var targetIsArray = Array.isArray(target);
    var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;
    if (!sourceAndTargetTypesMatch) {
      return cloneUnlessOtherwiseSpecified(source, options);
    } else if (sourceIsArray) {
      return options.arrayMerge(target, source, options);
    } else {
      return mergeObject(target, source, options);
    }
  }
  deepmerge.all = function deepmergeAll(array, options) {
    if (!Array.isArray(array)) {
      throw new Error('first argument should be an array');
    }
    return array.reduce(function (prev, next) {
      return deepmerge(prev, next, options);
    }, {});
  };
  var deepmerge_1 = deepmerge;
  var cjs = deepmerge_1;

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  let warned = false;
  const deprecated = function () {
    let force = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    if (force === true || warned === false) {
      console.warn(["The 'Locale'-plugin in the Lightning-SDK is deprecated and will be removed in future releases.", "Please consider using the new 'Language'-plugin instead.", 'https://rdkcentral.github.io/Lightning-SDK/#/plugins/language'].join('\n\n'));
    }
    warned = true;
  };
  class Locale {
    constructor() {
      this.__enabled = false;
    }

    /**
     * Loads translation object from external json file.
     *
     * @param {String} path Path to resource.
     * @return {Promise}
     */
    async load(path) {
      if (!this.__enabled) {
        return;
      }
      await fetch(path).then(resp => resp.json()).then(resp => {
        this.loadFromObject(resp);
      });
    }

    /**
     * Sets language used by module.
     *
     * @param {String} lang
     */
    setLanguage(lang) {
      deprecated();
      this.__enabled = true;
      this.language = lang;
    }

    /**
     * Returns reference to translation object for current language.
     *
     * @return {Object}
     */
    get tr() {
      deprecated(true);
      return this.__trObj[this.language];
    }

    /**
     * Loads translation object from existing object (binds existing object).
     *
     * @param {Object} trObj
     */
    loadFromObject(trObj) {
      deprecated();
      const fallbackLanguage = 'en';
      if (Object.keys(trObj).indexOf(this.language) === -1) {
        Log.warn('No translations found for: ' + this.language);
        if (Object.keys(trObj).indexOf(fallbackLanguage) > -1) {
          Log.warn('Using fallback language: ' + fallbackLanguage);
          this.language = fallbackLanguage;
        } else {
          const error = 'No translations found for fallback language: ' + fallbackLanguage;
          Log.error(error);
          throw Error(error);
        }
      }
      this.__trObj = trObj;
      for (const lang of Object.values(this.__trObj)) {
        for (const str of Object.keys(lang)) {
          lang[str] = new LocalizedString(lang[str]);
        }
      }
    }
  }

  /**
   * Extended string class used for localization.
   */
  class LocalizedString extends String {
    /**
     * Returns formatted LocalizedString.
     * Replaces each placeholder value (e.g. {0}, {1}) with corresponding argument.
     *
     * E.g.:
     * > new LocalizedString('{0} and {1} and {0}').format('A', 'B');
     * A and B and A
     *
     * @param  {...any} args List of arguments for placeholders.
     */
    format() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      const sub = args.reduce((string, arg, index) => string.split("{".concat(index, "}")).join(arg), this);
      return new LocalizedString(sub);
    }
  }
  var Locale$1 = new Locale();

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  class VersionLabel extends Lightning.Component {
    static _template() {
      return {
        rect: true,
        color: 0xbb0078ac,
        h: 40,
        w: 100,
        x: w => w - 50,
        y: h => h - 50,
        mount: 1,
        Text: {
          w: w => w,
          h: h => h,
          y: 5,
          x: 20,
          text: {
            fontSize: 22,
            lineHeight: 26
          }
        }
      };
    }
    _firstActive() {
      this.tag('Text').text = "APP - v".concat(this.version, "\nSDK - v").concat(this.sdkVersion);
      this.tag('Text').loadTexture();
      this.w = this.tag('Text').renderWidth + 40;
      this.h = this.tag('Text').renderHeight + 5;
    }
  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  class FpsIndicator extends Lightning.Component {
    static _template() {
      return {
        rect: true,
        color: 0xffffffff,
        texture: Lightning.Tools.getRoundRect(80, 80, 40),
        h: 80,
        w: 80,
        x: 100,
        y: 100,
        mount: 1,
        Background: {
          x: 3,
          y: 3,
          texture: Lightning.Tools.getRoundRect(72, 72, 36),
          color: 0xff008000
        },
        Counter: {
          w: w => w,
          h: h => h,
          y: 10,
          text: {
            fontSize: 32,
            textAlign: 'center'
          }
        },
        Text: {
          w: w => w,
          h: h => h,
          y: 48,
          text: {
            fontSize: 15,
            textAlign: 'center',
            text: 'FPS'
          }
        }
      };
    }
    _setup() {
      this.config = {
        ...{
          log: false,
          interval: 500,
          threshold: 1
        },
        ...Settings.get('platform', 'showFps')
      };
      this.fps = 0;
      this.lastFps = this.fps - this.config.threshold;
      const fpsCalculator = () => {
        this.fps = ~~(1 / this.stage.dt);
      };
      this.stage.on('frameStart', fpsCalculator);
      this.stage.off('framestart', fpsCalculator);
      this.interval = setInterval(this.showFps.bind(this), this.config.interval);
    }
    _firstActive() {
      this.showFps();
    }
    _detach() {
      clearInterval(this.interval);
    }
    showFps() {
      if (Math.abs(this.lastFps - this.fps) <= this.config.threshold) return;
      this.lastFps = this.fps;
      // green
      let bgColor = 0xff008000;
      // orange
      if (this.fps <= 40 && this.fps > 20) bgColor = 0xffffa500;
      // red
      else if (this.fps <= 20) bgColor = 0xffff0000;
      this.tag('Background').setSmooth('color', bgColor);
      this.tag('Counter').text = "".concat(this.fps);
      this.config.log && Log.info('FPS', this.fps);
    }
  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  let meta = {};
  let translations = {};
  let language = null;
  const initLanguage = function (file) {
    let language = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    return new Promise((resolve, reject) => {
      fetch(file).then(response => response.json()).then(json => {
        setTranslations(json);
        // set language (directly or in a promise)
        typeof language === 'object' && 'then' in language && typeof language.then === 'function' ? language.then(lang => setLanguage(lang).then(resolve).catch(reject)).catch(e => {
          Log.error(e);
          reject(e);
        }) : setLanguage(language).then(resolve).catch(reject);
      }).catch(() => {
        const error = 'Language file ' + file + ' not found';
        Log.error(error);
        reject(error);
      });
    });
  };
  const setTranslations = obj => {
    if ('meta' in obj) {
      meta = {
        ...obj.meta
      };
      delete obj.meta;
    }
    translations = obj;
  };
  const setLanguage = lng => {
    language = null;
    return new Promise((resolve, reject) => {
      if (lng in translations) {
        language = lng;
      } else {
        if ('map' in meta && lng in meta.map && meta.map[lng] in translations) {
          language = meta.map[lng];
        } else if ('default' in meta && meta.default in translations) {
          const error = 'Translations for Language ' + language + ' not found. Using default language ' + meta.default;
          Log.warn(error);
          language = meta.default;
        } else {
          const error = 'Translations for Language ' + language + ' not found.';
          Log.error(error);
          reject(error);
        }
      }
      if (language) {
        Log.info('Setting language to', language);
        const translationsObj = translations[language];
        if (typeof translationsObj === 'object') {
          resolve();
        } else if (typeof translationsObj === 'string') {
          const url = Utils.asset(translationsObj);
          fetch(url).then(response => response.json()).then(json => {
            // save the translations for this language (to prevent loading twice)
            translations[language] = json;
            resolve();
          }).catch(e => {
            const error = 'Error while fetching ' + url;
            Log.error(error, e);
            reject(error);
          });
        }
      }
    });
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  const registry = {
    eventListeners: [],
    timeouts: [],
    intervals: [],
    targets: []
  };
  var Registry = {
    // Timeouts
    setTimeout(cb, timeout) {
      for (var _len = arguments.length, params = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        params[_key - 2] = arguments[_key];
      }
      const timeoutId = setTimeout(() => {
        registry.timeouts = registry.timeouts.filter(id => id !== timeoutId);
        cb.apply(null, params);
      }, timeout, params);
      Log.info('Set Timeout', 'ID: ' + timeoutId);
      registry.timeouts.push(timeoutId);
      return timeoutId;
    },
    clearTimeout(timeoutId) {
      if (registry.timeouts.indexOf(timeoutId) > -1) {
        registry.timeouts = registry.timeouts.filter(id => id !== timeoutId);
        Log.info('Clear Timeout', 'ID: ' + timeoutId);
        clearTimeout(timeoutId);
      } else {
        Log.error('Clear Timeout', 'ID ' + timeoutId + ' not found');
      }
    },
    clearTimeouts() {
      registry.timeouts.forEach(timeoutId => {
        this.clearTimeout(timeoutId);
      });
    },
    // Intervals
    setInterval(cb, interval) {
      for (var _len2 = arguments.length, params = new Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        params[_key2 - 2] = arguments[_key2];
      }
      const intervalId = setInterval(() => {
        registry.intervals.filter(id => id !== intervalId);
        cb.apply(null, params);
      }, interval, params);
      Log.info('Set Interval', 'ID: ' + intervalId);
      registry.intervals.push(intervalId);
      return intervalId;
    },
    clearInterval(intervalId) {
      if (registry.intervals.indexOf(intervalId) > -1) {
        registry.intervals = registry.intervals.filter(id => id !== intervalId);
        Log.info('Clear Interval', 'ID: ' + intervalId);
        clearInterval(intervalId);
      } else {
        Log.error('Clear Interval', 'ID ' + intervalId + ' not found');
      }
    },
    clearIntervals() {
      registry.intervals.forEach(intervalId => {
        this.clearInterval(intervalId);
      });
    },
    // Event listeners
    addEventListener(target, event, handler) {
      target.addEventListener(event, handler);
      const targetIndex = registry.targets.indexOf(target) > -1 ? registry.targets.indexOf(target) : registry.targets.push(target) - 1;
      registry.eventListeners[targetIndex] = registry.eventListeners[targetIndex] || {};
      registry.eventListeners[targetIndex][event] = registry.eventListeners[targetIndex][event] || [];
      registry.eventListeners[targetIndex][event].push(handler);
      Log.info('Add eventListener', 'Target:', target, 'Event: ' + event, 'Handler:', handler.toString());
    },
    removeEventListener(target, event, handler) {
      const targetIndex = registry.targets.indexOf(target);
      if (targetIndex > -1 && registry.eventListeners[targetIndex] && registry.eventListeners[targetIndex][event] && registry.eventListeners[targetIndex][event].indexOf(handler) > -1) {
        registry.eventListeners[targetIndex][event] = registry.eventListeners[targetIndex][event].filter(fn => fn !== handler);
        Log.info('Remove eventListener', 'Target:', target, 'Event: ' + event, 'Handler:', handler.toString());
        target.removeEventListener(event, handler);
      } else {
        Log.error('Remove eventListener', 'Not found', 'Target', target, 'Event: ' + event, 'Handler', handler.toString());
      }
    },
    // if `event` is omitted, removes all registered event listeners for target
    // if `target` is also omitted, removes all registered event listeners
    removeEventListeners(target, event) {
      if (target && event) {
        const targetIndex = registry.targets.indexOf(target);
        if (targetIndex > -1) {
          registry.eventListeners[targetIndex][event].forEach(handler => {
            this.removeEventListener(target, event, handler);
          });
        }
      } else if (target) {
        const targetIndex = registry.targets.indexOf(target);
        if (targetIndex > -1) {
          Object.keys(registry.eventListeners[targetIndex]).forEach(_event => {
            this.removeEventListeners(target, _event);
          });
        }
      } else {
        Object.keys(registry.eventListeners).forEach(targetIndex => {
          this.removeEventListeners(registry.targets[targetIndex]);
        });
      }
    },
    // Clear everything (to be called upon app close for proper cleanup)
    clear() {
      this.clearTimeouts();
      this.clearIntervals();
      this.removeEventListeners();
      registry.eventListeners = [];
      registry.timeouts = [];
      registry.intervals = [];
      registry.targets = [];
    }
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  const isObject$1 = v => {
    return typeof v === 'object' && v !== null;
  };
  const isString$1 = v => {
    return typeof v === 'string';
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  let colors = {
    white: '#ffffff',
    black: '#000000',
    red: '#ff0000',
    green: '#00ff00',
    blue: '#0000ff',
    yellow: '#feff00',
    cyan: '#00feff',
    magenta: '#ff00ff'
  };
  const normalizedColors = {
    //store for normalized colors
  };
  const addColors = (colorsToAdd, value) => {
    if (isObject$1(colorsToAdd)) {
      // clean up normalizedColors if they exist in the to be added colors
      Object.keys(colorsToAdd).forEach(color => cleanUpNormalizedColors(color));
      colors = Object.assign({}, colors, colorsToAdd);
    } else if (isString$1(colorsToAdd) && value) {
      cleanUpNormalizedColors(colorsToAdd);
      colors[colorsToAdd] = value;
    }
  };
  const cleanUpNormalizedColors = color => {
    for (let c in normalizedColors) {
      if (c.indexOf(color) > -1) {
        delete normalizedColors[c];
      }
    }
  };
  const initColors = file => {
    return new Promise((resolve, reject) => {
      if (typeof file === 'object') {
        addColors(file);
        resolve();
      }
      fetch(file).then(response => response.json()).then(json => {
        addColors(json);
        resolve();
      }).catch(() => {
        const error = 'Colors file ' + file + ' not found';
        Log.error(error);
        reject(error);
      });
    });
  };

  var version = "4.3.3";

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  let AppInstance;
  const defaultOptions = {
    stage: {
      w: 1920,
      h: 1080,
      clearColor: 0x00000000,
      canvas2d: false
    },
    debug: false,
    defaultFontFace: 'RobotoRegular',
    keys: {
      8: 'Back',
      13: 'Enter',
      27: 'Menu',
      37: 'Left',
      38: 'Up',
      39: 'Right',
      40: 'Down',
      174: 'ChannelDown',
      175: 'ChannelUp',
      178: 'Stop',
      250: 'PlayPause',
      191: 'Search',
      // Use "/" for keyboard
      409: 'Search'
    }
  };
  if (window.innerHeight === 720) {
    defaultOptions.stage['w'] = 1280;
    defaultOptions.stage['h'] = 720;
    defaultOptions.stage['precision'] = 0.6666666667;
  }
  function Application (App, appData, platformSettings) {
    return class Application extends Lightning.Application {
      constructor(options) {
        const config = cjs(defaultOptions, options);
        super(config);
        this.config = config;
      }
      static _template() {
        return {
          w: 1920,
          h: 1080
        };
      }
      _setup() {
        Promise.all([this.loadFonts(App.config && App.config.fonts || App.getFonts && App.getFonts() || []),
        // to be deprecated
        Locale$1.load(App.config && App.config.locale || App.getLocale && App.getLocale()), App.language && this.loadLanguage(App.language()), App.colors && this.loadColors(App.colors())]).then(() => {
          Metrics$1.app.loaded();
          AppInstance = this.stage.c({
            ref: 'App',
            type: App,
            zIndex: 1,
            forceZIndexContext: !!platformSettings.showVersion || !!platformSettings.showFps
          });
          this.childList.a(AppInstance);
          Log.info('App version', this.config.version);
          Log.info('SDK version', version);
          if (platformSettings.showVersion) {
            this.childList.a({
              ref: 'VersionLabel',
              type: VersionLabel,
              version: this.config.version,
              sdkVersion: version,
              zIndex: 1
            });
          }
          if (platformSettings.showFps) {
            this.childList.a({
              ref: 'FpsCounter',
              type: FpsIndicator,
              zIndex: 1
            });
          }
          super._setup();
        }).catch(console.error);
      }
      _handleBack() {
        this.closeApp();
      }
      _handleExit() {
        this.closeApp();
      }
      closeApp() {
        Log.info('Closing App');
        Settings.clearSubscribers();
        Registry.clear();
        if (platformSettings.onClose && typeof platformSettings.onClose === 'function') {
          platformSettings.onClose(...arguments);
        } else {
          this.close();
        }
      }
      close() {
        Log.info('Closing App');
        this.childList.remove(this.tag('App'));

        // force texture garbage collect
        this.stage.gc();
        this.destroy();
      }
      loadFonts(fonts) {
        return new Promise((resolve, reject) => {
          fonts.map(_ref => {
            let {
              family,
              url,
              urls,
              descriptors
            } = _ref;
            return () => {
              const src = urls ? urls.map(url => {
                return 'url(' + url + ')';
              }) : 'url(' + url + ')';
              const fontFace = new FontFace(family, src, descriptors || {});
              document.fonts.add(fontFace);
              return fontFace.load();
            };
          }).reduce((promise, method) => {
            return promise.then(() => method());
          }, Promise.resolve(null)).then(resolve).catch(reject);
        });
      }
      loadLanguage(config) {
        let file = Utils.asset('translations.json');
        let language = config;
        if (typeof language === 'object') {
          language = config.language || null;
          file = config.file || file;
        }
        return initLanguage(file, language);
      }
      loadColors(config) {
        let file = Utils.asset('colors.json');
        if (config && (typeof config === 'string' || typeof config === 'object')) {
          file = config;
        }
        return initColors(file);
      }
      set focus(v) {
        this._focussed = v;
        this._refocus();
      }
      _getFocused() {
        return this._focussed || this.tag('App');
      }
    };
  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /**
   * @type {Lightning.Application}
   */
  let application;

  /**
   * Actual instance of the app
   * @type {Lightning.Component}
   */
  let app;

  /**
   * Component that hosts all routed pages
   * @type {Lightning.Component}
   */
  let pagesHost;

  /**
   * @type {Lightning.Stage}
   */
  let stage;

  /**
   * Platform driven Router configuration
   * @type {Map<string>}
   */
  let routerConfig;

  /**
   * Component that hosts all attached widgets
   * @type {Lightning.Component}
   */
  let widgetsHost;

  /**
   * Hash we point the browser to when we boot the app
   * and there is no deep-link provided
   * @type {string|Function}
   */
  let rootHash;

  /**
   * Boot request will fire before app start
   * can be used to execute some global logic
   * and can be configured
   */
  let bootRequest;

  /**
   * Flag if we need to update the browser location hash.
   * Router can work without.
   * @type {boolean}
   */
  let updateHash = true;

  /**
   * Will be called before a route starts, can be overridden
   * via routes config
   * @param from - route we came from
   * @param to - route we navigate to
   * @returns {Promise<*>}
   */
  // eslint-disable-next-line
  let beforeEachRoute = async (from, to) => {
    return true;
  };

  /**
   *  * Will be called after a navigate successfully resolved,
   * can be overridden via routes config
   * @param request
   */
  let afterEachRoute = request => {};

  /**
   * All configured routes
   * @type {Map<string, object>}
   */
  let routes = new Map();

  /**
   * Store all page components per route
   * @type {Map<string, object>}
   */
  let components = new Map();

  /**
   * Flag if router has been initialised
   * @type {boolean}
   */
  let initialised = false;

  /**
   * Current page being rendered on screen
   * @type {null}
   */

  let activeHash;
  let activePage = null;
  let activeRoute;

  /**
   *  During the process of a navigation request a new
   *  request can start, to prevent unwanted behaviour
   *  the navigate()-method stores the last accepted hash
   *  so we can invalidate any prior requests
   */
  let lastAcceptedHash;

  /**
   * With on()-data providing behaviour the Router forced the App
   * in a Loading state. When the data-provider resolves we want to
   * change the state back to where we came from
   */
  let previousState;
  const mixin = app => {
    // by default the Router Baseclass provides the component
    // reference in which we store our pages
    if (app.pages) {
      pagesHost = app.pages.childList;
    }
    // if the app is using widgets we grab refs
    // and hide all the widgets
    if (app.widgets && app.widgets.children) {
      widgetsHost = app.widgets.childList;
      // hide all widgets on boot
      widgetsHost.forEach(w => w.visible = false);
    }
    app._handleBack = e => {
      step(-1);
      e.preventDefault();
    };
  };
  const bootRouter = (config, instance) => {
    let {
      appInstance,
      routes
    } = config;

    // if instance is provided and it's and Lightning Component instance
    if (instance && isPage(instance)) {
      app = instance;
    }
    if (!app) {
      app = appInstance || AppInstance;
    }
    application = app.application;
    pagesHost = application.childList;
    stage = app.stage;
    routerConfig = getConfigMap();
    mixin(app);
    if (isArray$1(routes)) {
      setup(config);
    } else if (isFunction$1(routes)) {
      console.warn('[Router]: Calling Router.route() directly is deprecated.');
      console.warn('Use object config: https://rdkcentral.github.io/Lightning-SDK/#/plugins/router/configuration');
    }
  };
  const setup = config => {
    if (!initialised) {
      init(config);
    }
    config.routes.forEach(r => {
      // strip leading slash
      const path = r.path.replace(/\/+$/, '');
      if (!routeExists(path)) {
        const route = createRoute(r);
        routes.set(path, route);
        // if route has a configured component property
        // we store it in a different map to simplify
        // the creating and destroying per route
        if (route.component) {
          let type = route.component;
          if (isComponentConstructor(type)) {
            if (!routerConfig.get('lazyCreate')) {
              type = createComponent(stage, type);
              pagesHost.a(type);
            }
          }
          components.set(path, type);
        }
      } else {
        console.error("".concat(path, " already exists in routes configuration"));
      }
    });
  };
  const init = config => {
    rootHash = config.root;
    if (isFunction$1(config.boot)) {
      bootRequest = config.boot;
    }
    if (isBoolean(config.updateHash)) {
      updateHash = config.updateHash;
    }
    if (isFunction$1(config.beforeEachRoute)) {
      beforeEachRoute = config.beforeEachRoute;
    }
    if (isFunction$1(config.afterEachRoute)) {
      afterEachRoute = config.afterEachRoute;
    }
    if (config.bootComponent) {
      console.warn('[Router]: Boot Component is now available as a special router: https://rdkcentral.github.io/Lightning-SDK/#/plugins/router/configuration?id=special-routes');
      console.warn('[Router]: setting { bootComponent } property will be deprecated in a future release');
      if (isPage(config.bootComponent)) {
        config.routes.push({
          path: '$',
          component: config.bootComponent,
          // we try to assign the bootRequest as after data-provider
          // so it will behave as any other component
          after: bootRequest || null,
          options: {
            preventStorage: true
          }
        });
      } else {
        console.error("[Router]: ".concat(config.bootComponent, " is not a valid boot component"));
      }
    }
    initialised = true;
  };
  const storeComponent = (route, type) => {
    if (components.has(route)) {
      components.set(route, type);
    }
  };
  const getComponent = route => {
    if (components.has(route)) {
      return components.get(route);
    }
    return null;
  };
  /**
   * Test if router needs to update browser location hash
   * @returns {boolean}
   */
  const mustUpdateLocationHash = () => {
    if (!routerConfig || !routerConfig.size) {
      return false;
    }
    // we need support to either turn change hash off
    // per platform or per app
    const updateConfig = routerConfig.get('updateHash');
    return !(isBoolean(updateConfig) && !updateConfig || isBoolean(updateHash) && !updateHash);
  };

  /**
   * Will be called when a new navigate() request has completed
   * and has not been expired due to it's async nature
   * @param request
   */
  const onRequestResolved = request => {
    const hash = request.hash;
    const route = request.route;
    const register = request.register;
    const page = request.page;

    // clean up history if modifier is set
    if (getOption(route.options, 'clearHistory')) {
      setHistory([]);
    } else if (hash && !isWildcard.test(route.path)) {
      updateHistory(request);
    }

    // we only update the stackLocation if a route
    // is not expired before it resolves
    storeComponent(route.path, page);
    if (request.isSharedInstance || !request.isCreated) {
      emit$1(page, 'changed');
    } else if (request.isCreated) {
      emit$1(page, 'mounted');
    }

    // only update widgets if we have a host
    if (widgetsHost) {
      updateWidgets(route.widgets, page);
    }

    // we want to clean up if there is an
    // active page that is not being shared
    // between current and previous route
    if (getActivePage() && !request.isSharedInstance) {
      cleanUp(activePage, request);
    }

    // provide history object to active page
    if (register.get(symbols.historyState) && isFunction$1(page.historyState)) {
      page.historyState(register.get(symbols.historyState));
    }
    setActivePage(page);
    activeHash = request.hash;
    activeRoute = route.path;

    // cleanup all cancelled requests
    for (let request of navigateQueue.values()) {
      if (request.isCancelled && request.hash) {
        navigateQueue.delete(request.hash);
      }
    }
    afterEachRoute(request);
    Log.info('[route]:', route.path);
    Log.info('[hash]:', hash);
  };
  const cleanUp = (page, request) => {
    const route = activeRoute;
    const register = request.register;
    const lazyDestroy = routerConfig.get('lazyDestroy');
    const destroyOnBack = routerConfig.get('destroyOnHistoryBack');
    const keepAlive = register.get('keepAlive');
    const isFromHistory = register.get(symbols.backtrack);
    let doCleanup = false;
    if (isFromHistory && (destroyOnBack || lazyDestroy)) {
      doCleanup = true;
    } else if (lazyDestroy && !keepAlive) {
      doCleanup = true;
    }
    if (doCleanup) {
      // grab original class constructor if
      // statemachine routed else store constructor
      storeComponent(route, page._routedType || page.constructor);

      // actual remove of page from memory
      pagesHost.remove(page);

      // force texture gc() if configured
      // so we can cleanup textures in the same tick
      if (routerConfig.get('gcOnUnload')) {
        stage.gc();
      }
    } else {
      // If we're not removing the page we need to
      // reset it's properties
      page.patch({
        x: 0,
        y: 0,
        scale: 1,
        alpha: 1,
        visible: false
      });
    }
  };
  const getActiveHash = () => {
    return activeHash;
  };
  const setActivePage = page => {
    activePage = page;
  };
  const getActivePage = () => {
    return activePage;
  };
  const getActiveRoute = () => {
    return activeRoute;
  };
  const getLastHash = () => {
    return lastAcceptedHash;
  };
  const setLastHash = hash => {
    lastAcceptedHash = hash;
  };
  const getPreviousState = () => {
    return previousState;
  };
  const routeExists = key => {
    return routes.has(key);
  };
  const getRootHash = () => {
    return rootHash;
  };
  const getBootRequest = () => {
    return bootRequest;
  };
  const getRouterConfig = () => {
    return routerConfig;
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  const types = {
    on: request => {
      app.state || '';
      app._setState('Loading');
      return execProvider(request);
    },
    before: request => {
      return execProvider(request);
    },
    after: request => {
      try {
        execProvider(request, true);
      } catch (e) {
        // for now we fail silently
      }
      return Promise.resolve();
    },
    // on route share instance
    shared: request => {
      return execProvider(request);
    }
  };
  const execProvider = (request, emitProvided) => {
    const route = request.route;
    const provider = route.provider;
    const expires = route.cache ? route.cache * 1000 : 0;
    const params = addPersistData(request);
    return provider.request(request.page, {
      ...params
    }).then(() => {
      request.page[symbols.expires] = Date.now() + expires;
      if (emitProvided) {
        emit$1(request.page, 'dataProvided');
      }
    });
  };
  const addPersistData = _ref => {
    let {
      page,
      route,
      hash,
      register = new Map()
    } = _ref;
    const urlValues = getValuesFromHash(hash, route.path);
    const queryParams = getQueryStringParams(hash);
    const pageData = new Map([...urlValues, ...register]);
    const params = {};

    // make dynamic url data available to the page
    // as instance properties
    for (let [name, value] of pageData) {
      params[name] = value;
    }
    if (queryParams) {
      params[symbols.queryParams] = queryParams;
    }

    // check navigation register for persistent data
    if (register.size) {
      const obj = {};
      for (let [k, v] of register) {
        obj[k] = v;
      }
      page.persist = obj;
    }

    // make url data and persist data available
    // via params property
    page.params = params;
    emit$1(page, ['urlParams'], params);
    return params;
  };

  /**
   * Test if page passed cache-time
   * @param page
   * @returns {boolean}
   */
  const isPageExpired = page => {
    if (!page[symbols.expires]) {
      return false;
    }
    const expires = page[symbols.expires];
    const now = Date.now();
    return now >= expires;
  };
  const hasProvider = path => {
    if (routeExists(path)) {
      const record = routes.get(path);
      return !!record.provider;
    }
    return false;
  };
  const getProvider = route => {
    // @todo: fix, route already is passed in
    if (routeExists(route.path)) {
      const {
        provider
      } = routes.get(route.path);
      return {
        type: provider.type,
        provider: provider.request
      };
    }
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  const fade = (i, o) => {
    return new Promise(resolve => {
      i.patch({
        alpha: 0,
        visible: true,
        smooth: {
          alpha: [1, {
            duration: 0.5,
            delay: 0.1
          }]
        }
      });
      // resolve on y finish
      i.transition('alpha').on('finish', () => {
        if (o) {
          o.visible = false;
        }
        resolve();
      });
    });
  };
  const crossFade = (i, o) => {
    return new Promise(resolve => {
      i.patch({
        alpha: 0,
        visible: true,
        smooth: {
          alpha: [1, {
            duration: 0.5,
            delay: 0.1
          }]
        }
      });
      if (o) {
        o.patch({
          smooth: {
            alpha: [0, {
              duration: 0.5,
              delay: 0.3
            }]
          }
        });
      }
      // resolve on y finish
      i.transition('alpha').on('finish', () => {
        resolve();
      });
    });
  };
  const moveOnAxes = (axis, direction, i, o) => {
    const bounds = axis === 'x' ? 1920 : 1080;
    return new Promise(resolve => {
      i.patch({
        ["".concat(axis)]: direction ? bounds * -1 : bounds,
        visible: true,
        smooth: {
          ["".concat(axis)]: [0, {
            duration: 0.4,
            delay: 0.2
          }]
        }
      });
      // out is optional
      if (o) {
        o.patch({
          ["".concat(axis)]: 0,
          smooth: {
            ["".concat(axis)]: [direction ? bounds : bounds * -1, {
              duration: 0.4,
              delay: 0.2
            }]
          }
        });
      }
      // resolve on y finish
      i.transition(axis).on('finish', () => {
        resolve();
      });
    });
  };
  const up = (i, o) => {
    return moveOnAxes('y', 0, i, o);
  };
  const down = (i, o) => {
    return moveOnAxes('y', 1, i, o);
  };
  const left = (i, o) => {
    return moveOnAxes('x', 0, i, o);
  };
  const right = (i, o) => {
    return moveOnAxes('x', 1, i, o);
  };
  var Transitions = {
    fade,
    crossFade,
    up,
    down,
    left,
    right
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /**
   * execute transition between new / old page and
   * toggle the defined widgets
   * @todo: platform override default transition
   * @param pageIn
   * @param pageOut
   */
  const executeTransition = function (pageIn) {
    let pageOut = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    const transition = pageIn.pageTransition || pageIn.easing;
    const hasCustomTransitions = !!(pageIn.smoothIn || pageIn.smoothInOut || transition);
    const transitionsDisabled = getRouterConfig().get('disableTransitions');
    if (pageIn.easing) {
      console.warn('easing() method is deprecated and will be removed. Use pageTransition()');
    }

    // default behaviour is a visibility toggle
    if (!hasCustomTransitions || transitionsDisabled) {
      pageIn.visible = true;
      if (pageOut) {
        pageOut.visible = false;
      }
      return Promise.resolve();
    }
    if (transition) {
      let type;
      try {
        type = transition.call(pageIn, pageIn, pageOut);
      } catch (e) {
        type = 'crossFade';
      }
      if (isPromise(type)) {
        return type;
      }
      if (isString$2(type)) {
        const fn = Transitions[type];
        if (fn) {
          return fn(pageIn, pageOut);
        }
      }

      // keep backwards compatible for now
      if (pageIn.smoothIn) {
        // provide a smooth function that resolves itself
        // on transition finish
        const smooth = function (p, v) {
          let args = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
          return new Promise(resolve => {
            pageIn.visible = true;
            pageIn.setSmooth(p, v, args);
            pageIn.transition(p).on('finish', () => {
              resolve();
            });
          });
        };
        return pageIn.smoothIn({
          pageIn,
          smooth
        });
      }
    }
    return Transitions.crossFade(pageIn, pageOut);
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /**
   * The actual loading of the component
   * */
  const load = async request => {
    let expired = false;
    try {
      request = await loader$1(request);
      if (request && !request.isCancelled) {
        // in case of on() providing we need to reset
        // app state;
        if (app.state === 'Loading') {
          if (getPreviousState() === 'Widgets') ; else {
            app._setState('');
          }
        }
        // Do page transition if instance
        // is not shared between the routes
        if (!request.isSharedInstance && !request.isCancelled) {
          await executeTransition(request.page, getActivePage());
        }
      } else {
        expired = true;
      }
      // on expired we only cleanup
      if (expired || request.isCancelled) {
        Log.debug('[router]:', "Rejected ".concat(request.hash, " because route to ").concat(getLastHash(), " started"));
        if (request.isCreated && !request.isSharedInstance) {
          // remove from render-tree
          pagesHost.remove(request.page);
        }
      } else {
        onRequestResolved(request);
        // resolve promise
        return request.page;
      }
    } catch (request) {
      if (!request.route) {
        console.error(request);
      } else if (!expired) {
        // @todo: revisit
        const {
          route
        } = request;
        // clean up history if modifier is set
        if (getOption(route.options, 'clearHistory')) {
          setHistory([]);
        } else if (!isWildcard.test(route.path)) {
          updateHistory(request);
        }
        if (request.isCreated && !request.isSharedInstance) {
          // remove from render-tree
          pagesHost.remove(request.page);
        }
        handleError(request);
      }
    }
  };
  const loader$1 = async request => {
    const route = request.route;
    const hash = request.hash;
    const register = request.register;

    // todo: grab from Route instance
    let type = getComponent(route.path);
    let isConstruct = isComponentConstructor(type);
    let provide = false;

    // if it's an instance bt we're not coming back from
    // history we test if we can re-use this instance
    if (!isConstruct && !register.get(symbols.backtrack)) {
      if (!mustReuse(route)) {
        type = type.constructor;
        isConstruct = true;
      }
    }

    // If type is not a constructor
    if (!isConstruct) {
      request.page = type;
      // if we have have a data route for current page
      if (hasProvider(route.path)) {
        if (isPageExpired(type) || type[symbols.hash] !== hash) {
          provide = true;
        }
      }
      let currentRoute = getActivePage() && getActivePage()[symbols.route];
      // if the new route is equal to the current route it means that both
      // route share the Component instance and stack location / since this case
      // is conflicting with the way before() and after() loading works we flag it,
      // and check platform settings in we want to re-use instance
      if (route.path === currentRoute) {
        request.isSharedInstance = true;
      }
    } else {
      request.page = createComponent(stage, type);
      pagesHost.a(request.page);
      // test if need to request data provider
      if (hasProvider(route.path)) {
        provide = true;
      }
      request.isCreated = true;
    }

    // we store hash and route as properties on the page instance
    // that way we can easily calculate new behaviour on page reload
    request.page[symbols.hash] = hash;
    request.page[symbols.route] = route.path;
    try {
      if (provide) {
        // extract attached data-provider for route
        // we're processing
        const {
          type: loadType,
          provider
        } = getProvider(route);

        // update running request
        request.provider = provider;
        request.providerType = loadType;
        await types[request.isSharedInstance ? 'shared' : loadType](request);

        // we early exit if the current request is expired
        if (hash !== getLastHash()) {
          return false;
        } else {
          if (request.providerType !== 'after') {
            emit$1(request.page, 'dataProvided');
          }
          // resolve promise
          return request;
        }
      } else {
        addPersistData(request);
        return request;
      }
    } catch (e) {
      request.error = e;
      return Promise.reject(request);
    }
  };
  const handleError = request => {
    if (request && request.error) {
      console.error(request.error);
    } else if (request) {
      Log.error(request);
    }
    if (request.page && routeExists('!')) {
      navigate('!', {
        request
      }, false);
    }
  };
  const mustReuse = route => {
    const opt = getOption(route.options, 'reuseInstance');
    const config = routerConfig.get('reuseInstance');

    // route always has final decision
    if (isBoolean(opt)) {
      return opt;
    }
    return !(isBoolean(config) && config === false);
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  class RoutedApp extends Lightning.Component {
    static _template() {
      return {
        Pages: {
          forceZIndexContext: true
        },
        /**
         * This is a default Loading page that will be made visible
         * during data-provider on() you CAN override in child-class
         */
        Loading: {
          rect: true,
          w: 1920,
          h: 1080,
          color: 0xff000000,
          visible: false,
          zIndex: 99,
          Label: {
            mount: 0.5,
            x: 960,
            y: 540,
            text: {
              text: 'Loading..'
            }
          }
        }
      };
    }
    static _states() {
      return [class Loading extends this {
        $enter() {
          this.tag('Loading').visible = true;
        }
        $exit() {
          this.tag('Loading').visible = false;
        }
      }, class Widgets extends this {
        $enter(args, widget) {
          // store widget reference
          this._widget = widget;

          // since it's possible that this behaviour
          // is non-remote driven we force a recalculation
          // of the focuspath
          this._refocus();
        }
        _getFocused() {
          // we delegate focus to selected widget
          // so it can consume remotecontrol presses
          return this._widget;
        }

        // if we want to widget to widget focus delegation
        reload(widget) {
          this._widget = widget;
          this._refocus();
        }
        _handleKey() {
          const restoreFocus = routerConfig.get('autoRestoreRemote');
          /**
           * The Router used to delegate focus back to the page instance on
           * every unhandled key. This is barely usefull in any situation
           * so for now we offer the option to explicity turn that behaviour off
           * so we don't don't introduce a breaking change.
           */
          if (!isBoolean(restoreFocus) || restoreFocus === true) {
            Router.focusPage();
          }
        }
      }];
    }

    /**
     * Return location where pages need to be stored
     */
    get pages() {
      return this.tag('Pages');
    }

    /**
     * Tell router where widgets are stored
     */
    get widgets() {
      return this.tag('Widgets');
    }

    /**
     * we MUST register _handleBack method so the Router
     * can override it
     * @private
     */
    _handleBack() {}

    /**
     * We MUST return Router.activePage() so the new Page
     * can listen to the remote-control.
     */
    _getFocused() {
      return Router.getActivePage();
    }
  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /*
  rouThor ==[x]
   */
  let navigateQueue = new Map();
  let forcedHash = '';
  let resumeHash = '';

  /**
   * Start routing the app
   * @param config - route config object
   * @param instance - instance of the app
   */
  const startRouter = (config, instance) => {
    bootRouter(config, instance);
    registerListener();
    start();
  };

  // start translating url
  const start = () => {
    let hash = (getHash() || '').replace(/^#/, '');
    const bootKey = '$';
    const params = getQueryStringParams(hash);
    const bootRequest = getBootRequest();
    const rootHash = getRootHash();
    const isDirectLoad = hash.indexOf(bootKey) !== -1;

    // prevent direct reload of wildcard routes
    // expect bootComponent
    if (isWildcard.test(hash) && hash !== bootKey) {
      hash = '';
    }

    // store resume point for manual resume
    resumeHash = isDirectLoad ? rootHash : hash || rootHash;
    const ready = () => {
      if (!hash && rootHash) {
        if (isString$2(rootHash)) {
          navigate(rootHash);
        } else if (isFunction$1(rootHash)) {
          rootHash().then(res => {
            if (isObject$2(res)) {
              navigate(res.path, res.params);
            } else {
              navigate(res);
            }
          });
        }
      } else {
        queue(hash);
        handleHashChange().then(() => {
          app._refocus();
        }).catch(e => {
          console.error(e);
        });
      }
    };
    if (routeExists(bootKey)) {
      navigate(bootKey, {
        resume: resumeHash,
        reload: bootKey === hash
      }, false);
    } else if (isFunction$1(bootRequest)) {
      bootRequest(params).then(() => {
        ready();
      }).catch(e => {
        handleBootError(e);
      });
    } else {
      ready();
    }
  };
  const handleBootError = e => {
    if (routeExists('!')) {
      navigate('!', {
        request: {
          error: e
        }
      });
    } else {
      console.error(e);
    }
  };

  /**
   * start a new request
   * @param url
   * @param args
   * @param store
   */
  const navigate = function (url) {
    let args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let store = arguments.length > 2 ? arguments[2] : undefined;
    if (isObject$2(url)) {
      url = getHashByName(url);
      if (!url) {
        return;
      }
    }
    let hash = getHash();
    if (!mustUpdateLocationHash() && forcedHash) {
      hash = forcedHash;
    }
    if (hash.replace(/^#/, '') !== url) {
      // push request in the queue
      queue(url, args, store);
      setHash(url);
      if (!mustUpdateLocationHash()) {
        forcedHash = url;
        handleHashChange(url).then(() => {
          app._refocus();
        }).catch(e => {
          console.error(e);
        });
      }
    } else if (args.reload) {
      // push request in the queue
      queue(url, args, store);
      handleHashChange(url).then(() => {
        app._refocus();
      }).catch(e => {
        console.error(e);
      });
    }
  };
  const queue = function (hash) {
    let args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let store = arguments.length > 2 ? arguments[2] : undefined;
    hash = hash.replace(/^#/, '');
    if (!navigateQueue.has(hash)) {
      for (let request of navigateQueue.values()) {
        request.cancel();
      }
      const request = createRequest(hash, args, store);
      navigateQueue.set(decodeURIComponent(hash), request);
      return request;
    }
    return false;
  };

  /**
   * Handle change of hash
   * @param override
   * @returns {Promise<void>}
   */
  const handleHashChange = async override => {
    const hash = (override || getHash()).replace(/^#/, '');
    const queueId = decodeURIComponent(hash);
    let request = navigateQueue.get(queueId);

    // handle hash updated manually
    if (!request && !navigateQueue.size) {
      request = queue(hash);
    }
    const route = getRouteByHash(hash);
    if (!route) {
      if (routeExists('*')) {
        navigate('*', {
          failedHash: hash
        });
      } else {
        console.error("Unable to navigate to: ".concat(hash));
      }
      return;
    }

    // update current processed request
    request.hash = hash;
    request.route = route;
    let result = await beforeEachRoute(getActiveHash(), request);

    // test if a local hook is configured for the route
    if (route.beforeNavigate) {
      result = await route.beforeNavigate(getActiveHash(), request);
    }
    if (isBoolean(result)) {
      // only if resolve value is explicitly true
      // we continue the current route request
      if (result) {
        return resolveHashChange(request);
      }
    } else {
      // if navigation guard didn't return true
      // we cancel the current request
      request.cancel();
      navigateQueue.delete(queueId);
      if (isString$2(result)) {
        navigate(result);
      } else if (isObject$2(result)) {
        let store = true;
        if (isBoolean(result.store)) {
          store = result.store;
        }
        navigate(result.path, result.params, store);
      }
    }
  };

  /**
   * Continue processing the hash change if not blocked
   * by global or local hook
   * @param request - {}
   */
  const resolveHashChange = request => {
    const hash = request.hash;
    const route = request.route;
    const queueId = decodeURIComponent(hash);
    // store last requested hash so we can
    // prevent a route that resolved later
    // from displaying itself
    setLastHash(hash);
    if (route.path) {
      const component = getComponent(route.path);
      // if a hook is provided for the current route
      if (isFunction$1(route.hook)) {
        const urlParams = getValuesFromHash(hash, route.path);
        const params = {};
        for (const key of urlParams.keys()) {
          params[key] = urlParams.get(key);
        }
        route.hook(app, {
          ...params
        });
      }
      // if there is a component attached to the route
      if (component) {
        if (isPage(component)) {
          load(request).then(() => {
            app._refocus();
            navigateQueue.delete(queueId);
          });
        } else {
          // of the component is not a constructor
          // or a Component instance we can assume
          // that it's a dynamic import
          component().then(contents => {
            return contents.default;
          }).then(module => {
            storeComponent(route.path, module);
            return load(request);
          }).then(() => {
            app._refocus();
            navigateQueue.delete(queueId);
          });
        }
      } else {
        navigateQueue.delete(queueId);
      }
    }
  };

  /**
   * Directional step in history
   * @param direction
   */
  const step = function () {
    let level = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    if (!level || isNaN(level)) {
      return false;
    }
    const history = getHistory();
    // for now we only support negative numbers
    level = Math.abs(level);

    // we can't step back past the amount
    // of history entries
    if (level > history.length) {
      if (isFunction$1(app._handleAppClose)) {
        return app._handleAppClose();
      }
      return false;
    } else if (history.length) {
      // for now we only support history back
      const route = history.splice(history.length - level, level)[0];
      // store changed history
      setHistory(history);
      return navigate(route.hash, {
        [symbols.backtrack]: true,
        [symbols.historyState]: route.state
      }, false);
    } else if (routerConfig.get('backtrack')) {
      const hashLastPart = /(\/:?[\w%\s-]+)$/;
      let hash = stripRegex(getHash());
      let floor = getFloor(hash);

      // test if we got deep-linked
      if (floor > 1) {
        while (floor--) {
          // strip of last part
          hash = hash.replace(hashLastPart, '');
          // if we have a configured route
          // we navigate to it
          if (getRouteByHash(hash)) {
            return navigate(hash, {
              [symbols.backtrack]: true
            }, false);
          }
        }
      }
    }
    return false;
  };

  /**
   * Resume Router's page loading process after
   * the BootComponent became visible;
   */
  const resume = () => {
    if (isString$2(resumeHash)) {
      navigate(resumeHash, false);
    } else if (isFunction$1(resumeHash)) {
      resumeHash().then(res => {
        if (isObject$2(res)) {
          navigate(res.path, res.params);
        } else {
          navigate(res);
        }
      });
    } else {
      console.warn('[Router]: resume() called but no hash found');
    }
  };

  /**
   * Query if the Router is still processing a Request
   * @returns {boolean}
   */
  const isNavigating = () => {
    if (navigateQueue.size) {
      let isProcessing = false;
      for (let request of navigateQueue.values()) {
        if (!request.isCancelled) {
          isProcessing = true;
        }
      }
      return isProcessing;
    }
    return false;
  };

  /**
   * By default we return the location hash
   * @returns {string}
   */
  let getHash = () => {
    return document.location.hash;
  };

  /**
   * Update location hash
   * @param url
   */
  let setHash = url => {
    document.location.hash = url;
  };

  /**
   * This can be called from the platform / bootstrapper to override
   * the default getting and setting of the hash
   * @param config
   */
  const initRouter = config => {
    if (config.getHash) {
      getHash = config.getHash;
    }
    if (config.setHash) {
      setHash = config.setHash;
    }
  };

  /**
   * On hash change we start processing
   */
  const registerListener = () => {
    Registry.addEventListener(window, 'hashchange', async () => {
      if (mustUpdateLocationHash()) {
        try {
          await handleHashChange();
        } catch (e) {
          console.error(e);
        }
      }
    });
  };
  // export API
  var Router = {
    startRouter,
    navigate,
    resume,
    step,
    go: step,
    back: step.bind(null, -1),
    activePage: getActivePage,
    getActivePage() {
      // warning
      return getActivePage();
    },
    getActiveRoute,
    getActiveHash,
    focusWidget,
    getActiveWidget,
    restoreFocus,
    isNavigating,
    getHistory,
    setHistory,
    getHistoryState,
    replaceHistoryState,
    symbols,
    App: RoutedApp,
    // keep backwards compatible
    focusPage: restoreFocus,
    /**
     * Deprecated api methods
     */
    setupRoutes() {
      console.warn('Router: setupRoutes is deprecated, consolidate your configuration');
      console.warn('https://rdkcentral.github.io/Lightning-SDK/#/plugins/router/configuration');
    },
    on() {
      console.warn('Router.on() is deprecated, consolidate your configuration');
      console.warn('https://rdkcentral.github.io/Lightning-SDK/#/plugins/router/configuration');
    },
    before() {
      console.warn('Router.before() is deprecated, consolidate your configuration');
      console.warn('https://rdkcentral.github.io/Lightning-SDK/#/plugins/router/configuration');
    },
    after() {
      console.warn('Router.after() is deprecated, consolidate your configuration');
      console.warn('https://rdkcentral.github.io/Lightning-SDK/#/plugins/router/configuration');
    }
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  const defaultChannels = [{
    number: 1,
    name: 'Metro News 1',
    description: 'New York Cable News Channel',
    entitled: true,
    program: {
      title: 'The Morning Show',
      description: "New York's best morning show",
      startTime: new Date(new Date() - 60 * 5 * 1000).toUTCString(),
      // started 5 minutes ago
      duration: 60 * 30,
      // 30 minutes
      ageRating: 0
    }
  }, {
    number: 2,
    name: 'MTV',
    description: 'Music Television',
    entitled: true,
    program: {
      title: 'Beavis and Butthead',
      description: 'American adult animated sitcom created by Mike Judge',
      startTime: new Date(new Date() - 60 * 20 * 1000).toUTCString(),
      // started 20 minutes ago
      duration: 60 * 45,
      // 45 minutes
      ageRating: 18
    }
  }, {
    number: 3,
    name: 'NBC',
    description: 'NBC TV Network',
    entitled: false,
    program: {
      title: 'The Tonight Show Starring Jimmy Fallon',
      description: 'Late-night talk show hosted by Jimmy Fallon on NBC',
      startTime: new Date(new Date() - 60 * 10 * 1000).toUTCString(),
      // started 10 minutes ago
      duration: 60 * 60,
      // 1 hour
      ageRating: 10
    }
  }];
  const channels = () => Settings.get('platform', 'tv', defaultChannels);
  const randomChannel = () => channels()[~~(channels.length * Math.random())];

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  let currentChannel;
  const callbacks = {};
  const emit = function (event) {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }
    callbacks[event] && callbacks[event].forEach(cb => {
      cb.apply(null, args);
    });
  };

  // local mock methods
  let methods = {
    getChannel() {
      if (!currentChannel) currentChannel = randomChannel();
      return new Promise((resolve, reject) => {
        if (currentChannel) {
          const channel = {
            ...currentChannel
          };
          delete channel.program;
          resolve(channel);
        } else {
          reject('No channel found');
        }
      });
    },
    getProgram() {
      if (!currentChannel) currentChannel = randomChannel();
      return new Promise((resolve, reject) => {
        currentChannel.program ? resolve(currentChannel.program) : reject('No program found');
      });
    },
    setChannel(number) {
      return new Promise((resolve, reject) => {
        if (number) {
          const newChannel = channels().find(c => c.number === number);
          if (newChannel) {
            currentChannel = newChannel;
            const channel = {
              ...currentChannel
            };
            delete channel.program;
            emit('channelChange', channel);
            resolve(channel);
          } else {
            reject('Channel not found');
          }
        } else {
          reject('No channel number supplied');
        }
      });
    }
  };
  const initTV = config => {
    methods = {};
    if (config.getChannel && typeof config.getChannel === 'function') {
      methods.getChannel = config.getChannel;
    }
    if (config.getProgram && typeof config.getProgram === 'function') {
      methods.getProgram = config.getProgram;
    }
    if (config.setChannel && typeof config.setChannel === 'function') {
      methods.setChannel = config.setChannel;
    }
    if (config.emit && typeof config.emit === 'function') {
      config.emit(emit);
    }
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  const initPurchase = config => {
    if (config.billingUrl) config.billingUrl;
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  let ApplicationInstance;
  var Launch = ((App, appSettings, platformSettings, appData) => {
    initSettings(appSettings, platformSettings);
    initUtils(platformSettings);
    initStorage();
    // Initialize plugins
    if (platformSettings.plugins) {
      platformSettings.plugins.profile && initProfile(platformSettings.plugins.profile);
      platformSettings.plugins.metrics && initMetrics(platformSettings.plugins.metrics);
      platformSettings.plugins.mediaPlayer && initMediaPlayer(platformSettings.plugins.mediaPlayer);
      platformSettings.plugins.mediaPlayer && initVideoPlayer(platformSettings.plugins.mediaPlayer);
      platformSettings.plugins.ads && initAds(platformSettings.plugins.ads);
      platformSettings.plugins.router && initRouter(platformSettings.plugins.router);
      platformSettings.plugins.tv && initTV(platformSettings.plugins.tv);
      platformSettings.plugins.purchase && initPurchase(platformSettings.plugins.purchase);
    }
    const app = Application(App, appData, platformSettings);
    ApplicationInstance = new app(appSettings);
    return ApplicationInstance;
  });

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  class VideoTexture extends Lightning.Component {
    static _template() {
      return {
        Video: {
          alpha: 1,
          visible: false,
          pivot: 0.5,
          texture: {
            type: Lightning.textures.StaticTexture,
            options: {}
          }
        }
      };
    }
    set videoEl(v) {
      this._videoEl = v;
    }
    get videoEl() {
      return this._videoEl;
    }
    get videoView() {
      return this.tag('Video');
    }
    get videoTexture() {
      return this.videoView.texture;
    }
    get isVisible() {
      return this.videoView.alpha === 1 && this.videoView.visible === true;
    }
    _init() {
      this._createVideoTexture();
    }
    _createVideoTexture() {
      const stage = this.stage;
      const gl = stage.gl;
      const glTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, glTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      this.videoTexture.options = {
        source: glTexture,
        w: this.videoEl.width,
        h: this.videoEl.height
      };
      this.videoView.w = this.videoEl.width / this.stage.getRenderPrecision();
      this.videoView.h = this.videoEl.height / this.stage.getRenderPrecision();
    }
    start() {
      const stage = this.stage;
      if (!this._updateVideoTexture) {
        this._updateVideoTexture = () => {
          if (this.videoTexture.options.source && this.videoEl.videoWidth && this.active) {
            const gl = stage.gl;
            const currentTime = new Date().getTime();

            // When BR2_PACKAGE_GST1_PLUGINS_BAD_PLUGIN_DEBUGUTILS is not set in WPE, webkitDecodedFrameCount will not be available.
            // We'll fallback to fixed 30fps in this case.
            const frameCount = this.videoEl.webkitDecodedFrameCount;
            const mustUpdate = frameCount ? this._lastFrame !== frameCount : this._lastTime < currentTime - 30;
            if (mustUpdate) {
              this._lastTime = currentTime;
              this._lastFrame = frameCount;
              try {
                gl.bindTexture(gl.TEXTURE_2D, this.videoTexture.options.source);
                gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.videoEl);
                this._lastFrame = this.videoEl.webkitDecodedFrameCount;
                this.videoView.visible = true;
                this.videoTexture.options.w = this.videoEl.width;
                this.videoTexture.options.h = this.videoEl.height;
                const expectedAspectRatio = this.videoView.w / this.videoView.h;
                const realAspectRatio = this.videoEl.width / this.videoEl.height;
                if (expectedAspectRatio > realAspectRatio) {
                  this.videoView.scaleX = realAspectRatio / expectedAspectRatio;
                  this.videoView.scaleY = 1;
                } else {
                  this.videoView.scaleY = expectedAspectRatio / realAspectRatio;
                  this.videoView.scaleX = 1;
                }
              } catch (e) {
                Log.error('texImage2d video', e);
                this.stop();
              }
              this.videoTexture.source.forceRenderUpdate();
            }
          }
        };
      }
      if (!this._updatingVideoTexture) {
        stage.on('frameStart', this._updateVideoTexture);
        this._updatingVideoTexture = true;
      }
    }
    stop() {
      const stage = this.stage;
      stage.removeListener('frameStart', this._updateVideoTexture);
      this._updatingVideoTexture = false;
      this.videoView.visible = false;
      if (this.videoTexture.options.source) {
        const gl = stage.gl;
        gl.bindTexture(gl.TEXTURE_2D, this.videoTexture.options.source);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
    }
    position(top, left) {
      this.videoView.patch({
        smooth: {
          x: left,
          y: top
        }
      });
    }
    size(width, height) {
      this.videoView.patch({
        smooth: {
          w: width,
          h: height
        }
      });
    }
    show() {
      this.videoView.setSmooth('alpha', 1);
    }
    hide() {
      this.videoView.setSmooth('alpha', 0);
    }
  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  let mediaUrl = url => url;
  let videoEl;
  let videoTexture;
  let metrics;
  let consumer$1;
  let precision = 1;
  let textureMode = false;
  const initVideoPlayer = config => {
    if (config.mediaUrl) {
      mediaUrl = config.mediaUrl;
    }
  };

  // todo: add this in a 'Registry' plugin
  // to be able to always clean this up on app close
  let eventHandlers = {};
  const state$1 = {
    adsEnabled: false,
    playing: false,
    _playingAds: false,
    get playingAds() {
      return this._playingAds;
    },
    set playingAds(val) {
      if (this._playingAds !== val) {
        this._playingAds = val;
        fireOnConsumer$1(val === true ? 'AdStart' : 'AdEnd');
      }
    },
    skipTime: false,
    playAfterSeek: null
  };
  const hooks = {
    play() {
      state$1.playing = true;
    },
    pause() {
      state$1.playing = false;
    },
    seeked() {
      state$1.playAfterSeek === true && videoPlayerPlugin.play();
      state$1.playAfterSeek = null;
    },
    abort() {
      deregisterEventListeners();
    }
  };
  const withPrecision = val => Math.round(precision * val) + 'px';
  const fireOnConsumer$1 = (event, args) => {
    if (consumer$1) {
      consumer$1.fire('$videoPlayer' + event, args, videoEl.currentTime);
      consumer$1.fire('$videoPlayerEvent', event, args, videoEl.currentTime);
    }
  };
  const fireHook = (event, args) => {
    hooks[event] && typeof hooks[event] === 'function' && hooks[event].call(null, event, args);
  };
  let customLoader = null;
  let customUnloader = null;
  const loader = (url, videoEl, config) => {
    return customLoader && typeof customLoader === 'function' ? customLoader(url, videoEl, config) : new Promise(resolve => {
      url = mediaUrl(url);
      videoEl.setAttribute('src', url);
      videoEl.load();
      resolve();
    });
  };
  const unloader = videoEl => {
    return customUnloader && typeof customUnloader === 'function' ? customUnloader(videoEl) : new Promise(resolve => {
      videoEl.removeAttribute('src');
      videoEl.load();
      resolve();
    });
  };
  const setupVideoTag = () => {
    const videoEls = document.getElementsByTagName('video');
    if (videoEls && videoEls.length) {
      return videoEls[0];
    } else {
      const videoEl = document.createElement('video');
      videoEl.setAttribute('id', 'video-player');
      videoEl.setAttribute('width', withPrecision(1920));
      videoEl.setAttribute('height', withPrecision(1080));
      videoEl.style.position = 'absolute';
      videoEl.style.zIndex = '1';
      videoEl.style.display = 'none';
      videoEl.style.visibility = 'hidden';
      videoEl.style.top = withPrecision(0);
      videoEl.style.left = withPrecision(0);
      videoEl.style.width = withPrecision(1920);
      videoEl.style.height = withPrecision(1080);
      document.body.appendChild(videoEl);
      return videoEl;
    }
  };
  const setUpVideoTexture = () => {
    if (!ApplicationInstance.tag('VideoTexture')) {
      const el = ApplicationInstance.stage.c({
        type: VideoTexture,
        ref: 'VideoTexture',
        zIndex: 0,
        videoEl
      });
      ApplicationInstance.childList.addAt(el, 0);
    }
    return ApplicationInstance.tag('VideoTexture');
  };
  const registerEventListeners = () => {
    Log.info('VideoPlayer', 'Registering event listeners');
    Object.keys(events$1).forEach(event => {
      const handler = e => {
        // Fire a metric for each event (if it exists on the metrics object)
        if (metrics && metrics[event] && typeof metrics[event] === 'function') {
          metrics[event]({
            currentTime: videoEl.currentTime
          });
        }
        // fire an internal hook
        fireHook(event, {
          videoElement: videoEl,
          event: e
        });

        // fire the event (with human friendly event name) to the consumer of the VideoPlayer
        fireOnConsumer$1(events$1[event], {
          videoElement: videoEl,
          event: e
        });
      };
      eventHandlers[event] = handler;
      videoEl.addEventListener(event, handler);
    });
  };
  const deregisterEventListeners = () => {
    Log.info('VideoPlayer', 'Deregistering event listeners');
    Object.keys(eventHandlers).forEach(event => {
      videoEl.removeEventListener(event, eventHandlers[event]);
    });
    eventHandlers = {};
  };
  const videoPlayerPlugin = {
    consumer(component) {
      consumer$1 = component;
    },
    loader(loaderFn) {
      customLoader = loaderFn;
    },
    unloader(unloaderFn) {
      customUnloader = unloaderFn;
    },
    position() {
      let top = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      let left = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      videoEl.style.left = withPrecision(left);
      videoEl.style.top = withPrecision(top);
      if (textureMode === true) {
        videoTexture.position(top, left);
      }
    },
    size() {
      let width = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1920;
      let height = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1080;
      videoEl.style.width = withPrecision(width);
      videoEl.style.height = withPrecision(height);
      videoEl.width = parseFloat(videoEl.style.width);
      videoEl.height = parseFloat(videoEl.style.height);
      if (textureMode === true) {
        videoTexture.size(width, height);
      }
    },
    area() {
      let top = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      let right = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1920;
      let bottom = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1080;
      let left = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
      this.position(top, left);
      this.size(right - left, bottom - top);
    },
    open(url) {
      let config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      if (!this.canInteract) return;
      metrics = Metrics$1.media(url);
      this.hide();
      deregisterEventListeners();
      if (this.src == url) {
        this.clear().then(this.open(url, config));
      } else {
        const adConfig = {
          enabled: state$1.adsEnabled,
          duration: 300
        };
        if (config.videoId) {
          adConfig.caid = config.videoId;
        }
        Ads.get(adConfig, consumer$1).then(ads => {
          state$1.playingAds = true;
          ads.prerolls().then(() => {
            state$1.playingAds = false;
            loader(url, videoEl, config).then(() => {
              registerEventListeners();
              this.show();
              this.play();
            });
          });
        });
      }
    },
    reload() {
      if (!this.canInteract) return;
      const url = videoEl.getAttribute('src');
      this.close();
      this.open(url);
    },
    close() {
      Ads.cancel();
      if (state$1.playingAds) {
        state$1.playingAds = false;
        Ads.stop();
        // call self in next tick
        setTimeout(() => {
          this.close();
        });
      }
      if (!this.canInteract) return;
      this.clear();
      this.hide();
      deregisterEventListeners();
    },
    clear() {
      if (!this.canInteract) return;
      // pause the video first to disable sound
      this.pause();
      if (textureMode === true) videoTexture.stop();
      return unloader(videoEl).then(() => {
        fireOnConsumer$1('Clear', {
          videoElement: videoEl
        });
      });
    },
    play() {
      if (!this.canInteract) return;
      if (textureMode === true) videoTexture.start();
      videoEl.play();
    },
    pause() {
      if (!this.canInteract) return;
      videoEl.pause();
    },
    playPause() {
      if (!this.canInteract) return;
      this.playing === true ? this.pause() : this.play();
    },
    mute() {
      let muted = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      if (!this.canInteract) return;
      videoEl.muted = muted;
    },
    loop() {
      let looped = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      videoEl.loop = looped;
    },
    seek(time) {
      if (!this.canInteract) return;
      if (!this.src) return;
      // define whether should continue to play after seek is complete (in seeked hook)
      if (state$1.playAfterSeek === null) {
        state$1.playAfterSeek = !!state$1.playing;
      }
      // pause before actually seeking
      this.pause();
      // currentTime always between 0 and the duration of the video (minus 0.1s to not set to the final frame and stall the video)
      videoEl.currentTime = Math.max(0, Math.min(time, this.duration - 0.1));
    },
    skip(seconds) {
      if (!this.canInteract) return;
      if (!this.src) return;
      state$1.skipTime = (state$1.skipTime || videoEl.currentTime) + seconds;
      easeExecution(() => {
        this.seek(state$1.skipTime);
        state$1.skipTime = false;
      }, 300);
    },
    show() {
      if (!this.canInteract) return;
      if (textureMode === true) {
        videoTexture.show();
      } else {
        videoEl.style.display = 'block';
        videoEl.style.visibility = 'visible';
      }
    },
    hide() {
      if (!this.canInteract) return;
      if (textureMode === true) {
        videoTexture.hide();
      } else {
        videoEl.style.display = 'none';
        videoEl.style.visibility = 'hidden';
      }
    },
    enableAds() {
      let enabled = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      state$1.adsEnabled = enabled;
    },
    /* Public getters */
    get duration() {
      return videoEl && (isNaN(videoEl.duration) ? Infinity : videoEl.duration);
    },
    get currentTime() {
      return videoEl && videoEl.currentTime;
    },
    get muted() {
      return videoEl && videoEl.muted;
    },
    get looped() {
      return videoEl && videoEl.loop;
    },
    get src() {
      return videoEl && videoEl.getAttribute('src');
    },
    get playing() {
      return state$1.playing;
    },
    get playingAds() {
      return state$1.playingAds;
    },
    get canInteract() {
      // todo: perhaps add an extra flag wether we allow interactions (i.e. pauze, mute, etc.) during ad playback
      return state$1.playingAds === false;
    },
    get top() {
      return videoEl && parseFloat(videoEl.style.top);
    },
    get left() {
      return videoEl && parseFloat(videoEl.style.left);
    },
    get bottom() {
      return videoEl && parseFloat(videoEl.style.top - videoEl.style.height);
    },
    get right() {
      return videoEl && parseFloat(videoEl.style.left - videoEl.style.width);
    },
    get width() {
      return videoEl && parseFloat(videoEl.style.width);
    },
    get height() {
      return videoEl && parseFloat(videoEl.style.height);
    },
    get visible() {
      if (textureMode === true) {
        return videoTexture.isVisible;
      } else {
        return videoEl && videoEl.style.display === 'block';
      }
    },
    get adsEnabled() {
      return state$1.adsEnabled;
    },
    // prefixed with underscore to indicate 'semi-private'
    // because it's not recommended to interact directly with the video element
    get _videoEl() {
      return videoEl;
    }
  };
  autoSetupMixin(videoPlayerPlugin, () => {
    precision = ApplicationInstance && ApplicationInstance.stage && ApplicationInstance.stage.getRenderPrecision() || precision;
    videoEl = setupVideoTag();
    textureMode = Settings.get('platform', 'textureMode', false);
    if (textureMode === true) {
      videoEl.setAttribute('crossorigin', 'anonymous');
      videoTexture = setUpVideoTexture();
    }
  });

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  let consumer;
  let getAds = () => {
    // todo: enable some default ads during development, maybe from the settings.json
    return Promise.resolve({
      prerolls: [],
      midrolls: [],
      postrolls: []
    });
  };
  const initAds = config => {
    if (config.getAds) {
      getAds = config.getAds;
    }
  };
  const state = {
    active: false
  };
  const playSlot = function () {
    let slot = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    return slot.reduce((promise, ad) => {
      return promise.then(() => {
        return playAd(ad);
      });
    }, Promise.resolve(null));
  };
  const playAd = ad => {
    return new Promise(resolve => {
      if (state.active === false) {
        Log.info('Ad', 'Skipping add due to inactive state');
        return resolve();
      }
      // is it safe to rely on videoplayer plugin already created the video tag?
      const videoEl = document.getElementsByTagName('video')[0];
      videoEl.style.display = 'block';
      videoEl.style.visibility = 'visible';
      videoEl.src = mediaUrl(ad.url);
      videoEl.load();
      let timeEvents = null;
      let timeout;
      const cleanup = () => {
        // remove all listeners
        Object.keys(handlers).forEach(handler => videoEl.removeEventListener(handler, handlers[handler]));
        resolve();
      };
      const handlers = {
        play() {
          Log.info('Ad', 'Play ad', ad.url);
          fireOnConsumer('Play', ad);
          sendBeacon(ad.callbacks, 'defaultImpression');
        },
        ended() {
          fireOnConsumer('Ended', ad);
          sendBeacon(ad.callbacks, 'complete');
          cleanup();
        },
        timeupdate() {
          if (!timeEvents && videoEl.duration) {
            // calculate when to fire the time based events (now that duration is known)
            timeEvents = {
              firstQuartile: videoEl.duration / 4,
              midPoint: videoEl.duration / 2,
              thirdQuartile: videoEl.duration / 4 * 3
            };
            Log.info('Ad', 'Calculated quartiles times', {
              timeEvents
            });
          }
          if (timeEvents && timeEvents.firstQuartile && videoEl.currentTime >= timeEvents.firstQuartile) {
            fireOnConsumer('FirstQuartile', ad);
            delete timeEvents.firstQuartile;
            sendBeacon(ad.callbacks, 'firstQuartile');
          }
          if (timeEvents && timeEvents.midPoint && videoEl.currentTime >= timeEvents.midPoint) {
            fireOnConsumer('MidPoint', ad);
            delete timeEvents.midPoint;
            sendBeacon(ad.callbacks, 'midPoint');
          }
          if (timeEvents && timeEvents.thirdQuartile && videoEl.currentTime >= timeEvents.thirdQuartile) {
            fireOnConsumer('ThirdQuartile', ad);
            delete timeEvents.thirdQuartile;
            sendBeacon(ad.callbacks, 'thirdQuartile');
          }
        },
        stalled() {
          fireOnConsumer('Stalled', ad);
          timeout = setTimeout(() => {
            cleanup();
          }, 5000); // make timeout configurable
        },

        canplay() {
          timeout && clearTimeout(timeout);
        },
        error() {
          fireOnConsumer('Error', ad);
          cleanup();
        },
        // this doesn't work reliably on sky box, moved logic to timeUpdate event
        // loadedmetadata() {
        //   // calculate when to fire the time based events (now that duration is known)
        //   timeEvents = {
        //     firstQuartile: videoEl.duration / 4,
        //     midPoint: videoEl.duration / 2,
        //     thirdQuartile: (videoEl.duration / 4) * 3,
        //   }
        // },
        abort() {
          cleanup();
        }
        // todo: pause, resume, mute, unmute beacons
      };
      // add all listeners
      Object.keys(handlers).forEach(handler => videoEl.addEventListener(handler, handlers[handler]));
      videoEl.play();
    });
  };
  const sendBeacon = (callbacks, event) => {
    if (callbacks && callbacks[event]) {
      Log.info('Ad', 'Sending beacon', event, callbacks[event]);
      return callbacks[event].reduce((promise, url) => {
        return promise.then(() => fetch(url)
        // always resolve, also in case of a fetch error (so we don't block firing the rest of the beacons for this event)
        // note: for fetch failed http responses don't throw an Error :)
        .then(response => {
          if (response.status === 200) {
            fireOnConsumer('Beacon' + event + 'Sent');
          } else {
            fireOnConsumer('Beacon' + event + 'Failed' + response.status);
          }
          Promise.resolve(null);
        }).catch(() => {
          Promise.resolve(null);
        }));
      }, Promise.resolve(null));
    } else {
      Log.info('Ad', 'No callback found for ' + event);
    }
  };
  const fireOnConsumer = (event, args) => {
    if (consumer) {
      consumer.fire('$ad' + event, args);
      consumer.fire('$adEvent', event, args);
    }
  };
  var Ads = {
    get(config, videoPlayerConsumer) {
      if (config.enabled === false) {
        return Promise.resolve({
          prerolls() {
            return Promise.resolve();
          }
        });
      }
      consumer = videoPlayerConsumer;
      return new Promise(resolve => {
        Log.info('Ad', 'Starting session');
        getAds(config).then(ads => {
          Log.info('Ad', 'API result', ads);
          resolve({
            prerolls() {
              if (ads.preroll) {
                state.active = true;
                fireOnConsumer('PrerollSlotImpression', ads);
                sendBeacon(ads.preroll.callbacks, 'slotImpression');
                return playSlot(ads.preroll.ads).then(() => {
                  fireOnConsumer('PrerollSlotEnd', ads);
                  sendBeacon(ads.preroll.callbacks, 'slotEnd');
                  state.active = false;
                });
              }
              return Promise.resolve();
            },
            midrolls() {
              return Promise.resolve();
            },
            postrolls() {
              return Promise.resolve();
            }
          });
        });
      });
    },
    cancel() {
      Log.info('Ad', 'Cancel Ad');
      state.active = false;
    },
    stop() {
      Log.info('Ad', 'Stop Ad');
      state.active = false;
      // fixme: duplication
      const videoEl = document.getElementsByTagName('video')[0];
      videoEl.pause();
      videoEl.removeAttribute('src');
    }
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  class ScaledImageTexture extends Lightning.textures.ImageTexture {
    constructor(stage) {
      super(stage);
      this._scalingOptions = undefined;
    }
    set options(options) {
      this.resizeMode = this._scalingOptions = options;
    }
    _getLookupId() {
      return "".concat(this._src, "-").concat(this._scalingOptions.type, "-").concat(this._scalingOptions.w, "-").concat(this._scalingOptions.h);
    }
    getNonDefaults() {
      const obj = super.getNonDefaults();
      if (this._src) {
        obj.src = this._src;
      }
      return obj;
    }
  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  class PinInput extends Lightning.Component {
    static _template() {
      return {
        w: 120,
        h: 150,
        rect: true,
        color: 0xff949393,
        alpha: 0.5,
        shader: {
          type: Lightning.shaders.RoundedRectangle,
          radius: 10
        },
        Nr: {
          w: w => w,
          y: 24,
          text: {
            text: '',
            textColor: 0xff333333,
            fontSize: 80,
            textAlign: 'center',
            verticalAlign: 'middle'
          }
        }
      };
    }
    set index(v) {
      this.x = v * (120 + 24);
    }
    set nr(v) {
      this._timeout && clearTimeout(this._timeout);
      if (v) {
        this.setSmooth('alpha', 1);
      } else {
        this.setSmooth('alpha', 0.5);
      }
      this.tag('Nr').patch({
        text: {
          text: v && v.toString() || '',
          fontSize: v === '*' ? 120 : 80
        }
      });
      if (v && v !== '*') {
        this._timeout = setTimeout(() => {
          this._timeout = null;
          this.nr = '*';
        }, 750);
      }
    }
  }
  class PinDialog extends Lightning.Component {
    static _template() {
      return {
        zIndex: 1,
        w: w => w,
        h: h => h,
        rect: true,
        color: 0xdd000000,
        alpha: 0.000001,
        Dialog: {
          w: 648,
          h: 320,
          y: h => (h - 320) / 2,
          x: w => (w - 648) / 2,
          rect: true,
          color: 0xdd333333,
          shader: {
            type: Lightning.shaders.RoundedRectangle,
            radius: 10
          },
          Info: {
            y: 24,
            x: 48,
            text: {
              text: 'Please enter your PIN',
              fontSize: 32
            }
          },
          Msg: {
            y: 260,
            x: 48,
            text: {
              text: '',
              fontSize: 28,
              textColor: 0xffffffff
            }
          },
          Code: {
            x: 48,
            y: 96
          }
        }
      };
    }
    _init() {
      const children = [];
      for (let i = 0; i < 4; i++) {
        children.push({
          type: PinInput,
          index: i
        });
      }
      this.tag('Code').children = children;
    }
    get pin() {
      if (!this._pin) this._pin = '';
      return this._pin;
    }
    set pin(v) {
      if (v.length <= 4) {
        const maskedPin = new Array(Math.max(v.length - 1, 0)).fill('*', 0, v.length - 1);
        v.length && maskedPin.push(v.length > this._pin.length ? v.slice(-1) : '*');
        for (let i = 0; i < 4; i++) {
          this.tag('Code').children[i].nr = maskedPin[i] || '';
        }
        this._pin = v;
      }
    }
    get msg() {
      if (!this._msg) this._msg = '';
      return this._msg;
    }
    set msg(v) {
      this._timeout && clearTimeout(this._timeout);
      this._msg = v;
      if (this._msg) {
        this.tag('Msg').text = this._msg;
        this.tag('Info').setSmooth('alpha', 0.5);
        this.tag('Code').setSmooth('alpha', 0.5);
      } else {
        this.tag('Msg').text = '';
        this.tag('Info').setSmooth('alpha', 1);
        this.tag('Code').setSmooth('alpha', 1);
      }
      this._timeout = setTimeout(() => {
        this.msg = '';
      }, 2000);
    }
    _firstActive() {
      this.setSmooth('alpha', 1);
    }
    _handleKey(event) {
      if (this.msg) {
        this.msg = false;
      } else {
        const val = parseInt(event.key);
        if (val > -1) {
          this.pin += val;
        }
      }
    }
    _handleBack() {
      if (this.msg) {
        this.msg = false;
      } else {
        if (this.pin.length) {
          this.pin = this.pin.slice(0, this.pin.length - 1);
        } else {
          Pin.hide();
          this.resolve(false);
        }
      }
    }
    _handleEnter() {
      if (this.msg) {
        this.msg = false;
      } else {
        Pin.submit(this.pin).then(val => {
          this.msg = 'Unlocking ...';
          setTimeout(() => {
            Pin.hide();
          }, 1000);
          this.resolve(val);
        }).catch(e => {
          this.msg = e;
          this.reject(e);
        });
      }
    }
  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  // only used during local development
  let unlocked = false;
  let submit = pin => {
    return new Promise((resolve, reject) => {
      if (pin.toString() === Settings.get('platform', 'pin', '0000').toString()) {
        unlocked = true;
        resolve(unlocked);
      } else {
        reject('Incorrect pin');
      }
    });
  };
  let check = () => {
    return new Promise(resolve => {
      resolve(unlocked);
    });
  };
  let pinDialog = null;

  // Public API
  var Pin = {
    show() {
      return new Promise((resolve, reject) => {
        pinDialog = ApplicationInstance.stage.c({
          ref: 'PinDialog',
          type: PinDialog,
          resolve,
          reject
        });
        ApplicationInstance.childList.a(pinDialog);
        ApplicationInstance.focus = pinDialog;
      });
    },
    hide() {
      ApplicationInstance.focus = null;
      ApplicationInstance.children = ApplicationInstance.children.map(child => child !== pinDialog && child);
      pinDialog = null;
    },
    submit(pin) {
      return new Promise((resolve, reject) => {
        try {
          submit(pin).then(resolve).catch(reject);
        } catch (e) {
          reject(e);
        }
      });
    },
    unlocked() {
      return new Promise((resolve, reject) => {
        try {
          check().then(resolve).catch(reject);
        } catch (e) {
          reject(e);
        }
      });
    },
    locked() {
      return new Promise((resolve, reject) => {
        try {
          check().then(unlocked => resolve(!!!unlocked)).catch(reject);
        } catch (e) {
          reject(e);
        }
      });
    }
  };

  const LaunchState = {
    INACTIVE: 0,
    PENDING: 1,
    ACTIVE: 2
  };
  class CherryAppLauncher extends Lightning.Component {
    static _template() {
      return {
        x: 0,
        y: 0,
        w: 1920,
        h: 1080,
        Message: {
          x: w => w / 2,
          y: h => h / 2,
          mount: 0.5,
          text: {
            text: this.bindProp("messageText"),
            color: 0xff20ba81,
            fontSize: 35
          }
        }
      };
    }
    _init() {
      this.appName = "";
      this.friendlyAppName = "";
    }
    _enable() {
      this.launchState = LaunchState.INACTIVE;
      this.messageText = "";
    }
    _getFocused() {
      return this.tag("CherryAppLauncher");
    }
    _handleKey(e) {
      if (this.launchState === LaunchState.ACTIVE) {
        if (e.keyCode !== 0) {
          this.keyHandler.handleKeyDown(e.keyCode.toString());
        }
      }
    }
    _handleKeyRelease(e) {
      if (this.launchState === LaunchState.ACTIVE) {
        if (e.keyCode !== 0) {
          this.keyHandler.handleKeyUp(e.keyCode.toString());
        }
      }
    }
    async launchApp() {
      console.log("launchApp ".concat(this.appName));
      this.launchState = LaunchState.PENDING;
      try {
        await this.thunderWrapper.launchApp(this.appName);
        await this.startCast();
      } catch (err) {
        console.error("Failed to launch app: " + err.message);
        this.launchState = LaunchState.INACTIVE;
      }
    }
    async startCast() {
      this.videoPlayer.startCast();
      this.launchState = LaunchState.ACTIVE;
    }
    async stopCast() {
      this.messageText = "Closing cast";
      await this.videoPlayer.stopCast();
      this.keyHandler.sendHomeKey(); // Gives Launcher the focus on Cherry
      this.messageText = "";
      this.launchState = LaunchState.INACTIVE;
    }
    configure(thunderWrapper, keyHandler, videoPlayer) {
      this.thunderWrapper = thunderWrapper;
      this.keyHandler = keyHandler;
      this.videoPlayer = videoPlayer;
    }
    setupApp(appName, friendlyAppName) {
      this.appName = appName;
      this.friendlyAppName = friendlyAppName;
    }
    async terminate() {
      await this.stopCast();
    }
  }

  const PlayerId = {
    DEFAULT_AS_PLAYER: 1,
    AVCAST_AS_PLAYER: 2
  };
  Object.freeze(PlayerId);
  function createPlayer(playerId) {
    let player = document.createElement("video");
    player.setAttribute("id", "video-player-" + playerId);
    player.style.position = "fixed";
    player.style.zIndex = "1";
    player.style.visibility = "visible";
    player.style.display = "block";
    document.body.appendChild(player);
    let source = document.createElement("source");
    source.setAttribute("id", "video-source");
    source.setAttribute("type", "video/x-dvb");
    source.setAttribute("src", "rec://srv/cur?vwid=" + playerId);
    player.appendChild(source);
    return player;
  }
  function getPlayer(playerId) {
    let player = document.getElementById("video-player-" + playerId);
    if (!player) {
      console.log("VideoResizer: creating new player object.");
      player = createPlayer(playerId);
    } else {
      console.log("VideoResizer: returning existing player.");
    }
    return player;
  }
  function resizePlayer(player, width, height) {
    player.style.width = width;
    player.style.height = height;
  }
  function movePlayer(player, top, left) {
    player.style.top = top;
    player.style.left = left;
  }
  var VideoResizer = {
    resizeToFullScreen: function (playerId) {
      if (playerId === undefined) {
        console.error("VideoResizer: playerId not defined!");
        return;
      }
      console.log("VideoResizer: resizing video to full screen for player with id:", playerId);
      let player = getPlayer(playerId);
      movePlayer(player, "0px", "0px");
      resizePlayer(player, "100%", "100%");
    },
    resize: function (playerId, width, height) {
      console.log("VideoResizer: resizing video to width:", width, " and height:", height, " for player with id:", playerId);
      resizePlayer(getPlayer(playerId), width, height);
    },
    move: function (playerId, top, left) {
      console.log("VideoResizer: moving video to top:", top, " and left", left, " for player with id:", playerId);
      movePlayer(getPlayer(playerId), top, left);
    }
  };

  class HdmiInputPlayer {
    constructor(thunderWrapper) {
      this.thunderWrapper = thunderWrapper;
      window.addEventListener("firebolt.lifecycleStateChange", event => {
        if (event.detail.newState === "unloading") {
          console.log("HdmiInputPlayer: unloading event was received - going to stop a player");
          this.stop();
        }
      });
    }
    async start(portId, display) {
      console.log("HdmiInputPlayer: starting cast, port: ".concat(portId, ", display: ").concat(display));
      this.port = portId;
      VideoResizer.resizeToFullScreen(display);
      let result = await this.thunderWrapper.startHdmiInput(portId);
      if (!result.success) {
        console.error("HdmiInputPlayer: startHdmiInput failed.");
        return result;
      }
      result = await this.thunderWrapper.setRoutingChange("TV", "HDMI".concat(portId));
      if (!result.success) {
        console.error("HdmiInputPlayer: setRoutingChange failed.");
        return result;
      }
      result = await this.thunderWrapper.setActivePath("".concat(portId + 1, ".0.0.0"));
      if (!result.success) {
        console.error("HdmiInputPlayer: setActivePath failed.");
        return result;
      }
      return result;
    }
    async stop() {
      console.log("HdmiInputPlayer: stop cast");
      if (this.port !== undefined) {
        await this.thunderWrapper.stopHdmiInput();
        await this.thunderWrapper.setRoutingChange("HDMI".concat(this.port), "TV");
        await this.thunderWrapper.setActiveSource();
      }
    }
  }

  const Resolution = {
    RES_1920x1080: "1080p",
    RES_1280x720: "720p"
  };
  const Mode = {
    TEXTURE: "texture",
    VIDEO: "video"
  };
  const Type = {
    IP: 0,
    HDMI: 1
  };
  Object.freeze(Resolution);
  Object.freeze(Mode);
  Object.freeze(Type);
  class VideoPlayer {
    constructor(thunderWrapper, avCastPlayer, systemAudioPlayer) {
      this.thunderWrapper = thunderWrapper;
      this.avCastPlayer = avCastPlayer;
      this.systemAudioPlayer = systemAudioPlayer;
      this.hdmiInputPlayer = new HdmiInputPlayer(thunderWrapper);
      this.type = Type.IP;
      window.addEventListener("firebolt.lifecycleStateChange", event => {
        if (event.detail.newState === "unloading") {
          console.log("VideoPlayer: unloading event was received - going to stop a player");
          this.stop();
        }
      });
    }
    async setCastType(type) {
      this.type = type;
      await this.onCastTypeChanged(type);
    }
    registerCastTypeChangeCallback(callback) {
      this.onCastTypeChanged = callback;
    }
    async startCast() {
      if (this.type == Type.HDMI) {
        console.log("VideoPlayer: starting HDMI cast");
        await this.startHdmiCast();
      } else {
        console.log("VideoPlayer: starting IP cast");
        await this.startIpCast();
      }
    }
    async startHdmiCast() {
      let result = await this.thunderWrapper.getHdmiInputDevices();
      if (!result.success) {
        throw new Error("VideoPlayer: Unable to get hdmi input devices.");
      }
      const hdmiPort = 2;
      if (result.devices[hdmiPort].connected.toLowerCase() === "false") {
        this.messageText = "HDMI".concat(hdmiPort, " port not connected, to exit hold Play/Pause for 0.5 seconds then release.");
        throw new Error("HDMI".concat(hdmiPort, " port not connected."));
      }
      console.log("VideoPlayer: HDMI settings: port: " + hdmiPort + ", display: " + PlayerId.DEFAULT_AS_PLAYER);
      result = await this.hdmiInputPlayer.start(hdmiPort, PlayerId.DEFAULT_AS_PLAYER);
      if (!result.success) {
        throw new Error("Unable to start hdmi cast.");
      }
      return result;
    }
    async startIpCast() {
      [this.cherryIP, this.videoPort] = await this.thunderWrapper.getCastConnectionStatus();
      const address = this.cherryIP;
      const videoPort = this.videoPort;
      const mode = Mode.VIDEO;
      const res = Resolution.RES_1920x1080;
      const playbackRegion = undefined;
      const alpha = false;
      const display = PlayerId.DEFAULT_AS_PLAYER;
      const runtimedir = "/run"; //hardcoded for hisense - Vinod Jain

      console.log("VideoPlayer: AVCast settings ip: " + address + ", videoPort: " + videoPort + ", mode: " + mode + ", resolution: " + res + ", playbackRegion:" + playbackRegion + ", alpha: " + alpha + ", display: " + display + ", runtimedir: " + runtimedir);
      VideoResizer.resizeToFullScreen(display || PlayerId.AVCAST_AS_PLAYER);
      let result = await this.thunderWrapper.startCast(address, videoPort, mode, res, playbackRegion, alpha, display, runtimedir);
      if (!result.success) {
        this.messageText = "Connection unavailable, to exit hold Play/Pause for 0.5 seconds then release.";
        throw new Error("Unable to start ip cast.");
      }
      return result;
    }
    async stopCast() {
      if (this.type == Type.HDMI) {
        await this.stopHdmiCast();
      } else {
        await this.stopIpCast();
      }
    }
    async stopIpCast() {
      await this.avCastPlayer.stop();
    }
    async stopHdmiCast() {
      await this.hdmiInputPlayer.stop();
    }
    onPlayerStopped() {
      console.warn("VideoPlayer: Event playerStopped was received. Most likely, watchdog had not been notified");
    }
  }

  var axios$2 = {exports: {}};

  var bind$2 = function bind(fn, thisArg) {
    return function wrap() {
      var args = new Array(arguments.length);
      for (var i = 0; i < args.length; i++) {
        args[i] = arguments[i];
      }
      return fn.apply(thisArg, args);
    };
  };

  var bind$1 = bind$2;

  /*global toString:true*/

  // utils is a library of generic helper functions non-specific to axios

  var toString = Object.prototype.toString;

  /**
   * Determine if a value is an Array
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is an Array, otherwise false
   */
  function isArray(val) {
    return toString.call(val) === '[object Array]';
  }

  /**
   * Determine if a value is undefined
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if the value is undefined, otherwise false
   */
  function isUndefined(val) {
    return typeof val === 'undefined';
  }

  /**
   * Determine if a value is a Buffer
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Buffer, otherwise false
   */
  function isBuffer(val) {
    return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor) && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
  }

  /**
   * Determine if a value is an ArrayBuffer
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is an ArrayBuffer, otherwise false
   */
  function isArrayBuffer(val) {
    return toString.call(val) === '[object ArrayBuffer]';
  }

  /**
   * Determine if a value is a FormData
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is an FormData, otherwise false
   */
  function isFormData(val) {
    return typeof FormData !== 'undefined' && val instanceof FormData;
  }

  /**
   * Determine if a value is a view on an ArrayBuffer
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
   */
  function isArrayBufferView(val) {
    var result;
    if (typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView) {
      result = ArrayBuffer.isView(val);
    } else {
      result = val && val.buffer && val.buffer instanceof ArrayBuffer;
    }
    return result;
  }

  /**
   * Determine if a value is a String
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a String, otherwise false
   */
  function isString(val) {
    return typeof val === 'string';
  }

  /**
   * Determine if a value is a Number
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Number, otherwise false
   */
  function isNumber(val) {
    return typeof val === 'number';
  }

  /**
   * Determine if a value is an Object
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is an Object, otherwise false
   */
  function isObject(val) {
    return val !== null && typeof val === 'object';
  }

  /**
   * Determine if a value is a plain Object
   *
   * @param {Object} val The value to test
   * @return {boolean} True if value is a plain Object, otherwise false
   */
  function isPlainObject(val) {
    if (toString.call(val) !== '[object Object]') {
      return false;
    }
    var prototype = Object.getPrototypeOf(val);
    return prototype === null || prototype === Object.prototype;
  }

  /**
   * Determine if a value is a Date
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Date, otherwise false
   */
  function isDate(val) {
    return toString.call(val) === '[object Date]';
  }

  /**
   * Determine if a value is a File
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a File, otherwise false
   */
  function isFile(val) {
    return toString.call(val) === '[object File]';
  }

  /**
   * Determine if a value is a Blob
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Blob, otherwise false
   */
  function isBlob(val) {
    return toString.call(val) === '[object Blob]';
  }

  /**
   * Determine if a value is a Function
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Function, otherwise false
   */
  function isFunction(val) {
    return toString.call(val) === '[object Function]';
  }

  /**
   * Determine if a value is a Stream
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Stream, otherwise false
   */
  function isStream(val) {
    return isObject(val) && isFunction(val.pipe);
  }

  /**
   * Determine if a value is a URLSearchParams object
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a URLSearchParams object, otherwise false
   */
  function isURLSearchParams(val) {
    return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
  }

  /**
   * Trim excess whitespace off the beginning and end of a string
   *
   * @param {String} str The String to trim
   * @returns {String} The String freed of excess whitespace
   */
  function trim(str) {
    return str.replace(/^\s*/, '').replace(/\s*$/, '');
  }

  /**
   * Determine if we're running in a standard browser environment
   *
   * This allows axios to run in a web worker, and react-native.
   * Both environments support XMLHttpRequest, but not fully standard globals.
   *
   * web workers:
   *  typeof window -> undefined
   *  typeof document -> undefined
   *
   * react-native:
   *  navigator.product -> 'ReactNative'
   * nativescript
   *  navigator.product -> 'NativeScript' or 'NS'
   */
  function isStandardBrowserEnv() {
    if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' || navigator.product === 'NativeScript' || navigator.product === 'NS')) {
      return false;
    }
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  }

  /**
   * Iterate over an Array or an Object invoking a function for each item.
   *
   * If `obj` is an Array callback will be called passing
   * the value, index, and complete array for each item.
   *
   * If 'obj' is an Object callback will be called passing
   * the value, key, and complete object for each property.
   *
   * @param {Object|Array} obj The object to iterate
   * @param {Function} fn The callback to invoke for each item
   */
  function forEach(obj, fn) {
    // Don't bother if no value provided
    if (obj === null || typeof obj === 'undefined') {
      return;
    }

    // Force an array if not already something iterable
    if (typeof obj !== 'object') {
      /*eslint no-param-reassign:0*/
      obj = [obj];
    }
    if (isArray(obj)) {
      // Iterate over array values
      for (var i = 0, l = obj.length; i < l; i++) {
        fn.call(null, obj[i], i, obj);
      }
    } else {
      // Iterate over object keys
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          fn.call(null, obj[key], key, obj);
        }
      }
    }
  }

  /**
   * Accepts varargs expecting each argument to be an object, then
   * immutably merges the properties of each object and returns result.
   *
   * When multiple objects contain the same key the later object in
   * the arguments list will take precedence.
   *
   * Example:
   *
   * ```js
   * var result = merge({foo: 123}, {foo: 456});
   * console.log(result.foo); // outputs 456
   * ```
   *
   * @param {Object} obj1 Object to merge
   * @returns {Object} Result of all merge properties
   */
  function /* obj1, obj2, obj3, ... */
  merge() {
    var result = {};
    function assignValue(val, key) {
      if (isPlainObject(result[key]) && isPlainObject(val)) {
        result[key] = merge(result[key], val);
      } else if (isPlainObject(val)) {
        result[key] = merge({}, val);
      } else if (isArray(val)) {
        result[key] = val.slice();
      } else {
        result[key] = val;
      }
    }
    for (var i = 0, l = arguments.length; i < l; i++) {
      forEach(arguments[i], assignValue);
    }
    return result;
  }

  /**
   * Extends object a by mutably adding to it the properties of object b.
   *
   * @param {Object} a The object to be extended
   * @param {Object} b The object to copy properties from
   * @param {Object} thisArg The object to bind function to
   * @return {Object} The resulting value of object a
   */
  function extend(a, b, thisArg) {
    forEach(b, function assignValue(val, key) {
      if (thisArg && typeof val === 'function') {
        a[key] = bind$1(val, thisArg);
      } else {
        a[key] = val;
      }
    });
    return a;
  }

  /**
   * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
   *
   * @param {string} content with BOM
   * @return {string} content value without BOM
   */
  function stripBOM(content) {
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1);
    }
    return content;
  }
  var utils$d = {
    isArray: isArray,
    isArrayBuffer: isArrayBuffer,
    isBuffer: isBuffer,
    isFormData: isFormData,
    isArrayBufferView: isArrayBufferView,
    isString: isString,
    isNumber: isNumber,
    isObject: isObject,
    isPlainObject: isPlainObject,
    isUndefined: isUndefined,
    isDate: isDate,
    isFile: isFile,
    isBlob: isBlob,
    isFunction: isFunction,
    isStream: isStream,
    isURLSearchParams: isURLSearchParams,
    isStandardBrowserEnv: isStandardBrowserEnv,
    forEach: forEach,
    merge: merge,
    extend: extend,
    trim: trim,
    stripBOM: stripBOM
  };

  var utils$c = utils$d;
  function encode(val) {
    return encodeURIComponent(val).replace(/%3A/gi, ':').replace(/%24/g, '$').replace(/%2C/gi, ',').replace(/%20/g, '+').replace(/%5B/gi, '[').replace(/%5D/gi, ']');
  }

  /**
   * Build a URL by appending params to the end
   *
   * @param {string} url The base of the url (e.g., http://www.google.com)
   * @param {object} [params] The params to be appended
   * @returns {string} The formatted url
   */
  var buildURL$2 = function buildURL(url, params, paramsSerializer) {
    /*eslint no-param-reassign:0*/
    if (!params) {
      return url;
    }
    var serializedParams;
    if (paramsSerializer) {
      serializedParams = paramsSerializer(params);
    } else if (utils$c.isURLSearchParams(params)) {
      serializedParams = params.toString();
    } else {
      var parts = [];
      utils$c.forEach(params, function serialize(val, key) {
        if (val === null || typeof val === 'undefined') {
          return;
        }
        if (utils$c.isArray(val)) {
          key = key + '[]';
        } else {
          val = [val];
        }
        utils$c.forEach(val, function parseValue(v) {
          if (utils$c.isDate(v)) {
            v = v.toISOString();
          } else if (utils$c.isObject(v)) {
            v = JSON.stringify(v);
          }
          parts.push(encode(key) + '=' + encode(v));
        });
      });
      serializedParams = parts.join('&');
    }
    if (serializedParams) {
      var hashmarkIndex = url.indexOf('#');
      if (hashmarkIndex !== -1) {
        url = url.slice(0, hashmarkIndex);
      }
      url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
    }
    return url;
  };

  var utils$b = utils$d;
  function InterceptorManager$1() {
    this.handlers = [];
  }

  /**
   * Add a new interceptor to the stack
   *
   * @param {Function} fulfilled The function to handle `then` for a `Promise`
   * @param {Function} rejected The function to handle `reject` for a `Promise`
   *
   * @return {Number} An ID used to remove interceptor later
   */
  InterceptorManager$1.prototype.use = function use(fulfilled, rejected) {
    this.handlers.push({
      fulfilled: fulfilled,
      rejected: rejected
    });
    return this.handlers.length - 1;
  };

  /**
   * Remove an interceptor from the stack
   *
   * @param {Number} id The ID that was returned by `use`
   */
  InterceptorManager$1.prototype.eject = function eject(id) {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  };

  /**
   * Iterate over all the registered interceptors
   *
   * This method is particularly useful for skipping over any
   * interceptors that may have become `null` calling `eject`.
   *
   * @param {Function} fn The function to call for each interceptor
   */
  InterceptorManager$1.prototype.forEach = function forEach(fn) {
    utils$b.forEach(this.handlers, function forEachHandler(h) {
      if (h !== null) {
        fn(h);
      }
    });
  };
  var InterceptorManager_1 = InterceptorManager$1;

  var utils$a = utils$d;

  /**
   * Transform the data for a request or a response
   *
   * @param {Object|String} data The data to be transformed
   * @param {Array} headers The headers for the request or response
   * @param {Array|Function} fns A single function or Array of functions
   * @returns {*} The resulting transformed data
   */
  var transformData$1 = function transformData(data, headers, fns) {
    /*eslint no-param-reassign:0*/
    utils$a.forEach(fns, function transform(fn) {
      data = fn(data, headers);
    });
    return data;
  };

  var isCancel$1 = function isCancel(value) {
    return !!(value && value.__CANCEL__);
  };

  var utils$9 = utils$d;
  var normalizeHeaderName$1 = function normalizeHeaderName(headers, normalizedName) {
    utils$9.forEach(headers, function processHeader(value, name) {
      if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
        headers[normalizedName] = value;
        delete headers[name];
      }
    });
  };

  /**
   * Update an Error with the specified config, error code, and response.
   *
   * @param {Error} error The error to update.
   * @param {Object} config The config.
   * @param {string} [code] The error code (for example, 'ECONNABORTED').
   * @param {Object} [request] The request.
   * @param {Object} [response] The response.
   * @returns {Error} The error.
   */
  var enhanceError$1 = function enhanceError(error, config, code, request, response) {
    error.config = config;
    if (code) {
      error.code = code;
    }
    error.request = request;
    error.response = response;
    error.isAxiosError = true;
    error.toJSON = function toJSON() {
      return {
        // Standard
        message: this.message,
        name: this.name,
        // Microsoft
        description: this.description,
        number: this.number,
        // Mozilla
        fileName: this.fileName,
        lineNumber: this.lineNumber,
        columnNumber: this.columnNumber,
        stack: this.stack,
        // Axios
        config: this.config,
        code: this.code
      };
    };
    return error;
  };

  var enhanceError = enhanceError$1;

  /**
   * Create an Error with the specified message, config, error code, request and response.
   *
   * @param {string} message The error message.
   * @param {Object} config The config.
   * @param {string} [code] The error code (for example, 'ECONNABORTED').
   * @param {Object} [request] The request.
   * @param {Object} [response] The response.
   * @returns {Error} The created error.
   */
  var createError$2 = function createError(message, config, code, request, response) {
    var error = new Error(message);
    return enhanceError(error, config, code, request, response);
  };

  var createError$1 = createError$2;

  /**
   * Resolve or reject a Promise based on response status.
   *
   * @param {Function} resolve A function that resolves the promise.
   * @param {Function} reject A function that rejects the promise.
   * @param {object} response The response.
   */
  var settle$1 = function settle(resolve, reject, response) {
    var validateStatus = response.config.validateStatus;
    if (!response.status || !validateStatus || validateStatus(response.status)) {
      resolve(response);
    } else {
      reject(createError$1('Request failed with status code ' + response.status, response.config, null, response.request, response));
    }
  };

  var utils$8 = utils$d;
  var cookies$1 = utils$8.isStandardBrowserEnv() ?
  // Standard browser envs support document.cookie
  function standardBrowserEnv() {
    return {
      write: function write(name, value, expires, path, domain, secure) {
        var cookie = [];
        cookie.push(name + '=' + encodeURIComponent(value));
        if (utils$8.isNumber(expires)) {
          cookie.push('expires=' + new Date(expires).toGMTString());
        }
        if (utils$8.isString(path)) {
          cookie.push('path=' + path);
        }
        if (utils$8.isString(domain)) {
          cookie.push('domain=' + domain);
        }
        if (secure === true) {
          cookie.push('secure');
        }
        document.cookie = cookie.join('; ');
      },
      read: function read(name) {
        var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
        return match ? decodeURIComponent(match[3]) : null;
      },
      remove: function remove(name) {
        this.write(name, '', Date.now() - 86400000);
      }
    };
  }() :
  // Non standard browser env (web workers, react-native) lack needed support.
  function nonStandardBrowserEnv() {
    return {
      write: function write() {},
      read: function read() {
        return null;
      },
      remove: function remove() {}
    };
  }();

  /**
   * Determines whether the specified URL is absolute
   *
   * @param {string} url The URL to test
   * @returns {boolean} True if the specified URL is absolute, otherwise false
   */
  var isAbsoluteURL$1 = function isAbsoluteURL(url) {
    // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
    // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
    // by any combination of letters, digits, plus, period, or hyphen.
    return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
  };

  /**
   * Creates a new URL by combining the specified URLs
   *
   * @param {string} baseURL The base URL
   * @param {string} relativeURL The relative URL
   * @returns {string} The combined URL
   */
  var combineURLs$1 = function combineURLs(baseURL, relativeURL) {
    return relativeURL ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '') : baseURL;
  };

  var isAbsoluteURL = isAbsoluteURL$1;
  var combineURLs = combineURLs$1;

  /**
   * Creates a new URL by combining the baseURL with the requestedURL,
   * only when the requestedURL is not already an absolute URL.
   * If the requestURL is absolute, this function returns the requestedURL untouched.
   *
   * @param {string} baseURL The base URL
   * @param {string} requestedURL Absolute or relative URL to combine
   * @returns {string} The combined full path
   */
  var buildFullPath$1 = function buildFullPath(baseURL, requestedURL) {
    if (baseURL && !isAbsoluteURL(requestedURL)) {
      return combineURLs(baseURL, requestedURL);
    }
    return requestedURL;
  };

  var utils$7 = utils$d;

  // Headers whose duplicates are ignored by node
  // c.f. https://nodejs.org/api/http.html#http_message_headers
  var ignoreDuplicateOf = ['age', 'authorization', 'content-length', 'content-type', 'etag', 'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since', 'last-modified', 'location', 'max-forwards', 'proxy-authorization', 'referer', 'retry-after', 'user-agent'];

  /**
   * Parse headers into an object
   *
   * ```
   * Date: Wed, 27 Aug 2014 08:58:49 GMT
   * Content-Type: application/json
   * Connection: keep-alive
   * Transfer-Encoding: chunked
   * ```
   *
   * @param {String} headers Headers needing to be parsed
   * @returns {Object} Headers parsed into an object
   */
  var parseHeaders$1 = function parseHeaders(headers) {
    var parsed = {};
    var key;
    var val;
    var i;
    if (!headers) {
      return parsed;
    }
    utils$7.forEach(headers.split('\n'), function parser(line) {
      i = line.indexOf(':');
      key = utils$7.trim(line.substr(0, i)).toLowerCase();
      val = utils$7.trim(line.substr(i + 1));
      if (key) {
        if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
          return;
        }
        if (key === 'set-cookie') {
          parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
        } else {
          parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
        }
      }
    });
    return parsed;
  };

  var utils$6 = utils$d;
  var isURLSameOrigin$1 = utils$6.isStandardBrowserEnv() ?
  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
  function standardBrowserEnv() {
    var msie = /(msie|trident)/i.test(navigator.userAgent);
    var urlParsingNode = document.createElement('a');
    var originURL;

    /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
    function resolveURL(url) {
      var href = url;
      if (msie) {
        // IE needs attribute set twice to normalize properties
        urlParsingNode.setAttribute('href', href);
        href = urlParsingNode.href;
      }
      urlParsingNode.setAttribute('href', href);

      // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
      return {
        href: urlParsingNode.href,
        protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
        host: urlParsingNode.host,
        search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
        hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
        hostname: urlParsingNode.hostname,
        port: urlParsingNode.port,
        pathname: urlParsingNode.pathname.charAt(0) === '/' ? urlParsingNode.pathname : '/' + urlParsingNode.pathname
      };
    }
    originURL = resolveURL(window.location.href);

    /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
    return function isURLSameOrigin(requestURL) {
      var parsed = utils$6.isString(requestURL) ? resolveURL(requestURL) : requestURL;
      return parsed.protocol === originURL.protocol && parsed.host === originURL.host;
    };
  }() :
  // Non standard browser envs (web workers, react-native) lack needed support.
  function nonStandardBrowserEnv() {
    return function isURLSameOrigin() {
      return true;
    };
  }();

  var utils$5 = utils$d;
  var settle = settle$1;
  var cookies = cookies$1;
  var buildURL$1 = buildURL$2;
  var buildFullPath = buildFullPath$1;
  var parseHeaders = parseHeaders$1;
  var isURLSameOrigin = isURLSameOrigin$1;
  var createError = createError$2;
  var xhr = function xhrAdapter(config) {
    return new Promise(function dispatchXhrRequest(resolve, reject) {
      var requestData = config.data;
      var requestHeaders = config.headers;
      if (utils$5.isFormData(requestData)) {
        delete requestHeaders['Content-Type']; // Let the browser set it
      }

      if ((utils$5.isBlob(requestData) || utils$5.isFile(requestData)) && requestData.type) {
        delete requestHeaders['Content-Type']; // Let the browser set it
      }

      var request = new XMLHttpRequest();

      // HTTP basic authentication
      if (config.auth) {
        var username = config.auth.username || '';
        var password = unescape(encodeURIComponent(config.auth.password)) || '';
        requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
      }
      var fullPath = buildFullPath(config.baseURL, config.url);
      request.open(config.method.toUpperCase(), buildURL$1(fullPath, config.params, config.paramsSerializer), true);

      // Set the request timeout in MS
      request.timeout = config.timeout;

      // Listen for ready state
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }

        // The request errored out and we didn't get a response, this will be
        // handled by onerror instead
        // With one exception: request that using file: protocol, most browsers
        // will return status as 0 even though it's a successful request
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
          return;
        }

        // Prepare the response
        var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
        var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
        var response = {
          data: responseData,
          status: request.status,
          statusText: request.statusText,
          headers: responseHeaders,
          config: config,
          request: request
        };
        settle(resolve, reject, response);

        // Clean up request
        request = null;
      };

      // Handle browser request cancellation (as opposed to a manual cancellation)
      request.onabort = function handleAbort() {
        if (!request) {
          return;
        }
        reject(createError('Request aborted', config, 'ECONNABORTED', request));

        // Clean up request
        request = null;
      };

      // Handle low level network errors
      request.onerror = function handleError() {
        // Real errors are hidden from us by the browser
        // onerror should only fire if it's a network error
        reject(createError('Network Error', config, null, request));

        // Clean up request
        request = null;
      };

      // Handle timeout
      request.ontimeout = function handleTimeout() {
        var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
        if (config.timeoutErrorMessage) {
          timeoutErrorMessage = config.timeoutErrorMessage;
        }
        reject(createError(timeoutErrorMessage, config, 'ECONNABORTED', request));

        // Clean up request
        request = null;
      };

      // Add xsrf header
      // This is only done if running in a standard browser environment.
      // Specifically not if we're in a web worker, or react-native.
      if (utils$5.isStandardBrowserEnv()) {
        // Add xsrf header
        var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ? cookies.read(config.xsrfCookieName) : undefined;
        if (xsrfValue) {
          requestHeaders[config.xsrfHeaderName] = xsrfValue;
        }
      }

      // Add headers to the request
      if ('setRequestHeader' in request) {
        utils$5.forEach(requestHeaders, function setRequestHeader(val, key) {
          if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
            // Remove Content-Type if data is undefined
            delete requestHeaders[key];
          } else {
            // Otherwise add header to the request
            request.setRequestHeader(key, val);
          }
        });
      }

      // Add withCredentials to request if needed
      if (!utils$5.isUndefined(config.withCredentials)) {
        request.withCredentials = !!config.withCredentials;
      }

      // Add responseType to request if needed
      if (config.responseType) {
        try {
          request.responseType = config.responseType;
        } catch (e) {
          // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
          // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
          if (config.responseType !== 'json') {
            throw e;
          }
        }
      }

      // Handle progress if needed
      if (typeof config.onDownloadProgress === 'function') {
        request.addEventListener('progress', config.onDownloadProgress);
      }

      // Not all browsers support upload events
      if (typeof config.onUploadProgress === 'function' && request.upload) {
        request.upload.addEventListener('progress', config.onUploadProgress);
      }
      if (config.cancelToken) {
        // Handle cancellation
        config.cancelToken.promise.then(function onCanceled(cancel) {
          if (!request) {
            return;
          }
          request.abort();
          reject(cancel);
          // Clean up request
          request = null;
        });
      }
      if (!requestData) {
        requestData = null;
      }

      // Send the request
      request.send(requestData);
    });
  };

  var utils$4 = utils$d;
  var normalizeHeaderName = normalizeHeaderName$1;
  var DEFAULT_CONTENT_TYPE = {
    'Content-Type': 'application/x-www-form-urlencoded'
  };
  function setContentTypeIfUnset(headers, value) {
    if (!utils$4.isUndefined(headers) && utils$4.isUndefined(headers['Content-Type'])) {
      headers['Content-Type'] = value;
    }
  }
  function getDefaultAdapter() {
    var adapter;
    if (typeof XMLHttpRequest !== 'undefined') {
      // For browsers use XHR adapter
      adapter = xhr;
    } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
      // For node use HTTP adapter
      adapter = xhr;
    }
    return adapter;
  }
  var defaults$2 = {
    adapter: getDefaultAdapter(),
    transformRequest: [function transformRequest(data, headers) {
      normalizeHeaderName(headers, 'Accept');
      normalizeHeaderName(headers, 'Content-Type');
      if (utils$4.isFormData(data) || utils$4.isArrayBuffer(data) || utils$4.isBuffer(data) || utils$4.isStream(data) || utils$4.isFile(data) || utils$4.isBlob(data)) {
        return data;
      }
      if (utils$4.isArrayBufferView(data)) {
        return data.buffer;
      }
      if (utils$4.isURLSearchParams(data)) {
        setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
        return data.toString();
      }
      if (utils$4.isObject(data)) {
        setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
        return JSON.stringify(data);
      }
      return data;
    }],
    transformResponse: [function transformResponse(data) {
      /*eslint no-param-reassign:0*/
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) {/* Ignore */}
      }
      return data;
    }],
    /**
     * A timeout in milliseconds to abort a request. If set to 0 (default) a
     * timeout is not created.
     */
    timeout: 0,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
    maxContentLength: -1,
    maxBodyLength: -1,
    validateStatus: function validateStatus(status) {
      return status >= 200 && status < 300;
    }
  };
  defaults$2.headers = {
    common: {
      'Accept': 'application/json, text/plain, */*'
    }
  };
  utils$4.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
    defaults$2.headers[method] = {};
  });
  utils$4.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
    defaults$2.headers[method] = utils$4.merge(DEFAULT_CONTENT_TYPE);
  });
  var defaults_1 = defaults$2;

  var utils$3 = utils$d;
  var transformData = transformData$1;
  var isCancel = isCancel$1;
  var defaults$1 = defaults_1;

  /**
   * Throws a `Cancel` if cancellation has been requested.
   */
  function throwIfCancellationRequested(config) {
    if (config.cancelToken) {
      config.cancelToken.throwIfRequested();
    }
  }

  /**
   * Dispatch a request to the server using the configured adapter.
   *
   * @param {object} config The config that is to be used for the request
   * @returns {Promise} The Promise to be fulfilled
   */
  var dispatchRequest$1 = function dispatchRequest(config) {
    throwIfCancellationRequested(config);

    // Ensure headers exist
    config.headers = config.headers || {};

    // Transform request data
    config.data = transformData(config.data, config.headers, config.transformRequest);

    // Flatten headers
    config.headers = utils$3.merge(config.headers.common || {}, config.headers[config.method] || {}, config.headers);
    utils$3.forEach(['delete', 'get', 'head', 'post', 'put', 'patch', 'common'], function cleanHeaderConfig(method) {
      delete config.headers[method];
    });
    var adapter = config.adapter || defaults$1.adapter;
    return adapter(config).then(function onAdapterResolution(response) {
      throwIfCancellationRequested(config);

      // Transform response data
      response.data = transformData(response.data, response.headers, config.transformResponse);
      return response;
    }, function onAdapterRejection(reason) {
      if (!isCancel(reason)) {
        throwIfCancellationRequested(config);

        // Transform response data
        if (reason && reason.response) {
          reason.response.data = transformData(reason.response.data, reason.response.headers, config.transformResponse);
        }
      }
      return Promise.reject(reason);
    });
  };

  var utils$2 = utils$d;

  /**
   * Config-specific merge-function which creates a new config-object
   * by merging two configuration objects together.
   *
   * @param {Object} config1
   * @param {Object} config2
   * @returns {Object} New object resulting from merging config2 to config1
   */
  var mergeConfig$2 = function mergeConfig(config1, config2) {
    // eslint-disable-next-line no-param-reassign
    config2 = config2 || {};
    var config = {};
    var valueFromConfig2Keys = ['url', 'method', 'data'];
    var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy', 'params'];
    var defaultToConfig2Keys = ['baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer', 'timeout', 'timeoutMessage', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName', 'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'decompress', 'maxContentLength', 'maxBodyLength', 'maxRedirects', 'transport', 'httpAgent', 'httpsAgent', 'cancelToken', 'socketPath', 'responseEncoding'];
    var directMergeKeys = ['validateStatus'];
    function getMergedValue(target, source) {
      if (utils$2.isPlainObject(target) && utils$2.isPlainObject(source)) {
        return utils$2.merge(target, source);
      } else if (utils$2.isPlainObject(source)) {
        return utils$2.merge({}, source);
      } else if (utils$2.isArray(source)) {
        return source.slice();
      }
      return source;
    }
    function mergeDeepProperties(prop) {
      if (!utils$2.isUndefined(config2[prop])) {
        config[prop] = getMergedValue(config1[prop], config2[prop]);
      } else if (!utils$2.isUndefined(config1[prop])) {
        config[prop] = getMergedValue(undefined, config1[prop]);
      }
    }
    utils$2.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
      if (!utils$2.isUndefined(config2[prop])) {
        config[prop] = getMergedValue(undefined, config2[prop]);
      }
    });
    utils$2.forEach(mergeDeepPropertiesKeys, mergeDeepProperties);
    utils$2.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
      if (!utils$2.isUndefined(config2[prop])) {
        config[prop] = getMergedValue(undefined, config2[prop]);
      } else if (!utils$2.isUndefined(config1[prop])) {
        config[prop] = getMergedValue(undefined, config1[prop]);
      }
    });
    utils$2.forEach(directMergeKeys, function merge(prop) {
      if (prop in config2) {
        config[prop] = getMergedValue(config1[prop], config2[prop]);
      } else if (prop in config1) {
        config[prop] = getMergedValue(undefined, config1[prop]);
      }
    });
    var axiosKeys = valueFromConfig2Keys.concat(mergeDeepPropertiesKeys).concat(defaultToConfig2Keys).concat(directMergeKeys);
    var otherKeys = Object.keys(config1).concat(Object.keys(config2)).filter(function filterAxiosKeys(key) {
      return axiosKeys.indexOf(key) === -1;
    });
    utils$2.forEach(otherKeys, mergeDeepProperties);
    return config;
  };

  var utils$1 = utils$d;
  var buildURL = buildURL$2;
  var InterceptorManager = InterceptorManager_1;
  var dispatchRequest = dispatchRequest$1;
  var mergeConfig$1 = mergeConfig$2;

  /**
   * Create a new instance of Axios
   *
   * @param {Object} instanceConfig The default config for the instance
   */
  function Axios$1(instanceConfig) {
    this.defaults = instanceConfig;
    this.interceptors = {
      request: new InterceptorManager(),
      response: new InterceptorManager()
    };
  }

  /**
   * Dispatch a request
   *
   * @param {Object} config The config specific for this request (merged with this.defaults)
   */
  Axios$1.prototype.request = function request(config) {
    /*eslint no-param-reassign:0*/
    // Allow for axios('example/url'[, config]) a la fetch API
    if (typeof config === 'string') {
      config = arguments[1] || {};
      config.url = arguments[0];
    } else {
      config = config || {};
    }
    config = mergeConfig$1(this.defaults, config);

    // Set config.method
    if (config.method) {
      config.method = config.method.toLowerCase();
    } else if (this.defaults.method) {
      config.method = this.defaults.method.toLowerCase();
    } else {
      config.method = 'get';
    }

    // Hook up interceptors middleware
    var chain = [dispatchRequest, undefined];
    var promise = Promise.resolve(config);
    this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
      chain.unshift(interceptor.fulfilled, interceptor.rejected);
    });
    this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
      chain.push(interceptor.fulfilled, interceptor.rejected);
    });
    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }
    return promise;
  };
  Axios$1.prototype.getUri = function getUri(config) {
    config = mergeConfig$1(this.defaults, config);
    return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
  };

  // Provide aliases for supported request methods
  utils$1.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
    /*eslint func-names:0*/
    Axios$1.prototype[method] = function (url, config) {
      return this.request(mergeConfig$1(config || {}, {
        method: method,
        url: url
      }));
    };
  });
  utils$1.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
    /*eslint func-names:0*/
    Axios$1.prototype[method] = function (url, data, config) {
      return this.request(mergeConfig$1(config || {}, {
        method: method,
        url: url,
        data: data
      }));
    };
  });
  var Axios_1 = Axios$1;

  /**
   * A `Cancel` is an object that is thrown when an operation is canceled.
   *
   * @class
   * @param {string=} message The message.
   */
  function Cancel$1(message) {
    this.message = message;
  }
  Cancel$1.prototype.toString = function toString() {
    return 'Cancel' + (this.message ? ': ' + this.message : '');
  };
  Cancel$1.prototype.__CANCEL__ = true;
  var Cancel_1 = Cancel$1;

  var Cancel = Cancel_1;

  /**
   * A `CancelToken` is an object that can be used to request cancellation of an operation.
   *
   * @class
   * @param {Function} executor The executor function.
   */
  function CancelToken(executor) {
    if (typeof executor !== 'function') {
      throw new TypeError('executor must be a function.');
    }
    var resolvePromise;
    this.promise = new Promise(function promiseExecutor(resolve) {
      resolvePromise = resolve;
    });
    var token = this;
    executor(function cancel(message) {
      if (token.reason) {
        // Cancellation has already been requested
        return;
      }
      token.reason = new Cancel(message);
      resolvePromise(token.reason);
    });
  }

  /**
   * Throws a `Cancel` if cancellation has been requested.
   */
  CancelToken.prototype.throwIfRequested = function throwIfRequested() {
    if (this.reason) {
      throw this.reason;
    }
  };

  /**
   * Returns an object that contains a new `CancelToken` and a function that, when called,
   * cancels the `CancelToken`.
   */
  CancelToken.source = function source() {
    var cancel;
    var token = new CancelToken(function executor(c) {
      cancel = c;
    });
    return {
      token: token,
      cancel: cancel
    };
  };
  var CancelToken_1 = CancelToken;

  /**
   * Syntactic sugar for invoking a function and expanding an array for arguments.
   *
   * Common use case would be to use `Function.prototype.apply`.
   *
   *  ```js
   *  function f(x, y, z) {}
   *  var args = [1, 2, 3];
   *  f.apply(null, args);
   *  ```
   *
   * With `spread` this example can be re-written.
   *
   *  ```js
   *  spread(function(x, y, z) {})([1, 2, 3]);
   *  ```
   *
   * @param {Function} callback
   * @returns {Function}
   */
  var spread = function spread(callback) {
    return function wrap(arr) {
      return callback.apply(null, arr);
    };
  };

  var utils = utils$d;
  var bind = bind$2;
  var Axios = Axios_1;
  var mergeConfig = mergeConfig$2;
  var defaults = defaults_1;

  /**
   * Create an instance of Axios
   *
   * @param {Object} defaultConfig The default config for the instance
   * @return {Axios} A new instance of Axios
   */
  function createInstance(defaultConfig) {
    var context = new Axios(defaultConfig);
    var instance = bind(Axios.prototype.request, context);

    // Copy axios.prototype to instance
    utils.extend(instance, Axios.prototype, context);

    // Copy context to instance
    utils.extend(instance, context);
    return instance;
  }

  // Create the default instance to be exported
  var axios$1 = createInstance(defaults);

  // Expose Axios class to allow class inheritance
  axios$1.Axios = Axios;

  // Factory for creating new instances
  axios$1.create = function create(instanceConfig) {
    return createInstance(mergeConfig(axios$1.defaults, instanceConfig));
  };

  // Expose Cancel & CancelToken
  axios$1.Cancel = Cancel_1;
  axios$1.CancelToken = CancelToken_1;
  axios$1.isCancel = isCancel$1;

  // Expose all/spread
  axios$1.all = function all(promises) {
    return Promise.all(promises);
  };
  axios$1.spread = spread;
  axios$2.exports = axios$1;

  // Allow use of default import syntax in TypeScript
  axios$2.exports.default = axios$1;

  var axios = axios$2.exports;

  // Port number is specific to the local-services property in the widget (config.xml)
  const ASPort = {
    DOBBY: 9004,
    LOCAL: 9005
  };
  const HTTPMethod = {
    GET: "get",
    POST: "post"
  };
  const ASMethod = {
    WATCH_STREAM: "/as/players/1/action/watchstream",
    WATCH_INPUT: "/as/players/1/action/watchinput",
    STOP: "/as/players/1/action/stop"
  };
  class SkyASPlayer {
    constructor(thunderWrapper) {
      this.thunderWrapper = thunderWrapper;
    }
    async watchStream(asParams) {
      VideoResizer.resizeToFullScreen(PlayerId.DEFAULT_AS_PLAYER);
      return await this.httpRequest(HTTPMethod.POST, ASMethod.WATCH_STREAM, asParams);
    }

    // TODO: Utilize this one for HDMI cast
    async watchInput(asParams) {
      VideoResizer.resizeToFullScreen(PlayerId.DEFAULT_AS_PLAYER);
      return await this.httpRequest(HTTPMethod.POST, ASMethod.WATCH_INPUT, asParams);
    }
    async stop() {
      return await this.httpRequest(HTTPMethod.POST, ASMethod.STOP);
    }

    // Make HTTP request and return whether successful
    async httpRequest(httpMethod, asMethod, asParams) {
      let data = "";
      let url = "http://".concat(this.thunderWrapper.hostIP, ":").concat(this.thunderWrapper.containerized ? ASPort.DOBBY : ASPort.LOCAL).concat(asMethod).concat(this.getQueryString(asParams));
      let config = {
        method: httpMethod,
        url: url,
        headers: {},
        data: data
      };
      axios(config).then(function (response) {
        console.log("SkyASPlayer: httpRequest returned " + JSON.stringify(response.data));
      }).catch(function (error) {
        console.log("SkyASPlayer: httpRequest returned " + JSON.stringify(error));
        return false;
      });
      return true;
    }

    // Get query string to pass to AS method
    getQueryString(asParams) {
      let queryString = "";
      if (asParams !== undefined) {
        let i = 0;
        for (const key in asParams) {
          if (i === 0) {
            queryString += "?";
          } else {
            queryString += "&";
          }
          queryString += "".concat(key, "=").concat(asParams[key]);
          i++;
        }
      }
      return queryString;
    }
  }

  const asParams$1 = {
    uri: "http%3A%2F%2Fcommondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    format: "HLS"
  };
  const cherryAppName$1 = "uk.sky.cherry.greenscreendemo";
  class GreenScreenDemo extends Lightning.Component {
    _firstEnable() {
      this.resolution = Resolution.RES_1920x1080;
      this.mode = Mode.TEXTURE;
    }
    _enable() {
      console.log("GreenScreenDemo: enable()");
      this.isRunning = false;
      this.start();
    }
    _handleCenter() {
      if (this.isRunning) {
        this.stop();
      } else {
        this.start();
      }
    }
    start() {
      if (!this.isRunning) {
        this.thunderWrapper.getCastConnectionStatus().then(_ref => {
          let [ipAddress, videoPort] = _ref;
          this.ipAddress = ipAddress;
          this.videoPort = videoPort;
          this.startBackgroundPlayer();
          this.timerID = setTimeout(this.startGreenScreen, 1000, this);
          this.isRunning = true;
        }, () => {});
      }
    }
    stop() {
      if (this.isRunning) {
        clearTimeout(this.timerID);
        this.stopGreenScreenAvCastPlayer();
        this.stopCherryApp();
        this.stopBackgroundPlayer();
        this.isRunning = false;
      }
    }
    startGreenScreen(self) {
      self.startCherryApp(self);
      self.timerID = setTimeout(self.startGreenScreenAvCastPlayer, 1000, self);
    }
    startCherryApp(self) {
      self.thunderWrapper.launchApp(cherryAppName$1);
    }
    stopCherryApp() {
      this.keyHandler.sendHomeKey();
    }
    async startGreenScreenAvCastPlayer(self) {
      await self.avCastPlayer.start(self.ipAddress, self.videoPort, self.mode, self.resolution, undefined, true);
    }
    stopGreenScreenAvCastPlayer() {
      this.avCastPlayer.stop();
    }
    playbackCompleted() {
      this.startPlayback();
    }
    startBackgroundPlayer() {
      this.skyASPlayer.watchStream(asParams$1);
    }
    stopBackgroundPlayer() {
      this.skyASPlayer.stop();
    }
    configure(thunderWrapper, keyHandler, avCastPlayer) {
      this.thunderWrapper = thunderWrapper;
      this.keyHandler = keyHandler;
      this.avCastPlayer = avCastPlayer;
      this.skyASPlayer = new SkyASPlayer(thunderWrapper);
    }
    terminate() {
      this.stop();
    }
  }

  class AppsList extends Lightning.Component {
    static _template() {
      return {
        rect: true,
        w: 1,
        h: 1,
        color: 0x00000000,
        clipping: true
      };
    }

    // Configuration from url (GET) will overwrite config from file.
    // For dev or emergency
    // usage: http://ip:port/index.html?appListConfig=encodedJson
    // Use "appListConfig" parameter and convert configuration json using percent encoding
    loadConfigFromUrl() {
      let queryDict = {};
      location.search.substr(1).split("&").forEach(function (item) {
        queryDict[item.split("=")[0]] = item.split("=")[1];
      });
      const encodedConfig = queryDict["appListConfig"];
      if (encodedConfig !== undefined) {
        const decodedConfig = decodeURIComponent(encodedConfig);
        console.log("AppsList: appListConfig from url: ", decodedConfig);
        this.config = JSON.parse(encodedConfig);
        return true;
      }
      return false;
    }
    loadInstalledApps() {
      return this.thunderWrapper.getInstalledAppList().then(result => {
        this.installedApps = result;
        console.log("AppsList: apps installed on device: " + this.installedApps);
      }, error => {
        console.log("AppsList: " + error);
        this.installedApps = [];
      }).catch(err => {
        console.log("AppsList: " + err);
        this.installedApps = [];
      });
    }
    async loadConfigFile() {
      const res = await fetch(Utils.asset("apps-list-config.json"));
      const json = await res.json();
      console.log("AppsList: appListConfig from file: " + JSON.stringify(json));
      this.config = json;
    }
    async _firstEnable() {
      this.deviceConnected = false;
      if (!this.loadConfigFromUrl()) {
        await this.loadConfigFile();
      }
      await this.thunderWrapper.registerDeviceBridgeConnectionStatusChangedCallback(this.updateDeviceBridgeStatus.bind(this));
    }
    updateDeviceBridgeStatus(status) {
      const [connected] = status;
      if (connected === true) {
        this.onDeviceConnected();
      } else {
        this.onDeviceDisconnected();
      }
    }
    onDeviceConnected() {
      if (this.deviceConnected === false) {
        console.log("AppList: device was connected");
        this.deviceConnected = true;
        this.refresh();
      }
    }
    onDeviceDisconnected() {
      if (this.deviceConnected === true) {
        console.log("AppList: device was disconnected");
        this.deviceConnected = false;
        this.refresh();
      }
    }
    refresh() {
      console.log("AppsList: refresh()");
      this.loadInstalledApps().then(() => {
        return this.update();
      }).catch(err => console.log("AppsList: " + err));
    }
    fillApps() {
      this.apps = this.config.apps.filter(app => {
        return app.visible && this.installedApps.find(el => el === app.appName);
      });
      this.apps.sort((a, b) => {
        return a.position - b.position;
      });
      if (this.apps.length !== 0) {
        this.fillDuplicates();
      }
    }
    fillDuplicates() {
      const missingAppsCount = this.config.visibleIconsCount - this.apps.length;
      if (missingAppsCount > 0) {
        if (missingAppsCount !== 1) {
          for (let i = 0; i < missingAppsCount; ++i) {
            this.apps.push(this.apps[i]);
          }
        } else {
          // Special case - Don't duplicate neighbour - looks better
          this.apps.push(this.apps[1]);
        }
      }
    }
    update() {
      console.log("AppsList: update()");
      this.patch({
        w: this.config.visibleIconsCount * this.config.iconWidth + (this.config.visibleIconsCount + 1) * this.config.iconsSpacing,
        h: this.config.iconsSpacing * 2 + this.config.iconHeight
      });
      this.fillApps();
      this.apps.length === 0 ? this.clearIcons() : this.fillIcons();
      console.log("AppsList: Component updated");
    }
    clearIcons() {
      this.children = [];
    }
    fillIcons() {
      let icons = this.apps.slice(0, this.config.visibleIconsCount);
      icons.push(icons[0]);
      this.children = icons.map((appParam, index) => {
        return {
          x: (this.config.iconsSpacing + this.config.iconWidth) * index + this.config.iconsSpacing,
          y: this.config.iconsSpacing,
          w: this.config.iconWidth,
          h: this.config.iconHeight,
          alpha: this.config.backgroundIconAlpha,
          src: Utils.asset(appParam.imgPath),
          shader: {
            type: Lightning.shaders.RoundedRectangle,
            radius: 20
          }
        };
      });
      this.enteringIcon = this.children[this.children.length - 1];
      const activeIconIndex = (this.config.visibleIconsCount - 1) / 2;
      this.children[activeIconIndex].patch({
        alpha: 1
      });
      this.children[activeIconIndex].patch({
        scale: this.config.aciveAppIconScale
      });
      this.ongoingAnimationsCount = 0;
    }
    get activeApp() {
      console.log("AppsList: activeApp()");
      return this.apps[(this.config.visibleIconsCount - 1) / 2];
    }
    rotateRight() {
      console.log("AppsList: rotateRight()");
      if (this.ongoingAnimationsCount > 0 || this.children.length === 0) {
        return;
      }
      let mostRightApp = this.apps[this.apps.length - 1];
      this.enteringIcon.patch({
        x: 0 - this.config.iconWidth,
        src: Utils.asset(mostRightApp.imgPath)
      });
      let lastActiveIcon = this.children[(this.config.visibleIconsCount - 1) / 2];
      this.childList.addAt(this.enteringIcon, 0);
      let newActiveIcon = this.children[(this.config.visibleIconsCount - 1) / 2];
      this.rotateIcons(1, newActiveIcon, lastActiveIcon);
      this.enteringIcon = this.children[this.children.length - 1];
      this.apps.unshift(this.apps.pop());
    }
    rotateLeft() {
      console.log("AppsList: rotateLeft()");
      if (this.ongoingAnimationsCount > 0 || this.children.length === 0) {
        return;
      }
      let mostLeftApp;
      if (this.apps.length === this.config.visibleIconsCount) {
        mostLeftApp = this.apps[0];
      } else {
        mostLeftApp = this.apps[this.config.visibleIconsCount];
      }
      this.enteringIcon.patch({
        x: this.w,
        src: Utils.asset(mostLeftApp.imgPath)
      });
      let lastActiveIcon = this.children[(this.config.visibleIconsCount - 1) / 2];
      this.childList.addAt(this.children[0], this.children.length - 1);
      let newActiveIcon = this.children[(this.config.visibleIconsCount - 1) / 2];
      this.rotateIcons(-1, newActiveIcon, lastActiveIcon);
      this.enteringIcon = this.children[this.children.length - 1];
      this.apps.push(this.apps.shift());
    }
    rotateIcons(direction, newActiveIcon, lastActiveIcon) {
      this.ongoingAnimationsCount = this.children.length;
      for (let i = 0; i < this.children.length; ++i) {
        let paramsChanges = [{
          p: "x",
          v: {
            0: this.children[i].x,
            1: this.children[i].x + direction * (this.config.iconsSpacing + this.config.iconWidth)
          }
        }];
        switch (this.children[i]) {
          case newActiveIcon:
            paramsChanges.push({
              p: "scale",
              v: {
                0: this.children[i].scale,
                1: this.config.aciveAppIconScale
              }
            }, {
              p: "alpha",
              v: {
                0: this.children[i].alpha,
                1: 1
              }
            });
            break;
          case lastActiveIcon:
            paramsChanges.push({
              p: "scale",
              v: {
                0: this.children[i].scale,
                1: 1
              }
            }, {
              p: "alpha",
              v: {
                0: this.children[i].alpha,
                1: this.config.backgroundIconAlpha
              }
            });
            break;
        }
        let animation = this.children[i].animation({
          duration: this.config.animationDuration,
          repeat: 0,
          stopMethod: "immediate",
          actions: paramsChanges
        });
        animation.on("finish", () => {
          --this.ongoingAnimationsCount;
        });
        animation.play();
      }
    }
    configure(thunderWrapper) {
      this.thunderWrapper = thunderWrapper;
    }
  }

  const State = {
    READY: "READY",
    LAUNCHING: "LAUNCHING",
    FOREGROUND: "FOREGROUND",
    BACKGROUND: "BACKGROUND",
    CLOSING: "CLOSING",
    TERMINATED: "TERMINATED",
    UNKNOWN: "UNKNOWN"
  };
  Object.freeze(State);

  const CHERRY_PACKAGE_NAME = "uk.sky.cherry.launcher";
  class DemoMenu extends Lightning.Component {
    static _template() {
      return {
        Logo: {
          x: 960,
          y: 420,
          w: 603,
          h: 369,
          mount: 0.5,
          src: Utils.asset("images/sky-logo.png"),
          alpha: this.bindProp("logoAlpha")
        },
        RotableAppList: {
          type: AppsList,
          x: 960,
          y: 720,
          mount: 0.5,
          alpha: this.bindProp("demoMenuAlpha")
        },
        CherryAppLauncher: {
          type: CherryAppLauncher,
          alpha: this.bindProp("cherryAppLauncherAlpha"),
          longpress: {
            playpause: 500
          }
        },
        GreenScreenDemo: {
          type: GreenScreenDemo,
          alpha: this.bindProp("greenScreenDemoAlpha")
        }
      };
    }
    static _states() {
      return [class DemoMenuState extends this {
        $enter() {
          this.showDemoMenu();
        }
        _getFocused() {
          console.log("DemoMenuState: _getFocused()");
          return this.tag(this.state);
        }
        _next() {
          this.tag("RotableAppList").rotateRight();
        }
        _prev() {
          this.tag("RotableAppList").rotateLeft();
        }
        _handleUp() {
          this._prev();
        }
        _handleLeft() {
          this._prev();
        }
        _handleRight() {
          this._next();
        }
        _handleDown() {
          this._next();
        }
        _handleCenter() {
          console.log("DemoMenuState _handleCenter");
          this.runApp();
        }
      }, class CherryAppLauncherState extends this {
        $enter() {
          this.longPress = false;
          this.showCherryAppLauncher();
        }
        $exit() {
          console.log("CherryAppLauncherState: $exit()");
          this.showDemoMenu();
        }
        _capturePlayPauseLong() {
          this.longPress = true;
        }
        _capturePlayPauseRelease() {
          if (this.longPress === false) {
            return false; // Allows other component to handle key event
          }

          this.terminateCherryAppLauncher();
        }
        _getFocused() {
          console.log("CherryAppLauncherState: _getFocused()");
          return this.tag("CherryAppLauncher");
        }
        _handleCenter() {
          console.log("CherryAppLauncherState _handleCenter");
        }
      }, class GreenScreenDemoState extends this {
        $enter() {
          this.showGreenScreenDemo();
        }
        $exit() {
          console.log("GreenScreenDemoState: $exit()");
          this.showDemoMenu();
        }
        _capturePlayPause() {
          console.log("GreenScreenDemoState: _capturePlayPause()");
          this.terminateGreenScreenDemo();
        }
        _getFocused() {
          console.log("GreenScreenDemoState: _getFocused()");
          return this.tag("GreenScreenDemo");
        }
        _handleCenter() {
          console.log("GreenScreenDemoState _handleCenter");
        }
      }];
    }
    _firstEnable() {
      console.log("DemoMenu: _firstEnable()");
      this.appIdx = 0;
      this.deviceConnected = false;
      this.showDemoMenu();
      this._setState("DemoMenuState");
    }
    showDemoMenu() {
      this.logoAlpha = 1;
      this.demoMenuAlpha = 1;
      this.cherryAppLauncherAlpha = 0;
      this.greenScreenDemoAlpha = 0;
    }
    showCherryAppLauncher() {
      this.logoAlpha = 0;
      this.demoMenuAlpha = 0;
      this.cherryAppLauncherAlpha = 1;
    }
    showGreenScreenDemo() {
      this.logoAlpha = 0;
      this.demoMenuAlpha = 0;
      this.greenScreenDemoAlpha = 1;
    }
    runApp() {
      console.log("DemoMenu: runApp()");
      let app = this.tag("RotableAppList").activeApp;
      if (app.appType !== "GreenScreenDemo") {
        this.tag("CherryAppLauncher").setupApp(app.appName, app.friendlyAppName);
        this.tag("CherryAppLauncher").launchApp();
      }
      console.log("nextState = " + app.appType + "State");
      this._setState(app.appType + "State");
    }
    configure(thunderWrapper, keyHandler, avCastPlayer, systemAudioPlayer, videoPlayer) {
      this.thunderWrapper = thunderWrapper;
      this.tag("CherryAppLauncher").configure(thunderWrapper, keyHandler, videoPlayer);
      this.tag("GreenScreenDemo").configure(thunderWrapper, keyHandler, avCastPlayer, systemAudioPlayer);
      this.tag("RotableAppList").configure(thunderWrapper);
      this.thunderWrapper.registerDeviceBridgeOnAppStateChangeCallback(this.onAppStateChange.bind(this));
      this.thunderWrapper.registerDeviceBridgeConnectionStatusChangedCallback(this.onConnectionStatusChanged.bind(this));
      this.thunderWrapper.createDisplay({
        "client": "avcast",
        "displayName": "westeros-asplayer-0"
      });
      this.thunderWrapper.setDisplays({
        "displays": [{
          "id": 1,
          "display": "westeros-asplayer-0"
        }, {
          "id": 2,
          "display": "westeros-asplayer-1"
        }]
      });
    }
    onAppStateChange(notification) {
      if (notification.packageName === CHERRY_PACKAGE_NAME && notification.state === State.FOREGROUND && this.cherryAppLauncherAlpha === 1) {
        console.log("App in CherryAppLauncher state while Cherry Launcher is going back to foreground");
        this.terminateCherryAppLauncher();
      }
    }
    onConnectionStatusChanged(status) {
      const [connected] = status;
      if (connected === true) {
        this.thunderWrapper.sendMacAddress();
      }
      if (this.deviceConnected != connected) {
        this.deviceConnected = connected;
        if (connected === false) {
          console.log("DemoMenu: Device lost! Going to make some cleanup");
          if (this.cherryAppLauncherAlpha === 1) {
            this.terminateCherryAppLauncher();
          }
          if (this.greenScreenDemoAlpha === 1) {
            this.terminateGreenScreenDemo();
          }
        }
      }
    }
    async terminateCherryAppLauncher() {
      console.log("DemoMenu: Terminate Cherry App Launcher");
      await this.tag("CherryAppLauncher").terminate();
      this._setState("DemoMenuState");
    }
    terminateGreenScreenDemo() {
      console.log("DemoMenu: Terminate Green Screen Demo");
      this.tag("GreenScreenDemo").terminate();
      this._setState("DemoMenuState");
    }
  }

  class Button extends Lightning.Component {
    static _template() {
      return {
        w: 600,
        h: 100,
        color: 0xff616161,
        texture: Lightning.Tools.getRoundRect(600, 100, 4),
        Label: {
          x: w => w / 2,
          y: 52,
          mount: 0.5,
          color: 0xffcacaca,
          text: {
            fontSize: 64,
            fontStyle: 'italic'
          }
        }
      };
    }
    _firstEnable() {
      if (this.label) {
        this.tag('Label').patch({
          text: {
            text: this.label
          }
        });
      }
      if (this.style) {
        this.tag('Label').patch({
          text: {
            fontStyle: this.style
          }
        });
      }
      if (this.labelY) {
        this.tag('Label').patch({
          y: this.labelY
        });
      }
      if (this.width) {
        this.tag('Label').patch({
          x: this.width / 2
        });
        this.patch({
          w: this.width
        });
      }
      if (this.fontSize) {
        this.tag('Label').patch({
          text: {
            fontSize: this.fontSize
          }
        });
      }
      if (this.buttonTexture) {
        this.patch({
          texture: this.buttonTexture
        });
      }
    }
    _focus() {
      this.color = 0xffababab;
      this.tag('Label').color = 0xff333333;
    }
    _unfocus() {
      this.color = 0xff616161;
      this.tag('Label').color = 0xffcacaca;
    }
    updateLabel(label) {
      this.label = label;
      this.tag('Label').patch({
        text: {
          text: label
        }
      });
    }
    getLabel() {
      return this.label;
    }
  }

  const CastState$1 = {
    INACTIVE: 0,
    PENDING: 1,
    ACTIVE: 2
  };
  const castInactiveText$1 = "Press CENTER to start casting";
  const castPendingText$1 = "Checking connecton...";
  const castActiveText$1 = "Press CENTER to stop casting";
  class CastTest extends Lightning.Component {
    static _template() {
      return {
        x: 0,
        y: 0,
        w: 1920,
        h: 1080,
        Message: {
          x: 40,
          y: 20,
          text: {
            text: this.bindProp("messageText"),
            color: 0xff20ba81,
            fontSize: 18
          }
        }
      };
    }
    _enable() {
      this.castState = CastState$1.INACTIVE;
      this.updateMessage();
    }
    _getFocused() {
      return this.tag("CastTest");
    }
    _handleCenter() {
      switch (this.castState) {
        case CastState$1.INACTIVE:
          this.castState = CastState$1.PENDING;
          this.startCast();
          break;
        case CastState$1.ACTIVE:
          this.stopCast();
          break;
      }
    }
    configure(thunderWrapper, avCastPlayer) {
      this.thunderWrapper = thunderWrapper;
      this.avCastPlayer = avCastPlayer;
    }
    startCast() {
      console.log("startCast");
      this.thunderWrapper.getCastConnectionStatus().then(_ref => {
        let [cherryIP, videoPort] = _ref;
        this.cherryIP = cherryIP;
        this.videoPort = videoPort;
        this.play();
      }, () => {
        this.castState = CastState$1.INACTIVE;
        this.updateMessage();
      });
    }
    async play() {
      console.log("play");
      let result = await this.avCastPlayer.start(this.cherryIP, this.videoPort, Mode.VIDEO, Resolution.RES_1920x1080, undefined, false);
      if (!result.success) {
        console.error("Failed to start cast.");
        return;
      }
      this.castState = CastState$1.ACTIVE;
      this.updateMessage();
    }
    stopCast() {
      console.log("stopCast");
      this.avCastPlayer.stop();
      this.castState = CastState$1.INACTIVE;
      this.updateMessage();
    }

    // Note that this is only called on exit from the test menu
    // This allows cast and key tests to run together
    exitCast() {
      if (this.castState == CastState$1.ACTIVE) {
        this.stopCast();
      } else {
        // Catch exiting while in a pending state
        this.castState = this.INACTIVE;
      }
    }
    updateMessage() {
      console.log("updateMessage " + this.castState);
      switch (this.castState) {
        case CastState$1.INACTIVE:
          this.messageText = castInactiveText$1;
          break;
        case CastState$1.PENDING:
          this.messageText = castPendingText$1;
          break;
        case CastState$1.ACTIVE:
          this.messageText = castActiveText$1;
          break;
      }
    }
  }

  const CastState = {
    INACTIVE: 0,
    PENDING: 1,
    ACTIVE: 2
  };
  const castInactiveText = "Press CENTER to start audio cast";
  const castPendingText = "Checking connecton...";
  const castActiveText = "Press CENTER to stop audio cast";
  class AudioCastTest extends Lightning.Component {
    static _template() {
      return {
        x: 0,
        y: 0,
        w: 1920,
        h: 1080,
        Message: {
          x: 40,
          y: 20,
          text: {
            text: this.bindProp("messageText"),
            color: 0xff20ba81,
            fontSize: 18
          }
        }
      };
    }
    _enable() {
      this.castState = CastState.INACTIVE;
      this.updateMessage();
    }
    _getFocused() {
      return this.tag("AudioCastTest");
    }
    _handleCenter() {
      switch (this.castState) {
        case CastState.INACTIVE:
          this.castState = CastState.PENDING;
          this.startAudioCast();
          break;
        case CastState.ACTIVE:
          this.stopAudioCast();
          break;
      }
    }
    configure(thunderWrapper, avCastPlayer, audioPlayer) {
      this.thunderWrapper = thunderWrapper;
      this.avCastPlayer = avCastPlayer;
      this.audioPlayer = audioPlayer;
    }
    startAudioCast() {
      console.log("startAudioCast");
      this.thunderWrapper.getCastConnectionStatus().then(_ref => {
        let [cherryIP] = _ref;
        this.play(cherryIP);
      }, () => {
        this.castState = CastState.INACTIVE;
        this.updateMessage();
      });
    }
    async play(cherryIP) {
      console.log("playing audio cast with ip " + cherryIP);
      this.castState = CastState.ACTIVE;
      this.updateMessage();
    }
    async stopAudioCast() {
      console.log("stopCast");
      this.castState = CastState.INACTIVE;
      this.updateMessage();
    }

    // Note that this is only called on exit from the test menu
    // This allows cast and key tests to run together
    exitCast() {
      if (this.castState == CastState.ACTIVE) {
        this.stopCast();
      } else {
        // Catch exiting while in a pending state
        this.castState = this.INACTIVE;
      }
    }
    updateMessage() {
      console.log("update audio cast message " + this.castState);
      switch (this.castState) {
        case CastState.INACTIVE:
          this.messageText = castInactiveText;
          break;
        case CastState.PENDING:
          this.messageText = castPendingText;
          break;
        case CastState.ACTIVE:
          this.messageText = castActiveText;
          break;
      }
    }
  }

  const rowLength = 3;
  const colLength = 3;
  const numAppsPerPage = rowLength * colLength;
  class AppTest extends Lightning.Component {
    static _template() {
      return {
        ButtonList: {
          Button1: {
            type: Button,
            label: "1",
            x: 40,
            y: 300
          },
          Button2: {
            type: Button,
            label: "2",
            x: 660,
            y: 300
          },
          Button3: {
            type: Button,
            label: "3",
            x: 1280,
            y: 300
          },
          Button4: {
            type: Button,
            label: "4",
            x: 40,
            y: 450
          },
          Button5: {
            type: Button,
            label: "5",
            x: 660,
            y: 450
          },
          Button6: {
            type: Button,
            label: "6",
            x: 1280,
            y: 450
          },
          Button7: {
            type: Button,
            label: "7",
            x: 40,
            y: 600
          },
          Button8: {
            type: Button,
            label: "8",
            x: 660,
            y: 600
          },
          Button9: {
            type: Button,
            label: "9",
            x: 1280,
            y: 600
          },
          Button0: {
            type: Button,
            label: "NEXT",
            x: 40,
            y: 750,
            width: 1840,
            style: "bold"
          }
        }
      };
    }
    _firstEnable() {
      this.numButtons = this.tag("ButtonList").children.length;
      this.nextIdx = this.numButtons - 1;
      this.numInstalledApps = 0;
      this.installedAppNames = undefined;
    }
    _enable() {
      this.buttonIdx = 0;
      this.pageIdx = 0;
      this.thunderWrapper.getInstalledAppList().then(result => {
        console.log(JSON.stringify(result));
        this.installedAppNames = result;
        this.numInstalledApps = this.installedAppNames.length;
        this.updateButtonLabels();
      }, error => {
        console.log("AppTest: enable() - " + error);
      }).catch(err => {
        console.log(err);
      });
    }
    _getFocused() {
      return this.tag("ButtonList").children[this.buttonIdx];
    }
    _handleLeft() {
      if (this.buttonIdx === this.nextIdx) {
        this.buttonIdx -= rowLength;
      } else {
        if (this.buttonIdx % rowLength > 0) {
          this.buttonIdx--;
        }
      }
    }
    _handleRight() {
      if (this.buttonIdx === this.nextIdx) {
        this.buttonIdx -= 1;
      } else {
        if (this.buttonIdx % rowLength < rowLength - 1) {
          this.buttonIdx++;
        }
      }
    }
    _handleUp() {
      if (this.buttonIdx === this.nextIdx) {
        this.buttonIdx -= Math.ceil(rowLength / 2);
      } else {
        if (this.buttonIdx >= rowLength) {
          this.buttonIdx -= rowLength;
        }
      }
    }
    _handleDown() {
      if (this.buttonIdx != this.nextIdx) {
        if (this.buttonIdx >= (colLength - 1) * rowLength) {
          this.buttonIdx = this.nextIdx;
        } else {
          this.buttonIdx += rowLength;
        }
      }
    }
    _handleCenter() {
      this.buttonAction(this.buttonIdx);
    }
    _handleZero() {
      this.buttonAction(9);
    }
    _handleOne() {
      this.buttonAction(0);
    }
    _handleTwo() {
      this.buttonAction(1);
    }
    _handleThree() {
      this.buttonAction(2);
    }
    _handleFour() {
      this.buttonAction(3);
    }
    _handleFive() {
      this.buttonAction(4);
    }
    _handleSix() {
      this.buttonAction(5);
    }
    _handleSeven() {
      this.buttonAction(6);
    }
    _handleEight() {
      this.buttonAction(7);
    }
    _handleNine() {
      this.buttonAction(8);
    }
    updateButtonLabels() {
      console.log("updateButtonLabels() - installedAppNames: " + this.installedAppNames);
      if (this.installedAppNames != undefined) {
        for (var i = 0; i < numAppsPerPage; ++i) {
          var label = this.installedAppNames[this.pageIdx * numAppsPerPage + i].split(".").pop();
          this.tag("Button" + (i + 1)).updateLabel(label === undefined ? "" : label);
        }
      }
    }
    buttonAction(activeButtonIdx) {
      console.log("buttonAction() " + activeButtonIdx + " " + this.nextIdx);
      if (activeButtonIdx === this.nextIdx) {
        this.nextPage();
        this.updateButtonLabels();
      } else {
        if (activeButtonIdx + numAppsPerPage * this.pageIdx < this.numInstalledApps) {
          console.log("buttonAction() - launching app");
          this.launchApp(activeButtonIdx);
        }
      }
    }
    nextPage() {
      console.log("nextPage() " + this.pageIdx);
      console.log("nextPage() - " + this.numInstalledApps + " " + numAppsPerPage + " " + Math.ceil(this.numInstalledApps / numAppsPerPage));
      this.pageIdx = ++this.pageIdx % Math.ceil(this.numInstalledApps / numAppsPerPage);
      console.log("nextPage() " + this.pageIdx);
    }
    launchApp(activeButtonIdx) {
      var appName = this.installedAppNames[activeButtonIdx + numAppsPerPage * this.pageIdx];
      this.thunderWrapper.launchApp(appName).then(function (result) {
        console.log("AppTest: launchApp() - " + appName + " " + result);
      }, function (error) {
        console.log("AppTest: launchApp() - " + appName + " " + error);
      });
    }
    configure(thunderWrapper) {
      this.thunderWrapper = thunderWrapper;
    }
  }

  class KeyTest extends Lightning.Component {
    static _template() {
      return {
        KeyInfo: {
          x: 40,
          y: 20,
          text: {
            text: 'Waiting for key press',
            textColor: 0xff00ff00,
            fontSize: 32
          }
        },
        StopMessage: {
          x: 40,
          y: 100,
          text: {
            text: 'Press Play/Pause to go back to the test menu',
            textColor: 0xffff0000,
            fontSize: 18
          }
        }
      };
    }
    configure(thunderWrapper, keyHandler) {
      this.thunderWrapper = thunderWrapper;
      this.keyHandler = keyHandler;
    }
    _getFocused() {
      console.log('KeyTestState: _getFocused');
      return this.tag('KeyTest');
    }
    _handleKey(e) {
      if (e.keyCode !== 0) {
        console.log('KeyTestState: _handleKey ' + e.code);
        this.tag('KeyInfo').text.text = e.code + ' PRESS';
        this.keyHandler.handleKeyDown(e.keyCode);
      }
    }
    _handleKeyRelease(e) {
      if (e.keyCode !== 0) {
        console.log('KeyTestState: _handleRelease ' + e.code);
        this.tag('KeyInfo').text.text = e.code + ' RELEASE';
        this.keyHandler.handleKeyUp(e.keyCode);
      }
    }
  }

  class SkyASTest extends Lightning.Component {
    static _template() {
      return {
        ButtonList: {
          ButtonSkyNews: {
            type: Button,
            label: "Sky News",
            x: 100,
            y: 60,
            asParams: {
              uri: "https%3A%2F%2Flinear019-gb-hls1-prd-ak.cdn.skycdp.com/100e/Content/HLS_001_sd/Live/channel(skynews)/index_mob.m3u8",
              format: "HLS"
            }
          },
          ButtonSkyCinemaFamily: {
            type: Button,
            label: "Sky Cinema Family",
            x: 100,
            y: 200,
            asParams: {
              uri: "https%3A%2F%2Flin013-gb-s8-prd-ak.cdn01.skycdp.com/v1/frag/bmff/enc/cenc/t/SCINFAH_HD_SU_SKYUK_4018_0_5576146500146789163.mpd",
              format: "HLS"
            }
          },
          ButtonSkyFootball: {
            type: Button,
            label: "Sky Football",
            x: 100,
            y: 340,
            asParams: {
              uri: "https%3A%2F%2Flin005-gb-s8-prd-ak.cdn01.skycdp.com/v1/frag/bmff/enc/cenc/t/SSPOFHD_HD_SU_SKYUK_3939_0_8930469780534566163.mpd",
              format: "HLS"
            }
          }
        }
      };
    }
    _firstEnable() {
      this.skyASPlayer = new SkyASPlayer(this.thunderWrapper);
      this.numButtons = this.tag("ButtonList").children.length;
      this.canvas = document.getElementsByTagName("canvas")[0];
      this.playing = false;
    }
    _enable() {
      this.buttonIdx = 0;
    }
    async _disable() {
      if (this.playing) {
        await this.stopStream();
      }
    }
    _getFocused() {
      return this.tag("ButtonList").children[this.buttonIdx];
    }
    _handleUp() {
      if (this.buttonIdx > 0) {
        this.buttonIdx--;
      }
    }
    _handleDown() {
      if (this.buttonIdx < this.numButtons - 1) {
        this.buttonIdx++;
      }
    }
    async _handleCenter() {
      let asParams = this.tag("ButtonList").children[this.buttonIdx].asParams;
      this.playing = await this.watchSteam(asParams);
      if (this.playing) {
        this.canvas.style.visibility = "hidden";
      }
    }
    async _handlePlayPause() {
      if (this.playing) {
        await this.stopStream();
        this.playing = false;
      }
    }
    async watchSteam(asParams) {
      return await this.skyASPlayer.watchStream(asParams);
    }
    async stopStream() {
      await this.skyASPlayer.stop();
      this.canvas.style.visibility = "visible";
    }
    configure(thunderWrapper) {
      this.thunderWrapper = thunderWrapper;
    }
  }

  /**
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  let ws = null;
  if (typeof WebSocket !== 'undefined') {
    ws = WebSocket;
  }
  var ws_1 = ws;
  const requestsQueue = {};
  const listeners = {};
  var requestQueueResolver = data => {
    if (typeof data === 'string') {
      data = JSON.parse(data.normalize().replace(/\\x([0-9A-Fa-f]{2})/g, ''));
    }
    if (data.id) {
      const request = requestsQueue[data.id];
      if (request) {
        if ('result' in data) request.resolve(data.result);else request.reject(data.error);
        delete requestsQueue[data.id];
      } else {
        console.log('no pending request found with id ' + data.id);
      }
    }
  };
  var notificationListener = data => {
    if (typeof data === 'string') {
      data = JSON.parse(data.normalize().replace(/\\x([0-9A-Fa-f]{2})/g, ''));
    }
    if (!data.id && data.method) {
      const callbacks = listeners[data.method];
      if (callbacks && Array.isArray(callbacks) && callbacks.length) {
        callbacks.forEach(callback => {
          callback(data.params);
        });
      }
    }
  };
  const protocol = 'ws://';
  const host = 'localhost';
  const endpoint = '/jsonrpc';
  const port = 80;
  var makeWebsocketAddress = options => {
    return [options && options.protocol || protocol, options && options.host || host, ':' + (options && options.port || port), options && options.endpoint || endpoint, options && options.token ? '?token=' + options.token : null].join('');
  };
  const protocols = 'notification';
  let socket = null;
  var connect = options => {
    return new Promise((resolve, reject) => {
      if (socket && socket.readyState === 1) return resolve(socket);
      if (socket && socket.readyState === 0) {
        const waitForOpen = () => {
          socket.removeEventListener('open', waitForOpen);
          resolve(socket);
        };
        return socket.addEventListener('open', waitForOpen);
      }
      if (socket === null) {
        socket = new ws_1(makeWebsocketAddress(options), protocols);
        socket.addEventListener('message', message => {
          if (options.debug) {
            console.log(' ');
            console.log('API REPONSE:');
            console.log(JSON.stringify(message.data, null, 2));
            console.log(' ');
          }
          requestQueueResolver(message.data);
        });
        socket.addEventListener('message', message => {
          notificationListener(message.data);
        });
        socket.addEventListener('error', () => {
          notificationListener({
            method: 'client.ThunderJS.events.error'
          });
          socket = null;
        });
        const handleConnectClosure = event => {
          socket = null;
          reject(event);
        };
        socket.addEventListener('close', handleConnectClosure);
        socket.addEventListener('open', () => {
          notificationListener({
            method: 'client.ThunderJS.events.connect'
          });
          socket.removeEventListener('close', handleConnectClosure);
          socket.addEventListener('close', () => {
            notificationListener({
              method: 'client.ThunderJS.events.disconnect'
            });
            socket = null;
          });
          resolve(socket);
        });
      } else {
        socket = null;
        reject('Socket error');
      }
    });
  };
  var makeBody = (requestId, plugin, method, params, version) => {
    params ? delete params.version : null;
    const body = {
      jsonrpc: '2.0',
      id: requestId,
      method: [plugin, version, method].join('.')
    };
    params || params === false ? typeof params === 'object' && Object.keys(params).length === 0 ? null : body.params = params : null;
    return body;
  };
  var getVersion = (versionsConfig, plugin, params) => {
    const defaultVersion = 1;
    let version;
    if (version = params && params.version) {
      return version;
    }
    return versionsConfig ? versionsConfig[plugin] || versionsConfig.default || defaultVersion : defaultVersion;
  };
  let id = 0;
  var makeId = () => {
    id = id + 1;
    return id;
  };
  var execRequest = (options, body) => {
    return connect(options).then(connection => {
      connection.send(JSON.stringify(body));
    });
  };
  var API = options => {
    return {
      request(plugin, method, params) {
        return new Promise((resolve, reject) => {
          const requestId = makeId();
          const version = getVersion(options.versions, plugin, params);
          const body = makeBody(requestId, plugin, method, params, version);
          if (options.debug) {
            console.log(' ');
            console.log('API REQUEST:');
            console.log(JSON.stringify(body, null, 2));
            console.log(' ');
          }
          requestsQueue[requestId] = {
            body,
            resolve,
            reject
          };
          execRequest(options, body).catch(e => {
            reject(e);
          });
        });
      }
    };
  };
  var DeviceInfo = {
    freeRam(params) {
      return this.call('systeminfo', params).then(res => {
        return res.freeram;
      });
    },
    version(params) {
      return this.call('systeminfo', params).then(res => {
        return res.version;
      });
    }
  };
  var plugins = {
    DeviceInfo
  };
  function listener(plugin, event, callback, errorCallback) {
    const thunder = this;
    const index = register.call(this, plugin, event, callback, errorCallback);
    return {
      dispose() {
        const listener_id = makeListenerId(plugin, event);
        if (listeners[listener_id] === undefined) return;
        listeners[listener_id].splice(index, 1);
        if (listeners[listener_id].length === 0) {
          unregister.call(thunder, plugin, event, errorCallback);
        }
      }
    };
  }
  const makeListenerId = (plugin, event) => {
    return ['client', plugin, 'events', event].join('.');
  };
  const register = function (plugin, event, callback, errorCallback) {
    const listener_id = makeListenerId(plugin, event);
    if (!listeners[listener_id]) {
      listeners[listener_id] = [];
      if (plugin !== 'ThunderJS') {
        const method = 'register';
        const request_id = listener_id.split('.').slice(0, -1).join('.');
        const params = {
          event,
          id: request_id
        };
        this.api.request(plugin, method, params).catch(e => {
          if (typeof errorCallback === 'function') errorCallback(e.message);
        });
      }
    }
    listeners[listener_id].push(callback);
    return listeners[listener_id].length - 1;
  };
  const unregister = function (plugin, event, errorCallback) {
    const listener_id = makeListenerId(plugin, event);
    delete listeners[listener_id];
    if (plugin !== 'ThunderJS') {
      const method = 'unregister';
      const request_id = listener_id.split('.').slice(0, -1).join('.');
      const params = {
        event,
        id: request_id
      };
      this.api.request(plugin, method, params).catch(e => {
        if (typeof errorCallback === 'function') errorCallback(e.message);
      });
    }
  };
  let api;
  var thunderJS = options => {
    if (options.token === undefined && typeof window !== 'undefined' && window.thunder && typeof window.thunder.token === 'function') {
      options.token = window.thunder.token();
    }
    api = API(options);
    return wrapper({
      ...thunder(options),
      ...plugins
    });
  };
  const resolve = (result, args) => {
    if (typeof result !== 'object' || typeof result === 'object' && (!result.then || typeof result.then !== 'function')) {
      result = new Promise((resolve, reject) => {
        result instanceof Error === false ? resolve(result) : reject(result);
      });
    }
    const cb = typeof args[args.length - 1] === 'function' ? args[args.length - 1] : null;
    if (cb) {
      result.then(res => cb(null, res)).catch(err => cb(err));
    } else {
      return result;
    }
  };
  const thunder = options => ({
    options,
    plugin: false,
    call() {
      const args = [...arguments];
      if (this.plugin) {
        if (args[0] !== this.plugin) {
          args.unshift(this.plugin);
        }
      }
      const plugin = args[0];
      const method = args[1];
      if (typeof this[plugin][method] == 'function') {
        return this[plugin][method](args[2]);
      }
      return this.api.request.apply(this, args);
    },
    registerPlugin(name, plugin) {
      this[name] = wrapper(Object.assign(Object.create(thunder), plugin, {
        plugin: name
      }));
    },
    subscribe() {},
    on() {
      const args = [...arguments];
      if (['connect', 'disconnect', 'error'].indexOf(args[0]) !== -1) {
        args.unshift('ThunderJS');
      } else {
        if (this.plugin) {
          if (args[0] !== this.plugin) {
            args.unshift(this.plugin);
          }
        }
      }
      return listener.apply(this, args);
    },
    once() {
      console.log('todo ...');
    }
  });
  const wrapper = obj => {
    return new Proxy(obj, {
      get(target, propKey) {
        const prop = target[propKey];
        if (propKey === 'api') {
          return api;
        }
        if (typeof prop !== 'undefined') {
          if (typeof prop === 'function') {
            if (['on', 'once', 'subscribe'].indexOf(propKey) > -1) {
              return function () {
                for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                  args[_key] = arguments[_key];
                }
                return prop.apply(this, args);
              };
            }
            return function () {
              for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
              }
              return resolve(prop.apply(this, args), args);
            };
          }
          if (typeof prop === 'object') {
            return wrapper(Object.assign(Object.create(thunder(target.options)), prop, {
              plugin: propKey
            }));
          }
          return prop;
        } else {
          if (target.plugin === false) {
            return wrapper(Object.assign(Object.create(thunder(target.options)), {}, {
              plugin: propKey
            }));
          }
          return function () {
            for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
              args[_key3] = arguments[_key3];
            }
            args.unshift(propKey);
            return target.call.apply(this, args);
          };
        }
      }
    });
  };

  const deviceBridgePath = "org.rdk.DeviceBridge.1";
  const deviceAppManagerPath = "org.rdk.DeviceAppManager.1";
  const avCastPath = "org.rdk.AVCast.1";
  const systemPath = "org.rdk.System.1";
  const systemAudioPath = "org.rdk.SystemAudioPlayer.1";
  const hdmiInputPath = "org.rdk.HdmiInput.1";
  const hdmiCecSinkPath = "org.rdk.HdmiCecSink.1";
  const rdkShellPath = "org.rdk.RDKShell.1";
  const NotificationName = {
    CONNECTION_STATUS_CHANGED: "connectionStatusChanged",
    ON_APP_STATE_CHANGE: "onAppStateChange",
    ON_MUTE_CONTROL_CHANGED: "onMuteControlChanged",
    INSTALL_APP_PROGRESS: "onAppInstallProgressChanged",
    PLAYER_STOPPED: "playerStopped"
  };
  Object.freeze(NotificationName);
  const PropertyName = {
    BLUETOOTH_MAC: "btMAC",
    COUNTRY_CODE: "countryCode",
    DEVICE_IMAGE_VERSION: "ro.vendor.build.sky.release.version",
    DEVICE_MAC: "deviceMAC",
    DEVICE_MODEL_NAME: "deviceModelName",
    DEVICE_SERIAL: "deviceSerial",
    // FIRMWARE_VERSION: "firmwareVersion",
    // ALT_FIRMWARE_VERSION: "altFirmwareVersion",
    // FIRMWARE_SIGNATURE: "firmwareSignature",
    NETWORKED_STANDBY_MODE: "networkedStandbyMode",
    PAIRED_BLUETOOTH_MAC: "pairedBluetoothMAC",
    PAIRED_DEVICE_MAC: "pairedDeviceMAC",
    PAIRED_DEVICE_ACCOUNT_ID: "pairedDeviceAccountID",
    PAIRED_DEVICE_LOCATION: "pairedDeviceLocation",
    PAIRED_DEVICE_SERIAL: "pairedDeviceSerial",
    PAIRED_FIRMWARE_VERSION: "pairedFirmwareVersion",
    // TILT_STATUS: "tiltStatus",
    GDPR_DATA_OPT_OUT: "gdprDataOptOut",
    AUTOMATIC_FW_OPTED_OUT: "automaticFwOptedOut",
    SUBSCRIBED_STATE: "subscribedState",
    CAPABILITIES_GYRO: "capabilities.gyro",
    TILT: "tilt"
  };
  Object.freeze(PropertyName);
  const ViewTypes = {
    FULL_SCREEN: "FULLSCREEN",
    PIP: "PIP",
    SIDE_BAR_HORIZONTAL: "SIDEBAR_HORIZONTAL",
    SIDE_BAR_VERTICAL: "SIDEBAR_VERTICAL"
  };
  Object.freeze(ViewTypes);
  const GreenScreenCaptureRegions = {
    "FULLSCREEN": {
      x: 0,
      y: 0,
      width: 1920,
      height: 1080
    },
    "PIP": {
      x: 0,
      y: 16,
      width: 564,
      height: 316
    },
    "SIDEBAR_HORIZONTAL": {
      x: 0,
      y: 0,
      width: 1920,
      height: 272
    },
    "SIDEBAR_VERTICAL": {
      x: 0,
      y: 0,
      width: 470,
      height: 1080
    }
  };
  Object.freeze(GreenScreenCaptureRegions);
  const GreenScreenDisplayRegions = {
    "FULLSCREEN": {
      x: 0,
      y: 0,
      width: 1920,
      height: 1080
    },
    "PIP": {
      "TopLeft": {
        x: 0,
        y: 0,
        width: 564,
        height: 316
      },
      "TopRight": {
        x: 1356,
        y: 0,
        width: 564,
        height: 316
      },
      "BottomLeft": {
        x: 0,
        y: 764,
        width: 564,
        height: 316
      },
      "BottomRight": {
        x: 1356,
        y: 764,
        width: 564,
        height: 316
      }
    },
    "SIDEBAR_HORIZONTAL": {
      "Top": {
        x: 0,
        y: 0,
        width: 1920,
        height: 272
      },
      "Bottom": {
        x: 0,
        y: 808,
        width: 1920,
        height: 272
      }
    },
    "SIDEBAR_VERTICAL": {
      "Left": {
        x: 0,
        y: 0,
        width: 470,
        height: 1080
      },
      "Right": {
        x: 1450,
        y: 0,
        width: 470,
        height: 1080
      }
    }
  };
  Object.freeze(GreenScreenDisplayRegions);

  /*
   * Wrapper class to encapsulate calls to ThunderJS
   */
  class ThunderWrapper {
    constructor() {
      console.log("ThunderWrapper: constructor");
      this.localThunder = "127.0.0.1";
      this.dobbyThunder = "100.64.11.1";
      this.inContainer = false;
      this.config = {
        host: this.dobbyThunder,
        port: 9998,
        default: 1,
        endpoint: "/jsonrpc"
      };
      this.thunderJS = thunderJS(this.config);
    }
    get hostIP() {
      return this.connectedHostIP;
    }
    get containerized() {
      return this.inContainer;
    }
    async init() {
      try {
        await this.getDeviceBridgeConnectionStatus();
        this.connectedHostIP = this.config.host;
        this.inContainer = true;
      } catch (err) {
        this.reconfigure();
      }
      try {
        await this.getDeviceBridgeConnectionStatus();
        this.connectedHostIP = this.config.host;
      } catch (err) {
        throw new Error("Unable to connect to Thunder");
      }
      return this;
    }
    reconfigure() {
      this.thunderJS = null;
      if (this.config.host === this.dobbyThunder) {
        this.config.host = this.localThunder;
      } else {
        this.config.host = this.dobbyThunder;
      }
      console.log("ThunderWrapper: reconfigure() reconfiguring with ".concat(this.config.host));
      this.thunderJS = thunderJS(this.config);
    }

    /*
     * Register callbacks for specific notifications. Immediately triggers the callback with current status.
     * Note that ThunderJS supports multiple listeners of individual notifications.
     */
    async registerDeviceBridgeConnectionStatusChangedCallback(callback) {
      const listener = this.thunderJS.on(deviceBridgePath, NotificationName.CONNECTION_STATUS_CHANGED, notification => {
        console.log("ThunderWrapper: notification", notification);
        callback([notification.connected, notification.ipAddress, notification.port, notification.usbInterface, notification.reason]);
      });
      const status = await this.getDeviceBridgeConnectionStatus();
      callback(status);
      return listener;
    }
    registerDeviceBridgeOnAppStateChangeCallback(callback) {
      return this.thunderJS.on(deviceBridgePath, NotificationName.ON_APP_STATE_CHANGE, notification => {
        console.log("ThunderWrapper: notification", notification);
        callback(notification);
      });
    }
    registerDeviceBridgeOnMuteControlChangedCallback(callback) {
      return this.thunderJS.on(deviceBridgePath, NotificationName.ON_MUTE_CONTROL_CHANGED, notification => {
        console.log("ThunderWrapper: notification", notification);
        callback(notification);
      });
    }
    registerApkManagerProgressEventCallback(callback) {
      console.log("ThunderWrapper: Registering for progress notifications");
      return this.thunderJS.on(deviceAppManagerPath, NotificationName.INSTALL_APP_PROGRESS, notification => {
        console.log("ThunderWrapper: notification ".concat(JSON.stringify(notification)));
        callback(notification);
      }, error => {
        console.log("ThunderWrapper: an error occured: ", error);
      });
    }
    registerAvCastPlayerStoppedCallback(callback) {
      return this.thunderJS.on(avCastPath, NotificationName.PLAYER_STOPPED, notification => {
        console.log("ThunderWrapper: notification", notification);
        callback(notification);
      });
    }

    /*
    * Register callbacks for specific notifications. Immediately triggers the callback with current status.
    * Note that ThunderJS supports multiple listeners of individual notifications.
    */
    async registerCastControlStatusChangedCallback(callback) {
      const listener = this.thunderJS.on(avCastPath, NotificationName.CONNECTION_STATUS_CHANGED, notification => {
        console.log("ThunderWrapper: notification", notification);
        callback([notification.connected, notification.ipAddress, notification.videoPort, notification.audioPort]);
      });
      try {
        let status = await this.getCastConnectionStatus();
        callback([true, ...status]);
      } catch (error) {
        callback([false]);
      }
      return listener;
    }
    async getCastConnectionStatus() {
      console.log("ThunderWrapper: getCastConnectionStatus()");
      const result = await this.thunderJS.call(avCastPath, "getConnectionStatus", {});
      if (result.connected) {
        console.log("ThunderWrapper: getCastConnectionStatus() success - ", result);
        return [result.ipAddress, result.videoPort, result.audioPort];
      }
      console.log("ThunderWrapper: getCastConnectionStatus() failed - ", result);
      throw Error(); // fixme: exceptions used for regular,non-exceptional flow control.
    }

    async getDeviceBridgeConnectionStatus() {
      console.log("ThunderWrapper: getDeviceBridgeConnectionStatus()");
      const result = await this.thunderJS.call(deviceBridgePath, "getConnectionStatus", {});
      console.log("ThunderWrapper: getDeviceBridgeConnectionStatus() - " + JSON.stringify(result));
      return [result.connected, result.ipAddress, result.port, result.usbInterface, result.reason];
    }
    sendKeyEvent(code, state) {
      console.log("code: " + code + " state: " + state);
      return new Promise((resolve, reject) => {
        this.thunderJS.call(deviceBridgePath, "sendKeyEvent", {
          keyCode: code,
          keyState: state
        }).then(result => {
          console.log("ThunderWrapper: sendKeyEvent() success " + JSON.stringify(result));
          resolve(result);
        }).catch(err => {
          console.error("ThunderWrapper: sendKeyEvent() failed - " + JSON.stringify(err));
          reject(err);
        });
      });
    }
    launchApp(appName, dataUri, componentName) {
      return new Promise((resolve, reject) => {
        this.thunderJS.call(deviceBridgePath, "launchApp", {
          name: appName,
          dataUri: dataUri,
          componentName: componentName
        }).then(result => {
          console.log("ThunderWrapper: launchApp() success " + JSON.stringify(result));
          resolve(result);
        }).catch(err => {
          console.error("ThunderWrapper: launchApp() failed - " + JSON.stringify(err));
          reject(err);
        });
      });
    }
    closeApp(appName, forceClose) {
      return new Promise((resolve, reject) => {
        this.thunderJS.call(deviceBridgePath, "closeApp", {
          packageName: appName,
          forceClose: forceClose
        }).then(result => {
          console.log("ThunderWrapper: closeApp() success " + JSON.stringify(result));
          resolve(result);
        }).catch(err => {
          console.error("ThunderWrapper: closeApp() failed - " + JSON.stringify(err));
          reject(err);
        });
      });
    }
    parseGetInstalledAppsResult(result) {
      const installedApps = JSON.parse(result["installedApps"]);
      const appInfos = installedApps["app_version_info"];
      const appNames = appInfos.reduce(function (apps, app) {
        apps.push(app["packageName"]);
        return apps;
      }, []);
      return appNames;
    }
    getInstalledAppList() {
      return new Promise((resolve, reject) => {
        this.thunderJS.call(deviceAppManagerPath, "getInstalledAppList", {
          "packageName": ""
        }).then(result => {
          const appNames = this.parseGetInstalledAppsResult(result);
          console.log("ThunderWrapper: getInstalledAppList() success " + appNames);
          resolve(appNames);
        }).catch(err => {
          console.error("ThunderWrapper: getInstalledAppList() failed - " + JSON.stringify(err));
          reject(err);
        });
      });
    }
    async checkAppState(appName) {
      console.log("ThunderWrapper: checkAppState()");
      const result = await this.thunderJS.call(deviceBridgePath, "checkAppState", {
        packageName: appName
      });
      console.log("ThunderWrapper: checkAppState()", result);
      return result;
    }
    rebootDevice() {
      return new Promise((resolve, reject) => {
        this.thunderJS.call(deviceBridgePath, "rebootDevice", {}).then(result => {
          console.log("ThunderWrapper: rebootDevice() success " + JSON.stringify(result));
          resolve(result);
        }).catch(err => {
          console.error("ThunderWrapper: rebootDevice() failed - " + JSON.stringify(err));
          reject(err);
        });
      });
    }
    deviceStandby() {
      return new Promise((resolve, reject) => {
        this.thunderJS.call(deviceBridgePath, "deviceStandby", {}).then(result => {
          console.log("ThunderWrapper: deviceStandby() success " + JSON.stringify(result));
          resolve(result);
        }).catch(err => {
          console.error("ThunderWrapper: deviceStandby() failed - " + JSON.stringify(err));
          reject(err);
        });
      });
    }

    /**
     * @param propertyName value from PropertyName enum
     * @returns {Promise<string>} property value or null in case of an error
     */
    async getProperty(propertyName) {
      console.log("ThunderWrapper: getProperty(\"".concat(propertyName, "\")"));
      const result = await this.thunderJS.call(deviceBridgePath, "getProperty", {
        "property": propertyName
      });
      if (result.success === true) {
        console.log("ThunderWrapper: getProperty(\"".concat(propertyName, "\""), result);
        return result[propertyName];
      } else {
        console.error("ThunderWrapper: getProperty(\"".concat(propertyName, "\""), result);
        return null;
      }
    }

    /**
     * @param {string} propertyName value from PropertyName enum.
     * @param {*} value value of property to set
     * @returns {Promise<boolean>} true if success
     */
    async setProperty(propertyName, value) {
      console.log("ThunderWrapper: setProperty(\"".concat(propertyName, "\", \"").concat(value, "\")"));
      const result = await this.thunderJS.call(deviceBridgePath, "setProperty", {
        "property": propertyName,
        "value": value
      });
      if (result.success === true) {
        console.log("ThunderWrapper: setProperty(\"".concat(propertyName, "\", \"").concat(value, "\")"), result);
      } else {
        console.error("ThunderWrapper: setProperty(\"".concat(propertyName, "\", \"").concat(value, "\")"), result);
      }
      return result.success;
    }

    /**
     * @returns {Promise<boolean>} true if success
     */
    async notifyFirmwareUserConsent() {
      console.log("ThunderWrapper: notifyFirmwareUserConsent()");
      const result = await this.thunderJS.call(deviceBridgePath, "notifyFirmwareUserConsent", {});
      if (result.success === true) {
        console.log("ThunderWrapper: notifyFirmwareUserConsent()", result);
      } else {
        console.error("ThunderWrapper: notifyFirmwareUserConsent()", result);
      }
      return result.success;
    }

    /**
     * Sends this device's MAC to the paired device.
     * @returns {Promise<boolean>} true if succeeded to send
     */
    async sendMacAddress() {
      const {
        eth_mac
      } = await this.getDeviceInfo();
      console.log("ThunderWrapper: Setting the ".concat(PropertyName.PAIRED_DEVICE_MAC, " to ").concat(eth_mac));
      const result = await this.setProperty(PropertyName.PAIRED_DEVICE_MAC, eth_mac);
      if (result !== true) {
        console.error("ThunderWrapper: Failed to set ".concat(PropertyName.PAIRED_DEVICE_MAC, " to ").concat(eth_mac));
      }
      return result;
    }
    getCastParams(ip, videoPort, mode, res, playbackRegion, alpha, display, runtimedir) {
      return {
        "ip": ip,
        "videoPort": videoPort,
        "mode": mode,
        "resolution": res,
        "playbackRegion": playbackRegion,
        "alpha": alpha,
        "display": display,
        "runtimedir": runtimedir
      };
    }
    async startCast(ip, videoPort, mode, res, playbackRegion, alpha, display, runtimedir) {
      console.log("ThunderWrapper: Starting cast with params: ip: ", ip, " videoPort: ", videoPort, " mode: ", mode, " resolution: ", res, " playbackregion: ", playbackRegion, " alpha: ", alpha, " display: ", display, " runtimedir: ", runtimedir);
      const castParams = this.getCastParams(ip, videoPort, mode, res, playbackRegion, alpha, display, runtimedir);
      const result = await this.thunderJS.call(avCastPath, "startCast", castParams);
      console.log("ThunderWrapper: StartCast result:", result);
      return result;
    }
    async installApp(jsonParams) {
      console.log("ThunderWrapper: " + JSON.stringify(jsonParams));
      const result = await this.thunderJS.call(deviceAppManagerPath, "installApp", jsonParams);
      console.log("ThunderWrapper: installApp result: " + result.success);
      return result;
    }
    async updateApp(jsonParams) {
      console.log("ThunderWrapper: " + JSON.stringify(jsonParams));
      const result = await this.thunderJS.call(deviceAppManagerPath, "updateApp", jsonParams);
      console.log("ThunderWrapper: updateApp result: " + result.success);
      return result;
    }
    async uninstallApp(jsonParams) {
      console.log("ThunderWrapper: " + JSON.stringify(jsonParams));
      const result = await this.thunderJS.call(deviceAppManagerPath, "uninstallApp", jsonParams);
      console.log("ThunderWrapper: uninstallApp result: " + result.success);
      return result;
    }
    /*
     * Wraps the startProcess JSON-RPC promise and returns a new promise to be handled by the caller
     */
    startProcess(cmd, exitCmd) {
      return new Promise((resolve, reject) => {
        this.thunderJS.call(avCastPath, "startProcess", {
          command: cmd,
          exitCommand: exitCmd
        }).then(result => {
          console.log("ThunderWrapper: startProcess() success " + JSON.stringify(result));
          resolve(result);
        }).catch(err => {
          console.error("ThunderWrapper: startProcess() failed - " + JSON.stringify(err));
          reject(err);
        });
      });
    }
    async stopCast() {
      console.log("ThunderWrapper: Stopping cast");
      const result = await this.thunderJS.call(avCastPath, "stopCast", {});
      console.log("ThunderWrapper: StopCast result:", result);
      return result;
    }
    async configureCaptureRegion(playbackRegion) {
      console.log("ThunderWrapper: configureCaptureRegion: ", playbackRegion);
      const result = await this.thunderJS.call(avCastPath, "configureCaptureRegion", playbackRegion);
      console.log("ThunderWrapper: configureCaptureRegion result:", result);
      return result;
    }
    async enableWatchdog(timeout) {
      console.log("ThunderWrapper: Enabling AV Cast watchdog with timeout ", timeout, " ms");
      const result = await this.thunderJS.call(avCastPath, "enableWatchdog", {
        "timeout": timeout
      }).catch(err => {
        console.warn("ThunderWrapper: Error caught while enabling a watchdog - " + err.message);
      });
      console.log("ThunderWrapper: enableWatchdog result:", result);
      return result;
    }
    async disableWatchdog() {
      console.log("ThunderWrapper: Disabling AV Cast watchdog");
      const result = await this.thunderJS.call(avCastPath, "disableWatchdog", {}).catch(err => {
        console.warn("ThunderWrapper: Error caught while disabling a watchdog - " + err.message);
      });
      console.log("ThunderWrapper: disableWatchdog result:", result);
      return result;
    }
    async signalWatchdog() {
      console.log("ThunderWrapper: Signaling AV Cast watchdog");
      const result = await this.thunderJS.call(avCastPath, "signalWatchdog", {}).catch(err => {
        console.warn("ThunderWrapper: Error caught while signalling a watchdog - " + err.message);
      });
      console.log("ThunderWrapper: signalWatchdog result:", result);
      return result;
    }
    async getDeviceInfo() {
      console.log("ThunderWrapper: getDeviceInfo()");
      return this.thunderJS.call(systemPath, "getDeviceInfo", {});
    }
    async getDeviceImageVersion() {
      return await this.getProperty(PropertyName.DEVICE_IMAGE_VERSION);
    }
    async changeView(appId, viewType) {
      console.log("ThunderWrapper: changeView:", appId, viewType);
      const result = await this.thunderJS.call(deviceBridgePath, "changeView", {
        "appId": appId,
        "viewType": viewType
      });
      console.log("ThunderWrapper: changeView()", result);
      return result;
    }
    async getFirmwareUpdateState() {
      console.log("ThunderWrapper: getFirmwareUpdateState()");
      try {
        let result = await this.thunderJS.call(deviceBridgePath, "getFirmwareUpdateState", {});
        if (result.success === true) {
          console.log("ThunderWrapper: getFirmwareUpdateState success - state: ".concat(result.state, ", compulsory: ").concat(result.compulsory));
          return result;
        }
      } catch {
        console.error("ThunderWrapper: getFirmwareUpdateState failed");
      }
      return null;
    }
    async wipeDeviceForNewPairing() {
      console.log("ThunderWrapper: wipeDeviceForNewPairing()");
      const result = await this.thunderJS.call(deviceBridgePath, "wipeDeviceForNewPairing", {}).catch(err => {
        console.warn("ThunderWrapper: wipeDeviceForNewPairing() failed -  " + err.message);
      });
      console.log("ThunderWrapper: wipeDeviceForNewPairing() result:", result);
      return result;
    }
    async factoryResetDevice() {
      console.log("ThunderWrapper: factoryResetDevice");
      const result = await this.thunderJS.call(deviceBridgePath, "factoryResetDevice", {}).catch(err => {
        console.warn("ThunderWrapper: factoryResetDevice failed: " + err.message);
      });
      console.log("ThunderWrapper: factoryResetDevice result: " + result.success);
      return result;
    }
    async getMuteControl() {
      console.log("ThunderWrapper: Getting mute control status");
      const result = await this.thunderJS.call(deviceBridgePath, "getMuteControl", {}).catch(err => {
        console.warn("ThunderWrapper: Error caught while getting a mute control status - " + err.message);
      });
      console.log("ThunderWrapper: getMuteControl result:", result);
      return result;
    }
    async getAppMuteState(packageName) {
      console.log("ThunderWrapper: Getting an app mute state for " + packageName);
      const result = await this.thunderJS.call(deviceBridgePath, "getAppMuteState", {
        "appId": packageName
      }).catch(err => {
        console.warn("ThunderWrapper: Error caught while getting an app mute state - " + err.message);
      });
      console.log("ThunderWrapper: getAppMuteState result:", result);
      return result;
    }

    //System audio
    async systemAudioOpen() {
      console.log("ThunderWrapper: systemAudioOpen()");
      const result = await this.thunderJS.call(systemAudioPath, "open", {
        audiotype: "pcm",
        sourcetype: "websocket",
        playmode: "system"
      });
      console.log("ThunderWrapper: systemAudioOpen() result:", result);
      return result.success ? result.id : null;
    }
    async systemAudioClose(audioId) {
      console.log("ThunderWrapper: systemAudioClose()");
      const result = await this.thunderJS.call(systemAudioPath, "close", {
        id: audioId
      });
      console.log("ThunderWrapper: systemAudioClose() result:", result);
      return result.success;
    }
    async systemAudioConfigure(audioId) {
      console.log("ThunderWrapper: systemAudioConfigure()");
      const result = await this.thunderJS.call(systemAudioPath, "config", {
        id: audioId,
        pcmconfig: {
          format: "S16LE",
          rate: "48000",
          channels: "2",
          layout: "interleaved"
        },
        websocketsecparam: {
          cafilenames: [{
            cafilename: "/etc/ssl/certs/Xfinity_Subscriber_ECC_Root.pem"
          }, {
            cafilename: "/etc/ssl/certs/Xfinity_Subscriber_RSA_Root.pem"
          }]
        }
      });
      console.log("ThunderWrapper: systemAudioConfigure() result:", result);
      return result.success;
    }
    async systemAudioSetMixerLevels(audioId, primaryVolume, playerVolume) {
      console.log("ThunderWrapper: systemAudioSetMixerLevels()");
      const result = await this.thunderJS.call(systemAudioPath, "setMixerLevels", {
        id: audioId,
        primaryVolume: primaryVolume,
        playerVolume: playerVolume
      });
      console.log("ThunderWrapper: systemAudioSetMixerLevels() result:", result);
      return result.success;
    }
    async systemAudioPlay(audioId, url) {
      console.log("ThunderWrapper: systemAudioPlay()");
      const result = await this.thunderJS.call(systemAudioPath, "play", {
        id: audioId,
        url: url
      });
      console.log("ThunderWrapper: systemAudioPlay() result:", result);
      return result.success;
    }
    async systemAudioStop(audioId) {
      console.log("ThunderWrapper: systemAudioStop()");
      const result = await this.thunderJS.call(systemAudioPath, "stop", {
        id: audioId
      });
      console.log("ThunderWrapper: systemAudioStop() result:", result);
      return result.success;
    }
    async registerFirmwareUpdateListener(callback) {
      const listener = this.thunderJS.on(deviceBridgePath, "onFirmwareUpdateStateChanged", notification => {
        console.log("ThunderWrapper: notification", notification);
        callback(notification);
      });
      const result = await this.getFirmwareUpdateState();
      callback(result);
      return listener;
    }
    async notifyHostPowerState(powerState) {
      console.log("ThunderWrapper: notifyHostPowerState()");
      const result = await this.thunderJS.call(deviceBridgePath, "notifyHostPowerState", {
        mode: powerState
      });
      console.log("ThunderWrapper: notifyHostPowerState() result:", result);
      return result.success;
    }
    async getSoftwareLicense(offset, length) {
      console.log("ThunderWrapper: getSoftwareLicense(\"offset:".concat(offset, "\", \"length:").concat(length, "\""));
      try {
        let result = await this.thunderJS.call(deviceBridgePath, "getSoftwareLicense", {
          "offset": offset,
          "length": length
        });
        console.log("ThunderWrapper: getSoftwareLicense success: ".concat(result.success));
        if (result.success === true) {
          //Deliberately not logging licenceText as this could be quite long!
          console.log("ThunderWrapper: getSoftwareLicense licenseText length is: ".concat(result.licenseText.length));
        }
        return result;
      } catch {
        console.error("ThunderWrapper: getSoftwareLicense failed");
      }
      return null;
    }
    async setAppMuteState(appId, type, value) {
      var logText = "ThunderWrapper: setAppMuteState(\"appId:".concat(appId, "\", \"type:").concat(type, "\", \"value:").concat(value, "\")");
      try {
        const result = await this.thunderJS.call(deviceBridgePath, "setAppMuteState", {
          "appId": appId,
          "type": type,
          "value": value
        });
        if (result.success === true) {
          console.log(logText, result);
        } else {
          console.error(logText, result);
        }
        return result;
      } catch {
        console.error(logText, " failed");
      }
      return null;
    }
    async sendPAEvent(appId, eventName, eventData) {
      var logText = "ThunderWrapper: sendPAEvent(\"appId:".concat(appId, "\", \"eventName:").concat(eventName, "\", \"eventData:").concat(eventData, "\")");
      try {
        const result = await this.thunderJS.call(deviceBridgePath, "sendPAEvent", {
          "appId": appId,
          "eventName": eventName,
          "eventData": eventData
        });
        if (result.success === true) {
          console.log(logText, result);
        } else {
          console.error(logText, result);
        }
        return result;
      } catch {
        console.error(logText, " failed");
      }
      return null;
    }
    async triggerFirmwareCheck() {
      console.log("ThunderWrapper: triggerFirmwareCheck()");
      const result = await this.thunderJS.call(deviceBridgePath, "triggerFirmwareCheck", {});
      console.log("ThunderWrapper: triggerFirmwareCheck() result: " + result.success);
      return result.success;
    }
    async sendMessage(appId, message) {
      console.log("ThunderWrapper: sendMessage");
      const result = await this.thunderJS.call(deviceBridgePath, "sendMessage", {
        "appId": appId,
        "message": message
      }).catch(err => {
        console.warn("ThunderWrapper: sendMessage failed: " + err.message);
      });
      console.log("ThunderWrapper: sendMessage result: " + result.success);
      return result;
    }
    async notifyMaintenanceModeStarted() {
      console.log("ThunderWrapper: notifyMaintenanceModeStarted()");
      const result = await this.thunderJS.call(deviceBridgePath, "notifyMaintenanceModeStarted", {});
      console.log("ThunderWrapper: notifyMaintenanceModeStarted() result: " + result.success);
      return result;
    }
    async createDisplay(params) {
      console.log("ThunderWrapper: createDisplay()");
      const result = await this.thunderJS.call(rdkShellPath, "createDisplay", params);
      console.log("ThunderWrapper: createDisplay() result: " + result.success);
      return result;
    }
    async setDisplays(params) {
      console.log("ThunderWrapper: setDisplays()");
      const result = await this.thunderJS.call(avCastPath, "setDisplays", params);
      console.log("ThunderWrapper: setDisplays() result: " + result.success);
      return result;
    }
    async startHdmiInput(port) {
      console.log("ThunderWrapper: startHdmiInput()");
      const result = await this.thunderJS.call(hdmiInputPath, "startHdmiInput", {
        portId: port
      });
      console.log("ThunderWrapper: startHdmiInput() result:", result.success);
      return result;
    }
    async stopHdmiInput() {
      console.log("ThunderWrapper: stopHdmiInput()");
      const result = await this.thunderJS.call(hdmiInputPath, "stopHdmiInput", {});
      console.log("ThunderWrapper: stopHdmiInput() result:", result.success);
      return result.success;
    }
    async setRoutingChange(previousPort, currentPort) {
      console.log("ThunderWrapper: setRoutingChange()");
      const result = await this.thunderJS.call(hdmiCecSinkPath, "setRoutingChange", {
        oldPort: previousPort,
        newPort: currentPort
      });
      console.log("ThunderWrapper: setRoutingChange() result:", result.success);
      return result;
    }
    async setActivePath(path) {
      console.log("ThunderWrapper: setActivePath()");
      const result = await this.thunderJS.call(hdmiCecSinkPath, "setActivePath", {
        activePath: path
      });
      console.log("ThunderWrapper: setActivePath() result:", result.success);
      return result;
    }
    async setActiveSource() {
      console.log("ThunderWrapper: setActiveSource()");
      const result = await this.thunderJS.call(hdmiCecSinkPath, "setActiveSource", {});
      console.log("ThunderWrapper: setActiveSource() result:", result.success);
      return result;
    }
    async getHdmiInputDevices() {
      console.log("ThunderWrapper: getHdmiInputDevices()");
      const result = await this.thunderJS.call(hdmiInputPath, "getHDMIInputDevices", {});
      console.log("ThunderWrapper: getHDMIInputDevices() result:", result.success);
      return result;
    }
  }

  const asParams = {
    uri: "http%3A%2F%2Fcommondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    format: "HLS"
  };
  const cherryAppName = "uk.sky.cherry.greenscreendemo";
  const launcherName$1 = "uk.sky.cherry.launcher";
  class SplitScreenTest extends Lightning.Component {
    static _template() {
      return {
        x: 0,
        y: 0,
        w: 1920,
        h: 1080,
        Message: {
          x: 40,
          y: 20,
          text: {
            text: this.bindProp("messageText"),
            textColor: 0xffff0000,
            fontSize: 24
          }
        }
      };
    }
    async _enable() {
      console.log("SplitScreenTest: _enable()");
      this.messageText = "Displaying Default screen layout";
      this.skyASPlayer.watchStream(asParams);
      await this.startApp(cherryAppName);
      await this.startPlayer();
    }
    async _disable() {
      console.log("SplitScreenTest: _disable()");
      await this.stopCast();
      await this.startApp(launcherName$1);
      this.skyASPlayer.stop();
    }
    _getFocused() {
      console.log("SplitScreenTest: _getFocused()");
      return this.tag("SplitScreenTest");
    }
    _handleOne() {
      console.log("SplitScreenTest: _handleOne()");
      this.castInRegion(ViewTypes.PIP, "TopLeft");
    }
    _handleTwo() {
      console.log("SplitScreenTest: _handleTwo()");
      this.castInRegion(ViewTypes.SIDE_BAR_HORIZONTAL, "Top");
    }
    _handleThree() {
      console.log("SplitScreenTest: _handleThree()");
      this.castInRegion(ViewTypes.PIP, "TopRight");
    }
    _handleFour() {
      console.log("SplitScreenTest: _handleFour()");
      this.castInRegion(ViewTypes.SIDE_BAR_VERTICAL, "Left");
    }
    _handleFive() {
      console.log("SplitScreenTest: _handleFive()");
      this.castInRegion(ViewTypes.FULL_SCREEN);
    }
    _handleSix() {
      console.log("SplitScreenTest: _handleSix()");
      this.castInRegion(ViewTypes.SIDE_BAR_VERTICAL, "Right");
    }
    _handleSeven() {
      console.log("SplitScreenTest: _handleSeven()");
      this.castInRegion(ViewTypes.PIP, "BottomLeft");
    }
    _handleEight() {
      console.log("SplitScreenTest: _handleEight()");
      this.castInRegion(ViewTypes.SIDE_BAR_HORIZONTAL, "Bottom");
    }
    _handleNine() {
      console.log("SplitScreenTest: _handleNine()");
      this.castInRegion(ViewTypes.PIP, "BottomRight");
    }
    async castInRegion(viewType, location) {
      this.messageText = "Displaying " + viewType + (location ? " in " + location : "");
      try {
        await this.reconfigureCaptureView(viewType);
        const displayRegion = location ? GreenScreenDisplayRegions[viewType][location] : GreenScreenDisplayRegions[viewType];
        await this.startCast(displayRegion);
      } catch (e) {
        console.error("SplitScreenTest: Something went wrong while starting cast:", e);
        this.messageText = "Starting " + viewType + (location ? " in " + location : "") + " failed.";
      }
    }
    async castAlignmentTest(captureRegionType) {
      this.messageText = "AlignmentTest " + captureRegionType;
      try {
        await this.thunderWrapper.configureCaptureRegion(GreenScreenCaptureRegions[captureRegionType]);
        await this.thunderWrapper.changeView(cherryAppName, ViewTypes.PIP);
        const displayRegion = GreenScreenDisplayRegions[ViewTypes.PIP]["TopLeft"];
        await this.startCast(displayRegion);
      } catch (e) {
        console.error("SplitScreenTest: Something went wrong while starting cast:", e);
        this.messageText = "Starting AlignMentTest " + captureRegionType;
      }
    }
    async startApp(appName) {
      try {
        await this.thunderWrapper.launchApp(appName);
      } catch (e) {
        console.error("SplitScreenDemo: Error while launching app:", e);
        this.messageText = "Starting app failed.";
      }
    }
    async reconfigureCaptureView(viewType) {
      try {
        await this.thunderWrapper.configureCaptureRegion(GreenScreenCaptureRegions[viewType]);
        await this.thunderWrapper.changeView(cherryAppName, viewType);
      } catch (e) {
        console.error("SplitScreenTest: Something went wrong while reconfiguring capture region:", e);
        this.messageText = "Reconfiguring view to " + viewType + " failed.";
      }
    }
    configure(thunderWrapper, avCastPlayer) {
      this.thunderWrapper = thunderWrapper;
      this.avCastPlayer = avCastPlayer;
      this.skyASPlayer = new SkyASPlayer(thunderWrapper);
    }
    async startCast(region) {
      await this.avCastPlayer.stop();
      await this.startPlayer(region);
    }
    async stopCast() {
      console.log("SplitScreenTest: stopCast()");
      await this.thunderWrapper.configureCaptureRegion({
        x: 0,
        y: 0,
        width: 1920,
        height: 1080
      });
      await this.avCastPlayer.stop();
    }
    async startPlayer(playbackRegion) {
      console.log("SplitScreenTest: startCast, playback region:", playbackRegion);
      if (!this.cherryIP || !this.videoPort) {
        let [cherryIP, videoPort] = await this.thunderWrapper.getCastConnectionStatus();
        this.cherryIP = cherryIP;
        this.videoPort = videoPort;
      }
      let result = await this.avCastPlayer.start(this.cherryIP, this.videoPort, Mode.TEXTURE, Resolution.RES_1920x1080, playbackRegion, true);
      if (!result.success) {
        throw new Error("Failed to start cast.");
      }
    }
  }

  const greenScreenDemoAppName = "uk.sky.cherry.greenscreendemo";
  const launcherName = "uk.sky.cherry.launcher";
  class DeepLinkTest extends Lightning.Component {
    static _template() {
      return {
        ButtonList: {
          alpha: this.bindProp("buttonListAlpha"),
          Button1: {
            type: Button,
            label: "Valid Deep Link \n Vertical View",
            labelY: 110,
            x: 40,
            y: 300,
            h: 220
          },
          Button2: {
            type: Button,
            label: "Invalid Deep Link \n Horizontal View",
            labelY: 110,
            x: 660,
            y: 300,
            h: 220
          },
          Button3: {
            type: Button,
            label: "Invalid Deep Link \n Horizontal View \n with component",
            labelY: 110,
            x: 1280,
            y: 300,
            h: 220
          }
        }
      };
    }
    configure(thunderWrapper, avCastPlayer) {
      this.thunderWrapper = thunderWrapper;
      this.avCastPlayer = avCastPlayer;
    }
    _firstEnable() {
      this.numButtons = this.tag("ButtonList").children.length;
      this.buttonIdx = 0;
      this.initialized = false;
      this.buttonListAlpha = 1;
    }
    async _disable() {
      this.showButtons();
      this.initialized = false;
      await this.startApp(launcherName);
      await this.closeApp(greenScreenDemoAppName);
      await this.avCastPlayer.stop();
    }
    _getFocused() {
      return this.tag("ButtonList").children[this.buttonIdx];
    }
    _handleLeft() {
      this.showButtons();
      if (this.buttonIdx > 0) {
        this.buttonIdx -= 1;
      }
    }
    _handleRight() {
      this.showButtons();
      if (this.buttonIdx < this.numButtons - 1) {
        this.buttonIdx += 1;
      }
    }
    _handleCenter() {
      if (this.buttonListAlpha == 0) {
        this.showButtons();
        return;
      }
      this.buttonAction();
      this.hideButtons();
    }
    showButtons() {
      this.buttonListAlpha = 1;
    }
    hideButtons() {
      this.buttonListAlpha = 0;
    }
    async buttonAction() {
      if (!this.initialized) {
        await this.initialiseApp();
      }
      switch (this.buttonIdx) {
        case 0:
          await this.button0Action();
          break;
        case 1:
          await this.button1Action();
          break;
        case 2:
          await this.button2Action();
          break;
      }
    }
    async cooldown(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
    async initialiseApp() {
      await this.startApp(greenScreenDemoAppName);
      await this.avCastPlayer.stop();
      await this.cooldown(200);
      await this.startPlayer();
      this.initialized = true;
    }
    async startApp(appName, dataUri, componentName) {
      try {
        await this.thunderWrapper.launchApp(appName, dataUri, componentName);
      } catch (e) {
        console.error("DeepLinkTest: Error while launching app:", e);
      }
    }
    async closeApp(appName) {
      try {
        await this.thunderWrapper.closeApp(appName, true);
      } catch (e) {
        console.error("DeepLinkTest: Error while closing app:", e);
      }
    }
    async startPlayer(playbackRegion) {
      console.log("DeepLinkTest: startPlayer");
      if (!this.cherryIP || !this.videoPort) {
        let [cherryIP, videoPort] = await this.thunderWrapper.getCastConnectionStatus();
        this.cherryIP = cherryIP;
        this.videoPort = videoPort;
      }
      let result = await this.avCastPlayer.start(this.cherryIP, this.videoPort, Mode.TEXTURE, Resolution.RES_1920x1080, playbackRegion, false);
      if (!result.success) {
        throw new Error("Failed to start player.");
      }
    }
    async button0Action() {
      await this.startApp(greenScreenDemoAppName, "gsd://greenscreendemo/test?view=SIDEBAR_VERTICAL");
    }
    async button1Action() {
      await this.startApp(greenScreenDemoAppName, "http://greenscreendemo/test?view=SIDEBAR_HORIZONTAL");
    }
    async button2Action() {
      await this.startApp(greenScreenDemoAppName, "http://greenscreendemo/test?view=SIDEBAR_HORIZONTAL", "uk.sky.cherry.greenscreendemo/uk.sky.cherry.greenscreendemo.MainActivity");
    }
  }

  class APKManagerTest extends Lightning.Component {
    static _template() {
      return {
        ButtonList: {
          ButtonInstallTest: {
            buttonID: 0,
            type: Button,
            label: "INSTALL TEST",
            x: 100,
            y: 60,
            w: 300,
            fontSize: 32
          },
          ButtonUpdateTest: {
            buttonID: 1,
            type: Button,
            label: "UPDATE TEST",
            x: 100,
            y: 170,
            w: 300,
            fontSize: 32
          },
          ButtonUninstallTest: {
            buttonID: 2,
            type: Button,
            label: "UNINSTALL TEST",
            x: 100,
            y: 280,
            w: 300,
            fontSize: 32
          }
        },
        Message: {
          x: 1500,
          y: 100,
          text: {
            text: this.bindProp("messageText"),
            textColor: 0xffff0000,
            fontSize: 24
          }
        }
      };
    }
    _enable() {
      console.log("ApkManagerTest: _enable()");
      this.buttonIdx = 0;
      this.messageText = "No Installation in progress";
    }
    _firstEnable() {
      console.log("ApkManagerTest: _firstEnable()");
      this.thunderWrapper.registerApkManagerProgressEventCallback(this.updateInstallProgress.bind(this));
    }
    _getFocused() {
      return this.tag("ButtonList").children[this.buttonIdx];
    }
    _handleUp() {
      console.log("APKManagerTest: _handleUp()");
      if (this.buttonIdx > 0) {
        this.buttonIdx--;
      }
    }
    _handleDown() {
      console.log("APKManagerTest: _handleDown()");
      if (this.buttonIdx + 1 < this.tag("ButtonList").children.length) {
        this.buttonIdx++;
      }
    }
    _handleCenter() {
      this.buttonClicked();
    }
    buttonClicked() {
      var buttonID = this.tag("ButtonList").children[this.buttonIdx].buttonID;
      switch (buttonID) {
        case 0:
          console.log("APKManagerTest: Install Test");
          this.thunderWrapper.installApp({
            "url": "https://dl.rt-rk.com/d/1d430c5facc90676992a23e1dabd5bc1/Brave.1.2.1.apk",
            "packageName": "com.brave.browser",
            "appVersion": "412107723",
            "isPreloaded": false
          });
          break;
        case 1:
          console.log("APKManagerTest: Update Test");
          this.thunderWrapper.updateApp({
            "url": "https://dl.rt-rk.com/d/236857c33f95788cefdb6955a79085d5/Brave.1.2.2.apk",
            "packageName": "com.brave.browser",
            "appVersion": "412207123",
            "isPreloaded": false
          });
          break;
        case 2:
          console.log("APKManagerTest: Uninstall Test");
          this.messageText = "Uninstalling App";
          this.thunderWrapper.uninstallApp({
            "packageName": "com.brave.browser"
          });
          this.messageText = "Uninstalled App";
          break;
      }
    }
    updateInstallProgress(notification) {
      console.log("APKManagerTest: " + JSON.stringify(notification));
      const progress = notification.percent;
      const state = notification.state;
      var progressPercentage = Math.round(progress * 100);
      switch (state) {
        case 0:
          this.messageText = "Download Starting";
          break;
        case 1:
          if (progressPercentage <= 50) {
            this.messageText = "Downloading: " + progressPercentage + "%";
          } else {
            this.messageText = "Installing: " + progressPercentage + "%";
          }
          break;
        case 2:
          this.messageText = "Installation Finished";
          break;
        case 3:
          this.messageText = "Download Failed";
          break;
        case 4:
          this.messageText = "Installation Failed";
          break;
        case 5:
          this.messageText = "No Space";
          break;
      }
    }
    configure(thunderWrapper) {
      this.thunderWrapper = thunderWrapper;
    }
  }

  class DisplaySettings extends Lightning.Component {
    static _template() {
      return {
        ButtonList: {
          alpha: this.bindProp("buttonListAlpha"),
          Button1: {
            type: Button,
            label: "1:Primary \n 2:Secondary",
            labelY: 110,
            x: 40,
            y: 300,
            h: 220
          },
          Button2: {
            type: Button,
            label: "1:Secondary \n 2:Primary",
            labelY: 110,
            x: 660,
            y: 300,
            h: 220
          }
        }
      };
    }
    configure(thunderWrapper) {
      this.thunderWrapper = thunderWrapper;
    }
    _firstEnable() {
      this.numButtons = this.tag("ButtonList").children.length;
      this.buttonIdx = 0;
    }
    _getFocused() {
      return this.tag("ButtonList").children[this.buttonIdx];
    }
    _handleLeft() {
      if (this.buttonIdx > 0) {
        this.buttonIdx -= 1;
      }
    }
    _handleRight() {
      if (this.buttonIdx < this.numButtons - 1) {
        this.buttonIdx += 1;
      }
    }
    _handleCenter() {
      this.buttonAction();
    }
    async buttonAction() {
      switch (this.buttonIdx) {
        case 0:
          await this.button0Action();
          break;
        case 1:
          await this.button1Action();
          break;
      }
    }
    async button0Action() {
      await this.thunderWrapper.setDisplays({
        "displays": [{
          "id": 1,
          "display": "westeros-asplayer-0"
        }, {
          "id": 2,
          "display": "westeros-asplayer-1"
        }]
      });
    }
    async button1Action() {
      await this.thunderWrapper.setDisplays({
        "displays": [{
          "id": 1,
          "display": "westeros-asplayer-1"
        }, {
          "id": 2,
          "display": "westeros-asplayer-0"
        }]
      });
    }
  }

  class CastSettings extends Lightning.Component {
    static _template() {
      return {
        ButtonList: {
          alpha: this.bindProp("buttonListAlpha"),
          Button1: {
            type: Button,
            label: "AVCast",
            labelY: 110,
            x: 40,
            y: 300,
            h: 220
          },
          Button2: {
            type: Button,
            label: "HDMI",
            labelY: 110,
            x: 660,
            y: 300,
            h: 220
          }
        }
      };
    }
    configure(videoPlayer) {
      this.videoPlayer = videoPlayer;
    }
    _firstEnable() {
      this.numButtons = this.tag("ButtonList").children.length;
      this.buttonIdx = 0;
    }
    _getFocused() {
      return this.tag("ButtonList").children[this.buttonIdx];
    }
    _handleLeft() {
      if (this.buttonIdx > 0) {
        this.buttonIdx -= 1;
      }
    }
    _handleRight() {
      if (this.buttonIdx < this.numButtons - 1) {
        this.buttonIdx += 1;
      }
    }
    _handleCenter() {
      this.buttonAction();
    }
    async buttonAction() {
      switch (this.buttonIdx) {
        case 0:
          await this.button0Action();
          break;
        case 1:
          await this.button1Action();
          break;
      }
    }
    async button0Action() {
      console.log("Cast settings: setting cast type to AVCast");
      await this.videoPlayer.setCastType(Type.IP);
    }
    async button1Action() {
      console.log("Cast settings: setting cast type to HDMI");
      await this.videoPlayer.setCastType(Type.HDMI);
    }
  }

  const ButtonID = {
    CAST_TEST: 0,
    AUDIO_CAST_TEST: 1,
    APP_TEST: 2,
    KEY_TEST: 3,
    SKY_AS_TEST: 4,
    REBOOT_TEST: 5,
    STANDBY_TEST: 6,
    SPLIT_SCREEN_TEST: 7,
    DEEP_LINK_TEST: 8,
    APKMNG_TEST: 9,
    CRASH_TEST: 10,
    WIPE_TEST: 11,
    FACTORY_RESET_TEST: 12,
    TRIGGER_FIRMWARE_CHECK_TEST: 13,
    DISPLAY_SETTINGS: 14,
    CAST_SETTINGS: 15
  };
  const ROWS = 7;
  class TestMenu extends Lightning.Component {
    static _template() {
      return {
        ButtonList: {
          alpha: this.bindProp("buttonListAlpha"),
          ButtonCastTest: {
            buttonID: ButtonID.CAST_TEST,
            type: Button,
            label: "CAST TEST",
            x: 100,
            y: 60,
            w: 300,
            fontSize: 32
          },
          ButtonAudioCastTest: {
            buttonID: ButtonID.AUDIO_CAST_TEST,
            type: Button,
            label: "AUDIO CAST TEST",
            x: 100,
            y: 170,
            w: 300,
            fontSize: 32
          },
          ButtonAppTest: {
            buttonID: ButtonID.APP_TEST,
            type: Button,
            label: "APP TEST",
            x: 100,
            y: 280,
            w: 300,
            fontSize: 32
          },
          ButtonKeyTest: {
            buttonID: ButtonID.KEY_TEST,
            type: Button,
            label: "KEY TEST",
            x: 100,
            y: 390,
            w: 300,
            fontSize: 32
          },
          ButtonSkyASTest: {
            buttonID: ButtonID.SKY_AS_TEST,
            type: Button,
            label: "SKY AS TEST",
            x: 100,
            y: 500,
            w: 300,
            fontSize: 32
          },
          ButtonRebootTest: {
            buttonID: ButtonID.REBOOT_TEST,
            type: Button,
            label: "DEVICE REBOOT",
            x: 100,
            y: 610,
            w: 300,
            fontSize: 32
          },
          ButtonStandbyTest: {
            buttonID: ButtonID.STANDBY_TEST,
            type: Button,
            label: "DEVICE STANDBY",
            x: 100,
            y: 720,
            w: 300,
            fontSize: 32
          },
          //Second column
          ButtonSplitScreenTest: {
            buttonID: ButtonID.SPLIT_SCREEN_TEST,
            type: Button,
            label: "SPLIT SCREEN TEST",
            x: 500,
            y: 60,
            w: 300,
            fontSize: 32
          },
          ButtonDeepLinkTest: {
            buttonID: ButtonID.DEEP_LINK_TEST,
            type: Button,
            label: "DEEP LINK TEST",
            x: 500,
            y: 170,
            w: 300,
            fontSize: 32
          },
          ButtonAPKManagerTest: {
            buttonID: ButtonID.APKMNG_TEST,
            type: Button,
            label: "APK MANAGER TEST",
            x: 500,
            y: 280,
            w: 300,
            fontSize: 32
          },
          ButtonCrashTest: {
            buttonID: ButtonID.CRASH_TEST,
            type: Button,
            label: "CRASH TEST",
            x: 500,
            y: 390,
            w: 300,
            fontSize: 32
          },
          ButtonWipeDeviceForNewPairing: {
            buttonID: ButtonID.WIPE_TEST,
            type: Button,
            label: "WIPE DEVICE FOR\n   NEW PAIRING",
            x: 500,
            y: 500,
            w: 300,
            fontSize: 32
          },
          ButtonFactoryResetDevice: {
            buttonID: ButtonID.FACTORY_RESET_TEST,
            type: Button,
            label: "FACTORY RESET",
            x: 500,
            y: 610,
            w: 300,
            fontSize: 32
          },
          ButtonTriggerFirmwareCheck: {
            buttonID: ButtonID.TRIGGER_FIRMWARE_CHECK_TEST,
            type: Button,
            label: "TRIGGER FIRMWARE\n   CHECK",
            x: 500,
            y: 720,
            w: 300,
            fontSize: 32
          },
          //Third column
          ButtonDisplaySettings: {
            buttonID: ButtonID.DISPLAY_SETTINGS,
            type: Button,
            label: "DISPLAY SETTINGS",
            x: 900,
            y: 60,
            w: 300,
            fontSize: 32
          },
          ButtonCastSettings: {
            buttonID: ButtonID.CAST_SETTINGS,
            type: Button,
            label: "CAST SETTINGS",
            x: 900,
            y: 170,
            w: 300,
            fontSize: 32
          }
        },
        TestList: {
          CastTest: {
            type: CastTest,
            alpha: this.bindProp("castTestAlpha")
          },
          AudioCastTest: {
            type: AudioCastTest,
            alpha: this.bindProp("audioCastTestAlpha")
          },
          AppTest: {
            type: AppTest,
            alpha: this.bindProp("appTestAlpha")
          },
          KeyTest: {
            type: KeyTest,
            alpha: this.bindProp("keyTestAlpha")
          },
          SkyASTest: {
            type: SkyASTest,
            alpha: this.bindProp("skyASTestAlpha")
          },
          SplitScreenTest: {
            type: SplitScreenTest,
            alpha: this.bindProp("splitScreenTestAlpha")
          },
          DeepLinkTest: {
            type: DeepLinkTest,
            alpha: this.bindProp("deepLinkTestAlpha")
          },
          APKManagerTest: {
            type: APKManagerTest,
            alpha: this.bindProp("apkManagerTestAlpha")
          },
          DisplaySettings: {
            type: DisplaySettings,
            alpha: this.bindProp("displaySettingsAlpha")
          },
          CastSettings: {
            type: CastSettings,
            alpha: this.bindProp("castSettingsAlpha")
          }
        }
      };
    }
    static _states() {
      return [class TestMenuState extends this {
        $enter() {
          console.log("TestMenuState: $enter()");
          this.buttonIdx = 0;
          this.showTestMenu();
        }
        _getFocused() {
          console.log("TestMenuState: _getFocussed buttonListAlpha: " + this.buttonListAlpha + ", buttonIndex: " + this.buttonIdx + ", activeTest:", this.activeTest);
          if (this.buttonListAlpha === 0) {
            return this.activeTest;
          } else {
            return this.tag("ButtonList").children[this.buttonIdx];
          }
        }
        _handleUp() {
          console.log("TestMenuState: _handleUp()");
          if (--this.buttonIdx % ROWS == ROWS - 1) {
            this.buttonIdx += ROWS;
            if (this.buttonIdx >= this.tag("ButtonList").children.length) {
              this.buttonIdx = this.tag("ButtonList").children.length - 1;
            }
          } else if (this.buttonIdx < 0) {
            this.buttonIdx = ROWS - 1;
          }
        }
        _handleDown() {
          console.log("TestMenuState: _handleDown()");
          if (++this.buttonIdx % ROWS == 0) {
            this.buttonIdx -= ROWS;
          }
          if (this.buttonIdx >= this.tag("ButtonList").children.length) {
            this.buttonIdx -= this.lastColumnOccupancy;
          }
        }
        _handleRight() {
          console.log("TestMenuState: _handleRight");
          this.buttonIdx += ROWS;
          if (this.buttonIdx >= this.tag("ButtonList").children.length) {
            this.buttonIdx %= ROWS;
          }
        }
        _handleLeft() {
          console.log("TestMenuState: _handleLeft");
          this.buttonIdx -= ROWS;
          if (this.buttonIdx < 0) {
            this.buttonIdx += ROWS * 2;
          }
          if (this.buttonIdx >= this.tag("ButtonList").children.length) {
            this.buttonIdx -= ROWS + 1;
          }
        }
        _handleCenter() {
          console.log("TestMenuState: _handleCenter");
          this.runTest();
        }
        _capturePlayPause() {
          let capture = this.skyASTestAlpha === 0 || this.tag("SkyASTest").playing === false;
          if (capture) {
            if (this.buttonListAlpha === 0) {
              this._setState("TestMenuState");
            } else {
              this.exitTestMenu();
            }
            this.showTestMenu();
          }
          return capture;
        }
      }];
    }
    _enable() {
      this._setState("TestMenuState");
      //    0 | 3
      //    -----
      //    1 |
      //    -----
      //    2 |
      //  maxGridElems = 6
      this.maxGridElems = Math.ceil(this.tag("ButtonList").children.length / ROWS) * ROWS;
      this.lastColumnOccupancy = this.tag("ButtonList").children.length % ROWS;
    }
    configure(thunderWrapper, keyHandler, avCastPlayer, systemAudioPlayer, videoPlayer) {
      this.thunderWrapper = thunderWrapper;
      this.keyHandler = keyHandler;
      this.avCastPlayer = avCastPlayer;
      this.systemAudioPlayer = systemAudioPlayer;
      this.videoPlayer = videoPlayer;
      this.tag("CastTest").configure(thunderWrapper, avCastPlayer);
      this.tag("AudioCastTest").configure(thunderWrapper, avCastPlayer, systemAudioPlayer);
      this.tag("AppTest").configure(thunderWrapper);
      this.tag("KeyTest").configure(thunderWrapper, keyHandler);
      this.tag("SkyASTest").configure(thunderWrapper);
      this.tag("SplitScreenTest").configure(thunderWrapper, avCastPlayer);
      this.tag("DeepLinkTest").configure(thunderWrapper, avCastPlayer);
      this.tag("APKManagerTest").configure(thunderWrapper);
      this.tag("DisplaySettings").configure(thunderWrapper);
      this.tag("CastSettings").configure(videoPlayer);
    }
    runTest() {
      var buttonID = this.tag("ButtonList").children[this.buttonIdx].buttonID;
      switch (buttonID) {
        case ButtonID.CAST_TEST:
          this.buttonListAlpha = 0;
          this.castTestAlpha = 1;
          this.activeTest = this.tag("TestList").children[0];
          break;
        case ButtonID.AUDIO_CAST_TEST:
          this.buttonListAlpha = 0;
          this.audioCastTestAlpha = 1;
          this.activeTest = this.tag("TestList").children[1];
          break;
        case ButtonID.APP_TEST:
          this.buttonListAlpha = 0;
          this.appTestAlpha = 1;
          this.activeTest = this.tag("TestList").children[2];
          break;
        case ButtonID.KEY_TEST:
          this.buttonListAlpha = 0;
          this.keyTestAlpha = 1;
          this.activeTest = this.tag("TestList").children[3];
          break;
        case ButtonID.SKY_AS_TEST:
          this.buttonListAlpha = 0;
          this.skyASTestAlpha = 1;
          this.activeTest = this.tag("TestList").children[4];
          break;
        case ButtonID.REBOOT_TEST:
          this.rebootDevice();
          break;
        case ButtonID.STANDBY_TEST:
          this.deviceStandby();
          break;
        case ButtonID.SPLIT_SCREEN_TEST:
          this.buttonListAlpha = 0;
          this.splitScreenTestAlpha = 1;
          this.activeTest = this.tag("TestList").children[5];
          break;
        case ButtonID.DEEP_LINK_TEST:
          this.buttonListAlpha = 0;
          this.deepLinkTestAlpha = 1;
          this.activeTest = this.tag("TestList").children[6];
          break;
        case ButtonID.APKMNG_TEST:
          this.buttonListAlpha = 0;
          this.apkManagerTestAlpha = 1;
          this.activeTest = this.tag("TestList").children[7];
          break;
        case ButtonID.CRASH_TEST:
          this.crashApp();
          break;
        case ButtonID.WIPE_TEST:
          this.wipeDeviceForNewPairing();
          break;
        case ButtonID.FACTORY_RESET_TEST:
          this.factoryResetDevice();
          break;
        case ButtonID.TRIGGER_FIRMWARE_CHECK_TEST:
          this.triggerFirmwareCheck();
          break;
        case ButtonID.DISPLAY_SETTINGS:
          this.buttonListAlpha = 0;
          this.displaySettingsAlpha = 1;
          this.activeTest = this.tag("TestList").children[8];
          break;
        case ButtonID.CAST_SETTINGS:
          this.buttonListAlpha = 0;
          this.castSettingsAlpha = 1;
          this.activeTest = this.tag("TestList").children[9];
          break;
      }
    }
    showTestMenu() {
      this.buttonListAlpha = 1;
      this.castTestAlpha = 0;
      this.audioCastTestAlpha = 0;
      this.appTestAlpha = 0;
      this.keyTestAlpha = 0;
      this.skyASTestAlpha = 0;
      this.splitScreenTestAlpha = 0;
      this.deepLinkTestAlpha = 0;
      this.activeTest = undefined;
      this.apkManagerTestAlpha = 0;
      this.displaySettingsAlpha = 0;
      this.castSettingsAlpha = 0;
    }
    triggerFirmwareCheck() {
      this.thunderWrapper.triggerFirmwareCheck();
      this.exitTestMenu();
    }
    rebootDevice() {
      this.thunderWrapper.rebootDevice();
      this.exitTestMenu();
    }
    deviceStandby() {
      this.thunderWrapper.deviceStandby();
    }
    crashApp() {
      let element = document.createElement("spam");
      // eslint-disable-next-line no-constant-condition
      while (true) {
        element.innerHTML += "Crash is comming... ";
      }
    }
    wipeDeviceForNewPairing() {
      console.log("wipeDeviceForNewPairing()");
      this.thunderWrapper.wipeDeviceForNewPairing();
    }
    factoryResetDevice() {
      console.log("factoryResetDevice");
      this.thunderWrapper.factoryResetDevice();
    }
    exitTestMenu() {
      this.tag("CastTest").exitCast();
      this._setState("");
      this.signal("exitTestMenu");
    }
  }

  const homeKeyCode$1 = 36;
  class DemoLauncher extends Lightning.Component {
    _init() {
      console.log('DemoLauncher _init');
      this.overwriteKeyHandlers();
    }
    debounceHomeKeyEvents(e) {
      if (e.keyCode === homeKeyCode$1) {
        if (e.timeStamp - this.lastHomeButtonTimeStamp < 20) {
          console.log("Interval between home button down smaller than 20ms. Ignoring");
          return;
        }
        this.lastHomeButtonTimeStamp = e.timeStamp;
      }
      this.application._receiveKeydown(e);
    }
    overwriteKeyHandlers() {
      this.stage.platform._removeKeyHandler();
      this.lastHomeButtonTimeStamp = 0;
      this.stage.platform.registerKeydownHandler(e => {
        this.debounceHomeKeyEvents(e);
      });
      this.stage.platform.registerKeyupHandler(e => {
        this.application._receiveKeyup(e);
      });
    }
  }

  class DemoExperience extends DemoLauncher {
    static _template() {
      return {
        DemoMenu: {
          type: DemoMenu,
          alpha: this.bindProp("demoMenuAlpha")
        },
        TestMenu: {
          type: TestMenu,
          alpha: this.bindProp("testMenuAlpha"),
          signals: {
            exitTestMenu: true // Handle exit from child component where App state machine is out of scope
          }
        }
      };
    }

    static _states() {
      return [class AppDemoMenuState extends this {
        $enter() {
          this.showDemoMenu();
        }
        _getFocused() {
          return this.tag("DemoMenu");
        }
        _handlePlayPause() {
          this.showTestMenu();
          this._setState("AppTestMenuState");
        }
        _handleBack() {
          // Captures back button and does nothing - avoids app exiting
        }
      }, class AppTestMenuState extends this {
        $enter() {
          this.showTestMenu();
        }
        _getFocused() {
          return this.tag("TestMenu");
        }
        _handlePlayPause() {
          this._setState("AppDemoMenuState");
        }
        _handleBack() {
          console.log("AppDemoMenuState: _handleBack - ignoring");
        }
      }];
    }
    _init() {
      console.log("DemoExperience _init");
      super._init();
    }
    showDemoMenu() {
      this.demoMenuAlpha = 1;
      this.testMenuAlpha = 0;
    }
    showTestMenu() {
      this.demoMenuAlpha = 0;
      this.testMenuAlpha = 1;
    }
    exitTestMenu() {
      this._setState("AppDemoMenuState");
    }
    configure(thunderWrapper, keyHandler, avCastPlayer, systemAudioPlayer, videoPlayer) {
      console.log("DemoExperience configure");
      // Inject dependencies into menu components
      this.tag("DemoMenu").configure(thunderWrapper, keyHandler, avCastPlayer, systemAudioPlayer, videoPlayer);
      this.tag("TestMenu").configure(thunderWrapper, keyHandler, avCastPlayer, systemAudioPlayer, videoPlayer);
    }
    _firstEnable() {
      // Register for event callbacks
      console.log("_firstEnable");
      // Start demo menu
      this.showDemoMenu();
      this._setState("AppDemoMenuState");
    }
  }

  class AppExperience extends DemoLauncher {
    static _template() {
      return {
        CherryAppLauncher: {
          type: CherryAppLauncher
        }
      };
    }
    _init() {
      console.log("AppExperience _init");
      super._init();
    }
    _getFocused() {
      return this.tag("CherryAppLauncher");
    }
    _captureHome() {
      this.closeApp();
    }
    closeApp() {
      this.tag("CherryAppLauncher").terminate();
      this.application.closeApp();
    }
    setupApp(appName) {
      console.log("AppExperience setupApp");
      this.tag("CherryAppLauncher").setupApp(appName, "");
    }
    configure(thunderWrapper, keyHandler, avCastPlayer, systemAudioPlayer, videoPlayer) {
      // Inject dependencies
      this.tag("CherryAppLauncher").configure(thunderWrapper, keyHandler, videoPlayer);
    }
    launchApp() {
      console.log("AppExperience - launchApp");
      this.tag("CherryAppLauncher").launchApp();
    }
    set params(args) {
      console.log("AppExperience params - " + args.pkg);
      this.setupApp(args.pkg);
    }
    async _onDataProvided() {
      console.log("AppExperience - _onDataProvided");
      this.launchApp();
    }
  }

  class ErrorExperience extends Lightning.Component {
    _init() {
      this.errorObj = "Something went wrong.";
    }
    static _template() {
      return {
        x: 0,
        y: 0,
        w: 1920,
        h: 1080,
        color: 0xff000000,
        rect: true,
        alpha: 1,
        Message: {
          x: w => w / 2,
          y: h => h / 2,
          mount: 0.5,
          text: {
            text: this.bindProp("errorObj"),
            color: 0xff20ba81,
            fontSize: 35
          }
        }
      };
    }
    set params(args) {
      console.log("Setting error object:", args.request.error);
      this.errorObj = args.request.error;
    }
  }

  function getRoutes(injectDependencies) {
    return {
      root: "home",
      routes: [{
        path: "home",
        component: DemoExperience,
        on: injectDependencies.bind(null, "home"),
        widgets: ["MuteControlOverlay"]
      }, {
        path: "app/:pkg",
        component: AppExperience,
        on: injectDependencies.bind(null, "app/:pkg"),
        widgets: ["MuteControlOverlay"]
      }, {
        path: "!",
        component: ErrorExperience
      }]
    };
  }

  class DebugOverlay extends Lightning.Component {
    static _template() {
      return {
        w: 1520,
        h: 900,
        color: 0xff616161,
        rect: true,
        x: 200,
        y: 90,
        z: 10,
        alpha: 0.85,
        ThunderStatus: {
          x: 50,
          y: 40,
          text: {
            text: this.bindProp("thunderStatus"),
            color: 0xff20ba81,
            fontSize: 35,
            fontFace: "Regular"
          }
        },
        DeviceBridgeStatus: {
          x: 50,
          y: 120,
          text: {
            text: this.bindProp("deviceBridgeStatus"),
            color: 0xff20ba81,
            fontSize: 35,
            fontFace: "Regular"
          }
        },
        UsbInterfaceStatus: {
          x: 800,
          y: 120,
          text: {
            text: this.bindProp("usbInterfaceStatus"),
            color: 0xff20ba81,
            fontSize: 35,
            fontFace: "Regular"
          }
        },
        DeviceBridgeReason: {
          x: 50,
          y: 200,
          text: {
            text: this.bindProp("deviceBridgeReason"),
            color: 0xff20ba81,
            fontSize: 35,
            fontFace: "Regular"
          }
        },
        CastType: {
          x: 800,
          y: 200,
          text: {
            text: this.bindProp("castType"),
            color: 0xff20ba81,
            fontSize: 35,
            fontFace: "Regular"
          }
        },
        CastControlStatus: {
          x: 50,
          y: 280,
          text: {
            text: this.bindProp("castControlStatus"),
            color: 0xff20ba81,
            fontSize: 35,
            fontFace: "Regular"
          }
        },
        LlamaImageVersion: {
          x: 50,
          y: 360,
          text: {
            text: this.bindProp("llamaImageVersion"),
            color: 0xff20ba81,
            fontSize: 35,
            fontFace: "Regular"
          }
        },
        DeviceImageVersion: {
          x: 50,
          y: 440,
          text: {
            text: this.bindProp("deviceImageVersion"),
            color: 0xff20ba81,
            fontSize: 35,
            fontFace: "Regular"
          }
        },
        SdkVersion: {
          x: 50,
          y: 520,
          text: {
            text: this.bindProp("sdkVersion"),
            color: 0xff20ba81,
            fontSize: 35,
            fontFace: "Regular"
          }
        },
        AppVersion: {
          x: 50,
          y: 600,
          text: {
            text: this.bindProp("appVersion"),
            color: 0xff20ba81,
            fontSize: 35,
            fontFace: "Regular"
          }
        },
        FirmwareUpdateState: {
          x: 50,
          y: 680,
          text: {
            text: this.bindProp("firmwareUpdateState"),
            color: 0xff20ba81,
            fontSize: 35,
            fontFace: "Regular"
          }
        },
        FirmwareUpdateProgress: {
          x: 50,
          y: 760,
          text: {
            text: this.bindProp("firmwareUpdateProgress"),
            color: 0xff20ba81,
            fontSize: 35,
            fontFace: "Regular"
          }
        }
      };
    }
    _getFocused() {
      console.log("_getFocused()");
      return this;
    }
    configure(appVersion) {
      this.thunderStatus = "Thunder status: not connected";
      this.deviceBridgeStatus = "Device bridge status: Trying to connect... ";
      this.usbInterfaceStatus = "USB interface: not detected ";
      this.deviceBridgeReason = this.deviceBridgeStatus;
      this.castControlStatus = "Cast control status: Waiting for connection... ";
      this.castType = "Cast type: AVCast";
      this.llamaImageVersion = "Llama image version: ";
      this.deviceImageVersion = "Device image version: ";
      this.sdkVersion = "SDK verion: " + version;
      this.appVersion = "App version: " + appVersion;
      this.firmwareUpdateState = "Firmware update state: ?";
      this.firmwareUpdateProgress = "Progress: ? Compulsory: ?";
    }
    async configureThunder(thunderWrapper) {
      this.thunderWrapper = thunderWrapper;
      this.thunderStatus = "Thunder status: connected";
      await this.connectDeviceBridge();
      await this.getLlamaImageVersion();
      await this.getDeviceImageVersion();
      await this.thunderWrapper.registerDeviceBridgeConnectionStatusChangedCallback(this.updateDeviceBridgeStatus.bind(this));
      await this.thunderWrapper.registerCastControlStatusChangedCallback(this.updateCastControlStatus.bind(this));
      await this.thunderWrapper.registerFirmwareUpdateListener(this.updateFirmwareUpdateStatus.bind(this));
    }
    async updateFirmwareUpdateStatus(notification) {
      this.firmwareUpdateState = "Firmware update state: ".concat(notification.state);
      this.firmwareUpdateProgress = "Progress: ".concat(notification.progress, ", Compulsory: ").concat(notification.compulsory);
    }
    _captureKey(e) {
      if (e.keyCode !== 0) {
        console.log("Key pressed: " + e.keyCode.toString());
      }
      return true;
    }
    async getLlamaImageVersion() {
      console.log("getLlamaImageVersion");
      const result = await this.thunderWrapper.getDeviceInfo();
      console.log("Llama image version:", result.imageVersion);
      this.llamaImageVersion = "Llama image version: " + result.imageVersion;
    }
    async getDeviceImageVersion() {
      console.log("getDeviceImageVersion");
      const result = await this.thunderWrapper.getDeviceImageVersion();
      console.log("Device image version:", result);
      this.deviceImageVersion = "Device image version: " + result;
    }
    updateDeviceBridgeStatus(status) {
      const [connected, ip, port, usbInterface, reason] = status;
      const usbInterfaceStatus = "USB interface:" + (usbInterface === true ? " " : " not ") + "detected";
      if (connected === true) {
        this.deviceBridgeStatus = "Device bridge status: " + ip + ":" + port;
        this.usbInterfaceStatus = usbInterfaceStatus;
        this.getDeviceImageVersion();
      } else {
        this.deviceBridgeStatus = "Device bridge status: Trying to connect...";
        this.usbInterfaceStatus = usbInterfaceStatus;
        this.deviceImageVersion = "Device image version: ";
      }
      this.deviceBridgeReason = "Device bridge reason: " + reason;
    }
    updateCastControlStatus(status) {
      console.log("updateCastControlStatus", status);
      const [connected, ip, videoPort, audioPort] = status;
      if (connected === true) {
        this.castControlStatus = "Cast control status: " + ip + " Video port: " + videoPort + " AudioPort: " + audioPort;
      } else {
        this.castControlStatus = "Cast control status: Waiting for connection...";
      }
    }
    async updateCastType(type) {
      console.log("updateCastType: " + type);
      if (type === Type.HDMI) {
        this.castType = "Cast type: HDMI";
      } else {
        this.castType = "Cast type: AVCast";
      }
      console.log("new cast type: " + this.castType);
    }
    async connectDeviceBridge() {
      console.log("connectDeviceBridge");
      const status = await this.thunderWrapper.getDeviceBridgeConnectionStatus();
      this.updateDeviceBridgeStatus(status);
    }
  }

  const ICON_VISIBLE = 1;
  const ICON_HIDDEN = 0;
  class MuteControlOverlay extends Lightning.Component {
    static _template() {
      return {
        Icon: {
          x: 1720,
          y: 90,
          src: Utils.asset("images/mute-control.png"),
          alpha: this.bindProp("iconAlpha")
        }
      };
    }
    async configureThunder(thunderWrapper) {
      Log.debug("MuteControlOverlay", "configureThunder");
      this.iconAlpha = 0;
      this.connectedToDevice = false;
      this.thunderWrapper = thunderWrapper;
      await this.setCurrentStatusOfMuteControl();
      await this.thunderWrapper.registerDeviceBridgeConnectionStatusChangedCallback(this.onDeviceBridgeConnectionStatusChanged.bind(this));
      await this.thunderWrapper.registerDeviceBridgeOnMuteControlChangedCallback(this.onMuteControlChanged.bind(this));
    }
    async setCurrentStatusOfMuteControl() {
      const result = await this.thunderWrapper.getMuteControl();
      if (result === undefined || result.success != true) {
        Log.warn("MuteControlOverlay", "JSON-RPC was not succeeded");
        return;
      }
      this.updateMuteControlStatus(result.muted);
    }
    updateMuteControlStatus(muted) {
      Log.info("MuteControlOverlay", "Status of Mute Control changed to " + muted);
      this.iconAlpha = muted === true ? ICON_VISIBLE : ICON_HIDDEN;
    }
    async onDeviceBridgeConnectionStatusChanged(notification) {
      const [connected] = notification;
      if (this.connectedToDevice === connected) {
        return;
      }
      Log.info("MuteControlOverlay", "Status of Device Bridge connection changed to " + connected);
      this.connectedToDevice = connected;
      if (connected === true) {
        await this.setCurrentStatusOfMuteControl();
      } else {
        this.iconAlpha = ICON_HIDDEN;
      }
    }
    async onMuteControlChanged(notification) {
      if (this.connectedToDevice != true) {
        Log.info("MuteControlOverlay", "Device is not connected - ignoring the change of mute control");
        return;
      }
      this.updateMuteControlStatus(notification.muted);
    }
  }

  /**
   * Playback system audio.
   * The api requires the id of the websocket playback to be kept track of.
   * This class helps encapsulate this, as well as providing the appropriate error checking.
   */

  const PRIMARY_VOLUME = 50;
  const PLAYER_VOLUME = 100;
  class SystemAudioPlayer {
    constructor(thunderWrapper) {
      this.thunderWrapper = thunderWrapper;
      this.playerId = -1;
      this.url = "";
      this.playing = false;
      window.addEventListener("firebolt.lifecycleStateChange", event => {
        if (event.detail.newState === "unloading") {
          console.log("SystemAudioPlayer: unloading event was received - stop player for id " + this.playerId);
          this.stopAndClose();
        }
      });
    }
    async destroy() {
      console.log("Destroying SystemAudioPlayer");
      if (this.playerId >= 0) {
        if (this.playing) {
          await this.stopAndClose();
        } else {
          await this.close();
        }
      }
    }
    async openAndStart(path) {
      if (!(await this.open())) {
        return false;
      }
      await this.setMixerLevels(PRIMARY_VOLUME, PLAYER_VOLUME);
      await this.play(path);
      return true;
    }
    async stopAndClose() {
      await this.stop();
      await this.close();
    }
    async open() {
      if (this.playerId >= 0) {
        console.log("SystemAudioPlayer: open() called when player already opened - call close() first");
        return false;
      }
      const id = await this.thunderWrapper.systemAudioOpen();
      if (!id) {
        console.error("SystemAudioPlayer: unable to open an audio");
        return false;
      }
      console.log("SystemAudioPlayer: opened with id " + id);
      this.playerId = id;
      return await this.configureAudio();
    }
    async close() {
      if (this.playerId < 0) {
        console.log("SystemAudioPlayer: close() called with invalid PlayerId");
        return false;
      }
      if (this.playing) {
        console.log("SystemAudioPlayer: close() called while audio is playing - call stop() first");
        return false;
      }
      const result = await this.thunderWrapper.systemAudioClose(this.playerId);
      if (result === false) {
        console.warn("SystemAudioPlayer: cannot close System Audio Player");
        return result;
      }
      this.playerId = -1;
      return result;
    }
    async configureAudio() {
      if (this.playerId < 0) {
        console.log("SystemAudioPlayer: configureAudio() called with invalid PlayerId");
        return false;
      }
      return await this.thunderWrapper.systemAudioConfigure(this.playerId);
    }
    async setMixerLevels(primaryVolume, playerVolume) {
      if (this.playerId < 0) {
        console.log("SystemAudioPlayer: setMixerLevels() called with invalid PlayerId");
        return false;
      }
      return await this.thunderWrapper.systemAudioSetMixerLevels(this.playerId, primaryVolume, playerVolume);
    }
    async play(url) {
      if (this.playerId < 0) {
        console.log("SystemAudioPlayer: play() called with invalid PlayerId");
        return false;
      }
      if (this.playing) {
        console.log("SystemAudioPlayer: this instance is already playing an audio so cannot play another audio");
        return false;
      }
      const result = await this.thunderWrapper.systemAudioPlay(this.playerId, url);
      if (result === false) {
        console.warn("SystemAudioPlayer: cannot execute play on System Audio Player");
        return result;
      }
      this.playing = true;
      this.url = url;
      return result;
    }
    async stop() {
      if (this.playerId < 0) {
        console.log("SystemAudioPlayer: stop() called with invalid PlayerId");
        return false;
      }
      if (!this.playing) {
        console.log("SystemAudioPlayer: this instance is not playing an audio so cannot be stopped");
        return false;
      }
      const result = await this.thunderWrapper.systemAudioStop(this.playerId);
      if (result === false) {
        console.warn("SystemAudioPlayer: cannot stop System Audio Player");
        return result;
      }
      this.playing = false;
      this.url = "";
      return result;
    }
  }

  const keyStates = {
    DOWN: '0',
    UP: '1'
  };
  const homeKeyCode = '36';
  class KeyHandler {
    constructor(thunderWrapper) {
      this.thunderWrapper = thunderWrapper;
    }
    handleKeyDown(keyCode) {
      this.sendKeyEvent(keyCode.toString(), keyStates.DOWN);
    }
    handleKeyUp(keyCode) {
      this.sendKeyEvent(keyCode.toString(), keyStates.UP);
    }
    sendHomeKey() {
      this.sendKeyEvent(homeKeyCode, keyStates.DOWN);
      this.sendKeyEvent(homeKeyCode, keyStates.UP);
    }
    sendKeyEvent(code, state) {
      this.thunderWrapper.sendKeyEvent(code, state);
    }
  }

  class AVCastPlayer {
    constructor(thunderWrapper) {
      this.thunderWrapper = thunderWrapper;
      this.thunderWrapper.registerAvCastPlayerStoppedCallback(this.onPlayerStopped.bind(this));
      window.addEventListener("firebolt.lifecycleStateChange", event => {
        if (event.detail.newState === "unloading") {
          console.log("AVCastPlayer: unloading event was received - going to stop a player");
          this.stop();
        }
      });
    }
    async start(address, videoPort, mode, res, playbackRegion, alpha, display) {
      console.log("AVCastPlayer: starting cast, ip: " + address + ", videoPort: " + videoPort + ", mode: " + mode + ", resolution: " + res + ", playbackRegion:" + playbackRegion + ", alpha: " + alpha + ", display: " + display);
      VideoResizer.resizeToFullScreen(display || PlayerId.AVCAST_AS_PLAYER);
      let result = await this.thunderWrapper.startCast(address, videoPort, mode, res, playbackRegion, alpha, display);
      if (!result.success) {
        console.error("AVCastPlayer: Starting cast failed.");
        return result;
      }
      await this.startWatchdog(5000);
      return result;
    }
    onPlayerStopped() {
      console.warn("Event playerStopped was received. Most likely, watchdog had not been notified");
    }
    async startWatchdog(timeout) {
      await this.thunderWrapper.enableWatchdog(timeout);
      this.intervalId = setInterval(async () => {
        await this.thunderWrapper.signalWatchdog();
      }, timeout / 2);
    }
    async stop() {
      console.log("AVCastPlayer: stop cast");
      await this.thunderWrapper.stopCast();
      await this.thunderWrapper.disableWatchdog();
      clearInterval(this.intervalId);
    }
  }

  //console.log = function() {}  // comment out to disable console.log

  const KEY_CODE_9 = 57;
  const KEY_CODE_1 = 49;
  class App extends Router.App {
    static _template() {
      return {
        Pages: {
          forceZIndexContext: true
        },
        Widgets: {
          DebugOverlay: {
            type: DebugOverlay
          },
          MuteControlOverlay: {
            type: MuteControlOverlay
          }
        },
        Loading: {
          rect: true,
          w: 1920,
          h: 1080,
          color: 0xff000000,
          visible: false,
          zIndex: 99,
          Label: {
            mount: 0.5,
            x: 960,
            y: 540,
            text: {
              text: "Connecting to thunder"
            }
          }
        }
      };
    }
    static getFonts() {
      return [{
        family: "Regular",
        url: Utils.asset("fonts/Roboto-Regular.ttf")
      }];
    }
    async injectDependencies(self, path, page, params) {
      console.info("Router.js injecting dependencies for ".concat(path, " params=").concat(JSON.stringify(params)));
      try {
        self.thunderWrapper = await new ThunderWrapper().init();
        const debugOverlay = self.tag("DebugOverlay");
        const keyHandler = new KeyHandler(self.thunderWrapper);
        const avCastPlayer = new AVCastPlayer(self.thunderWrapper);
        const systemAudioPlayer = new SystemAudioPlayer(self.thunderWrapper);
        const videoPlayer = new VideoPlayer(self.thunderWrapper, avCastPlayer, systemAudioPlayer);
        videoPlayer.registerCastTypeChangeCallback(debugOverlay.updateCastType.bind(debugOverlay));
        debugOverlay.configureThunder(self.thunderWrapper);
        await self.tag("MuteControlOverlay").configureThunder(self.thunderWrapper);
        await page.configure(self.thunderWrapper, keyHandler, avCastPlayer, systemAudioPlayer, videoPlayer);
      } catch (err) {
        console.error("Router.js error err=".concat(err));
        throw err;
      }
    }
    _setup() {
      this.debugOverlaySequence = [KEY_CODE_9, KEY_CODE_1, KEY_CODE_1];
      this.debugOverlaySequenceIndex = 0;
      this.tag("DebugOverlay").configure(this.parent.config.version);
      Router.startRouter(getRoutes(this.injectDependencies.bind(null, this)));
      console.log("Router started");
    }
    _handleAppClose(params) {
      console.log("Closing app " + params);
    }
    isDebugOverlaySequenceCompleted(newKeyCode) {
      if (this.debugOverlaySequence[this.debugOverlaySequenceIndex] !== newKeyCode) {
        this.debugOverlaySequenceIndex = 0;
        return false;
      }
      this.debugOverlaySequenceIndex += 1;
      if (this.debugOverlaySequenceIndex !== this.debugOverlaySequence.length) {
        return false;
      }
      this.debugOverlaySequenceIndex = 0;
      return true;
    }
    _captureKey(e) {
      if (e.keyCode === 0) {
        return false;
      }
      if (this.isDebugOverlaySequenceCompleted(e.keyCode)) {
        if (this.tag("DebugOverlay").visible) {
          console.log("Hide debug overlay");
          this.tag("DebugOverlay").visible = false;
          Router.focusPage();
        } else {
          console.log("Show debug overlay");
          this.tag("DebugOverlay").visible = true;
          Router.focusWidget("DebugOverlay");
        }
        return true;
      } else {
        return false;
      }
    }
  }
  window.onload = function () {
    const options = {
      stage: {
        w: window.innerWidth,
        h: window.innerHeight,
        canvas2d: false,
        color: 0xffffffff
      }
    };
    const app = new App(options);
    document.body.appendChild(app.stage.getCanvas());
  };

  function index () {
    return Launch(App, ...arguments);
  }

  return index;

})();
//# sourceMappingURL=appBundle.js.map
