ejs=function(){function require(p){if("fs"==p)return{};if("path"==p)return{};var path=require.resolve(p),mod=require.modules[path];if(!mod)throw new Error('failed to require "'+p+'"');if(!mod.exports){mod.exports={};mod.call(mod.exports,mod,mod.exports,require.relative(path))}return mod.exports}require.modules={};require.resolve=function(path){var orig=path,reg=path+".js",index=path+"/index.js";return require.modules[reg]&&reg||require.modules[index]&&index||orig};require.register=function(path,fn){require.modules[path]=fn};require.relative=function(parent){return function(p){if("."!=p.substr(0,1))return require(p);var path=parent.split("/"),segs=p.split("/");path.pop();for(var i=0;i<segs.length;i++){var seg=segs[i];if(".."==seg)path.pop();else if("."!=seg)path.push(seg)}return require(path.join("/"))}};require.register("ejs.js",function(module,exports,require){var utils=require("./utils"),path=require("path"),dirname=path.dirname,extname=path.extname,join=path.join,fs=require("fs"),read=fs.readFileSync;var filters=exports.filters=require("./filters");var cache={};exports.clearCache=function(){cache={}};function filtered(js){return js.substr(1).split("|").reduce(function(js,filter){var parts=filter.split(":"),name=parts.shift(),args=parts.join(":")||"";if(args)args=", "+args;return"filters."+name+"("+js+args+")"})}function rethrow(err,str,filename,lineno){var lines=str.split("\n"),start=Math.max(lineno-3,0),end=Math.min(lines.length,lineno+3);var context=lines.slice(start,end).map(function(line,i){var curr=i+start+1;return(curr==lineno?" >> ":"    ")+curr+"| "+line}).join("\n");err.path=filename;err.message=(filename||"ejs")+":"+lineno+"\n"+context+"\n\n"+err.message;throw err}var parse=exports.parse=function(str,options){var options=options||{},open=options.open||exports.open||"<%",close=options.close||exports.close||"%>",filename=options.filename,compileDebug=options.compileDebug!==false,buf="";buf+="var buf = [];";if(false!==options._with)buf+="\nwith (locals || {}) { (function(){ ";buf+="\n buf.push('";var lineno=1;var consumeEOL=false;for(var i=0,len=str.length;i<len;++i){var stri=str[i];if(str.slice(i,open.length+i)==open){i+=open.length;var prefix,postfix,line=(compileDebug?"__stack.lineno=":"")+lineno;switch(str[i]){case"=":prefix="', escape(("+line+", ";postfix=")), '";++i;break;case"-":prefix="', ("+line+", ";postfix="), '";++i;break;default:prefix="');"+line+";";postfix="; buf.push('"}var end=str.indexOf(close,i);if(end<0){throw new Error('Could not find matching close tag "'+close+'".')}var js=str.substring(i,end),start=i,include=null,n=0;if("-"==js[js.length-1]){js=js.substring(0,js.length-2);consumeEOL=true}if(0==js.trim().indexOf("include")){var name=js.trim().slice(7).trim();if(!filename)throw new Error("filename option is required for includes");var path=resolveInclude(name,filename);include=read(path,"utf8");include=exports.parse(include,{filename:path,_with:false,open:open,close:close,compileDebug:compileDebug});buf+="' + (function(){"+include+"})() + '";js=""}while(~(n=js.indexOf("\n",n)))n++,lineno++;if(js.substr(0,1)==":")js=filtered(js);if(js){if(js.lastIndexOf("//")>js.lastIndexOf("\n"))js+="\n";buf+=prefix;buf+=js;buf+=postfix}i+=end-start+close.length-1}else if(stri=="\\"){buf+="\\\\"}else if(stri=="'"){buf+="\\'"}else if(stri=="\r"){}else if(stri=="\n"){if(consumeEOL){consumeEOL=false}else{buf+="\\n";lineno++}}else{buf+=stri}}if(false!==options._with)buf+="'); })();\n} \nreturn buf.join('');";else buf+="');\nreturn buf.join('');";return buf};var compile=exports.compile=function(str,options){options=options||{};var escape=options.escape||utils.escape;var input=JSON.stringify(str),compileDebug=options.compileDebug!==false,client=options.client,filename=options.filename?JSON.stringify(options.filename):"undefined";if(compileDebug){str=["var __stack = { lineno: 1, input: "+input+", filename: "+filename+" };",rethrow.toString(),"try {",exports.parse(str,options),"} catch (err) {","  rethrow(err, __stack.input, __stack.filename, __stack.lineno);","}"].join("\n")}else{str=exports.parse(str,options)}if(options.debug)console.log(str);if(client)str="escape = escape || "+escape.toString()+";\n"+str;try{var fn=new Function("locals, filters, escape, rethrow",str)}catch(err){if("SyntaxError"==err.name){err.message+=options.filename?" in "+filename:" while compiling ejs"}throw err}if(client)return fn;return function(locals){return fn.call(this,locals,filters,escape,rethrow)}};exports.render=function(str,options){var fn,options=options||{};if(options.cache){if(options.filename){fn=cache[options.filename]||(cache[options.filename]=compile(str,options))}else{throw new Error('"cache" option requires "filename".')}}else{fn=compile(str,options)}options.__proto__=options.locals;return fn.call(options.scope,options)};exports.renderFile=function(path,options,fn){var key=path+":string";if("function"==typeof options){fn=options,options={}}options.filename=path;var str;try{str=options.cache?cache[key]||(cache[key]=read(path,"utf8")):read(path,"utf8")}catch(err){fn(err);return}fn(null,exports.render(str,options))};function resolveInclude(name,filename){var path=join(dirname(filename),name);var ext=extname(name);if(!ext)path+=".ejs";return path}exports.__express=exports.renderFile;if(require.extensions){require.extensions[".ejs"]=function(module,filename){filename=filename||module.filename;var options={filename:filename,client:true},template=fs.readFileSync(filename).toString(),fn=compile(template,options);module._compile("module.exports = "+fn.toString()+";",filename)}}else if(require.registerExtension){require.registerExtension(".ejs",function(src){return compile(src,{})})}});require.register("filters.js",function(module,exports,require){exports.first=function(obj){return obj[0]};exports.last=function(obj){return obj[obj.length-1]};exports.capitalize=function(str){str=String(str);return str[0].toUpperCase()+str.substr(1,str.length)};exports.downcase=function(str){return String(str).toLowerCase()};exports.upcase=function(str){return String(str).toUpperCase()};exports.sort=function(obj){return Object.create(obj).sort()};exports.sort_by=function(obj,prop){return Object.create(obj).sort(function(a,b){a=a[prop],b=b[prop];if(a>b)return 1;if(a<b)return-1;return 0})};exports.size=exports.length=function(obj){return obj.length};exports.plus=function(a,b){return Number(a)+Number(b)};exports.minus=function(a,b){return Number(a)-Number(b)};exports.times=function(a,b){return Number(a)*Number(b)};exports.divided_by=function(a,b){return Number(a)/Number(b)};exports.join=function(obj,str){return obj.join(str||", ")};exports.truncate=function(str,len,append){str=String(str);if(str.length>len){str=str.slice(0,len);if(append)str+=append}return str};exports.truncate_words=function(str,n){var str=String(str),words=str.split(/ +/);return words.slice(0,n).join(" ")};exports.replace=function(str,pattern,substitution){return String(str).replace(pattern,substitution||"")};exports.prepend=function(obj,val){return Array.isArray(obj)?[val].concat(obj):val+obj};exports.append=function(obj,val){return Array.isArray(obj)?obj.concat(val):obj+val};exports.map=function(arr,prop){return arr.map(function(obj){return obj[prop]})};exports.reverse=function(obj){return Array.isArray(obj)?obj.reverse():String(obj).split("").reverse().join("")};exports.get=function(obj,prop){return obj[prop]};exports.json=function(obj){return JSON.stringify(obj)}});require.register("utils.js",function(module,exports,require){exports.escape=function(html){return String(html).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")}});return require("ejs")}();
/*! layer-v2.3 弹层组件 License LGPL  http://layer.layui.com/ By 贤心 */
;!function (a, b) {
    "use strict";
    var c, d, e = {
        getPath: function () {
            var a = document.scripts, b = a[a.length - 1], c = b.src;
            if (!b.getAttribute("merge"))return c.substring(0, c.lastIndexOf("/") + 1)
        }(),
        enter: function (a) {
            13 === a.keyCode && a.preventDefault()
        },
        config: {},
        end: {},
        btn: ["&#x786E;&#x5B9A;", "&#x53D6;&#x6D88;"],
        type: ["dialog", "page", "iframe", "loading", "tips"]
    }, f = {
        v: "2.3", ie6: !!a.ActiveXObject && !a.XMLHttpRequest, index: 0, path: e.getPath, config: function (a, b) {
            var d = 0;
            return a = a || {}, f.cache = e.config = c.extend(e.config, a), f.path = e.config.path || f.path, "string" == typeof a.extend && (a.extend = [a.extend]), f.use("skin/layer.css", a.extend && a.extend.length > 0 ? function g() {
                var c = a.extend;
                f.use(c[c[d] ? d : d - 1], d < c.length ? function () {
                    return ++d, g
                }() : b)
            }() : b), this
        }, use: function (a, b, d) {
            var e = c("head")[0], a = a.replace(/\s/g, ""), g = /\.css$/.test(a), h = document.createElement(g ? "link" : "script"), i = "layui_layer_" + a.replace(/\.|\//g, "");
            return f.path ? (g && (h.rel = "stylesheet"), h[g ? "href" : "src"] = /^http:\/\//.test(a) ? a : f.path + a, h.id = i, c("#" + i)[0] || e.appendChild(h), function j() {
                (g ? 1989 === parseInt(c("#" + i).css("width")) : f[d || i]) ? function () {
                    b && b();
                    try {
                        g || e.removeChild(h)
                    } catch (a) {
                    }
                }() : setTimeout(j, 100)
            }(), this) : void 0
        }, ready: function (a, b) {
            var d = "function" == typeof a;
            return d && (b = a), f.config(c.extend(e.config, function () {
                return d ? {} : {path: a}
            }()), b), this
        }, alert: function (a, b, d) {
            var e = "function" == typeof b;
            return e && (d = b), f.open(c.extend({content: a, yes: d}, e ? {} : b))
        }, confirm: function (a, b, d, g) {
            var h = "function" == typeof b;
            return h && (g = d, d = b), f.open(c.extend({content: a, btn: e.btn, yes: d, btn2: g}, h ? {} : b))
        }, msg: function (a, d, g) {
            var i = "function" == typeof d, j = e.config.skin, k = (j ? j + " " + j + "-msg" : "") || "layui-layer-msg", l = h.anim.length - 1;
            return i && (g = d), f.open(c.extend({
                content: a,
                time: 3e3,
                shade: !1,
                skin: k,
                title: !1,
                closeBtn: !1,
                btn: !1,
                end: g
            }, i && !e.config.skin ? {skin: k + " layui-layer-hui", shift: l} : function () {
                return d = d || {}, (-1 === d.icon || d.icon === b && !e.config.skin) && (d.skin = k + " " + (d.skin || "layui-layer-hui")), d
            }()))
        }, load: function (a, b) {
            return f.open(c.extend({type: 3, icon: a || 0, shade: .01}, b))
        }, tips: function (a, b, d) {
            return f.open(c.extend({type: 4, content: [a, b], closeBtn: !1, time: 3e3, shade: !1, maxWidth: 210}, d))
        }
    }, g = function (a) {
        var b = this;
        b.index = ++f.index, b.config = c.extend({}, b.config, e.config, a), b.creat()
    };
    g.pt = g.prototype;
    var h = ["layui-layer", ".layui-layer-title", ".layui-layer-main", ".layui-layer-dialog", "layui-layer-iframe", "layui-layer-content", "layui-layer-btn", "layui-layer-close"];
    h.anim = ["layer-anim", "layer-anim-01", "layer-anim-02", "layer-anim-03", "layer-anim-04", "layer-anim-05", "layer-anim-06"], g.pt.config = {
        type: 0,
        shade: .3,
        fix: !0,
        move: h[1],
        title: "&#x4FE1;&#x606F;",
        offset: "auto",
        area: "auto",
        closeBtn: 1,
        time: 0,
        zIndex: 19891014,
        maxWidth: 360,
        shift: 0,
        icon: -1,
        scrollbar: !0,
        tips: 2
    }, g.pt.vessel = function (a, b) {
        var c = this, d = c.index, f = c.config, g = f.zIndex + d, i = "object" == typeof f.title, j = f.maxmin && (1 === f.type || 2 === f.type), k = f.title ? '<div class="layui-layer-title" style="' + (i ? f.title[1] : "") + '">' + (i ? f.title[0] : f.title) + "</div>" : "";
        return f.zIndex = g, b([f.shade ? '<div class="layui-layer-shade" id="layui-layer-shade' + d + '" times="' + d + '" style="' + ("z-index:" + (g - 1) + "; background-color:" + (f.shade[1] || "#000") + "; opacity:" + (f.shade[0] || f.shade) + "; filter:alpha(opacity=" + (100 * f.shade[0] || 100 * f.shade) + ");") + '"></div>' : "", '<div class="' + h[0] + " " + (h.anim[f.shift] || "") + (" layui-layer-" + e.type[f.type]) + (0 != f.type && 2 != f.type || f.shade ? "" : " layui-layer-border") + " " + (f.skin || "") + '" id="' + h[0] + d + '" type="' + e.type[f.type] + '" times="' + d + '" showtime="' + f.time + '" conType="' + (a ? "object" : "string") + '" style="z-index: ' + g + "; width:" + f.area[0] + ";height:" + f.area[1] + (f.fix ? "" : ";position:absolute;") + '">' + (a && 2 != f.type ? "" : k) + '<div id="' + (f.id || "") + '" class="layui-layer-content' + (0 == f.type && -1 !== f.icon ? " layui-layer-padding" : "") + (3 == f.type ? " layui-layer-loading" + f.icon : "") + '">' + (0 == f.type && -1 !== f.icon ? '<i class="layui-layer-ico layui-layer-ico' + f.icon + '"></i>' : "") + (1 == f.type && a ? "" : f.content || "") + '</div><span class="layui-layer-setwin">' + function () {
            var a = j ? '<a class="layui-layer-min" href="javascript:;"><cite></cite></a><a class="layui-layer-ico layui-layer-max" href="javascript:;"></a>' : "";
            return f.closeBtn && (a += '<a class="layui-layer-ico ' + h[7] + " " + h[7] + (f.title ? f.closeBtn : 4 == f.type ? "1" : "2") + '" href="javascript:;"></a>'), a
        }() + "</span>" + (f.btn ? function () {
            var a = "";
            "string" == typeof f.btn && (f.btn = [f.btn]);
            for (var b = 0, c = f.btn.length; c > b; b++)a += '<a class="' + h[6] + b + '">' + f.btn[b] + "</a>";
            return '<div class="' + h[6] + '">' + a + "</div>"
        }() : "") + "</div>"], k), c
    }, g.pt.creat = function () {
        var a = this, b = a.config, g = a.index, i = b.content, j = "object" == typeof i;
        if (!c("#" + b.id)[0]) {
            switch ("string" == typeof b.area && (b.area = "auto" === b.area ? ["", ""] : [b.area, ""]), b.type) {
                case 0:
                    b.btn = "btn" in b ? b.btn : e.btn[0], f.closeAll("dialog");
                    break;
                case 2:
                    var i = b.content = j ? b.content : [b.content || "http://layer.layui.com", "auto"];
                    b.content = '<iframe scrolling="' + (b.content[1] || "auto") + '" allowtransparency="true" id="' + h[4] + g + '" name="' + h[4] + g + '" onload="this.className=\'\';" class="layui-layer-load" frameborder="0" src="' + b.content[0] + '"></iframe>';
                    break;
                case 3:
                    b.title = !1, b.closeBtn = !1, -1 === b.icon && 0 === b.icon, f.closeAll("loading");
                    break;
                case 4:
                    j || (b.content = [b.content, "body"]), b.follow = b.content[1], b.content = b.content[0] + '<i class="layui-layer-TipsG"></i>', b.title = !1, b.fix = !1, b.tips = "object" == typeof b.tips ? b.tips : [b.tips, !0], b.tipsMore || f.closeAll("tips")
            }
            a.vessel(j, function (d, e) {
                c("body").append(d[0]), j ? function () {
                    2 == b.type || 4 == b.type ? function () {
                        c("body").append(d[1])
                    }() : function () {
                        i.parents("." + h[0])[0] || (i.show().addClass("layui-layer-wrap").wrap(d[1]), c("#" + h[0] + g).find("." + h[5]).before(e))
                    }()
                }() : c("body").append(d[1]), a.layero = c("#" + h[0] + g), b.scrollbar || h.html.css("overflow", "hidden").attr("layer-full", g)
            }).auto(g), 2 == b.type && f.ie6 && a.layero.find("iframe").attr("src", i[0]), c(document).off("keydown", e.enter).on("keydown", e.enter), a.layero.on("keydown", function (a) {
                c(document).off("keydown", e.enter)
            }), 4 == b.type ? a.tips() : a.offset(), b.fix && d.on("resize", function () {
                a.offset(), (/^\d+%$/.test(b.area[0]) || /^\d+%$/.test(b.area[1])) && a.auto(g), 4 == b.type && a.tips()
            }), b.time <= 0 || setTimeout(function () {
                f.close(a.index)
            }, b.time), a.move().callback()
        }
    }, g.pt.auto = function (a) {
        function b(a) {
            a = g.find(a), a.height(i[1] - j - k - 2 * (0 | parseFloat(a.css("padding"))))
        }

        var e = this, f = e.config, g = c("#" + h[0] + a);
        "" === f.area[0] && f.maxWidth > 0 && (/MSIE 7/.test(navigator.userAgent) && f.btn && g.width(g.innerWidth()), g.outerWidth() > f.maxWidth && g.width(f.maxWidth));
        var i = [g.innerWidth(), g.innerHeight()], j = g.find(h[1]).outerHeight() || 0, k = g.find("." + h[6]).outerHeight() || 0;
        switch (f.type) {
            case 2:
                b("iframe");
                break;
            default:
                "" === f.area[1] ? f.fix && i[1] >= d.height() && (i[1] = d.height(), b("." + h[5])) : b("." + h[5])
        }
        return e
    }, g.pt.offset = function () {
        var a = this, b = a.config, c = a.layero, e = [c.outerWidth(), c.outerHeight()], f = "object" == typeof b.offset;
        a.offsetTop = (d.height() - e[1]) / 2, a.offsetLeft = (d.width() - e[0]) / 2, f ? (a.offsetTop = b.offset[0], a.offsetLeft = b.offset[1] || a.offsetLeft) : "auto" !== b.offset && (a.offsetTop = b.offset, "rb" === b.offset && (a.offsetTop = d.height() - e[1], a.offsetLeft = d.width() - e[0])), b.fix || (a.offsetTop = /%$/.test(a.offsetTop) ? d.height() * parseFloat(a.offsetTop) / 100 : parseFloat(a.offsetTop), a.offsetLeft = /%$/.test(a.offsetLeft) ? d.width() * parseFloat(a.offsetLeft) / 100 : parseFloat(a.offsetLeft), a.offsetTop += d.scrollTop(), a.offsetLeft += d.scrollLeft()), c.css({
            top: a.offsetTop,
            left: a.offsetLeft
        })
    }, g.pt.tips = function () {
        var a = this, b = a.config, e = a.layero, f = [e.outerWidth(), e.outerHeight()], g = c(b.follow);
        g[0] || (g = c("body"));
        var i = {
            width: g.outerWidth(),
            height: g.outerHeight(),
            top: g.offset().top,
            left: g.offset().left
        }, j = e.find(".layui-layer-TipsG"), k = b.tips[0];
        b.tips[1] || j.remove(), i.autoLeft = function () {
            i.left + f[0] - d.width() > 0 ? (i.tipLeft = i.left + i.width - f[0], j.css({
                right: 12,
                left: "auto"
            })) : i.tipLeft = i.left
        }, i.where = [function () {
            i.autoLeft(), i.tipTop = i.top - f[1] - 10, j.removeClass("layui-layer-TipsB").addClass("layui-layer-TipsT").css("border-right-color", b.tips[1])
        }, function () {
            i.tipLeft = i.left + i.width + 10, i.tipTop = i.top, j.removeClass("layui-layer-TipsL").addClass("layui-layer-TipsR").css("border-bottom-color", b.tips[1])
        }, function () {
            i.autoLeft(), i.tipTop = i.top + i.height + 10, j.removeClass("layui-layer-TipsT").addClass("layui-layer-TipsB").css("border-right-color", b.tips[1])
        }, function () {
            i.tipLeft = i.left - f[0] - 10, i.tipTop = i.top, j.removeClass("layui-layer-TipsR").addClass("layui-layer-TipsL").css("border-bottom-color", b.tips[1])
        }], i.where[k - 1](), 1 === k ? i.top - (d.scrollTop() + f[1] + 16) < 0 && i.where[2]() : 2 === k ? d.width() - (i.left + i.width + f[0] + 16) > 0 || i.where[3]() : 3 === k ? i.top - d.scrollTop() + i.height + f[1] + 16 - d.height() > 0 && i.where[0]() : 4 === k && f[0] + 16 - i.left > 0 && i.where[1](), e.find("." + h[5]).css({
            "background-color": b.tips[1],
            "padding-right": b.closeBtn ? "30px" : ""
        }), e.css({left: i.tipLeft, top: i.tipTop})
    }, g.pt.move = function () {
        var a = this, b = a.config, e = {
            setY: 0, moveLayer: function () {
                var a = e.layero, b = parseInt(a.css("margin-left")), c = parseInt(e.move.css("left"));
                0 === b || (c -= b), "fixed" !== a.css("position") && (c -= a.parent().offset().left, e.setY = 0), a.css({
                    left: c,
                    top: parseInt(e.move.css("top")) - e.setY
                })
            }
        }, f = a.layero.find(b.move);
        return b.move && f.attr("move", "ok"), f.css({cursor: b.move ? "move" : "auto"}), c(b.move).on("mousedown", function (a) {
            if (a.preventDefault(), "ok" === c(this).attr("move")) {
                e.ismove = !0, e.layero = c(this).parents("." + h[0]);
                var f = e.layero.offset().left, g = e.layero.offset().top, i = e.layero.outerWidth() - 6, j = e.layero.outerHeight() - 6;
                c("#layui-layer-moves")[0] || c("body").append('<div id="layui-layer-moves" class="layui-layer-moves" style="left:' + f + "px; top:" + g + "px; width:" + i + "px; height:" + j + 'px; z-index:2147483584"></div>'), e.move = c("#layui-layer-moves"), b.moveType && e.move.css({visibility: "hidden"}), e.moveX = a.pageX - e.move.position().left, e.moveY = a.pageY - e.move.position().top, "fixed" !== e.layero.css("position") || (e.setY = d.scrollTop())
            }
        }), c(document).mousemove(function (a) {
            if (e.ismove) {
                var c = a.pageX - e.moveX, f = a.pageY - e.moveY;
                if (a.preventDefault(), !b.moveOut) {
                    e.setY = d.scrollTop();
                    var g = d.width() - e.move.outerWidth(), h = e.setY;
                    0 > c && (c = 0), c > g && (c = g), h > f && (f = h), f > d.height() - e.move.outerHeight() + e.setY && (f = d.height() - e.move.outerHeight() + e.setY)
                }
                e.move.css({left: c, top: f}), b.moveType && e.moveLayer(), c = f = g = h = null
            }
        }).mouseup(function () {
            try {
                e.ismove && (e.moveLayer(), e.move.remove(), b.moveEnd && b.moveEnd()), e.ismove = !1
            } catch (a) {
                e.ismove = !1
            }
        }), a
    }, g.pt.callback = function () {
        function a() {
            var a = g.cancel && g.cancel(b.index, d);
            a === !1 || f.close(b.index)
        }

        var b = this, d = b.layero, g = b.config;
        b.openLayer(), g.success && (2 == g.type ? d.find("iframe").on("load", function () {
            g.success(d, b.index)
        }) : g.success(d, b.index)), f.ie6 && b.IE6(d), d.find("." + h[6]).children("a").on("click", function () {
            var a = c(this).index();
            if (0 === a)g.yes ? g.yes(b.index, d) : g.btn1 ? g.btn1(b.index, d) : f.close(b.index); else {
                var e = g["btn" + (a + 1)] && g["btn" + (a + 1)](b.index, d);
                e === !1 || f.close(b.index)
            }
        }), d.find("." + h[7]).on("click", a), g.shadeClose && c("#layui-layer-shade" + b.index).on("click", function () {
            f.close(b.index)
        }), d.find(".layui-layer-min").on("click", function () {
            f.min(b.index, g), g.min && g.min(d)
        }), d.find(".layui-layer-max").on("click", function () {
            c(this).hasClass("layui-layer-maxmin") ? (f.restore(b.index), g.restore && g.restore(d)) : (f.full(b.index, g), g.full && g.full(d))
        }), g.end && (e.end[b.index] = g.end)
    }, e.reselect = function () {
        c.each(c("select"), function (a, b) {
            var d = c(this);
            d.parents("." + h[0])[0] || 1 == d.attr("layer") && c("." + h[0]).length < 1 && d.removeAttr("layer").show(), d = null
        })
    }, g.pt.IE6 = function (a) {
        function b() {
            a.css({top: f + (e.config.fix ? d.scrollTop() : 0)})
        }

        var e = this, f = a.offset().top;
        b(), d.scroll(b), c("select").each(function (a, b) {
            var d = c(this);
            d.parents("." + h[0])[0] || "none" === d.css("display") || d.attr({layer: "1"}).hide(), d = null
        })
    }, g.pt.openLayer = function () {
        var a = this;
        f.zIndex = a.config.zIndex, f.setTop = function (a) {
            var b = function () {
                f.zIndex++, a.css("z-index", f.zIndex + 1)
            };
            return f.zIndex = parseInt(a[0].style.zIndex), a.on("mousedown", b), f.zIndex
        }
    }, e.record = function (a) {
        var b = [a.outerWidth(), a.outerHeight(), a.position().top, a.position().left + parseFloat(a.css("margin-left"))];
        a.find(".layui-layer-max").addClass("layui-layer-maxmin"), a.attr({area: b})
    }, e.rescollbar = function (a) {
        h.html.attr("layer-full") == a && (h.html[0].style.removeProperty ? h.html[0].style.removeProperty("overflow") : h.html[0].style.removeAttribute("overflow"), h.html.removeAttr("layer-full"))
    }, a.layer = f, f.getChildFrame = function (a, b) {
        return b = b || c("." + h[4]).attr("times"), c("#" + h[0] + b).find("iframe").contents().find(a)
    }, f.getFrameIndex = function (a) {
        return c("#" + a).parents("." + h[4]).attr("times")
    }, f.iframeAuto = function (a) {
        if (a) {
            var b = f.getChildFrame("html", a).outerHeight(), d = c("#" + h[0] + a), e = d.find(h[1]).outerHeight() || 0, g = d.find("." + h[6]).outerHeight() || 0;
            d.css({height: b + e + g}), d.find("iframe").css({height: b})
        }
    }, f.iframeSrc = function (a, b) {
        c("#" + h[0] + a).find("iframe").attr("src", b)
    }, f.style = function (a, b) {
        var d = c("#" + h[0] + a), f = d.attr("type"), g = d.find(h[1]).outerHeight() || 0, i = d.find("." + h[6]).outerHeight() || 0;
        (f === e.type[1] || f === e.type[2]) && (d.css(b), f === e.type[2] && d.find("iframe").css({height: parseFloat(b.height) - g - i}))
    }, f.min = function (a, b) {
        var d = c("#" + h[0] + a), g = d.find(h[1]).outerHeight() || 0;
        e.record(d), f.style(a, {
            width: 180,
            height: g,
            overflow: "hidden"
        }), d.find(".layui-layer-min").hide(), "page" === d.attr("type") && d.find(h[4]).hide(), e.rescollbar(a)
    }, f.restore = function (a) {
        var b = c("#" + h[0] + a), d = b.attr("area").split(",");
        b.attr("type");
        f.style(a, {
            width: parseFloat(d[0]),
            height: parseFloat(d[1]),
            top: parseFloat(d[2]),
            left: parseFloat(d[3]),
            overflow: "visible"
        }), b.find(".layui-layer-max").removeClass("layui-layer-maxmin"), b.find(".layui-layer-min").show(), "page" === b.attr("type") && b.find(h[4]).show(), e.rescollbar(a)
    }, f.full = function (a) {
        var b, g = c("#" + h[0] + a);
        e.record(g), h.html.attr("layer-full") || h.html.css("overflow", "hidden").attr("layer-full", a), clearTimeout(b), b = setTimeout(function () {
            var b = "fixed" === g.css("position");
            f.style(a, {
                top: b ? 0 : d.scrollTop(),
                left: b ? 0 : d.scrollLeft(),
                width: d.width(),
                height: d.height()
            }), g.find(".layui-layer-min").hide()
        }, 100)
    }, f.title = function (a, b) {
        var d = c("#" + h[0] + (b || f.index)).find(h[1]);
        d.html(a)
    }, f.close = function (a) {
        var b = c("#" + h[0] + a), d = b.attr("type");
        if (b[0]) {
            if (d === e.type[1] && "object" === b.attr("conType")) {
                b.children(":not(." + h[5] + ")").remove();
                for (var g = 0; 2 > g; g++)b.find(".layui-layer-wrap").unwrap().hide()
            } else {
                if (d === e.type[2])try {
                    var i = c("#" + h[4] + a)[0];
                    i.contentWindow.document.write(""), i.contentWindow.close(), b.find("." + h[5])[0].removeChild(i)
                } catch (j) {
                }
                b[0].innerHTML = "", b.remove()
            }
            c("#layui-layer-moves, #layui-layer-shade" + a).remove(), f.ie6 && e.reselect(), e.rescollbar(a), c(document).off("keydown", e.enter), "function" == typeof e.end[a] && e.end[a](), delete e.end[a]
        }
    }, f.closeAll = function (a) {
        c.each(c("." + h[0]), function () {
            var b = c(this), d = a ? b.attr("type") === a : 1;
            d && f.close(b.attr("times")), d = null
        })
    };
    var i = f.cache || {}, j = function (a) {
        return i.skin ? " " + i.skin + " " + i.skin + "-" + a : ""
    };
    f.prompt = function (a, b) {
        a = a || {}, "function" == typeof a && (b = a);
        var d, e = 2 == a.formType ? '<textarea class="layui-layer-input">' + (a.value || "") + "</textarea>" : function () {
            return '<input type="' + (1 == a.formType ? "password" : "text") + '" class="layui-layer-input" value="' + (a.value || "") + '">'
        }();
        return f.open(c.extend({
            btn: ["&#x786E;&#x5B9A;", "&#x53D6;&#x6D88;"],
            content: e,
            skin: "layui-layer-prompt" + j("prompt"),
            success: function (a) {
                d = a.find(".layui-layer-input"), d.focus()
            },
            yes: function (c) {
                var e = d.val();
                "" === e ? d.focus() : e.length > (a.maxlength || 500) ? f.tips("&#x6700;&#x591A;&#x8F93;&#x5165;" + (a.maxlength || 500) + "&#x4E2A;&#x5B57;&#x6570;", d, {tips: 1}) : b && b(e, c, d)
            }
        }, a))
    }, f.tab = function (a) {
        a = a || {};
        var b = a.tab || {};
        return f.open(c.extend({
            type: 1, skin: "layui-layer-tab" + j("tab"), title: function () {
                var a = b.length, c = 1, d = "";
                if (a > 0)for (d = '<span class="layui-layer-tabnow">' + b[0].title + "</span>"; a > c; c++)d += "<span>" + b[c].title + "</span>";
                return d
            }(), content: '<ul class="layui-layer-tabmain">' + function () {
                var a = b.length, c = 1, d = "";
                if (a > 0)for (d = '<li class="layui-layer-tabli xubox_tab_layer">' + (b[0].content || "no content") + "</li>"; a > c; c++)d += '<li class="layui-layer-tabli">' + (b[c].content || "no  content") + "</li>";
                return d
            }() + "</ul>", success: function (b) {
                var d = b.find(".layui-layer-title").children(), e = b.find(".layui-layer-tabmain").children();
                d.on("mousedown", function (b) {
                    b.stopPropagation ? b.stopPropagation() : b.cancelBubble = !0;
                    var d = c(this), f = d.index();
                    d.addClass("layui-layer-tabnow").siblings().removeClass("layui-layer-tabnow"), e.eq(f).show().siblings().hide(), "function" == typeof a.change && a.change(f)
                })
            }
        }, a))
    }, f.photos = function (b, d, e) {
        function g(a, b, c) {
            var d = new Image;
            return d.src = a, d.complete ? b(d) : (d.onload = function () {
                d.onload = null, b(d)
            }, void(d.onerror = function (a) {
                d.onerror = null, c(a)
            }))
        }

        var h = {};
        if (b = b || {}, b.photos) {
            var i = b.photos.constructor === Object, k = i ? b.photos : {}, l = k.data || [], m = k.start || 0;
            if (h.imgIndex = (0 | m) + 1, b.img = b.img || "img", i) {
                if (0 === l.length)return f.msg("&#x6CA1;&#x6709;&#x56FE;&#x7247;")
            } else {
                var n = c(b.photos), o = function () {
                    l = [], n.find(b.img).each(function (a) {
                        var b = c(this);
                        b.attr("layer-index", a), l.push({
                            alt: b.attr("alt"),
                            pid: b.attr("layer-pid"),
                            src: b.attr("layer-src") || b.attr("src"),
                            thumb: b.attr("src")
                        })
                    })
                };
                if (o(), 0 === l.length)return;
                if (d || n.on("click", b.img, function () {
                        var a = c(this), d = a.attr("layer-index");
                        f.photos(c.extend(b, {photos: {start: d, data: l, tab: b.tab}, full: b.full}), !0), o()
                    }), !d)return
            }
            h.imgprev = function (a) {
                h.imgIndex--, h.imgIndex < 1 && (h.imgIndex = l.length), h.tabimg(a)
            }, h.imgnext = function (a, b) {
                h.imgIndex++, h.imgIndex > l.length && (h.imgIndex = 1, b) || h.tabimg(a)
            }, h.keyup = function (a) {
                if (!h.end) {
                    var b = a.keyCode;
                    a.preventDefault(), 37 === b ? h.imgprev(!0) : 39 === b ? h.imgnext(!0) : 27 === b && f.close(h.index)
                }
            }, h.tabimg = function (a) {
                l.length <= 1 || (k.start = h.imgIndex - 1, f.close(h.index), f.photos(b, !0, a))
            }, h.event = function () {
                h.bigimg.hover(function () {
                    h.imgsee.show()
                }, function () {
                    h.imgsee.hide()
                }), h.bigimg.find(".layui-layer-imgprev").on("click", function (a) {
                    a.preventDefault(), h.imgprev()
                }), h.bigimg.find(".layui-layer-imgnext").on("click", function (a) {
                    a.preventDefault(), h.imgnext()
                }), c(document).on("keyup", h.keyup)
            }, h.loadi = f.load(1, {shade: "shade" in b ? !1 : .9, scrollbar: !1}), g(l[m].src, function (d) {
                f.close(h.loadi), h.index = f.open(c.extend({
                    type: 1,
                    area: function () {
                        var e = [d.width, d.height], f = [c(a).width() - 50, c(a).height() - 50];
                        return !b.full && e[0] > f[0] && (e[0] = f[0], e[1] = e[0] * d.height / d.width), [e[0] + "px", e[1] + "px"]
                    }(),
                    title: !1,
                    shade: .9,
                    shadeClose: !0,
                    closeBtn: !1,
                    move: ".layui-layer-phimg img",
                    moveType: 1,
                    scrollbar: !1,
                    moveOut: !0,
                    shift: 5 * Math.random() | 0,
                    skin: "layui-layer-photos" + j("photos"),
                    content: '<div class="layui-layer-phimg"><img src="' + l[m].src + '" alt="' + (l[m].alt || "") + '" layer-pid="' + l[m].pid + '"><div class="layui-layer-imgsee">' + (l.length > 1 ? '<span class="layui-layer-imguide"><a href="javascript:;" class="layui-layer-iconext layui-layer-imgprev"></a><a href="javascript:;" class="layui-layer-iconext layui-layer-imgnext"></a></span>' : "") + '<div class="layui-layer-imgbar" style="display:' + (e ? "block" : "") + '"><span class="layui-layer-imgtit"><a href="javascript:;">' + (l[m].alt || "") + "</a><em>" + h.imgIndex + "/" + l.length + "</em></span></div></div></div>",
                    success: function (a, c) {
                        h.bigimg = a.find(".layui-layer-phimg"), h.imgsee = a.find(".layui-layer-imguide,.layui-layer-imgbar"), h.event(a), b.tab && b.tab(l[m], a)
                    },
                    end: function () {
                        h.end = !0, c(document).off("keyup", h.keyup)
                    }
                }, b))
            }, function () {
                f.close(h.loadi), f.msg("&#x5F53;&#x524D;&#x56FE;&#x7247;&#x5730;&#x5740;&#x5F02;&#x5E38;<br>&#x662F;&#x5426;&#x7EE7;&#x7EED;&#x67E5;&#x770B;&#x4E0B;&#x4E00;&#x5F20;&#xFF1F;", {
                    time: 3e4,
                    btn: ["&#x4E0B;&#x4E00;&#x5F20;", "&#x4E0D;&#x770B;&#x4E86;"],
                    yes: function () {
                        l.length > 1 && h.imgnext(!0, !0)
                    }
                })
            })
        }
    }, e.run = function () {
        c = jQuery, d = c(a), h.html = c("html"), f.open = function (a) {
            var b = new g(a);
            return b.index
        }
    }, "function" == typeof define ? define(function () {
        return e.run(), f
    }) : function () {
        e.run();//f.use("skin/layer.css")
    }()
}(window);
//tip
jQuery(document).ready(function ($) {
    $("#tooltip-weixin,#tooltip-qq,#tooltip-f-qq,#tooltip-f-weixin,#tooltip-mail-2").click(
        function () {
            var e = $(this);
            setTimeout(function () {
                    e.parents(".dropdown-menu-part").find(".dropdown-menu").toggleClass("visible");
                },
                200);
        });

    $('.m-search').on('click', function () {
        $('.search-box').slideToggle(200, function () {
            if ($('.m-search').css('display') == 'block') {
                $('.search-box .form-search').focus()
            }
        })
    });



});
(function (window) {


    window.iniAjaxLink = function(config){

        var $ = jQuery;

        var firstTarget = config.firstTarget || "body";

        //给链接绑定事件
        if (window.history.pushState) {

            var ajaxHandler, firstState;

            var templateCache = {};

            var ajaxGoTo = function(ajaxTarget,href,ajaxRender,$eventSource){

                //默认服务端渲染
                var isAjaxSSR = (ajaxRender !=="client");
                var $ajaxTarget = $(ajaxTarget);

                if (!ajaxHandler) {
                    firstState = {
                        url: document.location.href,
                        title: document.title,
                        html: $(firstTarget).html(),
                        ajaxTarget:firstTarget
                    };
                }



                var loadingTimeout = window.setTimeout(function(){
                    $ajaxTarget.html("loading...");
                },500);

                var ajaxHtmlSuccess = function(html,data){
                    if(loadingTimeout){
                        window.clearTimeout(loadingTimeout);
                    }
                    data = data||{};

                    $ajaxTarget.html(html);

                    var state = {
                        url: href,
                        title: data.title || document.title,
                        html: html,
                        ajaxTarget: ajaxTarget
                    };

                    window.history.pushState(state, null, href);

                };

                ajaxHandler = $.ajax({
                    url:href,
                    dataType: (isAjaxSSR?"html":"json"),
                    type:"get",
                    timeout : 10000,
                    success: function (mm) {
                        if(isAjaxSSR){
                            ajaxHtmlSuccess(mm);
                        }
                        else {
                            var templateName = mm.templateName;
                            var template = mm.template;
                            if(template){
                                templateCache[templateName] = template;
                            }else {
                                template = templateCache[templateName];
                            }
                            var data = mm.data ||{};
                            var html = ejs.render(template, data);
                            ajaxHtmlSuccess(html,data);
                        }
                    },
                    complete : function(XMLHttpRequest,status){
                        if(status=='timeout'){
                            ajaxHandler.abort();
                        }
                    },
                    beforeSend: function(XMLHttpRequest) {
                        if(!isAjaxSSR){
                            var templateName = config.getTemplateName(href,$eventSource);
                            var template = null;
                            if(templateName){
                                template = templateCache[templateName];
                            }
                            if(template){
                                XMLHttpRequest.setRequestHeader("CP_NEED_TEMPLATE", "false");
                            }else{
                                XMLHttpRequest.setRequestHeader("CP_NEED_TEMPLATE", "true");
                            }
                        }
                        XMLHttpRequest.setRequestHeader("CP_TEMPLATE_RENDER", ajaxRender);
                    }
                });

            };

            window.ajaxGoTo = ajaxGoTo;

            $(document).on("click", ".ajax-link", function (e) {

                $(window).scrollTop(0);


                var $link = $(this);
                var ajaxTarget = $link.attr("ajax-target");
                var href = $link.attr("href");
                //标记位，是否启用服务端渲染
                var ajaxRender = $link.attr("ajax-render") ||"";

                if (!ajaxTarget || ajaxTarget.length === 0) {
                    return;
                }

                e.preventDefault();
                e.stopPropagation();

                ajaxGoTo(ajaxTarget,href,ajaxRender,$link);

            });


            window.addEventListener("popstate", function (event) {
                if (ajaxHandler == null) {
                } else if (event && event.state) {
                    document.title = event.state.title;
                    var $ajaxTarget = $(event.state.ajaxTarget);
                    $ajaxTarget.html(event.state.html);
                } else {
                    document.title = firstState.title;
                    var $firstTarget =$(firstTarget);
                    $firstTarget.html(firstState.html);
                }
            });
        }



    };


})(window);
(function(window){

    var blogErrI18N = {
        err:"服务器发生错误",
        err_no_permission:"没有权限",
        err_no_article:"没有找到此文章，可能已经被删除了。",
        err_max_reply:"最多只能有50条评论，评论功能已关闭。",
        err_update:"更新失败",
        err_no_reply:"没有填写评论内容",
        err_no_login:"用户没有登录",
        err_reply_too_long:"您输入的评论太长了，最多只能评论300字！",
        err_op_too_much:"您操作太频繁了，休息一分钟吧。",
        err_user_email:"此昵称已被使用过，但是邮箱跟之前不一样。请重新输入。"
    };


    window.getBlogErrI18N = function(text){
        if(!text || text.length===0){
            return null;
        }
        var reg = /^err/ ;
        if(text.length < 50 && reg.test(text)){
            return blogErrI18N[text];
        }
        return null;
    };

})(window);
jQuery(document).ready(function ($) {

    //初始化ajaxLink
    iniAjaxLink({
        firstTarget: ".main-body",
        getTemplateName: function (href) {
            if (href.indexOf("/blog/post/") >= 0) {
                return "blog/post-content";
            }
            if (href.indexOf("/blog") >= 0) {
                return "blog/index";
            }
            return null;
        }
    });


    //滚动
    $(document).on('scroll', function () {

        var st = $(this).scrollTop(),
            nav_point = 90,
            $nav = $('#header');

        if (st >= nav_point) {
            $nav.addClass('headfixed');
        }
        else {
            $nav.removeClass('headfixed');
        }

    });


    function onClick(selector, callback) {
        $(document).on("click", selector, callback);
    }


    function getCreatePostContent(){

        var editor = UE.getEditor("create-ueditor");
        var content = editor.getContent();
        var contentSummary = editor.getContentTxt();
        if (contentSummary.length > 400) {
            contentSummary = contentSummary.slice(0, 400);
        }
        var $box = $("#create-post-box");
        var title = $box.find("input[name=title]").val();
        var belongTopicId = $box.find("select[name=belongTopicId]").val();
        var belongTopicTitle = $box.find("select[name=belongTopicId] option:selected").text();
        var tagString = $box.find("input[name=tagString]").val();

        return {
            title: title,
            content: content,
            contentSummary: contentSummary,
            tagString: tagString,
            belongTopicId: belongTopicId,
            belongTopicTitle: belongTopicTitle
        };
    }

    /**
     * 新建帖子按钮
     */
    onClick(".create-post-submit", function () {

        var data = getCreatePostContent();

        $.post("/article/create", data, function (res) {
            if (res === "ok") {
                layer.msg("&nbsp;&nbsp;&nbsp;新建成功&nbsp;&nbsp;&nbsp;", {
                    time: 0 ,//不自动关闭
                    btn: ['OK'],
                    yes: function () {
                        window.location.href = "/articles/";
                    }
                });
            }
        }, "text");

    });


    /**
     * 修改帖子按钮
     */
    onClick(".modify-post-submit", function () {

        var id = $(this).data("id");
        var data = getCreatePostContent();

        $.post("/article/modify/" + id, data, function (res) {
            if (res === "ok") {
                layer.msg("&nbsp;&nbsp;&nbsp;修改成功&nbsp;&nbsp;&nbsp;", {
                    time: 0,//不自动关闭
                    btn: ['OK'],
                    yes: function () {
                        window.location.href = "/articles/";
                    }
                });
            }
        }, "text");

    });




    //点击文章的回复按钮
    onClick(".create-post-comment-submit", function () {
        var m = $(".create-post-comment");
        var id = m.data("id");
        var comment = {
            title: m.find("[name=title]").val(),
            content: m.find("[name=content]").val()
        };
        $(".create-post-comment-msg").html("loading....");
        $.post("/article/comment/create/" + id, comment, function (d) {
            $(".create-post-comment-msg").html("");

            var errorText = getBlogErrI18N(d);
            if (errorText){
                layer.msg(errorText);
            }else {
                layer.msg("回复成功");
                $(".commentlist").append(d);
                m.find("[name=content]").val("")
            }

        },"html");
    });


    var doArticleSearch = function (e, $form) {
        e.preventDefault();
        e.stopPropagation();

        var keyword = $form.find("input[type=text]").val();
        keyword = encodeURIComponent(keyword);
        var href = "/articles/search/" + keyword;
        //ajaxTarget,href,ajaxRender,$eventSource
        ajaxGoTo(".main-body", href, "server", $form);

        return false;
    };

    $(document).on('submit', 'form.sidebar-search', function (e) {
        var $this = $(this);
        doArticleSearch(e, $this);
        return false;
    });


    //点击用户退出按钮
    onClick(".cp-sys-logout", function () {
        $.get("/users/logout", function (d) {
            layer.alert("退出成功", function () {
                window.location.reload();
            });
        });
    });


    //评论页面点击用户登录按钮
    onClick(".cp-sys-login", function () {

        $.get("/public/static/template/pop-login.html",function(template){

            layer.open({
                type: 1,
                title: "登录",
                area: ['400px', '400px'],
                btn: ['确定', "取消"],
                content: template,
                yes: function (index, $content) { //此处用于演示
                    var nickname = $content.find("input[name='nickname']").val();
                    var email = $content.find("input[name='email']").val();
                    if (!nickname || nickname.length === 0) {
                        layer.msg('昵称不能为空');
                        return;
                    }
                    if (!email || email.length === 0) {
                        layer.msg('请填写邮箱');
                        return;
                    }
                    $.post("/users/login", {
                        nickname: nickname,
                        email: email
                    }, function (d) {

                        var errText = getBlogErrI18N(d);
                        if(errText){
                            layer.msg(errText);
                        }else {
                            layer.alert("登录成功", function () {
                                window.location.reload();
                            });
                        }
                    });
                }
            });

        },"html");

    });



    //删除帖子按钮
    onClick(".cp-post-delete",function(){

        var $this = $(this);

        //询问框
        layer.confirm('确定要删除这篇文章吗？', {
            btn: ['确定','取消'] //按钮
        }, function(){

            var $postItem = $this.closest(".cp-post-item");
            var postId = $postItem.data("id");
            $.get("/article/delete/"+postId,function(d){
                var errText = getBlogErrI18N(d);
                if (errText){
                    layer.msg(errText);
                }else {
                    layer.msg("删除成功",function(){
                        window.location.reload();
                    });
                }
            },"text")

        }, function(){
        });


    });

    //编辑帖子按钮
    onClick(".cp-post-edit",function(){
        var $this = $(this);
        var $postItem = $this.closest(".cp-post-item");
        var postId = $postItem.data("id");
        window.location.href = "/article/modify/"+postId;
    });



    //点击帖子首页的分页按钮
    onClick("#blogListPageString .cp-page-link",function(e){
        $(window).scrollTop(0);
        e.preventDefault();
        e.stopPropagation();

        var $this = $(this);
        var pn = $this.attr("pn");
        var href = window.location.pathname+"?pn=" + pn;
        ajaxGoTo(".main-body", href, "server", $this);
    });

});