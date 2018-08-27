var ext			= new Server();

var toOpenLinks					= [];
var intervalId					= -1;
var window_id					= -1;
var toCloseTabs					= {};
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

	request.links.forEach((link)=>
	{
		toOpenLinks.push( link );
	});

	if( intervalId === -1 )
		intervalId = setInterval( openNewTabs, 200 );

	//settings.max_tabs	= 5;
	//console.log('Close the tab id but not yet because we are debugingd');
});

function openNewTabs()
{
	if( toOpenLinks.length === 0 )
	{
		clearInterval( intervalId );
		intervalId = -1;
		chrome.browserAction.setBadgeText({text: ""});
		return;
	}

	if( toOpenLinks.length < 999 )
	{
		chrome.browserAction.setBadgeText({text: ''+toOpenLinks.length });
	}
	else if( toOpenLinks.length > 999 && toOpenLinks.length<10000)
	{
		let n = (toOpenLinks.length/1000);
		let s = n.toFixed( 1 )+"k";
		chrome.browserAction.setBadgeText({text: s});
	}
	else
	{
		chrome.browserAction.setBadgeText({text: "10k+"});
	}


	chrome.tabs.query({ windowId: window_id },(tabs)=>
	{
		if( settings.max_tabs > 0 && tabs.length >= settings.max_tabs )
			return;

		var url = toOpenLinks.shift();
		if( url === undefined || url.trim() === "" )
			return;

		var index = tabs.length > 0 ? tabs.length-1 : 0;

		chrome.tabs.create({ url: url , windowId : window_id, active: settings.request_focus , index: index },(tab)=>
		{
			if( secondsToCloseNewOpenTabs > 0 )
			{
				ext.addPageLoadListener(url, false,()=>
				{
					setTimeout(()=>{ chrome.tabs.remove( tab.id,()=>{ }); },secondsToCloseNewOpenTabs*1000 );
				});
			}
		});
	});
}
