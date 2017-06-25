(function () {
  'use strict';
  var isLocalhost = Boolean(window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' ||
    // 127.0.0.1/8 is considered localhost for IPv4.
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
  );

  if ('serviceWorker' in navigator &&
    (window.location.protocol === 'https:' || isLocalhost)) {
    navigator.serviceWorker.register('service-worker.js')
      .then(function (registration) {
        // updatefound is fired if service-worker.js changes.
        registration.onupdatefound = function () {
          if (navigator.serviceWorker.controller) {
            var installingWorker = registration.installing;

            installingWorker.onstatechange = function () {
              switch (installingWorker.state) {
                case 'installed':
                  break;

                case 'redundant':
                  throw new Error('The installing ' +
                    'service worker became redundant.');

                default:
                // Ignore
              }
            };
          }
        };
      }).catch(function (e) {
      console.error('Error during service worker registration:', e);
    });
  }
  // Your custom JavaScript goes here
})();

function OneToNine() {

  //VARIABLE
  this.isPlaying = false;
  this.isCountingDown = false; //10 sec
  this.playingTime = 20; //10 sec
  this.rememberTime = 10; //10 sec
  this.answer = [];
  this.intervals = [];

  this.checkSetup();

  this.userPic = document.getElementById('user-pic');
  this.userName = document.getElementById('user-name');
  this.signInButton = document.getElementById('sign-in');
  this.signOutButton = document.getElementById('sign-out');
  this.historyList = document.getElementById('history-list');
  this.showSnackbarButton = document.getElementById('show-snackbar-button');
  this.singleHistorySection = document.getElementById('single-history-section');
  this.progresBarHistory = document.getElementById('progress-bar-history');
  this.profileContainer = document.getElementById('profile-container');

  this.signOutButton.addEventListener('click', this.signOut.bind(this));
  this.signInButton.addEventListener('click', this.signIn.bind(this));

  for (var i = 0; i < 9; i++) {
    //var slot = $('#slot' + (i + 1));
    //slot.find('p').text(array[i]);
    //slot.click(this.selectSingleBoard);
    document.getElementById('slot' + (i + 1)).addEventListener('click', this.selectSingleBoard.bind(this));
    //slot.click(this.selectSingleBoard.bind(this));
  }
  this.loadSingleHistory();
  this.initSingleBoardGame();

  this.initFirebase();
}


OneToNine.prototype.checkSetup = function () {
  if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
    window.alert('You have not configured and imported the Firebase SDK. ' +
      'Make sure you go through the codelab setup instructions and make ' +
      'sure you are running the codelab using `firebase serve`');
  }
};

// Signs-in
OneToNine.prototype.signIn = function () {
  // Sign in Firebase using popup auth and Google as the identity provider.
  var provider = new firebase.auth.GoogleAuthProvider();
  this.auth.signInWithPopup(provider);
};

// Signs-out
OneToNine.prototype.signOut = function () {
  this.auth.signOut();
};

// Loads chat messages history and listens for upcoming ones.
OneToNine.prototype.loadSingleHistory = function () {
  this.progresBarHistory.removeAttribute('hidden');
  if (firebase.auth().currentUser) {
    this.historiesRef = this.database.ref('s_histories');
    var setMessage = function (data) {
      this.historyList.innerHTML = this.renderHistoryList(true, data.val());
    }.bind(this);
    this.historiesRef.off();
    this.historiesRef.orderByChild('playedDate').limitToLast(10).on('value', setMessage);
  } else {
    var oldHistory = JSON.parse(localStorage.getItem('s_histories_local')) || [];
    this.historyList.innerHTML = this.renderHistoryList(true, oldHistory);
  }
  this.progresBarHistory.setAttribute('hidden', 'true');
  //this.historiesRef.limitToLast(12).on('child_added', setMessage);
  //this.historiesRef.limitToLast(12).on('child_changed', setMessage);
};

// Initiate firebase auth, database and storage.
OneToNine.prototype.initFirebase = function () {
  this.auth = firebase.auth();
  this.database = firebase.database();
  this.storage = firebase.storage();
  // Initiates Firebase auth and listen to auth state changes.
  this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
};

// Triggers when the auth state change for instance when the user signs-in or signs-out.
OneToNine.prototype.onAuthStateChanged = function (user) {
  this.progresBarHistory.removeAttribute('hidden');
  if (user) { // User is signed in!
    var profilePicUrl = user.photoURL;
    var userName = user.displayName;

    this.userPic.setAttribute('src', profilePicUrl || 'images/profile_placeholder.png');
    this.userName.textContent = userName;
    this.userName.removeAttribute('hidden');
    this.profileContainer.removeAttribute('hidden');
    this.signOutButton.removeAttribute('hidden');

    // Hide sign-in button.
    this.signInButton.setAttribute('hidden', 'true');
    //this.singleHistorySection.removeAttribute('hidden');

    //Synchronize local data
    this.synLocalHistory();
    // Load history online
    this.loadSingleHistory();

    //Save device token to push notification
    this.saveMessagingDeviceToken();
  } else { // User is signed out!
    // Hide user's profile and sign-out button.
    this.userName.textContent = '';
    this.userName.setAttribute('hidden', 'true');
    this.signOutButton.setAttribute('hidden', 'true');
    this.profileContainer.setAttribute('hidden', 'true');
    //this.singleHistorySection.setAttribute('hidden', 'true');

    // Show sign-in button.
    this.signInButton.removeAttribute('hidden');
  }
  this.progresBarHistory.setAttribute('hidden', 'true');
};

OneToNine.prototype.initSingleBoardGame = function () {
  this.isPlaying = false;
  this.isCountingDown = false;
  this.answer = [];
  this.cleanTimers();
  const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  var array = [];

  var countDownSection = $('.count-down-section').find('p');
  countDownSection.text("");
  while (numbers.length > 0) {
    var index = Math.floor((Math.random() * (numbers.length - 1)));
    array.push(numbers[index]);
    numbers.splice(index, 1);
  }

  for (var i = 0; i < 9; i++) {
    var slot = $('#slot' + (i + 1));
    slot.find('p').text(array[i]);
    //slot.click(this.selectSingleBoard);
    //document.getElementById('slot' + (i + 1)).addEventListener('click', this.selectSingleBoard.bind(this));
    //slot.click(this.selectSingleBoard.bind(this));
  }
};

OneToNine.prototype.handleCountDown = function () {
  var countDownSection = $('.count-down-section').find('p');
  countDownSection.text(this.playingTime--);
  if (this.playingTime === 0 || this.isPlaying === false) {
    //alert("lose OR isplaying == false");
    this.playingTime = 20;
    countDownSection.text("");
    this.cleanTimers();
    this.initSingleBoardGame();
  }
};

OneToNine.prototype.singleCountDown = function () {
  if (this.isCountingDown && this.isPlaying) {
    this.intervals.push(window.setInterval(this.handleCountDown.bind(this), 1000));
  }
};

OneToNine.prototype.cleanTimers = function () {
  for (var i = 0; i < this.intervals.length; i++) {
    window.clearTimeout(this.intervals[i]);
  }
  this.intervals = [];
};

OneToNine.prototype.selectSingleBoard = function (e) {
  this.isPlaying = true;
  var selectedValue = parseInt(e.currentTarget.innerText);
  if (!this.isCountingDown) {
    this.isCountingDown = true;
    //this.singleCountDown();
  }

  if (this.isPlaying) {
    if (this.answer.length === 0 && selectedValue === 1) {
      this.answer.push(selectedValue);
    } else if (this.answer.length > 0 && this.answer.length < 8 && this.answer[this.answer.length - 1] === selectedValue - 1) {
      this.answer.push(selectedValue);
    } else if (this.answer.length === 8 && selectedValue === 9) {
      //console.log("last chose is true");
      this.answer.push(selectedValue);
      this.toastSuccessMessage('Congratulation!! You win... (y)');
      this.addSingleHistory(new sHistory(this.userName.textContent, $.now(), 'w'));
      //console.log("new board is loading");
      this.initSingleBoardGame();
    } else {
      this.toastFailMessage('Give up pls!! Loser :)');
      //console.log("new board is loading");
      this.addSingleHistory(new sHistory(this.userName.textContent, $.now(), 'l'));
      this.initSingleBoardGame();
    }
  }
  console.log(selectedValue);
};

OneToNine.prototype.addSingleHistory = function (history) {
  var user = firebase.auth().currentUser;
  //in case user logged in --> data will be syn by Fire base database offline
  if (user !== null) {
    this.historiesRef = this.database.ref('s_histories');
    var newHistory = this.historiesRef.push();
    history.id = newHistory.key;
    newHistory.set(history);
    console.log("Add Single history successful ", newHistory.toString());
  } else { //in case user logged in data will be keep in local storage that will be syn later
    //Save to localStorage that will be syn later
    this.storageLocal(history);
    this.historyList.innerHTML = this.renderHistoryItem(history) + this.historyList.innerHTML;
  }
};

OneToNine.prototype.renderHistoryList = function (isSingle, historyList) {
  var result = '';
  var template = this.S_HISTORY_TEMPLATE;
  $.each(historyList, function () {
    var cpTemplate = template;
    cpTemplate = cpTemplate.replace("%USER_NAME%", this.userName || "OFFLINE-ER");
    cpTemplate = cpTemplate.replace("%PLAYED_DATE%", this.playedDate);
    cpTemplate = cpTemplate.replace("%ICON_STATUS%", this.status === 'w' ? "mood" : "mood_bad");
    cpTemplate = cpTemplate.replace("%ICON_SYN%", this.id ? "sync" : "sync_disabled");
    result = cpTemplate + result;
  });
  return result;
};

OneToNine.prototype.renderHistoryItem = function (history) {
  var item = this.S_HISTORY_TEMPLATE;
  item = item.replace("%USER_NAME%", history.username || "OFFLINE-ER");
  item = item.replace("%PLAYED_DATE%", history.playedDate);
  item = item.replace("%ICON_STATUS%", history.status === 'w' ? "mood" : "mood_bad");
  item = item.replace("%ICON_SYN%", history.id ? "sync" : "sync_disabled");
  return item;
};

OneToNine.prototype.toastSuccessMessage = function (msg) {
  var data = {message: msg, timeout: 2000};
  this.showSnackbarButton.style.backgroundColor = '#1abc9c';
  this.showSnackbarButton.MaterialSnackbar.showSnackbar(data);
};

OneToNine.prototype.toastFailMessage = function (msg) {
  var data = {message: msg, timeout: 2000};
  this.showSnackbarButton.style.backgroundColor = '#e74c3c';
  this.showSnackbarButton.MaterialSnackbar.showSnackbar(data);
};

// Saves the messaging device token to the datastore.
OneToNine.prototype.saveMessagingDeviceToken = function () {
  firebase.messaging().getToken().then(function (currentToken) {
    if (currentToken) {
      //console.log('Got FCM device token:', currentToken);
      // Saving the Device Token to the datastore.
      firebase.database().ref('/fcmTokens').child(currentToken)
        .set(firebase.auth().currentUser.uid);
    } else {
      // Need to request permissions to show notifications.
      this.requestNotificationsPermissions();
    }
  }.bind(this)).catch(function (error) {
    console.error('Unable to get messaging token.', error);
  });
};

// Requests permissions to show notifications.
OneToNine.prototype.requestNotificationsPermissions = function () {
  console.log('Requesting notifications permission...');
  firebase.messaging().requestPermission().then(function () {
    // Notification permission granted.
    this.saveMessagingDeviceToken();
  }.bind(this)).catch(function (error) {
    console.error('Unable to get permission to notify.', error);
  });
};

OneToNine.prototype.sendInvitationGame = function () {

};

OneToNine.prototype.sendThankSubscribing = function () {

};

OneToNine.prototype.storageLocal = function (history) {
  var oldHistory = JSON.parse(localStorage.getItem('s_histories_local')) || [];
  oldHistory.push(history);
  if (oldHistory.length === 6) { //Suport max 5 items latest offline
    oldHistory.splice(0, 1);
  }
  localStorage.setItem('s_histories_local', JSON.stringify(oldHistory));
  console.log('Data has been saved');
};

OneToNine.prototype.synLocalHistory = function () {
  var oldHistory = JSON.parse(localStorage.getItem('s_histories_local')) || [];

  for (var i = 0; i < oldHistory.length; i++) {
    this.addSingleHistory(oldHistory);
  }
  localStorage.removeItem('s_histories_local');
  console.log('Local data have been syn-ed');
};


OneToNine.prototype.S_HISTORY_TEMPLATE =
  '<li class="mdl-list__item mdl-list__item--two-line">' +
  '<span class="mdl-list__item-primary-content">' +
  '<span>%USER_NAME%</span>' +
  '<span class="mdl-list__item-sub-title">%PLAYED_DATE%</span></span>' +
  '<span class="mdl-list__item-secondary-content">' +
  '<span class="mdl-list__item-secondary-action"><i class="icon material-icons" style="font-size: 40px;">%ICON_STATUS%</i></span></span>' +
  '<span class="mdl-list__item-secondary-content"><i class="icon material-icons" style="font-size: 20px;">%ICON_SYN%</i></span></li>';

window.onload = function () {
  window.document.addEventListener('touchstart', function (e) {
    console.log(e.defaultPrevented);  // will be false
    e.preventDefault();   // does nothing since the listener is passive
    console.log(e.defaultPrevented);  // still false
  }, {passive: true});
  window.oneToNine = new OneToNine();
};

function sHistory(userName, playedDate, status) {
  this.userName = userName;
  this.playedDate = playedDate;
  this.status = status;
}
