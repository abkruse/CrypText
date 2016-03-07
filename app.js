(function() {
  'use strict';

  $(document).ready(function() {
    var encryption, Create, cols, messArr;

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
      Create.secret = $('#secret-word').val();
      Create.message = $('#message').val();

      encryption();
    });

    encryption = function() {
      cols = Create.secret.length;
      messArr = [];

      var msg = Create.message.replace(/[.,\/@#?!$%\^&\*;:{}=\-_`~()]/g,"");

      msg = msg.replace(/\s+/g, '');

      for (var j = 0; j < msg.length; j++) {
        messArr.push(msg.charAt(j));
      }

      if(Create.message.length % cols !== 0) {
        for(var i = 0; i < Create.message.length % cols; i++ )
          messArr.push('x');
      }

    };
  });
})();
