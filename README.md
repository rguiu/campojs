# campojs #

Bind json services into html using data-arguments 

See these examples:

* Yahoo Finance APi - Live prices (pull)
http://jsfiddle.net/avempace/7uDWZ/2/

* Twitter API
http://jsfiddle.net/avempace/VD952/1/

* Tumblr API
http://jsfiddle.net/avempace/WNrdz/2/

## Usage: ##

### Install ###

The javascript is under soource/js/campo.js. It needs to be included with rivets.js, jquery, backbonejs. The jsfiddleabove is a good example (check the "managed resources" in the left hand side)

To run the project locally with the examples, to help to improve the library or to test it you must use middleman, http://middlemanapp.com/getting-started/welcome/. To tun it just use:

	bundle exec middleman server

### Syntax of the data arguments in HTML ###
	class="cmp_bind"
Declares this element as "bindable"

	data-models='{...}'
A list element, The configuration is passed as JSON, explained bellow

	data-model='{...}'
A model element, The configuration is passed as JSON, explained bellow

	data-each-...=...
	data-text=...
	...
Rivetsjs fields. See: http://rivetsjs.com/

### Configuration within data-models and data-model json ###

	"name":"..."
OBLIGATIRY. This is the most important field, it defines the bind and used by Rivetsjs binding process.

	"url":"..."
Self explained. It is optional, if is not set it will look in "/rest/<name>.json". All the current examples have it defined.

	"nested":"geonames"
Optional field. Sometimes the list of elements is not in the root of the json response, we use this field to dig for our target element within the response.

	"refresh":{"type":"pull","feq":15000}
Optional field. Defines the refresh mode and frequency if apply. At th emoment only pull is implemented, so the type is not used. 


## Example ##

	<table>
	  <tr class="cmp_bind" data-models='{"name":"tweets", "url":"http://search.twitter.com/search.json?q=obama&callback=?", "nested":"results", "refresh":{"type":"pull","feq":15000}}' data-each-tweet="tweets.models" >
	     <td><img data-src="tweet.profile_image_url" alt="profile image"></td>
	     <td data-text="tweet.from_user">Wonderuser</td>
	     <td data-text="tweet.text">message</td>
	  </tr>
	</table>