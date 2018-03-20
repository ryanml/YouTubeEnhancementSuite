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

  cache: {
    lastScrollTop: 0
  },

  state: {
    route: '',
    isProcessing: false
  },

  ytApi: 'https://www.googleapis.com/youtube/v3/videos',

  selectors: {
    home: {
      title: '#video-title',
      initial: '#contents ytd-grid-video-renderer:not(.received)'
    },
    results: {
      title: '#video-title',
      initial: '#contents ytd-video-renderer:not(.received)'
    },
    video: {
      title: '.yt-simple-endpoint:first-child',
      initial: '#items ytd-compact-video-renderer:not(.received)'
    }
  },

  init: function () {
    let self = this;
    let route = this.getRoute();

    if (!route) {
      return;
    }
    this.state.route = route;

    this.prepareVideoIds();
    this.scrollActions();
  },

  scrollActions: function () {
    let self = this;
    window.addEventListener('scroll', function (e) {
      let scrollPos = window.pageYOffset || document.documentElement.scrollTop;
      /**
       * There isn't a case (so far) where scroll up reveals new videos.
       * We should only be checking for new videos when scrolling down the page
       */
      if (scrollPos > self.cache.lastScrollTop && !self.state.isProcessing) {
        self.prepareVideoIds();
      }
      self.cache.lastScrollTop = scrollPos;
    });
  },

  get: function (selector, root=false) {
    let parent = root || document;
    let elements = parent.querySelectorAll(selector);
    let result = elements.length === 1 ? elements[0] : elements;
    return result;
  },

  getRoute: function () {
    switch (location.pathname) {
      case '/': return 'home';
      case '/results': return 'results';
      case '/watch': return 'video';
      default: return false;
    }
  },

  append: function (markup, root=false) {
    let parent = root || document.body;
    parent.innerHTML += markup;
  },

  addClass: function (element, _class) {
    element.className += ` ${_class}`;
  },

  replaceClass: function (element, oldClass, newClass) {
    element.className = element.className.replace(oldClass, newClass);
  },

  cacheVideoResults: function (videoSet) {
    let nodeArray = Array.from(videoSet);
    this.cache.videoResults = nodeArray;
  },

  pryVideoId: function (videoBlock) {
    let videoTitle = this.get(this.selectors[this.state.route].title, videoBlock);
    let videoHref = videoTitle.getAttribute('href');
    let idPart = videoHref.split('?v=')[1];
    idPart = idPart.indexOf('&t=') > -1 ? idPart.split('&t=')[0] : idPart;
    return idPart;
  },

  formatParams: function (payload) {
    let paramBuff = '';
    Object.keys(payload).map((key, inc) => {
      let symbol = inc > 0 ? '&' : '?';
      paramBuff += `${symbol}${key}=${payload[key]}`;
    });
    return paramBuff;
  },

  addVideoInfo: function (stats, item) {
    let metadata = this.get('#metadata', item);
    for (var stat in stats) {
      if (stats.hasOwnProperty(stat)) {
        this.append(`${stat}: ${stats[stat]} `, metadata);
      }
    }
    this.replaceClass(item, 'should-receive', 'received');
  },

  resolveVideoInfo: function (videoInfo) {
    let toReceive = this.get('.should-receive');
    for (let v = 0; v < toReceive.length; v++) {
      let _this = toReceive[v];
      let videoId = _this.dataset.videoid;
      let infoItem = videoInfo.filter(i => i.id === videoId)[0];

      if (typeof infoItem === 'undefined')
        continue;

      let stats = {
        likes: infoItem.statistics.likeCount,
        dislikes: infoItem.statistics.dislikeCount,
        comments: infoItem.statistics.commentCount || 'disabled'
      };

      this.addVideoInfo(stats, _this);
    }
  },

  fetchVideoInfo: function (videoIds) {
    let self = this;
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
          let response = JSON.parse(xmlHr.responseText);
          self.resolveVideoInfo(response.items);
        } else if (this.debug) {
          console.log(
            `YT API response error, status code: ${xmlHr.status}`
          );
        }
      }
      self.state.isProcessing = false;
    };

    xmlHr.onerror = function (err) {
      if (this.debug) {
        console.log(
          `Error making API call with payload: ${payload}
          Details: ${xmlHr.statusText}`
        );
      }
      self.state.isProcessing = false;
    };

    xmlHr.send(null);
  },

  prepareVideoIds: function () {
    let videoIds = [];
    this.state.isProcessing = true;
    let containers = this.get(this.selectors[this.state.route].initial);

    for (let c = 0; c < containers.length; c++) {
      let _this = containers[c];
      let videoId = this.pryVideoId(_this);

      /**
       * If the item is still waiting to receive data, skip
       */
      if (_this.className.indexOf('should-receive') > -1)
        continue;

      videoIds.push(videoId);
      _this.dataset.videoid = videoId;
      this.addClass(_this, 'should-receive');
    }

    this.fetchVideoInfo(videoIds);
  }
};

/**
 * Init
 */
YTES.init();

/**
 * We should re-init upon route updates
 */
chrome.runtime.onMessage.addListener(function (m, s, r) {
  if (m === 'route-updated')
    YTES.init();
});
