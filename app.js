(function() {
  'use strict';

  $(document).ready(function() {

    var encryption, Create, cols, secArr, messArr, numArr, splitMsg, newOrdr, alphaArr, idx, encMsgArr, getURL, decode, msg;

    var myDataRef = new Firebase('https://cryptext.firebaseio.com/');

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

    encryption = function() {
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
      }

      encMsgArr = [];

      for(var y = 0; y < newOrdr.length; y++) {
        idx = newOrdr.indexOf(y);
        for(var z = 0; z < numArr; z++) {
          encMsgArr.push(splitMsg[z][idx]);
        }
      }

      var encrypted = encMsgArr.join('');

      $('form').after('<p>' + encrypted + '</p>');

      myDataRef.push({
        name: Create.name,
        secret: Create.secret,
        message: encrypted
      });
    };

    getURL = function(){
      //on click, produce unique URL for from firebase
    };

    $('.decoder-ring').on('click', function(e){
      e.preventDefault();

      var secret = $('#secret-word').val();
      var message = "nalcxehwttdttfseeleedsoaxfeahl";
      var returnMsg = [];

      for (var y = 0; y < message.length; y ++) {
        returnMsg.push(message.charAt(y));
      }

      var decodePass = [];
      var alphaPass = [];

      for(var i = 0; i < secret.length; i ++) {
        decodePass.push(secret.charAt(i));
        alphaPass.push(secret.charAt(i));
      }

      alphaPass.sort();

      var jmbleMsg = [];

      numArr = message.length / secret.length;

      for (var l = 0; l < secret.length; l++) {
        for (var j = l; j < message.length; j += numArr) {
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
      }

      var mixMsg = [];
      var roteMsg = [];

      for (var z = 0; z < newOrdr.length; z++) {
        idx = newOrdr.indexOf(z);

        for(var x = 0; x < numArr; x++) {
          mixMsg.push(splitMsg[x][idx]);
        }
        roteMsg.push(mixMsg.splice(0, numArr));
      }
      var decodedArr = [];

      for(var a = 0; a < numArr; a++ ) {
        for (var b = 0; b < secret.length; b++) {
          decodedArr.push(roteMsg[b][a]);
        }
      }
      console.log(decodedArr.join(''));
    });

    // decode = function(){

      //sort the keyword

      //split message into arrays equal in length to the keyword


    // };

  });
})();
