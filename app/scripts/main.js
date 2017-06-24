/*!
 *
 *  Web Starter Kit
 *  Copyright 2015 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */
/* eslint-env browser */

(function () {
  'use strict';

  // Check to make sure service workers are supported in the current browser,
  // and that the current page is accessed from a secure origin. Using a
  // service worker from an insecure origin will trigger JS console errors. See
  // http://www.chromium.org/Home/chromium-security/prefer-secure-origins-for-powerful-new-features
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
          // updatefound is also fired the very first time the SW is installed,
          // and there's no need to prompt for a reload at that point.
          // So check here to see if the page is already controlled,
          // i.e. whether there's an existing service worker.
          if (navigator.serviceWorker.controller) {
            // The updatefound event implies that registration.installing is set:
            // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-container-updatefound-event
            var installingWorker = registration.installing;

            installingWorker.onstatechange = function () {
              switch (installingWorker.state) {
                case 'installed':
                  // At this point, the old content will have been purged and the
                  // fresh content will have been added to the cache.
                  // It's the perfect time to display a "New content is
                  // available; please refresh." message in the page's interface.
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
  this.userUUID = '';

  this.checkSetup();

  this.userPic = document.getElementById('user-pic');
  this.userName = document.getElementById('user-name');
  this.signInButton = document.getElementById('sign-in');
  this.signOutButton = document.getElementById('sign-out');
  this.historyList = document.getElementById('history-list');
  this.showSnackbarButton = document.getElementById('show-snackbar-button');
  this.singleHistorySection = document.getElementById('single-history-section')

  this.signOutButton.addEventListener('click', this.signOut.bind(this));
  this.signInButton.addEventListener('click', this.signIn.bind(this));

  //this.fetchHistoriesBtn = document.getElementById('test-histories-list');
  //this.fetchHistoriesBtn.addEventListener('click', this.loadSingleHistory.bind(this));

  for (var i = 0; i < 9; i++) {
    //var slot = $('#slot' + (i + 1));
    //slot.find('p').text(array[i]);
    //slot.click(this.selectSingleBoard);
    document.getElementById('slot' + (i + 1)).addEventListener('click', this.selectSingleBoard.bind(this));
    //slot.click(this.selectSingleBoard.bind(this));
  }
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
  this.historiesRef = this.database.ref('s_histories');
  var setMessage = function (data) {
    this.historyList.innerHTML = this.renderHistoryList(true, data.val());
  }.bind(this);
  this.historiesRef.off();
  this.historiesRef.on('value', setMessage);

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
  if (user) { // User is signed in!
    var profilePicUrl = user.photoURL;
    var userName = user.displayName;

    this.userPic.style.backgroundImage = 'url(' + (profilePicUrl || '/images/profile_placeholder.png') + ')';
    this.userName.textContent = userName;

    this.userName.removeAttribute('hidden');

    //this.userPic.attr('src', profilePicUrl || '/images/profile_placeholder.png');
    this.userPic.removeAttribute('hidden');
    this.signOutButton.removeAttribute('hidden');

    // Hide sign-in button.
    this.signInButton.setAttribute('hidden', 'true');
    this.singleHistorySection.removeAttribute('hidden');

    this.userUUID = user.uid;
    // Load history online
    this.loadSingleHistory();

    // Push offline history to online

    //Save divice token to push notification
    this.saveMessagingDeviceToken();
  } else { // User is signed out!
    this.userUUID = '';
    // Hide user's profile and sign-out button.
    this.userName.setAttribute('hidden', 'true');
    this.userPic.setAttribute('hidden', 'true');
    this.signOutButton.setAttribute('hidden', 'true');
    this.singleHistorySection.setAttribute('hidden', 'true');

    // Show sign-in button.
    this.signInButton.removeAttribute('hidden');
  }
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
      this.toastSuccessMessage('Congratulation!! You win...');
      this.addSingleHistory(new sHistory(this.userUUID, $.now(), 'w'));
      //console.log("new board is loading");
      this.initSingleBoardGame();
    } else {
      this.toastFailMessage('Give up pls!! Loser');
      //console.log("new board is loading");
      this.addSingleHistory(new sHistory(this.userUUID, $.now(), 'l'));
      this.initSingleBoardGame();
    }
  }
  console.log(selectedValue);
};

OneToNine.prototype.addSingleHistory = function (history) {
  this.historiesRef = this.database.ref('s_histories');
  var newHistory = this.historiesRef.push();
  history.id = newHistory.key;
  newHistory.set(history);
  console.log("Add Single history successful ", newHistory.toString());
};

OneToNine.prototype.renderHistoryList = function (isSingle, historyList) {
  var result = '';
  $.each(historyList, function () {

    var playedDate = this.playedDate;
    var template =
      '<li class="mdl-list__item mdl-list__item--two-line">' +
      '<span class="mdl-list__item-primary-content">' +
      '<i class="material-icons mdl-list__item-avatar">person</i>' +
      '<span>' + this.id + '</span>' +
      '<span class="mdl-list__item-sub-title">' + playedDate + '</span></span>' +
      '<span class="mdl-list__item-secondary-content">' +
      '<a class="mdl-list__item-secondary-action" href="#">' +
      '<i class="material-icons">' + (this.status === 'w' ? "thumb_up" : "thumb_down") +
      '</i></a></span></li>';
    result += template;
  });
  return result;
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
OneToNine.prototype.saveMessagingDeviceToken = function() {
  firebase.messaging().getToken().then(function(currentToken) {
    if (currentToken) {
      //console.log('Got FCM device token:', currentToken);
      // Saving the Device Token to the datastore.
      firebase.database().ref('/fcmTokens').child(currentToken)
        .set(firebase.auth().currentUser.uid);
    } else {
      // Need to request permissions to show notifications.
      this.requestNotificationsPermissions();
    }
  }.bind(this)).catch(function(error){
    console.error('Unable to get messaging token.', error);
  });
};

// Requests permissions to show notifications.
OneToNine.prototype.requestNotificationsPermissions = function() {
  console.log('Requesting notifications permission...');
  firebase.messaging().requestPermission().then(function() {
    // Notification permission granted.
    this.saveMessagingDeviceToken();
  }.bind(this)).catch(function(error) {
    console.error('Unable to get permission to notify.', error);
  });
};

OneToNine.prototype.sendInvitationGame = function() {

};

OneToNine.prototype.sendThankSubscribing = function() {

};


OneToNine.S_HISTORY_TEMPLATE =
  '<li class="mdl-list__item mdl-list__item--two-line">' +
  '<span class="mdl-list__item-primary-content">' +
  '<i class="material-icons mdl-list__item-avatar">person</i>' +
  '<span>%ID%</span>' +
  '<span class="mdl-list__item-sub-title">%PLAYED_DATE%</span></span>' +
  '<span class="mdl-list__item-secondary-content">' +
  '<a class="mdl-list__item-secondary-action" href="#"><i class="material-icons">%STATUS%</i></a></span></li>';

window.onload = function () {
  window.oneToNine = new OneToNine();
};

function sHistory(key, playedDate, status) {
  this.key = key;
  this.playedDate = playedDate;
  this.status = status;
}
