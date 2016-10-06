export default {
  namespace: 'asPaginator',

  currentPage: 1,
  itemsPerPage: 10,
  visibleNum: 5,
  resizeThrottle: 250,

  disabledClass: 'asPaginator_disable',
  activeClass: 'asPaginator_active',

  tpl() {
    return '<ul>{{first}}{{prev}}{{lists}}{{next}}{{last}}</ul>';
  },

  skin: null,
  components: {
    first: true,
    prev: true,
    next: true,
    last: true,
    lists: true
  },

  // callback function
  onInit: null,
  onReady: null,
  onChange: null // function(page) {}
};
