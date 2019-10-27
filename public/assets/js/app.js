$(document).ready(() => {
    $(".delarticle").click(function () {
        let id = $(this).attr("data-id");
        $.post(
            '/articles',
            { id },
            (data, status) => {
                console.log(data, status);
                switch (status) {
                    case 'success':
                        $(this).parent().parent().remove();
                        break;
                    default:
                        console.log("Please refresh");
                }
            }
        );
    });
    $(".addcomment").click(function (e) {
        e.preventDefault();
        const id = $(this).attr("data-id");
        $(this).hide();
        const ref = this;
        const bodyref = $(this).parent().children("div.card-text");
        $.ajax({
            method: "GET",
            url: `/articles/${id}`
        })
            .then(function (reply) {
                const textbox = $(`<textarea class="form-control comment" placeholder="Enter comment here..." aria-label="Enter comment here..." aria-describedby="button-addon2">`);
                reply.comment ? textbox.val(reply.comment.body) : '';
                const group = $(`<div class="input-group mt-3">`);
                const buttonAlignment = $(`<div class="input-group-append">`);
                const button = $(`<button class="btn btn-outline-secondary submitcomment" data-id=${id} type="button" id="button-addon2">Submit</button>`);
                button.on("click", function (e) {
                    e.preventDefault();
                    $.ajax({
                        method: "POST",
                        url: `/articles/${id}`,
                        data: { body: $(".comment").val() },
                    }).then(function (dbArticle) {
                        console.log(dbArticle);
                    }).catch(function (err) {
                        console.log(err);
                    });
                    $(this).parent().parent().parent().children("a.addcomment").show();
                    $(this).parent().parent().remove();
                });
                buttonAlignment.append(button);
                group.append(textbox, buttonAlignment);
                $(ref).parent().append(group);
            })
            .catch(function (err) {
                console.log(err);
            });
    });

});