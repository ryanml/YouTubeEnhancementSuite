/**
 * YouTube Enhancement Suite
 * Author: Ryan Lanese
 * Url: https://github.com/ryanml/YouTubeEnhancementSuite/
 */
let YTES = {

  /**
   * This first block of attributes are to be 
   * edited by the user to their liking. In future
   * versions this will be offloaded in to an 
   * extension menu.
   */

  /**
   * Setting debug to true will log extension actions
   * and errors to the console
   */
  debug: false,

  /**
   * YTES requires a valid API key for Youtube's Data API.
   * For information on obtaining one, see: 
   * https://developers.google.com/youtube/v3/getting-started
   */
  apiKey: 'USER_API_KEY',

  /**
   * Warning: Do not edit the attributes following this comment
   * Doing so may result in unintended behavior.
   */

  cache: {},

  hasBuilt: false,

  ytApi: 'https://www.googleapis.com/youtube/v3/videos',

  selectors: {
    metadata: '#metadata',
    adorned: '.ytes-adorned',
    initial: '#contents ytd-video-renderer:not(.ytes-adorned)'
  },

  language: {
    placeholder: 'YTES Utilities Placeholder'
  },

  init: function () {
    let videoIds = this.prepareVideoIds();
    this.fetchVideoInfo(videoIds);
    this.hasBuilt = true;
  },

  get: function (selector, root=false) {
    let parent = root || document;
    let elements = parent.querySelectorAll(selector);
    let result = elements.length === 1 ? elements[0] : elements;
    return result;
  },

  addClass: function (element, _class) {
    element.className += ` ${_class}`;
  },

  cacheVideoResults: function (videoSet) {
    let nodeArray = Array.from(videoSet);
    this.cache.videoResults = nodeArray;
  },

  pryVideoId: function (videoBlock) {
    let videoTitle = this.get('#video-title', videoBlock);
    let videoHref = videoTitle.getAttribute('href');
    return videoHref.split('?v=')[1];
  },

  addInfo: function (preview, info) {
    let infoBlock = document.createElement('div');
    infoBlock.className = 'style-scope';
    infoBlock.innerHTML = `${this.language.placeholder} || ${info.id}`;
    preview.appendChild(infoBlock);
  },

  formatParams: function (payload) {
    let paramBuff = '';
    Object.keys(payload).map((key, inc) => {
      let symbol = inc > 0 ? '&' : '?';
      paramBuff += `${symbol}${key}=${payload[key]}`;
    });
    return paramBuff;
  },

  fetchVideoInfo: function (videoIds) {
    let xmlHr = new XMLHttpRequest();
    let params = this.formatParams({
      'key': this.apiKey,
      'part': 'statistics',
      'id': videoIds.join(',')
    });

    xmlHr.open('GET', `${this.ytApi}${params}`, true);

    xmlHr.onload = function (event) {
      if (xmlHr.readyState === 4) {
        if (xmlHr.status === 200) {
          console.log(`Success: ${xmlHr.responseText}`);
        } else if (xmlHr.status === 403) {
          if (this.debug) {
            console.log(
              `The YT API was reached successfully, but returned a 403.
              Ensure that your API key is correct.`
            );
          }
        } else {
          if (this.debug) {
            console.log(
              `YT API response error, status code: ${xmlHr.status}`
            );
          }
        }
      }
    };

    xmlHr.onerror = function (err) {
      if (this.debug) {
        console.log(
          `Error making API call with payload: ${payload}
          Details: ${xmlHr.statusText}`
        );
      }
    };

    xmlHr.send(null);
  },

  prepareVideoIds: function () {
    let videoIds = [];
    let containers = this.hasBuilt ?
    this.get(this.selectors.adorned) :
    this.get(this.selectors.initial);

    for (let c = 0; c < containers.length; c++) {
      let _this = containers[c];
      let videoId = this.pryVideoId(_this);

      videoIds.push(videoId);
      this.addClass(_this, videoId);
    }

    return videoIds;
  }
};

YTES.init();
