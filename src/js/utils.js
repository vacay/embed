/* global app, angular, atob, ArrayBuffer, Uint8Array, Blob */

app.factory('Utils', function() {

    var mimesToExt = {
	'image/jpeg': 'jpg',
	'image/png': 'png',
	'image/gif': 'gif',
	'image/tiff': 'tif'
    };

    return {

	dataURItoBlob: function(dataURI) {

	    var byteString = atob(dataURI.split(',')[1]);

	    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

	    var ab = new ArrayBuffer(byteString.length);
	    var ia = new Uint8Array(ab);
	    for (var i = 0; i < byteString.length; i++) {
		ia[i] = byteString.charCodeAt(i);
	    }

	    var bb = new Blob([ab], { type: mimeString });
	    return bb;
	},

	getExtByMime: function(mime) {
	    if (mimesToExt.hasOwnProperty(mime)) {
		return mimesToExt[mime];
	    }
	    return false;
	},

	isChildOfClass : function (oChild, oClass) {
	    if (!oChild || !oClass) {
		return false;
	    }
	    while (oChild.parentNode && !angular.element(oChild).hasClass(oClass)) {
		oChild = oChild.parentNode;
	    }
	    return (angular.element(oChild).hasClass(oClass));
	},

	isUrl: function (text) {
            var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
				     '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
				     '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
				     '(?::\\d{2,5})?' + // port
				     '(?:/[^\\s]*)?$', 'i'); // path

            return pattern.test(text);
        },

	getIdx: function(arr, id) {
	    var idx = -1;
	    for (var i=0; i<arr.length; i++) {
		if (arr[i].id === id) {
		    idx = i;
		    break;
		}
	    }
	    return idx;
	}
	
    };
});
