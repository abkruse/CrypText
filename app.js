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
        var recips = [];

        for (var d = 0; d < keys.length; d++) {
          var entryId = keys[d];
          var entry = data[entryId];

          messages.push(entry.message);
          recips.push(entry.recipient);
          statuses.push(entry.status);
          dates.push(entry.date);
        }

        $('.user-hist').append('<table class="his-table"><thead><th>Date Sent</th><th>Recipient</th><th>Encoded Message</th><th>Status</th></thead></table>');

        for (var f = 0; f < messages.length; f++) {
          $('.his-table').append('<tr><td>' + dates[f] + '</td><td>' + recips[f] + '</td><td>' + messages[f] + '</td><td>' + statuses[f] + '</td></tr>');
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
            Create.recip = $('#recip').val();

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
        Create.recip = $('#anon-recip').val();
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
      var secArr, numArr, newOrdr, alphaArr, idx, msg, cols, urlEnd;

      cols = Create.secret.length;
      secArr = [];
      alphaArr = [];

      for (var n = 0; n < cols; n++) {
        secArr.push(Create.secret[n]);
        alphaArr.push(Create.secret[n]);
      }

      msg = Create.message.replace(/[.,\/@#?!$%\^&\*;:{}=\-_`~()]/g,"");
      msg = msg.replace(/\s+/g, '');

      if (msg.length % cols !== 0) {
        for (var i = 0; i <= msg.length % cols; i++ ) {
          msg += 'x';
        }
      }

      numArr = msg.length / cols;

      newOrdr = [];
      alphaArr.sort();

      for (var m = 0; m < secArr.length; m++) {
        newOrdr.push(secArr.indexOf(alphaArr[m]));
        secArr.splice(newOrdr[m], 1, '*');
      }

      var encrypted = '';

      for (var y = 0; y < newOrdr.length; y++) {
        var start = newOrdr[y];

        for (var z = 0; z < numArr; z++) {
          idx = start + (z * newOrdr.length);
          encrypted += msg.charAt(idx);
        }
      }

      var date = new Date();
      var today = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear().toString().substr(2, 2);

      ref.push({
        name: Create.name,
        recipient: Create.recip,
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

      $('form').attr('class', 'hide');
      $('h4').attr('class', 'hide');

      $('.a-header').after('<p class="msg"> The encrypted message: <br />' + encrypted + '<br /> <br /> Use this keycode with the message to crack the code: <br />' + urlEnd + '</p>');
      $('.msg').after('<a class="email-msg" href="mailto:%20?to&body=' + output + '&subject=Cryptext%20Message">Want to Email It?</a>');
    };

    $('.decoder-ring').on('click', function(e) {
      var alphaPass, data, decodePass, decodedMsg, fbMessage, fbSecret, fbUrl, idx, newOrdr, numArr, returnMsg, secret, senderName, splitMsg, usrUrl;

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

          returnMsg = '';

          for (var y = 0; y < fbMessage.length; y++) {
            returnMsg += fbMessage.charAt(y);
          }

          decodePass = [];
          alphaPass = [];

          for (var i = 0; i < secret.length; i++) {
            decodePass.push(secret.charAt(i));
            alphaPass.push(secret.charAt(i));
          }

          alphaPass.sort();
          numArr = fbMessage.length / secret.length;

          newOrdr = [];

          for (var m = 0; m < decodePass.length; m++) {
            newOrdr.push(alphaPass.indexOf(decodePass[m]));
            alphaPass.splice(newOrdr[m], 1, '*');
          }

          decodedMsg = '';

          for (var j = 0; j < numArr; j++) {
            for (var k = 0; k < fbSecret.length; k++) {
              var idNum = newOrdr[k];

              idx = j + (numArr * idNum);

              decodedMsg += returnMsg.charAt(idx);
            }
          }
          $('form').attr('class', 'hide');

          $('h1').after('<p> ' + senderName + ' sent you the following message: </p><p>' + decodedMsg + '</p>');
        } else {
          $('form').attr('class', 'hide');

          $('h1').after('<h2>That is incorrect.</h2><p>The passcode is usually one word and is not case sensitive</p><a href="crypt.html"><p class="try-again"> -> Try Again <- </p></a>');
        }
      });
    });
  });
})();
