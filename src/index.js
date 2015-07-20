import fetch from 'fetch';

fetch('http://www.omdbapi.com/?t=up&y=&plot=short&r=json')
  .then(function(res) {
    console.log('FIRST PROMISE', typeof res.json === 'function');
    return res.json();
  }).then(function(json) {
    let viewport = document.getElementById('viewport');
    viewport.innerHTML = json.Title;
    console.log('RES PROMISE RESOLVED', json);
  })
  .catch((err) => {
    console.error('ERROR', err);
  });

