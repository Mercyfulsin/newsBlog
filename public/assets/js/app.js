$(document).ready(() => {
    $(".delquote").click(function () {
        let id = $(this).attr("data-id");
        $.post(
            '/articles',
            { id },
            (data, status) => {
                console.log(data, status);
                switch (status) {
                    case 'success':
                        $(this).parent().remove();
                        break;
                    default:
                        console.log("Please refresh");
                }
            }
        );
    });
});