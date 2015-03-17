(function($) {
    "use strict";

    $.asPaginator.registerComponent('info', {
        defaults: {
            tpl: function() {
                return '<li class="' + this.namespace + '-info">' +
                    '<a href="javascript:void(0);">' +
                    '<span class="' + this.namespace + '-current">' +
                    '</span> / <span class="' + this.namespace + '-total"></span>' +
                    '</a>' +
                    '</li>';
            }
        },
        init: function(instance) {
            var opts = $.extend({}, this.defaults, instance.options.components.info);

            instance.itemsTpl = opts.tpl.call(instance);
        },
        bindEvents: function(instance) {
            var $info = instance.$element.find('.' + instance.namespace + '-info'),
                $current = $info.find('.' + instance.namespace + '-current');
            $info.find('.' + instance.namespace + '-total').text(instance.totalPages);

            $current.text(instance.currentPage);
            instance.$element.on('asPaginator::change', function() {
                $current.text(instance.currentPage);
            });
        }
    });
})(jQuery);
