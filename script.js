$(function () {
  var INDEX = 0;
  $("#chat-submit").click(function (e) {
    e.preventDefault();
    var msg = $("#chat-input").val();
    if (msg.trim() == '') {
      return false;
    }
    generate_message(msg, 'self', []);
    botTyping();
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
      const d = new Date();
      let sessionId = d.getTime().toString();
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
          $("#bot-typing").remove();
          const jsonResponse = JSON.parse(data.response);
          const messages = jsonResponse.chat_history;
          const messagesArray = messages.split('<split>');
          var response = messagesArray.filter(message => message.startsWith('WebGPT:'));
          webGPTResponse = response[0].replace('WebGPT:','');
          refs = jsonResponse.refs;
          generate_message(webGPTResponse, 'user', refs);
        })
        .catch(error => console.log('error', error));
    }
    catch(error){
      console.log("Error: ",error);
    }
  }

  function botTyping() {
    var html;
    html=`<div id="bot-typing">
          <span></span>
          <span></span>
          <span></span>
          </div>`
          $(".chat-logs").append(html);
        }

  function generate_message(msg, type, refs) {
    INDEX++;
    var str = "";
    str += "<div id='cm-msg-" + INDEX + "' class=\"chat-msg " + type + "\">";
    str += "          <span class=\"msg-avatar\">";
    str += "            <img class=\"up\" onclick='sendFeedback(`Helpful`)' src=\"img/btn-thumb-up.png\" alt=\"Avatar\">";
    str += "            <img class=\"down\" onclick='sendFeedback(`Not Helpful`)' src=\"img/btn-thumb-down.png\" alt=\"Avatar\">";
    str += "          <\/span>";
    str += "          <div class=\"cm-msg-text\">";
    str += msg;
    str += "          <\/div>";
    str += "        <\/div>";
    if (type === 'user' && refs.length != 0) {
      str += `<div class="slider-content">
                <p>Sources:</p>
                <div class="owl-carousel">`;

      refs.forEach(ref => {
          str += `<div class="card">
                      <div class="slider-body">
                          <p>${ref}</p>
                          <p class="read-more"><a href="${ref}">Read More</a></p>
                      </div>
                  </div>`;
      });

      str += `</div>
              </div>`;
    }
    $(".chat-logs").append(str);
    $("#cm-msg-" + INDEX).hide().fadeIn(300);
    if (type == 'self') {
      $("#chat-input").val('');
    }
    $(".chat-logs").stop().animate({ scrollTop: $(".chat-logs")[0].scrollHeight }, 1000);
    // Initialize slider on document ready
    initializeSlider();
  }

  $(document).delegate(".chat-btn", "click", function () {
    var value = $(this).attr("chat-value");
    var name = $(this).html();
    $("#chat-input").attr("disabled", false);
    generate_message(name, 'self', []);
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

  setTimeout(()=>{
    var chatCircle = $('#chat-circle');
    chatCircle.removeClass('rectangle');
  },4000)

  function checkScroll() {
    var chatCircle = $('#chat-circle');

    // Check if the user has scrolled
    if ($(window).scrollTop() > 0) {
      // If scrolled, remove the 'rectangle' class
      chatCircle.removeClass('rectangle');
    }
  }

  function initializeSlider() {
    $('.owl-carousel').owlCarousel({
        center: true,
        items: 1,
        loop: true,
        nav: true,
        dots: false,
        margin: 0,
        responsiveClass: true,
    });
}
});

async function sendFeedback(rating){
  if (rating === 'Helpful'){
    $(".msg-avatar img.up").css("background-image", "url(./img/btn-thumb-up-hover.png)")
    $(".msg-avatar img.down").css("background-image", "url(./img/btn-thumb-down.png)")
  }
  else {
    $(".msg-avatar img.down").css("background-image", "url(./img/btn-thumb-down-hover.png)")
    $(".msg-avatar img.up").css("background-image", "url(./img/btn-thumb-up.png)")
  }
  var headers = new Headers();
  headers.append("Content-Type", "application/json");
  sessionId = localStorage.getItem('sessionId');

  var raw = JSON.stringify({
    "session_id": sessionId,
    "rating": rating
  });

  var requestOptions = {
    method: 'POST',
    headers: headers,
    body: raw,
    redirect: 'follow'
  };
  try{
    await fetch("http://161.35.38.90:5000/feedback", requestOptions)
      .then(response => response.text())
      .then(result => console.log("Feedback given"))
      .catch(error => console.log('error', error));
  }
  catch(error){
    console.log("Error: ",error);
  }
}
