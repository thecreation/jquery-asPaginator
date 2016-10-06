import $ from 'jquery';
import AsPaginator from './asPaginator';
import info from './info';

const NAMESPACE = 'asPaginator';
const OtherAsPaginator = $.fn.asPaginator;

const jQueryAsPaginator = function(totalItems, ...args) {
  if (!$.isNumeric(totalItems) && typeof totalItems === 'string') {
    const method = totalItems;

    if (/^_/.test(method)) {
      return false;
    } else if ((/^(get)/.test(method))) {
      const instance = this.first().data(NAMESPACE);
      if (instance && typeof instance[method] === 'function') {
        return instance[method](...args);
      }
    } else {
      return this.each(function() {
        const instance = $.data(this, NAMESPACE);
        if (instance && typeof instance[method] === 'function') {
          instance[method](...args);
        }
      });
    }
  }

  return this.each(function() {
    if (!$(this).data(NAMESPACE)) {
      $(this).data(NAMESPACE, new AsPaginator(this, totalItems, ...args));
    }
  });
};

$.fn.asPaginator = jQueryAsPaginator;

$.asPaginator = $.extend({
  setDefaults: AsPaginator.setDefaults,
  noConflict: function() {
    $.fn.asPaginator = OtherAsPaginator;
    return jQueryAsPaginator;
  }
}, info);
