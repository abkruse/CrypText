(function() {
  'use strict';

  $(document).ready(function() {
    var Create;

    var ref = new Firebase('https://cryptext.firebaseio.com/');

    var Instance = function (name, secret, message) {
      this.name = name;
      this.secret = secret;
      this.message = message;
    };

    $('.done').on('click', function(e) {
      e.preventDefault();

      Create = new Instance();

      Create.name = $('#name').val();
      Create.secret = $('#secret-word').val().toLowerCase();
      Create.message = $('#message').val();

      encryption();
    });

    var encryption = function() {
    var secArr, messArr, numArr, splitMsg, newOrdr, alphaArr, idx, encMsgArr, getURL, decode, msg, cols, urlEnd;

      cols = Create.secret.length;
      secArr = [];
      alphaArr = [];
      messArr = [];

      for(var n = 0; n < cols; n ++){
        secArr.push(Create.secret[n]);
        alphaArr.push(Create.secret[n]);
      }

      msg = Create.message.replace(/[.,\/@#?!$%\^&\*;:{}=\-_`~()]/g,"");
      msg = msg.replace(/\s+/g, '');

      for (var j = 0; j < msg.length; j++) {
        messArr.push(msg.charAt(j));
      }

      if (Create.message.length % cols !== 0) {
        for(var i = 0; i <= messArr.length % cols; i++ )
          messArr.push('x');
      }

      numArr = messArr.length / cols;
      splitMsg = [];

      for(var k = 0; k < numArr; k ++) {
        splitMsg.push(messArr.splice(0, cols));
      }

      newOrdr = [];
      alphaArr.sort();

      for (var m = 0; m < secArr.length; m++ ) {
        newOrdr.push(alphaArr.indexOf(secArr[m]));
        alphaArr.splice(newOrdr[m], 1, '*');
      }

      encMsgArr = [];

      for(var y = 0; y < newOrdr.length; y++) {
        idx = newOrdr.indexOf(y);
        for(var z = 0; z < numArr; z++) {
          encMsgArr.push(splitMsg[z][idx]);
        }
      }

      var encrypted = encMsgArr.join('');

      ref.push({
        name: Create.name,
        secret: Create.secret,
        message: encrypted
      });

      ref.limitToLast(1).on("child_added", function(snapshot) {
        urlEnd = snapshot.key();
      });

      setTimeout(function(){
        $('form').attr('class', 'hide');

        $('form').after('<p class="msg"> The encrypted message: <br />' + encrypted + '</p>');

        $('.msg').after('<p class="keycode"> Send this keycode with the message to crack the code: <br />' + urlEnd + '</p>');
      }, 200);

    };

    $('.decoder-ring').on('click', function(e){
      var secret, usrUrl, senderName, fbUrl, fbSecret, data, fbMessage, returnMsg, decodePass, alphaPass, jmbleMsg, mixMsg, roteMsg, decodedArr, decodedMsg, newOrdr, splitMsg, numArr, idx;

      e.preventDefault();

      secret = $('#secret-word').val().toLowerCase();
      usrUrl = $('#url').val();
      fbUrl = 'https://cryptext.firebaseio.com/' + usrUrl + '';

      var instRef = new Firebase (fbUrl);

      instRef.on("value", function(snapshot) {
        data = snapshot.val();
        senderName = data.name;
        fbSecret = data.secret;
        fbMessage = data.message;

        if (fbSecret === secret) {

          returnMsg = [];

          for (var y = 0; y < fbMessage.length; y ++) {
            returnMsg.push(fbMessage.charAt(y));
          }

          decodePass = [];
          alphaPass = [];

          for(var i = 0; i < secret.length; i ++) {
            decodePass.push(secret.charAt(i));
            alphaPass.push(secret.charAt(i));
          }

          alphaPass.sort();

          jmbleMsg = [];

          numArr = fbMessage.length / secret.length;

          for (var l = 0; l < secret.length; l++) {
            for (var j = l; j < fbMessage.length; j += numArr) {
              jmbleMsg.push(returnMsg[j]);
            }
          }

          splitMsg = [];

          for(var p = 0; p < numArr; p++) {
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

          for(var a = 0; a < numArr; a++ ) {
            for (var b = 0; b < secret.length; b++) {
              decodedArr.push(roteMsg[b][a]);
            }
          }
           decodedMsg = decodedArr.join('');

           setTimeout(function(){
             $('form').attr('class', 'hide');

             $('form').after('<p> ' + senderName + ' sent you the following message: </p><p>'+ decodedMsg + '</p>');

           }, 200);
        } else {

        }
      });
    });
  });
})();
