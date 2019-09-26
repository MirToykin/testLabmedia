"use strict"

var currentPerson,
    currentPosition,
    currentOrg,
    currentSub;

var modalIdentifier;

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
      return 'Выбор должности';
    case 'org': 
      return 'Выбор организации';
    case 'sub':
      return 'Выбор подразделения';
  }
  
}

function createTableContent(response) {
    // response = JSON.parse(response); // почему-то в edge response нужно 
    // парсить, а в chrome ajax.success возвращает уже нормальный массив
  
    var sortField = typeof response[0]['lastname'] === 'undefined' ? 'name' : 'lastname';
  
    response = response.sort(function(a, b) {
        if (a[sortField] > b[sortField]) return 1;
        else return -1;
    });
  
    var tableHTML = '<tr'

    $(response).each(function(i, elem) {
      tableHTML += ' id="' + elem['id'] + '">';
      for (var key in elem) {
        if (key != "id" && key != "org_id") {
          tableHTML += '<td>' + elem[key] + '</td>';         
        }
      }
      
      tableHTML += '</tr><tr';
    });
  
    tableHTML = tableHTML.slice(0, tableHTML.length - 3); // убираем крайний открывающий тег
    $('.modal__table').html(tableHTML); 
}

function highlightTr() {
  $('.modal__table').click(function(e) {

    $('.modal__table tr').each(function(i, tr) {
      if ($(tr).hasClass('selected')) {
        $(tr).removeClass('selected');
      }
    });

    $(e.target).closest('tr').addClass('selected');
  })
}

function requestData(target) {
  modalIdentifier = target.className.slice(14);// с 14 символа начинается название уникального класса кнопки
  var url = getUrl(modalIdentifier);  
 

  // $.ajax({ 
  //       url: url,
  //       success: function(response) {
          // createTableContent(response);
          // highlightTr();
          // selectDataItem(response);
  //       }
  //   });
  var request = $.ajax({ 
    url: url
  });
  request.done(function(response) {
    createTableContent(response);
  });
  request.done(function(response) {
    highlightTr();
  });
  request.done(function(response) {
    selectDataItem(response);
  });
}

function selectDataItem(response) {
  $('.modal__buttons').click(function(e) {
    
    if ($(e.target).attr('class') == 'modal__ok') {
      
      $('.modal__table tr').each(function(i, tr) {
        if ($(tr).hasClass('selected')) {

          $(response).each(function(i, item) {

            if (item['id'] == $(tr)['0'].id) {
              switch (modalIdentifier) {
                case 'person':
                  currentPerson = $.extend(true, {}, item);
                  break;
                case 'position':
                  currentPosition = $.extend(true, {}, item);
                  break;
                case 'org':
                  currentOrg = $.extend(true, {}, item);
                  break;
                case 'sub':
                  currentPerson = $.extend(true, {}, item);

              }
            }

          });
          console.log(currentPerson);
          console.log(currentPosition);
          console.log(currentOrg);
          console.log(currentSub);
          $('.modal__table').empty();
          $('.modal').css('display', 'none');

        }
      });

    } else if ($(e.target).attr('class') == 'modal__cancel') {
      $('.modal__table').empty();
      $('.modal').css('display', 'none');
    }
    
  })
}

function showModal(e) {
  e.preventDefault();
  $('.modal').css('display', 'block');
  $('body').css('overflow', 'hidden');
  $('.modal__title').text(getModalTitle(e.target.className.slice(14)));
  requestData(e.target);
  
}

$('.block__button').each(function(i, item) {
  $(item).click(showModal);
})

// сделать ф-ю построения строк таблицы универсальной
// сделать заголовок таблицы прибитый к ее верху