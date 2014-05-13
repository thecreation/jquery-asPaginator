/*! asPaginator - v0.1.0 - 2014-05-13
* https://github.com/amazingSurge/jquery-asPaginator
* Copyright (c) 2014 amazingSurge; Licensed GPL */
(function($) {

    var AsPaginator = $.paginator = function(paginator, totalItems, options) {

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

        this._trigger('init');
        this.init();
    };

    AsPaginator.prototype = {
        constructor: AsPaginator,
        components: {},

        init: function() {
            var self = this,
                prev = '<li class="' + self.namespace + '-prev' + '"><a></a></li>',
                next = '<li class="' + self.namespace + '-next' + '"><a></a></li>';

            self.$wrap = $('<ul class="' + self.namespace + '-basic' + '"></ul>');
            self.$prev = $(prev).find('a').html(self.options.prevText).end().appendTo(self.$wrap);
            self.$next = $(next).find('a').html(self.options.nextText).end().appendTo(self.$wrap);

            self.$prev.on('click.asPaginator', $.proxy(self.prev, self));
            self.$next.on('click.asPaginator', $.proxy(self.next, self));

            self.$wrap.appendTo(self.$element);

            $.each(this.options.components, function(key, value) {
                if (value === null || value === false) {
                    return false;
                }

                self.components[key].init.call(self.components[key], self);
            });

            self.goTo(self.currentPage);

            self.initialized = true;
            this._trigger('ready');
        },
        calculate: function(current, total, adjacent) {
            var omitLeft = 1,
                omitRight = 1;

            if (current <= adjacent + 2) {
                omitLeft = 0;
            }

            if (current + adjacent + 2 >= total) {
                omitRight = 0;
            }

            return {
                left: omitLeft,
                right: omitRight
            };
        },
        _trigger: function(eventType) {
            this.$element.trigger('asPaginator::' + eventType, this);
            this.$element.trigger(eventType + '.asPaginator', this);
            eventType = eventType.replace(/\b\w+\b/g, function(word) {
                return word.substring(0, 1).toUpperCase() + word.substring(1);
            });
            var onFunction = 'on' + eventType;
            var method_arguments = arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : undefined;

            if (typeof this.options[onFunction] === 'function') {
                this.options[onFunction].apply(this, method_arguments);
            }
        },

        /*
            Public Method
         */

        goTo: function(page) {
            var page = Math.max(1, Math.min(page, this.totalPages));

            // if true , dont relaod again    
            if (page === this.currentPage && this.initialized === true) {
                return false;
            }

            this.$next.add(this.$prev).removeClass(this.namespace + '_disable');

            // when add class when go to the first one or the last one
            if (page === this.totalPages) {
                this.$next.addClass(this.namespace + '_disable');
            }

            if (page === 1) {
                this.$prev.addClass(this.namespace + '_disable');
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
        }
    };

    AsPaginator.defaults = {
        namespace: 'asPaginator',

        prevText: 'prev',
        nextText: 'next',

        currentPage: 1,
        itemsPerPage: 10,
        adjacentNum: 3,

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
            displayPages: 5,
            tpl: '<li><a href="#"></a></li>'
        },
        init: function(instance) {
            var opts = $.extend({}, this.defaults, instance.options.components.lists),
                self = this;

            this.opts = opts;

            if (opts.fix === false) {
                instance.$wrap.delegate('li', 'click', function(e) {
                    var page = $(e.target).parent().data('value');

                    if (page === undefined) {
                        //console.log("wrong page value or prev&&next");
                        return false;
                    }

                    if (page === 'omit') {
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
            } else {
                instance.$wrap.delegate('li', 'click', function(e) {
                    var page = $(e.target).parent().data('value');
                    if (page === undefined) {
                        //console.log("wrong page value");
                        return false;
                    }
                    if (page === '') {
                        return false;
                    }
                    instance.goTo(page);

                    return false;
                });
                self.fixRender(instance);
                instance.$element.on('asPaginator::change', function() {
                    self.fixRender(instance);
                });
            }
        },
        render: function(instance) {
            var current = instance.currentPage,
                max = instance.totalPages,
                adjacent = instance.options.adjacentNum,
                omit = instance.calculate(current, max, adjacent),
                list = '';

            if (omit.left === 0) {
                for (var i = 1; i <= current - 1; i++) {
                    list += '<li data-value="' + i + '"><a href="#">' + i + '</a></li>';
                }
                list += '<li class="' + instance.namespace + '_active" data-value="' + current + '"><a href="#">' + current + '</a></li>';
            } else {
                for (var i = 1; i <= 2; i++) {
                    list += '<li data-value="' + i + '"><a href="#">' + i + '</a></li>';
                }

                list += '<li class="' + instance.namespace + '_omit" data-value="omit"><a href="#">...</a></li>';

                for (var i = current - adjacent; i <= current - 1; i++) {
                    list += '<li data-value="' + i + '"><a href="#">' + i + '</a></li>';
                }

                list += '<li class="' + instance.namespace + '_active" data-value="' + current + '"><a href="#">' + current + '</a></li>';
            }

            if (omit.right === 0) {
                for (var i = current + 1; i <= max; i++) {
                    list += '<li data-value="' + i + '"><a href="#">' + i + '</a></li>';
                }
            } else {
                for (var i = current + 1; i <= current + adjacent; i++) {
                    list += '<li data-value="' + i + '"><a href="#">' + i + '</a></li>';
                }

                list += '<li class="' + instance.namespace + '_omit" data-value="omit"><a href="#">...</a></li>';

                for (var i = max - 1; i <= max; i++) {
                    list += '<li data-value="' + i + '"><a href="#">' + i + '</a></li>';
                }
            }

            instance.$wrap.find('li').not('.' + instance.namespace + '-prev').not('.' + instance.namespace + '-next').remove();
            instance.$prev.after($(list));
        },
        fixRender: function(instance) {
            var current = instance.currentPage,
                overflow,
                count = this.opts.displayPages - 1,
                list = '';


            var array = instance.$wrap.find('li').removeClass(instance.namespace + '_active');
            $.each(array, function(i, v) {

                if ($(v).data('value') === current) {
                    $(v).addClass(instance.namespace + '_active');
                    overflow = false;
                    return false;
                }
            });

            if (overflow === false) {
                return;
            }

            list += '<li class="' + instance.namespace + '_active" data-value="' + current + '"><a href="#">' + current + '</a></li>';

            for (var i = current + 1, limit = i + count - 1 > instance.totalPages ? instance.totalPages : i + count - 1; i <= limit; i++) {
                list += '<li data-value="' + i + '"><a href="#">' + i + '</a></li>';
            }

            instance.$wrap.find('li').not('.' + instance.namespace + '-prev').not('.' + instance.namespace + '-next').remove();
            instance.$prev.after($(list));
        }
    });

    AsPaginator.registerComponent('goTo', {
        defaults: {
            text: 'Go'
        },
        init: function(instance) {
            var opts = $.extend({}, this.defaults, instance.options.components.goTo),
                $goTo = $('<div class="' + instance.namespace + '-goto"><input type="text" /><span></span></div>'),
                $input = $goTo.find('input'),
                $span = $goTo.find('span').text(opts.text);

            instance.$element.append($goTo);
            $span.on('click', function() {
                var page = parseInt($input.val());
                instance.goTo(page);
            });
        }
    });

    AsPaginator.registerComponent('info', {
        init: function(instance) {
            var opts = $.extend({}, this.defaults, instance.options.components.info),
                $info = $('<div class="' + instance.namespace + '-info"><span class="' + instance.namespace + '-current"></span>/<span class="' + instance.namespace + '-total"></span></div>'),
                $current = $info.find('.' + instance.namespace + '_current'),
                $total = $info.find('.' + instance.namespace + '-total').text(instance.totalPages);

            $current.text(instance.currentPage);
            instance.$element.append($info).on('asPaginator::change', function() {
                $current.text(instance.currentPage);
            });
        }
    });

    // Collection method
    $.fn.asPaginator = function(totalItems, options) {
        if (typeof options === 'string') {
            var method = options;
            var method_arguments = arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : undefined;

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