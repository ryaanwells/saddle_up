
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


  function updateFullUrl(){
    $scope.fullUrl = $scope.raml_doc.baseUri;
    var partial_string = "";

    angular.forEach($scope.baseUriParameters, function(value, key){
      if (value.hasOwnProperty("value") && value.value){
        $scope.fullUrl = formatStringPartial($scope.fullUrl, key, value.value);
      }
    });

    angular.forEach($scope.raml_url.slice(1), function(partial){
      if (partial.type == "Method") { return; }

      partial_string = partial.relativeUri;
      if (partial.hasOwnProperty("uriParameters")){
        angular.forEach(partial.uriParameters, function(value, key){
          if (value.hasOwnProperty("value") && value.value){
            partial_string = formatStringPartial(partial_string, key, value.value);
          }
        });
      }
      $scope.fullUrl = $scope.fullUrl + partial_string;
    });
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

  function extendAndInitialize(dest, src){
    angular.forEach(src, function(value, key){
      if (value.enum && !value.value){
        value.value = value.enum[0];
      }
      this[key] = value
    }, dest);
  }

  function updateParameterSelection(){
    var queryElement = $scope.raml_url[$scope.raml_url.length - 1];
    if (queryElement.hasOwnProperty("queryParameters")){
      extendAndInitialize($scope.queryParameters, queryElement.queryParameters);
    }

    angular.forEach($scope.raml_url, function(partial, index){
      if (partial.hasOwnProperty("baseUriParameters")){
        extendAndInitialize($scope.baseUriParameters, partial.baseUriParameters);
      }
      if (partial.hasOwnProperty("uriParameters")){
        extendAndInitialize($scope.uriParameters, partial.uriParameters);
      }
    });

  }

  function ramlUrlUpdate(newRamlUrl, oldRamlUrl, event){
    var oldRamlPartial = null;
    var currentElement = {};
    var new_name = "";
    var old_name = "";

    $scope.baseUriParameters = {};
    $scope.uriParameters = {};
    $scope.queryParameters = {};

    angular.forEach(newRamlUrl.slice(1), function(newRamlPartial, index){
      oldRamlPartial = oldRamlUrl[index + 1] || {};
      new_name = newRamlPartial.relativeUri || newRamlPartial.method;
      old_name = oldRamlPartial.relativeUri || newRamlPartial.method;
      if (new_name !== old_name){
        $scope.raml_url = newRamlUrl.slice(0, index + 2);
      }
    });

    updateParameterSelection();
    updateFullUrl();
  }

  function validateType(parameter){
    var typeMappings = {
      "string": angular.isString,
      "number": angular.isNumber,
      "integer": function(value){
        // polyfil from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger
        return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
       },
      "date": angular.isDate,
      "boolean": function(value){ return typeof value === "boolean"}
    };
    return typeMappings[parameter.type](parameter.value);
  }

  function validateRequest(){
    var isValid = true;
    var paramGroups = [$scope.baseUriParameters,
                       $scope.uriParameters,
                       $scope.queryParameters];

    if ($scope.raml_url.length === 0 ||
        $scope.raml_url[$scope.raml_url.length - 1].type !== "Method"){
      isValid = false;
    }

    angular.forEach(paramGroups, function(paramGroup){
      angular.forEach(paramGroup, function(parameter, key){
        if ( parameter.required &&
             !( parameter.value || parameter.default) &&
             !validateType(parameter)){
          isValid = false;
        }
      });
    });
    return isValid;
  }
  $scope.validateRequest = validateRequest;

  function projectParameters(parameterObject){
    var projectedParameters = {};
    angular.forEach(parameterObject, function(value, key){
      this[key] = value.value;
    }, projectedParameters);
    return projectedParameters;
  }

  function makeRequest(){
    if (validateRequest()){
      var request = {};
      request["url"] = $scope.fullUrl;
      request["method"] = $scope.raml_url[$scope.raml_url.length - 1].method;
      request["data"] = projectParameters($scope.queryParameters);
      console.log(request);
      $http(request).then(logResponse, logResponse);
    }
  }
  $scope.makeRequest = makeRequest;

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
