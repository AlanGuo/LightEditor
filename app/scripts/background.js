chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('window.html', {
  	'id':'mainWindow',
    'bounds': {
      'width': 900,
      'height': 600
    }
  });
});