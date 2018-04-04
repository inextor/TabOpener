var ext =  new ExtensionFrameworkClient();

ext.addCustomFunction('openSelectors',(request)=>
{
	if( request !== undefined && typeof request.selector !== "undefined" && request.selector.trim() !== "" )
	{
		try
		{

			let hrefs = [];
			let a = Array.from( document.querySelectorAll( request.selector ) );

			a.forEach((i)=>
			{
				let x = i.getAttribute('href');

				if( x.indexOf('http') === 0 )
				{
					hrefs.push( x );
				}
				else if( x.indexOf('/') === 0 )
				{
					hrefs.push( location.protocol+'//'+location.hostname+x );
				}
				else
				{
					let lastChar = location.pathname.charAt( location.pathname.length-1 );
					console.log( location.pathname );
					if( lastChar === '/' )
					{
						hrefs.push( location.protocol+'//'+location.hostname+x );
					}
					else
					{
						let lastSlash 	= location.pathname.lastIndexOf('/');
						let pathString	= location.pathname.substring(0,lastSlash);
						hrefs.push( location.protocol+'//'+location.hostname+pathString+'/'+x );
					}
				}
			});

			hrefs.filter((i)=>
			{
				if( i.trim() !== '' )
					return true;
				return false;
			});


			console.log('A has ', hrefs );
			ext.sendCustomRequest
			(
				'open_links'
				,{ links : hrefs }
			)
			.then(()=>
			{
				console.log('Send Successfully');
			})
			.catch((f)=>{ console.log(f );});
			//ext.sendCustomRequest('open_links',{links: hrefs, window_id: null, maxTabs: 10, cleanBuffer: true });
		}
		catch(fuuu)
		{
			//Maybe send an invalid selector warning to popup
			//console.log("Exception catched", fuuu );
			//
		}
	}
	console.log( 'Open link by Selector',request );
	return Promise.resolve(1);
});
