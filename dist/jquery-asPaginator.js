/*! jQuery asPaginator - v0.2.0 - 2015-03-17
* https://github.com/amazingSurge/jquery-asPaginator
* Copyright (c) 2015 amazingSurge; Licensed GPL */
(function($) {
    "use strict";

    var AsPaginator = $.asPaginator = function(paginator, totalItems, options) {

        this.element = paginator;
        this.$element = $(paginator).empty();

        this.options = $.extend({}, AsPaginator.defaults, options);
        this.namespace = this.options.namespace;

        this.currentPage = this.options.currentPage || 1;
        this.itemsPerPage = this.options.itemsPerPage;
        this.totalItems = totalItems;
        this.totalPages = this.getTotalPages();

        if (this.isOutOfBounds()) {
            this.currentPage = this.totalPages;
        }

        this.initialized = false;
        this.components = $.extend(true, {}, this.components);
        this.$element.addClass(this.namespace);

        if (this.options.skin) {
            this.$element.addClass(this.namespace + '_' + this.options.skin);
        }

        this.classes = {
            disabled: this.options.disabledClass,
            active: this.options.activeClass
        }

        this.disabled = false;

        this._trigger('init');
        this.init();
    };

    AsPaginator.prototype = {
        constructor: AsPaginator,
        components: {},

        init: function() {
            var self = this;

            self.visible = self.getVisible();
            self.firstTpl = '';
            self.prevTpl = '';
            self.nextTpl = '';
            self.lastTpl = '';
            self.itemsTpl = '';
            self.goToTpl = '';

            $.each(this.options.components, function(key, value) {
                if (value === null || value === false) {
                    return false;
                }

                self.components[key].init.call(self.components[key], self);
            });

            self.createHtml();
            self.bindEvents();

            self.goTo(self.currentPage);

            self.initialized = true;

            // responsive
            if (typeof this.options.visibleNum !== 'number') {
                $(window).on('resize', this._throttle(function() {
                    self.resize.call(self);
                }, this.options.resizeTime));
            }

            this._trigger('ready');
        },
        createHtml: function() {
            var self = this;
            self.contents = self.options.tpl();

            var length = self.contents.match(/\{\{([^\}]+)\}\}/g).length,
                components;

            for (var i = 0; i < length; i++) {
                components = self.contents.match(/\{\{([^\}]+)\}\}/);

                switch (components[1]) {
                    case 'namespace':
                        self.contents = self.contents.replace(components[0], self.namespace);
                        break;
                    case "first":
                        self.contents = self.contents.replace(components[0], self.firstTpl);
                        break;
                    case "prev":
                        self.contents = self.contents.replace(components[0], self.prevTpl);
                        break;
                    case "next":
                        self.contents = self.contents.replace(components[0], self.nextTpl);
                        break;
                    case "last":
                        self.contents = self.contents.replace(components[0], self.lastTpl);
                        break;
                    case 'lists':
                        self.contents = self.contents.replace(components[0], self.itemsTpl);
                        break;
                    case 'goTo':
                        self.contents = self.contents.replace(components[0], self.goToTpl);
                        break;
                }
            }

            self.$element.append($(self.contents));
        },
        bindEvents: function() {
            var self = this;

            $.each(this.options.components, function(key, value) {
                if (value === null || value === false) {
                    return false;
                }

                self.components[key].bindEvents.call(self.components[key], self);
            });
        },
        unbindEvents: function() {
            var self = this;

            $.each(this.options.components, function(key, value) {
                if (value === null || value === false) {
                    return false;
                }

                self.components[key].unbindEvents.call(self.components[key], self);
            });
        },
        resize: function() {
            var self = this;
            self._trigger('resize');
            self.goTo(self.currentPage);
            self.visible = self.getVisible();

            $.each(this.options.components, function(key, value) {
                if (value === null || value === false) {
                    return false;
                }

                if (typeof self.components[key].resize === 'undefined') {
                    return;
                }

                self.components[key].resize.call(self.components[key], self);
            });
        },
        _throttle: function(func, wait) {
            var _now = Date.now || function() {
                return new Date().getTime();
            };
            var context, args, result;
            var timeout = null;
            var previous = 0;
            var later = function() {
                previous = _now();
                timeout = null;
                result = func.apply(context, args);
                context = args = null;
            };
            return function() {
                var now = _now();
                var remaining = wait - (now - previous);
                context = this;
                args = arguments;
                if (remaining <= 0) {
                    clearTimeout(timeout);
                    timeout = null;
                    previous = now;
                    result = func.apply(context, args);
                    context = args = null;
                } else if (!timeout) {
                    timeout = setTimeout(later, remaining);
                }
                return result;
            };
        },
        getVisible: function() {
            var width = $('body, html').width(),
                adjacent = 0;
            if (typeof this.options.visibleNum !== 'number') {
                $.each(this.options.visibleNum, function(i, v) {
                    if (width > i) {
                        adjacent = v;
                    }
                });
            } else {
                adjacent = this.options.visibleNum;
            }

            return adjacent;
        },
        calculate: function(current, total, visible) {
            var omitLeft = 1,
                omitRight = 1;

            if (current <= visible + 2) {
                omitLeft = 0;
            }

            if (current + visible + 1 >= total) {
                omitRight = 0;
            }

            return {
                left: omitLeft,
                right: omitRight
            };
        },
        _trigger: function(eventType) {
            var method_arguments = Array.prototype.slice.call(arguments, 1),
                data = [this].concat(method_arguments);

            // event
            this.$element.trigger('asPaginator::' + eventType, data);

            // callback
            eventType = eventType.replace(/\b\w+\b/g, function(word) {
                return word.substring(0, 1).toUpperCase() + word.substring(1);
            });
            var onFunction = 'on' + eventType;
            if (typeof this.options[onFunction] === 'function') {
                this.options[onFunction].apply(this, method_arguments);
            }
        },
        goTo: function(page) {
            page = Math.max(1, Math.min(page, this.totalPages));

            // if true , dont relaod again    
            if (page === this.currentPage && this.initialized === true) {
                return false;
            }

            this.$element.find('.' + this.classes.disabled).removeClass(this.classes.disabled);

            // when add class when go to the first one or the last one
            if (page === this.totalPages) {
                this.$element.find('.' + this.namespace + '-next').addClass(this.classes.disabled);
                this.$element.find('.' + this.namespace + '-last').addClass(this.classes.disabled);
            }

            if (page === 1) {
                this.$element.find('.' + this.namespace + '-prev').addClass(this.classes.disabled);
                this.$element.find('.' + this.namespace + '-first').addClass(this.classes.disabled);
            }

            // here change current page first, and then trigger 'change' event
            this.currentPage = page;

            if (this.initialized) {
                this._trigger('change', page);
            }
        },
        prev: function() {
            if (this.hasPreviousPage()) {
                this.goTo(this.getPreviousPage());
                return true;
            }

            return false;
        },
        next: function() {
            if (this.hasNextPage()) {
                this.goTo(this.getNextPage());
                return true;
            }

            return false;
        },
        goFirst: function() {
            return this.goTo(1);
        },
        goLast: function() {
            return this.goTo(this.totalPages);
        },
        // update({totalItems: 10, itemsPerPage: 5, currentPage:3});
        // update('totalPage', 10);
        update: function(data, value) {
            var changes = {};

            if (typeof data === "string") {
                changes[data] = value;
            } else {
                changes = data;
            }
            for (var option in changes) {
                switch (option) {
                    case 'totalItems':
                        this.totalItems = changes[option];
                        break;
                    case 'itemsPerPage':
                        this.itemsPerPage = changes[option];
                        break;
                    case 'currentPage':
                        this.currentPage = changes[option];
                        break;
                }
            }

            this.totalPages = this.totalPages();

            // wait to do           
        },
        isOutOfBounds: function() {
            return this.currentPage > this.totalPages;
        },
        getItemsPerPage: function() {
            return this.itemsPerPage;
        },
        getTotalItems: function() {
            return this.totalItems;
        },
        getTotalPages: function() {
            this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
            this.lastPage = this.totalPages;
            return this.totalPages;
        },
        getCurrentPage: function() {
            return this.currentPage;
        },
        hasPreviousPage: function() {
            return this.currentPage > 1;
        },
        getPreviousPage: function() {
            if (this.hasPreviousPage()) {
                return this.currentPage - 1;
            } else {
                return false;
            }
        },
        hasNextPage: function() {
            return this.currentPage < this.totalPages;
        },
        getNextPage: function() {
            if (this.hasNextPage()) {
                return this.currentPage + 1;
            } else {
                return false;
            }
        },
        enable: function() {
            if (this.disabled) {
                this.disabled = false;

                this.$element.removeClass(this.classes.disabled);

                this.bindEvents();
            }
        },

        disable: function() {
            if (this.disabled !== true) {
                this.disabled = true;

                this.$element.addClass(this.classes.disabled);

                this.unbindEvents();
            }
        },

        destory: function() {
            this.$element.removeClass(this.classes.disabled);
            this.unbindEvents();
            this.$element.data('asPaginator', null);
            this._trigger('destory');
        }
    };

    AsPaginator.defaults = {
        namespace: 'asPaginator',

        currentPage: 1,
        itemsPerPage: 10,
        visibleNum: 5,
        resizeTime: 250,

        disabledClass: 'asPaginator_disable',
        activeClass: 'asPaginator_active',

        tpl: function() {
            return '<ul>{{first}}{{prev}}{{lists}}{{next}}{{last}}</ul>{{goTo}}';
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

    AsPaginator.registerComponent = function(name, method) {
        AsPaginator.prototype.components[name] = method;
    };

    AsPaginator.registerComponent('prev', {
        defaults: {
            tpl: function() {
                return '<li class="' + this.namespace + '-prev"><a>Prev</a></li>';
            }
        },
        init: function(instance) {
            var opts = $.extend({}, this.defaults, instance.options.components.prev);

            instance.prevTpl = opts.tpl.call(instance);
        },
        bindEvents: function(instance) {
            this.$prev = instance.$element.find('.' + instance.namespace + '-prev');
            this.$prev.on('click.asPaginator', $.proxy(instance.prev, instance));
        },
        unbindEvents: function() {
            this.$prev.off('click.asPaginator');
        }
    })

    AsPaginator.registerComponent('next', {
        defaults: {
            tpl: function() {
                return '<li class="' + this.namespace + '-next"><a>Next</a></li>';
            }
        },
        init: function(instance) {
            var opts = $.extend({}, this.defaults, instance.options.components.next);

            instance.nextTpl = opts.tpl.call(instance);
        },
        bindEvents: function(instance) {
            this.$next = instance.$element.find('.' + instance.namespace + '-next');
            this.$next.on('click.asPaginator', $.proxy(instance.next, instance));
        },
        unbindEvents: function() {
            this.$next.off('click.asPaginator');
        }
    });

    AsPaginator.registerComponent('first', {
        defaults: {
            tpl: function() {
                return '<li class="' + this.namespace + '-first"><a>First</a></li>';
            }
        },
        init: function(instance) {
            var opts = $.extend({}, this.defaults, instance.options.components.first);

            instance.firstTpl = opts.tpl.call(instance);
        },
        bindEvents: function(instance) {
            this.$first = instance.$element.find('.' + instance.namespace + '-first');
            this.$first.on('click.asPaginator', $.proxy(instance.goFirst, instance));
        },
        unbindEvents: function() {
            this.$first.off('click.asPaginator');
        }
    });

    AsPaginator.registerComponent('last', {
        defaults: {
            tpl: function() {
                return '<li class="' + this.namespace + '-last"><a>Last</a></li>';
            }
        },
        init: function(instance) {
            var opts = $.extend({}, this.defaults, instance.options.components.last);

            instance.lastTpl = opts.tpl.call(instance);
        },
        bindEvents: function(instance) {
            this.$last = instance.$element.find('.' + instance.namespace + '-last');
            this.$last.on('click.asPaginator', $.proxy(instance.goLast, instance));
        },
        unbindEvents: function() {
            this.$last.off('click.asPaginator');
        }
    });

    AsPaginator.registerComponent('lists', {
        defaults: {
            tpl: function() {
                var lists = '',
                    remainder = this.currentPage >= this.visible ? this.currentPage % this.visible : this.currentPage;
                remainder = remainder === 0 ? this.visible : remainder;
                for (var k = 1; k < remainder; k++) {
                    lists += '<li class="' + this.namespace + '-items" data-value="' + (this.currentPage - remainder + k) + '"><a href="#">' + (this.currentPage - remainder + k) + '</a></li>';
                }
                lists += '<li class="' + this.namespace + '-items ' + this.classes.active + '" data-value="' + this.currentPage + '"><a href="#">' + this.currentPage + '</a></li>';
                for (var i = this.currentPage + 1, limit = i + this.visible - remainder - 1 > this.totalPages ? this.totalPages : i + this.visible - remainder - 1; i <= limit; i++) {
                    lists += '<li class="' + this.namespace + '-items" data-value="' + i + '"><a href="#">' + i + '</a></li>';
                }

                return lists;
            }
        },
        init: function(instance) {
            var opts = $.extend({}, this.defaults, instance.options.components.lists);

            this.opts = opts;

            instance.itemsTpl = this.opts.tpl.call(instance);
        },
        bindEvents: function(instance) {
            var self = this;
            this.$items = instance.$element.find('.' + instance.namespace + '-items');
            instance.$element.on('click', this.$items, function(e) {
                var page = $(e.target).parent().data('value') || $(e.target).data('value');

                if (page === undefined) {
                    //console.log("wrong page value or prev&&next");
                    return false;
                }

                if (page === '') {
                    return false;
                }

                instance.goTo(page);
            });

            self.render(instance);
            instance.$element.on('asPaginator::change', function() {
                self.render(instance);
            });
        },
        unbindEvents: function(instance) {
            instance.$element.off('click', this.$items);
        },
        resize: function(instance) {
            this.render(instance);
        },
        render: function(instance) {
            var current = instance.currentPage,
                overflow,
                self = this;

            var array = this.$items.removeClass(instance.classes.active);
            $.each(array, function(i, v) {

                if ($(v).data('value') === current) {
                    $(v).addClass(instance.classes.active);
                    overflow = false;
                    return false;
                }
            });

            if (overflow === false && this.visibleBefore === instance.visible) {
                return;
            }

            this.visibleBefore = instance.visible;

            $.each(array, function(i, v) {
                if (i === 0) {
                    $(v).replaceWith(self.opts.tpl.call(instance));
                } else {
                    $(v).remove();
                }
            });
            this.$items = instance.$element.find('.' + instance.namespace + '-items');
        }
    });

    // Collection method
    $.fn.asPaginator = function(totalItems, options) {
        if (typeof options === 'string') {
            var method = options;
            var method_arguments = Array.prototype.slice.call(arguments, 1);

            return this.each(function() {
                var api = $.data(this, 'asPaginator');
                if (typeof api[method] === 'function') {
                    api[method].apply(api, method_arguments);
                }
            });
        } else {
            // if totalItems is not defined, the asPaginator is not initialized.
            if (typeof totalItems === 'undefined') {
                return this;
            }
            return this.each(function() {
                if (!$.data(this, 'asPaginator')) {
                    $.data(this, 'asPaginator', new AsPaginator(this, totalItems, options));
                }
            });
        }
    };

}(jQuery));

// altLists

(function($) {
    "use strict";

    $.asPaginator.registerComponent('altLists', {
        defaults: {
            tpl: function() {
                var lists = '',
                    max = this.totalPages,
                    current = this.currentPage,
                    omit = this.calculate(current, max, this.visible),
                    self = this,
                    i;
                var item = function(i, classes) {
                    if (classes === 'active') {
                        return '<li class="' + self.namespace + '-items ' + self.classes.active + '" data-value="' + i + '"><a href="#">' + i + '</a></li>';
                    } else if (classes === 'omit') {
                        return '<li class="' + self.namespace + '-items ' + self.namespace + '_ellipsis" data-value="ellipsis"><a href="#">...</a></li>';
                    } else {
                        return '<li class="' + self.namespace + '-items" data-value="' + i + '"><a href="#">' + i + '</a></li>';
                    }
                }

                if (omit.left === 0) {
                    for (i = 1; i <= current - 1; i++) {
                        lists += item(i);
                    }
                    lists += item(current, 'active');
                } else {
                    for (i = 1; i <= 2; i++) {
                        lists += item(i);
                    }

                    lists += item(current, 'omit');

                    for (i = current - this.visible + 1; i <= current - 1; i++) {
                        lists += item(i);
                    }

                    lists += item(current, 'active');
                }

                if (omit.right === 0) {
                    for (i = current + 1; i <= max; i++) {
                        lists += item(i);
                    }
                } else {
                    for (i = current + 1; i <= current + this.visible - 1; i++) {
                        lists += item(i);
                    }

                    lists += item(current, 'omit');

                    for (i = max - 1; i <= max; i++) {
                        lists += item(i);
                    }
                }

                return lists;
            }
        },
        init: function(instance) {
            var opts = $.extend({}, this.defaults, instance.options.components.altLists);

            this.opts = opts;

            instance.itemsTpl = this.opts.tpl.call(instance);
        },
        bindEvents: function(instance) {
            var self = this;
            this.$items = instance.$element.find('.' + instance.namespace + '-items');
            instance.$element.on('click', this.$items, function(e) {
                var page = $(e.target).parent().data('value') || $(e.target).data('value');

                if (page === undefined) {
                    //console.log("wrong page value or prev&&next");
                    return false;
                }

                if (page === 'ellipsis') {
                    return false;
                }

                if (page === '') {
                    return false;
                }

                instance.goTo(page);
            })

            self.render(instance);
            instance.$element.on('asPaginator::change', function() {
                self.render(instance);
            });
        },
        unbindEvents: function(instance) {
            instance.$wrap.off('click', this.$items);
        },
        resize: function(instance) {
            this.render(instance);
        },
        render: function(instance) {
            var self = this,
                array = this.$items.removeClass(instance.classes.active);
            $.each(array, function(i, v) {
                if (i === 0) {
                    $(v).replaceWith(self.opts.tpl.call(instance));
                } else {
                    $(v).remove();
                }
            });
            this.$items = instance.$element.find('.' + instance.namespace + '-items');
        }
    });
})(jQuery);
