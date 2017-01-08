/**
 * 实现基于 hash 的简易路由
 * @param {[type]} config [description]
 */
function Router(config){
    this.routes = [];
    this.current = null;
    this.config = config;
}

/**
 * 添加路由
 * @param  {[type]} path    路由路径 /path/:id
 * @param  {[type]} tpl     路由对应渲染模板
 * @param  {[type]} handlers 路由处理
 * @return {[type]}         [description]
 */
Router.prototype.route = function(path, name, handlers){
    this.routes.push({
        path: this._compile(path),
        name: name,
        handlers: {
            enter: handlers.enter ? handlers.enter : function(){},
            leave: handlers.leave ? handlers.leave : function(){}
        }
    });

    return this;
};

/**
 * 启动路由
 * @return {[type]} [description]
 */
Router.prototype.start = function(){
    var that = this;

    this._match();

    this._addEvent(window, 'hashchange', function(){
        that._match();
    });

    return this;
};

/**
 * 路由跳转
 * @param  {[type]} path [description]
 * @return {[type]}      [description]
 */
Router.prototype.go = function(path){
    window.location.hash = path;

    return this;
};

/**
 * 事件绑定，兼容 ie
 * @param  {[type]} ele     [description]
 * @param  {[type]} type    [description]
 * @param  {[type]} handler [description]
 * @return {[type]}         [description]
 */
Router.prototype._addEvent = function(ele, type, handler){
    if(ele.addEventListener){
        ele.addEventListener(type, handler, false);
    } else if (ele.attachEvent){
        ele.attachEvent('on' + type, handler);
    } else {
        ele['on' + type] = handler;
    }
};

/**
 * 根据 hash 值匹配 pathVars 和 searchVars
 * @param  {[type]} hash [description]
 * @return {[type]}      [description]
 */
Router.prototype._match = function(){
    var routes = this.routes,
        hashArr = location.hash.replace(/^#/, '').split('?'),
        path = hashArr[0],
        pathParams = {},
        searchParams = {};

    for (var i = 0; i < routes.length; i++) {
        var match = path.match(routes[i].path.reg);

        if(match){
            var paramsName = routes[i].path.paramsName;

            for (var j = 0; j < paramsName.length; j++) {
                pathParams[paramsName[j]] = (match[j+1]);
            }

            // 解析 searchParams
            var searchReg = /(([^?&=]+)(?:=([^?&=]*))*)/g,
                searchMatch;

            while(hashArr[1] && (searchMatch = searchReg.exec(hashArr[1]))){
                searchParams[searchMatch[2]] = decodeURIComponent(searchMatch[3]);
            }

            if(this.current){
                this.prev = this.current;
                this.current.handlers.leave.call(this);
            }

            this.current = routes[i];
            this.current.pathParams = pathParams;
            this.current.searchParams = searchParams;
            this.current.handlers.enter.call(this, pathParams, searchParams);

            this.config.change && this.config.change(this);

            return;
        }
    }

    this.config.defaultHandler && this.config.defaultHandler();
};


Router.prototype._compile = function(path){
    var route = {
        original: path,
        reg: path,
        paramsName: []
    }; // 路由对象

    // 将/path/:id 转换为 /path/(\w+);
    var paramsReg = /:(\w+)/g;
    var paramsMatch = path.match(paramsReg);

    if(paramsMatch) {
        for (var i = 0; i < paramsMatch.length; i++) {
            route.paramsName.push(paramsMatch[i].replace(':', ''));
        }

        path = path.replace(/:(\w+)/g, '(\\w+)');
    }

    route.reg = new RegExp( '^' + path + '$');
    return route;
};

module.exports = Router;
