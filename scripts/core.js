var __collective = (function(){

	'use strict' 

	var canvas = document.getElementById('drawCanvas'),
		prepare = document.getElementById('prepareCanvas'),
		ctx = canvas.getContext('2d'),
		pCtx = prepare.getContext('2d'),
		queue = [],
		images = [],
		idx = 0,
		lastPage = 1,
		lastTerm = "",
		stop = false,
		searchInput = document.getElementsByName('term')[0],
		submitButton = document.querySelectorAll('[type="submit"]')[0],
		maxImages = 100,
		intervalTime = 500;

	pCtx.globalAlpha = 0.01;	
	ctx.globalCompositeOperation = "lighter";

	function addEvents(){
		
		document.getElementById('search').addEventListener('submit', function(e){
			e.preventDefault();
			var searchTerm = searchInput.value;
			search(searchTerm, 1);
			stop = true;
			searchInput.blur();
			document.getElementById('info').style.display = "none";
			// document.getElementById('count').style.display = "block";

		}, true);

	}

	function workThroughQueue(){

		if(queue[idx] != undefined && queue[idx].url_c !== undefined && idx < queue.length && !stop){
			
			var anImage = new Image();
			anImage.src = queue[idx].url_c;
			anImage.onload = function(){
				
				var f = 0;

				if(images.length < maxImages){
					images.push(anImage);	
				} else {
					images.shift();
					images.push(anImage);
				}

				images = shuffle(images);

				ctx.clearRect(0, 0, canvas.width, canvas.height);

				while(f < images.length){

					var midX = 0 - ((images[f].width / 2) - (prepare.width / 2)),
						midY = 0 - ((images[f].height / 2) - (prepare.height / 2))

					pCtx.clearRect(0, 0, prepare.width, prepare.height);
					pCtx.drawImage(images[f], midX, midY);
					ctx.drawImage(prepare, 0, 0);

					f += 1;

				}

				setTimeout(function(){
					workThroughQueue();
				}, intervalTime);

			}
				
		} else if(!stop) {

			if(idx > queue.length){
			
				search(lastTerm, lastPage + 1);
			
			} else {
				
				setTimeout(function(){
					workThroughQueue();
				}, intervalTime);

			}
			
		}

		idx += 1;

		document.getElementById('count').innerHTML = "x " + idx;

	}

	//Flickr Search
	function search(term, page){

		var api_key = "b2eaa4f37737adff172600cb8cea27c0",
			apiRoot = "http://api.flickr.com/services/rest/";
		
		term = term.toLowerCase();

		if(term != lastTerm){
			lastTerm = term;
			lastPage = page;
			queue = [];
			images = [];
			idx = 0;
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			//>>>console.log("Different term; New search.");
		}



		var options = {
			"method" : "flickr.photos.search",
			"text" : term,
			"extras" : "url_c",
			"page" : page
		};

		options.api_key = api_key;
		options.format = "json";
		options.nojsoncallback = "1";

		jQuery.ajax({
			type : "GET",
			dataType : 'json',
			url : apiRoot,
			data : options,
			cache: true,
			success : function(e){

				var x = 0;

				while(x < e.photos.photo.length){

					queue.push(e.photos.photo[x]);

					x += 1;

				}
				stop = false;

				workThroughQueue();
			
			},
			error: function(err){
				//>>>console.log(err);
			}
		});

	}

	//Fisher-Yates Shuffle
	function shuffle(array) {
		var currentIndex = array.length,
			temporaryValue, 
			randomIndex;
		
		while (0 !== currentIndex) {

			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		
		}

		return array;
	
	}

	function init(){

		//>>>console.log("Collective Initialised");
		addEvents();

	}

	return{
		init : init
	};

})();

(function(){
	__collective.init();
})();