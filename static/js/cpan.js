$.fn.textWidth = function(){
  var html_org = $(this).html();
  var html_calc = '<span>' + html_org + '</span>'
  $(this).html(html_calc);
  var width = $(this).find('span:first').width();
  $(this).html(html_org);
  return width;
};

var podVisible = true;

function togglePod(lines) {
    var toggle = podVisible ? 'none' : 'block';
    podVisible = !podVisible;
    if (!lines || !lines.length) return;
    for (var i = 0; i < lines.length; i++) {
        var start = lines[i][0],
        length = lines[i][1];
        var sourceC = document.querySelectorAll('.container')[0].children;
        var linesC = document.querySelectorAll('.gutter')[0].children;
        var x;
        for (x = start; x < start + length; x++) {
            sourceC[x].style.display = toggle;
            linesC[x].style.display = toggle;
        }

    }
}

function toggleTOC() {
    var index = $('#index');
    if(!index) return false;
    var visible = index.is(':visible');
    visible ? index.hide() : index.show();
    visible ? $.cookie("hideTOC", 1, { expires: 999, path: '/' }) : $.cookie("hideTOC", 0, { expires: 999, path: '/' });
    return false;
}

function getModuleName() {
    var path       = window.location.pathname;
    var components = path.split(/\//);
    if(components[components.length - 1].length == 0) {
        components.pop();
    }
    return components[components.length - 1];
}

function getAnnotationEditor(section) {
    var editor = $('<div class="annotation-editor"><textarea></textarea><br /><input type="button" value="Submit" /><input type="button" value="Cancel" /></div>');

    var textarea = $('textarea', editor);

    $('input', editor).click(function() {
        var me = $(this);

        var value = me.val();

        if(value == 'Submit') {
            var annotation = textarea.val();

            $.ajax({
                url: '/annotation/',
                type: 'POST',
                success: function(data) {
                    editor.detach();
                    alert('Annotation added!');
                },
                error: function(_, error) {
                    alert('FAIL: ' + error);
                },
                data: JSON.stringify({
                    annotation : annotation,
                    module     : getModuleName(),
                    section    : section
                }),
                dataType: 'json',
                contentType: 'application/json'
            });
        } else { // Cancel
            editor.detach();
        }
    });

    return editor;
}

function addAnnotationButtons() {
    for(var i = 1; i <= 6; i++) {
        var elements = $('h' + i);
        elements.append(function() {
            var that = $(this);

            var img = $('<img width="16" height="16" src="/static/icons/annotate.png" style="display: none"/>');
            img.click(function() {
                var div = getAnnotationEditor(that.text());
                that.append(div);
            });
            that.hover(function() {
                img.show();
            }, function() {
                img.hide();
            });
            return img;
        });
    }
}

$(document).ready(function() {
    SyntaxHighlighter.defaults['quick-code'] = false;
    SyntaxHighlighter.highlight();

    $('.relatize').relatizeDate();

    $('#search-input').keydown(function(event) {
        if (event.keyCode == '13' && event.shiftKey) {
            event.preventDefault();
            document.forms[0].q.name = 'lucky';
            document.forms[0].submit();
        }
    });

    var el = $('.search-bar');
    if (!el.length) return;
    var originalTop = el.offset().top; // store original top position
    $(window).scroll(function(e) {
        if ($(this).scrollTop() + 10 > originalTop) {
            el.css({
                'position': 'fixed',
                'top': '10px'
            });
        } else {
            el.css({
                'position': 'absolute',
                'top': originalTop
            });
        }
    });

    var items = $('.ellipsis');
      for(var i = 0; i < items.length; i++) {
        var element = $(items[i]);
        var boxWidth = element.width();
        var textWidth = element.textWidth();
        var text = element.text();
        var textLength = text.length;
        if(textWidth <= boxWidth) continue;
        var parts = [text.substr(0, Math.floor(textLength/2)), text.substr(Math.floor(textLength/2), textLength)];
        while(element.textWidth() > boxWidth) {
          if(textLength % 2) {
            parts[0] = parts[0].substr(0, parts[0].length-1);
          } else {
            parts[1] = parts[1].substr(1, parts[1].length);
          }
          textLength--;
          element.html(parts.join('…'));
        }
      }

      addAnnotationButtons();
});

function searchForNearest() {
    document.getElementById('busy').style.visibility = 'visible';
    navigator.geolocation.getCurrentPosition(function(pos) {
        document.location.href = '/mirrors?q=loc:' + pos.coords.latitude + ',' + pos.coords.longitude;
    },
    function() {},
    {
        maximumAge: 600000
    });
}

function disableTag(tag) {
    document.location.href = '/mirrors' + (document.location.search || '?q=') + ' ' + tag;
}
