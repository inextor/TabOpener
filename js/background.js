var ext			= new Server();

var toOpenLinks	= [];
var intervalId	= -1;
var window_id	= -1;
var toCloseTabs	= {};

var settings	=
{
	max_tabs	: 5 
	,cloase_after	: 0
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
		}
	}
	catch(e)
	{
		console.log( e );
	}
}

ext.addListener('SaveSettings',(urlRequest, request)=>
{
	if( request )
	{
		if( typeof request.max_tabs !== "undefined" && !isNaN( request.max_tabs ) )
		{
			settings.max_tabs = request.max_tabs;
		}

		if( typeof request.close_after !== "undefined" && !isNaN( request.close_after ) )
		{
			settings.close_after = request.close_after;
		}
	}

});

ext.addListener('RegisterWindow',(urlRequest,request)=>
{
	console.log('Registering window');
	window_id		= request.window_id;
});

ext.addListener('OpenLinks',(urlRequest,request)=>
{
	console.log('Open links',request);
	//window_id		= request.window_id;
	
	request.links.forEach((link)=>
	{
		toOpenLinks.push( link );
	});

	if( intervalId === -1 )
		intervalId = setInterval( openNewTabs, 1000 );

	//settings.max_tabs	= 5;
	//console.log('Close the tab id but not yet because we are debugingd');
});

function openNewTabs()
{
	if( toOpenLinks.length === 0 )
	{
		clearInterval( intervalId );
		intervalId = -1;
		return;
	}

	chrome.tabs.query({ windowId: window_id },(tabs)=>
	{
		if( settings.max_tabs > 0 && tabs.length >= settings.max_tabs )
			return;

		var url = toOpenLinks.shift();
		if( url === undefined || url.trim() === "" )
			return;

		var index = 0;//tabs.length > 0 ? tabs.length-1 : 0;

		chrome.tabs.create({ url: url , windowId : window_id, active: false, index: index },(tab)=>
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
