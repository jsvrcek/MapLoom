(function() {
  var module = angular.module('loom_distance_bearing_directive', []);

  module.directive('loomDistanceBearing',
      function(mapService, distanceBearingService) {
        return {
          replace: true,
          templateUrl: 'distancebearing/partials/distanceBearing.tpl.html',
          link: function(scope, element) {
            var control = new ol.control.Control({element: element[0]});
            var props = ['deg', 'min', 'sec'];

            function toDD(degrees, minutes, seconds) {
              //If the first part is negative, make sure minutes and seconds are as well
              if (degrees < 0) {
                minutes = minutes < 0 ? minutes : -1 * minutes;
                seconds = seconds < 0 ? seconds : -1 * seconds;
              }
              return (seconds / 3600) + (minutes / 60) + degrees;
            }

            function toDMS(decimalDegree) {
              var degrees = Math.trunc(decimalDegree);
              var minutes = Math.trunc((decimalDegree - degrees) * 60);
              var seconds = (decimalDegree - degrees - (minutes / 60)) * 60 * 60;

              seconds = +seconds.toPrecision(4);

              //Show minutes and seconds as positive in the UI, even if they're negative
              //toDD checks if degree is negative to convert
              return {
                deg: degrees,
                min: Math.abs(minutes),
                sec: Math.abs(seconds)
              };
            }

            scope.distanceConversionObject = {
              'm' : 1,
              'km' : 1 / 1000,
              'nm' : 1 / 1852,
              'mi' : 1 / 1609.34
            };

            scope.bearingConversionObject = {
              'rad' : Math.PI / 180,
              '°' : 1
            };

            mapService.map.addControl(control);
            scope.display = false;

            scope.model = {
              departure: {
                name: '',
                fullName: undefined,
                lat: undefined,
                lon: undefined,
                dms: {
                  lat: {
                    deg: undefined,
                    min: undefined,
                    sec: undefined
                  },
                  lon: {
                    deg: undefined,
                    min: undefined,
                    sec: undefined
                  }
                }
              },
              destination: {
                name: '',
                fullName: undefined,
                lat: undefined,
                lon: undefined,
                dms: {
                  lat: {
                    deg: undefined,
                    min: undefined,
                    sec: undefined
                  },
                  lon: {
                    deg: undefined,
                    min: undefined,
                    sec: undefined
                  }
                }
              },
              distanceUnitsMultiplier: scope.distanceConversionObject.nm,
              bearingUnitsMultiplier: scope.bearingConversionObject['°'],
              distance: 0,
              bearing: 0,
              displayOnMap: false,
              dmsInput: true
            };

            scope.showOnMap = function() {
              if (!scope.model.displayOnMap) {
                distanceBearingService.clearLine();
              } else {
                distanceBearingService.showLine(scope.model.departure, scope.model.destination);
              }
            };

            scope.toggleVisibility = function() {
              scope.display = !scope.display;
            };

            scope.retrieveCoordinates = function(loc) {
              var i;

              distanceBearingService.search(scope.model[loc].name).then(function(resp) {
                if (resp.error) {
                  scope.model[loc].lat = undefined;
                  scope.model[loc].lon = undefined;
                  scope.model[loc].fullName = resp.error;
                  for (i = 0; i < props.length; ++i) {
                    scope.model[loc].dms.lat[props[i]] = undefined;
                    scope.model[loc].dms.lon[props[i]] = undefined;
                  }
                } else {
                  scope.model[loc].lat = resp.coordinates.lat;
                  scope.model[loc].lon = resp.coordinates.lon;
                  var dmsLat = toDMS(resp.coordinates.lat);
                  var dmsLon = toDMS(resp.coordinates.lon);
                  for (i = 0; i < props.length; ++i) {
                    scope.model[loc].dms.lat[props[i]] = dmsLat[props[i]];
                    scope.model[loc].dms.lon[props[i]] = dmsLon[props[i]];
                  }
                  scope.model[loc].fullName = resp.address;
                }
              });
            };


            //Fired whenever the user changes the dms, this then updates the lat lon dd values
            scope.dmsChanged = function(loc) {
              var model = scope.model[loc];
              model.lat = toDD(model.dms.lat.deg, model.dms.lat.min, model.dms.lat.sec);
              model.lon = toDD(model.dms.lon.deg, model.dms.lon.min, model.dms.lon.sec);
              model.fullName = undefined;
              model.name = undefined;
            };

            //Fired whenever the user changes the dd, this then updates the dms values
            scope.ddChanged = function(loc) {
              var model = scope.model[loc];
              var dmsLat = toDMS(model.lat);
              var dmsLon = toDMS(model.lon);
              for (var i = 0; i < props.length; ++i) {
                model.dms.lat[props[i]] = dmsLat[props[i]];
                model.dms.lon[props[i]] = dmsLon[props[i]];
              }
              model.fullName = undefined;
              model.name = undefined;
            };

            scope.calculate = function() {
              scope.model.distance = distanceBearingService.getDistance(scope.model.departure,
                  scope.model.destination);
              scope.model.bearing = distanceBearingService.getBearing(scope.model.departure,
                  scope.model.destination);
              scope.showOnMap();
            };
          }
        };
      });
})();
