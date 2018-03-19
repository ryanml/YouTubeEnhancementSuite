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

  selectors: {
    metadata: '#metadata',
    adorned: '.ytes-adorned',
    initial: '#contents ytd-video-renderer:not(.ytes-adorned)'
  },

  language: {
    placeholder: 'YTES Utilities Placeholder'
  },

  init: function () {
    this.addInfoBars();
    this.hasBuilt = true;
  },

  getElements: function (selector, root=false) {
    let parent = root || document;
    let results = parent.querySelectorAll(selector);

    if (results.length === 1) {
      return results[0];
    } else {
      return results
    }
  },

  addClass: function (element, _class) {
    element.className += ` ${_class}`;
  },

  cacheVideoResults: function (videoSet) {
    let nodeArray = Array.from(videoSet);
    this.cache.videoResults = nodeArray;
  },

  addInfo: function (preview, info) {
    let infoBlock = document.createElement('div');
    infoBlock.className = 'style-scope';
    infoBlock.innerHTML = `${this.language.placeholder} || ${info.test}`;
    preview.appendChild(infoBlock);
  },

  addInfoBars: function () {
    let containers = this.hasBuilt ?
    this.getElements(this.selectors.adorned) :
    this.getElements(this.selectors.initial);

    for (let c = 0; c < containers.length; c++) {
      let _this = containers[c];
      let metaBlock = this.getElements(this.selectors.metadata, _this);
      let videoInfo = {'test': Math.floor(Math.random() * 10)}

      this.addInfo(metaBlock, videoInfo);
      this.addClass(_this, 'ytes-adorned');
    }
  }
};

YTES.init();