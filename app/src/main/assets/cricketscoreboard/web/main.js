$(document).ready(function() 
         {
            $('#behaviours').click(function(e) 
            { 
                window.location.href="viewBehaviours.html";
            });
        $('#incidents').click(function(e) 
            { 
                window.location.href="viewIncidents.html";
            });
        $('#notes').click(function(e) 
            { 
                window.location.href="viewNotes.html";
            });
        $('.toggle li').click(function () {
            $('div.panel').slideUp('500');
            $('li').children('span').html('+');	
            //$(this).children('div.panel').children();
            var text = $(this).children('div.panel');
            if (text.is(':hidden')) {
                console.log($(this).children('div.panel').children('div'));
                text.slideDown('500');
                $(this).children('span').html('-');		
            } else {
                text.slideUp('500');
                $(this).children('span').html('+');		
            }
        });
    });