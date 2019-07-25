var gulp			= require('gulp');
var del				= require('del');
var concat 			= require('gulp-concat');


function watch_task(cb)
{
	console.log( 'watch');
	gulp.watch([ './css/*.scss'
		, './js/*.js'
		, 'manifest.json'
		, './html/*.html'
		,'./index.html'
		,'./node_modules/extension-framework/*.js'
		,'./node_modules/promiseutil/*.js' ], gulp.series( css_task, script_task, manifest_task, html_task, node_modules_task ) );
	cb();
}

function ef_task(cb)
{
	console.log( 'ef');
	gulp.src(['./node_modules/extension-framework/*.js'])
		.pipe(gulp.dest('./dist/js/ExtensionFramework/') );

	cb();
}
function pu_task(cb)
{
	console.log( 'pu');
	gulp.src(['./node_modules/promiseutil/*.js'])
		.pipe(gulp.dest('./dist/js/PromiseUtils/') );
	cb();
}
function diabetes_task(cb)
{
	console.log( 'diabetes');
	gulp.src(['./node_modules/diabetes/Utils.js'])
		.pipe(gulp.dest('./dist/js/Diabetes/') );

	cb();
}

function node_modules_task(cb)
{
	gulp.parallel( ef_task, pu_task, diabetes_task );
	cb();
}

function manifest_task(cb)
{
	console.log('Manifest');
	gulp.src(['./manifest.json','./icon.png'])
	.pipe(gulp.dest('./dist/') );
	cb();
}

function html_task(cb)
{
	console.log('html_task');
	gulp.src(['./popup.html'])
		.pipe(gulp.dest('./dist/'));
	cb();
}

function images_task(cb)
{
	console.log( 'images_task' );
	gulp.src(['images/*.png','*.png'])
	.pipe( gulp.dest('dist/images/') );
	cb();
}

function css_task (cb) {

	console.log('css_task');
	gulp
    	.src('./css/*.css')
		.pipe( gulp.dest('./dist/css/') );
	cb();
}


function script_task(cb)
{
	console.log( 'script_task' );
	let dependencies = [ './js/*.js' ];

  	gulp.src( dependencies )
		//.pipe(closureCompiler
		//({
        //  compilation_level: 'ADVANCED_OPTIMIZATIONS'//'SIMPLE'
        //  //compilation_level: 'SIMPLE'
        //  ,warning_level: 'VERBOSE'
        //  ,language_in: 'ECMASCRIPT6_STRICT'
        //  ,language_out: 'ECMASCRIPT5_STRICT'
//      //    ,output_wrapper: '(function(){\n%output%\n}).call(this)'
        //  ,js_output_file: 'all.min.js'
        //}))
		//.pipe(concat('app.min.js') )
    	.pipe(gulp.dest('./dist/js/'));
	cb();
}

gulp.task('script_task',script_task);
gulp.task('css_task',css_task );
gulp.task('html_task',html_task );
gulp.task('images_task', images_task);
gulp.task('manifest_task', manifest_task );
gulp.task('node_modules_task',node_modules_task );
gulp.task('watch_task',watch_task );

exports.default = function(cb)
{
	console.log("Before");

	return gulp.series( watch_task, html_task, css_task ,script_task ,images_task,manifest_task,node_modules_task);
	//return gulp.parallel( 'html_task', 'css_task' ,'script_task' ,'images_task','manifest_task','node_modules_task');
};
