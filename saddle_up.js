
var saddle_up = angular.module("saddle_up", []);

function main_ctl_fn($scope, $http, $q){

  $scope.raml_doc = {};
  $scope.raml_url = [];
  $scope.baseUriParams = {};
  $scope.baseUrl = "";

  $scope.log = function(){
    console.log($scope.raml_url);
  }

  function logResponse(response){
    console.log(response);
  }


  function updateBaseUri(parameters){
    var baseUri = $scope.raml_doc.baseUri;
    var regexp_template = "{key}";
    var regexp_base;

    angular.forEach(parameters, function(value, key){
      if (value.hasOwnProperty("value") && value.value){
        regexp_base = regexp_template.replace("key", key)
        baseUri = baseUri.replace(new RegExp(regexp_base), value.value);
      }
    });
    $scope.baseUrl = baseUri;
  }

  function getSegmentOptions(segment){
    if (! segment.hasOwnProperty("options")){
      segment.options = [];

      if (segment.hasOwnProperty("resources")){
        angular.forEach(segment.resources, function(resource){
          segment.options.push({
            "option": resource,
            "name": resource.relativeUri,
            "type": "Partial"
            });
        });
      }

      if (segment.hasOwnProperty("methods")){
        angular.forEach(segment.methods, function(method){
          segment.options.push({
            "option": method,
            "name": method.method,
            "type": "Method"
            });
        });
      }
    }
    
    return segment.options;
  }
  $scope.getSegmentOptions = getSegmentOptions;

  function ramlUrlUpdate(newRamlUrl, oldRamlUrl){
    var oldRamlPartial = null;
    angular.forEach(newRamlUrl, function(newRamlPartial, index){
      oldRamlPartial = oldRamlUrl[index];
      if (! angular.equals(newRamlPartial, oldRamlPartial) &&
          angular.isDefined(oldRamlPartial)){
        $scope.raml_url = newRamlUrl.slice(0, index + 1);
        return;
      }
    });
  }

  function processRAML(raml){
    $scope.raml_doc = raml;
    $scope.baseUri = raml.baseUri
    $scope.baseUriParams = raml.baseUriParameters;
    $scope.$watch("baseUriParams", updateBaseUri, true);
    $scope.raml_url[0] = $scope.raml_doc;
    $scope.$watch("raml_url", ramlUrlUpdate, true);
  }

  $q.when(RAML.Parser.loadFile('test.raml')).then( function(data) {
    console.log(data);
    processRAML(data);
  }, function(error) {
    console.log('Error parsing: ' + error);
  });

};

main_ctl_fn.$inject = ["$scope", "$http", "$q"];
saddle_up.controller("main", main_ctl_fn);
