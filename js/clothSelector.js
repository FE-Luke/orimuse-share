/**
 * Created by liuzh on 2016/3/15.
 */

var clothSelector = function(specData,selector){
    this.element = $(selector);
    this.spec = specData.result;
    this.layoutId = localStorage.layoutid;
    this.styleId = localStorage.styleid;
    this.typeId = localStorage.typeid;
    this.colorId = localStorage.colorid;
    this.sizeId = localStorage.sizeid;
    this.printNum = localStorage.printnum;
    this.pdName = localStorage.pdName;
    this.niName = localStorage.niName;
    this.num = 1;
    this.price = 0;
    this.totalPrice = 0;
    this.thumbUrl = [];
    this.designImg = localStorage.designimg;
    this.shoppingCart = [];
    this.templateId = 0;
    window.clothSelector = this;
};
clothSelector.prototype = {
    init:function(){
        this.price = 0;
        this.num = 1;
        this.totalPrice = 0;
        this.templateId = this.getTemplateById(this.layoutId,this.styleId,this.typeId,this.colorId);
        this.element.empty();
        var layouts = this.getLayout();
        var styles = this.getStyles(this.layoutId);
        var types = this.getTypes(this.layoutId,this.styleId);
        var colors = this.getColors(this.layoutId,this.styleId,this.typeId);
        var sizes = this.getSizes(this.layoutId,this.styleId,this.typeId,this.colorId);
        this.createLists(layouts,'服装','layout');
        this.createLists(styles,'风格','style');
        this.createLists(types,'类型','type');
        this.createLists(colors,'颜色','color');
        this.createLists(sizes,'尺码','size');
        this.createNum();
        this.createCart();
        this.getPrice();
        this.changeThumb();
        var that = this;
        $('.front_inner img').attr('src',this.designImg);
        $('.num').bind("change",function(){
            var val = $(this).val();
            if(!isNaN(val)){
                if(val>=1){
                    that.num = val;
                    $(this).val(val);
                }else{
                    that.num = 1;
                    $(this).val(1);
                }
            }else{
                alert('必须输入数字~');
                $(this).val(that.num);
            }
            that.countPrice();
        })
    },
    getLayout:function(){
        var layouts = [];
        var j = 0;
        for (var i = 0; i < this.spec.layouts.length; i++) {
            if (this.spec.layouts[i].disabled == false) {
                layouts[j] = this.spec.layouts[i];
                j++;
            }
        }
        this.arr_sort(layouts);
        return layouts;
    },
    getStyles:function(layoutId){
        var templates = [];
        var styles = [];
        var n = m = 0;
        for (var i = 0; i < this.spec.templates.length; i++) {
            if (this.spec.templates[i].layout == layoutId  //如果templatesObjList[i].layout == layoutId
                && this.selectorTemplates(this.spec.templates[i], templates, //并且templatesObjList[i]不存在于局部变量templates中
                    "style")) {
                templates[n++] = this.spec.templates[i]; //局部变量templates[n] = templatesObjList[i];n++;
                for (var j = 0; j < this.spec.styles.length; j++) {//遍历json数据'styles'键
                    if (this.spec.styles[j].id == this.spec.templates[i].style //如果styles.id == templatesObjList.style
                        && this.spec.styles[j].disabled == false) {//并且style为可用状态
                        styles[m++] = this.spec.styles[j];//局部变量styles[n] == json数据'styles'键[j];m++;
                    }
                }
            }
        }
        this.arr_sort(styles); //数组排序
        if(!this.validId(styles,'styleId')){
            this.styleId = styles[0].id;
        }
        return styles;
    },
    getTypes:function(layoutId, styleId){
        var templates = [];
        var types = [];
        var n = m = 0;
        for (var i = 0; i < this.spec.templates.length; i++) {
            if (this.spec.templates[i].layout == layoutId
                && this.spec.templates[i].style == styleId
                && this.selectorTemplates(this.spec.templates[i], templates, "type")) {
                templates[n++] = this.spec.templates[i];
                for (var j = 0; j < this.spec.types.length; j++) {
                    if (this.spec.types[j].id == this.spec.templates[i].type
                        && this.spec.types[j].disabled == false) {
                        types[m++] = this.spec.types[j];
                    }
                }
            }
        }
        this.arr_sort(types);
        if(!this.validId(types,'typeId')){
            this.typeId = types[0].id;
        }
        return types;
    },
    getColors:function(layoutId, styleId, typeId){
        var templates = [];
        var colors = [];
        var n = m = 0;
        for (var i = 0; i < this.spec.templates.length; i++) {
            if (this.spec.templates[i].layout == layoutId
                && this.spec.templates[i].style == styleId
                && this.spec.templates[i].type == typeId
                && this.selectorTemplates(this.spec.templates[i], templates,
                    "color")) {
                templates[n++] = this.spec.templates[i];
                for (var j = 0; j < this.spec.colors.length; j++) {
                    if (this.spec.colors[j].id == this.spec.templates[i].color
                        && this.spec.colors[j].disabled == false) {
                        colors[m++] = this.spec.colors[j];
                    }
                }
            }
        }
        this.arr_sort(colors);
        if(!this.validId(colors,'colorId')){
            this.colorId = colors[0].id;
        }
        return colors;
    },
    getSizes:function(layoutId, styleId, typeId, colorId){
        var sizes = [];
        var n = 0;
        for (var i = 0; i < this.spec.templates.length; i++) {
            if (this.spec.templates[i].layout == layoutId
                && this.spec.templates[i].style == styleId
                && this.spec.templates[i].type == typeId
                && this.spec.templates[i].color == colorId
                && this.spec.templates[i].disabled == false) {//过滤一下，有些是没有用的
                for (var j = 0; j < this.spec.templates[i].size.length; j++) {
                    for (var k = 0; k < this.spec.sizes.length; k++) {
                        if (this.spec.templates[i].size[j] == this.spec.sizes[k].id) {
                            sizes[n++] = this.spec.sizes[k];
                            break;
                        }
                    }
                }
            }
        }
        this.arr_sort(sizes);
        if(!this.validId(sizes,'sizeId')){
            this.sizeId = sizes[0].id;
        }
        return sizes;
    },
    selectorTemplates:function(template, templates, idType){
        var flag = true;
        if (idType == "style") {
            for (var i = 0; i < templates.length; i++) {
                if (template.style == templates[i].style) {
                    flag = false;
                }
            }
        } else if (idType == "type") {
            for (var i = 0; i < templates.length; i++) {
                if (template.type == templates[i].type) {
                    flag = false;
                }
            }
        } else if (idType == "color") {
            for (var i = 0; i < templates.length; i++) {
                if (template.color == templates[i].color) {
                    flag = false;
                }
            }
        }
        return flag;
    },
    getTemplateById:function(layoutId, styleId, typeId,colorId){
        var templateId = "";
        for (var i = 0; i < this.spec.templates.length; i++) {
            if (this.spec.templates[i].layout == layoutId
                && this.spec.templates[i].style == styleId
                && this.spec.templates[i].type == typeId
                && this.spec.templates[i].color == colorId) {
                templateId = this.spec.templates[i].template_id;
            }
        }
        return templateId;
    },
    arr_sort:function(arr){
        var temp=null;
        for(var i=0;i<arr.length;i++){
            for(var j=0;j<arr.length;j++){
                if(arr[i].order<arr[j].order){
                    temp=arr[i];
                    arr[i]=arr[j];
                    arr[j]=temp;
                }
            }
        }
        return arr;
    },
    createLists:function(array,name,type){
        var str='';
        var that = this;
        $(array).each(function(index,obj){
            if(obj.id == that[type+'Id']){
                str+='<li class="sel" data="'+obj.id+'" type="'+type+'">'+obj.name+'</li>';
            }else{
                str+='<li data = "'+obj.id+'" type="'+type+'">'+obj.name+'</li>';
            }
        });
        this.element.append('<div class="line clearfix '+type+'"><div class="select_title">'+name+'</div><ul class="lists cloth_list">'+str+'</ul></div>');
        this.element.find('.lists li').tap(function(){
            clothSelector.change($(this).attr('type'),$(this).attr('data'));
        });
    },
    createNum:function(){
        this.element.append('<div class="line clearfix"><div class="select_title">数量</div><ul class="lists"><div class="div disable">-</div><input type="tel" class="num" value="1"><div class="add enable">+</div></ul></div>');
        this.element.find('.div').tap(function(){clothSelector.minNum()});
        this.element.find('.add').tap(function(){clothSelector.addNum()});
    },
    createCart:function(){
        this.element.append('<div class="line clearfix"><div class="addToCart" onclick="clothSelector.addToCart()"><img src="./images/shopping.png">添加到购物车</div><div class="price">￥<span class="totalPrice"></span></div></div>');
    },
    validId:function(array,idType){
        var flag = false;
        for(var i = 0 ; i < array.length ;i++){
            if(array[i].id == this[idType]){
                flag = true;
            }
        }
        return flag;
    },
    getPrice:function(){
            var price = 0;
            for (var i = 0; i < this.spec.templates.length; i++) {
                if (this.spec.templates[i].layout == this.layoutId
                    && this.spec.templates[i].style == this.styleId
                    && this.spec.templates[i].type == this.typeId
                    && this.spec.templates[i].disabled == false) {
                    if(this.printNum==2){ //如果有印花有两面
                        price = (this.spec.templates[i].base_price/1) + (this.spec.templates[i].print_price*10);	//价格+100角
                    }else{
                        price = this.spec.templates[i].base_price;
                    }
                }
            }
        this.price = price / 10;
        this.totalPrice = this.price;
        $('.totalPrice').text(this.price);
    },
    minNum:function(){
        var num = Number($('.num').val());
        if(num>1){
            $('.div').removeClass('disable').addClass('enable');
            num--;
            this.num = num;
            $('.num').val(this.num);
        }
        if(this.num==1){
            $('.div').removeClass('enable').addClass('disable');
        }
        this.countPrice();
    },
    addNum:function(){
        var num = Number($('.num').val());
        $('.div').removeClass('disable').addClass('enable');
        num++;
        this.num = num;
        $('.num').val(this.num);
        this.countPrice();
    },
    countPrice:function(){
        this.totalPrice = this.price*this.num;
        $('.totalPrice').text(this.totalPrice);
    },
    change:function(type,id){
        this[type+'Id'] = id;
        this.init();
        this.changeThumb();
    },
    changeThumb:function(){
        this.thumbUrl = this.getClothThumbURL(this.layoutId,this.styleId,this.typeId,this.colorId);
        $('.thumb_front').css({background:'url('+this.thumbUrl[0]+')'});
        $('.thumb_back').css({background:'url('+this.thumbUrl[1]+')'});
    },
    getClothThumbURL:function(layoutId,styleId,typeId,colorId){
        var clothUrl = [];
        for (var i = 0; i < this.spec.templates.length; i++) {
            if (this.spec.templates[i].layout == layoutId&& this.spec.templates[i].style == styleId&& this.spec.templates[i].type == typeId&& this.spec.templates[i].color == colorId) {
                clothUrl[0] = this.spec.templates[i].clothes_original_thumbnail_url;
                clothUrl[1] = this.spec.templates[i].clothes_back_thumbnail_url;
            }
        }
        return clothUrl;
    },
    addToCart:function(){
        var tmpArr = [];
        var that = this;
        var hasItems = false;
        that.element.find('.line > .lists > li').each(function(index,obj){
            if($(obj).hasClass('sel')){
                tmpArr.push($(obj).attr('data'));
                tmpArr.push($(obj).text());
            }
        });
        tmpArr.push(that.num);
        tmpArr.push(that.totalPrice);
        tmpArr.push(that.templateId);
        tmpArr.push(that.thumbUrl[0]);
        $(that.shoppingCart).each(function(index,obj){
            if(tmpArr[1]==obj[1]&&tmpArr[3]==obj[3]&&tmpArr[5]==obj[5]&&tmpArr[7]==obj[7]&&tmpArr[9]==obj[9]){
                that.updateCart(index);
                hasItems = true;
            }
        });
        if(!hasItems){
            $('.cart > .cart_inner > .cart_lists').append('<div class="cart_detail clearfix" cart="'+that.shoppingCart.length+'"><div class="close" onclick="clothSelector.deleteCart('+that.shoppingCart.length+')">×</div><div class="cart_detail_thumb" style="background:url(\''+that.thumbUrl[0]+'\')"><div class="cart_detail_thumb_inner"><img src="'+that.designImg+'"></div></div><div class="cart_detail_info"><div class="shop_name">'+this.pdName+'</div><div class="shop_author">作者:'+this.niName+'</div><div class="shop_detail">'+tmpArr[1]+' '+tmpArr[3]+' '+tmpArr[5]+' '+tmpArr[9]+'</div><div class="shop_num">数量:'+that.num+'件</div><div class="shop_price">￥<span class="price">'+that.totalPrice+'</span></div></div></div>');
            that.shoppingCart.push(tmpArr);
        }
        $('.cart .title').show();
        that.init();
    },
    updateCart:function(index){
        var that = this;
        var cartIndex = index;
        that.shoppingCart[index][10]+=that.num;
        that.shoppingCart[index][11]+=that.totalPrice;
        $('.cart_lists > .cart_detail').each(function(index,obj){
            if($(obj).attr('cart')==cartIndex){
                $(obj).find('.shop_num').text('数量:'+that.shoppingCart[cartIndex][10]+'件');
                $(obj).find('.price').text(that.shoppingCart[cartIndex][11]);
            }
        });
    },
    deleteCart:function(index){
        var that = this;
        var cartIndex = index;
        that.shoppingCart[index]=[null];
        $('.cart_lists > .cart_detail').each(function(index,obj){
            if($(obj).attr('cart')==cartIndex){
                $(obj).remove();
            }
        });
        if($('.cart_lists > .cart_detail').length==0){
            $('.cart .title').hide();
        }
    },
    submitOrder:function(){
        var that = this;
        var tmpArr = [];
        if(that.shoppingCart.length == 0 || that.isNullShoppingCart()){
            that.addToCart();//如果购物车没有商品就把当前选择的商品存入购物车
        }
        var cart = that.shoppingCart;
        $(cart).each(function(index,obj){
            if(obj[0]!=null){
                tmpArr.push({'styleid':obj[0],'stylename':obj[1],'layoutid':obj[2],'layoutname':obj[3],'typeid':obj[4],'typename':obj[5],'colorid':obj[6],'colorname':obj[7],'sizeid':obj[8],'sizename':obj[9],'quantity':obj[10],'price':obj[11],'templateid':obj[12],'templatePath':obj[13]});
            }
        });
        localStorage.shoppingCart = JSON.stringify(tmpArr);
        location.assign('./order.html');
    },
    isNullShoppingCart:function(){
        var that = this;
        $(that.shoppingCart).each(function(index,obj){
            if(obj[0]!==null){
                return false;
            }
        });
        return true;
    }
};