$(document).ready(function() {
  $('.past-activity-paragraph').removeClass('display-none');
  for(var i = 0; i < localStorage.length; i++){
    appendPastActivity(JSON.parse(localStorage.getItem(localStorage.key(i))));
  };
});

$('.select-category-list-items').on('click', function() {
  $('.select-category-list-items.current').removeClass('current');
  $(this).addClass('current');
});

$('.minutes-seconds-input').on('keydown', function(e) {
  let keyCode = e.keyCode;

  keyCode >= 48 && keyCode <= 57 || keyCode === 8 || keyCode === 9 ? null : e.preventDefault();
});

$('#seconds').on('keydown', function(e) {
  let keyCode = e.keyCode;
  let secondsValue = parseInt($('#seconds')[0].value[0]);
  let secondsLength = $('#seconds')[0].value.length;
  $('.timer-error').remove();

  secondsLength >= 2 && keyCode >= 48 && keyCode <= 57 ? e.preventDefault() : null;

  if (secondsValue >= 6 && keyCode >= 48 && keyCode <= 57) {
    e.preventDefault();
    $('.timer-error').remove();
    $('.minutes-seconds-container').append(`
      <h4 class="timer-error">Your seconds timer cannot exceed 59 seconds.</h4>
    `);
  };
});

$('#minutes').on('keydown', function(e) {
  let keyCode = e.keyCode;
  let minutesLength = $('#minutes')[0].value.length;

  minutesLength >= 2 && keyCode >= 48 && keyCode <= 57 ? e.preventDefault() : null;
});

class Activity {
  constructor(category, description, minutes, seconds, pauseMinutes, pauseSeconds) {
    this._category = category;
    this._description = description;
    this.minutes = minutes || 0;
    this.seconds = seconds || 0;
    this.reflection = '';
    this.id = Date.now();
    this.favorite = false;
  };
};

const setTimerText = () => {
  let timerText = $('.start-timer-button')[0].innerText;

  timerText === 'Start' ? $('.start-timer-button')[0].innerText = 'Pause' : $('.start-timer-button')[0].innerText = 'Start';
};

$('.start-activity-button').on('click', function() {
  grabActivity();
});

$('.activity-section').on('click', '.start-timer-button', function() {
  let id = $(this)[0].id;
  let activity = JSON.parse(localStorage.getItem(id));

  setTimerText();

  setTimer(activity);
});

const setTimer = activity => {
  let timer = setInterval(() => {
    let time = $('.current-activity-h2')[0].innerText;
    let minutes = parseInt(time.split(':')[0]);
    let seconds = parseInt(time.slice(-2));
    timerCheck(activity, timer, minutes, seconds);
  }, 1000);
};

const timerCheck = (activity, timer, minutes, seconds) => {
  let timerText = $('.start-timer-button')[0].innerText;

  if (timerText === 'Start') {
    window.clearInterval(timer);
  };

  if (seconds === 0 && timerText === 'Pause') {
    seconds = 59;
    minutes--;
    $('.current-activity-h2').remove();
    appendCurrentActivityTimer(minutes, seconds);
  } else if (seconds >= 1 && timerText === 'Pause') {
    seconds--;
    $('.current-activity-h2').remove();
    appendCurrentActivityTimer(minutes, seconds);
  };

  if (seconds <= 0 && minutes <= 0) {
    $('.start-timer-button')[0].disabled = true;
    window.clearInterval(timer);
    $('.current-activity-h2').remove();
    appendMotivationalMessage();
    appendLogActivityButton(activity);
  };
};

const appendCurrentActivityTimer = (minutes, seconds) => {
  $('.current-activity-h1').append(`
    <h2 class="current-activity-h2">${ ('0' + minutes).slice(-2) }:${ ('0' + seconds).slice(-2) }</h2>
  `);
};

const appendMotivationalMessage = () => {
  $('.current-activity-h1').append(`
    <h2 class="motivational-message">Big life changes happen one day at a time!</h2>
  `);
};

const appendLogActivityButton = activity => {
  $('.current-activity-div').append(`
    <h1>Would you like to reflect on how you spent your time?</h1>
    <textarea autocomplete="on" class="reflection-textarea" rows="1" spellcheck="true"></textarea>
    <button id="${ activity.id }" class="log-activity-button">Log Activity</button>
  `);
};

const addReflectionToActivity = activity => {
  activity.reflection = $('.reflection-textarea')[0].value;
  localStorage.setItem(activity.id, JSON.stringify(activity));
  $('.past-activity-cards').remove();
  for(var i = 0; i < localStorage.length; i++){
    appendPastActivity(JSON.parse(localStorage.getItem(localStorage.key(i))));
  };
};

const completedActivityArticle = () => {
  $('.current-activity-article').remove();

  $('.activity-section').prepend(`
    <article class="completed-activity-article">
      <header class="completed-activity-header">Completed Activity</header>
      <div class="completed-activity-div">
        <button class="create-new-activity-button">Create A New Activity</button>
      </div>
    </article>
  `);
};

$('.activity-section').on('click', '.log-activity-button', function() {
  let id = $(this)[0].id;
  let activity = JSON.parse(localStorage.getItem(id));

  addReflectionToActivity(activity);
  completedActivityArticle();
  clearActivityFields();
});

$('.activity-section').on('click', '.create-new-activity-button', function() {
  $('.completed-activity-article').remove();
  $('.select-activity-article').removeClass('display-none');
});

const appendPastActivity = activity => {
  let capitalizeCategory = activity._category.charAt(0).toUpperCase() + activity._category.slice(1);

  $('.past-activity-paragraph').addClass('display-none');

  $('.past-activity-card-container').prepend(`
    <li class="past-activity-cards" id="${ activity.id }">
      <button class="repeat-past-activity">Repeat Activity</button>
      <div id="past-activity-card-bar" class="past-activity-card-${ activity._category }"></div>
      <button id="favorite-activity-button" class="favorite-activity-icon-${ activity.favorite }"></button>
      <h1 class="past-activity-card-category">${ capitalizeCategory }</h1>
      <h2 class="date-of-activity">
        ${ new Date(activity.id).getMonth() + 1 }/${ new Date(activity.id).getDate() }/${ new Date(activity.id).getFullYear() }
      </h2>
      <h3 class="past-activity-card-time">${ activity.minutes}  MIN ${ activity.seconds } SECONDS</h3>
      <h4 class="past-activity-card-description">${ activity._description }</h4>
      <div class="removeAndMoreInfoButtons">
        <button class="remove-activity-card">Remove</button>
      </div>
    </li>
  `);

  activity.reflection.length > 0 ? appendReflection(activity) : null;
};

const appendReflection = activity => {
  let card = $(`#${ activity.id }.past-activity-cards`);
  let appendArea = $(card).find('.removeAndMoreInfoButtons');

  $(appendArea).append(`
    <button class="past-activity-card-more-info">More Info</button>
    <p id="reflection-id" class="display-none">${ activity.reflection }</p>
  `);
};

$('.past-activity-card-container').on('click', '.remove-activity-card', function() {
  $(this)[0].closest('.past-activity-cards').remove();
  let id = $(this)[0].closest('.past-activity-cards').id;

  localStorage.removeItem(id);

  localStorage.length === 0 ? $('.past-activity-paragraph').removeClass('display-none') : null;
});

$('.past-activity-card-container').on('click', '.past-activity-card-more-info', function() {
  let card = $(this)[0].closest('.past-activity-cards');
  let moreInfoCardId = $(card).find('#reflection-id')[0];

  $(moreInfoCardId).hasClass('display-none') ? $(moreInfoCardId).removeClass('display-none') : $(moreInfoCardId).addClass('display-none');
});

$('.past-activity-card-container').on('click', '#favorite-activity-button', function() {
  let card = $(this)[0].closest('.past-activity-cards');
  let favoriteButton = $(card).find('#favorite-activity-button');
  let id = parseInt($(card)[0].id);
  let activity = JSON.parse(localStorage.getItem(id));

  favoriteButton.removeClass(`favorite-activity-icon-${ activity.favorite }`);

  activity.favorite ? activity.favorite = false : activity.favorite = true;

  favoriteButton.addClass(`favorite-activity-icon-${ activity.favorite }`);

  localStorage.setItem(id, JSON.stringify(activity));
});

const appendCurrentActivity = activity => {
  let minutes = activity.minutes;
  let seconds = activity.seconds;

  $('.select-activity-article').addClass('display-none');

  $('.activity-section').prepend(`
    <article class="current-activity-article">
      <header class="activity-header">Current Activity</header>
      <div class="current-activity-div">
        <h1 class="current-activity-h1">${ activity._description }</h1>
        <button id="${ activity.id }" class="start-timer-button current-activity-start-${ activity._category } set-user-timestamp">Start</button>
      </div>
    </article>
  `);

  localStorage.setItem(activity.id, JSON.stringify(activity));
  appendCurrentActivityTimer(minutes, seconds);
};

const checkCategory = category => {
  $('.category-error').remove();

  return new Promise((resolve, reject) => {
    if (!category) {
      $('.select-category-list-div').append(`
        <h4 class="category-error">You need to select a category.</h4>
      `);
    } else {
      resolve(true);
    };
  });
};

const checkDescription = description => {
  $('.description-error').remove();

  return new Promise((resolve, reject) => {
    if (description.length <= 0) {
      $('.description-div').append(`
        <h4 class="description-error">You need to add a description to your activity.</h4>
      `);
    } else {
      resolve(true);
    };
  });
};

const checkTime = (minutes, seconds) => {
  $('.timer-error').remove();

  return new Promise((resolve, reject) => {
    if (minutes.length === 0 && seconds.length === 0) {
      $('.minutes-seconds-container').append(`
        <h4 class="timer-error">You need to have time for your activity to start.</h4>
      `);
    } else {
      resolve(true);
    };
  });
};

const checkForRequiredFields = async (category, description, minutes, seconds) => {
  let categoryChecked = await checkCategory(category);
  let descriptionChecked = await checkDescription(description);
  let timeChecked = await checkTime(minutes, seconds);

  if(categoryChecked && descriptionChecked && timeChecked) {
    const activity = new Activity(category.id, description, minutes, seconds);
    appendCurrentActivity(activity);
    clearActivityFields();
  };
};

const grabActivity = () => {
  const category = $('li.current')[0];
  const description = $('#description')[0].value;
  const minutes = $('#minutes')[0].value;
  const seconds = $('#seconds')[0].value;

  checkForRequiredFields(category, description, minutes, seconds);
};

const clearActivityFields = () => {
  $('li.current').removeClass('current');
  $('#description')[0].value = '';
  $('#minutes')[0].value = '';
  $('#seconds')[0].value = '';
};

const createNewPastActivity = activity => {
  const pastActivity = JSON.parse(localStorage.getItem(activity.id));

  if(pastActivity.reflection !== activity.reflection && activity.reflection.length > 0) {
    const newActivity = new Activity(activity._category, activity._description, activity.minutes, activity.seconds);
    newActivity.reflection = activity.reflection;
    localStorage.setItem(newActivity.id, JSON.stringify(newActivity));
    appendPastActivity(newActivity);
  };
};

$('.filter-list-buttons').on('click', function() {
  const activityFilterCategory = $(this)[0].innerText.toLowerCase();

  filteredItems(activityFilterCategory);
});

const filterArray = (array, category) => {
  return filteredArray = array.filter(activity => {
    if(activity[category]) {
      return activity;
    };
    return activity._category === category;
  });
};

const appendFilteredCards = (localStorageArray, filteredCards, activityFilterCategory) => {
  if(filteredCards.length === 0) {
    $('.filter-cards-error').remove();
    $('.past-activity-and-filter').append(`
      <h2 class="filter-cards-error">You do not have any ${ activityFilterCategory } cards to display.</h2>
    `);
    localStorageArray.forEach(activity => {
      appendPastActivity(activity);
    });
  } else {
    $('.filter-cards-error').remove();
    filteredCards.forEach(activity => {
      appendPastActivity(activity);
    });
  };
};

const filteredItems = activityFilterCategory => {
  let arr = [];

  for(var i = 0; i < localStorage.length; i++){
    arr.push(JSON.parse(localStorage.getItem(localStorage.key(i))));
  };

  let filteredCards = filterArray(arr, activityFilterCategory);

  $('.past-activity-cards').remove();

  appendFilteredCards(arr, filteredCards, activityFilterCategory);
};

$('.past-activity-card-container').on('click', '.repeat-past-activity', function() {
  let id = $(this).closest('.past-activity-cards')[0].id;
  let activity = JSON.parse(localStorage.getItem(id));
  let newActivity = new Activity(activity._category, activity._description, activity.minutes, activity.seconds);
  $('.current-activity-article').remove();
  appendCurrentActivity(newActivity);
  $('.completed-activity-article').remove();
});
