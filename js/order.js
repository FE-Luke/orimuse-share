/**
 * Created by liuzh on 2016/3/25.
 */
var dataGenerator = function(data){
    var arr = [];
    for(var i in data){
        if(typeof(data[i])=='object'){
            arr.push({text:i,children:dataGenerator(data[i])});
        }else{
            arr.push({text:data[i]});
        }
    }
    return arr;
};
function cityPicker(data){
    var d = dataGenerator(data.result);
    var cityPicker3 = new mui.PopPicker({
        layer: 3
    });
    cityPicker3.setData(d);
    window.cityPicker3 = cityPicker3;
    Zepto('#order-area').bind('tap',function(){
        Zepto(input).blur();
        cityPicker3.show(function(items) {
            $('#order-area').text((items[0] || {}).text + " " + (items[1] || {}).text + " " + (items[2] || {}).text);
        });
        return false;
    });
}
Zepto(function(){
    var script = document.createElement('script');
    script.src = 'http://www.orimuse.com:8120/orimuse2/api/params/areajson?callback=cityPicker';
    document.getElementsByTagName('head')[0].appendChild(script);
    var cart = JSON.parse(localStorage.shoppingCart);
    console.log(cart);
    var totalNum= 0,totalPrice = 0;
    /*放数据*/
    Zepto(cart).each(function(index,obj){
        $('.cart .cart_lists').append('<div class="cart_detail clearfix"><div class="cart_detail_thumb" style="background:url(\''+obj.templatePath+'\')"><div class="cart_detail_thumb_inner"><img src="'+localStorage.designimg+'"></div></div><div class="cart_detail_info"><div class="shop_name">'+localStorage.pdName+'</div><div class="shop_detail">'+obj.stylename+' '+obj.layoutname+' '+obj.typename+' '+obj.colorname+' '+obj.sizename+'</div><div class="shop_num">x'+obj.quantity+'</div><div class="shop_price">￥<span class="price">'+obj.price+'</span></div></div></div>');
        totalNum+=Number(obj.quantity);
        totalPrice += Number(obj.price);
    });
    Zepto('.total-num').text(totalNum);
    Zepto('.total-price').text(totalPrice);

    Zepto('.bill>.option').bind('click',function(){
        if($('.bill #bill-info').attr('enable')=='false'){
            $(this).find('.bill-select').addClass('sel');
            $('.bill #bill-info').show().attr('enable','true');
        }else{
            $(this).find('.bill-select').removeClass('sel');
            $('.bill #bill-info').hide().attr('enable','false');
        }
    });

});
