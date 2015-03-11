/*
 * asPaginator
 * https://github.com/amazingSurge/asPaginator
 *
 * Copyright (c) 2014 amazingSurge
 * Licensed under the GPL license.
 */
(function($) {
    "use strict";

    var AsPaginator = function(paginator, totalItems, options) {

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
            disabled: this.namespace.disabledClass,
            active: this.namespace.activeClass
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

            self.$wrap = self.options.wrap ? $(self.options.wrap) : self.$element;
            self.$first = $(self.options.first).appendTo(self.$wrap);
            self.$prev = $(self.options.prev).appendTo(self.$wrap);
            self.$next = $(self.options.next).appendTo(self.$wrap);
            self.$last = $(self.options.last).appendTo(self.$wrap);

            self.$wrap.appendTo(self.$element);

            self.bindEvents();

            self.goTo(self.currentPage);

            self.initialized = true;

            // responsive
            if (this.options.responsive) {
                $(window).on('resize', this._throttle(function() {
                    self.resize.call(self);
                }, 250));
            }

            this._trigger('ready');
        },
        bindEvents: function() {
            var self = this;
            self.$first.on('click.asPaginator', $.proxy(self.goFirst, self));
            self.$prev.on('click.asPaginator', $.proxy(self.prev, self));
            self.$next.on('click.asPaginator', $.proxy(self.next, self));
            self.$last.on('click.asPaginator', $.proxy(self.goLast, self));

            $.each(this.options.components, function(key, value) {
                if (value === null || value === false) {
                    return false;
                }

                self.components[key].init.call(self.components[key], self);
            });
        },
        unbindEvents: function() {
            var self = this;
            self.$first.off('click.asPaginator');
            self.$prev.off('click.asPaginator');
            self.$next.off('click.asPaginator');
            self.$last.off('click.asPaginator');

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

            $.each(this.options.components, function(key, value) {
                if (value === null || value === false) {
                    return false;
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

            this.$next.add(this.$prev).add(this.$first).add(this.$last).removeClass(this.namespace + '_disable');

            // when add class when go to the first one or the last one
            if (page === this.totalPages) {
                this.$next.add(this.$last).addClass(this.namespace + '_disable');
            }

            if (page === 1) {
                this.$prev.add(this.$first).addClass(this.namespace + '_disable');
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

        wrap: '<ul class="asPaginator-basic"></ul>',
        first: '<li class="asPaginator-first"><a>First</a></li>',
        prev: '<li class="asPaginator-prev"><a>Prev</a></li>',
        next: '<li class="asPaginator-next"><a>Next</a></li>',
        last: '<li class="asPaginator-last"><a>Last</a></li>',

        currentPage: 1,
        itemsPerPage: 10,
        visibleNum: 5,
        responsive: false,

        disabledClass: 'disabled',
        activeClass: 'active',

        skin: null,
        components: {
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

    AsPaginator.registerComponent('lists', {
        defaults: {
            fix: false,
            tpl: function(i, classes) {
                if (classes === 'omit') {
                    return '<li class="class="asPaginator_omit" data-value="omit"><a href="#">...</a></li>';
                } else {
                    return '<li ' + (classes ? ('class="asPaginator_' + classes + '"') : '') + ' data-value="' + i + '"><a href="#">' + i + '</a></li>';
                }
            }
        },
        init: function(instance) {
            var opts = $.extend({}, this.defaults, instance.options.components.lists);

            this.opts = opts;

            this.bindEvents(instance);
        },
        bindEvents: function(instance) {
            var self = this;
            instance.$wrap.on('click', instance.$wrap.children(), function(e) {
                var page = $(e.target).parent().data('value') || $(e.target).data('value');

                if (page === undefined) {
                    //console.log("wrong page value or prev&&next");
                    return false;
                }

                if (page === 'omit' && self.opts.fix === false) {
                    return false;
                }

                if (page === '') {
                    return false;
                }

                instance.goTo(page);
            })

            if (self.opts.fix === false) {
                self.render(instance);
                instance.$element.on('asPaginator::change', function() {
                    self.render(instance);
                });
            } else {
                self.fixRender(instance);
                instance.$element.on('asPaginator::change', function() {
                    self.fixRender(instance);
                });
            }
        },
        unbindEvents: function(instance) {
            instance.$wrap.off('click', instance.$wrap.children());
        },
        resize: function(instance) {
            if (this.opts.fix === false) {
                this.render(instance);
            } else {
                this.fixRender(instance);
            }
        },
        getVisible: function(instance) {
            var width = instance.$element.width(),
                adjacent = 0;
            if (instance.options.responsive.visibleNum) {
                $.each(instance.options.responsive.visibleNum, function(i, v) {
                    if (width > v[0]) {
                        adjacent = v[1];
                    }
                });
            } else {
                adjacent = instance.options.visibleNum;
            }

            return adjacent;
        },
        render: function(instance) {
            var current = instance.currentPage,
                max = instance.totalPages,
                adjacent = this.getVisible(instance),
                omit = instance.calculate(current, max, adjacent),
                list = '',
                i;

            if (omit.left === 0) {
                for (i = 1; i <= current - 1; i++) {
                    list += this.opts.tpl(i);
                }
                list += this.opts.tpl(current, 'active');
            } else {
                for (i = 1; i <= 2; i++) {
                    list += this.opts.tpl(i);
                }

                list += this.opts.tpl(current, 'omit');

                for (i = current - adjacent + 1; i <= current - 1; i++) {
                    list += this.opts.tpl(i);
                }

                list += this.opts.tpl(current, 'active');
            }

            if (omit.right === 0) {
                for (i = current + 1; i <= max; i++) {
                    list += this.opts.tpl(i);
                }
            } else {
                for (i = current + 1; i <= current + adjacent - 1; i++) {
                    list += this.opts.tpl(i);
                }

                list += this.opts.tpl(current, 'omit');

                for (i = max - 1; i <= max; i++) {
                    list += this.opts.tpl(i);
                }
            }

            instance.$wrap.children().not('.' + instance.namespace + '-prev').not('.' + instance.namespace + '-next')
                .not('.' + instance.namespace + '-first').not('.' + instance.namespace + '-last')
                .remove();
            instance.$prev.after($(list));
        },
        fixRender: function(instance) {
            var current = instance.currentPage,
                overflow,
                visible = this.getVisible(instance),
                list = '';

            var array = instance.$wrap.children().removeClass(instance.namespace + '_active');
            $.each(array, function(i, v) {

                if ($(v).data('value') === current) {
                    $(v).addClass(instance.namespace + '_active');
                    overflow = false;
                    return false;
                }
            });

            if (overflow === false && this.visibleBefore === visible) {
                return;
            }

            this.visibleBefore = visible;

            var remainder = current >= visible ? current % visible : current;
            remainder = remainder === 0 ? visible : remainder;

            for (var k = 1; k < remainder; k++) {
                list += this.opts.tpl(current - remainder + k);
            }

            list += this.opts.tpl(current, 'active');

            for (var i = current + 1, limit = i + visible - remainder - 1 > instance.totalPages ? instance.totalPages : i + visible - remainder - 1; i <= limit; i++) {
                list += this.opts.tpl(i);
            }

            instance.$wrap.children().not('.' + instance.namespace + '-prev').not('.' + instance.namespace + '-next')
                .not('.' + instance.namespace + '-first').not('.' + instance.namespace + '-last')
                .remove();
            instance.$prev.after($(list));
        }
    });

    AsPaginator.registerComponent('goTo', {
        defaults: {
            wrap: '<div class="asPaginator-goto"></div>',
            input: '<input type="text" />',
            button: '<button type="submit">Go</button>'
        },
        init: function(instance) {
            var opts = $.extend({}, this.defaults, instance.options.components.goTo);
            this.$goTo = $(opts.wrap);
            this.$input = $(opts.input);
            this.$button = $(opts.button);

            this.$goTo.append(this.$input).append(this.$button);
            instance.$element.append(this.$goTo);
            this.bindEvents(instance);
        },
        bindEvents: function(instance) {
            var self = this;
            self.$button.on('click', function() {
                var page = parseInt(self.$input.val(), 10);
                page = page > 0 ? page : instance.currentPage;
                instance.goTo(page);
            });
        },
        unbindEvents: function() {
            this.$goTo.off('click', this.$button);
        }
    });

    AsPaginator.registerComponent('info', {
        defaults: {
            tpl: function() {
                return '<li class="asPaginator-info"><a href="javascript:void(0);"><span class="asPaginator-current"></span> / <span class="asPaginator-total"></span></a></li>';
            }
        },
        init: function(instance) {
            var opts = $.extend({}, this.defaults, instance.options.components.info),
                $info = $(opts.tpl()),
                $current = $info.find('.' + instance.namespace + '-current');

            $info.find('.' + instance.namespace + '-total').text(instance.totalPages);
            instance.$prev.after($info);
            $current.text(instance.currentPage);
            instance.$element.on('asPaginator::change', function() {
                $current.text(instance.currentPage);
            });
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
