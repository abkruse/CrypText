(function() {
  'use strict';

  $(document).ready(function() {
    var Create;

    var ref = new Firebase('https://cryptext.firebaseio.com/');

    var Instance = function(name, secret, message, userId) {
      this.name = name;
      this.secret = secret;
      this.message = message;
      this.userId = userId;
      this.status = 'sent';
    };

    if (sessionStorage.id !== undefined) {
      $('.login-create').before('<a href="history.html"><h3 class="history">My History</h3></a>');

      $('.login-create').text('Logged In');
      $('.return').remove();

      ref.orderByChild('userId').equalTo(sessionStorage.id).on('value', function(snapshot) {
        var data = snapshot.val();
        var keys = Object.keys(data);
        var messages = [];
        var statuses = [];
        var dates = [];
        var names = [];

        for (var d = 0; d < keys.length; d++) {
          var entryId = keys[d];
          var entry = data[entryId];

          messages.push(entry.message);
          names.push(entry.name);
          statuses.push(entry.status);
          dates.push(entry.date);
        }

        $('.user-hist').append('<table class="his-table"><thead><th>Date Sent</th><th>Recipient</th><th>Encoded Message</th><th>Status</th></thead></table>');

        for (var f = 0; f < messages.length; f++) {
          $('.his-table').append('<tr><td>' + dates[f] + '</td><td>' + names[f] + '</td><td>' + messages[f] + '</td><td>' + statuses[f] + '</td></tr>');
        }
      });
    }

    $('.login-btn').on('click', function(e) {
      e.preventDefault();

      ref.authWithPassword({
        'password': $('.user-password').val(),
        'email': $('.user-email').val()
      }, function(error, authData) {
        if (error) {
          $('.email-div').attr('class', 'animated email-div shake');
          $('.pass-div').attr('class', 'animated pass-div shake');
        } else {
          sessionStorage.id = authData.uid;
          location.href = 'index.html';
        }
      });
    });

    $('.return').on('click', function(e){
      e.preventDefault();

      $('.login-user').attr('class', 'login-user');
      $('encrypt-mess').attr('class', 'encrypt-mess');
      $('.anon-encrypt-mess').attr('class', 'anon-encrypt-mess hide');
    });

    $('.done').on('click', function(e) {
      e.preventDefault();

      ref.authWithPassword({
        'password': $('.user-password').val(),
        'email': $('.user-email').val()
      }, function(error, authData) {
        if(error) {
          $('.email-div').attr('class', 'animated email-div shake');
          $('.pass-div').attr('class', 'animated pass-div shake');
        } else {
          sessionStorage.id = authData.uid;

          if (!$('#name').val()) {
            $('#name').attr('class', 'animated shake');
          } else if (!$('#secret-word').val()) {
            $('#secret-word').attr('class', 'animated shake');
          } else if (!$('#message').val()) {
            $('#message').attr('class', 'animated shake');
          } else {
            Create = new Instance();

            Create.name = $('#name').val();
            Create.secret = $('#secret-word').val().toLowerCase();
            Create.message = $('#message').val();
            Create.userId = sessionStorage.id;

            encryption();
          }
        }
      });
    });

    $('.create-user').on('click', function(e) {
      e.preventDefault();

      ref.createUser({
        name: $('.create-name').val(),
        email: $('.create-email').val(),
        password: $('.create-password').val()
      }, function(error, userData) {
        if (error) {
          switch (error.code) {
            case 'EMAIL_TAKEN' :
              $('.create-email').after('<p>This email already has an account.</p>');
              break;
            case 'INVALID_EMAIL':
              $('.create-new').attr('class', 'animated create-new shake');
              break;
            default:
              $('.create-new').attr('class', 'animated create-new shake');
          }
        } else {
          location.href = 'index.html';
          sessionStorage.id = userData.uid;
        }
      });
    });

    $('.anon-done').on('click', function(e) {
      e.preventDefault();

      if (!$('#anon-name').val()) {
        $('#anon-name').attr('class', 'animated shake');
      } else if (!$('#anon-secret-word').val()) {
        $('#anon-secret-word').attr('class', 'animated shake');
      } else if (!$('#anon-message').val()) {
        $('#anon-message').attr('class', 'animated shake');
      } else {
        Create = new Instance();

        Create.name = $('#anon-name').val();
        Create.secret = $('#anon-secret-word').val().toLowerCase();
        Create.message = $('#anon-message').val();
        if (sessionStorage.id !== undefined) {
          Create.userId = sessionStorage.id;
        } else {
          Create.userId = '0000';
        }
        encryption();
      }
    });

    var encryption = function() {
      var secArr, messArr, numArr, splitMsg, newOrdr, alphaArr, idx, encMsgArr, msg, cols, urlEnd;

      cols = Create.secret.length;
      secArr = [];
      alphaArr = [];
      messArr = [];

      for (var n = 0; n < cols; n++) {
        secArr.push(Create.secret[n]);
        alphaArr.push(Create.secret[n]);
      }

      msg = Create.message.replace(/[.,\/@#?!$%\^&\*;:{}=\-_`~()]/g,"");
      msg = msg.replace(/\s+/g, '');

      for (var j = 0; j < msg.length; j++) {
        messArr.push(msg.charAt(j));
      }

      if (Create.message.length % cols !== 0) {
        for (var i = 0; i <= messArr.length % cols; i++ ){
          messArr.push('x');
        }
      }

      numArr = messArr.length / cols;
      splitMsg = [];

      for (var k = 0; k < numArr; k++) {
        splitMsg.push(messArr.splice(0, cols));
      }

      newOrdr = [];
      alphaArr.sort();

      for (var m = 0; m < secArr.length; m++ ) {
        newOrdr.push(alphaArr.indexOf(secArr[m]));
        alphaArr.splice(newOrdr[m], 1, '*');
      }

      encMsgArr = [];

      for (var y = 0; y < newOrdr.length; y++) {
        idx = newOrdr.indexOf(y);
        for (var z = 0; z < numArr; z++) {
          encMsgArr.push(splitMsg[z][idx]);
        }
      }

      var encrypted = encMsgArr.join('');

      var date = new Date();
      var today = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear().toString().substr(2, 2);

      ref.push({
        name: Create.name,
        secret: Create.secret,
        message: encrypted,
        userId: Create.userId,
        status: 'sent',
        date: today
      });

      ref.limitToLast(1).on('child_added', function(snapshot) {
        urlEnd = snapshot.key();
      });

      var output = Create.name + '%20says:%20' + encrypted + '.%20Your%20keycode is%20' + urlEnd + '.%20Go%20to%20http://www.cryptext.com%20to%20crack%20the%20code.';

      setTimeout(function(){
        $('form').attr('class', 'hide');
        $('h4').attr('class', 'hide');

        $('.a-header').after('<p class="msg"> The encrypted message: <br />' + encrypted + '<br /> <br /> Use this keycode with the message to crack the code: <br />' + urlEnd + '</p>');
        $('.msg').after('<a class="email-msg" href="mailto:%20?to&body=' + output + '&subject=Cryptext%20Message">Want to Email It?</a>');
      }, 200);
    };

    $('.decoder-ring').on('click', function(e) {
      var alphaPass, data, decodePass, decodedArr, decodedMsg, fbMessage, fbSecret, fbUrl, idx, jmbleMsg, mixMsg, newOrdr, numArr, returnMsg, roteMsg, secret, senderName, splitMsg, usrUrl;

      e.preventDefault();

      secret = $('#secret-word').val().toLowerCase();
      usrUrl = $('#url').val();
      fbUrl = 'https://cryptext.firebaseio.com/' + usrUrl + '';

      var instRef = new Firebase(fbUrl);

      instRef.on('value', function(snapshot) {
        data = snapshot.val();
        senderName = data.name;
        fbSecret = data.secret;
        fbMessage = data.message;

        if (fbSecret === secret) {
          instRef.update({ status: 'opened' });

          returnMsg = [];

          for (var y = 0; y < fbMessage.length; y++) {
            returnMsg.push(fbMessage.charAt(y));
          }

          decodePass = [];
          alphaPass = [];

          for (var i = 0; i < secret.length; i++) {
            decodePass.push(secret.charAt(i));
            alphaPass.push(secret.charAt(i));
          }

          alphaPass.sort();
          jmbleMsg = [];
          numArr = fbMessage.length / secret.length;

          for (var l = 0; l < numArr; l++) {
            for (var j = l; j < fbMessage.length; j += numArr) {
              jmbleMsg.push(returnMsg[j]);
            }
          }

          splitMsg = [];

          for (var p = 0; p < numArr; p++) {
            splitMsg.push(jmbleMsg.splice(0, secret.length));
          }

          newOrdr = [];

          for (var m = 0; m < decodePass.length; m++ ) {
            newOrdr.push(decodePass.indexOf(alphaPass[m]));
            decodePass.splice(newOrdr[m], 1, '*');
          }

          mixMsg = [];
          roteMsg = [];

          for (var z = 0; z < newOrdr.length; z++) {
            idx = newOrdr.indexOf(z);

            for(var x = 0; x < numArr; x++) {
              mixMsg.push(splitMsg[x][idx]);
            }
            roteMsg.push(mixMsg.splice(0, numArr));
          }
          decodedArr = [];

          for (var a = 0; a < numArr; a++ ) {
            for (var b = 0; b < secret.length; b++) {
              decodedArr.push(roteMsg[b][a]);
            }
          }
          decodedMsg = decodedArr.join('');

          setTimeout(function(){
            $('form').attr('class', 'hide');

            $('.hide').after('<p> ' + senderName + ' sent you the following message: </p><p>' + decodedMsg + '</p>');
           }, 200);
        } else {
          $('form').attr('class', 'hide');

          $('h1').after('<h2>That is incorrect.</h2><p>The passcode is usually one word and is not case sensitive</p><a href="crypt.html"><p class="try-again"> -> Try Again <- </p></a>');
        }
      });
    });
  });
})();
