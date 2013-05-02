/*
 * paginator
 * https://github.com/amazingSurge/paginator
 *
 * Copyright (c) 2013 joeylin
 * Licensed under the MIT license.
 */

(function($) { 

    var Paginator = $.paginator = function(paginator,totalPages,options) {

        this.element = paginator;
        this.$element = $(paginator).empty();    

        this.currentPage = 1;
        this.totalPages = totalPages;
        this.initiallizd = false;

        // if didn't provide a totalPages argument , pop up a alert and return    
        if (typeof this.totalPages === 'undefined') {
            alert('you need define a totalPages value !');
            return;
        }    

        this.options = $.extend({},Paginator.defaults,options);
        this.namespace = this.options.namespace;
        this.components = $.extend(true,{},this.components);

        this.$element.addClass(this.namespace).addClass(this.options.skin);
        var self = this;

        $.extend(this, {
            init: function() {
                var
                    prev = '<li class="'+ self.namespace + '-prev' + '"><a href="#"></a></li>',
                    next = '<li class="'+ self.namespace + '-next' + '"><a href="#"></a></li>';

                self.$wrap = $('<ul class="'+ self.namespace + '-basic' +'"></ul>');
                self.$prev = $(prev).find('a').html(self.options.prevText).end().appendTo(self.$wrap);
                self.$next = $(next).find('a').html(self.options.nextText).end().appendTo(self.$wrap); 

                if (self.options.hideLists === false) {
                    self.components['lists'].init(self);
                }
                      
                self.$prev.on('click',$.proxy(self.prev,self));
                self.$next.on('click',$.proxy(self.next,self));

                self.$wrap.appendTo(self.$element);

                if (self.skins[self.options.skin]) {
                    $.each(self.skins[self.options.skin],function(i,v) {
                        self.components[v].init(self);
                    });
                } 

                self.show(self.currentPage);

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
        });
        self.init(); 
    };

    Paginator.prototype = {
        constructor: Paginator,
        skins: {
            'skin-spring': ['goTo','info'],
            'simple': ['info'],
        },
        components: {},
        // argument page number
        show: function(page) {
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
                console.log('page===1')
                this.$prev.addClass(this.namespace + '-disable');
            }

            // here change current page first, and then trigger 'change' event
            this.currentPage = page;
            this.$element.trigger('change',this);
            
            if(typeof this.options.onShow === 'function') {
                this.options.onShow.call(this,page);
            }
        },

        goTo: function(page) {
            this.show(page);
        },

        prev: function() {
            this.show(this.currentPage - 1);
            return false;
        },
        next: function() {
            console.log(this.currentPage);
            this.show(this.currentPage + 1);
            return false;
        },
        goFirst: function() {},
        goLast: function() {},
        getCurrentPage: function(){
            return this.currentPage;
        },
        getTotalPages: function(){
            return this.totalPages;
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

        prevText: 'prev',
        nextText: 'next',

        hideLists: false,

        namespace: 'paginator',

        numPerPage: 10,
        adjacentNum: 3,

        fix: false,
        displayPages: 5,

        skin: 'skin-2',

        // callback function
        onShow: null,

        //components config -> object
        lists: null, 
        goTo: null,
        info: null
    };

    Paginator.registerComponent = function(name,method) {
        Paginator.prototype.components[name] = method
    };

    Paginator.registerSkin = function(name,method) {
        Paginator.prototype.skins[name] = method
    };


    Paginator.registerComponent('lists',{
        defaults: {
            tpl: '<li><a href="#"></a></li>'
        },
        init: function(instance) {
            var opts = $.extend({},this.defaults,instance.options.lists);
                self = this;

            if (instance.options.fix === false) {
                instance.$wrap.delegate('li','click',function(e){
                    var page = $(e.target).parent().data('value');

                    if (page === undefined) {
                        console.log("wrong page value");
                        return
                    }

                    if (page === 'omit') {
                        return false;
                    }

                    if (page === '') {
                        return false;
                    }

                    instance.show(page);
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
                    instance.show(page);
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
                count = instance.options.displayPages,
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

            for (var i = current + 1,limit = i + count - 1 > instance.totalPages ? instance.totalPages : i+count-1; i<= limit;i++) {
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
            var opts = $.extend({},this.defaults,instance.options.goTo);

            $goTo = $(opts.tpl);
            $input = $goTo.find('input');
            $span = $goTo.find('span').text(opts.text);

            instance.$element.append($goTo);
            $span.on('click',function(){
                var page = $input.val();

                //here need to ensure the page a right input

                instance.show(page);
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
            var opts = $.extend({},this.defaults,instance.options.info);

            $info = $(opts.tpl);
            $current = $info.find('.paginator-current');
            $total = $info.find('.paginator-total').text(instance.totalPages);

            instance.$element.append($info).on('change.paginator',function(){
                $current.text(instance.currentPage);
            });
        }
    });


    // Collection method
    $.fn.paginator = function(totalPages,options) {
        
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
            return this.each(function() {
                if (!$.data(this, 'paginator')) {
                    $.data(this, 'paginator', new Paginator(this, totalPages,options));
                }
            });
        }
    };

}(jQuery));
