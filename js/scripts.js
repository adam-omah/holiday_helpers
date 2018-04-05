

function showRecomendations(results) {
  var photo = results[0].photos[0].getUrl({ 'maxWidth': 350, 'maxHeight': 350 });
  console.log(photo);
  var photo2 = results[1].photos[0].getUrl({ 'maxWidth': 350, 'maxHeight': 350 });
  console.log(photo2);
  document.getElementById("recommendation0").src = photo;
  document.getElementById("recommendation1").src = photo2;
}
