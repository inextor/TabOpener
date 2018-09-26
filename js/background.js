var ext			= new Server();

var toOpenLinks					= [];
var intervalId					= -1;
var window_id					= -1;
var toCloseTabs					= {};
var windows						= {};
var secondsToCloseNewOpenTabs	= 0;

var settings	=
{
	max_tabs	: 2
	,cloase_after	: 0
	,request_focus	: 0
};


var s =	localStorage.getItem('settings');

if( s )
{
	try
	{
		let obj = JSON.parse( s );

		if( obj )
		{
			if( typeof obj.max_tabs !== "undefined" && !isNaN( obj.max_tabs ) )
			{
				settings.max_tabs = obj.max_tabs;
			}

			if( typeof obj.close_after !== "undefined" && !isNaN( obj.close_after ) )
			{
				settings.close_after = obj.close_after;
			}

			settings.request_focus = 'request_focus' in obj && obj.request_focus ? true : false;
		}
	}
	catch(e)
	{
		console.error( e );
	}
}

ext.addListener('SaveSettings',(urlRequest, request)=>
{
	if( request )
	{
		if(request.max_tabs && typeof request.max_tabs !== "undefined" && !isNaN( request.max_tabs ) )
		{
			settings.max_tabs = request.max_tabs;
		}

		if(request.close_after && typeof request.close_after !== "undefined" && !isNaN( request.close_after ) )
		{
			settings.close_after = request.close_after;
		}
		else
		{
			settings.close_after = 0;
		}

		settings.request_focus = 'request_focus' in request && request.request_focus ? true : false;

		localStorage.setItem('settings', JSON.stringify( settings ) );
	}
});

ext.addListener('ClearQueue',(urlRequest, request )=>
{
	toOpenLinks.splice(0,toOpenLinks.length );
});

ext.addListener('RegisterWindow',(urlRequest,request)=>
{
	//console.log('Registering window');
	window_id		= request.window_id;
});

ext.addListener('OpenLinks',(urlRequest,request)=>
{
	//console.log('Open links',request);
	//window_id		= request.window_id;

	if( !(request.window_id in  windows) )
	{
		windows[ request.window_id ] = {
			'links': []
			,'window_id': request.window_id
			,'max_tabs': settings.max_tabs
		};
	}

	request.links.forEach((link)=>
	{
		windows[ request.window_id ].links.push( link );
	});

	if( intervalId === -1 )
		intervalId = setInterval( openNewTabs, 750 );

	//settings.max_tabs	= 5;
	//console.log('Close the tab id but not yet because we are debugingd');
});

function openNewTabs()
{

	let total = 0;

	for(let  i in windows )
	{
		total += windows[i].links.length;
	}

	if( total === 0 )
	{
		clearInterval( intervalId );
		intervalId = -1;
		chrome.browserAction.setBadgeText({text: ""});
		return;
	}

	let ot= {};
	for( let i in windows )
	{
		ot[ windows[ i ].window_id ] =  getOpenTabs( windows[ i ].window_id );
	}

	total = 0;

	PromiseUtils.all( ot ).then(( open_tabs )=>
	{
		try{
		for( let window_id in open_tabs  )
		{
			if( !( window_id in windows) )
				continue;

			total += windows[ window_id ].links.length;

			if( windows[ window_id ].max_tabs > open_tabs[ window_id ] )
			{
				let index	= open_tabs[ window_id ] < 2 ? 1 : open_tabs[ window_id ] -1;
				let url 	= windows[ window_id ].links.shift();

				if( url === undefined )
					continue;

				let w_id = parseInt( window_id );

				chrome.tabs.create({ url: url , windowId : w_id, active: settings.request_focus , index: index },(tab)=>
				{
					if( secondsToCloseNewOpenTabs > 0 )
					{
						ext.addPageLoadListener(url, false,()=>
						{
							setTimeout(()=>{ chrome.tabs.remove( tab.id,()=>{ }); },secondsToCloseNewOpenTabs*1000 );
						});
					}
				});
			}
		}
		}catch(e){

			console.log( e );
		}

		if( total < 10000 )
		{
			chrome.browserAction.setBadgeText({text: ''+total });
		}
		else
		{
			chrome.browserAction.setBadgeText({text: "10k+"});
		}
	});
}

function getOpenTabs( window_id )
{
	return new Promise((resolve, reject)=>
	{
		chrome.tabs.query({ windowId: window_id },(tabs)=>
		{
			resolve( tabs.length );
		});
	});
}

