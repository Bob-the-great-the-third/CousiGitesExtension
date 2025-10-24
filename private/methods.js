window.PRIVATE_METHODS = window.PRIVATE_METHODS || {};

// Here are the default locations that will be loaded if none are set in the extension
window.PRIVATE_METHODS.default_locations = function (){
  return [
      {
        location:"Exemple: Paris",
        x:48.866730638543125,
        y:2.3370746448543853
      },
      {
        location:"Exemple: Lyon",
        x:45.7723685667064, 
        y:4.998676201427725
      }
    ]
}
