"use strict"

var currentPerson = {},
    currentPersons,
    currentPosition = {},
    currentPositions,
    currentOrg = {},
    currentOrgs,
    currentSub = {},
    currentSubs;

var modalIdentifier,
    modalPersonScroll = 0,
    modalPositionScroll = 0,
    modalOrgScroll = 0,
    modalSubScroll = 0;

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

function showModal(e) {

  e.preventDefault();
  $('.modal').css('display', 'block');
  $('body').css('overflow', 'hidden');
  $('.modal__title').text(getModalTitle(e.target.className.slice(14)));

  requestData(e.target);

  $('.modal__close').click(function(){
    closeModal();
  });
  
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

function requestData(target) {

  modalIdentifier = target.className.slice(14);// с 14 символа начинается название уникального класса кнопки
  var url = getUrl(modalIdentifier);  

  $.ajax({ 
    url: url,
    success: function(response) {
      if (typeof response != 'object') {
        response = JSON.parse(response); 
      }

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

      switch(modalIdentifier) {
        case 'person':
          $('.modal__content-main').scrollTop(modalPersonScroll);
          break;
        case 'position':
          $('.modal__content-main').scrollTop(modalPositionScroll);
          break;
        case 'org':
          $('.modal__content-main').scrollTop(modalOrgScroll);
          break;
        case 'sub':
          $('.modal__content-main').scrollTop(modalSubScroll);
      }
    }
   });
}

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

function createTableContent(response) {
  
  var sortField = typeof response[0]['lastname'] === 'undefined' ? 'name' : 'lastname';

  response = response.sort(function(a, b) {
      if (a[sortField] > b[sortField]) return 1;
      else return -1;
  });

  if (modalIdentifier == 'sub') {

    createTableHeader(modalIdentifier);

    if (isEmptyObj(currentOrg)) {
      // если организация не выбрана выводим все подразделения всех организаций
      $.ajax({
        url: 'json/orgs.json',
        success: function(orgs) {
          if (typeof orgs != 'object') {
            orgs = JSON.parse(orgs); 
          }

          showList(response, '<tr', orgs);

          highlightTr();
          selectDataItem(response);
        }
      });

    } else {
      // если организация выбрана, то выводим только ее подразделения
      var filteredResponse = $.grep(response, function(item) {
        return item['org_id'] == currentOrg['id'];
      })
      showList(filteredResponse, '<tr', currentOrgs);
    }

  } else {
    createTableHeader(modalIdentifier);
    showList(response, '<tr');
  }

}

function createTableHeader(modalIdentifier) {
  var cells;

  switch(modalIdentifier) {
    case 'person':
      cells = '<th>Фамилия</th><th>Имя</th><th>Отчество</th><th>Дата рождения</th>';
      break;
    case 'position':
      cells = '<th>Название</th><th>Мин. возраст</th><th>Макс. возраст</th>';
      break;
    case 'org':
        cells = '<th>Название</th><th>Страна</th>';
      break;
    case 'sub':
        cells = '<th>Название</th><th>Организация</th>';
  }

  var tableHeader = '<tr>' + cells + '</tr>';

  $('.modal__table-header').html(tableHeader);
}

function showList(response, tableHTML, orgs) {
  $(response).each(function(i, elem) {
    var selectedClass = '';

    switch(modalIdentifier) {
      case 'person':
        if (!isEmptyObj(currentPerson) && currentPerson['id'] == elem['id']) {
          selectedClass = ' class="selected"';
        }
        break;
      case 'position':
        if (!isEmptyObj(currentPosition) && currentPosition['id'] == elem['id']) {
          selectedClass = ' class="selected"';
        }
        break;
      case 'org':
        if (!isEmptyObj(currentOrg) && currentOrg['id'] == elem['id']) {
          selectedClass = ' class="selected"';
        }
        break;
      case 'sub':
        if (!isEmptyObj(currentSub) && currentSub['id'] == elem['id']) {
          selectedClass = ' class="selected"';
        }
    }

    tableHTML += ' id="' + elem['id'] + '"' + selectedClass + '>';

    for (var key in elem) {
      var orgNameTd;

      if (modalIdentifier == 'sub') {

        var subsOrg = $.grep(orgs, function(item) {
          return elem['org_id'] == item['id'];
        })
        orgNameTd = '<td>' + subsOrg[0]['name'] + '</td>';

      } else {
        orgNameTd = '';
      }
      
      if (key != "id" && key != "org_id") {
        tableHTML += '<td>' + elem[key] + '</td>' + orgNameTd;         
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
  });
}

function selectDataItem(response) {

  $('.modal__buttons').unbind('click').click(function(e) { // unbind('click') для того, чтобы событие не срабатывало повторно
    
    if ($(e.target).attr('class') == 'modal__ok') {
      
      $('.modal__table tr').each(function(i, tr) {
        if ($(tr).hasClass('selected')) {
          var currentData,
              currentDataItem;
          
          switch (modalIdentifier) {
            case 'person':
              currentData = currentPersons;
              currentDataItem = currentPerson;
              modalPersonScroll = $('.modal__content-main').scrollTop();
              break;
            case 'position':
              currentData = currentPositions;
              currentDataItem = currentPosition;
              modalPositionScroll = $('.modal__content-main').scrollTop();
              break;
            case 'org':
              currentData = currentOrgs;
              currentDataItem = currentOrg;
              modalOrgScroll = $('.modal__content-main').scrollTop();
              break;
            case 'sub':
              currentData = currentSubs;
              currentDataItem = currentSub;
              modalSubScroll = $('.modal__content-main').scrollTop();
          }
          
          $(currentData).each(function(i, item) {

            if (item['id'] == $(tr)['0'].id) {
              if (currentDataItem == currentPerson) {

                checkAge(currentPosition, item['birthday'], currentPosition, 
                'Выбранный сотрудник не подходит по возрасту. Вы уверены, что хотите выбрать этого сотрудника?',
                currentDataItem, item);

              } else if (currentDataItem == currentPosition) {

                checkAge(currentPerson, currentPerson['birthday'], item, 
                'Выбранная должность не подходит по возрасту сотруднику. Вы уверены, что хотите выбрать эту должность?',
                currentDataItem, item);

              } else {
                handleSelect(currentDataItem, item);
              }
            }

          });
        }
      });

    } else if ($(e.target).attr('class') == 'modal__cancel') {
      closeModal();
    }
    
  });
}

function checkAge(currentObj, birthDate, positionObj, warningText, currentDataItem, item) {

  if (!isEmptyObj(currentObj)) {
    var age = getAge(birthDate);

    if (age < positionObj['min_age'] || age > positionObj['max_age']) {
      var warning = confirm(warningText);
      if (warning) {
        handleSelect(currentDataItem, item);
      }

    } else {
      handleSelect(currentDataItem, item);
    }

  } else {
    handleSelect(currentDataItem, item);
  }
}

function handleSelect(currentDataItem, item) {
  $.extend(true, currentDataItem, item);
  showSelect(item);
  closeModal();
}

function showSelect(item) {

  if (modalIdentifier == 'person') {
    $('.block__selected-' + modalIdentifier).html('<span class="block__slected-value">' + item['lastname'] + ' ' + item['middlename'] + 
    ' ' + item['firstname'] + '</span><button class="block__remove-selected-' + modalIdentifier + '">X</button>');
  } else {
    $('.block__selected-' + modalIdentifier).html('<span class="block__slected-value">' + item['name'] + '</span><button class="block__remove-selected-' + modalIdentifier + '">X</button>');
  }

  $('.block__remove-selected-' + modalIdentifier).unbind('click').click(function(e) {
    $(e.target).parent().html('');

    if ($(e.target).hasClass('block__remove-selected-person')) {
      currentPerson = {};
      modalPersonScroll = 0;
    } else if ($(e.target).hasClass('block__remove-selected-position')) {
      currentPosition = {};
      modalPositionScroll = 0;
    } else if ($(e.target).hasClass('block__remove-selected-org')) {
      currentOrg = {};
      modalOrgScroll = 0;
      $('.block__remove-selected-sub').trigger('click');
    } else {
      currentSub = {};
      modalSubScroll = 0;
    }
  });
}

function closeModal() {
  $('.modal__table').empty();
  $('.modal').css('display', 'none');
}

$('.block__button').each(function(i, item) {
  $(item).click(showModal);
});
