function View(ctx, canvas)
{
    this.ctx = ctx;
    this.canvas = canvas;
    
    this.contextMenuUp = false;
    this.contextMenuUserCallback = null;
    this.mouseMoveUserCallback = null;
    this.mouseDownUserCallback = null;
    this.mouseUpUserCallback = null;
    this.lastUpdate = 0;
    this.updateUserCallback = null;
    this.renderUserCallback = null;
    
    // context menu event handler
    this.mouseMoveEvent = function (e)
    {
        if (this.mouseMoveUserCallback)
            this.mouseMoveUserCallback(this, e);
    };
    
    // context menu event handler
    this.mouseUpEvent = function (e)
    {
        if (this.mouseUpUserCallback)
            this.mouseUpUserCallback(this, e);
    };
    
    // context menu event handler
    this.mouseDownEvent = function (e)
    {
        if (this.mouseDownUserCallback)
            this.mouseDownUserCallback(this, e);
    };
    
    // context menu event handler
    this.contextMenuEvent = function (e)
    {
        this.contextMenuUp = true;
        this.showContextMenu(e);
    };
    
    // hide context menu event handler
    this.hideContextMenu = function(e)
    {
        // ...
        $('setLsp').onclick = null;
        $('setUv').onclick = null;
        
        // hide the menu first to avoid an "up-then-over" visual effect
        var contextMenu = $('context_menu');
        if (contextMenu)
            contextMenu.style.display = 'none';
        
        return false;
    };
    
    // install context menu item
    this.installContextMenuItem = function(f, x, y)
    {
        var fWrapper = function (view, x, y, e)
        {
            var contextMenu = $('context_menu');
            if (contextMenu)
            {
                f.apply(view, e, x, y);
                
                contextMenu.style.display = 'none';
                view.contextMenuUp = false;
            }
        };
        
        return Utils.curry(fWrapper, null, this, x, y);
    };
    
    // show context menu event
    this.showContextMenu = function (e)
    {
        $('setLsp').onclick = this.installContextMenuItem(function () { this.contextMenuUserCallback("setLsp", this, e); }, e.x, e.y);
        $('setUv').onclick = this.installContextMenuItem(function () { this.contextMenuUserCallback("setUv", this, e); }, e.x, e.y);
        
        $('disable_menu').onclick = function (e) {
            var context_menu = $('context_menu');
            if (context_menu)
                context_menu.style.display = 'none';
        };
        
        $('disable_menu').href = "#";
        
        // document.body.scrollTop does not work in IE
        var scrollTop  = document.body.scrollTop  ? document.body.scrollTop  : document.documentElement.scrollTop;
        var scrollLeft = document.body.scrollLeft ? document.body.scrollLeft : document.documentElement.scrollLeft;
        
        // hide the menu first to avoid an "up-then-over" visual effect
        var context_menu = $('context_menu');
        if (context_menu)
        {
            context_menu.style.display = 'none';
            context_menu.style.left = e.clientX + scrollLeft + 'px';
            context_menu.style.top = e.clientY + scrollTop + 'px';
            context_menu.style.width = 180;
            context_menu.style.display = 'block';
        }
        
        e.returnValue = false;
        return false;
    };
    
    this.update = function (timestamp)
    {
        if (this.updateUserCallback)
            this.updateUserCallback(this);
        
        // update animation frame
        window.webkitRequestAnimationFrame(Utils.curry(this.update, this));
        
        // clear
        this.canvas.width = this.canvas.width;
        
        if (this.renderUserCallback)
            this.renderUserCallback(this);

        // last update
        this.lastUpdate = timestamp;
    };
    
    // request animation
    window.webkitRequestAnimationFrame(Utils.curry(this.update, this));
    
    return this;
}
