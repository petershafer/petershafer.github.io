psApp = angular.module('PeterShaferCom', []);

psApp.directive('goto', function($window){
	return {
		link: function(scope, element, attrs){
			element.on('click', function(){
				$($window).scrollTo(attrs['goto'], {duration: 500});
			});
		}
	};
});

psApp.directive('more', function($window){
	return {
		link: function(scope, element, attrs){
			var drop;
			drop = new Drop({
				target: element[0],
				content: attrs['more'],
				position: 'bottom center',
				openOn: 'hover',
				classes: 'drop-theme-arrows-bounce-dark',
			});
		}
	};
});


psApp.directive('postList', function($window, $http){
	var promise;
	var setupComponent = function(scope, element, attrs){
		scope.title = attrs['title'] || 'Recent Posts';
		if(!attrs['source']){
			// Back out if there's nothing to retrieve.
			return;
		}
		if(!promise){
			// Don't make redundant requests if one is already in flight.
			promise = $http.get(attrs['source']);
		}
		promise.then(function(data){
			scope.posts = [];
			var items = data.data.feed.entry;
			var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
			for(var i = 0; i < items.length; i++){
				var d = new Date(Date.parse(items[i].gsx$date.$t));
				scope.posts.push({
					date: {
						value: items[i].gsx$date.$t,
						month: months[d.getMonth()],
						day: d.getDate(),
						year: d.getFullYear()
					},
					link: items[i].gsx$link.$t,
					description: items[i].gsx$description.$t,
					headline: items[i].gsx$headline.$t
				});
			}
		})
		['finally'](function(){
			scope.loaded = true;
			// Okay, we can release this promise, expecting 
			// the next change to trigger a new/different request.
			promise = null;
		});
	}
	return {
		templateUrl: "assets/templates/post-list.html",
		restrict: 'E',
		scope: {
			title: '@title',
			source: '@source' 
		},
		link: function(scope, element, attrs){
			// Setup observers, if any.
			var args = arguments;
			attrs.$observe('source', function(){ setupComponent.apply(null, args) });
			// Setup the component.
			setupComponent.apply(null, arguments);
		},
	};
});

psApp.directive('displayCard', function($window, $http, $timeout){
	var observers = {};
	var setupComponent = function(scope, element, attrs){
		scope.title = attrs['title'] || null;
		scope.link = attrs['link'] || null;
		scope.image = attrs['image'] || null;
		$timeout(function() { $('.row .box').matchHeight(); }, 1);
	}
	return {
		templateUrl: "assets/templates/display-card.html",
		restrict: 'E',
		scope: {
			title: '@title',
			link: '@link',
			image: '@image'
		},
		transclude: true,
		link: function(scope, element, attrs){
			// Setup observers, if any.
			// Setup the component.
			setupComponent.apply(null, arguments);
		},
	};
});
