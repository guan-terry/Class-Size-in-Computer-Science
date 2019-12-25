jQuery( document ).ready(function() {
	
	
	function setCookie(cname, cvalue, exdays) {
		var d = new Date();
		d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
		var expires = "expires="+d.toUTCString();
		document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/;domain=.pomona.edu";
		}

	function getCookie(cname) {
		var name = cname + "=";
		var ca = document.cookie.split(';');
		for(var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ') {
				c = c.substring(1);
				}
			if (c.indexOf(name) == 0) {
				return c.substring(name.length, c.length);
				}
			}
		return "";
		}

	function cookieAccepted() {
		
		//RUN ANALYTICS or OTHER COOKIE GENERATING CODE HERE
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-4611479-4', 'pomona.edu');
  ga('require', 'linkid', 'linkid.js');
  ga('send', 'pageview');
		
		}
	
	function checkCookie() {
		var pomCookieAcceptance = getCookie("PomonaCookieConsent");
		if (pomCookieAcceptance != "") {
			//it's been accepted already
			cookieAccepted();
			} else {
				//EDIT - CHANGE #skip-link TO THE ELEMENT WHERE YOU WANT THE COOKIE MESSAGE TO SHOW IN THE CODE. THE COOKIE MESSAGE SHOULD BE ADDED NEAR THE BEGINNING OF THE CODE, SO SOMEONE HITS IT FIRST WHEN ACCESSING VIA KEYBOARD, BUT CSS CAN THEN SHOW IT AT THE BOTTOM
				jQuery( "#header").before( '<div id="cookie-info">Pomona College uses cookies to personalize contents, to offer functions for social media and to analyze access to our website. <a href="#" aria-label="I accept the cookie policy." class="button button-small" id="cookie-policy-accepted">Accept</a>&nbsp;|&nbsp;<a href="https://www.pomona.edu/privacy" aria-label="More information about the cookie policy.">More&nbsp;Info</a></div>' );
				
				jQuery("body").addClass("cookie-policy-notification");
				
				//EDIT - CHANGE #outer1 TO BE THE SELECTOR OF THE PARENT OF WHERE THE cookie-info DIV ENDS UP BEING PLACED.
				jQuery( "#navWrapper" ).on( "click", "#cookie-policy-accepted", function(event) {
					event.preventDefault();
					setCookie("PomonaCookieConsent", '1', 365);
					//remove cookie policy footer banner
					jQuery("#cookie-info").remove(); //remove bottom footer cookie info
					jQuery("body").removeClass("cookie-policy-notification");
					cookieAccepted();
					});
				}
		}
	
	
	checkCookie();  // Uncomment when ready to deploy
	//cookieAccepted(); // Comment out when ready to actually use.
	
	});