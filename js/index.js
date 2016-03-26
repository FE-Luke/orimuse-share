/**
 * Created by liuzh on 2016/3/15.
 */
$(function(){
    /*衣服正反切换*/
    $('.switch li').bind('tap',function(){
        $('.cloth_warp .cloth_block').hide();
        $('.cloth_warp .cloth_block').eq($(this).index()).show();
        $('.switch li').removeClass('sel');
        $(this).addClass('sel');
    });
    /*表述四个标签切换*/
    $('.info_tab li').on('tap',function(){
        $('.info_inner>div').hide();
        $('.info_inner>div').eq($(this).index()).show();
        $('.info_tab li').removeClass('sel');
        $(this).addClass('sel');
    });
});

