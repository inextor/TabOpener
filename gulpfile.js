
var gulp			= require('gulp');
var sass 			= require('gulp-sass');
var autoprefixer	= require('gulp-autoprefixer');
var minifyCss		= require('gulp-minify-css');
var rename			= require('gulp-rename');
var del				= require('del');
var htmlmin			= require('gulp-htmlmin');
var concat 			= require('gulp-concat');
var mergeStream		= require('merge-stream');
var closureCompiler = require('google-closure-compiler').gulp();


gulp.task('default', ['html' ,'css' ,'scripts' ,'images' ,'watch','manifest','node_modules']);

gulp.task('watch',()=>
{
	console.log('Default');
  	gulp.watch( [ './css/*.scss' ] ,['css'] );
  	gulp.watch ( ['./js/*.js' ] ,['scripts']);
	gulp.watch ( [ 'manifest.json' ], ['manifest'] );
	gulp.watch(['./html/*.html','./index.html'],['html']);
	gulp.watch(['./html/*.html','./index.html'],['html']);
	gulp.watch(['./node_modules/extension-framework/*.js','./node_modules/promiseutil/*.js'],['node_modules']);
});


gulp.task('node_modules',()=>
{
	let extension = gulp.src(['./node_modules/extension-framework/*.js'])
		.pipe(gulp.dest('./dist/js/extension-framework/') );

	let utils = gulp.src(['./node_modules/promiseutil/*.js'])
		.pipe(gulp.dest('./dist/js/Promise-Utils/') );

	return mergeStream( extension, utils );
});


gulp.task('framework',()=>
{
	return gulp.src(['./node_modules/extension-framework/*.js','./node_modules/promiseutil/*.js'])
	.pipe(gulp.dest('./dist/js/extension-framework/') );
});


gulp.task('manifest',()=>
{
	return gulp.src(['./manifest.json'])
	.pipe(gulp.dest('./dist/') );
});

gulp.task('html',()=>
{
	return gulp.src(['./popup.html'])
 		.pipe(htmlmin({
			collapseWhitespace	: true
			,removeComments		: true
		}))
		.pipe(gulp.dest('./dist/'));
});

gulp.task('images',()=>
{
	return gulp.src(['images/*.png','*.png'])
	.pipe( gulp.dest('dist/images/') );
});

gulp.task('css', function () {


	let sassStream = gulp
    	.src('./css/*.scss')
    	.pipe(sass())
		.pipe(concat('sass-files.css'));

	let cssStream = gulp.src('./css/*.css')
		.pipe(concat('css-files.css'));

	return mergeStream( cssStream, sassStream )
		.pipe( concat('styles.css' ) )
    	.pipe( autoprefixer() )
		.pipe( minifyCss() )
    	.pipe(rename({suffix: '.min'}))
		.pipe( gulp.dest('./dist/css/') );

});



gulp.task('scripts', function()
{
	let dependencies =
	[
		'./node_modules/extension-framework/*.js'
		,'./js/*.js'
	];

  	return gulp.src( dependencies )
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
});

