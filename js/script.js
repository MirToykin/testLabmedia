"use strict"

var currentPerson = {},
    currentPersons,
    currentPosition = {},
    currentPositions,
    currentOrg = {},
    currentOrgs,
    currentSub = {},
    currentSubs;

var modalIdentifier;

//------------------------HELPERS--------------------------------

function isEmptyObj(obj) {
    for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
            return false;
        }
    }
    return true;
}

function getAge(dateString) {
  var today = new Date();
  var birthDate = new Date(dateString.replace(/(\d+).(\d+).(\d+)/, '$3/$2/$1'));
  var age = today.getFullYear() - birthDate.getFullYear();
  var monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff == 0 && today.getDate() - birthDate.getDate() < 0) ) {
    age--;
  }
  return age;
}

//------------------------CORE--------------------------------

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

  $.ajax({ 
    url: url,
    success: function(response) {
      response = JSON.parse(response); // почему-то в edge response нужно 
      // парсить, а в chrome ajax.success возвращает уже нормальный массив
      switch (modalIdentifier) {
        case 'person':
          currentPersons = response.slice();
          break;
        case 'position':
          currentPositions = response.slice();
          break;
        case 'org':
          currentOrgs = response.slice();
          break;
        case 'sub':
          currentSubs = response.slice();
      }
      
      createTableContent(response);
      highlightTr();
      selectDataItem(response);
    }
   });
}

function selectDataItem(response) {

  $('.modal__buttons').click(function(e) {
    
    if ($(e.target).attr('class') == 'modal__ok') {
      
      $('.modal__table tr').each(function(i, tr) {
        if ($(tr).hasClass('selected')) {
          var currentData,
              currentDataItem;
          
          switch (modalIdentifier) {
            case 'person':
              currentData = currentPersons;
              currentDataItem = currentPerson;
              break;
            case 'position':
              currentData = currentPositions;
              currentDataItem = currentPosition;
              break;
            case 'org':
              currentData = currentOrgs;
              currentDataItem = currentOrg;
              break;
            case 'sub':
              currentData = currentSubs;
              currentDataItem = currentSub;
          }
          
          $(currentData).each(function(i, item) {

            if (item['id'] == $(tr)['0'].id) {
              if (currentDataItem == currentPerson) {
                if (!isEmptyObj(currentPosition)) {
                  
                  var age = getAge(item['birthday']);
                  if ( age < currentPosition['min_age'] || age > currentPosition['max_age']) {
                    confirm('Выбранный сотрудник не подходит по возрасту. Вы уверены, что хотите выбрать этого сотрудника?') ? $.extend(true, currentDataItem, item) : '';
                  } else {
                    console.log('возраст тот');
                    $.extend(true, currentDataItem, item);
                  }
                }
              } else {
                $.extend(true, currentDataItem, item);
              }
              // $.extend(true, currentDataItem, item);
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