/* Javascript for submitcompareXBlock. */
function SubmitAndCompareXBlockInitView(runtime, element) {
    
    var handlerUrl = runtime.handlerUrl(element, 'student_submit');
    var hintUrl = runtime.handlerUrl(element, 'send_hints');
	var publishUrl = runtime.handlerUrl(element, 'publish_event');

	var $element = $(element);
	
    var submit_button = $element.find('.submit_button');
    var hint_button = $element.find('hint_button');
    var reset_button = $element.find('.reset_button');

    var your_answer = $element.find('.your_answer');
    var expert_answer = $element.find('.expert_answer');
    var hint_div = $element.find('.hint');
    var hint_button_holder = $element.find('.hint_button_holder');

    var answer_field = your_answer.siblings('textarea.answer');
    var cache_key = 'submitAndCompare' + $element.data('request-token');
    
    var hint;
    var hints;
    var hint_counter = 0;
	
    $.ajax({
        type: 'POST',
        url: hintUrl,
        data: JSON.stringify({requested: true}),
        success: set_hints
    });

    function load_answer_from_cache() {
        lscache.flushExpired();
        var storedAnswer = lscache.get(cache_key);

        if (storedAnswer != null) {
            answer_field.val(storedAnswer);
        }
    }

    function publish_event(data) {
      $.ajax({
          type: "POST",
          url: publishUrl,
          data: JSON.stringify(data)
      });
    }

	function post_submit(result) {
        // cache the result locally
        lscache.set(cache_key, answer_field.val(), 10);
	}
	
	function set_hints(result) {
		hints = result.hints;
		if (hints.length > 0) {
	        hint_button.css('display','inline');
			hint_button_holder.css('display','inline');
    	}
	}

    function show_answer() {
		your_answer.css('display','block');
		expert_answer.css('display','block');
		submit_button.val('Resubmit');
       
    }

    function reset_answer() {
		your_answer.css('display','none');
		expert_answer.css('display','none');
		submit_button.val('Submit and Compare');
    }

    function reset_hint() {
    	hint_counter = 0;
    	hint_div.css('display','none');
    }

    function show_hint() {
    	hint = hints[hint_counter];
		hint_div.html(hint);
		hint_div.css('display','block');
		publish_event({
			event_type:'hint_button',
			next_hint_index: hint_counter,
		});
		if (hint_counter == (hints.length - 1)) {
			hint_counter = 0;
		} else {
			hint_counter++;
		}
    }

    $('.submit_button', element).click(function(eventObject) {
        $.ajax({
            type: 'POST',
            url: handlerUrl,
            data: JSON.stringify({'answer': $('.answer',element).val() }),
            success: post_submit
        });
        show_answer();
	});

    $('.reset_button', element).click(function(eventObject) {
		$('.answer',element).val('');
        $.ajax({
            type: 'POST',
            url: handlerUrl,
            data: JSON.stringify({'answer': '' }),
            success: post_submit
        });
        reset_answer();
        reset_hint();
	});
	
    $('.hint_button', element).click(function(eventObject) {
        show_hint();
	});
	
	if ($('.answer',element).val() != '') {
		show_answer();
	}
	
}


