"use strict"

var currentPerson,
    currentPosition,
    currentOrg,
    currentSub;

function getUrl(btnClass) {
  
  switch (btnClass) {
    case 'person':
      return 'json/persons.json';
    case 'position':
      return 'json/positions.json';
    case 'org': 
      return 'json/orgs.json';
    case 'sub':
      return 'json/subs.json';
  }
  
}

function getModalTitle(btnClass) {
  switch (btnClass) {
    case 'person':
      return 'Выбор сотрудника';
    case 'position':
      return 'Выбор должность';
    case 'org': 
      return 'Выбор организацию';
    case 'sub':
      return 'Выбор подразделение';
  }
}

function createPersonsList(response) {
    // var items = JSON.parse(response);
    response = response.sort(function(a, b) {
        if (a['lastname'] > b['lastname']) return 1;
        else return -1;
    })

    $(response).each(function(i, elem) {
      $('.modal__table').append('<tr><td>' + elem['lastname'] + '</td>\
      <td>' + elem['middlename'] + '</td>\
      <td>' + elem['firstname'] + '</td><td>' + elem['birthday'] + '</td>');
    })
}

function appendItems(target) {
  var url = getUrl(target.className.slice(14)); // с 14 символа начинается 
  //название уникального класса кнопки
  console.log(url);

  $.ajax({ 
        url: url,
        success: function(response) {

            switch (target.className.slice(14)) {
                case 'person':
                    createPersonsList(response);
                    $('.modal__table').click(function(e) {

                      $('.modal__table tr').each(function(i, tr) {
                        if ($(tr).hasClass('selected')) {
                          $(tr).removeClass('selected');
                        }
                      });
                      
                      $(e.target).closest('tr').addClass('selected');
                    })
                    break;
                case 'position':
                    createPositionsList();
                    break;
                case 'org':
                    createOrgsList();
                    break;
                case 'sub':
                    createSubsList();
            }
        }
    });
}

function showModal(e) {
  e.preventDefault();
  $('.modal').css('display', 'block');
  $('body').css('overflow', 'hidden');
  $('.modal__title').text(getModalTitle(e.target.className.slice(14)));
  appendItems(e.target);
  
}

$('.block__button').each(function(i, item) {
  $(item).click(showModal);
})

// временная функция
$('.modal__cancel').click(function() {
  $('.modal').css('display', 'none');
  $('.modal__table').empty();
})

