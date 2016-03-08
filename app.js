(function() {
  'use strict';

  $(document).ready(function() {
    var encryption, Create, cols, secArr, messArr, numArr, splitMsg, newOrdr, alphaArr, idx, encMsgArr;

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

      for(var n = 0; n < cols; n ++){
        secArr.push(Create.secret[n]);
        alphaArr.push(Create.secret[n]);
      }

      messArr = [];

      var msg = Create.message.replace(/[.,\/@#?!$%\^&\*;:{}=\-_`~()]/g,"");

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

      for(var k = 0; k <numArr; k ++) {
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

      $('form').after('<p>' + encMsgArr.join('') + '</p>');
    };

  });
})();
