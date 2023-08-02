//-------------------------FRONTEND--------------------------

//--SEARCH HISTORY BOOKING---//
$('#searchHistory').click(function (e) {
    const email = $('#emailInput').val();
    const url = `/history?email=${encodeURIComponent(email)}`;
    window.location.href = url;
});

// BOOKING
$('.basic_filter4').click(function (e) {
    $('.controller_person').toggle();
});

$('#close_controller_person').click(function (e) {
    $('.controller_person').hide();
});

// --------------------- Quantify People
var adult = 0;
var child = 0;
function upQuantify(kind) {
    if (kind == 'Adult') {
        $('#quantify' + kind).val(++adult);
        $('#show' + kind).html(adult);
    } else {
        $('#quantify' + kind).val(++child);
        $('#show' + kind).html(child);
    }
}
function downQuantify(kind) {
    if (kind == 'Adult') {
        if (adult <= 0) {
            $('#quantify' + kind).val(0);
            $('#show' + kind).html(adult);
        } else {
            $('#quantify' + kind).val(--adult);
            $('#show' + kind).html(adult);
        }
    } else {
        if (child <= 0) {
            $('#quantify' + kind).val(0);
            $('#show' + kind).html(child);
        } else {
            $('#quantify' + kind).val(--child);
            $('#show' + kind).html(child);
        }
    }
}

function priceBarSetting() {
    var rangePrice = document.getElementById('barPrice');
    var maxPrice = document.getElementById('maxPrice');
    maxPrice.innerHTML = rangePrice.value; // Display the default slider value

    rangePrice.oninput = function () {
        maxPrice.innerHTML = this.value;
    };
}

//---SHOWING LIST LOCATION---//
const locations = [];

document.querySelectorAll('.location_dropdown-item').forEach((span) => {
    const location = span.dataset.val;
    if (!locations.includes(location)) {
        locations.push(location);
    }
});

$('#list_location').empty();
$.map(locations, function (e, i) {
    $('#list_location').append(`
        <li><span class="location_dropdown-item dropdown-item" data-value="${e}" onclick="getValLocation('${e}')">${e}</span></li>
    `);
});
//---SHOWING ROOM MATCH LOCATION SELECTED---//
function getValLocation(e) {
    $('#input_location').val(e);
}

$(document).ready(function () {
    $('#loaderContent').hide();
    //Animation for HomePage
    $(window).scroll(function () {
        var scroll = $(window).scrollTop();
        if (scroll >= 550) {
            $('.card1').addClass('card1-animation');
        }
        if (scroll >= 850) {
            $('.card2').addClass('card2-animation');
        }
    });
    let currentPage = 1;

    //Ajax for pagination
    $('.pagination-container').on('click', 'a.page-link', function (e) {
        e.preventDefault();
        $('#loaderContent').show();
        currentPage = $(this).data('page');
        globalParams.page = currentPage; // Add page parameter to globalParams
        const queryParams = $.param(globalParams); // Serialize globalParams into a query string
        $.ajax({
            type: 'GET',
            url: `/booking?${queryParams}`,
            success: function (data) {
                $('html, body').animate(
                    {
                        scrollTop: $('#listRoom').offset().top,
                    },
                    100,
                );
                const $data = $(data);
                $('#listRoom').html($data.find('#listRoom').html());
                $('#loaderContent').hide();
                $('.pagination-container').html(
                    $data.find('.pagination-container').html(),
                );
            },
        });
    });

    // ---SHOWING ROOM MATCH FILTER SELECTED---//
    const kind = [];
    const star = [];
    $('input[name="kind"]').on('click', function () {
        const value = $(this).val();
        if ($(this).prop('checked')) {
            kind.push(value);
        } else {
            const index = kind.indexOf(value);
            if (index > -1) {
                kind.splice(index, 1);
            }
        }
    });

    $('input[name="numberStar"]').on('click', function () {
        const value = $(this).val();
        if ($(this).prop('checked')) {
            star.push(value);
        } else {
            const index = star.indexOf(value);
            if (index > -1) {
                star.splice(index, 1);
            }
        }
    });
    let globalParams = {};


    // ---SEARCH ALL FIELD OF ROOM MODEL---//
    $('#search-form').on('submit', function (event) {
        event.preventDefault();
        const adult = $('#quantifyAdult').val();
        const children = $('#quantifyChildren').val();
        const dateFrom = $('#dateFrom').val();
        const dateTo = $('#dateTo').val();
        const location = $('#input_location').val();
        var price = parseFloat($('#maxPrice').text());
        $('#loaderContent').show();
        const params = {
            location,
            dateFrom,
            dateTo,
            adult,
            children,
            kind,
            rating: star,
            price,
            page: currentPage,
        };
        globalParams = params;
        $.get('/booking', params)
            .done(function (response) {
                // Display the response data on the page
                const $response = $(response);
                $('#listRoom').html($response.find('#listRoom').html());
                $('#loaderContent').hide();
                $('.pagination-container').html(
                    $response.find('.pagination-container').html(),
                );

                $('.listSort ul .list-group-item').removeClass('sortActive');
                $('#bestMatch').addClass('sortActive');
            })
            .fail(function (error) {
                // Handle any errors that occurred
            });
    });

    //---SHOWING FULL ROOM WHEN NO LOCATION SELECTED---//
    $('#id_room').on('click', function () {
        // Reset all field
        $('#quantifyAdult').val('');
        $('#quantifyChildren').val('');
        $('#dateFrom').val('');
        $('#dateTo').val('');
        $('#input_location').val('');
        $('input[name="kind"]').prop('checked', false);
        $('input[name="numberStar"]').prop('checked', false);
        kind.length = 0;
        star.length = 0;
        $('#maxPrice').text(1000);
        $('#loaderContent').show();
        globalParams = {}; // Reset globalParams object
        currentPage = 1;
        globalParams.page = currentPage;
        const queryParams = $.param(globalParams); // Serialize globalParams into a query string
        $.ajax({
            type: 'GET',
            url: `/booking?${queryParams}`,
            success: function (response) {
                const $response = $(response);
                $('#listRoom').html($response.find('#listRoom').html());
                $('#loaderContent').hide();
                $('.pagination-container').html(
                    $response.find('.pagination-container').html(),
                );
                $('.listSort ul .list-group-item').removeClass('sortActive');
                $('#id_room').addClass('sortActive');
            },
        });
    });

    //---SORT PRICE DESC---//
    $('#highPrice').on('click', function () {
        $('#loaderContent').show();
        globalParams = {}; // Reset globalParams object
        globalParams.sort = 'high-price';
        $.get('/booking', globalParams)
            .done(function (response) {
                // Display the response data on the page
                const $response = $(response);
                $('#listRoom').html($response.find('#listRoom').html());
                $('#loaderContent').hide();
                $('.pagination-container').html(
                    $response.find('.pagination-container').html(),
                );

                $('.listSort ul .list-group-item').removeClass('sortActive');
                $('#highPrice').addClass('sortActive');
            })
            .fail(function (error) {
                // Handle any errors that occurred
                console.log(error)
            });
    });

    //---SORT PRICE ASC---//
    $('#lowPrice').on('click', function () {
        $('#loaderContent').show();
        globalParams = {}; // Reset globalParams object
        globalParams.sort = 'low-price';
        $.get('/booking', globalParams)
            .done(function (response) {
                // Display the response data on the page
                const $response = $(response);
                $('#listRoom').html($response.find('#listRoom').html());
                $('#loaderContent').hide();
                $('.pagination-container').html(
                    $response.find('.pagination-container').html(),
                );

                $('.listSort ul .list-group-item').removeClass('sortActive');
                $('#lowPrice').addClass('sortActive');
            })
            .fail(function (error) {
                // Handle any errors that occurred
            });
    });

    //------EDIT PRODUCT ADMIN-----------
    $('#editModal').on('show.bs.modal', function (event) {
        var editForm = document.forms['editForm'];
        var button = $(event.relatedTarget); // Button that triggered the modal
        var id = button.data('id');
        var name = button.data('name'); // Extract info from data-* attributes
        var kind = button.data('kind');
        var size = button.data('size');
        var quantity = button.data('quantity');
        var price = button.data('price');
        var image = button.data('image');
        var description = button.data('description');
        //Pass data to edit field
        $('#editname').val(name);
        $('#editkind').val(kind);
        $('#editsize').val(size);
        $('#editquantity').val(quantity);
        $('#editprice').val(price);
        $('#editimage').val(image);
        $('#editdescription').val(description);
        editForm.action = `/adm/edit/product/${id}`;
    });

    //------DELETE PRODUCT ADMIN-----------
    $('#deleteModal').on('show.bs.modal', function (event) {
        var deleteForm = document.forms['deleteForm'];
        var button = $(event.relatedTarget); // Button that triggered the modal
        var id = button.data('id');
        var nameRoom = button.data('name'); // Extract info from data-* attributes
        //Pass data to edit field
        $('#roomName').text(nameRoom);
        deleteForm.action = `/adm/delete/product/${id}`;
    });

    //------EDIT RESERVATION ADMIN-----------
    $('#editReservationModal').on('show.bs.modal', function (event) {
        var editResForm = document.forms['editResForm'];
        var button = $(event.relatedTarget); // Button that triggered the modal
        var id = button.data('id');
        var nameUser = button.data('name'); // Extract info from data-* attributes
        var email = button.data('email');
        var phone = button.data('phone');
        var location = button.data('location');
        var nameRoom = button.data('room');
        var adult = button.data('adult');
        var children = button.data('children');
        var price = button.data('price');
        var dateFrom = button.data('from');
        var formattedDateFrom = new Date(dateFrom)
            .toISOString()
            .substring(0, 10);
        var dateTo = button.data('to');
        var formattedDateTo = new Date(dateTo).toISOString().substring(0, 10);
        var totalPrice = button.data('total');
        var extraService = button.data('service');
        $('#edit-extraService1').prop('checked', false);
        $('#edit-extraService2').prop('checked', false);
        $('#edit-extraService1').prop(
            'checked',
            extraService === 30 || extraService === [30, 15].toString(),
        );
        $('#edit-extraService2').prop(
            'checked',
            extraService === 15 || extraService === [30, 15].toString(),
        );
        var status = button.data('status');
        if (status == 0) {
            $('#edit-status option[value="0"]').prop('selected', true);
        } else if (status == 1) {
            $('#edit-status option[value="1"]').prop('selected', true);
        }

        //Pass data to edit field
        $('#edit-name').val(nameUser);
        $('#edit-email').val(email);
        $('#edit-phone').val(phone);
        $('#edit-location').val(location);
        $('#edit-nameRoom').val(nameRoom);
        $('#edit-adult').val(adult);
        $('#edit-children').val(children);
        $('#edit-price').val(price);
        $('#edit-dateFrom').val(formattedDateFrom);
        $('#edit-dateTo').val(formattedDateTo);
        $('#edit-totalPrice').val(totalPrice);
        $('#edit-extraService').val(extraService);
        editResForm.action = `/admin/edit/reservation/${id}?_method=PUT`;
    });

    //------DELETE RESERVATION ADMIN-----------
    $('#deleteReservationModal').on('show.bs.modal', function (event) {
        var deleteForm = document.forms['delResForm'];
        var button = $(event.relatedTarget); // Button that triggered the modal
        var id = button.data('id');
        var nameRes = button.data('name'); // Extract info from data-* attributes
        var dateFrom = button.data('from');
        var dateTo = button.data('to');
        //Pass data to edit field
        $('#resName').text(nameRes);
        $('#delDateFrom').text(dateFrom);
        $('#delDateTo').text(dateTo);
        deleteForm.action = `/admin/delete/reservation/${id}?_method=DELETE`;
    });

    //------DELETE USER ADMIN-----------
    $('#deleteUserModal').on('show.bs.modal', function (event) {
        var deleteForm = document.forms['delUserModal'];
        var button = $(event.relatedTarget); // Button that triggered the modal
        var id = button.data('id');
        var nameCus = button.data('name'); // Extract info from data-* attributes
        //Pass data to edit field
        $('#delUserName').text(nameCus);
        deleteForm.action = `/admin/delete/customer/${id}?_method=DELETE`;
    });


    //------VIEW DETAIL HISTORY BOOKING-----------
    $('#modalViewHistory').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget); // Button that triggered the modal
        var nameUser = button.data('name'); // Extract info from data-* attributes
        var email = button.data('email');
        var phone = button.data('phone');
        var location = button.data('location');
        var nameRoom = button.data('room');
        var adult = button.data('adult');
        var children = button.data('children');
        var price = button.data('price');
        var dateFrom = button.data('from');
        var formattedDateFrom = new Date(dateFrom)
            .toISOString()
            .substring(0, 10);
        var dateTo = button.data('to');
        var formattedDateTo = new Date(dateTo).toISOString().substring(0, 10);
        var totalPrice = button.data('total');
        var extraService = button.data('service');
        $('#reservation-extraService1').prop('checked', false);
        $('#reservation-extraService2').prop('checked', false);
        $('#reservation-extraService1').prop(
            'checked',
            extraService === 30 || extraService === [30, 15].toString(),
        );
        $('#reservation-extraService2').prop(
            'checked',
            extraService === 15 || extraService === [30, 15].toString(),
        );
        var status = button.data('status');
        if (status == 0) {
            $('#reservation-status option[value="0"]').prop('selected', true);
        } else if (status == 1) {
            $('#reservation-status option[value="1"]').prop('selected', true);
        }
        //Pass data to reservation field
        $('#reservation-name').val(nameUser);
        $('#reservation-email').val(email);
        $('#reservation-phone').val(phone);
        $('#reservation-location').val(location);
        $('#reservation-nameRoom').val(nameRoom);
        $('#reservation-adult').val(adult);
        $('#reservation-children').val(children);
        $('#reservation-price').val(price);
        $('#reservation-dateFrom').val(formattedDateFrom);
        $('#reservation-dateTo').val(formattedDateTo);
        $('#reservation-totalPrice').val(totalPrice);
        $('#reservation-extraService').val(extraService);
    });

    // ------NAVIGATION-----------
    if ($(window).scrollTop() > 0) {
        $('#subNavigation').css({
            display: 'block',
        });
        $('#navigation').css({
            display: 'none',
        });
    }
    $(window).scroll(function () {
        var scroll = $(window).scrollTop();
        if (scroll > 0) {
            $('#subNavigation').css({
                display: 'block',
            });
            $('#navigation').css({
                display: 'none',
            });
        }
        if (scroll == 0) {
            $('#navigation').css({
                display: 'block',
            });
            $('#subNavigation').css({
                display: 'none',
            });
        }
    });

    $('#btn-navigation-sidebar').click(function (e) {
        $('#btn-navigation-sidebar').css('display', 'none');
        $('#navigation-sidebar').css('display', 'block');
        $('body').css('overflow', 'hidden');
    });

    $('#btn-close-sidebar').click(function (e) {
        $('#btn-navigation-sidebar').css('display', 'block');
        $('#navigation-sidebar').css('display', 'none');
        $('body').css('overflow', 'auto');
    });

    $(document).click(function (e) {
        var mouseClick = e.clientX;
        if (mouseClick >= 260) {
            $('#btn-navigation-sidebar').css('display', 'block');
            $('#navigation-sidebar').css('display', 'none');
            $('body').css('overflow', 'auto');
        }
    });

    $(document).click(function (e) {
        var mouseClick = e.clientX;
        if (mouseClick >= 365) {
            $('#btnMenuAdmin').css('display', 'block');
            $('#menuAdmin').css('display', 'none');
            $('body').css('overflow', 'auto');
        }
    });

    $('#closeBtnMenu').click(function (e) {
        $('#menuAdmin').css('display', 'none');
        $('body').css('overflow', 'auto');
    });

    $('#btnMenuAdmin').click(function (e) {
        $('#menuAdmin').css('display', 'block');
        $('body').css('overflow', 'auto');
    });

    // ---------------------------
    $('#btn-signUp').click(function (e) {
        e.preventDefault();
        const csrfToken = $('input[name="csrfmiddlewaretoken"]').val();
        $.ajax({
            type: 'POST',
            url: '/signup',
            data: {
                firstname: $('#firstname').val(),
                lastname: $('#lastname').val(),
                username: $('#username').val(),
                city_address: $('#city_address').val(),
                district_address: $('#district_address').val(),
                street_address: $('#street_address').val(),
                phone: $('#phone').val(),
                email: $('#email').val(),
                password: $('#password').val(),
                confirmPassword: $('#confirmPassword').val(),
            },
            headers: {
                "X-CSRFToken": csrfToken,
            },
            success: function (response) {
                if (response.err) {
                    $('#flashMessage-danger')
                        .text(response.errorMessage[0])
                        .show()
                        .delay(2000)
                        .fadeOut();
                    return;
                }
                $('#flashMessage-success')
                    .text('Đăng ký thành công!')
                    .show()
                    .delay(2000)
                    .fadeOut();
                setTimeout(() => {
                    window.location.replace('/signin');
                }, 2000);
            },
        });
    });

    // -------------SIGN IN---------------

    // Press Enter to sign in
    $(window).keypress(function (e) {
        if (e.which == 13) {
            $('#btn-signIn').click();
        }
    });

    // Show password
    $('#showPass').click(function (e) {
        if ($('#showPass:checked').length == 1) {
            $('.password').attr('type', 'text');
        } else {
            $('.password').attr('type', 'password');
        }
    });

    // Send request sign in
    $('#btn-signIn').click(function (e) {
        e.preventDefault();
        $.ajax({
            type: 'POST',
            url: '/user/sign-in',
            data: {
                email: $('#email').val(),
                password: $('#password').val(),
            },
            success: function (response) {
                if (response.err) {
                    $('#flashMessage-danger')
                        .text(response.errorMessage[0])
                        .show()
                        .delay(2000)
                        .fadeOut();
                } else {
                    window.location.replace('/');
                }
            },
        });
    });

    // ----------- UPDATE PROFILE -----------------
    $('#saveProfile').click(function (e) {
        if (
            $('#phoneCus').val().length < 10 ||
            $('#phoneCus').val().length > 10
        ) {
            $('#flashMessage-danger')
                .text('Số điện thoại phải có 10 số')
                .show()
                .delay(2000)
                .fadeOut();
        } else {
            if (/[a-zA-Z]/.test($('#phoneCus').val())) {
                $('#flashMessage-danger')
                    .text('Số điện thoại không chính xác')
                    .show()
                    .delay(2000)
                    .fadeOut();
            } else {
                $.ajax({
                    type: 'PUT',
                    url: '/user/updateInfo',
                    data: {
                        name: $('#nameCus').val(),
                        email: $('#emailCus').val(),
                        phone: $('#phoneCus').val(),
                    },
                    success: function (response) {
                        $('#flashMessage-success')
                            .text(response.message)
                            .show()
                            .delay(2000)
                            .fadeOut();
                    },
                });
            }
        }
    });

    // --------------- UPDATE PASS ----------------
    $('#btnUpdatePass').click(function (e) {
        if ($('#newPassword').val().length < 6) {
            $('#flashMessage-danger')
                .text('Mật khẩu mới phải có ít nhất 6 ký tự')
                .show()
                .delay(2000)
                .fadeOut();
        } else {
            if ($('#newPassword').val() == $('#newPassword2nd').val()) {
                $.ajax({
                    type: 'PUT',
                    url: '/user/updatePassword',
                    data: {
                        curPassword: $('#curPassword').val(),
                        newPassword: $('#newPassword').val(),
                    },
                    success: function (response) {
                        if (!response.err) {
                            $('#flashMessage-success')
                                .text(response.message)
                                .show()
                                .delay(2000)
                                .fadeOut();
                        } else {
                            $('#flashMessage-danger')
                                .text('Mật khẩu không chính xác')
                                .show()
                                .delay(2000)
                                .fadeOut();
                        }
                    },
                });
            } else {
                $('#flashMessage-danger')
                    .text('Mật khẩu nhập lại không khớp')
                    .show()
                    .delay(2000)
                    .fadeOut();
            }
        }
    });

    // DASHBOARD DATE
    var currentDate = new Date();
    var day = currentDate.getDate();
    var month = currentDate.getMonth() + 1;
    var year = currentDate.getFullYear();

    // Kiểm tra nếu ngày/tháng nhỏ hơn 10, thêm số 0 ở đầu
    if (day < 10) {
        day = '0' + day;
    }
    if (month < 10) {
        month = '0' + month;
    }

    var dateString = day + '/' + month + '/' + year;

    // Cập nhật nội dung của phần tử HTML có ID là "date"
    $('#dashboardDate').text(dateString);

    function displayTime() {
        let currentTime = new Date();
        let hours = currentTime.getHours();
        let minutes = currentTime.getMinutes();
        let seconds = currentTime.getSeconds();

        // Kiểm tra nếu giờ/phút/giây nhỏ hơn 10, thêm số 0 ở đầu
        if (hours < 10) {
            hours = '0' + hours;
        }
        if (minutes < 10) {
            minutes = '0' + minutes;
        }
        if (seconds < 10) {
            seconds = '0' + seconds;
        }

        $('#dashboardClock').text(hours + ':' + minutes + ':' + seconds);
    }

    // Cập nhật đồng hồ mỗi giây
    setInterval(displayTime, 1000);
});
