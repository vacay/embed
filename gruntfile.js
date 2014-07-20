/* global module, require */

var modRewrite = require('connect-modrewrite');

module.exports = function (grunt) {

    grunt.initConfig({
	pkg: grunt.file.readJSON('package.json'),
	clean: {
	    options: {
		force: true
	    },
	    index: {
		src: ['www/*.html']
	    },
	    css: {
		src: ['tmp/*.css', 'www/*.css']
	    },
	    js: {
		src: ['tmp/*.js', 'www/*.js']
	    },
	    assets: {
		src: ['www/assets/**/*']
	    },
	    tmp: {
		src: ['tmp/**/*']
	    }
	},

	/********************* STYLE *********************/
	stylus: {
	    options: {
		compress: true,
		'include css': true
	    },
	    compile: {
		files: {
		    'tmp/app.css': 'src/css/*.styl'
		}
	    }
	},
	cssmin: {
	    compress: {
		files: {
		    'tmp/app.css': 'tmp/app.css'
		}
	    }
	},
	staticinline: {
	    main: {
		files: {
		    'www/index.html': 'www/index.html'
		}
	    }
	},

	/********************* JAVASCRIPT *********************/
	concat: {
	    vendor: {
		files: {
		    'tmp/vendor.js': [
			//libraries
			'components/angular/angular.min.js',
			'components/soundmanager/script/soundmanager2-nodebug-jsmin.js',
			'components/youtubemanager2/lib/youtubemanager.js',

			//ngModules
			'components/angular-once/once.js',
			'components/ngDialog/js/ngDialog.min.js'
		    ]
		}
	    },
	    js: {
		files: {
		    'tmp/app.js' : ['src/ngApp.js', 'src/js/**/*.js', 'src/main.js']
		}
	    },
	    development: {
		files: {
		    'tmp/app.js': ['config/development.js', 'tmp/app.js']
		}
	    },
	    production: {
		files: {
		    'tmp/app.js': ['config/production.js', 'tmp/app.js']
		}
	    }
	},
	uglify: {
	    options: {
		beautify: {
		    ascii_only: true,
		    inline_script: true
		}
	    },
	    vendor: {
		files: {
		    'tmp/vendor.js': ['tmp/vendor.js']
		}
	    },
	    js: {
		files: {
		    'tmp/app.js': ['tmp/app.js']
		}
	    }
	},
	inline: {
	    index: {
		src: [ 'www/index.html' ]
	    }
	},

	/********************* HTML *********************/
	jade: {
	    index: {
		files: [{
		    'tmp/index.html': ['src/views/index.jade']
		}]
	    },
	    partials: {
		files: [{
		    expand: true,
		    src: ['partials/**/*.jade', 'layouts/*.jade'],
		    dest: 'tmp/',
		    cwd: 'src/views/',
		    ext: '.html'
		}]
	    }
	},
	inline_angular_templates: {
	    index: {
		options: {
		    base: 'tmp',
		    prefix: '/',
		    selector: 'body',
		    method: 'prepend'
		},
		files: {
		    'tmp/index.html': ['tmp/partials/**/*.html', 'tmp/layouts/*.html']
		}
	    }
	},
	htmlmin: {
	    index: {
		options: {
		    collapseWhitespace: true,
		    removeComments: true
		},
		files: {
		    'www/index.html': 'www/index.html'
		}
	    }
	},
	
	/********************* ASSETS *********************/
	copy: {
	    images: {
		files: [
		    {
			expand: true,
			src: ['assets/**/*'],
			dest: 'www/'
		    }
		]
	    },
	    swf: {
		files: [
		    {
			expand: true,
			src: ['*'],
			dest: 'www/assets/swf',
			cwd: 'components/soundmanager/swf'
		    }
		]
	    },
	    html: {
		files: [
		    {
			expand: true,
			flatten: true,
			src: 'tmp/index.html',
			dest: 'www/'
		    }
		]
	    },
	    js: {
		files: [
		    {
			expand: true,
			flatten: true,
			src: ['tmp/app.js', 'tmp/vendor.js'],
			dest: 'www/'
		    }
		]
	    },
	    css: {
		files: [
		    {
			expand: true,
			flatten: true,
			src: 'tmp/app.css',
			dest: 'www/'
		    }
		]
	    }
	},

	/********************* UTILITIES *********************/
	jshint: {
	    options: {
		curly: false,
		undef: true,
		unused: true,
		bitwise: true,
		freeze: true,
		smarttabs: true,
		immed: true,
		latedef: true,
		newcap: true,
		noempty: true,
		nonew: true,
		trailing: true,
		forin: true,
		eqeqeq: true,
		eqnull: true,
		force: true,
		quotmark: 'single',
		expr: true
	    },
	    main: [
		'src/**/*.js'
	    ]
	},
	watch: {
	    index: {
		files: 'src/views/**/*.jade',
		tasks: ['clean:index', 'jade', 'inline_angular_templates', 'copy:html', 'staticinline', 'inline']
	    },
	    css: {
		files: 'src/css/*.styl',
		tasks: ['clean:css', 'stylus', 'cssmin', 'copy:css', 'copy:html', 'staticinline', 'inline']
	    },
	    js: {
		files: ['src/**/*.js'],
		tasks: ['clean:js', 'concat:vendor', 'concat:js', 'concat:development', 'copy:js', 'copy:html', 'staticinline', 'inline']
	    }
	},
	connect: {
	    server: {
		options: {
		    keepalive: true,
		    debug: true,
		    port: 9001,
		    base: 'www',
		    open: {
			target: 'http://localhost:9001',
			appName: 'Google Chrome'
		    },
		    middleware: function (connect, options) {
			var middlewares = [];

			middlewares.push(modRewrite([
			    '!\\.ico|\\.jpg|\\.css|\\.js|\\.png|\\woff|\\ttf|\\swf$ /index.html'
			]));

			if (!Array.isArray(options.base)) {
			    options.base = [options.base];
			}

			var directory = options.directory || options.base[options.base.length - 1];
			options.base.forEach(function (base) {
			    middlewares.push(connect.static(base));
			});

			middlewares.push(connect.directory(directory));

			return middlewares;
		    }
		}
	    }
	},

	plato: {
	    default: {
		options: {
		    jshint: false
		},
		files: {
		    'test/report': ['src/**/*.js']
		}
	    }
	}
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-stylus');
    grunt.loadNpmTasks('grunt-contrib-jade');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-inline-angular-templates');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-inline');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-static-inline');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-plato');

    grunt.registerTask('production', [
	'clean',
	
	'stylus',
	'cssmin',
	
	'concat:vendor',
	'concat:js',
	'concat:production',
	'uglify',
	
	'jade',
	'inline_angular_templates',
	
	'copy',

	'staticinline',
	'inline',

	'htmlmin'

    ]);

    grunt.registerTask('default', [
	'clean',

	'stylus',
	'cssmin',
	
	'concat:vendor',
	'concat:js',
	'concat:development',

	'jade',
	'inline_angular_templates',

	'copy',

	'staticinline',
	'inline',

	'htmlmin'

    ]);
};
