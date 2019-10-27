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
        const group = $(`<div class="input-group mt-3">`);
        const textbox = $(`<textarea class="form-control comment" placeholder="Enter comment here..." aria-label="Enter comment here..." aria-describedby="button-addon2">`);
        const buttonAlignment = $(`<div class="input-group-append">`);
        const button = $(`<button class="btn btn-outline-secondary submitcomment" data-id=${id} type="button" id="button-addon2">Submit</button>`);
        button.click(function (e) {
            e.preventDefault();
            const id = $(this).attr("data-id");
            console.log("Content: ", $(".comment").val());
            $.ajax({
                method: "POST",
                url: `/articles/${id}`,
                data: { body: "test" },
            }).then(function (dbArticle) {
                console.log(dbArticle);
            }).catch(function (err) {
                console.log(err);
            });
            const commentBtn = $(`<a href="#" data-id="${id}" class="btn btn-warning addcomment">Add Comment</a>`);
            $(this).parent().children("div.card-body").append(commentBtn);
            $(this).parent().children("div.input-group").remove();
        });
        buttonAlignment.append(button);
        group.append(textbox, buttonAlignment);
        $(this).parent().append(group);
        $(this).remove();
        console.log("done");
    });


});