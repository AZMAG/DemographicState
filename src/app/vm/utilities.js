function wrapText(value) {
  var wrapLength = 12;
  var returnLabel = "";
  var lineLength = 0;

  if (value.length >= wrapLength) {
    var wordsList = value.split(" ");
    $.each(wordsList, function(index, word) {
      var separator = " ";
      if (lineLength >= wrapLength) {
        separator = "\n";
        lineLength = 0;
      }
      returnLabel += separator + word;
      lineLength += word.length;
    });
  } else {
    returnLabel = value;
  }
  return returnLabel;
}