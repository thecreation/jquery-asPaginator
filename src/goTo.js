// goTo

(function($) {
    "use strict";

    $.asPaginator.registerComponent('goTo', {
        defaults: {
            tpl: function() {
                return '<div class="' + this.namespace + '-goTo">' +
                    '<input type="text" class="' + this.namespace + '-input" />' +
                    '<button type="submit" class="' + this.namespace + '-submit">Go</button>' +
                    '</div>';
            }
        },
        init: function(instance) {
            var opts = $.extend({}, this.defaults, instance.options.components.goTo);
            instance.goToTpl = opts.tpl.call(instance);
        },
        bindEvents: function(instance) {
            var self = this;
            self.$goTo = instance.$element.find('.' + instance.namespace + '-goTo');
            self.$input = self.$goTo.find('.' + instance.namespace + '-input');
            self.$button = self.$goTo.find('.' + instance.namespace + '-submit');

            self.$button.on('click', function() {
                var page = parseInt(self.$input.val(), 10);
                page = page > 0 ? page : instance.currentPage;
                instance.goTo(page);
            });
        },
        unbindEvents: function() {
            this.$button.off('click');
        }
    });
})(jQuery);
