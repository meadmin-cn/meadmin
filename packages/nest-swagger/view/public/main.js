$.ajax({
  url: 'meadmin-api.json',
  method: 'GET',
  type: 'json',
  success(res) {
    res.forEach((item) => {
      $('.select-option').append(
        `<li data-path="${item.path}">${item.module}</li>`,
      );
    });
    $('.placeholder').html(res[0].module);
    $('#swagger-iframe').attr('src', res[0].path);

  },
});
$('.select').on('click', '.placeholder', function (e) {
  var parent = $(this).closest('.select');
  if (!parent.hasClass('is-open')) {
    parent.addClass('is-open');
    $('.select.is-open').not(parent).removeClass('is-open');
  } else {
    parent.removeClass('is-open');
  }
  e.stopPropagation();
});
$('.select').on('click', 'ul>li', function () {
  var parent = $(this).closest('.select');
  parent.removeClass('is-open').find('.placeholder').text($(this).text());
  $('#swagger-iframe').attr('src', $(this).data('path'));
});

$('body').on('click', function () {
  $('.select.is-open').removeClass('is-open');
});
