/*
 * paginator
 * https://github.com/amazingSurge/paginator
 *
 * Copyright (c) 2013 joeylin
 * Licensed under the MIT license.
 */

(function($) { 

    var Paginator = $.paginator = function(paginator,totalItems,options) {

        this.element = paginator;
        this.$element = $(paginator).empty(); 

        this.options = $.extend({},Paginator.defaults,options);
        this.namespace = this.options.namespace;

        
        this.currentPage = this.options.currentPage || 1;
        this.itemsPerPage = this.options.itemsPerPage;
        this.totalItems = totalItems;
        this.totalPages = this.getTotalPages();

        if(this.isOutOfBounds()){
            this.currentPage = this.totalPages;
        }

        this.initiallizd = false;
        
        this.components = $.extend(true,{},this.components);

        this.$element.addClass(this.namespace).addClass(this.options.style);

        this.init(); 
    };

    Paginator.prototype = {
        constructor: Paginator,
        components: {},

        // private function
        // =================
        init: function() {
            var self = this;
                prev = '<li class="'+ self.namespace + '-prev' + '"><a href="#"></a></li>',
                next = '<li class="'+ self.namespace + '-next' + '"><a href="#"></a></li>';

            self.$wrap = $('<ul class="'+ self.namespace + '-basic' +'"></ul>');
            self.$prev = $(prev).find('a').html(self.options.prevText).end().appendTo(self.$wrap);
            self.$next = $(next).find('a').html(self.options.nextText).end().appendTo(self.$wrap); 

                  
            self.$prev.on('click',$.proxy(self.prev,self));
            self.$next.on('click',$.proxy(self.next,self));

            self.$wrap.appendTo(self.$element);

            $.each(this.options.components, function(key,value) {

                if (value === null || value === false) {
                    return false;
                }

                self.components[key].init(self);
            });

            self.goTo(self.currentPage);

            self.initiallizd = true;
        },
        calculate: function(current,total,adjacent) {
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
            }
        },

        // public function
        // =================

        // argument page number
        goTo: function(page) {
            var page = Math.max(1,Math.min(page,this.totalPages));

            // if true , dont relaod again    
            if (page === this.currentPage && this.initiallizd === true) {
                return false;
            }   

            this.$next.add(this.$prev).removeClass(this.namespace + '-disable'); 

            // when add class when go to the first one or the last one
            if (page === this.totalPages) {
                this.$next.addClass(this.namespace + '-disable');
            } 

            if (page === 1) {
                this.$prev.addClass(this.namespace + '-disable');
            }

            // here change current page first, and then trigger 'change' event
            this.currentPage = page;
            this.$element.trigger('change',this);
            
            if(typeof this.options.onChange === 'function') {
                this.options.onChange.call(this,page);
            }
        },
        prev: function() {
            if(this.hasPreviousPage()){
                this.goTo(this.getPreviousPage());
                return true;
            }
            
            return false;
        },
        next: function() {
            if(this.hasNextPage()){
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
        update: function(data, value){
            var changes = {};

            if(typeof data === "string"){
                changes[data] = value;
            } else {
                changes = data;
            }
            for(var option in changes){
                switch(option){
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
        // Determin whether page number somebody requeset greater than total pages
        isOutOfBounds: function(){
            return this.currentPage > this.totalPages;
        },
        getItemsPerPage: function(){
            return this.itemsPerPage;
        },
        getTotalItems: function() {
            return this.totalItems;
        },
        getTotalPages: function() {
            this.totalPages = Math.ceil( this.totalItems / this.itemsPerPage );
            this.lastPage = this.totalPages;
            return this.totalPages;
        },
        getCurrentPage: function(){
            return this.currentPage;
        },
        hasPreviousPage: function(){
            return this.currentPage > 1;
        },
        getPreviousPage: function(){
            if (this.hasPreviousPage()) {
                return this.currentPage - 1;
            } else {
                return false;
            }
        },
        hasNextPage: function(){
            return this.currentPage < this.totalPages;
        },
        getNextPage: function(){
            if (this.hasNextPage()) {
                return this.currentPage + 1;
            } else {
                return false;
            }
        }
    };

    Paginator.defaults = {
        namespace: 'paginator',

        prevText: 'prev',
        nextText: 'next',
        
        currentPage: 1,
        itemsPerPage: 10,
        adjacentNum: 3,

        style: 'simple',

        // callback function
        onChange: null,

        components: {
            lists: true
        }
    };

    Paginator.registerComponent = function(name,method) {
        Paginator.prototype.components[name] = method
    };

    Paginator.registerComponent('lists',{
        defaults: {
            fix: false,
            displayPages: 5,
            tpl: '<li><a href="#"></a></li>'
        },
        init: function(instance) {
            var opts = $.extend({}, this.defaults, instance.options.components.lists);
                self = this;

            this.opts = opts;

            if (opts.fix === false) {
                instance.$wrap.delegate('li', 'click', function(e){
                    var page = $(e.target).parent().data('value');

                    if (page === undefined) {
                        console.log("wrong page value or prev&&next");
                        return
                    }

                    if (page === 'omit') {
                        return false;
                    }

                    if (page === '') {
                        return false;
                    }

                    instance.goTo(page);
                });                  
                instance.$element.on('change',function() {
                    self.render(instance);               
                });
            } else {
                instance.$wrap.delegate('li','click',function(e) {
                    var page = $(e.target).parent().data('value');
                    if (page === undefined) {
                        console.log("wrong page value");
                        return
                    }
                     if (page === '') {
                        return false;
                    }
                    instance.goTo(page);
                });
                instance.$element.on('change',function() {
                    self.fixRender(instance);
                });
            }
        },
        render: function(instance) {
            var current = instance.currentPage,
                max = instance.totalPages,
                adjacent = instance.options.adjacentNum,
                omit = instance.calculate(current,max,adjacent),
                list = ''; 

            if(omit.left === 0) {
                for (var i = 1; i <= current -1; i++ ) {
                    list +=  '<li data-value="'+ i +'"><a href="#">'+ i +'</a></li>';
                }
                list += '<li class="paginator-active" data-value="'+ current +'"><a href="#">'+ current +'</a></li>';
            } else {
                for (var i=1; i <= 2; i++ ) {
                    list +=  '<li data-value="'+ i +'"><a href="#">'+ i +'</a></li>';
                }

                list += '<li class="paginator-omit" data-value="omit"><a href="#">...</a></li>';

                for (var i = current - adjacent; i <= current-1; i++ ) {
                    list +=  '<li data-value="'+ i +'"><a href="#">'+ i +'</a></li>';
                }

                list += '<li class="paginator-active" data-value="'+ current +'"><a href="#">'+ current +'</a></li>';
            }

            if (omit.right === 0) {
                for (var i = current+1; i <= max; i++ ) {
                    list +=  '<li data-value="'+ i +'"><a href="#">'+ i +'</a></li>';
                }
            } else {
                for (var i = current+1; i <= current + adjacent; i++ ) {
                    list +=  '<li data-value="'+ i +'"><a href="#">'+ i +'</a></li>';
                }

                list += '<li class="paginator-omit" data-value="omit"><a href="#">...</a></li>';              

                for (var i=max - 1; i <= max; i++ ) {
                    list +=  '<li data-value="'+ i +'"><a href="#">'+ i +'</a></li>';
                }
            }

            instance.$wrap.find('li').not('.'+ instance.namespace + '-prev').not('.'+ instance.namespace + '-next').remove();
            instance.$prev.after($(list));
        },
        fixRender: function(instance) {
            var current = instance.currentPage,
                overflow,
                count = this.opts.displayPages - 1,
                list = ''; 


            var array = instance.$wrap.find('li').removeClass('paginator-active');
            $.each(array,function(i,v) {

                if($(v).data('value') === current) {
                    $(v).addClass('paginator-active');
                    overflow = false;
                    return false;
                }
            });

            if (overflow === false) {
                return
            }


            list +=  '<li class="paginator-active" data-value="'+ current +'"><a href="#">'+ current +'</a></li>';

            for (var i = current + 1,limit = i + count - 1 > instance.totalPages ? instance.totalPages : i+count-1; i<= limit; i++) {
                list +=  '<li data-value="'+ i +'"><a href="#">'+ i +'</a></li>';
            }

            instance.$wrap.find('li').not('.'+ instance.namespace + '-prev').not('.'+ instance.namespace + '-next').remove();
            instance.$prev.after($(list));    
        }
    });

    Paginator.registerComponent('goTo',{
        defaults: {
            tpl: '<div class="paginator-goto"><input type="text" /><span></span></div>',
            text: 'Go'
        },
        init: function(instance) {
            var opts = $.extend({},this.defaults,instance.options.components.goTo);

            $goTo = $(opts.tpl);
            $input = $goTo.find('input');
            $span = $goTo.find('span').text(opts.text);

            instance.$element.append($goTo);
            $span.on('click',function(){
                var page = $input.val();

                //here need to ensure the page a right input

                instance.goTo(page);
            });
            // instance.$element.on('change.paginator',function() {
            //     $input.val('');
            // });
        }
    });

    Paginator.registerComponent('info',{
        defaults: {
            tpl: '<div class="paginator-info"><span class="paginator-current"></span>/<span class="paginator-total"></span></div>'
        },
        init: function(instance) {
            var opts = $.extend({},this.defaults,instance.options.components.info);

            $info = $(opts.tpl);
            $current = $info.find('.paginator-current');
            $total = $info.find('.paginator-total').text(instance.totalPages);

            instance.$element.append($info).on('change.paginator',function(){
                $current.text(instance.currentPage);
            });
        }
    });


    // Collection method
    $.fn.paginator = function(totalItems, options) {
        if (typeof options === 'string') {
            var method = options;
            var method_arguments = arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : undefined;

            return this.each(function() {
                var api = $.data(this, 'paginator');
                if (typeof api[method] === 'function') {
                    api[method].apply(api, method_arguments);
                }
            });
        } else {
            // if totalItems is not defined, the paginator is not initiallizd.
            if (typeof totalItems === 'undefined') {
                return this;
            }
            return this.each(function() {
                if (!$.data(this, 'paginator')) {
                    $.data(this, 'paginator', new Paginator(this, totalItems, options));
                }
            });
        }
    };

}(jQuery));
