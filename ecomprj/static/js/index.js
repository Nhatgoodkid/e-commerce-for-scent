//-------------------------FRONTEND--------------------------

//--SEARCH HISTORY BOOKING---//
$('#searchHistory').click(function (e) {
    const email = $('#emailInput').val();
    const url = `/history?email=${encodeURIComponent(email)}`;
    window.location.href = url;
});

// BOOKING
$('.basic_filter4').click(function (e) {
    // Use closest() to target the controller_person within the same row
    $(this).closest('tr').find('.controller_person').toggle();
});

// Event delegation for the close button click event
$(document).on('click', '#close_controller_person', function (e) {
    $('.controller_person').hide();
});

// Event listener for clicks outside the controller_person
$(document).on('click', function (e) {
    const isControllerPerson = $(e.target).closest('.controller_person').length > 0;
    const isBasicFilter4 = $(e.target).closest('.basic_filter4').length > 0;

    // If the click is outside the controller_person and not on .basic_filter4, hide the controller_person
    if (!isControllerPerson && !isBasicFilter4) {
        $('.controller_person').hide();
    }
});

// Function to increment/decrement the value in "controller_person_input" and "showQuantity"
function updateQuantify(kind, value, cartItemId, productSlug) {
    const showQuantityInput = document.getElementById(`showQuantity${cartItemId}`);
    const quantifyQuantityInput = document.getElementById(`quantifyQuantity${cartItemId}`);

    quantifyQuantityInput.value = showQuantityInput.value;
    const csrfToken = $('input[name="csrfmiddlewaretoken"]').val();

    if (kind === 'up') {
        const currentValue = parseInt(showQuantityInput.value, 10);
        showQuantityInput.value = currentValue + value;
        quantifyQuantityInput.value = currentValue + value;

    } else if (kind === 'down') {
        const currentValue = parseInt(showQuantityInput.value, 10);
        if (currentValue >= 1) {
            showQuantityInput.value = currentValue - value;
            quantifyQuantityInput.value = currentValue - value;
        }
    }

    fetch(`/add-to-cart/${productSlug}/${kind}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
        }
    })
        .then(response => response.json())
        .then(data => {
            // Reload the total quantity in the header
            $('.badge').text(data.total_quantity);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function priceBarSetting() {
    var rangePrice = document.getElementById('barPrice');
    var maxPrice = document.getElementById('maxPrice');
    maxPrice.innerHTML = rangePrice.value; // Display the default slider value

    rangePrice.oninput = function () {
        maxPrice.innerHTML = this.value;
        fetch(`/product/?price=${this.value}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'text/html',
            }
        })
            .then(response => response.text())
            .then(data => {
                const $data = $(data);
                $('#list-product').html($data.find('#list-product').html());
                $('#loaderContent').hide();
                $('.pagination-container').html(
                    $data.find('.pagination-container').html(),
                );
                $('.listSort ul .list-group-item').removeClass('sortActive');
                $('#inititalProduct').addClass('sortActive');
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };
}

priceBarSetting()
//---RELOAD TOTAL QUANTITY WHEN ACTION ADD-TO-CART IS POSTED---//
function reloadTotalQuantity(totalQuantity) {
    // Update the badge value with the new totalQuantity
    $('.badge').text(totalQuantity);
}

function addToCart(productSlug) {
    const csrfToken = $('input[name="csrfmiddlewaretoken"]').val();
    fetch(`/add-to-cart/${productSlug}/up`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
        }
    })
        .then(response => response.json())
        .then(data => {
            // Reload the total quantity in the header
            $('.badge').text(data.total_quantity);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

//---UPDATE TOTAL PRICE BASED ON THE LOCATION---//
const innerRadio = document.getElementById('inner');
const outerRadio = document.getElementById('outer');
const totalField = document.getElementById('total_field');
const totalFieldModal = document.getElementById('total_field_modal');

function updateTotal() {

    let total_price = parseFloat(totalField.getAttribute('data-initial'));
    const selectedRadio = document.querySelector('input[name="shipping_price"]:checked');
    if (selectedRadio) {
        const selectedPrice = parseFloat(selectedRadio.value);

        total_price = total_price + selectedPrice;

        totalField.textContent = total_price.toFixed(2) + ' VNĐ';
        totalFieldModal.textContent = total_price.toFixed(2) + ' VNĐ';
    }
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

    //---PASS VALUE FROM INPUT TO PLACE ORDER MODAL---//
    $('#launch-place-order').on('click', function () {
        const firstNameValue = document.getElementById('firstName').value;
        const lastNameValue = document.getElementById('lastName').value;
        const phoneValue = document.getElementById('phone').value;
        const emailValue = document.getElementById('email').value;
        const cityAddressValue = document.getElementById('city_address').value;
        const districtAddressValue = document.getElementById('district_address').value;
        const streetAddressValue = document.getElementById('street_address').value;

        const modalNameElement = document.querySelector('.fullname');
        const modalPhoneElement = document.querySelector('.phone');
        const modalEmailElement = document.querySelector('.order_email');
        const modalAddressElement = document.querySelector('.address');
        // Set the address in the modal
        modalNameElement.textContent = `${firstNameValue} ${lastNameValue}`;
        modalPhoneElement.textContent = `${phoneValue}`;
        modalEmailElement.textContent = `${emailValue}`;
        modalAddressElement.textContent = `${streetAddressValue} - ${districtAddressValue} - ${cityAddressValue}`;

    })

    //---ADDING ORDER---//
    $('#add-order').on('click', function (e) {
        e.preventDefault();
        const csrfToken = $('input[name="csrfmiddlewaretoken"]').val();
        $.ajax({
            type: 'POST',
            url: '/add/order',
            data: {
                firstname: $('#firstname').val(),
                lastname: $('#lastname').val(),
                username: $('#username').val(),
                city_address: $('#city_address').val(),
                district_address: $('#district_address').val(),
                street_address: $('#street_address').val(),
                phone: $('#phone').val(),
                email: $('#email').val(),
                pay_method: $('#pay_method').val(),
                sub_total: parseInt(totalFieldModal.textContent)
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
                    .text('Đặt hàng thành công!')
                    .show()
                    .delay(2000)
                    .fadeOut();
                setTimeout(() => {
                }, 2000);
            },
        });
    })

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

    let globalParams = {};

    // ---SHOWING ROOM MATCH FILTER SELECTED---//
    const categories = [];
    const kind = [];
    $('input[name="product-category"]').on('click', function () {
        const value = $(this).val();
        if ($(this).prop('checked')) {
            categories.push(value);
        } else {
            const index = categories.indexOf(value);
            if (index > -1) {
                categories.splice(index, 1);
            }
        }

        globalParams.category = categories
        const queryParams = $.param(globalParams);
        $.ajax({
            type: 'GET',
            url: `/product/?${queryParams}`,
            success: function (response) {
                const $response = $(response);
                $('#list-product').html($response.find('#list-product').html());
                $('#loaderContent').hide();
                $('.pagination-container').html(
                    $response.find('.pagination-container').html(),
                );
                $('.listSort ul .list-group-item').removeClass('sortActive');
                $('#inititalProduct').addClass('sortActive');
            },
        });
    });

    $('input[name="product-kind"]').on('click', function () {
        const value = $(this).val();
        if ($(this).prop('checked')) {
            kind.push(value);
        } else {
            const index = kind.indexOf(value);
            if (index > -1) {
                kind.splice(index, 1);
            }
        }
        globalParams.kind = kind
        const queryParams = $.param(globalParams);
        $.ajax({
            type: 'GET',
            url: `/product/?${queryParams}`,
            success: function (response) {
                const $response = $(response);
                $('#list-product').html($response.find('#list-product').html());
                $('#loaderContent').hide();
                $('.pagination-container').html(
                    $response.find('.pagination-container').html(),
                );
                $('.listSort ul .list-group-item').removeClass('sortActive');
                $('#inititalProduct').addClass('sortActive');
            },
        });
    });

    //---SHOWING FULL PRODUCT WHEN NO FILTER SELECTED---//
    $('#inititalProduct').on('click', function () {
        // Reset all field
        $('#loaderContent').show();
        globalParams = {}; // Reset globalParams object

        const queryParams = $.param(globalParams); // Serialize globalParams into a query string
        $.ajax({
            type: 'GET',
            url: `/product?${queryParams}`,
            success: function (response) {
                const $response = $(response);
                $('#list-product').html($response.find('#list-product').html());
                $('#loaderContent').hide();
                $('.pagination-container').html(
                    $response.find('.pagination-container').html(),
                );
                $('.listSort ul .list-group-item').removeClass('sortActive');
                $('#inititalProduct').addClass('sortActive');
            },
        });
    });


    //---SORT PRICE DESC---//
    $('#highPrice').on('click', function () {
        $('#loaderContent').show();
        globalParams = {}; // Reset globalParams object
        globalParams.sort = 'high-price';
        $.get('/product', globalParams)
            .done(function (response) {
                // Display the response data on the page
                const $response = $(response);
                $('#list-product').html($response.find('#list-product').html());
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
        $.get('/product', globalParams)
            .done(function (response) {
                // Display the response data on the page
                const $response = $(response);
                $('#list-product').html($response.find('#list-product').html());
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
