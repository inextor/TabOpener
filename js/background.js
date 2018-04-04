var ext			= new ExtensionFrameworkServer();

var toOpenLinks	= [];
var intervalId	= -1;
var window_id	= -1;
var maxTabs		= -1;
var toCloseTabs	= {};

ext.addCustomRequestListener('register_window',(urlRequest,request)=>
{
	console.log('Registering window');
	window_id		= request.window_id;
});

ext.addCustomRequestListener('open_links',(urlRequest,request)=>
{
	console.log('Open links',request);
	//window_id		= request.window_id;
	request.links.forEach((link)=>
	{
		toOpenLinks.push( link );
	});

	if( intervalId === -1 )
		intervalId = setInterval( openNewTabs, 1000 );

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
		if( maxTabs !== -1 && tabs.length >= maxTabs )
			return;

		var url = toOpenLinks.shift();
		if( url === undefined ) 
			return;

		var index = tabs.length > 0 ? tabs.length-1 : 0;

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
