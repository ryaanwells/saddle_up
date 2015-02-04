
var saddle_up = angular.module("saddle_up", []);

function main_ctl_fn($scope, $http, $q){

  $scope.raml_doc = {};
  $scope.raml_url = [];
  $scope.baseUriParameters = {};
  $scope.uriParameters = {};
  $scope.queryParameters = {};
  $scope.baseUrl = "";
  $scope.fullUrl = "";

  $scope.log = function(){
    console.log($scope.raml_url);
  }

  function logResponse(response){
    console.log(response);
  }

  function formatStringPartial(input_string, key, value){
    var regexp_base = "{" + key + "}";
    return input_string.replace(new RegExp(regexp_base), value);
  }

  function updateBaseUri(parameters){
    var baseUri = $scope.raml_doc.baseUri;
    var regexp_template = "{key}";
    var regexp_base;

    angular.forEach(parameters, function(value, key){
      if (value.hasOwnProperty("value") && value.value){
        baseUri = formatStringPartial(baseUri, key, value.value);
      }
    });
    $scope.baseUrl = baseUri;
  }

  function getSegmentOptions(segment){
    if (! segment.hasOwnProperty("options")){
      segment.options = [];

      if (segment.hasOwnProperty("resources")){
        angular.forEach(segment.resources, function(resource){
          resource.type = "Partial";
          segment.options.push({
            "option": resource,
            "name": resource.relativeUri
            });
        });
      }

      if (segment.hasOwnProperty("methods")){
        angular.forEach(segment.methods, function(method){
          method.type = "Method";
          segment.options.push({
            "option": method,
            "name": method.method.toUpperCase()
            });
        });
      }
    }

    return segment.options;
  }
  $scope.getSegmentOptions = getSegmentOptions;

  function ramlUrlUpdate(newRamlUrl, oldRamlUrl){
    var oldRamlPartial = null;
    var queryElement = {};
    var currentElement = {};

    $scope.baseUriParameters = {};
    $scope.uriParameters = {};
    $scope.queryParameters = {};

    angular.forEach(newRamlUrl.slice(1), function(newRamlPartial, index){
      oldRamlPartial = oldRamlUrl[index + 1];
      if (! angular.equals(newRamlPartial, oldRamlPartial)
          && angular.isDefined(oldRamlPartial)){
        $scope.raml_url = newRamlUrl.slice(0, index + 2);
        return;
      }
    });

    queryElement = $scope.raml_url[$scope.raml_url.length - 1];
    if (queryElement.hasOwnProperty("queryParameters")){
      $scope.queryParameters = queryElement.queryParameters;
    }

    angular.forEach($scope.raml_url, function(partial, index){
      if (partial.hasOwnProperty("baseUriParameters")){
        angular.extend($scope.baseUriParameters, partial.baseUriParameters);
      }
      if (partial.hasOwnProperty("uriParameters")){
        angular.extend($scope.uriParameters, partial.uriParameters);
      }
    });
  }

  function processRAML(raml){
    $scope.raml_doc = raml;
    $scope.baseUri = raml.baseUri
    $scope.baseUriParameters = raml.baseUriParameters;
    $scope.$watch("baseUriParameters", updateBaseUri, true);
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
