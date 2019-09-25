"use strict"

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
      return 'Выберите сотрудника';
    case 'position':
      return 'Выберите должность';
    case 'org': 
      return 'Выберите организацию';
    case 'sub':
      return 'Выберите подразделение';
  }
}

function appendItems(target) {
  var url = getUrl(target.className.slice(14)); // с 14 символа начинается 
  //название уникального класса кнопки

  $.ajax({ 
        url: url,
        success: function(response) {
            console.log(response[0]);
            // var items = JSON.parse(response);
            $(response).each(function(i, elem) {
              $('.modal__list').append('<p>' + elem['lastname'] + ' ' + elem['middlename']) + ' ' + elem['firstname'] + '</p>';
            })
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
})

