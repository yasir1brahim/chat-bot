$(function () {
  var INDEX = 0;
  $("#chat-submit").click(function (e) {
    e.preventDefault();
    var msg = $("#chat-input").val();
    if (msg.trim() == '') {
      return false;
    }
    generate_message(msg, 'self');
    generateResponse(msg);
    var buttons = [
      {
        name: 'Existing User',
        value: 'existing'
      },
      {
        name: 'New User',
        value: 'new'
      }
    ];
  })

  async function generateResponse(msg){
    if (!localStorage.getItem('sessionId')){
      var sessionId = crypto.randomUUID();
      localStorage.setItem('sessionId', sessionId);
    }
    else{
      var sessionId = localStorage.getItem('sessionId');
    }

    var headers = new Headers();
    headers.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      "session_id": sessionId,
      "user_input": msg
    });

    var requestOptions = {
      method: 'POST',
      headers: headers,
      body: raw,
      redirect: 'follow'
    };
    try{
      await fetch("http://161.35.38.90:5000/proxy", requestOptions)
        .then(response => response.json())
        .then(data => {
          const jsonResponse = JSON.parse(data.response);
          const messages = jsonResponse.chat_history;
          const messagesArray = messages.split('<split>');
          const webGPTResponse = messagesArray.filter(message => message.startsWith('WebGPT:'));
          generate_message(webGPTResponse[0], 'user');
        })
        .catch(error => console.log('error', error));
    }
    catch(error){
      console.log("Error: ",error);
    }
  }

  function generate_message(msg, type) {
    INDEX++;
    var str = "";
    str += "<div id='cm-msg-" + INDEX + "' class=\"chat-msg " + type + "\">";
    str += "          <span class=\"msg-avatar\">";
    str += "            <img class=\"up\" src=\"img/btn-thumb-up.png\" alt=\"Avatar\">";
    str += "            <img class=\"down\" src=\"img/btn-thumb-down.png\" alt=\"Avatar\">";
    str += "          <\/span>";
    str += "          <div class=\"cm-msg-text\">";
    str += msg;
    str += "          <\/div>";
    str += "        <\/div>";
    $(".chat-logs").append(str);
    $("#cm-msg-" + INDEX).hide().fadeIn(300);
    if (type == 'self') {
      $("#chat-input").val('');
    }
    $(".chat-logs").stop().animate({ scrollTop: $(".chat-logs")[0].scrollHeight }, 1000);
  }

  function generate_button_message(msg, buttons) {
    INDEX++;
    var btn_obj = buttons.map(function (button) {
      return "              <li class=\"button\"><a href=\"javascript:;\" class=\"btn btn-primary chat-btn\" chat-value=\"" + button.value + "\">" + button.name + "<\/a><\/li>";
    }).join('');
    var str = "";
    str += "<div id='cm-msg-" + INDEX + "' class=\"chat-msg user\">";
    str += "          <span class=\"msg-avatar\">";
    str += "            <img class=\"up\" src=\"img/btn-thumb-up.png\" alt=\"Avatar\">";
    str += "            <img class=\"down\" src=\"img/btn-thumb-down.png\" alt=\"Avatar\">";
    str += "          </span>";
    str += "          <div class=\"cm-msg-text\">";
    str += msg;
    str += "          <\/div>";
    str += "          <div class=\"cm-msg-button\">";
    str += "            <ul>";
    str += btn_obj;
    str += "            <\/ul>";
    str += "          <\/div>";
    str += "        <\/div>";
    $(".chat-logs").append(str);
    $("#cm-msg-" + INDEX).hide().fadeIn(300);
    $(".chat-logs").stop().animate({ scrollTop: $(".chat-logs")[0].scrollHeight }, 1000);
    $("#chat-input").attr("disabled", true);
  }

  $(document).delegate(".chat-btn", "click", function () {
    var value = $(this).attr("chat-value");
    var name = $(this).html();
    $("#chat-input").attr("disabled", false);
    generate_message(name, 'self');
  })

  $(".chat-box").hide(); // Hide chat-box by default

  $("#chat-circle, .chat-box-toggle").click(function () {
    $(".chat-box").toggle('scale');

    if ($("#chat-circle").hasClass('rectangle')) {
      $("#chat-circle").removeClass('rectangle');
    }

    // Toggle the display property of .close and .icon-chat
    $(".close").toggle();
    $(".icon-chat").toggle();

    checkScroll(); // Check the scroll position immediately
  });



  setTimeout(function () {
    $('#chat-circle').css('opacity', '1');
  }, 2000);

  setTimeout(function () {
    // Listen to the scroll event
    $(window).scroll(function () {
      checkScroll();
    });
  }, 2000);

  function checkScroll() {
    var chatCircle = $('#chat-circle');

    // Check if the user has scrolled
    if ($(window).scrollTop() > 0) {
      // If scrolled, remove the 'rectangle' class
      chatCircle.removeClass('rectangle');
    }
  }
});
