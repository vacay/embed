/* global app, document */

app.filter('duration', function () {
    return function(value) {
	if (!value) return '';
	var sec_num = parseInt(value, 10);
	var hours   = Math.floor(sec_num / 3600);
	var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
	var seconds = sec_num - (hours * 3600) - (minutes * 60);
    
	if (hours   < 10) {hours   = '0'+hours;}
	if (minutes < 10) {minutes = '0'+minutes;}
	if (seconds < 10) {seconds = '0'+seconds;}
	return hours+':'+minutes+':'+seconds;
    };
});

app.filter('fromNow', function () {
    var o = {
	second: 1000,
	minute: 60 * 1000,
	hour: 60 * 1000 * 60,
	day: 24 * 60 * 1000 * 60,
	week: 7 * 24 * 60 * 1000 * 60,
	month: 30 * 24 * 60 * 1000 * 60,
	year: 365 * 24 * 60 * 1000 * 60
    };
    return function(nd) {
	if (!nd) return 'now';
	var r = Math.round,
            pl = function(v, n) {
		return n + ' ' + v + (n > 1 ? 's' : '') + ' ago';
            },
            ts = new Date().getTime() - new Date(nd).getTime(),
            ii;
	for (var i in o) {
	    if (o.hasOwnProperty(i)) {
		if (r(ts) < o[i]) return pl(ii || 'm', r(ts / (o[ii] || 1)));
		ii = i;
	    }
	}
	return pl(i, r(ts / o[i]));
    };
});

app.filter('hostnamePathname', function() {
    return function(url) {
	var parser = document.createElement('a');
	parser.href = url;
	var base = parser.hostname.substring(0,3) === 'www' ?
		parser.hostname.slice(4):
		parser.hostname;
	return base + parser.pathname;
    };
});
