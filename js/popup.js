var globalToken		= null;

document.addEventListener('DOMContentLoaded', function()
{
	var currentSelector = localStorage.getItem('selector');

	if( currentSelector !== null )
		Util.getById('inputSelector').value  = currentSelector;

	var ext = new Client();

	chrome.windows.getCurrent((w)=>
	{
		ext.sendCustomRequest('RegisterWindow', { window_id : w.id	});
	});


	Util.getById('urlSubmit').addEventListener('click',(evt)=>
	{
		Util.stopEvent( evt );

		var links = Util.getById('urlInput').value.split('\n');

		for(var i=links.length-1;i>=0;i--)
		{
			if( links[i].trim() === '')
			{
				links.splice(i,1);
			}
		}

		if( links.length > 0 )
		{
			ext.sendCustomRequest('OpenLinks',{links: links});
		}
	});

	let anchorSections	= Array.from( Util.getAll('[data-open-section]') );
	anchorSections.forEach((anchor)=>
	{
		anchor.addEventListener('click',(evt)=>
		{
			let sections = Array.from(Util.getAll('[data-section]'));
			sections.forEach((section)=>
			{
				section.classList.add('hidden');
			});

			let openSection = Util.getFirst('[data-section="'+anchor.getAttribute('data-open-section')+'"]');
			openSection.classList.remove('hidden');
		});
	});

	Util.getById('openSelector').addEventListener('click',(evt)=>
	{

		Util.stopEvent( evt );
		ext.sendCustomRequestToClient('OpenSelectors',{ selector: Util.getById('inputSelector').value })
		.then((response)=>
		{
			console.log('Send succesfully');
		})
		.catch((e)=>{ console.error( e );});

		localStorage.setItem('selector', Util.getById('inputSelector').value  );

	});
});
