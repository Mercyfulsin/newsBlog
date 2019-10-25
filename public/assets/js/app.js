$(document).ready(() => {
    $(".delquote").click(function () {
        let id = $(this).attr("data-id");
        $.post(
            '/article',
            {id},
            (data, status) => {
                console.log(data, status);
            }
        );
    });
});